'use strict';

let ball;

function setup() {
    ball = Game.circle(32, 0x888888, 0x0, 2, 96, 128);

    ball.vx = Game.utils.randomInt(3, 6);
    ball.vy = Game.utils.randomInt(2, 4);

    Game.state = play;
}

function play(dt) {
    //Move the ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    //Bounce the ball off the canvas edges. 
    //Left and right
    if(ball.x < 0 || ball.x + ball.diameter > Game.canvas.width) {
        ball.vx *= -1;
    }

    //Top and bottom
    if(ball.y < 0 || ball.y + ball.diameter > Game.canvas.height) {
        ball.vy *= -1;
    }
}

window.onload = function() {
    Game.create(640, 480, setup);
    Game.start();
 };
