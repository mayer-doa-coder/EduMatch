import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Bell } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";

const API = "http://localhost/EduMatch/backend";

interface Notification {
  type:   string;
  title:  string;
  detail: string | null;
  time:   string;
}

const TYPE_COLOR: Record<string, string> = {
  message:     "#1a5f7a",
  internship:  "#57c5b6",
  interview:   "#ff9f29",
  applicant:   "#28a745",
  risk:        "#dc3545",
  application: "#6f42c1",
};

type Props = { userId: number };

export function NotificationsView({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("all");

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user") ?? "{}");
    const role = authUser.role as string | undefined;
    if (!userId || !role) { setLoading(false); return; }

    fetch(`${API}/notifications.php?user_id=${userId}&role=${role}`)
      .then(r => r.json())
      .then(d => { if (d.success) setNotifications(d.notifications ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const types   = ["all", ...Array.from(new Set(notifications.map(n => n.type)))];
  const visible = filter === "all" ? notifications : notifications.filter(n => n.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        Loading notifications…
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Notifications" />

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {types.map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            style={filter === f ? { background: "var(--edu-primary)" } : {}}
            className="capitalize text-sm"
          >
            {f}
          </Button>
        ))}
      </div>

      <Card className="rounded-2xl bg-white edu-card-shadow border-0 divide-y">
        {visible.map((n, i) => {
          const color = TYPE_COLOR[n.type] ?? "var(--edu-primary)";
          return (
            <div key={i} className="p-4 flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <Bell size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm" style={{ color: "var(--edu-dark)" }}>
                  {n.title}
                </div>
                {n.detail && (
                  <div className="text-xs mt-0.5 truncate" style={{ color: "var(--edu-light)" }}>
                    {n.detail}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge
                  className="capitalize text-xs"
                  style={{ background: `${color}18`, color }}
                >
                  {n.type}
                </Badge>
                <span className="text-xs" style={{ color: "var(--edu-light)" }}>
                  {typeof n.time === "string" ? n.time.slice(0, 10) : n.time}
                </span>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="p-10 text-center" style={{ color: "var(--edu-light)" }}>
            No notifications yet.
          </div>
        )}
      </Card>
    </div>
  );
}
