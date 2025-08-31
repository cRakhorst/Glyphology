<?php

namespace Classes;

class LogReset
{
    private string $logDir;
    private string $lockFile;
    private int $interval; // in seconds
    private string $resetLog;

    public function __construct(
        string $logDir = __DIR__ . '/../../logs',
        int $interval = 172800 // 48 hours
    ) {
        $this->logDir   = realpath($logDir) ?: $logDir;
        $this->lockFile = $this->logDir . "/.reset_lock";
        $this->resetLog = $this->logDir . "/log_reset.log";
        $this->interval = $interval;
    }

    private function isDue(): bool
    {
        if (!file_exists($this->lockFile)) {
            return true;
        }
        $lastResetTime = strtotime(trim(file_get_contents($this->lockFile)));
        return !$lastResetTime || (time() - $lastResetTime) >= $this->interval;
    }

    public function reset(): void
    {
        $now = time();

        if (!$this->isDue()) {
            return; // nothing to do, and no logging
        }

        if (!$this->logDir || !is_dir($this->logDir)) {
            throw new \Exception("Logs directory not found: " . $this->logDir);
        }

        $cleared = [];
        foreach (glob($this->logDir . "/*.log") as $logFile) {
            if (basename($logFile) === "log_reset.log") {
                continue;
            }
            file_put_contents($logFile, "");
            $cleared[] = basename($logFile);
        }

        // update reset marker
        file_put_contents($this->lockFile, date("Y-m-d H:i:s", $now));

        // write only when reset happens
        $entry = sprintf(
            "[%s] Logs reset. %d file(s) cleared: %s\n",
            date("Y-m-d H:i:s", $now),
            count($cleared),
            $cleared ? implode(", ", $cleared) : "none"
        );
        file_put_contents($this->resetLog, $entry, FILE_APPEND | LOCK_EX);
    }
}
