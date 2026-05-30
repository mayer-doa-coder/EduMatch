import { useState, useEffect } from "react";
import { Role } from "../edu-data";
import { DashboardShell } from "../shared/DashboardShell";
import { toast } from "sonner";

// Student Views
import { StudentOverview } from "./student/Overview";
import { StudentProfile } from "./student/Profile";
import { SupervisorMatch } from "./student/SupervisorMatch";
import { SkillGap } from "./student/SkillGap";
import { ThesisSubmission } from "./student/ThesisSubmission";
import { ThesisHealth } from "./student/ThesisHealth";
import { Internships } from "./student/Internships";
import { InterviewScheduler } from "./student/InterviewScheduler";
import { QRCredential } from "./student/QRCredential";

// Supervisor/Faculty Views
import { SupervisorOverview } from "./supervisor/Overview";
import { BlindReview } from "./supervisor/BlindReview";
import { CapacitySettings } from "./supervisor/Capacity";
import { FeedbackPage } from "./supervisor/Feedback";

// Admin Views
import { AdminOverview } from "./admin/Overview";
import { UserManagement } from "./admin/UserManagement";
import { InterUniversity } from "./admin/InterUniversity";
import { ReportsView } from "./admin/Reports";
import { SystemSettings } from "./admin/SystemSettings";

// Company Views
import { CompanyOverview } from "./company/Overview";
import { JobPostingForm } from "./company/JobPostingForm";
import { CompanyApplicants } from "./company/Applicants";

// Alumni Views
import { AlumniOverview } from "./alumni/Overview";
import { MentorshipPage } from "./alumni/Mentorship";
import { MessagesPage } from "./alumni/Messages";

// Shared Views
import { NotificationsView } from "./shared/Notifications";
import { SettingsView } from "./shared/Settings";
import { HelpView } from "./shared/Help";

type Props = {
  role: Role;
  onLogout: () => void;
  onSwitchRole: (r: Role) => void;
};

interface AuthUser {
  user_id: number;
  profile_id: number | null;
  name: string;
  email: string;
  role: string;
}

/* ==========================================================================
   ROLE-BASED ACCESS CONTROL (RBAC) AUTHORIZATION MATRIX
   ========================================================================== */
const VALID_ROLE_ROUTES: Record<Role, string[]> = {
  admin: ["overview", "users", "universities", "reports", "settings"],
  student: [
    "overview",
    "profile",
    "supervisors",
    "skillgap",
    "thesis",
    "health",
    "internships",
    "interviews",
    "qr",
  ],
  supervisor: ["overview", "applicants", "capacity", "feedback"],
  company: ["overview", "post", "applicants"],
  alumni: ["overview", "mentorship", "messages"],
};

const SHARED_ROUTES = ["notifications", "settings-shared", "help"];

