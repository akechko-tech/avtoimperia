"""Фото-текстуры и небо для 3D-гонок: Poly Haven (все материалы — CC0, общественное достояние).
Запускается в GitHub Actions (workflow «Текстуры»): скачивает карты цвета, нормалей и шероховатости,
ужимает до 512 px, небо — до 2048×1024 и складывает в game/tex вместе с manifest.json.
Результат коммитится в репозиторий, сборка (game/build.py) вшивает его в APK и веб-версию."""
import json, os, re, sys, io, math, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'game', 'tex')
UA = 'AvtoimperiaBuild/1.0 (https://github.com/akechko-tech/avtoimperia; game build, CC0 textures)'
API = 'https://api.polyhaven.com'
SIZE = 512

def get(url, tries=4):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:
            if k == tries - 1: raise
            time.sleep(2 ** k * 1.5)

def jget(url): return json.loads(get(url))

# Слоты материалов: must — группы слов (из каждой группы нужно хотя бы одно), prefer — плюс к выбору, no — исключить.
# ids — любимые ассеты, если они есть на Poly Haven. m — размер плитки в метрах по умолчанию.
SLOTS = [
    ('grass',      dict(must=[['grass']], prefer=['meadow', 'field', 'wild', 'leafy', 'lawn', 'green'], no=['aerial', 'dry', 'dead', 'snow', 'path', 'artificial', 'rock', 'stone', 'wall', 'brick'], ids=['leafy_grass', 'grass_path_2'], m=2.5)),
    ('dry_grass',  dict(must=[['grass', 'hay', 'straw ground', 'field']], prefer=['dry', 'dead', 'autumn', 'yellow', 'burnt', 'brown'], no=['aerial', 'snow', 'wall', 'roof'], ids=['withered_grass', 'dry_mud_field_001'], m=2.5)),
    ('dirt',       dict(must=[['dirt', 'soil', 'earth', 'ground']], prefer=['dry', 'soil', 'brown', 'cracked'], no=['aerial', 'snow', 'leaves', 'tiles', 'floor tiles', 'wall', 'brick', 'moss', 'road', 'path'], ids=['dirt_floor', 'brown_mud_03'], m=2.5)),
    ('dirt_road',  dict(must=[['road', 'path', 'track', 'trail', 'tyre', 'tire']], prefer=['dirt', 'mud', 'gravel', 'rocky', 'ruts', 'country'], no=['asphalt', 'aerial', 'marking', 'line', 'tarmac', 'concrete', 'brick'], m=3)),
    ('gravel',     dict(must=[['gravel', 'pebbles', 'chipping']], prefer=['road', 'path', 'ground', 'grey'], no=['aerial', 'concrete', 'wall'], ids=['gravel_ground_01', 'gravel_stones'], m=2)),
    ('macadam',    dict(must=[['gravel', 'rocky', 'stones', 'pebbles']], prefer=['road', 'path', 'grey', 'ground'], no=['aerial', 'concrete', 'wall', 'red', 'river'], ids=['rocky_gravel', 'gravel_stones'], m=2)),
    ('cobble',     dict(must=[['cobble', 'cobblestone', 'sett', 'paving stones', 'pavement', 'paving']], prefer=['cobble', 'old', 'square', 'street'], no=['aerial', 'mossy', 'tiles', 'marble', 'modern'], m=2)),
    ('brick_road', dict(must=[['brick']], prefer=['floor', 'pavement', 'paving', 'road', 'ground', 'herringbone'], no=['wall', 'painted', 'white'], m=2)),
    ('asphalt',    dict(must=[['asphalt', 'tarmac']], prefer=['road', 'old', 'worn'], no=['aerial', 'marking', 'lines', 'line', 'crosswalk'], ids=['asphalt_01', 'worn_asphalt'], m=3)),
    ('concrete',   dict(must=[['concrete']], prefer=['floor', 'ground', 'slab', 'pavement', 'old'], no=['wall', 'tiles', 'painted', 'block'], m=3)),
    ('planks',     dict(must=[['plank', 'planks', 'boards', 'board']], prefer=['wood', 'old', 'weathered', 'floor', 'deck'], no=['painted', 'parquet', 'laminate', 'white'], m=2)),
    ('sand',       dict(must=[['sand']], prefer=['beach', 'desert', 'dune', 'coast'], no=['stone', 'brick', 'wall', 'rocks', 'rock'], ids=['sand_03', 'coast_sand_02'], m=3)),
    ('snow',       dict(must=[['snow']], prefer=['field', 'ground', 'fresh'], no=['rock', 'wall', 'roof'], ids=['snow_02', 'snow_04'], m=3)),
    ('rock',       dict(must=[['rock', 'cliff', 'boulder', 'rocky']], prefer=['cliff', 'face', 'rocky', 'mountain', 'layered'], no=['floor', 'wall', 'tiles', 'brick', 'paving', 'pebbles', 'aerial', 'path', 'gravel', 'sand'], m=4)),
    ('forest',     dict(must=[['forest', 'leaves', 'needles', 'moss', 'leaf']], prefer=['ground', 'floor', 'forest', 'autumn'], no=['aerial', 'wall', 'roof', 'rock face'], ids=['forest_leaves_02', 'brown_mud_leaves_01'], m=2.5)),
    ('mud',        dict(must=[['mud', 'muddy']], prefer=['wet', 'ground', 'puddle', 'track'], no=['wall', 'aerial', 'leaves'], m=2.5)),
    ('brick_wall', dict(must=[['brick']], prefer=['wall', 'red', 'old', 'worn'], no=['painted', 'white', 'floor', 'pavement', 'paving', 'grey'], m=2.5)),
    ('plaster',    dict(must=[['plaster', 'stucco', 'render', 'rendered']], prefer=['white', 'wall', 'old', 'cream'], no=['brick', 'tiles', 'floor', 'ceiling', 'damaged'], ids=['white_stucco', 'yellow_plaster_02'], m=3)),
    ('stone_wall', dict(must=[['stone', 'castle', 'masonry', 'rubble']], prefer=['wall', 'block', 'old', 'castle', 'medieval'], no=['floor', 'paving', 'tiles', 'pebbles', 'gravel', 'marble', 'modern'], m=3)),
    ('wood_wall',  dict(must=[['wood', 'wooden', 'log', 'timber']], prefer=['wall', 'siding', 'shed', 'barn', 'weathered', 'log', 'planks'], no=['floor', 'parquet', 'painted', 'laminate', 'bark', 'chips'], ids=['weathered_plank_siding', 'wooden_rough_planks'], m=2.5)),
    ('roof_tiles', dict(must=[['roof', 'roofing'], ['tile', 'tiles', 'clay', 'terracotta']], prefer=['clay', 'red', 'terracotta', 'old'], no=['slate', 'metal', 'shingle'], m=2.5)),
    ('roof_slate', dict(must=[['slate', 'shingle', 'shingles']], prefer=['roof', 'grey', 'old'], no=['clay', 'terracotta', 'floor'], ids=['roof_slates_02', 'grey_roof_tiles_02'], m=2.5)),
    ('thatch',     dict(must=[['thatch', 'straw', 'hay', 'reed']], prefer=['roof', 'thatch'], no=['floor', 'mat'], m=2.5)),
    ('bark',       dict(must=[['bark']], prefer=['tree', 'oak', 'pine', 'brown'], no=['mulch', 'chips'], m=1.5)),
    ('metal_roof', dict(must=[['corrugated', 'metal sheet', 'sheet metal', 'tin']], prefer=['roof', 'rusty', 'old'], no=['painted', 'floor', 'plate'], m=2.5)),
]
# Небо: только «чистое небо» (без земли), под разное время суток и погоду
SKIES = [
    ('clear',    ['clear', 'sunny', 'midday', 'noon', 'blue'],        ['sunset', 'sunrise', 'overcast', 'night', 'dusk', 'dawn', 'storm']),
    ('cloudy',   ['partly cloudy', 'cloudy', 'clouds', 'cumulus'],     ['sunset', 'sunrise', 'overcast', 'night', 'storm']),
    ('overcast', ['overcast', 'grey', 'gray', 'soft'],                 ['sunset', 'night', 'clear']),
    ('evening',  ['sunset', 'evening', 'dusk', 'golden'],              ['night', 'overcast']),
    ('morning',  ['sunrise', 'morning', 'dawn', 'misty', 'haze'],      ['night', 'sunset', 'overcast']),
]

