'use strict';

let game, fairy, sky, blocks, finish, dust, dustFrames, w, h, bounds;

function setup() {
    w = game.canvas.width;
    h = game.canvas.height;

    game.renderer.backgroundColor = 'black';

    //Make the sky background
    sky = game.add.tilingSprite('sky.png', w, h);
    sky.vx = -1;

    blocks = game.add.container();

    //What should the initial size of the gap be between the pillars?
    let gapSize = 4;

    //How many pillars?
    let numberOfPillars = 15;

    for(let i = 0; i < numberOfPillars; i++) {
        //Randomly place the gap somewhere inside the pillar
        let startGapNumber = Alif.utils.randomInt(8 - gapSize);
        //Reduce the `gapSize` by one after every fifth pillar. This is 
        //what makes gaps gradually become narrower
        if (i > 0 && i % 5 === 0) gapSize -= 1;

        //Create a block if it's not within the range of numbers 
        //occupied by the gap
        for (let j = 0; j < 8; j++) {
            if (j < startGapNumber || j > startGapNumber + gapSize - 1) {
                let block = game.add.sprite('greenBlock.png');
                blocks.addChild(block);

                //Space each pillar 384 pixels apart. The first pillar will be 
                //placed at an x position of 512
                block.x = (i * 384) + 512;
                block.y = j * 64;
            } 
        }

        //After the pillars have been created, add the finish image 
        //right at the end
        if (i === numberOfPillars - 1) {
            finish = game.add.sprite('finish.png');
            blocks.addChild(finish);
            finish.x = (i * 384) + 896;
            finish.y = 192;
        } 
    }

    //Make the fairy
    let fairyFrames = ['0.png', '1.png', '2.png'];
    fairy = game.add.sprite(fairyFrames);
    fairy.fps = 24;
    fairy.position.set(232, 32);
    fairy.vy = 0;
    fairy.oldVy = 0;


    //Create the frames array for the fairy dust images
    //that trail the fairy
    dustFrames = ['pink.png', 'yellow.png', 'green.png', 'violet.png'];

    //Create the emitter
    dust = game.add.emitter(
        300,                                   //The interval
        () => game.add.particleEffect(         //The function
            fairy.x + 8,                       //x position
            fairy.y + fairy.halfHeight + 8,    //y position
            () => game.add.sprite(dustFrames), //Particle sprite
            3,                                 //Number of particles
            0,                                 //Gravity
            true,                              //Random spacing
            2.4, 3.6,                          //Min/max angle
            12, 18,                            //Min/max size
            1, 2,                              //Min/max speed
            0.005, 0.01,                       //Min/max scale speed
            0.005, 0.01,                       //Min/max alpha speed
            0.05, 0.1                          //Min/max rotation speed
        )
    );

    //Make the particle stream start playing when the game starts
    dust.play();

    game.pointer.tap = () => {
        fairy.vy += 1.5;
    };

    bounds = {x: 0, y: 0, width: w, height: h};

    game.state = play;
}

function play(dt) {
    //Make the sky background scroll by shifting the `tileX` 
    //of the `sky` tiling sprite
    // sky.tileX -= 1;
    sky.update(dt);

    //Move the blocks 2 pixels to the left each frame.
    //This will just happen while the finish image is off-screen. 
    //As soon as the finish image scrolls into view, the blocks 
    //container will stop moving
    if (finish.gx > 256) {
        blocks.x -= 2;
    }

    //Add gravity to the fairy
    fairy.vy += -0.05;
    fairy.y -= fairy.vy;

    //Decide whether the fairy should flap her wings
    //If she's going up, make her flap her wings and emit fairy dust 
    if (fairy.vy > fairy.oldVy) {
        if(!fairy.playing) {
            fairy.play();
            if (fairy.visible && !dust.playing) dust.play();
        } 
    }

    //If she's going down, stop flapping her wings, show the first frame 
    //and stop the fairy dust
    if (fairy.vy < 0 && fairy.oldVy > 0) {
        if (fairy.playing) fairy.stop();
        fairy.show(0);
        if (dust.playing) dust.stop();
    }

    //Store the fairy's current vy so we can use it
    //to find out if the fairy has changed direction
    //in the next frame. (You have to do this as the last step) 
    fairy.oldVy = fairy.vy;

    //Keep the fairy contained inside the stage and
    //neutralize her velocity if she hits the top or bottom boundary 
    let fairyVsStage = Alif.contain(fairy, bounds);
    if (fairyVsStage === "bottom" || fairyVsStage === "top") {
        fairy.vy = 0;
    }

    //Loop through all the blocks and check for a collision between
    //each block and the fairy. (`some` will quit the loop as soon as
    //`hitTestRectangle` returns `true`.) Set `hitTestRectangle`s third 
    //argument to `true` to use the sprites' global coordinates
    let fairyVsBlock = blocks.children.some(block => {
        return Alif.hitTestRectangle(fairy, block, true);
    });

    //If there's a collision and the fairy is currently visible,
    //create the explosion effect and reset the game after
    //a three second delay

    if (fairyVsBlock && fairy.visible) {
        //Make the fairy invisible
        fairy.visible = false;

        //Create a fairy dust explosion
        game.add.particleEffect(
            fairy.centerX, fairy.centerY, //x and y position
            () => game.add.sprite(dustFrames), //Particle sprite
            20,                           //Number of particles
            0,                            //Gravity
            false,                        //Random spacing
            0, 6.28,                      //Min/max angle
            16, 32,                       //Min/max size
            1, 3                          //Min/max speed
        );

        //Stop the dust emitter that's trailing the fairy
        dust.stop();

        //Wait 3 seconds and then reset the game
        Alif.wait(3000).then(() => reset());
    }
}

function reset() {
    //Reset the game if the fairy hits a block
    fairy.visible = true;
    fairy.y = 32;
    dust.play();
    blocks.x = 0;
}

game = new Alif.Game(910, 512, setup, ['flappyFairy.json']);
