function html_logo() {
    return '<table><tr><td width="45%"><img src="logo.png" alt="[Mostra una ghianda]"></td><td><div>Home <br> Cinema</div></td></tr></table>'
}

function html_testa(page_title) {
    return '<html lang="it">'
        //intestazione html di tutte le pagine
        + '<head>'
        + '<meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        + '<link rel="stylesheet" href="master.css">'
        + '<link rel="stylesheet" href="dice.css">'
        + '<title>' + page_title + '</title>'
        + '</head>'
        + '<body>'
        + '<header>'
        + '<nav>'
        + '<table>' + '<tr id="fordice">' + '<td width="20%">' + '<a href="index.html">' + html_logo() + '</a></td> <td>' + '<ul>' + '<li>' + '<a href="home.html"> Catalogo online </a>' + '</li> <li>' + '<a href="local.html"> Disponibili in locale </a>' + '</li>' + '</ul>' + '</td>' + '<td>' + '<button> &#x1F307 &#x1F306 </button>' + '</td>' + '</tr></table>'
        + '<table><tr>' + '<td>' + '<button>Filtri Avanzati</button> <input type="search" placeholder="cerca...">' + '</td><td id="#risultati">0 titoli' + '<!-- mentre conta mostra un caricamento, solo quando ha finito di contare mostra il numero effettivo -->' + '</td>' + '</tr></table>'
        + '<table><tr id="filtri avanzati liste"></tr></table>'
        + '<table><tr id="filtri avanzati generi"></tr></table>'
        + '<table><tr>' + '<td> Ordina per: <button>Titolo</button> <button>Durata</button> <button>Anno</button> <button>Voto</button>' + '</td>' + '</tr>' + '</table>'
        + '</nav>'
        + '</header>'
}

function html_movie_preview(source_name, _json) {
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
    mID = 'mid' + _json.id
    target = document.getElementById(mID)
    if (target) {
        // se è già presente, aggiungi semplicemente la classe per evidenziare che è presente in più fonti
        target.dataset.sources += ' ' + source_name
        return ''
    } else {
        return '<div id="' + mID + '" data-lists="' + source_name + '" data-genres="' + _json.genre_ids.join(' ') + '">' + _json.original_title + ' (' + _json.release_date + ')</div>'
    }
}

function html_tv_preview(source_name, _json) {
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
    tvID = 'tv' + _json.id
    target = document.getElementById(tvID)
    if (target) {
        // se è già presente, aggiungi semplicemente la classe per evidenziare che è presente in più fonti
        target.dataset.sources += ' ' + source_name
        return ''
    } else {
        return '<div id="' + tvID + '" data-lists="' + source_name + '" data-genres="' + _json.genre_ids.join(' ') + '">' + _json.original_name + ' (' + _json.first_air_date + ') (SERIE TV)</div>'
    }
}

function html_filtro_lista(nome) {
    return '<button class="filter lists">' + nome + '</button>'
}

function html_filtro_genere(id, nome) {
    return '<button id="g' + id + '" class="filter genres hidden ">' + nome + '</button>'
}