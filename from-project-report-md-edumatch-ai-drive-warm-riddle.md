# EduMatch — Execution Plan
**Purpose:** Step-by-step guide to build the complete EduMatch DBMS project from its current state to a fully working system with all SQL operations demonstrated.

---

## Context
EduMatch is a DBMS course project. The #1 goal is to demonstrate every SQL operation listed in `sql_operations.md` through a working PHP + MySQL backend. The React frontend already exists as a full UI prototype — it just needs to be connected to real data. The plan is ordered so that the database comes first, then the backend PHP files (one per feature), then the frontend connections.

---

## Current Status (What's Already Done vs What's Missing)

### DONE — Keep As-Is
| File | Status | Notes |
|---|---|---|
| `frontend/` entire folder | Complete UI | All pages exist, all roles work, uses mock data for now |
| `backend/login.php` | Working | Real DB queries, bcrypt auth, correct |
| `backend/register.php` | Working | Transactions, FK lookups, bcrypt, correct |
| `backend/landing.php` | Working | COUNT queries, returns stats correctly |

### BROKEN — Must Fix
| File | Problem | Fix |
|---|---|---|
| `backend/index.php` | Wrong DB name (`varsity_db`), wrong table (`students` lowercase) | Rewrite as a proper DB connectivity test |
| `backend/get_student_dashboard.php` | All data is hardcoded mock — DB connection is commented out | Rewrite with real SQL queries |

### MISSING — Must Create
| What | Why Needed |
|---|---|
| `database/schema.sql` | The entire MySQL database does not exist yet — no tables, no schema |
| `database/seed.sql` | Sample data needed to test all queries |
| `backend/supervisor_match.php` | MCDM matching endpoint (covers ORDER BY, LIMIT, JOINs, subquery) |
| `backend/skill_gap.php` | Skill gap analysis (covers NOT IN, LEFT JOIN, subquery) |
| `backend/submit_milestone.php` | Milestone submission (covers INSERT, UPDATE, IS NULL check) |
| `backend/apply_internship.php` | Apply to internship (covers INSERT, EXISTS, DELETE) |
| `backend/get_supervisor_dashboard.php` | Supervisor data (covers GROUP BY, HAVING, blind review VIEW) |
| `backend/get_admin_dashboard.php` | Admin analytics (covers UNION, INTERSECT, GROUP BY Multiple) |
| `backend/post_job.php` | Company job posting (covers INSERT, LIKE search) |
| `backend/get_alumni_dashboard.php` | Alumni mentorship (covers SELF JOIN, UNION ALL) |

---

## Phase 1 — Create the MySQL Database
**Goal:** Build the complete schema so every other step has a database to work with.
**File to create:** `database/schema.sql`

### What this file must contain (covers ALL DDL requirements):

```
Step 1.1 — Database creation
  DROP DATABASE IF EXISTS DBMS_project;
  CREATE DATABASE DBMS_project;
  USE DBMS_project;

Step 1.2 — Create all tables (in FK-safe order)
  Universities  → no FK dependencies, create first
  Users         → FK to Universities
  Students      → FK to Users + self-reference to Faculty (assigned_supervisor)
  Faculty       → FK to Users
  Projects_Thesis → FK to Students + Faculty
  Milestones    → FK to Projects_Thesis
  Internships   → FK to Universities (company_id)
  Applications  → FK to Students + Internships
  Skills        → FK to Students + Users (verified_by)
  Courses       → standalone
  Interviews    → FK to Students + Internships
  Alumni_Mentors → FK to Users
  Messages      → FK to Users (sender + receiver)

Step 1.3 — Constraints on every table
  PRIMARY KEY on every _id column
  FOREIGN KEY for every relationship listed above
  UNIQUE KEY on Users.email
  UNIQUE KEY on Students.user_id, Faculty.user_id

Step 1.4 — Indexes for performance
  INDEX on Students.cgpa
  INDEX on Users.role
  INDEX on Users.university_id
  INDEX on Projects_Thesis.status
  INDEX on Applications.status

Step 1.5 — Create Views (4 required views)
  v_supervisor_load     → Faculty + COUNT of students (GROUP BY)
  v_thesis_health       → Projects with overdue milestones flagged At Risk
  v_blind_applicants    → Students with no supervisor, anonymized (APX-id)
  v_internship_matches  → Internships with required skills joined
```

