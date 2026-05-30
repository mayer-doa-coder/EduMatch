/**
 * PortalContext — single source of truth for authenticated user state.
 *
 * Wrap the portal sub-tree with <PortalProvider>. Any component inside can
 * call usePortal() to get the current user, their role, and the logout action.
 * Navigation itself is left to useNavigate() at the call site so this context
 * stays framework-independent and testable.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import type { Role } from "../components/edu-data";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  user_id:    number;
  profile_id: number | null;
  name:       string;
  email:      string;
  role:       Role;
}

interface PortalContextValue {
  /** Currently logged-in user. Null while loading or after logout. */
  user:       AuthUser | null;
  /** Convenience shortcut — derived from user.role, defaults to "student". */
  role:       Role;
  /** Clear storage and navigate back to /login. */
  logout:     () => void;
  /** Navigate to a portal section by its route key, e.g. "internships". */
  goTo:       (section: string) => void;
  /**
   * Patch the in-memory user object and sync the change back to storage.
   * Triggers a re-render of any component that reads `usePortal().user`,
   * including the header display name.
   */
  updateUser: (partial: Partial<AuthUser>) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const PortalContext = createContext<PortalContextValue | null>(null);

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Reads auth_user from localStorage then sessionStorage. */
export function readStoredUser(): AuthUser | null {
  try {
    const raw =
      localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────────

export function PortalProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_user");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const goTo = useCallback(
    (section: string) => navigate(`/portal/${section}`),
    [navigate],
  );

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      // Write back to whichever storage the session came from
      if (localStorage.getItem("auth_user")) {
        localStorage.setItem("auth_user", JSON.stringify(updated));
      } else {
        sessionStorage.setItem("auth_user", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const role = (user?.role ?? "student") as Role;

  const value = useMemo<PortalContextValue>(
    () => ({ user, role, logout, goTo, updateUser }),
    [user, role, logout, goTo, updateUser],
  );

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be called inside <PortalProvider>");
  return ctx;
}
