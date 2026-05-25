import { Card } from "../ui/card";
import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color?: string;
};

export function StatCard({ label, value, sub, icon: Icon, color = "var(--edu-primary)" }: Props) {
  return (
    <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm" style={{ color: "var(--edu-light)" }}>{label}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color }}>{value}</div>
          {sub && <div className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>{sub}</div>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}
