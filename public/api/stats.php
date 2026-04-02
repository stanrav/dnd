<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = $pdo->query('SELECT * FROM stats ORDER BY sort_order ASC, id ASC')->fetchAll();
    dnd_json_response($rows);
}

if ($method === 'POST') {
    $in = dnd_json_input();
    $name = trim((string) ($in['name'] ?? ''));

    if ($name === '') {
        dnd_json_response(['error' => 'Naam is verplicht.'], 400);
    }

    $max = (int) ($in['max'] ?? -1);

    if ($max < 0) {
        dnd_json_response(['error' => 'Max moet 0 of groter zijn.'], 400);
    }

    $current = array_key_exists('current', $in) ? (int) $in['current'] : $max;

    if ($current < 0) {
        $current = 0;
    }

    if ($current > $max) {
        $current = $max;
    }

    $resetShort = !empty($in['reset_on_short']) ? 1 : 0;
    $resetLong = !empty($in['reset_on_long']) ? 1 : 0;

    $nextSort = (int) $pdo->query('SELECT COALESCE(MAX(sort_order), 0) FROM stats')->fetchColumn() + 1;

    $stmt = $pdo->prepare(
        'INSERT INTO stats (name, current, max, reset_on_short, reset_on_long, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$name, $current, $max, $resetShort, $resetLong, $nextSort]);
    $id = (int) $pdo->lastInsertId();
    dnd_json_response(['id' => $id]);
}

dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
