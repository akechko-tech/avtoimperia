# Звук в браузере: моторы в отдельном потоке (AudioWorklet), звуки мира, диктор — без ошибок. python3 test/ui_audio.py [ключ гонки]
from playwright.sync_api import sync_playwright
import sys
race=sys.argv[1] if len(sys.argv)>1 else 'gpacf-1906'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg=b.new_page(viewport={'width':820,'height':400})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.type+': '+m.text) if m.type in('error','warning') and 'net::' not in m.text and 'Failed to load' not in m.text and 'willReadFrequently' not in m.text else None)
    pg.route(lambda u:not u.startswith('file:'),lambda r:r.abort())
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    js=lambda s:pg.evaluate(s)
    pg.mouse.click(10,10);pg.wait_for_timeout(300)
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200);pg.click('[data-act=pion][data-v=renault]');pg.wait_for_timeout(150);pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    js("()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}}")
    print('ctx',js("!!AU.ctx&&AU.ctx.state"),'EN',js("[EN.ok,EN.fail]"))
    for i in range(20):
        if js("EN.ok||EN.fail"):break
        pg.wait_for_timeout(250)
    print('EN after',js("[EN.ok,EN.fail]"))
    js("AU.on.gfx='2d';AU.on.sfx=true;")
    js(f"(()=>{{const rc=RACES.find(r=>r.key==='{race}');G.y=rc.y;const md=G.models[0];{{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}}try{{localStorage.setItem('avt-tips3d','5')}}catch(_){{}};startRace({{rc,mode:'drive',entries:[{{drv:'me',md,prep:2,tyre:'soft',gear:0}}]}});}})()")
    pg.wait_for_timeout(1500)
    js("R&&R.film&&filmSkip()");
    if js("!document.getElementById('rTips').hidden"):pg.click('#rTipsGo')
    print('race audio',js("AU.race?{wk:!!AU.race.wk,amb:AMB.on,slots:EN.slots.size}:null"))
    pg.keyboard.down('ArrowUp');pg.wait_for_timeout(8000)
    print('after 8s',js("({t:R.t.toFixed(1),slots:EN.slots.size,beds:Object.keys(AMB.beds).filter(k=>AMB.beds[k].src).join(','),bufs:Object.keys(AMB.buf).length,ctx:AU.ctx.currentTime.toFixed(1),me:R.me.vx.toFixed(1)})"))
    pg.keyboard.up('ArrowUp')
    js("finishRace(true)");pg.wait_for_timeout(800)
    print('after finish',js("({race:!!AU.race,amb:AMB.on,node:!!EN.node})"))
    print('\n'.join(errs[:20]))
    b.close()
