// the game itself
var game;

var gameOptions = {

    // slices (prizes) placed in the wheel
    slices: 8,

    // prize names, starting from 12 o'clock going clockwise
    slicePrizes: ["A KEY!!!", "50 STARS", "500 STARS", "BAD LUCK!!!", "200 STARS", "100 STARS", "150 STARS", "BAD LUCK!!!"],

    // wheel rotation duration, in milliseconds
    rotationTime: 3000
}


// once the window loads...
window.onload = function() {

    // game configuration object
    var gameConfig = {
       // game width, in pixels
       width: 800,

       // game height, in pixels
       height: 600,

       // game background color
       backgroundColor: 0x880044,
    };

    // game constructor
    game = new PIXI.Application(gameConfig)
    document.body.appendChild(game.view)
    game.config = {
      width: gameConfig.width,
      height: gameConfig.height
    }
    // pure javascript to give focus to the page/frame and scale the game
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
    game.wof = new WheelOfFortune(game.stage)
}


// Wheel Of Fortune scene
class WheelOfFortune extends PIXI.Container{

    // constructor
    constructor(container){
        super();
        this.load = PIXI.loader
        this.preload(this.attach.bind(this)(container))
        this.interactive = true
        this.buttonMode = true
    }
    attach(container){
      container.addChild(this)
      this.create()
    }

    // method to be executed when the scene preloads
    preload(callback){
        // loading assets
        if(!this.load.resources.wheel){
          this.load.add("wheel", "wheel.png");
        }
        if(!this.load.resources.pin){
          this.load.add("pin", "pin.png");
        }

        this.load.load()
        if(typeof callback === 'function'){
          this.load.onComplete.add(callback)
        }
    }

    // method to be executed once the scene has been created
    create(){

        // adding the wheel in the middle of the canvas
        this.wheel = this.addChild(new PIXI.Sprite.fromImage('wheel.png'))
        this.wheel.x = game.config.width / 2
        this.wheel.y = game.config.height / 2
        this.wheel.anchor.set(0.5)

        // adding the pin in the middle of the canvas
        this.pin = this.addChild(new PIXI.Sprite.fromImage('pin.png'))
        this.pin.x = game.config.width / 2
        this.pin.y = game.config.height / 2
        this.pin.anchor.set(0.5)
        
        // adding the text field
        this.prizeText = this.addChild(new PIXI.Text("Spin the wheel", {
            fontFamily: "Arial",
            fontSize: 32,
            align: "center",
            fill: "white"
        }));
        this.prizeText.anchor.set(0.5)
        this.prizeText.x = game.config.width / 2
        this.prizeText.y = 20

        // the game has just started = we can spin the wheel
        this.canSpin = true;

        // waiting for your input, then calling "spinWheel" function
        this.on("pointerdown", this.spinWheel, this);
    }

    // function to spin the wheel
    spinWheel(){

        // can we spin the wheel?
        if(this.canSpin){

            // resetting text field
            this.prizeText.setText("");

            // the wheel will spin round from 2 to 4 times. This is just coreography
            var rounds = Math.max(2, Math.floor(Math.random() * 4))

            // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
            var degrees = Math.floor(Math.random() * 360);

            // before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
            var prize = gameOptions.slices - 1 - Math.floor(degrees / (360 / gameOptions.slices));

            // now the wheel cannot spin because it's already spinning
            this.canSpin = false;

            const rads = (360 * rounds + degrees) * Math.PI / 180

            this.wheel.rotation = 0
            this.tween = TweenMax.to(this.wheel, 3, {
              rotation: rads,
              ease: Power3.easeOut,
              onComplete: () => {
                  // displaying prize text
                  this.prizeText.setText(gameOptions.slicePrizes[prize]);

                  // player can spin again
                  this.canSpin = true;
              }
            })
        }
    }
}

// pure javascript to scale the game
function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
