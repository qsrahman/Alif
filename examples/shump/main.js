'use strict';

let game;
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
    game.renderer.backgroundImage = 'starfield.png';

    player = game.add.sprite('playerShip1_orange.png');
    player.anchor.set(0.5, 0.5);
    player.scale.set(0.5, 0.5);
    player.x = game.canvas.width / 2;
    player.y = game.canvas.height - 25;

    game.leftKey.press = () => {
        player.vx = -8;
        player.vy = 0;
    };
    game.leftKey.release = () => {
        if(!game.rightKey.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };

    game.rightKey.press = () => {
        player.vx = 8;
        player.vy = 0;
    };
    game.rightKey.release = () => {
        if(!game.leftKey.isDown && player.vy === 0) {
            player.vx = 0;
        }
    };

    game.spaceKey.press = () => {
        //Shoot the bullet.
        Alif.shoot(
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
                return game.add.sprite('laserRed16.png');
            }
        );
        //shootSound.play();
    };

    game.state = play;
}

function play(dt) {
    player.x += player.vx;

    Alif.contain(player, {x:0, y:0, width:game.canvas.width, height:game.canvas.height});

    Alif.move(bullets);

    bullets = bullets.filter(bullet => {
        if(bullet.y < -20) {
            Alif.remove(bullet);
            return false;
        }
        return true;
    });

    console.log(bullets.length);
}

game = new Alif.Game(400, 600, setup,
    [
        'spritesheet.json'
    ]
);
