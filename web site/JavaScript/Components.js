class Film {
    constructor(titolo, titolo_originale, locandina, intro, trama, durata, anno, generi, streaming) {
        this.ti = titolo;
        this.to = titolo_originale;
        this.l = locandina;
        this.i = intro;
        this.tr = trama;
        this.d = durata;
        this.a = anno;
        this.g = generi;
        this.s = streaming;
        this.ID = (this.to + " (film " + this.a + ")").replace("\'", "");
    }
    setGeneri(generi) {
        this.g = generi;
    }
    setStreaming(links) {
        this.s = links;
    }
    setID(ID) {
        this.ID = ID;
    }
}

function search_value_index(array, value, critical, default_value) {
    for (let index = 0; index < array.length; index++) {
        if (array[index] == value)
            return index;
    }
    if (!(critical))
        return "not found";
    else {
        console.log("search_value_index ERROR:: " + value + " not found in " + array + " retur dafault as: " + default_value);
        return default_value;
    }
}

function getCookieValue(nome) {
    let cookies = document.cookie.split(";");
    console.log("cookies:");
    console.log(cookies);
    for (let index = 0; index < cookies.length; index++) {
        let [name, value] = cookies[index].split("=");
        console.log("cookies[" + index + "][name: " + name + ", value: " + value + "]");
        if (name == nome)
            return value;
    }
    console.log("cookie not found");
    return "";
}

var films = new Array();
var found_results = films;
var random_history = new Array();

function ricerca(row, array, keys_array) {
    //console.log("ricerca ("); console.log(row); console.log(", "); console.log(array); console.log(", "); console.log(keys_array + ")");
    for (let index = 0; index < array.length; index++) {
        let equal = true;
        for (let index2 = 0; index2 < keys_array.length; index2++) {
            //console.log("equal = " + equal + " && " + array[index][keys_array[index2]] + " == " + row[keys_array[index2]]);
            equal = equal && array[index][keys_array[index2]] == row[keys_array[index2]];
        }
        if (equal)
            return index;
    }
    return -1;
}

function distinct_keys(indexes_forCheck, indexes_forSave, object_array, accuracy_check) {
    console.log("distinct_keys([" + indexes_forCheck + "], [" + object_array + "], " + accuracy_check + ")");
    if (object_array && (indexes_forCheck || indexes_forCheck == 0) && indexes_forCheck.length > 0 && object_array.length > 0 && accuracy_check > 0) {
        if (object_array.length > 1) {
            let list = new Array();
            /**
             * ALGORITMO
             * ********************************
             * scansione del vettore di oggetti
             * scansione degli indici dell'oggetto specificati dal vettore degli indici di controllo
             * impostazione degli indici dell'oggetto di salvataggio duplicità come vettori inizializzati con il valore dell'indice di quell'oggetto
             * aggiunta dei valore presente negli oggetti duplicati, nel vettore creato negli indici di salvataggio negli oggetti unici
             */
            console.clear();
            for (let index1 = 0; index1 < object_array.length; index1++) {
                //ciclo di scansione del vettore 'object_array'
                console.log("⇢ selected object:");
                console.log(object_array[index1]);
                //console.log("⇢ index1: " + index1);
                let found_at = ricerca(object_array[index1], list, indexes_forCheck);
                if (found_at == -1) {
                    list.push(object_array[index1]);
                    for (let index2 = 0; index2 < indexes_forSave.length; index2++) {
                        let target = object_array[index1][indexes_forSave[index2]];
                        //ciclo di inizializzazione vettori di salvataggio valori di duplicità
                        console.log("⇢ index1: " + index1);
                        console.log("⇢⇢ index2: " + index2);
                        console.log("⇢⇢ found_at: " + found_at);
                        if (!target)
                            target = 0;
                        object_array[index1][indexes_forSave[index2]] = new Array(target);
                    }
                    console.log("added in list at: [" + ricerca(object_array[index1], list, indexes_forCheck) + "]");
                } else {
                    for (let index2 = 0; index2 < indexes_forSave.length; index2++) {
                        //ciclo di push di singolo valore a in tutti gli indici di duplicità vettori di salvataggio valori di duplicità
                        let target = object_array[index1];
                        let found_at2 = ricerca(target, list, indexes_forCheck);
                        if (found_at2 != -1) {
                            console.log("added at [" + found_at2 + "][" + indexes_forSave[index2] + "]: " + target[indexes_forSave[index2]]);
                            let checker = target[indexes_forSave[index2]];
                            if (checker)
                                list[found_at2][indexes_forSave[index2]].push(checker);
                        }
                        console.log("index1: " + index1);
                        console.log("⇢⇢ index2: " + index2);
                        console.log("⇢⇢ found_at: " + found_at);
                        console.log("⇢⇢⇢ target: ");
                        console.log(target);
                        console.log("⇢⇢⇢ found_at2: " + found_at2);
                    }
                }
            }
            console.log(list);
            return list;
        } else {
            return object_array;
        }
    }
}

