<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$workspaceId = dnd_require_workspace($pdo);

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    if ($id < 1) {
        dnd_json_response(['error' => 'Ongeldig id.'], 400);
    }

    $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM characters WHERE workspace_id = ?');
    $totalStmt->execute([$workspaceId]);
    $total = (int) $totalStmt->fetchColumn();

    if ($total < 2) {
        dnd_json_response(['error' => 'Je moet minimaal één personage houden.'], 400);
    }

    dnd_assert_character_in_workspace($pdo, $id, $workspaceId);

    $delStats = $pdo->prepare('DELETE FROM stats WHERE character_id = ?');
    $delStats->execute([$id]);
    $delChar = $pdo->prepare('DELETE FROM characters WHERE id = ? AND workspace_id = ?');
    $delChar->execute([$id, $workspaceId]);
    dnd_json_response(['ok' => true]);
}

if ($method === 'POST') {
    $in = dnd_json_input();
    $id = (int) ($in['id'] ?? 0);

    if ($id < 1) {
        dnd_json_response(['error' => 'Ongeldige aanvraag.'], 400);
    }

    dnd_assert_character_in_workspace($pdo, $id, $workspaceId);

    $sets = [];
    $params = [];

    if (array_key_exists('name', $in)) {
        $name = trim((string) $in['name']);

        if ($name === '') {
            dnd_json_response(['error' => 'Naam is verplicht.'], 400);
        }

        $sets[] = 'name = ?';
        $params[] = $name;
    }

    if (array_key_exists('notes', $in)) {
        $notes = (string) $in['notes'];
        $len = function_exists('mb_strlen') ? mb_strlen($notes, 'UTF-8') : strlen($notes);

        if ($len > 20000) {
            dnd_json_response(['error' => 'Notities zijn te lang (max. 20000 tekens).'], 400);
        }

        $sets[] = 'notes = ?';
        $params[] = $notes;
    }

    if (array_key_exists('currency_enabled', $in)) {
        $sets[] = 'currency_enabled = ?';
        $params[] = !empty($in['currency_enabled']) ? 1 : 0;
    }

    $coinCols = ['cp', 'sp', 'ep', 'gp', 'pp'];

    foreach ($coinCols as $col) {
        if (!array_key_exists($col, $in)) {
            continue;
        }

        $v = (int) $in[$col];

        if ($v < 0 || $v > 999999999) {
            dnd_json_response(['error' => 'Ongeldige hoeveelheid muntstukken.'], 400);
        }

        $sets[] = $col . ' = ?';
        $params[] = $v;
    }

    if ($sets === []) {
        dnd_json_response(['error' => 'Geen velden om bij te werken.'], 400);
    }

    $params[] = $id;
    $params[] = $workspaceId;
    $sql = 'UPDATE characters SET ' . implode(', ', $sets) . ' WHERE id = ? AND workspace_id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    dnd_json_response(['ok' => true]);
}

dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
