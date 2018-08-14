
window.onload = onLoad;

function onLoad() {
	
	loadSprites();
	GameController.main();
	
}

GameController = {
    cellSize: 128,   // grid size in pixels
    mines: 10,
	cellsTotalCount: { x: 9, y: 9 },
	botActionSpeed: .5,                  // bot will select cells every this duration
	
	automaticCellSz: true,               // if set to true, GameController.cellSize property is ignored and a new values is calculated based on GameController.cellsTotalCount
	smartMinePlacement: true,            // if set to true, mines creation are delayed until user clicks on the first cell to avoid hitting a bomb or a danger locator text
	globalFont: 'Trebuchet MS',
	
	// all text colors can be set from here
    danger1_color: "#f49842",
	danger2_color: "#45e23d",
	danger3_color: "#ce3131",
    danger4_color: "#cc0000",
	minesCount_color: "#f2cd00",
	win_color: "#3bdd00",
	lost_color: "#e01002",
   
    main: function() {
		// .. Initialization code goes here
		MainCanvas.render();

		this.startGame();
    },
   
    startGame: function() {

		if (this.automaticCellSz)
			HUD.automaticCellSize();  // this function auto calculate the cell size based on the current window height
		
		this.gridObj = new Grid(this.cellsTotalCount.x, this.cellsTotalCount.y);
		
		HUD.createUI();
		
		this.currentCellsCount = this.gridObj.height * this.gridObj.width;
		
		this.clickSfx = new Howl({ src: ['sfx/cellClick.wav'], volume: 0.5, preload: true });
		this.winSfx = new Howl({ src: ['sfx/win.wav'], volume: 0.5 });
		this.gameOverSfx = new Howl({ src: ['sfx/gameOver.wav'], volume: 0.5, preload: true });
		this.flagSfx = new Howl({ src: ['sfx/flag.wav'], volume: 0.5, preload: true });
	},
	
	winGame: function() {
		this.winSfx.play();
		this.gridObj.showUnexplodedMines();
		this.gridObj.disableAllCells(true);
		
		HUD.footerText.text = 'You won';
		HUD.footerText.style.fill = this.win_color;
		HUD.footerText.visible = true;
		
		HUD.botBtn.interactive = false;
		HUD.activateHappyFace();
	},
	
	gameOver: function() {
		this.gameOverSfx.play();
		this.gridObj.disableAllCells(true);
		
		HUD.footerText.text = 'You lost';
		HUD.footerText.style.fill = this.lost_color;
		HUD.footerText.visible = true;
		
		HUD.botBtn.interactive = false;
		HUD.activateSadFace();
	},
	
	// Reset all game variables on restart
	restart: function () {

		clearTimeout(autoPlayObj);
		firstTimeGameOpened = false;
		firstClick = true;
		
		this.gridObj.reset();
		this.currentCellsCount = this.gridObj.height * this.gridObj.width;
		
		HUD.botBtn.interactive = true;
		HUD.footerText.visible = false;
		
		autoPlay = false;
		autoPlayObj = null;
		
		HUD.activateNormalFace();
		
		if (GameController.smartMinePlacement == false)
			this.gridObj.initGridDelayed(null);
	}
};

MainCanvas = {
    width: window.innerWidth,
	height: window.innerHeight,
	
	render: function() {
		// create a new container to hold gameObjects
		let stage = new PIXI.Container();
		MainCanvas.stage = stage;

		let renderer = PIXI.autoDetectRenderer(MainCanvas.width, MainCanvas.height, {
			backgroundColor: 0x3d0004
		});
		
		this.renderer = renderer;
		
		document.body.appendChild(renderer.view);
		requestAnimationFrame(animate);
		
		function animate() {
			requestAnimationFrame(animate);
			renderer.render(stage);
			}
		} 
};

// download level as matrix of empty cells (0), mines (m), and danger indicator cells (1,2,3)
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}


function loadSprites() {
	PIXI.loader
	.add("assets/UnExplodedMineCell.png")
	.add("assets/Cell.png")
	.add("assets/ExplodedMineCell.png")
	.add("assets/FlaggedWrongCell.png")
	.add("assets/RevealedMineCell.png")
	.add("assets/CellOver.png")
	.add("assets/CellDown.png")
	.add("assets/FlaggedCell.png")
	.add("assets/EmptyCell.png")
	.add("assets/coolFace.png")
	.add("assets/lostFace.png")
	.add("assets/face.png")
	.add("assets/botFace.png")
	.add("assets/botBtnHover.png")
	.add("assets/botBtn.png")
	.add("assets/botBtnClick.png")
	.add("assets/exportBtn.png")
	.add("assets/exportBtnClick.png")
	.add("assets/exportBtnHover.png")
	.add("assets/newGameBtnHover.png")
	.add("assets/newGameBtn.png")
	.load(setupCells);
}

function setupCells() {
	console.log('finished loading sprites');
}


// prevent context menu to appear on right click
document.addEventListener('contextmenu', (e) => { e.preventDefault(); });

var firstTimeGameOpened = true;