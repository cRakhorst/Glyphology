<?php
/**
 * Log Reset Script
 * Clears all log files in the logs directory every 48 hours
 */

class LogReset 
{
    private $logDir;
    private $lockFile;
    private $lastResetFile;
    
    public function __construct() 
    {
        // Set the logs directory path (go up 2 levels from src/classes to root, then to logs)
        $this->logDir = __DIR__ . '/../../logs';
        $this->lockFile = $this->logDir . '/.reset_lock';
        $this->lastResetFile = $this->logDir . '/.last_reset';
        
        // Create logs directory if it doesn't exist
        if (!is_dir($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
    }
    
    public function shouldReset()
    {
        // Check if lock file exists (script is already running)
        if (file_exists($this->lockFile)) {
            return false;
        }
        
        // Check when the last reset occurred
        if (!file_exists($this->lastResetFile)) {
            return true; // First run
        }
        
        $lastReset = (int)file_get_contents($this->lastResetFile);
        $timeDiff = time() - $lastReset;
        
        // 48 hours = 48 * 60 * 60 = 172800 seconds
        return $timeDiff >= 172800;
    }
    
    public function resetLogs()
    {
        try {
            // Create lock file
            file_put_contents($this->lockFile, time());
            
            $this->log("Starting log reset process...");
            
            // Get all .log files in the logs directory
            $logFiles = glob($this->logDir . '/*.log');
            
            if (empty($logFiles)) {
                $this->log("No log files found to reset.");
                return true;
            }
            
            $resetCount = 0;
            $failedFiles = [];
            
            foreach ($logFiles as $logFile) {
                $filename = basename($logFile);
                $this->log("Attempting to reset: $filename");
                
                if (!file_exists($logFile)) {
                    $this->log("File doesn't exist: $filename");
                    continue;
                }
                
                if (!is_writable($logFile)) {
                    $failedFiles[] = "$filename (not writable)";
                    $this->log("File not writable: $filename");
                    continue;
                }
                
                // Try multiple methods to clear the file
                $resetSuccess = false;
                
                // Method 1: Using ftruncate with file locking
                $handle = fopen($logFile, 'r+');
                if ($handle) {
                    if (flock($handle, LOCK_EX | LOCK_NB)) {
                        if (ftruncate($handle, 0)) {
                            $resetSuccess = true;
                            $this->log("Successfully reset using ftruncate: $filename");
                        }
                        flock($handle, LOCK_UN);
                    } else {
                        $this->log("Could not lock file: $filename");
                    }
                    fclose($handle);
                }
                
                // Method 2: If ftruncate failed, try file_put_contents
                if (!$resetSuccess) {
                    if (file_put_contents($logFile, '') !== false) {
                        $resetSuccess = true;
                        $this->log("Successfully reset using file_put_contents: $filename");
                    }
                }
                
                // Method 3: If both failed, try unlink and recreate
                if (!$resetSuccess) {
                    if (unlink($logFile) && touch($logFile)) {
                        chmod($logFile, 0664);
                        $resetSuccess = true;
                        $this->log("Successfully reset using unlink/touch: $filename");
                    }
                }
                
                if ($resetSuccess) {
                    $resetCount++;
                } else {
                    $failedFiles[] = "$filename (all methods failed)";
                    $this->log("Failed to reset: $filename");
                }
            }
            
            $this->log("Reset completed: $resetCount files reset successfully.");
            
            if (!empty($failedFiles)) {
                $this->log("Failed to reset: " . implode(', ', $failedFiles));
            }
            
            // Update last reset timestamp
            file_put_contents($this->lastResetFile, time());
            
            return true;
            
        } catch (Exception $e) {
            $this->log("Error during reset: " . $e->getMessage());
            return false;
        } finally {
            // Remove lock file
            if (file_exists($this->lockFile)) {
                unlink($this->lockFile);
            }
        }
    }
    
    public function getNextResetTime()
    {
        if (!file_exists($this->lastResetFile)) {
            return "Next reset: On next run";
        }
        
        $lastReset = (int)file_get_contents($this->lastResetFile);
        $nextReset = $lastReset + 172800; // 48 hours
        
        return "Next reset: " . date('Y-m-d H:i:s', $nextReset);
    }
    
    public function getLogStats()
    {
        $logFiles = glob($this->logDir . '/*.log');
        $stats = [];
        
        foreach ($logFiles as $logFile) {
            $stats[] = [
                'file' => basename($logFile),
                'size' => filesize($logFile),
                'modified' => filemtime($logFile)
            ];
        }
        
        return $stats;
    }
    
    public function getResetHistory()
    {
        $resetLogFile = $this->logDir . '/log_reset.log';
        if (!file_exists($resetLogFile)) {
            return "No reset history found.";
        }
        
        $history = file_get_contents($resetLogFile);
        return $history;
    }
    
    public function forceReset()
    {
        // Force a reset regardless of timing
        $this->log("Force reset initiated");
        return $this->resetLogs();
    }
    
    private function log($message)
    {
        $logFile = $this->logDir . '/log_reset.log';
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message\n";
        
        // Try to append to log file
        if (file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX) === false) {
            // If that fails, try without locking
            file_put_contents($logFile, $logMessage, FILE_APPEND);
        }
        
        // Also echo if running from command line
        if (php_sapi_name() === 'cli') {
            echo $logMessage;
        }
    }
    
    public function run()
    {
        $this->log("Log reset checker started");
        
        if ($this->shouldReset()) {
            $this->log("48 hours elapsed, starting log reset...");
            $success = $this->resetLogs();
            
            if ($success) {
                $this->log("Log reset completed successfully");
            } else {
                $this->log("Log reset failed");
            }
        } else {
            $this->log("Reset not needed yet. " . $this->getNextResetTime());
        }
        
        return true;
    }
    
    public function manualReset()
    {
        $this->log("Manual reset requested");
        return $this->forceReset();
    }
}