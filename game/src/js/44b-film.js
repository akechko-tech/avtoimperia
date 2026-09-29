/* ================= КИНО В ГОНКЕ: заставка перед стартом, загрузка, повтор финиша ================= */
// Перед стартом — короткий фильм о гонке: вид сверху на старт, самое интересное впереди (город, мост, горы, примета),
// стартовая решётка с фаворитами и ваша машина. На финише — повтор последних секунд с придорожных камер и замедление на линии.
const FILM={};
function filmEl(){return document.getElementById('rFilm');}
// Загрузка (первая гонка — фото-материалы ≈8 МБ; дальше — только постройка трассы)
function raceLoadUI(on){const el=filmEl();if(!el||!R)return;const rc=R.rc;
  if(on){el.hidden=false;el.className='r-film loading';el.innerHTML=`<div class="rf-bar top"></div><div class="rf-bar bot"></div>
    <div class="rf-card"><div class="rf-kick">${esc(hostName(rc.c))} · ${MONTHS[rc.m]} ${rc.y}</div><div class="rf-big">${esc(rc.name)}</div>
    <div class="rf-load"><i></i></div><div class="rf-sub">${TX.st===2?'Готовим трассу…':'Первая гонка: загружаем фото-материалы — минутку'}</div></div>`;
    document.getElementById('raceScreen').classList.add('filming');}
  else{el.hidden=true;el.innerHTML='';document.getElementById('raceScreen').classList.remove('filming');}}
/* ---------- камера кадра по точкам: глаз, цель, угол зрения ---------- */
function r3dCamSet(eye,look,fov,W,H,near){const f=v3n([look[0]-eye[0],look[1]-eye[1],look[2]-eye[2]]),rt=v3n(v3x([0,1,0],f)),up=v3x(f,rt),asp=W/H;
  let vf=fov||0.9;if(asp<1)vf=2*Math.atan(Math.tan(vf/2)/Math.max(0.45,asp)*0.95);vf=Math.min(1.5,vf);
  R3.eye=eye;R3.camR=rt;R3.camU=up;R3.camF=f;R3.camTarget=look;
  const P=R3.P||(R3.P=m4()),V=R3.V||(R3.V=m4()),VP=R3.VP||(R3.VP=m4());m4persp(P,vf,asp,near||0.3,1500);m4view(V,eye,rt,up,f);m4mul(VP,P,V);R3.fr=frustumOf(VP,R3.fr);}
const ease=u=>u*u*(3-2*u);
const lerp3=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
// Точка трассы на расстоянии d метров от индекса i (с высотой дороги)
function trkAt(i,d,off){const T=R.trk,n=T.n,j=T.closed?(((i+Math.round(d/T.step))%n)+n)%n:clamp(i+Math.round(d/T.step),0,n-1),p=T.pts[j],nn=T.N[j],o=off||0;return {j,p:[p[0]+nn[0]*o,p[1]+(R3.on?roadY(j,clamp(o,-T.W/2,T.W/2)):p[1]),p[2]+nn[1]*o],t:T.T[j],n:nn};}
// Место для камеры у обочины: рядом нет дерева, столба или дома
function camSpot(i,d,sd,offs){const T=R.trk;for(const o of offs||[3.4,5,7.5,10,13])for(const s2 of [sd,-sd]){const a=trkAt(i,d,s2*(T.W/2+o)),L=(T.segCol&&T.segCol[a.j])||[];if(L.some(q=>Math.hypot(q.x-a.p[0],q.z-a.p[2])<(q.r||1)+1.6))continue;return a;}return trkAt(i,d,sd*(T.W/2+4));}
/* ---------- заставка перед стартом ---------- */
// Самое интересное впереди: примета, мост, переезд, город, серпантин — или первый крутой поворот
function filmPOI(){const T=R.trk,n=T.n,s0=T.startIdx,lim=T.closed?n:Math.min(n-1,T.finishIdx),out=[];
  (T.seg||[]).forEach(sg=>{if(sg.cap&&sg.i>s0+30&&sg.i<lim)out.push({i:sg.i,cap:sg.cap,w:sg.w||2,alt:sg.alt||30});});
  (T.lm||[]).forEach(q=>{const nm=LM_NAME[q.t];if(nm&&q.i>s0+20)out.push({i:q.i,cap:nm,w:3,alt:45});});
  if(!out.length&&T.town){for(let i=s0+40;i<lim;i++)if(T.town[i]){out.push({i:i+8,cap:'Городок на пути: мостовая, зрители, узкие улицы',w:1,alt:22});break;}}
  if(!out.length){let bi=-1,bk=0;for(let i=s0+60;i<Math.min(lim,s0+900);i++){const k=Math.abs(T.K[i]||0);if(k>bk){bk=k;bi=i;}}if(bi>0)out.push({i:bi,cap:bk>1/25?'Крутой поворот — здесь многие вылетали':'Длинная дуга: держите скорость',w:1,alt:28});}
  out.sort((a,b)=>b.w-a.w||a.i-b.i);const first=out[0];if(!first)return null;
  first.at=!T.closed&&first.i>T.finishIdx-60?'на финише':first.i-s0<120?'сразу после старта':'впереди';return first;}
