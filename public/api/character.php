<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    if ($id < 1) {
        dnd_json_response(['error' => 'Ongeldig id.'], 400);
    }

    $total = (int) $pdo->query('SELECT COUNT(*) FROM characters')->fetchColumn();

    if ($total < 2) {
        dnd_json_response(['error' => 'Je moet minimaal één personage houden.'], 400);
    }

    $check = $pdo->prepare('SELECT 1 FROM characters WHERE id = ?');
    $check->execute([$id]);

    if ($check->fetchColumn() === false) {
        dnd_json_response(['error' => 'Personage niet gevonden.'], 404);
    }

    $delStats = $pdo->prepare('DELETE FROM stats WHERE character_id = ?');
    $delStats->execute([$id]);
    $delChar = $pdo->prepare('DELETE FROM characters WHERE id = ?');
    $delChar->execute([$id]);
    dnd_json_response(['ok' => true]);
}

if ($method === 'POST') {
    $in = dnd_json_input();
    $id = (int) ($in['id'] ?? 0);
    $name = trim((string) ($in['name'] ?? ''));

    if ($id < 1 || $name === '') {
        dnd_json_response(['error' => 'Ongeldige aanvraag.'], 400);
    }

    $check = $pdo->prepare('SELECT 1 FROM characters WHERE id = ?');
    $check->execute([$id]);

    if ($check->fetchColumn() === false) {
        dnd_json_response(['error' => 'Personage niet gevonden.'], 404);
    }

    $stmt = $pdo->prepare('UPDATE characters SET name = ? WHERE id = ?');
    $stmt->execute([$name, $id]);
    dnd_json_response(['ok' => true]);
}

dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