**Critical table columns to match the PHP files already written:**

```
Users:         user_id, name, email, password_hash, role, university_id
Students:      student_id, user_id, cgpa, research_interest, technical_skills, assigned_supervisor_id
Faculty:       faculty_id, user_id, designation, quota, current_student_count, research_focus
Projects_Thesis: project_id, student_id, supervisor_id, title, status, health_score
Milestones:    milestone_id, project_id, name, due_date, submission_date, plagiarism_score
Internships:   internship_id, company_name, role_title, salary, required_skills, deadline, status
Applications:  application_id, student_id, internship_id, status, applied_date
Skills:        skill_id, student_id, skill_name, verified, verified_by
Courses:       course_id, name, provider, duration, difficulty, skill_tag
Interviews:    interview_id, student_id, internship_id, slot_datetime, status
Alumni_Mentors: alumni_id, user_id, expertise, company
Messages:      message_id, sender_id, receiver_id, body, sent_at
Universities:  university_id, uni_name, location, status
```

---

## Phase 2 — Add Sample Data
**Goal:** Populate the database so queries actually return results.
**File to create:** `database/seed.sql`

```
Step 2.1 — INSERT 4 universities (Dhaka University, BUET, NSU, BRAC)
Step 2.2 — INSERT ~10 users (2 students, 3 faculty/supervisors, 1 admin, 2 companies, 1 alumni)
Step 2.3 — INSERT corresponding Students rows (with different CGPAs: 3.92, 3.71, 3.85...)
Step 2.4 — INSERT Faculty rows (different quotas and current_student_count values)
Step 2.5 — INSERT 3-4 Projects_Thesis rows (different statuses: active, completed, at_risk)
Step 2.6 — INSERT Milestones (mix of done/active/overdue)
Step 2.7 — INSERT 4 Internships with different required_skills
Step 2.8 — INSERT Applications (some existing, for EXISTS/NOT EXISTS demos)
Step 2.9 — INSERT Skills for students
Step 2.10 — INSERT Courses (free courses matching skill tags)
Step 2.11 — INSERT Alumni_Mentors + Messages rows
```

---

## Phase 3 — Fix Broken Backend Files

### 3.1 Rewrite `backend/index.php`
**Goal:** Make it a proper health check / DB test file.
```
- Change DB name from varsity_db to DBMS_project
- Change table from students (lowercase) to Students (correct)
- Add SELECT COUNT(*) FROM Users to verify schema is loaded
- Return: DB connected + table counts as JSON
```

### 3.2 Rewrite `backend/get_student_dashboard.php`
**Goal:** Replace all hardcoded mock data with real SQL queries.
**SQL operations this file must cover:**

```
Input: student_id (GET or POST parameter)

Query 1 — Student profile
  SELECT s.*, u.name, u.email, uni.uni_name
  FROM Students s
  INNER JOIN Users u ON s.user_id = u.user_id
  INNER JOIN Universities uni ON u.university_id = uni.university_id
  WHERE s.student_id = :sid
  → Covers: SELECT, INNER JOIN, Multiple JOINs, WHERE

Query 2 — Thesis health + active milestones
  SELECT p.project_id, p.title, p.status, p.health_score,
         m.name AS milestone_name, m.due_date, m.submission_date
  FROM Projects_Thesis p
  LEFT JOIN Milestones m ON p.project_id = m.project_id
  WHERE p.student_id = :sid
  ORDER BY m.due_date ASC
  → Covers: LEFT JOIN, ORDER BY, IS NULL (check submission_date)

Query 3 — Notifications (use UNION ALL)
  SELECT 'internship' AS type, company_name AS title, applied_date AS time
  FROM Internships i
  INNER JOIN Applications a ON i.internship_id = a.internship_id
  WHERE a.student_id = :sid
  UNION ALL
  SELECT 'message' AS type, body AS title, sent_at AS time
  FROM Messages
  WHERE receiver_id = (SELECT user_id FROM Students WHERE student_id = :sid)
  ORDER BY time DESC LIMIT 5
  → Covers: UNION ALL, Subquery in WHERE

Query 4 — Progress data (weekly milestones done)
  SELECT COUNT(*) AS done_count FROM Milestones m
  INNER JOIN Projects_Thesis p ON m.project_id = p.project_id
  WHERE p.student_id = :sid AND m.submission_date IS NOT NULL
  → Covers: IS NOT NULL, aggregate COUNT

Output: JSON with student, thesis, milestones, notifications, progress
```

