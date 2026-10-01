"""0.25: разведка фото для кинохроники — по каждой теме (деталь, технология, событие, машина соперника)
собирает кандидатов: главное фото и снимки статьи английской Википедии, поиск по Викискладу, чертежи патентов
(Google Patents). Результат — листы миниатюр с номерами для отбора: media/photos/scan/<тема>.jpg + index.json.
Задание: photos_scan (список тем — tools/media/photo_scan.json)."""
import json, os, re, time, io, urllib.parse

BADF = re.compile(r'\.(svg|ogg|ogv|webm|oga|wav|mp3|mid|pdf|djvu|tif|tiff|gif)$|logo|icon|flag|coat[ _]of[ _]arms|wappen|blason|emblem|badge|map\b|locator|commons-logo|wiktionary|wikiquote|wikisource|question_book|edit-clear|ambox|crystal_|nuvola|disambig|padlock|symbol|portal|folder|stub', re.I)


def run(MEDIA, TOOLS, log, jget, get):
    from PIL import Image, ImageDraw, ImageOps
    L = json.load(open(os.path.join(TOOLS, 'photo_scan.json'), encoding='utf-8'))
    D = os.path.join(MEDIA, 'photos', 'scan'); os.makedirs(D, exist_ok=True)
    idx_path = os.path.join(D, 'index.json')
    idx = json.load(open(idx_path, encoding='utf-8')) if os.path.exists(idx_path) else {}

    def wapi(**p):
        p['format'] = 'json'
        return jget('https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode(p))

    def capi(**p):
        p['format'] = 'json'
        return jget('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(p))

    def wiki_files(title):
        out = []
        try:
            r = wapi(action='query', titles=title, redirects=1, prop='pageimages|images', piprop='name', imlimit=60)
            for pg in (r.get('query', {}).get('pages', {}) or {}).values():
                if pg.get('pageimage'): out.append('File:' + pg['pageimage'].replace('_', ' '))
                for im in pg.get('images', []) or []:
                    t = im.get('title', '')
                    if t and not BADF.search(t): out.append(t)
        except Exception as e:
            log('wiki error', title, repr(e)[:160])
        return out

    def commons_search(q, n=10):
        try:
            r = capi(action='query', list='search', srsearch=q + ' filetype:bitmap', srnamespace=6, srlimit=n)
            return [x['title'] for x in r.get('query', {}).get('search', []) if not BADF.search(x['title'])]
        except Exception as e:
            log('search error', q, repr(e)[:160]); return []

    def file_info(titles):
        info = {}
        for i in range(0, len(titles), 40):
            ch = titles[i:i + 40]
            try:
                r = capi(action='query', titles='|'.join(ch), prop='imageinfo', iiprop='url|size|mime|extmetadata', iiurlwidth=220)
            except Exception as e:
                log('info error', repr(e)[:160]); continue
            norm = {n['to']: n['from'] for n in r.get('query', {}).get('normalized', [])}
            for pg in (r.get('query', {}).get('pages', {}) or {}).values():
                ii = (pg.get('imageinfo') or [None])[0]
                if not ii: continue
                em = ii.get('extmetadata') or {}
                mv = lambda k: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', (em.get(k) or {}).get('value', '') or '')).strip()
                info[pg['title']] = {'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height'), 'mime': ii.get('mime'),
                                     'lic': mv('LicenseShortName')[:60], 'date': mv('DateTimeOriginal')[:40], 'artist': mv('Artist')[:80],
                                     'desc': mv('ImageDescription')[:240]}
                if pg['title'] in norm: info[norm[pg['title']]] = info[pg['title']]
            time.sleep(0.3)
        return info

    def patents(q):
        """Google Patents: поиск (xhr) → номера, чертежи (figures) и PDF."""
        out = []
        try:
            url = 'https://patents.google.com/xhr/query?' + urllib.parse.urlencode({'url': q, 'exp': ''})
            r = jget(url)
            for cl in (r.get('results', {}).get('cluster') or []):
                for x in cl.get('result') or []:
                    p = x.get('patent') or {}
                    figs = [f.get('full') or f.get('thumbnail') for f in (p.get('figures') or []) if f.get('full') or f.get('thumbnail')]
                    out.append({'num': p.get('publication_number'), 'title': re.sub(r'<[^>]+>', '', p.get('title') or '')[:120],
                                'inv': re.sub(r'<[^>]+>', '', p.get('inventor') or '')[:80], 'asg': re.sub(r'<[^>]+>', '', p.get('assignee') or '')[:80],
                                'prio': p.get('priority_date'), 'pub': p.get('publication_date'), 'pdf': p.get('pdf'), 'figs': figs[:4]})
        except Exception as e:
            log('patents error', q, repr(e)[:200])
        return out[:6]

    def thumb_img(url):
        try:
            b = get(url, tries=3, timeout=60)
            im = Image.open(io.BytesIO(b)); im.load()
            if im.mode in ('RGBA', 'LA', 'P'):
                im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (240, 236, 226)); bg.paste(im, mask=im.split()[3]); im = bg
            return im.convert('RGB')
        except Exception as e:
            log('thumb error', url[-80:], repr(e)[:120]); return None

    W, H = 210, 160
    for S in L:
        k = S['k']
        if k in idx and not S.get('redo'): continue
        cand = []
        for t in S.get('w', []):
            for f in wiki_files(t)[:8]:
                if f not in cand: cand.append(f)
            time.sleep(0.2)
        for q in S.get('q', []):
            for f in commons_search(q, 10):
                if f not in cand: cand.append(f)
            time.sleep(0.2)
        cand = cand[:24]
        info = file_info(cand)
        rows = []
        for f in cand:
            v = info.get(f)
            if not v or not v.get('thumb') or (v.get('mime') or '') not in ('image/jpeg', 'image/png'): continue
            rows.append(dict(v, file=f[5:] if f.startswith('File:') else f, src='c'))
        for q in S.get('pat', []):
            for p in patents(q):
                for fg in (p['figs'] or [])[:2]:
                    rows.append({'file': p['num'], 'pat': p, 'fig': fg, 'thumb': 'https://patentimages.storage.googleapis.com/' + fg, 'src': 'p',
                                 'desc': '%s · %s · %s' % (p['title'], p['inv'], p['prio'])})
            time.sleep(0.5)
        if not rows:
            log('nothing for', k); idx[k] = []; continue
        n = len(rows); cols = 5; rr = (n + cols - 1) // cols
        sheet = Image.new('RGB', (cols * W, rr * (H + 18) + 22), (18, 18, 18)); d = ImageDraw.Draw(sheet)
        d.text((4, 4), k + '  ' + (S.get('note') or ''), fill=(250, 250, 160))
        for i, r in enumerate(rows):
            im = thumb_img(r['thumb']); time.sleep(0.15)
            x, y = (i % cols) * W, 22 + (i // cols) * (H + 18)
            if im:
                im = ImageOps.contain(im, (W - 4, H - 4)); sheet.paste(im, (x + 2 + (W - 4 - im.width) // 2, y + 2 + (H - 4 - im.height) // 2))
            lab = '%d %s' % (i, (r.get('date') or '')[:12])
            d.rectangle([x, y + H, x + W - 1, y + H + 17], fill=(0, 0, 0)); d.text((x + 3, y + H + 3), lab, fill=(255, 220, 90))
        sheet.save(os.path.join(D, re.sub(r'[^a-zA-Z0-9_.-]', '_', k) + '.jpg'), 'JPEG', quality=80)
        idx[k] = [{kk: vv for kk, vv in r.items() if kk not in ('thumb',)} for r in rows]
        log('photos', k, len(rows))
        json.dump(idx, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    json.dump(idx, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    log('photos_scan done', len(idx))


def fetch(MEDIA, TOOLS, log, jget, get):
    """photos: выбранные снимки (tools/media/photos.json: {ключ: "File:…" или {"pat": "US…", "fig": "путь"}}) → media/img/x/<md5>.jpg + index.json."""
    from PIL import Image
    import hashlib
    L = json.load(open(os.path.join(TOOLS, 'photos.json'), encoding='utf-8'))
    D = os.path.join(MEDIA, 'img', 'x'); os.makedirs(D, exist_ok=True)
    idx_path = os.path.join(MEDIA, 'img', 'index.json')
    idx = json.load(open(idx_path, encoding='utf-8')) if os.path.exists(idx_path) else {}
    files = [v for v in L.values() if isinstance(v, str)]
    info = {}
    for i in range(0, len(files), 40):
        ch = files[i:i + 40]
        try:
            r = jget('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'format': 'json', 'titles': '|'.join(ch), 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 960}))
        except Exception as e:
            log('info error', repr(e)[:160]); continue
        norm = {n['to']: n['from'] for n in r.get('query', {}).get('normalized', [])}
        for pg in (r.get('query', {}).get('pages', {}) or {}).values():
            ii = (pg.get('imageinfo') or [None])[0]
            if not ii: log('no file', pg.get('title')); continue
            em = ii.get('extmetadata') or {}
            mv = lambda k: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', (em.get(k) or {}).get('value', '') or '')).strip()
            v = {'url': ii.get('thumburl') or ii.get('url'), 'lic': mv('LicenseShortName')[:60], 'artist': mv('Artist')[:100]}
            info[pg['title']] = v
            if pg['title'] in norm: info[norm[pg['title']]] = v
        time.sleep(0.3)
    for key, v in L.items():
        if isinstance(v, str):
            m = info.get(v)
            if not m: log('photo: no info', key, v); continue
            url, file, lic, art = m['url'], v[5:], m['lic'], m['artist']
        else:
            url = 'https://patentimages.storage.googleapis.com/' + v['fig']; file = v['pat']; lic = 'Public domain (patent)'; art = v.get('who', '')
        fn = hashlib.md5((key + '|' + file).encode()).hexdigest()[:12] + '.jpg'
        out = os.path.join(D, fn)
        if not (key in idx and idx[key].get('src') == 'img/x/' + fn and os.path.exists(out)):
            try:
                b = get(url, tries=4, timeout=90)
                im = Image.open(io.BytesIO(b)); im.load()
                if im.mode in ('RGBA', 'LA', 'P'):
                    im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (242, 236, 220)); bg.paste(im, mask=im.split()[3]); im = bg
                im = im.convert('RGB')
                if v.get('crop') if isinstance(v, dict) else False:
                    x0, y0, x1, y1 = v['crop']; im = im.crop((int(im.width * x0), int(im.height * y0), int(im.width * x1), int(im.height * y1)))
                if im.width > 900: im = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS)
                im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
                time.sleep(0.25)
            except Exception as e:
                log('photo error', key, repr(e)[:160]); continue
        idx[key] = {'src': 'img/x/' + fn, 'file': file, 'lic': lic, 'artist': art}
        log('photo', key, file)
    json.dump(idx, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    log('photos done', len(idx))
