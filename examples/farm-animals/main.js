'use strict';

let chicken, horse, sheep, pig, leftArrow, rightArrow;

function setup() {

    let chickenFrames = Game.frames(
        'assets/chicken_spritesheet.png',
        [[0, 0], [131, 0], [262, 0]],
        131, 200
    );
    chicken = Game.sprite(chickenFrames);

    let horseFrames = Game.frames(
        'assets/horse_spritesheet.png',
        [[0, 0], [212, 0], [424, 0]],
        212, 200
    );
    horse = Game.sprite(horseFrames);

    let sheepFrames = Game.frames(
        'assets/sheep_spritesheet.png',
        [[0, 0], [244, 0], [488, 0]],
        244, 200
    );
    sheep = Game.sprite(sheepFrames);

    let pigFrames = Game.frames(
        'assets/pig_spritesheet.png',
        [[0, 0], [297, 0], [394, 0]],
        297, 200
    );
    pig = Game.sprite(pigFrames);

    rightArrow = Game.sprite('assets/arrow.png');    
    leftArrow = Game.sprite('assets/arrow.png');
    leftArrow.scale.x = -1;
    leftArrow.x = 300;
    Game.state = play;
}

function play(dt) {
}

window.onload = function() {
    Game.create(640, 360, setup,
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
    Game.renderer.backgroundImage = 'assets/background.png'
    Game.start();
 };
