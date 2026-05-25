import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { SectionTitle } from "../../shared/SectionTitle";
import { currentStudent } from "../../edu-data";

export function SettingsView() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Settings" />
      <Tabs defaultValue="profile">
        <TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger><TabsTrigger value="theme">Theme</TabsTrigger></TabsList>
        <TabsContent value="profile">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-4 mt-4">
            <div><Label>Name</Label><Input defaultValue={currentStudent.name} className="mt-1" /></div>
            <div><Label>Email</Label><Input defaultValue={currentStudent.email} className="mt-1" /></div>
            <Button style={{ background: "var(--edu-primary)" }}>Save</Button>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-4 mt-4">
            <div><Label>Current Password</Label><Input type="password" className="mt-1" /></div>
            <div><Label>New Password</Label><Input type="password" className="mt-1" /></div>
            <Button style={{ background: "var(--edu-primary)" }}>Update</Button>
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
