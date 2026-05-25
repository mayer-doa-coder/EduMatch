import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { Switch } from "../../ui/switch";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

export function CapacitySettings() {
  const [quota, setQuota] = useState([8]);
  const [autoAssign, setAutoAssign] = useState(true);
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Capacity Settings" />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-6">
        <div>
          <Label>Maximum Quota: {quota[0]}</Label>
          <Slider min={1} max={20} step={1} value={quota} onValueChange={setQuota} className="mt-3" />
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--edu-bg)" }}>
          <div>
            <div style={{ fontWeight: 600 }}>Auto-reassign on rejection</div>
            <div className="text-sm" style={{ color: "var(--edu-light)" }}>Automatically open the slot to the next-best candidate.</div>
          </div>
          <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
        </div>
        <Button style={{ background: "var(--edu-primary)" }} onClick={() => toast.success("Capacity updated")}>Save</Button>
      </Card>
    </div>
  );
}
