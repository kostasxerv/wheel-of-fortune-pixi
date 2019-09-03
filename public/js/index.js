
// the game itself
var game

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
  game.wof = new WheelOfFortune()
  game.stage.addChild(game.wof)
  window.addEventListener('keydown', (e) => game.wof.spinWheel())
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
