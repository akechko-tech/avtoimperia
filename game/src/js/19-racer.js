/* ================= 0.28: ПУТЬ ГОНЩИКА — карьера пилота, контракты, рейтинг эпохи и своё дело ================= */
// Так начинали многие марки: Винченцо Лянча (испытатель и гонщик FIAT → Lancia, 1906), Феличе Надзаро (FIAT → Nazzaro, 1911),
// Луи Шевроле (Buick → Chevrolet вместе с Дюрантом, 1911), Эдди Рикенбакер (Duesenberg → Rickenbacker Motor, 1922),
// Альфьери Мазерати (Isotta Fraschini, Diatto → Maserati, 1926), Энцо Феррари (Alfa Romeo → Scuderia Ferrari, 1929).
// Гонщик покупает первую машину, ездит частником, зарабатывает призы и имя; заводы зовут в команду, спонсоры платят за победы.
// Накопил капитал — основывает своё дело (мастерская с нуля, с партнёром-инвестором или покупка слабой местной марки) и
// дальше играет обычную партию автомобильного магната — той же игрой, без второго приложения.
const RX_CLOSE='<button class="iconbtn" data-act="close" aria-label="Закрыть">×</button>';
const RACERS={
  custom:{n:'Свой гонщик',c:null,y:null,sk:0.6,pk:0.86,bio:'Начните с нуля в своей стране и в своём году: купите первую машину, заработайте имя и капитал.'},
  lancia:{n:'Винченцо Лянча',c:'it',y:1900,m:2,sk:0.66,pk:0.88,brand:'Lancia',found:1906,pio:'r_lancia',
    bio:'Сын торговца из Фобелло, бухгалтер, потом испытатель FIAT. С 1900 года — самый быстрый гонщик заводской команды. В ноябре 1906 года вместе с Клаудио Фоголином основал в Турине Lancia & C. — и ещё два года гонялся за FIAT.'},
  l_chevrolet:{n:'Луи Шевроле',c:'us',y:1905,m:3,sk:0.66,pk:0.86,brand:'Chevrolet',found:1911,pio:'r_chevrolet',
    bio:'Швейцарец, механик, в Америке — гонщик: в 1905 году обыграл Барни Олдфилда, потом звезда команды Buick. В 1911 году вместе с Уильямом Дюрантом основал Chevrolet Motor Company.'},
  rickenbacker:{n:'Эдди Рикенбакер',c:'us',y:1911,m:3,sk:0.62,pk:0.82,brand:'Rickenbacker',found:1922,pio:'r_rickenbacker',
    bio:'Автомеханик из Колумбуса, с 1911 года — гонщик Firestone-Columbus и Duesenberg. В войну — лучший американский лётчик-ас. В 1922 году основал Rickenbacker Motor Company — машины с тормозами на все четыре колеса.'},
  a_maserati:{n:'Альфьери Мазерати',c:'it',y:1920,m:3,sk:0.64,pk:0.8,brand:'Maserati',found:1926,pio:'r_maserati',
    bio:'Гонялся на Isotta Fraschini и Diatto; с братьями держал мастерскую в Болонье. В 1926 году выпустил первую Maserati — Tipo 26, которая выиграла класс в Тарга Флорио.'},
  ferrari:{n:'Энцо Феррари',c:'it',y:1919,m:9,sk:0.62,pk:0.8,brand:'Ferrari',found:1929,pio:'ferrari',
    bio:'FIAT не взял его на работу, и в 1919 году он стал испытателем CMN в Милане, с 1920 года — гонщик Alfa Romeo: Круг Савио 1923 года, Кубок Ачербо 1924-го. В 1929 году основал Scuderia Ferrari — команду для гонщиков-любителей на Alfa Romeo.'}};
// Основатель-гонщик как «пионер» компании: бонусы — от гоночного прошлого (скорость, слава в спорте)
const RACER_PIO={r_lancia:{drv:'lancia',name:'Винченцо Лянча',yrs:'1881–1937',c:'it',co:'Lancia',racer:1,bio:'Гонщик FIAT, основатель Lancia (1906): лёгкие быстрые машины, несущий кузов Lambda (1922).',plus:['Гонки +8%','Спорт и средний класс +6%'],minus:['Народный класс −8%'],b:{race:0.08,seg:{sport:1.06,middle:1.06,people:0.92}}},
  r_chevrolet:{drv:'l_chevrolet',name:'Луи Шевроле',yrs:'1878–1941',c:'us',co:'Chevrolet',racer:1,bio:'Гонщик Buick, сооснователь Chevrolet (1911), конструктор гоночных Frontenac.',plus:['Гонки +8%','Народный класс +5%'],minus:['Люкс −8%'],b:{race:0.08,seg:{people:1.05,lux:0.92}}},
  r_rickenbacker:{drv:'rickenbacker',name:'Эдди Рикенбакер',yrs:'1890–1973',c:'us',co:'Rickenbacker',racer:1,bio:'Гонщик Duesenberg, ас Первой мировой, основатель Rickenbacker Motor (1922).',plus:['Гонки +6%','Слава в газетах'],minus:['Разработка дороже на 5%'],b:{race:0.06,devCost:1.05,rep:36}},
  r_maserati:{drv:'a_maserati',name:'Альфьери Мазерати',yrs:'1887–1932',c:'it',co:'Maserati',racer:1,bio:'Гонщик и механик, основатель Maserati (1926): гоночные и спортивные машины.',plus:['Гонки +10%','Спорт +10%'],minus:['Народный класс −15%'],b:{race:0.1,seg:{sport:1.1,people:0.85}}},
  r_custom:{name:'Гонщик-основатель',yrs:'',c:'fr',co:'',racer:1,bio:'Бывший гонщик основал свою марку.',plus:['Гонки +5%'],minus:[],b:{race:0.05}}};
for(const k in RACER_PIO)if(!PIONEERS[k])PIONEERS[k]=RACER_PIO[k];
// Марки из истории, которые основал этот гонщик: в партии их нет среди конкурентов — вы и есть эта марка
function racerBrandLink(){const s=G;if(!s||!s.racer||!s.racer.brandCp)return;const B=s.racer.brandCp,cp=(COMPS[B.c]||[])[B.i];if(cp&&cp.n===B.n&&!cp.pk)cp.pk=s.pioneer;}
function isRacer(s){return !!(s&&s.mode==='racer');}
function racerKey(s){const X=s&&s.racer;return X&&X.id&&X.id!=='custom'?X.id:'me';}
/* ---------- новая карьера ---------- */
function racerNew(id,c,y,name,diff){
  const R0=RACERS[id]||RACERS.custom;c=R0.c||c||'fr';y=R0.y||clamp(+y||1900,1895,1925);
  const nm=(name||'').trim()||(id==='custom'?'Гонщик':R0.n);
  newGame('custom',c,nm,diff||'normal','');
  const s=G;s.mode='racer';s.y=y;s.m=R0.m!=null?R0.m:2;s.models=[];s.dealers={};s.cap=0;s.workers=0;s.ad=0;s.plantVal=0;s.wh=0;s.helper=null;s.company=nm;s.log=[];
  s.cash=Math.round(2600*cpi(s)*(1+0.01*(y-1895))*Math.sqrt(DIF().cash)/50)*50;s.rep=30;
  s.racer={id:RACERS[id]?id:'custom',name:nm,nat:c,sk:R0.sk,pk:R0.pk,fame:id==='custom'?0:6,starts:0,wins:0,pods:0,earn:0,car:null,team:null,spons:[],offers:[],
    start:{y,m:s.m},mech:0,teamsBefore:[],ret:0,last:null};
  s.dcar={};racerSeed(s);
  addLog(`${nm}: начало гоночной карьеры, ${COUNTRIES[c].city}. В кармане — ${money(s.cash)}: этого хватит на первую машину.`,'hist');
  if(R0.bio&&id!=='custom')addLog(`Так было в истории: ${R0.bio}`,'hist');
}
// История гонок до начала карьеры: кто и сколько выигрывал — для рейтинга гонщиков эпохи
function racerSeed(s){const y0=s.y,m0=s.m,log=s.log;s.log=[];
  try{RACES.filter(rc=>rc.y<y0||(rc.y===y0&&rc.m<m0)).sort((a,b)=>a.y-b.y||a.m-b.m).forEach(rc=>{s.y=rc.y;s.m=rc.m;try{simRace(s,rc);}catch(e){}});
    for(let y=1895;y<y0;y++)try{dchFinish(s,y);}catch(e){}}catch(e){console.warn('racer seed',e);}
  s.y=y0;s.m=m0;s.log=log;s.titles=[];
  Object.keys(s.cres||{}).forEach(k=>{if(+k.split('-').pop()<y0-1)delete s.cres[k];});
  Object.keys(s.season||{}).forEach(k=>{if((s.season[k].y||0)<y0-1)delete s.season[k];});
  if(s.dch)Object.keys(s.dch).forEach(k=>{if(+k<y0-2)delete s.dch[k];});}
// Сводный зачёт гонщиков за всю эпоху (очки — как в личном зачёте прессы): пополняется из каждой гонки
function dcarAdd(s,rc,order){const C=s.dcar;if(!C)return;const seen=new Set();
  order.forEach((o,i)=>{if(!o.n)return;const k=o.id||('~'+o.n);if(seen.has(k))return;seen.add(k);
    const r=C[k]=C[k]||{n:o.n,pts:0,w:0,pod:0,st:0,y0:rc.y,y1:rc.y,mq:''};r.st++;r.y1=rc.y;if(o.mq)r.mq=o.mq;
    const p=i+1,pts=o.dnf?0:dchPts(rc,p);r.pts+=pts;if(!o.dnf&&p===1)r.w++;if(!o.dnf&&p<=3)r.pod++;});}
function dcarTable(s){const C=s.dcar||{},me=racerKey(s);
  return Object.keys(C).map(k=>({k,...C[k],me:k===me})).filter(r=>r.pts>0||r.me).sort((a,b)=>b.pts-a.pts||b.w-a.w||b.pod-a.pod);}
function dcarTitles(s,k){let n=0;Object.values(s.dch||{}).forEach(D=>{if(D.done&&D.wid===k)n++;});return n+((s.dchWon||{})[k]||0);}
function racerIntro(s){const X=s.racer,R0=RACERS[X.id]||RACERS.custom;
  pushEvent({kicker:'Путь гонщика',title:`${X.name} выходит на старт`,deck:`${COUNTRIES[X.nat].city}, ${MONTHS_N[s.m]} ${s.y} · в кармане ${money(s.cash)}`,
    text:`Первым делом нужна машина. В гараже продаются подержанные гоночные машины прошлых лет, новые — с завода, и серийные спортивные. Частников берут в гонки по дорогам, в горы, в пробеги и клубные гонки; в Гран-при и Кубок наций — только заводские команды.\nПобеды и подиумы дают призы и славу. Знаменитого гонщика зовут заводы — жалованье, доля призов, премии, — а шинные фирмы платят за победы на своих шинах. Рейтинг «Гонщики эпохи» покажет, где вы рядом с Шарроном, Женатци, Надзаро и Буайо.\nНакопите капитал — и основайте свою марку, как ${R0.found&&X.id!=='custom'?R0.n+' в '+R0.found+' году':'Лянча в 1906 году'}.`,
    choices:[['В гараж','rx:garage'],['Позже','ok']]},true);
  racerJobOffer(s);}
