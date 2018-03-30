// Audio.js
// Module containing audio functions for 'app'

'use strict';
var app = app || {};

app.audio = (function(){
    //Variables
    var backgroundAudio = undefined;
    var effectSounds = ["scoreGrab.wav"];
    
    //Functions
    function init(){
        backgroundAudio = document.querySelector("#backgroundAudio");
		backgroundAudio.volume=0.10;
		//backgroundAudio.play();
    }
    
    function setBackgroundAudio(bgPath, vol){
        backgroundAudio.src = bgPath;
        backgroundAudio.volume = vol;
        //backgroundAudio.play();
    }
    
    function changeVolume(vol) {
        backgroundAudio.volume = vol;
    }
    
    function playEffect(effectNum){
        var effectSound = document.createElement('audio');
        effectSound.volume = 0.3;
		effectSound.src = "media/" + effectSounds[effectNum];
		effectSound.play();
    }
    
    //Returning functions/variables to be used in 'app'
    return {
        init: init,
        setBackgroundAudio: setBackgroundAudio,
        changeVolume: changeVolume,
        playEffect: playEffect,
    };
})();