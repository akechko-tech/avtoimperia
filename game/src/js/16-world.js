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
function raceByKey(k){if(!RACE_BY_KEY.__n||RACE_BY_KEY.__n!==RACES.length){for(const q in RACE_BY_KEY)delete RACE_BY_KEY[q];RACES.forEach(r=>RACE_BY_KEY[r.key]=r);RACE_BY_KEY.__n=RACES.length;}return RACE_BY_KEY[k];}
/* ---------- накопители ---------- */
function worldInit(s){return s.world={v:1,since:mi(s),hp:0,rev:0,sport:0,firsts:0,co:{},cu:{},sd:{},my:{hp:0,rev:0,hpY:0,hpPeak:0,cu:{}},fh:{}};}
function wco(W,n,c){let o=W.co[n];if(!o)o=W.co[n]={hp:0,rev:0,sport:0,firsts:0,r12:0,cu:{},c:c||''};else if(c&&!o.c)o.c=c;return o;}
function wAdd(W,n,c,country,hp,rev,units){const o=wco(W,n,c);o.hp+=hp;o.rev+=rev;o.r12+=rev;W.hp+=hp;W.rev+=rev;
  if(units&&country){o.cu[country]=(o.cu[country]||0)+units;W.cu[country]=(W.cu[country]||0)+units;}}
// месяц мира: после рынка (13-turn.js) — что продали вы, марки по истории, мотомарки и авиазаводы; кто выиграл гонки; чьи первенства
function worldMonth(s,r){const W=s.world&&s.world.v?s.world:worldInit(s),y=yf(s),t=tNow(s);
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
      wAdd(W,cp.n,cp.c||c,c,hp,rev,un);});}
  // ---- мотомарки (03c-moto.js): продажи месяца без разбивки по классам
  if(typeof MCOMPS!=='undefined')for(const c in MCOMPS){const L=(s.mcomps&&s.mcomps[c])||[];MCOMPS[c].forEach((cp,i)=>{const x=L[i];if(!x||!(x.last>0))return;const h=hpTyp('moto',y)*1.05;
      if(cp.imp){W.hp+=x.last*h;W.rev+=x.last*prefMoto('moto',c,s);return;}wAdd(W,coKey(cp.n),c,c,x.last*h,x.last*prefMoto('moto',c,s),0);});}
  // ---- авиазаводы (105h-air.js): годовой рынок назначения в стране делят заводы по весу — двенадцатая часть в месяц
  if(typeof AIR_MKT!=='undefined'&&t>=1908)for(const c in AIR_MKT){for(const role of ['sport','train','recon','fight','bomb','sea','mail','pax']){const mk=airMktRole(c,role,t)/12;if(mk<0.05)continue;
      const L=airComps(c,role,t,s),sw=L.reduce((a,o)=>a+o.w,0);if(!sw)continue;const h=hpAir(role,t);let pr=2500;try{pr=airRefPrice(role,t);}catch(_){pr=1500+h*25;}
      L.forEach(o=>wAdd(W,coKey(o.x.n),c,'',mk*o.w/sw*h,mk*o.w/sw*pr,0));}}
  // ---- гонки: кто выиграл (43-season.js: s.cres) — очки компании-победителю
  for(const k in (s.cres||{})){if(W.sd[k])continue;const cr=s.cres[k];if(!cr||cr.x){W.sd[k]=1;continue;}const rc=raceByKey(k);if(!rc){W.sd[k]=1;continue;}
    const pts=rc.major?RACE_W.major:RACE_W.normal;W.sd[k]=1;if(!cr.w)continue;W.sport+=pts;
    if(cr.me===1||cr.w===s.company){W.my.sport=(W.my.sport||0)+pts;}else wco(W,coKey(cr.w),cr.c||'').sport+=pts;}
  // ---- небо: ваши победы и рекорды — как в наследии (airSportYears); чужие — по истории состязаний, когда год прошёл
  try{const mine=airSportYears(s).reduce((a,[y2,v])=>a+v,0);W.my.air=mine;}catch(_){}
  if(typeof AIR_EV!=='undefined'){const A=s.air;AIR_EV.forEach(ev=>{const k='air|'+ev.key;if(W.sd[k]||ev.y>s.y-(ev.m!==undefined&&ev.m<=s.m?0:1))return;W.sd[k]=1;const pts=ev.open||ev.prize>=10000?RACE_W.major:RACE_W.normal;W.sport+=pts;
      const mineWin=A&&A.ev&&A.ev[ev.key]&&A.ev[ev.key].place===1;if(!mineWin&&ev.h&&ev.h[1])wco(W,coKey(ev.h[1]),ev.c||'').sport+=pts;});}
  // ---- первенства по истории: кто и когда впервые (PART_HIST, TECH) — считаются, когда год настал и первенство не ушло вам (или боту)
  {const taken=s.firsts||{};const put=(key,hy,who)=>{if(W.fh[key]||y<hy)return;W.fh[key]=1;if(taken[key])return;W.firsts++;const n=coKey(String(who).split(/,| и /)[0].replace(/\(.*$/,'').trim());if(n)wco(W,n,'').firsts++;};
    for(const id in PART_HIST)put('part:'+id,PART_HIST[id][0],PART_HIST[id][1]);
    for(const k in TECH)(TECH[k].lv||[]).forEach((lv,i)=>{if(lv.hist)put('tech:'+k+':'+(i+1),lv.hist[0],lv.hist[1]);});
    if(typeof AIR_TECH!=='undefined')AIR_TECH.forEach(T=>put('air_'+T.id,Math.floor(T.y),T.who));}
  return W;}
