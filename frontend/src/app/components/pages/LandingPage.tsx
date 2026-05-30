import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Activity, ArrowRight, Brain, Briefcase, PlayCircle, Sparkles,
  Target, ShieldCheck, QrCode, BookOpen, ChevronRight,
  Users, Building2, Award, Quote, GraduationCap,
  LayoutDashboard, Loader2, Clock, Lock, ExternalLink,
} from "lucide-react";
import { Role } from "../edu-data";
import { toast } from "sonner";

const API = "http://localhost/EduMatch/backend";

// Smooth-scroll to any section by id
const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

// ── Types ─────────────────────────────────────────────────────────────────────

type PageProps = {
  onGetStarted: () => void;
  onLogin:      () => void;
  onDashboard?: (role: Role) => void;
};

interface BackendData {
  students_matched: number;
  theses_tracked:   number;
  internships:      number;
  universities:     number;
}

type PreviewableRole = Exclude<Role, "admin">;

// Per-role dialog config
const ROLE_PREVIEW: Record<PreviewableRole, {
  title: string;
  desc:  string;
  type:  "supervisors" | "internships" | "alumni";
  cta:   string;
}> = {
  student:    { title: "Available Supervisors",      desc: "Browse supervisors actively accepting new thesis students.",         type: "supervisors",  cta: "Register as Student"   },
  supervisor: { title: "Our Supervisor Network",     desc: "See the researchers shaping the next generation of academics.",     type: "supervisors",  cta: "Join as Supervisor"    },
  company:    { title: "Open Internship Listings",   desc: "Active opportunities waiting for the right student talent.",        type: "internships",  cta: "Post an Internship"    },
  alumni:     { title: "Meet Our Mentors",           desc: "Experienced professionals giving back through mentorship sessions.",type: "alumni",       cta: "Become a Mentor"      },
};

// ── Counter ───────────────────────────────────────────────────────────────────

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let val = 0;
    const step = Math.ceil(to / (1500 / 16)) || 1;
    const t = setInterval(() => {
      val += step;
      if (val >= to) { setCount(to); clearInterval(t); }
      else setCount(val);
    }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// ── Section divider ───────────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div aria-hidden="true" style={{ display: "flex", alignItems: "center", padding: "0 48px" }}>
      <div style={{ flex: 1, height: 2, borderRadius: 2, background: "linear-gradient(90deg, transparent, rgba(87,197,182,0.65))" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px" }}>
        {([3, 5, 8, 5, 3] as number[]).map((size, i) => (
          <div key={i} style={{
            width: size, height: size, borderRadius: "50%",
            background: i === 2 ? "var(--edu-secondary)" : i === 1 || i === 3 ? "rgba(87,197,182,0.55)" : "rgba(87,197,182,0.28)",
            boxShadow: i === 2 ? "0 0 8px rgba(87,197,182,0.55)" : "none",
          }} />
        ))}
      </div>
      <div style={{ flex: 1, height: 2, borderRadius: 2, background: "linear-gradient(270deg, transparent, rgba(87,197,182,0.65))" }} />
    </div>
  );
}

// ── Role preview dialog ───────────────────────────────────────────────────────

function RolePreviewDialog({ role, onClose, onGetStarted }: {
  role:         PreviewableRole | null;
  onClose:      () => void;
  onGetStarted: () => void;
}) {
  const [items,   setItems]   = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    setItems([]);
    fetch(`${API}/preview.php?type=${ROLE_PREVIEW[role].type}`)
      .then(r => r.json())
      .then(d => { if (d.success) setItems(d.items ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role]);

  if (!role) return null;
  const cfg = ROLE_PREVIEW[role];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle style={{ color: "var(--edu-primary)", fontSize: "1.2rem" }}>{cfg.title}</DialogTitle>
          <p className="text-sm mt-1" style={{ color: "var(--edu-light)" }}>{cfg.desc}</p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" style={{ color: "var(--edu-primary)" }} size={32} />
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--edu-light)" }}>
            No records found. Be the first to join!
          </p>
        ) : (
          <div className="space-y-3 mt-2">
            {/* Supervisor rows */}
            {cfg.type === "supervisors" && items.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "var(--edu-bg)", border: "1px solid var(--edu-border)" }}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--edu-dark)" }}>{item.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
                      {item.designation} · {item.university}
                    </div>
                  </div>
                  <Badge style={{ background: "rgba(87,197,182,0.15)", color: "var(--edu-primary)", whiteSpace: "nowrap" }}>
                    {item.open_slots} slots open
                  </Badge>
                </div>
                {item.research_focus && (
                  <div className="mt-2 text-sm" style={{ color: "var(--edu-secondary)" }}>
                    {item.research_focus}
                  </div>
                )}
              </div>
            ))}

            {/* Internship rows */}
            {cfg.type === "internships" && items.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "var(--edu-bg)", border: "1px solid var(--edu-border)" }}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--edu-dark)" }}>{item.role_title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>{item.company_name}</div>
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--edu-accent)", whiteSpace: "nowrap" }}>
                    ৳{item.salary}/mo
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: "var(--edu-light)" }}>
                  <Clock size={11} /> Deadline: {item.deadline}
                </div>
                {item.required_skills && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.required_skills.split(",").map((s, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)" }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Alumni rows */}
            {cfg.type === "alumni" && items.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "var(--edu-bg)", border: "1px solid var(--edu-border)" }}>
                <div style={{ fontWeight: 600, color: "var(--edu-dark)" }}>{item.name}</div>
                {item.company && (
                  <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
                    {item.company} · {item.university}
                  </div>
                )}
                {item.expertise && (
                  <div className="mt-2 text-sm" style={{ color: "var(--edu-secondary)" }}>{item.expertise}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 flex gap-2" style={{ borderTop: "1px solid var(--edu-border)" }}>
          <Button className="flex-1 rounded-full" style={{ background: "var(--edu-primary)" }}
            onClick={() => { onClose(); onGetStarted(); }}>
            {cfg.cta} <ArrowRight size={15} className="ml-2" />
          </Button>
          <Button variant="outline" className="rounded-full px-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Spotlight (fixed mouse glow — zero re-renders) ────────────────────────────

function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        ref.current?.style.setProperty("--sx", `${e.clientX}px`);
        ref.current?.style.setProperty("--sy", `${e.clientY}px`);
      });
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="spotlight-overlay" />;
}

