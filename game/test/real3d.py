# Трассы по настоящей местности (ТЗ 0.18, раздел 2): снимки 3D с разных мест трассы, заставка с картой,
# и цена кадра на настоящем рельефе против прежнего генератора (не хуже): cpu — работа кадра, p50/p95 — кадр целиком с ожиданием видеокарты.
# python3 test/real3d.py [ключи]; MODES=real (без генератора), FRAMES=n, DAY=1 (без ночи и непогоды)
from playwright.sync_api import sync_playwright
import sys, os
keys = sys.argv[1].split(',') if len(sys.argv) > 1 and sys.argv[1] else ['pm1903-1903', 'targa-1906', 'gpacf-1906', 'gb1903-1903', 'indy-1911']
OUT = os.environ.get('OUT', '/tmp/real3d')
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 400, 'height': 820}, device_scale_factor=1)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html'); pg.wait_for_timeout(400)
    if os.environ.get('FRAMES'): pg.evaluate('window.__frames=%d' % int(os.environ['FRAMES']))
    pg.click('[data-act=newgame]'); pg.click('[data-act=pion][data-v=renault]'); pg.click('[data-act=startgame]'); pg.wait_for_timeout(300)
    for key in keys:
        # данные трассы — тем же путём, что в игре (скрипт terrain/<id>.js)
        pg.evaluate("k=>{window.__rl=0;const rc=RACES.find(r=>r.key===k);realLoad(rc,()=>{window.__rl=1;});}", key)
        pg.wait_for_function('window.__rl===1', timeout=8000)
        res = {}
        for mode in os.environ.get('MODES', 'real,gen').split(','):
            if os.environ.get('DAY'): pg.evaluate("window.SCN_OFF=true")
            pg.evaluate("""([k,mode])=>{localStorage.setItem('avt-tips3d','9');const rc=RACES.find(r=>r.key===k);const id=realIdOf(rc);window.__keep=window.REAL_TRACKS[id];if(mode==='gen')delete window.REAL_TRACKS[id];
              G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(q=>md[q]=a[q]);}
              window.__t0=performance.now();startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});}""", [key, mode])
            pg.wait_for_function('typeof R3!=="undefined"&&R3.order&&R3.order.length>0', timeout=90000)
            pg.evaluate("window.__st=performance.now()-window.__t0;try{filmSkip();}catch(_){};R.me.player=false;R.t=0.01;")
            # мир достроен и люди собраны (одноразовая работа на старте), затем кадры с ожиданием видеокарты (readPixels):
            # без ожидания программная видеокарта копит очередь и цифры ничего не значат
            pg.wait_for_function('R3.next>=R3.order.length', timeout=120000)
            pg.evaluate("{for(let f=0;f<40&&!(typeof r3dPeople3dReady!=='function'||r3dPeople3dReady());f++){R.t+=1/30;R.time+=1/30;raceTick(1/30);r3dRender(1/30);}}")
            r = pg.evaluate("""([k,mode])=>{const rc=RACES.find(r=>r.key===k);const id=realIdOf(rc),keep=window.__keep;const st=window.__st;const gl=G3.gl,px=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
              const C=[],T=[];for(let f=0;f<(+window.__frames||12)&&R&&!R.done;f++){R.t+=1/30;R.time+=1/30;raceTick(1/30);const b=performance.now();r3dRender(1/30);C.push(performance.now()-b);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);T.push(performance.now()-b);}
              const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return +s[Math.floor(s.length*p)].toFixed(1);};
              const out={setup:Math.round(st),cpu:q(C,0.5),p50:q(T,0.5),p95:q(T,0.95),dc:G3.dc,tri:G3.tri,real:!!R.trk.real,n:R.trk.n,segs:(R.trk.seg||[]).map(s=>s.cap).filter(Boolean).slice(0,6)};
              if(mode==='gen')window.REAL_TRACKS[id]=keep;return out;}""", [key, mode])
            res[mode] = r
            if mode == 'real':
                # снимки: старт и три места дальше по трассе (камера игрока)
                for k, frac in enumerate((0.02, 0.3, 0.55, 0.8)):
                    pg.evaluate("""f=>{const T=R.trk,me=R.me,i=Math.max(0,Math.min(T.n-2,Math.round(T.startIdx+(T.closed?T.n:T.finishIdx-T.startIdx)*f))),p=T.pts[i],t=T.T[i];
                      me.idx=i;me.x=p[0];me.z=p[2];me.y=p[1];me.yaw=Math.atan2(t[0],t[1]);me.v=15;R3.cam=null;for(let q=0;q<40;q++){R.t+=1/30;raceTick(1/60);}r3dRender(1/30);r3dRender(1/30);}""", frac)
                    pg.wait_for_timeout(250)
                    pg.screenshot(path=os.path.join(OUT, '%s_%d.png' % (key, k)))
                # заставка с картой (кадр 0)
                try:
                    pg.evaluate("R.done=false;R.hold=false;filmStart();")
                    pg.wait_for_timeout(1400)
                    pg.screenshot(path=os.path.join(OUT, '%s_map.png' % key))
                    pg.evaluate("try{filmSkip();}catch(_){}")
                except Exception as e:
                    print('film', e)
            pg.evaluate("if(R)finishRace(true);closeSheet();closePaper();G.pending=[];")
        print(key, ' | '.join('%s %s' % (m, res[m]) for m in res))
    print('errors', errs[:6])
    b.close()
