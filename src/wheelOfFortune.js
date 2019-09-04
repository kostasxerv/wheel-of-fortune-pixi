// Wheel Of Fortune scene
import { Coin, coinFieldEffect } from './coin'
const { Sprite, Container, AnimatedSprite, BitmapText } = window.px
console.warn('WheelOfFortune loaded')
class WheelOfFortune extends Container {
  // constructor
  constructor () {
    super()
    this.loader = PIXI.loader

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
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/wheel.json'
    }, {
      key: 'background',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/background.jpg'
    }, {
      key: 'you-win',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/animation/you-win.json'
    }, {
      key: 'panel-animation',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/animation/panel-animation.json'
    }, {
      key: 'coin-flip',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/animation/coin-flip.json'
    }, {
      key: 'wof-font',
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/wof-font.xml'
    }]

    resources.forEach(r => {
      if (!this.loader.resources[r.key]) {
        this.loader.add(r.key, r.source)
      }
    })

    this.loader.load()
    if (typeof callback === 'function') {
      this.loader.onComplete.add(callback)
    }
  }

  // method to be executed once the scene has been created
  create () {
    this.addChild(Sprite.fromImage('background'))
    const wheelShade = this.addChild(new Sprite('wheel-shade.png', 640, 380, 2))
    wheelShade.anchor.set(0.5)
    // adding the wheel in the middle of the canvas
    this.wheel = this.addChild(new Sprite('spin-wheel.png', 640, 360, 2))
    this.wheel.anchor.set(0.5)

    this.winHl = this.addChild(new Sprite('win-highlight.png', 0, 0, 3)).hide()
    this.winHl.x = 551 + this.winHl.width / 2
    this.winHl.y = 80 + this.winHl.height + 30
    this.winHl.pivot.y = this.winHl.height + 30
    this.winHl.pivot.x = this.winHl.width / 2

    // adding the pin in the middle of the canvas
    this.pin = this.addChild(new Sprite('pointer.png', 640, 35, 4))
    this.pin.anchor.set(0.5, 0)

    const centralFrame = this.addChild(new Sprite('central-frame.png', 0, 0, 4))
    centralFrame.x = 1280 / 2 - centralFrame.width / 2
    centralFrame.y = 720 / 2 - centralFrame.height / 2

    // the game has just started = we can spin the wheel
    this.canSpin = true

    // waiting for your input, then calling "spinWheel" function
    this.on('pointerdown', this.spinWheel, this)

    // win animation

    this.winAnimation = this.addChild(new AnimatedSprite(this.loader.resources['you-win'].spritesheet.animations['win-frame'], 640, 250, 5)).hide()
    this.winAnimation.anchor.set(0.5)
    this.winAnimation.animationSpeed = 0.3

    this.panelAnimation = this.addChild(new AnimatedSprite(this.loader.resources['panel-animation'].spritesheet.animations['panel-frame'], 640, 460, 5, true)).hide()
    this.panelAnimation.anchor.set(0.5)
    this.panelAnimation.animationSpeed = 0.4
    this.winText = this.addChild(new BitmapText('', { font: '120px wof-font' }, 640, 445, 5)).hide()

    this.coins = []
    for (var i = 0; i < 50; i++) {
      this.coins.push(this.addChild(new Coin([PIXI.loader.resources['coin-flip'].spritesheet.animations.coin, 640, 360, 1, true])))
    }

    this.cache()
  }

  clear () {
    this.winHl.hide()
    this.winAnimation.hide()
    this.winText.setText('').hide()
    this.panelAnimation.hide()
    this.coins.forEach(c => c.hide())
    if (this.coinsEffect) {
      this.coinsEffect.render = false
    }
  }

  // function to spin the wheel
  spinWheel (deg) {
    // can we spin the wheel?
    if (!this.canSpin) return

    // now the wheel cannot spin because it's already spinning
    this.canSpin = false

    this.clear()

    if (isNaN(deg)) deg = null

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
    var prizeIdx = this.slices - 1 - Math.floor(degrees / (360 / this.slices))
    this.prize = this.slicePrizes[prizeIdx]
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
          pinBounce.restart()
          edge++
        }
      },
      onComplete: () => {
        // show the hl
        this.showWin()
      }
    })
    // this emulates the pin bouncing left-right
    var pinBounce = new TimelineMax({ paused: true, ease: Power4.easeOut, onComplete: () => TweenMax.to(this.pin, 0.05, { rotation: 0 }) })
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
    this.winAnimation.zOrder = 5
    this.panelAnimation.zOrder = 5
    this.sortChildren()

    const main = () => {
      this.winText.setText(this.prize.toFixed(2))
      this.winText.show()
      this.winAnimation.fadeIn()
      this.winAnimation.play()
      this.panelAnimation.fadeIn()
      this.panelAnimation.play()
      this.coins.forEach(c => c.play())
      this.coins.forEach(c => c.fadeIn())
      this.coinsEffect = coinFieldEffect(this.coins)
      // player can spin again
      this.canSpin = true
    }

    setTimeout(this.winHl.show.bind(this.winHl), 100)
    setTimeout(this.winHl.hide.bind(this.winHl), 300)
    setTimeout(this.winHl.show.bind(this.winHl), 500)
    setTimeout(this.winHl.hide.bind(this.winHl), 700)
    setTimeout(this.winHl.show.bind(this.winHl), 900)

    setTimeout(main.bind(this), 1100)
  }

  // this method play animations on start to cache on gpu
  // and solve the lag problem on first play
  cache () {
    this.winAnimation.zOrder = 0.1
    this.panelAnimation.zOrder = 0.1
    this.sortChildren()
    this.winAnimation.play()
    this.panelAnimation.play()
  }
}

window.WheelOfFortune = WheelOfFortune
