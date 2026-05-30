import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { SectionTitle } from "../../shared/SectionTitle";

const API = "http://localhost/EduMatch/backend";

interface ThesisRow {
  health_score: number;
  status: string;
  title: string;
  plagiarism_score: number | null;
  submission_date: string | null;
  milestone_name: string | null;
}

type Props = { profileId: number | null };

export function ThesisHealth({ profileId }: Props) {
  const [score,   setScore]   = useState<number | null>(null);
  const [rows,    setRows]    = useState<ThesisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_student_dashboard.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.thesis) && d.thesis.length > 0) {
          setScore(Number(d.thesis[0].health_score) ?? 87);
          setRows(d.thesis);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        Loading thesis health…
      </div>
    );
  }

  const s    = score ?? 87;
  const color = s >= 80 ? "#28a745" : s >= 60 ? "#ffc107" : "#dc3545";
  const label = s >= 80 ? "Excellent" : s >= 60 ? "At Risk" : "Critical";

  const chartData = [{ name: "score", v: s }, { name: "rest", v: 100 - s }];

  // Derive sub-scores from real data
  const submitted  = rows.filter(r => r.submission_date).length;
  const total      = rows.length || 1;
  const plagScores = rows.map(r => Number(r.plagiarism_score ?? 0)).filter(n => n > 0);
  const avgPlag    = plagScores.length ? plagScores.reduce((a, b) => a + b, 0) / plagScores.length : 0;

  const breakdown = [
    { l: "Completion Rate",   v: Math.round((submitted / total) * 100) },
    { l: "Plagiarism Safety", v: Math.max(0, Math.round(100 - avgPlag * 2)) },
    { l: "Overall Health",    v: s },
  ];

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Thesis Health Score" sub="A holistic measure of your thesis trajectory." />
      <div className="grid md:grid-cols-3 gap-6">

        {/* Donut score */}
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 text-center">
          <div className="relative h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="v" innerRadius={70} outerRadius={95} startAngle={90} endAngle={-270}>
                  <Cell fill={color} />
                  <Cell fill="#e9ecef" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div style={{ fontSize: "2.5rem", fontWeight: 700, color }}>{s}</div>
              <div className="text-sm" style={{ color: "var(--edu-light)" }}>{label}</div>
            </div>
          </div>
        </Card>

        {/* Score breakdown */}
        <Card className="md:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Score Breakdown</h3>
          {breakdown.map(b => (
            <div key={b.l} className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{b.l}</span>
                <span style={{ color: "var(--edu-light)" }}>{b.v}/100</span>
              </div>
              <Progress value={b.v} />
            </div>
          ))}

          {rows.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold" style={{ color: "var(--edu-primary)" }}>Milestones</h4>
              {rows.filter(r => r.milestone_name).map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg"
                  style={{ background: "var(--edu-bg)" }}>
                  <span>{r.milestone_name}</span>
                  <span style={{ color: r.submission_date ? "var(--edu-success)" : "var(--edu-warning)", fontWeight: 600 }}>
                    {r.submission_date ? "Submitted" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
