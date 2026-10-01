"""Приметы трассы (0.22) и русские имена: соборы, церкви, замки, крепости, дворцы, монастыри, башни, маяки,
мельницы, памятники, ворота, вокзалы, стены — из OpenStreetMap у настоящей дороги, с отмоткой к году гонки
(построенное позже — убрать; год — из тегов OSM или из Викиданных: «дата основания/постройки»).
Имена — по-русски: name:ru в OSM, иначе подпись Викиданных, иначе транслитерация с языка страны."""
import json, math, re, time, urllib.parse

LOG = print
HTTP = None  # http(url, data=None, ...) из terrain.py

# ---------- Викиданные: русские подписи и годы постройки ----------
WD = {}
def wd_fetch(ids, claims=False):
    ids = [i for i in dict.fromkeys(ids) if i and re.match(r'^Q\d+$', i) and (i not in WD or (claims and 'y' not in WD[i]))]
    for k in range(0, len(ids), 45):
        part = ids[k:k + 45]
        u = 'https://www.wikidata.org/w/api.php?' + urllib.parse.urlencode({'action': 'wbgetentities', 'ids': '|'.join(part), 'format': 'json',
                                                                             'props': 'labels|claims' if claims else 'labels', 'languages': 'ru|en'})
        try:
            js = json.loads(HTTP(u, timeout=90, tries=3)); time.sleep(0.5)
        except Exception as e:
            LOG('  wikidata fail', repr(e)[:160]); continue
        for q, e in (js.get('entities') or {}).items():
            lab = (e.get('labels') or {}); d = WD.setdefault(q, {})
            d['ru'] = (lab.get('ru') or {}).get('value'); d['en'] = (lab.get('en') or {}).get('value')
            if claims:
                y = None
                for p in ('P571', 'P1619', 'P580', 'P729'):
                    for c in ((e.get('claims') or {}).get(p) or []):
                        try:
                            t = c['mainsnak']['datavalue']['value']['time']; yy = int(t[1:5]) * (-1 if t[0] == '-' else 1)
                            y = yy if y is None else min(y, yy)
                        except Exception: pass
                    if y is not None: break
                d['y'] = y

def wd_ru(q):
    d = WD.get(q) or {}
    r = d.get('ru')
    if r: r = re.sub(r'\s*\(.*?\)\s*$', '', r)  # «Валдай (город)» → «Валдай»
    return r

# ---------- транслитерация (запасной путь, когда русского имени нет) ----------
FR = [('eaux', 'о'), ('eau', 'о'), ('aux', 'о'), ('ault', 'о'), ('ou', 'у'), ('oi', 'уа'), ('ai', 'е'), ('ei', 'е'), ('au', 'о'), ('ch', 'ш'), ('gn', 'нь'),
      ('qu', 'к'), ('gue', 'г'), ('gui', 'ги'), ('ge', 'же'), ('gi', 'жи'), ('ph', 'ф'), ('th', 'т'), ('ill', 'й'), ('eu', 'ё'), ('œu', 'ё'), ('an', 'ан'), ('en', 'ан'),
      ('in', 'ен'), ('ç', 'с'), ('é', 'е'), ('è', 'е'), ('ê', 'е'), ('ë', 'е'), ('à', 'а'), ('â', 'а'), ('î', 'и'), ('ï', 'и'), ('ô', 'о'), ('û', 'ю'), ('ù', 'ю'), ('ü', 'ю'),
      ('ce', 'се'), ('ci', 'си'), ('cy', 'си'), ('u', 'ю'), ('y', 'и'), ('j', 'ж'), ('w', 'в'), ('x', 'кс'), ('h', '')]
DE = [('tsch', 'ч'), ('sch', 'ш'), ('ch', 'х'), ('ck', 'к'), ('tz', 'ц'), ('ei', 'ай'), ('ai', 'ай'), ('ie', 'и'), ('eu', 'ой'), ('äu', 'ой'), ('au', 'ау'), ('ph', 'ф'),
      ('qu', 'кв'), ('ä', 'е'), ('ö', 'ё'), ('ü', 'ю'), ('ß', 'сс'), ('z', 'ц'), ('w', 'в'), ('v', 'ф'), ('j', 'й'), ('y', 'и'), ('x', 'кс'), ('ah', 'а'), ('eh', 'е'),
      ('oh', 'о'), ('uh', 'у'), ('ih', 'и'), ('h', 'х')]
