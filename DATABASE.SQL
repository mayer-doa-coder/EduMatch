CREATE DATABASE IF NOT EXISTS DBMS_project;

USE DBMS_project;



CREATE TABLE Universities (

university_id INT PRIMARY KEY AUTO_INCREMENT,

uni_name VARCHAR(255) NOT NULL,

location VARCHAR(255)

) ENGINE=InnoDB;



CREATE TABLE Users (

user_id INT PRIMARY KEY AUTO_INCREMENT,

name VARCHAR(255) NOT NULL,

email VARCHAR(255) UNIQUE NOT NULL,

password_hash VARCHAR(255) NOT NULL,

role ENUM('student', 'faculty', 'admin', 'alumni', 'corporate') NOT NULL,

university_id INT,

FOREIGN KEY (university_id) REFERENCES Universities(university_id)

) ENGINE=InnoDB;



CREATE TABLE Faculty (

faculty_id INT PRIMARY KEY AUTO_INCREMENT,

user_id INT NOT NULL,

designation VARCHAR(100),

quota INT DEFAULT 5,

current_student_count INT DEFAULT 0,

research_focus TEXT,

FOREIGN KEY (user_id) REFERENCES Users(user_id)

) ENGINE=InnoDB;



CREATE TABLE Students (

student_id INT PRIMARY KEY AUTO_INCREMENT,

user_id INT NOT NULL,

cgpa DECIMAL(3,2),

research_interest TEXT,

technical_skills TEXT,

assigned_supervisor_id INT NULL,

FOREIGN KEY (user_id) REFERENCES Users(user_id),

FOREIGN KEY (assigned_supervisor_id) REFERENCES Faculty(faculty_id)

) ENGINE=InnoDB;



CREATE TABLE Projects_Thesis (

project_id INT PRIMARY KEY AUTO_INCREMENT,

student_id INT NOT NULL,

supervisor_id INT NOT NULL,

title VARCHAR(255),

status ENUM('pending', 'active', 'at_risk', 'completed') DEFAULT 'pending',

health_score INT DEFAULT 100,

FOREIGN KEY (student_id) REFERENCES Students(student_id),

FOREIGN KEY (supervisor_id) REFERENCES Faculty(faculty_id)

) ENGINE=InnoDB;



CREATE TABLE Milestones (

milestone_id INT PRIMARY KEY AUTO_INCREMENT,

project_id INT NOT NULL,

title VARCHAR(100),

due_date DATE,

submission_date DATE NULL,

plagiarism_score DECIMAL(5,2) DEFAULT 0.00,

FOREIGN KEY (project_id) REFERENCES Projects_Thesis(project_id)

) ENGINE=InnoDB;



CREATE TABLE Alumni_Mentors (

alumni_id INT PRIMARY KEY AUTO_INCREMENT,

user_id INT NOT NULL,

expertise VARCHAR(255),

company VARCHAR(255),

FOREIGN KEY (user_id) REFERENCES Users(user_id)

) ENGINE=InnoDB;



CREATE TABLE Courses (

course_id INT PRIMARY KEY AUTO_INCREMENT,

course_name VARCHAR(255),

skill_category VARCHAR(100),

url VARCHAR(255),

is_free BOOLEAN DEFAULT TRUE

) ENGINE=InnoDB;


USE DBMS_project;

-- ==========================================
-- 1. UNIVERSITIES
-- ==========================================
INSERT INTO Universities (uni_name, location) VALUES
('MIT', 'Cambridge, USA'),
('Stanford University', 'Stanford, USA'),
('Harvard University', 'Cambridge, USA'),
('University of Oxford', 'Oxford, UK'),
('University of Cambridge', 'Cambridge, UK'),
('ETH Zurich', 'Zurich, Switzerland'),
('National University of Singapore', 'Singapore'),
('University of Toronto', 'Toronto, Canada'),
('Tsinghua University', 'Beijing, China'),
('University of California, Berkeley', 'Berkeley, USA');

