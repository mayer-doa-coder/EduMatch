/**
 * DashboardShell — persistent app chrome for all roles.
 *
 * Header search (upgraded):
 *   • Live dropdown as-you-type, fully case-insensitive
 *   • Matches supervisor names & expertise, course names & providers,
 *     internship roles, companies & skills, AND section shortcuts
 *   • Keyboard navigation: ↑ ↓ to move focus, Enter to navigate, Esc to close
 *   • Grouped results with type icons and secondary labels
 *   • ⌘K / Ctrl+K focuses the bar from anywhere
 */

import {
  type ReactNode, useMemo, useState, useRef, useEffect, useCallback,
} from "react";
import { useNavigate, useParams } from "react-router";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Bell, GraduationCap, LogOut, Menu, Search, X,
  LayoutDashboard, UserCircle, Users2, Sparkles,
  FileText, Activity, Briefcase, Calendar as CalendarIcon,
  QrCode, GitBranch, MessageSquare, Building2, FileCheck,
  Settings, Plus, Award, HelpCircle, ChevronDown, BookOpen,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "../edu-data";
import {
  supervisors  as allSupervisors,
  courses      as allCourses,
  internships  as allInternships,
} from "../edu-data";
import { usePortal } from "../../context/PortalContext";

// ── Nav config ─────────────────────────────────────────────────────────────────

export type NavItem = { id: string; label: string; icon: React.ElementType };

export const navByRole: Record<Role, NavItem[]> = {
  student: [
    { id: "overview",    label: "Dashboard",           icon: LayoutDashboard },
    { id: "profile",     label: "Profile & Skills",    icon: UserCircle      },
    { id: "supervisors", label: "Supervisor Match",    icon: Users2          },
    { id: "skillgap",    label: "Skill Gap",           icon: Sparkles        },
    { id: "thesis",      label: "Thesis Submission",   icon: FileText        },
    { id: "health",      label: "Thesis Health",       icon: Activity        },
    { id: "internships", label: "Internships",          icon: Briefcase       },
    { id: "interviews",  label: "Interview Scheduler", icon: CalendarIcon    },
    { id: "qr",          label: "QR Credential",       icon: QrCode          },
  ],
  supervisor: [
    { id: "overview",   label: "Dashboard",        icon: LayoutDashboard },
    { id: "applicants", label: "Blind Applicants", icon: Users2          },
    { id: "capacity",   label: "Capacity",         icon: GitBranch       },
    { id: "feedback",   label: "Feedback",         icon: MessageSquare   },
  ],
  admin: [
    { id: "overview",     label: "Dashboard",        icon: LayoutDashboard },
    { id: "users",        label: "User Management",  icon: Users2          },
    { id: "universities", label: "Inter-University", icon: Building2       },
    { id: "reports",      label: "Reports",          icon: FileCheck       },
    { id: "settings",     label: "System Settings",  icon: Settings        },
  ],
  company: [
    { id: "overview",   label: "Dashboard",  icon: LayoutDashboard },
    { id: "post",       label: "Post Job",   icon: Plus            },
    { id: "applicants", label: "Applicants", icon: Users2          },
  ],
  alumni: [
    { id: "overview",   label: "Dashboard",  icon: LayoutDashboard },
    { id: "mentorship", label: "Mentorship", icon: Award           },
    { id: "messages",   label: "Messages",   icon: MessageSquare   },
  ],
};

export const sharedNav: NavItem[] = [
  { id: "notifications",   label: "Notifications", icon: Bell       },
  { id: "settings-shared", label: "Settings",      icon: Settings   },
  { id: "help",            label: "Help Center",   icon: HelpCircle },
];

// ── Search types & engine ──────────────────────────────────────────────────────

type ResultKind = "section" | "supervisor" | "course" | "internship";

interface SearchResult {
  kind:     ResultKind;
  label:    string;
  sub?:     string;
  section:  string;   // where to navigate
  icon:     LucideIcon;
}

