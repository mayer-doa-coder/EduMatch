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
import { currentStudent, supervisors, courses, milestones, notifications, progressData } from "../../edu-data";
import { toast } from "sonner";

export function StudentOverview() {
  return (
    <div className="space-y-6 fade-in-up">
      <div className="rounded-3xl p-6 md:p-8 edu-gradient text-white edu-card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="opacity-90 text-sm">Welcome back,</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>{currentStudent.name} 👋</h1>
          <p className="opacity-90 mt-1">You're 87% on track. 2 supervisor recommendations and 1 new internship match are waiting.</p>
        </div>
        <div className="flex gap-3">
          <Button className="rounded-full" style={{ background: "var(--edu-accent)" }}>Submit chapter <Upload size={16} className="ml-2" /></Button>
          <Button variant="outline" className="rounded-full bg-transparent border-white text-white hover:bg-white/10">View thesis</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Thesis Health" value={`${currentStudent.thesisHealth}/100`} sub="Excellent" icon={Activity} color="#28a745" />
        <StatCard label="Match Score" value={`${currentStudent.matchingScore}%`} sub="Top supervisor: Dr. Ahmed" icon={Sparkles} color="#1a5f7a" />
        <StatCard label="Plagiarism" value="6%" sub="Within safe range" icon={ShieldCheck} color="#17a2b8" />
        <StatCard label="Internships" value="4" sub="3 in review" icon={Briefcase} color="#ff9f29" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Thesis Progress" sub="Weekly milestone completion" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={progressData}>
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
                <span
                  className="absolute -left-[11px] w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: m.status === "done" ? "#28a745" : m.status === "active" ? "#ff9f29" : "#e9ecef",
                    color: "white",
                  }}
                >
                  {m.status === "done" ? <CheckCircle2 size={12} /> : m.status === "active" ? <Clock size={12} /> : null}
                </span>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>{m.date}</div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Recommended Supervisors" action={<Button variant="ghost" style={{ color: "var(--edu-primary)" }}>See all <ChevronRight size={16} /></Button>} />
          <div className="space-y-3">
            {supervisors.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border hover-lift" style={{ borderColor: "var(--edu-border)" }}>
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="edu-gradient text-white">{s.photo}</AvatarFallback></Avatar>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div className="text-xs" style={{ color: "var(--edu-light)" }}>{s.expertise}</div>
                  </div>
                </div>
                <Badge style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>{s.match}%</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <SectionTitle title="Suggested Free Courses" />
          <div className="space-y-3">
            {courses.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--edu-border)" }}>
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
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="Recent Notifications" />
        <div className="space-y-2">
          {notifications.slice(0, 4).map(n => (
            <div key={n.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: n.unread ? "rgba(87,197,182,0.08)" : "transparent" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full edu-gradient text-white flex items-center justify-center"><Bell size={16} /></div>
                <div>
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  <div className="text-xs" style={{ color: "var(--edu-light)" }}>{n.body}</div>
                </div>
              </div>
              <span className="text-xs" style={{ color: "var(--edu-light)" }}>{n.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
