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

$name = trim((string) ($in['name'] ?? ''));

if ($name === '') {
    dnd_json_response(['error' => 'Naam is verplicht.'], 400);
}

$maxVal = (int) ($in['max'] ?? -1);

if ($maxVal < 0) {
    dnd_json_response(['error' => 'Max moet 0 of groter zijn.'], 400);
}

$sel = $pdo->prepare('SELECT current FROM stats WHERE id = ?');
$sel->execute([$id]);
$row = $sel->fetch();

if ($row === false) {
    dnd_json_response(['error' => 'Stat niet gevonden.'], 404);
}

$currentVal = (int) $row['current'];

if ($currentVal > $maxVal) {
    $currentVal = $maxVal;
}

$resetShort = !empty($in['reset_on_short']) ? 1 : 0;
$resetLong = !empty($in['reset_on_long']) ? 1 : 0;

$stmt = $pdo->prepare(
    'UPDATE stats SET name = ?, max = ?, current = ?, reset_on_short = ?, reset_on_long = ? WHERE id = ?'
);
$stmt->execute([$name, $maxVal, $currentVal, $resetShort, $resetLong, $id]);
dnd_json_response(['ok' => true]);
