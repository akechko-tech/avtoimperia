# 0.37: проверки в браузере — путь «Авиатор»: цель новой игры, фильм героя (музыка на паузе, живой голос, фото), ангар,
# конструктор, «Небо» и состязание (Блерио — сам победитель по истории), первый полёт в 3D: загрузка, взлёт, «Сесть», итог, газета.
# python3 game/test/ui37.py
from playwright.sync_api import sync_playwright
import os, json
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui37/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m)
    if not c: fails += 1
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    pg.set_default_timeout(120000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();")
    # 1) новая игра: путь «Авиатор», цель — авиационная фирма
    js("openNewGame()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=ngDir][data-v=air]').click()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=country][data-v=fr]').click()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=pion][data-v=bleriot]').click()"); pg.wait_for_timeout(400)
    t = js("document.getElementById('sheet').textContent")
    ok('авиационную фирму' in t and 'автоимперию' not in t, 'новая игра «Авиатор»: цель — авиационная фирма, не автоимперия')
    pg.screenshot(path=out + '1_newgame.png')
    js("document.querySelector('[data-act=startgame]').click()"); pg.wait_for_timeout(1200)
    r = json.loads(js("JSON.stringify({p:G.pioneer,air:!!G.airStart,list:sagaList(G)===SAGA.bleriot,pend:G.pending.map(e=>e.saga||e.title)})"))
    ok(r['p'] == 'bleriot' and r['air'] and r['list'], 'старт за Блерио: фильм — «Блерио», не автомобильный (%s)' % r)
    # 2) фильм: первая глава — музыка на паузе, голос записан, фото «Блерио XI»
    js("for(let i=0;i<8;i++)try{closePaper();}catch(_){};sagaStop();G.pending=[];"); pg.wait_for_timeout(300)
    js("voiceLoad()"); pg.wait_for_timeout(1500)
    js("sagaPlay('bl1')"); pg.wait_for_timeout(1500)
    r = json.loads(js("JSON.stringify({hold:!!AU.sagaHold,title:document.querySelector('.sg-t')&&document.querySelector('.sg-t').textContent})"))
    ok(r['hold'] and r['title'] == 'Десятый аэроплан', 'глава 1 «%s»: музыка на паузе' % r['title'])
    js("clearTimeout(SAGAP.timer);sagaGo(2);clearTimeout(SAGAP.timer);"); pg.wait_for_timeout(1200)
    r = json.loads(js("JSON.stringify({src:document.querySelector('.sg-bg img').getAttribute('src')||'',txt:document.querySelector('.sg-say p').textContent,dur:voiceDur(sagaFill(SAGA.bleriot[0].sc[2].say,G),SAGA_NARR)})"))
    ok(r['src'] != '' and 'Одиннадцатый' in r['txt'] and r['dur'] > 3, 'сцена с фото «Блерио XI» и записанным голосом (%.1f с)' % r['dur'])
    pg.screenshot(path=out + '2_film.png')
    js("sagaQuestion()"); pg.wait_for_timeout(600)
    n = js("document.querySelectorAll('.sg-o').length")
    fx = js("document.querySelector('.sg-o small').textContent")
    ok(n == 3 and 'разработка быстрее' in fx, 'вопрос: 3 ответа, эффект по-авиационному («%s»)' % fx)
    c0 = js("G.cash"); js("sagaPick(0)"); pg.wait_for_timeout(500); js("sagaDone('bl1',0)"); pg.wait_for_timeout(500)
    ok(js("G.cash") > c0 and js("G.saga.seen.includes('bl1')") and not js("AU.sagaHold"), 'выбор применён, глава просмотрена, музыка вернулась')
    # 3) ангар, аэропланы, конструктор, небо
    js("tab='plant';render();window.scrollTo(0,0)"); pg.wait_for_timeout(500)
    t = js("document.getElementById('view').textContent")
    ok('Блерио XI' in t and 'АВИАМАСТЕРСКАЯ' in t.upper(), 'ангар: «Блерио XI» и авиамастерская')
    pg.screenshot(path=out + '3_hangar.png', full_page=True)
    js("tab='models';render()"); pg.wait_for_timeout(300); js("openAirDesigner()"); pg.wait_for_timeout(500)
    t = js("document.getElementById('sheet').textContent")
    ok('л.с.' in t and 'км/ч' in t, 'конструктор открывается: скорость и мощность')
    pg.screenshot(path=out + '4_designer.png')
    js("closeSheet();G.y=1909;G.m=6;tab='race';render()"); pg.wait_for_timeout(400)
    js("ACT.airEv({k:'channel-1909'})"); pg.wait_for_timeout(500)
    t = js("document.getElementById('sheet').textContent")
    ok('В истории это сделали вы' in t and 'Луи Блерио —' not in t, 'Ла-Манш за Блерио: «в истории это сделали вы», себя в соперниках нет')
    pg.screenshot(path=out + '5_channel.png')
    js("closeSheet()")
    # 4) первый полёт: опытный аэроплан → событие → 3D → взлёт → «Сесть» → итог → газета
    js("for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];AU.on.flyHelp=1;")
    js("(()=>{G.y=1909;G.m=0;const d=airStartDesign(G.country,G.y);const md=airNewModel(G,{...d,name:'Опытный'},{status:'proto'});md.flown=0;md.status='proto';G.air.proto=[md.id];window.__md=md;airCheck(G);})()")
    r = js("(()=>{const e=G.pending.find(e=>(e.choices||[]).some(c=>/air:fly/.test(c[1])));if(!e)return 'нет события';G.pending=[e,...G.pending.filter(x=>x!==e)];resolve(e.choices.find(c=>/air:fly/.test(c[1]))[1]);return 'ok';})()")
    ok(r == 'ok', 'событие «первый полёт» с кнопкой полёта: ' + r)
    for i in range(240):
        pg.wait_for_timeout(500)
        if js("!!(FL.on&&FL.me&&document.getElementById('fLoad').hidden)") or not js('FL.on'): break
    ok(js('FL.on') and js("!!FL.me"), '3D-полёт загрузился за %.1f с' % ((i + 1) * 0.5))
    pg.set_viewport_size({'width': 844, 'height': 390}); pg.wait_for_timeout(1500)
    pg.screenshot(path=out + '6_ground.png')
    st = json.loads(js("""(()=>{const me=FL.me,M=FL.mi;for(let i=0;i<120*120;i++){const p0=[...me.p];flAuto(me,{hdg:0.6,alt:FW.S.A.y+130,thr:1});flStep(me,1/120);FL.t+=1/120;M.step(1/120,p0);if(M.over||M.phase>=2)break;}
       FLY.ce=null;return JSON.stringify({alt:Math.round(me.p[1]-FW.S.A.y),V:Math.round(me.V*3.6),crash:me.crash||null,canLand:M.canLand()});})()"""))
    ok(st['alt'] > 60 and not st['crash'] and st['canLand'], 'взлёт и набор: %s' % st)
    js("FL.me.ctl.aCmd=null"); pg.wait_for_timeout(2500)
    pg.screenshot(path=out + '7_air.png')
    ok(js("!document.getElementById('fLand').hidden"), 'кнопка «Сесть» видна')
    # 0.38: «Сесть» — лётчик сам заводит на посадку (минуты игрового времени): считаем заход в расчёте, как flyTick
    js("document.getElementById('fLand').click()"); pg.wait_for_timeout(500)
    st = json.loads(js("""(()=>{const me=FL.me,M=FL.mi;let n=0,st='';for(let i=0;i<120*300&&FLY.landing;i++){const p0=[...me.p];const L=FLY.landing;st=flAutoLand(me,L.at,L.at[2],1/120);
       if(st==='done'){FLY.landing=null;me.ld=null;if(!M.over)L.fin();}flStep(me,1/120);FL.t+=1/120;if(!M.over&&M.step)M.step(1/120,p0);n++;if(me.crash)break;}
       return JSON.stringify({st,sec:Math.round(n/120),crash:me.crash||null,over:!!M.over});})()"""))
    for i in range(20):
        pg.wait_for_timeout(500)
        if js("!document.getElementById('fEnd').hidden"): break
    ok(st['st'] == 'done' and not st['crash'] and js("!document.getElementById('fEnd').hidden"), 'лётчик посадил сам (%s с), итог полёта на экране' % st['sec'])
    pg.screenshot(path=out + '8_end.png')
    js("document.getElementById('fEndOk')&&document.getElementById('fEndOk').click()"); pg.wait_for_timeout(1500)
    r = json.loads(js("JSON.stringify({on:FL.on,flown:window.__md.flown,pend:G.pending.map(e=>e.title)})"))
    ok(not r['on'] and r['flown'], 'после полёта: аэроплан облетан, газета: %s' % r['pend'][:2])
    ok(not errs, 'без ошибок в консоли' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
