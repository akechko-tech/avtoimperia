# Снимки гонок: камера за машиной игрока, машиной управляет ИИ (для проверки картинки)
from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
keys=sys.argv[1].split(',') if len(sys.argv)>1 else ['pbp-1895']
times=[float(x) for x in (sys.argv[2].split(',') if len(sys.argv)>2 else ['6','20'])]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':820},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    for key in keys:
        pg.evaluate("""k=>{const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;G.rdept=2;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
          startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0},{drv:DRIVERS.find(d=>d.from<=rc.y&&d.to>=rc.y).id,md,prep:2,tyre:'hard',gear:0}]});R.me.player=false;R.me=null;}""",key)
        last=0
        for t in times:
            pg.wait_for_timeout(int((t-last)*1000));last=t
            pg.screenshot(path=out+f'shot_{key}_{int(t)}.png')
        print(key,pg.evaluate("R?{t:R.time,prog:Math.round(R.follow.prog),len:Math.round(R.trk.raceLen),pos:raceOrder().indexOf(R.follow)+1}:null"))
        pg.evaluate("if(R)finishRace(true);closeSheet();closePaper();G.pending=[];")
    print(errs[:5])
    b.close()
