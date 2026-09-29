"""Атлас листвы для 3D-гонок: из фото-листьев и веток Poly Haven (CC0, game/tex/_src) собираются
«карточки» крон: плотные пучки листьев с веточками, хвоя, пальмовые листья, трава и цветы.
Запуск: python3 tools/foliage.py  → game/tex/foliage_c.jpg (цвет) и foliage_a.jpg (прозрачность)."""
import os, sys, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'game', 'tex', '_src')
OUT = os.path.join(ROOT, 'game', 'tex')

def load(name):
    c = Image.open(os.path.join(SRC, name + '_diff_1k.jpg')).convert('RGB')
    a = Image.open(os.path.join(SRC, name + '_alpha_1k.jpg')).convert('L')
    if a.size != c.size: a = a.resize(c.size, Image.LANCZOS)
    return np.asarray(c).astype(np.float32) / 255, np.asarray(a).astype(np.float32) / 255

def sprites(name, amin=300, amax=0.2, border=True):
    """Отдельные листья/ветки: связные области прозрачности."""
    c, a = load(name)
    H, W = a.shape
    lab, n = ndimage.label(a > 0.5, structure=np.ones((3, 3)))
    out = []
    for k, sl in enumerate(ndimage.find_objects(lab)):
        if sl is None: continue
        ys, xs = sl
        h, w = ys.stop - ys.start, xs.stop - xs.start
        m = lab[sl] == k + 1
        area = m.sum()
        if area < amin or area > amax * W * H: continue
        if not border and (ys.start < 2 or xs.start < 2 or ys.stop > H - 2 or xs.stop > W - 2): continue
        pad = 3
        y0, y1, x0, x1 = max(0, ys.start - pad), min(H, ys.stop + pad), max(0, xs.start - pad), min(W, xs.stop + pad)
        sub = lab[y0:y1, x0:x1]
        # своя область + мягкий край (без соседей)
        own = ndimage.binary_dilation(sub == k + 1, iterations=2)
        al = a[y0:y1, x0:x1] * own
        rgba = np.dstack([c[y0:y1, x0:x1], al])
        out.append({'img': rgba, 'area': int(area), 'box': (x0, y0, x1, y1), 'fill': area / float(w * h)})
    return out

