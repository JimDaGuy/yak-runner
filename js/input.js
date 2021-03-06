//Input.js
//Holds useful functions and objects for tracking player input

"use strict";

var keys = {};

keys.KEYBOARD = Object.freeze({
    "KEY_SHIFT": 16,
    "KEY_ESC": 27,
   "KEY_SPACE": 32, 
   "KEY_P": 80,
   "KEY_T": 84,
});

//Key daemon for checking keyboard input
keys.down = [];

//Event listeners to add and remove keys when pressed and unpressed
window.onkeydown = function(e) {
  keys.down[e.keyCode] = true;  
};

window.onkeyup = function(e) {
  keys.down[e.keyCode] = false;  
};