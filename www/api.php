<?php

require_once './functions.php';
$config = require_once './config.php';
$conn = new PDO($config['dsn'], $config['user'], $config['password']);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$post = json_decode(file_get_contents('php://input'), true);

$methods = array(
    'countUsers' => 'countUsers',
    'getUsers' => 'getUsers',
    'geoSort' => 'geoSort',
    'getBlacklist' => 'getBlacklist',
    'login' => 'login',
    'chats' => 'chats',
    'chatid' => 'chatid',
    'dispatch' => 'dispatch',
    'chat_init' => 'chat_init',
    'chat_update' => 'chat_update',
    'like' => 'like',
    'unlike' => 'unlike',
    'block' => 'block',
    'unblock' => 'unblock',
    'matches' => 'matches',
    'likeNmatch' => 'likeNmatch',
    'getImages' => 'getImages',
    'imgUpload' => 'imgUpload',
    'imgDelete' => 'imgDelete',
    'updateProfilePic' => 'updateProfilePic',
);

$function = $post['method'];

echo call_user_func($methods[$function], $post);