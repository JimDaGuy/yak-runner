// Loader.js
// Calls all neccesary functions to load 'app's modules

"use strict";
var app = app || {};

//Calls the app's initial functions
window.onload = function(){
	app.audio.init();
	app.main.audio = app.audio;
	app.main.init();
}

//Pauses the game on blur
window.onblur = function(){
	if(app.main.currentGameState == app.main.GAME_STATE.INGAME) {
		app.main.currentGameState = app.main.GAME_STATE.PAUSED;
	}
};

//Unpauses the game on focus
window.onfocus = function(){
	if(app.main.currentGameState == app.main.GAME_STATE.PAUSED) {
		app.main.currentGameState = app.main.GAME_STATE.INGAME;
	}
};