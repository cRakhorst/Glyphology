<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../src/classes/autoloader.php';
header('Content-Type: application/json');

try {
    $totalCount = Database::getTotalGlyphCount();
    
    echo json_encode([
        'success' => true,
        'total_count' => $totalCount
    ]);

} catch (Exception $e) {
    error_log("Error getting total glyph count: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error getting total count: ' . $e->getMessage(),
        'total_count' => 0
    ]);
}
?>