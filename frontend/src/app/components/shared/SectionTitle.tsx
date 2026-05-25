import { ReactNode } from "react";

type Props = { title: string; sub?: string; action?: ReactNode };

export function SectionTitle({ title, sub, action }: Props) {
  return (
    <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
      <div>
        <h2 style={{ color: "var(--edu-primary)", fontWeight: 700 }}>{title}</h2>
        {sub && <p className="text-sm" style={{ color: "var(--edu-light)" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
