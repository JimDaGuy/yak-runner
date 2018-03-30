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
    imageObjects: [],
    imageSources: ["resources/menuyak.png", "resources/yakrunbg.png", "resources/yakspritesheet.png"],
    
    //Universal Colors
    groundColor: '#765230',
    skyColor: '#3A5676',
    
    //Particle Variables
    maxParticles: 500,
    particleRate: 25,
    particleColor: '#FFEEDD',
    particleSize: 2,
    particleTimer: 0,
    particles: [], //Array of particle objects
    currentGameState: undefined,
    
    GAME_STATE: Object.freeze({
       MENU: 0,
       SETTINGS: 1,
       INSTRUCTIONS: 2,
       CREDITS: 3,
       INGAME: 4,
       PAUSED: 5,
       DEAD: 6,
    }),
    
    PLAYER_STATE: Object.freeze({
       RUNNING: 0,
       JUMPING: 1,
       FALLING: 2,
       DEAD: 3,
    }),
    
    //Menu Variables
    menuYak: undefined,
    menuGroundHeight: 400,
    
    menuFirstCurveStart: 40,
    menuFirstCurveHeight: 250,
    menuFirstCurveWidth: 600,
    
    menuSecondCurveStart: 300,
    menuSecondCurveHeight: 400,
    menuSecondCurveWidth: 750,
    
    menuButtonWidth: 250,
    menuButtonHeight: 50,
    menuButtonLineWidth: 4,
    menuButtonInactiveColor: 'green',
    menuButtonActiveColor: 'blue',
    menuButtonInactiveFill: 'gray',
    menuButtonActiveFill: 'yellow',
    menuStartHovered: false,
    menuInstructionsHovered: false,
    menuOptionsHovered: false,
    menuCreditsHovered: false,
    
    //In-Game Variables
    yakPlayerWidth: 75,
    yakPlayerHeight: 50,
    currentPlayerState: undefined,
    bgSand: undefined,
    yakSheet: undefined,
    yakTPF: 4,  //Ticks per frame
    yakTickCounter: 0,
    yakSpriteIndex: 0,
    
    yakPositionX: 250,
    yakPositionY: 500,
    yakPlayerCurrentSprite: undefined,
    yakXSpeed: 250,  //Ground will move left at 60 pixels per second
    yakYSpeed: 0,
    yakYSpeed: 50,
    yakYAccel: -150,
    
    terrainObjects: [],
    botLevelHeight: 25,
    topLevelHeight: 225,
    
    currentScore: 0,
    
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
        
        //Preload Images
        
        //Setup Events
        this.canvas.onmousemove = this.doMousemove.bind(this);
        this.canvas.onmousedown = this.doMousedown.bind(this);
        
        //Load all imaages
    	var numLoadedImages = 0;
    	
    	for (var i = 0; i < this.imageSources.length; i++) {
            this.imageObjects[i] = new Image();
    	    this.imageObjects[i].src = this.imageSources[i];
    	    this.imageObjects[i].onload = function() {
    	  	    numLoadedImages++;
    	  	    if(numLoadedImages >= app.main.imageSources.length) {
    	  	        //Set all image objects and call initial update
    	  	        app.main.menuYak = app.main.imageObjects[0];
    	  	        app.main.bgSand = app.main.imageObjects[1];
    	  	        app.main.yakSheet = app.main.imageObjects[2];
                    app.main.update(); 
                }
    	    };
    	}
    },
    
    update: function() {
        //Schedule call to update
        this.animationID = requestAnimationFrame(this.update.bind(this));
        
        //Check Time Passed
        var dt = this.calculateDeltaTime();
        
        //Menu
        if(this.currentGameState == this.GAME_STATE.MENU) {
            this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            this.createParticles(dt);
            this.drawMenuScreen(this.ctx);
            this.moveParticles(dt, 80);
        }
            
        //In Game
        if(this.currentGameState == this.GAME_STATE.INGAME) {
            this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            
            //Draw Background
            this.ctx.fillStyle = this.skyColor;
            this.ctx.fillRect( 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            
            this.ctx.drawImage( this.bgSand, 0, 0);
            
            //Draw Particles
            this.createParticles(dt);
            this.moveParticles(dt, 140);
            this.drawParticles(this.ctx);
            
            //Update Game Background and Draw it to the canvas
            //this.updateGameBackground();
            //this.drawGameBackground();
            
            //Update current terrain, generate terrain if more is needed, draw all terrain
            this.updateTerrain(dt);
            this.generateTerrain();
            this.drawTerrain(this.ctx);
            
            //Process Keyboard Input
            this.processKeyboardInput();
            
            //Update Yak Position and Sprite, 
            this.updateYak(dt);
            //draw yak to the screen
            this.drawYak(this.ctx);
            
            //Draw HUD last
            this.drawHUD(this.ctx, dt);
        }
        
        //Game Paused
        if(this.currentGameState == this.GAME_STATE.PAUSED) {
            //Redraw Game Screen without updating
            this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            this.ctx.fillStyle = this.skyColor;
            this.ctx.fillRect( 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            this.ctx.drawImage( this.bgSand, 0, 0);
            this.drawParticles(this.ctx);
            this.drawTerrain(this.ctx);
            this.drawYak(this.ctx);
            this.drawHUD(this.ctx, dt);
            
            //Draw Pause Screen on top
            this.drawPauseScreen(this.ctx);
            
            //Check Input
            this.processKeyboardInput();
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
	
	doMousedown: function(e) {

		if(this.currentGameState == this.GAME_STATE.MENU) {
		    //Start the Game
		    if(this.menuStartHovered) {
		        this.currentGameState = this.GAME_STATE.INGAME;
		        //Set the ingame soundtrack
		        app.audio.setBackgroundAudio("media/ingame.mp3", .3);
		        //Reset any scores or level stats and generate initial level items
		        this.setInitialTerrain();
		        this.currentScore = 0;
		    }
		    
		    //Open Instructions screen
		    if(this.menuInstructionsHovered) {
		        
		    }
		    
		    //Open Options screen
		    if(this.menuOptionsHovered) {
		        
		    }
		    
		    //Open Credits Screen
		    if(this.menuCreditsHovered) {
		        
		    }
		    
			return;
	    }
		
		
	},
	
	doMousemove: function(e) {
	  var mouse = getMouse(e);
	  var x = mouse.x;
	  var y = mouse.y;
	  
	  if(this.currentGameState == this.GAME_STATE.MENU) {
	      //Check which buttons are hovered
	      	if(x <= this.CANVAS_WIDTH && x >= this.CANVAS_WIDTH - this.menuButtonWidth - (this.menuButtonLineWidth / 2) &&
    	y >= this.CANVAS_HEIGHT - (this.menuButtonHeight * 6) - (this.menuButtonLineWidth / 2) && 
    	y <= this.CANVAS_HEIGHT - (this.menuButtonHeight * 5) + (this.menuButtonLineWidth / 2)) {
    	    this.menuStartHovered = true;
    	}
    	else {
    	    this.menuStartHovered = false;
    	    
    	}
	  } 
	},
	
	moveParticles: function(dt, particleSpeed) {
	    for(var i = 0; i < this.particles.length; i++) {
	        
	        //Move particle
	        this.particles[i].x -= particleSpeed * dt;
	        
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
	    ctx.shadowBlur=20;
        ctx.shadowColor="white";
	    
	    for(var i = 0; i < this.particles.length; i++) {
	        ctx.beginPath();
	        ctx.arc(this.particles[i].x, this.particles[i].y, this.particleSize, 0, 2 * Math.PI);
	        ctx.fill();
	    }
	    
	    ctx.restore();
	},
    
    drawHUD: function(ctx, dt) {
        ctx.save();
        
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.textBaseline = "top";
        
        ctx.textAlign = "end";
        ctx.fillText("Score: " + this.currentScore, this.CANVAS_WIDTH - 20, 20);
        
        ctx.textAlign = "start";
        ctx.fillText("Dt: " + dt.toFixed(3), 20, 20);
        
        ctx.restore();
    },
    
    drawTerrain: function(ctx) {
        ctx.save();
        
        //Set terrain drawing styles
        ctx.fillStyle = this.groundColor;
        
        //Iterate through every terrain object and draw it
        for(var i = 0; i < this.terrainObjects.length; i++) {
            var tObj = this.terrainObjects[i];
            ctx.fillRect( tObj.left(), tObj.top(), tObj.width, tObj.height);
        }
        
        ctx.restore();
    },
    
    drawMenuScreen: function(ctx, e) {
        ctx.save();
        
        //Draw Background
        ctx.fillStyle = this.skyColor;
        ctx.fillRect( 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        
        //Draw ground
        ctx.fillStyle = this.groundColor;
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
        //ctx.fillStyle = makeColor( 255, 138, 55, .6);
        //ctx.fillRect( 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        
        //Draw Yak
        ctx.drawImage( this.menuYak, -250, 50);
        
        //Draw Game Title
        ctx.textAlign = "left";
    	ctx.textBaseline = "top";
    	ctx.font = "90pt 'Lobster'";
		ctx.fillStyle = "#6FC374";
    	ctx.fillText("Yak Runner", 20, 20);
    	
    	//Draw Menu Buttons
    	ctx.globalAlpha = .6;
    	ctx.lineWidth = this.menuButtonLineWidth;
    	
    	//'Start Run' Button
        if( this.menuStartHovered) {
    	    ctx.fillStyle = this.menuButtonActiveFill;
    	    ctx.strokeStyle = this.menuButtonActiveColor;
    	} else {
    	    ctx.fillStyle = this.menuButtonInactiveFill;
    	    ctx.strokeStyle = this.menuButtonInactiveColor;
    	}
    	ctx.fillRect( this.CANVAS_WIDTH - this.menuButtonWidth - (ctx.lineWidth / 2), this.CANVAS_HEIGHT - (this.menuButtonHeight * 6) , this.menuButtonWidth, this.menuButtonHeight);
    	ctx.strokeRect( this.CANVAS_WIDTH - this.menuButtonWidth , this.CANVAS_HEIGHT - (this.menuButtonHeight * 6), this.menuButtonWidth, this.menuButtonHeight);
        //Start Run Button Text
        ctx.textAlign = "left";
    	ctx.textBaseline = "top";
    	ctx.font = "30pt 'Share Tech'";
        ctx.fillStyle = "#322938"; 
        ctx.fillText("Start Running",  this.CANVAS_WIDTH - this.menuButtonWidth + (ctx.lineWidth / 2) + 5, this.CANVAS_HEIGHT - (this.menuButtonHeight * 6));
        
        ctx.restore();
    },
    
    drawPauseScreen: function(ctx, e) {
        ctx.save();
            
        //Draw Pause Overlay
        this.ctx.fillStyle = "gray";
        this.ctx.globalAlpha = .7;
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.ctx.globalAlpha = 1;
            
            
        
        
        ctx.restore();
    },
    
    drawYak: function(ctx) {
        ctx.save();
        var xOffset, yOffset;
        if(this.yakSpriteIndex > 7) {
            xOffset = (this.yakSpriteIndex - 8) * this.yakPlayerWidth;
            yOffset = 50;
        }
        else {
            xOffset = this.yakSpriteIndex * this.yakPlayerWidth;
            yOffset = 0;
        }
        
        ctx.drawImage(this.yakSheet,
        xOffset, yOffset, this.yakPlayerWidth, this.yakPlayerHeight,
        this.yakPositionX - (this.yakPlayerWidth / 2), 
        this.yakPositionY - (this.yakPlayerHeight / 2),
        this.yakPlayerWidth, this.yakPlayerHeight);
        
        //console.dir(this.yakSpriteIndex);
        
        //We'll use a red box for now
        //ctx.fillStyle = "red";
        //ctx.fillRect(this.yakPositionX - (this.yakPlayerWidth / 2),
        //this.yakPositionY - (this.yakPlayerHeight / 2), this.yakPlayerWidth, this.yakPlayerHeight);
        
        ctx.restore();
    },
    
    generateTerrain: function() {
        var lastTerrain = this.terrainObjects[this.terrainObjects.length - 1];  
              
        //If the last terrain object is far enough left to generate a new terrain object
        if(lastTerrain.right() <= this.CANVAS_WIDTH - 20) {
        //Create a terrain object with random-ish width and location
            var newTerrainWidth = getRandomInt(4, 9) * 50; //200-450 pixels wide
            var terrainOffset = getRandomInt(140, 170);
            //New terrain object is between 160 and 190 pixels apart from last terrain object
            var newTerrainX = this.CANVAS_WIDTH + (newTerrainWidth / 2) + terrainOffset;
          
            //Set new terrain height within 50px on either side of the last terrain block
            var newTerrainY = 0;
            //Keep setting the newTerrainY until it is set at an appropriate height
            while (newTerrainY <= (this.CANVAS_HEIGHT - this.topLevelHeight) || newTerrainY >= (this.CANVAS_HEIGHT - this.botLevelHeight)) {
                newTerrainY = lastTerrain.yPos + (getRandomInt(0, 200) - 100);
            }
          
            //Create terrain block
            var newTerrainBlock = new this.terrainObject(newTerrainX, newTerrainY, newTerrainWidth, 50);
            //Add block to the terrain objects array
            this.terrainObjects.push(newTerrainBlock);
        }
    },
    
    processKeyboardInput: function() {
        
        //In-Game Key Controls
        if(this.currentGameState == this.GAME_STATE.INGAME) {
            if(keys.down[keys.KEYBOARD.KEY_P])
            {
                this.currentGameState = this.GAME_STATE.PAUSED;
                //this.currentGameState = this.GAME_STATE.PAUSED;
            }
            
            if(this.currentPlayerState == this.PLAYER_STATE.RUNNING) {
                //If player presses space while running, they will jump
                if(keys.down[keys.KEYBOARD.KEY_SPACE]) {
                    //Set player state to jumping
                    this.currentPlayerState = this.PLAYER_STATE.JUMPING;
                    //Set jumping frame
                    this.yakSpriteIndex = 8;
                    this.yakTickCounter = 0;
                }
            }
        }
        
            
        
    },
    
    setInitialTerrain: function() {
        //Create initial terrain objects
        var terr1 = new this.terrainObject(200, this.CANVAS_HEIGHT - this.botLevelHeight, 400, 50)
        var terr2 = new this.terrainObject(620, this.CANVAS_HEIGHT - 125, 300, 50);
        var terr3 = new this.terrainObject(1025, this.CANVAS_HEIGHT - this.topLevelHeight, 350, 50);
        
        //Add terrain objects to their array
        this.terrainObjects.push(terr1);
        this.terrainObjects.push(terr2);
        this.terrainObjects.push(terr3);
    },
    
    //Object Contructor for Terrain Objects
    terrainObject: function(xpos, ypos, width, height) {
        //Position, Width, and Height
        this.xPos = xpos;
        this.yPos = ypos;
        this.width = width;
        this.height = height;
        //Functions to calculate the top, bottom, right and left edges
        this.left = function() {
            return this.xPos - (this.width / 2);
        };
        this.right = function() {
          return this.xPos + (this.width / 2);  
        };
        this.top = function() {
            return this.yPos - (this.height / 2);
        };
        this.bottom = function() {
            return this.yPos + (this.height / 2);
        }
    },
    
    updateTerrain: function(dt) {
        for(var i = 0; i < this.terrainObjects.length; i++) {
	        
	        //Move terrain object
	        this.terrainObjects[i].xPos -= this.yakXSpeed * dt;
	        
	        //Remove terrain if it is offscreen
	        if( this.terrainObjects[i].right() < 0)
	        {
	            this.terrainObjects.splice(i, 1);
	            i--;
	        }
	    }
    },
    
    updateYak: function(dt) {
        //Update Yak Player State
        if(this.currentPlayerState == this.PLAYER_STATE.JUMPING && this.yakYAccel <= 0) {
            this.currentPlayerState = this.PLAYER_STATE.FALLING;
            this.yakSpriteIndex = 17;
        }
        
        //Increase sprite index every tick-per-frame unit
        if(this.yakTickCounter % this.yakTPF == 0)
            this.yakSpriteIndex++;
            
        //Reset Jumping loop
         if(this.yakSpriteIndex > 17) {
            if(this.PLAYER_STATE == this.PLAYER_STATE.JUMPING) {
                this.yakSpriteIndex = 8;
                this.yakTickCounter = 0;
            }
            else {
                this.yakSpriteIndex = 0;
                this.yakTickCounter = 0;
            }
        }
        
        //Reset running loop
        if(this.yakSpriteIndex > 7 && this.PLAYER_STATE == this.PLAYER_STATE.RUNNING) {
            this.yakSpriteIndex = 0;
            this.yakTickCounter = 0;
        }
        
        //Increment Tick Counter
        this.yakTickCounter++;
        
        //Add Acceleration to speed
        //Acceleration is negative, making speed negative
        this.yakYSpeed += (this.yakYAccel * dt);
        
        if(this.yakYSpeed <= -50)
            this.yakYSpeed = -50;
        
        //Set potential new x and y coordinates for the yak
        var potentialX = this.yakPositionX;
        var potentialY = this.yakPositionY - (this.yakYSpeed * dt); //Speed is negative so we need to subtract it
        var yakTop = potentialY - (this.yakPlayerHeight / 2);
        var yakBot = potentialY + (this.yakPlayerHeight / 2);
        var yakLeft = potentialX - (this.yakPlayerWidth / 2);
        var yakRight = potentialX + (this.yakPlayerWidth / 2);
        
        //Check each terrain block for collision
        for(var i = 0; i < this.terrainObjects.length; i++) {
             //Horizontal Collision Check
            if(yakRight > this.terrainObjects[i].left() &&
            yakLeft < this.terrainObjects[i].left() &&
            ((yakBot > this.terrainObjects[i].top() && yakTop < this.terrainObjects[i].top()) || 
            (yakTop < this.terrainObjects[i].bottom() && yakBot > this.terrainObjects[i].bottom()))
            )
            {
                this.yakPositionX = this.terrainObjects[i].left() - (this.yakPlayerWidth / 2);
            }
            else {
                this.yakPositionX = potentialX;
            }
            
            //Vertical Collision Checks
            if(yakRight > this.terrainObjects[i].left() &&
            yakLeft < this.terrainObjects[i].right()) {
                
                //Ground Collision
                if(yakBot > this.terrainObjects[i].top() &&
                yakTop < this.terrainObjects[i].top()) {
                    this.yakPositionY = this.terrainObjects[i].top() - (this.yakPlayerHeight / 2);
                    this.yakYSpeed = 0; //Sets Y velocity to 0 because it is on the ground
                    this.currentPlayerState = this.PLAYER_STATE.RUNNING;
                }
                //Ceiling Collision
                else if(yakTop < this.terrainObjects[i].bottom() &&
                yakBot > this.terrainObjects[i].bottom()) {
                    this.yakPositionY = this.terrainObjects[i].bottom() + (this.yakPlayerHeight / 2); //Set outside of box with 2px buffer
                    this.currentPlayerState = this.PLAYER_STATE.FALLING;
                }
                // If no vertical collsion occurs, set the y value
                else
                    this.yakPositionY = potentialY;
            }
        }
    },
};