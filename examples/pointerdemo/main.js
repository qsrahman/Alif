'use strict';

let game, output;

function setup() {
    output = document.querySelector('p');
    game.pointer.on('press', () => console.log('The pointer was pressed.'));
    game.pointer.on('release', () => console.log('The pointer was released.'));
    game.pointer.on('tap', () => console.log('The pointer was tapped.'));

    game.state = play;
}

function play(dt) {
    output.innerHTML
        = "Pointer properties: " + "<br>"
        + "pointer.x: " + game.pointer.x + "<br>"
        + "pointer.y: " + game.pointer.y + "<br>"
        + "pointer.isDown: " + game.pointer.isDown + "<br>"
        + "pointer.isUp: " + game.pointer.isUp + "<br>"
        + "pointer.tapped: " + game.pointer.tapped
        + "<br><br>"
        + "Open the console window to see the result of the `press`, " 
        + "`release` and `tap` methods.";
}

game = new Alif.Game(640, 480, setup);
