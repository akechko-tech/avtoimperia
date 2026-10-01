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

# ---------- русские имена: name:ru → Викиданные → перевод и транскрипция (terrain_names) ----------
import terrain_names as TN

def ru_name(tags, host, kind=None):
    """Имя приметы: «Церковь св. Петра», «Замок Фарг», «Руины замка Кламм»."""
    if not tags: return ''
    if tags.get('name:ru'): return TN.shorten_ru(tags['name:ru'])
    q = tags.get('wikidata')
    if q and wd_ru(q): return TN.shorten_ru(wd_ru(q))
    n = tags.get('name') or ''
    if host in ('cn', 'ly', 'ru') and not n: n = tags.get('name:en') or ''
    if host == 'ly' and n and not re.search('[A-Za-z]', n): n = tags.get('name:it') or tags.get('name:en') or tags.get('name:fr') or ''
    if not n: return ''
    return TN.ru_label(n, host, kind) or ''

def ru_place_name(tags, host, river=False):
    """Имя города, деревни, реки: name:ru → Викиданные → транскрипция («Сен-Мартен-ан-Кампань»)."""
    if not tags: return ''
    if tags.get('name:ru'): return tags['name:ru']
    q = tags.get('wikidata')
    if q and wd_ru(q): return wd_ru(q)
    n = tags.get('name') or tags.get('name:en') or ''
    if host == 'ly' and n and not re.search('[A-Za-z]', n): n = tags.get('name:it') or tags.get('name:en') or ''
    if TN.CJK.search(n or ''): return TN.cn_label(n) or ''
    return TN.ru_place(n, host, river)

def translit(name, host):  # совместимость
    return TN.ru_place(name, host)

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
    if mm in ('pier', 'breakwater', 'groyne', 'communications_tower', 'mast') or t.get('tower:type') in ('communication', 'radar', 'lighting'): return None
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
    if h == 'tower' or (mm == 'tower' and t.get('tower:type', '') in ('bell_tower', 'defensive', 'watchtower', 'clock')) or (mm == 'tower' and h): return 'tower'
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
          'lighthouse', 'tower', 'station'}
# там, где старых построек мало, а новых много (Россия, США, Китай, Ливия), без года — только объекты наследия или с Викиданными
STRICT = ('ru', 'us', 'cn', 'ly')
HERITAGE = ('heritage', 'heritage:operator', 'ref:okn', 'ref:nrhp', 'nrhp:inscription_date', 'listed_status', 'historic:civilization', 'ref:mhs', 'ref:mérimée',
            'ref:merimee', 'heritage:ref', 'protection_title', 'denkmal', 'ref:denkmal', 'historic:period')
CASTLEISH = re.compile(r'burg|schlo|ch[aâ]teau|castle|castel|castil|kasteel|fort|abb[ae]y|abbaye|abtei|kloster|priory|prieur|tower|tour\b|turm|torre|aqueduc|acquedott|'
                       r'wall|mauer|rempart|mura\b|chapel|kapel|church|[ée]glise|kirche|chiesa|iglesia|monaster|монастыр|замок|крепост|башн|храм|собор|lazaret|'
                       r'roman|r[öo]mi|romain|romano|celt|templ|ruine de l|keep|donjon|motte|长城|关|城', re.I)
MODERN_RU = re.compile(r'новомученик|ксени[ия]\s+петербу|матрон|иоанна\s+кронштадт|луки\s+крымск|царственн|николая\s+ii|царицы\s+тамары|в\s+земле\s+российской|'
                       r'на\s+земле\s+петербургской|всех\s+святых,?\s+в\s+земле|серафима\s+вырицк|киров|ленин|сталин|советск|октябр|красн(ой|ая)\s+арми|'
                       r'победы|великой\s+отечествен|\bвов\b|воин|погибш|гагарин|комсомол|партизан|блокад|мемориал|братская\s+могила|дом\s+культуры|'
                       r'культурн|национально-культурн|заброшен|руины\s+госпитал|баня', re.I)
