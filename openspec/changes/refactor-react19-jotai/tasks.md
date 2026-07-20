## 1. Scaffold

- [x] 1.1 将现有 `src` 与 Webpack 配置移至 `legacy/` 对照目录
- [x] 1.2 用 pnpm 初始化 Vite + React 19 + TypeScript 工程
- [x] 1.3 接入 Jotai、UnoCSS、Vitest；配置路径别名与 `strict` TS
- [x] 1.4 配置静态资源（`music.mp3`、精灵图）与 `dev`/`build`/`preview` 脚本
- [x] 1.5 搭建 `src/{domain,state,game,input,audio,i18n,components}` 目录骨架

## 2. Domain（tetris-core）

- [x] 2.1 移植常量：`blockShape`、`origin`、`speeds`、`delays`、`clearPoints`、`eachLines`、`maxPoint`、`StorageKey`
- [x] 2.2 实现 Block：spawn、rotate、fall、left、right（TypeScript）
- [x] 2.3 实现 `want`、`isClear`、`isOver`、`getNextType`、`lockPiece`、`clearLinesOnMatrix`
- [x] 2.4 实现计分与速度升级纯函数、`getStartMatrix`
- [x] 2.5 为碰撞、旋转、消行、计分、起始行编写 Vitest 单测

## 3. State（Jotai + persistence）

- [x] 3.1 定义 `GameState` / `BlockData` / `KeyboardState` 类型
- [x] 3.2 创建全部游戏 atoms（含 `keyboard` 子字段）
- [x] 3.3 实现 localStorage 编解码与 hydrate（兼容 legacy payload）
- [x] 3.4 订阅写入：`lock===true` 时跳过；恢复时重建 `cur`
- [x] 3.5 启动引导：有局中记录则续玩，否则走 over/idle 启动路径

## 4. Game flow

- [x] 4.1 实现 `GameController`：`start` / `auto` / `nextAround` / `dispatchPoints`
- [x] 4.2 实现 `clearLines`、`pause`、`focus`、`overStart`、`overEnd`
- [x] 4.3 对齐左右移动 delay 与 `auto(remain)` 重定时
- [x] 4.4 对齐 lock、100ms 出下一块、顶行 game over 判定

## 5. Player input

- [x] 5.1 移植 `event` 连发（begin/interval/once、互斥清定时器）
- [x] 5.2 绑定物理键盘映射与 `keydownActive` 防原生连发
- [x] 5.3 实现 Playing 动作：left/right/down/rotate/space/p/r/s
- [x] 5.4 实现 Idle 调参：speedStart、startLines、开始键
- [x] 5.5 实现屏幕按钮 touch/mouse 双通道且防双触发
- [x] 5.6 接入 `visibilitychange` → focus

## 6. Audio

- [x] 6.1 实现 Web Audio 加载与切片播放（start/clear/fall/gameover/rotate/move）
- [x] 6.2 尊重 music 开关；实现 start 音一次性 `killStart`
- [x] 6.3 无 AudioContext / 非 http(s) 时 degrade 并强制 music off

## 7. Presentation + i18n

- [x] 7.1 实现 App 响应式 scale（640×960）与 filling
- [x] 7.2 实现 Matrix：叠加 cur、消行闪烁、Game Over 逐行动画并回调引擎
- [x] 7.3 实现 Next、Number（含时钟）、Point 轮播、Pause/Music 指示灯
- [x] 7.4 实现 Logo 待机动画、Decorate、Keyboard/Button、硬降 drop 反馈
- [x] 7.5 实现 Guide（桌面说明/GitHub/二维码）
- [x] 7.6 接入 `?lan=` 与 i18n 文案（cn/en/fr/fa），设置 document.title
- [x] 7.7 用 UnoCSS + 少量 CSS 还原机身/像素/精灵视觉

## 8. Cleanup & acceptance

- [x] 8.1 按 specs 做完整手测对照（玩法、存档、音效、双端、多语言）
- [x] 8.2 删除 `legacy/` 与旧 Webpack/npm 配置；更新 README
- [x] 8.3 确认 `pnpm build` 成功，产物可预览
