/* ================= RACE RENDER: pseudo-3D road over real physics, sprites, HUD ================= */
const RV={CAMH:1.9,BACK:3.4,CAMD:1.15,DRAW:190,HOR:0.4};
const angWrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
function setupRender(){
  const T=R.trk,F=R.follow;R.cam={lat:F?F.lat:0,psi:0,y:F?F.y:0,sky:0,phaseT:0,phase:0};
  const mc=document.getElementById('rMap');const g=mc.getContext('2d');const W=mc.width=180,H=mc.height=180;let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;T.pts.forEach(p=>{mnx=Math.min(mnx,p[0]);mxx=Math.max(mxx,p[0]);mnz=Math.min(mnz,p[2]);mxz=Math.max(mxz,p[2]);});
  const scl=Math.min((W-20)/(mxx-mnx||1),(H-20)/(mxz-mnz||1));R.map={g,W,H,f:(x,z)=>[10+(x-mnx)*scl+((W-20)-(mxx-mnx)*scl)/2,H-10-(z-mnz)*scl-((H-20)-(mxz-mnz)*scl)/2]};
  const off=document.createElement('canvas');off.width=W;off.height=H;const og=off.getContext('2d');og.strokeStyle='rgba(255,255,255,.85)';og.lineWidth=3;og.beginPath();T.pts.forEach((p,i)=>{const [x,y]=R.map.f(p[0],p[2]);i?og.lineTo(x,y):og.moveTo(x,y);});if(T.closed)og.closePath();og.stroke();R.map.bg=off;
  const set=SCEN_SETS[T.cfg.host];R.bg=mkBackdrop(set,T.cfg);
}
// Дальний план: горы, холмы, лес — два слоя для параллакса
function mkBackdrop(set,cfg){
  const W=1600,H=240,mk=()=>{const c=mkCanvas(W,H);return [c,c.getContext('2d')];};const rnd=mulberry32(hashStr(cfg.host+cfg.terr));
  const [far,f]=mk();const mount=set.mount||cfg.uphill||cfg.terr==='mount';
  f.fillStyle=mount?'#8795a8':'#9aaab8';f.beginPath();f.moveTo(0,H);for(let x=0;x<=W;x+=8){const y=H-(mount?120:50)-Math.abs(Math.sin(x/170+1.3))*(mount?90:30)-Math.sin(x/61)*(mount?22:8)-rnd()*4;f.lineTo(x,y);}f.lineTo(W,H);f.fill();
  if(mount&&(set.snow||cfg.terr==='snow')){f.fillStyle='rgba(255,255,255,.85)';for(let x=0;x<=W;x+=8){const y=H-120-Math.abs(Math.sin(x/170+1.3))*90-Math.sin(x/61)*22;if(y<H-175)f.fillRect(x,y,8,6);}}
  const [near,n]=mk();n.fillStyle=set.hills||'#6f8f55';n.beginPath();n.moveTo(0,H);for(let x=0;x<=W;x+=6){const y=H-38-Math.abs(Math.sin(x/120))*(set.flat?10:30)-Math.sin(x/37)*6;n.lineTo(x,y);}n.lineTo(W,H);n.fill();
  // полоса леса или рощ на горизонте
  for(let x=0;x<W;x+=9){const h=8+rnd()*14;n.fillStyle=shade(set.hills||'#6f8f55',-0.25-rnd()*0.15);n.beginPath();n.ellipse(x,H-30-Math.abs(Math.sin(x/120))*(set.flat?10:30)+4,6,h*0.6,0,0,7);n.fill();}
  return {far,near};
}
function renderRace(dt){
  const cv=document.getElementById('rcv');if(!cv||!R)return;
  const dpr=Math.min(2,window.devicePixelRatio||1),W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=true;
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
  c.fillStyle=vgrad(c,0,horY,[[0,sk[0]],[1,sk[1]]]);c.fillRect(0,0,W,horY+2);
  if(night){c.fillStyle='#fff';for(let i=0;i<60;i++)c.fillRect(((i*97+cam.sky*0.2)%W+W)%W,(i*53)%(horY*0.8),1.3,1.3);ell(c,W*0.8,horY*0.25,11,11,'#f3efd8');}
  else{const sx=((W*0.72-cam.sky*0.3)%W+W)%W;const sg=c.createRadialGradient(sx,horY*0.25,4,sx,horY*0.25,70);sg.addColorStop(0,'rgba(255,248,220,.95)');sg.addColorStop(1,'rgba(255,248,220,0)');c.fillStyle=sg;c.fillRect(sx-70,horY*0.25-70,140,140);
    c.fillStyle='rgba(255,255,255,.72)';for(let i=0;i<6;i++){const cx=((i*173+cam.sky*0.6+R.time*3)%(W+200)+W+200)%(W+200)-100,cy=horY*(0.12+((i*37)%24)/100);c.beginPath();c.ellipse(cx,cy,34,9,0,0,7);c.ellipse(cx+18,cy-6,22,9,0,0,7);c.ellipse(cx-20,cy-3,18,7,0,0,7);c.fill();}}
  const bgH=Math.min(H*0.35,240*(W/400)),bw=R.bg.far.width*bgH/240;
  [[R.bg.far,0.25],[R.bg.near,0.6]].forEach(([img,par])=>{const off=(((-cam.sky*par)%bw)+bw)%bw;c.globalAlpha=night?0.35:1;for(let x=off-bw;x<W;x+=bw)c.drawImage(img,x,horY-bgH+4,bw,bgH);c.globalAlpha=1;});
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
  const quad=(x1,y1,w1,x2,y2,w2,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x1-w1,y1);c.lineTo(x1+w1,y1);c.lineTo(x2+w2,y2);c.lineTo(x2-w2,y2);c.closePath();c.fill();};
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
      for(const it of items){const sp=it.k==='p'?peopleSprite(it.t,it.v,phase&&it.v%2?1:0):scenSprite(it.t,it.v);if(!sp)continue;
        const x=half-(a.Lc+it.off-cam.lat+cam.psi*a.z)*a.scale,w=sp.wM*a.scale,h=sp.hM*a.scale;if(x+w<0||x-w>W||h<1)continue;
        c.drawImage((night?nightOf(sp):sp).img,x-w*sp.ax,a.sy-h,w,h);}
      c.restore();}
    const cs=bySeg[k];if(cs)cs.sort((p,q)=>q.s-p.s).forEach(({o,s})=>drawRaceCar(c,o,s,segs,k,half,cam,phase,W,H,night,clip,camS));
  }
  // частицы: пыль, дым, пар
  drawParticles(c,dt,W,H);
  // ночь: мягкое пятно света фар впереди машины, вокруг темнота
  if(night){const cy=horY+(H-horY)*0.42,g=c.createRadialGradient(W/2,cy,W*0.08,W/2,cy,W*0.95);g.addColorStop(0,'rgba(255,236,190,0.08)');g.addColorStop(0.35,'rgba(2,4,10,0.25)');g.addColorStop(1,'rgba(2,4,10,0.72)');c.fillStyle=g;c.fillRect(0,0,W,H);}
  const sp=Math.max(0,F.vx)/Math.max(1,F.vtop);if(sp>0.8&&!night){c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=1.5;for(let i=0;i<8;i++){const a=(i*0.7+R.time*3)%1,side=i%2?1:-1,sx=W/2+side*W*(0.3+a*0.25);c.beginPath();c.moveTo(sx,H*0.55+a*H*0.4);c.lineTo(sx+side*W*0.06,H*0.6+a*H*0.45);c.stroke();}}
  if(F.pitT>0||F.stopT>0){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,0,W,H);}
  // мини-карта
  const m=R.map;if(m){m.g.clearRect(0,0,m.W,m.H);m.g.drawImage(m.bg,0,0);R.cars.forEach(o=>{const [x,y]=m.f(o.x,o.z);m.g.fillStyle=o===F?'#ffd66b':o.you?'#f0c75e':o.dnf?'#555':'#fff';m.g.beginPath();m.g.arc(x,y,o===F?5:3.2,0,7);m.g.fill();});}
  updateRaceHUD();
}
// Ночная копия спрайта: затемнение только по нарисованным пикселям (без тёмных прямоугольников)
function nightOf(sp){if(sp.night)return sp.night;const cv=mkCanvas(sp.img.width,sp.img.height),g=cv.getContext('2d');g.drawImage(sp.img,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(6,9,20,.62)';g.fillRect(0,0,cv.width,cv.height);sp.night={img:cv,wM:sp.wM,hM:sp.hM,ax:sp.ax,ay:sp.ay};return sp.night;}
function drawRaceCar(c,o,s,segs,k,half,cam,phase,W,H,night,clip,camS){
  const a=segs[k],b=segs[k+1];if(!b||!b.scale)return;const f=clamp((s/((b.z-a.z)||1))-(a.z/((b.z-a.z)||1))+0,0,1);
  const z=Math.max(0.5,a.z+(b.z-a.z)*f),scale=half*RV.CAMD/z,Lc=a.Lc+(b.Lc-a.Lc)*f;
  const T=R.trk,gy=(o.y||0),sy=H*RV.HOR-(gy-(cam.y+RV.CAMH))*scale,Lr=Lc+o.lat-cam.lat+cam.psi*z,sx=half-Lr*scale;
  const th=a.th+(b.th-a.th)*f,roadYaw=Math.atan2(T.T[o.idx][0],T.T[o.idx][1]);
  const hRel=angWrap(o.yaw-roadYaw)+th-cam.psi,view=Math.atan2(Lr,z);
  const frame=clamp(Math.round((-hRel+view*0.8)/0.2),-2,2);
  const spec={key:o.spriteKey,style:o.style,color:o.color,y:R.rc.y,wheel:o.wheel,mech:o.mech,num:o.num};
  const sp=carSprite(spec,frame,o===R.follow||z<25?phase:0),w=sp.wM*scale,h=sp.hM*scale;
  if(sx+w<0||sx-w>W||w<2)return;
  const bounce=(o.vx>3?Math.sin(R.time*25+o.num)*0.012*Math.min(1,o.vx/20)*(TERR[T.terrAt(o.idx)]||TERR.dirt).rough:0)*scale;
  c.save();if(o!==R.follow){c.beginPath();c.rect(0,0,W,clip);c.clip();}
  c.drawImage((night&&o!==R.follow?nightOf(sp):sp).img,sx-w*sp.ax,sy-h*sp.ay+bounce,w,h);
  if((o.brk>0.3&&o.vx>1)||(night&&R.rc.y>=1912)){c.fillStyle=o.brk>0.3?'rgba(255,60,40,.6)':'rgba(255,90,60,.35)';[-0.38,0.38].forEach(dx=>{c.beginPath();c.arc(sx+dx*scale,sy-0.5*scale+bounce,0.09*scale,0,7);c.fill();});}
  if(o.dnf||o.stopT>0||o.overheat>0){c.fillStyle='rgba(120,120,120,.45)';for(let i=0;i<3;i++){c.beginPath();c.arc(sx+(i-1)*0.3*scale,sy-(1.4+i*0.35)*scale,(0.28+i*0.1)*scale,0,7);c.fill();}}
  c.restore();
  // пыль и дым
  const tr=TERR[T.terrAt(o.idx)]||TERR.dirt;
  if(tr.dust&&o.vx>6&&Math.random()<0.5*tr.dust)R.parts.push({x:sx+(Math.random()-0.5)*1.2*scale,y:sy-0.2*scale,vx:(Math.random()-0.5)*20,vy:-10-Math.random()*20,r:0.28*scale,gr:0.55*scale,life:0.8,max:0.8,col:'214,196,150',a:0.18});
  if((o.slipR>0.18||o.spinw>0.4)&&o.vx>4&&Math.random()<0.6)R.parts.push({x:sx+(Math.random()<0.5?-1:1)*0.6*scale,y:sy-0.15*scale,vx:(Math.random()-0.5)*30,vy:-12,r:0.16*scale,gr:0.4*scale,life:0.6,max:0.6,col:'235,235,235',a:0.3});
  if(o.thr>0.7&&Math.random()<0.18)R.parts.push({x:sx+0.35*scale,y:sy-0.35*scale,vx:8,vy:-8,r:0.12*scale,gr:0.3*scale,life:0.45,max:0.45,col:'110,110,110',a:0.35});
}
function drawParticles(c,dt,W,H){R.parts=R.parts.filter(p=>(p.life-=dt||0.016)>0);if(R.parts.length>220)R.parts.splice(0,R.parts.length-220);
  R.parts.forEach(p=>{p.x+=p.vx*(dt||0.016);p.y+=p.vy*(dt||0.016);const k=1-p.life/p.max,r=p.r+p.gr*k;c.fillStyle=`rgba(${p.col},${(p.a||0.4)*(1-k)})`;c.beginPath();c.arc(p.x,p.y,r,0,7);c.fill();});}
/* ---------- табло, управление, приказы ---------- */
function setupRaceUI(){
  const drive=R.mode==='drive',ctl=document.getElementById('rCtrl'),mg=document.getElementById('rMgr');
  ctl.hidden=!drive;mg.hidden=drive;document.getElementById('rTilt').hidden=!drive;document.getElementById('rCam').textContent=drive?'Вид':'Машина';
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
document.getElementById('rTilt').addEventListener('click',async e=>{if(!R)return;
  if(!R.tilt&&window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){try{const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted'){toast('Нет доступа к датчику наклона');return;}}catch(_){}}
  R.tilt=!R.tilt;AU.on.tilt=R.tilt;e.target.classList.toggle('on',R.tilt);rMsg(R.tilt?'РУЛЬ: НАКЛОН':'РУЛЬ: КНОПКИ',1);});
document.getElementById('rMgr').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!R)return;const F=R.follow;
  if(b.dataset.spd){R.speed=+b.dataset.spd;}else if(b.dataset.ord==='pit'){F.pitCall=!F.pitCall;rMsgT(F.pitCall?'Команда: в боксы на этом круге':'Команда: остаёмся на трассе',1.4);}else if(b.dataset.ord==='fin'){raceFastForward();return;}else if(b.dataset.ord){F.order=b.dataset.ord;rMsgT({push:'Команда: атаковать!',norm:'Команда: держать темп',save:'Команда: беречь машину'}[F.order],1.4);}
  renderMgr();});
window.addEventListener('deviceorientation',e=>{if(!R)return;const land=Math.abs(window.orientation||0)===90;R.tiltVal=land?(e.beta||0)*(window.orientation>0?1:-1):(e.gamma||0);});
const rCtrl=document.getElementById('rCtrl');
rCtrl.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;
  const on=e=>{e.preventDefault();rKeys[k]=true;b.classList.add('down');if(b.setPointerCapture&&e.pointerId!==undefined)try{b.setPointerCapture(e.pointerId);}catch(_){}};
  const off=()=>{rKeys[k]=false;b.classList.remove('down');};
  b.addEventListener('pointerdown',on);['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,off));b.addEventListener('contextmenu',e=>e.preventDefault());});
const KMAP={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'gas',ArrowDown:'brake',Space:'gas'};
document.addEventListener('keydown',e=>{if(R&&KMAP[e.code]){e.preventDefault();rKeys[KMAP[e.code]]=true;}});
document.addEventListener('keyup',e=>{if(R&&KMAP[e.code]){rKeys[KMAP[e.code]]=false;}});
