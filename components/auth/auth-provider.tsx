"use client";

import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { AuthStatus, AuthUser } from "@/types/auth";

type LoginCredentials = {
  email: string;
  password: string;
};

type AuthActionResult = {
  success: boolean;
  message: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthActionResult>;
  logout: (redirectTo?: string) => Promise<void>;
  refreshAuth: () => Promise<AuthUser | null>;
  updateUser: (
    updater: AuthUser | null | ((currentUser: AuthUser | null) => AuthUser | null)
  ) => void;
};

type AuthSuccessPayload = {
  success?: boolean;
  message?: string;
  user?: AuthUser;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readAuthPayload<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const payload = await readAuthPayload<AuthSuccessPayload>(response);

  if (!response.ok || !payload?.user) {
    return null;
  }

  return normalizeAuthUser(payload.user);
}

function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    readChapters: Array.isArray(user.readChapters) ? user.readChapters : [],
    unlockedChapters: Array.isArray(user.unlockedChapters)
      ? user.unlockedChapters
      : [],
    favoriteMangaIds: Array.isArray(user.favoriteMangaIds)
      ? user.favoriteMangaIds
      : [],
    continueReading: user.continueReading ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    async function hydrateAuth() {
      try {
        const currentUser = await fetchCurrentUser();

        if (!active) {
          return;
        }

        if (!currentUser) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        setUser(currentUser);
        setStatus("authenticated");
      } catch {
        if (!active) {
          return;
        }

        setUser(null);
        setStatus("unauthenticated");
      }
    }

    void hydrateAuth();

    return () => {
      active = false;
    };
  }, []);

  async function refreshAuth() {
    try {
      const currentUser = await fetchCurrentUser();

      if (!currentUser) {
        setUser(null);
        setStatus("unauthenticated");
        return null;
      }

      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }

  function updateUser(
    updater: AuthUser | null | ((currentUser: AuthUser | null) => AuthUser | null)
  ) {
    setUser((currentUser) => {
      const nextUser =
        typeof updater === "function" ? updater(currentUser) : updater;

      if (!nextUser) {
        setStatus("unauthenticated");
        return null;
      }

      setStatus("authenticated");
      return normalizeAuthUser(nextUser);
    });
  }

  async function login({ email, password }: LoginCredentials) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const payload = await readAuthPayload<AuthSuccessPayload>(response);

    if (!response.ok || !payload?.user) {
      setUser(null);
      setStatus("unauthenticated");

      return {
        success: false,
        message: payload?.message || "Unable to login. Please try again.",
      };
    }

    setUser(normalizeAuthUser(payload.user));
    setStatus("authenticated");

    return {
      success: true,
      message: payload.message || "Login successful.",
    };
  }

  async function logout(redirectTo = "/login") {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Keep local logout resilient even if the network request fails.
    } finally {
      setUser(null);
      setStatus("unauthenticated");

      startTransition(() => {
        router.push(redirectTo);
      });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        login,
        logout,
        refreshAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
