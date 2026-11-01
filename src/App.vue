<script setup>
import TopBar from './components/TopBar.vue'
import ActionCenter from './components/ActionCenter.vue'
import GameScene from './components/GameScene.vue'
import ZoomHud from './components/ZoomHud.vue'
</script>

<template>
  <!-- 全屏游戏根容器：GameScene 铺底，UI 层叠加其上 -->
  <div class="relative h-full w-full overflow-hidden">
    <!-- 游戏画布（z-0）：地图 + Tresjs 3D 白模 -->
    <GameScene class="absolute inset-0 z-0" />

    <!-- 顶部游戏主栏（z-40） -->
    <TopBar />

    <!-- 需求 2：Action Center 顶部待办栏（常驻全宽窄条，z-40） -->
    <ActionCenter />

    <!-- 放大比例 HUD + 缩放控制（z-30） -->
    <ZoomHud />

    <!-- 真模态层占位（z-[100]）：当前未使用，仅声明层级，证明抽屉低于模态 -->
    <div class="pointer-events-none fixed inset-0 z-[100]"></div>
  </div>
</template>
