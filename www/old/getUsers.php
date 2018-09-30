<?php

$config = require_once './config.php';
$conn = new PDO($config['dsn'], $config['user'], $config['password']);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$post = json_decode(file_get_contents('php://input'), true);


function getUsers($post) {
    $stmt = $GLOBALS['conn']->prepare("SELECT * FROM `users` LIMIT 0, 35;");
    $stmt->execute();
    $result = $stmt->fetchAll();
    return json_encode(array(
        'data' => $result,
        'n' => $post,
    ));
}

$methods = array(
    'getUsers' => 'getUsers'
);


$function = $post['method'];

echo call_user_func($methods[$function], $post);
