<?php
// ============================================================
// EduMatch — Update Supervisor Capacity
// POST /backend/update_capacity.php
//      Body: { faculty_id, quota }
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

$data       = json_decode(file_get_contents("php://input"), true);
$faculty_id = (int)($data['faculty_id'] ?? 0);
$quota      = (int)($data['quota']      ?? 0);

if (!$faculty_id || $quota < 1) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "faculty_id and quota (minimum 1) are required."]);
    exit();
}

// Quota cannot be set below the current number of assigned students
try {
    $pdo = getDB();

    $curr = $pdo->prepare("SELECT current_student_count FROM Faculty WHERE faculty_id = :fid");
    $curr->execute([':fid' => $faculty_id]);
    $row = $curr->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Faculty record not found."]);
        exit();
    }

    if ($quota < (int)$row['current_student_count']) {
        http_response_code(422);
        echo json_encode([
            "success" => false,
            "message" => "Quota cannot be lower than current student count ({$row['current_student_count']}).",
        ]);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE Faculty SET quota = :quota WHERE faculty_id = :fid");
    $stmt->execute([':quota' => $quota, ':fid' => $faculty_id]);

    echo json_encode(["success" => true, "message" => "Capacity updated to {$quota}."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
