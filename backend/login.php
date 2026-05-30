<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/lib/db.php';

$input_data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($input_data['email']) || empty($input_data['password']) || empty($input_data['role'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Malformed submission payload parameters missing."
    ]);
    exit();
}

$email = trim($input_data['email']);
$password = $input_data['password'];
$role = strtolower(trim($input_data['role'])); 

if ($role === 'supervisor') {
    $role = 'faculty';
}

try {
    $pdo = getDB();

    // 1. Authenticate against central core entries
    $query = "SELECT user_id, name, email, password_hash, role FROM Users WHERE email = :email AND role = :role LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':email' => $email,
        ':role'  => $role
    ]);
    $userRecord = $stmt->fetch();

    // 2. Cryptographic matching verification step 
    if ($userRecord && password_verify($password, $userRecord['password_hash'])) {
        
        $profile_id = null;
        $userId = (int)$userRecord['user_id'];

        // 3. Resolve role-based sub-profile parameters for React state distribution
        if ($role === 'student') {
            $subStmt = $pdo->prepare("SELECT student_id FROM Students WHERE user_id = :uid LIMIT 1");
            $subStmt->execute([':uid' => $userId]);
            $subRow = $subStmt->fetch();
            $profile_id = $subRow ? (int)$subRow['student_id'] : null;
        } else if ($role === 'faculty') {
            $subStmt = $pdo->prepare("SELECT faculty_id FROM Faculty WHERE user_id = :uid LIMIT 1");
            $subStmt->execute([':uid' => $userId]);
            $subRow = $subStmt->fetch();
            $profile_id = $subRow ? (int)$subRow['faculty_id'] : null;
        } else if ($role === 'alumni') {
            $subStmt = $pdo->prepare("SELECT alumni_id FROM Alumni_Mentors WHERE user_id = :uid LIMIT 1");
            $subStmt->execute([':uid' => $userId]);
            $subRow = $subStmt->fetch();
            $profile_id = $subRow ? (int)$subRow['alumni_id'] : null;
        }

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Welcome back to your ecosystem dashboard workspace!",
            "user" => [
                "user_id"    => $userId,
                "profile_id" => $profile_id,
                "name"       => $userRecord['name'],
                "email"      => $userRecord['email'],
                "role"       => $role
            ]
        ]);
        
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "The credentials provided do not match our records for a " . ucfirst($role) . "."
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Ecosystem internal secure server operation encountered an error.",
        "error" => $e->getMessage() 
    ]);
}
?>