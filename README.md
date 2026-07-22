# React Tetris (TypeScript + Tauri 2)

一个基于 **React 19 + TypeScript + Jotai + Vite + Sass + Tauri 2** 的掌机风俄罗斯方块项目。  
同一套前端代码可同时运行在：

- Web 浏览器
- Tauri 桌面端
- Tauri Android 移动端

玩法与经典掌机风格保持一致，支持键盘与触控、状态持久化、多语言和音效。

## 功能特性

- 7 种标准方块：`I / J / L / O / S / T / Z`
- 桌面键盘与移动端虚拟按键共存
- `localStorage` 自动保存当前进度与最高分
- Web Audio 切片音效
- `?lan=cn|en|fr|fa` 多语言切换
- Web / Desktop / Android 共用一套核心逻辑

## 技术栈

- React 19
- TypeScript
- Jotai
- Vite 7
- Sass
- UnoCSS
- Vitest
- Playwright
- Tauri 2

## 快速开始

### 环境要求

- Node.js `24.x`
- pnpm `11.x`

安装依赖：

```bash
pnpm install
```

启动 Web 开发环境：

```bash
pnpm dev
```

默认访问地址通常为 `http://127.0.0.1:5173`。

## 常用命令

### Web

```bash
pnpm dev
pnpm build
pnpm preview
```

### 桌面端

```bash
pnpm tauri:dev
pnpm tauri:build
```

### Android

```bash
pnpm tauri:android:init
pnpm tauri:android:dev
pnpm tauri:android:build:apk
pnpm tauri:android:build:aab
```

### 测试与质量检查

```bash
pnpm test
pnpm test:watch
pnpm e2e
pnpm e2e:headed
pnpm lint
pnpm lint:fix
pnpm fmt
pnpm fmt:check
```

## 操作说明

| 按键      | 游戏中      | 未开始             |
| --------- | ----------- | ------------------ |
| `←` / `→` | 左右移动    | 调整起始速度 `1-6` |
| `↑`       | 旋转        | 增加起始行         |
| `↓`       | 软降        | 减少起始行         |
| `Space`   | 硬降        | 开始游戏           |
| `P`       | 暂停 / 恢复 | 开始游戏           |
| `R`       | 重开        | 开始游戏           |
| `S`       | 音效开关    | 音效开关           |

移动端可使用屏幕上的虚拟按键进行同等操作。

## 项目架构

```text
react-tetris-ts/
├── public/                 # icon、loader.css、music.mp3 等静态资源
├── src/
│   ├── main.tsx            # React 入口，绑定持久化 / 键盘 / 可见性 / E2E hooks
│   ├── App.tsx             # 根布局、缩放、自恢复启动逻辑
│   ├── domain/             # 纯游戏规则：方块、碰撞、矩阵、计分
│   ├── game/               # 对局流程控制与自动下落调度
│   ├── state/              # Jotai atoms、store、localStorage 持久化
│   ├── input/              # 键盘、触控、连发、焦点处理
│   ├── components/         # 界面组件
│   ├── audio/              # Web Audio 音效
│   ├── i18n/               # 多语言文案
│   ├── styles/             # Sass 样式
│   └── test-hooks/         # E2E 辅助钩子
├── e2e/                    # Playwright 用例
├── src-tauri/              # Tauri 2 外壳
│   ├── tauri.conf.json     # 桌面端配置
│   ├── tauri.android.conf.json
│   ├── capabilities/
│   └── gen/android/        # Android 工程（init 后生成）
├── QA.md                   # 手动验收清单
└── TAURI-ANDROID.md        # Android 环境与打包说明
```

## 核心算法与运行机制

### 1. 规则层：`src/domain/`

这一层是纯函数，不依赖 React：

- `block.ts`
  - 创建方块
  - 旋转方块
  - 左右移动 / 下落
- `matrix.ts`
  - 碰撞检测：`want()`
  - 消行检测：`isClear()`
  - 结束检测：`isOver()`
  - 方块锁定到棋盘：`lockPiece()`
- `score.ts`
  - 落地基础分
  - 消行加分
  - 速度等级推进
- `const.ts`
  - 棋盘尺寸：`10 x 20`
  - 速度表：`[800, 650, 500, 370, 250, 160]`
  - 消行得分：`[100, 300, 700, 1500]`

### 2. 流程层：`src/game/controller.ts`

`controller` 负责管理整局游戏节奏：

- 开局与恢复
- 自动下落定时器
- 落地锁定
- 消行动画后的下一块生成
- 暂停 / 恢复
- Game Over / 重开

