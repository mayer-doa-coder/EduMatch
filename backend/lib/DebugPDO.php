<?php
require_once __DIR__ . '/DebugStatement.php';

// PDO subclass that logs every query executed through this connection.
// Uses ATTR_STATEMENT_CLASS so prepared statements are auto-wrapped.
class DebugPDO extends PDO {
    public function __construct(string $dsn, string $username = '', string $password = '', array $options = []) {
        parent::__construct($dsn, $username, $password, $options);
        // All prepare() calls will return DebugStatement instead of PDOStatement.
        $this->setAttribute(PDO::ATTR_STATEMENT_CLASS, [DebugStatement::class]);
    }

    // Intercept direct query() calls (bypasses prepare/execute).
    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false {
        $start  = microtime(true);
        $result = ($fetchMode !== null)
            ? parent::query($query, $fetchMode, ...$fetchModeArgs)
            : parent::query($query);
        $ms = (microtime(true) - $start) * 1000;
        QueryLogger::log($query, [], $ms);
        return $result;
    }

    // Intercept exec() (DDL, raw updates without results).
    public function exec(string $statement): int|false {
        $start  = microtime(true);
        $result = parent::exec($statement);
        $ms     = (microtime(true) - $start) * 1000;
        QueryLogger::log($statement, [], $ms);
        return $result;
    }
}
