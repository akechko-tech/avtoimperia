/* ================= 0.33: МОТОЦИКЛ В 3D — для совместных гонок автомобилей и мотоциклов =================
   Облик — по деталям модели, как на рисунке в карточке (20b-moto-art.js): рама (велосипедная, Вернера, с пружинной вилкой,
   колыбель, штампованная, трубчатая с рессорной вилкой), мотор (одноцилиндровый, V-твин, «четвёрка» FN, оппозитный «боксер»
   поперёк рамы, двухтактный), передача (ремень, цепь, кардан), бак по эпохе (плоский между трубами, позже — «седлом» поверх
   трубы), коляска (плетёная, с кузовом и крылом, двухместная). До 1902 года на велосипедной раме — трицикл, как у
   De Dion-Bouton: мотор за задней осью, сзади два колеса. В гонке гонщик пригибается к рулю, на номере — табличка.
   Одиночный мотоцикл в повороте ложится внутрь (r3dCarUpdate), трицикл и мотоцикл с коляской — нет.
   Метры; x — вправо, y — вверх, z — вперёд; земля — y = 0. */
// поворот точки в плоскости y–z вокруг c (a > 0 — верх уходит вперёд)
function rotYZ(p,c,a){const dy=p[1]-c[1],dz=p[2]-c[2],ca=Math.cos(a),sa=Math.sin(a);return [p[0],c[1]+dy*ca-dz*sa,c[2]+dy*sa+dz*ca];}
// тот же поворот для граней модели, начиная с from (наклон гонщика)
function mRotYZ(M,from,c,a){const ca=Math.cos(a),sa=Math.sin(a),R=p=>{const dy=p[1]-c[1],dz=p[2]-c[2];return [p[0],c[1]+dy*ca-dz*sa,c[2]+dy*sa+dz*ca];},N=n=>[n[0],n[1]*ca-n[2]*sa,n[1]*sa+n[2]*ca];
  for(let i=from;i<M.F.length;i++){const f=M.F[i];f.p=f.p.map(R);f.n=N(f.n);if(f.vn)f.vn=f.vn.map(N);}}
// колено ноги: бедро a и голень b от таза H до стопы Fp, колено — вперёд
function legKnee(H,Fp,a,b){const dy=Fp[1]-H[1],dz=Fp[2]-H[2],d=Math.max(0.05,Math.hypot(dy,dz)),uy=dy/d,uz=dz/d;
  if(d>=a+b-0.01)return [(H[0]+Fp[0])/2,H[1]+uy*a,H[2]+uz*a];
  const x=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x));let ny=uz,nz=-uy;if(nz<0){ny=-ny;nz=-nz;}
  return [(H[0]+Fp[0])/2*1.25,H[1]+uy*x+ny*h,H[2]+uz*x+nz*h];}
