<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$workspaceId = dnd_require_workspace($pdo);

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    if ($id < 1) {
        dnd_json_response(['error' => 'Ongeldig id.'], 400);
    }

    dnd_assert_stat_in_workspace($pdo, $id, $workspaceId);

    $stmt = $pdo->prepare('DELETE FROM stats WHERE id = ?');
    $stmt->execute([$id]);
    dnd_json_response(['ok' => true]);
}

if ($method === 'POST') {
    $in = dnd_json_input();
    $id = (int) ($in['id'] ?? 0);

    if ($id < 1) {
        dnd_json_response(['error' => 'Ongeldig id.'], 400);
    }

    dnd_assert_stat_in_workspace($pdo, $id, $workspaceId);

    $sel = $pdo->prepare('SELECT max, current FROM stats WHERE id = ?');
    $sel->execute([$id]);
    $row = $sel->fetch();

    if ($row === false) {
        dnd_json_response(['error' => 'Stat niet gevonden.'], 404);
    }

    $maxVal = (int) $row['max'];
    $currentVal = (int) $row['current'];

    if (array_key_exists('current', $in)) {
        $currentVal = (int) $in['current'];
    } elseif (array_key_exists('delta', $in)) {
        $currentVal += (int) $in['delta'];
    } else {
        dnd_json_response(['error' => 'Geef current of delta op.'], 400);
    }

    if ($currentVal < 0) {
        $currentVal = 0;
    }

    if ($currentVal > $maxVal) {
        $currentVal = $maxVal;
    }

    $stmt = $pdo->prepare('UPDATE stats SET current = ? WHERE id = ?');
    $stmt->execute([$currentVal, $id]);
    dnd_json_response(['current' => $currentVal]);
}

dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
