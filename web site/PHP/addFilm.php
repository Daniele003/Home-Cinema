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
    <title>Home Cinema | Saving New Film ...</title>
</head>

<body>
    <?php
    include '../PHP/functions/MyLibrary.php';
    include '../PHP/functions/dbLibrary.php';
    $titolo = $_POST["title"];
    $titolo_originale = $_POST["original-title"];
    $locandina = $_POST["poster"];
    $intro = $_POST["intro"];
    $trama = $_POST["storyline"];
    $durata = $_POST["minutes"];
    $lingua_originale = $_POST["original-language"];
    $uscita = $_POST["release-year"];
    $link_streaming = false;
    if (isset($_POST["streaming0"])) {
        $link_streaming = array();
        for ($index = 0; isset($_POST["streaming" . $index]); $index++) {
            $iterator = $_POST["streaming" . $index];
            if ($iterator) {
                array_push($link_streaming, $iterator);
                print "array_push($link_streaming, $iterator);<br>";
            }
        }
    }
    $generi = explode("--", $_POST["genres"]); // il vettore conterrà i valori corretti solo nelle posizioni dispari
    $db = dbConnection();
    $query = "INSERT INTO `film` (`titolo`, `titolo_originale`, `locandina`, `intro`, `trama`, `durata`, `lingua_originale`, `uscita`) VALUES ('" . clearText($titolo) . "','" . clearText($titolo_originale) . "','" . clearText($locandina) . "','" . clearText($intro) . "','" . clearText($trama) . "',$durata,'" . clearText($lingua_originale) . "',$uscita)";
    dbQuery($db, $query, true);
    for ($i = 1; $i < count($generi); $i += 2) {
        $query = "INSERT INTO `film-genere` (`film_title`, `film_year`, `genre_name`) VALUES ('" . clearText($titolo_originale) . "', $uscita, '" . $generi[$i] . "')";
        dbQuery($db, $query, true);
    }
    for ($i = 0; $link_streaming && $i < count($link_streaming); $i += 2) {
        #print "alert('link $i: " . $link_streaming[$i] . "');";
        $query = "INSERT INTO `external_streaming` (`film_orignal_title`, `film_release_year`, `link`) VALUES ('" . clearText($titolo_originale) . "','" . clearText($uscita) . "','" . clearText($link_streaming[$i]) . "')";
        dbQuery($db, $query, true);
    }
    ?>
    <script>
        /*
        setTimeout(() => {
            alert("waiting ...");*/
        location.replace("../pages/addFilm.html.php");
        /*
                }, 500);
                */
    </script>
</body>

</html>