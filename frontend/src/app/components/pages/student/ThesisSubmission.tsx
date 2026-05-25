import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../ui/table";
import { SectionTitle } from "../../shared/SectionTitle";
import { UploadArea } from "../../shared/UploadArea";

export function ThesisSubmission() {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 12);
  const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const submissions = [
    { c: "Proposal", d: "Feb 10", p: "4%", st: "Approved" },
    { c: "Chapter 1", d: "Mar 02", p: "5%", st: "Approved" },
    { c: "Chapter 2", d: "Mar 28", p: "7%", st: "Revisions" },
    { c: "Chapter 3", d: "Apr 22", p: "6%", st: "In Review" },
  ];

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Thesis Submission" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <UploadArea label="Upload next chapter (PDF/DOCX)" />
          <h3 className="mt-6" style={{ color: "var(--edu-primary)" }}>Submission History</h3>
          <Table className="mt-3">
            <TableHeader>
              <TableRow><TableHead>Chapter</TableHead><TableHead>Submitted</TableHead><TableHead>Plagiarism</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(r => (
                <TableRow key={r.c}>
                  <TableCell>{r.c}</TableCell>
                  <TableCell>{r.d}</TableCell>
                  <TableCell>{r.p}</TableCell>
                  <TableCell><Badge style={{ background: r.st === "Approved" ? "rgba(40,167,69,0.12)" : r.st === "Revisions" ? "rgba(255,193,7,0.18)" : "rgba(23,162,184,0.12)", color: r.st === "Approved" ? "#28a745" : r.st === "Revisions" ? "#a76f00" : "#17a2b8" }}>{r.st}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Card className="p-6 rounded-2xl edu-gradient text-white edu-card-shadow border-0">
          <div className="opacity-80 text-sm">Next Deadline</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{days} days</div>
          <div className="opacity-90">Chapter 4 — {deadline.toDateString()}</div>
          <div className="mt-4 p-3 rounded-xl bg-white/15">
            <div className="text-sm">Latest plagiarism score</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>6%</div>
          </div>
          <Textarea placeholder="Notes for your supervisor..." className="mt-4 bg-white/10 text-white placeholder:text-white/60 border-white/20" />
        </Card>
      </div>
    </div>
  );
}
