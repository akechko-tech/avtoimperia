"""Забрать готовые медиа из ветки media в веб-версию (docs/) — оттуда их берёт и сборка APK.
  docs/samples — живые инструменты (+ index.js: window.SAMPLES_INDEX)
  docs/film    — отобранная кинохроника (+ index.js: window.FILMS_INDEX — метки → ролики)
  docs/voice   — голос диктора (+ index.js: window.VOICE_INDEX — ключ строки → длительность)
Запуск: python3 tools/sync_media.py [samples] [film] [voice]  (без аргументов — всё)"""
import json, os, subprocess, sys

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
    print('samples: updated', n, 'instruments', len(idx['inst']))

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
    D = os.path.join(DOCS, 'voice'); n = 0
    idx = json.loads(git('show', 'origin/media:media/voice/index.json'))
    have = {os.path.basename(f) for f in files('media/voice')}
    for h in idx:
        if h + '.mp3' in have: n += pull('media/voice/%s.mp3' % h, os.path.join(D, h + '.mp3'))
    ok = {h: d for h, d in idx.items() if h + '.mp3' in have}
    open(os.path.join(D, 'index.js'), 'w').write('window.VOICE_INDEX=' + json.dumps(ok, separators=(',', ':')) + ';\n')
    print('voice: updated', n, 'lines', len(ok))

if __name__ == '__main__':
    git('fetch', '-q', 'origin', 'media')
    what = sys.argv[1:] or ['samples', 'film', 'voice']
    for w in what:
        try: {'samples': samples, 'film': film, 'voice': voice}[w]()
        except Exception as e: print(w, 'failed:', e)
