import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Activity, Brain, Briefcase, QrCode, ShieldCheck, Target } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Matching", desc: "Smart pairing of students with the most compatible thesis supervisors." },
  { icon: Target, title: "Skill Gap Analysis", desc: "Identify missing skills and get targeted course recommendations." },
  { icon: Activity, title: "Thesis Health Score", desc: "A live signal of your progress, plagiarism, and feedback quality." },
  { icon: ShieldCheck, title: "Plagiarism Tracker", desc: "Chapter-level similarity detection with detailed source reports." },
  { icon: Briefcase, title: "Internship Matching", desc: "Discover internships ranked by skill, interest, and university fit." },
  { icon: QrCode, title: "QR Credentials", desc: "Verifiable, shareable digital credentials with one-tap scanning." },
];

export function LandingFeatures() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <Badge className="mb-3" style={{ background: "rgba(255,159,41,0.15)", color: "var(--edu-accent)" }}>Features</Badge>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>Everything your academic journey needs</h2>
        <p className="mt-2" style={{ color: "var(--edu-light)" }}>Powerful, AI-assisted tools built for modern universities.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <Card key={i} className="p-6 rounded-3xl border bg-white hover-lift edu-card-shadow" style={{ borderColor: "var(--edu-border)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(26,95,122,0.08)" }}>
              <f.icon style={{ color: "var(--edu-primary)" }} />
            </div>
            <h3 style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{f.title}</h3>
            <p className="mt-2" style={{ color: "var(--edu-light)" }}>{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
