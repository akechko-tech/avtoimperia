"""Медиа для «Автоимперии» — запускается в GitHub Actions (workflow «Медиа», ветка media), где открыт интернет.
Задания перечислены в tools/media/jobs.txt (по одному в строке):
  films_scan  — ищет на Wikimedia Commons старую кинохронику (видео 1895–1935, общественное достояние)
                и делает листы кадров для отбора: media/films/scan/<n>.jpg + index.json
  films_cut   — режет выбранные куски (tools/media/films.json) в короткие mp4 без звука: media/films/clips/
  samples     — живые инструменты для музыки игры: FluidR3_GM (MIT) → ноты через терцию, mp3-«нарезки»: media/samples/
  tex         — дополнительные фото-материалы Poly Haven (CC0): кожа, ткань, резина, скалы…: media/tex/
  voice       — голос диктора (Silero TTS, v4_ru) для строк tools/media/voice_lines.json: media/voice/
Результаты коммитятся обратно в ветку media; сборка игры забирает их оттуда."""
import json, os, re, sys, io, math, time, hashlib, subprocess, urllib.request, urllib.parse, urllib.error, shutil, html

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEDIA = os.path.join(ROOT, 'media')
TOOLS = os.path.join(ROOT, 'tools', 'media')
UA = 'AvtoimperiaBuild/1.0 (https://github.com/akechko-tech/avtoimperia; game build; archival films, CC0 textures)'
LOG = []

def log(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); LOG.append(s)

def get(url, tries=5, timeout=90):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (404, 403) or k == tries - 1: raise
            if e.code == 429: time.sleep(40 * (k + 1)); continue
        except Exception:
            if k == tries - 1: raise
        time.sleep(2 ** k * 1.5)

def jget(url): return json.loads(get(url))

def sh(cmd, check=True, quiet=True):
    r = subprocess.run(cmd, stdout=subprocess.PIPE if quiet else None, stderr=subprocess.PIPE if quiet else None, text=True)
    if check and r.returncode != 0:
        raise RuntimeError('command failed: %s\n%s' % (' '.join(cmd[:6]), (r.stderr or '')[-800:]))
    return r

# ---------------------------------------------------------------- Commons: видео
API = 'https://commons.wikimedia.org/w/api.php'
def capi(**p):
    p['format'] = 'json'
    return jget(API + '?' + urllib.parse.urlencode(p))

def strip_html(s):
    s = re.sub(r'<[^>]+>', ' ', s or ''); s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()

def video_info(titles):
    out = {}
    for i in range(0, len(titles), 40):
        r = capi(action='query', titles='|'.join(titles[i:i + 40]), prop='videoinfo', viprop='url|size|mime|mediatype|extmetadata|derivatives|metadata')
        for pg in (r.get('query', {}).get('pages', {}) or {}).values():
            if pg.get('videoinfo'): out[pg['title']] = pg['videoinfo'][0]
    return out

def meta_val(v, k):
    return strip_html(((v.get('extmetadata') or {}).get(k) or {}).get('value', ''))

def duration_of(v):
    d = v.get('duration')
    if d: return float(d)
    for m in v.get('metadata') or []:
        if m.get('name') in ('playtime_seconds', 'length'):
            try: return float(m.get('value'))
            except Exception: pass
    return 0.0

def pick_derivative(v, prefer=('480p.vp9.webm', '480p.webm', '360p.vp9.webm', '360p.webm', '240p.vp9.webm', '240p.webm', '720p.vp9.webm', '720p.webm')):
    ders = v.get('derivatives') or []
    by = {d.get('transcodekey', ''): d.get('src') for d in ders}
    for k in prefer:
        if by.get(k): return by[k]
    return v.get('url')

def years_in(txt):
    return [int(y) for y in re.findall(r'(?<!\d)(18[89]\d|19\d\d|20\d\d)(?!\d)', txt or '')]

def year_guess(v, title=''):
    """Год съёмки: по дате снимка, иначе по названию и описанию. Современное (1940+) — не берём."""
    dto = years_in(meta_val(v, 'DateTimeOriginal'))
    txt = ' '.join([title, meta_val(v, 'ObjectName'), meta_val(v, 'ImageDescription')[:600]])
    ys = years_in(txt)
    if dto and min(dto) < 1940: return min(dto)
    old = [y for y in ys if y < 1940]
    if ys and max(ys) >= 1940 and not old: return max(ys)
    return min(old) if old else (min(dto) if dto else None)

def download(url, path, limit=220e6):
    # Викисклад ограничивает частые скачивания (429): ждём и пробуем снова; между файлами — пауза
    for k in range(5):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            n = 0
            with urllib.request.urlopen(req, timeout=180) as r, open(path, 'wb') as f:
                while True:
                    b = r.read(1 << 20)
                    if not b: break
                    n += len(b); f.write(b)
                    if n > limit: raise RuntimeError('too big')
            time.sleep(3)
            return n
        except urllib.error.HTTPError as e:
            if e.code != 429 or k == 4: raise
            wait = 45 * (k + 1)
            try: wait = max(wait, int(e.headers.get('Retry-After') or 0))
            except Exception: pass
            log('429, waiting', wait); time.sleep(wait)

def frame_at(src, t, out, w=256):
    sh(['ffmpeg', '-v', 'error', '-ss', '%.2f' % t, '-i', src, '-frames:v', '1', '-vf', 'scale=%d:-2' % w, '-y', out], check=True)

