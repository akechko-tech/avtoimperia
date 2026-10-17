# 0.34: «как посчитано» — всплывающие окна-таблицы (черты, итог, себестоимость) и кнопка «Передовая модель» в конструкторе.
# python3 game/test/ui34.py
from playwright.sync_api import sync_playwright
import os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/m34/ui/'
os.makedirs(out,exist_ok=True)
fails=0
def ok(c,m):
    global fails
    print(('  ok  ' if c else '  FAIL ')+m)
    if not c: fails+=1
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    pg.click('[data-act=newgame]');pg.click('[data-act=ngDir][data-v=car]');pg.click('[data-act=pion][data-v=custom]');pg.click('[data-act=country][data-v=de]');pg.click('[data-act=startgame]');pg.wait_for_timeout(400)
    js("(()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}G.pending=[];G.y=1920;G.m=4;G.cash=5e5;G.rd.lvl=3;render();})()")
    js("(()=>{openDesigner('truck');})()");pg.wait_for_timeout(400)
    rows=pg.query_selector_all('#sheetBody .cmp-x')
    ok(len(rows)>=4 and all(r.query_selector('.xi') for r in rows),'строки черт — кнопки с ⓘ: '+str(len(rows)))
    el=pg.query_selector('#sheetBody .cmp-x[data-k=rel]');el.scroll_into_view_if_needed();pg.wait_for_timeout(150);el.click();pg.wait_for_timeout(300)
    t=pg.inner_text('#xpop') if pg.query_selector('#xpop') else ''
    ok('Итого' in t and 'Ломается из 100' in t,'окно «Надёжность»: таблица, «ломается из 100», итог')
    bx=pg.query_selector('#xpop').bounding_box();ok(bx and bx['x']>=0 and bx['x']+bx['width']<=390 and bx['y']>=0 and bx['y']+bx['height']<=844,'окно целиком на экране: '+str(bx and [round(bx['x']),round(bx['y']),round(bx['width']),round(bx['height'])]))
    pg.screenshot(path=out+'1_rel.png')
    pg.click('#xpopBg',position={'x':5,'y':5});pg.wait_for_timeout(150);ok(pg.query_selector('#xpop') is None,'тап мимо окна — закрылось')
    pg.query_selector('#sheetBody .qbx').click();pg.wait_for_timeout(300);t=pg.inner_text('#xpop');ok('Тонно-км' in t and 'Итого' in t,'итог грузовика: вклад черт и тонно-километр');js("xpopClose()")
    el=pg.query_selector('#sheetBody .mx');el.scroll_into_view_if_needed();pg.wait_for_timeout(150);el.click();pg.wait_for_timeout(300);t=pg.inner_text('#xpop')
    ok('Детали по прайсу' in t and 'Работа' in t,'себестоимость: детали, работа, итог');js("xpopClose()")
    # «Передовая модель»: класс тот же, итог не ниже, детали — не устаревшие
    js("(()=>{openDesigner('middle');})()");pg.wait_for_timeout(300)
    bb=[pg.query_selector('#sheetBody [data-act='+a+']').bounding_box() for a in ('dcopy','dfront','dauto')]
    ok(abs(bb[0]['y']-bb[1]['y'])<2 and bb[2]['y']>bb[0]['y']+bb[0]['height'] and bb[2]['width']>bb[0]['width']*1.8,'кнопки: «Как у соперника» и «Передовая модель» рядом, «Подобрать…» — во всю ширину ниже')
    s0=js("classScore({...draft},G,G.country)");b0=js("draft.b")
    pg.click('#sheetBody [data-act=dfront]');pg.wait_for_timeout(400)
    s1=js("classScore({...draft},G,G.country)");ok(js("draft.b")==b0 and js("segOf(draft)")=='middle','«Передовая модель»: кузов и класс — те же')
    ok(js("FRONT_KEYS.every(k=>!partObsolete(k,draft[k],G))")==True,'«Передовая модель»: ни одной устаревшей детали ('+js("FRONT_KEYS.map(k=>draft[k]).join(' ')")+')')
    ok(s1>=s0*0.95,'итог против соперника: '+str(round(s0*100))+'% → '+str(round(s1*100))+'%')
    n=pg.query_selector('#sheetBody .dnote');t=n.inner_text() if n else ''
    ok('Передовая модель' in t and str(round(s1*100))+'%' in t and 'себестоимость' in t,'строка под кнопками: '+t.replace('\n',' / '))
    pg.evaluate("document.querySelector('#sheetBody .dbtns').scrollIntoView({block:'center'})");pg.wait_for_timeout(150);pg.screenshot(path=out+'2_front.png')
    pg.click('#sheetBody [data-act=dsec][data-k=e]');pg.wait_for_timeout(200)
    pg.query_selector_all('#sheetBody .chip[data-act=pick][data-k=e]:not(.on)')[0].click();pg.wait_for_timeout(300)
    ok(pg.query_selector('#sheetBody .dnote') is None,'сменили деталь — строка ушла')
    pg.click('#sheetBody [data-act=dauto]');pg.wait_for_timeout(400);t=pg.inner_text('#sheetBody .dnote') if pg.query_selector('#sheetBody .dnote') else ''
    ok('наибольшей прибыли' in t,'«Подобрать детали повыгоднее» — тоже строкой: '+t.replace('\n',' / '))
    js("(()=>{openDesigner('truck');})()");pg.wait_for_timeout(300)
    ok(pg.query_selector('#sheetBody .dnote') is None,'новый проект — без строки')
    pg.click('#sheetBody [data-act=dfront]');pg.wait_for_timeout(400);t=pg.inner_text('#sheetBody .dnote') if pg.query_selector('#sheetBody .dnote') else ''
    ok('спрос фирм при той же цене' in t,'грузовик: строка про спрос фирм — '+t.replace('\n',' / '))
    pg.evaluate("document.querySelector('#sheetBody .dbtns').scrollIntoView({block:'center'})");pg.wait_for_timeout(150);pg.screenshot(path=out+'3_truck.png')
    js("closeSheet()")
    # карточка модели
    js("(()=>{tab='models';setOpen('cmp'+G.models[0].id,true);setOpen('md'+G.models[0].id,true);setOpen('m'+G.models[0].id+'rv',true);render();})()");pg.wait_for_timeout(400)   # 0.36: сравнение — в разделе «Против соперников»
    el=pg.query_selector('#view .cmp-x[data-k=comf]')
    if el:
        el.scroll_into_view_if_needed();pg.wait_for_timeout(200);el.click();pg.wait_for_timeout(300);t=pg.inner_text('#xpop') if pg.query_selector('#xpop') else ''
        ok('Комфорт' in t and 'Итого' in t and 'Больше всего' not in t,'карточка модели: окно «Комфорт» (без советов — модель уже в серии)');js("xpopClose()")
    else: ok(False,'в карточке модели нет строк с ⓘ')
    # ---------- 0.34, ТЗ «экономика, которую видно»: пп. 1–11 на экране (партия вроде штутгартской: «Историк», с июля 1928 года 14 месяцев, 8 моделей, 4 страны, дешёвый мотоцикл) ----------
    js("""(()=>{xpopClose();closeSheet();G.diff='hist';G.pending=[];G.y=1928;G.m=6;G.cash=2e8;G.lines={car:1,moto:1};G.rep=70;G.ad=20000;
      G.models=[];['people','middle','lux','sport','truck','van','moto','moside'].forEach((k,i)=>{const d=autoDesign(k,G);const m={...d,id:100+i,name:{people:'Народная',middle:'Средняя',lux:'Люкс',sport:'Спорт',truck:'Трёхтонка',van:'Фургон',moto:'Мото',moside:'Коляска'}[k],paint:'#8a1c1c',plan:'auto',status:'prod',launched:mi(G)-30,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:40000,fc:0,vol:1500};m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);});
      const ob=unlockedP(BODIES,G).find(b=>!b.truck&&!b.moto&&!b.closed&&(b.seats||2)>=4);if(ob)G.models[0].b=ob.id;
      G.cap=16000;G.plantVal=16000*capUnitCost(G)*0.6;G.staffAuto=true;G.workers=20000;G.dealers={de:2600,fr:700,uk:40,us:900,it:250};G.dcap={de:3.5,fr:3.5,uk:1,us:3.5,it:3.5};G.imp={fr:4,uk:1,us:4,it:4};
      const nm={fr:'Mors',us:'Mercer',it:'Itala'};G.hold=Object.keys(nm).map(c=>{const i=(COMPS[c]||[]).findIndex(cp=>cp.n===nm[c]);return {c,i,n:nm[c],nm:nm[c],mode:'int',st:1,t:mi(G)-60,sh0:{},paid:1,pay:'cash',mood:65};}).filter(h=>h.i>=0);
      for(let k=0;k<14;k++){G.pending=[];if(k===1||k===4)G.models.forEach(m=>{const bp=bestPriceFor(m,G);if(bp&&bp.price)m.price=bp.price;});if(k>=1)G.models[6].price=Math.round(prefP('moto','de',G)*0.6/10)*10;step();}G.pending=[];for(let i=0;i<8;i++)try{closePaper();}catch(_){};
      tab='models';G.models.forEach(m=>{setOpen('md'+m.id,true);['pt','du','co','rv','sp'].forEach(x=>setOpen('m'+m.id+x,true));});render();})()""");pg.wait_for_timeout(600)   # 0.36: карточка модели — по разделам; раскрыты все
    t=pg.inner_text('#app') if pg.query_selector('#app') else pg.inner_text('body')
    ok('как у соперников ≈' in t,'п. 1: в карточке модели — «как у соперников ≈ $…»')
    ok('Для покупателей ≈' in t and 'Открытый кузов' in t,'п. 2: скрытые штрафы и «для покупателей ≈ N% соперника» (открытая народная 1929 года)')
    ok('т·км на' in t,'п. 3: у грузовиков — тонно-километр против соперника')
    ok('после всех расходов' in t.lower() and 'после конторы' in t,'п. 4: прибыль до конторы и после всех расходов, маржа после конторы')
    ok('На линии' in t,'п. 11: сколько мест на линии занимает машина')
    el=pg.query_selector('text=Для покупателей ≈');
    if el: el.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=out+'5_hidden.png')
    el=pg.query_selector('text=В месяц после всех расходов')
    if el: el.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=out+'6_after.png')
    el=pg.query_selector('text=т·км на')
    if el: el.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=out+'7_truck.png')
    # 0.36: у дилеров — одна страна на экране, остальные — кнопками стран: собираем текст по каждой
    t='';acts=set()
    for c in ['de','fr','us','uk','it']:
        js("(c=>{tab='market';G.ui=G.ui||{};G.ui.dlrC=c;setOpen('net_'+c,true);render();})('%s')"%c);pg.wait_for_timeout(300)
        t+=pg.inner_text('#app') if pg.query_selector('#app') else pg.inner_text('body')
        acts|=set(pg.eval_on_selector_all('#view [data-act]','e=>e.map(x=>x.dataset.act)'))
    ok('Свой завод здесь не нужен' in t and 'impSell' in acts,'п. 5: «Свой завод здесь не нужен» и кнопка «Продать завод»')
    ok('Сеть продаёт меньше пятой части' in t and 'dealerShrink' in acts,'п. 6: совет о недогруженной сети и «Салоны поменьше»')
    ok('leaveCountry' in acts,'п. 7: «Уйти из страны»')
    ok('⚔️ Мотоцикл: доля' in t and '· порог 10%/14%' in t and 'натиск' in t,'п. 9: ответ соперников по классам в карточке страны (дешёвый мотоцикл дома: доля выше порога «Историка», натиск)')
    ok(('ваши машины видят' in t or 'ваши машины и мотоциклы видят' in t) and 'Для всей страны нужно' in t,'п. 8: охват за границей ниже 30% — сколько нужно дилеров и что они дадут')
    js("(()=>{G.ui.dlrC='fr';render();})()");pg.wait_for_timeout(300)
    el=pg.query_selector('text=Свой завод здесь не нужен')
    if el: el.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=out+'8_country.png')
    js("(()=>{tab='plant';setOpen('cap',true);setOpen('fin',true);setOpen('pl',true);render();})()");pg.wait_for_timeout(500)
    t=pg.inner_text('#app') if pg.query_selector('#app') else pg.inner_text('body')
    ok('Места в прошлом месяце' in t and 'В нынешней смеси' in t,'п. 11: места на линии по видам и мощность в нынешней смеси')
    ok(pg.query_selector('[data-act=xadm]') is not None,'п. 10: «Контора» — как посчитано')
    el=pg.query_selector('text=Места в прошлом месяце')
    if el: el.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=out+'9_places.png')
    # конструктор: строки штрафов и цена равного спроса
    js("(()=>{openDesigner('people');const ob=unlockedP(BODIES,G).find(b=>!b.truck&&!b.moto&&!b.closed&&(b.seats||2)>=4);if(ob){draft.b=ob.id;renderDesigner();}})()");pg.wait_for_timeout(500)
    t=pg.inner_text('#sheetBody')
    ok('Продастся как у соперников' in t and 'Открытый кузов' in t,'п. 1–2 в конструкторе: цена равного спроса и предупреждение о штрафе')
    el=pg.query_selector('#sheetBody .hid')
    if el: el.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=out+'10_designer.png')
    js("closeSheet()")
    ok(len(errs)==0,'без ошибок в консоли: '+'; '.join(errs[:3]))
    b.close()
print('ОШИБОК: '+str(fails) if fails else 'всё в порядке')