WAR_RX = re.compile(r'aux\s+morts|war\s+memorial|kriegerdenkmal|gefallen|caduti|ehrenmal|monumento\s+ai\s+caduti|памятник\s+погибш|résistance|resistance|'
                    r'déporté|deporte|libération|liberation|fusillé|weltkrieg|world\s+war|grande\s+guerre|great\s+war', re.I)
MODERN_ALL = re.compile(r'museum|musée|musee|museo|музей|memorial\s+park|visitor|information|infoblick|aussichtsplattform|platform|viewpoint|belvedere|'
                        r'stolperstein|ghost\s+bike|replica|réplique|nachbau|copy\s+of', re.I)

def landmarks(pr, bb_near, bb_far, route_xz, year, host, overpass, lang=None):
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
    cut.update({'former': 0, 'modern': 0, 'strict': 0, 'noname': 0, 'ruins': 0})
    for k, t, P, ty in items:
        n0 = t.get('name') or t.get('name:en') or t.get('name:ru') or ''
        nall = ' '.join(x for x in (n0, t.get('name:ru') or '', (WD.get(t.get('wikidata') or '') or {}).get('ru') or '') if x)
        y = year_tag(t)
        if y is None and t.get('wikidata'): y = (WD.get(t['wikidata']) or {}).get('y')
        if y is not None and y > year: cut['late'] += 1; continue
        if TN.is_former(n0) or re.search(r'\b(ehem|ehemalig|former|бывш)', n0, re.I): cut['former'] += 1; continue
        if MODERN_ALL.search(n0) and k not in ('church', 'cathedral', 'chapel', 'castle', 'palace', 'monastery', 'manor'): cut['modern'] += 1; continue
        if host == 'ru' and MODERN_RU.search(nall): cut['modern'] += 1; continue
        if WAR_RX.search(nall) and (y is None or y > year) and year < 1946:
            yy = [int(v) for v in re.findall(r'(1[89]\d\d|20\d\d)', nall)]
            if not yy or max(yy) > year - 1 or year < 1919: cut['modern'] += 1; continue
        heritage = any(t.get(h_) for h_ in HERITAGE) or bool(t.get('wikidata'))
        if y is None and k not in OLD_OK: cut['unknown'] += 1; continue
        if k == 'mosque' and y is None and host not in ('ly', 'cn') and not t.get('heritage'): cut['modern'] += 1; continue  # мечети в Европе и Америке — почти все новые
        if y is None and host in STRICT and not heritage and k not in ('wall', 'gate', 'castle', 'fort') : cut['strict'] += 1; continue
        if not n0 and k in ('tower', 'ruins', 'monument', 'obelisk', 'statue', 'column', 'water_tower', 'observatory', 'station', 'manor', 'palace', 'gate'):
            cut['noname'] += 1; continue
        if k == 'ruins' and y is None and not (CASTLEISH.search(n0) or t.get('ruins') in ('castle', 'fortification', 'church', 'monastery', 'abbey')
                                               or t.get('castle_type') or t.get('historic:civilization')):
            cut['ruins'] += 1; continue
        if k == 'ruins' and host in STRICT and not heritage: cut['ruins'] += 1; continue
        if k == 'station' and (y is None and year < 1890 or t.get('station') in ('subway', 'light_rail', 'monorail', 'funicular') or t.get('railway') in ('halt', 'tram_stop')): continue
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
        name = ru_name(t, lang or host, k)
        if re.search(r'музей|museum', name or '', re.I) and k in ('church', 'chapel', 'cathedral'): name = TN.KIND_RU[k][0].capitalize()
        sc = IMP.get(k, 1) + (2 if t.get('wikidata') else 0) + (1 if name else 0) - d / 900.0
        far = d > 2600
        if far and not t.get('wikidata'): continue
        if d < 12 + W / 2: continue  # на самой дороге — не ставим
        o = {'k': k, 'n': name, 'x': round(cx, 1), 'z': round(cz, 1), 'l': round(L, 1), 'w': round(W, 1), 'r': round(ang, 3), 'h': round(min(h, 160), 1),
             'y': y or 0, 'i': bi, 'd': round(d), 'sc': round(sc, 2), 'n0': n0[:60]}
        if t.get('wikidata'): o['wd'] = t['wikidata']
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
