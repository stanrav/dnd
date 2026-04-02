<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$workspaceId = dnd_require_workspace($pdo);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
}

$in = dnd_json_input();
$ids = $in['ids'] ?? null;
$characterId = (int) ($in['character_id'] ?? 0);

if ($characterId < 1) {
    dnd_json_response(['error' => 'character_id is verplicht.'], 400);
}

dnd_assert_character_in_workspace($pdo, $characterId, $workspaceId);

if (!is_array($ids) || $ids === []) {
    dnd_json_response(['error' => 'ids moet een niet-lege array zijn.'], 400);
}

$stmt = $pdo->prepare('SELECT id FROM stats WHERE character_id = ?');
$stmt->execute([$characterId]);
$dbIds = array_map('intval', array_column($stmt->fetchAll(), 'id'));
sort($dbIds);

$ordered = array_map('intval', $ids);
$sortedCheck = $ordered;
sort($sortedCheck);

if ($sortedCheck !== $dbIds || count($ordered) !== count($dbIds)) {
    dnd_json_response(['error' => 'Ongeldige volgorde: alle stats moeten precies één keer voorkomen.'], 400);
}

$pos = 1;
$upd = $pdo->prepare('UPDATE stats SET sort_order = ? WHERE id = ?');

foreach ($ordered as $id) {
    if ($id < 1) {
        dnd_json_response(['error' => 'Ongeldig id.'], 400);
    }

    $upd->execute([$pos, $id]);
    $pos++;
}

dnd_json_response(['ok' => true]);
