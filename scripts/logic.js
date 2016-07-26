
  //**********************************************************************//
 //                           CONSTRUCTORS                               //
//**********************************************************************//

/**
 * @typedef Dice
 * @type {Object}
 * @property {Number} value - value of the die
 * @property {Boolean} held - whether it is being held
 */
function Dice(){
	if(!(this instanceof Dice)) {
		return new Dice();
	}
	var value = 0,
		held = false;
	
	this.isHeld = function(){
		return held;
	}
	
	this.getValue = function(){
		return value;
	}
	
	this.setValue = function(newValue){
		value = newValue;		
	}
	
	this.toggleHeld = function(){
		held = !(held);
	}

}

/**
 * @typedef Category
 * @type {Object}
 * @property {Number} currentScore - current Score for this Category
 * @property {Boolean} scored - indicates if Category is scored
 */

function Category(){
	var currentScore = 0,
		scored = false;	
	
	this.getScore = function(){
		return currentScore;
	}
	
	this.setScore = function(newScore){
		currentScore += newScore;
		scored = true;
		// rollCounter=0;
		console.log("Score was set to ", newScore);
	}
	
	this.isAlreadyScored = function(){
		return scored;
	}

}
/**
 * @typedef Game
 * @type {Object}
 * @property {Boolean} isOver - is game finished
 * @property {Number} finalScore - final score
 */
function Game(){
	var isOver= false,
		finalScore = 0;
	
	this.getIsOver = function(){
		return isOver;
	}
	
	this.setIsOver = function(){
		isOver = checkCompletion();
	}
	
}


//----------------------------------------------------------------------------------------------------//

/**
 * Produces 5 random numbers between 1-6 and assigns them to their respective dice
 * if they are not currently being held. Dice that are being held do not have their 
 * value changed
 */
function roll(){
	if(rollCounter!=0 && rollCounter%3===0){
		console.log("Cannot roll again!");
		alert("You cannot roll again, must score!");
		return;
	}
	for (var i=0; i<5; i++){
		currentDie = diceArray[i];
		var num=Math.floor(Math.random()*6+1);
		if (!currentDie.isHeld()){
			currentDie.setValue(num);
		}
	}
	console.log(diceArray);
	printValues();
	rollCounter +=1;
	justScored = false;
}


/** Prints the current roll to the console */
function printValues(){
	var diceValues = [];
	for(var i=0; i<diceArray.length; i++){
		diceValues[i] = diceArray[i].getValue();
	}
	console.log(diceValues);
}


/** Prints the current scorecard to the console */
function printScorecard(){
	for(var i=0; i<categoryArray.length; i++){
		console.log(categoryArray[i], categoryArray[i].getScore());
	}
}

/** Toggles the held dice making them all unheld */
function clearHeld(){
	for(var i=0; i<diceArray.length; i++){
		if(diceArray[i].isHeld()){
			diceArray[i].toggleHeld();
		}
	}
}


/**
 * Takes as input a number corresponding to a category, calculates the score for that category 
 * and then calls enterScore to enter it.
 *0-5: 1s through 6s
 *  6: three-of-a-kind
 *  7: four-of-a-kind
 *  8: full house
 *  9: Small straight
 * 10: Large straight
 * 11: Yahtzee
 * 12: Chance
 * @param {Number} Number correspoding to category to be scored(int)
 * @returns {Boolean}: Boolean representing success of scoring category
 */
