<?php
// ============================================================
// EduMatch — Send Message Endpoint
// POST /backend/send_message.php
//      Body: { sender_id, receiver_id, body }
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

$data        = json_decode(file_get_contents("php://input"), true);
$sender_id   = (int)($data['sender_id']   ?? 0);
$receiver_id = (int)($data['receiver_id'] ?? 0);
$body        = trim($data['body']         ?? '');

if (!$sender_id || !$receiver_id || empty($body)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "sender_id, receiver_id, and body are required."]);
    exit();
}

if ($sender_id === $receiver_id) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Cannot send a message to yourself."]);
    exit();
}

try {
    $pdo  = getDB();
    $stmt = $pdo->prepare(
        "INSERT INTO Messages (sender_id, receiver_id, body) VALUES (:sid, :rid, :body)"
    );
    $stmt->execute([':sid' => $sender_id, ':rid' => $receiver_id, ':body' => $body]);

    echo json_encode([
        "success"    => true,
        "message_id" => (int)$pdo->lastInsertId(),
        "sent_at"    => date("Y-m-d H:i:s"),
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
