/* ================= 0.29: СОБЫТИЯ ГОНКИ ВИДНЫ НА ТРАССЕ =================
   Раньше титр «ТОЛПА НА ДОРОГЕ!» или «РЕЙМС» всплывал по доле пути, а на экране ничего не происходило.
   Теперь у каждого титра есть вид, и то, о чём он говорит, стоит на дороге:
   road  — зрители стоят прямо на дороге и расступаются перед каждой машиной в последний миг, а потом снова выходят посмотреть вслед;
   line  — толпа вдоль обеих обочин; guard — солдаты (жандармы) цепью; post — пост: таможня, контроль, судьи с часами;
   town  — въезд в город: табличка с названием и зрители; если рядом на карте настоящий город или село — титр у его въезда;
   pass, summit, climb, desc — высшая точка участка, вершина, самый крутой подъём, спуск;
   sea, tunnel, bridge, forest, straight, turn, stand, pits, finish, lm — титр тогда, когда это видно с дороги;
   storm — поваленные бурей деревья у дороги; sbag — шиканы из мешков с песком;
   chron — хроника исторической гонки (что было с другими): помечена «ИЗ ХРОНИКИ», на дороге её не ищут;
   start, atmo — у старта, погода и время суток (их и так видно).
   Титр показывается, когда до места остаётся lead метров. */
