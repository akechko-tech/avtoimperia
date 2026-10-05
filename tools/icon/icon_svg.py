#!/usr/bin/env python3
# Иконка «Автоимперии»: латунный медальон с лавровым венком и короной, внутри — гоночный автомобиль 1900-х на фоне заката.
import math, sys
def f(x): return ('%.2f'%x).rstrip('0').rstrip('.')

def car(mono=False):
    """Гоночный автомобиль ~1908 г. в профиль (вправо). Координаты: x 0..300 (зад→перед), y=0 — земля, вверх отрицательно."""
    def wheel(cx,cy,r):
        sp=''.join('<line x1="%s" y1="%s" x2="%s" y2="%s"/>'%(f(cx+math.cos(a)*6),f(cy+math.sin(a)*6),f(cx+math.cos(a)*(r-9)),f(cy+math.sin(a)*(r-9)))
                   for a in [i*math.pi/6+0.13 for i in range(12)])
        if mono:
            return (f'<circle cx="{cx}" cy="{cy}" r="{r-4.5}" fill="none" stroke="#fff" stroke-width="9"/>'
                    f'<g stroke="#fff" stroke-width="3.6" stroke-linecap="round">{sp}</g><circle cx="{cx}" cy="{cy}" r="9" fill="#fff"/>')
        return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#10141c"/>'
                f'<circle cx="{cx}" cy="{cy}" r="{r-8}" fill="none" stroke="url(#gRim)" stroke-width="4"/>'
                f'<g stroke="url(#gRim)" stroke-width="3.2" stroke-linecap="round">{sp}</g>'
                f'<circle cx="{cx}" cy="{cy}" r="8" fill="url(#gRim)"/><circle cx="{cx}" cy="{cy}" r="3" fill="#5a3d12"/>'
                f'<path d="M{f(cx-r+3)},{cy} A{r-3},{r-3} 0 0 1 {f(cx+r-3)},{cy}" fill="none" stroke="#2b3240" stroke-width="2.4"/>')
    s=[]
    if mono:
        s.append('<circle cx="34" cy="-88" r="26.5" fill="none" stroke="#fff" stroke-width="9"/><circle cx="40" cy="-86" r="15" fill="#fff"/>')
        s.append('<path d="M14,-60 L286,-60 L286,-50 L14,-52 Z" fill="#fff"/>')
        s.append('<path d="M62,-62 L62,-92 Q64,-100 74,-100 L96,-100 Q100,-112 110,-112 L118,-112 Q122,-104 128,-98 L152,-97 L266,-90 Q276,-89 276,-80 L276,-62 Z" fill="#fff"/>')
        s.append('<rect x="272" y="-100" width="15" height="44" rx="3" fill="#fff"/>')
        s.append('<path d="M92,-100 Q90,-122 104,-126 Q116,-124 116,-104 Z" fill="#fff"/><circle cx="104" cy="-133" r="12" fill="#fff"/>')
        s.append('<path d="M120,-98 Q118,-124 134,-130 Q148,-128 148,-106 L150,-98 Z" fill="#fff"/><circle cx="138" cy="-140" r="13" fill="#fff"/>')
        s.append('<path d="M128,-126 Q108,-128 92,-138 Q78,-146 60,-140 Q76,-138 88,-130 Q104,-120 126,-120 Z" fill="#fff"/>')
        s.append('<ellipse cx="160" cy="-122" rx="4" ry="12" fill="none" stroke="#fff" stroke-width="3.4" transform="rotate(-18 160 -122)"/>')
        s.append(wheel(70,-42,42)); s.append(wheel(236,-42,42))
        return ''.join(s)
    # тень
    s.append('<ellipse cx="150" cy="2" rx="150" ry="9" fill="#000" opacity=".35"/>')
    # запасные колёса и бак сзади
    s.append('<circle cx="34" cy="-88" r="31" fill="#10141c"/><circle cx="34" cy="-88" r="22" fill="none" stroke="#2b3240" stroke-width="3"/>')
    s.append('<circle cx="40" cy="-86" r="21" fill="url(#gTank)"/><path d="M24,-95 A21,21 0 0 1 52,-101" fill="none" stroke="#fff3cf" stroke-width="3" stroke-linecap="round" opacity=".7"/>')
    s.append('<rect x="38" y="-110" width="5" height="48" rx="2" fill="#5a3d12" opacity=".8"/>')
    # рама
    s.append('<path d="M14,-60 L286,-60 L286,-50 L14,-52 Z" fill="#1a1f2a"/>')
    # кузов: кокпит + капот (одна форма)
    s.append('<path d="M62,-62 L62,-92 Q64,-100 74,-100 L96,-100 Q100,-112 110,-112 L118,-112 Q122,-104 128,-98 L152,-97 L266,-90 Q276,-89 276,-80 L276,-62 Z" fill="url(#gBody)"/>')
    s.append('<path d="M152,-96 L266,-89" stroke="#ff8a7a" stroke-width="3" stroke-linecap="round" opacity=".75"/>')
    s.append('<path d="M70,-66 L272,-66" stroke="#4d0c14" stroke-width="3" opacity=".7"/>')
    # жалюзи капота
    s.append('<g stroke="#5d0f18" stroke-width="2.6" stroke-linecap="round" opacity=".8">'+''.join(f'<line x1="{x}" y1="-86" x2="{x-3}" y2="-72"/>' for x in range(222,262,8))+'</g>')
    # номерной круг
    s.append('<circle cx="186" cy="-78" r="13" fill="#f4ecd8" stroke="#1a1f2a" stroke-width="2"/><text x="186" y="-72.5" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="17" fill="#1a1f2a">7</text>')
    # радиатор
    s.append('<rect x="272" y="-100" width="15" height="44" rx="3" fill="url(#gRim)"/><g stroke="#6b4a16" stroke-width="1.2" opacity=".85">'+''.join(f'<line x1="275" y1="{y}" x2="284" y2="{y}"/>' for y in range(-95,-58,5))+'</g>')
    # выхлопная труба
    s.append('<path d="M250,-64 Q236,-56 210,-56 L104,-56 Q92,-56 86,-50" fill="none" stroke="url(#gRim)" stroke-width="5" stroke-linecap="round"/>')
    # механик (сзади, пригнулся) и пилот
    s.append('<path d="M92,-100 Q90,-122 104,-126 Q116,-124 116,-104 Z" fill="#3a2a1d"/>')
    s.append('<circle cx="104" cy="-131" r="11" fill="#d9a77e"/><path d="M92,-133 Q94,-147 106,-146 Q117,-144 116,-132 Z" fill="#4a3220"/><rect x="99" y="-135" width="15" height="5" rx="2.5" fill="#bfe0ea" stroke="#3a2a1d" stroke-width="1"/>')
    s.append('<path d="M120,-98 Q118,-124 134,-130 Q148,-128 148,-106 L150,-98 Z" fill="#2f2419"/>')
    s.append('<circle cx="138" cy="-138" r="12" fill="#e0b48c"/><path d="M125,-140 Q127,-156 140,-155 Q152,-153 151,-139 Z" fill="#3a2718"/><rect x="134" y="-143" width="17" height="6" rx="3" fill="#cfeaf2" stroke="#2f2419" stroke-width="1.2"/>')
    # шарф пилота развевается назад
    s.append('<path d="M128,-126 Q108,-128 92,-138 Q78,-146 60,-140 Q76,-138 88,-130 Q104,-120 126,-120 Z" fill="#f2efe4"/>')
    # руль и рука
    s.append('<line x1="160" y1="-122" x2="156" y2="-100" stroke="#1a1f2a" stroke-width="4" stroke-linecap="round"/><ellipse cx="160" cy="-122" rx="4" ry="12" fill="none" stroke="#1a1f2a" stroke-width="3.4" transform="rotate(-18 160 -122)"/>')
    s.append('<path d="M140,-120 Q152,-122 160,-118" fill="none" stroke="#2f2419" stroke-width="7" stroke-linecap="round"/>')
    # колёса
    s.append(wheel(70,-42,42)); s.append(wheel(236,-42,42))
    return ''.join(s)

