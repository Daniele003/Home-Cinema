function html_logo() {
    return '<div class="logo-container"><img src="logo.png" alt="[Mostra una ghianda]" class="logo-image"><div class="logo-text">Home <br> Cinema</div></div>';
}

function change_theme() {
    const new_child = document.createElement('link');
    new_child.rel = 'stylesheet';
    const target = document.querySelector('link[href="LightTheme.css"]');
    if (target) {
        new_child.href = 'DarkTheme.css';
        document.head.replaceChild(new_child, target);
    } else {
        new_child.href = 'LightTheme.css';
        document.head.replaceChild(new_child, document.querySelector('link[href="DarkTheme.css"]'));
    }
}

function html_testa(page_title) {
    let s = '<html lang="it">'
        + '<head>'
        + '<meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        + '<link rel="stylesheet" href="master.css">';
    if ((new Date()).getHours() >= 22 || (new Date()).getHours() <= 6) {
        s += '<link rel="stylesheet" href="DarkTheme.css">';
    } else {
        s += '<link rel="stylesheet" href="LightTheme.css">';
    }
    s += '<title>' + escape_html(page_title) + '</title>'
        + '</head>'
        + '<body>'
        + '<header>'
        + '<nav class="navbar">'
        + '<div class="navbar-container">'
        + '<div class="navbar-brand">'
        + '<a href="index.html" class="logo-link">' + html_logo() + '</a>'
        + '</div>'
        + '<div class="navbar-menu">'
        + '<ul class="navbar-nav">'
        + '<li class="nav-item"><a href="home.html" class="nav-link">Catalogo online</a></li>'
        + '<li class="nav-item"><a href="local.html" class="nav-link">Disponibili in locale</a></li>'
        + '</ul>'
        + '</div>'
        + '<div class="navbar-theme">'
        + '<input type="checkbox" id="change-theme" class="theme-toggle" onchange="change_theme()">'
        + '<label for="change-theme" class="theme-label">🌙</label>'
        + '</div>'
        + '<div id="fordice"></div>'
        + '</div>'
        + '</nav>'
        + '<div class="search-filters-container">'
        + '<div class="search-bar">'
        + '<button class="btn-filters" aria-label="Filtri Avanzati" onclick="document.querySelectorAll(\'.filters-row\').forEach(el => el.classList.toggle(\'hidden\'));">⚙️ Filtri</button>'
        + '<input type="search" class="search-input" placeholder="Cerca film o serie TV...">'
        + '<span class="results-count" id="#risultati" aria-live="polite">0 titoli</span>'
        + '</div>'
        + '<div class="filters-row" id="filtri-avanzati-liste"></div>'
        + '<div class="filters-row" id="filtri-avanzati-generi"></div>'
        + '<div class="sort-container">'
        + '<label for="sort-select" class="sort-label">Ordina per:</label>'
        + '<input list="ordine" class="sort-select" id="sort-select" autocomplete="off">'
        + '<datalist id="ordine">'
        + '<option>Titolo</option>'
        + '<option>Durata</option>'
        + '<option>Anno</option>'
        + '<option>Voto</option>'
        + '</datalist>'
        + '</div>'
        + '</div>'
        + '</header>';
    return s;
}

function escape_html(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

// I builder conservano le classi e la struttura delle card originali.
// La deduplicazione e le liste di appartenenza sono gestite dal catalogo.
function html_movie_preview(source_name, item, play = false, id_prefix = '') {
    return html_media_preview('movie', source_name, item, play, id_prefix);
}

function html_tv_preview(source_name, item, play = false, id_prefix = '') {
    return html_media_preview('tv', source_name, item, play, id_prefix);
}

function html_media_preview(type, source_name, item, play, id_prefix) {
    const is_tv = type === 'tv';
    const title = is_tv ? (item.name || item.original_name) : (item.original_title || item.title);
    const image_title = is_tv ? (item.name || item.original_name) : (item.title || item.original_title);
    const date = is_tv ? item.first_air_date : item.release_date;
    const genres = Array.isArray(item.genre_ids) ? item.genre_ids : [];
    const poster = item.poster_path ? 'https://image.tmdb.org/t/p/' + (is_tv ? 'w300' : 'w342') + item.poster_path : '';
    const video = play ? '<div class="video-container"><video loading="lazy" controls><source src="' + escape_html(play) + '"></video></div>' : '';
    const heading = is_tv ? 'h4' : 'h5';
    return '<div id="' + escape_html(id_prefix + (is_tv ? 'tv' : 'mid') + item.id) + '" class="' + (is_tv ? 'tv' : 'movie') + ' card" data-lists="' + escape_html(source_name) + '" data-genres="' + escape_html(genres.join(' ')) + '">'
        + '<div class="card-image-wrapper">'
        + '<img' + (poster ? ' src="' + escape_html(poster) + '"' : '') + ' alt="' + escape_html(image_title || '') + '" class="card-image" loading="lazy">'
        + '</div>'
        + '<div class="preview">'
        + '<div class="preview-content">'
        + '<' + heading + ' class="preview-title">' + escape_html(title || '') + '</' + heading + '>'
        + '<p class="preview-date">' + escape_html(date || '') + '</p>'
        + '<p class="preview-overview">' + escape_html(item.overview || '') + '</p>'
        + video
        + '</div></div></div>';
}

function html_filtro_lista(nome) {
    return '<button type="button" class="filter filter-list" aria-pressed="false" title="Filtra per ' + escape_html(nome) + '">' + escape_html(nome) + '</button>';
}

function html_filtro_genere(id, nome) {
    return '<button type="button" id="g' + escape_html(id) + '" class="filter filter-genre" aria-pressed="false" title="Filtra per genere ' + escape_html(nome) + '">' + escape_html(nome) + '</button>';
}
