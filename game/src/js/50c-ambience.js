/* ================= Звуки мира в гонке — как их слышит гонщик =================
   Записи с Викисклада (общественное достояние и свободные лицензии): трибуны, зрители у дороги, аплодисменты, птицы по месту
   и времени суток, колокола, собаки, петухи, повозки, духовой оркестр, паровоз, дождь, гром, река, овцы; прибой — синтез.
   0.20: всё слышно с места гонщика. У каждого звука есть источник на трассе: трибуна, кучка зрителей, церковь, хутор с собакой
   и петухом, повозка, река у моста, море, оркестр, громкоговоритель (рупор) у трибун, жандарм, отара, поезд, соседи по гонке.
   Громкость — по расстоянию (−6 дБ на каждое удвоение, шкала для игры помягче), даль срезает верхи, сзади — глуше, панорама — по
   тому, куда смотрит машина. Шум кабины (мотор, ветер, шины) закрывает тихие звуки: на скорости птиц не слышно, мимо зрителей —
   короткий всплеск криков, у трибун — рёв. Птицы, насекомые и дождь — «разлиты» вокруг: их сила — от того, что вокруг машины
   (лес, город, село, поле) и от часа. В тоннеле внешний мир почти глохнет.
   Рожки и клаксоны соседей по гонке — синтез: груша-рожок (1890–1900-е), «а-у-га» Klaxon (с 1908), электрический сигнал (1920-е).
   Диктор говорит в рупор (до 1922) или в громкоговорители (позже) — его слышно, только когда машина у трибун или у старта. */
const AMB={idx:null,loadP:null,buf:{},pend:{},beds:{},shots:[],bus:null,on:false,E:null,cd:{},seen:{},t:0,lis:null,ann:{buf:{},pend:{},busy:0,q:[],said:{}}};
const SFX_REMOTE=()=>(location.protocol==='file:'?VOICE_REMOTE:'');
// указатель звуков — с сайта игры; без сети гонка идёт без записей, а через минуту (новая гонка) пробуем снова
function ambIndex(){if(AMB.idx)return Promise.resolve(AMB.idx);if(AMB.loadP)return AMB.loadP;
  if(AMB.failT&&Date.now()-AMB.failT<60000)return Promise.resolve({});
  AMB.loadP=new Promise(res=>{if(window.SFX_INDEX){AMB.idx=window.SFX_INDEX;res(AMB.idx);return;}
    const fail=()=>{AMB.loadP=null;AMB.failT=Date.now();res({});};
    try{const s=document.createElement('script');s.src=SFX_REMOTE()+'sfx/index.js';s.async=true;
      s.onload=()=>{AMB.idx=window.SFX_INDEX||{};AMB.failT=0;res(AMB.idx);};s.onerror=()=>{s.remove();fail();};document.head.appendChild(s);}catch(e){fail();}});
  return AMB.loadP;}
// звук по имени: скачать и разобрать один раз
function ambBuf(id){if(AMB.buf[id])return Promise.resolve(AMB.buf[id]);if(AMB.pend[id])return AMB.pend[id];if(!AU.ctx)return Promise.resolve(null);
  AMB.pend[id]=ambIndex().then(ix=>{if(!ix||!ix[id])return null;return fetch(SFX_REMOTE()+'sfx/'+id+'.mp3').then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab?new Promise((ok,no)=>AU.ctx.decodeAudioData(ab,ok,no)):null);})
    .then(b=>{if(b)AMB.buf[id]=ambLoopable(b);else delete AMB.pend[id];return AMB.buf[id]||null;}).catch(()=>{delete AMB.pend[id];return null;});return AMB.pend[id];}
// петля без щелчка: хвост плавно переходит в начало
function ambLoopable(b){try{const n=b.length,x=Math.min(Math.floor(b.sampleRate*0.6),Math.floor(n/4));if(n<b.sampleRate*3)return b;
  const out=AU.ctx.createBuffer(b.numberOfChannels,n-x,b.sampleRate);for(let ch=0;ch<b.numberOfChannels;ch++){const s=b.getChannelData(ch),d=out.getChannelData(ch);
    for(let i=0;i<n-x;i++)d[i]=s[i];for(let i=0;i<x;i++){const k=i/x;d[i]=s[i]*k+s[n-x+i]*(1-k);}}return out;}catch(_){return b;}}
// прибой (синтез): гул волн с медленными накатами — у дорог вдоль моря и на пляжах
function ambSurfBuf(){if(AMB.buf.surf)return AMB.buf.surf;const c=AU.ctx,sr=c.sampleRate,T=13.5,n=Math.round(sr*T),b=c.createBuffer(1,n,sr),d=b.getChannelData(0);
  const W=[[0,1],[4.4,0.75],[8.6,0.9],[11.3,0.45]];let a=0,l1=0,l2=0,h=0,pk=0;
  for(let i=0;i<n;i++){const t=i/sr;let e=0.22;for(const [t0,k] of W){let q=t-t0;if(q<0)q+=T;e+=k*(q<1.3?Math.pow(q/1.3,2):Math.exp(-(q-1.3)/1.7));}
    const w=Math.random()*2-1;a=a*0.985+w*0.15;l1+=(a-l1)*0.09;l2+=(w-l2)*0.35;h=w-l2;// гул и шипение пены
    const v=(l1*1.6+h*0.18*Math.min(1,e))*e;d[i]=v;pk=Math.max(pk,Math.abs(v));}
  for(let i=0;i<n;i++)d[i]*=0.5/pk;return AMB.buf.surf=ambLoopable(b);}

/* ---------- слух гонщика: уровень у уха, даль, панорама, шум кабины ---------- */
// Уровни источников, дБ на расстоянии 1 м (по живым замерам, округлённо): трибуна — сотни людей, кучка зрителей — 5 человек на фигуру
const AMB_L={stand:95,standCheer:107,crowd:66,crowdCheer:84,bells:118,dog:96,rooster:100,horse:80,stream:82,surf:86,band:104,pa:102,paLoud:108,gend:102,sheep:88,train:110,whistle:128,horn:104,fanfare:106,applause:103};
// шум в кабине у уха (дБ): ветер в открытой машине, мотор, шины
function ambNoise(me){const v=Math.abs(me.vx||0),rpm=clamp(me.rpm||0,0,1.1),thr=me.thr||0,on=!(me.dnf&&v<0.5);
  const Lw=v>1?62+37.7*Math.log10(Math.max(v,1.5)/10):36,Le=on?57+13*rpm+5*thr:30,Lr=v>1?48+20*Math.log10(Math.max(v,1.5)/10)+(me.off?6:0):30;
  return 10*Math.log10(Math.pow(10,Lw/10)+Math.pow(10,Le/10)+Math.pow(10,Lr/10));}
