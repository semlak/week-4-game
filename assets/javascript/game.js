//some game settings and variables

const rawGithubLocation = "https://raw.githubusercontent.com/semlak/week-4-game/master/"


var audioElement // will be set later


const EventEnum = {
	NEWGAME: "NEWGAME",
	GAMEWIN: "GAMEWIN",
	GAMELOSE: "GAMELOSE",
	ATTACKWIN: "ATTACKWIN",
	ATTACKCONTINUE: "ATTACKCONTINUE"
}



// utility functions;
function deepCLoneOfArrayOfOjects(arrayOfOjbects) {
	// note that this that this would probably mess with fancy datatypes and would fail with circular references
	return JSON.parse(JSON.stringify(arrayOfOjbects));
};


const GameData = {
	characters: [{
			name: "Luke",
			description: "Area moister farmer",
			initialHP: 100,
			intialAP: 8,
			counterAP: 8,
			image: "./assets/images/luke1.jpg"
		}, {
			name: "Jabba the Hutt",
			description: "A slimy piece of worm-ridden filth",
			initialHP: 120,
			intialAP: 8,
			counterAP: 12,
			image: "./assets/images/jabba.jpg"
		}, {
			name: "Greedo",
			description: "Local bounty hunter",
			initialHP: 150,
			intialAP: 8,
			counterAP: 20,
			image: "./assets/images/greedo.png"
		}, {
			name: "Han",
			description: "He ALWAYS shoots first!",
			initialHP: 180,
			intialAP: 8,
			counterAP: 25,
			image: "./assets/images/han.jpg"
		}

	]
}


var Character = class {
	// constructor(name, intialHP, intialAP, counterAP, description) {
	// 	this.name = name;
	// 	this.healthPoints = initialHP;
	// 	this.initialAP = initialAP;
	// 	this.currentAttackPower = this.initialAP;
	// 	this.counterAP = counterAP;
	// 	this.description = description;
	// }

	constructor(charData) {
		this.name = charData.name;
		this.healthPoints = charData.initialHP;
		this.initialAP = charData.initialAP;
		this.currentAttackPower = this.initialAP;
		this.counterAP = charData.counterAP;
		this.description = charData.description;
		this.image = charData.image;
	}

	isDefeated() {
		return (this.healthPoints > 0);
	}

	attackWithCharacter(opponent) {
		opponent.receiveAttackFromPlayer(this);
		//opponent healthPoints will be updated accordingly. If opponent is not defeated, then their counterAttack will affect our character

		if (!(opponent.isDefeated())) {
			this.healthPoints -= opponent.counterAP;
		}

		// now that attack is over, player's character's currentAttackPower increases
		this.currentAttackPower += this.initialAP;

	}

	// this method is executed an a character who is the an opponent of the humen. the playerOpponent object is the human character
	receiveAttackFromPlayer(playerOpponent) {
		this.healthPonts -= playerOpponent.currentAttackPower

		// this player (opponent of human) counterAttackes if not defeated in the attack, but that is handled with the attackWithCharacter method
	}
}

var RPGGame = class {
	constructor() {
		// note that the data in the possibleCharacters array will not be modified, and thos the GameData will not be modified.
		this.possibleCharacters = GameData.characters;
		this.gameCharacters = [];
		this.startGame();
	}

	startGame() {
		this.gameCharacters = this.possibleCharacters.map(characterData => {
			var character = new Character(characterData);
			return character;
		});
		this.humanPlayerSet = false
		this.opponentSet = false

		$("#character-deck").empty();
		this.gameCharacters.forEach((character, i) => {
			console.log("image: ", character.name, character.image)
			let characterCard = $("<div>", {
				class: 'card text-center character-card',
				id: character.name,
				value: i.toString()
			});
			let cardImage = $("<img>", {
				class: "card-img-top",
				src: character.image,
				alt: character.name
			});
			let cardBody = $("<div>", {
				class: "card-body"
			}).append($("<p>", {
				class: 'card-text',
				html: character.name
			}));

			let cardFooter = $("<div>", {
				class: 'card-footer'
			}).append($("<small>", {
				class: 'text-muted',
				html: "Health: " + character.healthPoints
			}));

			characterCard.append(cardImage).append(cardBody).append(cardFooter);
			console.log("card: ", characterCard);
			$("#character-deck").append(characterCard);

		});

		this.addEventListeners()
	}

	setPlayerCharacter(index) {
		this.humanPlayerCharacterIndex = index;
	}

	setCurrentOpponent(index) {
		if (index === this.humanPlayerCharacterIndex) {
			// this shouldn't happen.
			throw "Opponent can't be same character as human player";
		}
		this.currentOpponent = index;
	}

	attackCurrentOpponentWithHumanCharacter() {
		var humanCharacter = this.gameCharacters[this.humanPlayerCharacterIndex];
		var opponent = this.currentOpponent;
		humanCharacter.attackWithCharacter(opponent);

		if (humanCharacter.isDefeated()) {
			$("body").trigger(EventEnum.GAMELOSE);
		} else if (opponent.isDefeated()) {
			$("body").trigger(EventEnum.ATTACKWIN);
		} else {
			// neither human player nor opponent has lossed. Screen needs to be updated though.
			$("body").trigger(EventEnum.ATTACKCONTINUE);
		}

	}

	updateScreen() {

	}

	addEventListeners() {
		var me = this;
		$("body").on(EventEnum.NEWGAME, function(e) {
			me.startGame();
			me.updateScreen();
		});

		$("body").on(EventEnum.GAMEWIN, function(e) {
			// me.startGame();
			me.updateScreen();
		});

		$("body").on(EventEnum.GAMELOSE, function(e) {
			// me.startGame();
			me.updateScreen();
		});

		$("body").on(EventEnum.ATTACKWIN, function(e) {
			// me.startGame();
			me.updateScreen();
		});

		$("body").on(EventEnum.ATTACKCONTINUE, function(e) {
			// me.startGame();
			me.updateScreen();
		});


		$("#attack").on("click", function() {

		});

		$("#reset").on("click", function() {

		});

		$(".character-card").on("click", function() {
			if (me.humanPlayerSet === false) {
				var charIndex = Number.parseInt($(this)[0].valueOf().attributes[2].value);
				// console.log("index", charIndex);
				me.setPlayerCharacter(charIndex);
				me.humanPlayerSet = true;
			} else if (me.opponentSet === false) {
				// set opponent index
				var charIndex = Number.parseInt($(this)[0].valueOf().attributes[2].value);
				if (charIndex === me.humanPlayerCharacterIndex) {
					alert("please select opponent to attack");
				} else {
					me.setCurrentOpponent(charIndex);
					me.opponentSet = true;
				}
			}
		});

	}
}





// $(document).ready(function() {
var game = new RPGGame();




// });