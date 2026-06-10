function html_logo() {
    return '<table><tr><td><img src="logo.png" alt="[Mostra una ghianda]"></td><td><div>Home <br> Cinema</div></td></tr></table>'
}

function html_testa() {
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
        + '<table>'
        + '<tr id="1">' + '<td width="10%">' + '<a href="index.html">' + html_logo() + '</a></td> <td>' + '<ul>' + '<li>' + '<a href="home.html"> Catalogo online </a>' + '</li> <li>' + '<a href="local.html"> Disponibili in locale </a>' + '</li>' + '</ul>' + '</td>' + '<td>' + '<button> &#x1F307 &#x1F306 </button>' + '</td>' + '</tr>'
        + '<tr>' + '<td>' + '<button>Filtri Avanzati</button> <input type="search" placeholder="cerca...">' + '</td>' + '</tr>'
        + '<tr> <!-- tutti i filtri avanzati applicabili --> </tr>'
        + '<tr>' + '<td> Ordina per: <button>Titolo</button> <button>Durata</button> <button>Anno</button> <button>Voto</button>' + '</td>' + '<td id="#risultati">' + '<!-- mentre conta mostra un caricamento, solo quando ha finito di contare mostra il numero effettivo -->' + '</td>' + '</tr>'
        + '</table>'
        + '</nav>'
        + '</header>'
}