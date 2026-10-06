/* ================= TURN ================= */
const DEALER_MARGIN=0.16;
function step(){
  const s=G;if(!s||s.over||s.pending.length)return false;
  helperMonth(s);
  const eHome=econ(s.y,s.m,s.country);
  const r={rev:0,mat:0,wage:0,ovh:0,dlr:0,ad:s.ad,sto:0,int:0,mil:0,milN:0,made:0,sold:0,demand:0,homeSold:0,tool:0,war:0,hire:0,fin:0,lostCap:0,lostDlr:0,team:0,ord:0,ordN:0,dump:0,dumpN:0,fine:0,mk:{}};
  // разработка и запуск моделей
  s.models.forEach(md=>{if(md.status==='dev'){md.devLeft--;if(md.devLeft<=0){md.status='prod';md.launched=mi(s);md.fresh=1;md.ramp=techLv(s,'line')===2?2:1;md.plan=md.plan||'auto';
    // 0.21: новая модель идёт на тот же завод — поставщики и рабочие уже есть: себестоимость считаем от половины выпуска прежних моделей
    {const prev=s.models.filter(m=>m!==md&&m.status==='prod'&&(m.vol||0)>0),g=segOf(md),same=prev.filter(m=>segOf(m)===g),src=same.length?same:prev;
      const v=src.reduce((a,m)=>Math.max(a,m.vol||0),0)*(same.length?0.6:0.35);if(v>(md.vol||0))md.vol=Math.round(v*10)/10;}
    const tc=toolingCost(md,s);s.cash-=tc;r.tool+=tc;addLog(`Модель «${md.name}» пошла в серию. Оснастка обошлась в ${money(tc)}.`,'good');checkFirstParts(md);if(md.legend)try{legendLaunch(s,md);}catch(e){console.warn(e);}else launchPaper(s,md);}}});
  s.capBuild=(s.capBuild||[]).filter(b=>{b.left--;if(b.left<=0){s.cap+=b.units;addLog(`Новый цех введён в строй: мощность ${fmtN(Math.round(capEff(s)))} машин в месяц.`,'good');return false;}return true;});
  s.whBuild=(s.whBuild||[]).filter(b=>{b.left--;if(b.left<=0){s.wh=(s.wh||0)+b.units;addLog(`Новый склад готов: ${fmtN(s.wh)} мест для машин.`,'good');return false;}return true;});
  if(s.techBuild){s.techBuild.left--;if(s.techBuild.left<=0){const k=s.techBuild.k;s.tech[k]=(s.tech[k]||0)+1;const lv=TECH[k].lv[s.tech[k]-1];addLog(`Внедрено: ${lv.name}.`,'good');
    if(k==='line'&&s.tech[k]===2)s.models.forEach(m=>{if(m.status==='prod')m.ramp=Math.max(m.ramp||0,3);});
    const n0=s.pending.length,rid='tech:'+k+':'+s.tech[k];checkFirstTech(k,s.tech[k]);s.techBuild=null;
    if(REELS[rid]&&s.pending.length===n0)reelOffer(s,rid,'Внедрено: '+lv.name,techEffects(lv),TECH[k].desc);}}
  s.supplyNow=s.supplyNext||1;s.supplyNext=1;s.strikeNow=!!s.strikeNext;s.strikeNext=false;
  // распродажа: снятая модель продаётся со склада по сниженной цене, пока остаток не кончится
  s.models.forEach(m=>{if(m.status==='sale'&&m.stock<=0){m.status='off';m.backlog=0;addLog(`Распродажа «${m.name}» закончена.`);}});
  const act=s.models.filter(m=>m.status==='prod'||m.status==='sale');
  // спрос
  const D=demandAll(s),creditK=techLv(s,'credit')?1.15:1;
  const dem=act.map(md=>{const o={};for(const c in D.by[md.id])o[c]=D.by[md.id][c]*creditK;return o;});
  const tot=dem.map(o=>Object.values(o).reduce((a,b)=>a+b,0));
  // прогноз продаж: спрос за вычетом тех, кого дилеры в прошлом месяце не успели обслужить
  act.forEach((md,i)=>{const t=tot[i]*(md.dlrK??1);md.fc=md.fc>0?md.fc*0.55+t*0.45:t;});
  // производство
  const cap=capEff(s);let milCap=0;if(eHome.war&&s.military&&act.length)milCap=Math.floor(cap*0.4);
  const capCiv=Math.max(0,cap-milCap);
  // заказы ведомств и фирм: их машины делаются сверх плана
  const ordNeed={};(s.orders||[]).forEach(o=>{ordNeed[o.md]=(ordNeed[o.md]||0)+Math.ceil(o.left/Math.max(1,o.due-mi(s)));});
  const want=act.map(md=>md.status==='sale'?0:(md.plan==='auto'?Math.max(0,Math.round((md.fc*1.04+(md.backlog||0)-(md.stock-0.35*md.fc))*worldPlanK(s))):Math.max(0,Math.round(+md.plan||0)))+(ordNeed[md.id]||0));
  // «авто» не делает больше, чем поместится на складе
  {const stock0=act.reduce((a,m)=>a+m.stock,0),exp=act.reduce((a,m,i)=>a+want[i]-(m.fc||0)-(ordNeed[m.id]||0),0),over=stock0+exp-whCap(s);
    if(over>0){const autoW=act.reduce((a,m,i)=>a+(m.plan==='auto'?Math.max(0,want[i]-(ordNeed[m.id]||0)):0),0);if(autoW>0){const kk=Math.max(0,1-over/autoW);r.whCut=kk<0.97;act.forEach((m,i)=>{if(m.plan==='auto'){const o=ordNeed[m.id]||0;want[i]=o+Math.round((want[i]-o)*kk);}});}}}
  const cx=act.map(complexity),hrs=act.map(md=>hoursPerCar(md,s)),hpw=hoursPerWorker(s);
  const needCap=want.reduce((a,w,i)=>a+w*cx[i],0)+milCap,needH=want.reduce((a,w,i)=>a+w*hrs[i],0)+milCap*(hrs.length?hrs.reduce((a,b)=>a+b,0)/hrs.length:800);
  const kCap=needCap>0?Math.min(1,cap/needCap):1;
  if(s.staffAuto){const target=Math.ceil(needH*kCap/hpw*1.02);let d=target-s.workers;if(d>0)d=Math.min(d,Math.max(20,Math.round(s.workers*0.5)));else if(d<0)d=Math.max(d,-Math.round(s.workers*0.3));
    if(d>0){r.hire=d*8*cpi(s);s.cash-=r.hire;}s.workers=Math.max(3,s.workers+d);}
  const kLab=needH>0?Math.min(1,s.workers*hpw/needH):1,k=Math.min(kCap,kLab);r.bneck={cap:kCap,lab:kLab,wh:!!r.whCut,load:cap>0?needCap/cap:0};
  act.forEach((md,i)=>{const made=Math.floor(want[i]*k+(Math.random()<(want[i]*k)%1?1:0));md.lastMade=made;md.made=(md.made||0)+made;md.vol=md.vol?md.vol*0.7+made*0.3:made;md.stock+=made;r.made+=made;r.mat+=made*matCost(md,s);if(md.ramp>0)md.ramp--;});
  // 0.24: из военного заказа машины — столько, сколько нужно армии; остальное — военная продукция (моторы, снаряды, каски): деньги те же, но это не проданные машины
  if(milCap>0){const mc=act.reduce((a,m)=>a+matCost(m,s),0)/act.length,mu=Math.floor(milCap*k);r.mat+=mu*mc;r.mil=mu*mc*1.35;r.milN=Math.min(mu,milNeed(s));r.milX=mu-r.milN;r.made+=mu;}
  // поставки по заказам — в первую очередь
  s.orders=(s.orders||[]).filter(o=>{const md=act.find(m=>m.id===o.md);const need=Math.ceil(o.left/Math.max(1,o.due-mi(s)));
    if(md){const n=Math.min(o.left,md.stock,need*2);if(n>0){md.stock-=n;o.left-=n;r.ord+=n*o.price;r.ordN+=n;md.totalSold+=n;md.ordSold=(md.ordSold||0)+n;}}
    const shw=String(o.id).startsWith('show-');
    if(o.left<=0){if(!shw){s.ordersDone=(s.ordersDone||0)+1;s.rep=clamp(s.rep+2,0,100);}addLog(`Заказ выполнен: ${o.who} получил все ${fmtN(o.n)} машин.`,'good');pendingToasts.push('📜 Заказ выполнен: '+o.who);return false;}
    if(mi(s)>=o.due){const fine=Math.round(o.left*o.price*(shw?0.08:0.15));r.fine+=fine;s.rep=clamp(s.rep-(shw?2:4),0,100);addLog(`Сорван заказ: ${o.who} не получил ${fmtN(o.left)} машин. Неустойка ${money(fine)}.`,'bad');return false;}
    return true;});
  // продажи: дилеры, склад, очередь
  const ship=shipCost(s),tp=dealerTP(s),dealerCap={},want_c={};
  act.forEach((md,i)=>{for(const c in dem[i])want_c[c]=(want_c[c]||0)+dem[i][c];});
  for(const c in want_c)dealerCap[c]=dealerCapOf(s,c);
  const lostC={};
  act.forEach((md,i)=>{
    const d=dem[i],sumD=tot[i],bl=md.backlog||0;let req={};let reqT=0;
    let lostD=0;for(const c in d){let q=d[c]+(sumD>0?bl*d[c]/sumD:0);const fc=want_c[c]>dealerCap[c]?dealerCap[c]/want_c[c]:1;r.lostDlr+=q*(1-fc);lostD+=q*(1-fc);lostC[c]=(lostC[c]||0)+q*(1-fc);q*=fc;
      // 0.21: квота на ввоз — сверх неё не продать, очередь дилеров сгорает
      const qt=tradeQuota(s,c);if(qt>0){s.quotaY=s.quotaY||{};const left=Math.max(0,qt/12*(s.m+1)-(s.quotaY[c]||0));if(q>left){r.lostQuota=(r.lostQuota||0)+q-left;q=left;}}
      req[c]=q;reqT+=q;}
    // лицензия: машины делает местный завод — со склада не берём, вам — доля цены
    md.soldBy={};for(const c in req){if(!licOn(s,c))continue;const so=Math.floor(req[c]+(Math.random()<req[c]%1?1:0));reqT-=req[c];delete req[c];if(!so)continue;md.soldBy[c]=so;const mk=r.mk[c]=r.mk[c]||{sold:0,rev:0};mk.sold+=so;const v=so*priceIn(md,c,s)*LIC_ROY;mk.rev+=v;r.lic=(r.lic||0)+v;r.licN=(r.licN||0)+so;md.totalSold+=so;}
    const avail=md.stock,f=reqT>avail?avail/Math.max(1e-9,reqT):1;let sold=0;
    for(const c in req){const so=Math.floor(req[c]*f+(Math.random()<(req[c]*f)%1?1:0));if(!so)continue;md.soldBy[c]=so;{const pd=promoDisc(s,c,segOf(md));if(pd)r.promo=(r.promo||0)+so*priceIn(md,c,s)*pd*fxOf(s,c);}if(tradeQuota(s,c)>0){s.quotaY=s.quotaY||{};s.quotaY[c]=(s.quotaY[c]||0)+so;}const mk=r.mk[c]=r.mk[c]||{sold:0,rev:0};mk.sold+=so;const net=netPer(md,c,s);mk.rev+=so*net;r.rev+=so*net;sold+=so;if(c===s.country)r.homeSold+=so;}
    sold=Math.min(sold,md.stock);md.stock-=sold;const unmet=Math.max(0,reqT-sold);md.backlog=Math.min(unmet*0.5,md.fc*0.8);r.lostCap+=unmet-md.backlog;
    // почему купили меньше, чем хотели: не хватило машин (часть ждёт в очереди) или дилеры не успели
    // 0.26: грузовик — кто его взял: развозка по району, по городу, между городами (для подсказки на вкладке «Модели»)
    if(isTruck(md)){const U={};for(const c in D.mk){const b=D.mk[c].byU&&D.mk[c].byU[md.id];if(b)for(const u in b)U[u]=(U[u]||0)+b[u]*creditK;}md.useD=U;}
    md.lastDem=Math.round(sumD);md.lastWant=sumD+bl;md.lostS=unmet;md.lostD=lostD;md.dlrK=sumD+bl>0.5?clamp(1-lostD/(sumD+bl),0.05,1):1;md.queued=md.backlog;md.lastSold=sold;md.totalSold+=sold;r.sold+=sold;r.demand+=sumD;
    r.war+=sold*defectRate(s)*md.price*0.25;});
  // 0.25: кредит покупателям — комиссия банкам или своя кредитная компания (13c-finance.js)
  finMonth(s,r);
  // склад переполнен: лишнее забирают перекупщики за полцены
  {const tot=s.models.reduce((a,m)=>a+m.stock,0),cap2=whCap(s);if(tot>cap2){let over=tot-cap2;
    s.models.slice().sort((a,b)=>b.stock-a.stock).forEach(m=>{if(over<=0||!m.stock)return;const n=Math.min(m.stock,over);over-=n;m.stock-=n;const v=n*m.price*0.5;r.dump+=v;r.dumpN+=n;});
    if(mi(s)-(s.dumpSaid||-99)>=3){s.dumpSaid=mi(s);addLog(`Склад переполнен: ${fmtN(r.dumpN)} машин отдали перекупщикам за полцены. Расширьте склад на вкладке «Завод» или выпускайте меньше.`,'bad');pendingToasts.push('📦 Склад переполнен');}}}
  // расходы (0.25: спецакции оплачены при старте — в отчёт; доход от вложений — invMonth)
  try{legalMonth(s,r);}catch(e){console.warn(e);}   // 0.22: патенты и суды
  r.rdp=s.rdPaid||0;s.rdPaid=0;r.prm=s.promoPaid||0;s.promoPaid=0;invMonth(s,r);r.rd=rdUpkeep(s)+r.rdp;r.drv=driverPayroll(s);r.team=teamUpkeep(s);   // 0.22: проекты КБ оплачены при старте — здесь только в отчёт
  // конструкторское бюро: каждый проект продвигается каждый месяц
  // 0.21: чертежи соперника, выигранные в пари, — следующий проект КБ короче на 30%
  if(s.rd.bpStock>0){const pj=(s.rd.projs||[]).find(p=>!p.bp);if(pj){pj.bp=1;pj.need=Math.max((pj.prog||0)+1,Math.round(pj.need*0.7));s.rd.bpStock--;addLog(`КБ работает по чертежам соперника: «${pj.name}» — на 30% быстрее.`,'good');}}
  {const share=(s.rd.projs||[]).map(pj=>rdPtsOf(s,pj));s.rd.projs=(s.rd.projs||[]).filter((pj,i)=>{pj.prog=(pj.prog||0)+share[i];if(pj.prog<pj.need)return true;
    if(pj.kind==='upg'){s.rd.upg[pj.id]=(s.rd.upg[pj.id]||0)+1;if(s.rd.know)delete s.rd.know[pj.id];addLog(`КБ завершило улучшение: ${pj.name} (уровень ${s.rd.upg[pj.id]}).`,'good');pendingToasts.push('🔧 '+pj.name+' ★'+s.rd.upg[pj.id]);}
    else if(pj.kind==='study')studyDone(s,pj);
    else{s.rd.early.push(pj.id);addLog(`КБ построило прототип: ${pj.name} — на ${pj.yrs} г. раньше рынка!`,'good');pendingToasts.push('🔬 Прототип: '+pj.name);
      if(PART_HIST[pj.id]||REELS['part:'+pj.id]){const h=PART_HIST[pj.id];reelOffer(s,'part:'+pj.id,'Прототип готов: '+pj.name,`На ${pj.yrs} ${plural(pj.yrs,'год','года','лет')} раньше рынка`,h?`В истории такую деталь первыми сделали ${h[1]} в ${h[0]} году. Поставьте её на новую модель — и «${s.company}» опередит историю.`:`Поставщики предложат такую деталь только через ${pj.yrs} ${plural(pj.yrs,'год','года','лет')}. Поставьте её на новую модель — покупатели заметят разницу первыми.`);}}
    return false;});}
  r.wage=s.workers*wageNow(s);r.ovh=plantOverhead(s)*(s.shifts>1?1.1:1);
  // 0.23: за блокадой дилеры и отделение отрезаны — содержать их нечем и незачем (их расходы — на них самих)
  r.dlr=Object.keys(s.dealers).reduce((a,c)=>a+(warCut(s,c)?0:dealerCount(s,c)*dealerUpkeep(s,c)),0)+Object.keys(COUNTRIES).reduce((a,c)=>a+(warCut(s,c)?0:impUpkeep(s,c)),0);
  r.sto=s.models.reduce((a,md)=>a+md.stock*matCost(md,s),0)*0.01;r.rate=loanRate(s);r.int=s.loan*r.rate/12;turnover(s,r);
  // 0.21: контора — управление, сбыт, бухгалтерия, юристы: около 3% выручки
  r.adm=0.03*(r.rev+r.ord);
  r.lic=r.lic||0;r.profit=r.rev+r.lic+(r.licIn||0)+r.mil+r.ord+r.dump-r.adm-r.mat-r.wage-r.ovh-r.dlr-r.ad-r.sto-r.int-r.rd-r.drv-r.team-r.war-r.fin-r.tool-r.hire-r.fine-(r.legal||0)-(r.turn||0)+(r.invInc||0)+(r.finInc||0)-(r.finBad||0)-(r.promo||0)-(r.prm||0);
  r.trate=taxRate(s.y);r.tax=r.profit>0?r.profit*r.trate:0;r.wtax=warTax(s,r);r.tax+=r.wtax;r.profit-=r.tax;
  // 0.21: деньги от дилеров и ведомств приходят через 1–2 месяца, детали и зарплата — сразу
  r.got=arCollect(s,r.rev+r.ord);
  s.cash+=r.profit+r.tool+r.hire+r.rdp+r.prm-(r.rev+r.ord)+r.got+r.finIn-r.finOut;   // оснастка, найм, проекты КБ и спецакции уже списаны выше; рассрочка своей компании — деньги выданы и вернулись
  invCover(s);
  loanRecall(s,r);
  s.plantVal*=0.995;
  // репутация: качество проданного, брак, очереди, недовольные дилеры
  if(r.sold>0){let wr=0;act.forEach(md=>{wr+=Math.min(1.4,classScore(md,s))*md.lastSold;});wr/=r.sold;
    const target=clamp(22+50*clamp((wr-0.6)/0.7,0,1)+10*clamp(Math.log10(1+r.sold)/4.5,0,1)-(defectRate(s)-0.03)*160-(r.lostCap>r.sold*0.5?6:0)+(s.wagePol==='five'?4:0),5,95);
    s.rep+=(target-s.rep)*0.035+(act.some(m=>overpower(m)&&m.lastSold>0)?-1.5:0);}else s.rep-=0.2;
  s.rep=clamp(s.rep,0,100);
  // конкуренты и рынки для экрана «Рынок»: сколько купили у реальных марок и у вас
  for(const c in COUNTRIES){const L=s.comps[c]||[];L.forEach(x=>{x.last=0;x.lg={};});const MC=D.mk[c],sg={};let size=0;
    // 0.24: lg — продажи марки по классам за месяц (для вызовов по продажам на любом рынке); chalTally — счёт пари
    SEGK.forEach(g=>{const z=MC.segs[g];sg[g]={size:z.inc,you:0,price:z.price};size+=z.inc;compSplit(c,g,s,z.inc).forEach(o=>{const x=L[o.i];if(!x)return;x.last+=o.sales;x.lg[g]=(x.lg[g]||0)+o.sales;if(c===s.country){const Y=x.ys=x.ys||{};Y[g]=(Y[g]||0)+o.sales;}chalTally(s,c,g,o);});});
    const mk=r.mk[c]=r.mk[c]||{sold:0,rev:0};mk.size=size;mk.segs=sg;mk.shop=MC.shop;mk.tpool=MC.segs.truck.pool||0;mk.tuse=MC.segs.truck.uses||null;mk.lostDlr=lostC[c]||0;}
  act.forEach(md=>{const g=segOf(md);for(const c in (md.soldBy||{})){const so=md.soldBy[c],m=r.mk[c];if(m&&m.segs[g]){m.segs[g].you+=so;m.segs[g].size+=so;m.size+=so;}}});
  chalTallyYou(s,r);
  // продажи по классам дома за год — для «королей года» и пари по продажам
  {const hm=r.mk[s.country];if(hm&&hm.segs){const Y=s.segY=s.segY||{},YT=s.segYT=s.segYT||{};SEGK.forEach(g=>{Y[g]=(Y[g]||0)+(hm.segs[g].you||0);YT[g]=(YT[g]||0)+(hm.segs[g].size||0);});}}
  // продажи марок за год — для таблицы конкурентов
  for(const c in s.comps)s.comps[c].forEach(o=>{o.yr=(o.yr||0)+(o.last||0);});s.homeY=(s.homeY||0)+r.homeSold;
  rivalsReact(s,r);dealersMonth(s,r);
  // машины на дорогах: новые прибавились, старые ушли на свалку
  if(!s.fleet)s.fleet={};if(!s.mkY)s.mkY={};const life=tabAt(CAR_LIFE,yf(s));
  for(const c in COUNTRIES){const m=r.mk[c],cars=m.size-m.segs.truck.size,f0=fleetOf(s,c);s.fleet[c]=Math.max(0,f0+cars-f0/(12*life));s.mkY[c]=m.size*12/SEASON[s.m];}
  pfleetMonth(s,life);pflMonth(s,r);
  tradeMonth(s);
  // ценовая война прежних версий понемногу уходит — теперь конкуренты отвечают снижением цен и новыми моделями (13b-economy.js)
  for(const c in (s.pw||{}))for(const g in s.pw[c])s.pw[c][g]=Math.min(1,(s.pw[c][g]||1)+0.006);
  econMonth(s,r);
  // итоги месяца
  const hs=r.mk[s.country].size;r.size=hs;r.share=hs>0?r.homeSold/hs:0;r.label=dstr(s);s.last=r;
  const H=s.hist;H.cash.push(Math.round(s.cash));H.sales.push(r.sold);H.market.push(Math.round(hs));H.profit.push(Math.round(r.profit));H.share.push(+(r.share*100).toFixed(2));
  for(const k2 in H)if(H[k2].length>420)H[k2].shift();
  // 0.24: армии и ведомствам машины тоже проданы — в итог года и в «Продано» (в долю рынка — только покупатели)
  s.yearSold=(s.yearSold||0)+r.sold+(r.milN||0)+(r.ordN||0);s.milTotal=(s.milTotal||0)+(r.milN||0);
  for(const c in r.mk){const m=r.mk[c];if(m.size>0&&m.sold>0){const sh=m.sold/m.size;if(sh>(s.peak.share[c]||0))s.peak.share[c]=sh;}}
  if(s.strikeNow)addLog('Забастовка: выпуск упал вдвое.','bad');
  if(Math.random()<WAGE_POL[s.wagePol||'market'].strike*(s.workers>200?1.4:1)&&!s.pending.length&&s.workers>30)strikeThreat();
  s.m++;
  if(s.m>11){endOfYear(s);}
  RACES.forEach(rc=>{if(rc.y===s.y&&rc.m-1===s.m&&raceEligible(rc,s)&&!raceWarBlocked(rc,s))addLog(`Открыта запись на гонку «${rc.name}» (${MONTHS_G[rc.m]}). Приз ${money(racePrize(rc))}.`,'hist');});
  seasonTick(s);
  checkAch();checkMilestones(s);
  // 0.21: перерасход покрывает банк — в пределах кредитного лимита (в кризис лимит урезан, а в панику кредит закрыт)
  autoCredit(s);try{dealerFit(s);}catch(_){}
  if(s.cash<0&&s.cash>=-debtLimit(s))addLog(`Касса в минусе на ${money(-s.cash)}: ${loanOpen(s)?'кредитный лимит банка исчерпан':creditState(s).t.toLowerCase()} — это долг поставщикам и рабочим (до банкротства ${money(debtLimit(s)+s.cash)}). Сократите расходы и выпуск.`,'bad');
  // склад растёт — подсказка раз в полгода
  act.forEach(md=>{if(stockWarn(md)&&mi(s)-(md.stockSaid||-99)>=6){md.stockSaid=mi(s);addLog(`На складе «${md.name}» — ${fmtN(md.stock)} машин без покупателей. Снизьте выпуск или цену.`,'bad');pendingToasts.push('📦 Склад растёт: «'+md.name+'»');}});
  // до банкротства рукой подать — предупреждаем газетой один раз в год
  const lim=debtLimit(s);if(s.cash<-lim*0.5&&s.cash>=-lim&&mi(s)-(s.debtSaid||-99)>=12){s.debtSaid=mi(s);
    pushEvent({title:'Банк предупреждает',deck:`До банкротства — ${money(lim+s.cash)}`,text:`Касса в минусе на ${money(-s.cash)}. Если долг превысит ${money(lim)}, кредиторы закроют завод. Возьмите кредит на экране «Завод», сократите рекламу, лишних дилеров и расходы КБ, продайте склад со скидкой — и проверьте, покупают ли ваши машины: цена и дилеры на экранах «Модели» и «Рынок».`,choices:[['Понятно','ok']]},false);}
  if(s.cash<-debtLimit(s)){s.over=true;s.pending.push({title:'Банкротство',deck:`Компания «${s.company}» закрыта`,text:`Долги превысили допустимый предел. Кредиторы описали завод в ${dstr(s)}.`,paper:true,choices:[['Итоги','final']]});}
  else if(s.y>=1930){s.over=true;finalResults(s);}
  else checkEvents();
  return true;
}
// Сколько можно задолжать до банкротства: запас по сложности плюс месяц отсрочки у поставщиков (детали и зарплата)
// сколько долгов по счетам терпят поставщики и рабочие: месяц закупок и зарплаты; в кредитный кризис — втрое меньше (все хотят денег сразу)
function debtLimit(s){const L=s.last,k=(typeof creditState==='function'&&['tight','crash'].includes(creditState(s).k))?0.3:1;return DIF().debt*cpi(s)+(L?((L.mat||0)+(L.wage||0))*k:0);}
// 0.24: машин армии нужно не больше, чем ей нужно: нужда армии страны в месяц — грузовики, санитарные и штабные машины
// (по истории: армия США к концу 1918 года — около 50 тысяч машин во Франции, британская — около 110 тысяч за войну,
// французская — около 90 тысяч, германская — около 40 тысяч); вам — до 60% этого. Остальная мощность военного заказа —
// военная продукция (моторы, снаряды, каски): её оплачивают так же, но в «Продано» она не входит
const ARMY_NEED={us:6000,uk:2500,fr:2500,de:1000,it:800};
function milNeed(s){return Math.round((ARMY_NEED[s.country]||1000)*0.6);}
function endOfYear(s){
  s.m=0;s.y++;
  for(const c in s.comps)s.comps[c].forEach(o=>{o.prev2=o.prev||0;o.prev=o.yr||0;o.yr=0;o.ysPrev=o.ys||{};o.ys={};});s.homePrev2=s.homePrev||0;s.homePrev=s.homeY||0;s.homeY=0;
  // 0.21: доля рынка для наследия — за целый год (месячные всплески не в счёт)
  {const tot=Object.values(s.segYT||{}).reduce((a,b)=>a+b,0);if(tot>0){const sh=(s.homePrev||0)/tot;s.peak.shY=Math.max(s.peak.shY||0,sh);}}
  s.segYPrev=s.segY||{};s.segY={};s.segYTPrev=s.segYT||{};s.segYT={};
  if((s.yearSold||0)>(s.peak.year||0))s.peak.year=s.yearSold;s.peakLast=s.yearSold||0;s.yearSold=0;
  const fresh=ALL_PARTS().filter(x=>x.y===s.y).map(x=>x.name);if(fresh.length)addLog('Поставщики предлагают новинки: '+fresh.join(', ')+'.','good');
  // 0.25: новинка у поставщиков — газета с кинохроникой о ней: что это, кто придумал, что даёт покупателю (то, что КБ уже сделало само, — не повторяем)
  try{partsNews(s);}catch(e){console.warn(e);}
  yearlyCompetitors(s);yearReview(s);
  s.drivers=s.drivers.filter(id=>{const d=DRIVERS.find(x=>x.id===id);if(!d||d.to<s.y){if(d)addLog(`${d.n} завершил гоночную карьеру и покинул команду.`);return false;}return true;});
  legacyYear(s);
}
// Склад: машин на хранении не больше вместимости; место под машину строится 1 месяц
function whCap(s){return s.wh||12;}
function partsNews(s){const early=(s.rd&&s.rd.early)||[],L=ALL_PARTS().filter(x=>x.y===s.y&&!early.includes(x.id)&&REELS['part:'+x.id]);if(!L.length)return;
  L.forEach(x=>reelUnlock(s,'part:'+x.id));const cat=x=>{const c=PART_CATS.find(c=>c.arr().includes(x));return c?c.name.toLowerCase():'';};
  pushEvent({own:1,kicker:'Поставщики · кинохроника',title:L.length>1?`Новинки ${s.y} года`:`Новинка ${s.y} года: ${L[0].name}`,deck:L.length>1?L.map(x=>x.name).join(' · '):cat(L[0]),
    text:L.map(x=>`${x.name} (${cat(x)})${x.note?' — '+x.note:''}`).join('\n')+'\nТеперь это можно поставить на машины вашего завода. Кинохроника покажет, как это устроено и что меняет для покупателей.',
    choices:[['Дальше','ok'],...L.slice(0,3).map(x=>['▶ '+x.name,'reel:part:'+x.id])]},true);}
