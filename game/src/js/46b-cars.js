/* ================= МОДЕЛИ МАШИН: гладкие кузова, настоящие колёса, крылья, фонари, радиаторы ================= */
// Кузов собирается из гладких поверхностей: сетка точек даёт грани с нормалями в вершинах — свет ложится мягко, как на лак.
// Метры; x — вправо, y — вверх, z — вперёд. Одна модель — для гонки (крупный и дальний план) и для портрета в карточке.
MATS.tyre={a:0.42,d:0.5,s:0.1,p:10,k:'tyre'};MATS.chrome={a:0.44,d:0.5,s:0.9,p:40,k:'chrome'};MATS.lens={a:0.5,d:0.4,s:0.9,p:40,k:'lens'};
/* ---------- гладкие поверхности ---------- */
// G — ряды точек одинаковой длины; wrap — ряд замкнут; ref(c,i,j) — точка «внутри» (нормаль грани — от неё); inv — нормали внутрь; two — видна с обеих сторон
function mGrid(M,G,col,mat,o){
  o=o||{};const I=G.length,J=I?G[0].length:0,wrap=!!o.wrap,JJ=wrap?J:J-1,out=[];if(I<2||J<2)return out;
  const Nf=[];
  for(let i=0;i<I-1;i++){const row=[];for(let j=0;j<JJ;j++){const j2=(j+1)%J,q=[G[i][j],G[i][j2],G[i+1][j2],G[i+1][j]];let n=newell(q);
      if(o.ref){const c=mCenter(q),r=o.ref(c,i,j);let d=n[0]*(c[0]-r[0])+n[1]*(c[1]-r[1])+n[2]*(c[2]-r[2]);if(o.inv)d=-d;if(d<0)n=[-n[0],-n[1],-n[2]];}
      row.push(n);}Nf.push(row);}
  const VN=[];for(let i=0;i<I;i++){const row=[];for(let j=0;j<J;j++){let x=0,y=0,z=0;
      for(let di=i-1;di<=i;di++){if(di<0||di>=I-1)continue;for(let dj=j-1;dj<=j;dj++){let jj=dj;if(wrap)jj=(jj+J)%J;else if(jj<0||jj>=JJ)continue;const n=Nf[di][jj];x+=n[0];y+=n[1];z+=n[2];}}
      const l=Math.hypot(x,y,z)||1;row.push([x/l,y/l,z/l]);}VN.push(row);}
  const C=hex2rgb(col),Mt=MATS[mat||'paint'];
  for(let i=0;i<I-1;i++)for(let j=0;j<JJ;j++){const n=Nf[i][j];if(Math.abs(n[0])+Math.abs(n[1])+Math.abs(n[2])<0.5)continue;const j2=(j+1)%J;
    const f={p:[G[i][j],G[i][j2],G[i+1][j2],G[i+1][j]],n,vn:o.flat?null:[VN[i][j],VN[i][j2],VN[i+1][j2],VN[i+1][j]],col:C,mat:Mt,two:!!o.two,deco:null,w:MTAG.w,l:MTAG.l};M.F.push(f);out.push(f);}
  return out;}
// Тело вращения: prof — [[радиус, смещение вдоль оси],…]; ось ax ('x','y','z') через точку c
function mLathe(M,c,ax,prof,seg,col,mat,o){o=o||{};const a0=o.a0||0,a1=o.a1===undefined?Math.PI*2:o.a1,full=o.a1===undefined,n=full?seg:seg+1;
  const P=(r,t,a)=>{const u=Math.cos(a)*r,v=Math.sin(a)*r;return ax==='x'?[c[0]+t,c[1]+v,c[2]+u]:ax==='y'?[c[0]+u,c[1]+t,c[2]+v]:[c[0]+u,c[1]+v,c[2]+t];};
  const G=prof.map(([r,t])=>{const row=[];for(let k=0;k<n;k++)row.push(P(r,t,a0+(a1-a0)*k/seg));return row;});
  let tm=0;prof.forEach(q=>tm+=q[1]);tm/=prof.length;const ctr=P(0,tm,0);
  return mGrid(M,G,col,mat,{wrap:full,ref:o.ref||(()=>ctr),two:o.two,inv:o.inv});}
// Трубка по ломаной path, радиус rad (число или по точкам); caps — закрыть концы
function mTube(M,path,rad,seg,col,mat,o){o=o||{};const n=path.length,G=[];let prev=null;
  for(let i=0;i<n;i++){const a=path[Math.max(0,i-1)],b=path[Math.min(n-1,i+1)],t=v3n([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);let s;
    if(prev){s=v3n(v3x(v3x(t,prev),t));if(s[0]*prev[0]+s[1]*prev[1]+s[2]*prev[2]<0)s=[-s[0],-s[1],-s[2]];if(!isFinite(s[0])||Math.hypot(...s)<0.5)s=prev;}
    else{const up=Math.abs(t[1])>0.9?[1,0,0]:[0,1,0];s=v3n(v3x(up,t));}prev=s;const u=v3x(t,s),p=path[i],r=Array.isArray(rad)?rad[i]:rad,row=[];
    for(let k=0;k<seg;k++){const an=k/seg*Math.PI*2,cs=Math.cos(an)*r,sn=Math.sin(an)*r;row.push([p[0]+s[0]*cs+u[0]*sn,p[1]+s[1]*cs+u[1]*sn,p[2]+s[2]*cs+u[2]*sn]);}G.push(row);}
  const out=mGrid(M,G,col,mat,{wrap:true,ref:(c,i)=>{const a=path[i],b=path[i+1],d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=d[0]*d[0]+d[1]*d[1]+d[2]*d[2]||1,t=clamp(((c[0]-a[0])*d[0]+(c[1]-a[1])*d[1]+(c[2]-a[2])*d[2])/L,0,1);return [a[0]+d[0]*t,a[1]+d[1]*t,a[2]+d[2]*t];}});
  if(o.caps){[0,n-1].forEach((i,k)=>{const p=path[i],q=path[k?n-2:1];out.push(mFace(M,G[i].slice(),col,mat,[q[0],q[1],q[2]]));});}
  return out;}
// Сечение со скруглёнными углами: полуширина низа wb и верха wt, высоты yb…yt, радиусы rb (низ) и rt (верх), n точек на дугу;
// kind: 'o' — замкнутое, 'u' — без верха (открытый кузов), 'n' — без низа (капот)
function rsec(wb,wt,yb,yt,rb,rt,n,kind){const P=[],h=yt-yb;rt=Math.max(0.001,Math.min(rt,h*0.5,wt));rb=Math.max(0.001,Math.min(rb,h*0.5,wb));
  const arc=(cx,cy,r,a0,a1)=>{for(let k=0;k<=n;k++){const a=a0+(a1-a0)*k/n;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}};
  if(kind==='u'){P.push([-wt,yt]);arc(-wb+rb,yb+rb,rb,Math.PI,Math.PI*1.5);arc(wb-rb,yb+rb,rb,-Math.PI/2,0);P.push([wt,yt]);}
  else if(kind==='n'){P.push([-wb,yb]);arc(-wt+rt,yt-rt,rt,Math.PI,Math.PI/2);arc(wt-rt,yt-rt,rt,Math.PI/2,0);P.push([wb,yb]);}
  else{arc(wb-rb,yb+rb,rb,-Math.PI/2,0);arc(wt-rt,yt-rt,rt,0,Math.PI/2);arc(-wt+rt,yt-rt,rt,Math.PI/2,Math.PI);arc(-wb+rb,yb+rb,rb,Math.PI,Math.PI*1.5);}
  return P;}
// Кузов «по шпангоутам»: secs — [{z,p:[[x,y],…],dx}] с одинаковым числом точек; wrap — сечения замкнуты
function mLoft2(M,secs,col,mat,o){o=o||{};const G=secs.map(s=>s.p.map(q=>[q[0]+(s.dx||0),q[1],s.z]));
  const refs=secs.map(s=>{let x=0,y=0;s.p.forEach(q=>{x+=q[0];y+=q[1];});return [x/s.p.length+(s.dx||0),y/s.p.length];});
  return mGrid(M,G,col,mat,Object.assign({ref:(c,i)=>[(refs[i][0]+refs[i+1][0])/2,(refs[i][1]+refs[i+1][1])/2,c[2]]},o));}
// Плоская заглушка сечения (торец кузова): dir — куда смотрит (+1 вперёд, −1 назад)
function mCap(M,sec,col,mat,dir){const p=sec.p.map(q=>[q[0]+(sec.dx||0),q[1],sec.z]);let y=0;p.forEach(q=>y+=q[1]);return mFace(M,p,col,mat,[sec.dx||0,y/p.length,sec.z-dir]);}
// Брусок со скруглёнными рёбрами (подушка сиденья, бак, ящик)
function mRBox(M,x0,y0,z0,x1,y1,z1,r,col,mat,n){if(!MLOD){const b=mBox(M,x0,y0,z0,x1,y1,z1,col,mat);return Object.values(b);}n=n||3;const w=(x1-x0)/2,cx=(x0+x1)/2,rr=Math.min(r,(z1-z0)/2);
  const S=(z,k)=>({z,dx:cx,p:rsec(w-k,w-k,y0+k*0.5,y1-k,r,r,n,'o')});
  const secs=[S(z0,rr),S(z0+rr*0.3,rr*0.29),S(z0+rr,0),S(z1-rr,0),S(z1-rr*0.3,rr*0.29),S(z1,rr)];
  const f=mLoft2(M,secs,col,mat,{wrap:true});f.push(mCap(M,secs[0],col,mat,-1),mCap(M,secs[5],col,mat,1));return f;}
/* ---------- колесо: шина-тор, обод, спицы, ступица, барабан ---------- */
function mWheel2(M,cx,cy,cz,r,tw,type,K,solid){
  const hi=MLOD===1,side=cx>=0?1:-1,seg=hi?28:10,pn=hi?10:4,tr=solid?Math.min(tw*0.45,r*0.1):Math.min(tw*0.55,r*0.2),R0=r-tr,tc=K.tyre;
  // шина: сечение — овал; ряды — по сечению, столбцы — по кругу колеса
  const prof=[];for(let k=0;k<=pn;k++){const a=k/pn*Math.PI*2;prof.push([R0+Math.cos(a)*tr*(solid?0.9:1),Math.sin(a)*tw*0.5*(solid?1.05:1)]);}
  const G=prof.map(([rad,t])=>{const row=[];for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2;row.push([cx+t,cy+Math.sin(a)*rad,cz+Math.cos(a)*rad]);}return row;});
  mGrid(M,G,tc,'tyre',{wrap:true,ref:c=>{const dy=c[1]-cy,dz=c[2]-cz,l=Math.hypot(dy,dz)||1;return [cx,cy+dy/l*R0,cz+dz/l*R0];}});
  // протектор: риски поперёк шины (после 1905 года)
  const rim=R0-tr*0.85,xo=cx+side*tw*0.36,xi=cx-side*tw*0.36;
  // обод: кольцо между шиной и спицами (деревянный на ранних, стальной позже)
  const rimCol=type==='wood'?K.felloe:type==='disc'||type==='alloy'?K.discCol:'#2a2b2e';
  mLathe(M,[cx,cy,cz],'x',[[rim-0.02,-tw*0.32],[rim+0.012,-tw*0.34],[rim+0.012,tw*0.34],[rim-0.02,tw*0.32]],seg,rimCol,type==='wood'?'wood':'paint',{ref:()=>[cx,cy,cz]});
  // спицы и диск
  const hubR=r*(type==='wood'?0.2:0.14),hubX=cx+side*tw*0.05;
  if(type==='wood'){const ns=hi?12:6;for(let k=0;k<ns;k++){const a=k/ns*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
      mTube(M,[[hubX,cy+sa*hubR*0.8,cz+ca*hubR*0.8],[cx,cy+sa*(rim-0.01),cz+ca*(rim-0.01)]],[r*0.05,r*0.034],hi?5:3,K.wood,'wood');}}
  else if(type==='wire'&&!hi){mLathe(M,[cx,cy,cz],'x',[[rim-0.01,0],[hubR,side*tw*0.1]],seg,'#8d9096','chrome',{ref:()=>[cx-side,cy,cz]});}
  else if(type==='wire'){const ns=32;for(let k=0;k<ns;k++){const a=k/ns*Math.PI*2,b=a+(k%2?0.32:-0.32),lay=k%4<2?1:-1,x0=cx+side*tw*0.05+lay*tw*0.22;
      mTube(M,[[x0,cy+Math.sin(b)*hubR*0.9,cz+Math.cos(b)*hubR*0.9],[cx+lay*tw*0.08,cy+Math.sin(a)*(rim-0.01),cz+Math.cos(a)*(rim-0.01)]],hi?0.0055:0.009,3,K.spoke,'chrome');}
    // тормозной барабан за спицами
    if(K.y>=1918)mLathe(M,[cx,cy,cz],'x',[[0,-side*tw*0.3],[r*0.55,-side*tw*0.3],[r*0.55,side*tw*0.05],[0,side*tw*0.05]],16,'#2b2c30','paint');}
  else if(type==='disc'){mLathe(M,[cx,cy,cz],'x',[[rim,side*tw*0.1],[rim*0.8,side*tw*0.22],[rim*0.45,side*tw*0.3],[hubR,side*tw*0.34],[hubR*0.9,side*tw*0.4]],seg,K.discCol,'paint',{ref:()=>[cx-side,cy,cz]});
    mLathe(M,[cx,cy,cz],'x',[[rim,-side*tw*0.2],[hubR,-side*tw*0.2]],seg,K.discCol,'paint',{ref:()=>[cx+side,cy,cz]});}
  else if(type==='alloy'){mLathe(M,[cx,cy,cz],'x',[[rim,side*tw*0.05],[rim*0.9,side*tw*0.12],[hubR*1.4,side*tw*0.18],[hubR,side*tw*0.3]],seg,'#9ea4ac','chrome',{ref:()=>[cx-side,cy,cz]});
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);mTube(M,[[hubX+side*0.03,cy+sa*hubR,cz+ca*hubR],[cx+side*tw*0.1,cy+sa*rim*0.92,cz+ca*rim*0.92]],[0.022,0.03],4,'#b7bcc4','chrome');}}
  // ступица и колпак
  const hc=K.hubCol;mLathe(M,[cx,cy,cz],'x',[[hubR*1.05,-side*tw*0.25],[hubR*1.08,side*tw*0.2],[hubR*0.8,side*tw*0.34],[hubR*0.55,side*tw*0.48],[hubR*0.3,side*tw*0.56],[0,side*tw*0.58]],hi?16:6,hc,K.hubMat,{ref:()=>[cx-side*0.2,cy,cz]});
  if(type==='wire'&&hi){const nx=cx+side*tw*0.6;mTube(M,[[nx,cy-hubR*0.9,cz],[nx,cy+hubR*0.9,cz]],0.012,4,hc,K.hubMat);mTube(M,[[nx,cy,cz-hubR*0.9],[nx,cy,cz+hubR*0.9]],0.012,4,hc,K.hubMat);}
}
/* ---------- крыло: лист, изогнутый дугой над колесом (с «горбом» поперёк), и переход к подножке ---------- */
// path — осевая линия [[y,z],…] в плоскости колеса x; ширина w; crown — выпуклость поперёк; wc — центр колеса [y,z] (нормаль — от него)
function mSweep(M,x,path,w,crown,col,wc,o){o=o||{};const n=path.length,J=MLOD?7:3,G=[];
  for(let i=0;i<n;i++){const a=path[Math.max(0,i-1)],b=path[Math.min(n-1,i+1)],ty=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(ty,tz)||1;let ny=-tz/tl,nz=ty/tl;
    const ry=path[i][0]-wc[0],rz=path[i][1]-wc[1];if(ny*ry+nz*rz<0){ny=-ny;nz=-nz;}const row=[];
    for(let j=0;j<=J;j++){const u=j/J*2-1,c=crown*(1-u*u),edge=Math.abs(u)>0.999?(o.skirt||0):0;row.push([x+u*w/2,path[i][0]+ny*(c-edge),path[i][1]+nz*(c-edge)]);}G.push(row);}
  return mGrid(M,G,col,o.mat||'paint',{ref:(c,i)=>{const p=path[i];const ry=p[0]-wc[0],rz=p[1]-wc[1];return [x,p[0]-ry*0.5,p[1]-rz*0.5];},two:true});}
