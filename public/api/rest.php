<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$pdo = dnd_pdo();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    dnd_json_response(['error' => 'Methode niet toegestaan.'], 405);
}

$in = dnd_json_input();
$kind = (string) ($in['kind'] ?? '');

if ($kind === 'short') {
    $pdo->exec('UPDATE stats SET current = max WHERE reset_on_short = 1');
    dnd_json_response(['ok' => true]);
}

if ($kind === 'long') {
    $pdo->exec('UPDATE stats SET current = max WHERE reset_on_long = 1');
    dnd_json_response(['ok' => true]);
}

dnd_json_response(['error' => 'kind moet "short" of "long" zijn.'], 400);
