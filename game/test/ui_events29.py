# 0.29: события гонки на трассе — толпа на дороге, таблички городов, солдаты, пост, столбы с проводами.
# python3 game/test/ui_events29.py <ключ гонки> [виды событий через запятую] — подъезжаем к каждому событию и снимаем кадры
from playwright.sync_api import sync_playwright
import sys, os
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/ev29/'
os.makedirs(out,exist_ok=True)
race=sys.argv[1] if len(sys.argv)>1 else 'pm1903-1903'
kinds=(sys.argv[2] if len(sys.argv)>2 else 'road,town,guard,post,storm,sbag,pass,lm,bridge,stand,finish').split(',')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':960,'height':480},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type in('error','warning') and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200);pg.click('[data-act=pion][data-v=renault]');pg.wait_for_timeout(150);pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    js("()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}}")
    js(f"""(()=>{{const rc=RACES.find(r=>r.key==='{race}');G.pending=[];G.y=rc.y;G.m=Math.max(0,rc.m-1);G.cash=200000;G.rdept=1;
      const md=G.models[0];{{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}}
      try{{localStorage.setItem('avt-tips3d','5')}}catch(_){{}}
      realLoad(rc,()=>startRace({{rc,mode:'drive',entries:[{{drv:'me',md:G.models[0],prep:2,tyre:'soft',gear:0}}]}}));}})()""")
    pg.wait_for_timeout(1500)
    for i in range(90):
        if js("!!(R&&R.gl&&R3&&R3.ready)"):break
        pg.wait_for_timeout(1000)
    js("R&&R.film&&filmSkip()");pg.wait_for_timeout(500)
    if js("!document.getElementById('rTips').hidden"):pg.click('#rTipsGo')
    print('gl',js("R.gl"),'evx',js("JSON.stringify((R.trk.evx||[]).map(e=>[e.k,e.a,Math.round(e.at),e.nm||'',e.t.slice(0,30)]))"))
    print('people',js("[R3.evcN,R3.people.length,R3.pN]"),'real',js("!!R.trk.real"),'win',js("R.trk.real?[R.trk.real.a,R.trk.real.b]:null"),'lm',js("JSON.stringify((R.trk.lm||[]).filter(q=>!q.far).map(q=>[q.t==='rlm'?q.name:q.t,q.i,Math.round(q.off)]))"))
    js("(()=>{R.hold=true;R.t=Math.max(R.t,2);R.cars.forEach(c=>{c.wait=false;});})()")
    ev=js("(R.trk.evx||[]).map((e,k)=>[k,e.k,e.a===undefined?-1:e.a,e.nm||'',e.t])")
    shot=0
    for k,kd,a,nm,t in ev:
        if kd not in kinds or a<0: continue
        for back,lab in ([60,'far'],[26,'near'],[6,'at']) if kd=='road' else ([28,'near'],):
            # ставим свою машину за back точек (4 м) до места, остальные — подальше позади
            js(f"""(()=>{{const T=R.trk,me=R.me,i=Math.max(0,{a}-{back});respawnAt(me,i);me.vx=14;me.ghostT=0;
              R.cars.forEach((c,q)=>{{if(c!==me){{respawnAt(c,Math.max(0,i-60-q*8));c.vx=0;}}}});R.follow=me;
              for(let s=0;s<16;s++){{R.time+=0.05;R.t+=0.05;raceTick(0.05);}} }})()""")
            pg.wait_for_timeout(2600)
            info=js("[R.me.idx,Math.round(R.me.prog),(R.me.vx||0).toFixed(1),document.getElementById('rCap').textContent,R3.evcN]")
            print(kd,lab,nm,t[:40],'->',info)
            pg.screenshot(path=out+f'{race}_{k}_{kd}_{lab}.png',timeout=120000);shot+=1
    # снимки в заданных точках: idx=790,800
    for a in (sys.argv[3].split(',') if len(sys.argv)>3 and sys.argv[3] else []):
        js(f"""(()=>{{const me=R.me;respawnAt(me,{int(a)});me.vx=6;for(let s=0;s<6;s++){{R.time+=0.05;raceTick(0.05);}} }})()""");pg.wait_for_timeout(2600)
        print('idx',a,js("[R.me.idx,document.getElementById('rCap').textContent,JSON.stringify(R.trk.spr.slice(Math.max(0,R.me.idx-2),R.me.idx+40).flatMap((L,k)=>L.filter(it=>['tsign','banner','crowd','gend','marsh','rhut','pole'].includes(it.t)).map(it=>[k+Math.max(0,R.me.idx-2),it.t,Math.round(it.off),it.nm||it.txt||''])).slice(0,30))]"))
        pg.screenshot(path=out+f'{race}_idx{a}.png',timeout=120000)
    # столбы с проводами: первый столб линии
    pi=js("(()=>{const T=R.trk;for(let i=T.startIdx+20;i<T.n-20;i++)for(const it of T.spr[i])if(it.t==='pole'&&it.nx!==undefined)return i;return -1;})()")
    if pi>=0 and 'pole' in kinds:
        js(f"(()=>{{const me=R.me;respawnAt(me,Math.max(0,{pi}-14));me.vx=8;for(let s=0;s<8;s++){{R.time+=0.05;raceTick(0.05);}} }})()");pg.wait_for_timeout(2600)
        pg.screenshot(path=out+f'{race}_poles.png',timeout=120000);print('poles at',pi)
    print('\n'.join(errs[:12]))
    b.close()
