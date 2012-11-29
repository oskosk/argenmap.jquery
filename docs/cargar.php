<?php
$casos = array(
	'http://www.argentina.gob.ar/directorio/mapa/' =>
		array('solucion'=>'1.html'),
	'http://malvinasonline.com.ar/' =>
		array('solucion'=>'2.html')	
);
$caso = $_GET['caso'];
//chequear if in array

//chequear if file_exists
$pagina = file_get_contents( $caso );

$solucion = file_get_contents('casos/'. $casos[$caso]['solucion']);

echo $pagina;

echo $solucion;
?>
