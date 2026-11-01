import { reactive, computed } from 'vue'

/**
 * 缩放 / 平移 全局状态
 * - level: 归一化放大比例 0~1（0 = 战略级远眺，1 = 战术级贴近）
 * - percent: 对外展示的“放大比例 %”
 * - showBuildings: 放大比例 ≥ 80% 时显示地区建筑白模
 * - panX / panY: 地图平移偏移（世界坐标）
 *
 * 该 store 被 HUD 与 3D 场景共享，保证“放大比例”与“白模显隐”严格同步。
 */

const z = reactive({
  level: 0.25, // 初始远眺，建筑白模隐藏
  panX: 0,
  panY: 0,
})

const percent = computed(() => Math.round(z.level * 100))

// 需求 3：放大比例 ≥ 80% 时显示地区建筑白模
const showBuildings = computed(() => z.level >= 0.8)

const THRESHOLD = 80

function setLevel(v) {
  z.level = Math.min(1, Math.max(0, v))
}
function zoomBy(delta) {
  setLevel(z.level + delta)
}
function pan(dx, dy) {
  z.panX += dx
  z.panY += dy
}
function reset() {
  z.level = 0.25
  z.panX = 0
  z.panY = 0
}

export function useZoom() {
  return { z, percent, showBuildings, THRESHOLD, setLevel, zoomBy, pan, reset }
}
