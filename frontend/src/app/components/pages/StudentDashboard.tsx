import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Activity,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Upload,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
  Building2,
  Download,
  User,
  GraduationCap,
  Calendar,
  QrCode,
  LayoutDashboard,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

/* ==========================================================================
   SHARED UI COMPONENTS (Inlined for single-page portability)
   ========================================================================== */

function SectionTitle({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--edu-primary)" }}
        >
          {title}
        </h2>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
            {sub}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: any;
  color: string;
}) {
  return (
    <Card className="p-4 rounded-2xl bg-white border-0 edu-card-shadow flex items-start justify-between">
      <div>
        <p
          className="text-xs font-medium"
          style={{ color: "var(--edu-light)" }}
        >
          {label}
        </p>
        <h3
          className="text-xl font-bold mt-1 tracking-tight"
          style={{ color: "var(--edu-primary)" }}
        >
          {value}
        </h3>
        <p className="text-[11px] mt-0.5 font-medium" style={{ color }}>
          {sub}
        </p>
      </div>
      <div
        className="p-2 rounded-xl"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon size={18} />
      </div>
    </Card>
  );
}

function UploadArea({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition hover:bg-slate-50/50"
        style={{ borderColor: "var(--edu-border)" }}
      >
        <Upload
          size={24}
          className="mx-auto mb-2"
          style={{ color: "var(--edu-light)" }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: "var(--edu-primary)" }}
        >
          Click to upload or drag & drop
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--edu-light)" }}>
          Supported: PDF, DOCX up to 10MB
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   BACKEND TYPES DEFINITIONS
   ========================================================================== */

interface Student {
  name: string;
  department: string;
  university: string;
  email: string;
  cgpa: number;
  thesisHealth: number;
  matchingScore: number;
  skills: string[];
  interests: string[];
}

interface Supervisor {
  id: number;
  name: string;
  expertise: string;
  photo: string;
  match: number;
  quota: number;
  current: number;
}

interface Course {
  id: number;
  name: string;
  provider: string;
  duration: string;
  difficulty: string;
}

interface Milestone {
  name: string;
  date: string;
  status: "done" | "active" | "pending";
}

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

interface ProgressPoint {
  week: string;
  progress: number;
}

interface Internship {
  id: number;
  role: string;
  company: string;
  match: number;
  salary: string;
  skills: string[];
}

interface DashboardPayload {
  student: Student;
  supervisors: Supervisor[];
  courses: Course[];
  milestones: Milestone[];
  notifications: NotificationItem[];
  progressData: ProgressPoint[];
  internships: Internship[];
}

