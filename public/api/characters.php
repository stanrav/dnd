<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = $pdo->query('SELECT id, name, sort_order FROM characters ORDER BY sort_order ASC, id ASC')->fetchAll();
    dnd_json_response($rows);
}

if ($method === 'POST') {
    $in = dnd_json_input();
    $name = trim((string) ($in['name'] ?? ''));

    if ($name === '') {
        dnd_json_response(['error' => 'Naam is verplicht.'], 400);
    }

    $nextSort = (int) $pdo->query('SELECT COALESCE(MAX(sort_order), 0) FROM characters')->fetchColumn() + 1;
    $stmt = $pdo->prepare('INSERT INTO characters (name, sort_order) VALUES (?, ?)');
    $stmt->execute([$name, $nextSort]);
    $id = (int) $pdo->lastInsertId();
    dnd_json_response(['id' => $id]);
}

dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
