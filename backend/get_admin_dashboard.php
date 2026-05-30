<?php
// ============================================================
// EduMatch — Admin Dashboard Endpoint
// GET /backend/get_admin_dashboard.php
// SQL operations: UNION, UNION ALL, INTERSECT (simulated),
//   MINUS (simulated), GROUP BY Multiple Columns,
//   COUNT DISTINCT, SUM, SELECT DISTINCT
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

try {
    $pdo = getDB();

    // ── Query 1: UNION — deduplicated activity feed ──────────────────────────
    // UNION removes duplicate rows across both result sets. If a thesis title
    // were identical to an internship role_title the row appears only once.
    // CAST AS UNSIGNED fixes numeric sort order ("9" > "10" as CHAR is wrong).
    $q1 = $pdo->query("
        SELECT 'thesis'                          AS type,
               title                             AS item,
               CAST(student_id    AS UNSIGNED)   AS ref_id,
               status
        FROM   Projects_Thesis
        UNION
        SELECT 'internship',
               role_title,
               CAST(internship_id AS UNSIGNED),
               status
        FROM   Internships
        ORDER  BY ref_id DESC
        LIMIT  20
    ");
    $activity_feed = $q1->fetchAll();
    foreach ($activity_feed as &$af) {
        $af['ref_id'] = (int)$af['ref_id'];
    }
    unset($af);

    // ── Query 2: UNION ALL — recent events (all rows kept) ──────────────────
    // UNION ALL does NOT deduplicate. Every application event and every message
    // event is included even if their text columns happen to match — contrast
    // with UNION above which silently drops duplicates.
    $q2 = $pdo->query("
        SELECT 'application'                                         AS event_type,
               CONCAT(u.name, ' applied to ', i.role_title)         AS event_text,
               CAST(a.applied_date AS CHAR)                          AS event_time
        FROM   Applications  a
        INNER  JOIN Students    s ON a.student_id    = s.student_id
        INNER  JOIN Users       u ON s.user_id       = u.user_id
        INNER  JOIN Internships i ON a.internship_id = i.internship_id
        UNION  ALL
        SELECT 'message',
               CONCAT(u.name, ': ', LEFT(m.body, 60)),
               CAST(m.sent_at AS CHAR)
        FROM   Messages m
        INNER  JOIN Users u ON m.sender_id = u.user_id
        ORDER  BY event_time DESC
        LIMIT  10
    ");
    $event_feed = $q2->fetchAll();

    // ── Query 3: GROUP BY Multiple Columns — projects by university + status ─
    $q3 = $pdo->query("
        SELECT uni.uni_name,
               p.status,
               COUNT(*)  AS project_count
        FROM   Projects_Thesis  p
        INNER  JOIN Students     s   ON p.student_id    = s.student_id
        INNER  JOIN Users        u   ON s.user_id       = u.user_id
        INNER  JOIN Universities uni ON u.university_id = uni.university_id
        GROUP  BY uni.uni_name, p.status
        ORDER  BY uni.uni_name ASC, p.status ASC
    ");
    $by_uni_status = $q3->fetchAll();
    foreach ($by_uni_status as &$bus) {
        $bus['project_count'] = (int)$bus['project_count'];
    }
    unset($bus);

    // ── Query 4: INTERSECT simulated — INNER JOIN on shared column ───────────
    // "Students who are in BOTH an active thesis AND have an accepted internship."
    // MySQL has no INTERSECT keyword; simulate by INNER JOINing the two sets
    // on student_id and filtering each side's condition independently.
    // SELECT DISTINCT prevents duplicate rows when a student has multiple
    // matching projects or applications.
    $q4 = $pdo->query("
        SELECT DISTINCT p.student_id,
               u.name    AS student_name
        FROM   Projects_Thesis p
        INNER  JOIN Applications a ON p.student_id = a.student_id
        INNER  JOIN Students     s ON p.student_id = s.student_id
        INNER  JOIN Users        u ON s.user_id    = u.user_id
        WHERE  p.status = 'active'
          AND  a.status = 'accepted'
        ORDER  BY u.name
    ");
    $both_thesis_and_intern = $q4->fetchAll();
    foreach ($both_thesis_and_intern as &$bt) {
        $bt['student_id'] = (int)$bt['student_id'];
    }
    unset($bt);

    // ── Query 5: MINUS simulated — LEFT JOIN + WHERE right.id IS NULL ────────
    // "Students who exist in Students but NOT in Applications."
    // MySQL has no MINUS/EXCEPT keyword; simulate with LEFT JOIN — rows where
    // application_id IS NULL are exactly those missing from the Applications set.
    $q5 = $pdo->query("
        SELECT s.student_id,
               u.name    AS student_name,
               s.cgpa
        FROM   Students     s
        INNER  JOIN Users        u ON s.user_id    = u.user_id
        LEFT   JOIN Applications a ON s.student_id = a.student_id
        WHERE  a.application_id IS NULL
        ORDER  BY s.cgpa DESC
    ");
    $no_applications = $q5->fetchAll();
    foreach ($no_applications as &$na) {
        $na['student_id'] = (int)$na['student_id'];
        $na['cgpa']       = (float)$na['cgpa'];
    }
    unset($na);

    // ── Query 6: COUNT DISTINCT ───────────────────────────────────────────────
    $q6 = $pdo->query("SELECT COUNT(DISTINCT skill_name) AS unique_skills    FROM Skills");
    $unique_skills    = (int)$q6->fetchColumn();

    $q7 = $pdo->query("SELECT COUNT(DISTINCT student_id) AS students_applied FROM Applications");
    $students_applied = (int)$q7->fetchColumn();

    $q8 = $pdo->query("SELECT COUNT(*) FROM Users");
    $total_users      = (int)$q8->fetchColumn();

    // ── Query 7: SUM — application status breakdown ──────────────────────────
    // SUM(CASE WHEN ...) counts rows matching each status without GROUP BY,
    // returning the full breakdown in a single row.
    $q9 = $pdo->query("
        SELECT SUM(CASE WHEN status = 'accepted'  THEN 1 ELSE 0 END) AS total_accepted,
               SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS total_pending,
               SUM(CASE WHEN status = 'rejected'  THEN 1 ELSE 0 END) AS total_rejected,
               SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) AS total_withdrawn,
               COUNT(*)                                                AS total_applications
        FROM   Applications
    ");
    $app_stats = $q9->fetch();
    $app_stats = [
        'total_accepted'     => (int)($app_stats['total_accepted']     ?? 0),
        'total_pending'      => (int)($app_stats['total_pending']      ?? 0),
        'total_rejected'     => (int)($app_stats['total_rejected']     ?? 0),
        'total_withdrawn'    => (int)($app_stats['total_withdrawn']    ?? 0),
        'total_applications' => (int)($app_stats['total_applications'] ?? 0),
    ];

    // ── Query 8: SELECT DISTINCT — universities that have enrolled students ───
    // SELECT DISTINCT eliminates duplicate university rows that would arise
    // because multiple students can belong to the same university.
    $q10 = $pdo->query("
        SELECT DISTINCT
               uni.uni_name,
               uni.location,
               uni.status AS uni_status
        FROM   Universities uni
        INNER  JOIN Users u ON uni.university_id = u.university_id
        WHERE  u.role = 'student'
        ORDER  BY uni.uni_name
    ");
    $active_universities = $q10->fetchAll();

    // ── Query 9: Plagiarism report — high-risk submitted milestones ──────────
    // Threshold set to > 4.0 so existing seed data (max 8.5) returns rows.
    $q11 = $pdo->query("
        SELECT p.title              AS project_title,
               m.name               AS chapter,
               m.plagiarism_score,
               u.name               AS student_name,
               m.submission_date
        FROM   Milestones       m
        INNER  JOIN Projects_Thesis p ON m.project_id = p.project_id
        INNER  JOIN Students        s ON p.student_id = s.student_id
        INNER  JOIN Users           u ON s.user_id    = u.user_id
        WHERE  m.plagiarism_score > 4.0
        ORDER  BY m.plagiarism_score DESC
    ");
    $plagiarism_report = $q11->fetchAll();
    foreach ($plagiarism_report as &$pr) {
        $pr['plagiarism_score'] = (float)$pr['plagiarism_score'];
    }
    unset($pr);

    http_response_code(200);
    echo json_encode([
        "success"                => true,
        "activity_feed"          => $activity_feed,
        "event_feed"             => $event_feed,
        "by_university_status"   => $by_uni_status,
        "both_thesis_and_intern" => $both_thesis_and_intern,
        "no_applications"        => $no_applications,
        "active_universities"    => $active_universities,
        "stats" => [
            "unique_skills"      => $unique_skills,
            "students_applied"   => $students_applied,
            "total_users"        => $total_users,
        ] + $app_stats,
        "plagiarism_report"      => $plagiarism_report,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
