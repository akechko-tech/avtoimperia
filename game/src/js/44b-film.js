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
// Плавная точка трассы (дробный индекс, кривая Катмулла — Рома): для пролётов камеры — без ступенек между точками трассы
function trkSmooth(i,d,off){const T=R.trk,n=T.n,f=i+d/T.step,j0=Math.floor(f),u=f-j0,o=off||0,idx=j=>T.closed?((j%n)+n)%n:clamp(j,0,n-1);
  const P=j=>{const q=idx(j),p=T.pts[q],nn=T.N[q];return [p[0]+nn[0]*o,p[1],p[2]+nn[1]*o];},a=P(j0-1),b=P(j0),c=P(j0+1),e=P(j0+2),u2=u*u,u3=u2*u;
  const cr=k=>0.5*(2*b[k]+(-a[k]+c[k])*u+(2*a[k]-5*b[k]+4*c[k]-e[k])*u2+(-a[k]+3*b[k]-3*c[k]+e[k])*u3);
  const t0=T.T[idx(j0)],t1=T.T[idx(j0+1)],t=[t0[0]+(t1[0]-t0[0])*u,t0[1]+(t1[1]-t0[1])*u],tl=Math.hypot(t[0],t[1])||1;
  return {j:idx(Math.round(f)),p:[cr(0),cr(1),cr(2)],t:[t[0]/tl,t[1]/tl],n:[t[1]/tl,-t[0]/tl]};}
// Место для камеры у обочины: рядом нет дерева, столба или дома
// Кроны и дома у дороги: камера не должна стоять в листве и смотреть сквозь ствол (повтор ночью упирался в дерево)
const CAM_BLOCK={oak:5,plane:5.5,elm:4.5,poplar:2.2,cypress:1.6,olive:3.2,pine:3,fir:2.6,birch:2.6,palm:3,bush:1.6,house_fr:4,farm_fr:4.5,house_it:4,fachwerk:4,cottage:3.8,pub:3.8,farm_us:4.5,barn:5,izba:3.6,church:7,church_us:6,church_uk:6,church_at:6,church_ru:7,cottage_ie:3.8,house_ly:4};
function camFree(a,i,d){const T=R.trk,n=T.n,S=T.spr;if(!S)return true;const st=Math.max(1,Math.round(d/T.step)),j0=a.j,idx=j=>T.closed?((j%n)+n)%n:clamp(j,0,n-1);
  // куда смотрит камера: дорога от машины (i) до самой камеры — три точки на оси
  const tg=[0.25,0.55,0.85].map(u=>{const q=T.pts[idx(i+Math.round(st*u))];return [q[0],q[2]];});
  for(let k=j0-st-4;k<=j0+6;k++){const jj=idx(k),L=S[jj];if(!L||!L.length)continue;const p=T.pts[jj],nn=T.N[jj];
    for(const it of L){const R0=CAM_BLOCK[it.t];if(!R0)continue;const x=it.wx!==undefined?it.wx:p[0]+nn[0]*it.off,z=it.wz!==undefined?it.wz:p[2]+nn[1]*it.off;
      if(Math.hypot(x-a.p[0],z-a.p[2])<R0+1)return false;
      for(const g of tg){const dx=g[0]-a.p[0],dz=g[1]-a.p[2],l2=dx*dx+dz*dz||1,u=clamp(((x-a.p[0])*dx+(z-a.p[2])*dz)/l2,0,1),ex=a.p[0]+dx*u-x,ez=a.p[2]+dz*u-z;if(u>0.05&&u<0.95&&ex*ex+ez*ez<R0*R0*0.5)return false;}}}
  return true;}
