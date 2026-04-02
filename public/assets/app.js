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

    async function getStats() {
        return fetchJson(apiBase + 'stats.php');
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

    async function doRest(kind) {
        return fetchJson(apiBase + 'rest.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind: kind }),
        });
    }

    async function saveStatOrder(ids) {
        return fetchJson(apiBase + 'stat-order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids }),
        });
    }

    async function moveStatOrderStep(id, dir) {
        return fetchJson(apiBase + 'stat-order-move.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, dir: dir }),
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
        const root = document.getElementById('play-root');
        const restShort = document.getElementById('btn-short-rest');
        const restLong = document.getElementById('btn-long-rest');

        if (!root) {
            return;
        }

        function render(stats) {
            root.innerHTML = '';

            if (!stats.length) {
                root.innerHTML =
                    '<p class="empty-hint">Nog geen stats. Maak er eerst aan op <a href="manage.php">Stats aanmaken</a>.</p>';
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
                root.appendChild(card);
            });
        }

        function escapeHtml(t) {
            const d = document.createElement('div');
            d.textContent = t;
            return d.innerHTML;
        }

        async function load() {
            try {
                const stats = await getStats();
                render(stats);
            } catch (e) {
                DndApp.toast(e.message, true);
            }
        }

        root.addEventListener('click', async function (ev) {
            const sortUp = ev.target.closest('[data-sort-up]');

            if (sortUp && root.contains(sortUp)) {
                const id = parseInt(sortUp.getAttribute('data-sort-up'), 10);

                try {
                    await moveStatOrderStep(id, 'up');
                    await load();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const sortDown = ev.target.closest('[data-sort-down]');

            if (sortDown && root.contains(sortDown)) {
                const id = parseInt(sortDown.getAttribute('data-sort-down'), 10);

                try {
                    await moveStatOrderStep(id, 'down');
                    await load();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const btn = ev.target.closest('button[data-delta]');

            if (!btn || !root.contains(btn)) {
                return;
            }

            const card = btn.closest('.stat-card');
            const id = parseInt(card.getAttribute('data-stat-id'), 10);
            const delta = parseInt(btn.dataset.delta, 10);

            try {
                await patchStat(id, { delta: delta });
                await load();
            } catch (e) {
                DndApp.toast(e.message, true);
            }
        });

        if (restShort) {
            restShort.addEventListener('click', async function () {
                try {
                    await doRest('short');
                    DndApp.toast('Short rest toegepast.');
                    await load();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }
            });
        }

        if (restLong) {
            restLong.addEventListener('click', async function () {
                try {
                    await doRest('long');
                    DndApp.toast('Long rest toegepast.');
                    await load();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }
            });
        }

        bindSortableContainer(root, {
            onReorder: async function (cont) {
                const ids = [...cont.querySelectorAll('.stat-card[data-stat-id]')].map(function (r) {
                    return parseInt(r.getAttribute('data-stat-id'), 10);
                });

                if (ids.length === 0) {
                    return;
                }

                try {
                    await saveStatOrder(ids);
                } catch (e) {
                    DndApp.toast(e.message, true);
                    await load();
                }
            },
        });

        load();
    }

    function initManage() {
        const form = document.getElementById('form-new-stat');
        const list = document.getElementById('manage-list');

        if (!form || !list) {
            return;
        }

        let editingId = null;

        async function renderList() {
            list.innerHTML = '';
            let stats;

            try {
                stats = await getStats();
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

        function escapeHtml(t) {
            const d = document.createElement('div');
            d.textContent = t;
            return d.innerHTML;
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

            try {
                await createStat({
                    name: name,
                    max: max,
                    reset_on_short: resetShort,
                    reset_on_long: resetLong,
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

                try {
                    await moveStatOrderStep(id, 'up');
                    await renderList();
                } catch (e) {
                    DndApp.toast(e.message, true);
                }

                return;
            }

            const sortDown = ev.target.closest('[data-sort-down]');

            if (sortDown && list.contains(sortDown)) {
                const id = parseInt(sortDown.getAttribute('data-sort-down'), 10);

                try {
                    await moveStatOrderStep(id, 'down');
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
                    await saveStatOrder(ids);
                } catch (e) {
                    DndApp.toast(e.message, true);
                    await renderList();
                }
            },
        });

        renderList();
    }

    function initSettings() {
        const root = document.getElementById('settings-root');

        if (!root) {
            return;
        }

        function escapeHtml(t) {
            const d = document.createElement('div');
            d.textContent = t;
            return d.innerHTML;
        }

        async function load() {
            root.innerHTML = '<p class="muted">Laden…</p>';

            let stats;

            try {
                stats = await getStats();
            } catch (e) {
                root.innerHTML = '<p class="error-text">Kon niet laden.</p>';
                DndApp.toast(e.message, true);
                return;
            }

            root.innerHTML = '';

            if (!stats.length) {
                root.innerHTML =
                    '<p class="empty-hint">Geen stats. Voeg ze toe op <a href="manage.php">Stats aanmaken</a>.</p>';
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

        load();
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
    });
})();
