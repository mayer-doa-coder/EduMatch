/**
 * Feedback — full conversation panel for supervisor → student feedback.
 *
 * Features
 * ─────────
 *  • Loads the supervisor's student list from the dashboard API.
 *  • Selecting a student loads the full message thread (get_messages.php).
 *  • Messages are shown as a chat-style timeline (supervisor on right,
 *    student on left) so context is always visible.
 *  • "Save Draft" persists the current message body to localStorage so the
 *    supervisor doesn't lose work on navigation.
 *  • "Send Feedback" POSTs to send_message.php and appends the new message
 *    to the thread immediately (optimistic update).
 *  • Character counter warns when approaching 1000-char limit.
 *  • Auto-scrolls to the latest message when the thread loads or updates.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Card }    from "../../ui/card";
import { Button }  from "../../ui/button";
import { Badge }   from "../../ui/badge";
import { SectionTitle } from "../../shared/SectionTitle";
import { EmptyState }   from "../../shared/EmptyState";
import { toast }   from "sonner";
import { MessageSquare, Send, Loader2, Clock, BookOpen, GraduationCap } from "lucide-react";

const API = "http://localhost/EduMatch/backend";
const MAX  = 1000;

// ── Types ──────────────────────────────────────────────────────────────────────

interface Student {
  student_id:   number;
  name:         string;
  thesis_title: string | null;
  cgpa:         number | null;
  user_id?:     number;
}

interface Message {
  message_id:  number;
  sender_id:   number;
  receiver_id: number;
  sender_name: string;
  body:        string;
  sent_at:     string;
}

type Props = { profileId: number | null };

// ── Helpers ────────────────────────────────────────────────────────────────────

function draftKey(supUid: number, stuId: number) {
  return `feedback_draft_${supUid}_${stuId}`;
}

function formatTime(dt: string) {
  const d = new Date(dt);
  if (isNaN(d.getTime())) return dt;
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

export function FeedbackPage({ profileId }: Props) {
  const [students,  setStudents]  = useState<Student[]>([]);
  const [selected,  setSelected]  = useState<Student | null>(null);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [comment,   setComment]   = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingMsgs,     setLoadingMsgs]     = useState(false);
  const [sending,   setSending]   = useState(false);

  const authUser    = (() => { try { return JSON.parse(localStorage.getItem("auth_user") ?? "{}"); } catch { return {}; } })();
  const supUserId   = authUser.user_id as number | undefined;

  const threadRef = useRef<HTMLDivElement>(null);

  // ── Load students ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!profileId) { setLoadingStudents(false); return; }
    fetch(`${API}/get_supervisor_dashboard.php?faculty_id=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.my_students)) {
          // Also expose user_id (needed for message fetch)
          // my_students doesn't include user_id by default — we'll resolve it lazily
          const mapped: Student[] = d.my_students.map((s: Student) => s);
          setStudents(mapped);
          if (mapped.length > 0) setSelected(mapped[0]);
        }
      })
      .catch(() => toast.error("Could not load students."))
      .finally(() => setLoadingStudents(false));
  }, [profileId]);

  // ── Load message thread when student changes ───────────────────────────
  const loadThread = useCallback(async (stu: Student) => {
    if (!supUserId) return;
    setLoadingMsgs(true);
    setMessages([]);

    try {
      // Resolve student user_id
      let stuUserId = stu.user_id;
      if (!stuUserId) {
        const pRes  = await fetch(`${API}/get_student_dashboard.php?student_id=${stu.student_id}`);
        const pData = await pRes.json();
        stuUserId   = pData?.student?.user_id ?? null;
        if (stuUserId) {
          // Cache it
          setStudents(prev => prev.map(s => s.student_id === stu.student_id ? { ...s, user_id: stuUserId } : s));
        }
      }

      if (!stuUserId) { toast.error("Could not resolve student ID."); return; }

      const res  = await fetch(`${API}/get_messages.php?user1_id=${supUserId}&user2_id=${stuUserId}`);
      const data = await res.json();
      if (data.success) setMessages(data.messages ?? []);
    } catch {
      toast.error("Could not load messages.");
    } finally {
      setLoadingMsgs(false);
    }
  }, [supUserId]);

  useEffect(() => {
    if (selected) {
      loadThread(selected);
      // Restore draft
      if (supUserId) {
        const saved = localStorage.getItem(draftKey(supUserId, selected.student_id)) ?? "";
        setComment(saved);
      }
    }
  }, [selected, loadThread, supUserId]);

  // Auto-scroll thread to bottom
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loadingMsgs]);

  // ── Send message ───────────────────────────────────────────────────────
  async function send(draft: boolean) {
    if (!selected || !comment.trim() || !supUserId) return;
    setSending(true);

    try {
      // Resolve student user_id
      let stuUserId = selected.user_id;
      if (!stuUserId) {
        const pRes  = await fetch(`${API}/get_student_dashboard.php?student_id=${selected.student_id}`);
        const pData = await pRes.json();
        stuUserId   = pData?.student?.user_id ?? null;
      }
      if (!stuUserId) { toast.error("Could not resolve student user ID."); return; }

      if (draft) {
        localStorage.setItem(draftKey(supUserId, selected.student_id), comment.trim());
        toast.success("Draft saved.");
        return;
      }

      const res  = await fetch(`${API}/send_message.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sender_id: supUserId, receiver_id: stuUserId, body: comment.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        // Optimistic append
        const newMsg: Message = {
          message_id:  Date.now(),
          sender_id:   supUserId,
          receiver_id: stuUserId,
          sender_name: authUser.name ?? "You",
          body:        comment.trim(),
          sent_at:     new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMsg]);
        // Clear draft
        localStorage.removeItem(draftKey(supUserId, selected.student_id));
        setComment("");
        toast.success("Feedback sent.");
      } else {
        toast.error(d.message ?? "Failed to send.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSending(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (loadingStudents) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        <Loader2 className="animate-spin mr-2" size={18} /> Loading students…
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6 fade-in-up">
        <SectionTitle title="Feedback & Messages" />
        <EmptyState
          icon={MessageSquare}
          title="No students assigned yet."
          description="Once students are assigned to you, you can send them feedback and messages here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in-up">
      <SectionTitle
        title="Feedback & Messages"
        sub="Send inline feedback or questions to your students."
      />

      {/* Student selector pills */}
      <div className="flex flex-wrap gap-2">
        {students.map(s => (
          <button
            key={s.student_id}
            onClick={() => setSelected(s)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border"
            style={{
              background:  selected?.student_id === s.student_id ? "var(--edu-primary)" : "white",
              color:       selected?.student_id === s.student_id ? "white" : "var(--edu-primary)",
              borderColor: selected?.student_id === s.student_id ? "var(--edu-primary)" : "var(--edu-border)",
            }}
          >
            {s.name}
            {selected?.student_id === s.student_id && messages.length > 0 && (
              <Badge
                className="text-xs ml-1"
                style={{ background: "rgba(255,255,255,0.25)", color: "white", border: "none" }}
              >
                {messages.length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <Card className="rounded-2xl bg-white edu-card-shadow border-0 overflow-hidden">
          {/* Student info header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between gap-3 flex-wrap"
            style={{ borderColor: "var(--edu-border)", background: "rgba(26,95,122,0.03)" }}
          >
            <div>
              <div className="font-bold" style={{ color: "var(--edu-primary)" }}>{selected.name}</div>
              <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: "var(--edu-light)" }}>
                {selected.cgpa !== null && (
                  <span className="flex items-center gap-1">
                    <GraduationCap size={11} /> CGPA {selected.cgpa}
                  </span>
                )}
                {selected.thesis_title && (
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} /> {selected.thesis_title}
                  </span>
                )}
              </div>
            </div>
            {messages.length > 0 && (
              <Badge style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)", border: "none" }}>
                {messages.length} message{messages.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Message thread */}
          <div
            ref={threadRef}
            className="p-4 overflow-y-auto space-y-3"
            style={{ minHeight: 200, maxHeight: 360 }}
          >
            {loadingMsgs ? (
              <div className="flex items-center justify-center py-8 text-sm" style={{ color: "var(--edu-light)" }}>
                <Loader2 className="animate-spin mr-2" size={16} /> Loading messages…
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <MessageSquare size={28} style={{ color: "var(--edu-border)" }} />
                <p className="text-sm" style={{ color: "var(--edu-light)" }}>
                  No messages yet. Start the conversation below.
                </p>
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.sender_id === supUserId;
                return (
                  <div
                    key={m.message_id}
                    className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Bubble */}
                    <div style={{ maxWidth: "72%" }}>
                      <div
                        className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                        style={{
                          background: isMine ? "var(--edu-primary)" : "var(--edu-bg)",
                          color:      isMine ? "white" : "var(--edu-dark)",
                          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        }}
                      >
                        {m.body}
                      </div>
                      <div
                        className={`text-xs mt-1 flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}
                        style={{ color: "var(--edu-light)" }}
                      >
                        <Clock size={10} />
                        {formatTime(m.sent_at)}
                        {!isMine && (
                          <span className="font-medium" style={{ color: "var(--edu-secondary)" }}>
                            · {m.sender_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Compose area */}
          <div className="px-4 pb-4 pt-2 border-t space-y-2" style={{ borderColor: "var(--edu-border)" }}>
            <div className="flex justify-between text-xs" style={{ color: "var(--edu-light)" }}>
              <span>Comment / Feedback</span>
              <span style={{ color: comment.length > MAX * 0.9 ? "var(--edu-danger)" : "var(--edu-light)" }}>
                {comment.length} / {MAX}
              </span>
            </div>
            <textarea
              value={comment}
              onChange={e => { if (e.target.value.length <= MAX) setComment(e.target.value); }}
              rows={4}
              className="w-full text-sm rounded-xl border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--edu-secondary)]"
              style={{ borderColor: "var(--edu-border)", color: "var(--edu-dark)" }}
              placeholder="Methodology section looks solid. Consider expanding Section 3 references…"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={sending || !comment.trim()}
                onClick={() => send(true)}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                className="rounded-full"
                style={{ background: "var(--edu-primary)" }}
                disabled={sending || !comment.trim()}
                onClick={() => send(false)}
              >
                {sending
                  ? <><Loader2 size={13} className="animate-spin mr-1" /> Sending…</>
                  : <><Send size={13} className="mr-1.5" /> Send Feedback</>}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