def text_of(i, a):
    return ' '.join([i.replace('_', ' '), a.get('name', ''), ' '.join(a.get('tags', [])), ' '.join(a.get('categories', []))]).lower()

CANDS = {}
def pick(assets, spec, used, slot=''):
    L = []
    for i, a in assets.items():
        t = text_of(i, a)
        if any(re.search(r'\b' + re.escape(n) + r'\b', t) for n in spec.get('no', [])): continue
        if not all(any(re.search(r'\b' + re.escape(w), t) for w in grp) for grp in spec['must']): continue
        s = 10 * sum(1 for w in spec.get('prefer', []) if re.search(r'\b' + re.escape(w), t)) + math.log10(1 + a.get('download_count', 0))
        L.append((s, i))
    L.sort(reverse=True)
    CANDS[slot] = [[i, round(s, 1), ' '.join(assets[i].get('tags', [])[:8])] for s, i in L[:8]]
    ids = [x for x in spec.get('ids', []) if x in assets and x not in used]
    if ids: return ids[0], 'ids'
    for s, i in L:
        if i not in used: return i, round(s, 2)
    return None, 0

def find_map(files, names):
    low = {k.lower(): k for k in files}
    for n in names:
        if n.lower() in low: return files[low[n.lower()]]
    return None

def fetch_img(node, res='1k'):
    if not node: return None
    for r in (res, '2k', '1k'):
        v = node.get(r)
        if not v: continue
        for fmt in ('jpg', 'png'):
            if fmt in v: return get(v[fmt]['url'])
    return None

