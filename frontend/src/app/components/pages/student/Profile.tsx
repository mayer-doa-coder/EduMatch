import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { SectionTitle } from "../../shared/SectionTitle";
import { UploadArea } from "../../shared/UploadArea";

const API = "http://localhost/EduMatch/backend";

interface StudentData {
  name: string; email: string; cgpa: number; university: string;
  research_interest: string; technical_skills: string;
}
interface Skill { skill_name: string; verified: boolean; verified_by_name: string | null }

type Props = { userId: number; profileId: number | null };

export function StudentProfile({ profileId }: Props) {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_student_dashboard.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setStudent(d.student); setSkills(d.skills ?? []); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading profile…</div>;

  const initials = student ? student.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() : "??";

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Profile & Skills" sub="Keep your profile updated for better matches." />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 p-6 rounded-2xl bg-white edu-card-shadow border-0 text-center">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarFallback className="edu-gradient text-white text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <h3 className="mt-3" style={{ color: "var(--edu-primary)" }}>{student?.name ?? "—"}</h3>
          <p style={{ color: "var(--edu-light)" }}>{student?.research_interest ?? "—"} · {student?.university ?? "—"}</p>
          <Button className="mt-4 w-full" variant="outline">Edit profile</Button>
        </Card>

        <Card className="md:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <Tabs defaultValue="academic">
            <TabsList>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
            <TabsContent value="academic" className="grid md:grid-cols-2 gap-4 mt-4">
              <div><Label>CGPA</Label><Input readOnly defaultValue={student?.cgpa?.toString() ?? ""} className="mt-1" /></div>
              <div><Label>University</Label><Input readOnly defaultValue={student?.university ?? ""} className="mt-1" /></div>
              <div><Label>Research Interest</Label><Input readOnly defaultValue={student?.research_interest ?? ""} className="mt-1" /></div>
              <div><Label>Email</Label><Input readOnly defaultValue={student?.email ?? ""} className="mt-1" /></div>
            </TabsContent>
            <TabsContent value="skills" className="mt-4 space-y-4">
              <div>
                <Label>Skills</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map(s => (
                    <Badge key={s.skill_name} className="rounded-full"
                      style={{ background: s.verified ? "rgba(40,167,69,0.12)" : "rgba(26,95,122,0.1)", color: s.verified ? "#28a745" : "var(--edu-primary)" }}>
                      {s.skill_name}{s.verified ? " ✓" : ""}
                    </Badge>
                  ))}
                  {skills.length === 0 && <span style={{ color: "var(--edu-light)" }}>No skills listed.</span>}
                  <Badge className="rounded-full cursor-pointer" style={{ background: "var(--edu-bg)", color: "var(--edu-light)" }}>+ Add</Badge>
                </div>
              </div>
              <div>
                <Label>Technical Skills (raw)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(student?.technical_skills ?? "").split(",").filter(Boolean).map(s => (
                    <Badge key={s} className="rounded-full" style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>{s.trim()}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="files" className="mt-4 space-y-3">
              <UploadArea label="Upload Resume (PDF)" />
              <UploadArea label="Upload Certificates" />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
