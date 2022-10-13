function navbar(logo, search, random) {
    let nb = "<div class=\"navigationbar\">";
    if (logo) {
        nb += "<div class=\"logo\" id=\"logo\" onclick=\"location.assign('../pages/home.php')\" style=\"cursor: pointer;\">";
        nb += "<img src=\"../images/logo.png\">Home<br>Cinema";
        nb += "</div>";
    }
    if (search) {
        nb += "<div class=\"logo\" id=\"research\">";
        nb += "<input type=\"search\" placeholder=\"Cerca ...\">";
        nb += "<div class=\"\" onclick=\"\" style=\"width: 3em; height: 3em;\">";
        nb += "<img src=\"../images/lente.png\">";
        nb += "</div>";
        nb += "</div>";
    }
    if (random) {
        nb += "<div class=\"button\" id =\"random film\" style=\"border-radius: 50%; background-color: red; width: 3em; height: 3em;\">";
        nb += "<img src=\"../images/dice.png\">";
        nb += "</div>";
    }
    nb += "</div>";
    return nb;
}

function FilmCard(title, original_title, img, intro, storyline, minutes, year) {
    let ID = (original_title + " (film " + year + ")").replace("\'", "");
    let element = "<div>";
    element += "<div class=\"card button\" onclick=\"notState('" + ID + "')\">";
    element += "<div style=\"background-image: url('" + img + "'); width: auto; min-height: 18em;\">";
    element += "</div>";
    element += "<div style=\"padding: 1em;\">";
    element += "<p>";
    element += title;
    element += "</p>";
    element += "<p>";
    element += year;
    element += "</p>";
    element += "<p>";
    element += minutes;
    element += " min</p>";
    element += "</div>";
    element += "</div>";
    element += FilmDetails(ID, title, original_title, img, intro, storyline, minutes, year);
    element += "</div>";
    return element;
}

function FilmDetails(ID, title, original_title, img, intro, storyline, minutes, year) {
    let element = "<div id=\"" + ID + "\" class=\"popup film-popup hide \">";
    element += "<div class=\"container\">";
    element += "<div class=\"button close\" onclick=\"notState('" + ID + "')\">";
    element += "<img src=\"../images/close.png\">";
    element += "</div>";
    element += "<div>";
    element += title;
    element += "</div>";
    element += "<div>";
    element += original_title;
    element += "</div>";
    //element += "<div style=\"width: 50%; border-radius: 1em; overflow: hidden;\">";
    element += "<img src=\"" + img + "\" style=\"max-width: 30%; border-radius: 1em;\">";
    //element += "</div>";
    element += "<div>";
    element += intro;
    element += "</div>";
    element += "<div>";
    element += storyline;
    element += "</div>";
    element += "<div>";
    element += minutes;
    element += "</div>";
    element += "<div>";
    element += year;
    element += "</div>";
    element += "</div>";
    element += "</div>";
    return element;
}

function notState(target_id) {
    target = document.getElementById(target_id);
    if (target.className.includes(" hide "))
        target.className = target.className.replace(" hide ", "");
    else
        target.className = target.className + " hide ";
}