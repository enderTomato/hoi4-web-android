import { reactive, computed } from 'vue'

/**
 * Action Center（行动中心 / Alert Center）全局状态
 * 单一响应式 store：徽章数字、列表项均与 state.alerts 实时联动。
 * - 新增待办 → 对应分类 Badge +1
 * - 处理（前往）某一项 → 列表项移除 → 对应 Badge -1
 * 面板关闭后状态保留（状态在 store 中，与面板开关无关）。
 */

export const alertCategories = [
  { key: 'pol', label: '政治', icon: '⚑' }, // ⚑
  { key: 'res', label: '研究', icon: '🔬' }, // 🔬
  { key: 'prod', label: '生产', icon: '⚒' }, // ⚒
  { key: 'dip', label: '外交', icon: '🤝' }, // 🤝
  { key: 'mil', label: '军事', icon: '⚔' }, // ⚔
  { key: 'evt', label: '事件', icon: '❗' }, // ❗
]

const state = reactive({
  alerts: [
    { id: 1, category: 'pol', title: '国家焦点可用', desc: '“重整军备”焦点已完成，可指派下一项。', target: 'focus' },
    { id: 2, category: 'res', title: '研究槽空闲', desc: '3 个研究槽中 1 个已空闲，建议排入工业科技。', target: 'research' },
    { id: 3, category: 'prod', title: '生产线告警', desc: '“中型坦克”生产线缺少民用工厂，产能下降。', target: 'production' },
    { id: 4, category: 'mil', title: '部队缺编', desc: '第 1 装甲师组织度低于 50%，需补给。', target: 'army' },
    { id: 5, category: 'dip', title: '外交提议', desc: '匈牙利提出非侵略 Pact，等待回应。', target: 'diplomacy' },
    { id: 6, category: 'evt', title: '随机事件', desc: '“经济衰退”事件需要决策（30 天内）。', target: 'event' },
    { id: 7, category: 'prod', title: '建造队列空', desc: '3 个民用工厂建造队列已清空。', target: 'production' },
    { id: 8, category: 'mil', title: '海军任务', desc: '潜艇舰队需新的出击任务指派。', target: 'navy' },
  ],
  seq: 100,
})

const countByCat = computed(() => {
  const m = {}
  for (const c of alertCategories) m[c.key] = 0
  for (const a of state.alerts) m[a.category] = (m[a.category] || 0) + 1
  return m
})

const total = computed(() => state.alerts.length)

function alertsByCat(key) {
  return state.alerts.filter((a) => a.category === key)
}

function addAlert({ category, title, desc, target = '' }) {
  state.seq += 1
  state.alerts.unshift({ id: state.seq, category, title, desc, target })
}

function resolveAlert(id) {
  const i = state.alerts.findIndex((a) => a.id === id)
  if (i >= 0) state.alerts.splice(i, 1)
}

// 模拟产生一条随机待办（用于演示 Badge 实时 +1）
const simSamples = {
  pol: ['选举临近', '内阁改组', '舆论压力'],
  res: ['新科技解锁', '蓝图完成', '研究瓶颈'],
  prod: ['资源短缺', '工厂罢工', '队列中断'],
  dip: ['邻国示好', '贸易提案', '领土要求'],
  mil: ['战线告急', '增援请求', '情报预警'],
  evt: ['自然灾害', '工人示威', '技术突破'],
}
function simulateAlert() {
  const keys = Object.keys(simSamples)
  const k = keys[Math.floor(Math.random() * keys.length)]
  const titles = simSamples[k]
  const t = titles[Math.floor(Math.random() * titles.length)]
  addAlert({ category: k, title: t, desc: `系统于 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })} 生成一条新待办。`, target: k })
}

export function useAlertCenter() {
  return {
    state,
    alertCategories,
    countByCat,
    total,
    alertsByCat,
    addAlert,
    resolveAlert,
    simulateAlert,
  }
}
