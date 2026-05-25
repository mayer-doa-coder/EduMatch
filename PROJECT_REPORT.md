# EduMatch — Comprehensive DBMS Project Report
**Team:** Code & Query  
**Members:** Nusr at Taiba (0112310523), Amana Akter Akhi (0112310528), Farjana Akter Limu (0112310535), Tasnim Fatema Tinni (0112310501)

---

## 1. Project Overview

**EduMatch** is an AI-powered thesis and internship ecosystem that automates lifecycle management for students, supervisors, companies, and alumni. Designed for universities to reduce administrative friction and improve research outcomes.

| Item | Detail |
|---|---|
| **Core Problem** | Students struggle to find supervisors/internships; supervisors face admin overload; companies lack vetted pipelines; no unified thesis health monitoring |
| **Target Users** | Undergraduate & postgraduate students, faculty supervisors, university admins, corporate recruiters, alumni mentors |
| **Methodology** | Waterfall — clear deliverables and staged university approvals |
| **Backend** | PHP (REST APIs, authentication) |
| **Database** | MySQL (normalized tables, indexes) |
| **Frontend** | React 18 + Vite + Tailwind CSS + shadcn/ui + Recharts |

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18.3 + Vite 6.3 + TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix UI primitives)
- **Charts:** Recharts 2.15
- **Animation:** Motion (Framer Motion)
- **Forms:** React Hook Form
- **Routing:** React Router 7
- **Icons:** Lucide React

### Backend
- PHP — REST API endpoints
- Session-based authentication with role management

### Database
- MySQL — normalized relational schema
- Indexed for fast matching queries
- All logic is SQL-centric for simplicity

---

## 3. Database Schema (ERD — Essential Tables)

All core behaviors implemented with SQL queries (WHERE, ORDER BY, UPDATE, JOIN).

```sql
-- Core Tables

Users          (user_id PK, name, email, role, university_id FK)
Students       (student_id PK, user_id FK, cgpa, research_interest, assigned_supervisor_id FK)
Faculty        (faculty_id PK, user_id FK, designation, quota, current_student_count)
Projects       (project_id PK, student_id FK, supervisor_id FK, status, health_score)
Milestones     (milestone_id PK, project_id FK, due_date, submission_date, plagiarism_score)
Alumni_Mentors (alumni_id PK, user_id FK, expertise, company)
Universities   (university_id PK, uni_name, location)

-- Additional implied tables
Internships    (internship_id PK, company_id FK, role, salary, required_skills, status)
Applications   (application_id PK, student_id FK, internship_id FK, status, applied_date)
Courses        (course_id PK, name, provider, duration, difficulty, skill_tag)
Skills         (skill_id PK, student_id FK, skill_name, verified, verified_by FK)
Interviews     (interview_id PK, student_id FK, company_id FK, slot_datetime, status)
Messages       (message_id PK, sender_id FK, receiver_id FK, body, sent_at)
```

**Key design notes:**
- `university_id` on Users enables inter-university visibility filtering
- `quota` and `current_student_count` on Faculty drive load-balancing logic
- `health_score` on Projects enables burnout/at-risk detection
- `plagiarism_score` on Milestones enables automated chapter checks

---

## 4. SQL Operations Coverage

Every feature maps to one or more required SQL operations from `sql_operations.md`.

### 4.1 DDL Operations
| Operation | Used For |
|---|---|
| `CREATE DATABASE` | `edumatch` database setup |
| `CREATE TABLE` | All 11+ tables above |
| `PRIMARY KEY` | Every table's `_id` column |
| `FOREIGN KEY` | All relational links (student→user, project→student, etc.) |
| `UNIQUE KEY` | `email` in Users, `user_id` in Students/Faculty |
| `INDEX` | `cgpa`, `role`, `university_id`, `status` for fast queries |
| `CREATE VIEW` | Supervisor matching view, health report view |

### 4.2 SELECT Operations
| Operation | Feature |
|---|---|
| `SELECT` | All data retrieval |
| `SELECT DISTINCT` | Unique skill tags, unique universities |
| `WHERE` | Filter by role, university_id, status, etc. |
| `BETWEEN` | CGPA range filters, date range for milestones |
| `IN` / `NOT IN` | Skills matching — student has skill IN required skills |
| `LIKE` | Name search, email lookup |
| `IS NULL` / `IS NOT NULL` | Find unassigned students, projects without supervisors |
| `ORDER BY` | MCDM ranking — ORDER BY match_score DESC |
| `LIMIT` | Top-N supervisor matches, paginated internship lists |
| `AS` | Column aliases in matching queries, report columns |

