# Звуки мира, диктор и оркестр с веб-сервера (как на сайте игры). python3 test/ui_audio2.py
from playwright.sync_api import sync_playwright
import sys
race=sys.argv[1] if len(sys.argv)>1 else 'pm1903-1903'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'],proxy=None)
    ctx=b.new_context(viewport={'width':820,'height':400});pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.type+': '+m.text) if m.type in('error','warning') and 'willReadFrequently' not in m.text and 'swiftshader' not in m.text.lower() else None)
    pg.route(lambda u:not u.startswith('http://localhost'),lambda r:r.abort())
    pg.goto('http://localhost:8765/');pg.wait_for_timeout(800)
    js=lambda s:pg.evaluate(s)
    pg.mouse.click(10,10);pg.wait_for_timeout(300)
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200);pg.click('[data-act=pion][data-v=renault]');pg.wait_for_timeout(150);pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    js("()=>{for(let i=0;i<6;i++)closePaper();closeSheet();if(SAGAP)try{sagaStop();}catch(_){}}")
    pg.wait_for_timeout(1500)
    print('orch',js("ORCH.idx?Object.keys(ORCH.idx).length:null"),'playlist',js("AU.pl.length+' orch '+AU.pl.filter(t=>t.orch).length+' synth '+AU.pl.filter(t=>t.synth).length"),'cur',js("musCur()&&musCur().title"))
    js("AU.on.gfx='2d';AU.on.sfx=true;")
    js(f"(()=>{{const rc=RACES.find(r=>r.key==='{race}');G.y=rc.y;const md=G.models[0];{{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}}try{{localStorage.setItem('avt-tips3d','5')}}catch(_){{}};startRace({{rc,mode:'drive',entries:[{{drv:'me',md,prep:2,tyre:'soft',gear:0}}]}});}})()")
    pg.wait_for_timeout(1000);js("R&&R.film&&filmSkip()");pg.wait_for_timeout(300)
    if js("!document.getElementById('rTips').hidden"):pg.click('#rTipsGo')
    pg.wait_for_timeout(6000)
    bedsJs="Object.keys(AMB.beds).filter(k=>AMB.beds[k].src).map(k=>k+' '+AMB.beds[k].v.toFixed(2)).join(', ')"
    print('amb',js("({idx:AMB.idx?Object.keys(AMB.idx).length:0,bufs:Object.keys(AMB.buf).join(','),ann:Object.keys(AMB.ann.buf).length,N:AMB.lis&&AMB.lis.N.toFixed(0)})"))
    print('  beds',js(bedsJs),'| shots',js("AMB.shots.map(s=>(s.id||'voice')+' '+s.gv.toFixed(2)).join(', ')"))
    pg.keyboard.down('ArrowUp');pg.wait_for_timeout(9000);pg.keyboard.up('ArrowUp')
    print('later',js("({t:R.t.toFixed(1),v:Math.round(Math.abs(R.follow.vx)*3.6),N:AMB.lis.N.toFixed(0),ann:Object.keys(AMB.ann.buf).length,clock:scnClockTxt()})"))
    print('  beds',js(bedsJs),'| shots',js("AMB.shots.map(s=>(s.id||'voice')+' '+s.gv.toFixed(2)).join(', ')"))
    js("finishRace(true)");pg.wait_for_timeout(500)
    print('\n'.join(errs[:15]))
    b.close()
