# Снимки экономики: Италия, 1895 — модели, рынок, КБ
from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':400,'height':860},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200)
    pg.click('[data-act=pion][data-v=ferrari]');pg.wait_for_timeout(150)
    pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("G.rd.proj=rdProjects(G)[0];G.rd.prog=0;")
    for i in range(4): pg.evaluate("G.pending=[];doStep();closeSheet();closePaper();G.pending=[];")
    pg.evaluate("G.models[0].plan=6;G.pending=[];doStep();G.pending=[];doStep();closeSheet();closePaper();G.pending=[];render();")
    pg.click('.tab[data-t=models]');pg.wait_for_timeout(300);pg.screenshot(path=out+'e_models.png',full_page=True)
    pg.click('.tab[data-t=market]');pg.wait_for_timeout(300);pg.screenshot(path=out+'e_market.png',full_page=True)
    pg.click('.tab[data-t=models]');pg.click('[data-act=design]');pg.wait_for_timeout(300);pg.screenshot(path=out+'e_design.png',full_page=True)
    print(errs[:10])
    b.close()
