# Сезон 1925: вкладка «Гонки», быстрые итоги нескольких этапов чемпионата мира, газета о победе
from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':820},device_scale_factor=2)
    pg.route('**/*wikimedia*',lambda r:r.abort())
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=bugatti]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""(()=>{G.pending=[];G.y=1925;G.m=3;G.cash=500000;G.rdept=3;G.dealers.us=10;G.dealers.it=5;G.dealers.uk=5;G.dealers.de=5;
      const md=G.models[0];md.e='e7';md.c='c5';md.w='w6';md.b='b1';md.t='t0';md.name='Тип 35';
      G.drivers=availDrivers(G).sort((a,b)=>b.sk-a.sk).slice(0,2).map(d=>d.id);tab='race';render();})()""")
    pg.wait_for_timeout(300);pg.screenshot(path=out+'s_tab1.png',full_page=True)
    def enter(key,n,mode='sim'):
        pg.evaluate(f"""(()=>{{const rc=RACES.find(r=>r.key==='{key}');G.pending=[];G.m=rc.m;closeSheet();closePaper();openRaceSetup('{key}');while(RS.entries.length<{n})RACE_ACT.rAdd();RS.mode='{mode}';}})()""")
        pg.wait_for_timeout(200)
        pg.evaluate("RACE_ACT.raceGo()");pg.wait_for_timeout(500)
    enter('indy-1925',2)
    pg.screenshot(path=out+'s_res_indy.png')
    for k in ['x80394-1925','gpacf-1925']:
        enter(k,3)
    pg.screenshot(path=out+'s_res2.png')
    pg.evaluate("closePaper();closeSheet();G.pending=[];G.m=8;render()")
    enter('itgp-1925',3)
    pg.screenshot(path=out+'s_res_itgp.png')
    pg.evaluate("closePaper();closeSheet();for(let i=0;i<4;i++){G.pending=[];step();}G.pending=[];tab='race';render()")
    pg.wait_for_timeout(300);pg.screenshot(path=out+'s_tab2.png',full_page=True)
    print(pg.evaluate("JSON.stringify({titles:G.titles,log:G.raceLog.map(r=>r.name+':'+r.place+':'+r.team.join('/')),aiacr:G.season['aiacr-1925'],cres:Object.keys(G.cres).filter(k=>k.endsWith('1925')).map(k=>k+'='+JSON.stringify(G.cres[k]))})"))
    print(errs[:5])
    b.close()
