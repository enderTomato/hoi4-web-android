# 事件编辑器 · 技术文稿

> 子系统定位：HOI4 风格游戏「可视化事件编排器」，通过节点图表达 触发 → 动作 → 变量 逻辑，
> 支持「事件弹窗」复合容器节点与 JSON 序列化，供游戏引擎加载。本工程与游戏主工程（Vue）解耦，
> 位于仓库 `feature/event-editor` 分支的 `event-editor/` 目录。

---

## 一、技术选型结论

**实现采用 React Flow（`@xyflow/react` v12）+ React 18 + Vite + Zustand。**

理由（对应原始需求第四节）：
- 原始需求主推 **Rete.js**，但「事件弹窗容器节点需嵌套 文本/图片/选项 子节点、父节点高度随子节点自适应」
  是硬性要求，而 Rete.js v2 **没有原生容器节点概念**，嵌套需大量自定义渲染，脆弱且难以稳定交付 APK/桌面端。
- React Flow **原生支持 parent/child 嵌套**（`parentNode` + `extent: 'parent'`）、pan/zoom、context menu、
  受控节点状态与 JSON 序列化，是快速、可靠交付的最佳路径。
- 下方第二节完整给出 **Rete.js 架构分析与 React Flow 适配对照**，满足需求第四节要求的「同时给出 React Flow 适配说明」。

---

## 二、Rete.js 架构分析（方案对照）

Rete.js v2 推荐通过官方 kit 组合插件：

| 插件 | 作用 |
|---|---|
| `rete` / `rete-engine` | 节点引擎核心，定义 Node、Socket、Connection |
| `rete-area-plugin` | 画布（Area）：平移(pan)、缩放(zoom)、节点拖拽 |
| `rete-connection-plugin` | 连线（Edge）：创建/删除/高亮 |
| `rete-react-plugin` | 用 React 渲染节点与连线 |
| `rete-render-utils` | 节点尺寸/位置渲染工具 |
| `rete-context-menu-plugin` | 右键上下文菜单 |
| `rete-serialization-plugin` / `rete-area-plugin` 的 `serializer` | 图序列化 |

组合方式（伪代码）：
```ts
const area = new AreaPlugin<Schemes>(areaEl)
const connection = new ConnectionPlugin<Schemes>()
const render = new ReactPlugin<Schemes, AreaExtra>({ createNode })
const engine = new NodeEditor<Schemes>()
engine.use(area); area.use(connection); area.use(render)
```

### 1) 类型化端口约束
Rete 用 `Socket` 作为端口类型。连接合法性由 `connection.isAllowed` 或自定义 `Node` 的 `addConnection` 校验：
```ts
const execSocket = new Socket('exec')
const numSocket  = new Socket('number')
node.addOutput(new Output('exec', 'exec', execSocket))
node.addInput(new Input('amount', 'amount', numSocket))
// 不同 Socket 实例默认不可互连 → 实现“变量端口只能连数值输入”
```

### 2) 容器节点内部嵌套（Rete 的难点）
Rete 无原生容器。可行但脆弱的做法：把子节点作为普通节点，其 `position` 存为相对父节点的坐标，
在自定义 React 节点组件内用 `absolute` 定位渲染子节点；父节点高度由 `rete-render-utils` 计算子节点包围盒后动态设置。
此方案与 React Flow 的 `parentNode/extent` 相比，需手写坐标换算、尺寸测量、缩放同步，维护成本高。

### 3) 序列化
`rete-area-plugin` 提供 `area.serialize()` 得到 `{ id, nodes, connections }`，或配合 `rete-serialization-plugin`
导出带 `data` 的 JSON；二次编辑用 `area.deserialize(data)` 重载。

### 结论
Rete.js 能实现全部需求，但容器嵌套与序列化需额外脚手架。本项目以 React Flow 落地，
上面对照可作为「若改回 Rete.js 原生实现」的迁移蓝图。