---

## Phase 4 — Create New Backend Files

Each file covers specific SQL operations from the checklist. Create them in order.

### 4.1 Create `backend/supervisor_match.php`
**What it does:** Returns ranked list of supervisors for a student (MCDM matching).
**SQL operations covered:** CROSS JOIN, INNER JOIN, ORDER BY, LIMIT, AS, WHERE, NOT IN, Correlated Subquery

```
Input: student_id

Step 1 — Get student's CGPA + interests
  SELECT cgpa, research_interest FROM Students WHERE student_id = :sid

Step 2 — CROSS JOIN students × faculty to generate all pairs, then score
  SELECT f.faculty_id, u.name, f.expertise,
         f.quota, f.current_student_count,
         (
           -- interest match score (subquery in SELECT)
           SELECT CASE WHEN f.research_focus LIKE CONCAT('%', s.research_interest, '%') THEN 35 ELSE 0 END
         ) +
         (s.cgpa * 10) AS match_score
  FROM Faculty f
  CROSS JOIN Students s
  INNER JOIN Users u ON f.user_id = u.user_id
  WHERE s.student_id = :sid
    AND f.current_student_count < f.quota  -- load balancing filter
    AND f.faculty_id NOT IN (
      SELECT assigned_supervisor_id FROM Students
      WHERE assigned_supervisor_id IS NOT NULL
        AND student_id = :sid
    )
  ORDER BY match_score DESC
  LIMIT 5

Output: JSON array of top 5 supervisors with match scores
```

### 4.2 Create `backend/skill_gap.php`
**What it does:** Finds skills a student is missing for a given internship + suggests courses.
**SQL operations covered:** NOT IN, Subquery in WHERE, LEFT JOIN, IS NULL, SELECT DISTINCT, IN

```
Input: student_id, internship_id

Step 1 — Get required skills for the internship (stored as comma-separated or in a junction table)
  SELECT required_skills FROM Internships WHERE internship_id = :iid

Step 2 — Get skills the student already has
  SELECT skill_name FROM Skills WHERE student_id = :sid AND verified = 1

Step 3 — Find missing skills using NOT IN
  SELECT DISTINCT skill_tag AS missing_skill
  FROM Courses
  WHERE skill_tag NOT IN (
    SELECT skill_name FROM Skills WHERE student_id = :sid
  )
  AND skill_tag IN (
    SELECT required_skills FROM Internships WHERE internship_id = :iid
  )

Step 4 — For each missing skill, suggest a free course
  SELECT c.name, c.provider, c.duration, c.difficulty
  FROM Courses c
  LEFT JOIN Skills s ON c.skill_tag = s.skill_name AND s.student_id = :sid
  WHERE s.skill_id IS NULL
  ORDER BY c.difficulty ASC

Output: JSON with missing_skills array + recommended_courses array
```

### 4.3 Create `backend/submit_milestone.php`
**What it does:** Submits a thesis chapter/milestone. Checks if overdue. Updates health score.
**SQL operations covered:** INSERT INTO VALUES, UPDATE SET WHERE, IS NULL, IS NOT NULL, EXISTS, AVG

