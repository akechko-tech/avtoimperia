"""Реальные трассы (ТЗ 0.18, раздел 2) — задание terrain в media CI.
Источники: рельеф Copernicus DEM GLO-30 (AWS Open Data), карта OpenStreetMap (Overpass API, ODbL),
цвет земли Sentinel-2 cloudless 2016 (EOX IT Services, CC BY 4.0).
Для каждой гонки из tools/media/terrain_races.json:
  маршрут по дорогам OSM через опорные точки (без автомагистралей) → точки через 8 м, высота дороги (сглажена, уклон ≤ 10%),
  типы участков (город, село, поле, лес, виноградник, мост, переезд, берег, серпантин) с отмоткой к году гонки,
  сетка рельефа вокруг (±2,4 км, 50 м) и дальнее кольцо (±9 км, 250 м), палитра региона, карта для заставки, приметы.
Результат: media/terrain/<id>.json и превью media/terrain/<id>.png."""
import json, os, math, time, heapq, base64, io, urllib.request, urllib.parse, urllib.error
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEDIA = os.path.join(ROOT, 'media')
TOOLS = os.path.join(ROOT, 'tools', 'media')
UA = 'AvtoimperiaBuild/1.0 (https://github.com/akechko-tech/avtoimperia; historic race tracks from open data)'
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']
STEP = 8.0
LOG = print

def http(url, data=None, tries=5, timeout=180, headers=None):
    h = {'User-Agent': UA}
    if headers: h.update(headers)
    for k in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers=h)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (400, 404) or k == tries - 1: raise
            time.sleep(20 * (k + 1) if e.code in (429, 504) else 3 * (k + 1))
        except Exception:
            if k == tries - 1: raise
            time.sleep(3 * (k + 1))

def geocode(q):
    try:
        u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'json', 'limit': 1})
        r = json.loads(http(u, timeout=60)); time.sleep(1.2)
        if r: return [float(r[0]['lat']), float(r[0]['lon'])]
    except Exception as e:
        LOG('geocode fail', q, repr(e))
    return None

def overpass(q):
    last = None
    for base in OVERPASS:
        try:
            raw = http(base, data=urllib.parse.urlencode({'data': q}).encode(), timeout=300, tries=3)
            return json.loads(raw)
        except Exception as e:
            last = e; LOG('overpass fail', base, repr(e)[:200]); time.sleep(5)
    raise last

# ---------- проекция: x — на восток, z — на север (как в игре: смотрим вдоль +z, +x справа) ----------
class Proj:
    def __init__(s, lat0, lon0):
        s.lat0, s.lon0 = lat0, lon0; s.kx = math.cos(math.radians(lat0)) * 111320.0; s.kz = 110540.0
    def xy(s, lat, lon): return ((lon - s.lon0) * s.kx, (lat - s.lat0) * s.kz)
    def ll(s, x, z): return (s.lat0 + z / s.kz, s.lon0 + x / s.kx)

# ---------- рельеф Copernicus GLO-30 (облачные COG на AWS) ----------
def dem_sampler(lat0, lat1, lon0, lon1):
    import rasterio
    from rasterio.windows import from_bounds
    tiles = {}
    env = rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif', GDAL_HTTP_MAX_RETRY='4', GDAL_HTTP_RETRY_DELAY='2')
    with env:
        for a in range(math.floor(lat0), math.floor(lat1) + 1):
            for b in range(math.floor(lon0), math.floor(lon1) + 1):
                ns = 'N' if a >= 0 else 'S'; ew = 'E' if b >= 0 else 'W'
                name = 'Copernicus_DSM_COG_10_%s%02d_00_%s%03d_00_DEM' % (ns, abs(a), ew, abs(b))
                url = 'https://copernicus-dem-30m.s3.amazonaws.com/%s/%s.tif' % (name, name)
                try:
                    with rasterio.open('/vsicurl/' + url) as ds:
                        w = from_bounds(max(lon0, b) - 0.005, max(lat0, a) - 0.005, min(lon1, b + 1) + 0.005, min(lat1, a + 1) + 0.005, ds.transform)
                        w = w.round_offsets().round_lengths()
                        arr = ds.read(1, window=w, boundless=True, fill_value=0).astype('float32')
                        tiles[(a, b)] = (arr, ds.window_transform(w))
                        LOG('dem', name, arr.shape, 'min', float(arr.min()), 'max', float(arr.max()))
                except Exception as e:
                    LOG('dem tile missing', name, repr(e)[:160])
    def sample(lat, lon):
        lat = np.asarray(lat, 'float64'); lon = np.asarray(lon, 'float64'); out = np.zeros(lat.shape, 'float32')
        for (a, b), (arr, tr) in tiles.items():
            m = (lat >= a) & (lat < a + 1) & (lon >= b) & (lon < b + 1)
            if not m.any(): continue
            col = (lon[m] - tr.c) / tr.a - 0.5; row = (lat[m] - tr.f) / tr.e - 0.5
            c0 = np.clip(np.floor(col).astype(int), 0, arr.shape[1] - 2); r0 = np.clip(np.floor(row).astype(int), 0, arr.shape[0] - 2)
            fc = np.clip(col - c0, 0, 1); fr = np.clip(row - r0, 0, 1)
            out[m] = (arr[r0, c0] * (1 - fc) + arr[r0, c0 + 1] * fc) * (1 - fr) + (arr[r0 + 1, c0] * (1 - fc) + arr[r0 + 1, c0 + 1] * fc) * fr
        return np.where(out < -50, 0, out)
    return sample, len(tiles)

