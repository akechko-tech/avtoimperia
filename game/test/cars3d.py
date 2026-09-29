# Машины в 3D с разных сторон: для каждой гонки — машина игрока (заводской кузов года) под углами
from playwright.sync_api import sync_playwright
import sys
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
keys=sys.argv[1].split(',');prep=int(sys.argv[2]) if len(sys.argv)>2 else 2;body=sys.argv[3] if len(sys.argv)>3 else ''
angs=[0,0.7,1.57,2.5,3.14]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':360,'height':560},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    for key in keys:
        pg.evaluate("""([k,prep,body])=>{localStorage.setItem('avt-tips3d','9');const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=body||lastOf(BODIES,rc.y,x=>!x.truck).id;md.paint='#b8322a';
          startRace({rc,mode:'drive',entries:[{drv:'me',md,prep,tyre:'soft',gear:0}]});R.me.player=false;R.t=0.01;R3.view=3;window.__frz=1;const o=raceTick;window.raceTick=function(dt){if(window.__frz)return;o(dt);};}""",[key,prep,body])
        for i,a in enumerate(angs):
            pg.evaluate(f"R3.orbA={a};R3.cam=null;");pg.wait_for_timeout(1300)
            pg.screenshot(path=out+f'car_{key}_{prep}_{i}.png',clip={'x':0,'y':150,'width':360,'height':330})
        pg.evaluate("window.__frz=0;window.raceTick=raceTick;if(R)finishRace(true);closeSheet();closePaper();G.pending=[];")
    print(errs[:5])
    b.close()
