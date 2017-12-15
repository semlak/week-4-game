//some game settings and variables

const rawGithubLocation = "https://raw.githubusercontent.com/semlak/week-4-game/master/"


let audioElement // will be set later


const EventEnum = {
	NEWGAME: "NEWGAME",
	GAMEWIN: "GAMEWIN",
	GAMELOSE: "GAMELOSE",
	ATTACKWIN: "ATTACKWIN",
	ATTACKCONTINUE: "ATTACKCONTINUE"
}




const initialHPRange = [50, 300];
const initialAPRange = [5, 30];
const counterAPRange = [5, 50];

const orders = [
	[0, 1, 2],
	[0, 2, 1],
	[1, 0, 2],
	[1, 2, 0],
	[2, 0, 1],
	[2, 1, 0]
];


function randomNumberFromRangeArray(minMaxArr) {
	let [min, max] = minMaxArr;
	if (min > max) {
		[max, min] = minMaxArr;
	}
	return (Math.floor(Math.random() * (max - min) + min));

}

// utility functions;
function deepCLoneOfArrayOfOject(arrayOfOjbect) {
	// note that this that this would probably mess with fancy datatypes and would fail with circular references
	return JSON.parse(JSON.stringify(arrayOfOjbect));
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


let Character = class {
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
		console.log("playerOpponent", playerOpponent);
		this.healthPonts = this.healthPonts - playerOpponent.currentAttackPower;
		console.log("subtracting ", playerOpponent.currentAttackPower);
		console.log("healthPoints: ", this.healthPoints);
		// this player (opponent of human) counterAttackes if not defeated in the attack, but that is handled with the attackWithCharacter method
	}
}

