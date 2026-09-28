# Окно заявки на гонку: совет главы команды, свёрнутый список пилотов; вкладка «Гонки» — команда
from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':860},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""()=>{closeSheet();closePaper();G.pending=[];const rc=RACES.find(r=>r.key==='gpacf-1906');G.y=rc.y;G.m=rc.m-1;G.cash=1e6;G.rdept=1;G.drivers=[];const md=G.models[0];md.e=lastOf(ENGINES,rc.y).id;md.c=lastOf(CHASSIS,rc.y).id;md.w=lastOf(TYRES,rc.y).id;md.b='b2';openRaceSetup(rc.key);}""")
    pg.wait_for_timeout(500);pg.screenshot(path=out+'ui_setup1.png')
    pg.evaluate("document.querySelector('#sheetBody').scrollTop=520");pg.wait_for_timeout(200);pg.screenshot(path=out+'ui_setup2.png')
    pg.evaluate("document.querySelector('[data-act=rAdvice]')&&document.querySelector('[data-act=rAdvice]').click()");pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('#sheetBody').scrollTop=520");pg.wait_for_timeout(200);pg.screenshot(path=out+'ui_setup3.png')
    pg.evaluate("closeSheet();G.drivers=[];tab='race';render();");pg.wait_for_timeout(300)
    pg.evaluate("const el=[...document.querySelectorAll('.label')].find(h=>h.textContent.trim()==='Команда');if(el)el.scrollIntoView()");pg.wait_for_timeout(200);pg.screenshot(path=out+'ui_team.png')
    print(errs[:5])
    b.close()
