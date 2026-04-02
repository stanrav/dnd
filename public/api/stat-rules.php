<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
}

$in = dnd_json_input();
$id = (int) ($in['id'] ?? 0);

if ($id < 1) {
    dnd_json_response(['error' => 'Ongeldig id.'], 400);
}

$check = $pdo->prepare('SELECT 1 FROM stats WHERE id = ?');
$check->execute([$id]);

if ($check->fetchColumn() === false) {
    dnd_json_response(['error' => 'Stat niet gevonden.'], 404);
}

$short = !empty($in['reset_on_short']) ? 1 : 0;
$long = !empty($in['reset_on_long']) ? 1 : 0;

$stmt = $pdo->prepare(
    'UPDATE stats SET reset_on_short = ?, reset_on_long = ? WHERE id = ?'
);
$stmt->execute([$short, $long, $id]);
dnd_json_response(['ok' => true]);
