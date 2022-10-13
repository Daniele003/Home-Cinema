<?php
function dbConnection()
{
    $db = mysqli_connect("localhost", "root", null, "home cinema db") or die("CONNECTION ERROR");
    return $db;
}
function dbQuery($connection, $query, $echo)
{
    if (!$connection)
        $connection = dbConnection();
    $result = mysqli_query($connection, $query) or die("QUERY ERROR");
    if ($echo)
        print "<br>$query<br>$result<br>";
    if (!$connection)
        mysqli_close($connection);
    return $result;
}
?>