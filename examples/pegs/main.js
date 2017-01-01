'use strict';

let game, ball, pegs, message, boundry;

function setup() {
    // setup code here
    game.renderer.backgroundColor = 'black';

    ball = game.add.circle(Alif.utils.randomInt(16, 32), '0xFF0000');
    ball.x = Alif.utils.randomInt(0, game.canvas.width - ball.diameter);
    ball.y = 0;
    ball.vx = Alif.utils.randomInt(-12, 12);
    ball.vy = 0;
    ball.gravity = 0.6;
    ball.frictionX = 1;
    ball.frictionY = 0;
    ball.mass = 0.75 + (ball.diameter / 32);

    pegs = game.add.grid(
        5, 4, 96, 96,
        true, 0, 0,
        () => {
            let colors = [
                "0xFFABAB", "0xFFDAAB", "0xDDFFAB", "0xABE4FF", "0xD9ABFF"
            ];
            let fillStyle = colors[Alif.utils.randomInt(0, 4)];
            let peg = game.add.circle(Alif.utils.randomInt(16, 64), fillStyle);

            return peg;
        }
    );
    pegs.position.set(16, 96);

    boundry = {
        x: 0,
        y: 0,
        width: game.canvas.width,
        height: game.canvas.height
    };

    game.state = play;
}

function play() {
    ball.vy += ball.gravity;
    ball.vx *= ball.frictionX;
    ball.x += ball.vx;
    ball.y += ball.vy;

    let stageCollision = Alif.contain(ball, boundry, true);
    if(stageCollision === 'bottom') {
        ball.frictionX = 0.96;
    }
    else {
        ball.frictionX = 1;
    }

    Alif.hit(ball, pegs.children, true, true, true);
    // pegs.children.forEach(peg => {
    //     Alif.circleCollision(ball, peg, true, true);
    // });
}

game = new Alif.Game(512, 512, setup);
