'use strict';

let map = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 5, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

        [0, 0, 5, 5, 5, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 3],
        [0, 0, 0, 0, 2, 3, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 2, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0],
        [0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2],

        [0, 0, 5, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 2],
        [0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 2, 2, 2, 0, 0, 5],
        [0, 0, 0, 0, 2, 3, 2, 0, 0, 0, 5, 5, 0, 0, 0, 2, 3, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 5, 0, 0, 0, 0, 2],
        [0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0],

        [0, 0, 0, 0, 4, 0, 0, 0, 0, 5, 0, 0, 0, 3, 3, 0, 0, 0, 0, 5, 0, 0],
        [0, 0, 0, 0, 0, 5, 0, 0, 2, 2, 0, 0, 0, 0, 5, 5, 0, 0, 0, 4, 0, 0],
        [0, 0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 0, 1, 4, 1],
        [0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 2, 0, 0]
    ],

    w, h,
    hitSound, music, jumpSound,
    line, player,
    cubes = [],
    pixels = [],
    spaceKey,
    hit = 0,
    level = 1,
    labelDeath,
    labelLevel,
    labelTuto,
    label1,
    label2,
    playerTween,
    gameScene,
    gameEndScene,
    game;

//Create a new Game instance, and start it.
game = new Alif.Game(600, 200, setup,
    [
        'images/boxjump.json',
        'sounds/hit.wav',
        'sounds/jump.wav',
        'sounds/music.wav'
    ]
);

class Player extends Alif.Sprite {
    constructor(game, source, x, y) {
        super(game, source, x, y);

        this.anchor.set(0.5, 0.5);

        this.gravity = 660;
        this.canJump = undefined;
        this.jumpForce = -250;
    }
    update(dt) {
        if(game.spaceKey.isDown && this.canJump) {
            this.vy = this.jumpForce;
            this.canJump = false;
            jumpSound.play();
            game.add.tween(player).to({rotation: this.rotation + Math.PI}, 600).start();
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if(this.x > w - 60) {
            this.reset();
            level++;
            if(level > 20) {
                game.state = endGame;
                music.pause();
                return;
            }
            else {
                drawLevel(map[level-1]);
                labelLevel.text = level + '/' + map.length;
            }
        }

        if(this.y + this.height/2 > line.y) {
            this.y = line.y - this.height/2;
            this.vy = -this.gravity * dt;
            this.vx = 170;
            this.rotation = 0;
            this.canJump = true;
        }

        this.vy += this.gravity * dt;
    }
    reset() {
        this.x = 60;
        this.y = h*2/3-this.height/2-30;
        this.canJump = undefined;
        this.vx = 0;
        this.rotation = 0;
    }
}

function drawLevel(maap) {
    Alif.remove(cubes);

    let cube, height,
        y = Math.floor(h * 2 / 3);

    for (let i = 0; i < maap.length; i++) {
        cube = new Alif.Sprite(game, 'cube.png');
        let x = 100 + i * cube.width;

        if (maap[i] === 1) {
            cube.position.set(x, y);
            cubes.push(cube);
            height = 0.3;
        }
        else if (maap[i] === 2) {
            cube.position.set(x, y);
            cubes.push(cube);
            height = 1;
        }
        else if (maap[i] === 3) {
            cube.position.set(x, y);
            cubes.push(cube);
            height = 1.5;
        }
        else if (maap[i] === 4) {
            cube.position.set(x, y);
            cubes.push(cube);
            height = 1.8;
        }
        else if (maap[i] === 5) {
            cube.position.set(x, y - 22);
            cubes.push(cube);
            height = 0.5;
        }
        if (maap[i] !== 0) {
            gameScene.addChild(cube);

            cube.scale.y = 0;
            cube.anchor.set(0, 1);
            game.add.tween(cube.scale).to({y: height}, 300*height).start();
        }
    }
}

function setup() {
    w = game.canvas.width;
    h = game.canvas.height;

    music = game.add.sound('sounds/music.wav');
    music.loop = true;
    // music.volume = 0.3;
    // music.play();

    hitSound = game.add.sound('sounds/hit.wav');
    jumpSound = game.add.sound('sounds/jump.wav');

    line = game.add.sprite('line.png', w/2, Math.floor(h*2/3));
    line.anchor.set(0.5, 0.5);

    player = new Player(game, 'player.png', 60, h*2/3-40);

    let textStyle = {font:'18px Arial', fill: 'white', align: 'center'};

    labelDeath = game.add.text('0', textStyle, 100, h-35);
    labelDeath.anchor.set(0.5, 0.5);
    labelLevel = game.add.text('1/', textStyle, w-100+0.5, h-35);
    labelLevel.anchor.set(0.5, 0.5);
    labelTuto = game.add.text('press space to jump.', textStyle, Math.floor(w/2)+0.5, h-35+0.5);
    labelTuto.anchor.set(0.5, 0.5);

    gameScene = game.add.container(line, player, labelDeath, labelLevel, labelTuto);

    label1 = game.add.text('you finished the game! :-D', { font: '30px Arial', fill: '#fff' }, w/2, h/2-20);
    label1.anchor.set(0.5, 0.5);

    label2 = game.add.text('and died '+hit+' times\ncan you do better?', { font: '20px Arial', fill: '#fff' }, w/2, h/2+20);
    label2.anchor.set(0.5, 0.5);

    gameEndScene = game.add.container(label1, label2);
    gameEndScene.visible = false;

    drawLevel(map[level - 1]);
    labelLevel.text = level + '/' + map.length;

    //pause the game for a while...
    game.paused = true;
    let spress = () => {
        music.volume = 0.3;
        music.play();
        game.spaceKey.off('press', spress);
        game.paused = false;
    };
    game.spaceKey.on('press', spress);

    //Change the state to `play`
    game.state = play;
}

//The `play` function will run in a loop
function play(dt) {
    player.update(dt);

    for(let i = 0; i < cubes.length; i++) {
       if(Alif.hitTestRectangle(player, cubes[i])) {
            game.add.particleEffect(
                player.x, player.y,
                () => game.add.sprite('pixel.png'),
                8
            );
            labelDeath.text = (++hit);
            hitSound.play();
            player.reset();
            break;
        }
    }
}

function endGame() {
    gameScene.visible = false;
    label2.text = 'and died '+hit+' times\ncan you do better?';
    gameEndScene.visible = true;
}
