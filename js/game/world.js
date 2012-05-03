define(function(require) {
    var DefaultWorld = require('flux/worlds/default');

    var EMPTY = 0;
    var BLUE = 1;
    var RED = 2;
    var GREEN = 3;
    var YELLOW = 4;
    var PURPLE = 5;
    var BLACK = 6;

    function GoutteWorld() {
        DefaultWorld.call(this);
        this.playfield = [];
        for (var y = 0; y < 11; y++) {
            this.playfield[y] = [0, 1, 2, 3, 4, 5];
        }
    }
    GoutteWorld.prototype = Object.create(DefaultWorld.prototype);

    GoutteWorld.prototype.tick = function() {

    };

    GoutteWorld.prototype.render = function(ctx) {
        for (var y = 0; y < 11; y++) {
            for (var x = 0; x < 5; x++) {
                if (this.playfield[y][x] !== 0) {
                    this.drawBlob(ctx, x, y, this.playfield[y][x]);
                }
            }
        }
    };

    GoutteWorld.prototype.drawBlob = function(ctx, x, y, color) {
        switch (color) {
        case BLUE: ctx.fillStyle = '#339'; break;
        case RED: ctx.fillStyle = '#933'; break;
        case GREEN: ctx.fillStyle = '#393'; break;
        case YELLOW: ctx.fillStyle = '#993'; break;
        case PURPLE: ctx.fillStyle = '#636'; break;
        case BLACK: ctx.fillStyle = '#333'; break;
        }

        ctx.fillRect(x * 35, y * 35, 35, 35);
    };

    return GoutteWorld;
});