const LM_NAME={eiffel:'Париж, Эйфелева башня — старт у заставы',bigben:'Лондон: Вестминстер',gate_spb:'Петербург: Триумфальные ворота',kremlin:'Москва: Кремль',church_ru:'Сельская церковь у тракта',mill_ru:'Ветряная мельница',
  trophy:'Ла-Тюрби: римский трофей над Монако',observatory:'Вершина Ванту: обсерватория',viaduct:'Земмеринг: каменный виадук',castle:'Замок над дорогой',pagoda:'Индианаполис: пагода судей',funkturm:'Берлин: радиобашня',
  obelisk:'Обелиск на площади',round_tower:'Круглая башня',minaret:'Триполи: минарет',casino:'Монте-Карло: казино'};
function filmFavorites(){const L=R.cars.filter(c=>!c.you).slice().sort((a,b)=>b.q-a.q).slice(0,2);return L.map(c=>`${c.drvName||c.label} · ${c.name}${c.label&&c.label!==c.name?' «'+c.label+'»':''}`);}
function filmStart(){if(!R||!R.gl||R.mode==='sim'){driveTipsAtStart();return;}
  let n=0;try{n=+localStorage.getItem('avt-film')||0;}catch(_){}
  const T=R.trk,rc=R.rc,cfg=T.cfg,W=R.wx||{mood:'clear'},s0=T.startIdx,me=R.follow,poi=filmPOI(),shots=[];
  const sp=trkAt(s0,0),fw=[sp.t[0],0,sp.t[1]],side=[sp.n[0],0,sp.n[1]];
  // 1) над стартом: высоко сзади — плавно вниз к машинам
  shots.push({d:4.6,cap:{kick:`${hostName(rc.c)} · ${MONTHS[rc.m]} ${rc.y}`,big:rc.name,sub:`${fmtN(rc.km)} км · ${terrName(cfg)} · ${WX_NAME[W.mood]||''}${W.rain?', дождь':''}`},
    cam:u=>{const e=ease(u),a=trkAt(s0,-150+70*e,-40+25*e),look=trkAt(s0,40+30*e);return {eye:[a.p[0],a.p[1]+95-60*e,a.p[2]],look:[look.p[0],look.p[1]+2,look.p[2]],fov:0.85};}});
  // 2) самое интересное впереди: пролёт вдоль дороги
  if(poi){const i=poi.i;shots.push({d:4.2,cap:{kick:poi.at,mid:poi.cap},poi:i,
    cam:u=>{const e=ease(u),a=trkAt(i,-90+80*e,18),b=trkAt(i,-40+80*e,0);return {eye:[a.p[0],a.p[1]+poi.alt*(1-0.35*e),a.p[2]],look:[b.p[0],b.p[1]+3,b.p[2]],fov:0.9};}});}
  // 3) стартовая решётка: камера идёт вдоль машин
  const grid=R.cars.slice().sort((a,b)=>b.prog-a.prog),back=grid[grid.length-1],front=grid[0];
  const favs=filmFavorites();
  shots.push({d:4,cap:{kick:'Стартовая решётка',list:favs.length?['Фавориты:',...favs]:[]},
    cam:u=>{const e=ease(u),A=[back.x-fw[0]*6,0,back.z-fw[2]*6],B=[front.x+fw[0]*4,0,front.z+fw[2]*4],P=lerp3(A,B,e),o=T.W/2+3.5,eye=[P[0]+side[0]*o,sp.p[1]+1.25,P[2]+side[2]*o],lk=[P[0]+fw[0]*7-side[0]*1.5,sp.p[1]+0.8,P[2]+fw[2]*7-side[2]*1.5];return {eye,look:lk,fov:0.75,near:0.1};}});
  // 4) ваша машина крупно
  const who=me.player?`Вы — ${PIONEERS[G.pioneer].name}`:(me.drvName||me.label),car=me.label||me.name;
  shots.push({d:3.4,cap:{kick:`№${me.num}`,mid:`${who}${car?' · «'+car+'»':''}`},
    cam:u=>{const e=ease(u),a=Math.atan2(fw[0],fw[2])+0.9+1.5*e,rr=5.2-0.8*e,eye=[me.x+Math.sin(a)*rr,me.y+1.1+0.6*e,me.z+Math.cos(a)*rr];return {eye,look:[me.x,me.y+0.7,me.z],fov:0.72,near:0.1};}});
  R.film={t:0,i:-1,shots,total:shots.reduce((a,s)=>a+s.d,0)};R.hold=true;R3.camHook=filmCam;
  // куски трассы у интересного места — построить заранее
  if(poi){const k0=Math.floor((poi.i-40)/R3CH),k1=Math.floor((poi.i+40)/R3CH);for(let k=k0;k<=k1;k++){const kk=T.closed?((k%R3.nCh)+R3.nCh)%R3.nCh:k;if(kk>=0&&kk<R3.nCh&&!R3.chunks[kk]){const ch=r3dChunk(kk);if(ch)R3.chunks[kk]=ch;}}}
  const el=filmEl();el.hidden=false;el.className='r-film';el.innerHTML=`<div class="rf-bar top"></div><div class="rf-bar bot"></div><div class="rf-card" id="rfCard"></div><button class="rf-skip" id="rfSkip">Пропустить ▸▸</button>`;
  document.getElementById('raceScreen').classList.add('filming');document.getElementById('rfSkip').onclick=filmSkip;el.onclick=e=>{if(e.target===el)filmSkip();};
  auReelFanfare();
  if(reelVoiceOn()&&n<6){const say=`${rc.name}. ${rc.y} год.${rc.hist?' '+String(rc.hist).split(/(?<=[.!?])\s/)[0]:''}`;setTimeout(()=>{if(R&&R.film)ttsSay(say);},500);}
  try{localStorage.setItem('avt-film',n+1);}catch(_){}}
