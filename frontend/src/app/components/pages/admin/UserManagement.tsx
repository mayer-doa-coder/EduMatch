import { useState } from "react";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Filter, Plus, Search } from "lucide-react";
import { SectionTitle } from "../../shared/SectionTitle";

export function UserManagement() {
  const [q, setQ] = useState("");
  const data = [
    { name: "Farjana A. Limu", role: "Student", uni: "DU", status: "Active" },
    { name: "Dr. Ahmed Rahman", role: "Supervisor", uni: "DU", status: "Active" },
    { name: "DataPeak Labs", role: "Company", uni: "—", status: "Active" },
    { name: "Riad Karim", role: "Alumni", uni: "BUET", status: "Pending" },
    { name: "Sadia Akter", role: "Student", uni: "NSU", status: "Active" },
  ].filter(d => d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6 fade-in-up">
      <SectionTitle title="User Management" action={<Button style={{ background: "var(--edu-primary)" }}><Plus size={16} className="mr-2" /> Add user</Button>} />
      <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3" size={16} style={{ color: "var(--edu-light)" }} />
            <Input className="pl-9" value={q} onChange={e => setQ(e.target.value)} placeholder="Search users" />
          </div>
          <Button variant="outline"><Filter size={16} className="mr-2" /> Filter</Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>University</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map((u, i) => (
              <TableRow key={i}>
                <TableCell><div className="flex items-center gap-2"><Avatar className="w-7 h-7"><AvatarFallback className="edu-gradient text-white text-xs">{u.name.split(" ").map(p => p[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>{u.name}</div></TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.uni}</TableCell>
                <TableCell><Badge style={{ background: u.status === "Active" ? "rgba(40,167,69,0.12)" : "rgba(255,193,7,0.18)", color: u.status === "Active" ? "#28a745" : "#a76f00" }}>{u.status}</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost">Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
