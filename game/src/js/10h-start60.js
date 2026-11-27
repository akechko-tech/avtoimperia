/* ================= 0.60, этап 5: НАЧАЛО ПО ИСТОРИИ — правила =================
   Мир до года старта идёт по истории: марки-соперники, рынок, парк машин и каталоги деталей — функции года, их не надо «проигрывать».
   Герой входит в этот мир в свой год с тем, что было у его фирмы (01e-start60.js), а не с одинаковой мастерской на три места. */
// обычная новая фирма года y: мест в цеху и касса. Числа — оценка: мастерская 1895 года (три места, касса страны) растёт с эпохой
// (у марки дорогих и спортивных машин цех вдвое меньше)
function eraCap(y,kind){const k=kind==='lux'||kind==='sport'?0.5:1;return Math.max(3,Math.round(clamp(3+0.2*(y-1895),3,24)*k*(globalThis.ERAK||1)));}
function eraCash(c,y){return COUNTRIES[c].cash*tabAt(CPI,y)/tabAt(CPI,1895)*(1+0.04*(y-1895))*(globalThis.ERAK||1);}
// план старта героя: год, месяц и активы. opt.y0 — год по выбору игрока («свой персонаж»)
// связь героя с его маркой в таблицах соперников (01e-start60.js): когда игрок берёт героя, этой марки среди соперников нет
(function(){try{for(const k in HERO_BRAND){const B=HERO_BRAND[k],cp=(COMPS[B[0]]||[]).find(x=>x.n===B[1]);if(cp&&!cp.pk)cp.pk=k;}
  for(const k in HERO_MBRAND){const B=HERO_MBRAND[k],cp=(MCOMPS[B[0]]||[]).find(x=>x.n===B[1]);if(cp&&!cp.pk)cp.pk=k;}}catch(e){console.warn('heroBrand',e);}})();
function heroBrand(pioneer){const B=HERO_BRAND[pioneer];return B?(COMPS[B[0]]||[]).find(x=>x.n===B[1])||null:null;}
// выпуск марки по таблице соперников на момент t (между опорными годами — по прямой)
function brandVolAt(cp,t){const v=cp&&cp.v;if(!v)return 0;const Y=Object.keys(v).map(Number).sort((a,b)=>a-b);if(!Y.length)return 0;if(t<=Y[0])return v[Y[0]];
  for(let i=1;i<Y.length;i++)if(t<=Y[i]){const a=Y[i-1],b=Y[i];return v[a]+(v[b]-v[a])*(t-a)/(b-a);}return v[Y[Y.length-1]];}
// завод героя, который принимает работающую марку: её выпуск за первые двенадцать месяцев после старта, в месяц
function heroVolCap(pioneer,y,m){const cp=heroBrand(pioneer);return cp?Math.round(brandVolAt(cp,y+(m||0)/12+0.5)/12):0;}
// большой завод (от ста машин в месяц) получает всю заводскую технику своего времени, а не три ступени мастерской;
// рабочих на старте — на четверть мощности (дальше штат растёт сам); касса без числа из источника — три месяца выпуска по себестоимости (шесть — когда уже продают в рассрочку)
const BIG_CAP=100,BIG_TECH_LAG=2,START_STAFF_K=0.25,START_CASH_M=3;
// герой принимает работающий завод и марку (vol): её дома уже знают, и слава у неё выше, чем у новичка
const VOL_REP=50;
// (с 1919 года машины продают в рассрочку — деньги покупателей приходят месяцами, и фирме нужно ещё столько же на оборот)
function startCashEst(s,md){return START_CASH_M*((s.tech&&s.tech.credit)?2:1)*capEff(s)*unitCost(md,s);}
function startPlan(pioneer,country,opt){const HS=(!START1895&&HERO_START[pioneer])||null,o=opt||{};
  const y=clamp(Math.round(o.y0!=null?+o.y0:HS?HS.y:1895),1895,END_Y-10),m=o.y0!=null?(o.m0||0):HS?(HS.m||0):0;
  const legacy=y===1895&&m===0&&!(HS&&(HS.cap||HS.cash));   // прежний старт: мастерская 1895 года
  const vc=!legacy&&HS&&HS.vol?heroVolCap(pioneer,y,m):0,cap=legacy?3:(HS&&HS.cap)||Math.max(vc,eraCap(y,HS&&HS.kind));
  return {y,m,HS,legacy,cap,big:cap>=BIG_CAP,cashEst:!legacy&&!!(HS&&HS.vol&&!HS.cash),cash:legacy?COUNTRIES[country].cash:(HS&&HS.cash)||eraCash(country,y),kind:(HS&&HS.kind)||null,rep:(HS&&HS.rep)||(HS&&HS.vol&&!legacy?VOL_REP:30),known:!legacy&&!!(HS&&HS.vol)};}
