'use strict';

let graphics, thing, count;

function setup() {
    graphics = Game.graphics();
 
    // set a fill and line style
    graphics.beginFill(0xFF3300);
    graphics.lineStyle(10, 0xffd900, 1);
    
    // draw a shape
    graphics.moveTo(50,50);
    graphics.lineTo(250, 50);
    graphics.lineTo(100, 100);
    graphics.lineTo(250, 220);
    graphics.lineTo(50, 220);
    graphics.lineTo(50, 50);
    graphics.endFill();
    
    // set a fill and line style again
    graphics.lineStyle(10, 0xFF0000, 0.8);
    graphics.beginFill(0xFF700B, 1);
    
    // draw a second shape
    graphics.moveTo(210,300);
    graphics.lineTo(450,320);
    graphics.lineTo(570,350);
    graphics.lineTo(580,20);
    graphics.lineTo(330,120);
    graphics.lineTo(410,200);
    graphics.lineTo(210,300);
    graphics.endFill();
    
    // draw a rectangle
    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.drawRect(50, 250, 100, 100);
    
    // draw a circle
    graphics.lineStyle(0);
    graphics.beginFill(0xFFFF0B, 0.5);
    graphics.drawCircle(470, 200,100);
    
    graphics.lineStyle(20, 0x33FF00);
    graphics.moveTo(30,30);
    graphics.lineTo(600, 300);
            
    // let's create moving shape
    thing = Game.graphics();
    thing.position.x = 620/2;
    thing.position.y = 380/2;
    
    count = 0;

    Game.state = play;
}

function play(dt) {
    thing.clear();

    count += 0.1;

    thing.clear();
    thing.lineStyle(30, 0xff0000, 1);
    thing.beginFill(0xffFF00, 0.5);

    thing.moveTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count)* 20);
    thing.lineTo(120 + Math.cos(count) * 20, -100 + Math.sin(count)* 20);
    thing.lineTo(120 + Math.sin(count) * 20, 100 + Math.cos(count)* 20);
    thing.lineTo(-120 + Math.cos(count)* 20, 100 + Math.sin(count)* 20);
    thing.lineTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count)* 20);

    thing.rotation = count * 0.1;
}

window.onload = function() {
    Game.create(620, 380, setup);
    Game.start();
 };
