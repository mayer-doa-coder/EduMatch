import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { BookOpen } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { currentStudent, courses } from "../../edu-data";
import { toast } from "sonner";

export function SkillGap() {
  const required = ["Python", "PyTorch", "Statistics", "Research Writing", "SQL", "Linear Algebra"];
  const have = currentStudent.skills;
  const missing = required.filter(r => !have.includes(r));

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Skill Gap Analysis" sub="Compared against Dr. Ahmed Rahman's research focus." />
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Required Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {required.map(s => <Badge key={s} className="rounded-full" style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)" }}>{s}</Badge>)}
          </div>
        </Card>
        <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Existing Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {have.map(s => <Badge key={s} className="rounded-full" style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>{s}</Badge>)}
          </div>
        </Card>
        <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Missing Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.length === 0 && <Badge>None — you're set!</Badge>}
            {missing.map(s => <Badge key={s} className="rounded-full" style={{ background: "rgba(220,53,69,0.12)", color: "#dc3545" }}>{s}</Badge>)}
          </div>
        </Card>
      </div>
      <SectionTitle title="Suggested Free Courses" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <Card key={c.id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
            <div className="w-12 h-12 rounded-xl edu-gradient flex items-center justify-center text-white"><BookOpen /></div>
            <h3 className="mt-3" style={{ color: "var(--edu-primary)" }}>{c.name}</h3>
            <p className="text-sm" style={{ color: "var(--edu-light)" }}>{c.provider}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline">{c.duration}</Badge>
              <Badge variant="outline">{c.difficulty}</Badge>
            </div>
            <Button className="w-full mt-4" style={{ background: "var(--edu-accent)" }} onClick={() => toast.success(`Enrolled in ${c.name}`)}>Enroll Free</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