const SCN_EVX={
  'РУФЕК, 3 ЧАСА НОЧИ. СМЕНЩИК ЛЕВАССОРА ЕЩЁ СПИТ — ОН ЕДЕТ ДАЛЬШЕ САМ':{k:'town',nm:'RUFFEC',night:1},
  'БОРДО! РАЗВОРОТ — И ОБРАТНО В ПАРИЖ':{k:'town',nm:'BORDEAUX',crowd:1},
  'ПАРИЖ, ВОРОТА МАЙО: ТОЛПА ЖДЁТ ПОБЕДИТЕЛЯ':{k:'town',nm:'PARIS',fin:1,crowd:2},
  'ДУРЬЕА ЧИНИТ РУЛЕВОЕ В КУЗНИЦЕ У ДОРОГИ':{k:'chron'},
  'ФИНИШ В ТЕМНОТЕ. ДО КОНЦА ДОБРАЛИСЬ ЛИШЬ ДВЕ МАШИНЫ':{k:'finish',lbl:'КАК ЭТО БЫЛО'},
  'БУРЯ! ДЕРЕВЬЯ ПОПЕРЁК ДОРОГИ':{k:'storm'},
  'ЛЕВАССОР ОБЪЕЗЖАЕТ СОБАКУ И ПЕРЕВОРАЧИВАЕТСЯ':{k:'chron'},
  'КРАСНЫЙ ФЛАГ РАЗОРВАН! ТЕПЕРЬ — ДО 14 МИЛЬ В ЧАС':{k:'chron'},
  'БРАЙТОН. СТЕМНЕЛО — ПОСЛЕДНИЕ ДОБИРАЮТСЯ С ФОНАРЯМИ':{k:'town',nm:'BRIGHTON',fin:1,crowd:1},
  'БЕЛЬГИЙСКАЯ ГРАНИЦА. ТАМОЖНЯ МАШЕТ: ПРОЕЗЖАЙТЕ':{k:'post',nm:'BELGIQUE'},
  'АМСТЕРДАМ, ПЛОТИНЫ И КАНАЛЫ':{k:'town',nm:'AMSTERDAM',crowd:1},
  'ПЫЛЬ ТАКАЯ, ЧТО ЕДУТ ПО ТЕНИ ДЕРЕВЬЕВ':{k:'forest'},
  'ДЕРЕВНЯ ВЫСЫПАЛА НА ДОРОГУ':{k:'road',vill:1},
  'ПЕРЕВАЛ ШАП-ФЕЛЛ. МОТОРЫ ЕДВА ТЯНУТ':{k:'pass',nm:'SHAP SUMMIT'},
  'ЛОНДОН ВСТРЕЧАЕТ ТЕХ, КТО ДОЕХАЛ':{k:'town',nm:'LONDON',fin:1,crowd:2},
  'У ШАРРОНА В РУЛЕВОМ ЗАСТРЯЛА СОБАКА — ОН ЕДЕТ ДАЛЬШЕ':{k:'chron'},
  'ЛИОН':{k:'town',nm:'LYON',fin:1,crowd:1},
  'РЕЙМС. ЗРИТЕЛИ ВЫБЕГАЮТ НА ДОРОГУ':{k:'road',nm:'REIMS'},
  'ГЕРМАНИЯ. НА ОБОЧИНАХ — СОЛДАТЫ':{k:'guard',nm:'DEUTSCHES REICH'},
  'БЕРЛИН, ФИНИШ НА ИППОДРОМЕ':{k:'town',nm:'BERLIN',fin:1,crowd:2},
  'ШВЕЙЦАРИЯ: НЕЙТРАЛИЗАЦИЯ — ЕДЕМ МЕДЛЕННО, ЧАСЫ СТОЯТ':{k:'post',nm:'SCHWEIZ'},
  'ПЕРЕВАЛ АРЛЬБЕРГ. ТОРМОЗА ДЫМЯТСЯ НА СПУСКЕ':{k:'pass',nm:'ARLBERG'},
  'ВЕНА! МАЛЕНЬКИЙ «РЕНО» ОБГОНЯЕТ ГИГАНТОВ':{k:'town',nm:'WIEN',fin:1,crowd:1},
  'ЗРИТЕЛИ НА ДОРОГЕ! РАССТУПАЮТСЯ В ПОСЛЕДНИЙ МИГ':{k:'road'},
  'АВАРИИ ОДНА ЗА ДРУГОЙ. МАРСЕЛЬ РЕНО РАЗБИЛСЯ У КУЭ':{k:'chron'},
  'ПРАВИТЕЛЬСТВО ОСТАНАВЛИВАЕТ ГОНКУ В БОРДО':{k:'chron'},
  'КРУГ ЗА КРУГОМ МИМО ТРИБУН БАСТОНИ':{k:'stand'},
  'БРИТАНСКИЙ ЗЕЛЁНЫЙ — В ЧЕСТЬ ИРЛАНДИИ':{k:'chron'},
  'СОЛДАТЫ ДЕРЖАТ ЗРИТЕЛЕЙ ЗА ВЕРЁВКАМИ':{k:'guard',crowd:1},
  'ЖЕНАТЦИ, «КРАСНЫЙ ДЬЯВОЛ», ВПЕРЕДИ':{k:'chron'},
  'КАЙЗЕР НА ТРИБУНЕ':{k:'stand'},
  'ЛЕСНЫЕ ПОВОРОТЫ ТАУНУСА':{k:'forest'},
  'ФРАНЦУЗ ТЕРИ ВЕЗЁТ КУБОК ДОМОЙ':{k:'chron'},
  'ВУЛКАНЫ ОВЕРНИ':{k:'summit'},
  'ПОСЛЕДНИЙ КУБОК: ДАЛЬШЕ — ГРАН-ПРИ':{k:'chron'},
  'ТОЛПА НА ДОРОГЕ! СИГНАЛЬТЕ!':{k:'road'},
  'ФИНИШ НА ВИДУ У ТРИБУНЫ ВАНДЕРБИЛЬТА':{k:'finish'},
  'КАЛЬТАВУТУРО: ДЕРЕВНЯ НА СКАЛЕ':{k:'town',nm:'CALTAVUTURO',vill:1,crowd:1},
  'ПОСЛЕДНИЙ СПУСК К МОРЮ':{k:'desc'},
  'СЪЁМНЫЙ ОБОД: КОЛЕСО — ЗА ЧЕТЫРЕ МИНУТЫ':{k:'chron'},
  '«МЕРСЕДЕСЫ» ИДУТ КОМАНДОЙ':{k:'chron'},
  'ТРИ «МЕРСЕДЕСА» ПОДРЯД. ФРАНЦИЯ МОЛЧИТ':{k:'chron'},
  'ПЕРЕВАЛ НАНКОУ: КУЛИ ТЯНУТ МАШИНЫ НА ВЕРЁВКАХ':{k:'pass',lbl:'КАК ЭТО БЫЛО'},
  'ГОБИ. БЕНЗИН — НА ВЕРБЛЮДАХ':{k:'chron'},
  '«ИТАЛА» ПРОВАЛИЛАСЬ СКВОЗЬ МОСТ':{k:'chron'},
  '«ТОМАС ФЛАЕР» ВПЕРЕДИ':{k:'chron'},
  'НАЦЦАРО НА «ФИАТЕ» — ПОБЕДИТЕЛЬ':{k:'chron'},
  'ТВЕРЬ. МИЛЛИОННАЯ УЛИЦА, ЗРИТЕЛИ У ДОМОВ':{k:'town',nm:'ТВЕРЬ',crowd:1},
  'НОВЫЙ ЖЕЛЕЗНЫЙ МОСТ ЧЕРЕЗ ВОЛГУ':{k:'bridge',re:'Волг'},
  'ПЕТЕРБУРГ':{k:'town',nm:'С.-ПЕТЕРБУРГЪ',fin:1,crowd:2},
  'ВАЛДАЙ. КОЛОКОЛА НА ВЕСЬ ТРАКТ':{k:'town',nm:'ВАЛДАЙ',crowd:1},
  'МОСКВА':{k:'town',nm:'МОСКВА',fin:1,crowd:2},
  'ФИНИШ ПОД ПЕТЕРБУРГОМ':{k:'finish'},
  'СТАВКИ ПРИНЯТЫ! ГОНЩИКИ В ЦВЕТАХ КОНЮШЕН':{k:'chron'},
  'БЕТОННЫЙ ВИРАЖ: МАШИНУ ПРИЖИМАЕТ К СТЕНЕ':{k:'turn'},
  '«ГОРБ» У МОСТА: МАШИНЫ ВЗЛЕТАЮТ':{k:'bridge'},
  'ШИКАНЫ ИЗ МЕШКОВ С ПЕСКОМ':{k:'sbag'},
  'БОКСЫ: МЕХАНИКИ МЕНЯЮТ ШИНЫ':{k:'pits'},
  'ПОСЛЕДНИЕ КРУГИ. ТРИБУНЫ ВСТАЛИ':{k:'stand'},
  'ПЕРЕВАЛ. ЦЕПИ НА КОЛЁСАХ':{k:'pass'},
  'РАССВЕТ НАД МОРЕМ. МОНАКО':{k:'town',nm:'MONACO',fin:1,crowd:1},
  'КАЧБЕРГ: ПОДЪЁМ В ТРИДЦАТЬ ПРОЦЕНТОВ':{k:'climb',nm:'KATSCHBERG'},
  'ГРОЗА НА ПЕРЕВАЛЕ':{k:'pass'},
  'СПУСК К ВЕНЕ':{k:'desc'},
  'КОНТРОЛЬНЫЙ ПУНКТ: СВЕРЯЮТ ЧАСЫ':{k:'post',banner:'CONTROL'},
  'ПОРШЕ НА «АУСТРО-ДАЙМЛЕРЕ» ВПЕРЕДИ':{k:'chron'},
  'СОЛДАТЫ НАЦГВАРДИИ ВДОЛЬ ТРАССЫ':{k:'guard'},
  'ОКЕАН СЛЕВА':{k:'sea'},
  'ФИНИШ У РИМСКОГО ТРОФЕЯ':{k:'finish'},
  'МАРИЯ-ШУЦ: ПАЛОМНИЧЕСКАЯ ЦЕРКОВЬ НАД ДОРОГОЙ':{k:'lm',re:'Паломническая'},
  'ЛЫСЫЕ КАМНИ ВЕРШИНЫ. МИСТРАЛЬ':{k:'summit'},
  'ЛЕДНИКИ НАД ДОРОГОЙ':{k:'summit'},
  'ВЫСОТА: МОТОР ЗАДЫХАЕТСЯ':{k:'summit'},
  'ПОЛНОЧЬ. ДОЖДЬ НА МЮЛЬСАННСКОЙ ПРЯМОЙ':{k:'straight'},
  'ЧЕТЫРЕ ЧАСА ДНЯ. ФЛАГ!':{k:'finish'},
  'ДОЖДЬ НА ОЛЬ-РУЖ':{k:'climb'},
  'БОЛОНЬЯ, ПЕРЕВАЛ ФУТА':{k:'pass',nm:'PASSO DELLA FUTA'},
  'РИМ. РАЗВОРОТ НА СЕВЕР':{k:'town',nm:'ROMA',crowd:1},
  'БРЕШИА. РАССВЕТ И ТОЛПЫ':{k:'town',nm:'BRESCIA',fin:1,crowd:2},
  'МЕСТА НА СТАРТЕ — ПО ЖРЕБИЮ':{k:'chron'},
  'ТОННЕЛЬ И НАБЕРЕЖНАЯ':{k:'tunnel'},
  'ТРЕК ПОСТРОИЛИ ЗА 110 ДНЕЙ':{k:'chron'},
  'ЭНЦО ФЕРРАРИ ВПЕРЕДИ':{k:'chron'},
  '«ДЮЗЕНБЕРГ» — ПЕРВЫЙ АМЕРИКАНЕЦ':{k:'chron'}};
