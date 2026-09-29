# 0.17: поезд на переезде — вид на состав и шлагбаум
from playwright.sync_api import sync_playwright
import sys, time
out='/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/'
key=sys.argv[1] if len(sys.argv)>1 else 'x87575-1908'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':800,'height':450},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('console: '+m.text) if m.type in('error','warning') and 'TUNNEL' not in m.text else None)
    pg.add_init_script("localStorage.setItem('avt-audio',JSON.stringify({music:false,sfx:false,demo:false}))")
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html');pg.wait_for_timeout(400)
    pg.click('[data-act=newgame]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    pg.evaluate("""(k)=>{const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;G.rdept=2;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck).id;
          try{localStorage.setItem('avt-tips3d','9');localStorage.setItem('avt-film','9');}catch(_){}
          startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.me.player=false;}""",key)
    t0=time.time()
    while pg.evaluate("R&&R.loading")and time.time()-t0<90: pg.wait_for_timeout(300)
    pg.evaluate("if(R&&R.film)filmSkip();R.hold=true;")
    info=pg.evaluate("""()=>{const T=R.trk,rl=T.rails[0];if(!rl)return 'нет переезда';const i=rl.i;
      const k0=Math.floor((i-60)/R3CH),k1=Math.floor((i+60)/R3CH);for(let k=k0;k<=k1;k++){const kk=T.closed?((k%R3.nCh)+R3.nCh)%R3.nCh:k;if(kk>=0&&kk<R3.nCh&&!R3.chunks[kk]){const ch=r3dChunk(kk);if(ch)R3.chunks[kk]=ch;}}
      rl.st={state:1,s:-30,v:0,dir:1,whistle:1};rl.gate=1;R.follow.idx=i;
      const L=railLine(T,rl),tx=L.p[0]+L.d[0]*(-50),tz=L.p[2]+L.d[1]*(-50);
      // камера сбоку от состава: отступ по нормали к рельсам
      const nx=-L.d[1],nz=L.d[0],ex=tx+nx*38,ez=tz+nz*38;
      R3.camHook=(dt,W,H)=>{r3dCamSet([ex,fH(ex,ez)+6,ez],[L.p[0]+L.d[0]*(-20),railY(T,rl,-20)+2,L.p[2]+L.d[1]*(-20)],0.9,W,H);};
      return 'rail at '+i+' L.p '+L.p.map(v=>v.toFixed(0))+' d '+L.d.map(v=>v.toFixed(2))+' railY '+railY(T,rl,-30).toFixed(1)+' ground '+fH(tx,tz).toFixed(1);}""")
    print(info)
    pg.wait_for_timeout(5000)
    pg.screenshot(path=out+f'train17_{key}.png',timeout=120000)
    # вид с дороги: шлагбаум и поезд перед капотом
    pg.evaluate("""()=>{const T=R.trk,rl=T.rails[0];rl.st.s=-8;const a=trkAt(rl.i,-28,0),b=trkAt(rl.i,0,0);R3.camHook=(dt,W,H)=>{r3dCamSet([a.p[0],a.p[1]+1.6,a.p[2]],[b.p[0],b.p[1]+1.5,b.p[2]],0.9,W,H);};}""")
    pg.wait_for_timeout(5000)
    pg.screenshot(path=out+f'train17_{key}_road.png',timeout=120000)
    print('\n'.join(errs[:10]))
    b.close()