// уровень у уха → громкость в миксе: шкала вдвое мягче настоящей (дальнее тише, но различимо)
function ambLvl(L){return Math.pow(10,(L-92)/34);}
// маскировка: звук на 11 дБ тише шума кабины слышен вполовину, на 20 — почти пропадает, громче шума — целиком
function ambMask(A){return 1/(1+Math.exp(-(A+11)/5));}
// что слышно от источника с уровнем L (дБ на 1 м) в точке x,z; r0 — размер источника (ближе не громче)
function ambHear(L,x,z,r0){const Ls=AMB.lis;if(!Ls)return {g:0,pan:0,lp:16000,d:1e9,Lr:0};const dx=x-Ls.x,dz=z-Ls.z,d=Math.hypot(dx,dz)+0.001;
  const Lr=L-20*Math.log10(Math.max(d,r0||1))-0.004*d-Ls.occ;
  let lp=clamp(16000*Math.exp(-d/350),700,16000);if(Ls.occ>0.5)lp=Math.min(lp,700+15000*Math.exp(-Ls.occ/4));
  if((dx*Ls.fx+dz*Ls.fz)/d<-0.3)lp*=0.72;// позади головы — глуше
  return {g:Math.min(0.85,ambLvl(Lr)*ambMask(Lr-Ls.N)),pan:clamp((dx*Ls.rx+dz*Ls.rz)/d,-1,1)*0.85,lp,d,Lr};}
// «разлитый» звук (птицы, сверчки): уровень у уха уже задан
function ambHearD(L){const Ls=AMB.lis;if(!Ls||L<=0)return 0;const Lr=L-Ls.occ*1.2;return ambLvl(Lr)*ambMask(Lr-Ls.N);}
// ближайшая точка протяжённого источника (трибуны вдоль дороги, река, берег)
function ambNearPt(e,x,z){if(!e.P)return e;let b=e.P[0],bd=1e18;for(const p of e.P){const d=(p[0]-x)*(p[0]-x)+(p[1]-z)*(p[1]-z);if(d<bd){bd=d;b=p;}}return {x:b[0],z:b[1]};}
// сумма по источникам одного звука (энергией): громкость, панорама и даль — по самым слышным
function ambAgg(list,L,r0,cull){const Ls=AMB.lis;let e2=0,pw=0,lw=0;if(!Ls)return {g:0,pan:0,lp:16000};
  for(const e of list){const dx=e.x-Ls.x,dz=e.z-Ls.z,R0=cull+(e.rad||0);if(dx*dx+dz*dz>R0*R0)continue;const p=e.P?ambNearPt(e,Ls.x,Ls.z):e;
    const h=ambHear(typeof L==='function'?L(e):L,p.x,p.z,e.r0||r0),w=h.g*h.g;e2+=w;pw+=w*h.pan;lw+=w*h.lp;}
  return e2>1e-9?{g:Math.sqrt(e2),pan:pw/e2,lp:lw/e2}:{g:0,pan:0,lp:16000};}

/* ---------- источники звука на трассе ---------- */
const AMB_TREE=new Set(['plane','poplar','oak','cypress','olive','pine','fir','birch','elm','palm']);
const AMB_FARM=new Set(['farm_fr','house_fr','house_it','fachwerk','cottage','pub','farm_us','barn','izba','cottage_ie','house_ly','mill_ru','windmill_us']);
const AMB_CHURCH=new Set(['church','campanile','church_uk','church_us','church_at','church_ru']);
function ambEmitters(T){const n=T.n,W=T.W,S=T.segT||new Uint8Array(n),cfg=T.cfg||{},set=SCEN_SETS[cfg.host]||{};
  let sd=(n*7919+(T.rc&&T.rc.y||1900)*31)%2147483646+1;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
  const wrap=i=>T.closed?((i%n)+n)%n:clamp(i,0,n-1);
  const at=(i,off)=>{i=wrap(i);const p=T.pts[i],nn=T.N[i];return [p[0]+nn[0]*off,p[2]+nn[1]*off];};
  const pos=(i,it)=>it.wx!==undefined?[it.wx,it.wz]:at(i,it.off||0);
  const E={stand:[],crowd:[],church:[],farm:[],cart:[],river:[],sea:[],band:[],pa:[],gend:[],flock:[],
    tree:new Float32Array(n),town:new Float32Array(n),vill:new Float32Array(n),alley:new Float32Array(n)};
  let cur=null,seaP=[],id=0;
  for(let i=0;i<n;i++){const L=(T.spr&&T.spr[i])||[];let tr=0;
    for(const it of L){const t=it.t;
      if(AMB_TREE.has(t)){if(Math.abs(it.off||0)<48)tr++;}
      else if(t==='stand'){const p=pos(i,it);E.stand.push({x:p[0],z:p[1],i,id:id++,r0:8});}
      else if(it.k==='p'&&t==='crowd'){const p=pos(i,it);
        if(cur&&i-cur.i1<8&&Math.hypot(p[0]-cur.x,p[1]-cur.z)<20){cur.n++;cur.sx+=p[0];cur.sz+=p[1];cur.x=cur.sx/cur.n;cur.z=cur.sz/cur.n;cur.i1=i;cur.i=(cur.i0+i)>>1;}
        else{cur={x:p[0],z:p[1],sx:p[0],sz:p[1],n:1,i0:i,i1:i,i,id:id++};E.crowd.push(cur);}}
      else if(AMB_CHURCH.has(t)){const p=pos(i,it);E.church.push({x:p[0],z:p[1],i,id:id++,city:!!(T.town&&T.town[i])});}
      else if(AMB_FARM.has(t)&&!(T.town&&T.town[i])){const p=pos(i,it);E.farm.push({x:p[0],z:p[1],i,id:id++,dog:rnd()<0.45,cock:rnd()<0.4});}
      else if(t==='cart'){const p=pos(i,it);E.cart.push({x:p[0],z:p[1],i,id:id++,r0:2});}
      else if(t==='gend'){const p=pos(i,it);E.gend.push({x:p[0],z:p[1],i,id:id++});}
      else if(t==='sea'&&i%6===0)seaP.push(at(i,it.off+(it.off>0?10:-10)));}
    E.tree[i]=tr;E.town[i]=T.town&&T.town[i]?1:0;E.vill[i]=S[i]===RSEG.village?1:0;E.alley[i]=S[i]===RSEG.avenue?1:0;}
  // кучка зрителей: 5 человек на фигуру; гул и крики — от числа людей
  E.crowd.forEach(g=>{const k=10*Math.log10(g.n*5);g.L=AMB_L.crowd+k;g.Lc=AMB_L.crowdCheer+k;g.r0=3+Math.min(8,g.n);delete g.sx;delete g.sz;});
  // церкви-приметы (кремль, русская церковь)
  (T.lm||[]).forEach(q=>{if(/church|kremlin|cathedral/.test(q.t))E.church.push({x:q.x,z:q.z,i:q.i,id:id++,city:q.t==='kremlin'});});
  // река у моста: русло петляет, как на картинке
  (T.rivers||[]).forEach(rv=>{if(typeof riverLine!=='function')return;const Lr=riverLine(T,rv),P=[];const ss=(a,b,x)=>{const q=clamp((x-a)/(b-a),0,1);return q*q*(3-2*q);};
    for(let s=-240;s<=240;s+=12){const k=ss(20,120,Math.abs(s)),m=Math.sin(s/170+rv.ph)*22*k+Math.sin(s/61+rv.ph*2)*6*k;P.push([Lr.p[0]+Lr.d[0]*s+Lr.t[0]*m,Lr.p[2]+Lr.d[1]*s+Lr.t[1]*m]);}
    E.river.push({P,x:Lr.p[0],z:Lr.p[2],rad:260,r0:(rv.w||14)/2+2,id:id++});});
  // море: дорога вдоль берега и пляжи
  (T.coast||[]).forEach(c=>{const P=[];for(let i=c.i0;i<=c.i1;i+=6)P.push(at(i,c.side*(W/2+24)));if(P.length)seaP=seaP.concat(P);});
  if(seaP.length){for(let k=0;k<seaP.length;k+=40){const P=seaP.slice(k,k+40);let cx=0,cz=0;P.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=P.length;cz/=P.length;
    const rad=Math.max(...P.map(p=>Math.hypot(p[0]-cx,p[1]-cz)));E.sea.push({P,x:cx,z:cz,rad,r0:6,id:id++});}}
  // старт, финиш: громкоговоритель (рупор), оркестр
  const fi=T.finishIdx,si=T.startIdx,big=T.closed||(cfg.crowd||0)>0.3;
  const nearStand=i=>{let b=null,bd=1e9;E.stand.forEach(s=>{let d=Math.abs(s.i-i);if(T.closed)d=Math.min(d,n-d);if(d<bd){bd=d;b=s;}});return bd<40?b:null;};
  {const st=nearStand(fi),p=st?at(st.i,-(W/2+15)):at(fi,-(W/2+8));E.pa.push({x:p[0],z:p[1],i:fi,fin:1});}
  if(!T.closed){const p=at(si,W/2+7);E.pa.push({x:p[0],z:p[1],i:si,start:1});}
  if(big&&E.stand.length){const p=at(fi+7,-(W/2+22));E.band.push({x:p[0],z:p[1],i:fi,id:id++,fin:1});}
  if(!T.closed&&(cfg.crowd||0)>0.3){const p=at(si+5,W/2+16);E.band.push({x:p[0],z:p[1],i:si,id:id++});}
  // городской оркестр — на самой длинной улице
  if((cfg.crowd||0)>0.2&&T.town){let bi=-1,bl=0,s0=-1;for(let i=0;i<=n;i++){const tw=i<n&&T.town[i];if(tw&&s0<0)s0=i;if(!tw&&s0>=0){if(i-s0>bl){bl=i-s0;bi=s0;}s0=-1;}}
    if(bl>=60){const m=bi+(bl>>1),p=at(m,(rnd()<0.5?-1:1)*(W/2+10));E.band.push({x:p[0],z:p[1],i:m,id:id++});}}
  // горные пастбища: отары вдали от дороги (летом)
  const mountain=cfg.terr==='mount'||cfg.uphill||set.mount;
  if(mountain&&!cfg.oval)for(let i=20;i<n-20;i+=90){const sg=S[i];if(sg===RSEG.town||sg===RSEG.village||sg===RSEG.tunnel||sg===RSEG.bridge||(T.town&&T.town[i]))continue;
    if(rnd()<0.55){const side=sg===RSEG.serp?(T.K[i]>0?1:-1):(rnd()<0.5?-1:1),p=at(i,side*(W/2+55+rnd()*60));E.flock.push({x:p[0],z:p[1],i,id:id++});}}
  // что вокруг: лес, город, село, аллеи, поле (сглажено на ±40–60 м)
  const sm=(a,k)=>{const o=new Float32Array(n);for(let i=0;i<n;i++){let s=0,w=0;for(let d=-k;d<=k;d++){let j=i+d;if(T.closed)j=((j%n)+n)%n;else if(j<0||j>=n)continue;const q=1-Math.abs(d)/(k+1);s+=a[j]*q;w+=q;}o[i]=w?s/w:0;}return o;};
  E.treeD=sm(E.tree,10).map(v=>clamp(v/1.6,0,1));E.townD=sm(E.town,15);E.villD=sm(E.vill,15);E.alleyD=sm(E.alley,10);
  E.openD=new Float32Array(n);for(let i=0;i<n;i++)E.openD[i]=(T.tunAt&&T.tunAt[i])?0:clamp(1-E.treeD[i]*1.3-E.townD[i]-E.villD[i]*0.7,0,1);
  // быстрый поиск по месту на трассе (корзины по 8 точек = 32 м)
  const bucket=L=>{const M=new Map();L.forEach(e=>{const k=e.i>>3;if(!M.has(k))M.set(k,[]);M.get(k).push(e);});return M;};
  E.crowdAt=bucket(E.crowd);E.farmAt=bucket(E.farm);E.gendAt=bucket(E.gend);
  return E;}
