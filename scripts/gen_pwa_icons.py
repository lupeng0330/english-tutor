"""
乐学英语 · 从 icon.svg 生成 PWA 所需的 icon-192.png / icon-512.png
---------------------------------------------------------------
运行：
    py -3 scripts/gen_pwa_icons.py
    # 或
    python3 scripts/gen_pwa_icons.py

后端优先级：cairosvg > Pillow + svglib；都没装时给出一次性 pip 提示。
生成的 PNG 放在仓库根目录，供 manifest.json / apple-touch-icon 引用。
"""

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SVG  = ROOT / "icon.svg"
TARGETS = [("icon-192.png", 192), ("icon-512.png", 512)]


def render_with_cairosvg():
    try:
        import cairosvg  # type: ignore
    except Exception:
        return False
    svg_bytes = SVG.read_bytes()
    for name, size in TARGETS:
        out = ROOT / name
        cairosvg.svg2png(bytestring=svg_bytes,
                         write_to=str(out),
                         output_width=size,
                         output_height=size)
        print(f"[cairosvg] 已生成 {out.relative_to(ROOT)} ({size}x{size})")
    return True


def render_with_svglib():
    try:
        from svglib.svglib import svg2rlg  # type: ignore
        from reportlab.graphics import renderPM  # type: ignore
        from PIL import Image  # type: ignore
    except Exception:
        return False
    drawing = svg2rlg(str(SVG))
    # svglib 生成的 drawing 没有原生 resize，用 PIL 二次采样
    tmp_path = ROOT / "_icon_tmp.png"
    renderPM.drawToFile(drawing, str(tmp_path), fmt="PNG")
    src = Image.open(tmp_path)
    for name, size in TARGETS:
        out = ROOT / name
        src.resize((size, size), Image.LANCZOS).save(out, "PNG")
        print(f"[svglib+PIL] 已生成 {out.relative_to(ROOT)} ({size}x{size})")
    tmp_path.unlink(missing_ok=True)
    return True


def main():
    if not SVG.exists():
        print("[ERR] 源文件不存在: " + str(SVG))
        return 1
    if render_with_cairosvg():
        return 0
    if render_with_svglib():
        return 0
    print(
        "[ERR] 未检测到可用的 SVG->PNG 后端。\n"
        "请任选其一安装：\n"
        "  pip install cairosvg    # 最快\n"
        "  pip install svglib reportlab pillow    # 纯 Python，无 Cairo 依赖"
    )
    return 2


if __name__ == "__main__":
    sys.exit(main())