def to_img(rgba):
    return Image.fromarray((np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')

if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == 'list':
    # просмотр: все листья каждого исходника с номерами
    from PIL import ImageFont
    names = sys.argv[2:]
    for nm in names:
        S = sprites(nm)
        k = 8; w = 128; rows = (len(S) + k - 1) // k
        sh = Image.new('RGB', (k * w, max(1, rows) * (w + 14)), (90, 110, 140)); d = ImageDraw.Draw(sh)
        for i, s in enumerate(S):
            im = to_img(s['img']); im.thumbnail((w - 4, w - 4))
            x, y = (i % k) * w, (i // k) * (w + 14)
            sh.paste(im, (x + 2, y + 2), im); d.text((x + 3, y + w), '%d a%d f%.2f' % (i, s['area'], s['fill']), fill=(255, 255, 255))
        sh.save(os.path.join(sys.argv[0].rsplit('/', 2)[0] if False else '/tmp', 'spr_' + nm + '.png'))
        print(nm, len(S))

# ---------- сборка атласа ----------
CELL = 512

def pick(name, ids):
    S = sprites(name)
    return [S[i] for i in ids if i < len(S)]

def rot_scale(sp, length, ang, bright=1.0, tint=(1, 1, 1)):
    """Лист: масштаб по длинной стороне, поворот (град), яркость и оттенок."""
    rgba = sp['img'].copy()
    rgba[..., :3] = np.clip(rgba[..., :3] * bright * np.array(tint, np.float32), 0, 1)
    im = to_img(rgba)
    k = length / max(im.width, im.height)
    im = im.resize((max(2, int(im.width * k)), max(2, int(im.height * k))), Image.LANCZOS)
    return im.rotate(ang, resample=Image.BICUBIC, expand=True)

def paste_c(canvas, im, cx, cy):
    canvas.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))

def twig(d, pts, w0, w1, col=(88, 66, 44)):
    n = len(pts)
    for i in range(n - 1):
        t = i / max(1, n - 2); w = w0 + (w1 - w0) * t
        d.line([pts[i], pts[i + 1]], fill=col + (255,), width=max(1, int(round(w))))

def branch_pts(x0, y0, ang, L, bend, steps=12):
    pts = [(x0, y0)]; a = ang
    for i in range(steps):
        a += bend / steps
        x0 += math.cos(a) * L / steps; y0 += math.sin(a) * L / steps; pts.append((x0, y0))
    return pts

def leafy_cluster(rng, leaves, n, size, tints, twigcol=(84, 64, 44), ell=(256, 250, 236, 214), leaf_ang=(-60, 60)):
    """Пучок листвы на веточках: сначала ветки, потом листья — сзади тёмные, спереди светлые."""
    cv = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0)); d = ImageDraw.Draw(cv)
    cx, cy, rx, ry = ell
    # веточки из нижней середины веером
    tips = []
    for b in range(7):
        ang = -math.pi / 2 + (b - 3) * 0.36 + rng.uniform(-0.12, 0.12)
        P = branch_pts(cx + rng.uniform(-14, 14), CELL - 6, ang * 0.7 - math.pi / 2 * 0.3, rng.uniform(0.55, 0.85) * ry * 1.55, rng.uniform(-0.4, 0.4))
        twig(d, P, 7, 1.5, twigcol); tips += P[4:]
        for s in range(2):
            j = rng.randint(3, len(P) - 3); a2 = ang + rng.choice([-1, 1]) * rng.uniform(0.5, 0.9)
            Q = branch_pts(P[j][0], P[j][1], a2, rng.uniform(30, 60), rng.uniform(-0.4, 0.4), 6); twig(d, Q, 3, 1, twigcol); tips += Q[2:]
    L = []; ph = [rng.uniform(0, 6.3) for _ in range(3)]
    for i in range(n):
        # точка в эллипсе кроны (плотнее к середине) или у кончика веточки
        if rng.random() < 0.45 and tips:
            x, y = rng.choice(tips); x += rng.uniform(-18, 18); y += rng.uniform(-18, 18)
        else:
            r = math.sqrt(rng.random()) ** 0.8; a = rng.uniform(0, 2 * math.pi); x, y = cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r
        e = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
        aa = math.atan2(y - cy, x - cx)
        lim = 0.72 + 0.16 * math.sin(aa * 3 + ph[0]) + 0.1 * math.sin(aa * 5 + ph[1]) + 0.06 * math.sin(aa * 9 + ph[2])
        if e > lim: continue
        depth = rng.random()
        L.append((depth, x, y, e))
    L.sort()
    for depth, x, y, e in L:
        sp = rng.choice(leaves); ln = size * rng.uniform(0.75, 1.2)
        out = math.degrees(math.atan2(y - cy, x - cx))  # лист смотрит от середины наружу
        ang = -(out + 90) + rng.uniform(*leaf_ang) if rng.random() < 0.6 else rng.uniform(0, 360)
        br = 0.52 + 0.55 * depth + 0.12 * (1 - e) * depth
        t = rng.choice(tints)
        paste_c(cv, rot_scale(sp, ln, ang, br, t), x, y)
    return cv

def conifer_spray(rng, twigs, n=26):
    """Еловая лапа: ветка слева направо, по бокам — веточки с хвоей, к концу мельче."""
    cv = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0)); d = ImageDraw.Draw(cv)
    P = branch_pts(4, 300, -0.08, 500, 0.25, 16); twig(d, P, 9, 2, (70, 52, 38))
    items = []
    for i in range(n):
        t = rng.uniform(0.05, 1.0); j = min(len(P) - 1, int(t * (len(P) - 1)))
        x, y = P[j]; side = rng.choice([-1, 1]); sz = 250 * (1.05 - 0.55 * t) * rng.uniform(0.8, 1.1)
        ang = -(-20 + side * rng.uniform(35, 70)) + rng.uniform(-10, 10)
        items.append((rng.random(), x + side * 8, y + side * sz * 0.18, sz, ang))
    items.sort()
    for depth, x, y, sz, ang in items:
        sp = rng.choice(twigs); paste_c(cv, rot_scale(sp, sz, ang - 90, 0.55 + 0.6 * depth), x + math.cos(math.radians(-ang)) * sz * 0.3, y - math.sin(math.radians(-ang)) * sz * 0.3)
    return cv

