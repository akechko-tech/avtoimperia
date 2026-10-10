/* ================= 0.30: ДУЭЛЬ В 3D — железная дорога вдоль шоссе, поезд, биплан, рысак в качалке ================= */
/* ---------- железная дорога: насыпь со щебнем, шпалы, рельсы, телеграф; станции у старта и финиша ---------- */
function r3dDxRail(T){const D=T.dxRail;if(!D)return [];const out=[],P=D.P,W=T.W,CH=300;let mb=null,c0=0,cx=0,cz=0,cn=0;
  const flush=()=>{if(mb&&mb.n){const m=g3Mesh(mb);if(m)out.push({m,c:[cx/cn,0,cz/cn]});}mb=new MB();cx=cz=cn=0;};flush();
  for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,tx=dx/l,tz=dz/l,sx=tz,sz=-tx,road=Math.abs(a[5])<W/2+2.5&&Math.abs(b[5])<W/2+2.5;
    if(a[3]-c0>CH){flush();c0=a[3];}cx+=a[0];cz+=a[2];cn++;
    const Q=(p,o,dy)=>[p[0]+sx*o,p[1]+(dy||0),p[2]+sz*o];
    if(!road){// насыпь: щебень сверху и откосы до земли
      mb.e[3]=txLay('gravel',1);mb.poly([Q(a,-1.8,0),Q(b,-1.8,0),Q(b,1.8,0),Q(a,1.8,0)],[0,1,0],[150,146,138],MID.stone);
      [-1,1].forEach(sd=>{const A0=Q(a,sd*1.8,0),B0=Q(b,sd*1.8,0),A1=Q(a,sd*3.2,-0.75),B1=Q(b,sd*3.2,-0.75);mb.poly(sd>0?[A0,B0,B1,A1]:[A0,A1,B1,B0],[sx*sd*0.5,0.85,sz*sd*0.5],[128,124,116],MID.stone);});mb.e[3]=0;
      // шпалы
      mb.e[3]=txLay('planks',1);for(let q=0;q<l;q+=0.8){const p=[a[0]+tx*q,a[1]+(b[1]-a[1])*q/l+0.02,a[2]+tz*q];pBox(mb,p[0],p[1],p[2],1.3,0.12,0.11,'#5e5042',MID.wood,Math.atan2(sx,sz));}mb.e[3]=0;}
    // рельсы: головка (сверху светлая, натёртая колёсами) и бок
    [-0.72,0.72].forEach(o=>{const h=road?0.005:0.14,A=Q(a,o,h),B=Q(b,o,h);mb.poly([[A[0]-sx*0.035,A[1]+0.06,A[2]-sz*0.035],[B[0]-sx*0.035,B[1]+0.06,B[2]-sz*0.035],[B[0]+sx*0.035,B[1]+0.06,B[2]+sz*0.035],[A[0]+sx*0.035,A[1]+0.06,A[2]+sz*0.035]],[0,1,0],[168,164,158],MID.metal);
      mb.poly([[A[0]+sx*0.035,A[1],A[2]+sz*0.035],[B[0]+sx*0.035,B[1],B[2]+sz*0.035],[B[0]+sx*0.035,B[1]+0.06,B[2]+sz*0.035],[A[0]+sx*0.035,A[1]+0.06,A[2]+sz*0.035]],[sx,0,sz],[70,62,56],MID.metal);});
    // телеграф вдоль дороги: столбы с перекладиной через 48 м, с внешней стороны
    if(!road&&Math.floor(a[3]/48)!==Math.floor(b[3]/48)){const sd=Math.sign(a[5])||1,p=Q(a,sd*4.2,-0.3);pTrunk(mb,p[0],p[1],p[2],p[0],p[1]+6.4,p[2],0.1,0.08,'#6a5440',6,MID.wood);pBox(mb,p[0],p[1]+5.9,p[2],0.9,0.1,0.06,'#5a4632',MID.wood,Math.atan2(sx,sz));}}
  flush();
  // станции: вокзал у старта и у финиша (кирпичный дом с черепицей, платформа, фонари)
  {const mb2=new MB();[[D.sStart,'s'],[D.sFin,'f']].forEach(([s,kk])=>{const q=dxPathAt(D,s),fw=[q.tx,q.tz],sd=Math.sign(dxSideAt(D,s))||1,nx=fw[1]*sd,nz=-fw[0]*sd,a=Math.atan2(nx,nz);
      const pc=[q.x+nx*4.4,q.y-0.1,q.z+nz*4.4];mb2.e[3]=txLay('gravel',1);pBox(mb2,pc[0],pc[1]-0.3,pc[2],1.6,0.6,26,'#b9b1a2',MID.stone,a+Math.PI/2);mb2.e[3]=0;
      const hc=[q.x+nx*10,q.y-0.3,q.z+nz*10];mb2.e[3]=txLay('brick_wall',1);pBox(mb2,hc[0],hc[1],hc[2],7,4.2,3.4,'#9a5a44',MID.wall,a+Math.PI/2);mb2.e[3]=0;
      mb2.e[3]=txLay('roof_tiles',1);pBox(mb2,hc[0],hc[1]+4.2,hc[2],7.6,0.9,4.0,'#8a4636',MID.roof,a+Math.PI/2);mb2.e[3]=0;
      for(let z=-20;z<=20;z+=10){const L=[pc[0]+fw[0]*z+nx*0.9,pc[1],pc[2]+fw[1]*z+nz*0.9];pTrunk(mb2,L[0],L[1],L[2],L[0],L[1]+3.6,L[2],0.06,0.05,'#2b2c30',6,MID.metal);mb2.e[1]=4;pBox(mb2,L[0],L[1]+3.55,L[2],0.14,0.26,0.14,'#fff0c0',MID.glass);mb2.e[1]=0;}});
    const m=g3Mesh(mb2);if(m)out.push({m,c:null});}
  return out;}
