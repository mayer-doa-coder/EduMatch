import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Briefcase, FileText, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";

const API = "http://localhost/EduMatch/backend";

interface Internship {
  internship_id: number;
  role_title: string;
  company_name: string;
  salary: string;
  deadline: string;
  status: string;
}

type Props = { userId: number };

export function CompanyOverview({ userId }: Props) {
  const [listings, setListings] = useState<Internship[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(`${API}/post_job.php?action=search&term=`)
      .then(r => r.json())
      .then(d => { if (d.success) setListings(d.results ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const open     = listings.filter(l => l.status === "open").length;
  const pipeline = [
    { stage: "Posted",    n: listings.length },
    { stage: "Open",      n: open            },
    { stage: "Closing",   n: Math.max(0, open - 1) },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        Loading company dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Company Dashboard" sub="Talent pipeline overview." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Open Positions" value={String(open)}            icon={Briefcase}    />
        <StatCard label="Total Listings" value={String(listings.length)} icon={FileText}     color="#57c5b6" />
        <StatCard label="Interviews"     value="—"                       icon={CalendarIcon} color="#ff9f29" />
        <StatCard label="Shortlisted"    value="—"                       icon={CheckCircle2} color="#28a745" />
      </div>

      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="Posting Pipeline" />
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={pipeline}>
              <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
              <XAxis dataKey="stage" stroke="#6c757d" />
              <YAxis stroke="#6c757d" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="n" radius={[8, 8, 0, 0]} fill="#57c5b6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {listings.length > 0 && (
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 className="mb-4" style={{ color: "var(--edu-primary)", fontWeight: 600 }}>Active Listings</h3>
          <div className="space-y-3">
            {listings.map(l => (
              <div key={l.internship_id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--edu-bg)" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{l.role_title}</div>
                  <div className="text-sm" style={{ color: "var(--edu-light)" }}>
                    {l.company_name} · Deadline: {l.deadline}
                  </div>
                </div>
                <span className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ background: "rgba(87,197,182,0.15)", color: "var(--edu-primary)" }}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
