'use strict';

var game, level, world, player, output, score;

function setup() {
    game.renderer.backgroundColor = 'white';

    let level = {
        widthInTiles: 20,
        heightInTiles: 15,
        tileWidth: 32,
        tileHeight: 32
    };

    world = makeWorld(level);

    player = world.player;
    
    game.state = play;
}

function play(dt) {
}

function makeWorld(level) {
    let world = {}; //game.add.container();

    world.map = [];
    world.itemLocations = [];
    world.platforms = [];
    world.treasure = [];

    world.player = null;

    makeMap();

    makeSprites();

    function makeMap() {
        let cellIsAlive = () => Alif.utils.randomInt(0, 3) === 0;

        let numberOfCells = level.heightInTiles * level.widthInTiles;

        for(let i = 0; i < numberOfCells; i++) {
            let x = i % level.widthInTiles,
                y = Math.floor(i / level.widthInTiles);

            let cell = {
                x: x,
                y: y,
                item: ''
            };

            cell.terrain = cellIsAlive() ? 'rock' : 'sky';
            world.map.push(cell);
        }
    }

    function makeSprites() {
        world.map.forEach(cell => {
            let sprite = game.add.rectangle();

            sprite.x = cell.x * level.tileWidth;
            sprite.y = cell.y * level.tileHeight;
            sprite.width = level.tilewidth;
            sprite.height = level.tileheight;

            switch (cell.terrain) {
                case 'rock':
                    sprite.fillStyle = 'black';
                    world.platforms.push(sprite);
                    break;
                case 'grass':
                    sprite.fillStyle = 'green';
                    world.platforms.push(sprite);
                    break;
                case 'sky':
                    sprite.fillStyle = 'cyan';
                    break;
                case 'border':
                    sprite.fillStyle = 'blue';
                    world.platforms.push(sprite);
                    break;
            }
        });
    }

    world.map.forEach(cell => {
        if(cell.item !== '') {
            let sprite = game.add.rectangle();

            sprite.x = cell.x * level.tileWidth + level.tileWidth / 4;
            sprite.y = cell.y * level.tileHeight + level.tileWidth / 2;
            sprite.width = level.tileWidth / 2;
            sprite.height = level.tileHeight / 2;

            switch (cell.item) {
                case 'player':
                    sprite.fillStyle = 'red';
                    sprite.accelerationX = 0;
                    sprite.accelerationY = 0;
                    sprite.frictionX = 1;
                    sprite.frictionY = 1;
                    sprite.gravity = 0.3;
                    sprite.jumpForce = -6.8;
                    sprite.vx = 0;
                    sprite.vy = 0;
                    sprite.isOnGround = true;
                    world.player = sprite;
                    break;
                case 'treasure':
                    sprite.fillStyle = 'gold';
                    //Push the treasure into the treasures array
                    world.treasure.push(sprite);
                    break;
            }
        }
    });

    return world;
}

game = new Alif.Game(640, 480, setup);
