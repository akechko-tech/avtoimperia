# Подбор света: одна гонка, несколько вариантов настроек (JS-выражение меняет R3.env.day), снимки подряд
from playwright.sync_api import sync_playwright
import sys, json
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
key=sys.argv[1];skip=float(sys.argv[2]);variants=json.loads(sys.argv[3]);vp=(sys.argv[4] if len(sys.argv)>4 else '400x820').split('x')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':int(vp[0]),'height':int(vp[1])},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""([k,skip])=>{const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;G.rdept=2;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
      startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.me.player=false;R.me=null;R.t=0;document.getElementById('rTips').hidden=true;R.hold=false;const dt=1/30;for(let i=0;i<skip*30&&R&&!R.done;i++){R.t+=dt;R.time+=dt;raceTick(dt);}R.speed=0;window.__frz=1;}""",[key,skip])
    # остановить время: гонка стоит, картинка перерисовывается
    pg.evaluate("()=>{const o=raceTick;window.raceTick=function(dt){if(window.__frz)return;o(dt);};}")
    pg.wait_for_timeout(2500)
    for i,v in enumerate(variants):
        pg.evaluate(v);pg.wait_for_timeout(2200)
        pg.screenshot(path=out+f'look_{key}_{i}.png')
    print(errs[:5])
    b.close()
