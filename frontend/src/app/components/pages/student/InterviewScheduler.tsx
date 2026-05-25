import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

export function InterviewScheduler() {
  const [slot, setSlot] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  });
  const times = ["09:00", "10:00", "11:00", "13:00", "14:30", "16:00"];

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Interview Scheduler" sub="Pick a slot that works for you." />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <button key={i} onClick={() => setSlot(d.toDateString())} className="p-3 rounded-xl text-center transition" style={{ background: slot === d.toDateString() ? "var(--edu-primary)" : "var(--edu-bg)", color: slot === d.toDateString() ? "white" : "var(--edu-dark)" }}>
              <div className="text-xs opacity-70">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{d.getDate()}</div>
            </button>
          ))}
        </div>
        {slot && (
          <>
            <h3 className="mt-6" style={{ color: "var(--edu-primary)" }}>Available times — {slot}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {times.map(t => (
                <Dialog key={t} open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 rounded-xl border hover-lift" style={{ borderColor: "var(--edu-border)" }} onClick={() => setOpen(true)}>{t}</button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Confirm Interview</DialogTitle></DialogHeader>
                    <p>Booking interview on <strong>{slot}</strong> at <strong>{t}</strong>?</p>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button style={{ background: "var(--edu-primary)" }} onClick={() => { setOpen(false); toast.success("Interview booked"); }}>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
