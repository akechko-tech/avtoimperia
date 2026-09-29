# 0.17: экипаж крупно — плечи, одежда по номеру машины
from playwright.sync_api import sync_playwright
import sys, time
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
key=sys.argv[1] if len(sys.argv)>1 else 'targa-1906'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':640,'height':400},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('avt-audio',JSON.stringify({music:false,sfx:false,demo:false}));localStorage.setItem('avt-film','9');localStorage.setItem('avt-tips3d','9')")
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""(k)=>{const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
      startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.me.player=false;}""",key)
    t0=time.time()
    while pg.evaluate("R&&R.loading")and time.time()-t0<90: pg.wait_for_timeout(300)
    pg.evaluate("if(R&&R.film)filmSkip();R.hold=true;document.getElementById('rTips').hidden=true;")
    for i,(a,who) in enumerate([(0.5,0),(2.7,0),(0.9,1),(2.2,2)]):
        pg.evaluate("([a,w])=>{const c=R.cars.slice().sort((x,y)=>x.idx-y.idx)[w]||R.follow;R.follow=c;R3.view=3;R3.orbA=a;R3.orbD=3.4;R3.orbH=1.35;R3.cam=null;}",[a,who])
        pg.wait_for_timeout(2500)
        pg.screenshot(path=out+f'crew17_{key}_{i}.png',timeout=120000)
    print(errs[:5])
    b.close()
