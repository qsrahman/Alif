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
        body.world = this;
        body._remove = false;

        if (typeof body.collideAgainst === 'number') 
            body.collideAgainst = [body.collideAgainst];

        this.bodies.push(body);
        this.addBodyCollision(body);
    }
    removeBody(body) {
        if (!body.world) return;
        body.world = null;
        body._remove = true;
    }
    addBodyCollision(body) {
        if (typeof body.collisionGroup !== 'number') return;
        this.collisionGroups[body.collisionGroup] = this.collisionGroups[body.collisionGroup] || [];
        if (this.collisionGroups[body.collisionGroup].indexOf(body) !== -1) return;
        this.collisionGroups[body.collisionGroup].push(body);
    }
    removeBodyCollision(body) {
        if (typeof body.collisionGroup !== 'number') return;
        if (!this.collisionGroups[body.collisionGroup]) return;
        if (this.collisionGroups[body.collisionGroup].indexOf(body) === -1) return;
        this.collisionGroups[body.collisionGroup].erase(body);
    }
    collide(body) {
        let g, i, b, group;

        for (g = 0; g < body.collideAgainst.length; g++) {
            body._collides.length = 0;
            group = this.collisionGroups[body.collideAgainst[g]];
            
            if (!group) continue;

            for (i = group.length - 1; i >= 0; i--) {
                if (!group) break;
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
        if (a.shape.width && b.shape.width) {
            return !(
                a.position.y + a.shape.height / 2 <= b.position.y - b.shape.height / 2 ||
                a.position.y - a.shape.height / 2 >= b.position.y + b.shape.height / 2 ||
                a.position.x - a.shape.width / 2 >= b.position.x + b.shape.width / 2 ||
                a.position.x + a.shape.width / 2 <= b.position.x - b.shape.width / 2
            );
        }
        if (a.shape.radius && b.shape.radius) {
            return (a.shape.radius + b.shape.radius > a.position.distance(b.position));
        }
        if (a.shape.width && b.shape.radius || a.shape.radius && b.shape.width) {
            let rect = a.shape.width ? a : b;
            let circle = a.shape.radius ? a : b;

            let x = Math.max(rect.position.x - rect.shape.width / 2, Math.min(rect.position.x + rect.shape.width / 2, circle.position.x));
            let y = Math.max(rect.position.y - rect.shape.height / 2, Math.min(rect.position.y + rect.shape.height / 2, circle.position.y));

            let dist = Math.pow(circle.position.x - x, 2) + Math.pow(circle.position.y - y, 2);
            return dist < (circle.shape.radius * circle.shape.radius);
        }
        return false;
    }
    hitResponse(a, b) {
        if (a.shape.width && b.shape.width) {
            if (a.last.y + a.shape.height / 2 <= b.last.y - b.shape.height / 2) {
                if (a.collide(b, 'DOWN')) {
                    a.position.y = b.position.y - b.shape.height / 2 - a.shape.height / 2;
                    return true;
                }
            }
            else if (a.last.y - a.shape.height / 2 >= b.last.y + b.shape.height / 2) {
                if (a.collide(b, 'UP')) {
                    a.position.y = b.position.y + b.shape.height / 2 + a.shape.height / 2;
                    return true;
                }
            }
            else if (a.last.x + a.shape.width / 2 <= b.last.x - b.shape.width / 2) {
                if (a.collide(b, 'RIGHT')) {
                    a.position.x = b.position.x - b.shape.width / 2 - a.shape.width / 2;
                    return true;
                }
            }
            else if (a.last.x - a.shape.width / 2 >= b.last.x + b.shape.width / 2) {
                if (a.collide(b, 'LEFT')) {
                    a.position.x = b.position.x + b.shape.width / 2 + a.shape.width / 2;
                    return true;
                }
            }
            else {
                // Inside
                if (a.collide(b)) return true;
            }
        }
        else if (a.shape.radius && b.shape.radius) {
            var angle = b.position.angleBetween(a.position);
            if (a.collide(b, angle)) {
                var dist = a.shape.radius + b.shape.radius;
                a.position.x = b.position.x + Math.cos(angle) * dist;
                a.position.y = b.position.y + Math.sin(angle) * dist;

                return true;
            }
        }
    }
    hitResponse0(a, b) {
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
                
                if (wall.shape instanceof AABB) 
                    distanceTouch.addTo(wall.shape.width / 2, wall.shape.height / 2);
                else if (wall.shape instanceof Circle) 
                    distanceTouch.addTo(wall.shape.radius);
                else 
                    return true;

                if (ball.shape instanceof AABB) 
                    distanceTouch.addTo(ball.shape.width / 2, ball.shape.height / 2);
                else if (ball.shape instanceof Circle) 
                    distanceTouch.addTo(ball.shape.radius);
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
            if (a.shape instanceof Circle && b.shape instanceof Circle) {
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
            let dDistance = distanceAB.mult(velocityAB);
            
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
    
        if (a.shape instanceof Circle && b.shape instanceof Circle) {
            // circle <=> circle
            distanceTouch = a.shape.radius + b.shape.radius;
            overlap = distanceBW.mult(1 - distanceBW.length / distanceTouch);
            a.position.x -= overlap.x / 2;
            a.position.y -= overlap.y / 2;
            b.position.x += overlap.x / 2;
            b.position.y += overlap.y / 2;

            return;
        }
    
        // circle/square <=> circle/square
        if (a.shape instanceof AABB) 
            distanceTouch.add(a.shape.width / 2, a.shape.height / 2);
        else if (a.shape instanceof Circle) 
            distanceTouch.add(a.shape.radius);
        else 
            return;

        if (b.shape instanceof AABB) 
            distanceTouch.add(b.shape.width / 2, b.shape.height / 2);
        else if (b.shape instanceof Circle) 
            distanceTouch.add(b.shape.radius);
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
    constructor(properties) {
        this.position = new Q.Vector();
        this.velocity = new Q.Vector();
        this.velocityLimit = new Q.Vector();
        this.last = new Q.Vector();
        this.force = new Q.Vector();
        this.mass = 0;
        this.damping = 0;
        this.shape = null;
        this.world = null;
        this.collisionGroup = null;
        this.collideAgainst = [];
        this.fixed = false;
        this.gravityFactor = 1;
        this.restitution = 1;

        this._collides = [];

        Object.assign(this, properties);
    }
    addShape(shape) {
        this.shape = shape;
        return this;
    }
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
    }
    setCollideAgainst() {
        this.collideAgainst.length = 0;
        for (let i = 0; i < arguments.length; i++) {
            this.collideAgainst.push(arguments[i]);
        }
    }
    addTo(world) {
        if (!this.world) return;

        world.addBody(this);

        return this;
    }
    remove() {
        if (this.world) this.world.removeBody(this);
    }
    removeCollision() {
        if (this.world) this.world.removeBodyCollision(this);
    }
    update(dt) {
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

class AABB {
    constructor(width = 50, height = 50) {
        this.width = width || this.width;
        this.height = height || this.height;
    }
}

class Circle {
    constructor(radius = 50) {
        this.radius = radius || this.radius;
    }
}

Q.World = World;
Q.Body = Body;
Q.AABB = AABB;
Q.Circle = Circle;

}).call(this, Alif);
