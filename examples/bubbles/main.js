'use strict';

let game, world;

game = new Alif.Game(600, 460, setup, ['bubble.png']);

class Wall extends Alif.Graphics {
    constructor(x, y, width, height) {
        super(game);

        this.lineStyle (2, 0x7c2f01);
        this.beginFill(0xda633e, 0.5);
        this.drawRect(0, 0, width, height);
        this.endFill();
        this.position.set(x, y);

        this.pivot.set(width/2, height/2);

        //create body
        this.body = new Alif.AABB(this, {
            position: new Alif.Vector(x + width/2, y + height/2),
            // position: new Alif.Vector(x, y),
            //fixed: true,
            collisionGroup: 0,
            collideAgainst: [1]
        });

        world.addBody(this.body);
    }
}

class Bubble extends Alif.Sprite {
    constructor(x, y, speedx, speedy) {
        super(game, 'bubble.png', x, y);

        this.anchor.set(0.5);
        this.body = new Alif.Circle(this, {
            collisionGroup: 1,
            collideAgainst: [0, 1],
            velocity: new Alif.Vector(speedx, speedy),
            mass: 1
        });
    
        world.addBody(this.body);
    }
}

function setup() {
    game.renderer.backgroundColor = '#e1d4a7';

    world = new Alif.World(0, 100);

    //create surrounding walls
    let wallLeft    = new Wall(0, 0, 20, 460);
    let wallRight   = new Wall(580, 0, 20, 460);
    let wallTop     = new Wall(20, 0, 560, 20);
    let wallBottom  = new Wall(20, 440, 560, 20);

    game.stage.add(wallLeft, wallRight, wallTop, wallBottom);
    
    for(let i = 0; i < 16; i++){
        let bubble1 = new Bubble(
            Math.random()*400 + 100, // x
            Math.random()*250 + 100, // y
            Math.random()*100 - 50, // speedx
            Math.random()*100 - 50  // speedy
        );

        bubble1.body.restitution = 0.9;
        game.stage.addChild(bubble1);
    }
    
    game.state = play;
}

function play(dt) {
    world.update(dt);
}
