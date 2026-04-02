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
        dnd_migrate_characters($pdo);
        dnd_migrate_workspaces($pdo);
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

function dnd_migrate_characters(PDO $pdo): void
{
    $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);
SQL);

    $count = (int) $pdo->query('SELECT COUNT(*) FROM characters')->fetchColumn();

    if ($count === 0) {
        $pdo->exec("INSERT INTO characters (name, sort_order) VALUES ('Personage', 1)");
    }

    $cols = $pdo->query('PRAGMA table_info(stats)')->fetchAll(PDO::FETCH_ASSOC);
    $hasCharacterId = false;

    foreach ($cols as $col) {
        if (($col['name'] ?? '') === 'character_id') {
            $hasCharacterId = true;
            break;
        }
    }

    if ($hasCharacterId) {
        return;
    }

    $pdo->exec('ALTER TABLE stats ADD COLUMN character_id INTEGER NOT NULL DEFAULT 1');
    $firstId = (int) $pdo->query('SELECT id FROM characters ORDER BY sort_order ASC, id ASC LIMIT 1')->fetchColumn();
    $upd = $pdo->prepare('UPDATE stats SET character_id = ?');
    $upd->execute([$firstId]);
}

function dnd_migrate_workspaces(PDO $pdo): void
{
    $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    secret TEXT NOT NULL UNIQUE
);
SQL);

    $charCols = $pdo->query('PRAGMA table_info(characters)')->fetchAll(PDO::FETCH_ASSOC);
    $hasWorkspaceId = false;

    foreach ($charCols as $col) {
        if (($col['name'] ?? '') === 'workspace_id') {
            $hasWorkspaceId = true;
            break;
        }
    }

    if ($hasWorkspaceId) {
        return;
    }

    $wsCount = (int) $pdo->query('SELECT COUNT(*) FROM workspaces')->fetchColumn();

    if ($wsCount === 0) {
        $secret = bin2hex(random_bytes(32));
        $ins = $pdo->prepare('INSERT INTO workspaces (secret) VALUES (?)');
        $ins->execute([$secret]);
    }

    $wid = (int) $pdo->query('SELECT id FROM workspaces ORDER BY id ASC LIMIT 1')->fetchColumn();
    $pdo->exec('ALTER TABLE characters ADD COLUMN workspace_id INTEGER NOT NULL DEFAULT ' . $wid);
}
