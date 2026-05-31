/**
 * CapacitySettings — supervisor quota management.
 *
 * Changes vs old version
 * ──────────────────────
 *  • Visual quota bar showing current fill percentage.
 *  • "Auto-reassign on rejection" toggle persists to the Faculty table
 *    (safe-migrates the column if missing via update_capacity.php).
 *  • Dashboard data is re-fetched after a successful save so displayed
 *    counts stay in sync.
 *  • All slots / used / free stats are prominently shown.
 *  • Slider min is dynamically clamped to the live actual student count
 *    (not the stale current_student_count column).
 */

import { useEffect, useState } from "react";
import { Card }     from "../../ui/card";
import { Button }   from "../../ui/button";
import { Badge }    from "../../ui/badge";
import { Label }    from "../../ui/label";
import { Slider }   from "../../ui/slider";
import { Switch }   from "../../ui/switch";
import { Progress } from "../../ui/progress";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";
import { GitBranch, Users2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const API = "http://localhost/EduMatch/backend";

type Props = { profileId: number | null };

export function CapacitySettings({ profileId }: Props) {
  const [quota,      setQuota]      = useState([5]);
  const [current,    setCurrent]    = useState(0);     // actual_count from DB
  const [autoAssign, setAutoAssign] = useState(true);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);

  // ── Load ─────────────────────────────────────────────────────────────
  function load() {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_supervisor_dashboard.php?faculty_id=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.profile) {
          const q = Number(d.profile.quota)        || 5;
          const c = Number(d.profile.actual_count) || Number(d.profile.current_student_count) || 0;
          setQuota([Math.max(q, c)]);  // quota can't be below actual
          setCurrent(c);
          // Load auto_assign from localStorage (server may not have the column yet)
          const saved = localStorage.getItem(`auto_assign_${profileId}`);
          setAutoAssign(saved !== null ? saved === "1" : true);
        }
      })
      .catch(() => toast.error("Could not load capacity settings."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [profileId]);

  // ── Save ──────────────────────────────────────────────────────────────
  async function save() {
    if (!profileId) return;
    setSaving(true);

    // Persist auto_assign preference locally
    localStorage.setItem(`auto_assign_${profileId}`, autoAssign ? "1" : "0");

    try {
      const res = await fetch(`${API}/update_capacity.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          faculty_id:  profileId,
          quota:       quota[0],
          auto_assign: autoAssign ? 1 : 0,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message ?? "Capacity updated.");
        load();   // reload to confirm persisted values
      } else {
        toast.error(d.message ?? "Update failed.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────
  const slotsUsed  = current;
  const slotsFree  = quota[0] - current;
  const fillPct    = quota[0] > 0 ? Math.round((current / quota[0]) * 100) : 0;
  const isFull     = slotsFree <= 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        <Loader2 className="animate-spin mr-2" size={18} /> Loading capacity settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle
        title="Capacity Settings"
        sub="Set the maximum number of students you can supervise at once."
      />

      {/* ── Slot overview cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users2,      label: "Used",       value: slotsUsed, color: "var(--edu-primary)" },
          { icon: CheckCircle2,label: "Available",  value: slotsFree, color: slotsFree > 0 ? "var(--edu-success)" : "var(--edu-danger)" },
          { icon: GitBranch,   label: "Total Quota",value: quota[0],  color: "var(--edu-secondary)" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="p-4 rounded-2xl text-center"
            style={{ background: "var(--edu-bg)" }}
          >
            <Icon size={18} className="mx-auto mb-1.5" style={{ color }} />
            <div className="font-bold text-xl" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>{label}</div>
          </div>
        ))}
      </div>

      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-6">

        {/* Fill bar */}
        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span style={{ color: "var(--edu-dark)", fontWeight: 600 }}>Current utilisation</span>
            <Badge
              style={{
                background: isFull ? "rgba(220,53,69,0.12)" : "rgba(40,167,69,0.12)",
                color:      isFull ? "var(--edu-danger)" : "var(--edu-success)",
                border:     "none",
              }}
            >
              {fillPct}% full
            </Badge>
          </div>
          <Progress value={fillPct} className="h-3" />
          <p className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>
            {slotsUsed} student{slotsUsed !== 1 ? "s" : ""} assigned · {slotsFree} slot{slotsFree !== 1 ? "s" : ""} free
          </p>
        </div>

        {/* Quota slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Maximum Quota</Label>
            <span
              className="font-bold text-2xl"
              style={{ color: "var(--edu-primary)" }}
            >
              {quota[0]}
            </span>
          </div>
          <Slider
            min={Math.max(1, current)}
            max={20}
            step={1}
            value={quota}
            onValueChange={setQuota}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: "var(--edu-light)" }}>
            <span>Min: {Math.max(1, current)} (current students)</span>
            <span>Max: 20</span>
          </div>
        </div>

        {/* Auto-reassign toggle */}
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: "var(--edu-bg)" }}
        >
          <div>
            <div className="font-semibold text-sm" style={{ color: "var(--edu-dark)" }}>
              Auto-reassign on rejection
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
              When you reject an applicant, the next-best candidate is automatically shown.
            </div>
          </div>
          <Switch
            checked={autoAssign}
            onCheckedChange={setAutoAssign}
            aria-label="Auto-reassign"
          />
        </div>

        {/* Full warning */}
        {isFull && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{ background: "rgba(220,53,69,0.06)", color: "var(--edu-danger)" }}
          >
            <AlertCircle size={15} />
            Quota is full. Increase the slider above before accepting new applicants.
          </div>
        )}

        <Button
          className="rounded-full"
          style={{ background: "var(--edu-primary)" }}
          disabled={saving}
          onClick={save}
        >
          {saving
            ? <><Loader2 size={14} className="animate-spin mr-2" /> Saving…</>
            : <><CheckCircle2 size={14} className="mr-2" /> Save Changes</>}
        </Button>
      </Card>
    </div>
  );
}
