/* ================= ДЕРЕВЬЯ И ТРАВА ИЗ ФОТО-ЛИСТВЫ: ствол с корой, крона из «карточек» с пучками листьев ================= */
// Карточка — квадрат с пучком листьев из атласа (48b-tex.js, foliage_*.jpg). Нормали карточек смотрят от середины кроны:
// крона освещается как объём, снизу и внутри темнее, против солнца листва просвечивает. Ствол и ветки — фото коры.
// Атлас 2048×1024, клетки 512: 0 — тёмная листва (дуб, вяз, платан), 1 — светлая (тополь, берёза), 2 — олива, 3 — еловая лапа,
// 4 — сосна, 5 — пальмовый лист, 6 — трава (4 пучка: зелёная, сухая, с цветами, папоротник), 7 — куст
const FOLC={broad:0,light:1,olive:2,fir:3,pine:4,palm:5,grass:6,shrub:7};
function folUV(c){const cx=c%4,cy=Math.floor(c/4),e=2/2048;return [cx*0.25+e,cy*0.5+e*2,(cx+1)*0.25-e,(cy+1)*0.5-e*2];}
// Слой фото-текстуры для вершин (байт e[3]): k — имя материала, tint — окрашивать цветом вершины, tri — «с трёх сторон»
function txLay(k,tint,tri){const i=texLi(k);return i<0?0:(i+1)|(tint?TXM.tint:0)|(tri?TXM.tri:0);}
// Карточка: центр c, оси ax (ширина) и ay (высота), нормаль n (для света), uv-прямоугольник, оттенок и затенение, качание
function fCard(lb,c,ax,ay,uv,n,tint,ao,sway){const e=lb.e,ez=e[2];e[2]=sway||0;const [u0,v0,u1,v1]=uv,A=Math.round(clamp(ao,0.15,1)*255);
  const P=(sx,sy)=>[c[0]+ax[0]*sx+ay[0]*sy,c[1]+ax[1]*sx+ay[1]*sy,c[2]+ax[2]*sx+ay[2]*sy];const i0=lb.n;
  const q=[[P(-.5,-.5),u0,v1],[P(.5,-.5),u1,v1],[P(.5,.5),u1,v0],[P(-.5,.5),u0,v0]];
  q.forEach(([p,u,v])=>lb.v(p[0],p[1],p[2],n[0],n[1],n[2],tint,A,u,v));lb.tri(i0,i0+1,i0+2);lb.tri(i0,i0+2,i0+3);e[2]=ez;}
// Пучок: две скрещённые карточки, «низ» пучка (веточка) — к середине кроны
function fCluster(lb,p,ctr,size,cell,tint,ao,sway,r){const o=v3n([p[0]-ctr[0],(p[1]-ctr[1])*0.8+0.25,p[2]-ctr[2]]);
  const up=v3n([o[0]+(r()-0.5)*0.6,o[1]+0.7,o[2]+(r()-0.5)*0.6]);let s=v3x(up,[r()-0.5,r()*0.2,r()-0.5]);if(Math.hypot(...s)<1e-3)s=[1,0,0];s=v3n(s);const t=v3n(v3x(up,s));
  const uv=folUV(cell),n=v3n([o[0]*0.8+up[0]*0.2,o[1]*0.8+up[1]*0.2+0.15,o[2]*0.8+up[2]*0.2]),w=size*(0.85+r()*0.3);
  fCard(lb,p,[s[0]*w,s[1]*w,s[2]*w],[up[0]*w,up[1]*w,up[2]*w],uv,n,tint,ao,sway);fCard(lb,p,[t[0]*w,t[1]*w,t[2]*w],[up[0]*w,up[1]*w,up[2]*w],uv,n,tint,ao*0.95,sway);}
