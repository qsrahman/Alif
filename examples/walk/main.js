'use strict';

let elf;

function setup() {
    let forest = Game.add.sprite('forest.png');

    let elfFrames = Game.filmstrip(
        'walkcycle.png',
        64, 64
    );

    elf = Game.add.sprite(elfFrames);
    elf.position.set(32, 128);

    elf.states = {
        up: 0,
        left: 9,
        down: 18,
        right: 27,
        walkUp: [1, 8],
        walkLeft: [10, 17],
        walkDown: [19, 26],
        walkRight: [28, 35]
    };

    Game.leftKey.press = () => {
        elf.playSequence(elf.states.walkLeft);
        elf.vx = -1;
        elf.vy = 0;
    };
    Game.leftKey.release = () => {
        if (!Game.rightKey.isDown && elf.vy === 0) {
            elf.show(elf.states.left);
            elf.vx = 0;
        }
    };
    Game.rightKey.press = () => {
        elf.playSequence(elf.states.walkRight);
        elf.vx = 1;
        elf.vy = 0;
    };
    Game.rightKey.release = () => {
        if (!Game.leftKey.isDown && elf.vy === 0) {
            elf.show(elf.states.right);
            elf.vx = 0;
        }
    };
    Game.upKey.press = () => {
        elf.playSequence(elf.states.walkUp);
        elf.vx = 0;
        elf.vy = -1;
    };
    Game.upKey.release = () => {
        if (!Game.downKey.isDown && elf.vx === 0) {
            elf.show(elf.states.up);
            elf.vy = 0;
        }
    };
    Game.downKey.press = () => {
        elf.playSequence(elf.states.walkDown);
        elf.vx = 0;
        elf.vy = 1;
    };
    Game.downKey.release = () => {
        if (!Game.upKey.isDown && elf.vx === 0) {
            elf.show(elf.states.down);
            elf.vy = 0;
        }
    };

    Game.state = play;
}

function play(dt) {
    elf.x += elf.vx;
    elf.y += elf.vy;
}

window.onload = function() {
    Game.create(256, 256, setup,
        [
            'forest.png',
            'walkcycle.png'
        ]
    );
    Game.start();
 };