// источники рядом с точкой трассы i (±k корзин)
function ambEach(M,i,k,fn){const T=R.trk,nb=Math.ceil(T.n/8),b=i>>3;for(let q=-k;q<=k;q++){let j=b+q;if(T.closed)j=((j%nb)+nb)%nb;const L=M.get(j);if(L)L.forEach(fn);}}

/* ---------- голоса: фоновые петли и разовые звуки с места ---------- */
// цепочка: громкость → даль (срез верхов) → панорама → общая шина звуков мира
function ambChain(){const c=AU.ctx,g=c.createGain(),f=c.createBiquadFilter(),p=c.createStereoPanner?c.createStereoPanner():null;g.gain.value=0;f.type='lowpass';f.frequency.value=16000;f.Q.value=0.5;
  g.connect(f);if(p){f.connect(p);p.connect(AMB.bus);}else f.connect(AMB.bus);return {g,f,p};}
function ambBed(id,vol,dt,pan,lp){const B=AMB.beds[id]||(AMB.beds[id]={id,ch:null,src:null,v:0,idle:0});B.v=vol;const c=AU.ctx;
  if(vol>0.003&&!B.src&&!B.loading){const b=AMB.buf[id];if(b){const ch=ambChain(),s=c.createBufferSource();s.buffer=b;s.loop=true;s.connect(ch.g);s.start(0,Math.random()*b.duration);B.src=s;B.ch=ch;}
    else{B.loading=1;ambBuf(id).then(()=>{B.loading=0;});}}
  if(B.ch){const t=c.currentTime;B.ch.g.gain.setTargetAtTime(vol,t,0.25);B.ch.f.frequency.setTargetAtTime(clamp(lp||16000,300,18000),t,0.2);if(B.ch.p)B.ch.p.pan.setTargetAtTime(clamp(pan||0,-1,1),t,0.15);
    if(vol<0.003){B.idle+=dt;if(B.idle>6){try{B.src.stop();}catch(_){}B.src=null;try{B.ch.g.disconnect();B.ch.f.disconnect();if(B.ch.p)B.ch.p.disconnect();}catch(_){}B.ch=null;B.idle=0;}}else B.idle=0;}}
