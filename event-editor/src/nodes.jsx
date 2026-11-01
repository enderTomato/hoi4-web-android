import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { useEditorStore } from './store.js'

const inputCls = 'ee-input'
const selectCls = 'ee-select'

function Field({ label, children }) {
  return (
    <label className="ee-field">
      <span className="ee-field-label">{label}</span>
      {children}
    </label>
  )
}

/* ---------------- 触发节点 ---------------- */
export function TriggerNode({ id, data }) {
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <div className="ee-node ee-node--trigger">
      <div className="ee-node-head">⚡ 触发</div>
      <Field label="名称">
        <input className={inputCls} value={data.label} onChange={(e) => update(id, { label: e.target.value })} />
      </Field>
      <Field label="触发条件">
        <select className={selectCls} value={data.eventType} onChange={(e) => update(id, { eventType: e.target.value })}>
          <option>战争结束</option>
          <option>科技解锁</option>
          <option>国家焦点完成</option>
          <option>日期到达</option>
        </select>
      </Field>
      <Handle type="source" position={Position.Right} id="exec" className="ee-handle ee-handle--exec" />
    </div>
  )
}

/* ---------------- 动作节点 ---------------- */
export function ActionNode({ id, data }) {
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <div className="ee-node ee-node--action">
      <div className="ee-node-head">▶ 动作</div>
      <Field label="名称">
        <input className={inputCls} value={data.label} onChange={(e) => update(id, { label: e.target.value })} />
      </Field>
      <Field label="效果">
        <select className={selectCls} value={data.actionType} onChange={(e) => update(id, { actionType: e.target.value })}>
          <option>弹出事件窗口</option>
          <option>给予资源</option>
          <option>宣战</option>
          <option>添加战争分数</option>
        </select>
      </Field>
      <Handle type="target" position={Position.Left} id="exec" className="ee-handle ee-handle--exec" style={{ top: 26 }} />
      <Handle type="target" position={Position.Left} id="amount" className="ee-handle ee-handle--number" style={{ top: 64 }} title="数值输入" />
      <Handle type="source" position={Position.Right} id="exec" className="ee-handle ee-handle--exec" />
    </div>
  )
}

/* ---------------- 变量节点 ---------------- */
export function VariableNode({ id, data }) {
  const update = useEditorStore((s) => s.updateNodeData)
  return (
    <div className="ee-node ee-node--variable">
      <div className="ee-node-head">🔢 变量</div>
      <Field label="名称">
        <input className={inputCls} value={data.label} onChange={(e) => update(id, { label: e.target.value })} />
      </Field>
      <Field label="数据">
        <select className={selectCls} value={data.varType} onChange={(e) => update(id, { varType: e.target.value })}>
          <option>当前年份</option>
          <option>玩家资源</option>
          <option>战争分数</option>
          <option>稳定度</option>
        </select>
      </Field>
      <Handle type="source" position={Position.Right} id="value" className="ee-handle ee-handle--number" />
    </div>
  )
}

/* ---------------- 事件弹窗（容器）节点 ---------------- */
export function EventPopupNode({ id }) {
  const update = useEditorStore((s) => s.updateNodeData)
  const childCount = useEditorStore((s) => s.nodes.filter((n) => n.parentNode === id).length)
  return (
    <div className="ee-node ee-node--popup" style={{ minHeight: 90 + childCount * 96 }}>
      <div className="ee-node-head">🗔 事件弹窗（容器）</div>
      <Field label="弹窗标题">
        <input className={inputCls} defaultValue="事件弹窗" onChange={(e) => update(id, { title: e.target.value })} />
      </Field>
      <div className="ee-popup-hint">
        右键此节点可添加「文本 / 图片 / 选项」子节点（{childCount} 个）
      </div>
      <Handle type="target" position={Position.Left} id="exec" className="ee-handle ee-handle--exec" style={{ top: 26 }} />
      <Handle type="source" position={Position.Right} id="exec" className="ee-handle ee-handle--exec" />
    </div>
  )
}

/* ---------------- 文本（子）节点 ---------------- */
export function TextNode({ id, data }) {
  const update = useEditorStore((s) => s.updateNodeData)
  const remove = useEditorStore((s) => s.removeNode)
  return (
    <div className="ee-node ee-node--child">
      <div className="ee-node-head ee-node-head--child">
        文本 <button className="ee-del" onClick={() => remove(id)}>✕</button>
      </div>
      <Field label="标题">
        <input className={inputCls} value={data.title} onChange={(e) => update(id, { title: e.target.value })} />
      </Field>
      <Field label="正文">
        <textarea className="ee-textarea" rows={3} value={data.body} onChange={(e) => update(id, { body: e.target.value })} />
      </Field>
    </div>
  )
}

/* ---------------- 图片（子）节点 ---------------- */
export function ImageNode({ id, data }) {
  const update = useEditorStore((s) => s.updateNodeData)
  const remove = useEditorStore((s) => s.removeNode)
  return (
    <div className="ee-node ee-node--child">
      <div className="ee-node-head ee-node-head--child">
        图片 <button className="ee-del" onClick={() => remove(id)}>✕</button>
      </div>
      <Field label="图片 URL">
        <input className={inputCls} value={data.url} onChange={(e) => update(id, { url: e.target.value })} />
      </Field>
      <img className="ee-img-preview" src={data.url} alt="" onError={(e) => (e.target.style.opacity = 0.2)} />
    </div>
  )
}

/* ---------------- 选项（子）节点 ---------------- */
export function OptionNode({ id, data }) {
  const update = useEditorStore((s) => s.updateNodeData)
  const remove = useEditorStore((s) => s.removeNode)
  return (
    <div className="ee-node ee-node--child">
      <div className="ee-node-head ee-node-head--child">
        选项 <button className="ee-del" onClick={() => remove(id)}>✕</button>
      </div>
      <Field label="选项文本">
        <input className={inputCls} value={data.label} onChange={(e) => update(id, { label: e.target.value })} />
      </Field>
      <Handle type="source" position={Position.Right} id="next" className="ee-handle ee-handle--exec" title="选择后触发" />
    </div>
  )
}

export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  variable: VariableNode,
  popup: EventPopupNode,
  text: TextNode,
  image: ImageNode,
  option: OptionNode
}