// Вид титра: из таблицы, иначе по словам; у старта (первые 5% пути) — как есть
function scnEvKind(e){const x=e.k?{}:SCN_EVX[e.t];if(e.k||x)return Object.assign({},e,x||{});const t=String(e.t||'');let k='atmo';
  if(/(ТОЛП|ЗРИТЕЛ|ДЕРЕВН)[^.!]*НА ДОРОГ|ВЫБЕГАЮТ НА ДОРОГ|ВЫСЫПАЛ[АИ]? НА ДОРОГ/.test(t))k='road';
  else if(/СОЛДАТ|ЖАНДАРМ|НАЦГВАРД/.test(t))k='guard';else if(/ТАМОЖН|КОНТРОЛЬН/.test(t))k='post';else if(/ПЕРЕВАЛ/.test(t))k='pass';
  else if(/ТОННЕЛ/.test(t))k='tunnel';else if(/ТРИБУН/.test(t))k='stand';else if(/ТОЛП/.test(t))k='line';else if(/^ФИНИШ/.test(t))k='finish';
  else if(/«[^»]+»|ВПЕРЕДИ|ПОБЕДИТЕЛ/.test(t))k='chron';else if((e.p||0)<=0.05)k='start';
  return Object.assign({},e,{k});}
// сколько метров до места показывать титр
const SCN_LEAD={road:170,line:130,guard:130,post:150,town:110,pass:140,summit:50,climb:30,desc:0,sea:0,tunnel:160,bridge:120,forest:0,straight:0,turn:70,stand:150,pits:150,finish:280,lm:220,storm:130,sbag:110};