def textures():
    from PIL import Image
    assets = jget(API + '/assets?t=textures')
    print('textures on Poly Haven:', len(assets))
    man, used, prev = {}, set(), []
    for slot, spec in SLOTS:
        aid, why = pick(assets, spec, used, slot)
        if not aid:
            print('slot', slot, ': nothing'); man[slot] = None; continue
        used.add(aid); a = assets[aid]
        try:
            files = jget(API + '/files/' + aid)
            col = fetch_img(find_map(files, ['Diffuse', 'diff', 'Color', 'albedo']))
            nor = fetch_img(find_map(files, ['nor_gl', 'Normal', 'nor_dx']))
            arm = fetch_img(find_map(files, ['arm']))
            rough = None if arm else fetch_img(find_map(files, ['Rough', 'roughness']))
            ao = None if arm else fetch_img(find_map(files, ['AO', 'ao']))
            flip = find_map(files, ['nor_gl', 'Normal']) is None
            def load(b, mode='RGB'):
                return Image.open(io.BytesIO(b)).convert(mode).resize((SIZE, SIZE), Image.LANCZOS)
            c = load(col); c.save(os.path.join(OUT, slot + '_c.jpg'), 'JPEG', quality=86, optimize=True)
            if nor:
                n = load(nor)
                if flip:
                    r_, g_, b_ = n.split(); from PIL import ImageOps; n = Image.merge('RGB', (r_, ImageOps.invert(g_), b_))
                n.save(os.path.join(OUT, slot + '_n.jpg'), 'JPEG', quality=90, optimize=True)
            if arm:
                load(arm).save(os.path.join(OUT, slot + '_r.jpg'), 'JPEG', quality=88, optimize=True)
            elif rough:
                rr = load(rough, 'L'); aa = load(ao, 'L') if ao else Image.new('L', (SIZE, SIZE), 255)
                Image.merge('RGB', (aa, rr, Image.new('L', (SIZE, SIZE), 0))).save(os.path.join(OUT, slot + '_r.jpg'), 'JPEG', quality=88, optimize=True)
            dims = a.get('dimensions')
            man[slot] = {'id': aid, 'name': a.get('name', aid), 'authors': list((a.get('authors') or {}).keys()), 'dims_mm': dims,
                         'm': round(max(dims) / 1000, 2) if dims else spec['m'], 'why': why, 'nor': bool(nor), 'arm': bool(arm or rough)}
            prev.append((slot, c))
            print('slot', slot, '->', aid, why, dims)
        except Exception as e:
            print('slot', slot, 'error', aid, e); man[slot] = None
    # лист просмотра: все материалы на одной картинке (для проверки выбора, игре не нужен)
    if prev:
        k = 6; w = 170; rows = (len(prev) + k - 1) // k
        sheet = Image.new('RGB', (k * w, rows * (w + 18)), (20, 20, 20))
        from PIL import ImageDraw
        d = ImageDraw.Draw(sheet)
        for j, (slot, im) in enumerate(prev):
            x, y = (j % k) * w, (j // k) * (w + 18)
            sheet.paste(im.resize((w - 4, w - 4)), (x + 2, y + 2)); d.text((x + 4, y + w), slot, fill=(230, 230, 230))
        sheet.save(os.path.join(OUT, '_preview.jpg'), 'JPEG', quality=80)
    return man

def skies():
    import numpy as np, cv2
    from PIL import Image
    assets = jget(API + '/assets?t=hdris')
    pure = {i: a for i, a in assets.items() if 'puresky' in i or 'pure sky' in text_of(i, a)}
    print('pure skies:', len(pure))
    man, used = {}, set()
    for mood, want, no in SKIES:
        best, bs = None, -1e9
        for i, a in pure.items():
            if i in used: continue
            t = text_of(i, a)
            if any(n in t for n in no): continue
            s = 10 * sum(1 for w in want if w in t) + math.log10(1 + a.get('download_count', 0))
            if s > bs: best, bs = i, s
        if not best or bs < 5: print('sky', mood, ': nothing'); continue
        used.add(best)
        try:
            files = jget(API + '/files/' + best)
            node = files.get('hdri', {})
            url = None
            for r in ('2k', '1k'):
                if r in node and 'hdr' in node[r]: url = node[r]['hdr']['url']; break
            raw = get(url)
            tmp = os.path.join(OUT, '_tmp.hdr'); open(tmp, 'wb').write(raw)
            hdr = cv2.imread(tmp, cv2.IMREAD_ANYDEPTH | cv2.IMREAD_COLOR)[:, :, ::-1].astype(np.float32); os.remove(tmp)
            H, W = hdr.shape[:2]
            lum = hdr @ np.array([0.2126, 0.7152, 0.0722], np.float32)
            y, x = np.unravel_index(np.argmax(lum), lum.shape)
            az = (x / W) * 360.0 - 180.0; el = 90.0 - (y / H) * 180.0     # солнце: азимут от центра карты, высота над горизонтом
            upper = lum[: H // 2]
            k = 0.55 / max(1e-4, float(np.median(upper)))                 # экспозиция: медиана неба ≈ 0,55
            img = hdr * k; img = img / (1.0 + img * 0.35); img = np.clip(img, 0, 1) ** (1 / 2.2)
            im = Image.fromarray((img * 255 + 0.5).astype(np.uint8)).resize((2048, 1024), Image.LANCZOS)
            im.save(os.path.join(OUT, 'sky_' + mood + '.jpg'), 'JPEG', quality=84, optimize=True)
            hz = img[int(H * 0.47):int(H * 0.5)].reshape(-1, 3).mean(0); ze = img[:int(H * 0.1)].reshape(-1, 3).mean(0)
            man[mood] = {'id': best, 'name': assets[best].get('name', best), 'sun': [round(float(az), 1), round(float(el), 1)],
                         'hz': [round(float(v), 3) for v in hz], 'ze': [round(float(v), 3) for v in ze], 'score': round(bs, 2)}
            print('sky', mood, '->', best, man[mood]['sun'])
        except Exception as e:
            print('sky', mood, 'error', best, e)
    return man

DBG = {}
def foliage():
    from PIL import Image
    assets = jget(API + '/assets?t=models')
    want = [('broad', ['tree', 'oak', 'maple', 'beech', 'birch', 'ash', 'poplar', 'shrub', 'bush'], ['fir', 'pine', 'spruce', 'palm', 'cactus', 'dead', 'stump', 'log', 'potted', 'pot', 'indoor', 'flower']),
            ('conifer', ['fir', 'pine', 'spruce', 'conifer', 'cypress'], ['dead', 'stump', 'log', 'potted', 'pot', 'indoor']),
            ('shrub', ['shrub', 'bush', 'hedge', 'fern', 'grass', 'weed'], ['dead', 'potted', 'pot', 'indoor', 'flower pot'])]
    out, used, cands = {}, set(), {}
    for kind, words, no in want:
        L = []
        for i, a in assets.items():
            t = text_of(i, a)
            if not any(re.search(r'\b' + w, t) for w in words) or any(re.search(r'\b' + n + r'\b', t) for n in no): continue
            L.append((sum(1 for w in words if re.search(r'\b' + w, t)) * 5 + math.log10(1 + a.get('download_count', 0)), i))
        L.sort(reverse=True); cands[kind] = [i for s, i in L[:10]]
        for s, i in L:
            if i in used: continue
            try:
                files = jget(API + '/files/' + i)
                g = files.get('gltf', {})
                node = g.get('1k') or g.get('2k') or {}
                inc = (node.get('gltf') or {}).get('include', {})
                DBG.setdefault(kind, {})[i] = sorted(inc.keys())[:12] if inc else sorted(files.keys())
                leaf = [k for k in inc if re.search(r'leaf|leaves|foliage|needle|branch|twig', k, re.I) and re.search(r'diff|col|albedo', k, re.I)]
                if not leaf: continue
                k0 = sorted(leaf, key=len)[0]
                im = Image.open(io.BytesIO(get(inc[k0]['url']))).convert('RGBA')
                al = [k for k in inc if re.search(r'leaf|leaves|foliage|needle|branch|twig', k, re.I) and re.search(r'alpha|opacity|mask', k, re.I)]
                if al:
                    a2 = Image.open(io.BytesIO(get(inc[al[0]]['url']))).convert('L').resize(im.size)
                    im.putalpha(a2)
                if im.getextrema()[3][0] > 200: continue          # нет прозрачности — не годится
                im = im.resize((512, 512), Image.LANCZOS)
                im.save(os.path.join(OUT, 'leaf_' + kind + '.png'), 'PNG', optimize=True)
                used.add(i); out[kind] = {'id': i, 'name': assets[i].get('name', i), 'file': k0}
                print('leaf', kind, '->', i, k0); break
            except Exception as e:
                print('leaf', kind, i, 'error', e)
    out['_cands'] = cands; out['_dbg'] = DBG
    return out

def main():
    os.makedirs(OUT, exist_ok=True)
    man = {'license': 'CC0 1.0 — Poly Haven (polyhaven.com)', 'size': SIZE, 'mat': {}, 'sky': {}}
    try: man['mat'] = textures()
    except Exception as e: print('textures failed', e)
    try: man['sky'] = skies()
    except Exception as e: print('skies failed', e)
    man['cands'] = CANDS
    try: man['leaf'] = foliage()
    except Exception as e: print('foliage failed', e)
    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as f: json.dump(man, f, ensure_ascii=False, indent=1)
    print('done:', sum(1 for v in man['mat'].values() if v), 'materials,', len(man['sky']), 'skies')

if __name__ == '__main__':
    main()
