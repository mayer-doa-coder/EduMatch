<?php
// ============================================================
// EduMatch — Supervisor Blind-Review Action Endpoint
//
// POST /backend/supervisor_action.php
// Body JSON: {
//   faculty_id : int,
//   student_id : int,
//   decision   : "accepted" | "rejected" | "waitlisted"
// }
//
// Effects by decision:
//  accepted  → assigns supervisor, increments current_student_count,
//              sends acceptance message to student, logs review
//  rejected  → sends rejection message to student, logs review
//  waitlisted→ sends waitlist message to student, logs review
//
// After any decision the student disappears from v_blind_applicants
// for this supervisor (filtered by SupervisorReviews).
//
// GET /backend/supervisor_action.php?faculty_id=N
//  → returns { pending_count } (blind applicants not yet reviewed)
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

try {
    $pdo = getDB();

    // ── One-time safe migration: create SupervisorReviews table ──────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS SupervisorReviews (
            review_id   INT AUTO_INCREMENT PRIMARY KEY,
            faculty_id  INT NOT NULL,
            student_id  INT NOT NULL,
            decision    ENUM('accepted','rejected','waitlisted') NOT NULL,
            reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_fac_stu (faculty_id, student_id),
            FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id)
                ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES Students(student_id)
                ON UPDATE CASCADE ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");

    // ── GET: pending blind-applicant count ─────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $faculty_id = (int)($_GET['faculty_id'] ?? 0);
        if (!$faculty_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "faculty_id required."]);
            exit();
        }
        $cnt = $pdo->prepare("
            SELECT COUNT(*) AS pending_count
            FROM   v_blind_applicants v
            WHERE  v.university_id = (
                       SELECT uu.university_id FROM Users uu
                       WHERE  uu.user_id = (SELECT f2.user_id FROM Faculty f2 WHERE f2.faculty_id = :fid)
                   )
              AND  v.student_id NOT IN (
                       SELECT student_id FROM SupervisorReviews WHERE faculty_id = :fid2
                   )
        ");
        $cnt->execute([':fid' => $faculty_id, ':fid2' => $faculty_id]);
        echo json_encode(["success" => true, "pending_count" => (int)$cnt->fetch()['pending_count']]);
        exit();
    }

    // ── POST: record a review decision ─────────────────────────────────────
    $data       = json_decode(file_get_contents("php://input"), true) ?? [];
    $faculty_id = (int)($data['faculty_id'] ?? 0);
    $student_id = (int)($data['student_id'] ?? 0);
    $decision   = trim($data['decision'] ?? '');

    if (!$faculty_id || !$student_id || !in_array($decision, ['accepted', 'rejected', 'waitlisted'], true)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "faculty_id, student_id and a valid decision are required."]);
        exit();
    }

    // Prevent duplicate review
    $already = $pdo->prepare("
        SELECT review_id FROM SupervisorReviews
        WHERE faculty_id = :fid AND student_id = :sid
    ");
    $already->execute([':fid' => $faculty_id, ':sid' => $student_id]);
    if ($already->fetch()) {
        echo json_encode(["success" => false, "message" => "You have already reviewed this applicant."]);
        exit();
    }

    // Resolve supervisor's user_id (for sending messages).
    // Qualify every column so MySQL never sees an ambiguous name.
    $supRow = $pdo->prepare("
        SELECT f.user_id, f.research_focus
        FROM   Faculty f
        INNER  JOIN Users u ON u.user_id = f.user_id
        WHERE  f.faculty_id = :fid
    ");
    $supRow->execute([':fid' => $faculty_id]);
    $sup = $supRow->fetch();
    if (!$sup) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Faculty not found."]);
        exit();
    }
    $sup_user_id     = (int)$sup['user_id'];
    $research_focus  = $sup['research_focus'] ?? 'research';

    // Resolve student's user_id
    $stuRow = $pdo->prepare("SELECT user_id FROM Students WHERE student_id = :sid");
    $stuRow->execute([':sid' => $student_id]);
    $stu = $stuRow->fetch();
    if (!$stu) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Student not found."]);
        exit();
    }
    $stu_user_id = (int)$stu['user_id'];

    // ── Begin transaction ────────────────────────────────────────────────────
    $pdo->beginTransaction();

    // 1. Log the review
    $log = $pdo->prepare("
        INSERT INTO SupervisorReviews (faculty_id, student_id, decision)
        VALUES (:fid, :sid, :dec)
    ");
    $log->execute([':fid' => $faculty_id, ':sid' => $student_id, ':dec' => $decision]);

    // 2. Decision-specific database actions
    $message = '';

    if ($decision === 'accepted') {
        // Guard: check quota
        $quotaRow = $pdo->prepare("
            SELECT quota, current_student_count FROM Faculty WHERE faculty_id = :fid
        ");
        $quotaRow->execute([':fid' => $faculty_id]);
        $q = $quotaRow->fetch();
        if ((int)$q['current_student_count'] >= (int)$q['quota']) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "You have reached your student quota. Increase capacity first."]);
            exit();
        }

        // Assign supervisor
        $assign = $pdo->prepare("
            UPDATE Students SET assigned_supervisor_id = :fid WHERE student_id = :sid
        ");
        $assign->execute([':fid' => $faculty_id, ':sid' => $student_id]);

        // Increment count
        $inc = $pdo->prepare("
            UPDATE Faculty SET current_student_count = current_student_count + 1
            WHERE  faculty_id = :fid
        ");
        $inc->execute([':fid' => $faculty_id]);

        $message = "Congratulations! Your application to join the {$research_focus} research group has been accepted. Welcome aboard. Please reach out to schedule your first meeting.";

    } elseif ($decision === 'rejected') {
        $message = "Thank you for your interest in the {$research_focus} research group. After careful review, I am unable to accommodate your application at this time. I encourage you to explore other supervisors who may be a great fit.";

    } else { // waitlisted
        $message = "Thank you for applying to the {$research_focus} research group. You have been placed on my waitlist. I will contact you directly if a position opens up.";
    }

    // 3. Send notification message to student
    $msg = $pdo->prepare("
        INSERT INTO Messages (sender_id, receiver_id, body, sent_at)
        VALUES (:sender, :recv, :body, NOW())
    ");
    $msg->execute([
        ':sender' => $sup_user_id,
        ':recv'   => $stu_user_id,
        ':body'   => $message,
    ]);

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        "success"  => true,
        "decision" => $decision,
        "message"  => ucfirst($decision) . " action recorded and student notified.",
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
