import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { ChevronRight } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

export function HelpView() {
  const faqs = [
    "How does AI matching work?",
    "Can I switch supervisors?",
    "Where do I see plagiarism reports?",
    "How do I download my QR credential?",
  ];
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Help Center" sub="Find quick answers or get in touch." />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>FAQs</h3>
          <ul className="mt-3 space-y-3">
            {faqs.map(q => (
              <li key={q} className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: "var(--edu-border)" }}>
                <span>{q}</span><ChevronRight size={16} style={{ color: "var(--edu-light)" }} />
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Contact us</h3>
          <div className="mt-3 space-y-3">
            <Input placeholder="Subject" />
            <Textarea rows={5} placeholder="How can we help?" />
            <Button style={{ background: "var(--edu-primary)" }} onClick={() => toast.success("Message sent")}>Send</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
