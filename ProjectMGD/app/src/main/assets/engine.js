// VAR TO STORE WHAT LEVEL THE PLAYER IS ON AND ITS SCORE
var currentLevel = 0;
var lastLevel = 0;
var scoreCurrentLevel = 0;

Level.prototype.touches = function(pos, size, type) {
    //CHECK IF ACTOR COLLIDES SOMETHING WITH PREDICTED SPEED X OR Y
	let xStart = Math.floor(pos.x)
	let xEnd = Math.ceil(pos.x + size.x)
	let yStart = Math.floor(pos.y)
	let yEnd = Math.ceil(pos.y + size.y)

	for(let y = yStart; y < yEnd; y++) {
		for(let x = xStart; x < xEnd; x++) {

            //CHECK IF ACTOR IS IN BOUNDS
			let isOutSide = x < 0 || x >= this.width || y < 0 || y >= this.height
            //CHECK IF ITS AN ACTOR CLASS OR STATIC = "STRING"
			if(type.charAt(0) == "c" && !isOutSide)
			{
			    //CHECK IF WE COLLIDE WITH AN ACTOR
				let here = isOutSide ? type.substring(1) : this.rows[y][x].constructor.name

				if(here == type.substring(1)){
                    //RETURN THE ACTOR IF THE PREDICTED COLLISION WILL HAPPEN
					return this.rows[y][x]
				}
			}
			else
			{
			    //CHECK THE SAME THING BUT AGAINST STATIC = "STRING"
				let here = isOutSide ? type : this.rows[y][x]
                //IF STATIC, TRUE OR FALSE IS RETURNED FOR THE PREDICTION
				if(here == type) return true
			}
		}
	}
	//NO PREDICTED COLLISION, RETURN FALSE
	return false
}

function sound(src) {   //EASY SOUND FUNCTION
	this.sound = document.createElement("audio"); //CREATE AUDIO ELEMENT
	this.sound.src = src; //LOAD AUDIO
	this.sound.setAttribute("preload", "auto"); //SETTING UP AUDIO FILE
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);

    //FUNCTIONS TO PLAY OR STOP AUDIO
	this.play = function(){
	  this.sound.play();
	}
	this.stop = function(){
	  this.sound.pause();
	}
  } 

State.prototype.update = function(time, keys) { //GAMELOOP, KIND OF.
    //CREATES A NEW LIST OF ACTORS AND STATE, UPDATES ALL ACTORS
	let actors = this.actors.map(actor => actor.update(time, this, keys))
	let newState = new State(this.level, actors, this.status)
	//PRESS R TO RESTART CURRENT LEVEL
	if(keys.r){	
		scoreCurrentLevel = 0;
		// RETURNS NEW STATE WITH SAME LEVEL AND ACTORS BUT NEW STATUS = "LOST"
		return new State(this.level, actors, "lost")
	}
    //IF STATE STATUS IS NOT "PLAYING", MAKE IT PLAY
	if(newState.status != 'playing') return newState
    //REF TO PLAYER
	let player = newState.player

	//RETURN NEW STATE = "LOST" WHEN PLAYER TOUCHES WATER
	if(this.level.touches(player.pos, player.size, "water")){
		scoreCurrentLevel = 0;
		var dieSound = new sound("sounds/smb_mariodie.wav").play()
		return new State(this.level, actors, "lost")
	}
    //CHECK COLLISION OVERLAP BETWEEN ACTORS VS PLAYER
	for(let actor of actors) { 

		if(actor != player) {

			if(overlap(actor, player)){
				newState = actor.collide(newState)
				
			}
		}
	}
	//CREATE NEW STATE EVERY LOOP
	return newState
}
State.prototype.checkfix = function(state, newActor) {
    //I WAS STRUGGLING TO ADD ACTORS TO THE STATIC COLLISION MAP, TO TEST PREDICTED COLLISION
	
	for (actor of this.actors) {

		if(actor.pos == newActor.pos && actor != state.player)
		{
		    //FIND ACTOR IN THE LIST WITH SAME POSITION OF NEWACTOR
		    //THIS CLASS IS FOR POWER UP BLOCK, SO IT CAN HAVE COLLISIONS AND CAN BE TOUCHED
			if(!actor.beenUsed && !newActor.beenUsed) {
				var coindSound = new sound("sounds/smb_coin.wav").play()
				//IF ITS TOUCHED IT CHANGES VAR FOR DRAWING
				actor.beenUsed = true;
				newActor.beenUsed = true;
				scoreCurrentLevel = scoreCurrentLevel + 50;	
			}
		}
	}

	
}
function overlap(actor1, actor2) { // EASY 2D AABB vs AABB, CHECKS IF TWO SPRITES OVERLAP
	return actor1.pos.x + actor1.size.x > actor2.pos.x && 
	actor1.pos.x < actor2.pos.x + actor2.size.x && 
	actor1.pos.y + actor1.size.y > actor2.pos.y &&
	actor1.pos.y < actor2.pos.y + actor2.size.y
}


