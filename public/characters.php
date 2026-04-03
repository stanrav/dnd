<?php

declare(strict_types=1);

$pageTitle = 'Personages — D&D Stats';
$bodyId = 'page-characters';
require __DIR__ . '/../includes/partials/header.php';
?>

<main>
    <h1 class="page-title">Personages</h1>

    <form id="form-new-character" class="form-stack">
        <label>
            Naam personage
            <input type="text" name="name" required maxlength="120" autocomplete="off" placeholder="bijv. Elara" inputmode="text">
        </label>
        <label class="form-check">
            <input type="checkbox" name="currency_enabled" value="1">
            Geld bijhouden (munten op de speelpagina)
        </label>
        <button type="submit" class="btn btn--primary btn--block">Personage toevoegen</button>
    </form>

    <h2 class="page-title page-title--sub">Jouw personages</h2>
    <div id="characters-list" class="characters-list"></div>
</main>

<?php require __DIR__ . '/../includes/partials/footer.php'; ?>
