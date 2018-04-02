// Loader.js
// Calls all neccesary functions to load 'app's modules

"use strict";
var app = app || {};


window.onload = function(){
	app.audio.init();
	app.main.audio = app.audio;
	app.main.init();
}

window.onblur = function(){
	if(app.main.currentGameState == app.main.GAME_STATE.INGAME) {
		app.main.currentGameState = app.main.GAME_STATE.PAUSED;
	}
};

window.onfocus = function(){
	if(app.main.currentGameState == app.main.GAME_STATE.PAUSED) {
		app.main.currentGameState = app.main.GAME_STATE.INGAME;
	}
};