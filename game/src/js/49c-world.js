/* ================= МИР ГОНКИ НА ФОТО-МАТЕРИАЛАХ: погода и небо, карты земли, дальние горы, дороги эпохи ================= */
// Погода гонки — по стране, месяцу и типу гонки (одна и та же для одной гонки): ясно, облачно, пасмурно (бывает дождь), утро в дымке, вечер.
function r3dWeather(T){const rc=T.rc,cfg=T.cfg,h=cfg.host,r=mulberry32(hashStr('wx|'+rc.key));
  const wet={uk:0.36,ie:0.42,be:0.3,de:0.26,fr:0.2,ru:0.24,us:0.14,at:0.26,ch:0.26,it:0.1,es:0.08,mc:0.08,ly:0.02,other:0.2}[h]||0.2;
  const snowy=cfg.terr==='snow'||(cfg.stages&&cfg.stages[0]==='snow');let mood;const q=r();
  if(snowy)mood=q<0.55?'overcast':'cloudy';
  else if(cfg.night)mood='evening';
  else if(cfg.uphill||cfg.terr==='mount')mood=q<0.3?'morning':q<0.72?'clear':'cloudy';
  else if(cfg.oval||rc.track==='board')mood=q<0.55?'clear':'cloudy';
  else mood=q<wet?'overcast':q<wet+0.28?'cloudy':q<wet+0.38?'morning':q<wet+0.45?'evening':'clear';
  const rain=mood==='overcast'&&!snowy&&!cfg.oval&&rc.track!=='board'&&r()<0.6;
  // солнце: сбоку-спереди от направления старта — рельеф и машины «лепятся» светом
  const st=T.T[T.startIdx]||[0,1],th=Math.atan2(st[0],st[1])+(r()<0.5?1:-1)*(1.75+r()*0.5);
  return {mood,rain,mist:mood==='morning'?1:mood==='overcast'?0.5:0,az:th};}
const WX_NAME={clear:'ясно',cloudy:'облачно',overcast:'пасмурно',morning:'утро, дымка',evening:'вечер'};
// Свет дня по фото неба: высота солнца — как на снимке, цвет неба у горизонта и в зените — из снимка
function r3dEnvPhoto(T,W){const S=TX.D&&TX.D.sky&&TX.D.sky[W.mood];if(!S)return null;
  const set=SCEN_SETS[T.cfg.host],el=clamp(S.sun[1],6,62)*Math.PI/180,th=W.az,sun=v3n([Math.cos(el)*Math.sin(th),Math.sin(el),Math.cos(el)*Math.cos(th)]);
  const L=v=>v.map(x=>Math.pow(clamp(x,0,1),2.2)),hz=L(S.hz),ze=L(S.ze),mix3=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
  const P={clear:{sun:[2.1,1.95,1.7],amb:0.62,exp:0.95,fog:0.0008},cloudy:{sun:[1.8,1.72,1.58],amb:0.72,exp:1,fog:0.00095},overcast:{sun:[0.45,0.46,0.48],amb:1.25,exp:1.3,fog:0.0016},
    morning:{sun:[1.8,1.55,1.2],amb:0.7,exp:1.02,fog:0.0019},evening:{sun:[1.9,1.25,0.74],amb:0.66,exp:1.06,fog:0.0011}}[W.mood];
  const kE=0.78,sky=mul(mix3(ze,hz,0.45),kE*P.amb),gr=lin(T.cfg.terr==='snow'?'#e9edf2':set.grass||(TERR[T.cfg.terr]||TERR.dirt).g);
  const fogS=W.mood==='evening'?[1.25,0.75,0.42]:W.mood==='morning'?[1.1,0.96,0.8]:mul(mix3(hz,[1,0.95,0.85],0.3),kE*1.1);
  const day={sun,sunC:P.sun,skyC:sky,gndC:mix3(mul(gr,0.3),[0.07,0.065,0.055],0.5),hzC:mul(hz,kE),zeC:mul(ze,kE),fogS,fogD:P.fog*(W.rain?1.35:1),exp:P.exp,night:0,hl:0,lamp:0,
    envRot:(S.sun[0]/360-th/6.2832+10)%1,envK:kE};
  return day;}
/* ---------- материалы дорог эпохи: слой, вид (для шейдера), оттенок, обочина ---------- */
const ROADM={dirt:{l:'dirt_road',k:0,t:[1.05,1,0.94],v:'dirt'},macadam:{l:'gravel',k:1,t:[0.9,0.9,0.92],v:'gravel'},asphalt:{l:'asphalt',k:2,t:[1,1,1],v:'gravel'},
  brick:{l:'brick_road',k:3,t:[1.25,0.92,0.8],v:'gravel'},board:{l:'planks',k:4,t:[1.3,1.12,0.95],v:'dirt'},concrete:{l:'concrete',k:5,t:[0.95,0.95,0.93],v:'gravel'},
  snow:{l:'snow',k:6,t:[1,1,1],v:'snow'},mud:{l:'mud',k:7,t:[1,1,1],v:'mud'},sand:{l:'sand',k:8,t:[1.45,1.3,1.05],v:'sand'},beach:{l:'sand',k:8,t:[1.55,1.42,1.18],v:'sand'},
  mount:{l:'dirt_road',k:0,t:[1.12,1.08,1.02],v:'gravel'},pave:{l:'cobble',k:9,t:[1,1,1],v:'gravel'}};
