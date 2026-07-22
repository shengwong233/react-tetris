# Tauri 2 Android 打包说明

本文档描述当前仓库的 Android 环境准备、调试、签名、APK/AAB 打包与安装流程。  
当前项目基于 **Tauri 2 + React 19 + TypeScript + Vite**，Android 与桌面端共用同一套前端产物。

## 1. 仓库内相关文件

- `src-tauri/tauri.conf.json`
  - Tauri 主配置
- `src-tauri/tauri.android.conf.json`
  - Android 覆盖配置
- `src-tauri/gen/android/`
  - 生成后的 Android Gradle 工程
- `src-tauri/gen/android/app/build.gradle.kts`
  - Android app 模块配置，已接入 release signing 读取逻辑
- `src-tauri/gen/android/keystore.properties.example`
  - Android release 签名配置模板
- `package.json`
  - Android 相关脚本

## 2. 常用命令

```bash
pnpm tauri:android:init
pnpm tauri:android:dev
pnpm tauri:android:build:apk
pnpm tauri:android:build:aab
```

## 3. 环境要求

建议版本：

- Node.js: `24.x`
- pnpm: `11.x`
- Rust: stable
- JDK: `17`
- Android SDK Platform: `36.1`
- Android Build Tools: `36.0.0`
- Android NDK: 已安装任一可用版本

先确认 Node 与 pnpm：

```bash
node -v
pnpm -v
```

安装依赖：

```bash
pnpm install
```

## 4. Rust 与 Android targets

如果还没安装 Rust：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

安装 Android targets：

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

检查：

```bash
rustup target list --installed
cargo -V
```

## 5. Java / JDK

Android 构建建议固定使用 **JDK 17**。

macOS 上可以使用：

```bash
brew install openjdk@17
```

或直接使用 Android Studio 自带 JBR，只要版本兼容 JDK 17 即可。

在 `~/.zshrc` 中配置：

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```

检查：

```bash
source ~/.zshrc
java -version
echo $JAVA_HOME
```

如果机器上同时装了 Java 8 / 21，优先确保 Android 打包时的 `JAVA_HOME` 指向 JDK 17。

## 6. Android Studio / SDK / NDK

推荐通过 Android Studio 的 SDK Manager 安装组件，避免命令行单独拉取时的镜像或 TLS 问题。

建议至少安装：

- Android SDK Platform `36.1`
- Android SDK Build-Tools `36.0.0`
- Android SDK Command-line Tools
- Android SDK Platform-Tools
- Android NDK

环境变量示例：

```bash
export ANDROID_HOME="$HOME/Documents/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export NDK_HOME="$ANDROID_HOME/ndk/<你的NDK版本目录>"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

如果你的 SDK 不在 `~/Documents/Android/sdk`，请改成自己的实际路径。

检查：

```bash
source ~/.zshrc
adb version
sdkmanager --list
```

## 7. 初始化 Android 工程

在仓库根目录执行：

```bash
pnpm tauri:android:init
```

执行成功后会生成：

`src-tauri/gen/android/`

这个目录就是实际参与 Android 构建的 Gradle 工程。

## 8. 当前仓库里的 Android 工程约定

当前仓库已经额外处理过以下内容：

- Android Gradle Plugin 已升级到支持 `SDK 36.1` 的版本
- `compileSdk` 已改为 `36 + minorApiLevel = 1`
- `buildToolsVersion` 已显式指定为 `36.0.0`
- Android 仓库源已补充镜像优先、官方兜底的配置
- `release signing` 已接入 `keystore.properties` 自动读取

因此，正常情况下你不需要再手工改 Gradle 才能开始打包。

## 9. 本地调试

先确认真机已打开：

- 开发者选项
- USB 调试

检查设备：

```bash
adb devices
```

如果设备已连接，可启动 Android 调试：

```bash
pnpm tauri:android:dev
```

## 10. 生成 release keystore

建议把 keystore 放在你自己的安全目录，不要提交到仓库中。

例如先创建目录：

```bash
mkdir -p ~/keys
```

