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

MUSIC_Q = {'rag': ['Maple Leaf Rag', 'The Entertainer Joplin', 'Elite Syncopations', 'Weeping Willow rag'],
           'march': ['Its a Long Way to Tipperary', 'Over There 1917', 'Stars and Stripes Forever', 'Washington Post march'],
           'jazz': ['Livery Stable Blues', 'Tiger Rag Original Dixieland Jass Band', 'Dipper Mouth Blues', 'Royal Garden Blues', 'Wolverine Blues']}

def music():
    out_dir = os.path.join(ROOT, 'app', 'src', 'main', 'assets', 'music'); os.makedirs(out_dir, exist_ok=True)
    api = 'https://commons.wikimedia.org/w/api.php?format=json&action=query'
    man = {k: [] for k in MUSIC_Q}
    for st, qs in MUSIC_Q.items():
        for q in qs:
            try:
                sr = json.loads(get(api + '&list=search&srnamespace=6&srlimit=3&srsearch=' + urllib.parse.quote(q + ' filetype:audio')))
                titles = [x['title'] for x in sr.get('query', {}).get('search', [])]
                if not titles: continue
                vi = json.loads(get(api + '&prop=videoinfo&viprop=url|size|mime|derivatives|extmetadata&titles=' + urllib.parse.quote('|'.join(titles))))
                pages = list(vi.get('query', {}).get('pages', {}).values())
                for t in titles:
                    pg = next((x for x in pages if x.get('title') == t), None)
                    info = pg and pg.get('videoinfo', [None])[0]
                    if not info or info.get('size', 0) > 12e6: continue
                    lic = info.get('extmetadata', {}).get('LicenseShortName', {}).get('value', '')
                    if not re.search(r'public domain|pd|cc', lic, re.I): continue
                    mp3 = next((d for d in info.get('derivatives', []) if 'mpeg' in d.get('type', '') or d.get('transcodekey') == 'mp3'), None)
                    src = mp3['src'] if mp3 else (info['url'] if 'mpeg' in info.get('mime', '') or 'ogg' in info.get('mime', '') else None)
                    if not src: continue
                    ext = '.mp3' if (mp3 or 'mpeg' in info.get('mime', '')) else '.ogg'
                    fn = hashlib.md5(t.encode()).hexdigest()[:12] + ext
                    path = os.path.join(out_dir, fn)
                    if not os.path.exists(path): open(path, 'wb').write(get(src)); time.sleep(0.3)
                    man[st].append({'src': 'music/' + fn, 'title': re.sub(r'\.[a-z0-9]+$', '', t.replace('File:', ''), flags=re.I),
                                    'page': info.get('descriptionurl', '')})
                    break
            except Exception as e:
                print('music error', q, e)
    with open(os.path.join(out_dir, 'music.js'), 'w', encoding='utf-8') as f:
        f.write('window.MUSIC_MANIFEST=' + json.dumps(man, ensure_ascii=False) + ';')
    print('music:', {k: len(v) for k, v in man.items()})

if __name__ == '__main__':
    main()
    music()
