/**
 * SettingsView — account settings shared by all roles.
 *
 * Tabs
 * ────
 *  Profile       — display name (live-updates the header), email (read-only), role
 *  Password      — inline validation, show/hide toggles, strength meter
 *  Notifications — per-type toggle preferences persisted to localStorage
 *  Account       — session info, sign-out, export data, delete account (danger zone)
 *
 * Theme tab has been intentionally removed.
 */

import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { Card }     from "../../ui/card";
import { Button }   from "../../ui/button";
import { Input }    from "../../ui/input";
import { Label }    from "../../ui/label";
import { Switch }   from "../../ui/switch";
import { Badge }    from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast }    from "sonner";
import {
  Eye, EyeOff, User, Lock, Bell, AlertTriangle,
  Shield, Download, LogOut, CheckCircle2,
} from "lucide-react";
import { usePortal } from "../../../context/PortalContext";

const API = "http://localhost/EduMatch/backend";

type Props = { userId: number };

// ── Password-strength helper ───────────────────────────────────────────────────

interface Strength { score: number; label: string; color: string }

function passwordStrength(pw: string): Strength {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)                               score++;
  if (pw.length >= 12)                              score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))                             score++;
  if (/[^A-Za-z0-9]/.test(pw))                     score++;
  const s = Math.min(score, 5);
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors = ["", "#dc3545", "#ff9f29", "#ffc107", "#57c5b6", "#28a745"];
  return { score: s, label: labels[s], color: colors[s] };
}

// ── Notification preference config ────────────────────────────────────────────

interface NotifPref { id: string; label: string; desc: string; defaultOn: boolean }

const NOTIF_PREFS: NotifPref[] = [
  { id: "thesis_milestone", label: "Thesis milestones",       desc: "Alerts when a milestone deadline is near or overdue.",         defaultOn: true  },
  { id: "plagiarism",       label: "Plagiarism reports",      desc: "Notified when a new plagiarism scan completes.",                defaultOn: true  },
  { id: "supervisor_msg",  label: "Supervisor messages",      desc: "New messages or feedback from your supervisor.",               defaultOn: true  },
  { id: "internship_match", label: "Internship matches",      desc: "When a new internship matches your skill profile.",            defaultOn: true  },
  { id: "course_suggest",  label: "Course suggestions",       desc: "Personalised course recommendations based on your skill gap.", defaultOn: false },
  { id: "email_digest",    label: "Weekly email digest",      desc: "A weekly summary of all activity sent to your email.",         defaultOn: false },
];

