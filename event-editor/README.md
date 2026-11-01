# 事件编辑器（Event Editor）— 技术文稿（草案）

## 定位
独立子系统，用于可视化编排 HOI4 风格游戏事件。通过节点图（Node Graph）表达
「触发 → 动作 → 变量」逻辑，并支持复合「事件弹窗」容器节点与 JSON 序列化，
供游戏引擎加载。本目录为独立工程，与游戏主工程（Vue）解耦。

## 技术选型（待确认）
- 框架：React + Vite（独立子系统）
- 节点画布：React Flow（@xyflow/react）优先 / 或 Rete.js（AreaPlugin + ConnectionPlugin + ReactPlugin）
- 状态管理：Zustand
- 导出：自定义 JSON Schema（meta / nodes / edges）
- 打包：Web + Capacitor（APK）+ 桌面壳（Electron / Tauri）

## 功能模块
1. 画布：平移（Pan）/ 缩放（Zoom）/ 节点拖拽
2. 节点面板（Palette）：触发 / 动作 / 变量 三类
3. 类型化端口（Port）连接约束
4. 边（Edge）：创建 / 删除 / 高亮
5. 事件弹窗容器节点：嵌套 文本 / 图片 / 选项 子节点，高度自适应
6. 导出模态：包名 / 作者 → 序列化 JSON
7. 导入：重载 JSON 二次编辑
8. 上下文菜单：右键增删节点

## 分支
feature/event-editor
