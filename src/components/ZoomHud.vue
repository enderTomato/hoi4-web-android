<script setup>
import { computed } from 'vue'
import { useZoom } from '../composables/useZoom'

const { z, percent, showBuildings, THRESHOLD, zoomBy, reset } = useZoom()

// 进度条当前宽度（%）
const barW = computed(() => `${percent.value}%`)
// 80% 阈值标记位置
const thresholdLeft = computed(() => `${THRESHOLD}%`)
</script>

<template>
  <!-- 放大比例 HUD：z-30，低于 Action Center(z-40)、低于模态(z-[100]) -->
  <div
    class="hoi-panel fixed bottom-3 right-3 z-30 w-[200px] rounded-sm p-3 sm:w-[220px]"
  >
    <div class="mb-1 flex items-baseline justify-between">
      <span class="text-[11px] tracking-widest text-hoi-muted">放大比例</span>
      <span class="text-lg font-bold tabnum text-hoi-brass">{{ percent }}%</span>
    </div>

    <!-- 进度条 + 80% 阈值标记 -->
    <div class="relative h-2 w-full overflow-hidden rounded-full bg-hoi-bg2">
      <div
        class="h-full rounded-full bg-gradient-to-r from-hoi-brass-d to-hoi-brass transition-[width] duration-150"
        :style="{ width: barW }"
      ></div>
      <!-- 阈值刻度：≥80% 显示白模 -->
      <div
        class="absolute top-[-2px] h-3 w-px bg-hoi-alert"
        :style="{ left: thresholdLeft }"
        title="≥80% 显示地区建筑白模"
      ></div>
    </div>
    <div class="mt-0.5 flex justify-between text-[9px] text-hoi-muted">
      <span>0%</span>
      <span class="text-hoi-alert">80% 阈值</span>
      <span>100%</span>
    </div>

    <!-- 缩放控制：按钮（移动端触控友好，≥44px 命中区） -->
    <div class="mt-2 grid grid-cols-3 gap-1">
      <button
        type="button"
        class="flex h-9 items-center justify-center rounded-sm border border-hoi-line text-base text-hoi-text hover:bg-hoi-panel2"
        @click="zoomBy(-0.1)"
        title="缩小"
      >
        －
      </button>
      <button
        type="button"
        class="flex h-9 items-center justify-center rounded-sm border border-hoi-line text-xs text-hoi-text hover:bg-hoi-panel2"
        @click="reset"
        title="适应"
      >
        适应
      </button>
      <button
        type="button"
        class="flex h-9 items-center justify-center rounded-sm border border-hoi-line text-base text-hoi-text hover:bg-hoi-panel2"
        @click="zoomBy(0.1)"
        title="放大"
      >
        ＋
      </button>
    </div>

    <!-- ≥80% 时提示白模显示 -->
    <div
      class="mt-2 rounded-sm border px-2 py-1 text-[10px] transition-colors"
      :class="
        showBuildings
          ? 'border-hoi-ok/60 bg-hoi-ok/10 text-hoi-ok'
          : 'border-hoi-line text-hoi-muted'
      "
    >
      <template v-if="showBuildings">⬢ 地区建筑白模 · 显示中</template>
      <template v-else>放大至 80% 以上以查看建筑白模</template>
    </div>
  </div>
</template>
