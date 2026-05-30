import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Building2 } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface OpenInternship {
  internship_id: number;
  role_title: string;
  company_name: string;
  salary: string;
  deadline: string;
  required_skills: string;
}
interface MyApplication {
  internship_id: number;
  role_title: string;
  company_name: string;
  salary: string;
  deadline: string;
  required_skills: string;
  status: string;
  applied_date: string;
}

type Props = { userId: number };

export function Internships({ userId }: Props) {
  const [open, setOpen] = useState<OpenInternship[]>([]);
  const [applied, setApplied] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);

  const profileId = (() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "{}").profile_id; } catch { return null; }
  })();

  function load() {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/apply_internship.php?student_id=${profileId}&action=list`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setOpen(d.open_internships ?? []);
          setApplied(d.my_applications ?? []);
        } else {
          toast.error(d.message);
        }
      })
      .catch(() => toast.error("Could not load internships."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [userId]);

  async function applyTo(internship_id: number, company: string) {
    if (!profileId) return;
    setActing(internship_id);
    try {
      const res = await fetch(`${API}/apply_internship.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply", student_id: profileId, internship_id }),
      });
      const d = await res.json();
      if (d.success) { toast.success(`Applied to ${company}`); load(); }
      else toast.error(d.message);
    } catch { toast.error("Application failed."); }
    finally { setActing(null); }
  }

  async function withdraw(internship_id: number, company: string) {
    if (!profileId) return;
    setActing(internship_id);
    try {
      const res = await fetch(`${API}/apply_internship.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw", student_id: profileId, internship_id }),
      });
      const d = await res.json();
      if (d.success) { toast.success(`Withdrawn from ${company}`); load(); }
      else toast.error(d.message);
    } catch { toast.error("Withdraw failed."); }
    finally { setActing(null); }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading internships…</div>;

  const appliedIds = new Set(applied.map(a => a.internship_id));

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Internship Matching" sub="Open positions matched to your skills." />

      {applied.length > 0 && (
        <>
          <SectionTitle title="My Applications" />
          <div className="grid md:grid-cols-2 gap-4">
            {applied.map(a => (
              <Card key={a.internship_id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: "var(--edu-primary)" }}>
                    <Building2 size={20} />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{a.role_title}</div>
                    <div className="text-sm" style={{ color: "var(--edu-light)" }}>{a.company_name} · Applied {a.applied_date}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.required_skills.split(",").map(s => <Badge key={s} variant="outline">{s.trim()}</Badge>)}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge style={{
                        background: a.status === "accepted" ? "rgba(40,167,69,0.12)" : a.status === "rejected" ? "rgba(220,53,69,0.12)" : "rgba(23,162,184,0.12)",
                        color: a.status === "accepted" ? "#28a745" : a.status === "rejected" ? "#dc3545" : "#17a2b8",
                      }}>{a.status}</Badge>
                      <Button size="sm" variant="outline" onClick={() => withdraw(a.internship_id, a.company_name)} disabled={acting === a.internship_id}>
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <SectionTitle title="Open Internships" />
      <div className="grid md:grid-cols-2 gap-4">
        {open.map(i => (
          <Card key={i.internship_id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: "var(--edu-primary)" }}>
                <Building2 />
              </div>
              <div className="flex-1">
                <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{i.role_title}</div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>{i.company_name}</div>
                <div className="mt-1 text-sm" style={{ color: "var(--edu-light)" }}>৳{i.salary}/mo · Deadline: {i.deadline}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {i.required_skills.split(",").map(s => <Badge key={s} variant="outline">{s.trim()}</Badge>)}
                </div>
                <div className="mt-4 flex gap-2">
                  {appliedIds.has(i.internship_id)
                    ? <Button disabled className="flex-1" variant="outline">Applied</Button>
                    : <Button className="flex-1" style={{ background: "var(--edu-accent)" }}
                        disabled={acting === i.internship_id}
                        onClick={() => applyTo(i.internship_id, i.company_name)}>
                        {acting === i.internship_id ? "Applying…" : "Apply"}
                      </Button>
                  }
                  <Button variant="outline" className="flex-1">View</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {open.length === 0 && (
          <Card className="md:col-span-2 p-10 rounded-2xl text-center" style={{ color: "var(--edu-light)" }}>
            No open internships right now.
          </Card>
        )}
      </div>
    </div>
  );
}
