# 0.33: дымовой прогон в браузере — мотоциклы внутри общих разделов (без переключателя «Авто / Мото»), один завод с
# оборудованием для мотоциклов, покупка мотомарки, совместная гонка автомобилей и мотоциклов (3D-мотоцикл, свой зачёт),
# понятные продажи после войны (рынки стран, конфискация), нижний предел цены, риск «не по ТЗ» без «всё в красном».
# python3 game/test/ui33.py
from playwright.sync_api import sync_playwright
import os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/m33/ui/'
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
    step="(()=>{G.pending=[];doStep();closeSheet();closePaper();G.pending=[];})()"
    # 1) мотомастерская: один список моделей, без переключателя наверху
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200);pg.click('[data-act=ngDir][data-v=moto]');pg.wait_for_timeout(250)
    pg.click('[data-act=country][data-v=fr]');pg.wait_for_timeout(150);pg.click('[data-act=startgame]');pg.wait_for_timeout(400)
    ok(js("lineOn(G,'moto')&&!lineOn(G,'car')&&G.cap>0")==True,'мотомастерская: '+js("dstr(G)")+', цеха '+str(js("G.cap")))
    js(clean);js("(()=>{tab='models';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(250);pg.screenshot(path=out+'1_models.png')
    ok(pg.query_selector('.lineseg') is None and pg.query_selector('svg.car.moto') is not None,'«Модели»: без переключателя «Авто / Мото», мотоцикл в общем списке')
    ok('Новая модель' in pg.inner_text('#main') if pg.query_selector('#main') else 'Новая модель' in pg.content(),'кнопка «Новая модель»')
    # конструктор: классы мотоциклов (автомобильных пока нет)
    js("(()=>{openDesigner();})()");pg.wait_for_timeout(300);pg.screenshot(path=out+'2_designer.png')
    ok(js("!!(draft&&isMoto(draft))")==True,'конструктор у мастерской открывается на мотоцикле')
    js(clean)
    # «Завод»: один завод; оборудование для мотоциклов — строка в технологиях; путь к автомобилю
    js("(()=>{G.y=1903;tab='plant';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(300)
    ok(pg.query_selector('[data-k=carshop]') is not None,'«Завод»: карточка «Путь к автомобилю»')
    ok('Оборудование: что умеет делать завод' in pg.content(),'«Завод»: оборудование завода — в технологиях')
    js("(()=>{G.y=1905;G.models[0].made=4000;G.rd.lvl=2;G.cash=9e4;render();})()");pg.wait_for_timeout(200)
    bt=pg.query_selector('[data-act=carShop]');ok(bt is not None and bt.is_enabled(),'кнопка «Поставить оборудование для автомобилей» доступна')
    if bt: bt.click();pg.wait_for_timeout(200)
    for i in range(7): js(step)
    ok(js("lineOn(G,'car')&&G.cap>1.2")==True,'оборудование для автомобилей поставлено — те же цеха: '+str(js("Math.round(G.cap*10)/10")))
    js(clean);js("(()=>{tab='models';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(250)
    ok(pg.query_selector('.lineseg') is None,'и с машинами, и с мотоциклами — один список')
    js("(()=>{openDesigner('people');})()");pg.wait_for_timeout(300);pg.screenshot(path=out+'3_designer_both.png')
    ok(pg.query_selector('#sheetBody [data-act=dclass][data-v=moto]') is not None and pg.query_selector('#sheetBody [data-act=dclass][data-v=people]') is not None,'конструктор: классы машин и мотоциклов рядом')
    js(clean)
    # 2) автомобильная марка 1910: оборудование для мотоциклов — в технологиях; покупка мотомарки
    js("(()=>{newGame('peugeot','fr','Пежо','normal');G.y=1910;G.cash=6e5;G.pending=[];tab='plant';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(200)
    ok('оборудование для мотоциклов' in pg.inner_text('#main').lower() if pg.query_selector('#main') else True,'свёрнутая карточка «Технологии завода» говорит про оборудование для мотоциклов')
    js("(()=>{setOpen('techc',true);render();})()");pg.wait_for_timeout(300)
    bt=pg.query_selector('[data-act=mshop]');ok(bt is not None,'у автомобильной марки: «Оборудование для мотоциклов» в технологиях')
    if bt: bt.scroll_into_view_if_needed();pg.screenshot(path=out+'4_plant_equip.png');bt.click();pg.wait_for_timeout(200)
    for i in range(4): js(step)
    ok(js("lineOn(G,'moto')&&motoLv(G)===1")==True,'мотоциклетный участок поставлен (один завод)')
    js(clean);js("(()=>{G.cash=5e6;G.ui.dealC='us';tab='market';setOpen('deals',true);render();})()");pg.wait_for_timeout(300)
    ok('Мотомарки' in pg.content(),'«Сделки»: мотомарки на продажу')
    bb=pg.query_selector('[data-act=mdealOpen]')
    if bb:
        bb.scroll_into_view_if_needed();pg.screenshot(path=out+'5_mdeals.png');bb.click();pg.wait_for_timeout(300);pg.screenshot(path=out+'6_mdeal_sheet.png')
        ok('что вы получите' in pg.inner_text('#sheetBody').lower(),'карточка покупки мотомарки')
        js("(()=>{G.cash=5e6;})()");bt=pg.query_selector('#sheetBody [data-act=mdealBuy]')
        if bt: bt.click();pg.wait_for_timeout(300)
        ok(js("(G.mhold||[]).length")==1,'мотомарка куплена: '+str(js("(G.mhold||[]).map(h=>h.nm).join()")))
    else: ok(False,'нет кнопки покупки мотомарки')
    js(clean)
    # 3) совместная гонка: метка у гонки, мотоцикл в заявке, свой зачёт в итогах
    js("""(()=>{const rc=RACES.find(r=>r.key==='semmering-1910')||RACES.find(r=>raceMoto(r)&&r.y>=1910);G.y=rc.y;G.m=rc.m;G.cash=1e6;G.rdept=2;
      const md=autoDesign('moto',G);G.models.push({...md,id:G.nextId++,name:'Мото-1',paint:'#9a1c1c',plan:'auto',status:'prod',launched:mi(G)-6,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0,price:300});
      window.__rc=rc.key;tab='race';render();})()""");pg.wait_for_timeout(300)
    ok('и мотоциклы — свой зачёт' in pg.content(),'«Гонки»: метка «🏍 и мотоциклы — свой зачёт»')
    ok(js("raceCarsFor(G,raceByKey(window.__rc)).some(m=>isMoto(m))")==True,'в заявку можно поставить мотоцикл')
    js("""(()=>{const rc=raceByKey(window.__rc),mo=G.models.find(m=>isMoto(m)&&m.status==='prod');Math.random=(()=>{let a=9;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
      startRace({rc,mode:'sim',entries:[{drv:'me',md:mo,prep:1,tyre:'soft',gear:0}]});})()""")
    pg.wait_for_timeout(500);js("(()=>{for(let i=0;i<6;i++)closePaper();openRaceResult();})()");pg.wait_for_timeout(300);pg.screenshot(path=out+'7_race_result.png')
    ok('мотоциклы — свой зачёт' in pg.inner_text('#sheetBody').lower(),'итоги: таблица «Мотоциклы — свой зачёт»')
    ok(js("(G.raceLog||[]).some(r=>r.cls==='moto')")==True,'в истории гонок — результат класса мотоциклов')
    js(clean)
    # 3D-мотоцикл: модель по деталям (одиночка кренится, коляска — нет)
    r=js("""(()=>{const mk=b=>{const md=autoDesign('moto',G);md.b=b;return carModel(Object.assign(modelSpec(md,2,G.y,{num:5,country:'fr'}),{lod:'hi',crew:1}));};const a=mk('mb0'),c=mk('mb2');return [a.F.length>1000,a.lean,c.lean,a.wheels.length,c.wheels.length].join(',');})()""")
    ok(r=='true,1,0,2,3','3D: одиночка (2 колеса, крен) и с коляской (3 колеса, без крена): '+r)
    # 4) после войны: размеры рынков в «Мире», конфискация в карточке страны
    js("(()=>{G.y=1920;G.m=3;G.seized={de:{y:1914,m:7,what:'дилеры'}};if(G.dealers)G.dealers.de=0;if(G.imp)G.imp.de=0;tab='world';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(300)
    pg.screenshot(path=out+'8_world.png')
    ok('конфисковано' in pg.content(),'«Мир»: в карточке страны — что конфисковано в войну')
    # 5) нижний предел цены
    js("(()=>{tab='models';render();})()");pg.wait_for_timeout(200)
    r=js("(()=>{const m=G.models.find(x=>x.status==='prod'&&!isMoto(x));const f=priceFloor(m,G);m.price=f+10;for(let i=0;i<30;i++)ACT.price({id:m.id,d:-1});return [m.price>=f,f].join(',');})()")
    ok(r.startswith('true'),'цена не ниже половины себестоимости (предел '+r.split(',')[1]+')')
    js(clean)
    # 6) риск «не по ТЗ»: сравнение по ТЗ, без «всё в красном»
    js("(()=>{G.y=1910;G.rd.early.push('e6');openDesigner('lux');draft.e='e6';renderDesigner();})()");pg.wait_for_timeout(300)
    t=pg.inner_text('#sheetBody');ok('Риск: не по ТЗ' in t and 'по ТЗ: так машину увидят покупатели' in t,'конструктор: риск «не по ТЗ» — сравнение по ТЗ')
    pg.screenshot(path=out+'9_designer_risk.png');js(clean)
    js("(()=>{tab='log';render();window.scrollTo(0,0);})()");pg.wait_for_timeout(250)
    ok(len(errs)==0,'без ошибок в консоли: '+'; '.join(errs[:3]))
    b.close()
print('ОШИБОК: '+str(fails) if fails else 'всё в порядке')
