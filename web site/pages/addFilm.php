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
    <title>Home Cinema | Saving New Film ...</title>
</head>

<body>
    <?php
    include './phpFunctions/MyLibrary.php';
    include './phpFunctions/dbLibrary.php';
    $titolo = $_POST["title"];
    $titolo_originale = $_POST["original-title"];
    $locandina = $_POST["poster"];
    $intro = $_POST["intro"];
    $trama = $_POST["storyline"];
    $durata = $_POST["minutes"];
    $lingua_originale = $_POST["original-language"];
    $uscita = $_POST["release-year"];
    $generi = explode("--", $_POST["genres"]); // il vettore conterrà i valori corretti solo nelle posizioni dispari
    $db = dbConnection();
    $query = "INSERT INTO film VALUES ('" . clearText($titolo) . "','" . clearText($titolo_originale) . "','" . clearText($locandina) . "','" . clearText($intro) . "','" . clearText($trama) . "',$durata,'" . clearText($lingua_originale) . "',$uscita)";
    dbQuery($db, $query, true);
    for ($i = 1; $i < count($generi); $i += 2) {
        $query = "INSERT INTO `film-genere` VALUES ('" . clearText($titolo_originale) . "', $uscita, '" . $generi[$i] . "')";
        dbQuery($db, $query, true);
    }
    ?>
    <script>
        /*
        setTimeout(() => {
            alert("waiting ...");*/
            location.replace("addFilm.html.php");/*
        }, 500);
        */
    </script>
</body>

</html>