function camSpot(i,d,sd,offs){const T=R.trk;for(const o of offs||[3.4,5,7.5,10,13])for(const s2 of [sd,-sd]){const a=trkAt(i,d,s2*(T.W/2+o)),L=colNear(T,a.p[0],a.p[2],3);if(L.some(q=>Math.hypot(q.x-a.p[0],q.z-a.p[2])<(q.r||1)+1.6))continue;if(!camFree(a,i,d))continue;return a;}
  // всюду деревья (лесная дорога, аллея) — свободной обочины нет: пусть снимает камера у машины
  const a=trkAt(i,d,sd*(T.W/2+1.6));a.blocked=1;return a;}
// Какая обочина свободнее вдоль участка (меньше деревьев, столбов и домов): +1 или −1
function filmSide(i0,dI,off){const T=R.trk,sc=[0,0];for(let d=0;d<=dI*T.step+14;d+=3)[1,-1].forEach((sd,k)=>{const a=trkAt(i0,d,sd*off),L=colNear(T,a.p[0],a.p[2],3);if(L.some(q=>Math.hypot(q.x-a.p[0],q.z-a.p[2])<(q.r||1)+1.3))sc[k]++;});return sc[0]<=sc[1]?1:-1;}
// Слова диктора перед стартом: название, год и первая фраза истории гонки (их записал диктор заранее)
// первое предложение описания: не обрывать на сокращениях («по ст. ст.», «г.», «им.»)
function firstSentence(t){t=String(t||'');const re=/[.!?]/g;let m;while((m=re.exec(t))){const i=m.index,rest=t.slice(i+1),prev=t.slice(Math.max(0,i-4),i);
    if(m[0]==='.'&&/(?:^|[\s(])(?:ст|г|гг|т|им|св|ок|см|вв|н\.\s?э)$/i.test(prev))continue;
    if(!rest.trim()||/^[)»"]*\s*([А-ЯЁA-Z«(\d—]|$)/.test(rest))return t.slice(0,i+1)+((rest.match(/^[)»"]*/)||[''])[0]);}
  return t;}
