import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

const steps = [
  { n: "01", title: "Create your profile", desc: "Add skills, interests, CGPA, and uploads in minutes." },
  { n: "02", title: "Get AI matches", desc: "Receive ranked supervisors and internships instantly." },
  { n: "03", title: "Track & improve", desc: "Live scoring nudges you toward a perfect thesis." },
  { n: "04", title: "Verify credentials", desc: "Generate verifiable QR credentials when complete." },
];

export function LandingHowItWorks() {
  return (
    <section id="how" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-3" style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>How it Works</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>From profile to defense — in four steps</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <Card key={i} className="p-6 rounded-3xl bg-white border hover-lift" style={{ borderColor: "var(--edu-border)" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-secondary)" }}>{s.n}</div>
              <h3 className="mt-2" style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{s.title}</h3>
              <p className="mt-2" style={{ color: "var(--edu-light)" }}>{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
