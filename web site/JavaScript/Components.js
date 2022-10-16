function navbar(logo, search, random) {
    //let nb = "<div class=\"navigationbar\">";
    let nb = document.createElement("div");
    nb.className = "navigationbar";
    if (logo) {
        //nb += "<div class=\"logo\" id=\"logo\" onclick=\"location.assign('../pages/home.php')\" style=\"cursor: pointer;\">";
        let logo = document.createElement("div");
        logo.className = "logo";
        logo.id = "logo";
        logo.setAttribute("onclick", "location.assign('../pages/home.php')");
        logo.style = "cursor: pointer;";
        //nb += "<img src=\"../images/logo.png\">Home<br>Cinema";
        let image = document.createElement("img");
        image.src = "../images/logo.png";
        logo.appendChild(image);
        logo.appendChild(document.createTextNode("Home"));
        logo.appendChild(document.createElement("br"));
        logo.appendChild(document.createTextNode("Cinema"));
        //nb += "</div>";
        nb.appendChild(logo);
    }
    if (search) {
        //nb += "<div class=\"logo\" id=\"research\">";
        let search = document.createElement("div");
        search.className = "logo";
        search.id = "research";
        search.style.position = "relative";
        //nb += "<input class="input" type=\"search\" placeholder=\"Cerca ...\">";
        let inbar = document.createElement("input");
        inbar.className = "input";
        inbar.type = "search";
        inbar.placeholder = "Cerca ...";
        search.appendChild(inbar);
        //nb += "<div class=\"\" onclick=\"\" style=\"width: 3em; height: 3em;\">";
        let enter = document.createElement("div");
        enter.className = "input-inside button push";
        enter.style = "width: 3em; height: 3em; background-color: white; border-radius";
        //nb += "<img src=\"../images/lente.png\">";
        let image = document.createElement("img");
        image.src = "../images/lente.png";
        //nb += "</div>";
        enter.appendChild(image);
        //nb += "</div>";
        search.appendChild(enter);
        nb.appendChild(search);
    }
    if (random) {
        //nb += "<div class=\"button\" id =\"random film\" style=\"border-radius: 50%; background-color: red; width: 3em; height: 3em;\">";
        let dice = document.createElement("div");
        dice.className = "button push";
        dice.id = "random film";
        //nb += "<img src=\"../images/dice.png\">";
        let image = document.createElement("img");
        image.src = "../images/dice.png";
        //nb += "</div>";
        dice.appendChild(image);
        nb.appendChild(dice);
    }
    //nb += "</div>";
    return nb;
}

function FilmCard(title, original_title, img, intro, storyline, minutes, year) {
    let ID = (original_title + " (film " + year + ")").replace("\'", "");
    //let element = "<div>";
    let element = document.createElement("div");
    element.id = "parent- " + ID;
    //element += "<div class=\"card button cached\" onclick=\"notState('" + ID + "')\" onloadeddata=\"this.className = this.className.replace('cached','');\">";
    let element2 = document.createElement("div");
    element2.className = "card button cached";
    element2.setAttribute("onclick", "notState('" + ID + "')")
    //element += "<div style=\"background-image: url('" + img + "'); width: auto; min-height: 18em;\">";
    let element3 = document.createElement("div");
    element3.style = "background-image: url('" + img + "'); width: auto; min-height: 18em;";
    //element += "</div>";
    element2.appendChild(element3);
    //element += "<div style=\"padding: 1em;\">";
    element3 = document.createElement("div");
    element3.style = "padding: 1em;";
    //element += "<p>";
    let element4 = document.createElement("p");
    //element += title;
    element4.appendChild(document.createTextNode(title));
    //element += "</p>";
    element3.appendChild(element4);
    //element += "<p>";
    element4 = document.createElement("p");
    //element += year;
    element4.appendChild(document.createTextNode(year));
    //element += "</p>";
    element3.appendChild(element4);
    //element += "<p>";
    element4 = document.createElement("p");
    //element += minutes;
    element4.appendChild(document.createTextNode(minutes + " min"));
    //element += " min</p>";
    element3.appendChild(element4);
    //element += "</div>";
    element2.appendChild(element3);
    //element += "</div>";
    element.appendChild(element2);
    //element += FilmDetails(ID, title, original_title, img, intro, storyline, minutes, year);
    element.appendChild(FilmDetails(ID, title, original_title, img, intro, storyline, minutes, year));
    //inutile per la cotruzione tramite metodi//element += "</div>";
    return element;
}

function FilmDetails(ID, title, original_title, img, intro, storyline, minutes, year) {
    //let element = "<div id=\"" + ID + "\" class=\"popup film-popup hide \">";
    let element = document.createElement("div");
    element.id = ID;
    element.className = "popup film-popup hide ";
    //element += "<div class=\"container\">";
    let element2 = document.createElement("div");
    element2.className = "container";
    //element += "<div class=\"button close\" onclick=\"notState('" + ID + "')\">";
    let element3 = document.createElement("div");
    element3.className = "button close";
    element3.setAttribute("onclick", "notState('" + ID + "')");
    //element += "<img src=\"../images/close.png\">";
    let element4 = document.createElement("img");
    element4.src = "../images/close.png";
    element3.appendChild(element4);
    //element += "</div>";
    element2.appendChild(element3);
    //element += "<div>";
    element3 = document.createElement("div");
    //element += title;
    element3.appendChild(document.createTextNode(title));
    //element += "</div>";
    element2.appendChild(element3);
    //element += "<div>";
    element3 = document.createElement("div");
    //element += original_title;
    element3.appendChild(document.createTextNode(original_title));
    //element += "</div>";
    element2.appendChild(element3);
    //element += "<img src=\"" + img + "\" style=\"max-width: 30%; border-radius: 1em;\">";
    element3 = document.createElement("img");
    element3.src = img;
    element3.style = "max-width: 30%; border-radius: 1em;";
    element2.appendChild(element3);
    //element += "<div>";
    element3 = document.createElement("div");
    //element += intro;
    element3.appendChild(document.createTextNode(intro));
    //element += "</div>";
    element2.appendChild(element3);
    //element += "<div>";
    element3 = document.createElement("div");
    //element += storyline;
    element3.appendChild(document.createTextNode(storyline));
    //element += "</div>";
    element2.appendChild(element3);
    //element += "<div>";
    element3 = document.createElement("div");
    //element += minutes;
    element3.appendChild(document.createTextNode(minutes));
    //element += "</div>";
    element2.appendChild(element3);
    //element += "<div>";
    element3 = document.createElement("div");
    //element += year;
    element3.appendChild(document.createTextNode(year));
    //element += "</div>";
    element2.appendChild(element3);
    //element += "</div>";
    element.appendChild(element2);
    //inutile per la cotruzione tramite metodi//element += "</div>";
    return element;
}

function notState(target_id) {
    target = document.getElementById(target_id);
    if (target.className.includes(" hide "))
        target.className = target.className.replace(" hide ", "");
    else
        target.className = target.className + " hide ";
}

class Film{
    constructor(titolo, titolo_originale, locandina, intro, trama, durata, anno, generi){
        this.t = titolo;
        this.to = titolo_originale;
        this.l = locandina;
        this.i = intro;
        this.t = trama;
        this.d = durata;
        this.a = anno;
        this.g = generi;
    }
    setGeneri(generi){
        this.g = generi;
    }
}