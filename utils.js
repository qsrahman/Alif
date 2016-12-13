// Copyright 2016 Qazi Sami ur Rahman and other contributors
// some small handy functions
'use strict';

(function(Q) {

var Q = Q || {};

Q.utils = {    
    norm(value, min, max) {
        return (value - min) / (max - min);
    },

    lerp(norm, min, max) {
        return (max - min) * norm + min;
    },

    map(value, sourceMin, sourceMax, destMin, destMax) {
        return Q.utils.lerp(Q.utils.norm(value, sourceMin, sourceMax), destMin, destMax);
    },

    clamp(value, min, max) {
        return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
    },

    distance(p0, p1) {
        let dx = p1.x - p0.x,
            dy = p1.y - p0.y;

        return Math.sqrt(dx * dx + dy * dy);
    },
    distanceSq(p0, p1) {
        let dx = p1.x - p0.x,
            dy = p1.y - p0.y;

        return (dx * dx + dy * dy);
    },

    distanceXY(x0, y0, x1, y1) {
        let dx = x1 - x0,
            dy = y1 - y0;

        return Math.sqrt(dx * dx + dy * dy);
    },

    circleCollision(c0, c1) {
        return Q.utils.distance(c0, c1) <= c0.radius + c1.radius;
    },

    circlePointCollision(x, y, circle) {
        return Q.utils.distanceXY(x, y, circle.x, circle.y) < circle.radius;
    },

    pointInRect(x, y, rect) {
        return Q.utils.inRange(x, rect.x, rect.x + rect.width) &&
               Q.utils.inRange(y, rect.y, rect.y + rect.height);
    },

    inRange(value, min, max) {
        return value >= Math.min(min, max) && value <= Math.max(min, max);
    },

    rangeIntersect(min0, max0, min1, max1) {
        return Math.max(min0, max0) >= Math.min(min1, max1) && 
               Math.min(min0, max0) <= Math.max(min1, max1);
    },

    rectIntersect(r0, r1) {
        return Q.utils.rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
               Q.utils.rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height);
    },

    degToRads(degrees) {
        return degrees / 180 * Math.PI;
    },

    radsToDeg(radians) {
        return radians * 180 / Math.PI;
    },

    randomRange(min, max) {
        if(max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    },

    randomInt(min, max) {
        if(max === undefined) {
            max = min;
            min = 0;
        }
        return Math.floor(min + Math.random() * (max - min + 1));
    },

    randomFloat(min, max) {
        if(max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    },

    roundToPlaces(value, places) {
        let mult = Math.pow(10, places);
        return Math.round(value * mult) / mult;
    },

    roundNearest(value, nearest) {
        return Math.round(value / nearest) * nearest;
    },

    sign(n) {
        return n ? (n < 0 ? -1 : 1) : 0;
    },

    hex2rgb(hex, out) {
        out = out || [];

        out[0] = (hex >> 16 & 0xFF) / 255;
        out[1] = (hex >> 8 & 0xFF) / 255;
        out[2] = (hex & 0xFF) / 255;

        return out;
    },

    hex2string(hex) {
        hex = hex.toString(16);
        hex = '000000'.substr(0, 6 - hex.length) + hex;

        return '#' + hex;
    },

    // Converts a color as an [R, G, B] array to a hex number
    rgb2hex: function (rgb) {
        return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
    },

    /* Color conversion */
    //From: http://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
    //Utilities to convert HTML color string names to hexadecimal codes

    colorToRGBA(color) {
        // Returns the color as an array of [r, g, b, a] -- all range from 0 - 255
        // color must be a valid canvas fillStyle. This will cover most anything
        // you'd want to use.
        // Examples:
        // colorToRGBA('red')  # [255, 0, 0, 255]
        // colorToRGBA('#f00') # [255, 0, 0, 255]
        let cvs, ctx;

        cvs = document.createElement('canvas');
        cvs.height = 1;
        cvs.width = 1;
        ctx = cvs.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        
        let data = ctx.getImageData(0, 0, 1, 1).data; 
        
        return data;
    },

    byteToHex(num) {
        // Turns a number (0-255) into a 2-character hex number (00-ff)
        return ('0'+num.toString(16)).slice(-2);
    },

    colorToHex(color) {
        // Convert any CSS color to a hex representation
        // Examples:
        // colorToHex('red')            # '#ff0000'
        // colorToHex('rgb(255, 0, 0)') # '#ff0000'
        let rgba, hex;

        rgba = Q.utils.colorToRGBA(color);

        hex = [0,1,2].map(
            idx => Q.utils.byteToHex(rgba[idx])
        ).join('');

        return "0x" + hex;
    },

    //A function to find out if the user entered a number (a hex color
    //code) or a string (an HTML color string)
    color(value) {
        return !isNaN(value) ? value : Q.utils.colorToHex(value);
    }
};
}).call(this, Game);
