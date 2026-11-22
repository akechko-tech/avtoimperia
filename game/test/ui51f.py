# 0.51, тема 10 (вторая часть), в браузере: зрители по стране гонки и целиком в кадре атласа, объёмные люди у камеры,
# трёхмерные модели новой техники в «студии» и в карточке. python3 game/test/ui51f.py
from playwright.sync_api import sync_playwright
import time, os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ok=0;bad=0
def CK(c,m):
    global ok,bad
    if c: ok+=1;print('  ok ',m)
    else: bad+=1;print('  FAIL',m)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader']);pg=b.new_page(viewport={'width':640,'height':400},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));warn=[];pg.on('console',lambda m:warn.append(m.text) if m.type in('warning','error') and ('p3d' in m.text or 'atlas' in m.text or 'studio' in m.text) else None)
    pg.add_init_script("localStorage.setItem('avt-audio',JSON.stringify({music:false,sfx:false,demo:false}));localStorage.setItem('avt-film','9');localStorage.setItem('avt-tips3d','9')")
    pg.goto('file://'+ROOT+'/docs/index.html');pg.wait_for_timeout(500)
    pg.click('[data-act=newgame]');pg.click('[data-act=ngDir][data-v=car]');pg.click('[data-act=country][data-v=fr]');pg.click('[data-act=pion][data-v=renault]');pg.click('[data-act=startgame]');pg.wait_for_timeout(300)
    # 1. студия: новая техника — свои модели
    r=pg.evaluate("""()=>{const out={};['b24','b25','b29','b28','b17','b13'].forEach((b,i)=>{try{const md=JSON.parse(JSON.stringify(G.models[0]));const a=aiCarMd(1920);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);md.b=b;md.id='u'+i;md.paint='#5a6a50';
        const sp=modelSpec(md,0,1920,{country:'fr',mech:false,num:0}),cv=stuRender(sp,{w:320,crew:1});let n=0;if(cv){const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;for(let k=3;k<d.length;k+=16)if(d[k]>40)n++;}
        out[b]={kind:workKind51(sp),px:n,art:/data-stu/.test(carArt(md,{y:1920}))&&!/<svg/.test(carArt(md,{y:1920}))};}catch(e){out[b]={err:e.message};}});return out;}""")
    CK(all(v.get('px',0)>800 and v.get('kind') for v in r.values()),'студия рисует трактор, гусеничный, танк, броневик, пожарную и тягач: '+str({k:v.get('px',v.get('err')) for k,v in r.items()}))
    CK(all(v.get('art') for v in r.values()),'в карточке модели у новой техники — трёхмерный портрет, а не рисунок сбоку')
    # 2. гонка в Италии: атлас зрителей по стране, фигуры целиком в клетке
    pg.evaluate("""(k)=>{const rc=RACES.find(r=>r.key===k);G.pending=[];G.y=rc.y;G.m=rc.m;G.cash=1e6;const md=G.models[0];{const a=aiCarMd(rc.y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,rc.y,x=>!x.truck&&!x.moto).id;
      startRace({rc,mode:'drive',entries:[{drv:'me',md,prep:2,tyre:'soft',gear:0}]});R.me.player=false;}""",'monza1922-1922')
    t0=time.time()
    while pg.evaluate("R&&R.loading") and time.time()-t0<200: pg.wait_for_timeout(400)
    pg.evaluate("if(R&&R.film)filmSkip();R.hold=true;")
    a=pg.evaluate("()=>({era:R3.atlasEra,n:R3.atlas.crowd.length,anim:R3.atlas.crowd.filter(e=>e.anim).length,m:R3.atlas.marsh.length,g:R3.atlas.gend.length,ph:R3.atlas.photo.length,me:(R3.atlas.mech||[]).length,bld:!!R3.atlas.bld,ppl:R3.people.length})")
    CK(a['bld'] and str(a['era']).endswith('|it'),'атлас зрителей — свой для страны гонки (Монца: '+str(a['era'])+')')
    CK(a['n']>=40 and a['m']==2 and a['g']==1 and a['ph']==1 and a['me']==2,'в атласе %d зрителей (было 30), два маршала, страж порядка, фотограф, два механика; машут %d'%(a['n'],a['anim']))
    fr=pg.evaluate("""()=>{const A=R3.atlas,gl=G3.gl,W=2048,H=1024,fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,R3.texPeople,0);const out=[];
      A.crowd.concat(A.gend,A.marsh).forEach(e=>{const x=Math.round(e.u*W),y=Math.round(e.v*H),w=Math.round(e.du*W),h=Math.round(e.dv*H),px=new Uint8Array(w*h*4);gl.readPixels(x,y,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);
        let top=0,bot=0,any=0;for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(px[(j*w+i)*4+3]>40){any++;if(j<2)top++;if(j>h*0.95)bot++;}}out.push([top,bot,any]);});
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.deleteFramebuffer(fb);return out;}""")
    cut=sum(1 for t in fr if t[0]>0);feet=sum(1 for t in fr if t[1]>0);empty=sum(1 for t in fr if t[2]<150)
    CK(cut==0 and empty==0,'ни одна фигура не срезана сверху (было: всё выше 1,75 м — шляпы и головы — срезалось): срезано %d из %d'%(cut,len(fr)))
    CK(feet>=len(fr)*0.9,'ноги стоят на нижнем крае клетки — «плакат» не висит над землёй (%d из %d)'%(feet,len(fr)))
    # 3. объёмные люди у камеры строятся без ошибок
    t0=time.time()
    while not pg.evaluate("r3dPeople3dReady()") and time.time()-t0<90: pg.wait_for_timeout(500)
    q=pg.evaluate("()=>({ready:r3dPeople3dReady(),on:!!R3.p3dOn,m:R3.atlas.crowd.filter(e=>e.m3&&e.m3.length).length})")
    CK(q['ready'] and q['m']==a['n'],'объёмные модели зрителей построены: %d из %d'%(q['m'],a['n']))
    # 4. экипажи машин на старте: одежда не у всех одна
    cr=pg.evaluate("()=>{const S=new Set(),T=new Set();R.cars.forEach(c=>{if(!c.spec3)return;const k=crewKit51(c.spec3,false);S.add(k.top+'|'+k.coat+'|'+k.cap);T.add(c.spec3.cc||'');});return {kits:S.size,cars:R.cars.length,cc:[...T].join(',')};}")
    CK(cr['kits']>=min(4,cr['cars']-1),'у %d машин на старте %d разных нарядов гонщика (страны команд: %s)'%(cr['cars'],cr['kits'],cr['cc']))
    pg.wait_for_timeout(1500)
    CK(not errs and not warn,'ошибок на странице нет '+str(errs[:3])+str(warn[:3]))
    b.close()
print('ok' if not bad else 'FAILED %d'%bad)
if bad: raise SystemExit(1)
