<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../src/classes/autoloader.php';
header('Content-Type: application/json');

try {
    $latestGlyph = Database::getLatestGlyph();
    
    if (!$latestGlyph) {
        echo json_encode([
            'success' => false,
            'message' => 'No glyph found'
        ]);
        exit;
    }
    
    $components = Database::getGlyphComponents($latestGlyph['glyph_id']);
    
    echo json_encode([
        'success' => true,
        'glyph' => $latestGlyph,
        'components' => $components
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching glyph data: ' . $e->getMessage()
    ]);
}