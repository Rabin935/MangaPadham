import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/auth-guard";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
