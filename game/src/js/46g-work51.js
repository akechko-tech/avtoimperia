/* ================= 0.51, тема 10: ТРЁХМЕРНЫЕ МОДЕЛИ НОВОЙ ТЕХНИКИ =================
   С этапа 4 завод строит весь ряд техники эпохи, но в 3D у тяжёлого грузовика, тягача, пожарной машины, цистерны, самосвала, мусоровоза,
   тракторов, бронеавтомобиля и танка был один облик — «грузовик с бортами», а в карточке модели — рисунок сбоку (ТЗ: «трёхмерных моделей
   нет»). Здесь у каждого вида свой кузов: carModel (46b-cars.js) зовёт workModel51 и отдаёт ей свои «детали» (шасси, капот, радиатор,
   кабина, экипаж). Санитарная и почтовая машины — фургон со знаком (vanDeco51).
   Облик — по общим приметам вида и времени (ранний трактор — рама, котёл-радиатор, навес; с 1915 года — малый, безрамный; ранний
   гусеничный — с рулевым колесом впереди; танк — высокие гусеницы, башня, «хвост»); точные чертежи образцов не воспроизводятся. */
function workKind51(S){if(!S||!S.b||S.style==='moto')return '';let b=null;try{b=byId(BODIES,S.b);}catch(_){}if(!b)return '';const k=typeof bodyKind==='function'?bodyKind(b):'';
  if(S.b==='b12')return 'heavy';if(S.b==='b13')return 'semi';return {fire:'fire',tank:'tanker',dump:'dump',refuse:'refuse',tractor:'tractor',crawler:'crawler',armored:'armored',ltank:'ltank'}[k]||'';}
// выпуклая оболочка точек [z,y] — контур гусеницы; обход против часовой стрелки
function wkHull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const p of P){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  lo.pop();up.pop();return lo.concat(up);}
// контур гусеницы: два колеса (переднее и заднее) и опорная линия по земле; точки — с шагом step (звенья)
function wkLoop(zf,yf,rf,zr,yr,rr,g0,g1,step){const P=[];for(let k=0;k<24;k++){const a=k/24*Math.PI*2;P.push([zf+Math.cos(a)*rf,yf+Math.sin(a)*rf],[zr+Math.cos(a)*rr,yr+Math.sin(a)*rr]);}
  P.push([g0,0],[g1,0]);const H=wkHull(P),out=[];for(let i=0;i<H.length;i++){const a=H[i],b=H[(i+1)%H.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(d/step));for(let k=0;k<n;k++)out.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}
  return out;}
// гусеница: лента по контуру (звенья — поперечные полосы), борта ленты, рама внутри
function wkTrack(X,x,w,loop,o){o=o||{};const {M,hi}=X,col=o.col||'#3a3b3e',n=loop.length,cz=loop.reduce((a,p)=>a+p[0],0)/n,cy=loop.reduce((a,p)=>a+p[1],0)/n,th=o.th||0.06;
  const L=hi?loop:loop.filter((p,i)=>i%2===0),A=L.map(p=>[x-w/2,p[1],p[0]]),Bq=L.map(p=>[x+w/2,p[1],p[0]]);
  const f=mGrid(M,[A,Bq],col,'metal',{wrap:true,ref:()=>[x,cy,cz]});if(hi)f.forEach(q=>{q.deco=[{a:[q.p[0][0],(q.p[0][1]+q.p[1][1])/2,(q.p[0][2]+q.p[1][2])/2],b:[q.p[3][0],(q.p[3][1]+q.p[2][1])/2,(q.p[3][2]+q.p[2][2])/2],w:0.022,c:'#17181a'}];});
  // борта ленты: кольцо между внешним контуром и внутренним (ближе к центру на th)
  const In=L.map(p=>{const dz=p[0]-cz,dy=p[1]-cy,d=Math.hypot(dz,dy)||1;return [p[0]-dz/d*th,p[1]-dy/d*th];});
  [-1,1].forEach(sd=>{const xx=x+sd*w/2;mGrid(M,[L.map(p=>[xx,p[1],p[0]]),In.map(p=>[xx,p[1],p[0]])],shade(col,-0.2),'metal',{wrap:true,ref:()=>[xx-sd,cy,cz],two:true});});
  mGrid(M,[In.map(p=>[x-w/2,p[1],p[0]]),In.map(p=>[x+w/2,p[1],p[0]])],shade(col,-0.35),'metal',{wrap:true,ref:()=>[x,cy,cz],inv:true,two:true});
  // рама тележки: тёмная плита между катками
  const fr=o.frame||'#232427',side=x>=0?1:-1;mFace(M,In.map(p=>[x+side*w*0.32,p[1],p[0]]),fr,'paint',[x-side,cy,cz],true);}
// вращающаяся деталь (колесо, звёздочка): грани метятся номером колеса
function wkWheel(X,cx,cy,cz,r,steer,draw){const M=X.M;M.wheels.push([cx,cy,cz,steer?-r:r]);MTAG.w=M.wheels.length;draw();MTAG.w=0;}
// стальное колесо трактора: обод-лента с грунтозацепами, спицы, ступица; катки и звёздочки гусениц — диск со спицами-линиями
function wkSteelWheel(X,cx,r,cz,w,steer,o){o=o||{};const {M,hi}=X,side=cx>=0?1:-1,seg=hi?20:10,c=[cx,r,cz],col=o.col||'#8a2a22',rim=o.rim||'#55585d';
  wkWheel(X,cx,r,cz,r,steer,()=>{const f=mLathe(M,c,'x',[[r,-w/2],[r,w/2]],seg,rim,'metal',{two:true});
    if(o.lugs)f.forEach((q,i)=>{q.deco=[{a:q.p[0],b:q.p[2],w:0.045,c:'#2a2b2e'}];});else if(o.rib)f.forEach(q=>{q.deco=[{a:[cx,(q.p[0][1]+q.p[3][1])/2,(q.p[0][2]+q.p[3][2])/2],b:[cx,(q.p[1][1]+q.p[2][1])/2,(q.p[1][2]+q.p[2][2])/2],w:0.03,c:'#2a2b2e'}];});
    [-1,1].forEach(sd=>mLathe(M,[cx+sd*w/2,r,cz],'x',[[r-0.05,0],[r,0]],seg,shade(rim,-0.15),'metal',{two:true}));
    mLathe(M,c,'x',[[0,-0.1],[0.075,-0.085],[0.075,0.085],[0,0.1]],hi?10:6,col,'paint');
    const ns=o.spokes||(hi?10:6);for(let k=0;k<ns;k++){const a=k/ns*Math.PI*2,sn=Math.sin(a),cs=Math.cos(a),off=(k%2?1:-1)*w*0.28;mTube(M,[[cx,r+sn*0.07,cz+cs*0.07],[cx+off,r+sn*(r-0.03),cz+cs*(r-0.03)]],0.016,3,col,'paint');}});}
