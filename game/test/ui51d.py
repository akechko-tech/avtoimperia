# 0.51, этап 9: разделы без длинной прокрутки (сверху выбор, ниже только выбранное) и счёт нажатий.
# Партия Форда до 1912 года (помощник ведёт рутину), затем: полосы подразделов, одна полоса стран в «Рынке»,
# переход по ссылке в спрятанный подраздел, хроника по частям и двадцать с лишним типичных действий —
# сколько нажатий до нужной кнопки и видна ли она без прокрутки.   python3 game/test/ui51d.py
from playwright.sync_api import sync_playwright
import os, json
out = '/home/claude/work/ui51d/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
FF = """(Y)=>{G.helper={on:true};const R=render;window.render=()=>{};let n=0;
  const clr=()=>{let g=0;while(G.pending.length&&g++<40){const ev=G.pending[0],K=(ev.choices||[['ok','ok']]).map(x=>x[1]);const k=K.includes('saga')?'saga':K.includes('tskip')?'tskip':(K.find(x=>!/^(reel:|go:)/.test(x))||'ok');try{if(k==='saga'){sagaAuto(G,ev.saga);G.pending.shift();}else resolve(k);}catch(e){G.pending.shift();}if(G.pending[0]===ev)G.pending.shift();}};
  clr();while(G.y<Y&&!G.over&&n++<400){if(G.cash<30000*cpi(G))G.cash+=60000*cpi(G);try{step();}catch(e){return {err:String(e),y:G.y};}clr();}
  window.render=R;try{closeSheet();}catch(_){};for(let i=0;i<6;i++)try{closePaper();}catch(_){};G.cash=Math.max(G.cash,400000);render();return {y:G.y,over:G.over,models:G.models.filter(m=>m.status==='prod').length};}"""
RESET = "(()=>{try{closeSheet();}catch(_){};for(let i=0;i<4;i++)try{closePaper();}catch(_){};G.pending=[];G.ui=G.ui||{};G.ui.sub={};delete G.ui.mk9;delete G.ui.mk9s;delete G.ui.mk9w;delete G.ui.dlrC;delete G.ui.mkC;delete G.ui.dealC;tab='plant';render();window.scrollTo(0,0);})()"
# видна ли цель в рабочей части экрана (между верхом и нижней полосой с «Следующий месяц»)
VIS = """(sel)=>{const e=(typeof sel==='string'&&sel.startsWith('js:'))?eval(sel.slice(3)):document.querySelector(sel);if(!e)return {no:1};const r=e.getBoundingClientRect(),nb=document.querySelector('[data-act=next]'),lim=(nb?nb.getBoundingClientRect().top:innerHeight)-44;
  let hid=false,fix=false;for(let p=e;p&&p!==document.body;p=p.parentElement){if(p.hidden){hid=true;break;}const ps=getComputedStyle(p).position;if(ps==='fixed'||ps==='sticky')fix=true;}
  /* кнопки нижней полосы (вкладки, «Следующий месяц») всегда на экране */const L=fix?innerHeight:lim;/* видна — значит на экране хотя бы 40 px её высоты (или вся, если она ниже) */return {top:Math.round(r.top),bot:Math.round(r.bottom),lim:Math.round(L),vis:!hid&&r.height>0&&r.top>=0&&r.top+Math.min(r.height,40)<=L,hid,txt:(e.textContent||'').trim().slice(0,40)};}"""
