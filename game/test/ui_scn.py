# Сценарии в браузере (3D): очередь у старта, машина-лидер, Ле-Ман, часы и небо. python3 test/ui_scn.py [ключ гонки] [тег]
from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/s19/'
race=sys.argv[1] if len(sys.argv)>1 else 'pm1903-1903'
tag=sys.argv[2] if len(sys.argv)>2 else race
times=[float(x) for x in (sys.argv[3].split(',') if len(sys.argv)>3 else ['0.5','60','140'])]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':900,'height':450},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type in('error','warning') and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200);pg.click('[data-act=pion][data-v=renault]');pg.wait_for_timeout(150);pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    js("()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}}")
    js(f"""(()=>{{const rc=RACES.find(r=>r.key==='{race}');G.pending=[];G.y=rc.y;G.m=Math.max(0,rc.m-1);G.cash=200000;G.rdept=1;
      const md=G.models[0];{{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}}
      G.drivers=availDrivers(G).sort((a,b)=>b.sk-a.sk).slice(0,1).map(d=>d.id);tab='race';render();try{{localStorage.setItem('avt-tips3d','5')}}catch(_){{}} }})()""")
    if js(f"!!document.querySelector('[data-act=raceSetup][data-k=\"{race}\"]')"):
        js(f"document.querySelector('[data-act=raceSetup][data-k=\"{race}\"]').click()");pg.wait_for_timeout(400)
        pg.click('[data-act=rMode][data-v=drive]');pg.wait_for_timeout(200)
        pg.click('[data-act=raceGo]');pg.wait_for_timeout(1500)
    else:
        js(f"(()=>{{const rc=RACES.find(r=>r.key==='{race}');startRace({{rc,mode:'drive',entries:[{{drv:'me',md:G.models[0],prep:2,tyre:'soft',gear:0}}]}});}})()");pg.wait_for_timeout(1500)
    for i in range(60):
        if js("!!(R&&R.gl&&R3&&R3.ready)"):break
        pg.wait_for_timeout(1000)
    js("R&&R.film&&filmSkip()");pg.wait_for_timeout(300)
    if js("!document.getElementById('rTips').hidden"):pg.click('#rTipsGo')
    print('gl',js("R.gl"),'scn',js("R.scn&&[R.scn.st,R.scn.h0,R.scn.span,R.scn.wxP.map(x=>x.join('/')).join(' ')]"))
    for k,t in enumerate(times):
        mk=sys.argv[4] if len(sys.argv)>4 else ''
        js(f"(()=>{{R.hold=true;R.t=Math.max(R.t,1);R.time={t};R.cars.forEach(c=>{{if(c.wait&&R.time>=(c.relT||0)&&R.scn&&R.scn.st!=='lemans')c.wait=false;}});for(let i=0;i<40;i++)scnWxTick(0.5,R.time/Math.max(30,R.trk.cfg.dur));if('{mk}')R.scn.moodK=+'{mk}'||0;}})()")
        pg.wait_for_timeout(2500)
        print('skies',js("[Object.keys(G3.cache.tx.sky).join(','),JSON.stringify(R3.skyLoading||{}),!!R3.sky,!!R3.sky2,R3.E&&R3.E.skyMix]"))
        info=js("[scnClockTxt(),R.wx.mood,R.scn.moodA,R.scn.moodB,R.scn.moodK.toFixed(2),(R.rainK||0).toFixed(2),(R.wetK||0).toFixed(2),R3.sky2?'sky2':'-',document.getElementById('rClock').textContent,document.getElementById('rCap').textContent]")
        print('t',t,info)
        pg.screenshot(path=out+f'scn_{tag}_{k}.png',timeout=120000)
    print('\n'.join(errs[:12]))
    b.close()