/* ---------- деньги месяца ---------- */
function racerLiving(s){return Math.round(22*cpi(s)/5)*5;}
function racerMechPay(s){return Math.round(30*cpi(s)/5)*5;}
function racerGarage(s){const C=s.racer.car;return C?Math.round((C.val||0)*0.01/5)*5:0;}
// Частник сам гонит машину к старту и сам её готовит: взнос — половина того, что платит завод с командой и грузовиками
function racerFee(rc){return Math.round(raceFee(rc)*0.5/10)*10;}
// Призы эпохи: деньги получали первые шесть (1-е — весь приз, дальше по убывающей)
const RX_PRZ=[1,0.5,0.25,0.12,0.08,0.05];
function racerPrizeAt(rc,pos){return pos>=1&&pos<=6?Math.round(racePrize(rc)*RX_PRZ[pos-1]/10)*10:0;}
// Испытатель завода: так начинали Лянча и Надзаро (FIAT), Шевроле, Рикенбакер, Феррари — жалованье, опыт и место во «втором составе»
function racerJobPay(s){return Math.round(46*cpi(s)/5)*5;}
/* ---------- машины: подержанные и новые гоночные, серийные спортивные ---------- */
function rcCarBase(s){return 3600*cpi(s)*(1+0.03*Math.max(0,s.y-1895));}
function racerTeamsNow(s,y){y=y||s.y;return RACE_TEAMS.filter(t=>t.from<=y&&t.to>=y&&!(t.gap&&y>=t.gap[0]&&y<=t.gap[1])&&COUNTRIES[t.c]);}
function racerCarOffers(s){const y=s.y,c=s.racer.nat,T=racerTeamsNow(s),byS=(a,b)=>b.str-a.str,P=T.filter(t=>t.c===c).sort(byS).concat(T.filter(t=>t.c!==c).sort(byS)),base=rcCarBase(s),out=[];
  const mk=(kind,name,md,mq,pw,rel,val,prod)=>({kind,name,md:{...md,name,paint:md.paint||'#2b2320'},mq,pw,rel,val:Math.max(200,Math.round(val/50)*50),cond:kind==='used'?72:100,prod:prod?1:0,y});
  // подержанные — прошлых сезонов; в войну гонок в Европе не было, и продают довоенные машины
  P.slice(0,2).forEach(t=>{let yy=Math.min(y-1,Math.max(1894,y-2,t.from-1));if(yy>=1915&&yy<=1918&&t.c!=='us')yy=1914;out.push(mk('used',`${brandShort(t.n)} ${yy} года`,aiCarMd(yy,t.n),brandShort(t.n),Math.pow(t.str,1.6)*0.86,0.88,base*0.36*t.str));});
  if(P[0]){const t=P[0];out.push(mk('new',`${brandShort(t.n)} ${y} года, гоночная`,aiCarMd(y,t.n),brandShort(t.n),Math.pow(t.str,1.6)*0.95,0.95,base*t.str));}
  const seg=y>=1901?'sport':'lux',r=rivalCar(seg,y),pn=racerProdName(c,y,seg)||{name:r[1],mq:String(r[1]).split(' ')[0]};out.push(mk('prod',pn.name,{...r[2],t:TRIM_OF[seg]},pn.mq,1,0.97,prefP(seg,c,s)*1.05,1));
  return out;}
// Серийная спортивная машина своей страны: марка, у которой этот класс главный, и её модель тех лет
function racerProdName(c,y,seg){try{const L=(COMPS[c]||[]).filter(b=>b.since<=y&&(!b.until||b.until>=y)&&!b.imp&&b.mix&&b.mix[seg]>0);if(!L.length)return null;
  const b=L.slice().sort((a,b2)=>(b2.mix[seg]||0)-(a.mix[seg]||0))[0],mm=(b.models||[]).filter(m=>m[0]<=y&&y-m[0]<=8).pop(),bn=brandShort(b.n),m1=mm?mm[1].replace(/\s*«.*?»/g,''):'';
  return {mq:bn,name:m1?(m1.toLowerCase().includes(bn.split(/[ -]/)[0].toLowerCase())?m1:bn+' '+m1):bn+(seg==='sport'?' Sport':'')};}catch(e){return null;}}
function rcCarStats(car,y){return carStats(car.md,car.prod?1:2,y);}
function racerCarValue(s){const C=s.racer.car;if(!C)return 0;return Math.round((C.val||0)*(0.45+0.55*(C.cond||100)/100)/50)*50;}
function racerRepairCost(s){const C=s.racer.car;if(!C)return 0;return Math.round((C.val||0)*(100-(C.cond||100))/100*0.35/10)*10;}
/* ---------- заявка на гонку ---------- */
function racerTeamByName(n,y){return n?RACE_TEAMS.find(t=>t.n===n&&t.from<=y&&t.to>=y&&!(t.gap&&y>=t.gap[0]&&y<=t.gap[1]))||null:null;}
function racerTeamObj(s,y){const X=s.racer;return X.team?racerTeamByName(X.team.n,y||s.y):null;}
function racerJobObj(s,y){const X=s.racer;return X.job?racerTeamByName(X.job.n,y||s.y):null;}
// условия, на которых вы едете за этот завод: контракт гонщика или место испытателя
function racerDeal(s,n){const X=s.racer;return n&&X.team&&X.team.n===n?X.team:n&&X.job&&X.job.n===n?X.job:null;}
// Заводская машина едет туда, куда ездит команда: международные и большие гонки — везде, свои национальные — дома.
// Испытателя завод сажает за руль в небольших открытых гонках — международных и своей страны
function racerWorksIn(rc,s){if(rc.match)return null;const t=racerTeamObj(s,rc.y),host=COUNTRIES[rc.c]?rc.c:null;
  if(t){if(/^gb\d/.test(rc.id))return ['fr','de','uk','us','it'].includes(t.c)?t:null;
    return rc.c==='intl'||rc.major||!host||t.c===host?t:null;}
  const j=racerJobObj(s,rc.y);if(j&&!rc.major&&racerPrivOk(rc)&&(!host||j.c===host))return j;
  return null;}
function racerPrivOk(rc){return !rc.match&&privRule(rc).n>0;}
function racerStatus(rc,s){const done=s.raceDone[rc.key],r=s.cres&&s.cres[rc.key];
  if(done>0)return [`${done}-е место`,done===1?'good':done<=3?'warn':'muted',false];if(done===-1)return ['Сход','bad',false];
  if(r&&r.x)return ['Отменена: война','bad',false];if(r)return ['Прошла без вас','muted',false];
  if(raceWarBlocked(rc,s))return ['Отменена: война','bad',false];
  const open=rc.y===s.y&&(s.m===rc.m||s.m===rc.m-1);if(!open)return ['Скоро','warn',false];
  {const w=racerWorksIn(rc,s);if(w)return [s.racer.team&&s.racer.team.n===w.n?'Едете за команду':'Едете за завод','good',true];}
  if(!racerPrivOk(rc))return [/^gb\d/.test(rc.id)?'Только сборные стран':'Только заводские команды','muted',false];
  if(!s.racer.car)return ['Нужна своя машина','warn',false];
  return ['Запись открыта','good',true];}
// стартовые: знаменитому гонщику организаторы платят за участие
function racerStartMoney(rc,s){const f=s.racer.fame;return f<25?0:Math.round(racePrize(rc)*0.05*(f-20)/80/10)*10;}
let RRS=null;   // заявка гонщика: {key, works, prep, tyre, gear, mode}
function racerOpenRace(key){const s=G,rc=raceByKey(key);if(!rc||R)return;const st=racerStatus(rc,s);if(!st[2]){toast(st[0]);return;}
  try{texPrefetch();}catch(_){}
  const w=racerWorksIn(rc,s),car=s.racer.car;
  if(!RRS||RRS.key!==key){const cfg=trackCfg(rc);RRS={key,works:w?w.n:'',prep:w?aiPrep(rc):car&&car.prod?1:2,tyre:rc.km>600&&!cfg.pits?'hard':'soft',gear:['oval','sprint'].includes(rc.t)?1:rc.t==='hill'?-1:0,mode:'drive'};}
  if(RRS.works&&!w)RRS.works='';if(!RRS.works&&!car){if(w)RRS.works=w.n;else{toast('Нужна своя машина');return;}}
  racerRaceSheet();}
function racerRaceMd(s,rc){const X=s.racer;if(RRS&&RRS.works){const t=racerTeamByName(RRS.works,rc.y);return {...aiCarMd(rc.y,t?t.n:''),name:`${brandShort(t?t.n:'')} ${rc.y}`,paint:t&&rc.y>=1903&&COUNTRIES[t.c]?COUNTRIES[t.c].race:'#2b2320'};}
  return {...X.car.md,name:X.car.name};}
