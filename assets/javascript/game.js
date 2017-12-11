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
			_id: "luke",
			description: "Area moister farmer",
			initialHP: 100,
			initialAP: 14,
			counterAP: 8,
			image: "./assets/images/luke1.jpg"
		}, {
			name: "Jabba the Hutt",
			_id: "jabba",
			description: "A slimy piece of worm-ridden filth",
			initialHP: 120,
			initialAP: 8,
			counterAP: 12,
			image: "./assets/images/jabba.jpg"
		}, {
			name: "Greedo",
			_id: "greedo",
			description: "Local bounty hunter",
			initialHP: 150,
			initialAP: 8,
			counterAP: 20,
			image: "./assets/images/greedo.png"
		}, {
			name: "Han",
			_id: "han",
			description: "He ALWAYS shoots first!",
			initialHP: 180,
			initialAP: 8,
			counterAP: 25,
			image: "./assets/images/han.jpg"
		}

	]
}


var Character = class {
	// constructor(name, initialHP, initialAP, counterAP, description) {
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
		this._id = charData._id;
	}

	isDefeated() {
		return (!(this.healthPoints > 0));
	}

	attackWithCharacter(opponent) {
		// opponent.receiveAttackFromPlayer(this);
		opponent.healthPoints = opponent.healthPoints - this.currentAttackPower; 
		//opponent healthPoints will be updated accordingly. If opponent is not defeated, then their counterAttack will affect our character

		if (!(opponent.isDefeated())) {
			this.healthPoints -= opponent.counterAP;
		}

		// now that attack is over, player's character's currentAttackPower increases
		this.currentAttackPower += this.initialAP;

	}

	// this method is executed an a character who is the an opponent of the humen. the playerOpponent object is the human character
	receiveAttackFromPlayer(playerOpponent) {
		console.log("in receiveAttackFromPlayer");
		console.log("playerOpponent",playerOpponent );
		this.healthPonts = this.healthPonts - playerOpponent.currentAttackPower;
		console.log("subtracting ", playerOpponent.currentAttackPower);
		console.log("healthPoints: ", this.healthPoints);
		// this player (opponent of human) counterAttackes if not defeated in the attack, but that is handled with the attackWithCharacter method
	}
}

