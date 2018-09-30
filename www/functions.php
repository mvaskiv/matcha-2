<?php 

function getUsers($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT * FROM `users` LIMIT " . $post['n'] . ", 35;"
    );
    $stmt->execute();
    $result = $stmt->fetchAll();
    return json_encode(array(
        'data' => $result
    ));
}

function getBlacklist($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT * FROM `blacklist` WHERE user = " . $post['myid'] . ";"
    );
    $stmt->execute();
    $result = $stmt->fetchAll();
    return json_encode(array(
        'data' => $result
    ));
}

function login($post) {
    $hash = hash('Whirlpool', $post['password']);
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT * FROM `users` WHERE login = '" . $post['login'] . "' AND password = '" . $hash . "' LIMIT 1;"
    );
    $stmt->execute();
    $result = $stmt->fetch();
    if ($result) {
        return json_encode(array(
            'data' => $result,
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
}

function chats($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT * FROM `chats` WHERE initiator = " . $post['id'] . " OR responder = " . $post['id'] . ";"
    );
    $stmt->execute();
    $result = $stmt->fetchAll();
    if ($result) {
        return json_encode(array(
            'data' => $result,
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
}

function chatid($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT * FROM `messages` WHERE chat = '" . $post['id'] . "';"
    );
    $stmt->execute();
    $result = $stmt->fetchAll();
    if ($result) {
        return json_encode(array(
            'data' => $result,
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
}

function chat_init($post) {
    $check = $GLOBALS['conn']->prepare(
        "SELECT id FROM `chats` WHERE `initiator` = ? AND `responder` = ? OR `initiator` = ? AND `responder` = ?;"
    );
    $check->execute([
        $post['myid'],
        $post['mate'],
        $post['mate'],
        $post['myid'],
    ]);
    $pass = $check->fetch();
    
    if ($pass) {
        return json_encode(array(
            'ok' => true,
            'id' => $pass['id'],
        ));
    } else {
        $stmt = $GLOBALS['conn']->prepare(
            "INSERT INTO `chats` (`initiator`, `responder`, `avatar_one`, `avatar_two`, `initiator_name`, `responder_name`) values (?, ?, ?, ?, ?, ?);"
        );
        $stmt->execute([
            $post['myid'],
            $post['mate'],
            $post['my_avatar'],
            $post['mate_avatar'],
            $post['my_name'],
            $post['mate_firstname'],
        ]);
        if ($stmt) {
            return json_encode(array(
                'ok' => true,
                'id' => $GLOBALS['conn']->lastInsertId(),
            ));
        } 
        return json_encode(array(
            'ok' => false,
        ));
    }
}

function dispatch($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "INSERT INTO `messages` (chat, sender, recipient, body) values (?, ?, ?, ?);"
    );
    $stmt->execute([
        $post['id'],
        $post['myid'],
        $post['mate'],
        $post['body']
    ]);
    $stmt1 = $GLOBALS['conn']->prepare(
        "UPDATE `chats` SET `last_msg` = ? WHERE `id` = ?;"
    );
    $stmt1->execute([
        $post['body'],
        $post['id'],
    ]);
    if ($stmt && $stmt1) {
        return json_encode(array(
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
}

function chat_update($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT * FROM `messages` WHERE chat = ? AND `timestamp` > ? ;"
    );
    $stmt->execute([
        $post['id'],
        $post['timestamp'],
    ]);
    $result = $stmt->fetchAll();
    if ($result) {
        return json_encode(array(
            'data' => $result,
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
}

function like($post) {
    $checkone = $GLOBALS['conn']->prepare(
        "SELECT * FROM `likes` WHERE `from` = ? AND `to` = ? ;"
    );
    $checkone->execute([
        $post['myid'],
        $post['mate'],
    ]);
    $pass = $checkone->fetch();
    if (!$pass) {
        $stmt = $GLOBALS['conn']->prepare(
            "INSERT INTO `likes` (`from`, `to`) values (?, ?);"
        );
        $stmt->execute([
            $post['myid'],
            $post['mate'],
        ]);
        if ($stmt) {
            $check = $GLOBALS['conn']->prepare(
                "SELECT * FROM `likes` WHERE `from` = ? AND `to` = ? ;"
            );
            $check->execute([
                $post['mate'],
                $post['myid'],
            ]);
            $match = $check->fetch();
            if ($match) {
                $stmt = $GLOBALS['conn']->prepare(
                    "INSERT INTO `matches` (`first`, `second`) values (?, ?);"
                );
                $stmt->execute([
                    $post['myid'],
                    $post['mate'],
                ]);
                return json_encode(array(
                    'ok' => 'match',
                ));
            }
            return json_encode(array(
                'ok' => true,
            ));
        } else {
            return json_encode(array(
                'ok' => false,
            ));
        }
    } else {
        return json_encode(array(
            'ok' => 'duplicate',
        ));
    }
}

function block($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "INSERT INTO `blacklist` (user, listed) values (?, ?);"
    );
    $stmt->execute([
        $post['myid'],
        $post['mate'],
    ]);
    if ($stmt) {
        return json_encode(array(
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
}

function unblock($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "DELETE FROM `blacklist` where user = ? AND listed = ?;"
    );
    $stmt->execute([
        $post['myid'],
        $post['mate'],
    ]);
    if ($stmt) {
        return json_encode(array(
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
}

function matches($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT * FROM `matches`
            LEFT JOIN `users` ON matches.second = users.id AND users.id 
            OR matches.first = users.id AND users.id <> ? 
            WHERE matches.first = ? OR matches.second = ?;"
    );
    $stmt->execute([
        $post['id'],
        $post['id'],
        $post['id']
    ]);
    $result = $stmt->fetchAll();
    if ($result) {
        return json_encode(array(
            'data' => $result,
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
}