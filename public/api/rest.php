<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$workspaceId = dnd_require_workspace($pdo);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
}

$in = dnd_json_input();
$kind = (string) ($in['kind'] ?? '');
$characterId = (int) ($in['character_id'] ?? 0);

if ($characterId < 1) {
    dnd_json_response(['error' => 'character_id is verplicht.'], 400);
}

dnd_assert_character_in_workspace($pdo, $characterId, $workspaceId);

if ($kind === 'short') {
    $stmt = $pdo->prepare(
        'UPDATE stats SET current = max WHERE reset_on_short = 1 AND character_id = ?'
    );
    $stmt->execute([$characterId]);
    dnd_json_response(['ok' => true]);
}

if ($kind === 'long') {
    $stmt = $pdo->prepare(
        'UPDATE stats SET current = max WHERE reset_on_long = 1 AND character_id = ?'
    );
    $stmt->execute([$characterId]);
    dnd_json_response(['ok' => true]);
}

dnd_json_response(['error' => 'kind moet "short" of "long" zijn.'], 400);
