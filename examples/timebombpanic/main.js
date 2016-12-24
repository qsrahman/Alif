'use strict';

    //The game map
let map = [
        [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
        [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,3],
        [3,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,3],
        [3,1,1,1,1,2,1,1,1,2,2,2,1,1,1,1,1,2,1,1,1,3],
        [3,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,3],
        [3,1,1,2,2,2,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,3],
        [3,1,1,1,1,1,1,1,2,2,1,1,2,1,1,1,2,2,2,1,1,3],
        [3,1,1,1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,3],
        [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,3],
        [3,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,2,2,1,1,1,3],
        [3,1,1,2,2,2,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1,3],
        [3,1,1,1,1,1,2,1,1,2,1,1,2,2,2,2,2,1,1,1,1,3],
        [3,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,2,2,2,2,1,3],
        [3,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,2,1,1,1,1,3],
        [3,1,1,2,1,1,2,1,1,1,1,1,1,1,2,1,1,1,1,1,1,3],
        [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
    ],

    //The game objects map
    gameObjects = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0],
        [0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,5,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    ROWS = map.length,
    COLUMNS = map[0].length,
    EMPTY = 0,
    FLOOR = 1,
    BOX = 2,
    WALL = 3,
    ALIEN = 4,
    BOMB = 5,
    SIZE = 64,
    alien,
    gameOverDisplay,
    gameOverMessage,
    timerMessage,
    bombsDefused = 0,
    boxes = [],
    bombs = [],
    gameWorld,
    camera,
    timer;

class Timer {
    constructor(ms = 0) {
        this.time = ms;
        this.interval = null;
    }
    start() {
        this.interval = setInterval(() => {
            this.tick();
        }, 1000)
    }
    tick() {
        this.time--;
    }
    stop() {
        clearInterval(this.interval);
    }
    reset() {
        this.time = 0;
    }
}

function setup() {  
    gameWorld = Game.add.container();

    buildMap(map);
    buildMap(gameObjects);

    let timeDisplay = Game.add.sprite('display.png');
    //gameWorld.addChild(timeDisplay);
    timeDisplay.x = Game.canvas.width / 2 - timeDisplay.width / 2;
    timeDisplay.y = 8;

    gameOverDisplay = Game.add.sprite('gameover.png');
    //gameWorld.addChild(gameOverDisplay);
    gameOverDisplay.x = Game.canvas.width / 2 - gameOverDisplay.width / 2;
    gameOverDisplay.y = Game.canvas.height / 2 - gameOverDisplay.height / 2;
    gameOverDisplay.visible = false;

    gameOverMessage = Game.add.text('Game Over!', {font:'bold 30px Helvetica', fill:'black'});
    //gameWorld.addChild(gameOverMessage);
    gameOverMessage.x = 275;
    gameOverMessage.y = 270;
    gameOverMessage.visible = false;

    timerMessage = Game.add.text('00', {font:'bold 40px Helvetica', fill:'white'});
    //gameWorld.addChild(timerMessage);
    timerMessage.x = 330;
    timerMessage.y = 10;

    Game.leftKey.press = () => {
        alien.vx = -4;
        alien.vy = 0;
    };
    Game.leftKey.release = () => {
        if (!Game.rightKey.isDown && alien.vy === 0) {
            alien.vx = 0;
        }
    };
    Game.rightKey.press = () => {
        alien.vx = 4;
        alien.vy = 0;
    };
    Game.rightKey.release = () => {
        if (!Game.leftKey.isDown && alien.vy === 0) {
            alien.vx = 0;
        }
    };
    Game.upKey.press = () => {
        alien.vx = 0;
        alien.vy = -4;
    };
    Game.upKey.release = () => {
        if (!Game.downKey.isDown && alien.vx === 0) {
            alien.vy = 0;
        }
    };
    Game.downKey.press = () => {
        alien.vx = 0;
        alien.vy = 4;
    };
    Game.downKey.release = () => {
        if (!Game.upKey.isDown && alien.vx === 0) {
            alien.vy = 0;
        }
    };

    camera = Game.add.worldCamera(gameWorld, map[0].length * SIZE, map.length * SIZE, Game.canvas);
    camera.centerOver(alien);

    timer = new Timer(30);
    timer.start();

    Game.state = play;
}

function play(dt) {
    //Move the alien and set its screen boundaries
    alien.x = Math.max(64, Math.min(alien.x + alien.vx, gameWorld.width - alien.width - 64)); 
    alien.y = Math.max(64, Math.min(alien.y + alien.vy, gameWorld.height - alien.height - 64));

    camera.follow(alien);

    boxes.forEach(box => {
        Game.rectangleCollision(alien, box);
    });

    bombs.forEach(bomb => {
        if(Game.hitTestRectangle(alien, bomb) && bomb.visible) {
            bomb.visible = false;
            bombsDefused++;
            if(bombsDefused === bombs.length) {
                Game.state = endGame;
            }
        }
    });
    
    timerMessage.text = timer.time < 10 ? '0' + timer.time : timer.time;

    //Check whether the time is over
    if(timer.time === 0) {
        Game.state = endGame;
    }
}

function buildMap(levelMap) {
  for(let row = 0; row < ROWS; row++) { 
    for(let column = 0; column < COLUMNS; column++) { 
      let currentTile = levelMap[row][column];
    
      if(currentTile !== EMPTY) {        
        switch (currentTile) {
          case FLOOR:
            let floor = Game.add.sprite('floor.png');
            gameWorld.addChild(floor);
            floor.x = column * SIZE;
            floor.y = row * SIZE;
            break;          
          case BOX:
            let box = Game.add.sprite('box.png');
            gameWorld.addChild(box);
            box.x = column * SIZE;
            box.y = row * SIZE;
            boxes.push(box);
            break;
          case WALL:
            let wall = Game.add.sprite('wall.png');
            gameWorld.addChild(wall);
            wall.x = column * SIZE;
            wall.y = row * SIZE;
            break;
          case BOMB:
            let bomb = Game.add.sprite('bomb.png');
            gameWorld.addChild(bomb);
            bomb.x = column * SIZE + 10;
            bomb.y = row * SIZE + 18;
            bombs.push(bomb);
            break;  
          case ALIEN:
            //Note: "alien" has already been defined in the main
            //program so you don't neeed to preceed it with "let"
            alien = Game.add.sprite('alien.png');
            gameWorld.addChild(alien);
            alien.x = column * SIZE;
            alien.y = row * SIZE;
            break;
        }
      }
    }
  }
}

function endGame() {
    timer.stop();

    gameOverDisplay.visible = true;
    gameOverMessage.visible = true;
    
    if(bombsDefused === bombs.length) {
        gameOverMessage.text = "You Won!";
    }
    else {
        gameOverMessage.text = "You Lost!";
    }
}

window.onload = function() {
    Game.create(704, 512, setup,
        [
            'timeBombPanic.json'
        ]
    );
    Game.start();
 };