# ---------- OSM ----------
ROAD_W = {'trunk': 1.35, 'primary': 1.0, 'secondary': 1.0, 'tertiary': 1.2, 'unclassified': 1.5, 'road': 1.6, 'residential': 1.5,
          'living_street': 2.0, 'trunk_link': 2.5, 'primary_link': 2.0, 'secondary_link': 2.0, 'tertiary_link': 2.0, 'service': 3.5, 'track': 4.0}

def osm_parse(js):
    nodes, ways = {}, []
    for e in js.get('elements', []):
        if e['type'] == 'node': nodes[e['id']] = (e['lat'], e['lon'], e.get('tags') or {})
    for e in js.get('elements', []):
        if e['type'] == 'way' and e.get('nodes'): ways.append({'id': e['id'], 'nodes': e['nodes'], 'tags': e.get('tags') or {}})
        if e['type'] == 'relation': ways.append({'id': e['id'], 'rel': True, 'members': e.get('members') or [], 'tags': e.get('tags') or {}})
    return nodes, ways

def dijkstra(adj, a, b):
    dist = {a: 0.0}; prev = {}; pq = [(0.0, a)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == b: break
        if d > dist.get(u, 1e18): continue
        for v, w, wid in adj.get(u, ()):
            nd = d + w
            if nd < dist.get(v, 1e18): dist[v] = nd; prev[v] = (u, wid); heapq.heappush(pq, (nd, v))
    if b not in dist: return None
    path, u = [b], b; wids = []
    while u != a: u, wid = prev[u]; path.append(u); wids.append(wid)
    return path[::-1], wids[::-1]

def resample(P, step):
    """P: [(x,z)] → равномерно через step метров; возвращает точки и индекс исходного отрезка для каждой."""
    out, seg = [P[0]], [0]; acc = 0.0; i = 0; px, pz = P[0]
    while i < len(P) - 1:
        x1, z1 = P[i + 1]; dx, dz = x1 - px, z1 - pz; L = math.hypot(dx, dz)
        if acc + L >= step and L > 1e-9:
            t = (step - acc) / L; px, pz = px + dx * t, pz + dz * t; out.append((px, pz)); seg.append(i); acc = 0.0
        else:
            acc += L; px, pz = x1, z1; i += 1
    return out, seg

def point_in_poly(x, z, poly):
    ins = False; n = len(poly); j = n - 1
    for i in range(n):
        xi, zi = poly[i]; xj, zj = poly[j]
        if ((zi > z) != (zj > z)) and (x < (xj - xi) * (z - zi) / ((zj - zi) or 1e-12) + xi): ins = not ins
        j = i
    return ins

def seg_inter(a, b, c, d):
    """пересечение отрезков ab и cd: (t вдоль ab) или None"""
    r = (b[0] - a[0], b[1] - a[1]); s = (d[0] - c[0], d[1] - c[1]); den = r[0] * s[1] - r[1] * s[0]
    if abs(den) < 1e-12: return None
    t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den; u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den
    return t if 0 <= t <= 1 and 0 <= u <= 1 else None

def dp_simplify(P, eps):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dz = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dz) or 1e-9; imax, dmax = 0, -1
    for i in range(1, len(P) - 1):
        d = abs((P[i][0] - a[0]) * dz - (P[i][1] - a[1]) * dx) / L
        if d > dmax: imax, dmax = i, d
    if dmax <= eps: return [a, b]
    return dp_simplify(P[:imax + 1], eps)[:-1] + dp_simplify(P[imax:], eps)

def name_of(tags):
    return tags.get('name:ru') or tags.get('name') or ''

def year_of(tags):
    for k in ('start_date', 'opening_date', 'construction:start_date'):
        v = tags.get(k)
        if v:
            try: return int(str(v).strip()[:4])
            except Exception: pass
    return None

