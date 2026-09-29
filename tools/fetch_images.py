"""Скачивает исторические фото из Википедии (только файлы Wikimedia Commons)
и вшивает их в приложение: app/src/main/assets/img + manifest.js.
Запускается в GitHub Actions перед сборкой APK. Ошибки не валят сборку."""
import json, os, re, urllib.parse, urllib.request, urllib.error, hashlib, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'app', 'src', 'main', 'assets', 'img')
UA = 'AvtoimperiaBuild/1.0 (https://github.com/akechko-tech/avtoimperia; game build)'
BAD = re.compile(r'logo|map|layout|circuit|coat_of_arms|flag|emblem|embl%C3%A8me|emblème|blason|wappen|badge|\.svg$', re.I)

def get(url):
    # Википедия притормаживает частые запросы (429/503): ждём и пробуем ещё раз
    for k in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504) or k == 3: raise
        except urllib.error.URLError:
            if k == 3: raise
        time.sleep(2 ** k * 1.5)

def shrink(path):
    """Большие PNG (иллюстрации, сканы) — в JPEG до 720 px: APK и веб-версия легче в разы."""
    try:
        from PIL import Image
    except Exception:
        return
    try:
        with open(path, 'rb') as f: head = f.read(8)
        if head != b'\x89PNG\r\n\x1a\n' and os.path.getsize(path) < 160e3: return
        im = Image.open(path)
        if im.width > 720: im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (242, 236, 220)); bg.paste(im, mask=im.split()[3]); im = bg
        else:
            im = im.convert('RGB')
        im.save(path, 'JPEG', quality=82, optimize=True, progressive=True)
    except Exception as e:
        print('shrink', path, e)

def main():
    os.makedirs(OUT, exist_ok=True)
    titles = json.load(open(os.path.join(ROOT, 'tools', 'titles.json'), encoding='utf-8'))
    # точные фото машин: файлы Commons вместо главного фото статьи (там бывают логотипы, заводы, мосты)
    try:
        files = json.load(open(os.path.join(ROOT, 'tools', 'photo_files.json'), encoding='utf-8'))
    except Exception:
        files = {}
    manifest, fm = {}, {}
    fixed = [t for t in titles if t in files]
    titles = [t for t in titles if t not in files]
    want = {}
    for t in fixed:
        if files[t]:
            want.setdefault('File:' + files[t], []).append(t)
    keys = list(want)
    for i in range(0, len(keys), 40):
        chunk = keys[i:i+40]
        url = ('https://commons.wikimedia.org/w/api.php?action=query&format=json'
               '&prop=imageinfo&iiprop=url&iiurlwidth=640&titles=' + urllib.parse.quote('|'.join(chunk)))
        try:
            q = json.loads(get(url)).get('query', {})
        except Exception as e:
            print('Commons API error', e); continue
        norm = {n['to']: n['from'] for n in q.get('normalized', [])}
        for pg in q.get('pages', {}).values():
            ii = (pg.get('imageinfo') or [{}])[0]
            th = ii.get('thumburl')
            if not th:
                print('no file', pg.get('title')); continue
            name = pg['title'][5:].replace(' ', '_')
            fn = hashlib.md5(name.encode()).hexdigest()[:12] + '.jpg'
            path = os.path.join(OUT, fn)
            if not os.path.exists(path):
                try:
                    open(path, 'wb').write(get(th)); shrink(path); time.sleep(0.2)
                except Exception as e:
                    print('download error', name, e); continue
            for t in want.get(norm.get(pg['title'], pg['title']), []) + want.get(pg['title'], []):
                fm[t] = {'src': 'img/' + fn, 'file': name}
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
                    open(path, 'wb').write(get(th['source'])); shrink(path); time.sleep(0.2)
                except Exception as e:
                    print('download error', name, e); continue
            v = {'src': 'img/' + fn, 'file': name}
            manifest[pg['title']] = v
            for a in alias.get(pg['title'], []): manifest[a] = v
    for t in fixed:
        manifest.pop(t, None)
    manifest.update(fm)
    with open(os.path.join(OUT, 'manifest.js'), 'w', encoding='utf-8') as f:
        f.write('window.IMG_MANIFEST=' + json.dumps(manifest, ensure_ascii=False) + ';')
    print('photos:', len(set(v['src'] for v in manifest.values())), 'titles:', len(manifest), 'of', len(titles) + len(fixed))

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
     ['Sweet Georgia Brown 1925',1925,'jazz'],['Bye Bye Blackbird Gene Austin',1926,'song'],['Black Bottom Stomp',1926,'jazz'],['West End Blues',1928,'jazz'],
     ['Liberty Bell march Sousa',1895,'march'],['El Capitan march Sousa',1896,'march'],['The Thunderer Sousa',1895,'march'],['Under the Double Eagle march',1897,'march'],
     ['Radetzky March',1900,'march'],['Alte Kameraden',1899,'march'],['National Emblem march',1906,'march'],['Anchors Aweigh',1907,'march'],['Blaze Away march',1902,'march'],
     ['Sambre et Meuse',1905,'march'],['Marche Lorraine',1908,'march'],['Pomp and Circumstance Elgar',1902,'march'],['The Great Little Army Alford',1916,'march'],
     ['Original Rags Joplin',1899,'rag'],['Swipesy cakewalk',1900,'rag'],['At a Georgia Camp Meeting',1898,'rag'],['The Cascades Joplin',1904,'rag'],['The Chrysanthemum Joplin',1904,'rag'],
     ['Gladiolus Rag',1907,'rag'],['Wall Street Rag',1909,'rag'],['Twelfth Street Rag',1914,'rag'],['Magnetic Rag Joplin',1914,'rag'],['Nola Arndt',1916,'rag'],['Kitten on the Keys',1921,'rag'],
     ['Blue Danube waltz',1900,'waltz'],['Emperor Waltz Strauss',1905,'waltz'],['Gold and Silver waltz Lehar',1902,'waltz'],['Estudiantina waltz',1900,'waltz'],['Wiener Blut',1905,'waltz'],
     ['Valse triste Sibelius',1904,'waltz'],['Bethena waltz Joplin',1905,'waltz'],['Destiny waltz Baynes',1912,'waltz'],['Missouri Waltz',1916,'waltz'],
     ['Hello Ma Baby',1899,'song'],['Bill Bailey Wont You Please Come Home',1902,'song'],['Give My Regards to Broadway',1904,'song'],['Yankee Doodle Boy Billy Murray',1904,'song'],
     ['Meet Me in St Louis 1904',1904,'song'],['Wait Till the Sun Shines Nellie',1905,'song'],['Glow Worm Lincke',1907,'song'],['Beside the Seaside',1909,'song'],['Row Row Row 1912',1912,'song'],
     ['Ballin the Jack',1913,'song'],['Poor Butterfly',1917,'song'],['K-K-K-Katy',1918,'song'],['Dardanella',1919,'song'],['Avalon Al Jolson',1920,'song'],['April Showers Jolson',1921,'song'],
     ['Toot Toot Tootsie',1922,'song'],['Tea for Two 1925',1925,'song'],['Aint She Sweet 1927',1927,'song'],
     ['La Madelon',1914,'song'],['Frou-frou chanson',1898,'song'],['La Petite Tonkinoise',1906,'song'],['Sous les ponts de Paris',1913,'song'],['Mon homme Mistinguett',1920,'song'],['Valencia Mistinguett',1926,'song'],
     ['O Sole Mio Caruso',1905,'song'],['Funiculi Funicula',1900,'song'],['Santa Lucia Caruso',1910,'song'],['Vesti la giubba Caruso',1907,'song'],['Torna a Surriento',1905,'song'],
     ['Burlington Bertie',1900,'song'],['Hold Your Hand Out Naughty Boy',1913,'song'],['Berliner Luft Lincke',1904,'song'],
     ['Memphis Blues',1912,'jazz'],['St Louis Blues 1914',1915,'jazz'],['Clarinet Marmalade',1918,'jazz'],['At the Jazz Band Ball',1918,'jazz'],['Fidgety Feet',1918,'jazz'],
     ['Canal Street Blues King Oliver',1923,'jazz'],['King Porter Stomp Morton',1923,'jazz'],['Tin Roof Blues',1923,'jazz'],['Jelly Roll Blues',1924,'jazz'],['Heebie Jeebies Armstrong',1926,'jazz'],
     ['Muskrat Ramble',1926,'jazz'],['Potato Head Blues',1927,'jazz'],['Singin the Blues Bix',1927,'jazz'],['Weather Bird',1928,'jazz']]