Finish.prototype.collide = function(state) { //IF COLLISION IS FOUND AGAINST THIS ACTOR, HANDLE IT HERE
	if(currentLevel < 3) {
		var levelFinishSound = new sound("sounds/smb_stage_clear.wav").play()
	} else var levelFinishSound = new sound("sounds/smb_world_clear.wav").play()
	//GAME IS WON BY COLLIDING WITH FINISHING FLAG, DIFFERENT SOUNDS DEPENDING ON WHAT LEVEL
	return new State(state.level, state.actors, "won") // EACH COLLIDE WE UPDATE THE STATE
}

Enemy.prototype.collide = function(state) { 
	var stompSound = new sound("sounds/smb_stomp.wav").play()

	let filtered = state.actors.filter(a => a != this) //FILTER THIS ENEMY OUT OF THE ACTOR LIST

	if(state.player.sizeM > 1) { //IF MARIO = SMALL, THEN THE GAME ENDS
		state.player.sizeM = 1
		scoreCurrentLevel = scoreCurrentLevel + 100;	
		return new State(state.level, filtered, state.status)
	}
	scoreCurrentLevel = 0; //SCORE RESET IF PLAYER DIE IN LEVEL
	var dieSound = new sound("sounds/smb_mariodie.wav").play() // PLAY SOUND
	return new State(state.level, filtered, "lost")
}

PowerUpBlock.prototype.collide = function(state) { 
    //UNUSED BUT NEEDED BECAUSE WE NEED A NEW STATE EACH FRAME
	return new State(state.level, state.actors, state.status)
}

Coin.prototype.collide = function(state) { //IF COLLECTED, ADD SCORE, PLAY SOUND, FILTER OUR ACTORS
	var coindSound = new sound("sounds/smb_coin.wav").play()
	
	scoreCurrentLevel = scoreCurrentLevel + 10;
	let filtered = state.actors.filter(a => a != this)
	let status = state.status

	return new State(state.level, filtered, status)
}

Coin.prototype.update = function(time) { //COIN ANIMATION, SIMPLE UP AND DOWN
	let wobble = this.wobble + time * wobbleSpeed
	let wobblePos = Math.sin(wobble) * wobbleDist
	return new Coin(this.basePos.add(new Vec2(0, wobblePos)),
	this.basePos, wobble)
}

Powerup.prototype.collide = function(state) { // IF POWER UP COLLIDED, ADD PLAYER SIZE AND FILTER ACTORS
	var oneUpSound = new sound("sounds/smb_1-up.wav").play()

	state.player.sizeM = 2
	state.player.pos.y = this.pos.y - 1
	let filtered = state.actors.filter(a => a != this)
	let status = state.status

	return new State(state.level, filtered, status)
}

const wobbleSpeed = 8 //ANIMATION VALUES
const wobbleDist = 0.1

Powerup.prototype.update = function(time) { // POWER UP ANIMATION, SIMPLE UP AND DOWN
	let wobble = this.wobble + time * wobbleSpeed
	let wobblePos = Math.sin(wobble) * wobbleDist
	return new Powerup(this.basePos.add(new Vec2(0, wobblePos)),
	this.basePos, wobble)
}

Finish.prototype.update = function(time) {
    //UNUSED BUT NEEDED BECAUSE WE NEED A NEW ACTOR EACH FRAME
	return new Finish(this.pos)
}

Enemy.prototype.update = function(time, state) { // SIMPLE AI, THAT HAS RANDOM SPEED BETWEEN 1 - 2

    // IF ENEMY TOUCHES ANY WALLS OR POWER UP BLOCKS, THEY WILL START MOVING OPPISITE DIRECTION
	let pos = this.pos
	let flip = this.flip

	let xSpeed = mathRand.getRandomArbitrary(1, 2) * flip
	let ySpeed = this.speed.y + time * gravity

	let movedY = pos.add(new Vec2(0, ySpeed * time))
	let movedX = pos.add(new Vec2(xSpeed * time, 0))

	if(!state.level.touches(movedX, this.size, "wall") && !state.level.touches(movedX, this.size, "cPowerUpBlock" )) {
		pos = movedX	
	}
	else { if(flip > 0) {
			flip = -1
		} else{
			flip = 1
		}	
	}
	
	if(!state.level.touches(movedY, this.size, "wall") && !state.level.touches(movedY, this.size, "cPowerUpBlock")) {		
		pos = movedY
	} else ySpeed = 0
	
	return new Enemy(pos, this.typeOfEnemy, new Vec2(xSpeed, ySpeed), flip) //EACH FRAME WE MAKE A NEW ENEMY, EVERY ACTOR, EVERY STATE
}