export function DashboardPage({ role, onLogout, onSwitchRole }: Props) {
  const [active, setActive] = useState("overview");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read from localStorage first; fall back to sessionStorage (set when "Remember me" is off)
    const storedUser =
      localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user");

    if (!storedUser) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_user");
      onLogout();
      return;
    }

    try {
      const parsedUser: AuthUser = JSON.parse(storedUser);

      /* ==========================================================================
         CRITICAL AUTHORIZATION LAYER: SECURITY PROFILE MISMATCH GUARD
         ========================================================================== */
      // Admins bypass standard contextual switches for cross-system telemetry review
      if (parsedUser.role !== "admin" && parsedUser.role !== role) {
        console.error(
          `Unauthorized Route Mutation Attempted: Target [${role}] does not match Auth token [${parsedUser.role}]`,
        );
        toast.error("Access Denied: Security signature verification failure.");

        // Force state back to the token's legitimate primary view
        if (Object.keys(VALID_ROLE_ROUTES).includes(parsedUser.role)) {
          onSwitchRole(parsedUser.role as Role);
          setActive("overview");
        } else {
          onLogout(); // Absolute terminal fallback
        }
        return;
      }

      setCurrentUser(parsedUser);
    } catch (err) {
      console.error("Session parse error:", err);
      toast.error("Session corrupted. Please log in again.");
      localStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_user");
      onLogout();
    } finally {
      setIsLoading(false);
    }
  }, [role, onLogout, onSwitchRole]);

  /* ==========================================================================
     ACTIVE ROUTE INTERACTION INTERCEPTOR
     ========================================================================== */
  const handleViewChange = (targetView: string) => {
    const isShared = SHARED_ROUTES.includes(targetView);
    const isValidForRole = VALID_ROLE_ROUTES[role]?.includes(targetView);

    if (!isShared && !isValidForRole) {
      console.warn(
        `Blocked traversal attempt to unassigned navigation block: [${targetView}] for Role: [${role}]`,
      );
      toast.error(
        "Privilege validation failure: Access to requested sub-module is restricted.",
      );
      setActive("overview"); // Force state rollback to a dependable baseline
      return;
    }

    setActive(targetView);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">
            Verifying cryptographic credentials and establishing secure
            pipelines...
          </p>
        </div>
      </div>
    );
  }

  // Final validation guard to catch structural inconsistencies
  if (!currentUser) return null;

  function handleLogout() {
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_user");
    onLogout();
  }

  return (
    <DashboardShell
      role={role}
      active={active}
      onActiveChange={handleViewChange}
      onLogout={handleLogout}
      onSwitchRole={(targetRole) => {
        // Enforce authorization constraint before allowing down-stream state updates
        if (currentUser.role !== "admin" && currentUser.role !== targetRole) {
          toast.error(
            "Operation Denied: Token lacks permission to assume specified profile.",
          );
          return;
        }
        setActive("overview");
        onSwitchRole(targetRole);
      }}
    >
      {/* ==========================================================================
         STUDENT CONTEXT TREE
         ========================================================================== */}
      {role === "student" && active === "overview" && (
        <StudentOverview
          userId={currentUser.user_id}
          profileId={currentUser.profile_id}
        />
      )}
      {role === "student" && active === "profile" && (
        <StudentProfile
          userId={currentUser.user_id}
          profileId={currentUser.profile_id}
        />
      )}
      {role === "student" && active === "supervisors" && (
        <SupervisorMatch
          userId={currentUser.user_id}
          profileId={currentUser.profile_id}
        />
      )}
      {role === "student" && active === "skillgap" && (
        <SkillGap userId={currentUser.user_id} />
      )}
      {role === "student" && active === "thesis" && (
        <ThesisSubmission profileId={currentUser.profile_id} />
      )}
      {role === "student" && active === "health" && (
        <ThesisHealth profileId={currentUser.profile_id} />
      )}
      {role === "student" && active === "internships" && (
        <Internships userId={currentUser.user_id} />
      )}
      {role === "student" && active === "interviews" && (
        <InterviewScheduler userId={currentUser.user_id} />
      )}
      {role === "student" && active === "qr" && (
        <QRCredential profileId={currentUser.profile_id} />
      )}

      {/* ==========================================================================
         SUPERVISOR / FACULTY CONTEXT TREE
         ========================================================================== */}
      {role === "supervisor" && active === "overview" && (
        <SupervisorOverview
          userId={currentUser.user_id}
          profileId={currentUser.profile_id}
        />
      )}
      {role === "supervisor" && active === "applicants" && (
        <BlindReview profileId={currentUser.profile_id} />
      )}
      {role === "supervisor" && active === "capacity" && (
        <CapacitySettings profileId={currentUser.profile_id} />
      )}
      {role === "supervisor" && active === "feedback" && (
        <FeedbackPage profileId={currentUser.profile_id} />
      )}

      {/* ==========================================================================
         ADMINISTRATIVE MANAGEMENT CONTEXT TREE
         ========================================================================== */}
      {role === "admin" && active === "overview" && (
        <AdminOverview userId={currentUser.user_id} />
      )}
      {role === "admin" && active === "users" && <UserManagement />}
      {role === "admin" && active === "universities" && <InterUniversity />}
      {role === "admin" && active === "reports" && <ReportsView />}
      {role === "admin" && active === "settings" && <SystemSettings />}

      {/* ==========================================================================
         CORPORATE PARTNER CONTEXT TREE
         ========================================================================== */}
      {role === "company" && active === "overview" && (
        <CompanyOverview userId={currentUser.user_id} />
      )}
      {role === "company" && active === "post" && (
        <JobPostingForm userId={currentUser.user_id} />
      )}
      {role === "company" && active === "applicants" && (
        <CompanyApplicants userId={currentUser.user_id} />
      )}

      {/* ==========================================================================
         ALUMNI NETWORK CONTEXT TREE
         ========================================================================== */}
      {role === "alumni" && active === "overview" && (
        <AlumniOverview
          userId={currentUser.user_id}
          profileId={currentUser.profile_id}
        />
      )}
      {role === "alumni" && active === "mentorship" && (
        <MentorshipPage profileId={currentUser.profile_id} />
      )}
      {role === "alumni" && active === "messages" && (
        <MessagesPage userId={currentUser.user_id} />
      )}

      {/* ==========================================================================
         SHARED PLATFORM SYSTEM CORE UTILITIES
         ========================================================================== */}
      {active === "notifications" && (
        <NotificationsView userId={currentUser.user_id} />
      )}
      {active === "settings-shared" && (
        <SettingsView userId={currentUser.user_id} />
      )}
      {active === "help" && <HelpView />}
    </DashboardShell>
  );
}