简化后的流程如下：

1. 从 `nextAtom` 生成当前方块
2. 根据当前速度启动自动下落
3. 每次下落前用 `want()` 判断是否合法
4. 无法继续下落时，用 `lockPiece()` 把方块写入棋盘
5. 用 `isClear()` 检查是否满行
6. 用 `clearLinePoints()` 和 `nextSpeedRun()` 更新分数与等级
7. 用 `isOver()` 判断是否顶行溢出

### 3. 状态层：`src/state/`

项目使用 Jotai 管理状态：

- `atoms.ts` 定义全局状态
- `store.ts` 创建 `gameStore`
- `persist.ts` 负责 `localStorage` 持久化

持久化 key 为 `REACT_TETRIS`。

### 4. 输入层：`src/input/`

- `keyboard.ts`：物理键盘绑定
- `actions.ts`：每个按键的游戏行为
- `event.ts`：长按连发调度
- `visibility.ts`：页面失焦 / 回焦暂停恢复

这意味着桌面端和移动端虽然输入介质不同，但最终都复用同一套动作逻辑。

## 启动链路

### Web

启动流程：

`index.html` -> `src/main.tsx` -> `src/App.tsx`

`src/main.tsx` 会在挂载前完成：

- 样式加载
- i18n 初始化
- 音效初始化
- 状态持久化订阅
- 键盘绑定
- 页面可见性绑定
- E2E hooks 安装

### 桌面端

Tauri Rust 入口：

- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`

桌面开发命令：

```bash
pnpm tauri:dev
```

其链路为：

1. Tauri 先执行 `beforeDevCommand`
2. 内部启动 `pnpm exec vite --host 127.0.0.1 --port 1420`
3. 桌面窗口加载 `http://127.0.0.1:1420`

桌面构建命令：

```bash
pnpm tauri:build
```

其链路为：

1. 执行 `pnpm build`
2. 产出 `dist/`
3. Rust/Tauri 打包成当前平台安装包

常见产物目录通常位于：

`src-tauri/target/release/bundle/`

## Android 打包

Android 相关配置位于：

- `src-tauri/tauri.android.conf.json`
- `src-tauri/gen/android/`

### 1. 初始化 Android 工程

```bash
pnpm tauri:android:init
```

首次执行后会生成：

`src-tauri/gen/android/`

### 2. 调试运行

```bash
pnpm tauri:android:dev
```

需要本机已安装并配置：

- Rust
- Android SDK / NDK
- JDK 17
- `adb`

详细环境准备请看 `TAURI-ANDROID.md`。

### 3. 构建 APK / AAB

```bash
pnpm tauri:android:build:apk
pnpm tauri:android:build:aab
```

常见输出位置：

- 未签名 APK  
  `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`
- 已签名 APK  
  通常位于同目录，文件名不再带 `unsigned`

### 4. 配置 release signing

本项目已经接入 `release signing` 自动读取逻辑。  
你只需要创建：

`src-tauri/gen/android/keystore.properties`

示例模板见：

`src-tauri/gen/android/keystore.properties.example`

格式如下：

```properties
storeFile=/绝对路径/release-keystore.jks
storePassword=你的store密码
keyAlias=react-tetris
keyPassword=你的key密码
```

配置完成后重新执行：

```bash
pnpm tauri:android:build:apk
```

即可得到可安装的已签名 release APK。

## 测试

### 单元与组件测试

Vitest 配置在 `vitest.config.ts`，覆盖：

- `src/domain/block.test.ts`
- `src/domain/matrix.test.ts`
- `src/game/controller.test.ts`
- `src/state/persist.test.ts`
- `src/input/event.test.ts`
- `src/input/keyboard.test.ts`
- `src/input/visibility.test.ts`
- `src/App.test.tsx`
- `src/components/components.test.tsx`

运行：

```bash
pnpm test
```

### E2E

Playwright 配置在 `playwright.config.ts`，默认启动：

`pnpm dev --host 127.0.0.1 --port 4173`

运行：

```bash
pnpm e2e
```

如果需要有界面模式：

```bash
pnpm e2e:headed
```

### 手动验收

发布前建议按 `QA.md` 逐项检查：

- 启动与构建
- 键盘与触控
- 消行 / 计分 / 速度
- 暂停与恢复
- 持久化恢复
- 多语言
- 响应式布局

## 相关文档

- Android 环境与打包：`TAURI-ANDROID.md`
- 发布前人工验收：`QA.md`