IT = [('gli', 'льи'), ('gn', 'нь'), ('sch', 'ск'), ('sci', 'ши'), ('sce', 'ше'), ('cia', 'ча'), ('cio', 'чо'), ('ciu', 'чу'), ('ci', 'чи'), ('ce', 'че'),
      ('gia', 'джа'), ('gio', 'джо'), ('giu', 'джу'), ('gi', 'джи'), ('ge', 'дже'), ('chi', 'ки'), ('che', 'ке'), ('ghi', 'ги'), ('ghe', 'ге'), ('qu', 'кв'), ('zz', 'цц'),
      ('z', 'ц'), ('h', ''), ('j', 'й'), ('y', 'и'), ('à', 'а'), ('è', 'е'), ('é', 'е'), ('ì', 'и'), ('ò', 'о'), ('ù', 'у')]
EN = [('ough', 'о'), ('augh', 'о'), ('tch', 'ч'), ('sh', 'ш'), ('ch', 'ч'), ('th', 'т'), ('ph', 'ф'), ('wh', 'у'), ('ck', 'к'), ('ee', 'и'), ('ea', 'и'), ('oo', 'у'),
      ('ou', 'ау'), ('ow', 'оу'), ('ay', 'ей'), ('ey', 'и'), ('oy', 'ой'), ('ai', 'ей'), ('qu', 'кв'), ('w', 'у'), ('y', 'и'), ('j', 'дж'), ('x', 'кс'), ('c', 'к'), ('h', 'х')]
ES = [('ll', 'й'), ('ñ', 'нь'), ('ch', 'ч'), ('qu', 'к'), ('gue', 'ге'), ('gui', 'ги'), ('ge', 'хе'), ('gi', 'хи'), ('ce', 'се'), ('ci', 'си'), ('j', 'х'), ('z', 'с'), ('h', ''),
      ('y', 'и'), ('á', 'а'), ('é', 'е'), ('í', 'и'), ('ó', 'о'), ('ú', 'у'), ('x', 'кс')]
NL = [('sch', 'сх'), ('ij', 'ей'), ('ei', 'ей'), ('oe', 'у'), ('ui', 'ёй'), ('ou', 'ау'), ('au', 'ау'), ('ch', 'х'), ('aa', 'а'), ('ee', 'е'), ('oo', 'о'), ('uu', 'ю'),
      ('g', 'х'), ('j', 'й'), ('w', 'в'), ('v', 'ф'), ('y', 'ей'), ('z', 'з'), ('u', 'ю'), ('x', 'кс')]