function arcPath(cy,cz,R,a0,a1,n){const P=[];for(let k=0;k<=n;k++){const a=a0+(a1-a0)*k/n;P.push([cy+Math.sin(a)*R,cz+Math.cos(a)*R]);}return P;}
// Квадратичная кривая от a к b с управляющей точкой c (для плавных переходов)
function bez2(a,c,b,n){const P=[];for(let k=1;k<=n;k++){const t=k/n,u=1-t;P.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]);}return P;}
/* ---------- экипаж: пилот и механик — пыльник, кожаный шлем или кепи, очки, шарф ---------- */
function mCrew2(M,x,seatY,z,kit,mech,S,hand){
  const hi=MLOD===1,sg=hi?12:6,coat=mech?shade(kit.coat,-0.12):kit.coat,y0=seatY+0.02;
  // торс: горизонтальные сечения-эллипсы от сиденья до плеч, чуть откинут назад
  // плечи — широкие и прямые (раньше торс сужался «бутылкой»)
  const lv=[[0,0.18,0.13,0],[0.18,0.165,0.12,-0.02],[0.36,0.2,0.13,-0.04],[0.5,0.225,0.12,-0.06],[0.57,0.232,0.105,-0.07],[0.615,0.17,0.085,-0.07],[0.65,0.075,0.06,-0.06]];
  const G=lv.map(([h,wx,wz,dz])=>{const row=[];for(let k=0;k<sg;k++){const a=k/sg*Math.PI*2;row.push([x+Math.cos(a)*wx,y0+h,z+dz+Math.sin(a)*wz]);}return row;});
  mGrid(M,G,coat,'cloth',{wrap:true,ref:(c,i)=>[x,y0+(lv[i][0]+lv[i+1][0])/2,z+lv[i][3]]});
  // голова, шлем или кепи, очки
  const hy=y0+0.8,hz=z-0.05,hr=0.1,sp=[];for(let k=0;k<=(hi?6:3);k++){const a=k/(hi?6:3)*Math.PI;sp.push([Math.sin(a)*hr,-Math.cos(a)*hr*1.1]);}
  mLathe(M,[x,hy,hz],'y',sp,hi?12:6,'#d8b08c','skin');mLathe(M,[x,hy-0.16,hz],'y',[[0.045,0],[0.05,0.08]],hi?8:5,'#c9a07c','skin');
  if(kit.cap==='helmet'){const hp=[];for(let k=0;k<=(hi?5:2);k++){const a=k/(hi?5:2)*Math.PI*0.55;hp.push([Math.sin(a+0.0)*0.114,Math.cos(a)*0.118+0.005]);}hp.reverse();
    mLathe(M,[x,hy,hz],'y',hp.map(q=>[q[0],q[1]]),hi?12:6,kit.hat,'leather');
    if(hi)[-1,1].forEach(sd=>mRBox(M,x+sd*0.1-0.018,hy-0.1,hz-0.05,x+sd*0.1+0.018,hy+0.02,hz+0.04,0.012,kit.hat,'leather'));}
  else{mLathe(M,[x,hy+0.045,hz-0.01],'y',[[0.118,0],[0.12,0.04],[0.1,0.07],[0,0.075]],hi?12:6,kit.hat,'cloth');
    mFace(M,[[x-0.1,hy+0.05,hz+0.08],[x+0.1,hy+0.05,hz+0.08],[x+0.08,hy+0.04,hz+0.19],[x-0.08,hy+0.04,hz+0.19]],shade(kit.hat,-0.2),'cloth',[x,hy+1,hz],true);}
  if(hi)[-1,1].forEach(sd=>mLathe(M,[x+sd*0.042,hy+0.025,hz+0.1],'z',[[0.03,-0.02],[0.032,0.012],[0.024,0.02],[0,0.021]],8,'#8a6a3a','metal'));
  if(hi)mTube(M,[[x-0.11,hy+0.03,hz+0.02],[x-0.1,hy+0.032,hz+0.08],[x-0.06,hy+0.03,hz+0.1],[x+0.06,hy+0.03,hz+0.1],[x+0.1,hy+0.032,hz+0.08],[x+0.11,hy+0.03,hz+0.02]],0.008,'#2b1d12','leather',3);
  // руки к рулю (у механика — к борту и поручню)
  const sy=y0+0.53,sz=z-0.07;[-1,1].forEach(sd=>{const sx=x+sd*0.2,h=mech?[x+sd*0.3,seatY+0.3,z+0.12]:[x+sd*0.13,hand[1],hand[2]],el=[(sx+h[0])/2+sd*0.06,(sy+h[1])/2-0.12,(sz+h[2])/2-0.02];
    mTube(M,[[sx,sy,sz],el,h],[0.052,0.046,0.04],hi?6:3,coat,'cloth');mLathe(M,h,'y',[[0,-0.035],[0.035,-0.02],[0.04,0.01],[0.025,0.035],[0,0.04]],hi?8:4,'#6b4a30','leather');});
  // шарф: кольцо на шее и развевающийся конец
  if(!mech&&hi){const sc=S.y<1920?'#ece6d4':'#b8322a';mTube(M,[[x-0.07,y0+0.63,z-0.06],[x,y0+0.65,z+0.0],[x+0.07,y0+0.63,z-0.06],[x,y0+0.62,z-0.13],[x-0.07,y0+0.63,z-0.06]],0.03,sc,'cloth',5);
    mFace(M,[[x+0.03,y0+0.63,z-0.13],[x+0.07,y0+0.62,z-0.13],[x+0.16,y0+0.52,z-0.42],[x+0.1,y0+0.5,z-0.44]],sc,'cloth',null,true);}
}
/* ---------- номер гонщика: белая табличка с цифрами «как на семисегментном табло» ---------- */
const SEG7={0:'abcfed'.split(''),1:['b','c'],2:['a','b','g','e','d'],3:['a','b','g','c','d'],4:['f','g','b','c'],5:['a','f','g','c','d'],6:['a','f','g','e','d','c'],7:['a','b','c'],8:'abcdefg'.split(''),9:['a','b','c','d','f','g']};
// f — грань-табличка; o, u, v — центр и оси таблички (u — вправо, v — вверх), h — высота цифр
function numDeco(num,o,u,v,h){const s=String(num).slice(0,2),w=h*0.5,t=h*0.13,gap=h*0.22,W=s.length*w+(s.length-1)*gap,out=[];
  const P=(a,b)=>[o[0]+u[0]*a+v[0]*b,o[1]+u[1]*a+v[1]*b,o[2]+u[2]*a+v[2]*b];
  s.split('').forEach((ch,i)=>{const x0=-W/2+i*(w+gap),segs=SEG7[ch]||[];const R={a:[x0,h/2-t,x0+w,h/2],b:[x0+w-t,0,x0+w,h/2],c:[x0+w-t,-h/2,x0+w,0],d:[x0,-h/2,x0+w,-h/2+t],e:[x0,-h/2,x0+t,0],f:[x0,0,x0+t,h/2],g:[x0,-t/2,x0+w,t/2]};
    segs.forEach(k=>{const [a0,b0,a1,b1]=R[k];out.push({poly:[P(a0,b0),P(a1,b0),P(a1,b1),P(a0,b1)],c:'#141414',flat:1});});});
  return out;}