function addGenres(key_titolo, key_anno, genre_array) {
    //console.log("addGenres(key_titolo, key_anno, genre_array)...addGenres(" + key_titolo + ", " + key_anno + ", " + genre_array + ")");
    let i, exit = false;
    for (i = 0; i < films.length && !exit; i++) {
        if (films[i].to == key_titolo && films[i].a == key_anno) {
            films[i].setGeneri(genre_array);
            exit = true;
        }
    }
}
function addStreaming(key_titolo, key_anno, links_array) {
    //console.log("addGenres(key_titolo, key_anno, links_array)...addGenres(" + key_titolo + ", " + key_anno + ", " + links_array + ")");
    let i, exit = false;
    for (i = 0; i < films.length && !exit; i++) {
        if (films[i].to == key_titolo && films[i].a == key_anno) {
            films[i].setStreaming(links_array);
            exit = true;
        }
    }
}

function navbar(logo, search, random) {
    /**
     *  HTML TRANSLATION
     * **********************************************************************************************************************************
     *  <div class="navigationbar">
     *   <!-- if(logo) -->
     *   <div class="logo" id="logo" onclick="location.assign('../pages/home.php')" style="cursor: pointer;">
     *    <img src="../resources/images/icons/logo.png">
     *    <p>Home<br>Cinema</p>
     *   </div>
     *   <!-- if(search) -->
     *   <div class="logo scrollable" style="width: 50%; position: relative;">
     *    <input id="research" type="search" placeholder="Cerca ..." oninput="filter_title();" onsearch="search_title();">
     *    <div class="input-inside button push" style="width: 2em; height: 2em; background-color: white;" onclick="search_title();">
     *     <img src="../images/lente.png">
     *    </div>
     *   </div>
     *   <!-- if(random) -->
     *   <div class="button push" id="random film">
     *    <img src="../images/dice.png">
     *   </div>
     *  </div>
     * **********************************************************************************************************************************
     */
    let nb = document.createElement("div");
    nb.className = "navigationbar";
    if (logo) {
        let logo = document.createElement("div");
        logo.className = "logo";
        logo.id = "logo";
        logo.setAttribute("onclick", "location.assign('../pages/home.php')");
        logo.style = "cursor: pointer;";
        let image = document.createElement("img");
        image.src = "../resources/images/icons/logo.png";
        logo.appendChild(image);
        let paragraph = document.createElement("p");
        paragraph.appendChild(document.createTextNode("Home"));
        paragraph.appendChild(document.createElement("br"));
        paragraph.appendChild(document.createTextNode("Cinema"));
        logo.appendChild(paragraph);
        nb.appendChild(logo);
    }
    if (search) {
        let search = document.createElement("div");
        search.className = "logo";
        search.style = "width: 50%; position: relative; overflow: visible;";
        let inbar = document.createElement("input");
        inbar.className = "input";
        inbar.id = "research";
        inbar.type = "search";
        inbar.placeholder = "Cerca ...";
        inbar.setAttribute("oninput", "search_title(); document.cookie = \"search=\" + this.value + \";\";");
        inbar.setAttribute("onsearch", "console.log(\"search value: \" + this.value);search_title();");
        search.appendChild(inbar);
        let enter = document.createElement("div");
        enter.className = "input-inside button push";
        enter.style = "width: 2em; height: 2em; background-color: white;";
        enter.setAttribute("onclick", "search_title();");
        let image = document.createElement("img");
        image.src = "../resources/images/icons/lente.png";
        enter.appendChild(image);
        search.appendChild(enter);
        nb.appendChild(search);
    }
    if (random) {
        let dice = document.createElement("div");
        dice.className = "button push";
        dice.id = "random film";
        dice.style = " background-color: hsl(240, 50%, 25%);";
        dice.appendChild(dice3D(1.5 + "em"));
        dice.setAttribute("onclick", "if(found_results && found_results.length > 1) {if (random_history.length > 0) {close_it(random_history[random_history.length - 1].ID, /*100*/0);}let nuovo = found_results[(Math.floor(Math.random() * found_results.length))];while (nuovo == random_history[random_history.length - 1]) {nuovo = found_results[(Math.floor(Math.random() * found_results.length))];}random_history.push(nuovo); notState(random_history[random_history.length - 1].ID);}");
        nb.appendChild(dice);
    }
    return nb;
}

