#!/usr/bin/env python3
"""Сборка «Автоимперии»: src/* -> единый HTML для артефакта, Android и iPhone (PWA)."""
import os, glob, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
def rd(p): return open(os.path.join(HERE, p), encoding='utf-8').read()
def build():
    js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(HERE, 'src/js/*.js'))))
    page = rd('src/head.html') + '<style>\n' + rd('src/style.css') + '</style>\n' + rd('src/body.html') + '<script>\n' + js + '</script>\n'
    os.makedirs(os.path.join(HERE, 'dist'), exist_ok=True)
    open(os.path.join(HERE, 'dist/avtoimperia.html'), 'w', encoding='utf-8').write(page)
    open(os.path.join(HERE, 'dist/game.js'), 'w', encoding='utf-8').write(js)
    open(os.path.join(ROOT, 'app/src/main/assets/index.html'), 'w', encoding='utf-8').write(rd('wrap/android_head.html') + page + rd('wrap/android_tail.html'))
    open(os.path.join(ROOT, 'docs/index.html'), 'w', encoding='utf-8').write(rd('wrap/docs_head.html') + page + rd('wrap/docs_tail.html'))
    print('built', len(page), 'bytes')
if __name__ == '__main__':
    build()