### 4.3 DML Operations
| Operation | Feature |
|---|---|
| `INSERT INTO VALUES` | Register user, create project, post internship |
| `INSERT INTO SELECT` | Copy student data when creating blind review profiles |
| `UPDATE SET WHERE` | Update quota count, thesis status, health score |
| `DELETE FROM WHERE` | Remove applications, cancel interviews |

### 4.4 JOINs
| Operation | Feature |
|---|---|
| `INNER JOIN` | Student + Faculty match (both must exist) |
| `LEFT JOIN` | All students + their supervisor (NULL if unmatched) |
| `RIGHT JOIN` | All supervisors + their students |
| `CROSS JOIN` | Generate all student-supervisor pairs before scoring |
| `SELF JOIN` | Alumni mentoring relationships (alumni mentors alumni) |
| `Multiple JOINs` | Full matching query: Users + Students + Faculty + Projects + Universities |

### 4.5 Aggregate Functions
| Operation | Feature |
|---|---|
| `COUNT` | Number of students per supervisor, total applications |
| `SUM` | Total milestones submitted, total internship salary |
| `AVG` | Average CGPA per department, average health score |
| `MIN` / `MAX` | Lowest/highest plagiarism score, earliest deadline |
| `COUNT DISTINCT` | Unique skills in system, unique companies applied to |

### 4.6 Grouping & Filtering
| Operation | Feature |
|---|---|
| `GROUP BY` | Applications per company, projects per supervisor |
| `HAVING` | Supervisors with current_student_count > quota (overloaded) |
| `GROUP BY Multiple` | Projects grouped by university AND status |

### 4.7 Subqueries
| Operation | Feature |
|---|---|
| `Subquery in WHERE` | Find students whose supervisor quota is not full |
| `Subquery in SELECT` | Calculate match score inline |
| `Subquery in FROM` | Derived table of ranked supervisors |
| `Correlated Subquery` | Per-student: check if ANY milestone is overdue |
| `EXISTS` | Check if student already applied to internship |
| `NOT EXISTS` | Find supervisors with no current students |

### 4.8 Set Operations
| Operation | Feature |
|---|---|
| `UNION` | Combine thesis projects + internship applications into one activity feed |
| `UNION ALL` | Merge notifications from multiple sources |
| `INTERSECT` | Students who are both in thesis AND applied for internship |
| `MINUS` | Students with skills NOT matched to any internship requirement |

### 4.9 Views
```sql
-- Example views to implement
CREATE VIEW v_supervisor_load AS ...       -- supervisor capacity overview
CREATE VIEW v_thesis_health AS ...         -- at-risk project dashboard
CREATE VIEW v_blind_applicants AS ...      -- anonymized student profiles for supervisors
CREATE VIEW v_internship_matches AS ...    -- ranked internship list per student
```

---

## 5. User Roles & Pages

### 5.1 Role Map
```
student     → Student portal (Dashboard, Profile, Internships, Thesis, Matching)
supervisor  → Faculty portal (Dashboard, Blind Review, Capacity, Feedback)
admin       → Admin console (Overview, User Mgmt, Reports, Inter-University, Settings)
company     → Company portal (Overview, Job Posting, Applicants)
alumni      → Alumni portal (Overview, Mentorship, Messages)
```

### 5.2 Page Inventory (from frontend/src)

**Common (all roles):**
- Landing Page — Hero, Features, How It Works, Stats, Testimonials, FAQ, CTA
- Login Page — Role-based login
- Register Page — Role selection + form

**Student Pages:**
| Page | Key SQL |
|---|---|
| Overview | SELECT thesis health, milestones, recent notifications |
| Profile & Skills | SELECT/UPDATE student skills, INSERT verified skills |
| Supervisor Match | MCDM ranking query — ORDER BY composite score DESC |
| Internships | Ranked list — match score, LEFT JOIN with applications |
| Thesis Submission | INSERT milestone, UPDATE project status |
| Thesis Health | AVG progress, flag At Risk via subquery |
| Skill Gap | LEFT JOIN student_skills with required_skills, find NULLs |
| QR Credential | SELECT verified skills WHERE verified = 1 |
| Interview Scheduler | INSERT interview slot, check availability |

**Supervisor Pages:**
| Page | Key SQL |
|---|---|
| Overview | COUNT students, AVG health score |
| Blind Review | SELECT from v_blind_applicants, no name shown |
| Capacity Settings | UPDATE quota, view current_student_count |
| Feedback | INSERT feedback, UPDATE milestone comments |

