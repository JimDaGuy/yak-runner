// Audio.js
// Module containing audio functions for 'app'

'use strict';
var app = app || {};

app.audio = (function(){
    //Variables
    var backgroundAudio = undefined;
    var effectSounds = ["scoreGrab.wav", "score1.wav", "score2.wav", "score3.wav"];
    var effectsMuted = false;
    var musicMuted = false;
    
    //Functions
    function init(){
        backgroundAudio = document.querySelector("#backgroundAudio");
		backgroundAudio.volume=0.10;
		
		if(!musicMuted)
		    backgroundAudio.play();
    }
    
    function setBackgroundAudio(bgPath, vol){
        backgroundAudio.src = bgPath;
        backgroundAudio.volume = vol;
        
        if(!musicMuted)
            backgroundAudio.play();
    }
    
    function changeVolume(vol) {
        backgroundAudio.volume = vol;
    }
    
    function playEffect(effectNum){
        var effectSound = document.createElement('audio');
        effectSound.volume = 0.3;
		effectSound.src = "media/" + effectSounds[effectNum];
		
		if(!effectsMuted)
		    effectSound.play();
    }
    
    function toggleBG() {
        musicMuted = !musicMuted;
        if(musicMuted)
            backgroundAudio.pause();
        else {
            //Set audio to menu music if it isn't already
            if(backgroundAudio.src != "media/menu.mp3")
                setBackgroundAudio("media/menu.mp3", .3);
            backgroundAudio.play();
        }
    }
    
    function toggleSFX() {
        effectsMuted = !effectsMuted;
    }
    
    //Returning functions/variables to be used in 'app'
    return {
        init: init,
        setBackgroundAudio: setBackgroundAudio,
        changeVolume: changeVolume,
        playEffect: playEffect,
        toggleBG: toggleBG,
        toggleSFX: toggleSFX,
    };
})();