// разовый звук с места: pos — точка [x,z] или функция (движется — поезд); o: off/dur — кусок записи, fade, delay, trim, r0, force (играть, даже если пока не слышно)
function ambTrack(inp,pos,L,o,t1,stopNode){const P=typeof pos==='function'?pos():pos;if(!P)return null;const h=ambHear(L,P[0],P[1],o.r0),trim=o.trim||1;
  if(h.g*trim<0.004&&!o.force)return null;
  if(AMB.shots.length>=12){let q=null;AMB.shots.forEach(s=>{if(!q||s.gv<q.gv)q=s;});if(!q||q.gv>h.g*trim)return null;ambShotEnd(q,0.15);}
  const ch=ambChain(),c=AU.ctx,t=c.currentTime;ch.g.gain.value=h.g*trim;ch.f.frequency.value=h.lp;if(ch.p)ch.p.pan.value=h.pan;inp.connect(ch.g);
  const S={ch,inp,pos,L,r0:o.r0,trim,gv:h.g*trim,t1,stop:stopNode};AMB.shots.push(S);return S;}
function ambShotEnd(S,fade){const c=AU.ctx,t=c.currentTime;const i=AMB.shots.indexOf(S);if(i>=0)AMB.shots.splice(i,1);try{S.ch.g.gain.setTargetAtTime(0,t,fade||0.1);}catch(_){}
  setTimeout(()=>{try{if(S.stop)S.stop.stop();}catch(_){}try{S.inp.disconnect();S.ch.g.disconnect();S.ch.f.disconnect();if(S.ch.p)S.ch.p.disconnect();}catch(_){}},Math.max(200,(fade||0.1)*5000));}
function ambShot(id,pos,L,o){o=o||{};const b=AMB.buf[id];if(!b){ambBuf(id);return null;}if(!AU.ctx||!AMB.bus)return null;const c=AU.ctx;
  const off=clamp(o.off||0,0,Math.max(0,b.duration-0.5)),dur=Math.min(o.dur||b.duration,b.duration-off),fd=Math.min(o.fade||0.06,dur/3),t0=c.currentTime+(o.delay||0);
  const s=c.createBufferSource(),env=c.createGain();s.buffer=b;if(o.rate)s.playbackRate.value=o.rate;s.connect(env);
  env.gain.setValueAtTime(0,t0);env.gain.linearRampToValueAtTime(1,t0+fd);env.gain.setValueAtTime(1,t0+Math.max(fd,dur-fd));env.gain.linearRampToValueAtTime(0,t0+dur);
  const S=ambTrack(env,pos,L,o,t0+dur,s);if(!S){try{s.disconnect();}catch(_){}return null;}S.id=id;
  s.start(t0,off,dur+0.05);s.onended=()=>{const i=AMB.shots.indexOf(S);if(i>=0)ambShotEnd(S,0.05);};return S;}
// старые вызовы: звук без места (у самого гонщика)
function ambOnce(id,vol,pan,rate){const b=AMB.buf[id];if(!b){ambBuf(id);return false;}const c=AU.ctx,s=c.createBufferSource(),g=c.createGain();s.buffer=b;if(rate)s.playbackRate.value=rate;g.gain.value=vol;
  let out=g;if(c.createStereoPanner&&pan){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);out=p;}out.connect(AMB.bus||AU.fx);s.connect(g);s.start();return true;}
// разовые звуки следуют за гонщиком: громкость, даль и панорама обновляются каждый кадр
function ambShotsTick(){const t=AU.ctx.currentTime;for(const S of AMB.shots.slice()){if(t>S.t1+0.3){ambShotEnd(S,0.05);continue;}const P=typeof S.pos==='function'?S.pos():S.pos;if(!P)continue;
  const h=ambHear(S.L,P[0],P[1],S.r0);S.gv=h.g*S.trim;S.ch.g.gain.setTargetAtTime(S.gv,t,0.08);S.ch.f.frequency.setTargetAtTime(h.lp,t,0.1);if(S.ch.p)S.ch.p.pan.setTargetAtTime(h.pan,t,0.08);}}
function ambCool(key,sec){const t=AU.ctx?AU.ctx.currentTime:AMB.t;if((AMB.cd[key]||-1e9)>t)return false;AMB.cd[key]=t+sec;return true;}

/* ---------- рожки, клаксоны, свисток жандарма (синтез) ---------- */
function hornSfx(y,vol,pan,lp){if(!AU.ctx||!AU.on.sfx||vol<0.004)return;const c=AU.ctx,t=c.currentTime,g=c.createGain(),f=c.createBiquadFilter(),o=c.createOscillator();let out=g;
  if(lp&&lp<15000){const l=c.createBiquadFilter();l.type='lowpass';l.frequency.value=lp;out.connect(l);out=l;}
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan||0,-1,1);out.connect(p);out=p;}out.connect(AMB.bus||AU.fx);
  if(y<1908){// груша-рожок: язычок и раструб — «ба-ап», с понижением тона
    o.type='sawtooth';const f0=330+Math.random()*60;o.frequency.setValueAtTime(f0*1.08,t);o.frequency.exponentialRampToValueAtTime(f0*0.93,t+0.32);f.type='bandpass';f.frequency.value=900;f.Q.value=2.5;
    o.connect(f);f.connect(g);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.03);g.gain.setValueAtTime(vol,t+0.22);g.gain.exponentialRampToValueAtTime(0.0001,t+0.4);o.start(t);o.stop(t+0.45);
    if(Math.random()<0.5){const o2=c.createOscillator();o2.type='sawtooth';o2.frequency.setValueAtTime(f0*1.1,t+0.5);o2.frequency.exponentialRampToValueAtTime(f0*0.95,t+0.75);o2.connect(f);o2.start(t+0.5);o2.stop(t+0.8);g.gain.setValueAtTime(0.0001,t+0.48);g.gain.exponentialRampToValueAtTime(vol*0.9,t+0.52);g.gain.exponentialRampToValueAtTime(0.0001,t+0.8);}}
  else if(y<1922){// Klaxon: мотор трёт мембрану — «а-у-га» с подъёмом и спадом
    o.type='sawtooth';o.frequency.setValueAtTime(180,t);o.frequency.linearRampToValueAtTime(420,t+0.25);o.frequency.setValueAtTime(420,t+0.5);o.frequency.linearRampToValueAtTime(330,t+0.75);
    const lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=38;lg.gain.value=35;lf.connect(lg);lg.connect(o.frequency);f.type='bandpass';f.frequency.value=1100;f.Q.value=1.6;
    o.connect(f);f.connect(g);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.08);g.gain.setValueAtTime(vol,t+0.65);g.gain.exponentialRampToValueAtTime(0.0001,t+0.85);o.start(t);lf.start(t);o.stop(t+0.9);lf.stop(t+0.9);}
  else{// электрический сигнал: два тона, короткие гудки
    const o2=c.createOscillator();o.type='square';o2.type='square';o.frequency.value=392;o2.frequency.value=494;f.type='lowpass';f.frequency.value=2400;o.connect(f);o2.connect(f);f.connect(g);
    [0,0.28].forEach(d=>{g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(vol*0.6,t+d+0.02);g.gain.setValueAtTime(vol*0.6,t+d+0.18);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.22);});
    o.start(t);o2.start(t);o.stop(t+0.55);o2.stop(t+0.55);}}
