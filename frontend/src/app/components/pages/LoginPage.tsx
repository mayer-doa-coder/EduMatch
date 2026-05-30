import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { ArrowLeft, Lock, Mail, Loader2, ArrowLeftCircle } from "lucide-react";
import { Role } from "../edu-data";
import { AuthBrandPanel } from "../auth/AuthBrandPanel";
import { RoleBadges } from "../auth/RoleBadges";
import { toast } from "sonner";

type Props = {
  onSwitch: () => void;
  onAuthed: (role: Role) => void;
  onBack:   () => void;
};

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    user_id:    number;
    profile_id: number | null;
    name:       string;
    email:      string;
    role:       Role;
  };
}

// Which "screen" is visible inside this page
type Screen = "login" | "forgot" | "forgot-sent";

export function LoginPage({ onSwitch, onAuthed, onBack }: Props) {
  const [screen,       setScreen]       = useState<Screen>("login");

  // Login form state
  const [role,         setRole]         = useState<Role>("student");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [remember,     setRemember]     = useState(true);
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot-password form state
  const [forgotEmail,  setForgotEmail]  = useState("");
  const [forgotErr,    setForgotErr]    = useState("");
  const [isSending,    setIsSending]    = useState(false);

  // ── Login submit ────────────────────────────────────────────────────────────
  async function submitLogin(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};

    if (!email.trim())    e.email    = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password)        e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost/EduMatch/backend/login.php",
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, role }),
        }
      );

      const result: LoginResponse = await response.json();

      if (response.ok && result.success && result.user) {
        toast.success(result.message || "Welcome back!");

        // Persist session — localStorage keeps it across tabs; sessionStorage is tab-scoped
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("auth_user", JSON.stringify(result.user));

        // Navigate using the server-returned role (prevents supervisor/faculty mismatch)
        onAuthed(result.user.role);
      } else {
        toast.error(result.message || "Invalid credentials.");
        setErrors({ server: result.message || "Check your credentials and selected role." });
      }
    } catch (err) {
      console.error("Login network error:", err);
      toast.error("Unable to connect to the login service.");
      setErrors({ server: "Network unavailable. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Forgot password submit ──────────────────────────────────────────────────
  async function submitForgot(ev: React.FormEvent) {
    ev.preventDefault();
    if (!forgotEmail.trim() || !/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      setForgotErr("Enter a valid email address.");
      return;
    }
    setForgotErr("");
    setIsSending(true);

    // Simulate network delay — replace with a real endpoint when email is configured
    await new Promise(res => setTimeout(res, 900));
    setIsSending(false);
    setScreen("forgot-sent");
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen grid md:grid-cols-2"
      style={{ background: "var(--edu-bg)" }}
    >
      <AuthBrandPanel onBack={onBack} />

      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md p-8 rounded-3xl edu-card-shadow bg-white">

          {/* ── Forgot-password sent confirmation ─────────────────────────── */}
          {screen === "forgot-sent" && (
            <div className="text-center space-y-4 py-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(26,95,122,0.1)" }}
              >
                <Mail size={26} style={{ color: "var(--edu-primary)" }} />
              </div>
              <h2
                style={{ color: "var(--edu-primary)", fontWeight: 700, fontSize: "1.4rem" }}
              >
                Check your inbox
              </h2>
              <p className="text-sm" style={{ color: "var(--edu-light)" }}>
                If <strong>{forgotEmail}</strong> is registered, a password reset
                link has been sent. Check your spam folder if it doesn't arrive
                within a few minutes.
              </p>
              <button
                onClick={() => { setScreen("login"); setForgotEmail(""); }}
                className="flex items-center gap-2 mx-auto text-sm font-medium"
                style={{ color: "var(--edu-primary)" }}
              >
                <ArrowLeftCircle size={16} /> Back to login
              </button>
            </div>
          )}

          {/* ── Forgot-password email form ─────────────────────────────────── */}
          {screen === "forgot" && (
            <>
              <button
                type="button"
                onClick={() => { setScreen("login"); setForgotErr(""); }}
                className="flex items-center gap-2 mb-5 text-sm"
                style={{ color: "var(--edu-primary)" }}
              >
                <ArrowLeft size={16} /> Back to login
              </button>

              <h2
                style={{ color: "var(--edu-primary)", fontWeight: 700, fontSize: "1.5rem" }}
              >
                Reset your password
              </h2>
              <p className="text-sm mt-1 mb-6" style={{ color: "var(--edu-light)" }}>
                Enter the email linked to your account and we'll send a reset link.
              </p>

              <form onSubmit={submitForgot} className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email">Email address</Label>
                  <div className="relative mt-1">
                    <Mail
                      className="absolute left-3 top-3"
                      size={16}
                      style={{ color: "var(--edu-light)" }}
                    />
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={e => { setForgotEmail(e.target.value); setForgotErr(""); }}
                      className="pl-9"
                      placeholder="you@university.edu"
                      disabled={isSending}
                    />
                  </div>
                  {forgotErr && (
                    <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>
                      {forgotErr}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full h-11 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: "var(--edu-primary)" }}
                >
                  {isSending && <Loader2 size={16} className="animate-spin" />}
                  {isSending ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}

          {/* ── Main login form ────────────────────────────────────────────── */}
          {screen === "login" && (
            <>
              <button
                type="button"
                onClick={onBack}
                className="md:hidden flex items-center gap-2 mb-4 text-sm"
                style={{ color: "var(--edu-primary)" }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <h2
                style={{ color: "var(--edu-primary)", fontWeight: 700, fontSize: "1.6rem" }}
              >
                Log in to EduMatch
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--edu-light)" }}>
                Welcome back — pick your role.
              </p>

              <RoleBadges role={role} onChange={r => { setRole(r); setErrors({}); }} />

              {errors.server && (
                <div
                  className="mt-4 p-3 text-xs rounded-xl text-center font-medium"
                  style={{ background: "rgba(239,68,68,0.1)", color: "var(--edu-danger)" }}
                >
                  {errors.server}
                </div>
              )}

              <form className="mt-5 space-y-4" onSubmit={submitLogin}>
                {/* Email */}
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative mt-1">
                    <Mail
                      className="absolute left-3 top-3"
                      size={16}
                      style={{ color: "var(--edu-light)" }}
                    />
                    <Input
                      id="login-email"
                      type="email"
                      disabled={isSubmitting}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-9"
                      placeholder="you@university.edu"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative mt-1">
                    <Lock
                      className="absolute left-3 top-3"
                      size={16}
                      style={{ color: "var(--edu-light)" }}
                    />
                    <Input
                      id="login-password"
                      type="password"
                      disabled={isSubmitting}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between">
                  <label
                    className="flex items-center gap-2 text-sm select-none cursor-pointer"
                    style={{ color: "var(--edu-light)" }}
                  >
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={v => setRemember(!!v)}
                      disabled={isSubmitting}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => { setScreen("forgot"); setForgotEmail(email); }}
                    className="text-sm hover:underline"
                    style={{ color: "var(--edu-primary)" }}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: "var(--edu-primary)" }}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? "Verifying…" : "Log in"}
                </Button>
              </form>

              <div
                className="mt-5 text-center text-sm"
                style={{ color: "var(--edu-light)" }}
              >
                New here?{" "}
                <button
                  type="button"
                  onClick={onSwitch}
                  disabled={isSubmitting}
                  style={{ color: "var(--edu-primary)", fontWeight: 600 }}
                  className="hover:underline"
                >
                  Create account
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
