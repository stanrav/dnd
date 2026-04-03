<?php

declare(strict_types=1);

$pageTitle = 'Stats aanmaken — D&D Stats';
$bodyId = 'page-manage';
require __DIR__ . '/../includes/partials/header.php';
?>

<main>
    <h1 class="page-title">Stats aanmaken</h1>

    <div class="char-picker-bar">
        <label class="char-picker">
            <span class="char-picker__label">Personage</span>
            <select id="manage-char-select" class="char-picker__select" aria-label="Kies personage"></select>
        </label>
        <a href="characters.php" class="char-picker__link">Personages beheren</a>
    </div>

    <form id="form-new-stat" class="form-stack">
        <label>
            Naam
            <input type="text" name="name" required maxlength="120" autocomplete="off" placeholder="bijv. HP" inputmode="text">
        </label>
        <label>
            Max
            <input type="number" name="max" required min="0" step="1" value="10" inputmode="numeric">
        </label>
        <fieldset class="form-fieldset">
            <legend class="form-fieldset__legend">Reset naar max bij rust</legend>
            <div class="form-check-row">
                <label class="form-check">
                    <input type="checkbox" name="reset_on_short" value="1">
                    <span>Short rest</span>
                </label>
                <label class="form-check">
                    <input type="checkbox" name="reset_on_long" value="1">
                    <span>Long rest</span>
                </label>
            </div>
        </fieldset>
        <button type="submit" class="btn btn--primary btn--block">Toevoegen</button>
    </form>

    <h2 class="page-title page-title--sub">Bestaande stats</h2>
    <div id="manage-list" class="manage-list"></div>
</main>

<?php require __DIR__ . '/../includes/partials/footer.php'; ?>
