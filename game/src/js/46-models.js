/* ================= 3D-МОДЕЛИ МАШИН: модели эпохи и их отрисовка в спрайты под любым углом ================= */
// Модель — набор граней (выпуклых многоугольников) в метрах: x — вправо, y — вверх, z — вперёд.
// Спрайт рисуется программно: поворот к камере, наклон камеры, свет и блики, тёмный контур, мягкая тень.
const MATS={paint:{a:0.38,d:0.68,s:0.36,p:14},metal:{a:0.44,d:0.5,s:0.8,p:24},matte:{a:0.5,d:0.46,s:0.03,p:4},glass:{a:0.32,d:0.25,s:0.9,p:30,al:0.8},
  skin:{a:0.55,d:0.52,s:0.05,p:6},wall:{a:0.64,d:0.44,s:0.03,p:4},roof:{a:0.52,d:0.56,s:0.1,p:8},wood:{a:0.5,d:0.56,s:0.1,p:8},cloth:{a:0.5,d:0.54,s:0.02,p:4},leather:{a:0.44,d:0.56,s:0.14,p:10}};
Object.keys(MATS).forEach(k=>MATS[k].k=k);
// Метки граней для 3D: w — номер колеса (вращается и поворачивает), l — лампа (1 — задний фонарь, 2 — фара, 3 — водитель, 5 — фонарь улицы)
const MTAG={w:0,l:0};
const H2R={};function hex2rgb(h){if(H2R[h])return H2R[h];let v;if(h[0]==='#'){const n=parseInt(h.slice(1),16);v=[n>>16,n>>8&255,n&255];}else v=(h.match(/\d+/g)||[0,0,0]).slice(0,3).map(Number);return H2R[h]=v;}
class Mesh{constructor(){this.F=[];this.lamps=[];}}
let MLOD=1; // 1 — подробная модель (ближний план), 0 — упрощённая (дальний)
// Нормаль по методу Ньюэлла — устойчива к вырожденным вершинам
function newell(p){let x=0,y=0,z=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];x+=(a[1]-b[1])*(a[2]+b[2]);y+=(a[2]-b[2])*(a[0]+b[0]);z+=(a[0]-b[0])*(a[1]+b[1]);}const l=Math.hypot(x,y,z)||1;return [x/l,y/l,z/l];}
function mCenter(p){const c=[0,0,0];p.forEach(q=>{c[0]+=q[0];c[1]+=q[1];c[2]+=q[2];});return c.map(v=>v/p.length);}
// Грань: нормаль разворачивается «от центра детали» ctr; two — видна с обеих сторон; deco — линии поверх грани
function mFace(M,pts,col,mat,ctr,two,deco){
  let n=newell(pts);if(ctr){const m=mCenter(pts);if(n[0]*(m[0]-ctr[0])+n[1]*(m[1]-ctr[1])+n[2]*(m[2]-ctr[2])<0)n=n.map(v=>-v);}
  const f={p:pts,n,col:hex2rgb(col),mat:MATS[mat||'paint'],two:!!two,deco:deco||null,w:MTAG.w,l:MTAG.l};M.F.push(f);return f;}
function mBox(M,x0,y0,z0,x1,y1,z1,col,mat,skip){const c=[(x0+x1)/2,(y0+y1)/2,(z0+z1)/2];
  const F={b:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],f:[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],l:[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],
    r:[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]],t:[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],d:[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]};
  const out={};for(const k in F)if(!(skip&&skip.includes(k)))out[k]=mFace(M,F[k],col,mat,c);return out;}
// Кузов «по шпангоутам»: сечения вдоль z с одинаковым числом точек [[x,y],…]
function mLoft(M,secs,col,mat,caps){const out=[];
  for(let i=0;i<secs.length-1;i++){const A=secs[i],B=secs[i+1],n=A.p.length,ctr=[0,0,(A.z+B.z)/2];A.p.concat(B.p).forEach(q=>{ctr[0]+=q[0]/(2*n);ctr[1]+=q[1]/(2*n);});
    for(let k=0;k<n;k++){const k2=(k+1)%n,q=[[A.p[k][0],A.p[k][1],A.z],[A.p[k2][0],A.p[k2][1],A.z],[B.p[k2][0],B.p[k2][1],B.z],[B.p[k][0],B.p[k][1],B.z]];
      if(Math.hypot(q[0][0]-q[1][0],q[0][1]-q[1][1])+Math.hypot(q[2][0]-q[3][0],q[2][1]-q[3][1])<1e-4)continue;out.push(mFace(M,q,col,mat,ctr));}}
  if(caps!==false){const all=[];secs.forEach(S=>S.p.forEach(q=>all.push([q[0],q[1],S.z])));const C=mCenter(all);
    [secs[0],secs[secs.length-1]].forEach(S=>{if(S.p.some(q=>Math.abs(q[0])>1e-3))out.push(mFace(M,S.p.map(q=>[q[0],q[1],S.z]),col,mat,C));});}
  return out;}
// Скруглённое сечение: ширина ±w, низ yb, верх yt, скругление r верхних углов
function sec(z,w,yb,yt,r,tw){tw=tw===undefined?w:tw;r=Math.min(r||0,(yt-yb)*0.5,tw);const p=[[-w,yb],[w,yb],[tw,yt-r]];if(r>0){p.push([tw-r*0.3,yt-r*0.3],[tw-r,yt]);p.push([-(tw-r),yt],[-(tw-r*0.3),yt-r*0.3]);}else p.push([tw,yt],[-tw,yt]);p.push([-tw,yt-r]);
  // выравниваем число точек (8)
  while(p.length<8)p.splice(3,0,p[2].slice());return {z,p};}
