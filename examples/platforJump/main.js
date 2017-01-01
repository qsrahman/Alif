'use strict';

let player;
let box; 
let boundry;
// let moveUp = false;
// let moveDown = false;
let moveRight = false;
let moveLeft = false;
let jump = false;
let game;

class Player extends Alif.Sprite {
    constructor(source, x, y) {
        super(game, source, x, y);

        this.ax = 0;
        this.ay = 0;
        this.maxSpeed = 5;
        this.friction = 0.96;
        this.gravity = 0.3;
        this.isOnGround = false;
        this.jumpForce = -10;
        this.gravity = 0.3;
        this.bounce = -0.7;
    }
}

function setup() {
    let frame = Alif.frame('catAndBox.png', 64, 0, 64, 64);
    player = new Player(frame, 150, 250);
    game.stage.addChild(player);

    frame = Alif.frame('catAndBox.png', 0, 0, 64, 64);
    box = game.add.sprite(frame, 350, 320);
    // box.width = 100;
    // box.height = 100;

    game.leftKey.press = () => moveLeft = true;
    game.leftKey.release = () => moveLeft = false;

    game.rightKey.press = () => moveRight = true;
    game.rightKey.release = () => moveRight = false;

    // game.upKey.press = () => moveUp = true;
    // game.upKey.release = () => moveUp = false;

    // game.downKey.press = () => moveDown = true;
    // game.downKey.release = () => moveDown = false;

    game.spaceKey.press = () => jump = true;
    game.spaceKey.release = () => jump = false;

    boundry = {
        x: 0, 
        y: 0, 
        width: game.canvas.width, 
        height: game.canvas.height
    };

    game.state = play;
}

function play(dt) {
    //Up
    // if(moveUp && !moveDown) {
    //     player.ay = -0.2;
    //     player.gravity = 0;
    //     player.friction = 1;
    // }
    // //Down
    // if(moveDown && !moveUp) {
    //     player.ay = 0.2;
    //     player.friction = 1;
    // }
    //Left
    if(moveLeft && !moveRight) {
        player.ax = -0.2;
        player.friction = 1;
    }
    //Right
    if(moveRight && !moveLeft) {
        player.ax = 0.2;
        player.friction = 1;
    }
    //Space
    if(jump && player.isOnGround) {
        player.vy += player.jumpForce;
        player.isOnGround = false;
        player.friction = 1;
    }

    //Set the player's velocity and acceleration to zero if none of the 
    //keys are being pressed
    // if(!moveUp && !moveDown) {
    //     player.ay = 0;
    // }
    if(!moveLeft && !moveRight) {
        player.ax = 0;
        player.friction = 0.96;
        player.gravity = 0.3;
    }

    // if(!moveUp && !moveDown && !moveLeft && !moveRight) {
    //     player.friction = 0.96;
    //     player.gravity = 0.3;
    // }

    //Apply acceleration
    player.vx += player.ax;
    player.vy += player.ay;

    //Apply friction
    if(player.isOnGround)
        player.vx *= player.friction;

    // player.vy *= player.friction;
    player.vy += player.gravity;

    //Limit the speed
    // player.vx = Math.min(player.maxSpeed, 
    //             Math.max(player.vx, -player.maxSpeed));
    // player.vy = Math.min(player.maxSpeed, 
    //             Math.max(player.vy, -player.maxSpeed));

    if (player.vx > player.maxSpeed) {
        player.vx = player.maxSpeed;
    }
    if (player.vx < -player.maxSpeed) {
        player.vx = -player.maxSpeed;
    }
    if (player.vy > player.maxSpeed * 2) {
        player.vy = player.maxSpeed * 2;
        console.log("Terminal velocity!");
    }
    // if (player.vy < -player.maxSpeed) {
    //     player.vy = -player.maxSpeed;
    // }

    player.x += player.vx;
    player.y += player.vy;
    
    // console.log("player.vx:  " + player.vx);
    // console.log("player.x:  " + player.x);
    // console.log("-------------");

    let collisionSide = Alif.rectangleCollision(player, box);
    // Alif.rectangleCollision(box, player, true);

    if(collisionSide === 'bottom' && player.vy >= 0) {
        player.isOnGround = true;
        player.vy = -player.gravity;
    }
    else if(collisionSide === 'top' && player.vy <= 0) {
        player.vy = 0;
    }
    else if(collisionSide === 'right' && player.vx >= 0) {
        player.vx = 0; 
    }
    else if(collisionSide === 'left' && player.vx <= 0) {
        player.vx = 0; 
    }
    if(collisionSide !== 'bottom' && player.vy > 0) {
        player.isOnGround = false;
    }

    //Bounce off the screen edges
    //Left
    if(player.x < 0) {
        player.vx *= player.bounce;
        player.x = 0;
    }
    //Up
    if(player.y < 0) {
        player.vy *= player.bounce;
        player.y = 0;
    }
    //Right
    if(player.x + player.width > game.canvas.width) {
        player.vx *= player.bounce;
        player.x = game.canvas.width - player.width;
    }
    //Down
    if(player.y + player.height > game.canvas.height) {
        // player.vy *= player.bounce;
        player.y = game.canvas.height - player.height;
        player.isOnGround = true;
        player.vy = -player.gravity;
    }

    //Alif.contain(player, boundry, true);
}

// called before setup
function load(dt) {
    console.log('loading...');
}

game = new Alif.Game(640, 480, setup,
    [
        'catAndBox.png'
    ],
    load
);
