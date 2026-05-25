import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  { name: "Farjana A. Limu", role: "MSc, Computer Science", body: "EduMatch found me a supervisor I never even considered — and the match was perfect.", avatar: "FL" },
  { name: "Dr. Ahmed Rahman", role: "Faculty, Machine Learning", body: "Blind review changed how I evaluate applications. My cohort quality jumped instantly.", avatar: "AR" },
  { name: "Riad Karim", role: "Alumni Mentor", body: "I mentor students across three universities now — all from one calendar.", avatar: "RK" },
];

export function LandingTestimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-3" style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>Testimonials</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>Loved across campuses</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-6 rounded-3xl bg-white border edu-card-shadow hover-lift" style={{ borderColor: "var(--edu-border)" }}>
              <Quote style={{ color: "var(--edu-secondary)" }} />
              <p className="mt-3" style={{ color: "var(--edu-dark)" }}>{t.body}</p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar><AvatarFallback className="edu-gradient text-white">{t.avatar}</AvatarFallback></Avatar>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{t.name}</div>
                  <div className="text-sm" style={{ color: "var(--edu-light)" }}>{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