---

## 三、React Flow 实现要点（本项目实际方案）

### 1) 画布 / 平移 / 缩放 / 拖拽
- `<ReactFlow>` 原生支持 pan（拖拽空白）、zoom（滚轮/ctrl+滚轮）、节点拖拽移动。
- `minZoom={0.2} maxZoom={2.5} fitView` 限制缩放范围。
- 节点面板（NodePalette）项 `draggable`，画布 `onDrop` + `screenToFlowPosition` 实现拖入落点。

### 2) 三类基础节点 + 类型化端口
节点类型（`src/nodes.jsx`）：`trigger`(触发) / `action`(动作) / `variable`(变量) / `popup`(容器) /
`text` / `image` / `option`(子节点)。
端口类型在 `src/ports.js` 的 `NODE_DEFS` 中声明（`exec` / `number` / `any`）。
连线合法性由 `isValidConnection` 校验：`exec↔exec`、`number↔number/any`；
**变量节点(number) 连到动作节点的 exec 输入会被拒绝**，满足「变量端口只能连接受数值的输入端口」。

### 3) 边（Edge）
React Flow 原生：从 Handle 拖拽创建；选中按 `Delete/Backspace` 删除；选中高亮（`selected` 样式 + `animated`）。

### 4) 事件弹窗容器节点（复合）
`popup` 节点声明 `parentNode` 容器；`text/image/option` 子节点通过
`addNode(type, relPos, popupId)` 创建，带 `parentNode: popupId` 与 `extent: 'parent'`，
**子节点被约束在父节点内**。父节点 `minHeight = 90 + childCount*96` 由 `useEditorStore` 实时读取子节点数，
实现**高度随子节点数量自适应**。

### 5) 导出 / 导入 JSON
- 画布上方「导出 JSON」→ 模态（Pack Name / Author / Version）→ 序列化：
  ```json
  {
    "meta": { "packName": "...", "author": "...", "version": "1.0.0", "createdAt": "ISO8601" },
    "nodes": [ { "id", "type", "position", "parentId", "data" } ],
    "edges": [ { "id", "sourceNodeId", "sourcePortId", "targetNodeId", "targetPortId" } ]
  }
  ```
- 「导入 JSON」读取文件 → `importGraph()` 重建成受控的 nodes/edges，支持二次编辑。

### 6) 右键上下文菜单（非模态）
`onPaneContextMenu` / `onNodeContextMenu` → `setContextMenu({x,y,nodeId})` → `ContextMenu` 组件
在 `fixed` 位置渲染菜单：空白处可加四类节点；popup 上可加文本/图片/选项子节点或删除；普通节点可删除。

### 7) 节点拖到画布外不丢失
React Flow 把节点保存在状态中，拖出视口不会删除；带 `extent:'parent'` 的子节点被约束在父内，
普通节点可自由移出再平移找回。

---

## 四、自定义 JSON Schema（事件包）

```
EventPack := {
  meta:   { packName: string, author: string, version: string, createdAt: string(ISO8601) }
  nodes:  Node[]
  edges:  Edge[]
}
Node  := { id: string, type: enum(trigger|action|variable|popup|text|image|option),
           position: {x:number,y:number}, parentId: string|null, data: object }
Edge  := { id: string, sourceNodeId: string, sourcePortId: string,
           targetNodeId: string, targetPortId: string }
```
游戏引擎加载时按 `type` 映射为运行时事件对象；`parentId` 还原弹窗嵌套；`edges` 重建触发链。

---

## 五、打包与部署

- **Web**：`npm run build` → `dist/`（`base:'./'` 兼容 WebView / file://）。
- **APK**：Capacitor 包裹 `dist/`，`npx cap add android` + `assembleDebug`。
- **桌面**：Electron 壳（`main.js`）加载 `dist/index.html`，`npm run electron` 调试，
  `npm run electron:build` 产出 Linux AppImage。
