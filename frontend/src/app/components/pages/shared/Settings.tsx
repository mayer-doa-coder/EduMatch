import { useMemo } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

type Props = { userId: number };

export function SettingsView({ userId: _userId }: Props) {
  const authUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "{}"); } catch { return {}; }
  }, []);

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Settings" />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-4 mt-4">
            <div><Label>Name</Label><Input defaultValue={authUser.name ?? ""} className="mt-1" /></div>
            <div><Label>Email</Label><Input defaultValue={authUser.email ?? ""} className="mt-1" /></div>
            <div><Label>Role</Label><Input readOnly value={authUser.role ?? ""} className="mt-1 bg-gray-50 capitalize" /></div>
            <Button style={{ background: "var(--edu-primary)" }} onClick={() => toast.success("Profile saved")}>Save</Button>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-4 mt-4">
            <div><Label>Current Password</Label><Input type="password" className="mt-1" /></div>
            <div><Label>New Password</Label><Input type="password" className="mt-1" /></div>
            <Button style={{ background: "var(--edu-primary)" }} onClick={() => toast.success("Password updated")}>Update</Button>
          </Card>
        </TabsContent>
        <TabsContent value="theme">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-4 mt-4">
            <div className="flex items-center justify-between"><div><div style={{ fontWeight: 600 }}>Compact mode</div><div className="text-sm" style={{ color: "var(--edu-light)" }}>Reduce spacing and font sizes.</div></div><Switch /></div>
            <div className="flex items-center justify-between"><div><div style={{ fontWeight: 600 }}>High contrast</div><div className="text-sm" style={{ color: "var(--edu-light)" }}>Boost contrast for accessibility.</div></div><Switch /></div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
