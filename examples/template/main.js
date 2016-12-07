'use strict';

function setup() {
    console.log('setup');

    Game.state = play;
}

function play(dt) {
    console.log("play");
}

window.onload = function() {
    Game.create(640, 480, setup,
        [
            'images/cat.png',
            'images/tiger.png',
            'audio/explosion.wav'
        ]
    );
    Game.start();
 };