# ---------- палитра региона: Sentinel-2 cloudless 2016 (EOX) ----------
def s2_palette(lat0, lat1, lon0, lon1, samples_ll):
    from PIL import Image
    z = 12; n = 2 ** z
    def tile_xy(lat, lon):
        x = (lon + 180) / 360 * n; y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
        return x, y
    cache = {}
    def px(lat, lon):
        x, y = tile_xy(lat, lon); tx, ty = int(x), int(y)
        if (tx, ty) not in cache:
            try:
                raw = http('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/%d/%d/%d.jpg' % (z, ty, tx), timeout=60, tries=3)
                cache[(tx, ty)] = np.asarray(Image.open(io.BytesIO(raw)).convert('RGB'))
            except Exception as e:
                LOG('s2 tile fail', z, tx, ty, repr(e)[:120]); cache[(tx, ty)] = None
        im = cache[(tx, ty)]
        if im is None: return None
        return im[min(255, int((y - ty) * 256)), min(255, int((x - tx) * 256))]
    cols = []
    for lat, lon in samples_ll:
        c = px(lat, lon)
        if c is None: continue
        r, g, b = [float(v) for v in c]
        if b > g * 1.05 and b > r: continue          # вода
        if r + g + b > 600 or r + g + b < 60: continue  # облака, тени
        cols.append((r, g, b))
    if len(cols) < 20: return None, len(cache)
    A = np.array(cols); rng = np.random.default_rng(1); C = A[rng.choice(len(A), 3, replace=False)]
    for _ in range(25):
        lab = np.argmin(((A[:, None, :] - C[None, :, :]) ** 2).sum(-1), 1)
        C = np.array([A[lab == k].mean(0) if (lab == k).any() else C[k] for k in range(3)])
    green = C[:, 1] / C.sum(1); order = np.argsort(-green)
    pal = {'meadow': [int(v) for v in C[order[0]]], 'dry': [int(v) for v in C[order[1]]], 'soil': [int(v) for v in C[order[2]]], 'n': len(cols)}
    return pal, len(cache)

# ---------- сетка высот: метры, по строкам — первое значение int16, дальше приращения int8 ----------
def pack_grid(H):
    H = np.round(H).astype(np.int32); nz, nx = H.shape; buf = bytearray()
    for j in range(nz):
        row = H[j]; buf += int(np.clip(row[0], -32000, 32000)).to_bytes(2, 'little', signed=True); prev = int(row[0])
        for k in range(1, nx):
            d = int(np.clip(row[k] - prev, -127, 127)); buf += d.to_bytes(1, 'little', signed=True); prev += d
    return base64.b64encode(bytes(buf)).decode('ascii')

