<script setup>
// P2 核心场景：真实世界地图底图 + 低多边形预制地形（视野裁剪 + 距离 LOD）+ 建筑白模。
// 横屏游玩；放大比例 ≥ 80% 显示 3D 地形与建筑白模。
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import * as THREE from 'three'
import BuildingModel from './BuildingModel.vue'
import SceneLogic from './SceneLogic.vue'
import LandscapeGuard from './LandscapeGuard.vue'
import { useZoom } from '../composables/useZoom'
import { makeWorldTexture } from '../utils/worldTexture'

const { z, showBuildings, setLevel, zoomBy } = useZoom()

const FLAT = [-Math.PI / 2, 0, 0]

// 相机：位置 = 目标点 + 随放大比例缩小的偏移；look-at 锁定目标点
const s = computed(() => 1 - 0.62 * z.level) // level0→1(远) level1→0.38(近)
const camPos = computed(() => [z.panX, 70 * s.value, z.panY + 90 * s.value])
const lookAt = computed(() => [z.panX, 0, z.panY])

// ---------- 真实世界地图纹理（真实国界） ----------
const worldTex = ref(null)
onMounted(() => {
  worldTex.value = makeWorldTexture(THREE, 2048, 1024)
})

// ---------- 低多边形预制地形瓦片 ----------
const MAP_W = 1200
const MAP_D = 600
const COLS = 16
const ROWS = 8
const tileW = MAP_W / COLS
const tileD = MAP_D / ROWS
const NEAR = 200 // 视距阈值：近处精细化 3D 地形，远景仅显示扁平地图
const RAD = Math.max(tileW, tileD) * 0.6

const tileGroup = new THREE.Group()
const centers = []
let seed = 1337
function rnd() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}
function makeTileGeo() {
  const g = new THREE.PlaneGeometry(tileW, tileD, 3, 3)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const h = (Math.sin(x * 0.15) + Math.cos(y * 0.15)) * 1.2 + (rnd() - 0.5) * 2.4
    pos.setZ(i, h) // 平面在 XY，旋转后 Z 成为高度
  }
  g.computeVertexNormals()
  return g
}
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const x = -MAP_W / 2 + tileW * (c + 0.5)
    const zz = -MAP_D / 2 + tileD * (r + 0.5)
    const mesh = new THREE.Mesh(
      makeTileGeo(),
      new THREE.MeshStandardMaterial({ color: '#2c4322', flatShading: true, roughness: 1 })
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(x, 0, zz)
    mesh.frustumCulled = true
    tileGroup.add(mesh)
    centers.push(new THREE.Vector3(x, 0, zz))
  }
}

// 建筑白模分布（24 个，随机落在瓦片上；≥80% 显示）
const buildings = []
const types = ['factory', 'silo', 'depot', 'airfield']
for (let i = 0; i < 24; i++) {
  const c = Math.floor(rnd() * COLS)
  const r = Math.floor(rnd() * ROWS)
  const x = -MAP_W / 2 + tileW * (c + 0.5)
  const zz = -MAP_D / 2 + tileD * (r + 0.5)
  buildings.push({ id: i, type: types[i % 4], position: [x, 0, zz] })
}

// ---------- 统一指针交互：单指/鼠标拖拽平移 + 双指捏合缩放 ----------
const wrap = ref(null)
const pointers = new Map()
let pinchDist = 0
let pinchStartLevel = 0

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v))
}
function onPointerDown(e) {
  wrap.value?.setPointerCapture?.(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 2) {
    const p = [...pointers.values()]
    pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)
    pinchStartLevel = z.level
  }
}
function onPointerMove(e) {
  if (!pointers.has(e.pointerId)) return
  const prev = pointers.get(e.pointerId)
  const cur = { x: e.clientX, y: e.clientY }
  pointers.set(e.pointerId, cur)
  if (pointers.size >= 2) {
    const p = [...pointers.values()]
    const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)
    if (pinchDist > 0) setLevel(pinchStartLevel + (d / pinchDist - 1) * 0.7)
    pinchDist = d
  } else {
    const dx = cur.x - prev.x
    const dy = cur.y - prev.y
    const k = 0.6 - 0.4 * z.level
    z.panX = clamp(z.panX - dx * k, -900, 900)
    z.panY = clamp(z.panY + dy * k, -450, 450)
  }
}
function onPointerUp(e) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinchDist = 0
}
function onWheel(e) {
  e.preventDefault()
  zoomBy(-e.deltaY * 0.0009)
}
onMounted(() => {
  wrap.value?.addEventListener('wheel', onWheel, { passive: false })
})
onUnmounted(() => {
  wrap.value?.removeEventListener('wheel', onWheel)
  pointers.clear()
})
</script>

<template>
  <div
    ref="wrap"
    class="touch-none absolute inset-0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <TresCanvas :dpr="[1, 1.5]" clear-color="#0a0d09">
      <!-- 活动相机 -->
      <TresPerspectiveCamera :position="camPos" :look-at="lookAt" :fov="50" />

      <!-- 光照 -->
      <TresAmbientLight :intensity="0.9" />
      <TresDirectionalLight :position="[60, 90, 40]" :intensity="1.1" />
      <TresDirectionalLight :position="[-50, 40, -30]" :intensity="0.35" />

      <!-- 真实世界地图底图（始终显示；远景/扁平简化表示） -->
      <TresMesh :rotation="FLAT" :position="[0, 0, 0]">
        <TresPlaneGeometry :args="[1200, 600]" />
        <TresMeshStandardMaterial v-if="worldTex" :map="worldTex" />
        <TresMeshStandardMaterial v-else color="#0e1410" />
      </TresMesh>

      <!-- 低多边形预制地形：≥80% 显示，视野内近处精细化、远处仅扁平地图（近似高斯模糊） -->
      <primitive :object="tileGroup" />
      <SceneLogic :tile-group="tileGroup" :centers="centers" :near="NEAR" :radius="RAD" />

      <!-- 需求 3：放大比例 ≥ 80% 时显示地区建筑白模 -->
      <template v-if="showBuildings">
        <BuildingModel
          v-for="b in buildings"
          :key="b.id"
          :position="b.position"
          :type="b.type"
        />
      </template>
    </TresCanvas>

    <!-- 横屏守卫（移动端竖屏遮罩） -->
    <LandscapeGuard />
  </div>
</template>