function whUnitCost(s){return Math.round(70*cpi(s)*(1+0.01*T(s)));}
function whStock(s){return s.models.reduce((a,m)=>a+m.stock,0);}
// Конкуренты отвечают на ваш успех: если вы забираете класс, они выпускают новинки, режут цены и открывают дилеров
function rivalsReact(s,r){const D=DIF(),T0=D.share||0.2,rate=D.rvRate||1,mx=D.rvMax||1.3;if(!s.rv)s.rv={};
  for(const c in r.mk){const mk=r.mk[c];if(!mk.segs)continue;const rv=s.rv[c]=s.rv[c]||{};
    SEGK.forEach(g=>{const z=mk.segs[g];if(!z||z.size<3){rv[g]=Math.max(0,(rv[g]||0)-0.004);return;}const sh=z.you/z.size,cur=rv[g]||0;
      let nv=sh>T0?cur+0.015*rate*Math.min(3,(sh-T0)/T0):cur-0.006;nv=clamp(nv,0,mx);rv[g]=nv;
      if(c===s.country&&nv>0.25&&Math.floor(nv/0.4)>Math.floor(cur/0.4))rivalNews(s,c,g,nv,cur);});}}
function strikeThreat(){pushEvent({title:'Рабочие грозят забастовкой',text:'Профсоюз требует прибавки. Без неё в следующем месяце выпуск упадёт вдвое.',choices:[['Поднять зарплату','raise'],['Переждать','wait']]},false);}
function rank(v){return v<200000?'Мастерская':v<2000000?'Фабрика':v<20000000?'Концерн':'Автоимперия';}