function startYearOf(pioneer){const HS=!START1895&&HERO_START[pioneer];return HS?HS.y:1895;}
// год начала этой партии — для рекорда «за свои годы» и подписей
function gameStartY(s){if(!s)return 1895;if(s.y0!=null)return Math.floor(s.y0);if(s.airStart!=null)return Math.floor(s.airStart);if(s.motoStart!=null)return Math.floor(s.motoStart);if(s.racer&&s.racer.start)return s.racer.start.y;return 1895;}
// заводская техника, обычная для фирмы этого года: ступени, которым по истории уже четыре года и больше
// Только станки, электричество и контроль: поток, литейку и пресс новая фирма строит сама
const START_TECH_LAG=5,START_TECH=['tools','elec','qc'];
function startTech(s,y,big){const T={},KS=big?Object.keys(TECH):START_TECH,lag=big?BIG_TECH_LAG:START_TECH_LAG;let ch=true;
  while(ch){ch=false;for(const k of KS){if(!TECH[k])continue;const lv=TECH[k].lv||[],cur=T[k]||0,nx=lv[cur];if(!nx||nx.y>y-lag)continue;
      if(nx.need&&Object.keys(nx.need).some(n=>(T[n]||0)<nx.need[n]))continue;T[k]=cur+1;ch=true;}}
  if(Object.keys(T).length)s.tech=Object.assign(s.tech||{},T);return T;}
// первая машина: легенда марки, ближайшая к году старта, иначе — машина по образцу своего времени (эталон класса двухлетней давности)
function startLegendPick(s,kind){const L=legendsOf(s).filter(x=>x.y<=s.y+1&&(x.kind==='people'||x.kind==='middle'||x.kind===kind)&&!legendMissing(s,x).length);return L.length?L[L.length-1]:null;}
// пока народного класса в стране почти нет (до начала 1900-х), первая машина идёт в средний — как у мастерской 1895 года
function startTrim(s,t){if(t!=='t0')return t;let n=0;try{n=segAnnual(s.country,'people',s);}catch(_){}return n<300?'t1':t;}
// машина «по образцу своего времени»: лучшая по прибыли из деталей, которые уже продаются, — та же кнопка «Самая прибыльная», что в конструкторе.
// Класс — свой у героя (люкс, спорт, грузовик); если в этом классе в стране покупателей нет — средний или народный, какой выгоднее.
const START_KINDS=['middle','people'],START_OWN_K=1.5;
function startDesign(s,kind){const L=[];if(kind&&kind!=='van')L.push(kind);START_KINDS.forEach(k=>{if(!L.includes(k))L.push(k);});
  let best=null,bv=-Infinity,bk=null;
  for(const k of L){let d=null,v=-Infinity;try{d=autoDesign(k,s,null,{cap:true});v=designValue(d,s,designRoom(s,k));}catch(_){d=null;}
    if(!d||!d.e||!isFinite(v))continue;if(k===kind&&v>0)v*=START_OWN_K;if(v>bv){bv=v;best=d;bk=k;}}
  return best?{d:best,kind:bk,v:bv}:null;}
