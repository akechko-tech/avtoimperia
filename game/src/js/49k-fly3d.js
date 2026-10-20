/* ================= 0.37: МИР ПОЛЁТА — ОТРИСОВКА =================
   Земля — квадродерево: кусок делится на четыре, пока он ближе 2,3 своего размера к глазу (вблизи — шаг 16 м).
   Лес — деревья по карте леса в квадратах 512 м вокруг (вблизи подробнее), дальше — лесная подстилка карты.
   Кадр в два прохода по глубине: дальний (120 м – 90 км) и ближний (до 400 м) — без мерцания берега вдали. */
const FWR={VP:null,eye:[0,0,0],SHM:null,shOn:false,t:0,post:false};
const FW_K=1.9;
const fwKey=(L,i,j)=>(L<<16)|(i<<8)|j;
/* ---------- куски земли ---------- */
function fwNodeBuild(L,i,j){const s=FW_ROOT/(1<<L),x0=-FW_ROOT/2+i*s,z0=-FW_ROOT/2+j*s,N=FW_N,d=s/N,S=FW.S,M=N+3;
  const H=new Float32Array(M*M);let hmin=1e9,hmax=-1e9;
  for(let b=0;b<M;b++)for(let a=0;a<M;a++){const h=fwHgt(S,x0+(a-1)*d,z0+(b-1)*d);H[b*M+a]=h;if(a>0&&b>0&&a<M-1&&b<M-1){if(h<hmin)hmin=h;if(h>hmax)hmax=h;}}
  const mb=new MB();mb.grow((N+1)*(N+1)+4*(N+1)+8);const sea=FW.sea,c=[0,0,0];
  for(let b=0;b<=N;b++)for(let a=0;a<=N;a++){const q=(b+1)*M+a+1,h=H[q],nx=-(H[q+1]-H[q-1])/(2*d),nz=-(H[q+M]-H[q-M])/(2*d);
    const xx=x0+a*d,zz=z0+b*d;c[2]=sea&&h>-1&&h<3.4&&!S.fields.some(f=>!f.sea&&Math.abs(xx-f.x)<f.r+60&&Math.abs(zz-f.z)<f.r+60)?Math.round(255*sstep(3.4,1.1,h)):0;mb.v(xx,h,zz,nx,1,nz,c,0);}
  const W=N+1;for(let b=0;b<N;b++)for(let a=0;a<N;a++){const k=b*W+a;if((a+b)&1){mb.tri(k,k+W,k+1);mb.tri(k+1,k+W,k+W+1);}else{mb.tri(k,k+W+1,k+1);mb.tri(k,k+W,k+W+1);}}
  const drop=d*0.6+4,edge=list=>{const i0=mb.n;for(const k of list){const o=k*mb.st,fo=o>>2;mb.v(mb.f[fo],mb.f[fo+1]-drop,mb.f[fo+2],mb.b[o+12],mb.b[o+13],mb.b[o+14],[mb.u[o+16],mb.u[o+17],mb.u[o+18]],mb.u[o+19]);}
    for(let t=0;t<list.length-1;t++){mb.tri(list[t],list[t+1],i0+t+1);mb.tri(list[t],i0+t+1,i0+t);}};
  const A=[],B=[],Cl=[],D=[];for(let a=0;a<=N;a++){A.push(a);B.push(N*W+a);}for(let b=0;b<=N;b++){Cl.push(b*W);D.push(b*W+N);}[A,B,Cl,D].forEach(edge);
  const m=g3Mesh(mb),Mn=FW.mapN,near=x0>=Mn.x0&&z0>=Mn.z0&&x0+s<=Mn.x1&&z0+s<=Mn.z1;
  return {m,L,i,j,s,x0,z0,hmin,hmax,near,used:FW.frame};}
function fwQueue(L,i,j,d){const k=fwKey(L,i,j);const q=FW.queue.get(k);if(q===undefined||d<q)FW.queue.set(k,d);}
function fwBuildSome(ms){const t0=performance.now();if(!FW.queue.size)return 0;let n=0;
  const L=[...FW.queue.entries()].sort((a,b)=>a[1]-b[1]);for(const [k] of L){if(performance.now()-t0>ms&&n>0)break;FW.queue.delete(k);if(FW.nodes.has(k))continue;
    FW.nodes.set(k,fwNodeBuild(k>>16,(k>>8)&255,k&255));n++;}return n;}
