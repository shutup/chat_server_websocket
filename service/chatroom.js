const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8080});
var users = new Map();
var user_sockets = new Map();
var groups = new Map();

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        var cmd = JSON.parse(message);
        var action = cmd['action'];
        var data = cmd['data'];
        if (action == 'sign in') {
            ws.username = data.username;
            user_sockets.set(data.username, ws);
            //add to global list
            users.set(data.username, data);

            var result = {
                'action': 'sign in ok'
            };
            ws.send(JSON.stringify(result));
        }
        else if (action == 'get user list') {
            var user_list = Array.from(users.values());
            var result = {
                'action': 'user list',
                'data': user_list
            }
            ws.send(JSON.stringify(result));
        }
        else if (action == 'create group') {

        }
        else if (action == 'new chat message') {
            var client = user_sockets.get(data.to);
            if (client !== undefined && client !== ws && client.readyState === WebSocket.OPEN) {
                var result = {
                    'action': 'new chat message',
                    'data': {
                        'from': ws.username,
                        'to': data.to,
                        'message': data.message
                    }
                };
                client.send(JSON.stringify(result));
            }
        }
        else if (action == 'new group message') {
            var clients = groups.get(data.to);
            clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    var result = {
                        'action': 'new group message',
                        'data': {
                            'from': ws.username,
                            'to': data.to,
                            'message': data
                        }
                    };
                    client.send(JSON.stringify(result));
                }
            })
        } else if (action == 'ping') {
            console.log('get ping at ' + new Date().getTime());
            var result = {
                'action': 'pong'
            };
            ws.send(JSON.stringify(result));
        } else if (action == 'reconnect') {
            console.log('client reconnect at ' + new Date().getTime());
            ws.username = data.username;
            user_sockets.set(data.username, ws);
            //add to global list
            users.set(data.username, data);
        }
    });

    console.log('user connected');
    console.log('current clients:' + wss.clients.size);

    ws.on('close', function close() {
        console.log('client disconnected');
        users.delete(ws.username);
        user_sockets.delete(ws.username);
    });
});