// свисток жандарма: «фьють-фьють — фью-у-у» с трелью горошины
function whistleSfx(h){if(!AU.ctx||!AU.on.sfx||!h||h.g<0.006)return;const c=AU.ctx,t=c.currentTime,o=c.createOscillator(),lf=c.createOscillator(),lg=c.createGain(),g=c.createGain(),f=c.createBiquadFilter();
  let out=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=h.pan;g.connect(p);out=p;}out.connect(AMB.bus||AU.fx);
  const f0=2750+Math.random()*350;o.type='sine';o.frequency.value=f0;lf.type='triangle';lf.frequency.value=26+Math.random()*8;lg.gain.value=f0*0.05;lf.connect(lg);lg.connect(o.frequency);
  f.type='lowpass';f.frequency.value=Math.max(1500,h.lp);o.connect(f);f.connect(g);const v=Math.min(0.35,h.g*0.8);g.gain.value=0;
  [[0,0.16],[0.26,0.16],[0.55,0.75]].forEach(([d,l])=>{g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(v,t+d+0.02);g.gain.setValueAtTime(v,t+d+l-0.04);g.gain.exponentialRampToValueAtTime(0.0001,t+d+l);});
  o.start(t);lf.start(t);o.stop(t+1.4);lf.stop(t+1.4);}

/* ---------- диктор: рупор у трибун, в 1920-е — громкоговорители ---------- */
// Строки диктора (голос eugene) — их записывает конвейер голоса (tools/export_voice.js)
const ANN={ready:'Внимание! Приготовиться!',count:'Три! Два! Один!',go:'Марш!',last:'Последний круг!',crash:'Авария на трассе!',rain:'Дождь! Будьте осторожны на поворотах!',
  fin:'Финиш!',overtake:'Какой обгон!',pits:'Машина заходит в боксы.',crowd:'Зрители, освободите дорогу!',pace:'Машина-лидер уходит с трассы. Старт с хода!',lemans:'Гонщики, к машинам!',
  neutral:'Нейтрализация! Сбавьте ход!',record:'Лучший круг гонки!',night:'Зажигайте фонари!'};
const ANN_NUM=['','первый','второй','третий','четвёртый','пятый','шестой','седьмой','восьмой','девятый','десятый','одиннадцатый','двенадцатый','тринадцатый','четырнадцатый','пятнадцатый','шестнадцатый','семнадцатый','восемнадцатый','девятнадцатый','двадцатый',
  'двадцать первый','двадцать второй','двадцать третий','двадцать четвёртый','двадцать пятый','двадцать шестой','двадцать седьмой','двадцать восьмой','двадцать девятый','тридцатый'];
const annGo=n=>`Номер ${ANN_NUM[n]||n} — пошёл!`,annLead=n=>`Лидирует ${ANN_NUM[n]||n} номер!`,annWin=n=>`Победитель — ${ANN_NUM[n]||n} номер!`;
function annLines(){const L=Object.values(ANN);for(let k=1;k<=30;k++)L.push(annGo(k),annLead(k),annWin(k));return L;}
function annBuf(text){const A=AMB.ann,h=voiceHash(text,'eugene');if(A.buf[h])return Promise.resolve(A.buf[h]);if(A.pend[h])return A.pend[h];if(!AU.ctx)return Promise.resolve(null);
  A.pend[h]=voiceLoad().then(()=>{if(!voiceDur(text,'eugene'))return null;return fetch(voiceUrl(text,'eugene')).then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab?new Promise((ok,no)=>AU.ctx.decodeAudioData(ab,ok,no)):null);})
    .then(b=>{if(b)A.buf[h]=b;return b;}).catch(()=>null);return A.pend[h];}
// цепочка рупора: полоса 450–3600 Гц, «жесть» раструба, перегруз, эхо трибун
function annChain(radio){const c=AU.ctx,hp=c.createBiquadFilter(),pk=c.createBiquadFilter(),lp=c.createBiquadFilter(),ws=c.createWaveShaper(),g=c.createGain(),dl=c.createDelay(0.5),fb=c.createGain(),wet=c.createGain();
  hp.type='highpass';hp.frequency.value=radio?280:480;pk.type='peaking';pk.frequency.value=radio?1800:2100;pk.Q.value=1.2;pk.gain.value=radio?4:8;lp.type='lowpass';lp.frequency.value=radio?3400:3900;
  const cur=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;cur[i]=Math.tanh(x*(radio?1.6:2.6))/Math.tanh(radio?1.6:2.6);}ws.curve=cur;
  hp.connect(pk);pk.connect(lp);lp.connect(ws);ws.connect(g);dl.delayTime.value=radio?0.05:0.16;fb.gain.value=radio?0.1:0.32;wet.gain.value=radio?0.08:0.3;g.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);
  return {inp:hp,g,wet};}
// фраза из рупора или громкоговорителя в точке pos; не слышно — не говорим
function annPlay(text,L,pos,radio){if(!AU.ctx||!AU.on.sfx||!R||R.mode==='sim'||!AMB.on||!pos)return;const A=AMB.ann;if(radio===undefined)radio=R.rc.y>=1922;
  annBuf(text).then(b=>{if(!b||!AU.ctx||!R||!AMB.on)return;const c=AU.ctx,t=c.currentTime;if(A.busy>t+0.1)return;if(ambHear(L,pos[0],pos[1],3).g<0.02)return;
    const s=c.createBufferSource();s.buffer=b;const ch=annChain(radio),out=c.createGain();out.gain.value=1.4;s.connect(ch.inp);ch.g.connect(out);ch.wet.connect(out);
    const S=ambTrack(out,pos,L,{r0:3,force:1},t+b.duration+0.8,s);if(!S)return;A.busy=t+b.duration;s.start(t);});}
// ближайший громкоговоритель и как его слышно сейчас
function ambPA(){const E=AMB.E;if(!E||!E.pa.length||!AMB.lis||!R)return null;const L=R.rc.y>=1922?AMB_L.paLoud:AMB_L.pa;let best=null;
  for(const e of E.pa){const h=ambHear(L,e.x,e.z,3);if(!best||h.g>best.h.g)best={e,h,L};}return best;}
function annVol(){const p=ambPA();return p?p.h.g:0;}
function annCall(key,num){if(!R||!AMB.on)return;const p=ambPA();if(!p||p.h.g<0.03)return;
  const text=key==='go_n'?annGo(num):key==='lead'?annLead(num):key==='win'?annWin(num):ANN[key];if(text)annPlay(text,p.L,[p.e.x,p.e.z]);}
// титры с голосом: рассказчик кинохроники (живой голос, если записан) — это закадровый голос, не звук трассы
function annSay(text,kind){if(!R||R.mode==='sim'||!AU.on.sfx||!reelVoiceOn())return;try{const say=scnSpeech(text);if(voiceDur(say,'aidar')&&!(VOICE.cb))voiceSay(say,'aidar');}catch(_){}}

