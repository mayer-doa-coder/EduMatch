import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

type Props = { userId: number };

export function JobPostingForm({ userId: _userId }: Props) {
  const [form, setForm] = useState({
    role_title: "", required_skills: "", salary: "", deadline: "", description: "",
    company_name: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handlePost() {
    if (!form.role_title.trim()) return toast.error("Job title is required.");
    if (!form.required_skills.trim()) return toast.error("Required skills are required.");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/post_job.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "post", ...form }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Job posted! ID: ${data.internship_id}`);
        setForm({ role_title: "", required_skills: "", salary: "", deadline: "", description: "", company_name: "" });
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Post failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Post a New Job" />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-3xl space-y-4">
        <div>
          <Label>Company Name</Label>
          <Input placeholder="DataPeak Labs" className="mt-1" value={form.company_name} onChange={set("company_name")} />
        </div>
        <div>
          <Label>Job Title</Label>
          <Input placeholder="ML Intern" className="mt-1" value={form.role_title} onChange={set("role_title")} />
        </div>
        <div>
          <Label>Required Skills (comma separated)</Label>
          <Input placeholder="Python, PyTorch, SQL" className="mt-1" value={form.required_skills} onChange={set("required_skills")} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Salary (BDT/month)</Label>
            <Input placeholder="35000" className="mt-1" value={form.salary} onChange={set("salary")} />
          </div>
          <div>
            <Label>Deadline</Label>
            <Input type="date" className="mt-1" value={form.deadline} onChange={set("deadline")} />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={5} className="mt-1" placeholder="Role overview…" value={form.description} onChange={set("description")} />
        </div>
        <Button style={{ background: "var(--edu-primary)" }} onClick={handlePost} disabled={submitting}>
          {submitting ? "Posting…" : "Post Job"}
        </Button>
      </Card>
    </div>
  );
}
