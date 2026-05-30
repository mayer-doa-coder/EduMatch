import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Users2, GitBranch, FileText, AlertTriangle } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface SupervisorDashboard {
  profile: {
    faculty_id: number; designation: string; quota: number; current_student_count: number;
    research_focus: string; name: string; email: string; actual_count: number; avg_student_cgpa: number;
  };
  thesis_summary: { status: string; total: number; avg_health: number; min_health: number; max_health: number }[];
  my_students: { student_id: number; name: string; cgpa: number; research_interest: string; thesis_title: string | null; health_score: number | null }[];
  overloaded_supervisors: { faculty_id: number; current_student_count: number; quota: number }[];
}

type Props = { userId: number; profileId: number | null };

export function SupervisorOverview({ profileId }: Props) {
  const [data, setData] = useState<SupervisorDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_supervisor_dashboard.php?faculty_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else toast.error(d.message); })
      .catch(() => toast.error("Could not load supervisor dashboard."))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading dashboard…</div>;
  if (!data?.profile) return <div className="p-8 text-center" style={{ color: "var(--edu-light)" }}>No supervisor profile found.</div>;

  const { profile, thesis_summary, my_students } = data;
  const atRisk = thesis_summary.find(t => t.status === "at_risk")?.total ?? 0;
  const pendingApps = data.blind_applicants?.length ?? 0;
  const chartData = my_students.map(s => ({ s: s.name.split(" ")[0], p: s.health_score ?? 0 }));

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Supervisor Dashboard" sub={`Welcome back, ${profile.name}.`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Current Students" value={String(profile.actual_count)} sub={`of ${profile.quota} quota`} icon={Users2} />
        <StatCard label="Quota Usage" value={`${Math.round((profile.actual_count / profile.quota) * 100)}%`} icon={GitBranch} color="#57c5b6" />
        <StatCard label="Thesis Statuses" value={String(thesis_summary.length)} sub={thesis_summary.map(t => t.status).join(", ")} icon={FileText} color="#ff9f29" />
        <StatCard label="At-Risk Projects" value={String(atRisk)} sub="Need attention" icon={AlertTriangle} color="#dc3545" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Student Health Scores" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartData.length ? chartData : [{ s: "—", p: 0 }]}>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                <XAxis dataKey="s" stroke="#6c757d" />
                <YAxis stroke="#6c757d" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="p" radius={[8, 8, 0, 0]} fill="#1a5f7a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Thesis Summary by Status" />
          <div className="space-y-3 mt-2">
            {thesis_summary.map(t => (
              <div key={t.status} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <span className="capitalize font-medium" style={{ color: "var(--edu-primary)" }}>{t.status}</span>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>
                  {t.total} project{t.total !== 1 ? "s" : ""} · avg health {Math.round(t.avg_health)}
                </div>
              </div>
            ))}
            {thesis_summary.length === 0 && <p style={{ color: "var(--edu-light)" }}>No thesis data.</p>}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="My Students" />
        <div className="space-y-2">
          {my_students.map(s => (
            <div key={s.student_id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--edu-border)" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>CGPA {s.cgpa} · {s.research_interest}</div>
              </div>
              <div className="text-right">
                <div className="text-sm" style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{s.thesis_title ?? "No thesis"}</div>
                {s.health_score !== null && (
                  <div className="text-xs" style={{ color: s.health_score < 60 ? "#dc3545" : "#28a745" }}>Health: {s.health_score}</div>
                )}
              </div>
            </div>
          ))}
          {my_students.length === 0 && <p style={{ color: "var(--edu-light)" }}>No students assigned yet.</p>}
        </div>
      </Card>
    </div>
  );
}
