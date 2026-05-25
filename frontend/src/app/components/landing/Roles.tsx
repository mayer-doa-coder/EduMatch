import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Award, BookOpen, Building2, GraduationCap, ShieldCheck } from "lucide-react";

const roles = [
  { icon: GraduationCap, title: "Student", desc: "Find supervisors, track milestones, build skills." },
  { icon: BookOpen, title: "Supervisor", desc: "Review blind applications and mentor with insight." },
  { icon: ShieldCheck, title: "Admin", desc: "Run matching weights, monitor risk, and analytics." },
  { icon: Building2, title: "Company", desc: "Post internships and discover top talent." },
  { icon: Award, title: "Alumni Mentor", desc: "Guide students with sessions and chat support." },
];

export function LandingRoles() {
  return (
    <section id="roles" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <Badge className="mb-3" style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)" }}>Roles</Badge>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>Built for everyone in academia</h2>
      </div>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
        {roles.map((r, i) => (
          <Card key={i} className="p-5 rounded-3xl bg-white text-center hover-lift edu-card-shadow border" style={{ borderColor: "var(--edu-border)" }}>
            <div className="mx-auto w-14 h-14 rounded-2xl edu-gradient flex items-center justify-center mb-3">
              <r.icon className="text-white" />
            </div>
            <h3 style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{r.title}</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--edu-light)" }}>{r.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
