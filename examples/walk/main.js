'use strict';

let game, elf;

function setup() {
    let forest = game.add.sprite('forest.png');

    let elfFrames = Alif.filmstrip(
        'walkcycle.png',
        64, 64
    );

    elf = game.add.sprite(elfFrames);
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

    game.leftKey.press = () => {
        elf.playSequence(elf.states.walkLeft);
        elf.vx = -1;
        elf.vy = 0;
    };
    game.leftKey.release = () => {
        if (!game.rightKey.isDown && elf.vy === 0) {
            elf.show(elf.states.left);
            elf.vx = 0;
        }
    };
    game.rightKey.press = () => {
        elf.playSequence(elf.states.walkRight);
        elf.vx = 1;
        elf.vy = 0;
    };
    game.rightKey.release = () => {
        if (!game.leftKey.isDown && elf.vy === 0) {
            elf.show(elf.states.right);
            elf.vx = 0;
        }
    };
    game.upKey.press = () => {
        elf.playSequence(elf.states.walkUp);
        elf.vx = 0;
        elf.vy = -1;
    };
    game.upKey.release = () => {
        if (!game.downKey.isDown && elf.vx === 0) {
            elf.show(elf.states.up);
            elf.vy = 0;
        }
    };
    game.downKey.press = () => {
        elf.playSequence(elf.states.walkDown);
        elf.vx = 0;
        elf.vy = 1;
    };
    game.downKey.release = () => {
        if (!game.upKey.isDown && elf.vx === 0) {
            elf.show(elf.states.down);
            elf.vy = 0;
        }
    };

    game.state = play;
}

function play(dt) {
    elf.x += elf.vx;
    elf.y += elf.vy;
}

game = new Alif.Game(256, 256, setup,
    [
        'forest.png',
        'walkcycle.png'
    ]
);
