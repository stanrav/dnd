<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
}

$in = dnd_json_input();
$ids = $in['ids'] ?? null;

if (!is_array($ids) || $ids === []) {
    dnd_json_response(['error' => 'ids moet een niet-lege array zijn.'], 400);
}

$dbIds = array_map('intval', array_column($pdo->query('SELECT id FROM stats')->fetchAll(), 'id'));
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
