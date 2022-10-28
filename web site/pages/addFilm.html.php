<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../master.css">
    <link rel="stylesheet" href="../CSS/Theme.css">
    <link rel="icon" href="../resources/images/icons/logo.png">
    <script src="../JavaScript/Components.js"></script>
    <script>
        function linkers(title) {
            document.getElementById('3-a').setAttribute('href', 'https://www.themoviedb.org/search?query=&language=it-IT'.replace('query=', 'query=' + title));
            document.getElementById('a-a').setAttribute('href', 'https://www.google.com/search?q=film+wikipedia'.replace('film', title.replace(" ", "+")));
            //document.getElementById('3-i').setAttribute('src', 'https://www.themoviedb.org/search?query=&language=it-IT'.replace('query=', 'query=' + title));
            //document.getElementById('a-i').setAttribute('src', 'https://it.wikipedia.org/wiki/film'.replace('film', title.replace(" ", "_")));
        }

        function setG(nomeG) {
            nomeG = "--" + nomeG + "--";
            let target = document.getElementById('10');
            if (target.value.includes(nomeG)) {
                target.value = target.value.replace(nomeG, "");
            } else {
                target.value += nomeG;
            }
        }
    </script>
    <title>Home Cinema | New Film!!</title>
</head>

<body>
    <script>
        document.body.appendChild(navbar(true));
    </script>
    <div id="main">
        <div>
            <div>
                in alternativa alle pagine di fianco prova questi link:
                <ul>
                    <li><a id="a-a" target="_blank">informazioni sul Film</a></li>
                    <li><a id="3-a" target="_blank">locandina</a></li>
                </ul>
            </div>
            <form action="../PHP/addFilm.php" method="post">
                <div class="input-group">
                    <label class="input left-attachment label" for="1">titolo</label>
                    <input class="input right-attachment" oninput="linkers(this.value)" type="text" name="title" id="1" placeholder="" required maxlength="250" autocomplete="off">
                </div>
                <div class="input-group">
                    <label class="input left-attachment label" for="2">titolo originale</label>
                    <input class="input right-attachment" type="text" name="original-title" id="2" placeholder="" required maxlength="250" autocomplete="off">
                </div>
                <div class="input-group">
                    <label class="input left-attachment label" for="3">locandina</label>
                    <input class="input right-attachment" type="url" name="poster" id="3" placeholder="" required maxlength="2083" autocomplete="off">
                </div>
                <div class="input-group">
                    <label class="input left-attachment label" for="4">intro</label>
                    <textarea class="input right-attachment" name="intro" id="4" cols="30" rows="5" placeholder="" required maxlength="2147483647"></textarea>
                </div>
                <div class="input-group">
                    <label class="input left-attachment label" for="5">trama</label>
                    <textarea class="input right-attachment" name="storyline" id="5" cols="30" rows="5" placeholder="" required maxlength="2147483647"></textarea>
                </div>
                <div class="input-group">
                    <label class="input left-attachment label" for="6">durata (minuti)</label>
                    <input class="input right-attachment" type="number" name="minutes" id="6" placeholder="" required min="1" max="300">
                </div>
                <div class="input-group">
                    <label class="input left-attachment label" for="7">lingua originale</label>
                    <select class="input right-attachment" name="original-language" id="7">
                        <option value="inglese" selected>Inglese</option>
                        <option value="italiano">Italiano</option>
                        <option value="spagnolo">Spagnolo</option>
                        <option value="francese">Francese</option>
                        <option value="tedesco">Tedesco</option>
                        <option value="russo">Russo</option>
                        <option value="cantonese">Cantonese</option>
                    </select>
                </div>
                <div class="input-group">
                    <label class="input left-attachment label" for="8">anno di uscita</label>
                    <input class="input right-attachment" type="number" name="release-year" id="8" placeholder="" required min="1900">
                    <script>
                        document.getElementById('8').setAttribute('max', (new Date()).getFullYear())
                    </script>
                </div>
                <div id="list-links-streaming">
                    <script type="text/javascript">
                        let id = 0;

                        function newLink() {
                            let in_links_element = document.createElement("div");
                            in_links_element.className = "input-group";
                            let in_links_label = document.createElement("label");
                            in_links_label.style.borderTopLeftRadius = "0";
                            in_links_label.className = "input left-attachment label";
                            in_links_label.setAttribute("for", "inlink" + id);
                            in_links_label.appendChild(document.createTextNode((id + 1) + "° link per lo streaming"));
                            let in_links_input = document.createElement("input");
                            in_links_input.className = "input right-attachment";
                            in_links_input.setAttribute("type", "url");
                            in_links_input.setAttribute("name", "streaming" + id);
                            in_links_input.setAttribute("autocomplete", "off");
                            in_links_input.id = "inlink" + id;
                            let in_links_button = document.createElement("input");
                            in_links_button.type = "button";
                            in_links_button.value = "Annulla";
                            in_links_button.style.marginLeft = "1%";
                            in_links_button.style.width = "unset";
                            in_links_button.className = "input label attention";
                            in_links_button.setAttribute("onclick", "this.parentNode.style = \"height: 0px; overflow: hidden; padding: 0px;\"; document.getElementById('inlink" + id++ + "').value = \"\";");
                            in_links_element.appendChild(in_links_label);
                            in_links_element.appendChild(in_links_input);
                            in_links_element.appendChild(in_links_button);
                            return in_links_element;
                        }
                    </script>
                    <div>
                        <input type="button" class="input" value="aggiungi un link per lo streaming" onclick="document.getElementById('list-links-streaming').appendChild(newLink()); ">
                    </div>
                </div>

                <div>
                    <label class="" for="10">Genere</label>
                    <div class="hlist">
                        <?php
                        include '../PHP/functions/MyLibrary.php';
                        include '../PHP/functions/dbLibrary.php';
                        $query = "SELECT * FROM genere";
                        $result = dbQuery(null, $query, false);
                        for ($i = 0; $riga = mysqli_fetch_array($result, MYSQLI_ASSOC); $i++) {
                        ?>
                            <div>
                                <input type="checkbox" id="c-<?php print $i; ?>" value="<?php print $riga["nome"]; ?>" onclick="setG(this.value)">
                                <label for="c-<?php print $i; ?>"><?php print $riga["nome"]; ?></label>
                            </div>
                        <?php
                        }
                        ?>
                    </div>
                    <input class="input" type="hidden" name="genres" id="10">
                </div>
                <div>
                    <input type="submit" class="input" value="Inserisci">
                </div>
            </form>
        </div>
    </div>
</body>

</html>