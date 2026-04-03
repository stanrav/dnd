<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$workspaceId = dnd_require_workspace($pdo);

if ($method === 'GET') {
    $stmt = $pdo->prepare(
        'SELECT id, name, sort_order, notes, currency_enabled, cp, sp, gp, pp
         FROM characters WHERE workspace_id = ? ORDER BY sort_order ASC, id ASC'
    );
    $stmt->execute([$workspaceId]);
    dnd_json_response($stmt->fetchAll());
}

if ($method === 'POST') {
    $in = dnd_json_input();
    $name = trim((string) ($in['name'] ?? ''));

    if ($name === '') {
        dnd_json_response(['error' => 'Naam is verplicht.'], 400);
    }

    $currencyEnabled = !empty($in['currency_enabled']) ? 1 : 0;

    $nextStmt = $pdo->prepare(
        'SELECT COALESCE(MAX(sort_order), 0) FROM characters WHERE workspace_id = ?'
    );
    $nextStmt->execute([$workspaceId]);
    $nextSort = (int) $nextStmt->fetchColumn() + 1;
    $stmt = $pdo->prepare(
        'INSERT INTO characters (name, sort_order, workspace_id, currency_enabled) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([$name, $nextSort, $workspaceId, $currencyEnabled]);
    $id = (int) $pdo->lastInsertId();
    dnd_json_response(['id' => $id]);
}

dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
