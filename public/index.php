<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

require_once __DIR__ . '/../src/classes/autoloader.php';
include __DIR__ . '/../src/classes/Database.php';

$routes = [
 'home' => 'home.php',
 '404' => '404.php',
];

$baseDir = dirname($_SERVER['SCRIPT_NAME']);
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

if ($baseDir !== '/' && strpos($path, $baseDir) === 0) {
    $path = substr($baseDir, strlen($basedir));
}
$path = trim($path, '/');
$parts = explode('/', $path);
$page = $parts[0] ?? '';
if ($page === '' || $page === 'index.php') {
    $page = 'home';
}
$viewFile = $routes[$page] ?? '404.php';
require_once __DIR__ . '/../src/views/' . $viewFile;