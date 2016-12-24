'use strict';

let player;
let bullets = [];
let meteors = [
    'meteorBrown_big1.png', 
    'meteorBrown_med1.png', 
    'meteorBrown_med3.png', 
    'meteorBrown_small1.png', 
    'meteorBrown_small2.png',
    'meteorBrown_tiny1.png'
]

function setup() {
    player = Game.add.sprite('playerShip1_orange.png');
    player.anchor.set(0.5, 0.5);
    player.scale.set(0.5, 0.5);
    player.x = Game.canvas.width / 2;
    player.y = Game.canvas.height - 25;

    Game.leftKey.press = () => {
        player.vx = -8;
        player.vy = 0;
    };
    Game.leftKey.release = () => {
        if(!Game.rightKey.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };

    Game.rightKey.press = () => {
        player.vx = 8;
        player.vy = 0;
    };
    Game.rightKey.release = () => {
        if(!Game.leftKey.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };

    Game.spaceKey.press = () => {
        //Shoot the bullet.
        Game.shoot(
            player,  //The shooter
            4.71,    //The angle at which to shoot (4.71 is up)
            //player.halfWidth - 20, //Bullet's x position on the ship
            40,
            //-85,       //Bullet's y position on the ship
            //Game.stage, //The container to which the bullet should be added
            10,       //The bullet's speed (pixels per frame)
            bullets, //The array used to store the bullets

            //A function that returns the sprite that should
            //be used to make each bullet
            () => {
                return Game.add.sprite('laserRed16.png');
            }
        );
        //shootSound.play();
    };

    Game.state = play;
}

function play(dt) {
    player.x += player.vx;

    Game.contain(player, {x:0, y:0, width:Game.canvas.width, height:Game.canvas.height});

    Game.move(bullets);

    bullets = bullets.filter(bullet => {
        if(bullet.y < -20) {
            Game.remove(bullet);
            return false;
        }
        return true;
    });

    console.log(bullets.length);
}

window.onload = function() {
    Game.create(400, 600, setup,
        [
            'spritesheet.json'
        ]
    );
    Game.renderer.backgroundImage = 'starfield.png';
    Game.start();
 };
