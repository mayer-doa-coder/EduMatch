import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Send } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface Message { other_id: number; body: string; sent_at: string; direction: string }

type Props = { userId: number };

export function MessagesPage({ userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const profileId = JSON.parse(localStorage.getItem("auth_user") || "{}").profile_id;
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_alumni_dashboard.php?alumni_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setMessages(d.messages ?? []); else toast.error(d.message); })
      .catch(() => toast.error("Could not load messages."))
      .finally(() => setLoading(false));
  }, [userId]);

  const sent = messages.filter(m => m.direction === "sent");
  const received = messages.filter(m => m.direction === "received");

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading messages…</div>;

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Messages" />
      <Card className="rounded-2xl bg-white edu-card-shadow border-0 overflow-hidden h-[60vh] flex flex-col">
        <div className="flex-1 p-5 overflow-y-auto space-y-3" style={{ background: "var(--edu-bg)" }}>
          {messages.length === 0 && (
            <p className="text-center text-sm" style={{ color: "var(--edu-light)" }}>No messages yet.</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`max-w-sm p-3 rounded-2xl text-sm ${m.direction === "sent" ? "edu-gradient text-white ml-auto" : "bg-white"}`}>
              <div>{m.body}</div>
              <div className={`text-xs mt-1 ${m.direction === "sent" ? "opacity-70" : ""}`} style={{ color: m.direction === "sent" ? "inherit" : "var(--edu-light)" }}>
                {m.sent_at}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--edu-border)" }}>
          <Input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message…"
            onKeyDown={e => { if (e.key === "Enter" && msg.trim()) { toast.success("Sent"); setMsg(""); } }} />
          <Button onClick={() => { if (msg.trim()) { toast.success("Sent"); setMsg(""); } }} style={{ background: "var(--edu-primary)" }}>
            <Send size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