// Цилиндр вдоль оси x (колесо, бак)
function mCylX(M,cx,cy,cz,r,x0,x1,seg,col,mat,capCol,deco){const pts=[];for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}
  const ctr=[(x0+x1)/2,cy,cz];for(let k=0;k<seg;k++){const k2=(k+1)%seg,a=pts[k],b=pts[k2];mFace(M,[[x0,cy+a[1],cz+a[0]],[x0,cy+b[1],cz+b[0]],[x1,cy+b[1],cz+b[0]],[x1,cy+a[1],cz+a[0]]],col,mat,ctr);}
  const c0=mFace(M,pts.map(a=>[x0,cy+a[1],cz+a[0]]),capCol||col,mat,ctr),c1=mFace(M,pts.map(a=>[x1,cy+a[1],cz+a[0]]),capCol||col,mat,ctr);return [c0,c1];}
// Цилиндр вдоль оси z (фары, выхлоп) и вдоль y (запаска лёжа, колонка)
function mCylZ(M,cx,cy,r,z0,z1,seg,col,mat,capCol){const ctr=[cx,cy,(z0+z1)/2],P=[];for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
  for(let k=0;k<seg;k++){const a=P[k],b=P[(k+1)%seg];mFace(M,[[a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1],[a[0],a[1],z1]],col,mat,ctr);}
  return [mFace(M,P.map(a=>[a[0],a[1],z0]),capCol||col,mat,ctr),mFace(M,P.map(a=>[a[0],a[1],z1]),capCol||col,mat,ctr)];}
function mSphere(M,cx,cy,cz,r,col,mat,sq){sq=sq||1;const S=MLOD?8:6,Rg=MLOD?6:4,ctr=[cx,cy,cz],P=(i,j)=>{const th=i/Rg*Math.PI,ph=j/S*Math.PI*2;return [cx+Math.sin(th)*Math.cos(ph)*r,cy+Math.cos(th)*r*sq,cz+Math.sin(th)*Math.sin(ph)*r];};
  for(let i=0;i<Rg;i++)for(let j=0;j<S;j++){const q=[P(i,j),P(i,j+1),P(i+1,j+1),P(i+1,j)];mFace(M,i===0?[q[0],q[2],q[3]]:i===Rg-1?[q[0],q[1],q[2]]:q,col,mat,ctr);}}
// Колесо: шина, обод, спицы (дерево — толстые, проволока — тонкие), колпак
function mWheel(M,cx,cy,cz,r,w,type,S,solid){
  const seg=MLOD?16:10,side=cx>=0?1:-1,xo=cx+side*w/2,xi=cx-side*w/2,rr=r*(solid?0.8:type==='wire'?0.83:0.8),tyre=solid?'#2a2a2c':'#1c1c1f';
  const ctr=[cx,cy,cz],ring=(rad,x)=>{const p=[];for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2;p.push([x,cy+Math.sin(a)*rad,cz+Math.cos(a)*rad]);}return p;};
  const oR=ring(r,xo),iR=ring(r,xi),oRim=ring(rr,xo+side*0.004),iRim=ring(rr,xi-side*0.004);
  for(let k=0;k<seg;k++){const k2=(k+1)%seg;mFace(M,[oR[k],oR[k2],iR[k2],iR[k]],tyre,'matte',ctr);
    mFace(M,[oR[k],oR[k2],oRim[k2],oRim[k]],'#26262a','matte',[cx-side,cy,cz],true);mFace(M,[iR[k],iR[k2],iRim[k2],iRim[k]],'#26262a','matte',[cx+side,cy,cz],true);}
  const rimCol=type==='wire'?'#34373c':type==='alloy'?'#a8aeb6':type==='disc'?S.dcol:S.wood,deco=[];
  const P=(a,rad)=>[xo+side*0.006,cy+Math.sin(a)*rad,cz+Math.cos(a)*rad];
  if(type==='wood'){const ns=MLOD?12:8;for(let k=0;k<ns;k++){const a=k/ns*Math.PI*2;deco.push({a:P(a,r*0.14),b:P(a,rr*0.97),w:r*0.075,c:shade(S.wood,-0.3)});}deco.push({ring:[xo+side*0.008,cy,cz,rr*0.97],w:r*0.05,c:shade(S.wood,0.15)});}
  else if(type==='wire'){const ns=MLOD?28:14;for(let k=0;k<ns;k++){const a=k/ns*Math.PI*2+(k%2?0.06:-0.06);deco.push({a:P(a,r*0.12),b:P(a+(k%2?0.25:-0.25),rr*0.98),w:0.006,c:'#d6dade'});}}
  else if(type==='alloy'){for(let k=0;k<8;k++){const a=k/8*Math.PI*2;deco.push({a:P(a,r*0.2),b:P(a,rr*0.9),w:r*0.12,c:'#7a8088'});}}
  deco.push({dot:P(0,0),r:r*(type==='wood'?0.2:0.16),c:type==='wire'||S.y>=1916?'#c8ccd2':'#c9a24a'});
  mFace(M,oRim,rimCol,type==='alloy'||type==='disc'?'metal':'wood',ctr,false,deco);mFace(M,iRim,rimCol,'wood',ctr);
}
// Крыло над колесом: изогнутый лист
function mFender(M,cx,cy,cz,r,w,col,a0,a1){const seg=8,x0=cx-w/2,x1=cx+w/2,R=r+0.06;
  for(let k=0;k<seg;k++){const A=a0+(a1-a0)*k/seg,B=a0+(a1-a0)*(k+1)/seg;mFace(M,[[x0,cy+Math.sin(A)*R,cz+Math.cos(A)*R],[x1,cy+Math.sin(A)*R,cz+Math.cos(A)*R],[x1,cy+Math.sin(B)*R,cz+Math.cos(B)*R],[x0,cy+Math.sin(B)*R,cz+Math.cos(B)*R]],col,'paint',[cx,cy,cz]);}}
