(function(Q) {
'use strict';

class World {
    constructor(x = 0, y = 980) {
        this.gravity = new Q.Vector(x, y);
        this.solver = new CollisionSolver();
        
        this.bodies = [];
        this.collisionGroups = {};
    }
    addBody(body) {
        let idx = this.bodies.indexOf(body);
        if(idx === -1) {
            body.world = this;
            body._remove = false;
            this.bodies.push(body);
            this.addBodyCollision(body);
            return true;
        }
        return false;
    }
    removeBody(body) {
        if (!body.world) return false;

        let idx = this.bodies.indexOf(body);
        if(idx !== -1) {
            body.world = null;
            body._remove = true;
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
        let g, i, b, group;

        for (g = 0; g < body.collideAgainst.length; g++) {
            body._collides.length = 0;
            group = this.collisionGroups[body.collideAgainst[g]];
            
            if (!group) continue;

            for (i = group.length - 1; i >= 0; i--) {
                //if (!group) break;
                b = group[i];
                if (body !== b) {
                    if (this.solver.hitTest(body, b)) {
                        body._collides.push(b);
                    }
                }
            }
            for (i = body._collides.length - 1; i >= 0; i--) {
                if (this.solver.hitResponse(body, body._collides[i])) {
                    body.afterCollide(body._collides[i]);
                }
            }
        }
    }
    update(dt) {
        let i, j;

        for (i = this.bodies.length - 1; i >= 0; i--) {
            if (this.bodies[i]._remove) {
                this.removeBodyCollision(this.bodies[i]);
                this.bodies.splice(i, 1);
            }
            else {
                this.bodies[i].update(dt);
            }
        }

        for (i in this.collisionGroups) {
            // Remove empty collision group
            if (this.collisionGroups[i].length === 0) {
                delete this.collisionGroups[i];
                continue;
            }
            for (j = this.collisionGroups[i].length - 1; j >= 0; j--) {
                if (this.collisionGroups[i][j] && this.collisionGroups[i][j].collideAgainst.length > 0) {
                    this.collide(this.collisionGroups[i][j]);
                }
            }
        }
    }
}

class CollisionSolver {
    constructor() {

    }
    hitTest(a, b) {
        if (a.width && b.width) {
            return !(
                a.position.y + a.height / 2 <= b.position.y - b.height / 2 ||
                a.position.y - a.height / 2 >= b.position.y + b.height / 2 ||
                a.position.x - a.width / 2 >= b.position.x + b.width / 2 ||
                a.position.x + a.width / 2 <= b.position.x - b.width / 2
            );
        }
        if (a.radius && b.radius) {
            return (a.radius + b.radius > a.position.distance(b.position));
        }
        if (a.width && b.radius || a.radius && b.width) {
            let rect = a.width ? a : b;
            let circle = a.radius ? a : b;

            let x = Math.max(rect.position.x - rect.width / 2, Math.min(rect.position.x + rect.width / 2, circle.position.x));
            let y = Math.max(rect.position.y - rect.height / 2, Math.min(rect.position.y + rect.height / 2, circle.position.y));

            let dist = Math.pow(circle.position.x - x, 2) + Math.pow(circle.position.y - y, 2);

            return dist < (circle.radius * circle.radius);
        }
        return false;
    }
    hitResponse(a, b) {
        //Execute the collide function of body a to let the object know 
        //that a collision occured. The response of the function tells us 
        //wether we should perform a hit response.
        if (a.collide(b)) {
            //Both wallShapes. No hitresponse need to be dealt with
            if (a.fixed && b.fixed) return true;

            let restitution = Math.sqrt(a.restitution * b.restitution) * 1.006;
            
            if (a.fixed || b.fixed) {
                //body<=>wall collision. The speed of the non-wall body changes only.
                let wall, ball;
                if (a.fixed) {
                    wall = a;
                    ball = b;
                } 
                else {
                    wall = b;
                    ball = a;
                }
                //calculate the current distance of the wall/body and also
                //estimate of the distance that they will just touch each other
                let distanceBW = ball.position.sub(wall.position);
                let distanceTouch = new Q.Vector();
                
                if (wall.shapeId === AABB.ShapeID) 
                    distanceTouch.addTo(wall.width / 2, wall.height / 2);
                else if (wall.shapeId === Circle.ShapeID) 
                    distanceTouch.addTo(wall.radius);
                else 
                    return true;

                if (ball.shapeId === AABB.ShapeID) 
                    distanceTouch.addTo(ball.width / 2, ball.height / 2);
                else if (ball.shapeId === Circle.ShapeID) 
                    distanceTouch.addTo(ball.radius);
                else 
                    return true;
    
                //calulate the absolute width + height of the overlap square
                let overlap = new Q.Vector(
                    Math.abs(Math.abs(distanceTouch.x) - Math.abs(distanceBW.x)),
                    Math.abs(Math.abs(distanceTouch.y) - Math.abs(distanceBW.y))
                );
    
                //execute collision
                if (overlap.x > overlap.y) {
                    if (ball.velocity.y > 0 && distanceBW.y < 0) {
                        //TOP bounce
                        ball.velocity.x *= restitution;
                        ball.velocity.y *= -1 * restitution;
                        ball.position.y -= overlap.y;
                    } 
                    else if (ball.velocity.y < 0 && distanceBW.y >= 0) {
                        //BOTTOM bounce
                        ball.velocity.x *= restitution;
                        ball.velocity.y *= -1 * restitution;
                        ball.position.y += overlap.y;
                    }
                } 
                else {
                    if (ball.velocity.x > 0 && distanceBW.x < 0) {
                        //LEFT bounce
                        ball.velocity.x *= -1 * restitution;
                        ball.velocity.y *= restitution;
                        ball.position.x -= overlap.x;
                    } 
                    else if (ball.velocity.x < 0 && distanceBW.x >= 0) {
                        //RIGHT bounce
                        ball.velocity.x *= -1 * restitution;
                        ball.velocity.y *= restitution;
                        ball.position.x += overlap.x;
                    }
                }
                return true;
            }
    
            //Collision between two normal bodies
            //prepare masses
            let a_mass = a.mass;
            let b_mass = b.mass;

            if (a_mass == 0) {
                a_mass = 0.001;
            }
            if (b_mass == 0) {
                b_mass = 0.001;
            }
    
            //circles
            if (a.shapeId === Circle.ShapeID && b.shapeId === Circle.ShapeID) {
                let posA = a.position.clone();
                let velA = a.velocity.clone();
                let posB = b.position.clone();
                let velB = b.velocity.clone();
                let baseAngle = posA.angleBetween(posB);
    
                //rotate
                velA.rotateBy(-baseAngle);
                velB.rotateBy(-baseAngle);
    
                //A en B
                if (velA.x - velB.x > 0) {
                    let vAxNew = (velA.x * (a_mass - b_mass) + 2 * b_mass * velB.x) / (a_mass + b_mass);
                    let vBxNew = (velB.x * (a_mass - b_mass) + 2 * b_mass * velA.x) / (a_mass + b_mass);
    
                    velA.x = vAxNew * restitution;
                    velB.x = vBxNew * restitution;

                    a.velocity.set(velA.rotateBy(baseAngle));
                    b.velocity.set(velB.rotateBy(baseAngle));
                }

                this.seperateBodies(a, b);
                
                return true;
            }
    
            //calculate an impulse vector based on velocity and mass of each body
            let distanceAB = b.position.sub(a.position);
            let velocityAB = b.velocity.sub(a.velocity);

            //is distance decreasing? Then take some action
            let dDistance = distanceAB.mul(velocityAB);
            
            if (dDistance.x < 0) {
                //execute impuls
                let avx = a.velocity.x;
                let bvx = b.velocity.x;
                a.velocity.x = (avx * (a_mass - b_mass) + 2 * b_mass * bvx) / (a_mass + b_mass) * restitution;
                b.velocity.x = (bvx * (b_mass - a_mass) + 2 * a_mass * avx) / (a_mass + b_mass) * restitution;
            }
            
            if (dDistance.y < 0) {
                //execute impuls
                let avy = a.velocity.y;
                let bvy = b.velocity.y;
                a.velocity.y = (avy * (a_mass - b_mass) + 2 * b_mass * bvy) / (a_mass + b_mass) * restitution;
                b.velocity.y = (bvy * (b_mass - a_mass) + 2 * a_mass * avy) / (a_mass + b_mass) * restitution;
            }
            
            this.seperateBodies(a, b);

            return true;
        }
        return false;
    }
    seperateBodies(a, b) {
        let distanceBW = b.position.sub(a.position),
            distanceTouch = new Q.Vector(),
            overlap;
    
        if (a.shapeId === Circle.ShapeID && b.shapeId === Circle.ShapeID) {
            // circle <=> circle
            distanceTouch = a.radius + b.radius;
            overlap = distanceBW.mul(1 - distanceBW.length / distanceTouch);
            a.position.x -= overlap.x / 2;
            a.position.y -= overlap.y / 2;
            b.position.x += overlap.x / 2;
            b.position.y += overlap.y / 2;

            return;
        }
    
        // circle/square <=> circle/square
        if (a.shapeId === AABB.ShapeID) 
            distanceTouch.add(a.width / 2, a.height / 2);
        else if (a.shapeId === Circle.ShapeID) 
            distanceTouch.add(a.radius);
        else 
            return;

        if (b.shapeId === AABB.ShapeID) 
            distanceTouch.add(b.width / 2, b.height / 2);
        else if (b.shapeId === Circle.ShapeID) 
            distanceTouch.add(b.radius);
        else 
            return;
    
        distanceBW = b.position.sub(a.position);
        overlap = {
            x: Math.abs(Math.abs(distanceTouch.x) - Math.abs(distanceBW.x)),
            y: Math.abs(Math.abs(distanceTouch.y) - Math.abs(distanceBW.y))
        };

        if (overlap.x > overlap.y) {
            if (a.y < b.y) {
                a.position.y -= overlap.y / 2;
                b.position.y += overlap.y / 2;
            } else {
                a.position.y += overlap.y / 2;
                b.position.y -= overlap.y / 2;
            }
        } else {
            if (a.x < b.x) {
                a.position.x -= overlap.x / 2;
                b.position.x += overlap.x / 2;
            } else {
                a.position.x += overlap.x / 2;
                b.position.x -= overlap.x / 2;
            }
        }
    }
}

class Body {
    constructor(shapeId, sprite, properties) {
        this.shapeId = shapeId;
        this.sprite = sprite;
        this.position = new Q.Vector(sprite.x, sprite.y);
        this.velocity = new Q.Vector();
        this.rotation = sprite.rotation;
        this.velocityLimit = new Q.Vector();
        this.last = new Q.Vector();
        this.force = new Q.Vector();
        this.mass = 0;
        this.damping = 0;
        // this.shape = null;
        this.world = null;
        this.collisionGroup = null;
        this.collideAgainst = [];
        this.fixed = false;
        // this.gravityFactor = 1;
        this.restitution = 1;

        this._collides = [];

        Object.assign(this, properties);
    }
    // addShape(shape) {
    //     this.shape = shape;
    //     return this;
    // }
    collide() {
        return true;
    }
    afterCollide() {
    }
    setCollisionGroup(group) {
        if (this.world && typeof this.collisionGroup === 'number') 
            this.world.removeBodyCollision(this);

        this.collisionGroup = group;        
        if (this.world) this.world.addBodyCollision(this);
        return this;
    }
    setCollideAgainst() {
        this.collideAgainst.length = 0;
        for (let i = 0; i < arguments.length; i++) {
            this.collideAgainst.push(arguments[i]);
        }
        return this;
    }
    addTo() {
        if (!this.world) this.world.addBody(this);
        return this;
    }
    remove() {
        if (this.world) this.world.removeBody(this);
        return this;
    }
    removeCollision() {
        if (this.world) this.world.removeBodyCollision(this);
        return this;
    }
    update(dt) {
        if(this.fixed) return;

        this.last.set(this.position);

        if (this.mass !== 0) {
            this.velocity.x += this.world.gravity.x * this.mass * dt;
            this.velocity.y += this.world.gravity.y * this.mass * dt;
        }

        this.velocity.x += this.force.x * dt;
        this.velocity.y += this.force.y * dt;

        if (this.damping > 0 && this.damping < 1) {
            this.velocity.x *= Math.pow(1 - this.damping, dt);
            this.velocity.y *= Math.pow(1 - this.damping, dt);
        }

        if (this.velocityLimit.x > 0) 
            this.velocity.x = Q.utils.clamp(this.velocity.x, -this.velocityLimit.x, this.velocityLimit.x);
        
        if (this.velocityLimit.y > 0) 
            this.velocity.y = Q.utils.clamp(this.velocity.y, -this.velocityLimit.y, this.velocityLimit.y);

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        // this.sprite.rotation = this.rotation;
    }
    update0(dt) {
        if(this.fixed) return;

        this.last.set(this.position);
    
        if (this.mass > 0 && this.gravityFactor > 0) {
            this.velocity.x += this.world.gravity.x * this.gravityFactor * dt;
            this.velocity.y += this.world.gravity.y * this.gravityFactor * dt;

            if (this.velocityLimit.x > 0) 
                this.velocity.x = Q.utils.clamp(this.velocity.x, -this.velocityLimit.x, this.velocityLimit.x);

            if (this.velocityLimit.y > 0) 
                this.velocity.y = Q.utils.clamp(this.velocity.y, -this.velocityLimit.y, this.velocityLimit.y);
        }
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }
}
Body.id = 0;

class AABB extends Body {
    constructor(sprite, properties) {
        super(AABB.ShapeID, sprite, properties);

        this.width = this.width || sprite.width;
        this.height = this.height || sprite.height;
    }
}
AABB.ShapeID = 0;

class Circle extends Body {
    constructor(sprite, properties) {
        super(Circle.ShapeID, sprite, properties);

        sprite.circular = true;

        this.radius = this.radius || sprite.radius;
    }
}
Circle.ShapeID = 1;

Q.World = World;
Q.AABB = AABB;
Q.Circle = Circle;

}).call(this, Alif);
