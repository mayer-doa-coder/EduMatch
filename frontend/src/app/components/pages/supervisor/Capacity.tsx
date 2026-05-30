import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

type Props = { profileId: number | null };

export function CapacitySettings({ profileId }: Props) {
  const [quota,       setQuota]       = useState([5]);
  const [current,     setCurrent]     = useState(0);
  const [autoAssign,  setAutoAssign]  = useState(true);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    fetch(`${API}/get_supervisor_dashboard.php?faculty_id=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.profile) {
          setQuota([Number(d.profile.quota) || 5]);
          setCurrent(Number(d.profile.current_student_count) || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileId]);

  async function save() {
    if (!profileId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/update_capacity.php`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_id: profileId, quota: quota[0] }),
      });
      const d = await res.json();
      if (d.success) toast.success(d.message ?? "Capacity updated.");
      else           toast.error(d.message ?? "Update failed.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        Loading capacity settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Capacity Settings" />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-6">

        {/* Current load indicator */}
        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: "var(--edu-bg)" }}>
          <span className="text-sm font-medium">Current students assigned</span>
          <span style={{ fontWeight: 700, color: "var(--edu-primary)", fontSize: "1.2rem" }}>
            {current} / {quota[0]}
          </span>
        </div>

        {/* Quota slider */}
        <div>
          <Label>Maximum Quota: <strong>{quota[0]}</strong></Label>
          <Slider
            min={Math.max(1, current)}
            max={20}
            step={1}
            value={quota}
            onValueChange={setQuota}
            className="mt-3"
          />
          <p className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>
            Minimum is your current student count ({current}).
          </p>
        </div>

        {/* Auto-reassign toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: "var(--edu-bg)" }}>
          <div>
            <div style={{ fontWeight: 600 }}>Auto-reassign on rejection</div>
            <div className="text-sm" style={{ color: "var(--edu-light)" }}>
              Automatically open the slot to the next-best candidate.
            </div>
          </div>
          <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
        </div>

        <Button
          style={{ background: "var(--edu-primary)" }}
          disabled={saving}
          onClick={save}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </Card>
    </div>
  );
}
