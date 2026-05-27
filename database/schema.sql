-- ============================================================
-- EduMatch — DBMS_project
-- database/schema.sql
-- ============================================================

DROP DATABASE IF EXISTS DBMS_project;
CREATE DATABASE DBMS_project
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE DBMS_project;

-- ============================================================
-- TABLES (FK-safe creation order)
-- ============================================================

-- Table 1: Universities — no dependencies
CREATE TABLE Universities (
  university_id INT AUTO_INCREMENT PRIMARY KEY,
  uni_name      VARCHAR(100) NOT NULL,
  location      VARCHAR(100),
  status        ENUM('Active', 'Pending', 'Inactive') DEFAULT 'Active'
) ENGINE=InnoDB;

-- Table 2: Users — depends on Universities
CREATE TABLE Users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student', 'faculty', 'admin', 'company', 'alumni') NOT NULL,
  university_id INT,
  UNIQUE KEY uq_email (email),
  FOREIGN KEY (university_id) REFERENCES Universities(university_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 3: Faculty — depends on Users
CREATE TABLE Faculty (
  faculty_id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT NOT NULL,
  designation           VARCHAR(100),
  quota                 INT DEFAULT 5,
  current_student_count INT DEFAULT 0,
  research_focus        VARCHAR(255),
  UNIQUE KEY uq_faculty_user (user_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 4: Students — depends on Users and Faculty
CREATE TABLE Students (
  student_id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id                INT NOT NULL,
  cgpa                   DECIMAL(3,2),
  research_interest      VARCHAR(255),
  technical_skills       TEXT,
  assigned_supervisor_id INT,
  UNIQUE KEY uq_student_user (user_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (assigned_supervisor_id) REFERENCES Faculty(faculty_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 5: Projects_Thesis — depends on Students and Faculty
CREATE TABLE Projects_Thesis (
  project_id    INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT NOT NULL,
  supervisor_id INT,
  title         VARCHAR(255) NOT NULL,
  status        ENUM('active', 'completed', 'at_risk', 'pending') DEFAULT 'pending',
  health_score  INT DEFAULT 100,
  FOREIGN KEY (student_id)    REFERENCES Students(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES Faculty(faculty_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 6: Milestones — depends on Projects_Thesis
CREATE TABLE Milestones (
  milestone_id     INT AUTO_INCREMENT PRIMARY KEY,
  project_id       INT NOT NULL,
  name             VARCHAR(150) NOT NULL,
  due_date         DATE,
  submission_date  DATE,
  plagiarism_score DECIMAL(5,2) DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES Projects_Thesis(project_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 7: Internships — depends on Universities (optional)
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
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 8: Applications — depends on Students and Internships
CREATE TABLE Applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NOT NULL,
  internship_id  INT NOT NULL,
  status         ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
  applied_date   DATE NOT NULL,
  FOREIGN KEY (student_id)    REFERENCES Students(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES Internships(internship_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 9: Skills — depends on Students and Users
CREATE TABLE Skills (
  skill_id    INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT NOT NULL,
  skill_name  VARCHAR(100) NOT NULL,
  verified    TINYINT(1) DEFAULT 0,
  verified_by INT,
  FOREIGN KEY (student_id)  REFERENCES Students(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES Users(user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 10: Courses — no dependencies
CREATE TABLE Courses (
  course_id  INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  provider   VARCHAR(100),
  duration   VARCHAR(50),
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced'),
  skill_tag  VARCHAR(100)
) ENGINE=InnoDB;

-- Table 11: Interviews — depends on Students and Internships
CREATE TABLE Interviews (
  interview_id  INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT NOT NULL,
  internship_id INT NOT NULL,
  slot_datetime DATETIME,
  status        ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  FOREIGN KEY (student_id)   REFERENCES Students(student_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES Internships(internship_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 12: Alumni_Mentors — depends on Users
CREATE TABLE Alumni_Mentors (
  alumni_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  expertise VARCHAR(255),
  company   VARCHAR(150),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 13: Messages — depends on Users
CREATE TABLE Messages (
  message_id  INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  body        TEXT NOT NULL,
  sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES Users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_students_cgpa       ON Students(cgpa);
CREATE INDEX idx_users_role          ON Users(role);
CREATE INDEX idx_users_university    ON Users(university_id);
CREATE INDEX idx_projects_status     ON Projects_Thesis(status);
CREATE INDEX idx_applications_status ON Applications(status);

-- ============================================================
-- VIEWS
-- ============================================================

-- View 1: v_supervisor_load — each supervisor's current capacity
CREATE VIEW v_supervisor_load AS
SELECT
  f.faculty_id,
  u.name                              AS supervisor_name,
  f.quota,
  f.current_student_count,
  (f.quota - f.current_student_count) AS slots_available
FROM Faculty f
INNER JOIN Users u ON f.user_id = u.user_id;

-- View 2: v_thesis_health — flags projects with overdue unsubmitted milestones
CREATE VIEW v_thesis_health AS
SELECT
  p.project_id,
  p.title,
  p.status,
  p.health_score,
  u.name AS student_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM Milestones m
      WHERE m.project_id      = p.project_id
        AND m.submission_date IS NULL
        AND m.due_date        < CURDATE()
    ) THEN 'At Risk'
    ELSE 'On Track'
  END AS risk_flag
FROM Projects_Thesis p
INNER JOIN Students s ON p.student_id = s.student_id
INNER JOIN Users    u ON s.user_id    = u.user_id;

-- View 3: v_blind_applicants — anonymised profiles for supervisor matching
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

-- View 4: v_internship_matches — open listings with university context
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
WHERE i.status  = 'open'
  AND i.deadline >= CURDATE();