然后生成签名文件：

```bash
keytool -genkeypair \
  -v \
  -keystore ~/keys/react-tetris-release.jks \
  -alias react-tetris \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

注意：

- 国家代码 `C` 应填写两位字母，例如 `CN`
- `keyAlias` 建议保持为 `react-tetris`
- 如果你没有单独设置 `key password`，它通常与 `store password` 相同

## 11. 配置 Android release signing

本项目已经在 `src-tauri/gen/android/app/build.gradle.kts` 中接入了自动签名逻辑。

你只需要创建：

`src-tauri/gen/android/keystore.properties`

可以参考：

`src-tauri/gen/android/keystore.properties.example`

内容如下：

```properties
storeFile=/Users/yourname/keys/react-tetris-release.jks
storePassword=你的store密码
keyAlias=react-tetris
keyPassword=你的key密码
```

字段说明：

- `storeFile`
  - `.jks` 文件绝对路径
- `storePassword`
  - keystore 文件密码
- `keyAlias`
  - 创建 keystore 时使用的 alias
- `keyPassword`
  - alias 对应私钥密码

该文件已被 `src-tauri/gen/android/.gitignore` 忽略。

## 12. 构建 APK / AAB

### 构建 APK

```bash
pnpm tauri:android:build:apk
```

### 构建 AAB

```bash
pnpm tauri:android:build:aab
```

## 13. 构建产物位置

### 未签名 release APK

如果没有配置 signing，常见产物在：

`src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`

这个包通常**不能直接安装**。在部分系统或安装器上，可能会报：

- `packageInfo is null`
- 解析包失败
- 安装失败

### 已签名 release APK

配置好 `keystore.properties` 后重新打包，常见产物仍在同目录，但文件名通常不再带 `unsigned`。

### debug APK

如果你只是想先验证能否安装，可优先构建 debug 包：

```bash
cd src-tauri/gen/android
./gradlew assembleDebug
```

常见位置：

`src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk`

## 14. 安装到真机

安装 APK：

```bash
adb install -r /path/to/app.apk
```

如果是 release 包，建议优先使用已签名 APK。

对于小米 / Redmi / HyperOS / MIUI 设备，还建议检查：

- 是否允许 USB 安装
- 是否允许该电脑的 USB 调试授权
- 是否存在系统安装拦截

## 15. 常见问题

### 1. `icon ... is not RGBA`

说明 Tauri 读取到的 PNG 图标不是标准 RGBA 格式。  
本仓库的 `public/icon.png` 已处理为可用格式，如果再次替换图标，请确保仍为 RGBA PNG。

### 2. `Could not resolve com.android.tools.build:gradle`

通常是 Android 仓库网络、TLS 或镜像问题。  
当前仓库的 `src-tauri/gen/android/` 已补充镜像优先配置；如果仍失败，优先检查本机网络与 SDK Manager。

### 3. `Failed to find Platform SDK with path: platforms;android-36`

说明本机 SDK 版本与工程目标版本不匹配。  
当前仓库已经切到 `36.1` 兼容写法，正常应安装 Android SDK Platform `36.1`。

### 4. `packageInfo is null`

通常不是代码问题，而是你安装了**未签名 release APK**。  
请先配置 `keystore.properties` 再重新打包，或直接安装 `debug APK` 进行验证。

### 5. `JAVA_HOME` 混乱

如果系统同时存在 Java 8 / 17 / 21，Gradle 可能读到错误版本。  
优先保证：

```bash
echo $JAVA_HOME
java -version
```

都落在 JDK 17。

## 16. 发布前建议检查

建议至少确认：

1. `pnpm tauri:android:build:apk` 能稳定成功
2. 真机能正常安装 APK
3. 首屏无白屏 / 黑屏卡死
4. 触控按钮可正常操作
5. 暂停、重开、音效开关正常
6. 切后台再回来不会直接崩溃或丢状态
7. 声音播放符合预期
8. 长时间运行无明显卡顿和输入延迟

更完整的人工检查项请参考根目录 `QA.md`。
