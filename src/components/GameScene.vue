<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import BuildingModel from './BuildingModel.vue'
import { useZoom } from '../composables/useZoom'

const { z, showBuildings, setLevel, zoomBy } = useZoom()

const FLAT = [-Math.PI / 2, 0, 0]

// 相机：位置 = 目标点 + 随放大比例缩小的偏移；look-at 锁定目标点
const s = computed(() => 1 - 0.62 * z.level) // level0→1(远) level1→0.38(近)
const camPos = computed(() => [z.panX, 70 * s.value, z.panY + 90 * s.value])
const lookAt = computed(() => [z.panX, 0, z.panY])

// 地区建筑白模分布（8 个，控制在 Mali-G68 可承受范围内）
const buildings = [
  { id: 1, type: 'factory', position: [-22, 0, -10] },
  { id: 2, type: 'factory', position: [12, 0, -26] },
  { id: 3, type: 'silo', position: [32, 0, 6] },
  { id: 4, type: 'depot', position: [-36, 0, 22] },
  { id: 5, type: 'airfield', position: [6, 0, 32] },
  { id: 6, type: 'factory', position: [-12, 0, 16] },
  { id: 7, type: 'silo', position: [42, 0, -22] },
  { id: 8, type: 'depot', position: [22, 0, 42] },
]

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
    if (pinchDist > 0) {
      const ratio = d / pinchDist
      setLevel(pinchStartLevel + (ratio - 1) * 0.7)
    }
    pinchDist = d
  } else {
    const dx = cur.x - prev.x
    const dy = cur.y - prev.y
    const k = 0.6 - 0.4 * z.level // 远眺时单像素移动更大世界距离
    z.panX = clamp(z.panX - dx * k, -200, 200)
    z.panY = clamp(z.panY + dy * k, -200, 200)
  }
}
function onPointerUp(e) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinchDist = 0
}
function onWheel(e) {
  e.preventDefault() // 阻止页面滚动，专用于缩放
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
  <!-- 画布容器：touch-action:none，手势完全交给自定义缩放/平移 -->
  <div
    ref="wrap"
    class="touch-none absolute inset-0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <TresCanvas :dpr="[1, 1.5]" clear-color="#10130c">
      <!-- 活动相机 -->
      <TresPerspectiveCamera :position="camPos" :look-at="lookAt" :fov="50" />

      <!-- 光照 -->
      <TresAmbientLight :intensity="0.9" />
      <TresDirectionalLight :position="[60, 90, 40]" :intensity="1.1" />
      <TresDirectionalLight :position="[-50, 40, -30]" :intensity="0.35" />

      <!-- 战略地图地面 -->
      <TresMesh :rotation="FLAT" :position="[0, 0, 0]">
        <TresPlaneGeometry :args="[600, 600]" />
        <TresMeshStandardMaterial color="#1d2a18" />
      </TresMesh>

      <!-- 地图网格（指挥部严谨对齐感） -->
      <TresGridHelper
        :args="[600, 60, '#3c5a30', '#22331c']"
        :position="[0, 0.05, 0]"
      />

      <!-- 需求 3：放大比例 ≥ 80% 时才渲染地区建筑白模 -->
      <template v-if="showBuildings">
        <BuildingModel
          v-for="b in buildings"
          :key="b.id"
          :position="b.position"
          :type="b.type"
        />
      </template>
    </TresCanvas>
  </div>
</template>
