## Why

现有项目基于 React 15 + Redux + Immutable + Webpack 1，栈已过时，维护与扩展成本高。需要在**玩法与体验零偏差**的前提下，用现代前端栈完整重写，便于后续开发与类型安全演进。

## What Changes

- **BREAKING**：以 Vite + pnpm 取代 Webpack；依赖与构建脚本全面替换，旧入口/打包方式不再保留。
- **BREAKING**：以 React 19 + TypeScript + Jotai 取代 React 15 + Redux + Immutable；状态模型从 Immutable Map 改为可序列化的 Jotai atoms。
- **BREAKING**：样式以 UnoCSS 为主（复杂像素/精灵区域可保留少量 CSS），移除 Less + CSS Modules 旧方案。
- 按领域拆分：纯游戏规则（domain）、局内流程引擎、输入层、音效、持久化、UI 表现与 i18n。
- **行为兼容**：完整复刻原版功能——七种方块、碰撞/旋转、软降/硬降、消行与结束动画、速度与计分、待机调参、暂停/重置、双端操作、Web Audio 切片音效、localStorage 断点续玩、`?lan=` 多语言、响应式缩放。
- 删除旧 Redux/Immutable/Webpack 相关实现与死代码（实现阶段完成迁移后）。

## Capabilities

### New Capabilities

- `tetris-core`：方块形状/旋转、棋盘矩阵、碰撞检测、锁定、消行、计分与速度升级等纯规则。
- `game-flow`：开始/自动下落/下一块/暂停/焦点/消行回调/结束动画等局内流程与定时器编排。
- `player-input`：物理键盘与屏幕按钮、连发节奏、Idle 调参与 Playing 操作语义。
- `state-persistence`：全量游戏状态的 localStorage 读写、恢复续玩与 lock 时跳过写入。
- `sound-effects`：基于 Web Audio 的单文件切片音效及开关。
- `game-presentation`：掌机风 UI（矩阵/侧栏/按键/Logo/装饰）、响应式 scale、消行/结束/硬降视觉反馈。
- `localization`：`?lan=` 语言选择与界面文案（cn/en/fr/fa）。

### Modified Capabilities

- （无：仓库尚无既有 OpenSpec specs）

## Impact

- **代码**：几乎全部 `src/` 重写；`control/`、`reducers/`、`actions/`、`store/`、旧 components 将被新结构替代。
- **依赖**：移除 `redux` / `react-redux` / `immutable` / `redux-immutable` 及 Webpack 1 工具链；新增 `react@19`、`jotai`、`vite`、`typescript`、`unocss` 等。
- **构建/部署**：`pnpm dev` / `pnpm build`；产物目录与静态资源路径需按 Vite 约定调整（含 `music.mp3`、精灵图）。
- **体验契约**：对外玩法、键位、数值、动画时序、存档 key（`REACT_TETRIS`）与音效切片保持与原版一致，避免「看起来像新游戏」。
