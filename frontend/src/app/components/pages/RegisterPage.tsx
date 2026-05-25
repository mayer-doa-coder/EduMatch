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

type Props = {
  onSwitch: () => void;
  onAuthed: (role: Role) => void;
  onBack: () => void;
};

interface ApiResponse {
  success: boolean;
  message: string;
}

export function RegisterPage({ onSwitch, onAuthed, onBack }: Props) {
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("Dhaka University");
  const [department, setDepartment] = useState("Computer Science");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost/dbms/backend/register.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
            role: role,
            university: university,
            department: department,
          }),
        },
      );

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Account created successfully!");
        onAuthed(role);
      } else {
        toast.error(result.message || "Registration failed.");
        setErrors({
          server: result.message || "Registration conflict occurred.",
        });
      }
    } catch (err) {
      console.error("Registration lifecycle network error:", err);
      toast.error("Unable to connect to registration backend service.");
      setErrors({
        server: "Network infrastructure unavailable. Please try later.",
      });
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
            style={{
              color: "var(--edu-primary)",
              fontWeight: 700,
              fontSize: "1.6rem",
            }}
          >
            Create your account
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--edu-light)" }}>
            Join your university in minutes.
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
              <Label htmlFor="name">Full name</Label>
              <div className="relative mt-1">
                <User
                  className="absolute left-3 top-3"
                  size={16}
                  style={{ color: "var(--edu-light)" }}
                />
                <Input
                  id="name"
                  disabled={isSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  placeholder="Farjana Akter"
                />
              </div>
              {errors.name && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--edu-danger)" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

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
                    {["Dhaka University", "BUET", "NSU", "BRAC University"].map(
                      (u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
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
                    {["Computer Science", "EEE", "Business", "Mathematics"].map(
                      (u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2"
              style={{ background: "var(--edu-primary)" }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Creating Account..." : "Create account"}
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
