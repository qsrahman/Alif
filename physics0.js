(function(Q) {
'use strict';

class World {
    constructor(game) {
        this.game = game;
        this.gravity = Q.Point();
        this.bodies = [];
        this.collisionGroups = {};
    }
    addBody(body) {
        let idx = this.bodies.indexOf(body);
        if(idx === -1) {
            body.world = this;
            this.bodies.push(body);
            this.addBodyCollision(body);
            return true;
        }
        return false;
    }
    removeBody(body) {
        let idx = this.bodies.indexOf(body);
        if(idx !== -1) {
            this.bodies.splice(idx, 1);
            return true;
        }
        return false;
    }
    addBodyCollision(body) {
        if (typeof body.collisionGroup !== 'number') return;

        let group = body.collisionGroup;

        this.collisionGroups[group] = this.collisionGroups[group] || [];

        if (this.collisionGroups[group].indexOf(body) === -1)
            this.collisionGroups[group].push(body);
    }
    removeBodyCollision(body) {
        if (typeof body.collisionGroup !== 'number') return;

        let group = body.collisionGroup;
        
        if (!this.collisionGroups[group]) return;

        if (this.collisionGroups[group].indexOf(body) !== -1)
            this.collisionGroups[group].erase(body);
    }
    collide(body) {

    }
    update(dt) {
        for (let i = this.bodies.length - 1; i >= 0; i--) {
            this.bodies[i].update(dt);
        }
    }
}

class Collisions {
    constructor() {

    }
    hitTest(a, b, react, bounce, global) {
        let hit;

        if(a.shapeId === Circle.ShapeID && b.shapeId === Circle.ShapeID) {
            hit = circleVsCircle(a, b, react, bounce, global);
        }
        else if(a.shapeId === Circle.ShapeID && b.shapeId !== Circle.ShapeID) {
            hit = circleVsRectangle(a, b, react, bounce, global);
        }
        else {
            hit = rectangleVsRectangle(a, b, react, bounce, global);
        }

        if(hit) {
            if(a.collide) a.collide(b, hit);
            if(b.collide) b.collide(a, hit);
        }

        return hit;
    }
    circleVsCircle(a, b, react, bounce, global) {
        //If the circles shouldn't react to the collision,
        //just test to see if they're touching
        if(!react) {
            return Q.hitTestCircle(a, b, global);
        }

        //Yes, the circles should react to the collision
        else {
            //Are they both moving?
            if (a.velocity.x + a.velocity.y !== 0 && 
                b.velocity.x + b.velocity.y !== 0) {
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
    circleVsRectangle(a, b, react, bounce, global) {
        //If the rectangles shouldn't react to the collision, just
        //test to see if they're touching
        if(!react) {
            return Q.hitTestCircleRectangle(a, b, global);
        } 
        else {
            return Q.circleRectangleCollision(a, b, bounce, global);
        }
    }
    rectangleVsRectangle(a, b, react, bounce, global) {
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
}

class Body {
    constructor(shapeId, sprite) {
        this.shapeId = shapeId;
        this.sprite = sprite;
        this.position = Q.Point(sprite.x, sprite.y);
        this.velocity = Q.Point();
        this.force = Q.Point();
        this.mass = 0;
        this.bounce = 1;
        this.damping = 0;

        this.world = null;

        this.collisionGroup = null;
        this.collideAgainst = [];

        this.id = ++Body.id;
    }
    setCollisionGroup(group) {
        if (this.world && typeof this.collisionGroup === 'number') 
            this.world.removeBodyCollision(this);

        this.collisionGroup = group;        
        if (this.world) this.world.addBodyCollision(this);
    }
    setCollideAgainst(...args) {
        this.collideAgainst.length = 0;
        for (let i = 0; i < args.length; i++) {
            this.collideAgainst.push(args[i]);
        }
    }
    collide() {
        return true;
    }
    afterCollide() {
    }
    update(dt) {
        if (this.mass !== 0) {
            this.velocity.x += this.gravity.x * this.mass * dt;
            this.velocity.y += this.gravity.y * this.mass * dt;
        }

        this.velocity.x += this.force.x * dt;
        this.velocity.y += this.force.y * dt;

        if (this.damping > 0 && this.damping < 1) {
            this.velocity.x *= Math.pow(1 - this.damping, dt);
            this.velocity.y *= Math.pow(1 - this.damping, dt);
        }

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        sprite.position.x = this.position.x;
        sprite.position.y = this.position.y;
    }
}
Body.id = 0;

class AABB extends Body {
    constructor(sprite) {
        super(AABB.ShapeID, sprite);

        this.width = sprite.width;
        this.height = sprite.height;
    }
}
AABB.ShapeID = 0;

class Circle extends Body {
    constructor(sprite) {
        super(Circle.ShapeID, sprite);
        sprite.circular = true;
        this.radius = sprite.radius;
    }
}
Circle.ShapeID = 1;

Q.World = World;
Q.AABB = AABB;
Q.Circle = Circle;

}).call(this, Alif);
