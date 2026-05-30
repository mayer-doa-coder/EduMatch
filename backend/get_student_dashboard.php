<?php
// ============================================================
// EduMatch — Student Dashboard Data Endpoint
// GET /backend/get_student_dashboard.php?student_id=1
// SQL operations: SELECT, INNER JOIN, LEFT JOIN, Multiple JOINs,
//   WHERE, ORDER BY, IS NULL, IS NOT NULL, UNION ALL,
//   Subquery in WHERE, COUNT, AS, VIEW queries
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/lib/db.php';

$student_id = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
if (!$student_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "student_id is required."]);
    exit();
}

try {
    $pdo = getDB();

    // ── Query 1: Student profile — INNER JOIN + Multiple JOINs ──────────
    $q1 = $pdo->prepare("
        SELECT s.student_id, s.cgpa, s.research_interest, s.technical_skills,
               u.name, u.email,
               uni.uni_name AS university
        FROM   Students s
        INNER JOIN Users        u   ON s.user_id       = u.user_id
        INNER JOIN Universities uni ON u.university_id = uni.university_id
        WHERE  s.student_id = :sid
    ");
    $q1->execute([':sid' => $student_id]);
    $student = $q1->fetch();

    if (!$student) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Student not found."]);
        exit();
    }
    $student['cgpa'] = (float)$student['cgpa'];

    // ── Query 2: Thesis projects + milestones — LEFT JOIN + ORDER BY ─────
    // Supervisor resolved via INNER JOIN; milestones LEFT JOIN to include
    // projects that have no milestones yet.
    $q2 = $pdo->prepare("
        SELECT p.project_id,  p.title,         p.status,  p.health_score,
               fu.name        AS supervisor_name,
               m.milestone_id,
               m.name         AS milestone_name,
               m.due_date,    m.submission_date, m.plagiarism_score
        FROM   Projects_Thesis p
        INNER JOIN Faculty f   ON p.supervisor_id = f.faculty_id
        INNER JOIN Users   fu  ON f.user_id        = fu.user_id
        LEFT  JOIN Milestones m ON p.project_id   = m.project_id
        WHERE  p.student_id = :sid
        ORDER  BY p.project_id ASC, m.due_date ASC
    ");
    $q2->execute([':sid' => $student_id]);
    $thesis_rows = $q2->fetchAll();

    // Group milestones under their parent project
    $projects_map = [];
    foreach ($thesis_rows as $row) {
        $pid = (int)$row['project_id'];
        if (!isset($projects_map[$pid])) {
            $projects_map[$pid] = [
                'project_id'      => $pid,
                'title'           => $row['title'],
                'status'          => $row['status'],
                'health_score'    => (int)$row['health_score'],
                'supervisor_name' => $row['supervisor_name'],
                'milestones'      => [],
            ];
        }
        if ($row['milestone_id'] !== null) {
            $projects_map[$pid]['milestones'][] = [
                'milestone_id'    => (int)$row['milestone_id'],
                'name'            => $row['milestone_name'],
                'due_date'        => $row['due_date'],
                'submission_date' => $row['submission_date'],
                'plagiarism_score'=> (float)$row['plagiarism_score'],
                // IS NULL + date comparison flag
                'overdue'         => (
                    $row['submission_date'] === null &&
                    $row['due_date'] !== null &&
                    $row['due_date'] < date('Y-m-d')
                ),
            ];
        }
    }
    $thesis = array_values($projects_map);

    // ── Query 3: Notifications — UNION ALL + Subquery in WHERE ──────────
    // :sid1 / :sid2 are the same value; named params must be unique when
    // ATTR_EMULATE_PREPARES is false.
    $q3 = $pdo->prepare("
        SELECT 'internship'   AS type,
               CONCAT('Applied: ', i.company_name, ' — ', i.role_title) AS title,
               a.applied_date AS time,
               a.status       AS detail
        FROM   Applications a
        INNER  JOIN Internships i ON a.internship_id = i.internship_id
        WHERE  a.student_id = :sid1
        UNION  ALL
        SELECT 'message' AS type,
               body      AS title,
               sent_at   AS time,
               NULL      AS detail
        FROM   Messages
        WHERE  receiver_id = (
            SELECT user_id FROM Students WHERE student_id = :sid2
        )
        ORDER  BY time DESC
        LIMIT  5
    ");
    $q3->execute([':sid1' => $student_id, ':sid2' => $student_id]);
    $notifications = $q3->fetchAll();

    // ── Query 4: Milestone progress — COUNT + IS NOT NULL + IS NULL ──────
    $q4 = $pdo->prepare("
        SELECT
            COUNT(*)                                               AS total_milestones,
            COUNT(m.submission_date)                               AS done_count,
            SUM(CASE WHEN m.submission_date IS NULL
                      AND  m.due_date < CURDATE() THEN 1
                 ELSE 0 END)                                       AS overdue_count
        FROM   Milestones m
        INNER  JOIN Projects_Thesis p ON m.project_id = p.project_id
        WHERE  p.student_id = :sid
    ");
    $q4->execute([':sid' => $student_id]);
    $raw = $q4->fetch();
    $progress = [
        'total_milestones' => (int)$raw['total_milestones'],
        'done_count'       => (int)$raw['done_count'],
        'overdue_count'    => (int)$raw['overdue_count'],
        'completion_pct'   => $raw['total_milestones'] > 0
            ? round(($raw['done_count'] / $raw['total_milestones']) * 100)
            : 0,
    ];

    // ── Query 5: Student skills — LEFT JOIN + ORDER BY ───────────────────
    $q5 = $pdo->prepare("
        SELECT sk.skill_id,   sk.skill_name, sk.verified,
               u.name AS verified_by_name
        FROM   Skills sk
        LEFT   JOIN Users u ON sk.verified_by = u.user_id
        WHERE  sk.student_id = :sid
        ORDER  BY sk.verified DESC, sk.skill_name ASC
    ");
    $q5->execute([':sid' => $student_id]);
    $skills = $q5->fetchAll();
    foreach ($skills as &$sk) {
        $sk['skill_id'] = (int)$sk['skill_id'];
        $sk['verified'] = (bool)$sk['verified'];
    }
    unset($sk);

    // ── Query 6: Available supervisors — VIEW v_supervisor_load ─────────
    // WHERE filters to only supervisors who still have capacity (slots_available > 0)
    $q6 = $pdo->query("
        SELECT faculty_id, supervisor_name, quota,
               current_student_count, slots_available
        FROM   v_supervisor_load
        WHERE  slots_available > 0
        ORDER  BY slots_available DESC
    ");
    $supervisors = $q6->fetchAll();
    foreach ($supervisors as &$sv) {
        $sv['faculty_id']            = (int)$sv['faculty_id'];
        $sv['quota']                 = (int)$sv['quota'];
        $sv['current_student_count'] = (int)$sv['current_student_count'];
        $sv['slots_available']       = (int)$sv['slots_available'];
    }
    unset($sv);

    // ── Query 7: Open internship matches — VIEW v_internship_matches ─────
    $q7 = $pdo->query("
        SELECT internship_id, company_name, role_title,
               salary, required_skills, deadline, posting_university
        FROM   v_internship_matches
        ORDER  BY deadline ASC
    ");
    $internships = $q7->fetchAll();
    foreach ($internships as &$ii) {
        $ii['internship_id'] = (int)$ii['internship_id'];
    }
    unset($ii);

    // ── Query 8: Recommended courses — Subquery in WHERE ────────────────
    // Matches courses whose skill_tag appears in this student's Skills table
    $q8 = $pdo->prepare("
        SELECT course_id, name, provider, duration, difficulty, skill_tag
        FROM   Courses
        WHERE  skill_tag IN (
            SELECT skill_name FROM Skills WHERE student_id = :sid
        )
        ORDER  BY difficulty ASC, name ASC
    ");
    $q8->execute([':sid' => $student_id]);
    $courses = $q8->fetchAll();
    foreach ($courses as &$c) {
        $c['course_id'] = (int)$c['course_id'];
    }
    unset($c);

    http_response_code(200);
    echo json_encode([
        "success"       => true,
        "student"       => $student,
        "thesis"        => $thesis,
        "notifications" => $notifications,
        "progress"      => $progress,
        "skills"        => $skills,
        "supervisors"   => $supervisors,
        "internships"   => $internships,
        "courses"       => $courses,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
