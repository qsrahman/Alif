'use strict';

let cat, hedgehog, tiger;

function setup() {
    Game.background = 'white';
    Game.renderer.canvas.style.border = "1px black dashed";
    cat = Game.sprite('images/cat.png');
    cat.draggable = true;

    tiger = Game.sprite('images/tiger.png');
    tiger.draggable = true;
    tiger.position.set(64, 64);

    hedgehog = Game.sprite('images/hedgehog.png');
    hedgehog.draggable = true;
    hedgehog.position.set(128, 128);

    Game.dragAndDrop = true;
    
    Game.state = play;
}

function play(dt) {
}

window.onload = function() {
    Game.create(640, 480, setup,
        [
            'images/cat.png',
            'images/tiger.png',
            'images/hedgehog.png'
        ]
    );
    Game.start();
 };
