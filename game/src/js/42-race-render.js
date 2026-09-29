/* ================= RACE RENDER: pseudo-3D road over real physics, sprites, HUD ================= */
const RV={CAMH:2.7,BACK:5.6,CAMD:1.15,DRAW:190,HOR:0.36};
const angWrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
function setupRender(){
  const T=R.trk,F=R.follow;R.cam={lat:F?F.lat:0,psi:0,y:F?F.y:0,sky:0,phaseT:0,phase:0};
  const mc=document.getElementById('rMap');const g=mc.getContext('2d');const W=mc.width=180,H=mc.height=180;let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;T.pts.forEach(p=>{mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0]);mnz=Math.min(mnz,p[2]);mxz=Math.max(mxz,p[2]);});
  const scl=Math.min((W-20)/(mxx-mnx||1),(H-20)/(mxz-mnz||1));R.map={g,W,H,f:(x,z)=>[10+(x-mnx)*scl+((W-20)-(mxx-mnx)*scl)/2,H-10-(z-mnz)*scl-((H-20)-(mxz-mnz)*scl)/2]};
  const off=document.createElement('canvas');off.width=W;off.height=H;const og=off.getContext('2d');og.strokeStyle='rgba(255,255,255,.85)';og.lineWidth=3;og.beginPath();T.pts.forEach((p,i)=>{const [x,y]=R.map.f(p[0],p[2]);i?og.lineTo(x,y):og.moveTo(x,y);});if(T.closed)og.closePath();og.stroke();R.map.bg=off;
  const set=SCEN_SETS[T.cfg.host];R.bg=mkBackdrop(set,T.cfg);
  car3dQueue(R.cars.map(c=>c.spec3),F&&F.spec3);scenQueue(T);
}
function renderRace(dt){
  const cv=document.getElementById('rcv');if(!cv||!R)return;
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
  R.cars.forEach(o=>{let s=(o.idx+o.segT)*step-camS;if(T.closed){s=((s%lapLen)+lapLen)%lapLen;if(s>lapLen-20)s-=lapLen;}const kk=Math.floor(s/step+frac);if(kk<0||kk>=segs.length-1)return;(bySeg[kk]=bySeg[kk]||[]).push({o,s});});
  // декорации и машины: от дальних к ближним
  const phase=cam.phase;
  for(let k=segs.length-2;k>=0;k--){
    const a=segs[k];if(!a.scale)continue;const clip=a.clip,items=T.spr[a.j];
    if(items&&items.length&&a.z>1.2){c.save();c.beginPath();c.rect(0,0,W,clip);c.clip();
      for(const it of items){const sp=it.k==='p'?peopleSprite(it.t,it.v,phase&&it.v%2?1:0):scenSprite(it.t,it.v,it.off);if(!sp)continue;
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
  // мини-карта
  const m=R.map;if(m){m.g.clearRect(0,0,m.W,m.H);m.g.drawImage(m.bg,0,0);R.cars.forEach(o=>{const [x,y]=m.f(o.x,o.z);m.g.fillStyle=o===F?'#ffd66b':o.you?'#f0c75e':o.dnf?'#555':'#fff';m.g.beginPath();m.g.arc(x,y,o===F?5:3.2,0,7);m.g.fill();});}
  updateRaceHUD();drawWheelUI();
}
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
  const tm=Math.max(0,R.time);document.getElementById('hTime').textContent=Math.floor(tm/60)+':'+String(Math.floor(tm%60)).padStart(2,'0');
  document.getElementById('hSpd').textContent=Math.round(Math.max(0,F.vx)*3.6)+(F.draft?'⇶':'');document.getElementById('hGear').textContent=F.vx<-0.2?'R':F.gear;
  const hb=document.getElementById('bHeat');hb.style.width=Math.min(100,Math.max(F.heat,F.eng||0))+'%';hb.style.background=F.heat>80?'var(--bad)':F.heat>55?'var(--warn)':'var(--good)';
  const tb=document.getElementById('bTyre'),tl=F.punct?0:100-Math.min(100,F.tyre);tb.style.width=tl+'%';tb.style.background=tl<25?'var(--bad)':tl<50?'var(--warn)':'var(--good)';
  const db=document.getElementById('bDmg'),dl=100-F.dmg;db.style.width=dl+'%';db.style.background=dl<40?'var(--bad)':dl<70?'var(--warn)':'var(--good)';
  document.getElementById('bFuel').style.width=F.fuel+'%';
  document.getElementById('rReset').hidden=!(R.me&&R.me.stuck>2.5);
  const lead=order[0],board=order.slice(0,5).map((o,i)=>{const gap=i===0?'':o.dnf?'сход':o.fin!==null&&lead.fin!==null?'+'+(o.fin-lead.fin).toFixed(1):'+'+Math.max(0,Math.round((lead.prog-o.prog)/Math.max(8,o.vx||8)))+' с';return `<div class="${o.you?'you':''}${o===F?' me':''}"><span>${i+1}</span>${esc((o.drvName||o.name).split(' ').slice(-1)[0])}<small>${esc(o.you?o.label:o.name)}</small><em>${gap}</em></div>`;}).join('');
  const bd=document.getElementById('rBoard');if(bd.dataset.t!==String(Math.floor(R.time*2))){bd.dataset.t=String(Math.floor(R.time*2));bd.innerHTML=board;}
  const m=document.getElementById('rMsg');
  m.textContent=R.t<0?Math.ceil(-R.t):R.t<0.8?'СТАРТ!':R.msgT>0?R.msg:F.dnf?'СХОД: '+F.dnf:F.stopT>0?'РЕМОНТ: '+F.stopWhy:(F.punct&&F.vx<1.5)?'МЕНЯЕМ КОЛЕСО…':F.pitT>0?'МЕХАНИКИ РАБОТАЮТ…':'';
  m.classList.toggle('small',m.textContent.length>14);
}
document.getElementById('rQuit').addEventListener('click',()=>{if(!R)return;if(R.mode==='drive')finishRace(true);else raceFastForward();});
document.getElementById('rReset').addEventListener('click',()=>{if(R&&R.me){respawn(R.me);R.time+=3;rMsg('+3 с',1);}});
document.getElementById('rMus').addEventListener('click',()=>{auInit();if(!AU.on.race){AU.on.race=true;}musNext(1);toast('♪ '+(musCur()?musCur().title:''));});
document.getElementById('rCam').addEventListener('click',()=>{if(!R)return;if(R.mode==='drive'){const far=RV.BACK>3;RV.BACK=far?2.4:3.4;RV.CAMH=far?1.45:1.9;return;}const t=R.team.filter(c=>!c.dnf);const i=t.indexOf(R.follow);R.follow=t[(i+1)%t.length]||R.follow;renderMgr();});
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