function filmCaption(c){const el=document.getElementById('rfCard');if(!el)return;
  el.classList.remove('in');void el.offsetWidth;
  el.innerHTML=(c.kick?`<div class="rf-kick">${esc(c.kick)}</div>`:'')+(c.big?`<div class="rf-big">${esc(c.big)}</div>`:'')+(c.mid?`<div class="rf-mid">${esc(c.mid)}</div>`:'')+(c.sub?`<div class="rf-sub">${esc(c.sub)}</div>`:'')+(c.list&&c.list.length?`<div class="rf-list">${c.list.map((x,i)=>`<div${i?'':' class="h"'}>${esc(x)}</div>`).join('')}</div>`:'');
  el.classList.add('in');}
function filmCam(dt,W,H){const F=R.film;if(!F){R3.camHook=null;return;}F.t+=dt;let acc=0,i=0;for(;i<F.shots.length;i++){if(F.t<acc+F.shots[i].d)break;acc+=F.shots[i].d;}
  if(i>=F.shots.length){filmEnd();r3dCamera(dt,W,H);return;}
  const sh=F.shots[i];if(i!==F.i){F.i=i;filmCaption(sh.cap);}
  const u=clamp((F.t-acc)/sh.d,0,1),c=sh.cam(u);
  // камера не уходит под землю
  const g=fH(c.eye[0],c.eye[2])+0.6;if(c.eye[1]<g)c.eye[1]=g;
  r3dCamSet(c.eye,c.look,c.fov,W,H,c.near);R3.cam=null;}
