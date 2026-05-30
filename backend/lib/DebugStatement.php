<?php
// PDOStatement subclass injected via PDO::ATTR_STATEMENT_CLASS.
// Intercepts execute() to time and log each query automatically.
class DebugStatement extends PDOStatement {
    // PDO constructs statement objects internally; constructor must be protected.
    protected function __construct() {}

    public function execute(?array $params = null): bool {
        $start  = microtime(true);
        $result = parent::execute($params);
        $ms     = (microtime(true) - $start) * 1000;

        // $this->queryString is a built-in PDOStatement property.
        QueryLogger::log($this->queryString, $params ?? [], $ms);
        return $result;
    }
}
