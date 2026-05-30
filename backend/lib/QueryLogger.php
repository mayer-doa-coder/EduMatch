<?php
// Appends each intercepted SQL query to a JSONL log file.
// One JSON object per line for cheap append-only writes.
class QueryLogger {
    private static string $logFile = __DIR__ . '/../logs/queries.jsonl';

    public static function log(string $sql, array $params, float $durationMs): void {
        $dir = dirname(self::$logFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $entry = json_encode([
            'id'          => uniqid('q', true),
            'sql'         => trim($sql),
            'params'      => $params,
            'duration_ms' => round($durationMs, 3),
            'ts'          => microtime(true),
            'source'      => basename($_SERVER['SCRIPT_FILENAME'] ?? 'cli'),
            'method'      => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
        ], JSON_UNESCAPED_UNICODE);

        file_put_contents(self::$logFile, $entry . "\n", FILE_APPEND | LOCK_EX);
    }

    // Returns all entries with ts > $since (float unix timestamp).
    public static function readSince(float $since): array {
        if (!file_exists(self::$logFile)) return [];

        $entries = [];
        $fp = fopen(self::$logFile, 'r');
        if (!$fp) return [];

        while (!feof($fp)) {
            $line = trim(fgets($fp));
            if ($line === '') continue;
            $entry = json_decode($line, true);
            if (is_array($entry) && $entry['ts'] > $since) {
                $entries[] = $entry;
            }
        }
        fclose($fp);
        return $entries;
    }

    public static function clear(): void {
        if (file_exists(self::$logFile)) {
            file_put_contents(self::$logFile, '', LOCK_EX);
        }
    }
}
