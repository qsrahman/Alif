'use strict';

let box, tween, tweenBack;

function setup() {
    box = Game.add.rectangle(100, 100, 'lightblue', 'red', 2, 100, 100);
    box.anchor.set(0.5, 0.5);
    
    let msg = Game.add.text('Hello, World!', {font: '14px Arial'});
    box.addChild(msg);
    msg.x = -40;
    msg.y = -40;

    tween = Game.add.tween(box)
        .to({x: 540, y: 200, rotation: 6.3}, 2000)
        .delay(1000)
        .easing(Game.TWEEN.Easing.Elastic.InOut);
        // .repeat()
        // .yoyo(true);

    tweenBack = Game.add.tween(box)
        .to({x: 100, y: 100, rotation: 0}, 3000)
        .easing(Game.TWEEN.Easing.Elastic.InOut);

    tween.chain(tweenBack);
    tweenBack.chain(tween);

    tween.start();

    Game.state = play;
}

function play(dt) {
}

// called before setup
function load(dt) {
    console.log('loading...');
}

window.onload = function() {
    Game.create(640, 480, setup);
    Game.start();
 };
