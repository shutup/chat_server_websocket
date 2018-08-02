var ws;
$(function () {
    var $messages = $('#messages');
    var $m = $('#m');
    var $chatForm = $('#chatForm');
    var $signInForm = $('#signInForm');
    var $username = $('#username');
    var $signInArea = $('.signInArea');
    var $chatArea = $('.chatArea');

    ws = new WebSocket('ws://chats.fuckqq.tk:8080');
    ws.onopen = function () {
        console.log('websocket is connected ...');
    };
    ws.onmessage = function (ev) {
        var cmd = JSON.parse(ev.data);
        var action = cmd['action'];
        var data = cmd['data'];
        if (action == 'sign in ok') {
            $signInArea.hide();
            $chatArea.show();
        } else if (action == 'user list') {
            console.log(data);
        } else if (action == 'new chat message') {
            $messages.append(makeUpNewMessage(data));
            $messages[0].scrollTop = $messages[0].scrollHeight;
        }
        console.log(ev);
    };
    ws.onclose = function (ev) {
        console.log('Disconnected!');
    };

    $signInForm.submit(function () {
        var username = $username.val().trim();
        if (username.length > 0) {
            var user = {
                'action': 'sign in',
                'data': username
            }
            ws.send(JSON.stringify(user));
        }
        return false;
    });

    $chatForm.submit(function () {
        var data = {
            'data': {}
        };
        var msg = $m.val();
        if (msg.startsWith('/r ')) {
            var parts = msg.split(' ');
            if (parts.length >= 3) {
                data.action = 'new chat message';
                data.data.to = parts[1];
                parts.shift();
                parts.shift();
                data.data.message = parts.join();
            }
        } else {
            data.action = 'new group message';
            data.data.to = 'room1';
            data.data.message = msg;
        }
        ws.send(JSON.stringify(data));
        $messages.append(makeUpMessage($m.val()));
        $m.val('');
        $messages[0].scrollTop = $messages[0].scrollHeight;
        return false;
    });

    function makeUpNewMessage(data) {
        var username = data.from;
        var message = data.message;
        var li = $('<li/>');

        var avater = $('<div class="avatar"/>');
        var avaterContent = $('<label/>');
        avaterContent.text(username.toUpperCase().charAt(0));
        avater.append(avaterContent);
        var messageBubbleLeft = $('<div class="talk-bubble tri-right left-top"/>');
        var messageContent = $('<div class="talktext"/>');
        var p = $('<p/>');
        p.text(username + ": " + message);
        messageContent.append(p);
        messageBubbleLeft.append(messageContent);
        li.append(avater);
        li.append(messageBubbleLeft);
        return li;
    };

    function makeUpMessage(msg) {
        var li = $('<li/>');
        var messageBubbleRight = $('<div class="talk-bubble-right tri-right btm-right"/>');
        var messageContent = $('<div class="talktext"/>');
        var p = $('<p/>');
        p.text(msg);
        messageContent.append(p);
        messageBubbleRight.append(messageContent);
        li.append(messageBubbleRight);
        return li;
    }

});