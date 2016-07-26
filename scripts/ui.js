run = function(){
	$(document).ready(function(){
		var firstRoll = false,
			$rollButton = $("#rollButton"),
			$dice = $(".dice"),
			$category = $(".category"),
			$yahtzee = $("#12"),
			$instructions_container = $("#instructions_container"),
			$main_container = $("#main_container"),
			$this = $(this);
			$newGameButton = $("#new_game_button"),
			$extras_container = $("#extras_container"),
			$score = $(".score"),
			$window = $(window),
			$menu = $("#menu"),
			$score_selection = $("#score_selection"),
			currentHighScoresPage = 0,
			highScoresData = [],
			highScoresPerPage = 5,
			hsNavButtonPrev = $('.highScores-navigation-button:first-of-type'),
			hsNavButtonNext = $('.highScores-navigation-button:nth-of-type(2)'),
			maxNumberOfHighScoreTablePages = 0;
		
		//Rolling and animating dice roll
		$rollButton.click(function(){
			firstRoll=true;
			if(rollCounter!=3){
				$(".roll-counter-indicator:nth-child("+(rollCounter+1)+")").addClass("in-use");
				randomizeImages(function(){
					roll();
					changeImage();
				});
				console.log(diceArray);
				changeImage();
			}
			else{
				alert("Can't roll again, must score!");
			}
		});
		
		//Clicking a category in the table enters a score in the corresponding cell and changes
		//the background to opaque. 
		$category.on("click", function() {
			if(!firstRoll){
				alert("Must roll before scoring, please try again!");
				return;
			}
			var success = false;
			if(!justScored){
				var $this = $(this),
					categoryID = parseInt($this.attr("id"));

				success = scoreCategory(categoryID);

				if(success){
					$this.removeClass("active");
					$this.next(".score")
						.addClass("scored")
						.text(categoryArray[categoryID].getScore());
					setBonus();
					$("#bonus").next(".score").text(bonus.getScore());				
					$("#13").next(".score").text(yahtzeeBonus.getScore());
					$(".roll-counter-indicator").removeClass("in-use"); //Reset roll counter indicator

					if(categoryID>=0 && categoryID<=5){  //Update subtotal and make it visible if numbers category clicked
						$("#subtotal").next(".score")
							.addClass("scored")
							.text(getSubtotal());
					}
				}				
			}
			else{
				alert("You must roll again before scoring!");
			}		
		});
		
		$dice.on("click", function(){
			var $this = $(this),
			diceObject = ui_id_to_logic($this.attr("id"));
			if(rollCounter!=0){
				diceObject.toggleHeld();
				$this.toggleClass("held");
			}
			else{
				alert("Cannot hold dice before rolling!");
			}
		});

		//Reset everything and start new game
		$newGameButton.on("click", function(){
			newGame();
			$("#rollButton").removeClass("hidden");
			$(".roll-counter-indicator")
				.removeClass("hidden")
				.removeClass("in-use");
			$category.addClass("active");
			$menu.toggleClass("expanded");
			resetUI();
			firstRoll=false;
		});	
		
		
	/****************************************************************!!***************************************************************/

		$(".fa-bars").on("click", function(){
			$menu.toggleClass("expanded");
		});

		$("#instructions_button").on("click", function(){
			$menu.toggleClass("expanded");
		});

		// Bring up scoring selection menu that scrolls you to appropriate category scoreboard
		$("#score_button").on("click", function(){
			$score_selection.toggleClass("hidden");
		});

		$("#score_selection_numbers").on("click", function(e){
			e.stopPropagation();
			$("html, body").animate({
				scrollTop: $(".left").offset().top
			}, 500);
			$score_selection.toggleClass("hidden");
		});

		$("#score_selection_combos").on("click", function(e){
			e.stopPropagation();
			$("html, body").animate({
				scrollTop: $(".right").offset().top
			}, 500);
			$score_selection.toggleClass("hidden");
		});

		$('#highScores_button').on('click', function(){
			currentHighScoresPage = 0;
			$.get('/highScores', function(data){
				hsNavButtonPrev.addClass('hidden');
				hsNavButtonNext.removeClass('hidden');
				highScoresData = data;
				maxNumberOfHighScoreTablePages = Math.ceil(
					highScoresData.length/highScoresPerPage);
				paginateData(currentHighScoresPage, highScoresData);
			});
		});

		hsNavButtonNext.on('click', function(){
			hsNavButtonPrev.removeClass('hidden');
			currentHighScoresPage+=1;
			if(currentHighScoresPage == maxNumberOfHighScoreTablePages-1){
				hsNavButtonNext.addClass('hidden');
			}
			paginateData(currentHighScoresPage, highScoresData);
		});

		hsNavButtonPrev.on('click', function(){
			hsNavButtonNext.removeClass('hidden');
			currentHighScoresPage-=1;
			if(currentHighScoresPage==0){
				hsNavButtonPrev.addClass('hidden');
			}
			paginateData(currentHighScoresPage, highScoresData);
		});



		/** Changes the images on the dice to match the current values */
		changeImage = function(){
			for(var i=0; i<5; i++){
				$(".dice:nth-child("+ (i+1) +")")
					.children("img")
					.attr("src","images/d" + diceArray[i].getValue() + ".png");
			}
		}

		/** Changes the images on non-held dice randomly to make them appear animated */
		function randomizeImages(cb){
			var randomNumber = 0,
				randCounter = 0;

			var randImg = setInterval(function(){
				$dice.not(".held")
					.each(function(index, el){
						var randomNumber = Math.ceil(Math.random()*6);
						$(this)
							.children("img")
							.attr("src", "images/d"+randomNumber+".png");
					});
				randCounter++;
				if(randCounter===5){
					clearInterval(randImg);
					cb();
				}	
			}, 150);
		}

		/**
		 * Returns the die object corresponding to which one was clicked
		 * @param {String} string indicating the id of the clicked die
		 * @returns {Dice} the die which was clicked
		 */ 
		ui_id_to_logic = function(diceID){
			switch(diceID){
				case "i":
					return die1;
					break;
				case "ii":
					return die2;
					break;
				case "iii":
					return die3;
					break;
				case "iv":
					return die4;
					break;
				case "v":
					return die5;
					break;
			}
		}

		/**
		 * Edits the UI when a new game is started
		 * Resets dice to default value, removes all held animations, clears scoreboard
		 */
		function resetUI(){
			$dice.removeClass("held");
			changeImage();
			$score
				.text("")
				.removeClass("scored");
		}

		/**
		 * Retrieves the appropriate data based on the current page number
		 * @param {Number} Integer specifying the current page 
		 * @param {Array} Full data to be parsed
		 * @returns {Array} Array containing objects with the relevant data for the 
		 *  corresponding page
		 */
		function paginateData(pageNumber, data){
			var currNum = pageNumber*highScoresPerPage,
				newData = [];

			for(var x=currNum; x<currNum+highScoresPerPage; x++){
				if(data[x]){
					console.log(data[x]);
					newData.push(data[x]);
				}
			}

			displayHighScores(newData);
			return newData;
		}

		/**
		 * Displays the relevant data in the High Scores Table
		 * @param {Array} Array of objects containing data to be displayed
		 */
		 function displayHighScores(data){
		 	var dataString ='';
		 	console.log(data.length);
		 	for(var x=0; x<data.length; x++){
		 		dataString+= '<tr><td>' + data[x].name + '</td><td>' + data[x].score +
		 			'</td></tr>' 
		 	}
		 	console.log(dataString);
		 	$('#highScores_table').children('tbody').html(dataString);
		 }

	});
}();

/**
 * Gets input for player name and returns a string containing it
 * @returns {String} player name
 */
function getPlayerName(){
	console.log("Inside get player name----------------------------------");
	var playerName = prompt('Name: ');
	return playerName;
	// if(playerName!=null){
	// 	return playerName;
	// }
}