/* ---------- 1. где что будет: до расстановки декораций (города на выдуманной трассе ставит маршрут) ---------- */
function scnPlan(trk){trk.evx=[];trk.evc=[];const rc=trk.rc;if(!rc||typeof scnFor!=='function')return;let S;try{S=scnFor(rc);}catch(_){return;}
  const L=(S.ev||[]).map(scnEvKind);if(!L.length)return;
  const n=trk.n,ST=trk.step,cl=trk.closed,si=trk.startIdx,fi=trk.finishIdx,RL=trk.raceLen,LL=trk.len,P=trk.pts,K=trk.K,seg=trk.seg||[],Sg=trk.segT;
  const wrap=i=>cl?((i%n)+n)%n:clamp(i,0,n-1),lo=cl?0:si+14,hi=cl?n-1:fi-10,okR=i=>cl||(i>=lo&&i<=hi);
  const idxAt=pr=>cl?wrap(Math.round(pr/ST)):clamp(si+Math.round(pr/ST),lo,hi);
  const dI=(a,b)=>{const d=Math.abs(a-b);return cl?Math.min(d,n-d):d;};
  const win=Math.max(110,Math.round((cl?n:fi-si)*0.16));
  const bad=i=>{i=wrap(i);return !!((trk.bridge&&trk.bridge[i])||(trk.tunAt&&trk.tunAt[i])||(Sg&&(Sg[i]===RSEG.rail||Sg[i]===RSEG.bridge)));};
  // ровное место у i: впереди и сзади нет крутых поворотов, мостов, переездов; перед ним прямая need точек — толпу видно издалека
  const flatNear=(i0,need,noTown)=>{for(const strict of [1,0])for(let d=0;d<=win*(noTown?2:1);d++)for(const s of (d?[1,-1]:[1])){const i=wrap(i0+s*d);if(!okR(i))continue;let ok=true;
      for(let q=-8;q<=12&&ok;q++){const j=wrap(i+q);if(!cl&&(j<lo-10||j>hi+8))continue;if(bad(j)||Math.abs(K[j])>1/60||(noTown&&Sg&&(Sg[j]===RSEG.town||Sg[j]===RSEG.village)))ok=false;}
      if(ok&&strict)for(let q=12;q<need&&ok;q++){const j=wrap(i-q);if(!cl&&j<si)break;if(Math.abs(K[j])>1/110)ok=false;}if(ok)return i;}
    return clamp(i0,lo,hi);};
  const nearSeg=(i0,types,far)=>{let b=null,bd=1e9;for(const s of seg){if(!types.includes(s.type))continue;if(!okR(s.i0)&&!okR(Math.min(s.i1,hi)))continue;const d=dI(s.i0,i0);if(d<bd&&d<=(far||win*1.3)){bd=d;b=s;}}return b;};
  const range=(i0,w)=>{const out=[];for(let d=-w;d<=w;d++){const i=wrap(i0+d);if(okR(i))out.push(i);}return out;};
  const argBest=(R,f)=>{let b=-1,bv=-1e18;for(const i of R){const v=f(i);if(v>bv){bv=v;b=i;}}return b;};
  const y=i=>P[wrap(i)][1];
  const used=[];
  L.forEach(e=>{const k=e.k,i0=idxAt((e.p||0)*RL);let a=-1,x={};
    switch(k){
      case 'road':{if(e.vill){const s=nearSeg(i0,[RSEG.village,RSEG.town]);if(s)a=wrap(s.i0+Math.min(10,Math.max(2,(s.i1-s.i0)>>2)));}
        if(a<0)a=flatNear(i0,32);break;}
      case 'line':case 'guard':case 'post':a=flatNear(i0,22);break;
      case 'storm':a=flatNear(i0,22,1);break;// буря валит деревья за городом, а не на улице
      case 'town':{if(e.fin){a=cl?wrap(fi-Math.round(300/ST)):clamp(fi-Math.round(300/ST),lo,hi);x.zone=[a,cl?wrap(fi+4):Math.min(n-1,fi+4)];break;}
        // на настоящей карте — только город с тем же именем (Тверь, Валдай); чужое село «Римом» не называем
        const segN=s=>String(s.cap||'').split(':')[0].trim().toUpperCase(),nmU=String(e.nm||'').toUpperCase();
        const s=trk.real?(nmU?seg.find(q=>(q.type===RSEG.town||q.type===RSEG.village)&&segN(q)===nmU&&(cl||(q.i1>=lo&&q.i0<=hi))):null):nearSeg(i0,e.vill?[RSEG.village,RSEG.town]:[RSEG.town,RSEG.village]);
        // въезд в город; если город начался ещё до старта — титр на его улице, ближе к своему часу
        if(s){a=cl||s.i0>=lo?wrap(s.i0):clamp(i0,Math.max(s.i0,lo),Math.min(s.i1,hi));x.real=1;x.inT=s.i0<lo&&!cl?1:0;}
        else{a=flatNear(i0,18);
          // выдуманная трасса: тут будет городок (дома, фонари, мостовая) — маршрут ставит его до декораций
          if(!trk.real&&Sg&&trk.cfg.town&&!trk.cfg.oval){const L2=e.vill?50:70;let ok=true;for(let q=0;q<L2&&ok;q++){const j=wrap(a+q);if(!okR(j)||bad(j))ok=false;}
            if(ok){const t=e.vill?RSEG.village:RSEG.town;for(let q=0;q<L2;q++)Sg[wrap(a+q)]=t;seg.push({type:t,i0:a,i1:wrap(a+L2-1),i:wrap(a+(L2>>1)),cap:`${e.nm||'Городок'}: зрители у домов`});x.real=1;}}}
        break;}
      case 'pass':case 'summit':{const R=range(i0,win);a=argBest(R,i=>y(i)-dI(i,i0)*0.004);break;}
      case 'climb':{const R=range(i0,win);a=argBest(R,i=>y(i+12)-y(i));break;}
      case 'desc':{const R=range(i0,win);a=argBest(R,i=>y(i)-y(i+30));break;}
      case 'straight':{let best=-1,bl=0,run=0;for(let q=0;q<(cl?n*2:n);q++){const i=wrap(q);if(!okR(i)){run=0;continue;}if(Math.abs(K[i])<1/260)run++;else{if(run>bl){bl=run;best=wrap(i-run);}run=0;}}if(best>=0&&bl>30)a=wrap(best+8);break;}
      case 'turn':{const R=range(i0,cl&&trk.cfg.laps>1?n>>1:win);a=argBest(R,i=>Math.abs(K[i])+Math.abs(K[wrap(i+4)])+Math.abs(K[wrap(i-4)]));if(a>=0)a=wrap(a-6);break;}
      case 'forest':{const s=nearSeg(i0,[RSEG.forest,RSEG.avenue]);if(s)a=wrap(s.i0+4);break;}
      case 'bridge':{let s=null;if(e.re){const re=new RegExp(e.re,'i');s=seg.find(q=>q.type===RSEG.bridge&&re.test(q.cap||'')&&okR(q.i));}if(!s)s=nearSeg(i0,[RSEG.bridge],n);if(s)a=wrap(s.i0);break;}
      case 'sea':{const c=(trk.coast||[]).slice().sort((p,q)=>dI(p.i0,i0)-dI(q.i0,i0))[0];if(c&&okR(c.i0)){a=wrap(c.i0+6);x.side=c.side;}
        // настоящая вода по карте: ближайшее к титру место, откуда море видно (до 700 м от дороги)
        else if(trk.real&&trk.real.wm&&typeof realWet==='function'){for(let d=0;d<=n&&a<0;d+=4)for(const s of [1,-1]){const i=wrap(i0+s*d);if(!okR(i))continue;
          for(const sd of [1,-1]){const p=P[i],nn=trk.N[i];if([90,300,700].some(o=>realWet(trk,p[0]+nn[0]*sd*o,p[2]+nn[1]*sd*o)>0.5)){a=i;x.side=sd;break;}}if(a>=0)break;}}break;}
      case 'tunnel':{const t=(trk.tunnels||[]).slice().sort((p,q)=>dI(p.i0,i0)-dI(q.i0,i0))[0];if(t)a=wrap(t.i0);break;}
      case 'stand':if(!cl&&(e.p||0)<0.3){a=clamp(si+10,lo,hi);x.st0=1;}else a=wrap(fi-22);break;
      case 'pits':a=trk.cfg.pits?wrap(n-18):wrap(fi-22);break;
      case 'sbag':a=cl?wrap(fi-34):clamp(fi-34,lo,hi);break;
      case 'lm':{if(e.re){const re=new RegExp(e.re,'i'),q=(trk.lm||[]).find(o=>re.test(o.name||(o.lm&&o.lm.n)||(typeof LM_NAME!=='undefined'&&LM_NAME[o.t])||''));if(q)a=wrap(q.i);}break;}
    }
    if(k==='finish'){x.at=Math.max(0,RL-SCN_LEAD.finish);}
    else if(a>=0){const lead=SCN_LEAD[k]||0;let pr;if(!cl)pr=(a-si)*ST;else{const b=a*ST,kk=clamp(Math.round(((e.p||0)*RL-b)/LL),0,Math.max(0,trk.cfg.laps-1));pr=b+kk*LL;}
      // титр со временем суток («ПОЛНОЧЬ», «3 ЧАСА УТРА») не уезжает далеко от своего часа; остальные — не дальше трети гонки
      const fixed=['stand','pits','sbag'].includes(k)||e.fin,tw=/ПОЛНОЧ|НОЧ[ЬИ]|РАССВЕТ|УТРА|ВЕЧЕР|ПОЛДЕН|СМЕРКА|СТЕМНЕЛ|\d+ ЧАС|\d:\d\d/.test(e.t),lim=(tw?0.07:0.36)*RL;
      if(fixed||Math.abs(pr-(e.p||0)*RL)<=lim){x.at=Math.max(0,pr-lead);x.a=a;}else{a=-1;delete x.zone;}}
    if(k!=='finish'&&a<0){x.at=(e.p||0)*RL;
      // не нашлось того, о чём титр (моста, тоннеля, приметы) — это рассказ о том, как было
      if(['bridge','tunnel','lm'].includes(k)){x.k='chron';x.lbl=e.lbl||'КАК ЭТО БЫЛО';}else if(!['start','atmo','chron'].includes(k))x.k='atmo';}
    if(k==='sea'&&x.side!==undefined&&/СЛЕВА|СПРАВА/.test(e.t))x.t=e.t.replace(/СЛЕВА|СПРАВА/,x.side>0?'СЛЕВА':'СПРАВА');
    trk.evx.push(Object.assign({},e,x));});
  // два титра в одном месте — второй чуть дальше
  trk.evx.sort((p,q)=>p.at-q.at);for(let j=1;j<trk.evx.length;j++)if(trk.evx[j].at-trk.evx[j-1].at<260)trk.evx[j].at=trk.evx[j-1].at+260;}