BASE = {'a': 'а', 'b': 'б', 'c': 'к', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и', 'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п',
        'q': 'к', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс', 'y': 'и', 'z': 'з'}
LANG = {'fr': FR, 'be': FR, 'mc': FR, 'ch': DE, 'de': DE, 'at': DE, 'it': IT, 'uk': EN, 'ie': EN, 'us': EN, 'es': ES, 'nl': NL}
WORD = {'fr': {'saint': 'сен', 'sainte': 'сент', 'sur': 'сюр', 'sous': 'су', 'les': 'ле', 'le': 'ле', 'la': 'ла', 'de': 'де', 'des': 'де', 'du': 'дю', 'en': 'ан', 'et': 'э',
               'église': 'церковь', 'eglise': 'церковь', 'château': 'замок', 'chateau': 'замок', 'cathédrale': 'собор', 'chapelle': 'часовня', 'abbaye': 'аббатство', 'pont': 'мост',
               'moulin': 'мельница', 'phare': 'маяк', 'tour': 'башня', 'porte': 'ворота', 'notre-dame': 'нотр-дам', 'gare': 'вокзал'},
        'de': {'sankt': 'санкт', 'st.': 'санкт', 'kirche': 'церковь', 'burg': 'замок', 'schloss': 'замок', 'dom': 'собор', 'kapelle': 'часовня', 'kloster': 'монастырь',
               'mühle': 'мельница', 'turm': 'башня', 'tor': 'ворота', 'brücke': 'мост', 'bahnhof': 'вокзал', 'bad': 'бад', 'an': 'ан', 'der': 'дер', 'am': 'ам', 'im': 'им'},
        'it': {'san': 'сан', 'santa': 'санта', 'santo': 'санто', 'chiesa': 'церковь', 'castello': 'замок', 'duomo': 'собор', 'cattedrale': 'собор', 'torre': 'башня',
               'porta': 'ворота', 'ponte': 'мост', 'stazione': 'вокзал', 'di': 'ди', 'del': 'дель', 'della': 'делла', 'sul': 'суль', 'al': 'аль'},
        'en': {'saint': 'сент', 'st': 'сент', 'church': 'церковь', 'castle': 'замок', 'cathedral': 'собор', 'chapel': 'часовня', 'abbey': 'аббатство', 'tower': 'башня',
               'bridge': 'мост', 'mill': 'мельница', 'lighthouse': 'маяк', 'station': 'вокзал', 'hall': 'холл', 'house': 'хаус', 'the': '', 'of': '', 'and': 'и'},
        'es': {'san': 'сан', 'santa': 'санта', 'iglesia': 'церковь', 'castillo': 'замок', 'catedral': 'собор', 'torre': 'башня', 'puente': 'мост', 'de': 'де', 'del': 'дель', 'la': 'ла'}}
LW = {'fr': 'fr', 'be': 'fr', 'mc': 'fr', 'de': 'de', 'at': 'de', 'ch': 'de', 'it': 'it', 'uk': 'en', 'ie': 'en', 'us': 'en', 'es': 'es'}
VOW = set('аеёиоуыэюя')

def translit(name, host):
    if not name or re.search('[А-Яа-яЁё]', name): return name
    rules = LANG.get(host, EN); wmap = WORD.get(LW.get(host, 'en'), {})
    out = []
    for word in re.split(r'(\s+|-)', name):
        if not word or word.isspace() or word == '-': out.append(word); continue
        lw = word.lower()
        if lw in wmap: out.append(wmap[lw]); continue
        s = lw
        if host in ('fr', 'be', 'mc') and len(s) > 3 and s[-1] in 'stdxz' and not s.endswith('ez'): s = s[:-1]
        if host in ('fr', 'be', 'mc') and len(s) > 3 and s.endswith('e') and not s.endswith('ée'): s = s[:-1]
        if host in ('de', 'at', 'ch') and s.startswith('st'): s = 'шт' + s[2:]
        if host in ('de', 'at', 'ch') and s.startswith('sp'): s = 'шп' + s[2:]
        if host in ('de', 'at', 'ch') and len(s) > 1 and s[0] == 's' and s[1] in 'aeiouäöü': s = 'з' + s[1:]
        res = ''; i = 0
        while i < len(s):
            for a, b in rules:
                if s.startswith(a, i): res += b; i += len(a); break
            else:
                ch = s[i]; res += BASE.get(ch, ch if ch.isalpha() and ord(ch) > 0x400 else ''); i += 1
        res = res.replace('йи', 'и').replace('кс', 'кс')
        out.append(res[:1].upper() + res[1:] if res else res)
    t = ''.join(out).strip()
    return t or name

def ru_name(tags, host):
    if not tags: return ''
    for k in ('name:ru',):
        if tags.get(k): return tags[k]
    q = tags.get('wikidata')
    if q and wd_ru(q): return wd_ru(q)
    n = tags.get('name') or tags.get('name:en') or ''
    return translit(n, host)

# ---------- геометрия ----------
def rect_of(P):
    """Наименьший прямоугольник по осям многоугольника: (cx, cz, длина, ширина, угол длинной оси)."""
    if len(P) < 3:
        x = sum(p[0] for p in P) / len(P); z = sum(p[1] for p in P) / len(P); return x, z, 0, 0, 0
    best = None
    for i in range(len(P) - 1):
        a, b = P[i], P[i + 1]; dx, dz = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dz)
        if L < 0.5: continue
        ux, uz = dx / L, dz / L; us = [p[0] * ux + p[1] * uz for p in P]; vs = [-p[0] * uz + p[1] * ux for p in P]
        u0, u1, v0, v1 = min(us), max(us), min(vs), max(vs); area = (u1 - u0) * (v1 - v0)
        if best is None or area < best[0]: best = (area, u0, u1, v0, v1, ux, uz)
    if not best:
        x = sum(p[0] for p in P) / len(P); z = sum(p[1] for p in P) / len(P); return x, z, 0, 0, 0
    _, u0, u1, v0, v1, ux, uz = best; cu, cv = (u0 + u1) / 2, (v0 + v1) / 2
    cx, cz = cu * ux - cv * uz, cu * uz + cv * ux; L, W = u1 - u0, v1 - v0; ang = math.atan2(uz, ux)
    if W > L: L, W = W, L; ang += math.pi / 2
    return cx, cz, L, W, ang

