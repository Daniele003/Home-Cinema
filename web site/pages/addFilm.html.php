<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../master.css">
    <link rel="stylesheet" href="../CSS/Theme.css">
    <link rel="icon" href="../images/logo.png">
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
            let target = document.getElementById('9');
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
            <form action="addFilm.php" method="post">
                <div>
                    <label class="input input-left-out-target" for="1">titolo</label>
                    <input class="input" oninput="linkers(this.value)" type="text" name="title" id="1" placeholder="" required maxlength="250" autocomplete="off">
                </div>
                <div>
                    <label class="input input-left-out-target" for="2">titolo originale</label>
                    <input class="input" type="text" name="original-title" id="2" placeholder="" required maxlength="250" autocomplete="off">
                </div>
                <div>
                    <label class="input input-left-out-target" for="3">locandina</label>
                    <input class="input" type="url" name="poster" id="3" placeholder="" required maxlength="2083" autocomplete="off">
                </div>
                <div>
                    <label class="input input-left-out-target" for="4">intro</label>
                    <textarea class="input" name="intro" id="4" cols="30" rows="10" placeholder="" required maxlength="2147483647"></textarea>
                </div>
                <div>
                    <label class="input input-left-out-target" for="5">trama</label>
                    <textarea class="input" name="storyline" id="5" cols="30" rows="10" placeholder="" required maxlength="2147483647"></textarea>
                </div>
                <div>
                    <label class="input input-left-out-target" for="6">durata (minuti)</label>
                    <input class="input" type="number" name="minutes" id="6" placeholder="" required min="1" max="300">
                </div>
                <div>
                    <label class="input input-left-out-target" for="7">lingua originale</label>
                    <select class="input" name="original-language" id="7">
                        <option value="inglese" selected>Inglese</option>
                        <option value="italiano">Italiano</option>
                        <option value="spagnolo">Spagnolo</option>
                        <option value="francese">Francese</option>
                        <option value="tedesco">Tedesco</option>
                        <option value="russo">Russo</option>
                        <option value="cantonese">Cantonese</option>
                    </select>
                </div>
                <div>
                    <label class="input input-left-out-target" for="8">anno di uscita</label>
                    <input class="input" type="number" name="release-year" id="8" placeholder="" required min="1900">
                    <script>
                        document.getElementById('8').setAttribute('max', (new Date()).getFullYear())
                    </script>
                </div>
                <div>
                    <label class="" for="9">Genere</label>
                    <div>
                        <?php
                        include './phpFunctions/MyLibrary.php';
                        include './phpFunctions/dbLibrary.php';
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
                    <input class="input" type="hidden" name="genres" id="9">
                </div>
                <div>
                    <input type="submit" value="Inserisci">
                </div>
            </form>
        </div>
    </div>
</body>

</html>