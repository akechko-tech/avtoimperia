"""Свои мелодии «Автоимперии» в оркестровке (0.22) — задание anthem в media CI.
Марш «Автоимперия» — для военного духового оркестра (корнеты, кларнеты, флейты и пикколо, валторны, тромбоны,
эуфониум, туба, малый и большой барабаны, тарелки, колокольчики): вступление, первая часть дважды, трио,
«перепалка» медных, торжественное трио и финальный удар — как у марша Сузы. Регтайм — для оркестра регтайма
(фортепиано «страйд», банджо, кларнет, корнет с сурдиной, тромбон, туба, ударные), вальс — для салонного оркестра
(струнные, флейта, кларнет, валторны, арфа, треугольник), танго — для оркестра с бандонеоном.
Ноты и аккорды — из игры (own_tunes.json, тот же текст, что в 50-audio.js). Партитура — MIDI из многих дорожек,
звук — FluidSynth с тембрами MuseScore General (MIT; без сети — FluidR3_GM), с реверберацией зала; громкость выравнена
по EBU R128, сжатие — AAC. Результат: media/music/own/<id>.m4a и index.json."""
import json, os, math, random, subprocess, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
CH = {'M': [0, 4, 7], 'D': [0, 4, 7, 10], 'm': [0, 3, 7], 'm7': [0, 3, 7, 10], 'M6': [0, 4, 7, 9]}
LOG = print

def midi_of(tok):
    n = NOTE[tok[0]]; i = 1
    if tok[i:i + 1] == '#': n += 1; i += 1
    elif tok[i:i + 1] == 'b': n -= 1; i += 1
    return n + (int(tok[i:]) + 1) * 12

def chord_of(tok):
    pc = NOTE[tok[0]]; i = 1
    if tok[i:i + 1] == '#': pc += 1; i += 1
    elif tok[i:i + 1] == 'b': pc -= 1; i += 1
    q = {'': 'M', 'm': 'm', '7': 'D', 'm7': 'm7', '6': 'M6'}.get(tok[i:], 'M')
    return pc % 12, q

def tones(ch, lo, hi):
    pc, q = ch; return [n for n in range(lo, hi + 1) if (n - pc) % 12 in CH[q]]

def nearest(prev, cands):
    return min(cands, key=lambda n: (abs(n - prev), n)) if cands else prev

def vlq(n):
    b = [n & 0x7F]; n >>= 7
    while n: b.append(0x80 | (n & 0x7F)); n >>= 7
    return bytes(reversed(b))

class Score:
    """Партитура: время — в долях (четвертях), дорожка на канал; humanize — живое исполнение (разброс силы и времени)."""
    def __init__(s, bpm, seed=1, tpq=480):
        s.tpq = tpq; s.bpm = bpm; s.ev = {}; s.meta = []; s.rnd = random.Random(seed); s.tempo = [(0, bpm)]
    def setup(s, ch, prog, vol=100, pan=64, rev=50, cho=10):
        e = s.ev.setdefault(ch, [])
        e += [(0, 0, bytes([0xB0 | ch, 0, 0])), (0, 0, bytes([0xB0 | ch, 32, 0])), (0, 1, bytes([0xC0 | ch, prog])), (0, 2, bytes([0xB0 | ch, 7, vol])),
              (0, 2, bytes([0xB0 | ch, 10, pan])), (0, 2, bytes([0xB0 | ch, 91, rev])), (0, 2, bytes([0xB0 | ch, 93, cho])), (0, 2, bytes([0xB0 | ch, 64, 0]))]
    def tempo_at(s, beat, bpm): s.tempo.append((beat, bpm))
    def note(s, ch, beat, dur, pitch, vel, hum=True):
        if pitch < 12 or pitch > 115 or dur <= 0: return
        j = s.rnd.gauss(0, 0.006) if hum else 0.0
        v = int(max(8, min(127, vel + (s.rnd.gauss(0, 4) if hum else 0))))
        t0 = max(0.0, beat + j); t1 = t0 + max(0.03, dur)
        e = s.ev.setdefault(ch, []); e.append((t0, 4, bytes([0x90 | ch, pitch, v]))); e.append((t1, 3, bytes([0x80 | ch, pitch, 0])))
    def cc(s, ch, beat, num, val): s.ev.setdefault(ch, []).append((beat, 2, bytes([0xB0 | ch, num, max(0, min(127, int(val)))])))
    def write(s, path):
        tpq = s.tpq
        def trk(events):
            out = bytearray(); last = 0
            for t, _, msg in sorted(events, key=lambda e: (e[0], e[1])):
                tick = int(round(t * tpq)); out += vlq(max(0, tick - last)) + msg; last = tick
            out += vlq(0) + bytes([0xFF, 0x2F, 0x00]); return bytes(out)
        t0 = [(b, 0, bytes([0xFF, 0x51, 0x03]) + int(60e6 / bpm).to_bytes(3, 'big')) for b, bpm in s.tempo]
        t0.append((s.length() + 6, 1, bytes([0xFF, 0x01, 0x03]) + b'end'))  # хвост реверберации зала
        tracks = [trk(t0)] + [trk(e) for ch, e in sorted(s.ev.items())]
        data = b'MThd' + (6).to_bytes(4, 'big') + (1).to_bytes(2, 'big') + len(tracks).to_bytes(2, 'big') + tpq.to_bytes(2, 'big')
        for t in tracks: data += b'MTrk' + len(t).to_bytes(4, 'big') + t
        open(path, 'wb').write(data)
    def length(s):
        return max(t for e in s.ev.values() for t, _, _ in e)

