import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Send } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";
import { mentees } from "../../edu-data";
import { toast } from "sonner";

export function MessagesPage() {
  const [selected, setSelected] = useState(0);
  const [msg, setMsg] = useState("");
  const convs = mentees.map((m, i) => ({ ...m, id: i }));
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Messages" />
      <Card className="rounded-2xl bg-white edu-card-shadow border-0 overflow-hidden grid md:grid-cols-3 h-[60vh]">
        <div className="border-r overflow-y-auto" style={{ borderColor: "var(--edu-border)" }}>
          {convs.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)} className="w-full text-left p-4 border-b hover:bg-gray-50" style={{ borderColor: "var(--edu-border)", background: selected === c.id ? "var(--edu-bg)" : "white" }}>
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback className="edu-gradient text-white">{c.name.split(" ").map(p => p[0]).join("")}</AvatarFallback></Avatar>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="text-xs" style={{ color: "var(--edu-light)" }}>{c.topic}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="md:col-span-2 flex flex-col">
          <div className="flex-1 p-5 overflow-y-auto space-y-3" style={{ background: "var(--edu-bg)" }}>
            <div className="max-w-xs p-3 rounded-2xl bg-white">Hi! Could you review my CV before Friday?</div>
            <div className="max-w-xs p-3 rounded-2xl text-white edu-gradient ml-auto">Sure — send it over and I'll respond by tomorrow.</div>
            <div className="max-w-xs p-3 rounded-2xl bg-white">Thank you so much! Just sent.</div>
          </div>
          <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--edu-border)" }}>
            <Input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." />
            <Button onClick={() => { if (msg) { toast.success("Sent"); setMsg(""); } }} style={{ background: "var(--edu-primary)" }}><Send size={16} /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