function startModel(s,ST,firstName){const m=s.models[0];m.launched=mi(s);
  const L=startLegendPick(s,ST.kind);
  if(L&&!(s.legends&&s.legends[L.id])){Object.assign(m,{name:(firstName||'').trim()||L.name,e:L.d.e,g:L.d.g,c:L.d.c,k:L.d.k,b:L.d.b,t:startTrim(s,L.d.t||KIND_TRIM[L.kind]||m.t),w:L.d.w,legend:L.id,paint:legendPaint(L,s.y)||m.paint});
    s.legends=s.legends||{};s.legends[L.id]={y:s.y,m:s.m,start:1};return L;}
  const R=startDesign(s,ST.kind);
  if(R){const d=R.d;Object.assign(m,{e:d.e,g:d.g,c:d.c,k:d.k,b:d.b,t:d.t||KIND_TRIM[R.kind]||'t1',w:d.w});if(!(firstName||'').trim()&&START_NAME[R.kind])m.name=START_NAME[R.kind];}
  return null;}
// цена первой машины: не ниже выгодной по расчёту помощника — у маленькой фирмы себестоимость выше, чем у завода, и «цена класса» может оказаться ниже неё
function startPrice(s,md,big){let p=refPrice(md,s),bp=0;try{const B=bestPriceFor(md,s);bp=(B&&B.price)||0;}catch(_){}
  // большой завод: себестоимость «на нуле выпуска» завышена, цену берём выгодную по расчёту помощника — он считает её при том выпуске, который эта цена даст
  if(big&&bp>0)return Math.round(bp/10)*10;
  if(bp>p)p=bp;let uc=0;try{uc=unitCost(md,s);}catch(_){}return Math.round(Math.max(p,uc*1.15/(1-DEALER_MARGIN))/10)*10;}
// 0.60, этап 5 (решение автора 25 ноября): деньги пайщиков — не подарок. Взнос даёт пайщикам долю в деле:
// взнос, делённый на стоимость фирмы вместе с этими деньгами. С этой доли им идут дивиденды (105d-rebuy.js, divPayout), пока игрок не выкупит её
// («Совладельцы», 105d-rebuy.js). Основателю остаётся не меньше четверти — как при любых совладельцах в игре.
const PART_MAX=0.75;
function stakeAdd(s,name,sum){const V=Math.max(1,companyValue(s)),P=s.partners=s.partners||[],k=clamp(sum/V,0.01,PART_MAX);
  P.forEach(p=>{p.sh=p.sh*(1-k);});
  const same=P.find(p=>p.hero&&p.n===name);if(same){same.sh+=k;same.in=(same.in||0)+sum;}else P.push({n:name,sh:k,t:mi(s),hero:1,in:sum});
  const tot=P.reduce((a,p)=>a+p.sh,0),f=tot>PART_MAX?PART_MAX/tot:1;P.forEach(p=>{p.sh=+(p.sh*f).toFixed(4);});
  s.partners=P.filter(p=>p.sh>=0.001);return partnersShare(s);}
function heroStake(s){return (s.partners||[]).filter(p=>p.hero).reduce((a,p)=>a+(p.sh||0),0);}
// деньги пайщиков по истории (01e-start60.js, funds): в месяц, когда инвесторы по истории внесли деньги, они предлагают их игроку.
// Это не помощь «когда плохо»: дата и сумма заданы источником и не зависят от хода дел. Взять или отказаться — решает игрок.
function fundSum(f){return Math.round(f.sum*DIF().cash/100)*100;}
function fundShare(s,sum){const V=Math.max(1,companyValue(s)),k=clamp(sum/(V+sum),0.01,PART_MAX),was=partnersShare(s);return {V,k,was,tot:Math.min(PART_MAX,was*(1-k)+k)};}
function fundOffer(s,i){const HS=HERO_START[s.pioneer],f=HS&&HS.funds&&HS.funds[i];if(!f)return;s.funds=s.funds||{};if(s.funds[i])return;s.funds[i]=1;
  const sum=fundSum(f),half=Math.round(sum/200)*100,A=fundShare(s,sum),B=fundShare(s,half);
  pushEvent({own:1,kicker:'Пайщики',title:f.title||'Новые деньги',deck:`${money(sum)} в кассу — и у совладельцев ${Math.round(A.tot*100)}% дела`,
    text:f.t+`\nДеньги пайщиков — не подарок. Фирма сейчас стоит ${money(Math.round(A.V))}; пайщики получают долю, равную их взносу в стоимости фирмы. С неё им каждый месяц идут дивиденды — ${Math.round(divPayout(s)*100)}% их части прибыли; остальное остаётся в деле.\n• Все ${money(sum)} — у совладельцев будет ${Math.round(A.tot*100)}% дела.\n• Половина, ${money(half)}, — ${Math.round(B.tot*100)}%.${A.was>0.005?`\nСейчас у совладельцев ${Math.round(A.was*100)}%.`:''}\nДолю потом можно выкупить — целиком или по десятой части дела, по стоимости фирмы с премией 25%: «Финансы» → «Совладельцы». Чем лучше идут дела, тем выкуп дороже.\nОткажетесь — денег не будет, а фирма останется вашей.`+(f.est?'\n(Сумма — по источнику; месяц — оценка.)':''),
    choices:[[`Взять ${money(sum)}`,'fund:Y:'+i],[`Взять половину`,'fund:H:'+i],['Отказаться','fund:N:'+i]]},true);}