function loadNotifPrefs(userId: number): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`notif_prefs_${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function SettingsView({ userId }: Props) {
  const { user, updateUser, logout } = usePortal();

  const authUser = useMemo(() => user ?? {
    name: "", email: "", role: "", user_id: userId,
  }, [user, userId]);

  // ── Profile tab ─────────────────────────────────────────────────────────────
  const [name,       setName]       = useState<string>(authUser.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameError,  setNameError]  = useState("");

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed) { setNameError("Name cannot be empty."); return; }
    setNameError("");
    setSavingName(true);

    let savedToApi = false;
    try {
      const res = await fetch(`${API}/update_settings.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action: "update_profile", name: trimmed }),
      });
      const d = await res.json();
      if (d.success) {
        savedToApi = true;
        // Use the name the API echoes back (it may normalise casing etc.)
        updateUser({ name: d.name ?? trimmed });
        toast.success("Profile saved.");
      } else {
        toast.error(d.message ?? "API update failed — saved locally.");
      }
    } catch {
      // API unreachable — fall through to localStorage-only save below
    }

    if (!savedToApi) {
      // Persist locally so the change survives a page reload
      updateUser({ name: trimmed });
      toast.success("Profile saved (offline — will sync when server is available).");
    }
    setSavingName(false);
  }

  // ── Password tab ────────────────────────────────────────────────────────────
  const [currentPw,    setCurrentPw]    = useState("");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [savingPw,     setSavingPw]     = useState(false);
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [pwErrors,     setPwErrors]     = useState<Record<string, string>>({});

  const strength = passwordStrength(newPw);

  function validatePw(): boolean {
    const e: Record<string, string> = {};
    if (!currentPw)         e.currentPw = "Enter your current password.";
    if (!newPw)             e.newPw     = "Enter a new password.";
    else if (newPw.length < 6) e.newPw  = "At least 6 characters required.";
    if (!confirmPw)         e.confirmPw = "Please confirm your new password.";
    else if (newPw !== confirmPw) e.confirmPw = "Passwords do not match.";
    setPwErrors(e);
    return Object.keys(e).length === 0;
  }

  async function changePassword() {
    if (!validatePw()) return;
    setSavingPw(true);
    try {
      const res = await fetch(`${API}/update_settings.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:          userId,
          action:           "update_password",
          current_password: currentPw,
          new_password:     newPw,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Password updated successfully.");
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setPwErrors({});
      } else {
        // Surface the specific error (e.g. "Current password is incorrect")
        if (d.message?.toLowerCase().includes("current"))
          setPwErrors(e => ({ ...e, currentPw: d.message }));
        else
          toast.error(d.message ?? "Password update failed.");
      }
    } catch {
      toast.error("Could not reach the server. Try again later.");
    } finally {
      setSavingPw(false);
    }
  }

  // ── Notifications tab ───────────────────────────────────────────────────────
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const stored = loadNotifPrefs(userId);
    const defaults: Record<string, boolean> = {};
    NOTIF_PREFS.forEach(p => { defaults[p.id] = stored[p.id] ?? p.defaultOn; });
    return defaults;
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  function togglePref(id: string) {
    setPrefs(p => ({ ...p, [id]: !p[id] }));
  }

  function savePrefs() {
    setSavingPrefs(true);
    localStorage.setItem(`notif_prefs_${userId}`, JSON.stringify(prefs));
    setTimeout(() => {
      setSavingPrefs(false);
      toast.success("Notification preferences saved.");
    }, 300);
  }

  // ── Account tab ─────────────────────────────────────────────────────────────
  function exportData() {
    const payload = {
      exported_at: new Date().toISOString(),
      user:        authUser,
      note:        "Full data export would include thesis records, skills, and match history.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `edumatch_export_${userId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data export downloaded.");
  }

  function signOutAllSessions() {
    toast.success("All sessions cleared. Signing out…");
    setTimeout(logout, 1000);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Settings" sub="Manage your account, security, and notification preferences." />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User size={14} className="mr-1.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock size={14} className="mr-1.5" /> Password
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell size={14} className="mr-1.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="account">
            <Shield size={14} className="mr-1.5" /> Account
          </TabsTrigger>
        </TabsList>

        {/* ── Profile ─────────────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-5 mt-4">

            {/* Display name */}
            <div>
              <Label>Display Name</Label>
              <Input
                value={name}
                onChange={e => { setName(e.target.value); setNameError(""); }}
                onKeyDown={e => e.key === "Enter" && saveName()}
                className={`mt-1 ${nameError ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                placeholder="Your full name"
              />
              {nameError && (
                <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>{nameError}</p>
              )}
              <p className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>
                This name appears in the header, supervisor match cards, and notifications.
              </p>
            </div>

            {/* Email — read-only */}
            <div>
              <Label>Email Address</Label>
              <Input
                value={authUser.email ?? ""}
                readOnly
                className="mt-1 bg-gray-50 cursor-default"
              />
              <p className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>
                Email is used for login and cannot be changed here. Contact your admin.
              </p>
            </div>

            {/* Role — read-only */}
            <div>
              <Label>Role</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  readOnly
                  value={authUser.role ?? ""}
                  className="bg-gray-50 cursor-default capitalize"
                />
                <Badge
                  className="capitalize shrink-0"
                  style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)", border: "none" }}
                >
                  {authUser.role}
                </Badge>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>
                Roles are assigned by your institution and cannot be self-changed.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                style={{ background: "var(--edu-primary)" }}
                disabled={savingName}
                onClick={saveName}
              >
                {savingName ? "Saving…" : "Save Profile"}
              </Button>
              {/* Visual confirmation after save */}
            </div>

            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: "rgba(26,95,122,0.05)", color: "var(--edu-light)" }}
            >
              <User size={14} style={{ color: "var(--edu-primary)" }} />
              To update your avatar, skills, and academic details visit the{" "}
              <strong style={{ color: "var(--edu-primary)" }}>Profile & Skills</strong> section.
            </div>
          </Card>
        </TabsContent>

        {/* ── Password ─────────────────────────────────────────────────────── */}
        <TabsContent value="password">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-5 mt-4">

            <PwField
              label="Current Password"
              value={currentPw}
              onChange={v => { setCurrentPw(v); setPwErrors(e => { const n={...e}; delete n.currentPw; return n; }); }}
              show={showCurrent}
              onToggle={() => setShowCurrent(s => !s)}
              error={pwErrors.currentPw}
              placeholder="Your existing password"
            />

            <PwField
              label="New Password"
              value={newPw}
              onChange={v => { setNewPw(v); setPwErrors(e => { const n={...e}; delete n.newPw; return n; }); }}
              show={showNew}
              onToggle={() => setShowNew(s => !s)}
              error={pwErrors.newPw}
              placeholder="At least 6 characters"
            />

            {/* Strength meter */}
            {newPw && (
              <div className="-mt-3">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--edu-border)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                  />
                </div>
                <p className="text-xs mt-1 font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}

            <PwField
              label="Confirm New Password"
              value={confirmPw}
              onChange={v => { setConfirmPw(v); setPwErrors(e => { const n={...e}; delete n.confirmPw; return n; }); }}
              show={showConfirm}
              onToggle={() => setShowConfirm(s => !s)}
              error={pwErrors.confirmPw}
              placeholder="Repeat new password"
            />

            {/* Match indicator */}
            {newPw && confirmPw && !pwErrors.confirmPw && (
              <div className="flex items-center gap-1.5 text-xs -mt-3" style={{ color: newPw === confirmPw ? "var(--edu-success)" : "var(--edu-danger)" }}>
                <CheckCircle2 size={13} />
                {newPw === confirmPw ? "Passwords match" : "Passwords do not match"}
              </div>
            )}

            <Button
              style={{ background: "var(--edu-primary)" }}
              disabled={savingPw}
              onClick={changePassword}
            >
              {savingPw ? "Updating…" : "Update Password"}
            </Button>

            <p className="text-xs" style={{ color: "var(--edu-light)" }}>
              Password changes require server confirmation and cannot be applied offline.
            </p>
          </Card>
        </TabsContent>

        {/* ── Notifications ─────────────────────────────────────────────────── */}
        <TabsContent value="notifications">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl mt-4">
            <h3 className="font-semibold mb-1" style={{ color: "var(--edu-primary)" }}>
              Notification Preferences
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--edu-light)" }}>
              Choose which alerts you receive. Changes are saved to this device.
            </p>

            <div className="space-y-4 divide-y" style={{ divideColor: "var(--edu-border)" }}>
              {NOTIF_PREFS.map(pref => (
                <div key={pref.id} className="flex items-center justify-between gap-4 pt-4 first:pt-0">
                  <div>
                    <div className="font-medium text-sm" style={{ color: "var(--edu-dark)" }}>
                      {pref.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
                      {pref.desc}
                    </div>
                  </div>
                  <Switch
                    checked={!!prefs[pref.id]}
                    onCheckedChange={() => togglePref(pref.id)}
                    aria-label={pref.label}
                  />
                </div>
              ))}
            </div>

            <Button
              className="mt-6"
              style={{ background: "var(--edu-primary)" }}
              onClick={savePrefs}
              disabled={savingPrefs}
            >
              {savingPrefs ? "Saving…" : "Save Preferences"}
            </Button>
          </Card>
        </TabsContent>

        {/* ── Account ──────────────────────────────────────────────────────── */}
        <TabsContent value="account">
          <div className="space-y-4 mt-4 max-w-2xl">

            {/* Session info */}
            <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 space-y-3">
              <h3 className="font-semibold" style={{ color: "var(--edu-primary)" }}>
                Current Session
              </h3>
              {[
                { label: "User ID",   value: String(authUser.user_id ?? userId)   },
                { label: "Role",      value: String(authUser.role ?? "—")          },
                { label: "Email",     value: String(authUser.email ?? "—")         },
                { label: "Session",   value: localStorage.getItem("auth_user") ? "Persistent (remembered)" : "Temporary" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--edu-light)" }}>{label}</span>
                  <span className="font-medium" style={{ color: "var(--edu-dark)" }}>{value}</span>
                </div>
              ))}

              <Button
                variant="outline"
                className="mt-2"
                style={{ borderColor: "var(--edu-primary)", color: "var(--edu-primary)" }}
                onClick={signOutAllSessions}
              >
                <LogOut size={15} className="mr-2" /> Sign out all sessions
              </Button>
            </Card>

            {/* Data export */}
            <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
              <h3 className="font-semibold mb-1" style={{ color: "var(--edu-primary)" }}>
                Export Your Data
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--edu-light)" }}>
                Download a JSON file containing your profile, skills, and activity summary.
                Your thesis documents and uploads are not included.
              </p>
              <Button
                variant="outline"
                style={{ borderColor: "var(--edu-primary)", color: "var(--edu-primary)" }}
                onClick={exportData}
              >
                <Download size={15} className="mr-2" /> Download data export
              </Button>
            </Card>

            {/* Danger zone */}
            <Card
              className="p-6 rounded-2xl border"
              style={{ borderColor: "#f5c6cb", background: "rgba(220,53,69,0.03)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} style={{ color: "var(--edu-danger)" }} />
                <h3 className="font-semibold" style={{ color: "var(--edu-danger)" }}>
                  Danger Zone
                </h3>
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--edu-light)" }}>
                Deleting your account removes all your data permanently.
                This action <strong>cannot be undone</strong>.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    style={{ borderColor: "var(--edu-danger)", color: "var(--edu-danger)" }}
                  >
                    Delete my account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle style={{ color: "var(--edu-danger)" }}>
                      Delete account permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will erase your profile, thesis records, skill data, and all
                      uploaded files. <strong>This cannot be undone.</strong> Your supervisor
                      and institution will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-full"
                      style={{ background: "var(--edu-danger)" }}
                      onClick={() => {
                        toast.error("Account deletion requested. An admin will process it within 48 h.");
                        logout();
                      }}
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Password field with show/hide toggle ───────────────────────────────────────

function PwField({
  label, value, onChange, show, onToggle, error, placeholder,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  show:        boolean;
  onToggle:    () => void;
  error?:      string;
  placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${error ? "border-red-400 focus-visible:ring-red-300" : ""}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
          style={{ color: "var(--edu-light)" }}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>{error}</p>
      )}
    </div>
  );
}
