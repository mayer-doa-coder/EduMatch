import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Search } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface Supervisor {
  faculty_id: number;
  supervisor_name: string;
  expertise: string;
  quota: number;
  current_student_count: number;
  match_score: number;
}

type Props = { userId: number; profileId: number | null };

export function SupervisorMatch({ profileId }: Props) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [minMatch, setMinMatch] = useState([50]);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/supervisor_match.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSupervisors(d.supervisors); else toast.error(d.message); })
      .catch(() => toast.error("Could not load supervisors."))
      .finally(() => setLoading(false));
  }, [profileId]);

  const filtered = supervisors.filter(s =>
    s.match_score >= minMatch[0] &&
    (s.supervisor_name.toLowerCase().includes(q.toLowerCase()) ||
      s.expertise.toLowerCase().includes(q.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading supervisors…</div>;

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Supervisor Matching" sub="Ranked by compatibility with your CGPA and research interest." />
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
            <Label>Minimum match score: {minMatch[0]}</Label>
            <Slider value={minMatch} onValueChange={setMinMatch} min={0} max={100} step={1} className="mt-3" />
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(s => (
          <Card key={s.faculty_id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="edu-gradient text-white">
                  {s.supervisor_name.split(" ").map(p => p[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{s.supervisor_name}</div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>{s.expertise}</div>
              </div>
              <Badge className="text-base px-3 py-1.5 rounded-full" style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>
                {s.match_score}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>Quota</div>
                <div style={{ fontWeight: 700 }}>{s.quota}</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>Current</div>
                <div style={{ fontWeight: 700 }}>{s.current_student_count}</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>Open</div>
                <div style={{ fontWeight: 700, color: (s.quota - s.current_student_count) > 0 ? "#28a745" : "#dc3545" }}>
                  {s.quota - s.current_student_count}
                </div>
              </div>
            </div>
            <Button
              onClick={() => toast.success(`Application sent to ${s.supervisor_name}`)}
              disabled={s.current_student_count >= s.quota}
              className="mt-4 w-full rounded-xl"
              style={{ background: "var(--edu-primary)" }}
            >
              {s.current_student_count >= s.quota ? "Quota Full" : "Apply"}
            </Button>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="md:col-span-2 p-10 rounded-2xl text-center" style={{ color: "var(--edu-light)" }}>
            No supervisors match these filters.
          </Card>
        )}
      </div>
    </div>
  );
}
