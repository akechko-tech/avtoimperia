#!/usr/bin/env python3
"""Сборка «Автоимперии»: src/* -> единый HTML для артефакта, Android и iPhone (PWA).
Фото-текстуры гонок (game/tex, Poly Haven, CC0) упаковываются в tex/tex.js: цвет (с затенением щелей)
и «данные» (нормаль XY + шероховатость) для каждого материала, небо и атлас листвы."""
import os, glob, sys, json, base64
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TEX = os.path.join(HERE, 'tex')
PACK = os.path.join(TEX, 'pack')
def rd(p): return open(os.path.join(HERE, p), encoding='utf-8').read()

def manifest():
    """Манифест Poly Haven (обновляет сборка «Текстуры») + свои материалы (game/tex/extra.json: луг из фото-травинок)."""
    man = json.load(open(os.path.join(TEX, 'manifest.json'), encoding='utf-8'))
    ex = os.path.join(TEX, 'extra.json')
    if os.path.exists(ex):
        for k, v in json.load(open(ex, encoding='utf-8')).get('mat', {}).items(): man['mat'][k] = v
    return man

def pack_textures():
    """Цвет × затенение (AO) и «данные» (нормаль XY + шероховатость) — по одной картинке на слой массива текстур."""
    try:
        from PIL import Image, ImageChops
    except Exception:
        print('PIL нет — беру готовые game/tex/pack'); return
    man = manifest()
    os.makedirs(PACK, exist_ok=True)
    for slot, m in man['mat'].items():
        if not m: continue
        c, n, r = [os.path.join(TEX, slot + s) for s in ('_c.jpg', '_n.jpg', '_r.jpg')]
        oa, od = os.path.join(PACK, slot + '_a.jpg'), os.path.join(PACK, slot + '_d.jpg')
        src = [p for p in (c, n, r) if os.path.exists(p)]
        if os.path.exists(oa) and os.path.exists(od) and all(os.path.getmtime(oa) >= os.path.getmtime(p) for p in src): continue
        col = Image.open(c).convert('RGB'); S = col.size
        if os.path.exists(r):
            arm = Image.open(r).convert('RGB').resize(S); ao, rough, _ = arm.split()
        else:
            ao, rough = Image.new('L', S, 255), Image.new('L', S, 205)
        ao = ao.point(lambda v: int(255 * (0.35 + 0.65 * v / 255)))
        a = ImageChops.multiply(col, Image.merge('RGB', (ao, ao, ao)))
        a.save(oa, 'JPEG', quality=88, optimize=True)
        if os.path.exists(n):
            nr, ng, _ = Image.open(n).convert('RGB').resize(S).split()
        else:
            nr, ng = Image.new('L', S, 128), Image.new('L', S, 128)
        Image.merge('RGB', (nr, ng, rough)).save(od, 'JPEG', quality=90, optimize=True, subsampling=0)
        print('pack', slot)

def tex_js():
    man = manifest()
    img, lay = {}, []
    def put(key, path):
        with open(path, 'rb') as f: img[key] = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode('ascii')
    for slot, m in man['mat'].items():
        a, d = os.path.join(PACK, slot + '_a.jpg'), os.path.join(PACK, slot + '_d.jpg')
        if not m or not os.path.exists(a) or not os.path.exists(d): continue
        put(slot + '_a', a); put(slot + '_d', d)
        lay.append({'k': slot, 'm': m.get('m', 2.5), 'id': m.get('id', '')})
    sky = {}
    for mood, s in man.get('sky', {}).items():
        p = os.path.join(TEX, 'sky_' + mood + '.jpg')
        if os.path.exists(p): put('sky_' + mood, p); sky[mood] = {'sun': s['sun'], 'hz': s['hz'], 'ze': s['ze'], 'id': s['id']}
    for k in ('foliage_c', 'foliage_a'):
        p = os.path.join(TEX, k + '.jpg')
        if os.path.exists(p): put(k, p)
    data = {'lay': lay, 'sky': sky, 'lic': man.get('license', ''), 'img': img}
    js = '/* Фото-текстуры гонок: Poly Haven (polyhaven.com), CC0 1.0 — общественное достояние */\nwindow.TEX_DATA=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
    for d in (os.path.join(HERE, 'dist', 'tex'), os.path.join(ROOT, 'docs', 'tex'), os.path.join(ROOT, 'app', 'src', 'main', 'assets', 'tex')):
        os.makedirs(d, exist_ok=True)
        p = os.path.join(d, 'tex.js')
        if not os.path.exists(p) or open(p, encoding='utf-8').read() != js:
            open(p, 'w', encoding='utf-8').write(js)
    print('tex.js', round(len(js) / 1e6, 2), 'MB,', len(lay), 'materials,', len(sky), 'skies')

def build():
    js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(HERE, 'src/js/*.js'))))
    page = rd('src/head.html') + '<style>\n' + rd('src/style.css') + '</style>\n' + rd('src/body.html') + '<script>\n' + js + '</script>\n'
    os.makedirs(os.path.join(HERE, 'dist'), exist_ok=True)
    open(os.path.join(HERE, 'dist/avtoimperia.html'), 'w', encoding='utf-8').write(page)
    open(os.path.join(HERE, 'dist/game.js'), 'w', encoding='utf-8').write(js)
    open(os.path.join(ROOT, 'app/src/main/assets/index.html'), 'w', encoding='utf-8').write(rd('wrap/android_head.html') + page + rd('wrap/android_tail.html'))
    open(os.path.join(ROOT, 'docs/index.html'), 'w', encoding='utf-8').write(rd('wrap/docs_head.html') + page + rd('wrap/docs_tail.html'))
    print('built', len(page), 'bytes')
    if os.path.exists(os.path.join(TEX, 'manifest.json')):
        pack_textures(); tex_js()
if __name__ == '__main__':
    build()
