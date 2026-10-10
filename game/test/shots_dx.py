# 0.30: дуэли вживую — снимки: экспресс вдоль шоссе, биплан над овалом, рысак у бровки
from playwright.sync_api import sync_playwright
import sys, json
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
k=sys.argv[1];y=int(sys.argv[2]);skip=float(sys.argv[3]);views=json.loads(sys.argv[4]) if len(sys.argv)>4 else [0];cc=sys.argv[5] if len(sys.argv)>5 else 'fr'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':820,'height':520},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type in('error','warning') and 'Failed to load' not in m.text else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""([k,y,cc])=>{G.pending=[];G.y=y;G.m=5;G.country=cc;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(y);['e','g','c','k','w'].forEach(q=>md[q]=a[q]);}md.b=lastOf(BODIES,y,x=>!x.truck).id;md.status='prod';
      const d=DX_KIND[k];let o={k,at:mi(G),stake:500,md:md.id,c:cc};if(k==='train'){const r=d.route[cc]||d.route.fr;o.venue=r[0];o.opp=r[1];o.km=r[2];o.trainV=d.opp(y,r);}else{o.venue=d.venue[cc]||'Ипподром';o.opp=k==='plane'?d.pilot[cc]||'Бичи':d.horse[cc]||'рысак';o.km=d.km;}
      o.acc=1;G.dx=o;startRace({rc:dxRc(G,o),mode:'drive',entries:[{drv:'me',md,prep:0,tyre:'hard',gear:0}]});R.me.player=false;R.follow=R.me;}""",[k,y,cc])
    for i in range(60):
        st=pg.evaluate("()=>({f:!!(R&&R.film),l:!!(R&&R.loading)})")
        if st['f']: pg.evaluate("()=>{filmSkip();}");break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(800);pg.evaluate("()=>{const t=document.getElementById('rTips');if(t)t.hidden=true;R.hold=false;}")
    if skip>0: pg.evaluate("(sk)=>{const dt=1/20;for(let i=0;i<sk*20&&R&&!R.done;i++){R.t+=dt;R.time+=dt;raceTick(dt);}}",skip)
    pg.wait_for_timeout(1500)
    for i,v in enumerate(views):
        if isinstance(v,list):
            pg.evaluate("""(o)=>{R3.camHook=(dt,W,H)=>{const D=R.dx,c=o[5]?null:R.follow;let p,fw,rt,up=[0,1,0];
              if(o[5]===2){const T=R.trk,rl=T.rails.find(q=>q.duel),i=rl.i,pp=T.pts[i],t=T.T[i];p=[pp[0],pp[1],pp[2]];fw=[t[0],0,t[1]];rt=[fw[2],0,-fw[0]];}
              else if(c&&c.v3&&c.v3.mat){const M=c.v3.mat;rt=[M[0],M[1],M[2]];up=[M[4],M[5],M[6]];fw=[M[8],M[9],M[10]];p=[M[12],M[13],M[14]];}else{p=D.pos.slice();fw=[D.tan[0],0,D.tan[1]];rt=[fw[2],0,-fw[0]];}
              const eye=[0,1,2].map(q=>p[q]+rt[q]*o[0]-fw[q]*o[1]+up[q]*o[2]),look=[0,1,2].map(q=>p[q]+up[q]*(o[6]||0.5)+fw[q]*(o[4]||0));r3dCamSet(eye,look,o[3]||50,W,H,0.2);R3.cam=null;};}""",v)
        else: pg.evaluate(f"()=>{{R3.camHook=null;R3.view={v};}}")
        pg.wait_for_timeout(1800)
        pg.screenshot(path=out+f'dx_{k}_{i}.png')
    info=pg.evaluate("()=>({dx:R.dx?{s:Math.round(R.dx.s),L:Math.round(R.dx.L),v:Math.round(R.dx.v*3.6),vc:Math.round(R.dx.vc*3.6),alt:R.dx.alt,pos:R.dx.pos.map(Math.round)}:null,me:Math.round(R.me.prog),rails:(R3.dxRail||[]).length,hud:(document.getElementById('rDx')||{}).textContent})")
    print(json.dumps(info,ensure_ascii=False));print(errs[:8])
    b.close()
