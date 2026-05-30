import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Users2, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { StatCard } from "../../shared/StatCard";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface AlumniData {
  profile: { alumni_id: number; expertise: string; company: string; name: string; email: string };
  alumni_network: { mentor_id: number; mentor_name: string; mentee_id: number; mentee_name: string; mentee_expertise: string }[];
  verified_students: { student_id: number; name: string; skill_name: string }[];
  messages: { other_id: number; body: string; sent_at: string; direction: string }[];
}

type Props = { userId: number; profileId: number | null };

export function AlumniOverview({ profileId }: Props) {
  const [data, setData] = useState<AlumniData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_alumni_dashboard.php?alumni_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else toast.error(d.message); })
      .catch(() => toast.error("Could not load alumni dashboard."))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading dashboard…</div>;
  if (!data?.profile) return <div className="p-8 text-center" style={{ color: "var(--edu-light)" }}>No alumni profile found.</div>;

  const { profile, alumni_network, verified_students, messages } = data;

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Alumni Dashboard" sub={`Welcome back, ${profile.name}.`} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Network Connections" value={String(alumni_network.length)} icon={Users2} />
        <StatCard label="Messages" value={String(messages.length)} icon={CalendarIcon} color="#57c5b6" />
        <StatCard label="Company" value={profile.company} sub={profile.expertise} icon={Sparkles} color="#ff9f29" />
      </div>

      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="Alumni Network" />
        <div className="space-y-3">
          {alumni_network.slice(0, 5).map((conn, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--edu-border)" }}>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="edu-gradient text-white">
                    {conn.mentee_name.split(" ").map(p => p[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div style={{ fontWeight: 600 }}>{conn.mentee_name}</div>
                  <div className="text-xs" style={{ color: "var(--edu-light)" }}>{conn.mentee_expertise}</div>
                </div>
              </div>
              <div className="text-sm" style={{ color: "var(--edu-primary)", fontWeight: 600 }}>Connect</div>
            </div>
          ))}
          {alumni_network.length === 0 && <p style={{ color: "var(--edu-light)" }}>No network connections yet.</p>}
        </div>
      </Card>

      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <SectionTitle title="Students with Verified Skills" />
        <div className="space-y-2">
          {verified_students.slice(0, 5).map(s => (
            <div key={`${s.student_id}-${s.skill_name}`} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div className="text-sm" style={{ color: "var(--edu-primary)" }}>{s.skill_name}</div>
            </div>
          ))}
          {verified_students.length === 0 && <p style={{ color: "var(--edu-light)" }}>No verified students found.</p>}
        </div>
      </Card>
    </div>
  );
}
