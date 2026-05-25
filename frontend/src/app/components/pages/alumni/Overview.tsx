import { Card } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Users2, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";
import { mentees } from "../../edu-data";

export function AlumniOverview() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Alumni Dashboard" sub="Welcome back, Riad Karim." />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Active Mentees" value={mentees.length.toString()} icon={Users2} />
        <StatCard label="Sessions This Month" value="12" icon={CalendarIcon} color="#57c5b6" />
        <StatCard label="Expertise Areas" value="3" sub="ML · Web · Career" icon={Sparkles} color="#ff9f29" />
      </div>
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="Upcoming Sessions" />
        <div className="space-y-3">
          {mentees.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--edu-border)" }}>
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback className="edu-gradient text-white">{m.name.split(" ").map(p => p[0]).join("")}</AvatarFallback></Avatar>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div className="text-xs" style={{ color: "var(--edu-light)" }}>{m.topic}</div>
                </div>
              </div>
              <div className="text-sm" style={{ color: "var(--edu-primary)", fontWeight: 600 }}>{m.next}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