function racerCosts(rc,s){if(RRS&&RRS.works)return {fee:0,prep:0,total:0};const fee=racerFee(rc),prep=s.racer.car&&s.racer.car.prod&&RRS&&RRS.prep>=1?Math.round(racePrizeBase(rc)*0.04/10)*10:0;return {fee,prep,total:fee+prep};}
function racerRaceSheet(){const s=G,X=s.racer,rc=raceByKey(RRS.key),cfg=trackCfg(rc),w=racerWorksIn(rc,s),md=racerRaceMd(s,rc),st=carStats(md,RRS.prep,rc.y),cs=racerCosts(rc,s),sm=racerStartMoney(rc,s);
  const prize=racePrize(rc),wd=w?racerDeal(s,w.n):null,deal=RRS.works?racerDeal(s,RRS.works):null,share=deal?deal.sh:1;
  const chip=(k,v,label,sub,on,dis)=>`<button class="chip ${on?'on':''}" data-act="rxSet" data-k="${k}" data-v="${v}" ${dis?'disabled':''}>${label}<small>${sub}</small></button>`;
  openSheet(`<div class="row"><div><span class="label">${MONTHS[rc.m]} ${rc.y} · ${hostName(rc.c)}</span><h2 style="margin-top:2px">${esc(rc.name)}</h2></div>${RX_CLOSE}</div>
    <p class="small muted" style="margin-top:4px">${RTYPE[rc.t]} · ${rc.km.toLocaleString('ru-RU')} км · ${terrName(cfg)}${cfg.pits?' · боксы':''} · приз ${money(prize)}</p>
    ${photoHTML(rc.img)}${rc.hist?`<div class="hist">${esc(rc.hist)}</div>`:''}${scnSetupHTML(rc)}
    <p class="small muted" style="margin-top:8px">👥 ${esc(privRule(rc).txt)}</p>
    <div class="label" style="margin-top:14px">На чём едете</div><div class="chips">
      ${w&&wd?chip('works',w.n,`Заводская машина ${esc(brandShort(w.n))}`,`${wd===X.job?'испытатель: ':''}завод платит взнос и подготовку · вам ${Math.round(wd.sh*100)}% приза${wd.bonus?` + ${money(wd.bonus)} за победу`:''}`,!!RRS.works):''}
      ${X.car?chip('works','',`Своя: ${esc(X.car.name)}`,racerPrivOk(rc)?`частником · состояние ${Math.round(X.car.cond)}%`:'частников сюда не берут',!RRS.works,!racerPrivOk(rc)):''}</div>
    <div class="entry" style="margin-top:10px"><canvas class="rs-car" id="rxCar" width="170" height="148"></canvas><div class="grow"><b>${esc(md.name)}</b>
      <div class="stat-grid"><div><span>Скорость</span><b>${Math.round(st.vmax*3.6)} км/ч</b></div><div><span>Мощность</span><b>${Math.round(st.hp)} л.с. · ${st.kg} кг</b></div>
      <div><span>Тормоза</span><b>${brakeName(st.brk)}</b></div><div><span>Надёжность</span><b>${Math.round(st.rel*100)}%</b></div></div></div></div>
    ${!RRS.works&&X.car&&X.car.prod?`<div class="label" style="margin-top:10px">Подготовка</div><div class="chips">${chip('prep',0,'Серийная','как с завода, бесплатно',RRS.prep===0)}${chip('prep',1,'Облегчённая',`без тента и крыльев · ${money(Math.round(racePrizeBase(rc)*0.04/10)*10)}`,RRS.prep===1)}</div>`:''}
    <div class="label" style="margin-top:10px">Шины</div><div class="chips">${chip('tyre','soft','Мягкие','цепко держат, быстро стираются',RRS.tyre==='soft')}${chip('tyre','hard','Жёсткие','живут дольше, чаще скользят',RRS.tyre==='hard')}</div>
    <div class="label" style="margin-top:10px">Передачи</div><div class="chips">${[[-1,'Короткие','разгон, горы'],[0,'Средние','на всё'],[1,'Длинные','прямые, овалы']].map(g=>chip('gear',g[0],g[1],g[2],RRS.gear===g[0])).join('')}</div>
    <div class="label" style="margin-top:14px">Как проведёте гонку</div><div class="chips">${chip('mode','drive','Еду сам','вы за рулём',RRS.mode==='drive')}${chip('mode','sim','Быстрый итог','результат сразу',RRS.mode==='sim')}</div>
    <p class="small muted" style="margin-top:10px">${cs.total?`Взнос ${money(cs.fee)}${cs.prep?` · подготовка ${money(cs.prep)}`:''}.`:'Взнос и подготовку оплачивает завод.'} Призы: 1-е место — ${money(prize)}, 2-е — ${money(racerPrizeAt(rc,2))}, 3-е — ${money(racerPrizeAt(rc,3))}, 4–6-е — от ${money(racerPrizeAt(rc,6))} до ${money(racerPrizeAt(rc,4))}${share<1?` (вам — ${Math.round(share*100)}%)`:''}.${sm?` Организаторы платят вам стартовые: ${money(sm)}.`:''}</p>
    <button class="btn primary block" style="margin-top:12px" data-act="rxGo" ${s.cash<cs.total?'disabled':''}>${s.cash<cs.total?'Не хватает денег на взнос':(RRS.mode==='drive'?'На старт':'Провести гонку')+(cs.total?' · '+money(cs.total):'')}</button>`);
  try{const cv=document.getElementById('rxCar'),spec=modelSpec(md,RRS.prep,rc.y,{country:RRS.works?(racerTeamByName(RRS.works,rc.y)||{}).c||s.country:s.country,num:7});let img=stuCanvas(spec,{w:340,crew:true,yaw:0.5,pitch:0.32});
    if(!img){const k='rsv|'+spec.key;let sp=CAR3D.cache.get(k);if(!sp){sp=renderModel(carModelFor(spec,true),0.62,0.36,70*Math.min(2,window.devicePixelRatio||1));CAR3D.cache.set(k,sp);}img=sp.img;}
    const g=cv&&cv.getContext('2d');if(g&&img){const kk=Math.min(cv.width*0.98/img.width,cv.height*0.98/img.height),ww=img.width*kk,hh=img.height*kk;g.drawImage(img,(cv.width-ww)/2,cv.height-hh,ww,hh);}}catch(_){}}
function racerGo(){const s=G,rc=raceByKey(RRS.key);if(!rc||R)return;const st=racerStatus(rc,s);if(!st[2])return;const cs=racerCosts(rc,s);if(s.cash<cs.total)return;
  if(!RRS.works&&!racerPrivOk(rc))return;if(!RRS.works&&!s.racer.car)return;
  s.cash-=cs.total;const sm=racerStartMoney(rc,s);if(sm){s.cash+=sm;s.racer.earn+=sm;}
  const md=racerRaceMd(s,rc);addLog(`Заявка на «${rc.name}»: ${RRS.works?'заводская машина '+brandShort(RRS.works):'своя машина «'+md.name+'»'}${cs.total?`, взнос ${money(cs.total)}`:''}${sm?`, стартовые ${money(sm)}`:''}.`);
  const setup={rc,mode:RRS.mode,racer:1,entries:[{drv:'me',md,prep:RRS.works?aiPrep(rc):RRS.prep,tyre:RRS.tyre,gear:RRS.gear,works:RRS.works}]};
  RRS=null;closeSheet();stopAuto();save();realLoad(setup.rc,()=>startRace(setup));}
// Машина гонщика в гонке: заводская — как у команды (её сила и надёжность), своя — по классу машины и её состоянию
function racerEntryCar(s,setup){const X=s.racer,e=setup.entries[0],rc=setup.rc,w=e.works?racerTeamByName(e.works,rc.y):null;
  const col=w?(rc.y>=1903&&COUNTRIES[w.c]?COUNTRIES[w.c].race:'#2b2320'):(e.md.paint||'#3a2a1c');e.md.paint=col;
  const C=X.car,cond=C?(C.cond||100)/100:1;
  return {you:true,works:w?w.n:'',name:w?w.n:(C&&C.mq?C.mq:X.name),label:e.md.name,drvName:setup.mode==='drive'?'Вы':X.name,drvId:'me',sk:X.sk,
    md:e.md,prep:e.prep,tyre:e.tyre,gear:e.gear,color:col,num:7,player:setup.mode==='drive',tc:w?w.c:s.country,
    pw:w?Math.pow(w.str,1.6)*teamBoost(w,rc)*DIF().race:(C?C.pw:1)*(0.92+0.08*cond),relK:w?Math.pow(w.str,0.6):(C?C.rel:1)*(0.78+0.22*cond)*(X.mech?1.05:1),pitK:X.mech?1.1:1};}
/* ---------- итоги гонки ---------- */
function racerResults(rc,res,mode,info){const s=G,X=s.racer;info=info||{};
  const k=rc.km*1000/Math.max(1,info.len||rc.km*1000),me=res.find(r=>r.you),pos=me&&!me.dnf?me.pos:0,works=!!(me&&me.works),major=!!rc.major;
  const gross=racerPrizeAt(rc,pos),deal=works?racerDeal(s,me.works):null;
  let mine=deal?Math.round(gross*deal.sh/10)*10+(pos===1?deal.bonus||0:0):gross;
  let sp=0;(X.spons||[]).forEach(o=>{if(pos===1)sp+=o.win;else if(pos&&pos<=3)sp+=Math.round(o.win*0.3/10)*10;});
  s.cash+=mine+sp;X.earn+=mine+sp;if(me)me.prize=mine+sp;
  X.starts++;if(pos===1)X.wins++;if(pos&&pos<=3)X.pods++;
  // слава: победа в большой гонке — на всю Европу; сход по поломке славы не отнимает
  const f0=X.fame,df=pos===1?(major?14:7):pos===2?(major?7:3.5):pos===3?(major?5:2.5):pos?(major?2:1):0;X.fame=clamp(X.fame+df,0,100);
  // мастерство растёт со стартами (быстрее — с хорошими результатами), но не выше природного предела
  const sk0=X.sk;X.sk=Math.min(X.pk,X.sk+(X.pk-X.sk)*(0.05+(pos?0.015:0)+(pos===1?0.025:0)));
  // своя машина: износ после гонки
  let dmgTxt='';if(!works&&X.car&&me){const d=Math.max(4,(me.dmg||0)*0.6+rc.km/180);X.car.cond=Math.max(5,(X.car.cond||100)-d);dmgTxt=`Машина после гонки — ${Math.round(X.car.cond)}% (ремонт ${money(racerRepairCost(s))}).`;}
  s.raceDone[rc.key]=pos||-1;
  s.raceLog.push({y:rc.y,key:rc.key,name:rc.name,model:me?me.label:'',place:pos,drv:X.name,major,team:[pos],works:works?me.works:''});if(s.raceLog.length>300)s.raceLog.shift();
  const w=res[0],myName=works?me.works:(X.car&&X.car.mq?X.car.mq:X.name);
  s.cres[rc.key]={w:w.you?myName:w.name,d:w.you?X.name:(w.drv||''),me:pos||-1,c:w.you?(me.tc||s.country):(w.tc||''),pv:w.priv||(w.you&&!works)?1:0};
  champRecord(s,rc,res.map(r=>({name:r.you?myName:r.name,dnf:!!r.dnf,priv:r.priv||(r.you&&!works)})));
  dchRecord(s,rc,res.map(r=>({n:r.you?X.name:r.drv,id:r.you?racerKey(s):(r.drvId||''),mq:r.you?myName:r.name,dnf:!!r.dnf,mine:r.you?1:0})));
  raceChamps(rc).forEach(id=>champFinish(s,id,rc.y));
  // команда довольна или нет: победы продлевают контракт, череда сходов — повод расстаться
  if(deal&&deal===X.team){X.team.n0=(X.team.n0||0)+1;if(pos===1)X.team.until=Math.max(X.team.until,mi(s)+12);}
  const lines=[];if(mine)lines.push(`Призовые: ${money(mine)}${deal?` (${Math.round(deal.sh*100)}% приза завода${pos===1&&deal.bonus?` + премия ${money(deal.bonus)}`:''})`:''}.`);
  if(sp)lines.push(`Спонсоры: ${money(sp)}.`);if(df)lines.push(`Слава: ${Math.round(f0)} → ${Math.round(X.fame)}.`);
  if(X.sk>sk0+0.0005)lines.push(`Мастерство: ${Math.round(sk0*100)} → ${Math.round(X.sk*100)}.`);if(dmgTxt)lines.push(dmgTxt);
  addLog(`«${rc.name}»: ${pos?pos+'-е место':'сход'}${works?` за ${me.works}`:''}${mine+sp?`, заработано ${money(mine+sp)}`:''}.`,pos===1?'good':pos?'':'bad');
  // после подиума в большой гонке заводы присматриваются к гонщику
  if(pos&&pos<=3)X.hot=mi(s)+2;
  lastRace={rc,res,k,won:mine+sp,best:pos,mode,rx:{lines,works}};evHold=1;openRaceResult();
  if(pos===1){try{celebrate('Победа!',`${rc.name} · ${works?me.works:'частник на «'+me.label+'»'}`,'🏁');}catch(_){}const P=racerPaper(s,rc,res,me,k,works);showPaper(P,true);
    try{trophyAdd(s,{kind:'cup',title:`Победа: ${rc.name}`,sub:`${X.name} · «${me.label}»`,story:`${P.deck}. ${rc.km.toLocaleString('ru-RU')} км, ${RTYPE[rc.t]||''}.${L_hist(rc)}`,key:'race|'+rc.key,rk:rc.key,reel:typeof raceReelId==='function'?raceReelId(rc):''});}catch(e){}}
  else if(pos&&pos<=3)try{trophyAdd(s,{kind:'medal',title:`${pos}-е место: ${rc.name}`,sub:`${X.name} · «${me.label}»`,story:`Подиум в гонке «${rc.name}» (${rc.km.toLocaleString('ru-RU')} км).`,key:'race|'+rc.key,rk:rc.key});}catch(e){}
  save();render();flushToasts();}