VARIANT='break'
DEFS='''<defs>
<radialGradient id="gBg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#24476f"/><stop offset=".55" stop-color="#0f2239"/><stop offset="1" stop-color="#060d17"/></radialGradient>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#132a46"/><stop offset=".42" stop-color="#7b4a5a"/><stop offset=".7" stop-color="#e08a4c"/><stop offset=".86" stop-color="#f6cf8a"/><stop offset="1" stop-color="#f6cf8a"/></linearGradient>
<radialGradient id="gSun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff7dc"/><stop offset=".45" stop-color="#ffe6a6"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<linearGradient id="gRing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3cf"/><stop offset=".3" stop-color="#e8c56f"/><stop offset=".62" stop-color="#b3832f"/><stop offset="1" stop-color="#6e4b17"/></linearGradient>
<linearGradient id="gRing2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff3cf"/><stop offset=".35" stop-color="#e2bd62"/><stop offset="1" stop-color="#7a5419"/></linearGradient>
<linearGradient id="gRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0bf"/><stop offset=".5" stop-color="#e2bd62"/><stop offset="1" stop-color="#9a6d24"/></linearGradient>
<linearGradient id="gTank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc93"/><stop offset=".55" stop-color="#c99a3e"/><stop offset="1" stop-color="#7a5419"/></linearGradient>
<linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2453f"/><stop offset=".5" stop-color="#b8222c"/><stop offset="1" stop-color="#6e1019"/></linearGradient>
<linearGradient id="gRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b07a"/><stop offset="1" stop-color="#9c7448"/></linearGradient>
<linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0bf"/><stop offset=".5" stop-color="#d9ab52"/><stop offset="1" stop-color="#8a6224"/></linearGradient>
<clipPath id="cIn"><circle cx="0" cy="0" r="176"/></clipPath>
</defs>'''

