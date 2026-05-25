import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Bell } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { notifications } from "../../edu-data";
import { toast } from "sonner";

export function NotificationsView() {
  const [filter, setFilter] = useState("all");
  const list = notifications.filter(n => filter === "all" ? true : filter === "unread" ? n.unread : !n.unread);
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Notifications Center" />
      <div className="flex gap-2 flex-wrap">
        {["all", "unread", "read"].map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} style={filter === f ? { background: "var(--edu-primary)" } : {}} className="capitalize">{f}</Button>
        ))}
        <Button variant="ghost" className="ml-auto" onClick={() => toast.success("All marked as read")}>Mark all as read</Button>
      </div>
      <Card className="rounded-2xl bg-white edu-card-shadow border-0 divide-y">
        {list.map(n => (
          <div key={n.id} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full edu-gradient text-white flex items-center justify-center"><Bell size={18} /></div>
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div className="text-sm" style={{ color: "var(--edu-light)" }}>{n.body}</div>
            </div>
            {n.unread && <Badge style={{ background: "var(--edu-accent)", color: "white" }}>New</Badge>}
            <span className="text-xs" style={{ color: "var(--edu-light)" }}>{n.time}</span>
          </div>
        ))}
        {list.length === 0 && <div className="p-10 text-center" style={{ color: "var(--edu-light)" }}>No notifications.</div>}
      </Card>
    </div>
  );
}