function racerPaper(s,rc,res,me,k,works){const X=s.racer,second=res.find(r=>r.pos===2),gap=second&&second.fin!=null&&me.fin!=null?(second.fin-me.fin)*k:0;
  const real=rc.win&&!/^Победителей/.test(rc.win)?rc.win:'';
  return {kicker:'Спорт',title:`${X.name} выигрывает ${rc.name}!`,deck:`${works?`Заводская машина ${me.works}`:`Частник на собственной «${me.label}»`} — первой на финише${me.fin!=null?` за ${fmtRaceTime(me.fin*k)}`:''}`,
    text:`${X.name} ${works?`провёл машину команды ${me.works}`:`на своей «${me.label}» обошёл заводские команды`} и первым пересёк финиш гонки «${rc.name}» (${rc.km.toLocaleString('ru-RU')} км).${second?` Второе место — ${second.drv||second.name}${gap>0?`, отставание ${fmtRaceTime(gap)}`:''}.`:''}\n${real?`В настоящей истории эту гонку выиграл ${real}. `:''}${X.fame>=40?'Имя гонщика знают уже по всей Европе: заводы готовы платить ему жалованье, а газеты печатают его портрет.':'Об этом гонщике заговорили: заводские команды стали к нему присматриваться.'}`,
    hist:rc.img&&IMG[rc.img]?rc.img:'',histCap:real?`В ${rc.y} году в настоящей истории: ${real}`:rc.name,act:'paperClose',choices:[['К итогам гонки','close']]};}
/* ---------- предложения: заводские команды и спонсоры ---------- */
const RX_SPONS={fr:[['Michelin','шины',1895]],uk:[['Dunlop','шины',1895]],de:[['Continental','шины',1895],['Bosch','магнето',1902]],it:[['Pirelli','шины',1899]],
  us:[['Goodrich','шины',1896],['Firestone','шины',1904]],intl:[['Castrol','масло',1909],['Shell','бензин',1907],['Bosch','магнето',1902]]};
function racerSalary(s,t){const X=s.racer;return Math.round(110*cpi(s)*(0.5+X.sk*1.5)*(0.6+X.fame/60)*t.str/5)*5;}
// Кто может позвать: в войну 1914–1918 годов в Европе не гоняются — зовут только американские команды (туда уехали Ресту и Де Пальма);
// после войны немецкие команды и гонщики Антанты до 1924 года друг друга не нанимают
function racerTeamOk(s,t){const X=s.racer,y=s.y+s.m/12,war=y>=1914.58&&y<1918.9,foe=c=>(c==='de')!==(X.nat==='de');
  if(war&&t.c!=='us')return false;if(y<1924&&y>=1914.58&&foe(t.c))return false;return true;}
function racerOfferTeam(s){const X=s.racer,T=racerTeamsNow(s).filter(t=>(!X.team||t.n!==X.team.n)&&racerTeamOk(s,t)),me=DRIVERS.find(d=>d.id===X.id);if(!T.length)return null;
  const val=X.sk*0.6+X.fame/100*0.5;
  // испытателя первым зовёт в команду свой завод — как FIAT позвал Лянчу и Надзаро
  return wpick(T,t=>(t.c===X.nat?3:1)*((t.c==='us')!==(X.nat==='us')?0.3:1)*(me&&me.mq.some(m=>t.mq.includes(m))?4:1)*(X.job&&X.job.n===t.n?5:1)*Math.exp(-Math.pow((t.str-0.85-val*0.3)*4,2)));}
// Завод, который возьмёт испытателем: тот, где начинал этот гонщик в истории, иначе один из заводов своей страны
function racerJobTeam(s){const X=s.racer,T=racerTeamsNow(s).filter(t=>racerTeamOk(s,t)),me=DRIVERS.find(d=>d.id===X.id);if(!T.length)return null;
  const hist=me?T.filter(t=>me.mq.some(m=>t.mq.includes(m))):[];if(hist.length)return hist[0];
  const home=T.filter(t=>t.c===X.nat);return wpick(home.length?home:T,t=>t.str);}
function racerJobOffer(s){const X=s.racer,T=racerJobTeam(s);if(!T)return false;const sal=racerJobPay(s);X.jobOffer={n:T.n,c:T.c,sal,sh:0.25,at:mi(s)};X.jobT=mi(s);
  pushEvent({kicker:'Работа',title:`${brandShort(T.n)} берёт испытателем`,deck:`${money(sal)} в месяц · машины завода в небольших гонках · опыт за рулём`,
    text:`Завод ${brandShort(T.n)} ищет испытателя: обкатывать новые машины на дорогах и ездить за завод в небольших открытых гонках — в горы, в клубные гонки, в пробеги. Взнос платит завод, вам — четверть приза. За рулём каждый день мастерство растёт быстрее, чем в редких гонках частника.\nСвою машину можно держать и дальше: туда, куда завод не едет, заявляйтесь сами. Позовут в гоночную команду — место испытателя уступите другому.\nТак начинали многие: Лянча и Надзаро — испытателями FIAT, Шевроле — механиком в Нью-Йорке, Рикенбакер — механиком у Ли Фрейера в Колумбусе, Феррари — испытателем CMN в Милане.`,
    choices:[['Согласиться','rx:job'],['Отказаться','rx:no']]},true);return true;}
function racerOffers(s){const X=s.racer;if(s.pending.length)return;const t=mi(s);
  // без завода и без команды: время от времени зовут испытателем
  if(!X.team&&!X.job&&X.fame<40&&t-(X.jobT??-99)>=8&&Math.random()<0.06){racerJobOffer(s);return;}
  // заводская команда: чем громче имя, тем чаще зовут; после подиума — особенно
  const p=clamp((X.fame-8)/140,0,0.22)+((X.hot||0)>=t?0.18:0)+(X.team?-0.08:0)+(t-(X.offT??-99)<4?-1:0);
  if(Math.random()<p){const T=racerOfferTeam(s);if(T){X.offT=t;const sal=racerSalary(s,T),sh=clamp(0.25+X.fame/400,0.25,0.5),bonus=Math.round(racePrizeBase({t:'road',c:'intl',y:s.y,major:1})*0.08/10)*10;
    const o={n:T.n,c:T.c,sal,sh:+sh.toFixed(2),bonus,until:t+12,at:t};X.offers=[o];
    pushEvent({kicker:'Контракт',title:`${brandShort(T.n)} зовёт в заводскую команду`,deck:`${money(sal)} в месяц · ${Math.round(sh*100)}% призов · ${money(bonus)} за победу · на год`,
      text:`Руководитель гоночного отдела ${brandShort(T.n)} предлагает место в заводской команде. Завод даёт машину, механиков и платит взносы; вам — жалованье, доля призов и премия за победу.${X.team?`\nСейчас вы едете за ${X.team.n}: подпишете — прежний контракт закончится.`:''}\nТак и было: Лянча, Надзаро и Вагнер ездили за FIAT, Буайо и Гу — за Peugeot, Шевроле — за Buick.`,
      choices:[['Подписать','rx:sign'],['Отказаться','rx:no']]},true);return;}}
  // спонсор: шины, магнето, масло — платят за имя и победы
  if((X.spons||[]).length<2&&X.fame>=18&&Math.random()<0.06&&t-(X.spT??-99)>=6){
    const L=[...(RX_SPONS[X.nat]||[]),...RX_SPONS.intl].filter(x=>x[2]<=s.y&&!(X.spons||[]).some(o=>o.n===x[0]));if(L.length){const x=pick(L);X.spT=t;
      const pay=Math.round(14*cpi(s)*(1+X.fame/25)/5)*5,win=Math.round(racePrizeBase({t:'road',c:'intl',y:s.y,major:1})*0.05/10)*10,o={n:x[0],what:x[1],pay,win,until:t+12};X.spOffer=o;
      pushEvent({kicker:'Реклама',title:`${x[0]} предлагает контракт`,deck:`${money(pay)} в месяц и ${money(win)} за каждую победу · на год`,
        text:`Фирма ${x[0]} (${x[1]}) хочет, чтобы вы ездили на её изделиях и разрешили печатать ваше имя в рекламе. Взамен — деньги каждый месяц и премия за победы.\nТак и было: шинные фирмы Michelin, Dunlop, Continental и Pirelli платили гонщикам за победы на своих шинах, а Bosch — за магнето.`,
        choices:[['Подписать','rx:spon'],['Отказаться','rx:no']]},true);}}}
function racerResolve(s,key){const X=s.racer;if(!X)return;
  if(key==='rx:sign'&&X.offers&&X.offers[0]){const o=X.offers[0];if(X.team)X.teamsBefore.push(X.team.n);X.team={n:o.n,c:o.c,sal:o.sal,sh:o.sh,bonus:o.bonus,until:o.until,from:mi(s)};X.offers=[];
    if(X.job){addLog(X.job.n===o.n?`Из испытателей ${brandShort(o.n)} — в гоночную команду.`:`Место испытателя в ${brandShort(X.job.n)} оставлено.`);X.job=null;}
    addLog(`Контракт с ${o.n}: ${money(o.sal)} в месяц, ${Math.round(o.sh*100)}% призов, ${money(o.bonus)} за победу.`,'good');pendingToasts.push('🤝 Заводская команда: '+brandShort(o.n));}
  if(key==='rx:job'&&X.jobOffer&&!X.team){X.job=X.jobOffer;X.job.from=mi(s);X.jobOffer=null;addLog(`Испытатель ${X.job.n}: ${money(X.job.sal)} в месяц.`,'good');pendingToasts.push('🔧 Испытатель: '+brandShort(X.job.n));}
  if(key==='rx:spon'&&X.spOffer){X.spons=(X.spons||[]).concat([X.spOffer]);addLog(`Спонсор: ${X.spOffer.n} — ${money(X.spOffer.pay)} в месяц.`,'good');X.spOffer=null;}
  if(key==='rx:no'){X.offers=[];X.spOffer=null;X.jobOffer=null;}
  if(key==='rx:garage'){try{tab='models';}catch(_){}}
  if(key==='rx:final'){s.pending.shift();racerFinal(s,true);save();render();return true;}
  return false;}
