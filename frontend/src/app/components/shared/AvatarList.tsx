/**
 * AvatarList — reusable list of people cards with avatar, name, sub-label,
 * and a slot-count badge. Handles empty state and a "See all" action.
 *
 * Used by: StudentOverview (Available Supervisors), SupervisorMatch, etc.
 */

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import { EmptyState } from "./EmptyState";
import type { LucideIcon } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AvatarItem {
  id:           string | number;
  name:         string;
  sub?:         string;
  badgeLabel?:  string;
  badgeColor?:  string;
  avatarColor?: string;
}

export interface AvatarListProps {
  items:          AvatarItem[];
  maxDisplay?:    number;
  onSeeAll?:      () => void;
  onItemClick?:   (item: AvatarItem) => void;
  seeAllLabel?:   string;
  emptyTitle?:    string;
  emptyIcon?:     LucideIcon;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Converts a full name to 1-2 uppercase initials. */
function toInitials(name: string): string {
  return name
    .split(" ")
    .map(p => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AvatarList({
  items,
  maxDisplay = 3,
  onSeeAll,
  onItemClick,
  seeAllLabel = "See all",
  emptyTitle = "No items yet.",
  emptyIcon,
}: AvatarListProps) {
  const visible = items.slice(0, maxDisplay);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        compact
      />
    );
  }

  return (
    <div className="space-y-2">
      {visible.map(item => (
        <div
          key={item.id}
          className={[
            "flex items-center justify-between p-3 rounded-xl border transition-colors",
            onItemClick ? "cursor-pointer hover:bg-gray-50" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ borderColor: "var(--edu-border)" }}
          onClick={() => onItemClick?.(item)}
          role={onItemClick ? "button" : undefined}
          tabIndex={onItemClick ? 0 : undefined}
          onKeyDown={
            onItemClick
              ? e =>
                  (e.key === "Enter" || e.key === " ") && onItemClick(item)
              : undefined
          }
        >
          {/* Avatar + text */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="shrink-0">
              <AvatarFallback
                className={item.avatarColor ? "" : "edu-gradient text-white"}
                style={
                  item.avatarColor
                    ? { background: item.avatarColor, color: "#fff" }
                    : undefined
                }
              >
                {toInitials(item.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div
                className="font-semibold truncate text-sm"
                style={{ color: "var(--edu-dark)" }}
              >
                {item.name}
              </div>
              {item.sub && (
                <div
                  className="text-xs truncate"
                  style={{ color: "var(--edu-light)" }}
                >
                  {item.sub}
                </div>
              )}
            </div>
          </div>

          {/* Badge */}
          {item.badgeLabel && (
            <Badge
              className="shrink-0 text-xs"
              style={{
                background: item.badgeColor
                  ? `${item.badgeColor}20`
                  : "rgba(40,167,69,0.12)",
                color: item.badgeColor ?? "var(--edu-success)",
                border: "none",
              }}
            >
              {item.badgeLabel}
            </Badge>
          )}
        </div>
      ))}

      {/* See all footer */}
      {onSeeAll && items.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 rounded-xl text-sm"
          style={{ color: "var(--edu-primary)" }}
          onClick={onSeeAll}
        >
          {seeAllLabel} ({items.length})
          <ChevronRight size={15} className="ml-1" />
        </Button>
      )}
    </div>
  );
}