```
Input: project_id, milestone_name, plagiarism_score (POST)

Step 1 — Check if milestone already submitted (EXISTS)
  SELECT EXISTS(
    SELECT 1 FROM Milestones
    WHERE project_id = :pid AND name = :mname
    AND submission_date IS NOT NULL
  ) AS already_done

Step 2 — Insert new milestone record
  INSERT INTO Milestones (project_id, name, due_date, submission_date, plagiarism_score)
  VALUES (:pid, :mname, :due, CURDATE(), :pscore)

Step 3 — Recalculate health score (AVG of plagiarism scores for this project)
  SELECT AVG(plagiarism_score) AS avg_plag
  FROM Milestones
  WHERE project_id = :pid AND submission_date IS NOT NULL

Step 4 — Update project health score
  UPDATE Projects_Thesis
  SET health_score = :new_score,
      status = CASE WHEN :new_score < 60 THEN 'at_risk' ELSE 'active' END
  WHERE project_id = :pid

Output: JSON success + updated health score
```

### 4.4 Create `backend/apply_internship.php`
**What it does:** Handles apply, withdraw, and list application actions.
**SQL operations covered:** INSERT INTO VALUES, DELETE FROM WHERE, EXISTS, NOT EXISTS, SELECT with WHERE, BETWEEN

```
Input: action (apply/withdraw/list), student_id, internship_id

[apply]
  Step 1 — Check not already applied (EXISTS)
    SELECT EXISTS(SELECT 1 FROM Applications
                  WHERE student_id=:sid AND internship_id=:iid) AS exists

  Step 2 — Insert application
    INSERT INTO Applications (student_id, internship_id, status, applied_date)
    VALUES (:sid, :iid, 'pending', CURDATE())

[withdraw]
  DELETE FROM Applications WHERE student_id=:sid AND internship_id=:iid

[list]
  SELECT i.role_title, i.company_name, i.salary, a.status, a.applied_date
  FROM Applications a
  INNER JOIN Internships i ON a.internship_id = i.internship_id
  WHERE a.student_id = :sid
    AND i.deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  ORDER BY a.applied_date DESC

Output: JSON result based on action
```

### 4.5 Create `backend/get_supervisor_dashboard.php`
**What it does:** Supervisor's view — their students, workload, blind applicants.
**SQL operations covered:** GROUP BY, HAVING, COUNT, AVG, MIN/MAX, RIGHT JOIN, VIEW (v_blind_applicants), SELECT ALL

```
Input: faculty_id

Query 1 — Supervisor profile + student count
  SELECT f.*, u.name, u.email,
         COUNT(s.student_id) AS actual_count,
         AVG(s.cgpa) AS avg_student_cgpa
  FROM Faculty f
  INNER JOIN Users u ON f.user_id = u.user_id
  LEFT JOIN Students s ON s.assigned_supervisor_id = f.faculty_id
  WHERE f.faculty_id = :fid
  GROUP BY f.faculty_id

Query 2 — Projects health summary grouped by status
  SELECT p.status, COUNT(*) AS total,
         AVG(p.health_score) AS avg_health,
         MIN(p.health_score) AS min_health,
         MAX(p.health_score) AS max_health
  FROM Projects_Thesis p
  WHERE p.supervisor_id = :fid
  GROUP BY p.status
  HAVING COUNT(*) > 0

Query 3 — Supervisors with overloaded capacity (HAVING demo)
  SELECT faculty_id, current_student_count, quota
  FROM Faculty
  GROUP BY faculty_id
  HAVING current_student_count >= quota

Query 4 — Blind applicants (using the view)
  SELECT * FROM v_blind_applicants
  WHERE university_id = (SELECT university_id FROM Users WHERE user_id =
                         (SELECT user_id FROM Faculty WHERE faculty_id = :fid))

Output: JSON with profile, thesis_summary, blind_applicants
```

