# 0.37: все виды полётов в браузере — каждое задание загружается, летит 20 с на автопилоте к цели и закрывается без ошибок:
# круг, высота, дальность, перелёт через Альпы, военный конкурс, мёртвая петля, гонка с соперниками, гидроаэропланы,
# рекорды (скорость, высота, дальность), фронт (патруль, перехват, аэростат, разведка, бомбардировка).  python3 game/test/ui37b.py
from playwright.sync_api import sync_playwright
import os, json, time
out = '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ui37b/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
CASES = [('ev', 'archdeacon-1908'), ('ev', 'reims-alt-1909'), ('ev', 'reims-gp-1909'), ('ev', 'alps-1910'), ('ev', 'concours-1911'),
         ('ev', 'loop-1913'), ('ev', 'gb-1912'), ('ev', 'schneider-1926'), ('rec', 'speed@1912.5'), ('rec', 'alt@1913.5'), ('rec', 'dist@1925.5'),
         ('war', 'patrol@1916.7'), ('war', 'intercept@1917.3'), ('war', 'balloon@1917.6'), ('war', 'recon@1916.2'), ('war', 'bomb@1918.3')]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=1)
    pg.set_default_timeout(180000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'Failed to load' not in m.text and 'ERR_FAILED' not in m.text else None)
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s: pg.evaluate(s)
    js("demoStop();hideMainMenu();openNewGame()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=ngDir][data-v=air]').click()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=country][data-v=fr]').click()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=pion][data-v=bleriot]').click()"); pg.wait_for_timeout(300)
    js("document.querySelector('[data-act=startgame]').click()"); pg.wait_for_timeout(1000)
    js("try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){};G.pending=[];AU.on.flyHelp=1;")
    for kind, key in CASES:
        e0 = len(errs); t0 = time.time()
        if kind == 'ev':
            r = js("""(()=>{const E=AIR_EV.find(e=>e.key==='%s');G.y=E.y;G.m=E.m;const t=E.y+E.m/12;const role=E.sea?(t>=1913?'race':'sea'):E.kind==='speed'?(t<1912?'sport':'race'):E.mil?E.mil.role:'sport';
              const d=airRefMd(role,t);const md=airNewModel(G,{...d,role,name:'Тест'},{status:'prod',flown:1});md.flown=1;md.status='prod';if(E.sea&&!airStats(md,t).sea)md.g='g4';
              return flyEvent(E,md,'hero')?E.name:'не стартовал';})()""" % key)
        elif kind == 'rec':
            k, y = key.split('@')
            r = js("""(()=>{G.y=Math.floor(%s);G.m=Math.round((%s-G.y)*12);const t=tNow(G);const d=airRefMd('%s'==='dist'?'recon':'race',t);const md=airNewModel(G,{...d,role:'race',name:'Рекорд'},{status:'race',flown:1});md.flown=1;
              return flyRecord('%s',md,'hero')?'рекорд %s':'не стартовал';})()""" % (y, y, k, k, k))
        else:
            k, y = key.split('@')
            r = js("""(()=>{G.y=Math.floor(%s);G.m=Math.round((%s-G.y)*12);const t=tNow(G);const role='%s'==='bomb'?'bomb':'%s'==='recon'?'recon':'fight';const d=airRefMd(role,t);
              const md=airNewModel(G,{...d,role,name:'Наш'},{status:'prod',flown:1});md.flown=1;md.status='prod';const L=frMissions(G);const m=L.find(x=>x.k==='%s')||{id:'x_%s',k:'%s',T:mi(G),foes:2,ace:false};
              return flyFront(m,md,airBestPilot(G))?'фронт %s':'не стартовал';})()""" % (y, y, k, k, k, k, k, k))
        loaded = False
        for i in range(240):
            pg.wait_for_timeout(500)
            if js("!!(FL.on&&FL.me&&document.getElementById('fLoad').hidden)"): loaded = True; break
            if not js('FL.on'): break
        if not loaded:
            ok(False, '%s: %s — не загрузился %s' % (key, r, errs[e0:e0 + 2])); js("try{flyClose()}catch(_){}"); continue
        st = json.loads(js("""(()=>{const me=FL.me,M=FL.mi;let n=0;for(let i=0;i<120*20;i++){const p0=[...me.p];const tg=M.target?M.target():null;
            if(M.auto)M.auto(1/120);else if(tg)flAuto(me,{x:tg[0],z:tg[2],alt:(FW.S.A?FW.S.A.y:0)+150,thr:1,bank:0.8});else flAuto(me,{hdg:flHdg(me),alt:me.p[1]+80,thr:1});
            flStep(me,1/120);(M.rivals||[]).forEach(k=>flKinStep(k,1/120));if(M.ai)M.ai(1/120);FL.t+=1/120;if(M.step)M.step(1/120,p0);n++;if(M.over||me.crash)break;}
            FLY.ce=null;return JSON.stringify({V:Math.round(me.V*3.6),h:Math.round(me.p[1]-(FW.S.A?FW.S.A.y:0)),crash:me.crash||null,over:!!M.over,foes:(M.foes||[]).length,rivals:(M.rivals||[]).length,n});})()"""))
        pg.wait_for_timeout(2500)
        pg.screenshot(path=out + key.replace('@', '_') + '.png')
        js("try{flyClose()}catch(_){}"); pg.wait_for_timeout(800)
        e = errs[e0:]
        ok(not e and not st['crash'] and not js('FL.on'), '%s: %s — %.0f с, %s%s' % (key, r, time.time() - t0, st, (' ОШИБКИ: ' + ' | '.join(e[:2])) if e else ''))
    b.close()
print('ОШИБОК: %d' % fails if fails else 'всё в порядке')
