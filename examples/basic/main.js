"use strict";

var bunny;

function setup() {
    // create a texture from an image path
    // var texture = Game.Texture.fromImage("bunny.png");

    // create a new Sprite using the texture
    // var bunny = new Game.Sprite(texture);
    bunny = Game.Sprite.fromFrame("bunny.png");

    // center the sprites anchor point
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;
    // bunny.pivot.x = 50;
    // bunny.pivot.y = 50;

    // move the sprite to the center of the screen
    bunny.position.x = 320;
    bunny.position.y = 240;

    Game.stage.addChild(bunny);

    Game.state = play;
}

function play(dt) {
    // just for fun, lets rotate mr rabbit a little
    bunny.rotation += 0.1;
}

window.onload = function() {
    Game.create(640, 480, setup, ['bunny.png']);
    Game.renderer.backgroundColor = '#66FF99';
    Game.start();
};