function dxSideAt(D,s){const P=D.P;let k=0;while(k<P.length-1&&P[k][3]<s)k++;return P[k][5];}
/* ---------- аэроплан: биплан эпохи (крылья из полотна, стойки и расчалки, ротативный мотор, деревянный винт) ---------- */
function dxPlaneMesh(y){const C=G3.cache;if(C.dxPlane)return C.dxPlane;const mb=new MB(),pr=new MB(),can='#d9cfb2',wd='#a07a4c',dk='#3a3430';
  // фюзеляж: клин от мотора к хвосту
  mb.e[3]=txLay('wood_wall',1);for(let k=0;k<6;k++){const z0=1.0-k*0.95,z1=z0-0.95,w0=0.42*(1-k*0.13),w1=0.42*(1-(k+1)*0.13),h0=0.55*(1-k*0.11),h1=0.55*(1-(k+1)*0.11),y0=1.9;
    const P=(w,h,z,sx,sy)=>[sx*w,y0+sy*h,z];
    mb.poly([P(w1,h1,z1,-1,1),P(w1,h1,z1,1,1),P(w0,h0,z0,1,1),P(w0,h0,z0,-1,1)],[0,1,0],hex2rgb(can),MID.cloth);
    mb.poly([P(w1,h1,z1,1,-1),P(w1,h1,z1,-1,-1),P(w0,h0,z0,-1,-1),P(w0,h0,z0,1,-1)],[0,-1,0],hex2rgb(can),MID.cloth);
    mb.poly([P(w1,h1,z1,1,1),P(w1,h1,z1,1,-1),P(w0,h0,z0,1,-1),P(w0,h0,z0,1,1)],[1,0,0],hex2rgb(can),MID.cloth);
    mb.poly([P(w1,h1,z1,-1,-1),P(w1,h1,z1,-1,1),P(w0,h0,z0,-1,1),P(w0,h0,z0,-1,-1)],[-1,0,0],hex2rgb(can),MID.cloth);}mb.e[3]=0;
  // капот мотора (круглый, металлический) и кабина с головой пилота в кожаном шлеме
  pCyl(mb,[0,1.9,1.0],[0,1.9,1.75],0.48,0.46,'#8a8c90',16,MID.metal);pCyl(mb,[0,1.9,1.75],[0,1.9,1.82],0.46,0.2,'#5a5c60',16,MID.metal);
  pCyl(mb,[0,2.42,-0.15],[0,2.62,-0.15],0.17,0.16,'#4a3424',10,MID.leather);pBlob(mb,0,2.72,-0.15,0.13,0.15,0.14,'#5a3e2a',DXJ,0,MID.leather);
  pBox(mb,0,2.45,0.25,0.3,0.12,0.02,'#d6e4ea',MID.glass);
  // крылья: верхнее 9,6 м, нижнее 8,4 м; полотно на нервюрах (полосы чуть темнее)
  const wing=(y,span,ch,z)=>{mb.e[3]=0;mb.poly([[-span/2,y,z+ch/2],[span/2,y,z+ch/2],[span/2,y,z-ch/2],[-span/2,y,z-ch/2]],[0,1,0],hex2rgb(can),MID.cloth);
    mb.poly([[-span/2,y-0.04,z-ch/2],[span/2,y-0.04,z-ch/2],[span/2,y-0.04,z+ch/2],[-span/2,y-0.04,z+ch/2]],[0,-1,0],cMul(hex2rgb(can),0.85),MID.cloth);mb.e[3]=0;
    pBox(mb,0,y-0.04,z+ch/2,span/2,0.04,0.03,wd,MID.wood);
    for(let x=-span/2;x<=span/2+0.01;x+=0.8)pBox(mb,x,y,z,0.012,0.012,ch/2,'#b8ae92',MID.cloth);};
  wing(3.25,9.6,1.55,0.35);wing(1.45,8.4,1.45,0.3);
  // стойки между крыльями и расчалки
  [-3.6,-1.6,1.6,3.6].forEach(x=>[0.85,-0.2].forEach(z=>pTrunk(mb,x,1.45,z,x,3.22,z,0.03,0.03,wd,4,MID.wood)));
  [-3.6,3.6].forEach(x=>{pTrunk(mb,x,1.45,0.85,x*0.45,3.22,-0.2,0.008,0.008,'#9a9ca0',3,MID.metal);pTrunk(mb,x,3.22,0.85,x*0.45,1.45,-0.2,0.008,0.008,'#9a9ca0',3,MID.metal);});
  // хвост: стабилизатор, киль и руль поворота
  mb.e[3]=0;mb.poly([[-1.6,2.05,-4.5],[1.6,2.05,-4.5],[1.1,2.05,-5.4],[-1.1,2.05,-5.4]],[0,1,0],hex2rgb(can),MID.cloth);
  mb.poly([[-1.1,2.0,-5.4],[1.1,2.0,-5.4],[1.6,2.0,-4.5],[-1.6,2.0,-4.5]],[0,-1,0],cMul(hex2rgb(can),0.85),MID.cloth);
  [1,-1].forEach(sd=>mb.poly(sd>0?[[0,2.05,-4.6],[0,3.1,-5.3],[0,3.0,-5.75],[0,2.05,-5.75]]:[[0,2.05,-4.6],[0,2.05,-5.75],[0,3.0,-5.75],[0,3.1,-5.3]],[sd,0,0],hex2rgb(can),MID.cloth));mb.e[3]=0;
  // шасси: V-стойки и два колеса
  [-1,1].forEach(sd=>{pTrunk(mb,sd*0.35,1.45,0.9,sd*0.85,0.42,0.6,0.025,0.025,wd,4,MID.wood);pTrunk(mb,sd*0.35,1.45,0.2,sd*0.85,0.42,0.6,0.025,0.025,wd,4,MID.wood);
    pCyl(mb,[sd*0.8,0.42,0.6],[sd*0.95,0.42,0.6],0.42,0.42,'#1d1d1f',14,MID.matte);});pTrunk(mb,-0.85,0.42,0.6,0.85,0.42,0.6,0.02,0.02,'#5a5c60',4,MID.metal);
  pTrunk(mb,0,1.6,-5.2,0,1.1,-5.5,0.02,0.02,wd,4,MID.wood);// костыль
  // винт: две лопасти (отдельная модель — крутится)
  pr.e[3]=txLay('planks',1);[1,-1].forEach(sd=>pr.poly([[0,0.05,0],[sd*1.25,0.12,0.02],[sd*1.3,-0.02,0.02],[0,-0.05,0]],[0,0,1],hex2rgb('#8a5a32'),MID.wood));pr.e[3]=0;
  [1,-1].forEach(sd=>pr.poly([[0,0.05,0],[0,-0.05,0],[sd*1.3,-0.02,0.02],[sd*1.25,0.12,0.02]],[0,0,-1],hex2rgb('#7a4a28'),MID.wood));
  pCyl(pr,[0,0,-0.05],[0,0,0.12],0.08,0.05,'#6a6c70',8,MID.metal);
  return C.dxPlane={m:g3Mesh(mb),p:g3Mesh(pr),pz:1.86,py:1.9};}
