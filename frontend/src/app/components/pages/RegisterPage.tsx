import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ArrowLeft, Lock, Mail, User, Loader2 } from "lucide-react";
import { Role } from "../edu-data";
import { AuthBrandPanel } from "../auth/AuthBrandPanel";
import { RoleBadges } from "../auth/RoleBadges";
import { toast } from "sonner";

// Admin accounts are not self-registerable
const REGISTERABLE_ROLES: readonly Role[] = ["student", "supervisor", "company", "alumni"];

// Roles that require university + department selection
const ACADEMIC_ROLES: Role[] = ["student", "supervisor", "alumni"];

type Props = {
  onSwitch: () => void;
  onAuthed: (role: Role) => void;
  onBack:   () => void;
};

interface RegisterResponse {
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

export function RegisterPage({ onSwitch, onAuthed, onBack }: Props) {
  const [role,         setRole]         = useState<Role>("student");
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [university,   setUniversity]   = useState("Dhaka University");
  const [department,   setDepartment]   = useState("Computer Science");
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsAcademicFields = ACADEMIC_ROLES.includes(role);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};

    if (!name.trim())          e.name     = "Name is required";
    if (!email.trim())         e.email    = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password)             e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";

    if (needsAcademicFields) {
      if (!university) e.university = "University is required";
      if (!department) e.department = "Department is required";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost/EduMatch/backend/register.php",
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:       name.trim(),
            email:      email.trim(),
            password,
            role,
            university: needsAcademicFields ? university : "",
            department: needsAcademicFields ? department : "",
          }),
        }
      );

      const result: RegisterResponse = await response.json();

      if (response.ok && result.success && result.user) {
        // Persist the session so DashboardPage can read it immediately
        localStorage.setItem("auth_user", JSON.stringify(result.user));

        toast.success(result.message || "Account created successfully!");
        // Navigate to the dashboard using the role returned by the server
        onAuthed(result.user.role);
      } else {
        toast.error(result.message || "Registration failed.");
        setErrors({ server: result.message || "Registration conflict." });
      }
    } catch (err) {
      console.error("Registration network error:", err);
      toast.error("Unable to reach the registration service.");
      setErrors({ server: "Network unavailable. Please try again." });
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
            onClick={onBack}
            disabled={isSubmitting}
            className="md:hidden flex items-center gap-2 mb-4 text-sm"
            style={{ color: "var(--edu-primary)" }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h2
            style={{ color: "var(--edu-primary)", fontWeight: 700, fontSize: "1.6rem" }}
          >
            Create your account
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--edu-light)" }}>
            Join your university in minutes.
          </p>

          {/* Role selector — admin excluded */}
          <RoleBadges
            role={role}
            onChange={(r) => { setRole(r); setErrors({}); }}
            allowedRoles={REGISTERABLE_ROLES}
          />

          {errors.server && (
            <div
              className="mt-4 p-3 text-xs rounded-xl text-center font-medium"
              style={{ background: "rgba(239,68,68,0.1)", color: "var(--edu-danger)" }}
            >
              {errors.server}
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={submit}>
            {/* Full name */}
            <div>
              <Label htmlFor="reg-name">Full name</Label>
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-3"
                  size={16}
                  style={{ color: "var(--edu-light)" }}
                />
                <Input
                  id="reg-name"
                  disabled={isSubmitting}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pl-9"
                  placeholder="Farjana Akter"
                />
              </div>
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="reg-email">Email</Label>
              <div className="relative mt-1">
                <Mail
                  className="absolute left-3 top-3"
                  size={16}
                  style={{ color: "var(--edu-light)" }}
                />
                <Input
                  id="reg-email"
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
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative mt-1">
                <Lock
                  className="absolute left-3 top-3"
                  size={16}
                  style={{ color: "var(--edu-light)" }}
                />
                <Input
                  id="reg-password"
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

            {/* University + Department — only for academic roles */}
            {needsAcademicFields && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>University</Label>
                  <Select
                    value={university}
                    onValueChange={setUniversity}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Dhaka University", "BUET", "NSU", "BRAC University"].map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.university && (
                    <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>
                      {errors.university}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Department</Label>
                  <Select
                    value={department}
                    onValueChange={setDepartment}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Computer Science", "EEE", "Business", "Mathematics"].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>
                      {errors.department}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2"
              style={{ background: "var(--edu-primary)" }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Creating Account…" : "Create account"}
            </Button>
          </form>

          <div
            className="mt-5 text-center text-sm"
            style={{ color: "var(--edu-light)" }}
          >
            Already have an account?{" "}
            <button
              onClick={onSwitch}
              disabled={isSubmitting}
              style={{ color: "var(--edu-primary)", fontWeight: 600 }}
            >
              Log in
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
