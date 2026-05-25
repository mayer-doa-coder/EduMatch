import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Plus, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";

export function MentorshipPage() {
  const days = Array.from({ length: 7 });
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Mentorship" sub="Set your availability and accept session bookings." />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Availability — Next 7 Days</h3>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {days.map((_, i) => {
              const d = new Date(); d.setDate(d.getDate() + i);
              return (
                <div key={i} className="p-3 rounded-xl text-center" style={{ background: "var(--edu-bg)" }}>
                  <div className="text-xs" style={{ color: "var(--edu-light)" }}>{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div style={{ fontWeight: 700 }}>{d.getDate()}</div>
                  <div className="mt-2 space-y-1">
                    {["6 PM", "8 PM"].map(t => <div key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>{t}</div>)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 style={{ color: "var(--edu-primary)" }}>Quick Actions</h3>
          <div className="mt-3 space-y-2">
            <Button className="w-full" style={{ background: "var(--edu-primary)" }}><Plus size={16} className="mr-2" /> Add slot</Button>
            <Button className="w-full" variant="outline"><MessageSquare size={16} className="mr-2" /> Open chat</Button>
            <Button className="w-full" variant="outline"><CalendarIcon size={16} className="mr-2" /> Sync calendar</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
