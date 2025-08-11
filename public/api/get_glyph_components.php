<?php
session_start();
header('Content-Type: application/json');

require_once '../src/classes/Database.php';

// Check login
if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

$glyph_id = isset($_GET['glyph_id']) ? intval($_GET['glyph_id']) : 0;

if ($glyph_id <= 0) {
    echo json_encode([]);
    exit;
}

// Verificeer dat de glyph van de ingelogde gebruiker is
$glyph = Database::getCustomGlyphById($glyph_id);
if (!$glyph || $glyph['glyph_users_user_id'] != $_SESSION['user_id']) {
    echo json_encode([]);
    exit;
}

// Haal componenten op
$components = Database::getGlyphComponents($glyph_id);
echo json_encode($components);
?>