'use strict';

let cat, totalFrames, frameCounter, startValue, endValue;

let linear = (x) => x;
let smoothstep = x => x * x * (3 - 2 * x);
let smoothstepSquared = (x) => Math.pow((x * x * (3 - 2 * x)), 2);
let smoothstepCubed = (x) => Math.pow((x * x * (3 - 2 * x)), 3);
let spline = (t, a, b, c, d) => {
  return 0.5 * (
    (2 * b) +
    (-a + c) * t +
    (2 * a - 5 * b + 4 * c - d) * t * t +
    (-a + 3 * b - 3 * c + d) * t * t * t
  );
};

function setup() {
    cat = Game.sprite('cat.png'); 
    cat.position.set(32, 32);

    totalFrames = 120;
    frameCounter = 0;
    startValue = cat.x;
    endValue = 400;

    Game.state = play;
}

function play(dt) {
    if(frameCounter < totalFrames) {
        // let normalizedTime = frameCounter / totalFrames;
        let normalizedTime = Game.utils.norm(frameCounter, 0, totalFrames);
        let curvedTime = spline(normalizedTime, 5, 0, 1, -5);
        // cat.x = (endValue * curvedTime) + (startValue * (1 - curvedTime));
        cat.x = Game.utils.lerp(curvedTime, startValue, endValue);

        frameCounter += 1;
    }
}

// called before setup
function load(dt) {
    console.log('loading...');
}

window.onload = function() {
    Game.create(640, 480, setup,
        [
            'cat.png'
        ],
        load
    );
    Game.start();
 };
