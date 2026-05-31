-- ============================================================
-- EduMatch — seed_extra.sql
-- Run AFTER schema.sql + seed.sql.
-- Adds ≥10 new rows to every major table.
--
-- ALL user passwords = "password"
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.
--
-- ID ranges (AUTO_INCREMENT continues from seed.sql):
--   user_id       20 – 54   (10 students, 10 faculty, 5 companies, 10 alumni)
--   faculty_id     8 – 17
--   student_id     6 – 15
--   project_id     6 – 20   (15 new projects)
--   milestone_id   10+
--   alumni_id       5 – 14
--   internship_id   6 – 18
--   application_id  6+
--   skill_id        11+
--   course_id        9 – 18
--   message_id       6+
--   interview_id     6+
-- ============================================================

USE DBMS_project;

-- ============================================================
-- 1.  NEW USERS
--     user_ids 20-29 : students   (10)
--     user_ids 30-39 : faculty    (10)
--     user_ids 40-44 : companies  (5)
--     user_ids 45-54 : alumni     (10)
-- ============================================================
INSERT INTO Users (name, email, password_hash, role, university_id) VALUES
-- students (10) ──────────────────────────────────────────────
('Tawhidul Hasan',    'tawhid@du.edu.bd',          '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 1),
('Mishkat Chowdhury', 'mishkat@du.edu.bd',          '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 1),
('Sabiha Islam',      'sabiha@du.edu.bd',           '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 1),
('Imtiaz Ahmed',      'imtiaz@buet.ac.bd',          '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 2),
('Fariha Noor',       'fariha@uiu.ac.bd',           '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 5),
('Asif Mahmud',       'asif@du.edu.bd',             '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 1),
('Roksana Parvin',    'roksana@buet.ac.bd',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 2),
('Mizanur Rahman',    'mizan@nsu.edu',              '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 3),
('Tahmina Aktar',     'tahmina@kuet.ac.bd',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 6),
('Shofiur Rahman',    'shofiu@bracu.ac.bd',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'student', 4),
-- faculty (10) ───────────────────────────────────────────────
('Dr. Sohel Rana',       'sohel@du.edu.bd',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 1),
('Dr. Nazmul Haque',     'nazmul@buet.ac.bd',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 2),
('Dr. Mahmuda Begum',    'mahmuda@nsu.edu',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 3),
('Dr. Zahirul Islam',    'zahir@uiu.ac.bd',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 5),
('Dr. Faisal Ahmad',     'faisal@bracu.ac.bd',      '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 4),
('Dr. Kamrun Nahar',     'kamrun@kuet.ac.bd',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 6),
('Dr. Shahriar Kabir',   'shahriar@ruet.ac.bd',     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 7),
('Dr. Rehena Sultana',   'rehena@cuet.ac.bd',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 8),
('Dr. Aminul Islam',     'aminul@iut.ac.bd',        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 9),
('Dr. Monira Akhtar',    'monira@ju.edu.bd',        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'faculty', 10),
-- companies (5) ──────────────────────────────────────────────
('BJIT Group',           'hr@bjit.org',             '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company', NULL),
('Samsung R&D BD',       'hr@samsung.com.bd',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company', NULL),
('TigerIT Bangladesh',   'hr@tigerit.com',          '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company', NULL),
('Kaz Software',         'hr@kazsoft.com',          '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company', NULL),
('Enosis Solutions',     'hr@enosis.net',           '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'company', NULL),
-- alumni (10) ────────────────────────────────────────────────
('Farhan Hossain',       'farhan@gmail.com',        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  1),
('Nilufa Yesmin',        'nilufa@outlook.com',      '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  2),
('Arman Hossain',        'arman@yahoo.com',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  5),
('Tamanna Sultana',      'tamanna@gmail.com',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  4),
('Rayhan Kabir',         'rayhan@gmail.com',        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  6),
('Sabrina Ahmed',        'sabrina@gmail.com',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  1),
('Ziaur Rahman',         'zia@outlook.com',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  3),
('Mariam Khanam',        'mariam@gmail.com',        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  7),
('Sabbir Hossain',       'sabbir@gmail.com',        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  8),
('Anika Tasnim',         'anika@gmail.com',         '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'alumni',  9);

-- ============================================================
-- 2.  NEW FACULTY (faculty_ids 8–17 → user_ids 30–39)
-- ============================================================
INSERT INTO Faculty (user_id, designation, quota, current_student_count, research_focus) VALUES
(30, 'Associate Professor', 7,  2, 'Computer Networks'),
(31, 'Professor',           8,  3, 'Algorithms & Complexity'),
(32, 'Lecturer',            5,  1, 'Cloud Computing'),
(33, 'Associate Professor', 6,  2, 'Database Systems'),
(34, 'Professor',           7,  4, 'Software Engineering'),
(35, 'Lecturer',            5,  0, 'Robotics'),
(36, 'Associate Professor', 8,  3, 'Wireless Networks'),
(37, 'Professor',           6,  2, 'Image Processing'),
(38, 'Associate Professor', 7,  1, 'Distributed Systems'),
(39, 'Lecturer',            5,  0, 'Computational Biology');

-- ============================================================
-- 3.  NEW STUDENTS (student_ids 6–15 → user_ids 20–29)
--     Students 6,7,8,10,12,13,15 are unassigned (blind applicants)
-- ============================================================
INSERT INTO Students (user_id, cgpa, research_interest, technical_skills, assigned_supervisor_id) VALUES
(20, 3.92, 'Machine Learning',            'Python,TensorFlow,Keras,SQL',     NULL),  -- blind @ DU
(21, 3.78, 'Computer Vision',             'Python,OpenCV,C++,CUDA',          NULL),  -- blind @ DU
(22, 3.65, 'Data Mining',                 'Python,R,Spark,Hadoop',           NULL),  -- blind @ DU
(23, 3.88, 'Deep Learning',               'Python,PyTorch,CUDA,Linux',       7),     -- BUET → Dr.Nusrat
(24, 3.71, 'Natural Language Processing', 'Python,HuggingFace,FastAPI',      8),     -- UIU → new fac#8 (faculty_id 11→wait no)
(25, 3.95, 'Federated Learning',          'Python,TensorFlow,gRPC',          1),     -- DU → Dr.Ahmed
(26, 3.60, 'Cybersecurity',               'Python,Wireshark,Metasploit,C',   NULL),  -- blind @ BUET
(27, 3.73, 'Cloud Architecture',          'AWS,Kubernetes,Docker,Go',        NULL),  -- blind @ NSU
(28, 3.82, 'Embedded AI',                 'C,Python,FreeRTOS,TensorFlowLite',5),     -- KUET → Dr.Fatima
(29, 3.55, 'Blockchain',                  'Solidity,Go,Python,JavaScript',   NULL);  -- blind @ BRAC

-- ============================================================
-- 4.  NEW PROJECTS_THESIS (project_ids 6–20)
-- ============================================================
INSERT INTO Projects_Thesis (student_id, supervisor_id, title, status, health_score) VALUES
(6,  1, 'Efficient Transformer for Low-Resource Bangla NLP',     'active',    82),
(7,  1, 'Real-Time Object Detection for Traffic Surveillance',   'active',    74),
(8,  2, 'Graph Neural Network for Social Influence Prediction',  'pending',  100),
(9,  7, 'Transformer-Based Medical Image Segmentation',          'active',    88),
(10, 4, 'Cross-Lingual Transfer Learning for South-Asian NLP',  'active',    79),
(11, 1, 'Privacy-Preserving Federated Learning Framework',       'active',    91),
(12, 5, 'Adversarial Attack Detection in Deep Learning Models',  'pending',  100),
(13, 3, 'Multi-Cloud Resource Optimization with RL',             'active',    67),
(14, 5, 'TinyML on Cortex-M for Real-Time Anomaly Detection',    'active',    85),
(1,  1, 'EfficientNet Fine-Tuning for Skin Disease Detection',   'active',    80),
(2,  2, 'Knowledge Graph Construction from Bangla Text',         'active',    72),
(3,  4, 'Zero-Shot Cross-Lingual Sentiment Transfer',            'at_risk',   55),
(5,  6, 'LoRaWAN-Based Smart Agriculture Sensor Network',        'active',    83),
(4,  3, 'Few-Shot Learning for Medical Diagnosis',               'pending',  100),
(15, 4, 'Blockchain-Enabled Academic Credential Verification',   'active',    78);

-- ============================================================
-- 5.  NEW MILESTONES (for projects 6–20)
-- ============================================================
INSERT INTO Milestones (project_id, name, due_date, submission_date, plagiarism_score) VALUES
-- project 6
(6,  'Proposal',          '2025-03-15', '2025-03-14', 2.8),
(6,  'Literature Review', '2025-04-20', '2025-04-18', 4.1),
(6,  'Model Training',    '2025-06-01', NULL,          0.0),
-- project 7
(7,  'Proposal',          '2025-03-20', '2025-03-22', 5.3),
(7,  'Literature Review', '2025-04-25', NULL,          0.0),
-- project 9
(9,  'Proposal',          '2025-04-01', '2025-03-30', 3.5),
(9,  'Literature Review', '2025-05-10', '2025-05-09', 4.8),
(9,  'Methodology',       '2025-06-15', NULL,          0.0),
-- project 10
(10, 'Proposal',          '2025-03-10', '2025-03-10', 6.2),
(10, 'Literature Review', '2025-04-15', '2025-04-14', 7.1),
(10, 'Implementation',    '2025-06-30', NULL,          0.0),
-- project 11
(11, 'Proposal',          '2025-02-28', '2025-02-27', 2.1),
(11, 'Literature Review', '2025-04-05', '2025-04-04', 3.3),
(11, 'Methodology',       '2025-05-20', '2025-05-19', 4.0),
(11, 'Implementation',    '2025-07-01', NULL,          0.0),
-- project 13
(13, 'Proposal',          '2025-03-01', '2025-03-05', 7.5),
(13, 'Literature Review', '2025-04-10', NULL,          0.0),
-- project 14
(14, 'Proposal',          '2025-04-15', '2025-04-14', 1.9),
(14, 'Literature Review', '2025-05-25', '2025-05-23', 3.0),
(14, 'Implementation',    '2025-07-15', NULL,          0.0),
-- project 16 (student 1, project 10 in insert order)
(16, 'Proposal',          '2025-03-20', '2025-03-19', 3.2),
(16, 'Literature Review', '2025-05-01', '2025-04-29', 5.5),
-- project 20
(20, 'Proposal',          '2025-04-20', '2025-04-20', 2.5);

-- ============================================================
-- 6.  NEW INTERNSHIPS (internship_ids 6–18)
-- ============================================================
INSERT INTO Internships (company_name, role_title, salary, required_skills, deadline, status) VALUES
('BJIT Group',         'Full Stack Intern',         '32000', 'React,Node.js,MySQL,Git',           '2026-08-01', 'open'),
('Samsung R&D BD',     'AI Research Intern',        '45000', 'Python,PyTorch,CUDA,Linux',          '2026-09-15', 'open'),
('TigerIT Bangladesh', 'Java Backend Intern',       '30000', 'Java,Spring Boot,PostgreSQL,REST',   '2026-07-20', 'open'),
('Kaz Software',       'DevOps Intern',             '33000', 'Docker,Kubernetes,CI/CD,Linux',      '2026-08-20', 'open'),
('Enosis Solutions',   'Data Science Intern',       '38000', 'Python,SQL,Pandas,Scikit-learn',     '2026-09-01', 'open'),
('DataPeak Labs',      'NLP Engineer Intern',       '42000', 'Python,HuggingFace,NLP,PyTorch',     '2026-09-30', 'open'),
('Brainstation BD',    'Business Analyst Intern',   '26000', 'Excel,SQL,Power BI,Statistics',      '2026-07-15', 'open'),
('TechSpark',          'Mobile Dev Intern',         '29000', 'Flutter,Dart,Firebase,REST',         '2026-08-10', 'open'),
('BJIT Group',         'Embedded Systems Intern',   '31000', 'Embedded C,RTOS,ARM,UART',           '2026-10-01', 'open'),
('Robi Axiata',        'Network Automation Intern', '35000', 'Python,Ansible,SNMP,Cisco IOS',      '2026-08-25', 'open'),
('Samsung R&D BD',     'Computer Vision Intern',    '48000', 'Python,OpenCV,TensorFlow,C++',       '2026-10-15', 'open'),
('Kaz Software',       'Cloud Intern',              '36000', 'AWS,Terraform,Python,Docker',         '2026-09-10', 'open'),
('Enosis Solutions',   'QA Automation Intern',      '27000', 'Python,Selenium,Pytest,REST',        '2026-08-05', 'open');

-- ============================================================
-- 7.  NEW APPLICATIONS
-- ============================================================
INSERT INTO Applications (student_id, internship_id, status, applied_date) VALUES
(6,   6,  'pending',  '2026-05-20'),
(7,   7,  'pending',  '2026-05-21'),
(8,   5,  'accepted', '2026-05-18'),
(9,   2,  'pending',  '2026-05-22'),
(10,  3,  'pending',  '2026-05-19'),
(11,  1,  'pending',  '2026-05-23'),
(12,  4,  'pending',  '2026-05-24'),
(13,  8,  'pending',  '2026-05-25'),
(14,  5,  'accepted', '2026-05-15'),
(6,   12, 'pending',  '2026-05-26'),
(7,   11, 'pending',  '2026-05-27'),
(3,   3,  'pending',  '2026-05-28'),
(1,   6,  'pending',  '2026-05-29'),
(2,   5,  'rejected', '2026-05-10'),
(5,   9,  'pending',  '2026-05-20');

-- ============================================================
-- 8.  NEW SKILLS
-- ============================================================
INSERT INTO Skills (student_id, skill_name, verified, verified_by) VALUES
(6,  'TensorFlow',   1, 6),
(6,  'Keras',        0, NULL),
(7,  'OpenCV',       1, 6),
(7,  'C++',          0, NULL),
(8,  'Spark',        0, NULL),
(8,  'R',            1, 7),
(9,  'PyTorch',      1, 7),
(9,  'CUDA',         0, NULL),
(10, 'HuggingFace',  1, 9),
(10, 'FastAPI',      0, NULL),
(11, 'TensorFlow',   1, 6),
(11, 'gRPC',         0, NULL),
(12, 'Wireshark',    0, NULL),
(13, 'Docker',       1, 8),
(14, 'C',            1, 10),
(15, 'Solidity',     0, NULL);

-- ============================================================
-- 9.  NEW COURSES (course_ids 9–18)
-- ============================================================
INSERT INTO Courses (name, provider, duration, difficulty, skill_tag) VALUES
('Deep Learning Specialisation',         'Coursera',        '4 months', 'Advanced',     'TensorFlow'),
('Full Stack Web Development',           'freeCodeCamp',    '6 months', 'Intermediate', 'React'),
('Kubernetes for Developers',            'Linux Foundation','4 weeks',  'Intermediate', 'Kubernetes'),
('Ethical Hacking & Penetration Testing','Udemy',           '8 weeks',  'Advanced',     'Cybersecurity'),
('Statistics for Data Science',          'Khan Academy',    '6 weeks',  'Beginner',     'Statistics'),
('Cloud Computing on AWS',               'AWS Educate',     '5 weeks',  'Intermediate', 'AWS'),
('Blockchain and Web3 Fundamentals',     'Coursera',        '6 weeks',  'Intermediate', 'Blockchain'),
('Embedded Systems Programming',         'ARM Education',   '8 weeks',  'Intermediate', 'Embedded C'),
('Reinforcement Learning',               'DeepMind',        '10 weeks', 'Advanced',     'PyTorch'),
('Data Visualisation with Tableau',      'Tableau',         '3 weeks',  'Beginner',     'PowerBI');

-- ============================================================
-- 10. NEW MESSAGES
-- ============================================================
INSERT INTO Messages (sender_id, receiver_id, body, sent_at) VALUES
(6,  20, 'Welcome to the lab. Please set up your development environment using the guide I sent.', '2026-05-20 09:00:00'),
(20, 6,  'Thank you, Professor. I have set up the environment successfully.',                       '2026-05-20 11:00:00'),
(6,  25, 'Your proposal draft is strong. Please add more references to the related works section.', '2026-05-21 10:30:00'),
(25, 6,  'Understood. I will revise and resubmit by tomorrow.',                                    '2026-05-21 14:00:00'),
(7,  23, 'Literature review deadline is approaching. Please submit your draft for review.',         '2026-05-22 09:15:00'),
(23, 7,  'Draft is ready. Uploading to the portal now.',                                           '2026-05-22 16:00:00'),
(9,  28, 'Great progress on the implementation. Consider optimising the inference pipeline.',       '2026-05-23 11:00:00'),
(28, 9,  'Will look into TFLite quantisation to reduce model size.',                               '2026-05-23 14:30:00'),
(4,  10, 'Your cross-lingual model shows promising results. Write up the evaluation section.',     '2026-05-24 10:00:00'),
(10, 4,  'Evaluation is 70% complete. Should be done by end of next week.',                        '2026-05-24 15:00:00'),
(16, 6,  'I am interested in joining your lab as a PhD student. Can we discuss?',                  '2026-05-25 09:30:00'),
(6,  16, 'Happy to discuss. Book a slot via the scheduler.',                                       '2026-05-25 10:00:00'),
(11, 1,  'Your federated learning project is outstanding. I am nominating it for the showcase.',   '2026-05-26 08:00:00'),
(1,  11, 'That is wonderful news! Thank you so much.',                                             '2026-05-26 08:30:00'),
(6,  21, 'Your GPA is excellent. Consider applying for the Best Thesis award this semester.',      '2026-05-27 09:00:00');

-- ============================================================
-- 11. NEW INTERVIEWS (some for new students + applications)
-- ============================================================
INSERT INTO Interviews (student_id, internship_id, slot_datetime, status) VALUES
(6,   6,  '2026-06-08 09:00:00', 'scheduled'),
(7,   7,  '2026-06-09 10:00:00', 'scheduled'),
(8,   5,  '2026-06-07 14:00:00', 'completed'),
(9,   2,  '2026-06-14 11:00:00', 'scheduled'),
(10,  3,  '2026-06-11 13:00:00', 'scheduled'),
(11,  1,  '2026-06-17 09:00:00', 'scheduled'),
(12,  4,  '2026-06-18 10:00:00', 'scheduled'),
(13,  8,  '2026-06-20 14:30:00', 'scheduled'),
(14,  5,  '2026-06-10 09:00:00', 'completed'),
(6,   12, '2026-07-01 10:00:00', 'scheduled');

-- ============================================================
-- 12. NEW ALUMNI_MENTORS (alumni_ids 5–14 → user_ids 45–54)
-- ============================================================
INSERT INTO Alumni_Mentors (user_id, expertise, company) VALUES
(45, 'Deep learning research, PhD applications', 'Meta AI Research'),
(46, 'Data science, Kaggle competitions',         'Grameenphone'),
(47, 'Full stack engineering, startup advice',    'Shohoz'),
(48, 'Product management, UX research',           'bKash'),
(49, 'Cloud architecture, AWS solutions',         'Leads Corporation'),
(50, 'NLP engineering, research writing',         'Kaz Software'),
(51, 'Embedded systems, IoT products',            'Bijoy Robotics'),
(52, 'Computer vision, autonomous systems',       'Autopilot BD'),
(53, 'Cybersecurity, ethical hacking',            'BGD e-GOV CIRT'),
(54, 'Bioinformatics, computational biology',     'ICDDR,B');