BAKE_LIMIT = 36e6   # bytes of music baked into the APK; the rest stream from Wikimedia

def keywords(q):
    ws = re.sub(r'[^a-z0-9]+', ' ', q.lower()).split()
    return [w for w in ws if len(w) > 3 and not re.match(r'^(1\d{3}|rag|blues|march|waltz|band|original)$', w)]

def music():
    out_dir = os.path.join(ROOT, 'app', 'src', 'main', 'assets', 'music'); os.makedirs(out_dir, exist_ok=True)
    api = 'https://commons.wikimedia.org/w/api.php?format=json&action=query'
    man, seen, baked = {}, set(), 0
    for q, y, st in MUSIC_Q:
        try:
            time.sleep(0.25)
            sr = json.loads(get(api + '&list=search&srnamespace=6&srlimit=4&srsearch=' + urllib.parse.quote(q + ' filetype:audio')))
            kw = keywords(q)
            titles = [x['title'] for x in sr.get('query', {}).get('search', [])]
            titles = [t for t in titles if not re.search(r'midi|\.mid\b|ringtone|dectalk|slowed|remix|synth|vocoder|pronunciation|prononciation|lingua libre', t, re.I) and not re.match(r'File:(LL-Q\d|[A-Z][a-z](-[a-z]{2})?-)', t) and (not kw or sum(w in t.lower() for w in kw) >= (2 if len(kw) >= 3 else 1))][:2]
            if not titles: print('music: nothing for', q); continue
            vi = json.loads(get(api + '&prop=videoinfo&viprop=url|size|mime|derivatives|extmetadata&titles=' + urllib.parse.quote('|'.join(titles))))
            pages = list(vi.get('query', {}).get('pages', {}).values())
            for t in titles:
                if t in seen: continue
                pg = next((x for x in pages if x.get('title') == t), None)
                info = pg and pg.get('videoinfo', [None])[0]
                if not info or info.get('size', 0) > 14e6 or info.get('size', 0) < 150e3: continue   # слова-произношения (Lingua Libre) — не музыка
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
