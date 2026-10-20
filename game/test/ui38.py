# 0.38: проверки в браузере — новая игра (направление → страна → герой: герой привязан к стране, флаг верный),
# конкурс министерства (лист: «май 1912», соперники без своей фирмы; совет в ангаре — «заказ на N машин»),
# база рекорда: судейские палатки и просека без леса; первый полёт: программа из пяти заданий, «Сесть» → «Сам» → итог с оценкой.
# python3 game/test/ui38.py
from playwright.sync_api import sync_playwright
import os, json
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui38/'
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
    pg.goto('file:///home/claude/Avtoimperia-Android/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();")
    # 1) новая игра: Майбах (Daimler) → страна сама становится Германией; смена страны сбрасывает героя; у авиации — свои герои
    js("openNewGame()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=ngDir][data-v=car]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=country][data-v=fr]').click()"); pg.wait_for_timeout(200)
    has = js("!!document.querySelector('[data-act=pion][data-v=maybach]')")
    ok(not has, 'во Франции карточки Майбаха нет')
    js("document.querySelector('[data-act=country][data-v=de]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=pion][data-v=maybach]').click()"); pg.wait_for_timeout(300)
    r = json.loads(js("JSON.stringify({c:draft.country,on:document.querySelector('[data-act=country].on').dataset.v,hero:draft.hero,tag:(document.querySelector('[data-act=pion][data-v=maybach] .ng-tag')||{}).textContent})"))
    ok(r['c'] == 'de' and r['on'] == 'de' and r['hero']['k'] == 'maybach' and r['tag'] == 'Техник', 'Майбах выбран: страна — Германия, ярлык «Техник» (%s)' % r)
    js("document.querySelector('[data-act=country][data-v=ru]').click()"); pg.wait_for_timeout(300)
    r = json.loads(js("JSON.stringify({c:draft.country,hero:draft.hero,cards:[...document.querySelectorAll('[data-act=pion]')].map(e=>e.dataset.v)})"))
    ok(r['c'] == 'ru' and r['hero']['k'] == 'custom' and 'maybach' not in r['cards'] and 'frese' in r['cards'], 'переключили на Россию: герой — свой персонаж, в списке Фрезе, Майбаха нет (%s)' % r['cards'])
    js("document.querySelector('[data-act=ngDir][data-v=air]').click()"); pg.wait_for_timeout(300)
    r = json.loads(js("JSON.stringify({c:draft.country,cards:[...document.querySelectorAll('[data-act=pion]')].map(e=>e.dataset.v),racers:document.querySelectorAll('[data-act=rpick]').length})"))
    ok(r['c'] == 'ru' and r['cards'] == ['sikorsky', 'gakkel', 'grigorovich', 'custom'] and r['racers'] == 0, 'аэропланы · Россия: Сикорский, Гаккель, Григорович и свой авиатор (0.39), гонщиков нет (%s)' % r['cards'])
    pg.screenshot(path=out + '1_newgame.png')
    # старт за Майбаха: флаг в шапке — немецкий
    js("document.querySelector('[data-act=ngDir][data-v=car]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=country][data-v=de]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=pion][data-v=maybach]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=startgame]').click()"); pg.wait_for_timeout(1200)
    js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];")
    r = json.loads(js("JSON.stringify({c:G.country,p:G.pioneer,fl:document.body.dataset.fl,cc:document.body.dataset.cc,co:document.getElementById('co').textContent})"))
    ok(r['c'] == 'de' and r['p'] == 'maybach' and r['fl'] == 'de1' and r['cc'] == 'de' and 'Майбах' in r['co'] and 'Штутгарт' in r['co'], 'игра за Майбаха: страна Германия, флаг имперской Германии, Штутгарт (%s)' % r)
    # 2) конкурс министерства за Фармана
    js("openNewGame()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=ngDir][data-v=air]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=country][data-v=fr]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=pion][data-v=farman]').click()"); pg.wait_for_timeout(200)
    js("document.querySelector('[data-act=startgame]').click()"); pg.wait_for_timeout(1200)
    js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];AU.on.flyHelp=1;")
    key = js("""(()=>{G.y=1912;G.m=3;const t=tNow(G);const d=airRefMd('recon',t);const md=airNewModel(G,{...d,role:'recon',name:'Фарман разведчик'},{status:'prod',flown:1});md.flown=1;md.status='prod';
      const ev=airTrialNew(G,'recon','fr',12,18,0);G.pending=[];tab='race';render();openAirEv(ev.key);return ev.key;})()""")
    pg.wait_for_timeout(500)
    t = js("document.getElementById('sheet').textContent")
    ok('май 1912' in t and 'мая 1912' not in t, 'лист конкурса: «май 1912», не «мая»')
    ok('«Farman»' not in t and 'Caudron' in t and 'ожидаемая оценка' in t and 'своей постройки' in t or 'опытный' in t, 'соперники — чужие фирмы со своими машинами, себя нет')
    ok('заказ на 12' in t.replace('\xa0', ' ') and 'второму' in t, 'условия: заказ победителю и второму')
    pg.screenshot(path=out + '2_trial.png')
    js("closeSheet();tab='race';render();window.scrollTo(0,0)"); pg.wait_for_timeout(400)
    t = js("document.getElementById('view').textContent").replace('\xa0', ' ')
    ok('Конкурс министерства' in t and 'победителю — заказ на 12 машин' in t, '«Небо»: конкурс в списке с условием заказа')
    js("tab='plant';render();window.scrollTo(0,0)"); pg.wait_for_timeout(400)
    t = js("document.getElementById('view').textContent").replace('\xa0', ' ')
    ok('победителю — заказ на 12 машин' in t and 'приз $' not in t.split('Конкурс министерства')[1][:60], 'совет в ангаре: конкурс — «заказ на 12 машин», не «приз»')
    # 3) база рекорда скорости: судейские палатки, просека без леса
    r = js("""(()=>{G.y=1912;G.m=6;const t=tNow(G);const d=airRefMd('race',t);const md=airNewModel(G,{...d,role:'race',name:'Рекорд'},{status:'race',flown:1});md.flown=1;
      return flyRecord('speed',md,'hero')?'ok':'не стартовал';})()""")
    for i in range(300):
        pg.wait_for_timeout(500)
        if js("!!(FL.on&&FL.me&&document.getElementById('fLoad').hidden)") or not js('FL.on'): break
    ok(r == 'ok' and js('FL.on'), 'рекорд скорости загрузился (%s, %.0f с)' % (r, (i + 1) * 0.5))
    st = json.loads(js("""(()=>{const S=FW.S,E=FW.extra||[],J=E.filter(o=>o.k==='judge'),C=E.filter(o=>o.k==='clear');let forest=0,n=0;
      for(const c of C){for(let k=0;k<=20;k++){const x=c.a[0]+(c.b[0]-c.a[0])*k/20,z=c.a[1]+(c.b[1]-c.a[1])*k/20;n++;if(fwForest(S,x,z)>0)forest++;}}
      return JSON.stringify({judges:J.length,clears:C.length,sclear:(S.clear||[]).length,forest,n});})()"""))
    ok(st['judges'] >= 2 and st['clears'] >= 1 and st['sclear'] >= 1 and st['forest'] == 0, 'база: судейские палатки %d, просеки %d, леса на базе нет (%d точек)' % (st['judges'], st['clears'], st['n']))
    js("try{flyClose()}catch(_){}"); pg.wait_for_timeout(800)
    # 4) первый полёт: программа из 5 заданий, «Сесть» → «Сам», итог с оценкой испытателя
    js("for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];")
    js("(()=>{G.y=1909;G.m=0;const d=airStartDesign(G.country,G.y);const md=airNewModel(G,{...d,name:'Опытный'},{status:'proto'});md.flown=0;md.status='proto';G.air.proto=[md.id];window.__md=md;airCheck(G);})()")
    r = js("(()=>{const e=G.pending.find(e=>(e.choices||[]).some(c=>/air:fly/.test(c[1])));if(!e)return 'нет события';G.pending=[e,...G.pending.filter(x=>x!==e)];resolve(e.choices.find(c=>/air:fly/.test(c[1]))[1]);return 'ok';})()")
    for i in range(300):
        pg.wait_for_timeout(500)
        if js("!!(FL.on&&FL.me&&document.getElementById('fLoad').hidden)") or not js('FL.on'): break
    ok(r == 'ok' and js('FL.on'), 'первый полёт загрузился (%.0f с)' % ((i + 1) * 0.5))
    g = js("document.getElementById('fGoal').textContent")
    ok('1 из 5' in g and 'Взлёт' in g, 'программа: «%s»' % g[:40])
    pg.set_viewport_size({'width': 844, 'height': 390}); pg.wait_for_timeout(1000)
    # газ в пол (как игрок) и набор высоты автопилотом в расчёте
    st = json.loads(js("""(()=>{FLY.thrT=1;const me=FL.me,M=FL.mi;for(let i=0;i<120*90;i++){const p0=[...me.p];flAuto(me,{hdg:0.6,alt:FW.S.A.y+130,thr:1});flStep(me,1/120);FL.t+=1/120;M.step(1/120,p0);if(M.over||M.phase>=2)break;}
       FLY.ce=null;return JSON.stringify({alt:Math.round(me.p[1]-FW.S.A.y),V:Math.round(me.V*3.6),crash:me.crash||null,phase:M.phase,canLand:M.canLand()});})()"""))
    ok(st['phase'] >= 2 and not st['crash'] and st['canLand'], 'взлёт и набор высоты на время: %s' % st)
    js("FL.me.ctl.aCmd=null;FLY.hudT=0;flyHUD(0.2,null)"); pg.wait_for_timeout(1500)
    g = js("document.getElementById('fGoal').textContent")
    ok('3 из 5' in g and 'пилон' in g.lower(), 'задание 3 — вираж вокруг пилона: «%s»' % g[:60])
    pg.screenshot(path=out + '3_test_air.png')
    ok(js("!document.getElementById('fLand').hidden"), 'кнопка «Сесть» видна')
    js("document.getElementById('fLand').click();FLY.hudT=0;flyHUD(0.2,null)"); pg.wait_for_timeout(300)
    r = json.loads(js("JSON.stringify({txt:document.getElementById('fLand').textContent,landing:!!FLY.landing,auto:!!FLY.auto})"))
    ok(r['txt'] == 'Сам' and r['landing'], '«Сесть»: лётчик ведёт на посадку, кнопка — «Сам» (%s)' % r)
    pg.screenshot(path=out + '4_landing.png')
    # посадка — в расчёте (в браузере без GPU кадры редкие, двухминутный заход занял бы четверть часа), как flyTick
    st = json.loads(js("""(()=>{const me=FL.me,M=FL.mi;let n=0,st='';for(let i=0;i<120*300&&FLY.landing;i++){const p0=[...me.p];const L=FLY.landing;st=flAutoLand(me,L.at,L.at[2],1/120);
       if(st==='done'){FLY.landing=null;me.ld=null;if(!M.over)L.fin();}flStep(me,1/120);FL.t+=1/120;if(!M.over&&M.step)M.step(1/120,p0);n++;if(me.crash)break;}
       return JSON.stringify({st,sec:Math.round(n/120),crash:me.crash||null,over:!!M.over,gnd:me.gnd,V:Math.round(me.V*3.6),dA:Math.round(Math.hypot(me.p[0]-M.A[0],me.p[2]-M.A[1]))});})()"""))
    ok(st['st'] == 'done' and st['over'] and not st['crash'] and st['dA'] < 300, 'лётчик посадил сам: %s' % st)
    for i in range(20):
        pg.wait_for_timeout(500)
        if js("!document.getElementById('fEnd').hidden"): break
    r = json.loads(js("JSON.stringify({end:!document.getElementById('fEnd').hidden,crash:FL.me&&FL.me.crash||null,txt:document.getElementById('fEnd').textContent,on:FL.on})"))
    ok(r['end'] and not r['crash'], 'итог на экране: %s' % (r['txt'] or '')[:90])
    ok('Оценка испытателя' in (r['txt'] or ''), 'в итоге — программа и оценка испытателя')
    pg.screenshot(path=out + '5_end.png')
    js("document.getElementById('fEndOk')&&document.getElementById('fEndOk').click()"); pg.wait_for_timeout(1200)
    ok(not js('FL.on') and js('window.__md.flown'), 'после полёта аэроплан облетан')
    ok(not errs, 'без ошибок в консоли' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