function roadM(key){return ROADM[key]||ROADM.dirt;}
/* ---------- материал грани здания или предмета по её цвету и назначению ---------- */
function faceLay(f){if(TX.st!==2)return 0;const k=f.mat&&f.mat.k,c=f.col,n=f.n,lum=(c[0]*0.3+c[1]*0.59+c[2]*0.11)/255,mx=Math.max(c[0],c[1],c[2]),mn=Math.min(c[0],c[1],c[2]),sat=mx?(mx-mn)/mx:0;
  const red=c[0]>c[1]*1.3&&c[0]>c[2]*1.4,brown=c[0]>=c[1]&&c[1]>=c[2]&&sat>0.25&&lum<0.5;
  if(k==='wall'){if(red&&lum<0.45)return txLay('brick_wall',0);if(sat<0.14&&lum>0.35&&lum<0.72)return txLay('stone_wall',1);if(brown)return txLay('wood_wall',1);return txLay('plaster',1);}
  const slope=n&&n[1]>0.25&&n[1]<0.97;
  if(k==='roof'||(k==='matte'&&slope)){if(red)return txLay('roof_tiles',1);if(c[0]>150&&c[1]>115&&c[2]<110)return txLay('thatch',1);return txLay('roof_slate',1);}
  if(k==='wood')return txLay('wood_wall',1);
  return 0;}
