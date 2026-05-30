/**
 * StudentOverview — the main dashboard page for the student role.
 *
 * Interactive elements:
 *   • "Thesis Health" card   → navigates to /portal/health
 *   • "CGPA" card            → navigates to /portal/profile
 *   • "Milestones Done" card → navigates to /portal/thesis
 *   • "Open Internships" card → navigates to /portal/internships
 *   • "Submit chapter" button → navigates to /portal/thesis
 *   • "View thesis" button   → navigates to /portal/health
 *   • "Thesis Progress" chart → live Recharts LineChart from usePortalData
 *   • "Submission Timeline"  → populated list or EmptyState
 *   • "Available Supervisors" → AvatarList; "See all" → /portal/supervisors
 *   • "Suggested Courses"    → InteractiveList or EmptyState
 *   • "Recent Notifications" → InteractiveList or EmptyState
 *
 * Data: usePortalData() — real API with rich mock fallback.
 */

import { useNavigate } from "react-router";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";
import {
  Activity, Sparkles, ShieldCheck, Briefcase, Upload,
  Bell, BookOpen, CheckCircle2, Clock, FileText, Users2,
} from "lucide-react";
import { Card }    from "../../ui/card";
import { Button }  from "../../ui/button";
import { Badge }   from "../../ui/badge";
import { toast }   from "sonner";