/* ---------- гонка: старт, такт, стоп ---------- */
// слушатель — гонщик в кабине: где он, куда смотрит, какой шум вокруг
function ambListen(me,dt){const Ls=AMB.lis||(AMB.lis={x:0,z:0,fx:0,fz:1,rx:1,rz:0,N:60,occ:0,tk:0});Ls.x=me.x;Ls.z=me.z;const s=Math.sin(me.yaw||0),c=Math.cos(me.yaw||0);Ls.fx=s;Ls.fz=c;Ls.rx=c;Ls.rz=-s;
  Ls.tk+=((me.tun?1:0)-Ls.tk)*Math.min(1,(dt||0)*3);Ls.occ=22*Ls.tk;
  // моторы соседей рядом (стартовая решётка, обгон) тоже заглушают мир
  let pw=Math.pow(10,ambNoise(me)/10);if(R&&R.cars)for(const c of R.cars){if(c===me||c.dnf)continue;const d=Math.hypot(c.x-me.x,c.z-me.z);if(d>40)continue;
    pw+=Math.pow(10,(54+13*clamp(c.rpm||0,0,1.1)+5*(c.thr||0)-20*Math.log10(Math.max(d,2)/2))/10);}
  Ls.N=10*Math.log10(pw)+5*Ls.tk;Ls.idx=me.idx;return Ls;}
function ambStart(){if(!AU.ctx||!R||R.mode==='sim')return;ambIndex();const c=AU.ctx;if(AMB.bus){try{AMB.bus.disconnect();}catch(_){}}
  AMB.bus=c.createGain();AMB.bus.gain.value=1;AMB.bus.connect(AU.fx);AMB.beds={};AMB.shots=[];AMB.cd={};AMB.seen={};AMB.on=true;AMB.t=0;AMB.lastLead=null;AMB.lapSaid={};AMB.hPrev=undefined;AMB.lastPos=undefined;AMB.rainSaid=0;AMB.elP=undefined;
  try{AMB.E=ambEmitters(R.trk);}catch(e){console.warn('amb',e);AMB.E=null;}
  const me=R.follow||R.me;if(me)ambListen(me,0);
  // заранее — то, что есть на этой трассе
  const E=AMB.E,want=['rain'];if(E){if(E.stand.length)want.push('crowd_big','crowd_race','applause');if(E.crowd.length)want.push('crowd_murmur','crowd_race');if(E.farm.length)want.push('dog_bark');
    if(E.church.length)want.push('bells_village');if(E.river.length)want.push('stream');if(E.band.length)want.push('brass_parade');if(E.cart.length)want.push('horse_carriage');}
  if(R.trk.rails&&R.trk.rails.length)want.push('steam_train',R.trk.cfg.host==='us'?'steam_whistle_us':'steam_whistle');
  want.forEach(id=>ambBuf(id));if(E&&E.sea.length)try{ambSurfBuf();}catch(_){}
  const L=[ANN.ready,ANN.count,ANN.go];if(R.me)L.push(annGo(R.me.num||1));L.forEach(t=>annBuf(t));}
function ambStop(){AMB.on=false;const t=AU.ctx?AU.ctx.currentTime:0;Object.values(AMB.beds).forEach(B=>{if(B.ch){B.ch.g.gain.setTargetAtTime(0,t,0.3);const s=B.src;setTimeout(()=>{try{s.stop();}catch(_){}},1500);}});AMB.beds={};
  AMB.shots.slice().forEach(S=>ambShotEnd(S,0.3));AMB.shots=[];}
