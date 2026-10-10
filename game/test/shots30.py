# 0.30: шины по отдельности, искры обода, частицы покрытия, грязь на крыльях — снимки гонки
from playwright.sync_api import sync_playwright
import sys, json
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
pred=sys.argv[1];tag=sys.argv[2];skip=float(sys.argv[3]);setup=sys.argv[4] if len(sys.argv)>4 else '';views=json.loads(sys.argv[5]) if len(sys.argv)>5 else [0]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':820,'height':520},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""([pred,skip,setup])=>{const rc=RACES.find(new Function('r','return '+pred));window.__rc=rc&&rc.key;G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
      startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.me.player=false;R.follow=R.me;try{filmSkip();}catch(_){}document.getElementById('rTips').hidden=true;R.hold=false;R.hz0=0;
      const dt=1/30;for(let i=0;i<skip*30&&R&&!R.done;i++){R.t+=dt;R.time+=dt;raceTick(dt);}
      if(setup)(new Function('me',setup))(R.me);}""",[pred,skip,setup])
    for i in range(40):
        st=pg.evaluate("()=>({f:!!(R&&R.film),l:!!(R&&R.loading)})")
        if st['f']: pg.evaluate("()=>{filmSkip();setTimeout(()=>{const t=document.getElementById('rTips');if(t)t.hidden=true;R.hold=false;},300);}");break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1500);pg.evaluate("()=>{const t=document.getElementById('rTips');if(t)t.hidden=true;R.hold=false;}");pg.wait_for_timeout(2000)
    for i,v in enumerate(views):
        if isinstance(v,list):
            pg.evaluate("""(o)=>{R3.camHook=(dt,W,H)=>{const c=R.follow,st=c.v3;if(!st||!st.mat){r3dCamera(dt,W,H);return;}const M=st.mat,rt=[M[0],M[1],M[2]],up=[M[4],M[5],M[6]],fw=[M[8],M[9],M[10]],p=[M[12],M[13],M[14]];
              const eye=[0,1,2].map(q=>p[q]+rt[q]*o[0]-fw[q]*o[1]+up[q]*o[2]),look=[0,1,2].map(q=>p[q]+up[q]*0.5+fw[q]*(o[4]||0));r3dCamSet(eye,look,o[3]||50,W,H,0.2);R3.cam=null;};}""",v)
        else: pg.evaluate(f"()=>{{R3.camHook=null;R3.view={v};}}")
        pg.wait_for_timeout(1800)
        pg.screenshot(path=out+f'sh30_{tag}_{i}.png')
    info=pg.evaluate("()=>({deb:R3.parts.filter(p=>p.gv===1&&p.s<0.12).length,em:R3.parts.filter(p=>p.em).length,smoke:R3.parts.filter(p=>!p.gv).length,rc:window.__rc,surf:R.me.surf,tp:R.me.tp,tw:R.me.tw.map(x=>Math.round(x)),v:Math.round(R.me.vx*3.6),parts:R3.parts.length,dirt:R.me.v3&&R.me.v3.dirt,tf:R.me.v3&&R.me.v3.tf})")
    print(json.dumps(info,ensure_ascii=False));print(errs[:6])
    b.close()
