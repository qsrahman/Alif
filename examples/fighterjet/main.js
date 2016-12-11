"use strict";

var movie;
var frames = [];

function setup() {
    for(var i = 0; i < 30; i++) {
        var val = i < 10 ? '0' + i : i;
        frames.push('rollSequence00' + val + '.png');
    }

    movie = new Game.MovieClip(frames);
    movie.position.set(400, 300);
    movie.anchor.set(0.5, 0.5);
    // movie.pivot.set(50, 50);
    movie.animationSpeed = 0.5;
    movie.play();

    Game.stage.addChild(movie);

    Game.state = play;
}

function play(dt) {
    movie.rotation += 0.01;
    movie.update(dt);
}

window.onload = function() {
    Game.create(800, 600, setup, ['fighter.json']);
    Game.renderer.backgroundColor = 'lightblue';
    Game.start();
};
