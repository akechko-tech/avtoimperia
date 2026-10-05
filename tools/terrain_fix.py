#!/usr/bin/env python3
"""Чистка маршрутов настоящих трасс (docs/terrain/*.js), 0.26.

Склейка путей OpenStreetMap иногда даёт «шипы»: дорога уходит в тупик или на вторую проезжую часть
и тут же возвращается назад по себе же; у замкнутого круга конец может заходить на начало зигзагом
(Монца). В игре это «невозможные повороты» — разворот на месте. Ещё бывают изломы в одной точке
(угол улицы, развилка-шпилька): машина такой излом не проходит, полотно складывается.

Что делает:
  1) шип (обе ветки идут рядом — дорога возвращается по себе) → объезд прямым куском там,
     где он сходится с дорогой плавно; у начала или конца открытого пути — обрезка;
     зигзаг у замыкания круга — тоже шип;
  2) развилка-шпилька (ветки расходятся) и любой излом острее R = 10 м → плавная дуга;
  3) равномерный шаг 8 м; все индексы точек (участки, мосты, переезды, берег, заметки, приметы)
     пересчитываются по длине пути.

Запуск:  python3 tools/terrain_fix.py            — починить все трассы
         python3 tools/terrain_fix.py --check    — только показать, что нашлось
         python3 tools/terrain_fix.py monza dieppe — выбранные
Файлы без находок не трогаются. clean_track(D) годится и для генератора трасс.
"""
import json, math, re, sys, glob, os, bisect

STEP = 8.0
TIP = 120.0        # разворот в одной точке (градусы)
TIP2 = 150.0       # разворот за две точки
RMIN = 10.0        # радиус дуги на изломе (м)
KINK = 50.0        # излом в одной точке круче этого — скругляем


def ang(ax, az, bx, bz):
    la = math.hypot(ax, az); lb = math.hypot(bx, bz)
    if la < 1e-6 or lb < 1e-6: return 0.0
    c = (ax * bx + az * bz) / (la * lb)
    return math.degrees(math.acos(max(-1.0, min(1.0, c))))


def seg_dir(Q, i, closed):
    """Направление отрезка i → i+1 (None за концами открытого пути)."""
    n = len(Q)
    if not closed and (i < 0 or i >= n - 1): return None
    a = Q[i % n]; b = Q[(i + 1) % n]
    return (b[0] - a[0], b[1] - a[1])


def turn_at(Q, i, closed):
    a = seg_dir(Q, i - 1, closed); b = seg_dir(Q, i, closed)
    if a is None or b is None: return 0.0
    return ang(a[0], a[1], b[0], b[1])


def turn2_at(Q, i, closed):
    a = seg_dir(Q, i - 1, closed); b = seg_dir(Q, i + 1, closed)
    if a is None or b is None: return 0.0
    return ang(a[0], a[1], b[0], b[1])


def is_tip(Q, i, closed):
    return turn_at(Q, i, closed) > TIP or turn2_at(Q, i, closed) > TIP2


def legs(Q, t, closed, k=4):
    """Расстояния между ветками по обе стороны от вершины t: P[t-j]—P[t+j], j = 1..k."""
    n = len(Q); out = []
    for j in range(1, k + 1):
        a = t - j; b = t + j
        if not closed and (a < 0 or b > n - 1): break
        A = Q[a % n]; B = Q[b % n]; out.append(math.hypot(A[0] - B[0], A[1] - B[1]))
    return out


def is_double(Q, i, closed):
    """Узкий разворот (за ±4 точки — больше 150°), а ветки потом ещё ~100 м идут вплотную (<10 м): дорога вернулась по соседней
    проезжей части. Настоящие серпантины так не ходят — их ветки расходятся."""
    n = len(Q)
    if not closed and (i < 12 or i > n - 13): return False
    a = seg_dir(Q, i - 5, closed); b = seg_dir(Q, i + 4, closed)
    if a is None or b is None or ang(a[0], a[1], b[0], b[1]) < 150: return False
    d = legs(Q, i, closed, 12)
    return len(d) == 12 and max(d[3:]) < 10.0


def is_spur(Q, t, closed):
    """Шип: ветки идут рядом и не расходятся (дорога возвращается по себе или по соседней проезжей части).
    У круга — любой разворот рядом со швом (конец круга заходит на начало)."""
    n = len(Q)
    if closed and min(t % n, n - t % n) < 25: return True
    d = legs(Q, t, closed)
    if not d: return True
    return max(d) < 13.0 and (max(d) - min(d)) < 3.5