def year_tag(tags):
    for k in ('start_date', 'construction_date', 'building:start_date', 'opening_date', 'year_of_construction'):
        v = tags.get(k)
        if v:
            m = re.search(r'(\d{3,4})', str(v))
            if m:
                y = int(m.group(1))
                if re.search(r'^\s*C?(\d{1,2})\s*(th|e|ème)?\s*(c|century|siècle|s)\b', str(v), re.I) and y < 30: y = (y - 1) * 100 + 50
                return y
    return None

CHURCH_RE = re.compile(r'cath[ée]dral|kathedral|\bdom\b|duomo|cattedrale|catedral|собор|minster|basilic|базилик', re.I)
def classify(t):
    h, b, mm, am = t.get('historic', ''), t.get('building', ''), t.get('man_made', ''), t.get('amenity', '')
    nm = (t.get('name') or '') + ' ' + (t.get('name:ru') or '')
    if mm == 'lighthouse' or b == 'lighthouse': return 'lighthouse'
    if mm == 'windmill' or b == 'windmill' or h == 'windmill': return 'windmill'
    if mm == 'watermill' or h == 'watermill': return 'watermill'
    if b == 'cathedral' or (b in ('church', 'basilica') or am == 'place_of_worship' or h == 'church') and CHURCH_RE.search(nm): return 'cathedral'
    if b == 'mosque' or t.get('religion') == 'muslim': return 'mosque'
    if b in ('temple', 'shrine') or t.get('religion') in ('buddhist', 'taoist', 'chinese_folk'): return 'pagoda'
    if h in ('castle', 'fortress'):
        ct = t.get('castle_type', '')
        if t.get('ruins') == 'yes' or 'ruin' in ct: return 'ruins'
        if ct in ('palace', 'stately', 'chateau', 'schloss'): return 'palace'
        if ct == 'manor': return 'manor'
        return 'castle'
    if h == 'palace' or b == 'palace': return 'palace'
    if h == 'manor': return 'manor'
    if h == 'fort': return 'fort'
    if h == 'ruins': return 'ruins'
    if h == 'monastery' or am == 'monastery' or b == 'monastery': return 'monastery'
    if h == 'city_gate': return 'gate'
    if h in ('citywalls',) or t.get('barrier') == 'city_wall' or t.get('wall') == 'castle_wall' or (t.get('barrier') == 'wall' and re.search('长城|Great Wall|Великая', nm)): return 'wall'
    if h == 'aqueduct': return 'aqueduct'
    if b in ('church', 'chapel') or am == 'place_of_worship' or h in ('church', 'chapel', 'wayside_chapel'):
        return 'chapel' if (b == 'chapel' or h in ('chapel', 'wayside_chapel')) else 'church'
    if b == 'train_station' or t.get('railway') == 'station' and b: return 'station'
    if mm == 'obelisk' or t.get('monument') == 'obelisk' or t.get('memorial') == 'obelisk': return 'obelisk'
    if h in ('monument', 'memorial'):
        mt = t.get('memorial', '') or t.get('monument', '')
        if mt in ('statue', 'bust', 'sculpture'): return 'statue'
        if mt == 'column': return 'column'
        if mt in ('plaque', 'stone', 'stolperstein', 'blue_plaque', 'cross', 'war_grave', 'ghost_bike', 'bench', 'tree'): return None
        return 'monument'
    if h == 'tower' or (mm == 'tower' and t.get('tower:type', '') in ('bell_tower', 'defensive', 'observation', 'watchtower', 'clock')): return 'tower'
    if mm == 'water_tower': return 'water_tower'
    if h == 'observatory' or b == 'observatory' or mm == 'observatory': return 'observatory'
    return None

