import React from 'react'
import { useReactFlow } from '@xyflow/react'
import { useEditorStore } from '../store.js'

export default function ContextMenu() {
  const { screenToFlowPosition } = useReactFlow()
  const menu = useEditorStore((s) => s.contextMenu)
  const addNode = useEditorStore((s) => s.addNode)
  const removeNode = useEditorStore((s) => s.removeNode)
  const close = useEditorStore((s) => s.closeContextMenu)
  const nodes = useEditorStore((s) => s.nodes)

  if (!menu.open) return null

  const target = nodes.find((n) => n.id === menu.nodeId)
  const isPopup = target?.type === 'popup'

  const addAtFlow = (type) => {
    const pos = screenToFlowPosition({ x: menu.x, y: menu.y })
    addNode(type, pos)
    close()
  }

  const addChild = (type) => {
    const count = nodes.filter((n) => n.parentNode === menu.nodeId).length
    addNode(type, { x: 20, y: 70 + count * 96 }, menu.nodeId)
    close()
  }

  const items = []
  if (!menu.nodeId) {
    items.push(
      { label: '⚡ 添加触发节点', fn: () => addAtFlow('trigger') },
      { label: '▶ 添加动作节点', fn: () => addAtFlow('action') },
      { label: '🔢 添加变量节点', fn: () => addAtFlow('variable') },
      { label: '🗔 添加事件弹窗(容器)', fn: () => addAtFlow('popup') }
    )
  } else if (isPopup) {
    items.push(
      { label: '📝 添加文本子节点', fn: () => addChild('text') },
      { label: '🖼 添加图片子节点', fn: () => addChild('image') },
      { label: '➤ 添加选项子节点', fn: () => addChild('option') },
      { divider: true },
      { label: '🗑 删除此节点', danger: true, fn: () => removeNode(menu.nodeId) }
    )
  } else {
    items.push({ label: '🗑 删除此节点', danger: true, fn: () => removeNode(menu.nodeId) })
  }

  return (
    <div className="ee-context-menu" style={{ left: menu.x, top: menu.y }} onContextMenu={(e) => e.preventDefault()}>
      {items.map((it, i) =>
        it.divider ? (
          <div key={i} className="ee-context-divider" />
        ) : (
          <button key={i} className={'ee-context-item' + (it.danger ? ' ee-context-item--danger' : '')} onClick={it.fn}>
            {it.label}
          </button>
        )
      )}
    </div>
  )
}
