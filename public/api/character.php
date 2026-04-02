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
    $name = trim((string) ($in['name'] ?? ''));

    if ($id < 1 || $name === '') {
        dnd_json_response(['error' => 'Ongeldige aanvraag.'], 400);
    }

    dnd_assert_character_in_workspace($pdo, $id, $workspaceId);

    $stmt = $pdo->prepare('UPDATE characters SET name = ? WHERE id = ? AND workspace_id = ?');
    $stmt->execute([$name, $id, $workspaceId]);
    dnd_json_response(['ok' => true]);
}

dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