def laurel(side):
    """Лавровая ветвь вдоль кольца: от низа (угол 100°) вверх до ~210° (слева) — для правой стороны зеркально."""
    s=[];R=226
    a0,a1=math.radians(104),math.radians(218)
    # стебель
    pts=[(R*math.cos(a0+(a1-a0)*t),R*math.sin(a0+(a1-a0)*t)) for t in [i/24 for i in range(25)]]
    s.append('<path d="M'+' L'.join(f(x)+','+f(y) for x,y in pts)+'" fill="none" stroke="url(#gRing)" stroke-width="4" stroke-linecap="round"/>')
    n=12
    for k in range(n):
        t=(k+0.5)/n;a=a0+(a1-a0)*t;x,y=R*math.cos(a),R*math.sin(a)
        tang=math.degrees(a)+90  # направление роста (против часовой — вверх по левой стороне)
        sz=1-0.4*t
        for sd in (-1,1):
            ang=tang+sd*42-(14 if sd>0 else 0)
            L=30*sz;W=11*sz
            cx=x+math.cos(math.radians(ang))*L*0.55;cy=y+math.sin(math.radians(ang))*L*0.55
            s.append(f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(L*0.55)}" ry="{f(W*0.55)}" transform="rotate({f(ang)} {f(cx)} {f(cy)})" fill="url(#gLeaf)" stroke="#5a3d12" stroke-width="1.2"/>')
    # верхний лист
    a=a1;x,y=R*math.cos(a),R*math.sin(a);ang=math.degrees(a)+90;L=20
    cx=x+math.cos(math.radians(ang))*L*0.5;cy=y+math.sin(math.radians(ang))*L*0.5
    s.append(f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(L*0.55)}" ry="5" transform="rotate({f(ang)} {f(cx)} {f(cy)})" fill="url(#gLeaf)" stroke="#5a3d12" stroke-width="1.2"/>')
    g=''.join(s)
    return g if side<0 else f'<g transform="scale(-1,1)">{g}</g>'

def crown():
    return ('<g transform="translate(0,-212)">'
            '<path d="M-34,10 L-38,-22 L-20,-6 L0,-30 L20,-6 L38,-22 L34,10 Z" fill="url(#gRing)" stroke="#5a3d12" stroke-width="2.4" stroke-linejoin="round"/>'
            '<rect x="-36" y="6" width="72" height="11" rx="3" fill="url(#gRing2)" stroke="#5a3d12" stroke-width="2.4"/>'
            '<circle cx="0" cy="-32" r="5.5" fill="#fff3cf" stroke="#5a3d12" stroke-width="2"/><circle cx="-38" cy="-24" r="4.5" fill="#fff3cf" stroke="#5a3d12" stroke-width="2"/><circle cx="38" cy="-24" r="4.5" fill="#fff3cf" stroke="#5a3d12" stroke-width="2"/>'
            '<circle cx="0" cy="11.5" r="3.2" fill="#b8222c"/><circle cx="-20" cy="11.5" r="2.6" fill="#1f5fa8"/><circle cx="20" cy="11.5" r="2.6" fill="#1f5fa8"/></g>')

def emblem(mono=False,variant=VARIANT):
    """Медальон с центром в (0,0); внешний радиус с венком ≈ 238, корона до y≈-250."""
    scene=('<g clip-path="url(#cIn)">'
           '<rect x="-180" y="-180" width="360" height="360" fill="url(#gSky)"/>'
           '<circle cx="40" cy="-30" r="110" fill="url(#gSun)"/><circle cx="40" cy="-30" r="52" fill="#fff4d2"/>'
           # дальние холмы и тополя
           '<path d="M-180,52 Q-120,22 -60,38 T60,34 T180,42 L180,180 L-180,180 Z" fill="#2c3d4f"/>'
           + ''.join(f'<ellipse cx="{x}" cy="{38-h*0.5}" rx="{f(h*0.16)}" ry="{f(h*0.5)}" fill="#22303f"/>' for x,h in [(-150,44),(-118,58),(-88,40),(-40,34),(110,50),(140,62),(168,44)])
           + '<path d="M-180,66 L180,66 L180,180 L-180,180 Z" fill="#1d2a38"/>'
           '<path d="M-180,74 L180,74 L180,180 L-180,180 Z" fill="url(#gRoad)"/>'
           '<path d="M-180,76 L180,76" stroke="#f3d9a6" stroke-width="2" opacity=".6"/>'
           # пыль и линии скорости
           ''
           ''
           +(f'<g transform="translate(-136,92) scale(0.9)">{car()}</g>' if variant=='inside' else '')
           +'</g>')
    ring=('<circle cx="0" cy="0" r="198" fill="none" stroke="url(#gRing)" stroke-width="26"/>'
          '<circle cx="0" cy="0" r="185" fill="none" stroke="#5a3d12" stroke-width="2.4"/>'
          '<circle cx="0" cy="0" r="211" fill="none" stroke="#5a3d12" stroke-width="2.4"/>'
          '<circle cx="0" cy="0" r="176.5" fill="none" stroke="#2a1c08" stroke-width="3"/>'
          + ''.join(f'<circle cx="{f(198*math.cos(a))}" cy="{f(198*math.sin(a))}" r="3.4" fill="#fff3cf" stroke="#6e4b17" stroke-width="1"/>' for a in [math.radians(i*15) for i in range(24)] if not (225<=math.degrees(a)<=315)))
    ribbon=('<g transform="translate(0,214)"><path d="M-30,-8 L-58,26 L-44,26 L-36,40 L-14,6 Z M30,-8 L58,26 L44,26 L36,40 L14,6 Z" fill="#a51f2a" stroke="#4d0c14" stroke-width="2"/>'
            '<circle cx="0" cy="0" r="14" fill="url(#gRing)" stroke="#5a3d12" stroke-width="2.4"/></g>')
    dust=('<g fill="#f1dfb8"><circle cx="-190" cy="96" r="22" opacity=".95"/><circle cx="-168" cy="106" r="15" opacity=".95"/><circle cx="-214" cy="102" r="16" opacity=".8"/><circle cx="-234" cy="108" r="11" opacity=".65"/><circle cx="-250" cy="112" r="7" opacity=".5"/></g>'
          '<g stroke="#fff0c0" stroke-width="5" stroke-linecap="round" opacity=".9"><line x1="-250" y1="20" x2="-200" y2="20"/><line x1="-262" y1="44" x2="-214" y2="44"/><line x1="-246" y1="68" x2="-206" y2="68"/></g>')
    top=(dust+f'<g transform="translate(-178,110) scale(1.17)">{car()}</g>') if variant=='break' else ''
    if mono:
        top=(dust+f'<g transform="translate(-178,110) scale(1.17)">{car(True)}</g>')
        return '<g style="filter:url(#fMono)">'+laurel(-1)+laurel(1)+ring+ribbon+crown()+dust+'</g>'+f'<g transform="translate(-178,110) scale(1.17)">{car(True)}</g>'
    g=laurel(-1)+laurel(1)+ring+scene+ribbon+crown()+top
    return g

def svg(size, kind):
    """kind: 'square' (полный квадрат, iOS/legacy), 'round' (круглая legacy), 'rounded' (скруглённый квадрат, PWA any),
       'fg' (адаптивная: передний слой), 'bg' (адаптивная: фон), 'maskable', 'mono' (силуэт для тем Android 13)."""
    V=512
    bg=('<rect width="512" height="512" fill="url(#gBg)"/>'
        '<g transform="translate(256,262)" opacity=".09">'+''.join(
            f'<path d="M0,0 L{f(600*math.cos(math.radians(a-2.4)))},{f(600*math.sin(math.radians(a-2.4)))} L{f(600*math.cos(math.radians(a+2.4)))},{f(600*math.sin(math.radians(a+2.4)))} Z" fill="#e2c47a"/>'
            for a in range(0,360,15))+'</g>'
        '<rect width="512" height="512" fill="url(#gVig)"/>')
    vig='<radialGradient id="gVig" cx="50%" cy="50%" r="72%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>'
    defs=DEFS.replace('</defs>',vig+'</defs>')
    def em(scale,dy=0): return f'<g transform="translate(256,{f(256+dy)}) scale({f(scale)})">{emblem()}</g>'
    if kind=='square': body=bg+em(0.92,8)
    elif kind=='rounded': body=f'<clipPath id="cR"><rect width="512" height="512" rx="112"/></clipPath><g clip-path="url(#cR)">{bg}{em(0.88,8)}</g>'
    elif kind=='round': body=f'<clipPath id="cC"><circle cx="256" cy="256" r="256"/></clipPath><g clip-path="url(#cC)">{bg}{em(0.86,8)}</g>'
    elif kind=='maskable': body=bg+em(0.74,6)
    elif kind=='bg': body=bg
    elif kind=='fg': body=em(0.6,5)
    elif kind=='mono': body=f'<g transform="translate(256,261) scale(0.6)">{emblem(True)}</g>'
    else: raise SystemExit(kind)
    if kind=='mono':
        defs=defs.replace('</defs>','<filter id="fMono"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter></defs>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {V} {V}">{defs}{body}</svg>'

if __name__=='__main__':
    for k in ('square','rounded','round','maskable','bg','fg','mono'):
        open(f'{k}.svg','w').write(svg(512,k))
    print('ok')
