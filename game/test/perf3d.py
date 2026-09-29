# Сколько стоит кадр 3D-гонки процессору (JS): замедление процессора как у телефона; видеокарта здесь программная, её время не считаем
from playwright.sync_api import sync_playwright
import sys
keys=sys.argv[1].split(',') if len(sys.argv)>1 else ['gpacf-1906']
rate=float(sys.argv[2]) if len(sys.argv)>2 else 4
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':400,'height':820},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    cdp=pg.context.new_cdp_session(pg);cdp.send('Emulation.setCPUThrottlingRate',{'rate':rate})
    for key in keys:
        r=pg.evaluate("""k=>{localStorage.setItem('avt-tips3d','9');const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
          const t0=performance.now();startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});const st=performance.now()-t0;R.me.player=false;R.t=0.01;
          // 300 кадров подряд без ожидания видеокарты: гонка идёт, мир строится, камера едет
          const T=[],P=[];for(let f=0;f<300&&R&&!R.done;f++){const a=performance.now();R.t+=1/30;R.time+=1/30;raceTick(1/30);const b=performance.now();r3dRender(1/30);T.push(performance.now()-b);P.push(b-a);}
          const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return +s[Math.floor(s.length*p)].toFixed(1);};
          return {setup:Math.round(st),render_p50:q(T,0.5),render_p95:q(T,0.95),render_max:q(T,0.999),physics_p50:q(P,0.5),dc:G3.dc,tri:G3.tri,chunks:R3.chunks.filter(Boolean).length+'/'+R3.nCh,tiles:Object.keys(R3.tiles).length};}""",key)
        print(key,'cpu x'+str(rate),r)
        pg.evaluate("if(R)finishRace(true);closeSheet();closePaper();G.pending=[];")
    print(errs[:5])
    b.close()
