/* ================= 0.37: АЭРОПЛАН В 3D — СЕТКА ПО КОНСТРУКЦИИ =================
   Размах и хорда — из площади крыла (расчёт 105h-air.js), длина — по размаху; схема решает, где мотор, сколько крыльев,
   есть ли балки хвоста (толкающие), лодка, поплавки; кабина, пулемёты, бомбы, знаки страны в войну. Ось z — вперёд, y — вверх, x — вправо.
   Геометрия (air3dGeo) общая для картинки и физики: где колёса и костыль (угол стоянки), где винты и глаза пилота. */
const AIR3D_CACHE=new Map(),AIR3G_CACHE=new Map();
function air3dKey(md,y,c){return [md.f,md.m,md.e,md.n||1,md.g,md.a,md.k,md.w,md.role,md.paint,Math.floor(y),c||''].join('|');}
function air3dGeo(md,y){const key=[md.f,md.m,md.e,md.n||1,md.g,md.a,md.k,md.w,md.role,md.p,Math.floor(y*4)].join('|');let G=AIR3G_CACHE.get(key);if(G)return G;
  const A=airAero(md,y),P=A.P,f=P.f.id,nW=f==='ft'?3:['fm','fr','fk'].includes(f)?1:2,big=f==='fx'||f==='fw'||(f==='fk'&&(P.k.seats>4||A.n>1));
  const wS=A.S/nW,b=Math.max(5,Math.sqrt(wS*P.f.ar)*(nW===2?1.03:1)),ch=wS/b;
  const L=f==='fp'||f==='fc'?Math.max(7,b*0.82):f==='fw'?clamp(b*0.62+3,8,22):nW>=2?clamp(b*0.68+0.8,5,24):clamp(b*0.74+1.6,5.2,24);
  const fwd=big?clamp(Math.sqrt(A.W)/30,1.3,2.6):clamp(0.62+A.W/3500,0.7,1.15),fh=big?fwd*1.25:fwd*1.18,gap=clamp(ch*1.05,1.2,2.6),e=P.e,hp=e.hp;
  G={A,P,f,nW,big,b,ch,L,fwd,fh,gap,n:A.n,props:[],sea:!!(P.g.sea||P.f.boat)};
  // угол стоянки на трёх точках — чуть меньше критического угла крыла: аэроплан отрывается сам, когда хватает скорости
  const CLa=2*Math.PI*A.ar/(A.ar+2),gpD=clamp(-0.035+A.clm/CLa-0.04,0.14,0.24);
  let gearY,wheelZ,skidY,skidZ;
  if(f==='fp'||f==='fc'){const uy=gap*0.55+0.2,ly=-gap*0.45+0.2,zl=ch*0.45,tz=-L*0.62,ez=zl-ch-0.1,ey=(uy+ly)/2-0.05;Object.assign(G,{lay:'push',uy,ly,zl,tz,ez,ey});
    if(f==='fp'){G.nz0=zl+0.2;G.nz1=zl+2.6;G.eye=[0,ly+0.95,G.nz1-0.6];G.props.push({x:0,y:ey,z:ez-0.75,r:clamp(1.1+hp/150,1.2,1.6),dir:1,push:1});G.zNose=G.nz1+0.4;}
    else{G.eye=[0.3,ly+0.55,zl-0.2];G.props.push({x:1.3,y:ey+0.1,z:zl-ch-0.25,r:1.25,dir:1,push:1},{x:-1.3,y:ey+0.1,z:zl-ch-0.25,r:1.25,dir:-1,push:1});G.zNose=zl+3.6;}
    if(P.g.rail){gearY=0.935-ly;wheelZ=1;skidY=gearY;skidZ=-1;}
    else if(P.g.sea){gearY=1.44-ly;wheelZ=zl-0.3;skidY=gearY;skidZ=-L*0.5;}
    else{gearY=1.48-ly;wheelZ=zl-0.35;skidZ=tz+0.3;skidY=Math.max(-ly+0.25,gearY-Math.tan(gpD)*(wheelZ-skidZ));}}
  else if(f==='fw'){const ly=0.4,uy=ly+gap;Object.assign(G,{lay:'boat',ly,uy,zl:ch*0.4,hl:L*0.95});G.zNose=G.hl*0.42+0.6;
    for(let i=0;i<Math.max(1,A.n);i++){const ex=A.n>1?(i?-1:1)*clamp(b*0.12,1.6,3):0;G.props.push({x:ex,y:(uy+ly)/2+0.1,z:0.85,r:clamp(1.2+hp/400,1.2,2),dir:i?-1:1});}
    G.eye=[0.35,0.5,G.hl*0.42-0.6];gearY=1.05;wheelZ=0;skidY=1.05;skidZ=-1;}
  else{const zn=L*0.33,zt=-L*0.67,zf=zn+(e.cool==='r'?0.5:e.cool==='a'?0.3:0.56),zc=zn-(big?2.6:1.7),zl=(big?0.4:0.25)+ch*0.35;Object.assign(G,{lay:'pull',zn,zt,zf,zc,zl});G.zNose=zf+0.2;
    const pr=clamp(1.05+Math.sqrt(hp)/18,1.1,f==='fr'?1.4:1.9),wingEng=(f==='fx'||f==='fk')&&A.n>1,nose=!wingEng||A.n%2===1;G.noseEng=nose;
    if(nose)G.props.push({x:0,y:0,z:zf+0.12,r:pr,dir:1});
    if(wingEng){const per=Math.floor(A.n/2),hi=f==='fk'&&P.m.id!=='m4';for(const sd of [1,-1])for(let j=0;j<per;j++){const ex=sd*clamp(b*(f==='fk'?0.13:0.12+j*0.1),1.8,6),ey=f==='fk'?(hi?fh*0.55-0.75:-fh*0.38+0.1):fh*0.5+gap*0.37+0.1;
      G.props.push({x:ex,y:ey,z:zl+(f==='fk'?0.95:0.25),r:clamp(1+hp/350,1,1.8),dir:sd,eng:[ex,ey,zl+(f==='fk'?0.3:-0.4)]});}}
    G.eye=P.k.closed?[0,fh*0.42,zc+0.6]:f==='fr'?[0,fh*0.62,zc-0.2]:[0,fh*0.62+0.12,zc];
    if(!G.sea){const r=clamp(0.3+A.W/9000,0.32,0.75),gy=-fh*0.5-(big?1.4:0.95);G.wheelR=r;G.gy=gy;G.gz=zn-(big?2.4:1.35);gearY=-(gy-r);wheelZ=G.gz;skidZ=zt+0.8;skidY=Math.max(0.25,gearY-Math.tan(gpD)*(wheelZ-skidZ));}
    else{const yy=-fh*0.5-1.25;G.floatY=yy;gearY=-(yy-0.24);wheelZ=zn-1.8;skidY=gearY;skidZ=-L*0.5;}}
  const gp=clamp(Math.atan2(gearY-skidY,Math.max(0.5,wheelZ-skidZ)),0,0.3);
  G.gear={gearY,wheelZ,skidY,skidZ,gp,span:b,len:L,zNose:G.zNose,propA:G.props.reduce((a,p)=>a+Math.PI*p.r*p.r,0)};
  if(AIR3G_CACHE.size>200)AIR3G_CACHE.clear();AIR3G_CACHE.set(key,G);return G;}