### 4.6 Create `backend/get_admin_dashboard.php`
**What it does:** Admin-level analytics across all universities.
**SQL operations covered:** UNION, UNION ALL, INTERSECT, MINUS, GROUP BY Multiple, SELECT DISTINCT, COUNT DISTINCT

```
Input: none (admin sees everything)

Query 1 — All activity feed (UNION)
  SELECT 'thesis' AS type, title AS item, student_id AS ref_id, status
  FROM Projects_Thesis
  UNION
  SELECT 'internship', role_title, internship_id, status
  FROM Internships
  ORDER BY ref_id DESC LIMIT 20

Query 2 — Students per university AND status (GROUP BY Multiple)
  SELECT uni.uni_name, p.status, COUNT(*) AS count
  FROM Projects_Thesis p
  INNER JOIN Students s ON p.student_id = s.student_id
  INNER JOIN Users u ON s.user_id = u.user_id
  INNER JOIN Universities uni ON u.university_id = uni.university_id
  GROUP BY uni.uni_name, p.status
  ORDER BY uni.uni_name

Query 3 — Students in BOTH thesis AND internship (INTERSECT)
  SELECT student_id FROM Projects_Thesis WHERE status = 'active'
  INTERSECT
  SELECT student_id FROM Applications WHERE status = 'accepted'

Query 4 — Students with NO internship applications (MINUS)
  SELECT student_id FROM Students
  MINUS
  SELECT DISTINCT student_id FROM Applications

Query 5 — Unique skills across platform
  SELECT COUNT(DISTINCT skill_name) AS unique_skills FROM Skills

Query 6 — Plagiarism reports — top offenders
  SELECT p.title, m.plagiarism_score, s.student_id
  FROM Milestones m
  INNER JOIN Projects_Thesis p ON m.project_id = p.project_id
  INNER JOIN Students s ON p.student_id = s.student_id
  WHERE m.plagiarism_score > 20
  ORDER BY m.plagiarism_score DESC

Output: JSON with activity, stats, intersect_students, reports
```

### 4.7 Create `backend/post_job.php`
**What it does:** Company posts a new internship. Also searches existing postings.
**SQL operations covered:** INSERT INTO VALUES, SELECT LIKE, ORDER BY, LIMIT, BETWEEN

```
Input: action (post/search), company fields or search_term

[post]
  INSERT INTO Internships (company_name, role_title, salary, required_skills, deadline, status)
  VALUES (:cname, :role, :salary, :skills, :deadline, 'open')

[search]
  SELECT * FROM Internships
  WHERE role_title LIKE CONCAT('%', :term, '%')
     OR required_skills LIKE CONCAT('%', :term, '%')
  AND deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
  ORDER BY deadline ASC
  LIMIT 10

Output: JSON success or search results
```

### 4.8 Create `backend/get_alumni_dashboard.php`
**What it does:** Alumni mentorship data — mentees, sessions, messages.
**SQL operations covered:** SELF JOIN, UNION ALL, INSERT, SELECT with IS NOT NULL

```
Input: alumni_id

Query 1 — SELF JOIN: Alumni who mentor other alumni
  SELECT a1.alumni_id, u1.name AS mentor, u2.name AS mentee, a2.expertise
  FROM Alumni_Mentors a1
  INNER JOIN Alumni_Mentors a2 ON a1.alumni_id != a2.alumni_id
  INNER JOIN Users u1 ON a1.user_id = u1.user_id
  INNER JOIN Users u2 ON a2.user_id = u2.user_id
  WHERE a1.alumni_id = :aid

Query 2 — Conversation feed (UNION ALL messages both directions)
  SELECT sender_id AS from_id, body, sent_at FROM Messages WHERE receiver_id = :uid
  UNION ALL
  SELECT receiver_id AS from_id, body, sent_at FROM Messages WHERE sender_id = :uid
  ORDER BY sent_at DESC LIMIT 20

Output: JSON with mentees and messages
```

---

## Phase 5 — Connect Frontend to Real APIs

