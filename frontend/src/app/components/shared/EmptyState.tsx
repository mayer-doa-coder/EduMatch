/**
 * EmptyState — clean placeholder shown when a list or section has no data.
 * Used by InteractiveList, AvatarList, and any page section.
 */

import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

export interface EmptyStateProps {
  icon?:        LucideIcon;
  title:        string;
  description?: string;
  action?: {
    label:   string;
    onClick: () => void;
  };
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        compact ? "py-6 gap-2" : "py-12 gap-3",
      ].join(" ")}
    >
      {Icon && (
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{
            width: compact ? 40 : 56,
            height: compact ? 40 : 56,
            background: "rgba(26,95,122,0.07)",
            color: "var(--edu-primary)",
          }}
        >
          <Icon size={compact ? 20 : 26} />
        </div>
      )}
      <div>
        <p
          className={compact ? "text-sm font-medium" : "font-semibold"}
          style={{ color: "var(--edu-dark)" }}
        >
          {title}
        </p>
        {description && (
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--edu-light)", maxWidth: 280 }}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button
          size="sm"
          className="rounded-full mt-1"
          style={{ background: "var(--edu-primary)" }}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
