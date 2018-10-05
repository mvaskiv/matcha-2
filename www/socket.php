#!/usr/bin/env php
<?php

$pool = [];
$ids = [];
$socket = stream_socket_server("tcp://0.0.0.0:8200", $errno, $errstr);

if (!$socket) {
    die("$errstr ($errno)\n");
}

$connects = array();
while (true) {
    $read = $connects;
    $read []= $socket;
    $write = $except = null;

    if (!stream_select($read, $write, $except, null)) {
        break;
    }

    if (in_array($socket, $read)) {
        if (($connect = stream_socket_accept($socket, -1)) && $info = handshake($connect)) {
     
            $connects[] = $connect;
            onOpen($connect, $info);
        }
        unset($read[ array_search($socket, $read) ]);
    }

    foreach($read as $connect) {
        $data = fread($connect, 100000);

        if (!$data) {
            fclose($connect);
            unset($connects[ array_search($connect, $connects) ]);
            onClose($connect);
            continue;
        }

        onMessage($connect, $data);
    }
}

fclose($server);

function handshake($connect) {
    $info = array();

    $line = fgets($connect);
    $header = explode(' ', $line);
    $info['method'] = $header[0];
    $info['uri'] = $header[1];

    while ($line = rtrim(fgets($connect))) {
        if (preg_match('/\A(\S+): (.*)\z/', $line, $matches)) {
            $info[$matches[1]] = $matches[2];
        } else {
            break;
        }
    }

    $address = explode(':', stream_socket_get_name($connect, true));
    $info['ip'] = $address[0];
    $info['port'] = $address[1];

    if (empty($info['Sec-WebSocket-Key'])) {
        return false;
    }

    $SecWebSocketAccept = base64_encode(pack('H*', sha1($info['Sec-WebSocket-Key'] . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
    $upgrade = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
        "Upgrade: websocket\r\n" .
        "Connection: Upgrade\r\n" .
        "Sec-WebSocket-Accept:$SecWebSocketAccept\r\n\r\n";
    fwrite($connect, $upgrade);

    return $info;
}

function encode($payload, $type = 'text', $masked = false)
{
    $frameHead = array();
    $payloadLength = strlen($payload);

    switch ($type) {
        case 'text':
            $frameHead[0] = 129;
            break;

        case 'close':
            $frameHead[0] = 136;
            break;

        case 'ping':
            $frameHead[0] = 137;
            break;

        case 'pong':
            $frameHead[0] = 138;
            break;
    }

    if ($payloadLength > 65535) {
        $payloadLengthBin = str_split(sprintf('%064b', $payloadLength), 8);
        $frameHead[1] = ($masked === true) ? 255 : 127;
        for ($i = 0; $i < 8; $i++) {
            $frameHead[$i + 2] = bindec($payloadLengthBin[$i]);
        }
        if ($frameHead[2] > 127) {
            return array('type' => '', 'payload' => '', 'error' => 'frame too large (1004)');
        }
    } elseif ($payloadLength > 125) {
        $payloadLengthBin = str_split(sprintf('%016b', $payloadLength), 8);
        $frameHead[1] = ($masked === true) ? 254 : 126;
        $frameHead[2] = bindec($payloadLengthBin[0]);
        $frameHead[3] = bindec($payloadLengthBin[1]);
    } else {
        $frameHead[1] = ($masked === true) ? $payloadLength + 128 : $payloadLength;
    }

    foreach (array_keys($frameHead) as $i) {
        $frameHead[$i] = chr($frameHead[$i]);
    }
    if ($masked === true) {
        $mask = array();
        for ($i = 0; $i < 4; $i++) {
            $mask[$i] = chr(rand(0, 255));
        }

        $frameHead = array_merge($frameHead, $mask);
    }
    $frame = implode('', $frameHead);

    for ($i = 0; $i < $payloadLength; $i++) {
        $frame .= ($masked === true) ? $payload[$i] ^ $mask[$i % 4] : $payload[$i];
    }

    return $frame;
}

function decode($data)
{
    $unmaskedPayload = '';
    $decodedData = array();

    $firstByteBinary = sprintf('%08b', ord($data[0]));
    $secondByteBinary = sprintf('%08b', ord($data[1]));
    $opcode = bindec(substr($firstByteBinary, 4, 4));
    $isMasked = ($secondByteBinary[0] == '1') ? true : false;
    $payloadLength = ord($data[1]) & 127;

    if (!$isMasked) {
        return array('type' => '', 'payload' => '', 'error' => 'protocol error (1002)');
    }

    switch ($opcode) {
        case 1:
            $decodedData['type'] = 'text';
            break;

        case 2:
            $decodedData['type'] = 'binary';
            break;

        case 8:
            $decodedData['type'] = 'close';
            break;

        case 9:
            $decodedData['type'] = 'ping';
            break;

        case 10:
            $decodedData['type'] = 'pong';
            break;

        default:
            return array('type' => '', 'payload' => '', 'error' => 'unknown opcode (1003)');
    }

    if ($payloadLength === 126) {
        $mask = substr($data, 4, 4);
        $payloadOffset = 8;
        $dataLength = bindec(sprintf('%08b', ord($data[2])) . sprintf('%08b', ord($data[3]))) + $payloadOffset;
    } elseif ($payloadLength === 127) {
        $mask = substr($data, 10, 4);
        $payloadOffset = 14;
        $tmp = '';
        for ($i = 0; $i < 8; $i++) {
            $tmp .= sprintf('%08b', ord($data[$i + 2]));
        }
        $dataLength = bindec($tmp) + $payloadOffset;
        unset($tmp);
    } else {
        $mask = substr($data, 2, 4);
        $payloadOffset = 6;
        $dataLength = $payloadLength + $payloadOffset;
    }

    if (strlen($data) < $dataLength) {
        return false;
    }

    if ($isMasked) {
        for ($i = $payloadOffset; $i < $dataLength; $i++) {
            $j = $i - $payloadOffset;
            if (isset($data[$i])) {
                $unmaskedPayload .= $data[$i] ^ $mask[$j % 4];
            }
        }
        $decodedData['payload'] = $unmaskedPayload;
    } else {
        $payloadOffset = $payloadOffset - 4;
        $decodedData['payload'] = substr($data, $payloadOffset);
    }

    return $decodedData;
}

function onOpen($connect, $info) {
    echo "open\n";
    fwrite($connect, encode('connected'));
}

function onClose($connect) {
    echo "close\n";
}

function onMessage($connect, $data) {
    $payload = explode(' ', decode($data)['payload']);
    if ($payload[1] === 'talala') {
        $keys = array_keys($GLOBALS['ids']);
    
        foreach ($keys as $id) {
            $message->{'willy'} = 1;
            fwrite($GLOBALS['ids'][$id], encode(json_encode($message)));
            $i++;
        }
    } else if ($payload[1] === 'like') {
        if (isset($GLOBALS['pool'][$message->{'mate'}])) {
            $message->{'like'} = 1;
            fwrite($GLOBALS['ids'][$message->{'mate'}], encode(json_encode($message)));
        }
    }
    else if ($payload[1] === 'likeback') {
        if (isset($GLOBALS['pool'][$message->{'mate'}])) {
            $message->{'likeback'} = 1;
            fwrite($GLOBALS['ids'][$message->{'mate'}], encode(json_encode($message)));
        }
    }
    else if ($payload[1] === 'unlike') {
        if (isset($GLOBALS['pool'][$message->{'mate'}])) {
            $message->{'unlike'} = 1;
            fwrite($GLOBALS['ids'][$message->{'mate'}], encode(json_encode($message)));
        }
    }
    else if ($payload[1] === 'check') {
        if (isset($GLOBALS['pool'][$message->{'mate'}])) {
            $message->{'check'} = 1;
            fwrite($GLOBALS['ids'][$message->{'mate'}], encode(json_encode($message)));
        }
    }
    else if ($payload[1] === 'typing') {
        $message = json_decode($payload[0]);
        if (isset($GLOBALS['pool'][$message->{'mate'}])) {
            if ($GLOBALS['pool'][$message->{'mate'}] === 'chat') {
                $message->{'typing'} = 1;
                fwrite($GLOBALS['ids'][$message->{'mate'}], encode(json_encode($message)));
            }
        }
    }
    else if ($payload[1] === 'in') {
        $GLOBALS['pool'][$payload[0]] = $payload[2];
        $GLOBALS['ids'][$payload[0]] = $connect;
    } else if ($payload[1] === 'out') {
        unset($GLOBALS['pool'][$payload[0]]);
    } else {
        $message = json_decode(decode($data)['payload']);
        if (isset($GLOBALS['pool'][$message->{'mate'}])) {
            if ($GLOBALS['pool'][$message->{'mate'}] === 'app') {
                $message->{'chat'} = 2;
                fwrite($GLOBALS['ids'][$message->{'mate'}], encode(json_encode($message)));
            } else if ($GLOBALS['pool'][$message->{'mate'}] === 'chat') {
                $message->{'chat'} = 1;
                fwrite($GLOBALS['ids'][$message->{'mate'}], encode(json_encode($message)));
            }   
        }
    }
    print_r($GLOBALS['pool']);
    print_r($GLOBALS['ids']);
}