/* Logica condivisa dei cataloghi. Le schede restano nel DOM durante il cambio vista. */
(() => {
    'use strict';

    const GENRES = new Map(Object.entries({
        28: 'Azione', 12: 'Avventura', 16: 'Animazione', 35: 'Commedia', 80: 'Crime',
        99: 'Documentario', 18: 'Dramma', 10751: 'Famiglia', 14: 'Fantasy', 36: 'Storia',
        27: 'Horror', 10402: 'Musica', 9648: 'Mistero', 10749: 'Romance', 878: 'Fantascienza',
        10770: 'televisione film', 53: 'Thriller', 10752: 'Guerra', 37: 'Western',
        10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
        10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
    }));
    const STATE_KEY = 'homecinema:catalog-controls:v1';
    const CACHE_KEY = 'catalog-v1';
    const PINNED_KEY = 'homecinema:pinned-movies:v1';
    const VALID_SORTS = ['Titolo', 'Durata', 'Anno', 'Voto'];
    const search = document.querySelector('.search-input');
    const sortInput = document.getElementById('sort-select');
    const filterCombineInput = document.getElementById('filter-combine');
    const count = document.getElementById('#risultati');
    const listRow = document.getElementById('filtri-avanzati-liste');
    const mediaTypeRow = document.getElementById('filtri-avanzati-tipo');
    const genreRow = document.getElementById('filtri-avanzati-generi');
    const collator = new Intl.Collator('it', { sensitivity: 'base', numeric: true });
    const views = {
        online: createView('online'),
        local: createView('local')
    };
    let active = location.pathname.endsWith('/local.html') ? 'local' : 'online';
    let renderScheduled = false;
    let databasePromise;
    let activeRequests = 0;
    const requestWaiters = [];
    const durations = new Map();
    const durationRequests = new Map();
    const pinnedMovies = readPinnedMovies();
    const pinStatus = document.getElementById('pin-status');
    const pinnedCount = document.getElementById('pinned-count');
    const clearPinnedButton = document.getElementById('clear-pinned');
    const diceSpotlight = document.getElementById('dice-spotlight');

    function closeDiceSpotlight(restoreFocus = true) {
        if (!diceSpotlight || diceSpotlight.hidden) return;
        diceSpotlight.hidden = true;
        document.body.classList.remove('dice-spotlight-open');
        if (restoreFocus) document.querySelector('.dice-button')?.focus();
    }

    function showDiceSpotlight(item) {
        if (!diceSpotlight) return;
        const title = itemTitle(item);
        const type = itemType(item) === 'tv' ? 'Serie TV' : 'Film';
        const date = itemType(item) === 'tv' ? item.first_air_date : item.release_date;
        const year = date ? String(date).slice(0, 4) : '';
        const runtime = itemDuration(item);
        const rating = Number(item.vote_average);
        const meta = [type, year, runtime ? (itemType(item) === 'tv' ? runtime + ' min/episodio' : runtime + ' min') : '',
            Number.isFinite(rating) && rating > 0 ? 'TMDB ' + rating.toFixed(1) + '/10' : ''].filter(Boolean).join(' · ');
        const poster = document.getElementById('dice-spotlight-poster');
        poster.src = item.poster_path ? 'https://image.tmdb.org/t/p/w500' + item.poster_path : '';
        poster.alt = title ? 'Locandina di ' + title : '';
        poster.hidden = !item.poster_path;
        document.getElementById('dice-spotlight-title').textContent = title || 'Titolo senza nome';
        document.getElementById('dice-spotlight-meta').textContent = meta;
        document.getElementById('dice-spotlight-overview').textContent = item.overview || 'Nessuna descrizione disponibile.';
        diceSpotlight.hidden = false;
        document.body.classList.add('dice-spotlight-open');
        diceSpotlight.querySelector('.dice-spotlight-close').focus();
    }

    function createView(name) {
        return {
            name, main: document.getElementById('catalog-' + name), records: new Map(),
            filters: readState(name), scroll: 0, status: '', loaded: false,
            nextNodeId: 0, retryTimer: null, retryCount: 0, needsRetry: false,
            durationPromise: null, durationChecked: new Set(), durationFailed: new Set(), durationRetryTimer: null
        };
    }

    function readState(name) {
        try {
            const saved = JSON.parse(localStorage.getItem(STATE_KEY) || '{}')[name] || {};
            return {
                query: typeof saved.query === 'string' ? saved.query : '',
                lists: new Set(Array.isArray(saved.lists) ? saved.lists.map(String) : []),
                genres: new Set(Array.isArray(saved.genres) ? saved.genres.map(String) : []),
                mediaType: saved.mediaType === 'movie' || saved.mediaType === 'tv' ? saved.mediaType : '',
                sort: VALID_SORTS.includes(saved.sort) ? saved.sort : '',
                combine: saved.combine === 'any' ? 'any' : 'all'
            };
        } catch (_) {
            return { query: '', lists: new Set(), genres: new Set(), mediaType: '', sort: '', combine: 'all' };
        }
    }

    function saveState() {
        const state = {};
        for (const [name, view] of Object.entries(views)) {
            state[name] = {
                query: view.filters.query, lists: [...view.filters.lists],
                genres: [...view.filters.genres], mediaType: view.filters.mediaType, sort: view.filters.sort,
                combine: view.filters.combine
            };
        }
        try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (_) { /* storage facoltativo */ }
    }

    function openDatabase() {
        if (!databasePromise) {
            databasePromise = new Promise(resolve => {
                try {
                    const request = indexedDB.open('homecinema-cache', 1);
                    request.onupgradeneeded = () => request.result.createObjectStore('cache');
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => resolve(null);
                    request.onblocked = () => resolve(null);
                } catch (_) { resolve(null); }
            });
        }
        return databasePromise;
    }

    async function cacheGet(key) {
        const db = await openDatabase();
        if (!db) return null;
        return new Promise(resolve => {
            try {
                const request = db.transaction('cache', 'readonly').objectStore('cache').get(key);
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => resolve(null);
            } catch (_) { resolve(null); }
        });
    }

    async function cachePut(key, value) {
        const db = await openDatabase();
        if (!db) return;
        return new Promise(resolve => {
            try {
                const transaction = db.transaction('cache', 'readwrite');
                transaction.objectStore('cache').put(value, key);
                transaction.oncomplete = transaction.onerror = transaction.onabort = () => resolve();
            } catch (_) { resolve(); }
        });
    }

    function itemType(item) {
        return item.media_type === 'tv' || (!item.title && (item.name || item.original_name)) ? 'tv' : 'movie';
    }

    function itemKey(item) { return itemType(item) + ':' + item.id; }
    function itemTitle(item) {
        return itemType(item) === 'tv' ? (item.name || item.original_name || '') : (item.original_title || item.title || '');
    }
    function normalize(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it');
    }
    function itemGenres(item) {
        return Array.isArray(item.genre_ids) ? item.genre_ids.map(String) : [];
    }
    function itemDuration(item) {
        const value = item.runtime || (Array.isArray(item.episode_run_time) && item.episode_run_time.find(n => n > 0))
            || (item.last_episode_to_air && item.last_episode_to_air.runtime);
        return Number(value) > 0 ? Number(value) : null;
    }

    function readPinnedMovies() {
        const pinned = new Map();
        try {
            const saved = JSON.parse(localStorage.getItem(PINNED_KEY) || '[]');
            if (!Array.isArray(saved)) return pinned;
            for (const entry of saved) {
                if (!entry || !entry.item || entry.item.id == null) continue;
                pinned.set(itemKey(entry.item), {
                    item: entry.item,
                    sources: Array.isArray(entry.sources) ? entry.sources.map(String) : []
                });
            }
        } catch (_) { /* Lo storage locale è facoltativo. */ }
        return pinned;
    }

    function savePinnedMovies() {
        try {
            localStorage.setItem(PINNED_KEY, JSON.stringify([...pinnedMovies.values()]));
        } catch (_) {
            if (pinStatus) pinStatus.textContent = 'Impossibile salvare i film fissati in questo browser.';
        }
    }

    function updatePinnedCount() {
        if (pinnedCount) pinnedCount.textContent = pinnedMovies.size + (pinnedMovies.size === 1 ? ' titolo fissato' : ' titoli fissati');
        if (clearPinnedButton) clearPinnedButton.disabled = pinnedMovies.size === 0;
    }

    function ensurePinnedRecords(view) {
        for (const [key, saved] of pinnedMovies) {
            const exists = [...view.records.values()].some(record => itemKey(record.item) === key);
            if (!exists) view.records.set(key, makeRecord(saved.item, saved.sources, '', true));
        }
    }

    function updatePinButton(record) {
        if (!record.node) return;
        record.pinned = pinnedMovies.has(itemKey(record.item));
        record.node.classList.toggle('is-pinned', record.pinned);
        record.node.dataset.pinned = String(record.pinned);
        const button = record.node.querySelector('.pin-card-button');
        if (!button) return;
        const kind = itemType(record.item) === 'tv' ? 'la serie' : 'il film';
        button.setAttribute('aria-pressed', String(record.pinned));
        button.setAttribute('aria-label', record.pinned ? 'Rimuovi ' + kind + ' dai fissati' : 'Fissa ' + kind);
        button.title = record.pinned ? 'Rimuovi ' + kind + ' dai fissati' : 'Fissa ' + kind;
        button.textContent = record.pinned ? '📌' : '📍';
    }

    function updateRuntimeLabel(record) {
        if (!record.node) return;
        const label = record.node.querySelector('.preview-runtime');
        if (!label) return;
        const duration = durations.get(itemKey(record.item)) ?? itemDuration(record.item);
        if (!duration) {
            label.textContent = '';
            label.hidden = true;
            return;
        }
        label.textContent = (itemType(record.item) === 'tv' ? 'Episodio: ' : '') + format_runtime(duration);
        label.hidden = false;
    }

    function matchesCurrentFilters(view, record) {
        // I titoli già fissati restano visibili anche se non corrispondono ai filtri.
        if (pinnedMovies.has(itemKey(record.item))) return true;
        const query = normalize(view.filters.query.trim());
        const titles = [record.item.title, record.item.original_title, record.item.name, record.item.original_name].map(normalize);
        const rules = [];
        if (query) rules.push(titles.some(title => title.includes(query)));
        if (view.filters.lists.size) rules.push([...view.filters.lists].some(name => record.sources.has(name)));
        const genres = itemGenres(record.item);
        if (view.filters.genres.size) rules.push([...view.filters.genres].some(id => genres.includes(id)));
        if (view.filters.mediaType) rules.push(itemType(record.item) === view.filters.mediaType);
        if (!rules.length) return true;
        return view.filters.combine === 'any' ? rules.some(Boolean) : rules.every(Boolean);
    }

    function togglePinned(record) {
        if (!record) return;
        const key = itemKey(record.item);
        if (pinnedMovies.has(key)) {
            pinnedMovies.delete(key);
            if (pinStatus) pinStatus.textContent = 'Titolo rimosso dai fissati.';
        } else {
            pinnedMovies.set(key, { item: record.item, sources: [...record.sources] });
            if (pinStatus) pinStatus.textContent = 'Titolo fissato in questo browser.';
        }
        savePinnedMovies();
        for (const view of Object.values(views)) {
            if (pinnedMovies.has(key)) ensurePinnedRecords(view);
            for (const [recordKey, candidate] of view.records) {
                if (itemKey(candidate.item) !== key) continue;
                candidate.pinned = pinnedMovies.has(key);
                if (!candidate.pinned && candidate.pinOnly) {
                    candidate.node?.remove();
                    view.records.delete(recordKey);
                } else updatePinButton(candidate);
            }
        }
        updatePinnedCount();
        scheduleRender();
    }

    function pinVisibleFilms() {
        const view = views[active];
        let newlyPinned = 0;
        for (const record of view.records.values()) {
            if (!matchesCurrentFilters(view, record)) continue;
            const key = itemKey(record.item);
            if (pinnedMovies.has(key)) continue;
            pinnedMovies.set(key, { item: record.item, sources: [...record.sources] });
            newlyPinned++;
        }
        if (!newlyPinned) {
            if (pinStatus) pinStatus.textContent = 'Nessun nuovo titolo visibile da fissare.';
            return;
        }
        savePinnedMovies();
        for (const view of Object.values(views)) {
            ensurePinnedRecords(view);
            for (const record of view.records.values()) updatePinButton(record);
        }
        updatePinnedCount();
        if (pinStatus) pinStatus.textContent = newlyPinned + (newlyPinned === 1 ? ' titolo fissato.' : ' titoli fissati.');
        scheduleRender();
    }

    function clearPinnedTitles() {
        if (!pinnedMovies.size) {
            if (pinStatus) pinStatus.textContent = 'Non ci sono titoli fissati da svuotare.';
            return;
        }
        pinnedMovies.clear();
        savePinnedMovies();
        for (const view of Object.values(views)) {
            for (const [recordKey, record] of view.records) {
                record.pinned = false;
                if (record.pinOnly) {
                    record.node?.remove();
                    view.records.delete(recordKey);
                } else {
                    updatePinButton(record);
                }
            }
        }
        updatePinnedCount();
        if (pinStatus) pinStatus.textContent = 'Elenco dei titoli fissati svuotato.';
        scheduleRender();
    }

    function pickPinnedAtRandom() {
        const choices = [...pinnedMovies.values()];
        if (!choices.length) {
            if (pinStatus) pinStatus.textContent = 'Fissa almeno un titolo prima di usare il dado.';
            return;
        }
        if (pinStatus) pinStatus.textContent = 'Estrazione in corso…';
        const chosen = choices[Math.floor(Math.random() * choices.length)];
        const key = itemKey(chosen.item);
        const view = views[active];
        ensurePinnedRecords(view);
        const record = [...view.records.values()].find(candidate => itemKey(candidate.item) === key);
        if (!record) return;
        ensureNode(view, record);
        scheduleRender();
        requestAnimationFrame(() => {
            const card = [...view.main.querySelectorAll('.card')].find(node => node.dataset.itemKey === key);
            if (card) {
                view.main.querySelectorAll('.card-dice-picked').forEach(node => node.classList.remove('card-dice-picked'));
                card.classList.add('card-dice-picked');
                if (typeof card.scrollIntoView === 'function') card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            showDiceSpotlight(chosen.item);
            if (pinStatus) pinStatus.textContent = '🎲 ' + itemTitle(chosen.item);
        });
    }

    function makeRecord(item, sources, play = '', pinOnly = false) {
        return { item, sources: new Set(sources), play, node: null, pinOnly, pinned: pinnedMovies.has(itemKey(item)) };
    }

    function mergeRecord(map, item, source, play = '') {
        if (!item || item.id == null) return null;
        // I file locali diversi associati allo stesso titolo restano selezionabili.
        const key = itemKey(item) + (source === 'Locale' && play ? '|' + play : '');
        let record = map.get(key);
        if (!record) {
            record = makeRecord(item, [source], play);
            map.set(key, record);
        } else {
            record.pinOnly = false;
            record.pinned = pinnedMovies.has(itemKey(item));
            record.sources.add(source);
            // Un elenco diverso può fornire campi che mancavano nella prima risposta.
            for (const [field, value] of Object.entries(item)) {
                if ((record.item[field] == null || record.item[field] === '') && value != null) record.item[field] = value;
            }
            if (Array.isArray(item.genre_ids)) {
                record.item.genre_ids = [...new Set([...(record.item.genre_ids || []), ...item.genre_ids])];
            }
            if (!record.play && play) record.play = play;
        }
        return record;
    }

    function ensureNode(view, record) {
        if (record.node) return;
        const builder = itemType(record.item) === 'tv' ? html_tv_preview : html_movie_preview;
        const template = document.createElement('template');
        const prefix = view.name === 'local' ? 'local-' + view.nextNodeId++ + '-' : view.name + '-';
        template.innerHTML = builder([...record.sources], record.item, record.play, prefix);
        record.node = template.content.firstElementChild;
        record.node.dataset.recordKey = [...view.records.entries()].find(([, value]) => value === record)?.[0] || itemKey(record.item);
        view.main.appendChild(record.node);
        updatePinButton(record);
        updateRuntimeLabel(record);
    }

    function refreshRecordNode(record) {
        if (!record.node) return;
        const builder = itemType(record.item) === 'tv' ? html_tv_preview : html_movie_preview;
        const template = document.createElement('template');
        template.innerHTML = builder([...record.sources], record.item, record.play, '');
        const updated = template.content.firstElementChild;
        for (const selector of ['.preview-list-badges', '.preview-meta']) {
            const current = record.node.querySelector(selector), replacement = updated.querySelector(selector);
            if (current && replacement) current.replaceWith(replacement);
        }
        const title = record.node.querySelector('.preview-title');
        const date = record.node.querySelector('.preview-date');
        const overview = record.node.querySelector('.preview-overview');
        const image = record.node.querySelector('.card-image');
        if (title) title.textContent = itemTitle(record.item);
        if (date) date.textContent = record.item.release_date || record.item.first_air_date || '';
        if (overview) overview.textContent = record.item.overview || '';
        if (image) {
            image.alt = record.item.title || record.item.name || itemTitle(record.item);
            if (record.item.poster_path) image.src = 'https://image.tmdb.org/t/p/' + (itemType(record.item) === 'tv' ? 'w300' : 'w342') + record.item.poster_path;
            else image.removeAttribute('src');
        }
        record.node.dataset.lists = JSON.stringify([...record.sources]);
        updatePinButton(record);
        updateRuntimeLabel(record);
    }

    function adoptRecords(view, fresh) {
        for (const [key, saved] of pinnedMovies) {
            if (![...fresh.values()].some(record => itemKey(record.item) === key)) {
                fresh.set(key, makeRecord(saved.item, saved.sources, '', true));
            }
        }
        for (const [key, record] of fresh) {
            const old = view.records.get(key);
            if (old && old.node) {
                record.node = old.node;
                record.pinOnly = old.pinOnly && !pinnedMovies.has(itemKey(record.item));
            }
            record.pinned = pinnedMovies.has(itemKey(record.item));
        }
        for (const [key, record] of view.records) {
            if (!fresh.has(key) && record.node) record.node.remove();
        }
        view.records = fresh;
        for (const record of view.records.values()) refreshRecordNode(record);
        scheduleRender();
    }

    function scheduleRender() {
        if (renderScheduled) return;
        renderScheduled = true;
        requestAnimationFrame(() => {
            renderScheduled = false;
            renderView(views[active]);
        });
    }

    function renderFilters(view) {
        const lists = new Set(view.filters.lists);
        const genres = new Set(view.filters.genres);
        for (const record of view.records.values()) {
            record.sources.forEach(source => lists.add(source));
            itemGenres(record.item).forEach(id => genres.add(id));
        }
        listRow.replaceChildren();
        mediaTypeRow.replaceChildren();
        genreRow.replaceChildren();
        for (const name of [...lists].sort(collator.compare)) {
            const template = document.createElement('template');
            template.innerHTML = html_filtro_lista(name);
            const button = template.content.firstElementChild;
            button.dataset.value = name;
            button.setAttribute('aria-pressed', String(view.filters.lists.has(name)));
            listRow.appendChild(button);
        }
        for (const id of [...genres].sort((a, b) => collator.compare(GENRES.get(a) || a, GENRES.get(b) || b))) {
            const template = document.createElement('template');
            template.innerHTML = html_filtro_genere(id, GENRES.get(id) || ('Genere ' + id));
            const button = template.content.firstElementChild;
            button.dataset.value = id;
            button.setAttribute('aria-pressed', String(view.filters.genres.has(id)));
            genreRow.appendChild(button);
        }
        for (const [type, label] of [['movie', 'Film'], ['tv', 'Serie TV']]) {
            const template = document.createElement('template');
            template.innerHTML = html_filtro_tipo(type, label);
            const button = template.content.firstElementChild;
            button.setAttribute('aria-pressed', String(view.filters.mediaType === type));
            mediaTypeRow.appendChild(button);
        }
    }

    function compareRecords(a, b, sort) {
        const titleComparison = collator.compare(itemTitle(a.item), itemTitle(b.item));
        if (sort === 'Titolo') return titleComparison;
        let av = null, bv = null;
        if (sort === 'Anno') {
            const dateA = a.item.release_date || a.item.first_air_date || '';
            const dateB = b.item.release_date || b.item.first_air_date || '';
            av = /^\d{4}/.test(dateA) ? Number(dateA.slice(0, 4)) : null;
            bv = /^\d{4}/.test(dateB) ? Number(dateB.slice(0, 4)) : null;
        } else if (sort === 'Voto') {
            av = a.item.vote_average != null && a.item.vote_count !== 0 ? Number(a.item.vote_average) : null;
            bv = b.item.vote_average != null && b.item.vote_count !== 0 ? Number(b.item.vote_average) : null;
        } else if (sort === 'Durata') {
            av = durations.get(itemKey(a.item)) ?? itemDuration(a.item);
            bv = durations.get(itemKey(b.item)) ?? itemDuration(b.item);
        }
        if (!Number.isFinite(av)) av = null;
        if (!Number.isFinite(bv)) bv = null;
        if (av == null && bv == null) return titleComparison;
        if (av == null) return 1;
        if (bv == null) return -1;
        const difference = sort === 'Durata' ? av - bv : bv - av;
        return difference || titleComparison;
    }

    function renderView(view) {
        ensurePinnedRecords(view);
        renderFilters(view);
        const ordered = [...view.records.values()];
        ordered.sort((a, b) => {
            const aPinned = pinnedMovies.has(itemKey(a.item)), bPinned = pinnedMovies.has(itemKey(b.item));
            if (aPinned !== bPinned) return aPinned ? -1 : 1;
            return view.filters.sort ? compareRecords(a, b, view.filters.sort) : 0;
        });
        let visible = 0;
        ordered.forEach((record, index) => {
            ensureNode(view, record);
            record.pinned = pinnedMovies.has(itemKey(record.item));
            updatePinButton(record);
            const item = record.item;
            const genres = itemGenres(item);
            const show = matchesCurrentFilters(view, record);
            record.node.style.display = show ? '' : 'none';
            record.node.style.order = String(index);
            record.node.dataset.lists = JSON.stringify([...record.sources]);
            record.node.dataset.genres = genres.join(' ');
            if (show) visible++;
        });
        let status = view.status;
        if (!status && view.filters.sort === 'Durata' && view.durationPromise) status = 'durate in aggiornamento';
        if (!status && view.filters.sort === 'Durata' && !navigator.onLine && ordered.some(record => !durations.has(itemKey(record.item)) && !itemDuration(record.item))) {
            status = 'alcune durate non disponibili offline';
        }
        if (!status && view.filters.sort === 'Durata' && !view.durationPromise && ordered.some(record => !durations.has(itemKey(record.item)) && !itemDuration(record.item)) && ordered.every(record => durations.has(itemKey(record.item)) || itemDuration(record.item) || view.durationChecked.has(itemKey(record.item)))) {
            status = 'alcune durate non disponibili';
        }
        count.textContent = visible + (visible === 1 ? ' titolo' : ' titoli') + (status ? ' · ' + status : '');
        if (view.filters.sort === 'Durata') loadDurations(view);
    }

    function setView(name, push = false) {
        if (!views[name]) return;
        if (active !== name) views[active].scroll = window.scrollY;
        active = name;
        for (const view of Object.values(views)) view.main.style.display = view.name === active ? '' : 'none';
        const view = views[active];
        search.value = view.filters.query;
        sortInput.value = view.filters.sort;
        filterCombineInput.value = view.filters.combine;
        if (push) {
            try { history.pushState({ catalog: name }, '', name === 'online' ? 'home.html' : 'local.html'); }
            catch (_) { /* Il cambio vista funziona anche se il browser blocca History API. */ }
        }
        window.scrollTo(0, view.scroll);
        scheduleRender();
        if (name === 'online' && !view.loaded) startOnline();
    }

    function toggleFilter(kind, value) {
        const set = views[active].filters[kind];
        if (set.has(value)) set.delete(value); else set.add(value);
        saveState();
        scheduleRender();
    }

    search.addEventListener('input', () => {
        views[active].filters.query = search.value;
        saveState();
        scheduleRender();
    });
    filterCombineInput.addEventListener('change', () => {
        views[active].filters.combine = filterCombineInput.value === 'any' ? 'any' : 'all';
        saveState();
        scheduleRender();
    });
    sortInput.addEventListener('input', () => {
        const match = VALID_SORTS.find(option => normalize(option) === normalize(sortInput.value.trim()));
        if (match || !sortInput.value.trim()) {
            views[active].filters.sort = match || '';
            saveState();
            scheduleRender();
        }
    });
    sortInput.addEventListener('change', () => {
        sortInput.value = views[active].filters.sort;
    });
    listRow.addEventListener('click', event => {
        const button = event.target.closest('.filter-list');
        if (button) toggleFilter('lists', button.dataset.value);
    });
    genreRow.addEventListener('click', event => {
        const button = event.target.closest('.filter-genre');
        if (button) toggleFilter('genres', button.dataset.value);
    });
    mediaTypeRow.addEventListener('click', event => {
        const button = event.target.closest('.filter-media-type');
        if (!button) return;
        const type = button.dataset.value;
        views[active].filters.mediaType = views[active].filters.mediaType === type ? '' : type;
        saveState();
        scheduleRender();
    });
    document.getElementById('pin-visible').addEventListener('click', pinVisibleFilms);
    clearPinnedButton.addEventListener('click', clearPinnedTitles);
    document.querySelector('.dice-button').addEventListener('click', pickPinnedAtRandom);
    document.querySelector('.dice-spotlight-close')?.addEventListener('click', () => closeDiceSpotlight());
    document.querySelector('.dice-spotlight-again')?.addEventListener('click', () => {
        closeDiceSpotlight(false);
        pickPinnedAtRandom();
    });
    document.querySelector('.dice-spotlight-backdrop')?.addEventListener('click', () => closeDiceSpotlight());
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeDiceSpotlight();
        if (event.key === 'Tab' && diceSpotlight && !diceSpotlight.hidden) {
            const controls = [...diceSpotlight.querySelectorAll('button:not([disabled])')];
            if (!controls.length) return;
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    for (const view of Object.values(views)) {
        view.main.addEventListener('click', event => {
            const button = event.target.closest('.pin-card-button');
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            const card = button.closest('.card');
            const record = [...view.records.values()].find(candidate => candidate.node === card);
            togglePinned(record);
        });
        view.main.addEventListener('pointerover', event => {
            const card = event.target.closest('.card');
            if (!card || card.contains(event.relatedTarget)) return;
            const record = [...view.records.values()].find(candidate => candidate.node === card);
            if (record) loadOneDuration(view, record);
        });
    }
    document.querySelectorAll('.navbar-nav a').forEach(link => {
        link.addEventListener('click', event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const href = link.getAttribute('href');
            if (href !== 'home.html' && href !== 'local.html') return;
            event.preventDefault();
            const destination = href === 'home.html' ? 'online' : 'local';
            if (destination !== active) setView(destination, true);
        });
    });
    window.addEventListener('popstate', () => setView(location.pathname.endsWith('/local.html') ? 'local' : 'online'));

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    async function acquireRequestSlot() {
        if (activeRequests < 4) {
            activeRequests++;
        } else {
            // Lo slot viene trasferito direttamente dal rilascio al prossimo in attesa.
            await new Promise(resolve => requestWaiters.push(resolve));
        }
    }
    function releaseRequestSlot() {
        const next = requestWaiters.shift();
        if (next) next(); else activeRequests--;
    }
    async function fetchJson(path, params = {}) {
        const url = new URL('https://api.themoviedb.org' + path);
        url.searchParams.set('language', 'it-IT');
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
        let lastError;
        for (let attempt = 0; attempt < 4; attempt++) {
            await acquireRequestSlot();
            let retryDelay = 0;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            try {
                const response = await fetch(url, {
                    headers: { Authorization: 'Bearer ' + window.HOMECINEMA_TMDB_TOKEN, Accept: 'application/json' },
                    signal: controller.signal
                });
                if (response.status === 429 || response.status >= 500) {
                    const retryAfter = Number(response.headers.get('Retry-After'));
                    retryDelay = Math.max(500 * (2 ** attempt), Number.isFinite(retryAfter) ? retryAfter * 1000 : 0);
                    lastError = new Error('TMDB HTTP ' + response.status);
                } else if (!response.ok) {
                    throw new Error('TMDB HTTP ' + response.status);
                } else {
                    return await response.json();
                }
            } catch (error) {
                lastError = error;
                if (!retryDelay && error.message && error.message.startsWith('TMDB HTTP ')) throw error;
                retryDelay = retryDelay || 500 * (2 ** attempt);
            } finally {
                clearTimeout(timeout);
                releaseRequestSlot();
            }
            if (attempt < 3) await sleep(Math.min(retryDelay, 10000));
        }
        throw lastError || new Error('Errore durante la richiesta TMDB');
    }

    async function getAllPages(path, onPage) {
        let page = 1;
        let total = 1;
        do {
            const data = await fetchJson(path, { page });
            onPage(Array.isArray(data.results) ? data.results : []);
            total = Math.max(1, Number(data.total_pages) || 1);
            page++;
            if (page <= total) await sleep(150);
        } while (page <= total);
    }

    async function startOnline() {
        const view = views.online;
        if (view.loaded) return;
        view.loaded = true;
        view.needsRetry = false;
        clearTimeout(view.retryTimer);
        view.retryTimer = null;
        view.status = 'caricamento';
        const cached = await cacheGet(CACHE_KEY);
        if (cached && Array.isArray(cached.records)) {
            const restored = new Map();
            for (const entry of cached.records) {
                if (!entry.item || entry.item.id == null || !Array.isArray(entry.sources)) continue;
                restored.set(itemKey(entry.item), makeRecord(entry.item, entry.sources));
            }
            if (restored.size) {
                adoptRecords(view, restored);
                view.status = 'aggiornamento';
            }
        }
        const hasCache = Boolean(cached && Array.isArray(cached.records) && cached.records.length);
        const hasExisting = [...view.records.values()].some(record => !record.pinOnly);
        scheduleRender();
        const fresh = new Map();
        let incomplete = false;
        const sources = [];
        for (const category of ['watchlist', 'favorite', 'rated']) {
            for (const kind of ['movies', 'tv']) {
                sources.push({ label: category, path: '/3/account/' + window.HOMECINEMA_TMDB_ACCOUNT + '/' + category + '/' + kind });
            }
        }
        let nextSource = 0;
        async function worker() {
            while (nextSource < sources.length) {
                const source = sources[nextSource++];
                try {
                    await getAllPages(source.path, items => {
                        for (const item of items) mergeRecord(fresh, item, source.label);
                        if (!hasExisting) {
                            view.records = fresh;
                            scheduleRender();
                        }
                    });
                } catch (error) {
                    incomplete = true;
                    console.error('Impossibile caricare la fonte ' + source.label + ':', error);
                }
            }
        }
        const loadLists = getAllPages('/3/account/' + window.HOMECINEMA_TMDB_ACCOUNT + '/lists', lists => {
            for (const list of lists) {
                if (list.id != null && list.name) sources.push({ label: list.name, path: '/4/list/' + list.id });
            }
        }).catch(error => {
            incomplete = true;
            console.error('Impossibile caricare le liste TMDB:', error);
        });
        // Le categorie principali non aspettano una richiesta liste lenta o bloccata.
        await Promise.all([loadLists, ...Array.from({ length: 4 }, worker)]);
        // Le liste possono essere arrivate dopo che i primi worker hanno terminato.
        await Promise.all(Array.from({ length: Math.min(4, sources.length) }, worker));
        if (!incomplete) {
            adoptRecords(view, fresh);
            view.status = '';
            view.retryCount = 0;
            await cachePut(CACHE_KEY, {
                records: [...fresh.values()].map(record => ({ item: record.item, sources: [...record.sources] })),
                savedAt: Date.now()
            });
        } else {
            // Una risposta parziale non sostituisce la copia completa conservata nel browser.
            view.status = hasCache ? 'aggiornamento non riuscito, dati salvati' : 'caricamento incompleto';
            view.needsRetry = true;
            view.retryCount++;
            const wait = Math.min(30000 * (2 ** Math.min(view.retryCount - 1, 3)), 240000);
            view.retryTimer = setTimeout(retryOnline, wait);
        }
        scheduleRender();
    }

    function retryOnline() {
        const view = views.online;
        if (!view.needsRetry || !navigator.onLine) return;
        view.loaded = false;
        startOnline();
    }

    function requestDuration(record) {
        const key = itemKey(record.item);
        const known = durations.get(key) ?? itemDuration(record.item);
        if (known) return Promise.resolve(known);
        if (durationRequests.has(key)) return durationRequests.get(key);
        const request = fetchJson('/3/' + itemType(record.item) + '/' + record.item.id).then(async detail => {
            const duration = itemDuration(detail) || Number(detail.last_episode_to_air && detail.last_episode_to_air.runtime) || null;
            if (duration > 0) {
                durations.set(key, duration);
                for (const view of Object.values(views)) {
                    for (const candidate of view.records.values()) {
                        if (itemKey(candidate.item) === key) updateRuntimeLabel(candidate);
                    }
                }
                await cachePut('durations-v1', [...durations.entries()]);
            }
            return duration;
        }).finally(() => durationRequests.delete(key));
        durationRequests.set(key, request);
        return request;
    }

    async function loadOneDuration(view, record) {
        const key = itemKey(record.item);
        const known = durations.get(key) ?? itemDuration(record.item);
        if (known) {
            updateRuntimeLabel(record);
            return;
        }
        if (view.durationChecked.has(key) || !navigator.onLine || !window.HOMECINEMA_TMDB_TOKEN) return;
        view.durationChecked.add(key);
        const label = record.node && record.node.querySelector('.preview-runtime');
        if (label) { label.textContent = 'Durata…'; label.hidden = false; }
        try {
            await requestDuration(record);
            view.durationFailed.delete(key);
        } catch (_) {
            view.durationFailed.add(key);
            updateRuntimeLabel(record);
            if (!view.durationRetryTimer) view.durationRetryTimer = setTimeout(() => retryDurations(view), 30000);
        }
    }

    async function loadDurations(view) {
        if (view.durationPromise) return;
        const pending = [...view.records.values()].filter(record => {
            const key = itemKey(record.item);
            return !durations.has(key) && !itemDuration(record.item) && !view.durationChecked.has(key);
        });
        if (!pending.length || !navigator.onLine || !window.HOMECINEMA_TMDB_TOKEN) return;
        pending.forEach(record => view.durationChecked.add(itemKey(record.item)));
        view.durationPromise = (async () => {
            let index = 0;
            async function worker() {
                while (index < pending.length) {
                    const record = pending[index++];
                    try {
                        await requestDuration(record);
                        view.durationFailed.delete(itemKey(record.item));
                    } catch (error) {
                        view.durationFailed.add(itemKey(record.item));
                        console.warn('Durata non disponibile per', itemKey(record.item));
                    }
                    if (active === view.name && view.filters.sort === 'Durata') scheduleRender();
                }
            }
            await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker));
        })().finally(() => {
            view.durationPromise = null;
            if (view.durationFailed.size && !view.durationRetryTimer) {
                view.durationRetryTimer = setTimeout(() => retryDurations(view), 30000);
            }
            if (active === view.name && view.filters.sort === 'Durata') scheduleRender();
        });
        scheduleRender();
    }

    function retryDurations(view) {
        clearTimeout(view.durationRetryTimer);
        view.durationRetryTimer = null;
        for (const key of view.durationFailed) view.durationChecked.delete(key);
        view.durationFailed.clear();
        if (active === view.name && view.filters.sort === 'Durata') scheduleRender();
    }

    window.addEventListener('online', () => {
        retryOnline();
        for (const view of Object.values(views)) retryDurations(view);
    });

    async function init() {
        const cachedDurations = await cacheGet('durations-v1');
        if (Array.isArray(cachedDurations)) {
            for (const [key, value] of cachedDurations) if (Number(value) > 0) durations.set(key, Number(value));
        }
        for (const entry of Array.isArray(window.LOCAL_CATALOG) ? window.LOCAL_CATALOG : []) {
            if (entry && entry.item) mergeRecord(views.local.records, entry.item, 'Locale', entry.play || '');
        }
        for (const view of Object.values(views)) ensurePinnedRecords(view);
        updatePinnedCount();
        setView(active);
    }
    init();
})();
