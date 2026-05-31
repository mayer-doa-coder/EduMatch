/**
 * SupervisorOverview — full live dashboard for the supervisor role.
 *
 * Every stat card is clickable and navigates to the relevant section.
 * Data is fetched fresh from the API on every mount.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card }  from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import {
  Users2, GitBranch, FileText, AlertTriangle,
  ChevronRight, BookOpen, Activity, UserCheck,
  Clock, CheckCircle2, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell,
} from "recharts";
import { BaseMetricCard } from "../../shared/BaseMetricCard";
import { SectionTitle }   from "../../shared/SectionTitle";
import { EmptyState }     from "../../shared/EmptyState";
import { toast }          from "sonner";

const API = "http://localhost/EduMatch/backend";

interface SupervisorDashboard {
  profile: {
    faculty_id:           number;
    designation:          string;
    quota:                number;
    current_student_count: number;
    research_focus:       string;
    name:                 string;
    email:                string;
    actual_count:         number;
    avg_student_cgpa:     number | null;
  };
  thesis_summary: {
    status:     string;
    total:      number;
    avg_health: number;
    min_health: number;
    max_health: number;
  }[];
  my_students: {
    student_id:    number;
    name:          string;
    cgpa:          number;
    research_interest: string;
    thesis_title:  string | null;
    health_score:  number | null;
    thesis_status: string | null;
  }[];
  blind_applicants: { student_id: number }[];
}

const STATUS_COLOR: Record<string, string> = {
  active:    "#1a5f7a",
  completed: "#28a745",
  at_risk:   "#dc3545",
  pending:   "#ff9f29",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  active:    Activity,
  completed: CheckCircle2,
  at_risk:   AlertTriangle,
  pending:   Clock,
};

type Props = { userId: number; profileId: number | null };

export function SupervisorOverview({ profileId }: Props) {
  const navigate = useNavigate();
  const [data,    setData]    = useState<SupervisorDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_supervisor_dashboard.php?faculty_id=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d);
        else toast.error(d.message ?? "Failed to load dashboard.");
      })
      .catch(() => toast.error("Could not load supervisor dashboard."))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        <Loader2 className="animate-spin mr-2" size={18} /> Loading dashboard…
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <EmptyState
        icon={Users2}
        title="No supervisor profile found."
        description="Your faculty record may not have been set up yet. Contact your admin."
      />
    );
  }

  const { profile, thesis_summary, my_students, blind_applicants } = data;
  const slotsLeft    = profile.quota - (profile.actual_count ?? profile.current_student_count);
  const pendingApps  = blind_applicants?.length ?? 0;
  const atRisk       = thesis_summary.find(t => t.status === "at_risk")?.total ?? 0;
  const quotaPct     = Math.round(((profile.actual_count ?? profile.current_student_count) / profile.quota) * 100);

  const chartData = my_students.map(s => ({
    name:  s.name.split(" ")[1] ?? s.name.split(" ")[0],   // first last → last name
    score: s.health_score ?? 0,
    fill:  (s.health_score ?? 0) < 60
      ? "#dc3545"
      : (s.health_score ?? 0) < 80 ? "#ff9f29" : "#28a745",
  }));

  return (
    <div className="space-y-6 fade-in-up">
      {/* ── Welcome banner ──────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 edu-gradient text-white edu-card-shadow
                   flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="opacity-80 text-sm">Welcome back,</div>
          <h1 className="font-bold" style={{ fontSize: "1.6rem" }}>
            {profile.name}
          </h1>
          <p className="opacity-90 mt-0.5 text-sm">
            {profile.designation} · {profile.research_focus}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          {pendingApps > 0 && (
            <Button
              className="rounded-full"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
              onClick={() => navigate("/portal/applicants")}
            >
              <Users2 size={15} className="mr-2" />
              {pendingApps} pending review{pendingApps > 1 ? "s" : ""}
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-full bg-transparent border-white text-white hover:bg-white/10"
            onClick={() => navigate("/portal/feedback")}
          >
            Send Feedback
          </Button>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BaseMetricCard
          label="Current Students"
          value={profile.actual_count ?? profile.current_student_count}
          sub={`of ${profile.quota} quota`}
          icon={Users2}
          color="var(--edu-primary)"
          onClick={() => navigate("/portal/applicants")}
          hint="Manage applicants"
        />
        <BaseMetricCard
          label="Slots Available"
          value={slotsLeft}
          sub={`${quotaPct}% quota used`}
          icon={GitBranch}
          color={slotsLeft > 0 ? "var(--edu-success)" : "var(--edu-danger)"}
          badge={slotsLeft === 0 ? "Full" : undefined}
          badgeColor="var(--edu-danger)"
          onClick={() => navigate("/portal/capacity")}
          hint="Adjust capacity"
        />
        <BaseMetricCard
          label="Thesis Projects"
          value={my_students.filter(s => s.thesis_title).length}
          sub={`${my_students.length} student${my_students.length !== 1 ? "s" : ""} total`}
          icon={FileText}
          color="var(--edu-accent)"
          onClick={() => navigate("/portal/feedback")}
          hint="Review and send feedback"
        />
        <BaseMetricCard
          label="At-Risk Projects"
          value={atRisk}
          sub={atRisk > 0 ? "Need attention" : "All on track"}
          icon={AlertTriangle}
          color={atRisk > 0 ? "var(--edu-danger)" : "var(--edu-success)"}
          trend={atRisk > 0 ? "down" : "up"}
          onClick={() => navigate("/portal/feedback")}
          hint="Review at-risk students"
        />
      </div>

      {/* ── Quota progress bar ──────────────────────────────────────────── */}
      <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--edu-dark)" }}>
            Quota Usage
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--edu-primary)" }}>
            {profile.actual_count ?? profile.current_student_count} / {profile.quota}
          </span>
        </div>
        <Progress value={quotaPct} className="h-3" />
        <p className="text-xs mt-1.5" style={{ color: "var(--edu-light)" }}>
          {slotsLeft > 0
            ? `${slotsLeft} slot${slotsLeft > 1 ? "s" : ""} available for new students.`
            : "Quota full — increase capacity to accept new applicants."}
          {profile.avg_student_cgpa !== null && (
            <> · Average student CGPA: <strong>{profile.avg_student_cgpa?.toFixed(2)}</strong></>
          )}
        </p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Health bar chart ──────────────────────────────────────────── */}
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Student Health Scores" />
          {chartData.length === 0 ? (
            <EmptyState icon={Activity} title="No students assigned yet." compact />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                  <XAxis dataKey="name" stroke="var(--edu-light)" fontSize={12} />
                  <YAxis stroke="var(--edu-light)" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 13 }}
                    formatter={(v: number) => [v, "Health Score"]}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* ── Thesis summary by status ──────────────────────────────────── */}
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Thesis Status Summary" />
          {thesis_summary.length === 0 ? (
            <EmptyState icon={FileText} title="No thesis records yet." compact />
          ) : (
            <div className="space-y-3">
              {thesis_summary.map(t => {
                const Icon  = STATUS_ICON[t.status] ?? FileText;
                const color = STATUS_COLOR[t.status] ?? "var(--edu-primary)";
                return (
                  <div
                    key={t.status}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "var(--edu-bg)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} style={{ color }} />
                      <span className="capitalize font-medium text-sm" style={{ color: "var(--edu-dark)" }}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className="text-xs"
                        style={{ background: `${color}18`, color, border: "none" }}
                      >
                        {t.total} project{t.total !== 1 ? "s" : ""}
                      </Badge>
                      <span className="text-xs" style={{ color: "var(--edu-light)" }}>
                        avg {Math.round(t.avg_health)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── My Students table ─────────────────────────────────────────── */}
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle
          title="My Students"
          action={
            <Button
              variant="ghost"
              size="sm"
              style={{ color: "var(--edu-primary)" }}
              onClick={() => navigate("/portal/feedback")}
            >
              Send Feedback <ChevronRight size={15} className="ml-1" />
            </Button>
          }
        />
        {my_students.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No students assigned yet."
            description="Accept applicants in the Blind Applicants section to start supervising."
            action={{ label: "Review Applicants", onClick: () => navigate("/portal/applicants") }}
          />
        ) : (
          <div className="space-y-2">
            {my_students.map(s => {
              const hs    = s.health_score ?? 0;
              const hsCol = hs < 60 ? "var(--edu-danger)" : hs < 80 ? "var(--edu-accent)" : "var(--edu-success)";
              const stColor = STATUS_COLOR[s.thesis_status ?? ""] ?? "var(--edu-light)";
              return (
                <div
                  key={s.student_id}
                  className="flex items-center justify-between p-3 rounded-xl border hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ borderColor: "var(--edu-border)" }}
                  onClick={() => navigate("/portal/feedback")}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm" style={{ color: "var(--edu-dark)" }}>
                      {s.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
                      CGPA {s.cgpa.toFixed(2)} · {s.research_interest}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.thesis_title && (
                      <div className="hidden md:block text-right">
                        <div className="text-xs font-medium truncate max-w-36" style={{ color: "var(--edu-primary)" }}>
                          {s.thesis_title}
                        </div>
                        {s.thesis_status && (
                          <Badge
                            className="text-xs capitalize mt-0.5"
                            style={{ background: `${stColor}18`, color: stColor, border: "none" }}
                          >
                            {s.thesis_status.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    )}
                    {s.health_score !== null && (
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: hsCol }}>
                          {s.health_score}
                        </div>
                        <div className="text-xs" style={{ color: "var(--edu-light)" }}>health</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Pending applicants nudge ──────────────────────────────────── */}
      {pendingApps > 0 && (
        <Card
          className="p-5 rounded-2xl border cursor-pointer hover-lift"
          style={{ borderColor: "var(--edu-secondary)", background: "rgba(87,197,182,0.05)" }}
          onClick={() => navigate("/portal/applicants")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(87,197,182,0.15)", color: "var(--edu-secondary)" }}
              >
                <Users2 size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: "var(--edu-dark)" }}>
                  {pendingApps} applicant{pendingApps > 1 ? "s" : ""} awaiting review
                </div>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>
                  From your university · identities hidden
                </div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: "var(--edu-secondary)" }} />
          </div>
        </Card>
      )}
    </div>
  );
}
