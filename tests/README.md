# 冒烟测试（smoke test）

纯静态 PWA「乐学英语」的最小回归验证，用 **Python Playwright（headless Chromium）** 真机加载站点，断言关键全局函数存在、主路径调用无异常，确保技术债重构「零行为变更」。

## 依赖

- Python 3
- `playwright`（已随环境安装）+ Chromium 内核
  ```bash
  pip install playwright
  python -m playwright install chromium   # 若内核缺失再执行
  ```

## 运行

1. 在项目根目录起本地静态服务：
   ```bash
   python -m http.server 8011
   ```
2. 另开终端执行：
   ```bash
   python tests/smoke.py
   ```

> 默认访问 `http://127.0.0.1:8011/index.html`。如需改端口，编辑 `smoke.py` 顶部的 `BASE_URL`。

## 判定标准

测试全部通过的输出末尾为：

```
[PASS] 0 errors, 0 failures
```

具体覆盖：

- 等待 `window.refreshProfileBadge && window.switchToProfile`（`app.js` 末尾导出）就绪，确保全部分片加载完成。
- 断言 33 个关键 `window` 函数存在（含内联 `onclick` 目标：`switchPage / openUnit / answerQuiz / startPractice` 等）。
- 断言 4 个命名空间对象存在：`__wrongbook / __mastery / __smartpick / __stats`。
- 安全调用主路径函数（`renderHomeStats / renderWrongbookPage / applyContextChange`）与 `filterQuestions('word')`，捕获异常。
- 监听 `pageerror` 与 `console.error`，任意 JS 错误即判失败。
- 首页截图留证：`tests/_smoke_home.png`。

## 失败排查

- 报「缺少函数」：多为加载链顺序问题——确认 `index.html` 注入链与 `sw.js` 的 `STATIC_ASSETS` 已同步包含全部 `js/*.js` 分片。
- 连接失败：确认本地服务已在 `8011` 端口运行。
