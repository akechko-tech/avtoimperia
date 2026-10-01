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
    def seconds(s, beat):
        """Время в секундах до доли beat по карте темпа."""
        T = sorted(s.tempo); sec = 0.0
        for k, (b0, bpm) in enumerate(T):
            b1 = T[k + 1][0] if k + 1 < len(T) else 1e18
            if beat <= b0: break
            sec += (min(beat, b1) - b0) * 60.0 / bpm
        return sec

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
# 0.23: «пискляво» было от регистра: мелодия у корнетов доходила до ми третьей октавы, флейты играли октавой, пикколо — двумя выше.
# Теперь марш в фа мажоре (на кварту ниже, как пишут марши для духовых): мелодия корнетов и кларнетов — в середине,
# тенор-саксофон и эуфониум дают тёплый низ, флейты — только в повторе и тихо, пикколо — лишь узор в торжественном трио;
# верх оркестра — не выше фа третьей октавы. Литавры — во вступлении и в финале.
def fold(p, hi):
    while p > hi: p -= 12
    return p

def march(T, seed=7):
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats
    K = -7; mel = [(b, d, p + K) for b, d, p in mel]; chords = [tr_ch(c, K) for c in chords]
    PIC, FL, CL1, CL2, CRN, HRN, TBN, EUP, TUBA, DR, GLK, TSX, ASX, TIMP = 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
    S.setup(PIC, 72, 66, 52, 40); S.setup(FL, 73, 80, 50, 46); S.setup(CL1, 71, 98, 44, 48); S.setup(CL2, 71, 88, 40, 48)
    S.setup(CRN, 56, 102, 70, 42, 4); S.setup(HRN, 60, 102, 86, 56); S.setup(TBN, 57, 108, 84, 50); S.setup(EUP, 58, 100, 74, 50)
    S.setup(TUBA, 58, 118, 64, 40); S.setup(DR, 0, 100, 64, 40, 0); S.setup(GLK, 9, 50, 58, 50)
    S.setup(TSX, 66, 94, 58, 46); S.setup(ASX, 65, 82, 52, 46); S.setup(TIMP, 47, 104, 64, 52)
    CAP = {PIC: 91, FL: 88, CL1: 86, CL2: 81, CRN: 86, GLK: 96, ASX: 76, TSX: 76, HRN: 74}
    def harm_below(p, ch):
        c = [n for n in tones(ch, p - 9, p - 3)]; return max(c) if c else p - 4
    def drums(b0, nb, lvl, cym=True, snare=True, rolls=(7, 15)):
        for k in range(nb):
            t = b0 + k * B
            S.note(DR, t, 0.4, 36, 72 * lvl); S.note(DR, t + 2, 0.4, 36, 64 * lvl)
            if cym: S.note(DR, t, 0.6, 49, 24 * lvl); S.note(DR, t + 2, 0.6, 49, 20 * lvl)
            if snare:
                S.note(DR, t + 1, 0.2, 38, 60 * lvl); S.note(DR, t + 3, 0.2, 38, 58 * lvl)
                for e in (0.5, 1.5, 2.5, 3.5): S.note(DR, t + e, 0.1, 38, 28 * lvl)
            if k in rolls:  # дробь на последней доле фразы
                for r in range(8): S.note(DR, t + 3 + r / 8, 0.08, 38, (32 + r * 4) * lvl)
    def bass_and_afterbeats(b0, chs, lvl, horns=True, walk=False):
        for k, ch in enumerate(chs):
            t = b0 + k * B; root = nearest(40, [n for n in range(33, 46) if (n - ch[0]) % 12 == 0]); fifth = root + 7 if root + 7 <= 47 else root - 5
            S.note(TUBA, t, 0.85, root, 88 * lvl); S.note(TUBA, t + 2, 0.85, fifth, 80 * lvl)
            if walk and k + 1 < len(chs):  # проходящие к следующему аккорду
                nr = nearest(root, [n for n in range(31, 48) if (n - chs[k + 1][0]) % 12 == 0]); st = 1 if nr > fifth else -1
                S.note(TUBA, t + 3, 0.45, fifth + st * (2 if abs(nr - fifth) > 2 else 1), 72 * lvl); S.note(TUBA, t + 3.5, 0.45, nr - st, 68 * lvl)
            if horns:
                v = sorted(set(nearest(p, tones(ch, 53, 70)) for p in (57, 60, 64)))
                for a in (1, 3):
                    for p in v: S.note(HRN, t + a, 0.42, p, 58 * lvl)
            pads = sorted(set(nearest(p, tones(ch, 45, 60)) for p in (48, 53)))
            for p in pads: S.note(TBN, t, 1.8, p, 48 * lvl); S.note(TBN, t + 2, 1.8, p, 44 * lvl)
    def counter(b0, chs, lvl, ch_=EUP, lo=48, hi=62):
        prev = 53
        for k, ch in enumerate(chs):
            t = b0 + k * B; c = tones(ch, lo, hi); a = nearest(prev, c); S.note(ch_, t, 1.9, a, 74 * lvl)
            nxt = tones(chs[k + 1], lo, hi) if k + 1 < len(chs) else c
            b = nearest(a + (2 if (k % 2 == 0) else -2), c); S.note(ch_, t + 2, 0.95, b, 70 * lvl)
            g = nearest(b, nxt); pas = b + (1 if g > b else -1) * (1 if abs(g - b) <= 2 else 2)
            S.note(ch_, t + 3, 0.95, pas if lo <= pas <= hi else b, 66 * lvl); prev = g
    def melody(b0, M, chs, insts, tr=0):
        for b, d, p in M:
            bar = int(b // B); ch = chs[min(bar, len(chs) - 1)]
            for inst, dv, vel, mode in insts:
                q = p + tr + dv
                if mode == 'harm': q = harm_below(p + tr, ch) + dv
                if inst in CAP: q = fold(q, CAP[inst])
                S.note(inst, b0 + b, d * 0.92, q, vel)
    def timp(at, p, vel, roll=0.0):
        if roll > 0:
            n = int(roll * 8)
            for r in range(n): S.note(TIMP, at - roll + r / 8, 0.1, p, 40 + r * 40 // max(1, n))
        S.note(TIMP, at, 0.9, p, vel)
    t = 0.0
    # вступление: фанфара медных, удар по доминанте (до-септаккорд), дробь литавр и спуск басов
    for (b, d, p) in [(0, 1, 55), (1, 0.5, 55), (1.5, 0.5, 55), (2, 1, 60), (3, 1, 64), (4, 3, 67), (7, 1, 67)]:
        S.note(CRN, t + b, d * 0.9, p + K + 12, 98); S.note(TBN, t + b, d * 0.9, p + K, 90); S.note(CL1, t + b, d * 0.9, p + K + 12, 78); S.note(TSX, t + b, d * 0.9, p + K, 70)
    for b in (8, 10):
        for p in (36, 48, 55, 58, 64, 67, 70, 72):
            S.note(TUBA if p < 44 else TBN if p < 56 else HRN if p < 66 else CRN, t + b, 1.2, p, 94)
        S.note(TUBA, t + b, 1.2, 36, 100); S.note(DR, t + b, 0.5, 36, 96); S.note(DR, t + b, 1.0, 49, 70); timp(t + b, 36, 100)
    for r in range(16): S.note(TIMP, t + 12 + r / 4, 0.12, 36, 44 + r * 3)
    for k, p in enumerate((36, 34, 33, 31)): S.note(TUBA, t + 12 + k, 0.9, p, 92); S.note(TBN, t + 12 + k, 0.9, p + 12, 82)
    t += 4 * B
    # первая часть: мелодия у корнетов и кларнетов, вторые кларнеты — терцией ниже
    A = chords[:bars]
    melody(t, mel, A, [(CRN, 0, 88, ''), (CL1, 0, 74, ''), (CL2, 0, 62, 'harm')])
    bass_and_afterbeats(t, A, 1.0); drums(t, bars, 0.92); S.note(DR, t, 1, 57, 70); S.note(DR, t + 8 * B, 1, 57, 58)
    t += bars * B
    # повтор: тенор-саксофон октавой ниже, флейты — в унисон, тихо; эуфониум ведёт контрмелодию
    melody(t, mel, A, [(CRN, 0, 94, ''), (CL1, 0, 80, ''), (CL2, 0, 66, 'harm'), (TSX, -12, 72, ''), (FL, 0, 58, '')])
    bass_and_afterbeats(t, A, 1.08, walk=True); counter(t, A, 1.0); drums(t, bars, 1.05); S.note(DR, t, 1, 57, 78); S.note(DR, t + 8 * B, 1, 57, 66)
    t += bars * B
    # трио в субдоминанте (си-бемоль мажор): тихо, мелодия у кларнетов, эуфониума и альт-саксофона
    F = [tr_ch(c, 5) for c in A]
    melody(t, mel, F, [(CL1, 5, 76, ''), (EUP, -7, 66, ''), (ASX, -7, 54, ''), (CL2, 5, 56, 'harm')])
    for k, ch in enumerate(F):
        tt = t + k * B; root = nearest(41, [n for n in range(33, 46) if (n - ch[0]) % 12 == 0])
        S.note(TUBA, tt, 0.8, root, 64); S.note(TUBA, tt + 2, 0.8, root + 7 if root + 7 <= 47 else root - 5, 58)
        for p in sorted(set(nearest(q, tones(ch, 53, 70)) for q in (57, 62, 65))):
            S.note(HRN, tt + 1, 0.4, p, 44); S.note(HRN, tt + 3, 0.4, p, 42)
        S.note(DR, tt, 0.3, 36, 44); S.note(DR, tt + 1, 0.1, 37, 30); S.note(DR, tt + 3, 0.1, 37, 28)
    t += bars * B
    # «перепалка»: хроматический спуск медных и ответ деревянных, тутти на доминанте си-бемоль мажора
    for k in range(8):
        for inst, o, v in ((TBN, 0, 100), (EUP, 0, 92), (TUBA, -12, 100)): S.note(inst, t + k * 0.5, 0.45, 53 - k + o, v)
    S.note(DR, t, 0.5, 36, 100); S.note(DR, t, 1.2, 57, 84); timp(t, 41, 96)
    for k in range(8):
        p = [65, 68, 71, 74][k % 4]
        for inst, o, v in ((FL, 12, 66), (CL1, 0, 80), (ASX, 0, 60)): S.note(inst, t + B + k * 0.5, 0.42, fold(p + o, CAP.get(inst, 96)), v)
    for r in range(16): S.note(DR, t + B + r / 4, 0.1, 38, 46 + r * 2)
    for k in range(8):
        for inst, o, v in ((TBN, 0, 104), (EUP, 0, 96), (TUBA, -12, 104)): S.note(inst, t + 2 * B + k * 0.5, 0.45, 51 - k + o, v)
    S.note(DR, t + 2 * B, 0.5, 36, 104); S.note(DR, t + 2 * B, 1.2, 57, 88); timp(t + 2 * B, 36, 100)
    for b in (0, 1, 2):
        for p in (29, 41, 48, 51, 57, 60, 63, 69, 72, 75):
            inst = TUBA if p < 40 else TBN if p < 54 else HRN if p < 64 else CRN
            S.note(inst, t + 3 * B + b, 0.6, p, 102)
        S.note(DR, t + 3 * B + b, 0.4, 36, 100); timp(t + 3 * B + b, 41, 92)
    S.note(DR, t + 3 * B, 1.2, 49, 84)
    for r in range(8): S.note(DR, t + 3 * B + 3 + r / 8, 0.08, 38, 54 + r * 6)
    t += 4 * B
    # торжественное трио: мелодия у тромбонов, эуфониума и тенор-саксофона, корнеты и флейты — в унисон выше,
    # пикколо пишет тихий узор, колокольчики — на сильных долях
    melody(t, mel, F, [(TBN, -7, 104, ''), (EUP, -7, 98, ''), (TSX, -7, 82, ''), (CRN, 5, 90, ''), (CL1, 5, 84, ''), (FL, 5, 68, ''), (CL2, 5, 70, 'harm')])
    for b, d, p in mel:
        if d >= 1 and abs(b % 2) < 1e-6: S.note(GLK, t + b, 0.8, fold(p + 5 + 12, CAP[GLK]), 30)
    for k, ch in enumerate(F):
        if k % 2: continue
        tt = t + k * B; arp = tones(ch, 77, 91)
        if arp:
            seq = (arp + arp[::-1][1:-1]) * 4
            for e in range(8): S.note(PIC, tt + e * 0.5, 0.42, seq[e % len(seq)], 46)
    bass_and_afterbeats(t, F, 1.18, walk=True); drums(t, bars, 1.15); S.note(DR, t, 1.4, 57, 92); S.note(DR, t + 8 * B, 1.4, 57, 84)
    t += bars * B
    # финал: аккорд — пауза — тихий «бом» — громкий «БОМ» (си-бемоль мажор, верх — не выше фа)
    def tutti(at, dur, vel):
        for p in (34, 46, 53, 58, 62, 65, 70, 74, 77):
            inst = TUBA if p < 44 else TBN if p < 56 else HRN if p < 64 else CRN
            S.note(inst, at, dur, p, vel)
            if 58 <= p <= 77: S.note(CL1, at, dur, p, vel - 12)
            if 46 <= p <= 65: S.note(TSX if p < 60 else ASX, at, dur, p, vel - 16)
        S.note(DR, at, 0.5, 36, vel); S.note(DR, at, 1.5, 49, vel - 30); timp(at, 34, vel)
    tutti(t, 1.6, 108); S.note(TUBA, t + B + 2, 0.4, 34, 64); S.note(TBN, t + B + 2, 0.4, 46, 60); timp(t + B + 2, 34, 60); tutti(t + B + 3, 0.7, 118)
    S.tempo_at(t + B, bpm * 0.97)
    return S

# ---------- регтайм: фортепиано «страйд», банджо, кларнет, корнет с сурдиной, тромбон, туба ----------
def rag(T, seed=11):
    # 0.23: на кварту ниже (до мажор): мелодия кларнета и корнета — в середине, фортепиано октавой выше — не выше ми третьей,
    # корнет открытый (сурдина в General MIDI гнусавит), банджо и коробочка тише
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats
    K = -5; mel = [(b, d, p + K) for b, d, p in mel]; chords = [tr_ch(c, K) for c in chords]
    PNO, CL, CRN, TBN, BJO, TUBA, DR = 0, 1, 2, 3, 4, 5, 9
    S.setup(PNO, 0, 98, 60, 40); S.setup(CL, 71, 96, 46, 44); S.setup(CRN, 56, 90, 76, 40); S.setup(TBN, 57, 94, 86, 44)
    S.setup(BJO, 105, 66, 30, 30); S.setup(TUBA, 58, 104, 64, 36); S.setup(DR, 0, 80, 64, 40)
    CAP = {PNO: 88, CL: 84, CRN: 84, TBN: 66}
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
                for p in sorted(set(nearest(q, tones(ch, 57, 72)) for q in (60, 64, 67))): S.note(BJO, t + e, 0.2, p, 44 * lvl)
            S.note(DR, t, 0.2, 36, 50 * lvl); S.note(DR, t + 0.5, 0.1, 38, 26 * lvl); S.note(DR, t + 1.5, 0.1, 38, 30 * lvl); S.note(DR, t + 1.25, 0.1, 77, 22 * lvl)
    def counter(b0, chs, lvl):
        prev = 55
        for k, ch in enumerate(chs):
            t = b0 + k * B; c = tones(ch, 48, 62); a = nearest(prev - 1, c); S.note(TBN, t, 0.9, a, 64 * lvl); b = nearest(a + 3, c); S.note(TBN, t + 1, 0.9, b, 60 * lvl); prev = b
    def melody(b0, M, insts):
        for b, d, p in M:
            for inst, dv, vel in insts: S.note(inst, b0 + b, d * 0.85, fold(p + dv, CAP.get(inst, 96)), vel)
    t = 0.0
    I = [tr_ch(chord_of(c), K) for c in ('C7', 'C7', 'F', 'C7')]
    stride(t, I, 0.9); t += 4 * B
    A = chords[:bars]
    melody(t, mel, [(CL, 0, 80), (PNO, 12, 52)]); stride(t, A, 1.0); t += bars * B
    melody(t, mel, [(CRN, 0, 84), (CL, -12, 60), (PNO, 12, 54)]); stride(t, A, 1.05); counter(t, A, 1.0); t += bars * B
    Bb = [tr_ch(c, 5) for c in A]  # вторая часть — в си-бемоль мажоре, «стоп-тайм» в каждом четвёртом такте
    melody(t, mel, [(CL, -7, 78), (PNO, 5, 56)])
    for k, ch in enumerate(Bb):
        if k % 4 == 3:
            tt = t + k * B; root = nearest(43, [n for n in range(36, 48) if (n - ch[0]) % 12 == 0])
            S.note(PNO, tt, 0.3, root, 80); S.note(TUBA, tt, 0.3, root - 12 if root - 12 >= 31 else root, 80); S.note(DR, tt, 0.2, 38, 70)
        else: stride(t + k * B, [ch], 0.95)
    t += bars * B
    melody(t, mel, [(CRN, 0, 88), (CL, -12, 62), (PNO, 12, 56)]); stride(t, A, 1.1); counter(t, A, 0.9); t += bars * B
    melody(t, mel, [(CRN, -7, 84), (PNO, 5, 58)]); stride(t, Bb, 1.0); t += bars * B
    melody(t, mel, [(CRN, 0, 92), (CL, 0, 74), (PNO, 12, 60), (TBN, -12, 72)]); stride(t, A, 1.15); t += bars * B
    for p in (36, 48, 52, 55, 60, 64, 67, 72): S.note(PNO if p > 45 else TUBA, t + 0, 0.4, p, 96); S.note(CRN, t, 0.4, 72, 90); S.note(CL, t, 0.4, 76, 80)
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
            for inst, dv, vel in insts: S.note(inst, b0 + b, d * 0.95, fold(p + dv, 90 if inst == FL else 96), vel)
    t = 0.0
    I = [chord_of(c) for c in ('A7', 'A7', 'A7', 'A7')]
    accomp(t, I, 0.8); S.note(DR, t, 1, 81, 50); t += 4 * B
    A = chords[:bars]
    melody(t, mel, [(VLN, 0, 82)]); accomp(t, A, 1.0); S.note(DR, t, 1, 81, 56); t += bars * B
    melody(t, mel, [(VLN, 0, 86), (FL, 12, 58), (CL, -12, 60)]); accomp(t, A, 1.08); S.note(DR, t, 1, 81, 60); S.note(DR, t + 8 * B, 1, 81, 56); t += bars * B
    G = [tr_ch(c, 5) for c in A]
    melody(t, mel, [(CL, 5 - 12, 78), (FL, 5, 64)]); accomp(t, G, 0.9); t += bars * B
    melody(t, mel, [(VLN, 0, 88), (FL, 12, 60), (CL, -12, 62)]); accomp(t, A, 1.1); S.note(DR, t, 1, 81, 58); t += bars * B
    melody(t, mel, [(VLN, 5 - 12, 80), (CL, 5, 66)]); accomp(t, G, 0.95); t += bars * B
    melody(t, mel, [(VLN, 0, 92), (FL, 12, 62), (CL, 0, 66), (HRN, -12, 62)]); accomp(t, A, 1.15)
    for k in range(0, bars, 4): S.note(DR, t + k * B, 1, 81, 62)
    S.tempo_at(t + (bars - 3) * B, bpm * 0.94); S.tempo_at(t + (bars - 1) * B, bpm * 0.85); t += bars * B
    for p in (38, 50, 57, 62, 66, 69, 74, 78, 81):
        inst = VC if p < 52 else VLA if p < 64 else VLN; S.note(inst, t, 2.6, p, 84)
    S.note(HARP, t, 2.5, 74, 70); S.note(FL, t, 2.5, 74, 60); S.note(DR, t, 2, 81, 50)
    return S

# ---------- танго: бандонеон, скрипка, фортепиано, контрабас ----------
def tango(T, seed=17):
    # 0.23: на кварту ниже (ми минор): бандонеон и скрипка в середине, скрипка октавой выше — не выше ми третьей
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats
    K = -5; mel = [(b, d, p + K) for b, d, p in mel]; chords = [tr_ch(c, K) for c in chords]
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
            for inst, dv, vel in insts: S.note(inst, b0 + b, d * 0.9, fold(p + dv, 88), vel)
    t = 0.0
    I = [tr_ch(chord_of(c), K) for c in ('E7', 'E7', 'E7', 'E7')]
    marcato(t, I, 0.9, hab=False); t += 4 * B
    A = chords[:bars]
    melody(t, mel, [(BAN, 0, 88)]); marcato(t, A, 1.0); t += bars * B
    melody(t, mel, [(VLN, 0, 86), (BAN, -12, 72)]); marcato(t, A, 1.05); t += bars * B
    D = [tr_ch(c, 5) for c in A]
    melody(t, mel, [(VLN, 5 - 12, 80), (BAN, 5 - 12, 64)]); marcato(t, D, 0.95, hab=False); t += bars * B
    melody(t, mel, [(BAN, 0, 90), (VLN, -12, 74)]); marcato(t, A, 1.08); t += bars * B
    melody(t, mel, [(VLN, 5, 84), (BAN, 5 - 12, 66)]); marcato(t, D, 1.0); t += bars * B
    melody(t, mel, [(BAN, 0, 94), (VLN, 12, 72), (STR, -12, 62)]); marcato(t, A, 1.12); t += bars * B
    # «чан-чан»: доминанта — тоника, коротко
    for at, ch in ((t, tr_ch(chord_of('E7'), K)), (t + 1, tr_ch(chord_of('Am'), K))):
        root = nearest(40, [n for n in range(33, 46) if (n - ch[0]) % 12 == 0])
        for p in [root] + sorted(set(nearest(q, tones(ch, 55, 76)) for q in (57, 60, 64, 69, 72))):
            S.note(PNO if p > 50 else CB, at, 0.25, p, 100); S.note(BAN, at, 0.25, p + 12 if p < 60 else p, 96)
    return S

# ---------- 0.24: джаз, кекуок, фокстрот и чарльстон — живыми оркестрами вместо «оркестриона» ----------
# Общие помощники: свинг (восьмые вразвалку), аккорд рядом с серединой, бас по аккорду, подголосок по звукам аккорда.
def swing_mel(M, amt):
    out = []
    for b, d, p in M:
        e = b + d; nb = b + (amt if abs((b % 1) - 0.5) < 1e-6 else 0); ne = e + (amt if abs((e % 1) - 0.5) < 1e-6 else 0)
        out.append((nb, max(0.1, ne - nb), p))
    return out

def voicing(ch, lo, hi, n=3, center=None):
    c = center if center is not None else (lo + hi) // 2; T = tones(ch, lo, hi)
    T = sorted(T, key=lambda q: (abs(q - c), q))[:n]; return sorted(T)

def root_of(ch, lo=33, hi=46):
    return nearest((lo + hi) // 2, [n for n in range(lo, hi + 1) if (n - ch[0]) % 12 == 0])

def fifth_of(r, hi=47):
    return r + 7 if r + 7 <= hi else r - 5

def below(p, ch, mn=3, mx=9):
    c = [q for q in tones(ch, p - mx, p - mn)]; return max(c) if c else p - 4

def obbligato(S, inst, b0, chs, B, lo, hi, vel, rnd, step=0.5, rest=0.25, sw=0.0):
    """Подголосок кларнета: бегущие восьмые по звукам аккорда и проходящим, волной вверх-вниз, с паузами на вдох."""
    prev = (lo + hi) // 2; up = True
    for k, ch in enumerate(chs):
        T = tones(ch, lo, hi)
        if not T: continue
        n = int(B / step)
        for e in range(n):
            if rnd.random() < rest and e % 2 == 1: continue
            cand = [q for q in T if (q > prev if up else q < prev)]
            if not cand: up = not up; cand = [q for q in T if (q > prev if up else q < prev)] or T
            q = min(cand, key=lambda x: abs(x - prev))
            if rnd.random() < 0.3 and e % 2 == 1:  # проходящий полутон к следующему звуку
                q = q + (-1 if up else 1)
            t = b0 + k * B + e * step; t += sw if abs((e * step) % 1 - 0.5) < 1e-6 else 0
            S.note(inst, t, step * 0.9, q, vel + (6 if e % 2 == 0 else 0)); prev = q
            if q >= hi - 1: up = False
            if q <= lo + 1: up = True

def jazz(T, seed=31):
    """Диксиленд 1917 года: корнет ведёт мелодию, кларнет вьётся над ней, тромбон отвечает внизу; фортепиано, банджо, туба,
    ударные с дробью на 2 и 4; брейки в конце фраз; четыре квадрата — ансамбль, соло кларнета, ансамбль, финальный — громче."""
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats; R = random.Random(seed)
    M = swing_mel(mel, 0.16)
    CRN, CL, TBN, PNO, BJO, TUBA, MUT, DR = 0, 1, 2, 3, 4, 5, 6, 9
    S.setup(CRN, 56, 100, 60, 34, 4); S.setup(CL, 71, 92, 74, 36); S.setup(TBN, 57, 96, 52, 34); S.setup(PNO, 0, 82, 44, 30)
    S.setup(BJO, 105, 64, 84, 26); S.setup(TUBA, 58, 104, 64, 26); S.setup(MUT, 59, 70, 54, 34); S.setup(DR, 0, 84, 64, 30, 0)
    def rhythm(b0, chs, lvl, breaks=True, light=False):
        for k, ch in enumerate(chs):
            t = b0 + k * B; brk = breaks and k in (7, 15); r = root_of(ch); f = fifth_of(r)
            S.note(TUBA, t, 0.9, r, (64 if light else 82) * lvl)
            if not brk: S.note(TUBA, t + 2, 0.9, f, (58 if light else 76) * lvl)
            V = voicing(ch, 55, 70, 3, 62)
            for a in ((0, 1, 2, 3) if not brk else (0,)):
                for q in V: S.note(BJO, t + a, 0.22, q, (40 + (8 if a % 2 else 0)) * lvl)
                if a % 2 == 1:
                    for q in V: S.note(PNO, t + a, 0.3, q, 48 * lvl)
                else: S.note(PNO, t + a, 0.4, r + 12, 46 * lvl)
            # ударные: бочка на 1 и 3, дробь щёток на 2 и 4, «хлопок» тарелки в конце фразы
            if brk:
                S.note(DR, t, 0.3, 36, 70 * lvl); S.note(DR, t, 0.25, 49, 54 * lvl)
            else:
                for a in (0, 2): S.note(DR, t + a, 0.3, 36, 52 * lvl)
                for a in (1, 3):
                    for r_ in range(5): S.note(DR, t + a + r_ * 0.06, 0.05, 38, (34 - r_ * 3) * lvl)
                if light:
                    for a in (0.5, 1.5, 2.5, 3.5): S.note(DR, t + a + 0.16, 0.05, 77, 26 * lvl)
    def tailgate(b0, chs, lvl):
        prev = 50
        for k, ch in enumerate(chs):
            t = b0 + k * B
            if k in (7, 15): S.note(TBN, t, 0.9, root_of(ch, 46, 58), 80 * lvl); continue
            a = nearest(prev, tones(ch, 46, 60)); S.note(TBN, t, 1.8, a, 74 * lvl)
            nxt = chs[k + 1] if k + 1 < len(chs) else ch; g = nearest(a, tones(nxt, 46, 60))
            b = nearest(a + (3 if g >= a else -3), tones(ch, 46, 60)); S.note(TBN, t + 2, 1.3, b, 70 * lvl)
            S.note(TBN, t + 3.5, 0.45, g + (1 if g < b else -1), 64 * lvl); prev = g
    def lead(b0, inst, vel, tr=0):
        for b, d, p in M: S.note(inst, b0 + b, d * 0.9, p + tr, vel)
    t = 0.0
    # вступление: вамп на доминанте, корнет — призыв
    I = [chord_of('C7')] * 4; rhythm(t, I, 0.9, breaks=False)
    for b, d, p in [(0, 0.66, 60), (0.66, 0.34, 64), (1, 0.66, 67), (1.66, 0.34, 70), (2, 1.5, 72), (4, 0.66, 70), (4.66, 0.34, 67), (5, 0.66, 64), (5.66, 0.34, 60), (6, 1.5, 67),
                    (8, 1, 72), (9, 1, 70), (10, 1, 69), (11, 1, 67), (12, 3, 64)]:
        S.note(CRN, t + b, d * 0.9, p, 92); S.note(TBN, t + b, d * 0.9, p - 12, 74)
    t += 4 * B
    A = chords[:bars]
    # 1) ансамбль
    lead(t, CRN, 92); obbligato(S, CL, t, A, B, 72, 86, 58, R, sw=0.16); tailgate(t, A, 1.0); rhythm(t, A, 1.0); t += bars * B
    # 2) соло кларнета: мелодия с украшениями, сурдина корнета — долгими нотами аккорда, ритм тише
    for b, d, p in M:
        S.note(CL, t + b, d * 0.9, p + 7 if p + 7 <= 84 else p - 5, 80)
        if d >= 1.0 and R.random() < 0.5: S.note(CL, t + b + d * 0.55, d * 0.4, (p + 7 if p + 7 <= 84 else p - 5) + 2, 64)
    for k, ch in enumerate(A):
        for q in voicing(ch, 58, 70, 2, 64): S.note(MUT, t + k * B, 3.6, q, 44)
    rhythm(t, A, 0.85, light=True); t += bars * B
    # 3) ансамбль громче, тромбон активнее
    lead(t, CRN, 98); obbligato(S, CL, t, A, B, 74, 86, 62, R, rest=0.15, sw=0.16); tailgate(t, A, 1.1); rhythm(t, A, 1.05); t += bars * B
    # 4) финальный квадрат: корнет и кларнет в унисон с подголоском, всё громче, тарелки
    lead(t, CRN, 104); lead(t, CL, 70, 0); obbligato(S, CL, t, A, B, 76, 86, 56, R, rest=0.3, sw=0.16); tailgate(t, A, 1.2); rhythm(t, A, 1.15)
    for k in range(0, bars, 4): S.note(DR, t + k * B, 0.6, 49, 64)
    t += bars * B
    # кода: «шейв-энд-э-хэркат» — стоп-аккорды
    for at, ch, v in ((0, chord_of('C7'), 96), (0.66, chord_of('C7'), 90), (1, chord_of('C7'), 92), (2, chord_of('F6'), 104)):
        r = root_of(ch); S.note(TUBA, t + at, 0.3, r, v)
        for q in voicing(ch, 55, 72, 4, 64): S.note(PNO, t + at, 0.3, q, v - 20); S.note(BJO, t + at, 0.2, q, v - 40)
        S.note(CRN, t + at, 0.3 if at < 2 else 1.6, voicing(ch, 69, 79, 1, 77)[0], v); S.note(TBN, t + at, 0.3 if at < 2 else 1.6, voicing(ch, 48, 58, 1, 53)[0], v - 10)
        S.note(CL, t + at, 0.3 if at < 2 else 1.6, voicing(ch, 74, 84, 1, 81)[0], v - 16); S.note(DR, t + at, 0.3, 36, v - 20)
    S.note(DR, t + 2, 1.4, 49, 80)
    return S

def cake(T, seed=37):
    """Кекуок 1898 года: духовой оркестр с банджо — «ум-па» на две доли, синкопа «коротко-длинно-коротко» в мелодии;
    первая часть дважды, трио в до мажоре тише, трио ещё раз — во всю силу."""
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats
    CRN, CL, CL2, HRN, TBN, EUP, TUBA, BJO, DR = 0, 1, 2, 3, 4, 5, 6, 7, 9
    S.setup(CRN, 56, 98, 62, 40, 4); S.setup(CL, 71, 92, 46, 42); S.setup(CL2, 71, 80, 40, 42); S.setup(HRN, 60, 90, 86, 50); S.setup(TBN, 57, 92, 80, 44)
    S.setup(EUP, 58, 90, 70, 44); S.setup(TUBA, 58, 108, 64, 36); S.setup(BJO, 105, 70, 34, 30); S.setup(DR, 0, 88, 64, 36, 0)
    def oompah(b0, chs, lvl):
        for k, ch in enumerate(chs):
            t = b0 + k * B; r = root_of(ch); f = fifth_of(r)
            S.note(TUBA, t, 0.45, r, 84 * lvl); S.note(TUBA, t + 1, 0.45, f, 76 * lvl)
            V = voicing(ch, 55, 67, 3, 60)
            for a in (0.5, 1.5):
                for q in V: S.note(HRN, t + a, 0.3, q, 54 * lvl); S.note(BJO, t + a, 0.2, q, 46 * lvl)
            for q in voicing(ch, 46, 57, 2, 50): S.note(TBN, t + 0.5, 0.3, q, 44 * lvl); S.note(TBN, t + 1.5, 0.3, q, 42 * lvl)
            S.note(DR, t, 0.3, 36, 62 * lvl); S.note(DR, t + 1, 0.2, 38, 48 * lvl); S.note(DR, t + 1.75, 0.1, 38, 34 * lvl)
            if k % 4 == 0: S.note(DR, t, 0.6, 49, 40 * lvl)
    def lead(b0, M, insts):
        for b, d, p in M:
            bar = int(b // B)
            for inst, dv, vel, mode in insts:
                q = p + dv
                if mode == 'harm': q = below(q, chords[min(bar, len(chords) - 1)] if dv == 0 else tr_ch(chords[min(bar, len(chords) - 1)], 5))
                S.note(inst, b0 + b, d * 0.88, fold(q, 86), vel)
    t = 0.0
    I = [chord_of('D7'), chord_of('D7'), chord_of('G'), chord_of('D7')]
    oompah(t, I, 0.85)
    for b, d, p in [(0, 0.25, 62), (0.25, 0.5, 66), (0.75, 0.25, 69), (1, 1, 74), (2, 0.25, 72), (2.25, 0.5, 69), (2.75, 0.25, 66), (3, 1, 62), (6, 0.5, 74), (6.5, 0.5, 72), (7, 1, 66)]:
        S.note(CRN, t + b, d * 0.9, p, 88); S.note(CL, t + b, d * 0.9, p, 70)
    t += 4 * B
    A = chords[:bars]
    lead(t, mel, [(CRN, 0, 88, ''), (CL, 0, 74, ''), (CL2, 0, 60, 'harm')]); oompah(t, A, 1.0); t += bars * B
    lead(t, mel, [(CRN, 0, 94, ''), (CL, 12, 56, ''), (CL2, 0, 64, 'harm'), (EUP, -12, 60, '')]); oompah(t, A, 1.08); t += bars * B
    C = [tr_ch(c, 5) for c in A]
    lead(t, mel, [(CL, 5, 76, ''), (EUP, -7, 66, ''), (CL2, 5, 56, 'harm')]); oompah(t, C, 0.8); t += bars * B
    lead(t, mel, [(CRN, 5, 96, ''), (CL, 5, 80, ''), (TBN, -7, 84, ''), (EUP, -7, 80, ''), (CL2, 5, 66, 'harm')]); oompah(t, C, 1.15); t += bars * B
    for at, v in ((0, 104), (1, 110)):
        ch = chord_of('C')
        for q in (36, 48, 55, 60, 64, 67, 72, 76):
            inst = TUBA if q < 44 else TBN if q < 56 else HRN if q < 66 else CRN
            S.note(inst, t + at, 0.5 if at == 0 else 1.2, q, v)
        S.note(CL, t + at, 0.5 if at == 0 else 1.2, 79, v - 20); S.note(DR, t + at, 0.3, 36, v - 10); S.note(DR, t + at, 0.8, 49, v - 40)
    return S

def fox(T, seed=41):
    """Фокстрот 1914–1925: танцевальный оркестр в зале — группа саксофонов, труба с сурдиной, скрипки, фортепиано, гитара,
    контрабас щипком, щётки; «воздух» зала — тянущиеся струнные, арфа и челеста, большая реверберация, мягкий свинг."""
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats; R = random.Random(seed)
    M = swing_mel(mel, 0.1)
    AS1, AS2, TS, MUT, VLN, PAD, HARP, CEL, PNO, GTR, BASS, DR = 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 9
    S.setup(AS1, 65, 90, 44, 64, 18); S.setup(AS2, 65, 78, 52, 64, 18); S.setup(TS, 66, 80, 76, 64, 18); S.setup(MUT, 59, 82, 60, 66, 16)
    S.setup(VLN, 48, 96, 70, 76, 30); S.setup(PAD, 49, 70, 64, 90, 40); S.setup(HARP, 46, 80, 36, 76, 20); S.setup(CEL, 8, 62, 92, 80, 30)
    S.setup(PNO, 0, 70, 50, 56, 10); S.setup(GTR, 24, 66, 88, 50, 10); S.setup(BASS, 32, 96, 64, 40, 0); S.setup(DR, 0, 60, 64, 50, 0)
    def rhythm(b0, chs, lvl):
        for k, ch in enumerate(chs):
            t = b0 + k * B; r = root_of(ch, 36, 48); f = fifth_of(r, 50)
            S.note(BASS, t, 0.9, r, 78 * lvl); S.note(BASS, t + 2, 0.9, f, 72 * lvl)
            V = voicing(ch, 55, 70, 4, 63)
            for a in (1, 3):
                for q in V: S.note(PNO, t + a, 0.35, q, 40 * lvl); S.note(GTR, t + a, 0.3, q, 38 * lvl)
            for a in (1, 3): S.note(DR, t + a, 0.4, 38, 20 * lvl); S.note(DR, t + a, 0.2, 44, 26 * lvl)
            for e in range(8): S.note(DR, t + e * 0.5 + (0.1 if e % 2 else 0), 0.3, 51, (16 if e % 2 else 22) * lvl)
    def pads(b0, chs, lvl):
        for k, ch in enumerate(chs):
            for q in voicing(ch, 52, 72, 4, 62): S.note(PAD, b0 + k * B, B * 0.98, q, 42 * lvl)
    def saxes(b0, lvl):
        for b, d, p in M:
            bar = min(int(b // B), len(chords) - 1); ch = chords[bar]
            S.note(AS1, b0 + b, d * 0.92, p, 80 * lvl); h = below(p, ch, 3, 8); S.note(AS2, b0 + b, d * 0.92, h, 66 * lvl)
            S.note(TS, b0 + b, d * 0.92, below(h, ch, 3, 9), 62 * lvl)
    def harp_arp(at, ch, up=True, vel=50):
        T_ = tones(ch, 55, 86)
        for e, q in enumerate(T_ if up else T_[::-1]): S.note(HARP, at + e * 0.09, 1.6, q, vel)
    def celesta(b0, chs, vel=38):
        for k in (3, 7, 11, 15):
            if k < len(chs):
                for e, q in enumerate(voicing(chs[k], 79, 91, 3, 84)): S.note(CEL, b0 + k * B + 2 + e * 0.33, 0.9, q, vel)
    t = 0.0
    # вступление: струнные и арфа, челеста — вечер в зале на набережной
    I = [chord_of('C6'), chord_of('Am7'), chord_of('Dm7'), chord_of('G7')]
    pads(t, I, 1.0)
    for k, ch in enumerate(I): harp_arp(t + k * B, ch, k % 2 == 0, 46)
    for b, d, p in [(0, 1.5, 76), (1.5, 0.5, 74), (2, 2, 72), (4, 1.5, 69), (5.5, 0.5, 72), (6, 2, 76), (8, 3, 74), (12, 2, 71), (14, 2, 67)]: S.note(VLN, t + b, d * 0.95, p, 70)
    for q in (79, 84, 88): S.note(CEL, t + 14 + (q - 79) * 0.05, 1.5, q, 40)
    t += 4 * B
    A = chords[:bars]
    # 1) саксофоны в три голоса
    saxes(t, 1.0); rhythm(t, A, 0.95); pads(t, A, 0.8); celesta(t, A); harp_arp(t, A[0], True, 40); t += bars * B
    # 2) труба с сурдиной ведёт, скрипки — долгий подголосок
    for b, d, p in M: S.note(MUT, t + b, d * 0.9, p, 84)
    prev = 64
    for k, ch in enumerate(A):
        a = nearest(prev, tones(ch, 60, 72)); S.note(VLN, t + k * B, 1.9, a + 12 if a + 12 <= 84 else a, 54); b = nearest(a + 2, tones(ch, 60, 72)); S.note(VLN, t + k * B + 2, 1.9, b + 12 if b + 12 <= 84 else b, 50); prev = b
    rhythm(t, A, 1.0); pads(t, A, 0.7); celesta(t, A, 34); t += bars * B
    # 3) скрипки поют мелодию, саксофоны — аккорды «подушкой»
    for b, d, p in M: S.note(VLN, t + b, d * 0.98, p, 84)
    for k, ch in enumerate(A):
        for q, inst in zip(voicing(ch, 55, 70, 3, 62), (TS, AS2, AS1)): S.note(inst, t + k * B, 3.8, q, 50)
    rhythm(t, A, 1.0); harp_arp(t + 8 * B, A[8], True, 44); t += bars * B
    # 4) полквадрата всем оркестром и кода с замедлением
    half = 8
    for b, d, p in M:
        if b >= half * B + 4: continue
        S.note(AS1, t + b, d * 0.92, p, 86); S.note(VLN, t + b, d * 0.95, p, 80); S.note(MUT, t + b, d * 0.9, p, 64)
    rhythm(t, A[:half], 1.05); pads(t, A[:half], 0.9)
    S.tempo_at(t + (half - 2) * B, bpm * 0.92); S.tempo_at(t + (half - 1) * B, bpm * 0.82)
    t += half * B
    ch = chord_of('C6')
    for q in voicing(ch, 48, 79, 7, 64): S.note(PAD, t, 6, q, 60); S.note(VLN if q >= 60 else TS, t, 5, q, 58)
    S.note(BASS, t, 4, 36, 70); harp_arp(t, ch, True, 56)
    for e, q in enumerate((84, 88, 91)): S.note(CEL, t + 0.6 + e * 0.25, 2.5, q, 42)
    S.note(DR, t, 3, 51, 30)
    return S

def charl(T, seed=43):
    """Чарльстон 1923–1929: «горячий» оркестр — труба, кларнет, тромбон, саксофоны, фортепиано, банджо, туба, ударные.
    Фирменный ритм «раз — и-два» в фортепиано и банджо; квадрат саксофонов, квадрат трубы, «стоп-тайм» с кларнетом, финал всем."""
    mel, chords, bars, beats = parse(T); bpm = T['bpm']; S = Score(bpm, seed); B = beats; R = random.Random(seed)
    M = swing_mel(mel, 0.12)
    TRP, CL, TBN, AS, TS, PNO, BJO, TUBA, DR = 0, 1, 2, 3, 4, 5, 6, 7, 9
    S.setup(TRP, 56, 100, 60, 38, 4); S.setup(CL, 71, 90, 76, 40); S.setup(TBN, 57, 94, 50, 38); S.setup(AS, 65, 90, 44, 40); S.setup(TS, 66, 86, 84, 40)
    S.setup(PNO, 0, 84, 64, 34); S.setup(BJO, 105, 72, 30, 30); S.setup(TUBA, 58, 104, 64, 30); S.setup(DR, 0, 86, 64, 34, 0)
    def charleston(b0, chs, lvl, stop=False):
        for k, ch in enumerate(chs):
            t = b0 + k * B; r = root_of(ch); V = voicing(ch, 55, 70, 3, 63)
            for a, v in ((0, 1.0), (1.5, 0.92)):
                for q in V: S.note(PNO, t + a, 0.35, q, 58 * lvl * v); S.note(BJO, t + a, 0.25, q, 54 * lvl * v)
                S.note(DR, t + a, 0.2, 36 if a == 0 else 38, 60 * lvl * v)
            if stop: S.note(TUBA, t, 0.4, r, 86 * lvl); continue
            S.note(TUBA, t, 0.8, r, 86 * lvl); S.note(TUBA, t + 2, 0.8, fifth_of(r), 78 * lvl)
            for a in (2, 3):
                for q in V: S.note(BJO, t + a, 0.2, q, 44 * lvl)
                S.note(DR, t + a, 0.15, 42, 34 * lvl)
            S.note(DR, t + 3, 0.15, 38, 42 * lvl)
            if k % 8 == 7: S.note(DR, t + 3.5, 0.3, 49, 54 * lvl)
    def sax_lead(b0, lvl):
        for b, d, p in M:
            bar = min(int(b // B), len(chords) - 1); ch = chords[bar]
            S.note(AS, b0 + b, d * 0.88, p, 82 * lvl); S.note(TS, b0 + b, d * 0.88, below(p, ch, 3, 9), 70 * lvl)
    def brass_riffs(b0, chs, lvl):
        for k, ch in enumerate(chs):
            if k % 2: continue
            V = voicing(ch, 55, 72, 2, 64)
            for a in (1.5, 3.5):
                for q in V: S.note(TBN if q < 60 else TRP, b0 + k * B + a, 0.3, q, 58 * lvl)
    t = 0.0
    I = [chord_of('G7')] * 4
    charleston(t, I, 0.9)
    for b, d, p in [(0, 1.5, 67), (1.5, 1, 71), (4, 1.5, 74), (5.5, 1, 77), (8, 0.5, 79), (8.5, 0.5, 77), (9, 0.5, 74), (9.5, 0.5, 71), (10, 1, 67), (12, 2, 71)]:
        S.note(TRP, t + b, d * 0.9, p, 94); S.note(CL, t + b, d * 0.9, p + 5 if p + 5 <= 84 else p, 70)
    t += 4 * B
    A = chords[:bars]
    sax_lead(t, 1.0); brass_riffs(t, A, 0.9); charleston(t, A, 1.0); t += bars * B
    for b, d, p in M: S.note(TRP, t + b, d * 0.85, p, 96)
    obbligato(S, CL, t, A, B, 74, 86, 52, R, rest=0.35, sw=0.12)
    for k, ch in enumerate(A):
        for q in voicing(ch, 55, 67, 2, 60): S.note(AS if q > 58 else TS, t + k * B, 3.6, q, 50)
    charleston(t, A, 1.05); t += bars * B
    # стоп-тайм: оркестр бьёт только «раз — и-два», кларнет играет мелодию с украшениями
    for b, d, p in M:
        q = p + 5 if p + 5 <= 84 else p - 7; S.note(CL, t + b, d * 0.85, q, 86)
        if d >= 1 and R.random() < 0.6: S.note(CL, t + b + d * 0.5, d * 0.35, q - 2 if R.random() < 0.5 else q + 2, 66)
    charleston(t, A, 0.95, stop=True); t += bars * B
    # финал: труба и саксофоны в унисон, тромбон «смазывает» снизу, кларнет сверху, тарелки
    for b, d, p in M:
        bar = min(int(b // B), len(chords) - 1); ch = chords[bar]
        S.note(TRP, t + b, d * 0.85, p, 104); S.note(AS, t + b, d * 0.85, p, 76); S.note(TS, t + b, d * 0.85, below(p, ch, 3, 9), 74)
    obbligato(S, CL, t, A, B, 76, 86, 58, R, rest=0.25, sw=0.12)
    prev = 50
    for k, ch in enumerate(A):
        a = nearest(prev, tones(ch, 46, 60)); S.note(TBN, t + k * B, 1.8, a - 1, 60); S.note(TBN, t + k * B + 0.12, 1.6, a, 82); prev = a
    charleston(t, A, 1.15)
    for k in range(0, bars, 4): S.note(DR, t + k * B, 0.8, 49, 66)
    t += bars * B
    # «ду-да»: два коротких аккорда — и всё
    for at, v in ((0, 100), (1.5, 112)):
        ch = chord_of('C6')
        S.note(TUBA, t + at, 0.3, 36, v)
        for q in voicing(ch, 55, 72, 4, 64): S.note(PNO, t + at, 0.3, q, v - 20); S.note(BJO, t + at, 0.2, q, v - 40)
        S.note(TRP, t + at, 0.3 if at == 0 else 0.9, 76, v); S.note(AS, t + at, 0.3 if at == 0 else 0.9, 72, v - 20); S.note(TS, t + at, 0.3 if at == 0 else 0.9, 64, v - 20)
        S.note(TBN, t + at, 0.3 if at == 0 else 0.9, 55, v - 10); S.note(CL, t + at, 0.3 if at == 0 else 0.9, 81, v - 24); S.note(DR, t + at, 0.3, 36, v - 10)
    S.note(DR, t + 1.5, 1.2, 49, 86)
    return S

# ---------- 0.23: короткие оркестровые темы для игры: фанфара кинохроники и праздника, темы соперников в пари ----------
# Раньше они звучали одиночными семплами и синтезатором — теперь тот же оркестр, что и марш. Ноты — из игры (43d-duel.js):
# [нота, начало (с), длина (с)]. «l» — соперник торжествует (вы проиграли), «w» — тема сникла (вы выиграли): на кварту ниже,
# мажорная терция и секста — вниз на полтона, медленнее.
CUE_DUEL = {
    'proud': {'mel': [[72, 0, .3], [72, .3, .15], [72, .45, .15], [76, .6, .45], [72, 1.05, .3], [76, 1.35, .3], [79, 1.65, .9], [84, 2.6, .35], [83, 2.95, .35], [84, 3.3, 1.3]],
              'bass': [[60, 0, .6], [55, 1.05, .6], [60, 1.65, .9], [48, 3.3, 1.3]]},
    'biz': {'mel': [[60, 0, .2], [64, .22, .2], [67, .44, .2], [72, .66, .4], [71, 1.1, .2], [72, 1.32, .2], [74, 1.54, .2], [76, 1.76, .5], [74, 2.3, .2], [72, 2.52, .2], [71, 2.74, .2], [72, 2.96, .2], [67, 3.2, .2], [72, 3.45, 1]],
            'bass': [[48, 0, .4], [55, .66, .4], [53, 1.54, .4], [48, 2.52, .4], [48, 3.45, 1]]},
    'aristo': {'mel': [[67, 0, .6], [71, .6, .3], [74, .9, .3], [79, 1.2, .9], [78, 2.1, .3], [76, 2.4, .3], [74, 2.7, .6], [72, 3.3, .3], [71, 3.6, .3], [67, 3.9, 1.1]],
               'bass': [[43, 0, .9], [43, .9, .9], [50, 1.8, .9], [50, 2.7, .9], [43, 3.6, 1.4]]},
    'sharp': {'mel': [[76, 0, .12], [77, .12, .12], [76, .24, .12], [77, .36, .12], [74, .6, .3], [73, .95, .3], [72, 1.3, .3], [71, 1.65, .5], [79, 2.3, .12], [78, 2.42, .12], [77, 2.54, .12], [76, 2.66, .12], [75, 2.9, .25], [74, 3.2, .25], [67, 3.55, .9]],
              'bass': [[43, .6, .25], [42, .95, .25], [41, 1.3, .25], [40, 1.65, .4], [43, 3.55, .9]]}}

def deflate(N):
    return [[n - 5 - (1 if n % 12 in (4, 9, 11) else 0), d * 1.15, l * 1.15] for n, d, l in N]

def cue_duel(kind, win, seed=23):
    D = CUE_DUEL[kind]; S = Score(60, seed); M = D['mel']; Bs = D['bass']
    if win: M = deflate(M); Bs = deflate(Bs)
    else: M = [[n, d * 0.92, l * 0.92] for n, d, l in M]; Bs = [[n, d * 0.92, l * 0.92] for n, d, l in Bs]
    end = max(d + l for n, d, l in M + Bs)
    if kind == 'proud':  # фанфара: трубы, валторны терцией ниже, тромбоны и туба, литавры; сникшая — труба с сурдиной и фагот
        TR, HR, TB, TU, TI, DR = 0, 1, 2, 3, 4, 9; K = -5
        S.setup(TR, 59 if win else 56, 96, 62, 40); S.setup(HR, 60, 90, 74, 46); S.setup(TB, 70 if win else 57, 96, 70, 40); S.setup(TU, 58, 100, 64, 36); S.setup(TI, 47, 96, 64, 46); S.setup(DR, 0, 80, 64, 44)
        for n, d, l in M:
            p = n + K; S.note(TR, d, l * 0.95, p, 70 if win else 98)
            h = [q for q in range(p - 9, p - 2) if (q - (67 if not win else 62)) % 12 in (0, 4, 7)]
            if not win: S.note(HR, d, l * 0.95, max(h) if h else p - 4, 76)
        for n, d, l in Bs:
            p = n + K; S.note(TB, d, l * 0.9, p, 62 if win else 88)
            if not win: S.note(TU, d, l * 0.9, p - 12, 84); S.note(TI, d, 0.5, p - 12 if p - 12 >= 36 else p, 84)
        if not win:
            for r in range(6): S.note(TI, M[-1][1] - 0.36 + r * 0.06, 0.06, 43, 50 + r * 6)
            S.note(DR, M[-1][1], 1.6, 49, 62)
        else: S.note(TI, M[-1][1], 0.8, 38, 48)
    elif kind == 'biz':  # бойкое фортепиано, контрабас щипком, щётки; сникшая — медленнее и тише
        PN, CB, CL, DR = 0, 1, 2, 9
        S.setup(PN, 0, 100, 60, 34); S.setup(CB, 32, 100, 64, 30); S.setup(CL, 71, 70, 70, 40); S.setup(DR, 0, 64, 64, 36)
        for n, d, l in M: S.note(PN, d, l * 0.9, n + 12, 66 if win else 86); S.note(CL, d, l * 0.9, n, 40 if win else 52)
        for n, d, l in Bs: S.note(PN, d, l * 0.9, n + 12, 56 if win else 68); S.note(CB, d, l * 0.9, n - 12 if n - 12 >= 28 else n, 58 if win else 72)
        if not win:
            for k in range(int(end / 0.22)): S.note(DR, k * 0.22, 0.1, 38 if k % 2 else 42, 20 if k % 2 else 26)
    elif kind == 'aristo':  # струнный вальс: скрипки, альты щипком на 2-ю и 3-ю долю, виолончели, арфа; сникшая — альты и виолончели
        VN, VA, VC, HP, SV = 0, 1, 2, 3, 4
        S.setup(VN, 48, 100, 70, 56, 12); S.setup(VA, 45, 80, 76, 50); S.setup(VC, 42, 96, 66, 50); S.setup(HP, 46, 84, 60, 54); S.setup(SV, 40, 70, 64, 56)
        for n, d, l in M:
            S.note(VN, d, l * 0.98, n - (12 if win else 0), 72 if win else 84)
            if not win: S.note(SV, d, l * 0.95, n, 52)
        for n, d, l in Bs:
            S.note(VC, d, l * 0.9, n, 68 if win else 82)
            tri = [q for q in range(n + 7, n + 20) if (q - n) % 12 in ((0, 3, 7) if win else (0, 4, 7))]
            for a in (0.3, 0.6):
                for q in tri[:3]: S.note(VA, d + a * (1.15 if win else 0.92), 0.2, q, 46 if win else 56)
        if not win:
            for e, q in enumerate((55, 59, 62, 67, 71, 74)): S.note(HP, e * 0.06, 1.2, q, 50)
    else:  # sharp: кларнет с насмешкой, фагот, струнные щипком, коробочка
        CLR, BSN, PZ, DR = 0, 1, 2, 9
        S.setup(CLR, 71, 100, 60, 42); S.setup(BSN, 70, 96, 70, 40); S.setup(PZ, 45, 80, 64, 42); S.setup(DR, 0, 60, 64, 36)
        for n, d, l in M:
            S.note(BSN if win else CLR, d, l * 0.95, n - (12 if win else 0), 76 if win else 88)
            if l <= 0.13 and not win: S.note(DR, d, 0.05, 77, 30)
        for n, d, l in Bs: S.note(BSN, d, l * 0.9, n + (0 if n >= 40 else 12), 70); S.note(PZ, d, 0.2, n + 12, 50)
    return S, end

def cue_fanfare(seed=29):
    """Фанфара кинохроники и праздника: трубы, валторны, тромбоны, туба, литавры и тарелки — фа мажор, полторы секунды до аккорда."""
    S = Score(60, seed); TR1, TR2, HR, TB, TU, TI, DR = 0, 1, 2, 3, 4, 5, 9
    S.setup(TR1, 56, 100, 56, 40); S.setup(TR2, 56, 90, 72, 40); S.setup(HR, 60, 96, 80, 48); S.setup(TB, 57, 100, 70, 40); S.setup(TU, 58, 104, 64, 36); S.setup(TI, 47, 100, 64, 48); S.setup(DR, 0, 84, 64, 44)
    M = [[60, 0, .18], [65, .2, .18], [69, .4, .18], [72, .6, .5], [69, 1.15, .16], [72, 1.35, 1.3]]
    for n, d, l in M: S.note(TR1, d, l * 0.95, n, 100); S.note(TR2, d, l * 0.95, {60: 57, 65: 60, 69: 65, 72: 69}[n], 86)
    for q in (57, 60, 65): S.note(HR, 0.6, 0.5, q, 80); S.note(HR, 1.35, 1.3, q, 88)
    for q, at, l in ((41, 0.6, 0.5), (48, 0.6, 0.5), (41, 1.35, 1.3), (48, 1.35, 1.3)): S.note(TB, at, l, q, 92)
    S.note(TU, 1.35, 1.3, 29, 96)
    for r in range(7): S.note(TI, 0.85 + r * 0.07, 0.06, 41, 46 + r * 7)
    S.note(TI, 1.35, 0.9, 41, 104); S.note(DR, 1.35, 1.6, 49, 66)
    return S, 1.35 + 1.3

def cue_win(seed=31):
    """0.25: победа в пари — свои фанфары, до мажор: взлёт труб по аккорду, «та-та-та-там» всем оркестром, дробь литавр и тарелки.
    Раньше при победе звучала «сникшая» тема соперника — игроку казалось, что музыка грустная."""
    S = Score(60, seed); TR1, TR2, HR, TB, TU, TI, DR, ST = 0, 1, 2, 3, 4, 5, 9, 6
    S.setup(TR1, 56, 104, 54, 40); S.setup(TR2, 56, 92, 74, 40); S.setup(HR, 60, 96, 82, 48); S.setup(TB, 57, 100, 70, 40); S.setup(TU, 58, 104, 64, 36)
    S.setup(TI, 47, 104, 64, 50); S.setup(DR, 0, 88, 64, 44); S.setup(ST, 48, 84, 64, 56, 12)
    # взлёт: соль — до — ми — соль (триоли), удержать до
    run = [[67, 0, .11], [72, .12, .11], [76, .24, .11], [79, .36, .3]]
    for n, d, l in run: S.note(TR1, d, l, n, 96); S.note(TR2, d, l, n - (3 if n in (79, 72) else 4), 84)
    for q in (55, 60, 64, 67): S.note(ST, 0, 0.66, q, 50)
    # «та-та-та-там»
    hits = [[79, .72, .14], [79, .9, .14], [79, 1.08, .14], [84, 1.26, 1.5]]
    for n, d, l in hits:
        S.note(TR1, d, l * 0.95, n, 104); S.note(TR2, d, l * 0.95, 76 if n == 79 else 79, 94)
        for q in ((64, 67) if n == 79 else (64, 67, 72)): S.note(HR, d, l * 0.95, q, 86)
        S.note(TB, d, l * 0.9, 48 if n == 79 else 43, 90); S.note(TB, d, l * 0.9, 55, 84)
    S.note(TU, 1.26, 1.5, 36, 100); S.note(TU, 0.72, 0.14, 43, 80); S.note(TU, 0.9, 0.14, 43, 80); S.note(TU, 1.08, 0.14, 43, 84)
    for q in (60, 64, 67, 72, 76): S.note(ST, 1.26, 1.5, q, 70)
    for r in range(8): S.note(TI, 0.72 + r * 0.065, 0.06, 43, 50 + r * 6)
    S.note(TI, 1.26, 1.1, 36, 106); S.note(DR, 1.26, 1.8, 49, 74); S.note(DR, 1.26, 0.3, 36, 90)
    for r in range(6): S.note(DR, 0.72 + r * 0.09, 0.06, 38, 40 + r * 8)
    return S, 1.26 + 1.5

STYLE = {'march': march, 'rag': rag, 'waltz': waltz, 'tango': tango, 'jazz': jazz, 'cake': cake, 'fox': fox, 'charl': charl}
META = {'avto': ('march', 'triumph', 'военный оркестр'), 'reel': ('rag', 'lively', 'оркестр регтайма'), 'valse': ('waltz', 'calm', 'салонный оркестр'), 'tango': ('tango', 'drama', 'оркестр танго'),
        'jazz': ('jazz', 'lively', 'джаз-бэнд'), 'cake': ('cake', 'lively', 'духовой оркестр с банджо'), 'fox': ('fox', 'calm', 'танцевальный оркестр'), 'charl': ('charl', 'lively', 'горячий джаз-оркестр')}
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
        sh(['fluidsynth', '-ni', '-q', '-g', '0.55', '-r', '44100', '-R', '1', '-C', '1', '-o', 'synth.reverb.room-size=0.7', '-o', 'synth.reverb.level=0.52',
            '-o', 'synth.reverb.width=0.9', '-o', 'synth.reverb.damp=0.35', '-o', 'synth.polyphony=512', '-F', wav, sf2, mid])
        # ровная громкость (как у остальных записей) и мягкая «плёнка» зала; хвост реверберации не обрезать
        end = S.seconds(S.length())
        sh(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-t', '%.2f' % (end + 4.0), '-af', 'highpass=f=35,bass=g=1.5:f=160,treble=g=-4:f=5000,loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=out:st=%.2f:d=3' % (end + 1.0),
            '-c:a', 'aac', '-b:a', '112k', '-ar', '44100', out])
        dur = float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', out]).strip() or 0)
        idx['own_' + tid] = {'cap': T['name'] + ' (оркестр)', 'st': st, 'y': T['y'], 'mood': mood, 'd': round(dur, 1), 'lic': 'CC0 — сочинено для игры',
                             'page': '', 'by': 'Мелодия «Автоимперии», ' + band + ' (тембры ' + sfname.split(' (')[0] + ')'}
        LOG('anthem:', tid, st, round(dur, 1), 's', round(os.path.getsize(out) / 1024), 'KB')
    # короткие темы игры: фанфара и темы соперников (в плейлист не идут — пометка cue)
    jobs = [('fanfare', cue_fanfare), ('win', cue_win)] + [('duel_%s_%s' % (k, 'w' if w else 'l'), (lambda k=k, w=w: cue_duel(k, w))) for k in CUE_DUEL for w in (False, True)]
    for cid, fn in jobs:
        S, end = fn(); mid = os.path.join(tmp, 'cue_' + cid + '.mid'); wav = os.path.join(tmp, 'cue_' + cid + '.wav'); out = os.path.join(D, 'own_cue_' + cid + '.m4a')
        S.write(mid)
        sh(['fluidsynth', '-ni', '-q', '-g', '0.6', '-r', '44100', '-R', '1', '-C', '0', '-o', 'synth.reverb.room-size=0.6', '-o', 'synth.reverb.level=0.45',
            '-o', 'synth.reverb.width=0.8', '-o', 'synth.polyphony=256', '-F', wav, sf2, mid])
        sh(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-t', '%.2f' % (end + 1.6), '-af', 'highpass=f=40,treble=g=-3:f=5000,loudnorm=I=-16:TP=-1.5:LRA=9,afade=t=out:st=%.2f:d=0.6' % (end + 1.0),
            '-c:a', 'aac', '-b:a', '96k', '-ar', '44100', out])
        idx['own_cue_' + cid] = {'cue': 1, 'd': round(end + 1.6, 1), 'lic': 'CC0 — сочинено для игры', 'by': 'Тема «Автоимперии», оркестр (тембры ' + sfname.split(' (')[0] + ')'}
        LOG('anthem: cue', cid, round(end, 1), 's', round(os.path.getsize(out) / 1024), 'KB')
    json.dump(idx, open(os.path.join(D, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    import sys
    run(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(HERE)), 'media'))
