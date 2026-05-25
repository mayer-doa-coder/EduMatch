export const ROLES = ["student", "supervisor", "admin", "company", "alumni"] as const;
export type Role = (typeof ROLES)[number];

export const currentStudent = {
  name: "Farjana Akter Limu",
  email: "farjana.limu@edumatch.edu",
  cgpa: 3.87,
  university: "Dhaka University",
  department: "Computer Science",
  interests: ["Machine Learning", "Data Mining", "NLP"],
  skills: ["Python", "SQL", "PHP", "JavaScript", "Pandas", "Git"],
  thesisHealth: 87,
  matchingScore: 94,
};

export const supervisors = [
  { id: 1, name: "Dr. Ahmed Rahman", expertise: "Machine Learning", quota: 8, current: 5, match: 96, photo: "AR" },
  { id: 2, name: "Dr. Nusrat Jahan", expertise: "Data Mining", quota: 6, current: 4, match: 92, photo: "NJ" },
  { id: 3, name: "Dr. Tanvir Hasan", expertise: "Computer Vision", quota: 7, current: 7, match: 89, photo: "TH" },
  { id: 4, name: "Dr. Salma Khatun", expertise: "Natural Language Processing", quota: 5, current: 2, match: 85, photo: "SK" },
  { id: 5, name: "Dr. Imran Hossain", expertise: "Cybersecurity", quota: 6, current: 3, match: 78, photo: "IH" },
];

export const courses = [
  { id: 1, name: "Machine Learning", provider: "Coursera", duration: "8 weeks", difficulty: "Intermediate" },
  { id: 2, name: "SQL for Data Science", provider: "edX", duration: "4 weeks", difficulty: "Beginner" },
  { id: 3, name: "Python for Everybody", provider: "Coursera", duration: "6 weeks", difficulty: "Beginner" },
  { id: 4, name: "Deep Learning Fundamentals", provider: "fast.ai", duration: "10 weeks", difficulty: "Advanced" },
  { id: 5, name: "Statistical Inference", provider: "Khan Academy", duration: "5 weeks", difficulty: "Intermediate" },
];

export const internships = [
  { id: 1, company: "DataPeak Labs", role: "ML Intern", salary: "৳35,000/mo", match: 95, skills: ["Python", "PyTorch"] },
  { id: 2, company: "Brainstation BD", role: "Data Analyst", salary: "৳28,000/mo", match: 88, skills: ["SQL", "PowerBI"] },
  { id: 3, company: "TechSpark", role: "Backend Intern", salary: "৳30,000/mo", match: 81, skills: ["Node", "MongoDB"] },
  { id: 4, company: "Vision AI", role: "Computer Vision Intern", salary: "৳40,000/mo", match: 76, skills: ["OpenCV", "TF"] },
];

export const milestones = [
  { name: "Proposal", status: "done", date: "Feb 12" },
  { name: "Literature Review", status: "done", date: "Mar 04" },
  { name: "Methodology", status: "done", date: "Mar 28" },
  { name: "Implementation", status: "active", date: "Apr 22" },
  { name: "Evaluation", status: "pending", date: "May 18" },
  { name: "Defense", status: "pending", date: "Jun 10" },
];

export const notifications = [
  { id: 1, title: "Plagiarism report ready", body: "Chapter 3 — 6% similarity detected.", time: "2h ago", unread: true },
  { id: 2, title: "Supervisor feedback", body: "Dr. Ahmed left a comment on your draft.", time: "5h ago", unread: true },
  { id: 3, title: "New internship match", body: "DataPeak Labs (95% match) is open.", time: "1d ago", unread: false },
  { id: 4, title: "Course recommendation", body: "Deep Learning Fundamentals based on your gap.", time: "2d ago", unread: false },
];

export const blindApplicants = [
  { id: 1, code: "APX-1041", cgpa: 3.92, skills: ["Python", "ML"], interests: ["NLP"], match: 94 },
  { id: 2, code: "APX-1042", cgpa: 3.71, skills: ["Java", "Spring"], interests: ["Web"], match: 81 },
  { id: 3, code: "APX-1043", cgpa: 3.85, skills: ["R", "Stats"], interests: ["Data"], match: 88 },
  { id: 4, code: "APX-1044", cgpa: 3.66, skills: ["C++", "OpenCV"], interests: ["CV"], match: 79 },
];

export const adminProjects = [
  { project: "Federated Learning at Edge", student: "F. Limu", score: 92, risk: "Low" },
  { project: "Bangla Sentiment Mining", student: "K. Hasan", score: 71, risk: "Medium" },
  { project: "Retinal Disease Detection", student: "R. Karim", score: 58, risk: "High" },
  { project: "Smart Traffic Routing", student: "S. Akter", score: 85, risk: "Low" },
  { project: "Crop Yield Prediction", student: "M. Rahman", score: 64, risk: "Medium" },
];

export const universities = [
  { name: "Dhaka University", students: 124, projects: 78, status: "Active" },
  { name: "BUET", students: 98, projects: 64, status: "Active" },
  { name: "NSU", students: 76, projects: 41, status: "Pending" },
  { name: "BRAC University", students: 88, projects: 53, status: "Active" },
];

export const progressData = [
  { week: "W1", progress: 8 },
  { week: "W2", progress: 18 },
  { week: "W3", progress: 26 },
  { week: "W4", progress: 38 },
  { week: "W5", progress: 47 },
  { week: "W6", progress: 58 },
  { week: "W7", progress: 71 },
  { week: "W8", progress: 82 },
];

export const matchingDist = [
  { name: "Excellent", value: 42 },
  { name: "Good", value: 31 },
  { name: "Average", value: 18 },
  { name: "Low", value: 9 },
];

export const applicationStatus = [
  { month: "Jan", applied: 12, accepted: 4, rejected: 5 },
  { month: "Feb", applied: 18, accepted: 7, rejected: 6 },
  { month: "Mar", applied: 22, accepted: 10, rejected: 7 },
  { month: "Apr", applied: 28, accepted: 14, rejected: 8 },
  { month: "May", applied: 32, accepted: 17, rejected: 9 },
];

export const mentees = [
  { name: "Sadia Rahman", topic: "Career switch to ML", next: "May 14, 5:00 PM" },
  { name: "Riad Karim", topic: "Resume review", next: "May 16, 7:30 PM" },
  { name: "Fahim Chowdhury", topic: "PhD applications", next: "May 20, 9:00 PM" },
];
