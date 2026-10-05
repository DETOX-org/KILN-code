'use client';

/**
 * AuthContext — Centralised authentication state for KILN / DETOX Code.
 *
 * Security principles:
 *  - Role is ALWAYS sourced from the server (JWT issued by backend, validated on /api/auth/me).
 *  - The client can never modify its own role — setRole is intentionally absent.
 *  - On every app startup the stored JWT is validated against the backend; stale / expired
 *    tokens are removed and the user is treated as unauthenticated.
 *  - The JWT is stored in localStorage (acceptable given the Next.js / Express architecture
 *    where httpOnly cookies would require a same-origin server — use NEXT_PUBLIC_BACKEND_URL).
 *    Passwords are NEVER stored anywhere on the client.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

/* ── Storage keys ──────────────────────────────────────────────── */
const TOKEN_KEY = 'kiln_auth_token';

/* ── Context shape ─────────────────────────────────────────────── */
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  role: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

/* ── Helper: fetch authenticated user from backend ─────────────── */
async function fetchMe(token) {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    // Don't throw on non-2xx — handle below
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.success ? json.data.user : null;
}

/* ── Provider ──────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track if we've already run the startup validation so we don't double-fire
  const initialised = useRef(false);

  /* ── Startup: validate any stored JWT against /api/auth/me ── */
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const storedToken = (() => {
      try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
    })();

    if (!storedToken) {
      setLoading(false);
      return;
    }

    fetchMe(storedToken)
      .then((freshUser) => {
        if (freshUser) {
          setToken(storedToken);
          setUser(freshUser);
        } else {
          // Token is expired / invalid — clear it
          try { localStorage.removeItem(TOKEN_KEY); } catch {}
        }
      })
      .catch(() => {
        // Network error — still clear token to be safe and
        // let the user log in again when connectivity returns
        try { localStorage.removeItem(TOKEN_KEY); } catch {}
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── login — called by the login page after a successful POST /api/auth/login ── */
  const login = useCallback(async (newToken, serverUser) => {
    // serverUser is the object returned by the backend — role is NOT client-chosen
    try { localStorage.setItem(TOKEN_KEY, newToken); } catch {}
    setToken(newToken);
    setUser(serverUser);
  }, []);

  /* ── logout ─────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
    setToken(null);
    setUser(null);
  }, []);

  const role = user?.role ?? null;
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, role, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