function air3dGear(md,y){return air3dGeo(md,y).gear;}
// матрица винта: поворот вокруг оси винта в его точке (в осях аэроплана M)
function air3dPropMat(o,M,pp,ang){const c=Math.cos(ang),s=Math.sin(ang),L=m4();L[0]=c;L[1]=s;L[4]=-s;L[5]=c;L[12]=pp.x;L[13]=pp.y;L[14]=pp.z;return m4mul(o,M,L);}
function air3dMesh(md,y,c){const key=air3dKey(md,y,c);if(AIR3D_CACHE.has(key))return AIR3D_CACHE.get(key);
  const G=air3dGeo(md,y),{A,P,f,nW,big,b,L,fwd,fh,gap}=G,ch=G.ch,mb=new MB(),pr=new MB(),dc=new MB(),pm=new MB();
  // полотно под лаком на солнце слепит — в 3D чуть темнее, чем на рисунке
  const col=md.paint||'#d9cfb2',c0=cMul(hex2rgb(col),col==='#d9cfb2'?0.84:0.95),colD=cMul(c0,0.8),colU=cMul(c0,0.9),wood='#8a5a32',metal='#7d8186',tyre='#1b1b1c',leather='#4a3424';
  const mil=['recon','fight','bomb','sea'].includes(md.role),mk=AIR_MARK[airMarkKey(c||'fr',y)]||AIR_MARK.fr,marked=mil&&y>=1914.6,mono=P.m.id==='m3'||P.m.id==='m5',metalSkin=P.m.id==='m4'||P.m.id==='m5';
  const skinM=metalSkin?MID.metal:mono?MID.paint:MID.cloth,lod=1,R5=()=>0.5;
  // знак: кокарда (кольца), крест или звезда; n — куда смотрит поверхность
  const disk=(x,yy,z,r,n)=>{const Q=(dx,dz,off)=>n[1]!==0?[x+dx,yy+n[1]*off,z+dz]:[x+n[0]*off,yy+dz,z+dx];
    if(mk.cross){const a=r*0.95,w=r*0.3;mb.poly([Q(-a,-a,0.004),Q(a,-a,0.004),Q(a,a,0.004),Q(-a,a,0.004)],n,hex2rgb('#f4f2ea'),MID.paint);
      mb.poly([Q(-w,-a*0.9,0.008),Q(w,-a*0.9,0.008),Q(w,a*0.9,0.008),Q(-w,a*0.9,0.008)],n,hex2rgb('#141414'),MID.paint);mb.poly([Q(-a*0.9,-w,0.008),Q(a*0.9,-w,0.008),Q(a*0.9,w,0.008),Q(-a*0.9,w,0.008)],n,hex2rgb('#141414'),MID.paint);return;}
    if(mk.star){const pts=[];for(let k=0;k<10;k++){const a=k/10*6.2832-Math.PI/2,rr=k%2?r*0.4:r;pts.push(Q(Math.cos(a)*rr,Math.sin(a)*rr,0.006));}
      const cc=hex2rgb('#c8102e');for(let k=0;k<10;k+=2){mb.poly([Q(0,0,0.006),pts[(k+9)%10],pts[k],pts[k+1]],n,cc,MID.paint);}return;}
    mk.ring.forEach((cc,i)=>{const rr=r*(1-i*0.33),pts=[];for(let k=0;k<18;k++){const a=k/18*6.2832;pts.push(Q(Math.cos(a)*rr,Math.sin(a)*rr,0.004*(i+1)));}mb.poly(pts,n,hex2rgb(cc),MID.paint);});};
  // крыло: профиль с изгибом и толщиной, нервюры полосками; x0..x1 — по размаху от оси, z — передняя кромка, yy — высота, dih — поперечное V
  // 0.39: рули и колёса — отдельными деталями, чтобы двигались (элероны, руль высоты, руль направления — за ручкой; колёса крутятся на разбеге)
  const WL=[],RUD={},WH=[];let inTail=false;
  const wing=(x0,x1,z,yy,cc,th,dih,mark)=>{const S=8,tt=th||Math.max(0.06,cc*0.07),dh=dih||0;WL.push({x0,x1,z,yy,cc,tt,dh,tail:inTail,col:c0,colD});
    const prof=k=>[[z,0],[z-cc*0.12,tt*0.85],[z-cc*0.35,tt],[z-cc*0.7,tt*0.55],[z-cc,0.01]][k];
    for(const sd of [-1,1]){for(let i=0;i<S;i++){const u0=i/S,u1=(i+1)/S,X0=sd*(x0+(x1-x0)*u0),X1=sd*(x0+(x1-x0)*u1),Y0=yy+Math.abs(X0)*dh,Y1=yy+Math.abs(X1)*dh,t1=i===S-1?0.82:1;
      for(let k=0;k<4;k++){const a=prof(k),q=prof(k+1);mb.poly([[X0,Y0+a[1],a[0]],[X1,Y1+a[1]*t1,a[0]],[X1,Y1+q[1]*t1,q[0]],[X0,Y0+q[1],q[0]]],[0,1,0.18*(2-k)],k%2?colU:c0,skinM);}
      mb.poly([[X0,Y0,z],[X0,Y0,z-cc],[X1,Y1,z-cc],[X1,Y1,z]],[0,-1,0],colD,skinM);
      if(!metalSkin)for(let r=1;r<4;r++){const xr=sd*(x0+(x1-x0)*(i+r/4)/S);mb.strip([xr,Y0+tt*0.92,z-cc*0.04],[xr,Y0+tt*0.6,z-cc*0.86],0.03,[0,1,0],colU,MID.cloth,0.006);}
      if(i===S-1)mb.poly([0,1,2,3,4].map(k=>{const q=prof(k);return [X1,Y1+q[1]*t1,q[0]];}),[sd,0,0],colD,skinM);}}
    if(mark&&marked){const xm=x1*0.74,zm=z-cc*0.47,rr=Math.min(cc*0.38,0.8);for(const sd of [-1,1]){const yb=yy+Math.abs(xm)*dh;disk(sd*xm,yb+tt*0.75,zm,rr,[0,1,0]);disk(sd*xm,yb-0.004,zm,rr,[0,-1,0]);}}};
  const strut=(a,q,w)=>mb.rod(a,q,w||0.07,hex2rgb(wood),MID.wood),wire=(a,q)=>mb.rod(a,q,0.014,hex2rgb('#8f9296'),MID.metal);
  const pilot=(x,yy,z)=>{pBlob(pm,x,yy+0.17,z,0.13,0.15,0.14,leather,R5,lod,MID.leather);pBlob(pm,x,yy+0.1,z+0.12,0.09,0.05,0.04,'#3a3a3a',R5,0,MID.glass);pCyl(pm,[x,yy-0.15,z],[x,yy+0.03,z],0.21,0.17,'#5b4632',8,MID.cloth);};
  const wheel=(x,yy,z,r)=>{WH.push({x,y:yy,z,r});};
  // мотор: ротативный (капот-кольцо и цилиндры), звезда, «Анзани»-веер, рядный (короб, патрубки)
  const engine=(x,yy,z,inl)=>{const e=P.e,R=clamp(0.28+Math.sqrt(e.hp)/40,0.32,0.75);
    if(e.cool==='r'){pCyl(mb,[x,yy,z-0.05],[x,yy,z+0.38],R*1.05,R*0.97,metal,18,MID.metal,false);pCyl(mb,[x,yy,z+0.3],[x,yy,z+0.4],R*0.6,R*0.45,'#3a3c40',14,MID.metal);
      for(let k=0;k<(e.hp>100?9:7);k++){const a=k/(e.hp>100?9:7)*6.2832;pCyl(mb,[x+Math.cos(a)*R*0.3,yy+Math.sin(a)*R*0.3,z+0.36],[x+Math.cos(a)*R*0.82,yy+Math.sin(a)*R*0.82,z+0.36],0.075,0.065,'#55585c',6,MID.metal);}}
    else if(e.cool==='a'){if(e.id==='a5'){for(const a of [1.57,0.6,2.55])pCyl(mb,[x,yy,z+0.1],[x+Math.cos(a)*R,yy+Math.sin(a)*R,z+0.1],0.1,0.08,'#55585c',8,MID.metal);pCyl(mb,[x,yy,z-0.1],[x,yy,z+0.25],0.15,0.15,metal,10,MID.metal);}
      else{pCyl(mb,[x,yy,z-0.15],[x,yy,z+0.2],R*0.45,R*0.45,'#4a4d50',12,MID.metal);const nc=e.hp>200?9:7;for(let k=0;k<nc;k++){const a=k/nc*6.2832;pCyl(mb,[x+Math.cos(a)*R*0.35,yy+Math.sin(a)*R*0.35,z+0.05],[x+Math.cos(a)*R,yy+Math.sin(a)*R,z+0.05],0.085,0.075,'#6b6f73',8,MID.metal);}}}
    else{pBox(mb,x,yy-R*0.55,z-0.25,R*0.6,R*1.1,0.62,inl?'#6b6f73':col,inl?MID.metal:skinM);if(!inl)pBox(mb,x,yy-R*0.5,z+0.39,R*0.55,R*1.0,0.03,'#2b2d30',MID.metal);
      for(let k=0;k<3;k++)pCyl(mb,[x+R*0.55,yy+0.12,z+0.2-k*0.3],[x+R*0.78,yy+0.45,z+0.2-k*0.3],0.045,0.04,'#3a3a3a',6,MID.metal);}};
  // хвост: стабилизатор с рулём высоты, киль с рулём направления (в войну — полосы цветов страны или крест)
  const tail=(z,yy,sc)=>{const s2=sc||1,hs=clamp(b*0.17,1.2,4.2)*s2,hc=clamp(ch*0.7,0.7,2.2)*s2;inTail=true;wing(0.05,hs,z+hc*0.6,yy,hc,0.04,0);inTail=false;
    const fh2=clamp(hc*1.1,0.8,2.6)*s2,rd=mk.rud&&marked,fin=[[0,yy,z+hc*0.4],[0,yy+fh2*0.75,z-hc*0.2],[0,yy+fh2,z-hc*0.55],[0,yy+fh2*0.95,z-hc*0.95],[0,yy-0.15,z-hc*0.95]];
    RUD.z=z-hc*0.95;RUD.y0=yy-0.1;RUD.y1=yy+fh2*0.9;RUD.c=hc*0.38;RUD.col=rd?hex2rgb('#ffffff'):c0;
    for(const sd of [1,-1])mb.poly(fin.map(p=>[p[0]+sd*0.025,p[1],p[2]]),[sd,0,0],rd?hex2rgb('#ffffff'):c0,skinM);
    if(rd){const z0=z-hc*0.95,zw=hc*0.42/3;mk.rud.forEach((cc,i)=>{for(const sd of [1,-1]){const za=z0+zw*(2-i),zb=za+zw;mb.poly([[sd*0.03,yy-0.12,za],[sd*0.03,yy-0.12,zb],[sd*0.03,yy+fh2*0.95,zb],[sd*0.03,yy+fh2*0.95,za]],[sd,0,0],hex2rgb(cc),MID.paint);}});}
    else if(marked&&(mk.cross||mk.star)){disk(0.035,yy+fh2*0.48,z-hc*0.55,Math.min(0.42,fh2*0.3),[1,0,0]);disk(-0.035,yy+fh2*0.48,z-hc*0.55,Math.min(0.42,fh2*0.3),[-1,0,0]);}};
  const floats=(zc,yy,gx)=>{const fl=clamp(L*0.62,3.5,9);for(const sd of [-1,1]){pBlob(mb,sd*gx,yy,zc-fl*0.35,0.3,0.24,fl*0.5,'#d6d2c4',R5,lod,MID.paint);strut([sd*gx,yy+0.2,zc],[sd*0.4,yy+1.1,zc+0.3]);strut([sd*gx,yy+0.2,zc-fl*0.55],[sd*0.4,yy+1.1,zc-fl*0.5]);}};
  if(G.lay==='push'){// толкающая этажерка (Фарман, Вуазен) и «утка» Райтов
    const {uy,ly,zl,tz,ez,ey}=G,bu=b,bl=b*(f==='fc'?1:0.92);
    wing(0.1,bu/2,zl,uy,ch,0.07,0.01,1);wing(0.1,bl/2,zl,ly,ch,0.07,0.005);
    for(const xs of [0.9,bu*0.24,bu*0.42])for(const sd of [-1,1]){strut([sd*xs,ly,zl-0.15],[sd*xs,uy,zl-0.15]);strut([sd*xs,ly,zl-ch+0.15],[sd*xs,uy,zl-ch+0.15]);wire([sd*xs,ly,zl-0.15],[sd*Math.min(bu*0.42,xs+bu*0.18),uy,zl-0.15]);}
    if(f==='fp'){const nz0=G.nz0,nz1=G.nz1;pBox(mb,0,ly-0.1,(nz0+nz1)/2,0.42,0.7,(nz1-nz0)/2,col,skinM);pBlob(mb,0,ly+0.25,nz1-0.1,0.42,0.38,0.45,col,R5,lod,skinM);
      pilot(0,ly+0.75,nz1-0.6);if(P.k.seats>1||P.a.obs)pilot(0,ly+0.75,nz1+0.15);
      if(P.a.obs)mb.rod([0,ly+0.95,nz1+0.35],[0,ly+1.1,nz1+1.2],0.05,hex2rgb('#2b2b2b'),MID.metal);
      if(y<1913){wing(0.05,1.3,nz1+2.6,ly+0.4,0.9,0.04,0);strut([0.5,ly+0.4,nz1+2.1],[0.4,ly,nz1]);strut([-0.5,ly+0.4,nz1+2.1],[-0.4,ly,nz1]);}}
    else{pilot(0.3,ly+0.35,zl-0.2);if(P.k.seats>1)pilot(-0.3,ly+0.35,zl-0.2);
      wing(0.05,1.6,zl+3.3,ly+0.55,0.9,0.04,0);wing(0.05,1.6,zl+3.3,ly+1.15,0.9,0.04,0);for(const sd of [-1,1]){strut([sd*1,ly+0.55,zl+2.9],[sd*0.5,ly,zl+0.4]);strut([sd*1,ly+1.15,zl+2.9],[sd*0.5,uy,zl]);}}
    engine(0,ey,ez-0.6,true);
    for(const sd of [-1,1]){mb.rod([sd*1.0,uy-0.05,zl-ch*0.6],[sd*0.45,ly+0.55,tz+0.4],0.05,hex2rgb(wood),MID.wood);mb.rod([sd*1.0,ly+0.05,zl-ch*0.6],[sd*0.45,ly+0.05,tz+0.4],0.05,hex2rgb(wood),MID.wood);}
    if(f==='fc'){const rz=tz+0.2;for(const sd of [1,-1])mb.poly([[sd*0.02,ly-0.2,rz+0.6],[sd*0.02,ly+1.6,rz+0.6],[sd*0.02,ly+1.6,rz-0.5],[sd*0.02,ly-0.2,rz-0.5]],[sd,0,0],c0,MID.cloth);}
    else{wing(0.05,1.5,tz+1.0,ly+0.55,1.1,0.04,0);wing(0.05,1.5,tz+1.0,ly+0.05,1.1,0.04,0);tail(tz+0.2,ly+0.05,0.8);if(!P.g.sea&&!P.g.rail)mb.rod([0,ly+0.05,tz+0.45],[0,-G.gear.skidY,G.gear.skidZ],0.05,hex2rgb(wood),MID.wood);}
    if(P.g.rail){for(const sd of [-1,1]){mb.rod([sd*0.6,ly-0.9,zl+2.8],[sd*0.6,ly-0.9,zl-ch-1.2],0.07,hex2rgb(wood),MID.wood);strut([sd*0.6,ly-0.9,zl-0.4],[sd*0.6,ly,zl-0.4]);}}
    else if(P.g.sea)floats(zl-0.3,ly-1.2,1.2);
    else{const gy=ly-1.15,r=0.33;for(const sd of [-1,1]){wheel(sd*0.75,gy,zl-0.35,r);strut([sd*0.75,gy,zl-0.35],[sd*0.6,ly,zl-0.1]);mb.rod([sd*0.6,gy-0.25,zl+1.6],[sd*0.6,gy-0.25,zl-1.4],0.06,hex2rgb(wood),MID.wood);strut([sd*0.6,gy-0.25,zl+1.3],[sd*0.6,ly,zl+0.2]);}}
    if(marked&&f==='fp'){disk(0.43,ly+0.25,G.nz1-1.2,0.28,[1,0,0]);disk(-0.43,ly+0.25,G.nz1-1.2,0.28,[-1,0,0]);}}
  else if(G.lay==='boat'){// летающая лодка: корпус с реданом, крылья над ним, моторы между крыльями
    const hl=G.hl,hw=fwd*0.9,hh=fh*0.9,z0=hl*0.42,z1=-hl*0.58,ly=G.ly,uy=G.uy;
    const ring=(z,w,h,yb)=>[[-w,yb,z],[w,yb,z],[w*1.05,yb+h*0.6,z],[w*0.9,yb+h,z],[-w*0.9,yb+h,z],[-w*1.05,yb+h*0.6,z]];
    const secs=[[z0+0.6,0.3,0.5,-0.4],[z0,hw*0.9,hh*0.9,-0.9],[z0*0.3,hw,hh,-1.05],[-0.2,hw,hh,-1.05],[-0.3,hw*0.95,hh*0.85,-0.85],[z1*0.6,hw*0.7,hh*0.7,-0.6],[z1,0.15,0.5,-0.2]];
    for(let i=0;i<secs.length-1;i++){const A1=ring(...secs[i]),B1=ring(...secs[i+1]);for(let k=0;k<6;k++){const k2=(k+1)%6;mb.poly([A1[k],A1[k2],B1[k2],B1[k]],v3n([(A1[k][0]+A1[k2][0])/2,(A1[k][1]+A1[k2][1])/2+0.6,0]),k===0?cMul(c0,0.55):c0,metalSkin?MID.metal:MID.paint);}}
    wing(0.2,b/2,ch*0.4,uy,ch,0.08,0.008,1);wing(0.6,b*0.46,ch*0.4,ly+0.1,ch,0.08,0.012);
    for(const xs of [b*0.2,b*0.38])for(const sd of [-1,1]){strut([sd*xs,ly+0.1,ch*0.25],[sd*xs,uy,ch*0.25]);strut([sd*xs,ly+0.1,ch*0.4-ch+0.2],[sd*xs,uy,ch*0.4-ch+0.2]);}
    G.props.forEach(p=>engine(p.x,p.y,0.2,false));tail(z1+1.4,0.9,1.15);pilot(0.35,0.25,z0-0.6);pilot(-0.35,0.25,z0-0.6);
    for(const sd of [-1,1])pBlob(mb,sd*b*0.4,ly-0.35,ch*0.1,0.35,0.22,0.9,col,R5,lod,MID.paint);
    if(marked){disk(hw*1.06,-0.3,z0*0.5,0.45,[1,0,0]);disk(-hw*1.06,-0.3,z0*0.5,0.45,[-1,0,0]);}}
  else{// тянущие схемы: фюзеляж, мотор в носу
    const {zn,zt,zc,zl}=G,fr=f==='fr',open=f==='fm'&&!mono&&!metalSkin;
    const sec=(z,w,h,yb)=>{const r=mono||fr||big?[[0,1],[0.7,0.92],[1,0.5],[0.85,0.1],[0,0],[-0.85,0.1],[-1,0.5],[-0.7,0.92]]:[[-1,1],[1,1],[1,0],[-1,0]];return r.map(([a,q])=>[a*w/2,yb+q*h,z]);};
    const prof=[[zn,fwd*0.92,fh*0.92,-fh*0.46],[zn-0.9,fwd,fh,-fh*0.5],[zn-2.2,fwd,fh*1.02,-fh*0.52],[zn*0.1-0.6,fwd*0.9,fh*0.95,-fh*0.48],[zt*0.45,fwd*0.62,fh*0.7,-fh*0.32],[zt*0.8,fwd*0.32,fh*0.42,-fh*0.12],[zt,0.12,0.3,0.05]];
    const skinC=cMul(hex2rgb(mono&&P.m.id==='m3'&&col==='#d9cfb2'?'#b07a45':col),col==='#d9cfb2'?0.86:0.95);
    for(let i=0;i<prof.length-1;i++){const A1=sec(...prof[i]),B1=sec(...prof[i+1]),K=A1.length;
      if(open&&i>=3){for(let k=0;k<K;k++)mb.rod(A1[k],B1[k],0.045,hex2rgb(wood),MID.wood);mb.rod(A1[0],B1[1],0.015,hex2rgb('#8f9296'),MID.metal);mb.rod(A1[3],B1[2],0.015,hex2rgb('#8f9296'),MID.metal);continue;}
      for(let k=0;k<K;k++){const k2=(k+1)%K,nn=v3n([(A1[k][0]+A1[k2][0])/2,(A1[k][1]+A1[k2][1])/2-(prof[i][3]+prof[i][2]/2),0.01]);mb.poly([A1[k],A1[k2],B1[k2],B1[k]],nn,k===0&&K===4?colU:skinC,skinM);}}
    if(metalSkin&&P.m.id==='m4')for(let i=0;i<14;i++){const z=zn-0.6-i*(zn-zt)/16;for(const sd of [1,-1])mb.strip([sd*fwd*0.505,-fh*0.45,z],[sd*fwd*0.505,fh*0.45,z],0.03,[sd,0,0],cMul(c0,0.82),MID.metal);}
    if(G.noseEng)engine(0,0,zn,false);else pBlob(mb,0,0,zn+0.2,fwd*0.46,fh*0.46,0.9,col,R5,lod,skinM);
    if(P.k.closed){const nw=P.k.seats>6?7:4;for(let i=0;i<nw;i++)for(const sd of [1,-1])mb.poly([[sd*fwd*0.51,0.05,zc-1.2-i*0.95],[sd*fwd*0.51,0.05,zc-0.6-i*0.95],[sd*fwd*0.51,0.45,zc-0.6-i*0.95],[sd*fwd*0.51,0.45,zc-1.2-i*0.95]],[sd,0,0],hex2rgb('#9fb8c6'),MID.glass);
      mb.poly([[-fwd*0.4,fh*0.5+0.02,zc+0.9],[fwd*0.4,fh*0.5+0.02,zc+0.9],[fwd*0.42,fh*0.32,zc+1.4],[-fwd*0.42,fh*0.32,zc+1.4]],[0,0.6,0.8],hex2rgb('#9fb8c6'),MID.glass);}
    else if(fr)pBlob(mb,0,fh*0.5,zc-0.2,0.24,0.22,0.55,'#9fb8c6',R5,lod,MID.glass);
    else{pilot(0,fh*0.42,zc);if(P.k.seats>1||P.a.obs)pilot(0,fh*0.42,zc-(big?2.4:1.15));pCyl(mb,[0,fh*0.5,zc+0.45],[0,fh*0.62,zc+0.55],0.22,0.2,'#c9d6dc',8,MID.glass,false);}
    tail(zt+(big?2.2:1.4),fh*0.2,big?1.35:1);
    if(f==='fm'||fr){const wy=fr?-fh*0.35:fh*0.18;wing(fwd*0.48,b/2,zl,wy,ch,fr?0.05:0.08,0.015,1);
      if(!fr){const ky=fh*0.5+1.0;strut([0.2,fh*0.5,zl-ch*0.3],[0,ky,zl-ch*0.3]);strut([-0.2,fh*0.5,zl-ch*0.3],[0,ky,zl-ch*0.3]);
        for(const sd of [-1,1])for(const xs of [b*0.22,b*0.4]){wire([0,ky,zl-ch*0.3],[sd*xs,wy+0.06,zl-ch*0.3]);wire([0,-fh*0.5-0.6,zl-ch*0.3],[sd*xs,wy,zl-ch*0.3]);}}}
    else if(f==='fk'){const hi=P.m.id!=='m4',wy=hi?fh*0.55:-fh*0.38;wing(0.15,b/2,zl+0.2,wy,ch,clamp(ch*0.13,0.18,0.55),hi?0.004:0.03,1);if(hi)for(const sd of [-1,1])strut([sd*fwd*0.5,-fh*0.4,zl-ch*0.35],[sd*b*0.18,wy,zl-ch*0.35]);
      G.props.forEach(p=>{if(!p.eng)return;engine(p.eng[0],p.eng[1],p.eng[2],false);if(hi)strut([p.eng[0],p.eng[1]-0.3,zl],[Math.sign(p.eng[0])*fwd*0.5,-fh*0.4,zl]);});}
    else{const rows=nW,uy=fh*0.5+(f==='ft'?gap*0.95:gap*0.75),stg=f==='fx'?0:0.35;
      for(let r=0;r<rows;r++){const yy=rows===3?uy-r*gap*0.95:r===0?uy:-fh*0.42,k=f==='fs'&&r===rows-1?0.55:1,span=r===0?b/2:b/2*(f==='fs'?0.92:0.97),z=zl+(r===0?stg:0)-(ch*(1-k))*0.2;
        wing(r===0?0.15:fwd*0.5,span,z,yy,ch*k,f==='fx'?0.1:0.07,0.008,r===0||r===rows-1);}
      const yb=rows===3?uy-2*gap*0.95:-fh*0.42,bays=f==='fx'?[b*0.18,b*0.31,b*0.43]:b>11?[b*0.24,b*0.42]:[b*0.4];
      for(const sd of [-1,1]){for(const xs of bays){if(f==='fs'){strut([sd*xs,uy,zl+stg-0.1],[sd*xs*0.95,yb,zl-ch*0.3]);strut([sd*xs,uy,zl+stg-ch+0.15],[sd*xs*0.95,yb,zl-ch*0.3]);}
          else{strut([sd*xs,yb,zl-0.15],[sd*xs,uy,zl+stg-0.15]);strut([sd*xs,yb,zl-ch+0.15],[sd*xs,uy,zl+stg-ch+0.15]);wire([sd*xs,yb,zl-0.15],[sd*Math.max(0.6,xs-b*0.17),uy,zl+stg-0.15]);}}
        strut([sd*0.35,fh*0.5,zl+stg-0.2],[sd*0.45,uy,zl+stg-0.25]);strut([sd*0.35,fh*0.5,zl+stg-ch*0.7],[sd*0.45,uy,zl+stg-ch*0.7]);}
      G.props.forEach(p=>{if(p.eng)engine(p.eng[0],p.eng[1],p.eng[2],false);});}
    // оружие: курсовые пулемёты, пулемёт на крыле, турель стрелка, бомбы под фюзеляжем
    if(P.a.gun>=0.6&&!P.a.obs&&P.a.id!=='w3'){for(const sd of P.a.id==='w6'?[-0.13,0.13]:[0.11])mb.rod([sd,fh*0.53,zn-0.95],[sd,fh*0.53,zn+0.25],0.07,hex2rgb('#2b2b2b'),MID.metal);}
    if(P.a.id==='w3'){const yy=fh*0.5+gap*0.75+0.12;mb.rod([0,yy,zl-0.5],[0,yy,zl+0.7],0.08,hex2rgb('#2b2b2b'),MID.metal);pCyl(mb,[0,yy,zl-0.2],[0,yy,zl+0.1],0.15,0.15,'#2b2b2b',10,MID.metal);}
    if(P.a.obs){const zo=zc-(big?2.4:1.15);pCyl(mb,[0,fh*0.5,zo],[0,fh*0.56,zo],0.45,0.45,'#6b5a40',14,MID.wood,false);mb.rod([0,fh*0.62,zo],[0.2,fh*0.78,zo-0.9],0.06,hex2rgb('#2b2b2b'),MID.metal);if(P.a.id==='w7')mb.rod([0.11,fh*0.53,zn-0.95],[0.11,fh*0.53,zn+0.25],0.07,hex2rgb('#2b2b2b'),MID.metal);}
    if(P.a.bomb>0){const nb=Math.min(8,Math.ceil(P.a.bomb/60));for(let i=0;i<nb;i++){const sd=i%2?1:-1,z=zl-0.3-Math.floor(i/2)*0.55;pBlob(mb,sd*0.25,-fh*0.5-0.18,z,0.1,0.1,0.32,'#3d4034',R5,0,MID.paint);}}
    if(marked){disk(fwd*0.5+0.006,0,zt*0.4,Math.min(fh*0.32,0.55),[1,0,0]);disk(-fwd*0.5-0.006,0,zt*0.4,Math.min(fh*0.32,0.55),[-1,0,0]);}
    // шасси или поплавки; хвостовой костыль
    if(!G.sea){const r=G.wheelR,gy=G.gy,gz=G.gz,gx=big?clamp(b*0.1,1.4,2.6):clamp(fwd*0.75,0.7,1.1);
      for(const sd of [-1,1]){wheel(sd*gx,gy,gz,r);strut([sd*gx,gy,gz],[sd*fwd*0.4,-fh*0.48,gz+0.6]);strut([sd*gx,gy,gz],[sd*fwd*0.4,-fh*0.48,gz-0.7]);}
      mb.rod([-gx,gy,gz],[gx,gy,gz],0.05,hex2rgb('#5a5c60'),MID.metal);const sk=G.gear;mb.rod([0,-0.06,sk.skidZ+0.45],[0,-sk.skidY,sk.skidZ],0.05,hex2rgb(wood),MID.wood);mb.rod([0,-0.06,sk.skidZ-0.05],[0,-sk.skidY+0.05,sk.skidZ+0.02],0.035,hex2rgb('#5a5c60'),MID.metal);}
    else floats(zn-1.8,G.floatY,big?1.6:1.15);}
  // винт: две лопасти (крутятся) и размытый диск на оборотах (полупрозрачный; байт материала — прозрачность)
  const r0=(G.props[0]||{r:1.2}).r;
  for(const sd of [1,-1]){const R=r0*sd;pr.poly([[-0.07,0.09*sd,0.02],[0.07,0.09*sd,0.02],[0.1,R*0.55,0.01],[0.07,R,0],[-0.05,R,0],[-0.09,R*0.55,0.03]],[0,0,1],hex2rgb(sd>0?'#8a5a32':'#7a4a28'),MID.wood);
    pr.poly([[-0.07,0.09*sd,0.0],[0.07,0.09*sd,0.0],[0.1,R*0.55,-0.01],[0.07,R,-0.02],[-0.05,R,-0.02],[-0.09,R*0.55,0.01]],[0,0,-1],hex2rgb('#6a4224'),MID.wood);}
  pCyl(pr,[0,0,-0.06],[0,0,0.16],0.1,0.06,'#6a6c70',10,MID.metal);
  {const pts=[],pts2=[];for(let k=0;k<28;k++){const a=k/28*6.2832;pts.push([Math.cos(a)*r0,Math.sin(a)*r0,0.03]);pts2.push([Math.cos(a)*r0*0.92,Math.sin(a)*r0*0.92,0.035]);}
    dc.poly(pts,[0,0,1],[120,100,80],46);dc.poly(pts2,[0,0,1],[90,72,55],30);}
  const hit=[{x:0,y:0,z:0,r:Math.max(fwd,fh)*0.8,k:'fus'},{x:0,y:0,z:G.zNose-0.6,r:Math.max(fwd,fh)*0.6,k:'eng'},{x:G.eye[0],y:G.eye[1]-0.2,z:G.eye[2],r:0.45,k:'pil'},
    {x:b*0.28,y:0.3,z:0,r:Math.max(0.9,ch*0.75),k:'wing'},{x:-b*0.28,y:0.3,z:0,r:Math.max(0.9,ch*0.75),k:'wing'},{x:0,y:0.3,z:-L*0.55,r:1,k:'tail'}];
  // 0.39: подвижные поверхности — пластины за задней кромкой (как навесные элероны Фармана), геометрия относительно оси навески
  const plate=(bm,xa,xb,c,col,cd)=>{const th=0.04;bm.poly([[xa,th/2,0],[xb,th/2,0],[xb,th/2,-c],[xa,th/2,-c]],[0,1,0],col,skinM);bm.poly([[xa,-th/2,0],[xa,-th/2,-c],[xb,-th/2,-c],[xb,-th/2,0]],[0,-1,0],cd,skinM);
    bm.poly([[xa,th/2,-c],[xb,th/2,-c],[xb,-th/2,-c],[xa,-th/2,-c]],[0,0,-1],cd,skinM);};
  const surf={};{const mains=WL.filter(w=>!w.tail).sort((a,b)=>b.x1-a.x1),mw=mains[0],ew=WL.filter(w=>w.tail).sort((a,b)=>b.x1-a.x1)[0];
    if(mw&&mw.x1>1.5){const xa=mw.x0+(mw.x1-mw.x0)*0.62,xb=mw.x1*0.97,xm=(xa+xb)/2;const am=new MB();plate(am,xa,xb,mw.cc*0.26,mw.col,mw.colD);surf.ail=g3Mesh(am);surf.ailH=[xm,mw.yy+xm*mw.dh+mw.tt*0.25,mw.z-mw.cc];surf.ailX=[xa,xb];}
    if(ew){const em=new MB();plate(em,-ew.x1*0.96,ew.x1*0.96,ew.cc*0.38,ew.col,ew.colD);surf.elev=g3Mesh(em);surf.elevH=[0,ew.yy+ew.tt*0.3,ew.z-ew.cc];}
    if(RUD.z!==undefined){const rm=new MB(),h0=RUD.y0,h1=RUD.y1,c=RUD.c;rm.poly([[0.02,h0,0],[0.02,h1,0],[0.02,h1,-c],[0.02,h0,-c]],[1,0,0],RUD.col,skinM);rm.poly([[-0.02,h0,0],[-0.02,h0,-c],[-0.02,h1,-c],[-0.02,h1,0]],[-1,0,0],RUD.col,skinM);rm.poly([[0.02,h0,-c],[0.02,h1,-c],[-0.02,h1,-c],[-0.02,h0,-c]],[0,0,-1],RUD.col,skinM);surf.rud=g3Mesh(rm);surf.rudH=[0,0,RUD.z];}
    if(WH.length){const r0=WH[0].r,wm=new MB();pCyl(wm,[-0.08,0,0],[0.08,0,0],r0,r0,tyre,16,MID.tyre);pCyl(wm,[-0.09,0,0],[0.09,0,0],r0*0.32,r0*0.32,'#6a6c70',10,MID.metal);for(let k=0;k<6;k++){const a=k/6*6.2832;wm.rod([0,Math.cos(a)*r0*0.3,Math.sin(a)*r0*0.3],[0,Math.cos(a)*r0*0.95,Math.sin(a)*r0*0.95],0.012,hex2rgb('#9a9c9e'),MID.metal);}
      surf.whl=g3Mesh(wm);surf.wheels=WH.map(w=>({x:w.x,y:w.y,z:w.z,s:w.r/r0}));}}
  const S=mb.sphere(),out={op:g3Mesh(mb),pr:g3Mesh(pr),disc:g3Mesh(dc),pil:g3Mesh(pm),props:G.props,eye:G.eye,gear:G.gear,span:b,len:L,r:S.r,c:S.c,hit,geo:G,...surf};
  if(AIR3D_CACHE.size>24){for(const [k,v] of AIR3D_CACHE){air3dFreeOne(v);AIR3D_CACHE.delete(k);if(AIR3D_CACHE.size<=16)break;}}
  AIR3D_CACHE.set(key,out);return out;}
function air3dFreeOne(v){['op','pr','disc','pil','ail','elev','rud','whl'].forEach(k=>{if(v[k])g3Free(v[k]);});}
function air3dFreeAll(){for(const v of AIR3D_CACHE.values())air3dFreeOne(v);AIR3D_CACHE.clear();}
// 0.39: матрица подвижной детали: поворот вокруг оси навески (ax: 'x' — руль высоты и элероны, 'y' — руль направления) в точке h
function air3dHingeMat(o,M,h,ax,ang,sc){const c=Math.cos(ang),s=Math.sin(ang),L=m4(),k=sc||1;
  if(ax==='x'){L[5]=c*k;L[6]=s*k;L[9]=-s*k;L[10]=c*k;L[0]=k;}else{L[0]=c*k;L[2]=-s*k;L[8]=s*k;L[10]=c*k;L[5]=k;}
  L[12]=h[0];L[13]=h[1];L[14]=h[2];return m4mul(o,M,L);}
