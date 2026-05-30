import { useEffect, useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

interface PlagiarismRow {
  title: string;
  chapter: string;
  plagiarism_score: number;
  student_name: string;
}

export function ReportsView() {
  const [rows, setRows] = useState<PlagiarismRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/get_admin_dashboard.php`)
      .then(r => r.json())
      .then(d => { if (d.success) setRows(d.plagiarism_report ?? []); else toast.error(d.message); })
      .catch(() => toast.error("Could not load reports."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>Loading reports…</div>;

  const riskLabel = (score: number) => score > 20 ? "High" : score > 10 ? "Medium" : "Low";

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Plagiarism & Health Reports" sub="Milestones with plagiarism score > 10%" />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Chapter</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Plagiarism Score</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p, i) => {
              const risk = riskLabel(p.plagiarism_score);
              return (
                <TableRow key={i}>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.chapter}</TableCell>
                  <TableCell>{p.student_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.plagiarism_score} className="w-24" />
                      <span className="text-sm">{p.plagiarism_score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge style={{
                      background: risk === "Low" ? "rgba(40,167,69,0.12)" : risk === "Medium" ? "rgba(255,193,7,0.18)" : "rgba(220,53,69,0.12)",
                      color: risk === "Low" ? "#28a745" : risk === "Medium" ? "#a76f00" : "#dc3545",
                    }}>{risk}</Badge>
                  </TableCell>
                  <TableCell><Button size="sm" variant="ghost">Open</Button></TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center" style={{ color: "var(--edu-light)" }}>No high-plagiarism milestones found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
