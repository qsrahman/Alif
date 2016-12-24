'use strict';

let game, ball;

function setup() {
    ball = game.add.circle(32, 0x888888, 0x0, 2, 96, 128);

    ball.vx = Alif.utils.randomInt(3, 6);
    ball.vy = Alif.utils.randomInt(2, 4);

    game.state = play;
}

function play(dt) {
    //Move the ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    //Bounce the ball off the canvas edges. 
    //Left and right
    if(ball.x < 0 || ball.x + ball.diameter > game.canvas.width) {
        ball.vx *= -1;
    }

    //Top and bottom
    if(ball.y < 0 || ball.y + ball.diameter > game.canvas.height) {
        ball.vy *= -1;
    }
}

game = new Alif.Game(640, 480, setup);
