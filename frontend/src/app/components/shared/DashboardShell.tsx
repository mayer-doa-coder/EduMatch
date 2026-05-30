import { ReactNode, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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

export type NavItem = { id: string; label: string; icon: any };

export const navByRole: Record<Role, NavItem[]> = {
  student: [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile & Skills", icon: UserCircle },
    { id: "supervisors", label: "Supervisor Match", icon: Users2 },
    { id: "skillgap", label: "Skill Gap", icon: Sparkles },
    { id: "thesis", label: "Thesis Submission", icon: FileText },
    { id: "health", label: "Thesis Health", icon: Activity },
    { id: "internships", label: "Internships", icon: Briefcase },
    { id: "interviews", label: "Interview Scheduler", icon: CalendarIcon },
    { id: "qr", label: "QR Credential", icon: QrCode },
  ],
  supervisor: [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "applicants", label: "Blind Applicants", icon: Users2 },
    { id: "capacity", label: "Capacity", icon: GitBranch },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ],
  admin: [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users2 },
    { id: "universities", label: "Inter-University", icon: Building2 },
    { id: "reports", label: "Reports", icon: FileCheck },
    { id: "settings", label: "System Settings", icon: Settings },
  ],
  company: [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "post", label: "Post Job", icon: Plus },
    { id: "applicants", label: "Applicants", icon: Users2 },
  ],
  alumni: [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "mentorship", label: "Mentorship", icon: Award },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ],
};

export const sharedNav: NavItem[] = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings-shared", label: "Settings", icon: Settings },
  { id: "help", label: "Help Center", icon: HelpCircle },
];

type Props = {
  role: Role;
  active: string;
  onActiveChange: (id: string) => void;
  onLogout: () => void;
  onSwitchRole: (r: Role) => void;
  children: ReactNode;
};

export function DashboardShell({
  role,
  active,
  onActiveChange,
  onLogout,
  onSwitchRole,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = useMemo(() => [...navByRole[role], ...sharedNav], [role]);

  const authUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "{}"); } catch { return {}; }
  }, []);
  const displayName: string = authUser.name ?? "User";
  const initials = displayName.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--edu-bg)", color: "var(--edu-dark)" }}
    >
      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-72 bg-white border-r flex flex-col transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ borderColor: "var(--edu-border)" }}
      >
        <div
          className="h-16 px-5 flex items-center justify-between border-b"
          style={{ borderColor: "var(--edu-border)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span style={{ color: "var(--edu-primary)", fontWeight: 700 }}>
              EduMatch
            </span>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--edu-border)" }}
        >
          <Label
            className="text-xs uppercase tracking-wider"
            style={{ color: "var(--edu-light)" }}
          >
            Role - {role}
          </Label>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onActiveChange(item.id);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition"
                style={{
                  background: isActive ? "var(--edu-primary)" : "transparent",
                  color: isActive ? "white" : "var(--edu-dark)",
                }}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div
          className="p-3 border-t"
          style={{ borderColor: "var(--edu-border)" }}
        >
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50"
            style={{ color: "var(--edu-danger)" }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-20"
          style={{ borderColor: "var(--edu-border)" }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search
                className="absolute left-3 top-3"
                size={16}
                style={{ color: "var(--edu-light)" }}
              />
              <Input
                className="pl-9 rounded-full"
                placeholder="Search supervisors, courses, internships..."
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-full hover:bg-gray-100"
              onClick={() => onActiveChange("notifications")}
            >
              <Bell size={20} style={{ color: "var(--edu-primary)" }} />
            </button>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="edu-gradient text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <div className="text-sm" style={{ fontWeight: 600 }}>
                  {displayName}
                </div>
                <div
                  className="text-xs capitalize"
                  style={{ color: "var(--edu-light)" }}
                >
                  {role}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
