/**
 * DashboardPage — the portal shell that selects the correct page component
 * based on the URL segment `/portal/:section` and the authenticated role.
 *
 * Auth and layout are handled upstream:
 *   AuthGuard  → blocks unauthenticated access, redirects to /login
 *   PortalProvider → provides usePortal() (user, role, logout, goTo)
 *   DashboardShell → renders sidebar + header + main wrapper
 *
 * This component's sole job is ROUTING:
 *   "Which content component should appear for this role at this section?"
 */

import { useParams, Navigate } from "react-router";
import { toast } from "sonner";
import { usePortal } from "../../context/PortalContext";
import { DashboardShell } from "../shared/DashboardShell";

// ── Student views ──────────────────────────────────────────────────────────────
import { StudentOverview }    from "./student/Overview";
import { StudentProfile }     from "./student/Profile";
import { SupervisorMatch }    from "./student/SupervisorMatch";
import { SkillGap }           from "./student/SkillGap";
import { ThesisSubmission }   from "./student/ThesisSubmission";
import { ThesisHealth }       from "./student/ThesisHealth";
import { Internships }        from "./student/Internships";
import { InterviewScheduler } from "./student/InterviewScheduler";
import { QRCredential }       from "./student/QRCredential";

// ── Supervisor views ───────────────────────────────────────────────────────────
import { SupervisorOverview } from "./supervisor/Overview";
import { BlindReview }        from "./supervisor/BlindReview";
import { CapacitySettings }   from "./supervisor/Capacity";
import { FeedbackPage }       from "./supervisor/Feedback";

// ── Admin views ────────────────────────────────────────────────────────────────
import { AdminOverview }   from "./admin/Overview";
import { UserManagement }  from "./admin/UserManagement";
import { InterUniversity } from "./admin/InterUniversity";
import { ReportsView }     from "./admin/Reports";
import { SystemSettings }  from "./admin/SystemSettings";

// ── Company views ──────────────────────────────────────────────────────────────
import { CompanyOverview }   from "./company/Overview";
import { JobPostingForm }    from "./company/JobPostingForm";
import { CompanyApplicants } from "./company/Applicants";

// ── Alumni views ───────────────────────────────────────────────────────────────
import { AlumniOverview }  from "./alumni/Overview";
import { MentorshipPage }  from "./alumni/Mentorship";
import { MessagesPage }    from "./alumni/Messages";

// ── Shared views ───────────────────────────────────────────────────────────────
import { NotificationsView } from "./shared/Notifications";
import { SettingsView }      from "./shared/Settings";
import { HelpView }          from "./shared/Help";

import type { Role } from "../edu-data";

// ── RBAC matrix ───────────────────────────────────────────────────────────────

const ROLE_SECTIONS: Record<Role, string[]> = {
  student:    ["overview","profile","supervisors","skillgap","thesis","health","internships","interviews","qr"],
  supervisor: ["overview","applicants","capacity","feedback"],
  admin:      ["overview","users","universities","reports","settings"],
  company:    ["overview","post","applicants"],
  alumni:     ["overview","mentorship","messages"],
};

const SHARED_SECTIONS = new Set(["notifications","settings-shared","help"]);

// ── Section renderer ───────────────────────────────────────────────────────────

function renderSection(section: string, role: Role, userId: number, profileId: number | null) {
  // Shared sections available to every role
  if (section === "notifications")   return <NotificationsView userId={userId} />;
  if (section === "settings-shared") return <SettingsView userId={userId} />;
  if (section === "help")            return <HelpView />;

  // Student
  if (role === "student") {
    if (section === "overview")   return <StudentOverview   userId={userId} profileId={profileId} />;
    if (section === "profile")    return <StudentProfile    userId={userId} profileId={profileId} />;
    if (section === "supervisors") return <SupervisorMatch  userId={userId} profileId={profileId} />;
    if (section === "skillgap")   return <SkillGap          userId={userId} />;
    if (section === "thesis")     return <ThesisSubmission  profileId={profileId} />;
    if (section === "health")     return <ThesisHealth      profileId={profileId} />;
    if (section === "internships") return <Internships      userId={userId} />;
    if (section === "interviews") return <InterviewScheduler userId={userId} />;
    if (section === "qr")         return <QRCredential      profileId={profileId} />;
  }

  // Supervisor
  if (role === "supervisor") {
    if (section === "overview")   return <SupervisorOverview userId={userId} profileId={profileId} />;
    if (section === "applicants") return <BlindReview        profileId={profileId} />;
    if (section === "capacity")   return <CapacitySettings   profileId={profileId} />;
    if (section === "feedback")   return <FeedbackPage       profileId={profileId} />;
  }

  // Admin
  if (role === "admin") {
    if (section === "overview")     return <AdminOverview userId={userId} />;
    if (section === "users")        return <UserManagement />;
    if (section === "universities") return <InterUniversity />;
    if (section === "reports")      return <ReportsView />;
    if (section === "settings")     return <SystemSettings />;
  }

  // Company
  if (role === "company") {
    if (section === "overview")   return <CompanyOverview   userId={userId} />;
    if (section === "post")       return <JobPostingForm    userId={userId} />;
    if (section === "applicants") return <CompanyApplicants userId={userId} />;
  }

  // Alumni
  if (role === "alumni") {
    if (section === "overview")   return <AlumniOverview   userId={userId} profileId={profileId} />;
    if (section === "mentorship") return <MentorshipPage   profileId={profileId} />;
    if (section === "messages")   return <MessagesPage     userId={userId} />;
  }

  return null;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { section = "overview" } = useParams<{ section: string }>();
  const { user, role }           = usePortal();

  // This should never be null here (AuthGuard runs upstream), but guard anyway.
  if (!user) return <Navigate to="/login" replace />;

  const userId    = user.user_id;
  const profileId = user.profile_id;

  // RBAC: block sections that don't belong to this role
  const isShared     = SHARED_SECTIONS.has(section);
  const isValidForRole = ROLE_SECTIONS[role]?.includes(section);

  if (!isShared && !isValidForRole) {
    // Silently redirect back to overview instead of crashing
    toast.error("That section isn't available for your account.");
    return <Navigate to="/portal/overview" replace />;
  }

  const content = renderSection(section, role, userId, profileId);

  return (
    <DashboardShell>
      {content ?? <Navigate to="/portal/overview" replace />}
    </DashboardShell>
  );
}