let RPGGame = class {
	constructor() {
		// note that the data in the possibleCharacters array will not be modified, and thos the GameData will not be modified.
		let candidateCharacterSet = this.generateNewPlayerSet(deepCLoneOfArrayOfOject(GameData.characters));
		if (candidateCharacterSet.length > 1) {
			this.possibleCharacters = candidateCharacterSet;
		}
		else {
			this.possibleCharacters = deepCLoneOfArrayOfOject(GameData.characters)
		}

		this.gameCharacters = [];
		this.gameCharacterIdToIndexMap = {};
		this.gameCharacters.forEach((charObj, i) => {
			console.log(charObj, i);
			this.gameCharacterNameToIndexMap[charObj._id] = i
		});

		this.addEventListeners();

		this.startGame();
		this.winningSet = [];
		this.gameMessageModalData = {
			header: "A Star Wars RPG  Game",
			body: "Thank you for playing!"
		};
	}

	resetCurrentGame() {
		// this restarts the game, but with each character having the same initial Health Points, Attack Poweerr, and counter attack power.
		this.startGame()
	}


	startNewGame() {
		// thiss starts a new game, generating new initial values for character Health  Points, attack power, and counter attack power.
		//let characters = deepCLoneOfArrayOfOject(this.characters);
		let candidateCharacterSet = this.generateNewPlayerSet(deepCLoneOfArrayOfOject(GameData.characters));
		if (candidateCharacterSet.length > 1) {
			this.possibleCharacters = candidateCharacterSet;
		}
		else {
			this.possibleCharacters = deepCLoneOfArrayOfOject(GameData.characters)
		}
		this.startGame();
	}


	startGame() {
		let me = this;
		this.gameCharacters = this.possibleCharacters.map(characterData => {
			let character = new Character(characterData);
			return character;
		});
		this.humanPlayerSet = false
		this.opponentSet = false
		this.opponentsPlayed = 0

		$("#character-deck").empty();
		this.gameCharacters.forEach((character, i) => {
			// debugger;
			// console.log(character);
			// console.log("image: ", character.name, character.image, character._id)
			let characterCard = $("<div>", {
				class: 'card text-center character-card view overlay hm-blue-light',
				value: i.toString(),
				id: character._id
				// style: "{width: 20rem}"
			});
			let cardHeader = $("<div>", {
				class: "card-header",
				html: character.name
			});
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
			let maskDiv = ($("<div>", {
				class: 'mask'
			}))
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

			// // get current height off character cards and set height to that to try to force them to stay same height
			// setTimeout(function() {
			// let cardHeight = $("#" + me.gameCharacters[0]._id).height();
			let cardWidth = $("#" + me.gameCharacters[0]._id).width();
			// 	console.log("cardHeight", cardHeight);

			// $(".character-card").height(cardHeight).width(cardWidth);


			// $(".character-card").css("maxWidth", cardWidth);

			// }, 1000);


		});

		// clear the battle characters
		$("#battle-deck").empty();
		this.addCharacterClickListeners();
		setTimeout(function() {
			me.characterDeckHeight = $("#character-deck").outerHeight();
			console.log("set characterDeckHeight", me.characterDeckHeight);
			$("#character-deck").css("minHeight", me.characterDeckHeight);
			$("#battle-deck").css("minHeight", me.characterDeckHeight);


		}, 100);


		// now that character-deck is full, set its  min-height to the current height to keep it from collapsing.


		// disable Attack button (will be enabled after player selects charactetr and opponent)
		$("#attack-button").prop('disabled', true);
		$("#attack-button").attr('aria-disabled', true);

	}

	setPlayerCharacter(index) {
		let me = this;
		if (isNaN(index)) {
			throw "Error. Index should not be NaN";
		}
		this.humanPlayerCharacterIndex = index;
		let charObj = this.gameCharacters[this.humanPlayerCharacterIndex];
		let characterCard = $("#" + charObj._id);
		console.log(charObj, characterCard);
		let cardWidth = characterCard.width();

		characterCard.addClass("character-card-being-moved").animate({
			// width: 0.
			opacity: 0
		}, "slow", function() {
			// debugger
			// return;
			// characterCard.remove()
			characterCard.appendTo("#battle-deck").animate({
				// width: cardWidth
				opacity: 1,
			}, "slow");
			$(".show-when-battle-deck-occupied").animate({
				"visibility": "visible"
			}, "fast")
			// function() {
			// .css("visibility", "visible");
			// }
			$(".character-card").removeClass("view overlay hm-blue-light character-card-being-moved ");

			$("#character-deck .card").addClass("view overlay hm-red-light");

			let instructionText = me.opponentsPlayed === 0 ? "Great! Now select an opponent" : me.opponentsPlayed < me.gameCharacters.length - 1 ? "You won the battle. Now select another opponent" : "You won the game"
			$("#game-instruction").text(instructionText);

		});

		// now, make the remaining avaiable players turn reddish when highlighed. Also, don't want player character to highlight
	}

	setCurrentOpponent(index) {
		if (index === this.humanPlayerCharacterIndex) {
			// this shouldn't happen.
			throw "Opponent can't be same character as human player";
		}
		this.currentOpponentIndex = index;

		let charObj = this.gameCharacters[this.currentOpponentIndex];
		let characterCard = $("#" + charObj._id);
		console.log(charObj, characterCard);

		let cardWidth = characterCard.width();
		let oldMarginWidth = Number.parseInt(characterCard.css("margin-left").replace(/px/, ""));
		console.log("oldMarginWidth", oldMarginWidth);

		characterCard.animate({
			opacity: 0
		}, "slow", function() {
			characterCard.remove()
			// don't set new margin with large on small screen/mobile device. Use Media query to determine.
			let newMarginWidth = cardWidth * 2;

			if (window.matchMedia('(max-width: 767px)').matches) {
				// console.log("\n\n\n\n\nhey");
				newMarginWidth = oldMarginWidth;
			}
			// characterCard.animate({marginLeft: newMarginWidth})
			characterCard.appendTo("#battle-deck").animate({
				opacity: 1,
				marginLeft: newMarginWidth
			}, "slow");



			$(".character-card").removeClass("view overlay hm-red-light");
			$("#attack-button").prop('disabled', false);
			$("#attack-button").attr('aria-disabled', false);
			$("#battle-deck small").removeClass('text-muted');

			let instructionText = "Attack your opponent"
			$("#game-instruction").text(instructionText);
		});

		// characterCard.remove();
		// characterCard.appendTo("#battle-deck");

		// characterCard.attr("style: margin-left")


		// now, remove hover highlight from remaining character cards and enabale attack button



	}

	attackCurrentOpponentWithHumanCharacter() {
		let humanCharacter = this.gameCharacters[this.humanPlayerCharacterIndex];
		let opponent = this.gameCharacters[this.currentOpponentIndex];
		humanCharacter.attackWithCharacter(opponent);
		let me = this;

		if (humanCharacter.isDefeated()) {
			$("body").trigger(EventEnum.GAMELOSE);
			// show modal with message that playerr has lossed.
			// $('#myModal').on('shown.bs.modal', function() {
			let modal = $('#gameMessageModal');
			me.gameMessageModalData.header = "Game over";
			me.gameMessageModalData.body = "Sorry. You lost. You can reset the game to play with the same character values, or start a new game which will reset character values."
			$("#messageModalLabel").text(me.gameMessageModalData.header)
			$("#messageModalBody").text(me.gameMessageModalData.body)
			$('#gameMessageModal').modal('show');
			// })
		}
		else if (opponent.isDefeated()) {
			// if there are no opponents  left, player has won the whole game. Otherwise, player has just won this battle
			if ($("#character-deck .character-card").length === 0) {
				$("body").trigger(EventEnum.GAMEWIN);
				let modal = $('#gameMessageModal');
				me.gameMessageModalData.header = "You won!";
				me.gameMessageModalData.body = "Amazing! You won! The force must be with you.\n\nYou can still reset the game to play with the same character values, or start a new game which will reset character values."
				$("#messageModalLabel").text(me.gameMessageModalData.header)
				$("#messageModalBody").text(me.gameMessageModalData.body)
				$('#gameMessageModal').modal('show');
			}
			$("body").trigger(EventEnum.ATTACKWIN);
		}
		else {
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
		let me = this;
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
			// window.alert("Sorry. You lossed");
			// me.updateScreen();
			$("#attack-button").prop('disabled', true);
			$("#attack-button").attr('aria-disabled', true);

		});

		$("body").on(EventEnum.ATTACKWIN, function(e) {
			// me.startGame();
			// window.alert("You won a battle!");

			$("#attack-button").prop('disabled', true);
			$("#attack-button").attr('aria-disabled', true);
			let opponentCard = $("#battle-deck .character-card:last-child")
			opponentCard.fadeOut(1000, function() {
				opponentCard.remove();
				me.opponentSet = false;
				me.opponentsPlayed++;
				let instructionText = me.opponentsPlayed < me.gameCharacters.length - 1 ? "You won the battle! Now select another opponent" : "You won the game!"
				$("#game-instruction").text(instructionText);
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
			let charObj = me.gameCharacters[me.humanPlayerCharacterIndex];
			// let characterCard = $("#" + charObj._id);

			let opponentObj = me.gameCharacters[me.currentOpponentIndex];
			// let opponentCard = $("#" + opponentObj._id);

			$("#" + charObj._id + "  small").text("Health: " + charObj.healthPoints);
			$("#" + opponentObj._id + " small").text("Health: " + opponentObj.healthPoints);
		});

		$("#restart-button").on("click", function() {
			me.resetCurrentGame();
		})
		$("#new-game-button").on("click", function() {
			me.startNewGame();
		})

	}

	addCharacterClickListeners() {
		let me = this;

		$(".character-card").on("click", function() {
			console.log("character clicked")
			console.log("humanPlayerSet", me.humanPlayerSet, ", opponentSet: ", me.opponentSet);
			if (me.humanPlayerSet === false) {
				console.log((this.id));
				// let charIndex = Number.parseInt($(this)[0].valueOf().attributes[2].value);
				// let charIndex = me.gameCharacterNameToIndexMap[this.id];
				let charIndex = me.gameCharacters.findIndex(charObj => charObj._id === this.id)

				// let charIndex = $(this).val();

				me.setPlayerCharacter(charIndex);
				me.humanPlayerSet = true;
			}
			else if (me.opponentSet === false) {
				console.log("The player selected character as opponent")
				// set opponent index
				// let charIndex = Number.parseInt($(this)[0].valueOf().attributes[2].value);
				let charIndex = me.gameCharacters.findIndex(charObj => charObj._id === this.id)
				if (charIndex === me.humanPlayerCharacterIndex) {
					alert("please select opponent to attack");
				}
				else {
					me.setCurrentOpponent(charIndex);
					me.opponentSet = true;
				}
			}
		});

	}



	checkForWinAndLoss(player, opponents) {
		// this function only checks that the single character (input as player) has both a winning and losing path.
		// While doing so, it is able to adjust the player's initialAP, because this does not affect how it behaves as an opponent
		// results stores the player's  health at the end of each iteration of opponent order.
		// a value  in the  results
		let playerHealthResults = [];
		orders.forEach(function(order) {
			let playerHealth = player.initialHP;
			let playerAP = player.initialAP;
			order.forEach(function(opponentIndex) {
				// console.log("opponents", opponents, "opponentIndex", opponentIndex);
				// console.log(opponentIndex);
				let opponent = opponents[opponentIndex];
				// console.log("opponent", opponent);
				// return false;
				let attacksNeeded = 0;
				let opponentHeath = opponent.initialHP;
				let orderFailed = false;
				let whileLoopLimit = 100;
				let counter = 0;
				while (opponentHeath > 0 && counter < whileLoopLimit) {
					// this works sort like a binary search to find  initialAP that will work let the character win.
					// however, there is an error in the logic that allows it to run indefinitely, and so I have imposed a whileLoopLimit
					// console.log("in checkForWinAndLoss", player.name, "playerHealth: ", playerHealth, "against", opponent.name)
					opponentHeath -= playerAP;
					if (opponentHeath > 0) {
						playerHealth -= opponent.counterAP;
					}

					// playerHealth += player.initialAP;
					playerAP += player.initialAP;
					attacksNeeded++;
					if (playerHealth < 1) {
						// return false;
						// orderFailed = true;
						// playerHealthResults.push(false);
					}
					counter++;
				}
				if (counter >= whileLoopLimit) {
					console.log("\n\n\n\nFailed to find winning path for character\n\n\n");
					return 0;
				}
				// console.log(opponent.name, attacksNeeded);

				// console.log()
				// playerHealthResults.push(orderFailed);

				//return true;

			})
			playerHealthResults.push(playerHealth > 0);
			// console.log(playerHealth > 0)
		})
		// console.log(player.name, ":", order.map(i => opponents[i].name));
		// console.log(player.name, ":", playerHealthResults, "\n\n")
		// return "hey";

		let winCount = playerHealthResults.filter(result => result).length;
		// return (playerHealthResults.filter(result => result). && playerHealthResults.filter(result => !result));
		return winCount;
		// // return (winCount > 0 && winCount < 5);
		// if (winCount < 1) {
		// 	return -1;

		// }
		// else if (winCount < 5) {
		// 	return 0;
		// }
		// else {
		// 	return 1;
		// }

	}


	checkCharacterSetForWinAndLossPaths(characters) {
		let results = [];
		for (var j = 0; j < characters.length; j++) {
			let foundSolution = false;
			let player = characters[j];
			let opponents = characters.filter((character, k) => k !== j);
			// console.log(opponents.map(opponent => opponent.initialHP));
			// let maxOpponentHealth = opponents.map(opponent => opponent.initialHP).reduce((a, b) => Math.max(a, b));
			// let minOpponentHealth = opponents.map(opponent => opponent.initialHP).reduce((a, b) => Math.min(a, b));
			// let minOpponentHealth = Math.min(opponents.map(opponent => opponent.initialHP));
			// console.log(maxOpponentHealth, minOpponentHealth);
			// console.log(opponents);
			// console.log("\n\n\n\n");
			// changeInInitialAP = Math.floor((maxOpponentHealth - minOpponentHealth) / 2 + maxOpponentHealth)
			let changeInInitialAP = 2
			// player.initialAP = minOpponentHealth + changeInInitialAP;
			for (let i = 0; i < 10; i++) {
				console.log("looping in checkCharacterSetForWinAndLossPaths trying to find character's initialAP, for character", player.name);
				let winCheck = this.checkForWinAndLoss(player, opponents);
				// console.log("Character", player.name, " number of Wins", winCheck, "initialAP", player.initialAP);

				if (winCheck > 0 && winCheck < 6) {
					// console.log("Character", player.name, " wins with initialAP", player.initialAP);
					i = 10;
					foundSolution = true;
					// return true;
				}
				else if (winCheck < 1) {
					// changeInInitialAP = Math.floor(changeInInitialAP / 2);
					// player.initialAP += 2;
					if (changeInInitialAP > 0) {
						changeInInitialAP += 2;
					}
					else {
						changeInInitialAP = Math.floor(Math.abs(changeInInitialAP) - Math.abs(changeInInitialAP) / 2);
					}
					player.initialAP += changeInInitialAP;

				}
				else {
					if (changeInInitialAP < 0) {
						changeInInitialAP -= 2;
					}
					else {
						changeInInitialAP = 0 - Math.floor(Math.abs(changeInInitialAP) - Math.abs(changeInInitialAP) / 2);

					}
					// changeInInitialAP = Math.floor(changeInInitialAP / 2)
					// player.initialAP -= 2;
					player.initialAP += changeInInitialAP;

				}
				if (i >= 9 && !foundSolution) {
					console.log("was not able to find a good initialAP for the character", player.name, " with this set")
				}
			}
			if (j >= characters.length - 1) {
				results.push(foundSolution);
			}
			// console.log(winCheck);


			// characters.forEach(function(opponent, j) {
			// 	// console.log(opponent);
			// });
		};
		return results;
	}



	generateNewPlayerSet(characters) {
		let me = this;
		for (let i = 0; i < 5; i++) {
			console.log("looping in generateNewPlayerSet trying to generate a new character set");
			characters.forEach(function(player) {
				player.initialHP = randomNumberFromRangeArray(initialHPRange);
				player.initialAP = randomNumberFromRangeArray(initialAPRange);
				player.counterAP = randomNumberFromRangeArray(counterAPRange);
			});
			if (me.checkCharacterSetForWinAndLossPaths(characters)) {
				return characters;
			}
			else if (i >= 4) {
				console.log("found  no valid set of initial conditions for characters");
				return [];
			}

		}
	}

}





// $(document).ready(function() {
let game = new RPGGame();




// });s