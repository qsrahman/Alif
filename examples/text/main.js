'use strict';

let game, textSample, spinningText, countingText, count, score, remaining;

function setup() {
    game.renderer.backgroundColor = '#66FF99';

    // create some white text using the Snippet webfont
    textSample = game.add.text("Game.js can has\nmultiline text!", {font: "35px Snippet", fill: "white", align: "left"}, 20, 20);

    // create a text object with a nice stroke
    spinningText = game.add.text("I'm fun!", {font: "bold 60px Podkova", fill: "#cc00ff", align: "center", stroke: "#FFFFFF", strokeThickness: 6});

    // setting the anchor point to 0.5 will center align the text... great for spinning!
    spinningText.anchor.x = spinningText.anchor.y = 0.5;
    spinningText.position.x = 620 / 2;
    spinningText.position.y = 400 / 2;

    // create a text object that will be updated..
    countingText = game.add.text("COUNT 4EVAR: 0", {font: "bold italic 60px Arvo", fill: "#3e1707", align: "center", stroke: "#a4410e", strokeThickness: 7});
    countingText.position.x = 620 / 2;
    countingText.position.y = 320;
    countingText.anchor.x = 0.5;

    count = 0;
    score = 0;
    remaining = 10;

    game.state = play;
}

function play(dt) {
    count++;

    if(count == 50) {
        count = 0;
        score++;
        // update the text...
        countingText.text = ("COUNT 4EVAR: " + score);
    }

    // just for fun, let's rotate the text
    spinningText.rotation += 0.03;
}

game = new Alif.Game(620, 400, setup);
