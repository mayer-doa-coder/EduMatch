import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { FileText, Send } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface Applicant { student_id: number; name: string; cgpa: number; research_interest: string; technical_skills: string; code: string }

type Props = { userId: number };

export function CompanyApplicants({ userId: _userId }: Props) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/get_admin_dashboard.php`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) { toast.error(d.message); return; }
        const students = d.no_applications ?? [];
        setApplicants(students.map((s: { student_id: number; name: string }) => ({
          ...s, cgpa: 0, research_interest: "—", technical_skills: "", code: `APX-${s.student_id}`,
        })));
      })
      .catch(() => toast.error("Could not load applicants."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading applicants…</div>;

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Applicants" sub="Students who have not yet applied — potential candidates." />
      <div className="grid md:grid-cols-2 gap-4">
        {applicants.map(a => (
          <Card key={a.student_id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="edu-gradient text-white">
                  {a.name.split(" ").map(p => p[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div style={{ fontWeight: 600 }}>{a.code}</div>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>{a.name}</div>
              </div>
              <Badge style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>Available</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" className="flex-1"><FileText size={16} className="mr-2" /> Resume</Button>
              <Button className="flex-1" style={{ background: "var(--edu-accent)" }} onClick={() => toast.success(`Interview invite sent to ${a.code}`)}><Send size={16} className="mr-2" /> Invite</Button>
            </div>
          </Card>
        ))}
        {applicants.length === 0 && (
          <Card className="md:col-span-2 p-10 rounded-2xl text-center" style={{ color: "var(--edu-light)" }}>
            All students have applied to at least one internship.
          </Card>
        )}
      </div>
    </div>
  );
}
