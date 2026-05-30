import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface BlindApplicant {
  code: string;
  student_id: number;
  cgpa: number;
  research_interest: string;
  technical_skills: string;
}

type Props = { profileId: number | null };

export function BlindReview({ profileId }: Props) {
  const [applicants, setApplicants] = useState<BlindApplicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_supervisor_dashboard.php?faculty_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setApplicants(d.blind_applicants ?? []); else toast.error(d.message); })
      .catch(() => toast.error("Could not load applicants."))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading applicants…</div>;

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Blind Applicant Review" sub="Identifying details are hidden to reduce bias." />
      <div className="grid md:grid-cols-2 gap-4">
        {applicants.map(a => (
          <Card key={a.student_id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>Applicant Code</div>
                <div style={{ fontWeight: 700, color: "var(--edu-primary)" }}>{a.code}</div>
              </div>
              <Badge style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>CGPA {a.cgpa}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>CGPA</div>
                <div style={{ fontWeight: 700 }}>{a.cgpa}</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>Research Interest</div>
                <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>{a.research_interest}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(a.technical_skills ?? "").split(",").filter(Boolean).map(s => (
                <Badge key={s} variant="outline">{s.trim()}</Badge>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button onClick={() => toast.success(`${a.code} accepted`)} style={{ background: "#28a745" }}>Accept</Button>
              <Button onClick={() => toast.message(`${a.code} waitlisted`)} variant="outline">Waitlist</Button>
              <Button onClick={() => toast.error(`${a.code} rejected`)} variant="outline" style={{ color: "#dc3545", borderColor: "#dc3545" }}>Reject</Button>
            </div>
          </Card>
        ))}
        {applicants.length === 0 && (
          <Card className="md:col-span-2 p-10 rounded-2xl text-center" style={{ color: "var(--edu-light)" }}>
            No unassigned applicants from your university.
          </Card>
        )}
      </div>
    </div>
  );
}
