'use strict';

let game, world, bubbles = [];

game = new Alif.Game(600, 460, setup, ['bubble.png']);

class Wall extends Alif.Graphics {
    constructor(x, y, width, height) {
        super(game);

        this.lineStyle (2, 0x7c2f01);
        this.beginFill(0xda633e, 0.5);
        this.drawRect(0, 0, width, height);
        this.endFill();
        this.position.set(x, y);

        //create body
        this.body = new Alif.Body({
            position: new Alif.Vector(x + width/2, y + height/2),
            fixed: true,
            collisionGroup: 0,
            collideAgainst: 0
        });

        this.body.addShape(new Alif.AABB(width, height));
        world.addBody(this.body);
    }
}

class Bubble extends Alif.Sprite {
    constructor(x, y, speedx, speedy) {
        super(game, 'bubble.png', x, y);

        this.anchor.set(0.5);
        this.body = new Alif.Body({
            position: new Alif.Vector(x, y),
            collisionGroup: 0,
            collideAgainst: 0,
            velocity: new Alif.Vector(speedx, speedy),
            mass: 1
        });
    
        this.circular = true;

        this.body.addShape(new Alif.Circle(30));
        world.addBody(this.body);
    }
    update(){
        this.position.x = this.body.position.x;
        this.position.y = this.body.position.y;
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
    
    for(let i=0; i<15; i++){
        let bubble1 = new Bubble(Math.random()*400 + 100, Math.random()*250 + 100, Math.random()*100 - 50, Math.random()*100 - 50);
        bubble1.body.restitution = 0.9;
        game.stage.addChild(bubble1);
        bubbles.push(bubble1);
    }

    game.state = play;
}

function play(dt) {
    world.update(dt);
    bubbles.forEach(bubble => {
        bubble.update();
    });
}
