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
    
    //Initialize backgroundAudio element
    function init(){
        backgroundAudio = document.querySelector("#backgroundAudio");
		backgroundAudio.volume=0.10;
		
		if(!musicMuted)
		    backgroundAudio.play();
    }
    
    //Set the background audio with a given path and volume
    function setBackgroundAudio(bgPath, vol){
        backgroundAudio.src = bgPath;
        backgroundAudio.volume = vol;
        
        if(!musicMuted)
            backgroundAudio.play();
    }
    
    //Change the volume of the background audio
    function changeVolume(vol) {
        backgroundAudio.volume = vol;
    }
    
    //Play an affect with the given audio name
    function playEffect(effectNum){
        var effectSound = document.createElement('audio');
        effectSound.volume = 0.3;
		effectSound.src = "media/" + effectSounds[effectNum];
		
		if(!effectsMuted)
		    effectSound.play();
    }
    
    //Toggles the background music
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
    
    //Toggles the SFX
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