function wkDisc(X,cx,cy,cz,r,w,col,spokes){const {M,hi}=X,side=cx>=0?1:-1,seg=hi?16:8;wkWheel(X,cx,cy,cz,r,false,()=>{mLathe(M,[cx,cy,cz],'x',[[r,-w/2],[r,w/2]],seg,col,'metal',{two:true});
    const f=mLathe(M,[cx+side*w/2,cy,cz],'x',[[r,0],[0.05,0.012*side],[0,0.03*side]],seg,shade(col,0.08),'paint',{two:true});
    if(spokes&&hi){const d=[];for(let k=0;k<spokes;k++){const a=k/spokes*Math.PI*2;d.push({a:[cx+side*(w/2+0.016),cy+Math.sin(a)*r*0.2,cz+Math.cos(a)*r*0.2],b:[cx+side*(w/2+0.004),cy+Math.sin(a)*r*0.93,cz+Math.cos(a)*r*0.93],w:0.03,c:shade(col,-0.4)});}if(f[0])f[0].deco=d;}});}
// ноги водителя там, где их видно (трактор): бедро вперёд, голень вниз, башмак
function wkLegs(X,x,seatY,z,fz,fy,col){if(!X.crew)return;const {M,hi}=X;MTAG.l=3;[-1,1].forEach(sd=>{const H=[x+sd*0.1,seatY+0.1,z+0.04],Kn=[x+sd*0.16,seatY+0.17,z+0.42],F=[x+sd*0.16,fy+0.07,fz];
    mTube(M,[H,Kn],[0.085,0.07],hi?8:4,col,'cloth');mTube(M,[Kn,F],[0.066,0.052],hi?8:4,col,'cloth');mRBox(M,F[0]-0.05,fy,fz-0.07,F[0]+0.05,fy+0.09,fz+0.19,0.02,'#2a1e16','leather');});MTAG.l=0;}
// эллиптический бак вдоль машины: полуоси rx, ry, центр по высоте yc, от z1 (перёд) до z0, выпуклые днища
function wkTank(X,rx,ry,yc,z1,z0,col,mat){const {M,hi}=X,n=hi?18:10,ring=k=>{const p=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;p.push([Math.cos(a)*rx*k,yc+Math.sin(a)*ry*k]);}return p;};
  const S=[[z1,0.5],[z1-0.07,0.86],[z1-0.16,1],[z0+0.16,1],[z0+0.07,0.86],[z0,0.5]].map(([z,k])=>({z,p:ring(k)}));mLoft2(M,S,col,mat||'paint',{wrap:true});mCap(M,S[0],col,mat||'paint',1);mCap(M,S[5],col,mat||'paint',-1);}
// Перёд грузовой машины: шасси, радиатор, капот, фары, открытая кабина с сиденьем, рулём и экипажем, крыша на стойках
function wkFront(X,o){const {M,S,K,hi,y,B,tube}=X,wb=o.wb,t=o.t||1.45,rF=o.rF,rR=o.rR,yf=rR+0.16,zr=wb/2+0.3,zd=wb/2-0.5,yt=yf+(o.hh||0.62),cw=o.cw||0.62,dk=o.cabCol||K.dark;
  X.setWt(o.wt||'wood');X.chassis(wb,t,rF,rR,o.tw||0.12,{dual:o.dual,solid:o.solid,yf,fw:0.42,zEng0:wb/2-0.9,zEng1:wb/2});
  X.radiator(zr,0.34,yf,yt,y<1906?'honey':'vert',{apron:true});X.hood(zr-0.04,zd,0.36,0.4,yf,yt-(o.snub||0),yt+0.02,{louv:hi?6:0});
  const lk=y<1920?'drum':'bowl';X.headlamp(0.42,yt-0.05,zr-0.15,0.1,lk);X.headlamp(-0.42,yt-0.05,zr-0.15,0.1,lk);
  const zc0=zd,zc1=zd-0.75,yb=yf+0.05;X.tub([[zc0,cw,yt+0.05],[zc1,cw,yt+0.05]],yb,{floor:yb+0.1});
  X.seat(0,zc1+0.5,yb+0.38,0.55,0.4,0.42,{});X.steer(0.25,yt+0.28,zc0-0.22,0.19,0.8);X.drvF(0.25,yb+0.35,zc1+0.5,zc0-0.26,yt+0.28);if(S.mech||o.mate)X.mechF(-0.25,yb+0.35,zc1+0.5);X.eyeAt(0.25,yb+0.35,zc1+0.5);
  const yr=yt+1.0;
  if(o.roof!==false){[-1,1].forEach(sd=>tube([[sd*cw,yt+0.05,zc0-0.02],[sd*cw,yr,zc0-0.06]],0.025,dk,'paint',4));mRBox(M,-cw-0.06,yr,zc1-0.1,cw+0.06,yr+0.06,zc0+0.08,0.03,dk,'paint');X.windscreen(zc0-0.02,cw-0.04,yt+0.08,yr-0.08,{lean:0.03});
    if(o.back!==false){B(-cw,yt+0.05,zc1-0.035,cw,yr,zc1,dk,'paint');if(hi)B(-0.2,yt+0.5,zc1-0.04,0.2,yt+0.78,zc1+0.005,'#1e2a33','glass');}}
  else if(y>=1914)X.windscreen(zc0-0.02,cw-0.04,yt+0.08,yt+0.6,{lean:0.03});
  X.sideLamp(cw+0.06,yt,zc0-0.05);X.sideLamp(-cw-0.06,yt,zc0-0.05);
  [-1,1].forEach(sd=>mSweep(M,sd*t/2,arcPath(rF,wb/2,rF+0.07,-0.3,Math.PI*0.7,hi?10:5),0.3,0.03,K.dark,[rF,wb/2]));
  return {wb,t,rF,rR,yf,yt,yr,zr,zd,zc0,zc1,cw,yb,z1:zc1-0.05};}