def films_scan():
    from PIL import Image, ImageDraw
    qs = [l.strip() for l in open(os.path.join(TOOLS, 'film_queries.txt'), encoding='utf-8') if l.strip() and not l.startswith('#')]
    D = os.path.join(MEDIA, 'films', 'scan'); os.makedirs(D, exist_ok=True)
    idx_path = os.path.join(D, 'index.json')
    old = json.load(open(idx_path, encoding='utf-8')) if os.path.exists(idx_path) else []
    seen = {e['title'] for e in old}
    titles = []
    for q in qs:
        try:
            r = capi(action='query', list='search', srsearch=q + ' filetype:video', srnamespace=6, srlimit=30)
            L = [x['title'] for x in r.get('query', {}).get('search', [])]
            log('search', q, '->', len(L))
            for t in L:
                if t not in titles and t not in seen: titles.append(t)
        except Exception as e:
            log('search error', q, e)
        time.sleep(0.3)
    info = video_info(titles)
    log('candidates', len(titles), 'with info', len(info))
    out = list(old); n0 = len(old)
    tmp = os.path.join(D, '_f.jpg'); vid = os.path.join(D, '_v.bin')
    for t in titles:
        v = info.get(t)
        if not v: continue
        lic = meta_val(v, 'LicenseShortName')
        if not re.search(r'public domain|\bpd\b|cc0|cc[ -]by', lic, re.I): continue
        dur = duration_of(v)
        if dur < 4 or dur > 1500: continue
        y = year_guess(v, t)
        if not y or y >= 1940: continue
        src = pick_derivative(v, ('360p.vp9.webm', '360p.webm', '240p.vp9.webm', '240p.webm', '480p.vp9.webm', '480p.webm'))
        try:
            size = download(src, vid)
        except Exception as e:
            log('download failed', t, e); continue
        ts = [dur * k for k in (0.08, 0.24, 0.4, 0.56, 0.72, 0.88)]
        ims = []
        for tt in ts:
            try:
                frame_at(vid, tt, tmp); ims.append(Image.open(tmp).convert('RGB').copy())
            except Exception as e:
                ims.append(None); log('frame error', t, round(tt, 1), str(e)[-160:])
        if not any(ims):
            log('no frames', t); continue
        n = len(out)
        w = 256; h = max(im.height for im in ims if im)
        sheet = Image.new('RGB', (w * 3, (h + 16) * 2), (16, 16, 16)); d = ImageDraw.Draw(sheet)
        for k, im in enumerate(ims):
            x, yy = (k % 3) * w, (k // 3) * (h + 16)
            if im: sheet.paste(im, (x, yy))
            d.text((x + 4, yy + h + 2), '%d  t=%.0fs' % (k, ts[k]), fill=(230, 230, 120))
        sheet.save(os.path.join(D, '%03d.jpg' % n), 'JPEG', quality=78)
        out.append({'n': n, 'title': t, 'page': v.get('descriptionurl'), 'dur': round(dur, 1), 'w': v.get('width'), 'h': v.get('height'),
                    'lic': lic, 'year': y, 'artist': meta_val(v, 'Artist')[:120], 'desc': meta_val(v, 'ImageDescription')[:400],
                    'date': meta_val(v, 'DateTimeOriginal')[:60], 'src': src, 'orig': v.get('url'), 'ts': [round(x, 1) for x in ts], 'size': size})
        log('film', n, t, dur, y, lic)
        json.dump(out, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for f in (tmp, vid):
        if os.path.exists(f): os.remove(f)
    log('scan done: new', len(out) - n0, 'total', len(out))

def films_cut():
    """tools/media/films.json: [{"id":"vanderbilt1905","title":"File:...","t":12.5,"d":9,"cap":"…"}]"""
    L = json.load(open(os.path.join(TOOLS, 'films.json'), encoding='utf-8'))
    D = os.path.join(MEDIA, 'films', 'clips'); os.makedirs(D, exist_ok=True)
    info = video_info(sorted({e['title'] for e in L}))
    man_path = os.path.join(D, 'index.json')
    man = json.load(open(man_path, encoding='utf-8')) if os.path.exists(man_path) else {}
    for e in L:
        cid = e['id']; out = os.path.join(D, cid + '.mp4')
        v = info.get(e['title'])
        if not v: log('cut: no info', e['title']); continue
        key = '%s|%s|%s|%s' % (e['title'], e['t'], e['d'], e.get('crop', ''))
        if os.path.exists(out) and man.get(cid, {}).get('key') == key: continue
        src = pick_derivative(v, ('720p.vp9.webm', '720p.webm', '480p.vp9.webm', '480p.webm', '360p.vp9.webm', '360p.webm'))
        vf = []
        if e.get('crop'): vf.append('crop=%s' % e['crop'])
        vf += ['hqdn3d=2:1.5:3:3', 'scale=640:-2:flags=lanczos', 'setsar=1', 'format=yuv420p']
        if e.get('speed'): vf.insert(0, 'setpts=PTS/%s' % e['speed'])
        try:
            vid = os.path.join(D, '_src.bin'); download(src, vid, 400e6)
            sh(['ffmpeg', '-v', 'error', '-ss', str(e['t']), '-i', vid, '-t', str(e['d']), '-an', '-vf', ','.join(vf),
                '-c:v', 'libx264', '-profile:v', 'main', '-level', '3.1', '-preset', 'slow', '-crf', '27', '-movflags', '+faststart', '-r', '24', '-y', out])
            sh(['ffmpeg', '-v', 'error', '-ss', '%.2f' % min(1.0, e['d'] / 3), '-i', out, '-frames:v', '1', '-vf', 'scale=320:-2', '-q:v', '5', '-y', os.path.join(D, cid + '.jpg')])
            man[cid] = {'key': key, 'title': e['title'], 'page': v.get('descriptionurl'), 'lic': meta_val(v, 'LicenseShortName'), 'artist': meta_val(v, 'Artist')[:120],
                        'cap': e.get('cap', ''), 'd': e['d'], 'size': os.path.getsize(out)}
            log('cut', cid, e['title'], e['t'], e['d'], os.path.getsize(out))
        except Exception as ex:
            log('cut error', cid, ex)
        json.dump(man, open(man_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- живые инструменты (FluidR3_GM, MIT)
INSTR = [  # имя, программа GM (или -1 — ударные), нижняя, верхняя нота, шаг, сколько держать ноту, длина ячейки, громкость
    ('piano', 0, 31, 97, 3, 2.2, 3.0, 96), ('honky', 3, 43, 94, 3, 1.6, 2.4, 96), ('bass', 32, 26, 56, 3, 1.1, 2.0, 110),
    ('tuba', 58, 26, 59, 3, 0.9, 1.8, 105), ('trumpet', 56, 54, 87, 3, 1.3, 2.1, 100), ('trombone', 57, 40, 73, 3, 1.1, 2.0, 100),
    ('clarinet', 71, 50, 87, 3, 1.4, 2.2, 100), ('violin', 40, 55, 94, 3, 1.8, 2.6, 100), ('strings', 48, 43, 85, 3, 2.0, 2.8, 100),
    ('accordion', 23, 48, 85, 3, 1.7, 2.5, 100), ('banjo', 105, 48, 81, 3, 0.9, 1.8, 105), ('cornet', 56, 54, 84, 3, 0.35, 1.0, 110),
    ('pizz', 45, 36, 84, 3, 0.4, 1.2, 110), ('glock', 9, 72, 96, 3, 0.6, 1.8, 100), ('organ', 19, 36, 84, 3, 1.4, 2.0, 90)]
DRUMS = [('kick', 36, 110), ('snare', 38, 100), ('rim', 37, 100), ('hat', 42, 90), ('hatp', 44, 90), ('crash', 49, 100), ('ride', 51, 90),
         ('wood', 76, 100), ('tri', 81, 90), ('tamb', 54, 90), ('clap', 39, 100), ('brush', 40, 70), ('tom', 45, 100), ('cym', 57, 90)]

def vlq(n):
    b = [n & 0x7F]; n >>= 7
    while n: b.append(0x80 | (n & 0x7F)); n >>= 7
    return bytes(reversed(b))

def write_midi(path, events, tpq=480, bpm=120):
    """events: [(time_sec, bytes_status...)] — одна дорожка."""
    spt = 60.0 / bpm / tpq
    ev = sorted(events, key=lambda e: (e[0], e[1][0] & 0xF0 == 0x90))
    trk = bytearray(); last = 0
    trk += vlq(0) + bytes([0xFF, 0x51, 0x03]) + int(60e6 / bpm).to_bytes(3, 'big')
    for t, msg in ev:
        tick = int(round(t / spt)); trk += vlq(max(0, tick - last)) + bytes(msg); last = tick
    trk += vlq(0) + bytes([0xFF, 0x2F, 0x00])
    data = b'MThd' + (6).to_bytes(4, 'big') + (0).to_bytes(2, 'big') + (1).to_bytes(2, 'big') + tpq.to_bytes(2, 'big')
    data += b'MTrk' + len(trk).to_bytes(4, 'big') + trk
    open(path, 'wb').write(data)

def samples():
    import numpy as np, wave
    sf2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
    if not os.path.exists(sf2): raise RuntimeError('нет FluidR3_GM.sf2')
    D = os.path.join(MEDIA, 'samples'); os.makedirs(D, exist_ok=True)
    tmp = os.path.join(D, '_tmp'); os.makedirs(tmp, exist_ok=True)
    SR = 44100; man = {'sr': 32000, 'inst': {}, 'src': 'FluidR3_GM (Frank Wen, MIT)'}
    def render(name, events, total):
        mid = os.path.join(tmp, name + '.mid'); wav = os.path.join(tmp, name + '.wav')
        write_midi(mid, events)
        sh(['fluidsynth', '-ni', '-g', '0.7', '-R', '0', '-C', '0', '-r', str(SR), '-F', wav, sf2, mid])
        with wave.open(wav) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
            ch = w.getnchannels()
        a = a.reshape(-1, ch).mean(1)
        need = int(total * SR)
        if len(a) < need: a = np.pad(a, (0, need - len(a)))
        return a
    def encode(name, a, slot):
        wav = os.path.join(tmp, name + '_o.wav')
        pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16)
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
        out = os.path.join(D, name + '.mp3')
        sh(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', '32000', '-c:a', 'libmp3lame', '-b:a', '80k', '-y', out])
        return os.path.getsize(out)
    for (name, prog, lo, hi, step, hold, slot, vel) in INSTR:
        notes = list(range(lo, hi + 1, step))
        ev = [(0, [0xC0, prog])]
        for i, n in enumerate(notes):
            t0 = 0.2 + i * slot
            ev += [(t0, [0x90, n, vel]), (t0 + hold, [0x80, n, 0])]
        a = render(name, ev, 0.2 + len(notes) * slot + 1)
        # по ячейкам: выровнять начало ноты, мягко погасить хвост
        cells = []
        for i in range(len(notes)):
            s0 = int((0.2 + i * slot) * SR); c = a[s0:s0 + int(slot * SR)].copy()
            nz = np.where(np.abs(c) > 1e-3)[0]; st = max(0, (nz[0] - 16) if len(nz) else 0)
            c = np.concatenate([c[st:], np.zeros(st, np.float32)])
            f = int(0.08 * SR); c[-f:] *= np.linspace(1, 0, f)
            cells.append(c)
        A = np.concatenate(cells); pk = np.max(np.abs(A)) or 1; A = A / pk * 0.89
        size = encode(name, A, slot)
        man['inst'][name] = {'file': name + '.mp3', 'slot': slot, 'notes': notes, 'hold': hold}
        log('inst', name, len(notes), 'notes', size, 'bytes')
    # ударные: одна дорожка, канал 10
    slot = 1.2; ev = []
    for i, (name, n, vel) in enumerate(DRUMS):
        t0 = 0.2 + i * slot; ev += [(t0, [0x99, n, vel]), (t0 + 0.3, [0x89, n, 0])]
    a = render('drums', ev, 0.2 + len(DRUMS) * slot + 1)
    cells = []
    for i in range(len(DRUMS)):
        s0 = int((0.2 + i * slot) * SR); c = a[s0:s0 + int(slot * SR)].copy()
        nz = np.where(np.abs(c) > 1e-3)[0]; st = max(0, (nz[0] - 8) if len(nz) else 0)
        c = np.concatenate([c[st:], np.zeros(st, np.float32)]); f = int(0.05 * SR); c[-f:] *= np.linspace(1, 0, f); cells.append(c)
    A = np.concatenate(cells); A = A / (np.max(np.abs(A)) or 1) * 0.89
    size = encode('drums', A, slot)
    man['inst']['drums'] = {'file': 'drums.mp3', 'slot': slot, 'hits': [d[0] for d in DRUMS]}
    log('drums', size)
    json.dump(man, open(os.path.join(D, 'index.json'), 'w'), indent=1)
    shutil.rmtree(tmp, ignore_errors=True)

# ---------------------------------------------------------------- дополнительные фото-материалы Poly Haven (CC0)
PH = 'https://api.polyhaven.com'
TEX_SLOTS = [
    ('leather',  dict(must=[['leather']], prefer=['brown', 'old', 'worn', 'dark'], no=['white', 'pattern', 'aerial'], ids=['brown_leather'], m=0.5)),
    ('fabric',   dict(must=[['fabric', 'cloth', 'wool', 'tweed', 'woven']], prefer=['wool', 'tweed', 'woven'], no=['pattern', 'floral', 'carpet'], ids=['poly_wool_herringbone', 'wool_boucle'], m=0.4)),
    ('fabric2',  dict(must=[['fabric', 'cloth', 'linen', 'cotton']], prefer=['linen', 'cotton'], no=['pattern', 'floral'], ids=['rough_linen', 'cotton_jersey'], m=0.4)),
    ('cliff',    dict(must=[['rock', 'cliff']], prefer=['cliff'], no=['floor'], ids=['tiger_rock', 'cliff_side'], m=6)),
    ('cliff2',   dict(must=[['rock', 'cliff']], prefer=['cliff'], no=['floor'], ids=['cliff_side', 'rock_face', 'worn_rock_natural_01'], m=6)),
    ('scree',    dict(must=[['rocks', 'rocky']], prefer=['ground'], no=['wall'], ids=['rocky_trail_02', 'rocks_ground_05'], m=3)),
    ('rock_moss', dict(must=[['rock']], prefer=['moss'], no=['wall'], ids=['mossy_rock', 'rock_pitted_mossy', 'lichen_rock'], m=3)),
    ('tunnel',   dict(must=[['stone', 'brick']], prefer=['wall'], no=['floor'], ids=['castle_brick_01', 'medieval_blocks_03', 'rustic_stone_wall_02'], m=3)),
    ('wood_var', dict(must=[['wood']], prefer=['veneer'], no=['plank'], ids=['european_walnut_veneer_04', 'silver_oak_veneer_02'], m=0.8)),
    ('factory',  dict(must=[['brick']], prefer=['red'], no=['floor'], ids=['factory_brick', 'red_bricks_02', 'castle_brick_02_red'], m=3)),
    ('metal_old', dict(must=[['metal']], prefer=['rust', 'painted'], no=['floor'], ids=['green_metal_rust', 'rusty_painted_metal'], m=1.5)),
]

def text_of(i, a): return ' '.join([i.replace('_', ' '), a.get('name', ''), ' '.join(a.get('tags', [])), ' '.join(a.get('categories', []))]).lower()

def tex():
    from PIL import Image, ImageOps
    D = os.path.join(MEDIA, 'tex'); os.makedirs(D, exist_ok=True)
    assets = jget(PH + '/assets?t=textures'); used = set(); man = {}; SIZE = 512
    old = {}
    try: old = json.load(open(os.path.join(ROOT, 'game', 'tex', 'manifest.json'), encoding='utf-8')).get('lay', {})
    except Exception: pass
    for v in (old or {}).values():
        if isinstance(v, dict) and v.get('id'): used.add(v['id'])
    cands = {}
    for slot, spec in TEX_SLOTS:
        L = []
        for i, a in assets.items():
            t = text_of(i, a)
            if any(re.search(r'\b' + re.escape(n) + r'\b', t) for n in spec.get('no', [])): continue
            if not all(any(re.search(r'\b' + re.escape(w), t) for w in g) for g in spec['must']): continue
            s = 10 * sum(1 for w in spec.get('prefer', []) if re.search(r'\b' + re.escape(w), t)) + math.log10(1 + a.get('download_count', 0))
            L.append((s, i))
        L.sort(reverse=True); cands[slot] = [[i, round(s, 1)] for s, i in L[:10]]
        aid = next((i for i in spec.get('ids', []) if i in assets and i not in used), None) or next((i for s, i in L if i not in used), None)
        if not aid: log('tex', slot, 'nothing'); continue
        used.add(aid); a = assets[aid]
        try:
            files = jget(PH + '/files/' + aid)
            def find(names):
                low = {k.lower(): k for k in files}
                for n in names:
                    if n.lower() in low: return files[low[n.lower()]]
            def img(node):
                if not node: return None
                for r in ('1k', '2k'):
                    v = node.get(r)
                    if v:
                        for f in ('jpg', 'png'):
                            if f in v: return get(v[f]['url'])
            col = img(find(['Diffuse', 'diff', 'Color'])); nor = img(find(['nor_gl', 'Normal', 'nor_dx'])); arm = img(find(['arm']))
            rough = None if arm else img(find(['Rough', 'roughness'])); ao = None if arm else img(find(['AO', 'ao']))
            load = lambda b, m='RGB': Image.open(io.BytesIO(b)).convert(m).resize((SIZE, SIZE), Image.LANCZOS)
            load(col).save(os.path.join(D, slot + '_c.jpg'), 'JPEG', quality=86, optimize=True)
            if nor:
                n = load(nor)
                if find(['nor_gl', 'Normal']) is None:
                    r_, g_, b_ = n.split(); n = Image.merge('RGB', (r_, ImageOps.invert(g_), b_))
                n.save(os.path.join(D, slot + '_n.jpg'), 'JPEG', quality=90, optimize=True)
            if arm: load(arm).save(os.path.join(D, slot + '_r.jpg'), 'JPEG', quality=88, optimize=True)
            elif rough:
                rr = load(rough, 'L'); aa = load(ao, 'L') if ao else Image.new('L', (SIZE, SIZE), 255)
                Image.merge('RGB', (aa, rr, Image.new('L', (SIZE, SIZE), 0))).save(os.path.join(D, slot + '_r.jpg'), 'JPEG', quality=88, optimize=True)
            dims = a.get('dimensions')
            man[slot] = {'id': aid, 'name': a.get('name', aid), 'authors': list((a.get('authors') or {}).keys()), 'm': round(max(dims) / 1000, 2) if dims else spec['m'], 'nor': bool(nor), 'arm': bool(arm or rough)}
            log('tex', slot, '->', aid)
        except Exception as e:
            log('tex error', slot, aid, e)
    json.dump({'lay': man, 'cands': cands}, open(os.path.join(D, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- голос диктора (Silero TTS v4_ru; некоммерческая лицензия CC BY-NC-SA)
def voice():
    import torch, numpy as np, wave
    sys.path.insert(0, TOOLS)
    from ru_norm import norm
    L = json.load(open(os.path.join(TOOLS, 'voice_lines.json'), encoding='utf-8'))
    D = os.path.join(MEDIA, 'voice'); os.makedirs(D, exist_ok=True)
    idx_path = os.path.join(D, 'index.json')
    idx = json.load(open(idx_path, encoding='utf-8')) if os.path.exists(idx_path) else {}
    torch.set_num_threads(max(1, os.cpu_count() or 2))
    model, _ = torch.hub.load(repo_or_dir='snakers4/silero-models', model='silero_tts', language='ru', speaker='v4_ru', trust_repo=True)
    SR = 48000; tmp = os.path.join(D, '_t.wav'); n = 0; t0 = time.time()
    for e in L:
        h, text, spk = e['h'], norm(e['s']), e.get('v', 'aidar')
        out = os.path.join(D, h + '.mp3')
        if h in idx and os.path.exists(out): continue
        try:
            parts = [p for p in re.split(r'(?<=[.!?…])\s+', text) if p.strip()]
            wavs = []
            for p in parts:
                # длинные предложения — кусками по запятым (модель ограничена ~800 символами)
                chunks = [p] if len(p) < 700 else [c for c in re.split(r'(?<=[,;:—])\s+', p) if c.strip()]
                for c in chunks:
                    a = model.apply_tts(text=c, speaker=spk, sample_rate=SR, put_accent=True, put_yo=True)
                    wavs.append(a.numpy()); wavs.append(np.zeros(int(SR * (0.32 if c is chunks[-1] else 0.14)), np.float32))
            a = np.concatenate(wavs[:-1]) if len(wavs) > 1 else wavs[0]
            pk = float(np.max(np.abs(a))) or 1.0; a = a / pk * 0.92
            with wave.open(tmp, 'wb') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a * 32767).astype(np.int16).tobytes())
            sh(['ffmpeg', '-v', 'error', '-i', tmp, '-af', 'highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=120,loudnorm=I=-17:TP=-1.5:LRA=9',
                '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k', '-y', out])
            idx[h] = round(len(a) / SR, 2); n += 1
            if n % 20 == 0:
                json.dump(idx, open(idx_path, 'w'), indent=0); log('voice', n, 'lines', round(time.time() - t0), 's')
        except Exception as ex:
            log('voice error', h, ex)
    if os.path.exists(tmp): os.remove(tmp)
    json.dump(idx, open(idx_path, 'w'), indent=0)
    log('voice done', n, 'new lines; total', len(idx))


# ---------------------------------------------------------------- поиск звуков и записей на Commons (0.19)
def audio_titles(qs, per=50):
    """Файлы-звуки по поисковым фразам и категориям (Category:… — файлы категории и её подкатегорий первого уровня)."""
    found = {}
    for q in qs:
        try:
            L = []
            if q.startswith('Category:'):
                cats = [q]
                r = capi(action='query', list='categorymembers', cmtitle=q, cmtype='subcat', cmlimit=100)
                cats += [x['title'] for x in r.get('query', {}).get('categorymembers', [])][:40]
                for c in cats:
                    cont = {}
                    for _ in range(6):
                        r = capi(action='query', list='categorymembers', cmtitle=c, cmtype='file', cmlimit=500, **cont)
                        L += [x['title'] for x in r.get('query', {}).get('categorymembers', [])]
                        if 'continue' not in r: break
                        cont = {'cmcontinue': r['continue']['cmcontinue']}
                    time.sleep(0.2)
            else:
                r = capi(action='query', list='search', srsearch=q + ' filetype:audio', srnamespace=6, srlimit=per)
                L = [x['title'] for x in r.get('query', {}).get('search', [])]
            L = [t for t in L if re.search(r'\.(ogg|oga|opus|mp3|flac|wav|webm)$', t, re.I)]
            log('search', q, '->', len(L))
            for t in L: found.setdefault(t, q)
        except Exception as e:
            log('search error', q, e)
        time.sleep(0.25)
    return found

def audio_scan_to(name, qs, dmin, dmax, per=50):
    D = os.path.join(MEDIA, name); os.makedirs(D, exist_ok=True)
    found = audio_titles(qs, per)
    info = video_info(sorted(found))
    out = []
    for t, q in found.items():
        v = info.get(t)
        if not v: continue
        lic = meta_val(v, 'LicenseShortName'); dur = duration_of(v); size = v.get('size') or 0
        if dur < dmin or dur > dmax: continue
        if not re.search(r'public domain|\bpd\b|cc0|cc[ -]by(?![ -]nc)', lic, re.I): continue
        ders = {d.get('transcodekey', ''): d.get('src') for d in (v.get('derivatives') or [])}
        out.append({'title': t, 'q': q, 'dur': round(dur, 1), 'kbps': round(size * 8 / max(1, dur) / 1000), 'mime': v.get('mime'), 'lic': lic,
                    'artist': meta_val(v, 'Artist')[:160], 'credit': meta_val(v, 'Credit')[:160], 'date': meta_val(v, 'DateTimeOriginal')[:60],
                    'desc': meta_val(v, 'ImageDescription')[:300], 'page': v.get('descriptionurl'), 'url': v.get('url'), 'mp3': ders.get('mp3'), 'size': size})
    out.sort(key=lambda e: (e['q'], -e['kbps']))
    json.dump(out, open(os.path.join(D, 'scan.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    log(name, 'scan: candidates', len(found), 'kept', len(out))

MUS_QS = ['"United States Marine Band"', '"Marine Band"', '"U.S. Marine Band"', '"United States Navy Band"', '"U.S. Navy Band"', '"Navy Band"',
          '"United States Army Band"', '"U.S. Army Band"', '"Army Field Band"', '"Air Force Band"', '"Coast Guard Band"', '"Air Force Heritage"',
          'Musopen', '"Musopen Symphony"', 'Sousa', '"Stars and Stripes Forever"', '"Washington Post march"', '"Semper Fidelis"', '"Liberty Bell march"',
          '"The Thunderer"', '"El Capitan"', '"Manhattan Beach"', '"Hands Across the Sea"', '"King Cotton"', '"Invincible Eagle"',
          'Strauss waltz', '"Blue Danube"', '"Emperor Waltz"', '"Vienna Woods"', '"Radetzky March"', 'Waldteufel', '"Skaters Waltz"', 'Lehár', '"Merry Widow"',
          'Offenbach', '"Galop infernal"', '"Orpheus in the Underworld"', 'Suppé', '"Light Cavalry"', '"Poet and Peasant"', '"William Tell Overture"',
          'Fučík', '"Entry of the Gladiators"', '"Florentiner"', 'Joplin rag', '"Maple Leaf Rag"', '"The Entertainer"', 'ragtime piano', 'cakewalk',
          'tango orchestra', '"La Cumparsita"', '"El Choclo"', 'foxtrot', 'Charleston dance', '"Tiger Rag"', 'dixieland', 'polka', 'galop', 'mazurka',
          'Glinka', 'Tchaikovsky', 'Rimsky-Korsakov', 'Mussorgsky', 'Borodin', 'Dvořák', 'Grieg', '"Peer Gynt"', 'Satie', 'Debussy', 'Elgar',
          '"Pomp and Circumstance"', '"Rhapsody in Blue"', 'Gershwin', '"Hungarian Dance"', '"Hungarian Rhapsody"', 'Bizet Carmen', '"Ride of the Valkyries"',
          '"silent film" music', 'photoplay music', 'overture orchestra', 'military march', 'brass band', 'waltz orchestra', 'march band',
          'Category:United States Marine Band', 'Category:Musopen', 'Category:Audio files of the United States Marine Band']

SFX_QS = ['crowd cheering', 'cheering crowd', 'applause', 'crowd applause', 'stadium crowd', 'crowd ambience', 'crowd murmur', 'hurrah', 'fans cheering',
          'crowd noise', 'people talking crowd', 'steam locomotive whistle', 'steam whistle', 'train whistle', 'steam locomotive', 'steam train', 'locomotive',
          'church bell', 'church bells', 'bells ringing', 'birdsong', 'bird song', 'dawn chorus', 'Turdus merula', 'Alauda arvensis', 'Fringilla coelebs',
          'Erithacus rubecula', 'Passer domesticus', 'Hirundo rustica', 'Cuculus canorus', 'Parus major', 'Luscinia megarhynchos', 'cicada', 'crickets',
          'dog barking', 'horse neigh', 'horse whinny', 'horse hooves', 'horse carriage', 'cow', 'rooster', 'goat bells', 'sheep',
          'klaxon', 'car horn', 'bulb horn', 'vintage car', 'Ford Model T', 'antique car', 'veteran car', 'old car engine', 'car engine', 'motorcycle engine',
          'bugle call', 'trumpet fanfare', 'fanfare', 'starting pistol', 'pistol shot', 'megaphone', 'wind', 'rain', 'thunder', 'sea waves', 'surf',
          'river', 'stream water', 'brass band street', 'accordion street', 'market ambience', 'village ambience', 'street ambience', 'city ambience',
          'forest ambience', 'countryside ambience', 'Category:Sounds of crowds', 'Category:Sounds of birds', 'Category:Sounds of trains', 'Category:Bells (sounds)']

def music_scan(): audio_scan_to('music', MUS_QS, 50, 1200, 50)
def sfx_scan(): audio_scan_to('sfx', SFX_QS, 1.5, 900, 40)

# ---------------------------------------------------------------- пробы голоса: какие модели Silero есть и как звучат
PROBE_LINES = ['Париж, июнь тысяча восемьсот девяносто пятого года. Двадцать два экипажа выстроились у Триумфальной арки, и толпа замерла в ожидании старта.',
               'Внимание! Номер седьмой выходит вперёд! Какая скорость — шестьдесят километров в час по пыльной дороге!',
               'Вы уверены, что завод выдержит такой заказ? Рабочие трудятся в две смены, а склад уже переполнен.']
def voice_probe():
    import torch, numpy as np, wave, glob
    D = os.path.join(MEDIA, 'voice_probe'); os.makedirs(D, exist_ok=True)
    torch.set_num_threads(max(1, os.cpu_count() or 2))
    model, _ = torch.hub.load(repo_or_dir='snakers4/silero-models', model='silero_tts', language='ru', speaker='v4_ru', trust_repo=True)
    ymls = glob.glob(os.path.join(torch.hub.get_dir(), '*silero*', 'models.yml'))
    ids = ['v4_ru']
    if ymls:
        txt = open(ymls[0], encoding='utf-8').read(); open(os.path.join(D, 'models.yml'), 'w', encoding='utf-8').write(txt)
        m = re.search(r'\n\s*ru:\n(.*?)(\n\s{2,4}[a-z]{2}:\n|\Z)', txt[txt.find('tts_models'):], re.S)
        ids = sorted(set(re.findall(r'\n\s+(v\d[\w]*_ru|ru_v\d\w*)\s*:', m.group(1) if m else txt)))
        log('ru tts models', ids)
    res = {}
    for mid in ids:
        if not re.match(r'v[45]', mid): continue
        try:
            mdl, _ = torch.hub.load(repo_or_dir='snakers4/silero-models', model='silero_tts', language='ru', speaker=mid, trust_repo=True)
            spk = [x for x in getattr(mdl, 'speakers', []) if x != 'random']
            log('model', mid, 'speakers', spk)
            res[mid] = {'speakers': spk, 'rtf': {}}
            for sp in spk:
                t0 = time.time(); parts = []; SR = 48000
                for L in PROBE_LINES:
                    try: a = mdl.apply_tts(text=L, speaker=sp, sample_rate=SR, put_accent=True, put_yo=True)
                    except TypeError: a = mdl.apply_tts(text=L, speaker=sp, sample_rate=SR)
                    parts.append(a.numpy()); parts.append(np.zeros(int(SR * 0.5), np.float32))
                a = np.concatenate(parts); el = time.time() - t0
                res[mid]['rtf'][sp] = round(el / (len(a) / SR), 3)
                tmp = os.path.join(D, '_t.wav')
                with wave.open(tmp, 'wb') as w:
                    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(a / (np.max(np.abs(a)) or 1) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
                sh(['ffmpeg', '-v', 'error', '-i', tmp, '-c:a', 'flac', '-y', os.path.join(D, '%s_%s.flac' % (mid, sp))])
                os.remove(tmp)
                log('probe', mid, sp, 'rtf', res[mid]['rtf'][sp])
        except Exception as e:
            log('probe error', mid, repr(e)[:300]); res[mid] = {'error': repr(e)[:300]}
    json.dump(res, open(os.path.join(D, 'probe.json'), 'w'), indent=1)


# ---------------------------------------------------------------- голос 0.19: Silero v5_5_ru, 48 кГц, мастеринг, mp3 64 кбит/с (без пережатия при выкладке)
def voice5():
    import torch, numpy as np, wave
    sys.path.insert(0, TOOLS)
    from ru_norm import norm
    L = json.load(open(os.path.join(TOOLS, 'voice_lines.json'), encoding='utf-8'))
    D = os.path.join(MEDIA, 'voice'); os.makedirs(D, exist_ok=True)
    idx_path = os.path.join(D, 'index.json'); done_path = os.path.join(D, 'v5.json')
    idx = json.load(open(idx_path, encoding='utf-8')) if os.path.exists(idx_path) else {}
    done = set(json.load(open(done_path))) if os.path.exists(done_path) else set()
    torch.set_num_threads(max(1, os.cpu_count() or 2))
    MID = 'v5_5_ru'
    model, _ = torch.hub.load(repo_or_dir='snakers4/silero-models', model='silero_tts', language='ru', speaker=MID, trust_repo=True)
    SR = 48000; tmp = os.path.join(D, '_t.wav'); n = 0; t0 = time.time()
    def tts(c, spk):
        try: return model.apply_tts(text=c, speaker=spk, sample_rate=SR, put_accent=True, put_yo=True, put_stress_homo=True, put_yo_homo=True)
        except TypeError: return model.apply_tts(text=c, speaker=spk, sample_rate=SR, put_accent=True, put_yo=True)
    want = {e['h'] for e in L}
    for e in L:
        h, text, spk = e['h'], norm(e['s']), e.get('v', 'aidar')
        out = os.path.join(D, h + '.mp3')
        if h in done and h in idx and os.path.exists(out): continue
        try:
            parts = [p for p in re.split(r'(?<=[.!?…])\s+', text) if p.strip()]
            wavs = []
            for p in parts:
                chunks = [p] if len(p) < 700 else [c for c in re.split(r'(?<=[,;:—])\s+', p) if c.strip()]
                for c in chunks:
                    a = tts(c, spk)
                    wavs.append(a.numpy()); wavs.append(np.zeros(int(SR * (0.36 if c is chunks[-1] else 0.16)), np.float32))
            a = np.concatenate(wavs[:-1]) if len(wavs) > 1 else wavs[0]
            a = np.concatenate([np.zeros(int(SR * 0.05), np.float32), a, np.zeros(int(SR * 0.12), np.float32)])
            pk = float(np.max(np.abs(a))) or 1.0; a = a / pk * 0.9
            with wave.open(tmp, 'wb') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a * 32767).astype(np.int16).tobytes())
            warm = 'equalizer=f=160:t=q:w=1.1:g=1.5,' if spk in ('aidar', 'eugene') else 'equalizer=f=240:t=q:w=1.2:g=1,'
            sh(['ffmpeg', '-v', 'error', '-i', tmp, '-af', 'highpass=f=60,' + warm + 'deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-20dB:ratio=2.2:attack=8:release=160,loudnorm=I=-16:TP=-1.5:LRA=8',
                '-ac', '1', '-ar', '32000', '-c:a', 'libmp3lame', '-b:a', '64k', '-y', out])
            idx[h] = round(len(a) / SR, 2); done.add(h); n += 1
            if n % 25 == 0:
                json.dump(idx, open(idx_path, 'w'), indent=0); json.dump(sorted(done), open(done_path, 'w'))
                log('voice5', n, 'lines', round(time.time() - t0), 's')
        except Exception as ex:
            log('voice5 error', h, repr(ex)[:300])
    if os.path.exists(tmp): os.remove(tmp)
    # строки, которых больше нет в игре, — убрать
    for h in list(idx):
        if h not in want:
            idx.pop(h, None); done.discard(h)
            try: os.remove(os.path.join(D, h + '.mp3'))
            except Exception: pass
    json.dump(idx, open(idx_path, 'w'), indent=0); json.dump(sorted(done), open(done_path, 'w'))
    log('voice5 done', n, 'new lines; total', len(idx), 'v5', len(done))


# ---------------------------------------------------------------- 0.19: оркестровые записи и звуки окружения (Commons) → короткие файлы для игры
def _src_for(v, limit=70e6):
    """Оригинал, если он не слишком велик; иначе mp3-перекодировка Commons."""
    ders = {d.get('transcodekey', ''): d.get('src') for d in (v.get('derivatives') or [])}
    if (v.get('size') or 0) > limit and ders.get('mp3'): return ders['mp3']
    return v.get('url')

def music_cut():
    L = json.load(open(os.path.join(TOOLS, 'music.json'), encoding='utf-8'))
    D = os.path.join(MEDIA, 'music', 'clips'); os.makedirs(D, exist_ok=True)
    info = video_info(sorted({e['title'] for e in L}))
    man_path = os.path.join(D, 'index.json')
    man = json.load(open(man_path, encoding='utf-8')) if os.path.exists(man_path) else {}
    tmp = '/tmp/_music_src.bin'
    for e in L:
        cid = e['id']; out = os.path.join(D, cid + '.m4a'); v = info.get(e['title'])
        if not v: log('music: no info', e['title']); continue
        key = '%s|%s|%s|%s|v2' % (e['title'], e.get('from'), e['d'], e.get('t', 0))
        if os.path.exists(out) and man.get(cid, {}).get('key') == key: continue
        try:
            download(_src_for(v), tmp, 400e6)
            dur = duration_of(v) or e.get('dur') or e['d']; d = min(e['d'], dur)
            t0 = max(0, dur - d - 1.5) if e.get('from') == 'end' else e.get('t', 0)
            fo = 3.5 if (t0 + d) < dur - 1 else 1.0
            sh(['ffmpeg', '-v', 'error', '-ss', '%.2f' % t0, '-i', tmp, '-t', '%.2f' % d, '-vn',
                '-af', 'afade=t=in:st=0:d=%.2f,afade=t=out:st=%.2f:d=%.2f,loudnorm=I=-16:TP=-1.2:LRA=12' % (0.25 if t0 > 0 else 0.02, max(0, d - fo), fo),
                '-ac', '2', '-ar', '44100', '-c:a', 'aac', '-b:a', '72k', '-movflags', '+faststart', '-y', out])
            man[cid] = {'key': key, 'title': e['title'], 'page': v.get('descriptionurl'), 'lic': meta_val(v, 'LicenseShortName'), 'by': meta_val(v, 'Artist')[:160],
                        'cap': e.get('cap', ''), 'st': e.get('st'), 'y': e.get('y'), 'mood': e.get('mood'), 'd': round(d, 1), 'size': os.path.getsize(out)}
            log('music', cid, round(d), 's', os.path.getsize(out))
        except Exception as ex:
            log('music error', cid, repr(ex)[:300])
        json.dump(man, open(man_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if os.path.exists(tmp): os.remove(tmp)

def sfx_cut():
    L = json.load(open(os.path.join(TOOLS, 'sfx.json'), encoding='utf-8'))
    D = os.path.join(MEDIA, 'sfx', 'clips'); os.makedirs(D, exist_ok=True)
    info = video_info(sorted({e['title'] for e in L}))
    man_path = os.path.join(D, 'index.json')
    man = json.load(open(man_path, encoding='utf-8')) if os.path.exists(man_path) else {}
    tmp = '/tmp/_sfx_src.bin'
    for e in L:
        cid = e['id']; v = info.get(e['title'])
        if not v: log('sfx: no info', e['title']); continue
        ref = e.get('ref'); out = os.path.join(D, cid + ('.flac' if ref else '.mp3'))
        key = '%s|%s|%s|v1' % (e['title'], e['t'], e['d'])
        if os.path.exists(out) and man.get(cid, {}).get('key') == key: continue
        try:
            download(_src_for(v, 90e6), tmp, 300e6)
            if ref:
                sh(['ffmpeg', '-v', 'error', '-ss', str(e['t']), '-i', tmp, '-t', str(e['d']), '-vn', '-ac', '1', '-ar', '32000', '-c:a', 'flac', '-y', out])
            else:
                d = e['d']
                sh(['ffmpeg', '-v', 'error', '-ss', str(e['t']), '-i', tmp, '-t', str(d), '-vn',
                    '-af', 'afade=t=in:st=0:d=0.05,afade=t=out:st=%.2f:d=0.05,loudnorm=I=-18:TP=-1.5:LRA=14' % max(0, d - 0.05),
                    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', '-y', out])
            man[cid] = {'key': key, 'title': e['title'], 'page': v.get('descriptionurl'), 'lic': meta_val(v, 'LicenseShortName'), 'by': meta_val(v, 'Artist')[:160],
                        'g': e.get('g'), 'd': e['d'], 'size': os.path.getsize(out), 'ref': bool(ref)}
            log('sfx', cid, os.path.getsize(out))
        except Exception as ex:
            log('sfx error', cid, repr(ex)[:300])
        json.dump(man, open(man_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if os.path.exists(tmp): os.remove(tmp)

JOBS = {'films_scan': films_scan, 'films_cut': films_cut, 'samples': samples, 'tex': tex, 'voice': voice,
        'music_scan': music_scan, 'sfx_scan': sfx_scan, 'voice_probe': voice_probe, 'voice5': voice5, 'music_cut': music_cut, 'sfx_cut': sfx_cut}

if __name__ == '__main__':
    jobs = [l.strip() for l in open(os.path.join(TOOLS, 'jobs.txt'), encoding='utf-8') if l.strip() and not l.startswith('#')]
    os.makedirs(MEDIA, exist_ok=True)
    for j in jobs:
        if j not in JOBS: log('unknown job', j); continue
        log('== job', j); t0 = time.time()
        try: JOBS[j]()
        except Exception as e: log('job failed', j, repr(e))
        log('== job', j, 'took', round(time.time() - t0), 's')
    open(os.path.join(MEDIA, 'last_run.log'), 'w', encoding='utf-8').write('\n'.join(LOG))
