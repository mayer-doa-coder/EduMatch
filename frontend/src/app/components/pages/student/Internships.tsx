/**
 * Internships — full-featured internship listing and application page.
 *
 * Features
 * ────────
 *  Search     — live client-side filter on role title, company, skills
 *  Filter     — All | Matched (only internships where ≥1 required skill
 *               overlaps with the student's skill profile)
 *  Match %    — badge showing how many required skills the student has
 *  View       — opens an InternshipDetailModal with full info
 *  Apply      — 2-step dialog:
 *                 Step 1: upload CV (required before proceeding)
 *                 Step 2: review and confirm → POST to backend
 *               On success the company sees the application in their
 *               Notifications feed automatically (no extra INSERT needed).
 *  Withdraw   — removes the application row from the DB
 *  Applications — "My Applications" section with status badge + CV info
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../ui/dialog";
import { Card }    from "../../ui/card";
import { Button }  from "../../ui/button";
import { Badge }   from "../../ui/badge";
import { Input }   from "../../ui/input";
import { Progress } from "../../ui/progress";
import { SectionTitle } from "../../shared/SectionTitle";
import { EmptyState }   from "../../shared/EmptyState";
import { toast }   from "sonner";
import {
  Building2, Search, X, Upload, FileText, CheckCircle2,
  Clock, AlertCircle, Eye, ChevronRight, Briefcase,
  CalendarDays, BadgePercent, Filter,
} from "lucide-react";
import { internships as mockInternships } from "../../edu-data";

const API = "http://localhost/EduMatch/backend";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OpenInternship {
  internship_id:       number;
  role_title:          string;
  company_name:        string;
  salary:              string;
  deadline:            string;
  required_skills:     string;
  description?:        string;
  posting_university?: string;
}

interface MyApplication {
  application_id: number;
  internship_id:  number;
  role_title:     string;
  company_name:   string;
  salary:         string;
  deadline:       string;
  required_skills: string;
  status:         string;
  applied_date:   string;
  cv_filename:    string;
}

type FilterMode = "all" | "matched";

type Props = { userId: number };

// ── Helpers ────────────────────────────────────────────────────────────────────

function skillsOf(raw: string): string[] {
  return raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
}

function matchPercent(required: string, studentSkills: string[]): number {
  const req = skillsOf(required);
  if (!req.length || !studentSkills.length) return 0;
  const hits = req.filter(r => studentSkills.some(s => s === r || s.includes(r) || r.includes(s)));
  return Math.round((hits.length / req.length) * 100);
}

function matchColor(pct: number): string {
  if (pct >= 75) return "var(--edu-success)";
  if (pct >= 40) return "var(--edu-accent)";
  return "var(--edu-light)";
}

function statusStyle(status: string): { bg: string; color: string } {
  switch (status) {
    case "accepted": return { bg: "rgba(40,167,69,0.12)",  color: "var(--edu-success)" };
    case "rejected": return { bg: "rgba(220,53,69,0.12)",  color: "var(--edu-danger)"  };
    default:         return { bg: "rgba(23,162,184,0.12)", color: "var(--edu-info)"    };
  }
}

/** Read student's saved skills from localStorage (set by Profile page). */
function loadStudentSkills(userId: number): string[] {
  try {
    const saved = localStorage.getItem(`portal_techskills_${userId}`);
    const arr: string[] = saved ? JSON.parse(saved) : [];
    return arr.map(s => s.toLowerCase());
  } catch { return []; }
}

// ── Mock builder ───────────────────────────────────────────────────────────────

function buildMockOpen(): OpenInternship[] {
  return mockInternships.map((i, idx) => ({
    internship_id:   i.id,
    role_title:      i.role,
    company_name:    i.company,
    salary:          i.salary.replace("/mo", ""),
    deadline:        new Date(Date.now() + (idx + 1) * 14 * 86_400_000)
      .toISOString().split("T")[0],
    required_skills: i.skills.join(", "),
    description:     `Exciting ${i.role} opportunity at ${i.company}. Work on real ML pipelines, contribute to production systems, and grow your skills in a fast-paced environment.`,
  }));
}

