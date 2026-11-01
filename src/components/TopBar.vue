<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const now = ref('')
let timer = null
function tick() {
  now.value = new Date().toLocaleString('zh-CN', { hour12: false })
}
onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <!-- 游戏主顶栏：高度 44px，满足移动端最小触控目标 -->
  <header
    class="hoi-panel fixed left-0 right-0 top-0 z-40 flex h-11 items-center gap-3 px-3"
  >
    <span class="font-bold tracking-[0.2em] text-hoi-brass">战略指挥部</span>
    <span class="hidden text-[10px] tracking-widest text-hoi-muted sm:inline"
      >HOI4 · WEB</span
    >
    <span class="ml-auto text-xs text-hoi-muted tabnum">{{ now }}</span>
  </header>
</template>
