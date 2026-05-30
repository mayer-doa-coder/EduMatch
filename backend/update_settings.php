<?php
// ============================================================
// EduMatch — User Settings Update Endpoint
// POST /backend/update_settings.php
//      action=update_password  { user_id, current_password, new_password }
//      action=update_profile   { user_id, name }
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/lib/db.php';

$data    = json_decode(file_get_contents("php://input"), true);
$user_id = (int)($data['user_id'] ?? 0);
$action  = trim($data['action']   ?? '');

if (!$user_id || !$action) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "user_id and action are required."]);
    exit();
}

try {
    $pdo = getDB();

    // ── Change password ───────────────────────────────────────────────────
    if ($action === 'update_password') {
        $current_pw = $data['current_password'] ?? '';
        $new_pw     = $data['new_password']     ?? '';

        if (empty($current_pw) || empty($new_pw)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Both current and new password are required."]);
            exit();
        }
        if (strlen($new_pw) < 6) {
            http_response_code(422);
            echo json_encode(["success" => false, "message" => "New password must be at least 6 characters."]);
            exit();
        }

        $row = $pdo->prepare("SELECT password_hash FROM Users WHERE user_id = :uid");
        $row->execute([':uid' => $user_id]);
        $user = $row->fetch();

        if (!$user || !password_verify($current_pw, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Current password is incorrect."]);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE Users SET password_hash = :hash WHERE user_id = :uid");
        $stmt->execute([':hash' => password_hash($new_pw, PASSWORD_BCRYPT), ':uid' => $user_id]);

        echo json_encode(["success" => true, "message" => "Password updated successfully."]);

    // ── Update display name ───────────────────────────────────────────────
    } elseif ($action === 'update_profile') {
        $name = trim($data['name'] ?? '');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Name cannot be empty."]);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE Users SET name = :name WHERE user_id = :uid");
        $stmt->execute([':name' => $name, ':uid' => $user_id]);

        echo json_encode(["success" => true, "message" => "Profile updated.", "name" => $name]);

    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Unknown action."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
