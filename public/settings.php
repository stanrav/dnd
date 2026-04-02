<?php

declare(strict_types=1);

$pageTitle = 'Instellingen — D&D Stats';
$bodyId = 'page-settings';
require __DIR__ . '/../includes/partials/header.php';
?>

<main>
    <h1 class="page-title">Instellingen</h1>

    <div class="char-picker-bar">
        <label class="char-picker">
            <span class="char-picker__label">Personage</span>
            <select id="settings-char-select" class="char-picker__select" aria-label="Kies personage"></select>
        </label>
        <a href="characters.php" class="char-picker__link">Personages beheren</a>
    </div>

    <p class="page-intro">Vink aan bij welke rust een stat automatisch naar zijn maximum gaat.</p>

    <div id="settings-root"></div>
</main>

<?php require __DIR__ . '/../includes/partials/footer.php'; ?>
