(function(Q) {
'use strict';

var Q = Q || {};

//Center and scale the game engine inside the HTML page 
Q.scaleToWindow = function(backgroundColor = '#2C3539') {
    let scaleX, scaleY, scale, center;

    //1. Scale the canvas to the correct size
    //Figure out the scale amount on each axis
    scaleX = window.innerWidth / Q.canvas.width;
    scaleY = window.innerHeight / Q.canvas.height;

    //Scale the canvas based on whichever value is less: `scaleX` or `scaleY`
    scale = Math.min(scaleX, scaleY);
    Q.canvas.style.transformOrigin = '0 0';
    Q.canvas.style.transform = 'scale(' + scale + ')';

    //2. Center the canvas.
    //Decide whether to center the canvas vertically or horizontally.
    //Wide canvases should be centered vertically, and 
    //square or tall canvases should be centered horizontally

    if (Q.canvas.width > Q.canvas.height) {
        if (Q.canvas.width * scale < window.innerWidth) {
            center = "horizontally";
        } 
        else { 
            center = "vertically";
        }
    } 
    else {
        if (Q.canvas.height * scale < window.innerHeight) {
            center = "vertically";
        } 
        else { 
            center = "horizontally";
        }
    }

    let margin;
    //Center horizontally (for square or tall canvases)
    if (center === 'horizontally') {
        margin = (window.innerWidth - Q.canvas.width * scale) / 2;
        Q.canvas.style.marginLeft = margin + 'px';
        Q.canvas.style.marginRight = margin + 'px';
    }

    //Center vertically (for wide canvases) 
    if (center === 'vertically') {
        margin = (window.innerHeight - Q.canvas.height * scale) / 2;
        Q.canvas.style.marginTop = margin + 'px';
        Q.canvas.style.marginBottom = margin + 'px';
    }

    //3. Remove any padding from the canvas and set the canvas
    //display style to 'block'
    Q.canvas.style.paddingLeft = 0;
    Q.canvas.style.paddingRight = 0;
    Q.canvas.style.paddingTop = 0;
    Q.canvas.style.paddingBottom = 0;
    Q.canvas.style.display = 'block';

    //4. Set the color of the HTML body background
    document.body.style.backgroundColor = backgroundColor;

    //5. Set the game engine and pointer to the correct scale. 
    //This is important for correct hit testing between the pointer and sprites
    Q.pointer.scale = scale;
    Q.scale = scale;

    //Fix some quirkiness in scaling for Safari
    let ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari") !== -1) {
      if (ua.indexOf("chrome") > -1) {
        // Chrome
      } 
      else {
        // Safari
        Q.canvas.style.maxHeight = "100%";
        Q.canvas.style.minHeight = "100%";
      }
    }
};

/*
Wait
----
Lets you set up a timed sequence of events

    wait(1000)
      .then(() => console.log("One"))
      .then(() => wait(1000))
      .then(() => console.log("Two"))
      .then(() => wait(1000))
      .then(() => console.log("Three"))

*/

Q.wait = function(duration = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
};

Q.rectangle = function(
    width = 32, 
    height = 32,  
    fillStyle = 0xFF3300, 
    strokeStyle = 0x0033CC, 
    lineWidth = 0,
    x = 0, 
    y = 0 
) {
    let o = new Q.Graphics();
    o._sprite = undefined;
    o._width = width;
    o._height = height;
    o._fillStyle = Q.utils.color(fillStyle);
    o._strokeStyle = Q.utils.color(strokeStyle);
    o._lineWidth = lineWidth;

    //Draw the rectangle
    let draw = (width, height, fillStyle, strokeStyle, lineWidth) => {
        o.clear();
        o.beginFill(fillStyle);
        if (lineWidth > 0) {
            o.lineStyle(lineWidth, strokeStyle, 1);
        }
        o.drawRect(0, 0, width, height);
        o.endFill();
    };

    //Draw the line and capture the sprite that the `draw` function
    //returns
    draw(o._width, o._height, o._fillStyle, o._strokeStyle, o._lineWidth);

    //Generate a texture from the rectangle
    let texture = o.generateTexture();

    //Use the texture to create a sprite
    let sprite = new Q.Sprite(texture);

    //Position the sprite
    sprite.x = x;
    sprite.y = y;

    //Add getters and setters to the sprite
    Object.defineProperties(sprite, {
        "fillStyle": {
            get() {
                return o._fillStyle;
            },
            set(value) {
                o._fillStyle = Q.utils.color(value);

                //Draw the new rectangle 
                draw(o._width, o._height, o._fillStyle, o._strokeStyle, o._lineWidth, o._x, o._y);

                //Generate a new texture and set it as the sprite's texture
                let texture = o.generateTexture();
                o._sprite.texture = texture;
            }, 
            enumerable: true, configurable: true
        },
        "strokeStyle": {
            get() {
                return o._strokeStyle;
            },
            set(value) {
                o._strokeStyle = Q.utils.color(value);

                //Draw the new rectangle 
                draw(o._width, o._height, o._fillStyle, o._strokeStyle, o._lineWidth, o._x, o._y);

                //Generate a new texture and set it as the sprite's texture
                let texture = o.generateTexture();
                o._sprite.texture = texture;
            }, 
            enumerable: true, configurable: true
        },
        "lineWidth": {
            get() {
                return o._lineWidth;
            },
            set(value) {
                o._lineWidth = value;

                //Draw the new rectangle 
                draw(o._width, o._height, o._fillStyle, o._strokeStyle, o._lineWidth, o._x, o._y);

                //Generate a new texture and set it as the sprite's texture
                let texture = o.generateTexture();
                o._sprite.texture = texture;
            }, 
            enumerable: true, configurable: true
        }
    });

    //Get a local reference to the sprite so that we can 
    //change the rectangle properties later using the getters/setters
    o._sprite = sprite;

    Q.stage.addChild(sprite);

    //Return the sprite
    return sprite;
};

Q.circle = function(
    diameter = 32, 
    fillStyle = 0xFF3300, 
    strokeStyle = 0x0033CC, 
    lineWidth = 0,
    x = 0, 
    y = 0 
) {
    let o = new Q.Graphics();
    o._sprite = undefined;
    o._diameter = diameter;
    o._fillStyle = Q.utils.color(fillStyle);
    o._strokeStyle = Q.utils.color(strokeStyle);
    o._lineWidth = lineWidth;

    //Draw the rectangle
    let draw = (diameter, fillStyle, strokeStyle, lineWidth) => {
        o.clear();
        o.beginFill(fillStyle);
        if (lineWidth > 0) {
            o.lineStyle(lineWidth, strokeStyle, 1);
        }
        o.drawCircle(0, 0, diameter / 2);
        o.endFill();
    };

    //Draw the line and capture the sprite that the `draw` function
    //returns
    draw(o._diameter, o._fillStyle, o._strokeStyle, o._lineWidth);

    //Generate a texture from the rectangle
    let texture = o.generateTexture();

    //Use the texture to create a sprite
    let sprite = new Q.Sprite(texture);

    //Position the sprite
    sprite.x = x;
    sprite.y = y;

    //Add getters and setters to the sprite
    Object.defineProperties(sprite, {
        "fillStyle": {
            get() {
                return o._fillStyle;
            },
            set(value) {
                o._fillStyle = Q.utils.color(value);

                //Draw the new rectangle 
                draw(o._diameter, o._fillStyle, o._strokeStyle, o._lineWidth);

                //Generate a new texture and set it as the sprite's texture
                let texture = o.generateTexture();
                o._sprite.texture = texture;
            }, 
            enumerable: true, configurable: true
        },
        "strokeStyle": {
            get() {
                return o._strokeStyle;
            },
            set(value) {
                o._strokeStyle = Q.utils.color(value);

                //Draw the new rectangle 
                draw(o._diameter, o._fillStyle, o._strokeStyle, o._lineWidth);

                //Generate a new texture and set it as the sprite's texture
                let texture = o.generateTexture();
                o._sprite.texture = texture;
            }, 
            enumerable: true, configurable: true
        },
        "diameter": {
            get() {
                return o._diameter;
            },
            set(value) {
                o._lineWidth = 10;

                //Draw the cirlce
                draw(o._diameter, o._fillStyle, o._strokeStyle, o._lineWidth);

                //Generate a new texture and set it as the sprite's texture
                let texture = o.generateTexture();
                o._sprite.texture = texture;
            }, 
            enumerable: true, configurable: true
        },
        "radius": {
            get() {
                return o._diameter / 2;
            },
            set(value) {
                //Draw the cirlce
                draw(value * 2, o._fillStyle, o._strokeStyle, o._lineWidth);

                //Generate a new texture and set it as the sprite's texture
                let texture = o.generateTexture();
                o._sprite.texture = texture;
            }, 
            enumerable: true, configurable: true
        },
    });

    //Get a local reference to the sprite so that we can 
    //change the rectangle properties later using the getters/setters
    o._sprite = sprite;

    sprite.circular = true;
    Q.stage.addChild(sprite);

    //Return the sprite
    return sprite;
};

Q.line = function(
    strokeStyle = 0x000000, 
    lineWidth = 1, 
    ax = 0, 
    ay = 0, 
    bx = 32, 
    by = 32
) {
    //Create the line object
    let o = new Q.Graphics();

    //Private properties
    o._strokeStyle = Q.utils.color(strokeStyle);
    o._width = lineWidth;
    o._ax = ax;
    o._ay = ay;
    o._bx = bx;
    o._by = by;

    //A helper function that draws the line
    let draw = (strokeStyle, lineWidth, ax, ay, bx, by) => {
        o.clear();
        o.lineStyle(lineWidth, strokeStyle, 1);
        o.moveTo(ax, ay);
        o.lineTo(bx, by);
    };

    //Draw the line
    draw(o._strokeStyle, o._width, o._ax, o._ay, o._bx, o._by);

    //Define getters and setters that redefine the line's start and 
    //end points and re-draws it if they change
    Object.defineProperties(o, {
        "ax": {
            get() {
                return o._ax;
            },
            set(value) {
                o._ax = value;
                draw(o._strokeStyle, o._width, o._ax, o._ay, o._bx, o._by);
            }, 
            enumerable: true, configurable: true
        },
        "ay": {
            get() {
                return o._ay;
            },
            set(value) {
                o._ay = value;
                draw(o._strokeStyle, o._width, o._ax, o._ay, o._bx, o._by);
            }, 
            enumerable: true, configurable: true
        },
        "bx": {
            get() {
                return o._bx;
            },
            set(value) {
                o._bx = value;
                draw(o._strokeStyle, o._width, o._ax, o._ay, o._bx, o._by);
            }, 
            enumerable: true, configurable: true
        },
        "by": {
            get() {
                return o._by;
            },
            set(value) {
                o._by = value;
                draw(o._strokeStyle, o._width, o._ax, o._ay, o._bx, o._by);
            }, 
            enumerable: true, configurable: true
        },
        "strokeStyle": {
            get() {
                return o._strokeStyle;
            },
            set(value) {
                o._strokeStyle = self.color(value);

                //Draw the line
                draw(o._strokeStyle, o._width, o._ax, o._ay, o._bx, o._by);
            }, 
            enumerable: true, configurable: true
        },
        "width": {
            get() {
                return o._width;
            },
            set(value) {
                o._width = value;

                //Draw the line
                draw(o._strokeStyle, o._width, o._ax, o._ay, o._bx, o._by);
            }, 
            enumerable: true, configurable: true
        }
    });

    Q.stage.addChild(o);

    //Return the line
    return o;
};

//Move a sprite or an array of sprites by adding its
//velocity to its position
Q.move = function(sprites, dt = 1) {
    if (!(sprites instanceof Array)) {
        sprites.x += sprites.vx * dt;
        sprites.y += sprites.vy * dt;
    } 
    else {
        sprites.forEach(sprite => {
            sprite.x += sprite.vx * dt;
            sprite.y += sprite.vy * dt;
        });
    }
};

Q.fourKeyController = function(s, speed, up = 38, right = 39, down = 40, left = 37) {
    //Create a `direction` property on the sprite
    s.direction = '';

    //Create some keyboard objects
    let leftArrow = new Q.Keyboard(left),
        upArrow = new Q.Keyboard(up),
        rightArrow = new Q.Keyboard(right),
        downArrow = new Q.Keyboard(down);

    //Assign key `press` and release methods
    leftArrow.press = function() {
        s.vx = -speed;
        s.vy = 0;
        s.direction = "left";
    };
    leftArrow.release = function() {
        if (!rightArrow.isDown && s.vy === 0) {
            s.vx = 0;
        }
    };
    upArrow.press = function() {
        s.vy = -speed;
        s.vx = 0;
        s.direction = "up";
    };
    upArrow.release = function() {
        if (!downArrow.isDown && s.vx === 0) {
            s.vy = 0;
        }
    };
    rightArrow.press = function() {
        s.vx = speed;
        s.vy = 0;
        s.direction = "right";
    };
    rightArrow.release = function() {
        if (!leftArrow.isDown && s.vy === 0) {
            s.vx = 0;
        }
    };
    downArrow.press = function() {
        s.vy = speed;
        s.vx = 0;
        s.direction = "down";
    };
    downArrow.release = function() {
        if (!upArrow.isDown && s.vx === 0) {
            s.vy = 0;
        }
    };
};

Q.contain = function(s, container, bounce = false, extra){
    //Give the container x and y anchor offset values, if it doesn't
    //have any
    if (container.xAnchorOffset === undefined) container.xAnchorOffset = 0;
    if (container.yAnchorOffset === undefined) container.yAnchorOffset = 0;
    if (s.parent.gx === undefined) s.parent.gx = 0;
    if (s.parent.gy === undefined) s.parent.gy = 0;

    //The `collision` object is used to store which
    //side of the containing rectangle the sprite hits
    let collision;

    //Left
    if (s.x - s.xAnchorOffset < container.x - s.parent.gx - container.xAnchorOffset) {
        //Bounce the sprite if `bounce` is true
        if (bounce) s.vx *= -1;

        //If the sprite has `mass`, let the mass
        //affect the sprite's velocity
        if(s.mass) s.vx /= s.mass;
        s.x = container.x - s.parent.gx - container.xAnchorOffset + s.xAnchorOffset;
        collision = "left";
    }

    //Top
    if (s.y - s.yAnchorOffset < container.y - s.parent.gy - container.yAnchorOffset) {
        if (bounce) s.vy *= -1;
        if(s.mass) s.vy /= s.mass;
        s.y = container.y - s.parent.gy - container.yAnchorOffset + s.yAnchorOffset;
        collision = "top";
    }

    //Right
    if (s.x - s.xAnchorOffset + s.width > container.width - container.xAnchorOffset) {
        if (bounce) s.vx *= -1;
        if(s.mass) s.vx /= s.mass;
        s.x = container.width - s.width - container.xAnchorOffset + s.xAnchorOffset;
        collision = "right";
    }

    //Bottom
    if (s.y - s.yAnchorOffset + s.height > container.height - container.yAnchorOffset) {
        if (bounce) s.vy *= -1;
        if(s.mass) s.vy /= s.mass;
        s.y = container.height - s.height - container.yAnchorOffset + s.yAnchorOffset;
        collision = "bottom";
    }

    //The `extra` function runs if there was a collision
    //and `extra` has been defined
    if (collision && extra) extra(collision);

    //Return the `collision` object
    return collision;
};

Q.outsideBounds = function(s, bounds, extra){
    let x = bounds.x,
        y = bounds.y,
        width = bounds.width,
        height = bounds.height,

        //The `collision` object is used to store which
        //side of the containing rectangle the sprite hits
        collision;

    //Left
    if (s.x < x - s.width) {
        collision = "left";
    }
    //Top
    if (s.y < y - s.height) {
        collision = "top";
    }
    //Right
    if (s.x > width) {
        collision = "right";
    }
    //Bottom
    if (s.y > height) {
        collision = "bottom";
    }

    //The `extra` function runs if there was a collision
    //and `extra` has been defined
    if (collision && extra) extra(collision);

    //Return the `collision` object
    return collision;
};

function _getCenter(o, dimension, axis) {
    if (o.anchor !== undefined) {
        if (o.anchor[axis] !== 0) {
            return 0;
        } 
        else {
            //console.log(o.anchor[axis])
            return dimension / 2;
        }
    } 
    else {
        return dimension; 
    }
}

Q.distance = function (s1, s2) {
    let dx = (s2.x + _getCenter(s2, s2.width, "x")) 
           - (s1.x + _getCenter(s1, s1.width, "x")),
        dy = (s2.y + _getCenter(s2, s2.height, "y")) 
           - (s1.y + _getCenter(s1, s1.height, "y"));

    return Math.sqrt(dx * dx + dy * dy);
};

Q.distanceSq = function (s1, s2) {
    let dx = (s2.x + _getCenter(s2, s2.width, "x")) 
           - (s1.x + _getCenter(s1, s1.width, "x")),
        dy = (s2.y + _getCenter(s2, s2.height, "y")) 
           - (s1.y + _getCenter(s1, s1.height, "y"));

    return (dx * dx + dy * dy);
};

//### rotateAroundSprite
//Make a sprite rotate around another sprite

Q.rotateAroundSprite = function(rotatingSprite, centerSprite, distance, angle) {
    rotatingSprite.x
      = (centerSprite.x + _getCenter(centerSprite, centerSprite.width, "x")) 
      - rotatingSprite.parent.x
      + (distance * Math.cos(angle))
      - _getCenter(rotatingSprite, rotatingSprite.width, "x");

    rotatingSprite.y
      = (centerSprite.y + _getCenter(centerSprite, centerSprite.height, "y")) 
      - rotatingSprite.parent.y
      + (distance * Math.sin(angle))
      - _getCenter(rotatingSprite, rotatingSprite.height, "y");
};

//### rotateAroundPoint
//Make a point rotate around another point.
//If distanceX and distanceY are the same value, the rotation will
//be circular. If they're different values, the rotation will be
//ellipical.

Q.rotateAroundPoint = function(pointX, pointY, distanceX, distanceY, angle) {
    let point = {};

    point.x = pointX + Math.cos(angle) * distanceX;
    point.y = pointY + Math.sin(angle) * distanceY;
    
    return point;
};

/*
### angle
Return the angle in Radians between two sprites.
Parameters:
a. A sprite object with `centerX` and `centerY` properties.
b. A sprite object with `centerX` and `centerY` properties.
You can use it to make a sprite rotate towards another sprite like this:

box.rotation = angle(box, pointer);
*/

Q.angle = function(s1, s2) {
    return Math.atan2(
        //This code adapts to a shifted anchor point
        (s2.y + _getCenter(s2, s2.height, "y")) - 
        (s1.y + _getCenter(s1, s1.height, "y")),
        (s2.x + _getCenter(s2, s2.width, "x")) - 
        (s1.x + _getCenter(s1, s1.width, "x"))
    );
};

Q.followEase = function(follower, leader, speed) {
    let dx = (leader.x + _getCenter(leader, leader.width, "x")) - 
             (follower.x + _getCenter(follower, follower.width, "x")),
        dy = (leader.y + _getCenter(leader, leader.height, "y")) - 
             (follower.y + _getCenter(follower, follower.height, "y")),
        distance = Math.sqrt(dx * dx + dy * dy);

    // Move the follower if it's more than 1 pixel away from the leader
    if(distance >= 1) {
        follower.x += dx * speed;
        follower.y += dy * speed;
    }
};

Q.followConstant= function(follower, leader, speed) {
    //Figure out the distance between the sprites
    let dx = (leader.x + _getCenter(leader, leader.width, "x")) - 
             (follower.x + _getCenter(follower, follower.width, "x")),
        dy = (leader.y + _getCenter(leader, leader.height, "y")) - 
             (follower.y + _getCenter(follower, follower.height, "y")),
        distance = Math.sqrt(dx * dx + dy * dy);

    //Move the follower if it's more than 1 move //away from the leader
    if (distance >= speed) {
        follower.x += (dx / distance) * speed;
        follower.y += (dy / distance) * speed;
    }
};

//Use `shoot` to create bullet sprites 
Q.shoot = function(
    shooter, angle, x, y, container, bulletSpeed, bulletArray, bulletSprite
) {
    //Make a new sprite using the user-supplied `bulletSprite` function
    let bullet = bulletSprite();

    //Set the bullet's anchor point to its center
    bullet.anchor.set(0.5, 0.5);

    //Temporarily add the bullet to the shooter
    //so that we can position it relative to the
    //shooter's position
    shooter.addChild(bullet);
    bullet.x = x;
    bullet.y = y;

    //Find the bullet's global coordinates so that we can use
    //them to position the bullet on the new parent container
    let tempGx = bullet.getGlobalPosition().x,
        tempGy = bullet.getGlobalPosition().y;

    //Add the bullet to the new parent container using
    //the new global coordinates
    container.addChild(bullet);
    // Q.stage.addChild(bullet);
    bullet.x = tempGx;
    bullet.y = tempGy;

    //Set the bullet's velocity
    bullet.vx = Math.cos(angle) * bulletSpeed;
    bullet.vy = Math.sin(angle) * bulletSpeed;

    //Push the bullet into the `bulletArray`
    bulletArray.push(bullet);
}

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

Q.movieClip = function(source, x, y) {
    //Create the sprite
    let sprite = new Q.MovieClip(source, x, y);

    //Add the sprite to the stage
    Q.stage.addChild(sprite);

    //Return the sprite to the main program
    return sprite;
};

Q.TilingSprite = class extends Q.Sprite {
    constructor(source, width, height, x, y) {
        super(source, x, y);

        this.width = width;
        this.height = height;

        this.tileScale = new Q.Point(1, 1);
        this.tilePosition = new Q.Point(0, 0);
    }
    get tileX() {
        return this.tilePosition.x;
    }
    set tileX(value) {
        this.tilePosition.x = value;
    }
    get tileY() {
        return this.tilePosition.y;
    }
    set tileY(value) {
        this.tilePosition.y = value;
    }
    get tileScaleX() {
        return this.tileScale.x;
    }
    set tileScaleX(value) {
        this.tileScale.x = value;
    }
    get tileScaleY() {
        return this.tileScale.y;
    }
    set tileScaleY(value) {
        this.tileScale.y = value;
    }
    render(context) {
        context.globalAlpha = this.worldAlpha;

        this.worldTransform.setTransform(context);

        if(!this.__tilePattern) {
            this.__tilePattern = context.createPattern(this.texture.source, 'repeat');
        }

        context.beginPath();

        context.scale(this.tileScale.x, this.tileScale.y);
        context.translate(this.tilePosition.x, this.tilePosition.y);

        context.fillStyle = this.__tilePattern;
        context.fillRect(
            -this.tilePosition.x, 
            -this.tilePosition.y, 
            this.width / this.tileScale.x, 
            this.height / this.tileScale.y
        );

        context.scale(1/this.tileScale.x, 1/this.tileScale.y);
        context.translate(-this.tilePosition.x, -this.tilePosition.y);

        context.closePath();
    }
};

Q.tilingSprite = function(source, width, height, x, y) {
    //Create the sprite
    let sprite = new Q.TilingSprite(source, width, height, x, y);

    //Add the sprite to the stage
    Q.stage.addChild(sprite);

    //Return the sprite to the main program
    return sprite;
};

Q.emitter = function (interval, particleFunction) {
    let emitter = {},
    timerInterval = undefined;

    emitter.playing = false;

    function play() {
        if (!emitter.playing) {
            particleFunction();
            timerInterval = setInterval(emitParticle.bind(this), interval);
            emitter.playing = true;
        }
    }

    function stop() {
        if (emitter.playing) {
            clearInterval(timerInterval);
            emitter.playing = false;
        }
    }

    function emitParticle() {
        particleFunction();
    }

    emitter.play = play;
    emitter.stop = stop;
    return emitter;
};

Q.particleEffect = function (
    x = 0, y = 0, 
    spriteFunction = () => console.log("Sprite creation function"),
    numberOfParticles = 20,
    gravity = 0,
    randomSpacing = true,
    minAngle = 0, maxAngle = 6.28,
    minSize = 4, maxSize = 16, 
    minSpeed = 0.3, maxSpeed = 3,
    minScaleSpeed = 0.01, maxScaleSpeed = 0.05,
    minAlphaSpeed = 0.02, maxAlphaSpeed = 0.02,
    minRotationSpeed = 0.01, maxRotationSpeed = 0.03
) {
    //An array to store the angles
    let angles = [];

    //A variable to store the current particle's angle
    let angle;

    //Figure out by how many radians each particle should be separated
    let spacing = (maxAngle - minAngle) / (numberOfParticles - 1);

    //Create an angle value for each particle and push that
    //value into the `angles` array
    for(let i = 0; i < numberOfParticles; i++) {
        //If `randomSpacing` is `true`, give the particle any angle
        //value between `minAngle` and `maxAngle`
        if (randomSpacing) {
            angle = Q.utils.randomFloat(minAngle, maxAngle);
            angles.push(angle);
        } 
        //If `randomSpacing` is `false`, space each particle evenly,
        //starting with the `minAngle` and ending with the `maxAngle`
        else {
            if (angle === undefined) angle = minAngle;
            angles.push(angle);
            angle += spacing;
        }
    }

    //Make a particle for each angle
    angles.forEach(angle => makeParticle(angle));

    //Make the particle
    function makeParticle(angle) {
        //Create the particle using the supplied sprite function
        let particle = spriteFunction();

        //Display a random frame if the particle has more than 1 frame
        if (particle.frames.length > 0) {
            particle.gotoAndStop(Q.utils.randomInt(0, particle.frames.length - 1));
        }

        //Set a random width and height
        let size = Q.utils.randomInt(minSize, maxSize);
        particle.width = size;
        particle.height = size;

        //Set the particle's `anchor` to its center
        particle.anchor.set(0.5, 0.5);

        //Set the x and y position
        particle.x = x;
        particle.y = y;

        //Set a random speed to change the scale, alpha and rotation
        particle.scaleSpeed = Q.utils.randomFloat(minScaleSpeed, maxScaleSpeed);
        particle.alphaSpeed = Q.utils.randomFloat(minAlphaSpeed, maxAlphaSpeed);
        particle.rotationSpeed = Q.utils.randomFloat(minRotationSpeed, maxRotationSpeed);

        //Set a random velocity at which the particle should move
        let speed = Q.utils.randomFloat(minSpeed, maxSpeed);
        particle.vx = speed * Math.cos(angle);
        particle.vy = speed * Math.sin(angle);

        //Add the particle to its parent container
        //container.addChild(particle);

        //The particle's `update` method is called on each frame of the
        //game loop
        particle.update = (dt) => {
            //Add gravity
            particle.vy += gravity; // * dt;

            //Move the particle
            particle.x += particle.vx; // * dt;
            particle.y += particle.vy; // * dt;

            //Change the particle's `scale`
            if (particle.scaleX - particle.scaleSpeed > 0) {
                particle.scaleX -= particle.scaleSpeed; // * dt;
            }
            if (particle.scaleY - particle.scaleSpeed > 0) {
                particle.scaleY -= particle.scaleSpeed; // * dt;
            }

            //Change the particle's rotation
            particle.rotation += particle.rotationSpeed; // * dt;

            //Change the particle's `alpha`
            particle.alpha -= particle.alphaSpeed; // * dt;

            //Remove the particle if its `alpha` reaches zero
            if (particle.alpha <= 0) {
                Q.remove(particle);
                Q.particles.splice(Q.particles.indexOf(particle), 1);
            }
        };

        //Push the particle into the `particles` array
        //The `particles` array needs to be updated by the game loop each
        //frame
        Q.particles.push(particle);
    }
};

Q.grid = function(
    columns = 0, rows = 0, cellWidth = 32, cellHeight = 32,
    centerCell = false, xOffset = 0, yOffset = 0,
    makeSprite,
    extra
  ){
    //Create an empty group called `container`. This `container`
    //group is what the function returns back to the main program.
    //All the sprites in the grid cells will be added
    //as children to this container
    let container = Q.container();

    //The `create` method plots the grid

    let createGrid = () => {
        //Figure out the number of cells in the grid
        let length = columns * rows;

        //Create a sprite for each cell
        for(let i = 0; i < length; i++) {
            //Figure out the sprite's x/y placement in the grid
            let x = (i % columns) * cellWidth,
                y = Math.floor(i / columns) * cellHeight;

            //Use the `makeSprite` function supplied in the constructor
            //to make a sprite for the grid cell
            let sprite = makeSprite();

            //Add the sprite to the `container`
            container.addChild(sprite);

            //Should the sprite be centered in the cell?

            //No, it shouldn't be centered
            if (!centerCell) {
                sprite.x = x + xOffset;
                sprite.y = y + yOffset;
            }
            //Yes, it should be centered
            else {
                sprite.x 
                    = x + (cellWidth / 2) 
                    - sprite.halfWidth + xOffset;
                sprite.y 
                    = y + (cellHeight / 2) 
                    - sprite.halfHeight + yOffset;
            }

            //Run any optional extra code. This calls the
            //`extra` function supplied by the constructor
            if (extra) extra(sprite);
        }
    };

    //Run the `createGrid` method
    createGrid();

    //Return the `container` group back to the main program
    return container;
};

Q.progressBar = {
    maxWidth: 0,
    height: 0,
    backgroundColor: '0x808080',
    foregroundColor: '0x00FFFF',
    backBar: null,
    frontBar: null,
    percentage: null,
    assets: null,
    initialized: false,

    //Use the `create` method to create the progress bar
    create(canvas, assets) {
        if (!this.initialized) {
            //Store a reference to the `assets` object
            this.assets = Q.Assets;

            //Set the maximum width to half the width of the canvas
            this.maxWidth = Q.canvas.width / 2;

            //Build the progress bar using two rectangle sprites and
            //one text sprite

            //1. Create the background bar's gray background
            this.backBar = Q.rectangle(this.maxWidth, 32, this.backgroundColor);
            this.backBar.x = (Q.canvas.width / 2) - (this.maxWidth / 2);
            this.backBar.y = (Q.canvas.height / 2) - 16;

            //2. Create the blue foreground bar. This is the element of the
            //progress bar that will increase in width as assets load
            this.frontBar = Q.rectangle(this.maxWidth, 32, this.foregroundColor);
            this.frontBar.x = (Q.canvas.width / 2) - (this.maxWidth / 2);
            this.frontBar.y = (Q.canvas.height / 2) - 16;

            //3. A text sprite that will display the percentage
            //of assets that have loaded
            this.percentage = Q.text('0%', {font:'28px sans-serif', fill: 'black'});
            this.percentage.x = (Q.canvas.width / 2) - (this.maxWidth / 2) + 12;
            this.percentage.y = (Q.canvas.height / 2) - 16;

            //Flag the `progressBar` as having been initialized
            this.initialized = true;
        }
    },
    //Use the `update` method to update the width of the bar and 
    //percentage loaded each frame
    update() {
        //Change the width of the blue `frontBar` to match the
        //ratio of assets that have loaded. Adding `+1` to
        //`assets.loaded` means that the loading bar will appear at 100%
        //when the last asset is being loaded, which is reassuring for the
        //player observing the load progress
        let ratio = (this.assets.loaded + 1) / this.assets.toLoad;
        this.frontBar.width = this.maxWidth * ratio;

        //Display the percentage
        this.percentage.text = `${Math.floor((ratio) * 100)} %`;
    },
    //Use the `remove` method to remove the progress bar when all the
    //game assets have finished loading
    remove() {
        //Remove the progress bar using the universal sprite `remove`
        //function
        Q.remove(this.frontBar);
        Q.remove(this.backBar);
        Q.remove(this.percentage);
    }
};

/*
World camera
------------
The `worldCamera` method returns a `camera` object
with `x` and `y` properties. It has
two useful methods: `centerOver`, to center the camera over
a sprite, and `follow` to make it follow a sprite.
`worldCamera` arguments: worldObject, theCanvas
The worldObject needs to have a `width` and `height` property.
*/
Q.worldCamera = function(world, worldWidth, worldHeight, canvas) {
    //Define a `camera` object with helpful properties
    let camera = {
        width: canvas.width,
        height: canvas.height,
        _x: 0,
        _y: 0,

        //`x` and `y` getters/setters
        //When you change the camera's position,
        //they shift the position of the world in the opposite direction
        get x() {
            return this._x;
        },
        set x(value) {
            this._x = value;
            world.x = -this._x;
            //world._previousX = world.x;
        },
        get y() {
            return this._y;
        },
        set y(value) {
            this._y = value;
            world.y = -this._y;
            //world._previousY = world.y;
        },

        //The center x and y position of the camera
        get centerX() {
            return this.x + (this.width / 2);
        },
        get centerY() {
            return this.y + (this.height / 2);
        },

        //Boundary properties that define a rectangular area, half the size
        //of the game screen. If the sprite that the camera is following
        //is inide this area, the camera won't scroll. If the sprite
        //crosses this boundary, the `follow` function ahead will change
        //the camera's x and y position to scroll the game world
        get rightInnerBoundary() {
            return this.x + (this.width / 2) + (this.width / 4);
        },
        get leftInnerBoundary() {
            return this.x + (this.width / 2) - (this.width / 4);
        },
        get topInnerBoundary() {
            return this.y + (this.height / 2) - (this.height / 4);
        },
        get bottomInnerBoundary() {
            return this.y + (this.height / 2) + (this.height / 4);
        },

        //The code next defines two camera 
        //methods: `follow` and `centerOver`

        //Use the `follow` method to make the camera follow a sprite
        follow: function(sprite) {
            //Check the sprites position in relation to the inner
            //boundary. Move the camera to follow the sprite if the sprite 
            //strays outside the boundary
            if(sprite.x < this.leftInnerBoundary) {
                this.x = sprite.x - (this.width / 4);
            }
            if(sprite.y < this.topInnerBoundary) {
                this.y = sprite.y - (this.height / 4);
            }
            if(sprite.x + sprite.width > this.rightInnerBoundary) {
                this.x = sprite.x + sprite.width - (this.width / 4 * 3);
            }
            if(sprite.y + sprite.height > this.bottomInnerBoundary) {
                this.y = sprite.y + sprite.height - (this.height / 4 * 3);
            }

            //If the camera reaches the edge of the map, stop it from moving
            if(this.x < 0) {
                this.x = 0;
            }
            if(this.y < 0) {
                this.y = 0;
            }
            if(this.x + this.width > worldWidth) {
                this.x = worldWidth - this.width;
            }
            if(this.y + this.height > worldHeight) {
                this.y = worldHeight - this.height;
            }
        },

        //Use the `centerOver` method to center the camera over a sprite
        centerOver: function(sprite) {
            //Center the camera over a sprite
            this.x = (sprite.x + sprite.halfWidth) - (this.width / 2);
            this.y = (sprite.y + sprite.halfHeight) - (this.height / 2);
        }
    };

    //Return the `camera` object 
    return camera;
};

/*
#### hitTestPoint
Use it to find out if a point is touching a circular or rectangular sprite.
Parameters:
a. An object with `x` and `y` properties.
b. A sprite object with `x`, `y`, `centerX` and `centerY` properties.
If the sprite has a `radius` property, the function will interpret
the shape as a circle.
*/
Q.hitTestPoint = function(point, sprite) {
    let shape, left, right, top, bottom, dx, dy, magnitude, hit;

    //Find out if the sprite is rectangular or circular depending
    //on whether it has a `radius` property
    if (sprite.radius) {
        shape = "circle";
    } 
    else {
        shape = "rectangle";
    }

    //Rectangle
    if (shape === "rectangle") {
        //Get the position of the sprite's edges
        left = sprite.x - sprite.xAnchorOffset;
        right = sprite.x + sprite.width - sprite.xAnchorOffset;
        top = sprite.y - sprite.yAnchorOffset;
        bottom = sprite.y + sprite.height - sprite.yAnchorOffset;

        //Find out if the point is intersecting the rectangle
        hit = point.x > left && 
              point.x < right && 
              point.y > top && 
              point.y < bottom;
    }

    //Circle
    if (shape === "circle") {
        //Find the distance between the point and the
        //center of the circle
        dx = point.x - sprite.centerX,
        dy = point.y - sprite.centerY,
        magnitude = Math.sqrt(dx * dx + dy * dy);

        //The point is intersecting the circle if the magnitude
        //(distance) is less than the circle's radius
        hit = magnitude < sprite.radius;
    }

    //`hit` will be either `true` or `false`
    return hit;
};

/*
#### hitTestCircle
Use it to find out if two circular sprites are touching.
Parameters:
a. A sprite object with `centerX`, `centerY` and `radius` properties.
b. A sprite object with `centerX`, `centerY` and `radius`.
*/
Q.hitTestCircle = function(c1, c2, global = false) {
    let dx, dy, magnitude, totalRadii, hit;

    //Calculate the vector between the circles’ center points
    if(global) {
        //Use global coordinates
        dx = (c2.gx + c2.radius - c2.xAnchorOffset) - 
             (c1.gx + c1.radius - c1.xAnchorOffset);
        dy = (c2.gy + c2.radius - c2.yAnchorOffset) - 
             (c1.gy + c1.radius - c1.yAnchorOffset);
    } 
    else {
        //Use local coordinates
        dx = c2.centerX - c1.centerX;
        dy = c2.centerY - c1.centerY;
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    magnitude = Math.sqrt(dx * dx + dy * dy);

    //Add together the circles' total radii
    totalRadii = c1.radius + c2.radius;

    //Set hit to true if the distance between the circles is
    //less than their totalRadii
    hit = magnitude < totalRadii;

    //`hit` will be either `true` or `false`
    return hit;
};

/*
#### circleCollision
Use this function to prevent a moving circular sprite from overlapping and optionally
bouncing off a non-moving circular sprite.
Parameters:
a. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
b. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
c. Optional: `true` or `false` to indicate whether or not the first sprite
d. Optional: `true` or `false` to indicate whether or not local or global sprite positions should be used.
This defaults to `true` so set it to `false` if you want to use the sprite's local coordinates.
should bounce off the second sprite.
The sprites can contain an optional mass property that should be greater than 1.
*/
Q.circleCollision = function(c1, c2, bounce = true, global = false) {
    let magnitude, combinedRadii, overlap,
        vx, vy, dx, dy, s = {},
        hit = false;

    //Calculate the vector between the circles’ center points

    if(global) {
        //Use global coordinates
        vx = (c2.gx + c2.radius - c2.xAnchorOffset) - 
             (c1.gx + c1.radius - c1.xAnchorOffset);
        vy = (c2.gy + c2.radius - c2.yAnchorOffset) - 
             (c1.gy + c1.radius - c1.yAnchorOffset);
    } 
    else {
        //Use local coordinates
        vx = c2.centerX - c1.centerX;
        vy = c2.centerY - c1.centerY;
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    magnitude = Math.sqrt(vx * vx + vy * vy);

    //Add together the circles' combined half-widths
    combinedRadii = c1.radius + c2.radius;

    //Figure out if there's a collision
    if (magnitude < combinedRadii) {
        //Yes, a collision is happening.
        hit = true;

        //Find the amount of overlap between the circles
        overlap = combinedRadii - magnitude;

        //Add some "quantum padding". This adds a tiny amount of space
        //between the circles to reduce their surface tension and make
        //them more slippery. "0.3" is a good place to start but you might
        //need to modify this slightly depending on the exact behaviour
        //you want. Too little and the balls will feel sticky, too much
        //and they could start to jitter if they're jammed together
        let quantumPadding = 0.3;
        overlap += quantumPadding;

        //Normalize the vector.
        //These numbers tell us the direction of the collision
        dx = vx / magnitude;
        dy = vy / magnitude;

        //Move circle 1 out of the collision by multiplying
        //the overlap with the normalized vector and subtract it from
        //circle 1's position
        c1.x -= overlap * dx;
        c1.y -= overlap * dy;

        //Bounce
        if (bounce) {
            //Create a collision vector object, `s` to represent the bounce surface.
            //Find the bounce surface's x and y properties
            //(This represents the normal of the distance vector between the circles)
            s.x = vy;
            s.y = -vx;

            //Bounce c1 off the surface
            bounceOffSurface(c1, s);
        } 
        else {
            /*
            //Make it a bit slippery
            let friction = 0.9;
            c1.vx *= friction;
            c1.vy *= friction;
            */
        }
    }

    return hit;
};

/*
#### movingCircleCollision
Use it to make two moving circles bounce off each other.
Parameters:
a. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
b. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
The sprites can contain an optional mass property that should be greater than 1.
*/
Q.movingCircleCollision = function(c1, c2, global = false) {
    let combinedRadii, overlap, xSide, ySide,
    //`s` refers to the collision surface
    s = {},
    p1A = {}, p1B = {}, p2A = {}, p2B = {},
    hit = false;

    //Apply mass, if the circles have mass properties
    c1.mass = c1.mass || 1;
    c2.mass = c2.mass || 1;

    //Calculate the vector between the circles’ center points
    if(global) {
        //Use global coordinates
        s.vx = (c2.gx + c2.radius - c2.xAnchorOffset) - 
             (c1.gx + c1.radius - c1.xAnchorOffset);
        s.vy = (c2.gy + c2.radius - c2.yAnchorOffset) - 
             (c1.gy + c1.radius - c1.yAnchorOffset);
    } 
    else {
        //Use local coordinates
        s.vx = c2.centerX - c1.centerX;
        s.vy = c2.centerY - c1.centerY;
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    s.magnitude = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

    //Add together the circles' combined half-widths
    combinedRadii = c1.radius + c2.radius;

    //Figure out if there's a collision
    if (s.magnitude < combinedRadii) {
        //Yes, a collision is happening
        hit = true;

        //Find the amount of overlap between the circles
        overlap = combinedRadii - s.magnitude;

        //Add some "quantum padding" to the overlap
        overlap += 0.3;

        //Normalize the vector.
        //These numbers tell us the direction of the collision
        s.dx = s.vx / s.magnitude;
        s.dy = s.vy / s.magnitude;

        //Find the collision vector.
        //Divide it in half to share between the circles, and make it absolute
        s.vxHalf = Math.abs(s.dx * overlap / 2);
        s.vyHalf = Math.abs(s.dy * overlap / 2);

        //Find the side that the collision if occurring on
        (c1.x > c2.x) ? xSide = 1 : xSide = -1;
        (c1.y > c2.y) ? ySide = 1 : ySide = -1;

        //Move c1 out of the collision by multiplying
        //the overlap with the normalized vector and adding it to
        //the circle's positions
        c1.x = c1.x + (s.vxHalf * xSide);
        c1.y = c1.y + (s.vyHalf * ySide);

        //Move c2 out of the collision
        c2.x = c2.x + (s.vxHalf * -xSide);
        c2.y = c2.y + (s.vyHalf * -ySide);

        //1. Calculate the collision surface's properties

        //Find the surface vector's left normal
        s.lx = s.vy;
        s.ly = -s.vx;

        //2. Bounce c1 off the surface (s)

        //Find the dot product between c1 and the surface
        let dp1 = c1.vx * s.dx + c1.vy * s.dy;

        //Project c1's velocity onto the collision surface
        p1A.x = dp1 * s.dx;
        p1A.y = dp1 * s.dy;

        //Find the dot product of c1 and the surface's left normal (s.l.x and s.l.y)
        let dp2 = c1.vx * (s.lx / s.magnitude) + c1.vy * (s.ly / s.magnitude);

        //Project the c1's velocity onto the surface's left normal
        p1B.x = dp2 * (s.lx / s.magnitude);
        p1B.y = dp2 * (s.ly / s.magnitude);

        //3. Bounce c2 off the surface (s)

        //Find the dot product between c2 and the surface
        let dp3 = c2.vx * s.dx + c2.vy * s.dy;

        //Project c2's velocity onto the collision surface
        p2A.x = dp3 * s.dx;
        p2A.y = dp3 * s.dy;

        //Find the dot product of c2 and the surface's left normal (s.l.x and s.l.y)
        let dp4 = c2.vx * (s.lx / s.magnitude) + c2.vy * (s.ly / s.magnitude);

        //Project c2's velocity onto the surface's left normal
        p2B.x = dp4 * (s.lx / s.magnitude);
        p2B.y = dp4 * (s.ly / s.magnitude);

        //Calculate the bounce vectors
        //Bounce c1
        //using p1B and p2A
        c1.bounce = {};
        c1.bounce.x = p1B.x + p2A.x;
        c1.bounce.y = p1B.y + p2A.y;

        //Bounce c2
        //using p1A and p2B
        c2.bounce = {};
        c2.bounce.x = p1A.x + p2B.x;
        c2.bounce.y = p1A.y + p2B.y;

        //Add the bounce vector to the circles' velocity
        //and add mass if the circle has a mass property
        c1.vx = c1.bounce.x / c1.mass;
        c1.vy = c1.bounce.y / c1.mass;
        c2.vx = c2.bounce.x / c2.mass;
        c2.vy = c2.bounce.y / c2.mass;
    }
    return hit;
};

//#### multipleCircleCollision
/*
Checks all the circles in an array for a collision against
all the other circles in an array, using `movingCircleCollision` (above)
*/
Q.multipleCircleCollision = function(arrayOfCircles, global = false) {
    //marble collisions
    for (let i = 0; i < arrayOfCircles.length; i++) {
        //The first marble to use in the collision check
        let c1 = arrayOfCircles[i];
        for (let j = i + 1; j < arrayOfCircles.length; j++) {
            //The second marble to use in the collision check
            let c2 = arrayOfCircles[j];

            //Check for a collision and bounce the marbles apart if
            //they collide. Use an optional mass property on the sprite
            //to affect the bounciness of each marble
            Q.movingCircleCollision(c1, c2, global);
        }
    }
};

/*
#### rectangleCollision
Use it to prevent two rectangular sprites from overlapping.
Optionally, make the first retangle bounceoff the second rectangle.
Parameters:
a. A sprite object with `x`, `y` `center.x`, `center.y`, `halfWidth` and `halfHeight` properties.
b. A sprite object with `x`, `y` `center.x`, `center.y`, `halfWidth` and `halfHeight` properties.
c. Optional: true or false to indicate whether or not the first sprite
should bounce off the second sprite.
*/
Q.rectangleCollision = function(r1, r2, bounce = false, global = false) {
    let collision, combinedHalfWidths, combinedHalfHeights,
    overlapX, overlapY, dx, dy;

    //Calculate the distance vector
    if(global) {
        dx = (r1.gx + r1.halfWidth - r1.xAnchorOffset) - 
             (r2.gx + r2.halfWidth - r2.xAnchorOffset);
        dy = (r1.gy + r1.halfHeight - r1.yAnchorOffset) - 
             (r2.gy + r2.halfHeight - r2.yAnchorOffset);
    } 
    else {
        dx = r1.centerX - r2.centerX;
        dy = r1.centerY - r2.centerY;
    }

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check whether dx is less than the combined half widths
    if (Math.abs(dx) < combinedHalfWidths) {
        //A collision might be occurring!
        //Check whether dy is less than the combined half heights
        if (Math.abs(dy) < combinedHalfHeights) {
            //A collision has occurred! This is good!
            //Find out the size of the overlap on both the X and Y axes
            overlapX = combinedHalfWidths - Math.abs(dx);
            overlapY = combinedHalfHeights - Math.abs(dy);

            //The collision has occurred on the axis with the
            //*smallest* amount of overlap. Let's figure out which
            //axis that is

            if (overlapX >= overlapY) {
                //The collision is happening on the X axis
                //But on which side? dy can tell us
                if (dy > 0) {
                    collision = "top";

                    //Move the rectangle out of the collision
                    r1.y = r1.y + overlapY;
                } 
                else {
                    collision = "bottom";

                    //Move the rectangle out of the collision
                    r1.y = r1.y - overlapY;
                }
                //Bounce
                if (bounce) {
                    r1.dy *= -1;

                    /*Alternative
                    //Find the bounce surface's dx and dy properties
                    let s = {};
                    s.dx = r2.x - r2.x + r2.width;
                    s.dy = 0;

                    //Bounce r1 off the surface
                    //bounceOffSurface(r1, s);
                    */
                }
            } 
            else {
                //The collision is happening on the Y axis
                //But on which side? dx can tell us
                if (dx > 0) {
                    collision = "left";

                    //Move the rectangle out of the collision
                    r1.x = r1.x + overlapX;
                } 
                else {    
                    collision = "right";

                    //Move the rectangle out of the collision
                    r1.x = r1.x - overlapX;
                }

                //Bounce
                if (bounce) {
                    r1.dx *= -1;

                    /*Alternative
                    //Find the bounce surface's dx and dy properties
                    let s = {};
                    s.dx = 0;
                    s.dy = r2.y - r2.y + r2.height;

                    //Bounce r1 off the surface
                    bounceOffSurface(r1, s);
                    */
                }
            }
        } 
        else {
        //No collision
        }
    } 
    else {
        //No collision
    }

    //Return the collision string. it will be either "top", "right",
    //"bottom", or "left" depening on which side of r1 is touching r2.
    return collision;
}

/*
#### hitTestRectangle
Use it to find out if two rectangular sprites are touching.
Parameters:
a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
*/
Q.hitTestRectangle = function(r1, r2, global = false) {
    let hit, combinedHalfWidths, combinedHalfHeights, dx, dy;

    //A letiable to determine whether there's a collision
    hit = false;

    //Calculate the distance vector
    if (global) {
        dx = (r1.gx + r1.halfWidth - r1.xAnchorOffset) - 
             (r2.gx + r2.halfWidth - r2.xAnchorOffset);

        dy = (r1.gy + r1.halfHeight - r1.yAnchorOffset) - 
             (r2.gy + r2.halfHeight - r2.yAnchorOffset);
    } 
    else {
        dx = r1.centerX - r2.centerX;
        dy = r1.centerY - r2.centerY;
    }

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(dx) < combinedHalfWidths) {
        //A collision might be occuring. 
        //Check for a collision on the y axis
        if (Math.abs(dy) < combinedHalfHeights) {
            //There's definitely a collision happening
            hit = true;
        } 
        else {
            //There's no collision on the y axis
            hit = false;
        }
    } 
    else {
        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};

  /*
  hitTestCircleRectangle
  ----------------

  Use it to find out if a circular shape is touching a rectangular shape
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

  */

  Q.hitTestCircleRectangle = function(c1, r1, global = false) {

    let region, collision, c1x, c1y, r1x, r1y;

    //Use either global or local coordinates
    if (global) {
      c1x = c1.gx;
      c1y = c1.gy
      r1x = r1.gx;
      r1y = r1.gy;
    } else {
      c1x = c1.x;
      c1y = c1.y;
      r1x = r1.x;
      r1y = r1.y;
    }

    //Is the circle above the rectangle's top edge?
    if (c1y - c1.yAnchorOffset < r1y - r1.halfHeight - r1.yAnchorOffset) {

      //If it is, we need to check whether it's in the 
      //top left, top center or top right
      if (c1x - c1.xAnchorOffset < r1x - 1 - r1.halfWidth - r1.xAnchorOffset) {
        region = "topLeft";
      } else if (c1x - c1.xAnchorOffset > r1x + 1 + r1.halfWidth - r1.xAnchorOffset) {
        region = "topRight";
      } else {
        region = "topMiddle";
      }
    }

    //The circle isn't above the top edge, so it might be
    //below the bottom edge
    else if (c1y - c1.yAnchorOffset > r1y + r1.halfHeight - r1.yAnchorOffset) {

      //If it is, we need to check whether it's in the bottom left,
      //bottom center, or bottom right
      if (c1x - c1.xAnchorOffset < r1x - 1 - r1.halfWidth - r1.xAnchorOffset) {
        region = "bottomLeft";
      } else if (c1x - c1.xAnchorOffset > r1x + 1 + r1.halfWidth - r1.xAnchorOffset) {
        region = "bottomRight";
      } else {
        region = "bottomMiddle";
      }
    }

    //The circle isn't above the top edge or below the bottom edge,
    //so it must be on the left or right side
    else {
      if (c1x - c1.xAnchorOffset < r1x - r1.halfWidth - r1.xAnchorOffset) {
        region = "leftMiddle";
      } else {
        region = "rightMiddle";
      }
    }

    //Is this the circle touching the flat sides
    //of the rectangle?
    if (region === "topMiddle" || region === "bottomMiddle" || region === "leftMiddle" || region === "rightMiddle") {

      //Yes, it is, so do a standard rectangle vs. rectangle collision test
      collision = this.hitTestRectangle(c1, r1, global);
    }

    //The circle is touching one of the corners, so do a
    //circle vs. point collision test
    else {
      let point = {};

      switch (region) {
        case "topLeft":
          point.x = r1x - r1.xAnchorOffset;
          point.y = r1y - r1.yAnchorOffset;
          break;

        case "topRight":
          point.x = r1x + r1.width - r1.xAnchorOffset;
          point.y = r1y - r1.yAnchorOffset;
          break;

        case "bottomLeft":
          point.x = r1x - r1.xAnchorOffset;
          point.y = r1y + r1.height - r1.yAnchorOffset;
          break;

        case "bottomRight":
          point.x = r1x + r1.width - r1.xAnchorOffset;
          point.y = r1y + r1.height - r1.yAnchorOffset;
      }

      //Check for a collision between the circle and the point
      collision = this.hitTestCirclePoint(c1, point, global);
    }

    //Return the result of the collision.
    //The return value will be `undefined` if there's no collision
    if (collision) {
      return region;
    } else {
      return collision;
    }
  };

/*
hitTestCirclePoint
------------------
Use it to find out if a circular shape is touching a point
Parameters: 
a. A sprite object with `centerX`, `centerY`, and `radius` properties.
b. A point object with `x` and `y` properties.
*/
Q.hitTestCirclePoint = function(c1, point, global = false) {
    //A point is just a circle with a diameter of 1 pixel, 
    //so we can cheat. All we need to do is an ordinary circle vs.
    //circle Collision test. Just supply the point with the properties
    //it needs
    point.diameter = 1;
    point.width = point.diameter;
    point.radius = 0.5;
    point.centerX = point.x;
    point.centerY = point.y;
    point.gx = point.x;
    point.gy = point.y;
    point.xAnchorOffset = 0;
    point.yAnchorOffset = 0;

    return Q.hitTestCircle(c1, point, global); 
};

  /*
  circleRectangleCollision
  ------------------------

  Use it to bounce a circular shape off a rectangular shape
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

  */

  Q.circleRectangleCollision = function(
    c1, r1, bounce = false, global = false
  ) {

    let region, collision, c1x, c1y, r1x, r1y;

    //Use either the global or local coordinates
    if (global) {
      c1x = c1.gx;
      c1y = c1.gy;
      r1x = r1.gx;
      r1y = r1.gy;
    } else {
      c1x = c1.x;
      c1y = c1.y;
      r1x = r1.x;
      r1y = r1.y;
    }

    //Is the circle above the rectangle's top edge?
    if (c1y - c1.yAnchorOffset < r1y - r1.halfHeight - r1.yAnchorOffset) {

      //If it is, we need to check whether it's in the 
      //top left, top center or top right
      if (c1x - c1.xAnchorOffset < r1x - 1 - r1.halfWidth - r1.xAnchorOffset) {
        region = "topLeft";
      } else if (c1x - c1.xAnchorOffset > r1x + 1 + r1.halfWidth - r1.xAnchorOffset) {
        region = "topRight";
      } else {
        region = "topMiddle";
      }
    }

    //The circle isn't above the top edge, so it might be
    //below the bottom edge
    else if (c1y - c1.yAnchorOffset > r1y + r1.halfHeight - r1.yAnchorOffset) {

      //If it is, we need to check whether it's in the bottom left,
      //bottom center, or bottom right
      if (c1x - c1.xAnchorOffset < r1x - 1 - r1.halfWidth - r1.xAnchorOffset) {
        region = "bottomLeft";
      } else if (c1x - c1.xAnchorOffset > r1x + 1 + r1.halfWidth - r1.xAnchorOffset) {
        region = "bottomRight";
      } else {
        region = "bottomMiddle";
      }
    }

    //The circle isn't above the top edge or below the bottom edge,
    //so it must be on the left or right side
    else {
      if (c1x - c1.xAnchorOffset < r1x - r1.halfWidth - r1.xAnchorOffset) {
        region = "leftMiddle";
      } else {
        region = "rightMiddle";
      }
    }

    //Is this the circle touching the flat sides
    //of the rectangle?
    if (region === "topMiddle" || region === "bottomMiddle" || region === "leftMiddle" || region === "rightMiddle") {

      //Yes, it is, so do a standard rectangle vs. rectangle collision test
      collision = this.rectangleCollision(c1, r1, bounce, global);
    }

    //The circle is touching one of the corners, so do a
    //circle vs. point collision test
    else {
      let point = {};

      switch (region) {
        case "topLeft":
          point.x = r1x - r1.xAnchorOffset;
          point.y = r1y - r1.yAnchorOffset;
          break;

        case "topRight":
          point.x = r1x + r1.width - r1.xAnchorOffset;
          point.y = r1y - r1.yAnchorOffset;
          break;

        case "bottomLeft":
          point.x = r1x - r1.xAnchorOffset;
          point.y = r1y + r1.height - r1.yAnchorOffset;
          break;

        case "bottomRight":
          point.x = r1x + r1.width - r1.xAnchorOffset;
          point.y = r1y + r1.height - r1.yAnchorOffset;
      }

      //Check for a collision between the circle and the point
      collision = this.circlePointCollision(c1, point, bounce, global);
    }

    if (collision) {
      return region;
    } else {
      return collision;
    }
  };

/*
circlePointCollision
--------------------
Use it to bounce a circular sprite off a point.
Parameters: 
a. A sprite object with `centerX`, `centerY`, and `radius` properties.
b. A point object with `x` and `y` properties.

*/
Q.circlePointCollision = function(c1, point, bounce = false, global = false) {
    //A point is just a circle with a diameter of 1 pixel, so we can
    //cheat. All we need to do is an ordinary circle vs. circle Collision
    //test. Just supply the point with the properties it needs.
    point.diameter = 1;
    point.width = point.diameter;
    point.radius = 0.5;
    point.centerX = point.x;
    point.centerY = point.y;
    point.gx = point.x;
    point.gy = point.y;
    point.xAnchorOffset = 0;
    point.yAnchorOffset = 0;

    return Q.circleCollision(c1, point, bounce, global); 
}

/*
#### bounceOffSurface

Use this to bounce an object off another object. It's only used by the other collision functions,
so you don't need to call it yourself.
Parameters:
a. An object with `vx` and `vy` properties. This represents the object that is colliding
with a surface.
b. An object with `x` and `y` properties. This represents the surface that the object
is colliding into.
The first object can optionally have a mass property that's greater than 1. The mass will
be used to dampen the bounce effect.
*/
function bounceOffSurface(o, s) {
    let dp1, dp2,
        p1 = {},
        p2 = {},
        bounce = {},
        mass = o.mass || 1;

    //1. Calculate the collision surface's properties
    //Find the surface vector's left normal
    s.lx = s.y;
    s.ly = -s.x;

    //Find its magnitude
    s.magnitude = Math.sqrt(s.x * s.x + s.y * s.y);

    //Find its normalized values
    s.dx = s.x / s.magnitude;
    s.dy = s.y / s.magnitude;

    //2. Bounce the object (o) off the surface (s)

    //Find the dot product between the object and the surface
    dp1 = o.vx * s.dx + o.vy * s.dy;

    //Project the object's velocity onto the collision surface
    p1.vx = dp1 * s.dx;
    p1.vy = dp1 * s.dy;

    //Find the dot product of the object and the surface's left normal (s.l.x and s.l.y)
    dp2 = o.vx * (s.lx / s.magnitude) + o.vy * (s.ly / s.magnitude);

    //Project the object's velocity onto the surface's left normal
    p2.vx = dp2 * (s.lx / s.magnitude);
    p2.vy = dp2 * (s.ly / s.magnitude);

    //Reverse the projection on the surface's left normal
    p2.vx *= -1;
    p2.vy *= -1;

    //Add up the projections to create a new bounce vector
    bounce.x = p1.vx + p2.vx;
    bounce.y = p1.vy + p2.vy;

    //Assign the bounce vector to the object's velocity
    //with optional mass to dampen the effect
    o.vx = bounce.x / mass;
    o.vy = bounce.y / mass;
}

/*
//#### hit
An universal collision method that works for rectangular and circular sprites.
it figures out what kinds of sprites are involved in the collision and
automatically chooses the correct collision method.
*/
Q.hit = function(a, b, react = false, bounce = false, global = false, extra) {
    let collision,
        aIsASprite = a.parent !== undefined,
        bIsASprite = b.parent !== undefined;

    //Check to make sure one of the arguments isn't an array
    if (aIsASprite && b instanceof Array || bIsASprite && a instanceof Array) {
        //If it is, check for a collision between a sprite and an array
        spriteVsArray();
    } 
    else {
        //If one of the arguments isn't an array, find out what type of
        //collision check to run
        collision = findCollisionType(a, b);
        if (collision && extra) extra(collision);
    }

    //Return the result of the collision.
    //It will be `undefined` if there's no collision and `true` if
    //there is a collision. `rectangleCollision` sets `collsision` to
    //"top", "bottom", "left" or "right" depeneding on which side the
    //collision is occuring on
    return collision;

    function findCollisionType(a, b) {
        //Are `a` and `b` both sprites?
        //(We have to check again if this function was called from
        //`spriteVsArray`)
        let aIsASprite = a.parent !== undefined,
            bIsASprite = b.parent !== undefined;

        if (aIsASprite && bIsASprite) {
            //Yes, but what kind of sprites?
            if(a.diameter && b.diameter) {
                //They're circles
                return circleVsCircle(a, b);
            } 
            else if (a.diameter && !b.diameter) {
                //The first one is a circle and the second is a rectangle
                return circleVsRectangle(a, b);
            } 
            else {
                //They're rectangles
                return rectangleVsRectangle(a, b);
            }
        }

        //They're not both sprites, so what are they?
        //Is `a` not a sprite and does it have x and y properties?
        else if (bIsASprite && !(a.x === undefined) && !(a.y === undefined)) {
            //Yes, so this is a point vs. sprite collision test
            return Q.hitTestPoint(a, b);
        }
        else {
            //The user is trying to test some incompatible objects
            throw new Error("I'm sorry, " + a + " and " + b + " cannot be use together in a collision test.");
        }
    }

    function spriteVsArray() {
        //If `a` happens to be the array, flip it around so that it becomes `b`
        if (a instanceof Array) {
            let [a, b] = [b, a];
        }

        //Loop through the array in reverse
        for (let i = b.length - 1; i >= 0; i--) {
            let sprite = b[i];
            collision = findCollisionType(a, sprite);
            if (collision && extra) extra(collision, sprite);
        }
    }

    function circleVsCircle(a, b) {
        //If the circles shouldn't react to the collision,
        //just test to see if they're touching
        if(!react) {
            return Q.hitTestCircle(a, b, global);
        }

        //Yes, the circles should react to the collision
        else {
            //Are they both moving?
            if (a.vx + a.vy !== 0 && b.vx + b.vy !== 0) {
                //Yes, they are both moving
                //(moving circle collisions always bounce apart so there's
                //no need for the third, `bounce`, argument)
                return Q.movingCircleCollision(a, b, global);
            }
            else {
                //No, they're not both moving
                return Q.circleCollision(a, b, bounce, global);
            }
        }
    }

    function rectangleVsRectangle(a, b) {
        //If the rectangles shouldn't react to the collision, just
        //test to see if they're touching
        if(!react) {
            return Q.hitTestRectangle(a, b, global);
        }
        //Yes
        else {
            //Should they bounce apart?
            //Yes
            if(bounce) {
                return Q.rectangleCollision(a, b, true, global);
            }
            //No
            else {
                return Q.rectangleCollision(a, b, false, global);
            }
        }
    }

    function circleVsRectangle(a, b) {
        //If the rectangles shouldn't react to the collision, just
        //test to see if they're touching
        if(!react) {
            return Q.hitTestCircleRectangle(a, b, global);
        } 
        else {
            return Q.circleRectangleCollision(a, b, bounce, global);
        }
    }
};

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 */
Q.TWEEN = (function() {
    let _tweens = [];

    return {
        REVISION: '14',
        getAll() {
            return _tweens;
        },
        removeAll() {
            _tweens = [];
        },

        add(tween) {
            _tweens.push(tween);
        },
        remove(tween) {
            let i = _tweens.indexOf(tween);
            if(i !== -1) {
                _tweens.splice(i, 1);
            }
        },
        update(time) {
            if(_tweens.length === 0) return false;

            let i = 0;
            time = (time !== undefined) ? time : window.performance.now();

            while(i < _tweens.length) {
                if(_tweens[i].update(time)) {
                    i++;
                }
                else {
                    _tweens.splice(i, 1);
                }
            }
            return true;
        }
    };
})();

Q.TWEEN.Tween = class {
    constructor(object) {
        this._object = object;
        this._valuesStart = {};
        this._valuesEnd = {};
        this._valuesStartRepeat = {};
        this._duration = 1000;
        this._repeat = 0;
        this._yoyo = false;
        this._isPlaying = false;
        this._reversed = false;
        this._delayTime = 0;
        this._startTime = null;
        this._easingFunction = Q.TWEEN.Easing.Linear.None;
        this._interpolationFunction = Q.TWEEN.Interpolation.Linear;
        this._chainetimeweens = [];
        this._onStartCallback = null;
        this._onStartCallbackFired = false;
        this._onUpdateCallback = null;
        this._onCompleteCallback = null;
        this._onStopCallback = null;

        // Set all starting values present on the target object
        for (let field in object) {
            this._valuesStart[field] = parseFloat(object[field], 10);
        }
    }
    to(properties, duration = 1000) {
        this._duration = duration;
        this._valuesEnd = properties;
        return this;
    }
    start(time) {
        Q.TWEEN.add(this);

        this._isPlaying = true;
        this._onStartCallbackFired = false;

        this._startTime = (time !== undefined) ? time : window.performance.now();
        this._startTime += this._delayTime;

        for (let property in this._valuesEnd) {
            // check if an Array was provided as property value
            if (this._valuesEnd[property] instanceof Array) {
                if (this._valuesEnd[property].length === 0) {
                    continue;
                }
                // create a local copy of the Array with the start value at the front
                this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);
            }
            //if(this._valuesStart[property] === undefined) continue;
            this._valuesStart[property] = this._object[property];
            if((this._valuesStart[property] instanceof Array) === false) {
                // Ensures we're using numbers, not strings
                this._valuesStart[property] *= 1.0;
            }
            this._valuesStartRepeat[property] = this._valuesStart[property] || 0;
        }
        return this;
    }
    stop() {
        if (!this._isPlaying) {
            return this;
        }
        Q.TWEEN.remove(this);
        this._isPlaying = false;
        if (this._onStopCallback !== null) {
           this._onStopCallback.call(this._object);
        }
        this.stopChainetimeweens();
        return this;
    }
    stopChainetimeweens() {
        for (let i = 0, numChainetimeweens = this._chainetimeweens.length; i < numChainetimeweens; i++) {
            this._chainetimeweens[i].stop();
        }
    }
    delay(amount) {
        this._delayTime = amount;
        return this;
    }
    repeat(times = Infinity) {
        this._repeat = times;
        return this;
    }
    yoyo(yoyo) {
        this._yoyo = yoyo;
        return this;
    }
    easing (easing) {
        this._easingFunction = easing;
        return this;
    }
    interpolation (interpolation) {
        this._interpolationFunction = interpolation;
        return this;
    }
    chain () {
        this._chainetimeweens = arguments;
        return this;
    }
    onStart (callback) {
        this._onStartCallback = callback;
        return this;
    }
    onUpdate (callback) {
        this._onUpdateCallback = callback;
        return this;
    }
    onComplete (callback) {
        this._onCompleteCallback = callback;
        return this;
    }
    onStop(callback) {
        this._onStopCallback = callback;
        return this;
    }
    update (time) {
        let property, elapsed, value;

        if(time < this._startTime) return true;

        if (this._onStartCallbackFired === false) {
            if (this._onStartCallback !== null) {
                this._onStartCallback.call(this._object);
            }
            this._onStartCallbackFired = true;
        }
        elapsed = (time - this._startTime) / this._duration;
        elapsed = elapsed > 1 ? 1 : elapsed;

        value = this._easingFunction(elapsed);

        for (property in this._valuesEnd) {
            //if(this._valuesStart[property] === undefined) continue;

            let start = this._valuesStart[property] || 0;
            let end = this._valuesEnd[property];

            if (end instanceof Array) {
                this._object[property] = this._interpolationFunction(end, value);
            }
            else {
                // Parses relative end values with start as base (e.g.: +10, -3)
                if (typeof(end) === "string") {
                    if(end.charAt(0) === '+' || end.charAt(0) === '-')
                        end = start + parseFloat(end, 10);
                    else
                        end = parseFloat(end, 10);
                }
                // protect against non numeric properties.
                if (typeof(end) === "number") {
                    this._object[property] = start + (end - start) * value;
                }
            }
        }
        if (this._onUpdateCallback !== null) {
            this._onUpdateCallback.call(this._object, value);
        }

        if (elapsed == 1) {
            if (this._repeat > 0) {
                if(isFinite(this._repeat)) {
                    this._repeat--;
                }
                // reassign starting values, restart by making startTime = now
                for(property in this._valuesStartRepeat) {
                    if (typeof(this._valuesEnd[ property]) === "string") {
                        this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property], 10);
                    }

                    if (this._yoyo) {
                        let tmp = this._valuesStartRepeat[property];
                        this._valuesStartRepeat[property] = this._valuesEnd[property];
                        this._valuesEnd[ property ] = tmp;
                    }

                    this._valuesStart[ property ] = this._valuesStartRepeat[ property ];
                }

                if (this._yoyo) {
                    this._reversed = !this._reversed;
                }
                this._startTime = time + this._delayTime;

               return true;
            }
            else {
                if (this._onCompleteCallback !== null) {
                    this._onCompleteCallback.call(this._object);
                }

                for (let i = 0, numChainetimeweens = this._chainetimeweens.length; i < numChainetimeweens; i++) {
                    this._chainetimeweens[i].start(this._startTime + this._duration);
                }
                return false;
            }
        }
        return true;
    }
};

Q.TWEEN.Easing = {
    Linear: {
        None(k) {
            return k;
        }
    },
    Quadratic: {
        In(k) {
            return k * k;
        },
        Out(k) {
            return k * (2 - k);
        },
        InOut(k) {
            if ((k *= 2) < 1) return 0.5 * k * k;
            return -0.5 * (--k * (k - 2) - 1);
        }
    },
    Cubic: {
        In(k) {
            return k * k * k;
        },
        Out(k) {
            return --k * k * k + 1;
        },
        InOut(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k;
            return 0.5 * ((k -= 2) * k * k + 2);
        }
    },
    Quartic: {
        In(k) {
            return k * k * k * k;
        },
        Out(k) {
            return 1 - (--k * k * k * k);
        },
        InOut(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k;
            return - 0.5 * ((k -= 2) * k * k * k - 2);
        }
    },
    Quintic: {
        In(k) {
            return k * k * k * k * k;
        },
        Out(k) {
            return --k * k * k * k * k + 1;
        },
        InOut(k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        }
    },
    SmoothStep: {
        Simple(k) {
            return k * k * (3 - 2 * k);
        },
        Squared(k) {
            return Math.pow((k * k * (3 - 2 * k)), 2);
        },
        Cubed(k) {
            return Math.pow((k * k * (3 - 2 * k)), 3);
        }
    },
    Sinusoidal: {
        In(k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        Out(k) {
            return Math.sin(k * Math.PI / 2);
        },
        InOut(k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        }
    },
    Exponential: {
        In(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);
        },
        InOut(k) {
            if (k === 0) return 0;
            if (k === 1) return 1;
            if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
            return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);
        }
    },
    Circular: {
        In(k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out(k) {
            return Math.sqrt(1 - (--k * k));
        },
        InOut(k) {
            if ((k *= 2) < 1) return - 0.5 * (Math.sqrt(1 - k * k) - 1);
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        }
    },
    Elastic: {
        In(k) {
            let s, a = 0.1, p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) { a = 1; s = p / 4; }
            else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        },
        Out(k) {
            let s, a = 0.1, p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) { a = 1; s = p / 4; }
            else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return (a * Math.pow(2, - 10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
        },
        InOut(k) {
            let s, a = 0.1, p = 0.4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) { a = 1; s = p / 4; }
            else s = p * Math.asin(1 / a) / (2 * Math.PI);
            if ((k *= 2) < 1) return - 0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
        }
    },
    Back: {
        In(k) {
            let s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        Out(k) {
            let s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        InOut(k) {
            let s = 1.70158 * 1.525;
            if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        }
    },
    Bounce: {
        In(k) {
            return 1 - Q.TWEEN.Easing.Bounce.Out(1 - k);
        },
        Out(k) {
            if (k < (1 / 2.75)) {
                return 7.5625 * k * k;
            } else if (k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            } else if (k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            } else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }
        },
        InOut(k) {
            if (k < 0.5) return Q.TWEEN.Easing.Bounce.In(k * 2) * 0.5;
            return Q.TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
        }
    }
};

Q.TWEEN.Interpolation = {
    Linear(v, k) {
        let m = v.length - 1, f = m * k, i = Math.floor(f), fn = Q.TWEEN.Interpolation.Utils.Linear;

        if (k < 0) return fn(v[ 0 ], v[ 1 ], f);
        if (k > 1) return fn(v[ m ], v[ m - 1 ], m - f);
        return fn(v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i);
    },
    Bezier(v, k) {
        let b = 0, n = v.length - 1, pw = Math.pow, bn = Q.TWEEN.Interpolation.Utils.Bernstein, i;

        for (i = 0; i <= n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[ i ] * bn(n, i);
        }
        return b;
    },
    CatmullRom(v, k) {
        let m = v.length - 1, f = m * k, i = Math.floor(f), fn = Q.TWEEN.Interpolation.Utils.CatmullRom;

        if (v[ 0 ] === v[ m ]) {
            if (k < 0) i = Math.floor(f = m * (1 + k));
            return fn(v[ (i - 1 + m) % m ], v[ i ], v[ (i + 1) % m ], v[ (i + 2) % m ], f - i);
        } else {
            if (k < 0) return v[ 0 ] - (fn(v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f) - v[ 0 ]);
            if (k > 1) return v[ m ] - (fn(v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m) - v[ m ]);
            return fn(v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i);
        }
    },
    Utils: {
        Linear(p0, p1, t) {
            return (p1 - p0) * t + p0;
        },
        Bernstein(n , i) {
            let fc = Q.TWEEN.Interpolation.Utils.Factorial;
            return fc(n) / fc(i) / fc(n - i);
        },
        Factorial: (function () {
            let a = [ 1 ];
            return function (n) {
                let s = 1, i;
                if (a[ n ]) return a[ n ];
                for (i = n; i > 1; i--) s *= i;
                return a[ n ] = s;
            };
        })(),
        CatmullRom(p0, p1, p2, p3, t) {
            let v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, t2 = t * t, t3 = t * t2;
            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
        }
    }
};

}).call(this, Game);