-- ==========================================
-- 2. USERS
-- ==========================================
INSERT INTO Users (name, email, password_hash, role, university_id) VALUES
('Alice Johnson', 'alice@mit.edu', '$2b$12$eI7L7v...', 'student', 1),
('Bob Smith', 'bob@stanford.edu', '$2b$12$8M9xP2...', 'faculty', 2),
('Charlie Brown', 'charlie@harvard.edu', '$2b$12$9Z3vQ4...', 'student', 3),
('Diana Prince', 'diana@ox.ac.uk', '$2b$12$K7wL1o...', 'faculty', 4),
('Evan Wright', 'evan@cam.ac.uk', '$2b$12$mP4qR5...', 'alumni', 5),
('Fiona Gallagher', 'fiona@ethz.ch', '$2b$12$tU6vW7...', 'student', 6),
('George Clooney', 'george@nus.edu.sg', '$2b$12$xY8zA9...', 'faculty', 7),
('Hannah Montana', 'hannah@utoronto.ca', '$2b$12$bC1dE2...', 'alumni', 8),
('Ian Somerhalder', 'ian@tsinghua.edu.cn', '$2b$12$fG3hI4...', 'admin', 9),
('Julia Roberts', 'julia@berkeley.edu', '$2b$12$jK5lL6...', 'corporate', 10);

-- ==========================================
-- 3. FACULTY
-- ==========================================
INSERT INTO Faculty (user_id, designation, quota, current_student_count, research_focus) VALUES
(2, 'Professor', 5, 2, 'Artificial Intelligence and Machine Learning'),
(4, 'Associate Professor', 4, 1, 'Quantum Computing'),
(7, 'Assistant Professor', 3, 1, 'Cybersecurity and Blockchain'),
(2, 'Professor', 5, 1, 'Data Science and Analytics'),
(4, 'Associate Professor', 4, 2, 'Human-Computer Interaction'),
(7, 'Assistant Professor', 3, 1, 'Bioinformatics'),
(2, 'Professor', 5, 1, 'Cloud Computing Systems'),
(4, 'Associate Professor', 4, 0, 'Advanced Robotics'),
(7, 'Assistant Professor', 3, 1, 'Empirical Software Engineering'),
(2, 'Professor', 5, 0, 'Computer Vision and Image Processing');

-- ==========================================
-- 4. STUDENTS
-- ==========================================
INSERT INTO Students (user_id, cgpa, research_interest, technical_skills, assigned_supervisor_id) VALUES
(1, 3.85, 'Deep Learning Optimization', 'Python, PyTorch, C++', 1),
(3, 3.90, 'Quantum Cryptography', 'Python, Qiskit, LaTeX', 2),
(6, 3.70, 'Blockchain Consensus Protocols', 'Solidity, Go, Rust', 3),
(1, 3.65, 'Big Data Analytics', 'Java, Spark, Hadoop', 4),
(3, 3.80, 'UI/UX Automation', 'JavaScript, React, Node.js', 5),
(6, 3.95, 'Genomics Data Analysis', 'R, Python, Bioconductor', 6),
(1, 3.50, 'Edge Computing Networks', 'C, AWS, Linux', 7),
(3, 3.75, 'Autonomous Drone Navigation', 'C++, ROS, MATLAB', 8),
(6, 3.60, 'DevOps Architecture', 'Docker, Kubernetes, Bash', 9),
(1, 3.88, 'Medical Image Segmentation', 'Python, OpenCV, TensorFlow', 1);

