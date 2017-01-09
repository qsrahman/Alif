"use strict";

let game, movie, frames = [];

function setup() {
    game.renderer.backgroundColor = 'lightblue';

    for(let i = 0; i < 30; i++) {
        let val = i < 10 ? '0' + i : i;
        frames.push('rollSequence00' + val + '.png');
    }

    movie = game.add.movieClip(frames);
    // movie = game.add.sprite(frames);
    movie.position.set(400, 300);
    movie.anchor.set(0.5, 0.5);
    // movie.pivot.set(50, 50);
    movie.animationSpeed = 0.6;
    // movie.fps = 30;
    movie.play();

    game.state = play;
}

function play(dt) {
    movie.rotation += 0.01;
    movie.update();
}

game = new Alif.Game(800, 600, setup, ['fighter.json']);
