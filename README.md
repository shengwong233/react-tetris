# React Tetris (TypeScript)

用 **React 19 + TypeScript + Jotai + UnoCSS + Vite + pnpm** 重写的掌机风俄罗斯方块。玩法与 [chvin/react-tetris](https://github.com/chvin/react-tetris) 原版对齐。

## 开发

```bash
pnpm install
pnpm dev
```

## 构建 / 预览

```bash
pnpm build
pnpm preview
```

## 测试 / 校验 / 格式化

```bash
pnpm test
pnpm lint        # oxlint
pnpm lint:fix   # 自动修复
pnpm fmt         # oxfmt
pnpm fmt:check
```

样式使用 Sass（`src/styles/*.scss`，Vite + `sass-embedded` 编译）。精灵图位于 `src/assets/`；首屏 loading 仍使用 `public/loader.css`（与 `loader.scss` 保持同步）。

## 操作

| 键    | 游戏中   | 未开始           |
| ----- | -------- | ---------------- |
| ← →   | 左右移动 | 调整起始速度 1–6 |
| ↑     | 旋转     | 增加起始行       |
| ↓     | 软降     | 减少起始行       |
| Space | 硬降     | 开始             |
| P     | 暂停     | 开始             |
| R     | 重玩     | 开始             |
| S     | 音效开关 | 音效开关         |

多语言：`?lan=cn|en|fr|fa`（默认 `cn`）。

## 技术结构

```
src/
  domain/      # 纯规则：方块、碰撞、消行、计分
  state/       # Jotai atoms + localStorage 持久化
  game/        # 局内流程与自动下落定时器
  input/       # 键盘/触控与连发
  audio/       # Web Audio 切片音效
  i18n/        # 文案
  components/  # UI
```

状态持久化 key：`REACT_TETRIS`。
