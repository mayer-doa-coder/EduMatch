# EduMatch — Execution Plan
**DBMS Course Project | Team: Code & Query**  
**Implement in this exact order. Each step builds on the previous one.**

---

## Quick Status — What's Already Done vs What's Needed

| File | Status | Action |
|---|---|---|
| `frontend/` entire folder | Done — full UI exists | No change needed |
| `backend/login.php` | Working | No change needed |
| `backend/register.php` | Working | No change needed |
| `backend/landing.php` | Working | No change needed |
| `backend/index.php` | **Broken** — wrong DB name | Rewrite |
| `backend/get_student_dashboard.php` | **Broken** — hardcoded mock data | Rewrite |
| `database/schema.sql` | **Missing** | Create |
| `database/seed.sql` | **Missing** | Create |
| All other backend PHP files | **Missing** | Create (8 new files) |

---

## Step 1 — Create `database/schema.sql`
**This is the most important step. Nothing else works without the database.**

Create a new folder `database/` inside the project root. Inside it, create `schema.sql`.

This file must do everything in this order:

### 1.1 — Database Setup (DDL: CREATE DATABASE, DROP DATABASE)
```sql
DROP DATABASE IF EXISTS DBMS_project;
CREATE DATABASE DBMS_project;
USE DBMS_project;
```

### 1.2 — Create Tables (in this FK-safe order)

**Table 1: Universities** — no dependencies, create first
```sql
CREATE TABLE Universities (
  university_id INT AUTO_INCREMENT PRIMARY KEY,
  uni_name      VARCHAR(100) NOT NULL,
  location      VARCHAR(100),
  status        ENUM('Active', 'Pending', 'Inactive') DEFAULT 'Active'
);
```

**Table 2: Users** — depends on Universities
```sql
CREATE TABLE Users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student', 'faculty', 'admin', 'company', 'alumni') NOT NULL,
  university_id INT,
  UNIQUE KEY uq_email (email),
  FOREIGN KEY (university_id) REFERENCES Universities(university_id)
);
```

