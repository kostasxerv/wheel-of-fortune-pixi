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
    // this.slicePrizes = [20, 500, 30, 300, 40, 200, 50, 100, 10, 1000]
    this.slicePrizes = [20, 500, 30, 300, 40, 200, 50, 100, '?', 10, 1000]

    this.lightsCoords = this.slices === 11 ? [
      { x: 0, y: -291 },
      { x: 158, y: -245 },
      { x: 266, y: -120 },
      { x: 289, y: 43 },
      { x: 221, y: 192 },
      { x: 82, y: 280 },
      { x: -82, y: 280 },
      { x: -221, y: 192 },
      { x: -289, y: 43 },
      { x: -266, y: -120 },
      { x: -158, y: -245 }
    ]
      : [
        { x: 0, y: -291 },
        { x: 173, y: -236 },
        { x: 276, y: -96 },
        { x: 276, y: 96 },
        { x: 173, y: 236 },
        { x: 0, y: 291 },
        { x: -173, y: 236 },
        { x: -276, y: 96 },
        { x: -276, y: -96 },
        { x: -173, y: -236 }

      ]
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
      source: 'http://10.0.0.83:3000/dev/wheel-of-fortune/wof.json'
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

    this.srcLight = this.addChild(new Sprite('source-light.png', 640, 360, 2)).hide()
    this.srcLight.anchor.set(0.5)
    // adding the wheel in the middle of the canvas
    this.wheel = this.addChild(new Sprite(`spin-wheel-${this.slices}.png`, 640, 360, 2))
    this.wheel.anchor.set(0.5)

    this.winHl = this.addChild(new Sprite(`win-highlight-${this.slices}.png`, 0, 0, 3)).hide()
    this.winHl.x = 1280 / 2 + 1
    this.winHl.y = 205
    this.winHl.anchor.set(0.5)

    // adding the pin in the middle of the canvas
    this.pin = this.addChild(new Sprite('pointer.png', 640, 35, 4))
    this.pin.anchor.set(0.5, 0)
    // this emulates the pin bouncing left-right
    this.pin.bounce = new TimelineMax({ paused: true, ease: Power4.easeOut, onComplete: () => TweenMax.to(this.pin, 0.05, { rotation: 0 }) })
      .to(this.pin, 0.05, { rotation: -0.15 })
      .to(this.pin, 0.05, { rotation: 0.15 })
    this.pin.bounceReverse = new TimelineMax({ paused: true, ease: Power4.easeOut, onComplete: () => TweenMax.to(this.pin, 0.05, { rotation: 0 }) })
      .to(this.pin, 0.05, { rotation: 0.15 })
      .to(this.pin, 0.05, { rotation: -0.15 })

    this.centralFrame = this.addChild(new Sprite('central-frame.png', 0, 0, 4))
    this.centralFrame.x = 1280 / 2 - this.centralFrame.width / 2
    this.centralFrame.y = 720 / 2 - this.centralFrame.height / 2

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

    this.lights = []
    this.lightsCoords.forEach(o => {
      const { x, y } = o
      const l = this.wheel.addChild(new Sprite('light.png', x, y, 4))
      l.hide()
      l.anchor.set(0.5)
      this.lights.push(l)
    })

    this.cache()

    this.startup()
  }

  startup () {
    let i = 0
    this.startUpHl = setInterval(() => {
      this.lights.forEach(l => l.hide())
      this.lights[i].show()
      i++
      if (i === this.lights.length) {
        i = 0
      }
    }, 100)
  }

  clear () {
    this.winHl.hide()
    this.srcLight.hide()
    this.winAnimation.hide()
    this.winText.setText('').hide()
    this.panelAnimation.hide()
    clearInterval(this.flashingLights)
    this.lights.forEach(l => l.hide())
    this.coins.forEach(c => c.hide())
    if (this.coinsEffect) {
      this.coinsEffect.render = false
    }
  }

  // function to spin the wheel
  spinWheel () {
    // can we spin the wheel?
    if (!this.canSpin) return
    clearInterval(this.startUpHl)
    this.lights.forEach(l => l.hide())
    // now the wheel cannot spin because it's already spinning
    this.canSpin = false

    // clear win animations
    this.clear()

    // set the times of spin
    var rounds = 4

    const prizeIdx = Math.floor(Math.random() * this.slicePrizes.length)
    this.prize = this.slicePrizes[prizeIdx]

    const degrees = rounds * 360 + (this.slices - prizeIdx) * (360 / this.slices)

    // convert degrees to rads cause pixi rotation works with rads
    const rads = degrees.toRad()
    const slideRads = (360 / (this.slices) * 2).toRad()
    // reset the rads rotation of the wheel
    this.wheel.rotation = 0
    // this is used to do physics with pointer bounce
    let edge = 0
    const _this = this
    // use tweenmax to spin
    const spin = TweenMax.to(this.wheel, this.rotationTime, {
      paused: true,
      rotation: rads,
      ease: Power1.easeOut,
      onUpdate: function () {
        if (parseInt((this.target.rotation + (slideRads / 2)).toDeg()) >= (360 / _this.slices) * edge) {
          _this.pin.bounce.restart()
          edge++
        }
      },
      onComplete: () => {
        // show the win
        this.showWin()
      }
    })

    // spin backwards on start
    TweenMax.to(this.wheel, 0.5, {
      rotation: -2,
      ease: Power1.easeOut,
      onUpdate: function () {
        if (parseInt((this.target.rotation + (slideRads / 2)).toDeg()) <= (360 / _this.slices) * edge) {
          _this.pin.bounceReverse.restart()
          edge--
        }
      },
      onComplete: () => {
        edge++ // increase edge cause already bounced in this slice
        spin.play() // trigger the main spin
      }
    })
  }

  showWin () {
    // bring animations to front
    this.winAnimation.zOrder = 5
    this.panelAnimation.zOrder = 5
    this.sortChildren()

    const main = () => {
      if (!isNaN(this.prize)) {
        this.winText.setText(this.prize.toFixed(2))
        this.winText.fadeIn()
        this.panelAnimation.fadeIn()
        this.panelAnimation.play()
      }

      this.winAnimation.fadeIn()
      this.winAnimation.play()

      this.srcLight.fadeIn({ duration: 0.5 })

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

    this.flashingLights = setInterval(() => {
      this.lights.forEach(l => (l.visible ? l.hide() : l.show()))
    }, 200)

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
