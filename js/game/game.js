define(function(require) {
    var Engine = require('flux/engine');
    var Entity = require('flux/entity');
    var Graphic = require('flux/graphics/graphic');
    var Loader = require('flux/resources/loader');
    var Network = require('game/network');

    var GoutteWorld = require('game/world');

    // Create a new resource loader.
    var loader = new Loader();

    // REGISTER RESOURCES TO LOAD HERE
    loader.register('firefox', 'img/firefox.png', 'image');

    // Callback run once all resources have been loaded.
    loader.loadAll().done(function() {
        // Initialize engine.
        var engine = new Engine(320, 480, 1, new GoutteWorld());
        engine.bg_color = '#000000';

        // Append canvas to screen and start the engine!
        document.querySelector('#game').appendChild(engine.canvas);
        engine.start();
    });
});
