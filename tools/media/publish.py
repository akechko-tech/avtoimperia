"""0.38: голос и музыка — в релизах GitHub, а не на сайте (GitHub Pages вмещает 1 ГБ, сайт подошёл к пределу).
Запускается в workflow «Медиа» после заданий (нужны gh и GH_TOKEN): создаёт предрелизы «music» и «voice-0»…«voice-f»
(предрелизы — чтобы не стать «latest» вместо APK), догружает в них новые и изменившиеся файлы, пишет media/published.json
(какие имена и размеры лежат в релизах) — по нему tools/sync_media.py собирает указатели для игры.
Адрес файла: https://github.com/akechko-tech/avtoimperia/releases/download/<тег>/<имя>; тег голоса — по первому знаку хэша."""
import json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEDIA = os.path.join(ROOT, 'media')
REPO = os.environ.get('GITHUB_REPOSITORY', 'akechko-tech/avtoimperia')
OUT = os.path.join(MEDIA, 'published.json')

def sh(cmd, check=True):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError(' '.join(cmd[:4]) + ': ' + (r.stderr or r.stdout)[-400:])
    return r.stdout

def assets(tag):
    """имена и размеры файлов релиза; нет релиза — создаём пустой предрелиз"""
    r = subprocess.run(['gh', 'release', 'view', tag, '-R', REPO, '--json', 'assets'], capture_output=True, text=True)
    if r.returncode != 0:
        if 'release not found' in (r.stderr + r.stdout).lower() or 'not found' in (r.stderr + r.stdout).lower():
            name = 'Медиа: оркестровые записи эпохи' if tag == 'music' else 'Медиа: голос диктора (%s)' % tag[-1]
            sh(['gh', 'release', 'create', tag, '-R', REPO, '--prerelease', '--target', 'media', '--title', name,
                '--notes', 'Файлы для сайта игры: их грузит сама игра (GitHub Pages вмещает 1 ГБ, медиа больше). Не для скачивания вручную.'])
            return {}
        raise RuntimeError(r.stderr)
    return {a['name']: a['size'] for a in json.loads(r.stdout).get('assets', [])}

def publish(tag, paths, pub):
    have = assets(tag)
    todo = [p for p in paths if have.get(os.path.basename(p)) != os.path.getsize(p)]
    for i in range(0, len(todo), 40):
        chunk = todo[i:i + 40]
        for k in range(3):
            r = subprocess.run(['gh', 'release', 'upload', tag, '-R', REPO, '--clobber'] + chunk, capture_output=True, text=True)
            if r.returncode == 0: break
            print('upload retry', tag, k, (r.stderr or '')[-200:]); time.sleep(5 * (k + 1))
        print(tag, 'uploaded', min(i + 40, len(todo)), 'of', len(todo), flush=True)
    for p in paths:
        pub[os.path.basename(p)] = os.path.getsize(p)
    return len(todo)

def main():
    pub = {'music': {}, 'voice': {}}
    try:
        old = json.load(open(OUT, encoding='utf-8'))
    except Exception:
        old = {}
    only = sys.argv[1:]  # publish.py [music] [voice]
    n = 0
    if not only or 'music' in only:
        D = os.path.join(MEDIA, 'music', 'clips')
        files = sorted(os.path.join(D, f) for f in os.listdir(D) if f.endswith('.m4a')) if os.path.isdir(D) else []
        n += publish('music', files, pub['music'])
    else:
        pub['music'] = old.get('music', {})
    if not only or 'voice' in only:
        D = os.path.join(MEDIA, 'voice')
        files = sorted(os.path.join(D, f) for f in os.listdir(D) if f.endswith('.mp3') and len(f) == 12) if os.path.isdir(D) else []
        for ch in '0123456789abcdef':
            n += publish('voice-' + ch, [p for p in files if os.path.basename(p)[0] == ch], pub['voice'])
    else:
        pub['voice'] = old.get('voice', {})
    json.dump(pub, open(OUT, 'w', encoding='utf-8'), separators=(',', ':'))
    print('published: new or changed', n, '| music', len(pub['music']), 'voice', len(pub['voice']))

if __name__ == '__main__':
    main()