/* ---------- рысак в качалке: корпус, шея и голова, хвост; четыре ноги (каждая — своя модель, качается), качалка с ездоком ---------- */
function dxHorseMesh(y){const C=G3.cache;if(C.dxHorse)return C.dxHorse;const body=new MB(),leg=new MB(),sulk=new MB(),wh=new MB(),bay='#5c3a22',blk='#1e1814';
  // корпус — вытянутый эллипсоид, грудь, круп; шея вверх-вперёд, голова, уши, грива
  pBlob(body,0,1.32,0,0.36,0.38,0.95,bay,DXJ,0,MID.skin);pBlob(body,0,1.36,0.62,0.33,0.36,0.32,bay,DXJ,0,MID.skin);pBlob(body,0,1.36,-0.62,0.36,0.37,0.34,bay,DXJ,0,MID.skin);
  pTrunk(body,0,1.5,0.8,0,2.05,1.25,0.2,0.13,bay,10,MID.skin);pBlob(body,0,2.1,1.38,0.12,0.13,0.3,bay,DXJ,0,MID.skin);pBlob(body,0,2.02,1.6,0.09,0.09,0.12,'#3a2618',DXJ,0,MID.skin);
  [-1,1].forEach(sd=>pCone(body,sd*0.07,2.2,1.28,0.035,0.14,blk,6,0,MID.skin));pBox(body,0,1.85,1.0,0.03,0.42,0.28,blk,MID.cloth,0);
  pTrunk(body,0,1.45,-0.95,0,0.8,-1.25,0.08,0.04,blk,6,MID.cloth);
  // упряжь: хомут и седёлка (кожа)
  pTrunk(body,-0.3,1.62,0.55,0.3,1.62,0.55,0.05,0.05,'#2a1e16',6,MID.leather);pBox(body,0,1.68,-0.1,0.34,0.06,0.16,'#2a1e16',MID.leather);
  // нога: бедро и голень с копытом; ось вращения — верх (0,0,0), вниз по -y
  pTrunk(leg,0,0,0,0,-0.55,0.02,0.09,0.06,bay,8,MID.skin);pTrunk(leg,0,-0.55,0.02,0,-1.02,0,0.05,0.045,blk,8,MID.skin);pCyl(leg,[0,-1.02,0],[0,-1.1,0.02],0.065,0.07,'#141210',8,MID.matte);
  // качалка: оглобли вдоль боков, сиденье, ездок в шёлке
  [-1,1].forEach(sd=>pTrunk(sulk,sd*0.5,1.2,1.0,sd*0.55,1.05,-2.1,0.025,0.025,'#6a4a2a',5,MID.wood));pTrunk(sulk,-0.6,1.0,-2.1,0.6,1.0,-2.1,0.025,0.025,'#4a4c50',5,MID.metal);
  pBox(sulk,0,1.05,-2.35,0.22,0.08,0.2,'#3a2a1c',MID.leather);
  {const M=new Mesh();MLOD=1;mCrew3(M,0,1.0,-2.45,{coat:'#b8322a',hat:'#f2eee4',cap:'cap'},false,{num:3,mq:'horse',y},[0,1.55,-1.7]);MLOD=1;mbFromMesh(sulk,M,{lift:0.004});}
  // колесо качалки (спицы), отдельно — крутится
  pCyl(wh,[0,0,0],[0.05,0,0],0.7,0.7,'#202022',20,MID.matte,false);pCyl(wh,[0.05,0,0],[0,0,0],0.66,0.66,'#2a2a2c',20,MID.matte,false);pCyl(wh,[-0.04,0,0],[0.09,0,0],0.07,0.07,'#6a6c70',8,MID.metal);for(let k=0;k<12;k++){const a=k/12*Math.PI*2;pTrunk(wh,0.025,0,0,0.025,Math.sin(a)*0.66,Math.cos(a)*0.66,0.008,0.008,'#9a9ca0',3,MID.metal);}
  return C.dxHorse={b:g3Mesh(body),l:g3Mesh(leg),s:g3Mesh(sulk),w:g3Mesh(wh)};}