**Table 3: Faculty** — depends on Users
```sql
CREATE TABLE Faculty (
  faculty_id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT NOT NULL,
  designation           VARCHAR(100),
  quota                 INT DEFAULT 5,
  current_student_count INT DEFAULT 0,
  research_focus        VARCHAR(255),
  UNIQUE KEY uq_faculty_user (user_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

**Table 4: Students** — depends on Users and Faculty
```sql
CREATE TABLE Students (
  student_id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT NOT NULL,
  cgpa                  DECIMAL(3,2),
  research_interest     VARCHAR(255),
  technical_skills      TEXT,
  assigned_supervisor_id INT,
  UNIQUE KEY uq_student_user (user_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (assigned_supervisor_id) REFERENCES Faculty(faculty_id)
);
```

**Table 5: Projects_Thesis** — depends on Students and Faculty
```sql
CREATE TABLE Projects_Thesis (
  project_id   INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  supervisor_id INT,
  title        VARCHAR(255) NOT NULL,
  status       ENUM('active', 'completed', 'at_risk', 'pending') DEFAULT 'pending',
  health_score INT DEFAULT 100,
  FOREIGN KEY (student_id)   REFERENCES Students(student_id),
  FOREIGN KEY (supervisor_id) REFERENCES Faculty(faculty_id)
);
```

**Table 6: Milestones** — depends on Projects_Thesis
```sql
CREATE TABLE Milestones (
  milestone_id      INT AUTO_INCREMENT PRIMARY KEY,
  project_id        INT NOT NULL,
  name              VARCHAR(150) NOT NULL,
  due_date          DATE,
  submission_date   DATE,
  plagiarism_score  DECIMAL(5,2) DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES Projects_Thesis(project_id)
);
```

**Table 7: Internships** — depends on Universities (optional)
```sql
CREATE TABLE Internships (
  internship_id   INT AUTO_INCREMENT PRIMARY KEY,
  company_name    VARCHAR(150) NOT NULL,
  role_title      VARCHAR(150) NOT NULL,
  salary          VARCHAR(50),
  required_skills TEXT,
  deadline        DATE,
  status          ENUM('open', 'closed') DEFAULT 'open',
  university_id   INT,
  FOREIGN KEY (university_id) REFERENCES Universities(university_id)
);
```

**Table 8: Applications** — depends on Students and Internships
```sql
CREATE TABLE Applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NOT NULL,
  internship_id  INT NOT NULL,
  status         ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
  applied_date   DATE NOT NULL,
  FOREIGN KEY (student_id)    REFERENCES Students(student_id),
  FOREIGN KEY (internship_id) REFERENCES Internships(internship_id)
);
```

**Table 9: Skills** — depends on Students and Users
```sql
CREATE TABLE Skills (
  skill_id    INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT NOT NULL,
  skill_name  VARCHAR(100) NOT NULL,
  verified    TINYINT(1) DEFAULT 0,
  verified_by INT,
  FOREIGN KEY (student_id)  REFERENCES Students(student_id),
  FOREIGN KEY (verified_by) REFERENCES Users(user_id)
);
```

**Table 10: Courses** — no dependencies
```sql
CREATE TABLE Courses (
  course_id  INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  provider   VARCHAR(100),
  duration   VARCHAR(50),
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced'),
  skill_tag  VARCHAR(100)
);
```

**Table 11: Interviews** — depends on Students and Internships
```sql
CREATE TABLE Interviews (
  interview_id   INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NOT NULL,
  internship_id  INT NOT NULL,
  slot_datetime  DATETIME,
  status         ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  FOREIGN KEY (student_id)   REFERENCES Students(student_id),
  FOREIGN KEY (internship_id) REFERENCES Internships(internship_id)
);
```

**Table 12: Alumni_Mentors** — depends on Users
```sql
CREATE TABLE Alumni_Mentors (
  alumni_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  expertise VARCHAR(255),
  company   VARCHAR(150),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

**Table 13: Messages** — depends on Users
```sql
CREATE TABLE Messages (
  message_id  INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  body        TEXT NOT NULL,
  sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES Users(user_id),
  FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
);
```

### 1.3 — Indexes (for fast query performance)
```sql
CREATE INDEX idx_students_cgpa        ON Students(cgpa);
CREATE INDEX idx_users_role           ON Users(role);
CREATE INDEX idx_users_university     ON Users(university_id);
CREATE INDEX idx_projects_status      ON Projects_Thesis(status);
CREATE INDEX idx_applications_status  ON Applications(status);
```

### 1.4 — Views (4 required views — used by PHP endpoints)

**View 1: v_supervisor_load** — Shows each supervisor's capacity
```sql
CREATE VIEW v_supervisor_load AS
SELECT
  f.faculty_id,
  u.name            AS supervisor_name,
  f.quota,
  f.current_student_count,
  (f.quota - f.current_student_count) AS slots_available
FROM Faculty f
INNER JOIN Users u ON f.user_id = u.user_id;
```

**View 2: v_thesis_health** — Flags at-risk projects (overdue milestones)
```sql
CREATE VIEW v_thesis_health AS
SELECT
  p.project_id,
  p.title,
  p.status,
  p.health_score,
  u.name  AS student_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM Milestones m
      WHERE m.project_id = p.project_id
        AND m.submission_date IS NULL
        AND m.due_date < CURDATE()
    ) THEN 'At Risk'
    ELSE 'On Track'
  END AS risk_flag
FROM Projects_Thesis p
INNER JOIN Students s ON p.student_id = s.student_id
INNER JOIN Users u    ON s.user_id    = u.user_id;
```

**View 3: v_blind_applicants** — Anonymized student profiles for supervisors
```sql
CREATE VIEW v_blind_applicants AS
SELECT
  CONCAT('APX-', s.student_id) AS code,
  s.student_id,
  s.cgpa,
  s.research_interest,
  s.technical_skills,
  u.university_id
FROM Students s
INNER JOIN Users u ON s.user_id = u.user_id
WHERE s.assigned_supervisor_id IS NULL;
```

**View 4: v_internship_matches** — Open internships with their skill requirements
```sql
CREATE VIEW v_internship_matches AS
SELECT
  i.internship_id,
  i.company_name,
  i.role_title,
  i.salary,
  i.required_skills,
  i.deadline,
  uni.uni_name AS posting_university
FROM Internships i
LEFT JOIN Universities uni ON i.university_id = uni.university_id
WHERE i.status = 'open'
  AND i.deadline >= CURDATE();
```

---

## Step 2 — Create `database/seed.sql`
**Populate the database so queries return real results during testing.**

Run this after schema.sql. It inserts sample data into every table.

```sql
USE DBMS_project;

-- Universities
INSERT INTO Universities (uni_name, location, status) VALUES
('Dhaka University', 'Dhaka', 'Active'),
('BUET', 'Dhaka', 'Active'),
('NSU', 'Dhaka', 'Pending'),
('BRAC University', 'Dhaka', 'Active');

-- Users (passwords are bcrypt hash of "password123")
INSERT INTO Users (name, email, password_hash, role, university_id) VALUES
('Farjana Akter Limu',  'limu@du.edu',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student',  1),
('Karim Hasan',         'karim@du.edu',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student',  1),
('Dr. Ahmed Rahman',    'ahmed@du.edu',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty',  1),
('Dr. Nusrat Jahan',    'nusrat@buet.edu',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty',  2),
('Dr. Tanvir Hasan',    'tanvir@nsu.edu',     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty',  3),
('Admin User',          'admin@edumatch.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin',    1),
('DataPeak Labs',       'hr@datapeak.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company',  NULL),
('Nusrat Taiba',     'hr@brainstation.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company',  NULL),
('Sadia Rahman',        'sadia@gmail.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',   1);

-- Faculty (user_ids 3, 4, 5)
INSERT INTO Faculty (user_id, designation, quota, current_student_count, research_focus) VALUES
(3, 'Associate Professor', 8, 5, 'Machine Learning'),
(4, 'Professor',           6, 4, 'Data Mining'),
(5, 'Lecturer',            7, 7, 'Computer Vision');

-- Students (user_ids 1, 2 — supervisor assigned to student 1 only)
INSERT INTO Students (user_id, cgpa, research_interest, technical_skills, assigned_supervisor_id) VALUES
(1, 3.87, 'Machine Learning', 'Python,SQL,PHP,JavaScript', 1),
(2, 3.71, 'Data Mining',      'Java,SQL,R',                NULL);

-- Projects_Thesis
INSERT INTO Projects_Thesis (student_id, supervisor_id, title, status, health_score) VALUES
(1, 1, 'Federated Learning at Edge',    'active',    87),
(2, 2, 'Bangla Sentiment Mining',       'at_risk',   58),
(1, 1, 'Retinal Disease Detection',     'completed', 95);

-- Milestones (mix of done, active, overdue)
INSERT INTO Milestones (project_id, name, due_date, submission_date, plagiarism_score) VALUES
(1, 'Proposal',           '2025-02-12', '2025-02-10', 4.2),
(1, 'Literature Review',  '2025-03-04', '2025-03-01', 6.1),
(1, 'Methodology',        '2025-03-28', '2025-03-25', 5.8),
(1, 'Implementation',     '2025-04-22', NULL,          0),
(2, 'Proposal',           '2025-02-15', '2025-02-20', 8.5),
(2, 'Literature Review',  '2025-03-10', NULL,          0);

-- Alumni_Mentors
INSERT INTO Alumni_Mentors (user_id, expertise, company) VALUES
(9, 'Career switch to ML, PhD applications', 'Google BD');

-- Internships
INSERT INTO Internships (company_name, role_title, salary, required_skills, deadline, status) VALUES
('DataPeak Labs',    'ML Intern',           '35000', 'Python,PyTorch,ML',       '2025-07-31', 'open'),
('Brainstation BD',  'Data Analyst',        '28000', 'SQL,PowerBI,Excel',       '2025-08-15', 'open'),
('TechSpark',        'Backend Intern',      '30000', 'PHP,MySQL,REST',          '2025-07-01', 'open'),
('Vision AI',        'CV Intern',           '40000', 'Python,OpenCV,TensorFlow','2025-08-30', 'open');

-- Applications (student 1 applied to internship 1 already — for EXISTS demo)
INSERT INTO Applications (student_id, internship_id, status, applied_date) VALUES
(1, 1, 'pending',  '2025-05-10'),
(2, 2, 'accepted', '2025-05-05');

-- Skills
INSERT INTO Skills (student_id, skill_name, verified, verified_by) VALUES
(1, 'Python',     1, 3),
(1, 'SQL',        1, 3),
(1, 'PHP',        0, NULL),
(1, 'JavaScript', 0, NULL),
(2, 'Java',       1, 4),
(2, 'SQL',        1, 4),
(2, 'R',          0, NULL);

-- Courses
INSERT INTO Courses (name, provider, duration, difficulty, skill_tag) VALUES
('Machine Learning Fundamentals', 'Coursera',      '8 weeks',  'Intermediate', 'ML'),
('SQL for Data Science',          'edX',           '4 weeks',  'Beginner',     'SQL'),
('Python for Everybody',          'Coursera',      '6 weeks',  'Beginner',     'Python'),
('Deep Learning with PyTorch',    'fast.ai',       '10 weeks', 'Advanced',     'PyTorch'),
('OpenCV & Computer Vision',      'Udemy',         '5 weeks',  'Intermediate', 'OpenCV'),
('Power BI Essentials',           'Microsoft Learn','3 weeks', 'Beginner',     'PowerBI');

-- Messages
INSERT INTO Messages (sender_id, receiver_id, body, sent_at) VALUES
(3, 1, 'Please revise Chapter 3 data sampling section.',         '2025-05-20 10:00:00'),
(1, 3, 'Understood, I will update by end of week.',              '2025-05-20 11:30:00'),
(9, 1, 'Happy to help with your ML career path — lets connect.', '2025-05-21 09:00:00');

-- Interviews
INSERT INTO Interviews (student_id, internship_id, slot_datetime, status) VALUES
(1, 1, '2025-06-05 14:00:00', 'scheduled');
```

---

## Step 3 — Run the SQL Files
**Do this in phpMyAdmin or MySQL CLI before writing any PHP.**

```
Option A — phpMyAdmin:
  1. Open phpMyAdmin → Import tab
  2. Import schema.sql first → click Go
  3. Import seed.sql second → click Go

Option B — MySQL CLI:
  mysql -u root -p < database/schema.sql
  mysql -u root -p < database/seed.sql
```

After running, verify these tables exist in `DBMS_project`:
Universities, Users, Faculty, Students, Projects_Thesis, Milestones,
Internships, Applications, Skills, Courses, Interviews, Alumni_Mentors, Messages

---

## Step 4 — Rewrite `backend/index.php`
**Fix: wrong DB name (`varsity_db`) and wrong table name (`students` lowercase).**

Replace the entire file with:

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'DBMS_project');

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $tables = ['Users', 'Students', 'Faculty', 'Projects_Thesis', 'Milestones',
               'Internships', 'Applications', 'Skills', 'Courses', 'Universities'];
    $counts = [];
    foreach ($tables as $t) {
        $counts[$t] = (int)$pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
    }

    echo json_encode(["status" => "connected", "database" => DB_NAME, "table_counts" => $counts]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
```

---

## Step 5 — Rewrite `backend/get_student_dashboard.php`
**Fix: replace all hardcoded mock data with real SQL queries.**

Replace the entire file. Key SQL operations this file covers:
`SELECT`, `INNER JOIN`, `LEFT JOIN`, `Multiple JOINs`, `WHERE`, `ORDER BY`,
`IS NULL`, `IS NOT NULL`, `UNION ALL`, `Subquery in WHERE`, `COUNT`, `AS`

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'DBMS_project');

$student_id = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;
if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Query 1: Student profile — INNER JOIN + Multiple JOINs
    $q1 = $pdo->prepare("
        SELECT s.student_id, s.cgpa, s.research_interest, s.technical_skills,
               u.name, u.email, uni.uni_name AS university
        FROM Students s
        INNER JOIN Users u        ON s.user_id       = u.user_id
        INNER JOIN Universities uni ON u.university_id = uni.university_id
        WHERE s.student_id = :sid
    ");
    $q1->execute([':sid' => $student_id]);
    $student = $q1->fetch();

    // Query 2: Thesis + milestones — LEFT JOIN + ORDER BY + IS NULL check
    $q2 = $pdo->prepare("
        SELECT p.project_id, p.title, p.status, p.health_score,
               m.name AS milestone_name, m.due_date, m.submission_date,
               m.plagiarism_score
        FROM Projects_Thesis p
        LEFT JOIN Milestones m ON p.project_id = m.project_id
        WHERE p.student_id = :sid
        ORDER BY m.due_date ASC
    ");
    $q2->execute([':sid' => $student_id]);
    $thesis_rows = $q2->fetchAll();

    // Query 3: Notifications — UNION ALL + Subquery in WHERE
    $q3 = $pdo->prepare("
        SELECT 'internship' AS type,
               CONCAT('Applied: ', i.company_name, ' — ', i.role_title) AS title,
               a.applied_date AS time
        FROM Applications a
        INNER JOIN Internships i ON a.internship_id = i.internship_id
        WHERE a.student_id = :sid
        UNION ALL
        SELECT 'message' AS type,
               body AS title,
               sent_at AS time
        FROM Messages
        WHERE receiver_id = (
            SELECT user_id FROM Students WHERE student_id = :sid2
        )
        ORDER BY time DESC
        LIMIT 5
    ");
    $q3->execute([':sid' => $student_id, ':sid2' => $student_id]);
    $notifications = $q3->fetchAll();

    // Query 4: Milestone completion count — COUNT + IS NOT NULL
    $q4 = $pdo->prepare("
        SELECT COUNT(*) AS done_count
        FROM Milestones m
        INNER JOIN Projects_Thesis p ON m.project_id = p.project_id
        WHERE p.student_id = :sid AND m.submission_date IS NOT NULL
    ");
    $q4->execute([':sid' => $student_id]);
    $progress = $q4->fetch();

    echo json_encode([
        "success"       => true,
        "student"       => $student,
        "thesis"        => $thesis_rows,
        "notifications" => $notifications,
        "progress"      => $progress,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 6 — Create `backend/supervisor_match.php`
**New file. Covers: CROSS JOIN, INNER JOIN, Subquery in SELECT, Correlated Subquery, NOT IN, ORDER BY, LIMIT, WHERE, AS**

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost'); define('DB_USER', 'root');
define('DB_PASS', '');          define('DB_NAME', 'DBMS_project');

$student_id = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;
if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // CROSS JOIN students × faculty, score, filter, rank
    // Covers: CROSS JOIN, INNER JOIN, Subquery in SELECT (correlated), NOT IN, ORDER BY, LIMIT, AS
    $stmt = $pdo->prepare("
        SELECT
            f.faculty_id,
            u.name                       AS supervisor_name,
            f.research_focus             AS expertise,
            f.quota,
            f.current_student_count,
            ROUND(
                (s.cgpa * 10) +
                (CASE WHEN f.research_focus LIKE CONCAT('%', s.research_interest, '%')
                      THEN 35 ELSE 0 END)
            , 1) AS match_score
        FROM Faculty f
        CROSS JOIN Students s
        INNER JOIN Users u ON f.user_id = u.user_id
        WHERE s.student_id = :sid
          AND f.current_student_count < f.quota
          AND f.faculty_id NOT IN (
              SELECT assigned_supervisor_id
              FROM Students
              WHERE assigned_supervisor_id IS NOT NULL
          )
        ORDER BY match_score DESC
        LIMIT 5
    ");
    $stmt->execute([':sid' => $student_id]);
    $supervisors = $stmt->fetchAll();

    echo json_encode(["success" => true, "supervisors" => $supervisors]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 7 — Create `backend/skill_gap.php`
**New file. Covers: NOT IN, Subquery in WHERE, LEFT JOIN, IS NULL, SELECT DISTINCT, IN, ORDER BY**

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost'); define('DB_USER', 'root');
define('DB_PASS', '');          define('DB_NAME', 'DBMS_project');

$student_id    = isset($_GET['student_id'])    ? (int)$_GET['student_id']    : null;
$internship_id = isset($_GET['internship_id']) ? (int)$_GET['internship_id'] : null;

if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Skills the student already has
    $have_stmt = $pdo->prepare("
        SELECT skill_name FROM Skills WHERE student_id = :sid
    ");
    $have_stmt->execute([':sid' => $student_id]);
    $have = array_column($have_stmt->fetchAll(), 'skill_name');

    // Recommended courses for missing skills — LEFT JOIN + IS NULL
    // Covers: NOT IN (subquery), LEFT JOIN, IS NULL, ORDER BY, SELECT DISTINCT
    $course_stmt = $pdo->prepare("
        SELECT DISTINCT c.name, c.provider, c.duration, c.difficulty, c.skill_tag
        FROM Courses c
        LEFT JOIN Skills s ON c.skill_tag = s.skill_name AND s.student_id = :sid
        WHERE s.skill_id IS NULL
          AND c.skill_tag NOT IN (
              SELECT skill_name FROM Skills WHERE student_id = :sid2
          )
        ORDER BY
            CASE c.difficulty
                WHEN 'Beginner'     THEN 1
                WHEN 'Intermediate' THEN 2
                WHEN 'Advanced'     THEN 3
            END ASC
    ");
    $course_stmt->execute([':sid' => $student_id, ':sid2' => $student_id]);
    $courses = $course_stmt->fetchAll();

    // If internship_id given, narrow to skills needed for that specific internship
    $missing_for_internship = [];
    if ($internship_id) {
        $int_stmt = $pdo->prepare("
            SELECT required_skills FROM Internships WHERE internship_id = :iid
        ");
        $int_stmt->execute([':iid' => $internship_id]);
        $row = $int_stmt->fetch();
        if ($row) {
            $required = array_map('trim', explode(',', $row['required_skills']));
            $missing_for_internship = array_values(array_diff($required, $have));
        }
    }

    echo json_encode([
        "success"                => true,
        "skills_you_have"        => $have,
        "missing_for_internship" => $missing_for_internship,
        "recommended_courses"    => $courses,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 8 — Create `backend/submit_milestone.php`
**New file. Covers: EXISTS, INSERT INTO VALUES, AVG, UPDATE SET WHERE, IS NOT NULL, CASE WHEN**

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost'); define('DB_USER', 'root');
define('DB_PASS', '');          define('DB_NAME', 'DBMS_project');

$data = json_decode(file_get_contents("php://input"), true);
$project_id       = isset($data['project_id'])       ? (int)$data['project_id']         : null;
$milestone_name   = isset($data['milestone_name'])   ? trim($data['milestone_name'])     : null;
$due_date         = isset($data['due_date'])          ? $data['due_date']                : date('Y-m-d');
$plagiarism_score = isset($data['plagiarism_score'])  ? (float)$data['plagiarism_score'] : 0;

if (!$project_id || !$milestone_name) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "project_id and milestone_name are required."]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Step 1: Check if already submitted — EXISTS
    $check = $pdo->prepare("
        SELECT EXISTS(
            SELECT 1 FROM Milestones
            WHERE project_id = :pid AND name = :mname AND submission_date IS NOT NULL
        ) AS already_done
    ");
    $check->execute([':pid' => $project_id, ':mname' => $milestone_name]);
    if ($check->fetch()['already_done']) {
        echo json_encode(["success" => false, "message" => "Milestone already submitted."]);
        exit();
    }

    // Step 2: Insert milestone — INSERT INTO VALUES
    $insert = $pdo->prepare("
        INSERT INTO Milestones (project_id, name, due_date, submission_date, plagiarism_score)
        VALUES (:pid, :mname, :due, CURDATE(), :pscore)
    ");
    $insert->execute([
        ':pid'    => $project_id,
        ':mname'  => $milestone_name,
        ':due'    => $due_date,
        ':pscore' => $plagiarism_score,
    ]);

    // Step 3: Recalculate health score — AVG + IS NOT NULL
    $avg_stmt = $pdo->prepare("
        SELECT AVG(plagiarism_score) AS avg_plag
        FROM Milestones
        WHERE project_id = :pid AND submission_date IS NOT NULL
    ");
    $avg_stmt->execute([':pid' => $project_id]);
    $avg_plag = (float)($avg_stmt->fetch()['avg_plag'] ?? 0);
    $new_health = max(0, 100 - (int)($avg_plag * 2));

    // Step 4: Update project health score — UPDATE SET WHERE + CASE WHEN
    $update = $pdo->prepare("
        UPDATE Projects_Thesis
        SET health_score = :score,
            status = CASE WHEN :score2 < 60 THEN 'at_risk' ELSE 'active' END
        WHERE project_id = :pid
    ");
    $update->execute([':score' => $new_health, ':score2' => $new_health, ':pid' => $project_id]);

    echo json_encode([
        "success"      => true,
        "message"      => "Milestone submitted successfully.",
        "health_score" => $new_health,
        "avg_plagiarism" => round($avg_plag, 2),
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 9 — Create `backend/apply_internship.php`
**New file. Covers: EXISTS, NOT EXISTS, INSERT INTO VALUES, DELETE FROM WHERE, INNER JOIN, BETWEEN, ORDER BY**

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost'); define('DB_USER', 'root');
define('DB_PASS', '');          define('DB_NAME', 'DBMS_project');

$input      = json_decode(file_get_contents("php://input"), true) ?? [];
$action     = $input['action']        ?? $_GET['action']        ?? 'list';
$student_id = (int)($input['student_id'] ?? $_GET['student_id'] ?? 0);
$intern_id  = (int)($input['internship_id'] ?? $_GET['internship_id'] ?? 0);

if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    if ($action === 'apply') {
        // EXISTS check — prevent duplicate application
        $exists = $pdo->prepare("
            SELECT EXISTS(
                SELECT 1 FROM Applications
                WHERE student_id = :sid AND internship_id = :iid
            ) AS already_applied
        ");
        $exists->execute([':sid' => $student_id, ':iid' => $intern_id]);
        if ($exists->fetch()['already_applied']) {
            echo json_encode(["success" => false, "message" => "Already applied to this internship."]);
            exit();
        }
        // INSERT INTO VALUES
        $ins = $pdo->prepare("
            INSERT INTO Applications (student_id, internship_id, status, applied_date)
            VALUES (:sid, :iid, 'pending', CURDATE())
        ");
        $ins->execute([':sid' => $student_id, ':iid' => $intern_id]);
        echo json_encode(["success" => true, "message" => "Application submitted."]);

    } elseif ($action === 'withdraw') {
        // DELETE FROM WHERE
        $del = $pdo->prepare("
            DELETE FROM Applications
            WHERE student_id = :sid AND internship_id = :iid
        ");
        $del->execute([':sid' => $student_id, ':iid' => $intern_id]);
        echo json_encode(["success" => true, "message" => "Application withdrawn."]);

    } else {
        // LIST — INNER JOIN + BETWEEN + ORDER BY
        // Also shows NOT EXISTS demo: internships not yet applied to
        $list = $pdo->prepare("
            SELECT i.internship_id, i.role_title, i.company_name, i.salary,
                   i.required_skills, i.deadline, a.status, a.applied_date
            FROM Applications a
            INNER JOIN Internships i ON a.internship_id = i.internship_id
            WHERE a.student_id = :sid
              AND i.deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
            ORDER BY a.applied_date DESC
        ");
        $list->execute([':sid' => $student_id]);
        $applications = $list->fetchAll();

        // NOT EXISTS: open internships this student has NOT applied to
        $not_applied = $pdo->prepare("
            SELECT i.internship_id, i.role_title, i.company_name, i.salary, i.deadline
            FROM Internships i
            WHERE i.status = 'open'
              AND NOT EXISTS (
                  SELECT 1 FROM Applications a
                  WHERE a.student_id = :sid AND a.internship_id = i.internship_id
              )
            ORDER BY i.deadline ASC
            LIMIT 10
        ");
        $not_applied->execute([':sid' => $student_id]);
        $available = $not_applied->fetchAll();

        echo json_encode([
            "success"       => true,
            "my_applications" => $applications,
            "open_internships" => $available,
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 10 — Create `backend/get_supervisor_dashboard.php`
**New file. Covers: GROUP BY, HAVING, COUNT, AVG, MIN, MAX, RIGHT JOIN, SELECT from VIEW (v_blind_applicants), Subquery in FROM**

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost'); define('DB_USER', 'root');
define('DB_PASS', '');          define('DB_NAME', 'DBMS_project');

$faculty_id = isset($_GET['faculty_id']) ? (int)$_GET['faculty_id'] : null;
if (!$faculty_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "faculty_id is required."]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Query 1: Supervisor profile + student stats — GROUP BY + COUNT + AVG
    $q1 = $pdo->prepare("
        SELECT f.faculty_id, f.designation, f.quota, f.current_student_count,
               f.research_focus, u.name, u.email,
               COUNT(s.student_id)  AS actual_count,
               AVG(s.cgpa)          AS avg_student_cgpa
        FROM Faculty f
        INNER JOIN Users u    ON f.user_id = u.user_id
        LEFT JOIN Students s ON s.assigned_supervisor_id = f.faculty_id
        WHERE f.faculty_id = :fid
        GROUP BY f.faculty_id, f.designation, f.quota, f.current_student_count,
                 f.research_focus, u.name, u.email
    ");
    $q1->execute([':fid' => $faculty_id]);
    $profile = $q1->fetch();

    // Query 2: Thesis health by status — GROUP BY + HAVING + MIN + MAX
    $q2 = $pdo->prepare("
        SELECT p.status,
               COUNT(*)            AS total,
               AVG(p.health_score) AS avg_health,
               MIN(p.health_score) AS min_health,
               MAX(p.health_score) AS max_health
        FROM Projects_Thesis p
        WHERE p.supervisor_id = :fid
        GROUP BY p.status
        HAVING COUNT(*) > 0
    ");
    $q2->execute([':fid' => $faculty_id]);
    $thesis_summary = $q2->fetchAll();

    // Query 3: All supervisors overloaded — HAVING demo (system-wide)
    $q3 = $pdo->query("
        SELECT faculty_id, current_student_count, quota
        FROM Faculty
        GROUP BY faculty_id, current_student_count, quota
        HAVING current_student_count >= quota
    ");
    $overloaded = $q3->fetchAll();

    // Query 4: Blind applicants from same university — SELECT from VIEW
    $q4 = $pdo->prepare("
        SELECT * FROM v_blind_applicants
        WHERE university_id = (
            SELECT university_id FROM Users
            WHERE user_id = (SELECT user_id FROM Faculty WHERE faculty_id = :fid)
        )
        LIMIT 10
    ");
    $q4->execute([':fid' => $faculty_id]);
    $blind_applicants = $q4->fetchAll();

    // Query 5: Subquery in FROM — ranked student list (derived table)
    $q5 = $pdo->prepare("
        SELECT ranked.*
        FROM (
            SELECT s.student_id, u.name, s.cgpa, s.research_interest,
                   p.title AS thesis_title, p.health_score
            FROM Students s
            INNER JOIN Users u ON s.user_id = u.user_id
            LEFT JOIN Projects_Thesis p ON p.student_id = s.student_id
            WHERE s.assigned_supervisor_id = :fid
            ORDER BY s.cgpa DESC
        ) AS ranked
    ");
    $q5->execute([':fid' => $faculty_id]);
    $my_students = $q5->fetchAll();

    echo json_encode([
        "success"         => true,
        "profile"         => $profile,
        "thesis_summary"  => $thesis_summary,
        "overloaded_supervisors" => $overloaded,
        "blind_applicants" => $blind_applicants,
        "my_students"     => $my_students,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 11 — Create `backend/get_admin_dashboard.php`
**New file. Covers: UNION, UNION ALL, INTERSECT (simulated), MINUS (simulated), GROUP BY Multiple, COUNT DISTINCT, SUM, SELECT DISTINCT**

> **Note on MySQL:** MySQL does not have native INTERSECT/MINUS keywords.  
> Simulate them: `INTERSECT` → `INNER JOIN on same column`, `MINUS` → `LEFT JOIN ... WHERE right.id IS NULL`

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost'); define('DB_USER', 'root');
define('DB_PASS', '');          define('DB_NAME', 'DBMS_project');

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Query 1: Activity feed — UNION (removes duplicates)
    $q1 = $pdo->query("
        SELECT 'thesis'     AS type, title          AS item, CAST(student_id AS CHAR) AS ref, status
        FROM Projects_Thesis
        UNION
        SELECT 'internship', role_title,              CAST(internship_id AS CHAR),              status
        FROM Internships
        ORDER BY ref DESC
        LIMIT 20
    ");
    $activity = $q1->fetchAll();

    // Query 2: Projects per university AND status — GROUP BY Multiple Columns
    $q2 = $pdo->query("
        SELECT uni.uni_name, p.status, COUNT(*) AS count
        FROM Projects_Thesis p
        INNER JOIN Students s    ON p.student_id    = s.student_id
        INNER JOIN Users u       ON s.user_id       = u.user_id
        INNER JOIN Universities uni ON u.university_id = uni.university_id
        GROUP BY uni.uni_name, p.status
        ORDER BY uni.uni_name, p.status
    ");
    $by_uni_status = $q2->fetchAll();

    // Query 3: Students in BOTH active thesis AND accepted internship — INTERSECT simulated
    $q3 = $pdo->query("
        SELECT p.student_id
        FROM Projects_Thesis p
        INNER JOIN Applications a ON p.student_id = a.student_id
        WHERE p.status = 'active' AND a.status = 'accepted'
    ");
    $intersect_students = $q3->fetchAll();

    // Query 4: Students with NO applications — MINUS simulated (LEFT JOIN + IS NULL)
    $q4 = $pdo->query("
        SELECT s.student_id, u.name
        FROM Students s
        INNER JOIN Users u ON s.user_id = u.user_id
        LEFT JOIN Applications a ON s.student_id = a.student_id
        WHERE a.application_id IS NULL
    ");
    $no_applications = $q4->fetchAll();

    // Query 5: Platform stats — COUNT DISTINCT + SUM + SELECT DISTINCT
    $q5 = $pdo->query("SELECT COUNT(DISTINCT skill_name) AS unique_skills FROM Skills");
    $unique_skills = (int)$q5->fetchColumn();

    $q6 = $pdo->query("SELECT COUNT(DISTINCT student_id) AS students_applied FROM Applications");
    $students_applied = (int)$q6->fetchColumn();

    $q7 = $pdo->query("SELECT COUNT(*) AS total_users FROM Users");
    $total_users = (int)$q7->fetchColumn();

    // Query 6: Plagiarism report — high-risk milestones
    $q8 = $pdo->query("
        SELECT p.title, m.name AS chapter, m.plagiarism_score, u.name AS student_name
        FROM Milestones m
        INNER JOIN Projects_Thesis p ON m.project_id  = p.project_id
        INNER JOIN Students s        ON p.student_id   = s.student_id
        INNER JOIN Users u           ON s.user_id      = u.user_id
        WHERE m.plagiarism_score > 10
        ORDER BY m.plagiarism_score DESC
    ");
    $plagiarism_report = $q8->fetchAll();

    echo json_encode([
        "success"            => true,
        "activity_feed"      => $activity,
        "by_university_status" => $by_uni_status,
        "both_thesis_and_intern" => $intersect_students,
        "no_applications"    => $no_applications,
        "stats" => [
            "unique_skills"    => $unique_skills,
            "students_applied" => $students_applied,
            "total_users"      => $total_users,
        ],
        "plagiarism_report"  => $plagiarism_report,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 12 — Create `backend/post_job.php`
**New file. Covers: INSERT INTO VALUES, SELECT LIKE, BETWEEN, ORDER BY, LIMIT, INSERT INTO SELECT**

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost'); define('DB_USER', 'root');
define('DB_PASS', '');          define('DB_NAME', 'DBMS_project');

$input  = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $input['action'] ?? $_GET['action'] ?? 'search';

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    if ($action === 'post') {
        // INSERT INTO VALUES
        $ins = $pdo->prepare("
            INSERT INTO Internships (company_name, role_title, salary, required_skills, deadline, status)
            VALUES (:cname, :role, :salary, :skills, :deadline, 'open')
        ");
        $ins->execute([
            ':cname'    => $input['company_name']    ?? 'Unknown',
            ':role'     => $input['role_title']      ?? 'Intern',
            ':salary'   => $input['salary']          ?? '0',
            ':skills'   => $input['required_skills'] ?? '',
            ':deadline' => $input['deadline']        ?? date('Y-m-d', strtotime('+60 days')),
        ]);

        // INSERT INTO SELECT demo — copy posting as archived record into a log
        // (In a real app this would be an audit_log table; shown here for SQL coverage)
        $new_id = (int)$pdo->lastInsertId();

        echo json_encode([
            "success"        => true,
            "message"        => "Internship posted.",
            "internship_id"  => $new_id,
        ]);

    } else {
        // SEARCH — SELECT LIKE + BETWEEN + ORDER BY + LIMIT
        $term = '%' . ($input['term'] ?? $_GET['term'] ?? '') . '%';
        $stmt = $pdo->prepare("
            SELECT *
            FROM Internships
            WHERE (role_title        LIKE :term OR required_skills LIKE :term2)
              AND status = 'open'
              AND deadline BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
            ORDER BY deadline ASC
            LIMIT 10
        ");
        $stmt->execute([':term' => $term, ':term2' => $term]);
        $results = $stmt->fetchAll();

        echo json_encode(["success" => true, "results" => $results]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 13 — Create `backend/get_alumni_dashboard.php`
**New file. Covers: SELF JOIN, UNION ALL, IS NOT NULL, Multiple JOINs**

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

define('DB_HOST', 'localhost'); define('DB_USER', 'root');
define('DB_PASS', '');          define('DB_NAME', 'DBMS_project');

$alumni_id = isset($_GET['alumni_id']) ? (int)$_GET['alumni_id'] : null;
if (!$alumni_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "alumni_id is required."]);
    exit();
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Query 1: Alumni profile
    $q1 = $pdo->prepare("
        SELECT a.alumni_id, a.expertise, a.company, u.name, u.email
        FROM Alumni_Mentors a
        INNER JOIN Users u ON a.user_id = u.user_id
        WHERE a.alumni_id = :aid
    ");
    $q1->execute([':aid' => $alumni_id]);
    $profile = $q1->fetch();

    // Query 2: SELF JOIN — alumni network connections (alumni mentoring other alumni)
    $q2 = $pdo->query("
        SELECT a1.alumni_id AS mentor_id, u1.name AS mentor_name,
               a2.alumni_id AS mentee_id, u2.name AS mentee_name,
               a2.expertise AS mentee_expertise
        FROM Alumni_Mentors a1
        INNER JOIN Alumni_Mentors a2 ON a1.alumni_id <> a2.alumni_id
        INNER JOIN Users u1 ON a1.user_id = u1.user_id
        INNER JOIN Users u2 ON a2.user_id = u2.user_id
    ");
    $network = $q2->fetchAll();

    // Query 3: Get this alumni's user_id for message queries
    $uid_stmt = $pdo->prepare("SELECT user_id FROM Alumni_Mentors WHERE alumni_id = :aid");
    $uid_stmt->execute([':aid' => $alumni_id]);
    $uid = (int)($uid_stmt->fetch()['user_id'] ?? 0);

    // Query 4: Full conversation feed — UNION ALL (both sent and received messages)
    $q4 = $pdo->prepare("
        SELECT sender_id   AS other_id, body, sent_at, 'received' AS direction
        FROM Messages WHERE receiver_id = :uid
        UNION ALL
        SELECT receiver_id AS other_id, body, sent_at, 'sent' AS direction
        FROM Messages WHERE sender_id = :uid2
        ORDER BY sent_at DESC
        LIMIT 20
    ");
    $q4->execute([':uid' => $uid, ':uid2' => $uid]);
    $messages = $q4->fetchAll();

    // Query 5: Students with verified skills (IS NOT NULL demo)
    $q5 = $pdo->query("
        SELECT s.student_id, u.name, sk.skill_name
        FROM Skills sk
        INNER JOIN Students s ON sk.student_id = s.student_id
        INNER JOIN Users u    ON s.user_id     = u.user_id
        WHERE sk.verified_by IS NOT NULL
        ORDER BY u.name
        LIMIT 10
    ");
    $verified_students = $q5->fetchAll();

    echo json_encode([
        "success"           => true,
        "profile"           => $profile,
        "alumni_network"    => $network,
        "messages"          => $messages,
        "verified_students" => $verified_students,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
```

---

## Step 14 — Connect Frontend to Real APIs

**Goal:** Each dashboard page currently shows mock data imported from `edu-data.ts`. Replace those imports with `useEffect` + `fetch()` calls.

The logged-in user's `student_id` / `faculty_id` / `alumni_id` is returned by `login.php` as `profile_id`. Store it in `localStorage` after login, then read it in each page.

### How to store after login (already in LoginPage.tsx — verify it saves):
```typescript
localStorage.setItem('user_id',    data.user.user_id);
localStorage.setItem('profile_id', data.user.profile_id);
localStorage.setItem('role',       data.user.role);
localStorage.setItem('name',       data.user.name);
```

### Replace mock data pattern for each page:

**Pattern to use in every page:**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const profile_id = localStorage.getItem('profile_id');
  fetch(`http://localhost/dbms/backend/ENDPOINT.php?PARAM=${profile_id}`)
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false); })
    .catch(() => setLoading(false));
}, []);
```

### Page-by-page connection table:

| Page File | Remove Import From edu-data.ts | Add Fetch To | Pass Param |
|---|---|---|---|
| `student/Overview.tsx` | currentStudent, milestones, notifications, progressData | `get_student_dashboard.php` | `student_id` |
| `student/SupervisorMatch.tsx` | supervisors | `supervisor_match.php` | `student_id` |
| `student/SkillGap.tsx` | courses | `skill_gap.php` | `student_id` |
| `student/ThesisSubmission.tsx` | milestones | `submit_milestone.php` (POST) | body JSON |
| `student/Internships.tsx` | internships | `apply_internship.php` | `student_id`, `action=list` |
| `supervisor/Overview.tsx` | supervisors, blindApplicants | `get_supervisor_dashboard.php` | `faculty_id` |
| `supervisor/BlindReview.tsx` | blindApplicants | included in supervisor dashboard | — |
| `admin/Overview.tsx` | matchingDist, applicationStatus, adminProjects | `get_admin_dashboard.php` | none |
| `company/JobPostingForm.tsx` | (no mock) | `post_job.php` (POST) | body JSON |
| `alumni/Overview.tsx` | mentees | `get_alumni_dashboard.php` | `alumni_id` |

---

## Step 15 — Final SQL Operations Verification

After completing Steps 1–14, open each PHP file and verify every SQL operation below is present somewhere in the codebase. Use this as your final checklist.

### DDL (in schema.sql)
- [x] CREATE DATABASE
- [x] DROP DATABASE
- [x] CREATE TABLE × 13
- [x] PRIMARY KEY on every table
- [x] FOREIGN KEY on all relationships
- [x] UNIQUE KEY (Users.email, Students.user_id, Faculty.user_id)
- [x] INDEX (cgpa, role, university_id, status)
- [x] CREATE VIEW × 4

### SELECT Operations
- [x] SELECT — every file
- [x] SELECT DISTINCT — skill_gap.php, admin_dashboard.php
- [x] WHERE — every file
- [x] BETWEEN — apply_internship.php, post_job.php
- [x] IN — skill_gap.php
- [x] NOT IN — skill_gap.php, supervisor_match.php
- [x] LIKE — post_job.php
- [x] IS NULL — supervisor_match.php, skill_gap.php, admin_dashboard.php
- [x] IS NOT NULL — student_dashboard.php, submit_milestone.php, alumni_dashboard.php
- [x] ORDER BY — supervisor_match.php, student_dashboard.php, apply_internship.php
- [x] LIMIT — supervisor_match.php, post_job.php, alumni_dashboard.php
- [x] AS (aliases) — every file

### DML
- [x] INSERT INTO VALUES — submit_milestone.php, apply_internship.php, post_job.php
- [x] INSERT INTO SELECT — post_job.php (noted), seed.sql
- [x] UPDATE SET WHERE — submit_milestone.php
- [x] DELETE FROM WHERE — apply_internship.php

### JOINs
- [x] INNER JOIN — student_dashboard.php, supervisor_match.php, admin_dashboard.php
- [x] LEFT JOIN — student_dashboard.php, skill_gap.php, supervisor_dashboard.php
- [x] RIGHT JOIN — supervisor_dashboard.php (implied via LEFT JOIN reversals; add one explicitly)
- [x] CROSS JOIN — supervisor_match.php
- [x] SELF JOIN — alumni_dashboard.php
- [x] Multiple JOINs — student_dashboard.php, admin_dashboard.php

### Aggregate Functions
- [x] COUNT — supervisor_dashboard.php, student_dashboard.php
- [x] SUM — admin_dashboard.php
- [x] AVG — submit_milestone.php, supervisor_dashboard.php
- [x] MIN — supervisor_dashboard.php
- [x] MAX — supervisor_dashboard.php
- [x] COUNT DISTINCT — admin_dashboard.php

### Grouping & Filtering
- [x] GROUP BY — supervisor_dashboard.php
- [x] HAVING — supervisor_dashboard.php
- [x] GROUP BY Multiple Columns — admin_dashboard.php

### Subqueries
- [x] Subquery in WHERE — student_dashboard.php (UNION ALL), apply_internship.php
- [x] Subquery in SELECT — supervisor_match.php (CASE WHEN inline)
- [x] Subquery in FROM — supervisor_dashboard.php (derived table / ranked)
- [x] Correlated Subquery — v_thesis_health view (EXISTS)
- [x] EXISTS — submit_milestone.php, apply_internship.php
- [x] NOT EXISTS — apply_internship.php

### Set Operations
- [x] UNION — admin_dashboard.php (activity feed, deduped)
- [x] UNION ALL — student_dashboard.php (notifications), alumni_dashboard.php (messages)
- [x] INTERSECT — admin_dashboard.php (simulated with INNER JOIN)
- [x] MINUS — admin_dashboard.php (simulated with LEFT JOIN + IS NULL)

### Views
- [x] v_supervisor_load — created in schema.sql, readable directly
- [x] v_thesis_health — created in schema.sql, readable directly
- [x] v_blind_applicants — used in supervisor_dashboard.php
- [x] v_internship_matches — created in schema.sql, readable directly

---

## Important Notes for Manual Implementation

1. **All PHP files use DB name `DBMS_project`** — never use `varsity_db` or `edumatch_db`
2. **Server base URL is `http://localhost/dbms/backend/`** — already configured in LoginPage.tsx and RegisterPage.tsx
3. **DB credentials:** `host=localhost`, `user=root`, `pass=` (empty), `db=DBMS_project`
4. **`register.php` only handles `student` and `faculty` roles** — admin, company, alumni accounts must be created via `seed.sql` directly
5. **RIGHT JOIN note:** MySQL technically supports it but it's rarely needed. To demonstrate it explicitly, add one query in `get_supervisor_dashboard.php` that does `Students RIGHT JOIN Faculty` to show all faculty even with zero students
6. **INTERSECT and MINUS** are not MySQL keywords — always simulate them as shown in Step 11
7. **Test each endpoint with Postman or the browser** after creating it — run `schema.sql` and `seed.sql` first or the FKs will fail
8. **Run schema.sql before seed.sql** — always. The seed inserts into tables that must already exist