**Admin Pages:**
| Page | Key SQL |
|---|---|
| Overview | Aggregate stats across all universities |
| User Management | SELECT/UPDATE/DELETE users by role |
| Reports | GROUP BY reports — plagiarism, completion rates |
| Inter-University | WHERE university_id = X, cross-institution data |
| System Settings | UPDATE system config table |

**Company Pages:**
| Page | Key SQL |
|---|---|
| Overview | COUNT applications, accepted/rejected stats |
| Job Posting Form | INSERT internship, INSERT required skills |
| Applicants | SELECT students WHERE applied = internship_id |

**Alumni Pages:**
| Page | Key SQL |
|---|---|
| Overview | SELECT mentee list, upcoming sessions |
| Mentorship | INSERT/UPDATE mentoring sessions |
| Messages | INSERT message, SELECT conversation thread |

---

## 6. Key Features & SQL Implementation

### 6.1 MCDM Supervisor Matching
```sql
-- Composite score: CGPA weight 40%, interest match 35%, skills 25%
SELECT 
  f.faculty_id, u.name,
  (s.cgpa * 0.4 + interest_score * 0.35 + skill_score * 0.25) AS match_score
FROM Students s
INNER JOIN Faculty f ON ...
WHERE f.current_student_count < f.quota
ORDER BY match_score DESC
LIMIT 5;
```

### 6.2 Load Balancing (Auto-reassign)
```sql
-- Find overloaded supervisors
SELECT faculty_id FROM Faculty
WHERE current_student_count >= quota
HAVING COUNT(*) > 0;

-- Auto-increment count on assignment
UPDATE Faculty SET current_student_count = current_student_count + 1
WHERE faculty_id = ? AND current_student_count < quota;
```

### 6.3 Thesis Health & Burnout Detection
```sql
-- Flag At Risk projects
SELECT p.project_id, p.health_score
FROM Projects p
WHERE EXISTS (
  SELECT 1 FROM Milestones m
  WHERE m.project_id = p.project_id
  AND m.submission_date IS NULL
  AND m.due_date < CURDATE()
);
```

### 6.4 Skill Gap Analysis
```sql
-- Missing skills for a student
SELECT required_skill FROM Internship_Skills
WHERE internship_id = ?
AND required_skill NOT IN (
  SELECT skill_name FROM Skills WHERE student_id = ?
);
```

### 6.5 Blind Review
```sql
-- Anonymized applicant view for supervisors
CREATE VIEW v_blind_applicants AS
SELECT 
  CONCAT('APX-', student_id) AS code,
  cgpa, research_interest
FROM Students
WHERE assigned_supervisor_id IS NULL;
```

### 6.6 Inter-University Bridge
```sql
-- Cross-university resource visibility
SELECT * FROM Projects p
INNER JOIN Students s ON p.student_id = s.student_id
INNER JOIN Users u ON s.user_id = u.user_id
WHERE u.university_id IN (
  SELECT university_id FROM Universities WHERE status = 'Active'
);
```

---

## 7. Frontend Architecture

```
frontend/src/
├── main.tsx                          # React entry point
├── app/
│   ├── App.tsx                       # Router + role-based page switching
│   └── components/
│       ├── edu-data.ts               # Shared mock data (supervisors, internships, milestones)
│       ├── auth/                     # AuthBrandPanel, RoleBadges
│       ├── landing/                  # Hero, Features, FAQ, Footer, Navbar, etc.
│       ├── pages/
│       │   ├── LandingPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx     # Role switcher
│       │   ├── StudentDashboard.tsx
│       │   ├── student/              # Overview, Profile, Internships, ThesisHealth,
│       │   │                         # ThesisSubmission, SkillGap, SupervisorMatch,
│       │   │                         # QRCredential, InterviewScheduler
│       │   ├── supervisor/           # Overview, BlindReview, Capacity, Feedback
│       │   ├── admin/                # Overview, UserManagement, Reports,
│       │   │                         # InterUniversity, SystemSettings
│       │   ├── company/              # Overview, JobPostingForm, Applicants
│       │   ├── alumni/               # Overview, Mentorship, Messages
│       │   └── shared/               # Notifications, Settings, Help
│       ├── shared/                   # DashboardShell, StatCard, SectionTitle, UploadArea
│       └── ui/                       # Full shadcn/ui component library
```

---

## 8. Sample Data (from edu-data.ts)

