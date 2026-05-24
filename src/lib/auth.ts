import { useCallback, useEffect, useState } from "react";

const TOKEN_KEY = "pab_token";
const USER_KEY = "pab_user";
const AUTH_EVENT = "pab-auth-change";

export interface AdminUser {
  id: number;
  email: string;
  role: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AdminUser): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

// Client-side auth state. `ready` is false until localStorage has been read
// (avoids redirecting before we know whether a token exists).
export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setTokenState(getToken());
      setUserState(getStoredUser());
      setReady(true);
    };
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const logout = useCallback(() => clearAuth(), []);

  return { token, user, ready, isAuthenticated: Boolean(token), logout };
}
