import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Search } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { supervisors } from "../../edu-data";
import { toast } from "sonner";

export function SupervisorMatch() {
  const [q, setQ] = useState("");
  const [minMatch, setMinMatch] = useState([70]);
  const filtered = supervisors.filter(s =>
    s.match >= minMatch[0] &&
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.expertise.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Supervisor Matching" sub="Ranked by AI compatibility based on your profile." />
      <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3" size={16} style={{ color: "var(--edu-light)" }} />
              <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Name or expertise" />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Minimum match: {minMatch[0]}%</Label>
            <Slider value={minMatch} onValueChange={setMinMatch} min={50} max={100} step={1} className="mt-3" />
          </div>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(s => (
          <Card key={s.id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14"><AvatarFallback className="edu-gradient text-white">{s.photo}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{s.name}</div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>{s.expertise}</div>
              </div>
              <Badge className="text-base px-3 py-1.5 rounded-full" style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>{s.match}%</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>Quota</div>
                <div style={{ fontWeight: 700 }}>{s.quota}</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>Current</div>
                <div style={{ fontWeight: 700 }}>{s.current}</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>Open</div>
                <div style={{ fontWeight: 700, color: s.quota - s.current > 0 ? "#28a745" : "#dc3545" }}>{s.quota - s.current}</div>
              </div>
            </div>
            <Button onClick={() => toast.success(`Application sent to ${s.name}`)} disabled={s.current >= s.quota} className="mt-4 w-full rounded-xl" style={{ background: "var(--edu-primary)" }}>
              {s.current >= s.quota ? "Quota Full" : "Apply"}
            </Button>
          </Card>
        ))}
        {filtered.length === 0 && <Card className="md:col-span-2 p-10 rounded-2xl text-center" style={{ color: "var(--edu-light)" }}>No supervisors match these filters.</Card>}
      </div>
    </div>
  );
}
