'use strict';

let game, world, bubbles = [];

game = new Alif.Game(600, 460, setup, ['bubble.png']);

class P2RectWall extends Alif.Graphics {
    constructor(x, y, width, height) {
        super(game);

        this.lineStyle (2, 0x7c2f01);
        this.beginFill(0xda633e, 0.5);
        this.drawRect(0, 0, width, height);
        this.endFill();
        this.position.set(x, y);

        //create body
        this.body = new p2.Body({
            position: [(x + width/2), (y + height/2)],
            mass: 0 //This will make it a static body!
        });
        //and add shape
        let shape = new p2.Rectangle(width, height);
    
        this.body.addShape(shape);
        world.addBody(this.body);
    }
    update(){
        this.position.x = this.body.position[0];
        this.position.y = this.body.position[1];
    }
}

class Bubble extends Alif.Sprite {
    constructor(x, y) {
        super(game, 'bubble.png', x, y);

        this.anchor.set(0.5);
        this.body = new p2.Body({
            position: [x, y],
            mass: 1,
            damping: 0,
            angularDamping: 0
        });
        //and add shape
        let shape = new p2.Circle(30);   //radius=30
    
        this.body.addShape(shape);
        world.addBody(this.body);
    }
    update(){
        this.position.x = this.body.position[0];
        this.position.y = this.body.position[1];
    }
}
function setup() {
    game.renderer.backgroundColor = '#e1d4a7';

    world = new p2.World({gravity: [0, 100]});
    world.ratio = 100;

    //create surrounding walls
    let wallLeft    = new P2RectWall(0, 0, 20, 460);
    let wallRight   = new P2RectWall(580, 0, 20, 460);
    let wallTop     = new P2RectWall(20, 0, 560, 20);
    let wallBottom  = new P2RectWall(20, 440, 560, 20);
    game.stage.add(wallLeft, wallRight, wallTop, wallBottom);
    
    for(let i=0; i<25; i++){
        let bubble1 = new Bubble(Math.random()*400 + 100, Math.random()*250 + 100);
        bubble1.circular = true;
        game.stage.addChild(bubble1);
        bubbles.push(bubble1);

        //now set start speed x and y
        bubble1.body.velocity[0] = (Math.random()*100 - 50);
        bubble1.body.velocity[1] = (Math.random()*100 - 50);
    }

    game.state = play;
}

function play(dt) {
    world.step(dt);
    bubbles.forEach(bubble => {
        bubble.update();
    });
}
