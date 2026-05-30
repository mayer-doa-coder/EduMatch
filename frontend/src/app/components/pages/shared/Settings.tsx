import { useMemo, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

type Props = { userId: number };

export function SettingsView({ userId }: Props) {
  const authUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user") ?? "{}"
      );
    } catch { return {}; }
  }, []);

  // Profile tab
  const [name,         setName]         = useState<string>(authUser.name ?? "");
  const [savingName,   setSavingName]   = useState(false);

  // Password tab
  const [currentPw,    setCurrentPw]    = useState("");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [savingPw,     setSavingPw]     = useState(false);

  // ── Save display name ─────────────────────────────────────────────────────
  async function saveName() {
    if (!name.trim()) { toast.error("Name cannot be empty."); return; }
    setSavingName(true);
    try {
      const res = await fetch(`${API}/update_settings.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action: "update_profile", name: name.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        // Sync to storage so the header name updates on next reload
        const stored = JSON.parse(
          localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user") ?? "{}"
        );
        stored.name = d.name;
        localStorage.setItem("auth_user", JSON.stringify(stored));
        toast.success("Profile saved.");
      } else {
        toast.error(d.message ?? "Update failed.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingName(false);
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function changePassword() {
    if (!currentPw || !newPw) { toast.error("Fill in all password fields."); return; }
    if (newPw.length < 6)     { toast.error("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw)  { toast.error("New passwords do not match."); return; }

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
        toast.success("Password updated.");
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      } else {
        toast.error(d.message ?? "Update failed.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Settings" />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        {/* ── Profile ────────────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1"
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                defaultValue={authUser.email ?? ""}
                readOnly
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>
                Email cannot be changed here.
              </p>
            </div>
            <div>
              <Label>Role</Label>
              <Input readOnly value={authUser.role ?? ""} className="mt-1 bg-gray-50 capitalize" />
            </div>
            <Button
              style={{ background: "var(--edu-primary)" }}
              disabled={savingName}
              onClick={saveName}
            >
              {savingName ? "Saving…" : "Save Profile"}
            </Button>
          </Card>
        </TabsContent>

        {/* ── Password ───────────────────────────────────────────────────── */}
        <TabsContent value="password">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-4 mt-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                className="mt-1"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                className="mt-1"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                className="mt-1"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
            <Button
              style={{ background: "var(--edu-primary)" }}
              disabled={savingPw}
              onClick={changePassword}
            >
              {savingPw ? "Updating…" : "Update Password"}
            </Button>
          </Card>
        </TabsContent>

        {/* ── Theme ──────────────────────────────────────────────────────── */}
        <TabsContent value="theme">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontWeight: 600 }}>Compact mode</div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>
                  Reduce spacing and font sizes.
                </div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontWeight: 600 }}>High contrast</div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>
                  Boost contrast for accessibility.
                </div>
              </div>
              <Switch />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
