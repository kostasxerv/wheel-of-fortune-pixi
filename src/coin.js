const { AnimatedSprite } = window.px

var cameraZ = 0
var fov = 10
var baseSpeed = 1
var speed = 0
var warpSpeed = 0.5
var starStretch = 0
var starBaseSize = 1.5

export const coinFieldEffect = (coins) => {
  // Listen for animate update
  let d = null
  const o = {
    render: true
  }
  const animate = function (d1) {
    if (!o.render) return
    if (!d) {
      d = d1
      requestAnimationFrame(animate)
      return
    }
    const delta = (d1 - d) / 10
    d = d1
    speed += (warpSpeed - speed) / 20
    cameraZ += delta * 10 * (speed + baseSpeed)
    coins.forEach(c => c.animate())
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
  return o
}

export class Coin extends AnimatedSprite {
  constructor (props) {
    super(...props)
    this.anchor.set(0.5)
    this.pos = {}
    this.randomize(true)
  }

  randomize (initial) {
    this.pos.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000

    // Calculate positions with radial random coordinate so no component hits the camera.
    var deg = Math.random() * Math.PI * 2
    var distance = Math.random() * 50 + 1
    this.pos.x = Math.cos(deg) * distance
    this.pos.y = Math.sin(deg) * distance
  }

  animate () {
    this.show()
    // reset component position
    if (this.pos.z < cameraZ) this.randomize()

    // Map component 3d position to 2d with really simple projection
    var z = this.pos.z - cameraZ
    this.x = this.pos.x * (fov / z) * 1280 + 1280 / 2
    this.y = this.pos.y * (fov / z) * 1280 + 720 / 2

    // Calculate component scale & rotation.
    var dxCenter = this.x - 1280 / 2
    var dyCenter = this.y - 720 / 2
    var distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter + dyCenter)
    var distanceScale = Math.max(0, (2000 - z) / 2000)
    this.scale.x = distanceScale * starBaseSize
    // component is looking towards center so that y axis is towards center.
    // Scale the component depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
    this.scale.y = distanceScale * starBaseSize + distanceScale * speed * starStretch * distanceCenter / 1280
    this.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2
  }

  reset () {
    this.scale.x = 0
    this.scale.y = 0
    this.rotation = 0
    this.stop()
    this.x = 640
    this.y = 320
  }

  hide () {
    this.reset()
    this.randomize(true)
    super.hide()
  }
}