TAP = """(sel)=>{const e=(typeof sel==='string'&&sel.startsWith('js:'))?eval(sel.slice(3)):document.querySelector(sel);if(!e)return false;e.click();return true;}"""
T = lambda t: '.tab[data-t="%s"]' % t
S = lambda k: '[data-act=sub][data-k="%s"]' % k
C = lambda c: '[data-act=mk9][data-c="%s"]' % c
MS = lambda s: '[data-act=mk9][data-s="%s"]' % s
ACTS = [
    ('следующий месяц', [], '[data-act=next]'),
    ('выполнить совет из «Дел»', [], '.advisor [data-act=tip]'),
    ('цена модели', [T('models')], '.mcard [data-act=price]'),
    ('план выпуска', [T('models'), S('plan')], 'js:document.querySelector("#fc-planlist [data-act=plan]")||document.querySelector("#fc-planlist [data-act=planAuto]")||document.querySelector("#fc-planlist h2")'),
    ('новая модель', [T('models')], '[data-act=design]'),
    ('проект конструкторского бюро', [T('models'), S('rd')], '#fc-rdcard button'),
    ('построить цех', [S('cap')], '#fc-cap [data-act=capAdd]'),
    ('рабочие и жалованье', [S('ppl')], '#fc-staffc button'),
    ('расширить склад', [S('wh')], '#fc-wh [data-act=whAdd]'),
    ('внедрить технологию', [S('tech')], '#fc-techc button'),
    ('кредит', [S('fin')], '#fc-fin [data-act=loan]'),
    ('дилеры дома', [T('market'), MS('net')], '#fc-dealers [data-act=dealers]'),
    ('скидка дилерам', [T('market'), MS('net')], '#fc-dealers [data-act=dpol]'),
    ('импортёр в Германии', [T('market'), C('de')], '#fc-dealers [data-act=impUp]'),
    ('дилеры в Британии', [T('market'), C('uk'), MS('net')], '#fc-dealers [data-act=dealers]'),
    ('купить марку в Германии', [T('market'), C('de'), MS('deals')], '#fc-deals [data-act=dealOpen]'),
    ('доли рынка в мире', [T('market'), C('world'), MS('brands')], '#fc-shares table', 0),
    ('карта мира и пошлины', [T('market'), C('world')], '#sec-world', 0),
    ('заявить команду на гонку', [T('race')], '#fc-rcal button.btn'),
    ('команда и гонщики', [T('race'), S('team')], '#sec-team button'),
    ('мировые рекорды', [T('race'), S('rec')], '#sec-recs [data-act=recOpen]'),
    ('хроника', [T('log'), S('log')], '#fc-log ul.log li', 0),
    ('фильм о герое', [T('log'), S('film')], '#sec-saga .sg-li', 0),
    ('наследие и место', [T('log'), S('leg')], '#sec-legacy', 0),
]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=1)
    pg.set_default_timeout(240000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s, a=None: pg.evaluate(s, a) if a is not None else pg.evaluate(s)
    js("demoStop();hideMainMenu();newGame('ford','us','Форд Мотор','normal','Модель V');try{sagaStop();}catch(_){}")
    r = js(FF, 1912)
    ok(not r.get('err') and r.get('y') == 1912 and not r.get('over'), 'партия доведена до 1912 года: %s' % r)
    # длина подразделов
    js(RESET); tot = {}
    for t, subs in [('plant', ['sum', 'cap', 'ppl', 'wh', 'tech', 'fin']), ('models', ['plan', 'list', 'rd']), ('race', ['cal', 'champ', 'team', 'rec']), ('log', ['dom', 'leg', 'titles', 'troph', 'film', 'log'])]:
        for k in subs:
            js("tab='%s';subSet(G,'%s','%s');render();window.scrollTo(0,0)" % (t, t, k)); pg.wait_for_timeout(200)
            tot[t + '/' + k] = round(js("document.documentElement.scrollHeight") / 915, 1)
    for c, k in [('us', 'sales'), ('us', 'net'), ('us', 'deals'), ('de', 'sales'), ('de', 'net'), ('de', 'deals'), ('world', 'map'), ('world', 'brands'), ('world', 'misc')]:
        js("tab='market';mk9Set(G,'%s');mk9Set(G,null,'%s');render();window.scrollTo(0,0)" % (c, k)); pg.wait_for_timeout(200)
        tot['market/%s/%s' % (c, k)] = round(js("document.documentElement.scrollHeight") / 915, 1)
    print('    длина подразделов, экранов:', json.dumps(tot, ensure_ascii=False))
    long = {k: v for k, v in tot.items() if v > 3.5}
    ok(max(tot.values()) <= 4.5 and len(long) <= 2, 'ни одного подраздела длиннее четырёх с половиной экранов, длиннее трёх с половиной — не больше двух (списки гонок и чемпионатов зависят от года): %s (до правок: «Рынок» 5,7, «Гонки» 6,5, «Империя» 51)' % long)
    # одна полоса стран ведёт дилеров, доли и сделки
    js(RESET); js("tab='market';render()"); pg.wait_for_timeout(300)
    h = js("({bar:!!document.querySelector('#subbar [data-act=mk9][data-c=de]'),seg:document.querySelectorAll('#subbar .seg3 button').length,inner:[...document.querySelectorAll('.inner-cc,#fc-dealers .cc-chips')].filter(e=>e.offsetParent!==null).length})")
    ok(h['bar'] and h['seg'] == 3 and h['inner'] == 0, '«Рынок»: вверху полоса стран и «Продажи | Сеть | Сделки»; прежних переключателей стран внутри карточек не видно — %s' % h)
    js(TAP, C('de')); pg.wait_for_timeout(300)
    h = js("({c:G.ui.mk9,d:G.ui.dlrC,m:G.ui.mkC,l:G.ui.dealC,s:G.ui.mk9s,net:!document.getElementById('fc-dealers').hidden,home:document.getElementById('fc-mkhome').hidden,txt:document.getElementById('fc-dealers').textContent.includes('Германия')})")
    ok(h['c'] == 'de' and h['d'] == 'de' and h['m'] == 'de' and h['l'] == 'de' and h['s'] == 'net' and h['net'] and h['home'] and h['txt'], 'выбрали Германию: дилеры, доли и сделки — о Германии; там ещё нет продаж, поэтому сразу «Сеть» — %s' % h)
    pg.screenshot(path=out + 'rynok_germaniya.png')
    js(TAP, MS('deals')); pg.wait_for_timeout(300)
    h = js("({deals:!document.getElementById('fc-deals').hidden&&!document.getElementById('fc-deals').classList.contains('folded'),net:document.getElementById('fc-dealers').hidden,de:/Opel|Benz|Adler|Daimler/.test(document.getElementById('fc-deals').textContent)})")
    ok(h['deals'] and h['net'] and h['de'], '«Сделки»: раскрыта карточка сделок с немецкими марками, остальное спрятано — %s' % h)
    js(TAP, C('world')); pg.wait_for_timeout(300)
    h = js("({seg:[...document.querySelectorAll('#subbar .seg3 button')].map(b=>b.textContent),world:!document.getElementById('sec-world').hidden,sh:document.getElementById('fc-shares').hidden,deal:document.getElementById('fc-deals').hidden})")
    ok(h['seg'] == ['Страны', 'Марки', 'Выставки и графики'] and h['world'] and h['sh'] and h['deal'], '«Обзор»: «Страны | Марки | Выставки и графики», первой — карта мира — %s' % h)
    js(TAP, MS('brands')); pg.wait_for_timeout(300)
    h = js("({sh:!document.getElementById('fc-shares').hidden,world:document.getElementById('sec-world').hidden,w:/во всём мире/.test(document.getElementById('fc-shares').textContent)})")
    ok(h['sh'] and h['world'] and h['w'], '«Обзор → Марки»: доли рынка по всему миру — %s' % h)
    # ссылка в спрятанный подраздел открывает его
    js(RESET); js("ACT.tab({t:'log',sec:'sec-saga'})"); pg.wait_for_timeout(300)
    h = js("({sub:subSel(G,'log'),vis:!document.getElementById('sec-saga').hidden})")
    ok(h['sub'] == 'film' and h['vis'], 'ссылка на фильм из другой вкладки открывает «Империя → Фильм и газеты» — %s' % h)
    js(RESET); js("ACT.go({t:'plant',id:'fc-fin'})"); pg.wait_for_timeout(300)
    ok(js("subSel(G,'plant')==='fin'&&!document.getElementById('fc-fin').hidden"), 'ссылка на «Финансы» открывает подраздел «Финансы» на «Заводе»')
    js(RESET); js("tab='market';mk9Set(G,'world');render();ACT.go({t:'market',id:'fc-dealers'})"); pg.wait_for_timeout(300)
    ok(js("mk9C(G)===G.country&&mk9S(G)==='net'&&!document.getElementById('fc-dealers').hidden"), 'ссылка на дилеров из «Обзора» открывает «свою страну → Сеть»')
    # хроника по частям
    js(RESET); js("tab='log';subSet(G,'log','log');render()"); pg.wait_for_timeout(300)
    h = js("({n:document.querySelectorAll('#fc-log ul.log li').length,all:G.log.length,more:!!document.querySelector('[data-act=logMore]')})")
    ok(h['n'] == 15 and h['all'] > 15 and h['more'], 'хроника: показаны последние 15 записей из %d, остальное — по кнопке' % h['all'])
    js(TAP, '[data-act=logMore]'); pg.wait_for_timeout(300)
    ok(js("document.querySelectorAll('#fc-log ul.log li').length") == min(215, h['all']), '«Показать ещё» добавляет 200 записей')
    # счёт нажатий: до нужной кнопки и видна ли она без прокрутки
    print('    действие — нажатий до кнопки (с нажатием на неё) — видна без прокрутки')
    bad = []; far = []; rows = []
    for A in ACTS:
        name, path, target = A[0], A[1], A[2]; press = A[3] if len(A) > 3 else 1   # press=0 — цель не кнопка, а сведения: их достаточно увидеть
        js(RESET); pg.wait_for_timeout(150); miss = False
        for sel in path:
            v = js(VIS, sel)
            if v.get('no') or not v.get('vis'): miss = True; rows.append((name, len(path), press, 'шаг не виден: ' + sel + ' ' + json.dumps(v, ensure_ascii=False))); break
            js(TAP, sel); pg.wait_for_timeout(250)
        if miss: bad.append(name); continue
        v = js(VIS, target)
        rows.append((name, len(path), press, 'да' if v.get('vis') else ('НЕТ: ' + json.dumps(v, ensure_ascii=False))))
        if not v.get('vis'): bad.append(name)
        if len(path) + press > 3: far.append(name)
    for r in rows: print('      %-30s %d (%d)   %s' % (r[0], r[1], r[1] + r[2], r[3]))
    ok(not bad, 'все цели видны без прокрутки' + (': не видны — ' + ', '.join(bad) if bad else ' (%d действий)' % len(ACTS)))
    ok(len(far) <= 2, 'не больше трёх нажатий вместе с нажатием на кнопку; исключения — четыре нажатия при первом заходе в чужую страну (выбор «Сеть»/«Сделки» запоминается): %s' % (far or 'нет'))
    ok(not errs, 'ошибок на странице нет' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ok' if not fails else 'FAILED %d' % fails)