const fTint=(r,base,k)=>{const j=1+(r()-0.5)*(k||0.14);return [clamp(base[0]*j,0,255)|0,clamp(base[1]*j,0,255)|0,clamp(base[2]*j,0,255)|0];};
// Крона-эллипсоид из пучков: центр, полуоси, число пучков, размер пучка
function fCrown(lb,r,C,R,n,size,cell,base,sway,flat){
  for(let i=0;i<n;i++){const a=r()*6.283,u=r()*2-1,rr=Math.pow(r(),0.35),ct=Math.sqrt(1-u*u);
    const d=[Math.cos(a)*ct*rr,u*rr*(flat?0.6:1),Math.sin(a)*ct*rr],p=[C[0]+d[0]*R[0],C[1]+d[1]*R[1],C[2]+d[2]*R[2]];
    const ao=0.5+0.28*rr+0.22*(d[1]*0.5+0.5);fCluster(lb,p,C,size,cell,fTint(r,base),ao,sway,r);}}
// Ствол и ветки: гранёная труба с корой (планарная проекция на каждую грань — кора идёт вдоль ствола)
function fTrunk(wb,a,b,r0,r1,col,sides){const e=wb.e,e3=e[3];e[3]=txLay('bark',1);
  const d=v3n([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),up=Math.abs(d[1])>0.95?[1,0,0]:[0,1,0],s=v3n(v3x(up,d)),t=v3x(d,s),c=hex2rgb(col),k=sides||7;
  for(let i=0;i<k;i++){const a0=i/k*6.2832,a1=(i+1)/k*6.2832,am=(a0+a1)/2,R=(p,rad,an)=>[p[0]+(s[0]*Math.cos(an)+t[0]*Math.sin(an))*rad,p[1]+(s[1]*Math.cos(an)+t[1]*Math.sin(an))*rad,p[2]+(s[2]*Math.cos(an)+t[2]*Math.sin(an))*rad];
    const n=[s[0]*Math.cos(am)+t[0]*Math.sin(am),s[1]*Math.cos(am)+t[1]*Math.sin(am),s[2]*Math.cos(am)+t[2]*Math.sin(am)];
    wb.poly([R(a,r0,a0),R(a,r0,a1),R(b,r1,a1),R(b,r1,a0)],n,cMul(c,0.92+0.12*Math.cos(am-2.4)),MID.bark);}
  e[3]=e3;}
// Изогнутая ветка из нескольких отрезков
function fLimb(wb,p0,dir,len,r0,r1,col,bend,r,segs){let p=p0.slice(),d=v3n(dir);const n=segs||3;const pts=[p.slice()];
  for(let i=0;i<n;i++){const q=[p[0]+d[0]*len/n,p[1]+d[1]*len/n,p[2]+d[2]*len/n];fTrunk(wb,p,q,r0+(r1-r0)*i/n,r0+(r1-r0)*(i+1)/n,col,5);p=q;pts.push(p.slice());
    d=v3n([d[0]+(r()-0.5)*bend,d[1]+(r()-0.5)*bend*0.5,d[2]+(r()-0.5)*bend]);}
  return pts;}
// Модель дерева: {w — древесина (обычный шейдер), l — листва (карточки)}; lod 1 — рядом с дорогой, 0 — лес вдали
const FT={};
function fTree(t,v,lod){const key=t+'|'+v+'|'+lod;if(FT[key])return FT[key];const r=mulberry32(hashStr('ft'+key)),wb=new MB(),lb=new MB(true),hi=lod>0;
  const G=[128,128,120],dark=[112,122,104],light=[138,138,118],sw=90;
  const N=k=>Math.max(4,Math.round(k*(hi?1:0.3)*gq().trees));
  if(t==='oak'||t==='elm'||t==='plane'){const H=t==='elm'?9.5:t==='plane'?10:8,col=t==='plane'?'#b8b098':'#6a5a48',tr=t==='oak'?0.5:0.42;
    fTrunk(wb,[0,-0.3,0],[0.15,H*0.45,0.05],tr,tr*0.72,col,hi?8:5);
    const C=[0.1,H*0.72,0],R=t==='elm'?[4.2,3.2,4.2]:t==='plane'?[4.8,3.4,4.8]:[4.6,3.1,4.6];
    if(hi)for(let i=0;i<5;i++){const a=i/5*6.28+r()*0.6;fLimb(wb,[0.15,H*0.42,0.05],[Math.cos(a),t==='elm'?1.6:1.05,Math.sin(a)],R[0]*0.9,tr*0.55,0.08,col,0.5,r,3);}
    fCrown(lb,r,C,R,N(t==='oak'?40:36),t==='plane'?2.6:2.4,FOLC.broad,t==='elm'?G:dark,sw);}
  else if(t==='poplar'){fTrunk(wb,[0,-0.3,0],[0,5,0],0.32,0.22,'#6d5f4c',hi?7:5);fCrown(lb,r,[0,10.5,0],[1.9,7.5,1.9],N(34),2.1,FOLC.light,G,sw);}
  else if(t==='birch'){const col='#e2e0d6';fTrunk(wb,[0,-0.3,0],[0.1,7,0],0.2,0.13,col,hi?7:5);if(hi)for(let i=0;i<4;i++){const a=i/4*6.28+r();fLimb(wb,[0.1,4+i*0.7,0],[Math.cos(a),0.9,Math.sin(a)],2.4,0.08,0.03,col,0.6,r,2);}
    fCrown(lb,r,[0.1,8.2,0],[2.6,3.4,2.6],N(28),1.9,FOLC.light,light,sw*1.2);}
  else if(t==='olive'){const col='#7a6c5a';fTrunk(wb,[0,-0.3,0],[-0.35,1.6,0.1],0.4,0.3,col,hi?7:5);fLimb(wb,[-0.35,1.5,0.1],[0.6,1,0.2],1.8,0.24,0.1,col,0.7,r,2);fLimb(wb,[-0.35,1.5,0.1],[-0.8,1,-0.3],1.6,0.22,0.1,col,0.7,r,2);
    fCrown(lb,r,[0,3.4,0],[3,1.7,3],N(26),1.9,FOLC.olive,[128,126,124],sw,true);}
  else if(t==='pine'){const col='#8a6448',H=11+v;fTrunk(wb,[0,-0.3,0],[0.4,H,0.2],0.32,0.16,col,hi?7:5);
    if(hi)for(let i=0;i<4;i++){const a=i/4*6.28+r();fLimb(wb,[0.35,H*0.85,0.18],[Math.cos(a),0.6,Math.sin(a)],2.4,0.12,0.05,col,0.4,r,2);}
    fCrown(lb,r,[0.4,H+0.8,0.2],[3.4,1.3,3.4],N(26),2.4,FOLC.pine,[124,130,112],sw,true);}
  else if(t==='fir'||t==='cypress'){const cyp=t==='cypress',H=cyp?12+v*0.7:13+v,R0=cyp?1.3:3.2,col='#5a4636';fTrunk(wb,[0,-0.3,0],[0,H*0.95,0],cyp?0.2:0.26,0.05,col,hi?6:4);
    // тёмная сердцевина ели ярусами — сквозь лапы не просвечивает пустота, силуэт плотный, как у настоящей ели
    if(!cyp)for(let i=0;i<3;i++){const y0=1.2+i*H*0.27,rr=R0*0.66*(1-i*0.24);pCone(wb,0,y0,0,rr,H*0.46-i*0.6,v===1?'#3a4a40':'#1f3526',hi?9:6,0,MID.leaf,0);}
    const lv=Math.max(4,Math.round((cyp?16:14)*(hi?1:0.45)*gq().trees)),per=cyp?4:hi?8:5,uv=folUV(FOLC.fir),tint=cyp?[100,112,96]:v===1?[150,154,150]:[112,122,108];
    for(let k=0;k<lv;k++){const f=k/lv,y=(cyp?0.9:1.6)+f*(H-(cyp?1.6:2.4)),rad=R0*Math.pow(1-f,cyp?0.55:0.95)*(cyp?Math.min(1,0.45+f*3):1)+0.25;
      for(let j=0;j<per;j++){const a=(j+(k%2)*0.5)/per*6.283+r()*0.3,dx=Math.cos(a),dz=Math.sin(a),dr=cyp?0.2:0.28+0.1*r();
        // лапа: от ствола наружу и вниз; u — от ствола к кончику
        const ax=[dx*rad*1.15,-dr*rad,dz*rad*1.15],c=[dx*rad*0.55,y,dz*rad*0.55],w=rad*(cyp?1.1:1.08),ay=[-dz*w,0.12*w,dx*w];
        const n=v3n([dx*0.7,0.55,dz*0.7]);fCard(lb,c,ax,ay,uv,n,fTint(r,tint,0.1),0.45+0.55*f,cyp?40:70);
        if(hi){const ay2=[0,w*0.9,0];fCard(lb,[c[0],c[1]+0.1,c[2]],ax,ay2,uv,n,fTint(r,tint,0.1),0.4+0.5*f,cyp?40:70);}}}}
  else if(t==='palm'){let p=[0,-0.3,0];const col='#8a7458',segs=hi?8:5;for(let s=0;s<segs;s++){const q=[0.9*Math.sin((s+1)/segs*1.6)*(s+1)/segs,(s+1)*11.5/segs,0];fTrunk(wb,p,q,0.28-s*0.012,0.26-(s+1)*0.012,col,hi?7:5);p=q;}
    const uv=folUV(FOLC.palm);for(let i=0;i<(hi?11:6);i++){const a=i/(hi?11:6)*6.283+r()*0.3,dx=Math.cos(a),dz=Math.sin(a),L=3.4+r()*0.8,droop=0.3+r()*0.5;
      // лист из двух изогнутых отрезков: u — вдоль листа
      const P0=p,P1=[p[0]+dx*L*0.5,p[1]+0.45-droop*0.3,p[2]+dz*L*0.5],P2=[p[0]+dx*L,p[1]-droop*1.6,p[2]+dz*L],w=1.5,sx=[-dz*w/2,0,dx*w/2];
      const seg=(A,B,u0,u1)=>{const i0=lb.n,n=v3n([0,1,0]);[[A,-1,u0],[B,-1,u1],[B,1,u1],[A,1,u0]].forEach(([q,sd,u])=>lb.v(q[0]+sx[0]*sd,q[1]+sx[1]*sd,q[2]+sx[2]*sd,n[0],n[1],n[2],fTint(r,[122,130,110],0.08),230,uv[0]+(uv[2]-uv[0])*u,sd<0?uv[3]:uv[1]));lb.tri(i0,i0+1,i0+2);lb.tri(i0,i0+2,i0+3);};
      lb.e[2]=200;seg(P0,P1,0,0.5);seg(P1,P2,0.5,1);lb.e[2]=0;}}
  else if(t==='bush'){fCrown(lb,r,[0,0.9,0],[1.3,0.9,1.3],N(9),1.5,FOLC.shrub,G,50);}
  else if(t==='hedge'){for(let z=-5;z<=5;z+=1.4)fCrown(lb,r,[0,0.9,z],[0.8,0.9,0.9],hi?3:2,1.4,FOLC.shrub,dark,30);}
  else{fTrunk(wb,[0,-0.3,0],[0,4,0],0.3,0.2,'#6a5a48',5);fCrown(lb,r,[0,6,0],[2.8,2.4,2.8],N(20),2.2,FOLC.broad,G,sw);}
  return FT[key]={w:wb,l:lb};}
// Трава и цветы у обочины из атласа листвы (клетка 6: четыре пучка по 256 px)
function folVegList(){const u0=0.5,v0=0.5,du=0.125,dv=0.25,e=1/2048;const cell=(i,j)=>({u:u0+i*du+e,v:v0+j*dv+e,du:du-2*e,dv:dv-2*e});
  return [Object.assign(cell(0,0),{kind:'grass',w:1.0,h:1.0,sway:1}),Object.assign(cell(1,0),{kind:'dry',w:1.0,h:1.0,sway:1}),
    Object.assign(cell(0,1),{kind:'flower',w:0.9,h:0.9,sway:1}),Object.assign(cell(1,1),{kind:'fern',w:1.1,h:1.2,sway:0.6})];}
