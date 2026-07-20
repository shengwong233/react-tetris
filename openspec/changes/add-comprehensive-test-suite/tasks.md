## 1. Test Infrastructure

- [x] 1.1 为组件测试补充 jsdom / React Testing Library 依赖与配置
- [x] 1.2 添加测试辅助工具（store reset、浏览器能力 mock、定时器控制）

## 2. Domain & Persistence

- [x] 2.1 补强 `block` / `matrix` / `score` / `startMatrix` 纯逻辑单元测试
- [x] 2.2 补强 `persist` 的 localStorage、编解码、恢复清洗测试

## 3. Game Flow & Input

- [x] 3.1 为 `game/controller.ts` 增加开始、自动下落、锁定、消行、暂停、焦点、结束流程测试
- [x] 3.2 为 `input/event.ts` 增加连发、once、clearAll、互斥定时器测试
- [x] 3.3 为 `input/keyboard.ts` 与 `input/visibility.ts` 增加事件绑定与分发测试

## 4. UI Smoke Tests

- [x] 4.1 为关键表现组件补充 smoke 测试（如 `Number`、`Next`）
- [x] 4.2 为 `App` 增加启动/恢复逻辑 smoke 测试

## 5. Verification & Bug Fixes

- [x] 5.1 运行完整自动化测试并修复新增失败项
- [x] 5.2 运行类型检查与生产构建验证，达到发布标准