// All section labels for shortcut matching
const ALL_SECTIONS: Array<{ id: string; label: string; icon: LucideIcon; keywords: string[] }> = [
  { id: "overview",        label: "Dashboard",           icon: LayoutDashboard, keywords: ["dashboard", "home", "overview"] },
  { id: "profile",         label: "Profile & Skills",    icon: UserCircle,      keywords: ["profile", "bio", "cgpa", "about", "account"] },
  { id: "supervisors",     label: "Supervisor Match",    icon: Users2,          keywords: ["supervisor", "faculty", "mentor", "advisor", "phd", "professor"] },
  { id: "skillgap",        label: "Skill Gap",           icon: Sparkles,        keywords: ["skill", "gap", "course", "learn", "study", "improvement"] },
  { id: "thesis",          label: "Thesis Submission",   icon: FileText,        keywords: ["thesis", "submit", "chapter", "draft", "submission", "paper"] },
  { id: "health",          label: "Thesis Health",       icon: Activity,        keywords: ["health", "score", "plagiarism", "milestone", "progress"] },
  { id: "internships",     label: "Internships",          icon: Briefcase,       keywords: ["intern", "job", "career", "work", "company", "hiring", "placement"] },
  { id: "interviews",      label: "Interview Scheduler", icon: CalendarIcon,    keywords: ["interview", "schedule", "appointment", "calendar", "meeting"] },
  { id: "qr",              label: "QR Credential",       icon: QrCode,          keywords: ["qr", "credential", "certificate", "verify", "badge"] },
  { id: "notifications",   label: "Notifications",       icon: Bell,            keywords: ["notification", "alert", "message", "news", "update"] },
  { id: "settings-shared", label: "Settings",            icon: Settings,        keywords: ["setting", "account", "password", "email", "preference"] },
  { id: "help",            label: "Help Center",         icon: HelpCircle,      keywords: ["help", "faq", "support", "guide", "tutorial"] },
];

/**
 * Compute search results for a query string.
 * Every comparison is .toLowerCase() → fully case-insensitive.
 */