/* ---------- кадр: рисуем соперника ---------- */
const DXJ=()=>0.5;
const DXM=new Float32Array(16),DXM2=new Float32Array(16),DXR=new Float32Array(16);
function r3dDxDraw(E,bw,bh,dt){const D=R.dx;if(!D)return;const gl=G3.gl,T=R3.T;let P=null;const use=()=>{if(!P){P=r3dUse('lit',E,bw,bh);gl.uniform4f(P.u.u_lamp,0,0,E.lamp,0);}return P;};
  // рельсы — кусками, только рядом с камерой
  if(R3.dxRail&&R3.dxRail.length){use();gl.uniformMatrix4fv(P.u.u_model,false,m4());R3.dxRail.forEach(o=>{if(o.c&&Math.hypot(o.c[0]-R3.eye[0],o.c[2]-R3.eye[2])>900)return;g3Draw(o.m);});}
  const dEye=Math.hypot(D.pos[0]-R3.eye[0],D.pos[2]-R3.eye[2]);if(dEye>1100)return;
  if(D.k==='train'){const TM=r3dTrainMesh(R.rc.y);use();let off=0;const sp=D.s0+D.s;
    TM.cars.forEach((c,k)=>{const s=sp-(off+c.len/2);off+=c.len+0.6;const q=dxPathAt(D.P,s);const fw=[q.tx,0,q.tz],rt=[fw[2],0,-fw[0]];m4basis(DXM,rt,[0,1,0],fw,[q.x,q.y+0.14,q.z]);gl.uniformMatrix4fv(P.u.u_model,false,DXM);g3Draw(c.m);});
    // дым из трубы: на ходу — тёмный шлейф, у полустанка — белый пар
    D.smk=(D.smk||0)+dt*(D.v>1?6:2.5);while(D.smk>1){D.smk-=1;const q=dxPathAt(D.P,sp-4.6+2.85),moving=D.v>1;r3dPart(q.x,q.y+4.2,q.z,(Math.random()-0.5)*0.6-q.tx*D.v*0.5,1.6+Math.random()*1.2,(Math.random()-0.5)*0.6-q.tz*D.v*0.5,1.1,moving?4.5:3,moving?3.2:2.2,moving?[64,64,66]:[232,232,232],moving?0.42:0.35);}
    return;}
  if(D.k==='plane'){const PM=dxPlaneMesh(R.rc.y);use();const q=dxPathAt(D.P,((D.s0+D.s)%D.lapL+D.lapL)%D.lapL),q2=dxPathAt(D.P,((D.s0+D.s+6)%D.lapL+D.lapL)%D.lapL);
    const fw=v3n([q.tx,(D.altV||0)*0.08,q.tz]),cross=q.tx*q2.tz-q.tz*q2.tx,bank=clamp(-cross/6*D.v*D.v/9.81*0.9,-0.7,0.7)*(D.alt>8?1:0);D.bank=(D.bank||0)+(bank-(D.bank||0))*Math.min(1,dt*2);
    const up0=[0,1,0],rt0=v3n(v3x(up0,fw)),cb=Math.cos(D.bank),sb=Math.sin(D.bank),rt=[rt0[0]*cb+up0[0]*sb,rt0[1]*cb+up0[1]*sb,rt0[2]*cb+up0[2]*sb],up=v3x(fw,rt);
    const gy=D.alt>0.5?q.y+D.alt:q.y;m4basis(DXM,rt,up,fw,[q.x,gy,q.z]);gl.uniformMatrix4fv(P.u.u_model,false,DXM);g3Draw(PM.m);
    // винт крутится: поворот вокруг продольной оси в носу
    D.prop=(D.prop||0)+dt*(D.v>0.5?62:8);const c=Math.cos(D.prop),s=Math.sin(D.prop);DXR.set([c,s,0,0,-s,c,0,0,0,0,1,0,0,PM.py,PM.pz,1]);m4mul(DXM2,DXM,DXR);gl.uniformMatrix4fv(P.u.u_model,false,DXM2);g3Draw(PM.p);
    // выхлоп ротативного мотора — касторовое масло, сизый дымок
    if(D.v>2&&Math.random()<dt*8){const ex=[q.x+fw[0]*1.4,gy+1.6,q.z+fw[2]*1.4];r3dPart(ex[0],ex[1],ex[2],-fw[0]*3,0.2,-fw[2]*3,0.25,1.2,1.2,[150,150,160],0.18);}
    return;}
  if(D.k==='horse'){const HM=dxHorseMesh(R.rc.y);use();const q=dxPathAt(D.P,((D.s0+D.s)%D.lapL+D.lapL)%D.lapL),fw=[q.tx,0,q.tz],rt=[fw[2],0,-fw[0]];
    m4basis(DXM,rt,[0,1,0],fw,[q.x,q.y,q.z]);
    // рысь: диагональные пары ног вместе; шаг ~2,7 м на цикл; корпус чуть подпрыгивает
    D.ph=(D.ph||0)+D.v*dt/2.7*Math.PI*2;const bob=Math.abs(Math.sin(D.ph))*0.05*Math.min(1,D.v/6);DXM[13]+=bob;
    gl.uniformMatrix4fv(P.u.u_model,false,DXM);g3Draw(HM.b);g3Draw(HM.s);
    const legs=[[0.17,1.12,0.62,0],[-0.17,1.12,0.62,Math.PI],[0.17,1.12,-0.62,Math.PI],[-0.17,1.12,-0.62,0]];
    legs.forEach(([x,yy,z,ph0])=>{const a=Math.sin(D.ph+ph0)*0.42*Math.min(1,D.v/5),c=Math.cos(a),s=Math.sin(a);DXR.set([1,0,0,0,0,c,s,0,0,-s,c,0,x,yy,z,1]);m4mul(DXM2,DXM,DXR);gl.uniformMatrix4fv(P.u.u_model,false,DXM2);g3Draw(HM.l);});
    D.wh=(D.wh||0)+D.v*dt/0.7;[-1,1].forEach(sd=>{const c=Math.cos(D.wh),s=Math.sin(D.wh);DXR.set([1,0,0,0,0,c,s,0,0,-s,c,0,sd*0.62-(sd>0?0:0.05),0.7,-2.1,1]);m4mul(DXM2,DXM,DXR);gl.uniformMatrix4fv(P.u.u_model,false,DXM2);g3Draw(HM.w);});
    // пыль из-под копыт
    if(D.v>3&&Math.random()<dt*10)r3dPart(q.x-fw[0]*0.4,q.y+0.1,q.z-fw[2]*0.4,-fw[0]*1.5+(Math.random()-0.5),0.4,-fw[2]*1.5+(Math.random()-0.5),0.5,1.6,1.1,[176,150,112],0.22);}}
