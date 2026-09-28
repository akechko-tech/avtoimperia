# Скорость отрисовки гонки: кадры в секунду на обычном и замедленном в 4 раза процессоре (как у среднего телефона)
from playwright.sync_api import sync_playwright
import sys
keys=sys.argv[1].split(',') if len(sys.argv)>1 else ['gpacf-1906']
rate=float(sys.argv[2]) if len(sys.argv)>2 else 4
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':400,'height':820},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    cdp=pg.context.new_cdp_session(pg);cdp.send('Emulation.setCPUThrottlingRate',{'rate':rate})
    for key in keys:
        pg.evaluate("""k=>{const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
          const t0=performance.now();startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});window.__start=performance.now()-t0;R.me.player=false;R.me=null;
          window.__fr=[];window.__rt=[];window.__tt=[];window.__at=[];const orig=renderRace;window.renderRace=function(dt){const a=performance.now();orig(dt);window.__rt.push(performance.now()-a);};const ot=raceTick;window.raceTick=function(dt){const a=performance.now();ot(dt);window.__tt.push(performance.now()-a);};const oa=auRaceTick;window.auRaceTick=function(){const a=performance.now();oa();window.__at.push(performance.now()-a);};
          let last=performance.now();const loop=t=>{window.__fr.push(t-last);last=t;if(R)requestAnimationFrame(loop);};requestAnimationFrame(loop);}""",key)
        pg.wait_for_timeout(16000)
        r=pg.evaluate("""()=>{const f=window.__fr.slice(5),rt=window.__rt.slice(5),q=a=>{const s=a.slice().sort((x,y)=>x-y);return [s[Math.floor(s.length*0.5)],s[Math.floor(s.length*0.95)],s[s.length-1]].map(v=>Math.round(v*10)/10);};
          const cd=f.slice(0,Math.min(f.length,180));return {start:Math.round(window.__start),frames:f.length,fps:Math.round(1000/(f.reduce((a,b)=>a+b,0)/f.length)),frame_p50_p95_max:q(f),render_p50_p95_max:q(rt),tick_p50_p95_max:q(window.__tt.slice(5)),audio_p50_p95:q(window.__at.slice(5)),car3d:CAR3D.cache.size,scen:Object.keys(SPR.cache).length,queue:CAR3D.q.length+SCQ.length};}""")
        print(key,'cpu x'+str(rate),r)
        pg.evaluate("if(R)finishRace(true);closeSheet();closePaper();G.pending=[];")
    print(errs[:5])
    b.close()
