<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $secret = bin2hex(random_bytes(32));
    $stmt = $pdo->prepare('INSERT INTO workspaces (secret) VALUES (?)');
    $stmt->execute([$secret]);
    dnd_json_response(['secret' => $secret]);
}

if ($method === 'GET') {
    dnd_require_workspace($pdo);
    dnd_json_response(['ok' => true]);
}

dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