function raceIntroText(rc){const h1=rc.hist?firstSentence(rc.hist):'';return `${rc.name}. ${rc.y} год.${h1?' '+h1:''}`;}
/* ---------- заставка перед стартом ---------- */
// Самое интересное впереди: примета, мост, переезд, город, серпантин — или первый крутой поворот
function filmPOI(){const T=R.trk,n=T.n,s0=T.startIdx,lim=T.closed?n:Math.min(n-1,T.finishIdx),out=[];
  (T.seg||[]).forEach(sg=>{if(sg.cap&&sg.i>s0+30&&sg.i<lim)out.push({i:sg.i,cap:sg.cap,w:sg.w||2,alt:sg.alt||30});});
  (T.lm||[]).forEach(q=>{const nm=q.t==='rlm'?(q.far?'':q.name):LM_NAME[q.t];if(nm&&q.i>s0+20)out.push({i:q.i,cap:nm,w:3,alt:q.t==='rlm'?Math.max(30,Math.min(70,(q.lm.h||20)*1.4)):45});});
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
  // 0) настоящая местность: карта куска маршрута (стилизация под карту эпохи) и приметы впереди — высоко над стартом
  if(T.real){const svg=realMapSVG(T),notes=realNotes(T);if(svg)shots.push({d:5.2,cap:{kick:'По настоящей карте · '+rc.y,map:svg,list:notes.length?['Впереди:',...notes.map(q=>(q.km?q.km.toFixed(1).replace('.',',')+' км — ':'')+q.t)]:[]},
    cam:u=>{const e=ease(u),a=trkSmooth(s0,-260+60*e,-60),look=trkSmooth(s0,160);return {eye:[a.p[0],a.p[1]+210-40*e,a.p[2]],look:[look.p[0],look.p[1],look.p[2]],fov:0.9};}});}
  // 1) над стартом: высоко сзади — плавно вниз к машинам
  const brief=typeof scnBrief==='function'?scnBrief():'',dIn=voiceDur(raceIntroText(rc),'aidar'),dB=brief?voiceDur(brief,'aidar'):0;
  shots.push({d:4.6,cap:{kick:`${hostName(rc.c)} · ${MONTHS[rc.m]} ${rc.y}${R.scn?' · '+scnClockTxt():''}`,big:rc.name,sub:`${fmtN(rc.km)} км · ${terrName(cfg)} · ${WX_NAME[W.mood]||''}${W.rain?', дождь':''}`},
    cam:u=>{const e=ease(u),a=trkSmooth(s0,-150+70*e,-40+25*e),look=trkSmooth(s0,40+30*e);return {eye:[a.p[0],a.p[1]+95-60*e,a.p[2]],look:[look.p[0],look.p[1]+2,look.p[2]],fov:0.85};}});
  // 2) самое интересное впереди: пролёт вдоль дороги
  if(poi){const i=poi.i;shots.push({d:4.2,cap:{kick:poi.at,mid:poi.cap},poi:i,
    cam:u=>{const e=ease(u),a=trkSmooth(i,-90+80*e,18),b=trkSmooth(i,-40+80*e,0);return {eye:[a.p[0],a.p[1]+poi.alt*(1-0.35*e),a.p[2]],look:[b.p[0],b.p[1]+3,b.p[2]],fov:0.9};}});}
  // 2б) как это было: старт по-историческому — высоко над стартом, медленный облёт
  if(brief){const need=Math.max(5,(dIn+dB+1.2)-(shots.reduce((a,x)=>a+x.d,0))-7.8);shots.push({d:Math.min(16,need),cap:{kick:'Как это было',mid:brief},
    cam:u=>{const e=ease(u),a=trkSmooth(s0,-60+30*e,32-20*e),look=trkSmooth(s0,20);return {eye:[a.p[0],a.p[1]+26-8*e,a.p[2]],look:[look.p[0],look.p[1]+1,look.p[2]],fov:0.8};}});}
  // 3) стартовая решётка: камера едет по обочине вдоль машин — по самой трассе (на изгибе тоже), с той стороны, где свободно
  const grid=R.cars.slice().sort((a,b)=>b.prog-a.prog),back=grid[grid.length-1],front=grid[0];
  const favs=filmFavorites(),iB=back.idx,dI=T.closed?((front.idx-iB)%T.n+T.n)%T.n:Math.max(0,front.idx-iB),gLen=dI*T.step+14,gs=filmSide(iB,dI,T.W/2+2.2);
  shots.push({d:4.4,cap:{kick:'Стартовая решётка',list:favs.length?['Фавориты:',...favs]:[]},
    cam:u=>{const e=ease(u),d=-8+gLen*e,a=trkSmooth(iB,d,gs*(T.W/2+2.2)),l=trkSmooth(iB,d+9,-gs*T.W*0.12);a.p[1]+=R3.on?roadY(a.j,0)-R.trk.pts[a.j][1]:0;l.p[1]+=R3.on?roadY(l.j,0)-R.trk.pts[l.j][1]:0;return {eye:[a.p[0],a.p[1]+1.35,a.p[2]],look:[l.p[0],l.p[1]+0.75,l.p[2]],fov:0.78,near:0.1};}});
  // 4) ваша машина крупно
  const who=me.player?`Вы — ${PIONEERS[G.pioneer].name}`:(me.drvName||me.label),car=me.label||me.name;
  shots.push({d:3.4,cap:{kick:`№${me.num}`,mid:`${who}${car?' · «'+car+'»':''}`},
    cam:u=>{const e=ease(u),a=Math.atan2(fw[0],fw[2])+0.9+1.5*e,rr=5.2-0.8*e,eye=[me.x+Math.sin(a)*rr,me.y+1.1+0.6*e,me.z+Math.cos(a)*rr];return {eye,look:[me.x,me.y+0.7,me.z],fov:0.72,near:0.1};}});
  R.film={t:0,i:-1,shots,total:shots.reduce((a,s)=>a+s.d,0)};R.hold=true;R3.camHook=filmCam;
  // куски трассы у интересного места — построить заранее
  // всё, что попадёт в кадр, — построить заранее: иначе на пролёте кадры подвисают и камера идёт рывками
  const pre=(i0,i1)=>{const k0=Math.floor(i0/R3CH),k1=Math.floor(i1/R3CH);for(let k=k0;k<=k1;k++){const kk=T.closed?((k%R3.nCh)+R3.nCh)%R3.nCh:k;if(kk>=0&&kk<R3.nCh&&!R3.chunks[kk]){const ch=r3dChunk(kk);if(ch)R3.chunks[kk]=ch;}}};
  pre(s0-Math.round(170/T.step),s0+Math.round(90/T.step));if(poi)pre(poi.i-Math.round(100/T.step),poi.i+Math.round(60/T.step));
  try{r3dTilesAround(sp.p[0],sp.p[2],320,400);if(poi){const q=T.pts[poi.i];r3dTilesAround(q[0],q[2],240,300);}}catch(_){}
  const el=filmEl();el.hidden=false;el.className='r-film';el.innerHTML=`<div class="rf-bar top"></div><div class="rf-bar bot"></div><div class="rf-card" id="rfCard"></div><button class="rf-skip" id="rfSkip">Пропустить ▸▸</button>`;
  document.getElementById('raceScreen').classList.add('filming');document.getElementById('rfSkip').onclick=filmSkip;el.onclick=e=>{if(e.target===el)filmSkip();};
  auReelFanfare();
  // диктор: записанный голос — каждый раз; синтезатор устройства — только первые шесть гонок
  {const say=raceIntroText(rc);if(reelVoiceOn()&&(voiceDur(say,'aidar')||n<6))setTimeout(()=>{if(R&&R.film)voiceSay(say,'aidar',()=>{if(R&&R.film&&brief&&dB)setTimeout(()=>{if(R&&R.film)voiceSay(brief,'aidar');},250);});},500);}
  try{localStorage.setItem('avt-film',n+1);}catch(_){}}
