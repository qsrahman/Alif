'use strict';

let game, ship, boundary, message;

function setup() {
    game.renderer.backgroundColor = 'black';

    ship = game.add.sprite('spaceship.png');
    ship.anchor.set(0.5);
    ship.x = game.canvas.width / 6;
    ship.y = game.canvas.height / 2;
    ship.ax = 0.2;
    ship.ay = 0.2;
    ship.vr = 0;
    ship.frictionX = 0.98;
    ship.frictionY = 0.98;
    ship.moveForward = false;

    boundary = game.add.line('yellow', 2, 100, 100, 400, 400);
    message = game.add.text('', {font: '16px Futura', fill: 'white'});
    message.position.set(16);

    game.leftKey.on('press', () => ship.vr = -0.1);
    game.leftKey.on('release', () => {
        if(!game.rightKey.isDown) ship.vr = 0;
    });

    game.rightKey.on('press', () => ship.vr = 0.1);
    game.rightKey.on('release', () => {
        if(!game.leftKey.isDown) ship.vr = 0;
    });

    game.upKey.on('press', () => ship.moveForward = true);
    game.upKey.on('release', () => ship.moveForward = false);

    game.state = play;
}

function play(dt) {
    ship.rotation += ship.vr;

    //If `ship.moveForward` is `true`, use acceleration  with a 
    //bit of basic trigonometry to make the ship move in the
    //direction of its rotation
    if (ship.moveForward) {
        ship.vx += ship.ax * Math.cos(ship.rotation);
        ship.vy += ship.ay * Math.sin(ship.rotation);
    } 
    //If `ship.moveForward` is `false`, use optional
    //friction to slow the ship down
    else {
        ship.vx *= ship.frictionX;
        ship.vy *= ship.frictionY;
    }

    //Move the ship
    ship.x += ship.vx;
    ship.y += ship.vy;

    //Get a vector between the center of the ship and
    //the start point of the line
    let v1 = {};
    v1.x = boundary.ax - ship.centerX;
    v1.y = boundary.ay - ship.centerY;

    //2. Get the boundary line's vector and magnitude 
    let v2 = {}
    v2.x = boundary.bx - boundary.ax;
    v2.y = boundary.by - boundary.ay;
    v2.m = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    //3. Figure out the line vector's left normal
    v2.ln = {};
    v2.ln.x = v2.y;
    v2.ln.y = -v2.x;

    //4. Get the left normal's unit vector (dx and dy)
    v2.ln.dx = v2.ln.x / v2.m;
    v2.ln.dy = v2.ln.y / v2.m;

    //5. Get the dot product between v1 and v2's left normal unit vector
    //The dot product also tells you exactly how many pixels the center 
    //of the ship is away from the line
    let dotProduct = v1.x * v2.ln.dx + v1.y * v2.ln.dy

    //If you need to do a projection, here's how:
    // let projectedVx = dotProduct * v2.ln.dx,
    // projectedVy = dotProduct * v2.ln.dy;

    if(dotProduct > 0) {
        boundary.strokeStyle = 'yellow';
    }
    else {
        boundary.strokeStyle = 'red';
    }

    message.text = `Dot product: ${dotProduct}`;
}

// called before setup
function load(dt) {
    console.log('loading...');
}

game = new Alif.Game(640, 480, setup,
    [
        'spaceship.png'
    ],
    load
);