/* ---------- карты земли: оттенок (+ затенение) и доли слоёв (вторая трава, земля, лесная подстилка, покров) ---------- */
function r3dMaps(T,F,W){
  const cfg=T.cfg,set=SCEN_SETS[cfg.host],rnd=mulberry32(F.seed+99),wx=(F.nx-1)*F.S,wz=(F.nz-1)*F.S,SZ=gfxQ()==='cine'?2048:1024,kx=SZ/wx,kz=SZ/wz;
  const X=x=>(x-F.x0)*kx,Z=z=>(z-F.z0)*kz,snowy=cfg.terr==='snow',sandy=cfg.terr==='sand'||cfg.terr==='beach',dry=!!set.dry||['it','es','ly','mc'].includes(cfg.host),lush=['uk','ie','de','be','at','ch','ru'].includes(cfg.host);
  const mk=(v)=>{const c=mkCanvas(SZ,SZ),g=c.getContext('2d');g.fillStyle=v;g.fillRect(0,0,SZ,SZ);return [c,g];};
  const [cT,gT]=mk('#808080'),[cA,gA]=mk('#ffffff'),[cAlt,gAlt]=mk('#000'),[cD,gD]=mk('#000'),[cF,gF]=mk('#000'),[cC,gC]=mk('#000');
  // 1) оттенок: пятна посуше и посочнее, у крутых склонов — к земле
  const b=mkCanvas(F.nx,F.nz),bg=b.getContext('2d'),id=bg.createImageData(F.nx,F.nz),dd=id.data,b2=mkCanvas(F.nx,F.nz),bg2=b2.getContext('2d'),id2=bg2.createImageData(F.nx,F.nz),d2=id2.data;
  const base=lush?[122,132,120]:dry?[134,128,116]:[128,130,122];
  for(let j=0;j<F.nz;j++)for(let k=0;k<F.nx;k++){const q=j*F.nx+k,x=F.x0+k*F.S,z=F.z0+j*F.S,o=q*4;
    const n1=fbm2(x/130,z/130,F.seed+5,3),n2=fbm2(x/420,z/420,F.seed+17,2),v=0.86+0.28*n1;
    const warm=sstep(0.45,0.8,n2)*(dry?0.35:0.18);
    dd[o]=clamp(base[0]*v*(1+warm*0.3),0,255);dd[o+1]=clamp(base[1]*v*(1+warm*0.05),0,255);dd[o+2]=clamp(base[2]*v*(1-warm*0.2),0,255);dd[o+3]=255;
    const hx=F.H[Math.min(q+1,F.nx*F.nz-1)]-F.H[Math.max(q-1,0)],hz=F.H[Math.min(q+F.nx,F.nx*F.nz-1)]-F.H[Math.max(q-F.nx,0)],sl=Math.hypot(hx,hz)/(2*F.S);
    const alt=clamp(sstep(0.5,0.75,n2)*(dry?0.9:0.45)+(dry?0.25:0),0,1),dirt=sstep(0.45,0.9,sl)*(F.mount?0.7:0.4);
    d2[o]=alt*255;d2[o+1]=dirt*255;d2[o+2]=0;d2[o+3]=255;}
  bg.putImageData(id,0,0);gT.imageSmoothingEnabled=true;gT.drawImage(b,0,0,SZ,SZ);
  bg2.putImageData(id2,0,0);const sp=mkCanvas(F.nx,F.nz),spg=sp.getContext('2d');
  // сухая трава и земля склонов — отдельными каналами
  const ch=(src,ci,g)=>{const t=bg2.getImageData(0,0,F.nx,F.nz),o=spg.createImageData(F.nx,F.nz);for(let i=0;i<t.data.length;i+=4){const v=t.data[i+ci];o.data[i]=o.data[i+1]=o.data[i+2]=v;o.data[i+3]=255;}spg.putImageData(o,0,0);g.imageSmoothingEnabled=true;g.drawImage(sp,0,0,SZ,SZ);};
  ch(0,0,gAlt);ch(0,1,gD);
  // 2) поля: пшеница (сухая трава, жёлтый), пашня (земля, борозды), луг (зеленее), виноградник (земля полосами)
  const nF=snowy||sandy?0:Math.round(wx*wz/8000);
  for(let f=0;f<nF;f++){const x=F.x0+rnd()*wx,z=F.z0+rnd()*wz;const d=fSample(F,F.D,x,z);if(d<26)continue;const hx=fSample(F,F.H,x+8,z)-fSample(F,F.H,x-8,z),hz=fSample(F,F.H,x,z+8)-fSample(F,F.H,x,z-8);if(Math.hypot(hx,hz)/16>0.3)continue;
    const w=40+rnd()*120,h=30+rnd()*95,a=rnd()*3.14,q=rnd(),type=q<0.3?'wheat':q<0.52?'plow':q<0.8?'meadow':dry?'vine':'fallow';
    const rect=(g,style,al)=>{g.save();g.translate(X(x),Z(z));g.rotate(a);g.globalAlpha=al;g.fillStyle=style;g.fillRect(-w*kx/2,-h*kz/2,w*kx,h*kz);g.restore();};
    const rows=(g,style,al,step,lw)=>{g.save();g.translate(X(x),Z(z));g.rotate(a);g.globalAlpha=al;g.strokeStyle=style;g.lineWidth=Math.max(1,lw*kx);for(let l=-w/2;l<w/2;l+=step){g.beginPath();g.moveTo(l*kx,-h*kz/2);g.lineTo(l*kx,h*kz/2);g.stroke();}g.restore();};
    if(type==='wheat'){rect(gAlt,'#fff',0.9);rect(gT,'rgb(158,146,104)',0.75);rect(gD,'#000',0.6);}
    else if(type==='plow'){rect(gD,'#fff',0.95);rect(gT,'rgb(126,112,98)',0.7);rows(gT,'rgb(96,84,72)',0.45,2.2,0.9);rect(gAlt,'#000',0.9);}
    else if(type==='meadow'){rect(gT,'rgb(112,142,104)',0.55);rect(gAlt,'#000',0.7);rect(gD,'#000',0.5);}
    else if(type==='vine'){rect(gD,'#fff',0.55);rows(gD,'#000',0.6,2.4,1.2);rect(gT,'rgb(132,124,100)',0.5);}
    else{rect(gAlt,'#fff',0.45);rect(gT,'rgb(138,134,108)',0.4);}
    // межа: полоска травы вокруг поля
    gT.save();gT.translate(X(x),Z(z));gT.rotate(a);gT.globalAlpha=0.35;gT.strokeStyle='rgb(104,128,96)';gT.lineWidth=Math.max(1,kx*2.2);gT.strokeRect(-w*kx/2,-h*kz/2,w*kx,h*kz);gT.restore();}
  [gT,gD,gAlt].forEach(g=>{g.globalAlpha=1;});
  // 3) лес: подстилка, темнее и в тени (деревья ставятся по этим же пятнам)
  R3.forest=[];const nW=Math.round(wx*wz/60000*(set.flat?0.6:1)*(sandy||set.dry?0.2:1)*(snowy?0.7:1));
  // лесные участки дороги: роща продолжается вглубь с обеих сторон
  (T.seg||[]).forEach(sg=>{if(sg.type!==RSEG.forest&&sg.type!==RSEG.serp)return;for(let i=sg.i0;i<=sg.i1;i+=12){const p=T.pts[i],nn=T.N[i];[1,-1].forEach(sd=>{if(sg.type===RSEG.serp&&rnd()<0.5)return;const o=sd*(T.W/2+42+rnd()*25),x=p[0]+nn[0]*o,z=p[2]+nn[1]*o,r=30+rnd()*22;R3.forest.push([x,z,r]);
    const blob=(g,c0,c1)=>{const gr=g.createRadialGradient(X(x),Z(z),0,X(x),Z(z),r*kx*1.1);gr.addColorStop(0,c0);gr.addColorStop(0.75,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.beginPath();g.arc(X(x),Z(z),r*kx*1.1,0,7);g.fill();};
    blob(gF,'rgba(255,255,255,.9)','rgba(255,255,255,0)');blob(gA,'rgba(130,130,130,.6)','rgba(130,130,130,0)');});}});
  for(let f=0;f<nW;f++){const x=F.x0+rnd()*wx,z=F.z0+rnd()*wz,d=fSample(F,F.D,x,z);if(d<45)continue;const r=25+rnd()*70;R3.forest.push([x,z,r]);
    const blob=(g,c0,c1)=>{const gr=g.createRadialGradient(X(x),Z(z),0,X(x),Z(z),r*kx*1.1);gr.addColorStop(0,c0);gr.addColorStop(0.75,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.beginPath();g.arc(X(x),Z(z),r*kx*1.1,0,7);g.fill();};
    blob(gF,'rgba(255,255,255,.95)','rgba(255,255,255,0)');blob(gA,'rgba(120,120,120,.7)','rgba(120,120,120,0)');blob(gT,'rgba(104,112,92,.5)','rgba(104,112,92,0)');}
  // 4) коридор дороги: пыльная обочина — земля (в городе — брусчатка своим слоем)
  const path=(g,from,to)=>{g.beginPath();for(let i=from;i<=to;i++){const p=T.pts[i%T.n];i===from?g.moveTo(X(p[0]),Z(p[2])):g.lineTo(X(p[0]),Z(p[2]));}};
  const last=T.closed?T.n:T.n-1;[gD,gT,gAlt].forEach(g=>{g.lineJoin='round';g.lineCap='round';});
  const hard=['asphalt','concrete','brick','board'].includes(cfg.terr);
  [[T.W+30,0.12],[T.W+12,hard?0.2:0.4],[T.W+4,hard?0.45:0.8]].forEach(([w,a])=>{gD.globalAlpha=a;gD.strokeStyle='#fff';gD.lineWidth=w*kx;path(gD,0,last);gD.stroke();});
  gAlt.globalAlpha=0.5;gAlt.strokeStyle='#000';gAlt.lineWidth=(T.W+10)*kx;path(gAlt,0,last);gAlt.stroke();gD.globalAlpha=1;gAlt.globalAlpha=1;
  // 5) тень-«подушка» под деревьями и домами у дороги
  for(let i=0;i<T.n;i++)for(const it of T.spr[i]){if(it.k==='p')continue;const p=T.pts[i],nn=T.N[i],x=it.wx!==undefined?it.wx:p[0]+nn[0]*it.off,z=it.wz!==undefined?it.wz:p[2]+nn[1]*it.off,r=R3SIZE[it.t]||0;if(!r)continue;
    const gr=gA.createRadialGradient(X(x),Z(z),0,X(x),Z(z),r*kx*1.2);gr.addColorStop(0,'rgba(90,90,90,.55)');gr.addColorStop(1,'rgba(90,90,90,0)');gA.fillStyle=gr;gA.beginPath();gA.arc(X(x),Z(z),r*kx*1.2,0,7);gA.fill();}
  // 6) покров: песок у моря и в пустыне, снег — на снежных гонках (основа), в Альпах — по высоте (в шейдере)
  if(sandy||set.dry){const nS=Math.round(wx*wz/(sandy?9000:40000));for(let s=0;s<nS;s++){const x=F.x0+rnd()*wx,z=F.z0+rnd()*wz,r=20+rnd()*60;const gr=gC.createRadialGradient(X(x),Z(z),0,X(x),Z(z),r*kx);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');gC.fillStyle=gr;gC.beginPath();gC.arc(X(x),Z(z),r*kx,0,7);gC.fill();}}
  if(F.beach){gC.strokeStyle='#fff';gC.lineWidth=(T.W+60)*kx;path(gC,0,last);gC.stroke();}
  // сводим в две текстуры RGBA (без премультипликации — байтами)
  const px=g=>g.getImageData(0,0,SZ,SZ).data,t=px(gT),ao=px(gA),al=px(gAlt),di=px(gD),fo=px(gF),co=px(gC),n=SZ*SZ,A=new Uint8Array(n*4),B=new Uint8Array(n*4);
  for(let i=0;i<n;i++){const o=i*4;A[o]=t[o];A[o+1]=t[o+1];A[o+2]=t[o+2];A[o+3]=ao[o];B[o]=al[o];B[o+1]=di[o];B[o+2]=fo[o];B[o+3]=co[o];}
  return {SZ,A,B,u:[F.x0,F.z0,1/wx,1/wz]};}
function g3TexBytes(S,data,o){o=o||{};const gl=G3.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,data);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
/* ---------- дальняя земля: грубая сетка под всей картой (нет «дыр» вдали) и кольцо гор и холмов до горизонта ---------- */
// Высота вдали: на карте — минимум рельефа рядом (сетка всегда под подробной землёй), за картой — край карты плавно переходит в горы
function r3dFarH(F,x,z,amp,seed,hMin){const X1=F.x0+(F.nx-1)*F.S,Z1=F.z0+(F.nz-1)*F.S,ex=clamp(x,F.x0,X1),ez=clamp(z,F.z0,Z1),out=Math.hypot(x-ex,z-ez);
  if(F.seaDir&&out>=1){const cx=(F.x0+X1)/2,cz=(F.z0+Z1)/2,dx=x-cx,dz=z-cz,l=Math.hypot(dx,dz)||1;if((dx*F.seaDir[0]+dz*F.seaDir[1])/l>0.25)return F.sea-30;}
  if(out<1){let m=1e9;for(const dx of [-36,0,36])for(const dz of [-36,0,36])m=Math.min(m,fSample(F,F.H,clamp(x+dx,F.x0,X1),clamp(z+dz,F.z0,Z1)));return m-1.6;}
  const h0=fSample(F,F.H,ex,ez),rid=1-Math.abs(fbm2(x/2600,z/2600,seed,4)*2-1),hills=fbm2(x/900,z/900,seed+3,3);
  return h0-1.6+(hMin-8-h0)*sstep(0,500,out)*0.4+(Math.pow(rid,2.2)*0.8+hills*0.3)*amp*sstep(0,2800,out);}
function r3dFarRing(T,F){if(T.coast&&T.coast.length){let sx=0,sz=0;T.coast.forEach(c=>{for(let i=c.i0;i<=c.i1;i+=5){sx+=T.N[i][0]*c.side;sz+=T.N[i][1]*c.side;}});const l=Math.hypot(sx,sz)||1;F.seaDir=[sx/l,sz/l];F.sea=T.coast[0].sea;}
  const cfg=T.cfg,set=SCEN_SETS[cfg.host],cx=F.x0+(F.nx-1)*F.S/2,cz=F.z0+(F.nz-1)*F.S/2,R0=Math.hypot((F.nx-1)*F.S,(F.nz-1)*F.S)/2+64,R1=9000,seed=F.seed+701;
  const amp=cfg.terr==='snow'?260:F.mount?1300:(set.mount||cfg.uphill||cfg.terr==='mount')?520:set.flat?35:130;
  let hMin=1e9;T.pts.forEach(p=>{hMin=Math.min(hMin,p[1]);});const H=(x,z)=>r3dFarH(F,x,z,amp,seed,hMin);
  const g=new MB(),st=64,n=Math.ceil(R0/st),rows=[];
  for(let j=-n;j<=n;j++){const row=[];for(let i=-n;i<=n;i++){const x=cx+i*st,z=cz+j*st;row.push([x,H(x,z),z]);}rows.push(row);}
  mbGrid(g,rows,null,[0,0,0],MID.matte);
  const A=160,RN=28,ring=[];
  for(let j=0;j<=RN;j++){const rad=R0*Math.pow(R1/R0,j/RN),row=[];
    for(let i=0;i<=A;i++){const a=i/A*6.2832,x=cx+Math.cos(a)*rad,z=cz+Math.sin(a)*rad;row.push([x,H(x,z)-2.2*(1-sstep(R0,R0*1.45,rad)),z]);}ring.push(row);}
  mbGrid(g,ring,null,[0,0,0],MID.matte);return g3Mesh(g);}
/* ---------- особые участки куска: каменный мост с арками, скала серпантина ---------- */
function r3dChunkExtras(S,lit){const T=R3.T,W=T.W,st=T.step,e3=lit.e[3];
  for(let s=0;s<S.length-1;s++){const A=S[s],B=S[s+1];
    // мост: парапеты, лицевые стены с арками до воды, свод
    if(A.bridge&&B.bridge){const rv=(T.rivers||[]).reduce((b,q)=>Math.abs(q.i-A.i)<Math.abs((b||{i:1e9}).i-A.i)?q:b,null);if(!rv)continue;
      const i0=(()=>{let k=rv.i;while(k>0&&T.bridge[k-1])k--;return k;})(),i1=(()=>{let k=rv.i;while(k<T.n-1&&T.bridge[k+1])k++;return k;})(),L=(i1-i0)*st,ya=A.road[2][1],yb=B.road[2][1],bed=T.pts[rv.i][1]-rv.d;
      const nA=Math.max(1,Math.round(L/34)),yBot=u=>{const w=L/nA,k=Math.min(nA-1,Math.floor(u/w)),m=(k+0.5)*w,h=(u-m)/(w*0.5*0.86);const top=Math.min(ya,yb)-1.3;return Math.abs(h)>=1?bed:bed+0.4+(top-bed-0.4)*Math.sqrt(1-h*h);};
      const uA=(A.i-i0)*st,uB=(B.i-i0)*st;lit.e[3]=txLay('stone_wall',1);const col=[196,188,172];
      [0,4].forEach(ix=>{const sd=ix===0?1:-1,pa=A.road[ix],pb=B.road[ix],na=T.N[A.i],nb=T.N[B.i],o=0.55;
        const qa=[pa[0]+na[0]*sd*o,pa[1],pa[2]+na[1]*sd*o],qb=[pb[0]+nb[0]*sd*o,pb[1],pb[2]+nb[1]*sd*o],up=0.95,nOut=[na[0]*sd,0,na[1]*sd];
        lit.poly([[pa[0],pa[1],pa[2]],[pb[0],pb[1],pb[2]],[pb[0],pb[1]+up,pb[2]],[pa[0],pa[1]+up,pa[2]]],[-nOut[0],0,-nOut[2]],col,MID.stone);
        lit.poly([[pa[0],pa[1]+up,pa[2]],[pb[0],pb[1]+up,pb[2]],[qb[0],qb[1]+up,qb[2]],[qa[0],qa[1]+up,qa[2]]],[0,1,0],cMul(col,1.05),MID.stone);
        lit.poly([[qa[0],yBot(uA),qa[2]],[qb[0],yBot(uB),qb[2]],[qb[0],qb[1]+up,qb[2]],[qa[0],qa[1]+up,qa[2]]],nOut,col,MID.stone);});
      // свод арки снизу (между лицевыми стенами)
      const a0=A.road[0],a4=A.road[4],b0=B.road[0],b4=B.road[4],na=T.N[A.i],nb=T.N[B.i],o=0.55,P=(p,n,sd,y)=>[p[0]+n[0]*sd*o,y,p[2]+n[1]*sd*o];
      lit.poly([P(a0,na,1,yBot(uA)),P(a4,na,-1,yBot(uA)),P(b4,nb,-1,yBot(uB)),P(b0,nb,1,yBot(uB))],[0,-1,0],cMul(col,0.8),MID.stone);
      lit.e[3]=e3;continue;}}
  // серпантин: скала со стороны горы (фото-камень, неровный срез)
  for(let s=0;s<S.length-1;s++){const A=S[s],B=S[s+1];if(!T.segT||T.segT[A.i]!==RSEG.serp||T.segT[B.i]!==RSEG.serp)continue;
    const pa=T.pts[A.i],na=T.N[A.i],pb=T.pts[B.i],nb=T.N[B.i];
    [1,-1].forEach(sd=>{const off=W/2+2.2,ha=fH(pa[0]+na[0]*sd*(W/2+14),pa[2]+na[1]*sd*(W/2+14))-pa[1],hb=fH(pb[0]+nb[0]*sd*(W/2+14),pb[2]+nb[1]*sd*(W/2+14))-pb[1];if(ha<3||hb<3)return;
      lit.e[3]=txLay('rock',1,1);const rows=5,cA=[],cB=[];
      for(let k=0;k<=rows;k++){const t=k/rows,ja=vnz(A.i*0.37,k*1.7,11)-0.5,jb=vnz(B.i*0.37,k*1.7,11)-0.5,Ha=Math.min(ha+1.5,14)*t,Hb=Math.min(hb+1.5,14)*t;
        cA.push([pa[0]+na[0]*sd*(off+t*1.6+ja*0.9),roadY(A.i,sd*W/2)+0.1+Ha,pa[2]+na[1]*sd*(off+t*1.6+ja*0.9)]);cB.push([pb[0]+nb[0]*sd*(off+t*1.6+jb*0.9),roadY(B.i,sd*W/2)+0.1+Hb,pb[2]+nb[1]*sd*(off+t*1.6+jb*0.9)]);}
      for(let k=0;k<rows;k++){const q=[cA[k],cB[k],cB[k+1],cA[k+1]],n=v3n(v3x([q[1][0]-q[0][0],q[1][1]-q[0][1],q[1][2]-q[0][2]],[q[3][0]-q[0][0],q[3][1]-q[0][1],q[3][2]-q[0][2]]));
        const toRoad=n[0]*(-na[0]*sd)+n[2]*(-na[1]*sd);lit.poly(q,toRoad>0?n:[-n[0],-n[1],-n[2]],[176,170,160],MID.stone);}
      lit.e[3]=e3;});}}
/* ---------- реки: полоса воды вдоль русла; берег моря — гладь до горизонта ---------- */
function r3dWaters(T){const mb=new MB(),c=hex2rgb('#1f5a78');let any=false;
  // вода — на 0,9 м выше дна русла в каждом месте (река понемногу течёт под уклон)
  (T.rivers||[]).forEach(rv=>{const L=riverLine(T,rv),w=rv.w/2+1.5;let prev=null;
    for(let s=-1300;s<=1300;s+=12){const m=Math.sin(s/170+rv.ph)*22*sstep(20,120,Math.abs(s))+Math.sin(s/61+rv.ph*2)*6*sstep(20,120,Math.abs(s)),cx=L.p[0]+L.d[0]*s+L.t[0]*m,cz=L.p[2]+L.d[1]*s+L.t[1]*m;
      const y=fH(cx,cz)+0.9,a=[cx+L.t[0]*w,y,cz+L.t[1]*w],b=[cx-L.t[0]*w,y,cz-L.t[1]*w];if(prev)mb.poly([prev[0],prev[1],b,a],[0,1,0],c,MID.water);prev=[a,b];}any=true;});
  // море: гладь начинается в ~300 м от берега и уходит к горизонту (ближе — земля срезана ниже воды)
  (T.coast||[]).forEach(cs=>{const y=(cs.sea===undefined?T.pts[cs.i0][1]-5:cs.sea)+0.2,mid=Math.round((cs.i0+cs.i1)/2),p=T.pts[mid],nn=T.N[mid],o=cs.side,D=[nn[0]*o,nn[1]*o],Tn=[-D[1],D[0]];
    const P=(u,v)=>[p[0]+D[0]*u+Tn[0]*v,y,p[2]+D[1]*u+Tn[1]*v];for(let a=0;a<6;a++)for(let b=-4;b<4;b++){const u0=40+a*1500,u1=u0+1500,v0=b*1500,v1=v0+1500;mb.poly([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)],[0,1,0],c,MID.water);}any=true;});
  return any?mb:null;}
/* ---------- железная дорога: насыпь, шпалы, рельсы, столбы телеграфа; поезд с паровозом ---------- */
function railLine(T,rl){const p=T.pts[rl.i],nn=T.N[rl.i],ca=Math.cos(rl.ang),sa=Math.sin(rl.ang),d=[nn[0]*ca-nn[1]*sa,nn[1]*ca+nn[0]*sa];return {p,d};}
function railY(T,rl,s){const L=railLine(T,rl),x=L.p[0]+L.d[0]*s,z=L.p[2]+L.d[1]*s,near=Math.abs(s)<T.W/2+3;const g=fH(x,z);return near?L.p[1]+0.03:Math.max(g+0.35,L.p[1]+0.03-(Math.abs(s)-T.W/2-3)*0.02);}
function r3dRails(T){if(!T.rails||!T.rails.length)return null;const mb=new MB();
  T.rails.forEach(rl=>{const L=railLine(T,rl),dx=L.d[0],dz=L.d[1],sx=-dz,sz=dx,P=(s,o,dy)=>[L.p[0]+dx*s+sx*o,railY(T,rl,s)+(dy||0),L.p[2]+dz*s+sz*o];
    for(let s=-420;s<420;s+=6){const s1=s+6,road=Math.abs(s)<T.W/2+2&&Math.abs(s1)<T.W/2+2;
      if(!road){mb.e[3]=txLay('gravel',1);[[-2.3,-1.6],[-1.6,1.6],[1.6,2.3]].forEach(([o0,o1],k)=>{const h0=k===1?0:-0.35,h1=k===1?0:-0.35,a=k===0?-0.35:0,b=k===2?-0.35:0;mb.poly([P(s,o0,a),P(s1,o0,a),P(s1,o1,b),P(s,o1,b)],[0,1,0],[170,166,158],MID.stone);});mb.e[3]=0;
        mb.e[3]=txLay('planks',1);for(let q=s;q<s1;q+=0.72){const y=railY(T,rl,q)+0.02;const A=[L.p[0]+dx*q,y,L.p[2]+dz*q];pBox(mb,A[0],y,A[2],1.3,0.12,0.12,'#6a5a48',MID.wood,Math.atan2(dx,dz));}mb.e[3]=0;}
      [-0.72,0.72].forEach(o=>{const a=P(s,o,road?0.005:0.14),b=P(s1,o,road?0.005:0.14);mb.poly([[a[0]-sx*0.035,a[1]+0.06,a[2]-sz*0.035],[b[0]-sx*0.035,b[1]+0.06,b[2]-sz*0.035],[b[0]+sx*0.035,b[1]+0.06,b[2]+sz*0.035],[a[0]+sx*0.035,a[1]+0.06,a[2]+sz*0.035]],[0,1,0],[150,146,140],MID.metal);
        mb.poly([[a[0]+sx*0.035*Math.sign(o),a[1],a[2]+sz*0.035*Math.sign(o)],[b[0]+sx*0.035*Math.sign(o),b[1],b[2]+sz*0.035*Math.sign(o)],[b[0]+sx*0.035*Math.sign(o),b[1]+0.06,b[2]+sz*0.035*Math.sign(o)],[a[0]+sx*0.035*Math.sign(o),a[1]+0.06,a[2]+sz*0.035*Math.sign(o)]],[sx*Math.sign(o),0,sz*Math.sign(o)],[70,62,56],MID.metal);});
      // столбы телеграфа вдоль дороги
      if(Math.round(s/6)%8===0&&Math.abs(s)>12){const q=P(s,4.2,-0.3);pTrunk(mb,q[0],q[1],q[2],q[0],q[1]+6.5,q[2],0.1,0.08,'#6a5440',6,MID.wood);pBox(mb,q[0],q[1]+6,q[2],0.9,0.1,0.06,'#5a4632',MID.wood,Math.atan2(sx,sz));}}});
  return mb;}
// Цилиндр по любой оси (котёл, колёса, трубы): гладкие бока и крышки на концах
function pCyl(mb,a,b,r0,r1,col,sides,mat,caps){sides=sides||12;const c=Array.isArray(col)?col:hex2rgb(col),M=mat===undefined?MID.metal:mat,d=v3n([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),up=Math.abs(d[1])<0.9?[0,1,0]:[1,0,0],u=v3n(v3x(d,up)),v=v3x(u,d);
  const Nn=t=>[u[0]*Math.cos(t)+v[0]*Math.sin(t),u[1]*Math.cos(t)+v[1]*Math.sin(t),u[2]*Math.cos(t)+v[2]*Math.sin(t)],R=(p,r,t)=>{const n=Nn(t);return [p[0]+n[0]*r,p[1]+n[1]*r,p[2]+n[2]*r];};
  for(let k=0;k<sides;k++){const t0=k/sides*6.2832,t1=(k+1)/sides*6.2832,n0=Nn(t0),n1=Nn(t1);mb.polyN([R(a,r0,t0),R(a,r0,t1),R(b,r1,t1),R(b,r1,t0)],Nn((t0+t1)/2),[n0,n1,n1,n0],c,M);}
  if(caps!==false){const ring=(p,r)=>Array.from({length:sides},(_,k)=>R(p,r,k/sides*6.2832));if(r0>0.02)mb.poly(ring(a,r0),[-d[0],-d[1],-d[2]],c,M);if(r1>0.02)mb.poly(ring(b,r1),d,c,M);}}
// Колесо сбоку (ось поперёк): обод, ступица цвета рамы
function pWheelX(mb,x,y,z,r,sd,hub){pCyl(mb,[x,y,z],[x+sd*0.16,y,z],r,r,'#1b1b1c',16,MID.metal);pCyl(mb,[x+sd*0.16,y,z],[x+sd*0.19,y,z],r*0.82,r*0.3,hub||'#7a2620',12,MID.paint);}
// Поезд: паровоз (котёл, труба, сухопарник, будка, колёса с дышлом), тендер с углём и вагоны с полукруглой крышей
function r3dTrainMesh(y){const C=G3.cache,key='train'+(y<1905?0:1);if(C[key])return C[key];const cars=[],old=y<1905;
  const loco=new MB(),blk='#1c1d20',red=old?'#7a2a20':'#6a1f1c',brass='#b8923a',grey='#2c2e33';
  pBox(loco,0,0.95,0.1,1.32,0.26,3.5,red,MID.paint);// рама (площадка)
  pCyl(loco,[0,1.98,-3.1],[0,1.98,2.7],0.8,0.8,blk,20,MID.metal);// котёл
  [-2.2,-0.6,1.0,2.4].forEach(z=>pCyl(loco,[0,1.98,z],[0,1.98,z+0.08],0.815,0.815,brass,20,MID.chrome,false));// латунные бандажи котла
  pCyl(loco,[0,1.98,2.7],[0,1.98,3.2],0.86,0.86,grey,20,MID.metal);pCyl(loco,[0,1.98,3.2],[0,1.98,3.27],0.62,0.5,'#3a3c40',16,MID.metal);// дымовая коробка и дверца
  pCyl(loco,[0,2.7,2.85],[0,3.95,2.85],0.2,0.3,blk,14,MID.metal,false);pCyl(loco,[0,3.9,2.85],[0,4.05,2.85],0.36,0.36,blk,14,MID.metal);// труба с венцом
  pCyl(loco,[0,2.7,0.5],[0,3.1,0.5],0.38,0.3,brass,14,MID.chrome);pCyl(loco,[0,2.7,-1.4],[0,2.95,-1.4],0.26,0.2,blk,12,MID.metal);// сухопарник, песочница
  pCyl(loco,[0.25,2.72,-2.6],[0.25,3.1,-2.6],0.05,0.05,brass,8,MID.chrome);// свисток
  // будка машиниста: стенки с окнами, крыша с напуском
  pBox(loco,0,1.2,-4.2,1.36,2.35,1.05,'#23252a',MID.metal);pBox(loco,0,3.55,-4.2,1.5,0.1,1.3,blk,MID.metal);
  [-1,1].forEach(sd=>{pBox(loco,sd*1.37,2.35,-3.9,0.02,0.6,0.5,'#d6e4ea',MID.glass);pBox(loco,sd*1.37,2.35,-4.75,0.02,0.6,0.3,'#d6e4ea',MID.glass);});
  pBox(loco,0,2.35,-3.14,0.9,0.55,0.02,'#d6e4ea',MID.glass);
  // колёса: ведущие большие, бегунковые спереди; дышло и цилиндры
  [-1,1].forEach(sd=>{[-2.5,-0.9,0.7].forEach(z=>pWheelX(loco,sd*1.02,0.86,z,0.86,sd,red));pWheelX(loco,sd*0.98,0.5,2.35,0.5,sd,red);
    pBox(loco,sd*1.25,0.8,-0.9,0.035,0.11,1.75,'#9a9ca0',MID.chrome);pCyl(loco,[sd*1.1,0.95,1.7],[sd*1.1,0.95,2.8],0.34,0.34,grey,14,MID.metal);
    pCyl(loco,[sd*0.85,1.05,3.3],[sd*0.85,1.05,3.62],0.09,0.09,'#8a8c90',8,MID.chrome);pCyl(loco,[sd*0.85,1.05,3.62],[sd*0.85,1.05,3.66],0.2,0.2,'#6a6c70',12,MID.chrome);});
  pBox(loco,0,0.8,3.25,1.4,0.45,0.1,red,MID.paint);// буферный брус
  loco.e[1]=4;pCyl(loco,[0,3.0,3.1],[0,3.0,3.36],0.17,0.17,'#fff0c0',12,MID.glass);loco.e[1]=0;// фонарь
  cars.push({mb:loco,len:9.2});
  const tender=new MB();pBox(tender,0,0.95,0,1.3,1.75,2.5,'#23252a',MID.metal);pBox(tender,0,0.95,0,1.33,0.12,2.55,red,MID.paint);
  tender.e[3]=txLay('gravel',1);pBox(tender,0,2.7,0.2,1.12,0.28,1.8,'#141414',MID.matte);tender.e[3]=0;
  [-1.6,0,1.6].forEach(z=>[-1,1].forEach(sd=>pWheelX(tender,sd*1.0,0.5,z,0.5,sd,red)));cars.push({mb:tender,len:5.4});
  for(let k=0;k<4;k++){const w=new MB(),col=old?['#3e4a32','#5a3a26','#3e4a32','#4a3a2a'][k]:['#5a2a22','#3a4a3a','#5a2a22','#2e3a4a'][k];
    w.e[3]=txLay('wood_wall',1);pBox(w,0,1.0,0,1.38,2.2,4.3,col,MID.wood);w.e[3]=0;pBox(w,0,0.92,0,1.3,0.1,4.4,'#1c1d20',MID.metal);
    // полукруглая крыша
    w.e[3]=txLay('roof_slate',1);for(let j=0;j<8;j++){const a0=Math.PI*j/8,a1=Math.PI*(j+1)/8,X=a=>-Math.cos(a)*1.46,Y=a=>3.2+Math.sin(a)*0.38,nm=[-Math.cos((a0+a1)/2),Math.sin((a0+a1)/2)*2.5,0];
      w.poly([[X(a0),Y(a0),-4.45],[X(a1),Y(a1),-4.45],[X(a1),Y(a1),4.45],[X(a0),Y(a0),4.45]],v3n(nm),hex2rgb('#4a4a4c'),MID.roof);}w.e[3]=0;
    [-4.45,4.45].forEach(z=>w.poly(Array.from({length:9},(_,j)=>{const a=Math.PI*j/8;return [-Math.cos(a)*1.46,3.2+Math.sin(a)*0.38,z];}),[0,0,Math.sign(z)],hex2rgb(col),MID.wood));
    for(let j=-3;j<=3;j++)[-1,1].forEach(sd=>{pBox(w,sd*1.39,1.9,j*1.15,0.02,0.72,0.38,'#d6e0e4',MID.glass);pBox(w,sd*1.39,2.66,j*1.15,0.025,0.05,0.44,'#c9a860',MID.chrome);});
    [-3,-1.9,1.9,3].forEach(z=>[-1,1].forEach(sd=>pWheelX(w,sd*1.0,0.46,z,0.46,sd,'#2a2a2c')));cars.push({mb:w,len:9.4});}
  return C[key]={cars:cars.map(c=>({m:g3Mesh(c.mb),len:c.len}))};}
// Когда поезд идёт: машина подъезжает к переезду — поезд успевает пройти перед ней (шлагбаумы опускаются)
function r3dTrainTick(dt){const T=R3.T;if(!T.rails||!T.rails.length)return;const F=R.follow;
  T.rails.forEach(rl=>{const st=rl.st||(rl.st={state:0,s:0,v:17});
    const dist=(rl.i-F.idx)*T.step*(T.closed?1:1);
    if(st.state===0&&R.t>0&&dist>180&&dist<420){const vc=Math.max(14,F.vx),tc=dist/vc,Lt=48;if(tc>7){st.state=1;st.dir=Math.random()<0.5?1:-1;st.s=-st.dir*(T.W+Lt+st.v*(tc-3.5)-Lt);st.whistle=0;}}
    if(st.state===1){st.s+=st.dir*st.v*dt;const head=st.s*st.dir;if(!st.whistle&&head>-160){st.whistle=1;try{auSfx('whistle',1);}catch(_){}}
      if(head>600)st.state=2;
      // дым из трубы
      if(Math.random()<0.5){const L=railLine(T,rl),x=L.p[0]+L.d[0]*(st.s+st.dir*2.2),z=L.p[2]+L.d[1]*(st.s+st.dir*2.2),y=railY(T,rl,st.s)+3.8;r3dPart(x,y,z,(Math.random()-0.5)*0.6-L.d[0]*st.dir*2,1.6+Math.random(),(Math.random()-0.5)*0.6-L.d[1]*st.dir*2,1.2,4.5,3.2,[70,70,72],0.45);}}
    // шлагбаум: закрыт, пока поезд у переезда
    const near=st.state===1&&Math.abs(st.s)<180+48;rl.gate=clamp((rl.gate||0)+(near?1:-1)*dt*0.9,0,1);});}
function r3dTrainDraw(E,bw,bh){const T=R3.T;if(!T.rails||!T.rails.length)return;const gl=G3.gl;let P=null;
  T.rails.forEach(rl=>{const st=rl.st;if(!st||st.state!==1)return;const TM=r3dTrainMesh(R.rc.y),L=railLine(T,rl),M=R3.trainM||(R3.trainM=m4());
    if(!P){P=r3dUse('lit',E,bw,bh);gl.uniform4f(P.u.u_lamp,0,0,0,0);}
    let off=0;TM.cars.forEach((c,k)=>{const s=st.s-st.dir*(off+c.len/2);off+=c.len+0.6;const x=L.p[0]+L.d[0]*s,z=L.p[2]+L.d[1]*s,y=railY(T,rl,s)+0.14;
      if(Math.hypot(x-R3.eye[0],z-R3.eye[2])>900)return;const fw=[L.d[0]*st.dir,0,L.d[1]*st.dir],rt=[fw[2],0,-fw[0]];m4basis(M,rt,[0,1,0],fw,[x,y,z]);gl.uniformMatrix4fv(P.u.u_model,false,M);g3Draw(c.m);});});
  // стрелы шлагбаумов
  if(R3.gates&&R3.gates.length){const C=G3.cache;if(!C.gateArm){const mb=new MB();for(let k=0;k<8;k++)pBox(mb,0,-0.06,0.35+k*0.55,0.05,0.12,0.275,k%2?'#b8322a':'#f2eee4',MID.paint);C.gateArm=g3Mesh(mb);}
    if(!P){P=r3dUse('lit',E,bw,bh);gl.uniform4f(P.u.u_lamp,0,0,0,0);}const M=R3.gateM||(R3.gateM=m4());
    R3.gates.forEach(g=>{const rl=T.rails.reduce((b,q)=>Math.abs(q.i-g.i)<Math.abs((b||{i:1e9}).i-g.i)?q:b,null),k=rl?rl.gate||0:0,a=(1-k)*1.45;
      // стрела поворачивается от вертикали к горизонтали над дорогой
      const t=R3.T.T[g.i],fw=[t[0],0,t[1]],sd=g.side,across=[-R3.T.N[g.i][0]*sd,0,-R3.T.N[g.i][1]*sd],up=[0,1,0],dir=[across[0]*Math.cos(a)+up[0]*Math.sin(a),Math.sin(a),across[2]*Math.cos(a)],rt=v3n(v3x(up,dir)),u2=v3x(dir,rt);
      m4basis(M,rt,u2,dir,[g.x,g.y+1.2,g.z]);gl.uniformMatrix4fv(P.u.u_model,false,M);g3Draw(C.gateArm);});}}