function motoModel3(M,S,K,H){
  const {WH,tube,plate,headlamp,crew,hi}=H,y=S.y,col=K.col,dark=K.dark,chrome='#8a8f96';
  const F=S.mf||(y<1901?'mf1':y<1906?'mf2':y<1913?'mf3':y<1923?'mf4':'mf6'),E=S.me||(y<1900?'me1':y<1905?'me2':y<1907?'me3':y<1912?'me5':y<1924?'me6':'me9'),
    T=S.mt||(y<1903?'mt1':y<1910?'mt2':y<1914?'mt3':'mt4');
  const side=['mb1','mb2','mb3'].includes(S.b),tri=!side&&F==='mf1'&&y<1902,late=F==='mf5'||F==='mf6',cradle=F==='mf4'||late,sprung=!(F==='mf1'||F==='mf2'),sd=S.sd<0?-1:1,race=!!S.num;
  const wb=({mf1:1.15,mf2:1.2,mf3:1.3,mf4:1.35,mf5:1.35,mf6:1.4})[F]||1.3,r=y<1905?0.36:late?0.34:0.345,tw=({mw1:0.045,mw2:0.065,mw3:0.09})[S.mw]||(y<1904?0.045:y<1923?0.065:0.085);
  // точки рамы в плоскости [z, y]: низ и верх рулевой колонки, узел седла, каретка
  const zF=wb/2,zR=-wb/2,rk=late?0.47:0.4,Lf=late?0.36:0.4,hl=late?0.13:0.14;
  const HB=[zF-Math.sin(rk)*Lf,r+Math.cos(rk)*Lf],HT=[HB[0]-Math.sin(rk)*hl,HB[1]+Math.cos(rk)*hl],SC=[zR+(late?0.55:0.5),HT[1]-(late?0.07:0.02)],BB=[late?-0.02:-0.05,late?0.27:0.3];
  const P=(x,q)=>[x,q[1],q[0]],fr=hi?0.016:0.02,fT=(a,b,rr)=>tube([a,b],rr||fr,dark,'paint');
  // ---------- колёса: проволочные спицы; у трицикла сзади два ----------
  WH(0,r,zF,r,tw,false,false);
  if(tri){WH(-0.37,r,zR,r,tw,false,false);WH(0.37,r,zR,r,tw,false,false);}else WH(0,r,zR,r,tw,false,false);
  // ---------- рама ----------
  fT(P(0,HB),P(0,HT),0.024);fT(P(0,HT),P(0,SC));
  let rb=BB;
  if(tri){fT(P(0,HB),P(0,BB));fT(P(0,SC),P(0,BB));
    [-1,1].forEach(s=>{fT(P(0,BB),[s*0.14,r,zR+0.03],fr*0.9);fT(P(0,SC),[s*0.14,r+0.02,zR],fr*0.9);});
    tube([[-0.37,r,zR],[0.37,r,zR]],0.022,dark,'paint');mSphere(M,0,r,zR,0.07,dark,'paint');}
  else{
    if(cradle){// колыбель: две нижние трубы под мотором (штампованная рама — толще)
      const lo=0.16,zb=BB[0]-0.14,rr=F==='mf5'?0.026:fr;rb=[zb-0.1,lo+0.1];
      [-1,1].forEach(s=>tube([[s*0.012,HB[1],HB[0]],[s*0.06,lo+0.13,HB[0]-0.17],[s*0.07,lo,HB[0]-0.3],[s*0.07,lo,zb],[s*0.05,rb[1],rb[0]]],rr,dark,'paint'));fT(P(0,SC),P(0,rb),rr);}
    else if(F==='mf2'||F==='mf3'){const m=[BB[0]+0.14,BB[1]+0.02];fT(P(0,HB),P(0,m));fT(P(0,m),P(0,BB));fT(P(0,SC),P(0,BB));}
    else{fT(P(0,HB),P(0,BB));fT(P(0,SC),P(0,BB));}
    // задние перья: нижние — от каретки, верхние — от седла
    [-1,1].forEach(s=>{tube([[s*0.03,rb[1],rb[0]],[s*0.075,r,zR]],fr*0.85,dark,'paint');tube([[s*0.03,SC[1]-0.02,SC[0]],[s*0.075,r+0.01,zR]],fr*0.85,dark,'paint');});}
  // ---------- вилка: жёсткая или пружинная (тяги спереди и пружина у колонки) ----------
  [-1,1].forEach(s=>tube([[s*0.05,HB[1],HB[0]],[s*0.062,r,zF]],0.013,dark,'paint'));
  tube([[-0.055,HB[1]+0.01,HB[0]],[0.055,HB[1]+0.01,HB[0]]],0.016,dark,'paint');
  if(sprung){const a=[HT[0]+0.06,HT[1]-0.03];[-1,1].forEach(s=>tube([[s*0.06,a[1],a[0]],[s*0.066,r+0.06,zF+0.05]],0.009,dark,'paint'));
    if(hi)mLathe(M,[0,HT[1]-0.07,HT[0]+0.065],'y',[[0.02,-0.07],[0.026,-0.05],[0.02,-0.03],[0.026,-0.01],[0.02,0.01],[0.026,0.03],[0.02,0.05]],8,chrome,'chrome');}
  // ---------- мотор ----------
  const alu=y<1912?'#b7b2a6':'#aeb2b8',iron='#73767c',fin='#8d9096';
  const ez=tri?zR-0.24:(HB[0]+BB[0])/2+(late?0:-0.03),ey=tri?r+0.04:BB[1]+0.09;
  const cyl=(a,b,rr,nf)=>{const n=hi?nf*2:1,Pp=[],R=[];for(let k=0;k<=n;k++){const t=k/n;Pp.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]);R.push(hi?(k%2?rr*1.35:rr):rr*1.18);}
    mTube(M,Pp,R,hi?10:5,fin,'metal',{caps:true});const d=v3n([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);mTube(M,[b,[b[0]+d[0]*0.045,b[1]+d[1]*0.045,b[2]+d[2]*0.045]],rr*1.12,hi?10:5,iron,'metal',{caps:true});};
  const ax=(ang,L)=>[0,ey+Math.cos(ang)*L,ez+Math.sin(ang)*L];
  const crank=(w,R)=>mLathe(M,[0,ey,ez],'x',[[0,-w],[R*0.82,-w],[R,-w*0.55],[R,w*0.55],[R*0.82,w],[0,w]],hi?14:6,alu,'metal');
  let exh=[];
  if(E==='me4'){// «четвёрка» FN: длинный картер вдоль рамы, четыре цилиндра в ряд
    mRBox(M,-0.06,ey-0.07,ez-0.19,0.06,ey+0.05,ez+0.19,0.025,alu,'metal');
    [-0.135,-0.045,0.045,0.135].forEach(dz=>cyl([0,ey+0.05,ez+dz],[0,ey+0.21,ez+dz],0.03,4));exh=[[0.04,ey+0.15,ez+0.17]];}
  else if(E==='me8'){// оппозитный «боксер» поперёк рамы (BMW R 32): цилиндры — в потоке воздуха
    mLathe(M,[0,ey+0.02,ez],'z',[[0,-0.15],[0.09,-0.14],[0.11,-0.08],[0.11,0.1],[0.09,0.14],[0,0.15]],hi?14:6,alu,'metal');
    [-1,1].forEach(s=>cyl([s*0.09,ey+0.06,ez+0.04],[s*0.27,ey+0.06,ez+0.04],0.042,6));exh=[[0.29,ey+0.06,ez+0.06],[-0.29,ey+0.06,ez+0.06]];}
  else if(E==='me5'||E==='me6'||E==='me10'){// V-образный «твин»: два цилиндра углом
    const big=E==='me10'?1.18:1;crank(0.065,0.115*big);[0.38,-0.38].forEach(a=>cyl(ax(a,0.07),ax(a,0.25*big),0.038*big,6));const q=ax(0.38,0.2*big);exh=[[0.04,q[1],q[2]+0.03]];}
  else{// одноцилиндровый (двухтактный — короче и без клапанов, верхнеклапанный — со штангами)
    const two=E==='me7'||E==='me11',L=E==='me9'?0.29:two||E==='me1'?0.2:0.25,a=tri?0:E==='me1'?0.08:0.16;crank(0.06,0.1);cyl(ax(a,0.07),ax(a,L),two?0.042:0.04,two?6:5);
    if(E==='me9'&&hi){const q=ax(a,L);tube([[0.045,ey+0.05,ez-0.04],[0.045,q[1],q[2]-0.035]],0.008,chrome,'chrome');}
    const q=ax(a,L*0.8);exh=[[0.04,q[1],q[2]+0.035]];}
  if(T==='mt4'||T==='mt5'){const g0=E==='me8'?ez-0.33:ez-0.27;mRBox(M,-0.055,ey-0.03,g0,0.055,ey+0.09,g0+0.14,0.02,alu,'metal');}
  // ---------- передача: ремень на шкив у обода, цепь на звёздочку или кардан ----------
  if(!tri){const gz=T==='mt4'||T==='mt5'?ez-0.2:ez;
    if(T==='mt5'){tube([[0.08,ey,gz-0.08],[0.08,r,zR+0.06]],0.022,dark,'paint');mSphere(M,0.08,r,zR,0.055,dark,'paint');}
    else if(T==='mt1'||T==='mt2'){const x=-0.085,R2=r*0.7;mLathe(M,[x,r,zR],'x',[[R2-0.016,-0.011],[R2+0.01,-0.011],[R2+0.01,0.011],[R2-0.016,0.011]],hi?22:8,dark,'paint');
      mLathe(M,[x,ey,gz],'x',[[0,-0.02],[0.05,-0.02],[0.055,0],[0.05,0.02],[0,0.02]],hi?10:6,alu,'metal');
      [1,-1].forEach(s=>tube([[x,ey+s*0.052,gz],[x,r+s*R2,zR]],0.008,'#6b4a2a','leather'));}
    else{const x=-0.08,R2=0.085;mLathe(M,[x,r,zR],'x',[[0,-0.005],[R2,-0.005],[R2,0.005],[0,0.005]],hi?14:6,'#3a3a3e','metal');
      mLathe(M,[x,ey,gz],'x',[[0,-0.005],[0.045,-0.005],[0.045,0.005],[0,0.005]],hi?10:6,'#3a3a3e','metal');
      [1,-1].forEach(s=>tube([[x,ey+s*0.045,gz],[x,r+s*R2,zR]],0.006,'#2a2a2e','metal'));}}
  // ---------- бак: до 1920-х — плоский между трубами, позже — «седлом» поверх трубы; у трицикла — цилиндр ----------
  if(!tri){const ty=z=>SC[1]+(HT[1]-SC[1])*(z-SC[0])/(HT[0]-SC[0]),z0=SC[0]+0.1,z1=HT[0]-0.05,nn=hi?3:1,sad=late||y>=1925;
    if(sad){const L=[0,0.25,0.6,0.88,1].map((t,k)=>{const z=z0+(z1-z0)*t,w=[0.07,0.115,0.125,0.115,0.08][k],yy=ty(z);return {z,p:rsec(w,w*0.8,yy-0.085,yy+[0.05,0.09,0.1,0.09,0.06][k],0.03,0.05,nn,'o')};});
      mLoft2(M,L,col,'paint',{wrap:true});mCap(M,L[0],col,'paint',-1);mCap(M,L[L.length-1],col,'paint',1);}
    else{const L=[0,1].map(t=>{const z=z0+(z1-z0)*t,yy=ty(z);return {z,p:rsec(0.07,0.07,yy-(t?0.13:0.2),yy-0.015,0.02,0.02,nn,'o')};});
      mLoft2(M,L,col,'paint',{wrap:true});mCap(M,L[0],col,'paint',-1);mCap(M,L[1],col,'paint',1);
      if(hi)[-1,1].forEach(s=>tube([[s*0.072,ty(z0)-0.1,z0+0.03],[s*0.072,ty(z1)-0.07,z1-0.03]],0.004,y<1914?'#c9a24a':'#e8e4d8','paint'));}
    if(hi){const zm=(z0+z1)/2+0.05;mLathe(M,[0,ty(zm)+(sad?0.095:0),zm],'y',[[0.022,0],[0.022,0.02],[0,0.024]],8,chrome,'chrome');}}
  else{const zc=(HT[0]+SC[0])/2,yc=(HT[1]+SC[1])/2-0.12;mLathe(M,[0,yc,zc],'z',[[0,-0.17],[0.07,-0.16],[0.075,-0.12],[0.075,0.12],[0.07,0.16],[0,0.17]],hi?12:6,col,'paint');}
  // ---------- седло на пружинах ----------
  const sz=SC[0]-0.03,sy=SC[1]+(late?0.06:0.075);
  tube([[0,SC[1],SC[0]],[0,sy-0.04,sz]],0.013,chrome,'chrome');
  mRBox(M,-0.11,sy-0.035,sz-0.15,0.11,sy+0.015,sz+0.03,0.03,K.leather,'leather');mRBox(M,-0.045,sy-0.025,sz+0.02,0.045,sy+0.01,sz+0.16,0.02,K.leather,'leather');
  if(hi)[-1,1].forEach(s=>mLathe(M,[s*0.07,sy-0.075,sz-0.1],'y',[[0.017,-0.035],[0.022,-0.023],[0.017,-0.012],[0.022,0],[0.017,0.012],[0.022,0.024],[0.017,0.034]],6,chrome,'chrome'));
  // ---------- руль: у дорожного загнут назад, у гоночного — ниже и прямее ----------
  const hy=HT[1]+0.05,hz=HT[0]-0.01,gw=0.27,gz=hz-(race?0.08:y<1915?0.2:0.15),gy=hy+(race?-0.03:y<1912?0.06:0.03);
  tube([[0,HT[1],HT[0]],[0,hy,hz]],0.016,dark,'paint');
  tube([[-gw,gy,gz],[-gw*0.55,hy+0.005,hz-0.03],[-0.07,hy,hz],[0.07,hy,hz],[gw*0.55,hy+0.005,hz-0.03],[gw,gy,gz]],0.011,y<1914?chrome:dark,y<1914?'chrome':'paint');
  [-1,1].forEach(s=>{tube([[s*gw,gy,gz],[s*(gw+0.015),gy-0.005,gz-0.1]],0.016,'#2b1d14','leather');if(hi)tube([[s*(gw-0.03),gy+0.01,gz+0.01],[s*(gw-0.02),gy-0.04,gz+0.07]],0.005,chrome,'chrome');});
  // ---------- крылья над колёсами (с пружинной вилкой и у мотоциклов с коляской) ----------
  if(sprung||side||y>=1906){const fc=late||side?col:dark,fw=tw+0.05,R=r+0.045;
    mSweep(M,0,arcPath(r,zF,R,0.3,2.5,hi?9:4),fw,0.016,fc,[r,zF]);
    if(!tri)mSweep(M,0,arcPath(r,zR,R,0.5,3.7,hi?12:5),fw,0.016,fc,[r,zR]);
    if(hi)[[zF,0.3],[zR,3.6]].forEach(([z,a])=>{const q=[r+Math.sin(a)*R,z+Math.cos(a)*R];[-1,1].forEach(s=>tube([[s*fw/2,q[0],q[1]],[s*0.07,r,z]],0.005,dark,'paint'));});}
  // ---------- выхлоп и глушитель справа (у «боксера» — по обе стороны); у трицикла — бочонок за мотором ----------
  if(!tri)exh.forEach(p0=>{const s=p0[0]<0?-1:1,ys=r-0.05,x=s*0.11;
    tube([p0,[s*Math.max(0.06,Math.abs(p0[0])*0.85),ey-0.03,p0[2]+(E==='me8'?-0.04:0.08)],[x,ey-0.13,ez-0.1],[x+s*0.02,ys,zR+0.45]],0.017,'#4e4f53','metal');
    mLathe(M,[x+s*0.02,ys,zR+0.3],'z',[[0,-0.16],[0.034,-0.15],[0.04,-0.11],[0.04,0.12],[0.03,0.15],[0,0.16]],hi?10:6,'#5b5e64','metal');});
  else mLathe(M,[0.15,r+0.02,zR-0.35],'z',[[0,-0.08],[0.035,-0.07],[0.035,0.07],[0,0.08]],hi?8:5,'#5b5e64','metal');
  // ---------- педали (ремённые машины ещё заводили и подгоняли педалями) или подножки ----------
  let feet;
  if(T==='mt1'||T==='mt2'||tri){const cr=0.16;feet=[-1,1].map(s=>{const a=s<0?-0.5:2.64,p=[s*0.15,BB[1]+Math.sin(a)*cr,BB[0]+Math.cos(a)*cr];
      tube([[s*0.05,BB[1],BB[0]],[s*0.1,p[1],p[2]]],0.012,chrome,'chrome');mRBox(M,Math.min(s*0.1,s*0.2),p[1]-0.012,p[2]-0.04,Math.max(s*0.1,s*0.2),p[1]+0.012,p[2]+0.04,0.008,dark,'paint');return p;});}
  else{const p=[0.2,BB[1]+0.03,BB[0]+0.12];[-1,1].forEach(s=>tube([[s*0.05,p[1],p[2]],[s*0.22,p[1],p[2]]],0.013,dark,'paint'));feet=[[-0.18,p[1],p[2]],[0.18,p[1],p[2]]];}
  // ---------- фара у дорожного, номера у гоночного ----------
  if(!race&&y>=1900){fT([0,HB[1]+0.04,HB[0]],[0,HB[1]+0.04,HB[0]+0.08],0.008);headlamp(0,HB[1]+0.04,HB[0]+0.13,0.065,y<1914?'drum':'bowl');}
  if(race&&hi){fT([0,HT[1]-0.03,HT[0]+0.02],[0,HT[1]-0.03,HT[0]+0.115],0.008);plate([0,HT[1]-0.03,HT[0]+0.12],[0,0,1],[-1,0,0],0.24,0.19,true);
    const rp=tri?[0,r+0.3,zR-0.42]:[0,2*r+0.045+0.075,zR-0.1];plate(rp,[0,0,-1],[1,0,0],0.2,0.15,true);}
  // ---------- коляска: рама к третьему колесу, кузов-«лодочка» (плетёный или стальной с крылом), пассажир ----------
  let swx=0;
  if(side){const sx=sd*0.72,swz=zR+0.45,rs=r*0.92,wick=S.b==='mb1',two=S.b==='mb3',bc=wick?'#b8925a':col,bm=wick?'wood':'paint',yb=0.27,yt=y<1914?0.68:0.64,w=two?0.3:0.26,z1=zF-0.02,z0=zR-(two?0.12:0.02);
    swx=sd*1.06;WH(swx,rs,swz,rs,tw,false,false);const sw=swx-sd*0.08;
    tube([[sd*0.04,BB[1]-0.02,BB[0]+0.05],[sw,rs,swz]],0.02,dark,'paint');tube([[sd*0.05,r+0.02,zR+0.1],[sw,rs,swz]],0.02,dark,'paint');
    tube([[sd*0.03,SC[1]-0.12,SC[0]-0.02],[sx,yb+0.2,SC[0]-0.04]],0.016,dark,'paint');tube([[sw,rs,swz],[sw,yb+0.06,swz]],0.02,dark,'paint');
    const Sx=(z,ww,a,b,rr)=>({z,dx:sx,p:rsec(ww,ww*0.94,a,b,rr,rr*0.8,hi?3:1,'o')});
    const L=[Sx(z1,0.05,yb+0.16,yb+0.27,0.02),Sx(z1-0.18,w*0.7,yb+0.05,yt-0.07,0.08),Sx(z1-0.5,w,yb,yt-0.01,0.1),Sx(z0+0.3,w,yb,yt,0.1),Sx(z0,w*0.8,yb+0.04,yt-0.02,0.08)];
    mLoft2(M,L,bc,bm,{wrap:true});mCap(M,L[0],bc,bm,1);mCap(M,L[L.length-1],bc,bm,-1);
    const zc0=z1-0.62,zc1=z0+0.08;mFace(M,[[sx-w+0.05,yt+0.004,zc0],[sx+w-0.05,yt+0.004,zc0],[sx+w-0.05,yt+0.004,zc1],[sx-w+0.05,yt+0.004,zc1]],'#1a1512','leather',[sx,yt-1,(zc0+zc1)/2]);
    if(hi&&wick)[0.35,0.65].forEach(k=>{const yy=yb+(yt-yb)*k;[-1,1].forEach(s=>tube(L.slice(1,5).map(q=>[sx+s*(q.p.reduce((m,v)=>Math.max(m,v[0]),0)+0.004),yy,q.z]),0.006,'#8c6a3c','wood'));});
    if(!wick)mSweep(M,swx,arcPath(rs,swz,rs+0.05,0.35,2.6,hi?8:4),tw+0.07,0.016,col,[rs,swz]);
    if(crew)mCrew3(M,sx,yb+0.14,zc1+0.22,crewKit3(y,(S.num|0)+1),true,S,null);}
  // ---------- гонщик: в гонке пригнулся к рулю; ноги — на педалях или подножках ----------
  if(crew){const kit=crewKit3(y,S.num),ln=race?(y<1908?0.25:y<1920?0.45:0.6):0.1,hip=[0,sy+0.04,sz-0.03],g=[0,gy-0.003,gz-0.05];
    const h0=rotYZ(g,hip,-ln),f0=M.F.length;MTAG.l=3;mCrew3(M,0,sy,sz-0.03,kit,false,S,[h0[0],h0[1],h0[2],gw+0.008]);mRotYZ(M,f0,hip,ln);
    const tr=shade(kit.coat,-0.3);
    feet.forEach(ft=>{const s=ft[0]<0?-1:1,hp=[s*0.09,sy+0.05,sz],F2=[ft[0],ft[1]+0.07,ft[2]-0.02],kn=legKnee(hp,F2,0.44,0.45);kn[0]=s*Math.max(0.15,Math.abs(kn[0]));
      tube([hp,kn],[0.075,0.058],tr,'cloth');tube([kn,F2],[0.056,0.044],tr,'cloth');
      mRBox(M,ft[0]-0.04,ft[1]+0.005,ft[2]-0.09,ft[0]+0.04,ft[1]+0.085,ft[2]+0.1,0.025,'#2b1d14','leather');});
    MTAG.l=0;M.eye=rotYZ([0,sy+0.84,sz+0.03],hip,ln);}
  // размеры: длина, колея, пятно тени; крен в повороте — только у одиночного мотоцикла
  const zb=tri?zR-0.45:zR-r-0.1;M.len=[zb,zF+r+0.15];M.track=tri?0.82:side?1.2:0.3;M.lean=tri||side?0:1;
  M.foot=side?(sd>0?[-0.28,swx+0.12,M.len[0],M.len[1]]:[swx-0.12,0.28,M.len[0],M.len[1]]):tri?[-0.5,0.5,M.len[0],M.len[1]]:[-0.3,0.3,M.len[0]+0.05,M.len[1]-0.05];
  if(!M.eye)M.eye=[0,sy+0.84,sz];}
