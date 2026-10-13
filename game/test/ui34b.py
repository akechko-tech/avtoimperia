# 0.34, отзыв из 19 пунктов: герои-мотоциклисты, регламент гонок, подготовка мотоцикла, газ «вверх — больше», «Доводка в КБ»
# в карточке модели, «Гонка — испытание» в итогах, «как посчитано» у конторы, модели купленных марок.
# python3 game/test/ui34b.py   (снимки — в scratchpad/m34/fb)
from playwright.sync_api import sync_playwright
import os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/m34/fb/'
os.makedirs(out,exist_ok=True)
fails=0
def ok(c,m):
    global fails
    print(('  ok  ' if c else '  FAIL ')+m,flush=True)
    if not c: fails+=1
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    def clean(): js("(()=>{for(let i=0;i<8;i++)try{closePaper();}catch(_){};try{closeSheet();}catch(_){};if(typeof SAGAP!=='undefined'&&SAGAP)try{sagaStop();}catch(_){};G.pending=[];})()")
    # 1) новая игра: путь «Мотомастерская» — свои герои
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200);pg.click('[data-act=ngPath][data-v=moto]');pg.wait_for_timeout(300)
    names=pg.eval_on_selector_all('#sheetBody .pion h3','e=>e.map(x=>x.textContent)')
    ok(all(any(n in x for x in names) for n in ('Альбер де Дион','Уильям Моррис','Иоганн Винкльхофер','Эдоардо Бьянки')),'мотомастерская — свои герои: '+', '.join(names))
    ok(not any('Форд' in x or 'Бенц' in x for x in names),'автомобильных героев в списке нет')
    pg.evaluate("document.querySelector('#sheetBody .pion[data-v=wanderer]').scrollIntoView({block:'center'})");pg.wait_for_timeout(150)
    pg.click('#sheetBody .pion[data-v=wanderer]');pg.wait_for_timeout(250);pg.screenshot(path=out+'1_moto_heroes.png')
    pg.click('[data-act=startgame]');pg.wait_for_timeout(600)
    r=js("({p:G.pioneer,moto:G.lines&&G.lines.moto,car:G.lines&&G.lines.car,c:G.country,m:isMoto(G.models[0])})")
    ok(r['p']=='wanderer' and r['moto']==1 and not r['car'] and r['m'] and r['c']=='de','старт за Винкльхофера — мотомастерская в Германии: '+str(r))
    clean()
    # 2) марка 1922 года с машиной и мотоциклом: заявка на «Клаузен» — регламент, машины и мотоциклы отдельно, подготовка мотоцикла
    js("""(()=>{newGame('custom','de','Тест','normal');for(let i=0;i<8;i++)try{closePaper();}catch(_){};closeSheet();G.pending=[];
      const rc=RACES.find(r=>r.id==='klausen'&&r.y>=1922)||RACES.find(r=>r.id==='klausen');window.__rk=rc.key;G.y=rc.y;G.m=Math.max(0,rc.m-1);G.cash=5e5;G.rdept=1;G.lines={car:1,moto:1};
      const a=aiCarMd(rc.y);Object.assign(G.models[0],{e:a.e,g:a.g,c:a.c,k:a.k,w:a.w});const d=rivalDesign('moto',rc.y);
      G.models.push(Object.assign({},G.models[0],{id:77,name:'Мото 22',e:d.e,g:d.g,c:d.c,k:d.k,b:d.b,w:d.w,t:'t0',dv:undefined}));
      G.drivers=DRIVERS.filter(x=>x.from<=rc.y&&x.to>=rc.y).slice(0,3).map(x=>x.id);tab='race';render();openRaceSetup(rc.key);})()""");pg.wait_for_timeout(400)
    t=pg.inner_text('#sheetBody').lower()   # подписи .label — заглавными (text-transform)
    ok('команда · машин 1 из 4 · мотоциклов 0 из 4' in t,'заголовок команды по регламенту')
    ok('📜' in t and 'горный подъём' in t,'пояснение регламента: '+(t.split('📜')[1].split('\n')[0][:90] if '📜' in t else '—'))
    ok(pg.query_selector('#sheetBody [data-act=rAdd][data-k=moto]') is not None and pg.query_selector('#sheetBody [data-act=rAdd][data-k=car]') is not None,'кнопки «Ещё машина» и «Ещё мотоцикл»')
    pg.click('#sheetBody [data-act=rAdd][data-k=moto]');pg.wait_for_timeout(400);t=pg.inner_text('#sheetBody').lower()
    ok('мотоциклов 1 из 4' in t and js("RS.entries.length")==2,'добавили мотоцикл: экипажей '+str(js("RS.entries.length")))
    chips=pg.eval_on_selector_all('#sheetBody .entry.open [data-k=prep]','e=>e.map(x=>x.textContent)')
    ok(len(chips)==3 and 'Заводской гоночный' in chips[2] and 'без фары' in chips[1] and not pg.query_selector('#sheetBody .entry.open [data-k=prep][data-v="2"][disabled]'),'подготовка мотоцикла: '+' | '.join(c[:40] for c in chips))
    el=pg.query_selector('#sheetBody .entry.open [data-k=prep][data-v="2"]');el.scroll_into_view_if_needed();pg.wait_for_timeout(150);el.click();pg.wait_for_timeout(300)
    ok(js("RS.entries[1].prep")==2,'мотоцикл — с заводской гоночной подготовкой')
    pg.evaluate("document.querySelector('#sheetBody .entry.open [data-k=prep]').scrollIntoView({block:'center'})");pg.wait_for_timeout(200);pg.screenshot(path=out+'2_moto_prep.png')
    pg.evaluate("[...document.querySelectorAll('#sheetBody .label')].find(e=>/Команда/.test(e.textContent)).scrollIntoView({block:'start'})");pg.wait_for_timeout(200);pg.screenshot(path=out+'3_rules.png')
    # 3) газ: верх кнопки — полный, ниже — меньше (гонка в 2D, чтобы не ждать постройки мира)
    js("(()=>{AU.on.gfx='2d';RS.entries=[RS.entries[0]];RS.entries[0].drv='me';RS.mode='drive';RACE_ACT.raceGo();})()");pg.wait_for_timeout(1500)
    js("(()=>{try{filmSkip();}catch(_){}})()");pg.wait_for_timeout(500)
    go=pg.query_selector('#raceScreen button:has-text("Поехали")') or pg.query_selector('button:has-text("Поехали")')
    if go and go.is_visible(): go.click();pg.wait_for_timeout(400)
    g=pg.query_selector('#raceScreen .r-ctrl .gas') or pg.query_selector('.r-ctrl .gas')
    ok(g is not None,'кнопка газа на экране')
    if g:
        bb=g.bounding_box();pg.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']*0.2);pg.mouse.down();pg.wait_for_timeout(150)
        v1=js("rKeys.gasLv");pg.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']*0.9,steps=4);pg.wait_for_timeout(200)
        v2=js("rKeys.gasLv");lab=g.inner_text();pg.screenshot(path=out+'4_gas.png')
        pg.mouse.up();pg.wait_for_timeout(150);v3=js("rKeys.gasLv")
        ok(v1==1 and 0.3<v2<0.45 and v3==1,'газ: верх %.2f, низ %.2f, отпустили %.2f'%(v1,v2,v3))
        ok('%' in lab,'на кнопке — сила газа: '+lab.replace('\n',' '))
    js("(()=>{try{if(R)finishRace(true);}catch(e){console.warn(e)};R=null;try{closeSheet();}catch(_){};G.pending=[];})()");pg.wait_for_timeout(400)
    # 4) «Доводка в КБ» — в карточке модели в любой момент
    js("(()=>{const md=G.models[0];md.status='prod';md.dv={e:{k:0.9,t:mi(G),sev:0.4}};tab='models';setOpen('md'+md.id,true);render();})()");pg.wait_for_timeout(400)
    bt=pg.query_selector('[data-act=rdfixM]')
    ok(bt is not None and 'Доводка в КБ' in bt.inner_text(),'карточка модели: кнопка «Доводка в КБ»')
    if bt: bt.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=out+'5_dv_card.png')
    # 5) гонка — испытание: быстрый итог гонки, машина «не по ТЗ» становится ближе к ТЗ
    js("(()=>{AU.on.gfx='2d';G.cash=5e5;RS=null;openRaceSetup(window.__rk);RS.entries=[RS.entries[0]];RS.mode='sim';RACE_ACT.raceGo();})()")
    pg.wait_for_timeout(3000)
    for i in range(20):
        t=(pg.inner_text('#sheetBody') if pg.query_selector('#sheetBody') else '').lower()
        if 'итоги:' in t: break
        pg.wait_for_timeout(1000)
    ok('гонка — испытание' in t and 'ближе к тз' in t and 'мес. доводки' in t,'итоги гонки: «Гонка — испытание» — '+(t.split('гонка — испытание')[1].strip().split('\n')[0][:120] if 'гонка — испытание' in t else '—'))
    if 'гонка — испытание' in t:
        pg.evaluate("[...document.querySelectorAll('#sheetBody .label')].find(e=>/испытание/.test(e.textContent)).scrollIntoView({block:'center'})");pg.wait_for_timeout(200);pg.screenshot(path=out+'6_race_test.png')
    clean()
    # 6) контора: «как посчитано» в финансах
    js("""(()=>{AU.on.gfx='3d';G.y=1924;G.m=2;G.cash=2e6;const md=G.models[0],a=autoDesign('middle',G);Object.assign(md,{e:a.e,g:a.g,c:a.c,k:a.k,b:a.b,t:a.t,w:a.w,status:'prod',dv:undefined});
      md.price=Math.round(refPrice(md,G)/10)*10;G.cap=Math.max(G.cap,60);G.dealers.de=Math.max(G.dealers.de||0,40);
      for(let i=0;i<3;i++){G.pending=[];step();}G.pending=[];tab='plant';setOpen('fin',true);setOpen('pl',true);render();})()""");pg.wait_for_timeout(500)
    clean();js("render()");pg.wait_for_timeout(300)
    el=pg.query_selector('[data-act=xadm]')
    ok(el is not None,'строка «Контора» — кнопка «как посчитано»')
    if el:
        el.scroll_into_view_if_needed();pg.wait_for_timeout(200);el.click();pg.wait_for_timeout(300)
        t=pg.inner_text('#xpop') if pg.query_selector('#xpop') else ''
        ok('Основа' in t and 'Выпуск' in t and 'Модели в производстве' in t and 'Итого' in t,'окно конторы: основа, выпуск, страны, модели, итог')
        bx=pg.query_selector('#xpop').bounding_box() if pg.query_selector('#xpop') else None
        ok(bx and bx['x']>=0 and bx['x']+bx['width']<=390 and bx['y']>=0 and bx['y']+bx['height']<=844,'окно целиком на экране')
        pg.screenshot(path=out+'7_office.png');js("xpopClose()")
    el=pg.query_selector('[data-act=xdlr]')
    ok(el is not None,'строка «Дилерская сеть» — кнопка «как посчитано»')
    if el:
        el.scroll_into_view_if_needed();pg.wait_for_timeout(200);el.click();pg.wait_for_timeout(300)
        t=pg.inner_text('#xpop') if pg.query_selector('#xpop') else ''
        ok('Германия' in t and 'загрузка' in t and 'Итого' in t,'окно дилеров: по странам, загрузка, итог')
        pg.screenshot(path=out+'7c_dealers.png');js("xpopClose()")
    # 7) поглощение: модель купленной марки — в «Моделях» под её именем
    js("""(()=>{G.cash=6e7;G.y=1921;const L=(COMPS.de||[]).map((cp,i)=>({cp,i})).filter(o=>!dealBlock(G,'de',o.i)&&maStat(G,'de',o.i)).sort((a,b)=>maStat(G,'de',a.i).v-maStat(G,'de',b.i).v);
      let done=null;for(const o of L){for(const k of [1.2,1.6,2.5]){if(G.dealNo)delete G.dealNo['de'+o.i];const r=dealDo(G,'de',o.i,'cash',k);if(r&&r.ok){done=o.cp.n;break;}}if(done)break;}window.__acq=done;G.pending=[];tab='market';setOpen('deals',true);render();})()""");pg.wait_for_timeout(500)
    acq=js("window.__acq");t=pg.inner_text('body')
    ok(acq and ('у вас в «Моделях»' in t or 'Выпустить её модель' in t),'поглотили '+str(acq)+': в «Ваших компаниях» — её модели')
    ok(js("G.models.some(m=>m.from&&m.status==='prod')"),'её модель — в производстве, с именем марки: '+str(js("(G.models.find(m=>m.from)||{}).name")))
    el=pg.query_selector('text=у вас в «Моделях»')
    if el: el.scroll_into_view_if_needed();pg.wait_for_timeout(200);pg.screenshot(path=out+'8_acq.png')
    ok(len(errs)==0,'без ошибок в консоли: '+'; '.join(errs[:3]))
    b.close()
print('ОШИБОК: '+str(fails) if fails else 'всё в порядке')