PowerUpBlock.prototype.update = function(time, state) {
    //UNUSED BUT NEEDED BECAUSE WE NEED A NEW ACTOR EACH FRAME
	return new PowerUpBlock(this.pos, this.beenUsed)
}

// PLAYER VALUES, FOR SPEED/JUMP/GRAVITY
const playerXSpeed = 10
const gravity = 30
var jumpSpeed = 17

//PLAYER UPDATE/MAIN
Player.prototype.update = function(time, state, keys) {

	let xSpeed = 0
	
	if(this.sizeM > 1)  //DEPENDING ON SIZE, THE JUMP HEIGHT DIFFERS
		jumpSpeed = 18
	else
		jumpSpeed = 16

	if(keys.a) xSpeed -= playerXSpeed
	if(keys.d) xSpeed += playerXSpeed

    //UPDATE X MOVEMENT TO PREDICT
	let pos = this.pos;
	let movedX = pos.add(new Vec2(xSpeed * time, 0))

    //CHECK PREDICTED X MOVEMENT FOR COLLISION
	if(!state.level.touches(movedX, this.size, "wall") && !state.level.touches(movedX, this.size, "cPowerUpBlock" )) {
		pos = movedX
	}

    //UPDATE Y SPEED / GRAVITY
	let ySpeed = this.speed.y + time * gravity
	let movedY = pos.add(new Vec2(0, ySpeed * time))

	//CHECK PREDICTED Y MOVEMENT FOR COLLISION WITH cPowerUpBlock CLASS
	let hit
	if(hit = state.level.touches(movedY, this.size, "cPowerUpBlock")) {
		if(hit.type === "powerupblock") {
			if(this.pos.y > hit.pos.y) 
				state.checkfix(state, hit)
		}
	}
    //CHECK PREDICTED Y MOVEMENT FOR COLLISION, ALSO JUMP RESET DEPENDING ON ySPEED
	if(!state.level.touches(movedY, this.size, "wall") && !state.level.touches(movedY, this.size, "cPowerUpBlock")) {		
		pos = movedY
	}
	else if(keys.w && ySpeed > 0) {
		ySpeed = -jumpSpeed
		if(this.sizeM > 1) var jumpBIGSound = new sound("sounds/smb_jump-super.wav").play()
		else var jumpSMALLSound = new sound("sounds/smb_jump-small.wav").play()
	}
	else {
		ySpeed = 0  //IF PLAYER TOUCHES WALL OR cPowerUpBlock RESET GRAVITY, SO THE PLAYER DOESNT CLIP THROUGH GROUND AFTER X = SECONDS
	}

	return new Player(pos, new Vec2(xSpeed, ySpeed), this.sizeM)
}

// RECORD INPUT
function input(keys) {
	let down = Object.create(null)
	function track(event) {
		if(keys.includes(event.key)) {
			down[event.key] = event.type == 'keydown'
			event.preventDefault()
			
		}
	}
	window.addEventListener("keydown", track)
	window.addEventListener("keyup", track)
	return down
}
// SETTING KEY INPUTS
const arrowKeys = input(["a","d","w", "r"])

// ANIMATING FRAMES
function runAnimation(frameFunc) {
	let lastTime = null
	function frame(time) {
		if(lastTime != null) {
			let timeStep = Math.min(time - lastTime, 100) / 1000
		
			if(frameFunc(timeStep) === false) return
		}
		lastTime = time
		requestAnimationFrame(frame)
	}
	requestAnimationFrame(frame)
}

// MAIN LOOP, WHICH UPDATES MAIN STATE.UPDATE(BASICALLY MAIN LOOP)
function runLevel(level, Display) {
	let display = new Display(document.body, level);
	let state = State.start(level);
	let ending = 1
	return new Promise(resolve => { //THIS PROMISE WAITS UNTIL THE GAME IS ENDED
		runAnimation(time => {
			state = state.update(time, arrowKeys)
			display.syncState(state, time)
			if(state.status == 'playing') {
				return true
			}
			else if(ending > 0) {
				ending -= time
				return true
			}
			else {
				display.clear()
				resolve(state.status)
				return false
			}
		})
	})
}

async function runGame(plans, Display) {

	scoreCurrentLevel = 0
	lastLevel = plans.length 

	for(let level = 0; level < plans.length;) {
        //USING ASYNC, WE WAIT FOR OUR GAMELOOP TO FINISH
		let status = await runLevel(new Level(plans[level]), Display)
		//CHECKING / UPDATING LEVELS AND SCORE
		if(status == "won"){
			level++
			if(level === lastLevel ) {
				level = 0;
			}
			if(LEVEL_SCORES[level] < scoreCurrentLevel) {
					LEVEL_SCORES[level] = scoreCurrentLevel
			}
			scoreCurrentLevel = 0
			currentLevel = level	
			console.log(currentLevel)	
		}
	}
	document.body.innerHTML = "!WON!"
}