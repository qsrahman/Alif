'use strict';

let box;

function setup() {
    box = Game.add.tilingSprite('tile.png', 128, 128);

    Game.state = play;
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

window.onload = function() {
    Game.create(256, 256, setup,
        [
            'tile.png'
        ],
        load
    );
    Game.start();
 };
