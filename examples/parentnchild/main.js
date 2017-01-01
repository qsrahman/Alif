'use strict';

let game, cat, square, star, message, ball, line, localMessage, globalMessage, collisionMessage;

function setup() {
    square = game.add.rectangle(256, 256, 0x87cefa, 0x000000, 1);
    square.anchor.set(0.5, 0.5);
    square.x = game.canvas.width/2;
    square.y = game.canvas.height/2;

    cat = game.add.sprite("cat.png");
    square.addChild(cat);
    cat.x = -cat.halfWidth;
    cat.y = cat.height;

    Alif.fourKeyController(cat, 5);

    star = game.add.sprite("star.png");
    star.anchor.set(0.5, 0.5);
    cat.addChild(star);

    localMessage = game.add.text("Test", {font:"14px Futura", fill:"black"});
    square.addChild(localMessage);
    localMessage.x = -square.halfWidth + 6;
    localMessage.y = -square.halfHeight + 2;

    star.angle = 0;

    globalMessage = game.add.text("This is some text to start", {font:"14px Futura", fill:"black"});
    globalMessage.x = 6;
    globalMessage.y = game.canvas.height - globalMessage.height - 4;

    collisionMessage = game.add.text("Use the arrow keys to move...", {font:"16px Futura", fill:"black"}, 4);

    game.state = play;
}

function play(dt) {
    Alif.move(cat);
    
    square.rotation += 0.005;
    
    localMessage.text = "Local position: cat.x: " + Math.round(cat.x) + ", cat.y: " + Math.round(cat.y);
    globalMessage.text = "Global position: cat.gx: " + Math.round(cat.gx) + ", cat.gy: " + Math.round(cat.gy);

    let catHitsEdges = Alif.contain(cat, square);
    if(catHitsEdges) {
        collisionMessage.text = "The cat hit the " + catHitsEdges + " of the square";
    }

    star.rotation += 0.2;
    star.angle += 0.05;
    Alif.rotateAroundSprite(star, cat, 64, star.angle);
}

game = new Alif.Game(640, 480, setup,
    [
        'cat.png',
        'star.png'
    ]
);