function fwSelect(eye,planes){const out=[];FW.frame++;const Lmax=FW.Lmax;
  const rec=(L,i,j,hm0,hx0)=>{const k=fwKey(L,i,j),nd=FW.nodes.get(k),s=FW_ROOT/(1<<L),x0=-FW_ROOT/2+i*s,z0=-FW_ROOT/2+j*s,hm=nd?nd.hmin:hm0,hx=nd?nd.hmax:hx0;
    const cy=(hm+hx)/2,r=Math.hypot(s*0.7072,(hx-hm)/2+6);if(!inFrustum(planes,[x0+s/2,cy,z0+s/2],r))return;if(nd)nd.used=FW.frame;
    const dx=Math.max(x0-eye[0],0,eye[0]-x0-s),dz=Math.max(z0-eye[2],0,eye[2]-z0-s),dy=Math.max(hm-eye[1],0,eye[1]-hx),dist=Math.hypot(dx,dy,dz);
    if(L<Lmax&&dist<s*FW_K){let all=true;for(let q=0;q<4;q++){const ii=i*2+(q&1),jj=j*2+(q>>1);if(!FW.nodes.has(fwKey(L+1,ii,jj))){all=false;fwQueue(L+1,ii,jj,dist);}}
      if(all||!nd){for(let q=0;q<4;q++)rec(L+1,i*2+(q&1),j*2+(q>>1),hm,hx);if(all)return;}}
    if(nd)out.push([dist,nd]);else fwQueue(L,i,j,dist);};
  rec(0,0,0,FW.S.hlo||-50,FW.S.hhi||3500);
  // старые куски — долой (крупные держим всегда)
  if(FW.frame%90===0&&FW.nodes.size>420){for(const [k,n] of FW.nodes){if(n.L>=3&&n.used<FW.frame-240){g3Free(n.m);FW.nodes.delete(k);}}}
  return out;}
/* ---------- деревья: квадраты 512 м по карте леса, у дорог — аллеи ---------- */
function fwTreeP(k,lod){return proto('fwtree|'+k+'|'+lod,(mb,r)=>{const R5=()=>0.5;
  const G=['#4a6e34','#557a3a','#43652f'],sway=lod?0.3:0;
  if(k==='con'){pTrunk(mb,0,0,0,0,3,0,0.35,0.25,'#4a3626',5);const n=lod?3:1;for(let i=0;i<n;i++)pCone(mb,0,2+i*4.5,0,3.6-i*0.9,7-i*0.8,['#2f5d3c','#2a5436','#335f3e'][i%3],lod?8:6,0,undefined,sway);}
  else if(k==='pop'){pTrunk(mb,0,0,0,0,4,0,0.35,0.25,'#5d4a36',5);pBlob(mb,0,11,0,2.2,8,2.2,'#3e6a31',R5,lod?1:0,undefined,sway);}
  else if(k==='cyp'){pTrunk(mb,0,0,0,0,1.5,0,0.2,0.15,'#4a3a28',4);pBlob(mb,0,7,0,1.4,6.5,1.4,'#2e4c2f',R5,lod?1:0,undefined,sway);}
  else if(k==='oli'){pTrunk(mb,0,0,0,0,2,0,0.35,0.25,'#6a5c4a',5);pBlob(mb,0,3.2,0,3.2,1.8,3.2,'#7b8a62',R5,lod?1:0,undefined,sway);}
  else if(k==='bir'){pTrunk(mb,0,0,0,0,9,0,0.22,0.12,'#e2e0d8',5);for(let i=0;i<(lod?3:1);i++)pBlob(mb,(r()-0.5)*1.6,8+i*1.6,(r()-0.5)*1.6,2.4,3,2.4,['#79a24b','#83a852'][i%2],R5,lod?1:0,undefined,sway);}
  else{pTrunk(mb,0,0,0,0,5,0,0.45,0.3,'#5f4a36',5);const n=lod?3:1;for(let i=0;i<n;i++)pBlob(mb,n>1?(r()-0.5)*4:0,9+r()*2,n>1?(r()-0.5)*4:0,n>1?3.4:4.6,n>1?2.8:3.8,n>1?3.4:4.6,G[i%3],R5,lod?1:0,undefined,sway);}});}
