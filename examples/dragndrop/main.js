'use strict';

let game, cat, hedgehog, tiger;

function setup() {
    game.renderer.backgroundColor = 'white';
    game.renderer.canvas.style.border = "1px black dashed";

    cat = game.add.sprite('images/cat.png');
    cat.draggable = true;

    tiger = game.add.sprite('images/tiger.png');
    tiger.draggable = true;
    tiger.position.set(64, 64);

    hedgehog = game.add.sprite('images/hedgehog.png');
    hedgehog.draggable = true;
    hedgehog.position.set(128, 128);

    game.dragAndDrop = true;
    
    game.state = play;
}

function play(dt) {
}

game = new Alif.Game(640, 480, setup,
    [
        'images/cat.png',
        'images/tiger.png',
        'images/hedgehog.png'
    ]
);