/* ---------- таблица господства ---------- */
function worldCo(s){const W=s.world;if(!W||!W.v)return [];const y=yf(s),mk=c=>(s.mkY&&s.mkY[c])||1000;let msum=0;for(const c in COUNTRIES)msum+=mk(c);
  const out=[];for(const n in W.co){const o=W.co[n];let aw=0;for(const c in COUNTRIES){const sh=W.cu[c]?(o.cu[c]||0)/W.cu[c]:0;aw+=Math.min(1,Math.sqrt(sh/0.2))*mk(c)/msum;}
    out.push({n,c:o.c,hp:o.hp,rev:o.rev,sport:o.sport,firsts:o.firsts,val:o.r12*VAL_K,aw,bot:!!(s.bots&&s.bots[n])});/* r12 — скользящая годовая выручка (каждый месяц ×11/12 плюс месяц) */}
  return out;}
function worldMine(s){const W=s.world;if(!W||!W.v)return null;const mk=c=>(s.mkY&&s.mkY[c])||1000;let msum=0,aw=0;for(const c in COUNTRIES){msum+=mk(c);}for(const c in COUNTRIES)aw+=clamp(awOf(s,c),0,1)*mk(c)/msum;
  return {n:s.company,you:1,c:s.country,hp:W.my.hp,rev:W.my.rev,sport:(W.my.sport||0)+(W.my.air||0),firsts:firstsLive(s),val:Math.max(0,companyValue(s)),aw};}
function domTable(s){const W=s.world;if(!W||!W.v)return null;const me=worldMine(s),L=worldCo(s),age=(mi(s)-(W.since||0))/12,out={};
  const tot={scale:W.hp,market:W.rev,sport:W.sport,innov:W.firsts+me.firsts,capital:L.reduce((a,o)=>a+o.val,0)+me.val,brand:1};
  const f={scale:'hp',market:'rev',sport:'sport',innov:'firsts',capital:'val',brand:'aw'};
  DOM_K.forEach(k=>{const key=f[k];let lead=null;L.forEach(o=>{if(!lead||o[key]>lead.v)lead={n:o.n,v:o[key],c:o.c,bot:o.bot};});
    const mine=me[key],world=k==='brand'?1:Math.max(tot[k],mine),share=k==='brand'?mine:(world>0?mine/world:0);
    const ripe=k==='brand'?age>=DOM_FLOOR.brand:world>=DOM_FLOOR[k];
    out[k]={mine,world,share,lead,ripe,ok:ripe&&share>=DOM_SHARE&&(!lead||mine>lead.v)&&mine>0,leadShare:lead?(k==='brand'?lead.v:(world>0?lead.v/world:0)):0};});
  return out;}
// бот (или любая живая компания) держит господство: доля ≥ 50 % и больше всех, включая вас
function domBots(s){const W=s.world;if(!W||!W.v||!s.bots)return null;const me=worldMine(s),L=worldCo(s),age=(mi(s)-(W.since||0))/12,f={scale:'hp',market:'rev',sport:'sport',innov:'firsts',capital:'val',brand:'aw'};
  const tot={scale:W.hp,market:W.rev,sport:W.sport,innov:W.firsts+me.firsts,capital:L.reduce((a,o)=>a+o.val,0)+me.val};
  for(const k of DOM_K){const key=f[k],world=k==='brand'?1:tot[k];if(k==='brand'?age<DOM_FLOOR.brand:world<DOM_FLOOR[k])continue;
    for(const o of L){if(!o.bot)continue;const v=o[key],share=k==='brand'?v:v/Math.max(1e-9,world);if(share<DOM_SHARE||v<=me[key])continue;if(L.some(q=>q!==o&&q[key]>=v))continue;return {k,n:o.n,c:o.c,share};}}
  return null;}
function domCheck(s){if(!s.world||!s.world.v||s.over)return;const T=domTable(s);if(!T)return;
  if(!s.dom){const k=DOM_K.find(q=>T[q].ok);if(k){s.dom={k,y:s.y,m:s.m,who:'you'};domWin(s,k,T[k]);return;}}
  if(!s.domLost&&!s.dom){const b=domBots(s);if(b){s.domLost={k:b.k,n:b.n,y:s.y,m:s.m};domLose(s,b);}}}
