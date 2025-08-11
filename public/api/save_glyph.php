<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../src/classes/autoloader.php';

// Check of gebruiker ingelogd is
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Lees POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// Extraheer data
$title = isset($input['title']) ? trim($input['title']) : '';
$description = isset($input['description']) ? trim($input['description']) : '';
$components = isset($input['components']) ? $input['components'] : [];

// Roep Database klasse aan
$result = Database::saveCustomGlyph($title, $description, $components, $user_id);

// Return JSON response
echo json_encode($result);
?>