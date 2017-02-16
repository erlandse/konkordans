<?php
header("Content-type: text/plain;charset=UTF-8");
include 'url_link.php';

$file =$_POST['file'];
$samples =$_POST['sample'];

$url = $urlPath.$file."_sample.json";
$dir = "/var/www/html/morten/text/results/";

$command = "python " . $resultDir."sampleResult.py ".$resultDir.$file." ".$samples; 
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