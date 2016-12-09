'use strict';

let cat, square, star, message, ball, line, localMessage, globalMessage, collisionMessage;

function setup() {
    square = Game.rectangle(256, 256, 0x87cefa, 0x000000, 1);
    square.anchor.set(0.5, 0.5);
    square.x = Game.canvas.width/2;
    square.y = Game.canvas.height/2;

    cat = Game.sprite("cat.png");
    cat.x = -cat.halfWidth;
    cat.y = cat.height;

    Game.fourKeyController(cat, 5);

    star = Game.sprite("star.png");
    star.anchor.set(0.5, 0.5);
    cat.addChild(star);
    square.addChild(cat);

    localMessage = Game.text("Test", {font:"14px Futura", fill:"black"});
    square.addChild(localMessage);
    localMessage.x = -square.halfWidth + 6;
    localMessage.y = -square.halfHeight + 2;

    star.angle = 0;

    globalMessage = Game.text("This is some text to start", {font:"14px Futura", fill:"black"});
    globalMessage.x = 6;
    globalMessage.y = Game.canvas.height - globalMessage.height - 4;

    collisionMessage = Game.text("Use the arrow keys to move...", {font:"16px Futura", fill:"black"}, 4);

    Game.state = play;
}

function play(dt) {
    Game.move(cat);
    
    square.rotation += 0.005;
    
    localMessage.text = "Local position: cat.x: " + Math.round(cat.x) + ", cat.y: " + Math.round(cat.y);
    globalMessage.text = "Global position: cat.gx: " + Math.round(cat.gx) + ", cat.gy: " + Math.round(cat.gy);

    let catHitsEdges = Game.contain(cat, square);
    if(catHitsEdges) {
        collisionMessage.text = "The cat hit the " + catHitsEdges + " of the square";
    }

    star.rotation += 0.2;
    star.angle += 0.05;
    Game.rotateAroundSprite(star, cat, 64, star.angle);
}

window.onload = function() {
    Game.create(640, 480, setup,
        [
            'cat.png',
            'star.png'
        ]
    );
    Game.start();
 };
