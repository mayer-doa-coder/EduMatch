<?php
// ============================================================
// EduMatch — Interview Scheduling Endpoint
//
// GET  ?student_id=N            → list all booked interviews for student
// POST body JSON:
//   { action:"book",   student_id, internship_id, slot_datetime }
//   { action:"cancel", student_id, interview_id }
//
// slot_datetime must arrive as "YYYY-MM-DD HH:MM:SS" (MySQL datetime).
// The frontend sends ISO date + time slot, e.g. "2026-06-02 09:00:00".
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

try {
    $pdo = getDB();

    // ── POST: book or cancel ───────────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data          = json_decode(file_get_contents("php://input"), true) ?? [];
        $action        = trim($data['action']        ?? 'book');
        $student_id    = (int)($data['student_id']   ?? 0);
        $internship_id = (int)($data['internship_id'] ?? 0);
        $slot_datetime = trim($data['slot_datetime'] ?? '');
        $interview_id  = (int)($data['interview_id'] ?? 0);

        if (!$student_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "student_id is required."]);
            exit();
        }

        // ── Cancel ─────────────────────────────────────────────────────────
        if ($action === 'cancel') {
            if (!$interview_id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "interview_id is required to cancel."]);
                exit();
            }
            $upd = $pdo->prepare("
                UPDATE Interviews
                SET    status = 'cancelled'
                WHERE  interview_id = :iid AND student_id = :sid
            ");
            $upd->execute([':iid' => $interview_id, ':sid' => $student_id]);
            if ($upd->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Interview not found or already cancelled."]);
                exit();
            }
            echo json_encode(["success" => true, "message" => "Interview cancelled."]);
            exit();
        }

        // ── Book ───────────────────────────────────────────────────────────
        if (empty($slot_datetime) || !$internship_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "slot_datetime and internship_id are required."]);
            exit();
        }

        // Guard: internship_id must belong to an Application by this student
        $app_chk = $pdo->prepare("
            SELECT EXISTS(
                SELECT 1 FROM Applications
                WHERE student_id    = :sid
                  AND internship_id = :iid
            ) AS has_app
        ");
        $app_chk->execute([':sid' => $student_id, ':iid' => $internship_id]);
        if ((int)$app_chk->fetch()['has_app'] === 0) {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "You can only schedule interviews for internships you have applied to."]);
            exit();
        }

        // Guard: no double-booking the same slot globally
        $clash = $pdo->prepare("
            SELECT interview_id FROM Interviews
            WHERE  slot_datetime = :slot AND status = 'scheduled'
        ");
        $clash->execute([':slot' => $slot_datetime]);
        if ($clash->fetch()) {
            echo json_encode(["success" => false, "message" => "This time slot is already taken. Please choose another."]);
            exit();
        }

        // Guard: student already has a scheduled interview for this internship
        $dup = $pdo->prepare("
            SELECT interview_id FROM Interviews
            WHERE  student_id    = :sid
              AND  internship_id = :iid
              AND  status        = 'scheduled'
        ");
        $dup->execute([':sid' => $student_id, ':iid' => $internship_id]);
        if ($dup->fetch()) {
            echo json_encode(["success" => false, "message" => "You already have a scheduled interview for this position. Cancel the existing one first."]);
            exit();
        }

        $ins = $pdo->prepare("
            INSERT INTO Interviews (student_id, internship_id, slot_datetime, status)
            VALUES (:sid, :iid, :slot, 'scheduled')
        ");
        $ins->execute([':sid' => $student_id, ':iid' => $internship_id, ':slot' => $slot_datetime]);

        http_response_code(201);
        echo json_encode([
            "success"      => true,
            "message"      => "Interview scheduled successfully.",
            "interview_id" => (int)$pdo->lastInsertId(),
        ]);

    // ── GET: list student's interviews ────────────────────────────────────
    } else {
        $student_id = (int)($_GET['student_id'] ?? 0);
        if (!$student_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "student_id is required."]);
            exit();
        }

        $stmt = $pdo->prepare("
            SELECT iv.interview_id,
                   iv.internship_id,
                   iv.slot_datetime,
                   iv.status,
                   i.role_title,
                   i.company_name,
                   i.salary,
                   i.deadline
            FROM   Interviews iv
            INNER  JOIN Internships i ON iv.internship_id = i.internship_id
            WHERE  iv.student_id = :sid
            ORDER  BY iv.slot_datetime ASC
        ");
        $stmt->execute([':sid' => $student_id]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['interview_id']  = (int)$r['interview_id'];
            $r['internship_id'] = (int)$r['internship_id'];
        }
        unset($r);

        echo json_encode(["success" => true, "interviews" => $rows]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
