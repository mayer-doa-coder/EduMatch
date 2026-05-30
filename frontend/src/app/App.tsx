/**
 * App — top-level route tree.
 *
 * Route map:
 *   /              → Landing page (or redirect to dashboard if session exists)
 *   /login         → Login page
 *   /register      → Register page
 *   /portal/:section → Dashboard shell (auth-guarded, role-aware)
 *   /portal          → Redirect → /portal/overview
 *   *              → Redirect → /
 *
 * The HashRouter lives in main.tsx so tests can wrap App with MemoryRouter.
 */

import { type ReactNode } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router";
import { Toaster } from "./components/ui/sonner";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { QueryTerminal } from "./components/debug/QueryTerminal";
import { PortalProvider, readStoredUser } from "./context/PortalContext";
import type { Role } from "./components/edu-data";
import "../styles/index.css";

// ── Auth guard ─────────────────────────────────────────────────────────────────

/** Redirect to /login if there's no valid session in storage. */
function AuthGuard({ children }: { children: ReactNode }) {
  const user = readStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ── Landing wrapper (redirect away if already logged in) ───────────────────────

function LandingRoute() {
  const navigate = useNavigate();
  const user = readStoredUser();
  if (user) return <Navigate to="/portal/overview" replace />;

  return (
    <LandingPage
      onGetStarted={() => navigate("/register")}
      onLogin={() => navigate("/login")}
      onDashboard={(role: Role) => {
        // Called when "Dashboard" button is clicked on the landing navbar
        // (only visible when already logged in, but guard above handles it).
        void role;
        navigate("/portal/overview");
      }}
    />
  );
}

// ── Login / Register wrappers ──────────────────────────────────────────────────

function LoginRoute() {
  const navigate = useNavigate();
  const user = readStoredUser();
  if (user) return <Navigate to="/portal/overview" replace />;

  return (
    <LoginPage
      onSwitch={() => navigate("/register")}
      onBack={() => navigate("/")}
      onAuthed={() => navigate("/portal/overview", { replace: true })}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();
  const user = readStoredUser();
  if (user) return <Navigate to="/portal/overview" replace />;

  return (
    <RegisterPage
      onSwitch={() => navigate("/login")}
      onBack={() => navigate("/")}
      onAuthed={() => navigate("/portal/overview", { replace: true })}
    />
  );
}

// ── Portal wrapper (provides context + auth guard) ─────────────────────────────

function PortalRoute() {
  return (
    <AuthGuard>
      <PortalProvider>
        <DashboardPage />
      </PortalProvider>
    </AuthGuard>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="size-full">
      <Routes>
        {/* Public */}
        <Route index element={<LandingRoute />} />
        <Route path="/login"    element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />

        {/* Protected portal */}
        <Route path="/portal"            element={<Navigate to="/portal/overview" replace />} />
        <Route path="/portal/:section"   element={<PortalRoute />} />
        <Route path="/portal/:section/*" element={<PortalRoute />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" richColors />
      {import.meta.env.DEV && <QueryTerminal />}
    </div>
  );
}
