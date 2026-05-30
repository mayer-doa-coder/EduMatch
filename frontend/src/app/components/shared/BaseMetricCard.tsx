/**
 * BaseMetricCard — the single reusable card atom for any numeric KPI.
 *
 * Drop-in replacement for StatCard that adds:
 *   • onClick / href  — makes the whole card a clickable navigation target
 *   • badge           — optional pill label (e.g. "On track", "+2 new")
 *   • trend           — optional ↑/↓ annotation
 *   • loading         — shimmer placeholder state
 *
 * Used by: StudentOverview, SupervisorOverview, CompanyOverview, AdminOverview, …
 */

import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "neutral";

export interface BaseMetricCardProps {
  label:      string;
  value:      string | number;
  sub?:       string;
  icon:       LucideIcon;
  color?:     string;
  badge?:     string;
  badgeColor?: string;
  trend?:     Trend;
  loading?:   boolean;
  onClick?:   () => void;
  /** Purely informational — rendered as a title tooltip on the card. */
  hint?:      string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const trendSymbol: Record<Trend, string> = {
  up:      "↑",
  down:    "↓",
  neutral: "→",
};

const trendColor: Record<Trend, string> = {
  up:      "var(--edu-success)",
  down:    "var(--edu-danger)",
  neutral: "var(--edu-light)",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function BaseMetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "var(--edu-primary)",
  badge,
  badgeColor,
  trend,
  loading = false,
  onClick,
  hint,
}: BaseMetricCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      className={[
        "p-5 rounded-2xl bg-white edu-card-shadow border-0",
        isClickable ? "cursor-pointer hover-lift transition-all select-none" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        outline: "none",
        /* Subtle ring on keyboard focus for accessibility */
      }}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      title={hint}
      onKeyDown={
        isClickable
          ? (e) => (e.key === "Enter" || e.key === " ") && onClick?.()
          : undefined
      }
    >
      {loading ? (
        /* Shimmer skeleton */
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-24 rounded" style={{ background: "var(--edu-border)" }} />
          <div className="h-8 w-16 rounded" style={{ background: "var(--edu-border)" }} />
          <div className="h-3 w-20 rounded" style={{ background: "var(--edu-border)" }} />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          {/* Left: label / value / sub */}
          <div className="min-w-0">
            <div className="text-sm truncate" style={{ color: "var(--edu-light)" }}>
              {label}
            </div>
            <div
              className="mt-0.5 font-bold leading-none"
              style={{ fontSize: "1.75rem", color }}
            >
              {value}
            </div>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              {sub && (
                <span className="text-xs" style={{ color: "var(--edu-light)" }}>
                  {sub}
                </span>
              )}
              {trend && (
                <span className="text-xs font-semibold" style={{ color: trendColor[trend] }}>
                  {trendSymbol[trend]}
                </span>
              )}
              {badge && (
                <Badge
                  className="text-xs px-1.5 py-0"
                  style={{
                    background: badgeColor
                      ? `${badgeColor}20`
                      : "rgba(87,197,182,0.15)",
                    color: badgeColor ?? "var(--edu-secondary)",
                    border: "none",
                  }}
                >
                  {badge}
                </Badge>
              )}
            </div>
          </div>

          {/* Right: icon pill */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18`, color }}
            aria-hidden
          >
            <Icon size={20} />
          </div>
        </div>
      )}

      {/* Clickable hint chevron */}
      {isClickable && !loading && (
        <div
          className="mt-2 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--edu-secondary)" }}
        >
        </div>
      )}
    </Card>
  );
}
