<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$workspaceId = dnd_require_workspace($pdo);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
}

$in = dnd_json_input();
$id = (int) ($in['id'] ?? 0);

if ($id < 1) {
    dnd_json_response(['error' => 'Ongeldig id.'], 400);
}

dnd_assert_stat_in_workspace($pdo, $id, $workspaceId);

$short = !empty($in['reset_on_short']) ? 1 : 0;
$long = !empty($in['reset_on_long']) ? 1 : 0;

$stmt = $pdo->prepare(
    'UPDATE stats SET reset_on_short = ?, reset_on_long = ? WHERE id = ?'
);
$stmt->execute([$short, $long, $id]);
dnd_json_response(['ok' => true]);
