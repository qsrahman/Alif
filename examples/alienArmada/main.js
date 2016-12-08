'use strict';

let cannon,
    scoreDisplay,
    score = 0,
    bullets = [],
    aliens = [],
    winner = '',
    scoreNeededToWin = 60, 
    alienFrequency = 100, 
    alienTimer = 0,
    music,
    shootSound,
    explosionSound,
    gameOverMessage;

function setup() {
    let background = Game.sprite('background.png');

    cannon = Game.sprite('cannon.png');
    cannon.x = Game.canvas.width/2 - cannon.width/2;
    cannon.y = Game.canvas.height - 40;

    scoreDisplay = Game.text('0', {font: '20px emulogic', fill:'#00FF00'}, 400, 10);
    music = Game.sound('assets/music.mp3');
    music.play();
    
    shootSound = Game.sound('assets/shoot.mp3');
    shootSound.pan = -0.5;

    explosionSound = Game.sound('assets/explosion.mp3');
    explosionSound.pan = 0.5;

    Game.leftKey.press = () => {
        cannon.vx = -5;
        cannon.vy = 0;
    };
    Game.leftKey.release = () => {
        if(!Game.rightKey.isDown && cannon.vy === 0) {
            cannon.vx = 0;
        }
    };

    Game.rightKey.press = () => {
        cannon.vx = 5;
        cannon.vy = 0;
    };
    Game.rightKey.release = () => {
        if(!Game.leftKey.isDown && cannon.vy === 0) {
            cannon.vx = 0;
        }
    };

    Game.spaceKey.press = () => {
        //Shoot the bullet.
        Game.shoot(
            cannon,  //The shooter
            4.71,    //The angle at which to shoot (4.71 is up)
            cannon.halfWidth, //Bullet's x position on the cannon
            0,       //Bullet's y position on the canon
            Game.stage, //The container to which the bullet should be added
            7,       //The bullet's speed (pixels per frame)
            bullets, //The array used to store the bullets

            //A function that returns the sprite that should
            //be used to make each bullet
            () => {
                return Game.sprite('bullet.png');
            }
        );
        shootSound.play();
    };

    Game.state = play;
}

function play(dt) {
    Game.move(cannon);
    Game.contain(cannon, {x:0, y:0, width:Game.canvas.width, height:Game.canvas.height});

    Game.move(bullets);

    alienTimer++;

    if(alienTimer === alienFrequency) {
        let alienFrames = ['alien.png', 'explosion.png'];
        let alien = Game.sprite(alienFrames);
        alien.states = {
            normal: 0,
            destroyed: 1
        };
        alien.y = 0 - alien.height;
        alien.x = Game.utils.randomInt(0, 14) * alien.width;
        alien.vy = 1;
        aliens.push(alien);
        alienTimer = 0;
        if(alienFrequency > 2) alienFrequency--;
    }
    Game.move(aliens);

    aliens = aliens.filter(alien => {
        let alienIsAlive = true;
        bullets = bullets.filter(bullet => {
            if(Game.hitTestRectangle(alien, bullet)) {
                Game.remove(bullet); // <--- ???
                alien.show(alien.states.destroyed);
                explosionSound.play();
                alien.vy = 0;
                alienIsAlive = false;
                Game.wait(1000).then(() => {
                    Game.remove(alien);
                });

                score += 1;

                return false;
            }
            else {
                return true;
            }
        });
        return alienIsAlive;
    });

    scoreDisplay.text = score;

    if(score === scoreNeededToWin) {
        winner = 'player';
        Game.state = end;
    }

    aliens.forEach(alien => {
        if(alien.y > Game.canvas.height) {
            winner = 'aliens';
            Game.state = end;
        }
    });
}

function reset() {
    score = 0;
    alienFrequency = 100;
    alienTimer = 0;
    winner = '';
    music.volume = 1;
    Game.remove(aliens);
    Game.remove(bullets);
    Game.remove(gameOverMessage);
    cannon.x = Game.canvas.width/2 - cannon.width/2;
    cannon.y = Game.canvas.height - 40;
    Game.state = play;
    Game.resume();
}

function end() {
    Game.pause();

    gameOverMessage = Game.text('', {font:'20px emulogic', fill:'#00FF00'}, 90, 120);
    music.volume = 0.5;
    
    if (winner === 'player') {
        gameOverMessage.text = 'Earth Saved!';
        gameOverMessage.x = 120;
    }
    else if (winner === 'aliens') {
        gameOverMessage.text = 'Earth Destroyed!';  
    }        
    Game.wait(3000).then(() => {
        reset();
    });
}

window.onload = function() {
    Game.create(480, 320, setup,
        [
            'assets/shoot.mp3',
            'assets/music.mp3',
            'assets/explosion.mp3',
            'assets/alienArmada.json',
            'assets/emulogic.ttf'
        ]
    );
    Game.start();
 };
