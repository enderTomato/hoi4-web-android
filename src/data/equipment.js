// 装备数据 —— 解析自用户提供的 Hoi4-equipment.csv
// modelKey 用于后续“低多边形白模预制建模”的映射（坦克/飞机/舰船等均有独立白模）
export const equipmentCategories = [
  { key: 'artillery', label: '火炮', modelKey: 'artillery' },
  { key: 'tank', label: '坦克', modelKey: 'tank' },
  { key: 'tankDeriv', label: '坦克衍生', modelKey: 'tankDeriv' },
  { key: 'aircraft', label: '飞机', modelKey: 'aircraft' },
  { key: 'ship', label: '舰船', modelKey: 'ship' },
]

export const equipment = [
  // 火炮
  { id: 'a1', cat: 'artillery', name: '牵引式火炮', model: 'Field Artillery', mod: '不可模块化改装；经验升级属性或换代', dlc: '无' },
  { id: 'a2', cat: 'artillery', name: '牵引式防空炮', model: 'AA', mod: '不可模块化改装；经验升级属性或换代', dlc: '无' },
  { id: 'a3', cat: 'artillery', name: '牵引式反坦克炮', model: 'AT', mod: '不可模块化改装；经验升级属性或换代', dlc: '无' },
  { id: 'a4', cat: 'artillery', name: '牵引式火箭炮', model: 'Rocket Artillery', mod: '不可模块化改装；经验升级属性或换代', dlc: '无' },
  // 坦克
  { id: 't1', cat: 'tank', name: '轻型坦克', model: 'Light Tank', mod: '模块化设计器改装', dlc: 'No Step Back' },
  { id: 't2', cat: 'tank', name: '中型坦克', model: 'Medium Tank', mod: '模块化设计器改装', dlc: 'No Step Back' },
  { id: 't3', cat: 'tank', name: '重型坦克', model: 'Heavy Tank', mod: '模块化设计器改装', dlc: 'No Step Back' },
  { id: 't4', cat: 'tank', name: '超重型坦克', model: 'Super Heavy Tank', mod: '模块化设计器改装', dlc: 'No Step Back' },
  { id: 't5', cat: 'tank', name: '两栖坦克', model: 'Amphibious Tank', mod: '模块化设计器改装（基于两栖底盘）', dlc: 'No Step Back' },
  { id: 't6', cat: 'tank', name: '现代坦克', model: 'Modern Tank', mod: '模块化设计器改装', dlc: 'No Step Back' },
  // 坦克衍生
  { id: 'td1', cat: 'tankDeriv', name: '坦克歼击车', model: 'TD', mod: '基于坦克底盘，主炮槽选反坦克炮', dlc: 'No Step Back' },
  { id: 'td2', cat: 'tankDeriv', name: '自行火炮', model: 'SPG', mod: '基于坦克底盘，主炮槽选榴弹炮/火炮', dlc: 'No Step Back' },
  { id: 'td3', cat: 'tankDeriv', name: '自行防空炮', model: 'SPAA', mod: '基于坦克底盘，主炮槽选防空炮', dlc: 'No Step Back' },
  // 飞机
  { id: 'p1', cat: 'aircraft', name: '轻型飞机', model: 'Small Airframe', mod: '模块化设计器改装', dlc: 'By Blood Alone' },
  { id: 'p2', cat: 'aircraft', name: '中型飞机', model: 'Medium Airframe', mod: '模块化设计器改装', dlc: 'By Blood Alone' },
  { id: 'p3', cat: 'aircraft', name: '重型飞机', model: 'Large Airframe', mod: '模块化设计器改装', dlc: 'By Blood Alone' },
  { id: 'p4', cat: 'aircraft', name: '舰载型轻型飞机', model: 'Carrier-Capable Small Airframe', mod: '模块化设计器改装（轻型机身的舰载版）', dlc: 'By Blood Alone' },
  // 舰船
  { id: 's1', cat: 'ship', name: '驱逐舰', model: 'DD', mod: '模块化设计器改装', dlc: 'Man the Guns' },
  { id: 's2', cat: 'ship', name: '轻巡洋舰', model: 'CL', mod: '模块化设计器改装', dlc: 'Man the Guns' },
  { id: 's3', cat: 'ship', name: '重巡洋舰', model: 'CA', mod: '模块化设计器改装', dlc: 'Man the Guns' },
  { id: 's4', cat: 'ship', name: '战列巡洋舰', model: 'BC', mod: '模块化设计器改装', dlc: 'Man the Guns' },
  { id: 's5', cat: 'ship', name: '战列舰', model: 'BB', mod: '模块化设计器改装', dlc: 'Man the Guns' },
  { id: 's6', cat: 'ship', name: '超重战列舰', model: 'SHBB', mod: '模块化设计器改装', dlc: 'Man the Guns' },
  { id: 's7', cat: 'ship', name: '航空母舰', model: 'CV', mod: '模块化设计器改装', dlc: 'Man the Guns' },
  { id: 's8', cat: 'ship', name: '潜艇', model: 'SS', mod: '独立设计器（槽位较少，无装甲配置）', dlc: 'Man the Guns' },
]

// 按类别分组，便于“装备图鉴”面板渲染
export function equipmentByCategory() {
  const map = {}
  for (const e of equipment) {
    ;(map[e.cat] ||= []).push(e)
  }
  return map
}