function domFmt(k,v){if(k==='brand')return Math.round(v*100)+' %';if(k==='market'||k==='capital')return money(v);if(k==='scale')return fmtN(Math.round(v))+' л. с.';return fmtN(Math.round(v));}
function domWin(s,k,T){const name=DOM_N[k];try{celebrate('Господство!',`${name}: ${Math.round(T.share*100)} % мира — «${s.company}»`,'🏛','legacy');}catch(_){}
  try{trophyAdd(s,{kind:'record',title:`Господство: ${name.toLowerCase()}`,sub:`${dstr(s)} · ${Math.round(T.share*100)} % мира`,story:DOM_STORY[k](s,T),key:'dom|'+k,pt:'Господство!'});}catch(_){}
  s.legBonus=(s.legBonus||0)+100;s.rep=clamp(s.rep+10,0,100);
  pushEvent({own:1,kicker:'Экстренный выпуск',title:`«${s.company}» господствует: ${name.toLowerCase()}`,deck:`${Math.round(T.share*100)} % всего мира по этому показателю${T.lead?` — ближайший соперник, ${esc(T.lead.n)}, ${Math.round(T.leadShare*100)} %`:''}`,
    text:DOM_STORY[k](s,T)+`\nКак в «Цивилизации», это победа: вы заняли доминирующее положение в одной из шести категорий наследия, считая с первого дня компании. Можно играть дальше — до 1930 года и других категорий — или подвести итог эпохи.`,
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
function domCard(s){const T=domTable(s);if(!T)return `<section class="card" id="sec-dom"><div class="row"><h2>Господство</h2></div><p class="small muted" style="margin-top:4px">Мировой итог копится с первого хода: лошадиные силы, доллары, победы, первенства, капитал, узнаваемость. Господство — половина мира по любой из шести категорий и больше любого соперника.</p></section>`;
  const best=DOM_K.slice().sort((a,b)=>T[b].share-T[a].share)[0];
  const rows=DOM_K.map(k=>{const q=T[k],pct=Math.round(q.share*1000)/10,lp=Math.round(q.leadShare*1000)/10,won=s.dom&&s.dom.k===k;
    return `<div class="dom-row ${won?'won':''}"><div class="row"><span>${DOM_N[k]}${won?' <span class="pill good">господство</span>':''}</span><b class="num">${pct.toFixed(pct<10?1:0).replace('.',',')} %</b></div>
      <div class="bar dom-bar"><i style="width:${Math.min(100,q.share/DOM_SHARE*100)}%"></i>${q.lead?`<u style="left:${Math.min(100,q.leadShare/DOM_SHARE*100)}%" title="${esc(q.lead.n)}"></u>`:''}</div>
      <p class="small muted">${q.lead?`лидер — ${esc(q.lead.n)}${q.lead.bot?' <span class="pill muted">живой</span>':''}: ${lp.toFixed(lp<10?1:0).replace('.',',')} %`:'соперников нет'} · мир: ${k==='brand'?'узнаваемость с весом рынков':domFmt(k,q.world)}${q.ripe?'':' · <span class="warn">мир ещё мал</span>'}</p></div>`;}).join('');
  return `<section class="card" id="sec-dom"><div class="row"><h2>Господство</h2><span class="pill ${s.dom?'good':'muted'}">${s.dom?DOM_N[s.dom.k]+' '+s.dom.y:'цель — 50 %'}</span></div>
    <p class="small muted" style="margin-top:4px">Как в «Цивилизации»: половина мира по любой из шести категорий — с первого дня компании, считая всех: марки по истории, живых соперников и авиазаводы. Ближе всего — ${DOM_N[best].toLowerCase()}.</p>
    <div style="margin-top:8px">${rows}</div>${s.domLost?`<p class="small bad" style="margin-top:6px">${esc(s.domLost.n)} держит господство: ${DOM_N[s.domLost.k].toLowerCase()} (${MONTHS[s.domLost.m]} ${s.domLost.y}).</p>`:''}</section>`;}
function domScreenHTML(s){const T=domTable(s),t=legacyTable(s),k=s.dom?s.dom.k:(s.domLost?s.domLost.k:null),win=!!s.dom;
  const head=win?`<h2>Победа: ${DOM_N[k].toLowerCase()}</h2><p class="small">${MONTHS[s.dom.m]} ${s.dom.y} · «${esc(s.company)}» — ${Math.round(T[k].share*100)} % мира</p>`:s.domLost?`<h2>${esc(s.domLost.n)} господствует</h2><p class="small">${DOM_N[k]} · ${MONTHS[s.domLost.m]} ${s.domLost.y}</p>`:'<h2>Господство</h2>';
  return `<div class="dom-screen">${head}${T?DOM_K.map(q=>`<div class="row small"><span>${DOM_N[q]}</span><span class="num">${Math.round(T[q].share*100)} %${T[q].lead?` <span class="muted">· ${esc(T[q].lead.n)} ${Math.round(T[q].leadShare*100)} %</span>`:''}</span></div>`).join(''):''}
    <p class="small muted" style="margin-top:8px">Наследие: ${t.place}-е место среди компаний эпохи, ${Math.round(t.me.total)} очков${win?' (+100 за господство)':''}.</p>
    <div class="row" style="margin-top:12px;gap:8px"><button class="btn primary" data-act="close">Играть дальше</button><button class="btn" data-act="final">Сравнить с историей</button></div></div>`;}
