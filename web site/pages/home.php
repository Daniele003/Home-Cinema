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
    <title>Home Cinema | Welcome</title>
</head>

<body>
    <script>
        document.write(navbar(true, true, true));
    </script>
    <div class="film-list">
        <script type="text/javascript">
            <?php
            include './phpFunctions/MyLibrary.php';
            include './phpFunctions/dbLibrary.php';
            $query = "SELECT * FROM film ORDER BY titolo ASC";
            $result = dbQuery(null, $query, false);
            if (mysqli_num_rows($result) === 0) {
                print "document.write(\"<div>there are no films to display</div>\");";
            }
            while ($target = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
                print "document.write(FilmCard(\"" . clearText($target["titolo"]) . "\", \"" . clearText($target["titolo_originale"]) . "\", \"" . clearText($target["locandina"]) . "\", \"" . clearText($target["intro"]) . "\", \"" . clearText($target["trama"]) . "\", " . $target["durata"] . ", " . $target["uscita"] . "));
            ";
            }
            ?>
        </script>
        <div>
            <div class="card card-unhover" style="border: dashed 3px grey; background-color: lightgrey; background-image: url('../images/add.png'); background-size: contain;" onclick="location.assign('addFilm.html.php');"></div>
        </div>
    </div>
    <div>
    </div>
</body>

</html>