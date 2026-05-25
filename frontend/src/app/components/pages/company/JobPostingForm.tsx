import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

export function JobPostingForm() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Post a New Job" />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-3xl space-y-4">
        <div><Label>Title</Label><Input placeholder="ML Intern" className="mt-1" /></div>
        <div><Label>Required skills (comma separated)</Label><Input placeholder="Python, PyTorch, SQL" className="mt-1" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Salary</Label><Input placeholder="৳35,000/mo" className="mt-1" /></div>
          <div><Label>Deadline</Label><Input type="date" className="mt-1" /></div>
        </div>
        <div><Label>Description</Label><Textarea rows={5} className="mt-1" placeholder="Role overview..." /></div>
        <Button style={{ background: "var(--edu-primary)" }} onClick={() => toast.success("Job posted")}>Post Job</Button>
      </Card>
    </div>
  );
}
