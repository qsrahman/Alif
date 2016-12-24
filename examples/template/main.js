'use strict';

let game;

game = new Alif.Game(
    640, 480, setup,
    [
        'images/cat.png',
        'images/tiger.png',
        'audio/explosion.wav'
    ],
    load
);

function setup() {
    console.log('setup');

    game.state = play;
}

function play(dt) {
    console.log("play");
}

// called before setup
function load(dt) {
    console.log('loading...');
}
