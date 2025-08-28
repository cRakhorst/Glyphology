<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../src/classes/autoloader.php';
header('Content-Type: application/json');
$logDir = realpath(__DIR__ . '../../logs/');
if ($logDir && is_dir($logDir) && is_writable($logDir)) {
    ini_set('error_log', $logDir . 'fetch-favorite-glyphs.log');
}

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not logged in');
    }

    $userId = (int)$_SESSION['user_id'];
    error_log("[get-favorite-glyphs.php] Fetching favorite glyphs for user ID: $userId");

    // Check if this is a request for total count only
    if (!isset($_GET['position'])) {
        // Return just the total count
        $favoriteGlyphs = Database::getUserFavoriteGlyphs($userId);
        if ($favoriteGlyphs === false || $favoriteGlyphs === []) {
            error_log("[get-favorite-glyphs.php] No favorite glyphs found or error occurred");
            $favoriteGlyphs = [];
        }

        echo json_encode([
            'success' => true,
            'total_count' => count($favoriteGlyphs),
            'favorite_glyphs' => $favoriteGlyphs
        ]);
        exit;
    }

    // Handle position-specific request
    $position = (int)$_GET['position'];
    error_log("[get-favorite-glyphs.php] Fetching glyph at position: $position");

    $favoriteGlyphs = Database::getUserFavoriteGlyphs($userId);
    if ($favoriteGlyphs === false || $favoriteGlyphs === []) {
        error_log("[get-favorite-glyphs.php] No favorite glyphs found or error occurred");
        $favoriteGlyphs = [];
    }

    error_log("[get-favorite-glyphs.php] Retrieved " . count($favoriteGlyphs) . " favorite glyphs");

    // Check if position exists
    if ($position < 0 || $position >= count($favoriteGlyphs)) {
        echo json_encode([
            'success' => false,
            'message' => 'Position out of range',
            'total_count' => count($favoriteGlyphs)
        ]);
        exit;
    }

    // Get the glyph at the specified position
    $glyph = $favoriteGlyphs[$position];
    $glyphId = $glyph['glyph_id'];

    error_log("[get-favorite-glyphs.php] Found glyph at position $position: ID $glyphId");

    // The glyph data already includes title, description, username from getUserFavoriteGlyphs
    // Now we just need to fetch the components
    $components = Database::getGlyphComponents($glyphId);
    if ($components === false) {
        error_log("[get-favorite-glyphs.php] Warning: No components found for glyph ID $glyphId");
        $components = [];
    }

    error_log("[get-favorite-glyphs.php] Found " . count($components) . " components for glyph ID $glyphId");

    // Check if user has favorited this glyph (should be true since it's in favorites)
    $isFavorited = Database::hasUserFavoritedGlyph($userId, $glyphId);

    // Get likes count from the glyph data (it's already included in getUserFavoriteGlyphs)
    $likesCount = (int)$glyph['likes'];

    echo json_encode([
        'success' => true,
        'glyph_id' => $glyphId,
        'title' => $glyph['title'] ?? '',
        'description' => $glyph['description'] ?? '',
        'username' => $glyph['username'] ?? '',
        'likes' => $likesCount,
        'is_favorited' => $isFavorited,
        'components' => $components,
        'total_count' => count($favoriteGlyphs)
    ]);
} catch (Exception $e) {
    error_log("[get-favorite-glyphs.php] Error: " . $e->getMessage());
    error_log("[get-favorite-glyphs.php] Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching favorite glyphs: ' . $e->getMessage(),
        'favorite_glyphs' => []
    ]);
}
