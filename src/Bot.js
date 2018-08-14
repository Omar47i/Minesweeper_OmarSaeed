var autoPlayObj;
var autoPlay = false;

Bot = {
	startBot: function() {
		
		// make bot button a trigger so that you could switch auto play and manual play anytime 
		if (autoPlay == false)
		{
			HUD.activateBotFace();
			autoPlay = true;
			
			GameController.gridObj.disableAllCells(true);
			
			Bot.timedExecution();
		}
		else
		{
			HUD.activateNormalFace();
			
			clearTimeout(autoPlayObj);
			
			GameController.gridObj.enableAllAvailableCells();
			
			autoPlay = false;
		}
	},

	// this function open safe cells by the bot every t seconds
	timedExecution: function() {
		let hasNextMove = GameController.gridObj.autoClickNext();

		if (hasNextMove == true)
			autoPlayObj = setTimeout(Bot.timedExecution, GameController.botActionSpeed * 1000);
	}
};

