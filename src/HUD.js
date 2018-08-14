HUD =  {

	// create the cell sprite on the webgl renderer
	createUI: function() {
		
		// create heads up display elements
		this.createFace();
		this.createMinesCountText();
		this.createCellsCountText();
		this.createFooterText();
		
		this.createRestartBtn();
		this.createExportLevelBtn();
		this.createBotBtn();
	},
	
	createFace: function() {
		this.face = PIXI.Sprite.fromImage("assets/face.png")
		this.face.anchor.set(.5, 1);
		this.face.position.x = getGridWidth()/2;
		this.face.position.y = -GameController.cellSize * .2;
		this.face.width = GameController.cellSize;
		this.face.height = GameController.cellSize;
		this.face.model = this;

		gridContainer.addChild(this.face);
	},
	
	createRestartBtn: function() {
		this.newGameBtn = PIXI.Sprite.fromImage("assets/newGameBtn.png")
		this.newGameBtn.anchor.set(0, 0);
		this.newGameBtn.width = 80 * (GameController.cellSize / 24);
		this.newGameBtn.height = 40 * (GameController.cellSize / 24);
		
		if (this.isTallScreen()) {
			this.newGameBtn.width = 50 * (GameController.cellSize / 24);
			this.newGameBtn.height = 25 * (GameController.cellSize / 24);
			this.newGameBtn.position.x = 0;
			this.newGameBtn.position.y = getGridHeight() + 24;
		} else {
			this.newGameBtn.position.x = getGridWidth() + 24;
			this.newGameBtn.position.y = 0;
		}
		
		this.newGameBtn.interactive = true;
		this.newGameBtn.model = this;
		
		// Pointers normalize touch and mouse
		this.newGameBtn.on('pointerdown', this.onRestart)
					   .on('pointerover', this.onRestartOver)
					   .on('pointerout', this.onRestartOut)
					   .on('pointerup', this.onRestartUp);
					   
		//Cell.getContainer().addChild(this.newGameBtn);
		gridContainer.addChild(this.newGameBtn);
	},
	
	createExportLevelBtn: function() {
		this.exportBtn = PIXI.Sprite.fromImage("assets/exportBtn.png")
		this.exportBtn.anchor.set(0, .5);
		this.exportBtn.width = 80 * (GameController.cellSize / 24);
		this.exportBtn.height = 40 * (GameController.cellSize / 24);
		
		if (this.isTallScreen()) {
			this.exportBtn.width = 50 * (GameController.cellSize / 24);
			this.exportBtn.height = 25 * (GameController.cellSize / 24);
			this.exportBtn.anchor.set(.5, 0);
			this.exportBtn.position.x = getGridWidth() / 2;
			this.exportBtn.position.y = getGridHeight() + 24;
		} else {
			this.exportBtn.position.x = getGridWidth() + 24;
			this.exportBtn.position.y = getGridHeight() / 2;
		}
		
		
		this.exportBtn.interactive = true;

		this.exportBtn.model = this;
		this.exportBtn.on('pointerdown', this.onExport)
					  .on('pointerover', this.onExportOver)
					  .on('pointerout', this.onExportOut)
					  .on('pointerup', this.onExportUp);
		gridContainer.addChild(this.exportBtn);
	},
	
	createBotBtn: function() {
		this.botBtn = PIXI.Sprite.fromImage("assets/botBtn.png")
		this.botBtn.anchor.set(0, 1);
		this.botBtn.width = 80 * (GameController.cellSize / 24);
		this.botBtn.height = 40 * (GameController.cellSize / 24);
		
		if (this.isTallScreen()) {
			this.botBtn.width = 50 * (GameController.cellSize / 24);
			this.botBtn.height = 25 * (GameController.cellSize / 24);
			this.botBtn.anchor.set(1, 0);
			this.botBtn.position.x = getGridWidth();
			this.botBtn.position.y = getGridHeight() + 24;
		} else {
			this.botBtn.position.x = getGridWidth() + 24;
			this.botBtn.position.y = getGridHeight();
		}
		
		this.botBtn.interactive = true;

		this.botBtn.model = this;
		this.botBtn.on('pointerdown', this.onBot)
					  .on('pointerover', this.onBotOver)
					  .on('pointerout', this.onBotOut)
					  .on('pointerup', this.onBotUp)
		gridContainer.addChild(this.botBtn);
	},
	
	createFooterText: function() {
		let FooterText = new PIXI.Text('',{fontFamily : GameController.globalFont, fontSize: GameController.cellSize * 2, fill : GameController.win_color, align : 'center'});
		FooterText.anchor.set(.5, 0);
		FooterText.position.set(gridContainer.width/2, gridContainer.height - this.face.height);
		
		FooterText.visible = false;
		
		if (this.isTallScreen()) {
			FooterText.position.set(gridContainer.width/2, getGridHeight() + GameController.cellSize*2);
		}
		
		gridContainer.addChild(FooterText);
		this.footerText = FooterText;
	},
	
	createCellsCountText: function() {
		let cellsCountText = new PIXI.Text('Cells: ' + GameController.cellsTotalCount.x + 'x' + GameController.cellsTotalCount.y ,
		{fontFamily : GameController.globalFont, fontSize: GameController.cellSize * .7, fill : GameController.minesCount_color, align : 'center'});
		
		cellsCountText.anchor.set(1, 0);
		cellsCountText.position.set(gridContainer.width, GameController.cellSize * -1);
		cellsCountText.visible = true;
			
		gridContainer.addChild(cellsCountText);
		this.cellsCountText = cellsCountText;
		
	},
	
	createMinesCountText: function() {
		let minesCountText = new PIXI.Text('Mines: ' + GameController.mines ,{fontFamily : GameController.globalFont, fontSize: GameController.cellSize * .7, fill : GameController.minesCount_color, align : 'center'});
		minesCountText.anchor.set(0, 0);
		minesCountText.position.set(0, GameController.cellSize * -1);
		minesCountText.visible = true;
			
		gridContainer.addChild(minesCountText);
		this.minesCountText = minesCountText;
		
	},
	
	activateHappyFace: function() {
		this.face.texture = PIXI.loader.resources["assets/coolFace.png"].texture;
	},
	
	activateSadFace: function() {
		this.face.texture = PIXI.loader.resources["assets/lostFace.png"].texture;
	},
	
	activateNormalFace: function() {
		this.face.texture = PIXI.loader.resources["assets/face.png"].texture;
	},
	
	activateBotFace: function() {
		this.face.texture = PIXI.loader.resources["assets/botFace.png"].texture;
	},

	onRestart: function() {
		this.texture = PIXI.loader.resources["assets/newGameBtnHover.png"].texture;
		GameController.restart();
	},
	
	onRestartOver: function() {
		this.texture = PIXI.loader.resources["assets/newGameBtnHover.png"].texture;
	},
	
	onRestartOut: function() {
		this.texture = PIXI.loader.resources["assets/newGameBtn.png"].texture;
	},
	
	onRestartUp: function() {
		if (!PIXI.utils.isMobile.any)
			this.texture = PIXI.loader.resources["assets/newGameBtnHover.png"].texture;
		else
			this.texture = PIXI.loader.resources["assets/newGameBtn.png"].texture;
	},
	
	onExport: function() {
		this.texture = PIXI.loader.resources["assets/exportBtnClick.png"].texture;
		this.model.exportLevel();
	},
	
	onExportOver: function() {
		this.texture = PIXI.loader.resources["assets/exportBtnHover.png"].texture;
	},
	
	onExportOut: function() {
		this.texture = PIXI.loader.resources["assets/exportBtn.png"].texture;
	},
	
	onExportUp: function() {
		if (!PIXI.utils.isMobile.any)
			this.texture = PIXI.loader.resources["assets/exportBtnHover.png"].texture;
		else
			this.texture = PIXI.loader.resources["assets/exportBtn.png"].texture;
	},
	
	onBot: function() {
		this.texture = PIXI.loader.resources["assets/botBtnClick.png"].texture;
		
		Bot.startBot();
	},
	
	onBotOver: function() {
		this.texture = PIXI.loader.resources["assets/botBtnHover.png"].texture;
	},
	
	onBotOut: function() {
		this.texture = PIXI.loader.resources["assets/botBtn.png"].texture;
	},
	
	onBotUp: function() {
		if (!PIXI.utils.isMobile.any)
			this.texture = PIXI.loader.resources["assets/botBtnHover.png"].texture;
		else
			this.texture = PIXI.loader.resources["assets/botBtn.png"].texture;
	},
	
	exportLevel: function() {
	
		let properties = {type: 'text/plain'}; // Specify the file's mime-type.
		let str = '';
		let cells = GameController.gridObj.cells;

		for (var i = 0; i < GameController.cellsTotalCount.y; i++) {
			for (var j = 0; j < GameController.cellsTotalCount.x; j++) {
				let cell = cells[j][i];
				
				if (cell.isMine)
					str += 'm';
				else
					str += cell.danger;
				
				if (j < GameController.cellsTotalCount.x-1)
					str += ',';
			}
			
			if (i <= GameController.cellsTotalCount.y-2)
				str += '\n';
		}
		
		download(str, 'MinesSweeper level.txt', properties);
	},
	
	isTallScreen: function() {
		var lenBig, lenSmall;
		
		if (MainCanvas.height < MainCanvas.width) {
			lenSmall = MainCanvas.height;
			lenBig = MainCanvas.width;
		} else {
			lenSmall = MainCanvas.width;
			lenBig = MainCanvas.height;
		}
		
		if (lenBig / lenSmall > 1.5)
			return true;
		else 
			return false;
	},
	
	automaticCellSize: function() {
		
		let biggerLen = (GameController.cellsTotalCount.x > GameController.cellsTotalCount.y) ? GameController.cellsTotalCount.x : GameController.cellsTotalCount.y;
		var k = MainCanvas.height < MainCanvas.width ? MainCanvas.height : MainCanvas.width;
			
		if (this.isTallScreen())
			GameController.cellSize = (k * .08) * lerp( 1.35, .32, biggerLen/40);
		else 
			GameController.cellSize = (k * .05) * lerp( 1.35, .32, biggerLen/40);
	}
}

function getGridWidth() {
	return GameController.gridObj.width * GameController.cellSize;
}

function getGridHeight() {
	return GameController.gridObj.height * GameController.cellSize;
}

// Get the linear interpolation between two value
function lerp(value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
}