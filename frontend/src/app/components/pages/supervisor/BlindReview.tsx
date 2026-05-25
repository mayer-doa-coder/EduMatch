import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { SectionTitle } from "../../shared/SectionTitle";
import { blindApplicants } from "../../edu-data";
import { toast } from "sonner";

export function BlindReview() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Blind Applicant Review" sub="Identifying details are hidden to reduce bias." />
      <div className="grid md:grid-cols-2 gap-4">
        {blindApplicants.map(a => (
          <Card key={a.id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>Applicant Code</div>
                <div style={{ fontWeight: 700, color: "var(--edu-primary)" }}>{a.code}</div>
              </div>
              <Badge style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>Match {a.match}%</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}><div className="text-xs" style={{ color: "var(--edu-light)" }}>CGPA</div><div style={{ fontWeight: 700 }}>{a.cgpa}</div></div>
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}><div className="text-xs" style={{ color: "var(--edu-light)" }}>Interest</div><div style={{ fontWeight: 700 }}>{a.interests.join(", ")}</div></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {a.skills.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button onClick={() => toast.success(`${a.code} accepted`)} style={{ background: "#28a745" }}>Accept</Button>
              <Button onClick={() => toast.message(`${a.code} waitlisted`)} variant="outline">Waitlist</Button>
              <Button onClick={() => toast.error(`${a.code} rejected`)} variant="outline" style={{ color: "#dc3545", borderColor: "#dc3545" }}>Reject</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