/* ---------- 2. что поставить у дороги (после декораций) ---------- */
function scnStage(trk){const L=trk.evx;if(!L||!L.length)return;
  const n=trk.n,ST=trk.step,W=trk.W,cl=trk.closed,P=trk.pts,N=trk.N,spr=trk.spr,add=trk._add,fi=trk.finishIdx,night=(h=>h<5||h>21.5);
  if(!add)return;const rnd=mulberry32(hashStr('stage|'+trk.rc.key)),wrap=i=>cl?((i%n)+n)%n:clamp(i,0,n-1);
  const free=(x,z,r)=>!colNear(trk,x,z,r+3).some(o=>Math.hypot(o.x-x,o.z-z)<(o.r||0)+r);
  // табличка с названием: на столбах справа по ходу, лицом к едущим
  const sign=(i,nm)=>{for(const d of [0,-2,2,-4,4,-7,7])for(const sd of [-1,1]){const j=wrap(i+d),off=sd*(W/2+2.5),p=P[j],nn=N[j],x=p[0]+nn[0]*off,z=p[2]+nn[1]*off;
      if(typeof nearTrack==='function'&&nearTrack(trk,x+nn[0]*sd*-1.1,z+nn[1]*sd*-1.1,W/2+0.4,j))continue;if(!free(x,z,1.3))continue;
      spr[j].push({t:'tsign',off,v:0,k:'s',nm});[1,-1].forEach(s=>addCollider(trk,x+nn[0]*s*1.0,z+nn[1]*s*1.0,0.1,'post',j));return true;}return false;};
  const crowd=(i0,len,step,off,pS)=>{for(let q=0;q<len;q+=step)[1,-1].forEach(sd=>{if(rnd()>pS)return;add(wrap(i0+q),'crowd',sd*(W/2+off+rnd()*0.9),Math.floor(rnd()*4),'p');});};
  const people=(i0,len,step,t,off,both)=>{for(let q=0;q<len;q+=step)[1,-1].forEach((sd,k)=>{if(!both&&k!==(Math.floor(q/step)%2))return;add(wrap(i0+q),t,sd*(W/2+off),Math.floor(rnd()*2),'p');});};
  const S0=scnFor(trk.rc),hourAt=pr=>(S0.h0||12)+(S0.span||1)*clamp(pr/Math.max(1,trk.raceLen),0,1);
  L.forEach((e,gi)=>{const a=e.a;if(a===undefined||a<0)return;const dark=night(((hourAt(e.at)%24)+24)%24);
    switch(e.k){
      case 'road':{if(e.nm)sign(a-34,e.nm);
        // зрители у обочин (там они и стоят, пока машина проходит) и группа на самой дороге
        crowd(a-14,30,4,2.9,0.7);const g={i:a,P:[]},nR=10+Math.floor(rnd()*4),nS=6;
        for(let q=0;q<nR+nS;q++){const onR=q<nR,al=(rnd()-0.5)*(onR?22:28),di=Math.round(al/ST),i=wrap(a+di),offR=onR?(rnd()*2-1)*(W/2-0.7):0,sd=onR?(offR>=0?1:-1):(rnd()<0.5?-1:1);
          const offS=sd*(W/2+(trk.town&&trk.town[i]?1.0:1.5)+rnd()*(trk.town&&trk.town[i]?0.9:2.0));
          g.P.push({i,al:al-di*ST,offR:onR?offR:offS,offS,u:onR?0:1,u0:onR?0:1,want:onR?0:1,wait:0,react:1.9+rnd()*1.1,delay:rnd()*0.35,delayBack:rnd()*2.5,back:2+rnd()*4,run:4.6+rnd()*2,walk:1.1+rnd()*0.6,
            wave:rnd()<0.5,sp:Math.floor(rnd()*97),k:0.93+rnd()*0.12,jit:(rnd()-0.5)*0.7});}
        trk.evc.push(g);break;}
      case 'line':crowd(a-6,40,3,2.6,0.95);people(a,40,10,'marsh',1.7,false);break;
      case 'guard':people(a-4,44,3,'gend',1.6,true);if(e.crowd||rnd()<0.6)crowd(a-4,44,4,3.8,0.85);if(e.nm)sign(a-10,e.nm);break;
      case 'post':{if(e.nm)sign(a-6,e.nm);add(wrap(a+1),'rhut',-(W/2+6.5),0,'s');people(a-2,6,2,'gend',1.6,true);add(wrap(a+3),'marsh',W/2+1.7,0,'p');add(wrap(a+5),'photo',W/2+3,0,'p');crowd(a+4,14,4,3.2,0.6);
        if(e.banner){const i=wrap(a+2);spr[i].push({t:'banner',off:0,v:0,k:'s',txt:e.banner});[1,-1].forEach(sd=>{const p=P[i],nn=N[i];addCollider(trk,p[0]+nn[0]*sd*(W/2+1.4),p[2]+nn[1]*sd*(W/2+1.4),0.2,'post',i);});}break;}
      case 'town':{if(e.nm&&!e.inT)sign(a-3,e.nm);if(dark&&!e.fin)break;const z=e.zone,len=z?Math.max(10,(cl?((z[1]-z[0])%n+n)%n:z[1]-z[0])):e.crowd===2?40:e.crowd?26:14;
        crowd(a,len,e.crowd===2?2:3,2.7,e.crowd?0.9:0.55);if(e.crowd===2)people(a+6,len,9,'marsh',1.7,false);break;}
      case 'storm':{let put=0;for(let d=0;d<30&&put<2;d+=3){const i=wrap(a+d),sd=put?-1:1,tw=!!(trk.town&&trk.town[i]),off=sd*(W/2+(tw?1.5:1.7)),p=P[i],nn=N[i],x=p[0]+nn[0]*off,z=p[2]+nn[1]*off;
          // за городом ствол лежит поперёк обочины (8–9 м в поле), в городе — вдоль тротуара
          if(tw?!free(x,z,0.7):!free(x+nn[0]*sd*4,z+nn[1]*sd*4,1.4))continue;
          spr[i].push({t:'ftree',off,v:tw?2:put,k:'s'});addCollider(trk,x+nn[0]*sd*0.7,z+nn[1]*sd*0.7,0.9,'bush',i);if(!tw)addCollider(trk,x+nn[0]*sd*5,z+nn[1]*sd*5,0.5,'oak',i);put++;d+=6;}break;}
      case 'sbag':for(let q=0;q<10;q+=2)[1,-1].forEach(sd=>add(wrap(a+q),'sbag',sd*(W/2+1.15),0,'s'));break;
      case 'pass':case 'climb':case 'summit':if(e.nm)sign(a-2,e.nm);if(e.k==='pass'&&!dark)crowd(a-3,10,4,3.2,0.5);break;
      case 'stand':if(e.st0){[0,5].forEach(q=>add(wrap(a+q),'stand',-(W/2+9),0,'s'));crowd(a-2,14,3,2.8,0.9);}break;
    }});
  trk.evx.forEach(e=>{delete e.zone;});}

