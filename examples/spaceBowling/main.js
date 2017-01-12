'use strict';

let game = new Alif.Game(350, 600, setup, null, null, 'game');

let ui;
let uiIntro;
let uiStats;
let uiComplete; 
let uiPlay;
let uiReset;
let uiRemaining; 
let uiScore;
let w, h;
let platform;
let asteroids = [];
let player;
let playerSelected = null;
let sling;

function setup() {
    w = game.canvas.width;
    h = game.canvas.height;

    ui = document.querySelector('#gameUI');
    uiIntro = document.querySelector('#gameIntro');
    uiStats = document.querySelector('#gameStats');
    uiComplete = document.querySelector('#gameComplete'); 
    uiPlay = document.querySelector('#gamePlay');
    uiReset = document.querySelectorAll('.gameReset');
    uiRemaining = document.querySelector('#gameRemaining'); 
    uiScore = document.querySelectorAll('.gameScore');

    uiStats.style.display = 'none';
    uiComplete.style.display = 'none';

    uiPlay.addEventListener('click', e => {
        e.preventDefault();
        uiIntro.style.display = 'none';
        startGame();
    });
    uiReset[0].addEventListener('click', e => {
        e.preventDefault();
        uiComplete.style.display = 'none';
        startGame();
    });

    game.state = play;
}

function startGame() {
    uiScore[0].innerHTML = '0';
    uiStats.style.display = '';

    platform = game.add.circle(200, 'gray', 'gray', 0, w/2, 150);
    platform.anchor.set(0.5);

    // Set up player asteroid
    player = game.add.circle(30, 'white', 'white', 0, w/2, h-150);
    player.anchor.set(0.5);
    player.interactive = true;
    player.mass = 10;
    player.friction = 0.97;
    player.player = true;
    asteroids.push(player);

    player.on('press', () => {
        console.log('player press');
    });

    // Set up other asteroids
    let outerRing = 8; // Asteroids around outer ring
    let ringCount = 3; // Number of rings
    // Distance between each ring
    let ringSpacing = ((platform.radius - 25)/(ringCount-1)); 
    
    for (let r = 0; r < ringCount; r++) {
        let currentRing = 0; // Asteroids around current ring
        let angle = 0; // Angle between each asteroid
        let ringRadius = 0;
        
        // Is this the innermost ring?
        if (r == ringCount-1) {
            currentRing = 1;
        } 
        else {
            currentRing = outerRing-(r*3);
            angle = 360/currentRing;
            ringRadius = (platform.radius - 25)-(ringSpacing*r);
        };
        
        for (let a = 0; a < currentRing; a++) {
            let x = 0;
            let y = 0;
            
            // Is this the innermost ring?
            if (r == ringCount-1) {
                x = 0;
                y = 0;
            } 
            else {
                x = (ringRadius*Math.cos((angle*a)*(Math.PI/180)));
                y = (ringRadius*Math.sin((angle*a)*(Math.PI/180)));
            };
                    
            let asteroid = game.add.circle(20, 'white', 'white', 0)
            asteroid.anchor.set(0.5);
            platform.addChild(asteroid);
            asteroid.x = x;
            asteroid.y = y;
            asteroid.mass = 5;
            asteroid.friction = 0.95;
            asteroid.player = false;

            asteroids.push(asteroid);
        };
    };
    
    uiRemaining.innerHTML = asteroids.length-1;

    sling = game.add.line("Yellow", 4);
    sling.visible = false;
}
function play(dt) {
}
