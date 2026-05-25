import { Card } from "../../ui/card";
import { GraduationCap, BookOpen, Activity, Briefcase, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";
import { matchingDist, applicationStatus } from "../../edu-data";

const COLORS = ["#1a5f7a", "#57c5b6", "#ff9f29", "#dc3545"];

export function AdminOverview() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Admin Dashboard" sub="University-wide insights and analytics." />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Students" value="2,418" icon={GraduationCap} />
        <StatCard label="Faculty" value="184" icon={BookOpen} color="#57c5b6" />
        <StatCard label="Active Projects" value="612" icon={Activity} color="#17a2b8" />
        <StatCard label="Internships" value="148" icon={Briefcase} color="#ff9f29" />
        <StatCard label="At-Risk" value="34" icon={AlertTriangle} color="#dc3545" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Matching Distribution" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={matchingDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                  {matchingDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Application Status" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={applicationStatus}>
                <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                <XAxis dataKey="month" stroke="#6c757d" /><YAxis stroke="#6c757d" /><Tooltip /><Legend />
                <Bar dataKey="accepted" stackId="a" fill="#28a745" />
                <Bar dataKey="rejected" stackId="a" fill="#dc3545" />
                <Bar dataKey="applied" stackId="a" fill="#1a5f7a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