/* ==========================================================================
   MAIN INTEGRATED PAGE COMPONENT
   ========================================================================== */

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Supervisor matching view state filter logic
  const [searchQuery, setSearchQuery] = useState("");
  const [minMatch, setMinMatch] = useState([70]);

  // Interview view state tracking
  const [selectedDaySlot, setSelectedDaySlot] = useState<string | null>(null);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch aggregated datasets straight out of the single backend endpoint handler
    fetch("http://localhost/EduMatch/backend/get_student_dashboard.php")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP Network request fault.");
        return res.json();
      })
      .then((payload: DashboardPayload) => {
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          "Failed to query live profile telemetry from database layer.",
        );
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse space-y-2 text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
            style={{
              borderColor:
                "var(--edu-primary) transparent transparent transparent",
            }}
          />
          <p className="text-sm font-medium text-slate-500 mt-2">
            Assembling Dashboard Environment...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-500 font-semibold">
            Critical Operational System Error
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Unable to interface with core operational datasets. Ensure your
            development local server environment maps to standard target path
            strings.
          </p>
        </Card>
      </div>
    );
  }

  const {
    student,
    supervisors,
    courses,
    milestones,
    notifications,
    progressData,
    internships,
  } = data;

  // Global static calculation scopes parsed dynamically matching initial layouts
  const requiredSkills = [
    "Python",
    "PyTorch",
    "Statistics",
    "Research Writing",
    "SQL",
    "Linear Algebra",
  ];
  const missingSkills = requiredSkills.filter(
    (r) => !student.skills.includes(r),
  );

  const filteredSupervisors = supervisors.filter(
    (s) =>
      s.match >= minMatch[0] &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.expertise.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const submissionDeadline = new Date();
  submissionDeadline.setDate(submissionDeadline.getDate() + 12);
  const contextualRemainingDays = Math.ceil(
    (submissionDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const submissionHistoryRecords = [
    { c: "Proposal", d: "Feb 10", p: "4%", st: "Approved" },
    { c: "Chapter 1", d: "Mar 02", p: "5%", st: "Approved" },
    { c: "Chapter 2", d: "Mar 28", p: "7%", st: "Revisions" },
    { c: "Chapter 3", d: "Apr 22", p: "6%", st: "In Review" },
  ];

  const pieHealthData = [
    { name: "score", v: student.thesisHealth },
    { name: "rest", v: 100 - student.thesisHealth },
  ];
  const healthMetricsBreakdown = [
    { l: "Timeliness", v: 92 },
    { l: "Plagiarism Safety", v: 94 },
    { l: "Supervisor Feedback", v: 81 },
    { l: "Completion Rate", v: 78 },
  ];

  const simulationCalendarDays = Array.from({ length: 7 }, (_, i) => {
    const calculatedDay = new Date();
    calculatedDay.setDate(calculatedDay.getDate() + i);
    return calculatedDay;
  });
  const systemAvailableTimeslots = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:30",
    "16:00",
  ];

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* SIDEBAR NAVIGATION VIEW CONTROL LAYER */}
      <aside
        className="w-64 border-r hidden md:block p-6 space-y-6 bg-white shrink-0"
        style={{ borderColor: "var(--edu-border)" }}
      >
        <div
          className="flex items-center gap-2 font-bold text-lg"
          style={{ color: "var(--edu-primary)" }}
        >
          <GraduationCap className="h-6 w-6" />
          <span>EduMatch Panel</span>
        </div>

        <nav className="space-y-1">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "profile", label: "Academic Profile", icon: User },
            { id: "matching", label: "Supervisor Matching", icon: Sparkles },
            { id: "skillgap", label: "Skill Gap Matrix", icon: Activity },
            { id: "submissions", label: "Thesis Pipeline", icon: Upload },
            { id: "health", label: "Telemetry & Health", icon: ShieldCheck },
            { id: "internships", label: "Internships", icon: Briefcase },
            { id: "scheduler", label: "Interview Engine", icon: Calendar },
            { id: "credentials", label: "Secured Certificate", icon: QrCode },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition"
                style={{
                  background: isSelected ? "var(--edu-primary)" : "transparent",
                  color: isSelected ? "white" : "var(--edu-dark)",
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* VIEWPORT CONTROLLER */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* MOBILE NAVIGATION BAR TABS CONTAINER */}
        <div className="md:hidden mb-4 overflow-x-auto whitespace-nowrap flex gap-1 p-1 bg-white rounded-xl border">
          {[
            "overview",
            "profile",
            "matching",
            "skillgap",
            "submissions",
            "health",
            "internships",
            "scheduler",
            "credentials",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${activeTab === t ? "bg-slate-900 text-white" : "text-slate-600"}`}
            >
              {t === "skillgap" ? "Skills Matrix" : t}
            </button>
          ))}
        </div>

        {/* 1. OVERVIEW SCREEN TAB INTERACTION VIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 fade-in-up">
            <div className="rounded-3xl p-6 md:p-8 edu-gradient text-white edu-card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="opacity-90 text-sm">Welcome back,</div>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                  {student.name} 👋
                </h1>
                <p className="opacity-90 mt-1">
                  You're 87% on track. 2 supervisor recommendations and 1 new
                  internship match are waiting.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className="rounded-full"
                  style={{ background: "var(--edu-accent)" }}
                  onClick={() => setActiveTab("submissions")}
                >
                  Submit chapter <Upload size={16} className="ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full bg-transparent border-white text-white hover:bg-white/10"
                  onClick={() => setActiveTab("submissions")}
                >
                  View thesis
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Thesis Health"
                value={`${student.thesisHealth}/100`}
                sub="Excellent"
                icon={Activity}
                color="#28a745"
              />
              <StatCard
                label="Match Score"
                value={`${student.matchingScore}%`}
                sub="Top supervisor: Dr. Ahmed"
                icon={Sparkles}
                color="#1a5f7a"
              />
              <StatCard
                label="Plagiarism"
                value="6%"
                sub="Within safe range"
                icon={ShieldCheck}
                color="#17a2b8"
              />
              <StatCard
                label="Internships"
                value="4"
                sub="3 in review"
                icon={Briefcase}
                color="#ff9f29"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
                <SectionTitle
                  title="Thesis Progress"
                  sub="Weekly milestone completion"
                />
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={progressData}>
                      <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                      <XAxis dataKey="week" stroke="#6c757d" />
                      <YAxis stroke="#6c757d" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="#1a5f7a"
                        strokeWidth={3}
                        dot={{ fill: "#57c5b6", r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
                <SectionTitle title="Submission Timeline" />
                <ol
                  className="relative border-l-2 ml-3 space-y-5"
                  style={{ borderColor: "var(--edu-border)" }}
                >
                  {milestones.map((m, i) => (
                    <li key={i} className="ml-5">
                      <span
                        className="absolute -left-[11px] w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            m.status === "done"
                              ? "#28a745"
                              : m.status === "active"
                                ? "#ff9f29"
                                : "#e9ecef",
                          color: "white",
                        }}
                      >
                        {m.status === "done" ? (
                          <CheckCircle2 size={12} />
                        ) : m.status === "active" ? (
                          <Clock size={12} />
                        ) : null}
                      </span>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--edu-light)" }}
                      >
                        {m.date}
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
                <SectionTitle
                  title="Recommended Supervisors"
                  action={
                    <Button
                      variant="ghost"
                      style={{ color: "var(--edu-primary)" }}
                      onClick={() => setActiveTab("matching")}
                    >
                      See all <ChevronRight size={16} />
                    </Button>
                  }
                />
                <div className="space-y-3">
                  {supervisors.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-xl border hover-lift"
                      style={{ borderColor: "var(--edu-border)" }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="edu-gradient text-white">
                            {s.photo}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--edu-light)" }}
                          >
                            {s.expertise}
                          </div>
                        </div>
                      </div>
                      <Badge
                        style={{
                          background: "rgba(40,167,69,0.12)",
                          color: "#28a745",
                        }}
                      >
                        {s.match}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
                <SectionTitle title="Suggested Free Courses" />
                <div className="space-y-3">
                  {courses.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl border"
                      style={{ borderColor: "var(--edu-border)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: "rgba(26,95,122,0.08)",
                            color: "var(--edu-primary)",
                          }}
                        >
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--edu-light)" }}
                          >
                            {c.provider} · {c.duration}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Enrolled in ${c.name}`)}
                      >
                        Enroll
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
              <SectionTitle title="Recent Notifications" />
              <div className="space-y-2">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      background: n.unread
                        ? "rgba(87,197,182,0.08)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full edu-gradient text-white flex items-center justify-center">
                        <Bell size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{n.title}</div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--edu-light)" }}
                        >
                          {n.body}
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: "var(--edu-light)" }}
                    >
                      {n.time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 2. ACADEMIC PROFILE VIEWS TAB */}
        {activeTab === "profile" && (
          <div className="space-y-6 fade-in-up">
            <SectionTitle
              title="Profile & Skills"
              sub="Keep your profile updated for better matches."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 p-6 rounded-2xl bg-white edu-card-shadow border-0 text-center">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarFallback className="edu-gradient text-white text-2xl">
                    FL
                  </AvatarFallback>
                </Avatar>
                <h3
                  className="mt-3 font-semibold"
                  style={{ color: "var(--edu-primary)" }}
                >
                  {student.name}
                </h3>
                <p style={{ color: "var(--edu-light)" }}>
                  {student.department} · {student.university}
                </p>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() =>
                    toast.info("Profile customization modal activated.")
                  }
                >
                  Edit profile
                </Button>
              </Card>
              <Card className="md:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
                <Tabs defaultValue="academic">
                  <TabsList>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="academic"
                    className="grid md:grid-cols-2 gap-4 mt-4"
                  >
                    <div>
                      <Label>CGPA</Label>
                      <Input
                        defaultValue={student.cgpa.toString()}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>University</Label>
                      <Input
                        defaultValue={student.university}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input
                        defaultValue={student.department}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input defaultValue={student.email} className="mt-1" />
                    </div>
                  </TabsContent>
                  <TabsContent value="skills" className="mt-4 space-y-4">
                    <div>
                      <Label>Skills</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {student.skills.map((s) => (
                          <Badge
                            key={s}
                            className="rounded-full"
                            style={{
                              background: "rgba(26,95,122,0.1)",
                              color: "var(--edu-primary)",
                            }}
                          >
                            {s}
                          </Badge>
                        ))}
                        <Badge
                          className="rounded-full cursor-pointer"
                          style={{
                            background: "var(--edu-bg)",
                            color: "var(--edu-light)",
                          }}
                        >
                          + Add
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Research Interests</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {student.interests.map((s) => (
                          <Badge
                            key={s}
                            className="rounded-full"
                            style={{
                              background: "rgba(87,197,182,0.18)",
                              color: "var(--edu-primary)",
                            }}
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="files" className="mt-4 space-y-3">
                    <UploadArea label="Upload Resume (PDF)" />
                    <UploadArea label="Upload Certificates" />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        )}

        {/* 3. AI SUPERVISOR MATCH ENGINE */}
        {activeTab === "matching" && (
          <div className="space-y-6 fade-in-up">
            <SectionTitle
              title="Supervisor Matching"
              sub="Ranked by AI compatibility based on your profile."
            />
            <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
              <div className="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label>Search</Label>
                  <div className="relative mt-1">
                    <Search
                      className="absolute left-3 top-3"
                      size={16}
                      style={{ color: "var(--edu-light)" }}
                    />
                    <Input
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name or expertise"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Minimum match: {minMatch[0]}%</Label>
                  <Slider
                    value={minMatch}
                    onValueChange={setMinMatch}
                    min={50}
                    max={100}
                    step={1}
                    className="mt-3"
                  />
                </div>
              </div>
            </Card>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSupervisors.map((s) => (
                <Card
                  key={s.id}
                  className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="edu-gradient text-white">
                        {s.photo}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div
                        style={{ fontWeight: 600, color: "var(--edu-primary)" }}
                      >
                        {s.name}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--edu-light)" }}
                      >
                        {s.expertise}
                      </div>
                    </div>
                    <Badge
                      className="text-base px-3 py-1.5 rounded-full"
                      style={{
                        background: "rgba(40,167,69,0.12)",
                        color: "#28a745",
                      }}
                    >
                      {s.match}%
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: "var(--edu-bg)" }}
                    >
                      <div
                        className="text-xs"
                        style={{ color: "var(--edu-light)" }}
                      >
                        Quota
                      </div>
                      <div style={{ fontWeight: 700 }}>{s.quota}</div>
                    </div>
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: "var(--edu-bg)" }}
                    >
                      <div
                        className="text-xs"
                        style={{ color: "var(--edu-light)" }}
                      >
                        Current
                      </div>
                      <div style={{ fontWeight: 700 }}>{s.current}</div>
                    </div>
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: "var(--edu-bg)" }}
                    >
                      <div
                        className="text-xs"
                        style={{ color: "var(--edu-light)" }}
                      >
                        Open
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color:
                            s.quota - s.current > 0 ? "#28a745" : "#dc3545",
                        }}
                      >
                        {s.quota - s.current}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      toast.success(
                        `Application successfully routed to ${s.name}`,
                      )
                    }
                    disabled={s.current >= s.quota}
                    className="mt-4 w-full rounded-xl"
                    style={{ background: "var(--edu-primary)" }}
                  >
                    {s.current >= s.quota ? "Quota Full" : "Apply"}
                  </Button>
                </Card>
              ))}
              {filteredSupervisors.length === 0 && (
                <Card
                  className="md:col-span-2 p-10 rounded-2xl text-center"
                  style={{ color: "var(--edu-light)" }}
                >
                  No supervisors match these filters.
                </Card>
              )}
            </div>
          </div>
        )}

        {/* 4. SKILL GAP TELEMETRY SECTION */}
        {activeTab === "skillgap" && (
          <div className="space-y-6 fade-in-up">
            <SectionTitle
              title="Skill Gap Analysis"
              sub="Compared against Dr. Ahmed Rahman's research focus."
            />
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
                <h3
                  className="font-semibold"
                  style={{ color: "var(--edu-primary)" }}
                >
                  Required Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {requiredSkills.map((s) => (
                    <Badge
                      key={s}
                      className="rounded-full"
                      style={{
                        background: "rgba(26,95,122,0.1)",
                        color: "var(--edu-primary)",
                      }}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </Card>
              <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
                <h3
                  className="font-semibold"
                  style={{ color: "var(--edu-primary)" }}
                >
                  Existing Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {student.skills.map((s) => (
                    <Badge
                      key={s}
                      className="rounded-full"
                      style={{
                        background: "rgba(40,167,69,0.12)",
                        color: "#28a745",
                      }}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </Card>
              <Card className="p-5 rounded-2xl bg-white edu-card-shadow border-0">
                <h3
                  className="font-semibold"
                  style={{ color: "var(--edu-primary)" }}
                >
                  Missing Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingSkills.length === 0 && (
                    <Badge>None — you're completely optimized!</Badge>
                  )}
                  {missingSkills.map((s) => (
                    <Badge
                      key={s}
                      className="rounded-full"
                      style={{
                        background: "rgba(220,53,69,0.12)",
                        color: "#dc3545",
                      }}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            <SectionTitle title="Suggested Upskilling Pathways" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => (
                <Card
                  key={c.id}
                  className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift"
                >
                  <div className="w-12 h-12 rounded-xl edu-gradient flex items-center justify-center text-white">
                    <BookOpen />
                  </div>
                  <h3
                    className="mt-3 font-semibold"
                    style={{ color: "var(--edu-primary)" }}
                  >
                    {c.name}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--edu-light)" }}>
                    {c.provider}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{c.duration}</Badge>
                    <Badge variant="outline">{c.difficulty}</Badge>
                  </div>
                  <Button
                    className="w-full mt-4"
                    style={{ background: "var(--edu-accent)" }}
                    onClick={() => toast.success(`Enrolled in ${c.name}`)}
                  >
                    Enroll Free
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 5. THESIS SUBMISSIONS AND DEADLINE ENGINE */}
        {activeTab === "submissions" && (
          <div className="space-y-6 fade-in-up">
            <SectionTitle title="Thesis Submission Hub" />
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
                <UploadArea label="Upload next chapter (PDF/DOCX)" />
                <h3
                  className="mt-6 font-semibold"
                  style={{ color: "var(--edu-primary)" }}
                >
                  Submission History Matrix
                </h3>
                <Table className="mt-3">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Plagiarism</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissionHistoryRecords.map((r) => (
                      <TableRow key={r.c}>
                        <TableCell className="font-medium">{r.c}</TableCell>
                        <TableCell>{r.d}</TableCell>
                        <TableCell>{r.p}</TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              background:
                                r.st === "Approved"
                                  ? "rgba(40,167,69,0.12)"
                                  : r.st === "Revisions"
                                    ? "rgba(255,193,7,0.18)"
                                    : "rgba(23,162,184,0.12)",
                              color:
                                r.st === "Approved"
                                  ? "#28a745"
                                  : r.st === "Revisions"
                                    ? "#a76f00"
                                    : "#17a2b8",
                            }}
                          >
                            {r.st}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-6 rounded-2xl edu-gradient text-white edu-card-shadow border-0 flex flex-col justify-between">
                <div>
                  <div className="opacity-80 text-sm">
                    Next Institutional Deadline
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                    {contextualRemainingDays} days
                  </div>
                  <div className="opacity-90">
                    Chapter 4 — {submissionDeadline.toDateString()}
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-white/15">
                    <div className="text-sm">
                      Latest computed validation score
                    </div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                      6% Plagiarism
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Textarea
                    placeholder="Append critical notes for review supervisor..."
                    className="bg-white/10 text-white placeholder:text-white/60 border-white/20 rounded-xl"
                  />
                  <Button
                    className="w-full mt-3 bg-white text-slate-900 hover:bg-white/90"
                    onClick={() =>
                      toast.success("Draft notes compiled successfully.")
                    }
                  >
                    Save Review Dispatch
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 6. HEALTH SCORE BREAKDOWN CHARTS */}
        {activeTab === "health" && (
          <div className="space-y-6 fade-in-up">
            <SectionTitle
              title="Thesis Health Tracker"
              sub="Holistic AI metrics monitoring structural progress vector graphs."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 flex flex-col items-center justify-center text-center">
                <div className="relative h-56 w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieHealthData}
                        dataKey="v"
                        innerRadius={70}
                        outerRadius={95}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill="#28a745" />
                        <Cell fill="#e9ecef" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "#28a745",
                      }}
                    >
                      {student.thesisHealth}
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "var(--edu-light)" }}
                    >
                      Excellent
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="md:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
                <h3
                  className="font-semibold"
                  style={{ color: "var(--edu-primary)" }}
                >
                  Metric Structural Vectors
                </h3>
                {healthMetricsBreakdown.map((b) => (
                  <div key={b.l} className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{b.l}</span>
                      <span style={{ color: "var(--edu-light)" }}>
                        {b.v}/100
                      </span>
                    </div>
                    <Progress value={b.v} className="h-2" />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* 7. RECRUITMENT MATCHES PIPELINE */}
        {activeTab === "internships" && (
          <div className="space-y-6 fade-in-up">
            <SectionTitle
              title="Corporate Internships pipeline"
              sub="Firms ordered by alignment parameters."
            />
            <div className="grid md:grid-cols-2 gap-4">
              {internships.map((i) => (
                <Card
                  key={i.id}
                  className="p-5 rounded-2xl bg-white edu-card-shadow border-0 hover-lift"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
                      style={{ background: "var(--edu-primary)" }}
                    >
                      <Building2 />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate">
                          <div
                            className="font-bold text-slate-800 truncate"
                            style={{ color: "var(--edu-primary)" }}
                          >
                            {i.role}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "var(--edu-light)" }}
                          >
                            {i.company}
                          </div>
                        </div>
                        <Badge
                          className="shrink-0"
                          style={{
                            background: "rgba(40,167,69,0.12)",
                            color: "#28a745",
                          }}
                        >
                          {i.match}%
                        </Badge>
                      </div>
                      <div
                        className="mt-2 text-sm font-semibold"
                        style={{ color: "var(--edu-light)" }}
                      >
                        {i.salary}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {i.skills.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          className="flex-1 rounded-xl"
                          style={{ background: "var(--edu-accent)" }}
                          onClick={() =>
                            toast.success(`Application sent to ${i.company}`)
                          }
                        >
                          Apply
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-xl">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 8. PLANNED PANEL SCHEDULER ENGINE */}
        {activeTab === "scheduler" && (
          <div className="space-y-6 fade-in-up">
            <SectionTitle
              title="Interview Placement Matrix"
              sub="Claim structural processing windows."
            />
            <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0">
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {simulationCalendarDays.map((d, i) => {
                  const dateString = d.toDateString();
                  const isSelected = selectedDaySlot === dateString;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDaySlot(dateString)}
                      className="p-3 rounded-xl text-center transition flex flex-col justify-center items-center"
                      style={{
                        background: isSelected
                          ? "var(--edu-primary)"
                          : "var(--edu-bg)",
                        color: isSelected ? "white" : "var(--edu-dark)",
                      }}
                    >
                      <div className="text-xs opacity-70 uppercase tracking-wider">
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </div>
                      <div
                        style={{ fontWeight: 700, fontSize: "1.1rem" }}
                        className="mt-1"
                      >
                        {d.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedDaySlot && (
                <div className="fade-in-up">
                  <h3
                    className="mt-6 font-bold text-sm tracking-tight"
                    style={{ color: "var(--edu-primary)" }}
                  >
                    Available Processing Windows — {selectedDaySlot}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {systemAvailableTimeslots.map((t) => (
                      <Dialog
                        key={t}
                        open={isInterviewDialogOpen}
                        onOpenChange={setIsInterviewDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <button
                            className="px-4 py-2 rounded-xl border bg-white font-medium text-sm transition hover-lift text-slate-700"
                            style={{ borderColor: "var(--edu-border)" }}
                            onClick={() => setIsInterviewDialogOpen(true)}
                          >
                            {t}
                          </button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Confirm Interview Slot Allocation
                            </DialogTitle>
                          </DialogHeader>
                          <p className="text-slate-600 text-sm">
                            Locking in automated profile review sequence down
                            timeline anchor <strong>{selectedDaySlot}</strong>{" "}
                            at <strong>{t}</strong>?
                          </p>
                          <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => setIsInterviewDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="rounded-xl"
                              style={{ background: "var(--edu-primary)" }}
                              onClick={() => {
                                setIsInterviewDialogOpen(false);
                                toast.success(
                                  `Interview confirmed for ${t} on ${selectedDaySlot}`,
                                );
                              }}
                            >
                              Confirm Allocation
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 9. CRYPTOGRAPHIC VERIFIABLE CREDENTIAL LAB */}
        {activeTab === "credentials" && (
          <div className="space-y-6 fade-in-up">
            <SectionTitle
              title="QR Verifiable Blockchain Document"
              sub="Tamper-proof verifiable telemetry payload structure."
            />
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 rounded-2xl edu-gradient text-white edu-card-shadow border-0 text-center flex flex-col justify-between items-center">
                <div className="w-full">
                  <div className="text-sm opacity-80 uppercase tracking-widest font-semibold">
                    EduMatch Verification Protocol
                  </div>
                  <h2 style={{ fontWeight: 700 }} className="mt-2 text-xl">
                    {student.name}
                  </h2>
                  <div className="text-sm opacity-90">
                    {student.department} · {student.university}
                  </div>
                </div>

                <div className="my-6 w-48 h-48 bg-white p-4 rounded-2xl flex items-center justify-center shadow-inner">
                  <div className="w-full h-full grid grid-cols-12 grid-rows-12 gap-px">
                    {Array.from({ length: 144 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          background:
                            (i * 7) % 5 === 0 || i % 3 === 0
                              ? "#1a5f7a"
                              : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="w-full">
                  <div className="text-xs font-mono opacity-80 bg-black/10 py-1.5 rounded-lg px-2 inline-block">
                    ID: EM-2026-LIMU-0042
                  </div>
                  <div className="mt-6 flex gap-2 justify-center w-full">
                    <Button
                      className="rounded-xl flex-1 max-w-[140px]"
                      style={{ background: "var(--edu-accent)" }}
                      onClick={() =>
                        toast.success("Verification bundle PDF compiling...")
                      }
                    >
                      <Download size={16} className="mr-2" /> Download
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white/10 rounded-xl flex-1 max-w-[140px]"
                      onClick={() => toast.info("Public routing key copied.")}
                    >
                      Share
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-2xl bg-white edu-card-shadow border-0 space-y-6">
                <div>
                  <h3
                    className="font-bold text-sm tracking-tight"
                    style={{ color: "var(--edu-primary)" }}
                  >
                    Verified System Competencies
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {student.skills.map((s) => (
                      <Badge
                        key={s}
                        className="rounded-full py-1 text-xs"
                        style={{
                          background: "rgba(40,167,69,0.12)",
                          color: "#28a745",
                        }}
                      >
                        <CheckCircle2 size={12} className="mr-1 inline" /> {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <hr style={{ borderColor: "var(--edu-border)" }} />
                <div>
                  <h3
                    className="font-bold text-sm tracking-tight"
                    style={{ color: "var(--edu-primary)" }}
                  >
                    Institutional Authorization Root
                  </h3>
                  <div
                    className="mt-3 p-4 rounded-xl border flex items-center gap-3"
                    style={{ borderColor: "var(--edu-border)" }}
                  >
                    <Avatar>
                      <AvatarFallback className="edu-gradient text-white">
                        AR
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-800">
                        Dr. Ahmed Rahman
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--edu-light)" }}
                      >
                        Signed Crypto-Root · Apr 30, 2026
                      </div>
                    </div>
                    <CheckCircle2
                      className="ml-auto shrink-0"
                      style={{ color: "#28a745" }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