function scoreCategory(number){
	var success = false;
	
	var sumOfAllDice = 0;		
	for(var i=1; i<=6; i++){
		sumOfAllDice += i*occurs(i);
	}
	
	if(number>=0 && number<=5){			//If the number is between 1-6 this will be scored in the numerical categories
		var score = occurs(number+1)*(number+1);
		return enterScore(number,score);
	}
	
	switch(number){						//Special cases
		case 6:
			if(checkThreeKind()){
				return enterScore(6, sumOfAllDice);
			}
			else{
				return enterScore(6,0);
			}
			break;
		case 7:
			if(checkFourKind()){
				return enterScore(7,sumOfAllDice);
			}
			else{
				return enterScore(7,0);
			}
			break;
		case 8:
			if(checkFullHouse()){
				return enterScore(8, 25);
			}
			else{
				return enterScore(8,0);
			}
			break;
		case 9:
			if(checkForStraight(4)){
				return enterScore(9,30);
			}
			else{
				return	enterScore(9,0);
			}
			break;
		case 10:
			if(checkForStraight(5)){
				return enterScore(10,40);
			}
			else{
				return enterScore(10,0);
			}
			break;
		case 11:
			if(checkYahtzee()){
				return enterScore(11,50);
			}
			else{
				return enterScore(11,0);
			}
			break;
		case 12:
			return enterScore(12,sumOfAllDice);
			break;
		default:
			console.log("Wrong category entered, please try again.");
			return false;
	}
	
}


/**
 * Takes in a score and a number corresponding to the category in which to enter it.
 * If successful resets held dice so that new turn can begin, and returns TRUE.
 * @param {Number} int corresponding to category to score
 * @param {Number} int score
 * @returns {Boolean}: bool representing success of entering the score
 */
function enterScore(category, score){
	if(!$.isNumeric(category)||category<0||category>categoryArray.length-1){
		alert("Invalid category, try again!")
		return false;
	}
	
	if(category!==11){								//Every category but Yahtzee
		if(categoryArray[category].isAlreadyScored()){
			alert("Category already scored, please choose another!"); //*******Add a ROLL button disabler here?
			return false;
		}
		categoryArray[category].setScore(score);
		justScored=true;
	}

	if(category===11){ 							//Special case for entering a Yahtzee score
		if(categoryArray[11].isAlreadyScored()){
			categoryArray[13].setScore(100);
			justScored = true;
		}
		else{
			categoryArray[11].setScore(score);
			justScored = true;
		}
	}

	$(".dice").removeClass("held");				//Reset dice and rollCounter in any case
	clearHeld();
	rollCounter=0;

	if(checkCompletion()){
		console.log("Game complete, calling GETPLAYERNAMEANDSCORE");
		var playerNameAndScore = getPlayerNameAndScore();
		sendEndgameInfo(playerNameAndScore);
		alert("You have finished the game!");
		alert("Your final score is " + getFinalScore());
	}
	return true;
}


/**
 * Returns an integer corresponding to how many times a certain number occurs in the current roll.
 * @param {Number} Number we are interested in -int
 * @returns {Number} How many times this number showed up in the current roll -int
 */
function occurs(number){
	var counter = 0;
	for(var i=0; i<5; i++){
		if(diceArray[i].getValue()===number){
			counter+=1;
		}
	}

	return counter;
}


/**
 * Checks whether "3 of a kind" has been achieved.
 * @returns {Boolean} Boolean corresponding to whether "3 of a kind" has been achieved
 */
function checkThreeKind(){
	for(var i=1; i<=6; i++){
		if (occurs(i)>=3){
			return true;
		}
	}
	return false;
}



/**
 * Checks whether "4 of a kind" has been achieved.
 * @returns {Boolean} Boolean corresponding to whether "4 of a kind" has been achieved
 */
function checkFourKind(){
	for(var i=1; i<=6; i++){
		if(occurs(i)>=4){
			return true;
		}
	}
	return false;
}	


/**
 * Checks whether a full house has been achieved.
 * @returns {Boolean} Boolean corresponding to whether Full House has been achieved
 */
function checkFullHouse(){
	if(checkThreeKind()){
		for (var i=0; i<=6; i++){
			if(occurs(i)===2){
				return true;
			}
		}
	}
	return false;
}


/**
 * Checks if has been achieved (5 of the same number).
 * @returns {Boolean} Boolean corresponding to whether or not Yahtzee was achieved
 */
function checkYahtzee(){
	for(var i=0; i<diceArray.length; i++){
		if(occurs(i+1)===5){
			return true;
		}
	}
	return false;
}


/**
 * Checks to see if there are any categories left to score. 
 * @returns {Boolean} Boolean indicating whether all categories have been scored
 */
