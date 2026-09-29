# 0.17: виды на особые участки трассы (мост, переезд, серпантин, город, лес, берег) — камера сбоку сверху
from playwright.sync_api import sync_playwright
import sys, time
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
key=sys.argv[1] if len(sys.argv)>1 else 'x87575-1908'
spots=(sys.argv[2] if len(sys.argv)>2 else 'bridge,rail').split(',')
vp=(sys.argv[3] if len(sys.argv)>3 else '800x450').split('x')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':int(vp[0]),'height':int(vp[1])},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console: '+m.text) if m.type in('error',) and 'TUNNEL' not in m.text else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""(k)=>{const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;G.rdept=2;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
          try{localStorage.setItem('avt-tips3d','9');localStorage.setItem('avt-film','9');}catch(_){}
          startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.me.player=false;}""",key)
    t0=time.time()
    while pg.evaluate("R&&R.loading")and time.time()-t0<90: pg.wait_for_timeout(300)
    pg.evaluate("if(R&&R.film)filmSkip();R.hold=true;")
    for sp in spots:
        ok=pg.evaluate("""(sp)=>{const T=R.trk,map={bridge:5,rail:6,serp:7,coast:8,town:1,forest:3,village:2,vine:9,avenue:4,fields:0};const sg=(T.seg||[]).find(s=>s.type===map[sp]);if(!sg)return false;
          const i=sg.i;const k0=Math.floor((i-60)/R3CH),k1=Math.floor((i+60)/R3CH);for(let k=k0;k<=k1;k++){const kk=T.closed?((k%R3.nCh)+R3.nCh)%R3.nCh:k;if(kk>=0&&kk<R3.nCh&&!R3.chunks[kk]){const ch=r3dChunk(kk);if(ch)R3.chunks[kk]=ch;}}
          const a=trkAt(i,-45,sp==='rail'?-26:24),b=trkAt(i,5,0);R3.camHook=(dt,W,H)=>{r3dCamSet([a.p[0],a.p[1]+(sp==='bridge'?7:sp==='serp'?16:9),a.p[2]],[b.p[0],b.p[1]+1,b.p[2]],0.95,W,H);};
          if(sp==='rail'){const rl=T.rails[0];if(rl){rl.st={state:1,s:-40,v:0,dir:1};rl.gate=1;}}
          R.follow.idx=i;return true;}""",sp)
        if not ok: print(sp,'нет на трассе'); continue
        pg.wait_for_timeout(4000)
        pg.screenshot(path=out+f's17_{key}_{sp}.png',timeout=120000)
        print(sp,'ok')
    print('\n'.join(errs[:10]))
    b.close()
