'use strict';

let tank, message, bullets = [];

function setup() {
    tank = Game.add.rectangle(32, 32, '0x808080', '0x000000', 2);
    tank.anchor.set(0.5, 0.5);

    let turret = Game.add.line('0xFF0000', 4, 0, 0, 32, 0);
    tank.addChild(turret);
    turret.x = 0;
    turret.y = 0;
    tank.x = Game.canvas.width/2 - tank.width/2;
    tank.y = Game.canvas.height/2 - tank.height/2;

    tank.ax = 0.1;
    tank.ay = 0.1;
    tank.friction = 0.96;
    tank.vr = 0;
    tank.moveForward = false;
    tank.speed = 0;

    Game.leftKey.press = () => tank.vr = -0.1;
    Game.leftKey.release = () => {
        if (!Game.rightKey.isDown) tank.vr = 0;
    }

    Game.rightKey.press = () => tank.vr = 0.1;
    Game.rightKey.release = () => {
        if (!Game.leftKey.isDown) tank.vr = 0;
    }

    Game.upKey.press = () => tank.moveForward = true;
    Game.upKey.release = () => tank.moveForward = false;

    Game.spaceKey.press = () => {
        Game.shoot(
            tank,
            tank.rotation,
            30,
            0,
            Game.stage,
            7,
            bullets,
            () => Game.add.circle(8, '0xFF0000')
        );
    };

    message = Game.add.text('', {font:'12px Arial', fill: 'black'}, 8, 8);

    Game.state = play;
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

        let collision = Game.outsideBounds(
            bullet, 
            {x:0, y:0, width:Game.canvas.width, height:Game.canvas.height});

        if(collision) {
            message.text = "The bullet hit the " + collision;
            Game.remove(bullet);
            return false;
        }
        return true;
    });
}

window.onload = function() {
    Game.create(640, 480, setup);
    Game.start();
 };