/* ---------- месяц гонщика ---------- */
function racerStep(s){if(!s||s.over||s.pending.length)return false;const X=s.racer,t=mi(s);
  const live=racerLiving(s),mech=X.mech?racerMechPay(s):0,gar=racerGarage(s),int=Math.round((s.loan||0)*loanRate(s)/12),sal=X.team?X.team.sal:0,job=X.job&&!X.team?X.job.sal:0,sp=(X.spons||[]).reduce((a,o)=>a+o.pay,0);
  s.cash+=sal+job+sp-live-mech-gar-int;X.last={sal,job,sp,live,mech,gar,int};
  // за рулём каждый день: испытатель учится быстрее, заводской гонщик — на тестах команды
  if(X.job||X.team)X.sk=Math.min(X.pk,X.sk+(X.pk-X.sk)*(X.job?0.012:0.006));
  if(X.car){X.car.val=Math.round(X.car.val*0.992);}
  if(X.team&&t>=X.team.until){addLog(`Контракт с ${X.team.n} закончился.`,'hist');X.teamsBefore.push(X.team.n);X.team=null;}
  X.spons=(X.spons||[]).filter(o=>{if(o.until>t)return true;addLog(`Контракт со спонсором ${o.n} закончился.`);return false;});
  X.fame=Math.max(0,X.fame*0.994-0.03);
  // мастерство с годами: после 16 сезонов — медленный спад
  if(s.m===0&&s.y-X.start.y>=16)X.sk=Math.max(0.5,X.sk-0.008);
  const H=s.hist;H.cash.push(Math.round(s.cash));for(const k2 in H)if(H[k2].length>420)H[k2].shift();
  s.m++;if(s.m>11){s.m=0;s.y++;racerYear(s);}
  if(X.job&&!racerJobObj(s)){addLog(`${brandShort(X.job.n)} закрыл гоночный отдел: место испытателя закончилось.`,'hist');X.job=null;}
  if(X.team&&!racerTeamObj(s)){addLog(`${brandShort(X.team.n)} больше не выставляет команду: контракт закончился.`,'hist');X.teamsBefore.push(X.team.n);X.team=null;}
  RACES.forEach(rc=>{if(rc.y===s.y&&rc.m-1===s.m&&!raceWarBlocked(rc,s)){const st=racerStatus(rc,s);if(st[2])addLog(`Открыта запись на гонку «${rc.name}» (${MONTHS_G[rc.m]}). Приз ${money(racePrize(rc))}.`,'hist');}});
  racerSeasonTick(s);racerNews(s);
  if(s.cash<-Math.round(600*cpi(s))){s.over=true;s.pending.push({title:'Карьера окончена',deck:`${X.name}: долги`,text:`Деньги кончились, а долги выросли: машину забрали кредиторы. Гоночная карьера окончена в ${dstr(s)}.`,paper:true,choices:[['Итоги','rx:final']]});}
  else if(s.y>=1930){s.over=true;racerFinal(s);}
  else racerOffers(s);
  return true;}
function racerSeasonTick(s){if(!s.cres)s.cres={};if(!s.season)s.season={};
  RACES.forEach(rc=>{if((rc.y<s.y||(rc.y===s.y&&rc.m<s.m))&&rc.y>=s.y-1&&!s.cres[rc.key])simRace(s,rc);});
  [s.y-1,s.y].forEach(y=>champsOf(y).forEach(id=>champFinish(s,id,y)));
  if(s.m===0){Object.keys(s.cres).forEach(k=>{if(+k.split('-').pop()<s.y-2)delete s.cres[k];});Object.keys(s.season).forEach(k=>{if(s.season[k].y<s.y-2)delete s.season[k];});}}
function racerYear(s){const y=s.y-1,X=s.racer;let D=null;try{D=dchFinish(s,y);}catch(e){}
  if(D&&D.w&&D.w.mine){const nm=`Гонщик года ${y}: ${X.name}`;if(!s.titles.some(t=>t.name===nm))s.titles.push({y,id:'dch',name:nm,w:0.25});X.fame=clamp(X.fame+10,0,100);
    try{trophyAdd(s,{kind:'medal',title:`Гонщик ${y} года`,sub:X.name,story:`${X.name} — лучший гонщик ${y} года по версии прессы.`,key:'dch|'+y,y,m:11});}catch(e){}}
  const tb=dcarTable(s),pl=tb.findIndex(r=>r.me)+1;if(pl)addLog(`Итоги ${y} года: ${pl}-е место среди гонщиков эпохи (побед ${X.wins}, подиумов ${X.pods}).`,'hist');
  if(s.dch)Object.keys(s.dch).forEach(k=>{if(+k<s.y-2)delete s.dch[k];});}
// Война: гонки в Европе отменены (в Америке — до апреля 1917 года)
function racerNews(s){const X=s.racer,t=mi(s);if(s.pending.length)return;
  if(s.y===1914&&s.m===7&&!s.seen.rxWar){s.seen.rxWar=1;if(X.team&&X.team.c!=='us'){addLog(`Контракт с ${X.team.n} прерван: завод перешёл на военные заказы.`,'hist');X.teamsBefore.push(X.team.n);X.team=null;}pushEvent({kicker:'Война!',title:'В Европе война: гонок не будет',deck:'Заводы переходят на военные заказы',text:`Германия объявила войну России и Франции, Британия вступила в войну. Гонки в Европе отменены до мира, гоночные отделы заводов строят авиамоторы и грузовики. ${X.nat==='us'?'В Америке гонки продолжаются — Индианаполис и дощатые треки ждут.':'Гонщики уходят в авиацию и автороты; в Америке гонки продолжаются — туда уехали Де Пальма, Ресту и Буайо-младший.'}`,choices:[['Ясно','ok']]},true);}
  if(s.y===1918&&s.m===10&&!s.seen.rxPeace){s.seen.rxPeace=1;pushEvent({kicker:'Мир',title:'Перемирие: гонки вернутся',deck:'Первые послевоенные гонки — в 1919 году',text:'Война окончена. Заводы возвращаются к машинам, клубы готовят гонки: Тарга Флорио и Индианаполис — уже в 1919 году.',choices:[['Отлично','ok']]},true);}}
/* ---------- гараж: покупка, ремонт, продажа, механик ---------- */
function racerBuy(i){const s=G,X=s.racer,o=racerCarOffers(s)[+i];if(!o)return;const sell=racerCarValue(s);if(s.cash+sell<o.val){toast('Не хватает денег');return;}
  if(X.car){s.cash+=sell;addLog(`Продана машина «${X.car.name}» за ${money(sell)}.`);}
  s.cash-=o.val;X.car=o;X.cars=(X.cars||0)+1;addLog(`Куплена машина «${o.name}» за ${money(o.val)}.`,'good');pendingToasts.push('🚗 '+o.name);save();render();flushToasts();}
function racerRepair(){const s=G,X=s.racer,c=racerRepairCost(s);if(!X.car||c<=0||s.cash<c)return;s.cash-=c;X.car.cond=100;addLog(`Машина отремонтирована: ${money(c)}.`);save();render();}
function racerSell(){const s=G,X=s.racer;if(!X.car)return;if(!confirmOnce('rxSell','Нажмите ещё раз: продать машину'))return;const v=racerCarValue(s);s.cash+=v;addLog(`Продана машина «${X.car.name}» за ${money(v)}.`);X.car=null;save();render();}
function racerMech(){const s=G,X=s.racer;X.mech=X.mech?0:1;addLog(X.mech?`Нанят механик: ${money(racerMechPay(s))} в месяц.`:'Механик уволен.');save();render();}
function racerQuit(){const s=G,X=s.racer;if(!X.team)return;if(!confirmOnce('rxQuit','Нажмите ещё раз: уйти из команды (слава −5)'))return;addLog(`Вы ушли из команды ${X.team.n}.`,'bad');X.teamsBefore.push(X.team.n);X.team=null;X.fame=Math.max(0,X.fame-5);save();render();}
function racerJobQuit(){const s=G,X=s.racer;if(!X.job)return;if(!confirmOnce('rxJobQuit','Нажмите ещё раз: уйти с завода'))return;addLog(`Вы ушли с места испытателя ${X.job.n}.`);X.job=null;X.jobT=mi(s);save();render();}
/* ---------- своё дело ---------- */
function racerFoundK(s){return cpi(s)*(1+0.02*Math.max(0,s.y-1895));}
// мастерская на 3 машины в месяц (с партнёром — вдвое больше) и оборотные деньги: зарплаты, детали, первая партия, дилер
function racerFoundCost(s){return Math.round(6000*racerFoundK(s)/500)*500;}
function racerFoundWork(s){return Math.round(8000*racerFoundK(s)/500)*500;}
function racerFoundPrice(s,opt){if(opt==='buy'){const B=racerBrandOffer(s);return B?B.price:1e18;}return opt==='partner'?Math.round(racerFoundCost(s)*1.6/500)*500:racerFoundCost(s);}
function racerFoundNeed(s,opt){return racerFoundPrice(s,opt)+racerFoundWork(s);}
// банк даёт под имя гонщика не больше его собственного капитала
function racerLoanMax(s){const X=s.racer;return Math.max(0,Math.round(Math.min(Math.max(0,s.cash),X.fame*cpi(s)*300,15000*cpi(s))/500)*500);}
function racerInvestor(s){const X=s.racer;return X.fame>=35?Math.round(Math.max(Math.max(0,s.cash)*1.5,10000*cpi(s))/500)*500:0;}
function racerBrandOffer(s){const c=s.racer.nat;try{const L=brandCands(s,c);if(!L.length)return null;const x=L[L.length-1],price=Math.round(brandPrice(s,c,x)*0.9/500)*500;return price>0?{x,price,n:compName(x.cp,s)}:null;}catch(e){return null;}}
function racerFoundName(s){const X=s.racer,R0=RACERS[X.id];if(R0&&R0.brand)return R0.brand;const p=String(X.name).trim().split(/\s+/);return p[p.length-1]||'Марка';}
// Класс первой машины: где прибыль за месяц больше (спрос по рынку × маржа), спорту — небольшая фора за имя гонщика
function racerFirstModel(g,md){const segs=['lux','middle','people'].concat(sportOpen(g,g.country)?['sport']:[]);let best=null;
  segs.forEach(k=>{try{const d=autoDesign(k,g),m={...md};['e','g','c','k','b','t','w'].forEach(k2=>{if(d[k2])m[k2]=d[k2];});m.price=Math.round(refPrice(m,g)/10)*10;
    const q=Math.min(capEff(g),forecastDemand(m,g)),v=q*(m.price*0.84-unitCost(m,g))*(k==='sport'?1.25:1);if(!best||v>best.v)best={k,m,v};}catch(e){}});
  if(best)['e','g','c','k','b','t','w'].forEach(k2=>{md[k2]=best.m[k2];});return best?best.k:'middle';}
