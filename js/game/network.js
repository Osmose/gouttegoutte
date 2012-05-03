define(function(require) {
    var Socket = require('lib/socket.io');
    var DefaultWorld = require('flux/worlds/default');
    var GoutteWorld = require('game/world');

    var CONNECTING = 0;
    var JOINING = 1;
    var WAITING = 2;
    var INGAME = 3;

    function NetworkWorld() {
        DefaultWorld.call(this);
        this.state = CONNECTING;
        this.socket = io.connect('http://localhost:8080');
        this.init();
    }
    NetworkWorld.prototype = Object.create(DefaultWorld.prototype);

    NetworkWorld.prototype.tick = function() {};

    NetworkWorld.prototype.render = function(ctx) {
        if (this.state === INGAME) {
            return;
        }

        var stateText = '';
        switch (this.state) {
            case CONNECTING:
                stateText = 'Connecting to the server...';
                break;
            case JOINING:
                stateText = 'Joining a game...';
                break;
            case WAITING:
                stateText = 'Waiting for an opponent...';
                break;
        }

        ctx.fillStyle = "white";
        ctx.fillText(stateText, 20, 460);
    };

    NetworkWorld.prototype.init = function() {
        var self = this;

        this.state = JOINING;
        this.socket.emit('join'); // we want to join a game

        this.socket.on('awaiting', function(data) {
            console.log('Waiting for an opponent');
            self.state = WAITING;
        });
        this.socket.on('gamestarted', function(data) {
            console.log('Game started');
            self.state = INGAME;
            self.startGame();
        });
    };

    NetworkWorld.prototype.startGame = function() {
        this.socket.on('gamewon', function(data) {
            console.log('Game WON! \o/');
        });

        this.engine.pushWorld(new GoutteWorld(this));
    };

    return NetworkWorld;
});
