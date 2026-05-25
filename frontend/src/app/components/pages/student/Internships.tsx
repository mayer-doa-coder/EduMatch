import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Building2 } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { internships } from "../../edu-data";
import { toast } from "sonner";

export function Internships() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Internship Matching" sub="Companies ranked by your skills and interests." />
      <div className="grid md:grid-cols-2 gap-4">
        {internships.map(i => (
          <Card key={i.id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: "var(--edu-primary)" }}>
                <Building2 />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{i.role}</div>
                    <div className="text-sm" style={{ color: "var(--edu-light)" }}>{i.company}</div>
                  </div>
                  <Badge style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>{i.match}%</Badge>
                </div>
                <div className="mt-2 text-sm" style={{ color: "var(--edu-light)" }}>{i.salary}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {i.skills.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" style={{ background: "var(--edu-accent)" }} onClick={() => toast.success(`Applied to ${i.company}`)}>Apply</Button>
                  <Button variant="outline" className="flex-1">View</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
