<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAlertCenter } from '../composables/useAlertCenter'

/**
 * Action Center（行动中心 / Alert Center）
 * - 常驻全宽窄条：图标 + 数字 Badge 聚合待办数量（2.1）
 * - 非模态展开：点击图标 → 向下展开 Popover/Drawer，不阻塞游戏（2.2）
 * - 状态同步：新增待办 Badge +1；处理(前往)后列表项移除、Badge -1（2.3）
 * - 视觉层级：入口克制；抽屉 z 高于画布、低于模态（2.4）
 * - 术语：聚合面板 = Action Center；数字徽章 = Badge；容器 = Popover/Drawer
 *   （区别于 Toast 瞬时反馈 与 Modal Dialog 阻塞弹窗）
 */
const { alertCategories, countByCat, total, alertsByCat, resolveAlert, simulateAlert } =
  useAlertCenter()

const rootRef = ref(null)
const open = ref(false)
const activeCat = ref('pol')

function toggle(catKey) {
  if (open.value && activeCat.value === catKey) {
    open.value = false // 再次点击同一图标 → 收起
  } else {
    activeCat.value = catKey
    open.value = true
  }
}
function close() {
  open.value = false
}

// “前往”：执行导航（演示）并标记该项已处理 → 列表移除、对应 Badge -1
function go(alert) {
  // 真实项目中此处跳转到对应界面（研究/生产/外交…），这里直接标记处理
  resolveAlert(alert.id)
}

// 非模态：点击面板/窄条之外的区域（如游戏地图）仅关闭，不阻塞操作
function onDocClick(e) {
  if (!rootRef.value) return
  if (!rootRef.value.contains(e.target)) close()
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <!-- 根容器：fixed 全宽，置于主顶栏之下（top-11 = 44px） -->
  <div ref="rootRef" class="fixed left-0 right-0 top-11 z-40">
    <!-- 2.1 常驻窄条：不自动消失、不阻塞游戏 -->
    <nav
      class="hoi-panel flex h-10 items-stretch border-t border-hoi-line/60"
      aria-label="Action Center 入口"
    >
      <span
        class="hoi-brass-bar flex items-center px-3 text-[11px] font-semibold tracking-widest text-hoi-brass"
      >
        ACTION
      </span>

      <!-- 各分类图标 + Badge -->
      <button
        v-for="cat in alertCategories"
        :key="cat.key"
        type="button"
        class="group relative flex flex-1 items-center justify-center border-r border-hoi-line/40 transition-colors"
        :class="
          open && activeCat === cat.key
            ? 'bg-hoi-panel2 text-hoi-brass'
            : 'text-hoi-muted hover:bg-hoi-panel2/60 hover:text-hoi-text'
        "
        :title="`${cat.label}（${countByCat[cat.key]}）`"
        @click.stop="toggle(cat.key)"
      >
        <span class="text-lg leading-none">{{ cat.icon }}</span>

        <!-- Badge：数字徽章 -->
        <span
          v-if="countByCat[cat.key] > 0"
          :key="countByCat[cat.key]"
          class="hoi-anim-pop absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hoi-alert px-1 text-[10px] font-bold leading-none text-white shadow"
        >
          {{ countByCat[cat.key] > 99 ? '99+' : countByCat[cat.key] }}
        </span>
      </button>

      <!-- 总数提示 -->
      <div
        class="flex items-center px-3 text-[11px] text-hoi-muted tabnum"
        title="待处理总数"
      >
        待办 <span class="ml-1 font-bold text-hoi-brass">{{ total }}</span>
      </div>
    </nav>

    <!-- 2.2 非模态 Popover / Drawer：不覆盖全屏、不阻塞游戏 -->
    <transition name="hoi-fade">
      <section
        v-if="open"
        class="hoi-panel hoi-anim-down absolute left-2 right-2 top-[42px] z-50 max-h-[60vh] overflow-hidden rounded-sm sm:left-2 sm:right-auto sm:w-[360px]"
        role="dialog"
        aria-label="Action Center 面板"
      >
        <!-- 头部：分类切换 + 标题 -->
        <header class="hoi-brass-bar flex items-center justify-between px-3 py-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold tracking-widest text-hoi-brass"
              >行动中心 · ACTION CENTER</span
            >
          </div>
          <button
            type="button"
            class="rounded px-1 text-hoi-muted hover:text-hoi-text"
            title="收起"
            @click.stop="close"
          >
            ✕
          </button>
        </header>

        <!-- 分类标签 -->
        <div class="flex flex-wrap gap-1 border-b border-hoi-line/50 px-2 py-2">
          <button
            v-for="cat in alertCategories"
            :key="cat.key"
            type="button"
            class="rounded-sm border px-2 py-1 text-[11px] transition-colors"
            :class="
              activeCat === cat.key
                ? 'border-hoi-brass-d bg-hoi-panel2 text-hoi-brass'
                : 'border-hoi-line text-hoi-muted hover:text-hoi-text'
            "
            @click.stop="activeCat = cat.key"
          >
            {{ cat.icon }} {{ cat.label }}
            <span class="ml-1 font-bold tabnum">{{ countByCat[cat.key] }}</span>
          </button>
        </div>

        <!-- 列表：逐条展示待办（标题 / 描述 / 前往） -->
        <div class="max-h-[42vh] overflow-y-auto px-2 py-2">
          <ul class="flex flex-col gap-2">
            <li
              v-for="a in alertsByCat(activeCat)"
              :key="a.id"
              class="grid grid-cols-[1fr_auto] items-center gap-2 rounded-sm border border-hoi-line/60 bg-hoi-panel2/50 px-3 py-2"
            >
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-hoi-text">
                  {{ a.title }}
                </div>
                <div class="mt-0.5 line-clamp-2 text-[11px] text-hoi-muted">
                  {{ a.desc }}
                </div>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-sm border border-hoi-brass-d bg-hoi-brass/15 px-3 py-1.5 text-xs font-semibold text-hoi-brass transition-colors hover:bg-hoi-brass/30"
                @click.stop="go(a)"
              >
                前往 ›
              </button>
            </li>
          </ul>

          <!-- 空状态 -->
          <div
            v-if="alertsByCat(activeCat).length === 0"
            class="px-3 py-8 text-center text-xs text-hoi-muted"
          >
            该分类暂无待办 ✓
          </div>
        </div>

        <!-- 底部：模拟新待办（演示 Badge 实时 +1） -->
        <footer
          class="flex items-center justify-between border-t border-hoi-line/50 px-3 py-2"
        >
          <span class="text-[11px] text-hoi-muted"
            >共 {{ total }} 项待处理</span
          >
          <button
            type="button"
            class="rounded-sm border border-hoi-ok/60 bg-hoi-ok/15 px-3 py-1 text-xs font-semibold text-hoi-ok hover:bg-hoi-ok/30"
            @click.stop="simulateAlert"
          >
            ＋ 模拟新待办
          </button>
        </footer>
      </section>
    </transition>
  </div>
</template>

<style scoped>
.hoi-fade-enter-active,
.hoi-fade-leave-active {
  transition: opacity 0.15s ease;
}
.hoi-fade-enter-from,
.hoi-fade-leave-to {
  opacity: 0;
}
</style>