def pine_tufts(rng, sprays, n=16):
    cv = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0)); d = ImageDraw.Draw(cv)
    # короткие ветки веером и пучки хвои на концах
    for b in range(6):
        ang = -math.pi / 2 + (b - 2.5) * 0.45
        P = branch_pts(256, 506, ang, rng.uniform(200, 330), rng.uniform(-0.4, 0.4), 10); twig(d, P, 8, 2, (92, 66, 46))
        for k in range(3):
            x, y = P[-1 - k * 3]
            for q in range(3):
                sp = rng.choice(sprays); paste_c(cv, rot_scale(sp, rng.uniform(170, 240), rng.uniform(0, 360), rng.uniform(0.6, 1.1), (0.85, 1.05, 0.8)), x + rng.uniform(-24, 24), y + rng.uniform(-24, 24))
    return cv

def frond(rng, leaves):
    """Пальмовый лист: изогнутый черешок вдоль клетки, по бокам — длинные узкие листочки, к концу короче."""
    cv = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0)); d = ImageDraw.Draw(cv)
    P = branch_pts(6, 250, -0.18, 500, 0.42, 24); twig(d, P, 7, 2, (126, 116, 70))
    items = []
    for i in range(2, 24):
        x, y = P[i]; t = i / 24; w = math.sin(math.pi * min(1, t * 1.08)) ** 0.7
        for side in (-1, 1):
            ln = 190 * max(0.25, w) * rng.uniform(0.88, 1.08)
            dirv = math.atan2(P[min(23, i + 1)][1] - y, P[min(23, i + 1)][0] - x)
            a = dirv + side * math.radians(rng.uniform(38, 52))
            items.append((rng.random(), x + math.cos(a) * ln * 0.46, y + math.sin(a) * ln * 0.46, ln, -math.degrees(a) - 90))
    items.sort()
    for depth, x, y, ln, ang in items:
        sp = rng.choice(leaves); paste_c(cv, rot_scale(sp, ln, ang, 0.62 + 0.45 * depth, (0.82, 1.0, 0.7)), x, y)
    return cv

def grass_cell(rng, tufts, blades, extra=None, tint=(1, 1, 1), n=10, extra_n=0, size=150):
    """Пучок травы 256×256: основание внизу."""
    S = 256; cv = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    for i in range(n):
        sp = rng.choice(tufts); im = rot_scale(sp, size * rng.uniform(0.8, 1.15), rng.uniform(-8, 8), rng.uniform(0.7, 1.1), tint)
        cv.alpha_composite(im, (int(S / 2 - im.width / 2 + rng.uniform(-60, 60)), int(S - im.height - rng.uniform(0, 8))))
    for i in range(int(n * 1.2)):
        sp = rng.choice(blades); im = rot_scale(sp, size * rng.uniform(0.9, 1.4), rng.uniform(-18, 18), rng.uniform(0.7, 1.1), tint)
        cv.alpha_composite(im, (int(S / 2 - im.width / 2 + rng.uniform(-70, 70)), int(S - im.height - rng.uniform(0, 6))))
    if extra:
        for i in range(extra_n):
            sp = rng.choice(extra); im = rot_scale(sp, rng.uniform(26, 40), rng.uniform(0, 360), rng.uniform(0.9, 1.1))
            cv.alpha_composite(im, (int(rng.uniform(40, S - 70)), int(rng.uniform(S * 0.25, S * 0.62))))
    return cv

def dilate(rgba):
    """Цвет под прозрачными местами — от ближайших листьев (без тёмной каймы на мипмапах)."""
    a = rgba[..., 3:4]; c = rgba[..., :3] * a; aa = a.copy(); out = rgba[..., :3].copy()
    filled = a[..., 0] > 0.5
    import cv2
    for k in range(9):
        r = 2 ** k * 2 + 1
        cb = cv2.GaussianBlur(c, (0, 0), 2 ** k); ab = cv2.GaussianBlur(aa, (0, 0), 2 ** k)
        if ab.ndim == 2: ab = ab[..., None]
        m = (~filled) & (ab[..., 0] > 1e-3)
        out[m] = (cb / np.maximum(ab, 1e-4))[m]
        filled |= m
    return out

