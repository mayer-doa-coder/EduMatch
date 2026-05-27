-- ============================================================
-- EduMatch — DBMS_project
-- database/seed.sql  (run after schema.sql)
-- ============================================================

USE DBMS_project;

-- ============================================================
-- Universities (10)
-- ============================================================
INSERT INTO Universities (uni_name, location, status) VALUES
('Dhaka University',         'Dhaka',      'Active'),
('BUET',                     'Dhaka',      'Active'),
('NSU',                      'Dhaka',      'Pending'),
('BRAC University',          'Dhaka',      'Active'),
('UIU',                      'Dhaka',      'Active'),
('KUET',                     'Khulna',     'Active'),
('RUET',                     'Rajshahi',   'Active'),
('CUET',                     'Chittagong', 'Active'),
('IUT',                      'Gazipur',    'Active'),
('Jahangirnagar University', 'Savar',      'Active');

-- ============================================================
-- Users
--   user_ids  1–5  : students
--   user_ids  6–12 : faculty  (7 total)
--   user_id   13   : admin
--   user_ids 14–15 : companies
--   user_ids 16–19 : alumni   (4 total)
-- ============================================================
INSERT INTO Users (name, email, password_hash, role, university_id) VALUES
-- students
('Farjana Akter Limu', 'ntaiba2301324@bscse.edu.bd',        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 1),
('Karim Hasan',        'karim@du.edu',                      '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 1),
('Rafiq Islam',        'rafiq@uiu.ac.bd',                   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 5),
('Nadia Chowdhury',    'nadia@buet.ac.bd',                  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 2),
('Shafiul Alam',       'shafiul@kuet.ac.bd',                '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 6),
-- faculty
('Dr. Ahmed Rahman',   'ahmed@du.edu',                      '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 1),
('Dr. Nusrat Jahan',   'nusrat@buet.edu',                   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 2),
('Dr. Tanvir Hossain', 'tanvir@nsu.edu',                    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 3),
('Dr. Reza Khan',      'reza@uiu.ac.bd',                    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 5),
('Dr. Fatima Begum',   'fatima@kuet.ac.bd',                 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 6),
('Dr. Imran Ali',      'imran@bracu.ac.bd',                 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 4),
('Dr. Sumaiya Islam',  'sumaiya@ruet.ac.bd',                '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 7),
-- admin
('Admin User',         'hasan2107004@stud.kuet.ac.bd',      '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin',   1),
-- companies
('DataPeak Labs',      'hr@datapeak.com',                   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company', NULL),
('Brainstation BD',    'hr@brainstation.com',               '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company', NULL),
-- alumni
('Sadia Rahman',       'sadia@gmail.com',                   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  1),
('Rahim Uddin',        'rahim@outlook.com',                 '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  2),
('Mitu Akter',         'mitu@yahoo.com',                    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  5),
('Junaid Hassan',      'junaid@gmail.com',                  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  6);

-- ============================================================
-- Faculty (7)  —  faculty_ids 1–7 → user_ids 6–12
-- ============================================================
INSERT INTO Faculty (user_id, designation, quota, current_student_count, research_focus) VALUES
(6,  'Associate Professor', 8, 5, 'Machine Learning'),
(7,  'Professor',           6, 4, 'Data Mining'),
(8,  'Lecturer',            7, 6, 'Computer Vision'),
(9,  'Associate Professor', 6, 3, 'Natural Language Processing'),
(10, 'Professor',           5, 2, 'Cybersecurity'),
(11, 'Lecturer',            8, 4, 'Internet of Things'),
(12, 'Associate Professor', 6, 1, 'Bioinformatics');

-- ============================================================
-- Students (5)  —  student_ids 1–5 → user_ids 1–5
--   Students 4 & 5 are blind applicants (no supervisor)
-- ============================================================
INSERT INTO Students (user_id, cgpa, research_interest, technical_skills, assigned_supervisor_id) VALUES
(1, 3.87, 'Machine Learning',            'Python,SQL,PHP,JavaScript',  1),
(2, 3.71, 'Data Mining',                 'Java,SQL,R',                 2),
(3, 3.55, 'Natural Language Processing', 'Python,HuggingFace,PyTorch', 4),
(4, 3.90, 'Computer Vision',             'C++,OpenCV,MATLAB',          NULL),
(5, 3.62, 'Internet of Things',          'Embedded C,Arduino,MQTT',    NULL);

-- ============================================================
-- Projects_Thesis (5)
-- ============================================================
INSERT INTO Projects_Thesis (student_id, supervisor_id, title, status, health_score) VALUES
(1, 1, 'Federated Learning at Edge',          'active',    87),
(2, 2, 'Bangla Sentiment Mining',             'at_risk',   58),
(1, 1, 'Retinal Disease Detection',           'completed', 95),
(3, 4, 'Bengali NLP Transformer Fine-Tuning', 'active',    76),
(2, 2, 'Social Network Link Prediction',      'pending',  100);

-- ============================================================
-- Milestones  (overdue + unsubmitted rows trigger At Risk in v_thesis_health)
-- ============================================================
INSERT INTO Milestones (project_id, name, due_date, submission_date, plagiarism_score) VALUES
(1, 'Proposal',          '2025-02-12', '2025-02-10', 4.2),
(1, 'Literature Review', '2025-03-04', '2025-03-01', 6.1),
(1, 'Methodology',       '2025-03-28', '2025-03-25', 5.8),
(1, 'Implementation',    '2025-04-22', NULL,         0.0),
(2, 'Proposal',          '2025-02-15', '2025-02-20', 8.5),
(2, 'Literature Review', '2025-03-10', NULL,         0.0),
(4, 'Proposal',          '2025-03-01', '2025-03-01', 3.1),
(4, 'Literature Review', '2025-04-01', '2025-03-30', 5.0),
(4, 'Model Training',    '2025-05-01', NULL,         0.0);

-- ============================================================
-- Alumni_Mentors (4)  —  user_ids 16–19
-- ============================================================
INSERT INTO Alumni_Mentors (user_id, expertise, company) VALUES
(16, 'ML career path, PhD applications',   'Google BD'),
(17, 'Backend engineering, system design', 'Samsung R&D BD'),
(18, 'Data science, business analytics',   'BJIT Group'),
(19, 'Embedded systems, IoT deployment',   'Robi Axiata');

-- ============================================================
-- Internships (5)
-- ============================================================
INSERT INTO Internships (company_name, role_title, salary, required_skills, deadline, status) VALUES
('DataPeak Labs',   'ML Intern',              '35000', 'Python,PyTorch,ML',        '2026-07-31', 'open'),
('Brainstation BD', 'Data Analyst',           '28000', 'SQL,PowerBI,Excel',        '2026-08-15', 'open'),
('TechSpark',       'Backend Intern',         '30000', 'PHP,MySQL,REST',           '2026-07-01', 'open'),
('Vision AI',       'Computer Vision Intern', '40000', 'Python,OpenCV,TensorFlow', '2026-08-30', 'open'),
('Robi Axiata',     'IoT Engineer Intern',    '32000', 'Embedded C,MQTT,Arduino',  '2026-09-01', 'open');

-- ============================================================
-- Applications (5)
-- ============================================================
INSERT INTO Applications (student_id, internship_id, status, applied_date) VALUES
(1, 1, 'pending',  '2026-05-10'),
(2, 2, 'accepted', '2026-05-05'),
(3, 1, 'pending',  '2026-05-12'),
(4, 3, 'rejected', '2026-05-08'),
(5, 5, 'pending',  '2026-05-15');

-- ============================================================
-- Skills (10 rows, 2 per student)
-- ============================================================
INSERT INTO Skills (student_id, skill_name, verified, verified_by) VALUES
(1, 'Python',     1, 6),
(1, 'SQL',        1, 6),
(2, 'Java',       1, 7),
(2, 'R',          1, 7),
(3, 'Python',     1, 9),
(3, 'NLP',        0, NULL),
(4, 'C++',        0, NULL),
(4, 'MATLAB',     0, NULL),
(5, 'Embedded C', 1, 10),
(5, 'Arduino',    0, NULL);

-- ============================================================
-- Courses (8)
-- ============================================================
INSERT INTO Courses (name, provider, duration, difficulty, skill_tag) VALUES
('Machine Learning Fundamentals',        'Coursera',        '8 weeks',  'Intermediate', 'ML'),
('SQL for Data Science',                 'edX',             '4 weeks',  'Beginner',     'SQL'),
('Python for Everybody',                 'Coursera',        '6 weeks',  'Beginner',     'Python'),
('Deep Learning with PyTorch',           'fast.ai',         '10 weeks', 'Advanced',     'PyTorch'),
('OpenCV & Computer Vision',             'Udemy',           '5 weeks',  'Intermediate', 'OpenCV'),
('Power BI Essentials',                  'Microsoft Learn', '3 weeks',  'Beginner',     'PowerBI'),
('NLP with Transformers & HuggingFace',  'Coursera',        '8 weeks',  'Advanced',     'NLP'),
('IoT with Arduino & Raspberry Pi',      'Udemy',           '6 weeks',  'Intermediate', 'IoT');

-- ============================================================
-- Messages (5)
-- ============================================================
INSERT INTO Messages (sender_id, receiver_id, body, sent_at) VALUES
(6,  1, 'Please revise Chapter 3 data sampling section.',            '2026-05-20 10:00:00'),
(1,  6, 'Understood, I will update by end of week.',                 '2026-05-20 11:30:00'),
(16, 1, 'Happy to help with your ML career path — lets connect.',    '2026-05-21 09:00:00'),
(7,  2, 'Your Literature Review milestone is overdue — submit ASAP.','2026-05-22 08:45:00'),
(3,  9, 'Model training is running — will share results by Friday.', '2026-05-23 14:00:00');

-- ============================================================
-- Interviews (5)
-- ============================================================
INSERT INTO Interviews (student_id, internship_id, slot_datetime, status) VALUES
(1, 1, '2026-06-05 14:00:00', 'scheduled'),
(2, 2, '2026-06-10 10:00:00', 'completed'),
(3, 1, '2026-06-12 15:00:00', 'scheduled'),
(4, 3, '2026-06-15 11:00:00', 'cancelled'),
(5, 5, '2026-06-20 13:00:00', 'scheduled');
