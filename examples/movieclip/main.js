'use strict';

let explosions = [];

function setup() {
    var explosionTextures = [];

    for(var i = 0; i < 26; i++) {
        var texture = 'Explosion_Sequence_A ' + (i+1) + '.png';
        explosionTextures.push(texture);
    }

    for(var i = 0; i < 50; i++) {
        var explosion = new Game.MovieClip(explosionTextures);
        explosion.position.set(Math.random() * 800, Math.random() * 600);
        explosion.anchor.set(0.5, 0.5);
        // explosion.pivot.set(0.5, 0.5);
        explosion.rotation = Math.random() * Math.PI;
        explosion.scale.x = explosion.scale.y = 0.75 + Math.random() * 0.5;
        explosion.gotoAndPlay(Math.random() * 27);
        Game.stage.addChild(explosion);
        explosions.push(explosion);
    }

    Game.state = play;
}

function play(dt) {
    explosions.forEach(ex => {
        ex.update();
    });
}

window.onload = function() {
    Game.create(800, 600, setup, ['SpriteSheet.json']);
    Game.renderer.backgroundColor = 0xffffff;
    Game.start();
};