import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface Student {
  student_id: number;
  name:       string;
  thesis_title: string | null;
  cgpa:       number | null;
}

type Props = { profileId: number | null };

export function FeedbackPage({ profileId }: Props) {
  const [students,  setStudents]  = useState<Student[]>([]);
  const [selected,  setSelected]  = useState<Student | null>(null);
  const [comment,   setComment]   = useState("");
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);

  const authUser = JSON.parse(localStorage.getItem("auth_user") ?? "{}");
  const userId   = authUser.user_id as number | undefined;

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_supervisor_dashboard.php?faculty_id=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.my_students)) {
          setStudents(d.my_students);
          if (d.my_students.length > 0) setSelected(d.my_students[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId]);

  async function send(draft: boolean) {
    if (!selected || !comment.trim() || !userId) return;
    setSending(true);

    // Resolve the student's user_id from their profile
    try {
      const profileRes = await fetch(
        `${API}/get_student_dashboard.php?student_id=${selected.student_id}`
      );
      const profileData = await profileRes.json();
      const receiverId = profileData?.student?.user_id;

      if (!receiverId) {
        toast.error("Could not resolve student user ID.");
        return;
      }

      const res = await fetch(`${API}/send_message.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id:   userId,
          receiver_id: receiverId,
          body:        comment.trim(),
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(draft ? "Draft saved." : "Feedback sent to student.");
        setComment("");
      } else {
        toast.error(d.message ?? "Failed to send.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        Loading students…
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6 fade-in-up">
        <SectionTitle title="Feedback & Comments" />
        <Card className="p-10 rounded-2xl bg-white edu-card-shadow border-0 text-center">
          <p style={{ color: "var(--edu-light)" }}>No students assigned to you yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Feedback & Comments" />

      {/* Student selector */}
      <div className="flex flex-wrap gap-2">
        {students.map(s => (
          <button
            key={s.student_id}
            onClick={() => { setSelected(s); setComment(""); }}
            className="px-4 py-2 rounded-full text-sm font-medium transition"
            style={{
              background:  selected?.student_id === s.student_id ? "var(--edu-primary)" : "white",
              color:       selected?.student_id === s.student_id ? "white" : "var(--edu-primary)",
              border:      "1px solid var(--edu-border)",
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {selected && (
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 space-y-4">
          <div>
            <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{selected.name}</div>
            {selected.thesis_title && (
              <div className="text-sm mt-0.5" style={{ color: "var(--edu-light)" }}>
                Thesis: {selected.thesis_title}
              </div>
            )}
            {selected.cgpa !== null && (
              <div className="text-sm" style={{ color: "var(--edu-light)" }}>
                CGPA: {selected.cgpa}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Comment / Feedback
            </label>
            <Textarea
              rows={5}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Methodology section is well-defined. Consider adding more references in Chapter 3…"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={sending || !comment.trim()}
              onClick={() => send(true)}
            >
              Save Draft
            </Button>
            <Button
              style={{ background: "var(--edu-primary)" }}
              disabled={sending || !comment.trim()}
              onClick={() => send(false)}
            >
              {sending ? "Sending…" : "Send Feedback"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
