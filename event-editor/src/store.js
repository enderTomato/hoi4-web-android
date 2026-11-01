import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import { isConnectionValid, NODE_DEFS } from './ports.js'

let _seq = 1
function genId(prefix = 'n') {
  return `${prefix}_${Date.now().toString(36)}_${(_seq++).toString(36)}`
}

// 各类节点的默认 data
function defaultData(type) {
  switch (type) {
    case 'trigger':
      return { label: '触发', eventType: '战争结束' }
    case 'action':
      return { label: '动作', actionType: '弹出事件窗口' }
    case 'variable':
      return { label: '变量', varType: '当前年份' }
    case 'popup':
      return { title: '事件弹窗' }
    case 'text':
      return { title: '标题', body: '正文内容…' }
    case 'image':
      return { url: 'https://placehold.co/240x140' }
    case 'option':
      return { label: '选项 A' }
    default:
      return {}
  }
}

const initialNodes = [
  {
    id: 'trigger_1',
    type: 'trigger',
    position: { x: 80, y: 120 },
    data: { label: '战争结束', eventType: '战争结束' }
  },
  {
    id: 'action_popup_1',
    type: 'popup',
    position: { x: 420, y: 80 },
    data: { title: '和平协定事件' }
  },
  {
    id: 'text_1',
    type: 'text',
    position: { x: 24, y: 70 },
    parentNode: 'action_popup_1',
    extent: 'parent',
    data: { title: '战争结束', body: '贵国赢得了这场战争。' }
  },
  {
    id: 'option_1',
    type: 'option',
    position: { x: 24, y: 190 },
    parentNode: 'action_popup_1',
    extent: 'parent',
    data: { label: '接受和约' }
  }
]

const initialEdges = [
  { id: 'e1', source: 'trigger_1', sourceHandle: 'exec', target: 'action_popup_1', targetHandle: 'exec' }
]

export const useEditorStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  contextMenu: { open: false, x: 0, y: 0, nodeId: null },
  exportModalOpen: false,

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) => {
    const { nodes } = get()
    const src = nodes.find((n) => n.id === connection.source)
    const tgt = nodes.find((n) => n.id === connection.target)
    if (!src || !tgt) return
    if (!isConnectionValid(src.type, connection.sourceHandle, tgt.type, connection.targetHandle)) {
      return // 类型不匹配，拒绝连线
    }
    set((s) => ({
      edges: addEdge(
        { ...connection, id: genId('e'), animated: true },
        s.edges
      )
    }))
  },

  isValidConnection: (connection) => {
    const { nodes } = get()
    if (connection.source === connection.target) return false
    const src = nodes.find((n) => n.id === connection.source)
    const tgt = nodes.find((n) => n.id === connection.target)
    if (!src || !tgt) return false
    return isConnectionValid(src.type, connection.sourceHandle, tgt.type, connection.targetHandle)
  },

  addNode: (type, position, parentNode = null) => {
    const id = genId(type)
    const node = {
      id,
      type,
      position,
      data: defaultData(type)
    }
    if (parentNode) {
      node.parentNode = parentNode
      node.extent = 'parent'
    }
    set((s) => ({ nodes: [...s.nodes, node] }))
    return id
  },

  updateNodeData: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
    })),

  removeNode: (id) => {
    set((s) => ({
      nodes: s.nodes
        .filter((n) => n.id !== id)
        // 同时删除该容器的所有子节点
        .filter((n) => n.parentNode !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id)
    }))
    get().closeContextMenu()
  },

  setContextMenu: (menu) => set({ contextMenu: menu }),
  closeContextMenu: () => set((s) => ({ contextMenu: { ...s.contextMenu, open: false } })),

  openExport: () => set({ exportModalOpen: true }),
  closeExport: () => set({ exportModalOpen: false }),

  // 序列化为自定义 JSON Schema
  exportGraph: (meta) => {
    const { nodes, edges } = get()
    return {
      meta: {
        packName: meta.packName || '未命名事件包',
        author: meta.author || 'anonymous',
        version: meta.version || '1.0.0',
        createdAt: new Date().toISOString()
      },
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        parentId: n.parentNode || null,
        data: n.data
      })),
      edges: edges.map((e) => ({
        id: e.id,
        sourceNodeId: e.source,
        sourcePortId: e.sourceHandle,
        targetNodeId: e.target,
        targetPortId: e.targetHandle
      }))
    }
  },

  // 从 JSON 重载（用于二次编辑）
  importGraph: (graph) => {
    if (!graph || !Array.isArray(graph.nodes)) throw new Error('无效的事件包 JSON')
    const nodes = graph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position || { x: 0, y: 0 },
      data: n.data || {},
      ...(n.parentId ? { parentNode: n.parentId, extent: 'parent' } : {})
    }))
    const edges = (graph.edges || []).map((e) => ({
      id: e.id || genId('e'),
      source: e.sourceNodeId,
      sourceHandle: e.sourcePortId,
      target: e.targetNodeId,
      targetHandle: e.targetPortId,
      animated: true
    }))
    set({ nodes, edges, contextMenu: { open: false, x: 0, y: 0, nodeId: null } })
  }
}))

export { NODE_DEFS }
