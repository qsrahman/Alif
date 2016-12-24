'use strict';

let game, chicken, horse, sheep, pig, leftArrow, rightArrow;

function setup() {
    game.renderer.backgroundImage = 'assets/background.png'

    let chickenFrames = Alif.frames(
        'assets/chicken_spritesheet.png',
        [[0, 0], [131, 0], [262, 0]],
        131, 200
    );
    chicken = game.add.sprite(chickenFrames);

    let horseFrames = Alif.frames(
        'assets/horse_spritesheet.png',
        [[0, 0], [212, 0], [424, 0]],
        212, 200
    );
    horse = game.add.sprite(horseFrames);

    let sheepFrames = Alif.frames(
        'assets/sheep_spritesheet.png',
        [[0, 0], [244, 0], [488, 0]],
        244, 200
    );
    sheep = game.add.sprite(sheepFrames);

    let pigFrames = Alif.frames(
        'assets/pig_spritesheet.png',
        [[0, 0], [297, 0], [394, 0]],
        297, 200
    );
    pig = game.add.sprite(pigFrames);

    rightArrow = game.add.sprite('assets/arrow.png');    
    leftArrow = game.add.sprite('assets/arrow.png');
    leftArrow.scale.x = -1;
    leftArrow.x = 300;

    game.state = play;
}

function play(dt) {
}

game = new Alif.Game(640, 360, setup,
    [
        'assets/chicken_spritesheet.png',
        'assets/horse_spritesheet.png',
        'assets/sheep_spritesheet.png',
        'assets/pig_spritesheet.png',
        'assets/arrow.png',
        'assets/chicken.mp3',
        'assets/horse.mp3',
        'assets/sheep.mp3',
        'assets/pig.mp3'
    ]
);