// лонжероны и надрамник под кузов
function wkRails(X,F,z0,by){[-1,1].forEach(sd=>X.B(sd*0.4-0.05,F.yf-0.05,z0+0.1,sd*0.4+0.05,by,F.z1-0.1,X.K.chassis,'paint'));}
function workModel51(kind,X){const {M,S,K,hi,y,col,B,tube}=X,n=hi?3:1;
  if(kind==='heavy'){// грузовик 5 т: длиннее и выше, сдвоенные литые шины, цепная передача, высокие решётчатые борта
    const F=wkFront(X,{wb:3.9,rF:0.48,rR:0.54,tw:0.15,dual:true,solid:y<1926,hh:0.66,snub:0.1}),z1=F.z1,z0=-F.wb/2-1.25,by=Math.max(F.yf,F.rR*2+0.06);wkRails(X,F,z0,by);
    B(-1.08,by,z0,1.08,by+0.12,z1,'#6a4a2c','wood');
    [-1,1].forEach(sd=>{for(let k=0;k<3;k++)B(sd*1.08-0.03,by+0.16+k*0.25,z0,sd*1.08+0.03,by+0.34+k*0.25,z1,'#8a6a44','wood');const np=hi?6:3;for(let k=0;k<=np;k++){const z=z0+(z1-z0)*k/np;B(sd*1.08-0.06,by+0.1,z-0.045,sd*1.08+0.06,by+0.95,z+0.045,'#5a4028','wood');}});
    B(-1.08,by+0.12,z1-0.07,1.08,by+1.12,z1,'#8a6a44','wood');B(-1.08,by+0.12,z0,1.08,by+0.62,z0+0.06,'#8a6a44','wood');
    if(hi)[-1,1].forEach(sd=>{const zs=-F.wb/2+1.1,ys=F.rR+0.1,x=sd*0.6;mLathe(M,[x,ys,zs],'x',[[0.11,-0.02],[0.11,0.02],[0,0.03]],10,'#2a2b2e','paint',{two:true});mLathe(M,[x,F.rR,-F.wb/2],'x',[[0.26,-0.02],[0.26,0.02]],14,'#2a2b2e','paint',{two:true});
      tube([[x,ys+0.11,zs],[x,F.rR+0.26,-F.wb/2]],0.016,'#3a3b3e','paint',3);tube([[x,ys-0.11,zs],[x,F.rR-0.26,-F.wb/2]],0.016,'#3a3b3e','paint',3);});
    X.tailLamp(0.7,F.yf+0.25,z0-0.03);return {len:[z0-0.05,F.zr+0.12],track:F.t+0.34};}
  if(kind==='semi'){// тягач с полуприцепом: короткий тягач, седло, длинная платформа со своей осью, груз под брезентом
    // колёс с отметкой «вращается» в шейдере шесть: сдвоенные делят номер со своим внутренним колесом (ось вращения у них общая)
    const F=wkFront(X,{wb:2.9,rF:0.46,rR:0.5,tw:0.13,dual:false,solid:y<1926}),by=Math.max(F.yf,F.rR*2+0.06),zt1=F.z1-0.05,zt0=-F.wb/2-5.3,za=zt0+1.15,rT=0.5,sol=y<1926,twin=(tag,x,z,r)=>{MTAG.w=tag;mWheel2(M,x,r,z,r,0.13,'wood',K,sol);MTAG.w=0;};
    twin(2,-(F.t/2+0.16),-F.wb/2,F.rR);twin(4,F.t/2+0.16,-F.wb/2,F.rR);
    mLathe(M,[0,by-0.03,-F.wb/2+0.1],'y',[[0.36,0],[0.36,0.05],[0,0.06]],hi?14:8,'#3a3b3e','metal');
    [-1,1].forEach(sd=>{B(sd*0.42-0.05,by+0.03,zt0+0.1,sd*0.42+0.05,by+0.17,zt1,K.chassis,'paint');
      X.WH(sd*F.t/2,rT,za,rT,0.13,sol,false);twin(M.wheels.length,sd*(F.t/2+0.16),za,rT);
      tube([[sd*0.42,by+0.03,zt1-1.0],[sd*0.42,0.3,zt1-1.05]],0.035,K.chassis,'paint',4);if(hi)mLathe(M,[sd*0.42,0.18,zt1-1.05],'x',[[0.12,-0.04],[0.12,0.04]],8,'#3a3b3e','metal',{two:true});});
    tube([[-F.t/2,rT,za],[F.t/2,rT,za]],0.05,K.chassis,'paint',hi?8:4);
    B(-1.05,by+0.17,zt0,1.05,by+0.27,zt1,'#6a4a2c','wood');
    [-1,1].forEach(sd=>{B(sd*1.05-0.03,by+0.27,zt0,sd*1.05+0.03,by+0.6,zt1,'#8a6a44','wood');const np=hi?8:4;for(let k=0;k<=np;k++){const z=zt0+(zt1-zt0)*k/np;B(sd*1.05-0.055,by+0.22,z-0.04,sd*1.05+0.055,by+0.66,z+0.04,'#5a4028','wood');}});
    B(-1.05,by+0.27,zt1-0.06,1.05,by+0.95,zt1,'#8a6a44','wood');B(-1.05,by+0.27,zt0,1.05,by+0.6,zt0+0.06,'#8a6a44','wood');
    mRBox(M,-0.94,by+0.3,zt0+0.25,0.94,by+1.3,zt1-0.3,0.2,'#8a8262','cloth');
    if(hi)[0.25,0.5,0.75].forEach(k=>{const z=zt0+(zt1-zt0)*k;tube([[-1.0,by+0.5,z],[-0.9,by+1.25,z],[0,by+1.33,z],[0.9,by+1.25,z],[1.0,by+0.5,z]],0.012,'#4a4030','cloth',3);});
    X.tailLamp(0.7,by+0.1,zt0-0.03);return {len:[zt0-0.05,F.zr+0.12],track:F.t+0.34};}
  if(kind==='fire'){// пожарный автомобиль: открытая кабина, насос, рукавная катушка, лестница на стойках, колокол, расчёт на скамье
    const F=wkFront(X,{wb:3.4,rF:0.46,rR:0.5,tw:0.12,solid:y<1920,roof:false,mate:true}),z1=F.z1,z0=-F.wb/2-0.95,by=Math.max(F.yf,F.rR+0.36);wkRails(X,F,z0,by);
    B(-0.92,by,z0,0.92,by+0.1,z1,col,'paint');[-1,1].forEach(sd=>{B(sd*0.92-0.03,by+0.1,z0,sd*0.92+0.03,by+0.42,z1,col,'paint');if(hi)tube([[sd*0.955,by+0.38,z0+0.05],[sd*0.955,by+0.38,z1-0.05]],0.012,K.bright,K.brightMat,3);});
    B(-0.92,by+0.1,z0,0.92,by+0.42,z0+0.05,col,'paint');
    // рукава в кузове, скамья расчёта, насос с воздушным колпаком
    B(-0.86,by+0.1,z0+0.75,0.86,by+0.36,z1-1.1,'#b9a070','cloth');
    X.seat(0,z1-0.12,by+0.5,0.8,0.36,0.34,{});X.mechF(0.42,by+0.47,z1-0.12);X.mechF(-0.42,by+0.47,z1-0.12);
    mLathe(M,[0,by+0.1,z1-0.82],'y',[[0.2,0],[0.23,0.06],[0.23,0.4],[0.15,0.5],[0.06,0.56],[0.09,0.62],[0.12,0.74],[0.07,0.84],[0,0.86]],hi?14:8,K.bright,'metal');
    if(hi)[-1,1].forEach(sd=>{tube([[sd*0.2,by+0.3,z1-0.82],[sd*0.5,by+0.3,z1-0.82],[sd*0.96,by+0.25,z1-0.82]],0.04,K.bright,'metal',5);mLathe(M,[sd*0.97,by+0.25,z1-0.82],'x',[[0.06,-0.02],[0.06,0.03],[0,0.04]],8,K.bright,'metal');});
    // катушка с рукавом сзади
    mLathe(M,[0,by+0.82,z0+0.32],'x',[[0.27,-0.5],[0.27,0.5]],hi?14:8,'#b9a070','cloth');[-1,1].forEach(sd=>{mLathe(M,[sd*0.52,by+0.82,z0+0.32],'x',[[0.34,0],[0.05,0.01*sd],[0,0.02*sd]],hi?14:8,col,'paint',{two:true});tube([[sd*0.56,by+0.42,z0+0.32],[sd*0.56,by+0.82,z0+0.32]],0.025,col,'paint',4);});
    // лестница: стойки и два бруса с перекладинами, над кабиной выступает вперёд
    const yL=F.yt+1.12,zL1=F.zc0+0.35,zL0=z0-0.45;[[z1-0.25],[z0+0.75]].forEach(([z])=>{[-1,1].forEach(sd=>tube([[sd*0.9,by+0.42,z],[sd*0.5,yL-0.04,z]],0.022,col,'paint',4));tube([[-0.5,yL-0.04,z],[0.5,yL-0.04,z]],0.022,col,'paint',4);});
    [-1,1].forEach(sd=>tube([[sd*0.24,yL,zL0],[sd*0.24,yL,zL1]],0.028,'#b58a52','wood',hi?5:3));{const nr=hi?14:6;for(let k=0;k<=nr;k++){const z=zL0+0.1+(zL1-zL0-0.2)*k/nr;tube([[-0.24,yL,z],[0.24,yL,z]],0.014,'#9a7248','wood',3);}}
    // колокол на щитке и фонарь-прожектор
    tube([[-0.42,F.yt+0.05,F.zc0-0.02],[-0.42,F.yt+0.42,F.zc0-0.02]],0.014,K.bright,'metal',3);mLathe(M,[-0.42,F.yt+0.3,F.zc0-0.02],'y',[[0.095,0],[0.085,0.05],[0.05,0.12],[0.02,0.15],[0,0.155]],hi?10:6,'#c9a24a','metal',{two:true});
    X.tailLamp(0.7,F.yf+0.25,z0-0.03);return {len:[zL0-0.05,F.zr+0.12],track:F.t};}
  if(kind==='tanker'){// автоцистерна: овальный бак на ложементах, горловина, краны сзади
    const F=wkFront(X,{wb:3.3,rF:0.46,rR:0.5,tw:0.12,solid:y<1924}),z1=F.z1,z0=-F.wb/2-0.95,by=Math.max(F.yf,F.rR+0.4),rx=0.86,ry=0.6,yc=by+0.14+ry;wkRails(X,F,z0,by);
    [z1-0.5,(z1+z0)/2,z0+0.5].forEach(z=>B(-0.7,by,z-0.07,0.7,by+0.22,z+0.07,'#5a4028','wood'));
    wkTank(X,rx,ry,yc,z1-0.08,z0+0.08,col,'paint');
    if(hi)[z1-0.55,(z1+z0)/2,z0+0.55].forEach(z=>{const P=[];for(let k=0;k<=16;k++){const a=k/16*Math.PI*2;P.push([Math.cos(a)*(rx+0.008),yc+Math.sin(a)*(ry+0.008),z]);}tube(P,0.014,shade(col,-0.4),'paint',3);});
    mLathe(M,[0,yc+ry-0.03,(z1+z0)/2],'y',[[0.2,0],[0.2,0.12],[0.13,0.18],[0,0.19]],hi?12:6,shade(col,-0.15),'paint');
    if(hi){[-1,1].forEach(sd=>{tube([[sd*0.3,yc-ry+0.1,z0+0.12],[sd*0.3,by+0.05,z0-0.05],[sd*0.3,by-0.1,z0-0.06]],0.03,K.bright,K.brightMat,4);B(sd*0.9-0.02,by+0.02,z0+0.4,sd*0.9+0.14,by+0.07,z1-0.4,K.dark,'paint');});
      tube([[0,yc+ry-0.02,z1-0.3],[0,yc+ry+0.04,(z1+z0)/2-0.3]],0.012,K.dark,'paint',3);}
    X.tailLamp(0.7,F.yf+0.25,z0-0.03);return {len:[z0-0.08,F.zr+0.12],track:F.t};}
  if(kind==='dump'){// самосвал: стальной кузов «корытом» с рёбрами, козырёк над кабиной, подъёмник под кузовом
    const F=wkFront(X,{wb:3.3,rF:0.46,rR:0.52,tw:0.14,dual:true,solid:y<1926}),z1=F.z1,z0=-F.wb/2-0.7,by=Math.max(F.yf,F.rR*2+0.06),bc=shade(col,-0.08),wb0=0.82,wt0=1.04,h=0.78;wkRails(X,F,z0,by);
    const sec=z=>({z,p:rsec(wb0,wt0,by+0.06,by+0.06+h,0.04,0.01,n,'u')}),A=sec(z1),Bk=sec(z0);mLoft2(M,[A,Bk],bc,'paint');mCap(M,A,bc,'paint',1);
    if(hi){const ins=z=>({z,p:rsec(wb0-0.03,wt0-0.03,by+0.1,by+0.05+h,0.04,0.01,n,'u')});mLoft2(M,[ins(z1-0.03),ins(z0+0.02)],shade(bc,-0.3),'paint',{inv:true});
      for(let k=0;k<5;k++){const z=z1-0.15-(z1-z0-0.3)*k/4;[-1,1].forEach(sd=>tube([[sd*(wb0+0.02),by+0.1,z],[sd*(wt0+0.025),by+0.04+h,z]],0.022,shade(bc,-0.25),'paint',3));}}
    // задний борт на петлях сверху, козырёк над кабиной, подъёмник
    mFace(M,[[-wb0,by+0.08,z0-0.02],[wb0,by+0.08,z0-0.02],[wt0,by+0.06+h,z0-0.05],[-wt0,by+0.06+h,z0-0.05]],bc,'paint',[0,by+0.4,z0+1],true);
    {const a=[-wt0,by+0.06+h,z1],b=[wt0,by+0.06+h,z1],c=[F.cw+0.2,F.yr+0.12,F.zc0-0.15],d=[-F.cw-0.2,F.yr+0.12,F.zc0-0.15];mFace(M,[a,b,c,d],shade(bc,-0.12),'paint',[0,by,z1],true);tube([a,d,c,b],0.022,shade(bc,-0.3),'paint',3);
      if(hi)[-0.33,0.33].forEach(k=>tube([[wt0*k,by+0.07+h,z1],[(F.cw+0.2)*k,F.yr+0.13,F.zc0-0.15]],0.016,shade(bc,-0.3),'paint',3));}
    tube([[0,F.yf-0.05,z1-0.35],[0,by+0.08,z1-0.3]],0.07,'#9ea3aa','chrome',hi?8:4);
    X.tailLamp(0.7,F.yf+0.25,z0-0.03);return {len:[z0-0.08,F.zr+0.12],track:F.t+0.34};}
  if(kind==='refuse'){// мусоровоз: закрытый кузов со сводчатым верхом и сдвижными крышками по бортам
    const F=wkFront(X,{wb:3.3,rF:0.46,rR:0.5,tw:0.13,dual:true,solid:y<1926}),z1=F.z1,z0=-F.wb/2-0.9,by=Math.max(F.yf,F.rR*2+0.06),w=0.98,h=1.5;wkRails(X,F,z0,by);
    const sec=z=>({z,p:rsec(w,w,by+0.06,by+0.06+h,0.03,0.52,n,'o')}),A=sec(z1),Bk=sec(z0);mLoft2(M,[A,Bk],col,'paint',{wrap:true});mCap(M,A,col,'paint',1);mCap(M,Bk,col,'paint',-1);
    if(hi){const L=z1-z0,yl=by+0.06+h-0.52;for(let k=0;k<3;k++){const za=z0+0.15+(L-0.3)*k/3+0.04,zb=z0+0.15+(L-0.3)*(k+1)/3-0.04;[-1,1].forEach(sd=>{tube([[sd*(w+0.006),yl-0.05,za],[sd*(w+0.006),yl-0.05,zb],[sd*(w*0.86),yl+0.3,zb],[sd*(w*0.86),yl+0.3,za],[sd*(w+0.006),yl-0.05,za]],0.012,shade(col,-0.45),'paint',3);
          tube([[sd*(w+0.02),yl+0.02,(za+zb)/2-0.08],[sd*(w+0.02),yl+0.02,(za+zb)/2+0.08]],0.012,K.bright,K.brightMat,3);});}
      tube([[-w*0.8,by+0.2,z0-0.006],[-w*0.8,by+h-0.45,z0-0.006],[w*0.8,by+h-0.45,z0-0.006],[w*0.8,by+0.2,z0-0.006],[-w*0.8,by+0.2,z0-0.006]],0.012,shade(col,-0.45),'paint',3);
      [-1,1].forEach(sd=>B(sd*(w+0.02)-0.02,by-0.02,z0+0.2,sd*(w+0.02)+0.14,by+0.03,z1-0.2,K.dark,'paint'));}
    X.tailLamp(0.7,F.yf+0.25,z0-0.03);return {len:[z0-0.08,F.zr+0.12],track:F.t+0.34};}
  if(kind==='tractor'){const trC=()=>{try{const kit=crewKit51(S,false);return kit.bib||shade(kit.coat||'#4a4038',-0.3);}catch(_){return '#3a3a42';}};
    if(y<1915){// ранний трактор: клёпаная рама, огромные задние колёса, короб мотора, башня-радиатор с трубой, маховик, навес
      const rR=0.86,wR=0.42,rF=0.5,wF=0.16,zR=-1.15,zF=1.35,tR=1.75,tF=1.25,yf=0.86,iron='#4a4d52';
      [-1,1].forEach(sd=>{wkSteelWheel(X,sd*tR/2,rR,zR,wR,false,{lugs:1,col,spokes:hi?12:6});wkSteelWheel(X,sd*tF/2,rF,zF,wF,true,{rib:1,col,spokes:hi?8:5});B(sd*0.42-0.05,yf-0.14,zR-0.5,sd*0.42+0.05,yf,zF+0.35,iron,'paint');});
      tube([[-tR/2,rR,zR],[tR/2,rR,zR]],0.06,iron,'paint',hi?8:4);tube([[-tF/2,rF,zF],[tF/2,rF,zF]],0.045,iron,'paint',hi?8:4);B(-0.06,rF,zF-0.06,0.06,yf-0.1,zF+0.06,iron,'paint');
      mRBox(M,-0.46,yf,-0.3,0.46,yf+0.75,1.0,0.05,col,'paint');if(hi)for(let k=0;k<5;k++)[-1,1].forEach(sd=>tube([[sd*0.467,yf+0.12,-0.15+k*0.25],[sd*0.467,yf+0.62,-0.15+k*0.25]],0.012,shade(col,-0.4),'paint',3));
      mRBox(M,-0.4,yf,1.05,0.4,yf+1.35,1.6,0.04,shade(col,-0.12),'paint');mLathe(M,[0,yf+1.35,1.32],'y',[[0.13,0],[0.12,0.6],[0.17,0.66],[0.17,0.7],[0,0.7]],hi?12:6,'#2a2b2e','paint');
      wkWheel(X,-0.62,yf+0.3,0.2,0.46,false,()=>{mLathe(M,[-0.62,yf+0.3,0.2],'x',[[0.46,-0.06],[0.46,0.06]],hi?18:10,iron,'metal',{two:true});const f=mLathe(M,[-0.68,yf+0.3,0.2],'x',[[0.46,0],[0.06,-0.01],[0,-0.03]],hi?18:10,shade(col,-0.2),'paint',{two:true});
        if(hi&&f[0]){const d=[];for(let k=0;k<6;k++){const a=k/6*Math.PI*2;d.push({a:[-0.7,yf+0.3+Math.sin(a)*0.07,0.2+Math.cos(a)*0.07],b:[-0.69,yf+0.3+Math.sin(a)*0.42,0.2+Math.cos(a)*0.42],w:0.04,c:iron});}f[0].deco=d;}});
      // площадка, сиденье, руль, навес на стойках
      B(-0.6,yf,zR-0.55,0.6,yf+0.05,-0.3,'#6a4a2c','wood');const sy=yf+0.62;mLathe(M,[0.18,sy,zR+0.1],'y',[[0,0],[0.2,0.02],[0.24,0.09],[0.22,0.11]],hi?10:6,'#3a3b3e','paint',{two:true});tube([[0.18,yf+0.05,zR+0.1],[0.18,sy,zR+0.1]],0.03,iron,'paint',4);
      X.steer(0.18,sy+0.52,zR+0.62,0.21,0.5);X.drvF(0.18,sy+0.05,zR+0.1,zR+0.56,sy+0.52);wkLegs(X,0.18,sy+0.05,zR+0.1,zR+0.62,yf+0.05,trC());X.eyeAt(0.18,sy+0.05,zR+0.1);
      const yc=yf+1.95;[[zR-0.5],[0.95]].forEach(([z])=>[-1,1].forEach(sd=>tube([[sd*0.55,yf+0.02,z],[sd*0.62,yc,z]],0.025,iron,'paint',4)));mRBox(M,-0.75,yc,zR-0.7,0.75,yc+0.06,1.15,0.03,K.canvas,'cloth');
      M.exh=[[0,yf+2.05,1.32]];return {len:[zR-rR-0.05,zF+rF+0.05],track:tR+wR};}
    // трактор с 1915 года: безрамный — мотор и мост одним корпусом, бак-капот, сиденье на рессоре между крыльями
    const rR=0.62,wR=0.3,rF=0.36,wF=0.12,zR=-0.78,zF=0.86,tR=1.32,tF=1.02,iron='#5a5e62';
    [-1,1].forEach(sd=>{wkSteelWheel(X,sd*tR/2,rR,zR,wR,false,{lugs:1,col:'#8a2a22',spokes:hi?10:6});wkSteelWheel(X,sd*tF/2,rF,zF,wF,true,{rib:1,col:'#8a2a22',spokes:hi?8:5});
      mSweep(M,sd*tR/2,arcPath(rR,zR,rR+0.09,Math.PI*0.18,Math.PI*0.98,hi?10:5),wR+0.08,0.02,col,[rR,zR]);});
    tube([[-tR/2,rR,zR],[tR/2,rR,zR]],0.09,iron,'paint',hi?8:4);tube([[-tF/2,rF,zF],[tF/2,rF,zF]],0.035,iron,'paint',hi?6:4);B(-0.05,rF-0.02,zF-0.05,0.05,0.5,zF+0.05,iron,'paint');
    mRBox(M,-0.2,0.42,zR-0.2,0.2,0.92,0.72,0.05,iron,'paint');mRBox(M,-0.27,0.4,zR-0.28,0.27,0.84,zR+0.28,0.08,iron,'paint');
    {const P=(z,w,yt)=>({z,p:rsec(w,w,0.92,yt,0.01,0.2,n,'o')}),T=[P(0.7,0.24,1.24),P(0.6,0.26,1.27),P(-0.1,0.26,1.27),P(-0.18,0.24,1.24)];mLoft2(M,T,col,'paint',{wrap:true});mCap(M,T[0],col,'paint',1);mCap(M,T[3],col,'paint',-1);}
    X.radiator(0.76,0.26,0.5,1.28,'vert',{});tube([[0.21,1.1,0.25],[0.24,1.2,0.25],[0.24,1.72,0.25]],0.03,'#2a2b2e','paint',hi?6:4);
    if(hi){mLathe(M,[-0.22,1.0,0.1],'x',[[0,-0.1],[0.07,-0.08],[0.07,0.08],[0,0.1]],8,'#2a2b2e','paint');B(-0.05,0.3,zR-0.75,0.05,0.36,zR-0.2,iron,'paint');}
    const sy=1.02,sz=zR-0.32;tube([[0,0.84,zR-0.05],[0,0.92,zR-0.2],[0,sy,sz]],0.035,iron,'paint',4);mLathe(M,[0,sy,sz],'y',[[0,0],[0.2,0.02],[0.25,0.1],[0.23,0.12]],hi?10:6,'#3a3b3e','paint',{two:true});
    X.steer(0,sy+0.4,sz+0.5,0.2,0.75);X.drvF(0,sy+0.04,sz,sz+0.44,sy+0.4);wkLegs(X,0,sy+0.04,sz,zR+0.28,0.58,trC());X.eyeAt(0,sy+0.04,sz);
    M.exh=[[0.24,1.74,0.25]];return {len:[zR-rR-0.05,zF+rF+0.12],track:tR+wR};}
  if(kind==='crawler'){// гусеничный трактор: две гусеницы, мотор под капотом, навес; до 1917 года — рулевое колесо впереди на длинной раме
    const xT=0.74,wT=0.34,loop=wkLoop(1.05,0.32,0.3,-1.05,0.36,0.34,-0.95,0.95,0.11),iron='#4a4d52',early=y<1917;
    [-1,1].forEach(sd=>{wkTrack(X,sd*xT,wT,loop,{});wkDisc(X,sd*xT,0.36,-1.05,0.3,wT*0.5,iron,8);wkDisc(X,sd*xT,0.32,1.05,0.26,wT*0.5,iron,6);
      if(hi)[-0.55,-0.1,0.35].forEach(z=>mLathe(M,[sd*(xT+wT*0.34),0.16,z],'x',[[0.12,0],[0,0.02*sd]],8,iron,'paint',{two:true}));});
    B(-0.56,0.34,-1.2,0.56,0.6,1.15,'#232427','paint');
    {const P=(z,w,yt)=>({z,p:rsec(w,w,0.6,yt,0.01,0.12,n,'o')}),T=[P(1.28,0.33,1.28),P(1.2,0.35,1.3),P(0.15,0.35,1.3),P(0.1,0.33,1.28)];mLoft2(M,T,col,'paint',{wrap:true});mCap(M,T[0],col,'paint',1);mCap(M,T[3],col,'paint',-1);
      if(hi)for(let k=0;k<5;k++)[-1,1].forEach(sd=>tube([[sd*0.356,0.72,0.3+k*0.2],[sd*0.356,1.12,0.3+k*0.2]],0.011,shade(col,-0.45),'paint',3));}
    X.radiator(1.33,0.31,0.62,1.3,'vert',{});mLathe(M,[0,0.86,-0.12],'x',[[0,-0.5],[0.17,-0.46],[0.17,0.46],[0,0.5]],hi?12:6,col,'paint');
    tube([[0.3,1.25,0.5],[0.3,2.25,0.5]],0.035,'#2a2b2e','paint',hi?6:4);
    B(-0.6,0.6,-1.2,0.6,0.66,0.0,'#6a4a2c','wood');X.seat(0,-0.55,1.02,0.52,0.4,0.36,{});
    if(early){X.steer(0.22,1.5,-0.02,0.2,0.7);X.drvF(0.22,1.0,-0.55,-0.1,1.5);}else{[-1,1].forEach(sd=>tube([[0.22+sd*0.1,0.66,-0.05],[0.22+sd*0.1,1.3,-0.15]],0.014,'#8a8f96','chrome',3));X.drvF(0.22,1.0,-0.55,-0.16,1.3);}
    wkLegs(X,0.22,1.0,-0.55,-0.1,0.66,(()=>{try{const kit=crewKit51(S,false);return kit.bib||shade(kit.coat||'#4a4038',-0.3);}catch(_){return '#3a3a42';}})());X.eyeAt(0.22,1.0,-0.55);
    const yc=2.02;[[1.12],[-1.12]].forEach(([z])=>[-1,1].forEach(sd=>tube([[sd*0.55,0.6,z],[sd*0.66,yc,z]],0.024,iron,'paint',4)));
    {const R=[];for(let k=0;k<=6;k++){const u=k/6*2-1;R.push([[u*0.8,yc+0.1*(1-u*u),-1.35],[u*0.8,yc+0.1*(1-u*u),1.4]]);}mGrid(M,R,K.canvas,'cloth',{ref:()=>[0,0,0],two:true});}
    let zf=1.45;if(early){// рулевое колесо впереди: длинная балка и вилка
      const zw=2.55,rw=0.4;tube([[0,0.72,1.2],[0,0.95,1.9],[0,1.0,zw]],0.05,iron,'paint',hi?6:4);[-1,1].forEach(sd=>tube([[sd*0.2,1.0,zw],[sd*0.2,rw,zw]],0.03,iron,'paint',4));tube([[-0.2,1.0,zw],[0.2,1.0,zw]],0.03,iron,'paint',4);
      wkSteelWheel(X,0.0001,rw,zw,0.3,true,{rib:1,col:shade(col,-0.1),spokes:hi?8:5});zf=zw+rw;}
    M.exh=[[0.3,2.27,0.5]];return {len:[-1.45,zf+0.08],track:xT*2+wT};}
  if(kind==='armored'){// бронеавтомобиль: бронекапот со створками, наклонный лобовой лист со щелями, корпус, башня с пулемётом
    const wb=3.0,t=1.5,r=0.45,yf=r+0.16,zn=wb/2+0.38,zh=wb/2-0.5,zb=-wb/2-0.45;X.setWt(y<1914?'wood':'disc');X.chassis(wb,t,r,r,0.12,{solid:true,yf,fw:0.4,zEng0:wb/2-0.9,zEng1:wb/2});
    const P=(z,w,yt,tw)=>({z,p:rsec(w,tw===undefined?w*0.93:tw,yf-0.04,yt,0.01,0.03,n,'o')});
    const hood=[P(zn,0.36,yf+0.6),P(zn-0.06,0.4,yf+0.66),P(zh,0.45,yf+0.72)];mLoft2(M,hood,col,'paint',{wrap:true});mCap(M,hood[0],col,'paint',1);
    const body=[P(zh,0.72,yf+0.74,0.5),P(zh-0.42,0.75,yf+1.32,0.66),P(zb+0.3,0.75,yf+1.32,0.66),P(zb,0.66,yf+1.12,0.56)];mLoft2(M,body,col,'paint',{wrap:true});mCap(M,body[0],col,'paint',1);mCap(M,body[3],col,'paint',-1);
    // створки радиатора, смотровые щели, заклёпки, дверь
    if(hi){for(let k=0;k<5;k++)B(-0.3,yf+0.08+k*0.1,zn-0.005,0.3,yf+0.14+k*0.1,zn+0.012,shade(col,-0.35),'paint');
      [-0.3,0.3].forEach(x=>B(x-0.13,yf+1.02,zh-0.3,x+0.13,yf+1.07,zh-0.2,'#0e0e10','paint'));[-1,1].forEach(sd=>{B(sd*0.71-0.01,yf+1.05,zh-0.75,sd*0.71+0.012,yf+1.1,zh-0.5,'#0e0e10','paint');
        tube([[sd*0.752,yf+0.15,-0.1],[sd*0.72,yf+1.2,-0.1],[sd*0.72,yf+1.2,-0.75],[sd*0.752,yf+0.15,-0.75]],0.008,shade(col,-0.45),'paint',3);});}
    const zt=-0.55,ty=yf+1.32;mLathe(M,[0,ty,zt],'y',[[0.58,0],[0.58,0.44],[0.5,0.52],[0,0.54]],hi?16:8,col,'paint');
    tube([[0,ty+0.26,zt+0.5],[0,ty+0.26,zt+1.12]],0.045,'#2a2b2e','metal',hi?8:4);if(hi)mRBox(M,-0.09,ty+0.16,zt+0.5,0.09,ty+0.36,zt+0.66,0.02,shade(col,-0.2),'paint');
    [-1,1].forEach(sd=>{mSweep(M,sd*t/2,arcPath(r,wb/2,r+0.08,-0.2,Math.PI*0.75,hi?10:5),0.3,0.01,col,[r,wb/2]);mSweep(M,sd*t/2,arcPath(r,-wb/2,r+0.08,Math.PI*0.25,Math.PI*1.15,hi?10:5),0.3,0.01,col,[r,-wb/2]);});
    X.headlamp(0,yf+0.86,zn-0.3,0.11,'drum');X.tailLamp(0.5,yf+0.2,zb-0.03);X.eyeAt(0.25,yf+0.5,zh-0.6);
    return {len:[zb-0.08,zn+0.1],track:t+0.14};}
  if(kind==='ltank'){// лёгкий танк: высокие гусеницы с большим передним колесом, узкий корпус, башня с короткой пушкой, «хвост»
    const xT=0.7,wT=0.34,zi=1.5,yi=0.62,ri=0.5,zs=-1.45,ysp=0.42,rs=0.38,loop=wkLoop(zi,yi,ri,zs,ysp,rs,-1.25,1.05,0.115);
    [-1,1].forEach(sd=>{wkTrack(X,sd*xT,wT,loop,{frame:shade(col,-0.3)});wkDisc(X,sd*xT,yi,zi,ri-0.06,wT*0.45,'#8a6a44',10);wkDisc(X,sd*xT,ysp,zs,rs-0.06,wT*0.45,'#4a4d52',8);
      if(hi)[-0.9,-0.45,0,0.45,0.9].forEach(z=>mLathe(M,[sd*(xT+wT*0.34),0.14,z],'x',[[0.1,0],[0,0.02*sd]],8,'#4a4d52','paint',{two:true}));});
    const P=(z,w,yb,yt,tw)=>({z,p:rsec(w,tw===undefined?w*0.92:tw,yb,yt,0.01,0.03,n,'o')});
    const H=[P(1.72,0.4,0.5,0.86),P(1.25,0.5,0.34,1.12),P(0.85,0.52,0.3,1.46),P(-0.25,0.52,0.3,1.46),P(-1.0,0.52,0.32,1.3),P(-1.75,0.46,0.4,1.0)];mLoft2(M,H,col,'paint',{wrap:true});mCap(M,H[0],col,'paint',1);mCap(M,H[5],col,'paint',-1);
    if(hi){B(-0.2,1.14,1.1,0.2,1.19,1.21,'#0e0e10','paint');[-1,1].forEach(sd=>{for(let k=0;k<4;k++)B(sd*0.5-0.012,0.75+k*0.09,-1.55,sd*0.5+0.012,0.8+k*0.09,-0.95,shade(col,-0.35),'paint');});
      mLathe(M,[0.58,1.2,-1.0],'z',[[0,-0.4],[0.07,-0.38],[0.07,0.3],[0,0.32]],8,'#3a2e28','paint');}
    // башня: гранёная, с колпаком; короткая пушка в маске
    const tz=0.3,ty=1.46;mLathe(M,[0,ty,tz],'y',[[0.5,0],[0.5,0.46],[0.44,0.54],[0.18,0.57],[0.18,0.68],[0.1,0.73],[0,0.74]],8,col,'paint');
    mRBox(M,-0.14,ty+0.14,tz+0.42,0.14,ty+0.4,tz+0.58,0.03,shade(col,-0.15),'paint');tube([[0,ty+0.27,tz+0.5],[0,ty+0.27,tz+1.08]],0.045,'#2a2b2e','metal',hi?8:4);
    // «хвост» для рвов: две дуги и перемычки
    [-1,1].forEach(sd=>tube([[sd*0.42,0.95,-1.72],[sd*0.4,0.8,-2.2],[sd*0.34,0.42,-2.62]],0.03,shade(col,-0.2),'paint',hi?5:3));tube([[-0.34,0.42,-2.62],[0.34,0.42,-2.62]],0.03,shade(col,-0.2),'paint',4);tube([[-0.4,0.8,-2.2],[0.4,0.8,-2.2]],0.025,shade(col,-0.2),'paint',4);
    X.eyeAt(0,1.0,1.0);M.exh=[[0.58,1.2,-1.42]];return {len:[-2.68,zi+ri+0.05],track:xT*2+wT};}
  return null;}
