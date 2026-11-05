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
const DOM_U={scale:'л. с.',market:'$',sport:'очков',innov:'первенств',capital:'$',brand:'клиентов'};
// порог зрелости мира (иначе одно первенство в 1897 году — «господство»); 0.47: бренд — клиенты, порог 100 000 покупателей в мире
const DOM_FLOOR={scale:2e6,market:2e8,sport:60,innov:16,capital:5e7,brand:1e5};
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
  'curtiss reims racer':'Curtiss','june bug':'Curtiss','wright military flyer':'Wright','wright company':'Wright','voisin-farman i':'Voisin','morane':'Morane-Saulnier','morane-borel':'Morane-Saulnier','morane-saulnier g':'Morane-Saulnier','dh.4a':'de Havilland','airco / de havilland':'de Havilland',
  'ryan nyp «дух сент-луиса»':'Ryan','travel air mystery ship':'Travel Air','waco 10':'Waco','vickers vimy':'Vickers','«илья муромец»':'Руссо-Балт','sikorsky':'Руссо-Балт','sikorsky s-6b':'Руссо-Балт','руссо-балт (сикорский)':'Руссо-Балт','р-1 и р-2':'Поликарпов','cody v':'Cody','antoinette vii':'Antoinette','nieuport ii':'Nieuport','nieuport iv':'Nieuport',
  'deperdussin':'SPAD','deperdussin monocoque':'SPAD','deperdussin (гидро)':'SPAD','deperdussin (gnome 160)':'SPAD','sopwith tabloid':'Sopwith','savoia':'Savoia-Marchetti','savoia s.12':'Savoia-Marchetti','macchi m.7bis':'Macchi','macchi m.39':'Macchi','supermarine sea lion ii':'Supermarine','supermarine s.5':'Supermarine','supermarine s.6':'Supermarine',
  'curtiss cr-3':'Curtiss','curtiss r3c-2':'Curtiss','curtiss r-6':'Curtiss','curtiss tanager':'Curtiss','verville vcp-r':'Verville','nieuport-delage 29v':'Nieuport','blériot xi':'Blériot','blériot xi (gnome 100)':'Blériot','farman iii':'Farman',
  // 0.46: всё суммарно по авто, мото и авиа — марки одной компании сводятся к одному имени; британский Daimler и «Форд в Манчестере» — как в истории
  'sia / fiat':'FIAT','юнкерс в филях':'Junkers','daimler (coventry)':'Daimler (Coventry)','daimler из ковентри':'Daimler (Coventry)','ford river rouge':'Ford','olds':'Oldsmobile','луи рено':'Renault','hudson':'Hudson-Essex','essex':'Hudson-Essex','dodge':'Dodge Brothers','dodge / budd':'Dodge Brothers'};
