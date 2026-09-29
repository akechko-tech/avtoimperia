/* ================= 3D-ГОНКА: земля, дорога, деревья и дома, зрители, машины, камера, свет ================= */
// Физика и ИИ те же (41-race.js); здесь — только картинка. Мир строится кусками вдоль трассы: сначала у старта, остальное — по ходу гонки.
const R3={};
const R3CH=24; // участков трассы в куске мира (≈96 м)
function gfxMode(){return (AU.on&&AU.on.gfx)||'3d';}
function r3dWanted(){return gfxMode()!=='2d'&&g3Can();}
/* ---------- шум и помощники ---------- */
function vnz(x,z,s){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,h=(a,b)=>{let t=(Math.imul(a,374761393)+Math.imul(b,668265263)+Math.imul(s,1442695041))|0;t=Math.imul(t^(t>>>13),1274126177);return ((t^(t>>>16))>>>0)/4294967296;};
  const u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);return (h(xi,zi)*(1-u)+h(xi+1,zi)*u)*(1-v)+(h(xi,zi+1)*(1-u)+h(xi+1,zi+1)*u)*v;}
function fbm2(x,z,s,o){let a=0,w=1,sw=0,f=1;for(let i=0;i<o;i++){a+=vnz(x*f,z*f,s+i*31)*w;sw+=w;w*=0.5;f*=2.07;}return a/sw;}
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const cMul=(c,k)=>[Math.min(255,c[0]*k)|0,Math.min(255,c[1]*k)|0,Math.min(255,c[2]*k)|0];
const cMix=(a,b,k)=>[(a[0]+(b[0]-a[0])*k)|0,(a[1]+(b[1]-a[1])*k)|0,(a[2]+(b[2]-a[2])*k)|0];
const css=c=>`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
/* ---------- рельеф: расстояние до дороги, высота земли ---------- */
// Решётка 8 м вокруг трассы: у дороги земля идёт вровень с ней, дальше — холмы; в горах одна сторона уходит вверх, другая вниз
function r3dField(T){
  const P=T.pts,n=T.n,W=T.W,cfg=T.cfg,set=SCEN_SETS[cfg.host],S=8,seed=hashStr(T.rc.key)&0xffff;
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of P){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[2]<z0)z0=p[2];if(p[2]>z1)z1=p[2];}
  const pad=540;x0=Math.floor((x0-pad)/S)*S;z0=Math.floor((z0-pad)/S)*S;x1+=pad;z1+=pad;
  const nx=Math.ceil((x1-x0)/S)+1,nz=Math.ceil((z1-z0)/S)+1,N=nx*nz;
  const D=new Float32Array(N).fill(1e4),I=new Int32Array(N).fill(-1),L=new Float32Array(N),Sg=new Int8Array(N),B=new Float32Array(N),H=new Float32Array(N),G=new Float32Array(N),Cap=new Float32Array(N).fill(1e5);
  const rc=Math.ceil(84/S),segs=T.closed?n:n-1,fz0=W/2+13;
  const bank=R3.T===T&&R3.bank?R3.bank:null;
  for(let i=0;i<segs;i++){const a=P[i],b=P[(i+1)%n],dx=b[0]-a[0],dz=b[2]-a[2],l2=dx*dx+dz*dz||1,cx=Math.round((a[0]-x0)/S),cz=Math.round((a[2]-z0)/S),nn=T.N[i],bk=bank?Math.max(Math.abs(bank[i]),Math.abs(bank[(i+1)%n]))*W/2:0;
    for(let j=Math.max(0,cz-rc);j<=Math.min(nz-1,cz+rc);j++)for(let k=Math.max(0,cx-rc);k<=Math.min(nx-1,cx+rc);k++){
      const x=x0+k*S,z=z0+j*S;let t=((x-a[0])*dx+(z-a[2])*dz)/l2;t=t<0?0:t>1?1:t;const px=a[0]+dx*t,pz=a[2]+dz*t,d=Math.hypot(x-px,z-pz),q=j*nx+k;
      if(d<D[q]){D[q]=d;I[q]=i;L[q]=t;Sg[q]=((x-px)*nn[0]+(z-pz)*nn[1])>=0?1:-1;}
      // потолок земли: у любой дороги — не выше её полотна, дальше — не круче 1:1 (земля соседней петли не накроет дорогу)
      const cp=a[1]+(b[1]-a[1])*t-bk+Math.max(0,d-fz0);if(cp<Cap[q])Cap[q]=cp;}}
  // высота опоры: у дороги — её высота, дальше растекается и сглаживается
  const known=new Uint8Array(N),Q=new Int32Array(N);let qh=0,qt=0;
  for(let q=0;q<N;q++)if(I[q]>=0){const i=I[q],a=P[i],b=P[(i+1)%n];B[q]=a[1]+(b[1]-a[1])*L[q];known[q]=1;Q[qt++]=q;}
  if(!qt){B.fill(0);}
  while(qh<qt){const q=Q[qh++],k=q%nx,j=(q/nx)|0;
    if(k>0&&!known[q-1]){known[q-1]=1;B[q-1]=B[q];Q[qt++]=q-1;}if(k<nx-1&&!known[q+1]){known[q+1]=1;B[q+1]=B[q];Q[qt++]=q+1;}
    if(j>0&&!known[q-nx]){known[q-nx]=1;B[q-nx]=B[q];Q[qt++]=q-nx;}if(j<nz-1&&!known[q+nx]){known[q+nx]=1;B[q+nx]=B[q];Q[qt++]=q+nx;}}
  // между петлями серпантина — плавный склон: грубая сетка 32 м, сильно сглаженная, вдали от дороги заменяет «ближайшую высоту»
  const cs=4,cx=Math.ceil(nx/cs)+1,cz=Math.ceil(nz/cs)+1,Cb=new Float32Array(cx*cz),Cn=new Float32Array(cx*cz);
  for(let j=0;j<nz;j++)for(let k=0;k<nx;k++){const c=Math.floor(j/cs)*cx+Math.floor(k/cs);Cb[c]+=B[j*nx+k];Cn[c]++;}for(let c=0;c<Cb.length;c++)Cb[c]=Cn[c]?Cb[c]/Cn[c]:0;
  const ct=new Float32Array(cx*cz);for(let it=0;it<20;it++){ct.set(Cb);for(let j=1;j<cz-1;j++)for(let k=1;k<cx-1;k++){const c=j*cx+k;Cb[c]=(ct[c]*4+ct[c-1]+ct[c+1]+ct[c-cx]+ct[c+cx])/8;}}
  for(let j=0;j<nz;j++)for(let k=0;k<nx;k++){const q=j*nx+k,w=sstep(W/2+10,W/2+70,D[q]);if(w<=0)continue;const fx=k/cs,fz=j/cs,a=Math.min(cx-2,Math.floor(fx)),b=Math.min(cz-2,Math.floor(fz)),u=fx-a,v=fz-b;
    const sm=(Cb[b*cx+a]*(1-u)+Cb[b*cx+a+1]*u)*(1-v)+(Cb[(b+1)*cx+a]*(1-u)+Cb[(b+1)*cx+a+1]*u)*v;B[q]+=(sm-B[q])*w;}
  const tmp=new Float32Array(N);for(let it=0;it<4;it++){tmp.set(B);for(let j=1;j<nz-1;j++)for(let k=1;k<nx-1;k++){const q=j*nx+k;if(D[q]<W/2+12)continue;B[q]=(tmp[q]*4+tmp[q-1]+tmp[q+1]+tmp[q-nx]+tmp[q+nx])/8;}}
  const mount=!!(set.mount||cfg.terr==='mount'||cfg.uphill),flat=!!(set.flat||cfg.oval||cfg.sprint||T.rc.track==='board'),beach=cfg.terr==='beach';
  // горы: Альпы, Сицилия, Пиренеи, Скалистые горы — высокие; холмы Англии и Германии — пониже
  const alp=mount&&(['it','at','ch','es','mc'].includes(cfg.host)||['targa','nurb'].includes(T.rc.track)||/pikes|ventoux|turbie|klausen|semmering/.test(T.rc.id)),amp=flat?2.4:alp?22:mount?11:5+9*(cfg.hilly||0.3);
  for(let q=0;q<N;q++){const k=q%nx,j=(q/nx)|0,x=x0+k*S,z=z0+j*S,d=D[q],w=sstep(W/2+9,W/2+110,d);
    let h=B[q]+(fbm2(x/240,z/240,seed,3)-0.47)*2*amp*w+(vnz(x/60,z/60,seed+3)-0.5)*amp*0.18*w;
    if(mount&&I[q]>=0){const side=Sg[q]*(vnz(I[q]/70,0.5,seed+7)>0.5?1:-1),e=Math.max(0,d-W/2-13);h+=side*e*(side>0?0.2:0.26)*(alp?1:0.45)*sstep(0,40,e);}
    if(alp&&d>200)h+=Math.pow(fbm2(x/500,z/500,seed+11,3),2)*120*sstep(200,600,d);
    if(beach&&Sg[q]>0)h-=sstep(W/2+10,W/2+26,d)*2.6;
    H[q]=h;}
  // площадки под приметами (замок, башни): земля ровная вокруг, дальше плавно переходит в склон
  (T.lm||[]).forEach(lm=>{if(!lm.off)return;const k0=Math.round((lm.x-x0)/S),j0=Math.round((lm.z-z0)/S);if(k0<0||j0<0||k0>=nx||j0>=nz)return;const h0=H[j0*nx+k0],R0=lm.r*0.9,R1=lm.r*1.5,rc2=Math.ceil(R1/S);
    for(let j=Math.max(0,j0-rc2);j<=Math.min(nz-1,j0+rc2);j++)for(let k=Math.max(0,k0-rc2);k<=Math.min(nx-1,k0+rc2);k++){const q=j*nx+k,dd=Math.hypot(x0+k*S-lm.x,z0+j*S-lm.z),w=1-sstep(R0,R1,dd);if(w>0)H[q]+=(h0-H[q])*w;}});
  for(let q=0;q<N;q++){let h=H[q];if(h>Cap[q])h=Cap[q];H[q]=h;G[q]=h-0.45*(1-sstep(W/2+13,W/2+20,D[q]));}
  return {x0,z0,S,nx,nz,D,I,L,Sg,H,G,mount:alp,flat,beach,seed};
}
function fSample(F,A,x,z){const fx=clamp((x-F.x0)/F.S,0,F.nx-1.001),fz=clamp((z-F.z0)/F.S,0,F.nz-1.001),k=Math.floor(fx),j=Math.floor(fz),u=fx-k,v=fz-j,q=j*F.nx+k;
  return (A[q]*(1-u)+A[q+1]*u)*(1-v)+(A[q+F.nx]*(1-u)+A[q+F.nx+1]*u)*v;}
const fH=(x,z)=>fSample(R3.F,R3.F.H,x,z);
/* ---------- поверхность дороги и обочин ---------- */
function r3dBank(T){const n=T.n,b=new Float32Array(n),cfg=T.cfg,mx=T.rc.track==='board'?0.62:T.rc.track==='brooklands'?0.5:cfg.oval?0.2:0;if(!mx)return b;
  for(let i=0;i<n;i++){let k=0,c=0;for(let d=-6;d<=6;d++){const j=T.closed?((i+d)%n+n)%n:clamp(i+d,0,n-1);k+=T.K[j];c++;}k/=c;b[i]=-Math.sign(k)*Math.min(mx,Math.abs(k)*mx*55);}return b;}
// Высота дороги в точке i со смещением off (+ влево): горбик посередине, вираж на треках
function roadY(i,off){const T=R3.T,W=T.W,p=T.pts[i];const o=clamp(off,-W/2,W/2);return p[1]+0.05*(1-(2*o/W)*(2*o/W))+R3.bank[i]*o;}
// Обочина: a — метры за краем дороги; в городе — тротуар с бордюром
function shoulderY(i,sd,a,x,z){const T=R3.T,e=roadY(i,sd*T.W/2);
  if(R3.town[i]){if(a<0.1)return e+a*1.4;if(a<=3)return e+0.15;return e+0.15+(fH(x,z)-e-0.15)*sstep(3,11,a);}
  if(a<=1.5)return e-0.1*a/1.5;return e-0.1+(fH(x,z)-0.02-(e-0.1))*sstep(1.5,9,a);}
// Земля под предметом у дороги
function groundAt(i,off){const T=R3.T,W=T.W,p=T.pts[i],nn=T.N[i],x=p[0]+nn[0]*off,z=p[2]+nn[1]*off,a=Math.abs(off)-W/2;
  if(a<=0)return roadY(i,off);if(a<12)return shoulderY(i,Math.sign(off),a,x,z);return fH(x,z);}
// Высота машины: плавно между точками трассы
function surfAt(c){const T=R3.T,n=T.n,i=c.idx,j=T.closed?(i+(c.segT>=0?1:n-1))%n:clamp(i+(c.segT>=0?1:-1),0,n-1),t=Math.abs(c.segT||0);
  const y=o=>{const a=Math.abs(o)-T.W/2;const f=k=>a<=0?roadY(k,o):a<12?shoulderY(k,Math.sign(o),a,T.pts[k][0]+T.N[k][0]*o,T.pts[k][2]+T.N[k][1]*o):fH(T.pts[k][0]+T.N[k][0]*o,T.pts[k][2]+T.N[k][1]*o);return f(i)*(1-t)+f(j)*t;};
  return y;}
/* ---------- карта цвета земли: поля, лес, обочины, тени под деревьями ---------- */
const R3FIELDS={fr:['#c9b25a','#8ea35a','#a7b56e','#9a7a52','#b8a860','#7e9651','#d0c070'],it:['#b8a46a','#9a9a62','#c4a060','#8a8a58','#a89a70','#b0a878'],de:['#8a9a52','#6f8a4a','#b8aa60','#7a6a48','#9aa860'],
  uk:['#7e9a52','#6a8a48','#8fa35a','#a8a860','#76944c'],us:['#b0a050','#c8b870','#8a9a52','#a08a58','#b8a860'],be:['#8a9a52','#b8aa60','#7a8a4a','#9a8a58'],mc:['#8a9a62','#a0a070','#9aa060'],
  at:['#7a9a5a','#8aa862','#6a8a52'],ch:['#7a9a5a','#8aa862','#6a8a52'],es:['#c4a868','#b89a60','#a89a70','#9a8a58','#c8b078'],other:['#8a9a5a','#a8a060','#7a8a52','#9a9a62'],
  ru:['#b8b060','#8fa35a','#a7a86a','#c4b870','#7e9651','#9ab070'],ie:['#6f9a52','#7aa65a','#5f8a48','#8fb060','#6a9450'],ly:['#c8b078','#b8a068','#a89a70','#c0a878']};
function r3dColorMap(T,F){
  const cfg=T.cfg,set=SCEN_SETS[cfg.host],tr=TERR[cfg.terr]||TERR.dirt,rnd=mulberry32(F.seed+99),W=T.W;
  const wx=(F.nx-1)*F.S,wz=(F.nz-1)*F.S,sz=1024,cv=mkCanvas(sz,sz),g=cv.getContext('2d'),kx=sz/wx,kz=sz/wz;
  const X=x=>(x-F.x0)*kx,Z=z=>(z-F.z0)*kz,snowy=cfg.terr==='snow',sandy=cfg.terr==='sand'||cfg.terr==='beach';
  const grass=hex2rgb(snowy?'#e9edf2':sandy?'#d8c28e':set.grass||tr.g),dark=cMul(grass,0.8);
  // 1) основа по решётке: трава с пятнами, крутые склоны — земля и камень, высоко в горах — снег
  let hMin=1e9;T.pts.forEach(p=>{if(p[1]<hMin)hMin=p[1];});const b=mkCanvas(F.nx,F.nz),bg=b.getContext('2d'),id=bg.createImageData(F.nx,F.nz),dd=id.data,rock=hex2rgb('#827a6c'),earth=hex2rgb(sandy?'#c8ae78':'#7a6a4c'),snow=hex2rgb('#eef2f6');
  for(let j=0;j<F.nz;j++)for(let k=0;k<F.nx;k++){const q=j*F.nx+k,x=F.x0+k*F.S,z=F.z0+j*F.S;
    const hx=F.H[Math.min(q+1,F.nx*F.nz-1)]-F.H[Math.max(q-1,0)],hz=F.H[Math.min(q+F.nx,F.nx*F.nz-1)]-F.H[Math.max(q-F.nx,0)],sl=Math.hypot(hx,hz)/(2*F.S);
    const nz=fbm2(x/90,z/90,F.seed+5,3);let c=cMix(dark,cMul(grass,1.12),nz);
    const strata=0.86+0.28*vnz(F.H[q]/2.2,x/40,F.seed+9);if(!snowy)c=cMix(c,cMul(earth,strata),sstep(0.5,0.95,sl)*(F.mount?0.75:0.35));if(F.mount)c=cMix(c,cMul(rock,strata),sstep(0.75,1.3,sl));
    if(F.mount&&set.snow&&!snowy)c=cMix(c,snow,sstep(hMin+70,hMin+120,F.H[q]+(fbm2(x/50,z/50,F.seed,2)-0.5)*24));
    const o=q*4;dd[o]=c[0];dd[o+1]=c[1];dd[o+2]=c[2];dd[o+3]=255;}
  bg.putImageData(id,0,0);g.imageSmoothingEnabled=true;g.drawImage(b,0,0,sz,sz);
  // 2) поля: лоскуты вдали от дороги (на пологих местах)
  const pal=(R3FIELDS[cfg.host]||R3FIELDS.fr).map(hex2rgb),nF=snowy||sandy?0:Math.round(wx*wz/9000);
  for(let f=0;f<nF;f++){const x=F.x0+rnd()*wx,z=F.z0+rnd()*wz;const d=fSample(F,F.D,x,z);if(d<30)continue;const hx=fSample(F,F.H,x+8,z)-fSample(F,F.H,x-8,z),hz=fSample(F,F.H,x,z+8)-fSample(F,F.H,x,z-8);if(Math.hypot(hx,hz)/16>0.3)continue;
    const w=40+rnd()*110,h=30+rnd()*90,a=rnd()*3.14,c=pal[Math.floor(rnd()*pal.length)];g.save();g.translate(X(x),Z(z));g.rotate(a);g.globalAlpha=0.55+rnd()*0.3;g.fillStyle=css(c);g.fillRect(-w*kx/2,-h*kz/2,w*kx,h*kz);
    if(rnd()<0.5){g.globalAlpha=0.18;g.strokeStyle=css(cMul(c,0.7));g.lineWidth=Math.max(1,kx*1.2);for(let l=-w/2;l<w/2;l+=4){g.beginPath();g.moveTo(l*kx,-h*kz/2);g.lineTo(l*kx,h*kz/2);g.stroke();}}
    g.globalAlpha=0.5;g.strokeStyle=css(cMul(grass,0.62));g.lineWidth=Math.max(1,kx*2.2);g.strokeRect(-w*kx/2,-h*kz/2,w*kx,h*kz);g.restore();}
  g.globalAlpha=1;
  // 3) лес: тёмные пятна под рощами (деревья ставятся потом по этим же пятнам)
  R3.forest=[];const nW=Math.round(wx*wz/60000*(set.flat?0.6:1)*(sandy||set.dry?0.2:1));
  for(let f=0;f<nW;f++){const x=F.x0+rnd()*wx,z=F.z0+rnd()*wz,d=fSample(F,F.D,x,z);if(d<45)continue;const r=25+rnd()*70;R3.forest.push([x,z,r]);
    const gr=g.createRadialGradient(X(x),Z(z),0,X(x),Z(z),r*kx*1.1);gr.addColorStop(0,'rgba(38,56,28,.75)');gr.addColorStop(0.75,'rgba(44,62,32,.55)');gr.addColorStop(1,'rgba(44,62,32,0)');g.fillStyle=gr;g.beginPath();g.arc(X(x),Z(z),r*kx*1.1,0,7);g.fill();}
  // 4) коридор дороги: придорожная трава, пыльная обочина, край дороги; в городе — мостовая и тротуары
  const road=hex2rgb(tr.road),verge=cMix(grass,road,0.45),edge=cMix(grass,road,0.8);
  const path=(from,to)=>{g.beginPath();for(let i=from;i<=to;i++){const p=T.pts[i%T.n];i===from?g.moveTo(X(p[0]),Z(p[2])):g.lineTo(X(p[0]),Z(p[2]));}};
  g.lineJoin='round';g.lineCap='round';const last=T.closed?T.n:T.n-1;
  [[W+24,cMix(grass,hex2rgb('#c8c090'),snowy?0:0.12),0.6],[W+7,verge,0.7],[W+2.5,edge,0.9]].forEach(([w,c,a])=>{g.globalAlpha=a;g.strokeStyle=css(c);g.lineWidth=w*kx;path(0,last);g.stroke();});
  g.globalAlpha=1;for(let i=0;i<T.n;){if(!R3.town[i]){i++;continue;}let j=i;while(j<T.n&&R3.town[j])j++;g.strokeStyle=css(hex2rgb('#b8ae98'));g.lineWidth=(W+18)*kx;path(Math.max(0,i-1),Math.min(last,j));g.stroke();i=j;}
  // 4б) крутые склоны у дороги — камень и земля поверх пыльной обочины (иначе склон горы — светлая стена)
  if(F.mount||!F.flat){const cw=kx*F.S*1.15,P=T.pts;for(let j=1;j<F.nz-1;j++)for(let k=1;k<F.nx-1;k++){const q=j*F.nx+k;if(F.D[q]>W/2+40||F.D[q]<W/2+1)continue;
    // крутизна и по сетке рельефа, и по подъёму от ближайшей дороги (обочина тянется к рельефу за 9 м)
    const i=F.I[q],rh=i>=0?P[i][1]+(P[(i+1)%T.n][1]-P[i][1])*F.L[q]:F.H[q],rise=Math.abs(F.H[q]-rh)/Math.max(2,Math.min(9,F.D[q]-W/2));
    const sl=Math.max(Math.hypot(F.H[q+1]-F.H[q-1],F.H[q+F.nx]-F.H[q-F.nx])/(2*F.S),rise);if(sl<0.32)continue;
    const c=cMix(cMul(hex2rgb('#7a6a4c'),0.9+0.2*vnz(F.H[q]/2.2,k/5,F.seed+9)),cMul(hex2rgb('#6f685c'),0.9+0.2*vnz(F.H[q]/3,j/5,F.seed+4)),sstep(0.45,0.9,sl));g.globalAlpha=0.35+0.5*sstep(0.32,0.7,sl);g.fillStyle=css(c);g.fillRect(X(F.x0+k*F.S)-cw/2,Z(F.z0+j*F.S)-cw/2,cw,cw);}g.globalAlpha=1;}
  // 5) тени-«подушки» под деревьями и домами у дороги
  g.fillStyle='rgba(20,30,12,.28)';for(let i=0;i<T.n;i++)for(const it of T.spr[i]){if(it.k==='p')continue;const p=T.pts[i],nn=T.N[i],x=p[0]+nn[0]*it.off,z=p[2]+nn[1]*it.off,r=R3SIZE[it.t]||0;if(!r)continue;
    const gr=g.createRadialGradient(X(x),Z(z),0,X(x),Z(z),r*kx);gr.addColorStop(0,'rgba(20,30,12,.34)');gr.addColorStop(1,'rgba(20,30,12,0)');g.fillStyle=gr;g.beginPath();g.arc(X(x),Z(z),r*kx,0,7);g.fill();}
  return {cv,u:[F.x0,F.z0,1/wx,1/wz]};
}
// Радиус тени-подушки по типу предмета
const R3SIZE={plane:4.5,oak:4.5,elm:4,poplar:1.6,cypress:1.2,olive:2.8,pine:3.2,fir:2.2,birch:2,palm:2,house_fr:6,farm_fr:6,house_it:6,fachwerk:6,cottage:5,pub:5,farm_us:6.5,barn:7,izba:5,villa:7,cafe:6,church:8,stand:8,pits:7,
  church_ru:9,church_uk:8,church_us:8,church_at:8,campanile:3.5,minaret:6,house_ly:6,cottage_ie:5,mill_ru:3,stog:2.2,cactus:1.2,well:1.2};
// Мелкая травяная фактура (повторяется каждые ~3 м вблизи)
function r3dDetailTex(){const S=256,c=mkCanvas(S,S),g=c.getContext('2d'),r=mulberry32(77);g.fillStyle='#808080';g.fillRect(0,0,S,S);
  for(let i=0;i<5200;i++){const x=r()*S,y=r()*S,l=2+r()*6,v=90+r()*110|0;g.strokeStyle=`rgb(${v},${v},${v})`;g.lineWidth=0.8+r();g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-0.5)*3,y-l);g.stroke();
    for(const dx of [-S,S])if(x+dx>-8&&x+dx<S+8){g.beginPath();g.moveTo(x+dx,y);g.lineTo(x+dx+(r()-0.5)*3,y-l);g.stroke();}}
  for(let i=0;i<60;i++){const x=r()*S,y=r()*S,rr=4+r()*14,v=r()<0.5?60:170;const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,`rgba(${v},${v},${v},.35)`);gr.addColorStop(1,`rgba(${v},${v},${v},0)`);g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}
  return c;}
/* ---------- фактуры дорог эпохи ---------- */
function r3dRoadTex(key,W){
  const S=512,c=mkCanvas(S,S),g=c.getContext('2d'),r=mulberry32(hashStr('road|'+key)),town=key==='pave',tr=TERR[key]||TERR.dirt,px=S/W,pv=S/8;
  const base=hex2rgb(town?'#8e8a82':tr.road);g.fillStyle=css(base);g.fillRect(0,0,S,S);
  const blot=(n,a,rm)=>{for(let i=0;i<n;i++){const x=r()*S,y=r()*S,rr=(rm||40)*(0.3+r()),v=r()<0.5?-1:1;const gr=g.createRadialGradient(x,y,0,x,y,rr);const cc=cMul(base,1+v*0.14);gr.addColorStop(0,`rgba(${cc[0]},${cc[1]},${cc[2]},${a})`);gr.addColorStop(1,`rgba(${cc[0]},${cc[1]},${cc[2]},0)`);g.fillStyle=gr;
    for(const dy of [-S,0,S])g.fillRect(x-rr,y-rr+dy,rr*2,rr*2);}};
  const speck=(n,sz,dv,a)=>{for(let i=0;i<n;i++){const x=r()*S,y=r()*S,s=sz*(0.5+r()),cc=cMul(base,1+(r()-0.5)*dv);g.fillStyle=`rgba(${cc[0]},${cc[1]},${cc[2]},${a||1})`;g.fillRect(x,y,s,s);}};
  const rut=(u,w,k,a)=>{const x=u*S;const gr=g.createLinearGradient(x-w*px,0,x+w*px,0);const cc=cMul(base,k);gr.addColorStop(0,`rgba(${cc[0]},${cc[1]},${cc[2]},0)`);gr.addColorStop(0.5,`rgba(${cc[0]},${cc[1]},${cc[2]},${a})`);gr.addColorStop(1,`rgba(${cc[0]},${cc[1]},${cc[2]},0)`);g.fillStyle=gr;g.fillRect(x-w*px,0,w*2*px,S);};
  const lanes=[0.2,0.36,0.64,0.8];
  if(town){// брусчатка: ряды камней поперёк
    const st=0.14*pv;for(let y=0;y<S;y+=st){let x=(Math.floor(y/st)%2)*st*0.5;while(x<S){const w=st*(0.8+r()*0.5),cc=cMul(base,0.85+r()*0.3);g.fillStyle=css(cc);g.fillRect(x+1,y+1,w-2,st-2);x+=w;}}
    lanes.forEach(u=>rut(u,0.35,0.85,0.35));}
  else if(key==='dirt'||key==='mount'||key==='mud'){blot(90,0.35,50);speck(9000,1.6,0.5);lanes.forEach(u=>{rut(u,0.28,key==='mud'?0.62:0.78,0.6);rut(u+0.035,0.1,1.18,0.35);});
    for(let i=0;i<340;i++){const x=r()*S,y=r()*S,s=1+r()*3.2;g.fillStyle=css(cMul(base,r()<0.5?0.68:1.25));g.beginPath();g.ellipse(x,y,s*1.3,s,r()*3,0,7);g.fill();}
    if(key==='mud')for(let i=0;i<14;i++){const x=S*(0.15+r()*0.7),y=r()*S,w=20+r()*50;g.fillStyle='rgba(70,62,58,.55)';g.beginPath();g.ellipse(x,y,w,w*0.35,0,0,7);g.fill();g.fillStyle='rgba(150,160,170,.18)';g.beginPath();g.ellipse(x-w*0.2,y-w*0.08,w*0.4,w*0.1,0,0,7);g.fill();}}
  else if(key==='macadam'){blot(60,0.25,40);speck(26000,1.4,0.55);lanes.forEach(u=>rut(u,0.3,0.86,0.45));}
  else if(key==='asphalt'){blot(40,0.2,60);speck(22000,1.1,0.3);lanes.forEach(u=>rut(u,0.45,0.82,0.35));
    for(let i=0;i<10;i++){g.strokeStyle='rgba(30,30,32,.55)';g.lineWidth=1.2;g.beginPath();let x=r()*S,y=r()*S;g.moveTo(x,y);for(let k=0;k<8;k++){x+=(r()-0.5)*24;y+=6+r()*14;g.lineTo(x,y);}g.stroke();}
    if(tr.line){g.fillStyle=tr.line;for(let y=0;y<S;y+=pv*8)g.fillRect(S/2-0.06*px,y,0.12*px,pv*3);}}
  else if(key==='brick'){const bh=0.1*pv,bw=0.22*px;for(let y=0;y<S;y+=bh){let x=(Math.floor(y/bh)%2)*bw*0.5-bw;while(x<S){const cc=cMul(base,0.8+r()*0.4);g.fillStyle=css(cc);g.fillRect(x+0.8,y+0.8,bw-1.6,bh-1.6);x+=bw;}}
    lanes.forEach(u=>rut(u,0.5,0.75,0.3));}
  else if(key==='board'){const w=0.1*px;for(let x=0;x<S;x+=w){const cc=cMul(base,0.82+r()*0.36);g.fillStyle=css(cc);g.fillRect(x,0,w-1,S);let y=r()*S;g.fillStyle='rgba(40,25,10,.5)';g.fillRect(x,y,w-1,1.5);g.fillRect(x,(y+S/2)%S,w-1,1.5);}
    lanes.forEach(u=>rut(u,0.5,0.7,0.35));}
  else if(key==='concrete'){speck(18000,1.2,0.25);blot(30,0.15,70);g.fillStyle='rgba(60,60,58,.55)';for(let y=0;y<S;y+=pv*4)g.fillRect(0,y,S,1.6);g.fillRect(S/2-0.8,0,1.6,S);lanes.forEach(u=>rut(u,0.5,0.8,0.3));}
  else if(key==='snow'){blot(60,0.3,40);speck(6000,1.5,0.15);[0.3,0.7].forEach(u=>{rut(u,0.9,0.86,0.7);for(let k=0;k<90;k++){g.fillStyle='rgba(120,130,140,.28)';g.fillRect(u*S+(r()-0.5)*1.4*px,r()*S,2,6);}});}
  else if(key==='sand'||key==='beach'){blot(70,0.3,60);speck(12000,1.4,0.25);g.strokeStyle='rgba(120,100,60,.18)';g.lineWidth=2;for(let y=0;y<S;y+=9+r()*6){g.beginPath();g.moveTo(0,y);for(let x=0;x<=S;x+=32)g.lineTo(x,y+Math.sin(x*0.05+y)*3);g.stroke();}lanes.forEach(u=>rut(u,0.5,key==='beach'?0.86:0.8,0.4));}
  else{blot(60,0.3,40);speck(12000,1.4,0.4);}
  // края дороги: трава и камешки заходят на полотно
  if(key!=='board'&&key!=='brick'&&key!=='concrete'&&!town){for(let i=0;i<260;i++){const sd=r()<0.5,x=sd?r()*0.05*S:S-r()*0.05*S,y=r()*S;g.strokeStyle=r()<0.5?'rgba(70,95,40,.7)':'rgba(110,130,60,.6)';g.lineWidth=1.3;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-0.5)*4,y-5-r()*6);g.stroke();}}
  return c;
}
function r3dTexKey(i){const T=R3.T,t=T.terrAt(i);return R3.town[i]&&T.rc.y<1920&&(t==='dirt'||t==='macadam')?'pave':t;}
/* ---------- заготовки: деревья, камни, мелочи у дороги ---------- */
const PR3={};
function proto(key,make){let p=PR3[key];if(p)return p;const mb=new MB();make(mb,mulberry32(hashStr(key)));PR3[key]=mb;return mb;}
const ICO=(()=>{const t=(1+Math.sqrt(5))/2;let V=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(v3n);
  let F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const L0={V:V.slice(),F:F.slice()};const mid={},F2=[];const m=(a,b)=>{const k=a<b?a+'_'+b:b+'_'+a;if(mid[k]!==undefined)return mid[k];V.push(v3n([(V[a][0]+V[b][0])/2,(V[a][1]+V[b][1])/2,(V[a][2]+V[b][2])/2]));return mid[k]=V.length-1;};
  F.forEach(([a,b,c])=>{const ab=m(a,b),bc=m(b,c),ca=m(c,a);F2.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);});return [L0,{V,F:F2}];})();
// Шар листвы: неровная сфера, нормали от центра (мягкий объём); низ темнее; sway — сила качания на ветру
function pBlob(mb,cx,cy,cz,rx,ry,rz,col,r,lod,mat,sway){const I=ICO[lod?1:0],c0=hex2rgb(col),M=mat===undefined?MID.leaf:mat,i0=mb.n,e=mb.e,ez=e[2],jj=lod?0.16:0.3,cn=lod?0.07:0.14;
  I.V.forEach(n=>{const j=1+(r()-0.5)*jj,sh=0.8+0.32*(n[1]*0.5+0.5)+(r()-0.5)*cn;e[2]=sway?Math.round(255*sway*clamp(0.3+0.7*(n[1]*0.5+0.5),0,1)):ez;
    mb.v(cx+n[0]*rx*j,cy+n[1]*ry*j,cz+n[2]*rz*j,n[0]/rx,n[1]/ry,n[2]/rz,cMul(c0,sh),M);});
  e[2]=ez;I.F.forEach(f=>mb.tri(i0+f[0],i0+f[1],i0+f[2]));}
// Ствол: сужающаяся призма; можно с изгибом (x1,z1 — смещение верха)
function pTrunk(mb,x0,y0,z0,x1,y1,z1,r0,r1,col,sides,mat){sides=sides||6;const c=hex2rgb(col),M=mat===undefined?MID.bark:mat;
  for(let k=0;k<sides;k++){const a0=k/sides*6.2832,a1=(k+1)/sides*6.2832,am=(a0+a1)/2,P=(a,r,x,y,z)=>[x+Math.cos(a)*r,y,z+Math.sin(a)*r];
    mb.poly([P(a0,r0,x0,y0,z0),P(a1,r0,x0,y0,z0),P(a1,r1,x1,y1,z1),P(a0,r1,x1,y1,z1)],[Math.cos(am),(r0-r1)/Math.max(0.1,y1-y0),Math.sin(am)],cMul(c,0.9+0.2*Math.cos(am-2.4)),M);}
  if(r1>0.02)mb.poly(Array.from({length:sides},(_,k)=>{const a=k/sides*6.2832;return [x1+Math.cos(a)*r1,y1,z1+Math.sin(a)*r1];}),[0,1,0],c,M);}
// Конус (ель, крыша башенки): кольцо у основания с неровным краем
function pCone(mb,cx,y0,cz,r,h,col,sides,r2,mat,sway){sides=sides||9;const c=hex2rgb(col),M=mat===undefined?MID.leaf:mat,e=mb.e,ez=e[2];
  for(let k=0;k<sides;k++){const a0=k/sides*6.2832,a1=(k+1)/sides*6.2832,j0=1+((k*37)%7-3)*0.05,j1=1+(((k+1)%sides*37)%7-3)*0.05,top=[cx,y0+h,cz];
    const A=[cx+Math.cos(a0)*r*j0,y0-(k%2)*0.12,cz+Math.sin(a0)*r*j0],B=[cx+Math.cos(a1)*r*j1,y0-((k+1)%2)*0.12,cz+Math.sin(a1)*r*j1],am=(a0+a1)/2,sl=r/h;
    e[2]=sway?Math.round(sway*255):ez;mb.poly([A,B,top],v3n([Math.cos(am),sl,Math.sin(am)]),cMul(c,0.92+0.16*Math.cos(am-2.4)),M);
    mb.poly([A,[cx,y0+h*0.1,cz],B],[0,-1,0],cMul(c,0.55),M);}
  e[2]=ez;}
// Коробка с поворотом вокруг вертикали (a) — для заборов, щитов, повозок
function pBox(mb,cx,y0,cz,hx,h,hz,col,mat,a){a=a||0;const c=Math.cos(a),s=Math.sin(a),P=(x,y,z)=>[cx+x*c+z*s,y0+y,cz-x*s+z*c],N=(x,y,z)=>[x*c+z*s,y,-x*s+z*c],cc=hex2rgb(col),M=mat===undefined?MID.wood:mat;
  mb.poly([P(-hx,h,-hz),P(hx,h,-hz),P(hx,h,hz),P(-hx,h,hz)],N(0,1,0),cMul(cc,1.05),M);
  mb.poly([P(hx,0,-hz),P(hx,0,hz),P(hx,h,hz),P(hx,h,-hz)],N(1,0,0),cc,M);mb.poly([P(-hx,0,-hz),P(-hx,h,-hz),P(-hx,h,hz),P(-hx,0,hz)],N(-1,0,0),cc,M);
  mb.poly([P(-hx,0,hz),P(-hx,h,hz),P(hx,h,hz),P(hx,0,hz)],N(0,0,1),cc,M);mb.poly([P(-hx,0,-hz),P(hx,0,-hz),P(hx,h,-hz),P(-hx,h,-hz)],N(0,0,-1),cc,M);}
function pTree(t,v){return proto('tree|'+t+'|'+v,(mb,r)=>{
  const G=['#4d7836','#557d38','#4a7234'],sw=0.5;
  if(t==='plane'){pTrunk(mb,0,0,0,0.2,7.5,0.1,0.42,0.26,'#a8a28a',7);for(let i=0;i<3;i++)pTrunk(mb,0.2,6.5,0.1,(i-1)*2.2,9.6,(r()-0.5)*2,0.22,0.1,'#9a947c',5);
    for(let i=0;i<5+(v>>1);i++)pBlob(mb,(r()-0.5)*5.4,9.4+r()*3,(r()-0.5)*5.4,2.4+r()*0.8,1.8+r()*0.5,2.4+r()*0.8,G[(i+v)%3],r,1,undefined,sw);}
  else if(t==='poplar'){pTrunk(mb,0,0,0,0,4,0,0.28,0.2,'#5d4a36',6);for(let i=0;i<9;i++){const y=3.5+i*1.7,w=1.35*Math.sin(Math.PI*Math.min(1,0.12+i/9*0.95))+0.25;pBlob(mb,(r()-0.5)*0.4,y,(r()-0.5)*0.4,w,1.6,w,['#3e6a31','#44713a','#3a6330'][(i+v)%3],r,0,undefined,sw*0.8);}}
  else if(t==='cypress'){pTrunk(mb,0,0,0,0,1.4,0,0.18,0.14,'#4a3a28',5);const H=12+v*0.7;for(let i=0;i<7;i++){const f=i/6,w=1.05*Math.pow(Math.sin(Math.PI*(0.1+f*0.88)),0.8)*(1-f*0.35)+0.1;pBlob(mb,0,1.4+f*(H-2.6),0,w,H/7*0.85,w,'#2e4c2f',r,0,undefined,sw*0.6);}}
  else if(t==='olive'){pTrunk(mb,0,0,0,-0.4,2.2,0.1,0.36,0.2,'#6a5c4a',6);pTrunk(mb,0.1,0.5,0,0.8,2.5,-0.2,0.22,0.14,'#6a5c4a',5);for(let i=0;i<5;i++)pBlob(mb,(r()-0.5)*3.6,2.9+r()*1.3,(r()-0.5)*3.6,1.6+r()*0.5,0.95+r()*0.3,1.6+r()*0.5,['#7b8a62','#86946a','#71805a'][i%3],r,1,undefined,sw);}
  else if(t==='pine'){pTrunk(mb,0,0,0,0.5,9.6,0.2,0.3,0.16,'#7a5a3e',6);for(let i=0;i<5;i++)pBlob(mb,0.4+(r()-0.5)*4.4,10.4+r()*1.1,(r()-0.5)*4.4,1.9+r()*0.6,0.8+r()*0.2,1.9+r()*0.6,['#3b5f33','#436b3a'][i%2],r,1,undefined,sw);}
  else if(t==='fir'){pTrunk(mb,0,0,0,0,2,0,0.22,0.16,'#4a3626',5);const snow=v===1;for(let i=0;i<5;i++){const y0=1.1+i*2.1,w=2.4-i*0.4,h=3.2-i*0.2;pCone(mb,0,y0,0,w,h,snow&&i%2?'#dfe6ec':['#2f5d3c','#2a5436'][i%2],9,0,undefined,0.25);}}
  else if(t==='oak'){pTrunk(mb,0,0,0,0.1,4.2,0,0.55,0.38,'#5f4a36',7);for(let i=0;i<3;i++)pTrunk(mb,0.1,3.8,0,(i-1)*2.4,6.4,(r()-0.5)*1.6,0.3,0.14,'#5a4632',5);
    for(let i=0;i<6+(v>>1);i++)pBlob(mb,(r()-0.5)*5.8,6.4+r()*2.8,(r()-0.5)*5.8,2.5+r()*0.7,2+r()*0.5,2.5+r()*0.7,['#48692f','#4e7034','#43642c'][(i+v)%3],r,1,undefined,sw);}
  else if(t==='elm'){pTrunk(mb,0,0,0,0,3.6,0,0.42,0.3,'#5d4a35',6);[-1,-0.35,0.35,1].forEach(k=>pTrunk(mb,0,3.4,0,k*2.4,8,(r()-0.5)*1.4,0.22,0.1,'#58452f',5));
    for(let i=0;i<6;i++)pBlob(mb,(r()-0.5)*5.4,8.4+r()*2.2,(r()-0.5)*5.4,2.3+r()*0.6,1.75+r()*0.4,2.3+r()*0.6,['#557a37','#5b8039'][i%2],r,1,undefined,sw);}
  else if(t==='birch'){for(let s=0;s<6;s++)pTrunk(mb,s*0.04,s*1.6,0,(s+1)*0.04,(s+1)*1.6,0,0.2-s*0.018,0.2-(s+1)*0.018,s%2?'#e9e8e0':'#d8d6cc',6);
    for(let i=0;i<8;i++)pBlob(mb,0.2+(r()-0.5)*2.8,8+r()*3,(r()-0.5)*2.8,1.2+r()*0.4,1.5+r()*0.5,1.2+r()*0.4,['#79a24b','#83a852'][i%2],r,0,undefined,sw*1.2);}
  else if(t==='palm'){let x=0,y=0;for(let s=0;s<8;s++){const x2=0.9*Math.sin((s+1)/8*1.6)*(s+1)/8,y2=(s+1)*1.42;pTrunk(mb,x,y,0,x2,y2,0,0.26-s*0.012,0.25-(s+1)*0.012,s%2?'#8a6c4c':'#9c7c58',6);x=x2;y=y2;}
    const top=[x,y,0];for(let i=0;i<9;i++){const a=i/9*6.283+0.3,L=3+r()*0.8,dx=Math.cos(a),dz=Math.sin(a),e=mb.e;e[2]=200;
      const P=(t2,w)=>{const d=L*t2;return [top[0]+dx*d-dz*w,top[1]+0.6*Math.sin(t2*2.2)-t2*t2*2.2,top[2]+dz*d+dx*w];};const c=hex2rgb(i%2?'#4a7a38':'#3f6e32');
      for(let k=0;k<4;k++){const t0=k/4,t1=(k+1)/4,w0=0.55*Math.sin(Math.PI*Math.max(0.15,t0)),w1=0.55*Math.sin(Math.PI*t1);const q=[P(t0,-w0),P(t1,-w1),P(t1,w1),P(t0,w0)],n=v3n(v3x([q[1][0]-q[0][0],q[1][1]-q[0][1],q[1][2]-q[0][2]],[q[3][0]-q[0][0],q[3][1]-q[0][1],q[3][2]-q[0][2]]));
        const up=n[1]<0?[-n[0],-n[1],-n[2]]:n;mb.poly(q,up,c,MID.leaf);mb.poly(q,[-up[0],-up[1],-up[2]],cMul(c,0.7),MID.leaf);}e[2]=0;}
    pBlob(mb,top[0],top[1],0,0.35,0.3,0.35,'#6b5334',r,0,MID.bark);}
  else if(t==='bush'){for(let i=0;i<4;i++)pBlob(mb,(r()-0.5)*1.8,0.6+r()*0.5,(r()-0.5)*1.8,0.7+r()*0.3,0.6+r()*0.2,0.7+r()*0.3,['#4a6f35','#557a3a','#46693a'][(i+v)%3],r,0,undefined,0.3);}
  else if(t==='rock'){for(let i=0;i<3;i++)pBlob(mb,(i-1)*0.9+(r()-0.5)*0.4,0.25+r()*0.3,(r()-0.5)*0.8,0.9+r()*0.6,0.55+r()*0.4,0.8+r()*0.5,['#857c6e','#91887a','#766e62'][i],r,0,MID.stone);}
  else if(t==='hay'){const c='#c9a64e';for(let k=0;k<5;k++){const y0=k*0.62,y1=(k+1)*0.62,r0=1.9*Math.sqrt(1-Math.pow(y0/3.1,2)),r1=k===4?0.15:1.9*Math.sqrt(1-Math.pow(y1/3.1,2));pTrunk(mb,0,y0,0,0,y1,0,r0,r1,k%2?'#c9a64e':'#bfa048',10,MID.cloth);}}
  else if(t==='dune'){pBlob(mb,0,-0.4,0,5.5,2.6,3.6,'#dcc488',r,1,MID.stone);for(let i=0;i<6;i++)pBlob(mb,(r()-0.5)*7,1+r()*0.8,(r()-0.5)*4,0.35,0.3,0.35,'#8a9a5a',r,0,undefined,0.4);}
  else if(t==='cactus'){// опунция (фико д'Индия) Сицилии: плоские «лепёшки» ветками, рыжие плоды
    const pad=(x,y,z,a,sc)=>{pBlob(mb,x,y,z,0.42*sc,0.55*sc,0.12*sc,['#5f8a48','#6a9450','#58804a'][Math.floor(r()*3)],r,0,MID.leaf);return [x+Math.sin(a)*0.5*sc,y+0.75*sc,z+Math.cos(a)*0.18];};
    for(let b=0;b<5;b++){let p=[(r()-0.5)*0.8,0.45,(r()-0.5)*0.8],a=(r()-0.5)*1.6;for(let k=0;k<3+Math.floor(r()*2);k++){p=pad(p[0],p[1],p[2],a,1-k*0.12);a+=(r()-0.5)*1.4;if(r()<0.35)pBlob(mb,p[0],p[1]-0.1,p[2],0.07,0.09,0.07,'#d8602a',r,0,MID.leaf);}}}
  else if(t==='agave'){for(let k=0;k<14;k++){const a=k/14*6.283+r()*0.2,up=0.5+r()*0.9,L=1.1+r()*0.5;const c=hex2rgb(['#7f9a8a','#8aa494','#74907f'][k%3]);
      const P=(t2,w)=>[Math.cos(a)*L*t2*Math.cos(up*0.6)-Math.sin(a)*w,0.1+Math.sin(up)*L*t2-t2*t2*0.35*(1-up/1.4),Math.sin(a)*L*t2*Math.cos(up*0.6)+Math.cos(a)*w];
      mb.poly([P(0,-0.12),P(0.5,-0.1),P(1,0),P(0.5,0.1),P(0,0.12)],[0,1,0],c,MID.leaf);mb.poly([P(0,0.12),P(0.5,0.1),P(1,0),P(0.5,-0.1),P(0,-0.12)],[0,-1,0],cMul(c,0.8),MID.leaf);}}
  else if(t==='stog'){// стог на шесте
    for(let k=0;k<6;k++){const y0=k*0.75,y1=(k+1)*0.75,rr=y=>1.75*Math.pow(Math.max(0,1-y/4.6),0.85);pTrunk(mb,0,y0,0,0,y1,0,rr(y0)+0.02,Math.max(0.1,rr(y1)),k%2?'#b8984e':'#ab8c48',10,MID.cloth);}
    pTrunk(mb,0,4.2,0,0.05,5.4,0,0.06,0.04,'#6a5440',5,MID.wood);[-1,1].forEach(s2=>pTrunk(mb,0,3.9,0,s2*0.9,4.9,0.2,0.04,0.03,'#6a5440',4,MID.wood));}
  else if(t==='cliff'){for(let i=0;i<5;i++)pBlob(mb,(i-2)*2.8+(r()-0.5),2.5+r()*3,(r()-0.5)*1.5,2.2+r()*1.2,3.5+r()*2.5,1.8+r()*0.8,['#b8ad94','#a39880','#968b74'][i%3],r,1,MID.stone);pBlob(mb,-3,8,0,1.6,0.5,1,'#6f7d4e',r,0,undefined,0.3);}
  });}
// Мелочи у дороги (собираются в осях предмета: +x — к дороге, z — вдоль неё)
function pProp(t,v){return proto('prop|'+t+'|'+v,(mb,r)=>{
  if(t==='fence'){for(let z=-5;z<=5.01;z+=1.25)pBox(mb,0,0,z,0.07,1.4,0.07,'#7a5c3e');[0.45,0.95].forEach(y=>pBox(mb,0,y,0,0.04,0.12,5,'#8a6a48'));}
  else if(t==='wall'){for(let z=-5;z<5;z+=0.62){const h=1.05+r()*0.25;pBox(mb,0,0,z+0.31,0.32,h,0.3,['#b3aa96','#a39a88','#c2b9a5'][Math.floor(r()*3)],MID.stone);}pBox(mb,0,1.1,0,0.36,0.14,5,'#cbc3b0',MID.stone);}
  else if(t==='hedge'){for(let z=-5.5;z<=5.5;z+=1.1)pBlob(mb,0,0.85,z,0.75,0.9,0.75,['#46703a','#3f6834'][Math.abs(Math.round(z))%2],r,0,undefined,0.15);}
  else if(t==='vine'){for(let z=-5;z<=5;z+=2.2){pBox(mb,0,0,z,0.04,1.4,0.04,'#6b5236');pBlob(mb,0,0.9,z,0.5,0.45,0.9,'#5e8a3a',r,0,undefined,0.3);}pBox(mb,0,1.1,0,0.015,0.02,5.5,'#5a4a3a',MID.metal);}
  else if(t==='pole'){pTrunk(mb,0,0,0,0,8,0,0.13,0.1,'#6a5440',6,MID.wood);pBox(mb,0,7.4,0,1.25,0.16,0.07,'#5a4632');pBox(mb,0,6.75,0,0.9,0.13,0.07,'#5a4632');
    [-1.05,-0.4,0.4,1.05].forEach(x=>pTrunk(mb,x,7.56,0,x,7.72,0,0.05,0.04,'#e6eef2',5,MID.glass));[-0.7,0.7].forEach(x=>pTrunk(mb,x,6.88,0,x,7.02,0,0.045,0.035,'#e6eef2',5,MID.glass));}
  else if(t==='km'){pBox(mb,0,0,0,0.15,0.75,0.3,'#f0eee6',MID.stone);pTrunk(mb,0,0.75,0,0,0.9,0,0.3,0.12,'#c8473a',8,MID.stone);}
  else if(t==='sign'){pBox(mb,0,0,0,0.06,2.9,0.06,'#5a4a38');pBox(mb,0.08,1.95,0,0.03,1.05,0.88,'#2a2622');pBox(mb,0.1,2,0,0.03,0.95,0.82,'#f2c534',MID.paint);
    const e=mb.e;for(let k=0;k<3;k++){const z=-0.45+k*0.45,d=v?1:-1;mb.strip([0.135,2.72,z-0.13*d],[0.135,2.47,z+0.13*d],0.12,[1,0,0],[26,26,26],MID.paint,0.003);mb.strip([0.135,2.47,z+0.13*d],[0.135,2.22,z-0.13*d],0.12,[1,0,0],[26,26,26],MID.paint,0.003);}}
  else if(t==='lamp'){pTrunk(mb,0,0,0,0,4.4,0,0.09,0.06,'#26272b',6,MID.metal);pBox(mb,0,0,0,0.16,0.5,0.16,'#26272b',MID.metal);const e=mb.e;e[1]=5;pBox(mb,0,4.45,0,0.19,0.5,0.19,'#fff0c0',MID.glass);e[1]=0;pCone(mb,0,4.95,0,0.3,0.28,'#2a2c30',6,0,MID.metal);}
  else if(t==='cart'){pBox(mb,0,0.95,0.8,0.8,0.1,1.6,'#8a6a44');[-1,1].forEach(s=>pBox(mb,s*0.8,1.05,0.8,0.04,0.45,1.6,'#a07e58'));pBlob(mb,0,1.5,0.8,0.7,0.4,1.4,'#c9a64e',r,0,MID.cloth);
    [-1,1].forEach(s=>{const e=mb.e;for(let k=0;k<10;k++){const a0=k/10*6.283,a1=(k+1)/10*6.283;mb.poly([[s*0.86,0.62+Math.cos(a0)*0.62,0.8+Math.sin(a0)*0.62],[s*0.86,0.62+Math.cos(a1)*0.62,0.8+Math.sin(a1)*0.62],[s*0.86,0.62,0.8]],[s,0,0],hex2rgb('#4a3424'),MID.wood);}});
    // лошадь
    const hc='#6e4a2c';pBlob(mb,0,1.45,-1.6,0.42,0.45,0.95,hc,r,1,MID.leather);[[-0.2,-2.2],[0.2,-2.2],[-0.2,-1.0],[0.2,-1.0]].forEach(([x,z])=>pTrunk(mb,x,0,z,x,1.2,z,0.07,0.09,'#5a3a22',5,MID.leather));
    pTrunk(mb,0,1.6,-2.3,0,2.3,-2.75,0.18,0.14,hc,6,MID.leather);pBlob(mb,0,2.35,-2.95,0.15,0.16,0.32,hc,r,0,MID.leather);pBox(mb,0,1.35,-0.5,0.03,0.05,0.9,'#3a2a1a');}
  else if(t==='billboard'){[-3,3].forEach(z=>pBox(mb,0,0,z,0.11,2.4,0.11,'#5a4632'));pBox(mb,0,2.3,0,0.08,3.5,4,'#e8e0cc',MID.wood);}
  else if(t==='banner'){}
  else if(t==='verst'){// полосатая верста с табличкой
    for(let k=0;k<9;k++)pBox(mb,0,k*0.3,0,0.12,0.3,0.12,k%2?'#1c1c1c':'#f2efe6',MID.paint);pBox(mb,0,2.7,0,0.14,0.08,0.14,'#1c1c1c',MID.paint);pBox(mb,0.14,2.05,0,0.02,0.42,0.32,'#f2efe6',MID.paint);}
  else if(t==='well'){// колодец-журавль: сруб, столб-рогатина, длинный шест с бадьёй
    pBox(mb,0,0,0,0.7,0.9,0.7,'#7a5a3a',MID.wood);pBox(mb,0,0.9,0,0.74,0.1,0.74,'#6a4a2e',MID.wood);pTrunk(mb,-1.4,0,0,-1.4,4.2,0,0.14,0.11,'#6a5440',6,MID.wood);
    pTrunk(mb,-4.6,1.1,0,1.2,6.4,0,0.07,0.05,'#8a7050',5,MID.wood);pBox(mb,-4.6,0.9,0,0.28,0.35,0.28,'#6a4a2e',MID.wood);pTrunk(mb,1.2,6.4,0,1.2,2.2,0,0.02,0.02,'#5a4a3a',3,MID.wood);pTrunk(mb,1.2,2.2,0,1.2,1.9,0,0.18,0.16,'#6a4a2e',6,MID.wood);}
  else if(t==='fence_ru'){// частокол
    for(let z=-5;z<=5.01;z+=0.34){const h=1.55+((z*13|0)%3)*0.05;pBox(mb,0,0,z,0.05,h,0.07,'#8a7258');mb.poly([[0.05,h,z-0.07],[0.05,h,z+0.07],[0,h+0.16,z]],[1,0.3,0],hex2rgb('#7a6248'),MID.wood);}
    [0.35,1.15].forEach(y=>pBox(mb,-0.06,y,0,0.03,0.1,5.05,'#6a543e'));}
  });}
// Здания и трибуны — модели из 47-scenery.js, с цоколем, чтобы на склоне не висели в воздухе
function mbFromMesh(mb,M,o){o=o||{};const lift=o.lift||0.005,step=o.step===undefined?lift*0.35:o.step,gm=o.glass;const e=mb.e;
  for(const f of M.F){const mat=MID[f.mat&&f.mat.k]||0,c=f.col,tg=(gm&&f.mat===MATS.glass)?gm:mb;tg.e[0]=f.w||0;tg.e[1]=f.l||0;
    if(!f.point){if(f.vn){tg.polyN(f.p,f.n,f.vn,c,mat);if(f.two)tg.polyN(f.p,[-f.n[0],-f.n[1],-f.n[2]],f.vn.map(q=>[-q[0],-q[1],-q[2]]),c,mat);}
      else{tg.poly(f.p,f.n,c,mat);if(f.two)tg.poly(f.p,[-f.n[0],-f.n[1],-f.n[2]],c,mat);}}
    if(f.deco){let k=0;const n=f.point?null:f.n;for(const d of f.deco){k++;const L=lift+k*step,dc=hex2rgb(d.c||'#000'),dm=d.gl?MID.glass:(mat===MID.glass?MID.paint:mat);
      if(d.poly){if(!n)continue;tg.poly(d.poly.map(q=>[q[0]+n[0]*L,q[1]+n[1]*L,q[2]+n[2]*L]),n,dc,dm);}
      else if(d.text){if(o.texts&&n)o.texts.push({d,n,L});}
      else if(d.dot){if(!n)continue;const rr=Math.max(0.012,d.r*0.85),t1=v3n(Math.abs(n[1])>0.9?[1,0,0]:v3x([0,1,0],n)),t2=v3x(n,t1),P=[];for(let q=0;q<10;q++){const a=q/10*6.2832;P.push([d.dot[0]+(t1[0]*Math.cos(a)+t2[0]*Math.sin(a))*rr+n[0]*L*1.4,d.dot[1]+(t1[1]*Math.cos(a)+t2[1]*Math.sin(a))*rr+n[1]*L*1.4,d.dot[2]+(t1[2]*Math.cos(a)+t2[2]*Math.sin(a))*rr+n[2]*L*1.4]);}tg.poly(P,n,dc,dm);}
      else if(d.ring){if(!n)continue;const [x,y,z,rr]=d.ring,w=Math.max(0.01,d.w)/2,P=a=>d.ax==='z'?[x+Math.cos(a),y+Math.sin(a),z]:[x,y+Math.sin(a),z+Math.cos(a)];
        for(let q=0;q<20;q++){const a0=q/20*6.2832,a1=(q+1)/20*6.2832,ro=rr+w,ri=rr-w,pt=(a,rad)=>d.ax==='z'?[x+Math.cos(a)*rad+n[0]*L,y+Math.sin(a)*rad+n[1]*L,z+n[2]*L]:[x+n[0]*L,y+Math.sin(a)*rad+n[1]*L,z+Math.cos(a)*rad+n[2]*L];
          tg.poly([pt(a0,ro),pt(a1,ro),pt(a1,ri),pt(a0,ri)],n,dc,dm);}}
      else if(d.a&&d.b){if(!n)tg.rod(d.a,d.b,Math.max(0.014,d.w),dc,dm);else tg.strip(d.a,d.b,Math.max(o.minW||0.008,d.w),n,dc,dm,L);}}}}
  mb.e[0]=mb.e[1]=0;if(gm){gm.e[0]=gm.e[1]=0;}}
function pBld(t,v){return proto('bld|'+t+'|'+v,(mb,r)=>{const M=BLD[t](mulberry32(hashStr(t+v)),v||0);const texts=[];mbFromMesh(mb,M,{lift:0.03,step:0.012,minW:0.03,texts});mb.texts=texts;
  const b=mb.bb,wc=[150,140,125];pBox(mb,(b[0]+b[3])/2,-2.4,(b[2]+b[5])/2,(b[3]-b[0])/2*0.96,2.42,(b[5]-b[2])/2*0.96,'#8a8274',MID.stone);});}
function pStand(){return proto('stand',(mb)=>{const {M,R2,people}=standModel(1);mbFromMesh(mb,M,{lift:0.03,step:0.01});mbFromMesh(mb,R2,{lift:0.03,step:0.01});mb.people=people.map(q=>q.p);
  const b=mb.bb;pBox(mb,(b[0]+b[3])/2,-2.2,(b[2]+b[5])/2,(b[3]-b[0])/2*0.95,2.22,(b[5]-b[2])/2*0.95,'#6a5a48',MID.wood);});}
// Лес вдали: простые деревья, чтобы было где взгляду отдохнуть (без столкновений: туда не доехать)
function pFar(k){return proto('far|'+k,(mb,r)=>{if(k%3===0){pTrunk(mb,0,0,0,0,1.5,0,0.2,0.15,'#4a3626',4);pCone(mb,0,1.2,0,2.2,7.5,['#2f5d3c','#335f40'][k%2],6);}
  else{pTrunk(mb,0,0,0,0,3,0,0.3,0.22,'#5d4a35',4);pBlob(mb,0,5,0,2.6+r(),2.4,2.6+r(),['#48692f','#4e7034','#557a37'][k%3],r,0);}});}
/* ---------- люди: атлас фигур эпохи (два кадра — машут) ---------- */
function r3dPeopleAtlas(y){
  const S=1024,cv=mkCanvas(S,S),g=cv.getContext('2d'),P=48,cw=P,ch=Math.round(P*2.3),rnd=mulberry32(hashStr('crowd'+y)),out={crowd:[],marsh:[],gend:[],photo:[]};let x=0,yy=0,rowH=0;
  const cell=(w,h)=>{if(x+w*2>S){x=0;yy+=rowH+2;rowH=0;}rowH=Math.max(rowH,h);const c={x,y:yy,w,h};x+=w*2+2;return c;};
  for(let i=0;i<30;i++){const o=personLook(rnd,[1900,1910,1925][y<1906?0:y<1919?1:2],'crowd'),anim=rnd()<0.45,c=cell(cw,ch);
    [0,1].forEach(fr=>{g.save();g.translate(c.x+fr*c.w+c.w/2,c.y+c.h-1);g.scale(P,P);drawPerson(g,mulberry32(hashStr('p'+i+y)),Object.assign({},o,{wave:anim&&fr===1,frame:fr}));g.restore();});
    out.crowd.push({u:c.x/S,v:c.y/S,du:c.w/S,dv:c.h/S,w:c.w/P,h:c.h/P,anim:anim?1:0,child:o.type==='child'});}
  const spr=(kind,list,n)=>{for(let v=0;v<n;v++){const s0=peopleSprite(kind,v,0),s1=peopleSprite(kind,v,1),w=Math.round(s0.wM*P),h=Math.round(s0.hM*s0.ay*P),c=cell(w,h);
    [s0,s1].forEach((s,fr)=>g.drawImage(s.img,0,0,s.img.width,s.img.height*s.ay,c.x+fr*w,c.y,w,h));list.push({u:c.x/S,v:c.y/S,du:w/S,dv:h/S,w:w/P,h:h/P,anim:kind==='marsh'?1:0});}};
  spr('marsh',out.marsh,2);spr('gend',out.gend,1);spr('photo',out.photo,1);
  out.cv=cv;return out;}
/* ---------- кусок мира: дорога, обочины, декорации ---------- */
// Сетка «строки × столбцы» с нормалями по соседям; обход треугольников — лицом вверх
function mbGrid(mb,rows,uvs,cols,mat,tint){const R=rows.length,C=rows[0].length,i0=mb.n;
  for(let r=0;r<R;r++)for(let c=0;c<C;c++){const p=rows[r][c],a=rows[Math.min(R-1,r+1)][c],b=rows[Math.max(0,r-1)][c],e=rows[r][Math.min(C-1,c+1)],f=rows[r][Math.max(0,c-1)];
    let n=v3x([a[0]-b[0],a[1]-b[1],a[2]-b[2]],[e[0]-f[0],e[1]-f[1],e[2]-f[2]]);if(n[1]<0)n=[-n[0],-n[1],-n[2]];const t=uvs&&uvs[r][c];
    mb.v(p[0],p[1],p[2],n[0],n[1],n[2],tint?tint[r]:cols,mat,t&&t[0],t&&t[1]);}
  for(let r=0;r<R-1;r++)for(let c=0;c<C-1;c++){const a=i0+r*C+c,b=a+1,d=a+C,e=d+1;if(windUp(mb,a,b,e)){mb.tri(a,b,e);mb.tri(a,e,d);}else{mb.tri(a,e,b);mb.tri(a,d,e);}}}
function windUp(mb,a,b,c){const f=mb.f,s=mb.st>>2,ax=f[a*s],az=f[a*s+2],ux=f[b*s]-ax,uz=f[b*s+2]-az,vx=f[c*s]-ax,vz=f[c*s+2]-az;return (uz*vx-ux*vz)>=0;}
/* ---------- трава, цветы и камни у обочины: плоские пучки, качаются от ветра ---------- */
function r3dVegAtlas(cfg){const S=512,H=256,C=64,cv=mkCanvas(S,H),g=cv.getContext('2d'),tr=TERR[cfg.terr]||TERR.dirt,r=mulberry32(hashStr('veg'+cfg.terr+cfg.host));
  const base=hex2rgb(cfg.terr==='sand'||cfg.terr==='beach'?'#a9a060':cfg.terr==='mount'?'#7f8a50':(SCEN_SETS[cfg.host]||{}).grass||tr.g),out=[];let slot=0;
  const cell=()=>{const c={x:(slot%8)*C,y:Math.floor(slot/8)*C};slot++;return c;};
  const rgb=(c,k)=>`rgb(${Math.min(255,c[0]*k)|0},${Math.min(255,c[1]*k)|0},${Math.min(255,c[2]*k)|0})`;
  const blades=(c,n,hMin,hMax,col,thin)=>{for(let i=0;i<n;i++){const x0=c.x+C/2+(r()-0.5)*C*0.46,y0=c.y+C-5,h=(hMin+r()*(hMax-hMin))*(C-10),lean=(r()-0.5)*C*0.42,w=(thin?1.0:1.9)+r()*1.2,k=0.72+r()*0.5;
      const gr=g.createLinearGradient(0,y0,0,y0-h);gr.addColorStop(0,rgb(col,0.5*k));gr.addColorStop(1,rgb(col,1.18*k));g.fillStyle=gr;
      g.beginPath();g.moveTo(x0-w,y0);g.quadraticCurveTo(x0+lean*0.3-w*0.4,y0-h*0.55,x0+lean,y0-h);g.quadraticCurveTo(x0+lean*0.3+w*0.4,y0-h*0.55,x0+w,y0);g.closePath();g.fill();}};
  const add=(kind,c,w,h,sway)=>out.push({kind,u:(c.x+2)/S,v:(c.y+2)/H,du:(C-4)/S,dv:(C-4)/H,w,h,sway});
  for(let v=0;v<4;v++){const c=cell();blades(c,15+v*3,0.35,0.9,cMix(base,[70,105,40],0.25*v/3));add('grass',c,0.75,0.75,1);}
  for(let v=0;v<2;v++){const c=cell();blades(c,18,0.55,1,cMix(base,[196,176,110],0.6),true);add('dry',c,0.85,0.9,1);}
  // маки, ромашки, лютики, васильки
  [['#c41e28','#2a1a10'],['#f4f0e6','#e8c040'],['#f2d22e','#c89010'],['#4a70c8','#e8e0c0']].forEach(([pc,mc])=>{const c=cell();blades(c,11,0.3,0.62,base);
    for(let i=0;i<6;i++){const fx=c.x+C/2+(r()-0.5)*C*0.5,fy=c.y+C-9-(0.3+r()*0.42)*(C-12),rr=2.3+r()*1.5;g.fillStyle=pc;for(let k=0;k<5;k++){const a=k/5*6.283;g.beginPath();g.arc(fx+Math.cos(a)*rr*0.8,fy+Math.sin(a)*rr*0.8,rr*0.72,0,7);g.fill();}g.fillStyle=mc;g.beginPath();g.arc(fx,fy,rr*0.5,0,7);g.fill();}
    add('flower',c,0.65,0.65,1);});
  for(let v=0;v<2;v++){const c=cell(),cx=c.x+C/2,cy=c.y+C-6,rw=C*(0.3+r()*0.08),rh=C*(0.2+r()*0.08),P=[];for(let k=0;k<=8;k++){const a=Math.PI+k/8*Math.PI,q=0.82+r()*0.28;P.push([cx+Math.cos(a)*rw*q,cy+Math.sin(a)*rh*q*1.5]);}
    const gr=g.createLinearGradient(cx-rw,cy-rh*1.5,cx+rw*0.6,cy);gr.addColorStop(0,'#bdb7a8');gr.addColorStop(1,'#5a564e');g.fillStyle=gr;g.beginPath();P.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();
    add('stone',c,0.6,0.42,0);}
  {const c=cell(),col=cMix(base,[40,70,30],0.45);for(let i=0;i<70;i++){const a=r()*6.283,d=Math.sqrt(r()),x=c.x+C/2+Math.cos(a)*d*C*0.34,y=c.y+C*0.56+Math.sin(a)*d*C*0.28,k=0.55+0.55*(1-(y-c.y)/C)+r()*0.2;g.fillStyle=rgb(col,k);g.beginPath();g.arc(x,y,3+r()*4,0,7);g.fill();}add('bush',c,1.1,0.95,1);}
  return {cv,list:out};}
function r3dVeg(i0,i1){const T=R3.T,cfg=T.cfg,A=R3.veg,n=T.n,W=T.W;if(!A||cfg.terr==='snow'||cfg.oval||T.rc.track==='board')return null;
  const L=A.list,by=k=>L.filter(q=>q.kind===k),gr=by('grass'),dry=by('dry'),fl=by('flower'),st=by('stone'),bu=by('bush');
  const sandy=cfg.terr==='sand'||cfg.terr==='beach',mnt=cfg.terr==='mount'||cfg.uphill,per=sandy?2:mnt?3:5,out=[];
  for(let ii=i0;ii<i1;ii++){const i=ii%n;if(R3.town[i])continue;const r=mulberry32(i*7919+13),p=T.pts[i],nn=T.N[i],t=T.T[i];
    for(const sd of [1,-1]){if(cfg.terr==='beach'&&sd>0)continue;
      for(let k=0;k<per;k++){const a=0.7+Math.pow(r(),2.1)*13,off=sd*(W/2+a),al=r()*T.step,x=p[0]+nn[0]*off+t[0]*al,z=p[2]+nn[1]*off+t[1]*al,y=groundAt(i,off)-0.03;
        const q=r(),L2=mnt?(q<0.35?st:q<0.75?dry:gr):sandy?dry:(q<0.12?fl:q<0.22?dry:q<0.26?bu:q<0.3?st:gr),sp=L2[Math.floor(r()*L2.length)],k2=(0.8+r()*0.65)*(a<3?1.15:1);
        out.push(x,y,z,sp.w*k2,sp.h*k2,sp.u,sp.v,sp.du,sp.dv,0,0.7+r()*0.22,sp.sway);}}}
  return out.length?new Float32Array(out):null;}
// Трава — только около машины: куски позади и впереди камеры
function r3dVegUpload(kc){const I=R3.vI,d=I.data,nCh=R3.nCh,T=R3.T;let n=0;
  for(let dk=-1;dk<=4;dk++){let k=kc+dk;if(T.closed)k=((k%nCh)+nCh)%nCh;else if(k<0||k>=nCh)continue;const ch=R3.chunks[k];if(!ch||!ch.veg)continue;
    const m=Math.min(ch.veg.length/12,I.max-n);if(m<=0)break;d.set(ch.veg.subarray(0,m*12),n*12);n+=m;}
  const gl=G3.gl;gl.bindBuffer(gl.ARRAY_BUFFER,I.b);if(n)gl.bufferSubData(gl.ARRAY_BUFFER,0,d,0,n*12);R3.vN=n;R3.vegK=kc;R3.vegDirty=false;}
function r3dSection(i,iu){
  const T=R3.T,n=T.n,p=T.pts[i],nn=T.N[i],W=T.W,v=iu*T.step/R3.tile;const P=off=>[p[0]+nn[0]*off,roadY(i,off),p[2]+nn[1]*off];
  const road=[P(W/2),P(W/4),P(0),P(-W/4),P(-W/2)],uv=[[0,v],[0.25,v],[0.5,v],[0.75,v],[1,v]];
  let kmax=0;for(let d=-3;d<=3;d++){const j=T.closed?((i+d)%n+n)%n:clamp(i+d,0,n-1);if(Math.abs(T.K[j])>Math.abs(kmax))kmax=T.K[j];}
  const town=R3.town[i];
  const sh=[1,-1].map(sd=>{const inner=kmax*sd>0,aMax=inner?Math.min(14,0.85/Math.abs(kmax)-W/2):14;
    const A=(town?[0,0.12,3,6,14]:[0,1.5,4,8.5,14]).filter(a=>a<=aMax);if(A.length<2)return null;
    return A.map((a,k)=>{const off=sd*(W/2+a),x=p[0]+nn[0]*off,z=p[2]+nn[1]*off;let y=a===14?fH(x,z)-0.6:shoulderY(i,sd,a,x,z);if(a===0)y-=0.02;return [x,y,z];});});
  return {road,uv,sh,tex:r3dTexKey(i),tint:0.92+0.16*vnz(iu/9,0.5,5)};
}
function r3dChunk(k){
  const T=R3.T,n=T.n,W=T.W,i0=k*R3CH,i1=Math.min(T.closed?n:n-1,i0+R3CH);if(i1<=i0)return null;
  const roads={},gnd=new MB(),lit=new MB(),S=[];for(let i=i0;i<=i1;i++)S.push(r3dSection(i%n,i));
  for(let s=0;s<S.length-1;s++){const A=S[s],B=S[s+1],mb=roads[A.tex]||(roads[A.tex]=new MB(true));const ta=cMul([255,255,255],A.tint),tb=cMul([255,255,255],B.tint);
    mbGrid(mb,[A.road,B.road],[A.uv,B.uv],null,MID.stone,[ta,tb]);
    [0,1].forEach(sd=>{const a=A.sh[sd],b=B.sh[sd];if(!a||!b)return;const m=Math.min(a.length,b.length);mbGrid(gnd,[a.slice(0,m),b.slice(0,m)],null,[255,255,255],MID.matte);});}
  const people=[];
  for(let i=i0;i<i1;i++){const j=i%n;for(const it of T.spr[j])r3dItem(it,j,lit,people);}
  // старт и финиш: клетчатая линия поперёк дороги
  const fin=[T.finishIdx,T.closed?-1:T.startIdx];fin.forEach((fi,q)=>{if(fi<i0||fi>=i1)return;const p=T.pts[fi],nn=T.N[fi],t=T.T[fi],mb=roads.__chk||(roads.__chk=new MB(true));
    const P=(off,dz)=>[p[0]+nn[0]*off+t[0]*dz,roadY(fi,off)+0.012,p[2]+nn[1]*off+t[1]*dz];mb.poly([P(W/2,-0.6),P(-W/2,-0.6),P(-W/2,0.6),P(W/2,0.6)],[0,1,0],[255,255,255],MID.matte,[[0,0],[1,0],[1,1],[0,1]]);});
  const ch={i0,i1,roads:Object.keys(roads).map(key=>({key,m:g3Mesh(roads[key])})),gnd:g3Mesh(gnd),lit:g3Mesh(lit),veg:r3dVeg(i0,i1)};R3.vegDirty=true;
  const bs=[ch.gnd,ch.lit,...ch.roads.map(r=>r.m)].filter(Boolean);let c=[0,0,0];bs.forEach(m=>{c[0]+=m.c[0]/bs.length;c[1]+=m.c[1]/bs.length;c[2]+=m.c[2]/bs.length;});
  ch.c=c;ch.r=Math.max(...bs.map(m=>Math.hypot(m.c[0]-c[0],m.c[1]-c[1],m.c[2]-c[2])+m.r),1);
  if(people.length)r3dAddPeople(people);
  return ch;
}
// Предмет у дороги → геометрия куска (или люди — в общий список)
function r3dItem(it,i,mb,people){
  const T=R3.T,p=T.pts[i],nn=T.N[i],t=T.T[i],W=T.W,wd=it.wx!==undefined,x=wd?it.wx:p[0]+nn[0]*it.off,z=wd?it.wz:p[2]+nn[1]*it.off,ry=Math.atan2(t[0],t[1]),side=it.off>0?1:-1,y=wd?fH(x,z):groundAt(i,it.off);
  const h=hashStr(it.t+i+'|'+it.off),rnd=mulberry32(h),face=wd?it.rot:side>0?ry:ry+Math.PI;
  if(it.k==='p'){r3dCrowd(it,i,x,y,z,ry,side,rnd,people);return;}
  switch(it.t){
    case 'sea':case 'banner':return it.t==='banner'?r3dBanner(i,mb,'ФИНИШ'):undefined;
    case 'plane':case 'poplar':case 'cypress':case 'olive':case 'pine':case 'fir':case 'oak':case 'elm':case 'birch':case 'palm':case 'bush':case 'rock':case 'hay':case 'cactus':case 'agave':case 'stog':
      mb.add(pTree(it.t,(it.v||0)%3),X3(rnd()*6.28,0.85+rnd()*0.3,[x,y-0.05,z]));return;
    case 'dune':case 'cliff':mb.add(pTree(it.t,0),X3(face+(rnd()-0.5)*0.4,0.9+rnd()*0.2,[x,y-0.3,z]));return;
    case 'fence':case 'wall':case 'hedge':case 'vine':mb.add(pProp(it.t,0),X3(face,1,[x,y,z]));return;
    case 'verst':case 'well':case 'fence_ru':
    case 'pole':case 'km':case 'sign':case 'lamp':case 'cart':case 'billboard':mb.add(pProp(it.t,it.v||0),X3(face,1,[x,y,z]));if(it.t==='billboard')r3dAd(it.v||0,x,y,z,face);return;
    case 'stand':{const P=pStand(),X=X3(face,1,[x,y,z]);mb.add(P,X);const rr=mulberry32(h+5);P.people.forEach(q=>{const w=r3dXf(X,q);people.push([w[0],w[1]+0.05,w[2],R3.atlas.crowd[Math.floor(rr()*R3.atlas.crowd.length)],0.95+rr()*0.1,rr()<0.25]);});return;}
    default:if(BLD[it.t]){const P=pBld(it.t,(it.v||0)%3),X=X3(face,1,[x,y,z]);mb.add(P,X);if(P.texts&&P.texts.length)r3dTexts(P.texts,X);}
  }
}
const r3dXf=(X,q)=>{const r=X.r,s=X.s;return [(r[0]*q[0]+r[1]*q[1]+r[2]*q[2])*s+X.t[0],(r[3]*q[0]+r[4]*q[1]+r[5]*q[2])*s+X.t[1],(r[6]*q[0]+r[7]*q[1]+r[8]*q[2])*s+X.t[2]];};
// Толпа: 6–9 человек в два ряда вдоль дороги; маршал, жандарм, фотограф — по одному
function r3dCrowd(it,i,x,y,z,ry,side,rnd,people){const A=R3.atlas,tx=Math.sin(ry),tz=Math.cos(ry),T=R3.T,nn=T.N[i];
  if(it.t!=='crowd'){const L=A[it.t]||A.crowd,s=L[(it.v||0)%L.length];people.push([x,y,z,s,1,s.anim]);return;}
  const k=6+Math.floor(rnd()*4);for(let q=0;q<k;q++){const back=q>=k*0.6,along=(rnd()-0.5)*5.4,out=(back?0.9:0)+(rnd()-0.5)*0.3,off=it.off+side*out;
    const px=T.pts[i][0]+nn[0]*off+tx*along,pz=T.pts[i][2]+nn[1]*off+tz*along,s=A.crowd[Math.floor(rnd()*A.crowd.length)];people.push([px,groundAt(i,off),pz,s,0.93+rnd()*0.12,s.anim]);}}
function r3dAddPeople(L){const P=R3.people;L.forEach(q=>P.push(q));R3.peopleDirty=true;}
/* ---------- надписи: финиш, реклама, вывески ---------- */
function r3dLabelAtlas(){const S=1024,cv=mkCanvas(S,S);R3.lab={cv,g:cv.getContext('2d'),x:0,y:0,h:0,S,slots:{}};}
function r3dLabel(key,w,h,draw){const L=R3.lab;if(L.slots[key])return L.slots[key];if(L.x+w>L.S){L.x=0;L.y+=L.h+2;L.h=0;}if(L.y+h>L.S)return null;const s={u0:L.x/L.S,v0:L.y/L.S,u1:(L.x+w)/L.S,v1:(L.y+h)/L.S};
  L.g.save();L.g.translate(L.x,L.y);draw(L.g,w,h);L.g.restore();L.x+=w+2;L.h=Math.max(L.h,h);L.slots[key]=s;R3.labDirty=true;return s;}
// Квадрат с надписью: углы p0 (низ-лево), p1 (низ-право), p3 (верх-лево)
function r3dSignQuad(s,p0,p1,p3,n){const mb=R3.signs,p2=[p1[0]+p3[0]-p0[0],p1[1]+p3[1]-p0[1],p1[2]+p3[2]-p0[2]];mb.poly([p0,p1,p2,p3],n,[255,255,255],MID.cloth,[[s.u0,s.v1],[s.u1,s.v1],[s.u1,s.v0],[s.u0,s.v0]]);R3.signsDirty=true;}
function r3dTexts(texts,X){texts.forEach(({d,n,L})=>{const s=r3dLabel('t|'+d.text+'|'+d.c+'|'+d.font,Math.min(512,Math.round(d.w*80)),Math.round(d.h*80),(g,w,h)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,w,h);g.scale(w/d.w,h/d.h);g.fillStyle=d.c;g.font=d.font;g.textAlign='center';g.textBaseline='middle';g.fillText(d.text,d.w/2,d.h*0.54);});if(!s)return;
  const nw=r3dXf({r:X.r,s:1,t:[0,0,0]},n),o=q=>{const w=r3dXf(X,q);return [w[0]+nw[0]*L*1.2,w[1]+nw[1]*L*1.2,w[2]+nw[2]*L*1.2];};r3dSignQuad(s,o(d.at[0]),o(d.at[1]),o(d.at[2]),nw);});}
function r3dAd(v,x,y,z,face){const ads=[['ШИНЫ','#1f3f7a','#f1e6c8','ПРОЧНЫЕ И БЫСТРЫЕ'],['БЕНЗИН','#b8322a','#f7ecd0','ДЛЯ ГОНОК'],['СВЕЧИ','#2b5a3a','#f1e6c8','ИСКРА ВЕРНАЯ'],['МАСЛО','#3a2a1c','#e8c56a','МОТОР БЕРЕЖЁТ']][v%4];
  const s=r3dLabel('ad'+v,400,172,(g,w,h)=>{g.fillStyle='#e8e0cc';g.fillRect(0,0,w,h);g.fillStyle=ads[1];g.fillRect(8,8,w-16,h-16);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(8,8,w-16,50);g.fillStyle=ads[2];g.textAlign='center';g.font='bold 74px Impact,"Arial Black",sans-serif';g.fillText(ads[0],w/2,100);g.font='bold 22px sans-serif';g.fillText(ads[3],w/2,146);});
  if(!s)return;const X=X3(face,1,[x,y,z]),q=(a,b,c)=>r3dXf(X,[a,b,c]),nw=r3dXf({r:X.r,s:1,t:[0,0,0]},[1,0,0]);r3dSignQuad(s,q(0.1,2.35,3.9),q(0.1,2.35,-3.9),q(0.1,5.75,3.9),nw);}
// Растяжка над дорогой: два столба и полотнище «ФИНИШ»/«СТАРТ»
function r3dBanner(i,mb,text){const T=R3.T,p=T.pts[i],nn=T.N[i],t=T.T[i],W=T.W,ry=Math.atan2(t[0],t[1]),H=5.6,sp=W/2+1.4;
  [1,-1].forEach(sd=>{const x=p[0]+nn[0]*sd*sp,z=p[2]+nn[1]*sd*sp,y=groundAt(i,sd*sp);pTrunk(mb,x,y,z,x,y+H+1.1,z,0.16,0.12,'#5a4632',6,MID.wood);});
  const s=r3dLabel('ban'+text,512,64,(g,w,h)=>{g.fillStyle='#f1ece0';g.fillRect(0,0,w,h);for(let k=0;k<32;k++){g.fillStyle=k%2?'#111':'#f1ece0';g.fillRect(k*16,h-12,16,12);g.fillStyle=k%2?'#f1ece0':'#111';g.fillRect(k*16,0,16,10);}g.fillStyle='#1c1406';g.font='bold 38px Impact,"Arial Black",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+1);});
  if(!s)return;const y0=p[1]+H,P=(sd,dy,dz)=>[p[0]+nn[0]*sd*sp+t[0]*dz,y0+dy,p[2]+nn[1]*sd*sp+t[1]*dz];const n3=[t[0],0,t[1]];
  r3dSignQuad(s,P(1,0,-0.03),P(-1,0,-0.03),P(1,1.1,-0.03),[-n3[0],0,-n3[2]]);r3dSignQuad(s,P(-1,0,0.03),P(1,0,0.03),P(-1,1.1,0.03),n3);}
// Точка в пятне приметы (там не растут деревья)
function lmNear(x,z){const L=R3.T&&R3.T.lm;if(!L||!L.length)return false;for(const q of L)if(q.off&&Math.hypot(x-q.x,z-q.z)<q.r+3)return true;return false;}
/* ---------- земля кусками 128 м; вдали реже, за 700 м от трассы не строится ---------- */
function r3dTile(tx,tz){const F=R3.F,TS=16,k0=tx*TS,j0=tz*TS;if(k0>=F.nx-1||j0>=F.nz-1)return null;
  let dmin=1e9;for(let j=j0;j<=Math.min(F.nz-1,j0+TS);j+=4)for(let k=k0;k<=Math.min(F.nx-1,k0+TS);k+=4)dmin=Math.min(dmin,F.D[j*F.nx+k]);if(dmin>720)return {skip:1};
  const st=dmin>170?4:dmin>70?2:1,mb=new MB(),rows=[];
  for(let j=j0;j<=Math.min(F.nz-1,j0+TS);j+=st){const row=[];for(let k=k0;k<=Math.min(F.nx-1,k0+TS);k+=st)row.push([F.x0+k*F.S,F.G[j*F.nx+k],F.z0+j*F.S]);rows.push(row);}
  if(rows.length<2||rows[0].length<2)return {skip:1};mbGrid(mb,rows,null,[255,255,255],MID.matte);
  // юбка по краям куска — закрывает щели между кусками разной подробности
  const R=rows.length,C=rows[0].length,edges=[rows[0],rows[R-1],rows.map(r=>r[0]),rows.map(r=>r[C-1])];
  edges.forEach(e=>{const lo=e.map(q=>[q[0],q[1]-4,q[2]]);mbGrid(mb,[e,lo],null,[255,255,255],MID.matte);});
  // лес: деревья в пятнах рощ
  const trees=new MB(),x0=F.x0+k0*F.S,z0=F.z0+j0*F.S,x1=x0+TS*F.S,z1=z0+TS*F.S,r=mulberry32(tx*7919+tz*104729);
  R3.forest.forEach(([fx,fz,fr])=>{if(fx+fr<x0||fx-fr>x1||fz+fr<z0||fz-fr>z1)return;const cnt=Math.round(fr*fr/90);
    for(let q=0;q<cnt;q++){const a=r()*6.283,d=Math.sqrt(r())*fr,x=fx+Math.cos(a)*d,z=fz+Math.sin(a)*d;if(x<x0||x>=x1||z<z0||z>=z1)continue;if(fSample(F,F.D,x,z)<40||lmNear(x,z))continue;
      trees.add(pFar(Math.floor(r()*6)),X3(r()*6.28,0.8+r()*0.5,[x,fSample(F,F.G,x,z)-0.2,z]));}});
  // склоны: в горах — ели, кусты и валуны; на холмах — редкие деревья (иначе склон похож на картонную стену)
  if(dmin<380){const pr=F.mount?0.16:0.035;for(let j=j0;j<Math.min(F.nz-1,j0+TS);j++)for(let k=k0;k<Math.min(F.nx-1,k0+TS);k++){const q=j*F.nx+k,d=F.D[q];if(d<24||d>420||r()>pr)continue;
    const sl=Math.hypot(F.H[q+1]-F.H[q],F.H[q+F.nx]-F.H[q])/F.S;if(sl<0.12)continue;const x=F.x0+(k+r())*F.S,z=F.z0+(j+r())*F.S,y=fSample(F,F.G,x,z);if(lmNear(x,z))continue;
    if(sl>0.8&&F.mount&&r()<0.55)trees.add(pTree('rock',Math.floor(r()*3)),X3(r()*6.28,1+r()*1.6,[x,y-0.4,z]));else if(sl>0.8&&F.mount)trees.add(pTree('bush',Math.floor(r()*3)),X3(r()*6.28,1.2+r()*0.8,[x,y-0.2,z]));else if(F.mount&&r()<0.35)trees.add(pTree('bush',Math.floor(r()*3)),X3(r()*6.28,0.9+r()*0.6,[x,y-0.1,z]));else trees.add(pFar(F.mount?0:1+Math.floor(r()*2)),X3(r()*6.28,0.7+r()*0.5,[x,y-0.2,z]));}}
  return {g:g3Mesh(mb),t:g3Mesh(trees),c:[(x0+x1)/2,0,(z0+z1)/2]};}
/* ---------- машины: модель из 46-models.js, колёса крутятся, кузов кренится ---------- */
function r3dCarMesh(spec,near){const key=[spec.style,spec.color,spec.wheel,spec.mech?1:0,spec.b,spec.y,spec.hp===undefined?'':spec.hp,spec.strip?1:0,spec.acc||'',spec.lux?1:0,spec.mq||'',spec.num||0].join('|')+(near?'|h':'|l');let m=R3.carM.get(key);if(m)return m;
  const M=carModel(Object.assign({},spec,{lod:near?'hi':'lo'})),op=new MB(),gl=new MB();mbFromMesh(op,M,{lift:0.004,step:0.0016,glass:gl});
  const wc=new Float32Array(24);(M.wheels||[]).slice(0,6).forEach((w,k)=>wc.set(w,k*4));
  m={op:g3Mesh(op),gl:g3Mesh(gl),wc,len:M.len||[-1.6,1.6],eye:M.eye||[0.25,1.7,-0.2],pivot:(M.wheels&&M.wheels[0]?Math.abs(M.wheels[0][3]):0.42)};R3.carM.set(key,m);return m;}
function r3dCarState(c){if(!c.v3)c.v3={roll:0,pitch:0,heave:0,vr:0,vp:0,vh:0,spin:0,vxp:c.vx,ax:0,mk:[null,null],dust:0,y:null};return c.v3;}
/* ---------- установка сцены ---------- */
function r3dSetup(){
  const cv=document.getElementById('rgl');cv.hidden=false;document.getElementById('rcv').hidden=true;
  if(!g3Init(cv))throw new Error('no webgl2');
  const T=R.trk,cfg=T.cfg,gl=G3.gl;
  Object.keys(R3).forEach(k=>delete R3[k]);
  Object.assign(R3,{on:true,T,time:0,build:[],chunks:[],tiles:{},people:[],peopleDirty:true,carM:new Map(),parts:[],skid:{n:0,head:0,max:1400},view:0,ready:false,t0:performance.now(),fr:[],scale:1});
  R3.town=T.town||new Uint8Array(T.n);R3.bank=r3dBank(T);R3.tile=T.closed?T.len/Math.max(1,Math.round(T.len/8)):8;
  R3.F=r3dField(T);
  // фактуры, не зависящие от трассы, живут, пока жив 3D-контекст: следующая гонка стартует быстрее
  const C=G3.cache,era=R.rc.y<1906?0:R.rc.y<1919?1:2;
  if(!C['atlas'+era]){const a=r3dPeopleAtlas([1900,1910,1925][era]);C['atlas'+era]={a,t:g3Tex(a.cv,{pre:true,cs:true,ct:true})};}R3.atlas=C['atlas'+era].a;R3.texPeople=C['atlas'+era].t;
  const cm=r3dColorMap(T,R3.F);R3.texCM=g3Tex(cm.cv,{cs:true,ct:true,aniso:false});R3.cmU=cm.u;R3.texDet=C.det||(C.det=g3Tex(r3dDetailTex()));
  R3.texFor=key=>{const k='road|'+key+'|'+T.W;return C[k]||(C[k]=key==='__chk'?g3Tex(r3dChecker()):g3Tex(r3dRoadTex(key,T.W)));};
  r3dLabelAtlas();R3.signs=new MB(true);R3.texLab=null;
  R3.texPuff=C.puff||(C.puff=g3Tex(r3dPuff(),{cs:true,ct:true}));
  const sk='sky|'+cfg.host+'|'+cfg.terr+'|'+(cfg.uphill?1:0);if(!C[sk]){r3dSkyTex(T);C[sk]={p:R3.texPan,c:R3.texCld,top:R3.panTop};}else{R3.texPan=C[sk].p;R3.texCld=C[sk].c;R3.panTop=C[sk].top;}
  R3.env=r3dEnvBase(T);
  R3.pI=g3Inst(9000,3,G3.quad);R3.partI=g3Inst(700,2,G3.quadC);
  const vk='veg|'+cfg.terr+'|'+cfg.host;if(!C[vk]){const a=r3dVegAtlas(cfg);C[vk]={a,t:g3Tex(a.cv,{pre:true,cs:true,ct:true})};}R3.veg=C[vk].a;R3.texVeg=C[vk].t;R3.vI=g3Inst(2400,3,G3.quad);R3.vegK=-99;R3.vN=0;
  r3dSkidInit();
  if(!cfg.closed)r3dBannerStart();
  // море у пляжа: большая гладь чуть ниже дороги (земля к воде опускается)
  if(R3.F.beach){const F=R3.F,mb=new MB();let lo=1e9;T.pts.forEach(p=>{lo=Math.min(lo,p[1]);});const y=lo-1.1,x0=F.x0,z0=F.z0,x1=F.x0+(F.nx-1)*F.S,z1=F.z0+(F.nz-1)*F.S,c=hex2rgb('#2a6a8e');
    const N=8;for(let a=0;a<N;a++)for(let b=0;b<N;b++){const xa=x0+(x1-x0)*a/N,xb=x0+(x1-x0)*(a+1)/N,za=z0+(z1-z0)*b/N,zb=z0+(z1-z0)*(b+1)/N;mb.poly([[xa,y,za],[xb,y,za],[xb,y,zb],[xa,y,zb]],[0,1,0],c,MID.water);}
    R3.water=g3Mesh(mb);}
  // очередь постройки: куски трассы от старта вперёд, земля — от старта во все стороны
  const nCh=Math.ceil((T.closed?T.n:T.n-1)/R3CH),s0=Math.floor((T.closed?0:Math.max(0,T.startIdx-40))/R3CH);R3.nCh=nCh;
  const order=[];for(let k=0;k<nCh;k++){const kk=T.closed?((s0+k)%nCh+nCh)%nCh:s0+k;if(kk<nCh)order.push(kk);}if(!T.closed)for(let k=s0-1;k>=0;k--)order.push(k);
  if(T.closed){const back=[nCh-1,nCh-2];order.sort((a,b)=>(back.includes(a)?-0.5:0)-(back.includes(b)?-0.5:0));}
  R3.order=order;R3.next=0;
  R.cars.forEach(c=>{r3dCarMesh(c.spec3,true);r3dCarMesh(c.spec3,false);c.v3=null;});
  R3.cam=null;R3.eye=[R.follow.x,R.follow.y+3,R.follow.z];
  // первые куски — сразу, чтобы старт не был пустым
  const tS=performance.now();while(R3.next<order.length&&(R3.next<2||performance.now()-tS<110))r3dBuildStep();
  r3dTilesAround(R.follow.x,R.follow.z,200,60);
}
function r3dChecker(){const c=mkCanvas(64,16),g=c.getContext('2d');for(let i=0;i<16;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#141414':'#f4f2ea';g.fillRect(i*4,j*4,4,4);}return c;}
function r3dBannerStart(){const T=R3.T,i=Math.min(T.n-1,T.startIdx+1),mb=new MB();r3dBanner(i,mb,'СТАРТ');R3.startMesh=g3Mesh(mb);}
function r3dPuff(){const S=64,c=mkCanvas(S,S),g=c.getContext('2d'),r=mulberry32(9);for(let i=0;i<14;i++){const x=S/2+(r()-0.5)*20,y=S/2+(r()-0.5)*20,rr=10+r()*14,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S);}
  const gr=g.createRadialGradient(S/2,S/2,S*0.2,S/2,S/2,S/2);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.globalCompositeOperation='destination-in';g.fillStyle=gr;g.fillRect(0,0,S,S);return c;}
function r3dBuildStep(){const k=R3.order[R3.next++];if(k===undefined)return;const ch=r3dChunk(k);if(ch)R3.chunks[k]=ch;}
function r3dTilesAround(x,z,rad,budget){const F=R3.F,TS=16*F.S,t0=performance.now(),cx=Math.floor((x-F.x0)/TS),cz=Math.floor((z-F.z0)/TS),r=Math.ceil(rad/TS);
  const L=[];for(let j=cz-r;j<=cz+r;j++)for(let k=cx-r;k<=cx+r;k++){if(k<0||j<0)continue;const key=k+','+j;if(R3.tiles[key]!==undefined)continue;L.push([Math.hypot(k-cx,j-cz),k,j,key]);}
  L.sort((a,b)=>a[0]-b[0]);for(const [,k,j,key] of L){if(performance.now()-t0>budget)break;R3.tiles[key]=r3dTile(k,j)||{skip:1};}}
/* ---------- небо: облака и дальние горы (из рисунков заднего плана) ---------- */
function r3dSkyTex(T){const set=SCEN_SETS[T.cfg.host],bg=mkBackdrop(set,T.cfg);
  const pc=mkCanvas(bg.W,bg.H),pg=pc.getContext('2d');pg.drawImage(bg.far,0,0);pg.drawImage(bg.mid,0,0);
  R3.texPan=g3Tex(pc,{mip:false,ct:true});R3.panTop=bg.tops[0];
  const W=2048,H=256,cc=mkCanvas(W,H),g=cc.getContext('2d'),r=mulberry32(hashStr('clouds'+T.cfg.host));
  const puff=(x,y,w,h)=>{const n=Math.max(7+Math.floor(r()*5),Math.round(w/(h*0.55)));for(const dx of [0,-W,W]){g.fillStyle='rgba(160,172,190,.35)';for(let k=0;k<n;k++){const t=k/(n-1),px=x+dx+(t-0.5)*w,py=y-Math.sin(t*Math.PI)*h*0.5+(r()-0.5)*h*0.2,rr=h*(0.35+Math.sin(t*Math.PI)*0.4);g.beginPath();g.arc(px,py+rr*0.25,rr,0,7);g.fill();}
      for(let k=0;k<n;k++){const t=k/(n-1),px=x+dx+(t-0.5)*w,py=y-Math.sin(t*Math.PI)*h*0.5,rr=h*(0.33+Math.sin(t*Math.PI)*0.38);const gr=g.createRadialGradient(px-rr*0.3,py-rr*0.4,rr*0.1,px,py,rr);gr.addColorStop(0,'rgba(255,255,255,.96)');gr.addColorStop(0.7,'rgba(242,245,250,.9)');gr.addColorStop(1,'rgba(205,214,226,.0)');g.fillStyle=gr;g.beginPath();g.arc(px,py,rr,0,7);g.fill();}}};
  for(let i=0;i<9;i++)puff(r()*W,H*(0.2+r()*0.35),180+r()*260,60+r()*50);for(let i=0;i<7;i++)puff(r()*W,H*(0.8+r()*0.12),140+r()*160,10+r()*8);
  R3.texCld=g3Tex(cc,{mip:false,ct:true});}
/* ---------- свет: день, сумерки, ночь ---------- */
function r3dEnvBase(T){const set=SCEN_SETS[T.cfg.host],tr=TERR[T.cfg.terr]||TERR.dirt,mix3=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
  const ze=lin(set.sky[0]),hz=lin(set.sky[1]),gr=lin(T.cfg.terr==='snow'?'#e9edf2':set.grass||tr.g),misty=T.cfg.stages||T.rc.y<1900;
  const zs=[ze[0]*0.62,ze[1]*0.72,ze[2]*0.94];
  const day={sun:v3n([-0.42,0.62,0.66]),sunC:[1.92,1.74,1.46],skyC:mul(mix3(zs,[0.62,0.66,0.72],0.55),0.8),gndC:mix3(mul(gr,0.35),[0.09,0.085,0.07],0.65),hzC:mix3(mul(hz,0.7),[0.44,0.54,0.68],0.72),zeC:zs,fogS:[0.88,0.82,0.69],fogD:misty?0.0015:0.0011,exp:0.92,night:0,hl:0,lamp:0};
  const dusk={sun:v3n([-0.3,0.09,0.95]),sunC:[1.5,0.72,0.38],skyC:[0.16,0.14,0.22],gndC:[0.05,0.04,0.04],hzC:[0.85,0.46,0.3],zeC:[0.12,0.13,0.3],fogS:[1.2,0.62,0.32],fogD:0.0025,exp:1.2,night:0.2,hl:0.6,lamp:0.6};
  const night={sun:v3n([0.3,0.7,-0.5]),sunC:[0.12,0.15,0.24],skyC:[0.018,0.024,0.04],gndC:[0.006,0.007,0.01],hzC:[0.02,0.028,0.05],zeC:[0.004,0.006,0.016],fogS:[0.03,0.035,0.06],fogD:0.0045,exp:1.6,night:1,hl:1,lamp:1};
  return {day,dusk,night,mix:(a,b,k)=>{const o={};for(const key in a)o[key]=Array.isArray(a[key])?mix3(a[key],b[key],k):a[key]+(b[key]-a[key])*k;o.sun=v3n(o.sun);return o;}};}
function r3dEnvNow(){const E=R3.env,cfg=R3.T.cfg,F=R.follow;if(!cfg.night)return E.day;const p=clamp(F.prog/R3.T.raceLen,0,1);
  if(p<0.25||p>0.85)return E.day;if(p<0.3)return E.mix(E.day,E.dusk,(p-0.25)/0.05);if(p<0.35)return E.mix(E.dusk,E.night,(p-0.3)/0.05);if(p<0.75)return E.night;if(p<0.8)return E.mix(E.night,E.dusk,(p-0.75)/0.05);return E.mix(E.dusk,E.day,(p-0.8)/0.05);}
/* ---------- частицы: пыль, дым заноса, пар; следы шин ---------- */
function r3dSkidInit(){const gl=G3.gl,S=R3.skid,mb=new MB();mb.grow(S.max*4);mb.n=S.max*4;for(let q=0;q<S.max;q++){const a=q*4;mb.ix.push(a,a+1,a+2,a,a+2,a+3);}
  S.mb=mb;S.mesh=g3Mesh(mb,true);S.mesh.cnt=0;}
function r3dSkidAdd(a,b,w,col,al){const S=R3.skid,mb=S.mb,q=S.head;S.head=(S.head+1)%S.max;S.n=Math.min(S.max,S.n+1);
  const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,sx=-dz/l*w/2,sz=dx/l*w/2,st=mb.st,f=mb.f,u=mb.u,bb=mb.b;
  [[a[0]+sx,a[1],a[2]+sz],[b[0]+sx,b[1],b[2]+sz],[b[0]-sx,b[1],b[2]-sz],[a[0]-sx,a[1],a[2]-sz]].forEach((p,k)=>{const o=(q*4+k)*st,fo=o>>2;f[fo]=p[0];f[fo+1]=p[1]+0.025;f[fo+2]=p[2];bb[o+12]=0;bb[o+13]=127;bb[o+14]=0;u[o+16]=col[0];u[o+17]=col[1];u[o+18]=col[2];u[o+19]=Math.round(al*255);});
  S.dirty=true;}
function r3dPart(x,y,z,vx,vy,vz,size,grow,life,col,a){const P=R3.parts;if(P.length>650)P.shift();P.push({x,y,z,vx,vy,vz,s:size,g:grow,life,max:life,c:col,a});}
/* ---------- камера ---------- */
function r3dCamera(dt,W,H){
  const F=R.follow,v=R3.view,cm=R3.cam||(R3.cam={yaw:F.yaw,y:null,shake:0,pitch:0,fov:1});
  // курс камеры: догоняет курс машины быстро, но не отстаёт больше чем на ~7° — машина всегда видна сзади
  let dy=angWrap(F.yaw-cm.yaw);cm.yaw+=dy*Math.min(1,dt*9);dy=angWrap(F.yaw-cm.yaw);const lim=Math.abs(F.r)>1.2?0.35:0.12;if(Math.abs(dy)>lim)cm.yaw=F.yaw-Math.sign(dy)*lim;
  const fw=[Math.sin(cm.yaw),0,Math.cos(cm.yaw)],st=r3dCarState(F),cy=st.y!==null?st.y:F.y;
  cm.y=cm.y===null?cy:cm.y+(cy-cm.y)*Math.min(1,dt*6);
  const sp=Math.max(0,F.vx)/Math.max(10,F.vtop),tr=TERR[R3.T.terrAt(F.idx)]||TERR.dirt;
  cm.shake=Math.max(R.shake||0,0)*0.5+sp*0.012*(tr.rough||1);
  const sh=[(Math.random()-0.5)*cm.shake,(Math.random()-0.5)*cm.shake];
  let eye,look,near=0.3;
  if(v===2){// из кабины: глаза пилота
    const m=r3dCarMesh(F.spec3,true),e=m.eye,M=st.mat||m4(),p=[M[0]*e[0]+M[4]*e[1]+M[8]*e[2]+M[12],M[1]*e[0]+M[5]*e[1]+M[9]*e[2]+M[13],M[2]*e[0]+M[6]*e[1]+M[10]*e[2]+M[14]];
    eye=[p[0]+sh[0]*0.4,p[1]+0.14+sh[1]*0.6,p[2]];const f2=[Math.sin(F.yaw),0,Math.cos(F.yaw)];look=[eye[0]+f2[0]*25,eye[1]-0.95,eye[2]+f2[2]*25];near=0.08;}
  else if(v===3){// осмотр машины со стороны (для проверки моделей)
    const a=F.yaw+(R3.orbA||0),Dd=R3.orbD||4.6;eye=[F.x-Math.sin(a)*Dd,cm.y+(R3.orbH||1.5),F.z-Math.cos(a)*Dd];look=[F.x,cm.y+0.7,F.z];near=0.1;}
  else{const D=v===1?8.8:5.4,Hc=v===1?3.5:2.25,A=v===1?12:8,LH=v===1?0.2:0.55;
    let back=cm.y;const bi=R3.T.closed?((F.idx-Math.round(D/R3.T.step))%R3.T.n+R3.T.n)%R3.T.n:Math.max(0,F.idx-Math.round(D/R3.T.step));back=Math.max(back,R3.T.pts[bi][1]);
    // камера не уходит в склон: над землёй по пути от машины к камере; круча между ними — подъезжаем ближе и выше
    let Dd=D,ey=back+Hc;for(let k=0;k<3;k++){let need=0;for(const t of [0.45,0.75,1]){const g=fH(F.x-fw[0]*Dd*t,F.z-fw[2]*Dd*t)+1.1,ly=cm.y+(ey-cm.y)*t;need=Math.max(need,(g-ly)/t);}
      if(need<=0.02)break;if(need>2.5&&Dd>3.4)Dd*=0.8;else{ey+=need;break;}}
    cm.ey=cm.ey===undefined?ey:cm.ey+(ey-cm.ey)*Math.min(1,dt*(ey>cm.ey?14:4));cm.dd=cm.dd===undefined?Dd:cm.dd+(Dd-cm.dd)*Math.min(1,dt*6);
    eye=[F.x-fw[0]*cm.dd+sh[0],Math.max(cm.ey,ey-0.6)+sh[1],F.z-fw[2]*cm.dd];look=[F.x+fw[0]*A,cm.y+LH,F.z+fw[2]*A];}
  const f=v3n([look[0]-eye[0],look[1]-eye[1],look[2]-eye[2]]),rt=v3n(v3x([0,1,0],f)),up=v3x(f,rt);
  const asp=W/H,hf=v===2?1.1:1.05;let vf0=asp<1?2*Math.atan(Math.tan(hf/2)/asp):0.95;if(2*Math.atan(Math.tan(vf0/2)*asp)>1.75)vf0=2*Math.atan(Math.tan(0.875)/asp);cm.fov+=((1+sp*0.1)-cm.fov)*Math.min(1,dt*2);
  const vf=Math.min(1.55,vf0*cm.fov);R3.eye=eye;R3.camR=rt;R3.camU=up;R3.camF=f;
  const P=R3.P||(R3.P=m4()),V=R3.V||(R3.V=m4()),VP=R3.VP||(R3.VP=m4());m4persp(P,vf,asp,near,1500);m4view(V,eye,rt,up,f);m4mul(VP,P,V);R3.fr=frustumOf(VP,R3.fr);
}
/* ---------- кадр ---------- */
function r3dRender(dt){
  const gl=G3.gl;if(!gl||G3.lost||gl.isContextLost()){r3dFail('lost');return;}
  R3.time+=dt;const T=R3.T,F=R.follow,cv=G3.cv;
  // постройка мира: во время отсчёта — щедро, в гонке — по чуть-чуть
  const bud=R.t<0?24:5,t0=performance.now();while(R3.next<R3.order.length&&performance.now()-t0<bud)r3dBuildStep();
  // впереди нет готового куска — достроить немедленно
  const kF=Math.floor(F.idx/R3CH);for(let d=0;d<=3;d++){const k=T.closed?(kF+d)%R3.nCh:kF+d;if(k<R3.nCh&&!R3.chunks[k]){const ch=r3dChunk(k);if(ch)R3.chunks[k]=ch;}}
  r3dTilesAround(F.x,F.z,560,R.t<0?20:3);
  // размер картинки: подстраивается под скорость телефона
  R3.ftAvg=(R3.ftAvg||0.016)*0.95+Math.min(0.1,dt||0.016)*0.05;
  if(R.t>2&&R3.ftAvg>0.026&&R3.scale>0.55){R3.scale-=0.1;R3.ftAvg=0.018;}else if(R.t>2&&R3.ftAvg<0.0145&&R3.scale<1){R3.scale=Math.min(1,R3.scale+0.05);R3.ftAvg=0.017;}
  // совсем медленно даже в мелкой картинке — без теней и с меньшей дальностью
  if(R.t>2&&R3.scale<=0.56&&R3.ftAvg>0.03){R3.slow=(R3.slow||0)+dt;if(R3.slow>3&&!R3.lowQ){R3.lowQ=true;R3.ftAvg=0.018;}}else R3.slow=0;
  const dpr=Math.min(2,window.devicePixelRatio||1)*R3.scale,W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;
  const bw=Math.max(1,Math.round(W*dpr)),bh=Math.max(1,Math.round(H*dpr));if(cv.width!==bw||cv.height!==bh){cv.width=bw;cv.height=bh;}
  const E=r3dEnvNow();R3.E=E;
  R.cars.forEach(c=>r3dCarUpdate(c,dt,E));
  r3dCamera(dt,W,H);
  r3dPartsUpdate(dt);
  if(R3.peopleDirty)r3dPeopleUpload();
  {const kc=Math.floor(F.idx/R3CH);if(kc!==R3.vegK||R3.vegDirty)r3dVegUpload(kc);}
  if(R3.signsDirty){g3Free(R3.signM);R3.signM=g3Mesh(R3.signs);R3.signsDirty=false;}
  if(R3.labDirty){if(R3.texLab)gl.deleteTexture(R3.texLab);R3.texLab=g3Tex(R3.lab.cv,{cs:true,ct:true});R3.labDirty=false;}
  G3.dc=0;G3.tri=0;
  // видимые куски
  const vis=[],eye=R3.eye;for(let k=0;k<R3.nCh;k++){const ch=R3.chunks[k];if(!ch)continue;const d=Math.hypot(ch.c[0]-eye[0],ch.c[2]-eye[2])-ch.r;if(d>(R3.lowQ?420:900))continue;if(!inFrustum(R3.fr,ch.c,ch.r))continue;vis.push([d,ch]);}
  vis.sort((a,b)=>a[0]-b[0]);R3.vis=vis;
  const tiles=[];for(const key in R3.tiles){const t=R3.tiles[key];if(!t||t.skip)continue;const d=Math.hypot(t.c[0]-eye[0],t.c[2]-eye[2]);if(d>(R3.lowQ?520:1000))continue;const m=t.g;if(m&&!inFrustum(R3.fr,m.c,m.r+30))continue;tiles.push(t);}
  // тень солнца
  r3dShadowPass(E,vis);
  const PT=r3dPostOn()?r3dPostTargets(bw,bh):null;R3.post=!!PT;
  gl.bindFramebuffer(gl.FRAMEBUFFER,PT?PT.fbMS:null);gl.viewport(0,0,bw,bh);gl.clearColor(0.5,0.6,0.7,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.disable(gl.BLEND);
  // земля и обочины
  let P=r3dUse('terr',E,bw,bh);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,R3.texCM);gl.uniform1i(P.u.u_cmap,1);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,R3.texDet);gl.uniform1i(P.u.u_det,2);gl.uniform4fv(P.u.u_cm,R3.cmU);gl.uniform1f(P.u.u_rk,R3.F.mount?1:0);
  gl.uniformMatrix4fv(P.u.u_model,false,m4());gl.disable(gl.CULL_FACE);
  tiles.forEach(t=>g3Draw(t.g));gl.enable(gl.CULL_FACE);vis.forEach(([,ch])=>g3Draw(ch.gnd));
  // декорации, дальний лес
  P=r3dUse('lit',E,bw,bh);gl.uniformMatrix4fv(P.u.u_model,false,m4());gl.uniform4f(P.u.u_lamp,0,0,E.lamp,0);
  vis.forEach(([,ch])=>g3Draw(ch.lit));tiles.forEach(t=>g3Draw(t.t));if(R3.startMesh)g3Draw(R3.startMesh);if(R3.water)g3Draw(R3.water);
  // машины
  r3dDrawCars(E,bw,bh);
  // дорога и надписи
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);
  P=r3dUse('road',E,bw,bh);gl.uniformMatrix4fv(P.u.u_model,false,m4());gl.activeTexture(gl.TEXTURE1);gl.uniform1i(P.u.u_tex,1);
  vis.forEach(([,ch])=>ch.roads.forEach(r=>{if(!r.m)return;gl.bindTexture(gl.TEXTURE_2D,R3.texFor(r.key));g3Draw(r.m);}));
  gl.polygonOffset(-2,-4);
  // следы шин
  if(R3.skid.n){const S=R3.skid;if(S.dirty){gl.bindBuffer(gl.ARRAY_BUFFER,S.mesh.vb);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Uint8Array(S.mb.ab,0,S.max*4*S.mb.st));S.dirty=false;}
    P=r3dUse('decal',E,bw,bh);gl.uniformMatrix4fv(P.u.u_model,false,m4());gl.depthMask(false);S.mesh.cnt=S.n*6;g3Draw(S.mesh);gl.depthMask(true);}
  gl.disable(gl.POLYGON_OFFSET_FILL);
  if(R3.signM&&R3.texLab){P=r3dUse('tex',E,bw,bh);gl.uniformMatrix4fv(P.u.u_model,false,m4());gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,R3.texLab);gl.uniform1i(P.u.u_tex,1);g3Draw(R3.signM);}
  gl.disable(gl.BLEND);
  // небо — за всем, где ничего не нарисовано
  gl.depthMask(false);P=r3dUse('sky',E,bw,bh);const IV=R3.IV||(R3.IV=m4());m4inv(IV,R3.VP);gl.uniformMatrix4fv(P.u.u_ivp,false,IV);gl.uniform1f(P.u.u_night,E.night);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,R3.texPan);gl.uniform1i(P.u.u_pan,1);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,R3.texCld);gl.uniform1i(P.u.u_cld,2);
  gl.uniform4f(P.u.u_panR,-0.012,0.16,2,0);gl.disable(gl.CULL_FACE);gl.bindVertexArray(G3.full.vao);gl.drawArrays(gl.TRIANGLES,0,3);G3.dc++;gl.depthMask(true);
  // люди
  if(R3.pN){P=r3dUse('bill',E,bw,bh);gl.uniform3fv(P.u.u_camR,R3.camR);gl.uniform1f(P.u.u_bl,E.night>0.5?0.18:1.25-E.night*0.9);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,R3.texPeople);gl.uniform1i(P.u.u_tex,1);
    gl.disable(gl.CULL_FACE);gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);gl.bindVertexArray(R3.pI.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,6,R3.pN);G3.dc++;gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);gl.enable(gl.CULL_FACE);}
  // трава и цветы у обочины
  if(R3.vN&&!R3.lowQ){P=r3dUse('bill',E,bw,bh);gl.uniform3fv(P.u.u_camR,R3.camR);gl.uniform1f(P.u.u_bl,E.night>0.5?0.16:1.1-E.night*0.8);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,R3.texVeg);gl.uniform1i(P.u.u_tex,1);
    gl.disable(gl.CULL_FACE);gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);gl.bindVertexArray(R3.vI.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,6,R3.vN);G3.dc++;gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);gl.enable(gl.CULL_FACE);}
  // стёкла машин
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);r3dDrawCars(E,bw,bh,true);gl.depthMask(true);
  // пыль и дым
  r3dDrawParts(E,bw,bh);
  gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);
  if(PT)r3dPostRun(PT,bw,bh,E);
  R3.ready=true;
}
/* ---------- кино-обработка: кадр рисуется в свой буфер (со сглаживанием), потом — свечение, цвет, виньетка, зерно ---------- */
function r3dPostOn(){return !!(G3.postOK&&!R3.lowQ&&!(AU.on&&AU.on.post===false));}
function r3dPostFree(){const gl=G3.gl,P=G3.post;if(!P||!gl)return;[P.fbMS,P.scene.f,P.a.f,P.b.f].forEach(f=>gl.deleteFramebuffer(f));[P.cb,P.db].forEach(b=>gl.deleteRenderbuffer(b));[P.scene.t,P.a.t,P.b.t].forEach(t=>gl.deleteTexture(t));G3.post=null;}
function r3dPostTargets(bw,bh){const gl=G3.gl;let P=G3.post;if(P&&P.w===bw&&P.h===bh)return P;r3dPostFree();
  try{const ms=Math.min(4,gl.getParameter(gl.MAX_SAMPLES)||0),fbMS=gl.createFramebuffer(),cb=gl.createRenderbuffer(),db=gl.createRenderbuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbMS);gl.bindRenderbuffer(gl.RENDERBUFFER,cb);if(ms)gl.renderbufferStorageMultisample(gl.RENDERBUFFER,ms,gl.RGBA8,bw,bh);else gl.renderbufferStorage(gl.RENDERBUFFER,gl.RGBA8,bw,bh);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,cb);gl.bindRenderbuffer(gl.RENDERBUFFER,db);
    if(ms)gl.renderbufferStorageMultisample(gl.RENDERBUFFER,ms,gl.DEPTH_COMPONENT24,bw,bh);else gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,bw,bh);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,db);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('ms fb');
    const tex=(w,h)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA8,w,h);
      [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(([k,v])=>gl.texParameteri(gl.TEXTURE_2D,k,v));
      const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('tex fb');return {t,f};};
    const w4=Math.max(1,bw>>2),h4=Math.max(1,bh>>2);P={w:bw,h:bh,fbMS,cb,db,scene:tex(bw,bh),a:tex(w4,h4),b:tex(w4,h4),w4,h4};}
  catch(e){console.warn('post',e);G3.postOK=false;P=null;}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindRenderbuffer(gl.RENDERBUFFER,null);G3.post=P;return P;}
function r3dPostRun(P,bw,bh,E){const gl=G3.gl;
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER,P.fbMS);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,P.scene.f);gl.blitFramebuffer(0,0,bw,bh,0,0,bw,bh,gl.COLOR_BUFFER_BIT,gl.NEAREST);
  gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.depthMask(false);gl.bindVertexArray(G3.full.vao);gl.activeTexture(gl.TEXTURE0);
  let Q=G3.P.pBright;gl.useProgram(Q.p);gl.bindFramebuffer(gl.FRAMEBUFFER,P.a.f);gl.viewport(0,0,P.w4,P.h4);gl.bindTexture(gl.TEXTURE_2D,P.scene.t);gl.uniform1i(Q.u.u_src,0);gl.uniform2f(Q.u.u_px,1/bw,1/bh);gl.drawArrays(gl.TRIANGLES,0,3);
  Q=G3.P.pBlur;gl.useProgram(Q.p);gl.uniform1i(Q.u.u_src,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,P.b.f);gl.bindTexture(gl.TEXTURE_2D,P.a.t);gl.uniform2f(Q.u.u_dir,1/P.w4,0);gl.drawArrays(gl.TRIANGLES,0,3);
  gl.bindFramebuffer(gl.FRAMEBUFFER,P.a.f);gl.bindTexture(gl.TEXTURE_2D,P.b.t);gl.uniform2f(Q.u.u_dir,0,1/P.h4);gl.drawArrays(gl.TRIANGLES,0,3);
  Q=G3.P.pFinal;gl.useProgram(Q.p);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,bw,bh);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,P.scene.t);gl.uniform1i(Q.u.u_src,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,P.a.t);gl.uniform1i(Q.u.u_blm,1);
  const F=R.follow;gl.uniform2f(Q.u.u_res,bw,bh);gl.uniform1f(Q.u.u_time,R3.time);gl.uniform1f(Q.u.u_mb,R3.view===2?0:clamp(((F?F.vx:0)-16)/34,0,1)*0.04);
  gl.uniform1f(Q.u.u_blk,0.42+E.night*0.7);gl.uniform1f(Q.u.u_grain,0.028);gl.uniform1f(Q.u.u_vig2,0.4);gl.drawArrays(gl.TRIANGLES,0,3);G3.dc+=5;
  gl.activeTexture(gl.TEXTURE0);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);}
function r3dUse(name,E,bw,bh){const gl=G3.gl,P=G3.P[name];gl.useProgram(P.p);const u=P.u;
  gl.uniformMatrix4fv(u.u_vp,false,R3.VP);if(u.u_shm)gl.uniformMatrix4fv(u.u_shm,false,R3.SHM||m4());
  gl.uniform3fv(u.u_sun,E.sun);gl.uniform3fv(u.u_sunC,E.sunC);gl.uniform3fv(u.u_skyC,E.skyC);gl.uniform3fv(u.u_gndC,E.gndC);gl.uniform3fv(u.u_hzC,E.hzC);gl.uniform3fv(u.u_zeC,E.zeC);gl.uniform3fv(u.u_fogS,E.fogS);
  gl.uniform3fv(u.u_cam,R3.eye);gl.uniform1f(u.u_fogD,R3.lowQ?Math.max(E.fogD,0.003):E.fogD);gl.uniform1f(u.u_exp,E.exp);gl.uniform1f(u.u_time,R3.time);gl.uniform1f(u.u_vig,R3.post?0:0.35);gl.uniform2f(u.u_res,bw,bh);
  if(u.u_mat)gl.uniform4fv(u.u_mat,MPAR);
  if(u.u_sh){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G3.sh);gl.uniform1i(u.u_sh,0);gl.uniform3f(u.u_shI,1/G3.shS,R3.shOn?1:0,0);}
  if(u.u_hl){const F=R.follow;if(E.hl>0&&F){const fw=[Math.sin(F.yaw),-0.12,Math.cos(F.yaw)];gl.uniform3f(u.u_hlP,F.x+fw[0]*1.6,(r3dCarState(F).y||F.y)+0.9,F.z+fw[2]*1.6);gl.uniform3fv(u.u_hlD,v3n(fw));gl.uniform1f(u.u_hl,E.hl);}else gl.uniform1f(u.u_hl,0);}
  if(u.u_lamp)gl.uniform4f(u.u_lamp,0,E.hl,E.lamp,0);
  return P;}
/* ---------- тень солнца: квадрат 90 м вокруг машины, чуть вперёд по ходу ---------- */
function r3dShadowPass(E,vis){const gl=G3.gl;R3.shOn=!!G3.shFB&&E.sun[1]>0.15&&E.night<0.5&&!R3.lowQ;if(!R3.shOn)return;
  const F=R.follow,S=46,fw=[Math.sin(R3.cam.yaw),0,Math.cos(R3.cam.yaw)],c=[F.x+fw[0]*S*0.55,(r3dCarState(F).y||F.y),F.z+fw[2]*S*0.55],L=E.sun;
  const f=[-L[0],-L[1],-L[2]],rt=v3n(v3x([0,1,0],f)),up=v3x(f,rt);
  // привязка к клеткам тени — край не «дрожит» при движении
  const tx=2*S/G3.shS,a=c[0]*rt[0]+c[1]*rt[1]+c[2]*rt[2],b=c[0]*up[0]+c[1]*up[1]+c[2]*up[2],da=Math.round(a/tx)*tx-a,db=Math.round(b/tx)*tx-b;
  const cc=[c[0]+rt[0]*da+up[0]*db,c[1]+rt[1]*da+up[1]*db,c[2]+rt[2]*da+up[2]*db],eye=[cc[0]-f[0]*160,cc[1]-f[1]*160,cc[2]-f[2]*160];
  const V=m4(),P=m4(),M=R3.SHM||(R3.SHM=m4());m4view(V,eye,rt,up,f);m4ortho(P,-S,S,-S,S,1,320);m4mul(M,P,V);
  const fr=frustumOf(M);gl.bindFramebuffer(gl.FRAMEBUFFER,G3.shFB);gl.viewport(0,0,G3.shS,G3.shS);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2.5,6);
  let Pp=G3.P.dLit;gl.useProgram(Pp.p);gl.uniformMatrix4fv(Pp.u.u_vp,false,M);gl.uniformMatrix4fv(Pp.u.u_model,false,m4());gl.uniform1f(Pp.u.u_time,R3.time);gl.uniform4fv(Pp.u.u_mat,MPAR);
  vis.forEach(([,ch])=>{if(ch.lit&&inFrustum(fr,ch.lit.c,ch.lit.r))g3Draw(ch.lit);});
  Pp=G3.P.dCar;gl.useProgram(Pp.p);gl.uniformMatrix4fv(Pp.u.u_vp,false,M);gl.uniform4fv(Pp.u.u_mat,MPAR);
  R.cars.forEach(c=>{const st=c.v3;if(!st||!st.mat)return;if(Math.hypot(c.x-cc[0],c.z-cc[2])>S*1.5)return;const m=r3dCarMesh(c.spec3,c===R.follow||st.d<24);r3dCarUniforms(Pp,c,st,m);g3Draw(m.op);});
  gl.disable(gl.POLYGON_OFFSET_FILL);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
/* ---------- машины: положение на дороге, крен, клевок, колёса, пыль ---------- */
function r3dCarUpdate(c,dt,E){
  const st=r3dCarState(c),T=R3.T,y=surfAt(c),yc=y(c.lat),n=T.n;st.y=yc;
  // наклон по дороге (подъём и вираж)
  const t=T.T[c.idx],nn=T.N[c.idx],i2=T.closed?(c.idx+1)%n:Math.min(n-1,c.idx+1),i1=T.closed?(c.idx-1+n)%n:Math.max(0,c.idx-1);
  const sl=(T.pts[i2][1]-T.pts[i1][1])/(2*T.step),ls=(y(c.lat+0.7)-y(c.lat-0.7))/1.4;
  let up=v3n([-sl*t[0]-ls*nn[0],1,-sl*t[1]-ls*nn[1]]);const fw0=[Math.sin(c.yaw),0,Math.cos(c.yaw)],rt=v3n(v3x(up,fw0)),fw=v3x(rt,up);
  st.mat=m4basis(st.mat||m4(),rt,up,fw,[c.x,yc,c.z]);
  // кузов на рессорах: крен от бокового ускорения, клевок от торможения, дрожь от неровностей
  const v=Math.max(0,c.vx),ax=(c.vx-st.vxp)/Math.max(dt,0.001);st.vxp=c.vx;st.ax+=(clamp(ax,-12,8)-st.ax)*Math.min(1,dt*8);
  const aLat=v*c.r,tr=TERR[T.terrAt(c.idx)]||TERR.dirt,rough=(tr.rough||1)*(c.off?1.8:1);
  const tRoll=clamp(-aLat/9.81,-1.1,1.1)*0.055,tPitch=clamp(-st.ax/9.81,-1,1)*0.035,tH=(vnz(st.spin*1.3,0.5,c.num)-0.5)*0.05*rough*Math.min(1,v/12);
  const spring=(x,vv,tg,k,d)=>{const a=(tg-x)*k-vv*d;vv+=a*dt;return [x+vv*dt,vv];};
  [st.roll,st.vr]=spring(st.roll,st.vr,tRoll,90,12);[st.pitch,st.vp]=spring(st.pitch,st.vp,tPitch,110,13);[st.heave,st.vh]=spring(st.heave,st.vh,tH,260,16);
  st.spin+=c.vx*dt;
  const d=Math.hypot(c.x-R3.eye[0],c.z-R3.eye[2]);st.near=d<45;st.d=d;
  if(R.t<0)return;
  // пыль из-под колёс (сухое покрытие), дым заноса, пар перегрева
  const me=c===R.follow;if(d>160)return;const bx=c.x-fw[0]*1.2,bz=c.z-fw[2]*1.2;
  const dusty=(tr.dust||0)*(c.off?1.3:1)+(c.off&&tr!==TERR.asphalt?0.5:0);
  // своя пыль летит прямо в камеру: её меньше и она прозрачнее, иначе за машиной встаёт сплошная завеса
  if(dusty>0&&v>4){st.dust+=dt*v*dusty*(me?0.35:1.1);const dc=hex2rgb(c.off?TERR.dirt.road:tr.road),col=cMix(dc,[235,225,205],0.35);
    while(st.dust>1.2){st.dust-=1.2;const sd=Math.random()<0.5?-1:1,sp=me?1.6:0.6;r3dPart(bx-fw[0]*(me?0.5:0)+rt[0]*sd*sp,yc+0.2,bz-fw[2]*(me?0.5:0)+rt[2]*sd*sp,-fw[0]*v*0.1+rt[0]*sd*(me?1.8:0)+(Math.random()-0.5)*1.5,0.4+Math.random()*0.7,-fw[2]*v*0.1+rt[2]*sd*(me?1.8:0)+(Math.random()-0.5)*1.5,0.8,1.8+v*0.05,1.4+Math.random()*1.0,col,(me?0.16:0.26)*Math.min(1,dusty));}}
  if((c.slipR>0.15||c.spinw>0.4||(c.brk>0.8&&v>8))&&v>4){if(Math.random()<0.6)r3dPart(bx,yc+0.2,bz,(Math.random()-0.5)*2,0.6,(Math.random()-0.5)*2,0.6,2.2,1.1,[236,236,236],tr.dust?0.18:0.3);
    // следы шин
    [-1,1].forEach((sd,k)=>{const p=[c.x-fw[0]*1.0+rt[0]*sd*0.62,yc,c.z-fw[2]*1.0+rt[2]*sd*0.62],pr=st.mk[k];if(pr&&Math.hypot(p[0]-pr[0],p[2]-pr[2])>0.35){r3dSkidAdd(pr,p,0.16,tr.dust?[90,72,50]:[30,30,32],tr.dust?0.28:0.42);st.mk[k]=p;}else if(!pr)st.mk[k]=p;});}
  else st.mk[0]=st.mk[1]=null;
  if(c.dnf||c.stopT>0||c.overheat>0){if(Math.random()<0.35)r3dPart(c.x+fw[0]*1.2,yc+1.1,c.z+fw[2]*1.2,(Math.random()-0.5)*0.6,1.4+Math.random(),(Math.random()-0.5)*0.6,0.4,1.6,2,c.overheat>0?[245,245,245]:[80,80,80],0.35);}
  if(c.thr>0.8&&R.rc.y<1914&&Math.random()<0.15)r3dPart(c.x-fw[0]*1.8,yc+0.4,c.z-fw[2]*1.8,-fw[0]*1.5,0.3,-fw[2]*1.5,0.15,0.9,0.6,[110,110,110],0.25);
}
function r3dCarUniforms(P,c,st,m){const gl=G3.gl;gl.uniformMatrix4fv(P.u.u_model,false,st.mat);gl.uniform4fv(P.u.u_wc,m.wc);gl.uniform4f(P.u.u_wr,st.spin,c.delta||0,R3.view===2&&c===R.follow?1:0,0);gl.uniform4f(P.u.u_body,st.roll,st.pitch,st.heave,m.pivot);}
function r3dDrawCars(E,bw,bh,glass){const gl=G3.gl,P=r3dUse('car',E,bw,bh);
  R.cars.forEach(c=>{const st=c.v3;if(!st||!st.mat)return;if(st.d>700)return;if(!inFrustum(R3.fr,[c.x,st.y,c.z],3))return;const m=r3dCarMesh(c.spec3,c===R.follow||st.d<24);
    if(glass&&!m.gl)return;r3dCarUniforms(P,c,st,m);gl.uniform4f(P.u.u_lamp,c.brk>0.3&&c.vx>1?1:0,E.hl,0,0);g3Draw(glass?m.gl:m.op);});}
function r3dPartsUpdate(dt){const P=R3.parts;for(let i=P.length-1;i>=0;i--){const p=P[i];p.life-=dt;if(p.life<=0){P.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vx*=1-dt*0.8;p.vz*=1-dt*0.8;p.vy*=1-dt*0.5;}}
function r3dDrawParts(E,bw,bh){const P=R3.parts;if(!P.length)return;const gl=G3.gl,I=R3.partI,e=R3.eye,L=P.map(p=>[(p.x-e[0])**2+(p.z-e[2])**2,p]).sort((a,b)=>b[0]-a[0]);
  const lum=E.night>0.5?0.2:1;let n=0;const d=I.data;for(const [,p] of L){if(n>=I.max)break;const k=1-p.life/p.max,o=n*8;d[o]=p.x;d[o+1]=p.y;d[o+2]=p.z;d[o+3]=p.s+p.g*k;d[o+4]=p.c[0]/255*lum;d[o+5]=p.c[1]/255*lum;d[o+6]=p.c[2]/255*lum;d[o+7]=p.a*(1-k)*Math.min(1,k*5+0.25);n++;}
  const Pp=r3dUse('part',E,bw,bh);gl.uniform3fv(Pp.u.u_camR,R3.camR);gl.uniform3fv(Pp.u.u_camU,R3.camU);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,R3.texPuff);gl.uniform1i(Pp.u.u_tex,1);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);g3InstDraw(I,n);gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
function r3dPeopleUpload(){const P=R3.people,I=R3.pI,n=Math.min(P.length,I.max),d=I.data;
  for(let i=0;i<n;i++){const [x,y,z,s,k,anim]=P[i],o=i*12;d[o]=x;d[o+1]=y;d[o+2]=z;d[o+3]=s.w*k;d[o+4]=s.h*k;d[o+5]=s.u;d[o+6]=s.v;d[o+7]=s.du;d[o+8]=s.dv;d[o+9]=anim?1:0;d[o+10]=0.88+((i*37)%13)/60;d[o+11]=0;}
  const gl=G3.gl;gl.bindBuffer(gl.ARRAY_BUFFER,I.b);gl.bufferSubData(gl.ARRAY_BUFFER,0,d,0,n*12);R3.pN=n;R3.peopleDirty=false;}
// Отказ 3D (потерян контекст и т.п.): дальше гонка рисуется по-старому
function r3dFail(why){R3.on=false;R.gl=false;const cv=document.getElementById('rgl');if(cv)cv.hidden=true;const c2=document.getElementById('rcv');if(c2)c2.hidden=false;try{setupRender2d();}catch(_){}}
function r3dDispose(){if(!R3.on)return;const gl=G3.gl;R3.on=false;if(gl&&!gl.isContextLost()){R3.chunks.forEach(ch=>{if(!ch)return;g3Free(ch.gnd);g3Free(ch.lit);ch.roads.forEach(r=>g3Free(r.m));});
  Object.values(R3.tiles).forEach(t=>{if(t&&!t.skip){g3Free(t.g);g3Free(t.t);}});R3.carM.forEach(m=>{g3Free(m.op);g3Free(m.gl);});g3Free(R3.signM);g3Free(R3.startMesh);g3Free(R3.water);g3InstFree(R3.pI);g3InstFree(R3.vI);g3InstFree(R3.partI);g3Free(R3.skid.mesh);
  [R3.texCM,R3.texLab].forEach(t=>t&&gl.deleteTexture(t));}
  const keep=['on'];Object.keys(R3).forEach(k=>{if(!keep.includes(k))delete R3[k];});}
