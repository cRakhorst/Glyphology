<?php

class Database
{
    private static function connect()
    {
        $conn = null;
        $servername = "127.0.0.1";
        $username = "glyph_account";
        $password = "password123";
        $dbname = "klas4s24_599903";
        try {
            $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (PDOException $e) {
            throw new PDOException("Connection failed: " . $e->getMessage());
        }
    }

    public static function register($username, $password, $confirm_password)
    {
        if (!isset($username) || !isset($password) || !isset($confirm_password)) {
            return ["success" => false, "message" => "Missing required fields"];
        }

        try {
            self::registerValidation($username, $password, $confirm_password);
        } catch (Exception $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }

        try {
            $conn = self::connect();

            $stmt = $conn->prepare("SELECT user_id FROM glyph_users WHERE username = ?");
            $stmt->execute([$username]);
            if ($stmt->rowCount() > 0) {
                return ["success" => false, "message" => "Username already exists"];
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO glyph_users (username, password) VALUES (?, ?)");
            $stmt->execute([$username, $hashedPassword]);

            $_SESSION['user_id'] = $conn->lastInsertId();

            return ["success" => true, "message" => "Registration successful"];
        } catch (PDOException $e) {
            return ["success" => false, "message" => "Registration failed: " . $e->getMessage()];
        }
    }

    public static function login($username, $password)
    {
        if (empty($username) || empty($password)) {
            return ["success" => false, "message" => "Username and password are required"];
        }

        try {
            $conn = self::connect();
            $stmt = $conn->prepare("SELECT user_id, password FROM glyph_users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($password, $user['password'])) {
                return ["success" => false, "message" => "Invalid username or password"];
            }

            $_SESSION['user_id'] = $user['user_id'];

            return ["success" => true, "user_id" => $user['user_id']];
        } catch (PDOException $e) {
            return ["success" => false, "message" => "Login failed: " . $e->getMessage()];
        }
    }

    private static function registerValidation($username, $password, $confirm_password)
    {
        if (empty($username) || empty($password) || empty($confirm_password)) {
            throw new Exception("All fields are required.");
        }
        if ($password !== $confirm_password) {
            throw new Exception("Passwords do not match.");
        }
        if (strlen($username) < 3 || strlen($username) > 20) {
            throw new Exception("Username must be between 3 and 20 characters.");
        }
        if (strlen($password) < 6) {
            throw new Exception("Password must be at least 6 characters long.");
        }
    }

    public static function getUserById($userId)
    {
        $conn = self::connect();
        $stmt = $conn->prepare("SELECT * FROM glyph_users WHERE user_id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function getCustomComboById($comboId)
    {
        $conn = self::connect();
        $stmt = $conn->prepare("SELECT * FROM glyph_combo_custom WHERE custom_combo_id = ?");
        $stmt->execute([$comboId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function showGlyphComboComponents($comboId)
    {
        $conn = self::connect();

        $stmt = $conn->prepare("SELECT gcc.component_id, gcc.type, gcc.size, gcc.coordinates
        FROM glyph_combo_custom_has_components gchc
        JOIN glyph_combo_components gcc ON gcc.component_id = gchc.glyph_combo_components_component_id
        WHERE gchc.glyph_combo_custom_custom_combo_id = ?
    ");
        $stmt->execute([$comboId]);
        $components = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "<canvas id='glyph-canvas' width='300' height='300'></canvas>";

        // Geef JSON data mee aan JS
        echo "<script>
        const glyphComponents = " . json_encode($components) . ";
    </script>";
    }

    public static function saveCustomGlyph($title, $description, $components, $userId)
    {
        // Validatie
        if (empty($title) || empty($description) || empty($components) || empty($userId)) {
            return ["success" => false, "message" => "Missing required fields"];
        }

        if (strlen($title) > 255 || strlen($description) > 255) {
            return ["success" => false, "message" => "Title or description too long"];
        }

        if (!is_array($components) || count($components) === 0) {
            return ["success" => false, "message" => "No components to save"];
        }

        try {
            $conn = self::connect();
            $conn->beginTransaction();

            // 1. Sla custom glyph op
            $stmt = $conn->prepare("INSERT INTO glyph_custom (title, description, glyph_users_user_id) VALUES (?, ?, ?)");
            $stmt->execute([$title, $description, $userId]);
            $glyph_id = $conn->lastInsertId();

            // 2. Sla componenten op
            $component_ids = [];
            foreach ($components as $component) {
                // Valideer component data
                if (!isset($component['type']) || !isset($component['size']) || !isset($component['coordinates'])) {
                    throw new Exception('Invalid component data');
                }

                $stmt = $conn->prepare("INSERT INTO glyph_components (type, size, coordinates) VALUES (?, ?, ?)");
                $stmt->execute([$component['type'], $component['size'], $component['coordinates']]);
                $component_ids[] = $conn->lastInsertId();
            }

            // 3. Koppel componenten aan glyph
            $stmt = $conn->prepare("INSERT INTO glyph_custom_has_components (glyph_custom_glyph_id, glyph_components_component_id) VALUES (?, ?)");
            foreach ($component_ids as $component_id) {
                $stmt->execute([$glyph_id, $component_id]);
            }

            $conn->commit();

            return [
                'success' => true,
                'glyph_id' => $glyph_id,
                'message' => 'Glyph successfully saved'
            ];
        } catch (Exception $e) {
            $conn->rollBack();
            error_log("Glyph save error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error while saving: ' . $e->getMessage()];
        }
    }

    public static function getCustomGlyphsByUser($userId)
    {
        try {
            $conn = self::connect();
            $stmt = $conn->prepare("SELECT * FROM glyph_custom WHERE glyph_users_user_id = ? ORDER BY glyph_id DESC");
            $stmt->execute([$userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }

    public static function getCustomGlyphById($glyphId)
    {
        try {
            $conn = self::connect();
            $stmt = $conn->prepare("SELECT * FROM glyph_custom WHERE glyph_id = ?");
            $stmt->execute([$glyphId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return null;
        }
    }

    public static function getGlyphComponents($glyphId)
    {
        try {
            $conn = self::connect();
            $stmt = $conn->prepare("SELECT gc.component_id, gc.type, gc.size, gc.coordinates
                FROM glyph_custom_has_components gchc
                JOIN glyph_components gc ON gc.component_id = gchc.glyph_components_component_id
                WHERE gchc.glyph_custom_glyph_id = ?
                ORDER BY gc.component_id
            ");
            $stmt->execute([$glyphId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
}