function fwTreeTile(i,j,lod){const s=512,x0=-FW_ROOT/2+i*s,z0=-FW_ROOT/2+j*s,S=FW.S,M=FW.mapN,rnd=mulberry32((i*7919+j*104729+S.seed)>>>0),mb=new MB(),sp=lod?19:24;let n=0;
  const st=(x)=>S.bio==='strait'&&x>0?S.stB:S.st,fo=(x,z)=>{if(M&&x>M.x0&&z>M.z0&&x<M.x1&&z<M.z1){const k=Math.floor((x-M.x0)*M.kx),jj=Math.floor((z-M.z0)*M.kz);return M.B[(jj*M.SZ+k)*4+2]/255;}return fwForest(S,x,z);};
  const put=(x,z,k,sc)=>{const h=fwHgt(S,x,z);if(h<1)return;mb.add(fwTreeP(k,lod),X3(rnd()*6.28,sc,[x,h-0.3,z]));n++;};
  for(let z=z0+sp/2;z<z0+s&&n<700;z+=sp)for(let x=x0+sp/2;x<x0+s&&n<700;x+=sp){const xx=x+(rnd()-0.5)*sp*0.8,zz=z+(rnd()-0.5)*sp*0.8,f=fo(xx,zz);
    if(f>0.2&&rnd()<Math.pow(f,1.3)*0.92){const T=st(xx).tr;put(xx,zz,T[Math.floor(rnd()*T.length)],(0.8+rnd()*0.45)*(f>0.6?1.25:1));}
    else if(f<0.05&&rnd()<0.006){const h=fwHgt(S,xx,zz);if(h>1.5&&fwSurf(xx,zz)==='grass'&&!S.fields.some(a=>Math.hypot(xx-a.x,zz-a.z)<a.r+40)&&!(S.clear&&S.clear.length&&fwClear(S,xx,zz)))put(xx,zz,st(xx).tr[0],0.9+rnd()*0.3);}}
  // аллеи вдоль дорог (во Франции — тополя и платаны)
  for(const r of S.roads){if(!r.trees)continue;for(let q=0;q<r.p.length-1;q++){const a=r.p[q],b=r.p[q+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(Math.max(a[0],b[0])<x0-20||Math.min(a[0],b[0])>x0+s+20||Math.max(a[1],b[1])<z0-20||Math.min(a[1],b[1])>z0+s+20)continue;
    const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;for(let t=0;t<L;t+=14){const x=a[0]+ux*t,z=a[1]+uz*t;if(x<x0||x>=x0+s||z<z0||z>=z0+s)continue;if(S.towns.some(tw=>Math.hypot(x-tw.x,z-tw.z)<tw.r))continue;
      if(S.clear&&S.clear.length&&fwClear(S,x,z))continue;for(const sd of [-1,1])put(x-uz*sd*7,z+ux*sd*7,'pop',0.85+rnd()*0.2);}}}
  const g=g3Mesh(mb);return {m:g,lod,n};}
function fwTrees(eye,planes){const out=[],R=gq().trees>=1&&!FWR.lowQ?2100:1300,s=512,i0=Math.floor((eye[0]-R+FW_ROOT/2)/s),i1=Math.floor((eye[0]+R+FW_ROOT/2)/s),j0=Math.floor((eye[2]-R+FW_ROOT/2)/s),j1=Math.floor((eye[2]+R+FW_ROOT/2)/s);
  if(eye[1]-Math.max(0,fwHgt(FW.S,eye[0],eye[2]))>2500)return out;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=-FW_ROOT/2+(i+0.5)*s,cz=-FW_ROOT/2+(j+0.5)*s,d=Math.hypot(cx-eye[0],cz-eye[2]);if(d>R)continue;
    const gy=fwHgt(FW.S,cx,cz);if(!inFrustum(planes,[cx,gy+10,cz],s*0.75))continue;const want=d<700?1:0,k=(i<<12)|j;let T=FW.tiles.get(k);
    if(!T||T.lod!==want){if(FW.tq.length<64&&!FW.tq.some(q=>q[0]===k&&q[3]===want))FW.tq.push([k,i,j,want,d]);}
    if(T&&T.m){T.used=FW.frame;out.push([d,T]);}}
  if(FW.frame%120===0&&FW.tiles.size>140)for(const [k,T] of FW.tiles)if(T.used<FW.frame-300){g3Free(T.m);FW.tiles.delete(k);}
  return out;}
function fwTreesBuild(ms){const t0=performance.now();FW.tq.sort((a,b)=>a[4]-b[4]);while(FW.tq.length&&(performance.now()-t0<ms)){const [k,i,j,lod]=FW.tq.shift();const old=FW.tiles.get(k);if(old&&old.lod===lod)continue;const T=fwTreeTile(i,j,lod);T.used=FW.frame;if(old)g3Free(old.m);FW.tiles.set(k,T);}}
/* ---------- море и облака ---------- */
function fwWater(){if(FW.water)return FW.water;const mb=new MB(),c=hex2rgb(FW.S.bio==='lake'||FW.S.river&&FW.S.bio==='plain'?'#2a5a62':'#1f5a78'),N=12,Q=4000;
  for(let a=0;a<N;a++)for(let b=0;b<N;b++){const x0=(a-N/2)*Q,z0=(b-N/2)*Q;mb.poly([[x0,0,z0],[x0+Q,0,z0],[x0+Q,0,z0+Q],[x0,0,z0+Q]],[0,1,0],c,MID.water);}return FW.water=g3Mesh(mb);}
