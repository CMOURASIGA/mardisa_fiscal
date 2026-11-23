import { redirect } from "@tanstack/react-router";

export function requireAuth() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    throw redirect({ to: "/auth/login" });
  }

  return user;
}

export function requireAdmin() {
  const user = requireAuth();

  // Nome canônico vem do backend (`resolve_role`): grupos 'admin' e 'admin-local'.
  if (!["admin", "admin-local"].includes(user.role)) {
    throw redirect({ to: "/private/home" });
  }

  return user;
}
