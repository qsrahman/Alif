"use strict";
let game;
let aliens = [];
let alienContainer;
let alienFrames = 
    [
        "eggHead.png", 
        "flowerTop.png", 
        "helmlok.png", 
        "skully.png"
    ];
let count = 0;

function setup() {
    alienContainer = game.add.container();
    alienContainer.position.set(400, 300);

    for(let i = 0; i < 100; i++) {
        let frameName = alienFrames[i % 4];

        let alien = new Alif.Sprite(game, frameName);
        alien.tint = Math.random() * 0xFFFFFF;

        /*
         * fun fact for the day :)
         * another way of doing the above would be
         * let texture = game.add.image(frameName);
         * let alien = new Alif.Sprite(game, texture);
         */

         alien.position.set(Math.random() * 800 - 400, Math.random() * 600 - 300);
         alien.anchor.set(0.5, 0.5);
         // alien.pivot.set(0.5, 0.5);
         aliens.push(alien);
         alienContainer.addChild(alien)
    }

    game.state = play;
}

function play(dt) {
    for(let i = 0; i < aliens.length; i++) {
        let alien = aliens[i];
        alien.rotation += 0.1;
    }

    count += 0.01;
    alienContainer.scale.set(Math.sin(count), Math.sin(count));
    alienContainer.rotation += 0.01;
}

game = new Alif.Game(800, 600, setup, ['SpriteSheet.json']);
