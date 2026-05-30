/**
 * usePortalData — unified data hook for the student dashboard.
 *
 * Strategy:
 *   1. If profileId is supplied, attempt a real API call.
 *   2. If the API call fails (or profileId is null), fall back to rich mock
 *      data drawn from edu-data.ts so the UI never shows a blank screen.
 *
 * The returned shape mirrors the API response from get_student_dashboard.php
 * so that both real and mock paths are interchangeable for every consumer.
 */

import { useEffect, useState } from "react";
import {
  supervisors  as mockSupervisors,
  courses      as mockCourses,
  internships  as mockInternships,
  milestones   as mockMilestones,
  notifications as mockNotifications,
  progressData as mockProgressData,
  currentStudent,
} from "../components/edu-data";

const API = "http://localhost/EduMatch/backend";

// ── Shared types (used by consuming components) ────────────────────────────────

export interface PortalStudent {
  student_id:         number;
  name:               string;
  email:              string;
  university:         string;
  cgpa:               number;
  research_interest:  string;
  technical_skills:   string;
}

export interface PortalMilestone {
  name:             string;
  due_date:         string;
  submission_date:  string | null;
  overdue:          boolean;
}

export interface PortalThesis {
  project_id:      number;
  title:           string;
  status:          string;
  health_score:    number;
  supervisor_name: string;
  milestones:      PortalMilestone[];
}

export interface PortalProgress {
  total_milestones: number;
  done_count:       number;
  overdue_count:    number;
  completion_pct:   number;
}

export interface PortalSupervisor {
  faculty_id:          number;
  supervisor_name:     string;
  quota:               number;
  current_student_count: number;
  slots_available:     number;
  avatar_color?:       string;
}

export interface PortalCourse {
  course_id:  number;
  name:       string;
  provider:   string;
  duration:   string;
  difficulty: string;
}

export interface PortalInternship {
  id:       number;
  company:  string;
  role:     string;
  salary:   string;
  match:    number;
  skills:   string[];
}

export interface PortalNotification {
  type:   string;
  title:  string;
  time:   string;
  detail: string | null;
}

export interface PortalProgressPoint {
  week:     string;
  progress: number;
}

export interface PortalDashboardData {
  student:       PortalStudent;
  thesis:        PortalThesis[];
  notifications: PortalNotification[];
  progress:      PortalProgress;
  supervisors:   PortalSupervisor[];
  courses:       PortalCourse[];
  internships:   PortalInternship[];
  chartData:     PortalProgressPoint[];
}

// ── Mock data builder ──────────────────────────────────────────────────────────

function buildMockData(): PortalDashboardData {
  const doneMilestones = mockMilestones.filter(m => m.status === "done").length;

  return {
    student: {
      student_id:        1,
      name:              currentStudent.name,
      email:             currentStudent.email,
      university:        currentStudent.university,
      cgpa:              currentStudent.cgpa,
      research_interest: currentStudent.interests.join(", "),
      technical_skills:  currentStudent.skills.join(", "),
    },
    thesis: [
      {
        project_id:      1,
        title:           "Federated Learning at the Edge",
        status:          "active",
        health_score:    currentStudent.thesisHealth,
        supervisor_name: "Dr. Ahmed Rahman",
        milestones: mockMilestones.map(m => ({
          name:            m.name,
          due_date:        m.date,
          submission_date: m.status === "done" ? m.date : null,
          overdue:         false,
        })),
      },
    ],
    notifications: mockNotifications.map(n => ({
      type:   "info",
      title:  n.title,
      time:   n.time,
      detail: n.body,
    })),
    progress: {
      total_milestones: mockMilestones.length,
      done_count:       doneMilestones,
      overdue_count:    0,
      completion_pct:   Math.round((doneMilestones / mockMilestones.length) * 100),
    },
    supervisors: mockSupervisors.map((s, i) => ({
      faculty_id:            s.id,
      supervisor_name:       s.name,
      quota:                 s.quota,
      current_student_count: s.current,
      slots_available:       s.quota - s.current,
      avatar_color:          ["#4DB6AC", "#607D8B", "#5C6BC0", "#EF5350", "#66BB6A"][i % 5],
    })),
    courses: mockCourses.map((c, i) => ({
      course_id:  c.id ?? i + 1,
      name:       c.name,
      provider:   c.provider,
      duration:   c.duration,
      difficulty: c.difficulty,
    })),
    internships: mockInternships.map(i => ({
      id:      i.id,
      company: i.company,
      role:    i.role,
      salary:  i.salary,
      match:   i.match,
      skills:  i.skills,
    })),
    chartData: mockProgressData.map(p => ({
      week:     p.week,
      progress: p.progress,
    })),
  };
}

// ── Hook ───────────────────────────────────────────────────────────────────────

interface UsePortalDataResult {
  data:    PortalDashboardData | null;
  loading: boolean;
  error:   string | null;
  /** Force re-fetch (e.g. after a mutation). */
  refetch: () => void;
}

export function usePortalData(profileId: number | null): UsePortalDataResult {
  const [data,    setData]    = useState<PortalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      // If there's no backend profile yet, skip the network call entirely.
      if (!profileId) {
        if (!cancelled) {
          setData(buildMockData());
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(
          `${API}/get_student_dashboard.php?student_id=${profileId}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          if (json.success) {
            // Merge API response with mock internships/chartData (not in API yet).
            const mock = buildMockData();
            setData({
              ...json,
              internships: mock.internships,
              chartData:   mock.chartData,
            });
          } else {
            // API returned success:false — fall back to mock silently.
            setData(buildMockData());
          }
        }
      } catch {
        if (!cancelled) {
          setData(buildMockData());
          setError("Could not reach server — showing offline data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [profileId, tick]);

  const refetch = () => setTick(t => t + 1);

  return { data, loading, error, refetch };
}
