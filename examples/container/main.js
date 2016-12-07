"use strict";

var container;

function setup() {
    container = new Game.Container();

    for(var j = 0; j < 5; j++) {
        for(var i = 0; i < 5; i++) {
            var bunny = new Game.Sprite('bunny.png');
            bunny.x = 40 * i;
            bunny.y = 40 * j;
            // bunny.anchor.set(0.5, 0.5);
            // bunny.pivot.set(50, 50);
            container.addChild(bunny);
        }
    }

    Game.stage.addChild(container);

    /*
     * All the bunnies are added to the container with the addChild method
     * when you do this, all the bunnies become children of the container, 
     * and when a container moves, so do all its children.
     * This gives you a lot of flexibility and makes it easier to position
     * elements on the screen
     */
    container.x = 200;
    container.y = 150;

    // (93, 98.5) is center of center bunny sprite in local container
    // coordinates we want it to be in (200, 150) of global coords
    container.pivot.x = 80 + 26 * 0.5;
    container.pivot.y = 80 + 37 * 0.5;

    Game.state = play;
}

function play(dt) {
    container.rotation -= 0.01;
    // container.children.forEach(c => {
    //     c.rotation += 0.02;
    // });
}

window.onload = function() {
    Game.create(640, 480, setup, ['bunny.png']);
    Game.renderer.backgroundColor = '#66FF99';
    Game.start();
};
