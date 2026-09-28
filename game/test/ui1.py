from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'])
    pg=b.new_page(viewport={'width':400,'height':820})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(600)
    pg.screenshot(path=out+'m0.png')
    pg.click('[data-act=newgame]');pg.wait_for_timeout(300)
    pg.click('[data-act=pion][data-v=ford]');pg.wait_for_timeout(200)
    pg.click('[data-act=startgame]');pg.wait_for_timeout(400)
    for i in range(14):
        pg.evaluate("G.pending=[];doStep()")
    pg.wait_for_timeout(300);pg.screenshot(path=out+'m1.png',full_page=True)
    for t in ['models','market','log']:
        pg.click(f'.tab[data-t={t}]');pg.wait_for_timeout(300);pg.screenshot(path=out+f'm_{t}.png',full_page=True)
    pg.click('.tab[data-t=models]');pg.click('[data-act=design]');pg.wait_for_timeout(300);pg.screenshot(path=out+'m_design.png')
    pg.click('[data-act=close]');pg.click('[data-act=menu]');pg.wait_for_timeout(200);pg.screenshot(path=out+'m_menu.png')
    print('\n'.join(errs[:20]))
    b.close()