IMP = {'cathedral': 10, 'castle': 9, 'palace': 8, 'monastery': 8, 'fort': 7, 'lighthouse': 7, 'wall': 7, 'gate': 6, 'ruins': 6, 'church': 5, 'windmill': 5, 'mosque': 6,
       'pagoda': 6, 'manor': 4, 'monument': 3, 'obelisk': 4, 'statue': 3, 'column': 4, 'tower': 4, 'station': 3, 'chapel': 2, 'watermill': 3, 'aqueduct': 5,
       'observatory': 5, 'water_tower': 1}
DEF = {'cathedral': (60, 28, 55), 'church': (24, 12, 26), 'chapel': (9, 6, 9), 'castle': (45, 35, 24), 'palace': (70, 22, 18), 'manor': (28, 14, 12), 'fort': (80, 80, 9),
       'ruins': (30, 20, 12), 'monastery': (70, 60, 24), 'gate': (14, 10, 16), 'tower': (8, 8, 22), 'lighthouse': (7, 7, 26), 'windmill': (8, 8, 15), 'watermill': (12, 9, 9),
       'monument': (5, 5, 8), 'obelisk': (3, 3, 14), 'statue': (3, 3, 6), 'column': (4, 4, 18), 'station': (40, 14, 11), 'mosque': (30, 30, 16), 'pagoda': (12, 12, 18),
       'aqueduct': (60, 4, 14), 'observatory': (14, 14, 12), 'water_tower': (8, 8, 22), 'wall': (40, 4, 7)}
OLD_OK = {'cathedral', 'church', 'chapel', 'castle', 'palace', 'manor', 'fort', 'ruins', 'monastery', 'gate', 'wall', 'windmill', 'watermill', 'aqueduct', 'mosque', 'pagoda',
          'lighthouse', 'tower', 'column', 'obelisk', 'station'}