function ambTick(dt){if(!AMB.on||!R||!AU.ctx)return;const T=R.trk,me=R.follow||R.me,E=AMB.E;if(!me||!E)return;AMB.t+=dt;const S=R.scn,y=R.rc.y,mon=(R.rc.m??5),t=AU.ctx.currentTime;
  const Ls=ambListen(me,dt),i=clamp(me.idx|0,0,T.n-1),sp=Math.abs(me.vx||0),rain=R.rainK||0;
  const hh=S?((scnHour()%24)+24)%24:12,el=S?scnSun(hh,mon,S.lat||47).el*57.3:40,night=el<-4,dawn=!night&&el<12&&hh<12,dusk=!night&&el<14&&hh>=12,day=!night&&!dawn;
  const summer=mon>=3&&mon<=8,south=['it','ly','es','mc'].includes(T.cfg.host),mountain=T.cfg.terr==='mount'||T.cfg.uphill||(SCEN_SETS[T.cfg.host]||{}).mount;
  /* птицы и насекомые: сила — от того, что вокруг машины; уровень — у уха; тише в дождь; шум кабины их закрывает */
  const tD=E.treeD[i],toD=E.townD[i],vD=E.villD[i],aD=E.alleyD[i],oD=E.openD[i],hush=1-0.85*rain,db=k=>k>0.02?10*Math.log10(k):-99;
  // записи птиц и насекомых тише прочих по природе — поднимаем (громкость, не уровень: шум кабины их всё так же закрывает)
  const dif=(id,on,Lmax,k,dk,tr)=>ambBed(id,on&&k>0.02?(tr||2.6)*ambHearD(Lmax+db(k*(dk===undefined?hush:dk))):0,dt,0,16000);
  dif('birds_dawn',dawn,60,Math.max(tD,0.7*vD,0.5*aD,0.35*oD,0.4*toD));
  dif('birds_town',dawn,56,Math.max(toD,0.8*vD));
  dif('birds_forest',day,58,Math.min(1,tD+0.4*aD));
  dif('sparrows',day&&!dusk,55,Math.max(toD,0.8*vD));
  dif('blackbird',dawn||dusk,56,Math.max(aD,0.7*vD,0.5*toD,0.4*tD));
  dif('skylark',day&&mon>=3&&mon<=6&&el>10&&!T.cfg.oval,54,oD);
  dif('cuckoo',day&&mon>=3&&mon<=6,56,tD*(mountain?1:0.6));
  dif('cicada',south&&mon>=5&&mon<=8&&hh>=10&&hh<=19&&el>20,64,Math.max(0.9*tD,0.5*oD,0.6*vD),1-rain,2.2);
  dif('crickets',(night||(dusk&&el<2))&&mon>=4&&mon<=8,55,Math.max(oD,vD,0.5*tD),1-0.7*rain,2.2);
  // дождь — на гонщике и машине (не «где-то»): от силы дождя, под сводом тоннеля почти не слышен
  ambBed('rain',rain>0.05?(0.25+0.55*rain)*(1-0.8*Ls.tk):0,dt,0,16000);
  if(rain>0.7&&Ls.tk<0.5&&ambCool('thunder',25+Math.random()*30)){const D=500+Math.random()*4500,a=Math.random()*6.283,x=Ls.x+Math.sin(a)*D,z=Ls.z+Math.cos(a)*D;
    ambShot('thunder',[x,z],87-14*Math.log10(D/500)+20*Math.log10(D)+0.004*D,{fade:0.3,force:1});}// у уха: 87 дБ за 500 м, 73 — за 5 км
  /* источники с местом: трибуны, зрители, повозки, река, море, поезд */
  {const a=ambAgg(E.stand,AMB_L.stand,8,600);ambBed('crowd_big',a.g,dt,a.pan,a.lp);}
  {const a=ambAgg(E.crowd,g=>g.L,3,150);ambBed('crowd_murmur',a.g,dt,a.pan,a.lp);}
  {const a=ambAgg(E.cart,AMB_L.horse,2,120);ambBed('horse_carriage',night?0:a.g,dt,a.pan,a.lp);}
  {const a=ambAgg(E.river,AMB_L.stream,6,400);ambBed('stream',a.g,dt,a.pan,a.lp);}
  if(E.sea.length){const a=ambAgg(E.sea,AMB_L.surf,6,900);ambBed('surf',a.g,dt,a.pan,a.lp);}
  {let best=null;if(T.rails&&typeof railLine==='function')T.rails.forEach(rl=>{const st=rl.st;if(!st||st.state!==1)return;const Ln=railLine(T,rl),s=st.s-st.dir*5,h=ambHear(AMB_L.train,Ln.p[0]+Ln.d[0]*s,Ln.p[2]+Ln.d[1]*s,3);if(!best||h.g>best.g)best=h;});
    ambBed('steam_train',best?best.g:0,dt,best?best.pan:0,best?best.lp:16000);}
  /* события вокруг: кто проезжает мимо — тому кричат, лают, свистят */
  const near=[];for(const c of R.cars){if(c.dnf||c.wait)continue;if(Math.hypot(c.x-Ls.x,c.z-Ls.z)<240)near.push(c);}
  // трибуны ревут, когда мимо проносится машина
  // крик начинается чуть раньше, чем машина поравняется (зрители видят её издали) — на скорости порог дальше
  const ahead=(c,x,z,r)=>{const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz),v=Math.abs(c.vx||0);if(d<r)return true;return d<Math.max(r,v*1.3)&&dx*Math.sin(c.yaw||0)+dz*Math.cos(c.yaw||0)>0;};
  // своя машина — первой; чужие — только если их крик отсюда слышно (иначе не тратим голоса и паузы)
  if(near.indexOf(me)>0){near.splice(near.indexOf(me),1);near.unshift(me);}
  for(const e of E.stand){for(const c of near){const own=c===me;if(Math.abs(c.vx||0)<7||!ahead(c,e.x,e.z,30))continue;if(!own&&ambHear(AMB_L.standCheer,e.x,e.z,8).g<0.01)continue;
    if(ambCool('st'+e.id,4+Math.random()*2)&&ambCool('stAny',own?0.8:1.6))ambShot('crowd_race',[e.x,e.z],AMB_L.standCheer,{off:Math.random()*28,dur:4+Math.random()*3,fade:0.5,r0:8,force:own});break;}}
  // зрители у дороги — короткий всплеск криков, когда машина рядом
  for(const c of near){if(Math.abs(c.vx||0)<6)continue;const own=c===me;ambEach(E.crowdAt,c.idx|0,2,g=>{if(!ahead(c,g.x,g.z,24)||(!own&&ambHear(g.Lc,g.x,g.z,g.r0).g<0.01))return;
    if(ambCool('cg'+g.id,9)&&ambCool(own?'cgMe':'cgAny',own?0.5:0.9))ambShot('crowd_race',[g.x,g.z],g.Lc,{off:Math.random()*30,dur:2.2+Math.random()*1.8,fade:0.18,r0:g.r0,force:own});});}
  // хутора: собака лает на машину, утром кричит петух
  // (своя машина проедет мимо — звук начинаем, даже если пока тихо: громкость догонит)
  for(const c of near)ambEach(E.farmAt,c.idx|0,2,f=>{if(f.dog&&Math.hypot(c.x-f.x,c.z-f.z)<55&&(c===me||ambHear(AMB_L.dog,f.x,f.z,1).g>=0.01)&&ambCool('dog'+f.id,35))ambShot('dog_bark',[f.x,f.z],AMB_L.dog,{off:Math.random()*10,dur:1.6+Math.random()*2.2,delay:0.2+Math.random()*0.8,force:c===me});});
  if(!night&&hh>4.5&&hh<10.5&&ambCool('cockT',1.5))for(const f of E.farm){if(!f.cock||Math.hypot(f.x-Ls.x,f.z-Ls.z)>380)continue;if(Math.random()<0.035&&ambCool('cock'+f.id,40)){ambShot('rooster',[f.x,f.z],AMB_L.rooster,{});break;}}
  // колокола: «Ангел Господень» в 6, 12 и 18 часов по часам гонки — все церкви в округе; и звон, когда гонка идёт мимо
  {const hp=AMB.hPrev;AMB.hPrev=hh;let ang=false;if(S&&hp!==undefined)for(const a of [6,12,18])if(hp<a&&hh>=a)ang=true;
    for(const ch of E.church){const d=Math.hypot(ch.x-Ls.x,ch.z-Ls.z),id=ch.city?'bells_city':'bells_village';
      if(ang&&d<1800)ambShot(id,[ch.x,ch.z],AMB_L.bells,{off:Math.random()*30,dur:16,fade:2,force:1,r0:6});
      else if(d<300&&!AMB.seen['ch'+ch.id]){AMB.seen['ch'+ch.id]=1;if(Math.random()<0.4&&ambCool('bells',50))ambShot(id,[ch.x,ch.z],AMB_L.bells,{off:Math.random()*30,dur:14+Math.random()*8,fade:1.5,force:1,r0:6});}}}
  // отары на горных пастбищах
  if(summer&&!night&&ambCool('sheepT',2))for(const f of E.flock){if(Math.hypot(f.x-Ls.x,f.z-Ls.z)>240)continue;if(Math.random()<0.18&&ambCool('sheep'+f.id,14)){ambShot('sheep',[f.x,f.z],AMB_L.sheep,{off:Math.random()*22,dur:3+Math.random()*3,fade:0.4,r0:10});break;}}
  // жандарм свистит, когда машина подлетает
  if(sp>8)ambEach(E.gendAt,i,2,g=>{const dx=g.x-Ls.x,dz=g.z-Ls.z,d=Math.hypot(dx,dz);if(d<70&&dx*Ls.fx+dz*Ls.fz>0&&ambCool('gd'+g.id,90)&&Math.random()<0.25&&ambCool('gdAny',20))whistleSfx(ambHear(AMB_L.gend,g.x,g.z,1));});
  // оркестр: играет, отдыхает, снова играет (ночью и в дождь молчит)
  for(const b of E.band){if(night||rain>0.4||Math.hypot(b.x-Ls.x,b.z-Ls.z)>700)continue;if(t>=(b.next||0)){b.next=t+27+15+Math.random()*35;ambShot('brass_parade',[b.x,b.z],AMB_L.band,{fade:1.2,force:1,r0:4});}}
  // соседи сигналят: догоняют и просят дорогу — клаксон слышен оттуда, где машина
  for(const c of R.cars){if(c===me||c.dnf||c.wait)continue;const dg=me.prog-c.prog;if(dg>3&&dg<14&&c.vx>me.vx+1.5&&Math.abs(c.lat-me.lat)<2.2&&ambCool('horn'+c.num,7)&&Math.random()<0.5){const h=ambHear(AMB_L.horn,c.x,c.z,1);hornSfx(y,Math.min(0.55,h.g),h.pan,h.lp);}}
  // толпа прямо на дороге (Париж — Мадрид): механик жмёт грушу рожка, жандарм кричит в рупор
  if(S&&S.crowdRoad&&sp>10){let g=null;ambEach(E.crowdAt,i+6,1,q=>{const dx=q.x-Ls.x,dz=q.z-Ls.z;if(dx*Ls.fx+dz*Ls.fz>5&&Math.hypot(dx,dz)<45)g=q;});
    if(g&&ambCool('road',18)){if(Math.random()<0.5)hornSfx(y,0.22,0);let gd=null;ambEach(E.gendAt,i,3,q=>{if(!gd&&Math.hypot(q.x-Ls.x,q.z-Ls.z)<90)gd=q;});const src=gd||g;if(Math.random()<0.4)annPlay(ANN.crowd,AMB_L.gend,[src.x,src.z],false);}}
  // комментатор у трибун: смена лидера, обгон, дождь, сумерки — если рядом громкоговоритель
  AMB.ot=(AMB.ot||0)+dt;if(AMB.ot>0.5&&R.t>3){AMB.ot=0;const ord=raceOrder(),lead=ord[0],pos=ord.indexOf(me);
    if(lead&&AMB.lastLead&&lead!==AMB.lastLead&&!lead.wait&&ambCool('leadc',18))annCall('lead',lead.num);AMB.lastLead=lead;
    if(AMB.lastPos!==undefined&&pos>=0&&pos<AMB.lastPos&&R.me===me&&ambCool('ovt',15))annCall('overtake');AMB.lastPos=pos;
    if(rain>0.3&&!AMB.rainSaid){AMB.rainSaid=1;annCall('rain');}if(rain<0.1)AMB.rainSaid=0;
    if(S&&el<1&&AMB.elP>=1&&S.span>=6)annCall('night');AMB.elP=el;
    // проезжаем трибуны — диктор говорит, кто ведёт
    const p=ambPA();if(p&&p.h.g>0.05&&lead&&!lead.wait&&t>AMB.ann.busy+6&&ambCool('paSay',24))annCall('lead',lead.num);}
  // диктор: лидер на круге (у трибун), последний круг
  if(T.closed&&R.t>2){const ord=raceOrder(),lead=ord[0];if(lead&&lead.lap>=1&&!AMB.lapSaid[lead.lap]&&lead.idx<40){AMB.lapSaid[lead.lap]=1;if(lead.lap===T.cfg.laps-1)annCall('last');else annCall('lead',lead.num);}}
  ambShotsTick();}
