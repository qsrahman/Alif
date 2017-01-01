'use strict';

let game,
    bee,
    angle = 0,
    bulletTimer = 0,
    timeToFire = 30,
    bullets = [];

game = new Alif.Game(550, 400, setup, ['bee.png']);

function setup() {
    bee = game.add.sprite(Alif.frame('bee.png', 0, 0, 77, 77));
    bee.anchor.set(0.5);
    bee.x = game.canvas.width / 2;
    bee.y = game.canvas.height / 2;
    bee.vr = 0.3;
    bee.speed = 3;
    bee.friction = 0.96

    game.state = play;
}

function play(dt) {
    // Calculate the vector between the mouse and the bee
    let dx = game.pointer.centerX - bee.centerX,
        dy = game.pointer.centerY - bee.centerY,
        //The distance between the mouse and the bee
        distance = Math.sqrt(dx * dx + dy * dy),
        //The range, in pixels, to which the bee should be sensitive
        range = 200;

    if(distance <= range) {
        //Find out how much to move
        let moveX = bee.vr * dx / distance,
            moveY = bee.vr * dy / distance;

        //Increase the bee velocity
        bee.vx += moveX;
        bee.vy += moveY;

        //Find the total distance to move
        let moveDistance = Math.sqrt(bee.vx * bee.vx + bee.vy * bee.vy);

        //Apply easing
        bee.vx = bee.speed * bee.vx / moveDistance;
        bee.vy = bee.speed * bee.vy / moveDistance;

        //Find the angle in radians
        angle = Math.atan2(bee.vy, bee.vx);

        bee.rotation = angle + Math.PI / 2;

        //Fire bullets
        bulletTimer++
        if(bulletTimer === timeToFire) {
            fireBullet();
            bulletTimer = 0;
        }
    }
    
    //Apply friction
    bee.vx *= bee.friction;
    bee.vy *= bee.friction;
    
    //Move the bee
    bee.x += bee.vx;
    bee.y += bee.vy;

    Alif.move(bullets);
    bullets = bullets.filter(bullet => {
        //Remove the bullet if it crosses the top of the screen
        if (bullet.centerY < 0
        || bullet.centerX < 0
        || bullet.centerX > game.canvas.width
        || bullet.centerY > game.canvas.height) {
            Alif.remove(bullet);
            return false;
        }
        return true;
    });
}

function fireBullet() {
    //Create a bullet sprite
    let bullet = game.add.sprite(Alif.frame('bee.png', 128, 0, 20, 20));
    //bullet.anchor.set(0.5);
    // bee.addChild(bullet);

    //Center it over the bee
    let radius = 38;
    // bullet.x = bee.x + radius + (radius * Math.cos(angle));
    // bullet.y = bee.y + radius + (radius * Math.sin(angle));

    bullet.x
        = bee.centerX - bullet.halfWidth + bullet.xAnchorOffset
        + (radius * Math.cos(angle));
    bullet.y
        = bee.centerY - bullet.halfHeight + bullet.yAnchorOffset
        + (radius * Math.sin(angle));

    //Set its speed
    bullet.vx = Math.cos(angle) * 7;
    bullet.vy = Math.sin(angle) * 7;

    //Push the bullet into bullets array
    bullets.push(bullet);
}
