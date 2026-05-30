import React, { useEffect, useState } from "react";
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
  Activity,
  ArrowRight,
  Brain,
  Briefcase,
  PlayCircle,
  Sparkles,
  Target,
  ShieldCheck,
  QrCode,
  BookOpen,
  ChevronRight,
  Users,
  Building2,
  Award,
  Quote,
  GraduationCap,
} from "lucide-react";

// ============================================================================
// TYPES & HELPER COMPONENTS
// ============================================================================

type PageProps = {
  onGetStarted: () => void;
  onLogin: () => void;
};

interface BackendData {
  students_matched: number;
  theses_tracked: number;
  internships: number;
  universities: number;
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = Math.ceil(to / (duration / 16)) || 1;

    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [to]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ============================================================================
// MAIN LANDING COMPONENT CONTAINER (WITH API FETCH)
// ============================================================================

export function LandingPage({ onGetStarted, onLogin }: PageProps) {
  const [apiData, setApiData] = useState<BackendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Adjust endpoint path as necessary depending on your environment routing
    fetch("http://localhost/EduMatch/backend/landing.php")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resJson) => {
        if (resJson.success && resJson.data) {
          setApiData(resJson.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard ecosystem metrics:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--edu-bg)", color: "var(--edu-dark)" }}
    >
      <LandingNavbar onGetStarted={onGetStarted} onLogin={onLogin} />
      <LandingHero
        onGetStarted={onGetStarted}
        stats={apiData}
        loading={loading}
      />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingRoles />
      <LandingDemo />
      <LandingStats stats={apiData} loading={loading} />
      <LandingTestimonials />
      <LandingFAQ />
      <LandingCTA onGetStarted={onGetStarted} onLogin={onLogin} />
      <LandingFooter />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function LandingNavbar({ onGetStarted, onLogin }: PageProps) {
  return (
    <nav
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b"
      style={{ borderColor: "var(--edu-border)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span
            style={{
              color: "var(--edu-primary)",
              fontWeight: 700,
              fontSize: "1.2rem",
            }}
          >
            EduMatch
          </span>
        </div>
        <div
          className="hidden md:flex items-center gap-6 text-sm font-medium"
          style={{ color: "var(--edu-light)" }}
        >
          <a
            href="#features"
            className="hover:text-[var(--edu-primary)] transition-colors"
          >
            Features
          </a>
          <a
            href="#how"
            className="hover:text-[var(--edu-primary)] transition-colors"
          >
            How It Works
          </a>
          <a
            href="#roles"
            className="hover:text-[var(--edu-primary)] transition-colors"
          >
            Roles
          </a>
          <a
            href="#faq"
            className="hover:text-[var(--edu-primary)] transition-colors"
          >
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onLogin}
            className="rounded-full"
            style={{ color: "var(--edu-primary)" }}
          >
            Log In
          </Button>
          <Button
            onClick={onGetStarted}
            className="rounded-full px-5"
            style={{ background: "var(--edu-primary)" }}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}

function LandingHero({
  onGetStarted,
  stats,
  loading,
}: {
  onGetStarted: () => void;
  stats: BackendData | null;
  loading: boolean;
}) {
  const metrics = [
    { label: "Timeliness", v: 92, c: "var(--edu-success)" },
    { label: "Plagiarism", v: 6, c: "var(--edu-success)", inv: true },
    { label: "Feedback", v: 81, c: "var(--edu-secondary)" },
    { label: "Completion", v: 78, c: "var(--edu-accent)" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 edu-gradient-soft" />
      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div className="fade-in-up">
          <Badge
            className="mb-4 rounded-full px-3 py-1"
            style={{
              background: "rgba(87,197,182,0.15)",
              color: "var(--edu-primary)",
            }}
          >
            <Sparkles size={14} className="mr-1" /> AI-Driven Academic Ecosystem
          </Badge>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3.4rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "var(--edu-primary)",
            }}
          >
            EduMatch — AI-Driven Thesis & Internship Ecosystem
          </h1>
          <p className="mt-5 text-lg" style={{ color: "var(--edu-light)" }}>
            Connect students, supervisors, companies, and alumni in one
            intelligent platform that matches, mentors, and verifies academic
            excellence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={onGetStarted}
              className="rounded-full px-6 h-12"
              style={{ background: "var(--edu-accent)" }}
            >
              Get Started <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-6 h-12"
              style={{
                borderColor: "var(--edu-primary)",
                color: "var(--edu-primary)",
              }}
            >
              <PlayCircle size={18} className="mr-2" /> Watch Demo
            </Button>
          </div>
          <div
            className="mt-10 flex items-center gap-8 flex-wrap"
            style={{ color: "var(--edu-light)" }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "var(--edu-primary)",
                }}
              >
                {loading ? (
                  "..."
                ) : (
                  <Counter to={stats?.students_matched ?? 0} suffix="+" />
                )}
              </div>
              <div className="text-sm">Students</div>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "var(--edu-primary)",
                }}
              >
                {loading ? (
                  "..."
                ) : (
                  <Counter to={stats?.theses_tracked ?? 0} suffix="+" />
                )}
              </div>
              <div className="text-sm">Supervisors</div>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "var(--edu-primary)",
                }}
              >
                <Counter to={96} suffix="%" />
              </div>
              <div className="text-sm">Match Accuracy</div>
            </div>
          </div>
        </div>
        <div className="relative fade-in-up">
          <Card className="p-6 edu-card-shadow rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>
                  Thesis Health
                </div>
                <div
                  style={{
                    fontSize: "2.4rem",
                    fontWeight: 700,
                    color: "var(--edu-primary)",
                  }}
                >
                  87
                  <span style={{ fontSize: "1rem", color: "var(--edu-light)" }}>
                    /100
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full edu-gradient flex items-center justify-center">
                <Activity className="text-white" />
              </div>
            </div>
            <Progress value={87} className="h-2 mb-6" />
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl p-3"
                  style={{ background: "var(--edu-bg)" }}
                >
                  <div
                    className="text-xs"
                    style={{ color: "var(--edu-light)" }}
                  >
                    {m.label}
                  </div>
                  <div style={{ fontWeight: 700, color: m.c }}>
                    {m.v}
                    {m.inv ? "%" : "/100"}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-5 p-3 rounded-2xl flex items-center gap-3"
              style={{ background: "rgba(87,197,182,0.12)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--edu-secondary)" }}
              >
                <Brain className="text-white" size={18} />
              </div>
              <div className="text-sm">
                <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>
                  AI Suggestion
                </div>
                <div style={{ color: "var(--edu-light)" }}>
                  Add 2 references to lift score by ~4 pts
                </div>
              </div>
            </div>
          </Card>
          <div className="absolute -bottom-6 -left-6 hidden md:block">
            <Card className="p-4 rounded-2xl edu-card-shadow bg-white flex items-center gap-3 hover-lift">
              <div className="w-10 h-10 rounded-full edu-bg-accent flex items-center justify-center text-white">
                <Briefcase size={18} />
              </div>
              <div>
                <div className="text-sm" style={{ color: "var(--edu-light)" }}>
                  New match
                </div>
                <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>
                  DataPeak Labs · 95%
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFeatures() {
  const features = [
    {
      icon: Brain,
      title: "AI Matching",
      desc: "Smart pairing of students with the most compatible thesis supervisors.",
    },
    {
      icon: Target,
      title: "Skill Gap Analysis",
      desc: "Identify missing skills and get targeted course recommendations.",
    },
    {
      icon: Activity,
      title: "Thesis Health Score",
      desc: "A live signal of your progress, plagiarism, and feedback quality.",
    },
    {
      icon: ShieldCheck,
      title: "Plagiarism Tracker",
      desc: "Chapter-level similarity detection with detailed source reports.",
    },
    {
      icon: Briefcase,
      title: "Internship Matching",
      desc: "Discover internships ranked by skill, interest, and university fit.",
    },
    {
      icon: QrCode,
      title: "QR Credentials",
      desc: "Verifiable, shareable digital credentials with one-tap scanning.",
    },
  ];

  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <Badge
          className="mb-3"
          style={{
            background: "rgba(255,159,41,0.15)",
            color: "var(--edu-accent)",
          }}
        >
          Features
        </Badge>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--edu-primary)",
          }}
        >
          Everything your academic journey needs
        </h2>
        <p className="mt-2" style={{ color: "var(--edu-light)" }}>
          Powerful, AI-assisted tools built for modern universities.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <Card
            key={i}
            className="p-6 rounded-3xl border bg-white hover-lift edu-card-shadow"
            style={{ borderColor: "var(--edu-border)" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(26,95,122,0.08)" }}
            >
              <f.icon style={{ color: "var(--edu-primary)" }} />
            </div>
            <h3 style={{ fontWeight: 600, color: "var(--edu-primary)" }}>
              {f.title}
            </h3>
            <p className="mt-2" style={{ color: "var(--edu-light)" }}>
              {f.desc}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LandingHowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Create your profile",
      desc: "Add skills, interests, CGPA, and uploads in minutes.",
    },
    {
      n: "02",
      title: "Get AI matches",
      desc: "Receive ranked supervisors and internships instantly.",
    },
    {
      n: "03",
      title: "Track & improve",
      desc: "Live scoring nudges you toward a perfect thesis.",
    },
    {
      n: "04",
      title: "Verify credentials",
      desc: "Generate verifiable QR credentials when complete.",
    },
  ];

  return (
    <section id="how" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge
            className="mb-3"
            style={{
              background: "rgba(87,197,182,0.18)",
              color: "var(--edu-primary)",
            }}
          >
            How it Works
          </Badge>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--edu-primary)",
            }}
          >
            From profile to defense — in four steps
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <Card
              key={i}
              className="p-6 rounded-3xl bg-white border hover-lift"
              style={{ borderColor: "var(--edu-border)" }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--edu-secondary)",
                }}
              >
                {s.n}
              </div>
              <h3
                className="mt-2"
                style={{ fontWeight: 600, color: "var(--edu-primary)" }}
              >
                {s.title}
              </h3>
              <p className="mt-2" style={{ color: "var(--edu-light)" }}>
                {s.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingRoles() {
  const roles = [
    {
      icon: GraduationCap,
      title: "Student",
      desc: "Find supervisors, track milestones, build skills.",
    },
    {
      icon: BookOpen,
      title: "Supervisor",
      desc: "Review blind applications and mentor with insight.",
    },
    {
      icon: ShieldCheck,
      title: "Admin",
      desc: "Run matching weights, monitor risk, and analytics.",
    },
    {
      icon: Building2,
      title: "Company",
      desc: "Post internships and discover top talent.",
    },
    {
      icon: Award,
      title: "Alumni Mentor",
      desc: "Guide students with sessions and chat support.",
    },
  ];

  return (
    <section id="roles" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <Badge
          className="mb-3"
          style={{
            background: "rgba(26,95,122,0.1)",
            color: "var(--edu-primary)",
          }}
        >
          Roles
        </Badge>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--edu-primary)",
          }}
        >
          Built for everyone in academia
        </h2>
      </div>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
        {roles.map((r, i) => (
          <Card
            key={i}
            className="p-5 rounded-3xl bg-white text-center hover-lift edu-card-shadow border"
            style={{ borderColor: "var(--edu-border)" }}
          >
            <div className="mx-auto w-14 h-14 rounded-2xl edu-gradient flex items-center justify-center mb-3">
              <r.icon className="text-white" />
            </div>
            <h3 style={{ fontWeight: 600, color: "var(--edu-primary)" }}>
              {r.title}
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--edu-light)" }}>
              {r.desc}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LandingDemo() {
  const skills = [
    { skill: "Python", you: 90, req: 95 },
    { skill: "PyTorch", you: 40, req: 80 },
    { skill: "Statistics", you: 65, req: 85 },
    { skill: "Research Writing", you: 55, req: 75 },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <Badge
            className="mb-3"
            style={{
              background: "rgba(255,159,41,0.15)",
              color: "var(--edu-accent)",
            }}
          >
            Live Demo
          </Badge>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--edu-primary)",
            }}
          >
            AI Skill Gap Analysis
          </h2>
          <p className="mt-3" style={{ color: "var(--edu-light)" }}>
            We compare your current toolkit against your target supervisor's
            expertise — then recommend the most efficient path forward.
          </p>
          <ul className="mt-5 space-y-3">
            {[
              "Personalized free course recommendations",
              "Difficulty-aware learning sequencing",
              "Auto-updates as your profile evolves",
            ].map((t, i) => (
              <li key={i} className="flex items-center gap-3">
                <ChevronRight
                  style={{ color: "var(--edu-secondary)" }}
                  size={18}
                />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <Card className="p-6 rounded-3xl edu-card-shadow bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ color: "var(--edu-primary)", fontWeight: 600 }}>
              Required vs You
            </h3>
            <Badge
              style={{
                background: "rgba(40,167,69,0.12)",
                color: "var(--edu-success)",
              }}
            >
              72% match
            </Badge>
          </div>
          {skills.map((s) => (
            <div key={s.skill} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{s.skill}</span>
                <span style={{ color: "var(--edu-light)" }}>
                  {s.you}% / {s.req}%
                </span>
              </div>
              <div
                className="h-2 rounded-full"
                style={{ background: "var(--edu-border)" }}
              >
                <div
                  className="h-2 rounded-full edu-gradient"
                  style={{ width: `${s.you}%` }}
                />
              </div>
            </div>
          ))}
          <div
            className="mt-2 p-3 rounded-2xl flex items-center gap-3"
            style={{ background: "rgba(255,159,41,0.1)" }}
          >
            <BookOpen style={{ color: "var(--edu-accent)" }} />
            <div className="text-sm">
              Recommended: <strong>Deep Learning Fundamentals</strong> · 10
              weeks · fast.ai
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function LandingStats({
  stats,
  loading,
}: {
  stats: BackendData | null;
  loading: boolean;
}) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <Card className="rounded-3xl edu-gradient text-white p-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <Users className="mx-auto mb-2" />
            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              {loading ? (
                "..."
              ) : (
                <Counter to={stats?.students_matched ?? 0} suffix="+" />
              )}
            </div>
            <div className="opacity-80">Students Matched</div>
          </div>
          <div>
            <BookOpen className="mx-auto mb-2" />
            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              {loading ? (
                "..."
              ) : (
                <Counter to={stats?.theses_tracked ?? 0} suffix="+" />
              )}
            </div>
            <div className="opacity-80">Theses Tracked</div>
          </div>
          <div>
            <Briefcase className="mx-auto mb-2" />
            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              {loading ? (
                "..."
              ) : (
                <Counter to={stats?.internships ?? 0} suffix="+" />
              )}
            </div>
            <div className="opacity-80">Course Catalogs</div>
          </div>
          <div>
            <Building2 className="mx-auto mb-2" />
            <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
              {loading ? "..." : <Counter to={stats?.universities ?? 0} />}
            </div>
            <div className="opacity-80">Universities</div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function LandingTestimonials() {
  const testimonials = [
    {
      name: "Farjana A. Limu",
      role: "MSc, Computer Science",
      body: "EduMatch found me a supervisor I never even considered — and the match was perfect.",
      avatar: "FL",
    },
    {
      name: "Dr. Ahmed Rahman",
      role: "Faculty, Machine Learning",
      body: "Blind review changed how I evaluate applications. My cohort quality jumped instantly.",
      avatar: "AR",
    },
    {
      name: "Riad Karim",
      role: "Alumni Mentor",
      body: "I mentor students across three universities now — all from one calendar.",
      avatar: "RK",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge
            className="mb-3"
            style={{
              background: "rgba(87,197,182,0.18)",
              color: "var(--edu-primary)",
            }}
          >
            Testimonials
          </Badge>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--edu-primary)",
            }}
          >
            Loved across campuses
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card
              key={i}
              className="p-6 rounded-3xl bg-white border edu-card-shadow hover-lift"
              style={{ borderColor: "var(--edu-border)" }}
            >
              <Quote style={{ color: "var(--edu-secondary)" }} />
              <p className="mt-3" style={{ color: "var(--edu-dark)" }}>
                {t.body}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="edu-gradient text-white">
                    {t.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--edu-primary)" }}>
                    {t.name}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--edu-light)" }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingFAQ() {
  const faqs = [
    {
      q: "Is EduMatch free for students?",
      a: "Yes — students access matching, skill gap analysis, and basic mentorship at no cost.",
    },
    {
      q: "How does AI matching work?",
      a: "We weight CGPA, skills, interests, supervisor expertise, and quota availability — admins can tune weights.",
    },
    {
      q: "Can my university join?",
      a: "Absolutely. Admins can request inter-university collaboration from the dashboard.",
    },
    {
      q: "Are credentials verifiable?",
      a: "Yes — each issued credential includes a unique QR that anyone can validate.",
    },
  ];

  return (
    <section id="faq" className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <Badge
          className="mb-3"
          style={{
            background: "rgba(26,95,122,0.1)",
            color: "var(--edu-primary)",
          }}
        >
          FAQ
        </Badge>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--edu-primary)",
          }}
        >
          Frequently Asked Questions
        </h2>
      </div>
      <Accordion
        type="single"
        collapsible
        className="bg-white rounded-3xl edu-card-shadow p-2"
      >
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q${i}`} className="px-4">
            <AccordionTrigger style={{ color: "var(--edu-primary)" }}>
              {f.q}
            </AccordionTrigger>
            <AccordionContent style={{ color: "var(--edu-light)" }}>
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function LandingCTA({ onGetStarted, onLogin }: PageProps) {
  return (
    <section className="px-6 pb-20">
      <div className="max-w-7xl mx-auto rounded-3xl edu-gradient text-white p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            Start your AI-powered academic journey today
          </h2>
          <p className="mt-2 opacity-90">
            Free for students. Built for the modern university.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onGetStarted}
            className="rounded-full h-12 px-6"
            style={{ background: "var(--edu-accent)" }}
          >
            Get Started <ArrowRight className="ml-2" size={18} />
          </Button>
          <Button
            variant="outline"
            onClick={onLogin}
            className="rounded-full h-12 px-6 bg-transparent text-white border-white hover:bg-white/10"
          >
            Log in
          </Button>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer
      className="border-t bg-white"
      style={{ borderColor: "var(--edu-border)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span style={{ color: "var(--edu-primary)", fontWeight: 700 }}>
              EduMatch
            </span>
          </div>
          <p style={{ color: "var(--edu-light)" }}>
            The AI-driven thesis & internship ecosystem for modern universities.
          </p>
        </div>
        <div>
          <h4 style={{ color: "var(--edu-primary)", fontWeight: 600 }}>
            Product
          </h4>
          <ul
            className="mt-3 space-y-2 text-sm"
            style={{ color: "var(--edu-light)" }}
          >
            <li>Features</li>
            <li>Pricing</li>
            <li>Universities</li>
            <li>Roadmap</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: "var(--edu-primary)", fontWeight: 600 }}>
            Company
          </h4>
          <ul
            className="mt-3 space-y-2 text-sm"
            style={{ color: "var(--edu-light)" }}
          >
            <li>About</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
            <li>Terms</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: "var(--edu-primary)", fontWeight: 600 }}>
            Stay updated
          </h4>
          <p className="mt-3 text-sm" style={{ color: "var(--edu-light)" }}>
            Get product updates and case studies in your inbox.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 px-3 py-2 text-sm rounded-xl border bg-white"
              style={{ borderColor: "var(--edu-border)" }}
              placeholder="you@university.edu"
            />
            <Button style={{ background: "var(--edu-primary)" }}>Join</Button>
          </div>
        </div>
      </div>
      <div
        className="border-t py-5 text-center text-sm"
        style={{ borderColor: "var(--edu-border)", color: "var(--edu-light)" }}
      >
        &copy; {new Date().getFullYear()} EduMatch. All rights reserved.
      </div>
    </footer>
  );
}