def build_race(R, out_dir):
    rid, year = R['id'], R['year']
    LOG('==== terrain', rid, R['name'], year)
    pts_ll = []
    for p in R['pts']:
        g = geocode(p['q']) if p.get('q') else None
        LOG('  point', p.get('q'), '->', g, 'fallback', p.get('ll'))
        if g and p.get('ll') and math.hypot((g[0] - p['ll'][0]) * 111, (g[1] - p['ll'][1]) * 111 * math.cos(math.radians(g[0]))) > 6: g = None
        pts_ll.append(g or p['ll'])
    lat0 = sum(p[0] for p in pts_ll) / len(pts_ll); lon0 = sum(p[1] for p in pts_ll) / len(pts_ll)
    pr = Proj(lat0, lon0)
    m_lat = 2600 / 110540.0; m_lon = 2600 / pr.kx
    la0, la1 = min(p[0] for p in pts_ll) - m_lat, max(p[0] for p in pts_ll) + m_lat
    lo0, lo1 = min(p[1] for p in pts_ll) - m_lon, max(p[1] for p in pts_ll) + m_lon
    bb = '%.5f,%.5f,%.5f,%.5f' % (la0, lo0, la1, lo1)
    feats = overpass('[out:json][timeout:240];(' +
        'way["highway"]["highway"!~"motorway|motorway_link|construction|proposed|footway|path|cycleway|bridleway|steps|pedestrian|platform|corridor|bus_stop"](%s);' % bb +
        'way["natural"~"^(water|wood|scrub|coastline|beach|heath|grassland)$"](%s);' % bb +
        'way["waterway"~"^(river|stream|canal)$"](%s);' % bb +
        'way["landuse"~"^(forest|farmland|meadow|vineyard|orchard|residential|industrial|commercial|retail|reservoir|quarry|basin)$"](%s);' % bb +
        'relation["landuse"~"^(forest|residential|vineyard)$"](%s);relation["natural"~"^(water|wood)$"](%s);' % (bb, bb) +
        'node["place"~"^(city|town|village|hamlet)$"](%s);' % bb +
        'way["railway"~"^(rail|abandoned|disused|narrow_gauge)$"](%s);' % bb +
        'way["natural"="tree_row"](%s);way["aeroway"](%s);' % (bb, bb) +
        ');out body;>;out skel qt;')
    nodes, ways = osm_parse(feats)
    LOG('  osm nodes', len(nodes), 'ways', len(ways))
    XY = {nid: pr.xy(n[0], n[1]) for nid, n in nodes.items()}
    wid_tags = {w['id']: w['tags'] for w in ways}
    # полигоны: замкнутые линии и внешние кольца отношений (кусками)
    def polys(pred):
        out = []
        for w in ways:
            t = w['tags']
            if not pred(t): continue
            if w.get('rel'):
                for m in w['members']:
                    if m.get('type') == 'way' and m.get('role', 'outer') in ('outer', ''):
                        ww = next((x for x in ways if x['id'] == m['ref'] and not x.get('rel')), None)
                        if ww and len(ww['nodes']) > 3 and ww['nodes'][0] == ww['nodes'][-1]: out.append([XY[n] for n in ww['nodes'] if n in XY])
            elif len(w['nodes']) > 3 and w['nodes'][0] == w['nodes'][-1]:
                out.append([XY[n] for n in w['nodes'] if n in XY])
        return [p for p in out if len(p) > 3]
    def lines(pred):
        return [(w['tags'], [XY[n] for n in w['nodes'] if n in XY]) for w in ways if not w.get('rel') and pred(w['tags'])]
    # ---------- маршрут ----------
    if R['kind'] == 'oval':
        o = R['oval']; c = pr.xy(*o['center']); Ls, Lc, Lt = o['straight'], o['chute'], o['turn']; rT = Lt / (math.pi / 2)
        # прямоугольник со скруглёнными углами; прямые — с севера на юг, едем против часовой (главная прямая — западная, на юг)
        hx, hz = Lc / 2, Ls / 2; P = []
        def arc(cx, cz, a0, a1):
            for k in range(0, 41): a = a0 + (a1 - a0) * k / 40; P.append((cx + rT * math.cos(a), cz + rT * math.sin(a)))
        P.append((c[0] - hx - rT, c[1] + hz))
        P.append((c[0] - hx - rT, c[1] - hz)); arc(c[0] - hx, c[1] - hz, math.pi, 1.5 * math.pi)
        P.append((c[0] + hx, c[1] - hz - rT)); arc(c[0] + hx, c[1] - hz, 1.5 * math.pi, 2 * math.pi)
        P.append((c[0] + hx + rT, c[1] + hz)); arc(c[0] + hx, c[1] + hz, 0, 0.5 * math.pi)
        P.append((c[0] - hx, c[1] + hz + rT)); arc(c[0] - hx, c[1] + hz, 0.5 * math.pi, math.pi)
        route, _ = resample(P, STEP)
        if math.dist(route[-1], route[0]) < STEP * 0.6: route = route[:-1]
        route_wid = [None] * len(route); closed = True
    else:
        adj = {}; roadnodes = set()
        for w in ways:
            t = w['tags']; hw = t.get('highway')
            if w.get('rel') or not hw or hw not in ROAD_W: continue
            if t.get('motorroad') == 'yes' or t.get('expressway') == 'yes' or t.get('access') in ('no', 'private'): continue
            k = ROAD_W[hw] * (1.4 if (t.get('lanes') and t['lanes'].isdigit() and int(t['lanes']) >= 4) else 1.0) * (1.6 if 'rocade' in (t.get('name') or '').lower() or 'bypass' in (t.get('name') or '').lower() else 1.0)
            ow = t.get('oneway') == 'yes'
            for a, b in zip(w['nodes'], w['nodes'][1:]):
                if a not in XY or b not in XY: continue
                L = math.dist(XY[a], XY[b]); adj.setdefault(a, []).append((b, L * k, w['id']))
                if not ow: adj.setdefault(b, []).append((a, L * k, w['id']))
                roadnodes.add(a); roadnodes.add(b)
        good = [n for n in roadnodes if any(wid_tags.get(e[2], {}).get('highway') in ('primary', 'secondary', 'tertiary', 'trunk') for e in adj.get(n, []))]
        def snap(ll):
            p = pr.xy(*ll); best = None
            for pool in (good, list(roadnodes)):
                for n in pool:
                    d = math.dist(XY[n], p)
                    if best is None or d < best[0]: best = (d, n)
                if best and best[0] < 700: break
            return best[1]
        path, pwids = [], []
        snaps = [snap(ll) for ll in pts_ll]
        for a, b in zip(snaps, snaps[1:]):
            r = dijkstra(adj, a, b)
            if not r: raise RuntimeError('нет дороги между опорными точками')
            p, wi = r
            if path: p = p[1:]
            path += p; pwids += wi
        P = [XY[n] for n in path]
        route, segidx = resample(P, STEP); route_wid = [pwids[min(len(pwids) - 1, s)] if pwids else None for s in segidx]; closed = False
        LOG('  route', len(path), 'nodes ->', len(route), 'points,', round(len(route) * STEP / 1000, 2), 'km')
    n = len(route); X = np.array([p[0] for p in route]); Z = np.array([p[1] for p in route])
    # ---------- рельеф ----------
    ring = 9500.0; RL = [pr.ll(x, z) for x, z in zip(X, Z)]
    la0 = min(p[0] for p in RL) - ring / 110540; la1 = max(p[0] for p in RL) + ring / 110540
    lo0 = min(p[1] for p in RL) - ring / pr.kx; lo1 = max(p[1] for p in RL) + ring / pr.kx
    dem, ntiles = dem_sampler(la0, la1, lo0, lo1)
    def demxz(x, z):
        x = np.asarray(x, 'float64'); z = np.asarray(z, 'float64'); return dem(pr.lat0 + z / pr.kz, pr.lon0 + x / pr.kx)
    Y = demxz(X, Z).astype('float64')
    # мосты по пути: высота — прямой между концами
    br = [bool(route_wid[i] and wid_tags.get(route_wid[i], {}).get('bridge') not in (None, 'no')) for i in range(n)]
    i = 0
    while i < n:
        if br[i]:
            j = i
            while j + 1 < n and br[j + 1]: j += 1
            a, b = max(0, i - 1), min(n - 1, j + 1)
            for k in range(a, b + 1): Y[k] = Y[a] + (Y[b] - Y[a]) * (k - a) / max(1, b - a)
            i = j + 1
        else: i += 1
    raw = Y.copy()
    for _ in range(3):  # сглаживание ±48 м
        Yp = np.pad(Y, 6, mode='wrap' if closed else 'edge'); Y = np.convolve(Yp, np.ones(13) / 13, mode='valid')
    g = 0.10 * STEP
    for _ in range(6):  # уклон под эпоху — не круче 10%
        for k in range(1, n): Y[k] = min(max(Y[k], Y[k - 1] - g), Y[k - 1] + g)
        for k in range(n - 2, -1, -1): Y[k] = min(max(Y[k], Y[k + 1] - g), Y[k + 1] + g)
    if R['kind'] == 'oval': Y[:] = float(np.median(raw))
    LOG('  elev', round(float(raw.min()), 1), '..', round(float(raw.max()), 1), 'smoothed', round(float(Y.min()), 1), '..', round(float(Y.max()), 1))
    # ---------- направление и кривизна ----------
    T = []; N = []
    for k in range(n):
        a = (k - 1) % n if closed else max(0, k - 1); b = (k + 1) % n if closed else min(n - 1, k + 1)
        tx, tz = X[b] - X[a], Z[b] - Z[a]; L = math.hypot(tx, tz) or 1; T.append((tx / L, tz / L)); N.append((-tz / L, tx / L))
    K = []
    for k in range(n):
        a = T[(k - 1) % n if closed else max(0, k - 1)]; b = T[(k + 1) % n if closed else min(n - 1, k + 1)]
        K.append(math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1]) / (2 * STEP))
    # ---------- слои карты и отмотка к году ----------
    popk = R.get('pop', 0.5)
    places = []
    for nid, (la, lo, t) in nodes.items():
        pl = t.get('place')
        if pl not in ('city', 'town', 'village', 'hamlet'): continue
        try: pop = int(str(t.get('population', '')).replace(' ', '').replace(',', '').split(';')[0] or 0)
        except Exception: pop = 0
        if not pop: pop = {'city': 60000, 'town': 8000, 'village': 700, 'hamlet': 120}[pl]
        pe = pop * popk; x, z = pr.xy(la, lo)
        r = min(1500, 90 + 8.5 * math.sqrt(pe)) if pl in ('city', 'town') else min(420, 50 + 7 * math.sqrt(pe))
        places.append({'x': x, 'z': z, 'pl': pl, 'pop': int(pe), 'r': r, 'name': name_of(t), 'name0': t.get('name', '')})
    forest = polys(lambda t: t.get('landuse') == 'forest' or t.get('natural') in ('wood',))
    vine = polys(lambda t: t.get('landuse') in ('vineyard', 'orchard'))
    water = polys(lambda t: (t.get('natural') == 'water' and t.get('water') not in ('reservoir', 'basin', 'wastewater', 'pond')) )
    removed = {'reservoir': len(polys(lambda t: t.get('landuse') in ('reservoir', 'basin') or t.get('water') in ('reservoir', 'basin'))),
               'aeroway': len([1 for w in ways if w['tags'].get('aeroway')]), 'industrial': len(polys(lambda t: t.get('landuse') in ('industrial', 'commercial', 'retail', 'quarry'))),
               'motorway': 0}
    rivers = lines(lambda t: t.get('waterway') in ('river', 'stream', 'canal'))
    coast = lines(lambda t: t.get('natural') == 'coastline')
    rails_all = lines(lambda t: t.get('railway') in ('rail', 'abandoned', 'disused', 'narrow_gauge'))
    rails = []; rails_cut = 0
    for t, L in rails_all:
        y = year_of(t)
        if y and y > year: rails_cut += 1; continue
        if t.get('usage') in ('industrial', 'military', 'tourism') or t.get('service') in ('yard', 'siding', 'spur'): continue
        if t.get('highspeed') == 'yes' or (t.get('maxspeed') and str(t['maxspeed']).isdigit() and int(t['maxspeed']) >= 220): rails_cut += 1; continue
        rails.append((t, L))
    removed['rail_after_year'] = rails_cut
    LOG('  places', len(places), 'forest', len(forest), 'vine', len(vine), 'water', len(water), 'rivers', len(rivers), 'coast', len(coast), 'rails', len(rails), 'removed', removed)
    # ---------- типы участков ----------
    TY = {'fields': 0, 'town': 1, 'village': 2, 'forest': 3, 'avenue': 4, 'bridge': 5, 'rail': 6, 'serp': 7, 'coast': 8, 'vine': 9}
    S = [0] * n; town_at = [None] * n
    for k in range(n):
        x, z = X[k], Z[k]
        best = None
        for p in places:
            d = math.hypot(x - p['x'], z - p['z'])
            if d <= p['r'] and (best is None or d / p['r'] < best[0]): best = (d / p['r'], p)
        if best:
            p = best[1]; S[k] = TY['town'] if (p['pl'] in ('city', 'town') and p['pop'] >= 1200) else TY['village']; town_at[k] = p; continue
        nx, nz = N[k]
        def inside(polys_, off):
            for sd in (1, -1):
                px, pz = x + nx * off * sd, z + nz * off * sd
                for P_ in polys_:
                    if point_in_poly(px, pz, P_): return True
            return False
        if forest and inside(forest, 28): S[k] = TY['forest']
        elif vine and inside(vine, 40): S[k] = TY['vine']
        if abs(K[k]) > 1 / 38 and k > 0 and abs(Y[k] - Y[k - 1]) / STEP > 0.04: S[k] = TY['serp']
    # мосты над водой
    bridges = []; k = 0
    while k < n:
        if br[k]:
            j = k
            while j + 1 < n and br[j + 1]: j += 1
            a, b = (X[k], Z[k]), (X[j], Z[j]); nm = None
            if j - k >= 1:
                for t, L in rivers:
                    for c, d in zip(L, L[1:]):
                        if seg_inter((a[0] - (b[0] - a[0]) * 0.3, a[1] - (b[1] - a[1]) * 0.3), (b[0] + (b[0] - a[0]) * 0.3, b[1] + (b[1] - a[1]) * 0.3), c, d) is not None:
                            nm = name_of(t) or '—'; break
                    if nm: break
                if not nm:
                    for P_ in water:
                        if point_in_poly((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, P_): nm = '—'; break
            if nm:
                bridges.append({'i': (k + j) // 2, 'i0': k, 'i1': j, 'name': nm})
                for q in range(max(0, k - 1), min(n, j + 2)): S[q] = TY['bridge']
            k = j + 1
        else: k += 1
    # железнодорожные переезды (линии, построенные к году гонки; мост или тоннель — не переезд)
    xings = []
    for t, L in rails:
        if t.get('bridge') not in (None, 'no') or t.get('tunnel') not in (None, 'no'): continue
        for c, d in zip(L, L[1:]):
            for k in range(n - 1):
                if abs(X[k] - c[0]) > 2000 and abs(X[k] - d[0]) > 2000: continue
                tt = seg_inter((X[k], Z[k]), (X[k + 1], Z[k + 1]), c, d)
                if tt is None or br[k] or br[k + 1]: continue
                rx, rz = d[0] - c[0], d[1] - c[1]; rl = math.hypot(rx, rz) or 1
                ang = math.asin(max(-1, min(1, (T[k][0] * rz - T[k][1] * rx) / rl)))
                xings.append({'i': k, 'ang': round(math.pi / 2 - abs(ang), 3) * (1 if ang >= 0 else -1), 'name': name_of(t)})
    xs = []
    for x in sorted(xings, key=lambda q: q['i']):
        if not xs or x['i'] - xs[-1]['i'] > 12: xs.append(x)
    for x in xs:
        for q in range(max(0, x['i'] - 2), min(n, x['i'] + 3)): S[q] = TY['rail']
    # берег моря
    coast_runs = []
    if coast:
        cpts = [p for t, L in coast for p in L]
        C = np.array(cpts) if cpts else None
        if C is not None and len(C):
            side = [0] * n
            for k in range(n):
                d2 = (C[:, 0] - X[k]) ** 2 + (C[:, 1] - Z[k]) ** 2; j = int(np.argmin(d2))
                if d2[j] < 380 ** 2 and S[k] in (0, 3, 4, 9):
                    s = (C[j, 0] - X[k]) * N[k][0] + (C[j, 1] - Z[k]) * N[k][1]; side[k] = 1 if s > 0 else -1
            k = 0
            while k < n:
                if side[k]:
                    j = k
                    while j + 1 < n and side[j + 1] == side[k]: j += 1
                    if j - k >= 20:
                        coast_runs.append({'i0': k, 'i1': j, 'side': side[k]})
                        for q in range(k, j + 1): S[q] = TY['coast']
                    k = j + 1
                else: k += 1
    # короткие куски — к соседям (кроме мостов и переездов)
    def runs(S):
        out = []; k = 0
        while k < n:
            j = k
            while j + 1 < n and S[j + 1] == S[k]: j += 1
            out.append([S[k], k, j]); k = j + 1
        return out
    for _ in range(3):
        rr = runs(S)
        for a in range(len(rr)):
            t, i0, i1 = rr[a]
            if i1 - i0 < 6 and t not in (TY['bridge'], TY['rail']):
                nb = rr[a - 1][0] if a > 0 else (rr[a + 1][0] if a + 1 < len(rr) else 0)
                for q in range(i0, i1 + 1): S[q] = nb
    segs = []
    for t, i0, i1 in runs(S):
        e = [t, i0, i1]
        if t in (TY['town'], TY['village']):
            ps = [town_at[q] for q in range(i0, i1 + 1) if town_at[q]]
            if ps: e.append(ps[len(ps) // 2]['name'])
        segs.append(e)
    # ---------- сетки высот ----------
    def grid(cell, pad):
        x0, x1 = float(X.min()) - pad, float(X.max()) + pad; z0, z1 = float(Z.min()) - pad, float(Z.max()) + pad
        nx = int(math.ceil((x1 - x0) / cell)) + 1; nz = int(math.ceil((z1 - z0) / cell)) + 1
        gx, gz = np.meshgrid(x0 + np.arange(nx) * cell, z0 + np.arange(nz) * cell)
        H = demxz(gx.ravel(), gz.ravel()).reshape(nz, nx)
        return {'x0': round(x0, 1), 'z0': round(z0, 1), 'S': cell, 'nx': nx, 'nz': nz, 'h': pack_grid(H)}, H
    near, Hn = grid(50.0, 2400.0); far, Hf = grid(250.0, 9500.0)
    # ---------- палитра ----------
    samp = []
    for k in range(0, n, 6):
        for off in (70, 150, 260, 380):
            for sd in (1, -1):
                samp.append(pr.ll(X[k] + N[k][0] * off * sd, Z[k] + N[k][1] * off * sd))
    try: pal, nt = s2_palette(la0, la1, lo0, lo1, samp)
    except Exception as e: pal, nt = None, 0; LOG('  palette fail', repr(e)[:200])
    LOG('  palette', pal)
    # ---------- карта для заставки ----------
    def lls(P, eps):
        Q = dp_simplify(P, eps); return [[round(a, 5), round(b, 5)] for a, b in (pr.ll(x, z) for x, z in Q)]
    bx0, bx1, bz0, bz1 = float(X.min()) - 1800, float(X.max()) + 1800, float(Z.min()) - 1800, float(Z.max()) + 1800
    inb = lambda P: any(bx0 <= x <= bx1 and bz0 <= z <= bz1 for x, z in P)
    mp = {'route': lls(list(zip(X, Z)), 12), 'bbox': [list(map(lambda v: round(v, 5), pr.ll(bx0, bz0))), list(map(lambda v: round(v, 5), pr.ll(bx1, bz1)))],
          'rivers': [{'n': name_of(t), 'p': lls(L, 25)} for t, L in rivers if len(L) > 1 and inb(L) and t.get('waterway') in ('river', 'canal')][:30],
          'rails': [lls(L, 30) for t, L in rails if len(L) > 1 and inb(L) and t.get('railway') == 'rail'][:30],
          'coast': [lls(L, 30) for t, L in coast if len(L) > 1 and inb(L)][:20],
          'towns': sorted([{'n': p['name'], 'll': [round(v, 5) for v in pr.ll(p['x'], p['z'])], 'pop': p['pop'], 'pl': p['pl']} for p in places if bx0 <= p['x'] <= bx1 and bz0 <= p['z'] <= bz1 and p['pl'] != 'hamlet'], key=lambda q: -q['pop'])[:24]}
    # ---------- приметы для заставки ----------
    notes = []
    for e in segs:
        if e[0] == TY['town'] and len(e) > 3: notes.append({'i': e[1], 't': 'town', 'n': e[3]})
    for b in bridges: notes.append({'i': b['i'], 't': 'bridge', 'n': b['name']})
    for x in xs: notes.append({'i': x['i'], 't': 'rail', 'n': x['name']})
    for c in coast_runs: notes.append({'i': c['i0'], 't': 'coast'})
    w = int(1000 / STEP)
    if n > w:
        rise = [(Y[k + w] - Y[k], k) for k in range(0, n - w, 10)]
        up = max(rise); dn = min(rise)
        if up[0] > 35: notes.append({'i': up[1], 't': 'climb', 'm': int(up[0])})
        if dn[0] < -35: notes.append({'i': dn[1], 't': 'descent', 'm': int(-dn[0])})
    notes.sort(key=lambda q: q['i'])
    # ---------- результат ----------
    y0 = float(Y[0])
    out = {'id': rid, 'name': R['name'], 'year': year, 'host': R['host'], 'kind': R['kind'], 'about': R.get('about', ''), 'closed': closed, 'step': STEP,
           'll0': [round(lat0, 6), round(lon0, 6)], 'y0': round(y0, 1),
           'pts': [[int(round(X[k] * 10)), int(round(Z[k] * 10)), int(round((Y[k] - y0) * 10))] for k in range(n)],
           'seg': segs, 'bridges': bridges, 'rails': xs, 'coast': coast_runs,
           'near': near, 'far': far, 'pal': pal, 'map': mp, 'notes': notes,
           'era': {'year': year, 'pop': popk, 'removed': removed, 'rails_kept': len(rails), 'rail_years': sorted({y for y in (year_of(t) for t, L in rails) if y})},
           'src': {'dem': 'Copernicus DEM GLO-30 (%d tiles)' % ntiles, 'osm': '© OpenStreetMap contributors (ODbL), Overpass API', 's2': 'Sentinel-2 cloudless 2016 by EOX IT Services GmbH (CC BY 4.0)' if pal else '',
                   'at': time.strftime('%Y-%m-%d')}}
    js = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    os.makedirs(out_dir, exist_ok=True); open(os.path.join(out_dir, rid + '.json'), 'w', encoding='utf-8').write(js)
    LOG('  ->', rid + '.json', round(len(js) / 1024), 'KB,', n, 'points,', len(segs), 'segments, bridges', [b['name'] for b in bridges], 'rails', len(xs), 'coast', len(coast_runs))
    try: preview(out_dir, rid, X, Z, S, Hn, near, bridges, xs, places, rivers, TY)
    except Exception as e: LOG('  preview fail', repr(e)[:200])

def preview(out_dir, rid, X, Z, S, Hn, near, bridges, xs, places, rivers, TY):
    from PIL import Image, ImageDraw
    nz, nx = Hn.shape; lo, hi = float(np.percentile(Hn, 1)), float(np.percentile(Hn, 99)) + 1e-3
    g = np.clip((Hn - lo) / (hi - lo) * 200 + 40, 0, 255).astype(np.uint8)[::-1]
    im = Image.fromarray(g).convert('RGB'); sc = max(1, int(900 / max(nx, nz))); im = im.resize((nx * sc, nz * sc)); d = ImageDraw.Draw(im)
    x0, z0, S0 = near['x0'], near['z0'], near['S']
    P = lambda x, z: ((x - x0) / S0 * sc, (nz - 1 - (z - z0) / S0) * sc)
    for t, L in rivers:
        if len(L) > 1: d.line([P(*p) for p in L], fill=(60, 110, 200), width=2)
    col = {0: (220, 200, 90), 1: (220, 60, 60), 2: (240, 140, 90), 3: (30, 120, 40), 4: (120, 200, 120), 5: (60, 160, 255), 6: (255, 255, 255), 7: (200, 90, 200), 8: (40, 220, 220), 9: (150, 60, 160)}
    for k in range(len(X) - 1): d.line([P(X[k], Z[k]), P(X[k + 1], Z[k + 1])], fill=col.get(S[k], (255, 255, 0)), width=4)
    for p in places:
        q = P(p['x'], p['z']); d.ellipse([q[0] - 3, q[1] - 3, q[0] + 3, q[1] + 3], outline=(255, 255, 255)); d.text((q[0] + 4, q[1] - 6), (p['name0'] or '')[:18], fill=(255, 255, 255))
    im.save(os.path.join(out_dir, rid + '.png'))

def run(log=print):
    global LOG; LOG = log
    cfg = json.load(open(os.path.join(TOOLS, 'terrain_races.json'), encoding='utf-8'))
    out_dir = os.path.join(MEDIA, 'terrain'); only = os.environ.get('TERRAIN_ONLY', '')
    for R in cfg['races']:
        if only and R['id'] not in only.split(','): continue
        try: build_race(R, out_dir)
        except Exception as e:
            import traceback; LOG('terrain fail', R['id'], repr(e)); LOG(traceback.format_exc()[-1500:])
        time.sleep(3)

if __name__ == '__main__':
    run()
