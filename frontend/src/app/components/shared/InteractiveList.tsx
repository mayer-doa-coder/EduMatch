/**
 * InteractiveList — generic list wrapper that:
 *   • renders a custom item via renderItem()
 *   • shows a clean EmptyState when items is empty
 *   • supports a "View all" footer action
 *
 * Designed for: courses, notifications, internships, milestones, etc.
 */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import { EmptyState } from "./EmptyState";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface InteractiveListProps<T> {
  items:       T[];
  renderItem:  (item: T, index: number) => ReactNode;
  maxDisplay?: number;
  /** Shown when items is empty. */
  emptyTitle?:       string;
  emptyDescription?: string;
  emptyIcon?:        LucideIcon;
  emptyAction?: {
    label:   string;
    onClick: () => void;
  };
  /** Footer "View all" button. */
  onViewAll?:     () => void;
  viewAllLabel?:  string;
  className?:     string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function InteractiveList<T>({
  items,
  renderItem,
  maxDisplay,
  emptyTitle = "Nothing here yet.",
  emptyDescription,
  emptyIcon,
  emptyAction,
  onViewAll,
  viewAllLabel = "View all",
  className = "space-y-3",
}: InteractiveListProps<T>) {
  const visible = maxDisplay != null ? items.slice(0, maxDisplay) : items;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        compact
      />
    );
  }

  return (
    <div>
      <div className={className}>
        {visible.map((item, i) => renderItem(item, i))}
      </div>

      {onViewAll && items.length > (maxDisplay ?? Infinity) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 rounded-xl text-sm"
          style={{ color: "var(--edu-primary)" }}
          onClick={onViewAll}
        >
          {viewAllLabel}
          <ChevronRight size={15} className="ml-1" />
        </Button>
      )}
    </div>
  );
}
