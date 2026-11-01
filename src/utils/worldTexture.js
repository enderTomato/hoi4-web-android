// 把真实世界国界（world.json）投影成等距圆柱（equirectangular）纹理，贴在地面平面上。
// 用于 P2「真实世界地图」底图；陆地用暗橄榄绿、国界描边，贴合 HOI4 战略地图配色。
import worldData from '../data/world.json'

const SEA = '#0c120e'
const LAND = '#243a1e'
const BORDER = '#3f5e34'

function project(lon, lat, w, h) {
  return [((lon + 180) / 360) * w, ((90 - lat) / 180) * h]
}

export function makeWorldTexture(THREE, w = 2048, h = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = SEA
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = LAND
  ctx.strokeStyle = BORDER
  ctx.lineWidth = 1.1
  ctx.lineJoin = 'round'

  for (const poly of worldData.polys) {
    for (const ring of poly) {
      ctx.beginPath()
      for (let i = 0; i < ring.length; i++) {
        const [x, y] = project(ring[i][0], ring[i][1], w, h)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
