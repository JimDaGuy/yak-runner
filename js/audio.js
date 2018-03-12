// Audio.js
// Module containing audio functions for 'app'

'use strict';
var app = app || {};

app.audio = (function(){
    //Variables
    var backgroundAudio = undefined;
    
    //Functions
    function init(){
        backgroundAudio = document.querySelector("#backgroundAudio");
		backgroundAudio.volume=0.10;
		backgroundAudio.play();
    }
    
    //Returning functions/variables to be used in 'app'
    return {
        init: init,
    };
})();