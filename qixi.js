(function() {
'use strict';

var root = this,
    Q = Q || {};

Q.VERSION = "v0.0.1";

Q.scale = 1;
Q.stage = null;
Q.renderer = null;
Q.state = null;
Q.paused = false;
Q._FPS = 60;

Q.dragAndDrop = false;
Q.draggableSprites = [];
Q.buttons = [];
Q.particles = [];

Q.create = function(width, height, setup, assetsToLoad, callback) {
    if(!setup) {
        throw new Error('Supply a setup function in the constructor.');
    }

    //initialize renderer
    Q.renderer = new Q.Renderer(width, height);
    Q.canvas = Q.renderer.canvas;
    
    //stage will be the parent of all objects
    Q.stage = new Q.Container();
    // Q.stage.width = Q.canvas.width;
    // Q.stage.height = Q.canvas.height;
    Q.stage.parent = {
        worldTransform: new Q.Matrix(),
        worldAlpha: 1, 
        children: []
    };

    //initialize mouse pointer
    Q.pointer = new Pointer(Q.renderer.canvas);

    //initialize some often used keys
    Q.leftKey = new Q.Keyboard(37),
    Q.upKey = new Q.Keyboard(38),
    Q.rightKey = new Q.Keyboard(39),
    Q.downKey = new Q.Keyboard(40),
    Q.spaceKey = new Q.Keyboard(32)

    Q.setup = setup;
    Q.load = callback || null;

    Q.assetFilePaths = assetsToLoad || null;
};

//load assets and start the game loop
Q.start = function() {
    if(Q.assetFilePaths) {
        Q.Assets.load(Q.assetFilePaths).then(() => {
            Q.state = null;
            Q.setup();
        });

        if(Q.load)
            Q.state = Q.load;
    }
    else {
        Q.setup();
    }
    // Start the game loop.
    // loopId = requestAnimationFrame(gameLoop);
    requestAnimationFrame(gameLoop);
};

function update(dt = 1) {
    //update all interactive objects
    if (Q.buttons.length > 0) {
        Q.pointer.cursor = 'auto';
        Q.buttons.forEach(button => {
            button.update(Q.pointer, Q.renderer.canvas);
            if (button.state === 'over' || button.state === 'down') {
                if(button.parent !== null) {
                    Q.pointer.cursor = 'pointer';
                }
            }
        });
    }

    //update all particles
    if (Q.particles.length > 0) {
        for(let i = Q.particles.length - 1; i >= 0; i--) {
            Q.particles[i].update(dt);
        }
    }

    //update tweens
    if(Q.TWEEN)
        Q.TWEEN.update(dt);

    //update drag and drop objects
    if (Q.dragAndDrop) {
        Q.pointer.updateDragAndDrop();
    }

    //call game stae function
    if(Q.state && !Q.paused) {
        Q.state(dt);
    }
}

let then = null,
    dt = 0,
    step = 1/Q._FPS,
    fRate = 1 / 1000;
    // loopId = null;

//game loop
function gameLoop(now) {
    // loopId = requestAnimationFrame(gameLoop);
    requestAnimationFrame(gameLoop);

    dt += Math.min(1, (now - (then || now)) * fRate);

    then = now;

    while(dt > step) {
        dt -= step;
        // Run the code for each frame.
        update(step);
    }
    // render all sprites on the stage.
    Q.renderer.render(Q.stage);
}

Q.resume = function() {
    Q.paused = false;
};

Q.pause = function() {
    Q.paused = true;
};

// Q.resume = function() {
//     if(!loopId) {
//         then = null;
//         dt = 0;
//         Q.paused = false;
//         loopId = requestAnimationFrame(gameLoop);
//     }
// };

// Q.pause = function() {
//     if(loopId) {
//         window.cancelAnimationFrame(loopId);
//     }
//     loopId = null;
//     Q.paused = true;
// };

Object.defineProperties(Q, {
    FPS: {
        get: function() {
            return this._FPS;
        },
        set: function(value) {
            dt = 0;
            then = null;
            step = 1 / this._FPS;
            this._FPS = value;
       },
        enumerable: true, configurable: true
    }
});

Q.Renderer = class {
    constructor(width, height, canvasId) {
        width = width || 800;
        height = height || 600;
        this.canvas = document.getElementById(canvasId);
        if(!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute('width', width);
            this.canvas.setAttribute('height', height);
            this.canvas.setAttribute('id', 'canvas');
            document.body.appendChild(this.canvas);
        }
        this.canvas.ctx = this.canvas.getContext("2d");
        this.resize(width, height);
    }
    set backgroundColor(color) {
        this.canvas.style.backgroundColor = color;
    }
    set backgroundImage(url) {
        this.canvas.style.backgroundRepeat = 'no-repeat';
        this.canvas.style.backgroundImage = 'url("'+url+'")';
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
    }
    render(container) {
        let ctx = this.canvas.ctx;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // container.updateTransform();

        container.children.forEach(child => {
            renderChild(child);
        });

        function renderChild(child) {
            if (child.visible) {
                child.updateTransform();

                ctx.globalAlpha = child.worldAlpha;

                child.worldTransform.setTransform(ctx);

                if (child.blendMode) 
                    ctx.globalCompositeOperation = child.blendMode;

                if (child.render) child.render(ctx);

                if (child.children && child.children.length > 0) {
                    child.children.forEach(c => {
                        renderChild(c);
                    });
                }
            }
        }
    }
};

Q.remove = function(...sprites) {
    //Remove sprites that's aren't in an array
    if (!(sprites[0] instanceof Array)) {
        if (sprites.length > 1) {
            sprites.forEach(sprite  => {
                sprite.parent.removeChild(sprite);
            });
        } 
        else {
            sprites[0].parent.removeChild(sprites[0]);
        }
    }
    //Remove sprites in an array of sprites
    else {
        let spritesArray = sprites[0];
        if (spritesArray.length > 0) {
            for (let i = spritesArray.length - 1; i >= 0; i--) {
                let sprite = spritesArray[i];
                sprite.parent.removeChild(sprite);
                spritesArray.splice(spritesArray.indexOf(sprite), 1);
            }
        }
    }
};

Q.Container = class {
    constructor(...sprites) {
        this.position = new Q.Point();
        this.velocity = new Q.Point();
        this.scale = new Q.Point(1, 1);
        this.pivot = new Q.Point();

        this.globalPosition = new Q.Point(0, 0);
        
        this.rotation = 0;

        this.children = [];

        this.visible = true;

        this.blendMode = undefined;
        
        this.parent = null;

        this.alpha = 1;
        this.worldAlpha = 1;
        this.worldTransform = new Q.Matrix();
        
        this._bounds = new Q.Rectangle(0, 0, 1, 1);
        this._currentBounds = null;
        
        this._sr = 0;
        this._cr = 1;
        this._rotationCache = 0;

        this._layer = 0;
        this._circular = false;
        this._interactive = false;
        this._draggable = false;

        this._width = 0;
        this._height = 0; 

        sprites.forEach(sprite => this.addChild(sprite));
    }
    get x() {
        return this.position.x;
    }
    set x(value) {
        this.position.x = value;
    }
    get y() {
        return this.position.y;
    }
    set y(value) {
        this.position.y = value;
    }
    get gx() {
        // return this.globalPosition.x;
        return this.getGlobalPosition().x;
    }
    get gy() {
        // return this.globalPosition.y;
        return this.getGlobalPosition().y;
    }
    get width() {
        return this.scale.x * this.getLocalBounds().width;
    }
    set width(value) {
        let w = this.getLocalBounds().width;
        this.scale.x = (w !== 0) ? (value / w) : 1;
        this._width = value;
    }
    get height() {
        return this.scale.y * this.getLocalBounds().height;
    }
    set height(value) {
        let h = this.getLocalBounds().height;
        this.scale.y = (h !== 0) ? (value / h) : 1;
        this._height = value;
    }
    get halfWidth() {
        return this.width / 2;
    }
    get halfHeight() {
        return this.height / 2;
    }
    get centerX() {
        return this.x + (this.width / 2) - this.xAnchorOffset;
    }
    get centerY() {
        return this.y + (this.height / 2) - this.yAnchorOffset;
    }
    get xAnchorOffset() {
        return 0;
    }
    get yAnchorOffset() {
        return 0;
    }
    get vx() {
        return this.velocity.x;
    }
    set vx(value) {
        this.velocity.x = value;
    }
    get vy() {
        return this.velocity.y;
    }
    set vy(value) {
        this.velocity.y = value;
    }
    get localBounds() {
        return this.getLocalBounds();
    }
    get globalBounds() {
        return this.getBounds();
    }
    get layer() {
        return this._layer;
    }
    set layer(value) {
        this._layer = value;
        if (this.parent) {
            this.parent.children.sort((a, b) => a.layer - b.layer);
        } 
    }
    get empty() {
        return this.children.length === 0 ? true : false;
    }
    get worldVisible() {
        let item = this;

        do {
            if (!item.visible) {
                return false;
            }

            item = item.parent;
        } while(item);

        return true;
    }
    get circular() {
        return this._circular;
    }
    set circular (value) {
        if (value === true && this._circular === false) {
            Object.defineProperties(this, {
                diameter: {
                    get () {
                        return this.width;
                    },
                    set (value) {
                        this.width = value;
                        this.height = value;
                    },
                    enumerable: true, configurable: true
                },
                radius: {
                    get() {
                        return this.halfWidth;
                    },
                    set(value) {
                        this.width = value * 2;
                        this.height = value * 2;
                    },
                    enumerable: true, configurable: true
                }
            });
            this._circular = true;
        }
        if (value === false && this._circular === true) {
            delete this.diameter;
            delete this.radius;
            this._circular = false;
        }
    }
    get interactive() {
        return this._interactive;
    }
    set interactive(value) {
        if (value === true) {
            Object.assign(this, Interaction);
            Q.buttons.push(this);

            this._interactive = true;
        }
        if (value === false) {
            Q.buttons.splice(Q.buttons.indexOf(this), 1);
            Object.keys(Interaction).forEach(prop => {
                delete this[prop];
            });
            this._interactive = false;
        }
    }
    get draggable() {
        return this._draggable;
    }
    set draggable(value) {
        if (value === true) {
            Q.draggableSprites.push(this);
            this._draggable = true;
            // if (Q.dragAndDrop === false) Q.dragAndDrop = true;
        }
        if (value === false) {
            Q.draggableSprites.splice(Q.draggableSprites.indexOf(this), 1);
        }
    }
    addChild(child) {
        if(child.parent) {
            child.parent.removeChild(child);
        }

        child.parent = this;
        this.children.push(child);
    }
    add(...sprites) {
        sprites.forEach(sprite => this.addChild(sprite));
    }
    removeChild(child) {
        let index = this.children.indexOf(child);
        if(index !== -1) {
            child.parent = null;
            this.children.splice(index, 1);
        }
        else {
            throw new Error(child + ' is not a child of ' + this);
        }
    }
    remove(...sprites) {
        sprites.forEach(sprite => this.removeChild(sprite));
        return this;
    }
    swapChildren(child, child2) {
        if (child === child2) return;

        let index1 = this.children.indexOf(child);
        let index2 = this.children.indexOf(child2);

        if (index1 < 0 || index2 < 0) {
            throw new Error('swapChildren: Both the supplied DisplayObjects must be a child of the caller.');
        }

        this.children[index1] = child2;
        this.children[index2] = child;
    }
    updateTransform() {
        if(this.parent) {
            if(this.rotation !== this._rotationCache) {
                this._rotationCache = this.rotation;
                this._sr = Math.sin(this.rotation);
                this._cr = Math.cos(this.rotation);
            }

            let pt = this.parent.worldTransform,
                wt = this.worldTransform,

                // get the matrix values of the displayobject
                a = this._cr * this.scale.x,
                b = this._sr * this.scale.x,
                c = -this._sr * this.scale.y,
                d = this._cr * this.scale.y,
                tx = this.position.x,
                ty = this.position.y;

            if(this.pivot.x || this.pivot.y) {
                tx -= this.pivot.x * a + this.pivot.y * c;
                ty -= this.pivot.x * b + this.pivot.y * d;
            }

            // concat the parent matrix with the objects transform.
            wt.a = a * pt.a + b * pt.c;
            wt.b = a * pt.b + b * pt.d;
            wt.c = c * pt.a + d * pt.c;
            wt.d = c * pt.b + d * pt.d;
            wt.tx = tx * pt.a + ty * pt.c + pt.tx;
            wt.ty = tx * pt.b + ty * pt.d + pt.ty;

            this.worldAlpha = this.alpha * this.parent.worldAlpha;
            this.globalPosition.set(wt.tx, wt.ty);

            this._currentBounds = null;
        }
    }
    getBounds() {
        if(!this._currentBounds) {
            if(this.children.length === 0) {
                return Q.Rectangle.EMPTY;
            }

            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity,

                childBounds,
                childMaxX,
                childMaxY,
                childVisible = false;

            for (let i = 0, j = this.children.length; i < j; i++) { 
                if(!this.children[i].visible) continue;

                childVisible = true;

                childBounds = this.children[i].getBounds();

                minX = minX < childBounds.x ? minX : childBounds.x;
                minY = minY < childBounds.y ? minY : childBounds.y;

                childMaxX = childBounds.x + childBounds.width;
                childMaxY = childBounds.y + childBounds.height;

                maxX = maxX > childMaxX ? maxX : childMaxX;
                maxY = maxY > childMaxY ? maxY : childMaxY;
            }

            if(!childVisible) {
                return Q.Rectangle.EMPTY;
            }

            let bounds = this._bounds;

            bounds.x = minX;
            bounds.y = minY;
            bounds.width = maxX - minX;
            bounds.height = maxY - minY;

            this._currentBounds = bounds;            
        }
        return this._currentBounds;
    }
    getLocalBounds() {
        let matrixCache = this.worldTransform.clone();

        this.worldTransform = Q.Matrix.IDENTITY;

        this.children.forEach(child => {
            child.updateTransform();
        });

        this.worldTransform.copy(matrixCache);
        this._currentBounds = null;

        return this.getBounds(Q.Matrix.IDENTITY);
    }
    toGlobal(position) {
        this.updateTransform();
        return this.worldTransform.apply(position);
    }
    toLocal(position, from, point) {
        if(from) {
            position = from.toGlobal(position);
        }
        this.updateTransform();
        return this.worldTransform.applyInverse(position, point);
    }
    getGlobalPosition() {
        let point = new Q.Point();

        if(this.parent) {
            this.updateTransform();

            point.x = this.worldTransform.tx;
            point.y = this.worldTransform.ty;
        }
        else {
            point.x = this.position.x;
            point.y = this.position.y;
        }

        return point;
    }
};

Q.container = function(...sprites) {
    let sprite = new Q.Container(...sprites);

    //Add the sprite to the stage
    Q.stage.addChild(sprite);

    //Return the sprite to the main program
    return sprite;
};

Q.frame = function(source, x, y, width, height) {
    let o = {};
    o.image = Q.Assets.cache[source].source;
    o.x = x;
    o.y = y;
    o.width = width;
    o.height = height;

    return o;
};

Q.frames = function(source, arrayOfPositions, width, height) {
    let o = {};
    o.image = Q.Assets.cache[source].source;
    o.data = arrayOfPositions;
    o.width = width;
    o.height = height;

    return o;
};

Q.filmstrip = function(imageName, frameWidth, frameHeight, spacing){
    let image = Q.Assets.cache[imageName].source,
        positions = [],
        columns = image.width / frameWidth,
        rows = image.height / frameHeight,
        numberOfFrames = columns * rows;

    for(let i = 0; i < numberOfFrames; i++) {
        let x = (i % columns) * frameWidth;
        let y = Math.floor(i / columns) * frameHeight;

        if(spacing && spacing > 0) {
            x += spacing + (spacing * i % columns);
            y += spacing + (spacing * Math.floor(i / columns));
        }

        positions.push([x, y]);
    }
    return Q.frames(imageName, positions, frameWidth, frameHeight);
};

Q.Sprite = class extends Q.Container {
    constructor(source, x = 0, y = 0) {
        super();

        this.position.set(x, y);
        this.anchor = new Q.Point();

        this.frames = [];
        this._currentFrame = 0;
        this._texture = null;

        this.texture = source;
    }
    get width() {
        return Math.abs(this.scale.x) * this._texture.frame.w;
    }
    set width(value) {
        let sign = Q.utils.sign(this.scale.x) || 1;
        // let sign = value ? (value < 0 ? -1 : 1) : 0;
        this.scale.x = sign * value / this._texture.frame.w;
        this._width = value;
    }
    get height() {
        return Math.abs(this.scale.y) * this._texture.frame.h;
    }
    set height(value) {
        let sign = Q.utils.sign(this.scale.y) || 1;
        // let sign = value ? (value < 0 ? -1 : 1) : 0;
        this.scale.y = sign * value / this._texture.frame.h;
        this._height = value;
    }
    get xAnchorOffset() {
        // return this.height * this.anchor.x;
        return this.width * this.anchor.x;
    }
    get yAnchorOffset() {
        // return this.width * this.anchor.y;
        return this.height * this.anchor.y;
    }
    get currentFrame() {
        return this._currentFrame;
    }
    set currentFrame(value) {
        this._currentFrame = value;
    }
    get texture() {
        return this._texture
    }
    set texture(source) {
        //If the source contains an `getContext` sub-property, this must
        //be a canvas object. Use that sub-image to make the sprite.
        if(source.getContext) {
            this._texture = {
                source: source,
                frame: {x: 0, y: 0, w: source.width, h: source.height}
            }
            this.width = source.width;
            this.height = source.height;
        }
        //If the source contains an `image` sub-property, this must be a
        //`frame` object that's defining the rectangular area of an inner
        //sub-image. Use that sub-image to make the sprite. If it doesn't 
        //contain a `data` property, then it must be a single frame.
        else if (source.image && !source.data) {
            this.createFromTileset(source);
        }
        //If the source contains an `image` sub-property
        //and a `data` property, then it contains multiple frames
        else if (source.image && source.data) {
            this.createFromTilesetFrames(source);
        }
        //Is the source an array? If so, what kind of array?
        else if (source instanceof Array) {
            if (source[0] && Q.Assets.cache[source[0]].source) {
                //The source is an array of frames on a texture atlas tileset
                this.createFromAtlasFrames(source);
            }
            //throw an error if the sources in the array aren't recognized
            else {
                throw new Error(`The image sources in ${source} are not recognized`);
            }
        } 
        //Is the source a tileset from a texture atlas?
        //(It is if it has a `frame` property)
        else if (Q.Assets.cache[source].frame) {
            this.createFromAtlas(Q.Assets.cache[source]);
        }
        //Throw an error if the source is something we can't interpret
        else {
            throw new Error(`The image source ${source} is not recognized`);
        }

        if (this.frames.length > 0)
            Object.assign(this, Animation);
    }
    createFromTileset(source) {
        //Throw an error if the source is not an image object
        if (!(source.image instanceof Image)) {
            throw new Error(`${source.image} is not an image object`);
        } 
        else {
            this._texture = {
                source: source.image,
                frame: {
                    x: source.x,
                    y: source.y,
                    w: source.width,
                    h: source.height
                }
            };
            this.width = source.width;
            this.height = source.height;
        }
    }
    createFromTilesetFrames(source) {
        //Throw an error if the source is not an Image object
        if (!(source.image instanceof Image)) {
            throw new Error(`${source.image} is not an image object`);
        } 
        else {
            this.frames = source.data;
            this._texture = {
                source: source.image,
                frame: {
                    x: this.frames[0][0],
                    y: this.frames[0][1],
                    w: source.width,
                    h: source.height
                }
            };
            this.width = source.width;
            this.height = source.height;
        }
    }
    createFromAtlas(source) {
        this._texture = source;
        this.width = this._texture.frame.w;
        this.height = this._texture.frame.h;
    }
    createFromAtlasFrames(source) {
        this.frames = source;
        this._texture = Q.Assets.cache[source[0]];
        this.width = this._texture.frame.w;
        this.height = this._texture.frame.h;
    }
    static fromFrame(frameId) {
        let texture = Q.Assets.cache[frameId];
        if(!texture)
            throw new Error("The frameId '"+ frameId +"' does not exist in the asset cache" + this);

        return new Q.Sprite(frameId);
    }
    getBounds(matrix) {
        if(!this._currentBounds) {
            let width = this.width,
                height = this.height,
            // let width = this._texture.frame.w,
            //     height = this._texture.frame.h,

                w0 = width * (1 - this.anchor.x),
                w1 = width * -this.anchor.x,
                h0 = height * (1 - this.anchor.y),
                h1 = height * -this.anchor.y,

                worldTransform = matrix || this.worldTransform,

                a = worldTransform.a,
                b = worldTransform.b,
                c = worldTransform.c,
                d = worldTransform.d,
                tx = worldTransform.tx,
                ty = worldTransform.ty,

                maxX,
                maxY,
                minX,
                minY,

                x1 = a * w1 + c * h1 + tx,
                y1 = d * h1 + b * w1 + ty,

                x2 = a * w0 + c * h1 + tx,
                y2 = d * h1 + b * w0 + ty,

                x3 = a * w0 + c * h0 + tx,
                y3 = d * h0 + b * w0 + ty,

                x4 =  a * w1 + c * h0 + tx,
                y4 =  d * h0 + b * w1 + ty;

            minX = x1; // < minX ? x1 : minX;
            minX = x2 < minX ? x2 : minX;
            minX = x3 < minX ? x3 : minX;
            minX = x4 < minX ? x4 : minX;

            minY = y1; // < minY ? y1 : minY;
            minY = y2 < minY ? y2 : minY;
            minY = y3 < minY ? y3 : minY;
            minY = y4 < minY ? y4 : minY;

            maxX = x1; // > maxX ? x1 : maxX;
            maxX = x2 > maxX ? x2 : maxX;
            maxX = x3 > maxX ? x3 : maxX;
            maxX = x4 > maxX ? x4 : maxX;

            maxY = y1; // > maxY ? y1 : maxY;
            maxY = y2 > maxY ? y2 : maxY;
            maxY = y3 > maxY ? y3 : maxY;
            maxY = y4 > maxY ? y4 : maxY;

            // check for children
            if(this.children.length) {
                let childBounds = super.getBounds();

                w0 = childBounds.x;
                w1 = childBounds.x + childBounds.width;
                h0 = childBounds.y;
                h1 = childBounds.y + childBounds.height;

                minX = (minX < w0) ? minX : w0;
                minY = (minY < h0) ? minY : h0;

                maxX = (maxX > w1) ? maxX : w1;
                maxY = (maxY > h1) ? maxY : h1;
            }

            let bounds = this._bounds;
            bounds.x = minX;
            bounds.width = maxX - minX;

            bounds.y = minY;
            bounds.height = maxY - minY;

            this._currentBounds = bounds;
        }
        return this._currentBounds;
    }
    getLocalBounds() {
        // this._bounds.x = -this._texture.frame.w * this.anchor.x;
        // this._bounds.y = -this._texture.frame.h * this.anchor.y;
        // this._bounds.width = this._texture.frame.w;
        // this._bounds.height = this._texture.frame.h;

        this._bounds.x = -this.width * this.anchor.x;
        this._bounds.y = -this.height * this.anchor.y;
        this._bounds.width = this.width;
        this._bounds.height = this.height;

        return this._bounds;
    }
    //Add a `gotoAndStop` method to go to a specific frame.
    gotoAndStop(frameNumber) {
        if (this.frames.length > 0 && frameNumber < this.frames.length) {
            //a. Frames made from tileset sub-images. 
            //If each frame is an array, then the frames were made from an
            //ordinary Image object using the `frames` method
            if (this.frames[0] instanceof Array) {
                this._texture.frame.x = this.frames[frameNumber][0];
                this._texture.frame.y = this.frames[frameNumber][1];
            }
            //b. Frames made from texture atlas frames.
            //If each frame isn't an array, and it has a sub-object called `frame`,
            //then the frame must be a texture atlas id name.
            //In that case, get the source position from the atlas's `frame` object.
            else {
                this._texture = Q.Assets.cache[this.frames[frameNumber]];
                this.width = this._texture.frame.w;
                this.height = this._texture.frame.h;
            }
            //Set the `_currentFrame` value to the chosen frame
            this._currentFrame = frameNumber;
        } 
        //Throw an error if this sprite doesn't contain any frames
        else {
            throw new Error(`Frame number ${frameNumber} does not exist`);
        }
    }
    render(context) {
        context.drawImage(
            this._texture.source,
            this._texture.frame.x,
            this._texture.frame.y,
            this._texture.frame.w,
            this._texture.frame.h,
            this.anchor.x * -this._texture.frame.w,
            this.anchor.y * -this._texture.frame.h,
            // this.width,
            // this.height
            this._texture.frame.w,
            this._texture.frame.h
    );
    }
};

Q.sprite = function(source, x, y) {
    //Create the sprite
    let sprite = new Q.Sprite(source, x, y);

    //Add the sprite to the stage
    Q.stage.addChild(sprite);

    //Return the sprite to the main program
    return sprite;
};

Q.button = function(source, x, y) {
    let sprite = new Q.Sprite(source, x, y);

    sprite.interactive = true;
    sprite.type = 'button';
    
    Q.stage.addChild(sprite);

    return sprite;
};

let Animation = {
    frameCounter: 0,
    numberOfFrames: 0,
    startFrame: 0,
    endFrame: 0,
    fps: 12,
    timerInterval: undefined,
    playing: false,
    loop: true,

    show(frameNumber) {
        //Reset any possible previous animations
        this.reset();

        //Find the new state on the sprite.
        this.gotoAndStop(frameNumber);
    },
    play() {
        if (!this.playing) {
            this.playSequence([0, this.frames.length - 1]);
        }
    },
    stop() {
        if (this.playing) {
            this.reset();
            this.gotoAndStop(this.currentFrame);
        }
    },
    playSequence(sequenceArray) {
        //Reset any possible previous animations
        this.reset();

        //Figure out how many frames there are in the range
        this.startFrame = sequenceArray[0];
        this.endFrame = sequenceArray[1];
        this.numberOfFrames = this.endFrame - this.startFrame;

        //Compensate for two edge cases:
        //1. If the `startFrame` happens to be `0`
        if (this.startFrame === 0) {
            this.numberOfFrames += 1;
            this.frameCounter += 1;
        }

        //2. If only a two-frame sequence was provided
        if(this.numberOfFrames === 1) {
            this.numberOfFrames = 2;
            this.frameCounter += 1;
        }

        //Calculate the frame rate. Set the default fps to 12
        // if (!this.fps) this.fps = 12;
        let frameRate = 1000 / this.fps;

        //Set the sprite to the starting frame
        this.gotoAndStop(this.startFrame);

        //If the state isn't already playing, start it
        if(!this.playing) {
            this.timerInterval = setInterval(this.advanceFrame.bind(this), frameRate);
            this.playing = true;
        }
    },
    //`advanceFrame` is called by `setInterval` to display the next frame
    //in the sequence based on the `frameRate`. When frame sequence
    //reaches the end, it will either stop it or loop it
    advanceFrame() {
        //Advance the frame if `frameCounter` is less than
        //the state's total frames
        if (this.frameCounter < this.numberOfFrames) {
            //Advance the frame
            this.gotoAndStop(this.currentFrame + 1);

            //Update the frame counter
            this.frameCounter += 1;

            //If we've reached the last frame and `loop`
            //is `true`, then start from the first frame again
        } 
        else {
            if (this.loop) {
                this.gotoAndStop(this.startFrame);
                this.frameCounter = 1;
            }
        }
    },
    reset() {
        //Reset `playing` to `false`, set the `frameCounter` to 0,
        //and clear the `timerInterval`
        if (this.timerInterval !== undefined && this.playing === true) {
            this.playing = false;
            this.frameCounter = 0;
            this.startFrame = 0;
            this.endFrame = 0;
            this.numberOfFrames = 0;
            clearInterval(this.timerInterval);
        }
    }
};

Q.MovieClip = class extends Q.Sprite {
    constructor(textures, x, y) {
        super(textures[0], x, y);
        
        this.textures = textures;
        this.animationSpeed = 1;
        this.playing = false;
        this.loop = true;
        this.onComplete = null;
    }
    stop() {
        this.playing = false;
        return this;
    }
    play() {
        this.playing = true;
        return this;
    }
    gotoAndPlay(frameNumber) {
        this.play();
        this.currentFrame = frameNumber;
        return this;
    }
    gotoAndStop(frameNumber) {
        this.stop();
        this.currentFrame = frameNumber;
        let round = (this.currentFrame + 0.5) | 0;
        this.texture = this.textures[round % this.textures.length];
        return this;
    }
    update(dt) {
        if(this.playing) {
            this.currentFrame += this.animationSpeed; // * dt;
            let round = (this.currentFrame + 0.5) | 0;
            this.currentFrame = this.currentFrame % this.textures.length;
            if(this.loop || round < this.textures.length) {
                this.texture = this.textures[round % this.textures.length];
            }
            else if(round >= this.textures.length) {
                this.gotoAndStop(this.textures.length - 1);
                if (this.onComplete) this.onComplete();
            }
        }
        return this;
    }
};

Q.Text = class extends Q.Sprite {
    constructor(text, style, x, y) {
        let canvas = document.createElement('canvas');
        super(canvas, x, y);

        this.canvas = canvas
        this.context = this.canvas.getContext('2d');
        this._text = null;
        this._style = null;

        this.text = text;
        this.style = style;
    }
    get width() {
        if(this.dirty) {
            this.updateText();
        }
        return this.scale.x * this._texture.frame.w;
    }
    set width(value) {
        this.scale.x = value / this._texture.frame.w;
        this._width = value;
    }
    get height() {
        if(this.dirty) {
            this.updateText();
        }
        return this.scale.y * this._texture.frame.h;
    }
    set height(value) {
        this.scale.y = value / this._texture.frame.h;
        this._height = value;
    }
    get style() {
        return this._style;
    }
    set style(style) {
        style = style || {};

        if (typeof style.fill === 'number') {
            style.fill = Q.utils.hex2string(style.fill);
        }

        if (typeof style.stroke === 'number') {
            style.stroke = Q.utils.hex2string(style.stroke);
        }

        if (typeof style.dropShadowColor === 'number') {
            style.dropShadowColor = Q.utils.hex2string(style.dropShadowColor);
        }

        style.font = style.font || 'bold 20pt Arial';
        style.fill = style.fill || 'black';
        style.align = style.align || 'left';
        style.stroke = style.stroke || 'black'; 
        style.strokeThickness = style.strokeThickness || 0;
        style.wordWrap = style.wordWrap || false;
        style.wordWrapWidth = style.wordWrapWidth || 100;
        
        style.breakWords = style.breakWords || false;
        style.letterSpacing = style.letterSpacing || 0;

        style.dropShadow = style.dropShadow || false;
        style.dropShadowColor = style.dropShadowColor || '#000000';
        style.dropShadowAngle = style.dropShadowAngle !== undefined ? style.dropShadowAngle : Math.PI / 6;
        style.dropShadowDistance = style.dropShadowDistance !== undefined ? style.dropShadowDistance : 5;
        style.dropShadowBlur = style.dropShadowBlur !== undefined ? style.dropShadowBlur : 0;

        style.padding = style.padding || 0;

        style.textBaseline = style.textBaseline || 'alphabetic';

        style.lineJoin = style.lineJoin || 'miter';
        style.miterLimit = style.miterLimit || 10;

        this._style = style;
        this.dirty = true;
    }
    get text() {
        return this._text;
    }
    set text(value) {
        value = value.toString() || ' ';
        if(this._text === value) return;
        this._text = value;
        this.dirty = true;
    }
    updateText() {
        let style = this._style;
        this.context.font = style.font;

        let outputText = style.wordWrap ? this.wordWrap(this._text) : this._text;

        //split text into lines
        let lines = outputText.split(/(?:\r\n|\r|\n)/);

        //calculate text width
        let lineWidths = new Array(lines.length);
        let maxLineWidth = 0;
        let fontProperties = this.determineFontProperties(style.font);
        for (let i = 0; i < lines.length; i++) {
            let lineWidth = this.context.measureText(lines[i]).width + ((lines[i].length - 1) * style.letterSpacing);
            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }

        let width = maxLineWidth + style.strokeThickness;
        if (style.dropShadow) {
            width += style.dropShadowDistance;
        }

        this.canvas.width = Math.ceil( ( width + this.context.lineWidth )); 

        // calculate text height
        let lineHeight = this.style.lineHeight || fontProperties.fontSize + style.strokeThickness;

        let height = lineHeight * lines.length;
        if (style.dropShadow) {
            height += style.dropShadowDistance;
        }

        this.canvas.height = Math.ceil((height + this._style.padding * 2)); 

        this.context.font = style.font;
        this.context.strokeStyle = style.stroke;
        this.context.lineWidth = style.strokeThickness;
        this.context.textBaseline = style.textBaseline;
        this.context.lineJoin = style.lineJoin;
        this.context.miterLimit = style.miterLimit;

        let linePositionX;
        let linePositionY;

        if (style.dropShadow) {
            if (style.dropShadowBlur > 0) {
                this.context.shadowColor = style.dropShadowColor;
                this.context.shadowBlur = style.dropShadowBlur;
            } 
            else {
                this.context.fillStyle = style.dropShadowColor;
            }

            let xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
            let yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

            for (let i = 0; i < lines.length; i++) {
                linePositionX = style.strokeThickness / 2;
                linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

                if (style.align === 'right') {
                    linePositionX += maxLineWidth - lineWidths[i];
                }
                else if (style.align === 'center') {
                    linePositionX += (maxLineWidth - lineWidths[i]) / 2;
                }

                if (style.fill) {
                    this.drawLetterSpacing(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset + style.padding);
                }
            }
        }

        //set canvas text styles
        this.context.fillStyle = style.fill;

        //draw lines line by line
        for (let i = 0; i < lines.length; i++) {
            linePositionX = style.strokeThickness / 2;
            linePositionY = (style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

            if (style.align === 'right') {
                linePositionX += maxLineWidth - lineWidths[i];
            }
            else if (style.align === 'center') {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }

            if (style.stroke && style.strokeThickness) {
                this.drawLetterSpacing(lines[i], linePositionX, linePositionY + style.padding, true);
            }

            if (style.fill) {
                this.drawLetterSpacing(lines[i], linePositionX, linePositionY + style.padding);
            }
        }

        this.updateTexture();
    }
    drawLetterSpacing(text, x, y, isStroke) {
        let style = this._style;

        // letterSpacing of 0 means normal
        let letterSpacing = style.letterSpacing;

        if (letterSpacing === 0) {
            if (isStroke) {
                this.context.strokeText(text, x, y);
            }
            else {
                this.context.fillText(text, x, y);
            }
            return;
        }

        let characters = String.prototype.split.call(text, ''),
            index = 0,
            current,
            currentPosition = x;

        while (index < text.length) {
            current = characters[index++];
            if (isStroke)  {
                this.context.strokeText(current, currentPosition, y);
            }
            else {
                this.context.fillText(current, currentPosition, y);
            }
            currentPosition += this.context.measureText(current).width + letterSpacing;
        }
    }
    updateTexture() {
        this.texture = this.canvas;
        this.dirty = false;
    }
    updateTransform() {
        if(this.dirty) {
            this.updateText();
        }

        super.updateTransform();
    }
    determineFontProperties(fontStyle) {
        let properties = Q.Text.fontPropertiesCache[fontStyle];

        if (!properties) {
            properties = {};

            let canvas = Q.Text.fontPropertiesCanvas;
            let context = Q.Text.fontPropertiesContext;

            context.font = fontStyle;

            let width = Math.ceil(context.measureText('|MÉq').width);
            let baseline = Math.ceil(context.measureText('M').width);
            let height = 2 * baseline;

            baseline = baseline * 1.4 | 0;

            canvas.width = width;
            canvas.height = height;

            context.fillStyle = '#f00';
            context.fillRect(0, 0, width, height);

            context.font = fontStyle;

            context.textBaseline = 'alphabetic';
            context.fillStyle = '#000';
            context.fillText('|MÉq', 0, baseline);

            let imagedata = context.getImageData(0, 0, width, height).data;
            let pixels = imagedata.length;
            let line = width * 4;

            let i, j;

            let idx = 0;
            let stop = false;

            // ascent. scan from top to bottom until we find a non red pixel
            for (i = 0; i < baseline; i++) {
                for (j = 0; j < line; j += 4) {
                    if (imagedata[idx + j] !== 255) {
                        stop = true;
                        break;
                    }
                }
                if (!stop) {
                    idx += line;
                }
                else {
                    break;
                }
            }

            properties.ascent = baseline - i;

            idx = pixels - line;
            stop = false;

            // descent. scan from bottom to top until we find a non red pixel
            for (i = height; i > baseline; i--) {
                for (j = 0; j < line; j += 4) {
                    if (imagedata[idx + j] !== 255) {
                        stop = true;
                        break;
                    }
                }
                if (!stop) {
                    idx -= line;
                }
                else {
                    break;
                }
            }

            properties.descent = i - baseline;
            properties.fontSize = properties.ascent + properties.descent;

            Q.Text.fontPropertiesCache[fontStyle] = properties;
        }

        return properties;
    }
    wordWrap(text) {
        let result = '';
        let lines = text.split('\n');
        let wordWrapWidth = this._style.wordWrapWidth;
        for (let i = 0; i < lines.length; i++) {
            let spaceLeft = wordWrapWidth;
            let words = lines[i].split(' ');
            for (let j = 0; j < words.length; j++) {
                let wordWidth = this.context.measureText(words[j]).width;
                if (this._style.breakWords && wordWidth > wordWrapWidth) {
                    // Word should be split in the middle
                    let characters = words[j].split('');
                    for (let c = 0; c < characters.length; c++) {
                      let characterWidth = this.context.measureText(characters[c]).width;
                      if (characterWidth > spaceLeft) {
                        result += '\n' + characters[c];
                        spaceLeft = wordWrapWidth - characterWidth;
                      } 
                      else {
                        if (c === 0) {
                          result += ' ';
                        }
                        result += characters[c];
                        spaceLeft -= characterWidth;
                      }
                    }
                }
                else {
                    let wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;
                    if (j === 0 || wordWidthWithSpace > spaceLeft) {
                        // Skip printing the newline if it's the first word of the line that is
                        // greater than the word wrap width.
                        if (j > 0) {
                            result += '\n';
                        }
                        result += words[j];
                        spaceLeft = wordWrapWidth - wordWidth;
                    }
                    else {
                        spaceLeft -= wordWidthWithSpace;
                        result += ' ' + words[j];
                    }
                }
            }

            if (i < lines.length-1) {
                result += '\n';
            }
        }
        return result;
    }
    getBounds(matrix) {
        if (this.dirty) {
            this.updateText();
        }

        return super.getBounds(matrix);
    }
};
Q.Text.fontPropertiesCache = {};
Q.Text.fontPropertiesCanvas = document.createElement('canvas');
Q.Text.fontPropertiesContext = Q.Text.fontPropertiesCanvas.getContext('2d');

Q.text = function(source, style, x, y) {
    //Create the sprite
    let sprite = new Q.Text(source, style, x, y);

    //Add the sprite to the stage
    Q.stage.addChild(sprite);

    //Return the sprite to the main program
    return sprite;
};

Q.Graphics = class extends Q.Container {
    constructor() {
        super();

        this.fillAlpha = 1;
        this.lineWidth = 0;
        this.lineColor = 0;
        this.graphicsData = [];
        this.currentPath = {points: []};
        this._localBounds = new Q.Rectangle(0, 0, 1, 1);
        this.boundsPadding = 0;
    }
    lineStyle(lineWidth = 0, color = 0, alpha = 1) {
        if (!this.currentPath.points.length) this.graphicsData.pop();

        this.lineWidth = lineWidth;
        this.lineColor = color;
        this.lineAlpha = alpha;

        this.currentPath = {
            lineWidth: this.lineWidth, 
            lineColor: this.lineColor, 
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor, 
            fillAlpha: this.fillAlpha, 
            fill: this.filling, 
            points: [], 
            type: Q.Graphics.POLY
        };

        this.graphicsData.push(this.currentPath);
        return this;
    }
    moveTo(x, y) {
        if (!this.currentPath.points.length) this.graphicsData.pop();

        this.currentPath = {
            lineWidth: this.lineWidth, 
            lineColor: this.lineColor, 
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor, 
            fillAlpha: this.fillAlpha, 
            fill: this.filling, 
            points: [], 
            type: Q.Graphics.POLY
        };

        this.currentPath.points.push(x, y);

        this.graphicsData.push(this.currentPath);
        return this;
    }
    lineTo(x, y) {
        this.currentPath.points.push(x, y);
        this.dirty = true;
        return this;
    }
    beginFill(color = 0, alpha = 1) {
        this.filling = true;
        this.fillColor = color;
        this.fillAlpha = alpha;
        return this;
    }
    endFill() {
        this.filling = false;
        this.fillColor = null;
        this.fillAlpha = 1;
        return this;
    }
    drawRect(x, y, width, height) {
        if (!this.currentPath.points.length) this.graphicsData.pop();

        this.currentPath = {
            lineWidth: this.lineWidth, 
            lineColor: this.lineColor, 
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor, 
            fillAlpha: this.fillAlpha, 
            fill: this.filling,
            points: [x, y, width, height], 
            type: Q.Graphics.RECT
        };

        this.graphicsData.push(this.currentPath);
        this.dirty = true;
        return this;
    }
    drawCircle(x, y, radius) {
        if (!this.currentPath.points.length) this.graphicsData.pop();

        this.currentPath = {
            lineWidth: this.lineWidth, 
            lineColor: this.lineColor, 
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor, 
            fillAlpha: this.fillAlpha, 
            fill: this.filling,
            points: [x, y, radius, radius], 
            type: Q.Graphics.CIRC
        };

        this.graphicsData.push(this.currentPath);
        this.dirty = true;
        return this;
    }
    drawEllipse(x, y, width, height) {
        if (!this.currentPath.points.length) this.graphicsData.pop();

        this.currentPath = {
            lineWidth: this.lineWidth, 
            lineColor: this.lineColor, 
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor, 
            fillAlpha: this.fillAlpha, 
            fill: this.filling,
            points: [x, y, width, height], 
            type: Q.Graphics.ELIP};

        this.graphicsData.push(this.currentPath);
        this.dirty = true;
        return this;
    }
    clear() {
        this.lineWidth = 0;
        this.filling = false;

        this.dirty = true;
        this.clearDirty = true;
        this.graphicsData = [];

        return this;
    }
    generateTexture() {
        let bounds = this.getLocalBounds(),
            canvas = document.createElement('canvas');

        canvas.context = canvas.getContext('2d');
        canvas.width = bounds.width;
        canvas.height = bounds.height;
        canvas.context.translate(-bounds.x, -bounds.y);
        
        this.render(canvas.context);

        return canvas;
    }
    updateLocalBounds() {
        let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity,

            points, x, y, w, h;

        for (let i = 0; i < this.graphicsData.length; i++) {
            let data = this.graphicsData[i],
                type = data.type,
                lineWidth = data.lineWidth;

            points = data.points;

            if(type === Q.Graphics.RECT) {
                x = points[0] - lineWidth/2;
                y = points[1] - lineWidth/2;
                w = points[2] + lineWidth;
                h = points[3] + lineWidth;

                minX = x < minX ? x : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y < minY ? x : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if(type === Q.Graphics.CIRC || type === Q.Graphics.ELIP) {
                x = points[0];
                y = points[1];
                w = points[2] + lineWidth/2;
                h = points[3] + lineWidth/2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else {
                // POLY
                for (let j = 0; j < points.length; j+=2) {
                    x = points[j];
                    y = points[j+1];
                    minX = x-lineWidth < minX ? x-lineWidth : minX;
                    maxX = x+lineWidth > maxX ? x+lineWidth : maxX;

                    minY = y-lineWidth < minY ? y-lineWidth : minY;
                    maxY = y+lineWidth > maxY ? y+lineWidth : maxY;
                }
            }
        }

        let padding = this.boundsPadding;

        this._localBounds.x = minX - padding;
        this._localBounds.width = (maxX - minX) + padding * 2;

        this._localBounds.y = minY - padding;
        this._localBounds.height = (maxY - minY) + padding * 2;
    }
    getBounds(matrix) {
        if(!this._currentBounds) {
            this.updateLocalBounds();

            let bounds = this._localBounds,
                w0 = bounds.x,
                w1 = bounds.width + bounds.x,
                h0 = bounds.y,
                h1 = bounds.height + bounds.y,

                worldTransform = matrix || this.worldTransform,

                a = worldTransform.a,
                b = worldTransform.b,
                c = worldTransform.c,
                d = worldTransform.d,
                tx = worldTransform.tx,
                ty = worldTransform.ty,

                x1 = a * w1 + c * h1 + tx,
                y1 = d * h1 + b * w1 + ty,

                x2 = a * w0 + c * h1 + tx,
                y2 = d * h1 + b * w0 + ty,

                x3 = a * w0 + c * h0 + tx,
                y3 = d * h0 + b * w0 + ty,

                x4 =  a * w1 + c * h0 + tx,
                y4 =  d * h0 + b * w1 + ty,

                maxX = x1,
                maxY = y1,
                minX = x1,
                minY = y1;

            minX = x2 < minX ? x2 : minX;
            minX = x3 < minX ? x3 : minX;
            minX = x4 < minX ? x4 : minX;

            minY = y2 < minY ? y2 : minY;
            minY = y3 < minY ? y3 : minY;
            minY = y4 < minY ? y4 : minY;

            maxX = x2 > maxX ? x2 : maxX;
            maxX = x3 > maxX ? x3 : maxX;
            maxX = x4 > maxX ? x4 : maxX;

            maxY = y2 > maxY ? y2 : maxY;
            maxY = y3 > maxY ? y3 : maxY;
            maxY = y4 > maxY ? y4 : maxY;

            this._bounds.x = minX;
            this._bounds.width = maxX - minX;

            this._bounds.y = minY;
            this._bounds.height = maxY - minY;

            this._currentBounds = this._bounds;
        }
        return this._currentBounds;
    }
    render(context) {
        let color = '',
            worldAlpha = this.worldAlpha;

        for (let i = 0; i < this.graphicsData.length; i++) {
            let data = this.graphicsData[i],
                points = data.points;

            context.strokeStyle = color = '#' + ('00000' + (data.lineColor | 0).toString(16)).substr(-6);

            context.lineWidth = data.lineWidth;

            if(data.type === Q.Graphics.POLY) {
                context.beginPath();

                context.moveTo(points[0], points[1]);

                for (let j=1; j < points.length/2; j++) {
                    context.lineTo(points[j * 2], points[j * 2 + 1]);
                }

                // if the first and last point are the same close the path - much neater :)
                if(points[0] === points[points.length-2] && points[1] === points[points.length-1]) {
                    context.closePath();
                }

                if(data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = color = '#' + ('00000' + (data.fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if(data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.stroke();
                }
            }
            else if(data.type === Q.Graphics.RECT) {
                if(data.fillColor || data.fillColor === 0) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = color = '#' + ('00000' + (data.fillColor | 0).toString(16)).substr(-6);
                    context.fillRect(points[0], points[1], points[2], points[3]);

                }
                if(data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeRect(points[0], points[1], points[2], points[3]);
                }

            }
            else if(data.type === Q.Graphics.CIRC) {
                // TODO - need to be Undefined!
                context.beginPath();
                context.arc(points[0], points[1], points[2],0,2*Math.PI);
                context.closePath();

                if(data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = color = '#' + ('00000' + (data.fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if(data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.stroke();
                }
            }
            else if(data.type === Q.Graphics.ELIP) {
                let ellipseData =  data.points,

                    w = ellipseData[2] * 2,
                    h = ellipseData[3] * 2,

                    x = ellipseData[0] - w/2,
                    y = ellipseData[1] - h/2;

                context.beginPath();

                let kappa = 0.5522848,
                    ox = (w / 2) * kappa, // control point offset horizontal
                    oy = (h / 2) * kappa, // control point offset vertical
                    xe = x + w,           // x-end
                    ye = y + h,           // y-end
                    xm = x + w / 2,       // x-middle
                    ym = y + h / 2;       // y-middle

                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

                context.closePath();

                if(data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = color = '#' + ('00000' + (data.fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if(data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.stroke();
                }
            }
        }
    }
}
Q.Graphics.POLY = 0;
Q.Graphics.RECT = 1;
Q.Graphics.CIRC = 2;
Q.Graphics.ELIP = 3;

Q.graphics = function() {
    let sprite = new Q.Graphics();
    
    Q.stage.addChild(sprite);

    return sprite;
};

class Pointer {
    constructor(element, scale = 1) {
        this._x = 0,
        this._y = 0,

        this.isDown = false,
        this.isUp = true,
        this.tapped = false,

        //Properties to help measure the time between up and down states
        this.downTime = 0,
        this.elapsedTime = 0,

        //Optional `press`,`release` and `tap` methods
        this.press = undefined,
        this.release = undefined,
        this.tap = undefined,

        //A `dragSprite` property to help with drag and drop
        this.dragSprite = null,

        //The drag offsets to help drag sprites
        this.dragOffsetX = 0,
        this.dragOffsetY = 0,

        this.element = element;
        this.scale = scale;

        this.element.addEventListener(
            'mousemove', this.moveHandler.bind(this), false
        );
        this.element.addEventListener(
            'mousedown', this.downHandler.bind(this), false
        );

        //Add the `mouseup` event to the `window` to
        //catch a mouse button release outside of the canvas area
        window.addEventListener(
            'mouseup', this.upHandler.bind(this), false
        );

        //Touch events
        this.element.addEventListener(
            'touchmove', this.touchmoveHandler.bind(this), false
        );
        this.element.addEventListener(
            'touchstart', this.touchstartHandler.bind(this), false
        );

        //Add the `touchend` event to the `window` object to
        //catch a mouse button release outside of the canvas area
        window.addEventListener(
            'touchend', this.touchendHandler.bind(this), false
        );

        //Disable the default pan and zoom actions on the `canvas`
        this.element.style.touchAction = 'none';
    }
    get x() {
        return this._x / this.scale;
    }
    get y() {
        return this._y / this.scale;
    }
    get width() {
        return 1;
    }
    get height() {
        return 1;
    }
    get centerX() {
        return this.x;
    }
    get centerY() {
        return this.y;
    }
    get position() {
        return {x: this.x, y: this.y};
    }
    get cursor() {
        return this.element.style.cursor;
    }
    set cursor(value) {
        this.element.style.cursor = value;
    }
    moveHandler(event) {
        //Get the element that's firing the event
        let element = event.target;
        // let rect = event.target.getBoundingClientRect();

        //Find the pointer’s x and y position (for mouse).
        //Subtract the element's top and left offset from the browser window
        this._x = (event.pageX - element.offsetLeft);
        this._y = (event.pageY - element.offsetTop);

        // this._x = (event.clientX - rect.left);
        // this._y = (event.clientY - rect.top);

        //Prevent the event's default behavior 
        event.preventDefault();
    }
    touchmoveHandler(event) {
        let element = event.target;
        // let rect = event.target.getBoundingClientRect();

        //Find the touch point's x and y position
        this._x = (event.targetTouches[0].pageX - element.offsetLeft);
        this._y = (event.targetTouches[0].pageY - element.offsetTop);

        // this._x = (event.targetTouches[0].clientX - rect.left);
        // this._y = (event.targetTouches[0].clientY - rect.top);

        event.preventDefault();
    }
    downHandler(event) {
        //Set the down states
        this.isDown = true;
        this.isUp = false;
        this.tapped = false;

        //Capture the current time
        this.downTime = Date.now();

        //Call the `press` method if it's been assigned
        if (this.press) this.press();
        event.preventDefault();
    }
    touchstartHandler(event) {
        let element = event.target;
        // let rect = event.target.getBoundingClientRect();
        
        //Find the touch point's x and y position
        this._x = event.targetTouches[0].pageX - element.offsetLeft;
        this._y = event.targetTouches[0].pageY - element.offsetTop;

        // this._x = (event.targetTouches[0].clientX - rect.left);
        // this._y = (event.targetTouches[0].clientY - rect.top);

        //Set the down states
        this.isDown = true;
        this.isUp = false;
        this.tapped = false;

        //Capture the current time
        this.downTime = Date.now();

        //Call the `press` method if it's been assigned
        if (this.press) this.press();
        event.preventDefault();
    }
    upHandler(event) {
        //Figure out how much time the pointer has been down
        this.elapsedTime = Math.abs(this.downTime - Date.now());

        //If it's less than 200 milliseconds, it must be a tap or click
        if (this.elapsedTime <= 200 && this.tapped === false) {
            this.tapped = true;

            //Call the `tap` method if it's been assigned
            if (this.tap) this.tap(); 
        }
        this.isUp = true;
        this.isDown = false;

        //Call the `release` method if it's been assigned
        if (this.release) this.release();
        event.preventDefault();
    }
    touchendHandler(event) {
        //Figure out how much time the pointer has been down
        this.elapsedTime = Math.abs(this.downTime - Date.now());

        //If it's less than 200 milliseconds, it must be a tap or click
        if (this.elapsedTime <= 200 && this.tapped === false) {
            this.tapped = true;

            //Call the `tap` method if it's been assigned
            if (this.tap) this.tap(); 
        }
        this.isUp = true;
        this.isDown = false;

        //Call the `release` method if it's been assigned
        if (this.release) this.release();
        event.preventDefault();
    }
    hitTestSprite(sprite) {
        //The `hit` variable will become `true` if the pointer is
        //touching the sprite and remain `false` if it isn't
        let hit = false;

        //Is the sprite rectangular?
        if (!sprite.circular) {
            //Get the position of the sprite's edges using global
            //coordinates
            let left = sprite.gx,
            right = sprite.gx + sprite.width,
            top = sprite.gy,
            bottom = sprite.gy + sprite.height;

            //Find out if the pointer is intersecting the rectangle.
            //`hit` will become `true` if the pointer is inside the
            //sprite's area
            hit 
            = this.x > left && this.x < right 
            && this.y > top && this.y < bottom;
        }
        //Is the sprite circular?
        else {
            //Find the distance between the pointer and the
            //center of the circle
            let dx = this.x - (sprite.gx + sprite.radius),
                dy = this.y - (sprite.gy + sprite.radius),

            distance = Math.sqrt(dx * dx + dy * dy);

            //The pointer is intersecting the circle if the
            //distance is less than the circle's radius
            hit = distance < sprite.radius;
        }
        return hit;
    }
    updateDragAndDrop() {
        //Check whether the pointer is pressed down
        if (this.isDown) {
            //You need to capture the co-ordinates at which the pointer was
            //pressed down and find out if it's touching a sprite

            //Only run this code if the pointer isn't already dragging
            //sprite
            if (this.dragSprite === null) {
                //Loop through the `draggableSprites` in reverse to start searching at the bottom of the stack
                for (let i = Q.draggableSprites.length - 1; i > -1; i--) {
                    let sprite = Q.draggableSprites[i];

                    //Check for a collision with the pointer using `hitTestSprite`
                    if (this.hitTestSprite(sprite) && sprite.draggable) {
                        //Calculate the difference between the pointer's
                        //position and the sprite's position
                        this.dragOffsetX = this.x - sprite.gx;
                        this.dragOffsetY = this.y - sprite.gy;

                        //Set the sprite as the pointer's `dragSprite` property
                        this.dragSprite = sprite;

                        //The next two lines re-order the `sprites` array so that the
                        //selected sprite is displayed above all the others.
                        //First, splice the sprite out of its current position in
                        //its parent's `children` array
                        let children = sprite.parent.children;
                        children.splice(children.indexOf(sprite), 1);

                        //Next, push the `dragSprite` to the end of its `children` array so that it's
                        //displayed last, above all the other sprites
                        children.push(sprite);

                        //Reorganize the `draggableSpites` array in the same way
                        Q.draggableSprites.splice(Q.draggableSprites.indexOf(sprite), 1);
                        Q.draggableSprites.push(sprite);

                        //Break the loop, because we only need to drag the topmost sprite
                        break;
                    }
                }
            } 
            //If the pointer is down and it has a `dragSprite`, make the sprite follow the pointer's
            //position, with the calculated offset
            else {
                this.dragSprite.x = this.x - this.dragOffsetX;
                this.dragSprite.y = this.y - this.dragOffsetY;
            }
        }

        //If the pointer is up, drop the `dragSprite` by setting it to `null`
        if (this.isUp) {
            this.dragSprite = null;
        }

        //Change the mouse arrow pointer to a hand if it's over a
        //draggable sprite
        Q.draggableSprites.some(sprite => {
            if (this.hitTestSprite(sprite) && sprite.draggable) {
                this.cursor = 'pointer';
                return true;
            } 
            else {
                this.cursor = 'auto';
                return false;
            }
        });
    }
}

let Interaction = {
    press: null,
    release: null,
    over: null,
    out: null,
    tap: null,
    state: 'up',
    action: '',
    pressed: false,
    hoverOver: false,
    type: '',

    update(pointer, canvas) {
        //Figure out if the pointer is touching the sprite
        let hit = pointer.hitTestSprite(this);

        //1. Figure out the current state
        if (pointer.isUp) {
            //Up state
            this.state = 'up';

            //Show the first image state frame, if this is a `Button` sprite
            if (this.type === 'button') this.gotoAndStop(0);
        }

        //If the pointer is touching the sprite, figure out
        //if the over or down state should be displayed
        if (hit) {
            //Over state
            this.state = 'over';

            //Show the second image state frame if this sprite has
            //3 frames and it's a `Button` sprite
            if (this.frames && this.frames.length === 3 && this.type === 'button') {
                this.gotoAndStop(1);
            }

            //Down state
            if (pointer.isDown) {
                this.state = 'down';

                //Show the third frame if this sprite is a `Button` sprite 
                //and it has only three frames, or show the second frame
                //if it only has two frames
                if(this.type === 'button') {
                    if (this.frames.length === 3) {
                        this.gotoAndStop(2);
                    } 
                    else {
                        this.gotoAndStop(1);
                    }
                }
            }
            pointer.cursor = 'pointer';
        }
        else {
            pointer.cursor = 'auto';
        }

        //Perform the correct interactive action

        //a. Run the `press` method if the sprite state is 'down' and
        //the sprite hasn't already been pressed
        if (this.state === 'down') {
            if (!this.pressed) {
                if (this.press) this.press();
                this.pressed = true;
                this.action = 'pressed';
            }
        }

        //b. Run the `release` method if the sprite state is 'over' and
        //the sprite has been pressed
        if (this.state === 'over') {
            if (this.pressed) {
                if (this.release) this.release();
                this.pressed = false;
                this.action = 'released';
                //If the pointer was tapped and the user assigned 
                //a `tap` method, call the `tap` method
                if (pointer.tapped && this.tap) this.tap();
            }

            //Run the `over` method if it has been assigned
            if (!this.hoverOver) {
                if (this.over) this.over();
                this.hoverOver = true;
            }
        }

        //c. Check whether the pointer has been released outside
        //the sprite's area. If the button state is 'up' and it's
        //already been pressed, then run the `release` method.
        if (this.state === 'up') {
            if (this.pressed) {
                if (this.release) this.release();
                this.pressed = false;
                this.action = 'released';
            }

            //Run the `out` method if it has been assigned
            if (this.hoverOver) {
                if (this.out) this.out();
                this.hoverOver = false;
            }
        }
    }
};

Q.Keyboard = class {
    constructor(keyCode) {
        this.code = keyCode;
        this.isDown = false;
        this.isUp = true;
        this.press = undefined;
        this.release = undefined;
        
        //Attach event listeners
        window.addEventListener(
            'keydown', this.downHandler.bind(this), false
        );
        window.addEventListener(
            'keyup', this.upHandler.bind(this), false
        );
    }
    downHandler(event) {
        if (event.keyCode === this.code) {
            if (this.isUp && this.press) this.press();
            this.isDown = true;
            this.isUp = false;
        }
        //Prevent the event's default behavior
        event.preventDefault();
    }
    upHandler(event) {
        if (event.keyCode === this.code) {
            if (this.isDown && this.release) this.release();
            this.isDown = false;
            this.isUp = true;
        }
        event.preventDefault();
    }
};

Q.image = function(imageFileName) {
    return Q.Assets.cache[imageFileName];
};

Q.json = function(jsonFileName) {
    return Q.Assets.cache[jsonFileName];
};

Q.sound = function(soundFileName) {
    return Q.Assets.cache[soundFileName];
};

Q.Assets = {
    //Properties to help track the assets being loaded
    toLoad: 0,
    loaded: 0,

    cache: {},

    //File extensions for different types of assets
    imageExtensions: ['png', 'jpg', 'gif'],
    fontExtensions: ['ttf', 'otf', 'ttc', 'woff'],
    jsonExtensions: ['json'],
    audioExtensions: ['mp3', 'ogg', 'wav', 'webm'],

    load(sources) {
        if(!sources) throw new Error('Provide assets to load.');
        return new Promise(resolve => {
            let loadHandler = () => {
                this.loaded += 1;
                console.log(this.loaded);

                //Check whether everything has loaded
                if (this.toLoad === this.loaded) {
                    //Reset `toLoad` and `loaded` to `0` so you can use them
                    //to load more assets later if you need to
                    this.toLoad = 0;
                    this.loaded = 0;      
                    console.log('Assets finished loading.');

                    //Resolve the promise
                    resolve();
                } 
            };
            console.log('Loading assets...');
            //Find the number of files that need to be loaded
            this.toLoad = sources.length;

            //Loop through all the source file names and find out how
            //they should be interpreted
            sources.forEach(source => {
                let extension = source.split('.').pop().toLowerCase();

                //Load images
                if (this.imageExtensions.indexOf(extension) !== -1) {
                    this.loadImage(source, loadHandler);
                }
                //Load fonts 
                else if (this.fontExtensions.indexOf(extension) !== -1) {
                    this.loadFont(source, loadHandler);
                }
                //Load JSON files  
                else if (this.jsonExtensions.indexOf(extension) !== -1) {
                    this.loadJson(source, loadHandler);
                }
                //Load audio files  
                else if (this.audioExtensions.indexOf(extension) !== -1) {
                    this.loadSound(source, loadHandler);
                }
                //Display a message if a file type isn't recognized
                else {
                    console.log('File type not recognized: ' + source);
                }
            });
        });
    },
    loadImage(source, loadHandler) {
        let image = new Image();
        image.addEventListener('load', () => {
            image.name = source;
            this.cache[image.name] = {
                source: image,
                frame: {x: 0, y: 0, w: image.width, h: image.height}
            };
            loadHandler();
        }, false);
        image.src = source;
    },
    loadFont(source, loadHandler) {
        //Use the font's file name as the `fontFamily` name
        let fontFamily = source.split('/').pop().split('.')[0];
        //Append an `@afont-face` style rule to the head of the HTML
        //document. It's kind of a hack, but until HTML5 has a
        //proper font loading API, it will do for now
        let newStyle = document.createElement('style');
        let fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";
        newStyle.appendChild(document.createTextNode(fontFace));
        document.head.appendChild(newStyle);
        //Tell the `loadHandler` we're loading a font
        loadHandler();
    },
    loadJson(source, loadHandler) {
        //Create a new `xhr` object and an object to store the file
        let xhr = new XMLHttpRequest();

        //Use xhr to load the JSON file
        xhr.open('GET', source, true);

        //Tell xhr that it's a text file
        xhr.responseType = 'text';

        xhr.onload = event => {
            //Check to make sure the file has loaded properly
            if (xhr.status === 200) {
                //Convert the JSON data file into an ordinary object
                let file = JSON.parse(xhr.responseText);
                //Get the file name
                file.name = source;
                //Assign the file as a property of the assets object so
                //you can access it like this: `assets['file.json']`
                this.cache[file.name] = file;
                //Texture atlas support:
                //If the JSON file has a `frames` property then 
                //it's in Texture Packer format
                if (file.frames) {
                    //Create the tileset frames
                    this.createTilesetFrames(file, source, loadHandler);
                } 
                else {
                    //Alert the load handler that the file has loaded
                    loadHandler();
                }
            }
        };
        //Send the request to load the file
        xhr.send();
    },
    createTilesetFrames(file, source, loadHandler) {
        //Get the tileset image's file path
        let baseUrl = source.replace(/[^\/]*$/, '');

        //Here's how this regular expression works:
        //http://stackoverflow.com/questions/7601674/id-like-to-remove-the-filename-from-a-path-using-javascript

        //Use the `baseUrl` and `image` name property from the JSON 
        //file's `meta` object to construct the full image source path 
        let imageSource = baseUrl + file.meta.image;
        let image = new Image();

        //The image's load handler
        let imageLoadHandler = () => {
            //Assign the image as a property of the `assets` object so
            //you can access it like this:
            //`assets['images/imageName.png']`
            this.cache[imageSource] = {
                source: image,
                frame: {x: 0, y: 0, w: image.width, h: image.height}
            };

            //Loop through all the frames
            Object.keys(file.frames).forEach(frame => {
                //The `frame` object contains all the size and position
                //data for each sub-image.
                //Add the frame data to the asset object so that you
                //can access it later like this: `assets['frameName.png']`
                this.cache[frame] = file.frames[frame];

                //Get a reference to the source so that it will be easy for
                //us to access it later
                this.cache[frame].source = image;
            });
            //Alert the load handler that the file has loaded
            loadHandler();
        };

        //Load the tileset image
        image.addEventListener('load', imageLoadHandler, false);
        image.src = imageSource;
    },
    loadSound(source, loadHandler) {
        let sound = new Sound(source, loadHandler);

        //Get the sound file name.
        sound.name = source;
        this.cache[sound.name] = sound;
    }
};

//audio context
let actx = null;

class Sound {
    constructor(source, loadHandler) {
        //Assign the `source` and `loadHandler` values to this object 
        this.source = source;
        this.loadHandler = loadHandler;

        //Set the default properties
        this.actx = actx;
        this.volumeNode = this.actx.createGain();
        this.panNode = this.actx.createStereoPanner();
        this.convolverNode = this.actx.createConvolver();
        this.delayNode = this.actx.createDelay();
        this.feedbackNode = this.actx.createGain();
        this.filterNode = this.actx.createBiquadFilter();
        //this.panNode.panningModel = 'equalpower';
        this.soundNode = null;
        this.buffer = null;
        this.loop = false;
        this.playing = false;

        //Values for the pan and volume getters/setters
        this.panValue = 0;
        this.volumeValue = 1;

        //Values to help track and set the start and pause times
        this.startTime = 0;
        this.startOffset = 0;

        //The playback rate
        this.playbackRate = 1;
        this.randomPitch = true;

        //Reverb parameters
        this.reverb = false;
        this.reverbImpulse = null;

        //Echo parameters
        this.echo = false;
        this.delayValue = 0.3;
        this.feebackValue = 0.3;
        this.filterValue = 0;

        //Load the sound
        this.load();   
    }
    //The sound object's methods
    load() {
        //Use xhr to load the sound file
        let xhr = new XMLHttpRequest();
        xhr.open('GET', this.source, true);
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('load', () => {
            //Decode the sound and store a reference to the buffer 
            this.actx.decodeAudioData(
                xhr.response, 
                buffer => {
                    this.buffer = buffer;
                    this.hasLoaded = true;

                    //This next bit is optional, but important.
                    //If you have a load manager in your game, call it here so that
                    //the sound is registered as having loaded. 
                    if (this.loadHandler) {
                        this.loadHandler();
                    }
                }, 
                //Throw an error if the sound can't be decoded
                error => {
                    throw new Error('Audio could not be decoded: ' + error);
                }
            );
        });

        //Send the request to load the file
        xhr.send();
    }
    play() {
        //Set the time to start the sound (immediately)
        this.startTime = this.actx.currentTime;

        //Create a sound node 
        this.soundNode = this.actx.createBufferSource();

        //Set the sound node's buffer property to the loaded sound
        this.soundNode.buffer = this.buffer;

        //Connect all the nodes
        this.soundNode.connect(this.volumeNode);
        //If there's no reverb, bypass the convolverNode
        if (this.reverb === false) {
            this.volumeNode.connect(this.panNode);
        } 
        //If there is reverb, connect the `convolverNode` and apply
        //the impulse response
        else {
            this.volumeNode.connect(this.convolverNode);
            this.convolverNode.connect(this.panNode);
            this.convolverNode.buffer = this.reverbImpulse;
        }
        this.panNode.connect(this.actx.destination);

        //To create the echo effect, connect the volume to the 
        //delay, the delay to the feedback, and the feedback to the
        //destination
        if (this.echo) {
            this.feedbackNode.gain.value = this.feebackValue;
            this.delayNode.delayTime.value = this.delayValue;
            this.filterNode.frequency.value = this.filterValue;
            this.delayNode.connect(this.feedbackNode);
            if (this.filterValue > 0) {
                this.feedbackNode.connect(this.filterNode);
                this.filterNode.connect(this.delayNode);
            } 
            else {
                this.feedbackNode.connect(this.delayNode);
            }
            this.volumeNode.connect(this.delayNode);
            this.delayNode.connect(this.panNode);
        }

        //Will the sound loop? This can be `true` or `false`
        this.soundNode.loop = this.loop;

        //Set the playback rate
        this.soundNode.playbackRate.value = this.playbackRate;

        //Finally, use the `start` method to play the sound.
        //The start time will either be `currentTime`,
        //or a later time if the sound was paused
        this.soundNode.start(
            this.startTime, 
            this.startOffset % this.buffer.duration
        );

        //Set `playing` to `true` to help control the 
        //`pause` and `restart` methods
        this.playing = true;
    }
    setReverb(duration = 2, decay = 2, reverse = false) {
        this.reverbImpulse = impulseResponse(duration, decay, reverse);
        this.reverb = true;
    }
    setEcho(delayValue = 0.3, feedbackValue = 0.3, filterValue = 0) {
        this.delayValue = delayValue;
        this.feebackValue = feedbackValue;
        this.filterValue = filterValue;
        this.echo = true;
    }
    pause() {
        //Pause the sound if it's playing, and calculate the
        //`startOffset` to save the current position 
        if (this.playing) {
            this.soundNode.stop(this.actx.currentTime);
            this.startOffset += this.actx.currentTime - this.startTime;
            this.playing = false;
            // console.log(this.startOffset);
        }
    }
    restart() {
        //Stop the sound if it's playing, reset the start and offset times,
        //then call the `play` method again
        if (this.playing) {
            this.soundNode.stop(this.actx.currentTime);
        }
        this.startOffset = 0;
        this.startPoint = 0;
        this.endPoint = this.buffer.duration;
        this.play();
    }
    playFrom(value) {
        if (this.playing) {
            this.soundNode.stop(this.actx.currentTime);
        }
        this.startOffset = value;
        this.play();
    }
    //An experimental `playSection` method used to play a section of a
    //sound
    playSection(start, end) {
        if (this.playing) {
            this.soundNode.stop(this.actx.currentTime);
        }

        if (this.startOffset === 0) this.startOffset = start;

        //Set the time to start the sound (immediately)
        this.startTime = this.actx.currentTime;

        //Create a sound node 
        this.soundNode = this.actx.createBufferSource();

        //Set the sound node's buffer property to the loaded sound
        this.soundNode.buffer = this.buffer;

        //Connect the sound to the pan, connect the pan to the
        //volume, and connect the volume to the destination
        this.soundNode.connect(this.panNode);
        this.panNode.connect(this.volumeNode);
        this.volumeNode.connect(this.actx.destination);

        //Will the sound loop? This can be `true` or `false`
        this.soundNode.loop = this.loop;
        this.soundNode.loopStart = start;
        this.soundNode.loopEnd = end;

        //Find out what the duration of the sound is
        let duration = end - start;

        //Finally, use the `start` method to play the sound.
        //The start time will either be `currentTime`,
        //or a later time if the sound was paused
        this.soundNode.start(
            this.startTime, 
            this.startOffset % this.buffer.duration,
            duration
        );

        //Set `playing` to `true` to help control the 
        //`pause` and `restart` methods
        this.playing = true;
    }
    //Volume and pan getters/setters
    get volume() {
        return this.volumeValue;
    }
    set volume(value) {
        this.volumeNode.gain.value = value;
        this.volumeValue = value;
    }

    get pan() {
        return this.panNode.pan.value;
    }
    set pan(value) {
        this.panNode.pan.value = value;
    }
}

Q.Point = class {
    constructor(x = 0, y = 0) {
        this.set(x, y);
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new Q.Point(this.x, this.y);
    }
};

Q.Rectangle = class {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.set(x, y, width, height);
    }
    set(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;        
    }
    clone() {
        return new Q.Rectangle(this.x, this.y, this.width, this.height);
    }
};
Q.Rectangle.EMPTY = new Q.Rectangle();

Q.Matrix = class {
    constructor() {
        this.a = 1; this.b = 0; this.tx = 0;
        this.c = 0; this.d = 1; this.ty = 0;
    }
    set(a, b, c, d, tx, ty) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;

        return this;
    }
    clone() {
        let matrix = new Q.Matrix();
        
        matrix.a = this.a;
        matrix.b = this.b;
        matrix.c = this.c;
        matrix.d = this.d;
        matrix.tx = this.tx;
        matrix.ty = this.ty;

        return matrix;
    }
    copy(matrix) {
        matrix.a = this.a;
        matrix.b = this.b;
        matrix.c = this.c;
        matrix.d = this.d;
        matrix.tx = this.tx;
        matrix.ty = this.ty;

        return matrix;
    }
    /**
    * Get a new position with the current transformation applied.
    * Can be used to go from a child's coordinate space to the world 
    * coordinate space. (e.g. rendering)
    **/
    apply(pos, newPos) {
        newPos = newPos || new Q.Point();

        let x = pos.x,
            y = pos.y;

        newPos.x = this.a * x + this.c * y + this.tx;
        newPos.y = this.b * x + this.d * y + this.ty;

        return newPos;
    }
    /**
    * Get a new position with the inverse of the current transformation 
    * applied. Can be used to go from the world coordinate space to a child's 
    * coordinate space. (e.g. input)
    **/
    applyInverse(pos, newPos) {
        newPos = newPos || new Q.Point();

        let id = 1 / (this.a * this.d + this.c * -this.b),
            x = pos.x,
            y = pos.y;

        newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
        newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;

        return newPos;
    }
    translate(x, y) {
        this.tx += x;
        this.ty += y;

        return this;
    }
    scale(x, y) {
        this.a *= x;
        this.d *= y;
        this.c *= x;
        this.b *= y;
        this.tx *= x;
        this.ty *= y;

        return this;
    }
    rotate(angle) {
        let cos = Math.cos(angle);
            sin = Math.sin(angle),

            a1 = this.a,
            c1 = this.c,
            tx1 = this.tx;

        this.a = a1 * cos-this.b * sin;
        this.b = a1 * sin+this.b * cos;
        this.c = c1 * cos-this.d * sin;
        this.d = c1 * sin+this.d * cos;
        this.tx = tx1 * cos - this.ty * sin;
        this.ty = tx1 * sin + this.ty * cos;

        return this;
    }
    append(matrix) {
        let a1 = this.a,
            b1 = this.b,
            c1 = this.c,
            d1 = this.d;

        this.a  = matrix.a * a1 + matrix.b * c1;
        this.b  = matrix.a * b1 + matrix.b * d1;
        this.c  = matrix.c * a1 + matrix.d * c1;
        this.d  = matrix.c * b1 + matrix.d * d1;

        this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
        this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;

        return this;
    }
    prepend(matrix) {
        let tx1 = this.tx;

        if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
            let a1 = this.a,
                c1 = this.c;

            this.a  = a1*matrix.a+this.b*matrix.c;
            this.b  = a1*matrix.b+this.b*matrix.d;
            this.c  = c1*matrix.a+this.d*matrix.c;
            this.d  = c1*matrix.b+this.d*matrix.d;
        }

        this.tx = tx1*matrix.a+this.ty*matrix.c+matrix.tx;
        this.ty = tx1*matrix.b+this.ty*matrix.d+matrix.ty;

        return this;
    }
    invert() {
        let a1 = this.a,
            b1 = this.b,
            c1 = this.c,
            d1 = this.d,
            tx1 = this.tx,
            n = a1*d1-b1*c1;

        this.a = d1/n;
        this.b = -b1/n;
        this.c = -c1/n;
        this.d = a1/n;
        this.tx = (c1*this.ty-d1*tx1)/n;
        this.ty = -(a1*this.ty-b1*tx1)/n;

        return this;
    }
    setTransform(context) {
        context.setTransform(
            this.a,
            this.b,
            this.c,
            this.d,
            this.tx,
            this.ty
        );
    }
};

Q.Matrix.IDENTITY = new Q.Matrix();
Q.Matrix.TEMP_MATRIX = new Q.Matrix();

function boot() {
    let vendors = ['ms', 'webkit', 'moz', 'o'];
    for(let x = 0; x < vendors.length && !window.AudioContext; ++x) {
        window.AudioContext = window[vendors[x] + 'AudioContext'];
    }

    //Create the audio context
    actx = new AudioContext();
}

boot();

// root.PIXI = Q;
root.Game = Q;
}).call(this);