**Goal:** Replace mock data in dashboard pages with `fetch()` calls to the PHP endpoints.
**Approach:** Only replace the data source — keep all UI components exactly as they are.

Each dashboard page currently imports from `edu-data.ts`. Replace those imports with API calls using `useEffect` + `useState`.

| Frontend File | Replace Mock With | Endpoint |
|---|---|---|
| `pages/student/Overview.tsx` | currentStudent, milestones, notifications, progressData | `GET /get_student_dashboard.php?student_id=X` |
| `pages/student/SupervisorMatch.tsx` | supervisors array | `GET /supervisor_match.php?student_id=X` |
| `pages/student/SkillGap.tsx` | courses array | `GET /skill_gap.php?student_id=X&internship_id=Y` |
| `pages/student/ThesisSubmission.tsx` | milestones | `POST /submit_milestone.php` |
| `pages/student/Internships.tsx` | internships | `GET /apply_internship.php?action=list&student_id=X` |
| `pages/supervisor/Overview.tsx` | supervisors mock | `GET /get_supervisor_dashboard.php?faculty_id=X` |
| `pages/supervisor/BlindReview.tsx` | blindApplicants | included in supervisor dashboard response |
| `pages/admin/Overview.tsx` | matchingDist, applicationStatus | `GET /get_admin_dashboard.php` |
| `pages/company/JobPostingForm.tsx` | (no mock) | `POST /post_job.php` |
| `pages/alumni/Overview.tsx` | mentees | `GET /get_alumni_dashboard.php?alumni_id=X` |

**How to get the logged-in user's ID:** `login.php` and `register.php` already return `user_id`, `profile_id`, and `role` in their response. Store these in `localStorage` after login. Dashboard pages read from `localStorage` to get the `student_id` / `faculty_id` to pass to API calls.

---

## Phase 6 — SQL Operations Final Verification

After Phases 1–5, tick every box in `PROJECT_REPORT.md` Section 9. Use this mapping:

| SQL Operation | Where It's Demonstrated |
|---|---|
| CREATE DATABASE | `schema.sql` line 1 |
| DROP DATABASE | `schema.sql` line 1 |
| CREATE TABLE (x13) | `schema.sql` |
| PRIMARY KEY | `schema.sql` every table |
| FOREIGN KEY | `schema.sql` every table |
| UNIQUE KEY | `schema.sql` Users.email |
| INDEX | `schema.sql` |
| CREATE VIEW (x4) | `schema.sql` |
| SELECT | Every PHP file |
| SELECT DISTINCT | `admin_dashboard.php` |
| WHERE | Every PHP file |
| BETWEEN | `apply_internship.php`, `post_job.php` |
| IN / NOT IN | `skill_gap.php` |
| LIKE | `post_job.php` |
| IS NULL / IS NOT NULL | `submit_milestone.php`, `supervisor_match.php` |
| ORDER BY | `supervisor_match.php`, `student_dashboard.php` |
| LIMIT | `supervisor_match.php`, `post_job.php` |
| AS (aliases) | `supervisor_dashboard.php`, `student_dashboard.php` |
| INSERT INTO VALUES | `submit_milestone.php`, `apply_internship.php`, `post_job.php` |
| INSERT INTO SELECT | `schema.sql` seed or `admin_dashboard.php` |
| UPDATE SET WHERE | `submit_milestone.php` |
| DELETE FROM WHERE | `apply_internship.php` |
| INNER JOIN | `student_dashboard.php`, `supervisor_match.php` |
| LEFT JOIN | `student_dashboard.php`, `skill_gap.php` |
| RIGHT JOIN | `supervisor_dashboard.php` |
| CROSS JOIN | `supervisor_match.php` |
| SELF JOIN | `alumni_dashboard.php` |
| Multiple JOINs | `student_dashboard.php`, `admin_dashboard.php` |
| COUNT | `supervisor_dashboard.php` |
| SUM | `admin_dashboard.php` |
| AVG | `submit_milestone.php`, `supervisor_dashboard.php` |
| MIN / MAX | `supervisor_dashboard.php` |
| COUNT DISTINCT | `admin_dashboard.php` |
| GROUP BY | `supervisor_dashboard.php`, `admin_dashboard.php` |
| HAVING | `supervisor_dashboard.php` |
| GROUP BY Multiple | `admin_dashboard.php` |
| Subquery in WHERE | `student_dashboard.php`, `apply_internship.php` |
| Subquery in SELECT | `supervisor_match.php` |
| Subquery in FROM | `schema.sql` views |
| Correlated Subquery | `supervisor_match.php` |
| EXISTS | `submit_milestone.php`, `apply_internship.php` |
| NOT EXISTS | `supervisor_match.php` |
| UNION | `admin_dashboard.php` |
| UNION ALL | `student_dashboard.php`, `alumni_dashboard.php` |
| INTERSECT | `admin_dashboard.php` |
| MINUS | `admin_dashboard.php` |
| Views (SELECT from) | `supervisor_dashboard.php` (v_blind_applicants) |

