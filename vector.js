// Copyright 2016 Qazi Sami ur Rahman and other contributors
// A 2-dimensional vector implementation
(function(Q) {
'use strict';

// var Q = Q || {};

Q.Vector = class {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static create(x, y) {
        return new Q.Vector(x, y);
    }
    static fromAngle(angle, len = 1) {
        return new Q.Vector(len * Math.cos(angle), len * Math.sin(angle));
    }
    get angle() {
        return Math.atan2(this.y, this.x);
    }
    set angle(value) {
        let length = this.length;

        this.x = Math.cos(value) * length;
        this.y = Math.sin(value) * length;
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set length(value) {
        let angle = this.angle;
        
        this.x = Math.cos(angle) * value;
        this.y = Math.sin(angle) * value;
    }
    get lengthSq() {
        return (this.x * this.x + this.y * this.y);
    }
    set(v, y = v) {
        this.x = v instanceof Q.Vector ? v.x : v;
        this.y = v instanceof Q.Vector ? v.y : y;

        return this;
    }
    clone() {
        return new Q.Vector(this.x, this.y);
    }
    clear() {
        this.x = this.y = 0;

        return this;
    }
    add(v, y = v) {
        let a, b;

        if(v instanceof Q.Vector) {
            a = this.x + v.x;
            b = this.y + v.y;
        }
        else {
            a = this.x + v;
            b = this.y + y;
        }
        return new Q.Vector(a, b);
        // return new Q.Vector(
        //     this.x + v instanceof Q.Vector ? v.x : v, 
        //     this.y + v instanceof Q.Vector ? v.y : y
        // );
    }
    addTo(v, y = v) {
        this.x += v instanceof Q.Vector ? v.x : v;
        this.y += v instanceof Q.Vector ? v.y : y;

        return this;
    }
    sub(v, y = v) {
        let a, b;

        if(v instanceof Q.Vector) {
            a = this.x - v.x;
            b = this.y - v.y;
        }
        else {
            a = this.x - v;
            b = this.y - y;
        }
        return new Q.Vector(a, b);
        // return new Q.Vector(
        //     this.x - v instanceof Q.Vector ? v.x : v, 
        //     this.y - v instanceof Q.Vector ? v.y : y
        // );
    }
    subFrom(v, y = v) {
        this.x -= v instanceof Q.Vector ? v.x : v;
        this.y -= v instanceof Q.Vector ? v.y : y;

        return this;
    }
    mul(v, y = v) {
        let a, b;

        if(v instanceof Q.Vector) {
            a = this.x * v.x;
            b = this.y * v.y;
        }
        else {
            a = this.x * v;
            b = this.y * y;
        }
        return new Q.Vector(a, b);
        // return new Q.Vector(
        //     this.x * (v instanceof Q.Vector) ? v.x : v, 
        //     this.y * (v instanceof Q.Vector) ? v.y : y
        // );
    }
    mulBy(v, y = v) {
        this.x *= v instanceof Q.Vector ? v.x : v;
        this.y *= v instanceof Q.Vector ? v.y : y;

        return this;
    }
    div(v, y = v) {
        let a, b;

        if(v instanceof Q.Vector) {
            a = this.x / v.x;
            b = this.y / v.y;
        }
        else {
            a = this.x / v;
            b = this.y / y;
        }
        return new Q.Vector(a, b);
        // return new Q.Vector(
        //     this.x / v instanceof Q.Vector ? v.x : v, 
        //     this.y / v instanceof Q.Vector ? v.y : y
        // );
    }
    divBy(v, y = v) {
        this.x /= v instanceof Q.Vector ? v.x : v;
        this.y /= v instanceof Q.Vector ? v.y : y;

        return this;
    }
    negate() {
        return new Q.Vector(-this.x, -this.y);
    }
    normalize() {
        let len = this.length;

        if(len !== 0 && len !== 1) {
            let num = 1.0 / len;
            this.x *= num;
            this.y *= num;
        }

        return this;
    }
    distance(v) {
        let dx = v.x - this.x,
            dy = v.y - this.y;

        return Math.sqrt(dx * dx + dy * dy);
    }
    distanceSq(v) {
        let dx = v.x - this.x,
            dy = v.y - this.y;

        return (dx * dx + dy * dy);
    }
    dot(v) {
        return (this.x * v.x + this.y * v.y);
    }
    cross(v) {
        return (this.x * v.y - this.y * v.x);
    }
    angleBetween(v) {
        return Math.atan2(v.y - this.y, v.x - this.x);
    }
    // angleBetween(v) {
    //     return Math.acos(this.dot(v) / this.lengthSq);
    // }

    angleTo(v) {
        // The nearest angle between two vectors
        // (origin of (0, 0) for both vectors)
        let cos = this.x * v.x + this.y * v.y,
            sin = this.y * v.x - this.x * v.y;

        return Math.atan2(sin, cos);
    }

    rotateBy(angle) {
        let cos = Math.cos(angle),
            sin = Math.sin(angle),

            newx = this.x * cos - this.y * sin,
            newy = this.x * sin + this.y * cos;
        
        // newy = -(this.x * sin + this.y * cos);
        this.set(newx, newy);

        return this;
    }

    rotateAbout(pivot, angle) {
        this.subFrom(pivot);
        this.rotateBy(angle);
        this.addTo(pivot);

        return this;
    }
    // left normal vector
    leftNormal() {
        return new Q.Vector(this.y, -this.x);
    }
    // right normal vector
    rightNormal() {
        return new Q.Vector(-this.y, this.x);
    }
    projection(v) {
        let dot = this.dot(v);
        let lenSq = v.lengthSq(); // vector doted with itself give lengthSq :)
        return v.mul(dot / lenSq);
    }
    // Determines if a given vector is to the right or left of this vector
    // returns -1 if to the left and 1 if to the right
    sign(v) {
        return this.rightNormal().dot(v) < 0 ? -1 : 1;
    }
    // return a new 2D unit vector from a random angle
    random2D() {
        return Q.Vector.fromAngle(Math.random() * 2 * Math.PI);
    }
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        return this;
    }
    limit(max) {
        if(max instanceof Q.Vector) {
            this.x = Q.utils.clamp(this.x, -max.x, max.x);
            this.y = Q.utils.clamp(this.y, -max.y, max.y);
        }
        else if(this.lengthSq > max*max) {
            this.normalize();
            this.mulBy(max);
        }

        return this;
    }
    toArray() {
        return [this.x, this.y];
    }
    toString() {
        return "(" + this.x.toFixed(3).replace(/\.?0+$/,'') + "," + this.y.toFixed(3).replace(/\.?0+$/,'') + ")";
    }
};
}).call(this, Alif);
