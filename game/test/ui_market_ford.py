# Рынок за Форда: дилеры за границей, таблица классов, конкуренты
from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':860},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=ford]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("G.cash+=40000;G.dealers.fr=10;G.dealers.uk=8;G.dealers.de=6;")
    for i in range(30): pg.evaluate("G.pending=[];doStep();closeSheet();closePaper();G.pending=[];")
    pg.evaluate("render()")
    pg.click('.tab[data-t=market]');pg.wait_for_timeout(300);pg.screenshot(path=out+'f_market.png',full_page=True)
    print(pg.evaluate("dstr(G)+' cash '+Math.round(G.cash)+' sold '+G.models.map(m=>m.name+':'+m.lastSold+'/'+m.lastDem).join(',')"))
    print(errs[:10])
    b.close()
