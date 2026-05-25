import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

export function SystemSettings() {
  const [w1, setW1] = useState([40]);
  const [w2, setW2] = useState([30]);
  const [w3, setW3] = useState([30]);
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="System Settings" sub="Tune the AI matching weights." />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 max-w-2xl space-y-6">
        <div><Label>Skill Match Weight: {w1[0]}%</Label><Slider value={w1} onValueChange={setW1} max={100} className="mt-3" /></div>
        <div><Label>CGPA Weight: {w2[0]}%</Label><Slider value={w2} onValueChange={setW2} max={100} className="mt-3" /></div>
        <div><Label>Interest Match Weight: {w3[0]}%</Label><Slider value={w3} onValueChange={setW3} max={100} className="mt-3" /></div>
        <Button style={{ background: "var(--edu-primary)" }} onClick={() => toast.success("Weights saved")}>Save</Button>
      </Card>
    </div>
  );
}
