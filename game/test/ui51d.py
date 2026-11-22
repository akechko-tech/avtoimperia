# Навигация по вкладкам. 0.51 (этап 9) ввёл подразделы с полосами кнопок; отзыв автора на 0.51 (23 ноября): «количество кнопок
# запутало, листать вниз было удобнее; два-три подразделения максимум и только по необходимости». С 0.60: «Завод», «Модели»,
# «Гонки» — одна страница; «Империя» — два подраздела; «Рынок» — одна полоса стран, под страной всё подряд.
# Партия Форда до 1912 года (помощник ведёт рутину), затем проверки.   python3 game/test/ui51d.py
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
TAP = """(sel)=>{const e=document.querySelector(sel);if(!e)return false;e.click();return true;}"""
C = lambda c: '[data-act=mk9][data-c="%s"]' % c
SHOWN = """(ids)=>{const o={};ids.forEach(id=>{const e=document.getElementById(id);o[id]=!e?'нет':e.hidden?'спрятана':'видна';});return o;}"""
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
    # «Завод», «Модели», «Гонки» — одна страница без полосы кнопок: все карточки на месте, сворачиваются как раньше
    for t, ids in [('plant', ['fc-cap', 'fc-staffc', 'fc-techc', 'fc-fin', 'fc-wh']), ('models', ['fc-planlist', 'fc-rdcard']), ('race', ['fc-rcal', 'sec-team', 'sec-recs'])]:
        js(RESET); js("tab='%s';render();window.scrollTo(0,0)" % t); pg.wait_for_timeout(300)
        h = js("({bar:!!document.getElementById('subbar'),sub:document.querySelectorAll('[data-act=sub]').length,nofold:document.querySelectorAll('#view .card.nofold').length,screens:Math.round(document.documentElement.scrollHeight/915*10)/10})")
        sh = js(SHOWN, ids)
        ok(not h['bar'] and h['sub'] == 0 and h['nofold'] == 0 and all(v == 'видна' for v in sh.values()), '«%s»: полосы подразделов нет, все карточки на одной странице (%s экр.) — %s' % ({'plant': 'Завод', 'models': 'Модели', 'race': 'Гонки'}[t], h['screens'], sh))
    js(RESET); js("tab='plant';render()"); pg.wait_for_timeout(200); pg.screenshot(path=out + 'zavod.png')
    # карточку можно свернуть и развернуть
    js("setOpen('fin',true);render()"); pg.wait_for_timeout(200); a = js("!document.getElementById('fc-fin').classList.contains('folded')")
    js(TAP, '#fc-fin > .card-h'); pg.wait_for_timeout(300); c2 = js("document.getElementById('fc-fin').classList.contains('folded')")
    ok(a and c2, '«Финансы» на «Заводе» сворачиваются нажатием на заголовок, как до 0.51')
    # «Империя»: два подраздела
    js(RESET); js("tab='log';render();window.scrollTo(0,0)"); pg.wait_for_timeout(300)
    h = js("({chips:[...document.querySelectorAll('#subbar [data-act=sub]')].map(b=>b.textContent.trim()),sel:subSel(G,'log')})"); sh = js(SHOWN, ['sec-legacy', 'sec-titles', 'sec-trophies', 'sec-saga', 'fc-log'])
    ok(h['chips'] == ['Империя', 'Фильм и хроника'] and h['sel'] == 'emp' and sh['sec-legacy'] == 'видна' and sh['sec-titles'] == 'видна' and sh['sec-saga'] == 'спрятана' and sh['fc-log'] == 'спрятана', '«Империя»: два подраздела; в первом — наследие, титулы, трофеи — %s %s' % (h, sh))
    js(TAP, '[data-act=sub][data-k="film"]'); pg.wait_for_timeout(300); sh = js(SHOWN, ['sec-legacy', 'sec-saga', 'fc-log'])
    ok(sh['sec-saga'] == 'видна' and sh['fc-log'] == 'видна' and sh['sec-legacy'] == 'спрятана', '«Фильм и хроника»: фильм, газеты и хроника — %s' % sh)
    # «Рынок»: одна полоса стран, под страной — всё подряд
    js(RESET); js("tab='market';render()"); pg.wait_for_timeout(300)
    h = js("({bar:!!document.querySelector('#subbar [data-act=mk9][data-c=de]'),seg:document.querySelectorAll('#subbar .seg3 button').length,inner:[...document.querySelectorAll('.inner-cc,#fc-dealers .cc-chips')].filter(e=>e.offsetParent!==null).length})")
    sh = js(SHOWN, ['fc-mkhome', 'fc-dealers', 'fc-deals', 'sec-world'])
    ok(h['bar'] and h['seg'] == 0 and h['inner'] == 0 and sh['fc-mkhome'] == 'видна' and sh['fc-dealers'] == 'видна' and sh['fc-deals'] == 'видна' and sh['sec-world'] == 'спрятана', '«Рынок», своя страна: вверху только полоса стран; продажи, сеть и сделки — подряд на одной странице — %s %s' % (h, sh))
    js(TAP, C('de')); pg.wait_for_timeout(300)
    h = js("({c:G.ui.mk9,d:G.ui.dlrC,m:G.ui.mkC,l:G.ui.dealC,txt:document.getElementById('fc-dealers').textContent.includes('Германия'),de:/Opel|Benz|Adler|Daimler/.test(document.getElementById('fc-deals').textContent),screens:Math.round(document.documentElement.scrollHeight/915*10)/10})")
    sh = js(SHOWN, ['fc-mkhome', 'fc-dealers', 'fc-deals', 'fc-shares'])
    ok(h['c'] == 'de' and h['d'] == 'de' and h['m'] == 'de' and h['l'] == 'de' and h['txt'] and h['de'] and sh['fc-dealers'] == 'видна' and sh['fc-deals'] == 'видна' and sh['fc-mkhome'] == 'спрятана', 'выбрали Германию: её сеть и сделки с немецкими марками на одной странице (%s экр.), домашних карточек нет — %s %s' % (h['screens'], h, sh))
    pg.screenshot(path=out + 'rynok_germaniya.png')
    js(TAP, C('world')); pg.wait_for_timeout(300); sh = js(SHOWN, ['sec-world', 'fc-shares', 'fc-dealers', 'fc-deals'])
    ok(sh['sec-world'] == 'видна' and sh['fc-shares'] == 'видна' and sh['fc-dealers'] == 'спрятана' and sh['fc-deals'] == 'спрятана' and js("/во всём мире/.test(document.getElementById('fc-shares').textContent)"), '«Обзор»: карта стран и доли марок по миру подряд; сети и сделок нет — %s' % sh)
    # ссылка в спрятанный подраздел открывает его
    js(RESET); js("ACT.tab({t:'log',sec:'sec-saga'})"); pg.wait_for_timeout(300)
    h = js("({sub:subSel(G,'log'),vis:!document.getElementById('sec-saga').hidden})")
    ok(h['sub'] == 'film' and h['vis'], 'ссылка на фильм из другой вкладки открывает «Империя → Фильм и хроника» — %s' % h)
    js(RESET); js("ACT.go({t:'plant',id:'fc-fin'})"); pg.wait_for_timeout(300)
    ok(js("tab==='plant'&&!document.getElementById('fc-fin').hidden"), 'ссылка на «Финансы» ведёт на «Завод», карточка на месте')
    js(RESET); js("tab='market';mk9Set(G,'world');render();ACT.go({t:'market',id:'fc-dealers'})"); pg.wait_for_timeout(300)
    ok(js("mk9C(G)===G.country&&!document.getElementById('fc-dealers').hidden"), 'ссылка на дилеров из «Обзора» открывает свою страну')
    # хроника по частям
    js(RESET); js("tab='log';subSet(G,'log','film');render()"); pg.wait_for_timeout(300)
    h = js("({n:document.querySelectorAll('#fc-log ul.log li').length,all:G.log.length,more:!!document.querySelector('[data-act=logMore]')})")
    ok(h['n'] == 15 and h['all'] > 15 and h['more'], 'хроника: показаны последние 15 записей из %d, остальное — по кнопке' % h['all'])
    js(TAP, '[data-act=logMore]'); pg.wait_for_timeout(300)
    ok(js("document.querySelectorAll('#fc-log ul.log li').length") == min(215, h['all']), '«Показать ещё» добавляет 200 записей')
    ok(not errs, 'ошибок на странице нет' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ok' if not fails else 'FAILED %d' % fails)