def landmarks(pr, bb_near, bb_far, route_xz, year, host, overpass):
    """route_xz — точки дороги (x, z). Возвращает список примет для игры."""
    q = ('[out:json][timeout:180];(' +
         ''.join('%s["%s"~"%s"](%s);' % (t, k, v, bb_near) for t, k, v in (
             ('nwr', 'historic', '^(castle|fortress|fort|city_gate|tower|monument|memorial|ruins|manor|monastery|church|chapel|wayside_chapel|palace|aqueduct|citywalls|observatory|windmill|watermill)$'),
             ('nwr', 'building', '^(cathedral|church|chapel|basilica|mosque|temple|shrine|monastery|castle|palace|train_station|lighthouse|windmill)$'),
             ('nwr', 'man_made', '^(lighthouse|windmill|watermill|water_tower|tower|obelisk|observatory)$'),
             ('way', 'barrier', '^(city_wall)$'))) +
         'way["barrier"="wall"]["name"~"长城|Great Wall|Великая"](%s);' % bb_near +
         'nwr["amenity"="place_of_worship"]["building"](%s);' % bb_near +
         ''.join('%s["%s"~"%s"]["wikidata"](%s);' % (t, k, v, bb_far) for t, k, v in (
             ('nwr', 'historic', '^(castle|fortress|palace|monastery|citywalls)$'), ('nwr', 'building', '^(cathedral|basilica|palace|castle)$'),
             ('nwr', 'man_made', '^(lighthouse)$'))) +
         ');out tags geom;')
    try: js = overpass(q)
    except Exception as e:
        LOG('  landmarks: overpass fail', repr(e)[:200]); return []
    items = []
    for e in js.get('elements', []):
        t = e.get('tags') or {}; k = classify(t)
        if not k: continue
        if e['type'] == 'node': P = [pr.xy(e['lat'], e['lon'])]
        elif e.get('geometry'): P = [pr.xy(g['lat'], g['lon']) for g in e['geometry'] if g]
        elif e.get('bounds'):
            b = e['bounds']; P = [pr.xy(b['minlat'], b['minlon']), pr.xy(b['maxlat'], b['maxlon'])]
        else: continue
        if not P: continue
        items.append((k, t, P, e['type']))
    # годы: из тегов, иначе Викиданные
    wd_fetch([t.get('wikidata') for k, t, P, ty in items if t.get('wikidata') and not year_tag(t)], claims=True)
    wd_fetch([t.get('wikidata') for k, t, P, ty in items if t.get('wikidata')])
    out = []; cut = {'late': 0, 'unknown': 0}
    RX = [p[0] for p in route_xz]; RZ = [p[1] for p in route_xz]
    def dist_route(x, z):
        best = 1e18; bi = 0
        for i in range(0, len(RX), 4):
            d = (RX[i] - x) ** 2 + (RZ[i] - z) ** 2
            if d < best: best, bi = d, i
        return math.sqrt(best), bi
    for k, t, P, ty in items:
        y = year_tag(t)
        if y is None and t.get('wikidata'): y = (WD.get(t['wikidata']) or {}).get('y')
        if y is not None and y > year: cut['late'] += 1; continue
        if y is None and k not in OLD_OK: cut['unknown'] += 1; continue
        if k == 'station' and y is None and year < 1890: continue
        if k in ('wall', 'aqueduct') or (ty == 'way' and P[0] != P[-1] and len(P) > 2 and k in ('wall', 'aqueduct')):
            line = P
            if len(line) < 2: continue
            cx = sum(p[0] for p in line) / len(line); cz = sum(p[1] for p in line) / len(line)
            L, W, ang = 0, 0, 0
        else:
            cx, cz, L, W, ang = rect_of(P) if len(P) > 2 else (P[0][0], P[0][1], 0, 0, 0)
            line = None
        dL, dW, dH = DEF.get(k, (10, 8, 10))
        if L < 2: L, W = dL, dW
        L, W = min(L, 160), min(max(W, 2), 120)
        h = None
        try: h = float(str(t.get('height', '')).replace('m', '').strip() or 'nan')
        except Exception: h = None
        if h is None or h != h:
            try: lv = float(t.get('building:levels', '')); h = lv * 3.6
            except Exception: h = None
        if h is None or h != h or h <= 0: h = dH * max(0.7, min(1.6, (L / max(dL, 1)) ** 0.5))
        d, bi = dist_route(cx, cz)
        name = ru_name(t, host)
        sc = IMP.get(k, 1) + (2 if t.get('wikidata') else 0) + (1 if name else 0) - d / 900.0
        far = d > 2600
        if far and not t.get('wikidata'): continue
        if d < 12 + W / 2: continue  # на самой дороге — не ставим
        o = {'k': k, 'n': name, 'x': round(cx, 1), 'z': round(cz, 1), 'l': round(L, 1), 'w': round(W, 1), 'r': round(ang, 3), 'h': round(min(h, 160), 1),
             'y': y or 0, 'i': bi, 'd': round(d), 'sc': round(sc, 2)}
        if far: o['far'] = 1
        if line: o['line'] = [[round(p[0], 1), round(p[1], 1)] for p in line[::max(1, len(line) // 60)]]
        out.append(o)
    # одна примета на место: самая важная (соседние церковь + часовня — одна), не больше 28 близких и 6 дальних
    out.sort(key=lambda o: -o['sc']); keep = []
    for o in out:
        if any(math.hypot(o['x'] - p['x'], o['z'] - p['z']) < max(18, (o['l'] + p['l']) / 3) for p in keep): continue
        keep.append(o)
    near = [o for o in keep if not o.get('far')][:28]; farl = [o for o in keep if o.get('far')][:6]
    LOG('  landmarks', len(items), '→', len(near), 'near +', len(farl), 'far; cut by year', cut, [(o['k'], o['n']) for o in (near + farl)[:14]])
    return near + farl
