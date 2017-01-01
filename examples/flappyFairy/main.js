'use strict';

let game, sky;

function setup() {
    sky = game.add.tilingSprite("sky.png", game.canvas.width, game.canvas.height);

    game.state = play;
}

function play(dt) {
    sky.tileX -= 1;
}

// called before setup
function load(dt) {
    console.log('loading...');
}

game = new Alif.Game(910, 512, setup,
    [
        'sky.png'
    ],
    load
);