function coKey(n){if(!n)return '';let s=String(n).trim(),low=s.toLowerCase();if(CO_ALIAS[low])return CO_ALIAS[low];
  s=s.replace(/[«»]/g,'').replace(/\s+/g,' ').trim();low=s.toLowerCase();if(CO_ALIAS[low])return CO_ALIAS[low];/* 0.46: кавычки внутри имени («Руссо-Балт» (Сикорский)) */
  // «Blériot XI», «Fiat S61» — марка до первого пробела с номером модели; команды гонок — как есть
  const m=low.match(/^([a-zа-яё&.\- ]+?)(?:\s+[a-z]{0,2}\d|\s+\(|\s+[ivx]+$|$)/i);if(m){const b=m[1].trim();const k=CO_ALIAS[b];if(k)return k;if(b.length>=3&&b!==low)return s.slice(0,b.length).replace(/\s+$/,'');}
  return s;}
/* ---------- 0.46: реестр первенств эпохи ----------
   Отзыв 0.45: «неправильно считаешь историческое число инноваций». В счёт эпохи шли только детали и технологии завода — без новинок
   оснащения (10d-equip.js: стартер, электрический свет, спидометр…), без новинок неба (у AIR_TECH поле who, а счёт эпохи искал h)
   и без перелётов (43i-airev.js: air_ev_*), а имена первопроходцев не сводились к маркам («Ford River Rouge», «Olds», «Луи Рено» шли
   отдельными строками). Теперь один реестр на всех: живой мир (worldMonth), рекорд эпохи (histMonthAdd) и ваши первенства
   (recordFirst — те же ключи). Первенство на двоих («Indian и Harley-Davidson») — по одному каждому; безымянное («английские кузовщики»)
   считается миру, но не марке. */
const INNOV_CO={'ford river rouge':'Ford','olds':'Oldsmobile','луи рено':'Renault','daimler из ковентри':'Daimler (Coventry)','dodge / budd':'Dodge Brothers','budd':'Budd',
  'энтони фоккер':'Fokker','анри фарман':'Farman','игорь сикорский':'Руссо-Балт','хуго юнкерс':'Junkers','арман депердюссен':'SPAD','адольф рорбах':'Rohrbach','анри фабр':'Fabre',
  'морис удай':'Houdaille','essex':'Hudson-Essex','lovell-mcconnell':'Klaxon','warner':'Warner','английские кузовщики':'','верхнеклапанные моторы двадцатых':'','ручной; с 1922 года — вакуумный trico':'Trico','вы сами в настоящей истории':''};
function innovCos(who){const out=[];String(who||'').split(/ и /).forEach(p=>{const s=p.replace(/\(.*$/,'').trim();if(!s)return;const low=s.toLowerCase();let n=INNOV_CO[low]!==undefined?INNOV_CO[low]:coKey(s);
    if(n&&INNOV_CO[n.toLowerCase()]!==undefined)n=INNOV_CO[n.toLowerCase()];if(n&&!out.includes(n))out.push(n);});return out;}
let INNOV_LIST=null;
// {key, hy — год (для перелётов — с месяцем), who — как в данных, cos — марки, n — название, kind: part|moto|tech|eq|air|flight}
function innovLedger(){if(INNOV_LIST)return INNOV_LIST;const L=[],add=(key,hy,who,n,kind)=>L.push({key,hy,who:String(who||''),cos:innovCos(who),n,kind});const P={};try{ALL_PARTS().forEach(x=>P[x.id]=x);}catch(_){}
  for(const id in PART_HIST)add('part:'+id,PART_HIST[id][0],PART_HIST[id][1],P[id]?P[id].name:id,/^m/.test(id)?'moto':'part');
  for(const k in TECH)(TECH[k].lv||[]).forEach((lv,i)=>{if(lv.hist)add('tech:'+k+':'+(i+1),lv.hist[0],lv.hist[1],lv.name,'tech');});
  if(typeof EQUIP!=='undefined')EQUIP.forEach(e=>{if(e.hist)add('eq:'+e.id,e.hist[0],e.hist[1],e.name,'eq');});
  if(typeof AIR_TECH!=='undefined')AIR_TECH.forEach(T=>add('air_'+T.id,Math.floor(T.y),T.who,T.n,'air'));
  if(typeof AIR_EV!=='undefined')AIR_EV.forEach(ev=>{if(!['cross','circle','loop'].includes(ev.kind)||!ev.h)return;add('air_ev_'+ev.key,ev.y+(ev.m||0)/12,ev.h[1]||ev.h[0],ev.name,'flight');});
  return INNOV_LIST=L;}
// первенства истории по маркам (для энциклопедии и проверок): {марка: [{y, n, key}]}
function innovByCo(){const by={};innovLedger().forEach(I=>I.cos.forEach(n=>(by[n]=by[n]||[]).push({y:Math.floor(I.hy),n:I.n,key:I.key})));return by;}
const RACE_BY_KEY={};
// победитель гонки по истории (для гонок до окна партии): известный победитель (rc.win) или сильнейшая команда года с бонусом хозяев
function histRaceWinner(rc){const teams=RACE_TEAMS.filter(t=>t.from<=rc.y&&t.to>=rc.y);const hw=histWinnerTeam(rc,teams);if(hw)return hw.n;let best=null,bs=0;
  teams.forEach(t=>{const b=(t.boost&&t.boost[rc.y])||1,v=t.str*b*(t.c===rc.c?1.08:1);if(v>bs){bs=v;best=t;}});return best?best.n:'';}
// победитель зачёта мотоциклов по истории: сильнейшая мотомарка страны гонки (motoField — хозяева первыми), если в гонке был класс мотоциклов
function histMotoWinner(rc,s){try{if(!raceMoto(rc))return null;const F=motoField(rc,null);if(!F.length)return null;return F[(rc.y+rc.m)%Math.min(2,F.length)].name;}catch(_){return null;}}
function raceByKey(k){if(!RACE_BY_KEY.__n||RACE_BY_KEY.__n!==RACES.length){for(const q in RACE_BY_KEY)delete RACE_BY_KEY[q];RACES.forEach(r=>RACE_BY_KEY[r.key]=r);RACE_BY_KEY.__n=RACES.length;}return RACE_BY_KEY[k];}
/* ---------- накопители ---------- */
function worldInit(s){return s.world={v:3,since:mi(s),hp:0,rev:0,sport:0,firsts:0,co:{},cu:{},sd:{},my:{hp:0,rev:0,r12:0,hpY:0,hpPeak:0,cu:{}},fh:{}};}
function wco(W,n,c){let o=W.co[n];if(!o)o=W.co[n]={hp:0,rev:0,sport:0,firsts:0,r12:0,cu:{},c:c||''};else if(c&&!o.c)o.c=c;return o;}
function wAdd(W,n,c,country,hp,rev,units){const o=wco(W,n,c);o.hp+=hp;o.rev+=rev;o.r12+=rev;W.hp+=hp;W.rev+=rev;
  if(units&&country){o.cu[country]=(o.cu[country]||0)+units;W.cu[country]=(W.cu[country]||0)+units;}}
// 0.46: в ваш зачёт — и купленные марки: дочерняя компания с контрольным пакетом (105c-deals.js: sub, st ≥ 51 %) — как Buick, Olds и Cadillac у General Motors
function wMine(W,country,hp,rev,units){const M=W.my;M.hp+=hp;M.rev+=rev;M.r12=(M.r12||0)+rev;M.hpY+=hp;W.hp+=hp;W.rev+=rev;
  if(units&&country){M.cu[country]=(M.cu[country]||0)+units;W.cu[country]=(W.cu[country]||0)+units;}}
function heldByMe(s,c,i){if(typeof holdOf!=='function')return false;const h=holdOf(s,c,i);return !!(h&&h.mode==='sub'&&(h.st||0)>=0.51);}
// 0.47: клиенты (отзыв: «бренд — не в процентах, а в клиентах»): каждый купивший машину, мотоцикл или аэроплан — один клиент
const CU_MOTO=1;
// месяц мира: после рынка (13-turn.js) — что продали вы, марки по истории, мотомарки и авиазаводы; кто выиграл гонки; чьи первенства
function worldMonth(s,r){const W=s.world&&s.world.v?s.world:worldInit(s),y=yf(s),t=tNow(s);if(W.hist)delete W.hist;/* 0.45: рекорд эпохи — одно число, в сохранении не нужен */
  // сохранения 0.41 (v1): зачёт побед заново по всем гонкам (ниже, раздел гонок)
  if(W.v<2){W.v=2;W.sport=0;W.my.sport=0;W.my.air=0;for(const n in W.co)W.co[n].sport=0;for(const k in W.sd)if(!/^part:|^tech:|^atech:|^air:/.test(k))delete W.sd[k];}
  // 0.46: сохранения 0.41–0.45 — марки одной компании под одним именем (Ford (Манчестер) → Ford), скользящая выручка у вас
  if(W.v<3){W.v=3;for(const n in W.co){const k=coKey(n);if(k===n||!k)continue;const o=W.co[n],q=wco(W,k,o.c);q.hp+=o.hp;q.rev+=o.rev;q.sport+=o.sport;q.firsts+=o.firsts;q.r12+=o.r12;for(const c in o.cu)q.cu[c]=(q.cu[c]||0)+o.cu[c];delete W.co[n];}if(W.my.r12==null){const r0=s.last||{};W.my.r12=12*(((r0.rev||0)/Math.max(0.5,1-dMargin(s)))+(r0.mil||0)+(r0.ord||0)+(r0.dump||0));}/* 0.48: годовая выручка — с последнего месяца, не с нуля */}
  // годовая выручка марок — скользящая: в начале месяца каждую сдвигаем на 1/12
  for(const n in W.co)W.co[n].r12*=11/12;W.my.r12=(W.my.r12||0)*11/12;
  // ---- вы
  {let hp=0,hpC=0,nC=0,hpM=0,nM=0;s.models.forEach(md=>{if(md.status!=='prod')return;let h=10;try{h=engineHp(parts(md).e,md);}catch(_){}
      const n=md.lastSold||0;hp+=n*h;if(isMoto(md)){hpM+=h;nM++;}else{hpC+=h;nC++;}});
    const avC=nC?hpC/nC:hpTyp('middle',y),avM=nM?hpM/nM:hpTyp('moto',y);hp+=((r.ordN||0)+(r.milN||0))*avC+(r.mordN||0)*avM;
    const R=r.air;let hpA=0,unA=0;if(R&&(R.sold||R.ordN)){const L=(s.air.models||[]).filter(m=>m.status==='prod');let sum=0;L.forEach(m=>{try{sum+=airStats(m,t).hpN||0;}catch(_){}});unA=(R.sold||0)+(R.ordN||0);hpA=unA*(L.length?sum/L.length:hpAir('sport',t));}
    const rev=(r.rev||0)/Math.max(0.5,1-dMargin(s))+(r.mil||0)+(r.ord||0)+(r.dump||0)+(R?(R.rev||0)+(R.ord||0)+(R.lic||0):0);
    wMine(W,s.country,hp+hpA,rev,(r.ordN||0)+(r.milN||0)+(r.mordN||0)*CU_MOTO+unA);
    // по странам — для узнаваемости и доли: продано у покупателей (мотоцикл — за четверть)
    s.models.forEach(md=>{if(md.status!=='prod'||!md.soldBy)return;const k=isMoto(md)?CU_MOTO:1;for(const c in md.soldBy){const M=W.my;M.cu[c]=(M.cu[c]||0)+md.soldBy[c]*k;W.cu[c]=(W.cu[c]||0)+md.soldBy[c]*k;}});
    const M=W.my;if(M.hpY>M.hpPeak)M.hpPeak=M.hpY;if(s.m===11)M.hpY=0;}
  // ---- автомобильные марки по истории: продажи месяца по классам (13-turn.js: x.lg) × типовая мощность и цена класса
  for(const c in COMPS){const L=(s.comps&&s.comps[c])||[];COMPS[c].forEach((cp,i)=>{const x=L[i];if(!x||!x.lg||pkIs(cp,s))return;let hp=0,rev=0,un=0;
      for(const g in x.lg){const n=x.lg[g]||0;if(!n)continue;un+=n;hp+=n*hpTyp(g,y);rev+=n*prefP(g,c,s);}
      if(!un)return;if(cp.imp){W.hp+=hp;W.rev+=rev;W.cu[c]=(W.cu[c]||0)+un;return;}// импорт — не компания, но мир
      if(heldByMe(s,c,i)){wMine(W,c,hp,rev,un);return;}/* 0.46: ваша дочерняя марка — в ваш зачёт */
      const own=(s.botAcq&&s.botAcq[cp.n])||coKey(cp.n);/* 0.41: марка, купленная ботом, — в его зачёт */wAdd(W,own,cp.c||c,c,hp,rev,un);});}
  // 0.41: экспорт живых соперников сверх истории (17b-bots.js: botSold → B.xs за этот месяц)
  if(s.bots&&botsOn(s))for(const n in s.bots){const B=s.bots[n];for(const c in (B.xs||{}))for(const g in B.xs[c]){const u=B.xs[c][g];if(u>0)wAdd(W,B.n,B.c,c,u*hpTyp(g,y),u*prefP(g,c,s),u);}}
  // ---- мотомарки (03c-moto.js): продажи месяца без разбивки по классам; покупатели — за четверть
  if(typeof MCOMPS!=='undefined')for(const c in MCOMPS){const L=(s.mcomps&&s.mcomps[c])||[];MCOMPS[c].forEach((cp,i)=>{const x=L[i];if(!x||!(x.last>0)||pkIs(cp,s))return;const h=hpTyp('moto',y)*1.05;
      if(cp.imp){W.hp+=x.last*h;W.rev+=x.last*prefMoto('moto',c,s);W.cu[c]=(W.cu[c]||0)+x.last*CU_MOTO;return;}wAdd(W,coKey(cp.n),c,c,x.last*h,x.last*prefMoto('moto',c,s),x.last*CU_MOTO);});}
  // ---- авиазаводы (105h-air.js): годовой рынок назначения в стране делят заводы по весу — двенадцатая часть в месяц
  if(typeof AIR_MKT!=='undefined'&&t>=1908)for(const c in AIR_MKT){for(const role of ['sport','train','recon','fight','bomb','sea','mail','pax']){const mk=airMktRole(c,role,t)/12;if(mk<0.05)continue;
      const L=airComps(c,role,t,s),sw=L.reduce((a,o)=>a+o.w,0);if(!sw)continue;const h=hpAir(role,t);let pr=2500;try{pr=airRefPrice(role,t);}catch(_){pr=1500+h*25;}
      L.forEach(o=>{const u=mk*o.w/sw;wAdd(W,coKey(o.x.n),c,c,u*h,u*pr,u);});}}
  // ---- гонки: все гонки эпохи с начала партии (s.startY), каждая один раз (W.sd). Отзыв 0.41: «победил 62 из 62 — как они считали?»:
  // раньше считались только итоги последних двух лет (s.cres), а победа в зачёте мотоциклов шла за победу в гонке. Теперь: в окне партии —
  // по итогам (s.cres, ждём их два месяца), раньше — по истории (histRaceWinner); зачёт мотоциклов — треть очков (большая 2, обычная 1)
  // тому, кто выиграл класс (мотомарка по истории или вы); ваши прежние победы — из журнала гонок (s.raceLog)
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
  // ---- первенства по истории (0.46: реестр innovLedger — детали, технологии, оснащение, новинки неба, перелёты): считаются, когда срок настал
  // и первенство не ушло вам (или боту — 0.41: бот опередил историю)
  {const taken=s.firsts||{},bf=s.botFirsts||{};innovLedger().forEach(I=>{const key=I.key;let hy=I.hy,cos=I.cos;const b=bf[key];if(b){hy=Math.min(hy,b.y);cos=[b.n];}
      if(W.fh[key]||y<hy)return;W.fh[key]=1;if(taken[key])return;W.firsts++;cos.forEach(n=>{wco(W,n,'').firsts++;});});}
  return W;}
/* ---------- таблица господства ---------- */
// узнаваемость: вес страны — корень из её рынка (люди, не машины: иначе Америка — 85 % мира), марку знают по её доле покупателей страны
function worldCo(s){const W=s.world;if(!W||!W.v)return [];
  const out=[];for(const n in W.co){const o=W.co[n];let cl=0;for(const c in o.cu)cl+=o.cu[c]||0;
    out.push({n,c:o.c,hp:o.hp,rev:o.rev,sport:o.sport,firsts:o.firsts,val:o.r12*VAL_K,cl,bot:!!(s.bots&&s.bots[n])});/* r12 — скользящая годовая выручка (каждый месяц ×11/12 плюс месяц) */}
  return out;}
// все покупатели мира с начала партии (и ввоз)
function worldClients(W){let cl=0;for(const c in W.cu)cl+=W.cu[c]||0;return cl;}
/* 0.46–0.47: одна мерка для всех — и для вас. Бренд — клиенты: сколько людей купили машину, мотоцикл или аэроплан марки с начала партии
   (раньше — узнаваемость в процентах; у вас считалась рекламная, 105-market.js: 3 % парка — две трети, 76 % мира в 1903 году при 9 % рынка);
   капитал — полторы годовые выручки, как у марок истории и соперников (оценка банкиров вашей компании в 1903 году давала $45 млн
   при выручке $5 млн — 53 % «капитала мира»). */
/* 0.48: капитал — снова оценка банкиров вашей компании (companyValue: касса, завод, запасы, вложения, прибыль ×7, купленные доли;
   отзыв 0.47: «у меня капитал не ноль, компания стоит 45 млн» — полторы выручки давали $0 на свежем сохранении); у марок истории
   и соперников — полторы годовые выручки, как и было. Дочерняя марка с контрольным пакетом в мир отдельно не идёт (0.46), так что
   её стоимость в вашей оценке не удваивает мир. */
function worldMine(s){const W=s.world;if(!W||!W.v)return null;const M=W.my;let cl=0;for(const c in M.cu)cl+=M.cu[c]||0;let val=0;try{val=Math.max(0,companyValue(s));}catch(_){val=Math.max(0,(M.r12||0)*VAL_K);}
  return {n:s.company,you:1,c:s.country,hp:M.hp,rev:M.rev,sport:(M.sport||0)+(M.air||0),firsts:firstsLive(s),val,cl};}
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
  if(typeof MCOMPS!=='undefined')for(const c in MCOMPS)MCOMPS[c].forEach(cp=>{const v=compVol(cp,ss)/12;if(!(v>0))return;const h=hpTyp('moto',yf0)*1.05,rev=v*prefMoto('moto',c,ss);H.hp+=v*h;H.rev+=rev;H.cu[c]=(H.cu[c]||0)+v*CU_MOTO;if(cp.imp)return;const o=hco(H,coKey(cp.n),c);o.hp+=v*h;o.rev+=rev;o.r12+=rev;o.cu[c]=(o.cu[c]||0)+v*CU_MOTO;});
  if(typeof AIR_MKT!=='undefined'&&t>=1908)for(const c in AIR_MKT)for(const role of ['sport','train','recon','fight','bomb','sea','mail','pax']){const mk=airMktRole(c,role,t)/12;if(mk<0.05)continue;
    const L=airComps(c,role,t,{pioneer:'__none__'}),sw=L.reduce((a,o)=>a+o.w,0);if(!sw)continue;const h=hpAir(role,t);let pr=2500;try{pr=airRefPrice(role,t);}catch(_){pr=1500+h*25;}
    L.forEach(o=>{const u=mk*o.w/sw,q=hco(H,coKey(o.x.n),c);q.hp+=u*h;q.rev+=u*pr;q.r12+=u*pr;q.cu[c]=(q.cu[c]||0)+u;H.hp+=u*h;H.rev+=u*pr;H.cu[c]=(H.cu[c]||0)+u;});}
  // гонки этого месяца — по истории; зачёт мотоциклов — треть
  const now=(y-1895)*12+m;RACES.forEach(rc=>{if((rc.y-1895)*12+rc.m!==now)return;const pts=rc.major?RACE_W.major:RACE_W.normal,w=histRaceWinner(rc);if(w){H.sport+=pts;hco(H,coKey(w),rc.c||'').sport+=pts;}
    const mw=histMotoWinner(rc,s);if(mw){const mp=rc.major?2:1;H.sport+=mp;hco(H,coKey(mw),'').sport+=mp;}});
  if(typeof AIR_EV!=='undefined')AIR_EV.forEach(ev=>{if(ev.y!==y||(ev.m||0)!==m)return;const pts=ev.open||ev.prize>=10000?RACE_W.major:RACE_W.normal;H.sport+=pts;if(ev.h&&ev.h[1])hco(H,coKey(ev.h[1]),ev.c||'').sport+=pts;});
  if(typeof AIR_REC!=='undefined')for(const kind in AIR_REC)AIR_REC[kind].forEach(r=>{const ry=Math.floor(r[0]),rm=Math.min(11,Math.floor((r[0]-ry)*12));if(ry!==y||rm!==m)return;H.sport+=4;const n=coKey(String(r[3]||'').split(/[ -]/)[0]);if(n)hco(H,n,'').sport+=4;});
  // первенства истории, наступившие в этом месяце (0.46: реестр innovLedger; год настал — считаем в январе, перелёт — в свой месяц)
  innovLedger().forEach(I=>{const hy=Math.floor(I.hy),hm=Math.min(11,Math.round((I.hy-hy)*12));if(hy!==y||hm!==m)return;H.firsts++;I.cos.forEach(n=>{hco(H,n,'').firsts++;});});
  H.at=now;}
/* 0.45 (отзыв: «победа по двум критериям: доминация в игре — больше половины всего — И превосходство над историческим рекордсменом по
   этому показателю за всю эпоху, сейчас до 1930 включительно»): рекорд эпохи — лучший итог настоящей истории 1895–1930 по категории,
   одно число на категорию, считается один раз за сеанс (HIST_ERA) по тем же месячным порциям histMonthAdd. Накопленные показатели
   (л. с., $, победы, первенства) — итог к концу 1930 года; капитал и узнаваемость — пик за эпоху. */
const ERA_END=1930;let HIST_ERA=null;
// рекорд эпохи: из сборки (16a-era.js, node tools/gen_era.js — 2,5 с счёта, в игре не считаем), иначе считаем на месте
function histEra(){if(HIST_ERA)return HIST_ERA;if(typeof HIST_ERA_DATA!=='undefined'&&HIST_ERA_DATA&&HIST_ERA_DATA.best)return HIST_ERA=HIST_ERA_DATA;return HIST_ERA=histEraCompute();}
function histEraCompute(){const H={v:1,at:-1,co:{},cu:{},hp:0,rev:0,sport:0,firsts:0},peakVal={},ss={country:'fr'};
  for(let k=0;k<(ERA_END-1895+1)*12;k++){const y=1895+Math.floor(k/12),m=k%12;try{histMonthAdd(ss,H,y,m);}catch(e){console.warn('era',e);}
    for(const n in H.co){const o=H.co[n],v=o.r12*VAL_K;if(!(peakVal[n]>=v))peakVal[n]=v;}}
  const best={};const pick=(k,f)=>{let b=null;for(const n in H.co){const v=f(n,H.co[n]);if(v>0&&(!b||v>b.v))b={n,v:Math.round(v),c:H.co[n].c};}best[k]=b;};
  pick('scale',(n,o)=>o.hp);pick('market',(n,o)=>o.rev);pick('sport',(n,o)=>o.sport);pick('capital',n=>peakVal[n]||0);pick('brand',(n,o)=>{let cl=0;for(const c in o.cu)cl+=o.cu[c]||0;return cl;});
  // 0.47: инновации — по таблице изобретений марок настоящей истории (16b-innov.js), а не по каталогу деталей игры (в нём у лучшей марки 7)
  const top=typeof histInnovTop==='function'?histInnovTop(1895,ERA_END):[];best.innov=top.length?{n:top[0].n,v:top[0].v,c:top[0].c}:(()=>{let b=null;for(const n in H.co){const v=H.co[n].firsts;if(v>0&&(!b||v>b.v))b={n,v,c:H.co[n].c};}return b;})();
  let cl=0;for(const c in H.cu)cl+=H.cu[c]||0;
  return {best,world:{hp:Math.round(H.hp),rev:Math.round(H.rev),sport:H.sport,firsts:H.firsts,cl:Math.round(cl)},innovTop:top.slice(0,8),y0:1895,y1:ERA_END};}
// рекорд эпохи по категории: {n, v}
function histBest(s,k){const E=histEra();return E&&E.best[k]||null;}
/* ---------- 0.46: победа — по двум категориям сразу ----------
   Отзыв 0.45: «одержал победу по инновациям очень рано… необходима доминация и историческое превосходство по двум направлениям».
   В каждой из двух категорий — оба условия: доля ≥ 50 % живого мира (и больше любого соперника) И больше рекорда эпохи. То же для ботов. */
const DOM_NEED=2;
function domTable(s){const W=s.world;if(!W||!W.v)return null;const me=worldMine(s),L=worldCo(s),age=(mi(s)-(W.since||0))/12,out={};
  const tot={scale:W.hp,market:W.rev,sport:W.sport,innov:W.firsts+me.firsts,capital:L.reduce((a,o)=>a+o.val,0)+me.val,brand:worldClients(W)};
  const f={scale:'hp',market:'rev',sport:'sport',innov:'firsts',capital:'val',brand:'cl'};
  DOM_K.forEach(k=>{const key=f[k];let lead=null;L.forEach(o=>{if(!lead||o[key]>lead.v)lead={n:o.n,v:o[key],c:o.c,bot:o.bot};});
    const mine=me[key],world=Math.max(tot[k],mine),share=world>0?mine/world:0;
    const ripe=world>=DOM_FLOOR[k];let hist=null;try{hist=histBest(s,k);}catch(e){console.warn('histBest',e);}
    // 0.45: в категории два условия — больше половины живого мира И больше рекорда эпохи (1895–1930) по ней
    const domOk=ripe&&share>=DOM_SHARE&&(!lead||mine>lead.v)&&mine>0,histOk=!hist||mine>hist.v;
    out[k]={mine,world,share,lead,ripe,hist,domOk,histOk,ok:domOk&&histOk,leadShare:lead?(world>0?lead.v/world:0):0,histShare:hist?(world>0?hist.v/world:0):0};});
  return out;}
// категории, где у вас выполнены оба условия
function domHeld(T){return T?DOM_K.filter(k=>T[k].ok):[];}
// бот (или любая живая компания) господствует: в двух категориях доля ≥ 50 %, больше всех (включая вас) и больше рекорда эпохи
function domBots(s){const W=s.world;if(!W||!W.v||!s.bots)return null;const me=worldMine(s),L=worldCo(s),f={scale:'hp',market:'rev',sport:'sport',innov:'firsts',capital:'val',brand:'cl'};
  const tot={scale:W.hp,market:W.rev,sport:W.sport,innov:W.firsts+me.firsts,capital:L.reduce((a,o)=>a+o.val,0)+me.val,brand:worldClients(W)};
  for(const o of L){if(!o.bot)continue;const got=[];
    for(const k of DOM_K){const key=f[k],world=tot[k];if(world<DOM_FLOOR[k])continue;let hist=null;try{hist=histBest(s,k);}catch(_){}
      const v=o[key],share=v/Math.max(1e-9,world);if(share<DOM_SHARE||v<=me[key])continue;if(L.some(q=>q!==o&&q[key]>=v))continue;if(hist&&v<=hist.v)continue;got.push({k,share});}
    if(got.length>=DOM_NEED)return {n:o.n,c:o.c,ks:got.map(x=>x.k),shares:got.map(x=>x.share),k:got[0].k,share:got[0].share};}
  return null;}
function domCheck(s){if(!s.world||!s.world.v||s.over)return;const T=domTable(s);if(!T)return;
  // сохранения 0.41–0.45: победа по одной категории — по правилам 0.46 остаётся, только если категорий уже две; иначе партия продолжается
  if(s.dom&&!s.dom.ks){const ks=domHeld(T);if(ks.length>=DOM_NEED)s.dom.ks=ks.slice(0,DOM_NEED);else{delete s.dom;
      // 0.48: и трофей той победы («Господство: инновации… рекорд эпохи Cadillac: 5») — из витрины, и +100 наследия — назад
      if(s.trophies){const n0=s.trophies.length;s.trophies=s.trophies.filter(t=>!(t.key&&/^dom\|/.test(t.key))&&!/^Господство:/.test(t.title||''));if(s.trophies.length<n0)s.legBonus=Math.max(0,(s.legBonus||0)-100);}
      addLog('Правила 0.46: господство — по двум категориям сразу, в каждой больше половины мира и больше рекорда эпохи. Прежняя победа по одной категории снята, партия продолжается.','');}}
  if(s.domLost&&!s.domLost.ks){const b=domBots(s);if(b)s.domLost.ks=b.ks;else delete s.domLost;}
  if(!s.dom){const ks=domHeld(T);if(ks.length>=DOM_NEED){s.dom={k:ks[0],ks:ks.slice(0,DOM_NEED),y:s.y,m:s.m,who:'you'};domWin(s,s.dom.ks,T);return;}}
  if(!s.domLost&&!s.dom){const b=domBots(s);if(b){s.domLost={k:b.k,ks:b.ks,n:b.n,y:s.y,m:s.m};domLose(s,b);}}}
function domFmt(k,v){if(k==='brand')return fmtN(Math.round(v))+' клиентов';if(k==='market'||k==='capital')return money(v);if(k==='scale')return fmtN(Math.round(v))+' л. с.';return fmtN(Math.round(v));}
function domNames(ks){return (ks||[]).map(k=>DOM_N[k].toLowerCase()).join(' и ');}
function domHistTxt(k,T){return T&&T.hist?` Рекорд всей эпохи ${histEra().y0}–${histEra().y1} — ${T.hist.n}: ${domFmt(k,T.hist.v)} — остался позади.`:'';}
function domWin(s,ks,T){const names=domNames(ks),story=ks.map(k=>DOM_STORY[k](s,T[k])+domHistTxt(k,T[k])).join('\n');
  try{celebrate('Господство!',`${names} — «${s.company}»`,'🏛','legacy');}catch(_){}
  try{trophyAdd(s,{kind:'record',title:`Господство: ${names}`,sub:`${dstr(s)} · ${ks.map(k=>Math.round(T[k].share*100)+' % мира').join(', ')}`,story,key:'dom|'+ks.join('+'),pt:'Господство!'});}catch(_){}
  s.legBonus=(s.legBonus||0)+100;s.rep=clamp(s.rep+10,0,100);
  pushEvent({own:1,kicker:'Экстренный выпуск',title:`«${s.company}» господствует: ${names}`,deck:ks.map(k=>`${DOM_N[k].toLowerCase()} — ${Math.round(T[k].share*100)} % мира${T[k].lead?` (ближайший соперник ${esc(T[k].lead.n)}, ${Math.round(T[k].leadShare*100)} %)`:''}`).join('; '),
    text:story+`\nКак в «Цивилизации», это победа: доминирующее положение в двух из шести категорий наследия — больше половины живого мира и больше рекорда всей эпохи в каждой, считая с первого дня компании. Можно играть дальше — до 1930 года и других категорий — или подвести итог эпохи.`,
    choices:[['Экран победы','domScreen'],['Играть дальше','ok']]},true);}
function domLose(s,b){const names=domNames(b.ks||[b.k]);
  pushEvent({own:1,noArt:1,kicker:'Экстренный выпуск',title:`${esc(b.n)} господствует: ${names}`,deck:`${(b.ks||[b.k]).map((k,i)=>`${DOM_N[k].toLowerCase()} — ${Math.round((b.shares?b.shares[i]:b.share)*100)} % мира`).join(', ')} — больше, чем у кого бы то ни было, включая «${s.company}», и больше рекорда эпохи`,
    text:`Соперник первым занял доминирующее положение в двух категориях — «${(b.ks||[b.k]).map(k=>DOM_N[k]).join('» и «')}» — считая с начала эпохи, с ${1895+Math.floor((s.world.since||0)/12)} года. По правилам «Цивилизации» это его победа: он отныне задаёт тон в отрасли.\nПартия не окончена: можно играть дальше — отобрать у него первенство или победить в других категориях — либо подвести итог эпохи.`,
    choices:[['Экран итога','domScreen'],['Играть дальше','ok']]},true);}
const DOM_STORY={
  scale:(s,T)=>`С начала эпохи в мире продано ${fmtN(Math.round(T.world))} лошадиных сил в автомобилях, мотоциклах и аэропланах — и больше половины из них, ${fmtN(Math.round(T.mine))}, сошли с ваших заводов. Так в истории не удавалось даже Форду: его доля в накопленном выпуске мира к 1929 году — около двух пятых.`,
  market:(s,T)=>`Из каждых двух долларов, оставленных покупателями в отрасли с начала эпохи, один достался «${s.company}»: выручка ${money(T.mine)} при мировой ${money(T.world)}.`,
  sport:(s,T)=>`Больше половины побед эпохи — в больших гонках, перелётах и рекордах — на счету ваших машин: ${fmtN(Math.round(T.mine))} очков из ${fmtN(Math.round(T.world))} мировых.`,
  innov:(s,T)=>`Больше половины новинок эпохи мир увидел первыми на ваших машинах: ${Math.round(T.mine)} первенств из ${Math.round(T.world)}. Историки будут писать, что автомобиль изобрели у вас.`,
  capital:(s,T)=>`Стоимость «${s.company}» — ${money(T.mine)} — больше, чем все остальные автомобильные, мотоциклетные и авиационные компании мира вместе взятые (${money(T.world-T.mine)}).`,
  brand:(s,T)=>`Каждый второй покупатель мира — ваш клиент: с начала эпохи машины, мотоциклы и аэропланы «${s.company}» купили ${fmtN(Math.round(T.mine))} человек из ${fmtN(Math.round(T.world))}.`};
/* ---------- карточка «Господство» (вкладка «Империя») и экран итога ---------- */
// как считается каждая категория — одной строкой под шкалой (отзыв 0.41: «62 из 62 — как они считали?»); 0.46: у всех одна мерка
const DOM_HOW={scale:'лошадиные силы всех проданных машин, мотоциклов и аэропланов мира — с начала партии',market:'выручка всех марок мира — машины, мотоциклы, аэропланы — в долларах, с начала партии',
  sport:'победы с начала партии во всех гонках эпохи: большая гонка 6 очков, обычная 2, зачёт мотоциклов 2/1, перелёт или гонка в небе 6/2, рекорд 4',
  innov:'первенства: кто первым в мире сделал деталь, технологию, новинку оснащения или неба, совершил перелёт — история, вы, живые соперники; мир — по каталогу игры (86 первенств эпохи), рекорд эпохи — по таблице изобретений марок настоящей истории',
  capital:'стоимость компаний: марки истории и соперники — полторы годовые выручки; ваша — оценка банкиров (касса, завод, запасы, вложения, прибыль, купленные доли)',
  brand:'клиенты: сколько людей купили машину, мотоцикл или аэроплан марки с начала партии — у всех одна мерка'};
function domCard(s){const T=domTable(s);if(!T)return `<section class="card" id="sec-dom"><div class="row"><h2>Господство</h2></div><p class="small muted" style="margin-top:4px">Мировой итог копится с первого хода: лошадиные силы, доллары, победы, первенства, капитал, узнаваемость. Господство — две категории из шести: в каждой больше половины мира и больше рекорда эпохи.</p></section>`;
  const held=domHeld(T),near=DOM_K.filter(k=>!held.includes(k)).sort((a,b)=>Math.min(T[b].share/DOM_SHARE,T[b].hist?T[b].mine/T[b].hist.v:1)-Math.min(T[a].share/DOM_SHARE,T[a].hist?T[a].mine/T[a].hist.v:1));
  const rows=DOM_K.map(k=>{const q=T[k],pct=Math.round(q.share*1000)/10,lp=Math.round(q.leadShare*1000)/10,won=q.ok;
    return `<div class="dom-row ${won?'won':''}"><div class="row"><span>${DOM_N[k]}${k==='brand'?' <span class="muted small">клиенты</span>':''}${won?' <span class="pill good">господство</span>':q.domOk?' <span class="pill muted">половина мира</span>':''}</span><b class="num">${pct.toFixed(pct<10?1:0).replace('.',',')} %</b></div>
      <div class="bar dom-bar"><i style="width:${Math.min(100,q.share/DOM_SHARE*100)}%"></i>${q.lead?`<u style="left:${Math.min(100,q.leadShare/DOM_SHARE*100)}%" title="${esc(q.lead.n)}"></u>`:''}${q.hist?`<u class="hist" style="left:${Math.min(100,q.histShare/DOM_SHARE*100)}%" title="в истории: ${esc(q.hist.n)}"></u>`:''}</div>
      <p class="small muted">${q.lead?`лидер — ${esc(q.lead.n)}${q.lead.bot?' <span class="pill muted">живой</span>':''}: ${lp.toFixed(lp<10?1:0).replace('.',',')} %`:'соперников нет'} · вы: ${domFmt(k,q.mine)} · мир: ${domFmt(k,q.world)}${q.ripe?'':' · <span class="warn">мир ещё мал</span>'}</p>
      ${q.hist?`<p class="small ${q.histOk?'good':'muted'}">рекорд эпохи (${histEra().y0}–${histEra().y1}) — ${esc(q.hist.n)}: ${domFmt(k,q.hist.v)}${q.histOk?' — вы уже выше':' — нужно больше'}${k==='innov'?' · <button class="linkbtn small" data-act="innovTable">изобретения марок ›</button>':''}</p>`:''}
      <p class="small muted dom-how">${DOM_HOW[k]}</p></div>`;}).join('');
  const pill=s.dom?`победа: ${domNames(s.dom.ks||[s.dom.k])} · ${s.dom.y}`:`${held.length} из ${DOM_NEED}`;
  return `<section class="card" id="sec-dom"><div class="row"><h2>Господство</h2><span class="pill ${s.dom?'good':held.length?'warn':'muted'}">${pill}</span></div>
    <p class="small muted" style="margin-top:4px">Победа, как в «Цивилизации», — по двум категориям из шести сразу. В каждой два условия: больше половины мира — с первого дня компании, считая всех: марки по истории, живых соперников, мотомарки и авиазаводы, — и больше рекорда эпохи, лучшего итога настоящей истории ${histEra().y0}–${histEra().y1} по этой категории. Всё суммарно по автомобилям, мотоциклам и аэропланам, у всех одна мерка.${held.length?` Уже ваши: ${domNames(held)}.`:''}${near.length?` Ближе всего — ${DOM_N[near[0]].toLowerCase()}.`:''}</p>
    <div style="margin-top:8px">${rows}</div>${s.domLost?`<p class="small bad" style="margin-top:6px">${esc(s.domLost.n)} держит господство: ${domNames(s.domLost.ks||[s.domLost.k])} (${MONTHS[s.domLost.m]} ${s.domLost.y}).</p>`:''}</section>`;}
function domScreenHTML(s){const T=domTable(s),t=legacyTable(s),ks=s.dom?(s.dom.ks||[s.dom.k]):(s.domLost?(s.domLost.ks||[s.domLost.k]):[]),win=!!s.dom;
  const head=win?`<h2>Победа: ${domNames(ks)}</h2><p class="small">${MONTHS[s.dom.m]} ${s.dom.y} · «${esc(s.company)}» — ${ks.map(k=>Math.round(T[k].share*100)+' % мира').join(', ')}</p>`:s.domLost?`<h2>${esc(s.domLost.n)} господствует</h2><p class="small">${ks.map(k=>DOM_N[k]).join(', ')} · ${MONTHS[s.domLost.m]} ${s.domLost.y}</p>`:'<h2>Господство</h2>';
  return `<div class="dom-screen">${head}${T?DOM_K.map(q=>`<div class="row small"><span>${DOM_N[q]}${T[q].ok?' ✓':''}</span><span class="num">${Math.round(T[q].share*100)} %${T[q].lead?` <span class="muted">· ${esc(T[q].lead.n)} ${Math.round(T[q].leadShare*100)} %</span>`:''}${T[q].hist?` <span class="muted">· рекорд эпохи: ${esc(T[q].hist.n)} ${domFmt(q,T[q].hist.v)}</span>`:''}</span></div>`).join(''):''}
    <p class="small muted" style="margin-top:8px">Наследие: ${t.place}-е место среди компаний эпохи, ${Math.round(t.me.total)} очков${win?' (+100 за господство)':''}.</p>
    <div class="row" style="margin-top:12px;gap:8px"><button class="btn primary" data-act="close">Играть дальше</button><button class="btn" data-act="final">Сравнить с историей</button></div></div>`;}
