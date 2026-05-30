import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { ArrowLeft, Lock, Mail, Loader2 } from "lucide-react";
import { Role } from "../edu-data";
import { AuthBrandPanel } from "../auth/AuthBrandPanel";
import { RoleBadges } from "../auth/RoleBadges";
import { toast } from "sonner";

type Props = {
  onSwitch: () => void;
  onAuthed: (role: Role) => void;
  onBack: () => void;
};

// Explicitly maps to the JSON payload returned by your login.php script
interface ApiResponse {
  success: boolean;
  message: string;
  user?: {
    user_id: number;
    profile_id: number | null;
    name: string;
    email: string;
    role: Role;
  };
}

export function LoginPage({ onSwitch, onAuthed, onBack }: Props) {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};

    // Front-end UI validation checks
    if (!email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsSubmitting(true);

    try {
      // Connect to your dynamic login.php endpoint
      const response = await fetch("http://localhost/EduMatch/backend/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: role,
        }),
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success && result.user) {
        toast.success(result.message || "Welcome back!");

        // Store the persistent user session object to be verified by DashboardPage.tsx
        if (remember) {
          localStorage.setItem("auth_user", JSON.stringify(result.user));
        } else {
          // Alternative: Use sessionStorage if the user unchecks "Remember Me"
          sessionStorage.setItem("auth_user", JSON.stringify(result.user));
        }

        // Advance to application secure dashboard space
        onAuthed(role);
      } else {
        // Render error under inputs or via global toast
        toast.error(result.message || "Invalid credentials.");
        setErrors({
          server: result.message || "Check credentials and selected role.",
        });
      }
    } catch (err) {
      console.error("Authentication lifecycle network failure:", err);
      toast.error("Unable to connect to the login service.");
      setErrors({ server: "Network connection loss. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen grid md:grid-cols-2"
      style={{ background: "var(--edu-bg)" }}
    >
      <AuthBrandPanel onBack={onBack} />
      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md p-8 rounded-3xl edu-card-shadow bg-white">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden flex items-center gap-2 mb-4 text-sm"
            style={{ color: "var(--edu-primary)" }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h2
            style={{
              color: "var(--edu-primary)",
              fontWeight: 700,
              fontSize: "1.6rem",
            }}
          >
            Log in to EduMatch
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--edu-light)" }}>
            Welcome back — pick your role.
          </p>

          <RoleBadges role={role} onChange={setRole} />

          {errors.server && (
            <div
              className="mt-4 p-3 text-xs rounded-xl text-center font-medium"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "var(--edu-danger)",
              }}
            >
              {errors.server}
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail
                  className="absolute left-3 top-3"
                  size={16}
                  style={{ color: "var(--edu-light)" }}
                />
                <Input
                  id="email"
                  type="email"
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="you@university.edu"
                />
              </div>
              {errors.email && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--edu-danger)" }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock
                  className="absolute left-3 top-3"
                  size={16}
                  style={{ color: "var(--edu-light)" }}
                />
                <Input
                  id="password"
                  type="password"
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--edu-danger)" }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label
                className="flex items-center gap-2 text-sm select-none cursor-pointer"
                style={{ color: "var(--edu-light)" }}
              >
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                  disabled={isSubmitting}
                />{" "}
                Remember me
              </label>
              <button
                type="button"
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
              {isSubmitting ? "Verifying..." : "Log in"}
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
        </Card>
      </div>
    </div>
  );
}