function fwClouds(mood){const rnd=mulberry32(FW.S.seed+91),L=[];const nC={clear:6,cloudy:46,overcast:0,morning:10,evening:28}[mood]||12;
  for(let c=0;c<nC;c++){const x=(rnd()-0.5)*36000,z=(rnd()-0.5)*36000,y=1100+rnd()*900,sz=180+rnd()*260,n=6+Math.floor(rnd()*9);
    for(let k=0;k<n;k++)L.push({x:x+(rnd()-0.5)*sz*2.6,y:y+rnd()*sz*0.7,z:z+(rnd()-0.5)*sz*2,s:sz*(0.8+rnd()*0.7),g:0.86+rnd()*0.14,a:0.55+rnd()*0.3});}
  if(mood==='overcast')for(let k=0;k<360;k++)L.push({x:(rnd()-0.5)*30000,y:820+rnd()*160,z:(rnd()-0.5)*30000,s:900+rnd()*700,g:0.72+rnd()*0.1,a:0.5+rnd()*0.25});
  if(mood==='morning')for(let k=0;k<60;k++)L.push({x:(rnd()-0.5)*16000,y:40+rnd()*60,z:(rnd()-0.5)*16000,s:300+rnd()*300,g:0.95,a:0.18});
  return L;}
/* ---------- свет: по фото неба, туман для полёта (видно на десятки километров) ---------- */
function fwEnv(mood,az){const S=TX.D&&TX.D.sky&&TX.D.sky[mood]||{sun:[0,35],hz:[0.75,0.8,0.86],ze:[0.35,0.5,0.75]};
  const el=clamp(S.sun[1],8,60)*Math.PI/180,sun=v3n([Math.cos(el)*Math.sin(az),Math.sin(el),Math.cos(el)*Math.cos(az)]);
  const L=v=>v.map(x=>Math.pow(clamp(x,0,1),2.2)),hz=L(S.hz),ze=L(S.ze),mix3=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
  const P={clear:{sun:[2.1,1.95,1.7],amb:0.62,exp:0.95,fog:0.000085},cloudy:{sun:[1.8,1.72,1.58],amb:0.72,exp:1,fog:0.0001},overcast:{sun:[0.5,0.51,0.53],amb:1.25,exp:1.3,fog:0.00017},
    morning:{sun:[1.8,1.55,1.2],amb:0.7,exp:1.02,fog:0.00022},evening:{sun:[1.9,1.25,0.74],amb:0.66,exp:1.06,fog:0.00012}}[mood]||{sun:[2,1.9,1.7],amb:0.65,exp:1,fog:0.0001};
  const kE=0.78,gr=lin('#6e8a50');
  return {sun,sunC:P.sun,skyC:mul(mix3(ze,hz,0.45),kE*P.amb),gndC:mix3(mul(gr,0.3),[0.07,0.065,0.055],0.5),hzC:mul(hz,kE),zeC:mul(ze,kE),
    fogS:mood==='evening'?[1.25,0.75,0.42]:mood==='morning'?[1.1,0.96,0.8]:mul(mix3(hz,[1,0.95,0.85],0.3),kE*1.1),fogD:P.fog,exp:P.exp,night:0,hl:0,lamp:0,envRot:((S.sun[0]||0)/360-az/6.2832+10)%1,envK:kE};}
/* ---------- шейдерные переменные ---------- */
function fwUse(name,bw,bh){const gl=G3.gl,P=G3.P[name],u=P.u,E=FWR.E;gl.useProgram(P.p);
  gl.uniformMatrix4fv(u.u_vp,false,FWR.VP);if(u.u_shm)gl.uniformMatrix4fv(u.u_shm,false,FWR.SHM||m4());
  gl.uniform3fv(u.u_sun,E.sun);gl.uniform3fv(u.u_sunC,E.sunC);gl.uniform3fv(u.u_skyC,E.skyC);gl.uniform3fv(u.u_gndC,E.gndC);gl.uniform3fv(u.u_hzC,E.hzC);gl.uniform3fv(u.u_zeC,E.zeC);gl.uniform3fv(u.u_fogS,E.fogS);
  gl.uniform3fv(u.u_cam,FWR.eye);gl.uniform1f(u.u_fogD,E.fogD);gl.uniform1f(u.u_exp,E.exp);gl.uniform1f(u.u_time,FWR.t);gl.uniform1f(u.u_vig,FWR.post?0:0.3);gl.uniform2f(u.u_res,bw,bh);
  if(u.u_mat)gl.uniform4fv(u.u_mat,MPAR);
  if(u.u_sh){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G3.sh);gl.uniform1i(u.u_sh,0);gl.uniform3f(u.u_shI,1/G3.shS,FWR.shOn?1:0,0);}
  if(u.u_hl)gl.uniform1f(u.u_hl,0);if(u.u_lamp)gl.uniform4f(u.u_lamp,0,0,0,0);if(u.u_dark)gl.uniform1f(u.u_dark,0);
  if(u.u_envR)gl.uniform4f(u.u_envR,E.envRot||0,E.envK===undefined?0.78:E.envK,FWR.sky?FWR.sky.lv-1:0,FWR.sky?1:0);
  if(u.u_envR2)gl.uniform4f(u.u_envR2,0,0,0,0);
  if(u.u_lay){const tx=G3.cache.tx;if(tx){gl.uniform4fv(u.u_lay,tx.lay);gl.uniform4fv(u.u_lavg,tx.avg);}}
  if(u.u_tq)gl.uniform4f(u.u_tq,gq().nrm&&!FWR.lowQ?1:0,0,1,1);
  return P;}
