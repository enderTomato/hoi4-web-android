import React, { useState } from 'react'
import { useEditorStore } from '../store.js'

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportModal() {
  const open = useEditorStore((s) => s.exportModalOpen)
  const close = useEditorStore((s) => s.closeExport)
  const exportGraph = useEditorStore((s) => s.exportGraph)
  const [packName, setPackName] = useState('我的事件包')
  const [author, setAuthor] = useState('')
  const [version, setVersion] = useState('1.0.0')
  const [preview, setPreview] = useState('')

  if (!open) return null

  const onConfirm = () => {
    const graph = exportGraph({ packName, author, version })
    const text = JSON.stringify(graph, null, 2)
    download(`${(packName || 'event').replace(/\s+/g, '_')}.json`, text)
    setPreview(text)
  }

  return (
    <div className="ee-modal-overlay" onMouseDown={close}>
      <div className="ee-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="ee-modal-head">导出事件包</div>
        <label className="ee-field">
          <span className="ee-field-label">事件包名称 (Pack Name)</span>
          <input className="ee-input" value={packName} onChange={(e) => setPackName(e.target.value)} />
        </label>
        <label className="ee-field">
          <span className="ee-field-label">作者名称 (Author)</span>
          <input className="ee-input" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="你的昵称" />
        </label>
        <label className="ee-field">
          <span className="ee-field-label">版本 (Version)</span>
          <input className="ee-input" value={version} onChange={(e) => setVersion(e.target.value)} />
        </label>

        {preview && (
          <pre className="ee-json-preview">{preview.slice(0, 1200)}{preview.length > 1200 ? '\n…(已截断预览)' : ''}</pre>
        )}

        <div className="ee-modal-actions">
          <button className="ee-btn ee-btn--ghost" onClick={close}>取消</button>
          <button className="ee-btn" onClick={onConfirm}>确定并下载</button>
        </div>
      </div>
    </div>
  )
}