function fundResolve(s,key){const a=key.split(':'),i=+a[2],HS=HERO_START[s.pioneer],f=HS&&HS.funds&&HS.funds[i];if(!f)return;s.funds=s.funds||{};const full=fundSum(f),sum=a[1]==='H'?Math.round(full/200)*100:full,who=f.who||'Пайщики';
  if(a[1]==='Y'||a[1]==='H'){s.cash+=sum;const k=stakeAdd(s,who,sum);s.funds[i]=2;addLog(`${who} внесли ${money(sum)}. Совладельцам принадлежит ${Math.round(k*100)}% дела; дивидендами им идёт около ${divPct(s,k)}% прибыли — пока вы не выкупите долю.`,'hist');}
  else{s.funds[i]=3;addLog(`От денег пайщиков (${money(full)}) вы отказались: фирма остаётся вашей.`,'hist');}}
function startFundsMonth(s){if(!s||s.y0==null||s.over)return;const HS=HERO_START[s.pioneer];if(!HS||!HS.funds)return;
  HS.funds.forEach((f,i)=>{if(f.day0||(s.funds&&s.funds[i])||s.y!==f.y||s.m!==f.m)return;fundOffer(s,i);});}
function startFundsLeft(s){const HS=s&&s.y0!=null&&HERO_START[s.pioneer];if(!HS||!HS.funds)return [];return HS.funds.filter((f,i)=>!(s.funds&&s.funds[i])&&(f.day0||f.y>s.y||(f.y===s.y&&f.m>s.m)));}
// дилеров на старте — треть от нужного стране, как у мастерской 1895 года, но не больше, чем фирма может содержать:
// на годовое содержание сети — двадцатая часть кассы; и не меньше, чем нужно, чтобы продать выпуск цеха.
// (У фирмы на четыре места не бывает шестидесяти агентов — если только за ней не стоит капитал: каретная сеть Дюранта продавала Buick с первого дня.)
const START_DEAL_K=0.05;
function startDealers(s,c){const top=Math.max(1,Math.round(dealerNeed(c,s)/3)),year=Math.max(1,dealerUpkeep(s,c)*12),afford=Math.floor(Math.max(0,s.cash)*START_DEAL_K/year);
  return clamp(Math.max(Math.round(s.cap*1.5),afford),1,top);}
const START_NAME={van:'Развозной фургон',truck:'Грузовик № 1'};
// сводка первого дня для героя, который входит в игру не в 1895 году: что уже есть в мире
function startBrief(s){const c=s.country,y=s.y,L=(COMPS[c]||[]).map(cp=>({n:compName(cp,s),v:compVol(cp,s),pk:pkIs(cp,s)})).filter(o=>o.v>0&&!o.pk).sort((a,b)=>b.v-a.v).slice(0,3);
  const mk=Math.round(mktAt?mktAt(MKT[c],yf(s)):0),big=L.length?L.map(o=>`${o.n} (${fmtN(Math.round(o.v))})`).join(', '):'',fl=Math.round((s.fleet&&s.fleet[c])||0);
  return `${COUNTRIES[c].name}, ${y} год: в стране продают около ${fmtN(mk)} автомобилей в год, на дорогах их ${fmtN(fl)}.${big?` Больше всех выпускают ${big}.`:''}`;}
