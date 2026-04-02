<?php

declare(strict_types=1);

function dnd_root(): string
{
    return dirname(__DIR__);
}

function dnd_db_path(): string
{
    return dnd_root() . '/storage/database.sqlite';
}

function dnd_pdo(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $path = dnd_db_path();
        $dir = dirname($path);

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $pdo = new PDO('sqlite:' . $path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    current INTEGER NOT NULL,
    max INTEGER NOT NULL,
    reset_on_short INTEGER NOT NULL DEFAULT 0,
    reset_on_long INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);
SQL);

        dnd_migrate_stats_sort_order($pdo);
    }

    return $pdo;
}

function dnd_migrate_stats_sort_order(PDO $pdo): void
{
    $cols = $pdo->query('PRAGMA table_info(stats)')->fetchAll(PDO::FETCH_ASSOC);
    $hasSort = false;

    foreach ($cols as $col) {
        if (($col['name'] ?? '') === 'sort_order') {
            $hasSort = true;
            break;
        }
    }

    if ($hasSort) {
        return;
    }

    $pdo->exec('ALTER TABLE stats ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0');
    $pdo->exec('UPDATE stats SET sort_order = id');
}
