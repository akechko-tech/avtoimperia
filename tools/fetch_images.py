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

MUSIC_Q = [
     ['Daisy Bell Bicycle Built for Two Edison',1895,'song'],['Washington Post march',1895,'march'],['Semper Fidelis march',1896,'march'],['Stars and Stripes Forever',1897,'march'],
     ['Maple Leaf Rag',1899,'rag'],['Over the Waves Rosas waltz',1900,'waltz'],['Skaters Waltz Waldteufel',1900,'waltz'],['Peacherine Rag',1901,'rag'],
     ['The Entertainer Joplin',1902,'rag'],['Elite Syncopations',1902,'rag'],['Weeping Willow rag',1903,'rag'],['Entry of the Gladiators',1904,'march'],
     ['In My Merry Oldsmobile',1905,'song'],['Merry Widow Waltz',1906,'waltz'],['Dill Pickles rag',1906,'rag'],['Frog Legs Rag',1906,'rag'],
     ['Pineapple Rag',1908,'rag'],['Black and White Rag',1908,'rag'],['Take Me Out to the Ball Game 1908',1908,'song'],['Shine On Harvest Moon',1909,'song'],
     ['By the Light of the Silvery Moon',1909,'song'],['Solace Joplin',1909,'rag'],['Grace and Beauty rag',1909,'rag'],['Temptation Rag',1909,'rag'],
     ['Come Josephine in My Flying Machine',1910,'song'],['Alexanders Ragtime Band',1911,'song'],['Its a Long Way to Tipperary',1914,'march'],['Colonel Bogey March',1914,'march'],
     ['Keep the Home Fires Burning',1915,'song'],['Pack Up Your Troubles',1915,'song'],['Over There 1917',1917,'march'],['Livery Stable Blues',1917,'jazz'],
     ['Tiger Rag Original Dixieland Jass Band',1918,'jazz'],['Darktown Strutters Ball',1917,'jazz'],['Swanee Jolson',1920,'song'],['Crazy Blues Mamie Smith',1920,'jazz'],
     ['Whispering Paul Whiteman',1920,'jazz'],['Royal Garden Blues',1920,'jazz'],['Aint We Got Fun',1921,'song'],['Yes We Have No Bananas',1923,'song'],
     ['Dipper Mouth Blues',1923,'jazz'],['Wolverine Blues',1923,'jazz'],['Rhapsody in Blue 1924',1924,'jazz'],['Charleston 1925',1925,'jazz'],
     ['Sweet Georgia Brown 1925',1925,'jazz'],['Bye Bye Blackbird Gene Austin',1926,'song'],['Black Bottom Stomp',1926,'jazz'],['West End Blues',1928,'jazz']]

BAKE_LIMIT = 40e6   # bytes of music baked into the APK; the rest stream from Wikimedia

def keywords(q):
    ws = re.sub(r'[^a-z0-9]+', ' ', q.lower()).split()
    return [w for w in ws if len(w) > 3 and not re.match(r'^(1\d{3}|rag|blues|march|waltz|band|original)$', w)]

def music():
    out_dir = os.path.join(ROOT, 'app', 'src', 'main', 'assets', 'music'); os.makedirs(out_dir, exist_ok=True)
    api = 'https://commons.wikimedia.org/w/api.php?format=json&action=query'
    man, seen, baked = {}, set(), 0
    for q, y, st in MUSIC_Q:
        try:
            sr = json.loads(get(api + '&list=search&srnamespace=6&srlimit=4&srsearch=' + urllib.parse.quote(q + ' filetype:audio')))
            kw = keywords(q)
            titles = [x['title'] for x in sr.get('query', {}).get('search', [])]
            titles = [t for t in titles if not re.search(r'midi|\.mid\b|ringtone|dectalk|slowed|remix|synth|vocoder', t, re.I) and (not kw or any(w in t.lower() for w in kw))][:2]
            if not titles: print('music: nothing for', q); continue
            vi = json.loads(get(api + '&prop=videoinfo&viprop=url|size|mime|derivatives|extmetadata&titles=' + urllib.parse.quote('|'.join(titles))))
            pages = list(vi.get('query', {}).get('pages', {}).values())
            for t in titles:
                if t in seen: continue
                pg = next((x for x in pages if x.get('title') == t), None)
                info = pg and pg.get('videoinfo', [None])[0]
                if not info or info.get('size', 0) > 14e6: continue
                lic = info.get('extmetadata', {}).get('LicenseShortName', {}).get('value', '')
                if not re.search(r'public domain|pd|cc', lic, re.I): continue
                mp3 = next((d for d in info.get('derivatives', []) if 'mpeg' in d.get('type', '') or d.get('transcodekey') == 'mp3'), None)
                src = mp3['src'] if mp3 else (info['url'] if 'mpeg' in info.get('mime', '') or 'ogg' in info.get('mime', '') else None)
                if not src: continue
                if src.startswith('//'): src = 'https:' + src
                entry = {'src': src, 'y': y, 'title': re.sub(r'\.[a-z0-9]+$', '', t.replace('File:', ''), flags=re.I).replace('_', ' '),
                         'page': info.get('descriptionurl', '')}
                entry['_ext'] = '.mp3' if (mp3 or 'mpeg' in info.get('mime', '')) else '.ogg'; entry['_t'] = t
                seen.add(t); man.setdefault(st, []).append(entry)
                break
        except Exception as e:
            print('music error', q, e)
    # bake round-robin across styles so every style has offline tracks; the rest stream
    queues = {k: list(v) for k, v in man.items()}
    while baked < BAKE_LIMIT and any(queues.values()):
        for st in list(queues):
            if not queues[st] or baked >= BAKE_LIMIT: continue
            e = queues[st].pop(0)
            fn = hashlib.md5(e['_t'].encode()).hexdigest()[:12] + e['_ext']
            path = os.path.join(out_dir, fn)
            try:
                if not os.path.exists(path): open(path, 'wb').write(get(e['src'])); time.sleep(0.3)
                baked += os.path.getsize(path); e['src'] = 'music/' + fn
            except Exception as ex:
                print('music download failed, will stream', e['_t'], ex)
    for v in man.values():
        for e in v: e.pop('_t', None); e.pop('_ext', None)
    with open(os.path.join(out_dir, 'music.js'), 'w', encoding='utf-8') as f:
        f.write('window.MUSIC_MANIFEST=' + json.dumps(man, ensure_ascii=False) + ';')
    print('music:', {k: len(v) for k, v in man.items()}, 'baked MB', round(baked / 1e6, 1))

if __name__ == '__main__':
    main()
    music()