/* ---------- набор деталей эпохи ---------- */
function carKit(S){const y=S.y,col=S.color||'#23427a',lux=!!S.lux;
  const brassEra=y<1914,bright=brassEra?'#c9a24a':'#d3d7dc';
  return {y,col,lux,bright,brightMat:brassEra?'metal':'chrome',dark:'#141518',chassis:'#1b1c1f',
    leather:lux?'#6a2620':y<1920?'#4a3021':'#3b2a22',wood:y<1906?'#b98c52':'#9a7248',felloe:y<1906?'#a87c46':'#8a6440',
    tyre:y<1912?'#c9c4b8':'#1c1c1e',spoke:'#cfd2d6',discCol:shade(col,-0.15),hubCol:brassEra?'#c9a24a':'#cfd3d8',hubMat:brassEra?'metal':'chrome',
    glass:'#a9c3d2',canvas:'#2e2b27',fender:(S.style==='sport'&&y>=1912)?col:'#141518'};}
/* ---------- гоночные машины заводских команд: у каждой марки свой облик ---------- */
// rad — радиатор (dash — «совок» Рено: радиаторы по бокам у щитка), hood — высота капота, tank — бак (xcyl поперёк, zcyl вдоль, box, none),
// spare — запаски стопкой за баком, tail — хвост поздних машин (point, round, boat, long), solo — без механика, exh — выхлоп слева (−1) или справа
const MQV={
  'Renault':{rad:'dash',tank:'box',spare:2,hood:0.94},'Clément-Bayard':{rad:'dash',tank:'xcyl',spare:1,hood:0.98},
  'Mercedes':[[1912,{rad:'honey',tank:'xcyl',spare:2,hood:1.08,chain:1}],[1924,{rad:'vee',tail:'round',spare:2}],[1999,{rad:'vee',hump:1}]],
  'Benz':[[1909,{rad:'vert',tank:'zcyl',spare:1,exh:-1}],[1999,{rad:'vee',tail:'boat'}]],
  'FIAT':{rad:'vert',tank:'box',spare:2,hood:1.14,straps:1,chain:1},'Itala':{rad:'honey',tank:'zcyl',spare:1,louv:5},
  'Panhard et Levassor':{rad:'coil',tank:'xcyl',spare:0,hood:1.1,chain:1},'Mors':{rad:'vert',tank:'box',spare:1,hood:0.9,exh:-1},
  'De Dietrich':{rad:'vert',tank:'zcyl',spare:2,hood:0.96},'Darracq':{rad:'honey',tank:'box',spare:1,hood:0.92,exh:-1},
  'Brasier':{rad:'round',tank:'xcyl',spare:1},'De Dion-Bouton':{rad:'coil',tank:'box',spare:0,hood:0.9},
  'Peugeot':[[1900,{rad:'coil',tank:'box',spare:0}],[1999,{rad:'vert',tail:'point',hump:1}]],'Opel':{rad:'vert',tank:'zcyl',spare:2,straps:1},
  'Austro-Daimler':{rad:'vee',tail:'boat',tank:'zcyl',spare:1},'Isotta Fraschini':{rad:'vert',tank:'xcyl',spare:2,exh:-1},
  'Nazzaro':{rad:'vert',tail:'round',spare:1},'Napier':{rad:'coil',tank:'box',spare:1,hood:1.06},
  'Sunbeam':{rad:'vert',tail:'point',exh:-1},'Vauxhall':{rad:'vee',flutes:1,tail:'boat',tank:'zcyl',spare:1},
  'Delage':{rad:'vert',tail:'point',exh:-1},'Ballot':{rad:'vert',tail:'point',hump:1},'Bugatti':{rad:'round',tail:'point'},
  'Talbot':{rad:'vert',tail:'round',exh:-1},'Alfa Romeo':{rad:'vert',tail:'point',hump:1},'Maserati':{rad:'vert',tail:'point',exh:-1},
  'Bentley':{rad:'honey',tail:'round'},'Winton':{rad:'vert',tank:'box',spare:0,hood:1.1},'Locomobile':{rad:'vert',tank:'xcyl',spare:2,hood:1.08},
  'Buick':{rad:'round',tank:'zcyl',spare:1},'Marmon':{rad:'vert',tail:'long',solo:1,tank:'zcyl',spare:0},'National':{rad:'vert',tank:'xcyl',spare:1,tail:'round'},
  'Lozier':{rad:'vert',tank:'box',spare:2,tail:'round'},'Frontenac':{rad:'vert',tail:'point'},'Duesenberg':{rad:'vert',tail:'point',exh:-1},
  'Miller':{rad:'round',tail:'point',hump:1},'Durant':{rad:'round',tail:'point'},'Руссо-Балт':{rad:'vert',tank:'zcyl',spare:1,hood:1.04}};
function mqLook(S){const d={rad:null,hood:1,tank:'xcyl',spare:2,tail:'point',solo:0,exh:1,straps:0,louv:null,flutes:0,chain:0,hump:0};if(!S.mq)return d;
  let v=MQV[S.mq];if(Array.isArray(v))v=(v.find(a=>S.y<=a[0])||v[v.length-1])[1];
  if(!v){// незнакомая марка: облик по её имени, но всегда один и тот же
    const h=hashStr(S.mq),p=(a,k)=>a[(h>>>k)%a.length];v={rad:p(['honey','vert','round','vee'],1),tank:p(['xcyl','zcyl','box'],4),spare:p([0,1,2],7),tail:p(['point','round','boat'],10),hood:0.92+((h>>>13)%9)*0.025,exh:(h>>>17)&1?1:-1};}
  return Object.assign(d,v);}
