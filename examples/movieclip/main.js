'use strict';

let game, explosions = [];

function setup() {
    var explosionTextures = [];

    game.renderer.backgroundColor = 'black';

    for(let i = 0; i < 26; i++) {
        let texture = 'Explosion_Sequence_A ' + (i+1) + '.png';
        explosionTextures.push(texture);
    }

    for(let i = 0; i < 50; i++) {
        let explosion = game.add.movieClip(explosionTextures);
        explosion.position.set(Math.random() * 800, Math.random() * 600);
        explosion.anchor.set(0.5, 0.5);
        // explosion.pivot.set(0.5, 0.5);
        explosion.rotation = Math.random() * Math.PI;
        explosion.scale.x = explosion.scale.y = 0.75 + Math.random() * 0.5;
        explosion.gotoAndPlay(Math.random() * 27);

        explosions.push(explosion);
    }

    game.state = play;
}

function play(dt) {
    explosions.forEach(explosion => {
        explosion.update();
    });
}

game = new Alif.Game(800, 600, setup, ['SpriteSheet.json']);
