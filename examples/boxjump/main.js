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
    gameEndScene;

class Player extends Game.Sprite {
    constructor(source, x, y) {
        super(source, x, y);

        this.anchor.set(0.5, 0.5);

        this.gravity = 660;
        this.canJump = undefined;
        this.jumpForce = -250;
    }
    update(dt) {
        if(Game.spaceKey.isDown && this.canJump) {
            this.vy = this.jumpForce;
            this.canJump = false;
            jumpSound.play();
            Game.add.tween(player).to({rotation: this.rotation + Math.PI}, 600).start();
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if(this.x > w - 60) {
            this.reset();
            level++;
            if(level > 20) {
                Game.state = endGame;
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
    Game.remove(cubes);

    let cube, height,
        y = Math.floor(h * 2 / 3);

    for (let i = 0; i < maap.length; i++) {
        cube = new Game.Sprite('cube.png');
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
            Game.add.tween(cube.scale).to({y: height}, 300*height).start();
        }
    }
}

function setup() {
    w = Game.canvas.width;
    h = Game.canvas.height;

    music = Game.add.sound('sounds/music.wav');
    music.loop = true;
    // music.volume = 0.3;
    // music.play();

    hitSound = Game.add.sound('sounds/hit.wav');
    jumpSound = Game.add.sound('sounds/jump.wav');

    line = Game.add.sprite('line.png', w/2, Math.floor(h*2/3));
    line.anchor.set(0.5, 0.5);

    player = new Player('player.png', 60, h*2/3-40);

    let textStyle = {font:'18px Arial', fill: 'white', align: 'center'};

    labelDeath = Game.add.text('0', textStyle, 100, h-35);
    labelDeath.anchor.set(0.5, 0.5);
    labelLevel = Game.add.text('1/', textStyle, w-100+0.5, h-35);
    labelLevel.anchor.set(0.5, 0.5);
    labelTuto = Game.add.text('press space to jump.', textStyle, Math.floor(w/2)+0.5, h-35+0.5);
    labelTuto.anchor.set(0.5, 0.5);

    gameScene = Game.add.container(line, player, labelDeath, labelLevel, labelTuto);

    label1 = Game.add.text('you finished the game! :-D', { font: '30px Arial', fill: '#fff' }, w/2, h/2-20);
    label1.anchor.set(0.5, 0.5);

    label2 = Game.add.text('and died '+hit+' times\ncan you do better?', { font: '20px Arial', fill: '#fff' }, w/2, h/2+20);
    label2.anchor.set(0.5, 0.5);

    gameEndScene = Game.add.container(label1, label2);
    gameEndScene.visible = false;

    drawLevel(map[level - 1]);
    labelLevel.text = level + '/' + map.length;

    //pause the game for a while...
    Game.paused = true;
    Game.spaceKey.press = () => {
        music.volume = 0.3;
        music.play();
        Game.spaceKey.press = null;
        Game.paused = false;
    }

    //Change the state to `play`
    Game.state = play;
}

//The `play` function will run in a loop
function play(dt) {
    player.update(dt);

    for(let i = 0; i < cubes.length; i++) {
       if(Game.hitTestRectangle(player, cubes[i])) {
            Game.particleEffect(
                player.x, player.y,
                () => Game.add.sprite('pixel.png'),
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

window.onload = function() {
    //Create a new Game instance, and start it.
    Game.create(600, 200, setup,
        [
            'images/boxjump.json',
            'sounds/hit.wav',
            'sounds/jump.wav',
            'sounds/music.wav'
        ]
    );
    Game.renderer.backgroundColor = 0x9b59b6;
    Game.start();
};
