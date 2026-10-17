"""0.38: голос и музыка — в релизах GitHub, а не на сайте (GitHub Pages вмещает 1 ГБ, сайт подошёл к пределу).
Запускается в workflow «Медиа» после заданий (нужны gh и GH_TOKEN): создаёт предрелизы «music» и «voice-0»…«voice-f»
(предрелизы — чтобы не стать «latest» вместо APK), догружает в них новые и изменившиеся файлы, пишет media/published.json
(какие имена и размеры действительно лежат в релизах — сверено после загрузки) — по нему tools/sync_media.py собирает
указатели для игры. Адрес файла: https://github.com/akechko-tech/avtoimperia/releases/download/<тег>/<имя>; тег голоса —
по первому знаку хэша. Ограничения API GitHub (403/429, secondary rate limit) — ждём и повторяем; что не долилось за этот
запуск, в published.json не попадает и дольётся следующим запуском. Журнал — media/publish.log (в коммит)."""
import json, os, re, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEDIA = os.path.join(ROOT, 'media')
REPO = os.environ.get('GITHUB_REPOSITORY', 'akechko-tech/avtoimperia')
OUT = os.path.join(MEDIA, 'published.json')
LOGF = os.path.join(MEDIA, 'publish.log'); LOGL = []
T0 = time.time()

def log(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); LOGL.append('%5.0fs %s' % (time.time() - T0, s))
    try: open(LOGF, 'w', encoding='utf-8').write('\n'.join(LOGL[-600:]) + '\n')
    except Exception: pass

def gh(cmd, tries=14):
    """gh с ожиданием при ограничениях API: пауза растёт до 5 минут (всего до ~35 минут на одну команду)"""
    r = None
    for k in range(tries):
        r = subprocess.run(['gh'] + cmd, capture_output=True, text=True)
        if r.returncode == 0: return r
        err = (r.stderr or r.stdout or '').strip()
        if cmd[:2] == ['release', 'view'] and 'not found' in err.lower(): return r
        limited = re.search(r'rate limit|403|429|abuse|secondary|too many|timeout|timed out|50[234]|EOF|connection|reset', err, re.I)
        wait = min(300, 30 * (k + 1)) if limited else min(60, 5 * (k + 1))
        log('gh retry', ' '.join(cmd[:3]), k + 1, 'wait', wait, 's:', err[-220:].replace('\n', ' | '))
        time.sleep(wait)
    return r

def assets(tag):
    """имена и размеры файлов релиза (только загруженные целиком); нет релиза — создаём пустой предрелиз"""
    r = gh(['release', 'view', tag, '-R', REPO, '--json', 'assets'])
    if r.returncode != 0:
        if 'not found' in (r.stderr + r.stdout).lower():
            name = 'Медиа: оркестровые записи эпохи' if tag == 'music' else 'Медиа: голос диктора (%s)' % tag[-1]
            r2 = gh(['release', 'create', tag, '-R', REPO, '--prerelease', '--target', 'media', '--title', name,
                     '--notes', 'Файлы для сайта игры: их грузит сама игра (GitHub Pages вмещает 1 ГБ, медиа больше). Не для скачивания вручную.'])
            if r2.returncode != 0: raise RuntimeError('create ' + tag + ': ' + (r2.stderr or r2.stdout)[-300:])
            log('release created', tag); return {}
        raise RuntimeError('view ' + tag + ': ' + (r.stderr or r.stdout)[-300:])
    return {a['name']: a['size'] for a in json.loads(r.stdout).get('assets', []) if a.get('state', 'uploaded') == 'uploaded'}

def publish(tag, paths, pub):
    """долить в релиз tag файлы paths, которых там нет или размер другой; в pub — только то, что после этого лежит в релизе"""
    have = assets(tag)
    todo = [p for p in paths if have.get(os.path.basename(p)) != os.path.getsize(p)]
    bad = 0
    for i in range(0, len(todo), 40):
        chunk = todo[i:i + 40]
        r = gh(['release', 'upload', tag, '-R', REPO, '--clobber'] + chunk, tries=8)
        if r.returncode != 0: bad += len(chunk); log('upload failed', tag, os.path.basename(chunk[0]), '…', (r.stderr or r.stdout or '')[-200:].replace('\n', ' | '))
        else: log(tag, 'uploaded', min(i + 40, len(todo)), 'of', len(todo))
        time.sleep(1.5)
    if todo: have = assets(tag)
    miss = 0
    for p in paths:
        n = os.path.basename(p)
        if have.get(n) == os.path.getsize(p): pub[n] = os.path.getsize(p)
        else: miss += 1; pub.pop(n, None)
    if miss: log(tag, 'not in release yet:', miss, 'of', len(paths))
    return len(todo), miss

def save(pub):
    json.dump(pub, open(OUT, 'w', encoding='utf-8'), separators=(',', ':'))

def main():
    try: pub = json.load(open(OUT, encoding='utf-8'))
    except Exception: pub = {}
    pub.setdefault('music', {}); pub.setdefault('voice', {})
    only = sys.argv[1:]  # publish.py [music] [voice]
    n = miss = 0
    if not only or 'music' in only:
        D = os.path.join(MEDIA, 'music', 'clips')
        files = sorted(os.path.join(D, f) for f in os.listdir(D) if f.endswith('.m4a')) if os.path.isdir(D) else []
        try: a, b = publish('music', files, pub['music']); n += a; miss += b
        except Exception as e: log('music failed:', repr(e)[:300])
        save(pub)
    if not only or 'voice' in only:
        D = os.path.join(MEDIA, 'voice')
        files = sorted(os.path.join(D, f) for f in os.listdir(D) if f.endswith('.mp3') and len(f) == 12) if os.path.isdir(D) else []
        for ch in '0123456789abcdef':
            try: a, b = publish('voice-' + ch, [p for p in files if os.path.basename(p)[0] == ch], pub['voice']); n += a; miss += b
            except Exception as e: log('voice-' + ch, 'failed:', repr(e)[:300])
            save(pub)
    log('published: new or changed', n, '| music', len(pub['music']), 'voice', len(pub['voice']), '| not yet in releases', miss, '| %.0f s' % (time.time() - T0))

if __name__ == '__main__':
    main()
