'use strict';

let output;

function setup() {
    output = document.querySelector('p');
    Game.pointer.press = () => console.log('The pointer was pressed.');
    Game.pointer.release = () => console.log('The pointer was released.');
    Game.pointer.tap = () => console.log('The pointer was tapped.');

    Game.state = play;
}

function play(dt) {
    output.innerHTML
        = "Pointer properties: " + "<br>"
        + "pointer.x: " + Game.pointer.x + "<br>"
        + "pointer.y: " + Game.pointer.y + "<br>"
        + "pointer.isDown: " + Game.pointer.isDown + "<br>"
        + "pointer.isUp: " + Game.pointer.isUp + "<br>"
        + "pointer.tapped: " + Game.pointer.tapped
        + "<br><br>"
        + "Open the console window to see the result of the `press`, " 
        + "`release` and `tap` methods.";
}

window.onload = function() {
    Game.create(640, 480, setup);
    Game.start();
 };
