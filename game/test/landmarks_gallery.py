# Галерея примет с карты (47c-realmarks.js): каждая модель — тем же WebGL-конвейером, что и гонка
# (шейдер 'lit', фото-материалы, тень солнца, небо по фото), днём. Листы — в scratchpad/lmgal/.
# python3 test/landmarks_gallery.py [лист,лист,…]   (без аргумента — все листы); SIZE=450x350 — размер клетки
from playwright.sync_api import sync_playwright
import sys, os, json, base64, time
OUT = os.environ.get('OUT', '/tmp/claude-0/-home-claude/78ad6e73-468f-5068-9de0-30834cd44849/scratchpad/lmgal')
os.makedirs(OUT, exist_ok=True)
CW, CH = [int(v) for v in os.environ.get('SIZE', '450x350').split('x')]

def I(k, host, l=0, w=0, h=0, **kw):
    o = {'k': k, 'l': l, 'w': w, 'h': h, 'y': kw.pop('y', 0), 'n': kw.pop('n', '')}
    if 'line' in kw: o['line'] = kw.pop('line')
    d = {'o': o, 'host': host}
    d.update(kw)
    return d

def B(name, v=0, **kw):
    d = {'bld': name, 'v': v, 'host': 'ref'}
    d.update(kw)
    return d

