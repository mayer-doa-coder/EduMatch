import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { GraduationCap, BookOpen, Activity, Briefcase, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";
const COLORS = ["#1a5f7a", "#57c5b6", "#ff9f29", "#dc3545"];

interface AdminData {
  stats: { unique_skills: number; students_applied: number; total_users: number };
  activity_feed: { type: string; item: string; ref: string; status: string }[];
  by_university_status: { uni_name: string; status: string; count: number }[];
  both_thesis_and_intern: { student_id: number }[];
  no_applications: { student_id: number; name: string }[];
}

type Props = { userId: number };

export function AdminOverview({ userId: _userId }: Props) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/get_admin_dashboard.php`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else toast.error(d.message); })
      .catch(() => toast.error("Could not load admin dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading dashboard…</div>;
  if (!data) return null;

  const uniNames = [...new Set(data.by_university_status.map(r => r.uni_name))];
  const statusTypes = [...new Set(data.by_university_status.map(r => r.status))];
  const barData = uniNames.map(uni => {
    const row: Record<string, string | number> = { uni };
    statusTypes.forEach(st => {
      const found = data.by_university_status.find(r => r.uni_name === uni && r.status === st);
      row[st] = found ? found.count : 0;
    });
    return row;
  });

  const pieDist = statusTypes.map(st => ({
    name: st,
    value: data.by_university_status.filter(r => r.status === st).reduce((a, r) => a + r.count, 0),
  }));

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Admin Dashboard" sub="University-wide insights and analytics." />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={String(data.stats.total_users)} icon={GraduationCap} />
        <StatCard label="Unique Skills" value={String(data.stats.unique_skills)} icon={BookOpen} color="#57c5b6" />
        <StatCard label="Students Applied" value={String(data.stats.students_applied)} icon={Activity} color="#17a2b8" />
        <StatCard label="Both Active" value={String(data.both_thesis_and_intern.length)} sub="thesis + intern" icon={Briefcase} color="#ff9f29" />
        <StatCard label="No Applications" value={String(data.no_applications.length)} icon={AlertTriangle} color="#dc3545" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Project Status Distribution" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                  {pieDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Projects by University & Status" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                <XAxis dataKey="uni" stroke="#6c757d" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6c757d" />
                <Tooltip /><Legend />
                {statusTypes.map((st, i) => (
                  <Bar key={st} dataKey={st} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === statusTypes.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="Recent Activity Feed" />
        <div className="space-y-2">
          {data.activity_feed.slice(0, 8).map((a, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
              <div>
                <span className="text-xs uppercase font-medium mr-2" style={{ color: "var(--edu-accent)" }}>{a.type}</span>
                <span style={{ fontWeight: 600 }}>{a.item}</span>
              </div>
              <span className="text-xs capitalize" style={{ color: "var(--edu-light)" }}>{a.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
