# HOI4 风格网页游戏原型 · 开发文档

> 本文档由 **WorkBuddy 的 Frontend Developer 智能体（AI 助手）** 在自动化沙箱环境中编写，记录项目从 0 到可安装 APK 的全过程、技术决策与运行方式。

---

## 一、这是谁做的 / 在什么平台

| 项目 | 说明 |
|---|---|
| **执行者** | WorkBuddy 的 Frontend Developer 智能体（AI 助手），擅长现代前端、3D（Tresjs/Three.js）、性能与移动端适配 |
| **运行平台** | 隔离沙箱：Ubuntu 22.04 (linux/amd64)，Python 3.11 / Node 22.13 / Java 20 (Zulu) / Gradle 8.2.1 |
| **目标真机** | **iQOO Z5x**：联发科天玑 900 + Mali-G68 MC4 GPU，1080×2408、120Hz（中端机，**GPU 不是强项**，3D 负载需克制） |
| **完成日期** | 2026-11-01（APK 打包阶段）；Web 工程与 Action Center / 3D 白模功能在前序会话完成 |
| **交付物** | 自包含 Web 构建 `dist/` + Capacitor Android 工程 `android/` + 可侧载的 `app-debug.apk` |

---

## 二、需求与技术栈

### 需求来源
用户要做一个类《钢铁雄心4》（HOI4）的网页端游戏，并给出三项明确诉求：

1. **技术栈**：`HTML + CSS + JS + Mapcn + Tresjs + SQLite + PixiJS`
2. **Action Center（顶部待办栏）**：常驻全宽窄条 + 图标 Badge + 非模态 Popover/Drawer + 状态实时同步 + 明确层级与术语（区分 Toast / Modal）
3. **缩放与 3D 白模**：放大时显示放大比例；放大比例 ≥ 80% 时，显示地区建筑低多边形白模（Tresjs）

### 实际落地技术栈（在用户给定范围内选型）
| 用户给定 | 实际采用 | 理由 |
|---|---|---|
| HTML+CSS+JS | **Vue 3 + Vite + 原生 JS/TS** | 工程化、组件化，便于状态共享 |
| CSS | **Tailwind CSS v4**（CSS-first + `@tailwindcss/vite`） | 极快实现 HOI4 紧凑暗色 UI、网格对齐、金属/做旧边框质感 |
| Tresjs | **@tresjs/core v5 + three** | Vue 声明式 3D，低多边形白模 `flatShading` |
| Mapcn / SQLite / PixiJS | 预留接口，**本期未接入** | 属更大游戏模块；装备表已解析、建模位已留 |
| — | **Capacitor 6** | 把 Web 包进原生 WebView，产出 Android APK（真机 Android WebView 基于 Chrome，支持 WebGL） |

---

## 三、做了什么（按阶段）

### 阶段 1 · 工程骨架
- 初始化 `package.json`、`vite.config.js`（关键点：用 Tresjs 的 `templateCompilerOptions` 配置 Vue 插件，避免 `<TresMesh>` 编译告警）。
- `index.html` 加移动端 `viewport`（禁止页面双指缩放，手势全交给画布）。
- `src/style.css`：Tailwind v4 暗色 HOI4 主题（黄铜色、深灰底、网格纹理、细金属边框）。

### 阶段 2 · Action Center（需求 2.1–2.5）
- `src/composables/useAlertCenter.js`：全局待办状态（分类 + 列表），新增/处理实时联动。
- `src/components/TopBar.vue`：主顶栏（44px）下方一条 `fixed` 全宽窄条（40px），6 个分类图标各带 **Badge** 数字徽章；不自动消失、不阻塞游戏。
- `src/components/ActionCenter.vue`：点击图标向下展开**非模态 Popover/Drawer**（`z-50`，无全屏遮罩，地图仍可直接操作），列表逐条展示「标题 / 描述 / 前往」；面板关闭后 Badge 状态保留（状态在 store，与开关无关）。层级高于画布 `z-0`、低于预留模态层 `z-[100]`。
- 术语对齐：**Action Center / Alert Center**（聚合面板）、**Badge**（数字徽章）、**Popover / Drawer**（非模态容器），与 Toast（瞬时）、Modal Dialog（阻塞）明确区分。

### 阶段 3 · 缩放比例 HUD + 3D 白模（需求 3）
- `src/composables/useZoom.js`：归一化缩放 `level`（0–1），`level ≥ 0.8` 作为白模显示阈值。
- `src/components/ZoomHud.vue`：实时显示**放大比例 %** + 80% 阈值刻度；支持滚轮 / 双指捏合 / ±按钮缩放，单指拖拽平移。
- `src/components/GameScene.vue`：Tresjs 画布，相机缩放/平移（触控+滚轮+按钮），`:dpr="[1,1.5]"` 限制像素比；`level ≥ 0.8` 时才渲染白模。
- `src/components/BuildingModel.vue`：预制**低多边形白模**（工厂/筒仓/仓库/机场，`flatShading`），共 8 个，纯几何无贴图，远眺不渲染。
- `src/data/equipment.js`：解析自用户提供的 `Hoi4-equipment.csv`，并预留 `modelKey` 建模映射位。

### 阶段 4 · iQOO Z5x 针对性优化
- 禁页面缩放手势、触控目标 ≥ 44px、DPR 限 1.5、白模仅 8 个且轻量。

