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
    gameOverMessage,
    game;

function setup() {
    let background = game.add.sprite('background.png');

    cannon = game.add.sprite('cannon.png');
    cannon.x = game.canvas.width/2 - cannon.width/2;
    cannon.y = game.canvas.height - 40;

    scoreDisplay = game.add.text('0', {font: '20px emulogic', fill:'#00FF00'}, 400, 10);
    music = game.add.sound('assets/music.mp3');
    music.play();
    
    shootSound = game.add.sound('assets/shoot.mp3');
    shootSound.pan = -0.5;

    explosionSound = game.add.sound('assets/explosion.mp3');
    explosionSound.pan = 0.5;

    game.leftKey.press = () => {
        cannon.vx = -5;
        cannon.vy = 0;
    };
    game.leftKey.release = () => {
        if(!game.rightKey.isDown && cannon.vy === 0) {
            cannon.vx = 0;
        }
    };

    game.rightKey.press = () => {
        cannon.vx = 5;
        cannon.vy = 0;
    };
    game.rightKey.release = () => {
        if(!game.leftKey.isDown && cannon.vy === 0) {
            cannon.vx = 0;
        }
    };

    game.spaceKey.press = () => {
        //Shoot the bullet.
        Alif.shoot(
            cannon,  //The shooter
            4.71,    //The angle at which to shoot (4.71 is up)
            cannon.halfWidth, //Bullet's x position on the cannon
            0,       //Bullet's y position on the canon
            game.stage, //The container to which the bullet should be added
            7,       //The bullet's speed (pixels per frame)
            bullets, //The array used to store the bullets

            //A function that returns the sprite that should
            //be used to make each bullet
            () => {
                return game.add.sprite('bullet.png');
            }
        );
        shootSound.play();
    };

    game.state = play;
}

function play(dt) {
    Alif.move(cannon);
    Alif.contain(cannon, {x:0, y:0, width:game.canvas.width, height:game.canvas.height});

    Alif.move(bullets);

    alienTimer++;

    if(alienTimer === alienFrequency) {
        let alienFrames = ['alien.png', 'explosion.png'];
        let alien = game.add.sprite(alienFrames);
        alien.states = {
            normal: 0,
            destroyed: 1
        };
        alien.y = 0 - alien.height;
        alien.x = Alif.utils.randomInt(0, 14) * alien.width;
        alien.vy = 1;
        aliens.push(alien);
        alienTimer = 0;
        if(alienFrequency > 2) alienFrequency--;
    }
    Alif.move(aliens);

    aliens = aliens.filter(alien => {
        let alienIsAlive = true;
        bullets = bullets.filter(bullet => {
            if(Alif.hitTestRectangle(alien, bullet)) {
                Alif.remove(bullet); // <--- ???
                alien.show(alien.states.destroyed);
                explosionSound.play();
                alien.vy = 0;
                alienIsAlive = false;
                Alif.wait(1000).then(() => {
                    Alif.remove(alien);
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
        game.state = end;
    }

    aliens.forEach(alien => {
        if(alien.y > game.canvas.height) {
            winner = 'aliens';
            game.state = end;
        }
    });

    bullets = bullets.filter(bullet => {
        if(bullet.y < -20) {
            Alif.remove(bullet);
            return false;
        }
        return true;
    });
}

function reset() {
    score = 0;
    alienFrequency = 100;
    alienTimer = 0;
    winner = '';
    music.volume = 1;
    Alif.remove(aliens);
    Alif.remove(bullets);
    Alif.remove(gameOverMessage);
    cannon.x = game.canvas.width/2 - cannon.width/2;
    cannon.y = game.canvas.height - 40;
    game.state = play;
    game.resume();
}

function end() {
    game.pause();

    gameOverMessage = game.add.text('', {font:'20px emulogic', fill:'#00FF00'}, 90, 120);
    music.volume = 0.5;
    
    if (winner === 'player') {
        gameOverMessage.text = 'Earth Saved!';
        gameOverMessage.x = 120;
    }
    else if (winner === 'aliens') {
        gameOverMessage.text = 'Earth Destroyed!';  
    }        
    Alif.wait(3000).then(() => {
        reset();
    });
}

game = new Alif.Game(480, 320, setup,
    [
        'assets/alienArmada.json',
        'assets/emulogic.ttf',
        'assets/shoot.mp3',
        'assets/music.mp3',
        'assets/explosion.mp3'
    ]
);
