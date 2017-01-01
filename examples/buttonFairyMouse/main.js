'use strict';

let game,
    fairy, 
    wand,
    angle = 0,
    stars = [];

function setup() {
    fairy = game.add.sprite(Alif.frame('buttonFairy.png', 0, 0, 77, 77));
    fairy.anchor.set(0.5);
    fairy.x = game.canvas.width / 2;
    fairy.y = game.canvas.height / 2;

    wand = game.add.sprite(Alif.frame('buttonFairy.png', 128, 0, 20, 20));
    wand.anchor.set(0.5);
    fairy.addChild(wand);

    game.pointer.press = () => {
        //Shoot the bullet.
        Alif.shoot(
            wand,   //The shooter
            angle,  //The angle at which to shoot
            0,      //Bullet's x position on the canon
            0,      //Bullet's y position on the canon
            game.stage,
            7,      //The bullet's speed (pixels per frame)
            stars,  //The array used to store the bullets

            //A function that returns the sprite that should
            //be used to make each bullet
            () => {
                return game.add.sprite(Alif.frame('buttonFairy.png', 192, 0, 38, 38));
            }
        );
    }
    game.state = play;
}

function play(dt) {
    angle = Alif.angle(fairy, game.pointer);
    Alif.rotateAroundSprite(wand, fairy, 64, angle);
    Alif.followEase(fairy, game.pointer, 0.1);

    Alif.move(stars);
    stars = stars.filter(star => {
        if (star.centerX < 0
        || star.centerY < 0
        || star.centerX > game.canvas.width
        || star.centerY > game.canvas.height) {
                Alif.remove(star);
            return false;
        }
        return true;
    });
    console.log(stars.length);
}

game = new Alif.Game(550, 400, setup, ['buttonFairy.png']);
