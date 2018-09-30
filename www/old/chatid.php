<?php

$config = require_once './config.php';
$conn = new PDO($config['dsn'], $config['user'], $config['password']);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$post = json_decode(file_get_contents('php://input'), true);

$stmt = $conn->prepare("SELECT * FROM `messages` WHERE chat = '" . $post['id'] . "';");
$stmt->execute();

$result = $stmt->fetchAll();

if ($result) {
	$arr['data'] = $result;
	$arr['ok'] = true;
} else {
	$arr['ok'] = false;
}

echo json_encode($arr);