//scriviamo una funzione con un vettore statico per non sprecare memoria con un elenco infinito di informazioni che possono essere prelevate tramite un'indice
//risparmiamo memoria a discapito del rallentamento causto dal dover creare il vettore statico ogni volta che chiamiamo la funzione
const categories = {
    'visto': [1],
    'download': [0],
    'stupendo': [2]
}

function get_films(pos) {
    let list = [
        new Film("10 cose che odio di te!", "10 things i hate about you!", "https://movieplayer.net-cdn.it/t/images/2003/03/19/la-locandina-di-10-cose-che-odio-di-te-7840_jpg_420x0_crop_q85.jpg", "10 cose che odio di te (10 Things I Hate About You) è un film del 1999 diretto da Gil Junger, alla sua prima regia. Il titolo della pellicola è ripreso da una poesia recitata nell'opera La bisbetica domata di William Shakespeare, di cui il film è una versione cinematografica in chiave giovanile.", "", 97, 1999, "", ""),
        new Film("Un uomo tranquillo", "Cold Pursuit", "https://pad.mymovies.it/filmclub/2018/10/202/locandina.jpg", "Un uomo tranquillo (Cold Pursuit) è un film del 2019 diretto da Hans Petter Moland. La pellicola, con protagonista Liam Neeson, è il remake del film del 2014 In ordine di sparizione (Kraftidioten), diretto dallo stesso Hans Petter Moland.", "", 118, 2019, "", ""),
        new Film("A qualcuno piace caldo", "Some Like It Hot", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Some_Like_It_Hot_%281959_poster%29.png/287px-Some_Like_It_Hot_%281959_poster%29.png", "A qualcuno piace caldo (Some Like It Hot) è un film del 1959 diretto da Billy Wilder. Considerato uno dei capolavori della storia del cinema statunitense[2][3], il film, una divertente e sofisticata commedia della dualità[4], vinse un Oscar e tre Golden Globe, tra cui il Golden Globe per la migliore attrice in un film commedia o musicale a Marilyn Monroe e miglior attore in un film commedia o musicale a Jack Lemmon, che per la sua interpretazione ricevette anche un premio BAFTA. Nel 1989 è stato scelto per la conservazione nel National Film Registry della Biblioteca del Congresso degli Stati Uniti d'America[5]. Nel 1998 l'American Film Institute l'ha inserito al quattordicesimo posto della classifica dei migliori cento film statunitensi di tutti i tempi[6], mentre dieci anni dopo, nella lista aggiornata, è sceso al ventiduesimo posto[7]. Nel 2000 l'ha inserito al primo posto della classifica delle migliori cento commedie statunitensi[8]. Nel 2005 la battuta «Well, nobody's perfect» (Beh, nessuno è perfetto) è stata inserita al quarantottesimo posto della classifica delle migliori cento battute del cinema statunitense[9].", "", 120, 1959, "", "")
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
    if (type_names.length > 0) {
        for (let index = 0; index < type_names.length; index++) {
            search_targets = search_targets.concat(filter_type(type_names[index]));
        }
    }
    else {
        search_targets = get_films(true);
    }
    console.log("search_targets: ");
    console.log(search_targets);
    if (!string) {
        found = search_targets;
        console.log("stringa di ricerca vuota, found: ");
        console.log(found);
    } else {
        for (let index = 0; index < search_targets.length; index++) {
            let tmp = search_targets[index];
            if (tmp.ti.includes(string))
                found.push(tmp);
            else
                if (tmp.to.includes(string))
                    found.push(tmp);
        }
    }
    console.log("risultati ricerca \'" + string + "\' nelle categorie\'" + type_names + "\': ");
    console.log(found);
    return found;
}

