<?php
header("Content-type: text/plain;charset=UTF-8");
include 'url_link.php';
$file =$_POST['file'];
$file = $resultDir.$file;
$command = "sort " . $file . " -u -o ". $file."_sorted";
echo exec($command);
$command = "rm " . $file;
echo exec($command);

?>