// Запасная шина, закреплённая стоя (ось вдоль z) — видна сзади кругом
function mTyreZ(M,cx,cy,cz,r,w){const seg=MLOD?16:10,ri=r*0.72,z0=cz-w/2,z1=cz+w/2,ctr=[cx,cy,cz],ring=(rad,z)=>{const p=[];for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2;p.push([cx+Math.cos(a)*rad,cy+Math.sin(a)*rad,z]);}return p;};
  const o0=ring(r,z0),o1=ring(r,z1),i0=ring(ri,z0),i1=ring(ri,z1);
  for(let k=0;k<seg;k++){const k2=(k+1)%seg;mFace(M,[o0[k],o0[k2],o1[k2],o1[k]],'#1c1c1f','matte',ctr);mFace(M,[o0[k],o0[k2],i0[k2],i0[k]],'#232326','matte',[cx,cy,cz+1],true);mFace(M,[o1[k],o1[k2],i1[k2],i1[k]],'#232326','matte',[cx,cy,cz-1],true);}}
// Экипаж: пилот и механик — куртка, голова, кепка или шлем, очки, шарф
function mCrew(M,x,seatY,z,kit,mech,S,handZ){
  const coat=mech?shade(kit.coat,-0.12):kit.coat,y0=seatY+0.02,sh=seatY+0.58,lean=0.1;
  mLoft(M,[{z:z-0.12,p:sec(0,0.17,y0,sh,0.06,0.13).p.map(q=>[q[0]+x,q[1]])},{z:z+0.1,p:sec(0,0.18,y0,sh-0.02,0.08,0.15).p.map(q=>[q[0]+x,q[1]])}].map((s,i)=>({z:s.z-(i?0:lean*0.3),p:s.p})),coat,'cloth');
  mBox(M,x-0.06,sh-0.02,z-0.07,x+0.06,sh+0.06,z+0.05,'#c9a07c','skin');
  const hy=sh+0.18;mSphere(M,x,hy,z-0.01,0.105,'#d8b08c','skin',1.08);
  if(kit.cap==='helmet'){mSphere(M,x,hy+0.03,z-0.02,0.118,kit.hat,'leather',0.92);mBox(M,x-0.12,hy-0.1,z-0.05,x-0.1,hy+0.02,z+0.04,kit.hat,'leather');mBox(M,x+0.1,hy-0.1,z-0.05,x+0.12,hy+0.02,z+0.04,kit.hat,'leather');}
  else{mLoft(M,[{z:z-0.13,p:sec(0,0.12,hy+0.06,hy+0.12,0.04).p.map(q=>[q[0]+x,q[1]])},{z:z+0.11,p:sec(0,0.12,hy+0.06,hy+0.13,0.04).p.map(q=>[q[0]+x,q[1]])}],kit.hat,'cloth');
    mBox(M,x-0.1,hy+0.055,z+0.08,x+0.1,hy+0.075,z+0.2,shade(kit.hat,-0.2),'cloth');}
  // очки на лбу и ремешок
  mBox(M,x-0.108,hy+0.005,z-0.1,x+0.108,hy+0.035,z+0.1,'#2b1d12','leather',['t','d']);
  mBox(M,x-0.07,hy-0.01,z+0.095,x-0.015,hy+0.04,z+0.12,'#8fa9b8','glass');mBox(M,x+0.015,hy-0.01,z+0.095,x+0.07,hy+0.04,z+0.12,'#8fa9b8','glass');
  // руки к рулю (у механика — к борту)
  const hz=handZ||z+0.42;[-1,1].forEach(sd=>{const ax=x+sd*0.19,hx=mech?x+sd*0.26:x+sd*0.11,hzz=mech?z+0.1:hz,hy2=mech?seatY+0.32:seatY+0.52;
    mLoft(M,[{z:z,p:sec(0,0.045,sh-0.12,sh-0.02,0.02).p.map(q=>[q[0]+ax,q[1]])},{z:hzz,p:sec(0,0.04,hy2-0.05,hy2+0.04,0.02).p.map(q=>[q[0]+hx,q[1]])}],coat,'cloth');
    mBox(M,hx-0.035,hy2-0.04,hzz-0.02,hx+0.035,hy2+0.035,hzz+0.05,'#6b4a30','leather');});
  // шарф у пилота
  if(!mech){const sc=S.y<1920?'#ece6d4':'#b8322a';mFace(M,[[x-0.04,sh+0.02,z-0.08],[x+0.04,sh+0.02,z-0.08],[x+0.14,sh-0.08,z-0.42],[x+0.06,sh-0.1,z-0.42]],sc,'cloth',null,true);}
}
function crewKit3(y){return y<1906?{coat:'#6b5a44',cap:'cap',hat:'#3a3026'}:y<1915?{coat:'#7a6a55',cap:'helmet',hat:'#5a3f28'}:y<1922?{coat:'#8a8272',cap:'helmet',hat:'#4d3524'}:{coat:'#d8d4c8',cap:'helmet',hat:'#5b4030'};}
// Руль: обод и колонка — линии, наклонённые к пилоту
function mSteer(M,x,y,z,r,S){const deco=[],seg=14,tilt=0.75,P=a=>[x+Math.cos(a)*r,y+Math.sin(a)*r*Math.cos(tilt),z-Math.sin(a)*r*Math.sin(tilt)];
  for(let k=0;k<seg;k++)deco.push({a:P(k/seg*6.283),b:P((k+1)/seg*6.283),w:0.028,c:S.y<1912?'#5a3a22':'#1f1f22'});
  [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>deco.push({a:[x,y,z],b:P(a),w:0.014,c:'#8a8f96'}));deco.push({a:[x,y,z],b:[x,y-0.45,z+0.38],w:0.03,c:'#2a2a2e'});
  M.F.push({p:[[x,y,z]],n:[0,0,-1],col:[0,0,0],mat:MATS.matte,two:true,deco,point:true});}
