import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../ui/table";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface Milestone {
  name: string;
  due_date: string;
  submission_date: string | null;
  plagiarism_score: number;
}
interface Project {
  project_id: number;
  title: string;
  status: string;
  health_score: number;
  milestones: Milestone[];
}

type Props = { profileId: number | null };

export function ThesisSubmission({ profileId }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ milestone_name: "", due_date: "", plagiarism_score: "0" });

  const activeProject = projects.find(p => p.status === "active") ?? projects[0];

  function loadDashboard() {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_student_dashboard.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProjects(d.thesis); })
      .catch(() => toast.error("Could not load thesis data."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadDashboard(); }, [profileId]);

  async function handleSubmit() {
    if (!activeProject) return toast.error("No active project found.");
    if (!form.milestone_name.trim()) return toast.error("Milestone name is required.");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/submit_milestone.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: activeProject.project_id,
          milestone_name: form.milestone_name,
          due_date: form.due_date || new Date().toISOString().slice(0, 10),
          plagiarism_score: parseFloat(form.plagiarism_score) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Submitted! New health score: ${data.health_score}`);
        setForm({ milestone_name: "", due_date: "", plagiarism_score: "0" });
        setLoading(true);
        loadDashboard();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading thesis…</div>;

  const milestones = activeProject?.milestones ?? [];
  const daysToNext = 12;

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Thesis Submission" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0 space-y-4">
          <h3 style={{ color: "var(--edu-primary)" }}>Submit New Milestone</h3>
          {activeProject ? (
            <>
              <div>
                <Label>Project</Label>
                <Input readOnly value={activeProject.title} className="mt-1 bg-gray-50" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Milestone Name</Label>
                  <Input className="mt-1" placeholder="e.g. Chapter 3" value={form.milestone_name}
                    onChange={e => setForm(f => ({ ...f, milestone_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" className="mt-1" value={form.due_date}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Plagiarism Score (%)</Label>
                <Input type="number" min="0" max="100" step="0.1" className="mt-1" value={form.plagiarism_score}
                  onChange={e => setForm(f => ({ ...f, plagiarism_score: e.target.value }))} />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} style={{ background: "var(--edu-primary)" }}>
                {submitting ? "Submitting…" : "Submit Milestone"}
              </Button>
            </>
          ) : (
            <p style={{ color: "var(--edu-light)" }}>No active thesis project found.</p>
          )}

          <h3 className="mt-4" style={{ color: "var(--edu-primary)" }}>Submission History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Milestone</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Plagiarism</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((m, i) => {
                const status = m.submission_date ? "Submitted" : new Date(m.due_date) < new Date() ? "Overdue" : "Pending";
                return (
                  <TableRow key={i}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.due_date}</TableCell>
                    <TableCell>{m.submission_date ?? "—"}</TableCell>
                    <TableCell>{m.submission_date ? `${m.plagiarism_score}%` : "—"}</TableCell>
                    <TableCell>
                      <Badge style={{
                        background: status === "Submitted" ? "rgba(40,167,69,0.12)" : status === "Overdue" ? "rgba(220,53,69,0.12)" : "rgba(23,162,184,0.12)",
                        color: status === "Submitted" ? "#28a745" : status === "Overdue" ? "#dc3545" : "#17a2b8",
                      }}>{status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {milestones.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center" style={{ color: "var(--edu-light)" }}>No milestones yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 rounded-2xl edu-gradient text-white edu-card-shadow border-0">
          <div className="opacity-80 text-sm">Project Health</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{activeProject?.health_score ?? 0}/100</div>
          <div className="opacity-90 capitalize">{activeProject?.status ?? "—"}</div>
          <div className="mt-4 p-3 rounded-xl bg-white/15">
            <div className="text-sm">Milestones done</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              {milestones.filter(m => m.submission_date).length} / {milestones.length}
            </div>
          </div>
          <Textarea placeholder="Notes for your supervisor…" className="mt-4 bg-white/10 text-white placeholder:text-white/60 border-white/20" />
        </Card>
      </div>
    </div>
  );
}