function filmSkip(){if(R&&R.film)filmEnd();}
function filmEnd(){if(!R)return;R.film=null;if(R3.camHook===filmCam)R3.camHook=null;R3.camTarget=null;R3.cam=null;R.hold=false;R.lastT=performance.now();ttsStop();
  const el=filmEl();if(el){el.hidden=true;el.innerHTML='';el.onclick=null;}document.getElementById('raceScreen').classList.remove('filming');driveTipsAtStart();}
/* ---------- повтор финиша: последние ~12 секунд записываются, камеры у дороги, замедление на линии ---------- */
const RPL_HZ=15,RPL_SEC=13,RPL_F=11;
function replayRec(dt){if(!R||!R.gl||R.replay||R.film||R.t<=0||R.mode!=='drive')return;const P=R.rpl||(R.rpl={buf:new Float32Array(RPL_HZ*RPL_SEC*R.cars.length*RPL_F),n:0,head:0,acc:0,cap:RPL_HZ*RPL_SEC,times:new Float32Array(RPL_HZ*RPL_SEC)});
  P.acc+=dt;if(P.acc<1/RPL_HZ)return;P.acc=0;const k=P.head,b=P.buf,nc=R.cars.length;
  R.cars.forEach((c,ci)=>{const o=(k*nc+ci)*RPL_F;b[o]=c.x;b[o+1]=c.z;b[o+2]=c.yaw;b[o+3]=c.idx;b[o+4]=c.segT||0;b[o+5]=c.lat;b[o+6]=c.vx;b[o+7]=c.r;b[o+8]=c.delta||0;b[o+9]=c.brk||0;b[o+10]=c.slipR||0;});
  P.times[k]=R.time;P.head=(k+1)%P.cap;P.n=Math.min(P.cap,P.n+1);}
function replayApply(tm){const P=R.rpl,nc=R.cars.length,b=P.buf;let a=-1,bb=-1;
  for(let q=0;q<P.n;q++){const k=(P.head-P.n+q+P.cap)%P.cap;if(P.times[k]<=tm)a=k;else{bb=k;break;}}
  if(a<0)a=(P.head-P.n+P.cap)%P.cap;if(bb<0)bb=a;const t0=P.times[a],t1=P.times[bb],u=t1>t0?clamp((tm-t0)/(t1-t0),0,1):0;
  R.cars.forEach((c,ci)=>{const o=(a*nc+ci)*RPL_F,o2=(bb*nc+ci)*RPL_F;c.x=b[o]+(b[o2]-b[o])*u;c.z=b[o+1]+(b[o2+1]-b[o+1])*u;c.yaw=b[o+2]+angWrap(b[o2+2]-b[o+2])*u;
    c.idx=u<0.5?b[o+3]:b[o2+3];c.segT=u<0.5?b[o+4]:b[o2+4];c.lat=b[o+5]+(b[o2+5]-b[o+5])*u;c.vx=b[o+6]+(b[o2+6]-b[o+6])*u;c.r=b[o+7];c.delta=b[o+8];c.brk=b[o+9];c.slipR=b[o+10];});}
