<?php

declare(strict_types=1);

function dnd_workspace_secret_from_request(): string
{
    return trim((string) ($_SERVER['HTTP_X_WORKSPACE_SECRET'] ?? ''));
}

function dnd_require_workspace(PDO $pdo): int
{
    $secret = dnd_workspace_secret_from_request();

    if ($secret === '') {
        dnd_json_response(['error' => 'Workspace ontbreekt.'], 401);
    }

    $stmt = $pdo->prepare('SELECT id FROM workspaces WHERE secret = ?');
    $stmt->execute([$secret]);
    $id = $stmt->fetchColumn();

    if ($id === false) {
        dnd_json_response(['error' => 'Ongeldige workspace.'], 401);
    }

    return (int) $id;
}

function dnd_character_in_workspace(PDO $pdo, int $characterId, int $workspaceId): bool
{
    $stmt = $pdo->prepare('SELECT 1 FROM characters WHERE id = ? AND workspace_id = ?');
    $stmt->execute([$characterId, $workspaceId]);

    return $stmt->fetchColumn() !== false;
}

function dnd_assert_character_in_workspace(PDO $pdo, int $characterId, int $workspaceId): void
{
    if (!dnd_character_in_workspace($pdo, $characterId, $workspaceId)) {
        dnd_json_response(['error' => 'Personage niet gevonden.'], 404);
    }
}

function dnd_stat_in_workspace(PDO $pdo, int $statId, int $workspaceId): bool
{
    $stmt = $pdo->prepare(
        'SELECT 1 FROM stats s INNER JOIN characters c ON c.id = s.character_id WHERE s.id = ? AND c.workspace_id = ?'
    );
    $stmt->execute([$statId, $workspaceId]);

    return $stmt->fetchColumn() !== false;
}

function dnd_assert_stat_in_workspace(PDO $pdo, int $statId, int $workspaceId): void
{
    if (!dnd_stat_in_workspace($pdo, $statId, $workspaceId)) {
        dnd_json_response(['error' => 'Stat niet gevonden.'], 404);
    }
}