// место на трассе для событий старта и финиша: трибуна у линии или сама линия
function ambSpot(k){const T=R.trk,E=AMB.E,i=k==='start'?T.startIdx:T.finishIdx;let b=null,bd=1e9;
  if(E)E.stand.forEach(s=>{let d=Math.abs(s.i-i);if(T.closed)d=Math.min(d,T.n-d);if(d<bd){bd=d;b=s;}});
  if(b&&bd<50)return [b.x,b.z];const p=T.pts[clamp(i,0,T.n-1)],nn=T.N[clamp(i,0,T.n-1)];return [p[0]+nn[0]*(T.W/2+6),p[2]+nn[1]*(T.W/2+6)];}
// поезд даёт гудок у переезда — слышно оттуда, где паровоз (без записи — синтез, громкость по расстоянию)
function ambTrainWhistle(rl){if(!AMB.on||!AU.ctx||!R)return false;const T=R.trk,us=T.cfg.host==='us',id=us&&AMB.buf.steam_whistle_us?'steam_whistle_us':'steam_whistle';
  const pos=()=>{const st=rl.st;if(!st||typeof railLine!=='function')return null;const Ln=railLine(T,rl),s=st.s-st.dir*6;return [Ln.p[0]+Ln.d[0]*s,Ln.p[2]+Ln.d[1]*s];};
  if(AMB.buf[id]){ambShot(id,pos,AMB_L.whistle,{dur:us?6:4.5,fade:0.2,force:1,r0:3});return true;}
  ambBuf(id);const P=pos();if(!P)return false;const h=ambHear(AMB_L.whistle,P[0],P[1],3);try{auSfx('whistle',clamp(h.g*1.3,0,1));}catch(_){}return true;}
// авария соседа: удар слышно оттуда, где он (рядом — громко, вдали — глухо или никак); у трибун диктор объявит
function ambCrash(c,imp,kind){if(!AMB.on||!AU.ctx||!AMB.lis||!R)return;const h=ambHear(108+Math.min(12,imp*0.4),c.x,c.z,2),v=clamp(h.g*1.4,0,1);
  if(v>0.015){auSfx('crash',v);if(kind==='tree'||kind==='fence'||kind==='cart')auSfx('wood',v);}if(imp>10&&ambCool('crashA',20))annCall('crash');}
// трибуны встречают (финиш, старт с хода)
function ambCheer(v){if(!AMB.on||!R||!AMB.buf.crowd_race)return false;if(!ambCool('cheerF',2))return true;const p=ambSpot('finish');
  ambShot('crowd_race',p,AMB_L.standCheer,{off:Math.random()*25,dur:6,fade:0.8,force:1,r0:8,trim:v||1});return true;}
// рёв трибун на старте: трибуна у линии или зрители рядом
function ambRoar(){const T=R.trk,E=AMB.E;if(!E)return;const p=ambSpot('start'),d=Math.hypot(p[0]-T.pts[T.startIdx][0],p[1]-T.pts[T.startIdx][2]);
  if(E.stand.length&&d<60){ambShot('crowd_big',p,AMB_L.standCheer,{off:Math.random()*40,dur:7,fade:0.7,force:1,r0:8});return;}
  let n=0;ambEach(E.crowdAt,T.startIdx,2,g=>{if(n<2){n++;ambShot('crowd_race',[g.x,g.z],g.Lc,{off:Math.random()*30,dur:4,fade:0.5,force:1,r0:g.r0});}});}
// события гонки → звук
function ambEvent(k,arg){if(!AMB.on||!AU.ctx||!R)return;const y=R.rc.y,E=AMB.E,me=R.follow||R.me;
  if(k==='start'){if(!R.scn||R.scn.st==='grid')setTimeout(()=>annCall('go'),50);
    // соседи по решётке сигналят — слышно от их машин
    const oth=R.cars.filter(c=>c!==me&&!c.wait&&!c.dnf);[0,1].forEach(q=>{const c=oth[Math.floor(Math.random()*oth.length)];if(c&&Math.random()<0.6)setTimeout(()=>{if(!AMB.on)return;const h=ambHear(AMB_L.horn,c.x,c.z,1);hornSfx(y,Math.min(0.5,h.g),h.pan,h.lp);},500+q*600+Math.random()*400);});
    ambRoar();}
  if(k==='countdown')annCall('count');
  if(k==='ready')annCall(R.scn&&R.scn.st==='lemans'?'lemans':'ready');
  if(k==='finish'){const p=ambSpot('finish');ambShot('applause',p,AMB_L.applause,{off:Math.random()*20,dur:9,fade:1.2,force:1,r0:8});
    if(arg&&arg.win){const b=E&&E.band.find(x=>x.fin),q=b?[b.x,b.z]:p;ambShot('fanfare',q,AMB_L.fanfare,{dur:14,fade:1.5,force:1,r0:4});}
    setTimeout(()=>{if(!R)return;const w=raceOrder()[0];if(w)annCall('win',w.num);else annCall('fin');},900);}
  if(k==='crash')annCall('crash');}
