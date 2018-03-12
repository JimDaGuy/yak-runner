// Loader.js
// Calls all neccesary functions to load 'app's modules

"use strict";
var app = app || {};


window.onload = function(){
	app.audio.init();
	app.main.audio = app.audio;
	app.main.init();
}