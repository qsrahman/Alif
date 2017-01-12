'use strict';

let game;
let w, h;
let player;
let message;
let score = 0;
let scoreText;
let bullets = [];
let enemies = [];
let meteors = [
    // 'meteorBrown_big1.png', 
    'meteorBrown_med1.png', 
    'meteorBrown_med3.png', 
    'meteorBrown_small1.png', 
    'meteorBrown_small2.png',
    'meteorBrown_tiny1.png'
];

let regularExplosion = [];
let sonicExplosion = [];
let explosions = [];

function setup() {
    game.renderer.backgroundImage = 'starfield.png';
    w = game.canvas.width;
    h = game.canvas.height;

    player = game.add.sprite('playerShip1_orange.png');
    player.anchor.set(0.5, 0.5);
    player.scale.set(0.5, 0.5);
    player.circular = true;
    player.x = w / 2;
    player.y = h - 25;

    createEnemies(8);

    game.leftKey.on('press', () => {
        player.vx = -8;
        player.vy = 0;
    });
    game.leftKey.on('release', () => {
        if(!game.rightKey.isDown && player.vy === 0) {
            player.vx = 0;
        }
    });

    game.rightKey.on('press', () => {
        player.vx = 8;
        player.vy = 0;
    });
    game.rightKey.on('release', () => {
        if(!game.leftKey.isDown && player.vy === 0) {
            player.vx = 0;
        }
    });

    game.spaceKey.on('press', () => {
        //Shoot the bullet.
        Alif.shoot(
            player,  //The shooter
            4.71,    //The angle at which to shoot (4.71 is up)
            player.halfWidth - 24, //Bullet's x position on the ship
            -84,       //Bullet's y position on the ship
            game.stage, //The container to which the bullet should be added
            8,       //The bullet's speed (pixels per frame)
            bullets, //The array used to store the bullets

            //A function that returns the sprite that should
            //be used to make each bullet
            () => {
                return game.add.sprite('laserRed16.png');
            }
        );
        //shootSound.play();
    });

    message = game.add.text('', {font:'30px Arial', fill:'red'});
    message.visible = false;

    scoreText = game.add.text('', {font:'18px Arial', fill:'white'}, w/2, 5);

    for(let i = 0; i < 9; i++) {
        let fileName = `regularExplosion0${i}.png`;
        regularExplosion.push(fileName);

        fileName = `sonicExplosion0{i}.png`;
        sonicExplosion.push(fileName);
    }

    game.state = play;
}

function createEnemies(num) {
    for(let i = 0; i < num; i++) {
        let idx = Alif.utils.randomInt(meteors.length);
        let enemy = game.add.sprite(meteors[idx]);
        enemy.anchor.set(0.5);
        enemy.circular = true;
        
        resetEnemy(enemy);

        enemies.push(enemy);
    }
}

function resetEnemy(enemy) {
    enemy.x = Alif.utils.randomInt(w - enemy.width);
    enemy.y = Alif.utils.randomInt(-100, -40);
    enemy.vx = Alif.utils.randomInt(-2, 2);
    enemy.vy = Alif.utils.randomInt(2, 6);            
    enemy.vr = Alif.utils.randomFloat(-0.1, 0.1);    
}

function createExplosion(x, y, size) {
    let explosion = null;

    if(size === 'large') {
        explosion = game.add.movieClip(regularExplosion, x, y);
        explosion.width = 75;
        explosion.height = 75;
    }
    else if(size === 'small') {
        explosion = game.add.movieClip(regularExplosion, x, y);
        explosion.width = 32;
        explosion.height = 32;
    }
    else {
        explosion = game.add.movieClip(sonicExplosion, x, y);        
    }

    explosion.anchor.set(0.5);
    explosion.animationSpeed = 0.15;
    explosion.loop = false;
    explosion.gotoAndPlay(0);

    explosion.on('complete', () => {
        game.stage.removeChild(explosion);
        explosions.splice(explosions.indexOf(explosion), 1);
    });

    explosions.push(explosion);

    return explosion
}

function play(dt) {
    player.x += player.vx;

    Alif.contain(player, {x: 0, y: 0, width: w, height: h});

    enemies.forEach(enemy => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        enemy.rotation += enemy.vr;

        let hit = Alif.hitTestRectangle(player, enemy);
        if(hit) {
            createExplosion(enemy.centerX, enemy.centerY, 'small');
            resetEnemy(enemy);
            // game.state = endGame;
        }

        if (enemy.y - enemy.halfHeight > h + 10 ||
            enemy.x + enemy.halfWidth < -25 || 
            enemy.x - enemy.halfWidth > w + 20) {
            resetEnemy(enemy);
        }
    });

    bullets = bullets.filter(bullet => {
        bullet.y += bullet.vy;

        for(let i = 0; i < enemies.length; i++) {
            let enemy = enemies[i];
            let hit = Alif.hitTestRectangle(bullet, enemy);
            if(hit) {
                createExplosion(enemy.centerX, enemy.centerY, 'large');
                resetEnemy(enemy);
                bullet.removeFromParent();
                score += Math.round(50 - enemy.radius);
                return false;
            }            
        }
        if(bullet.y < -20) {
            Alif.remove(bullet);
            return false;
        }
        return true;
    });

    explosions.forEach(explosion => {
        explosion.update();
    });

    scoreText.text = score;
}

function endGame() {
    message.text = 'Ship destroyed!';
    message.x = w/2 - message.width/2;
    message.y = h/2 - message.height/2;
    message.visible = true;

    Alif.wait(1000).then(() => { 
        game.state = play;
        message.visible = false;
    });
}

game = new Alif.Game(400, 600, setup, ['spritesheet.json']);
