'use strict';

let game, square, score, scoreText, boundry, click;

function setup() {
    game.renderer.backgroundColor = '#d0d0d0';

    square = game.add.rectangle(100, 100, '0xff8080');
    square.x = (game.canvas.width - square.width) / 2;
    square.y = (game.canvas.height - square.height) / 2;

    scoreText = game.add.text('0', {font: '30px Verdana', fill: 'white'});
    square.addChild(scoreText);
    scoreText.x = (square.width - scoreText.width) / 2;
    scoreText.y = (square.height - scoreText.height) / 2;

    square.interactive = true;

    square.vx = 1;
    square.vy = 1;
    square.speed = 200;
    score = 0;

    click = game.add.sound('bounce.wav');

    boundry = {
        x: 0,
        y: 0,
        width: game.canvas.width,
        height: game.canvas.height
    };

    square.on('press', () => {
        // Make sound
        click.play();

        // Increase the score
        score += 1;

        // Increase the speed of the square by 10 percent
        square.speed *= 1.1;

        // Give the square a random position
        square.x = Math.floor(Math.random()*(game.canvas.width-square.width));
        square.y = Math.floor(Math.random()*(game.canvas.height-square.height));

        // Give the square a random direction
        square.vx = Math.floor(Math.random() * 2) * 2 - 1;
        square.vy = Math.floor(Math.random() * 2) * 2 - 1;
    });

    game.state = play;
}

function play(dt) {
    square.x += square.vx * square.speed * dt;
    square.y += square.vy * square.speed * dt;

    Alif.contain(square, boundry, true);

    scoreText.text = score.toString();
}

game = new Alif.Game(640, 480, setup, ['bounce.wav']);