def build():
    rng = random.Random(1917)
    atlas = Image.new('RGBA', (CELL * 4, CELL * 2), (0, 0, 0, 0))
    broad = pick('shrub_01', [0, 3, 5, 8, 9, 10, 11]) + pick('nettle_plant', [2, 4, 5, 9])
    light = pick('shrub_03', [0, 2, 4, 5, 6, 7, 8]) + pick('shrub_01', [5, 9])
    olive = pick('shrub_02', [3, 4, 5]) + pick('shrub_04', [0, 1, 3, 5, 6, 7, 8])
    fir = pick('fir_tree_01_twig', [1, 2, 3, 4, 5, 6, 7])
    pine = pick('pine_tree_01_twig', [0, 1])
    palm = pick('shrub_02', [3, 4, 5])
    gt = pick('grass_medium_01', [12, 13, 14, 15, 16, 3]) + pick('grass_bermuda_01', [4, 5, 6, 7])
    gb = pick('grass_medium_02', [0, 1, 3, 4, 5, 8, 9]) + pick('grass_bermuda_01', [11, 12, 14])
    dry = pick('grass_medium_02', [6, 7])
    flw = pick('celandine_01', [3, 4, 5]) + pick('dandelion_01', [0, 1])
    petals = pick('shrub_sorrel_01', [5, 6, 7, 8, 9])
    fern = pick('fern_02', [0, 1, 2, 3, 4])
    shrub = pick('nettle_plant', [2, 4, 5, 7, 9]) + pick('shrub_01', [0, 5, 8, 9]) + pick('shrub_03', [2, 4])
    G = [(1, 1, 1), (0.92, 1.0, 0.9), (1.05, 1.02, 0.92)]
    cells = [
        leafy_cluster(rng, broad, 640, 40, [(0.74, 0.88, 0.66), (0.66, 0.8, 0.6), (0.8, 0.9, 0.66)]),
        leafy_cluster(rng, light, 600, 36, [(0.8, 0.98, 0.66), (0.74, 0.95, 0.62), (0.86, 0.96, 0.7)]),
        leafy_cluster(rng, olive, 720, 40, [(0.9, 0.95, 0.9), (0.85, 0.9, 0.88), (1, 1, 0.95)], twigcol=(96, 86, 70), leaf_ang=(-40, 40)),
        conifer_spray(rng, fir),
        pine_tufts(rng, pine),
        frond(rng, palm),
    ]
    for i, c in enumerate(cells): atlas.alpha_composite(c, ((i % 4) * CELL, (i // 4) * CELL))
    # трава: 4 пучка 256×256 в клетке 6
    g = [grass_cell(rng, gt, gb, None, (1, 1, 1), 9),
         grass_cell(rng, gt, gb + dry, None, (1.18, 1.06, 0.66), 9),
         grass_cell(rng, gt, gb, flw + petals, (1, 1, 1), 7, 7),
         grass_cell(rng, fern, fern, None, (0.9, 1, 0.9), 5, 0, 190)]
    for k, c in enumerate(g): atlas.alpha_composite(c, (2 * CELL + (k % 2) * 256, CELL + (k // 2) * 256))
    atlas.alpha_composite(leafy_cluster(rng, shrub, 520, 46, [(0.8, 0.92, 0.72), (0.7, 0.85, 0.64)]), (3 * CELL, CELL))
    rgba = np.asarray(atlas).astype(np.float32) / 255
    col = dilate(rgba)
    Image.fromarray((np.clip(col, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB').save(os.path.join(OUT, 'foliage_c.jpg'), 'JPEG', quality=90, optimize=True)
    Image.fromarray((rgba[..., 3] * 255 + 0.5).astype(np.uint8), 'L').save(os.path.join(OUT, 'foliage_a.jpg'), 'JPEG', quality=92, optimize=True)
    # просмотр на сером фоне
    bg = Image.new('RGBA', atlas.size, (96, 116, 146, 255)); bg.alpha_composite(atlas)
    bg.convert('RGB').resize((1024, 512)).save('/tmp/foliage_preview.jpg', quality=88)
    print('foliage atlas', atlas.size)

if __name__ == '__main__' and (len(sys.argv) == 1 or sys.argv[1] != 'list'):
    build()