function filmCaption(c){const el=document.getElementById('rfCard');if(!el)return;
  el.classList.remove('in');void el.offsetWidth;
  el.innerHTML=(c.map?`<div class="rf-mapw">${c.map}</div>`:'')+(c.kick?`<div class="rf-kick">${esc(c.kick)}</div>`:'')+(c.big?`<div class="rf-big">${esc(c.big)}</div>`:'')+(c.mid?`<div class="rf-mid">${esc(c.mid)}</div>`:'')+(c.sub?`<div class="rf-sub">${esc(c.sub)}</div>`:'')+(c.list&&c.list.length?`<div class="rf-list">${c.list.map((x,i)=>`<div${i?'':' class="h"'}>${esc(x)}</div>`).join('')}</div>`:'');
  el.classList.add('in');}
function filmCam(dt,W,H){const F=R.film;if(!F){R3.camHook=null;return;}F.t+=Math.min(dt,1/30);let acc=0,i=0;for(;i<F.shots.length;i++){if(F.t<acc+F.shots[i].d)break;acc+=F.shots[i].d;}
  if(i>=F.shots.length){filmEnd();r3dCamera(dt,W,H);return;}
  const sh=F.shots[i],cut=i!==F.i;if(cut){F.i=i;filmCaption(sh.cap);}
  const u=clamp((F.t-acc)/sh.d,0,1),c=sh.cam(u);
  // камера не уходит под землю (земля — по нескольким точкам, чтобы высота не дёргалась над кочками)
  const g=Math.max(fH(c.eye[0],c.eye[2]),(fH(c.eye[0]+3,c.eye[2])+fH(c.eye[0]-3,c.eye[2])+fH(c.eye[0],c.eye[2]+3)+fH(c.eye[0],c.eye[2]-3))/4)+0.6;if(c.eye[1]<g)c.eye[1]=g;
  // мягкий «операторский кран»: без рывков и дрожи, на смене плана — сразу на место
  const S=F.sm;if(cut||!S){F.sm={e:c.eye.slice(),l:c.look.slice()};}else{const k=1-Math.exp(-Math.min(dt,0.05)*9);for(let q=0;q<3;q++){S.e[q]+=(c.eye[q]-S.e[q])*k;S.l[q]+=(c.look[q]-S.l[q])*k;}}
  r3dCamSet(F.sm.e,F.sm.l,c.fov,W,H,c.near);R3.cam=null;}
