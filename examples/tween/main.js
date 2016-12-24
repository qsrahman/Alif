'use strict';

let game, box, tween, tweenBack;

function setup() {
    box = game.add.rectangle(100, 100, 'lightblue', 'red', 2, 100, 100);
    box.anchor.set(0.5, 0.5);
    
    let msg = game.add.text('Hello, World!', {font: '14px Arial'});
    box.addChild(msg);
    msg.x = -40;
    msg.y = -40;

    tween = game.add.tween(box)
        .to({x: 540, y: 200, rotation: 6.3}, 2000)
        .delay(1000)
        .easing(Alif.TWEEN.Easing.Elastic.InOut);
        // .repeat()
        // .yoyo(true);

    tweenBack = game.add.tween(box)
        .to({x: 100, y: 100, rotation: 0}, 3000)
        .easing(Alif.TWEEN.Easing.Elastic.InOut);

    tween.chain(tweenBack);
    tweenBack.chain(tween);

    tween.start();

    game.state = play;
}

function play(dt) {
}

// called before setup
function load(dt) {
    console.log('loading...');
}

game = new Alif.Game(640, 480, setup);