/* ---------- частицы: дым, пыль, разрывы зенитных снарядов, брызги, трассеры ---------- */
function fwPart(x,y,z,vx,vy,vz,size,grow,life,col,a,gv){const P=FW.parts;if(P.length>900)P.shift();P.push({x,y,z,vx,vy,vz,s:size,g:grow,life,max:life,c:col,a,gv:gv||0});}
function fwPartsTick(dt){const P=FW.parts;for(let i=P.length-1;i>=0;i--){const p=P[i];p.life-=dt;if(p.life<=0){P.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=p.gv*dt;const dr=Math.exp(-dt*0.6);p.vx*=dr;p.vz*=dr;}}
function fwPuffDraw(L,bw,bh,cam,I){if(!L.length)return;const gl=G3.gl,e=FWR.eye,d=I.data;let n=0;
  const S=L.map(p=>[(p.x-e[0])**2+(p.y-e[1])**2+(p.z-e[2])**2,p]).sort((a,b)=>b[0]-a[0]);
  for(const [dd,p] of S){if(n>=I.max)break;const o=n*8;if(p.life!==undefined){const k=1-p.life/p.max,sz=p.s+p.g*k,near=Math.min(1,Math.max(0,(Math.sqrt(dd)-sz*0.8)/(sz*1.6+6)));d[o]=p.x;d[o+1]=p.y;d[o+2]=p.z;d[o+3]=sz;d[o+4]=p.c[0]/255;d[o+5]=p.c[1]/255;d[o+6]=p.c[2]/255;d[o+7]=(p.a<0?p.a*(1-k):p.a*(1-k)*Math.min(1,k*6+0.25))*near;}
    else{d[o]=p.x;d[o+1]=p.y;d[o+2]=p.z;d[o+3]=p.s;d[o+4]=d[o+5]=d[o+6]=p.g;d[o+7]=p.a;}n++;}
  const P=fwUse('part',bw,bh);gl.uniform3fv(P.u.u_camR,cam.rt);gl.uniform3fv(P.u.u_camU,cam.up);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,G3.cache.puff||(G3.cache.puff=g3Tex(r3dPuff(),{cs:true,ct:true})));gl.uniform1i(P.u.u_tex,1);gl.activeTexture(gl.TEXTURE0);
  gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);g3InstDraw(I,n);gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
/* ---------- аэропланы: корпус, винт (лопасти или размытый диск), летчик (в кабине — не рисуем) ---------- */
function fwDrawCraft(P,it,glass){const gl=G3.gl,m=it.mesh;if(!glass){gl.uniformMatrix4fv(P.u.u_model,false,it.M);g3Draw(m.op);if(!it.cock&&m.pil)g3Draw(m.pil);
    const tmp=FWR.tmp||(FWR.tmp=m4());m.props.forEach((pp,k)=>{const sp=it.rpm||0;if(sp>0.55)return;air3dPropMat(tmp,it.M,pp,(it.pa||0)*(pp.dir||1)+k);gl.uniformMatrix4fv(P.u.u_model,false,tmp);g3Draw(m.pr);});return;}
  if((it.rpm||0)<=0.3||!m.disc)return;const tmp=FWR.tmp||(FWR.tmp=m4());m.props.forEach(pp=>{air3dPropMat(tmp,it.M,pp,0);gl.uniformMatrix4fv(P.u.u_model,false,tmp);g3Draw(m.disc);});}
