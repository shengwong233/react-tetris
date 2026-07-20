## Context

原项目是 React 15 + Redux + Immutable + Webpack 1 的掌机风俄罗斯方块。状态可持久化；局内流程（自动下落定时器）在 `control/states.js` 模块变量中，不进 Redux；输入经 `control/todo` + `unit/event` 连发；UI 组件负责消行/结束/Logo 动画并回调流程层。

目标栈：React 19 + TypeScript + Jotai + UnoCSS + Vite + pnpm。约束：**玩法数值、键位语义、动画时序、存档格式与音效切片与原版一致**。

## Goals / Non-Goals

**Goals:**

- 用现代栈完整重实现原版全部功能与体验细节。
- 领域规则纯函数化、可单测；流程/输入/表现分层清晰。
- Jotai 仅存可序列化「事实」；定时器与非可序列化副作用留在引擎层。
- Vite + pnpm 提供可维护的开发与构建体验。

**Non-Goals:**

- 不新增玩法（Hold、Ghost、7-bag、联机、排行榜等）。
- 不追求像素级 CSS 重构美学升级；以功能与视觉 parity 为准。
- 不兼容旧 Webpack 开发工作流；不做渐进式双栈并行长期共存。
- 不引入服务端或后端 API。

## Decisions

### 1. 目录分层：domain / game / input / state / audio / ui

```
src/
  domain/     # Block、want、isClear、isOver、计分、起始垃圾行（纯 TS）
  state/      # Jotai atoms + persist
  game/       # GameController：start/auto/nextAround/clear/over/pause/focus
  input/      # event 连发 + 物理/虚拟键 → 调用 game + 写 keyboard atoms
  audio/      # Web Audio 切片
  i18n/       # 语言与文案
  components/ # 表现层
  App.tsx
```

**理由：** 对齐原版「Redux 存事实、states 管流程、todo 管输入、组件管动画」的成功边界，避免把定时器塞进 atom。  
**备选：** 把流程也写成 Jotai + jotai-effect —— 否决，因 `fallInterval` 与左右 delay 重算更适合命令式控制器。

### 2. 状态：Jotai atoms，数据用可序列化结构

- 棋盘：`number[][]`（0/1；渲染层可临时用 2）。
- 当前块：序列化形态 `{ type, shape, xy, rotateIndex, timeStamp } | null`；操作时通过 domain 工厂生成下一状态。
- 字段对齐原 store：`pause/music/matrix/next/cur/startLines/max/points/speedStart/speedRun/lock/clearLines/reset/drop/keyboard/focus`。
- `keyboard.*` 仅驱动按钮高亮，不承载游戏规则。

**理由：** 去掉 Immutable 依赖，便于 localStorage `JSON` 往返与 TypeScript 建模。  
**备选：** 继续用 Immutable —— 否决，与现代化目标冲突且 Jotai 无此必要。

### 3. GameController 单例（模块级）持有 timer

- 对外暴露与原 `states` 等价 API。
- 通过 `getDefaultStore()` 或注入的 jotai store 读写 atoms。
- Matrix 消行/结束动画完成后调用 `clearLines` / `overEnd`（与原版回调方向一致）。

**理由：** 最小行为偏差迁移路径。  
**备选：** React `useEffect` 驱动下落 —— 否决，易与按键 delay、lock、焦点交错产生时序漂移。

### 4. 样式：UnoCSS + 少量专用 CSS

- 布局、间距、颜色 token 优先 UnoCSS。
- 数字/图标精灵、按钮立体阴影、矩阵格 `c`/`d` 等复杂视觉保留独立 CSS（或 CSS Modules）。

**理由：** 原版大量依赖 sprite `background-position` 与绝对定位机身，强行 utility 化收益低。

### 5. 迁移策略：绿地重写，对照 legacy

- 在仓库内新建 Vite 应用结构；原 `src` 可暂移至 `legacy/` 作对照，验收后删除。
- 常量（`speeds/delays/clearPoints/origin/音效切片时间码/StorageKey`）从 legacy 逐字移植。

**理由：** Webpack 1 → Vite 增量改造成本高于重写；对照目录降低 parity 风险。

### 6. 测试策略

- `domain` 与计分/消行/碰撞优先单元测试（Vitest）。
- 流程与输入以手工对照清单 + 关键时序用例（可选）验收。

## Risks / Trade-offs

- **[Risk] 时序细微偏差（左右 delay、消行闪烁、硬降 index-2）** → Mitigation：对照 legacy 移植魔法数；Phase 验收清单逐项手测。
- **[Risk] 存档不兼容若序列化形状改变** → Mitigation：对外仍写 `REACT_TETRIS`，payload 字段与原 `toJS()` 语义对齐；必要时读路径兼容旧 JSON。
- **[Risk] Web Audio 在非 http(s) 或无 API 环境失败** → Mitigation：与原版一致 graceful degrade，强制 `music=false`。
- **[Risk] UnoCSS 与精灵 CSS 混用风格分裂** → Mitigation：约定「机身像素区用 CSS，外围布局用 Uno」。
- **[Trade-off] 绿地重写短期 diff 巨大** → 换取清晰架构与可维护性，用 `legacy/` 对照降低功能回归。

## Migration Plan

1. 初始化 Vite/TS/Jotai/UnoCSS/pnpm，保留 `legacy/` 对照。
2. 实现 domain → state → game → input → audio → UI → i18n。
3. 功能对照验收通过后删除 `legacy/` 与旧 Webpack 配置。
4. 更新 README 脚本与技术说明。
5. 回滚：若未删除 legacy，可切回旧入口；删除后依赖 git 历史恢复。

## Open Questions

- 构建产物是否继续输出到 `docs/`（GitHub Pages）还是 Vite 默认 `dist/`？（默认：`dist/`，Pages 工作流另配。）
- 是否在首版加入 Vitest CI？（默认：本地可跑单测；CI 可选后续再加。）
