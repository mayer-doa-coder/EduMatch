<?php
// ============================================================
// EduMatch — Interview Scheduling Endpoint
// GET  /backend/interview.php?student_id=1       list booked slots
// POST /backend/interview.php                    book a new slot
//      Body: { student_id, slot_datetime, internship_id? }
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

try {
    $pdo = getDB();

    // ── POST: book a slot ──────────────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data          = json_decode(file_get_contents("php://input"), true);
        $student_id    = (int)($data['student_id']    ?? 0);
        $slot_datetime = trim($data['slot_datetime']  ?? '');
        $internship_id = (int)($data['internship_id'] ?? 0);

        if (!$student_id || empty($slot_datetime)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "student_id and slot_datetime are required."]);
            exit();
        }

        // Resolve internship_id: use provided one, or pick the first open internship
        if (!$internship_id) {
            $pick = $pdo->query("SELECT internship_id FROM Internships WHERE status = 'open' LIMIT 1")->fetch();
            $internship_id = $pick ? (int)$pick['internship_id'] : 0;
        }
        if (!$internship_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No open internships available to schedule against."]);
            exit();
        }

        // Prevent double-booking the same slot across all students
        $clash = $pdo->prepare("SELECT interview_id FROM Interviews WHERE slot_datetime = :slot AND status = 'scheduled'");
        $clash->execute([':slot' => $slot_datetime]);
        if ($clash->fetch()) {
            echo json_encode(["success" => false, "message" => "This slot is already taken. Please pick another."]);
            exit();
        }

        $ins = $pdo->prepare(
            "INSERT INTO Interviews (student_id, internship_id, slot_datetime, status)
             VALUES (:sid, :iid, :slot, 'scheduled')"
        );
        $ins->execute([':sid' => $student_id, ':iid' => $internship_id, ':slot' => $slot_datetime]);

        http_response_code(201);
        echo json_encode([
            "success"      => true,
            "message"      => "Interview scheduled successfully.",
            "interview_id" => (int)$pdo->lastInsertId(),
        ]);

    // ── GET: list a student's interviews ──────────────────────────────────
    } else {
        $student_id = (int)($_GET['student_id'] ?? 0);
        if (!$student_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "student_id is required."]);
            exit();
        }

        $stmt = $pdo->prepare("
            SELECT iv.interview_id,
                   iv.slot_datetime,
                   iv.status,
                   i.role_title,
                   i.company_name
            FROM   Interviews iv
            INNER  JOIN Internships i ON iv.internship_id = i.internship_id
            WHERE  iv.student_id = :sid
            ORDER  BY iv.slot_datetime ASC
        ");
        $stmt->execute([':sid' => $student_id]);

        echo json_encode(["success" => true, "interviews" => $stmt->fetchAll()]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
