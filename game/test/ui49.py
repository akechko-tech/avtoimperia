# 0.49: проверки в браузере, через настоящий цикл полёта (flyTick): боевой вылет кончается своим итогом — авария до цели («Сбит»/«неудача»)
# и «сбил аэростат, вернулся, сел» («задание выполнено»), в газете — аэроплан; первый полёт: «Осмотреться» → «Выход» принимает итог,
# второй первый полёт не предлагается; карточка «Мировые рекорды» в войну.  python3 game/test/ui49.py
from playwright.sync_api import sync_playwright
import os, json, sys
out = '/home/claude/work/ui49/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
only = sys.argv[1] if len(sys.argv) > 1 else ''
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 390, 'height': 760}, device_scale_factor=1)
    pg.set_default_timeout(240000)
    errs = []; pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
    pg.on('console', lambda m: errs.append('console.%s: %s' % (m.type, m.text[:300])) if m.type == 'error' and 'Failed to load' not in m.text and 'ERR_FAILED' not in m.text else None)
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();newAirGame('bleriot','fr','','normal','');"); pg.wait_for_timeout(1200)
    js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];AU.on.flyHelp=1;")
    def wait_loaded():
        for i in range(300):
            pg.wait_for_timeout(500)
            if js("!!(FL.on&&FL.me&&document.getElementById('fLoad').hidden)"): return True
            if not js('FL.on'): return False
        return False
    # свой цикл: кадры считаем сами (в безголовом браузере настоящий идёт по кадру в полсекунды), рисуем каждый 40-й
    HOOK = """cancelAnimationFrame(FLY.raf);FLY.raf=0;if(!window.__r0){window.__r0=fwRender;let n=0;window.fwRender=function(){if((n++%40)===0)return window.__r0.apply(this,arguments);};}
      window.tick=(n,dt,fn)=>{for(let i=0;i<n;i++){if(!FL.on||!FL.me)return 'closed@'+i;try{if(fn&&fn(i)==='stop')return 'stop@'+i;flyTick(dt,dt);}catch(e){return 'EXC@'+i+' '+(e.stack||e);}}return 'ok';};
      window.st=()=>JSON.stringify({on:FL.on,t:FL.t|0,V:FL.me?FL.me.V*3.6|0:null,h:FL.me?(FL.me.p[1]-FW.S.A.y)|0:null,x:FL.me?FL.me.p[0]|0:null,z:FL.me?FL.me.p[2]|0:null,gnd:FL.me?!!FL.me.gnd:null,crash:FL.me?FL.me.crash||null:null,over:FL.mi?!!FL.mi.over:null,obj:FL.mi?FL.mi.obj||0:null,ld:FLY.landing?(FL.me.ld?FL.me.ld.st:'?'):null});"""
    def run(n, fn='null', dt=0.05):
        return js("tick(%d,%s,%s)" % (n, dt, fn))
    def front(k, y):
        return js("""(()=>{G.pending=[];G.y=Math.floor(%s);G.m=Math.round((%s-G.y)*12);const t=tNow(G);const d=airRefMd('fight',t);
          const md=airNewModel(G,{...d,role:'fight',name:'Наш %s'},{status:'prod',flown:1});md.flown=1;md.status='prod';window.__md=md;const m={id:'u_%s_'+mi(G),k:'%s',T:mi(G),foes:0,ace:false};window.__m=m;
          return flyFront(m,md,airBestPilot(G));})()""" % (y, y, k, k, k))
    if only in ('', 'crash'):
        # 1) аэростат: взлетели и ткнулись в землю
        ok(front('balloon', 1915.9) and wait_loaded(), 'вылет «Аэростат наблюдения» (ноябрь 1915) загрузился'); js(HOOK)
        js("FL.mi.auto=()=>{};FLY.auto=true;")
        r = run(400, "(i)=>{const me=FL.me,M=FL.mi;const tg=M.target();flAuto(me,{x:tg[0],z:tg[2],alt:FW.S.A.y+120,thr:1,bank:0.6});if(!me.gnd&&me.p[1]-FW.S.A.y>60)return 'stop';}")
        js("FLY.auto=false;"); r = run(500, "(i)=>{if(FL.mi.over||FL.me.crash)return 'stop';FLY.thrT=1;FLY.keys.KeyW=true;}"); r2 = run(40); js("FLY.keys.KeyW=false")
        st = json.loads(js('st()')); pg.wait_for_timeout(3200)
        end = js("document.getElementById('fEnd').hidden?'':document.getElementById('fEnd').textContent")
        ok('EXC' not in r + r2 and st['on'] and st['crash'] and st['over'], 'авария: полёт не падает в «результат по расчёту» — %s %s' % (st['crash'], (r + r2)[:160] if 'EXC' in r + r2 else ''))
        ok(end.startswith('Сбит') and 'Аэроплан разбит' in end and 'Принять' in end, 'окно итога: «%s»' % end[:90])
        pg.screenshot(path=out + '1_crash_end.png')
        js("document.getElementById('fEndOk').click()"); pg.wait_for_timeout(900)
        t = js("document.getElementById('paperWrap').hidden?'':document.getElementById('paperWrap').textContent")
        ok(not js('FL.on') and 'Аэростат наблюдения: неудача' in t and 'Аэроплан разбит' in t and 'Аэростат вспыхнул' not in t, 'газета пишет то, что было: «Аэростат наблюдения: неудача… Аэроплан разбит»')
        ok(js("!!document.querySelector('#paperWrap .p-fig.p-air svg')") and not js("!!document.querySelector('#paperWrap .p-fig:not(.p-air)')"), 'в газете — аэроплан, не автомобиль')
        pg.screenshot(path=out + '2_crash_paper.png')
        js("for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];")
    if only in ('', 'win'):
        # 2) сбил аэростат, вернулся, сел
        ok(front('balloon', 1917.75) and wait_loaded(), 'вылет «Аэростат наблюдения» (октябрь 1917) загрузился'); js(HOOK)
        js("FL.mi.auto=()=>{};FLY.auto=true;FL.noFail=true;")
        r = run(900, "(i)=>{const me=FL.me,M=FL.mi;const tg=M.target();flAuto(me,{x:tg[0],z:tg[2],alt:FW.S.A.y+450,thr:1,bank:0.6});if(!me.gnd&&me.p[1]-FW.S.A.y>250)return 'stop';}")
        js("(()=>{const M=FL.mi;M.aaZ=null;M.ball.hp=0;M.ball.burn=FL.t;M.onBall();})()")
        ok(js('FL.mi.obj') == 1, 'аэростат подожжён (как от очереди)')
        land = False
        for k in range(60):
            r = run(300, "(i)=>{const me=FL.me,M=FL.mi;if(M.over)return 'stop';if(FLY.landing)return;flAuto(me,{x:0,z:-900,alt:FW.S.A.y+220,thr:1,bank:0.6});if(M.canLand()&&Math.hypot(me.p[0],me.p[2]+900)<1500){FLY.auto=false;document.getElementById('fLand').click();}}")
            if 'ok' not in r: break
        st = json.loads(js('st()')); pg.wait_for_timeout(1500)
        end = js("document.getElementById('fEnd').hidden?'':document.getElementById('fEnd').textContent")
        ok('EXC' not in r and st['over'] and not st['crash'] and st['gnd'], 'вернулся и сел: %s %s' % (js('st()'), r[:200] if 'EXC' in r else ''))
        ok(end.startswith('Задание выполнено!') and 'Аэростат сожжён' in end, 'окно итога: «%s»' % end[:60])
        pg.screenshot(path=out + '3_win_end.png')
        js("document.getElementById('fEndOk').click()"); pg.wait_for_timeout(900)
        t = js("document.getElementById('paperWrap').hidden?'':document.getElementById('paperWrap').textContent")
        ok('Аэростат наблюдения: задание выполнено' in t and 'Аэростат сожжён' in t and 'неудача' not in t.lower() and 'не вытянул' not in t, 'газета: «Аэростат наблюдения: задание выполнено» — сбил и вернулся, значит выполнено')
        ok(js("!!document.querySelector('#paperWrap .p-fig.p-air svg')"), 'в газете — аэроплан')
        fr = json.loads(js("JSON.stringify(G.air.fr)")); ok(fr['n'] >= 1 and js("G.air.front[__m.id].ok") is True, 'в журнале фронта вылет засчитан: %s' % fr)
        pg.screenshot(path=out + '4_win_paper.png')
        js("for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];")
    if only in ('', 'test'):
        # 3) первый полёт: итог → «Осмотреться» → «Выход»
        r = js("""(()=>{G.pending=[];G.y=1913;G.m=4;const t=tNow(G);const d=airRefMd('sport',t);const md=airNewModel(G,{...d,role:'sport',name:'Опыт'},{status:'proto'});md.status='proto';md.flown=0;window.__md=md;G.cash=50000;return flyTest(md);})()""")
        ok(r and wait_loaded(), 'первый полёт «Опыт» загрузился'); js(HOOK); js("FL.mi.auto=()=>{};FLY.auto=true;FL.noFail=true;")
        AP = """(i)=>{const me=FL.me,M=FL.mi;if(M.over)return 'stop';if(FLY.landing)return;const tg=M.target?M.target():null,gy=FW.S.A.y;
          if(me.gnd)flAuto(me,{hdg:flHdg(me),thr:1});else if(tg)flAuto(me,{x:tg[0],z:tg[2],alt:tg[1]!==undefined?tg[1]+(M.phase===3?8:0):gy+170,thr:1,bank:0.6,floor:M.phase===3?12:40});else flAuto(me,{hdg:flHdg(me),alt:gy+200,thr:1});
          if(M.phase>=4&&M.canLand()){FLY.auto=false;document.getElementById('fLand').click();}}"""
        for k in range(60):
            r = run(300, AP)
            if 'ok' not in r: break
        pg.wait_for_timeout(1500)
        end = js("document.getElementById('fEnd').hidden?'':document.getElementById('fEnd').textContent")
        ok('EXC' not in r and js('FL.mi.over') and 'Осмотреться' in end, 'программа пройдена, окно итога: «%s»' % end[:70])
        ok(('Вы подняли' in end and 'пробыли' in end) or 'поднял' in end or 'слушается и садится' in end or 'взлетел, но тянет' in end, 'отчёт согласован в числе: «%s»' % end[end.find('»') + 1:][:60])
        js("document.getElementById('fEndLook').click()"); pg.wait_for_timeout(300)
        ok(js("document.getElementById('fEnd').hidden"), '«Осмотреться» — окно скрыто')
        js("document.getElementById('fQuit').click()"); pg.wait_for_timeout(900)
        m = json.loads(js("JSON.stringify({st:__md.status,flown:__md.flown,flights:G.air.flights,can:airCanTest(__md)})"))
        t = js("document.getElementById('paperWrap').hidden?'':document.getElementById('paperWrap').textContent")
        ok(not js('FL.on') and m['flown'] == 1 and not m['can'] and 'Первый полёт' in t and '«Опыт»' in t, '«Выход» после «Осмотреться»: итог принят — образец облётан, газета «%s»' % t[t.find('«Опыт»'):][:40])
        ok(js("!!document.querySelector('#paperWrap .p-fig.p-air svg')") and not js("!!document.querySelector('#paperWrap .p-fig:not(.p-air)')"), 'в газете о первом полёте — аэроплан')
        pg.screenshot(path=out + '5_test_paper.png')
        js("for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];tab='models';render()"); pg.wait_for_timeout(400)
        f0 = m['flights']; js("ACT.airFlyBtn({k:String(__md.id)})"); pg.wait_for_timeout(400)
        ok(not js('FL.on') and js('G.air.flights') == f0 and not js("!!document.querySelector('[data-act=airFlyBtn][data-k=\"'+__md.id+'\"]')"), 'второй первый полёт не начинается, кнопки «Первый полёт» у облётанного образца нет')
    if only in ('', 'rec'):
        # 4) рекорды в войну
        js("try{flyClose()}catch(_){};G.pending=[];G.y=1916;G.m=0;tab='race';render()"); pg.wait_for_timeout(500)
        t = js("[...document.querySelectorAll('#view .card')].map(c=>c.textContent).find(x=>/Мировые рекорды/.test(x))||''")
        ok('Идёт война: федерация рекордов не засчитывает' in t and t.count('После войны') == 3, 'январь 1916, «Мировые рекорды»: объяснение и три кнопки «После войны»')
        js("(()=>{const c=[...document.querySelectorAll('#view .card')].find(c=>/Мировые рекорды/.test(c.textContent));if(c)c.scrollIntoView();})()"); pg.wait_for_timeout(300)
        pg.screenshot(path=out + '6_records_war.png')
    ok(not errs, 'ошибок в консоли нет' + ((': ' + ' | '.join(errs[:3])) if errs else ''))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
