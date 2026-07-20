## Why

当前项目已经具备基础单元测试，但对游戏流程、输入时序、状态恢复、页面装配等高风险路径覆盖不足。为了达到可发布标准，需要建立一套覆盖核心玩法、关键副作用与回归路径的自动化测试体系，并用测试驱动修复现存缺陷。

## What Changes

- 为现有 Vitest 体系补齐面向发布的自动化测试清单，覆盖 domain、state persistence、game controller、input scheduler、keyboard/visibility 绑定以及关键 UI smoke 测试。
- 新增 jsdom + React Testing Library 测试能力，用于组件与页面级装配验证。
- 为测试引入必要的 mock / fake timers / store reset helper，保证定时器、localStorage、DOM 事件与浏览器能力可重复验证。
- 执行完整自动化测试并根据失败结果修复项目 bug，直到测试通过且主要功能链路达到发布质量。

## Capabilities

### New Capabilities

- `automated-test-suite`: 定义本项目发布前必须具备的自动化测试覆盖范围、执行标准与回归验收要求

### Modified Capabilities

- （无：本次不修改既有产品行为 spec，只新增测试能力要求）

## Impact

- **代码**：`src/**` 中的 domain / state / game / input / components 可能因测试暴露问题而修复
- **依赖**：新增测试相关依赖（jsdom、React Testing Library 等）
- **工具链**：Vitest 配置可能扩展；测试脚本与辅助工具将补全
- **质量门禁**：自动化测试将成为发布前必经步骤