import math
# линия по гребню (Великая стена у Бадалина) и через долину (акведук)
RIDGE = [[round(20 * math.sin(z / 80.0), 2), z] for z in range(-260, 261, 13)]
VALLEY = [[round(6 * math.sin(z / 50.0), 2), z] for z in range(-150, 151, 10)]
CITY = [[-60, -140], [-75, -40], [-70, 60], [-40, 140]]
SHEETS = {
    'cath1': [I('cathedral', 'fr', 128, 48, 69, n='Нотр-Дам'), I('cathedral', 'de', 144, 45, 157), I('cathedral', 'uk', 150, 50, 120),
              I('cathedral', 'it', 150, 60, 110), I('cathedral', 'ru', 45, 35, 46), I('cathedral', 'at', 100, 45, 80)],
    'cath2': [I('cathedral', 'es', 110, 45, 80), I('cathedral', 'be', 117, 50, 123), I('cathedral', 'nl', 100, 40, 112),
              I('cathedral', 'us', 100, 50, 100), I('cathedral', 'ch', 80, 35, 70), I('cathedral', 'ru', 100, 100, 103, n='Храм Христа Спасителя')],
    'church': [I('church', 'ru', 30, 14, 30), I('church', 'uk', 30, 12, 25), I('church', 'us', 24, 12, 26), I('church', 'at', 28, 12, 35),
               I('church', 'it', 30, 14, 30), I('church', 'fr', 35, 15, 40)],
    'chapel': [I('chapel', 'ru', 8, 6, 9), I('chapel', 'fr', 10, 6, 8), I('chapel', 'at', 9, 6, 8), I('chapel', 'it', 9, 6, 8),
               I('chapel', 'us', 10, 6, 8), B('church_ru', 0)],
    'castle': [I('castle', 'fr', 80, 60, 40), I('castle', 'de', 90, 55, 35, hf='slope'), I('castle', 'uk', 70, 60, 30), I('castle', 'es', 70, 50, 30),
               I('castle', 'ru', 120, 90, 40), I('castle', 'cn', 80, 60, 25)],
    'palace': [I('palace', 'ru', 300, 30, 18), I('palace', 'fr', 80, 20, 25, y=1550), I('palace', 'fr', 200, 25, 20, y=1680, n='Версаль'),
               I('palace', 'at', 180, 25, 20), I('palace', 'uk', 120, 30, 20), I('palace', 'us', 100, 30, 25)],
    'manor': [I('manor', 'ru', 30, 15, 10), I('manor', 'uk', 30, 14, 12), I('manor', 'us', 28, 15, 10), I('manor', 'fr', 26, 13, 12),
              I('manor', 'it', 26, 13, 10), I('palace', 'it', 90, 22, 18)],
    'fort': [I('fort', 'fr', 180, 140, 8, hf='slope'), I('ruins', 'uk', 30, 18, 14), I('ruins', 'de', 40, 25, 18, hf='slope'),
             I('monastery', 'ru', 150, 110, 0), I('monastery', 'fr', 120, 90, 0, hf='slope'), I('monastery', 'it', 100, 80, 0)],
    'gate': [I('gate', 'de', 26, 14, 22), I('gate', 'ru', 28, 12, 28), I('gate', 'cn', 40, 20, 30), I('gate', 'fr', 24, 12, 22),
             I('gate', 'fr', 45, 22, 50, n='Триумфальная арка'), I('gate', 'ru', 36, 10, 25, n='Триумфальные ворота')],
    'tower': [I('tower', 'it', 8, 8, 50), I('tower', 'ru', 10, 10, 40), I('tower', 'uk', 9, 9, 30), I('tower', 'cn', 14, 14, 30),
              I('tower', 'fr', 9, 9, 30), I('tower', 'ie', 6, 6, 30)],
    'wall': [I('wall', 'cn', 0, 0, 8, line=RIDGE, hf='ridge', n='Великая Китайская стена'), I('wall', 'ru', 0, 0, 12, line=CITY),
             I('wall', 'fr', 0, 0, 9, line=CITY), I('wall', 'de', 0, 0, 9, line=CITY),
             I('aqueduct', 'fr', 0, 4, 48, line=VALLEY, hf='valley', n='Пон-дю-Гар'), I('aqueduct', 'es', 0, 3, 20, line=[[0, -120], [0, 120]])],
    'light': [I('lighthouse', 'fr', 8, 8, 35), I('lighthouse', 'uk', 7, 7, 25), I('lighthouse', 'us', 7, 7, 30), I('windmill', 'fr', 8, 8, 12),
              I('windmill', 'nl', 10, 10, 22), I('windmill', 'es', 7, 7, 10)],
    'mill': [I('windmill', 'uk', 8, 8, 14), I('windmill', 'ru', 8, 8, 12), I('windmill', 'us', 9, 9, 18), I('watermill', 'fr', 14, 9, 7),
             I('watermill', 'de', 14, 9, 8), I('watermill', 'ru', 12, 8, 6)],
    'monu': [I('monument', 'fr', 8, 8, 12), I('monument', 'de', 12, 12, 15), I('obelisk', 'fr', 4, 4, 23), I('statue', 'ru', 4, 4, 9),
             I('column', 'ru', 8, 8, 47), I('column', 'fr', 8, 8, 44)],
    'station': [I('station', 'fr', 120, 18, 20), I('station', 'uk', 100, 16, 18), I('station', 'ru', 80, 16, 16), I('station', 'it', 90, 16, 18),
                I('column', 'uk', 8, 8, 50), I('obelisk', 'ie', 27, 27, 62)],
    'east': [I('mosque', 'ly', 30, 26, 30), I('mosque', 'ru', 24, 14, 30), I('mosque', 'fr', 40, 35, 40), I('pagoda', 'cn', 14, 14, 45),
             I('pagoda', 'us', 14, 14, 22), I('palace', 'cn', 60, 30, 20)],
    'zoom': [I('palace', 'ru', 300, 30, 18, zoom=0.42, tgt=[0, 0, 100]), I('palace', 'ru', 120, 24, 16, n='Зимний'), I('cathedral', 'fr', 128, 48, 69, n='Нотр-Дам', zoom=0.5, tgt=[0, 0, -50])],
    'zoom2': [I('wall', 'cn', 0, 0, 8, line=RIDGE, hf='ridge', n='Великая Китайская стена', zoom=0.22, tgt=[-10, -8, -150], view=[0.9, 0.35, 0.3]),
              I('aqueduct', 'fr', 0, 4, 48, line=VALLEY, hf='valley', n='Пон-дю-Гар', zoom=0.45, view=[0.95, 0.25, -0.2]),
              I('fort', 'fr', 180, 140, 8, hf='slope', zoom=0.45, tgt=[60, 0, -50]), I('wall', 'ru', 0, 0, 12, line=CITY, zoom=0.3, tgt=[0, 0, -60])],
    'zoom3': [I('aqueduct', 'es', 0, 3, 20, line=[[0, -120], [0, 120]], zoom=0.25, view=[0.9, 0.3, -0.3]), I('aqueduct', 'fr', 0, 4, 48, line=VALLEY, hf='valley', zoom=0.25, view=[0.95, 0.25, -0.2])],
    'detail': [I('wall', 'ru', 0, 0, 12, line=CITY, zoom=0.12, tgt=[0, 6, -40], view=[0.9, 0.25, -0.35]), I('mosque', 'ru', 24, 14, 30, zoom=0.3, tgt=[0, 8, -6]),
               I('mosque', 'ly', 30, 26, 30, zoom=0.35, tgt=[16, 10, -16]), I('castle', 'ru', 120, 90, 40, zoom=0.25, tgt=[50, 0, 0])],
    'misc': [I('observatory', 'fr', 30, 12, 16), I('observatory', 'fr', 0, 0, 0, n='Обсерватория Мон-Ванту'), I('water_tower', 'de', 9, 9, 30),
             I('water_tower', 'us', 10, 10, 30), I('water_tower', 'ru', 8, 8, 25), I('zzz', 'fr', 12, 10, 9)],
}
JS = r"""
async ({items,cols,cw,ch})=>{
  if(!window.__LG){const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999;width:'+cw+'px;height:'+ch+'px';document.body.appendChild(cv);
    if(!g3Init(cv))throw new Error('no webgl2');await texUpload();const sky=await texSky('clear');window.__LG={cv,sky};}
  const {cv,sky}=window.__LG,gl=G3.gl;cv.width=cw;cv.height=ch;
  // рельефы для проверки hf
  const HF={slope:(x,z)=>0.07*x+0.05*z,ridge:(x,z)=>{const hr=26+17*Math.sin(z/70),d=x-20*Math.sin(z/80);return hr*Math.exp(-d*d/(2*48*48))-26;},valley:(x,z)=>4-30*Math.exp(-z*z/(2*80*80))};
  const rows=Math.ceil(items.length/cols),sheet=document.createElement('canvas');sheet.width=cw*cols;sheet.height=ch*rows;const sg=sheet.getContext('2d');sg.fillStyle='#202020';sg.fillRect(0,0,sheet.width,sheet.height);
  const info=[];const T={cfg:{host:'fr',terr:'dirt'}};
  const use=(name,VP,SHM,eye,E,shOn)=>{const P=G3.P[name];gl.useProgram(P.p);const u=P.u;gl.uniformMatrix4fv(u.u_vp,false,VP);if(u.u_shm)gl.uniformMatrix4fv(u.u_shm,false,SHM);
    gl.uniform3fv(u.u_sun,E.sun);gl.uniform3fv(u.u_sunC,E.sunC);gl.uniform3fv(u.u_skyC,E.skyC);gl.uniform3fv(u.u_gndC,E.gndC);gl.uniform3fv(u.u_hzC,E.hzC);gl.uniform3fv(u.u_zeC,E.zeC);gl.uniform3fv(u.u_fogS,E.fogS);
    gl.uniform3fv(u.u_cam,eye);gl.uniform1f(u.u_fogD,E.fogD);gl.uniform1f(u.u_exp,E.exp);gl.uniform1f(u.u_time,0);gl.uniform1f(u.u_vig,0);gl.uniform2f(u.u_res,cw,ch);
    if(u.u_mat)gl.uniform4fv(u.u_mat,MPAR);if(u.u_sh){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G3.sh);gl.uniform1i(u.u_sh,0);gl.uniform3f(u.u_shI,1/G3.shS,shOn?1:0,0);}
    if(u.u_hl)gl.uniform1f(u.u_hl,0);if(u.u_lamp)gl.uniform4f(u.u_lamp,0,0,0,0);if(u.u_envR)gl.uniform4f(u.u_envR,E.envRot||0,E.envK,sky.lv-1,1);if(u.u_envR2)gl.uniform4f(u.u_envR2,0,0,0,0);
    if(u.u_lay){const tx=G3.cache.tx;gl.uniform4fv(u.u_lay,tx.lay);gl.uniform4fv(u.u_lavg,tx.avg);}if(u.u_tq)gl.uniform4f(u.u_tq,1,0,1,1);if(u.u_model)gl.uniformMatrix4fv(u.u_model,false,m4());return P;};
  for(let i=0;i<items.length;i++){const it=items[i];let M=null,err=null;const t0=performance.now();
    try{M=it.bld?BLD[it.bld](mulberry32(7),it.v||0):lmMesh(it.o,it.host,it.hf?HF[it.hf]:null);}catch(e){err=String(e&&e.stack||e);}
    const ms=Math.round(performance.now()-t0);if(!M){info.push({i,err});continue;}
    const mb=new MB();mbFromMesh(mb,M,{lift:0.03,step:0.012,minW:0.03,texts:[],tex:TX.st===2});const tri=mb.ix.length/3,gM=g3Mesh(mb);
    const bb=mb.bb,c=[(bb[0]+bb[3])/2,(bb[1]+bb[4])/2,(bb[2]+bb[5])/2],R=Math.hypot(bb[3]-bb[0],bb[4]-bb[1],bb[5]-bb[2])/2;
    // земля: луг (с рельефом, если он есть)
    const gb=new MB();gb.e[3]=txLay('meadow',1);const gc=hex2rgb('#7d9a5a'),hfn=it.hf?HF[it.hf]:null;
    if(hfn){const G=R*1.3,N=56,P=(a,b)=>{const x=c[0]-G+2*G*a/N,z=c[2]-G+2*G*b/N;return [x,hfn(x,z)-0.15,z];};
      for(let a=0;a<N;a++)for(let b=0;b<N;b++){const p=P(a,b),q=P(a+1,b),s=P(a+1,b+1),t=P(a,b+1),u=[s[0]-p[0],s[1]-p[1],s[2]-p[2]],v=[t[0]-q[0],t[1]-q[1],t[2]-q[2]];let n=v3n(v3x(u,v));if(n[1]<0)n=n.map(x=>-x);gb.poly([p,q,s,t],n,gc,MID.matte);}}
    else{const G=Math.max(400,R*8);gb.poly([[c[0]-G,0,c[2]-G],[c[0]+G,0,c[2]-G],[c[0]+G,0,c[2]+G],[c[0]-G,0,c[2]+G]],[0,1,0],gc,MID.matte);}
    gb.e[3]=0;const gG=g3Mesh(gb);
    // свет и камера: три четверти с +x и −z (фасад и западный вход), солнце слева спереди
    const E=Object.assign({},r3dEnvPhoto(T,{mood:'clear',az:it.az===undefined?1.95:it.az}));E.fogD=0.00025;
    const d=v3n(it.view||[0.78,0.42,-0.62]),vf=0.62,dist=R/Math.sin(vf/2)*(it.zoom||0.92),tg=it.tgt?[c[0]+it.tgt[0],c[1]+it.tgt[1],c[2]+it.tgt[2]]:c,eye=[tg[0]+d[0]*dist,tg[1]+d[1]*dist,tg[2]+d[2]*dist];
    const f=v3n([tg[0]-eye[0],tg[1]-eye[1],tg[2]-eye[2]]),rt=v3n(v3x([0,1,0],f)),up=v3x(f,rt),P=m4(),V=m4(),VP=m4();m4persp(P,vf,cw/ch,Math.max(0.5,dist-R*2),dist+R*14+800);m4view(V,eye,rt,up,f);m4mul(VP,P,V);
    // тень
    const S=R*1.45,L=E.sun,fs=[-L[0],-L[1],-L[2]],srt=v3n(v3x([0,1,0],fs)),sup=v3x(fs,srt),se=[c[0]-fs[0]*R*4,c[1]-fs[1]*R*4,c[2]-fs[2]*R*4],SV=m4(),SP=m4(),SHM=m4();m4view(SV,se,srt,sup,fs);m4ortho(SP,-S,S,-S,S,1,R*9);m4mul(SHM,SP,SV);
    const shOn=!!G3.shFB;if(shOn){gl.bindFramebuffer(gl.FRAMEBUFFER,G3.shFB);gl.viewport(0,0,G3.shS,G3.shS);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2.5,6);
      const Pd=G3.P.dLit;gl.useProgram(Pd.p);gl.uniformMatrix4fv(Pd.u.u_vp,false,SHM);gl.uniformMatrix4fv(Pd.u.u_model,false,m4());gl.uniform1f(Pd.u.u_time,0);gl.uniform4fv(Pd.u.u_mat,MPAR);g3Draw(gM);gl.disable(gl.POLYGON_OFFSET_FILL);}
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cw,ch);gl.clearColor(0.5,0.6,0.7,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);texBind(sky,null);
    gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
    use('lit',VP,SHM,eye,E,shOn);g3Draw(gG);g3Draw(gM);
    gl.depthMask(false);gl.disable(gl.CULL_FACE);const Ps=use('sky',VP,SHM,eye,E,shOn),IV=m4();m4inv(IV,VP);gl.uniformMatrix4fv(Ps.u.u_ivp,false,IV);gl.uniform1f(Ps.u.u_night,0);gl.uniform4f(Ps.u.u_panR,-0.012,0.16,2,0);
    gl.bindVertexArray(G3.full.vao);gl.drawArrays(gl.TRIANGLES,0,3);gl.depthMask(true);
    const px=new Uint8Array(cw*ch*4);gl.readPixels(0,0,cw,ch,gl.RGBA,gl.UNSIGNED_BYTE,px);const id=sg.createImageData(cw,ch);for(let y=0;y<ch;y++)id.data.set(px.subarray((ch-1-y)*cw*4,(ch-y)*cw*4),y*cw*4);
    const ox=(i%cols)*cw,oy=Math.floor(i/cols)*ch;sg.putImageData(id,ox,oy);g3Free(gM);g3Free(gG);
    const lab=(it.bld?it.bld:(it.o.k+' '+it.host+(it.o.n?' «'+it.o.n+'»':'')))+' · '+tri+' тр.';sg.fillStyle='rgba(0,0,0,.55)';sg.fillRect(ox,oy,cw,18);sg.fillStyle='#fff';sg.font='12px sans-serif';sg.fillText(lab,ox+5,oy+13);
    info.push({i,lab,tri,ms,foot:M.foot.map(v=>Math.round(v)),bb:[...bb].map(v=>Math.round(v))});}
  return {url:sheet.toDataURL('image/png'),info};}
"""
want = sys.argv[1].split(',') if len(sys.argv) > 1 and sys.argv[1] else list(SHEETS)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 900, 'height': 700}, device_scale_factor=1)
    errs, net = [], []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    # сетевые отказы (шрифты из интернета в песочнице) — отдельно: это не ошибки страницы
    pg.on('console', lambda m: (net if 'Failed to load resource' in m.text else errs).append(m.text) if m.type == 'error' or (m.type == 'warning' and 'lmMesh' in m.text) else None)
    pg.add_init_script("localStorage.setItem('avt-audio',JSON.stringify({music:false,sfx:false,demo:false}))")
    pg.goto('file:///home/claude/Avtoimperia-Android/game/dist/avtoimperia.html'); pg.wait_for_timeout(500)
    for name in want:
        items = SHEETS[name]
        if os.environ.get('ONLY'): items = [items[int(k)] for k in os.environ['ONLY'].split(',')]
        # VIEW=back — с обратной стороны (апсиды, задние фасады), VIEW=top — сверху
        vw = {'back': [-0.78, 0.42, 0.62], 'top': [0.35, 0.9, -0.25], 'side': [-0.9, 0.3, -0.3]}.get(os.environ.get('VIEW', ''))
        if vw: items = [dict(it, view=vw, az=(it.get('az', 1.95) + 3.14159) if os.environ.get('VIEW') == 'back' else it.get('az', 1.95)) for it in items]
        cols = int(os.environ.get('COLS', '2' if len(items) <= 4 else '3'))
        t0 = time.time()
        r = pg.evaluate(JS, {'items': items, 'cols': cols, 'cw': CW, 'ch': CH})
        path = os.path.join(OUT, name + ('_' + os.environ['VIEW'] if os.environ.get('VIEW') else '') + '.png')
        open(path, 'wb').write(base64.b64decode(r['url'].split(',')[1]))
        print(name, '%.1fs' % (time.time() - t0), path)
        for q in r['info']: print('   ', q)
    print('JS errors:', len(errs), errs[:10], '| network (not JS):', len(net))
    b.close()
    sys.exit(1 if errs else 0)
