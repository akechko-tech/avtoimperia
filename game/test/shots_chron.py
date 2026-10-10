# 0.30: сцены из хроники у дороги — снимки: python3 test/shots_chron.py <id гонки> <вид сцены> [drive]
from playwright.sync_api import sync_playwright
import sys, json
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
rid=sys.argv[1];st=sys.argv[2];drive=len(sys.argv)>3 and sys.argv[3]=='drive';yaw=float(sys.argv[4]) if len(sys.argv)>4 else 0
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']);pg=b.new_page(viewport={'width':820,'height':520},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type=='error' else None)
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    # гонка, и сразу — машина за 36 м до сцены (мир строится вокруг неё)
    info=pg.evaluate("""([rid,st,drive,yaw])=>{const rc0=RACES.find(r=>r.id===rid||r.key===rid);const rc=Object.assign({},rc0,{key:rc0.key||rc0.id});G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
      startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.me.player=false;R.follow=R.me;
      const T=R.trk,e=(T.evx||[]).find(x=>x.k==='chron'&&x.st===st);if(!e)return {none:1,list:(T.evx||[]).filter(x=>x.k==='chron').map(x=>x.st)};
      const me=R.me,n=T.n,back=drive?13:9;let j=e.a-back;if(T.closed)j=((j%n)+n)%n;const pt=T.pts[j],t=T.T[j];me.idx=j;me.x=pt[0];me.z=pt[2];me.y=pt[1];me.yaw=Math.atan2(t[0],t[1]);me.lat=0;me.vy=0;me.r=0;trackLocal(T,me);
      me.vx=0;me.stopT=999;me.stopWhy='снимок';R.cars.forEach(c=>{if(c!==me){c.vx=0;c.stopT=999;}});
      const L=T.chron||[],o=L.find(q=>Math.abs(q.i-e.a)<14)||{lat:0},side=Math.sign((o.lat||(o.side||1)*5));
      const W=T.W;window.__hook=(dt,Wc,Hc)=>{const a=e.a,ja=((a-6)%n+n)%n,jb=((a+1)%n+n)%n,pa=T.pts[ja],na=T.N[ja],pb=T.pts[jb],nb=T.N[jb];
        const eye=[pa[0]-na[0]*side*1.5,pa[1]+2.4,pa[2]-na[1]*side*1.5],look=[pb[0]+nb[0]*side*(W/2+3.5),pb[1]+0.9,pb[2]+nb[1]*side*(W/2+3.5)];
        const c=Math.cos(yaw),s=Math.sin(yaw),dx=look[0]-eye[0],dz=look[2]-eye[2];look[0]=eye[0]+dx*c+dz*s;look[2]=eye[2]-dx*s+dz*c;r3dCamSet(eye,look,58,Wc,Hc,0.2);R3.cam=null;};
      window.__go=()=>{if(drive){me.stopT=0;me.vx=13;}};
      // второй ракурс: прямо на предмет сцены (машина, верблюды, собака) с 11 м, со стороны дороги
      window.__hook2=(dt,Wc,Hc)=>{const C=R3.chron||[],o=C.find(q=>q.pos)||null;if(!o){window.__hook(dt,Wc,Hc);return;}const p=o.pos,j=e.a,pa=T.pts[j],dx=pa[0]-p[0],dz=pa[2]-p[2],l=Math.hypot(dx,dz)||1;
        const eye=[p[0]+dx/l*11+T.T[j][0]*-4,p[1]+3.2,p[2]+dz/l*11+T.T[j][1]*-4];r3dCamSet(eye,[p[0],p[1]+0.6,p[2]],50,Wc,Hc,0.2);R3.cam=null;};
      return {a:e.a,t:e.t,chron:L.map(q=>q.kind+'@'+q.i),side};}""",[rid,st,drive,yaw])
    print(json.dumps(info,ensure_ascii=False))
    for i in range(60):
        f=pg.evaluate("()=>!!(R&&R.film)")
        if f: pg.evaluate("()=>{filmSkip();}");break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(3000)
    pg.evaluate("()=>{if(R.film)try{filmSkip();}catch(_){}document.getElementById('rTips').hidden=true;R.hold=false;R.t=Math.max(R.t,2);R.cars.forEach(c=>{c.wait=false;});R3.camHook=window.__hook;window.__go();}")
    for k in range(3 if drive else 1):
        pg.wait_for_timeout(2500 if drive else 9000)
        pg.evaluate("()=>{R3.camHook=window.__hook;}")
        pg.screenshot(path=out+f'chron_{rid}_{st}_{k}.png')
    if not drive:
        pg.evaluate("()=>{R3.camHook=window.__hook2;}");pg.wait_for_timeout(7000);pg.screenshot(path=out+f'chron_{rid}_{st}_aim.png')
    print(pg.evaluate("()=>{const o=R3.chron&&R3.chron.find(q=>q.kind==='car');if(!o)return 'no car';let m=null,err='';try{m=r3dCarMesh(o.spec,false);}catch(e){err=String(e);}return {pos:o.pos.map(v=>Math.round(v*10)/10),inF:inFrustum(R3.fr,o.pos,3.5),mesh:!!(m&&m.op),err,ground:groundAt(R.trk.chron[0].i,R.trk.chron[0].lat),mat:Array.from(o.st.mat).map(v=>Math.round(v*100)/100)};}"))
    print(pg.evaluate("()=>({eye:R3.eye&&Array.from(R3.eye).map(v=>Math.round(v)),t:R.t,chron:R3.chron?R3.chron.map(o=>o.kind+(o.st!==undefined?':'+o.st:'')):null})"))
    print([e for e in errs if 'TUNNEL' not in e and 'NOT_FOUND' not in e][:6])
    b.close()
