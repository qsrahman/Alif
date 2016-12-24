'use strict';

    //The game map
let map = [
        [5,5,5,5,5,5,5,5,5,5,5],
        [5,1,1,1,1,1,1,1,1,1,5],
        [5,1,2,2,2,1,2,1,2,1,5],
        [5,1,1,2,1,1,1,1,1,1,5],
        [5,1,1,1,1,2,1,1,2,1,5],
        [5,1,2,1,2,2,1,2,2,1,5],
        [5,1,1,1,1,1,2,1,1,1,5],
        [5,5,5,5,5,5,5,5,5,5,5]
    ],

    //The game objects map
    gameObjects = [
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,3,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,4,0,0,0,0,0],
        [0,0,3,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,3,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0]
    ],
    ROWS = map.length,
    COLUMNS = map[0].length,
    EMPTY = 0,
    FLOOR = 1,
    BOX = 2,
    MONSTER = 3,
    ALIEN = 4,
    WALL = 5,
    SIZE = 64,
    alien = null,
    boxes = [],
    monsters = [],
    boundry,
    game;

function setup() {
    buildMap(map);
    buildMap(gameObjects);

    game.leftKey.press = () => {
        alien.vx = -4;
        alien.vy = 0;
    };
    game.leftKey.release = () => {
        if (!game.rightKey.isDown && alien.vy === 0) {
            alien.vx = 0;
        }
    };
    game.rightKey.press = () => {
        alien.vx = 4;
        alien.vy = 0;
    };
    game.rightKey.release = () => {
        if (!game.leftKey.isDown && alien.vy === 0) {
            alien.vx = 0;
        }
    };
    game.upKey.press = () => {
        alien.vx = 0;
        alien.vy = -4;
    };
    game.upKey.release = () => {
        if (!game.downKey.isDown && alien.vx === 0) {
            alien.vy = 0;
        }
    };
    game.downKey.press = () => {
        alien.vx = 0;
        alien.vy = 4;
    };
    game.downKey.release = () => {
        if (!game.upKey.isDown && alien.vx === 0) {
            alien.vy = 0;
        }
    };

    boundry = {
        x: 64, 
        y: 64, 
        width: game.canvas.width - 64, 
        height: game.canvas.height - 64
    };

    game.state = play;
}

function play(dt) {
    Alif.move(alien);
    Alif.contain(alien, boundry);

    boxes.forEach(box => {
        Alif.rectangleCollision(alien, box);
    });

    monsters.forEach(monster => {
        Alif.move(monster);

        //Check whether the monster is at a tile corner
        if (Math.floor(monster.x) % SIZE === 0 && 
            Math.floor(monster.y) % SIZE === 0) {

            //Change the monster's direction
            changeDirection(monster);  
        }

        //Change the monster's state to SCARED if it's 128 pixels from the alien
        let dx = alien.centerX - monster.centerX,
            dy = alien.centerY - monster.centerY,

            //Find the distance between the circles by calculating
            //the vector's magnitude (how long the vector is)  
            magnitude = Math.sqrt(dx * dx + dy * dy);

        if(magnitude < 190) {
            monster.show(monster.state.SCARED);
        }
        else {
            monster.show(monster.state.NORMAL);
        }
    });
}

function buildMap(levelMap) {
  for(let row = 0; row < ROWS; row++) { 
    for(let column = 0; column < COLUMNS; column++) { 
      let currentTile = levelMap[row][column];
    
      if(currentTile !== EMPTY) {        
        switch (currentTile) {
          case FLOOR:
            let floor = game.add.sprite('floor.png');
            floor.x = column * SIZE;
            floor.y = row * SIZE;
            break;          
          case BOX:
            let box = game.add.sprite('box.png');
            box.x = column * SIZE;
            box.y = row * SIZE;
            boxes.push(box);
            break;
          case WALL:
            let wall = game.add.sprite('wall.png');
            wall.x = column * SIZE;
            wall.y = row * SIZE;
            break;
          case ALIEN:
            //Note: "alien" has already been defined in the main
            //program so you don't neeed to preceed it with "let"
            alien = game.add.sprite('alien.png');
            alien.x = column * SIZE;
            alien.y = row * SIZE;
            break;
          case MONSTER:
            let frames = ['monsterNormal.png', 'monsterScared.png'];
            let monster = game.add.sprite(frames);
            monster.state = {
                NORMAL: 0,
                SCARED: 1
            };
            monster.speed = 1;
            monster.NONE = 0;
            monster.UP = 1;
            monster.DOWN = 2;
            monster.LEFT = 3;
            monster.RIGHT = 4;
            monster.validDirections = [];
            monster.direction = monster.NONE;
            monster.hunt = true;
            monster.x = column * SIZE;
            monster.y = row * SIZE;

            changeDirection(monster);
            
            monsters.push(monster);
            break;  
        }
      }
    }
  }
}