/* ---------- кадр ---------- */
function fwRender(cam,items,dt){const gl=G3.gl;if(!gl||G3.lost||gl.isContextLost())throw new Error('lost');FWR.t+=dt;FW.frame=FW.frame||0;
  const cv=G3.cv,W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;const Q=gq(),dpr=Math.min(Q.dpr,window.devicePixelRatio||1)*(FWR.scale||1),bw=Math.max(1,Math.round(W*dpr)),bh=Math.max(1,Math.round(H*dpr));
  if(cv.width!==bw||cv.height!==bh){cv.width=bw;cv.height=bh;}
  if(FW.signsDirty){if(FW.signM)g3Free(FW.signM);FW.signM=g3Mesh(FW.signs);FW.signsDirty=false;}if(FW.labDirty&&FW.lab){if(FW.texLab)gl.deleteTexture(FW.texLab);FW.texLab=g3Tex(FW.lab.cv,{cs:true,ct:true});FW.labDirty=false;}
  const E=FWR.E,eye=cam.eye;FWR.eye=eye;texBind(FWR.sky);gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,G3.dum2);gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,G3.dum2);gl.activeTexture(gl.TEXTURE0);
  const asp=bw/bh,vf=cam.fov,agl=eye[1]-Math.max(0,fwHgt(FW.S,eye[0],eye[2]));
  const V=FWR.V||(FWR.V=m4()),Pf=FWR.Pf||(FWR.Pf=m4()),Pn=FWR.Pn||(FWR.Pn=m4()),VPf=FWR.VPf||(FWR.VPf=m4()),VPn=FWR.VPn||(FWR.VPn=m4());
  m4view(V,eye,cam.rt,cam.up,cam.fw);const nearF=clamp(agl*0.6,20,120),farN=nearF*3.2;m4persp(Pf,vf,asp,nearF,95000);m4mul(VPf,Pf,V);m4persp(Pn,vf,asp,cam.near||0.3,farN);m4mul(VPn,Pn,V);
  const frF=frustumOf(VPf,FWR.frF),frN=frustumOf(VPn,FWR.frN);FWR.frF=frF;FWR.frN=frN;
  // постройка земли и леса — понемногу каждый кадр
  fwBuildSome(FW.loading?40:5);const nodes=fwSelect(eye,frF);fwTreesBuild(FW.loading?20:3);const trees=fwTrees(eye,frF);
  // тень солнца: свой аэроплан у земли (взлёт, посадка) и постройки рядом
  FWR.shOn=false;const me=items.find(i=>i.me);
  if(G3.shFB&&E.sun[1]>0.12&&me&&!FWR.lowQ){const p=me.p,gy=Math.max(0,fwHgt(FW.S,p[0],p[2])),h=p[1]-gy;if(h<180){FWR.shOn=true;const L=E.sun,t=h/Math.max(0.15,L[1]),c=[p[0]-L[0]*t,gy,p[2]-L[2]*t],S=Math.max(28,me.mesh.span*1.6);
    const f=[-L[0],-L[1],-L[2]],rt=v3n(v3x([0,1,0],f)),up=v3x(f,rt),se=[c[0]-f[0]*(h+120),c[1]-f[1]*(h+120),c[2]-f[2]*(h+120)],SV=m4(),SP=m4(),M=FWR.SHM||(FWR.SHM=m4());
    m4view(SV,se,rt,up,f);m4ortho(SP,-S,S,-S,S,1,h/Math.max(0.15,L[1])+260);m4mul(M,SP,SV);
    gl.bindFramebuffer(gl.FRAMEBUFFER,G3.shFB);gl.viewport(0,0,G3.shS,G3.shS);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2.5,6);
    const Pd=G3.P.dLit;gl.useProgram(Pd.p);gl.uniformMatrix4fv(Pd.u.u_vp,false,M);gl.uniform1f(Pd.u.u_time,FWR.t);gl.uniform4fv(Pd.u.u_mat,MPAR);gl.uniformMatrix4fv(Pd.u.u_model,false,m4());
    FW.objs.forEach(o=>{if(o.all||Math.hypot(o.c[0]-c[0],o.c[2]-c[2])<o.r+S*1.5)g3Draw(o.m);});
    items.forEach(it=>{if(Math.hypot(it.p[0]-c[0],it.p[2]-c[2])>S*2)return;gl.uniformMatrix4fv(Pd.u.u_model,false,it.M);g3Draw(it.mesh.op);if(it.mesh.pil)g3Draw(it.mesh.pil);});
    gl.disable(gl.POLYGON_OFFSET_FILL);}}
  const PT=FWR.postOn?r3dPostTargets(bw,bh):null;FWR.post=!!PT;
  gl.bindFramebuffer(gl.FRAMEBUFFER,PT?PT.fbMS:null);gl.viewport(0,0,bw,bh);gl.clearColor(0.6,0.68,0.76,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);G3.dc=0;G3.tri=0;
  const tiles=nodes,dEye=o=>Math.hypot(o.c[0]-eye[0],o.c[1]-eye[1],o.c[2]-eye[2]);
  const pass=(far)=>{FWR.VP=far?VPf:VPn;const fr=far?frF:frN,lim=far?Infinity:farN+60;
    // аэропланы
    gl.disable(gl.CULL_FACE);let P=fwUse('lit',bw,bh);
    for(const it of items){const d=Math.hypot(it.p[0]-eye[0],it.p[1]-eye[1],it.p[2]-eye[2]);if(far?d+it.mesh.r<nearF*0.9:d-it.mesh.r>lim)continue;if(!inFrustum(fr,it.p,it.mesh.r+2))continue;fwDrawCraft(P,it,false);}
    // постройки и лес
    gl.uniformMatrix4fv(P.u.u_model,false,m4());
    for(const o of FW.objs){const d=dEye(o);if(!o.all&&(far?d+o.r<nearF*0.9:d-o.r>lim))continue;if(!o.all&&!inFrustum(fr,o.c,o.r))continue;g3Draw(o.m);}
    for(const [d,T] of trees){if(!far&&d>lim+400)continue;g3Draw(T.m);}
    // 0.39: щиты с объявлениями и ленты рекламного шара — текст из атласа надписей
    if(FW.signM&&FW.texLab){const Pt=fwUse('tex',bw,bh);gl.uniformMatrix4fv(Pt.u.u_model,false,m4());gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,FW.texLab);gl.uniform1i(Pt.u.u_tex,1);gl.activeTexture(gl.TEXTURE0);g3Draw(FW.signM);}
    // земля: подробная карта — рядом, грубая — вдали
    P=fwUse('terr',bw,bh);gl.uniform4fv(P.u.u_tl,FW.lays.tl);gl.uniform4fv(P.u.u_tl2,FW.lays.tl2);gl.uniform4fv(P.u.u_tp,FW.lays.tp);gl.uniformMatrix4fv(P.u.u_model,false,m4());
    for(const grp of [true,false]){const Mp=grp?FW.mapN:FW.mapF;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,Mp.texA);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,Mp.texB);gl.activeTexture(gl.TEXTURE0);gl.uniform4fv(P.u.u_cm,Mp.u);
      for(const [d,n] of tiles){if(n.near!==grp)continue;if(!far&&d>lim)continue;g3Draw(n.m);}}
    if(FW.sea){P=fwUse('lit',bw,bh);const Q=4000,M=FWR.wM||(FWR.wM=m4());M[12]=Math.round(eye[0]/Q)*Q;M[14]=Math.round(eye[2]/Q)*Q;gl.uniformMatrix4fv(P.u.u_model,false,M);g3Draw(fwWater());}};
  pass(true);
  // небо — за всем
  gl.depthMask(false);let P=fwUse('sky',bw,bh);const IV=FWR.IV||(FWR.IV=m4());m4inv(IV,VPf);gl.uniformMatrix4fv(P.u.u_ivp,false,IV);gl.uniform1f(P.u.u_night,0);gl.uniform4f(P.u.u_panR,0,1,1,0);
  gl.bindVertexArray(G3.full.vao);gl.drawArrays(gl.TRIANGLES,0,3);G3.dc++;gl.depthMask(true);
  // облака и дальний дым
  gl.enable(gl.BLEND);FWR.VP=VPf;const far=[],near=[];for(const p of FW.parts){((p.x-eye[0])**2+(p.y-eye[1])**2+(p.z-eye[2])**2<farN*farN*0.8?near:far).push(p);}
  fwPuffDraw(FW.clouds.concat(far,typeof wxPuffs==='function'&&FL.wx?wxPuffs(cam):[]),bw,bh,cam,FW.cI);gl.disable(gl.BLEND);/* 0.39: грозовые столбы, завесы дождя, стаи птиц, молнии */
  // ближний проход: кабина, свой аэроплан, земля под колёсами
  gl.clear(gl.DEPTH_BUFFER_BIT);pass(false);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);
  for(const vp of [VPf,VPn]){FWR.VP=vp;P=fwUse('decal',bw,bh);for(const it of items){const d=Math.hypot(it.p[0]-eye[0],it.p[1]-eye[1],it.p[2]-eye[2]);if(vp===VPn?d>farN:d<farN*0.9)continue;fwDrawCraft(P,it,true);}}
  gl.depthMask(true);FWR.VP=VPn;if(near.length)fwPuffDraw(near,bw,bh,cam,FW.pI);
  gl.disable(gl.BLEND);
  if(PT)fwPostRun(PT,bw,bh,E,cam);
  FWR.VP=VPf;}