function cardGroup(movies, parent, wantPopups) {
    for (let i = 0; i < movies.length && wantPopups; i++) {
        parent.appendChild(FilmCard(movies[i], FilmDetails(movies[i])));
    }
    for (let i = 0; i < movies.length && !wantPopups; i++) {
        parent.appendChild(FilmCard(movies[i], false));
    }
    setTimeout(() => {
        let lista = parent.getElementsByClassName('cached');
        let cicle = setInterval(() => {
            if (0 < lista.length) {
                lista[0].className = lista[0].className.replace('cached', 'not-c.a.c.h.e.d');
                //i += 1;//non necessario poichè javascript utilizza liste dinamiche e quindi ogni volta viene aggiornata automaticamente
                //inoltre grazie a questa proprietà se stamapti i valori ad esempio un oggetto in console non saranno statici, ma verranno aggiornati assieme all'oggeto senza alcun bisogno di ristamparlo
            } else {
                clearInterval(cicle);
            }
            //alert("lunghezza lista: " + lista.length);
        }, 25);
    }, 250);
}

function FilmCard(_film, details) {
    //definizione elementi
    let parent_element_0 = document.createElement("div");
    let p_card_element_1 = document.createElement("div");
    let p_c_anteprima_element_1 = document.createElement("div");
    let p_c_details_element_2 = document.createElement("div");
    let p_c_d_titolo_element_1 = document.createElement("p");
    let p_c_d_anno_element_2 = document.createElement("p");
    let p_c_d_durata_element_3 = document.createElement("p");
    //impostazione elementi
    parent_element_0.id = "parent - " + _film.ID;
    parent_element_0.className = "not-hidden";
    p_card_element_1.id = "card - " + _film.ID;
    p_card_element_1.className = "card button cached";
    if (details)
        p_card_element_1.setAttribute("onclick", "notState('" + _film.ID + "');");
    p_c_anteprima_element_1.className = "anteprima";
    p_c_anteprima_element_1.style = "background-image: url('" + _film.l + "'); width: auto; height: 18em;";
    p_c_details_element_2.style = "padding: 1em; height: calc(100% - 20em); display: flex; flex-direction: column; justify-content: space-around;";
    //concatenazione gerarchia elementi
    document.body.appendChild(parent_element_0);
    parent_element_0.appendChild(p_card_element_1);
    //parent_element_0.appendChild(FilmDetails(_film));
    if (details)
        parent_element_0.appendChild(details);
    p_card_element_1.appendChild(p_c_anteprima_element_1);
    p_card_element_1.appendChild(p_c_details_element_2);
    p_c_details_element_2.appendChild(p_c_d_titolo_element_1);
    p_c_details_element_2.appendChild(p_c_d_anno_element_2);
    p_c_details_element_2.appendChild(p_c_d_durata_element_3);
    p_c_d_titolo_element_1.appendChild(document.createTextNode(_film.ti));
    p_c_d_anno_element_2.appendChild(document.createTextNode(_film.a));
    p_c_d_durata_element_3.appendChild(document.createTextNode(_film.d + " min"));
    return parent_element_0;
}

