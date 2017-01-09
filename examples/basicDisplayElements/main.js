'use strict';

let game, box, ball, line, message, cat, pathA, pathB, rocket, star, pointerDisplay;

function setup() {
    game.renderer.backgroundColor = 'black';

    game.renderer.scaleToWindow();

    //game.pointer.visible = false;

    box = game.add.rectangle(32, 32, "cyan", "white", 4, 52, 42);
    box.anchor.set(0.5, 0.5);
    box.interactive = true;
    box.rotation = 0.5;
    box.vr = 0.01;

    box.over = () => {
        box.vr = -0.01;
    };
    box.out = () => {
        box.vr = 0.01;
    };

    ball = game.add.circle(42, "Plum", "PowderBlue", 8, 20, 110);

    message = game.add.text("Tap the circle!", {font:"14px puzzler", fill:"white"});
    message.x = 30;
    message.y = 0;

    rocket = game.add.sprite("assets/rocket.png");
    //rocket.width = 50;
    //rocket.height = 50;
    rocket.anchor.set(0.5, 0.5);
    console.log(rocket.x);
    rocket.x = game.canvas.width/2
    rocket.y = game.canvas.height/2;

    cat = game.add.sprite("cat.png");
    cat.position.set(10, 190);
    cat.width = 42;
    cat.height = 42;
    game.add.tween(cat)
            .to({x: game.canvas.width - 60}, 1000)
            .easing(Alif.TWEEN.Easing.SmoothStep.Simple)
            .repeat()
            .yoyo(true)
            .start();

    star = game.add.sprite("assets/star.png");
    star.circular = true;

    console.log("star.radius: " + star.radius);
    console.log("star.diameter: " + star.diameter);

    pointerDisplay = game.add.text("", {font:"8px PetMe64", fill:"white"});
    pointerDisplay.x = 10;
    pointerDisplay.y = 235;

    console.log("stage.children: " + game.stage.children);

    ball.interactive = true;
    ball.press = () => {
        let colors = ["Gold", "Lavender", "Crimson", "DarkSeaGreen"];
        ball.fillStyle = colors[Alif.utils.randomInt(0, 3)];
        ball.strokeStyle = colors[Alif.utils.randomInt(0, 3)];

        game.add.sound("assets/bounce.wav").play();
    };

    line = game.add.line("Yellow", 4, 162, 52, 220, 94);
    line.angleA = 0;
    line.angleB = 0;

    star.layer = 1;

    game.state = play;
}

function play(dt) {
    box.rotation += box.vr;

    Alif.followEase(star, game.pointer, 0.1);
    rocket.rotation = Alif.angle(rocket, star);

    if (ball.state === "over" || ball.state === "down") {
        star.visible = false;
    } 
    else {
        star.visible = true;
    }

    pointerDisplay.text = "pointer.x: " + Math.round(game.pointer.x) + " pointer.y: " + Math.round(game.pointer.y);

    line.angleA += 0.02;
    let rotatingA = Alif.rotateAroundPoint(162, 52, 10, 10, line.angleA);
    line.ax = rotatingA.x;
    line.ay = rotatingA.y;

    line.angleB -= 0.03;
    let rotatingB = Alif.rotateAroundPoint(220, 94, 10, 10, line.angleB);
    line.bx = rotatingB.x;
    line.by = rotatingB.y;
}

game = new Alif.Game(256, 256, setup,
        [
            'assets/rocket.png',
            'assets/star.png',
            'assets/puzzler.otf',
            'assets/PetMe64.ttf',
            'assets/animals.json',
            'assets/bounce.wav'
        ]
    );
