/**
 * BlindReview — supervisor's anonymous applicant review panel.
 *
 * Crash fixes applied
 * ────────────────────
 *  • `technical_skills` and `research_interest` arrive from MySQL TEXT columns
 *    that can be NULL. The backend now COALESCE-s them to ''. The frontend
 *    also guards every access with `?? ""` so a stale or fallback payload
 *    never reaches a `.split()` / `.toFixed()` call.
 *  • `cgpa` is coerced to a number with `Number(a.cgpa) || 0` before any
 *    arithmetic or `.toFixed()` call.
 *  • The CREATE TABLE migration in the backend is wrapped in its own try-catch
 *    so a DDL error no longer propagates to the main API response.
 *  • A defensive `try/catch` in `load()` covers unparseable JSON bodies.
 *
 * Production behaviours
 * ─────────────────────
 *  Accept  → calls supervisor_action.php (transaction: assigns supervisor,
 *             increments quota counter, inserts notification message).
 *  Reject  → sends rejection message; card removed optimistically.
 *  Waitlist→ sends waitlist message; card removed optimistically.
 *  All decisions are recorded in SupervisorReviews so the applicant never
 *  reappears after a page refresh.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from "../../ui/dialog";
import { Card }     from "../../ui/card";
import { Button }   from "../../ui/button";
import { Badge }    from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { SectionTitle } from "../../shared/SectionTitle";
import { EmptyState }   from "../../shared/EmptyState";
import { toast } from "sonner";
import {
  Users2, CheckCircle2, X, Clock, Loader2,
  GraduationCap, BookOpen, Cpu, AlertCircle,
} from "lucide-react";

const API = "http://localhost/EduMatch/backend";

// ── Types ──────────────────────────────────────────────────────────────────────

interface BlindApplicant {
  code:               string;
  student_id:         number;
  cgpa:               number | null;
  research_interest:  string | null;
  technical_skills:   string | null;
}

interface SupervisorProfile {
  research_focus:        string | null;
  quota:                 number;
  actual_count:          number;
  current_student_count: number;
}

type Decision = "accepted" | "rejected" | "waitlisted";

type Props = { profileId: number | null };

// ── Safe helpers ───────────────────────────────────────────────────────────────

/** Parse cgpa — handles null, string "3.87", and actual numbers. */
function safeCgpa(raw: number | string | null | undefined): number {
  const n = Number(raw);
  return isNaN(n) ? 0 : n;
}

/** Parse a nullable comma-separated skills string into a clean array. */
function parseSkills(raw: string | null | undefined): string[] {
  return (raw ?? "").split(",").map(s => s.trim()).filter(Boolean);
}

/**
 * Keyword-overlap match score between supervisor's focus and student's interest.
 * Returns 0-100. Safe against null/undefined inputs.
 */
function interestMatch(supFocus: string | null, stuInterest: string | null): number {
  if (!supFocus || !stuInterest) return 0;
  const sup = supFocus.toLowerCase().split(/[\s,&/]+/).filter(Boolean);
  const stu = stuInterest.toLowerCase().split(/[\s,&/]+/).filter(Boolean);
  if (!sup.length) return 0;
  const hits = sup.filter(s => stu.some(t => t.includes(s) || s.includes(t)));
  return Math.round((hits.length / sup.length) * 100);
}