function checkCompletion(){

	for(var i=0; i<categoryArray.length-2; i++){
		if(categoryArray[i].isAlreadyScored()==false){
			return false;
		}
	}
	return true;
}

/**
 * Gets the subtotal from the categories in the top half (1-6)
 * @returns {Number} score for numerical categories (before potential bonus)
 */
function getSubtotal(){
	var subtotal = 0;
	for(var i=0; i<6; i++){
		subtotal += categoryArray[i].getScore();
	}
	return subtotal;
}


/**
 * Checks the subtotal in the first categories and if is is over 63
 * it adds another 35 points to the total score.
 */
function setBonus(){
	bonus.setScore(0);
	if(getSubtotal()>=63){
		bonus.setScore(35);
	}
}

/**
 * Calculates the total final score of the game
 * @returns {Number} final score
 */
getFinalScore = function(){
	var sum=0;
	setBonus();
	for (var i=0; i<categoryArray.length; i++){
		sum+=categoryArray[i].getScore();
	}
	return sum;
}

/**
 * Checks for a straight of a certain length (4 for small, 5 for large)
 * Sorts values, removes duplicates and checks for desired straight
 * @param {Number} length of straight(int)
 * @returns {Boolean} bool indicating if it was achieved or not
*/
function checkForStraight(length){
	var length = length,
		diceValues = []
		counter = 0;

	for(var i=0; i<diceArray.length; i++){
		diceValues[i]=diceArray[i].getValue();
	}
	diceValues.sort();
	
	for(var i=0; i<diceValues.length-1; i++){
		if(diceValues[i]===diceValues[i+1]){
			diceValues.splice(i+1,1);
			i-=1;
		}
	}

	for(var i=0; i<diceValues.length-1; i++){
		if(diceValues[i]+1===diceValues[i+1]){
			counter+=1;
		}
	}
	if(counter>=length-1){
		return true;
	}
	else{
		return false;
	}

}


/**
 * Sets the roll to a yahtzee roll, used for debugging
 * @returns {Object} object with player name and info
 */
function setYahtzee(){
	var diceValues = [];

	for(var i=0; i<diceArray.length; i++){
		diceArray[i].setValue(4);
		diceValues[i]=diceArray[i].getValue();
	}
	console.log(diceValues);
}

/**
 * Gets player input for name and creates object with that and final score
 * @returns {Object} Object with {name: String, score: Number}
 */
 function getPlayerNameAndScore(){
 	var playerName = getPlayerName(),
 		finalScore = getFinalScore(),
 		gameInfo = {
 			name: playerName,
 			score: finalScore
 		}
 		if( !(playerName && finalScore) ) {
 			console.log("An error occurred. Please make sure player name and" +
 				" final score are entered properly.");
 			return;
 		}
 	return gameInfo;
 }

 /**
  * Sends endgame information (object with name and score) to server
  */
  function sendEndgameInfo(gameInfo){
  	$.post('http://localhost:3000', gameInfo);
  }

function newGame(){

	die1 = new Dice(),
	die2 = new Dice(),
	die3 = new Dice(),
	die4 = new Dice(),
	die5 = new Dice(),
	ones = new Category(),
	twos = new Category(),
	threes = new Category(),
	fours = new Category(),
	fives = new Category(),
	sixes = new Category(),
	subtotal = new Category(),
	bonus = new Category(),
	threeKind = new Category(),
	fourKind = new Category(),
	fullHouse = new Category(),
	smallStraight = new Category(),
	largeStraight = new Category(),
	yahtzee = new Category(),
	yahtzeeBonus = new Category(),
	chance = new Category(),
	grandTotal = new Category();
		
	diceArray = [die1, die2, die3, die4, die5];
	categoryArray = [ones,twos,threes,fours,fives,sixes,threeKind,fourKind,fullHouse,smallStraight,largeStraight,yahtzee,chance,yahtzeeBonus, bonus];
	rollCounter = 0;	
	console.log("rollcounter", rollCounter);
	justScored = false;
}