// ---------- модели по облику ----------
function carModel(S){
  MLOD=S.lod==='lo'?0:1;const M=new Mesh(),st=S.style,y=S.y,col=S.color||'#23427a',brass=y<1916?'#c9a24a':'#c8ccd2',dark='#1c1d21',leather=y<1920?'#5a3a24':'#6e2a22';
  const W={wood:y<1906?'#b58a52':'#9a7248',y,dcol:shade(col,-0.2)},kit=crewKit3(y);
  let wt=S.wheel==='alloy'?'alloy':S.wheel==='wire'?'wire':S.wheel==='disc'?'disc':'wood';
  const G={}; // размеры
  // колесо помечается номером: в 3D оно крутится, передние ещё и поворачивают (радиус со знаком «−»)
  M.wheels=[];const WH=(cx,cy,cz,r,tw,solid)=>{M.wheels.push([cx,cy,cz,cz>0?-r:r]);MTAG.w=M.wheels.length;mWheel(M,cx,cy,cz,r,tw,wt,W,solid);MTAG.w=0;};
  const wheels=(wb,t,rF,rR,tw,dual,solid)=>{[-1,1].forEach(sd=>{WH(sd*t/2,rF,wb/2,rF,tw,solid);WH(sd*t/2,rR,-wb/2,rR,tw,solid);if(dual)WH(sd*(t/2+tw+0.02),rR,-wb/2,rR,tw,solid);});
    [-1,1].forEach(sd=>mBox(M,sd*0.36-0.035,rR-0.02,-wb/2-0.35,sd*0.36+0.035,rR+0.09,wb/2+0.3,dark,'matte'));
    mBox(M,-t/2,rR-0.025,-wb/2-0.025,t/2,rR+0.025,-wb/2+0.025,dark,'matte');mBox(M,-t/2,rF-0.025,wb/2-0.025,t/2,rF+0.025,wb/2+0.025,dark,'matte');};
  const radiator=(z,w,yb,yt,kind)=>{mBox(M,-w-0.03,yb-0.02,z,w+0.03,yt+0.03,z+0.07,brass,'metal');
    const g=mFace(M,[[-w,yb,z+0.075],[w,yb,z+0.075],[w,yt,z+0.075],[-w,yt,z+0.075]],kind==='coil'?'#8a6a3a':'#23241f','matte',[0,(yb+yt)/2,z]);
    const deco=[];if(kind==='honey'){for(let k=1;k<9;k++)deco.push({a:[-w,yb+(yt-yb)*k/9,z+0.08],b:[w,yb+(yt-yb)*k/9,z+0.08],w:0.008,c:'#4a4a40'});}else if(kind==='coil'){for(let k=1;k<7;k++)deco.push({a:[-w,yb+(yt-yb)*k/7,z+0.08],b:[w,yb+(yt-yb)*k/7,z+0.08],w:0.03,c:brass});}
    else{for(let k=-4;k<=4;k++)deco.push({a:[k*w/5,yb,z+0.08],b:[k*w/5,yt,z+0.08],w:0.01,c:'#55575c'});}g.deco=deco;};
  const hood=(z0,z1,w,yb,yt,louv)=>{const f=mLoft(M,[sec(z0,w,yb,yt,0.12),sec(z1,w*0.98,yb,yt-0.01,0.12)],col,'paint',false);
    if(louv)f.forEach(fc=>{if(Math.abs(fc.n[0])>0.9){const sd=Math.sign(fc.n[0]),x=sd*(w+0.004),deco=[];for(let k=0;k<6;k++){const zz=z1+(z0-z1)*(0.25+k*0.1);deco.push({a:[x,yb+0.12,zz],b:[x,yt-0.14,zz],w:0.012,c:shade(col,-0.45)});}fc.deco=deco;}});};
  const lamps=(z,x,yy,r)=>{[-1,1].forEach(sd=>{const cp=mCylZ(M,sd*x,yy,r,z,z+0.14,8,brass,'metal','#f4ecd0');cp[1].l=2;});};
  const tailLamp=(z,x,yy)=>{MTAG.l=1;mBox(M,x-0.045,yy-0.05,z-0.06,x+0.045,yy+0.05,z,'#6a1a14','metal');MTAG.l=0;M.lamps.push([x,yy,z-0.07]);};
  const seats=(z,xs,yb,back,sw)=>{xs.forEach(x=>{mBox(M,x-sw,yb,z-0.28,x+sw,yb+0.1,z+0.12,leather,'leather');mBox(M,x-sw,yb+0.05,z-0.36,x+sw,yb+back,z-0.26,leather,'leather');});};
  const runboard=(z0,z1,x,yy)=>{[-1,1].forEach(sd=>mBox(M,sd*x-0.16,yy-0.03,z0,sd*x+0.16,yy,z1,dark,'matte'));};
  const drv=(x,seatY,z,handZ)=>{MTAG.l=3;mCrew(M,x,seatY,z,kit,false,S,handZ);MTAG.l=0;M.eye=[x,seatY+0.8,z+0.06];},mechc=(x,seatY,z)=>{mCrew(M,x,seatY,z,kit,true,S);};
  if(st==='carriage'){
    const wb=1.85,t=1.25,rF=0.4,rR=0.48;wt='wood';wheels(wb,t,rF,rR,0.06);
    mBox(M,-0.33,0.45,0.5,0.33,0.86,0.98,col,'paint');radiator(0.98,0.28,0.42,0.8,'coil');
    mLoft(M,[sec(-0.95,0.5,0.55,1.0,0.05,0.55),sec(0.5,0.5,0.55,1.0,0.05,0.52)],col,'paint');
    mBox(M,-0.5,1.0,-0.95,0.5,1.04,0.5,shade(col,-0.35),'paint',['d']);
    seats(-0.05,[-0.24,0.24],1.02,0.42,0.2);mBox(M,-0.46,1.02,-0.9,0.46,1.12,-0.6,leather,'leather');mBox(M,-0.46,1.07,-0.62,0.46,1.4,-0.54,leather,'leather');
    [-1,1].forEach(sd=>{mBox(M,sd*0.52-0.05,1.0,0.36,sd*0.52+0.05,1.16,0.46,brass,'metal');});
    mSteer(M,0.24,1.36,0.28,0.17,S);drv(0.24,1.08,-0.05,0.26);if(S.mech)mechc(-0.24,1.08,-0.05);
    tailLamp(-0.96,0.4,0.9);G.len=[-1.1,1.1];G.t=t;}
  else if(st==='gp1901'||st==='gp1907'){
    const late=st==='gp1907',wb=late?2.7:2.4,t=1.4,r=late?0.43:0.45;wheels(wb,t,r,r,late?0.1:0.09);
    const zf=wb/2+0.18;radiator(zf,0.36,0.52,late?1.02:1.1,'honey');hood(zf,0.16,0.36,0.55,late?1.02:1.1,true);
    mBox(M,-0.42,0.58,0.06,0.42,late?1.06:1.12,0.17,'#3a2a1c','wood');
    mLoft(M,[sec(0.08,0.46,0.55,0.86,0.05),sec(-0.72,0.46,0.55,0.86,0.05)],col,'paint');
    seats(-0.3,[-0.24,0.24],0.72,0.4,0.19);
    mCylX(M,0,0.98,-1.0,0.23,-0.45,0.45,12,late?brass:col,late?'metal':'paint',shade(late?brass:col,-0.2));
    if(late){[-0.2,0.2].forEach(x=>mTyreZ(M,x,1.0,-1.3,0.43,0.1));}
    mSteer(M,0.24,1.18,0.05,0.18,S);drv(0.24,0.78,-0.3,0.02);if(S.mech)mechc(-0.24,0.78,-0.3);
    mCylZ(M,0.56,0.52,0.04,-1.2,0.4,6,'#4a4a4e','metal');tailLamp(-1.25,0.38,0.7);G.len=[late?-1.6:-1.3,zf+0.1];G.t=t;
    // полоса национального гоночного цвета по капоту и корме — кузов в цвете модели
    if(S.acc){const yt=late?1.02:1.1;mBox(M,-0.075,yt-0.004,0.16,0.075,yt+0.016,zf,S.acc,'paint');mBox(M,-0.075,0.856,-0.72,0.075,0.876,0.08,S.acc,'paint');}}
  else if(st==='gp1912'||st==='gp1925'){
    const late=st==='gp1925',wb=late?2.4:2.65,t=late?1.25:1.35,r=late?0.37:0.41;wheels(wb,t,r,r,late?0.13:0.11);
    const zf=wb/2+0.14,top=late?0.9:1.0,w=late?0.27:0.31,yb=late?0.3:0.45;
    radiator(zf,w,yb+0.06,top,'vert');
    mLoft(M,[sec(zf,w,yb,top,0.1),sec(0.4,w+0.04,yb,top+0.02,0.12),sec(0.05,w+0.12,yb,top-0.02,0.1)],col,'paint',false);
    mLoft(M,[sec(0.05,w+0.12,yb,top-0.1,0.08),sec(-0.5,w+0.14,yb,top-0.1,0.08)],col,'paint',false);
    mLoft(M,[sec(-0.5,w+0.14,yb,top-0.02,0.14),sec(-1.0,w*0.8,yb+0.1,top-0.06,0.12),sec(-1.55,0.03,yb+0.3,yb+0.36,0.01)],col,'paint');
    const solo=late||!S.mech,sx=solo?0.1:0.2;seats(-0.2,solo?[sx]:[-sx,sx],yb+0.25,0.45,0.17);
    mSteer(M,sx,top+0.12,0.12,0.19,S);drv(sx,yb+0.3,-0.2,0.08);if(!solo)mechc(-sx,yb+0.3,-0.2);
    mBox(M,w+0.1,yb+0.08,-0.3,w+0.16,yb+0.14,0.9,'#3a3a3e','metal');
    // номер на хвосте
    tailLamp(-1.3,0.18,yb+0.3);G.len=[-1.6,zf+0.1];G.t=t;
    if(S.acc)mBox(M,-0.065,top-0.004,0.05,0.065,top+0.016,zf,S.acc,'paint');}
  else if(st==='van'||st==='truck'){
    const truck=st==='truck',big=S.b==='b8',wb=truck?(big?3.6:3.2):2.5,t=1.45,rF=truck?0.46:0.44,rR=truck?0.5:0.44;wt='wood';wheels(wb,t,rF,rR,truck?0.12:0.08,big,truck);
    const zf=wb/2+0.3;radiator(zf,0.34,0.62,1.2,y<1906?'coil':'vert');hood(zf,wb/2-0.45,0.36,0.62,1.2,true);
    mBox(M,-0.55,0.7,wb/2-0.95,0.55,1.3,wb/2-0.45,col,'paint',['t']);
    mBox(M,-0.62,1.95,wb/2-1.25,0.62,2.02,wb/2-0.4,shade(col,-0.3),'paint');[-1,1].forEach(sd=>mBox(M,sd*0.58-0.03,1.2,wb/2-0.45,sd*0.58+0.03,1.95,wb/2-0.4,dark,'matte'));
    seats(wb/2-0.95,[-0.25,0.25],0.95,0.45,0.2);mSteer(M,0.25,1.45,wb/2-0.6,0.19,S);drv(0.25,1.0,wb/2-0.95,wb/2-0.62);if(S.mech)mechc(-0.25,1.0,wb/2-0.95);
    const z1=wb/2-1.3,z0=truck?-wb/2-0.9:-wb/2-0.5;
    if(truck){mBox(M,-0.95,0.95,z0,0.95,1.05,z1,'#6a4a2c','wood');[-1,1].forEach(sd=>mBox(M,sd*0.95-0.05,1.05,z0,sd*0.95+0.05,1.5,z1,'#8a6a44','wood'));const tb=mBox(M,-0.95,1.05,z0,0.95,1.5,z0+0.08,'#8a6a44','wood');
      const deco=[];for(let k=1;k<4;k++)deco.push({a:[-0.95,1.05+k*0.11,z0-0.01],b:[0.95,1.05+k*0.11,z0-0.01],w:0.012,c:'#4a3420'});tb.b.deco=deco;}
    else{const f=mBox(M,-0.72,0.78,z0,0.72,2.0,z1,col,'paint');f.b.deco=[{a:[0,0.82,z0-0.01],b:[0,1.95,z0-0.01],w:0.015,c:shade(col,-0.45)},{a:[-0.72,1.9,z0-0.01],b:[0.72,1.9,z0-0.01],w:0.012,c:shade(col,-0.45)}];}
    tailLamp(z0-0.02,0.6,0.95);G.len=[z0,zf+0.1];G.t=t+(big?0.3:0);}
  else{ // серийные: runabout, sport, tonneau, tourer, sedan
    const sedan=st==='sedan',tour=st==='tourer',ton=st==='tonneau',sport=st==='sport',run=st==='runabout';
    // капот тем длиннее, чем больше мотор (как на рисунке модели); облегчённая — без крыльев, подножек, фонарей, стекла и тента
    const hk=S.hp===undefined?0:([-0.1,-0.05,0,0.1,0.22,0.36][S.hp]||0),strip=!!S.strip;
    const wb=(run?1.95:sport?2.5:ton?2.25:tour?2.8:2.85)+hk,t=1.38,r=y<1906?0.44:y<1914?0.42:y<1922?0.39:0.36;
    if(y>=1922&&(sedan||tour))wt=S.wheel==='wire'?'wire':'disc';wheels(wb,t,r,r,y<1906?0.08:y<1922?0.1:0.13);
    const zf=wb/2+(run?0.05:0.22),yb=r+0.08,top=run?yb+0.42:yb+0.55;
    radiator(zf,run?0.26:0.32,yb,top,y<1901?'coil':y<1906?'honey':'vert');hood(zf,wb/2-(run?0.35:0.7)-hk,run?0.28:0.34,yb,top,!run);
    const zd=wb/2-(run?0.35:0.7)-hk;mBox(M,-0.5,yb,zd-0.08,0.5,top+0.06,zd+0.02,'#3a2a1c','wood');
    const zr=-wb/2-(sport?0.5:run?0.35:0.55),bw=sedan||tour?0.64:0.55,btop=top+(sedan?0:ton?0.12:0.02);
    const body=mLoft(M,[sec(zd,bw,yb,btop,0.06),sec(zr+0.25,bw,yb,btop,0.06),sec(zr,bw*0.9,yb+0.05,btop-(sport?0.2:0.05),sport?0.2:0.14)],col,'paint');
    if(ton)body.forEach(fc=>{if(fc.n[2]<-0.8)fc.deco=[{a:[-0.2,yb+0.05,zr-0.005],b:[-0.2,btop-0.1,zr-0.005],w:0.012,c:shade(col,-0.5)},{a:[0.2,yb+0.05,zr-0.005],b:[0.2,btop-0.1,zr-0.005],w:0.012,c:shade(col,-0.5)},{a:[-0.2,btop-0.1,zr-0.005],b:[0.2,btop-0.1,zr-0.005],w:0.012,c:shade(col,-0.5)},{dot:[0.14,(yb+btop)/2,zr-0.01],r:0.025,c:brass}];});
    if(sedan){const cy0=btop,cy1=btop+0.72,rr=y>=1923?0.18:0.05;const cab=mLoft(M,[sec(zd-0.05,bw-0.02,cy0,cy1,rr,bw-0.06),sec(zr+0.2,bw-0.02,cy0,cy1,rr,bw-0.08)],col,'paint');
      cab.forEach(fc=>{if(Math.abs(fc.n[0])>0.8){const sd=Math.sign(fc.n[0]),x=sd*(bw-0.015),yw0=cy0+0.14,yw1=cy1-0.1,d=[];for(let k=0;k<3;k++){const z0w=zd-0.2-k*(zd-zr-0.4)/3,z1w=z0w-(zd-zr-0.4)/3+0.08;mFace(M,[[x+sd*0.004,yw0,z0w],[x+sd*0.004,yw0,z1w],[x+sd*0.004,yw1,z1w],[x+sd*0.004,yw1,z0w]],'#7fa0b6','glass',[0,cy0,(zd+zr)/2]);}}
        if(fc.n[2]<-0.8)mFace(M,[[-bw+0.12,cy0+0.14,zr+0.195],[bw-0.12,cy0+0.14,zr+0.195],[bw-0.12,cy1-0.12,zr+0.195],[-bw+0.12,cy1-0.12,zr+0.195]],'#7fa0b6','glass',[0,cy0,zd]);});}
    else{const rows=tour||ton?[-0.25,-0.25-(tour?1.0:0.8)]:[-0.1];rows.forEach(z=>seats(z,[-0.26,0.26],yb+0.18,0.42,0.22));
      if(y>=1908&&!run&&!strip)mFace(M,[[-0.46,top+0.06,zd-0.05],[0.46,top+0.06,zd-0.05],[0.46,top+0.5,zd-0.12],[-0.46,top+0.5,zd-0.12]],'#9fbccc','glass',[0,top,zd-1],true);
      if(tour&&!strip)mLoft(M,[sec(zr+0.25,bw-0.05,btop,btop+0.22,0.1),sec(zr-0.05,bw-0.08,btop,btop+0.18,0.1)],'#3a342c','cloth');
      if(sport&&y>=1910)mTyreZ(M,0,yb+0.3,zr-0.08,r,0.11);}
    if((!run||y>=1903)&&!strip){const fl=y<1912?0.25:0.1;[-1,1].forEach(sd=>{mFender(M,sd*t/2,r,wb/2,r,0.2,sport&&y>=1912?col:dark,-0.2,Math.PI*0.95);mFender(M,sd*t/2,r,-wb/2,r,0.2,sport&&y>=1912?col:dark,Math.PI*0.05,Math.PI*1.1);});
      if(!run)runboard(-wb/2+r+0.05,wb/2-r-0.05,t/2+0.02,yb-0.02);}
    if(y>=1901&&!sedan&&!strip)lamps(zf-0.2,0.42,top-0.05,0.08);
    const dz=sedan?-0.1:-0.25;mSteer(M,0.26,top+0.22,zd-0.25,0.19,S);drv(0.26,yb+0.22,dz,zd-0.3);if(S.mech&&!sedan)mechc(-0.26,yb+0.22,dz);else if(S.mech)mechc(-0.26,yb+0.22,dz);
    tailLamp(zr-0.01,0.42,yb+0.2);G.len=[zr-0.1,zf+0.12];G.t=t;}
  M.len=G.len||[-1.5,1.5];M.track=G.t||1.35;return M;
}
/* ---------- отрисовка модели в спрайт ---------- */
const LVc=(()=>{const v=[-0.5,0.78,-0.38],l=Math.hypot(...v);return v.map(x=>x/l);})(),HVc=(()=>{const v=[LVc[0],LVc[1],LVc[2]-1],l=Math.hypot(...v);return v.map(x=>x/l);})();
// Отрисовка: M — модель; opt.parts — слои по порядку ({M} — грани, {draw(g,S,X,ppm), ext:[точки]} — свой рисунок, например зрители между трибуной и крышей)
// opt.shadow — сила тени, opt.outline — толщина контура (0 — без), M.foot — пятно тени [x0,x1,z0,z1]
function renderModel(M,yaw,pitch,ppm,opt){
  opt=opt||{};const parts=opt.parts||[{M}];
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const X=p=>{const x=p[0]*cy+p[2]*sy,z=-p[0]*sy+p[2]*cy,y=p[1];return [x,y*cp+z*sp,-y*sp+z*cp];};
  const N=n=>{const x=n[0]*cy+n[2]*sy,z=-n[0]*sy+n[2]*cy,y=n[1];return [x,y*cp+z*sp,-y*sp+z*cp];};
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  const ext=q=>{if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1];};
  const lists=parts.map(pt=>{if(!pt.M){(pt.ext||[]).forEach(q=>ext(X(q)));return null;}const list=[];
    for(const f of pt.M.F){const P=f.p.map(X);let n=N(f.n);
      if(!f.point){if(n[2]>0.02){if(!f.two)continue;n=n.map(v=>-v);}}
      let zs=0;P.forEach(q=>{zs+=q[2];ext(q);});list.push({f,P,n,z:zs/P.length+(f.bias||0)});}
    list.sort((a,b)=>b.z-a.z);return list;});
  // тень на земле: пятно под моделью
  const Fo=M.foot||[-(M.track||1.35)/2-0.18,(M.track||1.35)/2+0.18,(M.len||[-1.5,1.5])[0]-0.15,(M.len||[-1.5,1.5])[1]+0.1];
  const sh=[[Fo[0],0,Fo[2]],[Fo[1],0,Fo[2]],[Fo[1],0,Fo[3]],[Fo[0],0,Fo[3]]].map(X);sh.forEach(ext);
  const pad=opt.pad||0.22,Wc=Math.ceil((x1-x0+pad*2)*ppm),Hc=Math.ceil((y1-y0+pad*2)*ppm),ox=(-x0+pad)*ppm,oy=(y1+pad)*ppm;
  const cv=mkCanvas(Wc,Hc),c=cv.getContext('2d'),S=q=>[ox+q[0]*ppm,oy-q[1]*ppm];
  c.save();c.shadowColor=`rgba(0,0,0,${opt.shadow||0.42})`;c.shadowBlur=ppm*(opt.blur||0.18);c.shadowOffsetX=0;c.shadowOffsetY=Hc*3;c.fillStyle='#000';c.beginPath();sh.forEach((q,i)=>{const s=S(q);i?c.lineTo(s[0],s[1]-Hc*3):c.moveTo(s[0],s[1]-Hc*3);});c.closePath();c.fill();c.restore();
  // сама модель — на отдельном холсте, чтобы обвести контур
  const bc=mkCanvas(Wc,Hc),g=bc.getContext('2d');g.lineJoin='round';g.lineCap='round';
  if(opt.lv){const v=opt.lv,l=Math.hypot(...v),L=v.map(x=>x/l),h=[L[0],L[1],L[2]-1],hl=Math.hypot(...h);DFL=[L,h.map(x=>x/hl)];}
  lists.forEach((list,i)=>{if(list)drawFaces(g,list,S,X,ppm);else parts[i].draw(g,S,X,ppm);});DFL=null;
  const olw=opt.outline===undefined?Math.max(1,ppm/70):opt.outline;
  if(olw>0){const oc=mkCanvas(Wc,Hc),o=oc.getContext('2d');o.drawImage(bc,0,0);o.globalCompositeOperation='source-in';o.fillStyle='rgba(16,12,9,.9)';o.fillRect(0,0,Wc,Hc);
    [[olw,0],[-olw,0],[0,olw],[0,-olw]].forEach(([dx,dy])=>c.drawImage(oc,dx,dy));}
  c.drawImage(bc,0,0);
  const lamps=(M.lamps||[]).map(p=>{const q=X(p);return {x:q[0],y:q[1],vis:q[2]<0.2};});
  return {img:cv,wM:Wc/ppm,hM:Hc/ppm,ax:ox/Wc,ay:oy/Hc,lamps};
}
// Грани по порядку от дальних к ближним: свет, блик, рисунок поверх (линии, точки, кольца, наклейки-многоугольники, надписи)
let DFL=null; // свет для отдельной отрисовки (здания освещены чуть спереди)
function drawFaces(g,list,S,X,ppm){const LV=DFL?DFL[0]:LVc,HV=DFL?DFL[1]:HVc;
  for(const it of list){const f=it.f,m=f.mat,n=it.n;let k=1,s=0;
    if(!f.point){const d=Math.max(0,n[0]*LV[0]+n[1]*LV[1]+n[2]*LV[2]),up=0.82+0.18*Math.max(-1,Math.min(1,n[1]));s=Math.pow(Math.max(0,n[0]*HV[0]+n[1]*HV[1]+n[2]*HV[2]),m.p)*m.s;
      k=(m.a+m.d*d)*up;const col=f.col,css=`rgb(${Math.min(255,col[0]*k+255*s)|0},${Math.min(255,col[1]*k+255*s)|0},${Math.min(255,col[2]*k+255*s)|0})`;
      g.globalAlpha=m.al||1;g.fillStyle=css;g.strokeStyle=css;g.lineWidth=0.9;g.beginPath();it.P.forEach((q,i)=>{const p=S(q);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);});g.closePath();g.fill();if(!m.al)g.stroke();g.globalAlpha=1;}
    if(f.deco){for(const dd of f.deco){
      if(dd.poly){const col=hex2rgb(dd.c),kk=dd.flat?1:k*(dd.k||1),ss=dd.gl?s*0.8+0.05:0;g.fillStyle=`rgb(${Math.min(255,col[0]*kk+255*ss)|0},${Math.min(255,col[1]*kk+255*ss)|0},${Math.min(255,col[2]*kk+255*ss)|0})`;
        g.beginPath();dd.poly.forEach((q,i)=>{const p=S(X(q));i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);});g.closePath();g.fill();continue;}
      if(dd.text){const p0=S(X(dd.at[0])),p1=S(X(dd.at[1])),p3=S(X(dd.at[2]));g.save();g.transform((p1[0]-p0[0])/dd.w,(p1[1]-p0[1])/dd.w,(p0[0]-p3[0])/dd.h,(p0[1]-p3[1])/dd.h,p3[0],p3[1]);
        g.fillStyle=dd.c;g.font=dd.font;g.textAlign='center';g.textBaseline='middle';g.fillText(dd.text,dd.w/2,dd.h*0.54);g.restore();continue;}
      if(dd.dot){const p=S(X(dd.dot));g.fillStyle=dd.c;g.beginPath();g.arc(p[0],p[1],Math.max(0.8,dd.r*ppm*0.85),0,7);g.fill();continue;}
      if(dd.ring){const [x,yy,zz,rr]=dd.ring,pts=[];for(let q=0;q<=20;q++){const a=q/20*6.283;pts.push(S(X(dd.ax==='z'?[x+Math.cos(a)*rr,yy+Math.sin(a)*rr,zz]:[x,yy+Math.sin(a)*rr,zz+Math.cos(a)*rr])));}g.strokeStyle=dd.c;g.lineWidth=Math.max(0.7,dd.w*ppm);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();continue;}
      const a=S(X(dd.a)),b=S(X(dd.b));g.strokeStyle=dd.lit?shade(dd.c,(k-0.95)*0.8):dd.c;g.lineWidth=Math.max(0.6,dd.w*ppm);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}}}
}
/* ---------- кэш спрайтов: ракурсы по углу, ближний и дальний план ---------- */
const CAR3D={models:new Map(),cache:new Map(),q:[],t0:0,spent:0};
const ANG3=(()=>{const a=[0];[6,12,18,24,30,40,50,60,70,80,90,105,120,135,150,165].forEach(d=>a.push(d,-d));a.push(180);return a.map(d=>d*Math.PI/180);})();
function angIdx3(a){let best=0,bd=9;for(let i=0;i<ANG3.length;i++){const d=Math.abs(angWrap(a-ANG3[i]));if(d<bd){bd=d;best=i;}}return best;}
function carModelFor(spec,near){const k=spec.key+(near?'|h':'|l');let M=CAR3D.models.get(k);if(!M){M=carModel(Object.assign({},spec,{lod:near?'hi':'lo'}));CAR3D.models.set(k,M);}return M;}
function car3dKey(spec,near,i){return spec.key+'|'+(near?'n':'f')+'|'+i;}
function car3dMake(spec,near,i){const t0=performance.now(),dpr=Math.min(2,window.devicePixelRatio||1),ppm=(near?64:28)*dpr,sp=renderModel(carModelFor(spec,near),ANG3[i],near?0.5:0.16,ppm);
  const k=car3dKey(spec,near,i);CAR3D.cache.set(k,sp);if(CAR3D.cache.size>260){const first=CAR3D.cache.keys().next().value;CAR3D.cache.delete(first);}CAR3D.spent+=performance.now()-t0;return sp;}
