<?php
// Establish loose permissions for local development communication across distinct origin ports
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Prevent OPTIONS preflight requests from halting execution execution loops
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'DBMS_project');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // Build real analytic counts mapped closely to the database structure you supplied
    $queries = [
        // 1. Total unique user student records registered
        "students_matched" => "SELECT COUNT(*) FROM Students",
        
        // 2. Total structural projects or thesis tracks running
        "theses_tracked"   => "SELECT COUNT(*) FROM Projects_Thesis",
        
        // 3. Count of available upskilling material loaded in platform
        "internships"      => "SELECT COUNT(*) FROM Courses", 
        
        // 4. Unique institutions connected
        "universities"     => "SELECT COUNT(*) FROM Universities"
    ];

    $response_data = [];

    foreach ($queries as $key => $sql) {
        $stmt = $pdo->query($sql);
        $response_data[$key] = (int)$stmt->fetchColumn();
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $response_data
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An internal relational data operation failure occurred.",
        "error" => $e->getMessage()
    ]);
}
?>