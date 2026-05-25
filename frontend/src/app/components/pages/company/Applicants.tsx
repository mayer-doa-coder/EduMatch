import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { FileText, Send } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { blindApplicants } from "../../edu-data";
import { toast } from "sonner";

export function CompanyApplicants() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Applicants" />
      <div className="grid md:grid-cols-2 gap-4">
        {blindApplicants.map(a => (
          <Card key={a.id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback className="edu-gradient text-white">{a.code.slice(-2)}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div style={{ fontWeight: 600 }}>{a.code}</div>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>CGPA {a.cgpa} · {a.skills.join(", ")}</div>
              </div>
              <Badge style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>{a.match}%</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" className="flex-1"><FileText size={16} className="mr-2" /> Resume</Button>
              <Button className="flex-1" style={{ background: "var(--edu-accent)" }} onClick={() => toast.success("Interview invite sent")}><Send size={16} className="mr-2" /> Invite</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
