## Context

项目当前已经有少量针对 domain 和 persistence 的 Vitest 单元测试，但仍缺少对以下高风险区域的自动化覆盖：

- `game/controller.ts` 的局内状态机与定时器调度
- `input/event.ts` 与 `input/keyboard.ts` 的输入节奏与事件绑定
- `input/visibility.ts` 的页面焦点切换逻辑
- 关键 UI 组件与 `App` 装配的 smoke 验证

由于该项目包含定时器、localStorage、Web Audio、DOM 事件、Jotai 单例 store 等副作用，测试方案必须同时覆盖“纯函数逻辑”和“命令式流程逻辑”。

## Goals / Non-Goals

**Goals:**

- 为核心玩法链路建立稳定、可重复执行的自动化测试
- 在 Vitest 下覆盖关键副作用与时间相关行为
- 使用测试结果驱动修复缺陷，提升到可发布状态
- 让后续改动可以通过本地与 CI 自动回归验证

**Non-Goals:**

- 不追求 100% 覆盖率数字
- 不引入端到端浏览器自动化（如 Playwright）
- 不为装饰性视觉细节编写低价值快照测试

## Decisions

### 1. 测试分层

- **domain/state**：继续使用 node 环境的纯单元测试
- **game/input**：使用 fake timers + store reset + mock 副作用
- **components/App**：使用 jsdom + React Testing Library 做 smoke / interaction 测试

**理由：** 让测试成本与收益匹配，优先覆盖最容易回归且最影响发布质量的部分。

### 2. 单例 store 的测试隔离

- 在测试文件中实现统一 `resetStore()` helper，直接重置 atoms
- 每个测试独立初始化关键 atoms，避免前一个用例污染后一个

**理由：** 当前 `gameStore` 为单例，若不手动重置会造成串测。

### 3. 时间相关逻辑统一使用 fake timers

- 对 `event` 连发、`controller.auto`、`nextAround` 的 100ms 生成下一块、`pause`/`focus` 相关行为统一用 `vi.useFakeTimers()`

**理由：** 避免真实时间造成 flaky。

### 4. 浏览器能力使用显式 mock

- localStorage / AudioContext / XMLHttpRequest / document.hidden / resize 等由测试内 stub

**理由：** 让测试在 Node/jsdom 下稳定运行，不依赖真实浏览器实现。

### 5. UI 测试只做高价值 smoke

- 只验证文本、基本渲染、关键状态切换与启动副作用
- 不做大面积 DOM 快照

**理由：** 该项目大量绝对定位与精灵样式，快照噪音高、维护价值低。

## Risks / Trade-offs

- **[Risk] 单例模块缓存导致 mock 顺序敏感** → Mitigation：对需要隔离的模块使用 `vi.resetModules()` / 文件内显式重置
- **[Risk] 定时器测试与真实实现耦合较强** → Mitigation：只断言关键行为与状态变化，不断言无意义内部细节
- **[Risk] UI smoke 测试可能被无关样式改动影响** → Mitigation：断言文本/结构/行为，不依赖 class 数量或快照
- **[Trade-off] 不引入 E2E** → 通过强化 controller/input/App smoke 测试覆盖大部分产品关键路径

## Migration Plan

1. 先补 `automated-test-suite` OpenSpec 清单
2. 安装并配置 jsdom / React Testing Library
3. 按 domain/state → game/input → components/App 顺序补测
4. 跑完整测试并修复失败项
5. 验证 `pnpm test`、`pnpm exec tsc --noEmit`、`pnpm build`

## Open Questions

- 是否需要后续追加 Playwright 做真浏览器回归？当前结论：不是本次发布前阻塞项
