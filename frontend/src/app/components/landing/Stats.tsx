import { Card } from "../ui/card";
import { BookOpen, Briefcase, Building2, Users } from "lucide-react";
import { Counter } from "./Counter";

export function LandingStats() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <Card className="rounded-3xl edu-gradient text-white p-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div><Users className="mx-auto mb-2" /><div style={{ fontSize: "1.8rem", fontWeight: 700 }}><Counter to={12500} suffix="+" /></div><div className="opacity-80">Students Matched</div></div>
          <div><BookOpen className="mx-auto mb-2" /><div style={{ fontSize: "1.8rem", fontWeight: 700 }}><Counter to={3400} suffix="+" /></div><div className="opacity-80">Theses Tracked</div></div>
          <div><Briefcase className="mx-auto mb-2" /><div style={{ fontSize: "1.8rem", fontWeight: 700 }}><Counter to={1280} suffix="+" /></div><div className="opacity-80">Internships</div></div>
          <div><Building2 className="mx-auto mb-2" /><div style={{ fontSize: "1.8rem", fontWeight: 700 }}><Counter to={48} /></div><div className="opacity-80">Universities</div></div>
        </Card>
      </div>
    </section>
  );
}
