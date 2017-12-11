# week-4-game

### Overview

This is a small webapp/game I programmed as a homework assignment for a program I was completing. 

The game is written as a simple web-application where the majority of functionality is in JavaScript, with jQuery used to handle the page maniuplation. The program also uses some stying with [Bootstrap 4](https://getbootstrap.com/) and [Material Design for Bootstrap](https://mdbootstrap.com/components/cards/).

As far as the game goes, it is a really basic Role Playing Game (RPG). Although the characters are taken from the Star Wars Universe, the functionality of the game is not otherwise based on that story.

A playable version of the game has been deployed via GitHub Pages, at [https://semlak.github.io/week-4-game/](https://semlak.github.io/week-4-game/)

#### Basic flow of game play: 
1. When the game starts, the player choses a character to play as. They will play as that character for the rest of the game
	* If the player choses to reset the game, they can chose a different character to play as.
2. From that point, the goal of the game is to defeat all other characters, one at a time.
	* The player selects one of the remaining characters to attack.
	* The player then attacks this character until either one of them is defeated.
	* If the player's character is defeated, the game is over.
	* If the opponent character is defeated, the player must continue until all remaining characters are defeated.

#### How a battle between two characters works:
* While attacking, the player's character's attack points inflicted on the opponent increase with each single attack. 
* Meanwhile, the opponent character's attack power remains constant. 
* Each character inflicts their attack power on the other character, which results in an associated reduction in that character's health points.

#### Other notes:
* It is not necessarily possible to defeat all characters in any given order.
* It should be possible to win with any of the characters, but that the order to defeat the other characters may need to be chosen wisely.