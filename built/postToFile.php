<?php
header("Content-type: text/plain;charset=UTF-8");
include 'url_link.php';
$data = $_POST['data'];
$file =$_POST['file'];
$mode =$_POST['mode'];

if ( !file_exists($resultDir) ) {
     $oldmask = umask(0);  // helpful when used in linux server  
     mkdir ($resultDir, 0744);
 }


$file =$resultDir.$file;
$fp =fopen($file,$mode);
fwrite($fp,$data,strlen($data));  
fclose($fp);
?>