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
    <title>Home Cinema | Welcome</title>
</head>

<body>
    <script>
        document.body.appendChild(navbar(true, true, true));
        document.getElementById('research').value = getCookieValue("search");
    </script>
    <div>
        <!-- pulsanti per riordinare lista film dopo la ricerca e etichette per selezionare i generi secondo cui filtrare -->
    </div>
    <div class="card-group film-list" style="transition: all 1s;">
        <div>
            <div class="card button cached" style="border: dashed 3px grey; background-color: lightgrey; background-image: url('../resources/images/icons/add.png'); background-size: contain; cursor: copy;" onclick="location.assign('addFilm.html.php');"></div>
        </div>
        <script type="text/javascript">
            let push_in = null;

            <?php
            include '../PHP/functions/MyLibrary.php';
            include '../PHP/functions/dbLibrary.php';
            $query = "SELECT `titolo`, `titolo_originale`, `uscita`, `locandina`, `intro`, `trama`, `durata`, `lingua_originale`, `genre_name`, `link` FROM (`film` AS F LEFT JOIN `film-genere` AS G ON F.titolo_originale = G.film_title AND F.uscita = G.film_year)LEFT JOIN `external_streaming` AS S ON F.titolo_originale = S.film_orignal_title AND F.uscita = S.film_release_year ORDER BY F.uscita DESC, F.titolo ASC";
            $result = dbQuery(null, $query, false);
            if (mysqli_num_rows($result) === 0) {
                print "document.write(\"<div>there are no films to display</div>\");";
            } else {
                while ($row_target = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                    print "
//SELECT `titolo`, `titolo_originale`, `uscita`, `locandina`, `intro`, `trama`, `durata`, `lingua_originale`, `genre_name`, `link`
//constructor(                                  titolo,                                       titolo_originale,                                       locandina,                                       intro,                                       trama,                           durata,                         anno,                         generi,                   streaming  )
push_in = new Film(\"" . clearText($row_target["titolo"]) . "\", \"" . clearText($row_target["titolo_originale"]) . "\", \"" . clearText($row_target["locandina"]) . "\", \"" . clearText($row_target["intro"]) . "\", \"" . clearText($row_target["trama"]) . "\", " . $row_target["durata"] . ", " . $row_target["uscita"] . ", \"" . $row_target["genre_name"] . "\", \"" . $row_target["link"] . "\");
films.push(push_in);
console.log(\"added Film: \");
console.log(push_in);";
                }
            }
            ?>
            films = distinct_keys(new Array("to", "a"), new Array("g", "s"), films, films.length);
            cardGroup(films, document.getElementsByClassName('card-group film-list')[0], true);
            search_title();
        </script>
    </div>
    <div>
    </div>
</body>

</html>