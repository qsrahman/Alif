'use strict';

let game,
    w, h,
    ship,
    shipGraphics,
    speed,
    turnSpeed,
    world,
    enemyBodies = [],
    enemyGraphics = [],
    removeObjs = [];

game = new Alif.Game(1280, 720, setup);

function setup() {
    w = game.canvas.width;
    h = game.canvas.height;

    world = new p2.World({
        gravity: [0, 0]
    });
    speed = 500;
    turnSpeed = 3;

    drawStars();
    setupBoundaries();
    createShip();
    createEnemies();

    game.state = play;
}

function drawStars() {
    // Draw randomly positioned stars.
    for (let i = 0; i < 1500; i++) {
        // Generate random parameters for the stars.
        let x = Math.round(Math.random() * w);
        let y = Math.round(Math.random() * h);
        let rad = Math.ceil(Math.random() * 2);
        let alpha = Math.min(Math.random() + 0.25, 1);

        // Draw the star.
        let star  = game.add.graphics();
        star.beginFill(0xFFFFFF, alpha);
        star.drawCircle(x, y, rad);
        star.endFill();
    }
}

function setupBoundaries() {
    var walls = game.add.graphics();
    walls.beginFill(0xFFFFFF, 0.5);
    walls.drawRect(0, 0, w, 10);
    walls.drawRect(w - 10, 10, 10, h - 20);
    walls.drawRect(0, h - 10, w, 10);
    walls.drawRect(0, 10, 10, h - 20);
}

function createShip() {
    ship = new p2.Body({
        mass: 1,
        angularVelocity: 0,
        damping: 0,
        angularDamping: 0,
        position: [Math.round(w/2), Math.round(h/2)]
    });
    let shipShape = new p2.Rectangle(52, 69);
    ship.addShape(shipShape);
    world.addBody(ship);

    shipGraphics = game.add.graphics();

    //Draw the ship body
    shipGraphics.beginFill(0x20d3fe);
    shipGraphics.moveTo(0, 0);
    shipGraphics.lineTo(-26, 60);
    shipGraphics.lineTo(26, 60);
    shipGraphics.endFill();

    //Draw ship engine
    shipGraphics.beginFill(0x1495d1);
    shipGraphics.drawRect(-15, 60, 30, 8);
    shipGraphics.endFill();
}

function createEnemies() {
    setInterval(() => {
        let x = Math.round(Math.random() * w);
        let y = Math.round(Math.random() * h);
        let vx = (Math.random() - 0.5) * speed;
        let vy = (Math.random() - 0.5) * speed;
        let va = (Math.random() - 0.5) * speed;
        
        let enemy = new p2.Body({
            position: [x, y],
            mass: 1,
            damping: 0,
            angularDamping: 0,
            velocity: [vx, vy],
            angularVelocity: va
        });

        let enemyShape = new p2.Circle(20);
        enemyShape.sensor = true;
        enemy.addShape(enemyShape);
        world.addBody(enemy);

        // Create the graphics object.
        let enemyGraphic = game.add.graphics();
        enemyGraphic.beginFill(0x38d41a);
        enemyGraphic.drawCircle(0, 0, 20);
        enemyGraphic.endFill();
        enemyGraphic.beginFill(0x2aff00);
        enemyGraphic.lineStyle(1, 0x239d0b, 1);
        enemyGraphic.drawCircle(0, 0, 10);
        enemyGraphic.endFill();

        // Keep track of these enemies.
        enemyBodies.push(enemy);
        enemyGraphics.push(enemyGraphic);
    }, 1000);

    world.on('beginContact', event => {
        if(event.bodyB.id === ship.id) {
            removeObjs.push(event.bodyA);
        }
    });
}

function play(dt) {
    if(game.leftKey.isDown) {
        ship.angularVelocity = -1 * turnSpeed;
    }
    else if(game.rightKey.isDown) {
        ship.angularVelocity = turnSpeed;
    }
    else {
        ship.angularVelocity = 0;
    }

    if(game.upKey.isDown) {
        let angle = ship.angle + Math.PI / 2;
        ship.force[0] -= speed * Math.cos(angle);
        ship.force[1] -= speed * Math.sin(angle);     
    }

    // Update the position of the graphics based on the
    // physics simulation position.
    shipGraphics.x = ship.position[0];
    shipGraphics.y = ship.position[1];
    shipGraphics.rotation = ship.angle;

    // Warp the ship to the other side if it is out of bounds.
    if(ship.position[0] > w) {
        ship.position[0] = 0;
    }
    else if(ship.position[0] < 0) {
        ship.position[0] = w;
    }
    if(ship.position[1] > h) {
        ship.position[1] = 0;
    }
    else if(ship.position[1] < 0) {
        ship.position[1] = h;
    }

    // Update enemy positions.
    for (let i = 0; i < enemyBodies.length; i++) {
        enemyGraphics[i].x = enemyBodies[i].position[0];
        enemyGraphics[i].y = enemyBodies[i].position[1];
    }

    // Step the physics simulation forward.
    world.step(dt);

    // Remove enemy bodies.
    for (let i = 0; i < removeObjs.length; i++) {
        world.removeBody(removeObjs[i]);

        let index = enemyBodies.indexOf(removeObjs[i]);
        if (index !== -1) {
            enemyBodies.splice(index, 1);
            game.stage.removeChild(enemyGraphics[index]);
            enemyGraphics.splice(index, 1);
        }
    }
    removeObjs.length = 0;
}