// Бюджет кадра на рисование новых ракурсов: не больше ~8 мс, иначе берём ближайший готовый
function car3dBudget(ms){const now=performance.now();if(now-CAR3D.t0>12){CAR3D.t0=now;CAR3D.spent=0;}return CAR3D.spent<(ms||8);}
// Спрайт для угла a (0 — видим строго сзади, + — нос повёрнут вправо); prev — прошлый ракурс (чтобы не мигал на границе)
function car3dSprite(spec,a,near,o){
  let i=angIdx3(a);if(o&&o.angI!==undefined&&o.angN===near&&Math.abs(angWrap(a-ANG3[o.angI]))<0.07)i=o.angI;
  const k=car3dKey(spec,near,i);let sp=CAR3D.cache.get(k);if(o){o.angI=i;o.angN=near;}
  if(sp){CAR3D.cache.delete(k);CAR3D.cache.set(k,sp);return sp;}
  if(car3dBudget())return car3dMake(spec,near,i);
  let best=null,bd=9;for(let j=0;j<ANG3.length;j++){const s2=CAR3D.cache.get(car3dKey(spec,near,j))||CAR3D.cache.get(car3dKey(spec,!near,j));if(s2){const d=Math.abs(angWrap(ANG3[j]-a));if(d<bd){bd=d;best=s2;}}}
  return best||car3dMake(spec,near,i);
}
// Очередь заранее: вид сзади для всех машин гонки — рисуется понемногу, пока идёт отсчёт
function car3dQueue(specs,nearSpec){const q=[],order=[0,6,-6,12,-12,18,-18,24,-24];
  order.forEach(d=>{const i=angIdx3(d*Math.PI/180);if(nearSpec)q.push([nearSpec,true,i]);});order.slice(0,5).forEach(d=>{const i=angIdx3(d*Math.PI/180);specs.forEach(sp=>q.push([sp,false,i]));});CAR3D.q=q;}
function car3dWork(ms){while((CAR3D.q.length||(typeof SCQ!=='undefined'&&SCQ.length))&&car3dBudget(ms)){if(CAR3D.q.length){const [sp,near,i]=CAR3D.q.shift();if(!CAR3D.cache.get(car3dKey(sp,near,i)))car3dMake(sp,near,i);}else{const t0=performance.now();SCQ.shift()();CAR3D.spent+=performance.now()-t0;}}}
