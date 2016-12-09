'use strict';

let box, ball, line, message, cat, pathA, pathB, rocket, star, pointerDisplay;

function setup() {
    Game.scaleToWindow();

    Game.renderer.backgroundColor = 'black';
    
    //Game.pointer.visible = false;

    box = Game.rectangle(32, 32, 0x00FFFF, 0xFFFFFF, 4, 52, 42);
    box.anchor.set(0.5, 0.5);
    box.rotation = 0.5;

    ball = Game.circle(42, 0xDDA0DD, 0xB0E0E6, 8, 20, 110);

    message = Game.text("Tap the circle!", {font:"14px puzzler", fill:"white"});
    message.x = 30;
    message.y = 0;

    rocket = Game.sprite("assets/rocket.png");
    //rocket.width = 50;
    //rocket.height = 50;
    rocket.anchor.set(0.5, 0.5);
    console.log(rocket.x);
    rocket.x = Game.canvas.width/2
    rocket.y = Game.canvas.height/2;

    cat = Game.sprite("cat.png");
    cat.position.set(10, 190);
    cat.width = 42;
    cat.height = 42;
    new Game.TWEEN.Tween(cat)
            .to({x: Game.canvas.width - 60}, 1000)
            .easing(Game.TWEEN.Easing.SmoothStep.Simple)
            .repeat()
            .yoyo(true)
            .start();

    star = Game.sprite("assets/star.png");
    star.circular = true;

    console.log("star.radius: " + star.radius);
    console.log("star.diameter: " + star.diameter);

    pointerDisplay = Game.text("", {font:"8px PetMe64", fill:"white"});
    pointerDisplay.x = 10;
    pointerDisplay.y = 235;

    console.log("stage.children: " + Game.stage.children);

    ball.interactive = true;
    ball.press = () => {
        let colors = ['0xFFD700', '0xE6E6FA', '0xDC143C', '0x8FBC8F'];
        ball.texture.fillStyle = colors[Game.utils.randomInt(0, 3)];
        ball.strokeStyle = colors[Game.utils.randomInt(0, 3)];

        Game.sound("assets/bounce.wav").play();
    };

    line = Game.line(0xFFFF00, 4, 162, 52, 220, 94);
    line.angleA = 0;
    line.angleB = 0;

    star.layer = 1;

    Game.state = play;
}

function play(dt) {
    box.rotation += 0.01;
    Game.followEase(star, Game.pointer, 0.1);
    rocket.rotation = Game.angle(rocket, star);

    if (ball.state === "over" || ball.state === "down") {
        star.visible = false;
    } 
    else {
        star.visible = true;
    }

    pointerDisplay.text = "pointer.x: " + Math.round(Game.pointer.x) + " pointer.y: " + Math.round(Game.pointer.y);

    line.angleA += 0.02;
    let rotatingA = Game.rotateAroundPoint(162, 52, 10, 10, line.angleA);
    line.ax = rotatingA.x;
    line.ay = rotatingA.y;

    line.angleB -= 0.03;
    let rotatingB = Game.rotateAroundPoint(220, 94, 10, 10, line.angleB);
    line.bx = rotatingB.x;
    line.by = rotatingB.y;
}

window.onload = function() {
    Game.create(256, 256, setup,
        [
            'assets/rocket.png',
            'assets/star.png',
            'assets/puzzler.otf',
            'assets/PetMe64.ttf',
            'assets/animals.json',
            'assets/bounce.wav'
        ]
    );
    Game.start();
 };
