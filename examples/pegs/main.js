'use strict';

let ball, pegs, message, boundry;

function setup() {
    // setup code here
    Game.renderer.backgroundColor = 'black';

    ball = Game.circle(Game.utils.randomInt(16, 64), '0xFF0000');
    ball.x = Game.utils.randomInt(0, Game.canvas.width - ball.diameter);
    ball.y = 0;
    ball.vx = Game.utils.randomInt(-12, 12);
    ball.vy = 0;
    ball.gravity = 0.6;
    ball.frictionX = 1;
    ball.frictionY = 0;
    ball.mass = 0.75 + (ball.diameter / 32);

    pegs = Game.grid(
        5, 4, 96, 96,
        true, 0, 0,
        () => {
            let colors = [
                "0xFFABAB", "0xFFDAAB", "0xDDFFAB", "0xABE4FF", "0xD9ABFF"
            ];
            let fillStyle = colors[Game.utils.randomInt(0, 4)];
            let peg = Game.circle(Game.utils.randomInt(16, 64), fillStyle);

            return peg;
        }
    );
    pegs.position.set(16, 96);

    boundry = {
        x: 0,
        y: 0,
        width: Game.canvas.width,
        height: Game.canvas.height
    };

    Game.state = play;
}

function play() {
    ball.vy += ball.gravity;
    ball.vx *= ball.frictionX;
    ball.x += ball.vx;
    ball.y += ball.vy;

    let stageCollision = Game.contain(ball, boundry, true);
    if(stageCollision === 'bottom') {
        ball.frictionX = 0.96;
    }
    else {
        ball.frictionX = 1;
    }

    Game.hit(ball, pegs.children, true, true, true);
    // pegs.children.forEach(peg => {
    //     Game.circleCollision(ball, peg, true, true);
    // });
}

window.onload = function() {
    Game.create(512, 512, setup);
    Game.start();
 };
