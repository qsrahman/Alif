'use strict';

let game, ball;

function setup() {
    ball = game.add.circle(32, 0x888888, 0x0, 2, 96, 128);

    ball.vx = Alif.utils.randomInt(3, 6);
    ball.vy = Alif.utils.randomInt(2, 4);
    ball.gravity = 0.3;
    ball.frictionX = 1;
    ball.frictionY = 0;
    ball.mass = 1.3;

    game.state = play;
}

function play(dt) {
    //Apply gravity to the vertical velocity
    ball.vy += ball.gravity;

    //Apply friction. `ball.frictionX` will be 0.96 if the ball is 
    //on the ground, and 1 if it's in the air
    ball.vx *= ball.frictionX;

    //Move the ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    //Bounce the ball off the canvas edges. 
    //Left
    if(ball.x < 0) {
        ball.x = 0;
        //Reverse its velocity to make it bounce, and dampen the effect 
        //with mass
        ball.vx = -ball.vx / ball.mass;
    }
    //Right
    if(ball.x + ball.diameter > game.canvas.width) {
        ball.x = game.canvas.width - ball.diameter;
        ball.vx = -ball.vx / ball.mass;
    }

    //Top
    if(ball.y < 0) {
        ball.y = 0;
        ball.vy = -ball.vy / ball.mass;
    }
    //Bottom
    if(ball.y + ball.diameter > game.canvas.height){
        ball.y = game.canvas.height - ball.diameter;
        ball.vy = -ball.vy / ball.mass;

        //Add some friction if it's on the ground
        ball.frictionX = 0.96;
    }
    else {
        //Remove friction if it's not on the ground
        ball.frictionX = 1;
    }

    //Use the `contain` function to bounce the ball off the
    //stage's boundaries
    // let collision = Alif.contain(
    //     ball, 
    //     {x: 0, y: 0, width: game.canvas.width, height: game.canvas.height}, 
    //     true
    // );
    // if (collision === 'bottom') {
    //     //Slow the ball down if it hits the bottom of the state
    //     ball.frictionX = 0.96;
    // } 
    // else {
    //     ball.frictionX = 1;
    // }
}

game = new Alif.Game(640, 480, setup);
