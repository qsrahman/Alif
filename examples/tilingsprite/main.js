'use strict';

let game, box;

function setup() {
    box = game.add.tilingSprite('tile.png', 256, 256);

    game.state = play;
}

function play(dt) {
    box.tileX += 1;
    box.tileY += 1;
    
    // box.tileScaleX += 0.001;
    // box.tileScaleY += 0.001;

}

// called before setup
function load(dt) {
    console.log('loading...');
}

game = new Alif.Game(256, 256, setup,
    [
        'tile.png'
    ],
    load
);