var RPGGame = class {
	constructor() {
		// note that the data in the possibleCharacters array will not be modified, and thos the GameData will not be modified.
		this.possibleCharacters = GameData.characters;
		this.gameCharacters = [];
		this.addEventListeners();

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
			// debugger;
			console.log(character);
			console.log("image: ", character.name, character.image, character._id)
			let characterCard = $("<div>", {
				class: 'card text-center character-card view overlay hm-blue-light',
				id: character._id,
				value: i.toString()
			});
			let cardHeader = $("<div>", {class:"card-header", html: character.name});
			let cardImage = $("<img>", {
				class: "card-img-top",
				src: character.image,
				alt: character.name
			});
			let cardBody = $("<div>", {
				class: "card-body"
			});
			// cardBody.append($("<p>", {
			// 	class: 'card-text',
			// 	html: character.name
			// }));
			let maskDiv = ($("<div>",  {class:'mask'}))
			// let flexDiv = ($("<div>",  {class:'mask flex-center', html:"Select " + character.name}))
			// .append("<p>Select Character</p>"));

			let cardFooter = $("<div>", {
				class: 'card-footer'
			}).append($("<small>", {
				class: 'text-muted',
				html: "Health: " + character.healthPoints
			}));

			characterCard.append(cardHeader).append(cardImage).append(cardBody).append(maskDiv).append(cardFooter);
			// characterCard.append(cardHeader).append(cardImage).append(flexDiv).append(cardFooter);
			console.log("card: ", characterCard);
			$("#character-deck").append(characterCard);


		});

		// clear the battle characters
		$("#battle-deck").empty();
		this.addCharacterClickListeners();


		// disable Attack button (will be enabled after player selects charactetr and opponent)
		$("#attack-button").prop('disabled', true);
		$("#attack-button").attr('aria-disabled', true);

	}

	setPlayerCharacter(index) {
		this.humanPlayerCharacterIndex = index;
		var charObj = this.gameCharacters[this.humanPlayerCharacterIndex];
		var charCard = $("#" + charObj._id);
		console.log(charObj, charCard);
		var cardWidth = charCard.width();

		charCard.animate({width: 0}, "slow", function() {
			charCard.remove()
			charCard.appendTo("#battle-deck").animate({width: cardWidth}, "slow");
			$(".character-card").removeClass("view overlay hm-blue-light");

			$("#character-deck .card").addClass("view overlay hm-red-light")

		});

		// now, make the remaining avaiable players turn reddish when highlighed. Also, don't want player character to highlight
	}

	setCurrentOpponent(index) {
		if (index === this.humanPlayerCharacterIndex) {
			// this shouldn't happen.
			throw "Opponent can't be same character as human player";
		}
		this.currentOpponentIndex = index;

		var charObj = this.gameCharacters[this.currentOpponentIndex];
		var charCard = $("#" + charObj._id);
		console.log(charObj, charCard);

		var cardWidth = charCard.width();

		charCard.animate({width: 0}, "slow", function() {
			charCard.remove()
			var newMarginWidth = cardWidth * 2;	
			// charCard.animate({marginLeft: newMarginWidth})			
			charCard.appendTo("#battle-deck").animate({width: cardWidth, marginLeft: newMarginWidth}, "slow");


			$(".character-card").removeClass("view overlay hm-red-light");
			$("#attack-button").prop('disabled', false);
			$("#attack-button").attr('aria-disabled', false);
			$("#battle-deck small").removeClass('text-muted');
		});

		// charCard.remove();
		// charCard.appendTo("#battle-deck");

		// charCard.attr("style: margin-left")
		

		// now, remove hover highlight from remaining character cards and enabale attack button



	}

	attackCurrentOpponentWithHumanCharacter() {
		var humanCharacter = this.gameCharacters[this.humanPlayerCharacterIndex];
		var opponent = this.gameCharacters[this.currentOpponentIndex];
		humanCharacter.attackWithCharacter(opponent);

		if (humanCharacter.isDefeated()) {
			$("body").trigger(EventEnum.GAMELOSE);
		} else if (opponent.isDefeated()) {
			// if there are no opponents  left, player has won the whole game. Otherwise, player has just won this battle
			if ($("#character-deck .character-card").length === 0 ) {
				$("body").trigger(EventEnum.GAMEWIN);				
			}
			$("body").trigger(EventEnum.ATTACKWIN);
		} else {
			// neither human player nor opponent has lossed. Screen needs to be updated though.
			$("body").trigger(EventEnum.ATTACKCONTINUE);
		}

	}

	updateScreen() {
		// $("#battle-deck .character-card").forEach(function(card) {
			// console.log("this")
		// })

	}

	addEventListeners() {
		var me = this;
		$("body").on(EventEnum.NEWGAME, function(e) {
			me.startGame();
			me.updateScreen();
		});

		$("body").on(EventEnum.GAMEWIN, function(e) {
			// me.startGame();
			// window.alert("Awesome! You won the entire game!");
			$("#attack-button").prop('disabled', true);
			$("#attack-button").attr('aria-disabled', true);			
			// me.updateScreen();
		});

		$("body").on(EventEnum.GAMELOSE, function(e) {
			// me.startGame();
			window.alert("Sorry. You lossed");
			// me.updateScreen();
		$("#attack-button").prop('disabled', true);
		$("#attack-button").attr('aria-disabled', true);

		});

		$("body").on(EventEnum.ATTACKWIN, function(e) {
			// me.startGame();
			// window.alert("You won a battle!");

			$("#attack-button").prop('disabled', true);
			$("#attack-button").attr('aria-disabled', true);
			var opponentCard = $("#battle-deck .character-card:last-child").fadeOut(1000, function() {
				opponentCard.remove();
				me.opponentSet = false;
			});
			// opponentCard.toggle

			me.updateScreen();
		});

		$("body").on(EventEnum.ATTACKCONTINUE, function(e) {
			// me.startGame();
			me.updateScreen();
		});



		$("#attack-button").on("click", function() {
			me.attackCurrentOpponentWithHumanCharacter();
			var charObj = me.gameCharacters[me.humanPlayerCharacterIndex];
			// var charCard = $("#" + charObj._id);

			var opponentObj = me.gameCharacters[me.currentOpponentIndex];
			// var opponentCard = $("#" + opponentObj._id);

			$("#" + charObj._id + "  small").text("Health: " + charObj.healthPoints);
			$("#" + opponentObj._id + " small").text("Health: " + opponentObj.healthPoints);
		});

		$("#reset-button").on("click", function() {
			me.startGame();
		})

	}

	addCharacterClickListeners() {
		var me = this;

		$(".character-card").on("click", function() {
			console.log("character clicked")
			console.log("humanPlayerSet", me.humanPlayerSet, ", opponentSet: ", me.opponentSet);
			if (me.humanPlayerSet === false) {
				// debugger;
				console.log($(this).val());
				var charIndex = Number.parseInt($(this)[0].valueOf().attributes[2].value);
				// var charIndex = $(this).val();

				// console.log("index", charIndex);
				me.setPlayerCharacter(charIndex);
				me.humanPlayerSet = true;
			} else if (me.opponentSet === false) {
				console.log("player selected character as opponent")
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