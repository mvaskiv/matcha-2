<?php 

function countUsers() {
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT COUNT(id) FROM users;"
    );
    $stmt->execute();
    $result = $stmt->fetch();
    return json_encode(array(
        'data' => $result[0]
    ));
}

function addAffection($n, $id) {
    $stmt = $GLOBALS['conn']->prepare(
        "UPDATE users SET fame = fame + ? WHERE id = ?;"
    );
    $stmt->execute([$n, $id]);
}


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


function geoSort($post) {
    $tags = '';
    if ($post['tags']) {
        $tag_list = explode(' ', trim($post['tags']));
        $tags = "AND tags LIKE '%" . $tag_list[0] . "%' ";
        if (isset($tag_list[1])) {
            for ($i = 1; isset($tag_list[$i]); $i++) {
                $tags .= " OR tags LIKE '%" . $tag_list[$i] . "%' ";
            }
        }
    } else {
        $tags = '';
    }
    if ($post['gender'] == 'b') {
        $gender = "WHERE gender IN ('f', 'm')";
    } else {
        $gender = "WHERE gender = '" . $post['gender'] . "'";
    }

    $stmt = $GLOBALS['conn']->prepare(
    "SELECT
        *, (
        6371 * acos (
        cos ( radians('50.468006') )
        * cos( radians( latitude ) )
        * cos( radians( longitude ) - radians('30.464214') )
        + sin ( radians('50.468006') )
        * sin( radians( latitude ) )
        )
    ) AS distance,
    DATEDIFF(CURDATE(), dob)/365 AS Age
    FROM users "
    . $gender .
    " AND seeking = '" . $post['seeking'] . "' "
    . $tags .
    "
    AND fame >= " . $post['fame'] . "
     HAVING distance < " . $post['distance'] . "
    AND Age < " . $post['u_a'] . "
    AND Age > " . $post['l_a'] . "
    ORDER BY fame DESC, distance ASC
    LIMIT " . $post['n'] . ", 35;"
    );
    $stmt->execute();
    $result = $stmt->fetchAll();
    return json_encode(array(
        'data' => $result,
        'query' => $stmt
    ));
}

function likeNmatch($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT likes.id AS liked, matches.id AS matched FROM likes 
        LEFT JOIN matches ON matches.first = ? AND matches.second = ? 
        OR matches.second = ? AND matches.first = ? WHERE likes.from = ? 
        AND likes.to = ?"
    );
    $stmt->execute([
        $post['myid'],
        $post['mate'],
        $post['myid'],
        $post['mate'],
        $post['myid'],
        $post['mate']
    ]);
    $result = $stmt->fetch();
    addAffection(1, $post['myid']);
    if ($result) {
        return json_encode(array(
            'ok' => true,
        ));
    } else {
        return json_encode(array(
            'ok' => false,
        ));
    }
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
    addAffection(10, $result['id']);
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
        "SELECT * FROM `messages` WHERE chat = " . $post['id'] . " ORDER BY id DESC LIMIT " . $post['n'] . ", 20;"
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
    addAffection(1, $post['id']);
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
    addAffection(2, $post['myid']);
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


function unlike($post) {
    $stmt = $GLOBALS['conn']->prepare(
        "DELETE FROM `likes` WHERE `from` = ? AND `to` = ?;"
    );
    $stmt->execute([
        $post['myid'],
        $post['mate'],
    ]);
    $stmt_one = $GLOBALS['conn']->prepare(
        "DELETE FROM `matches` WHERE `first` = ? AND `second` = ? OR `first` = ? AND `second` = ?;"
    );
    $stmt_one->execute([
        $post['myid'],
        $post['mate'],
        $post['mate'],
        $post['myid'],
    ]);
    addAffection(-3, $post['myid']);
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
    addAffection(3, $post['myid']);
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
            LEFT JOIN `users` ON matches.second = users.id AND users.id <> ?
            OR matches.first = users.id AND users.id <> ? 
            WHERE matches.first = ? OR matches.second = ?;"
    );
    $stmt->execute([
        $post['id'],
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


function getImages($post) {
    $stmt= $GLOBALS['conn']->prepare(
        "SELECT pictures, avatar FROM `users` WHERE `id` = ? ;"
    );
    $stmt->execute([
        $post['id'],
    ]);
    $res = $stmt->fetch();
    if ($res) {
        return json_encode(array(
            'avatar' => $res['avatar'],
            'data' => $res['pictures'],
            'ok' => true
        ));
    } else {
        return json_encode(array(
            'ok' => false
        ));
    }
}

function imgUpload($post) {
    $arr = explode(',', $post['picture']);
    $data = base64_decode($arr[1]);
    $rand = rand(0, 99999);
    while (file_exists("./pictures/" . $rand . ".png")) {$rand = rand(0, 99999);}
    $fd = fopen("./pictures/" . $rand . ".png", 'w+') or die("Unable to open file!");
    fwrite($fd, $data);
    fclose($fd);
    $stmt = $GLOBALS['conn']->prepare(
        "SELECT pictures FROM `users` WHERE `id` = ? ;"
    );
    $stmt->execute([
        $post['id'],
    ]);
    $result = $stmt->fetch();
    if ($result[0]) {
       $string = trim($result[0]) . ' ' . '/pictures/' . $rand . '.png';
    }
    $stmt_one = $GLOBALS['conn']->prepare(
        "UPDATE `users` SET pictures = ? WHERE `id` = ? ;"
    );
    $res = $stmt_one->execute([
        $string,
        $post['id'],
    ]);
    addAffection(5, $post['id']);
    if ($res) {
        return json_encode(array(
            'data' => '/pictures/' . $rand . '.png',
            'ok' => true
        ));
    } else {
        return json_encode(array(
            'ok' => false
        ));
    }
}

function imgDelete($post) {
    $stmt= $GLOBALS['conn']->prepare(
        "UPDATE `users` SET pictures = ? WHERE `id` = ? ;"
    );
    $res = $stmt->execute([
        $post['pictures'],
        $post['id'],
    ]);    
    addAffection(-5, $post['id']);
    if ($res) {
        return json_encode(array(
            'ok' => true
        ));
    } else {
        return json_encode(array(
            'ok' => false
        ));
    }
}

function updateProfilePic($post) {
    $stmt= $GLOBALS['conn']->prepare(
        "UPDATE `users` SET avatar = ? WHERE `id` = ? ;"
    );
    $res = $stmt->execute([
        $post['avatar'],
        $post['id'],
    ]);
    if ($res) {
        return json_encode(array(
            'ok' => true
        ));
    } else {
        return json_encode(array(
            'ok' => false
        ));
    }
}