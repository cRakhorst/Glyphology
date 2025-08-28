<?php
require_once __DIR__ . '/../../src/classes/autoloader.php';

header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User must be logged in']);
    exit;
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['glyph_id'])) {
    echo json_encode(['success' => false, 'message' => 'Glyph ID is required']);
    exit;
}

$userId = $_SESSION['user_id'];
$glyphId = $data['glyph_id'];

$result = Database::toggleGlyphFavorite($userId, $glyphId);
echo json_encode($result);
