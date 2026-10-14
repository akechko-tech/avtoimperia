# 0.32: дымовой прогон в браузере — «Мотомастерская» (новая игра, мотоцикл, путь к автомобилю), мотоцех у автомобильной
# марки, переносы технологий, рисунок мотоцикла, риск «не по ТЗ». 0.33: переключателя «Авто / Мото» больше нет (один список),
# мотоцех — оборудование в «Технологиях завода»; новое 0.33 — в ui33.py.
# python3 game/test/ui32.py
from playwright.sync_api import sync_playwright
import os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/m32/'
os.makedirs(out,exist_ok=True)
fails=0
def ok(c,m):
    global fails
    print(('  ok  ' if c else '  FAIL ')+m)
    if not c: fails+=1
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':400,'height':860},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    clean="(()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}G.pending=[];})()"
    # 1) новая игра: путь «Мотомастерская»
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200);pg.click('[data-act=ngPath][data-v=moto]');pg.wait_for_timeout(250)
    pg.screenshot(path=out+'1_newgame.png')
    ok(pg.query_selector('[data-act=pion][data-v=ford]') is None,'у мотомастерской — только свой персонаж')
    pg.click('[data-act=country][data-v=fr]');pg.wait_for_timeout(150)
    ok('Старт: легко' in pg.inner_text('#sheetBody'),'мастерская во Франции: «Старт: легко»')
    pg.click('[data-act=country][data-v=it]');pg.wait_for_timeout(150);ok('Старт: очень трудно' in pg.inner_text('#sheetBody'),'мастерская в Италии: «Старт: очень трудно»')
    pg.click('[data-act=ngBack]');pg.wait_for_timeout(200);pg.click('[data-act=ngPath][data-v=company]');pg.wait_for_timeout(200);pg.click('[data-act=pion][data-v=custom]');pg.wait_for_timeout(150);pg.click('[data-act=country][data-v=us]');pg.wait_for_timeout(150)
    ok('Старт: трудно' in pg.inner_text('#sheetBody'),'своя марка в Америке 1895 года: «Старт: трудно»')
    # обратно к мастерской — во Францию (заставка за листом на паузе: лист не тормозит)
    pg.click('[data-act=ngBack]');pg.wait_for_timeout(200);pg.click('[data-act=ngPath][data-v=moto]');pg.wait_for_timeout(250)
    pg.click('[data-act=country][data-v=fr]');pg.wait_for_timeout(150);pg.click('[data-act=startgame]');pg.wait_for_timeout(400)
    ok(js("G.motoStart===1899&&G.y===1899&&lineOn(G,'moto')&&!lineOn(G,'car')")==True,'мотомастерская открыта: '+js("dstr(G)")+', касса '+str(js("Math.round(G.cash)")))
    pg.screenshot(path=out+'2_intro_paper.png');js(clean)
    js("(()=>{tab='models';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(250);pg.screenshot(path=out+'3_models_moto.png')
    ok(pg.query_selector('.lineseg') is None and pg.query_selector('svg.car.moto') is not None,'«Модели»: один список (0.33) и рисунок мотоцикла')
    # конструктор мотоцикла
    js("(()=>{tab='models';render();})()");pg.click('[data-act=design]');pg.wait_for_timeout(350);pg.screenshot(path=out+'5_designer_moto.png')
    ok(js("!!(draft&&isMoto(draft))")==True and 'новый мотоцикл' in pg.inner_text('#sheetBody').lower(),'конструктор мотоцикла открыт')
    pg.click('#sheetBody [data-act=dclass][data-v=moside]') if pg.query_selector('#sheetBody [data-act=dclass][data-v=moside]') else None
    js("(()=>{G.y=1906;draft.b='mb1';renderDesigner();})()");pg.wait_for_timeout(250);pg.screenshot(path=out+'6_designer_sidecar.png')
    ok(js("segOf(draft)")=='moside','мотоцикл с коляской')
    js(clean)
    # «Завод»: мотоцех и путь к автомобилю
    js("(()=>{G.y=1903;tab='plant';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(300)
    el=pg.query_selector('[data-k=carshop]');ok(el is not None,'«Завод»: карточка «Путь к автомобилю»')
    if el: el.scroll_into_view_if_needed();pg.screenshot(path=out+'7_plant_carshop.png')
    # выполнили условия — строим автомобильный цех
    js("(()=>{G.y=1905;G.models[0].made=4000;G.rd.lvl=2;G.cash=9e4;render();})()");pg.wait_for_timeout(200)
    bt=pg.query_selector('[data-act=carShop]');ok(bt is not None and bt.is_enabled(),'кнопка «Построить автомобильный цех» доступна')
    if bt: bt.click();pg.wait_for_timeout(200)
    for i in range(7): js("(()=>{G.pending=[];doStep();closeSheet();closePaper();G.pending=[];})()")
    ok(js("lineOn(G,'car')")==True,'автомобильный цех построен: '+js("dstr(G)"))
    # «Продажи»: рынок мотоциклов
    js(clean);js("(()=>{tab='market';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(300);pg.screenshot(path=out+'9_market_moto.png')
    ok('Мотомарки' in pg.content(),'«Продажи»: рынок мотоциклов и мотомарки в общем разделе')
    bb=pg.query_selector('[data-act=mbrand]')
    if bb:
        bb.click();pg.wait_for_timeout(300);pg.screenshot(path=out+'10_mbrand.png');ok('Мотомарка' in pg.inner_text('#sheetBody'),'карточка мотомарки');js(clean)
    # КБ: проекты мотоциклов и переносы
    js("(()=>{G.y=1904;G.rd.lvl=4;G.cash=5e5;G.rd.early.push('e3');openRD();})()");pg.wait_for_timeout(300);pg.screenshot(path=out+'11_kb_moto.png')
    ok('Перенос' in pg.inner_text('#sheetBody'),'КБ: переносы между линейками')
    js(clean)
    # 2) автомобильная марка: мотоцех, мотоцикл, риск «не по ТЗ» в конструкторе
    js("(()=>{newGame('peugeot','fr','Пежо','normal');G.y=1910;G.cash=3e5;G.pending=[];tab='plant';setOpen('techc',true);render();})()");pg.wait_for_timeout(300)
    bt=pg.query_selector('[data-act=mshop]');ok(bt is not None and pg.query_selector('.lineseg') is None,'у автомобильной марки: оборудование для мотоциклов — в технологиях завода')
    if bt:
        bt.scroll_into_view_if_needed();pg.screenshot(path=out+'12_car_mshop.png');bt.click();pg.wait_for_timeout(200)
        for i in range(4): js("(()=>{G.pending=[];doStep();closeSheet();closePaper();G.pending=[];})()")
        ok(js("lineOn(G,'moto')")==True,'оборудование для мотоциклов поставлено')
    js("(()=>{G.rd.early.push('e6');tab='models';render();openDesigner('lux');draft.e='e6';renderDesigner();})()");pg.wait_for_timeout(300)
    ok('Риск: не по ТЗ' in pg.inner_text('#sheetBody'),'конструктор: риск «не по ТЗ» у прототипа')
    pg.screenshot(path=out+'13_designer_risk.png');js(clean)
    js("(()=>{tab='log';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(250)
    ok(len(errs)==0,'без ошибок в консоли: '+'; '.join(errs[:3]))
    b.close()
print('ОШИБОК: '+str(fails) if fails else 'всё в порядке')
