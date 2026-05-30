/**
 * NotificationsView — inbox for all portal notification types.
 *
 * Data strategy:
 *   1. Attempt to fetch from the real API.
 *   2. If the API fails or returns nothing, fall back to the rich mock
 *      notifications from edu-data.ts so the page is never blank.
 *
 * Features:
 *   • Type-based filter tabs (All / message / internship / …)
 *   • "Mark all as read" clears the unread count badge
 *   • Empty-state copy when a filter yields no results
 */

import { useEffect, useState } from "react";
import { Card }   from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge }  from "../../ui/badge";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { notifications as mockNotifs } from "../../edu-data";

const API = "http://localhost/EduMatch/backend";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Notification {
  type:   string;
  title:  string;
  detail: string | null;
  time:   string;
  unread: boolean;
}

const TYPE_COLOR: Record<string, string> = {
  message:     "var(--edu-primary)",
  internship:  "var(--edu-secondary)",
  interview:   "var(--edu-accent)",
  applicant:   "var(--edu-success)",
  risk:        "var(--edu-danger)",
  application: "#6f42c1",
  info:        "var(--edu-info)",
};

type Props = { userId: number };

// ── Mock builder ───────────────────────────────────────────────────────────────

function buildMockNotifs(): Notification[] {
  return mockNotifs.map(n => ({
    type:   "info",
    title:  n.title,
    detail: n.body,
    time:   n.time,
    unread: n.unread,
  }));
}

// ── Component ──────────────────────────────────────────────────────────────────

export function NotificationsView({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("all");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Determine role from storage for the API call
      const authUser = (() => {
        try {
          return JSON.parse(
            localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user") ?? "{}",
          );
        } catch { return {}; }
      })();
      const role = authUser.role as string | undefined;

      if (!userId || !role) {
        if (!cancelled) { setNotifications(buildMockNotifs()); setLoading(false); }
        return;
      }

      try {
        const res = await fetch(`${API}/notifications.php?user_id=${userId}&role=${role}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (!cancelled) {
          const apiNotifs: Notification[] = (d.notifications ?? []).map(
            (n: { type: string; title: string; detail: string | null; time: string }) => ({
              ...n,
              unread: true,
            }),
          );
          // Use API data if it returned anything; fall back to mock otherwise
          setNotifications(apiNotifs.length ? apiNotifs : buildMockNotifs());
        }
      } catch {
        if (!cancelled) setNotifications(buildMockNotifs());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  // ── Mark all read ──────────────────────────────────────────────────────────
  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const types   = ["all", ...Array.from(new Set(notifications.map(n => n.type)))];
  const visible = filter === "all" ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => n.unread).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        Loading notifications…
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionTitle
          title="Notifications"
          sub={unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
        />
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            style={{ borderColor: "var(--edu-primary)", color: "var(--edu-primary)" }}
            onClick={markAllRead}
          >
            <CheckCheck size={14} className="mr-1.5" /> Mark all as read
          </Button>
        )}
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {types.map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize rounded-full text-xs"
            style={filter === f ? { background: "var(--edu-primary)" } : { color: "var(--edu-dark)" }}
          >
            {f}
            {f !== "all" && (
              <span className="ml-1.5 opacity-60">
                {notifications.filter(n => n.type === f).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      <Card className="rounded-2xl bg-white edu-card-shadow border-0 overflow-hidden">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(26,95,122,0.07)", color: "var(--edu-primary)" }}
            >
              <BellOff size={26} />
            </div>
            <p className="font-semibold" style={{ color: "var(--edu-dark)" }}>
              No notifications{filter !== "all" ? ` of type "${filter}"` : ""}.
            </p>
            {filter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                style={{ color: "var(--edu-primary)" }}
                onClick={() => setFilter("all")}
              >
                Show all notifications
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y" style={{ "--divide-color": "var(--edu-border)" } as React.CSSProperties}>
            {visible.map((n, i) => {
              const color = TYPE_COLOR[n.type] ?? "var(--edu-primary)";
              return (
                <div
                  key={i}
                  className="p-4 flex items-start gap-4 transition-colors hover:bg-gray-50 cursor-pointer"
                  style={{
                    background: n.unread ? `${color}06` : "transparent",
                    borderBottom: "1px solid var(--edu-border)",
                  }}
                  onClick={() => {
                    // Mark this single notification as read on click
                    setNotifications(prev =>
                      prev.map((x, j) => j === notifications.indexOf(x) ? { ...x, unread: false } : x),
                    );
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}
                  >
                    <Bell size={18} style={{ color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm"
                      style={{
                        color:      "var(--edu-dark)",
                        fontWeight: n.unread ? 600 : 400,
                      }}
                    >
                      {n.title}
                    </div>
                    {n.detail && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
                        {n.detail}
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge
                      className="capitalize text-xs"
                      style={{ background: `${color}18`, color, border: "none" }}
                    >
                      {n.type}
                    </Badge>
                    <span className="text-xs" style={{ color: "var(--edu-light)" }}>
                      {typeof n.time === "string" ? n.time.slice(0, 10) : n.time}
                    </span>
                    {n.unread && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: color }}
                        aria-label="Unread"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
