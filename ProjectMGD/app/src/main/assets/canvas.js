//SETTING AND LOADING ALL SPRITES//
//PLAYER
let playerSprites = document.createElement("img")
playerSprites.src = "characters/mario.png"
//COIN
let coinIMG = document.createElement("img")
coinIMG.src = "powerups/coin.png"
//ENEMIES
let enemySpriteListIMG = document.createElement("img")
enemySpriteListIMG.src = "characters/EnemySpritesList.png"
//POWERUPBOCK
let powerupblockIMG = document.createElement("img")
powerupblockIMG.src = "blocks/randomBlock.png"
//POWERUPBOCKUSED
let powerupblockUIMG = document.createElement("img")
powerupblockUIMG.src = "blocks/randomBlockDestroyed.png"
//POWERUP SHROOM
let powerupShroom = document.createElement("img")
powerupShroom.src = "powerups/mushroom1.png"
//FLAG
let flagSprite = document.createElement("img")
flagSprite.src = "background/flag.png"
//NORMAL BRICK
let normalBlock = document.createElement("img")
normalBlock.src = "blocks/normalBlock.png"
//WATER BLOCK
let waterBlock = document.createElement("img")
waterBlock.src = "blocks/water.png"
//WATER BLOCK
let skipLevelTextIMG = document.createElement("img")
skipLevelTextIMG.src = "background/skipleveltext.png"
//BACKGROUND IMGS
let backgroundMain = document.createElement("img")
backgroundMain.src = "background/foreground.png"
let backgroundMid = document.createElement("img")
backgroundMid.src = "background/middleground.png"
let backgroundClouds = document.createElement("img")
backgroundClouds.src = "background/middlegroundClouds.png"
let backgroundFar = document.createElement("img")
backgroundFar.src = "background/background.png"

//PARALAX LAYER SPEEDS
let mainSpeed = 10
let middleSpeed = 5
let cloudSpeed = 3
let farSpeed = 2

class CanvasDisplay {  //CREATING CANVAS AND VIEWPORT
    constructor(parent, level) {
        //CREATING CANVAS BY DOCUMENT, SETTING UP W/H, SETTING UP CONTEXT TO DRAW ACTORS
        this.canvas = document.createElement("canvas")
        this.canvas.width = Math.min(600, level.width * scale)
        this.canvas.height = Math.min(450, level.height * scale)
        parent.appendChild(this.canvas)
        this.context = this.canvas.getContext("2d")
 

        this.flipPlayer = false
        //VIEW PORT INITIAL
        this.viewport = {
            left: 0,
            top: 0,
            width: this.canvas.width / scale,
            height: this.canvas.height / scale
        }
    }
    clear(){ //REMOVE CANVAS
        this.canvas.remove()
    }
}

CanvasDisplay.prototype.syncState = function(state, time) {
    this.updateViewport(state)
    this.clearDisplay(state.status)
    this.drawBackgroundElements(state, time)
    this.drawActors(state.actors)
}

CanvasDisplay.prototype.updateViewport = function(state) { //UPDATES THE VIEWPORT(CAM) TO THE PLAYER
    //CALCULATING SIZES OF VIEWPORT(CAM), ATTACHES TO PLAYER
    let view = this.viewport
    let margin = view.width / 3
    let player = state.player
    let center = player.pos.add(player.size.multiply(new Vec2(0.5, 0.5))) 

    //X
	if(center.x < view.left + margin) {
        view.left = Math.max(center.x - margin, 0)      
	}
	else if(center.x > view.left + view.width - margin) {
        view.left = Math.min(center.x + margin - view.width,
             state.level.width - view.width)
	}
	//Y
	if(center.y < view.top + margin) {
		view.top = Math.max(center.y - margin, 0)
	}
	else if(center.y > view.top + view.height - margin) {
        view.top = Math.min(center.y + margin - view.height,
             state.level.height - view.height)
    }
}

CanvasDisplay.prototype.clearDisplay = function(status) { //CLEAR DISPLAY, CALLED EVERY FRAME

    if(status == "won") {
        this.context.fillStyle = "rgb(68, 191, 255)" //BACKGROUND COLOR CHANGE WHEN GAME STATE = WON
    }
    else if( status == "lost") {
        this.context.fillStyle = "rgb(44, 136, 214)" //BACKGROUND COLOR CHANGE WHEN GAME STATE = LOST
    }
    else {
        this.context.fillStyle = "rgb(52, 166, 251)" ////BACKGROUND COLOR CHANGE WHEN GAME STATE = PLAYING
    }
   
    this.context.fillRect(0,0, this.canvas.width,  //FILL BACKGROUND
        this.canvas.height)

}

