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

    <section class="workspace-share" aria-labelledby="workspace-share-heading">
        <h2 id="workspace-share-heading" class="page-title page-title--sub">Jouw persoonlijke link</h2>
        <p class="page-intro">Open deze link op een ander apparaat of na het wissen van sitegegevens om dezelfde stats te blijven gebruiken.</p>
        <button type="button" class="btn btn--primary" id="btn-workspace-copy-link">Link kopiëren</button>
    </section>

    <p class="page-intro">Vink aan bij welke rust een stat automatisch naar zijn maximum gaat.</p>

    <div id="settings-root"></div>
</main>

<?php require __DIR__ . '/../includes/partials/footer.php'; ?>