import { usePortalData }    from "../../../hooks/usePortalData";
import { BaseMetricCard }   from "../../shared/BaseMetricCard";
import { AvatarList }       from "../../shared/AvatarList";
import { InteractiveList }  from "../../shared/InteractiveList";
import { SectionTitle }     from "../../shared/SectionTitle";
import type { PortalCourse, PortalNotification, PortalMilestone, PortalSupervisor } from "../../../hooks/usePortalData";

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = { userId: number; profileId: number | null };

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Converts a milestone status to a timeline dot style. */
function milestoneStyle(m: PortalMilestone) {
  if (m.submission_date) return { bg: "var(--edu-success)",  icon: <CheckCircle2 size={12} /> };
  if (m.overdue)         return { bg: "var(--edu-danger)",   icon: null };
  return                        { bg: "var(--edu-border)",   icon: <Clock size={12} style={{ color: "var(--edu-light)" }} /> };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function StudentOverview({ profileId }: Props) {
  const navigate      = useNavigate();
  const { data, loading } = usePortalData(profileId);

  // ── Derived values ───────────────────────────────────────────────────────────
  const student      = data?.student;
  const activeThesis = data?.thesis.find(t => t.status === "active") ?? data?.thesis[0];
  const milestones   = activeThesis?.milestones ?? [];
  const progress     = data?.progress;
  const supervisors  = data?.supervisors ?? [];
  const courses      = data?.courses ?? [];
  const internships  = data?.internships ?? [];
  const notifications = data?.notifications ?? [];
  const chartData    = data?.chartData ?? [];

  // ── Supervisor list items for AvatarList ─────────────────────────────────────
  const supervisorItems = supervisors.map((s: PortalSupervisor) => ({
    id:          s.faculty_id,
    name:        s.supervisor_name,
    sub:         `${s.slots_available} slot${s.slots_available !== 1 ? "s" : ""} available`,
    badgeLabel:  `${s.slots_available}/${s.quota}`,
    badgeColor:  s.slots_available > 0 ? "var(--edu-success)" : "var(--edu-danger)",
    avatarColor: s.avatar_color,
  }));

  return (
    <div className="space-y-6 fade-in-up">

      {/* ── Welcome banner ────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 md:p-8 edu-gradient text-white edu-card-shadow
                   flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="opacity-80 text-sm">Welcome back,</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            {loading ? "Loading…" : `${student?.name ?? "Student"} 👋`}
          </h1>
          <p className="opacity-90 mt-1 text-sm">
            {loading
              ? "Fetching your dashboard…"
              : `${student?.university} · ${progress?.completion_pct ?? 0}% thesis complete · ${supervisors.length} supervisor${supervisors.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            className="rounded-full"
            style={{ background: "var(--edu-accent)" }}
            onClick={() => navigate("/portal/thesis")}
          >
            Submit chapter <Upload size={16} className="ml-2" />
          </Button>
          <Button
            variant="outline"
            className="rounded-full bg-transparent border-white text-white hover:bg-white/10"
            onClick={() => navigate("/portal/health")}
          >
            View thesis
          </Button>
        </div>
      </div>

      {/* ── KPI metric cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <BaseMetricCard
          label="Thesis Health"
          value={loading ? "—" : `${activeThesis?.health_score ?? 0}/100`}
          sub={activeThesis?.status ?? "—"}
          icon={Activity}
          color="var(--edu-success)"
          badge={activeThesis ? (activeThesis.health_score >= 80 ? "Excellent" : activeThesis.health_score >= 60 ? "At risk" : "Critical") : undefined}
          badgeColor={activeThesis ? (activeThesis.health_score >= 80 ? "var(--edu-success)" : activeThesis.health_score >= 60 ? "var(--edu-warning)" : "var(--edu-danger)") : undefined}
          loading={loading}
          onClick={() => navigate("/portal/health")}
          hint="Click to view detailed thesis health report"
        />

        <BaseMetricCard
          label="CGPA"
          value={loading ? "—" : (student?.cgpa?.toFixed(2) ?? "—")}
          sub={student?.research_interest?.split(",")[0] ?? "Research"}
          icon={Sparkles}
          color="var(--edu-primary)"
          loading={loading}
          onClick={() => navigate("/portal/profile")}
          hint="Click to view and edit your academic profile"
        />

        <BaseMetricCard
          label="Milestones Done"
          value={loading ? "—" : `${progress?.done_count ?? 0}/${progress?.total_milestones ?? 0}`}
          sub={
            progress
              ? progress.overdue_count > 0
                ? `${progress.overdue_count} overdue`
                : "On track"
              : "—"
          }
          icon={ShieldCheck}
          color="var(--edu-info)"
          trend={progress ? (progress.overdue_count > 0 ? "down" : "up") : undefined}
          loading={loading}
          onClick={() => navigate("/portal/thesis")}
          hint="Click to manage thesis submission milestones"
        />

        <BaseMetricCard
          label="Open Internships"
          value={loading ? "—" : String(internships.length)}
          sub="Available matches"
          icon={Briefcase}
          color="var(--edu-accent)"
          badge={internships.length > 0 ? `${internships.length} new` : undefined}
          badgeColor="var(--edu-accent)"
          loading={loading}
          onClick={() => navigate("/portal/internships")}
          hint="Click to browse matched internship listings"
        />
      </div>

      {/* ── Chart row ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Thesis Progress chart */}
        <Card className="lg:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle
            title="Thesis Progress"
            sub={activeThesis?.title ?? (loading ? "Loading…" : "No active thesis")}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  chartData.length
                    ? chartData
                    : [{ week: "—", progress: 0 }]
                }
              >
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                <XAxis dataKey="week" stroke="var(--edu-light)" fontSize={12} />
                <YAxis stroke="var(--edu-light)" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--edu-border)",
                    fontSize: 13,
                  }}
                  formatter={(v: number) => [`${v}%`, "Progress"]}
                />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="var(--edu-primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--edu-secondary)", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Submission Timeline */}
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Submission Timeline" />
          {milestones.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(26,95,122,0.07)", color: "var(--edu-primary)" }}
              >
                <FileText size={22} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--edu-dark)" }}>
                No milestones yet.
              </p>
              <p className="text-xs" style={{ color: "var(--edu-light)" }}>
                Start by submitting your thesis proposal.
              </p>
              <Button
                size="sm"
                className="rounded-full mt-1"
                style={{ background: "var(--edu-primary)" }}
                onClick={() => navigate("/portal/thesis")}
              >
                Go to Thesis
              </Button>
            </div>
          ) : (
            <ol
              className="relative border-l-2 ml-3 space-y-5"
              style={{ borderColor: "var(--edu-border)" }}
            >
              {milestones.map((m: PortalMilestone, i: number) => {
                const { bg, icon } = milestoneStyle(m);
                return (
                  <li key={i} className="ml-5">
                    <span
                      className="absolute -left-[11px] w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ background: bg }}
                    >
                      {icon}
                    </span>
                    <div className="font-semibold text-sm" style={{ color: "var(--edu-dark)" }}>
                      {m.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--edu-light)" }}>
                      {m.due_date}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>

      {/* ── Supervisors & Courses row ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Available Supervisors */}
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle
            title="Available Supervisors"
            action={
              <Button
                variant="ghost"
                size="sm"
                style={{ color: "var(--edu-primary)" }}
                onClick={() => navigate("/portal/supervisors")}
              >
                See all <Badge className="ml-1.5 text-xs" style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)", border: "none" }}>{supervisors.length}</Badge>
              </Button>
            }
          />
          <AvatarList
            items={supervisorItems}
            maxDisplay={3}
            onSeeAll={() => navigate("/portal/supervisors")}
            seeAllLabel="View all supervisors"
            emptyTitle="No supervisors with open slots."
            emptyIcon={Users2}
            onItemClick={() => navigate("/portal/supervisors")}
          />
        </Card>

        {/* Suggested Courses */}
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle
            title="Suggested Courses"
            action={
              courses.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ color: "var(--edu-primary)" }}
                  onClick={() => navigate("/portal/skillgap")}
                >
                  View gap analysis
                </Button>
              ) : undefined
            }
          />
          <InteractiveList
            items={courses}
            maxDisplay={3}
            emptyTitle="No course suggestions yet."
            emptyDescription="Complete your skills profile to get personalised recommendations."
            emptyIcon={BookOpen}
            emptyAction={{
              label:   "Update Profile",
              onClick: () => navigate("/portal/profile"),
            }}
            onViewAll={() => navigate("/portal/skillgap")}
            viewAllLabel="See full skill gap analysis"
            renderItem={(c: PortalCourse) => (
              <div
                key={c.course_id}
                className="flex items-center justify-between p-3 rounded-xl border"
                style={{ borderColor: "var(--edu-border)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)" }}
                  >
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: "var(--edu-dark)" }}>
                      {c.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--edu-light)" }}>
                      {c.provider} · {c.duration}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    className="text-xs"
                    style={{
                      background: c.difficulty === "Beginner"
                        ? "rgba(40,167,69,0.12)"
                        : c.difficulty === "Advanced"
                          ? "rgba(220,53,69,0.12)"
                          : "rgba(255,159,41,0.12)",
                      color: c.difficulty === "Beginner"
                        ? "var(--edu-success)"
                        : c.difficulty === "Advanced"
                          ? "var(--edu-danger)"
                          : "var(--edu-accent)",
                      border: "none",
                    }}
                  >
                    {c.difficulty}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs"
                    onClick={() => toast.success(`Enrolled in ${c.name}! Check your email.`)}
                  >
                    Enroll
                  </Button>
                </div>
              </div>
            )}
          />
        </Card>
      </div>

      {/* ── Recent Notifications ───────────────────────────────────────────── */}
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle
          title="Recent Notifications"
          action={
            notifications.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                style={{ color: "var(--edu-primary)" }}
                onClick={() => navigate("/portal/notifications")}
              >
                View all
              </Button>
            ) : undefined
          }
        />
        <InteractiveList
          items={notifications}
          maxDisplay={4}
          emptyTitle="No notifications."
          emptyDescription="You're all caught up!"
          emptyIcon={Bell}
          onViewAll={() => navigate("/portal/notifications")}
          viewAllLabel="View all notifications"
          renderItem={(n: PortalNotification, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer hover:bg-gray-50"
              style={{
                background: i < 2 ? "rgba(87,197,182,0.08)" : "transparent",
              }}
              onClick={() => navigate("/portal/notifications")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full edu-gradient text-white flex items-center justify-center shrink-0">
                  <Bell size={16} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: "var(--edu-dark)" }}>
                    {n.title}
                  </div>
                  {n.detail && (
                    <div className="text-xs truncate" style={{ color: "var(--edu-light)" }}>
                      {n.detail}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs shrink-0 ml-3" style={{ color: "var(--edu-light)" }}>
                {n.time}
              </span>
            </div>
          )}
        />
      </Card>

    </div>
  );
}
