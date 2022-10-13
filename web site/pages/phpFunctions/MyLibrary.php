<?php
        function clearText($text)
        {
            return str_replace("'", "\'", str_replace("\"", "\\\"", str_replace("\n", "", str_replace("\r", "", $text))));
        }
?>