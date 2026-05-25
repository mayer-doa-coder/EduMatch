import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Activity, ArrowRight, Brain, Briefcase, PlayCircle, Sparkles } from "lucide-react";
import { Counter } from "./Counter";

type Props = { onGetStarted: () => void };

export function LandingHero({ onGetStarted }: Props) {
  const metrics = [
    { label: "Timeliness", v: 92, c: "var(--edu-success)" },
    { label: "Plagiarism", v: 6, c: "var(--edu-success)", inv: true },
    { label: "Feedback", v: 81, c: "var(--edu-secondary)" },
    { label: "Completion", v: 78, c: "var(--edu-accent)" },
  ];
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 edu-gradient-soft" />
      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div className="fade-in-up">
          <Badge className="mb-4 rounded-full px-3 py-1" style={{ background: "rgba(87,197,182,0.15)", color: "var(--edu-primary)" }}>
            <Sparkles size={14} className="mr-1" /> AI-Driven Academic Ecosystem
          </Badge>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", fontWeight: 800, lineHeight: 1.15, color: "var(--edu-primary)" }}>
            EduMatch — AI-Driven Thesis & Internship Ecosystem
          </h1>
          <p className="mt-5 text-lg" style={{ color: "var(--edu-light)" }}>
            Connect students, supervisors, companies, and alumni in one intelligent platform that matches, mentors, and verifies academic excellence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={onGetStarted} className="rounded-full px-6 h-12" style={{ background: "var(--edu-accent)" }}>
              Get Started <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button variant="outline" className="rounded-full px-6 h-12" style={{ borderColor: "var(--edu-primary)", color: "var(--edu-primary)" }}>
              <PlayCircle size={18} className="mr-2" /> Watch Demo
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-8 flex-wrap" style={{ color: "var(--edu-light)" }}>
            <div><div style={{ fontWeight: 700, fontSize: "1.6rem", color: "var(--edu-primary)" }}><Counter to={12500} suffix="+" /></div><div className="text-sm">Students</div></div>
            <div><div style={{ fontWeight: 700, fontSize: "1.6rem", color: "var(--edu-primary)" }}><Counter to={840} suffix="+" /></div><div className="text-sm">Supervisors</div></div>
            <div><div style={{ fontWeight: 700, fontSize: "1.6rem", color: "var(--edu-primary)" }}><Counter to={96} suffix="%" /></div><div className="text-sm">Match Accuracy</div></div>
          </div>
        </div>
        <div className="relative fade-in-up">
          <Card className="p-6 edu-card-shadow rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>Thesis Health</div>
                <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--edu-primary)" }}>87<span style={{ fontSize: "1rem", color: "var(--edu-light)" }}>/100</span></div>
              </div>
              <div className="w-16 h-16 rounded-full edu-gradient flex items-center justify-center">
                <Activity className="text-white" />
              </div>
            </div>
            <Progress value={87} className="h-2 mb-6" />
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(m => (
                <div key={m.label} className="rounded-2xl p-3" style={{ background: "var(--edu-bg)" }}>
                  <div className="text-xs" style={{ color: "var(--edu-light)" }}>{m.label}</div>
                  <div style={{ fontWeight: 700, color: m.c }}>{m.v}{m.inv ? "%" : "/100"}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3 rounded-2xl flex items-center gap-3" style={{ background: "rgba(87,197,182,0.12)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--edu-secondary)" }}>
                <Brain className="text-white" size={18} />
              </div>
              <div className="text-sm">
                <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>AI Suggestion</div>
                <div style={{ color: "var(--edu-light)" }}>Add 2 references to lift score by ~4 pts</div>
              </div>
            </div>
          </Card>
          <div className="absolute -bottom-6 -left-6 hidden md:block">
            <Card className="p-4 rounded-2xl edu-card-shadow bg-white flex items-center gap-3 hover-lift">
              <div className="w-10 h-10 rounded-full edu-bg-accent flex items-center justify-center text-white"><Briefcase size={18} /></div>
              <div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>New match</div>
                <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>DataPeak Labs · 95%</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