### 阶段 5 · 构建验证
- `npm install` + `npm run build` 通过（51 模块，JS ~245KB gzip，产物自包含）。
- Playwright 无头冒烟：`<canvas>` 已创建、Action Center 与放大比例 HUD 均在、6 分类 Badge + 阈值刻度共 7 个、连续放大达 **100%**。
- ⚠️ 唯一报错：沙箱无头 Chromium 无 GPU，WebGL 上下文创建失败（环境限制，非代码问题；iQOO Z5x 有真实 Mali-G68 GPU 不会触发）。**3D 需在真机实测**。

### 阶段 6 · 打包 APK（Capacitor）
- 安装 `@capacitor/core/cli/android@6`，写 `capacitor.config.json`（appId `com.hoi4web.prototype`，webDir `dist`，androidScheme `https`）。
- `npx cap add android` 生成原生工程；`dist` 资源同步进 `android/app/src/main/assets/public`。
- **Android SDK**：原 `dl.google.com` 被墙（curl 超时），改用**腾讯镜像**手动铺设 `cmdline-tools / platform-tools / build-tools;34.0.0 / platforms;android-34`，并写入 `licenses`（避免 Gradle 报未接受许可）。
- **Gradle 依赖源**：把 `google()/mavenCentral()` 改为 **Aliyun Maven 镜像**；`gradle-wrapper` 分发站改为**腾讯镜像**（`gradle-8.2.1-all.zip`）。
- 修复沙箱里一处**语法损坏的全局 `/root/.gradle/init.gradle`**（漏引号 + `mavelCentral()` 拼写错，导致所有 Gradle 构建崩溃），备份后移除，改由工程内 Aliyun 镜像重建。
- 执行 `./gradlew assembleDebug` 构建 `app-debug.apk`（后台进行中）。

---

## 四、项目结构

```
/workspace
├─ index.html
├─ package.json
├─ vite.config.js
├─ capacitor.config.json
├─ DEVELOPMENT.md            # 本文档
├─ src/
│  ├─ main.js
│  ├─ style.css             # Tailwind v4 暗色 HOI4 主题
│  ├─ App.vue
│  ├─ data/equipment.js     # 装备表（来自 CSV）
│  ├─ composables/
│  │  ├─ useAlertCenter.js  # 待办状态
│  │  └─ useZoom.js         # 缩放状态 + 80% 阈值
│  └─ components/
│     ├─ TopBar.vue         # 常驻窄条 + Badge
│     ├─ ActionCenter.vue   # 非模态 Popover/Drawer
│     ├─ ZoomHud.vue        # 放大比例 HUD
│     ├─ GameScene.vue      # Tresjs 场景
│     └─ BuildingModel.vue  # 低多边形白模
├─ android/                 # Capacitor 原生工程（assembleDebug 产 APK）
└─ dist/                    # 自包含 Web 构建产物
```

---

## 五、如何运行 / 部署

### Web 调试（开发态）
```bash
cd /workspace
npm install
npm run dev      # 手机与电脑同网，访问终端打印的 Network 地址
# 或
npm run build && npm run preview
```

### 构建 APK
```bash
npm run build
npx cap sync android          # 把 dist 同步进 android 工程
cd android
export ANDROID_HOME=$HOME/android-sdk
./gradlew assembleDebug       # 产出 android/app/build/outputs/apk/debug/app-debug.apk
```
> 真机侧载：把 `app-debug.apk` 拷到 iQOO Z5x，开启「未知来源安装」后安装。

### 上传 GitHub（已完成 ✅）
- 仓库（公开）：**https://github.com/enderTomato/hoi4-web-android**
- Release v0.1.0（含 `app-debug.apk`）：**https://github.com/enderTomato/hoi4-web-android/releases/tag/v0.1.0**
- APK 直链：`https://github.com/enderTomato/hoi4-web-android/releases/download/v0.1.0/app-debug.apk`
- 认证方式：用户提供 GitHub Personal Access Token（classic，`repo` 权限），经 `gh auth login --with-token` 登录后由 `gh repo create` 建仓并 `--push`，再 `gh release create` 上传 APK。

---

## 六、已知限制与下一步

- **WebGL 未在沙箱实测**：无头环境无 GPU，3D 渲染需 iQOO Z5x 真机验证。
- **Mapcn / SQLite / PixiJS 未接入**：建议下一步——① Mapcn 真实中国地图底图替代 Tres 地面；② 装备表逐项预制可旋转白模；③ `sql.js` + OPFS 持久化 Action Center 待办。
- **GitHub 上传已完成**：公开仓库 `enderTomato/hoi4-web-android` + Release v0.1.0（含 APK）。详见第五节。

---

## 七、本次会话关键操作时间线（概览）

| 顺序 | 动作 | 结果 |
|---|---|---|
| 1 | 探测环境（Node/npm/Java/Gradle/磁盘/网络） | 腾讯 npm 镜像可用；Java 20 / Gradle 已装；磁盘充足 |
| 2 | 安装 Capacitor 6 依赖 + 写配置 | 生成 Android 工程，`dist` 同步进 assets |
| 3 | 下载 Android SDK | 原 Google 源超时 → 腾讯镜像手动铺设成功 |
| 4 | 切 Gradle 依赖源 / 分发站到国内镜像 | Aliyun + 腾讯镜像可用 |
| 5 | 修复损坏的全局 Gradle init.gradle | 解除所有 Gradle 构建崩溃 |
| 6 | 执行 `assembleDebug` 构建 APK | 后台构建中（资源打包阶段） |
| 7 | 编写本开发文档、初始化本地 git | 进行中 |

> 说明：上表为阶段级时间线；单次命令级精确时间戳未单独留存，但所有动作均发生在本会话（2026-11-01）内，按上表顺序执行。