// ── Grid intersection nodes (hero area) ──────────────────────────────────────

const NODES = [
  { x: 60,  y: 120, delay: "0s",    dur: "3.2s", size: 4 },
  { x: 180, y: 60,  delay: "0.9s",  dur: "2.7s", size: 3 },
  { x: 300, y: 180, delay: "1.55s", dur: "3.6s", size: 4 },
  { x: 420, y: 60,  delay: "0.35s", dur: "2.5s", size: 3 },
  { x: 480, y: 300, delay: "1.2s",  dur: "3.9s", size: 5 },
  { x: 900, y: 120, delay: "0.7s",  dur: "3.1s", size: 4 },
  { x: 1020,y: 60,  delay: "1.5s",  dur: "2.8s", size: 3 },
  { x: 1140,y: 240, delay: "0.2s",  dur: "3.4s", size: 4 },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export function LandingPage({ onGetStarted, onLogin, onDashboard }: PageProps) {
  const [apiData,     setApiData]     = useState<BackendData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [previewRole, setPreviewRole] = useState<PreviewableRole | null>(null);

  useEffect(() => {
    fetch(`${API}/landing.php`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success && d.data) setApiData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-grid-bg min-h-screen" style={{ color: "var(--edu-dark)" }}>
      <Spotlight />
      <div style={{ position: "relative", zIndex: 1 }}>
        <LandingNavbar  onGetStarted={onGetStarted} onLogin={onLogin} onDashboard={onDashboard} />
        <LandingHero    onGetStarted={onGetStarted} stats={apiData}   loading={loading} />
        <SectionDivider />
        <LandingFeatures onGetStarted={onGetStarted} />
        <SectionDivider />
        <LandingHowItWorks onGetStarted={onGetStarted} />
        <SectionDivider />
        <LandingRoles   onGetStarted={onGetStarted} onPreview={setPreviewRole} />
        <SectionDivider />
        <LandingDemo />
        <SectionDivider />
        <LandingStats   stats={apiData} loading={loading} onGetStarted={onGetStarted} />
        <SectionDivider />
        <LandingTestimonials />
        <SectionDivider />
        <LandingFAQ />
        <SectionDivider />
        <LandingCTA     onGetStarted={onGetStarted} onLogin={onLogin} />
        <SectionDivider />
        <LandingFooter  onGetStarted={onGetStarted} />
      </div>

      {/* Role preview dialog — rendered at page level so it survives scroll */}
      <RolePreviewDialog
        role={previewRole}
        onClose={() => setPreviewRole(null)}
        onGetStarted={() => { setPreviewRole(null); onGetStarted(); }}
      />
    </div>
  );
}

// ── Navbar — auth-aware ───────────────────────────────────────────────────────

function LandingNavbar({ onGetStarted, onLogin, onDashboard }: PageProps) {
  // Read persisted session without React state — no re-render needed
  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const isLoggedIn   = !!(authUser?.user_id);
  const displayName  = (authUser?.name as string) ?? "";
  const userRole     = authUser?.role as Role | undefined;
  const initials     = displayName.split(" ").map((p: string) => p[0] ?? "").join("").slice(0, 2).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderColor: "rgba(26,95,122,0.09)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span style={{ color: "var(--edu-primary)", fontWeight: 700, fontSize: "1.2rem" }}>EduMatch</span>
        </button>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--edu-light)" }}>
          <button onClick={() => scrollTo("features")}    className="hover:text-[var(--edu-primary)] transition-colors">Features</button>
          <button onClick={() => scrollTo("how")}         className="hover:text-[var(--edu-primary)] transition-colors">How It Works</button>
          <button onClick={() => scrollTo("roles")}       className="hover:text-[var(--edu-primary)] transition-colors">Roles</button>
          <button onClick={() => scrollTo("faq")}         className="hover:text-[var(--edu-primary)] transition-colors">FAQ</button>
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Logged-in pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(26,95,122,0.07)", border: "1px solid var(--edu-border)" }}>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="edu-gradient text-white" style={{ fontSize: 11 }}>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium" style={{ color: "var(--edu-dark)" }}>{displayName}</span>
                <Badge className="capitalize text-xs" style={{ background: "rgba(87,197,182,0.15)", color: "var(--edu-primary)" }}>
                  {userRole}
                </Badge>
              </div>
              <Button onClick={() => userRole && onDashboard?.(userRole)}
                className="rounded-full px-5" style={{ background: "var(--edu-primary)" }}>
                <LayoutDashboard size={16} className="mr-2" /> Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onLogin} className="rounded-full" style={{ color: "var(--edu-primary)" }}>
                Log In
              </Button>
              <Button onClick={onGetStarted} className="rounded-full px-5" style={{ background: "var(--edu-primary)" }}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function LandingHero({ onGetStarted, stats, loading }: {
  onGetStarted: () => void;
  stats: BackendData | null;
  loading: boolean;
}) {
  const metrics = [
    { label: "Timeliness",  v: 92, c: "var(--edu-success)"   },
    { label: "Plagiarism",  v: 6,  c: "var(--edu-success)", inv: true },
    { label: "Feedback",    v: 81, c: "var(--edu-secondary)" },
    { label: "Completion",  v: 78, c: "var(--edu-accent)"    },
  ];

  return (
    <section id="hero" className="relative overflow-hidden py-24">
      {NODES.map((n, i) => (
        <div key={i} aria-hidden style={{
          position: "absolute", left: n.x, top: n.y,
          width: n.size, height: n.size, borderRadius: "50%",
          background: "rgba(87,197,182,0.7)",
          animation: `grid-node-pulse ${n.dur} ease-in-out infinite`,
          animationDelay: n.delay, pointerEvents: "none", willChange: "opacity, transform",
        }} />
      ))}

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="hr1">
            <Badge className="mb-5 rounded-full px-3 py-1"
              style={{ background: "rgba(87,197,182,0.15)", color: "var(--edu-primary)" }}>
              <Sparkles size={14} className="mr-1" /> AI-Driven Academic Ecosystem
            </Badge>
          </div>

          <h1 className="hr2" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--edu-primary)" }}>
            The smartest way to{" "}
            <span style={{ color: "var(--edu-secondary)" }}>match, mentor,</span>
            <br />and verify academia.
          </h1>

          <p className="hr3 mt-5 text-lg leading-relaxed" style={{ color: "var(--edu-light)", maxWidth: 500 }}>
            Connect students, supervisors, companies, and alumni in one intelligent
            platform built for modern universities.
          </p>

          <div className="hr4 mt-8 flex flex-wrap gap-3">
            <Button onClick={onGetStarted} className="rounded-full px-7 h-12 font-semibold"
              style={{ background: "var(--edu-accent)" }}>
              Get Started <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button variant="outline" className="rounded-full px-7 h-12 font-semibold"
              style={{ borderColor: "var(--edu-primary)", color: "var(--edu-primary)" }}
              onClick={() => scrollTo("demo")}>
              <PlayCircle size={18} className="mr-2" /> Watch Demo
            </Button>
          </div>

          {/* Real-time stats — click to explore */}
          <div className="hr5 mt-10 flex items-center gap-8 flex-wrap">
            {[
              { n: stats?.students_matched ?? 0, s: "+", label: "Students",      fn: () => scrollTo("roles")    },
              { n: stats?.theses_tracked   ?? 0, s: "+", label: "Theses",        fn: () => scrollTo("features") },
              { n: 96,                           s: "%", label: "Match Accuracy", fn: () => scrollTo("faq")     },
            ].map((item, i) => (
              <button key={i} onClick={item.fn}
                className="text-left group transition-opacity hover:opacity-80">
                <div style={{ fontWeight: 800, fontSize: "1.85rem", color: "var(--edu-primary)", lineHeight: 1 }}>
                  {loading ? "—" : <Counter to={item.n} suffix={item.s} />}
                </div>
                <div className="text-sm mt-1 flex items-center gap-1 group-hover:underline"
                  style={{ color: "var(--edu-light)" }}>
                  {item.label} <ChevronRight size={13} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thesis health preview card */}
        <div className="hr-card">
          <Card className="p-6 rounded-3xl bg-white edu-card-shadow border" style={{ borderColor: "var(--edu-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>Thesis Health</div>
                <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--edu-primary)" }}>
                  87<span style={{ fontSize: "1rem", color: "var(--edu-light)" }}>/100</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full edu-gradient flex items-center justify-center">
                <Activity className="text-white" />
              </div>
            </div>
            <Progress value={87} className="h-2 mb-6" />
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(m => (
                <div key={m.label} className="rounded-2xl p-3" style={{ background: "var(--edu-bg)" }}>
                  <div className="text-xs" style={{ color: "var(--edu-light)" }}>{m.label}</div>
                  <div style={{ fontWeight: 700, color: m.c }}>{m.v}{m.inv ? "%" : "/100"}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3 rounded-2xl flex items-center gap-3" style={{ background: "rgba(87,197,182,0.12)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--edu-secondary)" }}>
                <Brain className="text-white" size={18} />
              </div>
              <div className="text-sm">
                <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>AI Suggestion</div>
                <div style={{ color: "var(--edu-light)" }}>Add 2 references to lift score by ~4 pts</div>
              </div>
            </div>
            <Button className="w-full mt-4 rounded-xl" variant="outline"
              style={{ borderColor: "var(--edu-primary)", color: "var(--edu-primary)" }}
              onClick={onGetStarted}>
              Start tracking your thesis <ArrowRight size={15} className="ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function LandingFeatures({ onGetStarted }: { onGetStarted: () => void }) {
  const features = [
    { icon: Brain,       title: "AI Matching",         desc: "Smart pairing of students with the most compatible thesis supervisors based on CGPA, interests, and research fit.",  action: () => scrollTo("roles") },
    { icon: Target,      title: "Skill Gap Analysis",  desc: "Identify exactly which skills you're missing and get ranked course recommendations to close the gap fast.",             action: () => scrollTo("demo") },
    { icon: Activity,    title: "Thesis Health Score", desc: "A live 0–100 signal measuring timeliness, plagiarism safety, feedback quality, and milestone completion.",             action: () => scrollTo("demo") },
    { icon: ShieldCheck, title: "Plagiarism Tracker",  desc: "Chapter-level similarity detection with source attribution. Automatic alerts when submissions exceed thresholds.",      action: () => scrollTo("faq")  },
    { icon: Briefcase,   title: "Internship Matching", desc: "Discover internships ranked by skill alignment, salary, and deadline urgency. Apply in one click.",                     action: onGetStarted           },
    { icon: QrCode,      title: "QR Credentials",      desc: "Cryptographically signed verifiable credentials with a unique QR code — valid anywhere, no login required to verify.", action: () => scrollTo("faq")  },
  ];

  return (
    <section id="features" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-3" style={{ background: "rgba(255,159,41,0.15)", color: "var(--edu-accent)" }}>Features</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>
            Everything your academic journey needs
          </h2>
          <p className="mt-2" style={{ color: "var(--edu-light)" }}>
            Powerful, AI-assisted tools built for modern universities.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} onClick={f.action}
              className="p-6 rounded-3xl border bg-white hover-lift edu-card-shadow cursor-pointer group transition-colors"
              style={{ borderColor: "var(--edu-border)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(26,95,122,0.08)" }}>
                <f.icon style={{ color: "var(--edu-primary)" }} />
              </div>
              <h3 style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--edu-light)" }}>{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--edu-secondary)" }}>
                Explore <ChevronRight size={13} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function LandingHowItWorks({ onGetStarted }: { onGetStarted: () => void }) {
  const steps = [
    { n: "01", title: "Create your profile",   desc: "Add skills, interests, CGPA, and research goals in minutes.",      action: onGetStarted,               cta: "Register now →" },
    { n: "02", title: "Get AI matches",         desc: "Receive a ranked list of supervisors and internships instantly.",   action: () => scrollTo("roles"),    cta: "See roles →"    },
    { n: "03", title: "Track & improve",        desc: "Live health scoring nudges you toward thesis excellence every day.", action: () => scrollTo("demo"),     cta: "See demo →"     },
    { n: "04", title: "Verify credentials",     desc: "Generate a scannable QR credential that anyone can validate.",      action: () => scrollTo("faq"),      cta: "Learn more →"   },
  ];

  return (
    <section id="how" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-3" style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>How it Works</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>
            From profile to defense — in four steps
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <Card key={i} onClick={s.action}
              className="p-6 rounded-3xl bg-white border hover-lift edu-card-shadow cursor-pointer"
              style={{ borderColor: "var(--edu-border)" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-secondary)" }}>{s.n}</div>
              <h3 className="mt-2" style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{s.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--edu-light)" }}>{s.desc}</p>
              <div className="mt-4 text-xs font-semibold" style={{ color: "var(--edu-secondary)" }}>{s.cta}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Roles ─────────────────────────────────────────────────────────────────────

function LandingRoles({ onGetStarted, onPreview }: {
  onGetStarted: () => void;
  onPreview:    (role: PreviewableRole) => void;
}) {
  const roles: { icon: React.ElementType; title: string; desc: string; role: Role; previewable: boolean }[] = [
    { icon: GraduationCap, title: "Student",       desc: "Find supervisors, track milestones, build skills and earn credentials.",     role: "student",    previewable: true  },
    { icon: BookOpen,      title: "Supervisor",    desc: "Review anonymous applications, manage capacity, and mentor with insight.",    role: "supervisor", previewable: true  },
    { icon: Lock,          title: "Admin",         desc: "Configure matching weights, monitor risk projects and university analytics.", role: "admin",      previewable: false },
    { icon: Building2,     title: "Company",       desc: "Post internships, search skill-matched students and track applicants.",       role: "company",    previewable: true  },
    { icon: Award,         title: "Alumni Mentor", desc: "Guide students through career transitions with calendar-based sessions.",     role: "alumni",     previewable: true  },
  ];

  return (
    <section id="roles" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-3" style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)" }}>Roles</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>
            Built for everyone in academia
          </h2>
          <p className="mt-2" style={{ color: "var(--edu-light)" }}>
            Click any role to preview available people and listings.
          </p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
          {roles.map((r, i) => (
            <Card key={i}
              onClick={() => {
                if (!r.previewable) {
                  toast.info("Admin accounts are provisioned by your university IT department.");
                } else {
                  onPreview(r.role as PreviewableRole);
                }
              }}
              className="p-5 rounded-3xl bg-white text-center edu-card-shadow border cursor-pointer transition-all"
              style={{
                borderColor:  "var(--edu-border)",
                opacity:      r.previewable ? 1 : 0.7,
                transform:    "none",
              }}
              onMouseEnter={e => {
                if (r.previewable) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--edu-secondary)";
                  (e.currentTarget as HTMLElement).style.transform   = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow   = "0 12px 32px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--edu-border)";
                (e.currentTarget as HTMLElement).style.transform   = "none";
                (e.currentTarget as HTMLElement).style.boxShadow   = "";
              }}
            >
              <div className="mx-auto w-14 h-14 rounded-2xl edu-gradient flex items-center justify-center mb-3">
                <r.icon className="text-white" />
              </div>
              <h3 style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{r.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--edu-light)" }}>{r.desc}</p>
              {r.previewable ? (
                <div className="mt-3 text-xs font-semibold flex items-center justify-center gap-1"
                  style={{ color: "var(--edu-secondary)" }}>
                  Preview <ExternalLink size={11} />
                </div>
              ) : (
                <div className="mt-3 text-xs" style={{ color: "var(--edu-light)" }}>Contact IT dept.</div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function LandingDemo() {
  const skills = [
    { skill: "Python",           you: 90, req: 95 },
    { skill: "PyTorch",          you: 40, req: 80 },
    { skill: "Statistics",       you: 65, req: 85 },
    { skill: "Research Writing", you: 55, req: 75 },
  ];

  return (
    <section id="demo" className="py-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <Badge className="mb-3" style={{ background: "rgba(255,159,41,0.15)", color: "var(--edu-accent)" }}>Live Demo</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>
            AI Skill Gap Analysis
          </h2>
          <p className="mt-3" style={{ color: "var(--edu-light)" }}>
            We compare your current toolkit against your target supervisor's expertise — then
            recommend the most efficient learning path forward.
          </p>
          <ul className="mt-5 space-y-3">
            {[
              "Personalized free course recommendations",
              "Difficulty-aware sequencing (Beginner → Advanced)",
              "Auto-updates as your verified skills grow",
            ].map((t, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <ChevronRight style={{ color: "var(--edu-secondary)" }} size={18} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <Card className="p-6 rounded-3xl edu-card-shadow bg-white border" style={{ borderColor: "var(--edu-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ color: "var(--edu-primary)", fontWeight: 600 }}>Required vs You</h3>
            <Badge style={{ background: "rgba(40,167,69,0.12)", color: "var(--edu-success)" }}>72% match</Badge>
          </div>
          {skills.map(s => (
            <div key={s.skill} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{s.skill}</span>
                <span style={{ color: "var(--edu-light)" }}>{s.you}% / {s.req}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--edu-border)" }}>
                <div className="h-2 rounded-full edu-gradient" style={{ width: `${s.you}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-2 p-3 rounded-2xl flex items-center gap-3" style={{ background: "rgba(255,159,41,0.1)" }}>
            <BookOpen style={{ color: "var(--edu-accent)" }} />
            <div className="text-sm">
              Recommended: <strong>Deep Learning Fundamentals</strong> · 10 weeks · fast.ai
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function LandingStats({ stats, loading, onGetStarted }: {
  stats:        BackendData | null;
  loading:      boolean;
  onGetStarted: () => void;
}) {
  const items = [
    { icon: Users,     value: stats?.students_matched ?? 0, suffix: "+", label: "Students Matched", fn: onGetStarted           },
    { icon: BookOpen,  value: stats?.theses_tracked   ?? 0, suffix: "+", label: "Theses Tracked",   fn: () => scrollTo("demo") },
    { icon: Briefcase, value: stats?.internships      ?? 0, suffix: "+", label: "Course Catalogs",  fn: () => scrollTo("demo") },
    { icon: Building2, value: stats?.universities     ?? 0, suffix: "",  label: "Universities",     fn: () => scrollTo("faq")  },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <Card className="rounded-3xl edu-gradient text-white p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {items.map((item, i) => (
              <button key={i} onClick={item.fn}
                className="group flex flex-col items-center transition-opacity hover:opacity-80">
                <item.icon className="mb-2 group-hover:scale-110 transition-transform" />
                <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                  {loading ? "..." : <Counter to={item.value} suffix={item.suffix} />}
                </div>
                <div className="opacity-80 flex items-center gap-1 mt-0.5">
                  {item.label} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function LandingTestimonials() {
  const testimonials = [
    { name: "Farjana A. Limu",  role: "MSc, Computer Science",     body: "EduMatch found me a supervisor I never even considered — and the match was perfect. The skill gap tool was eye-opening.",    avatar: "FL" },
    { name: "Dr. Ahmed Rahman", role: "Faculty, Machine Learning",  body: "Blind review changed how I evaluate applications. My cohort quality jumped instantly and the bias dropped noticeably.",        avatar: "AR" },
    { name: "Riad Karim",       role: "Alumni Mentor · Google BD",  body: "I mentor students across three universities now — all from one calendar. Scheduling used to take hours, now it's minutes.",    avatar: "RK" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-3" style={{ background: "rgba(87,197,182,0.18)", color: "var(--edu-primary)" }}>Testimonials</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>Loved across campuses</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-6 rounded-3xl bg-white border edu-card-shadow hover-lift"
              style={{ borderColor: "var(--edu-border)" }}>
              <Quote style={{ color: "var(--edu-secondary)" }} />
              <p className="mt-3" style={{ color: "var(--edu-dark)" }}>{t.body}</p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="edu-gradient text-white">{t.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>{t.name}</div>
                  <div className="text-sm" style={{ color: "var(--edu-light)" }}>{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ — 12 detailed questions ───────────────────────────────────────────────

function LandingFAQ() {
  const faqs = [
    {
      q: "Is EduMatch free for students?",
      a: "Yes — students get full access to AI supervisor matching, skill gap analysis, thesis health tracking, internship discovery, and basic mentorship at no cost. Premium features such as priority matching and advanced analytics may be available through university partnerships. Check with your institution's academic office.",
    },
    {
      q: "How does the AI supervisor matching algorithm work?",
      a: "The algorithm weighs five factors: CGPA (30%), research-interest keyword overlap (35%), supervisor's remaining capacity (15%), technical skill match (10%), and same-university affiliation (10%). A weighted composite score is computed for every faculty–student pair, and the top-5 supervisors are returned ranked by score. University admins can tune these weights from the Admin dashboard to reflect institutional priorities.",
    },
    {
      q: "What is the Thesis Health Score and how is it calculated?",
      a: "The Thesis Health Score (0–100) is a composite metric combining four sub-scores: Timeliness (are milestones submitted before their due dates?), Plagiarism Safety (100 minus 2× the average plagiarism percentage across submitted chapters), Supervisor Feedback quality (based on message frequency and feedback sentiment), and Completion Rate (submitted milestones ÷ total milestones × 100). Scores above 80 are labelled Excellent; 60–79 trigger an At Risk warning; below 60 the project is flagged as Critical and the supervisor is automatically notified.",
    },
    {
      q: "How does plagiarism detection work?",
      a: "When a student submits a milestone, EduMatch records a plagiarism score (0–100%) for that chapter. Supervisors and admins can see the chapter-level breakdown with similarity percentage. The system automatically flags chapters that exceed the institution-configured threshold (default 15%). Scores feed directly into the Thesis Health Score, incentivising original work from the very first submission.",
    },
    {
      q: "What is blind review and why does EduMatch use it?",
      a: "Blind review presents supervisor applicant profiles without the student's name or photo — only anonymised academic data is shown: CGPA, skills, research interest, and university affiliation (labelled as APX-XXXX). Research shows that name- and photo-blind evaluation significantly reduces unconscious bias and increases diversity in research cohorts. Supervisors make their initial shortlist based purely on academic merit.",
    },
    {
      q: "How does a student request a supervisor?",
      a: "After completing your profile (skills, CGPA, research interest), the platform generates a ranked list of compatible supervisors. You can view each supervisor's research areas, current student load, and available capacity. Clicking 'Request Supervision' sends the supervisor your anonymised profile. The supervisor reviews it and accepts or declines. If declined, you can request the next match on your list.",
    },
    {
      q: "Can multiple universities collaborate on EduMatch?",
      a: "Yes. The Inter-University module (accessible by institution Admins) allows partner universities to share supervisor capacity and co-supervise thesis projects across campuses. Student academic records and personal data remain under the jurisdiction of their home institution. Cross-university match scores consider university affiliation to support collaboration agreements.",
    },
    {
      q: "How are internship matches ranked for students?",
      a: "Internship listings are scored by comparing the company's required_skills list against the student's verified skills in the Skills table. A higher percentage overlap gives a higher match score. Additional ranking factors include how close the deadline is (urgency), salary range, and whether the company is affiliated with the student's university. Students can also filter listings by skill, salary, or deadline.",
    },
    {
      q: "How do QR credentials work and who can verify them?",
      a: "Upon thesis defence completion or milestone verification, EduMatch generates a credential record tied to the student's profile and signed with the institution's key. A unique QR code is produced that encodes the credential ID. Anyone — employers, institutions, collaborators — can scan the QR code to see the credential details in their browser with no login required. Credentials cannot be altered once issued.",
    },
    {
      q: "What data privacy protections are in place?",
      a: "Student CGPA, research details, and personal contact information are visible only to the student, their assigned supervisor, and their institution's admin. Company partners see only anonymised skill profiles when browsing for candidates. All API communication uses HTTPS. Students can view, export, or request deletion of their data at any time from the Settings page inside their dashboard.",
    },
    {
      q: "Can a company post internships, and what details are required?",
      a: "Yes — companies register a separate Company account and can post internship listings immediately. Required fields are: role title, required skills (comma-separated), application deadline, and monthly salary. Optional fields include a description and university affiliation. Once posted, the listing is matched against student profiles and appears in the Internships tab of relevant students' dashboards within minutes.",
    },
    {
      q: "How can an alumnus become a mentor on EduMatch?",
      a: "Graduates of partner universities can register as Alumni Mentors by selecting the 'Alumni' role during sign-up. After completing a short profile — current company, job title, and areas of expertise — your profile is added to the mentor directory. Students can browse mentors and request sessions. You accept or decline via the Messages tab and manage your availability through the platform's built-in scheduling calendar.",
    },
  ];

  return (
    <section id="faq" className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <Badge className="mb-3" style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)" }}>FAQ</Badge>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--edu-primary)" }}>
            Frequently Asked Questions
          </h2>
          <p className="mt-2" style={{ color: "var(--edu-light)" }}>
            Everything you need to know about EduMatch — from algorithm details to data privacy.
          </p>
        </div>
        <Accordion type="single" collapsible className="bg-white rounded-3xl edu-card-shadow p-2 border"
          style={{ borderColor: "var(--edu-border)" }}>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} className="px-4">
              <AccordionTrigger style={{ color: "var(--edu-primary)", textAlign: "left" }}>
                {f.q}
              </AccordionTrigger>
              <AccordionContent style={{ color: "var(--edu-light)", lineHeight: 1.7 }}>
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function LandingCTA({ onGetStarted, onLogin }: PageProps) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl edu-gradient text-white p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              Start your AI-powered academic journey today
            </h2>
            <p className="mt-2 opacity-90">Free for students. Trusted by modern universities.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button onClick={onGetStarted} className="rounded-full h-12 px-6"
              style={{ background: "var(--edu-accent)" }}>
              Get Started <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button variant="outline" onClick={onLogin}
              className="rounded-full h-12 px-6 bg-transparent text-white border-white hover:bg-white/10">
              Log in
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function LandingFooter({ onGetStarted }: { onGetStarted: () => void }) {
  const [email, setEmail] = useState("");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    toast.success("You're on the list! We'll be in touch.");
    setEmail("");
  }

  return (
    <footer style={{ background: "rgba(255,255,255,0.95)" }}>
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span style={{ color: "var(--edu-primary)", fontWeight: 700 }}>EduMatch</span>
          </div>
          <p className="text-sm" style={{ color: "var(--edu-light)" }}>
            The AI-driven thesis & internship ecosystem for modern universities.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="mb-3 text-sm font-semibold" style={{ color: "var(--edu-primary)" }}>Product</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--edu-light)" }}>
            <li><button onClick={() => scrollTo("features")}    className="hover:text-[var(--edu-primary)] transition-colors">Features</button></li>
            <li><button onClick={() => scrollTo("faq")}         className="hover:text-[var(--edu-primary)] transition-colors">Pricing</button></li>
            <li><button onClick={() => scrollTo("roles")}       className="hover:text-[var(--edu-primary)] transition-colors">Universities</button></li>
            <li><button onClick={() => toast.info("Roadmap coming soon!")} className="hover:text-[var(--edu-primary)] transition-colors">Roadmap</button></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="mb-3 text-sm font-semibold" style={{ color: "var(--edu-primary)" }}>Company</h4>
          <ul className="space-y-2 text-sm" style={{ color: "var(--edu-light)" }}>
            <li><button onClick={() => scrollTo("faq")}          className="hover:text-[var(--edu-primary)] transition-colors">About</button></li>
            <li><button onClick={() => toast.info("Email: support@edumatch.edu")} className="hover:text-[var(--edu-primary)] transition-colors">Contact</button></li>
            <li><button onClick={() => toast.info("Privacy policy — coming soon.")} className="hover:text-[var(--edu-primary)] transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => toast.info("Terms of service — coming soon.")} className="hover:text-[var(--edu-primary)] transition-colors">Terms</button></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="mb-3 text-sm font-semibold" style={{ color: "var(--edu-primary)" }}>Stay updated</h4>
          <p className="text-sm mb-3" style={{ color: "var(--edu-light)" }}>
            Get product updates and research case studies in your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-xl border bg-white"
              style={{ borderColor: "var(--edu-border)" }}
              placeholder="you@university.edu"
            />
            <Button type="submit" style={{ background: "var(--edu-primary)" }}>Join</Button>
          </form>
          <p className="mt-2 text-xs" style={{ color: "var(--edu-light)" }}>
            No spam. Unsubscribe any time.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-5 text-center text-sm flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 gap-2"
        style={{ borderTop: "1px solid rgba(26,95,122,0.09)", color: "var(--edu-light)" }}>
        <span>&copy; {new Date().getFullYear()} EduMatch. All rights reserved.</span>
        <div className="flex gap-4 text-xs">
          <button onClick={onGetStarted} className="hover:text-[var(--edu-primary)] transition-colors">Get Started</button>
          <button onClick={() => scrollTo("features")} className="hover:text-[var(--edu-primary)] transition-colors">Features</button>
          <button onClick={() => scrollTo("faq")} className="hover:text-[var(--edu-primary)] transition-colors">FAQ</button>
        </div>
      </div>
    </footer>
  );
}
