import React from 'react'

// 节点面板：三类基础节点 + 容器节点，可拖拽到画布或点击添加
const ITEMS = [
  { type: 'trigger', icon: '⚡', name: '触发节点', group: '入口' },
  { type: 'action', icon: '▶', name: '动作节点', group: '逻辑' },
  { type: 'variable', icon: '🔢', name: '变量节点', group: '数据' },
  { type: 'popup', icon: '🗔', name: '事件弹窗(容器)', group: '复合' }
]

export default function NodePalette({ onAdd }) {
  const onDragStart = (e, type) => {
    e.dataTransfer.setData('application/ee-node', type)
    e.dataTransfer.effectAllowed = 'move'
  }
  return (
    <aside className="ee-palette">
      <div className="ee-palette-title">节点面板</div>
      {ITEMS.map((it) => (
        <div
          key={it.type}
          className="ee-palette-item"
          draggable
          onDragStart={(e) => onDragStart(e, it.type)}
          onClick={() => onAdd(it.type)}
          title="拖拽到画布，或点击添加"
        >
          <span className="ee-palette-icon">{it.icon}</span>
          <span className="ee-palette-name">{it.name}</span>
          <span className="ee-palette-group">{it.group}</span>
        </div>
      ))}
      <div className="ee-palette-tip">
        提示：右键画布快速添加；右键「事件弹窗」可添加文本/图片/选项子节点。
      </div>
    </aside>
  )
}
