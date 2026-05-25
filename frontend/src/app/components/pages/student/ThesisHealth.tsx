import { Card } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { SectionTitle } from "../../shared/SectionTitle";

export function ThesisHealth() {
  const score = 87;
  const data = [{ name: "score", v: score }, { name: "rest", v: 100 - score }];
  const breakdown = [
    { l: "Timeliness", v: 92 },
    { l: "Plagiarism Safety", v: 94 },
    { l: "Supervisor Feedback", v: 81 },
    { l: "Completion Rate", v: 78 },
  ];

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Thesis Health Score" sub="A holistic, AI-powered measure of your thesis trajectory." />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 text-center">
          <div className="relative h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="v" innerRadius={70} outerRadius={95} startAngle={90} endAngle={-270}>
                  <Cell fill="#28a745" /><Cell fill="#e9ecef" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#28a745" }}>{score}</div>
              <div className="text-sm" style={{ color: "var(--edu-light)" }}>Excellent</div>
            </div>
          </div>
        </Card>
        <Card className="md:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Score Breakdown</h3>
          {breakdown.map(b => (
            <div key={b.l} className="mt-4">
              <div className="flex justify-between text-sm mb-1"><span>{b.l}</span><span style={{ color: "var(--edu-light)" }}>{b.v}/100</span></div>
              <Progress value={b.v} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
