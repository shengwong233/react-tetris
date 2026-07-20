# Tauri 2 Android 手动环境清单

当前仓库已经补齐了 Tauri 2 的基础骨架与脚本：

- `src-tauri/` Rust 壳层
- `src-tauri/tauri.conf.json` Tauri 主配置
- `src-tauri/tauri.android.conf.json` Android 覆盖配置
- `package.json` 中的 Tauri / Android 命令脚本

下面这些步骤需要你在本机手动完成。

## 1. Node 与 pnpm

确认版本：

```bash
node -v
pnpm -v
```

建议：

- Node.js: `v24.x`
- pnpm: `11.x`

安装依赖：

```bash
pnpm install
```

## 2. Rust

如果未安装 Rust：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

安装 Android targets：

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

校验：

```bash
rustup target list --installed
cargo -V
```

## 3. Java 17

Tauri Android 构建建议使用 JDK 17。

macOS 可用 Homebrew：

```bash
brew install openjdk@17
```

把 `JAVA_HOME` 写进 shell 配置，例如 `~/.zshrc`：

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
```

重载：

```bash
source ~/.zshrc
java -version
echo $JAVA_HOME
```

## 4. Android Studio / SDK / NDK

推荐直接安装 Android Studio，然后在图形界面里装齐组件，避免命令行镜像问题。

需要装的内容：

- Android SDK Platform
- Android SDK Build-Tools
- Android SDK Command-line Tools
- Android SDK Platform-Tools
- NDK

建议使用 Android Studio 的 SDK Manager 完成。

设置环境变量，写入 `~/.zshrc`：

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export NDK_HOME="$ANDROID_HOME/ndk/<你的NDK版本目录>"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

重载并校验：

```bash
source ~/.zshrc
adb version
sdkmanager --list
```

## 5. 初始化 Tauri Android 工程

在仓库根目录执行：

```bash
pnpm tauri:android:init
```

成功后通常会生成 Android 工程目录，例如 `src-tauri/gen/android/`。

如果初始化时报缺少 SDK / NDK / Java，就回到前几步补齐环境变量和组件。

## 6. 本地调试

先确认手机打开：

- 开发者选项
- USB 调试

连接手机后校验：

```bash
adb devices
```

如果识别到设备，可直接启动：

```bash
pnpm tauri:android:dev
```

## 7. 生成发布签名

生成 keystore：

```bash
keytool -genkeypair \
  -v \
  -keystore release-keystore.jks \
  -alias react-tetris \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

建议把 keystore 放在你自己的安全目录，不要提交进仓库。

然后在 `src-tauri/gen/android/keystore.properties` 写入：

```properties
storeFile=/绝对路径/release-keystore.jks
storePassword=你的store密码
keyAlias=react-tetris
keyPassword=你的key密码
```

该文件已被 `.gitignore` 忽略。

## 8. 给 Android 工程接入 release 签名

执行完 `pnpm tauri:android:init` 后，打开生成的 Android 工程。

如果模板里还没有 release signing，可在应用模块的 Gradle 文件里补上读取逻辑。

Kotlin DSL 常见写法大致如下：

```kotlin
import java.util.Properties

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("keystore.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(keystorePropertiesFile.inputStream())
}

android {
    signingConfigs {
        create("release") {
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
        }
    }

    buildTypes {
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
        }
    }
}
```

如果你的模板生成的是 Groovy DSL，再按 Groovy 语法等价改写即可。

## 9. 构建 APK / AAB

构建 APK：

```bash
pnpm tauri:android:build:apk
```

构建 AAB：

```bash
pnpm tauri:android:build:aab
```

如果命令失败，优先排查：

- `JAVA_HOME` 是否指向 JDK 17
- `ANDROID_HOME` / `ANDROID_SDK_ROOT` 是否正确
- `NDK_HOME` 是否指向已安装的 NDK
- `adb`, `sdkmanager`, `cargo` 是否都在 `PATH`
- Rust Android targets 是否已安装

## 10. 安装到真机

找到生成的 APK 后执行：

```bash
adb install -r /path/to/app-release.apk
```

如果是小米 / Redmi 真机，还建议检查：

- 是否允许 USB 安装
- 是否关闭 MIUI/HyperOS 的安装拦截
- 是否允许该电脑的 USB 调试授权

## 11. 红米真机验证清单

建议至少验证这些项：

1. App 能正常启动，首屏没有白屏或黑屏卡死。
2. 触控按钮可操作，左右移动、旋转、加速下降、硬降都正常。
3. 暂停、重开、音效开关都生效。
4. 横竖屏切换或应用切后台再回来时，不会直接丢状态或崩溃。
5. 声音播放正常，静音开关符合预期。
6. 长时间运行后无明显卡顿、发热异常或输入延迟。

## 12. 常用命令

```bash
pnpm tauri:dev
pnpm tauri:build
pnpm tauri:android:init
pnpm tauri:android:dev
pnpm tauri:android:build:apk
pnpm tauri:android:build:aab
```
