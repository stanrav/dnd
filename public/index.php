<?php

declare(strict_types=1);

$pageTitle = 'Sessie — D&D Stats';
$bodyId = 'page-play';
require __DIR__ . '/../includes/partials/header.php';
?>

<main>
    <h1 class="page-title">Sessie</h1>

    <div class="rest-row">
        <button type="button" class="btn btn--primary" id="btn-short-rest">Short rest</button>
        <button type="button" class="btn btn--primary" id="btn-long-rest">Long rest</button>
    </div>

    <div id="play-root" aria-live="polite"></div>
</main>

<?php require __DIR__ . '/../includes/partials/footer.php'; ?>
