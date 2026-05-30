import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

type Props = { profileId: number | null };
export function FeedbackPage({ profileId: _profileId }: Props) {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Feedback & Comments" />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <Label>Comment for Farjana A. Limu — Chapter 3</Label>
        <Textarea className="mt-2" rows={6} placeholder="Methodology section is well-defined. Consider adding..." />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button style={{ background: "var(--edu-primary)" }} onClick={() => toast.success("Feedback sent")}>Send</Button>
        </div>
      </Card>
    </div>
  );
}
