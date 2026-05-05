# -*- coding: utf-8 -*-
"""
scripts/make_pwa_icons_stdlib.py

用 Python 标准库（zlib + struct，零第三方依赖）生成两张真·二进制 PNG：
  - icon-192.png
  - icon-512.png

图案：蓝紫径向渐变（#667eea -> #764ba2）圆角方块 + 白色「乐」字。
「乐」字用内嵌 16x16 位图放大绘制，保证视觉辨识度。
与 icon.svg / manifest.json 的主视觉保持一致。

兼容 Python 3.6+（仓库机器 py -3 == 3.6.6 已验证）。

运行：
  py -3 scripts/make_pwa_icons_stdlib.py

输出到仓库根目录（相对脚本的 ..）。
"""

import os
import struct
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# ----------------- 「乐」字位图（16x16，1=笔画，0=背景） -----------------
# 手绘，确保小尺寸也能看清。
LE_GLYPH = [
    "0000000110000000",
    "0000000110000000",
    "0001111111111000",
    "0000011111100000",
    "0000110001100000",
    "0001000111000000",
    "0000001110000000",
    "0000011011000000",
    "0001110001110000",
    "0111000001001100",
    "0000000110000000",
    "0001111111111000",
    "0000000110000000",
    "0000011110000000",
    "0000110011000000",
    "0001100001100000",
]


def hex_to_rgb(h):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def lerp(a, b, t):
    return int(a + (b - a) * t)


def radial_gradient(x, y, size, c1, c2):
    # 径向：左上(0.25,0.2) 亮 -> 右下(0.8,0.9) 深
    cx = 0.25 * size
    cy = 0.20 * size
    fx = 0.80 * size
    fy = 0.90 * size
    # 以 (x,y) 到 (cx,cy) 距离 / (fx,fy) 到 (cx,cy) 距离 做插值
    import math
    d = math.hypot(x - cx, y - cy)
    dmax = math.hypot(fx - cx, fy - cy)
    t = min(1.0, d / dmax)
    return (lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t))


def in_rounded_square(x, y, size, radius):
    # 四角圆角判断
    if x >= radius and x <= size - radius:
        return 0 <= y <= size
    if y >= radius and y <= size - radius:
        return 0 <= x <= size
    # 四个角
    cx = radius if x < radius else size - radius
    cy = radius if y < radius else size - radius
    dx = x - cx
    dy = y - cy
    return dx * dx + dy * dy <= radius * radius


def render(size):
    c1 = hex_to_rgb('#667eea')
    c2 = hex_to_rgb('#764ba2')
    radius = int(size * 0.22)  # 圆角半径 ~= 22%

    # 位图：每像素 RGBA
    pixels = bytearray(size * size * 4)

    for y in range(size):
        for x in range(size):
            idx = (y * size + x) * 4
            if in_rounded_square(x + 0.5, y + 0.5, size, radius):
                r, g, b = radial_gradient(x, y, size, c1, c2)
                pixels[idx + 0] = r
                pixels[idx + 1] = g
                pixels[idx + 2] = b
                pixels[idx + 3] = 255
            else:
                # 透明背景（maskable 时被挡也没关系）
                pixels[idx + 0] = 0
                pixels[idx + 1] = 0
                pixels[idx + 2] = 0
                pixels[idx + 3] = 0

    # 绘制「乐」字：把 16x16 位图放到中心，占 size 的 ~62%
    glyph_h = len(LE_GLYPH)
    glyph_w = len(LE_GLYPH[0])
    glyph_size = int(size * 0.62)
    px_per_cell = glyph_size / glyph_w
    off_x = (size - glyph_size) / 2
    off_y = (size - glyph_size) / 2 + size * 0.02  # 视觉微下偏

    # 预构造（gx,gy） -> on/off 列表
    for gy in range(glyph_h):
        row = LE_GLYPH[gy]
        for gx in range(glyph_w):
            if row[gx] != '1':
                continue
            x0 = int(off_x + gx * px_per_cell)
            y0 = int(off_y + gy * px_per_cell)
            x1 = int(off_x + (gx + 1) * px_per_cell)
            y1 = int(off_y + (gy + 1) * px_per_cell)
            if x1 <= x0:
                x1 = x0 + 1
            if y1 <= y0:
                y1 = y0 + 1
            for yy in range(max(0, y0), min(size, y1)):
                for xx in range(max(0, x0), min(size, x1)):
                    idx = (yy * size + xx) * 4
                    # 只在已绘制的渐变区域上画白字
                    if pixels[idx + 3] == 255:
                        pixels[idx + 0] = 255
                        pixels[idx + 1] = 255
                        pixels[idx + 2] = 255
                        pixels[idx + 3] = 255

    return bytes(pixels)


def write_png(path, size, rgba):
    """最小 PNG 编码（IHDR + IDAT + IEND），颜色类型 6 = RGBA。"""

    def chunk(tag, data):
        return (
            struct.pack('>I', len(data))
            + tag
            + data
            + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        )

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)  # 8bit depth, RGBA

    # 按行加过滤字节 0（None）
    raw = bytearray()
    stride = size * 4
    for y in range(size):
        raw.append(0)
        raw.extend(rgba[y * stride:(y + 1) * stride])
    compressed = zlib.compress(bytes(raw), 9)

    with open(path, 'wb') as f:
        f.write(sig)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))


def main():
    for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png')]:
        print('rendering {}x{} ...'.format(size, size))
        rgba = render(size)
        out = os.path.join(ROOT, name)
        write_png(out, size, rgba)
        print('wrote', out, os.path.getsize(out), 'bytes')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
