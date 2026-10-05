#!/usr/bin/env python3
"""0.26: иконка приложения. Рисует SVG (icon_svg.py), растрирует через Chromium (Playwright) и раскладывает PNG:
Android — mipmap-*/ic_launcher(.png|_round|_fg|_bg|_mono) + адаптивная mipmap-anydpi-v26; iPhone/PWA — docs/*.png.
Запуск: python3 tools/icon/make_icon.py"""
import os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import icon_svg
from PIL import Image
from playwright.sync_api import sync_playwright
KINDS = ('square', 'rounded', 'round', 'maskable', 'bg', 'fg', 'mono')
tmp = tempfile.mkdtemp()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 512, 'height': 512}, device_scale_factor=2)
    for k in KINDS:
        pg.set_content('<html><body style="margin:0;background:transparent">' + icon_svg.svg(512, k).replace('width="512" height="512"', 'width="512" height="512" style="display:block"', 1) + '</body></html>')
        pg.wait_for_timeout(100); pg.screenshot(path=os.path.join(tmp, k + '.png'), omit_background=True, clip={'x': 0, 'y': 0, 'width': 512, 'height': 512})
    b.close()
src = {k: Image.open(os.path.join(tmp, k + '.png')).convert('RGBA') for k in KINDS}
def save(im, size, path, opaque=False):
    out = im.resize((size, size), Image.LANCZOS)
    if opaque: out = out.convert('RGB')
    os.makedirs(os.path.dirname(path), exist_ok=True); out.save(path, optimize=True)
for d, k in {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}.items():
    base = os.path.join(ROOT, 'app/src/main/res/mipmap-' + d)
    save(src['rounded'], int(48 * k), os.path.join(base, 'ic_launcher.png'))
    save(src['round'], int(48 * k), os.path.join(base, 'ic_launcher_round.png'))
    save(src['fg'], int(108 * k), os.path.join(base, 'ic_launcher_fg.png'))
    save(src['bg'], int(108 * k), os.path.join(base, 'ic_launcher_bg.png'), opaque=True)
    save(src['mono'], int(108 * k), os.path.join(base, 'ic_launcher_mono.png'))
for name, k, size, op in (('apple-touch-icon.png', 'square', 180, True), ('icon-192.png', 'rounded', 192, False),
                          ('icon-512.png', 'rounded', 512, False), ('icon-maskable-512.png', 'maskable', 512, True)):
    save(src[k], size, os.path.join(ROOT, 'docs', name), opaque=op)
print('иконки готовы')
