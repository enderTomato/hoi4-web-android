# 事件编辑器 · 开发文稿

## 一、执行主体与环境

- **执行者**：WorkBuddy「Frontend Developer」智能体（AI 助手），用户昵称折纸长江。
- **运行平台**：Ubuntu 22.04 沙箱（Node 22.13、npm 11.9、Java Zulu 20、已装 Android SDK + Rust/Cargo）。
- **目标设备**：iQOO Z5x（天玑 900 / Mali-G68），Android 侧载验证。
- **协作仓库**：GitHub `enderTomato/hoi4-web-android`，分支 `feature/event-editor`。

## 二、本次完成内容（P1 事件编辑器）

按用户总体计划「拆分 + 列表 + 逐一完成」，本轮落地 **P1 独立事件编辑器子系统**，全部需求逐条覆盖：

| 需求 | 实现 |
|---|---|
| 一.1 画布平移/缩放/节点拖拽 | React Flow 原生 pan/zoom/拖拽；限制 minZoom 0.2 / maxZoom 2.5 |
| 一.2 左侧节点面板（触发/动作/变量） | `NodePalette` 可拖拽/点击添加三类节点 + 容器节点 |
| 一.3 类型化端口连接约束 | `ports.js` 声明 exec/number/any；`isValidConnection` 拒绝类型不匹配（变量 number 不能连 exec 输入） |
| 一.4 边创建/删除/高亮 | React Flow 原生；Delete/Backspace 删除；选中高亮 + animated |
| 二.5 事件弹窗容器节点 | `popup` 节点 + 嵌套 text/image/option 子节点（`parentNode`+`extent:'parent'`） |
| 二.6 父节点高度自适应 | `minHeight = 90 + childCount*96` 实时随子节点数变化 |
| 三.7 导出按钮→模态 | 工具栏「导出 JSON」→ `ExportModal` |
| 三.8 模态表单 | Pack Name / Author / Version + 取消/确定 |
| 三.9 序列化 JSON | `meta{packName,author,version,createdAt}` + `nodes[]` + `edges[]` |
| 三.10 自定义 JSON Schema | 见 `docs/TECH.md` 第四节，便于游戏引擎加载 |
| 五. 右键上下文菜单 | `onPaneContextMenu`/`onNodeContextMenu` → 非模态菜单增删节点 |
| 五. 拖出画布不丢失 | 节点存于状态，子节点约束于父内 |
| 五. 导入重载 | 「导入 JSON」→ `importGraph()` 二次编辑 |

## 三、关键技术决策

用户原始需求主推 Rete.js，但「容器节点嵌套子节点」在 Rete v2 无原生支持、实现脆弱。
经权衡，采用 **React Flow（`@xyflow/react` v12）** 落地，并在 `docs/TECH.md` 给出
**Rete.js 架构分析 + React Flow 适配对照**（满足需求第四节）。若用户坚持 Rete 原生实现，可据该对照迁移。

## 四、文件结构

```
event-editor/
├── package.json            # 依赖与脚本（web/build/electron）
├── vite.config.js          # base:'./' 兼容 WebView/file://
├── capacitor.config.json   # Capacitor 配置（webDir=dist）
├── index.html
├── main.js                 # Electron 桌面壳
├── src/
│   ├── main.jsx  App.jsx   # 入口 + 画布编排
│   ├── store.js            # Zustand 全局状态 + 序列化/导入
│   ├── ports.js            # 节点类型与类型化端口定义
│   ├── nodes.jsx           # 7 类节点组件 + nodeTypes 映射
│   ├── index.css           # 暗色 HOI4 风格
│   └── components/         # Toolbar / NodePalette / ContextMenu / ExportModal
├── docs/TECH.md            # 技术文稿
└── docs/DEV.md             # 本文
```

## 五、运行与构建命令

```bash
cd event-editor
npm install                         # 安装依赖（含 Electron，已设镜像）
npm run dev                         # 本地开发 http://localhost:5180
npm run build                       # 产出 dist/ (Web)
npm run preview                     # 预览构建产物
# APK：
npx cap sync android && cd android && ./gradlew assembleDebug
# 桌面：
npm run electron                   # 调试桌面窗口
npm run electron:build             # 产出 Linux AppImage（release/）
```

## 六、验证

- Web 构建通过：203 模块，JS 342KB（gzip 110KB）。
- 无头冒烟测试（Playwright）：初始 4 节点 / 1 边，点击面板添加后变 5，导出模态正常，**0 控制台报错**。
- APK 构建成功：`android/app/build/outputs/apk/debug/app-debug.apk`（约 3.8MB）。
- 桌面端：Electron AppImage 打包中（见 Release）。

## 七、已知限制

- 容器嵌套子节点在画布中以「独立 RF 节点 + parentNode 约束」实现，非真正 DOM 内嵌；导出 JSON 用 `parentId` 还原。
- 导出 JSON 的 `data` 为节点原始配置，游戏引擎加载端需自行映射为运行时事件对象（已在 TECH.md 说明 schema）。
- 桌面 AppImage 仅 Linux；Windows/macOS 包需对应平台打包（electron-builder 跨平台）。
- 领导人/架空人物素材、iconfont 替换属于 P4/P5，未在本轮范围。
