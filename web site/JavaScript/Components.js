class Film {
    constructor(titolo, titolo_originale, locandina, intro, trama, durata, anno, generi) {
        this.ti = titolo;
        this.to = titolo_originale;
        this.l = locandina;
        this.i = intro;
        this.tr = trama;
        this.d = durata;
        this.a = anno;
        this.g = generi;
        this.ID = null;
    }
    setGeneri(generi) {
        this.g = generi;
    }
    setID(ID) {
        this.ID = ID;
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

function addGenres(key_titolo, key_anno, genre_array) {
    //alert("addGenres(key_titolo, key_anno, genre_array)...addGenres(" + key_titolo + ", " + key_anno + ", " + genre_array + ")");
    let i, exit = false;
    for (i = 0; i < films.length && !exit; i++) {
        if (films[i].to == key_titolo && films[i].a == key_anno) {
            films[i].setGeneri(genre_array);
            exit = true;
        }
    }
}

function navbar(logo, search, random) {
    /*
        | HTML TRANSLATION
        | <div class="navigationbar">
        |  <!-- if(logo) -->
        |  <div class="logo" id="logo" onclick="location.assign('../pages/home.php')" style="cursor: pointer;">
        |   <img src="../images/logo.png">
        |   Home<br>Cinema
        |  </div>
        |  <!-- if(search) -->
        |  <div class="logo" style="width: 50%; position: relative;">
        |   <input id="research" type="search" placeholder="Cerca ..." oninput="filter_title();" onsearch="search_title();">
        |   <div class="input-inside button push" style="width: 2em; height: 2em; background-color: white;" onclick="search_title();">
        |    <img src="../images/lente.png">
        |   </div>
        |  </div>
        |  <!-- if(random) -->
        |  <div class="button push" id="random film">
        |   <img src="../images/dice.png">
        |  </div>
        | </div>
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
        image.src = "../images/logo.png";
        logo.appendChild(image);
        logo.appendChild(document.createTextNode("Home"));
        logo.appendChild(document.createElement("br"));
        logo.appendChild(document.createTextNode("Cinema"));
        nb.appendChild(logo);
    }
    if (search) {
        let search = document.createElement("div");
        search.className = "logo";
        search.style = "width: 50%; position: relative;";
        let inbar = document.createElement("input");
        inbar.className = "input";
        inbar.id = "research";
        inbar.type = "search";
        inbar.placeholder = "Cerca ...";
        inbar.setAttribute("oninput", "filter_title(); document.cookie = \"search=\" + this.value + \";\";");
        inbar.setAttribute("onsearch", "console.log(\"search value: \" + this.value);search_title();");
        search.appendChild(inbar);
        let enter = document.createElement("div");
        enter.className = "input-inside button push";
        enter.style = "width: 2em; height: 2em; background-color: white;";
        enter.setAttribute("onclick", "search_title();");
        let image = document.createElement("img");
        image.src = "../images/lente.png";
        enter.appendChild(image);
        search.appendChild(enter);
        nb.appendChild(search);
    }
    if (random) {
        let dice = document.createElement("div");
        dice.className = "button push";
        dice.id = "random film";
        let image = document.createElement("img");
        image.src = "../images/dice.png";
        dice.appendChild(image);
        let f = "if (random_history.length > 0) {close_it(random_history[random_history.length - 1].ID, /*100*/0);}let nuovo = found_results[(Math.floor(Math.random() * found_results.length))];while (nuovo == random_history[random_history.length - 1]) {nuovo = found_results[(Math.floor(Math.random() * found_results.length))];}random_history.push(nuovo); notState(random_history[random_history.length - 1].ID);";
        dice.setAttribute("onclick", f);
        nb.appendChild(dice);
    }
    return nb;
}

function FilmCard(_film) {
    _film.setID((_film.to + " (film " + _film.a + ")").replace("\'", ""));
    let element = document.createElement("div");
    element.id = "parent - " + _film.ID;
    let element2 = document.createElement("div");
    element2.className = "card button cached";
    element2.id = "card - " + _film.ID;
    element2.setAttribute("onclick", "notState('" + _film.ID + "')")
    let element3 = document.createElement("div");
    element3.style = "background-image: url('" + _film.l + "'); width: auto; min-height: 18em;";
    element2.appendChild(element3);
    element3 = document.createElement("div");
    element3.style = "padding: 1em;";
    let element4 = document.createElement("p");
    element4.appendChild(document.createTextNode(_film.ti));
    element3.appendChild(element4);
    element4 = document.createElement("p");
    element4.appendChild(document.createTextNode(_film.a));
    element3.appendChild(element4);
    element4 = document.createElement("p");
    element4.appendChild(document.createTextNode(_film.d + " min"));
    element3.appendChild(element4);
    element2.appendChild(element3);
    element.appendChild(element2);
    element.appendChild(FilmDetails(_film));
    return element;
}

function FilmDetails(_film_) {
    let element = document.createElement("div");
    element.id = _film_.ID;
    element.className = "popup film-popup hide ";
    let element2 = document.createElement("div");
    element2.className = "container";
    let element3 = document.createElement("div");
    element3.className = "button close";
    element3.setAttribute("onclick", "notState('" + _film_.ID + "')");
    let element4 = document.createElement("img");
    element4.src = "../images/close.png";
    element3.appendChild(element4);
    element2.appendChild(element3);
    element3 = document.createElement("div");
    element3.appendChild(document.createTextNode(_film_.ti));
    element2.appendChild(element3);
    element3 = document.createElement("div");
    element3.appendChild(document.createTextNode(_film_.to));
    element2.appendChild(element3);
    element3 = document.createElement("img");
    element3.src = _film_.l;
    element3.style = "max-width: 30%; border-radius: 1em;";
    element2.appendChild(element3);
    element3 = document.createElement("div");
    element3.appendChild(document.createTextNode(_film_.i));
    element2.appendChild(element3);
    element3 = document.createElement("div");
    element3.appendChild(document.createTextNode(_film_.tr));
    element2.appendChild(element3);
    element3 = document.createElement("div");
    element3.appendChild(document.createTextNode(_film_.d));
    element2.appendChild(element3);
    element3 = document.createElement("div");
    element3.appendChild(document.createTextNode(_film_.a));
    element2.appendChild(element3);
    element.appendChild(element2);
    return element;
}

function notState(target_id) {
    target = document.getElementById(target_id);
    if (target.className.includes(" hide "))
        target.className = target.className.replace(" hide ", "");
    else
        target.className = target.className + " hide ";
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
        search_title();
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
    console.log("i'm in!!");
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
