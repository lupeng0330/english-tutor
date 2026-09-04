# 乐学英语 · 移动端（Capacitor 套壳）

本目录用 [Capacitor](https://capacitorjs.com/) 把**现有前端网页**（项目根的 `index.html`/`js`/`data`/`audio` 等）打包为 Android / iOS 原生 App。与桌面端 Electron 是同一套「一份前端，多端套壳」策略——**不重写任何 UI**。

## 目录约定

```
mobile/
├── capacitor.config.json        # Capacitor 配置（appId / appName / webDir=www）
├── package.json                 # Capacitor 依赖与脚本
├── scripts/copy-web-assets.js   # 把项目根现有前端同步到 www/（webDir），排除后端/脚本/备份
├── www/                         # [构建产物, git 忽略] 由 copy-web-assets.js 生成
├── android/                     # [cap add android 生成] Android 原生工程
└── ios/                         # [cap add ios 生成] iOS 原生工程（打包需 macOS + Xcode）
```

- `www/` 是 Capacitor 的 webDir，**不手工编辑**，改动现有前端后重新跑同步脚本即可。
- Capacitor WebView 以 `https://localhost`(Android) / `capacitor://localhost`(iOS) 加载 `www/`，
  现有前端的 `fetch('data/**.json')` 相对路径**零改动**即可工作（已验证）。
- 版本号：壳内 `index.html` 走 Capacitor 分支，用 `@capacitor/app` 的 `App.getInfo().version`
  注入，不依赖 `version.txt`（不影响线上静态版逻辑）。
- SW：移动壳 hostname 非 `*.github.io`，Service Worker 天然不注册，无缓存回退问题。

## 常用命令（在 mobile/ 目录下）

前置：Node.js（本项目用 v22）；`npm install` 安装依赖。

```bash
# 1) 同步现有前端 → www/
npm run sync-web

# 2) 首次添加原生平台（生成 android/ 或 ios/ 工程）
npm run cap:add:android      # 需要 JDK 17 + Android SDK
npm run cap:add:ios          # 需要 macOS + Xcode + CocoaPods

# 3) 每次改完前端，同步并推送到原生工程
npm run cap:sync

# 4) 打开原生 IDE 进行运行/打包
npm run cap:open:android     # 打开 Android Studio → Build APK/AAB
npm run cap:open:ios         # 打开 Xcode（仅 macOS）
```

## 原生打包环境要求（Phase M 首版原生打包待此环境就绪）

| 平台 | 环境 | 产物 | 说明 |
|---|---|---|---|
| Android | JDK 17 + Android SDK（Android Studio） | `.apk` / `.aab` | Windows 可完成 |
| iOS | macOS + Xcode + CocoaPods + Apple Developer 账号 | `.ipa` | **必须在 Mac 上打包/签名** |
| 鸿蒙 | 无需额外 | 复用 Android `.apk` | 老版 HarmonyOS 可直接安装 APK；纯血鸿蒙 NEXT 见 Phase H（ArkTS 壳） |

## 当前进度（Phase M）

- [x] Capacitor 工程初始化 + 配置（webDir=www）
- [x] `copy-web-assets.js` 同步脚本（复用现有前端，排除后端/脚本/备份）
- [x] `index.html` 增加 Capacitor 版本号注入分支（不影响线上）
- [x] Web 层验证：`www/` 静态服务托管 index/js/data/理解自测 JSON 全部 200，相对 fetch 可用
- [ ] Android 原生打包（`cap add android` → APK）——待 JDK17 + Android SDK 环境
- [ ] iOS 原生打包——待 macOS + Xcode 环境
- [ ] 应用商店上架（Google Play / App Store）——Phase 6，需开发者账号
