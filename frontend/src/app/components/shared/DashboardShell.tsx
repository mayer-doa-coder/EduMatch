/**
 * DashboardShell — single source of truth for the app chrome.
 *
 * Every layout concern (sidebar nav, top header, logout placement,
 * role labels, shared nav items) lives here. To change anything that
 * affects all roles, edit only this file.
 */

import { ReactNode, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import {
  Bell,
  GraduationCap,
  LogOut,
  Menu,
  Search,
  X,
  LayoutDashboard,
  UserCircle,
  Users2,
  Sparkles,
  FileText,
  Activity,
  Briefcase,
  Calendar as CalendarIcon,
  QrCode,
  GitBranch,
  MessageSquare,
  Building2,
  FileCheck,
  Settings,
  Plus,
  Award,
  HelpCircle,
} from "lucide-react";
import { Role } from "../edu-data";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NavItem = { id: string; label: string; icon: React.ElementType };

// ── Navigation config ─────────────────────────────────────────────────────────
// Add, remove, or reorder sidebar items for any role here.

export const navByRole: Record<Role, NavItem[]> = {
  student: [
    { id: "overview",    label: "Dashboard",          icon: LayoutDashboard },
    { id: "profile",     label: "Profile & Skills",   icon: UserCircle      },
    { id: "supervisors", label: "Supervisor Match",   icon: Users2          },
    { id: "skillgap",    label: "Skill Gap",          icon: Sparkles        },
    { id: "thesis",      label: "Thesis Submission",  icon: FileText        },
    { id: "health",      label: "Thesis Health",      icon: Activity        },
    { id: "internships", label: "Internships",         icon: Briefcase       },
    { id: "interviews",  label: "Interview Scheduler", icon: CalendarIcon    },
    { id: "qr",          label: "QR Credential",      icon: QrCode          },
  ],
  supervisor: [
    { id: "overview",   label: "Dashboard",        icon: LayoutDashboard },
    { id: "applicants", label: "Blind Applicants", icon: Users2          },
    { id: "capacity",   label: "Capacity",         icon: GitBranch       },
    { id: "feedback",   label: "Feedback",         icon: MessageSquare   },
  ],
  admin: [
    { id: "overview",      label: "Dashboard",       icon: LayoutDashboard },
    { id: "users",         label: "User Management", icon: Users2          },
    { id: "universities",  label: "Inter-University", icon: Building2      },
    { id: "reports",       label: "Reports",         icon: FileCheck       },
    { id: "settings",      label: "System Settings", icon: Settings        },
  ],
  company: [
    { id: "overview",   label: "Dashboard",  icon: LayoutDashboard },
    { id: "post",       label: "Post Job",   icon: Plus            },
    { id: "applicants", label: "Applicants", icon: Users2          },
  ],
  alumni: [
    { id: "overview",    label: "Dashboard",  icon: LayoutDashboard },
    { id: "mentorship",  label: "Mentorship", icon: Award           },
    { id: "messages",    label: "Messages",   icon: MessageSquare   },
  ],
};

// Shared items that appear in the sidebar for every role.
export const sharedNav: NavItem[] = [
  { id: "notifications",  label: "Notifications", icon: Bell      },
  { id: "settings-shared", label: "Settings",     icon: Settings  },
  { id: "help",           label: "Help Center",   icon: HelpCircle },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Reads the persisted auth user from storage (localStorage → sessionStorage). */
function getAuthUser() {
  try {
    const raw =
      localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Derives up-to-2-letter initials from a display name. */
function initials(name: string) {
  return name
    .split(" ")
    .map(p => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Shell component ───────────────────────────────────────────────────────────

type Props = {
  role:           Role;
  active:         string;
  onActiveChange: (id: string) => void;
  onLogout:       () => void;
  onSwitchRole:   (r: Role) => void;
  children:       ReactNode;
};

export function DashboardShell({
  role,
  active,
  onActiveChange,
  onLogout,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = useMemo(() => [...navByRole[role], ...sharedNav], [role]);

  const authUser    = useMemo(getAuthUser, []);
  const displayName = (authUser.name as string) || "User";
  const userInitials = initials(displayName);

  function navigate(id: string) {
    onActiveChange(id);
    setSidebarOpen(false);
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--edu-bg)", color: "var(--edu-dark)" }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:static z-40 inset-y-0 left-0 w-64 bg-white border-r
          flex flex-col transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ borderColor: "var(--edu-border)" }}
      >
        {/* Logo */}
        <div
          className="h-16 px-5 flex items-center justify-between border-b shrink-0"
          style={{ borderColor: "var(--edu-border)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span style={{ color: "var(--edu-primary)", fontWeight: 700, fontSize: "1.05rem" }}>
              EduMatch
            </span>
          </div>
          <button className="md:hidden p-1 rounded" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Role label */}
        <div
          className="px-4 py-2.5 border-b shrink-0"
          style={{ borderColor: "var(--edu-border)" }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--edu-light)" }}
          >
            {role} Portal
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map(item => {
            const Icon     = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{
                  background: isActive ? "var(--edu-primary)" : "transparent",
                  color:      isActive ? "#fff" : "var(--edu-dark)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
        {/* Sidebar bottom is intentionally empty — logout lives in the header */}
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top header ────────────────────────────────────────────────── */}
        <header
          className="h-16 bg-white border-b sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 shrink-0"
          style={{ borderColor: "var(--edu-border)" }}
        >
          {/* Left: hamburger (mobile) + search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              className="md:hidden p-1 rounded"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="relative max-w-sm w-full hidden sm:block">
              <Search
                className="absolute left-3 top-2.5"
                size={16}
                style={{ color: "var(--edu-light)" }}
              />
              <Input
                className="pl-9 rounded-full text-sm"
                placeholder="Search supervisors, courses, internships…"
              />
            </div>
          </div>

          {/* ── Right: Bell → Name → Log out ──────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Bell */}
            <button
              onClick={() => navigate("notifications")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Bell size={20} style={{ color: "var(--edu-primary)" }} />
            </button>

            {/* Divider */}
            <div
              className="hidden sm:block mx-2 h-6 w-px"
              style={{ background: "var(--edu-border)" }}
            />

            {/* Avatar + Name */}
            <div className="flex items-center gap-2 px-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="edu-gradient text-white text-xs font-bold"
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-semibold" style={{ color: "var(--edu-dark)" }}>
                  {displayName}
                </div>
                <div className="text-xs capitalize" style={{ color: "var(--edu-light)" }}>
                  {role}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="hidden sm:block mx-2 h-6 w-px"
              style={{ background: "var(--edu-border)" }}
            />

            {/* Log out */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
              style={{ color: "var(--edu-danger)" }}
              title="Log out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log out</span>
            </button>

          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