CanvasDisplay.prototype.drawBackgroundElements = function(state, time) { //DRAW STATIC SPRITES
    let { left , top, width, height } = this.viewport
    let xStart = Math.floor(left)
    let xEnd = Math.ceil(left + width)
    let yStart = Math.floor(top)
    let yEnd = Math.ceil(top + height)

    this.drawPBackground(state, this.viewport, top)

    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            let tile = state.level.rows[y][x]

            if(tile == "empty") continue //CONTINUE WHEN THE TILE IS EMPTY = DRAW NOTHING THEN

            let screenX = (x-left) * scale
            let screenY = (y-top) * scale
           
            if(tile == "wall") {  //DRAW WALL IF TILE WALL
                this.context.drawImage(normalBlock, 0, 0, normalBlock.width, 
                    normalBlock.height, screenX, screenY, scale, scale)
            }
            if(tile == "water") { //DRAW WATER IF TILE WATER
                this.context.drawImage(waterBlock, 0, 0, waterBlock.width, 
                    waterBlock.height, screenX, screenY, scale, scale)
            }
        }
    }    
    this.drawFont(state, time) //DRAW TEXTS
}

CanvasDisplay.prototype.drawFont = function(state, time) { //DRAWING TEXT DEPENDING ON LEVEL

    if(currentLevel === 0) {
        this.context.font = "62px Arial";
        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.fillText("MARIO COPY", this.canvas.width/2, this.canvas.height/4); 
        this.context.strokeText("MARIO COPY", this.canvas.width/2, this.canvas.height/4); 
        this.context.font = "25px Arial";
        this.context.fillText("START --", this.canvas.width / 1.13 , this.canvas.height/1.4); 
        this.context.strokeText("START --", this.canvas.width / 1.13, this.canvas.height/1.4);
        this.context.font = "34px Arial";
        this.context.fillText("MOVEMENT: WASD, RESTART: R", this.canvas.width / 2 , this.canvas.height/1.03); 
        this.context.strokeText("MOVEMENT: WASD, RESTART: R", this.canvas.width / 2, this.canvas.height/1.03); 
    }  
    if(currentLevel != 0 && currentLevel <= 3 ) {
        this.context.font = "26px Arial";
        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.fillText("LEVEL: " + currentLevel, this.canvas.width / 2, this.canvas.height / 8); 
        this.context.strokeText("LEVEL: " + currentLevel, this.canvas.width / 2, this.canvas.height / 8); 
        this.context.fillText("SCORE: " + scoreCurrentLevel, this.canvas.width / this.canvas.width + 85, this.canvas.height/8); 
        this.context.strokeText("SCORE: " + scoreCurrentLevel, this.canvas.width / this.canvas.width + 85, this.canvas.height/8); 
        this.context.fillText("HIGHSCORE: " + LEVEL_SCORES[currentLevel + 1], this.canvas.width / this.canvas.width + 117, this.canvas.height/5.5); 
        this.context.strokeText("HIGHSCORE: " + LEVEL_SCORES[currentLevel + 1], this.canvas.width / this.canvas.width + 117, this.canvas.height/5.5); 

        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.font = "25px Arial";
        this.context.fillText("RESTART --", 0 , 0); 
        this.context.strokeText("RESTART --", 0, 0);
    }
    if(currentLevel === 4 ) {
        this.context.font = "26px Arial";
        this.context.fillStyle = "white";
        this.context.textAlign = "center";

        this.context.fillText("HIGHSCORES", this.canvas.width / 2, this.canvas.height/4); 
        this.context.strokeText("HIGHSCORES", this.canvas.width / 2, this.canvas.height/4);

        this.context.fillText("LEVEL 1: " + LEVEL_SCORES[2], this.canvas.width / 2, this.canvas.height/2.7); 
        this.context.strokeText("LEVEL 1: " + LEVEL_SCORES[2], this.canvas.width / 2, this.canvas.height/2.7); 

        this.context.fillText("LEVEL 2: " + LEVEL_SCORES[3], this.canvas.width / 2, this.canvas.height/2.3); 
        this.context.strokeText("LEVEL 2: " + LEVEL_SCORES[3], this.canvas.width / 2, this.canvas.height/2.3); 

        this.context.fillText("LEVEL 3: " + LEVEL_SCORES[4], this.canvas.width / 2, this.canvas.height/2); 
        this.context.strokeText("LEVEL 3: " + LEVEL_SCORES[4], this.canvas.width / 2, this.canvas.height/2); 

        this.context.font = "25px Arial";
        this.context.fillText("RESTART --", this.canvas.width / 1.17 , this.canvas.height/1.4); 
        this.context.strokeText("RESTART --", this.canvas.width / 1.17, this.canvas.height/1.4);
    }
      
}

