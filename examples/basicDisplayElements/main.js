'use strict';

let box, ball, line, message, cat, pathA, pathB, rocket, star, pointerDisplay;

function setup() {
    Game.scaleToWindow();

    Game.renderer.backgroundColor = 'black';
    
    //Game.pointer.visible = false;

    box = Game.add.rectangle(32, 32, "cyan", "white", 4, 52, 42);
    box.anchor.set(0.5, 0.5);
    box.rotation = 0.5;

    ball = Game.add.circle(42, "Plum", "PowderBlue", 8, 20, 110);

    message = Game.add.text("Tap the circle!", {font:"14px puzzler", fill:"white"});
    message.x = 30;
    message.y = 0;

    rocket = Game.add.sprite("assets/rocket.png");
    //rocket.width = 50;
    //rocket.height = 50;
    rocket.anchor.set(0.5, 0.5);
    console.log(rocket.x);
    rocket.x = Game.canvas.width/2
    rocket.y = Game.canvas.height/2;

    cat = Game.add.sprite("cat.png");
    cat.position.set(10, 190);
    cat.width = 42;
    cat.height = 42;
    Game.add.tween(cat)
            .to({x: Game.canvas.width - 60}, 1000)
            .easing(Game.TWEEN.Easing.SmoothStep.Simple)
            .repeat()
            .yoyo(true)
            .start();

    star = Game.add.sprite("assets/star.png");
    star.circular = true;

    console.log("star.radius: " + star.radius);
    console.log("star.diameter: " + star.diameter);

    pointerDisplay = Game.add.text("", {font:"8px PetMe64", fill:"white"});
    pointerDisplay.x = 10;
    pointerDisplay.y = 235;

    console.log("stage.children: " + Game.stage.children);

    ball.interactive = true;
    ball.press = () => {
        let colors = ["Gold", "Lavender", "Crimson", "DarkSeaGreen"];
        ball.fillStyle = colors[Game.utils.randomInt(0, 3)];
        ball.strokeStyle = colors[Game.utils.randomInt(0, 3)];

        Game.add.sound("assets/bounce.wav").play();
    };

    line = Game.add.line("Yellow", 4, 162, 52, 220, 94);
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