function racerModelName(X,nm,c){const L={it:'Tipo 1',fr:'Type A',de:'Typ 1',uk:'Model A',us:'Model A'};return `${nm} ${X.id==='lancia'?'Alfa':L[c]||'Model A'}`.slice(0,24);}
function racerFound(opt,name,loan){const s=G,X=s.racer;if(!X||!isRacer(s))return false;
  const inv=opt==='partner'?racerInvestor(s):0,B=opt==='buy'?racerBrandOffer(s):null,need=racerFoundPrice(s,opt);
  loan=clamp(Math.round(+loan||0),0,racerLoanMax(s));if(s.cash+loan+inv<need+racerFoundWork(s)){toast('Не хватает денег');return false;}
  const keep={titles:s.titles,trophies:s.trophies,papers:s.papers,raceLog:s.raceLog,dch:s.dch,dcar:s.dcar,cres:s.cres,season:s.season,seen:s.seen,raceDone:s.raceDone,ach:s.ach,ui:s.ui,reels:s.reels,log:s.log,dchWon:s.dchWon};
  const y=s.y,m=s.m,c=X.nat,R0=RACERS[X.id]||RACERS.custom,pio=R0.pio&&PIONEERS[R0.pio]?R0.pio:'r_custom',capital=s.cash+loan+inv-need,nm=(name||'').trim()||racerFoundName(s),fame=X.fame;
  newGame(pio,c,nm,s.diff,'');const g=G;
  Object.assign(g,keep);g.mode='company';g.y=y;g.m=m;g.racer=Object.assign(X,{founded:{y,m,opt,name:nm,loan,inv,cost:need}});
  // историческая марка этого гонщика (Lancia, Chevrolet) — это вы: из соперников она уходит
  {const cp=Object.keys(COMPS).map(cc=>(COMPS[cc]||[]).map((b,i)=>({b,i,c:cc}))).flat().find(o=>o.b.n===nm&&!o.b.imp);if(cp){X.brandCp={c:cp.c,i:cp.i,n:cp.b.n};racerBrandLink();}}
  g.fleet={};g.mkY={};for(const cc in COUNTRIES){g.fleet[cc]=fleetHist(cc,y+m/12);}
  for(const cc in COUNTRIES){const R2=mkCountry(cc,g,[]);g.mkY[cc]=SEGK.reduce((a,gg)=>a+R2.segs[gg].inc,0)*12/SEASON[m];}
  g.cash=Math.round(capital);g.loan=loan;g.rep=clamp(25+fame*0.4,20,70);g.racer.capital0=g.cash;
  if(opt==='buy'&&B){const v=compVol(B.x.cp,g);g.cap=Math.max(4,Math.round(v/12*1.25));g.dealers={[c]:Math.max(2,Math.round(v/12/Math.max(0.5,dealerTP(g))))};g.rep=clamp(g.rep+8,20,75);
    g.bought=g.bought||{};g.bought[c]={c,i:B.x.i,n:B.x.cp.n,y,t:mi(g),home:1};addLog(`Куплена марка «${B.n}» за ${money(B.price)}: её завод, ${fmtN(g.dealers[c])} ${plural(g.dealers[c],'дилер','дилера','дилеров')} и покупатели теперь ваши.`,'good');}
  else{g.cap=opt==='partner'?6:3;g.dealers={[c]:opt==='partner'?clamp(Math.round(dealerNeed(c,g)/5),2,8):clamp(Math.round(dealerNeed(c,g)/8),1,4)};}
  // мастерская оснащена по своему времени: станки, электромоторы, контроль — то, что у мастерских было уже лет шесть;
  // конвейер, литейка, пресс и кредитная компания — дело большого завода, их строят самому
  g.tech={};['tools','elec','parts','line','school','qc'].forEach(k=>{const L=TECH[k].lv;let l=0;while(l<L.length&&L[l].y<=y-6&&!(k==='line'&&l>=1)&&(!L[l].need||Object.keys(L[l].need).every(r=>(g.tech[r]||0)>=L[l].need[r])))l++;if(l)g.tech[k]=l;});
  g.plantVal=g.cap*capUnitCost(g);
  // первая модель — по деталям своего года и в том классе, где новая марка заработает: гонщику по душе спорт, но рынок решает
  // имя гонщика на радиаторе: первые покупатели — его поклонники (как после гоночной победы и титула)
  if(fame>=20){g.titleBoost=mi(g)+Math.round(clamp(fame/4,6,18));}
  const md=g.models[0];md.raceBoost=mi(g)+Math.round(clamp(fame/4,4,18));const kind=racerFirstModel(g,md);md.name=racerModelName(X,nm,c);md.price=Math.round(refPrice(md,g)/10)*10;md.launched=mi(g);
  if(inv){g.investor={sh:0.35,until:mi(g)+96,n:X.nat==='us'?'Уильям Дюрант':'банкир-партнёр',inv};}
  g.log=(keep.log||[]).slice(-200);
  addLog(`${X.name} основал${/а$/.test(X.name.split(' ')[0])?'а':''} марку «${nm}» (${COUNTRIES[c].city}, ${MONTHS_N[m]} ${y}): ${opt==='buy'?'куплен завод':opt==='partner'?`мастерская с партнёром (${g.investor.n} вложил ${money(inv)} за 35% прибыли на 8 лет)`:'мастерская с нуля'}${loan?`, кредит банка ${money(loan)}`:''}. Первая модель — «${md.name}».`,'good');
  pushEvent({kicker:'Своё дело',own:1,title:`${X.name} основывает марку «${nm}»`,deck:`Гонщик становится промышленником · ${COUNTRIES[c].city}, ${y}`,
    text:`Капитал гонщика — призы, жалованье команд и спонсоров — вложен в своё дело.${loan?` Банк дал кредит ${money(loan)}: имя чемпиона — лучший залог.`:''}${inv?` Партнёр вложил ${money(inv)} и получит 35% прибыли за восемь лет.`:''}\nТак было и в истории: ${R0.found?`${R0.n} основал ${R0.brand} в ${R0.found} году.`:'Лянча основал Lancia в 1906 году, Шевроле — Chevrolet в 1911-м, Бентли — Bentley в 1919-м.'} Гонки не бросайте: ваша слава — лучшая реклама новой марки, а за руль своих машин можно садиться самому.`,choices:[['К делу','ok']]},true);
  g.seen=g.seen||{};g.seen.rxFounded=1;
  return true;}
/* ---------- итог карьеры (1930 год или долги) ---------- */
function racerFinal(s,show){const X=s.racer,tb=dcarTable(s),pl=tb.findIndex(r=>r.me)+1;
  s.final={racer:1,place:pl,wins:X.wins,pods:X.pods,starts:X.starts,earn:X.earn};
  const top=tb.slice(0,5).map((r,i)=>`${i+1}. ${r.me?X.name:r.n} — ${r.w} ${plural(r.w,'победа','победы','побед')}, ${fmtPts('gp',r.pts)} очков`).join('\n');
  const ev={kicker:'Итоги',title:`${X.name}: ${pl?pl+'-е место':'вне рейтинга'} среди гонщиков эпохи`,deck:`${X.starts} ${plural(X.starts,'старт','старта','стартов')} · ${X.wins} ${plural(X.wins,'победа','победы','побед')} · ${X.pods} ${plural(X.pods,'подиум','подиума','подиумов')} · заработано ${money(X.earn)}`,
    text:`Лучшие гонщики эпохи по очкам прессы:\n${top}\n${pl>5?`…\n${pl}. ${X.name}`:''}`,choices:[['Новая игра','restart']]};
  if(show)pushEvent(ev,true);else s.pending.push(ev);}
/* ---------- экраны ---------- */
function racerNav(){const R1=isRacer(G),L=R1?{plant:['Гонщик','M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21c0-4 4-7 8-7s8 3 8 7'],models:['Гараж','M3 15h18v3H3zM5 15l2-5h9l3 5'],market:['Рейтинг','M4 20V10M10 20V4M16 20v-7M22 20H2'],race:['Гонки','M5 21V4M5 4h13l-2 4 2 4H5'],log:['Своё дело','M3 21V10l6 4V10l6 4V6h6v15z']}:null;
  document.querySelectorAll('.tab').forEach(b=>{const t=b.dataset.t;if(!b.dataset.html)b.dataset.html=b.innerHTML;if(R1&&L[t])b.innerHTML=`<svg viewBox="0 0 24 24"><path d="${L[t][1]}"/></svg>${L[t][0]}`;else if(!R1&&b.dataset.html)b.innerHTML=b.dataset.html;});}
function racerHeadStrip(s){const X=s.racer,tb=dcarTable(s),pl=tb.findIndex(r=>r.me)+1;
  // ближайшая гонка, куда вас возьмут: с открытой записью — или следующая по календарю
  const up=RACES.filter(rc=>(rc.y>s.y||(rc.y===s.y&&rc.m>=s.m))&&rc.y<=s.y+1&&!s.raceDone[rc.key]&&!raceWarBlocked(rc,s)&&(racerWorksIn(rc,s)||(X.car&&racerPrivOk(rc)))).sort((a,b)=>a.y-b.y||a.m-b.m);
  const next=up.find(rc=>racerStatus(rc,s)[2]),soon=up[0];
  return `<div class="ec-top" data-act="tab" data-t="market" role="button"><div class="ec-place">${pl?`<b>${pl}<small>-е</small></b><span>среди гонщиков эпохи</span>`:'<b>—</b><span>рейтинг</span>'}</div>
      <div class="ec-pts"><b>${X.wins}</b> ${plural(X.wins,'победа','победы','побед')} · ${X.pods} ${plural(X.pods,'подиум','подиума','подиумов')} · слава ${Math.round(X.fame)}</div></div>
    <button class="ec-row goal" data-act="tab" data-t="${next||soon?'race':'models'}"><i>${next||soon?'🏁':'🚗'}</i><span>${next?`Ближайшая гонка: «${esc(next.name)}» ${whenTxt(next,s)} — ${esc(racerStatus(next,s)[0].toLowerCase())}`:soon?`Следующая гонка: «${esc(soon.name)}» ${whenTxt(soon,s)}${racerWorksIn(soon,s)?' — за завод':''}`:X.car||X.team||X.job?'Гонок с открытой записью пока нет — жмите «Следующий месяц»':'Купите первую машину в гараже'}</span></button>
    ${X.team?`<div class="ec-row"><i>🏭</i><span>Заводская команда <b>${esc(X.team.n)}</b> до ${esc(miDate(X.team.until))}</span></div>`:''}`;}
function racerRender(s){racerNav();const X=s.racer;
  document.getElementById('co').textContent=`${X.name} · гонщик${X.team?' '+brandShort(X.team.n):''}`;
  const d=document.getElementById('date'),ds=dstr(s);d.innerHTML=`${MONTHS[s.m]} <span>${s.y}</span>`;if(lastDate&&lastDate!==ds){d.classList.remove('flip');void d.offsetWidth;d.classList.add('flip');}lastDate=ds;setCash(s.cash);
  document.getElementById('view').innerHTML=tab==='models'?vRxGarage(s):tab==='market'?vRxRank(s):tab==='race'?vRxRaces(s):tab==='log'?vRxFound(s):vRxMe(s);
  {const es=document.getElementById('empStrip');if(es){es.innerHTML=racerHeadStrip(s);es.hidden=false;}}
  document.body.dataset.tab=tab;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
  const nb=document.getElementById('nextBtn'),qb=document.getElementById('qBtn'),ab=document.getElementById('autoBtn');const blocked=s.pending.length>0||s.over;nb.disabled=qb.disabled=ab.disabled=blocked;
  nb.textContent=s.over?'Карьера окончена':blocked?'Сначала решите событие':'Следующий месяц →';ab.textContent=auto?'❚❚':'▶';ab.classList.toggle('on',!!auto);
  if(tab==='models')racerDrawCars(s);
  if(s.pending.length&&!R&&!evHold){stopAuto();showEvent();}}
