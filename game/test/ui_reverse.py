# Браузерная проверка: задний ход (подпись педали, «R» на приборе) и кнопка «Вернуться на трассу»
from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/s19/'
race='pbp-1895'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':820,'height':400},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200)
    pg.click('[data-act=pion][data-v=renault]');pg.wait_for_timeout(150)
    pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}}");pg.wait_for_timeout(200)
    pg.evaluate(f"""(()=>{{const rc=RACES.find(r=>r.key==='{race}');G.pending=[];G.y=rc.y;G.m=Math.max(0,rc.m-1);G.cash=200000;G.rdept=1;
      const md=G.models[0];{{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}}
      G.drivers=availDrivers(G).sort((a,b)=>b.sk-a.sk).slice(0,2).map(d=>d.id);tab='race';render();}})()""")
    pg.wait_for_timeout(300)
    js=lambda s:pg.evaluate(s)
    js("AU.on.gfx='2d'")
    js(f"document.querySelector('[data-act=raceSetup][data-k=\"{race}\"]').click()");pg.wait_for_timeout(400)
    pg.click('[data-act=rAdd]');pg.wait_for_timeout(300)
    pg.click('[data-act=rMode][data-v=drive]');pg.wait_for_timeout(200)
    pg.click('[data-act=raceGo]');pg.wait_for_timeout(1500)
    js("try{localStorage.setItem('avt-tips3d','5')}catch(_){}")
    js("R&&R.film&&filmSkip()");pg.wait_for_timeout(500)
    if js("!document.getElementById('rTips').hidden"):pg.click('#rTipsGo')
    # дождаться старта (фильм перед гонкой, отсчёт)
    for i in range(120):
        if js("R&&R.t>1.2&&!document.getElementById('raceScreen').classList.contains('filming')"):break
        pg.wait_for_timeout(500)
    print('t',js("R.t"))
    pg.wait_for_timeout(300)
    print('brake label still:',js("document.querySelector('#rCtrl .brk').textContent"))
    pg.screenshot(path=out+'rev0.png')
    pg.keyboard.down('ArrowDown')
    for i in range(80):
        if js("R.me.rev&&R.me.vx<-1"):break
        pg.wait_for_timeout(250)
    print('rev',js("[R.me.rev,R.me.vx.toFixed(2),document.getElementById('hGear').textContent,document.querySelector('#rCtrl .brk').textContent]"))
    pg.screenshot(path=out+'rev1.png')
    pg.keyboard.up('ArrowDown');pg.keyboard.down('ArrowUp')
    for i in range(80):
        if js("!R.me.rev&&R.me.vx>2"):break
        pg.wait_for_timeout(250)
    print('fwd',js("[R.me.rev,R.me.vx.toFixed(2),document.getElementById('hGear').textContent,document.querySelector('#rCtrl .brk').textContent]"))
    pg.keyboard.up('ArrowUp')
    # увели машину в поле — ждём кнопку
    js("R.me.lat=R.trk.W/2+8;R.me.x+=R.trk.N[R.me.idx][0]*8;R.me.z+=R.trk.N[R.me.idx][1]*8;R.me.vx=0;")
    for i in range(80):
        if js("!document.getElementById('rReset').hidden"):break
        pg.wait_for_timeout(250)
    print('reset visible',js("!document.getElementById('rReset').hidden"),js("R.me.stuck.toFixed(2)"))
    pg.screenshot(path=out+'rev2.png')
    pg.click('#rReset');pg.wait_for_timeout(3000)
    print('after reset lat',js("R.me.lat.toFixed(2)"),js("document.getElementById('rReset').hidden"))
    print('\n'.join(errs[:20]))
    b.close()