| Entity | Count | Example |
|---|---|---|
| Supervisors | 5 | Dr. Ahmed Rahman — ML, quota 8, current 5, match 96% |
| Internships | 4 | DataPeak Labs — ML Intern, ৳35,000/mo, 95% match |
| Courses | 5 | Machine Learning (Coursera, 8 weeks, Intermediate) |
| Milestones | 6 | Proposal ✓, Literature Review ✓, Methodology ✓, Implementation (active) |
| Universities | 4 | Dhaka University (124 students), BUET (98), NSU (76), BRAC (88) |
| Admin Projects | 5 | Federated Learning (score 92, Low risk) to Retinal Disease (58, High risk) |

---

## 9. SQL Operations Checklist

Use this checklist to verify all required operations are implemented in the PHP backend.

### DDL
- [ ] CREATE DATABASE `edumatch`
- [ ] DROP DATABASE (for reset/testing)
- [ ] CREATE TABLE (all tables above)
- [ ] CREATE VIEW (4+ views listed above)
- [ ] PRIMARY KEY on every table
- [ ] FOREIGN KEY constraints
- [ ] UNIQUE KEY on `email`
- [ ] INDEX on `cgpa`, `role`, `status`, `university_id`

### SELECT
- [ ] SELECT with WHERE — filter by role, status
- [ ] SELECT DISTINCT — unique skills, universities
- [ ] BETWEEN — CGPA ranges, date ranges
- [ ] IN / NOT IN — skill matching, status filtering
- [ ] LIKE — name/email search
- [ ] IS NULL / IS NOT NULL — unassigned students
- [ ] ORDER BY — MCDM ranking
- [ ] LIMIT — top-N results
- [ ] AS — aliases in reports

### DML
- [ ] INSERT INTO VALUES — registration, project creation
- [ ] INSERT INTO SELECT — blind profile copy
- [ ] UPDATE SET WHERE — quota, status, health score
- [ ] DELETE FROM WHERE — remove applications

### JOINs
- [ ] INNER JOIN — student + faculty match
- [ ] LEFT JOIN — students with optional supervisor
- [ ] RIGHT JOIN — supervisors + students
- [ ] CROSS JOIN — pairing for scoring
- [ ] SELF JOIN — alumni mentoring chain
- [ ] Multiple JOINs — full matching query

### Aggregate
- [ ] COUNT — students per supervisor
- [ ] SUM — total applications
- [ ] AVG — CGPA, health score
- [ ] MIN / MAX — deadlines, scores
- [ ] COUNT DISTINCT — unique companies

### Grouping
- [ ] GROUP BY — applications per company
- [ ] HAVING — overloaded supervisors
- [ ] GROUP BY Multiple — by university AND status

### Subqueries
- [ ] Subquery in WHERE — quota check
- [ ] Subquery in SELECT — inline score calc
- [ ] Subquery in FROM — derived ranking table
- [ ] Correlated Subquery — per-student milestone check
- [ ] EXISTS — duplicate application check
- [ ] NOT EXISTS — supervisors with no students

### Set Operations
- [ ] UNION — merged activity feed
- [ ] UNION ALL — merged notifications
- [ ] INTERSECT — students in thesis AND internship
- [ ] MINUS — unmatched skills

### Views
- [ ] v_supervisor_load
- [ ] v_thesis_health
- [ ] v_blind_applicants
- [ ] v_internship_matches

---

## 10. Project Timeline

| Phase | Duration | Tasks |
|---|---|---|
| Week 1 | Frontend | UI/UX in Figma, HTML/CSS, React setup |
| Weeks 2–3 | Backend | PHP APIs, MySQL schema, authentication |
| Week 4 | Integration | System integration, E2E testing |
| Week 4 (end) | Deployment | Bug fixes, deployment preparation |

---

## 11. Key Metrics & Impact

- Reduce supervisor-student matching time by ~80%
- Increase credential trust via QR-backed skill verification
- Survey: n=81 users (Facebook, WhatsApp, university networks)
- Principal age range: 23–26, majority undergraduates from private universities

---

## 12. Quick Reference — How to Use This Report

**To implement a new feature:** Find it in Section 5 (Pages) or Section 6 (Key Features), get the SQL pattern, write the PHP endpoint.

**To check SQL coverage:** Use Section 9 checklist — tick each box as you add the query to your PHP backend.

**To understand the schema:** Section 3 has the complete table list. All FK relationships are listed.

**To understand what data each page needs:** Section 5.2 maps each page to its SQL operations.

**To understand the frontend structure:** Section 7 shows exact file paths for every component.
