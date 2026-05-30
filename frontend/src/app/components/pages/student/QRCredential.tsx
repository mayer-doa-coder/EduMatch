import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { CheckCircle2, Download } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";

const API = "http://localhost/EduMatch/backend";

type Props = { profileId: number | null };

export function QRCredential({ profileId }: Props) {
  const [student, setStudent] = useState<{ name: string; university: string; research_interest: string } | null>(null);
  const [skills, setSkills] = useState<{ skill_name: string; verified: boolean; verified_by_name: string | null }[]>([]);

  useEffect(() => {
    if (!profileId) return;
    fetch(`${API}/get_student_dashboard.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudent(d.student);
          setSkills((d.skills ?? []).filter((s: { verified: boolean }) => s.verified));
        }
      })
      .catch(() => {});
  }, [profileId]);

  const initials = student ? student.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() : "??";
  const credId = profileId ? `EM-2026-${(student?.name ?? "USER").split(" ").map(p => p[0]).join("")}-${String(profileId).padStart(4, "0")}` : "EM-2026-????";

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="QR Verifiable Credential" sub="Share or download a tamper-proof record of your verified skills." />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-8 rounded-2xl edu-gradient text-white edu-card-shadow border-0 text-center">
          <div className="text-sm opacity-80">EduMatch Verified Credential</div>
          <h2 style={{ fontWeight: 700 }} className="mt-1">{student?.name ?? "Loading…"}</h2>
          <div className="text-sm opacity-90">{student?.research_interest ?? "—"} · {student?.university ?? "—"}</div>
          <div className="mx-auto mt-6 w-48 h-48 bg-white p-3 rounded-2xl">
            <div className="w-full h-full grid grid-cols-12 grid-rows-12 gap-px">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} style={{ background: ((i * 7) % 5 === 0 || i % 3 === 0) ? "#1a5f7a" : "transparent" }} />
              ))}
            </div>
          </div>
          <div className="mt-4 text-sm opacity-90">ID: {credId}</div>
          <div className="mt-4 flex gap-2 justify-center">
            <Button style={{ background: "var(--edu-accent)" }}><Download size={16} className="mr-2" /> Download</Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">Share</Button>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Verified Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map(s => (
              <Badge key={s.skill_name} className="rounded-full" style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>
                <CheckCircle2 size={12} className="mr-1" /> {s.skill_name}
              </Badge>
            ))}
            {skills.length === 0 && <span style={{ color: "var(--edu-light)" }}>No verified skills yet.</span>}
          </div>
          {skills.length > 0 && (
            <>
              <h3 className="mt-6" style={{ color: "var(--edu-primary)" }}>Faculty Signature</h3>
              <div className="mt-3 p-4 rounded-xl border flex items-center gap-3" style={{ borderColor: "var(--edu-border)" }}>
                <Avatar>
                  <AvatarFallback className="edu-gradient text-white">
                    {skills[0].verified_by_name?.split(" ").map(p => p[0]).join("").slice(0, 2) ?? "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div style={{ fontWeight: 600 }}>{skills[0].verified_by_name ?? "Faculty"}</div>
                  <div className="text-sm" style={{ color: "var(--edu-light)" }}>Verified</div>
                </div>
                <CheckCircle2 className="ml-auto" style={{ color: "#28a745" }} />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