function matchColor(pct: number) {
  if (pct >= 70) return "var(--edu-success)";
  if (pct >= 40) return "var(--edu-accent)";
  return "var(--edu-light)";
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BlindReview({ profileId }: Props) {
  const [applicants,   setApplicants]   = useState<BlindApplicant[]>([]);
  const [profile,      setProfile]      = useState<SupervisorProfile | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  // Decision state
  const [acting,       setActing]       = useState<number | null>(null);
  const [confirmItem,  setConfirmItem]  = useState<BlindApplicant | null>(null);

  // ── Data load ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(
        `${API}/get_supervisor_dashboard.php?faculty_id=${profileId}`,
      );
      // Guard against non-JSON responses (PHP fatal errors, etc.)
      const text = await res.text();
      let d: Record<string, unknown>;
      try {
        d = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON: ${text.slice(0, 120)}`);
      }

      if (d.success) {
        setApplicants((d.blind_applicants as BlindApplicant[]) ?? []);
        setProfile((d.profile as SupervisorProfile) ?? null);
      } else {
        setError(String(d.message ?? "Failed to load applicants."));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { load(); }, [load]);

  // ── Core decision handler ──────────────────────────────────────────────
  async function decide(applicant: BlindApplicant, decision: Decision) {
    if (!profileId) return;
    setActing(applicant.student_id);
    try {
      const res = await fetch(`${API}/supervisor_action.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          faculty_id: profileId,
          student_id: applicant.student_id,
          decision,
        }),
      });
      const d = await res.json();
      if (d.success) {
        // Optimistic: remove card immediately
        setApplicants(prev => prev.filter(a => a.student_id !== applicant.student_id));

        if (decision === "accepted") {
          setProfile(prev => prev
            ? {
                ...prev,
                actual_count:          (prev.actual_count ?? 0) + 1,
                current_student_count: (prev.current_student_count ?? 0) + 1,
              }
            : prev,
          );
          toast.success(
            `${applicant.code} accepted — assigned to you and notified.`,
          );
        } else if (decision === "rejected") {
          toast.error(`${applicant.code} rejected — student notified.`);
        } else {
          toast.message(`${applicant.code} waitlisted — student notified.`);
        }
      } else {
        toast.error(String(d.message ?? `${decision} action failed.`));
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setActing(null);
      setConfirmItem(null);
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────
  const usedSlots  = profile ? (profile.actual_count ?? profile.current_student_count ?? 0) : 0;
  const quota      = profile?.quota ?? 0;
  const slotsLeft  = quota > 0 ? quota - usedSlots : 99;

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64 text-sm"
        style={{ color: "var(--edu-light)" }}
      >
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading applicants…
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6 fade-in-up">
        <SectionTitle title="Blind Applicant Review" />
        <div
          className="flex items-start gap-3 p-5 rounded-2xl border"
          style={{ borderColor: "rgba(220,53,69,0.3)", background: "rgba(220,53,69,0.05)" }}
        >
          <AlertCircle size={18} style={{ color: "var(--edu-danger)", marginTop: 2 }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--edu-danger)" }}>
              Could not load applicants
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto rounded-full"
            onClick={() => load()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 fade-in-up">

      {/* Header with quota pill */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionTitle
          title="Blind Applicant Review"
          sub="Identifying details are hidden to reduce unconscious bias."
        />
        {profile && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{
              background: slotsLeft > 0
                ? "rgba(40,167,69,0.10)"
                : "rgba(220,53,69,0.10)",
            }}
          >
            <Users2
              size={14}
              style={{ color: slotsLeft > 0 ? "var(--edu-success)" : "var(--edu-danger)" }}
            />
            <span
              style={{
                color:      slotsLeft > 0 ? "var(--edu-success)" : "var(--edu-danger)",
                fontWeight: 600,
              }}
            >
              {slotsLeft > 0
                ? `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} available`
                : "Quota full"}
            </span>
            <span style={{ color: "var(--edu-light)" }}>·</span>
            <span style={{ color: "var(--edu-light)" }}>
              {usedSlots} / {quota}
            </span>
          </div>
        )}
      </div>

      {/* Quota-full warning */}
      {slotsLeft === 0 && quota > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{
            background:  "rgba(220,53,69,0.05)",
            borderColor: "rgba(220,53,69,0.2)",
          }}
        >
          <AlertCircle size={18} style={{ color: "var(--edu-danger)" }} />
          <p className="text-sm" style={{ color: "var(--edu-dark)" }}>
            Your quota is full.{" "}
            <strong>Increase your capacity</strong> in the Capacity section
            before accepting new students.
          </p>
        </div>
      )}

      {/* Empty state */}
      {applicants.length === 0 && (
        <EmptyState
          icon={Users2}
          title="No pending applicants."
          description="All applicants from your university have been reviewed, or none have applied yet."
        />
      )}

      {/* Applicant cards */}
      {applicants.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {applicants.map(a => {
            const cgpa       = safeCgpa(a.cgpa);
            const skills     = parseSkills(a.technical_skills);
            const matchPct   = interestMatch(
              profile?.research_focus ?? null,
              a.research_interest ?? null,
            );
            const researchLabel = a.research_interest || "—";
            const isActing   = acting === a.student_id;

            return (
              <Card
                key={a.student_id}
                className="p-5 rounded-2xl bg-white edu-card-shadow border-0 flex flex-col gap-4"
              >
                {/* Code + CGPA badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className="text-xs uppercase tracking-wide mb-0.5"
                      style={{ color: "var(--edu-light)" }}
                    >
                      Applicant Code
                    </div>
                    <div
                      className="font-bold text-lg"
                      style={{ color: "var(--edu-primary)" }}
                    >
                      {a.code}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      style={{
                        background: "rgba(87,197,182,0.15)",
                        color:      "var(--edu-primary)",
                        border:     "none",
                      }}
                    >
                      CGPA {cgpa.toFixed(2)}
                    </Badge>
                    {matchPct > 0 && (
                      <div
                        className="text-xs mt-1 font-medium"
                        style={{ color: matchColor(matchPct) }}
                      >
                        {matchPct}% research match
                      </div>
                    )}
                  </div>
                </div>

                {/* CGPA bar */}
                <div>
                  <div
                    className="flex justify-between text-xs mb-1"
                    style={{ color: "var(--edu-light)" }}
                  >
                    <span className="flex items-center gap-1">
                      <GraduationCap size={11} /> CGPA
                    </span>
                    <span
                      style={{
                        color:      cgpa >= 3.5 ? "var(--edu-success)" : "var(--edu-accent)",
                        fontWeight: 600,
                      }}
                    >
                      {cgpa.toFixed(2)} / 4.00
                    </span>
                  </div>
                  <Progress value={Math.round((cgpa / 4) * 100)} className="h-1.5" />
                </div>

                {/* Research-match bar (only when non-zero) */}
                {matchPct > 0 && (
                  <div>
                    <div
                      className="flex justify-between text-xs mb-1"
                      style={{ color: "var(--edu-light)" }}
                    >
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} /> Research fit
                      </span>
                      <span style={{ color: matchColor(matchPct), fontWeight: 600 }}>
                        {matchPct}%
                      </span>
                    </div>
                    <Progress value={matchPct} className="h-1.5" />
                  </div>
                )}

                {/* Info tiles */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                    <div
                      className="text-xs mb-0.5 flex items-center gap-1"
                      style={{ color: "var(--edu-light)" }}
                    >
                      <BookOpen size={10} /> Research Interest
                    </div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: "var(--edu-dark)" }}
                    >
                      {researchLabel}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "var(--edu-bg)" }}>
                    <div
                      className="text-xs mb-0.5 flex items-center gap-1"
                      style={{ color: "var(--edu-light)" }}
                    >
                      <Cpu size={10} /> Technical Skills
                    </div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: "var(--edu-dark)" }}
                    >
                      {skills.length > 0 ? `${skills.length} listed` : "None listed"}
                    </div>
                  </div>
                </div>

                {/* Skill chips — only render when there are skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(s => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="text-xs rounded-full"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Button
                    size="sm"
                    className="rounded-full"
                    style={{ background: "var(--edu-success)" }}
                    disabled={isActing || slotsLeft === 0}
                    onClick={() => setConfirmItem(a)}
                    title={slotsLeft === 0 ? "Quota full — increase capacity first" : "Accept"}
                  >
                    {isActing
                      ? <Loader2 size={13} className="animate-spin" />
                      : <CheckCircle2 size={13} className="mr-1" />}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    style={{ color: "var(--edu-accent)", borderColor: "var(--edu-accent)" }}
                    disabled={isActing}
                    onClick={() => decide(a, "waitlisted")}
                  >
                    {isActing
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Clock size={13} className="mr-1" />}
                    Waitlist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    style={{ color: "var(--edu-danger)", borderColor: "var(--edu-danger)" }}
                    disabled={isActing}
                    onClick={() => decide(a, "rejected")}
                  >
                    {isActing
                      ? <Loader2 size={13} className="animate-spin" />
                      : <X size={13} className="mr-1" />}
                    Reject
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Accept confirmation dialog */}
      <Dialog
        open={!!confirmItem}
        onOpenChange={open => { if (!open) setConfirmItem(null); }}
      >
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--edu-primary)" }}>
              Confirm Acceptance
            </DialogTitle>
          </DialogHeader>

          {confirmItem && (
            <div className="space-y-3 text-sm">
              <p style={{ color: "var(--edu-dark)" }}>
                You are about to <strong>accept {confirmItem.code}</strong> into
                your research group. This will:
              </p>
              <ul
                className="space-y-1.5 pl-4 list-disc"
                style={{ color: "var(--edu-light)" }}
              >
                <li>Assign you as their supervisor in the database</li>
                <li>
                  Reduce your available slots by 1 ({slotsLeft} →{" "}
                  {Math.max(0, slotsLeft - 1)})
                </li>
                <li>Send the student an acceptance notification</li>
                <li>Remove them from your applicant queue permanently</li>
              </ul>
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-xs"
                style={{
                  background: "rgba(40,167,69,0.08)",
                  color:      "var(--edu-success)",
                }}
              >
                <CheckCircle2 size={13} />
                This action is stored in the database and cannot be undone here.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmItem(null)}
              disabled={acting !== null}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full flex-1"
              style={{ background: "var(--edu-success)" }}
              disabled={acting !== null}
              onClick={() => confirmItem && decide(confirmItem, "accepted")}
            >
              {acting !== null
                ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Processing…</>
                : <><CheckCircle2 size={14} className="mr-1.5" /> Yes, Accept</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
