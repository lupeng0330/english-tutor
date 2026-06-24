# -*- coding: utf-8 -*-
"""
乐学英语 · 冒烟测试（Playwright headless）
================================================================
验证 app.js 按功能域拆分后"零行为变更"：
  1. 整条脚本链注入后无 JS 报错（pageerror / console.error）——捕获 TDZ/加载顺序问题。
  2. 内联 onclick / 跨域调用依赖的 window 函数与命名空间对象齐全。
  3. 关键函数可调用且不抛异常。

依赖：pip install playwright && python -m playwright install chromium
前置：本地已起静态服务（默认 http://127.0.0.1:8011/index.html）
用法：python tests/smoke.py [--url ...]
判定：全过 → 退出码 0 [PASS]；失败 → 1 [FAIL]；环境缺失 → 0 [SKIP]。
"""
import sys
import argparse


def out(s):
    sys.stdout.write(str(s) + "\n")
    sys.stdout.flush()


WIN_FUNCS = [
    "switchPage", "applyContextChange", "ctxJumpToGrade", "continueLearning",
    "switchWrongbookTab", "setWrongbookFilter", "toggleWrongbookItem",
    "deleteWrongbookItem", "renderWrongbookPage",
    "switchUnitTab", "flipLesson", "prevLesson", "nextLesson", "goLesson",
    "toggleReadingEx", "submitReadingEx", "resetReadingEx", "toggleWordExamples", "openUnit",
    "startPractice", "answerQuiz", "startSmartPractice", "toggleSmartPick",
    "startIrregPractice", "irregSubmit", "irregShowHint", "irregSkip", "exitIrregPractice",
    "filterQuestions", "loadQuestionBank", "forceCheckUpdate",
    "switchToProfile", "openProfilePanel", "closeProfilePanel", "refreshProfileBadge",
]
WIN_OBJS = ["__wrongbook", "__mastery", "__smartpick", "__stats"]
SAFE_CALLS = ["renderHomeStats", "renderWrongbookPage", "applyContextChange"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://127.0.0.1:8011/index.html")
    args = ap.parse_args()

    try:
        from playwright.sync_api import sync_playwright
    except Exception as e:
        out("[SKIP] 未安装 playwright 包：{!r}".format(e))
        return 0

    errors, fails = [], []
    try:
        with sync_playwright() as p:
            try:
                browser = p.chromium.launch()
            except Exception as e:
                out("[SKIP] 无法启动 chromium：{!r}".format(e))
                return 0
            page = browser.new_page()
            page.on("pageerror", lambda exc: errors.append("pageerror: {}".format(exc)))
            page.on("console", lambda m: errors.append("console.error: {}".format(m.text))
                    if m.type == "error" else None)
            try:
                page.goto(args.url, wait_until="domcontentloaded", timeout=30000)
            except Exception as e:
                out("[SKIP] 无法访问 {}（服务未起？）：{!r}".format(args.url, e))
                browser.close()
                return 0
            # 必须等最后加载的 app.js 执行到底（其末尾导出 refreshProfileBadge），
            # 否则 app.js 及其后分片的函数尚未定义会误报缺失。
            try:
                page.wait_for_function(
                    "() => typeof window.refreshProfileBadge === 'function'"
                    " && typeof window.switchToProfile === 'function'", timeout=20000)
            except Exception as e:
                fails.append("脚本链 20s 未就绪（app.js 未加载完）：{!r}".format(e))

            for n in page.evaluate("(ns)=>ns.filter(n=>typeof window[n]!=='function')", WIN_FUNCS):
                fails.append("缺失全局函数: window.{}".format(n))
            for n in page.evaluate("(ns)=>ns.filter(n=>!window[n])", WIN_OBJS):
                fails.append("缺失全局对象: window.{}".format(n))
            for fn in SAFE_CALLS:
                res = page.evaluate(
                    "(fn)=>{try{window[fn]();return null;}catch(e){return String(e);}}", fn)
                if res:
                    fails.append("调用 {}() 抛异常: {}".format(fn, res))
            res = page.evaluate(
                "()=>{try{window.filterQuestions&&window.filterQuestions('word');return null;}"
                "catch(e){return String(e);}}")
            if res:
                fails.append("调用 filterQuestions('word') 异常: {}".format(res))

            try:
                page.screenshot(path="tests/_smoke_home.png")
            except Exception:
                pass
            browser.close()
    except Exception as e:
        out("[FAIL] 测试执行异常: {!r}".format(e))
        return 1

    out("")
    out("=== 冒烟测试结果 ===")
    out("页面 JS 报错数: {}".format(len(errors)))
    for e in errors[:30]:
        out("  ! {}".format(e))
    out("断言失败数: {}".format(len(fails)))
    for f in fails[:30]:
        out("  x {}".format(f))
    if errors or fails:
        out("\n[FAIL] 存在报错或断言失败，拆分可能引入回归。")
        return 1
    out("\n[PASS] 无 JS 报错；{} 函数 + {} 命名空间齐全；关键调用正常。".format(
        len(WIN_FUNCS), len(WIN_OBJS)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
