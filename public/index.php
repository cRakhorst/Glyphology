<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

require_once __DIR__ . '/../src/classes/autoloader.php';
include __DIR__ . '/../src/classes/Database.php';
include __DIR__ . '/../src/classes/functions.php';
include __DIR__ . '/../src/classes/LogReset.php';

use Classes\LogReset;

$reset = new LogReset(__DIR__ . '/../logs');
$reset->reset(); // <-- always call it, it handles "skip" internally


$routes = [
    'home' => 'home.php',
    '404' => '404.php',
    'login' => 'login.php',
    'create' => 'create.php',
    'glyphs' => 'glyphs.php',
    'admin' => 'admin.php',
    'glyph' => 'show-glyph.php',
    'favorite-glyphs' => 'favorite-glyphs.php',
];

$db = new Database();

$baseDir = dirname($_SERVER['SCRIPT_NAME']);
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Fix the variable name typo: $basedir should be $baseDir
if ($baseDir !== '/' && strpos($path, $baseDir) === 0) {
    $path = substr($path, strlen($baseDir));
}

// block API calls from going through the view router
if (strpos($path, 'api/') === 0) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Invalid API access"]);
    exit;
}

$path = trim($path, '/');
$parts = explode('/', $path);
$page = $parts[0] ?? '';

// Handle empty page or index.php
if ($page === '' || $page === 'index.php') {
    $page = 'home';
}

// Check if this is a glyph detail page (glyph/{id})
if ($page === 'glyph') {
    if (isset($parts[1]) && is_numeric($parts[1])) {
        $glyphId = (int)$parts[1];
        // Check if the glyph exists in the database
        $glyph = Database::getGlyphById($glyphId);
        if ($glyph) {
            $viewFile = $routes['glyph'];
        } else {
            // If glyph doesn't exist in database, show 404
            $viewFile = '404.php';
        }
    } else {
        $viewFile = 'top-glyphs.php';
    }
} else {
    $viewFile = $routes[$page] ?? '404.php';
}

require_once __DIR__ . '/../src/views/' . $viewFile;