/* ---------- 3. толпа на дороге: расступается перед каждой машиной и снова выходит ---------- */
function evcAttach(){const G=R.trk&&R.trk.evc;R3.evcN=0;if(!G||!G.length||!R3.atlas)return;const A=R3.atlas.crowd;if(!A||!A.length)return;
  for(const g of G)for(const p of g.P){const s=A[p.sp%A.length];p.q=[0,0,0,s,p.k,false,0];p.u=p.u0;p.want=p.u0;p.wait=0;R3.people.push(p.q);evcPlace(p,9);}
  R3.evcN=R3.people.length;}
function evcPlace(p,tta){const T=R.trk,i=p.i,q=p.q,t=T.T[i],nn=T.N[i],u=p.u*p.u*(3-2*p.u),off=p.offR+(p.offS-p.offR)*u,pt=T.pts[i];
  q[0]=pt[0]+nn[0]*off+t[0]*p.al;q[2]=pt[2]+nn[1]*off+t[1]*p.al;q[1]=groundAt(i,off);
  // куда смотрит: бежит — по ходу, на дороге — навстречу машинам, у обочины — на дорогу
  const sd=Math.sign(p.offS-p.offR)||Math.sign(p.offS)||1;let yx,yz;
  if(p.mv>0){yx=nn[0]*sd;yz=nn[1]*sd;}else if(p.mv<0){yx=-nn[0]*sd;yz=-nn[1]*sd;}else if(p.u<0.5){yx=-t[0];yz=-t[1];}else{yx=-nn[0]*Math.sign(p.offS);yz=-nn[1]*Math.sign(p.offS);}
  q[6]=Math.atan2(yx,yz)+p.jit*(p.mv?0.2:1);q[5]=!!(q[3].anim&&(p.u>0.5?tta<7:p.wave));}
