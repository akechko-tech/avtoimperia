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
  const P={clear:{sun:[2.05,1.9,1.66],amb:1.35,exp:0.9,fog:0.00085},cloudy:{sun:[1.72,1.64,1.5],amb:1.55,exp:0.95,fog:0.001},overcast:{sun:[0.42,0.43,0.45],amb:2.3,exp:1.2,fog:0.0017},
    morning:{sun:[1.75,1.5,1.18],amb:1.5,exp:0.98,fog:0.0021},evening:{sun:[1.85,1.2,0.72],amb:1.45,exp:1.02,fog:0.0012}}[W.mood];
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
  const base=lush?[120,138,118]:dry?[138,130,112]:[128,134,120];
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
  if(out<1){let m=1e9;for(const dx of [-36,0,36])for(const dz of [-36,0,36])m=Math.min(m,fSample(F,F.H,clamp(x+dx,F.x0,X1),clamp(z+dz,F.z0,Z1)));return m-1.6;}
  const h0=fSample(F,F.H,ex,ez),rid=1-Math.abs(fbm2(x/2600,z/2600,seed,4)*2-1),hills=fbm2(x/900,z/900,seed+3,3);
  return h0-1.6+(hMin-8-h0)*sstep(0,500,out)*0.4+(Math.pow(rid,2.2)*0.8+hills*0.3)*amp*sstep(0,2800,out);}
function r3dFarRing(T,F){const cfg=T.cfg,set=SCEN_SETS[cfg.host],cx=F.x0+(F.nx-1)*F.S/2,cz=F.z0+(F.nz-1)*F.S/2,R0=Math.hypot((F.nx-1)*F.S,(F.nz-1)*F.S)/2+64,R1=9000,seed=F.seed+701;
  const amp=cfg.terr==='snow'?260:F.mount?1300:(set.mount||cfg.uphill||cfg.terr==='mount')?520:set.flat?35:130;
  let hMin=1e9;T.pts.forEach(p=>{hMin=Math.min(hMin,p[1]);});const H=(x,z)=>r3dFarH(F,x,z,amp,seed,hMin);
  const g=new MB(),st=64,n=Math.ceil(R0/st),rows=[];
  for(let j=-n;j<=n;j++){const row=[];for(let i=-n;i<=n;i++){const x=cx+i*st,z=cz+j*st;row.push([x,H(x,z),z]);}rows.push(row);}
  mbGrid(g,rows,null,[0,0,0],MID.matte);
  const A=160,RN=28,ring=[];
  for(let j=0;j<=RN;j++){const rad=R0*Math.pow(R1/R0,j/RN),row=[];
    for(let i=0;i<=A;i++){const a=i/A*6.2832,x=cx+Math.cos(a)*rad,z=cz+Math.sin(a)*rad;row.push([x,H(x,z)-2.2*(1-sstep(R0,R0*1.45,rad)),z]);}ring.push(row);}
  mbGrid(g,ring,null,[0,0,0],MID.matte);return g3Mesh(g);}
