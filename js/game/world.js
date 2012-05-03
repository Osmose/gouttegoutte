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
        for (var y = 0; y < 12; y++) {
            this.playfield[y] = [0, 0, 0, 0, 0, 0];
        }

        this.rotate = 0;
        this.goutte_x = 0;
        this.goutte_y = 0;
        this.goutte1 = 0;
        this.goutte2 = 0;

        this.drop_next = true;
        this.delay = 20;
        this.cur_delay = 20;

        this.down = false;
    }
    GoutteWorld.prototype = Object.create(DefaultWorld.prototype);

    GoutteWorld.prototype.tick = function() {
        var kb = this.engine.kb;

        var p = this.getPos();

        if (!this.drop_next) {
            this.playfield[p[0].y][p[0].x] = 0;
            this.playfield[p[1].y][p[1].x] = 0;
        }

        if (this.cur_delay <= 0) {
            if (this.drop_next) {
                this.drop_next = false;
                this.goutte1 = Math.floor(Math.random() * 5) + 1;
                this.goutte2 = Math.floor(Math.random() * 5) + 1;
                this.goutte_x = 2;
                this.goutte_y = 0;
                this.rotate = 0;

                // CHECK FOR GAME LOSS
            } else {
                this.goutte_y += 1;
                if (this.collide(0, 1)) {
                    this.drop_next = true;
                }
            }
            this.cur_delay = this.delay;
        } else {
            this.cur_delay--;
        }

        if (kb.pressed(kb.D) && !this.drop_next) {
            this.down = true;
            this.rotate += 1;
            if (this.rotate > 3) this.rotate = 0;

            if (this.rotate === 1 && this.goutte_y === 0) this.goutte_y = 1;
            if (this.rotate === 2 &&
                (this.goutte_x === 0 || this.playfield[this.goutte_y][this.goutte_x - 1] !== EMPTY)) {
                this.goutte_x = 1;
            }
            if (this.rotate === 0 &&
                (this.goutte_x === 5 || this.playfield[this.goutte_y][this.goutte_x + 1] !== EMPTY)) {
                this.goutte_x = 4;
            }
            if (this.rotate === 3 &&
                (this.goutte_y === 11 || this.playfield[this.goutte_y + 1][this.goutte_x] !== EMPTY)) {
                this.goutte_y = 10;
            }
        }

        if (!this.drop_next) {
            if (kb.pressed(kb.LEFT) && !this.collide(-1, 0)) this.goutte_x -= 1;
            if (kb.pressed(kb.RIGHT) && !this.collide(1, 0)) this.goutte_x += 1;
        }

        var p = this.getPos();

        this.playfield[p[0].y][p[0].x] = this.goutte1;
        this.playfield[p[1].y][p[1].x] = this.goutte2;

        kb.tick();
    };

    GoutteWorld.prototype.collide = function(dx, dy) {
        var p = this.getPos();
        p[0].x += dx;
        p[1].x += dx;
        p[0].y += dy;
        p[1].y += dy;

        if (p[0].x < 0 || p[0].x > 5) return true;
        if (p[1].x < 0 || p[1].x > 5) return true;
        if (p[0].y < 0 || p[0].y > 11) return true;
        if (p[1].y < 0 || p[1].y > 11) return true;

        return this.playfield[p[0].y][p[0].x] !== EMPTY ||
            this.playfield[p[1].y][p[1].x] !== EMPTY;
    };


    GoutteWorld.prototype.getPos = function() {
        var g2x = this.goutte_x;
        var g2y = this.goutte_y;
        switch (this.rotate) {
        case 0: g2x += 1; break;
        case 1: g2y -= 1; break;
        case 2: g2x -= 1; break;
        case 3: g2y += 1; break;
        }

        return [{x: this.goutte_x, y: this.goutte_y}, {x: g2x, y: g2y}];
    };


    GoutteWorld.prototype.render = function(ctx) {
        for (var y = 0; y < 12; y++) {
            for (var x = 0; x < 6; x++) {
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

        ctx.fillRect(x * 30, y * 30, 30, 30);
    };

    GoutteWorld.prototype.event = function(event) {

    };

    return GoutteWorld;
});
