export type AuthUser = {
  id: string;
  name: string;
  email: string;
  coins: number;
  readChapters: string[];
  unlockedChapters: string[];
  createdAt: string;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
