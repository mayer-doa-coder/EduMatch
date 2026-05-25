import { Card } from "../../ui/card";
import { Users2, GitBranch, FileText, AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";
import { progressData } from "../../edu-data";

export function SupervisorOverview() {
  const studentData = [
    { s: "Limu", p: 87 }, { s: "Karim", p: 72 }, { s: "Akter", p: 65 }, { s: "Hasan", p: 91 }, { s: "Shaikh", p: 54 },
  ];
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Supervisor Dashboard" sub="Welcome back, Dr. Ahmed Rahman." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Current Students" value="5" sub="of 8 quota" icon={Users2} />
        <StatCard label="Quota Usage" value="62%" icon={GitBranch} color="#57c5b6" />
        <StatCard label="Pending Apps" value="12" sub="3 high-match" icon={FileText} color="#ff9f29" />
        <StatCard label="Thesis Alerts" value="2" sub="Risk detected" icon={AlertTriangle} color="#dc3545" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Student Progress" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={studentData}>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                <XAxis dataKey="s" stroke="#6c757d" /><YAxis stroke="#6c757d" /><Tooltip />
                <Bar dataKey="p" radius={[8, 8, 0, 0]} fill="#1a5f7a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Health Trends" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={progressData}>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                <XAxis dataKey="week" stroke="#6c757d" /><YAxis stroke="#6c757d" /><Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#57c5b6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
