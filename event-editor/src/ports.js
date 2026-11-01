// 节点类型与端口（类型化）定义
// 端口 type 用于约束连线合法性：exec 只能连 exec；number 只能连 number/any
export const PORT_TYPES = {
  EXEC: 'exec',
  NUMBER: 'number',
  ANY: 'any'
}

// 每个节点类型声明其输入/输出端口及类型
export const NODE_DEFS = {
  trigger: {
    label: '触发节点',
    ports: {
      out: [{ id: 'exec', type: PORT_TYPES.EXEC }]
    }
  },
  action: {
    label: '动作节点',
    ports: {
      in: [
        { id: 'exec', type: PORT_TYPES.EXEC },
        { id: 'amount', type: PORT_TYPES.NUMBER } // 可选：接收数值（如资源数量）
      ],
      out: [{ id: 'exec', type: PORT_TYPES.EXEC }]
    }
  },
  variable: {
    label: '变量节点',
    ports: {
      out: [{ id: 'value', type: PORT_TYPES.NUMBER }]
    }
  },
  popup: {
    label: '事件弹窗（容器）',
    container: true,
    ports: {
      in: [{ id: 'exec', type: PORT_TYPES.EXEC }],
      out: [{ id: 'exec', type: PORT_TYPES.EXEC }]
    }
  },
  text: { label: '文本（子）', child: true },
  image: { label: '图片（子）', child: true },
  option: {
    label: '选项（子）',
    child: true,
    ports: {
      out: [{ id: 'next', type: PORT_TYPES.EXEC }] // 选择该选项后触发的后续
    }
  }
}

// 取某节点某侧某端口的类型
export function getPortType(nodeType, handleId, side) {
  const def = NODE_DEFS[nodeType]
  if (!def || !def.ports || !def.ports[side]) return PORT_TYPES.ANY
  const p = def.ports[side].find((x) => x.id === handleId)
  return p ? p.type : PORT_TYPES.ANY
}

// 连接合法性：exec<->exec；number<->number/any；any 接受一切
export function isConnectionValid(sourceType, sourceHandle, targetType, targetHandle) {
  const s = getPortType(sourceType, sourceHandle, 'out')
  const t = getPortType(targetType, targetHandle, 'in')
  if (s === PORT_TYPES.EXEC && t === PORT_TYPES.EXEC) return true
  if (s === PORT_TYPES.NUMBER && (t === PORT_TYPES.NUMBER || t === PORT_TYPES.ANY)) return true
  if (t === PORT_TYPES.ANY) return true
  if (s === PORT_TYPES.ANY) return true
  return false
}
