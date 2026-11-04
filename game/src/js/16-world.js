/* ================= 0.41: МИРОВОЙ ИТОГ С НАЧАЛА ПАРТИИ И ГОСПОДСТВО =================
   Отзыв: «победить можно, заняв доминирующую позицию по любой из категорий наследия — 50 % от всего в мире по этому показателю
   и больше лидера, кумулятивно с начала игры»; «смешение мото, авто и авиа через лошадиные силы (кто больше продал в лошадях,
   а не в штуках), доллары, победы»; «рынок считаем не исторический, а реальный игровой».
   С первого хода партии копятся накопители по каждой компании (вы, боты, марки по истории, авиазаводы) и по миру:
   hp — проданные лошадиные силы, rev — выручка в долларах, sport — победы (большая гонка 6, обычная 2, большой приз в небе 6, рекорд 4),
   firsts — первенства; капитал и узнаваемость считаются на месте. Шесть категорий господства — как шесть категорий наследия.
   Условие (на всех уровнях одно): доля ≥ 50 % мирового накопленного итога, больше, чем у любой другой компании, и мир дорос
   до порога зрелости — иначе одно первенство в 1897 году было бы «господством в инновациях». */
const DOM_K=['scale','market','sport','innov','capital','brand'];
const DOM_N={scale:'Масштаб',market:'Рынок',sport:'Спорт',innov:'Инновации',capital:'Капитал',brand:'Бренд'};
const DOM_U={scale:'л. с.',market:'$',sport:'очков',innov:'первенств',capital:'$',brand:''};
const DOM_FLOOR={scale:2e6,market:2e8,sport:60,innov:16,capital:5e7,brand:10};
const DOM_SHARE=0.5;
const VAL_K=1.5;   // стоимость марки по истории — полторы годовые выручки (GM 1929: $4 млрд при $1,5 млрд выручки; Ford — $1 млрд при $0,75)
// ---- типовая мощность машины класса в году: по эталону соперников того же года (л. с.)
const HP_CACHE={},HP_MOTO={1895:1.5,1900:2.2,1905:3.5,1910:5,1915:7,1920:9,1925:12,1929:16};
function hpTyp(g,y){const k=g+'|'+Math.round(y);if(HP_CACHE[k])return HP_CACHE[k];let v;
  if(g==='moto')v=tabAt(HP_MOTO,y);else if(g==='moside')v=tabAt(HP_MOTO,y)*1.25;
  else{const kind=g==='van'?'truck':g,L=RIVAL_CAR[kind]?kind:'middle';const r=rivalCar(L,y),e=byId(ENGINES,r[2].e);v=e?e.hp:10;}
  return HP_CACHE[k]=v;}
function hpAir(role,t){const k='air|'+role+'|'+Math.round(t*2)/2;if(HP_CACHE[k])return HP_CACHE[k];let v=60;try{v=airStats(airRefMd(role,t),t).hpN||60;}catch(_){}return HP_CACHE[k]=v;}
// ---- имя компании: марки гонок, рынков и неба называются чуть по-разному — сводим к одной
const CO_ALIAS={'fiat':'FIAT','mercedes':'Daimler','mercedes-benz':'Daimler','daimler-motoren-gesellschaft':'Daimler','benz':'Benz & Cie.','richard-brasier':'Brasier','brasier':'Brasier',
  'panhard':'Panhard et Levassor','de dion':'De Dion-Bouton','lorraine-dietrich':'De Dietrich','maxwell':'Maxwell / Chrysler','chrysler':'Maxwell / Chrysler','rambler (jeffery)':'Nash','ford (манчестер)':'Ford','buick (general motors)':'Buick',
  'curtiss reims racer':'Curtiss','june bug':'Curtiss','wright military flyer':'Wright','voisin-farman i':'Voisin','morane-borel':'Morane-Saulnier','morane-saulnier g':'Morane-Saulnier','dh.4a':'de Havilland',
  'ryan nyp «дух сент-луиса»':'Ryan','travel air mystery ship':'Travel Air','waco 10':'Waco','vickers vimy':'Vickers','«илья муромец»':'Sikorsky','sikorsky s-6b':'Sikorsky','р-1 и р-2':'Поликарпов','cody v':'Cody','antoinette vii':'Antoinette','nieuport ii':'Nieuport','nieuport iv':'Nieuport',
  'deperdussin monocoque':'Deperdussin','deperdussin (гидро)':'Deperdussin','deperdussin (gnome 160)':'Deperdussin','sopwith tabloid':'Sopwith','savoia s.12':'Savoia','macchi m.7bis':'Macchi','macchi m.39':'Macchi','supermarine sea lion ii':'Supermarine','supermarine s.5':'Supermarine','supermarine s.6':'Supermarine',
  'curtiss cr-3':'Curtiss','curtiss r3c-2':'Curtiss','curtiss r-6':'Curtiss','curtiss tanager':'Curtiss','verville vcp-r':'Verville','nieuport-delage 29v':'Nieuport','blériot xi':'Blériot','blériot xi (gnome 100)':'Blériot','farman iii':'Farman'};
