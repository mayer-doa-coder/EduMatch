/**
 * InterviewScheduler — book, view and cancel interview slots.
 *
 * Bugs fixed vs the previous version
 * ────────────────────────────────────
 *  • Date format bug: previously used `d.toDateString()` ("Tue Jun 02 2026")
 *    which MySQL cannot parse. Now we store ISO dates ("2026-06-02") as keys
 *    and assemble the slot as "YYYY-MM-DD HH:MM:SS" — exactly what MySQL expects.
 *  • Internship picker: backend now requires an internship_id that belongs to
 *    one of the student's own applications, not a random open internship. The
 *    scheduler fetches applied internships and lets the student choose which
 *    role the interview is for.
 *  • Double-book prevention: the backend guards against same-slot conflicts and
 *    duplicate interviews per application; the frontend mirrors both checks.
 *  • Cancel: each scheduled interview has a "Cancel" button that sends
 *    action=cancel to the backend and immediately updates the local list.
 *  • Consistency / persistence: all data is stored in the Interviews table;
 *    on page load we always fetch fresh from the API (with a mock fallback).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from "../../ui/dialog";
import { Card }   from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge }  from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { SectionTitle } from "../../shared/SectionTitle";
import { EmptyState }   from "../../shared/EmptyState";
import { toast } from "sonner";
import {
  CalendarDays, Clock, Building2, CheckCircle2,
  X, AlertCircle, CalendarX, Loader2,
} from "lucide-react";

const API = "http://localhost/EduMatch/backend";

// Available time slots for every bookable day
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "13:00", "14:30", "16:00", "17:00",
];

// ── Types ──────────────────────────────────────────────────────────────────────

interface Interview {
  interview_id:  number;
  internship_id: number;
  slot_datetime: string;  // "YYYY-MM-DD HH:MM:SS"
  status:        string;
  role_title:    string;
  company_name:  string;
  salary?:       string;
  deadline?:     string;
}

interface Application {
  application_id: number;
  internship_id:  number;
  role_title:     string;
  company_name:   string;
  status:         string;
}

type Props = { userId: number };

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format "2026-06-02 09:00:00" → "Tue, Jun 2 · 09:00" */
function formatSlot(dt: string): string {
  const d = new Date(dt.replace(" ", "T"));
  if (isNaN(d.getTime())) return dt;
  return d.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Format "2026-06-02" date key → "Tue, 2 Jun" */
function formatDayLabel(iso: string): { weekday: string; day: number; month: string } {
  const d = new Date(iso + "T00:00:00");
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    day:     d.getDate(),
    month:   d.toLocaleDateString(undefined, { month: "short" }),
  };
}

/** Is this ISO date today? */
function isToday(iso: string): boolean {
  return iso === new Date().toISOString().split("T")[0];
}

function statusStyle(s: string) {
  if (s === "scheduled")  return { bg: "rgba(40,167,69,0.12)",  color: "var(--edu-success)" };
  if (s === "cancelled")  return { bg: "rgba(220,53,69,0.12)",  color: "var(--edu-danger)"  };
  if (s === "completed")  return { bg: "rgba(87,197,182,0.15)", color: "var(--edu-secondary)" };
  return { bg: "rgba(23,162,184,0.12)", color: "var(--edu-info)" };
}

// ── Mock fallback ──────────────────────────────────────────────────────────────

function buildMockInterviews(): Interview[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const ds = tomorrow.toISOString().split("T")[0];
  return [
    {
      interview_id:  1,
      internship_id: 1,
      slot_datetime: `${ds} 10:00:00`,
      status:        "scheduled",
      role_title:    "ML Intern",
      company_name:  "DataPeak Labs",
    },
  ];
}

function buildMockApplications(): Application[] {
  return [
    { application_id: 1, internship_id: 1, role_title: "ML Intern",        company_name: "DataPeak Labs",  status: "pending" },
    { application_id: 2, internship_id: 2, role_title: "Data Analyst",      company_name: "Brainstation BD", status: "pending" },
    { application_id: 3, internship_id: 3, role_title: "Backend Intern",    company_name: "TechSpark",       status: "accepted" },
  ];
}

// ── Component ──────────────────────────────────────────────────────────────────