-- ==========================================
-- 5. PROJECTS_THESIS
-- ==========================================
INSERT INTO Projects_Thesis (student_id, supervisor_id, title, status, health_score) VALUES
(1, 1, 'Optimizing CNNs for Mobile Devices', 'active', 95),
(2, 2, 'Post-Quantum Cryptographic Protocols', 'active', 90),
(3, 3, 'Decentralized Identity Verification Systems', 'pending', 100),
(4, 4, 'Scalable Data Pipelines in Hybrid Clouds', 'completed', 100),
(5, 5, 'Web Accessibility in Modern Frameworks', 'at_risk', 65),
(6, 6, 'DNA Sequence Alignment Using Transformers', 'active', 88),
(7, 7, 'Latency Reduction in IoT Mesh Networks', 'pending', 100),
(8, 8, 'Reinforcement Learning for Drone Obstacle Avoidance', 'active', 92),
(9, 9, 'Automating CI/CD Pipelines for Microservices', 'completed', 100),
(10, 1, 'Early Tumor Detection using 3D CNNs', 'active', 85);

-- ==========================================
-- 6. MILESTONES
-- ==========================================
INSERT INTO Milestones (project_id, title, due_date, submission_date, plagiarism_score) VALUES
(1, 'Literature Review', '2026-02-15', '2026-02-14', 4.50),
(1, 'Proposal Defense', '2026-03-30', '2026-03-29', 1.20),
(2, 'Algorithm Design Core', '2026-04-10', '2026-04-12', 8.00),
(4, 'Final Thesis Submission', '2026-01-20', '2026-01-18', 2.10),
(5, 'Midterm Progress Report', '2026-05-01', NULL, 0.00),
(6, 'Dataset Collection and Cleaning', '2026-03-01', '2026-03-05', 12.30),
(8, 'Simulation Environment Setup', '2026-04-15', '2026-04-15', 5.00),
(9, 'System Architecture Design', '2026-02-10', '2026-02-10', 0.00),
(10, 'Model Training and Tuning', '2026-05-15', NULL, 0.00),
(2, 'Interim Performance Evaluation', '2026-06-01', NULL, 0.00);

-- ==========================================
-- 7. ALUMNI_MENTORS
-- ==========================================
INSERT INTO Alumni_Mentors (user_id, expertise, company) VALUES
(5, 'Machine Learning Engineering', 'Google'),
(8, 'Technical Product Management', 'Meta'),
(5, 'Full Stack Web Development', 'Netflix'),
(8, 'Big Data Engineering', 'Amazon'),
(5, 'Cybersecurity Infrastructure', 'Microsoft'),
(8, 'Cloud System Architecture', 'Apple'),
(5, 'Blockchain Solutions', 'Coinbase'),
(8, 'DevOps & Site Reliability', 'Atlassian'),
(5, 'AI Safety Research', 'OpenAI'),
(8, 'Quantitative Trading Systems', 'Citadel');

-- ==========================================
-- 8. COURSES
-- ==========================================
INSERT INTO Courses (course_name, skill_category, url, is_free) VALUES
('Introduction to Machine Learning', 'Data Science', 'https://platform.com/courses/intro-ml', TRUE),
('Advanced Python Programming', 'Development', 'https://platform.com/courses/adv-python', FALSE),
('Bitcoin and Cryptocurrency Technologies', 'Security', 'https://platform.com/courses/bitcoin-tech', TRUE),
('Cloud Computing Architecture Basics', 'Cloud', 'https://platform.com/courses/cloud-basics', TRUE),
('React - The Complete Guide', 'Development', 'https://platform.com/courses/react-guide', FALSE),
('Bioinformatics: Introduction to Genetics', 'Data Science', 'https://platform.com/courses/bio-intro', TRUE),
('Docker & Kubernetes Masterclass', 'DevOps', 'https://platform.com/courses/docker-k8s', FALSE),
('Introduction to Quantum Computing', 'Quantum', 'https://platform.com/courses/quantum-intro', TRUE),
('UI/UX Design Fundamentals', 'Design', 'https://platform.com/courses/uiux-fund', FALSE),
('Deep Learning Specialization', 'Data Science', 'https://platform.com/courses/dl-spec', FALSE);