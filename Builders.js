function html_logo() {
    return '<div class="logo-container"><img src="logo.png" alt="[Mostra una ghianda]" class="logo-image"><div class="logo-text">Home <br> Cinema</div></div>'
}

function change_theme() {
    let new_child = document.createElement('link');
    new_child.rel = 'stylesheet';
    let target = document.querySelector('link[href="LightTheme.css"]');
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
        //intestazione html di tutte le pagine
        + '<head>'
        + '<meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        + '<link rel="stylesheet" href="master.css">'
    if ((new Date()).getHours() >= 22 || (new Date()).getHours() <= 6) {
        s += '<link rel="stylesheet" href="DarkTheme.css">'
    } else {
        s += '<link rel="stylesheet" href="LightTheme.css">'
    }
    s += '<title>' + page_title + '</title>'
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
        + '<label for="change-theme" class="theme-label">🌙 ☀️</label>'
        + '</div>'
        + '</div>'
        + '</nav>'
        + '<div class="search-filters-container">'
        + '<div class="search-bar">'
        + '<button class="btn-filters" aria-label="Filtri Avanzati">⚙️ Filtri</button>'
        + '<input type="search" class="search-input" placeholder="Cerca film o serie TV...">'
        + '<span class="results-count" id="risultati">0 titoli</span>'
        + '</div>'
        + '<div class="filters-row" id="filtri-avanzati-liste"></div>'
        + '<div class="filters-row" id="filtri-avanzati-generi"></div>'
        + '<div class="sort-container">'
        + '<label for="ordine" class="sort-label">Ordina per:</label>'
        + '<input list="ordine" class="sort-select" id="sort-select">'
        + '<datalist id="ordine">'
        + '<option>Titolo</option>'
        + '<option disabled>Durata</option>'
        + '<option>Anno</option>'
        + '<option>Voto</option>'
        + '</datalist>'
        + '</div>'
        + '</div>'
        + '</header>'
    return s
}

function html_movie_preview(source_name, _json, play = false) {
    /* struttura JSON attesa
        adult:
        backdrop_path:
        genre_ids:
        id:
        original_language:
        original_title:
        overview:
        popularity:
        poster_path:
        rating:
        release_date:
        softcore:
        title:
        video:
        vote_average:
        vote_count:
    */
    console.log('called html_movie_preview', source_name, _json, play)
    mID = 'mid' + _json.id
    target = document.getElementById(mID)
    if (target) {
        // se è già presente, aggiungi semplicemente la classe per evidenziare che è presente in più fonti
        target.dataset.sources += ' ' + source_name
        return ''
    } else {
        let video = ''
        if (play)
            video = '<div class="video-container"><video loading="lazy" controls><source src="' + play + '"></video></div>'
        return '<div id="' + mID + '" class="movie card" data-lists="' + source_name + '" data-genres="' + _json.genre_ids.join(' ') + '">'
            + '<div class="card-image-wrapper">'
            + '<img src="https://image.tmdb.org/t/p/w342' + _json.poster_path + '" alt="' + _json.title + '" class="card-image">'
            + '</div>'
            + '<div class="preview">'
            + '<div class="preview-content">'
            + '<h5 class="preview-title">' + _json.original_title + '</h5>'
            + '<p class="preview-date">' + _json.release_date + '</p>'
            + '<p class="preview-overview">' + _json.overview + '</p>'
            + video
            + '</div>'
            + '</div>'
            + '</div>'
    }
}

function html_tv_preview(source_name, _json, play = false) {
    /* struttura JSON attesa
        adult:
        backdrop_path:
        first_air_date:
        genre_ids:
        id:
        name:
        origin_country:
        original_language:
        original_name:
        overview:
        popularity:
        poster_path:
        softcore:
        vote_average:
        vote_count:
    */
    console.log('called html_tv_preview', source_name, _json, play)
    tvID = 'tv' + _json.id
    target = document.getElementById(tvID)
    if (target) {
        // se è già presente, aggiungi semplicemente la classe per evidenziare che è presente in più fonti
        target.dataset.sources += ' ' + source_name
        return ''
    } else {
        let video = ''
        if (play)
            video = '<div class="video-container"><video loading="lazy" controls><source src="' + play + '"></video></div>'
        return '<div id="' + tvID + '" class="tv card" data-lists="' + source_name + '" data-genres="' + _json.genre_ids.join(' ') + '">'
            + '<div class="card-image-wrapper">'
            + '<img src="https://image.tmdb.org/t/p/w300' + _json.poster_path + '" alt="' + _json.name + '" class="card-image">'
            + '</div>'
            + '<div class="preview">'
            + '<div class="preview-content">'
            + '<h4 class="preview-title">' + _json.name + '</h4>'
            + '<p class="preview-date">' + _json.first_air_date + '</p>'
            + '<p class="preview-overview">' + _json.overview + '</p>'
            + video
            + '</div>'
            + '</div>'
            + '</div>'
    }
}

function html_filtro_lista(nome) {
    return '<button class="filter filter-list" title="Filtra per ' + nome + '">' + nome + '</button>'
}

function html_filtro_genere(id, nome) {
    return '<button id="g' + id + '" class="filter filter-genre hidden" title="Filtra per genere ' + nome + '">' + nome + '</button>'
}
