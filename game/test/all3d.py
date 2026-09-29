# Все виды трасс в 3D: постройка мира целиком, два кадра, ошибки JS и счётчики
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader']);pg=b.new_page(viewport={'width':300,'height':560})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(300)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    keys=pg.evaluate("""()=>{const pk={};RACES.forEach(r=>{const c=trackCfg(r);const k=r.t+'|'+(r.track||'')+'|'+c.terr+'|'+c.host+(c.night?'|n':'')+(c.stages?'|s':'')+'|'+(r.y<1906?0:r.y<1919?1:2);if(!pk[k])pk[k]=r.key;});return Object.values(pk);}""")
    print(len(keys),'трасс')
    bad=[]
    for k in keys:
        r=pg.evaluate("""k=>{localStorage.setItem('avt-tips3d','9');const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
          try{startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});}catch(e){return {err:String(e)};}
          if(!R.gl)return {gl:false};while(R3.next<R3.order.length)r3dBuildStep();R.t=0.5;r3dRender(1/30);r3dRender(1/30);
          const o={n:R3.nCh,tri:G3.tri,dc:G3.dc,ppl:R3.pN,col:R.trk.col.length};finishRace(true);closeSheet();closePaper();G.pending=[];return o;}""",k)
        if 'err' in r or r.get('gl') is False: bad.append((k,r))
        print(k.ljust(16),r)
    print('ПЛОХО:',bad)
    print('JS:',errs[:8])
    b.close()
