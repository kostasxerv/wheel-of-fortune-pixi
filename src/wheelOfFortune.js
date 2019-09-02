// Wheel Of Fortune scene
const Sprite = window.px.Sprite || PIXI.Sprite
const Container = window.px.Container || PIXI.Container

class WheelOfFortune extends Container {
  // constructor
  constructor () {
    super()
    this.load = PIXI.loader

    this.rotationTime = 5
    this.slicePrizes = [20, 500, 30, 300, 40, 200, 50, 100, 10, 1000]
    this.preload(this.create.bind(this))

    this.interactive = true
    this.buttonMode = true
  }

  get slices () {
    return this.slicePrizes.length
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
    }, {
      key: 'win-highlight',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/win-highlight.png'
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
    this.addChild(new Sprite.fromImage('background'))
    const wheelShade = this.addChild(new Sprite.fromImage('wheel-shade'))
    wheelShade.x = 1280 / 2
    wheelShade.y = 720 / 2 + 20
    wheelShade.anchor.set(0.5)
    // adding the wheel in the middle of the canvas
    this.wheel = this.addChild(new Sprite.fromImage('wheel'))
    this.wheel.x = 1280 / 2
    this.wheel.y = 720 / 2
    this.wheel.anchor.set(0.5)

    this.winHl = this.addChild(new Sprite.fromImage('win-highlight'))
    this.winHl.x = 551 + this.winHl.width / 2
    this.winHl.y = 80 + this.winHl.height + 30
    this.winHl.pivot.y = this.winHl.height + 30
    this.winHl.pivot.x = this.winHl.width / 2
    this.winHl.visible = false

    // adding the pin in the middle of the canvas
    this.pin = this.addChild(new Sprite.fromImage('pin'))
    this.pin.x = 1280 / 2
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
    this.prizeText.x = 1280 / 2
    this.prizeText.y = 690

    const centralFrame = this.addChild(new Sprite.fromImage('central-frame'))
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
    // hide hl image
    this.winHl.visible = false

    if (isNaN(deg)) deg = null

    // resetting text field
    this.prizeText.text = ''

    // the wheel will spin round from 2 to 4 times. This is just coreography
    // var rounds = Math.max(5, Math.floor(Math.random() * 8))
    var rounds = 4.5

    // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
    var degrees = deg || Math.floor(Math.random() * 360)
    degrees = degrees - 360 * Math.floor((degrees / 360))

    // fix consflict result between 2 slices
    if (Number.isInteger(degrees / (360 / this.slices))) {
      degrees++ // increase deg to go to next slice
    }

    // convert degrees to rads cause pixi rotation works with rads
    // add percent of cycle in rads to display correct result (this depends on the position of the marker)
    const rads = ((360 * rounds + degrees) * Math.PI / 180) + Math.PI + 0.314
    // before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
    var prize = this.slices - 1 - Math.floor(degrees / (360 / this.slices))

    // reset the rads rotation of the wheel
    this.wheel.rotation = 0
    let edge = 1
    const _this = this
    // use tweenmax to spin
    const spin = TweenMax.to(this.wheel, this.rotationTime, {
      paused: true,
      rotation: rads,
      ease: Power1.easeOut,
      onUpdate: function () {
        if ((parseInt((this.target.rotation + 0.314) * 180 / Math.PI) >= (360 / _this.slices) * edge)) {
          tl.restart()
          edge++
        }
      },
      onComplete: () => {
        // displaying prize text
        this.prizeText.text = this.slicePrizes[prize]
        // show the hl
        this.showWin()
        // player can spin again
        this.canSpin = true
      }
    })
    // this emulates the pin bouncing left-right
    var tl = new TimelineMax({ paused: true, ease: Power4.easeOut, onComplete: () => TweenMax.to(this.pin, 0.05, { rotation: 0 }) })
      .to(this.pin, 0.05, { rotation: -0.15 })
      .to(this.pin, 0.05, { rotation: 0.15 })

    // spin backwards on start
    TweenMax.to(this.wheel, 0.5, {
      rotation: -2,
      ease: Power1.easeOut,
      onComplete: () => {
        spin.play() // trigger the main spin
      }
    })
  }

  showWin () {
    const calcHlPosition = () => {
      const rad = this.wheel.rotation
      const deg = rad * 180 / Math.PI

      const a = deg - parseInt(deg / 360) * 360
      const b = a - parseInt(a / 18) * 18

      let r = b * Math.PI / 180
      // in case of odd number we have to subtract 18 degs from rads
      if ((parseInt(a / 18) % 2)) {
        r -= 0.32
      }
      this.winHl.rotation = r
    }

    calcHlPosition()
    setTimeout(() => (this.winHl.visible = true), 100)
  }
}

window.WheelOfFortune = WheelOfFortune