function FilmDetails(_film_) {
    //definizione elementi
    let p_popup_element_2 = document.createElement("div");
    let p_p_locandina_element_1 = document.createElement("img");
    let p_p_informazioni_element_2 = document.createElement("div");
    let p_p_i_bottone_element_1 = document.createElement("div");
    let p_p_i_b_icona_element_1 = document.createElement("img");
    let p_p_i_titles_element_2 = document.createElement("div");
    let p_p_i_t_titolo_element_1 = document.createElement("h1");
    let p_p_i_t_titoloOriginale_element_2 = document.createElement("h5");
    let p_p_i_introduzione_element_4 = document.createElement("div");
    let p_p_i_trama_element_5 = document.createElement("div");
    let p_p_i_durata_element_6 = document.createElement("div");
    let p_p_i_uscita_element_7 = document.createElement("div");
    //impostazione elementi
    p_popup_element_2.id = _film_.ID;
    p_popup_element_2.className = "popup film-popup hide ";
    p_p_locandina_element_1.src = _film_.l;
    p_p_locandina_element_1.style = "overflow: unset; max-height: 100%; width: auto;";
    p_p_locandina_element_1.className = "container";
    p_p_informazioni_element_2.className = "container scrollable";
    p_p_informazioni_element_2.style = "width: -webkit-fill-available;";
    p_p_i_bottone_element_1.className = "button close";
    p_p_i_bottone_element_1.setAttribute("onclick", "notState('" + _film_.ID + "')");
    p_p_i_t_titolo_element_1.style = "font-family: Star Wars Bordered; margin: unset;";
    p_p_i_t_titoloOriginale_element_2.style = "font-family: Star Wars; margin: unset;";
    p_p_i_b_icona_element_1.src = "../resources/images/icons/close.png";
    //concatenazione gerarchia elementi
    p_popup_element_2.appendChild(p_p_locandina_element_1);
    p_popup_element_2.appendChild(p_p_informazioni_element_2);
    p_p_informazioni_element_2.appendChild(p_p_i_bottone_element_1);
    p_p_i_titles_element_2.appendChild(p_p_i_t_titolo_element_1);
    p_p_i_titles_element_2.appendChild(p_p_i_t_titoloOriginale_element_2);
    p_p_informazioni_element_2.appendChild(p_p_i_titles_element_2);
    p_p_informazioni_element_2.appendChild(p_p_i_introduzione_element_4);
    p_p_informazioni_element_2.appendChild(p_p_i_trama_element_5);
    p_p_informazioni_element_2.appendChild(p_p_i_durata_element_6);
    p_p_informazioni_element_2.appendChild(p_p_i_uscita_element_7);
    p_p_i_bottone_element_1.appendChild(p_p_i_b_icona_element_1);
    p_p_i_t_titolo_element_1.appendChild(document.createTextNode(_film_.ti));
    p_p_i_t_titoloOriginale_element_2.appendChild(document.createTextNode(_film_.to));
    p_p_i_introduzione_element_4.appendChild(contentCollapse("Descrizione", document.createTextNode(_film_.i), _film_.ID, false));
    p_p_i_trama_element_5.appendChild(contentCollapse("Trama", document.createTextNode(_film_.tr), _film_.ID, false));
    p_p_i_durata_element_6.appendChild(contentCollapse("Durata:", document.createTextNode(_film_.d + " min"), _film_.ID, true));
    p_p_i_uscita_element_7.appendChild(contentCollapse("Anno:", document.createTextNode(_film_.a), _film_.ID, true));
    return p_popup_element_2;
}

