<?php

class Database {
    private static function connect() {
        $conn = null;
        $servername = "localhost";
        $username = "glyph_account";
        $password = "password123";
        $dbname = "klas4s24_599903";
        try {
            $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
            exit();
        } finally {
            return $conn;
        }
    }
}