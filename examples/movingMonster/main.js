'use strict';

let game, monster, boundry;

function setup() {
    let frame = Alif.frame('movingMonster.png', 0, 64, 704, 512);
    let background = game.add.sprite(frame);

    frame = Alif.frame('movingMonster.png', 0, 0, 64, 64);
    monster = game.add.sprite(frame);
    monster.x = 320;
    monster.y = 256;
    monster.speed = 1;
    monster.vx = monster.speed;
    monster.vy = 0;

    boundry = {
        x: 0,
        y: 0,
        width: game.canvas.width,
        height: game.canvas.height
    };

    game.state = play;
}

function play(dt) {
    Alif.move(monster);
    Alif.contain(monster, boundry, false, () => {
        changeDirection();
    });

    //Check whether the monster is at a grid cell corner
    if(Math.floor(monster.x) % 64 === 0 && Math.floor(monster.y) % 64 === 0) { 
        //yes it is at a corner, change its direction
        changeDirection();
    }
}

function changeDirection() {
    let UP = 1,
        DOWN = 2,
        LEFT = 3,
        RIGHT = 4,
        direction = Math.ceil(Math.random() * 7);

    if(direction < 5) {
        switch(direction) {
            case RIGHT:
                monster.vx = monster.speed;
                monster.vy = 0;
                break;
            case LEFT:
                monster.vx = -monster.speed;
                monster.vy = 0;
                break;
            case UP:
                monster.vx = 0;
                monster.vy = -monster.speed;
                break;
            case DOWN:
                monster.vx = 0;
                monster.vy = monster.speed;
                break;
        }
    }
}

game = new Alif.Game(704, 512, setup,
    [
        'movingMonster.png'
    ]
);
