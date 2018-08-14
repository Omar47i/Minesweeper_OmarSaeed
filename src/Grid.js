// This class handles the 2d grid instantiation and handling cells
class Grid
{
	constructor(height, width){
		this.height = height;
		this.width = width;
		this.cells = [];
		this.initGridImages();
		
		if (!GameController.smartMinePlacement) {
			this.initGridDelayed(null);
		}
	}
	
	reset() {
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var c = this.cells[i][j];
				c.reset();
			}
		}
		
	}
	
	// this function intializes grid sprites and prepare a 2d list of Cell objects to be referenced
	// later
	initGridImages() {
		
		// add the grid container only the first time game is opened
		if (firstTimeGameOpened) MainCanvas.stage.addChild(gridContainer);
		
		for (var i = 0; i < this.height; i++) {
			 
			 let row = [];
			 this.cells.push(row);
		 
			 for (var j = 0; j < this.width; j++) {
				row.push(new Cell({
					x: GameController.cellSize * i + GameController.cellSize/2,  y: GameController.cellSize * j + GameController.cellSize/2 },
					false, i, j));
			}
		}
		
		// Center on the screen
		gridContainer.x = (MainCanvas.width - gridContainer.width) / 2;
		gridContainer.y = (MainCanvas.height - gridContainer.height) / 2;
	}
	
	initGridDelayed(clickedCell) {
		
		if (clickedCell != null)
			this.calculateMinesLocations(clickedCell);  // set random unique locations for the mines
		else
			this.calculateMinesLocationsDumb();
		
		for (var i = 0; i < this.height; i++) {	 
			 for (var j = 0; j < this.width; j++) {
				 var c = this.cells[i][j];
				 c.setIsMine(this.setMine( {x: i, y: j}), i, j);
			}
		}
		
		// calculate the number idicating mines occurance around that cell
		this.calculateDanger();
	}
	
	calculateDanger() {
		
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var danger = 0;
				var c = this.cells[i][j];
				var self = this;
				var dangerArray = this.revealSafeCells(c, function (a) {
					// returns 1 or zero based on wether there is a mine or not in that cell
					// the returned value is pushed to the result list to calculate the total number of danger cells around the cell
					return self.getDangerForCellInt(a)
				});
				for (var k in dangerArray) {
					danger += dangerArray[k];
				}
				c.danger = danger;
				console.log("danger for " + i + ',' + j + ': ' + c.danger);
			}
		}
	}
	
	revealSafeCells (cell, callback) {
		var index = cell.index;
		var result = [];
		var k = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, -1], [0, -1], [1, 0]];
		for (var i in k) {
			var x = index.x + k[i][0];
			var y = index.y + k[i][1];
			if (x >= 0 && x < this.height && y >= 0 && y < this.width) {
				result.push(callback(this.cells[x][y]));
			}

		}
		return result;
	}
	
	revealAllMines (callback, filter) {

		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var c = this.cells[i][j];
				if (filter) {
					if (filter(c)) {
						callback(c);
					}
				} else {
					callback(c);
				}
			}
		}

	}
	
	disableAllCells(disable) {
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var c = this.cells[i][j];
				
				if (disable)
					c.disable();
				else
					c.enable();
			}
		}
	}

	// when switching between bot playing and user playing, we need to enable again the open cells to allow users to click on the cells
	enableAllAvailableCells() {
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var c = this.cells[i][j];
				
				if (c.visited == false)
					c.enable();
			}
		}
	}
	

	getDangerForCellInt (cell) {
		var d = cell.isMine;
		return d ? 1 : 0;
	}
	
	// this function place mines in random position regardless of the first click position (might hit a mine or a danger indicator cell at first)
	calculateMinesLocationsDumb() {

		this.bombLocations = [];
		let totalSize = this.height * this.width, ran = 0, j = 0;
	
		for (var i = 0; i < GameController.mines; i++) {
		    ran = getRandomInt(totalSize);

		    j = 0;
			while (j < this.bombLocations.length) {
				
				if (ran == this.bombLocations[j]){
						
					ran = getRandomInt(totalSize);
					j = 0;
				}
				else {
					j++;
				}
			}
			
			this.bombLocations.push(ran);
		}
	}
	
	calculateMinesLocations(firstClickCell) {

		this.bombLocations = [];
		let totalSize = this.height * this.width, ran = 0, j = 0;
		let clickedCell_1DIndex = firstClickCell.index.x + (this.height * firstClickCell.index.y);
	
		for (var i = 0; i < GameController.mines; i++) {
		    ran = getRandomInt(totalSize);
			
			// if it's first mine to place
			if (this.bombLocations.length == 0) {
				while (this.isValidLocation(firstClickCell, ran) == false || ran == clickedCell_1DIndex) {
					ran = getRandomInt(totalSize);
				}
				
				this.bombLocations.push(ran);
				continue;
			}
			
			// check for the following cases:
			// 1- new random mine position is on a danger indicator cell
			// 2- new random mine position is the same as the first time click
			// 3- new random mine position is the same as one of the prev mines created
		    j = 0;
			while (j < this.bombLocations.length) {
				
				if (!this.isValidLocation(firstClickCell, ran) ||
					ran == this.bombLocations[j] || ran == clickedCell_1DIndex ){
						
					ran = getRandomInt(totalSize);
					j = 0;
				}
				else {
					j++;
				}
			}
			
			this.bombLocations.push(ran);
		}
	}
	
	// when generating mines this function tests if the looked up location is valid to host a mine
	// with respect to user first click
	isValidLocation(firstClickCell, ran) {
		var bombPos = this.getXY(ran);
				
		var k = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, -1], [0, -1], [1, 0]];
		for (var i in k) {
			var x = bombPos.x + k[i][0];
			var y = bombPos.y + k[i][1];
			
			if (x == firstClickCell.index.x && y == firstClickCell.index.y) {
				return false;
			}
		}
		
		return true;
	}

	setMine(index) {
		let totalIndex = index.x + this.width * index.y;
		let isBomb = false;
		
		for (var i = 0; i < this.bombLocations.length; i++)
		{
			if (this.bombLocations[i] == totalIndex) {
				isBomb = true;
				break;
			}
		}
		
		return isBomb;
	}
	
	showUnexplodedMines() {
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var c = this.cells[i][j];
				
				if (c.isMine)
					c.showUnexplodedMine();
			}
		}
	}
	
	// used by the bot to open the next cell
	autoClickNext() {

		// don't discover next cell if we already won
		if (GameController.cellsCount == GameController.mines) {
			return false;
		}

		// search at a random cell and move forward
		for (var i = getRandomInt(this.height); i < this.height; i++) {
			
			for (var j = getRandomInt(this.width); j < this.width; j++) {
				
				var c = this.cells[i][j];
				
				if (c.isMine == false && c.visited == false)
				{
					c.botClick();
					return true;
				}
			}
		}
		
		// search again from the start to check skipped cells that we didn't consider in the prev loop
		for (var i = 0; i < this.height; i++) {
			
			for (var j = 0; j < this.width; j++) {
				
				var c = this.cells[i][j];
				
				if (c.isMine == false && c.visited == false)
				{
					c.botClick();
					return true;
				}
			}
		}
		
		return false;
	}
	
	removeCellsListeners() {
		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var c = this.cells[i][j];
				
				c.removeListeners();
			}
		}
	}
	
	getXY(i) {
		return { y: Math.floor(i / this.width), x: i % this.width };
	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

var gridContainer = new PIXI.Container();
	
