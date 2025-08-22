<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../src/classes/autoloader.php';
header('Content-Type: application/json');
$logDir = realpath(__DIR__ . '/../../logs');
if ($logDir && is_dir($logDir) && is_writable($logDir)) {
    ini_set('error_log', $logDir . '/fetch-glyph-position.log');
}

try {
    $position = isset($_GET['position']) ? (int)$_GET['position'] : 0;
    error_log("[get-glyph-from-position.php] Starting request for position: $position");
    
    error_log("[get-glyph-from-position.php] Log directory set to: " . $logDir);
    
    $glyphs = Database::getGlyphFromTopPosition($position);
    error_log("[get-glyph-from-position.php] Result from getGlyphFromTopPosition: " . print_r($glyphs, true));

    if (!$glyphs) {
        error_log("[get-glyph-from-position.php] No glyphs found for position $position");
        echo json_encode([
            'success' => false,
            'message' => 'No glyphs found'
        ]);
        exit;
    }

    $response = [
        'success' => true,
        'glyph_id' => $glyphs['glyph_id'],
        'title' => $glyphs['title'],
        'description' => $glyphs['description'],
        'username' => $glyphs['username'],
        'likes' => (int)$glyphs['likes'],
        'components' => $glyphs['components']
    ];
    error_log("[get-glyph-from-position.php] Sending response: " . print_r($response, true));
    echo json_encode($response);

} catch (Exception $e) {
    error_log("[get-glyph-from-position.php] Error: " . $e->getMessage());
    error_log("[get-glyph-from-position.php] Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching glyphs: ' . $e->getMessage()
    ]);
}