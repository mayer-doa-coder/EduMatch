import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { SectionTitle } from "../../shared/SectionTitle";
import { UploadArea } from "../../shared/UploadArea";
import { currentStudent } from "../../edu-data";

export function StudentProfile() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Profile & Skills" sub="Keep your profile updated for better matches." />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 p-6 rounded-2xl bg-white edu-card-shadow border-0 text-center">
          <Avatar className="w-24 h-24 mx-auto"><AvatarFallback className="edu-gradient text-white text-2xl">FL</AvatarFallback></Avatar>
          <h3 className="mt-3" style={{ color: "var(--edu-primary)" }}>{currentStudent.name}</h3>
          <p style={{ color: "var(--edu-light)" }}>{currentStudent.department} · {currentStudent.university}</p>
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
              <div><Label>CGPA</Label><Input defaultValue={currentStudent.cgpa.toString()} className="mt-1" /></div>
              <div><Label>University</Label><Input defaultValue={currentStudent.university} className="mt-1" /></div>
              <div><Label>Department</Label><Input defaultValue={currentStudent.department} className="mt-1" /></div>
              <div><Label>Email</Label><Input defaultValue={currentStudent.email} className="mt-1" /></div>
            </TabsContent>
            <TabsContent value="skills" className="mt-4 space-y-4">
              <div>
                <Label>Skills</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentStudent.skills.map(s => <Badge key={s} className="rounded-full" style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)" }}>{s}</Badge>)}
                  <Badge className="rounded-full cursor-pointer" style={{ background: "var(--edu-bg)", color: "var(--edu-light)" }}>+ Add</Badge>
                </div>
              </div>
              <div>
                <Label>Research Interests</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentStudent.interests.map(s => <Badge key={s} className="rounded-full" style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>{s}</Badge>)}
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
