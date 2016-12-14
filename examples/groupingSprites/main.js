'use strict';

let cat, hedgehog, tiger, animals;

function setup() {
    cat = new Game.Sprite('cat.png');
    cat.position.set(0, 0);

    hedgehog = new Game.Sprite('hedgehog.png');
    hedgehog.position.set(32, 32);

    tiger = new Game.Sprite('tiger.png');
    tiger.position.set(64, 64);

    animals = Game.add.container(cat, hedgehog, tiger);

    //Change the group's width and height
    // animals.width = 200;
    // animals.height = 200;

    //Position the group
    animals.position.set(96, 96);

    //Find the tiger's local position
    console.log(`Tiger local x: ${tiger.x}`);
    console.log(`Tiger local y: ${tiger.y}`);

    //Find the tiger's global position
    console.log(`Tiger global x: ${animals.toGlobal(tiger.position).x}`);
    console.log(`Tiger global y: ${animals.toGlobal(tiger.position).y}`);

    //Find the tiger's world position from the top left corner of the
    //canvas
    console.log(`Tiger world x: ${tiger.getGlobalPosition().x}`);
    console.log(`Tiger world y: ${tiger.getGlobalPosition().y}`);

    //The tiger's position relative to the hedgehog
    console.log(`Tiger x relative to the hedgehog: ${tiger.toLocal(tiger.position, hedgehog).x}`);
    console.log(`Tiger y relative to the hedgehog: ${tiger.toLocal(tiger.position, hedgehog).y}`);


    //Display the child sprites in the group
    console.log(animals.children);

    //Find the width and height
    console.log(`Width: ${animals.width} Height: ${animals.height}`);

    Game.state = play;
}

function play(dt) {
}

// called before setup
function load(dt) {
    console.log('loading...');
}

window.onload = function() {
    Game.create(640, 480, setup,
        [
            'animals.json'
        ],
        load
    );
    Game.start();
 };