function startLead(ST){if(ST.HS&&ST.HS.lead)addLog(ST.HS.lead,'hist');}
function startIntroLog(s,ST,P,md,SL){const c=s.country;startLead(ST);
  if(ST.y>1895||ST.m>0)addLog(startBrief(s),'hist');
  addLog(`${P.name==='Свой персонаж'?'Вы основали':P.name+' — во главе'} «${s.company}», ${cityOf(s)}. В цехах ${s.workers} рабочих, мест — ${s.cap}, первая машина — «${md.name}»${SL?' (легенда марки)':''}, дилеров — ${s.dealers[c]}, в кассе ${money(s.cash)}.`,'hist');}
// газеты первого дня для героя, который начинает не мастерской 1895 года
const START_ERA_T=[[1900,'Экипажи без лошадей','Моторная повозка из диковинки становится делом'],[1908,'Автомобиль входит в моду','Заводов — сотни, покупателей — тысячи'],[1914,'Автомобиль для многих','Дешёвая машина и поток меняют отрасль'],
  [1919,'Моторы на войне','Армиям нужны грузовики, тягачи и авиамоторы'],[1930,'Автомобиль стал обычным делом','Рассрочка, закрытый кузов и ежегодная смена моделей'],[1946,'Годы кризиса и войны','Рынок сжался, заводы работают на оборону'],[9999,'Мир снова садится за руль','После войны машину ждут годами']];
function introPapers60(s){const P=PIONEERS[s.pioneer],md=s.models[0],p=parts(md),me=P.name==='Свой персонаж',HS=!START1895&&HERO_START[s.pioneer],E=START_ERA_T.find(x=>s.y<x[0]),kids=DIF().simple;
  pushEvent({kicker:`${MONTHS_N[s.m][0].toUpperCase()+MONTHS_N[s.m].slice(1)} ${s.y}`,title:E[1],deck:E[2],choices:[['Читать дальше','ok']],
    text:`${startBrief(s)}\nМир до этого дня шёл по истории: марки, цены, техника — такие, какими были в ${s.y} году. С этого дня в нём есть вы.`},true);
  pushEvent({own:1,kicker:cityOf(s),title:`«${s.company}»: первый день`,deck:`${me?'Новый фабрикант':P.name} берётся за дело`,
    text:`${HS&&HS.lead?HS.lead+'\n':''}В цехах ${s.workers} рабочих и ${s.cap} ${plural(Math.round(s.cap),'место','места','мест')}, в кассе ${money(s.cash)}. Первая машина — «${md.name}»: ${p.e.name}, ${p.b.name.toLowerCase()}. Её продают ${s.dealers[s.country]} ${plural(s.dealers[s.country],'дилер','дилера','дилеров')}.${HS&&HS.funds?`\nПо истории пайщики предложат деньги — за долю в деле: ${HS.funds.map(f=>`${f.day0?'сегодня':MONTHS_N[f.m]+' '+f.y} — ${money(fundSum(f))}`).join('; ')}.`:''}\nЦель — к ${END_Y} году стать величайшей автоимперией эпохи. Рекорд для победы считается за ваши годы: с ${s.y}-го по ${END_Y}-й.\n`+
      (kids?'Помощник сам ставит цены, открывает дилеров и строит цеха. Ваше дело — придумывать машины, улучшать детали в КБ и выигрывать гонки.'
        :'С чего начать: следите за советником на вкладке «Завод» — у каждого совета есть кнопка. Один ход — один месяц.')},true);
  if(HS&&HS.funds)HS.funds.forEach((f,k)=>{if(f.day0)fundOffer(s,k);});}