function changeDirection(monster) {
    monster.validDirections = [];
    monster.direction = monster.NONE;

    //Find the monster's column and row in the array
    let monsterColumn = Math.floor(monster.x / SIZE),
        monsterRow = Math.floor(monster.y / SIZE);

    //Find out what kinds of things are in the map cells 
    //that surround the monster. If the cells contain a FLOOR cell,
    //push the corresponding direction into the validDirections array
    if(monsterRow > 0) {
        let thingAbove = map[monsterRow - 1][monsterColumn];
        if(thingAbove === FLOOR) {
            monster.validDirections.push(monster.UP);
        }
    }
    if(monsterRow < ROWS - 1) {
        let thingBelow = map[monsterRow + 1][monsterColumn];
        if(thingBelow === FLOOR) {
            monster.validDirections.push(monster.DOWN);
        }
    }
    if(monsterColumn > 0) {
        let thingToTheLeft = map[monsterRow][monsterColumn - 1];
        if(thingToTheLeft === FLOOR) {
            monster.validDirections.push(monster.LEFT);
        }
    }
    if(monsterColumn < COLUMNS - 1) {
        let thingToTheRight = map[monsterRow][monsterColumn + 1];
        if(thingToTheRight === FLOOR) {
            monster.validDirections.push(monster.RIGHT);
        }
    }
    //The monster's validDirections array now contains 0 to 4 directions 
    //that the contain FLOOR cells. Which of those directions will the 
    //monster choose to move in?

    //If a valid direction was found, Figure out if the monster is at an 
    //maze passage intersection.
    if(monster.validDirections.length !== 0) {
        //Find out if the monster is at an intersection
        let upOrDownPassage 
            = (monster.validDirections.indexOf(monster.UP) !== -1 
            || monster.validDirections.indexOf(monster.DOWN) !== -1);

        let leftOrRightPassage
            = (monster.validDirections.indexOf(monster.LEFT) !== -1 
            || monster.validDirections.indexOf(monster.RIGHT) !== -1);

        //Change the monster's direction if it's at an intersection or
        //in a cul-de-sac (dead-end)
        if(upOrDownPassage && leftOrRightPassage || monster.validDirections.length === 1) {
            //Optionally find the closest distance to the alien
            if(alien !== null && monster.hunt === true) {
                findClosestDirection(monster);
            }
            //Assign a random validDirection if the alien object doesn't 
            //exist in the game or a validDirection wasn't found that 
            //brings the monster closer to the alien
            if(alien === null || monster.direction === monster.NONE) {
                let randomNumber = Math.floor(Math.random() * monster.validDirections.length);
                
                monster.direction = monster.validDirections[randomNumber];
            }

            //Choose the monster's final direction
            switch(monster.direction) {
                case monster.RIGHT:
                    monster.vx = monster.speed;
                    monster.vy = 0;
                    break;

                case monster.LEFT:
                    monster.vx = -monster.speed;
                    monster.vy = 0;
                    break;

                case monster.UP:
                    monster.vx = 0;
                    monster.vy = -monster.speed;
                    break;

                case monster.DOWN:
                    monster.vx = 0;
                    monster.vy = monster.speed;
            }
        }
    }
}

function findClosestDirection(monster) {
    let closestDirection = undefined;

    //Find the distance between the monster and the alien
    let dx = alien.centerX - monster.centerX; 
    let dy = alien.centerY - monster.centerY;

    //If the distance is greater on the x axis...
    if(Math.abs(dx) >= Math.abs(dy)) {
        //Try left and right
        if(dx <= 0) {
            closestDirection = monster.LEFT;        
        }
        else {
            closestDirection = monster.RIGHT;       
        }
    }
    //If the distance is greater on the y axis...
    else {
        //Try up and down
        if(dy <= 0) {
            closestDirection = monster.UP;
        }
        else {
            closestDirection = monster.DOWN;
        }
    }

    //Find out if the closestDirection is one of the validDirections
    for(let i = 0; i < monster.validDirections.length; i++) {
        if(closestDirection === monster.validDirections[i]) {
            //If it, assign the closestDirection to the monster's direction
            monster.direction = closestDirection;
        }
    }
}

function endGame() {
}

game = new Alif.Game(704, 512, setup,
    [
        'monsterMaze.json'
    ]
);
