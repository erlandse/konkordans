<?php
header("Content-type: text/plain;charset=UTF-8");
$url ='localhost:9200/'.$_SERVER["QUERY_STRING"];

echo(loadURL($url));

function loadURL($urlToFetch){

	        $ch = curl_init($urlToFetch);
	        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	        $output = curl_exec($ch);
	        curl_close($ch);
	        return $output;

}

?>