function filmSkip(){if(R&&R.film)filmEnd();}
function filmEnd(){if(!R)return;R.film=null;if(R3.camHook===filmCam)R3.camHook=null;R3.camTarget=null;R3.cam=null;R.hold=false;R.lastT=performance.now();voiceStop();
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
  el.innerHTML=`<div class="rf-bar top"></div><div class="rf-bar bot"></div><div class="rf-rec">● ПОВТОР</div><div class="rf-card in" id="rfCard"><div class="rf-kick">${pos}-е место · ${fmtRaceTime(tFin*R.rc.km*1000/Math.max(1,R.trk.raceLen))}</div></div><button class="rf-skip" id="rfSkip">Итоги ▸▸</button>`;
  document.getElementById('raceScreen').classList.add('filming');document.getElementById('rfSkip').onclick=replayEnd;return true;}
function replayCam(dt,W,H){const Rp=R.replay;if(!Rp){R3.camHook=null;return;}const me=R.me;
  // у линии финиша — замедление
  const slow=Math.abs(Rp.t-Rp.fin)<1.2?0.35:1;Rp.t+=dt*slow;if(Rp.t>=Rp.t1){replayEnd();return;}
  replayApply(Rp.t);
  // смена камеры по времени: 0 — у дороги впереди, 1 — низко спереди, 2 — у финишной линии
  const left=Rp.fin-Rp.t,cut=left>5.5?0:left>2.2?1:2;
  if(cut!==Rp.cut){Rp.cut=cut;const T=R.trk,sd=Math.random()<0.5?1:-1;
    if(cut===0){const a=camSpot(me.idx,55,sd);Rp.pos=a.blocked?null:[a.p[0],a.p[1]+1.6,a.p[2]];Rp.fov=a.blocked?0.7:0.42;Rp.near=a.blocked?sd:0;}
    else if(cut===1){Rp.pos=null;Rp.fov=0.7;}
    else{const f=camSpot(T.finishIdx,4,sd,[3.2,4.5,6,8]);Rp.pos=f.blocked?null:[f.p[0],f.p[1]+1.1,f.p[2]];Rp.fov=f.blocked?0.7:0.6;Rp.near=f.blocked?-sd:0;}}
  const st=me.v3,y=st&&st.y!==null?st.y:me.y,tg=[me.x,y+0.8,me.z];let eye;
  if(cut===1||!Rp.pos){const fw=[Math.sin(me.yaw),0,Math.cos(me.yaw)],rt=[fw[2],0,-fw[0]],sd=cut===1?1:(Rp.near||1);eye=[me.x+fw[0]*7+rt[0]*2.2*sd,y+0.7,me.z+fw[2]*7+rt[2]*2.2*sd];}
  else eye=Rp.pos;
  const g=fH(eye[0],eye[2])+0.5;if(eye[1]<g)eye[1]=g;
  r3dCamSet(eye,tg,Rp.fov,W,H,0.1);R3.cam=null;}
function replayEnd(){if(!R||!R.replay)return;R.replay=null;if(R3.camHook===replayCam)R3.camHook=null;R3.camTarget=null;
  if(R.rplSave)R.cars.forEach((c,i)=>Object.assign(c,R.rplSave[i]));
  const el=filmEl();if(el){el.hidden=true;el.innerHTML='';}document.getElementById('raceScreen').classList.remove('filming');R.hold=false;finishRace(false);}
