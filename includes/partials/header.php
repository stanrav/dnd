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
    <meta name="theme-color" content="#141210">
    <meta name="application-name" content="D&D Stats">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="D&D Stats">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="manifest" href="site.webmanifest">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/icons/favicon-16x16.png">
    <link rel="icon" href="assets/icons/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css">
</head>
<body<?= $bodyId !== '' ? ' id="' . htmlspecialchars($bodyId, ENT_QUOTES, 'UTF-8') . '"' : '' ?>>
    <header class="site-header">
        <div class="site-header__bar">
            <a href="index.php" style="width: 70px; height: 70px;">
                <img src="assets/icons/apple-touch-icon.png" alt="" width="100%" height="100%" class="brand__logo" decoding="async">
            </a>

            <button type="button" class="site-nav-toggle" id="site-nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Menu openen">
                <span class="site-nav-toggle__bar" aria-hidden="true"></span>
                <span class="site-nav-toggle__bar" aria-hidden="true"></span>
                <span class="site-nav-toggle__bar" aria-hidden="true"></span>
            </button>
        </div>
        <nav id="primary-nav" class="nav" aria-label="Hoofdmenu">
            <a href="index.php">Spelen</a>
            <a href="manage.php">Stats aanmaken</a>
            <a href="characters.php">Personages</a>
            <a href="settings.php">Instellingen</a>
        </nav>
    </header>
    <div class="site-nav-backdrop" id="site-nav-backdrop" hidden aria-hidden="true"></div>