---

## Execution Order Summary

```
1. Create database/schema.sql     ← MOST IMPORTANT — entire DB structure
2. Create database/seed.sql       ← Sample data for testing
3. Run schema.sql + seed.sql in phpMyAdmin / MySQL CLI
4. Rewrite backend/index.php      ← Fix broken file
5. Rewrite backend/get_student_dashboard.php  ← Fix broken file
6. Create backend/supervisor_match.php
7. Create backend/skill_gap.php
8. Create backend/submit_milestone.php
9. Create backend/apply_internship.php
10. Create backend/get_supervisor_dashboard.php
11. Create backend/get_admin_dashboard.php
12. Create backend/post_job.php
13. Create backend/get_alumni_dashboard.php
14. Connect frontend pages to real APIs (Phase 5 table)
15. Test every SQL operation using the Phase 6 checklist
```

---

## Files Created / Modified Summary

```
database/
  schema.sql          ← NEW — full DDL (all tables, keys, indexes, views)
  seed.sql            ← NEW — sample INSERT data

backend/
  index.php           ← REWRITE — fix DB name + table name
  get_student_dashboard.php  ← REWRITE — replace mock with real SQL
  supervisor_match.php       ← NEW
  skill_gap.php              ← NEW
  submit_milestone.php       ← NEW
  apply_internship.php       ← NEW
  get_supervisor_dashboard.php ← NEW
  get_admin_dashboard.php    ← NEW
  post_job.php               ← NEW
  get_alumni_dashboard.php   ← NEW
  login.php           ← NO CHANGE (already working)
  register.php        ← NO CHANGE (already working)
  landing.php         ← NO CHANGE (already working)

frontend/src/app/components/pages/
  student/Overview.tsx       ← Connect to API
  student/SupervisorMatch.tsx ← Connect to API
  student/SkillGap.tsx       ← Connect to API
  student/ThesisSubmission.tsx ← Connect to API
  student/Internships.tsx    ← Connect to API
  supervisor/Overview.tsx    ← Connect to API
  supervisor/BlindReview.tsx ← Connect to API
  admin/Overview.tsx         ← Connect to API
  company/JobPostingForm.tsx ← Connect to API
  alumni/Overview.tsx        ← Connect to API
```

---

## Important Notes

- **DB name is `DBMS_project`** (used in login.php and register.php — keep consistent everywhere)
- **Server path is `http://localhost/dbms/backend/`** (as used in LoginPage.tsx and RegisterPage.tsx)
- **MySQL does not support `INTERSECT` and `MINUS` natively** — simulate them: `INTERSECT` = `INNER JOIN` on same column; `MINUS` = `LEFT JOIN ... WHERE right.id IS NULL`
- **`register.php` only supports student and faculty roles** — for admin/company/alumni, either extend register.php or create separate seeded accounts in seed.sql
- **All DB credentials:** host=localhost, user=root, pass=(empty), db=DBMS_project
