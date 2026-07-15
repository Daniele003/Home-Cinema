function html_logo() {
    return '<table><tr><td width="45%"><img src="logo.png" alt="[Mostra una ghianda]"></td><td><div>Home <br> Cinema</div></td></tr></table>'
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
        + '<nav>'
        + '<table>' + '<tr id="fordice">' + '<td width="20%">' + '<a href="index.html">' + html_logo() + '</a></td> <td>' + '<ul>' + '<li>' + '<a href="home.html"> Catalogo online </a>' + '</li> <li>' + '<a href="local.html"> Disponibili in locale </a>' + '</li>' + '</ul>' + '</td>' + '<td>' + '<input type="checkbox" id="change theme" onchange="change_theme()"><label for="change theme"> &#x1F307 &#x1F306 </label>' + '</td>' + '</tr></table>'
        + '<table><tr>' + '<td>' + '<button>Filtri Avanzati</button> <input type="search" placeholder="cerca...">' + '</td><td id="#risultati">0 titoli' + '<!-- mentre conta mostra un caricamento, solo quando ha finito di contare mostra il numero effettivo -->' + '</td>' + '</tr></table>'
        + '<table><tr id="filtri avanzati liste"></tr></table>'
        + '<table><tr id="filtri avanzati generi"></tr></table>'
        + 'Ordina per: <input list="ordine"><datalist id="ordine"><option>Titolo</option> <option disabled>Durata</option> <option>Anno</option> <option>Voto</option></datalist>'
        + '</nav>'
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
            video = '<video loading="lazy" controls><source src="' + play + '"></video>'
        return '<div id="' + mID + '" class="movie card" data-lists="' + source_name + '" data-genres="' + _json.genre_ids.join(' ') + '">'
            + '<img src="https://image.tmdb.org/t/p/w342' + _json.poster_path + '" alt="' + _json.title + '">'
            + '<div  class="preview">'
            + '<h5>' + _json.original_title + '</h5> <h6>' + _json.release_date + '</h6>'
            + '<p> ' + _json.overview + ' </p>'
            + video
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
            video = '<video loading="lazy" controls><source src="' + play + '"></video>'
        return '<div id="' + tvID + '" class="tv card" data-lists="' + source_name + '" data-genres="' + _json.genre_ids.join(' ') + '">'
            + '<img src="https://image.tmdb.org/t/p/w300' + _json.poster_path + '" alt="' + _json.name + '">'
            + '<div  class="preview">'
            + '<h4>' + _json.name + '</h4> <h6>' + _json.first_air_date + '</h6>'
            + '<p> ' + _json.overview + ' </p>'
            + video
            + '</div>'
            + '</div>'
    }
}

function html_filtro_lista(nome) {
    return '<button class="filter lists">' + nome + '</button>'
}

function html_filtro_genere(id, nome) {
    return '<button id="g' + id + '" class="filter genres hidden ">' + nome + '</button>'
}