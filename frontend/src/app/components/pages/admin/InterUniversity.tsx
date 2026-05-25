import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import { Building2 } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { universities } from "../../edu-data";

export function InterUniversity() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Inter-University Manager" sub="Configure cross-university collaboration." />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {universities.map(u => (
          <Card key={u.name} className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
            <div className="w-12 h-12 rounded-xl edu-gradient flex items-center justify-center text-white"><Building2 /></div>
            <h3 className="mt-3" style={{ color: "var(--edu-primary)" }}>{u.name}</h3>
            <div className="mt-2 text-sm" style={{ color: "var(--edu-light)" }}>{u.students} students · {u.projects} projects</div>
            <div className="mt-3 flex items-center justify-between">
              <Badge style={{ background: u.status === "Active" ? "rgba(40,167,69,0.12)" : "rgba(255,193,7,0.18)", color: u.status === "Active" ? "#28a745" : "#a76f00" }}>{u.status}</Badge>
              <Switch defaultChecked={u.status === "Active"} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
