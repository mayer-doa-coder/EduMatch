import { useEffect, useRef, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Send } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface Message {
  other_id:  number;
  body:      string;
  sent_at:   string;
  direction: "sent" | "received";
}

type Props = { userId: number };

export function MessagesPage({ userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState("");
  const [sending,  setSending]  = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  const authUser  = JSON.parse(localStorage.getItem("auth_user") ?? "{}");
  const profileId = authUser.profile_id as number | null;

  function load() {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_alumni_dashboard.php?alumni_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setMessages(d.messages ?? []); })
      .catch(() => toast.error("Could not load messages."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMsg() {
    const body = msg.trim();
    if (!body || !userId) return;

    // Determine a receiver: first reply to whoever sent us a message,
    // otherwise fall back to user_id=1 (admin/default contact).
    const lastReceived = [...messages].reverse().find(m => m.direction === "received");
    const receiverId   = lastReceived ? lastReceived.other_id : 1;

    setSending(true);
    try {
      const res = await fetch(`${API}/send_message.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: userId, receiver_id: receiverId, body }),
      });
      const d = await res.json();
      if (d.success) {
        // Optimistically append the sent message
        setMessages(prev => [
          ...prev,
          { other_id: receiverId, body, sent_at: d.sent_at ?? new Date().toISOString(), direction: "sent" },
        ]);
        setMsg("");
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
        Loading messages…
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Messages" />
      <Card className="rounded-2xl bg-white edu-card-shadow border-0 overflow-hidden h-[60vh] flex flex-col">

        {/* Message thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3" style={{ background: "var(--edu-bg)" }}>
          {messages.length === 0 && (
            <p className="text-center text-sm" style={{ color: "var(--edu-light)" }}>
              No messages yet. Send the first one!
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-sm p-3 rounded-2xl text-sm ${
                m.direction === "sent" ? "edu-gradient text-white ml-auto" : "bg-white"
              }`}
            >
              <div>{m.body}</div>
              <div
                className={`text-xs mt-1 ${m.direction === "sent" ? "opacity-70" : ""}`}
                style={{ color: m.direction === "sent" ? "inherit" : "var(--edu-light)" }}
              >
                {typeof m.sent_at === "string" ? m.sent_at.slice(0, 16).replace("T", " ") : m.sent_at}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Compose area */}
        <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--edu-border)" }}>
          <Input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Type a message…"
            disabled={sending}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
          />
          <Button
            onClick={sendMsg}
            disabled={sending || !msg.trim()}
            style={{ background: "var(--edu-primary)" }}
          >
            <Send size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
