// the game itself
var game;

var gameOptions = {

    // slices (prizes) placed in the wheel
    slices: 9,

    // prize names, starting from 12 o'clock going clockwise
    slicePrizes: [10, 20 ,10, 15, 10, 15, 20, 10, 15],

    // wheel rotation duration, in milliseconds
    rotationTime: 3
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
    window.addEventListener('keydown', (e) => game.wof.spinWheel())
}


// Wheel Of Fortune scene
class WheelOfFortune extends PIXI.Container{

    // constructor
    constructor(container){
        super();
        this.load = PIXI.loader

        if(container){
          container.addChild(this)
        }
        this.preload(this.create.bind(this))

        this.interactive = true
        this.buttonMode = true
    }
    // method to load resources
    preload(callback){
        // loading assets
        if(!this.load.resources.wheel){
          this.load.add("wheel", "../assets/wheel.png");
        }
        if(!this.load.resources.pin){
          this.load.add("pin", "../assets/pin.png");
        }

        this.load.load()
        if(typeof callback === 'function'){
          this.load.onComplete.add(callback)
        }
    }

    // method to be executed once the scene has been created
    create(){
        // adding the wheel in the middle of the canvas
        this.wheel = this.addChild(new PIXI.Sprite.fromImage('wheel'))
        this.wheel.x = game.config.width / 2
        this.wheel.y = game.config.height / 2
        this.wheel.anchor.set(0.5)
        this.wheel.scale = {x: 0.8, y: 0.8}

        // adding the pin in the middle of the canvas
        this.pin = this.addChild(new PIXI.Sprite.fromImage('pin'))
        this.pin.x = game.config.width / 2
        this.pin.y = 535
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
        this.prizeText.y = 35

        // the game has just started = we can spin the wheel
        this.canSpin = true;

        // waiting for your input, then calling "spinWheel" function
        this.on("pointerdown", this.spinWheel, this);
    }

    // function to spin the wheel
    spinWheel(deg){

        // can we spin the wheel?
        if(this.canSpin){
            if(isNaN(deg)) deg = null
            // resetting text field
            this.prizeText.setText("");

            // the wheel will spin round from 2 to 4 times. This is just coreography
            var rounds = Math.max(2, Math.floor(Math.random() * 4))

            // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
            var degrees = deg || Math.floor(Math.random() * 360)

            // before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
            var prize = gameOptions.slices - 1 - Math.floor(degrees / (360 / gameOptions.slices));

            // now the wheel cannot spin because it's already spinning
            this.canSpin = false;

            // convert degrees to rads
            const rads = (360 * rounds + degrees) * Math.PI / 180

            // reset the rads rotation of the wheel
            this.wheel.rotation = 0 
            // use tweenmax to spin
            this.tween = TweenMax.to(this.wheel, gameOptions.rotationTime, {
              rotation: rads + 3.3, // add half cycle to display correct result (this depends on the position of the marker)
              ease: Power4.easeOut,
              onComplete: () => {
                  // displaying prize text
                  this.prizeText.setText(gameOptions.slicePrizes[prize]);

                  // player can spin again
                  this.canSpin = true;
              }
            })
            // this emulates the pin  bouncing left-right
            // var tl = new TimelineMax({ repeat: 9, ease: Power4.easeOut, onComplete: () => TweenMax.to(this.pin, 0.08, { rotation: 0 })})
            //   .to(this.pin, 0.07, { rotation: -0.1 })
            //   .to(this.pin, 0.07, { rotation: 0.1 })
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
