<script setup>
// 横屏守卫：移动端竖屏时显示「请横屏」遮罩，并在用户首次触摸时尝试锁定横屏。
// 桌面端（无触摸）不显示。锁定在普通网页可能受限，遮罩是最终兜底。
import { ref, onMounted, onUnmounted } from 'vue'

const isPortrait = ref(false)

function isTouch() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
function check() {
  isPortrait.value = isTouch() && window.matchMedia('(orientation: portrait)').matches
}
function tryLock() {
  try {
    const so = screen.orientation
    if (so && typeof so.lock === 'function') so.lock('landscape').catch(() => {})
  } catch (e) {
    /* 忽略：普通网页中锁定可能被浏览器拒绝 */
  }
}

onMounted(() => {
  check()
  window.addEventListener('resize', check)
  window.addEventListener('orientationchange', check)
  window.addEventListener('pointerdown', tryLock)
})
onUnmounted(() => {
  window.removeEventListener('resize', check)
  window.removeEventListener('orientationchange', check)
  window.removeEventListener('pointerdown', tryLock)
})
</script>

<template>
  <div
    v-if="isPortrait"
    class="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-hoi-bg text-hoi-text"
  >
    <div class="mb-4 text-5xl">📱↔️</div>
    <div class="text-lg font-bold tracking-widest text-hoi-brass">请横屏游玩</div>
    <div class="mt-2 max-w-[80%] text-center text-xs leading-relaxed text-hoi-muted">
      将设备旋转至横屏，以获得最佳的战略地图操作体验
    </div>
  </div>
</template>
