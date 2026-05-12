<?php
/**
 * Router script para PHP Built-in Server
 * Redirige todas las peticiones a enviar.php
 */
$_SERVER['SCRIPT_NAME'] = '/enviar.php';
include __DIR__ . '/enviar.php';
return true;