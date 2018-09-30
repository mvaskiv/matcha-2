<?php

$config = require_once './config.php';
$conn = new PDO($config['dsn'], $config['user'], $config['password']);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$post = json_decode(file_get_contents('php://input'), true);
$hash = hash('Whirlpool', $post['password']);
$stmt = $conn->prepare("SELECT * FROM `users` WHERE login = '" . $post['login'] . "' AND password = '" . $hash . "' LIMIT 1;");
$stmt->execute();

$result = $stmt->fetch();

if ($result) {
	$arr['data'] = $result;
	$arr['ok'] = true;
} else {
	$arr['ok'] = false;
	// $arr['pw'] = $hash;
}


echo json_encode($arr);