// ── Detail modal ───────────────────────────────────────────────────────────────

function InternshipDetailModal({
  internship,
  studentSkills,
  isApplied,
  onClose,
  onApply,
}: {
  internship:    OpenInternship;
  studentSkills: string[];
  isApplied:     boolean;
  onClose:       () => void;
  onApply:       () => void;
}) {
  const pct    = matchPercent(internship.required_skills, studentSkills);
  const skills = skillsOf(internship.required_skills);

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          {/* Company icon + title */}
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
              style={{ background: "var(--edu-primary)" }}
            >
              <Building2 size={24} />
            </div>
            <div>
              <DialogTitle
                className="text-xl leading-tight"
                style={{ color: "var(--edu-primary)" }}
              >
                {internship.role_title}
              </DialogTitle>
              <p className="text-sm mt-0.5" style={{ color: "var(--edu-light)" }}>
                {internship.company_name}
                {internship.posting_university
                  ? ` · ${internship.posting_university}`
                  : ""}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Key stats row */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { icon: BadgePercent, label: "Salary",   value: `৳${internship.salary}/mo` },
            { icon: CalendarDays, label: "Deadline",  value: internship.deadline },
            { icon: Briefcase,    label: "Match",     value: `${pct}%`, color: matchColor(pct) },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center"
              style={{ background: "var(--edu-bg)" }}
            >
              <Icon size={15} className="mx-auto mb-1" style={{ color: "var(--edu-primary)" }} />
              <div className="text-xs" style={{ color: "var(--edu-light)" }}>{label}</div>
              <div className="font-semibold text-sm" style={{ color: color ?? "var(--edu-dark)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Match bar */}
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--edu-light)" }}>
            <span>Skill match</span>
            <span style={{ color: matchColor(pct), fontWeight: 600 }}>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {/* Required skills */}
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--edu-light)" }}>
            Required Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => {
              const have = studentSkills.some(sk => sk === s || sk.includes(s) || s.includes(sk));
              return (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{
                    background: have ? "rgba(40,167,69,0.12)" : "rgba(26,95,122,0.08)",
                    color:      have ? "var(--edu-success)"   : "var(--edu-dark)",
                  }}
                >
                  {have && <CheckCircle2 size={11} />}
                  {s}
                </span>
              );
            })}
          </div>
        </div>

        {/* Description */}
        {internship.description && (
          <div>
            <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--edu-light)" }}>
              About the Role
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--edu-dark)" }}>
              {internship.description}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--edu-border)" }}>
          {isApplied ? (
            <Button disabled className="flex-1 rounded-full" variant="outline">
              <CheckCircle2 size={15} className="mr-2" /> Already Applied
            </Button>
          ) : (
            <Button
              className="flex-1 rounded-full"
              style={{ background: "var(--edu-accent)" }}
              onClick={() => { onClose(); onApply(); }}
            >
              Apply Now <ChevronRight size={15} className="ml-1" />
            </Button>
          )}
          <Button variant="outline" className="rounded-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Apply dialog (2-step) ──────────────────────────────────────────────────────