function replayStart(){const me=R&&R.me;if(!R||!R.gl||!me||!R.rpl||R.rpl.n<RPL_HZ*4||R.replay)return false;
  const P=R.rpl,t1=P.times[(P.head-1+P.cap)%P.cap],tFin=me.fin,t0=Math.max(P.times[(P.head-P.n+P.cap)%P.cap],tFin-9.5);
  // сохранить настоящее положение машин (итог гонки считается по нему)
  R.rplSave=R.cars.map(c=>({x:c.x,z:c.z,yaw:c.yaw,idx:c.idx,segT:c.segT,lat:c.lat,vx:c.vx,r:c.r,delta:c.delta,brk:c.brk,slipR:c.slipR}));
  const T=R.trk,fi=T.finishIdx;
  // камеры: две у дороги по пути к финишу, последняя — у самой линии (замедление)
  R.replay={t:t0,t0,t1:Math.min(t1,tFin+1.6),fin:tFin,cut:-1};R.hold=true;R3.camHook=replayCam;
  const el=filmEl();el.hidden=false;el.className='r-film replay';const pos=raceOrder().indexOf(me)+1;
  el.innerHTML=`<div class="rf-bar top"></div><div class="rf-bar bot"></div><div class="rf-rec">● ПОВТОР</div><div class="rf-card in" id="rfCard"><div class="rf-kick">${pos}-е место · ${fmtRaceTime(tFin)}</div></div><button class="rf-skip" id="rfSkip">Итоги ▸▸</button>`;
  document.getElementById('raceScreen').classList.add('filming');document.getElementById('rfSkip').onclick=replayEnd;return true;}
function fmtRaceTime(t){const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(1).replace('.',',');}
function replayCam(dt,W,H){const Rp=R.replay;if(!Rp){R3.camHook=null;return;}const me=R.me;
  // у линии финиша — замедление
  const slow=Math.abs(Rp.t-Rp.fin)<1.2?0.35:1;Rp.t+=dt*slow;if(Rp.t>=Rp.t1){replayEnd();return;}
  replayApply(Rp.t);
  // смена камеры по времени: 0 — у дороги впереди, 1 — низко спереди, 2 — у финишной линии
  const left=Rp.fin-Rp.t,cut=left>5.5?0:left>2.2?1:2;
  if(cut!==Rp.cut){Rp.cut=cut;const T=R.trk,sd=Math.random()<0.5?1:-1;
    if(cut===0){const a=camSpot(me.idx,55,sd);Rp.pos=[a.p[0],a.p[1]+1.6,a.p[2]];Rp.fov=0.42;}
    else if(cut===1){Rp.pos=null;Rp.fov=0.7;}
    else{const f=camSpot(T.finishIdx,4,sd,[3.2,4.5,6,8]);Rp.pos=[f.p[0],f.p[1]+1.1,f.p[2]];Rp.fov=0.6;}}
  const st=me.v3,y=st&&st.y!==null?st.y:me.y,tg=[me.x,y+0.8,me.z];let eye;
  if(cut===1){const fw=[Math.sin(me.yaw),0,Math.cos(me.yaw)],rt=[fw[2],0,-fw[0]];eye=[me.x+fw[0]*7+rt[0]*2.2,y+0.7,me.z+fw[2]*7+rt[2]*2.2];}
  else eye=Rp.pos;
  const g=fH(eye[0],eye[2])+0.5;if(eye[1]<g)eye[1]=g;
  r3dCamSet(eye,tg,Rp.fov,W,H,0.1);R3.cam=null;}
function replayEnd(){if(!R||!R.replay)return;R.replay=null;if(R3.camHook===replayCam)R3.camHook=null;R3.camTarget=null;
  if(R.rplSave)R.cars.forEach((c,i)=>Object.assign(c,R.rplSave[i]));
  const el=filmEl();if(el){el.hidden=true;el.innerHTML='';}document.getElementById('raceScreen').classList.remove('filming');R.hold=false;finishRace(false);}
