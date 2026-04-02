<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
}

$in = dnd_json_input();
$id = (int) ($in['id'] ?? 0);
$dir = (string) ($in['dir'] ?? '');

if ($id < 1 || !in_array($dir, ['up', 'down'], true)) {
    dnd_json_response(['error' => 'Ongeldige aanvraag.'], 400);
}

$rows = $pdo->query('SELECT id FROM stats ORDER BY sort_order ASC, id ASC')->fetchAll(PDO::FETCH_COLUMN);
$rows = array_map('intval', $rows);
$idx = array_search($id, $rows, true);

if ($idx === false) {
    dnd_json_response(['error' => 'Stat niet gevonden.'], 404);
}

$n = count($rows);
$changed = false;

if ($dir === 'up' && $idx > 0) {
    $tmp = $rows[$idx - 1];
    $rows[$idx - 1] = $rows[$idx];
    $rows[$idx] = $tmp;
    $changed = true;
} elseif ($dir === 'down' && $idx < $n - 1) {
    $tmp = $rows[$idx + 1];
    $rows[$idx + 1] = $rows[$idx];
    $rows[$idx] = $tmp;
    $changed = true;
}

if (!$changed) {
    dnd_json_response(['ok' => true]);
}

$upd = $pdo->prepare('UPDATE stats SET sort_order = ? WHERE id = ?');
$pos = 1;

foreach ($rows as $rid) {
    $upd->execute([$pos++, $rid]);
}

dnd_json_response(['ok' => true]);