function ApplyDialog({
  internship,
  onClose,
  onSuccess,
}: {
  internship: OpenInternship;
  onClose:    () => void;
  onSuccess:  () => void;
}) {
  const [step, setStep]         = useState<1 | 2>(1);
  const [cvFile, setCvFile]     = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const profileId = (() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "{}").profile_id as number | null; }
    catch { return null; }
  })();

  const ALLOWED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const MAX_BYTES = 5 * 1_048_576;

  function handleFile(file: File) {
    if (!ALLOWED.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      toast.error("Only PDF, DOC, or DOCX files are accepted.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("CV must be under 5 MB.");
      return;
    }
    setCvFile(file);
    setStep(2);
  }

  async function submit() {
    if (!profileId || !cvFile) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/apply_internship.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          action:         "apply",
          student_id:     profileId,
          internship_id:  internship.internship_id,
          cv_filename:    cvFile.name,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Applied to ${internship.company_name}! They have been notified.`);
        onSuccess();
      } else {
        toast.error(d.message ?? "Application failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle style={{ color: "var(--edu-primary)" }}>
            {step === 1 ? "Step 1 of 2 — Upload Your CV" : "Step 2 of 2 — Confirm Application"}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-2">
          {[1, 2].map(s => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: step >= s ? "var(--edu-primary)" : "var(--edu-border)" }}
            />
          ))}
        </div>

        {/* Internship summary */}
        <div
          className="flex items-center gap-3 p-3 rounded-2xl"
          style={{ background: "var(--edu-bg)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
            style={{ background: "var(--edu-primary)" }}
          >
            <Building2 size={18} />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: "var(--edu-dark)" }}>
              {internship.role_title}
            </div>
            <div className="text-xs" style={{ color: "var(--edu-light)" }}>
              {internship.company_name} · ৳{internship.salary}/mo
            </div>
          </div>
        </div>

        {/* ── Step 1: CV Upload ──────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <p className="text-sm mb-3" style={{ color: "var(--edu-light)" }}>
              Upload your CV before submitting. PDF, DOC, or DOCX — max 5 MB.
            </p>

            {/* Drop zone */}
            <label
              className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed
                         cursor-pointer transition-colors select-none"
              style={{
                borderColor: dragging ? "var(--edu-secondary)" : "var(--edu-border)",
                background:  dragging ? "rgba(87,197,182,0.06)" : "transparent",
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault(); setDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              onClick={() => inputRef.current?.click()}
            >
              <Upload
                size={32}
                style={{ color: dragging ? "var(--edu-secondary)" : "var(--edu-primary)" }}
              />
              <div className="text-center">
                <div className="font-semibold" style={{ color: "var(--edu-dark)" }}>
                  Drag & drop or click to browse
                </div>
                <div className="text-sm mt-0.5" style={{ color: "var(--edu-light)" }}>
                  PDF, DOC, DOCX · max 5 MB
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
              />
            </label>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 rounded-full" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Confirm ───────────────────────────────────────── */}
        {step === 2 && cvFile && (
          <div>
            <p className="text-sm mb-3" style={{ color: "var(--edu-light)" }}>
              Review your application before submitting.
            </p>

            {/* CV file preview */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: "var(--edu-border)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)" }}
              >
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: "var(--edu-dark)" }}>
                  {cvFile.name}
                </div>
                <div className="text-xs" style={{ color: "var(--edu-light)" }}>
                  {(cvFile.size / 1024).toFixed(1)} KB · CV / Resume
                </div>
              </div>
              <button
                onClick={() => { setCvFile(null); setStep(1); }}
                className="p-1 rounded hover:bg-gray-100"
                title="Remove and re-upload"
              >
                <X size={14} style={{ color: "var(--edu-light)" }} />
              </button>
            </div>

            <div
              className="mt-3 p-3 rounded-xl text-sm flex items-start gap-2"
              style={{ background: "rgba(87,197,182,0.08)", color: "var(--edu-primary)" }}
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              The company will receive a notification and can view your application.
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => { setCvFile(null); setStep(1); }}
                disabled={submitting}
              >
                ← Back
              </Button>
              <Button
                className="flex-1 rounded-full"
                style={{ background: "var(--edu-accent)" }}
                onClick={submit}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting…"
                  : <><CheckCircle2 size={15} className="mr-2" /> Submit Application</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function Internships({ userId }: Props) {
  const [open,     setOpen]     = useState<OpenInternship[]>([]);
  const [applied,  setApplied]  = useState<MyApplication[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState<number | null>(null);

  // UI state
  const [search,      setSearch]      = useState("");
  const [filterMode,  setFilterMode]  = useState<FilterMode>("all");
  const [viewItem,    setViewItem]    = useState<OpenInternship | null>(null);
  const [applyItem,   setApplyItem]   = useState<OpenInternship | null>(null);

  // Student's skills for match %
  const [studentSkills, setStudentSkills] = useState<string[]>(() => loadStudentSkills(userId));

  const profileId = (() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "{}").profile_id as number | null; }
    catch { return null; }
  })();

  const load = useCallback(() => {
    if (!profileId) {
      setOpen(buildMockOpen());
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/apply_internship.php?student_id=${profileId}&action=list`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setOpen(d.open_internships ?? []);
          setApplied(d.my_applications ?? []);
          if (d.student_skills?.length) {
            setStudentSkills((d.student_skills as string[]).map((s: string) => s.toLowerCase()));
          }
        } else {
          setOpen(buildMockOpen());
          toast.error(d.message);
        }
      })
      .catch(() => {
        setOpen(buildMockOpen());
        toast.error("Could not load internships — showing demo data.");
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  useEffect(() => { load(); }, [load]);

  // ── Withdraw ────────────────────────────────────────────────────────────
  async function withdraw(internship_id: number, company: string) {
    if (!profileId) return;
    setActing(internship_id);
    try {
      const res = await fetch(`${API}/apply_internship.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "withdraw", student_id: profileId, internship_id }),
      });
      const d = await res.json();
      if (d.success) { toast.success(`Withdrawn from ${company}`); load(); }
      else toast.error(d.message);
    } catch { toast.error("Withdraw failed."); }
    finally { setActing(null); }
  }

  // ── Filtering ────────────────────────────────────────────────────────────
  const q = search.toLowerCase().trim();

  const filtered = open.filter(i => {
    const textMatch =
      !q ||
      i.role_title.toLowerCase().includes(q) ||
      i.company_name.toLowerCase().includes(q) ||
      i.required_skills.toLowerCase().includes(q);

    const skillMatch =
      filterMode !== "matched" ||
      matchPercent(i.required_skills, studentSkills) > 0;

    return textMatch && skillMatch;
  });

  const appliedIds = new Set(applied.map(a => a.internship_id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        Loading internships…
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle
        title="Internship Matching"
        sub="Positions scored against your skill profile."
      />

      {/* ── Search + Filter bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            size={15}
            style={{ color: "var(--edu-light)" }}
          />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-full text-sm"
            placeholder="Search by role, company, or skill…"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100"
              onClick={() => setSearch("")}
            >
              <X size={13} style={{ color: "var(--edu-light)" }} />
            </button>
          )}
        </div>

        {/* Filter toggles */}
        <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: "var(--edu-bg)" }}>
          {(["all", "matched"] as FilterMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize"
              style={{
                background: filterMode === mode ? "white" : "transparent",
                color:      filterMode === mode ? "var(--edu-primary)" : "var(--edu-light)",
                boxShadow:  filterMode === mode ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {mode === "matched"
                ? <span className="flex items-center gap-1.5"><Filter size={12} />Skill Match</span>
                : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* ── My Applications ─────────────────────────────────────────────── */}
      {applied.length > 0 && (
        <section>
          <SectionTitle title="My Applications" />
          <div className="grid md:grid-cols-2 gap-4">
            {applied.map(a => {
              const { bg, color } = statusStyle(a.status);
              return (
                <Card key={a.application_id} className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                      style={{ background: "var(--edu-primary)" }}
                    >
                      <Building2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold" style={{ color: "var(--edu-primary)" }}>
                        {a.role_title}
                      </div>
                      <div className="text-sm" style={{ color: "var(--edu-light)" }}>
                        {a.company_name} · Applied {a.applied_date}
                      </div>

                      {/* CV filename */}
                      {a.cv_filename && (
                        <div
                          className="mt-1.5 flex items-center gap-1 text-xs"
                          style={{ color: "var(--edu-light)" }}
                        >
                          <FileText size={11} /> {a.cv_filename}
                        </div>
                      )}

                      {/* Skills */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {skillsOf(a.required_skills).map(s => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>

                      {/* Status + withdraw */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Badge style={{ background: bg, color, border: "none" }} className="capitalize">
                          {a.status === "accepted"
                            ? <CheckCircle2 size={11} className="mr-1 inline" />
                            : a.status === "rejected"
                              ? <X size={11} className="mr-1 inline" />
                              : <Clock size={11} className="mr-1 inline" />}
                          {a.status}
                        </Badge>
                        {a.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs h-7"
                            onClick={() => withdraw(a.internship_id, a.company_name)}
                            disabled={acting === a.internship_id}
                          >
                            {acting === a.internship_id ? "…" : "Withdraw"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Open Internships ────────────────────────────────────────────── */}
      <section>
        <SectionTitle
          title={filterMode === "matched" ? "Matched Internships" : "Open Internships"}
          sub={
            filtered.length
              ? `${filtered.length} listing${filtered.length !== 1 ? "s" : ""}${q ? ` for "${search}"` : ""}`
              : undefined
          }
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={q ? `No internships found for "${search}"` : "No internships available right now."}
            description={
              filterMode === "matched"
                ? "No skill-matched listings found. Try switching to 'All' or update your skills in Profile."
                : "Check back soon — new listings are posted regularly."
            }
            action={
              filterMode === "matched"
                ? { label: "Show all listings", onClick: () => setFilterMode("all") }
                : q
                  ? { label: "Clear search", onClick: () => setSearch("") }
                  : undefined
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(i => {
              const pct      = matchPercent(i.required_skills, studentSkills);
              const isApplied = appliedIds.has(i.internship_id);
              return (
                <Card
                  key={i.internship_id}
                  className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift flex flex-col"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Company logo placeholder */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
                      style={{ background: "var(--edu-primary)" }}
                    >
                      <Building2 size={22} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title + match badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="font-semibold leading-tight"
                          style={{ color: "var(--edu-primary)" }}
                        >
                          {i.role_title}
                        </div>
                        {pct > 0 && (
                          <Badge
                            className="shrink-0 text-xs"
                            style={{
                              background: `${matchColor(pct)}20`,
                              color: matchColor(pct),
                              border: "none",
                            }}
                          >
                            {pct}% match
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm mt-0.5" style={{ color: "var(--edu-light)" }}>
                        {i.company_name}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>
                        ৳{i.salary}/mo · Deadline: {i.deadline}
                      </div>

                      {/* Skills */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {skillsOf(i.required_skills).map(s => {
                          const have = studentSkills.some(sk => sk === s || sk.includes(s) || s.includes(sk));
                          return (
                            <Badge
                              key={s}
                              variant="outline"
                              className="text-xs"
                              style={have ? { borderColor: "var(--edu-success)", color: "var(--edu-success)" } : {}}
                            >
                              {have && <CheckCircle2 size={10} className="mr-1 inline" />}
                              {s}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full text-sm"
                      style={{ borderColor: "var(--edu-primary)", color: "var(--edu-primary)" }}
                      onClick={() => setViewItem(i)}
                    >
                      <Eye size={14} className="mr-1.5" /> View
                    </Button>

                    {isApplied ? (
                      <Button
                        disabled
                        size="sm"
                        className="flex-1 rounded-full text-sm"
                        variant="outline"
                      >
                        <CheckCircle2 size={14} className="mr-1.5" /> Applied
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1 rounded-full text-sm"
                        style={{ background: "var(--edu-accent)" }}
                        onClick={() => setApplyItem(i)}
                        disabled={acting === i.internship_id}
                      >
                        <Upload size={14} className="mr-1.5" /> Apply
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {viewItem && (
        <InternshipDetailModal
          internship={viewItem}
          studentSkills={studentSkills}
          isApplied={appliedIds.has(viewItem.internship_id)}
          onClose={() => setViewItem(null)}
          onApply={() => { setViewItem(null); setApplyItem(viewItem); }}
        />
      )}

      {applyItem && (
        <ApplyDialog
          internship={applyItem}
          onClose={() => setApplyItem(null)}
          onSuccess={() => { setApplyItem(null); load(); }}
        />
      )}
    </div>
  );
}
