<?php
// ============================================================
// EduMatch — Public Preview Endpoint (no auth required)
// GET /backend/preview.php?type=supervisors|internships|alumni
// Used by the landing page role-preview dialogs.
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

$type = strtolower(trim($_GET['type'] ?? ''));

try {
    $pdo = getDB();

    switch ($type) {

        // Supervisors with open capacity
        case 'supervisors':
            $rows = $pdo->query("
                SELECT  u.name,
                        f.designation,
                        f.research_focus,
                        f.quota,
                        f.current_student_count,
                        (f.quota - f.current_student_count) AS open_slots,
                        uni.uni_name AS university
                FROM    Faculty f
                INNER JOIN Users          u   ON f.user_id       = u.user_id
                LEFT  JOIN Universities   uni ON u.university_id  = uni.university_id
                ORDER  BY open_slots DESC
                LIMIT  6
            ")->fetchAll();
            echo json_encode(['success' => true, 'items' => $rows]);
            break;

        // Open internship listings
        case 'internships':
            $rows = $pdo->query("
                SELECT  company_name,
                        role_title,
                        salary,
                        required_skills,
                        deadline
                FROM    Internships
                WHERE   status   = 'open'
                  AND   deadline >= CURDATE()
                ORDER  BY deadline ASC
                LIMIT  6
            ")->fetchAll();
            echo json_encode(['success' => true, 'items' => $rows]);
            break;

        // Alumni mentors
        case 'alumni':
            $rows = $pdo->query("
                SELECT  u.name,
                        a.expertise,
                        a.company,
                        uni.uni_name AS university
                FROM    Alumni_Mentors a
                INNER JOIN Users        u   ON a.user_id       = u.user_id
                LEFT  JOIN Universities uni ON u.university_id  = uni.university_id
                LIMIT  6
            ")->fetchAll();
            echo json_encode(['success' => true, 'items' => $rows]);
            break;

        // Platform-wide counts (used by hero stats)
        case 'counts':
            echo json_encode([
                'success'    => true,
                'students'   => (int)$pdo->query("SELECT COUNT(*) FROM Students")->fetchColumn(),
                'theses'     => (int)$pdo->query("SELECT COUNT(*) FROM Projects_Thesis")->fetchColumn(),
                'supervisors'=> (int)$pdo->query("SELECT COUNT(*) FROM Faculty")->fetchColumn(),
                'open_slots' => (int)$pdo->query("
                    SELECT COALESCE(SUM(quota - current_student_count), 0)
                    FROM   Faculty
                    WHERE  quota > current_student_count
                ")->fetchColumn(),
            ]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'type must be supervisors, internships, alumni, or counts']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
