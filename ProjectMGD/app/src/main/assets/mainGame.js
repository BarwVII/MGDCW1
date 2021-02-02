
//STORE LEVEL OBJECTS
class Level{ //CREATES OUR STATIC SPRITES AND ACTORS, ACTORS = LIST, STATIC COLLISION = ARRAY LIKE THE LEVELS.JS
	constructor(plan) {
		let rows = plan.trim().split("\n").map(l => [...l])
		this.height = rows.length
		this.width = rows[0].length
		this.startActors = []

		//LOOPS THROUGH ALL GAME_LEVELS[X] ROWS AND COLMS
		this.rows = rows.map((row, y) => { //NEW STATIC ACTOR ARRAY, TREATED AS COLLISION MAP TO PREDICT COLLISION
			return row.map((ch, x) => { 
				let type = levelChars[ch]

			    //IF THE CHARACTER.TYPE = A STRING THEN RETURN IT AS STATIC COLLISION MAP
				if(typeof type == "string") 
					return type

				let actor 

                //FIX FOR PLAYERS POSITION
				if(type == Player)
				{
					actor = type.create(new Vec2(4, 19), ch, false)
				}
				else
					actor = type.create(new Vec2(x, y), ch, false)

                //IF THE CHARACTER.TYPE = A CLASS OF SOME SORT, DONT ADD TO COLLISION MAP, ONLY TO ACTORLIST
				this.startActors.push(actor)

				if(actor.type == "powerupblock") {  //UNLESS ITS A POWER UP BLOCK, THEN ADD IT TOO BOTH
					return actor				
				}
                //IF THE CHARACTER.TYPE = A CLASS ADD IT TO THE COLLISION MAP AS EMPTY, SINCE WE DONT WANT THE COLLISION OF THAT ACTOR
				return "empty"
			})
		})
	}
}

//THE STATE OF THE GAME CLASS
class State {
	constructor(level, actors, status) {
		this.level = level
		this.actors = actors
		this.status = status
	}
	static start(level) {
		return new State(level, level.startActors, "playing")
	}

	get player() {
		return this.actors.find(a => a.type == "player")
	}
}

// MATH - VECTOR 2 
class Vec2 {
	constructor(x, y) {
		this.x = x
		this.y = y
	}

	add(other) {
		return new Vec2(this.x + other.x, this.y + other.y)
	}

	multiply(other) {
		return new Vec2(this.x * other.x, this.y * other.y)
	}
}

//RANDOM NUMBER STATIC CLASS
class mathRand {
	constructor() {
	}

	static getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
	}
	
	static getRandomArbitrary(min, max) {
		return Math.random() * (max - min) + min;
	  }
	

}

//PLAYER CLASS
class Player {
	constructor(pos, speed, sizeM){
		this.pos = pos
		this.speed = speed
		this.sizeM = sizeM
		if(this.sizeM === undefined)
			Player.prototype.size = new Vec2(1, 1)
		else
			Player.prototype.size = new Vec2(1, sizeM)
	}	

	get type(){ return "player" }

	static create(pos) {
	
		return new Player(pos.add(new Vec2(0, -1)), new Vec2(0, 0), 1)
	}
}
Player.prototype.size = new Vec2(1, 1) //SETTING THE SIZE OF THE PLAYER, REMEMBER EVERYTHING IS SCALED BY 20

//COIN CLASS
class Coin {
	constructor(pos, basePos, wobble){
		this.pos = pos
		this.basePos = basePos	
		this.wobble = wobble
	}

	get type() { return 'coin' }

	static create(pos) {
		let basePos = pos.add(new Vec2(0.2, 0.1))
		return new Coin(basePos, basePos, Math.random() * Math.PI * 2, this.typeOfPower)
	}
}

Coin.prototype.size = new Vec2(0.6, 0.6) 

//POWER UPS CLASS
class Powerup {
	constructor(pos, basePos, wobble){
		this.pos = pos
		this.basePos = basePos	
		this.wobble = wobble
	}

	get type() { return 'powerup' }

	static create(pos) {
		let basePos = pos.add(new Vec2(0, -0.2))
		return new Powerup(basePos, basePos, Math.random() * Math.PI * 2, this.typeOfPower)
	}
}

Powerup.prototype.size = new Vec2(1, 1) 

//FINISH FLAG CLASS
class Finish {
	constructor(pos){
		this.pos = pos
	}

	get type() { return 'finish' }

	static create(pos) {
		return new Finish(pos.add(new Vec2(0, -6)))
	}
}

Finish.prototype.size = new Vec2(2, 7) 

//ENEMY CLASS
class Enemy {
	constructor(pos, ch, speed, flip){
		this.pos = pos		
		this.typeOfEnemy = ch
		this.speed = speed
		this.flip = flip
	}

	get type() { return 'enemy' + this.typeOfEnemy }

	static create(pos, ch) {
		if(mathRand.getRandomIntInclusive(0, 1) === 1) return new Enemy(pos.add(new Vec2(0, 0)), ch, new Vec2(0, 0), 1)
		else return new Enemy(pos.add(new Vec2(0, 0)), ch, new Vec2(0, 0), -1)
	} 
}

Enemy.prototype.size = new Vec2(1, 1) 

//POWER UP BLOCK CLASS
class PowerUpBlock {
	constructor(pos, beenUsed){
		this.pos = pos
	
		if(beenUsed == undefined) 
			this.beenUsed = false
		else 
			this.beenUsed = beenUsed
	}

	get type() { return "powerupblock" }

	static create(pos, beenUsed) {
		return new PowerUpBlock(pos.add(new Vec2(0, 0), beenUsed))
	}
}

PowerUpBlock.prototype.size = new Vec2(1, 1) 

//LEVEL CHARACTERS AND THEIR CORRESPONDING CLASSES OR STRINGS,
//USED TO DETERMINE THE CHARACTERS WE LOAD FROM GAME_LEVELS AND HOW WE USE THE CHAR
const levelChars = {
	".": "empty",
	"#": "wall",
	"+": "water",
	"@": Player,
	"o": Coin,
	"m": Powerup,
	"~": Finish,
	"1": Enemy,
	"2": Enemy,
	"3": Enemy,
	"p": PowerUpBlock,

}
//EVERYTHING IS SCALED BY 20
const scale = 20
const scaleVec = new Vec2(20, 20)

