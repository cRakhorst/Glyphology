<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../src/classes/autoloader.php';

try {
    // Extract glyph ID from URL (after the last /)
    $url = $_SERVER['REQUEST_URI'];
    $urlParts = explode('/', trim($url, '/'));
    $glyphId = end($urlParts);

    // Validate that we have a numeric ID
    if (!is_numeric($glyphId) || $glyphId <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid glyph ID'
        ]);
        exit;
    }

    // Get the specific glyph information
    $glyph = Database::getGlyphById($glyphId);

    if (!$glyph) {
        echo json_encode([
            'success' => false,
            'message' => 'Glyph not found'
        ]);
        exit;
    }

    // Get the components for this glyph
    $components = Database::getGlyphComponents($glyph['glyph_id']);

    // Return the glyph data with components
    echo json_encode([
        'success' => true,
        'glyph' => [
            'id' => $glyph['glyph_id'],
            'title' => $glyph['title'],
            'description' => $glyph['description'],
            'username' => $glyph['username'],
            'likes' => $glyph['likes'] ?? 0
        ],
        'components' => $components
    ]);
} catch (Exception $e) {
    // Log the error if logging is set up
    $logDir = realpath(__DIR__ . '/../../logs');
    if ($logDir && is_dir($logDir) && is_writable($logDir)) {
        error_log("API Error in show-glyph-from-id.php: " . $e->getMessage(), 3, $logDir . '/api_errors.log');
    }

    echo json_encode([
        'success' => false,
        'message' => 'Server error occurred'
    ]);
}
