import React from 'react'
import { ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, BackgroundVariant, useReactFlow } from '@xyflow/react'
import { useEditorStore } from './store.js'
import { nodeTypes } from './nodes.jsx'
import Toolbar from './components/Toolbar.jsx'
import NodePalette from './components/NodePalette.jsx'
import ContextMenu from './components/ContextMenu.jsx'
import ExportModal from './components/ExportModal.jsx'

function FlowCanvas() {
  const { screenToFlowPosition: sp } = useReactFlow()
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const onNodesChange = useEditorStore((s) => s.onNodesChange)
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange)
  const onConnect = useEditorStore((s) => s.onConnect)
  const isValidConnection = useEditorStore((s) => s.isValidConnection)
  const addNode = useEditorStore((s) => s.addNode)
  const setContextMenu = useEditorStore((s) => s.setContextMenu)
  const closeContextMenu = useEditorStore((s) => s.closeContextMenu)

  const onDrop = (e) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/ee-node')
    if (!type) return
    const pos = sp({ x: e.clientX, y: e.clientY })
    addNode(type, pos)
  }
  const onDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const onPaneContextMenu = (e) => {
    e.preventDefault()
    setContextMenu({ open: true, x: e.clientX, y: e.clientY, nodeId: null })
  }
  const onNodeContextMenu = (e, node) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ open: true, x: e.clientX, y: e.clientY, nodeId: node.id })
  }
  const onPaneClick = () => closeContextMenu()

  return (
    <div className="ee-canvas" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        deleteKeyCode={['Delete', 'Backspace']}
        defaultEdgeOptions={{ animated: true }}
        minZoom={0.2}
        maxZoom={2.5}
        fitView
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2f3a" />
        <Controls />
        <MiniMap pannable zoomable nodeColor="#c9a227" maskColor="rgba(0,0,0,0.6)" />
      </ReactFlow>
    </div>
  )
}

export default function App() {
  const addNode = useEditorStore((s) => s.addNode)
  const onAddFromPalette = (type) =>
    addNode(type, { x: 160 + Math.random() * 160, y: 100 + Math.random() * 120 })

  return (
    <ReactFlowProvider>
      <div className="ee-app">
        <Toolbar />
        <div className="ee-body">
          <NodePalette onAdd={onAddFromPalette} />
          <FlowCanvas />
        </div>
        <ContextMenu />
        <ExportModal />
      </div>
    </ReactFlowProvider>
  )
}
