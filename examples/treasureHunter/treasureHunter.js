let game, dungeon, player, treasure, enemies, chimes, exit,
    healthBar, message, gameScene, gameOverScene, bounds;

game = new Alif.Game(
    512, 512, setup, 
    [
        'assets/chimes.wav', 
        'assets/treasureHunter.json'
    ]
);

function setup() {
    chimes = game.add.sound('assets/chimes.wav');

    dungeon = game.add.sprite('dungeon.png');
    exit = game.add.sprite('door.png', 32);
    
    player = game.add.sprite('explorer.png');
    player.x = 68;
    player.y = game.canvas.height / 2 - player.halfHeight;

    treasure = game.add.sprite('treasure.png');
    treasure.x = game.canvas.width - treasure.width - 32;
    treasure.y = game.canvas.height / 2 - treasure.halfHeight;
    treasure.pickedUp = false;

    gameScene = game.add.container(dungeon, exit, player, treasure);

    let numberOfEnemies = 6,
        spacing = 48,
        xOffset = 150,
        speed = 2,
        direction = 1;

    enemies = [];

    for(let i = 0; i < numberOfEnemies; i++) {
        let enemy = game.add.sprite('blob.png');
        enemy.x = spacing * i + xOffset;
        enemy.y = Alif.utils.randomInt(0, game.canvas.height - enemy.height);
        enemy.vy = speed * direction;
        direction *= -1;
        enemies.push(enemy);

        gameScene.addChild(enemy);
    }

    //Create the black background rectangle
    let outerBar = new Alif.Graphics(game);
    outerBar.beginFill(0x000000);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();

    //Create the front red rectangle
    let innerBar = new Alif.Graphics(game);
    innerBar.beginFill(0xFF3300);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();

    healthBar = game.add.container(outerBar, innerBar);
    healthBar.x = game.canvas.width - 148;
    healthBar.y = 16;

    healthBar.inner = innerBar;

    gameScene.addChild(healthBar);

    message = new Alif.Text(
        game,
        "The End!",
        {font: "64px Futura", fill: "black"}
    );
    message.x = 100;
    message.y = game.canvas.height / 2 - 64;

    gameOverScene = game.add.container(message);
    gameOverScene.visible = false;

    Alif.fourKeyController(player, 5, 38, 39, 40, 37);

    bounds = {
        x: 32, y: 16,
        width: game.canvas.width - 32,
        height: game.canvas.height - 32
    }
    game.state = play;
}

function play() {
    Alif.move(player);
    Alif.contain(player, bounds);

    let playerHit = false;

    enemies.forEach(enemy => {
        Alif.move(enemy);
        let enemyHitsEdges = Alif.contain(enemy, bounds);
        if(enemyHitsEdges === 'top' || enemyHitsEdges === 'bottom') {
            enemy.vy *= -1;
        }
        if(Alif.hitTestRectangle(player, enemy)) {
            playerHit = true;
        }
    });

    if(playerHit) {
        player.alpha = 0.5;
        healthBar.inner.width -= 1;
    }
    else {
        player.alpha = 1;
    }

    if(Alif.hitTestRectangle(player, treasure)) {
        if(!treasure.pickedUp) {
            chimes.play();
            treasure.pickedUp = true;
        }
    }
    if(treasure.pickedUp) {
        treasure.x = player.x + 8;
        treasure.y = player.y + 8;
    }

    if(healthBar.inner.width < 0) {
        game.state = end;
        message.text = "You lost!";
    } 
    
    if (Alif.hitTestRectangle(treasure, exit)) {
        game.state = end;
        message.text = "You won!";
    }
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
}

