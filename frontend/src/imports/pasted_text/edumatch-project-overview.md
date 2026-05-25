EduMatch — AI-Driven Thesis & Internship Ecosystem

A modern university platform that connects students, faculty supervisors, companies, administrators, and alumni mentors.

The system manages:

AI-based thesis supervisor matching
Internship matching
Skill gap analysis
Free course recommendations
Thesis milestone tracking
Plagiarism reports
Thesis health score
Interview scheduling
QR credential verification
Cross-university collaboration
TECHNOLOGY REQUIREMENTS

Use:

HTML5
CSS3
JavaScript (Vanilla JS)

Optional:

Bootstrap 5
Chart.js
FullCalendar.js
Font Awesome
AOS animations

No backend required. Use realistic dummy data. All forms should validate on the frontend.

DESIGN SYSTEM
Color Palette
Primary
#1A5F7A — Deep Teal/Blue (Authority & Research)
Secondary
#57C5B6 — Mint/Seafoam (Creativity & Matchmaking)
Accent
#FF9F29 — Soft Orange (Actions & Deadlines)
Background
#F8F9FA — Off-White (Cleanliness & Focus)
Supporting Colors
Success: #28A745
Danger: #DC3545
Warning: #FFC107
Info: #17A2B8
Dark Text: #212529
Light Text: #6C757D
Border: #E9ECEF
TYPOGRAPHY
Font Family: Poppins or Inter
Headings: Bold
Body: Regular
Line-height: 1.6
Border Radius: 16px
Card Shadow: 0 10px 30px rgba(0,0,0,0.08)
GLOBAL COMPONENTS

Create reusable components:

Navbar
Sidebar
Footer
Hero Section
Cards
Buttons
Forms
Modals
Tables
Charts
Progress Bars
Step Timeline
Notifications
Calendar
Search & Filters
File Upload Area
QR Code Card
RESPONSIVE DESIGN

Support:

Desktop
Tablet
Mobile

Use:

Flexbox
CSS Grid
Sticky sidebar
Mobile hamburger menu
ANIMATIONS
Fade-in on scroll
Hover lift cards
Smooth counters
Progress bar animations
Skeleton loaders
FOLDER STRUCTURE
EduMatch/
│── index.html
│── login.html
│── register.html
│── css/
│   ├── style.css
│   ├── dashboard.css
│   └── responsive.css
│── js/
│   ├── main.js
│   ├── charts.js
│   └── validation.js
│── pages/
│   ├── student/
│   ├── supervisor/
│   ├── admin/
│   ├── company/
│   └── alumni/
│── assets/
│   ├── images/
│   ├── icons/
│   └── avatars/
PUBLIC PAGES
1. Landing Page (index.html)
Sections
Sticky Navbar
Hero Banner
Features Section
How It Works
User Roles
AI Skill Gap Demo
Thesis Health Demo
Statistics Counters
Testimonials
FAQ Accordion
CTA Section
Footer
Hero Content
Title: EduMatch — AI-Driven Thesis & Internship Ecosystem
Subtitle
Buttons:
Get Started
Watch Demo
Features Cards
AI Matching
Skill Gap Analysis
Thesis Health Score
Plagiarism Tracker
Internship Matching
QR Credentials
2. Login Page

Fields:

Email
Password
Remember Me
Forgot Password

Role badges:

Student
Supervisor
Admin
Company
Alumni
3. Registration Page

Fields:

Name
Email
Password
Role
University
Department
STUDENT MODULE
Student Dashboard

Widgets:

Thesis Health Score
Matching Score
Upcoming Deadlines
Plagiarism Status
Internship Applications
Skill Gap Alerts

Charts:

Progress Chart
Submission Timeline

Sections:

Recommended Supervisors
Suggested Courses
Recent Notifications
Student Profile & Skills

Sections:

Personal Info
Academic Info
Skills Tags
Research Interests
Resume Upload
Certificates
Supervisor Matching Page

Features:

Search
Filters
Ranking Cards
Compatibility Score
Apply Button

Card Data:

Faculty photo
Expertise
Quota
Current Students
Match Score
Skill Gap Analysis Page

Layout:

Required Skills
Existing Skills
Missing Skills
Suggested Free Courses

Course Cards:

Course Name
Provider
Duration
Difficulty
Enroll Button
Thesis Submission Page

Features:

Chapter Upload
Submission History
Deadline Countdown
Plagiarism Score
Comments
Thesis Health Score Page

Metrics:

Timeliness
Plagiarism
Supervisor Feedback
Completion Rate

Gauge:

