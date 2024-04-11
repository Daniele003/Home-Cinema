//scriviamo una funzione con un vettore statico per non sprecare memoria con un elenco infinito di informazioni che possono essere prelevate tramite un'indice
//risparmiamo memoria a discapito del rallentamento causto dal dover creare il vettore statico ogni volta che chiamiamo la funzione
const categories = {
    'visto': [],
    'download': [],
    'stupendo': []
}

function get_films(pos) {
    let list = [
        new Film("10 cose che odio di te!", "10 things i hate about you", "https://movieplayer.net-cdn.it/t/images/2003/03/19/la-locandina-di-10-cose-che-odio-di-te-7840_jpg_420x0_crop_q85.jpg", "10 cose che odio di te (10 Things I Hate About You) è un film del 1999 diretto da Gil Junger, alla sua prima regia. Il titolo della pellicola è ripreso da una poesia recitata nell'opera La bisbetica domata di William Shakespeare, di cui il film è una versione cinematografica in chiave giovanile.", "", 97, 1999, "", ""),
        new Film("9 cose che odio di te!", "9 things i hate about you", "https://movieplayer.net-cdn.it/t/images/2003/03/19/la-locandina-di-10-cose-che-odio-di-te-7840_jpg_420x0_crop_q85.jpg", "10 cose che odio di te (10 Things I Hate About You) è un film del 1999 diretto da Gil Junger, alla sua prima regia. Il titolo della pellicola è ripreso da una poesia recitata nell'opera La bisbetica domata di William Shakespeare, di cui il film è una versione cinematografica in chiave giovanile.", "", 97, 1999, "", ""),
        new Film("8 cose che odio di te!", "8 things i hate about you", "https://movieplayer.net-cdn.it/t/images/2003/03/19/la-locandina-di-10-cose-che-odio-di-te-7840_jpg_420x0_crop_q85.jpg", "10 cose che odio di te (10 Things I Hate About You) è un film del 1999 diretto da Gil Junger, alla sua prima regia. Il titolo della pellicola è ripreso da una poesia recitata nell'opera La bisbetica domata di William Shakespeare, di cui il film è una versione cinematografica in chiave giovanile.", "", 97, 1999, "", "")
    ];
    if (pos === true)
        return list;
    else {
        let returner = [];
        for (let index = 0; index < pos.length; index++) {
            returner.push(list[pos[index]]);
        }
        return returner;
    }
}

function filter_type(type_names) {
    return get_films(categories[type_names]);
}

function offline_research(string, type_names) {
    let search_targets = [];
    let found = [];
    if (type_names.length > 0)
        search_targets = filter_type(type_names);
    else
        search_targets = get_films(true);
    if (!string)
        found = search_targets;
    else {
        for (let index = 0; index < search_targets.length; index++) {
            let tmp = search_targets[index];
            if (tmp.ti.match(string) > 0)
                found.push(tmp);
        }
    }
    console.log("risultati ricerca \'" + string + "\' nelle categorie: ")
    console.log(found)
    return found;
}