export function InterviewScheduler({ userId }: Props) {
  const [scheduled,   setScheduled]   = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading,      setLoading]    = useState(true);

  // Booking wizard state
  const [selectedDay,         setSelectedDay]         = useState<string | null>(null);   // "YYYY-MM-DD"
  const [selectedTime,        setSelectedTime]        = useState<string | null>(null);   // "HH:MM"
  const [selectedInternship,  setSelectedInternship]  = useState<string>("");            // internship_id as string
  const [confirmOpen,         setConfirmOpen]         = useState(false);
  const [booking,             setBooking]             = useState(false);

  // Cancel state
  const [cancelId,  setCancelId]  = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const profileId: number | null = (() => {
    try { return JSON.parse(localStorage.getItem("auth_user") ?? "{}").profile_id ?? null; }
    catch { return null; }
  })();

  // ── Load data ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!profileId) {
      setScheduled(buildMockInterviews());
      setApplications(buildMockApplications());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [ivRes, appRes] = await Promise.all([
        fetch(`${API}/interview.php?student_id=${profileId}`),
        fetch(`${API}/apply_internship.php?student_id=${profileId}&action=list`),
      ]);
      const ivData  = await ivRes.json();
      const appData = await appRes.json();

      setScheduled(ivData.success  ? (ivData.interviews      ?? []) : buildMockInterviews());
      setApplications(appData.success ? (appData.my_applications ?? []) : buildMockApplications());
    } catch {
      setScheduled(buildMockInterviews());
      setApplications(buildMockApplications());
      toast.error("Could not reach server — showing demo data.");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { load(); }, [load]);

  // ── Generate next 14 bookable days (ISO "YYYY-MM-DD") ─────────────────
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split("T")[0];   // "YYYY-MM-DD"
    });
  }, []);

  // ── Derived: which slots are already booked on the selected day ────────
  const bookedTimesOnDay = useMemo(() => {
    if (!selectedDay) return new Set<string>();
    return new Set(
      scheduled
        .filter(iv => iv.status === "scheduled" && iv.slot_datetime.startsWith(selectedDay))
        .map(iv => iv.slot_datetime.slice(11, 16)),  // "HH:MM"
    );
  }, [selectedDay, scheduled]);

  // ── Applications eligible for scheduling (not already scheduled) ───────
  const eligibleApplications = useMemo(() => {
    const scheduledIds = new Set(
      scheduled.filter(iv => iv.status === "scheduled").map(iv => iv.internship_id),
    );
    return applications.filter(
      a => a.status !== "rejected" && !scheduledIds.has(a.internship_id),
    );
  }, [applications, scheduled]);

  // ── Book ───────────────────────────────────────────────────────────────
  async function book() {
    if (!profileId || !selectedDay || !selectedTime || !selectedInternship) return;

    // Compose MySQL-compatible datetime: "YYYY-MM-DD HH:MM:SS"
    const slot = `${selectedDay} ${selectedTime}:00`;

    setBooking(true);
    try {
      const res = await fetch(`${API}/interview.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          action:         "book",
          student_id:     profileId,
          internship_id:  parseInt(selectedInternship, 10),
          slot_datetime:  slot,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Interview scheduled!");
        setConfirmOpen(false);
        setSelectedDay(null);
        setSelectedTime(null);
        setSelectedInternship("");
        load();
      } else {
        toast.error(d.message ?? "Booking failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBooking(false);
    }
  }

  // ── Cancel ─────────────────────────────────────────────────────────────
  async function cancelInterview() {
    if (!profileId || !cancelId) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API}/interview.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          action:       "cancel",
          student_id:   profileId,
          interview_id: cancelId,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Interview cancelled.");
        // Optimistically update local state so the UI is instant
        setScheduled(prev =>
          prev.map(iv =>
            iv.interview_id === cancelId ? { ...iv, status: "cancelled" } : iv,
          ),
        );
        setCancelId(null);
      } else {
        toast.error(d.message ?? "Could not cancel interview.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setCancelling(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        <Loader2 className="animate-spin mr-2" size={18} /> Loading scheduler…
      </div>
    );
  }

  const upcomingInterviews = scheduled.filter(iv => iv.status === "scheduled");
  const pastInterviews     = scheduled.filter(iv => iv.status !== "scheduled");

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle
        title="Interview Scheduler"
        sub="Book a time slot for your internship interviews."
      />

      {/* ── Upcoming Interviews ────────────────────────────────────────── */}
      {upcomingInterviews.length > 0 && (
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 className="font-semibold mb-4" style={{ color: "var(--edu-primary)" }}>
            Upcoming Interviews ({upcomingInterviews.length})
          </h3>
          <div className="space-y-3">
            {upcomingInterviews.map(iv => {
              const { bg, color } = statusStyle(iv.status);
              return (
                <div
                  key={iv.interview_id}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border"
                  style={{ borderColor: "var(--edu-border)", background: "rgba(87,197,182,0.04)" }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)" }}
                  >
                    <Building2 size={18} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: "var(--edu-dark)" }}>
                      {iv.role_title}
                      <span className="font-normal" style={{ color: "var(--edu-light)" }}>
                        {" "}— {iv.company_name}
                      </span>
                    </div>
                    <div
                      className="text-xs mt-0.5 flex items-center gap-1"
                      style={{ color: "var(--edu-light)" }}
                    >
                      <Clock size={11} /> {formatSlot(iv.slot_datetime)}
                    </div>
                  </div>

                  {/* Badge + cancel */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge style={{ background: bg, color, border: "none" }} className="capitalize">
                      {iv.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs h-7"
                      style={{ borderColor: "var(--edu-danger)", color: "var(--edu-danger)" }}
                      onClick={() => setCancelId(iv.interview_id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Book new slot ──────────────────────────────────────────────── */}
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <h3 className="font-semibold mb-5" style={{ color: "var(--edu-primary)" }}>
          Book a New Slot
        </h3>

        {/* No eligible applications */}
        {eligibleApplications.length === 0 && (
          <EmptyState
            icon={CalendarX}
            title="No applications available to schedule."
            description={
              applications.length === 0
                ? "Apply to internships first, then come back to book your interview slot."
                : "All your active applications already have a scheduled interview."
            }
            action={
              applications.length === 0
                ? { label: "Browse Internships", onClick: () => window.history.back() }
                : undefined
            }
          />
        )}

        {eligibleApplications.length > 0 && (
          <div className="space-y-6">

            {/* Step 1 — Pick a date ───────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: "var(--edu-light)" }}>
                Step 1 — Choose a date
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {days.map(iso => {
                  const { weekday, day, month } = formatDayLabel(iso);
                  const isSelected = selectedDay === iso;
                  const today      = isToday(iso);
                  return (
                    <button
                      key={iso}
                      onClick={() => { setSelectedDay(iso); setSelectedTime(null); }}
                      className="flex flex-col items-center p-2 rounded-xl transition-colors text-center"
                      style={{
                        background: isSelected
                          ? "var(--edu-primary)"
                          : today
                            ? "rgba(87,197,182,0.12)"
                            : "var(--edu-bg)",
                        color: isSelected ? "white" : "var(--edu-dark)",
                        outline: today && !isSelected ? "1.5px solid var(--edu-secondary)" : "none",
                      }}
                    >
                      <span className="text-xs opacity-70">{weekday}</span>
                      <span className="font-bold text-base leading-tight">{day}</span>
                      <span className="text-xs opacity-70">{month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 — Pick a time ───────────────────────────────── */}
            {selectedDay && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3"
                  style={{ color: "var(--edu-light)" }}>
                  Step 2 — Choose a time slot
                </p>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map(t => {
                    const taken      = bookedTimesOnDay.has(t);
                    const isSelected = selectedTime === t;
                    return (
                      <button
                        key={t}
                        disabled={taken}
                        onClick={() => setSelectedTime(isSelected ? null : t)}
                        className="px-4 py-2 rounded-xl border text-sm transition-all"
                        style={{
                          background:  isSelected ? "var(--edu-primary)" : taken ? "var(--edu-bg)" : "white",
                          color:       isSelected ? "white" : taken ? "var(--edu-light)" : "var(--edu-dark)",
                          borderColor: isSelected ? "var(--edu-primary)" : "var(--edu-border)",
                          opacity:     taken ? 0.5 : 1,
                          cursor:      taken ? "not-allowed" : "pointer",
                          textDecoration: taken ? "line-through" : "none",
                        }}
                        title={taken ? "Slot already booked" : undefined}
                      >
                        {t}
                        {taken && " ✕"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 — Select internship ─────────────────────────── */}
            {selectedDay && selectedTime && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: "var(--edu-light)" }}>
                  Step 3 — Select internship
                </p>
                <Select
                  value={selectedInternship}
                  onValueChange={setSelectedInternship}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Which position is this interview for?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {eligibleApplications.map(a => (
                      <SelectItem
                        key={a.internship_id}
                        value={String(a.internship_id)}
                        className="rounded-xl"
                      >
                        {a.role_title} — {a.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Confirm button */}
            {selectedDay && selectedTime && selectedInternship && (
              <div>
                {/* Summary pill */}
                <div
                  className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
                  style={{ background: "rgba(87,197,182,0.10)", color: "var(--edu-primary)" }}
                >
                  <CalendarDays size={15} />
                  <span>
                    <strong>{formatDayLabel(selectedDay).weekday}, {formatDayLabel(selectedDay).day} {formatDayLabel(selectedDay).month}</strong>
                    {" at "}
                    <strong>{selectedTime}</strong>
                    {" for "}
                    <strong>
                      {eligibleApplications.find(a => String(a.internship_id) === selectedInternship)?.role_title}
                    </strong>
                  </span>
                </div>
                <Button
                  className="w-full rounded-full"
                  style={{ background: "var(--edu-primary)" }}
                  onClick={() => setConfirmOpen(true)}
                >
                  <CheckCircle2 size={15} className="mr-2" /> Confirm Booking
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Past / cancelled interviews ────────────────────────────────── */}
      {pastInterviews.length > 0 && (
        <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <h3 className="font-semibold mb-4" style={{ color: "var(--edu-primary)" }}>
            Past & Cancelled
          </h3>
          <div className="space-y-2">
            {pastInterviews.map(iv => {
              const { bg, color } = statusStyle(iv.status);
              return (
                <div
                  key={iv.interview_id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl"
                  style={{ background: "var(--edu-bg)" }}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--edu-dark)" }}>
                      {iv.role_title} — {iv.company_name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--edu-light)" }}>
                      {formatSlot(iv.slot_datetime)}
                    </div>
                  </div>
                  <Badge
                    className="shrink-0 capitalize"
                    style={{ background: bg, color, border: "none" }}
                  >
                    {iv.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* No interviews at all */}
      {scheduled.length === 0 && (
        <Card className="p-10 rounded-2xl bg-white edu-card-shadow border-0">
          <EmptyState
            icon={CalendarDays}
            title="No interviews scheduled yet."
            description="Apply to internships, then book a slot for your interview here."
          />
        </Card>
      )}

      {/* ── Confirm booking dialog ──────────────────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={open => !open && setConfirmOpen(false)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--edu-primary)" }}>
              Confirm Interview Booking
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            {[
              {
                label: "Position",
                value: eligibleApplications.find(a => String(a.internship_id) === selectedInternship)
                  ? `${eligibleApplications.find(a => String(a.internship_id) === selectedInternship)!.role_title} — ${eligibleApplications.find(a => String(a.internship_id) === selectedInternship)!.company_name}`
                  : "—",
              },
              {
                label: "Date",
                value: selectedDay
                  ? `${formatDayLabel(selectedDay).weekday}, ${formatDayLabel(selectedDay).day} ${formatDayLabel(selectedDay).month}`
                  : "—",
              },
              { label: "Time", value: selectedTime ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <span style={{ color: "var(--edu-light)" }}>{label}</span>
                <span className="font-medium text-right" style={{ color: "var(--edu-dark)" }}>{value}</span>
              </div>
            ))}
          </div>

          <div
            className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{ background: "rgba(26,95,122,0.06)", color: "var(--edu-light)" }}
          >
            <AlertCircle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--edu-primary)" }} />
            Once booked, you can cancel from the "Upcoming Interviews" list. The company will see your slot.
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmOpen(false)}
              disabled={booking}
            >
              Back
            </Button>
            <Button
              className="rounded-full flex-1"
              style={{ background: "var(--edu-primary)" }}
              disabled={booking}
              onClick={book}
            >
              {booking
                ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Booking…</>
                : <><CheckCircle2 size={14} className="mr-1.5" /> Confirm</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel confirmation dialog ─────────────────────────────────── */}
      <Dialog open={cancelId !== null} onOpenChange={open => !open && setCancelId(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--edu-danger)" }}>
              Cancel Interview?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "var(--edu-light)" }}>
            {cancelId && (() => {
              const iv = scheduled.find(i => i.interview_id === cancelId);
              return iv
                ? `Your interview for "${iv.role_title}" at ${formatSlot(iv.slot_datetime)} will be cancelled. This cannot be undone.`
                : "This interview will be cancelled.";
            })()}
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setCancelId(null)}
              disabled={cancelling}
            >
              Keep It
            </Button>
            <Button
              className="rounded-full flex-1"
              style={{ background: "var(--edu-danger)" }}
              disabled={cancelling}
              onClick={cancelInterview}
            >
              {cancelling
                ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Cancelling…</>
                : <><X size={14} className="mr-1.5" /> Cancel Interview</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
