define(function(require) {
    var DefaultWorld = require('flux/worlds/default');

    var EMPTY = 0;
    var BLUE = 1;
    var RED = 2;
    var GREEN = 3;
    var YELLOW = 4;
    var PURPLE = 5;
    var BLACK = 6;

    var WORLD_HEIGHT = 12;
    var WORLD_WIDTH = 6;

    function GoutteWorld() {
        DefaultWorld.call(this);
        this.playfield = [];
        for (var y = 0; y < WORLD_HEIGHT; y++) {
            this.playfield[y] = [];
            for (var x = 0; x < WORLD_WIDTH; x++) {
                this.playfield[y][x] = 0;
            }
        }

        this.rotate = 0;
        this.goutte_x = 0;
        this.goutte_y = 0;
        this.goutte1 = 0;
        this.goutte2 = 0;

        this.drop_next = true;
        this.delay = 20;
        this.cur_delay = 20;

        this.width = WORLD_WIDTH; // number of cells
        this.height = WORLD_HEIGHT; // number of cells

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
                p[0].y += 1;
                p[1].y += 1;
                if (this.collide(0, 1)) {
                    this.drop_next = true;
                    this.playfield[p[0].y][p[0].x] = this.goutte1;
                    this.playfield[p[1].y][p[1].x] = this.goutte2;
                    this.fallWorld();
                }
            }
            this.cur_delay = this.delay;
        } else {
            this.cur_delay--;
        }

        if (!this.drop_next) {
            if (kb.pressed(kb.D)) {
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

            if (kb.pressed(kb.LEFT) && !this.collide(-1, 0)) this.goutte_x -= 1;
            if (kb.pressed(kb.RIGHT) && !this.collide(1, 0)) this.goutte_x += 1;

            p = this.getPos();

            this.playfield[p[0].y][p[0].x] = this.goutte1;
            this.playfield[p[1].y][p[1].x] = this.goutte2;
        }

        var totalGroups = 0;
        var countGroups;
        while (countGroups = this.resolve() > 0) {
            totalGroups += countGroups;
        }

        // Now do something with that score, like... KILLING YOUR ENNEMY!

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

    GoutteWorld.prototype.fallWorld = function() {
        for (var x = 0; x < 6; x++) {
            var last_solid = 12;
            for (var y = 11; y >= 0; y--) {
                if (this.playfield[y][x] !== EMPTY) {
                    if (last_solid === null || last_solid === y + 1) {
                        last_solid = y;
                    } else {
                        last_solid -= 1;
                        this.playfield[last_solid][x] = this.playfield[y][x];
                        this.playfield[y][x] = EMPTY;
                    }
                }
            }
        }
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

    /**
     * Go through all bubbles, find groups of 4 or more bubbles and delete
     * them. Return the number of groups that were deleted.
     *
     * @return int Number of groups of 4 or more bubbles this turn.
     */
    GoutteWorld.prototype.resolve = function() {
        // a list of all groups
        var groupsPool = [];

        // a matrix of all groups, indexed by cells coordinates, default is false
        var groups = [];
        for (var y = 0; y < this.height; y++) {
            groups[y] = [];
            for (var x = 0; x < this.width; x++) {
                groups[y][x] = false;
            }
        }

        // go through all cells
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                if (this.playfield[y][x] === EMPTY) {
                    continue;
                }

                // if the current cell has no group, create a new one
                var group = null;
                if (groups[y][x] !== false) {
                    group = groups[y][x];
                }
                else {
                    group = [[x, y]];
                    groups[y][x] = group;
                    groupsPool.push(group);
                }

                var color = this.playfield[y][x];

                // check the bottom and right cells
                if (this.playfield[y+1] && this.playfield[y+1][x] === color) {
                    if (groups[y+1] && groups[y+1][x] !== false) {
                        var nextGroup = groups[y+1][x];
                        // add all cells of the other group to the current one
                        for (var g in nextGroup) {
                            group.push(nextGroup[g]);
                        }
                        // update all cells from the other group
                        for (var g in nextGroup) {
                            var i = nextGroup[g][0],
                                j = nextGroup[g][1];
                            groups[j][i] = group;
                        }
                    }
                    else {
                        group.push([x, y+1]);
                        groups[y+1][x] = group;
                    }
                }
                if (this.playfield[y][x+1] === color) {
                    if (groups[y][x+1] !== false) {
                        var nextGroup = groups[y][x+1];
                        // add all cells of the other group to the current one
                        for (var g in nextGroup) {
                            group.push(nextGroup[g]);
                        }
                        // update all cells from the other group
                        for (var g in nextGroup) {
                            var i = nextGroup[g][0],
                                j = nextGroup[g][1];
                            groups[j][i] = group;
                        }
                    }
                    else {
                        group.push([x+1, y]);
                        groups[y][x+1] = group;
                    }
                }
            }
        }

        // check all groups and remove all complete groups
        var fall = false;
        var numberOfCompleteGroups = 0;
        for (var g in groupsPool) {
            if (groupsPool[g].length >= 4) {
                this.removeGroup(groupsPool[g]);
                fall = true;
                numberOfCompleteGroups++;
            }
        }

        if (fall) {
            this.fallWorld();
        }

        return numberOfCompleteGroups;
    };

    GoutteWorld.prototype.removeGroup = function(group) {
        for (var c in group) {
            var x = group[c][0],
                y = group[c][1];
            this.playfield[y][x] = EMPTY;
        }
    };

    return GoutteWorld;
});
