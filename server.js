var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

app.listen(8080);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
}

// Server game logic
var awaiting = [],
    games = [];

var Game = function(player1, player2) {
    var self = this;
    this.players = [player1, player2];

    // Tell players the game has started
    player1.emit('gamestarted');
    player2.emit('gamestarted');

    // When a player does something
    player1.on('event', function(data) {
        player2.emit('event', data);
    });
    player2.on('event', function(data) {
        player1.emit('event', data);
    });

    // When a player disconnects
    player1.on('disconnect', function() {
        player2.emit('gamewon');
        self.close();
    });
    player2.on('disconnect', function() {
        player1.emit('gamewon');
        self.close();
    });

    // When a player wins
    player1.on('gamewon', function() {
        player2.emit('gamelost');
        self.close();
    });
    player2.on('gamewon', function() {
        player1.emit('gamelost');
        self.close();
    });
};

Game.prototype.close = function() {
    for (var i in this.players) {
        this.players[i].on('event', function() {});
        this.players[i].on('disconnect', function() {});
        this.players[i].on('gamewon', function() {});
    }
};

io.sockets.on('connection', function (socket) {
    socket.on('join', function (data) {
        console.log('A player wants to join a game');
        if (awaiting.length === 0) {
            // no awaiting player, this player is now waiting
            awaiting.push(socket);
            socket.on('disconnect', function(data) {
                var index = awaiting.indexOf(socket)
                if (index > -1) {
                    awaiting.splice(index, 1);
                }
            });
            socket.emit('awaiting');
        }
        else {
            var opponent = awaiting.pop();
            // create a game with player and opponent
            games.push(new Game(socket, opponent));
        }
    });
});