function fwPostRun(P,bw,bh,E,cam){const gl=G3.gl;
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER,P.fbMS);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,P.scene.f);gl.blitFramebuffer(0,0,bw,bh,0,0,bw,bh,gl.COLOR_BUFFER_BIT,gl.NEAREST);
  gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.depthMask(false);gl.bindVertexArray(G3.full.vao);gl.activeTexture(gl.TEXTURE0);
  let Q=G3.P.pBright;gl.useProgram(Q.p);gl.bindFramebuffer(gl.FRAMEBUFFER,P.a.f);gl.viewport(0,0,P.w4,P.h4);gl.bindTexture(gl.TEXTURE_2D,P.scene.t);gl.uniform1i(Q.u.u_src,0);gl.uniform2f(Q.u.u_px,1/bw,1/bh);gl.drawArrays(gl.TRIANGLES,0,3);
  Q=G3.P.pBlur;gl.useProgram(Q.p);gl.uniform1i(Q.u.u_src,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,P.b.f);gl.bindTexture(gl.TEXTURE_2D,P.a.t);gl.uniform2f(Q.u.u_dir,1/P.w4,0);gl.drawArrays(gl.TRIANGLES,0,3);
  gl.bindFramebuffer(gl.FRAMEBUFFER,P.a.f);gl.bindTexture(gl.TEXTURE_2D,P.b.t);gl.uniform2f(Q.u.u_dir,0,1/P.h4);gl.drawArrays(gl.TRIANGLES,0,3);
  Q=G3.P.pFinal;gl.useProgram(Q.p);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,bw,bh);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,P.scene.t);gl.uniform1i(Q.u.u_src,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,P.a.t);gl.uniform1i(Q.u.u_blm,1);
  gl.uniform2f(Q.u.u_res,bw,bh);gl.uniform1f(Q.u.u_time,FWR.t);gl.uniform1f(Q.u.u_mb,cam.mb||0);gl.uniform1f(Q.u.u_blk,0.32);gl.uniform1f(Q.u.u_grain,FW.y<1915?0.03:0.02);gl.uniform1f(Q.u.u_vig2,cam.cock?0.5:0.34);
  let fl=[0,0,0,0];if(gq().flare){const s=E.sun,e=FWR.eye,p=[e[0]+s[0]*1000,e[1]+s[1]*1000,e[2]+s[2]*1000],M=FWR.VPf,cw=M[3]*p[0]+M[7]*p[1]+M[11]*p[2]+M[15];
    if(cw>0){const x=(M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+M[12])/cw,y=(M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+M[13])/cw;if(Math.abs(x)<1.1&&Math.abs(y)<1.1)fl=[x*0.5+0.5,y*0.5+0.5,1-Math.max(Math.abs(x),Math.abs(y))*0.8,0];}}
  gl.uniform4fv(Q.u.u_flare,fl);gl.uniform1f(Q.u.u_rain,0);gl.drawArrays(gl.TRIANGLES,0,3);G3.dc+=5;
  gl.activeTexture(gl.TEXTURE0);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);}
