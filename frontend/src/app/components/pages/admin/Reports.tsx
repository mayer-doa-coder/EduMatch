import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { SectionTitle } from "../../shared/SectionTitle";
import { adminProjects } from "../../edu-data";

export function ReportsView() {
  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="Plagiarism & Health Reports" />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <Table>
          <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Student</TableHead><TableHead>Health Score</TableHead><TableHead>Risk Level</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {adminProjects.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p.project}</TableCell>
                <TableCell>{p.student}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={p.score} className="w-24" />
                    <span className="text-sm">{p.score}</span>
                  </div>
                </TableCell>
                <TableCell><Badge style={{ background: p.risk === "Low" ? "rgba(40,167,69,0.12)" : p.risk === "Medium" ? "rgba(255,193,7,0.18)" : "rgba(220,53,69,0.12)", color: p.risk === "Low" ? "#28a745" : p.risk === "Medium" ? "#a76f00" : "#dc3545" }}>{p.risk}</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost">Open</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
