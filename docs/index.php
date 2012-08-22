<?php
define('TPLBASE', '../docs-src');

$fname = 'index.html';
if ( isset($_GET['url'] ) ) {
	$fname = basename($_GET['url']);
}
if (!file_exists(dirname(__FILE__) 
	. DIRECTORY_SEPARATOR . TPLBASE
	. DIRECTORY_SEPARATOR . $fname
	) ) {
	die();
}

if ($fname == 'presentacion.html') {
	require_once( TPLBASE . DIRECTORY_SEPARATOR . 'presentacion.html' );
	die();
}

$acercade =  ($fname == 'acercade.html') ? true: false;

$contenido = file_get_contents( TPLBASE . DIRECTORY_SEPARATOR . $fname);

require_once( TPLBASE . DIRECTORY_SEPARATOR . 'layout.html' );
?>
