// Main.js
// Module containing most of the game code

"use strict";
var app = app || {}; //Initialize app

app.main = {
    //Canvas Variables
    CANVAS_WIDTH: 900,
    CANVAS_HEIGHT: 600,
    canvas: undefined,
    ctx: undefined,
    
    //Game variables
    animationID: 0,
    previousUpdateTime: 0,
    menuYak: undefined,
    //Particle Variables
    maxParticles: 500,
    particleRate: 10,
    particleSpeed: 80,
    particleColor: '#FFEEDD',
    particleSize: 2,
    particleTimer: 0,
    particles: [], //Array of particle objects
    currentGameState: undefined,
    
    GAME_STATE: Object.freeze({
       MENU: 0,
       SETTINGS: 1,
       OPTIONS: 2,
       CREDITS: 3,
       INGAME: 4,
       PAUSED: 5,
       DEAD: 6,
    }),
    
    //Menu Variables
    menuGroundHeight: 400,
    
    menuFirstCurveStart: 40,
    menuFirstCurveHeight: 250,
    menuFirstCurveWidth: 600,
    
    menuSecondCurveStart: 300,
    menuSecondCurveHeight: 400,
    menuSecondCurveWidth: 750,
    
    //Methods
    init: function() {
        //Initialize canvas properties
        this.canvas = document.querySelector('canvas');
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        this.ctx = this.canvas.getContext('2d');
        
        //Set initial game state
        this.currentGameState = this.GAME_STATE.MENU; 
        
        //Init menu variables
        
        
        //Call initial update after the yak image loads
        this.menuYak = new Image();
        this.menuYak.src = "resources/menuyak2.png";
        this.menuYak.onload = function () {
            app.main.update();
        }
    },
    
    update: function() {
        //Schedule call to update
        this.animationID = requestAnimationFrame(this.update.bind(this));
        
        //Check Time Passed
        var dt = this.calculateDeltaTime();
        
        //Menu
        if(this.currentGameState == this.GAME_STATE.MENU) {
            this.createParticles(dt);
            this.drawMenuScreen(this.ctx);
            this.moveParticles(dt);
        }
            
            
        
    },
    
    calculateDeltaTime: function(){
		var now,fps;
		now = performance.now(); 
		fps = 1000 / (now - this.previousUpdateTime);
		fps = clamp(fps, 12, 60);
		this.previousUpdateTime = now; 
		return 1/fps;
	},
	
	createParticles: function(dt) {
	    var timePerParticle = 1 / this.particleRate;
	    //Check timer and max particles before creating a new particle
	    if(this.particleTimer >= timePerParticle && this.particles.length < this.maxParticles) {
	        //Create particle
	        var p = {};
	        p.x = this.CANVAS_WIDTH + Math.ceil((Math.random() * 50 ));
	        p.y = Math.random() * this.CANVAS_HEIGHT;
	        
	        //Add particle to particles array
	        this.particles.push(p);
	        
	        //Reset particle timer
	        this.particleTimer = 0;
	    }
	    else //Increment timer 
	        this.particleTimer += dt;
	},
	
	moveParticles: function(dt) {
	    for(var i = 0; i < this.particles.length; i++) {
	        
	        //Move particle
	        this.particles[i].x -= this.particleSpeed * dt;
	        
	        //Remove particles when they move offscreen
	        if(this.particles[i].x < 0)
	        {
	            this.particles.splice(i, 1);
	            i--;
	        }
	    }
	},
	
	drawParticles: function(ctx) {
	    ctx.save();
	    
	    ctx.fillStyle = this.particleColor;
	    
	    for(var i = 0; i < this.particles.length; i++) {
	        ctx.beginPath();
	        ctx.arc(this.particles[i].x, this.particles[i].y, this.particleSize, 0, 2 * Math.PI);
	        ctx.fill();
	    }
	    
	    ctx.restore();
	},
    
    drawHUD: function(ctx) {
        
    },
    
    drawMenuScreen: function(ctx) {
        ctx.save();
        
        //Draw Background
        ctx.fillStyle = "#A5D3F6";
        ctx.fillRect( 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        
        //Draw ground
        ctx.fillStyle = "#CC9347";
        
        //Ground Base Level
        ctx.fillRect( 0, this.menuGroundHeight, this.CANVAS_WIDTH, this.CANVAS_HEIGHT - this.menuGroundHeight);
        
        //Ground Curves
        //Curve1
        ctx.beginPath();
        ctx.moveTo( this.menuFirstCurveStart, this.menuGroundHeight + 50);
        ctx.bezierCurveTo( this.menuFirstCurveStart + (this.menuFirstCurveWidth * .3), this.menuGroundHeight - this.menuFirstCurveHeight, 
        this.menuFirstCurveStart + (this.menuFirstCurveWidth * .7), this.menuGroundHeight - this.menuFirstCurveHeight + 150,
        this.menuFirstCurveStart + this.menuFirstCurveWidth, this.menuGroundHeight + 50);
        ctx.closePath();
        ctx.fill();
        //Curve 2
        ctx.beginPath();
        ctx.moveTo( this.menuSecondCurveStart, this.menuGroundHeight + 50);
        ctx.bezierCurveTo( this.menuSecondCurveStart + (this.menuSecondCurveWidth * .3), this.menuGroundHeight - this.menuSecondCurveHeight, 
        this.menuSecondCurveStart + (this.menuSecondCurveWidth * .7), this.menuGroundHeight - this.menuSecondCurveHeight + 150,
        this.menuSecondCurveStart + this.menuSecondCurveWidth, this.menuGroundHeight + 50);
        ctx.closePath();
        ctx.fill();
        
        //Draw particles
        this.drawParticles(ctx);
        
        //Draw Orange Overlay
        ctx.fillStyle = makeColor( 255, 138, 55, .2);
        //ctx.fillRect( 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        
        //Draw Yak
        ctx.drawImage( this.menuYak, -250, 50);
        
        //Draw Game Title
        ctx.textAlign = "left";
    	ctx.textBaseline = "top";
    	ctx.font = "90pt 'Lobster'";
		ctx.fillStyle = "#6FC374";
    	ctx.fillText("Yak Runner", 20, 20);
        
        ctx.restore();
    },
    
};