"""Скачивает исторические фото из Википедии (только файлы Wikimedia Commons)
и вшивает их в приложение: app/src/main/assets/img + manifest.js.
Запускается в GitHub Actions перед сборкой APK. Ошибки не валят сборку."""
import json, os, re, urllib.parse, urllib.request, hashlib, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'app', 'src', 'main', 'assets', 'img')
UA = 'AvtoimperiaBuild/1.0 (https://github.com/akechko-tech/avtoimperia; game build)'
BAD = re.compile(r'logo|map|layout|circuit|coat_of_arms|flag|emblem|\.svg$', re.I)

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def main():
    os.makedirs(OUT, exist_ok=True)
    titles = json.load(open(os.path.join(ROOT, 'tools', 'titles.json'), encoding='utf-8'))
    manifest = {}
    for i in range(0, len(titles), 40):
        chunk = titles[i:i+40]
        url = ('https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1'
               '&prop=pageimages&piprop=thumbnail|name&pithumbsize=640&titles='
               + urllib.parse.quote('|'.join(chunk)))
        try:
            q = json.loads(get(url)).get('query', {})
        except Exception as e:
            print('API error', e); continue
        alias = {}
        for n in q.get('normalized', []): alias.setdefault(n['to'], []).append(n['from'])
        for n in q.get('redirects', []): alias.setdefault(n['to'], []).extend([n['from']] + alias.get(n['from'], []))
        for pg in q.get('pages', {}).values():
            th, name = pg.get('thumbnail'), pg.get('pageimage')
            if not th or not name or '/wikipedia/commons/' not in th['source'] or BAD.search(name):
                continue
            fn = hashlib.md5(name.encode()).hexdigest()[:12] + '.jpg'
            path = os.path.join(OUT, fn)
            if not os.path.exists(path):
                try:
                    open(path, 'wb').write(get(th['source'])); time.sleep(0.2)
                except Exception as e:
                    print('download error', name, e); continue
            v = {'src': 'img/' + fn, 'file': name}
            manifest[pg['title']] = v
            for a in alias.get(pg['title'], []): manifest[a] = v
    with open(os.path.join(OUT, 'manifest.js'), 'w', encoding='utf-8') as f:
        f.write('window.IMG_MANIFEST=' + json.dumps(manifest, ensure_ascii=False) + ';')
    print('photos:', len(set(v['src'] for v in manifest.values())), 'titles:', len(manifest), 'of', len(titles))

if __name__ == '__main__':
    main()
