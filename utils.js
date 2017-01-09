// Copyright 2016 Qazi Sami ur Rahman and other contributors
// some small handy functions
(function(Q) {
'use strict';

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

    degToRad(degrees) {
        return degrees / 180 * Math.PI;
    },

    radToDeg(radians) {
        return radians * 180 / Math.PI;
    },

    // randomRange(min, max) {
    //     if(max === undefined) {
    //         max = min;
    //         min = 0;
    //     }
    //     return min + Math.random() * (max - min);
    // },

    randomInt(min, max) {
        if(max === undefined) {
            max = min;
            min = 0;
        }
        // return Math.floor(min + Math.random() * (max - min + 1));
        return Math.floor(min + Math.random() * (max - min));
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
        n = +n;     // convert to a number
        
        if (n === 0 || isNaN(n)) {
            return Number(n);
        }

        return n > 0 ? 1 : -1;
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
}).call(this, Alif);
