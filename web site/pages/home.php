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
        document.body.appendChild(navbar(true, true, true));
    </script>
    <div class="film-list" style="transition: all 1s;">
        <div>
            <div class="card button cached" style="border: dashed 3px grey; background-color: lightgrey; background-image: url('../images/add.png'); background-size: contain;" onclick="location.assign('addFilm.html.php');"></div>
        </div>
        <script type="text/javascript">
            const films = new Array();
            let push_in = null;
            function addGenres(key_titolo, key_anno, genre_array){
                let i;
                for(i = 0; i < films.length; i++){

                }
            }
            <?php
            include './phpFunctions/MyLibrary.php';
            include './phpFunctions/dbLibrary.php';
            $counter = 0;
            $query = "SELECT * FROM film ORDER BY titolo ASC";
            $result = dbQuery(null, $query, false);
            if (mysqli_num_rows($result) === 0) {
                print "document.write(\"<div>there are no films to display</div>\");";
            }
            for ($counter = 0; $target = mysqli_fetch_array($result, MYSQLI_ASSOC); $counter++) {
                print "
document.getElementsByClassName('film-list')[0].appendChild(FilmCard(\"" . clearText($target["titolo"]) . "\", \"" . clearText($target["titolo_originale"]) . "\", \"" . clearText($target["locandina"]) . "\", \"" . clearText($target["intro"]) . "\", \"" . clearText($target["trama"]) . "\", " . $target["durata"] . ", " . $target["uscita"] . "));
push_in = new Film(\"" . clearText($target["titolo"]) . "\", \"" . clearText($target["titolo_originale"]) . "\", \"" . clearText($target["locandina"]) . "\", \"" . clearText($target["intro"]) . "\", \"" . clearText($target["trama"]) . "\", " . $target["durata"] . ", " . $target["uscita"] . ", null);
films.push(push_in);
console.log(push_in);";
            }
            ?>
            setTimeout(() => {
                let lista = document.getElementsByClassName('film-list')[0].getElementsByClassName('cached');
                let i = 0;
                let cicle = setInterval(() => {
                    if (i < lista.length) {
                        lista[i].className = lista[i].className.replace('cached');
                        //i += 1;//non necessario poichè javascript utilizza liste dinamiche e quindi ogni volta viene aggiornata automaticamente
                    }
                    //alert("lunghezza lista: " + lista.length);
                }, 200);
            }, 250);
        </script>
    </div>
    <div>
    </div>
</body>

</html>