function evcTick(dt){const G=R.trk&&R.trk.evc;if(!G||!R3.evcN)return;const T=R.trk,ST=T.step,cl=T.closed,LL=T.len,e=R3.eye,cars=raceVisCars();let dirty=false;
  G.forEach((g,gi)=>{const c0=T.pts[g.i];if(e&&Math.hypot(c0[0]-e[0],c0[2]-e[2])>700)return;
    // кто подъезжает: путь по дороге до толпы и время до неё
    let tta=1e9,meD=1e9;for(const c of cars){if(c.dnf)continue;let d=(g.i-c.idx)*ST;if(cl){d=((d%LL)+LL)%LL;if(d>LL-40)d-=LL;}if(d<-14||d>300)continue;
      const tt=d<=6?0:(d-6)/Math.max(2,c.vx||0);if(tt<tta)tta=tt;if(c===R.me)meD=d;}
    if(tta<4)g.calm=0;else g.calm=(g.calm||0)+dt;
    for(const p of g.P){if(p.u0===1){p.mv=0;evcPlace(p,tta);continue;}
      const want=tta<p.react?1:g.calm>p.back?0:p.want;if(want!==p.want){p.want=want;p.wait=want?p.delay:p.delayBack;}
      if(p.wait>0){p.wait-=dt;p.mv=0;}else{const ds=Math.max(0.5,Math.abs(p.offS-p.offR)),sp=(p.want>p.u?p.run:p.walk)/ds,du=p.want-p.u;if(Math.abs(du)>1e-3){p.u+=clamp(du,-sp*dt,sp*dt);p.mv=Math.sign(du);}else p.mv=0;}
      if(tta<0.45&&p.u<0.9){p.u=1;p.want=1;p.mv=0;}// в последний миг — прыжком на обочину
      evcPlace(p,tta);}
    dirty=true;
    // своя машина подъезжает: механик жмёт грушу рожка, толпа кричит
    if(R.me&&meD>20&&meD<95&&(R.me.vx||0)>9&&R.mode!=='sim'&&typeof ambCool==='function'&&ambCool('evc'+gi,14)){try{if(typeof hornSfx==='function')hornSfx(R.rc.y,0.32,0);auSfx('cheer',0.45);}catch(_){}}});
  if(dirty&&!R3.peopleDirty&&typeof r3dPeoplePatch==='function')r3dPeoplePatch(R3.evcN);}