def parse(T):
    toks = T['mel'].replace('|', ' ').split(); div, beats = T['div'], T['beats']; sub = 1.0 / div
    mel = []; i = 0
    while i < len(toks):
        t = toks[i]
        if t not in ('-', '.'):
            d = 1
            while i + d < len(toks) and toks[i + d] == '-': d += 1
            mel.append((i * sub, d * sub, midi_of(t)))
        i += 1
    bars = len(toks) // (div * beats)
    chords = [chord_of(c) for c in T['ch'].split()]
    return mel, chords, bars, beats

def shift(mel, at, tr=0): return [(b + at, d, p + tr) for b, d, p in mel]

def tr_ch(ch, k): return ((ch[0] + k) % 12, ch[1])

# ---------- марш: военный духовой оркестр ----------
def march(T, seed=7):
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats
    PIC, FL, CL1, CL2, CRN, HRN, TBN, EUP, TUBA, DR, GLK = 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    S.setup(PIC, 72, 88, 52, 45); S.setup(FL, 73, 92, 50, 48); S.setup(CL1, 71, 104, 44, 50); S.setup(CL2, 71, 92, 40, 50)
    S.setup(CRN, 56, 108, 70, 44, 6); S.setup(HRN, 60, 96, 86, 58); S.setup(TBN, 57, 102, 84, 52); S.setup(EUP, 58, 96, 74, 50)
    S.setup(TUBA, 58, 112, 64, 40); S.setup(DR, 0, 112, 64, 42, 0); S.setup(GLK, 9, 72, 58, 55)
    def harm_below(p, ch):
        c = [n for n in tones(ch, p - 9, p - 3)]; return max(c) if c else p - 4
    def drums(b0, nb, lvl, cym=True, snare=True, rolls=(7, 15)):
        for k in range(nb):
            t = b0 + k * B
            S.note(DR, t, 0.4, 36, 70 * lvl); S.note(DR, t + 2, 0.4, 36, 62 * lvl)
            if cym: S.note(DR, t, 0.6, 49, 34 * lvl); S.note(DR, t + 2, 0.6, 49, 30 * lvl)
            if snare:
                S.note(DR, t + 1, 0.2, 38, 66 * lvl); S.note(DR, t + 3, 0.2, 38, 64 * lvl)
                for e in (0.5, 1.5, 2.5, 3.5): S.note(DR, t + e, 0.1, 38, 34 * lvl)
            if k in rolls:  # дробь на последней доле фразы
                for r in range(8): S.note(DR, t + 3 + r / 8, 0.08, 38, (36 + r * 5) * lvl)
    def bass_and_afterbeats(b0, chs, lvl, horns=True, walk=False):
        prev = 48
        for k, ch in enumerate(chs):
            t = b0 + k * B; root = nearest(40, [n for n in range(33, 46) if (n - ch[0]) % 12 == 0]); fifth = root + 7 if root + 7 <= 47 else root - 5
            S.note(TUBA, t, 0.85, root, 84 * lvl); S.note(TUBA, t + 2, 0.85, fifth, 76 * lvl)
            if walk and k + 1 < len(chs):  # проходящие к следующему аккорду
                nr = nearest(root, [n for n in range(31, 48) if (n - chs[k + 1][0]) % 12 == 0]); st = 1 if nr > fifth else -1
                S.note(TUBA, t + 3, 0.45, fifth + st * (2 if abs(nr - fifth) > 2 else 1), 70 * lvl); S.note(TUBA, t + 3.5, 0.45, nr - st, 66 * lvl)
            if horns:
                v = sorted(set(nearest(p, tones(ch, 55, 76)) for p in (60, 64, 67)))
                for a in (1, 3):
                    for p in v: S.note(HRN, t + a, 0.42, p, 56 * lvl)
            pads = sorted(set(nearest(p, tones(ch, 46, 62)) for p in (50, 55)))
            for p in pads: S.note(TBN, t, 1.8, p, 44 * lvl); S.note(TBN, t + 2, 1.8, p, 40 * lvl)
    def counter(b0, chs, lvl, ch_=EUP, lo=50, hi=64):
        prev = 55
        for k, ch in enumerate(chs):
            t = b0 + k * B; c = tones(ch, lo, hi); a = nearest(prev, c); S.note(ch_, t, 1.9, a, 72 * lvl)
            nxt = tones(chs[k + 1], lo, hi) if k + 1 < len(chs) else c
            b = nearest(a + (2 if (k % 2 == 0) else -2), c); S.note(ch_, t + 2, 0.95, b, 68 * lvl)
            g = nearest(b, nxt); pas = b + (1 if g > b else -1) * (1 if abs(g - b) <= 2 else 2)
            S.note(ch_, t + 3, 0.95, pas if lo <= pas <= hi else b, 64 * lvl); prev = g
    def melody(b0, M, chs, insts, tr=0):
        for b, d, p in M:
            bar = int(b // B); ch = chs[min(bar, len(chs) - 1)]
            for inst, dv, vel, mode in insts:
                q = p + tr + dv
                if mode == 'harm': q = harm_below(p + tr, ch) + dv
                if inst == PIC and q > 98: q -= 12
                S.note(inst, b0 + b, d * 0.92, q, vel)
    t = 0.0
    # вступление: фанфара медных, удар по доминанте, дробь и спуск басов
    for (b, d, p) in [(0, 1, 55), (1, 0.5, 55), (1.5, 0.5, 55), (2, 1, 60), (3, 1, 64), (4, 3, 67), (7, 1, 67)]:
        S.note(CRN, t + b, d * 0.9, p + 12, 100); S.note(TBN, t + b, d * 0.9, p - 12, 92); S.note(CL1, t + b, d * 0.9, p + 12, 84)
    for b in (8, 10):
        for p in (43, 55, 59, 62, 65, 67, 71, 74, 77): S.note(TBN if p < 60 else (HRN if p < 70 else CRN), t + b, 1.2, p, 96)
        S.note(TUBA, t + b, 1.2, 31, 100); S.note(DR, t + b, 0.5, 36, 100); S.note(DR, t + b, 1.0, 49, 96)
    for r in range(16): S.note(DR, t + 12 + r / 4, 0.12, 38, 40 + r * 4)
    for k, p in enumerate((43, 41, 40, 38)): S.note(TUBA, t + 12 + k, 0.9, p, 90); S.note(TBN, t + 12 + k, 0.9, p + 12, 80)
    t += 4 * B
    # первая часть
    A = chords[:bars]
    melody(t, mel, A, [(CRN, 0, 90, ''), (CL1, 0, 78, ''), (CL2, 0, 66, 'harm')])
    bass_and_afterbeats(t, A, 1.0); drums(t, bars, 1.0); S.note(DR, t, 1, 57, 92); S.note(DR, t + 8 * B, 1, 57, 74)
    t += bars * B
    # повтор: флейты и пикколо, эуфониум ведёт контрмелодию
    melody(t, mel, A, [(CRN, 0, 96, ''), (CL1, 0, 82, ''), (CL2, 0, 70, 'harm'), (FL, 12, 74, ''), (PIC, 24, 64, '')])
    bass_and_afterbeats(t, A, 1.08, walk=True); counter(t, A, 1.0); drums(t, bars, 1.12); S.note(DR, t, 1, 57, 100); S.note(DR, t + 8 * B, 1, 57, 86)
    t += bars * B
    # трио в субдоминанте (фа мажор): тихо, мелодия у кларнетов и эуфониума
    F = [tr_ch(c, 5) for c in A]
    melody(t, mel, F, [(CL1, -7, 80, ''), (EUP, -19, 66, ''), (CL2, -7, 60, 'harm')])
    for k, ch in enumerate(F):
        tt = t + k * B; root = nearest(41, [n for n in range(33, 46) if (n - ch[0]) % 12 == 0])
        S.note(TUBA, tt, 0.8, root, 62); S.note(TUBA, tt + 2, 0.8, root + 7 if root + 7 <= 47 else root - 5, 56)
        for p in sorted(set(nearest(q, tones(ch, 55, 74)) for q in (60, 65, 69))):
            S.note(HRN, tt + 1, 0.4, p, 42); S.note(HRN, tt + 3, 0.4, p, 40)
        S.note(DR, tt, 0.3, 36, 44); S.note(DR, tt + 1, 0.1, 37, 34); S.note(DR, tt + 3, 0.1, 37, 32)
    t += bars * B
    # «перепалка»: хроматический спуск медных и ответ деревянных, тутти на доминанте фа мажора
    for k in range(8):
        for inst, o, v in ((TBN, 0, 100), (EUP, 0, 92), (TUBA, -12, 100)): S.note(inst, t + k * 0.5, 0.45, 60 - k + o, v)
    S.note(DR, t, 0.5, 36, 104); S.note(DR, t, 1.2, 57, 104)
    for k in range(8):
        p = [72, 75, 78, 81][k % 4]
        for inst, o, v in ((FL, 12, 84), (CL1, 0, 80), (PIC, 24, 70)): S.note(inst, t + B + k * 0.5, 0.42, p + o if p + o <= 100 else p + o - 12, v)
    for r in range(16): S.note(DR, t + B + r / 4, 0.1, 38, 50 + r * 2)
    for k in range(8):
        for inst, o, v in ((TBN, 0, 104), (EUP, 0, 96), (TUBA, -12, 104)): S.note(inst, t + 2 * B + k * 0.5, 0.45, 58 - k + o, v)
    S.note(DR, t + 2 * B, 0.5, 36, 108); S.note(DR, t + 2 * B, 1.2, 57, 108)
    for b in (0, 1, 2):
        for p in (36, 48, 55, 58, 64, 67, 70, 76, 79, 82):
            inst = TUBA if p < 40 else TBN if p < 56 else HRN if p < 66 else CRN if p < 80 else FL
            S.note(inst, t + 3 * B + b, 0.6, p, 104)
        S.note(DR, t + 3 * B + b, 0.4, 36, 104)
    S.note(DR, t + 3 * B, 1.2, 49, 110)
    for r in range(8): S.note(DR, t + 3 * B + 3 + r / 8, 0.08, 38, 60 + r * 7)
    t += 4 * B
    # торжественное трио: мелодия у тромбонов и корнетов, пикколо пишет узоры, колокольчики
    melody(t, mel, F, [(CRN, -7, 104, ''), (TBN, -19, 104, ''), (EUP, -19, 98, ''), (CL1, 5, 88, ''), (FL, 5, 86, ''), (CL2, -7, 80, 'harm'), (GLK, 17, 52, '')])
    for k, ch in enumerate(F):
        tt = t + k * B; arp = tones(ch, 84, 98)
        if arp:
            seq = (arp + arp[::-1][1:-1]) * 4
            for e in range(8): S.note(PIC, tt + e * 0.5, 0.42, seq[e % len(seq)], 66)
    bass_and_afterbeats(t, F, 1.2, walk=True); drums(t, bars, 1.25); S.note(DR, t, 1.4, 57, 112); S.note(DR, t + 8 * B, 1.4, 57, 104)
    t += bars * B
    # финал: аккорд — пауза — тихий «бом» — громкий «БОМ»
    def tutti(at, dur, vel):
        for p in (29, 41, 48, 53, 57, 60, 65, 69, 72, 77, 81, 84):
            inst = TUBA if p < 40 else TBN if p < 54 else HRN if p < 62 else CRN if p < 74 else FL if p < 82 else PIC
            S.note(inst, at, dur, p, vel)
            if 60 <= p <= 84: S.note(CL1, at, dur, p, vel - 10)
        S.note(DR, at, 0.5, 36, vel); S.note(DR, at, 1.5, 49, vel)
    tutti(t, 1.6, 108); S.note(TUBA, t + B + 2, 0.4, 41, 64); S.note(TBN, t + B + 2, 0.4, 53, 60); tutti(t + B + 3, 0.7, 120)
    S.tempo_at(t + B, bpm * 0.97)
    return S

# ---------- регтайм: фортепиано «страйд», банджо, кларнет, корнет с сурдиной, тромбон, туба ----------
def rag(T, seed=11):
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats
    PNO, CL, CRN, TBN, BJO, TUBA, DR = 0, 1, 2, 3, 4, 5, 9
    S.setup(PNO, 0, 100, 60, 40); S.setup(CL, 71, 98, 46, 44); S.setup(CRN, 59, 100, 76, 40); S.setup(TBN, 57, 92, 86, 44)
    S.setup(BJO, 105, 84, 30, 30); S.setup(TUBA, 58, 100, 64, 36); S.setup(DR, 0, 90, 64, 40)
    def stride(b0, chs, lvl):
        for k, ch in enumerate(chs):
            t = b0 + k * B; root = nearest(43, [n for n in range(36, 48) if (n - ch[0]) % 12 == 0]); fifth = root + 7 if root + 7 <= 50 else root - 5
            v = sorted(set(nearest(q, tones(ch, 55, 70)) for q in (58, 62, 65)))
            S.note(PNO, t, 0.45, root, 74 * lvl); S.note(PNO, t, 0.45, root - 12, 60 * lvl)
            for p in v: S.note(PNO, t + 0.5, 0.35, p, 58 * lvl)
            S.note(PNO, t + 1, 0.45, fifth, 70 * lvl)
            for p in v: S.note(PNO, t + 1.5, 0.35, p, 56 * lvl)
            S.note(TUBA, t, 0.45, root - 12 if root - 12 >= 31 else root, 74 * lvl); S.note(TUBA, t + 1, 0.45, fifth - 12 if fifth - 12 >= 31 else fifth, 68 * lvl)
            for e in (0.5, 1.5):
                for p in sorted(set(nearest(q, tones(ch, 60, 76)) for q in (64, 67, 71))): S.note(BJO, t + e, 0.2, p, 54 * lvl)
            S.note(DR, t, 0.2, 36, 50 * lvl); S.note(DR, t + 0.5, 0.1, 38, 30 * lvl); S.note(DR, t + 1.5, 0.1, 38, 34 * lvl); S.note(DR, t + 1.25, 0.1, 76, 36 * lvl)
    def counter(b0, chs, lvl):
        prev = 55
        for k, ch in enumerate(chs):
            t = b0 + k * B; c = tones(ch, 48, 62); a = nearest(prev - 1, c); S.note(TBN, t, 0.9, a, 64 * lvl); b = nearest(a + 3, c); S.note(TBN, t + 1, 0.9, b, 60 * lvl); prev = b
    def melody(b0, M, insts):
        for b, d, p in M:
            for inst, dv, vel in insts: S.note(inst, b0 + b, d * 0.85, p + dv, vel)
    t = 0.0
    I = [chord_of(c) for c in ('C7', 'C7', 'F', 'C7')]
    stride(t, I, 0.9); t += 4 * B
    A = chords[:bars]
    melody(t, mel, [(CL, 0, 82), (PNO, 12, 60)]); stride(t, A, 1.0); t += bars * B
    melody(t, mel, [(CRN, 0, 86), (CL, 12, 66), (PNO, 12, 62)]); stride(t, A, 1.05); counter(t, A, 1.0); t += bars * B
    Bb = [tr_ch(c, 5) for c in A]  # вторая часть — в си-бемоль мажоре, «стоп-тайм» в каждом четвёртом такте
    melody(t, mel, [(CL, -7, 78), (PNO, 5, 58)])
    for k, ch in enumerate(Bb):
        if k % 4 == 3:
            tt = t + k * B; root = nearest(43, [n for n in range(36, 48) if (n - ch[0]) % 12 == 0])
            S.note(PNO, tt, 0.3, root, 80); S.note(TUBA, tt, 0.3, root - 12 if root - 12 >= 31 else root, 80); S.note(DR, tt, 0.2, 38, 70)
        else: stride(t + k * B, [ch], 0.95)
    t += bars * B
    melody(t, mel, [(CRN, 0, 90), (CL, 12, 72), (PNO, 12, 64)]); stride(t, A, 1.1); counter(t, A, 0.9); t += bars * B
    melody(t, mel, [(CRN, -7, 84), (PNO, 5, 60)]); stride(t, Bb, 1.0); t += bars * B
    melody(t, mel, [(CRN, 0, 94), (CL, 12, 76), (PNO, 12, 68), (TBN, -12, 72)]); stride(t, A, 1.15); t += bars * B
    for p in (41, 53, 57, 60, 65, 69, 72, 77): S.note(PNO if p > 50 else TUBA, t + 0, 0.4, p, 96); S.note(CRN, t, 0.4, 77, 90); S.note(CL, t, 0.4, 81, 84)
    S.note(DR, t, 0.3, 36, 90); S.note(DR, t, 0.6, 49, 80)
    return S

# ---------- вальс: салонный оркестр ----------
def waltz(T, seed=13):
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats
    VLN, FL, CL, HRN, HARP, VLA, VC, DR = 0, 1, 2, 3, 4, 5, 6, 9
    S.setup(VLN, 48, 108, 46, 62, 14); S.setup(FL, 73, 90, 54, 56); S.setup(CL, 71, 86, 60, 56); S.setup(HRN, 60, 84, 84, 60)
    S.setup(HARP, 46, 90, 72, 60); S.setup(VLA, 45, 92, 80, 54); S.setup(VC, 42, 100, 70, 54); S.setup(DR, 0, 70, 64, 50)
    def accomp(b0, chs, lvl):
        for k, ch in enumerate(chs):
            t = b0 + k * B; root = nearest(41, [n for n in range(36, 50) if (n - ch[0]) % 12 == 0])
            S.note(VC, t, 0.9, root, 76 * lvl); S.note(VC, t, 0.9, root - 12 if root - 12 >= 28 else root, 58 * lvl)
            v = sorted(set(nearest(q, tones(ch, 55, 72)) for q in (60, 64, 67)))
            for a in (1, 2):
                for p in v: S.note(VLA, t + a, 0.32, p, 52 * lvl)
            for p in sorted(set(nearest(q, tones(ch, 53, 70)) for q in (57, 62))): S.note(HRN, t, 2.9, p, 40 * lvl)
            arp = tones(ch, 60, 84)
            for e, p in enumerate(arp[:6]): S.note(HARP, t + e * 0.25, 0.9, p, 46 * lvl)
    def melody(b0, M, insts):
        for b, d, p in M:
            for inst, dv, vel in insts: S.note(inst, b0 + b, d * 0.95, p + dv, vel)
    t = 0.0
    I = [chord_of(c) for c in ('A7', 'A7', 'A7', 'A7')]
    accomp(t, I, 0.8); S.note(DR, t, 1, 81, 50); t += 4 * B
    A = chords[:bars]
    melody(t, mel, [(VLN, 0, 82)]); accomp(t, A, 1.0); S.note(DR, t, 1, 81, 56); t += bars * B
    melody(t, mel, [(VLN, 0, 86), (FL, 12, 70), (CL, -12, 60)]); accomp(t, A, 1.08); S.note(DR, t, 1, 81, 60); S.note(DR, t + 8 * B, 1, 81, 56); t += bars * B
    G = [tr_ch(c, 5) for c in A]
    melody(t, mel, [(CL, 5 - 12, 78), (FL, 5, 64)]); accomp(t, G, 0.9); t += bars * B
    melody(t, mel, [(VLN, 0, 88), (FL, 12, 74), (CL, -12, 62)]); accomp(t, A, 1.1); S.note(DR, t, 1, 81, 58); t += bars * B
    melody(t, mel, [(VLN, 5 - 12, 80), (CL, 5, 66)]); accomp(t, G, 0.95); t += bars * B
    melody(t, mel, [(VLN, 0, 92), (FL, 12, 78), (CL, 0, 66), (HRN, -12, 60)]); accomp(t, A, 1.15)
    for k in range(0, bars, 4): S.note(DR, t + k * B, 1, 81, 62)
    S.tempo_at(t + (bars - 3) * B, bpm * 0.94); S.tempo_at(t + (bars - 1) * B, bpm * 0.85); t += bars * B
    for p in (38, 50, 57, 62, 66, 69, 74, 78, 81):
        inst = VC if p < 52 else VLA if p < 64 else VLN; S.note(inst, t, 2.6, p, 84)
    S.note(HARP, t, 2.5, 74, 70); S.note(FL, t, 2.5, 86, 66); S.note(DR, t, 2, 81, 60)
    return S

# ---------- танго: бандонеон, скрипка, фортепиано, контрабас ----------
def tango(T, seed=17):
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats
    BAN, VLN, PNO, CB, STR = 0, 1, 2, 3, 4
    S.setup(BAN, 23, 108, 52, 40); S.setup(VLN, 40, 100, 76, 46); S.setup(PNO, 0, 92, 64, 36); S.setup(CB, 43, 104, 64, 32); S.setup(STR, 48, 70, 70, 50)
    def marcato(b0, chs, lvl, hab=True):
        for k, ch in enumerate(chs):
            t = b0 + k * B; root = nearest(40, [n for n in range(33, 46) if (n - ch[0]) % 12 == 0]); fifth = root + 7 if root + 7 <= 47 else root - 5
            if hab:  # хабанера: «та — та-та-та»
                S.note(CB, t, 0.7, root, 86 * lvl); S.note(CB, t + 0.75, 0.22, fifth, 70 * lvl); S.note(CB, t + 1, 0.45, root + 12 if root + 12 <= 52 else root, 76 * lvl); S.note(CB, t + 1.5, 0.45, fifth, 70 * lvl)
            else:
                S.note(CB, t, 0.4, root, 90 * lvl); S.note(CB, t + 1, 0.4, root, 82 * lvl)
            v = sorted(set(nearest(q, tones(ch, 55, 72)) for q in (60, 64, 67)))
            for a in ((0, 1.0), (0.75, 0.6), (1, 0.8), (1.5, 0.6)) if hab else ((0, 1.0), (0.5, 0.7), (1, 0.9), (1.5, 0.7)):
                for p in v: S.note(PNO, t + a[0], 0.2, p, 62 * lvl * a[1])
            for p in sorted(set(nearest(q, tones(ch, 52, 67)) for q in (55, 60))): S.note(STR, t, 1.9, p, 40 * lvl)
    def melody(b0, M, insts):
        for b, d, p in M:
            for inst, dv, vel in insts: S.note(inst, b0 + b, d * 0.9, p + dv, vel)
    t = 0.0
    I = [chord_of(c) for c in ('E7', 'E7', 'E7', 'E7')]
    marcato(t, I, 0.9, hab=False); t += 4 * B
    A = chords[:bars]
    melody(t, mel, [(BAN, 0, 88)]); marcato(t, A, 1.0); t += bars * B
    melody(t, mel, [(VLN, 0, 86), (BAN, -12, 72)]); marcato(t, A, 1.05); t += bars * B
    D = [tr_ch(c, 5) for c in A]
    melody(t, mel, [(VLN, 5 - 12, 80), (BAN, 5 - 12, 64)]); marcato(t, D, 0.95, hab=False); t += bars * B
    melody(t, mel, [(BAN, 0, 90), (VLN, 12, 78)]); marcato(t, A, 1.08); t += bars * B
    melody(t, mel, [(VLN, 5, 84), (BAN, 5 - 12, 66)]); marcato(t, D, 1.0); t += bars * B
    melody(t, mel, [(BAN, 0, 94), (VLN, 12, 84), (STR, -12, 60)]); marcato(t, A, 1.12); t += bars * B
    # «чан-чан»: доминанта — тоника, коротко
    for at, ch in ((t, chord_of('E7')), (t + 1, chord_of('Am'))):
        root = nearest(40, [n for n in range(33, 46) if (n - ch[0]) % 12 == 0])
        for p in [root] + sorted(set(nearest(q, tones(ch, 55, 76)) for q in (57, 60, 64, 69, 72))):
            S.note(PNO if p > 50 else CB, at, 0.25, p, 100); S.note(BAN, at, 0.25, p + 12 if p < 60 else p, 96)
    return S

STYLE = {'march': march, 'rag': rag, 'waltz': waltz, 'tango': tango}
META = {'avto': ('march', 'triumph', 'военный оркестр'), 'reel': ('rag', 'lively', 'оркестр регтайма'), 'valse': ('waltz', 'calm', 'салонный оркестр'), 'tango': ('tango', 'drama', 'оркестр танго')}
SF2_URLS = ['https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/MuseScore_General.sf2']

def sh(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if r.returncode != 0: raise RuntimeError(' '.join(cmd[:3]) + ': ' + r.stderr.decode()[-400:])
    return r.stdout.decode()

def soundfont(tmp):
    p = os.path.join(tmp, 'MuseScore_General.sf2')
    if not os.path.exists(p):
        for u in SF2_URLS:
            try:
                LOG('anthem: download', u)
                req = urllib.request.Request(u, headers={'User-Agent': 'AvtoimperiaBuild/1.0'})
                with urllib.request.urlopen(req, timeout=600) as r, open(p + '.part', 'wb') as f:
                    while True:
                        b = r.read(1 << 20)
                        if not b: break
                        f.write(b)
                os.replace(p + '.part', p); break
            except Exception as e: LOG('anthem: sf2 fail', repr(e)[:200])
    if os.path.exists(p) and os.path.getsize(p) > 50e6: return p, 'MuseScore General (S. Christian Collins, MIT)'
    return '/usr/share/sounds/sf2/FluidR3_GM.sf2', 'FluidR3_GM (Frank Wen, MIT)'

def run(media, log=print):
    global LOG; LOG = log
    tunes = json.load(open(os.path.join(HERE, 'own_tunes.json'), encoding='utf-8'))
    D = os.path.join(media, 'music', 'own'); tmp = os.path.join(os.environ.get('RUNNER_TEMP') or '/tmp', 'anthem'); os.makedirs(D, exist_ok=True); os.makedirs(tmp, exist_ok=True)  # шрифт тембров и wav — не в коммит
    sf2, sfname = soundfont(tmp); LOG('anthem: soundfont', sf2, sfname)
    idx = {}
    for tid, T in tunes.items():
        st, mood, band = META.get(tid, (T['sty'], 'lively', 'оркестр'))
        S = STYLE[st](T); mid = os.path.join(tmp, tid + '.mid'); wav = os.path.join(tmp, tid + '.wav'); out = os.path.join(D, 'own_' + tid + '.m4a')
        S.write(mid); open(os.path.join(D, 'own_' + tid + '.mid'), 'wb').write(open(mid, 'rb').read())
        sh(['fluidsynth', '-ni', '-q', '-g', '0.55', '-r', '44100', '-R', '1', '-C', '1', '-o', 'synth.reverb.room-size=0.72', '-o', 'synth.reverb.level=0.62',
            '-o', 'synth.reverb.width=0.9', '-o', 'synth.reverb.damp=0.35', '-o', 'synth.polyphony=512', '-F', wav, sf2, mid])
        # ровная громкость (как у остальных записей) и мягкая «плёнка» зала; хвост реверберации не обрезать
        sh(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'highpass=f=35,loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=out:st=%.2f:d=2.5' % max(1.0, S.length() * 60 / T['bpm'] + 1.2),
            '-c:a', 'aac', '-b:a', '112k', '-ar', '44100', out])
        dur = float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', out]).strip() or 0)
        idx['own_' + tid] = {'cap': T['name'] + ' (оркестр)', 'st': st, 'y': T['y'], 'mood': mood, 'd': round(dur, 1), 'lic': 'CC0 — сочинено для игры',
                             'page': '', 'by': 'Мелодия «Автоимперии», ' + band + ' (тембры ' + sfname.split(' (')[0] + ')'}
        LOG('anthem:', tid, st, round(dur, 1), 's', round(os.path.getsize(out) / 1024), 'KB')
    json.dump(idx, open(os.path.join(D, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    import sys
    run(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(HERE)), 'media'))
