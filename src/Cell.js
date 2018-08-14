// This class handles a single cell functionality in the 2d Grid
class Cell
{
	constructor(position, isMine, x, y) {
		
		this.danger = 0;
		this.index = { x, y };
		this.position = position;
		this.isMine = isMine;
		this.marked = false;   // mrked as a threat that might contain a bomb
		this.visited = false;
		this.createCellSprite(position);
	}
	
	reset() {

		if (this.dangerTxt)
			gridContainer.removeChild(this.dangerTxt);
		this.visited = false;
		this.marked = false;
		this.isMine = false;
		this.danger = 0;
		this.view.texture = PIXI.Texture.fromImage("assets/Cell.png");
		this.enable();
	}

	setIsMine(isMine) {
		this.isMine = isMine;
	}
	
	createCellSprite(position) {
		this.view = PIXI.Sprite.fromImage("assets/Cell.png")
		this.view.anchor.set(0.5);
		this.view.position.x = position.x;
		this.view.position.y = position.y;
		this.view.width = GameController.cellSize /*- 10 */;
		this.view.height = GameController.cellSize /* - 10*/;
		this.view.interactive = true;
		this.view.model = this;
		
		// Pointers normalize touch and mouse
		this.bindInputListeners();
	
		gridContainer.addChild(this.view);
	}
	
	bindInputListeners() {
		this.view.on('rightdown', this.rightClick)
				 .on('mousedown', this.click)
				 //.on('tap', this.click)
				 .on('touchstart', this.touchStart)
				 .on('touchend', this.touchEnd)
			     .on('mouseup', this.mouseUp)
				 .on('mouseupoutside', this.mouseUp)
				 .on('mouseover', this.mouseOver)
				 .on('mouseout', this.mouseOut);
	}
	
	rightClick() {
		GameController.flagSfx.play();
		if (this.model.marked == false) {
			this.texture = PIXI.loader.resources["assets/FlaggedCell.png"].texture;
			this.model.marked = true;
		} else {
			this.texture = PIXI.loader.resources["assets/Cell.png"].texture;
			this.model.marked = false;
		}
	}
	
	click() {
		
		if (this.model.marked)
			return;
	
		// initialize grid with data after the first click to avoid hitting a mine or a danger cell at start
		if (firstClick && GameController.smartMinePlacement) {
			
			GameController.gridObj.initGridDelayed(this.model);
			firstClick = false;
		}

		if (autoPlay == false)
			this.texture = PIXI.loader.resources["assets/CellDown.png"].texture;

		if (this.model.isMine) {
			this.model.lose();
		} else {
			GameController.clickSfx.play();
			this.model.revealAdjacentCells();
		}			
	}

	// special function that handles clicking by a bot
	botClick() {
		GameController.clickSfx.play();
		if (firstClick && GameController.smartMinePlacement) {
			
			GameController.gridObj.initGridDelayed(this);
			firstClick = false;
		}

		this.revealAdjacentCells();
	}
	
	touchStart() {
		this.t0 = performance.now();
	}
	
	touchEnd() {
		this.t1 = performance.now();
		
		// consider it a long tap, mark the cell
		if (this.t1 - this.t0 >= 600) {
			// right click
			GameController.flagSfx.play();
			if (this.model.marked == false) {
				this.texture = PIXI.loader.resources["assets/FlaggedCell.png"].texture;
				this.model.marked = true;
			} else {
				this.texture = PIXI.loader.resources["assets/Cell.png"].texture;
				this.model.marked = false;
			}
			
		} else {
			// left click
			if (this.model.marked)
			return;
	
			// initialize grid with data after the first click to avoid hitting a mine or a danger cell at start
			if (firstClick && GameController.smartMinePlacement) {
				
				GameController.gridObj.initGridDelayed(this.model);
				firstClick = false;
			}

			if (autoPlay == false)
				this.texture = PIXI.loader.resources["assets/CellDown.png"].texture;

			if (this.model.isMine) {
				this.model.lose();
			} else {
				GameController.clickSfx.play();
				this.model.revealAdjacentCells();
			}
		}
	}
	
	disable() {
		this.view.interactive = false;
	}
	
	enable() {
		this.view.interactive = true;
	}
	
	mouseOver() {
		if (!this.visited && !this.model.marked) {
			this.texture = PIXI.loader.resources["assets/CellOver.png"].texture;
		}
	}
	
	mouseUp() {
		
		if (!this.visited && !this.model.marked && !firstClick) {
			this.texture = PIXI.loader.resources["assets/CellOver.png"].texture;
		}
	}

	
	mouseOut() {
		if (!this.visited && !this.model.marked) {
			this.texture = PIXI.loader.resources["assets/Cell.png"].texture;
		}
	}
	
	// recursively go over all adjacent cells to mark as empty or dangerous 
	// (by displaying a text over it stating number of possible adjacent mines)
	revealAdjacentCells() {
		if ((!this.visited && !this.marked) || (!this.visited && this.marked && autoPlay)) {
			this.revealCell();
			if (this.danger == 0) {
				GameController.gridObj.revealSafeCells(this, function (c) {
					c.revealAdjacentCells();
				});
			}
		}
		
		console.log('total cells now are: ' + GameController.currentCellsCount);
	}
	
	// set cell image (bomb, empty), if adjacent mine spotted, set indicator text on the cell
	revealCell() {
		GameController.currentCellsCount--;
		if (GameController.currentCellsCount == GameController.mines) {
			GameController.winGame();
		}
		this.visited = true;
		this.view.interactive = false;
		var img = '';
		if (this.isMine) {
			img = "assets/RevealedMineCell.png";
		} else {
			img = "assets/EmptyCell.png";
			if (this.danger > 0) {
				this.dangerTxt = new PIXI.Text(this.danger  +'',{fontFamily : 'Arial', fontSize: GameController.cellSize*.8, fill : this.getDangerColor(), align : 'center'});
				this.dangerTxt.anchor.set(0.5);
				this.dangerTxt.position.set(this.position.x, this.position.y);
				gridContainer.addChild(this.dangerTxt);
			}
		}
		this.view.texture = PIXI.loader.resources[img].texture;
	}
	
	showUnexplodedMine() {
		this.view.texture = PIXI.loader.resources["assets/UnExplodedMineCell.png"].texture;
	}
	
	getDangerColor() {
		if (this.danger == 1)
			return GameController.danger1_color;
		else if (this.danger == 2)
			return GameController.danger2_color;
		else if (this.danger == 3)
			return GameController.danger3_color;
		else
			return GameController.danger4_color;
	}
	
	lose() {
		this.view.interactive = false;
		this.view.texture = PIXI.loader.resources["assets/ExplodedMineCell.png"].texture;
		var thisCell = this;
		GameController.gridObj.revealAllMines(function (c) {
			c.revealMine();
		}, function (c) {
			return c != thisCell
		});
		GameController.gameOver();
	}

	revealMine() {
		this.visited = true;
		if (this.isMine && !this.marked) {
			this.view.texture = PIXI.loader.resources["assets/RevealedMineCell.png"].texture;
		}
		
		else if (!this.isMine && this.marked) {
			this.view.texture = PIXI.loader.resources["assets/FlaggedWrongCell.png"].texture;
		}
	}
}

var firstClick = true;