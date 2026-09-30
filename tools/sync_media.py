"""Забрать готовые медиа из ветки media в веб-версию (docs/) — оттуда их берёт и сборка APK.
  docs/samples — живые инструменты (+ index.js: window.SAMPLES_INDEX)
  docs/film    — отобранная кинохроника (+ index.js: window.FILMS_INDEX — метки → ролики)
  docs/voice   — голос диктора (+ index.js: window.VOICE_INDEX — ключ строки → длительность)
Запуск: python3 tools/sync_media.py [samples] [film] [voice]  (без аргументов — всё)"""
import json, os, subprocess, sys, shutil, base64

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, 'docs')

def git(*a, binary=False):
    r = subprocess.run(['git', '-C', ROOT] + list(a), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if r.returncode != 0: raise RuntimeError(r.stderr.decode()[:400])
    return r.stdout if binary else r.stdout.decode()

def files(prefix):
    return [l for l in git('ls-tree', '-r', '--name-only', 'origin/media', prefix).splitlines() if l.strip()]

def pull(src, dst):
    data = git('show', 'origin/media:' + src, binary=True)
    if os.path.exists(dst) and open(dst, 'rb').read() == data: return False
    os.makedirs(os.path.dirname(dst), exist_ok=True); open(dst, 'wb').write(data); return True

def samples():
    D = os.path.join(DOCS, 'samples'); n = 0
    for f in files('media/samples'):
        if f.endswith('.mp3') or f.endswith('.json'): n += pull(f, os.path.join(D, os.path.basename(f)))
    idx = json.load(open(os.path.join(D, 'index.json')))
    open(os.path.join(D, 'index.js'), 'w').write('window.SAMPLES_INDEX=' + json.dumps(idx, separators=(',', ':')) + ';\n')
    # для APK (страница с file://: fetch не работает) — те же mp3 внутри скрипта
    pack = {k: base64.b64encode(open(os.path.join(D, I['file']), 'rb').read()).decode('ascii') for k, I in idx['inst'].items() if os.path.exists(os.path.join(D, I['file']))}
    open(os.path.join(D, 'pack.js'), 'w').write('window.SAMPLES_PACK=' + json.dumps(pack, separators=(',', ':')) + ';\n')
    print('samples: updated', n, 'instruments', len(idx['inst']), 'pack', round(os.path.getsize(os.path.join(D, 'pack.js')) / 1e6, 1), 'MB')

def film():
    D = os.path.join(DOCS, 'film'); n = 0
    sel = json.load(open(os.path.join(ROOT, 'tools', 'media', 'films.json'), encoding='utf-8'))
    have = {os.path.basename(f) for f in files('media/films/clips')}
    man = json.loads(git('show', 'origin/media:media/films/clips/index.json')) if 'index.json' in have else {}
    clips, tags = {}, {}
    for e in sel:
        cid = e['id']
        if cid + '.mp4' not in have: continue
        n += pull('media/films/clips/%s.mp4' % cid, os.path.join(D, cid + '.mp4'))
        if cid + '.jpg' in have: n += pull('media/films/clips/%s.jpg' % cid, os.path.join(D, cid + '.jpg'))
        m = man.get(cid, {})
        clips[cid] = {'cap': e.get('cap', ''), 'y': e.get('y'), 'd': e['d'], 'page': m.get('page', ''), 'lic': m.get('lic', ''), 'by': m.get('artist', '')}
        for t in e.get('tags', []): tags.setdefault(t, []).append(cid)
    open(os.path.join(D, 'index.js'), 'w', encoding='utf-8').write('window.FILMS_INDEX=' + json.dumps({'clips': clips, 'tags': tags}, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('film: updated', n, 'clips', len(clips), 'tags', {k: len(v) for k, v in tags.items()})

def voice():
    """Голос (0.19): Silero v5, mp3 64 кбит/с — копируется как есть, без пережатия."""
    D = os.path.join(DOCS, 'voice'); os.makedirs(D, exist_ok=True); n = 0
    idx = json.loads(git('show', 'origin/media:media/voice/index.json'))
    have = {os.path.basename(f) for f in files('media/voice')}
    for h in idx:
        if h + '.mp3' not in have: continue
        n += pull('media/voice/%s.mp3' % h, os.path.join(D, h + '.mp3'))
    ok = {h: d for h, d in idx.items() if h + '.mp3' in have}
    for f in os.listdir(D):
        if f.endswith('.mp3') and f[:-4] not in ok: os.remove(os.path.join(D, f))
    open(os.path.join(D, 'index.js'), 'w').write('window.VOICE_INDEX=' + json.dumps(ok, separators=(',', ':')) + ';\n')
    print('voice: updated', n, 'lines', len(ok))

def music():
    """0.19: оркестровые записи (aac 72 кбит/с) → docs/music + index.js (window.MUSIC_INDEX)."""
    D = os.path.join(DOCS, 'music'); os.makedirs(D, exist_ok=True); n = 0
    man = json.loads(git('show', 'origin/media:media/music/clips/index.json'))
    have = {os.path.basename(f) for f in files('media/music/clips')}
    idx = {}
    for cid, m in man.items():
        if cid + '.m4a' not in have: continue
        n += pull('media/music/clips/%s.m4a' % cid, os.path.join(D, cid + '.m4a'))
        t = m.get('title', '')
        perf = ('Оркестр морской пехоты США' if 'Marine' in t else 'Оркестр ВВС США' if 'Air Force' in t else 'Оркестр ВМС США' if 'Navy' in t else
                'Оркестр армии США' if 'Army' in t else 'Оркестр береговой охраны США' if 'Coast Guard' in t else 'Кевин Маклауд' if 'MacLeod' in t or 'ISRC USUAN' in t else
                'Оркестр Пола Уайтмена, 1924' if 'Whiteman' in t else 'Оркестр Марека Вебера' if 'Marek Weber' in t else 'Берлинская опера' if 'Staatsoper' in t else
                'Эдуардо Ароляс, 1917' if 'Arolas' in t else 'Оркестр ВВС США' if 'Holst' in t else 'Майкл Лаук' if 'Laucke' in t else 'Ольга Гуревич' if 'Gurevich' in t else 'Оркестр Гессенского радио' if 'Dvořák Symphony' in t or 'hr-Sinfonie' in (m.get('by') or '') else 'Пианист Эль Дуэнде Суарес' if 'Golliwog' in t else 'Musopen' if 'Musopen' in t or 'Peer Gynt Suite' in t or 'Brahms, Symphony' in t else m.get('by') or '')
        idx[cid] = {k: m.get(k) for k in ('cap', 'st', 'y', 'mood', 'd', 'lic', 'page')}; idx[cid]['by'] = perf
    for f in os.listdir(D):
        if f.endswith('.m4a') and f[:-4] not in idx: os.remove(os.path.join(D, f))
    open(os.path.join(D, 'index.js'), 'w', encoding='utf-8').write('window.MUSIC_INDEX=' + json.dumps(idx, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('music: updated', n, 'tracks', len(idx))

# авторы, которых нет в метаданных Commons (страница записи — источник)
SFX_BY = {'skylark': 'British Library (Wildlife Sounds)'}

def sfx():
    """0.19: звуки мира (mp3 64 кбит/с) → docs/sfx + index.js (window.SFX_INDEX)."""
    D = os.path.join(DOCS, 'sfx'); os.makedirs(D, exist_ok=True); n = 0
    man = json.loads(git('show', 'origin/media:media/sfx/clips/index.json'))
    have = {os.path.basename(f) for f in files('media/sfx/clips')}
    idx = {}
    for cid, m in man.items():
        if m.get('ref') or cid + '.mp3' not in have: continue
        n += pull('media/sfx/clips/%s.mp3' % cid, os.path.join(D, cid + '.mp3'))
        idx[cid] = {k: m.get(k) for k in ('g', 'd', 'by', 'lic', 'page')}
        if not idx[cid].get('by'): idx[cid]['by'] = SFX_BY.get(cid, 'Wikimedia Commons')
    for f in os.listdir(D):
        if f.endswith('.mp3') and f[:-4] not in idx: os.remove(os.path.join(D, f))
    open(os.path.join(D, 'index.js'), 'w', encoding='utf-8').write('window.SFX_INDEX=' + json.dumps(idx, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('sfx: updated', n, 'sounds', len(idx))

# Лица гонщиков (0.21): из снимков конвейера — только проверенные вручную: на фото именно этот гонщик
# (поиск по Викиданным иногда находил однофамильцев — писателей, актёров, художников; их здесь нет; нет и неудачных вырезок)
FACE_OK = set("""levassor de_dion a_michelin l_bollee charron de_knyff chasseloup jenatzy levegh winton jellinek rolls fournier thery
  l_renault m_renault vanderbilt m_farman h_farman lancia h_ford oldfield wagner hemery christie szisz robertson l_chevrolet
  goux lautenschlager g_boillot depalma resta harroun porsche rickenbacker kl_guinness sailer milton f_elliott murphy ferrari
  campari a_maserati benoist brilli_peri nuvolari parry_thomas materassi junek caracciola costantini barnato benjafield stuck
  ivanowski chiron etancelin birkin keech shaw varzi""".split())
def faces():
    idx = json.loads(git('show', 'origin/media:media/faces/index.json'))
    out, cred = {}, {}
    for k, v in sorted(idx.items()):
        if k not in FACE_OK or 'g' not in v: continue
        out[k] = {'g': v['g'], 'w': v.get('w', 24), 'h': v.get('h', 32)}
        cred[k] = {'file': v.get('file', ''), 'by': v.get('by', ''), 'lic': v.get('lic', ''), 'page': v.get('page', '')}
    dst = os.path.join(ROOT, 'game', 'src', 'js', '016b-faces.js')
    src = open(dst, encoding='utf-8').read()
    fn = src[src.index('// раскодировать один раз'):]
    js = ('/* Лица гонщиков по историческим фото (Wikimedia Commons, найдены по Википедии и Викиданным, проверены вручную):\n'
          '   серый снимок 24×32 — для 3D-головы (0.21). Файл собирает tools/sync_media.py faces */\n'
          'const FACES=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
          'const FACE_CREDITS=' + json.dumps(cred, ensure_ascii=False, separators=(',', ':')) + ';\n' + fn)
    open(dst, 'w', encoding='utf-8').write(js)
    print('faces:', len(out), 'of', len(idx), 'approved; js', len(js))

def terrain():
    """Реальные трассы (ТЗ 0.18, раздел 2): media/terrain/<id>.json → docs/terrain/<id>.js (подгружается перед гонкой скриптом:
    в APK со страницы file:// fetch не работает). Размер каждой — не больше 300 КБ."""
    D = os.path.join(DOCS, 'terrain'); os.makedirs(D, exist_ok=True); n = 0; sizes = {}
    for f in files('media/terrain'):
        if not f.endswith('.json'): continue
        rid = os.path.basename(f)[:-5]; data = json.loads(git('show', 'origin/media:' + f))
        js = '/* Трасса по настоящей местности: рельеф Copernicus DEM GLO-30, карта © участники OpenStreetMap (ODbL), цвет земли Sentinel-2 cloudless 2016 (EOX, CC BY 4.0) */\n' + \
             'window.REAL_TRACKS=window.REAL_TRACKS||{};window.REAL_TRACKS[' + json.dumps(rid) + ']=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
        p = os.path.join(D, rid + '.js'); sizes[rid] = round(len(js.encode('utf-8')) / 1024)
        if not os.path.exists(p) or open(p, encoding='utf-8').read() != js:
            open(p, 'w', encoding='utf-8').write(js); n += 1
    print('terrain: updated', n, 'tracks', sizes)

if __name__ == '__main__':
    git('fetch', '-q', 'origin', 'media')
    what = sys.argv[1:] or ['samples', 'film', 'voice', 'music', 'sfx']
    for w in what:
        try: {'samples': samples, 'film': film, 'voice': voice, 'music': music, 'sfx': sfx, 'faces': faces, 'terrain': terrain}[w]()
        except Exception as e: print(w, 'failed:', e)
