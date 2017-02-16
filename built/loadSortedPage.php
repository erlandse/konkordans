<?php
header("Content-type: text/plain;charset=UTF-8");
include 'url_link.php';
$file =$_POST['file'];
$offset =$_POST['offset'];
$lines =$_POST['lines'];

$url = $urlPath.$file.".json";
$command = "python " . $resultDir."readPage.py ".$resultDir.$file." ".$offset. " ".$lines;
exec($command);

echo(loadURL($url));

function loadURL($urlToFetch){
	        $ch = curl_init($urlToFetch);
	        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	        $output = curl_exec($ch);
	        curl_close($ch);
	        return $output;

}
?>