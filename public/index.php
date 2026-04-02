<?php

declare(strict_types=1);

$pageTitle = 'D&D Stats';
$bodyId = 'page-play';
require __DIR__ . '/../includes/partials/header.php';
?>

<main>
    <div id="play-char-shell" class="char-shell">
        <div class="char-tabs-wrap char-tabs-wrap--sticky">
            <div id="char-tabs" class="char-tabs" role="tablist" aria-label="Personages"></div>
        </div>
        <div class="rest-row rest-row--play">
            <button type="button" class="btn btn--primary" id="btn-short-rest">Short rest</button>
            <button type="button" class="btn btn--primary" id="btn-long-rest">Long rest</button>
        </div>
        <p class="char-swipe-hint" id="char-swipe-hint" hidden>Veeg horizontaal om van personage te wisselen.</p>
        <div id="char-viewport" class="char-viewport" tabindex="0" aria-roledescription="carousel" aria-label="Personage">
            <div id="char-track" class="char-track"></div>
        </div>
    </div>
</main>

<?php require __DIR__ . '/../includes/partials/footer.php'; ?>
