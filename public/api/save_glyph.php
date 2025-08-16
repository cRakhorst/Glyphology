<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once __DIR__ . '/../../src/classes/autoloader.php';

$logDir = realpath(__DIR__ . '/../../logs');
if ($logDir && is_dir($logDir) && is_writable($logDir)) {
    ini_set('error_log', $logDir . '/save_glyph.log');
}

// Add CORS headers if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Zet content type
header('Content-Type: application/json');

// Debug: Log the request method and session status
error_log("Request method: " . $_SERVER['REQUEST_METHOD'] . " on line 25");
error_log("Session ID: " . session_id() . " on line 26");
error_log("User ID in session: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'NOT SET') . " on line 27");

// Alleen POST requests toestaan
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed',
        'debug' => [
            'method' => $_SERVER['REQUEST_METHOD'],
            'session_id' => session_id(),
        ]
    ]);
    exit;
}

// Check of gebruiker ingelogd is
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Gebruiker niet ingelogd',
        'debug' => [
            'session_vars' => array_keys($_SESSION),
            'session_id' => session_id()
        ]
    ]);
    exit;
}

// Lees JSON input
$input = file_get_contents('php://input');
error_log("Raw input: " . $input);

$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Ongeldige JSON: ' . json_last_error_msg()
    ]);
    exit;
}

// Valideer input
if (!isset($data['title']) || !isset($data['description']) || !isset($data['components'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Ontbrekende velden',
        'received' => array_keys($data ?? [])
    ]);
    exit;
}

// Gebruik de user_id uit de sessie (veiliger dan uit de request)
$userId = $_SESSION['user_id'];
$title = trim($data['title']);
$description = trim($data['description']);
$components = $data['components'];

// Extra validatie
if (empty($title) || empty($description)) {
    echo json_encode(['success' => false, 'message' => 'Titel en beschrijving zijn verplicht']);
    exit;
}

if (strlen($title) > 30) {
    echo json_encode(['success' => false, 'message' => 'Titel mag maximaal 30 karakters zijn']);
    exit;
}

if (strlen($description) > 150) {
    echo json_encode(['success' => false, 'message' => 'Beschrijving mag maximaal 150 karakters zijn']);
    exit;
}

if (!is_array($components) || count($components) === 0) {
    echo json_encode(['success' => false, 'message' => 'Geen componenten om op te slaan']);
    exit;
}

// Valideer elk component
foreach ($components as $component) {
    if (!isset($component['type']) || !isset($component['size']) || !isset($component['coordinates'])) {
        echo json_encode(['success' => false, 'message' => 'Ongeldig component formaat']);
        exit;
    }

    // Valideer component types
    $allowedTypes = ['circle', 'line', 'curved_line'];
    if (!in_array($component['type'], $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Ongeldig component type']);
        exit;
    }
}

// Probeer op te slaan via Database klasse
try {
    $result = Database::saveCustomGlyph($title, $description, $components, $userId);

    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'message' => 'Glyph succesvol opgeslagen',
            'glyph_id' => $result['glyph_id']
        ]);
    } else {
        echo json_encode($result);
    }
} catch (Exception $e) {
    error_log("Save glyph error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Er is een fout opgetreden bij het opslaan']);
}