function dice3D(dimensione) {
    /**
     * HTLM TRANSLATION (NOT UPDATED)
     * **********************************************************************************************************************************
     * <div class="dice- container invisible">
     *  <div class="dice- cube invisible">
     *   <div class="dice- face front">
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *    </div>
     *   </div>
     *   <div class="dice- face back">
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *     <div class="dice- circle"></div>
     *     <div class="dice- circle"></div>
     *    </div>
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *     <div class="dice- circle"></div>
     *     <div class="dice- circle"></div>
     *    </div>
     *   </div>
     *   <div class="dice- face right">
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *    </div>
     *    <div class="dice- row">
     *    </div>
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *    </div>
     *   </div>
     *   <div class="dice- face left">
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *     <div class="dice- circle"></div>
     *    </div>
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *    </div>
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *     <div class="dice- circle"></div>
     *    </div>
     *   </div>
     *   <div class="dice- face top">
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *     <div class="dice- circle"></div>
     *    </div>
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *     <div class="dice- circle"></div>
     *    </div>
     *   </div>
     *   <div class="dice- face bottom">
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *    </div>
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *    </div>
     *    <div class="dice- row">
     *     <div class="dice- circle"></div>
     *    </div>
     *   </div>
     *  </div>
     * </div>
     */

    let facesDictionary = ["front", "right", "top", "bottom", "left", "back"];
    //impostazione dado
    let contenitore = document.createElement("div");
    let c_cubo = document.createElement("div");
    let c_c_face;
    //funzione generatrice della faccia
    let createFace = (matrix) => {
        let face = document.createElement("div");
        face.className = "dice- face";
        for (let i = 0, createRow = true; i < matrix.length; i++) {
            createRow = createRow && matrix[i].length > 0;
            let row = document.createElement("div");
            row.className = "dice- row";
            for (let j = 0; j < matrix[i].length; j++) {
                let point = document.createElement("div");
                point.className = "dice- circle";
                if (matrix[i][j] == 0) {
                    point.className += " invisible";
                }
                row.appendChild(point);
            }
            if (createRow) {
                face.appendChild(row);
            }
        }
        console.log(face);
        return face;
    };
    //impostazione base dado
    contenitore.className = "dice- container invisible";
    c_cubo.className = "dice- cube invisible";
    contenitore.appendChild(c_cubo);
    //creazione faccie
    // FACCIA 1 (front)
    c_c_face = createFace([[0, 1, 0]]);       //creo la faccia del dado
    c_c_face.className += " " + facesDictionary[0];
    c_cubo.appendChild(c_c_face);                                   //aggiungo la faccia al cubo
    // FACCIA 2 (right)
    c_c_face = createFace([[0, 0, 1], [1, 0, 0]]);       //creo la faccia del dado
    c_c_face.className += " " + facesDictionary[1];
    c_cubo.appendChild(c_c_face);                                   //aggiungo la faccia al cubo
    // FACCIA 3 (top)
    c_c_face = createFace([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);       //creo la faccia del dado
    c_c_face.className += " " + facesDictionary[2];
    c_cubo.appendChild(c_c_face);                                   //aggiungo la faccia al cubo
    // FACCIA 4 (bottom)
    c_c_face = createFace([[1, 0, 1], [1, 0, 1]]);       //creo la faccia del dado
    c_c_face.className += " " + facesDictionary[3];
    c_cubo.appendChild(c_c_face);                                   //aggiungo la faccia al cubo
    // FACCIA 5 (left)
    c_c_face = createFace([[1, 0, 1], [0, 1, 0], [1, 0, 1]]);       //creo la faccia del dado
    c_c_face.className += " " + facesDictionary[4];
    c_cubo.appendChild(c_c_face);                                   //aggiungo la faccia al cubo
    // FACCIA 6 (back)
    c_c_face = createFace([[1, 0, 1], [1, 0, 1], [1, 0, 1]]);       //creo la faccia del dado
    c_c_face.className += " " + facesDictionary[5];
    c_cubo.appendChild(c_c_face);                                   //aggiungo la faccia al cubo

    //ridimensionamento dado in base ai parametri
    contenitore.style = "width: " + dimensione + "; height: " + dimensione + ";";
    // ciclo per la reimpostazione del arrotondamento del bordo delle facce
    for (let i = 0, array = contenitore.getElementsByClassName('face'); i < array.length; i++) {
        array[i].style.borderRadius = ((parseFloat(dimensione) * (3 / 25))) + "em";
        //array[i].style.border = "groove " + ((parseFloat(dimensione) * (4 / 25))) + "px hsl(50, 100%, 83%)";
    }
    //cambiare la dimensione nelle rotazioni delle singole facce
    //possibile soluzione: passare alla funzione il nome della faccia e delegarlo
    let manualIterator = 0;
    c_cubo.getElementsByClassName(facesDictionary[manualIterator++])[0].style.transform = "rotateX(0deg) translateZ(" + (parseFloat(dimensione) / 2) + "em)";
    c_cubo.getElementsByClassName(facesDictionary[manualIterator++])[0].style.transform = "rotateY(90deg) translateZ(" + (parseFloat(dimensione) / 2) + "em)";
    c_cubo.getElementsByClassName(facesDictionary[manualIterator++])[0].style.transform = "rotateX(90deg) translateZ(" + (parseFloat(dimensione) / 2) + "em)";
    c_cubo.getElementsByClassName(facesDictionary[manualIterator++])[0].style.transform = "rotateX(-90deg) translateZ(" + (parseFloat(dimensione) / 2) + "em)";
    c_cubo.getElementsByClassName(facesDictionary[manualIterator++])[0].style.transform = "rotateY(-90deg) translateZ(" + (parseFloat(dimensione) / 2) + "em)";
    c_cubo.getElementsByClassName(facesDictionary[manualIterator++])[0].style.transform = "rotateX(-180deg) translateZ(" + (parseFloat(dimensione) / 2) + "em)";
    console.log(contenitore);
    return contenitore;
}

function contentCollapse(testo_etichetta, contenuto, index, disable_collapse) {
    //definizione elementi
    let main = document.createElement("div");
    let label = document.createElement("div");
    let label_content = document.createElement("h2");
    let show = document.createElement("div");
    let show_icon;
    let content_indentation;
    let container;
    if (disable_collapse) {
        show_icon = contenuto;
    } else {
        show_icon = document.createElement("img");
        content_indentation = document.createElement("div");
        container = document.createElement("div");
    }
    //impostazione elementi
    main.className = "dropdown";
    label.className = "dropdown-label";
    if (!disable_collapse) {
        container.className = "dropdown-elements hide";
        container.id = 'dropdown - container - ' + index + " - " + testo_etichetta;
        show.className = "button push show";
        show_icon.alt = "mostra";
        show_icon.src = "../resources/images/icons/dropdown.png";
        show.setAttribute("onclick", "showCollapsed('" + container.id + "')");
    } else {
        show.style.marginRight = "1%";
    }
    //concatenazione gerarchia elementi
    show.appendChild(show_icon);
    label_content.appendChild(document.createTextNode(testo_etichetta));
    label.appendChild(label_content);
    label.appendChild(show);
    main.appendChild(label);
    if (!disable_collapse) {
        main.appendChild(container);
        container.appendChild(content_indentation);
        content_indentation.appendChild(contenuto);
    }
    return main;
}

function showCollapsed(target_id) {
    let t = document.getElementById(target_id);
    if (t.className.includes('hide')) {
        t.className = t.className.replace('hide', 'dont-h_i_d_e');
    } else {
        t.className = t.className.replace('dont-h_i_d_e', 'hide');
    }
}

function notState(target_id) {
    target = document.getElementById(target_id);
    if (target.className.includes(" hide ")) {
        target.className = target.className.replace(" hide ", "");
        document.body.style.overflow = "hidden";
    }
    else {
        target.className = target.className + " hide ";
        document.body.style.overflow = "auto";
    }
}

function close_it(target_id, tempo_di_sfumo) {
    let target = document.getElementById(target_id);
    //target.getElementsByClassName("container")[0].style.opacity = "0";
    setTimeout(() => {
        target.className = target.className + " hide ";
    }, tempo_di_sfumo);
}

function filter_title() {
    let search_input = document.getElementById('research').value;
    if (!(search_input.trim())) {
        found_results = films;
        //search_title();
    } else {
        let found_titolo = new Array();
        let found_title = new Array();
        let found_word = new Array();
        //alert("search_input: " + search_input);
        for (let i = 0; i < films.length; i++) {
            //let selected_element_ID = "parent - " + films[i].ID;
            //alert("selected_element_ID: " + selected_element_ID);
            //alert(" ? " + films[i].ti + ".includes(" + search_input + ") " + films[i].ti.includes(search_input));
            if (films[i].ti.includes(search_input)) {
                found_titolo.push(films[i]);
            } else {
                //alert(" ? " + films[i].to + ".includes(" + search_input + ") " + films[i].to.includes(search_input));
                if (films[i].to.includes(search_input)) {
                    found_title.push(films[i]);
                } else {
                    //alert(" ? " + films[i].i + ".includes(" + search_input + ") " + films[i].i.includes(search_input));
                    if (films[i].i.includes(search_input)) {
                        found_word.push(films[i]);
                    } else {
                        if (films[i].tr.includes(search_input)) {
                            found_word.push(films[i]);
                        }
                    }
                }
            }
        }
        found_results = found_titolo.concat(found_title.concat(found_word));
        //console.log(found_titolo);
        //console.log(found_title);
        //console.log(found_word);
        console.log("risultati ricerca:");
        console.log(found_results);
    }
}

function search_title() {
    //console.log("i'm in!!");
    filter_title();
    console.log(found_results);
    for (let i = 0; i < films.length; i++) {
        let temp_id = films[i].ID;
        let target = document.getElementById("card - " + temp_id);
        target.className = target.className.replace('not-c.a.c.h.e.d', 'cached hcached hide');
        setTimeout(() => { document.getElementById("parent - " + temp_id).className = "hide" }, 500);
    }
    for (let i = 0; i < found_results.length; i++) {
        let temp_id = found_results[i].ID;
        let target = document.getElementById("card - " + temp_id);
        target.className = target.className.replace('cached hcached hide', 'not-c.a.c.h.e.d');
        setTimeout(() => { document.getElementById("parent - " + temp_id).className = "not-hidden" }, 500);
    }
}

function order_array(criterio) {

}
