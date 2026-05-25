import { Card } from "../../ui/card";
import { Briefcase, FileText, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";

export function CompanyOverview() {
  const pipeline = [
    { stage: "Applied", n: 148 }, { stage: "Reviewed", n: 92 }, { stage: "Interview", n: 22 }, { stage: "Offer", n: 8 }, { stage: "Hired", n: 5 },
  ];
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Company Dashboard" sub="DataPeak Labs — Talent overview." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Open Positions" value="6" icon={Briefcase} />
        <StatCard label="Applications" value="148" icon={FileText} color="#57c5b6" />
        <StatCard label="Interviews" value="22" icon={CalendarIcon} color="#ff9f29" />
        <StatCard label="Shortlisted" value="11" icon={CheckCircle2} color="#28a745" />
      </div>
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="Pipeline" />
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={pipeline}>
              <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
              <XAxis dataKey="stage" stroke="#6c757d" /><YAxis stroke="#6c757d" /><Tooltip />
              <Bar dataKey="n" radius={[8, 8, 0, 0]} fill="#57c5b6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
