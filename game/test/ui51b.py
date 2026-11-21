# 0.51, правки по отзыву 21 ноября: в гонке автобус — автобус, закрытая модель — закрытая; серпантин Клаузена и Гран-при Рима
# строятся в 3D без ошибок; свой узел виден в «Улучшениях» и дорабатывается на месте.  python3 game/test/ui51b.py
from playwright.sync_api import sync_playwright
import os, json
out = '/home/claude/work/ui51b/'
os.makedirs(out, exist_ok=True)
fails = 0
def ok(c, m):
    global fails
    print(('  ok  ' if c else '  FAIL ') + m, flush=True)
    if not c: fails += 1
START = """([k,prep,body,view])=>new Promise(res=>{localStorage.setItem('avt-tips3d','9');try{SCN_OFF=true;}catch(_){};const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];
  {const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(q=>md[q]=a[q]);}md.b=body;md.paint='#b8322a';md.status='prod';
  realLoad(rc,()=>{try{startRace({rc,mode:'drive',entries:[{drv:'me',md,prep,tyre:'soft',gear:0}]});R.me.player=false;R.t=0.01;R3.view=view;window.__frz=1;if(!window.__rt0)window.__rt0=raceTick;window.raceTick=function(dt){if(window.__frz)return;window.__rt0(dt);};
    res({real:!!R.trk.real,style:R.me.style,n:R.trk.n,gl:!!R3.on});}catch(e){res({err:String(e)});}});})"""