/* ---------- подготовка: текстуры карт, слои земли, первые куски, облака; освобождение ---------- */
function fwPrepare(mood){const S=FW.S,gl=G3.gl;
  for(const M of [FW.mapN,FW.mapF]){M.texA=g3TexBytes(M.SZ,M.A);M.texB=g3TexBytes(M.SZ,M.B);}FW.mapF.A=null;FW.mapF.B=null;FW.mapN.A=null;
  const Li=k=>Math.max(0,texLi(k)),dry=S.st.dry>0.4,snow=S.bio==='mount';
  FW.lays={tl:[Li(dry?'meadow_dry':'meadow'),Li(dry?'dry_grass':'meadow_dry'),Li(S.bio==='front'&&texLi('mud')>=0?'mud':'dirt'),Li(texLi('cliff')>=0?'cliff':'rock')],tl2:[Li('sand'),Li('forest'),Li('grass'),0],tp:[snow?2300:1e5,140,snow?1:0.35,0]};
  let lo=1e9,hi=-1e9;for(let i=0;i<40;i++)for(let j=0;j<40;j++){const h=fwHgt(S,(i-20)*1500,(j-20)*1500);lo=Math.min(lo,h);hi=Math.max(hi,h);}S.hlo=lo-30;S.hhi=hi+300;
  FW.Lmax=gfxQ()==='eco'?7:FW_LMAX;FW.nodes.set(fwKey(0,0,0),fwNodeBuild(0,0,0));
  fwObjects(FW.objOpt||{});FW.clouds=fwClouds(mood);FW.parts=[];FW.cI=g3Inst(1400,2,G3.quadC);FW.pI=g3Inst(700,2,G3.quadC);FWR.E=fwEnv(mood,FW.sunAz||2.2);}
function fwDispose(){const W=FW;if(!W)return;const gl=G3.gl;if(gl&&!gl.isContextLost()){for(const n of W.nodes.values())g3Free(n.m);for(const t of W.tiles.values())g3Free(t.m);W.objs.forEach(o=>g3Free(o.m));
    if(W.water)g3Free(W.water);if(W.signM)g3Free(W.signM);if(W.texLab)gl.deleteTexture(W.texLab);[W.mapN,W.mapF].forEach(M=>{if(M&&M.texA){gl.deleteTexture(M.texA);gl.deleteTexture(M.texB);}});g3InstFree(W.cI);g3InstFree(W.pI);}
  FW=null;}
