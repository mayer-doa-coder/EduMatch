import { Badge } from "../ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const faqs = [
  { q: "Is EduMatch free for students?", a: "Yes — students access matching, skill gap analysis, and basic mentorship at no cost." },
  { q: "How does AI matching work?", a: "We weight CGPA, skills, interests, supervisor expertise, and quota availability — admins can tune weights." },
  { q: "Can my university join?", a: "Absolutely. Admins can request inter-university collaboration from the dashboard." },
  { q: "Are credentials verifiable?", a: "Yes — each issued credential includes a unique QR that anyone can validate." },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <Badge className="mb-3" style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)" }}>FAQ</Badge>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>Frequently Asked Questions</h2>
      </div>
      <Accordion type="single" collapsible className="bg-white rounded-3xl edu-card-shadow p-2">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q${i}`} className="px-4">
            <AccordionTrigger style={{ color: "var(--edu-primary)" }}>{f.q}</AccordionTrigger>
            <AccordionContent style={{ color: "var(--edu-light)" }}>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