function coKey(n){if(!n)return '';let s=String(n).replace(/^«|»$/g,'').trim();const low=s.toLowerCase();if(CO_ALIAS[low])return CO_ALIAS[low];
  // «Blériot XI», «Fiat S61» — марка до первого пробела с номером модели; команды гонок — как есть
  const m=low.match(/^([a-zа-яё&.\- ]+?)(?:\s+[a-z]{0,2}\d|\s+\(|\s+[ivx]+$|$)/i);if(m){const b=m[1].trim();const k=CO_ALIAS[b];if(k)return k;if(b.length>=3&&b!==low)return s.slice(0,b.length).replace(/\s+$/,'');}
  return s;}
const RACE_BY_KEY={};
// победитель гонки по истории (для гонок до окна партии): известный победитель (rc.win) или сильнейшая команда года с бонусом хозяев
function histRaceWinner(rc){const teams=RACE_TEAMS.filter(t=>t.from<=rc.y&&t.to>=rc.y);const hw=histWinnerTeam(rc,teams);if(hw)return hw.n;let best=null,bs=0;
  teams.forEach(t=>{const b=(t.boost&&t.boost[rc.y])||1,v=t.str*b*(t.c===rc.c?1.08:1);if(v>bs){bs=v;best=t;}});return best?best.n:'';}
// победитель зачёта мотоциклов по истории: сильнейшая мотомарка страны гонки (motoField — хозяева первыми), если в гонке был класс мотоциклов
function histMotoWinner(rc,s){try{if(!raceMoto(rc))return null;const F=motoField(rc,null);if(!F.length)return null;return F[(rc.y+rc.m)%Math.min(2,F.length)].name;}catch(_){return null;}}
function raceByKey(k){if(!RACE_BY_KEY.__n||RACE_BY_KEY.__n!==RACES.length){for(const q in RACE_BY_KEY)delete RACE_BY_KEY[q];RACES.forEach(r=>RACE_BY_KEY[r.key]=r);RACE_BY_KEY.__n=RACES.length;}return RACE_BY_KEY[k];}
/* ---------- накопители ---------- */
function worldInit(s){return s.world={v:2,since:mi(s),hp:0,rev:0,sport:0,firsts:0,co:{},cu:{},sd:{},my:{hp:0,rev:0,hpY:0,hpPeak:0,cu:{}},fh:{}};}
function wco(W,n,c){let o=W.co[n];if(!o)o=W.co[n]={hp:0,rev:0,sport:0,firsts:0,r12:0,cu:{},c:c||''};else if(c&&!o.c)o.c=c;return o;}
function wAdd(W,n,c,country,hp,rev,units){const o=wco(W,n,c);o.hp+=hp;o.rev+=rev;o.r12+=rev;W.hp+=hp;W.rev+=rev;
  if(units&&country){o.cu[country]=(o.cu[country]||0)+units;W.cu[country]=(W.cu[country]||0)+units;}}
// месяц мира: после рынка (13-turn.js) — что продали вы, марки по истории, мотомарки и авиазаводы; кто выиграл гонки; чьи первенства
function worldMonth(s,r){const W=s.world&&s.world.v?s.world:worldInit(s),y=yf(s),t=tNow(s);if(W.hist)delete W.hist;/* 0.45: рекорд эпохи — одно число, в сохранении не нужен */
  // годовая выручка марок — скользящая: в начале месяца каждую сдвигаем на 1/12
  for(const n in W.co)W.co[n].r12*=11/12;
  // ---- вы
  {let hp=0,hpC=0,nC=0,hpM=0,nM=0;s.models.forEach(md=>{if(md.status!=='prod')return;let h=10;try{h=engineHp(parts(md).e,md);}catch(_){}
      const n=md.lastSold||0;hp+=n*h;if(isMoto(md)){hpM+=h;nM++;}else{hpC+=h;nC++;}});
    const avC=nC?hpC/nC:hpTyp('middle',y),avM=nM?hpM/nM:hpTyp('moto',y);hp+=((r.ordN||0)+(r.milN||0))*avC+(r.mordN||0)*avM;
    const R=r.air;let hpA=0;if(R&&(R.sold||R.ordN)){const L=(s.air.models||[]).filter(m=>m.status==='prod');let sum=0;L.forEach(m=>{try{sum+=airStats(m,t).hpN||0;}catch(_){}});hpA=((R.sold||0)+(R.ordN||0))*(L.length?sum/L.length:hpAir('sport',t));}
    const rev=(r.rev||0)/Math.max(0.5,1-dMargin(s))+(r.mil||0)+(r.ord||0)+(r.dump||0)+(R?(R.rev||0)+(R.ord||0)+(R.lic||0):0);
    const units=s.models.reduce((a,m)=>a+(m.status==='prod'?(m.lastSold||0):0),0)+(r.ordN||0)+(r.milN||0)+(r.mordN||0);
    const M=W.my;M.hp+=hp+hpA;M.rev+=rev;M.hpY+=hp+hpA;if(M.hpY>M.hpPeak)M.hpPeak=M.hpY;W.hp+=hp+hpA;W.rev+=rev;
    // по странам — для узнаваемости и доли: продано у покупателей
    s.models.forEach(md=>{if(md.status!=='prod'||!md.soldBy)return;for(const c in md.soldBy){M.cu[c]=(M.cu[c]||0)+md.soldBy[c];W.cu[c]=(W.cu[c]||0)+md.soldBy[c];}});
    if(s.m===11)M.hpY=0;}
  // ---- автомобильные марки по истории: продажи месяца по классам (13-turn.js: x.lg) × типовая мощность и цена класса
  for(const c in COMPS){const L=(s.comps&&s.comps[c])||[];COMPS[c].forEach((cp,i)=>{const x=L[i];if(!x||!x.lg||pkIs(cp,s))return;let hp=0,rev=0,un=0;
      for(const g in x.lg){const n=x.lg[g]||0;if(!n)continue;un+=n;hp+=n*hpTyp(g,y);rev+=n*prefP(g,c,s);}
      if(!un)return;if(cp.imp){W.hp+=hp;W.rev+=rev;W.cu[c]=(W.cu[c]||0)+un;return;}// импорт — не компания, но мир
      const own=(s.botAcq&&s.botAcq[cp.n])||cp.n;/* 0.41: марка, купленная ботом, — в его зачёт */wAdd(W,own,cp.c||c,c,hp,rev,un);});}
  // 0.41: экспорт живых соперников сверх истории (17b-bots.js: botSold → B.xs за этот месяц)
  if(s.bots&&botsOn(s))for(const n in s.bots){const B=s.bots[n];for(const c in (B.xs||{}))for(const g in B.xs[c]){const u=B.xs[c][g];if(u>0)wAdd(W,B.n,B.c,c,u*hpTyp(g,y),u*prefP(g,c,s),u);}}
  // ---- мотомарки (03c-moto.js): продажи месяца без разбивки по классам
  if(typeof MCOMPS!=='undefined')for(const c in MCOMPS){const L=(s.mcomps&&s.mcomps[c])||[];MCOMPS[c].forEach((cp,i)=>{const x=L[i];if(!x||!(x.last>0))return;const h=hpTyp('moto',y)*1.05;
      if(cp.imp){W.hp+=x.last*h;W.rev+=x.last*prefMoto('moto',c,s);return;}wAdd(W,coKey(cp.n),c,c,x.last*h,x.last*prefMoto('moto',c,s),0);});}
  // ---- авиазаводы (105h-air.js): годовой рынок назначения в стране делят заводы по весу — двенадцатая часть в месяц
  if(typeof AIR_MKT!=='undefined'&&t>=1908)for(const c in AIR_MKT){for(const role of ['sport','train','recon','fight','bomb','sea','mail','pax']){const mk=airMktRole(c,role,t)/12;if(mk<0.05)continue;
      const L=airComps(c,role,t,s),sw=L.reduce((a,o)=>a+o.w,0);if(!sw)continue;const h=hpAir(role,t);let pr=2500;try{pr=airRefPrice(role,t);}catch(_){pr=1500+h*25;}
      L.forEach(o=>wAdd(W,coKey(o.x.n),c,'',mk*o.w/sw*h,mk*o.w/sw*pr,0));}}
  // ---- гонки: все гонки эпохи с начала партии (s.startY), каждая один раз (W.sd). Отзыв 0.41: «победил 62 из 62 — как они считали?»:
  // раньше считались только итоги последних двух лет (s.cres), а победа в зачёте мотоциклов шла за победу в гонке. Теперь: в окне партии —
  // по итогам (s.cres, ждём их два месяца), раньше — по истории (histRaceWinner); зачёт мотоциклов — треть очков (большая 2, обычная 1)
  // тому, кто выиграл класс (мотомарка по истории или вы); ваши прежние победы — из журнала гонок (s.raceLog)
  if(W.v<2){W.v=2;W.sport=0;W.my.sport=0;W.my.air=0;for(const n in W.co)W.co[n].sport=0;for(const k in W.sd)if(!/^part:|^tech:|^atech:|^air:/.test(k))delete W.sd[k];}
  {const y0=s.startY||1895,now=mi(s),RL=s.raceLog||[];let rlIdx=null;const rl=()=>{if(!rlIdx){rlIdx={};RL.forEach(e=>{if(e&&e.key)(rlIdx[e.key]=rlIdx[e.key]||[]).push(e);});}return rlIdx;};
    RACES.forEach(rc=>{const k=rc.key;if(W.sd[k])return;const t0=(rc.y-1895)*12+rc.m;if(rc.y<y0){W.sd[k]=1;return;}if(t0>=now)return;const cr=s.cres&&s.cres[k];
      if(!cr&&now-t0<=2)return;/* итоги ещё не подведены (seasonTick идёт после) — подождём */W.sd[k]=1;if(cr&&cr.x)return;/* отменена войной */
      const pts=rc.major?RACE_W.major:RACE_W.normal,mp=rc.major?2:1,L=rl()[k]||[],myCar=L.some(e=>!e.cls&&e.place===1),myMoto=L.some(e=>e.cls==='moto'&&e.place===1);
      let carW=null,motoW=null;
      if(cr){const mo=cr.mo!=null?cr.mo:(!L.some(e=>!e.cls)&&L.some(e=>e.cls==='moto')&&cr.w===s.company?1:0);/* старые записи: «вы» без машин = зачёт мотоциклов */
        if(!mo)carW=(cr.w===s.company||myCar)?'me':(cr.w||null);
        motoW=cr.mw?(cr.mw===s.company?'me':cr.mw):myMoto?'me':(mo?(cr.w===s.company?'me':cr.w||null):histMotoWinner(rc,s));}
      else{carW=myCar?'me':histRaceWinner(rc);motoW=myMoto?'me':histMotoWinner(rc,s);}
      if(carW){W.sport+=pts;if(carW==='me')W.my.sport=(W.my.sport||0)+pts;else wco(W,coKey(carW),(cr&&cr.c)||rc.c||'').sport+=pts;}
      if(motoW){W.sport+=mp;if(motoW==='me')W.my.sport=(W.my.sport||0)+mp;else wco(W,coKey(motoW),'').sport+=mp;}});}
  // ---- небо: ваши победы и рекорды — как в наследии (airSportYears: событие 6/2, рекорд 4); чужие — по истории состязаний и рекордов, когда год прошёл
  try{const mine=airSportYears(s).reduce((a,[y2,v])=>a+v,0);W.my.air=mine;}catch(_){}
  if(typeof AIR_EV!=='undefined'){const A=s.air;AIR_EV.forEach(ev=>{const k='air|'+ev.key;if(W.sd[k]||ev.y>s.y-(ev.m!==undefined&&ev.m<=s.m?0:1))return;W.sd[k]=1;const pts=ev.open||ev.prize>=10000?RACE_W.major:RACE_W.normal;W.sport+=pts;
      const mineWin=A&&A.ev&&A.ev[ev.key]&&A.ev[ev.key].place===1;if(!mineWin&&ev.h&&ev.h[1])wco(W,coKey(ev.h[1]),ev.c||'').sport+=pts;});
    if(typeof AIR_REC!=='undefined')for(const kind in AIR_REC)AIR_REC[kind].forEach((r,i)=>{const k='arec|'+kind+'|'+i;if(W.sd[k]||r[0]>y)return;W.sd[k]=1;W.sport+=4;const n=coKey(String(r[3]||'').split(/[ -]/)[0]);if(n&&n!==coKey(s.company))wco(W,n,'').sport+=4;});
    if(A&&A.rec)for(const kind in A.rec){const k='myrec|'+kind;if(!W.sd[k]){W.sd[k]=1;W.sport+=4;}}}
  // ---- первенства по истории: кто и когда впервые (PART_HIST, TECH) — считаются, когда год настал и первенство не ушло вам (или боту)
  {const taken=s.firsts||{},bf=s.botFirsts||{};const put=(key,hy,who)=>{const b=bf[key];if(b){hy=Math.min(hy,b.y);who=b.n;}/* 0.41: бот опередил историю */if(W.fh[key]||y<hy)return;W.fh[key]=1;if(taken[key])return;W.firsts++;const n=b?b.n:coKey(String(who).split(/,| и /)[0].replace(/\(.*$/,'').trim());if(n)wco(W,n,'').firsts++;};
    for(const id in PART_HIST)put('part:'+id,PART_HIST[id][0],PART_HIST[id][1]);
    for(const k in TECH)(TECH[k].lv||[]).forEach((lv,i)=>{if(lv.hist)put('tech:'+k+':'+(i+1),lv.hist[0],lv.hist[1]);});
    if(typeof AIR_TECH!=='undefined')AIR_TECH.forEach(T=>put('air_'+T.id,Math.floor(T.y),T.who));}
  return W;}
/* ---------- таблица господства ---------- */
// узнаваемость: вес страны — корень из её рынка (люди, не машины: иначе Америка — 85 % мира), марку знают по её доле покупателей страны
function awW(s){const mk=c=>Math.sqrt((s.mkY&&s.mkY[c])||1000),W={};let sum=0;for(const c in COUNTRIES){W[c]=mk(c);sum+=W[c];}for(const c in W)W[c]/=sum;return W;}
function worldCo(s){const W=s.world;if(!W||!W.v)return [];const y=yf(s),AW=awW(s);
  const out=[];for(const n in W.co){const o=W.co[n];let aw=0;for(const c in COUNTRIES){const sh=W.cu[c]?(o.cu[c]||0)/W.cu[c]:0;aw+=Math.min(1,sh*1.25)*AW[c];}
    out.push({n,c:o.c,hp:o.hp,rev:o.rev,sport:o.sport,firsts:o.firsts,val:o.r12*VAL_K,aw,bot:!!(s.bots&&s.bots[n])});/* r12 — скользящая годовая выручка (каждый месяц ×11/12 плюс месяц) */}
  return out;}
function worldMine(s){const W=s.world;if(!W||!W.v)return null;const AW=awW(s);let aw=0;for(const c in COUNTRIES)aw+=clamp(awOf(s,c),0,1)*AW[c];
  return {n:s.company,you:1,c:s.country,hp:W.my.hp,rev:W.my.rev,sport:(W.my.sport||0)+(W.my.air||0),firsts:firstsLive(s),val:Math.max(0,companyValue(s)),aw};}
/* ---------- 0.44: исторический лучший показатель — как было бы в настоящей истории к этой дате, без вас и живых соперников ----------
   Отзыв: «чтобы победить, недостаточно господства в реалии живой игры — нужно превзойти и исторический лучший показатель».
   W.hist копится теми же месяцами, что и живой мир, но по историческим кривым марок (compVol × mix), истории гонок (histRaceWinner),
   состязаний и рекордов неба и первенств (PART_HIST, TECH, AIR_TECH) — марка вашего первопроходца и купленные марки считаются как в истории. */
function hco(H,n,c){let o=H.co[n];if(!o)o=H.co[n]={hp:0,rev:0,sport:0,firsts:0,r12:0,cu:{},c:c||''};return o;}
function histMonthAdd(s,H,y,m){const ss={y,m,country:s.country},t=y+m/12+0.01,yf0=y+(m+0.5)/12;
  for(const n in H.co)H.co[n].r12*=11/12;
  for(const c in COMPS)COMPS[c].forEach(cp=>{const v=compVol(cp,ss)/12;if(!(v>0))return;const mix=cp.mix||{middle:1};let hp=0,rev=0,un=0;
    for(const g in mix){const u=v*mix[g];if(!u)continue;un+=u;hp+=u*hpTyp(g,yf0);rev+=u*prefP(g,c,ss);}
    H.hp+=hp;H.rev+=rev;H.cu[c]=(H.cu[c]||0)+un;if(cp.imp)return;const o=hco(H,coKey(cp.n),cp.c||c);o.hp+=hp;o.rev+=rev;o.r12+=rev;o.cu[c]=(o.cu[c]||0)+un;});
  if(typeof MCOMPS!=='undefined')for(const c in MCOMPS)MCOMPS[c].forEach(cp=>{const v=compVol(cp,ss)/12;if(!(v>0))return;const h=hpTyp('moto',yf0)*1.05,rev=v*prefMoto('moto',c,ss);H.hp+=v*h;H.rev+=rev;if(cp.imp)return;const o=hco(H,coKey(cp.n),c);o.hp+=v*h;o.rev+=rev;o.r12+=rev;});
  if(typeof AIR_MKT!=='undefined'&&t>=1908)for(const c in AIR_MKT)for(const role of ['sport','train','recon','fight','bomb','sea','mail','pax']){const mk=airMktRole(c,role,t)/12;if(mk<0.05)continue;
    const L=airComps(c,role,t,{pioneer:'__none__'}),sw=L.reduce((a,o)=>a+o.w,0);if(!sw)continue;const h=hpAir(role,t);let pr=2500;try{pr=airRefPrice(role,t);}catch(_){pr=1500+h*25;}
    L.forEach(o=>{const u=mk*o.w/sw,q=hco(H,coKey(o.x.n),c);q.hp+=u*h;q.rev+=u*pr;q.r12+=u*pr;H.hp+=u*h;H.rev+=u*pr;});}
  // гонки этого месяца — по истории; зачёт мотоциклов — треть
  const now=(y-1895)*12+m;RACES.forEach(rc=>{if((rc.y-1895)*12+rc.m!==now)return;const pts=rc.major?RACE_W.major:RACE_W.normal,w=histRaceWinner(rc);if(w){H.sport+=pts;hco(H,coKey(w),rc.c||'').sport+=pts;}
    const mw=histMotoWinner(rc,s);if(mw){const mp=rc.major?2:1;H.sport+=mp;hco(H,coKey(mw),'').sport+=mp;}});
  if(typeof AIR_EV!=='undefined')AIR_EV.forEach(ev=>{if(ev.y!==y||(ev.m||0)!==m)return;const pts=ev.open||ev.prize>=10000?RACE_W.major:RACE_W.normal;H.sport+=pts;if(ev.h&&ev.h[1])hco(H,coKey(ev.h[1]),ev.c||'').sport+=pts;});
  if(typeof AIR_REC!=='undefined')for(const kind in AIR_REC)AIR_REC[kind].forEach(r=>{const ry=Math.floor(r[0]),rm=Math.min(11,Math.floor((r[0]-ry)*12));if(ry!==y||rm!==m)return;H.sport+=4;const n=coKey(String(r[3]||'').split(/[ -]/)[0]);if(n)hco(H,n,'').sport+=4;});
  // первенства истории, наступившие в этом месяце (год настал — считаем в январе)
  if(m===0){const put=(hy,who)=>{if(hy!==y)return;H.firsts++;const n=coKey(String(who).split(/,| и /)[0].replace(/\(.*$/,'').trim());if(n)hco(H,n,'').firsts++;};
    for(const id in PART_HIST)put(PART_HIST[id][0],PART_HIST[id][1]);for(const k in TECH)(TECH[k].lv||[]).forEach(lv=>{if(lv.hist)put(lv.hist[0],lv.hist[1]);});
    if(typeof AIR_TECH!=='undefined')AIR_TECH.forEach(T=>{if(T.h&&T.h[1])put(Math.floor(T.y),T.h[1]);});}
  H.at=now;}
/* 0.45 (отзыв: «победа по двум критериям: доминация в игре — больше половины всего — И превосходство над историческим рекордсменом по
   этому показателю за всю эпоху, сейчас до 1930 включительно»): рекорд эпохи — лучший итог настоящей истории 1895–1930 по категории,
   одно число на категорию, считается один раз за сеанс (HIST_ERA) по тем же месячным порциям histMonthAdd. Накопленные показатели
   (л. с., $, победы, первенства) — итог к концу 1930 года; капитал и узнаваемость — пик за эпоху. */
const ERA_END=1930;let HIST_ERA=null;
// рекорд эпохи: из сборки (16a-era.js, node tools/gen_era.js — 2,5 с счёта, в игре не считаем), иначе считаем на месте
function histEra(){if(HIST_ERA)return HIST_ERA;if(typeof HIST_ERA_DATA!=='undefined'&&HIST_ERA_DATA&&HIST_ERA_DATA.best)return HIST_ERA=HIST_ERA_DATA;return HIST_ERA=histEraCompute();}
function histEraCompute(){const H={v:1,at:-1,co:{},cu:{},hp:0,rev:0,sport:0,firsts:0},peakVal={},peakAw={},ss={country:'fr'},yCu={};
  for(let k=0;k<(ERA_END-1895+1)*12;k++){const y=1895+Math.floor(k/12),m=k%12;try{histMonthAdd(ss,H,y,m);}catch(e){console.warn('era',e);}
    for(const n in H.co){const o=H.co[n],v=o.r12*VAL_K;if(!(peakVal[n]>=v))peakVal[n]=v;}
    if(m===11){/* узнаваемость в конце года: вес страны — корень из её покупателей за год */const W={};let sum=0;for(const c in COUNTRIES){const u=(H.cu[c]||0)-(yCu[c]||0);W[c]=Math.sqrt(Math.max(1,u));sum+=W[c];yCu[c]=H.cu[c]||0;}
      for(const n in H.co){const o=H.co[n];let aw=0;for(const c in COUNTRIES){const sh=H.cu[c]?(o.cu[c]||0)/H.cu[c]:0;aw+=Math.min(1,sh*1.25)*W[c]/sum;}if(!(peakAw[n]>=aw))peakAw[n]=aw;}}}
  const best={};const pick=(k,f)=>{let b=null;for(const n in H.co){const v=f(n,H.co[n]);if(v>0&&(!b||v>b.v))b={n,v:k==='brand'?Math.round(v*1e4)/1e4:Math.round(v),c:H.co[n].c};}best[k]=b;};
  pick('scale',(n,o)=>o.hp);pick('market',(n,o)=>o.rev);pick('sport',(n,o)=>o.sport);pick('innov',(n,o)=>o.firsts);pick('capital',n=>peakVal[n]||0);pick('brand',n=>peakAw[n]||0);
  return {best,world:{hp:Math.round(H.hp),rev:Math.round(H.rev),sport:H.sport,firsts:H.firsts},y0:1895,y1:ERA_END};}
// рекорд эпохи по категории: {n, v}
function histBest(s,k){const E=histEra();return E&&E.best[k]||null;}
function domTable(s){const W=s.world;if(!W||!W.v)return null;const me=worldMine(s),L=worldCo(s),age=(mi(s)-(W.since||0))/12,out={};
  const tot={scale:W.hp,market:W.rev,sport:W.sport,innov:W.firsts+me.firsts,capital:L.reduce((a,o)=>a+o.val,0)+me.val,brand:1};
  const f={scale:'hp',market:'rev',sport:'sport',innov:'firsts',capital:'val',brand:'aw'};
  DOM_K.forEach(k=>{const key=f[k];let lead=null;L.forEach(o=>{if(!lead||o[key]>lead.v)lead={n:o.n,v:o[key],c:o.c,bot:o.bot};});
    const mine=me[key],world=k==='brand'?1:Math.max(tot[k],mine),share=k==='brand'?mine:(world>0?mine/world:0);
    const ripe=k==='brand'?age>=DOM_FLOOR.brand:world>=DOM_FLOOR[k];let hist=null;try{hist=histBest(s,k);}catch(e){console.warn('histBest',e);}
    // 0.45: победа по двум условиям — больше половины живого мира И больше рекорда эпохи (1895–1930) по этой категории
    out[k]={mine,world,share,lead,ripe,hist,histOk:!hist||mine>hist.v,ok:ripe&&share>=DOM_SHARE&&(!lead||mine>lead.v)&&mine>0&&(!hist||mine>hist.v),leadShare:lead?(k==='brand'?lead.v:(world>0?lead.v/world:0)):0,histShare:hist?(k==='brand'?hist.v:(world>0?hist.v/world:0)):0};});
  return out;}
// бот (или любая живая компания) держит господство: доля ≥ 50 % и больше всех, включая вас
function domBots(s){const W=s.world;if(!W||!W.v||!s.bots)return null;const me=worldMine(s),L=worldCo(s),age=(mi(s)-(W.since||0))/12,f={scale:'hp',market:'rev',sport:'sport',innov:'firsts',capital:'val',brand:'aw'};
  const tot={scale:W.hp,market:W.rev,sport:W.sport,innov:W.firsts+me.firsts,capital:L.reduce((a,o)=>a+o.val,0)+me.val};
  for(const k of DOM_K){const key=f[k],world=k==='brand'?1:tot[k];if(k==='brand'?age<DOM_FLOOR.brand:world<DOM_FLOOR[k])continue;
    let hist=null;try{hist=histBest(s,k);}catch(_){}
    for(const o of L){if(!o.bot)continue;const v=o[key],share=k==='brand'?v:v/Math.max(1e-9,world);if(share<DOM_SHARE||v<=me[key])continue;if(L.some(q=>q!==o&&q[key]>=v))continue;if(hist&&v<=hist.v)continue;/* 0.44–0.45: и боту нужно превзойти рекорд эпохи */return {k,n:o.n,c:o.c,share};}}
  return null;}
function domCheck(s){if(!s.world||!s.world.v||s.over)return;const T=domTable(s);if(!T)return;
  if(!s.dom){const k=DOM_K.find(q=>T[q].ok);if(k){s.dom={k,y:s.y,m:s.m,who:'you'};domWin(s,k,T[k]);return;}}
  if(!s.domLost&&!s.dom){const b=domBots(s);if(b){s.domLost={k:b.k,n:b.n,y:s.y,m:s.m};domLose(s,b);}}}
function domFmt(k,v){if(k==='brand')return Math.round(v*100)+' %';if(k==='market'||k==='capital')return money(v);if(k==='scale')return fmtN(Math.round(v))+' л. с.';return fmtN(Math.round(v));}
function domWin(s,k,T){const name=DOM_N[k];if(T&&T.hist)T.histTxt=` Рекорд всей эпохи 1895–1930 — ${T.hist.n}: ${domFmt(k,T.hist.v)} — остался позади.`;try{celebrate('Господство!',`${name}: ${Math.round(T.share*100)} % мира — «${s.company}»`,'🏛','legacy');}catch(_){}
  try{trophyAdd(s,{kind:'record',title:`Господство: ${name.toLowerCase()}`,sub:`${dstr(s)} · ${Math.round(T.share*100)} % мира`,story:DOM_STORY[k](s,T)+(T.histTxt||''),key:'dom|'+k,pt:'Господство!'});}catch(_){}
  s.legBonus=(s.legBonus||0)+100;s.rep=clamp(s.rep+10,0,100);
  pushEvent({own:1,kicker:'Экстренный выпуск',title:`«${s.company}» господствует: ${name.toLowerCase()}`,deck:`${Math.round(T.share*100)} % всего мира по этому показателю${T.lead?` — ближайший соперник, ${esc(T.lead.n)}, ${Math.round(T.leadShare*100)} %`:''}`,
    text:DOM_STORY[k](s,T)+(T.histTxt||'')+`\nКак в «Цивилизации», это победа: вы заняли доминирующее положение в одной из шести категорий наследия, считая с первого дня компании. Можно играть дальше — до 1930 года и других категорий — или подвести итог эпохи.`,
    choices:[['Экран победы','domScreen'],['Играть дальше','ok']]},true);}
function domLose(s,b){const name=DOM_N[b.k];
  pushEvent({own:1,noArt:1,kicker:'Экстренный выпуск',title:`${esc(b.n)} господствует: ${name.toLowerCase()}`,deck:`${Math.round(b.share*100)} % мира по этому показателю — больше, чем у кого бы то ни было, включая «${s.company}»`,
    text:`Соперник первым занял доминирующее положение в категории «${name}» — считая с начала эпохи, с ${1895+Math.floor((s.world.since||0)/12)} года. По правилам «Цивилизации» это его победа: он отныне задаёт тон в отрасли.\nПартия не окончена: можно играть дальше — отобрать у него первенство или победить в другой категории — либо подвести итог эпохи.`,
    choices:[['Экран итога','domScreen'],['Играть дальше','ok']]},true);}
const DOM_STORY={
  scale:(s,T)=>`С начала эпохи в мире продано ${fmtN(Math.round(T.world))} лошадиных сил в автомобилях, мотоциклах и аэропланах — и больше половины из них, ${fmtN(Math.round(T.mine))}, сошли с ваших заводов. Так в истории не удавалось даже Форду: его доля в накопленном выпуске мира к 1929 году — около двух пятых.`,
  market:(s,T)=>`Из каждых двух долларов, оставленных покупателями в отрасли с начала эпохи, один достался «${s.company}»: выручка ${money(T.mine)} при мировой ${money(T.world)}.`,
  sport:(s,T)=>`Больше половины побед эпохи — в больших гонках, перелётах и рекордах — на счету ваших машин: ${fmtN(Math.round(T.mine))} очков из ${fmtN(Math.round(T.world))} мировых.`,
  innov:(s,T)=>`Больше половины новинок эпохи мир увидел первыми на ваших машинах: ${Math.round(T.mine)} первенств из ${Math.round(T.world)}. Историки будут писать, что автомобиль изобрели у вас.`,
  capital:(s,T)=>`Стоимость «${s.company}» — ${money(T.mine)} — больше, чем все остальные автомобильные, мотоциклетные и авиационные компании мира вместе взятые (${money(T.world-T.mine)}).`,
  brand:(s,T)=>`Вашу марку знает больше половины покупателей мира — узнаваемость ${Math.round(T.mine*100)} % с весом рынков, — и ни одну другую не знают лучше.`};
/* ---------- карточка «Господство» (вкладка «Империя») и экран итога ---------- */
// как считается каждая категория — одной строкой под шкалой (отзыв 0.41: «62 из 62 — как они считали?»)
const DOM_HOW={scale:'лошадиные силы всех проданных машин, мотоциклов и аэропланов мира',market:'выручка всех марок мира в долларах',
  sport:'победы с начала партии во всех гонках эпохи: большая гонка 6 очков, обычная 2, зачёт мотоциклов 2/1, перелёт или гонка в небе 6/2, рекорд 4',
  innov:'первенства: кто первым в мире сделал деталь или технологию (история, вы, живые соперники)',capital:'стоимость компаний: годовая выручка × 1,5; ваша — оценка банкиров',brand:'узнаваемость по странам с весом рынков (√размера)'};
function domCard(s){const T=domTable(s);if(!T)return `<section class="card" id="sec-dom"><div class="row"><h2>Господство</h2></div><p class="small muted" style="margin-top:4px">Мировой итог копится с первого хода: лошадиные силы, доллары, победы, первенства, капитал, узнаваемость. Господство — половина мира по любой из шести категорий и больше любого соперника.</p></section>`;
  const best=DOM_K.slice().sort((a,b)=>T[b].share-T[a].share)[0];
  const rows=DOM_K.map(k=>{const q=T[k],pct=Math.round(q.share*1000)/10,lp=Math.round(q.leadShare*1000)/10,won=s.dom&&s.dom.k===k;
    return `<div class="dom-row ${won?'won':''}"><div class="row"><span>${DOM_N[k]}${won?' <span class="pill good">господство</span>':''}</span><b class="num">${pct.toFixed(pct<10?1:0).replace('.',',')} %</b></div>
      <div class="bar dom-bar"><i style="width:${Math.min(100,q.share/DOM_SHARE*100)}%"></i>${q.lead?`<u style="left:${Math.min(100,q.leadShare/DOM_SHARE*100)}%" title="${esc(q.lead.n)}"></u>`:''}${q.hist?`<u class="hist" style="left:${Math.min(100,q.histShare/DOM_SHARE*100)}%" title="в истории: ${esc(q.hist.n)}"></u>`:''}</div>
      <p class="small muted">${q.lead?`лидер — ${esc(q.lead.n)}${q.lead.bot?' <span class="pill muted">живой</span>':''}: ${lp.toFixed(lp<10?1:0).replace('.',',')} %`:'соперников нет'} · ${k==='brand'?'':`вы: ${domFmt(k,q.mine)} · `}мир: ${k==='brand'?'узнаваемость с весом рынков':domFmt(k,q.world)}${q.ripe?'':' · <span class="warn">мир ещё мал</span>'}</p>
      ${q.hist?`<p class="small ${q.histOk?'good':'muted'}">рекорд эпохи (${histEra().y0}–${histEra().y1}) — ${esc(q.hist.n)}: ${domFmt(k,q.hist.v)}${q.histOk?' — вы уже выше':' — нужно больше'}</p>`:''}
      <p class="small muted dom-how">${DOM_HOW[k]}</p></div>`;}).join('');
  return `<section class="card" id="sec-dom"><div class="row"><h2>Господство</h2><span class="pill ${s.dom?'good':'muted'}">${s.dom?DOM_N[s.dom.k]+' '+s.dom.y:'цель — 50 %'}</span></div>
    <p class="small muted" style="margin-top:4px">Два условия, как в «Цивилизации»: больше половины мира по любой из шести категорий — с первого дня компании, считая всех: марки по истории, живых соперников и авиазаводы, — и больше рекорда эпохи: лучшего итога настоящей истории 1895–1930 по этой категории. Ближе всего — ${DOM_N[best].toLowerCase()}.</p>
    <div style="margin-top:8px">${rows}</div>${s.domLost?`<p class="small bad" style="margin-top:6px">${esc(s.domLost.n)} держит господство: ${DOM_N[s.domLost.k].toLowerCase()} (${MONTHS[s.domLost.m]} ${s.domLost.y}).</p>`:''}</section>`;}
function domScreenHTML(s){const T=domTable(s),t=legacyTable(s),k=s.dom?s.dom.k:(s.domLost?s.domLost.k:null),win=!!s.dom;
  const head=win?`<h2>Победа: ${DOM_N[k].toLowerCase()}</h2><p class="small">${MONTHS[s.dom.m]} ${s.dom.y} · «${esc(s.company)}» — ${Math.round(T[k].share*100)} % мира</p>`:s.domLost?`<h2>${esc(s.domLost.n)} господствует</h2><p class="small">${DOM_N[k]} · ${MONTHS[s.domLost.m]} ${s.domLost.y}</p>`:'<h2>Господство</h2>';
  return `<div class="dom-screen">${head}${T?DOM_K.map(q=>`<div class="row small"><span>${DOM_N[q]}</span><span class="num">${Math.round(T[q].share*100)} %${T[q].lead?` <span class="muted">· ${esc(T[q].lead.n)} ${Math.round(T[q].leadShare*100)} %</span>`:''}${T[q].hist?` <span class="muted">· рекорд эпохи: ${esc(T[q].hist.n)} ${domFmt(q,T[q].hist.v)}</span>`:''}</span></div>`).join(''):''}
    <p class="small muted" style="margin-top:8px">Наследие: ${t.place}-е место среди компаний эпохи, ${Math.round(t.me.total)} очков${win?' (+100 за господство)':''}.</p>
    <div class="row" style="margin-top:12px;gap:8px"><button class="btn primary" data-act="close">Играть дальше</button><button class="btn" data-act="final">Сравнить с историей</button></div></div>`;}
