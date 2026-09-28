# Браузерная проверка гонок: вкладка «Гонки», заявка, гонка за рулём и в режиме руководителя
from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
race=sys.argv[1] if len(sys.argv)>1 else 'pbp-1895'
tag=sys.argv[2] if len(sys.argv)>2 else 'a'
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':400,'height':820},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to load' not in m.text else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(500)
    pg.click('[data-act=newgame]');pg.wait_for_timeout(200)
    pg.click('[data-act=pion][data-v=renault]');pg.wait_for_timeout(150)
    pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    # перенести игру к месяцу гонки, дать денег и подходящую машину
    pg.evaluate(f"""(()=>{{const rc=RACES.find(r=>r.key==='{race}');G.pending=[];G.y=rc.y;G.m=Math.max(0,rc.m-1);G.cash=200000;G.rdept=1;
      const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}
      G.drivers=availDrivers(G).sort((a,b)=>b.sk-a.sk).slice(0,2).map(d=>d.id);tab='race';render();}})()""")
    pg.wait_for_timeout(300);pg.screenshot(path=out+f'r_tab_{tag}.png',full_page=True)
    jsclick=lambda sel:pg.evaluate("s=>document.querySelector(s).click()",sel)
    jsclick(f'[data-act=raceSetup][data-k="{race}"]');pg.wait_for_timeout(400)
    pg.screenshot(path=out+f'r_setup0_{tag}.png')
    pg.click('[data-act=rAdd]');pg.wait_for_timeout(300)
    pg.screenshot(path=out+f'r_setup_{tag}.png',full_page=False)
    pg.evaluate("sb.scrollTop=sb.scrollHeight");pg.wait_for_timeout(200);pg.screenshot(path=out+f'r_setup2_{tag}.png')
    pg.click('[data-act=rMode][data-v=drive]');pg.wait_for_timeout(200)
    pg.click('[data-act=raceGo]');pg.wait_for_timeout(4500)
    pg.screenshot(path=out+f'r_drive1_{tag}.png')
    pg.keyboard.down('ArrowUp');pg.wait_for_timeout(5000);pg.screenshot(path=out+f'r_drive2_{tag}.png')
    pg.keyboard.down('ArrowLeft');pg.wait_for_timeout(700);pg.keyboard.up('ArrowLeft');pg.wait_for_timeout(2500);pg.screenshot(path=out+f'r_drive3_{tag}.png')
    pg.keyboard.up('ArrowUp')
    info=pg.evaluate("R?{t:R.time,prog:R.me.prog,v:R.me.vx,lat:R.me.lat,len:R.trk.raceLen}:null")
    print('drive state',info)
    pg.click('#rQuit');pg.wait_for_timeout(600);pg.screenshot(path=out+f'r_result_{tag}.png')
    # руководитель
    pg.evaluate(f"closeSheet();closePaper();G.pending=[];delete G.raceDone['{race}'];delete G.cres['{race}'];G.season={{}};render()")
    jsclick(f'[data-act=raceSetup][data-k="{race}"]');pg.wait_for_timeout(300)
    pg.click('[data-act=rMode][data-v=manage]');pg.wait_for_timeout(200)
    pg.click('[data-act=raceGo]');pg.wait_for_timeout(9000);pg.screenshot(path=out+f'r_manage_{tag}.png')
    pg.click('#rMgr [data-spd="4"]');pg.wait_for_timeout(6000);pg.screenshot(path=out+f'r_manage2_{tag}.png')
    pg.click('#rMgr [data-ord="fin"]');pg.wait_for_timeout(25000);pg.screenshot(path=out+f'r_manage_res_{tag}.png')
    print('R after',pg.evaluate("!!R"))
    print('\n'.join(errs[:20]))
    b.close()
