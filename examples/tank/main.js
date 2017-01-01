'use strict';

let game, tank, message, bullets = [];

function setup() {
    tank = game.add.rectangle(32, 32, '0x808080', '0x000000', 2);
    tank.anchor.set(0.5, 0.5);

    let turret = game.add.line('0xFF0000', 4, 0, 0, 32, 0);
    tank.addChild(turret);
    turret.x = 0;
    turret.y = 0;
    tank.x = game.canvas.width/2 - tank.width/2;
    tank.y = game.canvas.height/2 - tank.height/2;

    tank.ax = 0.1;
    tank.ay = 0.1;
    tank.friction = 0.96;
    tank.vr = 0;
    tank.moveForward = false;
    tank.speed = 0;

    game.leftKey.press = () => tank.vr = -0.1;
    game.leftKey.release = () => {
        if (!game.rightKey.isDown) tank.vr = 0;
    }

    game.rightKey.press = () => tank.vr = 0.1;
    game.rightKey.release = () => {
        if (!game.leftKey.isDown) tank.vr = 0;
    }

    game.upKey.press = () => tank.moveForward = true;
    game.upKey.release = () => tank.moveForward = false;

    game.spaceKey.press = () => {
        Alif.shoot(
            tank,
            tank.rotation,
            35,
            0,
            game.stage,
            7,
            bullets,
            () => game.add.circle(8, '0xFF0000')
        );
    };

    message = game.add.text('', {font:'12px Arial', fill: 'black'}, 8, 8);

    game.state = play;
}

function play(dt) {
    tank.rotation += tank.vr;

    if(tank.moveForward) {
        tank.speed += 0.1;
    }
    else {
        tank.speed *= tank.friction;
    }

    tank.ax = tank.speed * Math.cos(tank.rotation);
    tank.ay = tank.speed * Math.sin(tank.rotation);
    
    tank.vx = tank.ax;
    tank.vy = tank.ay;

    tank.x += tank.vx;
    tank.y += tank.vy;

    bullets = bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        let collision = Alif.outsideBounds(
            bullet, 
            {x:0, y:0, width:game.canvas.width, height:game.canvas.height});

        if(collision) {
            message.text = "The bullet hit the " + collision;
            Alif.remove(bullet);
            return false;
        }
        return true;
    });
}

game = new Alif.Game(640, 480, setup);
 
