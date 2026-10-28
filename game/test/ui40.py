# 0.40: проверки в браузере — сводка месяца по направлениям наверху «Завода» и «Ангара»; в газете об аэроплане — аэроплан;
# карточка рынка США при своём бренде — без «Сборки из комплектов»; выкуп на «Юном» — «Отказаться» первым.
# python3 game/test/ui40.py
from playwright.sync_api import sync_playwright
import os, json
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui40/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    pg.set_default_timeout(180000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();")
    # 1) автомобильная фирма: сводка наверху «Завода» до и после первого месяца
    js("newGame('renault','fr','','normal','');G.pending=[];tab='plant';render()"); pg.wait_for_timeout(300)
    t = js("document.querySelector('.sumc') ? document.querySelector('.sumc').textContent : ''")
    ok('Итоги месяца' in t and 'первый месяц впереди' in t, 'до первого хода — карточка «Итоги месяца» с кассой: ' + t[:60])
    top = js("(()=>{const v=document.getElementById('view');const L=[...v.children].map(e=>e.className.split(' ')[0]);return L.slice(0,4).join(',');})()")
    ok(js("[...document.getElementById('view').children].findIndex(e=>e.classList.contains('sumc'))") <= 1, 'сводка — сразу под картинкой завода (' + top + ')')
    for i in range(2):
        js("G.pending=[];doStep();"); pg.wait_for_timeout(500)
        js("for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];tab='plant';render()"); pg.wait_for_timeout(300)
    t = js("document.querySelector('.sumc') ? document.querySelector('.sumc').textContent : ''")
    r = json.loads(js("JSON.stringify({made:G.last.made,sold:G.last.sold,rev:Math.round(G.last.rev),label:G.last.label})"))
    ok('Автомобили' in t and 'Сделано' in t and 'Продано' in t and 'Выручка' in t, 'после хода: строка «Автомобили» со сделано/продано/выручкой (%s: сделано %d, продано %d)' % (r['label'], r['made'], r['sold']))
    ok(('%d' % r['made']) in t.replace(' ', '').replace(' ', ''), 'число сделанных машин из отчёта стоит в сводке')
    js("try{sagaStop();}catch(_){};render()"); pg.wait_for_timeout(300)
    pg.screenshot(path=out + '1_summary.png')
    # 2) авиатор: «Ангар» — та же сводка со строкой «Аэропланы» и славой
    js("newAirGame('bleriot','fr','','normal','');G.pending=[];tab='plant';render()")
    pg.wait_for_timeout(1200)
    js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];tab='plant';render()"); pg.wait_for_timeout(300)
    isAir = js("!!(G.air&&G.air.lv>0)")
    for i in range(2):
        js("G.pending=[];doStep();"); pg.wait_for_timeout(500)
        js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];tab='plant';render()"); pg.wait_for_timeout(300)
    t = js("document.querySelector('.sumc') ? document.querySelector('.sumc').textContent : ''")
    ok(isAir and 'Аэропланы' in t and 'Слава' in t, 'ангар авиатора: сводка со строкой «Аэропланы» и славой')
    pg.screenshot(path=out + '2_hangar.png')
    # 3) газета об аэроплане — рисунок аэроплана, не автомобиль
    js("""(()=>{const md=G.air.models[0];md.status='prod';showPaper({own:1,airId:md.id,kicker:'Небо',title:'Перелёт через Ла-Манш',deck:'проверка',text:'Текст заметки.'},false);})()"""); pg.wait_for_timeout(400)
    ok(js("!!document.querySelector('#paperWrap .p-fig.p-air svg')") and not js("!!document.querySelector('#paperWrap .p-fig:not(.p-air)')"), 'в газете о перелёте — аэроплан (svg в .p-air), автомобиля нет')
    pg.screenshot(path=out + '3_paper_air.png')
    js("closePaper()")
    js("""showPaper({own:1,noArt:1,kicker:'Авиацех',title:'Конкурс объявлен',text:'Текст.'},false)"""); pg.wait_for_timeout(300)
    ok(not js("!!document.querySelector('#paperWrap figure')"), 'заметка без машины (noArt) — без рисунка')
    js("closePaper()")
    # 4) рынок США при своём бренде: «Сборка из комплектов» не предлагается
    js("newGame('renault','fr','','normal','');G.pending=[];G.cash=5e6;")
    r2 = json.loads(js("""(()=>{const s=G;const cp=(COMPS.us||[]).find(c=>!c.imp)||COMPS.us[0];const i=COMPS.us.indexOf(cp);s.hold=s.hold||[];s.hold.push({c:'us',i,n:cp.n,nm:cp.n,mode:'int',st:1,at:mi(s)});
      s.imp=s.imp||{};s.imp.us=2;s.dealers.us=Math.max(s.dealers.us||0,6);s.y=1912;return JSON.stringify({n:cp.n,own:+!!intIn(s,'us'),lv:impLv(s,'us')});})()"""))
    js("tab='market';G.ui=G.ui||{};G.ui.dlrC='us';setOpen('net_us',true);render()"); pg.wait_for_timeout(400)
    t = js("document.getElementById('view').textContent")
    btns = js("[...document.querySelectorAll('[data-act=impUp][data-c=us]')].map(b=>b.textContent)")
    ok(r2['own'] == 1 and r2['lv'] == 2, 'поглощённая марка «%s» в США: своё производство (intIn), уровень «Своё отделение»' % r2['n'])
    ok(not btns and 'как у Ford' not in t and 'здесь не нужны' in t, 'карточка рынка США: кнопки «Сборка из комплектов» нет, есть пояснение «…здесь не нужны» (кнопок impUp: %d)' % len(btns))
    ok(js("impPayback(G,'us')===Infinity") and js("impUp(G,'us')===false"), 'советник не считает окупаемость сборки в США, действие impUp отклоняется')
    pg.screenshot(path=out + '4_us_market.png', full_page=True)
    ok(not errs, 'ошибок страницы нет' + ('' if not errs else ': ' + errs[0][:160]))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
