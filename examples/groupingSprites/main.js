'use strict';

let game, cat, hedgehog, tiger, animals;

function setup() {
    cat = new Alif.Sprite(game, 'cat.png');
    cat.position.set(0, 0);

    hedgehog = new Alif.Sprite(game, 'hedgehog.png');
    hedgehog.position.set(32, 32);

    tiger = new Alif.Sprite(game, 'tiger.png');
    tiger.position.set(64, 64);

    animals = game.add.container(cat, hedgehog, tiger);    
    //Change the group's width and height
    // animals.width = 200;
    // animals.height = 200;

    //Position the group
    animals.position.set(96, 96);

    animals.updateTransform();
    animals.children.forEach(animal => {
        animal.updateTransform();
    });

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

    game.state = play;
}

function play(dt) {
}

// called before setup
function load(dt) {
    console.log('loading...');
}

game = new Alif.Game(640, 480, setup,
    [
        'animals.json'
    ],
    load
);
