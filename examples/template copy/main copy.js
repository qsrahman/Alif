'use strict';

let blueBox, pinkBox, goldBox, grayBox, message;

function setup() {
    blueBox = Game.rectangle(96, 96, "0x0000FF", "none", 0, 54, 64);
    blueBox.anchor.set(0.25, 0.25);

    goldBox = Game.rectangle(64, 64, "0xffd700");
    blueBox.addChild(goldBox);
    goldBox.x = 24;
    goldBox.y = 24;
 
    grayBox = Game.rectangle(48, 48, "0x808080");
    goldBox.addChild(grayBox);
    grayBox.position.set(8, 8);

    pinkBox = Game.rectangle(24, 24, "0xffc0cb");
    grayBox.addChild(pinkBox);
    pinkBox.x = 8;
    pinkBox.y = 8;
    pinkBox.anchor.x = 0.75;
    pinkBox.anchor.y = 0.75;

    console.log(pinkBox.gx);
    //Displays: 104
    console.log(pinkBox.gy);
    //Displays: 96

    blueBox.rotation = 0.8;
    blueBox.scale.x = 1.5;
    blueBox.alpha = 0.5;

    grayBox.rotation = 0.3;
    grayBox.alpha = 0.5;

    message = Game.text("Hello World!", {font:"24px Futura", fill:"black"}, 330, 230);
    message.anchor.set(0.5, 0.5);

    let cat = Game.sprite("assets/cat.png", 64, 410);
    cat.width = 64;
    cat.height = 64;

    let tiger = Game.sprite("tiger.png", 192, 410);
    tiger.width = 64;
    tiger.height = 64;
    tiger.tiling = true;
    tiger.tileX = 20;
    tiger.tileY = 20;

    let fairyFrame = Game.frame(
        "assets/fairy.png",
        0, 0, 48, 32
    );

    let fairy = Game.sprite(fairyFrame, 164, 326);

    let fairyFrames = Game.frames(
        "assets/fairy.png",
        [[0,0],[48,0],[96,0]],
        48, 32
    );

    let fairy2 = Game.sprite(fairyFrames, 224, 326);

    let animalImages = [
        "assets/hedgehog.png",
        "assets/tiger.png",
        "assets/cat.png"
    ];

    let hedgehog = Game.sprite(animalImages, 320, 410);
    hedgehog.width = 64;
    hedgehog.height = 64;

    let buttonFrames = [
        "up.png",
        "over.png",
        "down.png"
    ];

    let button = Game.sprite(buttonFrames, 300, 280);

    fairy2.show(2);
    button.show(1);


    Game.state = play;
}

function play(dt) {
    blueBox.rotation += 0.01;
    goldBox.rotation -= 0.02;
    pinkBox.rotation += 0.03;
    message.rotation += 0.01;
}

window.onload = function() {
    Game.create(512, 512, setup,
        [
            "assets/puzzler.otf",
            "assets/cat.png",
            "assets/fairy.png",
            "assets/tiger.png",
            "assets/hedgehog.png",
            "assets/animals.json",
            "assets/button.json"
        ]
    );
    Game.start();
 };