function computeResults(raw: string): SearchResult[] {
  const q = raw.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  // 1. Section shortcuts (keyword OR label partial match)
  for (const s of ALL_SECTIONS) {
    const labelMatch    = s.label.toLowerCase().includes(q);
    const keywordMatch  = s.keywords.some(k => k.includes(q) || q.includes(k));
    if (labelMatch || keywordMatch) {
      results.push({ kind: "section", label: s.label, section: s.id, icon: s.icon });
    }
  }

  // 2. Supervisors — name or expertise
  for (const s of allSupervisors) {
    if (
      s.name.toLowerCase().includes(q) ||
      s.expertise.toLowerCase().includes(q)
    ) {
      results.push({
        kind:    "supervisor",
        label:   s.name,
        sub:     s.expertise,
        section: "supervisors",
        icon:    UserCircle,
      });
    }
  }

  // 3. Courses — name or provider
  for (const c of allCourses) {
    if (
      c.name.toLowerCase().includes(q) ||
      c.provider.toLowerCase().includes(q) ||
      c.difficulty.toLowerCase().includes(q)
    ) {
      results.push({
        kind:    "course",
        label:   c.name,
        sub:     `${c.provider} · ${c.duration}`,
        section: "skillgap",
        icon:    BookOpen,
      });
    }
  }

  // 4. Internships — company, role, or any required skill
  for (const i of allInternships) {
    if (
      i.company.toLowerCase().includes(q) ||
      i.role.toLowerCase().includes(q) ||
      i.skills.some(s => s.toLowerCase().includes(q))
    ) {
      results.push({
        kind:    "internship",
        label:   i.role,
        sub:     `${i.company} · ${i.salary}`,
        section: "internships",
        icon:    Briefcase,
      });
    }
  }

  // Deduplicate by section+label and cap at 10
  const seen = new Set<string>();
  return results.filter(r => {
    const key = `${r.kind}:${r.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
}

const KIND_LABEL: Record<ResultKind, string> = {
  section:    "Pages",
  supervisor: "Supervisors",
  course:     "Courses",
  internship: "Internships",
};

const KIND_COLOR: Record<ResultKind, string> = {
  section:    "var(--edu-primary)",
  supervisor: "var(--edu-secondary)",
  course:     "var(--edu-accent)",
  internship: "#5C6BC0",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(" ").map(p => p[0] ?? "").join("").slice(0, 2).toUpperCase();
}

// ── Shell ──────────────────────────────────────────────────────────────────────

export function DashboardShell({ children }: { children: ReactNode }) {
  const navigate               = useNavigate();
  const { section = "overview" } = useParams<{ section: string }>();
  const { user, role, logout } = usePortal();

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex,  setActiveIndex]  = useState(-1);

  const searchRef     = useRef<HTMLInputElement>(null);
  const dropdownRef   = useRef<HTMLDivElement>(null);

  const nav         = useMemo(() => [...navByRole[role], ...sharedNav], [role]);
  const displayName = user?.name ?? "User";
  const userRole    = user?.role ?? role;

  // Compute results whenever query changes (case-insensitive inside computeResults)
  const results = useMemo(() => computeResults(searchQuery), [searchQuery]);

  function goTo(id: string) {
    navigate(`/portal/${id}`);
    setSidebarOpen(false);
  }

  function selectResult(r: SearchResult) {
    goTo(r.section);
    setSearchQuery("");
    setShowDropdown(false);
    setActiveIndex(-1);
    searchRef.current?.blur();
  }

  // Keyboard navigation inside the dropdown
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || !results.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
          const r = results[0];
          if (r) selectResult(r);
        }
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        selectResult(results[activeIndex]);
      } else if (results[0]) {
        selectResult(results[0]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
      searchRef.current?.blur();
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current  && !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Group results by kind for rendering
  const grouped = useMemo(() => {
    const map = new Map<ResultKind, SearchResult[]>();
    for (const r of results) {
      if (!map.has(r.kind)) map.set(r.kind, []);
      map.get(r.kind)!.push(r);
    }
    return Array.from(map.entries());
  }, [results]);

  // Reset active index when results change
  useEffect(() => { setActiveIndex(-1); }, [results]);

  // Flat index helper for keyboard nav
  const flatResults = useMemo(
    () => grouped.flatMap(([, items]) => items),
    [grouped],
  );

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--edu-bg)", color: "var(--edu-dark)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:static z-40 inset-y-0 left-0 w-64 bg-white border-r
          flex flex-col transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ borderColor: "var(--edu-border)" }}
      >
        <div
          className="h-16 px-5 flex items-center justify-between border-b shrink-0"
          style={{ borderColor: "var(--edu-border)" }}
        >
          <button className="flex items-center gap-2" onClick={() => goTo("overview")}>
            <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span style={{ color: "var(--edu-primary)", fontWeight: 700, fontSize: "1.05rem" }}>
              EduMatch
            </span>
          </button>
          <button className="md:hidden p-1 rounded" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-2.5 border-b shrink-0" style={{ borderColor: "var(--edu-border)" }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--edu-light)" }}>
            {userRole} Portal
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map(item => {
            const Icon     = item.icon;
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
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
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header
          className="h-16 bg-white border-b sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 shrink-0"
          style={{ borderColor: "var(--edu-border)" }}
        >
          {/* Left: hamburger + search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button className="md:hidden p-1 rounded" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>

            {/* Search container (position:relative anchor for dropdown) */}
            <div className="relative max-w-sm w-full hidden sm:block" ref={dropdownRef}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                size={15}
                style={{ color: "var(--edu-light)" }}
              />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-12 rounded-full text-sm transition-shadow"
                placeholder="Search supervisors, courses, internships…"
                style={{
                  boxShadow: showDropdown && searchQuery
                    ? "0 0 0 2px var(--edu-secondary)"
                    : undefined,
                }}
                autoComplete="off"
                aria-label="Global search"
                aria-autocomplete="list"
                aria-expanded={showDropdown && results.length > 0}
              />
              {/* ⌘K hint */}
              {!showDropdown && !searchQuery && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded border hidden lg:inline pointer-events-none"
                  style={{ color: "var(--edu-light)", borderColor: "var(--edu-border)" }}
                >
                  ⌘K
                </span>
              )}
              {/* Clear button */}
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100"
                  onClick={() => { setSearchQuery(""); setShowDropdown(false); searchRef.current?.focus(); }}
                  aria-label="Clear search"
                >
                  <X size={13} style={{ color: "var(--edu-light)" }} />
                </button>
              )}

              {/* ── Search dropdown ────────────────────────────────────── */}
              {showDropdown && searchQuery && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border overflow-hidden z-50"
                  style={{
                    borderColor: "var(--edu-border)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                  }}
                  role="listbox"
                >
                  {results.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--edu-light)" }}>
                      No results for <strong>"{searchQuery}"</strong>
                    </div>
                  ) : (
                    <div className="py-1">
                      {grouped.map(([kind, items]) => {
                        // Compute the flat index offset of the first item in this group
                        const groupOffset = flatResults.indexOf(items[0]);
                        return (
                          <div key={kind}>
                            {/* Group header */}
                            <div
                              className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider"
                              style={{ color: "var(--edu-light)" }}
                            >
                              {KIND_LABEL[kind]}
                            </div>
                            {items.map((r, localIdx) => {
                              const flatIdx = groupOffset + localIdx;
                              const Icon    = r.icon;
                              const isActive = flatIdx === activeIndex;
                              return (
                                <button
                                  key={`${r.kind}-${r.label}`}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                                  style={{
                                    background: isActive ? "rgba(26,95,122,0.07)" : "transparent",
                                  }}
                                  onMouseEnter={() => setActiveIndex(flatIdx)}
                                  onMouseLeave={() => setActiveIndex(-1)}
                                  onPointerDown={e => {
                                    e.preventDefault(); // prevents blur before click
                                    selectResult(r);
                                  }}
                                  role="option"
                                  aria-selected={isActive}
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                      background: `${KIND_COLOR[kind]}18`,
                                      color: KIND_COLOR[kind],
                                    }}
                                  >
                                    <Icon size={14} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div
                                      className="text-sm font-medium truncate"
                                      style={{ color: "var(--edu-dark)" }}
                                    >
                                      {/* Bold the matching substring */}
                                      <HighlightMatch text={r.label} query={searchQuery} />
                                    </div>
                                    {r.sub && (
                                      <div className="text-xs truncate" style={{ color: "var(--edu-light)" }}>
                                        {r.sub}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs shrink-0" style={{ color: "var(--edu-light)" }}>
                                    {KIND_LABEL[kind].slice(0, -1)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                      {/* Footer hint */}
                      <div
                        className="px-3 py-2 flex items-center gap-4 border-t text-xs"
                        style={{ borderColor: "var(--edu-border)", color: "var(--edu-light)" }}
                      >
                        <span><kbd className="px-1 rounded border" style={{ borderColor: "var(--edu-border)" }}>↑↓</kbd> navigate</span>
                        <span><kbd className="px-1 rounded border" style={{ borderColor: "var(--edu-border)" }}>↵</kbd> open</span>
                        <span><kbd className="px-1 rounded border" style={{ borderColor: "var(--edu-border)" }}>Esc</kbd> close</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Bell + Avatar dropdown */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goTo("notifications")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Bell size={20} style={{ color: "var(--edu-primary)" }} />
            </button>

            <div className="hidden sm:block mx-2 h-6 w-px" style={{ background: "var(--edu-border)" }} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="edu-gradient text-white text-xs font-bold">
                      {initials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block leading-tight text-left">
                    <div className="text-sm font-semibold" style={{ color: "var(--edu-dark)" }}>
                      {displayName}
                    </div>
                    <div className="text-xs capitalize" style={{ color: "var(--edu-light)" }}>
                      {userRole}
                    </div>
                  </div>
                  <ChevronDown size={14} className="hidden sm:block" style={{ color: "var(--edu-light)" }} />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1">
                <DropdownMenuLabel className="text-xs px-3 py-1.5" style={{ color: "var(--edu-light)" }}>
                  {user?.email ?? ""}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {role === "student" && (
                  <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => goTo("profile")}>
                    <UserCircle size={15} className="mr-2" style={{ color: "var(--edu-primary)" }} />
                    Profile & Skills
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => goTo("settings-shared")}>
                  <Settings size={15} className="mr-2" style={{ color: "var(--edu-primary)" }} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => goTo("help")}>
                  <HelpCircle size={15} className="mr-2" style={{ color: "var(--edu-primary)" }} />
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-xl cursor-pointer"
                  style={{ color: "var(--edu-danger)" }}
                  onClick={logout}
                >
                  <LogOut size={15} className="mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

// ── Inline highlight component ─────────────────────────────────────────────────
// Wraps the matched substring in a bold span for visual emphasis.

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.toLowerCase().trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{ color: "var(--edu-primary)" }}>
        {text.slice(idx, idx + q.length)}
      </strong>
      {text.slice(idx + q.length)}
    </>
  );
}
