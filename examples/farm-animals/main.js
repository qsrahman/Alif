'use strict';

let game, 
    animals = [], 
    animalText, 
    leftArrow, 
    rightArrow, 
    currentAnimal,
    isMoving = false, 
    w, h,
    i = 0;

function setup() {
    w = game.canvas.width;
    h = game.canvas.height;

    game.renderer.backgroundImage = 'assets/background.png';

    game.renderer.scaleToWindow();
    window.addEventListener('resize', function(event){ 
        game.renderer.scaleToWindow();
    });

    let animalData = [
        {key: 'assets/chicken_spritesheet.png', width: 131, height: 200, text: 'CHICKEN', audio: 'assets/chicken.mp3'},
        {key: 'assets/horse_spritesheet.png', width: 212, height: 200, text: 'HORSE', audio: 'assets/horse.mp3'},
        {key: 'assets/pig_spritesheet.png', width: 297, height: 200, text: 'PIG', audio: 'assets/pig.mp3'},
        {key: 'assets/sheep_spritesheet.png', width: 244, height: 200, text: 'SHEEP', audio: 'assets/sheep.mp3'}
    ];

    animalData.forEach(el => {
        let animalFrames = Alif.filmstrip(el.key, el.width, el.height);
        let animal = game.add.sprite(animalFrames);
        animal.anchor.set(0.5);
        animal.x = w + animal.width / 2;
        animal.y = h / 2;
        animal.interactive = true;
        animal.show(1);
        animal.name = el.text;
        animal.sound = game.add.sound(el.audio);
        animal.press = () => {
            animal.play();
            animal.sound.play();
            Alif.wait(2000).then(() => {
                animal.stop();
                animal.show(1);
            });
        };
        animals.push(animal);
    });

    let style = {font: 'bold 30pt Arial', fill: '#D0171B', align: 'center'};
    animalText = game.add.text('', style, w/2, h * 0.85);
    animalText.anchor.set(0.5);

    leftArrow = game.add.sprite('assets/arrow.png', 60, h/2);
    leftArrow.anchor.set(0.5);
    leftArrow.scale.x = -1;
    leftArrow.interactive = true;
    leftArrow.press = () => switchAnimal(-1);

    rightArrow = game.add.sprite('assets/arrow.png', w - 60, h/2);    
    rightArrow.anchor.set(0.5);
    rightArrow.interactive = true;
    rightArrow.press = () => switchAnimal(1);

    currentAnimal = animals[i];
    currentAnimal.x = w / 2;
    animalText.text = currentAnimal.name;

    game.state = play;
}

function play(dt) {
}

function switchAnimal(direction) {
    let endX, newAnimal;

    if(isMoving) return;

    isMoving = true;
    animalText.visible = false;

    if(direction > 0) {
        i++;
        i %= animals.length;
        newAnimal = animals[i];
        newAnimal.x = -newAnimal.width / 2;
        endX = w + currentAnimal.width / 2;
    }
    else {
        if(i === 0) {
            i = animals.length;
        }
        i--;
        newAnimal = animals[i];
        newAnimal.x = w + newAnimal.width / 2;
        endX = -currentAnimal.width / 2;    
    }

    let t = game.add.tween(newAnimal).to({x: w / 2}, 1000);
    t.onComplete(() => {
        isMoving = false;
        animalText.visible = true;
    });
    t.start();

    game.add.tween(currentAnimal).to({x: endX}, 1000).start();

    currentAnimal = newAnimal;
    animalText.text = currentAnimal.name;
}

game = new Alif.Game(640, 360, setup,
    [
        'assets/chicken_spritesheet.png',
        'assets/horse_spritesheet.png',
        'assets/sheep_spritesheet.png',
        'assets/pig_spritesheet.png',
        'assets/arrow.png',
        'assets/chicken.mp3',
        'assets/horse.mp3',
        'assets/sheep.mp3',
        'assets/pig.mp3'
    ]
);
