
// the game itself
var game

var gameOptions = {

  // slices (prizes) placed in the wheel
  get slices () {
    return this.slicePrizes.length
  },

  // prize names, starting from 12 o'clock going clockwise
  slicePrizes: [80, 100, 5000, 1000, 80, 1000, 200, 500, 80, 1000],

  // wheel rotation duration, in milliseconds
  rotationTime: 5
}

// once the window loads...
window.onload = function () {
  // game configuration object
  var gameConfig = {
    // game width, in pixels
    width: 1280,

    // game height, in pixels
    height: 720
  }

  // game constructor
  game = new PIXI.Application(gameConfig)
  document.body.appendChild(game.view)
  game.config = {
    width: gameConfig.width,
    height: gameConfig.height
  }
  // pure javascript to give focus to the page/frame and scale the game
  window.focus()
  resize()
  window.addEventListener('resize', resize, false)
  game.wof = new WheelOfFortune(game.stage)
  window.addEventListener('keydown', (e) => game.wof.spinWheel())
}

// Wheel Of Fortune scene
class WheelOfFortune extends PIXI.Container {
  // constructor
  constructor (container) {
    super()
    this.load = PIXI.loader

    if (container) {
      container.addChild(this)
    }
    this.preload(this.create.bind(this))

    this.interactive = true
    this.buttonMode = true
  }
  // method to load resources
  preload (callback) {
    // loading assets
    const resources = [{
      key: 'wheel',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/spin-wheel.png'
    }, {
      key: 'central-frame',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/central-frame.png'
    }, {
      key: 'pin',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/pointer.png'
    }, {
      key: 'background',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/background.jpg'
    }, {
      key: 'wheel-shade',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/wheel-shade.png'
    }]

    resources.forEach(r => {
      if (!this.load.resources[r.key]) {
        this.load.add(r.key, r.source)
      }
    })

    this.load.load()
    if (typeof callback === 'function') {
      this.load.onComplete.add(callback)
    }
  }

  // method to be executed once the scene has been created
  create () {
    this.addChild(new PIXI.Sprite.fromImage('background'))
    const wheelShade = this.addChild(new PIXI.Sprite.fromImage('wheel-shade'))
    wheelShade.x = game.config.width / 2
    wheelShade.y = game.config.height / 2 + 20
    wheelShade.anchor.set(0.5)
    // adding the wheel in the middle of the canvas
    this.wheel = this.addChild(new PIXI.Sprite.fromImage('wheel'))
    this.wheel.x = game.config.width / 2
    this.wheel.y = game.config.height / 2
    this.wheel.anchor.set(0.5)

    // adding the pin in the middle of the canvas
    this.pin = this.addChild(new PIXI.Sprite.fromImage('pin'))
    this.pin.x = game.config.width / 2
    this.pin.y = 35
    this.pin.anchor.set(0.5, 0)

    // adding the text field
    this.prizeText = this.addChild(new PIXI.Text('Spin the wheel', {
      fontFamily: 'Arial',
      fontSize: 32,
      align: 'center',
      fill: 'white'
    }))
    this.prizeText.anchor.set(0.5)
    this.prizeText.x = game.config.width / 2
    this.prizeText.y = 690

    const centralFrame = this.addChild(new PIXI.Sprite.fromImage('central-frame'))
    centralFrame.x = 1280 / 2 - centralFrame.width / 2
    centralFrame.y = 720 / 2 - centralFrame.height / 2

    // the game has just started = we can spin the wheel
    this.canSpin = true

    // waiting for your input, then calling "spinWheel" function
    this.on('pointerdown', this.spinWheel, this)
  }

  // function to spin the wheel
  spinWheel (deg) {
    // can we spin the wheel?
    if (!this.canSpin) return
    // now the wheel cannot spin because it's already spinning
    this.canSpin = false

    if (isNaN(deg)) deg = null

    // resetting text field
    this.prizeText.setText('')

    // the wheel will spin round from 2 to 4 times. This is just coreography
    // var rounds = Math.max(5, Math.floor(Math.random() * 8))
    var rounds = 4.5

    // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
    var degrees = deg || Math.floor(Math.random() * 360)
    degrees = degrees - 360 * Math.floor((degrees / 360))

    // fix consflict result between 2 slices
    if (Number.isInteger(degrees / (360 / gameOptions.slices))) {
      degrees++ // increase deg to go to next slice
    }

    // convert degrees to rads cause pixi rotation works with rads
    const rads = ((360 * rounds + degrees) * Math.PI / 180) + Math.PI + 0.314 // add percent of cycle in rads to display correct result (this depends on the position of the marker)

    // before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
    var prize = gameOptions.slices - 1 - Math.floor(degrees / (360 / gameOptions.slices))

    // reset the rads rotation of the wheel
    this.wheel.rotation = 0
    const pin = this.pin
    let edge = 1
    // use tweenmax to spin
    this.tween = TweenMax.to(this.wheel, gameOptions.rotationTime, {
      rotation: rads,
      ease: Power1.easeOut,
      onUpdate: function () {
        if ((parseInt((this.target.rotation + 0.314) * 180 / Math.PI) >= (360 / gameOptions.slices) * edge)) {
          tl.restart()
          edge++
        }
      },
      onComplete: () => {
        // displaying prize text
        this.prizeText.setText(gameOptions.slicePrizes[prize])

        // player can spin again
        this.canSpin = true
      }
    })
    // this emulates the pin bouncing left-right
    var tl = new TimelineMax({ paused: true, ease: Power4.easeOut, onComplete: () => TweenMax.to(this.pin, 0.05, { rotation: 0 }) })
      .to(this.pin, 0.05, { rotation: -0.1 })
      .to(this.pin, 0.05, { rotation: 0.1 })
  }
  rotate () {
    if (!this.canSpin) return

    this.prizeText.setText('')

    this.canSpin = false
    this.wheel.rotation = 0
    // use tweenmax to spin
    const _this = this
    this.tween = TweenMax.to(this.wheel, 100, {
      rotation: 30, // add percent of cycle in rads to display correct result (this depends on the position of the marker)
      ease: Linear.easeNone,
      onUpdate: function () {
        // const rads = this.target.rotation - 0.314
        // let degrees = (rads * 180 / Math.PI)
        // degrees = degrees - 360 * Math.floor((degrees / 360))

        // var prize = gameOptions.slices - 1 - Math.floor(degrees / (360 / gameOptions.slices))
        // _this.prizeText.setText(gameOptions.slicePrizes[prize])
        // console.log(gameOptions.slicePrizes[prize], rads, degrees, prize)
      },
      onComplete: () => {
        // displaying prize text
        // this.prizeText.setText(gameOptions.slicePrizes[prize]);

        // player can spin again
        this.canSpin = true
      }
    })
  }
}

// pure javascript to scale the game
function resize () {
  var canvas = document.querySelector('canvas')
  var windowWidth = window.innerWidth
  var windowHeight = window.innerHeight
  var windowRatio = windowWidth / windowHeight
  var gameRatio = game.config.width / game.config.height
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + 'px'
    canvas.style.height = (windowWidth / gameRatio) + 'px'
  } else {
    canvas.style.width = (windowHeight * gameRatio) + 'px'
    canvas.style.height = windowHeight + 'px'
  }
}