function racerTips(s){const X=s.racer,T=[],add=(p,i,t,btn,act)=>T.push({p,i,t,btn,act});
  if(!X.car&&!X.team)add(X.job?45:100,'🚗',X.job?'Своя машина — для гонок, куда завод не едет: подержанная гоночная прошлых лет дёшева, и на ней уже можно бороться за призы.':'Сначала — машина. В гараже есть подержанные гоночные машины прошлых лет: дёшево, и на них уже можно бороться за призы.','В гараж','tab:models');
  const open=RACES.filter(rc=>rc.y===s.y&&racerStatus(rc,s)[2]);if(open.length)add(90,'🏁',`Открыта запись: «${open[0].name}»${open.length>1?` и ещё ${open.length-1}`:''}. Призы и слава — только на старте.`,'К гонкам','tab:race');
  if(X.car&&(X.car.cond||100)<60)add(80,'🔧',`Машина изношена (${Math.round(X.car.cond)}%): ломается чаще и едет медленнее. Ремонт — ${money(racerRepairCost(s))}.`,'Ремонт','rxRepair');
  if(!X.team&&X.fame<12&&X.starts>=2)add(55,'📰','Заводы зовут тех, о ком пишут газеты: подиумы в больших гонках (★) прибавляют больше всего славы.');
  if(!X.mech&&X.car&&s.cash>racerMechPay(s)*12)add(50,'🧰',`Механик рядом с гонщиком чинит поломки на трассе: машина надёжнее, ремонт в пути быстрее. ${money(racerMechPay(s))} в месяц.`,'Нанять','rxMech');
  const need=racerFoundNeed(s,'scratch');if(s.cash+racerLoanMax(s)>=need&&X.fame>=20)add(60,'🏭',`Капитала уже хватает на своё дело: мастерская и оборотные деньги — ${money(need)}. Так и Лянча в 1906 году основал свою марку, не бросая гонок.`,'Своё дело','tab:log');
  if(!X.job&&!X.team&&s.cash>=0&&s.cash<racerLiving(s)*12)add(70,'🔧','Денег мало. Место испытателя на заводе даёт жалованье и опыт: заводы ищут испытателей время от времени — соглашайтесь.');
  if(s.cash<0)add(95,'⚠️',`Долги ${money(-s.cash)}: при долге больше ${money(Math.round(600*cpi(s)))} карьера окончится. Продайте машину или поменяйте на дешёвую.`,'В гараж','tab:models');
  return T.sort((a,b)=>b.p-a.p);}
function vRxMe(s){const X=s.racer,R0=RACERS[X.id]||RACERS.custom,d=DRIVERS.find(z=>z.id===X.id),L=X.last||{},tips=racerTips(s).slice(0,3);
  const net=(L.sal||0)+(L.job||0)+(L.sp||0)-(L.live||0)-(L.mech||0)-(L.gar||0)-(L.int||0);
  return `<section class="card advisor"><div class="row"><span class="label">💡 Советник</span></div>${tips.length?tips.map(t=>`<div class="tip"><span class="ic">${t.i}</span><p class="small">${esc(t.t)}</p>${t.btn?`<button class="btn sm primary" data-act="${t.act.startsWith('tab:')?'tab':t.act}" ${t.act.startsWith('tab:')?`data-t="${t.act.slice(4)}"`:''}>${esc(t.btn)}</button>`:''}</div>`).join(''):'<p class="small muted" style="margin-top:6px">Всё в порядке. Жмите «Следующий месяц».</p>'}</section>
  <section class="card"><div class="row" style="gap:12px;justify-content:flex-start">${d?drvPhoto(d):''}<div><span class="label">Гонщик · ${esc(COUNTRIES[X.nat].name)}</span><h2 style="margin-top:2px">${esc(X.name)}</h2>
    <p class="small muted">Мастерство <b>${Math.round(X.sk*100)}</b> из ${Math.round(X.pk*100)} · слава <b>${Math.round(X.fame)}</b> · на трассе с ${X.start.y} года</p></div></div>
    <div class="meta" style="margin-top:10px"><div>Старты<b>${X.starts}</b></div><div>Победы<b>${X.wins}</b></div><div>Подиумы<b>${X.pods}</b></div><div>Заработано<b>${money(X.earn)}</b></div></div>
    ${R0.bio&&X.id!=='custom'?`<p class="small muted" style="margin-top:8px">В истории: ${esc(R0.bio)}</p>`:''}</section>
  <section class="card"><h2>Контракты</h2>
    ${X.team?`<div class="race-item"><div class="row"><div><span class="mo">заводская команда · до ${esc(miDate(X.team.until))}</span><h3>${esc(X.team.n)}</h3></div><button class="btn sm" data-act="rxQuit">Уйти</button></div><p class="small muted" style="margin-top:4px">${money(X.team.sal)} в месяц · ${Math.round(X.team.sh*100)}% призов · ${money(X.team.bonus)} за победу. Команда даёт машину и платит взносы в гонках, куда едет сама (международные и большие — везде, национальные — дома).</p></div>`:
      X.job?`<div class="race-item"><div class="row"><div><span class="mo">испытатель завода · с ${esc(miDate(X.job.from||0))}</span><h3>${esc(X.job.n)}</h3></div><button class="btn sm" data-act="rxJobQuit">Уйти</button></div><p class="small muted" style="margin-top:4px">${money(X.job.sal)} в месяц · ${Math.round(X.job.sh*100)}% приза. Завод сажает вас за руль своей машины в небольших открытых гонках (★ — не для испытателей) и платит взнос; мастерство растёт каждый месяц.</p></div>`:
      `<p class="small muted" style="margin-top:6px">Вы — частник: едете на своей машине и сами платите взносы. В Гран-при и Кубок Гордона Беннетта частников не берут — нужна заводская команда. Заводы зовут гонщиков, о которых пишут газеты: подиумы и победы в больших гонках.</p>`}
    ${(X.spons||[]).map(o=>`<div class="race-item"><span class="mo">спонсор · ${esc(o.what||'')} · до ${esc(miDate(o.until))}</span><h3>${esc(o.n)}</h3><p class="small muted">${money(o.pay)} в месяц · ${money(o.win)} за победу</p></div>`).join('')}
    ${X.teamsBefore.length?`<p class="small muted" style="margin-top:6px">Команды прежде: ${esc(X.teamsBefore.join(', '))}.</p>`:''}</section>
  <section class="card"><h2>Деньги месяца</h2><table class="pl" style="margin-top:6px">
    ${L.sal?`<tr><td>Жалованье команды</td><td class="n good">+${money(L.sal)}</td></tr>`:''}${L.job?`<tr><td>Жалованье испытателя</td><td class="n good">+${money(L.job)}</td></tr>`:''}${L.sp?`<tr><td>Спонсоры</td><td class="n good">+${money(L.sp)}</td></tr>`:''}
    <tr><td>Жизнь и разъезды</td><td class="n">−${money(L.live||racerLiving(s))}</td></tr>${L.gar?`<tr><td>Гараж и уход за машиной</td><td class="n">−${money(L.gar)}</td></tr>`:''}${L.mech?`<tr><td>Механик</td><td class="n">−${money(L.mech)}</td></tr>`:''}${L.int?`<tr><td>Проценты по кредиту</td><td class="n">−${money(L.int)}</td></tr>`:''}
    <tr><td><b>Итого за месяц</b></td><td class="n"><b class="${net<0?'bad':'good'}">${net<0?'−':'+'}${money(Math.abs(net))}</b></td></tr></table>
    <p class="small muted" style="margin-top:6px">Главные деньги гонщика — призы, стартовые (организаторы платят знаменитостям за участие) и премии команды и спонсоров за победы.</p></section>
  ${(s.titles||[]).length?`<section class="card"><h2>Титулы</h2><ul class="log" style="margin-top:6px">${s.titles.map(t=>`<li class="good"><time>${t.y}</time><p>${esc(t.name)}</p></li>`).join('')}</ul></section>`:''}${(()=>{try{return trophyCabinetCard(s);}catch(_){return '';}})()}`;}
function vRxGarage(s){const X=s.racer,C=X.car,O=racerCarOffers(s),sell=racerCarValue(s);
  const carRow=(c,i)=>{const st=rcCarStats(c,s.y);return `<div class="race-item"><div class="row" style="gap:10px"><canvas class="rx-car" data-i="${i}" width="132" height="110"></canvas><div class="grow"><span class="mo">${c.kind==='used'?'подержанная гоночная':c.kind==='new'?'новая гоночная, с завода':'серийная спортивная'}</span><h3 style="margin-top:2px">${esc(c.name)}</h3><p class="small muted">${statsLine(st)} · надёжность ${Math.round(st.rel*100)}%</p></div></div>
    <div class="row" style="margin-top:6px"><span class="small muted">${c.kind==='prod'?'Можно облегчить к гонке; в Гран-при не годится.':c.kind==='used'?'Прошлых лет и не новая — зато по карману.':'Машина как у заводской команды.'}</span><button class="btn sm ${!C?'primary':''}" data-act="rxBuy" data-k="${i}" ${s.cash+sell<c.val?'disabled':''}>${C?'Обменять · ':'Купить · '}${money(c.val)}</button></div></div>`;};
  return `<section class="card"><h2>Ваша машина</h2>${C?`<div class="race-item"><div class="row" style="gap:10px"><canvas class="rx-car" data-i="me" width="170" height="140"></canvas><div class="grow"><h3>${esc(C.name)}</h3><p class="small muted">${statsLine(rcCarStats(C,s.y))}</p>
      <div class="bar" style="margin-top:6px"><i style="width:${Math.round(C.cond)}%;background:var(--${C.cond<50?'bad':C.cond<75?'warn':'good'})"></i></div><p class="small muted">Состояние ${Math.round(C.cond)}% · стоит сейчас ${money(sell)}</p></div></div>
      <div class="btns" style="margin-top:8px"><button class="btn sm" data-act="rxRepair" ${C.cond>=99||s.cash<racerRepairCost(s)?'disabled':''}>Ремонт · ${money(racerRepairCost(s))}</button><button class="btn sm" data-act="rxSell">Продать · ${money(sell)}</button><button class="btn sm ${X.mech?'primary':''}" data-act="rxMech">${X.mech?'Механик в команде':'Нанять механика'} · ${money(racerMechPay(s))}/мес</button></div></div>`:
      `<p class="small muted" style="margin-top:6px">${X.team?'В гонках команды вы едете на заводской машине. Своя машина нужна для гонок, куда команда не едет.':'Своей машины пока нет. Без неё — только гонки за заводскую команду, а туда зовут тех, кто уже побеждал.'}</p>`}</section>
    <section class="card"><h2>Продаются в ${s.y} году</h2><p class="small muted" style="margin-top:4px">Гонщики-частники покупали гоночные машины прошлых сезонов у заводов и у других гонщиков, а серийные спортивные — у дилеров.</p>${O.map(carRow).join('')}</section>`;}
