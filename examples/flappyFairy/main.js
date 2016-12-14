'use strict';

let sky;

function setup() {
    sky = Game.add.tilingSprite("sky.png", Game.canvas.width, Game.canvas.height);

    Game.state = play;
}

function play(dt) {
    sky.tileX -= 1;
}

// called before setup
function load(dt) {
    console.log('loading...');
}

window.onload = function() {
    Game.create(910, 512, setup,
        [
            'sky.png'
        ],
        load
    );
    Game.start();
 };
