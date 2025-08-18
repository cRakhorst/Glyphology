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
    ini_set('error_log', $logDir . '/register.log');
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
        error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    }

    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    $result = Database::register($username, $password, $confirm_password);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    error_log("Error: " . $e->getMessage());
}
