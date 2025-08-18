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
    ini_set('error_log', $logDir . '/login.log');
}


try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method: ' . $_SERVER['REQUEST_METHOD']);
        error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    }

    // Ondersteun zowel FormData als JSON
    $username = '';
    $password = '';

    if (!empty($_POST)) {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
    } else {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
    }

    $result = Database::login($username, $password);

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'request_method' => $_SERVER['REQUEST_METHOD']
    ]);
    error_log("Error: " . $e->getMessage());
}