def bypass(Q, closed, t):
    """Объезд шипа у точки t: пара (a, b), отрезок a→b сходится с дорогой плавно; меньше выброшенных точек и мягче стыки."""
    n = len(Q); W = max(4, min(300, n // 3))
    for lim in (25, 45, 70, 100):
        best = None
        for ao in range(1, W + 1):
            a = t - ao
            if not closed and a < 0: break
            A = Q[a % n]; din = seg_dir(Q, a - 1, closed)
            for bo in range(1, W + 1):
                b = t + bo
                if not closed and b > n - 1: break
                if closed and b - a >= n - 3: break
                B = Q[b % n]; cx = B[0] - A[0]; cz = B[1] - A[1]; L = math.hypot(cx, cz)
                if L < 3.0 or L > 60.0: continue   # объезд — короткий: шип отходит от дороги в одной развилке
                dout = seg_dir(Q, b, closed)
                tin = ang(din[0], din[1], cx, cz) if din else 0.0
                tout = ang(cx, cz, dout[0], dout[1]) if dout else 0.0
                tm = max(tin, tout)
                if tm > lim: continue
                score = (b - a - 1) + tm * 0.5
                if best is None or score < best[0]: best = (score, a, b, tm, L)
        if best: return best
    return None


def splice(Q, closed, a, b, ins):
    """Заменить точки строго между a и b (индексы могут выходить за круг) на ins."""
    n = len(Q)
    if not closed or (0 <= a and b < n): return Q[:a + 1] + ins + Q[b:]
    a %= n; b %= n
    if b <= a: return Q[b:a + 1] + ins       # через шов: круг начинается с точки b
    return Q[:a + 1] + ins + Q[b:]


def walk(Q, i, dist, sgn, closed):
    """Пройти от вершины i по пути на dist метров (sgn = −1 назад, +1 вперёд).
    → (точка, индекс первой вершины за ней, единичное направление движения) или None, если путь кончился."""
    n = len(Q); acc = 0.0; k = i
    for _ in range(n // 2):
        k2 = k + sgn
        if not closed and (k2 < 0 or k2 > n - 1): return None
        A = Q[k % n]; B = Q[k2 % n]; dx = B[0] - A[0]; dz = B[1] - A[1]; L = math.hypot(dx, dz)
        if L > 1e-6 and acc + L >= dist:
            t = (dist - acc) / L
            return ([A[0] + dx * t, A[1] + dz * t, A[2] + (B[2] - A[2]) * t, None], k2, (dx / L, dz / L))
        acc += L; k = k2
    return None


def curve(Q, closed, i, d_back, d_fwd):
    """Плавная дуга вместо вершины i: от точки за d_back до точки через d_fwd (квадратичная кривая с вершиной i в роли полюса)."""
    n = len(Q); wb = walk(Q, i, d_back, -1, closed); wf = walk(Q, i, d_fwd, +1, closed)
    if not wb or not wf: return None
    Pb, kb, _ = wb; Pf, kf, _ = wf; V = Q[i % n]
    Lc = (math.hypot(V[0] - Pb[0], V[1] - Pb[1]) + math.hypot(Pf[0] - V[0], Pf[1] - V[1])) * 0.85
    m = max(3, int(Lc / 2.5))
    pts = []
    for s in range(m + 1):
        t = s / m; a = (1 - t) ** 2; b = 2 * (1 - t) * t; c = t * t
        pts.append([a * Pb[0] + b * V[0] + c * Pf[0], a * Pb[1] + b * V[1] + c * Pf[1], Pb[2] + (Pf[2] - Pb[2]) * t, None])
    # kb — первая сохранённая вершина сзади (индекс ≤ i−1), kf — спереди (≥ i+1)
    return splice(Q, closed, kb if kb <= i else kb - n, kf if kf >= i else kf + n, pts)


def semicircle(Q, closed, a, b, apex):
    """Разворот: полуокружность между вершинами a и b (они остаются), выгнутая к вершине шпильки."""
    n = len(Q); A = Q[a % n]; B = Q[b % n]; V = Q[apex % n]
    mx = (A[0] + B[0]) / 2; mz = (A[1] + B[1]) / 2; r = math.hypot(A[0] - B[0], A[1] - B[1]) / 2
    if r < 2: return None
    e1 = ((A[0] - mx) / r, (A[1] - mz) / r); vx = V[0] - mx; vz = V[1] - mz; p = vx * e1[0] + vz * e1[1]
    ex = vx - p * e1[0]; ez = vz - p * e1[1]; le = math.hypot(ex, ez)
    e2 = (ex / le, ez / le) if le > 1e-3 else (-e1[1], e1[0])
    m = max(4, int(math.pi * r / 2.5)); pts = []
    for k in range(1, m):
        f = math.pi * k / m
        pts.append([mx + r * (math.cos(f) * e1[0] + math.sin(f) * e2[0]), mz + r * (math.cos(f) * e1[1] + math.sin(f) * e2[1]), A[2] + (B[2] - A[2]) * k / m, None])
    return splice(Q, closed, a, b, pts)


def round_kink(Q, closed, i, log, tag):
    """Излом в вершине i → плавная кривая радиусом около RMIN; разворот (шпилька) → полуокружность там, где ветки разошлись на 2R."""
    th = turn_at(Q, i, closed); n = len(Q)
    if th > 100:
        best = None
        for j in range(1, min(300, n // 3)):
            dl = legs(Q, i, closed, j)
            if len(dl) < j: break
            best = j
            if dl[-1] >= 2 * RMIN: break
        if best:
            R = semicircle(Q, closed, i - best, i + best, i)
            if R is not None:
                if tag: log.append('  %s at %s: U-turn over ±%d pts (turn %.0f°)' % (tag, Q[i % n][3], best, th))
                return R
    d = min(60.0, 1.45 * RMIN * math.tan(math.radians(min(th, 100.0)) / 2))
    for scale in (1.0, 0.6, 0.35, 0.2):
        R = curve(Q, closed, i, d * scale, d * scale)
        if R is not None:
            if tag: log.append('  %s at %s: arc %.0f m (turn %.0f°)' % (tag, Q[i % n][3], d * scale, th))
            return R
    return None


def clean_points(Q, closed, log):
    """Q: [x, z, y, id] — id = номер исходной точки или None для вставленных."""
    for _ in range(400):
        n = len(Q); t = next((i for i in range(n) if is_tip(Q, i, closed)), None)
        if t is None: break
        # вершина разворота — точка с наибольшим поворотом рядом
        t = max(range(t - 1, t + 3), key=lambda k: turn_at(Q, k, closed) if (closed or 0 < k < n - 1) else -1)
        if not closed and t < 25 and is_spur(Q, t, closed):
            log.append('  spur at start %s: trim %d pts' % (Q[t][3], t)); Q = Q[t:]; continue
        if not closed and t > n - 26 and is_spur(Q, t, closed):
            log.append('  spur at end %s: trim %d pts' % (Q[t][3], n - 1 - t)); Q = Q[:t + 1]; continue
        if is_spur(Q, t, closed):
            bp = bypass(Q, closed, t)
            if bp:
                _, a, b, tm, L = bp; A = Q[a % n]; B = Q[b % n]; m = max(0, int(round(L / STEP)) - 1)
                ins = [[A[0] + (B[0] - A[0]) * k / (m + 1), A[1] + (B[1] - A[1]) * k / (m + 1), A[2] + (B[2] - A[2]) * k / (m + 1), None] for k in range(1, m + 1)]
                log.append('  spur at %s: bypass %s→%s, removed %d pts, join %.0f°, %d m' % (Q[t % n][3], A[3], B[3], b - a - 1, tm, L))
                Q = splice(Q, closed, a, b, ins); continue
        R = round_kink(Q, closed, t, log, 'hairpin')
        if R is None:
            log.append('  tip %s: drop point' % Q[t % n][3]); del Q[t % n]; continue
        Q = R
    # двойная дорога после разворота: объезд в развилке (или разворот там, где ветки разошлись)
    for _ in range(100):
        n = len(Q); t = next((i for i in range(n) if is_double(Q, i, closed)), None)
        if t is None: break
        bp = bypass(Q, closed, t)
        if bp:
            _, a, b, tm, L = bp; A = Q[a % n]; B = Q[b % n]; m = max(0, int(round(L / STEP)) - 1)
            ins = [[A[0] + (B[0] - A[0]) * k / (m + 1), A[1] + (B[1] - A[1]) * k / (m + 1), A[2] + (B[2] - A[2]) * k / (m + 1), None] for k in range(1, m + 1)]
            log.append('  double road at %s: bypass %s→%s, removed %d pts, join %.0f°, %d m' % (Q[t % n][3], A[3], B[3], b - a - 1, tm, L))
            Q = splice(Q, closed, a, b, ins); continue
        best = None
        for j in range(4, min(300, n // 3)):
            dl = legs(Q, t, closed, j)
            if len(dl) < j: break
            best = j
            if dl[-1] >= 2 * RMIN: break
        R = semicircle(Q, closed, t - best, t + best, t) if best else None
        if R is None: log.append('  double road at %s: left as is' % Q[t % n][3]); break
        log.append('  double road at %s: U-turn over ±%d pts' % (Q[t % n][3], best)); Q = R
    # острые изломы в одной точке (угол улицы, развилка) — дугой; шпильки из нескольких точек — как есть (настоящие)
    lone = lambda k: turn_at(Q, k, closed) > KINK and turn_at(Q, k - 1, closed) < 20 and turn_at(Q, k + 1, closed) < 20
    for _ in range(3000):
        n = len(Q); i = next((k for k in range(n) if lone(k)), None)
        if i is None: break
        R = round_kink(Q, closed, i, log, None)
        if R is None: break
        Q = R
    return Q


def soften(Q, closed, log, max_turn=60.0):
    """После выравнивания шага: где дорога ломается в точке круче max_turn (полотно складывается) — точку и соседей чуть к середине соседей."""
    cnt = 0
    for _ in range(60):
        n = len(Q); bad = [i for i in range(n) if turn_at(Q, i, closed) > max_turn]
        if not bad: break
        cnt += 1; touched = set()
        for i in bad:
            for j in range(i - 2, i + 3):
                if not closed and (j <= 0 or j >= n - 1): continue
                touched.add(j % n)
        new = {}
        for j in touched:
            a = Q[(j - 1) % n]; c = Q[(j + 1) % n]; b = Q[j]
            new[j] = (b[0] + 0.5 * ((a[0] + c[0]) / 2 - b[0]), b[1] + 0.5 * ((a[1] + c[1]) / 2 - b[1]))
        for j, (x, z) in new.items(): Q[j][0] = x; Q[j][1] = z
    if cnt: log.append('  soften: %d passes' % cnt)
    return Q


def resample(Q, closed):
    P = Q + [Q[0]] if closed else Q
    cum = [0.0]
    for k in range(1, len(P)): cum.append(cum[-1] + math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]))
    L = cum[-1]
    if closed: m = max(3, int(round(L / STEP))); st = L / m
    else:
        m = int(L / STEP) + 1; st = STEP
        if L - (m - 1) * st > STEP * 0.5: m += 1
    out = []; j = 0
    for k in range(m):
        d = min(L, k * st)
        while j < len(P) - 2 and cum[j + 1] < d: j += 1
        s = cum[j + 1] - cum[j] or 1.0; t = (d - cum[j]) / s; a = P[j]; b = P[j + 1]
        out.append([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t])
    pos = {}
    for k in range(len(Q)):
        if Q[k][3] is not None: pos[Q[k][3]] = cum[k] / st
    return out, pos, st


def make_map(n_old, pos, m, closed):
    """Старый номер точки → новый (выброшенные — между соседними сохранёнными)."""
    kept = sorted(pos.keys()); f = [0.0] * n_old
    if not kept: return [0] * n_old
    for i in range(n_old):
        if i in pos: f[i] = pos[i]; continue
        k = bisect.bisect_left(kept, i)
        if closed:
            p = kept[k - 1] if k > 0 else kept[-1]; q = kept[k] if k < len(kept) else kept[0]
            di = (i - p) % n_old; dq = (q - p) % n_old or 1
            fp = pos[p]; fq = pos[q]
            if fq < fp: fq += m
            f[i] = (fp + (fq - fp) * di / dq) % m
        else:
            if k == 0: f[i] = pos[kept[0]]
            elif k >= len(kept): f[i] = pos[kept[-1]]
            else:
                p = kept[k - 1]; q = kept[k]; f[i] = pos[p] + (pos[q] - pos[p]) * (i - p) / (q - p)
    return [int(round(v)) % m if closed else max(0, min(m - 1, int(round(v)))) for v in f]


def remap_fields(D, mp, m, closed, n_old):
    cl = lambda k: mp[max(0, min(n_old - 1, k))]
    # участки: метки по точкам → заново в диапазоны
    if D.get('seg'):
        lab = [None] * n_old
        for s in D['seg']:
            for i in range(max(0, s[1]), min(n_old - 1, s[2]) + 1): lab[i] = (s[0], s[3] if len(s) > 3 else None)
        new = [None] * m
        for i in range(n_old):
            if lab[i] is not None: new[mp[i]] = lab[i]
        last = next((x for x in new if x is not None), (0, None))
        for k in range(m):
            if new[k] is None: new[k] = last
            else: last = new[k]
        segs = []; a = 0
        for k in range(1, m + 1):
            if k == m or new[k] != new[a]:
                t, nm = new[a]; segs.append([t, a, k - 1] + ([nm] if nm else [])); a = k
        D['seg'] = segs
    for key in ('notes', 'rails', 'lm'):
        for o in D.get(key) or []:
            if isinstance(o, dict) and isinstance(o.get('i'), int): o['i'] = cl(o['i'])
    br = []
    for b in D.get('bridges') or []:
        i, i0, i1 = cl(b['i']), cl(b['i0']), cl(b['i1'])
        if not closed and not (i0 <= i <= i1): i0, i1 = min(i0, i, i1), max(i0, i, i1)
        b.update(i=i, i0=i0, i1=i1); br.append(b)
    if 'bridges' in D: D['bridges'] = br
    cs = []
    for c in D.get('coast') or []:
        i0, i1 = cl(c['i0']), cl(c['i1'])
        if closed and i1 < i0:
            cs.append(dict(c, i0=i0, i1=m - 1)); cs.append(dict(c, i0=0, i1=i1))
        else: cs.append(dict(c, i0=min(i0, i1), i1=max(i0, i1)))
    if 'coast' in D: D['coast'] = cs


def problems(D):
    P = D['pts']; closed = bool(D.get('closed'))
    Q = [[p[0] / 10, p[1] / 10, p[2] / 10, i] for i, p in enumerate(P)]
    n = len(Q)
    tips = [i for i in range(n) if is_tip(Q, i, closed) or is_double(Q, i, closed)]
    sharp = [i for i in range(n) if (turn_at(Q, i, closed) > KINK and turn_at(Q, i - 1, closed) < 20 and turn_at(Q, i + 1, closed) < 20) or turn_at(Q, i, closed) > 60]
    return tips, sharp


def clean_track(D, log=None):
    """Чистит D на месте. True — если что-то поменялось."""
    log = log if log is not None else []
    tips, sharp = problems(D)
    if not tips and not sharp: return False
    P = D['pts']; closed = bool(D.get('closed')); n_old = len(P)
    Q = [[p[0] / 10, p[1] / 10, p[2] / 10, i] for i, p in enumerate(P)]
    Q = clean_points(Q, closed, log)
    out, pos, st = resample(Q, closed)
    mp = make_map(n_old, pos, len(out), closed)
    # смягчить переломы и снова выровнять шаг (номера точек пересчитываются по цепочке)
    for _ in range(3):
        S = soften([p[:3] + [k] for k, p in enumerate(out)], closed, log)
        out2, pos2, st = resample(S, closed)
        mp2 = make_map(len(S), pos2, len(out2), closed)
        mp = [mp2[k] for k in mp]; out = out2
    out = soften([p[:3] + [None] for p in out], closed, log)
    m = len(out)
    D['pts'] = [[int(round(p[0] * 10)), int(round(p[1] * 10)), int(round(p[2] * 10))] for p in out]
    remap_fields(D, mp, m, closed, n_old)
    log.append('  points %d → %d (step %.3f m), tips %d, sharp %d' % (n_old, m, st, len(tips), len(sharp)))
    return True


def load(f):
    s = open(f, encoding='utf-8').read()
    m = re.search(r'^(.*?\]=)(\{.*\})(;?\s*)$', s, re.S)
    return m.group(1), json.loads(m.group(2)), m.group(3)


def save(f, head, D, tail):
    open(f, 'w', encoding='utf-8').write(head + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + tail)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; check = '--check' in sys.argv
    root = os.environ.get('TERRAIN_DIR') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'terrain')
    files = sorted(glob.glob(os.path.join(root, '*.js')))
    if args: files = [f for f in files if os.path.basename(f)[:-3] in args]
    changed = 0
    for f in files:
        head, D, tail = load(f)
        tips, sharp = problems(D)
        if not tips and not sharp: continue
        print(os.path.basename(f)[:-3], 'closed' if D.get('closed') else 'open', len(D['pts']), 'tips', tips[:10], 'sharp', len(sharp))
        if check: continue
        log = []; clean_track(D, log); print('\n'.join(log))
        t2, s2 = problems(D)
        if t2 or s2: print('  !! left: tips', t2[:6], 'sharp', s2[:6])
        save(f, head, D, tail); changed += 1
    print('changed', changed)


if __name__ == '__main__':
    main()
