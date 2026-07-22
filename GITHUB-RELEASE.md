# GitHub Release Automation

本仓库已经配置好基于 `tauri-apps/tauri-action` 的 GitHub Actions 工作流：

- 触发方式：推送 `v*` tag
- 构建平台：Windows / macOS / Linux
- 上传方式：自动创建或更新 GitHub Release，并上传安装包资产
- 缓存：
  - `actions/setup-node` 自带 `pnpm` 缓存
  - `Swatinem/rust-cache` 缓存 Cargo 依赖与编译产物

工作流文件：

- `.github/workflows/release.yml`

## 触发方式

当远端收到类似下面的 tag 时：

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions 会自动开始构建并把安装包上传到对应 Release。

## 版本对齐

为了和 `v1.0.0` tag 对齐，当前仓库已同步更新：

- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`

它们现在都使用 `1.0.0`。

## Android 签名 Secrets 约定

当前这个工作流只负责 **桌面端三平台** 自动打包。  
但仓库已经按本地 `src-tauri/gen/android/keystore.properties` 的结构，整理好了适合 GitHub Secrets 的 Android 签名字段约定，便于后续你扩展 Android CI：

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

字段对应关系：

- `ANDROID_STORE_PASSWORD` <- `storePassword`
- `ANDROID_KEY_ALIAS` <- `keyAlias`
- `ANDROID_KEY_PASSWORD` <- `keyPassword`
- `ANDROID_KEYSTORE_BASE64` <- 对 `storeFile` 指向的 `.jks` 文件做 base64 编码

示例命令：

```bash
base64 -i /absolute/path/to/release-keystore.jks
```

注意：

- 不要把 `keystore.properties` 或 `.jks` 文件提交到 GitHub
- 不要把 base64 后的证书内容写入仓库文件
- 这些值应只存放在 GitHub Repository Secrets 中

## 首次使用前建议检查

1. 仓库已推送到 GitHub
2. GitHub Actions 已启用
3. `master` 上已包含 `.github/workflows/release.yml`
4. 远端 tag 名与当前应用版本一致
5. Release 页面权限正常
