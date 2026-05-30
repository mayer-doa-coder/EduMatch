import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import { Building2 } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface UniStat { name: string; projects: number; statuses: string[] }

export function InterUniversity() {
  const [unis, setUnis] = useState<UniStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/get_admin_dashboard.php`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) { toast.error(d.message); return; }
        const rows: { uni_name: string; status: string; count: number }[] = d.by_university_status ?? [];
        const map: Record<string, UniStat> = {};
        rows.forEach(r => {
          if (!map[r.uni_name]) map[r.uni_name] = { name: r.uni_name, projects: 0, statuses: [] };
          map[r.uni_name].projects += r.count;
          map[r.uni_name].statuses.push(r.status);
        });
        setUnis(Object.values(map));
      })
      .catch(() => toast.error("Could not load university data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading universities…</div>;

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Inter-University Manager" sub="Configure cross-university collaboration." />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {unis.map(u => (
          <Card key={u.name} className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
            <div className="w-12 h-12 rounded-xl edu-gradient flex items-center justify-center text-white"><Building2 /></div>
            <h3 className="mt-3" style={{ color: "var(--edu-primary)" }}>{u.name}</h3>
            <div className="mt-2 text-sm" style={{ color: "var(--edu-light)" }}>{u.projects} project{u.projects !== 1 ? "s" : ""}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {u.statuses.map(s => (
                <Badge key={s} className="text-xs" variant="outline" style={{ color: "var(--edu-primary)" }}>{s}</Badge>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>Active</Badge>
              <Switch defaultChecked onCheckedChange={() => toast.success(`${u.name} toggled`)} />
            </div>
          </Card>
        ))}
        {unis.length === 0 && (
          <Card className="col-span-4 p-10 rounded-2xl text-center" style={{ color: "var(--edu-light)" }}>No university data.</Card>
        )}
      </div>
    </div>
  );
}
