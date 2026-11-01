import React, { useRef } from 'react'
import { useEditorStore } from '../store.js'

export default function Toolbar() {
  const openExport = useEditorStore((s) => s.openExport)
  const importGraph = useEditorStore((s) => s.importGraph)
  const setNodes = useEditorStore((s) => s.onNodesChange)
  const setEdges = useEditorStore((s) => s.onEdgesChange)
  const fileRef = useRef(null)

  const onImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      importGraph(JSON.parse(text))
    } catch (err) {
      alert('导入失败：' + err.message)
    }
    e.target.value = ''
  }

  const onClear = () => {
    if (!confirm('确定清空画布？')) return
    setNodes([{ type: 'remove', id: '__all__' }]) // 触发清空
    setEdges([{ type: 'remove', id: '__all__' }])
    useEditorStore.setState({ nodes: [], edges: [] })
  }

  return (
    <div className="ee-toolbar">
      <div className="ee-brand">🛠 HOI4 事件编辑器</div>
      <div className="ee-toolbar-spacer" />
      <button className="ee-btn" onClick={() => fileRef.current?.click()}>📥 导入 JSON</button>
      <button className="ee-btn" onClick={openExport}>📤 导出 JSON</button>
      <button className="ee-btn ee-btn--ghost" onClick={onClear}>🗑 清空</button>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
    </div>
  )
}
