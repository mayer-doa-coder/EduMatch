import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Activity, Sparkles, ShieldCheck, Briefcase, Upload, Bell, BookOpen,
  CheckCircle2, Clock, ChevronRight,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface DashboardData {
  student: { student_id: number; cgpa: number; research_interest: string; technical_skills: string; name: string; email: string; university: string };
  thesis: { project_id: number; title: string; status: string; health_score: number; supervisor_name: string; milestones: { name: string; due_date: string; submission_date: string | null; overdue: boolean }[] }[];
  notifications: { type: string; title: string; time: string; detail: string | null }[];
  progress: { total_milestones: number; done_count: number; overdue_count: number; completion_pct: number };
  supervisors: { faculty_id: number; supervisor_name: string; quota: number; current_student_count: number; slots_available: number }[];
  courses: { course_id: number; name: string; provider: string; duration: string; difficulty: string }[];
}

type Props = { userId: number; profileId: number | null };

export function StudentOverview({ profileId }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_student_dashboard.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else toast.error(d.message); })
      .catch(() => toast.error("Could not load dashboard."))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading dashboard…</div>;
  if (!data) return <div className="p-8 text-center" style={{ color: "var(--edu-light)" }}>No data found for this student.</div>;

  const { student, thesis, notifications, progress, supervisors, courses } = data;
  const activeThesis = thesis.find(t => t.status === "active") ?? thesis[0];
  const milestones = activeThesis?.milestones ?? [];

  const progressChartData = milestones.map((m, i) => ({
    week: `M${i + 1}`,
    progress: m.submission_date ? 100 : m.overdue ? 0 : 50,
  }));

  const avgPlag = activeThesis?.milestones
    .filter(m => m.submission_date)
    .reduce((acc, _, i, arr) => acc + (i === arr.length - 1 ? 0 : 0), 0) ?? 0;

  return (
    <div className="space-y-6 fade-in-up">
      <div className="rounded-3xl p-6 md:p-8 edu-gradient text-white edu-card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="opacity-90 text-sm">Welcome back,</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>{student.name} 👋</h1>
          <p className="opacity-90 mt-1">{student.university} · {progress.completion_pct}% thesis complete · {supervisors.length} supervisor{supervisors.length !== 1 ? "s" : ""} available</p>
        </div>
        <div className="flex gap-3">
          <Button className="rounded-full" style={{ background: "var(--edu-accent)" }}>Submit chapter <Upload size={16} className="ml-2" /></Button>
          <Button variant="outline" className="rounded-full bg-transparent border-white text-white hover:bg-white/10">View thesis</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Thesis Health" value={`${activeThesis?.health_score ?? 0}/100`} sub={activeThesis?.status ?? "—"} icon={Activity} color="#28a745" />
        <StatCard label="CGPA" value={student.cgpa.toFixed(2)} sub={student.research_interest} icon={Sparkles} color="#1a5f7a" />
        <StatCard label="Milestones Done" value={`${progress.done_count}/${progress.total_milestones}`} sub={progress.overdue_count > 0 ? `${progress.overdue_count} overdue` : "On track"} icon={ShieldCheck} color="#17a2b8" />
        <StatCard label="Open Internships" value={String(data.internships?.length ?? 0)} sub="Available matches" icon={Briefcase} color="#ff9f29" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Thesis Progress" sub={activeThesis?.title ?? "No active thesis"} />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={progressChartData.length ? progressChartData : [{ week: "—", progress: 0 }]}>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                <XAxis dataKey="week" stroke="#6c757d" />
                <YAxis stroke="#6c757d" />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#1a5f7a" strokeWidth={3} dot={{ fill: "#57c5b6", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Submission Timeline" />
          <ol className="relative border-l-2 ml-3 space-y-5" style={{ borderColor: "var(--edu-border)" }}>
            {milestones.map((m, i) => (
              <li key={i} className="ml-5">
                <span className="absolute -left-[11px] w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: m.submission_date ? "#28a745" : m.overdue ? "#dc3545" : "#e9ecef", color: "white" }}>
                  {m.submission_date ? <CheckCircle2 size={12} /> : m.overdue ? null : <Clock size={12} />}
                </span>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>{m.due_date}</div>
              </li>
            ))}
            {milestones.length === 0 && <li className="ml-5 text-sm" style={{ color: "var(--edu-light)" }}>No milestones yet.</li>}
          </ol>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Available Supervisors" action={<Button variant="ghost" style={{ color: "var(--edu-primary)" }}>See all <ChevronRight size={16} /></Button>} />
          <div className="space-y-3">
            {supervisors.slice(0, 3).map(s => (
              <div key={s.faculty_id} className="flex items-center justify-between p-3 rounded-xl border hover-lift" style={{ borderColor: "var(--edu-border)" }}>
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="edu-gradient text-white">{s.supervisor_name.split(" ").map(p => p[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.supervisor_name}</div>
                    <div className="text-xs" style={{ color: "var(--edu-light)" }}>{s.slots_available} slot{s.slots_available !== 1 ? "s" : ""} available</div>
                  </div>
                </div>
                <Badge style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>{s.slots_available}/{s.quota}</Badge>
              </div>
            ))}
            {supervisors.length === 0 && <p className="text-sm" style={{ color: "var(--edu-light)" }}>No supervisors with open slots.</p>}
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Suggested Courses" />
          <div className="space-y-3">
            {courses.slice(0, 3).map(c => (
              <div key={c.course_id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--edu-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)" }}><BookOpen size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="text-xs" style={{ color: "var(--edu-light)" }}>{c.provider} · {c.duration}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Enrolled in ${c.name}`)}>Enroll</Button>
              </div>
            ))}
            {courses.length === 0 && <p className="text-sm" style={{ color: "var(--edu-light)" }}>No course suggestions yet.</p>}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="Recent Notifications" />
        <div className="space-y-2">
          {notifications.slice(0, 4).map((n, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: i < 2 ? "rgba(87,197,182,0.08)" : "transparent" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full edu-gradient text-white flex items-center justify-center"><Bell size={16} /></div>
                <div>
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  {n.detail && <div className="text-xs" style={{ color: "var(--edu-light)" }}>{n.detail}</div>}
                </div>
              </div>
              <span className="text-xs" style={{ color: "var(--edu-light)" }}>{n.time}</span>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-sm" style={{ color: "var(--edu-light)" }}>No notifications.</p>}
        </div>
      </Card>
    </div>
  );
}