/* ---------- 4. по пути: настоящие приметы и города — подпись, когда их видно ---------- */
function scnLmTick(){const T=R.trk,F=R.follow,S=R.scn;if(!F||!S||R.film||R.mode==='sim')return;if(R.time-(S.capT??-99)<7)return;
  if(!S.lmL){S.lmL=[];const add=(i,name,lbl,far)=>{if(name)S.lmL.push({i,name,lbl,done:0,far:far||0});};
    (T.lm||[]).forEach(q=>{const nm=q.t==='rlm'?(q.far?'':q.name):(typeof LM_NAME!=='undefined'?LM_NAME[q.t]:'');if(!nm||Math.abs(q.off)>460)return;add(q.i,nm,q.off>0?'СЛЕВА':q.off<0?'СПРАВА':'ВПЕРЕДИ');});
    (T.seg||[]).forEach(s=>{if((s.type===RSEG.town||s.type===RSEG.village)&&T.real&&s.cap&&/:/.test(s.cap)){const nm=s.cap.split(':')[0].trim();if(nm&&nm.length<40)add(s.i0,nm,s.type===RSEG.town?'ГОРОД':'СЕЛО',1);}});}
  const n=T.n,ST=T.step,cl=T.closed;let best=null,bd=1e9;
  for(const o of S.lmL){if(o.done)continue;let d=(o.i-F.idx)*ST;if(cl){d=((d%T.len)+T.len)%T.len;}
    const lo=o.far?-10:40,hi=o.far?60:280;if(d>=lo&&d<=hi&&d<bd){bd=d;best=o;}}
  if(best){best.done=1;S.capT=R.time;scnCap(best.name.toUpperCase(),4.2,best.lbl,true);}}
// титр о колоколах (Валдай): звонят ближайшие церкви — сразу, а не по жребию
function evBells(){try{if(typeof AMB==='undefined'||!AMB.E||!AMB.lis||!AU.ctx)return;const Ls=AMB.lis,L=AMB.E.church.map(c=>[Math.hypot(c.x-Ls.x,c.z-Ls.z),c]).filter(q=>q[0]<1500).sort((a,b)=>a[0]-b[0]).slice(0,2);
  L.forEach(([,c],k)=>ambShot(c.city?'bells_city':'bells_village',[c.x,c.z],AMB_L.bells+4,{off:Math.random()*20,dur:18,fade:2,force:1,r0:6,delay:k*1.4}));}catch(_){}}
