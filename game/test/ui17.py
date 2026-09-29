# 0.17: новая игра → фильм о герое (глава 1) → вкладка «Империя» (наследие, титулы, вызовы, фильм)
from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
pion=sys.argv[1] if len(sys.argv)>1 else 'ford'
vp=(sys.argv[2] if len(sys.argv)>2 else '412x860').split('x')
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':int(vp[0]),'height':int(vp[1])},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console: '+m.text) if m.type=='error' and 'TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    pg.screenshot(path=out+'u17_menu.png')
    pg.click('[data-act=newgame]');pg.click(f'[data-act=pion][data-v={pion}]');pg.click('[data-act=startgame]');pg.wait_for_timeout(500)
    # газеты вступления — закрываем, пока не пойдёт фильм
    for i in range(8):
        if pg.evaluate("!!document.getElementById('sagaScreen')"):break
        pg.evaluate("const b=document.querySelector('#paperWrap:not([hidden]) [data-act=choose],#paperWrap:not([hidden]) [data-act=paperClose],#sheet:not([hidden]) [data-act=choose]');if(b)b.click();")
        pg.wait_for_timeout(600)
    print('saga on:',pg.evaluate("!!document.getElementById('sagaScreen')"))
    pg.wait_for_timeout(1200);pg.screenshot(path=out+'u17_saga_title.png')
    pg.evaluate("sagaNext()");pg.wait_for_timeout(900);pg.screenshot(path=out+'u17_saga_scene.png')
    pg.evaluate("sagaNext()");pg.wait_for_timeout(900);pg.screenshot(path=out+'u17_saga_scene2.png')
    pg.evaluate("sagaQuestion()");pg.wait_for_timeout(900);pg.screenshot(path=out+'u17_saga_q.png')
    pg.evaluate("sagaPick(0)");pg.wait_for_timeout(900);pg.screenshot(path=out+'u17_saga_res.png')
    pg.evaluate("document.querySelector('#sagaScreen .sg-o').click()");pg.wait_for_timeout(800)
    for i in range(6):
        pg.evaluate("const b=document.querySelector('#paperWrap:not([hidden]) [data-act=choose],#paperWrap:not([hidden]) [data-act=paperClose],#sheet:not([hidden]) [data-act=choose]');if(b)b.click();")
        pg.wait_for_timeout(300)
    pg.screenshot(path=out+'u17_main.png')
    pg.evaluate("tab='log';render();window.scrollTo(0,0)");pg.wait_for_timeout(400);pg.screenshot(path=out+'u17_empire.png',full_page=True)
    print('\n'.join(errs[:10]))
    b.close()
