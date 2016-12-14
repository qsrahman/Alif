window.onload = function() {

let dungeon, player, treasure, enemies, chimes, exit,
    healthBar, message, gameScene, gameOverScene, bounds;

function setup() {
    chimes = Game.add.sound('assets/chimes.wav');

    dungeon = Game.add.sprite('dungeon.png');
    exit = Game.add.sprite('door.png', 32);
    
    player = Game.add.sprite('explorer.png');
    player.x = 68;
    player.y = Game.canvas.height / 2 - player.halfHeight;

    treasure = Game.add.sprite('treasure.png');
    treasure.x = Game.canvas.width - treasure.width - 32;
    treasure.y = Game.canvas.height / 2 - treasure.halfHeight;
    treasure.pickedUp = false;

    gameScene = Game.add.container(dungeon, exit, player, treasure);

    let numberOfEnemies = 6,
        spacing = 48,
        xOffset = 150,
        speed = 2,
        direction = 1;

    enemies = [];

    for(let i = 0; i < numberOfEnemies; i++) {
        let enemy = Game.add.sprite('blob.png');
        enemy.x = spacing * i + xOffset;
        enemy.y = Game.utils.randomInt(0, Game.canvas.height - enemy.height);
        enemy.vy = speed * direction;
        direction *= -1;
        enemies.push(enemy);

        gameScene.addChild(enemy);
    }

    //Create the black background rectangle
    let outerBar = new Game.Graphics();
    outerBar.beginFill(0x000000);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();

    //Create the front red rectangle
    let innerBar = new Game.Graphics();
    innerBar.beginFill(0xFF3300);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();

    healthBar = Game.add.container(outerBar, innerBar);
    healthBar.x = Game.canvas.width - 148;
    healthBar.y = 16;

    healthBar.inner = innerBar;

    gameScene.addChild(healthBar);

    message = new Game.Text(
        "The End!",
        {font: "64px Futura", fill: "black"}
    );
    message.x = 100;
    message.y = Game.canvas.height / 2 - 64;

    gameOverScene = Game.add.container(message);
    gameOverScene.visible = false;

    Game.fourKeyController(player, 5, 38, 39, 40, 37);

    bounds = {
        x: 32, y: 16,
        width: Game.canvas.width - 32,
        height: Game.canvas.height - 32
    }
    Game.state = play;
}

function play() {
    Game.move(player);
    Game.contain(player, bounds);

    let playerHit = false;

    enemies.forEach(enemy => {
        Game.move(enemy);
        let enemyHitsEdges = Game.contain(enemy, bounds);
        if(enemyHitsEdges === 'top' || enemyHitsEdges === 'bottom') {
            enemy.vy *= -1;
        }
        if(Game.hitTestRectangle(player, enemy)) {
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

    if(Game.hitTestRectangle(player, treasure)) {
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
        Game.state = end;
        message.text = "You lost!";
    } 
    
    if (Game.hitTestRectangle(treasure, exit)) {
        Game.state = end;
        message.text = "You won!";
    }
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
}

Game.create(
    512, 512, 
    setup, 
    [
        'assets/chimes.wav', 
        'assets/treasureHunter.json'
    ]
);

Game.start();
};
