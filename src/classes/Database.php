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
            $_SESSION['username'] = $username;

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
            $_SESSION['username'] = $username;

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

    public static function saveCustomGlyph($title, $description, $components, $userId)
    {
        $logDir = realpath(__DIR__ . '/../../logs');
        if ($logDir && is_dir($logDir) && is_writable($logDir)) {
            ini_set('error_log', $logDir . '/save_glyph.log');
        }

        try {
            $conn = self::connect();
            $conn->beginTransaction();

            error_log("=== SaveCustomGlyph START ===");
            error_log("UserID: $userId | Title: $title | Description: $description");

            // step 1 - Validate userId
            $stmt = $conn->prepare("SELECT COUNT(*) FROM glyph_users WHERE user_id = ?");
            $stmt->execute([$userId]);
            if ($stmt->fetchColumn() == 0) {
                throw new Exception("Invalid userId: $userId (not found in glyph_users)");
            }

            // step 2 - Insert glyph_custom
            $stmt = $conn->prepare("
            INSERT INTO glyph_custom (title, description, glyph_users_user_id, likes) 
            VALUES (?, ?, ?, 0)
        ");
            $stmt->execute([$title, $description, $userId]);
            $glyph_id = (int)$conn->lastInsertId();

            if ($glyph_id <= 0) {
                throw new Exception("Failed to insert glyph_custom (no glyph_id returned)");
            }
            error_log("Inserted glyph_custom: glyph_id=$glyph_id");

            // step 3 - Insert components
            $component_ids = [];
            foreach ($components as $component) {
                if (!isset($component['type'], $component['size'], $component['coordinates'])) {
                    throw new Exception("Invalid component data: " . json_encode($component));
                }

                $stmt = $conn->prepare("
                INSERT INTO glyph_components (type, size, coordinates) 
                VALUES (?, ?, ?)
            ");
                $stmt->execute([
                    $component['type'],
                    $component['size'],
                    $component['coordinates']
                ]);

                $cid = (int)$conn->lastInsertId();
                if ($cid <= 0) {
                    throw new Exception("Failed to insert glyph_component: " . json_encode($component));
                }

                $component_ids[] = $cid;
                error_log("Inserted glyph_component: id=$cid | type={$component['type']} | size={$component['size']} | coords={$component['coordinates']}");
            }

            // step 4 - Link glyph_custom to glyph_components
            foreach ($component_ids as $cid) {
                error_log("Linking glyph_id=$glyph_id to component_id=$cid");

                $stmt = $conn->prepare("
                INSERT INTO glyph_custom_has_components (glyph_custom_glyph_id, glyph_components_component_id) 
                VALUES (?, ?)
            ");
                $stmt->execute([$glyph_id, $cid]);
            }

            $conn->commit();
            error_log("SaveCustomGlyph SUCCESS: glyph_id=$glyph_id with " . count($component_ids) . " components");
            error_log("=== SaveCustomGlyph END ===");

            return [
                'success' => true,
                'glyph_id' => $glyph_id,
                'message' => 'Glyph successfully saved'
            ];
        } catch (Exception $e) {
            if ($conn && $conn->inTransaction()) {
                $conn->rollBack();
            }
            error_log("SaveCustomGlyph ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Database error while saving: ' . $e->getMessage()
            ];
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

    public static function getLatestGlyph()
    {
        $logDir = realpath(__DIR__ . '/../../logs');
        if ($logDir && is_dir($logDir) && is_writable($logDir)) {
            ini_set('error_log', $logDir . '/show_latest_glyph.log');
        }
        try {
            $conn = self::connect();

            // Debug: Check if there are any records
            $countStmt = $conn->prepare("SELECT COUNT(*) as count FROM glyph_custom");
            $countStmt->execute();
            $count = $countStmt->fetch(PDO::FETCH_ASSOC);
            error_log("Total records in glyph_custom: " . $count['count']);

            $stmt = $conn->prepare("
            SELECT gc.*, gu.username 
            FROM glyph_custom gc 
            LEFT JOIN glyph_users gu ON gc.glyph_users_user_id = gu.user_id 
            ORDER BY gc.glyph_id DESC 
            LIMIT 1
        ");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            error_log("Query result: " . print_r($result, true));
            return $result;
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return null;
        }
    }

    public static function getGlyphById($glyphId)
    {
        $logDir = realpath(__DIR__ . '/../../logs');
        if ($logDir && is_dir($logDir) && is_writable($logDir)) {
            ini_set('error_log', $logDir . '/get_glyph_by_id.log');
        }

        try {
            $conn = self::connect();

            $stmt = $conn->prepare("
            SELECT gc.*, gu.username 
            FROM glyph_custom gc 
            LEFT JOIN glyph_users gu ON gc.glyph_users_user_id = gu.user_id 
            WHERE gc.glyph_id = ?
        ");
            $stmt->execute([$glyphId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            error_log("getGlyphById($glyphId) result: " . print_r($result, true));
            return $result;
        } catch (PDOException $e) {
            error_log("Database error in getGlyphById: " . $e->getMessage());
            return null;
        }
    }

    public static function getGlyphLikes($glyphId)
    {
        try {
            $conn = self::connect();
            $stmt = $conn->prepare("SELECT likes FROM glyph_custom WHERE glyph_id = ?");
            $stmt->execute([$glyphId]);
            return (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            return 0;
        }
    }

    public static function hasUserFavoritedGlyph($userId, $glyphId)
    {
        try {
            $conn = self::connect();
            $stmt = $conn->prepare("SELECT 1 FROM glyph_user_has_favorite_glyphs WHERE glyph_users_user_id = ? AND glyph_custom_glyph_id = ?");
            $stmt->execute([$userId, $glyphId]);
            return $stmt->fetch() !== false;
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function toggleGlyphFavorite($userId, $glyphId)
    {
        try {
            $conn = self::connect();
            $conn->beginTransaction();

            // Check if the user has already favorited this glyph
            $stmt = $conn->prepare('SELECT 1 FROM glyph_user_has_favorite_glyphs WHERE glyph_users_user_id = ? AND glyph_custom_glyph_id = ?');
            $stmt->execute([$userId, $glyphId]);
            $favorite = $stmt->fetch();

            if ($favorite) {
                // Remove favorite
                $stmt = $conn->prepare('DELETE FROM glyph_user_has_favorite_glyphs WHERE glyph_users_user_id = ? AND glyph_custom_glyph_id = ?');
                $stmt->execute([$userId, $glyphId]);

                // Decrease likes count
                $stmt = $conn->prepare('UPDATE glyph_custom SET likes = likes - 1 WHERE glyph_id = ?');
                $stmt->execute([$glyphId]);
                $action = 'removed';
            } else {
                // Add favorite
                $stmt = $conn->prepare('INSERT INTO glyph_user_has_favorite_glyphs (glyph_users_user_id, glyph_custom_glyph_id) VALUES (?, ?)');
                $stmt->execute([$userId, $glyphId]);

                // Increase likes count
                $stmt = $conn->prepare('UPDATE glyph_custom SET likes = likes + 1 WHERE glyph_id = ?');
                $stmt->execute([$glyphId]);
                $action = 'added';
            }

            // Get updated likes count
            $stmt = $conn->prepare('SELECT likes FROM glyph_custom WHERE glyph_id = ?');
            $stmt->execute([$glyphId]);
            $likes = $stmt->fetch(PDO::FETCH_ASSOC)['likes'];

            $conn->commit();

            return [
                'success' => true,
                'likes_count' => $likes,
                'action' => $action
            ];
        } catch (Exception $e) {
            if ($conn && $conn->inTransaction()) {
                $conn->rollBack();
            }
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        }
    }

    public static function getGlyphFromTopPosition($position)
    {
        $logDir = realpath(__DIR__ . '/../../logs');
        if ($logDir && is_dir($logDir) && is_writable($logDir)) {
            ini_set('error_log', $logDir . '/get_glyph_by_position.log');
        }

        error_log("[Database] getGlyphFromTopPosition called with position: $position");

        try {
            $conn = self::connect();
            error_log("[Database] Database connection established");

            // First get the glyph ID at the specified position
            $query = "
                SELECT glyph_id 
                FROM glyph_custom
                ORDER BY likes DESC, glyph_id ASC
                LIMIT 1 OFFSET " . intval($position);
            error_log("[Database] Executing query: " . $query);
            $stmt = $conn->query($query);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            error_log("[Database] Initial query result: " . print_r($result, true));

            if (!$result) {
                error_log("[Database] No glyph found at position $position");
                return null;
            }

            // Use existing functions to get the full glyph data
            error_log("[Database] Getting full glyph data for ID: " . $result['glyph_id']);

            $glyph = self::getGlyphById($result['glyph_id']);
            error_log("[Database] getGlyphById result: " . print_r($glyph, true));

            $components = self::getGlyphComponents($result['glyph_id']);
            error_log("[Database] getGlyphComponents result: " . print_r($components, true));

            if (!$glyph) {
                error_log("[Database] Failed to get glyph data for ID: " . $result['glyph_id']);
                return null;
            }

            // Add components to the glyph data
            $glyph['components'] = $components;

            error_log("[Database] Returning complete glyph data: " . print_r($glyph, true));
            return $glyph;
        } catch (PDOException $e) {
            error_log("[Database] PDOException in getGlyphFromTopPosition: " . $e->getMessage());
            error_log("[Database] Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    public static function getTotalGlyphCount()
    {
        try {
            $conn = self::connect();
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM glyph_custom");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['total'];
        } catch (PDOException $e) {
            error_log("Database error in getTotalGlyphCount: " . $e->getMessage());
            return 0;
        }
    }

    public static function getUserFavoriteGlyphs($userId)
    {
        try {
            $conn = self::connect();
            $stmt = $conn->prepare("
                SELECT gc.*, gu.username 
                FROM glyph_user_has_favorite_glyphs gufg
                JOIN glyph_custom gc ON gufg.glyph_custom_glyph_id = gc.glyph_id
                LEFT JOIN glyph_users gu ON gc.glyph_users_user_id = gu.user_id
                WHERE gufg.glyph_users_user_id = ?
                ORDER BY gc.likes DESC, gc.glyph_id ASC
            ");
            $stmt->execute([$userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
}
