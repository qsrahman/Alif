(function(Q) {
'use strict';

class World {
    constructor(game) {
        this.game = game;
        this.gravity = Q.Point();
        this.bodies = [];
    }
    addBody(body) {
        let idx = this.bodies.indexOf(body);
        if(idx === -1) {
            body.world = this;
            this.bodies.push(body);
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
    update(dt) {
        for (let i = this.bodies.length - 1; i >= 0; i--) {
            this.bodies[i].update(dt);
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

        this.id = ++Body.id;
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
        this.radius = sprite.radius;
    }
}
Circle.ShapeID = 1;

Q.World = World;
Q.AABB = AABB;
Q.Circle = Circle;

}).call(this, Alif);
