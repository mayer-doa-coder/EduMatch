import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Bell } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface Notification { type: string; title: string; time: string; detail: string | null }

type Props = { userId: number };

export function NotificationsView({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
    const profileId = authUser.profile_id;
    const role = authUser.role;
    if (!profileId || role !== "student") { setLoading(false); return; }
    fetch(`${API}/get_student_dashboard.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setNotifications(d.notifications ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading notifications…</div>;

  const list = notifications.filter(n => filter === "all" ? true : filter === "internship" ? n.type === "internship" : n.type === "message");

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Notifications Center" />
      <div className="flex gap-2 flex-wrap">
        {["all", "internship", "message"].map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}
            style={filter === f ? { background: "var(--edu-primary)" } : {}} className="capitalize">{f}</Button>
        ))}
        <Button variant="ghost" className="ml-auto" onClick={() => toast.success("All marked as read")}>Mark all as read</Button>
      </div>
      <Card className="rounded-2xl bg-white edu-card-shadow border-0 divide-y">
        {list.map((n, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full edu-gradient text-white flex items-center justify-center"><Bell size={18} /></div>
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              {n.detail && <div className="text-sm" style={{ color: "var(--edu-light)" }}>{n.detail}</div>}
            </div>
            <Badge style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }} className="capitalize">{n.type}</Badge>
            <span className="text-xs" style={{ color: "var(--edu-light)" }}>{n.time}</span>
          </div>
        ))}
        {list.length === 0 && (
          <div className="p-10 text-center" style={{ color: "var(--edu-light)" }}>No notifications.</div>
        )}
      </Card>
    </div>
  );
}