// Знаки на фургоне: красный крест (санитарный), полоса и рожок (почта); у военно-санитарного — брезентовый верх
function vanDeco51(X,G){const {M,S,hi,tube}=X;let b=null;try{b=byId(BODIES,S.b);}catch(_){}const k=b&&typeof bodyKind==='function'?bodyKind(b):'';if(k!=='amb'&&k!=='mamb'&&k!=='mail')return;
  const {bw,bh,yf,z0,z1}=G,zc=(z0+z1)/2-0.1,yc=yf+bh*0.62;
  [-1,1].forEach(sd=>{const x=sd*(bw+0.006),nrm=[x-sd,yc,zc];
    if(k==='mail'){mFace(M,[[x,yf+bh*0.42,z0+0.12],[x,yf+bh*0.42,z1-0.2],[x,yf+bh*0.52,z1-0.2],[x,yf+bh*0.52,z0+0.12]],'#e8c040','paint',nrm).bias=-0.6;
      if(hi){const C=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI*1.5;C.push([x+sd*0.004,yc+0.18+Math.sin(a)*0.11,zc+Math.cos(a)*0.11]);}tube(C,0.018,'#e8c040','paint',3);}return;}
    const disc=[];for(let i=0;i<14;i++){const a=i/14*Math.PI*2;disc.push([x,yc+Math.sin(a)*0.27,zc+Math.cos(a)*0.27]);}mFace(M,disc,'#f2efe6','paint',nrm).bias=-0.6;
    const x2=x+sd*0.004;mFace(M,[[x2,yc-0.2,zc-0.065],[x2,yc-0.2,zc+0.065],[x2,yc+0.2,zc+0.065],[x2,yc+0.2,zc-0.065]],'#b8322a','paint',nrm).bias=-0.8;mFace(M,[[x2,yc-0.065,zc-0.2],[x2,yc-0.065,zc+0.2],[x2,yc+0.065,zc+0.2],[x2,yc+0.065,zc-0.2]],'#b8322a','paint',nrm).bias=-0.8;});
  if(k==='mamb')mRBox(M,-bw-0.012,yf+bh-0.3,z0-0.01,bw+0.012,yf+bh+0.02,z1+0.02,0.1,'#8a8262','cloth');}