Green (Excellent)
Yellow (At Risk)
Red (Critical)
Internship Matching Page

Cards:

Company Logo
Role
Requirements
Salary
Match Score
Apply Button
Interview Scheduler

Features:

Calendar
Time Slot Selection
Confirmation Modal
QR Credential Page

Display:

Verified Skills
Faculty Signature
QR Code
Download Button
SUPERVISOR MODULE
Supervisor Dashboard

Widgets:

Current Students
Quota Usage
Pending Applications
Thesis Alerts

Charts:

Student Progress
Health Trends
Blind Applicant Review

Hide:

Name
Gender
University

Show:

CGPA
Skills
Interests
Compatibility Score

Actions:

Accept
Reject
Waitlist
Capacity Settings

Fields:

Maximum Quota
Available Slots
Auto Reassign Toggle
Feedback & Comments
Rich text comments
Milestone feedback
Status updates
ADMIN MODULE
Admin Dashboard

Widgets:

Total Students
Total Faculty
Active Projects
Internship Listings
At-Risk Projects

Charts:

Matching Statistics
University Comparison
User Management

Features:

Search
Add/Edit/Delete
Role Assignment
Inter-University Manager
University Cards
Collaboration Status
Visibility Controls
Plagiarism & Health Reports

Table Columns:

Project
Student
Score
Risk Level
System Settings
Weights for Matching
Thresholds
Branding
COMPANY MODULE
Company Dashboard

Widgets:

Open Positions
Applications
Interviews
Shortlisted Students
Job Posting Form

Fields:

Title
Skills
Salary
Deadline
Applicant Review
Resume Preview
Match Score
Interview Invite
ALUMNI MODULE
Alumni Dashboard

Widgets:

Active Mentees
Sessions
Expertise Areas
Mentorship Page
Availability Calendar
Book Session
Chat Preview
SHARED PAGES
Notifications Center
Alerts
Filters
Mark as Read
Messages Page
Conversation List
Chat Window
Settings Page
Profile
Password
Theme
Help Center
FAQ
Contact Form
DASHBOARD LAYOUT
Top Navbar
Left Sidebar
Main Content Area
Right Activity Panel (optional)

Sidebar includes:

Dashboard
Profile
Matching
Submissions
Reports
Settings
Logout
CHARTS REQUIRED

Use Chart.js for:

Thesis Progress (Line)
Health Score (Doughnut)
Matching Distribution (Bar)
Quota Usage (Pie)
Application Status (Stacked Bar)
CALENDAR FEATURES

Use FullCalendar.js for:

Submission deadlines
Interview schedules
Mentorship sessions
UI STATES

Include:

Empty states
Loading skeletons
Error messages
Success alerts
ACCESSIBILITY
Proper labels
Keyboard navigation
ARIA support
High contrast
DUMMY DATA

Create realistic dummy data for:

Students
Faculty
Companies
Projects
Milestones
Courses
Notifications
SAMPLE STUDENT DATA
Name: Farjana Akter Limu
CGPA: 3.87
Interests: Machine Learning, Data Mining
Skills: Python, SQL, PHP, JavaScript
Thesis Health: 87
SAMPLE SUPERVISORS
Dr. Ahmed Rahman — Machine Learning — Match 96%
Dr. Nusrat Jahan — Data Mining — Match 92%
Dr. Tanvir Hasan — Computer Vision — Match 89%
SAMPLE COURSES
Machine Learning by Coursera
SQL for Data Science
Python for Everybody
Deep Learning Fundamentals
INTERACTIONS

All buttons should work using JavaScript:

Open modals
Submit forms
Filter lists
Update charts
Show notifications
Toggle sidebar
FOOTER CONTENT
About
Contact
Privacy Policy
Terms
Social Links
STYLE GUIDELINES
Minimal and professional
University-grade design
Clean spacing
Rounded cards
Soft shadows
Smooth transitions
DELIVERABLE

Generate all HTML, CSS, and JavaScript files necessary to build the complete frontend. Each page should be fully designed and connected via navigation links. Use only frontend logic with realistic dummy data. Ensure every section is visually polished and responsive.

PRIORITY ORDER

Build in this order:

Landing Page
Login/Register
Student Dashboard
Matching Pages
Thesis Tracking
Supervisor Dashboard
Admin Dashboard
Company Dashboard
Alumni Dashboard
Shared Pages
FINAL GOAL

Create a premium, professional, fully responsive frontend for EduMatch that looks like a production-ready university SaaS platform.

The design should feel modern, trustworthy, and innovative, using the provided color palette throughout.