<?php
header("Content-type: text/plain;charset=UTF-8");
$command = escapeshellcmd("python /var/www/html/morten/text/results/readPage.py /var/www/html/morten/text/results/erlandse_sorted 0 1000");
shell_exec($command);
//echo exec("python /var/www/html/morten/text/results/readPage.py /var/www/html/morten/text/results/erlandse_sorted 0 1000");
?>