# Руль на экране: палец тянет колесо — руль и курс машины меняются; кнопки ◀ ▶ тоже работают
from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':400,'height':820},device_scale_factor=2,has_touch=True);pg=ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""()=>{closeSheet();closePaper();G.pending=[];const rc=RACES.find(r=>r.key==='gpacf-1906');G.y=rc.y;G.m=rc.m;AU.on.steer='wheel';startRace({rc,mode:'drive',entries:[{drv:'me',md:G.models[0],prep:1,tyre:'soft',gear:0}]});}""")
    pg.wait_for_timeout(3500)
    box=pg.locator('#rWheel').bounding_box();cx=box['x']+box['width']/2;cy=box['y']+box['height']/2
    pg.mouse.move(cx,cy);pg.mouse.down();pg.keyboard.down('ArrowUp')
    for i in range(10):pg.mouse.move(cx+i*6,cy);pg.wait_for_timeout(30)
    pg.wait_for_timeout(300);r1=pg.evaluate("({steer:R.me.steer.toFixed(2),target:RW.target.toFixed(2),drag:!!RW.drag})")
    pg.screenshot(path=out+'wheel_drag.png')
    pg.mouse.up();pg.wait_for_timeout(600);r2=pg.evaluate("({steer:R.me.steer.toFixed(2),drag:!!RW.drag})")
    pg.click('#rTilt');pg.wait_for_timeout(100);mode=pg.evaluate("RW.mode")
    pg.mouse.move(box['x']+10,cy);pg.mouse.down();pg.wait_for_timeout(500);r3=pg.evaluate("({steer:R.me.steer.toFixed(2),left:rKeys.left})");pg.mouse.up();pg.wait_for_timeout(100)
    r4=pg.evaluate("({left:rKeys.left,right:rKeys.right})")
    print('drag',r1,'release',r2,'mode',mode,'keys-left',r3,'after',r4)
    pg.keyboard.up('ArrowUp');pg.evaluate("finishRace(true)")
    print(errs[:5])
    b.close()
