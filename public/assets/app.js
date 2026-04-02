(function () {
    'use strict';

    const apiBase = new URL('api/', window.location.href).href;

    function toast(msg, isError) {
        const el = document.getElementById('toast');

        if (!el) {
            return;
        }

        el.textContent = msg;
        el.hidden = false;
        el.classList.toggle('toast--error', !!isError);
        el.classList.add('toast--show');
        clearTimeout(el._t);
        el._t = setTimeout(function () {
            el.classList.remove('toast--show');
            el.hidden = true;
        }, 3200);
    }

    function escapeHtml(t) {
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    async function fetchJson(url, options) {
        const res = await fetch(url, options);
        let data = {};

        try {
            data = await res.json();
        } catch (e) {
            data = {};
        }

        if (!res.ok) {
            const err = data.error || res.statusText || 'Fout';
            throw new Error(err);
        }

        return data;
    }

    async function getStats(characterId) {
        return fetchJson(
            apiBase + 'stats.php?character_id=' + encodeURIComponent(String(characterId))
        );
    }

    async function getCharacters() {
        return fetchJson(apiBase + 'characters.php');
    }

    async function createCharacter(payload) {
        return fetchJson(apiBase + 'characters.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    async function deleteCharacter(id) {
        return fetchJson(apiBase + 'character.php?id=' + encodeURIComponent(id), {
            method: 'DELETE',
        });
    }

    async function updateCharacter(payload) {
        return fetchJson(apiBase + 'character.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    async function createStat(payload) {
        return fetchJson(apiBase + 'stats.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    async function deleteStat(id) {
        return fetchJson(apiBase + 'stat.php?id=' + encodeURIComponent(id), {
            method: 'DELETE',
        });
    }

    async function updateStat(payload) {
        return fetchJson(apiBase + 'stat-edit.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    async function patchStat(id, body) {
        return fetchJson(apiBase + 'stat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.assign({ id: id }, body)),
        });
    }

    async function saveRules(id, resetOnShort, resetOnLong) {
        return fetchJson(apiBase + 'stat-rules.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                reset_on_short: resetOnShort,
                reset_on_long: resetOnLong,
            }),
        });
    }

    async function doRest(kind, characterId) {
        return fetchJson(apiBase + 'rest.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind: kind, character_id: characterId }),
        });
    }

    async function saveStatOrder(ids, characterId) {
        return fetchJson(apiBase + 'stat-order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids, character_id: characterId }),
        });
    }

    async function moveStatOrderStep(id, dir, characterId) {
        return fetchJson(apiBase + 'stat-order-move.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, dir: dir, character_id: characterId }),
        });
    }

    function buildReorderCluster(id, valueBetweenEl) {
        const wrap = document.createElement('div');
        wrap.className = 'item-reorder';

        const handle = document.createElement('span');
        handle.className = 'drag-handle';
        handle.draggable = true;
        handle.setAttribute('role', 'button');
        handle.setAttribute('tabindex', '0');
        handle.setAttribute('aria-label', 'Sleep om te sorteren');
        handle.title = 'Sleep om te sorteren';

        const touch = document.createElement('div');
        touch.className = 'reorder-touch';

        const btnUp = document.createElement('button');
        btnUp.type = 'button';
        btnUp.className = 'btn reorder-btn';
        btnUp.setAttribute('data-sort-up', String(id));
        btnUp.setAttribute('aria-label', 'Een plek omhoog');
        btnUp.textContent = '↑';

        const btnDown = document.createElement('button');
        btnDown.type = 'button';
        btnDown.className = 'btn reorder-btn';
        btnDown.setAttribute('data-sort-down', String(id));
        btnDown.setAttribute('aria-label', 'Een plek omlaag');
        btnDown.textContent = '↓';

        touch.appendChild(btnUp);

        if (valueBetweenEl) {
            touch.appendChild(valueBetweenEl);
        }

        touch.appendChild(btnDown);
        wrap.appendChild(handle);
        wrap.appendChild(touch);

        return wrap;
    }

    function bindSortableContainer(container, opts) {
        const rowSelector = opts.rowSelector || '[data-stat-id]';
        const isRowDraggable = opts.isRowDraggable || function () {
            return true;
        };

        if (container.dataset.sortableBound === '1') {
            return;
        }

        container.dataset.sortableBound = '1';

        let draggedRow = null;

        container.addEventListener('dragstart', function (e) {
            const handle = e.target.closest('.drag-handle');

            if (!handle || !container.contains(handle)) {
                return;
            }

            const row = handle.closest(rowSelector);

            if (!row || !container.contains(row) || !isRowDraggable(row)) {
                return;
            }

            draggedRow = row;
            row.classList.add('is-dragging');

            try {
                e.dataTransfer.setData('text/plain', row.getAttribute('data-stat-id'));
                e.dataTransfer.effectAllowed = 'move';
            } catch (err) {
                /* ignore */
            }
        }, true);

        container.addEventListener('dragend', function () {
            if (!draggedRow) {
                return;
            }

            const row = draggedRow;
            draggedRow = null;
            row.classList.remove('is-dragging');

            if (opts.onReorder) {
                Promise.resolve(opts.onReorder(container)).catch(function () {
                    /* onReorder may reload */
                });
            }
        });

        container.addEventListener('dragover', function (e) {
            if (!draggedRow) {
                return;
            }

            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const row = e.target.closest(rowSelector);

            if (!row || row === draggedRow || !container.contains(row) || !isRowDraggable(row)) {
                return;
            }

            const rect = row.getBoundingClientRect();
            const before = e.clientY < rect.top + rect.height / 2;

            if (before) {
                container.insertBefore(draggedRow, row);
            } else {
                container.insertBefore(draggedRow, row.nextSibling);
            }
        });
    }

    window.DndApp = {
        toast: toast,
        getStats: getStats,
        getCharacters: getCharacters,
        createCharacter: createCharacter,
        deleteCharacter: deleteCharacter,
        updateCharacter: updateCharacter,
        createStat: createStat,
        deleteStat: deleteStat,
        updateStat: updateStat,
        patchStat: patchStat,
        saveRules: saveRules,
        doRest: doRest,
        saveStatOrder: saveStatOrder,
        moveStatOrderStep: moveStatOrderStep,
    };

    function initPlay() {
        const shell = document.getElementById('play-char-shell');
        const tabsEl = document.getElementById('char-tabs');
        const track = document.getElementById('char-track');
        const viewport = document.getElementById('char-viewport');
        const swipeHint = document.getElementById('char-swipe-hint');
        const restShort = document.getElementById('btn-short-rest');
        const restLong = document.getElementById('btn-long-rest');

        if (!shell || !tabsEl || !track || !viewport) {
            return;
        }

        const STORAGE_KEY = 'dnd-active-character-id';
        let characters = [];
        let activeIndex = 0;
        let swipeStartX = 0;
        let swipeStartY = 0;
        let swipeTracking = false;

        function activeCharacterId() {
            const c = characters[activeIndex];
            return c ? Number(c.id) : 0;
        }

        function setActiveIndex(next, opts) {
            const optsObj = opts || {};
            const n = characters.length;

            if (n === 0) {
                return;
            }

            let i = next;

            if (i < 0) {
                i = 0;
            }

            if (i > n - 1) {
                i = n - 1;
            }

            activeIndex = i;
            const cid = activeCharacterId();

            if (cid && !optsObj.skipStorage) {
                try {
                    sessionStorage.setItem(STORAGE_KEY, String(cid));
                } catch (e) {
                    /* ignore */
                }
            }

            const pct = n > 0 ? (100 / n) * activeIndex : 0;
            track.style.transform = 'translateX(-' + pct + '%)';

            [...tabsEl.querySelectorAll('.char-tab')].forEach(function (btn, idx) {
                const on = idx === activeIndex;
                btn.setAttribute('aria-selected', on ? 'true' : 'false');
                btn.tabIndex = on ? 0 : -1;
                btn.classList.toggle('btn--primary', on);
            });

            if (!optsObj.skipFocus) {
                viewport.focus({ preventScroll: true });
            }
        }

        function renderStatsInto(gridEl, stats, characterId) {
            gridEl.innerHTML = '';
            gridEl.dataset.characterId = String(characterId);

            if (!stats.length) {
                gridEl.innerHTML =
                    '<p class="empty-hint">Nog geen stats voor dit personage. Maak ze aan op <a href="manage.php?character=' +
                    encodeURIComponent(String(characterId)) +
                    '">Stats aanmaken</a>.</p>';
                return;
            }

            stats.forEach(function (s) {
                const card = document.createElement('article');
                card.className = 'stat-card';
                card.setAttribute('data-stat-id', String(s.id));

                const head = document.createElement('div');
                head.className = 'stat-card__head';

                const title = document.createElement('h2');
                title.className = 'stat-card__name';
                title.textContent = s.name;

                const valuesHtml =
                    '<span class="stat-card__current">' +
                    escapeHtml(String(s.current)) +
                    '</span>' +
                    '<span class="stat-card__sep">/</span>' +
                    '<span class="stat-card__max">' +
                    escapeHtml(String(s.max)) +
                    '</span>';

                const valuesEl = document.createElement('div');
                valuesEl.className = 'stat-card__values stat-card__values--center';
                valuesEl.innerHTML = valuesHtml;

                head.appendChild(title);
                head.appendChild(valuesEl);
                head.appendChild(buildReorderCluster(s.id));

                const bar = document.createElement('div');
                bar.className = 'stat-card__bar';
                const fill = document.createElement('span');
                fill.className = 'stat-card__bar-fill';
                const pct = s.max > 0 ? Math.min(100, (s.current / s.max) * 100) : 0;
                fill.style.width = pct + '%';
                bar.appendChild(fill);

                const actions = document.createElement('div');
                actions.className = 'stat-card__actions';

                [[-10, '-10'], [-5, '-5'], [-1, '-1'], [1, '+1'], [5, '+5'], [10, '+10']].forEach(function (pair) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'btn btn--small';
                    b.textContent = pair[1];
                    b.dataset.delta = String(pair[0]);
                    actions.appendChild(b);
                });

                card.appendChild(head);
                card.appendChild(bar);
                card.appendChild(actions);
                gridEl.appendChild(card);
            });
        }

        async function loadAll() {
            try {
                characters = await getCharacters();
            } catch (e) {
                DndApp.toast(e.message, true);
                return;
            }

            if (!characters.length) {
                tabsEl.innerHTML = '';
                track.innerHTML =
                    '<div class="char-panel"><div class="play-stats-grid"><p class="empty-hint">Geen personages. Voeg er een toe via <a href="characters.php">Personages</a>.</p></div></div>';
                track.style.width = '100%';
                track.style.transform = 'translateX(0)';
                return;
            }

            let savedId = 0;

            try {
                savedId = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10);
            } catch (e) {
                savedId = 0;
            }

            let startIdx = characters.findIndex(function (c) {
                return Number(c.id) === savedId;
            });

            if (startIdx < 0) {
                startIdx = 0;
            }

            activeIndex = startIdx;
            tabsEl.innerHTML = '';
            track.innerHTML = '';

            const n = characters.length;
            track.style.width = n * 100 + '%';

            characters.forEach(function (c, idx) {
                const id = Number(c.id);
                const tab = document.createElement('button');
                tab.type = 'button';
                tab.className = 'btn char-tab';
                tab.setAttribute('role', 'tab');
                tab.id = 'char-tab-' + id;
                tab.setAttribute('aria-controls', 'char-panel-' + id);
                tab.dataset.characterIndex = String(idx);
                tab.textContent = c.name;
                tab.addEventListener('click', function () {
                    setActiveIndex(idx);
                });
                tabsEl.appendChild(tab);

                const panel = document.createElement('section');
                panel.className = 'char-panel';
                panel.id = 'char-panel-' + id;
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', 'char-tab-' + id);
                panel.style.flex = '0 0 ' + 100 / n + '%';
                panel.style.width = 100 / n + '%';

                const grid = document.createElement('div');
                grid.className = 'play-stats-grid';
                grid.setAttribute('aria-live', 'polite');
                panel.appendChild(grid);
                track.appendChild(panel);

                bindSortableContainer(grid, {
                    onReorder: async function (cont) {
                        const characterId = parseInt(cont.dataset.characterId, 10);
                        const ids = [...cont.querySelectorAll('.stat-card[data-stat-id]')].map(function (r) {
                            return parseInt(r.getAttribute('data-stat-id'), 10);
                        });

                        if (ids.length === 0) {
                            return;
                        }

                        try {
                            await saveStatOrder(ids, characterId);
                        } catch (e) {
                            DndApp.toast(e.message, true);
                            await loadAll();
                        }
                    },
                });
            });

            const statsResults = await Promise.all(
                characters.map(function (c) {
                    return getStats(Number(c.id));
                })
            );

            characters.forEach(function (c, idx) {
                const id = Number(c.id);
                const grid = track.querySelector('#char-panel-' + id + ' .play-stats-grid');

                if (grid) {
                    renderStatsInto(grid, statsResults[idx], id);
                }
            });

            setActiveIndex(activeIndex, { skipStorage: true, skipFocus: true });

            if (swipeHint) {
                const coarse = window.matchMedia('(pointer: coarse)').matches;
                swipeHint.hidden = !coarse || n < 2;
            }
        }

        track.addEventListener('click', async function (ev) {
            const grid = ev.target.closest('.play-stats-grid');

            if (!grid || !track.contains(grid)) {
                return;
            }

            const characterId = parseInt(grid.dataset.characterId, 10);
            const sortUp = ev.target.closest('[data-sort-up]');

            if (sortUp && grid.contains(sortUp)) {
                const id = parseInt(sortUp.getAttribute('data-sort-up'), 10);

                try {
                    await moveStatOrderStep(id, 'up', characterId);
                    await loadAll();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const sortDown = ev.target.closest('[data-sort-down]');

            if (sortDown && grid.contains(sortDown)) {
                const id = parseInt(sortDown.getAttribute('data-sort-down'), 10);

                try {
                    await moveStatOrderStep(id, 'down', characterId);
                    await loadAll();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const btn = ev.target.closest('button[data-delta]');

            if (!btn || !grid.contains(btn)) {
                return;
            }

            const card = btn.closest('.stat-card');
            const id = parseInt(card.getAttribute('data-stat-id'), 10);
            const delta = parseInt(btn.dataset.delta, 10);

            try {
                await patchStat(id, { delta: delta });
                await loadAll();
            } catch (e) {
                DndApp.toast(e.message, true);
            }
        });

        if (restShort) {
            restShort.addEventListener('click', async function () {
                const cid = activeCharacterId();

                if (!cid) {
                    return;
                }

                try {
                    await doRest('short', cid);
                    DndApp.toast('Short rest toegepast.');
                    await loadAll();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }
            });
        }

        if (restLong) {
            restLong.addEventListener('click', async function () {
                const cid = activeCharacterId();

                if (!cid) {
                    return;
                }

                try {
                    await doRest('long', cid);
                    DndApp.toast('Long rest toegepast.');
                    await loadAll();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }
            });
        }

        function swipeFromDelta(dx, dy) {
            if (characters.length < 2) {
                return;
            }

            if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) {
                return;
            }

            if (dx > 0) {
                setActiveIndex(activeIndex - 1);
            } else {
                setActiveIndex(activeIndex + 1);
            }
        }

        viewport.addEventListener(
            'touchstart',
            function (e) {
                if (e.touches.length !== 1) {
                    return;
                }

                if (e.target.closest('button,a,input,textarea,label,.drag-handle')) {
                    return;
                }

                swipeTracking = true;
                swipeStartX = e.touches[0].clientX;
                swipeStartY = e.touches[0].clientY;
            },
            { passive: true }
        );

        viewport.addEventListener(
            'touchend',
            function (e) {
                if (!swipeTracking) {
                    return;
                }

                swipeTracking = false;

                if (!e.changedTouches.length) {
                    return;
                }

                const dx = e.changedTouches[0].clientX - swipeStartX;
                const dy = e.changedTouches[0].clientY - swipeStartY;
                swipeFromDelta(dx, dy);
            },
            { passive: true }
        );

        let ptrDown = false;
        let ptrStartX = 0;
        let ptrStartY = 0;

        viewport.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse' || e.button !== 0) {
                return;
            }

            if (e.target.closest('button,a,input,textarea,label,.drag-handle')) {
                return;
            }

            ptrDown = true;
            ptrStartX = e.clientX;
            ptrStartY = e.clientY;
        });

        viewport.addEventListener('pointerup', function (e) {
            if (!ptrDown || e.pointerType !== 'mouse') {
                return;
            }

            ptrDown = false;
            const dx = e.clientX - ptrStartX;
            const dy = e.clientY - ptrStartY;
            swipeFromDelta(dx, dy);
        });

        viewport.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setActiveIndex(activeIndex - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setActiveIndex(activeIndex + 1);
            }
        });

        loadAll();
    }

    function initManage() {
        const form = document.getElementById('form-new-stat');
        const list = document.getElementById('manage-list');
        const charSelect = document.getElementById('manage-char-select');

        if (!form || !list || !charSelect) {
            return;
        }

        let editingId = null;

        function selectedCharacterId() {
            return parseInt(charSelect.value, 10) || 0;
        }

        function syncCharacterUrl() {
            const id = selectedCharacterId();

            if (!id) {
                return;
            }

            const u = new URL(window.location.href);
            u.searchParams.set('character', String(id));
            history.replaceState(null, '', u);
        }

        async function populateCharacterSelect() {
            let chars;

            try {
                chars = await getCharacters();
            } catch (e) {
                DndApp.toast(e.message, true);
                charSelect.innerHTML = '';
                return;
            }

            charSelect.innerHTML = '';

            if (!chars.length) {
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const wanted = parseInt(params.get('character') || '0', 10);
            const valid = chars.some(function (c) {
                return Number(c.id) === wanted;
            });
            const pick = valid ? wanted : Number(chars[0].id);

            chars.forEach(function (c) {
                const opt = document.createElement('option');
                opt.value = String(c.id);
                opt.textContent = c.name;
                charSelect.appendChild(opt);
            });

            charSelect.value = String(pick);
            syncCharacterUrl();
        }

        charSelect.addEventListener('change', async function () {
            editingId = null;
            syncCharacterUrl();
            await renderList();
        });

        async function renderList() {
            list.innerHTML = '';
            const cid = selectedCharacterId();

            if (!cid) {
                list.innerHTML = '<p class="muted">Geen personages. Voeg er een toe via Personages beheren.</p>';
                return;
            }

            let stats;

            try {
                stats = await getStats(cid);
            } catch (e) {
                DndApp.toast(e.message, true);
                return;
            }

            if (!stats.length) {
                editingId = null;
                list.innerHTML = '<p class="muted">Nog geen stats.</p>';
                return;
            }

            if (editingId !== null && !stats.some(function (x) {
                return Number(x.id) === editingId;
            })) {
                editingId = null;
            }

            stats.forEach(function (s) {
                const id = Number(s.id);
                const row = document.createElement('div');
                row.className = 'manage-row';
                row.dataset.statId = String(id);

                if (editingId === id) {
                    row.classList.add('manage-row--edit');
                    row.appendChild(buildEditForm(s));
                    list.appendChild(row);
                    return;
                }

                const restBits = [];

                if (Number(s.reset_on_short)) {
                    restBits.push('<span class="manage-row__tag">short rest</span>');
                }

                if (Number(s.reset_on_long)) {
                    restBits.push('<span class="manage-row__tag">long rest</span>');
                }

                const restHtml =
                    restBits.length > 0
                        ? ' · ' + restBits.join(' ')
                        : ' · <span class="manage-row__tag manage-row__tag--none">geen auto-reset</span>';

                const top = document.createElement('div');
                top.className = 'manage-row__top';

                const main = document.createElement('div');
                main.className = 'manage-row__main';
                main.innerHTML =
                    '<span class="manage-row__name">' +
                    escapeHtml(s.name) +
                    '</span>' +
                    '<span class="manage-row__meta">nu ' +
                    escapeHtml(String(s.current)) +
                    ' · max ' +
                    escapeHtml(String(s.max)) +
                    restHtml +
                    '</span>';

                top.appendChild(main);
                top.appendChild(buildReorderCluster(id));

                const btns = document.createElement('div');
                btns.className = 'manage-row__btns';
                btns.innerHTML =
                    '<button type="button" class="btn btn--small manage-row__edit" data-edit="' +
                    id +
                    '">Bewerken</button>' +
                    '<button type="button" class="btn btn--danger btn--small manage-row__del" data-delete="' +
                    id +
                    '">Verwijderen</button>';

                row.appendChild(top);
                row.appendChild(btns);
                list.appendChild(row);
            });
        }

        function buildEditForm(s) {
            const id = Number(s.id);
            const wrap = document.createElement('div');
            wrap.className = 'manage-edit';

            const title = document.createElement('p');
            title.className = 'manage-edit__title';
            title.textContent = 'Stat wijzigen';

            const nameLab = document.createElement('label');
            nameLab.className = 'manage-edit__field';
            nameLab.innerHTML = '<span class="manage-edit__label">Naam</span>';
            const nameIn = document.createElement('input');
            nameIn.type = 'text';
            nameIn.name = 'edit_name';
            nameIn.required = true;
            nameIn.maxLength = 120;
            nameIn.value = s.name;
            nameIn.autocomplete = 'off';
            nameLab.appendChild(nameIn);

            const maxLab = document.createElement('label');
            maxLab.className = 'manage-edit__field';
            maxLab.innerHTML = '<span class="manage-edit__label">Max</span>';
            const maxIn = document.createElement('input');
            maxIn.type = 'number';
            maxIn.name = 'edit_max';
            maxIn.required = true;
            maxIn.min = 0;
            maxIn.step = 1;
            maxIn.value = String(s.max);
            maxIn.inputMode = 'numeric';
            maxLab.appendChild(maxIn);

            const hint = document.createElement('p');
            hint.className = 'manage-edit__hint';
            hint.textContent =
                'Huidige waarde blijft behouden, tenzij die boven de nieuwe max uitkomt — dan wordt die naar max gezet.';

            const fs = document.createElement('fieldset');
            fs.className = 'form-fieldset manage-edit__fieldset';
            const leg = document.createElement('legend');
            leg.className = 'form-fieldset__legend';
            leg.textContent = 'Reset naar max bij rust';

            const cShort = document.createElement('label');
            cShort.className = 'form-check';
            const iShort = document.createElement('input');
            iShort.type = 'checkbox';
            iShort.name = 'edit_reset_short';
            iShort.checked = !!Number(s.reset_on_short);
            cShort.appendChild(iShort);
            cShort.appendChild(document.createTextNode(' Short rest'));

            const cLong = document.createElement('label');
            cLong.className = 'form-check';
            const iLong = document.createElement('input');
            iLong.type = 'checkbox';
            iLong.name = 'edit_reset_long';
            iLong.checked = !!Number(s.reset_on_long);
            cLong.appendChild(iLong);
            cLong.appendChild(document.createTextNode(' Long rest'));

            fs.appendChild(leg);
            fs.appendChild(cShort);
            fs.appendChild(cLong);

            const actions = document.createElement('div');
            actions.className = 'manage-edit__actions';

            const btnSave = document.createElement('button');
            btnSave.type = 'button';
            btnSave.className = 'btn btn--primary btn--small';
            btnSave.textContent = 'Opslaan';
            btnSave.dataset.saveEdit = String(id);

            const btnCancel = document.createElement('button');
            btnCancel.type = 'button';
            btnCancel.className = 'btn btn--small';
            btnCancel.textContent = 'Annuleren';
            btnCancel.dataset.cancelEdit = '1';

            actions.appendChild(btnSave);
            actions.appendChild(btnCancel);

            wrap.appendChild(title);
            wrap.appendChild(nameLab);
            wrap.appendChild(maxLab);
            wrap.appendChild(hint);
            wrap.appendChild(fs);
            wrap.appendChild(actions);

            return wrap;
        }

        form.addEventListener('submit', async function (ev) {
            ev.preventDefault();
            const name = form.querySelector('[name="name"]').value.trim();
            const max = parseInt(form.querySelector('[name="max"]').value, 10);
            const resetShort = form.querySelector('[name="reset_on_short"]').checked;
            const resetLong = form.querySelector('[name="reset_on_long"]').checked;

            if (!name) {
                DndApp.toast('Vul een naam in.', true);
                return;
            }

            if (Number.isNaN(max) || max < 0) {
                DndApp.toast('Max moet 0 of groter zijn.', true);
                return;
            }

            const cid = selectedCharacterId();

            if (!cid) {
                DndApp.toast('Kies eerst een personage.', true);
                return;
            }

            try {
                await createStat({
                    name: name,
                    max: max,
                    reset_on_short: resetShort,
                    reset_on_long: resetLong,
                    character_id: cid,
                });
                form.reset();
                form.querySelector('[name="max"]').value = '10';
                DndApp.toast('Stat toegevoegd.');
                await renderList();
            } catch (e) {
                DndApp.toast(e.message, true);
            }
        });

        list.addEventListener('click', async function (ev) {
            const sortUp = ev.target.closest('[data-sort-up]');

            if (sortUp && list.contains(sortUp)) {
                const id = parseInt(sortUp.getAttribute('data-sort-up'), 10);
                const cid = selectedCharacterId();

                try {
                    await moveStatOrderStep(id, 'up', cid);
                    await renderList();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const sortDown = ev.target.closest('[data-sort-down]');

            if (sortDown && list.contains(sortDown)) {
                const id = parseInt(sortDown.getAttribute('data-sort-down'), 10);
                const cid = selectedCharacterId();

                try {
                    await moveStatOrderStep(id, 'down', cid);
                    await renderList();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const editBtn = ev.target.closest('[data-edit]');

            if (editBtn && list.contains(editBtn)) {
                editingId = parseInt(editBtn.getAttribute('data-edit'), 10);
                renderList();
                const row = list.querySelector('.manage-row--edit');

                if (row) {
                    const first = row.querySelector('input[name="edit_name"]');

                    if (first) {
                        first.focus();
                    }
                }

                return;
            }

            const cancelBtn = ev.target.closest('[data-cancel-edit]');

            if (cancelBtn && list.contains(cancelBtn)) {
                editingId = null;
                renderList();
                return;
            }

            const saveBtn = ev.target.closest('[data-save-edit]');

            if (saveBtn && list.contains(saveBtn)) {
                const id = parseInt(saveBtn.getAttribute('data-save-edit'), 10);
                const row = saveBtn.closest('.manage-row--edit');

                if (!row) {
                    return;
                }

                const name = row.querySelector('input[name="edit_name"]').value.trim();
                const max = parseInt(row.querySelector('input[name="edit_max"]').value, 10);
                const resetShort = row.querySelector('input[name="edit_reset_short"]').checked;
                const resetLong = row.querySelector('input[name="edit_reset_long"]').checked;

                if (!name) {
                    DndApp.toast('Vul een naam in.', true);
                    return;
                }

                if (Number.isNaN(max) || max < 0) {
                    DndApp.toast('Max moet 0 of groter zijn.', true);
                    return;
                }

                try {
                    await updateStat({
                        id: id,
                        name: name,
                        max: max,
                        reset_on_short: resetShort,
                        reset_on_long: resetLong,
                    });
                    editingId = null;
                    DndApp.toast('Opgeslagen.');
                    await renderList();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const delBtn = ev.target.closest('[data-delete]');

            if (!delBtn || !list.contains(delBtn)) {
                return;
            }

            const id = parseInt(delBtn.getAttribute('data-delete'), 10);

            if (!confirm('Deze stat verwijderen?')) {
                return;
            }

            try {
                await deleteStat(id);

                if (editingId === id) {
                    editingId = null;
                }

                DndApp.toast('Verwijderd.');
                await renderList();
            } catch (e) {
                DndApp.toast(e.message, true);
            }
        });

        bindSortableContainer(list, {
            isRowDraggable: function (row) {
                return !row.classList.contains('manage-row--edit');
            },
            onReorder: async function (cont) {
                const ids = [...cont.querySelectorAll('.manage-row[data-stat-id]:not(.manage-row--edit)')].map(
                    function (r) {
                        return parseInt(r.dataset.statId, 10);
                    }
                );

                if (ids.length === 0) {
                    return;
                }

                try {
                    await saveStatOrder(ids, selectedCharacterId());
                } catch (e) {
                    DndApp.toast(e.message, true);
                    await renderList();
                }
            },
        });

        (async function () {
            await populateCharacterSelect();
            await renderList();
        })();
    }

    function initSettings() {
        const root = document.getElementById('settings-root');
        const charSelect = document.getElementById('settings-char-select');

        if (!root || !charSelect) {
            return;
        }

        function selectedCharacterId() {
            return parseInt(charSelect.value, 10) || 0;
        }

        function syncCharacterUrl() {
            const id = selectedCharacterId();

            if (!id) {
                return;
            }

            const u = new URL(window.location.href);
            u.searchParams.set('character', String(id));
            history.replaceState(null, '', u);
        }

        async function populateCharacterSelect() {
            let chars;

            try {
                chars = await getCharacters();
            } catch (e) {
                DndApp.toast(e.message, true);
                charSelect.innerHTML = '';
                return;
            }

            charSelect.innerHTML = '';

            if (!chars.length) {
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const wanted = parseInt(params.get('character') || '0', 10);
            const valid = chars.some(function (c) {
                return Number(c.id) === wanted;
            });
            const pick = valid ? wanted : Number(chars[0].id);

            chars.forEach(function (c) {
                const opt = document.createElement('option');
                opt.value = String(c.id);
                opt.textContent = c.name;
                charSelect.appendChild(opt);
            });

            charSelect.value = String(pick);
            syncCharacterUrl();
        }

        charSelect.addEventListener('change', async function () {
            syncCharacterUrl();
            await load();
        });

        async function load() {
            root.innerHTML = '<p class="muted">Laden…</p>';

            const cid = selectedCharacterId();

            if (!cid) {
                root.innerHTML = '<p class="muted">Geen personages. Voeg er een toe via Personages beheren.</p>';
                return;
            }

            let stats;

            try {
                stats = await getStats(cid);
            } catch (e) {
                root.innerHTML = '<p class="error-text">Kon niet laden.</p>';
                DndApp.toast(e.message, true);
                return;
            }

            root.innerHTML = '';

            if (!stats.length) {
                root.innerHTML =
                    '<p class="empty-hint">Geen stats. Voeg ze toe op <a href="manage.php?character=' +
                    encodeURIComponent(String(cid)) +
                    '">Stats aanmaken</a>.</p>';
                return;
            }

            stats.forEach(function (s) {
                const block = document.createElement('div');
                block.className = 'settings-block';
                block.dataset.id = String(s.id);

                const h = document.createElement('h2');
                h.className = 'settings-block__title';
                h.textContent = s.name;

                const fShort = fieldRow(
                    'reset-short-' + s.id,
                    'Bij short rest naar max',
                    !!Number(s.reset_on_short)
                );
                const fLong = fieldRow(
                    'reset-long-' + s.id,
                    'Bij long rest naar max',
                    !!Number(s.reset_on_long)
                );

                block.appendChild(h);
                block.appendChild(fShort);
                block.appendChild(fLong);
                root.appendChild(block);
            });
        }

        function fieldRow(inputId, labelText, checked) {
            const wrap = document.createElement('label');
            wrap.className = 'settings-check';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = inputId;
            input.checked = checked;
            const span = document.createElement('span');
            span.textContent = labelText;
            wrap.appendChild(input);
            wrap.appendChild(span);
            return wrap;
        }

        root.addEventListener('change', async function (ev) {
            const input = ev.target.closest('.settings-block input[type="checkbox"]');

            if (!input || !root.contains(input)) {
                return;
            }

            const block = input.closest('.settings-block');
            const id = parseInt(block.dataset.id, 10);
            const shortEl = block.querySelector('input[id^="reset-short-"]');
            const longEl = block.querySelector('input[id^="reset-long-"]');

            try {
                await saveRules(id, shortEl.checked, longEl.checked);
                DndApp.toast('Opgeslagen.');
            } catch (e) {
                DndApp.toast(e.message, true);
            }
        });

        (async function () {
            await populateCharacterSelect();
            await load();
        })();
    }

    function initCharacters() {
        const form = document.getElementById('form-new-character');
        const list = document.getElementById('characters-list');

        if (!form || !list) {
            return;
        }

        let editingId = null;

        async function renderList() {
            list.innerHTML = '';
            let chars;

            try {
                chars = await getCharacters();
            } catch (e) {
                DndApp.toast(e.message, true);
                return;
            }

            if (!chars.length) {
                editingId = null;
                list.innerHTML = '<p class="muted">Nog geen personages.</p>';
                return;
            }

            if (editingId !== null && !chars.some(function (x) {
                return Number(x.id) === editingId;
            })) {
                editingId = null;
            }

            chars.forEach(function (c) {
                const id = Number(c.id);
                const row = document.createElement('div');
                row.className = 'character-row';
                row.dataset.characterId = String(id);

                if (editingId === id) {
                    row.classList.add('character-row--edit');
                    const wrap = document.createElement('div');
                    wrap.className = 'character-edit';
                    const lab = document.createElement('label');
                    lab.className = 'character-edit__field';
                    lab.innerHTML = '<span class="character-edit__label">Naam</span>';
                    const inp = document.createElement('input');
                    inp.type = 'text';
                    inp.required = true;
                    inp.maxLength = 120;
                    inp.value = c.name;
                    inp.autocomplete = 'off';
                    lab.appendChild(inp);
                    const actions = document.createElement('div');
                    actions.className = 'character-edit__actions';
                    const btnSave = document.createElement('button');
                    btnSave.type = 'button';
                    btnSave.className = 'btn btn--primary btn--small';
                    btnSave.textContent = 'Opslaan';
                    btnSave.dataset.saveCharacter = String(id);
                    const btnCancel = document.createElement('button');
                    btnCancel.type = 'button';
                    btnCancel.className = 'btn btn--small';
                    btnCancel.textContent = 'Annuleren';
                    btnCancel.dataset.cancelCharacter = '1';
                    actions.appendChild(btnSave);
                    actions.appendChild(btnCancel);
                    wrap.appendChild(lab);
                    wrap.appendChild(actions);
                    row.appendChild(wrap);
                    list.appendChild(row);
                    inp.focus();
                    return;
                }

                const main = document.createElement('div');
                main.className = 'character-row__main';
                main.innerHTML =
                    '<span class="character-row__name">' +
                    escapeHtml(c.name) +
                    '</span>' +
                    '<span class="character-row__meta"><a href="manage.php?character=' +
                    encodeURIComponent(String(id)) +
                    '">Stats beheren</a> · <a href="settings.php?character=' +
                    encodeURIComponent(String(id)) +
                    '">Instellingen</a></span>';

                const btns = document.createElement('div');
                btns.className = 'character-row__btns';
                btns.innerHTML =
                    '<button type="button" class="btn btn--small" data-rename-character="' +
                    id +
                    '">Naam wijzigen</button>' +
                    '<button type="button" class="btn btn--danger btn--small" data-delete-character="' +
                    id +
                    '">Verwijderen</button>';

                row.appendChild(main);
                row.appendChild(btns);
                list.appendChild(row);
            });
        }

        form.addEventListener('submit', async function (ev) {
            ev.preventDefault();
            const name = form.querySelector('[name="name"]').value.trim();

            if (!name) {
                DndApp.toast('Vul een naam in.', true);
                return;
            }

            try {
                await createCharacter({ name: name });
                form.reset();
                DndApp.toast('Personage toegevoegd.');
                await renderList();
            } catch (e) {
                DndApp.toast(e.message, true);
            }
        });

        list.addEventListener('click', async function (ev) {
            const renameBtn = ev.target.closest('[data-rename-character]');

            if (renameBtn && list.contains(renameBtn)) {
                editingId = parseInt(renameBtn.getAttribute('data-rename-character'), 10);
                await renderList();
                return;
            }

            const cancelBtn = ev.target.closest('[data-cancel-character]');

            if (cancelBtn && list.contains(cancelBtn)) {
                editingId = null;
                await renderList();
                return;
            }

            const saveBtn = ev.target.closest('[data-save-character]');

            if (saveBtn && list.contains(saveBtn)) {
                const id = parseInt(saveBtn.getAttribute('data-save-character'), 10);
                const row = saveBtn.closest('.character-row--edit');
                const inp = row ? row.querySelector('input[type="text"]') : null;

                if (!inp) {
                    return;
                }

                const name = inp.value.trim();

                if (!name) {
                    DndApp.toast('Vul een naam in.', true);
                    return;
                }

                try {
                    await updateCharacter({ id: id, name: name });
                    editingId = null;
                    DndApp.toast('Opgeslagen.');
                    await renderList();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const delBtn = ev.target.closest('[data-delete-character]');

            if (!delBtn || !list.contains(delBtn)) {
                return;
            }

            const id = parseInt(delBtn.getAttribute('data-delete-character'), 10);

            if (!confirm('Dit personage en alle bijbehorende stats verwijderen?')) {
                return;
            }

            try {
                await deleteCharacter(id);

                if (editingId === id) {
                    editingId = null;
                }

                DndApp.toast('Verwijderd.');
                await renderList();
            } catch (e) {
                DndApp.toast(e.message, true);
            }
        });

        renderList();
    }

    document.addEventListener('DOMContentLoaded', function () {
        const id = document.body.id;

        if (id === 'page-play') {
            initPlay();
        }

        if (id === 'page-manage') {
            initManage();
        }

        if (id === 'page-settings') {
            initSettings();
        }

        if (id === 'page-characters') {
            initCharacters();
        }
    });
})();
