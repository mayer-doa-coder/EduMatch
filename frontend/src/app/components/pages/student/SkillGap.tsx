import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { BookOpen } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface SkillData {
  skills_you_have: { skill_name: string; verified: boolean; verified_by_name: string | null }[];
  gap_courses: { course_id: number; name: string; provider: string; duration: string; difficulty: string; skill_tag: string }[];
  practice_courses: { course_id: number; name: string; provider: string; duration: string; difficulty: string; skill_tag: string }[];
  missing_for_internship: string[];
  internship_title: string | null;
}

type Props = { userId: number };

export function SkillGap({ userId }: Props) {
  const [data, setData] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
    const profileId = authUser.profile_id;
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/skill_gap.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else toast.error(d.message); })
      .catch(() => toast.error("Could not load skill gap."))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Analysing skills…</div>;
  if (!data) return <div className="p-8 text-center" style={{ color: "var(--edu-light)" }}>No skill data found.</div>;

  const { skills_you_have, gap_courses, practice_courses } = data;
  const verified = skills_you_have.filter(s => s.verified);
  const unverified = skills_you_have.filter(s => !s.verified);
  const allCourses = [...gap_courses, ...practice_courses].filter(
    (c, i, arr) => arr.findIndex(x => x.course_id === c.course_id) === i
  );

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Skill Gap Analysis" sub="Based on your skills profile vs. available courses." />

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Verified Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {verified.map(s => (
              <Badge key={s.skill_name} className="rounded-full" style={{ background: "rgba(40,167,69,0.12)", color: "#28a745" }}>
                {s.skill_name} ✓
              </Badge>
            ))}
            {verified.length === 0 && <span className="text-sm" style={{ color: "var(--edu-light)" }}>None verified yet.</span>}
          </div>
        </Card>

        <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Unverified Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {unverified.map(s => (
              <Badge key={s.skill_name} className="rounded-full" style={{ background: "rgba(255,193,7,0.18)", color: "#a76f00" }}>
                {s.skill_name}
              </Badge>
            ))}
            {unverified.length === 0 && <span className="text-sm" style={{ color: "var(--edu-light)" }}>All skills verified!</span>}
          </div>
        </Card>

        <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Skill Gaps</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {gap_courses.length === 0
              ? <Badge className="rounded-full">None — you're set!</Badge>
              : gap_courses.map(c => (
                  <Badge key={c.skill_tag} className="rounded-full" style={{ background: "rgba(220,53,69,0.12)", color: "#dc3545" }}>
                    {c.skill_tag}
                  </Badge>
                ))}
          </div>
        </Card>
      </div>

      <SectionTitle title="Recommended Courses" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCourses.map(c => (
          <Card key={c.course_id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
            <div className="w-12 h-12 rounded-xl edu-gradient flex items-center justify-center text-white"><BookOpen /></div>
            <h3 className="mt-3" style={{ color: "var(--edu-primary)" }}>{c.name}</h3>
            <p className="text-sm" style={{ color: "var(--edu-light)" }}>{c.provider}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline">{c.duration}</Badge>
              <Badge variant="outline">{c.difficulty}</Badge>
              <Badge variant="outline" style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)" }}>{c.skill_tag}</Badge>
            </div>
            <Button className="w-full mt-4" style={{ background: "var(--edu-accent)" }} onClick={() => toast.success(`Enrolled in ${c.name}`)}>
              Enroll Free
            </Button>
          </Card>
        ))}
        {allCourses.length === 0 && (
          <Card className="md:col-span-3 p-10 rounded-2xl text-center" style={{ color: "var(--edu-light)" }}>
            You're fully covered! No courses needed right now.
          </Card>
        )}
      </div>
    </div>
  );
}
