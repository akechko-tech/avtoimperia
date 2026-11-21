# 0.51, этап 7: авиация в браузере — переключатель «Автомобили | Аэропланы», подсказки конструктора, «Подобрать под заказчика»,
# и воздушный бой: метка врага (ромб / стрелка за краем), прицел и кружок упреждения, «ВРАГ НА ХВОСТЕ».  python3 game/test/ui51air.py
from playwright.sync_api import sync_playwright
import os, json
out = '/home/claude/work/ui51air/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    # ---------- автомобильная фирма с авиацехом ----------
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    pg.set_default_timeout(180000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();")
    js("newGame('ford','us','Форд Мотор','normal','Модель V');G.pending=[];try{sagaStop();}catch(_){};G.y=1916;G.m=4;G.cash=3e6;for(let i=0;i<8;i++)try{closePaper();}catch(_){}")
    js("tab='plant';render()"); pg.wait_for_timeout(300)
    ok(not js("!!document.getElementById('linesw')"), 'авиацеха нет — переключателя на «Заводе» нет')
    js("airInit(G);G.air.lv=1;G.air.cap=2;G.air.wk=12;uiLine='car';tab='plant';render()"); pg.wait_for_timeout(300)
    r = json.loads(js("""JSON.stringify((()=>{const m=document.querySelector('main')||document.body,sw=document.getElementById('linesw');if(!sw)return {sw:false};
      const r=sw.getBoundingClientRect(),first=[...m.querySelectorAll('section.card')][0];return {sw:true,top:Math.round(r.top),n:sw.querySelectorAll('.chip').length,on:sw.querySelector('.chip.on').dataset.v,
        above:!first||r.top<first.getBoundingClientRect().top,txt:sw.textContent};})())"""))
    ok(r.get('sw') and r['n'] == 2 and r['on'] == 'car' and r['above'], 'переключатель «Автомобили | Аэропланы» — вверху «Завода», над карточками: %s' % r)
    car_len = js("document.querySelector('main').textContent.length")
    pg.screenshot(path=out + 'plant_car.png')
    js("document.querySelector('#linesw [data-v=air]').click()"); pg.wait_for_timeout(400)
    r = json.loads(js("""JSON.stringify({line:uiLine,on:document.querySelector('#linesw .chip.on').dataset.v,txt:document.querySelector('main').textContent.slice(0,600),
      air:/Авиацех|ангар|мастер/i.test(document.querySelector('main').textContent),car:/Конвейер|Дилер/.test(document.querySelector('main').textContent)})"""))
    ok(r['line'] == 'air' and r['on'] == 'air' and r['air'] and not r['car'], 'нажали «Аэропланы» — на вкладке только авиацех (автомобильного нет): %s' % r['txt'][:160].replace('\n', ' '))
    pg.screenshot(path=out + 'plant_air.png')
    for t in ['models', 'market', 'race']:
        js("tab='%s';render()" % t); pg.wait_for_timeout(300)
        r = js("({sw:!!document.getElementById('linesw'),on:(document.querySelector('#linesw .chip.on')||{dataset:{}}).dataset.v,bad:/Ошибка экрана/.test(document.querySelector('main').textContent),n:document.querySelector('main').textContent.length})")
        ok(r['sw'] and r['on'] == 'air' and not r['bad'] and r['n'] > 80, 'вкладка %s: выбор направления сохраняется, раздел авиации открыт' % t)
    pg.screenshot(path=out + 'race_air.png')
    js("tab='models';render()"); pg.wait_for_timeout(200)
    js("document.querySelector('#linesw [data-v=car]').click()"); pg.wait_for_timeout(300)
    ok(js("uiLine==='car'&&/Модель V/.test(document.querySelector('main').textContent)"), 'обратно на «Автомобили» — автомобильные модели на месте')
    # конструктор аэроплана: подсказки
    js("openAirDesigner('fight')"); pg.wait_for_timeout(500)
    js("document.querySelector('[data-act=adSec][data-k=e]').click()"); pg.wait_for_timeout(400)
    r = json.loads(js("""JSON.stringify((()=>{const h=document.getElementById('adhint'),bt=document.querySelector('[data-act=adAuto]'),sh=document.getElementById('sheetBody')||document.body;
      const notes=[...sh.querySelectorAll('.dsec.open .chip small')].filter(e=>/^оценка [0-9],[0-9][0-9]/.test(e.textContent.trim())).length;
      return {hint:h?h.textContent:'',bt:!!bt,notes,star:(sh.textContent.match(/★/g)||[]).length,year:/в год/.test(sh.textContent),q:airQ(ADR,tNow(G)).q,err:airDesignErr(G,ADR).length};})())"""))
    ok('Покупают' in r['hint'] and 'Ценят' in r['hint'], 'конструктор: подсказка о заказчике — %s' % r['hint'][:140])
    ok(r['bt'] and r['notes'] >= 5 and r['star'] >= 1 and r['year'], 'открыли моторы: у каждого — оценка заказчиков (%d подписей), лучший отмечен ★; у назначений — сколько берут в год' % r['notes'])
    pg.screenshot(path=out + 'designer.png')
    q0 = r['q']
    js("document.querySelector('[data-act=adAuto]').click()"); pg.wait_for_timeout(600)
    r = json.loads(js("JSON.stringify({q:airQ(ADR,tNow(G)).q,err:airDesignErr(G,ADR),role:ADR.role})"))
    ok(not r['err'] and r['role'] == 'fight', '«Подобрать под заказчика»: аэроплан собирается без ошибок, оценка %.2f → %.2f' % (q0, r['q']))
    pg.screenshot(path=out + 'designer_auto.png')
    ok(not errs, 'без ошибок в консоли' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    pg.close()
    # ---------- воздушный бой ----------
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=1)
    pg.set_default_timeout(180000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();newAirGame('bleriot','fr','','normal','');G.pending=[];try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};AU.on.flyHelp=1;")
    ok(not js('!!AU.on.frHelp51'), 'справку о бое ещё не показывали')
    r = js("""(()=>{G.y=1917;G.m=5;G.air.lv=Math.max(1,G.air.lv||0);const t=tNow(G),d=airRefMd('fight',t);const md=airNewModel(G,{...d,role:'fight',name:'Наш'},{status:'prod',flown:1});md.flown=1;md.status='prod';
      const m={id:'x_patrol',k:'patrol',T:mi(G),foes:2,ace:false};return flyFront(m,md,airBestPilot(G))?'патруль':'не стартовал';})()""")
    loaded = False
    for i in range(240):
        pg.wait_for_timeout(500)
        if js("!!(FL.on&&FL.me&&document.getElementById('fLoad').hidden)"): loaded = True; break
    ok(loaded, 'боевой вылет загрузился: %s' % r)
    pg.wait_for_timeout(900)
    r = json.loads(js("JSON.stringify((()=>{const b=document.getElementById('fHelpBox');return {open:!b.hidden,txt:b.textContent.slice(0,400),flag:!!AU.on.frHelp51,paused:!!FL.paused};})())"))
    ok(r['open'] and r['flag'] and 'Красный ромб' in r['txt'] and 'ВРАГ НА ХВОСТЕ' in r['txt'] and 'позеленел' in r['txt'], 'первый боевой вылет: справка о метках и прицеле открылась сама — %s' % r['txt'][14:150])
    pg.screenshot(path=out + 'fight_help.png')
    js("document.getElementById('fHelpOk').click()"); pg.wait_for_timeout(300)
    if loaded:
        air = js("""(()=>{const me=FL.me,M=FL.mi,gy=FW.S.A?FW.S.A.y:0;FLY.thrT=1;for(let i=0;i<120*90&&(me.gnd||me.p[1]-gy<500);i++){flAuto(me,{hdg:flHdg(me),alt:gy+650,thr:1});flStep(me,1/120);FL.t+=1/120;}return Math.round(me.p[1]-gy)+' м, '+(me.gnd?'на земле':'в воздухе')+(me.crash?' РАЗБИТ':'');})()"""); pg.wait_for_timeout(1200)
        ok('в воздухе' in air and 'РАЗБИТ' not in air, 'взлетели: ' + air)
        PUT = """const me=FL.me,M=FL.mi,f=M.foes[0],g=M.foes[1];const put=(a,fw,rt,up,hd)=>{a.p=[me.p[0]+me.fw[0]*fw+me.rt[0]*rt,me.p[1]+up,me.p[2]+me.fw[2]*fw+me.rt[2]*rt];const o=flCraft(a.md,tNow(G),{rnd:()=>0.3});flPlace(o,a.p[0],a.p[2],flHdg(me)+hd,{h:a.p[1],v:me.V,thr:1});
            ['p','v','fw','rt','up','q','w'].forEach(k=>{if(o[k]!==undefined)a[k]=Array.isArray(o[k])?o[k].slice():o[k];});a.ai.st='attack';};"""
        # враг впереди, второй — далеко справа за краем экрана
        r = json.loads(js("(()=>{" + PUT + """put(f,230,6,4,0);put(g,-300,2500,100,0);flyFoeMarks();const W=document.querySelector('.f-foes'),E=[...W.querySelectorAll('.f-foe')].filter(e=>!e.hidden);
            return JSON.stringify({n:E.length,on:E.filter(e=>!e.classList.contains('edge')).length,edge:E.filter(e=>e.classList.contains('edge')).length,txt:E.map(e=>e.textContent),lead:!W.querySelector('.f-lead').hidden,lock:W.querySelector('.f-lead').classList.contains('lock'),
              gun:!W.querySelector('.f-gun').hidden,six:!W.querySelector('.f-six').hidden,pos:E.map(e=>[parseInt(e.style.left),parseInt(e.style.top)])});})()"""))
        ok(r['n'] == 2 and r['on'] == 1 and r['edge'] == 1 and r['lead'] and r['gun'] and not r['six'], 'враг впереди — ромб с расстоянием, прицел и кружок упреждения; второй за краем — стрелка: %s' % r)
        ok(any('м' in t for t in r['txt']) and any('км' in t for t in r['txt']), 'у меток расстояние: %s' % r['txt'])
        pg.screenshot(path=out + 'fight_front.png')
        # враг сзади, носом на нас
        r = json.loads(js("(()=>{" + PUT + """put(f,-200,-25,6,0);put(g,-300,2500,100,0);flyFoeMarks();const W=document.querySelector('.f-foes'),E=[...W.querySelectorAll('.f-foe')].filter(e=>!e.hidden),sx=W.querySelector('.f-six');
            return JSON.stringify({n:E.length,edge:E.filter(e=>e.classList.contains('edge')).length,hot:E.filter(e=>e.classList.contains('hot')).length,six:sx.hidden?'':sx.textContent,lead:!W.querySelector('.f-lead').hidden});})()"""))
        ok(r['edge'] == 2 and r['hot'] == 1 and 'ВРАГ НА ХВОСТЕ' in r['six'] and 'слева' in r['six'] and not r['lead'], 'враг сзади — стрелка у края мигает, надпись «%s»' % r['six'])
        pg.screenshot(path=out + 'fight_six.png')
        # вылет окончен — меток нет
        r = js("(()=>{FL.mi.over=true;flyFoeMarks();const W=document.querySelector('.f-foes');const n=[...W.querySelectorAll('.f-foe')].filter(e=>!e.hidden).length;FL.mi.over=false;return n+(W.querySelector('.f-six').hidden?0:10);})()")
        ok(r == 0, 'вылет окончен — меток и предупреждения нет')
        js("try{flyClose()}catch(_){}"); pg.wait_for_timeout(600)
    ok(not errs, 'бой: без ошибок в консоли' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ok' if not fails else 'FAILED %d' % fails)
