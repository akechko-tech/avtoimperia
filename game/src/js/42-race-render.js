/* ================= RACE RENDER: pseudo-3D road over real physics, sprites, HUD ================= */
const RV={CAMH:2.7,BACK:5.6,CAMD:1.15,DRAW:190,HOR:0.36};
const angWrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
// 3D (WebGL2), если телефон умеет; иначе — прежняя псевдо-3D картинка
function setupRender(){try{rMusUI();}catch(_){}
  R.gl=false;setupRender2d(false);
  if(r3dWanted()){let ok=false;try{ok=g3Init(document.getElementById('rgl'));}catch(e){ok=false;}
    if(ok){
      // фото-материалы и небо в видеокарту (первая гонка — загрузка), потом мир и заставка
      R.loading=true;raceLoadUI(true);const t0=performance.now();
      texPrepare(R.wx.mood,res=>{if(!R||R.done)return;
        if(res){try{r3dSetup();R.gl=true;}catch(e){console.error(e);R.gl=false;try{r3dDispose();}catch(_){}}}
        const go=()=>{if(!R||R.done)return;R.loading=false;raceLoadUI(false);if(!R.gl){render2dFallback();toast('3D-графика недоступна — упрощённая картинка');driveTipsAtStart();}else filmStart();R.lastT=performance.now();};
        // дать кадру загрузки хоть мгновение, чтобы не мигал
        const w=Math.max(0,450-(performance.now()-t0));w?setTimeout(go,w):go();});
      return;}}
  render2dFallback();driveTipsAtStart();
}
function render2dFallback(){const g=document.getElementById('rgl');if(g)g.hidden=true;document.getElementById('rcv').hidden=false;setupRender2d(true);}
function setupRender2d(full){
  const T=R.trk,F=R.follow;R.cam={lat:F?F.lat:0,psi:0,y:F?F.y:0,sky:0,phaseT:0,phase:0};
  const mc=document.getElementById('rMap');const g=mc.getContext('2d');const W=mc.width=180,H=mc.height=180;let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;T.pts.forEach(p=>{mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0]);mnz=Math.min(mnz,p[2]);mxz=Math.max(mxz,p[2]);});
  const scl=Math.min((W-20)/(mxx-mnx||1),(H-20)/(mxz-mnz||1));R.map={g,W,H,f:(x,z)=>[10+(x-mnx)*scl+((W-20)-(mxx-mnx)*scl)/2,H-10-(z-mnz)*scl-((H-20)-(mxz-mnz)*scl)/2]};
  const off=document.createElement('canvas');off.width=W;off.height=H;const og=off.getContext('2d');og.strokeStyle='rgba(255,255,255,.85)';og.lineWidth=3;og.beginPath();T.pts.forEach((p,i)=>{const [x,y]=R.map.f(p[0],p[2]);i?og.lineTo(x,y):og.moveTo(x,y);});if(T.closed)og.closePath();og.stroke();R.map.bg=off;
  if(full===false)return;const set=SCEN_SETS[T.cfg.host];R.bg=mkBackdrop(set,T.cfg);
  car3dQueue(raceVisCars().map(c=>c.spec3),F&&F.spec3);scenQueue(T);
}
function renderRace(dt){
  if(R&&R.gl){try{r3dRender(dt);}catch(e){console.error(e);r3dFail('error');}if(R&&R.gl){raceMiniMap();updateRaceHUD();return;}}
  const cv=document.getElementById('rcv');if(!cv||!R)return;if(!R.bg)setupRender2d(true);
  // чёткость подстраивается под телефон: если кадры тянутся дольше ~27 мс, рисуем чуть крупнее пиксель
  R.ftAvg=(R.ftAvg||0.016)*0.95+Math.min(0.1,dt||0.016)*0.05;if(R.t>1.5&&R.ftAvg>0.027&&(R.dprK||1)>0.6){R.dprK=(R.dprK||1)-0.125;R.ftAvg=0.018;}
  const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)*(R.dprK||1)),W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=true;
  car3dWork(R.t<0?22:3);
  if(R.shake>0)c.translate((Math.random()-0.5)*R.shake*12,(Math.random()-0.5)*R.shake*8);
  const T=R.trk,F=R.follow,cfg=T.cfg,n=T.n,step=T.step,cam=R.cam;
  const prog=F.prog/T.raceLen,night=cfg.night&&prog>0.35&&prog<0.75,dusk=cfg.night&&((prog>0.25&&prog<=0.35)||(prog>=0.75&&prog<0.85));
  // камера: чуть позади машины, мягко догоняет её смещение и разворот
  const roadYaw=i=>Math.atan2(T.T[i][0],T.T[i][1]);
  // направление дороги под машиной — плавно между участками, иначе картинка дёргается на каждом стыке
  const i0=F.idx,ip=T.closed?(i0-1+n)%n:Math.max(0,i0-1),inx=T.closed?(i0+1)%n:Math.min(n-1,i0+1);
  const rel=angWrap(F.yaw-(roadYaw(i0)+(F.segT||0)*angWrap(roadYaw(inx)-roadYaw(ip))/2));
  cam.lat+=(F.lat-cam.lat)*Math.min(1,dt*5);cam.psi+=(clamp(rel*0.3,-0.1,0.1)-cam.psi)*Math.min(1,dt*2);cam.y+=((F.y||0)-cam.y)*Math.min(1,dt*6);
  cam.sky+=(T.K[F.idx]||0)*Math.max(0,F.vx)*dt*60;cam.phaseT+=dt;if(cam.phaseT>0.11){cam.phaseT=0;cam.phase^=1;}
  const carS=(F.idx+F.segT)*step,camS=carS-RV.BACK;let base=Math.floor(camS/step),frac=camS/step-base;
  if(T.closed)base=((base%n)+n)%n;else if(base<0){base=0;frac=0;}
  const camY=cam.y+RV.CAMH,horY=H*RV.HOR,half=W/2,CAMD=RV.CAMD;
  // небо, солнце, облака, дальний план
  const set=SCEN_SETS[cfg.host],sk=night?['#060b18','#1a2233']:dusk?['#3b3f6b','#e8966a']:set.sky;
  c.fillStyle=vgrad(c,0,horY,[[0,shade(sk[0],-0.14)],[0.6,sk[0]],[1,sk[1]]]);c.fillRect(0,0,W,horY+2);
  if(night){c.fillStyle='#fff';for(let i=0;i<60;i++)c.fillRect(((i*97+cam.sky*0.2)%W+W)%W,(i*53)%(horY*0.8),1.3,1.3);ell(c,W*0.8,horY*0.25,11,11,'#f3efd8');}
  else{const sx=((W*0.72-cam.sky*0.3)%W+W)%W;const sg=c.createRadialGradient(sx,horY*0.25,4,sx,horY*0.25,80);sg.addColorStop(0,'rgba(255,250,228,.95)');sg.addColorStop(0.25,'rgba(255,246,214,.5)');sg.addColorStop(1,'rgba(255,248,220,0)');c.fillStyle=sg;c.fillRect(sx-80,horY*0.25-80,160,160);
    const cl=dusk?(R.bg.cloudsDusk=R.bg.cloudsDusk||R.bg.clouds.map(cv=>{const d=mkCanvas(cv.width,cv.height),g=d.getContext('2d');g.drawImage(cv,0,0);g.globalCompositeOperation='source-atop';const gr=g.createLinearGradient(0,0,0,cv.height);gr.addColorStop(0,'rgba(255,190,150,.35)');gr.addColorStop(1,'rgba(90,60,110,.55)');g.fillStyle=gr;g.fillRect(0,0,cv.width,cv.height);return d;})):R.bg.clouds,span=W*1.6;for(let i=0;i<6;i++){const cw=(80+((i*53)%70))*Math.max(1,W/420),chh=cw*110/260,cx=((i*span/6+cam.sky*(0.4+i*0.03)+R.time*(2+i*0.4))%span+span)%span-cw,cy=horY*(0.06+((i*37)%34)/100);c.drawImage(cl[i%cl.length],cx,cy,cw,chh);}}
  const bgH=Math.min(H*0.36,R.bg.H*Math.max(1,W/420)),bw=R.bg.W*bgH/R.bg.H;
  [[R.bg.far,0.12,R.bg.tops[0]],[R.bg.mid,0.3,R.bg.tops[1]],[R.bg.near,0.6,R.bg.tops[2]]].forEach(([img,par,tp])=>{const off=(((-cam.sky*par)%bw)+bw)%bw,sc=bgH/R.bg.H;c.globalAlpha=night?0.35:1;for(let x=off-bw;x<W;x+=bw)c.drawImage(img,0,tp,R.bg.W,R.bg.H-tp,x,horY-bgH+4+tp*sc,bw,(R.bg.H-tp)*sc);c.globalAlpha=1;});
  const g0=TERR[T.terrAt(base)]||TERR.dirt;c.fillStyle=night?'#0c1016':g0.g;c.fillRect(0,horY,W,H-horY);
  // дорога: сегменты от ближних к дальним, с отсечением за гребнем холма
  // камера поворачивает вместе с дорогой плавно, а не рывком на стыке участков
  const segs=[];let L=0,theta=-(T.K[base]||0)*step*frac,maxy=H;const clampT=1.15;
  for(let k=0;k<=RV.DRAW;k++){
    let j=base+k;if(T.closed)j%=n;else if(j>=n)break;
    const z=Math.max(0.35,(k-frac)*step);
    const P={j,k,z,Lc:L,th:theta};segs.push(P);
    if(z>0.3){P.scale=half*CAMD/z;P.sx=half-(L-cam.lat+cam.psi*z)*P.scale;P.sy=horY-((T.pts[j][1])-camY)*P.scale;}
    theta=clamp(theta+(T.K[j]||0)*step,-clampT,clampT);L+=Math.sin(theta)*step;
  }
  const quad=(x1,y1,w1,x2,y2,w2,col)=>{y2-=0.7;c.fillStyle=col;c.beginPath();c.moveTo(x1-w1,y1);c.lineTo(x1+w1,y1);c.lineTo(x2+w2,y2);c.lineTo(x2-w2,y2);c.closePath();c.fill();};
  const HW=T.W/2;
  for(let k=0;k<segs.length-1;k++){
    const a=segs[k],b=segs[k+1];if(!a.scale||!b.scale){a.clip=maxy;continue;}
    a.clip=maxy;if(b.sy>=maxy||b.sy>=a.sy){if(b.sy<maxy)maxy=b.sy;continue;}
    const tr=TERR[T.terrAt(a.j)]||TERR.dirt,alt=Math.floor(a.j/3)%2,fog=night?clamp(a.z/60,0,1):clamp(a.z/(RV.DRAW*step),0,1)*0.55;
    const y1=Math.min(a.sy,maxy),y2=b.sy;
    c.fillStyle=night?(alt?'#0c1016':'#0f141b'):(alt?tr.g:tr.g2);c.fillRect(0,y2,W,y1-y2+1);
    const w1=HW*a.scale,w2=HW*b.scale,r1=w1*(cfg.oval?0.14:0.11),r2=w2*(cfg.oval?0.14:0.11);
    quad(a.sx,a.sy,w1+r1,b.sx,b.sy,w2+r2,alt?tr.edge:tr.edge2);
    quad(a.sx,a.sy,w1,b.sx,b.sy,w2,alt?tr.road:tr.road2);
    if(tr.ruts&&a.z<160){c.globalAlpha=0.16;quad(a.sx-w1*0.42,a.sy,w1*0.07,b.sx-w2*0.42,b.sy,w2*0.07,'#3a2a1a');quad(a.sx+w1*0.42,a.sy,w1*0.07,b.sx+w2*0.42,b.sy,w2*0.07,'#3a2a1a');c.globalAlpha=1;}
    if(tr.line&&alt)quad(a.sx,a.sy,w1/36,b.sx,b.sy,w2/36,tr.line);
    if(tr.planks&&a.z<120&&k%1===0){c.globalAlpha=0.25;quad(a.sx,a.sy,w1,a.sx,a.sy-Math.max(0.6,(a.sy-b.sy)*0.12),w1,'#5a4128');c.globalAlpha=1;}
    if(tr.bricks&&a.z<90&&alt){c.globalAlpha=0.12;quad(a.sx,a.sy,w1,b.sx,b.sy,w2,'#2a1208');c.globalAlpha=1;}
    if(!night)roadDetail(c,a,b,tr,HW);
    if(a.j===T.finishIdx){const q=8;for(let i=0;i<q*2;i++){c.fillStyle=i%2?'#111':'#fff';const u=-w1+i*(w1*2/(q*2)),v=-w2+i*(w2*2/(q*2));c.beginPath();c.moveTo(a.sx+u,a.sy);c.lineTo(a.sx+u+w1/q,a.sy);c.lineTo(b.sx+v+w2/q,b.sy);c.lineTo(b.sx+v,b.sy);c.fill();}}
    if(fog>0.02){c.fillStyle=night?`rgba(6,10,20,${fog*0.85})`:`rgba(222,228,234,${fog*0.55})`;c.fillRect(0,y2,W,y1-y2+1);}
    maxy=Math.min(maxy,b.sy);
  }
  // машины по сегментам
  const bySeg={};const lapLen=T.len;
  raceVisCars().forEach(o=>{let s=(o.idx+o.segT)*step-camS;if(T.closed){s=((s%lapLen)+lapLen)%lapLen;if(s>lapLen-20)s-=lapLen;}const kk=Math.floor(s/step+frac);if(kk<0||kk>=segs.length-1)return;(bySeg[kk]=bySeg[kk]||[]).push({o,s});});
  // декорации и машины: от дальних к ближним
  const phase=cam.phase;
  for(let k=segs.length-2;k>=0;k--){
    const a=segs[k];if(!a.scale)continue;const clip=a.clip,items=T.spr[a.j];
    if(items&&items.length&&a.z>1.2){c.save();c.beginPath();c.rect(0,0,W,clip);c.clip();
      for(const it of items){if(it.k==='L'||it.k==='W')continue;const sp=it.k==='p'?peopleSprite(it.t,it.v,phase&&it.v%2?1:0):scenSprite(it.t,it.v,it.off);if(!sp)continue;
        const x=half-(a.Lc+it.off-cam.lat+cam.psi*a.z)*a.scale,w=sp.wM*a.scale,h=sp.hM*a.scale;if(x+w*(1-sp.ax)<0||x-w*sp.ax>W||h<1)continue;
        c.drawImage((night?nightOf(sp):sp).img,x-w*sp.ax,a.sy-h*sp.ay,w,h);}
      c.restore();}
    const cs=bySeg[k];if(cs)cs.sort((p,q)=>q.s-p.s).forEach(({o,s})=>drawRaceCar(c,o,s,segs,k,half,cam,phase,W,H,night,clip,camS));
  }
  // частицы: пыль, дым, пар
  drawParticles(c,dt,W,H);
  if(dusk){c.fillStyle='rgba(60,30,60,.22)';c.fillRect(0,horY,W,H-horY);}
  // ночь: мягкое пятно света фар впереди машины, вокруг темнота
  if(night){const cy=horY+(H-horY)*0.42,g=c.createRadialGradient(W/2,cy,W*0.08,W/2,cy,W*0.95);g.addColorStop(0,'rgba(255,236,190,0.08)');g.addColorStop(0.35,'rgba(2,4,10,0.25)');g.addColorStop(1,'rgba(2,4,10,0.72)');c.fillStyle=g;c.fillRect(0,0,W,H);}
  const sp=Math.max(0,F.vx)/Math.max(1,F.vtop);if(sp>0.8&&!night){c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=1.5;for(let i=0;i<8;i++){const a=(i*0.7+R.time*3)%1,side=i%2?1:-1,sx=W/2+side*W*(0.3+a*0.25);c.beginPath();c.moveTo(sx,H*0.55+a*H*0.4);c.lineTo(sx+side*W*0.06,H*0.6+a*H*0.45);c.stroke();}}
  if(F.pitT>0||F.stopT>0){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,0,W,H);}
  if(R.mode==='drive'&&RW.mode==='wheel'&&!RW.used&&R.time<10){const wz=document.getElementById('rWheel'),cx=wz?wz.offsetLeft+wz.offsetWidth/2:W*0.27;c.font='600 14px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';const tw=c.measureText('ведите пальцем по рулю').width+22,lx=Math.max(tw/2+8,cx);rrect(c,lx-tw/2,H-34,tw,26,13,'rgba(10,16,24,.72)');c.fillStyle='#e9c46a';c.fillText('ведите пальцем по рулю',lx,H-21);c.beginPath();c.moveTo(cx-7,H-8);c.lineTo(cx+7,H-8);c.lineTo(cx,H-1);c.closePath();c.fill();}
  raceMiniMap();updateRaceHUD();drawWheelUI();
}
// мини-карта
function raceMiniMap(){const m=R.map,F=R.follow;if(m){m.g.clearRect(0,0,m.W,m.H);m.g.drawImage(m.bg,0,0);R.cars.forEach(o=>{const [x,y]=m.f(o.x,o.z);m.g.fillStyle=o===F?'#ffd66b':o.you?'#f0c75e':o.dnf?'#555':'#fff';m.g.beginPath();m.g.arc(x,y,o===F?5:3.2,0,7);m.g.fill();});}}
// Ночная копия спрайта: затемнение только по нарисованным пикселям (без тёмных прямоугольников)
function nightOf(sp){if(sp.night)return sp.night;const cv=mkCanvas(sp.img.width,sp.img.height),g=cv.getContext('2d');g.drawImage(sp.img,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(6,9,20,.62)';g.fillRect(0,0,cv.width,cv.height);sp.night={img:cv,wM:sp.wM,hM:sp.hM,ax:sp.ax,ay:sp.ay};return sp.night;}
function drawRaceCar(c,o,s,segs,k,half,cam,phase,W,H,night,clip,camS){
  const a=segs[k],b=segs[k+1];if(!b||!b.scale)return;const f=clamp((s-a.z)/((b.z-a.z)||1),0,1);
  const z=Math.max(0.5,a.z+(b.z-a.z)*f),scale=half*RV.CAMD/z,Lc=a.Lc+(b.Lc-a.Lc)*f;
  const T=R.trk,gy=(o.y||0),sy=H*RV.HOR-(gy-(cam.y+RV.CAMH))*scale,Lr=Lc+o.lat-cam.lat+cam.psi*z,sx=half-Lr*scale;
  const th=a.th+(b.th-a.th)*f,roadYaw=Math.atan2(T.T[o.idx][0],T.T[o.idx][1]);
  // угол машины к лучу зрения (+ — нос вправо): курс к дороге, поворот дороги на экране, поворот камеры и то, левее или правее нас машина
  const rel=angWrap(angWrap(o.yaw-roadYaw)-th-cam.psi+Math.atan2(Lr,z)),near=o===R.follow||z<9;
  if(o!==R.follow&&z<1.6)return;
  // свою машину показываем почти строго сзади: в повороте она лишь чуть доворачивает, без бокового ракурса
  const sp=car3dSprite(o.spec3,o===R.follow?clamp(rel*0.45,-0.2,0.2):rel,near,o),w=sp.wM*scale,h=sp.hM*scale;
  if(sx+w<0||sx-w>W||w<2)return;
  const bounce=(o.vx>3?Math.sin(R.time*25+o.num)*0.012*Math.min(1,o.vx/20)*(TERR[T.terrAt(o.idx)]||TERR.dirt).rough:0)*scale;
  c.save();if(o!==R.follow){c.beginPath();c.rect(0,0,W,clip);c.clip();if(z<2.6)c.globalAlpha=clamp((z-1.6)/1,0,1);}
  c.drawImage((night&&o!==R.follow?nightOf(sp):sp).img,sx-w*sp.ax,sy-h*sp.ay+bounce,w,h);
  if((o.brk>0.3&&o.vx>1)||(night&&R.rc.y>=1912)){const br=o.brk>0.3;sp.lamps.forEach(L=>{if(!L.vis)return;const lx=sx+L.x*scale,ly=sy+bounce-L.y*scale,rr=Math.max(1.5,0.07*scale);
    const g=c.createRadialGradient(lx,ly,0,lx,ly,rr*(br?3.2:2.2));g.addColorStop(0,br?'rgba(255,90,60,.95)':'rgba(255,90,60,.55)');g.addColorStop(1,'rgba(255,60,40,0)');c.fillStyle=g;c.beginPath();c.arc(lx,ly,rr*(br?3.2:2.2),0,7);c.fill();});}
  c.restore();
  // пыль из-под задних колёс, дым заноса, пар перегрева — мягкие клубы, уносятся назад, к камере и в стороны
  const tr=TERR[T.terrAt(o.idx)]||TERR.dirt,me=o===R.follow,spd=Math.min(1,Math.max(0,o.vx)/25),kk=scale/40;
  if(tr.dust&&o.vx>5&&Math.random()<0.7*tr.dust){const sd=Math.random()<0.5?-1:1;R.parts.push({x:sx+sd*0.72*scale,y:sy-0.04*scale,vx:sd*(16+Math.random()*44)*spd*kk,vy:(8+Math.random()*26)*spd*kk,r:0.26*scale,gr:1.4*scale,life:1.0,max:1.0,col:'206,188,146',a:me?0.11:0.22});}
  if((o.slipR>0.18||o.spinw>0.4)&&o.vx>4&&Math.random()<0.7){const sd=Math.random()<0.5?-1:1;R.parts.push({x:sx+sd*0.6*scale,y:sy-0.08*scale,vx:sd*(10+Math.random()*30)*kk,vy:(5+Math.random()*20)*kk,r:0.2*scale,gr:1.0*scale,life:0.8,max:0.8,col:'236,236,236',a:0.34});}
  if(o.thr>0.8&&R.rc.y<1914&&Math.random()<0.12)R.parts.push({x:sx+0.3*scale,y:sy-0.3*scale,vx:6*kk,vy:-4*kk,r:0.08*scale,gr:0.4*scale,life:0.5,max:0.5,col:'110,110,110',a:0.3});
  if(o.dnf||o.stopT>0||o.overheat>0){if(Math.random()<0.4)R.parts.push({x:sx+(Math.random()-0.5)*0.5*scale,y:sy-(o.overheat>0?1.0:0.9)*scale,vx:(Math.random()-0.5)*10*kk,vy:-(18+Math.random()*14)*kk,r:0.2*scale,gr:0.8*scale,life:1.3,max:1.3,col:o.overheat>0?'245,245,245':'90,90,90',a:0.4});}
}
// Мягкий клуб: заранее нарисованное пятно с размытыми краями — дешевле градиента на каждую частицу
const PUFF={};function puff(col){if(PUFF[col])return PUFF[col];const c=mkCanvas(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,`rgba(${col},1)`);gr.addColorStop(0.45,`rgba(${col},.6)`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(0,0,64,64);return PUFF[col]=c;}
function drawParticles(c,dt,W,H){R.parts=R.parts.filter(p=>(p.life-=dt||0.016)>0);if(R.parts.length>240)R.parts.splice(0,R.parts.length-240);
  R.parts.forEach(p=>{p.x+=p.vx*(dt||0.016);p.y+=p.vy*(dt||0.016);const k=1-p.life/p.max,r=p.r+p.gr*k;c.globalAlpha=(p.a||0.4)*(1-k)*Math.min(1,k*6+0.3);c.drawImage(puff(p.col),p.x-r,p.y-r,r*2,r*2);});c.globalAlpha=1;}
/* ---------- табло, управление, приказы ---------- */
function setupRaceUI(){RW.mode=steerMode();
  const drive=R.mode==='drive',ctl=document.getElementById('rCtrl'),mg=document.getElementById('rMgr');
  ctl.hidden=!drive;mg.hidden=drive;document.getElementById('rTilt').hidden=!drive;steerApply(steerMode());RW.used=0;document.getElementById('rCam').textContent=drive?'Вид':'Машина';
  if(!drive)renderMgr();
}
function renderMgr(){const mg=document.getElementById('rMgr');if(!R||R.mode==='drive')return;const F=R.follow;
  mg.innerHTML=`<div class="mgr-top"><b>${esc(F.drvName||F.label)}</b><span>${esc(F.label)}${F.dnf?' · сход':''}</span></div>
   <div class="mgr-btns">${[['push','Атака'],['norm','Темп'],['save','Беречь']].map(([k,l])=>`<button class="${F.order===k?'on':''}" data-ord="${k}">${l}</button>`).join('')}<button class="${F.pitCall?'on':''}" data-ord="pit">В боксы</button></div>
   <div class="mgr-btns">${[1,2,4].map(v=>`<button class="${R.speed===v?'on':''}" data-spd="${v}">×${v}</button>`).join('')}<button data-ord="fin">Досчитать</button></div>`;}
function updateRaceHUD(){
  const F=R.follow,T=R.trk,order=raceOrder(),place=order.indexOf(F)+1;
  document.getElementById('hPos').textContent=place+'/'+R.cars.length;
  document.getElementById('hLap').textContent=T.cfg.laps>1?Math.min(T.cfg.laps,Math.max(1,F.lap+1))+'/'+T.cfg.laps:Math.round(clamp(F.prog/T.raceLen,0,1)*100)+'%';
  // время гонщика (при раздельном старте — своё, от линии старта) и часы дня по-историческому
  const tS=R.scn&&R.scn.timed&&F?(F.wait?0:F.fin!==null?scnElapsed(F,F.fin):scnElapsed(F,R.time)):R.time,tm=Math.max(0,tS);document.getElementById('hTime').textContent=Math.floor(tm/60)+':'+String(Math.floor(tm%60)).padStart(2,'0');
  {const ck=document.getElementById('rClock');if(ck&&R.scn){const v='🕓 '+scnClockTxt();if(ck.textContent!==v)ck.textContent=v;}}
  document.getElementById('hSpd').textContent=Math.round(Math.abs(F.vx)*3.6)+(F.draft?'⇶':'');document.getElementById('hGear').textContent=F.rev||F.vx<-0.2?'R':F.gear;
  const hb=document.getElementById('bHeat');hb.style.width=Math.min(100,Math.max(F.heat,F.eng||0))+'%';hb.style.background=F.heat>80?'var(--bad)':F.heat>55?'var(--warn)':'var(--good)';
  const tb=document.getElementById('bTyre'),tl=F.punct?0:100-Math.min(100,F.tyre);tb.style.width=tl+'%';tb.style.background=tl<25?'var(--bad)':tl<50?'var(--warn)':'var(--good)';
  const db=document.getElementById('bDmg'),dl=100-F.dmg;db.style.width=dl+'%';db.style.background=dl<40?'var(--bad)':dl<70?'var(--warn)':'var(--good)';
  {const fb=document.getElementById('bFuel'),need=fuelNeed(F,T),ok=F.fuel>=need;fb.style.width=F.fuel+'%';fb.style.background=F.fuel<12?'var(--bad)':ok?'var(--brass)':'#e8894a';
   const nk=document.getElementById('bFuelNeed');if(nk){nk.style.left=Math.min(100,need)+'%';nk.style.display=F.fuelRate&&F.fin===null&&need>1?'block':'none';}}
  document.getElementById('rReset').hidden=!(R.me&&R.me.stuck>1.2);
  // педаль тормоза подсказывает задний ход: на месте — «держи — назад», включён — «НАЗАД ◀»
  {const b=document.querySelector('#rCtrl .brk'),m=R.me;if(b&&m){const st=m.rev?2:Math.abs(m.vx)<0.5&&R.t>0.8&&m.fin===null&&!m.dnf?1:0;
    if(b.dataset.l!==String(st)){b.dataset.l=String(st);b.classList.toggle('rev',st===2);b.innerHTML=st===2?'НАЗАД ◀':st===1?'ТОРМОЗ<small>держи — назад</small>':'ТОРМОЗ';}}}
  svcHUD();
  const lead=order[0],tim=R.scn&&R.scn.timed,board=order.slice(0,5).map((o,i)=>{const gap=i===0?'':o.dnf?'сход':tim?(o.wait?'старт '+Math.max(0,Math.ceil(o.relT-R.time))+' с':'+'+Math.max(0,scnOrderKey(o)-scnOrderKey(lead)).toFixed(0)+' с'):o.fin!==null&&lead.fin!==null?'+'+(o.fin-lead.fin).toFixed(1):'+'+Math.max(0,Math.round((lead.prog-o.prog)/Math.max(8,o.vx||8)))+' с';return `<div class="${o.you?'you':o.pmy?'mine':''}${o===F?' me':''}"><span>${i+1}</span>${esc((o.drvName||o.name).split(' ').slice(-1)[0])}<small>${esc(o.you?o.label:o.priv?o.label+' · ч.':o.name)}</small><em>${gap}</em></div>`;}).join('');
  const bd=document.getElementById('rBoard');if(bd.dataset.t!==String(Math.floor(R.time*2))){bd.dataset.t=String(Math.floor(R.time*2));bd.innerHTML=board;}
  raceAssistHUD();
  const m=document.getElementById('rMsg');
  m.textContent=R.t<-3?(R.scn&&R.scn.st==='lemans'?'К МАШИНАМ!':'ВНИМАНИЕ!'):R.t<0?Math.ceil(-R.t):R.t<0.8?'СТАРТ!':R.msgT>0?R.msg:F.dnf?'СХОД: '+F.dnf:F.stopT>0?'РЕМОНТ: '+F.stopWhy:(F.punct&&F.vx<1.5)?'МЕНЯЕМ КОЛЕСО…':F.pitT>0?'МЕХАНИКИ РАБОТАЮТ…':'';
  m.classList.toggle('small',m.textContent.length>14);
}
// Кнопка 🔧: что нужно машине; горит, когда без механика дальше плохо
function svcHUD(){const b=document.getElementById('rSvc'),m=R.me,on=!!(m&&R.mode==='drive'&&!m.dnf&&m.fin===null&&R.t>0);
  let lab='Сервис',hot=false;if(on){if(m.svc)lab=m.svc===2?Math.ceil(m.svcT)+' с':'стоп…';else{const tl=100-Math.min(100,m.tyre);
    if(m.punct){lab=m.flat?'Дотяните':'Колесо';hot=!m.flat;}else if(m.fuelRate&&(m.fuel<12||(m.fuel<32&&m.fuel<fuelNeed(m,R.trk)))){lab='Бензин';hot=true;}else if(tl<25){lab='Шины';hot=true;}else if(m.dmg>55||m.limp){lab='Ремонт';hot=true;}}}
  const sig=(on?1:0)+lab+hot;if(b.dataset.s===sig)return;b.dataset.s=sig;b.hidden=!on;b.classList.toggle('hot',hot);b.classList.toggle('busy',!!(m&&m.svc));b.lastChild.textContent=lab;}
/* ---------- подсказки водителю: ближайший поворот и его скорость, сцепление шин ---------- */
// Ближайший поворот впереди (до 200 м): сторона, скорость, с которой шины его удержат, расстояние, нужно ли тормозить
function paceNote(F){const T=R.trk,n=T.n,st=T.step,mu=roadMuAt(T,F.idx)*F.grip*(1-0.3*Math.min(1,F.tyre/100))*(F.punct?0.72:1)*1.08;
  let j0=-1,kmax=0,dir=0;for(let d=0;d<50;d++){let j=F.idx+d;if(T.closed)j%=n;else if(j>=n)break;const k=T.K[j];
    if(j0<0){if(Math.abs(k)>1/75){j0=d;dir=Math.sign(k);kmax=Math.abs(k);}}else{if(Math.sign(k)===dir&&Math.abs(k)>1/160)kmax=Math.max(kmax,Math.abs(k));else break;}}
  if(j0<0)return null;const vc=Math.sqrt(mu*GRAV/kmax);if(vc>F.vtop*0.97)return null;
  const v=Math.max(0,F.vx),dist=Math.max(0,j0*st-(F.segT||0)*st),bdec=F.brakeK*mu*GRAV*0.8,need=v>vc?(v*v-vc*vc)/(2*bdec):0;
  return {dir,kmh:Math.max(5,Math.round(vc*3.6/5)*5),dist,lvl:v<=vc*1.04?'ok':need>dist*0.9?'bad':'warn',hair:1/kmax<20};}
function raceAssistHUD(){const me=R.me,note=document.getElementById('rNote'),grip=document.getElementById('rGrip');
  const on=me&&R.mode==='drive'&&!me.dnf&&me.fin===null&&!(me.stopT>0)&&!(me.pitT>0);
  const pn=on&&R.t>0?paceNote(me):null;
  const sig=pn?pn.dir+'|'+pn.kmh+'|'+pn.lvl+'|'+Math.round(pn.dist/10)+'|'+pn.hair:'';
  if(note.dataset.s!==sig){note.dataset.s=sig;note.hidden=!pn;if(pn){note.className='r-note '+pn.lvl;note.firstChild.textContent=(pn.dir>0?'↰ ':'↱ ')+pn.kmh;
    note.lastChild.textContent=pn.lvl==='bad'?'ТОРМОЗИ!':pn.dist<6?(pn.hair?'шпилька · км/ч':'поворот · км/ч'):'через '+Math.round(pn.dist/10)*10+' м · км/ч';}}
  const g=on&&R.t>0?me.gu||0:-1,lv=g<0?-1:Math.min(5,Math.round(g*5)),cls=g<0?'':g>0.95||me.slipR>0.16?'g3':g>0.75?'g2':'g1',gs=lv+cls;
  if(grip.dataset.s!==gs){grip.dataset.s=gs;grip.hidden=g<0;grip.className='r-grip '+cls;grip.querySelectorAll('i').forEach((el,k)=>el.classList.toggle('on',k<lv));}
  // под колёсами: покрытие и погода (скользкое — жёлтым, очень скользкое — красным)
  const sf=document.getElementById('rSurf');if(sf&&on){const k=me.surf||'',S=SURF[k],txt=!S?'':(me.tun?'тоннель · ':'')+(me.wetRoad&&WET_N[k]?WET_N[k]:S.n),q=S?me.muNow/Math.max(0.3,me.grip):1,cl=q<0.5?'bad':q<0.72?'slip':'';
    if(sf.dataset.s!==txt+cl){sf.dataset.s=txt+cl;sf.textContent=txt;sf.className=cl;}}}
const WET_N={asphalt:'мокрый асфальт',concrete:'мокрый бетон',brick:'мокрый клинкер',pave:'мокрый булыжник',board:'мокрые доски',macadam:'мокрый щебень',dirt:'раскисший грунт',mount:'мокрая горная дорога',
  mud:'жидкая грязь',verge:'мокрая обочина',grass:'мокрая трава',field:'раскисшая пашня',forest:'мокрый лес',rock:'мокрые камни'};
// Как ехать: коротко о физике гонки. Первые две гонки — перед стартом (гонка ждёт), потом — по кнопке «?» (пауза)
const DRIVE_TIPS=[['◀ ▶','руль. Держите — колёса поворачивают сильнее; отпустили — сами встают прямо.'],
  ['↱ 45','справа вверху — впереди поворот, шины удержат машину до 45 км/ч. Жёлтая рамка — сбавьте, красная — тормозите сейчас.'],
  ['ШИНЫ','слева внизу — сколько сцепления занято: зелёные держат, жёлтые с визгом — на пределе, красные — машину несёт наружу.'],
  ['Тормоз','— на прямой, до поворота. В повороте ровный газ, на выходе — полный. Резкий тормоз в повороте может развернуть.'],
  ['Дорога','асфальт и кирпич держат лучше всего, гравий хуже, грязь, песок и снег — плохо: тормозите раньше.'],
  ['Твёрдое','деревья, дома, заборы и зрители не пропускают. Удар — повреждение; поломку механик чинит на обочине.'],
  ['🔧','— сервис: машина остановится, механик сменит шины, дольёт бензин, подтянет поломки. Кнопка горит, когда пора.'],
  ['Обочина','трава, камни и склоны тормозят и бьют подвеску; в гору на поле не заехать. Срезать нельзя — вернут туда, где съехали.'],
  ['Вид','— кнопка вверху: сзади, сверху, из кабины. «?» — эта подсказка и пауза.']];
function showDriveTips(pause){const el=document.getElementById('rTips');if(!R)return;R.hold=true;
  el.innerHTML=`<h3>Как ехать</h3><ul>${DRIVE_TIPS.map(([a,b])=>`<li><b>${a}</b> ${b}</li>`).join('')}</ul><button class="btn primary block" id="rTipsGo">${pause?'Продолжить':'Поехали!'}</button>`;el.hidden=false;
  document.getElementById('rTipsGo').onclick=()=>{el.hidden=true;if(R){R.hold=false;R.lastT=performance.now();}};}
function driveTipsAtStart(){if(!R||R.mode!=='drive')return;let n=0;try{n=+localStorage.getItem('avt-tips3d')||0;}catch(_){}
  if(n<2){try{localStorage.setItem('avt-tips3d',n+1);}catch(_){}showDriveTips(false);}}
document.getElementById('rHelp').addEventListener('click',()=>{if(!R)return;const el=document.getElementById('rTips');if(!el.hidden){el.hidden=true;R.hold=false;R.lastT=performance.now();return;}showDriveTips(R.t>0);});
document.getElementById('rQuit').addEventListener('click',()=>{if(!R)return;if(R.mode==='drive')finishRace(true);else raceFastForward();});
document.getElementById('rReset').addEventListener('click',()=>{if(R&&R.me){const m=R.me;if(m.offIdx>=0)respawnAt(m,m.offIdx,m.offLap);else respawn(m);rMsg('НА ТРАССЕ',1);}});
// Кнопка сервиса: машина остановится, механик сменит шины, дольёт бензин и подтянет поломки
document.getElementById('rSvc').addEventListener('click',()=>{const m=R&&R.me;if(!m||R.mode!=='drive'||m.dnf||m.fin!==null||m.svc||m.pitT>0)return;m.svc=1;rMsg('ОСТАНАВЛИВАЕМСЯ',1);});
document.getElementById('rMus').addEventListener('click',()=>{auInit();AU.on.race=!AU.on.race;if(AU.on.race&&!AU.on.music)AU.on.music=true;auApply();musicPlay(true);rMusUI();toast(AU.on.race?'♪ Музыка в гонке: '+(musCur()?musCur().title:''):'Музыка в гонке выключена');});
function rMusUI(){const b=document.getElementById('rMus');if(b){b.textContent=AU.on.race?'♪ вкл':'♪ выкл';b.classList.toggle('off',!AU.on.race);}}
document.getElementById('rCam').addEventListener('click',()=>{if(!R)return;if(R.mode==='drive'){if(R.gl){R3.view=((R3.view||0)+1)%4;rMsg(['ВИД СЗАДИ','ВИД СВЕРХУ','ИЗ КАБИНЫ','КИНОХРОНИКА'][R3.view],1);raceOldFilm(R3.view===3);return;}const far=RV.BACK>3;RV.BACK=far?2.4:3.4;RV.CAMH=far?1.45:1.9;return;}if(R.gl)R3.cam=null;const t=R.team.filter(c=>!c.dnf);const i=t.indexOf(R.follow);R.follow=t[(i+1)%t.length]||R.follow;renderMgr();});
// Способ руления: колесо (вести пальцем), кнопки (половинки руля), наклон телефона — по кругу
const STEER_NAMES={wheel:'Колесо',keys:'Кнопки',tilt:'Наклон'};
function steerMode(){const m=AU.on.steer||(AU.on.tilt?'tilt':'keys');return m==='wheel'?'keys':m;}
function steerApply(m){AU.on.steer=m;AU.on.tilt=m==='tilt';try{localStorage.setItem('avt-audio',JSON.stringify(AU.on));}catch(_){}RW.mode=m;RW.drag=null;rKeys.left=rKeys.right=false;
  if(R){R.tilt=m==='tilt';}const b=document.getElementById('rTilt');if(b)b.textContent=STEER_NAMES[m];}
document.getElementById('rTilt').addEventListener('click',async()=>{if(!R)return;const order=['keys','tilt'],m=order[(order.indexOf(steerMode())+1)%3];
  if(m==='tilt'&&window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){try{const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted'){toast('Нет доступа к датчику наклона');steerApply('wheel');return;}}catch(_){}}
  steerApply(m);rMsg({wheel:'РУЛЬ: ВЕДИТЕ ПАЛЬЦЕМ',keys:'РУЛЬ: КНОПКИ ◀ ▶',tilt:'РУЛЬ: НАКЛОН'}[m],1.4);});
document.getElementById('rMgr').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!R)return;const F=R.follow;
  if(b.dataset.spd){R.speed=+b.dataset.spd;}else if(b.dataset.ord==='pit'){F.pitCall=!F.pitCall;rMsgT(F.pitCall?'Команда: в боксы на этом круге':'Команда: остаёмся на трассе',1.4);}else if(b.dataset.ord==='fin'){raceFastForward();return;}else if(b.dataset.ord){F.order=b.dataset.ord;rMsgT({push:'Команда: атаковать!',norm:'Команда: держать темп',save:'Команда: беречь машину'}[F.order],1.4);}
  renderMgr();});
window.addEventListener('deviceorientation',e=>{if(!R)return;const land=Math.abs(window.orientation||0)===90;R.tiltVal=land?(e.beta||0)*(window.orientation>0?1:-1):(e.gamma||0);});
const rCtrl=document.getElementById('rCtrl');
rCtrl.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;
  const on=e=>{e.preventDefault();rKeys[k]=true;b.classList.add('down');if(b.setPointerCapture&&e.pointerId!==undefined)try{b.setPointerCapture(e.pointerId);}catch(_){}};
  const off=()=>{rKeys[k]=false;b.classList.remove('down');};
  b.addEventListener('pointerdown',on);['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,off));b.addEventListener('contextmenu',e=>e.preventDefault());});
// Руль на экране: палец ведёт колесо (угол следует за пальцем, отпустил — руль сам медленно выпрямляется);
// в режиме «кнопки» левая и правая половины крутят руль, пока их держат
const rWheel=document.getElementById('rWheel');RW.keys={};
rWheel.addEventListener('pointerdown',e=>{e.preventDefault();if(!R||!R.me)return;try{rWheel.setPointerCapture(e.pointerId);}catch(_){}
  const rc=rWheel.getBoundingClientRect();
  if(RW.mode==='keys'){const k=e.clientX<rc.left+rc.width/2?'left':'right';RW.keys[e.pointerId]=k;rKeys[k]=true;}
  else if(RW.mode==='wheel'){RW.drag={id:e.pointerId,x0:e.clientX,s0:R.me.steer,w:rc.width};RW.target=R.me.steer;RW.used=1;}});
rWheel.addEventListener('pointermove',e=>{const d=RW.drag;if(d&&d.id===e.pointerId)RW.target=clamp(d.s0+(e.clientX-d.x0)/(d.w*0.4),-1,1);});
['pointerup','pointercancel','lostpointercapture'].forEach(t=>rWheel.addEventListener(t,e=>{if(RW.drag&&RW.drag.id===e.pointerId)RW.drag=null;const k=RW.keys[e.pointerId];if(k){delete RW.keys[e.pointerId];if(!Object.values(RW.keys).includes(k))rKeys[k]=false;}}));
rWheel.addEventListener('contextmenu',e=>e.preventDefault());
// Рисуем руль эпохи: деревянный обод и латунные спицы в ранние годы, чёрный обод с тремя спицами — позже
function drawWheelUI(){
  const cv=document.getElementById('rWheelC');if(!cv||!R||R.mode!=='drive')return;const W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;
  const dpr=Math.min(2,window.devicePixelRatio||1);if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  const F0=R.me||R.follow,sig=(F0?Math.round(F0.steer*200):0)+'|'+RW.mode+'|'+rKeys.left+rKeys.right+'|'+W+'x'+H+'|'+(RW.used?1:0)+'|'+R.rc.y;if(cv.dataset.sig===sig)return;cv.dataset.sig=sig;
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  const F=F0,st=F?F.steer:0,y=R.rc.y,r=Math.min(H*0.46,W*0.29),wood=y<1920,brass=y<1916?'#c9a24a':'#b9bec5';
  // стрелки по краям: в режиме кнопок — это кнопки, в режиме колеса — подсказка
  const kmode=RW.mode==='keys';g.font=`800 ${Math.round(H*0.3)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  [['left',-1,'◀'],['right',1,'▶']].forEach(([k,sd,ch])=>{g.fillStyle=rKeys[k]&&kmode?'rgba(233,196,106,.95)':kmode?'rgba(233,236,240,.55)':'rgba(233,236,240,.16)';g.fillText(ch,W/2+sd*(r+(W/2-r)/2),H/2);});
  g.save();g.translate(W/2,H/2);g.rotate(st*2.3);
  g.lineWidth=r*0.2;g.strokeStyle=wood?'#7a4e2a':'#1a1a1d';g.beginPath();g.arc(0,0,r*0.86,0,7);g.stroke();
  g.lineWidth=r*0.07;g.strokeStyle=wood?'rgba(255,214,160,.4)':'rgba(255,255,255,.22)';g.beginPath();g.arc(0,0,r*0.9,-2.7,-0.5);g.stroke();
  if(wood){g.lineWidth=r*0.015;g.strokeStyle='rgba(40,20,8,.5)';for(let i=0;i<12;i++){const a=i/12*6.283;g.beginPath();g.moveTo(Math.cos(a)*r*0.77,Math.sin(a)*r*0.77);g.lineTo(Math.cos(a)*r*0.95,Math.sin(a)*r*0.95);g.stroke();}}
  const spokes=y<1915?[0.785,2.356,3.927,5.498]:[0,Math.PI/2,Math.PI];g.lineCap='round';
  spokes.forEach(a=>{g.lineWidth=r*0.11;g.strokeStyle=shade(brass,-0.35);g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*r*0.8,Math.sin(a)*r*0.8);g.stroke();g.lineWidth=r*0.06;g.strokeStyle=brass;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*r*0.8,Math.sin(a)*r*0.8);g.stroke();});
  g.fillStyle=shade(brass,-0.25);g.beginPath();g.arc(0,0,r*0.2,0,7);g.fill();g.fillStyle=brass;g.beginPath();g.arc(-r*0.04,-r*0.04,r*0.13,0,7);g.fill();
  // метка «верх» — видно, насколько повёрнут руль
  g.fillStyle='#e9c46a';g.beginPath();g.arc(0,-r*0.86,r*0.09,0,7);g.fill();
  g.restore();
  if(RW.mode==='tilt'){g.font=`600 ${Math.round(H*0.14)}px system-ui,sans-serif`;g.fillStyle='rgba(233,236,240,.6)';g.fillText('наклон',W/2,H-H*0.1);}
}
const KMAP={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'gas',ArrowDown:'brake',Space:'gas'};
document.addEventListener('keydown',e=>{if(R&&KMAP[e.code]){e.preventDefault();rKeys[KMAP[e.code]]=true;}});
document.addEventListener('keyup',e=>{if(R&&KMAP[e.code]){rKeys[KMAP[e.code]]=false;}});

// 0.19: «Кинохроника» — гонка как старая плёнка: сепия, зерно, царапины, мерцание и виньетка (вид сзади)
function raceOldFilm(on){const rs=document.getElementById('raceScreen'),v=document.getElementById('rView');rs.classList.toggle('oldfilm',!!on);let el=document.getElementById('rOld');
  if(on){if(!el){el=document.createElement('div');el.id='rOld';el.className='r-old';el.innerHTML='<canvas width="160" height="100"></canvas><i></i><i class="b"></i><b></b>';v.appendChild(el);}
    const cv=el.querySelector('canvas'),g=cv.getContext('2d'),id=g.createImageData(160,100),sc=el.querySelectorAll('i'),fl=el.querySelector('b');let last=0;
    const loop=now=>{if(!R||!rs.classList.contains('oldfilm')){return;}if(now-last>70){last=now;const d=id.data;for(let i=0;i<d.length;i+=4){const q=Math.random()*255;d[i]=d[i+1]=d[i+2]=q;d[i+3]=Math.random()<0.45?46:0;}g.putImageData(id,0,0);
        sc.forEach(x=>{if(Math.random()<0.3){x.style.left=(Math.random()*100)+'%';x.style.opacity=(0.12+Math.random()*0.3).toFixed(2);}else if(Math.random()<0.3)x.style.opacity='0';});fl.style.opacity=(Math.random()*0.1).toFixed(3);}
      requestAnimationFrame(loop);};requestAnimationFrame(loop);}
  else if(el)el.remove();}