CanvasDisplay.prototype.drawPBackground = function(state, viewport, top) { //PARALAX BACKGROUND
    
    var numImages = (state.level.width * scale) / this.canvas.width;
    for (var i = 0; i < numImages; i++) {

        //FAR BG
        this.context.drawImage(backgroundFar, 0, 0, backgroundFar.width, 
            backgroundFar.height, (i * this.canvas.width) - (viewport.left * farSpeed), (12) - top * 20, this.canvas.width, this.canvas.height)
        //MID BG
        this.context.drawImage(backgroundMid, 0, 0, backgroundMid.width, 
            backgroundMid.height, (i * this.canvas.width) - (viewport.left * middleSpeed), (12) - top* 20, this.canvas.width, this.canvas.height)
        //CLOUDS BG
        this.context.drawImage(backgroundClouds, 0, 0, backgroundClouds.width, 
            backgroundClouds.height, (i * this.canvas.width) - (viewport.left * cloudSpeed), (12) - top* 20, this.canvas.width, this.canvas.height)
        //FOREGROUND BG
        this.context.drawImage(backgroundMain, 0, 0, backgroundMain.width, 
            backgroundMain.height, (i * this.canvas.width) - (viewport.left * mainSpeed), (12) - top* 20, this.canvas.width, this.canvas.height)   
    }
}

function flipHorizontally(context, around) { //FLIPS THE DRAWING
    context.translate(around, 0)
    context.scale(-1, 1)
    context.translate(-around, 0)
}

CanvasDisplay.prototype.drawPlayer = function(player, x, y, 
    width, height) {

        if(player.speed.x != 0) {
            this.flipPlayer = player.speed.x < 0 //CHECK IF PLAYER NEEDS FLIPPED DEPEDING ON VEL X
        }
   
        this.context.save() //SAVE PREVIOUS WAY OF DRAWING

        if(this.flipPlayer) {
            flipHorizontally(this.context, x + width / 2) //FLIPS PLAYER IF = TRUE
        }

        this.context.drawImage(playerSprites, 0, 0, playerSprites.width, 
            playerSprites.height, x, y, width, height) //DRAW PLAYER
        
        this.context.restore()//RELOAD PREVIOUS SAVED WAY OF DRAWING
}

CanvasDisplay.prototype.drawEnemis = function(enemy, img, x, y, 
    width, height, typeX) { //DRAWING ENEMIES, VERY SIMILLAR TO HOW PLAYER IS DRAWN

        if(enemy.speed.x != 0) {
            this.flipEnemy = enemy.speed.x > 0
        }
        this.context.save()
        if(this.flipEnemy) {
            flipHorizontally(this.context, x + width / 2)
        }  
        this.context.drawImage(img, typeX, 0, img.width / 3, 
            img.height, x, y, width, height)
        
        this.context.restore()
}

CanvasDisplay.prototype.drawActors = function(actors) { //DRAW NON-STATIC ACTORS

    for (actor of actors) {

       //CALCULATING THE SIZE OF WHAT TO DRAW, THE TILES SIZE GET SCALED 20X20
       let width = actor.size.x * scale
       let height = actor.size.y * scale
       //CALCULATING RELATIVE POSITION IN THE WORLD
       let x = (actor.pos.x - this.viewport.left) * scale
       let y = (actor.pos.y - this.viewport.top) * scale
       //DRAW PLAYER
       if(actor.type == "player") {
            this.drawPlayer(actor, x, y, width, height)
       }
       //DRAW COINS
       if(actor.type == "coin")  {
            this.context.drawImage(coinIMG, 0, 0 , coinIMG.width,
                coinIMG.height, x, y, width, height)
       }
       //DRAW POWER UP
       if(actor.type == "powerup")  {
            this.context.drawImage(powerupShroom, 0, 0 , powerupShroom.width,
                powerupShroom.height, x, y, width, height)
       }
       //DRAW ? BLOCK, DEPENDING ON IF ITS BEEN HIT OR NOT
       if(actor.type == "powerupblock")  {
            if(actor.beenUsed)
            {
                this.context.drawImage(powerupblockUIMG, 0, 0 , powerupblockUIMG.width,
                    powerupblockUIMG.height, x, y, width, height)
            }
            else {
                this.context.drawImage(powerupblockIMG, 0, 0 , powerupblockIMG.width,
                    powerupblockIMG.height, x, y, width, height)
            }
                
       }
       //DRAW FINISH FLAG
       if(actor.type == "finish")  {
            this.context.drawImage(flagSprite, 0, 0 , flagSprite.width,
                flagSprite.height, x, y, width, height)
                if(x < 25)
                 this.context.drawImage(skipLevelTextIMG, 0, 0 , skipLevelTextIMG.width,
                    skipLevelTextIMG.height, x - 15, 300, 100, 25)
       }
       //DRAW ENEMIES
       if(actor.type == "enemy1")  {
            this.drawEnemis(actor, enemySpriteListIMG, x, y, width, height, 0)
       }
       if(actor.type == "enemy2")  {
            this.drawEnemis(actor, enemySpriteListIMG, x, y, width, height, 1000)
       }
       if(actor.type == "enemy3")  {
            this.drawEnemis(actor, enemySpriteListIMG, x, y, width, height, 2000)
       }
    }
}
