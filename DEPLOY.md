# Deploy op Ploi.io

Korte route om deze app op je domein te zetten.

## 1. Server en site

1. Log in op [ploi.io](https://ploi.io) en kies je **server** (of maak er een aan).
2. Klik **Create site** (of **Sites** → nieuwe site).
3. Vul je **domein** in (bijv. `stats.mijndomein.nl` of `www.…`).
4. Kies type **PHP** en een versie **8.1 of hoger**.

## 2. Code op de server

- **Optie A – Git (aanbevolen):** bij de site onder **Repository** je Git-URL koppelen, branch kiezen en deploy laten lopen (zoals Ploi dat voorstelt).
- **Optie B – Handmatig:** project uploaden via SFTP naar de site-root die Ploi aanmaakt (meestal iets als `/home/ploi/jouwdomein.nl`).

## 3. Document root → `public`

In Ploi: open de site → **Settings** (of **Web directory** / **Root directory**, afhankelijk van de Ploi-versie).

Zet de **public web directory** naar de map **`public`** van dit project, bijvoorbeeld:

`/home/ploi/jouwdomein.nl/public`

als je repo-root `/home/ploi/jouwdomein.nl` is en daarin de mappen `public/`, `includes/`, `storage/` staan.

Zo zijn `index.php` en `api/` bereikbaar op je domein; `includes/` en `storage/` blijven **buiten** de webroot.

## 4. Schrijfrechten voor SQLite

De app maakt `storage/database.sqlite` aan. De map **`storage`** (naast `public`) moet voor PHP **schrijfbaar** zijn.

- Zorg dat `storage` op de server bestaat (staat in Git met `.gitkeep`; anders aanmaken).
- In Ploi kun je vaak via **Permissions** of SSH `chown`/`chmod` zetten (bijv. eigenaar `ploi` of de PHP-user die je stack gebruikt, map schrijfbaar voor die user).

## 5. DNS naar je server

Bij je **domeinregistrar** (waar je DNS beheert):

- **A-record** naar het **IP** van je Ploi-server, of
- **CNAME** naar het hostnaam-advies van Ploi,

zoals Ploi in het site-overzicht aangeeft. Wacht tot DNS is doorgekomen (soms tot 24 uur, vaak sneller).

## 6. SSL

In Ploi bij de site **SSL** / **Let’s Encrypt** inschakelen zodra DNS klopt.

---

**Geen** `composer install` of `npm run build` nodig.

**Backup:** kopieer `storage/database.sqlite` als je de data wilt veiligstellen.

## Lokaal testen

Vanaf de projectroot:

```bash
php -S localhost:8080 -t public
```

Open `http://localhost:8080`.
