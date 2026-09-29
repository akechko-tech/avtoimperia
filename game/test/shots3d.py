# Снимки 3D-гонки: машина игрока едет сама (ИИ), камера сзади; печатает ошибки и статистику кадра
from playwright.sync_api import sync_playwright
import sys, json
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
keys=sys.argv[1].split(',') if len(sys.argv)>1 else ['pbp-1895']
times=[float(x) for x in (sys.argv[2].split(',') if len(sys.argv)>2 else ['4','12'])]
view=int(sys.argv[3]) if len(sys.argv)>3 else 0
skip=float(sys.argv[5]) if len(sys.argv)>5 else 0
vp=(sys.argv[4] if len(sys.argv)>4 else '400x820').split('x')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':int(vp[0]),'height':int(vp[1])},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console: '+m.text) if m.type in('error','warning') else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    for key in keys:
        pg.evaluate("""([k,view])=>{const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;G.rdept=2;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
          const t0=performance.now();startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0},{drv:DRIVERS.find(d=>d.from<=rc.y&&d.to>=rc.y).id,md,prep:2,tyre:'hard',gear:0}]});window.__st=performance.now()-t0;R.me.player=false;document.getElementById('rTips').hidden=true;R.hold=false;if(R.gl)R3.view=view;}""",[key,view])
        if skip>0:pg.evaluate("s=>{R.t=Math.max(R.t,0);const dt=1/30;for(let i=0;i<s*30&&R&&!R.done;i++){R.t+=dt;R.time+=dt;raceTick(dt);}}",skip)
        if skip<0:pg.evaluate("s=>{R.t=Math.max(R.t,0);const dt=1/30;for(let i=0;i<40000&&R&&!R.done&&R.follow.prog<-s*R.trk.raceLen;i++){R.t+=dt;R.time+=dt;raceTick(dt);}}",skip)
        last=0
        for t in times:
            pg.wait_for_timeout(int((t-last)*1000));last=t
            pg.screenshot(path=out+f'g3_{key}_{view}_{int(t)}.png')
        print(key,pg.evaluate("R?{gl:R.gl,setup:Math.round(window.__st),t:+R.time.toFixed(1),prog:Math.round(R.follow.prog),dc:G3.dc,tri:G3.tri,chunks:R3.chunks?R3.chunks.filter(Boolean).length+'/'+R3.nCh:0,tiles:R3.tiles?Object.keys(R3.tiles).length:0,people:R3.pN,scale:R3.scale}:null"))
        pg.evaluate("if(R)finishRace(true);closeSheet();closePaper();G.pending=[];")
    print('\n'.join(errs[:12]))
    b.close()
