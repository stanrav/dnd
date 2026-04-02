<?php

declare(strict_types=1);

$pageTitle = $pageTitle ?? 'D&D Stats';
$bodyId = $bodyId ?? '';
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css">
</head>
<body<?= $bodyId !== '' ? ' id="' . htmlspecialchars($bodyId, ENT_QUOTES, 'UTF-8') . '"' : '' ?>>
    <header class="site-header">
        <p class="brand"><a href="index.php">Sessie</a></p>
        <nav class="nav">
            <a href="index.php">Spelen</a>
            <a href="manage.php">Stats aanmaken</a>
            <a href="characters.php">Personages</a>
            <a href="settings.php">Instellingen</a>
        </nav>
    </header>