function carModel(S){
  MLOD=S.lod==='lo'?0:1;const hi=MLOD===1,M=new Mesh(),st=S.style,y=S.y,K=carKit(S),col=K.col,n=hi?3:1,crew=S.crew!==0&&S.crew!==false;
  let wt=S.wheel==='alloy'?'alloy':S.wheel==='wire'?'wire':S.wheel==='disc'?'disc':'wood';
  M.wheels=[];
  const WH=(cx,cy,cz,r,tw,solid,steer)=>{M.wheels.push([cx,cy,cz,steer?-r:r]);MTAG.w=M.wheels.length;mWheel2(M,cx,cy,cz,r,tw,wt,K,solid);MTAG.w=0;};
  const B=(x0,y0,z0,x1,y1,z1,c,m)=>mBox(M,x0,y0,z0,x1,y1,z1,c,m||'paint');
  const tube=(p,r,c,m,sg)=>mTube(M,p,r,sg||(hi?6:3),c,m||'paint');
  // ---------- шасси: колёса, оси, рессоры, лонжероны ----------
  const chassis=(wb,t,rF,rR,tw,o)=>{o=o||{};[-1,1].forEach(sd=>{WH(sd*t/2,rF,wb/2,rF,tw,o.solid,true);WH(sd*t/2,rR,-wb/2,rR,tw,o.solid,false);if(o.dual)WH(sd*(t/2+tw+0.03),rR,-wb/2,rR,tw,o.solid,false);});
    const yf=o.yf,fw=o.fw||0.38;
    // лонжероны и передние «рога»
    [-1,1].forEach(sd=>{B(sd*fw-0.035,yf-0.14,-wb/2-0.25,sd*fw+0.035,yf,wb/2+0.02,K.chassis,'paint');tube([[sd*fw,yf-0.07,wb/2],[sd*fw,yf-0.1,wb/2+0.22],[sd*fw*0.96,yf-0.2,wb/2+0.36]],0.03,K.chassis,'paint',4);});
    // передняя балка оси и задний мост с «грушей» дифференциала
    B(-t/2+0.06,rF-0.03,wb/2-0.035,t/2-0.06,rF+0.035,wb/2+0.035,K.chassis,'paint');
    tube([[-t/2+0.05,rR,-wb/2],[t/2-0.05,rR,-wb/2]],0.045,K.chassis,'paint',hi?8:4);if(hi)mLathe(M,[0,rR,-wb/2],'z',[[0,-0.13],[0.1,-0.1],[0.15,0],[0.1,0.1],[0.05,0.2],[0,0.21]],10,K.chassis,'paint');
    // рессоры: пакет листов дугой
    if(hi)[-1,1].forEach(sd=>[[wb/2,rF],[-wb/2,rR]].forEach(([z,ry])=>{const L=0.46,P=[];for(let k=0;k<=6;k++){const u=k/6*2-1;P.push([sd*fw,ry+0.07-0.06*(1-u*u),z+u*L]);}tube(P,0.022,'#2a2b2e','paint',4);}));
    // картер мотора и маховик под капотом (видны снизу) — брусок
    B(-0.2,yf-0.3,o.zEng0||0.3,0.2,yf-0.08,o.zEng1||wb/2-0.1,'#2a2b2e','paint');};
  // ---------- радиатор: латунная или никелевая рамка, соты или трубки, пробка, фигурка ----------
  const radiator=(z,w,yb,yt,kind,o)=>{o=o||{};const r=Math.min(0.07,w*0.25),path=[];const P=rsec(w,w,yb,yt,r,kind==='round'?w*0.9:r,hi?4:2,'o');
    P.forEach(q=>path.push([q[0],q[1],z+0.035]));path.push(path[0]);
    if(kind==='vee'){path.forEach(q=>{q[2]+=0.09*(1-Math.abs(q[0])/w);});}
    mTube(M,path,0.034,hi?6:3,K.bright,K.brightMat);
    // сердцевина
    const core=P.map(q=>[q[0]*0.9,yb+(q[1]-yb)*0.96+0.01,z+0.03+(kind==='vee'?0.07*(1-Math.abs(q[0])/w):0)]);const f=mFace(M,core,'#26261f','matte',[0,(yb+yt)/2,z-1]);
    const deco=[];if(kind==='honey'){for(let k=1;k<12;k++)deco.push({a:[-w*0.88,yb+(yt-yb)*k/12,z+0.035],b:[w*0.88,yb+(yt-yb)*k/12,z+0.035],w:0.006,c:'#4d4b40'});for(let k=-6;k<=6;k++)deco.push({a:[k*w/7,yb+0.02,z+0.035],b:[k*w/7,yt-0.02,z+0.035],w:0.005,c:'#4d4b40'});}
    else if(kind==='coil'){}else{for(let k=-7;k<=7;k++)deco.push({a:[k*w/8,yb+0.03,z+0.036+(kind==='vee'?0.07*(1-Math.abs(k/8)):0)],b:[k*w/8,yt-0.03,z+0.036+(kind==='vee'?0.07*(1-Math.abs(k/8)):0)],w:kind==='shutter'?0.02:0.008,c:kind==='shutter'?K.bright:'#55575c'});}
    if(kind!=='vee')f.deco=deco;
    // бачок сверху и пробка
    mRBox(M,-w*0.92,yt-0.02,z-0.14,w*0.92,yt+0.035,z+0.02,0.02,K.bright,K.brightMat);
    mLathe(M,[0,yt+0.03,z-0.05],'y',[[0.04,0],[0.045,0.02],[0.04,0.045],[0,0.05]],hi?10:6,K.bright,K.brightMat);
    if(o.mascot&&hi){mSphere(M,0,yt+0.12,z-0.05,0.035,K.bright,'metal',1.4);mFace(M,[[0,yt+0.1,z-0.05],[-0.07,yt+0.2,z-0.1],[0,yt+0.16,z-0.02]],K.bright,'metal',null,true);mFace(M,[[0,yt+0.1,z-0.05],[0.07,yt+0.2,z-0.1],[0,yt+0.16,z-0.02]],K.bright,'metal',null,true);}
    // передний фартук под радиатором
    if(o.apron)mFace(M,[[-w,yb,z+0.02],[w,yb,z+0.02],[w*0.9,yb-0.16,z-0.05],[-w*0.9,yb-0.16,z-0.05]],K.dark,'paint',[0,yb,z-1],true);
    // заводная рукоятка
    if(hi&&y<1920)tube([[0.05,yb-0.12,z+0.02],[0.05,yb-0.12,z+0.14],[0.15,yb-0.12,z+0.16],[0.15,yb-0.12,z+0.24]],0.012,'#8a8f96','chrome',4);};
  // ---------- капот: гладкий «домик» с жалюзи, петлёй посередине и ремнями у спортивных ----------
  const hood=(z0,z1,w0,w1,yb,yt0,yt1,o)=>{o=o||{};const r=o.r||0.1,secs=[];const N=hi?5:2;
    for(let k=0;k<=N;k++){const t=k/N,w=w0+(w1-w0)*t,yt=yt0+(yt1-yt0)*t;secs.push({z:z0+(z1-z0)*t,p:rsec(w,w*(o.top||0.97),yb,yt,0.01,r,n,'n')});}
    const f=mLoft2(M,secs,col,'paint');if(o.cap)mCap(M,secs[0],col,'paint',1);
    // шарнир посередине и жалюзи по бокам; «флейты» Воксхолла — желобки по верху боковин
    tube([[0,yt0+0.006,z0-0.01],[0,yt1+0.006,z1+0.01]],0.008,shade(col,-0.35),'paint',4);
    if(o.flutes)[-1,1].forEach(sd=>tube([[sd*w0*0.8,yt0-0.035,z0-0.02],[sd*w1*0.8,yt1-0.035,z1+0.02]],0.02,shade(col,-0.25),'paint',hi?5:3));
    if(o.louv){const nl=o.louv,zz0=z0-0.12,zz1=z1+0.12;[-1,1].forEach(sd=>{for(let k=0;k<nl;k++){const t=(k+0.5)/nl,z=zz0+(zz1-zz0)*t,w=w0+(w1-w0)*((z0-z)/(z0-z1)),yt=yt0+(yt1-yt0)*((z0-z)/(z0-z1)),yA=yb+0.08,yB=yt-r-0.06;
      if(yB>yA)tube([[sd*(w+0.006),yA,z],[sd*(w+0.006),yB,z]],0.009,shade(col,-0.5),'paint',3);}});}
    if(o.straps)[-1,1].forEach(sd=>{const z=z0+(z1-z0)*(sd<0?0.3:0.65),w=w0+(w1-w0)*(sd<0?0.3:0.65),yt=yt0+(yt1-yt0)*(sd<0?0.3:0.65);tube([[-w-0.01,yb+0.1,z],[-w-0.01,yt-0.06,z],[-w+0.1,yt+0.012,z],[w-0.1,yt+0.012,z],[w+0.01,yt-0.06,z],[w+0.01,yb+0.1,z]],0.012,'#3a2a1c','leather',3);});
    if(o.pipes)[0,1,2].forEach(k=>{const z=z0-0.2-k*0.13;tube([[w1+0.01,yt1-0.12,z],[w1+0.09,yt1-0.2,z-0.05],[w1+0.12,yb-0.02,z-0.2],[w1+0.12,yb-0.14,z-0.6]],0.032,'#9ea3aa','chrome',6);});
    return f;};
  // ---------- фары, фонари, клаксон ----------
  const headlamp=(x,yy,z,r,kind)=>{const L=kind==='drum'?r*1.1:r*0.9;
    mLathe(M,[x,yy,z],'z',kind==='drum'?[[0,-L],[r*0.9,-L],[r,-L*0.8],[r,L*0.35],[r*1.06,L*0.45],[r*1.02,L*0.6]]:[[0,-L],[r*0.35,-L*0.95],[r*0.75,-L*0.7],[r*0.97,-L*0.3],[r*1.02,0.02],[r*1.05,L*0.12]],hi?16:6,K.bright,K.brightMat);
    MTAG.l=2;mLathe(M,[x,yy,z+(kind==='drum'?L*0.55:L*0.08)],'z',hi?[[r*0.98,0],[r*0.6,r*0.12],[0,r*0.16]]:[[r*0.98,0],[0,r*0.14]],hi?16:6,'#f2ecd8','lens');MTAG.l=0;
    if(kind==='drum'&&hi){tube([[x,yy+r,z-L*0.3],[x,yy+r*1.35,z-L*0.3]],r*0.28,K.bright,K.brightMat,6);mLathe(M,[x,yy+r*1.35,z-L*0.3],'y',[[r*0.45,0],[r*0.45,0.02],[0,0.05]],8,K.bright,K.brightMat);}};
  const sideLamp=(x,yy,z)=>{if(!hi)return;mRBox(M,x-0.05,yy-0.07,z-0.05,x+0.05,yy+0.07,z+0.05,0.012,K.dark,'paint');MTAG.l=2;mFace(M,[[x-0.035,yy-0.05,z+0.052],[x+0.035,yy-0.05,z+0.052],[x+0.035,yy+0.05,z+0.052],[x-0.035,yy+0.05,z+0.052]],'#f4ecd0','lens',[x,yy,z-1]);MTAG.l=0;
    mLathe(M,[x,yy+0.07,z],'y',[[0.035,0],[0.03,0.05],[0.045,0.06],[0,0.08]],6,K.bright,K.brightMat);};
  const tailLamp=(x,yy,z)=>{MTAG.l=1;mLathe(M,[x,yy,z],'z',[[0.05,0.02],[0.055,-0.03],[0.035,-0.07],[0,-0.075]],hi?10:6,'#8a1c14','lens');MTAG.l=0;mLathe(M,[x,yy,z],'z',[[0,0.06],[0.05,0.05],[0.055,0.02]],hi?10:6,K.dark,'paint');M.lamps.push([x,yy,z-0.08]);};
  const horn=(x,yy,z)=>{if(!hi)return;const P=[[x,yy,z]];for(let k=1;k<=8;k++){const a=k/8*Math.PI*1.6;P.push([x+Math.sin(a)*0.06,yy+0.06*k/8+Math.cos(a)*0.05-0.05,z+k*0.05]);}tube(P,0.012,K.bright,K.brightMat,5);
    const e=P[P.length-1];mLathe(M,[e[0],e[1],e[2]],'z',[[0.014,0],[0.03,0.08],[0.07,0.14],[0.075,0.15]],10,K.bright,K.brightMat,{two:true});mSphere(M,x,yy,z-0.06,0.045,'#1c1c1e','leather');};
  // ---------- ветровое стекло в рамке ----------
  const windscreen=(z,w,yb,yt,o)=>{o=o||{};const lean=o.lean||0.06,fr=K.bright,split=o.split;
    const P=[[-w,yb,z],[-w,yt,z-lean],[w,yt,z-lean],[w,yb,z]];mFace(M,P,K.glass,'glass',[0,(yb+yt)/2,z-1],true);
    tube([[-w,yb,z],[-w,yt,z-lean],[w,yt,z-lean],[w,yb,z]],0.014,fr,K.brightMat,4);if(split){const ym=(yb+yt)/2;tube([[-w,ym,z-lean/2],[w,ym,z-lean/2]],0.011,fr,K.brightMat,4);}
    if(o.stays)[-1,1].forEach(sd=>tube([[sd*w,yb+(yt-yb)*0.55,z-lean*0.55],[sd*(w+0.04),yb-0.02,z-0.3]],0.01,fr,K.brightMat,4));};
  // ---------- руль, рычаги, сиденья ----------
  const steer=(x,yy,z,r,tilt)=>{tilt=tilt===undefined?0.9:tilt;const P=[],seg=hi?16:8;for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2;P.push([x+Math.cos(a)*r,yy+Math.sin(a)*r*Math.cos(tilt),z-Math.sin(a)*r*Math.sin(tilt)]);}
    tube(P,0.014,y<1914?'#5a3a22':'#1f1f22',y<1914?'wood':'paint',4);[0,Math.PI*2/3,Math.PI*4/3].forEach(a=>tube([[x,yy,z],[x+Math.cos(a)*r,yy+Math.sin(a)*r*Math.cos(tilt),z-Math.sin(a)*r*Math.sin(tilt)]],0.007,'#8a8f96','chrome',3));
    tube([[x,yy,z],[x,yy-0.5*Math.sin(tilt),z+0.5*Math.cos(tilt)]],0.02,'#2a2a2e','paint',4);};
  const levers=(x,yy,z)=>{if(!hi||y>=1916)return;[0,0.12].forEach(dz=>tube([[x,yy,z+dz],[x+0.02,yy+0.42,z+dz-0.06]],0.013,K.bright,K.brightMat,4));mRBox(M,x-0.03,yy-0.05,z-0.06,x+0.03,yy+0.03,z+0.2,0.01,K.dark,'paint');};
  const seat=(x,z,ys,w,d,hb,o)=>{o=o||{};const c=o.col||K.leather,r=Math.min(0.06,w*0.2);
    mRBox(M,x-w,ys-0.12,z-d,x+w,ys,z,r,c,'leather');                          // подушка
    const back=o.bucket?rsec(w*0.85,w,ys,ys+hb,0.05,w*0.6,n,'o'):null;
    if(o.bucket){const secs=[{z:z-d-0.02,dx:x,p:back},{z:z-d-0.12,dx:x,p:back.map(q=>[q[0]*1.02,q[1]])}];mLoft2(M,secs,c,'leather',{wrap:true});mCap(M,secs[1],c,'leather',-1);mCap(M,secs[0],c,'leather',1);}
    else mRBox(M,x-w,ys-0.05,z-d-0.14,x+w,ys+hb,z-d+0.02,0.06,c,'leather');
    if(hi&&o.tuft){const f=M.F[M.F.length-1];}};
  // ---------- открытый кузов (ванна): борта, закруглённая корма, мягкий кант по краю, обивка внутри ----------
  // prof — [[z, полуширина, высота борта],…] от приборной доски назад; yb — низ кузова
  const tub=(prof,yb,o)=>{o=o||{};const N=prof.length,secs=prof.map(([z,w,yt])=>({z,p:rsec(w,w*(o.tumble||0.985),yb,yt,0.05,0.02,n,'u')}));
    const outer=mLoft2(M,secs,col,'paint');mCap(M,secs[N-1],col,'paint',-1);mCap(M,secs[0],col,'paint',1);
    // кант по верху бортов (кожаный или в цвет кузова)
    const L=[],Rr=[];prof.forEach(([z,w,yt])=>{L.push([-w*(o.tumble||0.985),yt,z]);Rr.push([w*(o.tumble||0.985),yt,z]);});
    tube(L.concat(Rr.slice().reverse()),0.022,o.rimCol||K.leather,'leather',hi?5:3);
    // обивка внутри: тёмная кожа до пола
    if(hi){const ins=prof.map(([z,w,yt])=>({z,p:rsec(w-0.035,w*(o.tumble||0.985)-0.035,o.floor||yb+0.12,yt-0.01,0.04,0.02,n,'u')}));
    mLoft2(M,ins.slice(0,N-1).concat([{z:ins[N-1].z+0.03,p:ins[N-1].p}]),o.inCol||shade(K.leather,-0.25),'leather',{inv:true});}
    else{const Lz=prof[0][0],Rz=prof[N-1][0],w=prof.reduce((a,q)=>Math.max(a,q[1]),0)-0.03,yt=prof[0][2]-0.02;mFace(M,[[-w,yt-0.25,Lz-0.02],[w,yt-0.25,Lz-0.02],[w,yt-0.25,Rz+0.05],[-w,yt-0.25,Rz+0.05]],shade(K.leather,-0.3),'leather',[0,-5,0]);}
    // двери и декоративная полоса
    (o.doors||[]).forEach(([za,zb])=>{const w=prof.reduce((a,q)=>Math.max(a,q[1]),0)+0.004;[-1,1].forEach(sd=>{const yt=prof[0][2]-0.03;tube([[sd*w,yb+0.06,za],[sd*w,yt,za],[sd*w,yt,zb],[sd*w,yb+0.06,zb]],0.0045,shade(col,-0.5),'paint',3);
      if(hi)tube([[sd*(w+0.012),yt-0.06,zb+0.04],[sd*(w+0.012),yt-0.06,zb+0.12]],0.008,K.bright,K.brightMat,4);});});
    if(o.coach&&hi){const w=prof.reduce((a,q)=>Math.max(a,q[1]),0)+0.005;[-1,1].forEach(sd=>tube(prof.slice(0,N-2).map(([z,,yt])=>[sd*w,yt-0.07,z]),0.004,o.coach,'paint',3));}
    return outer;};
  // ---------- закрытый салон: крыша, стойки, стёкла ----------
  const cabin=(z0,z1,w,yb,yt,o)=>{o=o||{};const rt=o.round?0.2:0.06,tw=w-(o.tumble||0.06),secs=[];const zs=[z0,z0-0.04,z1+0.04,z1];
    zs.forEach((z,k)=>secs.push({z,p:rsec(k===0||k===3?w-0.02:w,k===0||k===3?tw-0.03:tw,yb,k===0||k===3?yt-0.02:yt,0.01,rt,n,'u')}));
    mLoft2(M,secs,o.roofCol||col,'paint');mCap(M,secs[3],o.roofCol||col,'paint',-1);mCap(M,secs[0],o.roofCol||col,'paint',1);
    // крыша
    const rf=rsec(w-rt*0.3,tw,yt-0.05,yt,0.01,0.01,1,'o');mFace(M,[[-tw+rt*0.6,yt,z0-0.02],[tw-rt*0.6,yt,z0-0.02],[tw-rt*0.6,yt,z1+0.02],[-tw+rt*0.6,yt,z1+0.02]],o.roofCol||col,'paint',[0,0,0]);
    // окна: стёкла с тёмной рамкой по бокам, спереди и сзади
    const wins=o.wins||[[z0-0.12,z1+0.12]],yA=yb+0.12,yB=yt-rt-0.04;
    [-1,1].forEach(sd=>wins.forEach(([za,zb])=>{const xa=sd*(w+(tw-w)*((yA-yb)/(yt-yb))+sd*0.006),xb=sd*(w+(tw-w)*((yB-yb)/(yt-yb))+sd*0.006);
      mFace(M,[[xa,yA,za],[xa,yA,zb],[xb,yB,zb],[xb,yB,za]],K.glass,'glass',[0,(yA+yB)/2,(za+zb)/2]);
      tube([[xa,yA,za],[xa,yA,zb],[xb,yB,zb],[xb,yB,za],[xa,yA,za]],0.009,o.frame||shade(col,-0.45),'paint',3);}));
    const fz=z0+0.005;mFace(M,[[-tw+0.06,yA+0.02,fz],[tw-0.06,yA+0.02,fz],[tw-0.08,yB,fz],[-tw+0.08,yB,fz]],K.glass,'glass',[0,(yA+yB)/2,fz-1]);
    const bz=z1-0.005;mFace(M,[[-tw*0.5,yA+0.15,bz],[tw*0.5,yA+0.15,bz],[tw*0.5,yB-0.02,bz],[-tw*0.5,yB-0.02,bz]],K.glass,'glass',[0,(yA+yB)/2,bz+1]);
    if(o.visor)mFace(M,[[-tw,yt-0.02,z0],[tw,yt-0.02,z0],[tw,yt-0.05,z0+0.14],[-tw,yt-0.05,z0+0.14]],o.roofCol||col,'paint',[0,yt-1,z0],true);
    if(o.rack&&hi){[-1,1].forEach(sd=>tube([[sd*(tw-0.1),yt+0.05,z0-0.2],[sd*(tw-0.1),yt+0.05,z1+0.25]],0.012,K.bright,K.brightMat,4));}};
  // ---------- крылья и подножки ----------
  const wings=(wb,t,r,o)=>{o=o||{};const fw=o.w||(r*0.5+0.1),R=r+(o.gap||0.07),crown=o.crown||0.035,fc=o.col||K.fender,yrb=o.boardY;
    [-1,1].forEach(sd=>{const x=sd*(t/2+(o.out||0));
      if(o.cycle){mSweep(M,x,arcPath(r,wb/2,R,-0.25,Math.PI*0.62,hi?10:5),fw,crown,fc,[r,wb/2]);mSweep(M,x,arcPath(r,-wb/2,R,Math.PI*0.3,Math.PI*1.12,hi?10:5),fw,crown,fc,[r,-wb/2]);
        if(hi)[wb/2,-wb/2].forEach(z=>tube([[sd*(t/2-0.02),r,z],[x-sd*0.02,r+R*0.6,z-0.12*Math.sign(z)]],0.012,K.chassis,'paint',3));return;}
      // переднее крыло: дуга над колесом и плавный спуск назад к подножке
      const fa=arcPath(r,wb/2,R,-0.35,Math.PI*0.72,hi?12:5),e=fa[fa.length-1],zb=wb/2-r-0.08;
      const fr=fa.concat(bez2(e,[yrb+0.02,e[1]-0.05],[yrb,zb-0.18],hi?5:2));
      mSweep(M,x,fr,fw,crown,fc,[r,wb/2],{skirt:0.02});
      // заднее крыло: дуга и короткий хвост вниз
      const ra=arcPath(r,-wb/2,R,Math.PI*0.28,Math.PI*1.2,hi?12:5),s0=ra[0];
      const rr=[[yrb,-wb/2+r+0.2]].concat(bez2([yrb,-wb/2+r+0.2],[s0[0]-0.02,s0[1]+0.12],s0,hi?4:2)).concat(ra.slice(1));
      mSweep(M,x,rr,fw,crown,fc,[r,-wb/2],{skirt:0.02});
      // подножка с резиновым ковриком и фартук до рамы
      if(o.board!==false){const z0=-wb/2+r+0.2,z1=zb-0.16,bx=x;const f=B(bx-sd*fw/2,yrb-0.03,z0,bx+sd*fw/2,yrb,z1,K.dark,'paint');
        if(hi){const top=f.t;top.deco=[];for(let k=1;k<6;k++){const xx=bx-sd*fw/2+sd*fw*k/6;top.deco.push({a:[xx,yrb+0.002,z0+0.04],b:[xx,yrb+0.002,z1-0.04],w:0.012,c:'#2a2a2a'});}
          mFace(M,[[bx-sd*fw/2,yrb-0.01,z0],[bx-sd*fw/2,yrb-0.01,z1],[sd*(o.fwIn||0.42),o.frameY||yrb+0.12,z1],[sd*(o.fwIn||0.42),o.frameY||yrb+0.12,z0]],K.dark,'paint',[0,yrb+1,(z0+z1)/2],true);}}});};
  // ---------- запаска ----------
  const spare=(x,yy,z,r,tw,ax)=>{const seg=hi?20:10,tr=Math.min(tw*0.55,r*0.2),R0=r-tr,pr=[];for(let k=0;k<=(hi?8:5);k++){const a=k/(hi?8:5)*Math.PI*2;pr.push([R0+Math.cos(a)*tr,Math.sin(a)*tw*0.5]);}
    const G=pr.map(([rad,t])=>{const row=[];for(let k=0;k<seg;k++){const a=k/seg*Math.PI*2,u=Math.cos(a)*rad,v=Math.sin(a)*rad;row.push(ax==='z'?[x+u,yy+v,z+t]:[x+t,yy+v,z+u]);}return row;});
    mGrid(M,G,K.tyre,'tyre',{wrap:true,ref:c=>{if(ax==='z'){const dx=c[0]-x,dy=c[1]-yy,l=Math.hypot(dx,dy)||1;return [x+dx/l*R0,yy+dy/l*R0,z];}const dz=c[2]-z,dy=c[1]-yy,l=Math.hypot(dz,dy)||1;return [x,yy+dy/l*R0,z+dz/l*R0];}});
    mLathe(M,[x,yy,z],ax,[[R0-tr,-tw*0.3],[R0-tr*0.7,tw*0.3],[0,tw*0.3]],seg,K.chassis,'paint');};
  const bumper=(z,w,yy)=>{[-0.035,0.035].forEach(dy=>tube([[-w,yy+dy,z-0.06],[-w*0.9,yy+dy,z],[w*0.9,yy+dy,z],[w,yy+dy,z-0.06]],0.018,K.bright,K.brightMat,5));};
  const drvF=(x,seatY,z,handZ,handY)=>{if(!crew)return;MTAG.l=3;mCrew3(M,x,seatY,z,crewKit3(y,S.num),false,S,[x,handY||seatY+0.5,handZ||z+0.4]);MTAG.l=0;M.eye=[x,seatY+0.8,z+0.06];};
  const mechF=(x,seatY,z)=>{if(!crew)return;mCrew3(M,x,seatY,z,crewKit3(y,(S.num|0)+1),true,S,null);};
  const eyeAt=(x,seatY,z)=>{if(!M.eye)M.eye=[x,seatY+0.8,z+0.06];};
  // табличка с номером: центр c, нормаль nrm (наружу), ось «вправо» u; w×h
  const plate=(c,nrm,u,w,h,round)=>{if(!S.num||!hi)return;const v=v3x(nrm,u).map(q=>-q),P=[],k=round?10:4;
    if(round){for(let i=0;i<k;i++){const a=i/k*Math.PI*2;P.push([c[0]+(u[0]*Math.cos(a)*w+v[0]*Math.sin(a)*h)/2,c[1]+(u[1]*Math.cos(a)*w+v[1]*Math.sin(a)*h)/2,c[2]+(u[2]*Math.cos(a)*w+v[2]*Math.sin(a)*h)/2]);}}
    else [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>P.push([c[0]+(u[0]*a*w+v[0]*b*h)/2,c[1]+(u[1]*a*w+v[1]*b*h)/2,c[2]+(u[2]*a*w+v[2]*b*h)/2]));
    const f=mFace(M,P,'#f2efe6','paint',[c[0]-nrm[0],c[1]-nrm[1],c[2]-nrm[2]]);f.deco=numDeco(S.num,c,u,v,h*0.62);};
  // ================= облики =================
  const hk=S.hp===undefined?0:([-0.1,-0.05,0,0.1,0.22,0.36][S.hp]||0),strip=!!S.strip,lux=K.lux;
  const r0=y<1901?0.46:y<1906?0.44:y<1914?0.42:y<1922?0.39:0.355,tw0=y<1906?0.08:y<1914?0.095:y<1922?0.11:0.14;
  let len=[-1.6,1.6],track=1.38;
  if(st==='carriage'){
    const wb=1.7,t=1.22,rF=0.36,rR=0.46;wt='wood';chassis(wb,t,rF,rR,0.06,{yf:0.62,fw:0.35,zEng0:-0.6,zEng1:-0.1});
    // кузов «вис-а-ви»: высокий ящик, изогнутая спинка, крылья-щитки
    const zb0=-0.95,zb1=0.75,yb=0.62,yt=1.02;const secs=[[zb1,0.5,yt-0.1],[zb1-0.1,0.52,yt],[0.1,0.52,yt],[-0.5,0.52,yt],[zb0+0.1,0.5,yt+0.05],[zb0,0.44,yt+0.05]];tub(secs,yb,{floor:yb+0.15});
    seat(0,-0.2,yb+0.42,0.42,0.42,0.42,{});seat(0,0.62,yb+0.42,0.42,0.34,0.3,{});
    const x=0.24;tube([[x,yb+0.3,0.55],[x,yb+0.72,0.5],[x-0.14,yb+0.8,0.32]],0.018,'#2a2a2e','paint',4);mSphere(M,x-0.15,yb+0.8,0.3,0.025,'#5a3a22','wood');
    [-1,1].forEach(sd=>{mSweep(M,sd*t/2,arcPath(rR,-wb/2,rR+0.06,Math.PI*0.2,Math.PI*0.9,hi?8:4),0.14,0.02,K.dark,[rR,-wb/2]);});
    sideLamp(-0.56,yb+0.35,0.62);sideLamp(0.56,yb+0.35,0.62);drvF(0.24,yb+0.4,-0.2,0.38);if(S.mech)mechF(-0.24,yb+0.4,-0.2);eyeAt(0.24,yb+0.4,-0.2);
    tailLamp(0.4,yb+0.2,zb0-0.02);len=[zb0-0.1,zb1+0.15];track=t;}
  else if(st==='gp1901'||st==='gp1907'){
    const V=mqLook(S),late=st==='gp1907',wb=late?2.7:2.45,t=1.4,r=late?0.44:0.45,yf=r+0.14;chassis(wb,t,r,r,late?0.1:0.09,{yf,zEng0:0.1,zEng1:wb/2});
    const zr=wb/2+0.2,zd=0.12,yt=yf+((late?1.05:1.15)-yf)*V.hood,rk=V.rad||'honey';
    if(rk==='dash'){// Рено, Клеман-Байяр: капот «совком» к земле, радиаторы по бокам у щитка
      hood(zr+0.04,zd,0.33,0.4,yf,yf+0.3,yt,{r:0.14,cap:true,louv:0});
      [-1,1].forEach(sd=>{const x0=sd*0.41,x1=sd*0.53;mRBox(M,Math.min(x0,x1),yf-0.02,zd-0.12,Math.max(x0,x1),yt,zd+0.12,0.02,'#26261f','matte');
        tube([[x1,yf-0.02,zd+0.13],[x1,yt,zd+0.13],[x1,yt,zd-0.13],[x1,yf-0.02,zd-0.13]],0.02,K.bright,K.brightMat,4);});}
    else{radiator(zr,0.36,yf-0.02,yt+0.02,rk,{});hood(zr-0.04,zd,0.37,0.4,yf,yt,yt,{louv:hi?(V.louv===null?7:V.louv):0,r:0.08,straps:V.straps&&hi,flutes:V.flutes});}
    mRBox(M,-0.44,yf-0.02,zd-0.05,0.44,yt+0.02,zd+0.05,0.02,'#3a2a1c','wood');
    [-1,1].forEach(sd=>plate([sd*(0.4+0.008),(yf+yt)/2+0.03,(zr+zd)/2],[sd,0,0],[0,0,sd],0.3,0.26,true));
    const zs=-0.3;seat(0.24,zs,yf+0.28,0.2,0.4,0.36,{bucket:true});if(!V.solo)seat(-0.24,zs,yf+0.28,0.2,0.4,0.36,{bucket:true});
    tube([[-0.45,yf+0.02,-0.1],[0.45,yf+0.02,-0.1]],0.03,K.chassis);
    // бак: поперечный цилиндр, продольная «торпеда» или ящик; за ним — запаски стопкой (сзади видна одна, с номером)
    const tc=late?K.bright:col,tm=late?K.brightMat:'paint';let zBack=-1.29;
    if(V.tank==='xcyl')mLathe(M,[0,yf+0.3,-1.05],'x',[[0,-0.42],[0.2,-0.42],[0.24,-0.38],[0.24,0.38],[0.2,0.42],[0,0.42]],hi?14:8,tc,tm);
    else if(V.tank==='zcyl'){mLathe(M,[0,yf+0.33,-1.12],'z',[[0,-0.36],[0.15,-0.35],[0.22,-0.3],[0.23,0.26],[0.19,0.33],[0,0.35]],hi?14:8,tc,tm);zBack=-1.48;}
    else if(V.tank==='box'){mRBox(M,-0.38,yf+0.06,-1.32,0.38,yf+0.5,-0.8,0.07,col,'paint');zBack=-1.32;}
    const nSp=V.spare,sy=yf+0.36,sz0=zBack-0.08;for(let k=0;k<nSp;k++)spare(0,sy,sz0-k*0.12,r,0.1,'z');
    if(nSp)plate([0,sy,sz0-(nSp-1)*0.12-0.058],[0,0,-1],[1,0,0],0.3,0.3,true);else plate([0,yf+0.3,zBack-0.012],[0,0,-1],[1,0,0],0.26,0.2);
    // цепная передача: звёздочки и цепи к задним колёсам
    if((!late||V.chain)&&hi)[-1,1].forEach(sd=>{const x=sd*0.52;mLathe(M,[x,r,-wb/2],'x',[[0.13,-0.01],[0.13,0.01]],12,'#3a3a3e','metal');tube([[x,r+0.13,-wb/2],[x,yf-0.02,-0.25],[x,yf-0.18,-0.25],[x,r-0.13,-wb/2]],0.012,'#2a2a2e','metal',3);});
    steer(0.24,yt+0.1,0.02,0.19,0.8);drvF(0.24,yf+0.3,zs,0.0,yt+0.1);if(S.mech&&!V.solo)mechF(-0.24,yf+0.3,zs);eyeAt(0.24,yf+0.3,zs);
    const ex=V.exh;mTube(M,[[ex*0.52,yf-0.05,0.3],[ex*0.55,yf-0.1,-0.5],[ex*0.56,yf-0.15,-1.3]],0.035,hi?6:4,'#4a4a4e','metal');tailLamp(-ex*0.36,yf+0.1,-1.3);len=[Math.min(late?-1.6:-1.55,sz0-nSp*0.12-0.1),zr+0.12];track=t;
    if(S.acc){tube([[0,yt+0.012,zd],[0,(rk==='dash'?yf+0.3:yt)+0.012,zr-0.05]],0.04,S.acc,'paint',4);}}
  else if(st==='gp1912'||st==='gp1925'){
    const V=mqLook(S),late=st==='gp1925',wb=late?2.4:2.65,t=late?1.25:1.35,r=late?0.36:0.41,yf=r+(late?0.0:0.06),tw=late?0.13:0.11;chassis(wb,t,r,r,tw,{yf,fw:0.3,zEng0:0.2,zEng1:wb/2});
    const zr=wb/2+0.14,top=late?0.92:1.02,w=late?0.26:0.3,yb=late?r-0.05:yf-0.02;
    radiator(zr,w,yb+0.06,top,V.rad&&V.rad!=='dash'&&V.rad!=='coil'?V.rad:late&&S.acc!=='#1F4E9C'?'vert':late?'round':'vert',{});
    // обтекаемый корпус: капот, кокпит и хвост по марке — острый, округлый с запасками, «лодочкой» вверх или длинный (Мармон «Оса»)
    const P=(z,ww,yy,rr)=>({z,p:rsec(ww,ww*0.95,yb,yy,0.05,rr,n,'o')}),tl=V.tail;
    const body=[P(zr-0.02,w,top,0.1),P(0.5,w+0.03,top+0.01,0.12),P(0.05,w+0.1,top-0.02,0.12),P(-0.4,w+0.12,top-0.04,0.14)];
    let zt=-1.58;
    if(tl==='round'){body.push(P(-0.95,w+0.1,top-0.06,0.16),P(-1.18,w+0.02,top-0.1,0.2),P(-1.26,w*0.72,top-0.16,0.14));zt=-1.26;}
    else if(tl==='boat')body.push(P(-0.9,w+0.07,top-0.05,0.14),P(-1.3,w*0.55,top-0.06,0.1),P(-1.62,0.05,top-0.1,0.02));
    else if(tl==='long'){body.push(P(-0.9,w+0.08,top-0.06,0.14),P(-1.5,w*0.62,top-0.1,0.12),P(-2.05,w*0.3,top-0.2,0.08),P(-2.35,0.03,yb+0.35,0.02));zt=-2.35;}
    else body.push(P(-0.9,w+0.06,top-0.08,0.14),P(-1.3,w*0.5,top-0.16,0.1),P(-1.58,0.04,yb+0.3,0.02));
    mLoft2(M,body,col,'paint',{wrap:true});mCap(M,body[0],col,'paint',1);if(tl==='round')mCap(M,body[body.length-1],col,'paint',-1);
    // вырез кокпита — тёмная ниша, кант, сиденье
    const solo=late||!S.mech||V.solo,sx=solo?0.1:0.18,zc0=0.02,zc1=-0.72;
    mFace(M,[[-(w+0.06),top+0.012,zc0],[w+0.06,top+0.012,zc0],[w+0.08,top-0.02,zc1],[-(w+0.08),top-0.02,zc1]],'#1a1512','leather',[0,0,-0.35]);
    tube([[-(w+0.06),top+0.02,zc0],[w+0.06,top+0.02,zc0],[w+0.08,top-0.01,zc1],[-(w+0.08),top-0.01,zc1],[-(w+0.06),top+0.02,zc0]],0.018,K.leather,'leather',4);
    if(late)mFace(M,[[-0.12,top+0.02,zc0+0.02],[0.12,top+0.02,zc0+0.02],[0.1,top+0.14,zc0-0.03],[-0.1,top+0.14,zc0-0.03]],K.glass,'glass',[0,top,zc0-1],true);
    // обтекатель-«горб» за головой пилота
    if(V.hump)mLoft2(M,[{z:zc1,dx:sx,p:rsec(0.13,0.1,top-0.04,top+0.22,0.02,0.1,n,'n')},{z:zc1-0.35,dx:sx,p:rsec(0.1,0.07,top-0.06,top+0.12,0.02,0.07,n,'n')},{z:zc1-0.7,dx:sx,p:rsec(0.04,0.03,top-0.08,top-0.02,0.01,0.02,n,'n')}],col,'paint');
    steer(sx,top+0.13,0.1,0.19,0.95);drvF(sx,yb+0.28,-0.22,0.08,top+0.13);if(!solo)mechF(-sx,yb+0.28,-0.22);eyeAt(sx,yb+0.28,-0.22);
    const ex=V.exh;mTube(M,[[ex*(w+0.1),yb+0.12,0.6],[ex*(w+0.16),yb+0.1,-0.2],[ex*(w+0.17),yb+0.08,-1.1]],0.04,hi?6:4,'#9ea3aa','chrome');
    // запаски: в нише острого хвоста — одна; за округлым хвостом — две стопкой с номером
    let lz=Math.max(zt+0.06,-1.52),lx=-ex*0.12,ly=yb+0.2;
    if(!late&&tl==='round'){for(let k=0;k<2;k++)spare(0,yb+r+0.02,zt-0.1-k*0.12,r,0.1,'z');plate([0,yb+r+0.02,zt-0.1-0.12-0.058],[0,0,-1],[1,0,0],0.3,0.3,true);lx=-ex*0.22;ly=yb+0.02;lz=zt-0.02;zt-=0.4;}
    else if(!late&&tl!=='long')spare(0,top-0.02,-1.25,r,0.1,'z');
    if(tl==='long'&&hi){tube([[sx,top+0.1,-0.1],[sx+0.12,top+0.42,0.05]],0.01,'#8a8f96','chrome',4);mFace(M,[[sx+0.04,top+0.38,0.07],[sx+0.2,top+0.38,0.03],[sx+0.2,top+0.48,0.03],[sx+0.04,top+0.48,0.07]],'#d8dde2','chrome',[sx,top+0.43,-1],true);}
    [-1,1].forEach(sd=>plate([sd*(w+0.105),(yb+top)/2+0.02,-0.95],[sd,0,0],[0,0,sd],0.3,0.3,true));
    tailLamp(lx,ly,lz);len=[Math.min(-1.62,zt-0.04),zr+0.1];track=t;
    if(S.acc)tube([[0,top+0.014,0.06],[0,top+0.014,zr-0.04]],0.035,S.acc,'paint',4);
    if(S.num&&hi){const f=mFace(M,[[-0.2,top-0.1,-1.02],[0.2,top-0.1,-1.02],[0.2,top-0.1,-0.72],[-0.2,top-0.1,-0.72]],col,'paint',[0,0,0]);}}
  else if(st==='van'||st==='truck'){
    const truck=st==='truck',big=S.b==='b8',wb=truck?(big?3.6:3.2):2.55,t=1.45,rF=truck?0.46:0.44,rR=truck?0.5:0.44,solid=truck&&y<1926,yf=rR+0.16;
    if(truck||y<1912)wt='wood';chassis(wb,t,rF,rR,truck?0.12:0.08,{dual:big,solid,yf,fw:0.42,zEng0:wb/2-0.9,zEng1:wb/2});
    const zr=wb/2+0.3,zd=wb/2-0.5,yt=yf+0.62;radiator(zr,0.34,yf,yt,y<1906?'honey':'vert',{apron:true});hood(zr-0.04,zd,0.36,0.4,yf,yt,yt+0.02,{louv:hi?6:0});
    headlamp(0.42,yt-0.05,zr-0.15,0.1,y<1920?'drum':'bowl');headlamp(-0.42,yt-0.05,zr-0.15,0.1,y<1920?'drum':'bowl');
    // кабина: открытая спереди с крышей на стойках
    const zc0=zd,zc1=zd-0.75,yb=yf+0.05,cw=0.62;tub([[zc0,cw,yt+0.05],[zc1,cw,yt+0.05]],yb,{floor:yb+0.1});
    seat(0,zc1+0.5,yb+0.38,0.55,0.4,0.42,{});steer(0.25,yt+0.28,zc0-0.22,0.19,0.8);drvF(0.25,yb+0.35,zc1+0.5,zc0-0.26,yt+0.28);if(S.mech)mechF(-0.25,yb+0.35,zc1+0.5);eyeAt(0.25,yb+0.35,zc1+0.5);
    const yr=yt+1.0;[-1,1].forEach(sd=>{tube([[sd*cw,yt+0.05,zc0-0.02],[sd*cw,yr,zc0-0.06]],0.025,K.dark,'paint',4);});
    mRBox(M,-cw-0.06,yr,zc1-0.1,cw+0.06,yr+0.06,zc0+0.08,0.03,K.dark,'paint');windscreen(zc0-0.02,cw-0.04,yt+0.08,yr-0.08,{lean:0.03});
    const z1=zc1-0.05,z0=truck?-wb/2-0.95:-wb/2-0.55;
    if(truck){const by=Math.max(yf,rR*2+0.04);[-1,1].forEach(sd=>B(sd*0.4-0.05,yf-0.05,z0+0.1,sd*0.4+0.05,by,z1-0.1,K.chassis,'paint'));B(-0.98,by,z0,0.98,by+0.1,z1,'#6a4a2c','wood');
      [-1,1].forEach(sd=>{B(sd*0.98-0.04,by+0.1,z0,sd*0.98+0.04,by+0.5,z1,'#8a6a44','wood');for(let k=0;k<=4;k++){const z=z0+(z1-z0)*k/4;B(sd*0.98-0.05,by+0.1,z-0.04,sd*0.98+0.05,by+0.56,z+0.04,'#5a4028','wood');}});
      B(-0.98,by+0.1,z0,0.98,by+0.5,z0+0.06,'#8a6a44','wood');
      [-1,1].forEach(sd=>{const x=sd*(t/2+(big?tw0+0.05:0));mSweep(M,x,arcPath(rF,wb/2,rF+0.07,-0.3,Math.PI*0.7,hi?10:5),0.3,0.03,K.dark,[rF,wb/2]);});}
    else{const P=(z,w,h,rr)=>({z,p:rsec(w,w-0.02,yf+0.05,yf+h,0.02,rr,n,'o')});const box=[P(z1,0.74,1.45,0.08),P(z0+0.05,0.74,1.45,0.08),P(z0,0.72,1.43,0.06)];
      mLoft2(M,box,col,'paint',{wrap:true});mCap(M,box[2],col,'paint',-1);mCap(M,box[0],col,'paint',1);
      [-1,1].forEach(sd=>tube([[sd*0.745,yf+0.25,z1-0.15],[sd*0.745,yf+1.3,z1-0.15],[sd*0.745,yf+1.3,z0+0.2],[sd*0.745,yf+0.25,z0+0.2],[sd*0.745,yf+0.25,z1-0.15]],0.006,shade(col,0.35),'paint',3));
      tube([[0,yf+0.12,z0-0.004],[0,yf+1.4,z0-0.004]],0.006,shade(col,-0.5),'paint',3);wings(wb,t,rF,{boardY:yf-0.02,frameY:yf,fwIn:0.42});}
    sideLamp(cw+0.06,yt,zc0-0.05);sideLamp(-cw-0.06,yt,zc0-0.05);tailLamp(0.62,yf+0.25,z0-0.03);len=[z0-0.05,zr+0.12];track=t+(big?0.3:0);}
  else{ // серийные: runabout, sport, tonneau, tourer, sedan
    const b=S.b||'',sedan=st==='sedan',tour=st==='tourer',ton=st==='tonneau',sport=st==='sport',run=st==='runabout',limo=b==='b11',coach=b==='b9',steel=b==='b5';
    const raceabout=sport&&y<1920,boat=sport&&y>=1920;
    const r=r0+(lux?0.01:0),tw=tw0,yf=y<1914?r+0.12:y<1922?r+0.08:r+0.03;
    const wb=(run?1.95:sport?(raceabout?2.75:2.6):ton?2.25:tour?2.9:limo?3.1:coach?2.6:2.85)+hk,t=run?1.3:1.38;
    if(y>=1922&&(sedan||tour)&&wt==='wood')wt=S.wheel==='wire'?'wire':'disc';
    chassis(wb,t,r,r,tw,{yf,fw:0.36,zEng0:wb/2-0.9,zEng1:wb/2+0.1});
    // перёд: радиатор, капот
    const curved=run&&y<1908&&(S.hp||0)<=1;
    const zr=wb/2+(run?0.08:0.2),Lh=(run?0.5:sport?1.15:0.95)+hk,zd=zr-Lh,wh=run?0.29:sport?0.31:0.34,yh=yf+(run?0.45:sport?0.52:0.56)+(lux?0.04:0);
    const rk=y<1901?'coil':y<1906?'honey':lux&&y>=1908?(y<1925?'round':'vee'):y>=1922&&!run?'shutter':'vert';
    if(curved){ // «Кёрвд дэш»: вместо капота — изогнутый передок, мотор под сиденьем
      const P=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI*0.5;P.push([yf+0.05+Math.sin(a)*0.5,zr-0.2+Math.cos(a)*0.28-0.28]);}
      const G=P.map(([yy,z])=>[[-0.42,yy,z],[0.42,yy,z]]);mGrid(M,G,col,'paint',{ref:()=>[0,yf-0.4,zr-0.9],two:true});}
    else{radiator(zr,wh-0.02,yf-0.02,yh+(rk==='round'?0.05:0.02),rk,{mascot:lux&&y>=1911,apron:!strip&&!sport});
      hood(zr-0.04,zd,wh,wh+(sport?0.02:0.03),yf,yh,yh+(y>=1911&&!run?0.03:0),{louv:hi?(sport?9:6):0,r:y<1908?0.07:0.11,straps:sport&&hi,pipes:sport&&y>=1926&&(S.hp||0)>=4&&hi});}
    // торпедо: плавный переход от капота к кузову
    const bw=sedan||tour||limo?(y>=1920?0.7:0.66):ton?0.62:run?0.5:sport?0.47:0.6,rimY=yf+(run?0.42:sport?(raceabout?0.3:0.36):y<1911?0.55:0.46),scY=yh+(y>=1911?0.06:0);
    let zb=zd;
    if(!curved&&(y>=1910||sport)&&!run){const zs=zd-0.35,S0={z:zd,p:rsec(wh+0.03,(wh+0.03)*0.97,yf,yh+0.03,0.02,0.11,n,'o')},S1={z:zd-0.18,p:rsec(bw-0.04,bw*0.9,yf,scY,0.04,0.16,n,'o')},S2={z:zs,p:rsec(bw,bw*0.93,yf,scY,0.04,0.14,n,'o')};
      mLoft2(M,[S0,S1,S2],col,'paint',{wrap:true});zb=zs;}
    else if(!curved){mRBox(M,-bw,yf-0.02,zd-0.05,bw,yh+0.05,zd+0.02,0.02,'#4a3220','wood');}
    const zr0=-wb/2-(sport?(raceabout?0.35:0.75):run?0.35:ton?0.62:0.58);
    // кузов по облику
    let seats1=zb-0.45;
    if(run){const P=[[zb,bw,rimY],[zb-0.5,bw,rimY],[zb-0.85,bw,rimY-0.05],[zr0+0.08,bw*0.96,rimY-0.05],[zr0,bw*0.85,rimY-0.06]];tub(P,yf-0.02,{floor:yf+0.08});
      seat(0,zb-0.25,yf+0.34,0.46,0.42,0.32,{});seats1=zb-0.3;
      if(y>=1903&&!strip)wings(wb,t,r,{cycle:y<1906,w:0.2,boardY:yf-0.06,frameY:yf,fwIn:0.36,crown:0.02,board:y>=1906});}
    else if(raceabout){ // Mercer Raceabout, Stutz Bearcat: два «ковша», круглый бак, запаски — и никакого кузова
      mRBox(M,-0.44,yf-0.02,zb-0.7,0.44,yf+0.12,zb+0.02,0.03,col,'paint');
      seat(0.22,zb-0.2,yf+0.36,0.2,0.36,0.34,{bucket:true});seat(-0.22,zb-0.2,yf+0.36,0.2,0.36,0.34,{bucket:true});seats1=zb-0.25;
      mLathe(M,[0,yf+0.34,zb-0.95],'x',[[0,-0.45],[0.22,-0.45],[0.26,-0.4],[0.26,0.4],[0.22,0.45],[0,0.45]],hi?16:8,y<1914?K.bright:col,y<1914?K.brightMat:'paint');
      spare(0,yf+0.38,zb-1.3,r,tw,'z');wings(wb,t,r,{cycle:true,w:tw+0.12,crown:0.02});
      if(y>=1911)mFace(M,[[0.1,yh+0.08,zd-0.12],[0.34,yh+0.08,zd-0.12],[0.34,yh+0.34,zd-0.16],[0.1,yh+0.34,zd-0.16]],K.glass,'glass',[0.2,yh,zd-1],true);}
    else if(boat||sport){ // родстер 1920-х: низкий двухместный кузов, заострённый хвост
      const P=[[zb,bw,rimY],[zb-0.9,bw,rimY],[zr0+0.55,bw*0.94,rimY-0.02],[zr0+0.25,bw*0.7,rimY-0.06],[zr0+0.05,bw*0.28,rimY-0.12],[zr0,0.04,rimY-0.16]];
      tub(P,yf-0.02,{floor:yf+0.06,tumble:0.97});seat(0.22,zb-0.3,yf+0.26,0.21,0.4,0.36,{bucket:true});seat(-0.22,zb-0.3,yf+0.26,0.21,0.4,0.36,{bucket:true});seats1=zb-0.35;
      // «хвост» закрыт крышкой
      mLoft2(M,[{z:zb-0.95,p:rsec(bw-0.02,bw-0.04,rimY-0.04,rimY+0.03,0.01,0.1,n,'n')},{z:zr0+0.25,p:rsec(bw*0.7,bw*0.66,rimY-0.08,rimY-0.02,0.01,0.08,n,'n')},{z:zr0+0.02,p:rsec(0.06,0.05,rimY-0.16,rimY-0.13,0.01,0.02,n,'n')}],col,'paint');
      mFace(M,[[-0.42,yh+0.1,zd-0.2],[0.42,yh+0.1,zd-0.2],[0.4,yh+0.3,zd-0.28],[-0.4,yh+0.3,zd-0.28]],K.glass,'glass',[0,yh,zd-1],true);tube([[-0.42,yh+0.1,zd-0.2],[-0.4,yh+0.3,zd-0.28],[0.4,yh+0.3,zd-0.28],[0.42,yh+0.1,zd-0.2]],0.01,K.bright,K.brightMat,4);
      if(y>=1924&&(S.hp||0)>=3)wings(wb,t,r,{w:0.27,boardY:yf-0.08,frameY:yf,fwIn:0.36,crown:0.04,col:col});else wings(wb,t,r,{cycle:true,w:tw+0.14,crown:0.025,col:col});
      spare(0,rimY-0.05,zr0-0.02,r,tw,'z');}
    else if(ton){ // тонно: передний диван и задняя «бочка» с дверцей сзади
      const P=[[zb,bw,rimY],[zb-0.5,bw,rimY],[zb-0.62,bw*1.02,rimY+0.04],[zb-0.8,bw*1.08,rimY+0.06],[zr0+0.25,bw*1.08,rimY+0.06],[zr0+0.06,bw*0.92,rimY+0.05],[zr0,bw*0.7,rimY+0.04]];
      tub(P,yf-0.02,{floor:yf+0.1,tumble:1.02});seat(0,zb-0.1,yf+0.4,0.5,0.4,0.34,{});seat(0,zr0+0.62,yf+0.42,0.5,0.34,0.36,{});seats1=zb-0.15;
      if(hi)tube([[-0.22,yf+0.06,zr0-0.01],[-0.22,rimY,zr0-0.01],[0.22,rimY,zr0-0.01],[0.22,yf+0.06,zr0-0.01]],0.005,shade(col,-0.5),'paint',3);
      if(!strip)wings(wb,t,r,{boardY:yf-0.05,frameY:yf,fwIn:0.4,w:0.24});}
    else if(tour||(sedan&&limo)){ // туринг/фаэтон: два ряда сидений, двери; у лимузина — закрытый задний салон
      const high=y<1911,P=high?[[zb,bw,rimY],[zb-0.55,bw,rimY],[zb-0.7,bw*1.03,rimY+0.06],[zr0+0.35,bw*1.05,rimY+0.1],[zr0+0.1,bw*0.98,rimY+0.1],[zr0,bw*0.8,rimY+0.08]]
        :[[zb,bw,rimY],[zr0+0.3,bw,rimY],[zr0+0.1,bw*0.96,rimY-0.01],[zr0,bw*0.84,rimY-0.02]];
      tub(P,yf-0.02,{floor:yf+0.1,doors:y>=1911?[[zb-0.05,zb-0.72],[zr0+1.15,zr0+0.45]]:[[zr0+1.1,zr0+0.5]],coach:lux?'#c9a24a':null,tumble:high?1.02:0.985});
      seat(0,zb-0.25,yf+0.38,0.52,0.42,0.36,{});seats1=zb-0.3;
      if(limo){cabin(zb-0.9,zr0+0.05,bw-0.01,rimY,rimY+(y<1920?0.82:0.74),{wins:[[zb-1.0,zb-1.45],[zb-1.55,zr0+0.18]],rack:lux,visor:y>=1916,roofCol:K.dark});
        if(y>=1908)windscreen(zb+0.02,bw-0.08,scY-0.01,scY+0.5,{split:y<1916,stays:true});}
      else{seat(0,zr0+0.55,yf+0.4,0.56,0.42,0.38,{});
        if(!strip&&y>=1908){windscreen(zb+0.02,bw-0.08,scY-0.01,scY+0.52,{split:y<1918,stays:true});
          // сложенный тент за задним сиденьем
          const zt=zr0+0.12,yt=rimY+0.16;mLathe(M,[0,yt,zt],'x',[[0,-bw+0.02],[0.1,-bw+0.02],[0.12,-bw+0.08],[0.12,bw-0.08],[0.1,bw-0.02],[0,bw-0.02]],hi?12:6,K.canvas,'cloth');
          if(hi)[-1,1].forEach(sd=>tube([[sd*(bw-0.01),yt,zt],[sd*(bw+0.01),rimY-0.08,zt+0.35]],0.012,K.dark,'paint',3));}}
      if(!strip)wings(wb,t,r,{boardY:yf-0.06,frameY:yf,fwIn:0.4,w:y>=1920?0.3:0.26,crown:y>=1916?0.05:0.035});}
    else{ // седан, «коуч»: закрытый кузов целиком
      const P=[[zb,bw,rimY],[zr0+0.25,bw,rimY],[zr0+0.08,bw*0.97,rimY-0.02],[zr0,bw*0.9,rimY-0.04]];
      tub(P,yf-0.02,{floor:yf+0.1,doors:coach?[[zb-0.1,zb-1.05]]:[[zb-0.1,zb-0.85],[zb-0.9,zb-1.62]]});
      const ytop=rimY+(steel?0.72:y>=1920?0.76:0.84);
      cabin(zb+0.04,zr0+0.06,bw,rimY,ytop,{wins:coach?[[zb-0.12,zb-1.05],[zb-1.12,zr0+0.3]]:[[zb-0.12,zb-0.84],[zb-0.92,zb-1.6],[zb-1.66,zr0+0.3]],round:steel,visor:y>=1916,roofCol:steel||y>=1922?col:K.dark,frame:shade(col,-0.4)});
      seat(0,zb-0.3,yf+0.38,0.54,0.4,0.36,{});seats1=zb-0.32;
      wings(wb,t,r,{boardY:yf-0.06,frameY:yf,fwIn:0.4,w:y>=1920?0.3:0.26,crown:0.05});}
    // фары, фонари, клаксон, бамперы, руль
    if(!curved&&y>=1901&&!strip){const hy=yh-0.02,hz=zr-0.12,hr=lux?0.12:0.1,kind=y<1916?'drum':'bowl';
      if(y<1916){headlamp(0.42,hy,hz,hr,'drum');headlamp(-0.42,hy,hz,hr,'drum');}
      else{const by=yf+0.02;tube([[-0.46,by,zr-0.02],[0.46,by,zr-0.02]],0.014,K.bright,K.brightMat,5);headlamp(0.42,by+0.2,zr-0.02,hr+0.02,'bowl');headlamp(-0.42,by+0.2,zr-0.02,hr+0.02,'bowl');
        [-1,1].forEach(sd=>tube([[sd*0.42,by,zr-0.02],[sd*0.42,by+0.12,zr-0.02]],0.012,K.bright,K.brightMat,4));}
      if(y<1916&&!sport)[-1,1].forEach(sd=>sideLamp(sd*(bw+0.06),scY-0.1,zb-0.02));}
    if(curved)[-1,1].forEach(sd=>sideLamp(sd*0.46,yf+0.35,zr-0.2));
    if(y<1918&&!strip&&!curved&&hi)horn(bw+0.08,scY-0.05,zb-0.1);
    if(y>=1916&&!sport&&!strip){bumper(zr+0.28,0.72,yf-0.02);bumper(zr0-0.12,0.72,yf-0.02);}
    const sx=run||sport?0.22:0.26,sy=rimY+(run?0.16:0.2);
    if(curved){tube([[0.18,yf+0.34,zb-0.05],[0.18,yf+0.6,zb+0.05],[0.02,yf+0.62,zb-0.02]],0.014,'#2a2a2e','paint',4);}
    else steer(sx,sy+0.1,seats1+0.3,0.19,0.85);
    if(!sedan&&!limo)levers(bw+0.02,yf+0.1,seats1-0.1);
    tailLamp(bw-0.1,yf+0.2,zr0-0.02);if(S.num)plate([0,yf+0.3,zr0-0.012],[0,0,-1],[1,0,0],0.3,0.22);
    drvF(sx,yf+0.36,seats1,seats1+0.25,sy+0.1);if(S.mech&&!(sedan&&!limo))mechF(-sx,yf+0.36,seats1);eyeAt(sx,yf+0.36,seats1);
    if(S.acc&&S.num)tube([[0,yh+0.012,zd],[0,yh+0.012,zr-0.05]],0.03,S.acc,'paint',4);
    len=[zr0-0.15,zr+0.3];track=t;}
  M.len=len;M.track=track;return M;
}
