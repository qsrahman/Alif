'use strict';

let w = 1024;
let h = 768;
let starCount = 2500;
let sx = 1.0 + (Math.random() / 20);
let sy = 1.0 + (Math.random() / 20);
let slideX = w / 2;
let slideY = h / 2;
let stars = [];
let game;

game = new Alif.Game(w, h, setup, ['bubble_32x32.png']);

function setup() {
    window.addEventListener('orientationchange', resize, false);
    window.addEventListener('resize', resize, false);

    for (let i = 0; i < starCount; i++) {
        let tempBall = game.add.sprite('bubble_32x32.png');

        tempBall.position.x = (Math.random() * w) - slideX;
        tempBall.position.y = (Math.random() * h) - slideY;
        tempBall.anchor.x = 0.5;
        tempBall.anchor.y = 0.5;

        stars.push({ sprite: tempBall, x: tempBall.position.x, y: tempBall.position.y });
    }

    document.getElementById('rnd').onclick = newWave;
    document.getElementById('sx').innerHTML = 'SX: ' + sx + '<br />SY: ' + sy;

    resize();

    game.state = play;
}

function newWave () {
    sx = 1.0 + (Math.random() / 20);
    sy = 1.0 + (Math.random() / 20);
    document.getElementById('sx').innerHTML = 'SX: ' + sx + '<br />SY: ' + sy;
}

function resize() {
    w = window.innerWidth - 16;
    h = window.innerHeight - 16;

    slideX = w / 2;
    slideY = h / 2;

    game.renderer.resize(w, h);
}

function play(dt) {
    for (let i = 0; i < starCount; i++) {
        stars[i].sprite.position.x = stars[i].x + slideX;
        stars[i].sprite.position.y = stars[i].y + slideY;
        stars[i].x = stars[i].x * sx;
        stars[i].y = stars[i].y * sy;

        if (stars[i].x > w) {
            stars[i].x = stars[i].x - w;
        }
        else if (stars[i].x < -w) {
            stars[i].x = stars[i].x + w;
        }

        if (stars[i].y > h) {
            stars[i].y = stars[i].y - h;
        }
        else if (stars[i].y < -h) {
            stars[i].y = stars[i].y + h;
        }
    }
}
