'use strict';

let sling, marbles, capturedMarble, hitSound;

function setup() {
    let frames = Game.filmstrip('marbles.png', 32, 32);

    marbles = Game.grid(
        //Set the grid's properties
        5, 5, 128, 128, 
        true, 0, 0,

        //A function that describes how to make each peg in the grid
        () => {
            let marble = new Game.Sprite(frames);
            marble.show(Game.utils.randomInt(0, 5));
            marble.circular = true;
            let sizes = [8, 12, 16, 20, 24, 28, 32];
            marble.diameter = sizes[Game.utils.randomInt(0, 6)];
            marble.vx = Game.utils.randomInt(-10, 10);
            marble.vy = Game.utils.randomInt(-10, 10);
            marble.frictionX = 0.99;
            marble.frictionY = 0.99;
            marble.mass = 0.75 + (marble.diameter / 32);

            return marble;
        },
        //Run any extra code after each peg is made, if you want to
        () => console.log("extra!")
    );

    //Create the "sling" which is a line that will connect
    //the pointer to the marbles
    sling = Game.line("Yellow", 4);
    sling.visible = false;

    //A variable to store the captured marble
    capturedMarble = null;

    hitSound = Game.sound('ballhit.mp3');

    //Change the state to `play`
    Game.state = play;
}

function play(dt) {
    //If a marble has been captured, draw the 
    //sling (the yellow line) between the pointer and
    //the center of the captured marble
    if (capturedMarble !== null) {
        sling.visible = true;
        sling.ax = capturedMarble.centerX;
        sling.ay = capturedMarble.centerY;
        sling.bx = Game.pointer.x; 
        sling.by = Game.pointer.y;
    }

    //Shoot the marble if the pointer has been released 
    if (Game.pointer.isUp) { 
        sling.visible = false;

        if (capturedMarble !== null) {
            //Find out how long the sling is
            sling.length = Game.distance(capturedMarble, Game.pointer);

            //Get the angle between the center of the marble and the pointer
            sling.angle = Game.angle(Game.pointer, capturedMarble);

            //Shoot the marble away from the pointer with a velocity
            //proportional to the sling's length
            capturedMarble.vx = Math.cos(sling.angle) * sling.length / 5;
            capturedMarble.vy = Math.sin(sling.angle) * sling.length / 5;

            //Release the captured marble
            capturedMarble = null;
        }
    }


    marbles.children.forEach(marble => {
        //Check for a collision with the pointer and marble
        if (Game.pointer.isDown && capturedMarble === null) {
            if (Game.hit(Game.pointer, marble)) {
                //If there's a collision, capture the marble
                capturedMarble = marble;
                capturedMarble.vx = 0;
                capturedMarble.vy = 0;
            }
        }

        //Apply friction
        marble.vx *= marble.frictionX;
        marble.vy *= marble.frictionY;

        //Move the marble by applying the new calculated velocity
        //to the marble's x and y position
        Game.move(marble);

        //Contain the marble inside the stage and make it bounce
        //off the edges
        Game.contain(marble, {x:0, y:0, width:Game.canvas.width, height:Game.canvas.height}, true);
    });

    //Make each circle in the `marbles.children` array
    //bounce off another circle in the same array
    // Game.multipleCircleCollision(marbles.children);

    //You can alternatively check for for multiple circle collisions
    //the good old fashioned way, like this:

    for (let i = 0; i < marbles.children.length; i++) {
        //The first marble to use in the collision check 
        let c1 = marbles.children[i];
        for (let j = i + 1; j < marbles.children.length; j++) {
            //The second marble to use in the collision check 
            let c2 = marbles.children[j];
            //Check for a collision and bounce the marbles apart if
            //they collide. Use an optional mass property on the sprite
            //to affect the bounciness of each marble
            if(Game.movingCircleCollision(c1, c2)) {
                hitSound.play();
            }
        }
    }
}

// called before setup
function load(dt) {
    console.log('loading...');
}

window.onload = function() {
    Game.create(512, 512, setup,
        [
            'marbles.png',
            'ballhit.mp3'
        ],
        load
    );
    Game.renderer.backgroundColor = 'black';
    Game.start();
 };