STOP = "window.__frz=0;window.raceTick=window.__rt0;if(R)finishRace(true);closeSheet();closePaper();G.pending=[];"
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader'])
    pg = b.new_page(viewport={'width': 420, 'height': 620}, device_scale_factor=1)
    pg.set_default_timeout(180000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(lambda u: not u.startswith('file:'), lambda r: r.abort())
    pg.goto('file:///home/claude/avtoimperia/docs/index.html'); pg.wait_for_timeout(1500)
    js = lambda s, a=None: pg.evaluate(s, a) if a is not None else pg.evaluate(s)
    js("demoStop();hideMainMenu();newGame('ford','us','Форд Мотор','normal','Модель V');G.pending=[];try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){}")
    # автобус и закрытая модель в гонке
    for name, body, prep, want in [('avtobus', 'b15', 0, 'bus'), ('zakrytaya', 'b5', 2, 'sedan'), ('gorodskoi', 'b14', 0, 'bus')]:
        r = js(START, ['klausen-1927', prep, body, 3])
        pg.wait_for_timeout(1200); js("try{filmSkip();}catch(_){}")
        pg.wait_for_timeout(2500); gl = js('!!(R&&R3.on)')
        ok(not r.get('err') and r.get('style') == want and gl, '%s (%s, подготовка %d): облик в гонке — %s, 3D идёт: %s' % (name, body, prep, r.get('style'), gl))
        js("R3.view=3;R3.orbD=9;R3.orbH=2.6;R3.orbA=2.2;R3.cam=null;"); pg.wait_for_timeout(1800); pg.screenshot(path=out + '%s_0.png' % name)
        js("R3.view=0;R3.cam=null;"); pg.wait_for_timeout(1800); pg.screenshot(path=out + '%s_1.png' % name)
        js(STOP); pg.wait_for_timeout(500)
    if os.environ.get('ONLY') == 'look':
        print('снимки:', out); b.close(); raise SystemExit(0)
    # серпантин Клаузена: машина — у поперечника с укороченной обочиной
    r = js(START, ['klausen-1927', 1, 'b3', 0])
    q = js("""(()=>{const T=R.trk,L=branchLims(T);let bi=-1,bl=14;for(let i=20;i<T.n-20;i++){const l=Math.min(L[i*2],L[i*2+1]);if(l<bl){bl=l;bi=i;}}if(bi<0)return {none:1,n:T.n};
      const c=R.me,i=Math.max(0,bi-6),p=T.pts[i],t=T.T[i];c.x=p[0];c.z=p[2];c.yaw=Math.atan2(t[0],t[1]);c.idx=i;c.lat=0;c.vx=0;c.prog=i*T.step;R3.cam=null;return {i:bi,lim:bl,cut:T.shLimN};})()""")
    js("try{filmSkip();}catch(_){}"); pg.wait_for_timeout(3000)
    pg.screenshot(path=out + 'klausen_serp.png')
    ok(r.get('real') and (q.get('none') or q.get('lim', 14) < 14), 'Клаузен в 3D: серпантин в окне трассы %s' % q)
    js(STOP); pg.wait_for_timeout(500)
    # Гран-при Рима
    r = js(START, ['x42022-1927', 2, 'b3', 0])
    q = js("""(()=>{const T=R.trk,P=T.pts,n=T.n;let m=1e9;for(let i=0;i<n;i+=2)for(let j=i+20;j<n;j+=2){const d=Math.hypot(P[i][0]-P[j][0],P[i][2]-P[j][2]);if(d<m)m=d;}return {n,min:Math.round(m),fixed:!!(T.real&&T.real.d&&T.real.d._fixed)};})()""")
    pg.wait_for_timeout(2000)
    pg.screenshot(path=out + 'roma_start.png')
    ok(r.get('real') and q['fixed'] and q['min'] > 20, 'Гран-при Рима в 3D: маршрут починен, ветки не ближе %s м' % q['min'])
    js(STOP); pg.wait_for_timeout(500)
    # свой узел: «Улучшения» и доводка
    js("newGame('ford','us','Форд Мотор','normal','Модель V');G.pending=[];try{sagaStop();}catch(_){};for(let i=0;i<8;i++)try{closePaper();}catch(_){}")
    r = json.loads(js("""JSON.stringify((()=>{const s=G;s.y=1912;s.m=3;s.cash=5e6;s.pending=[];s.rd.lvl=Math.max(2,s.rd.lvl||0);const e0=s.models[0].e;
      ownStart(s,{k:'e',base:e0,tech:[],goal:'power',gl:1,name:'Мотор Форда'});const pj=rdActive(s).find(p=>p.kind==='own');s.rd.projs=s.rd.projs.filter(p=>p!==pj);ownDone(s,pj);s.pending=[];for(let i=0;i<4;i++)try{closePaper();}catch(_){}
      return {n:s.custom.length,id:s.custom[0].id};})())"""))
    js("document.querySelector('[data-act=ownOpen]')?0:0;openOwn(null)"); pg.wait_for_timeout(400)
    h = js("({btn:!!document.querySelector('[data-act=ownRefine]'),txt:(document.querySelector('[data-act=ownRefine]')||{}).textContent||''})")
    ok(r['n'] == 1 and h['btn'] and 'Доработать' in h['txt'], 'свои узлы: у мотора кнопка «Доработать»')
    js("document.querySelector('[data-act=ownRefine]').click()"); pg.wait_for_timeout(500)
    h = js("({into:!!document.getElementById('owninto'),on:(document.querySelector('#owninto .chip.on')||{}).textContent||'',name:!!document.getElementById('ownname'),go:(document.querySelector('[data-act=ownStart]')||{}).textContent||''})")
    ok(h['into'] and 'Доработать этот узел' in h['on'] and not h['name'] and 'Доработать' in h['go'], 'лист доводки: выбран «Доработать этот узел», имя не спрашивают — %s' % h['go'])
    pg.screenshot(path=out + 'own_refine.png')
    js("document.querySelector('[data-act=ownStart]').click()"); pg.wait_for_timeout(500)
    h = js("({pj:rdActive(G).filter(p=>p.kind==='own'&&p.sp&&p.sp.into).length,n:G.custom.length})")
    ok(h['pj'] == 1 and h['n'] == 1, 'доводка начата: проект в КБ, новых узлов не появилось')
    ok(not errs, 'ошибок на странице нет' + (': ' + ' | '.join(errs[:3]) if errs else ''))
    b.close()
print('ok' if not fails else 'FAILED %d' % fails)
