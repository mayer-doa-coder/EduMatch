<?php
// ============================================================
// EduMatch — Role-aware Notifications Endpoint
// GET /backend/notifications.php?user_id=1&role=student
// Returns up to 15 notifications aggregated from relevant tables.
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

$user_id = (int)($_GET['user_id'] ?? 0);
$role    = strtolower(trim($_GET['role'] ?? ''));

if (!$user_id || !$role) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "user_id and role are required."]);
    exit();
}

if ($role === 'supervisor') $role = 'faculty';

try {
    $pdo   = getDB();
    $items = [];

    // ── All roles: messages received ─────────────────────────────────────
    $msg = $pdo->prepare("
        SELECT 'message'                                      AS type,
               CONCAT('New message from User #', sender_id) AS title,
               body                                          AS detail,
               sent_at                                       AS time
        FROM   Messages
        WHERE  receiver_id = :uid
        ORDER  BY sent_at DESC
        LIMIT  5
    ");
    $msg->execute([':uid' => $user_id]);
    $items = array_merge($items, $msg->fetchAll());

    // ── Student: application updates ─────────────────────────────────────
    if ($role === 'student') {
        $sid_row = $pdo->prepare("SELECT student_id FROM Students WHERE user_id = :uid");
        $sid_row->execute([':uid' => $user_id]);
        $sid = (int)($sid_row->fetch()['student_id'] ?? 0);

        if ($sid) {
            $apps = $pdo->prepare("
                SELECT 'internship'                                                   AS type,
                       CONCAT(i.role_title, ' — ', i.company_name)                  AS title,
                       CONCAT('Application status: ', a.status)                      AS detail,
                       CAST(a.applied_date AS CHAR)                                  AS time
                FROM   Applications a
                INNER  JOIN Internships i ON a.internship_id = i.internship_id
                WHERE  a.student_id = :sid
                ORDER  BY a.applied_date DESC
                LIMIT  5
            ");
            $apps->execute([':sid' => $sid]);
            $items = array_merge($items, $apps->fetchAll());

            // Upcoming interviews
            $ivs = $pdo->prepare("
                SELECT 'interview'                                                    AS type,
                       CONCAT('Interview: ', i.role_title, ' @ ', i.company_name)   AS title,
                       CONCAT('Slot: ', DATE_FORMAT(iv.slot_datetime, '%d %b %Y %H:%i')) AS detail,
                       CAST(iv.slot_datetime AS CHAR)                                AS time
                FROM   Interviews iv
                INNER  JOIN Internships i ON iv.internship_id = i.internship_id
                WHERE  iv.student_id = :sid AND iv.status = 'scheduled'
                ORDER  BY iv.slot_datetime ASC
                LIMIT  3
            ");
            $ivs->execute([':sid' => $sid]);
            $items = array_merge($items, $ivs->fetchAll());
        }
    }

    // ── Supervisor/Faculty: new unassigned applicants ─────────────────────
    if ($role === 'faculty') {
        $uni = $pdo->prepare("SELECT university_id FROM Users WHERE user_id = :uid");
        $uni->execute([':uid' => $user_id]);
        $uni_id = (int)($uni->fetch()['university_id'] ?? 0);

        $anon = $pdo->prepare("
            SELECT 'applicant'                                             AS type,
                   CONCAT('New applicant: APX-', s.student_id)           AS title,
                   CONCAT('CGPA: ', IFNULL(s.cgpa, '—'), ' | Unassigned') AS detail,
                   CURDATE()                                              AS time
            FROM   Students s
            INNER  JOIN Users u ON s.user_id = u.user_id
            WHERE  s.assigned_supervisor_id IS NULL
              AND  u.university_id = :univ
            LIMIT  5
        ");
        $anon->execute([':univ' => $uni_id]);
        $items = array_merge($items, $anon->fetchAll());
    }

    // ── Admin: at-risk thesis projects ───────────────────────────────────
    if ($role === 'admin') {
        $risk = $pdo->query("
            SELECT 'risk'                                             AS type,
                   CONCAT('At-risk: ', p.title)                      AS title,
                   CONCAT('Health score: ', p.health_score, '%')     AS detail,
                   CURDATE()                                         AS time
            FROM   Projects_Thesis p
            WHERE  p.status = 'at_risk'
            LIMIT  5
        ");
        $items = array_merge($items, $risk->fetchAll());
    }

    // ── Company: new applications on their postings ────────────────────
    if ($role === 'company') {
        $posted = $pdo->prepare("
            SELECT 'application'                                          AS type,
                   CONCAT('New applicant for: ', i.role_title)           AS title,
                   CONCAT('Status: ', a.status)                          AS detail,
                   CAST(a.applied_date AS CHAR)                          AS time
            FROM   Applications a
            INNER  JOIN Internships i ON a.internship_id = i.internship_id
            WHERE  i.company_name = (SELECT name FROM Users WHERE user_id = :uid)
            ORDER  BY a.applied_date DESC
            LIMIT  5
        ");
        $posted->execute([':uid' => $user_id]);
        $items = array_merge($items, $posted->fetchAll());
    }

    // Sort newest-first and cap at 15
    usort($items, fn($a, $b) => strcmp((string)($b['time'] ?? ''), (string)($a['time'] ?? '')));

    echo json_encode(["success" => true, "notifications" => array_slice($items, 0, 15)]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
