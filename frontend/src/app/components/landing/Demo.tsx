import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { BookOpen, ChevronRight } from "lucide-react";

const skills = [
  { skill: "Python", you: 90, req: 95 },
  { skill: "PyTorch", you: 40, req: 80 },
  { skill: "Statistics", you: 65, req: 85 },
  { skill: "Research Writing", you: 55, req: 75 },
];

export function LandingDemo() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <Badge className="mb-3" style={{ background: "rgba(255,159,41,0.15)", color: "var(--edu-accent)" }}>Live Demo</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>AI Skill Gap Analysis</h2>
          <p className="mt-3" style={{ color: "var(--edu-light)" }}>
            We compare your current toolkit against your target supervisor's expertise — then recommend the most efficient path forward.
          </p>
          <ul className="mt-5 space-y-3">
            {[
              "Personalized free course recommendations",
              "Difficulty-aware learning sequencing",
              "Auto-updates as your profile evolves",
            ].map((t, i) => (
              <li key={i} className="flex items-center gap-3"><ChevronRight style={{ color: "var(--edu-secondary)" }} size={18} /><span>{t}</span></li>
            ))}
          </ul>
        </div>
        <Card className="p-6 rounded-3xl edu-card-shadow bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ color: "var(--edu-primary)", fontWeight: 600 }}>Required vs You</h3>
            <Badge style={{ background: "rgba(40,167,69,0.12)", color: "var(--edu-success)" }}>72% match</Badge>
          </div>
          {skills.map(s => (
            <div key={s.skill} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{s.skill}</span>
                <span style={{ color: "var(--edu-light)" }}>{s.you}% / {s.req}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--edu-border)" }}>
                <div className="h-2 rounded-full edu-gradient" style={{ width: `${s.you}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-2 p-3 rounded-2xl flex items-center gap-3" style={{ background: "rgba(255,159,41,0.1)" }}>
            <BookOpen style={{ color: "var(--edu-accent)" }} />
            <div className="text-sm">Recommended: <strong>Deep Learning Fundamentals</strong> · 10 weeks · fast.ai</div>
          </div>
        </Card>
      </div>
    </section>
  );
}