function racerDrawCars(s){const X=s.racer,O=racerCarOffers(s);document.querySelectorAll('#view .rx-car').forEach(cv=>{const i=cv.dataset.i,c=i==='me'?X.car:O[+i];if(!c)return;
  try{const spec=modelSpec(c.md,c.prod?0:2,s.y,{country:X.nat,num:7});let img=stuCanvas(spec,{w:300,crew:false,yaw:0.5,pitch:0.3});
    if(!img){const k='rxv|'+spec.key;let sp=CAR3D.cache.get(k);if(!sp){sp=renderModel(carModelFor(spec,false),0.62,0.36,60*Math.min(2,window.devicePixelRatio||1));CAR3D.cache.set(k,sp);}img=sp.img;}
    const g=cv.getContext('2d');if(!g||!img)return;g.clearRect(0,0,cv.width,cv.height);const kk=Math.min(cv.width*0.98/img.width,cv.height*0.98/img.height),w=img.width*kk,h=img.height*kk;g.drawImage(img,(cv.width-w)/2,cv.height-h,w,h);}catch(_){}});}
function vRxRank(s){const X=s.racer,tb=dcarTable(s),me=tb.findIndex(r=>r.me),show=tb.slice(0,20).concat(me>=20?[tb[me]]:[]);
  const row=r=>{const d=r.k&&r.k!=='me'&&!r.me?DRIVERS.find(z=>z.id===r.k):null,nm=r.me?X.name:r.n,ti=dcarTitles(s,r.k);
    return `<tr class="${r.me?'you':''}"><td class="n">${tb.indexOf(r)+1}</td><td style="padding-left:6px">${d?`<button class="linkbtn" style="text-align:left" data-act="drvBio" data-k="${d.id}">${esc(nm)}</button>`:esc(nm)}<small>${esc(r.mq||'')} · ${r.y0}${r.y1>r.y0?'–'+r.y1:''}${ti?` · 🏆×${ti}`:''}</small></td><td class="n">${r.w}</td><td class="n">${r.pod}</td><td class="n">${fmtPts('gp',r.pts)}</td></tr>`;};
  return `<section class="card"><h2>Гонщики эпохи</h2><p class="small muted" style="margin-top:4px">Все гонки с 1895 года по версии прессы: первые шесть получают 8, 6, 4, 3, 2 и 1 очко, в малых гонках — вдвое меньше. До вашего дебюта — как в истории, дальше — как сложится на трассе. 🏆 — «Гонщик года».</p>
    <table class="pl ctab" style="margin-top:8px"><tr><th class="n">#</th><th style="padding-left:6px">Гонщик</th><th class="n">Победы</th><th class="n">Подиумы</th><th class="n">Очки</th></tr>${show.map(row).join('')}</table>
    ${me<0?'<p class="small muted" style="margin-top:8px">Вас в таблице пока нет: первое очко дают за шестое место.</p>':''}</section>
    ${dchBlock(s,s.y)}`;}
function vRxRaces(s){const y=s.y,cur=RACES.filter(r=>r.y===y),nxt=RACES.filter(r=>r.y===y+1&&r.m<3);
  const item=rc=>{const [st,tone,open]=racerStatus(rc,s),r=s.cres&&s.cres[rc.key],w=racerWorksIn(rc,s);
    return `<div class="race-item"><div class="row"><div><span class="mo">${MONTHS[rc.m]} · ${hostName(rc.c)} · ${RTYPE[rc.t]} · ${rc.km.toLocaleString('ru-RU')} км</span><h3 style="margin-top:2px">${esc(rc.name)}${rc.major?' <span class="star" title="Большая гонка">★</span>':''}</h3></div><span class="pill ${tone}">${st}</span></div>
      ${r&&r.w&&!r.x?`<p class="small muted" style="margin-top:4px">Победа: ${esc(r.w)}${r.d?` (${esc(r.d)})`:''}</p>`:`<p class="small muted" style="margin-top:4px">Приз ${money(racePrize(rc))}${w?` · за ${esc(brandShort(w.n))}`:racerPrivOk(rc)?` · взнос ${money(racerFee(rc))}`:''}</p>`}
      ${open?`<button class="btn primary block" style="margin-top:8px" data-act="rxRace" data-k="${rc.key}" ${s.pending.length?'disabled':''}>${w?(s.racer.team&&s.racer.team.n===w.n?'Ехать за команду':'Ехать за завод'):'Заявиться частником'}</button>`:''}</div>`;};
  const hist=s.raceLog.slice(-12).reverse().map(r=>`<tr><td>${r.y}</td><td>${esc(r.name)}<small>${esc(r.model||'')}${r.works?' · '+esc(brandShort(r.works)):' · частник'}</small></td><td class="n ${r.place===1?'good':r.place?'':'bad'}">${r.place?r.place+'-е':'сход'}</td></tr>`).join('');
  return `<section class="card"><h2>Гонки ${y}</h2><p class="small muted" style="margin-top:4px">Частников берут в гонки по дорогам, в горы, в пробеги и клубные гонки. Гран-при и Кубок наций — только заводские команды.</p>${cur.map(item).join('')||'<p class="small muted">В этом году гонок нет.</p>'}</section>
    ${nxt.length?`<section class="card"><h2>В начале ${y+1} года</h2>${nxt.map(item).join('')}</section>`:''}
    ${hist?`<section class="card"><h2>Ваши гонки</h2><table class="pl" style="margin-top:6px">${hist}</table></section>`:''}`;}
function vRxFound(s){const X=s.racer,cost=racerFoundCost(s),work=racerFoundWork(s),lmax=racerLoanMax(s),inv=racerInvestor(s),B=racerBrandOffer(s),nm=racerFoundName(s),R0=RACERS[X.id]||RACERS.custom;
  const have=s.cash+lmax,pc=racerFoundPrice(s,'partner');
  const opt=(k,title,price,txt,extra,ok)=>`<div class="race-item"><div class="row"><div><span class="mo">${esc(price)}</span><h3 style="margin-top:2px">${esc(title)}</h3></div><button class="btn sm ${ok?'primary':''}" data-act="rxFound" data-k="${k}" ${ok?'':'disabled'}>Основать</button></div><p class="small muted" style="margin-top:4px">${txt}</p>${extra||''}</div>`;
  return `<section class="card"><h2>Своё дело</h2><p class="small muted" style="margin-top:4px">Гонщики эпохи часто становились промышленниками: Лянча основал Lancia (1906), Надзаро — Nazzaro (1911), Шевроле вместе с Дюрантом — Chevrolet (1911), Бентли — Bentley (1919), Рикенбакер — Rickenbacker Motor (1922), Мазерати — Maserati (1926), Феррари — Scuderia Ferrari (1929). Капитал — ваши призы и жалованье; банк даёт кредит под имя гонщика.${R0.found&&X.id!=='custom'?` ${esc(R0.n)} в истории основал ${esc(R0.brand)} в ${R0.found} году.`:''}</p>
    <div class="meta" style="margin-top:10px"><div>Капитал<b>${money(Math.max(0,s.cash))}</b></div><div>Кредит под имя<b>${money(lmax)}</b></div><div>Слава<b>${Math.round(X.fame)}</b></div></div>
    <label class="label" for="rxName" style="display:block;margin-top:12px">Название марки</label><input type="text" id="rxName" value="${esc(nm)}" maxlength="24" style="margin-top:6px">
    <p class="small muted" style="margin-top:10px">Кроме мастерской нужны оборотные деньги — не меньше ${money(work)}: зарплаты, детали и первая партия машин, пока не пошли продажи.</p>
    <p class="small ${s.y>=1920?'warn':'muted'}" style="margin-top:6px">${s.y<1908?'Рынок ещё молодой: маленькая мастерская с хорошей машиной находит покупателей — так начинали почти все марки.':s.y<1920?'Большие заводы уже делают машины потоком и дешевле. Маленькой марке выгоднее дорогие и быстрые машины — или купить готовую марку с заводом и дилерами.':'В 1920-х конвейерные марки продают машины дешевле, чем мастерская платит за детали. Rickenbacker Motor (1922) разорилась через пять лет, Bentley держалась славой Ле-Мана. Надёжнее купить марку с заводом и дилерами или взять партнёра.'}</p>
    ${opt('scratch','Мастерская с нуля',`${money(cost)} + ${money(work)} оборотных`,`Мастерская на 3 машины в месяц, дилер в своём городе, первая модель — быстрая спортивная машина вашего года. Репутация — от вашей славы.`,'',have>=cost+work)}
    ${opt('partner','С партнёром-инвестором',inv?`${money(pc)} + ${money(work)} · партнёр вложит ${money(inv)}`:'нужна слава 35',`Как Шевроле с Дюрантом: партнёр вкладывает деньги и получает 35% прибыли восемь лет. Мастерская вдвое больше, дилеров больше.`,'',inv>0&&have+inv>=pc+work)}
    ${B?opt('buy',`Купить марку «${B.n}»`,`${money(B.price)} + ${money(work)} оборотных`,`Слабая местная марка продаёт завод: её мощности, дилеры и покупатели станут вашими, а в соперниках её больше не будет.`,'',have>=B.price+work):''}
    <p class="small muted" style="margin-top:8px">Основав марку, вы продолжите игру магнатом — с вашими титулами и трофеями. За руль своих машин можно садиться самому: мастерство гонщика сохраняется.</p></section>
    ${foldCard('rxlog',false,'<h2>Хроника</h2>',`<ul class="log" style="margin-top:6px">${s.log.slice().reverse().slice(0,120).map(l=>`<li class="${l.kind}"><time>${l.d}</time><p>${esc(l.text)}</p></li>`).join('')}</ul>`,s.log.length?esc(s.log[s.log.length-1].d+': '+s.log[s.log.length-1].text):'')}`;}
function racerFoundAsk(k){const s=G,X=s.racer,nm=(document.getElementById('rxName')||{}).value||racerFoundName(s),cost=racerFoundPrice(s,k),work=racerFoundWork(s),inv=k==='partner'?racerInvestor(s):0,lmax=racerLoanMax(s);
  const need=Math.max(0,cost+work-inv-Math.max(0,s.cash)),loan=Math.min(lmax,Math.ceil(need/500)*500),start=Math.max(0,s.cash)+loan+inv-cost;
  openSheet(`<div class="row"><h2>Основать «${esc(nm)}»</h2>${RX_CLOSE}</div>
    <p style="margin-top:8px">${k==='buy'?`Покупка марки — ${money(cost)}.`:`Мастерская — ${money(cost)}.`}${inv?` Партнёр вкладывает ${money(inv)}.`:''} Ваш капитал — ${money(Math.max(0,s.cash))}${loan?`, кредит банка — ${money(loan)} (${pct(loanRate(s),1)} годовых)`:''}. В кассе новой марки останется ${money(start)}.</p>
    <p class="small muted" style="margin-top:6px">После основания игра продолжится в режиме магната: завод, модели, рынок. Гоночная карьера, титулы и трофеи остаются с вами.</p>
    <button class="btn primary block" style="margin-top:14px" data-act="rxFoundGo" data-k="${k}" data-v="${loan}" data-n="${esc(nm)}">Основать марку</button>`);}
