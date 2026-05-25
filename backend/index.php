<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Database Configuration
$host = 'localhost';
$db   = 'varsity_db';
$user = 'root'; // Default XAMPP/WAMP user
$pass = '';     // Default XAMPP password is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // 1. Establish Connection
    $pdo = new PDO($dsn, $user, $pass, $options);

    // 2. Execute Query
    $stmt = $pdo->query("SELECT * FROM `students` LIMIT 100");
    $students = $stmt->fetchAll();

    // 3. Send Success Response
    echo json_encode([
        "status" => "success",
        "count" => count($students),
        "data" => $students
    ]);

} catch (\PDOException $e) {
    // 4. Handle Connection Errors
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
}
?>