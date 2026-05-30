import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";
const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:30", "16:00"];

interface Interview {
  interview_id: number;
  slot_datetime: string;
  status: string;
  role_title: string;
  company_name: string;
}

type Props = { userId: number };

export function InterviewScheduler({ userId }: Props) {
  const [scheduled, setScheduled] = useState<Interview[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [slot,      setSlot]      = useState<string | null>(null);
  const [booking,   setBooking]   = useState(false);
  const [dialogTime, setDialogTime] = useState<string | null>(null);

  const authUser  = JSON.parse(localStorage.getItem("auth_user") ?? "{}");
  const profileId = authUser.profile_id as number | null;

  function load() {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/interview.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setScheduled(d.interviews ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [profileId]);

  async function book(time: string) {
    if (!profileId || !slot) return;
    const datetime = `${slot.split("T")[0] || new Date(slot).toISOString().split("T")[0]} ${time}:00`;
    setBooking(true);
    try {
      const res = await fetch(`${API}/interview.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: profileId, slot_datetime: datetime }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Interview booked!");
        setDialogTime(null);
        setSlot(null);
        load();
      } else {
        toast.error(d.message ?? "Booking failed.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setBooking(false);
    }
  }

  const today = new Date();
  const days  = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Interview Scheduler" sub="Pick a slot that works for you." />

      {/* Booked interviews */}
      {!loading && scheduled.length > 0 && (
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 className="mb-4" style={{ color: "var(--edu-primary)", fontWeight: 600 }}>Your Scheduled Interviews</h3>
          <div className="space-y-3">
            {scheduled.map(iv => (
              <div key={iv.interview_id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--edu-bg)" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{iv.role_title} — {iv.company_name}</div>
                  <div className="text-sm" style={{ color: "var(--edu-light)" }}>{iv.slot_datetime}</div>
                </div>
                <Badge style={{ background: "rgba(40,167,69,0.15)", color: "var(--edu-success)" }} className="capitalize">
                  {iv.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Date + time picker */}
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <h3 className="mb-4" style={{ color: "var(--edu-primary)", fontWeight: 600 }}>Book a New Slot</h3>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => {
            const key = d.toDateString();
            return (
              <button key={i} onClick={() => setSlot(key)}
                className="p-3 rounded-xl text-center transition"
                style={{
                  background: slot === key ? "var(--edu-primary)" : "var(--edu-bg)",
                  color:      slot === key ? "white" : "var(--edu-dark)",
                }}>
                <div className="text-xs opacity-70">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{d.getDate()}</div>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        {slot && (
          <>
            <h4 className="mt-6 mb-3" style={{ color: "var(--edu-primary)" }}>
              Available times — {slot}
            </h4>
            <div className="flex flex-wrap gap-2">
              {TIMES.map(t => (
                <Dialog key={t} open={dialogTime === t} onOpenChange={open => setDialogTime(open ? t : null)}>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 rounded-xl border hover-lift text-sm"
                      style={{ borderColor: "var(--edu-border)" }}>
                      {t}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Confirm Interview</DialogTitle></DialogHeader>
                    <p>Book interview on <strong>{slot}</strong> at <strong>{t}</strong>?</p>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogTime(null)}>Cancel</Button>
                      <Button
                        style={{ background: "var(--edu-primary)" }}
                        disabled={booking}
                        onClick={() => book(t)}
                      >
                        {booking ? "Booking…" : "Confirm"}
                      </Button>
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
