"use strict";

var aliens = [];
var alienContainer;
var alienFrames = 
    [
        "eggHead.png", 
        "flowerTop.png", 
        "helmlok.png", 
        "skully.png"
    ];
var count = 0;

function setup() {
    alienContainer = Game.add.container();
    alienContainer.position.set(400, 300);

    for(var i = 0; i < 100; i++) {
        var frameName = alienFrames[i % 4];

        var alien = new Game.Sprite(frameName);
        alien.tint = Math.random() * 0xFFFFFF;

        /*
         * fun fact for the day :)
         * another way of doing the above would be
         * var texture = Game.image(frameName);
         * var alien = new Game.Sprite(texture);
         */

         alien.position.set(Math.random() * 800 - 400, Math.random() * 600 - 300);
         alien.anchor.set(0.5, 0.5);
         // alien.pivot.set(0.5, 0.5);
         aliens.push(alien);
         alienContainer.addChild(alien)
    }

    Game.state = play;
}

function play(dt) {
    for(var i = 0; i < aliens.length; i++) {
        var alien = aliens[i];
        alien.rotation += 0.1;
    }

    count += 0.01;
    alienContainer.scale.set(Math.sin(count), Math.sin(count));
    alienContainer.rotation += 0.01;
}

window.onload = function() {
    Game.create(800, 600, setup, ['SpriteSheet.json']);
    Game.start();
 };
