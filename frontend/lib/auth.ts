import { api } from "./api";
import type { TokenResponse, UserCreate, UserLogin, User } from "@/types";

export async function register(data: UserCreate): Promise<User> {
  return api.post<User>("/api/auth/register", data);
}

export async function login(data: UserLogin): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/api/auth/login", data);
  if (response.access_token) {
    localStorage.setItem("access_token", response.access_token);
  }
  return response;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } finally {
    localStorage.removeItem("access_token");
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
