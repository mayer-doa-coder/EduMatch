/**
 * HelpView — Help Center with an FAQ accordion and a fully functional
 * contact form (controlled inputs, validation, char-count, simulated send).
 */

import { useState } from "react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../../ui/accordion";
import { Card }     from "../../ui/card";
import { Button }   from "../../ui/button";
import { Input }    from "../../ui/input";
import { Label }    from "../../ui/label";
import { Badge }    from "../../ui/badge";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast }    from "sonner";
import {
  LifeBuoy, Mail, MessageSquare, BookOpen,
  ExternalLink, Send, Loader2,
} from "lucide-react";

// ── FAQ data ───────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How does AI supervisor matching work?",
    a: "The algorithm scores every faculty–student pair across five factors: CGPA (30%), research-interest keyword overlap (35%), supervisor capacity (15%), technical skill match (10%), and university affiliation (10%). Your top-5 matches are shown in the Supervisor Match section.",
  },
  {
    q: "Can I switch supervisors after being matched?",
    a: "Yes — open a new match request from the Supervisor Match page. Your current supervisor is notified automatically, and the change takes effect once the new supervisor accepts. There is a 14-day cooling-off window between switches to prevent abuse.",
  },
  {
    q: "Where do I find my plagiarism reports?",
    a: "Go to Thesis Health → select a chapter → the plagiarism percentage and highlighted passages are shown in the Chapter Detail view. Reports are generated within 24 hours of each submission.",
  },
  {
    q: "How do I download my QR credential?",
    a: "Navigate to QR Credential from the sidebar. Click Generate if you haven't already, then use the Download PNG or Download PDF buttons. The credential is cryptographically signed — anyone can verify it by scanning the QR code.",
  },
  {
    q: "What does the Thesis Health score measure?",
    a: "It is a 0–100 composite of four sub-scores: Timeliness, Plagiarism Safety, Supervisor Feedback quality, and Milestone Completion Rate. Scores ≥ 80 are Excellent; 60–79 are At Risk; below 60 trigger a Critical flag and your supervisor is alerted.",
  },
  {
    q: "Why can't I see any internship listings?",
    a: "Internship visibility depends on your skills profile. Ensure you have added technical skills in Profile & Skills. Listings are ranked by skill-overlap with your profile, so the more skills you add, the more listings appear.",
  },
  {
    q: "How is my data stored and protected?",
    a: "All API communication is over HTTPS. Your CGPA, personal details, and uploaded files are visible only to you, your supervisor, and your institution's admin. You can export or request deletion of your data at any time from Settings → Account.",
  },
];

// ── Quick-link cards ────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { icon: BookOpen,     label: "User Guide",      sub: "Step-by-step documentation",   href: "#" },
  { icon: MessageSquare,label: "Community Forum", sub: "Ask questions, share tips",     href: "#" },
  { icon: Mail,         label: "Email Support",   sub: "support@edumatch.edu",          href: "mailto:support@edumatch.edu" },
];

// ── Component ──────────────────────────────────────────────────────────────────

export function HelpView() {
  // Contact form state
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [errors,   setErrors]   = useState<{ subject?: string; message?: string }>({});

  const MAX_MSG = 1000;

  function validate(): boolean {
    const e: typeof errors = {};
    if (!subject.trim())           e.subject = "Please enter a subject.";
    if (!message.trim())           e.message = "Please enter a message.";
    else if (message.trim().length < 20)
      e.message = "Message must be at least 20 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSend(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    // Simulate a short network delay
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    toast.success("Message sent! We'll reply to your registered email within 24 hours.");
    setSubject("");
    setMessage("");
    setErrors({});
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle
        title="Help Center"
        sub="Find quick answers, browse documentation, or contact the EduMatch support team."
      />

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl border bg-white hover-lift edu-card-shadow transition-colors group"
            style={{ borderColor: "var(--edu-border)", textDecoration: "none" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)" }}
            >
              <link.icon size={18} />
            </div>
            <div className="min-w-0">
              <div
                className="font-semibold text-sm flex items-center gap-1"
                style={{ color: "var(--edu-primary)" }}
              >
                {link.label}
                {link.href !== "#" && (
                  <ExternalLink size={11} className="opacity-50 group-hover:opacity-100" />
                )}
              </div>
              <div className="text-xs truncate" style={{ color: "var(--edu-light)" }}>
                {link.sub}
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* FAQ accordion */}
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy size={18} style={{ color: "var(--edu-primary)" }} />
            <h3 className="font-semibold" style={{ color: "var(--edu-primary)" }}>
              Frequently Asked Questions
            </h3>
          </div>
          <Accordion type="single" collapsible className="space-y-1">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`q${i}`}
                className="border rounded-xl px-3"
                style={{ borderColor: "var(--edu-border)" }}
              >
                <AccordionTrigger
                  className="text-sm text-left py-3"
                  style={{ color: "var(--edu-dark)", fontWeight: 500 }}
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent
                  className="text-sm pb-3 leading-relaxed"
                  style={{ color: "var(--edu-light)" }}
                >
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Contact form */}
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <div className="flex items-center gap-2 mb-4">
            <Send size={16} style={{ color: "var(--edu-primary)" }} />
            <h3 className="font-semibold" style={{ color: "var(--edu-primary)" }}>
              Contact Support
            </h3>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--edu-light)" }}>
            Can't find the answer? We typically respond within 24 hours on weekdays.
          </p>

          <form onSubmit={handleSend} noValidate className="space-y-4">
            {/* Subject */}
            <div>
              <Label htmlFor="help-subject">Subject</Label>
              <Input
                id="help-subject"
                value={subject}
                onChange={e => { setSubject(e.target.value); setErrors(v => ({ ...v, subject: undefined })); }}
                placeholder="e.g. Issue with thesis submission"
                className={`mt-1 ${errors.subject ? "border-red-400" : ""}`}
              />
              {errors.subject && (
                <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="help-message">Message</Label>
                <span
                  className="text-xs"
                  style={{ color: message.length > MAX_MSG * 0.9 ? "var(--edu-danger)" : "var(--edu-light)" }}
                >
                  {message.length} / {MAX_MSG}
                </span>
              </div>
              <textarea
                id="help-message"
                value={message}
                onChange={e => {
                  if (e.target.value.length <= MAX_MSG) setMessage(e.target.value);
                  setErrors(v => ({ ...v, message: undefined }));
                }}
                rows={6}
                placeholder="Describe your issue in detail — include any error messages or steps to reproduce."
                className={`w-full text-sm rounded-xl border px-3 py-2 resize-none
                  focus:outline-none focus:ring-2 focus:ring-[var(--edu-secondary)]
                  ${errors.message ? "border-red-400" : ""}`}
                style={{ borderColor: errors.message ? undefined : "var(--edu-border)", color: "var(--edu-dark)" }}
              />
              {errors.message && (
                <p className="text-xs mt-1" style={{ color: "var(--edu-danger)" }}>{errors.message}</p>
              )}
            </div>

            {/* Priority indicator */}
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--edu-light)" }}>
              <Badge
                className="text-xs"
                style={{ background: "rgba(87,197,182,0.15)", color: "var(--edu-primary)", border: "none" }}
              >
                Normal priority
              </Badge>
              Replies go to your registered email address.
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              style={{ background: "var(--edu-primary)" }}
              disabled={sending}
            >
              {sending
                ? <><Loader2 size={15} className="mr-2 animate-spin" /> Sending…</>
                : <><Send size={15} className="mr-2" /> Send Message</>}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
