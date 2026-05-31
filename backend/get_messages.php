<?php
// ============================================================
// EduMatch — Conversation History Endpoint
// GET /backend/get_messages.php?user1_id=X&user2_id=Y
//   → all messages between the two users, oldest-first
//
// Also supports GET ?user_id=X&role=supervisor|student
//   → recent inbox messages for the given user
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

$user1_id = (int)($_GET['user1_id'] ?? 0);
$user2_id = (int)($_GET['user2_id'] ?? 0);

if (!$user1_id || !$user2_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "user1_id and user2_id are required."]);
    exit();
}

try {
    $pdo  = getDB();
    $stmt = $pdo->prepare("
        SELECT m.message_id,
               m.sender_id,
               m.receiver_id,
               m.body,
               m.sent_at,
               u.name AS sender_name
        FROM   Messages m
        INNER  JOIN Users u ON m.sender_id = u.user_id
        WHERE  (m.sender_id = :u1 AND m.receiver_id = :u2)
           OR  (m.sender_id = :u2b AND m.receiver_id = :u1b)
        ORDER  BY m.sent_at ASC
        LIMIT  100
    ");
    $stmt->execute([':u1' => $user1_id, ':u2' => $user2_id, ':u2b' => $user2_id, ':u1b' => $user1_id]);
    $messages = $stmt->fetchAll();
    foreach ($messages as &$m) {
        $m['message_id']  = (int)$m['message_id'];
        $m['sender_id']   = (int)$m['sender_id'];
        $m['receiver_id'] = (int)$m['receiver_id'];
    }
    unset($m);

    echo json_encode([
        "success"  => true,
        "messages" => $messages,
        "count"    => count($messages),
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
