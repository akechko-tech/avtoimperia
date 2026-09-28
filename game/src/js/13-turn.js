/* ================= TURN ================= */
const DEALER_MARGIN=0.16;
function step(){
  const s=G;if(!s||s.over||s.pending.length)return false;
  const eHome=econ(s.y,s.m,s.country);
  const r={rev:0,mat:0,wage:0,ovh:0,dlr:0,ad:s.ad,sto:0,int:0,mil:0,milN:0,made:0,sold:0,demand:0,homeSold:0,tool:0,war:0,hire:0,fin:0,lostCap:0,lostDlr:0,team:0,mk:{}};
  // разработка и запуск моделей
  s.models.forEach(md=>{if(md.status==='dev'){md.devLeft--;if(md.devLeft<=0){md.status='prod';md.launched=mi(s);md.fresh=1;md.ramp=techLv(s,'line')===2?2:1;md.plan=md.plan||'auto';
    const tc=toolingCost(md,s);s.cash-=tc;r.tool+=tc;addLog(`Модель «${md.name}» пошла в серию. Оснастка обошлась в ${money(tc)}.`,'good');checkFirstParts(md);}}});
  s.capBuild=(s.capBuild||[]).filter(b=>{b.left--;if(b.left<=0){s.cap+=b.units;addLog(`Новый цех введён в строй: мощность ${fmtN(Math.round(capEff(s)))} машин в месяц.`,'good');return false;}return true;});
  if(s.techBuild){s.techBuild.left--;if(s.techBuild.left<=0){const k=s.techBuild.k;s.tech[k]=(s.tech[k]||0)+1;const lv=TECH[k].lv[s.tech[k]-1];addLog(`Внедрено: ${lv.name}.`,'good');checkFirstTech(k,s.tech[k]);s.techBuild=null;}}
  s.supplyNow=s.supplyNext||1;s.supplyNext=1;s.strikeNow=!!s.strikeNext;s.strikeNext=false;
  const act=s.models.filter(m=>m.status==='prod');
  // спрос
  const D=demandAll(s),creditK=techLv(s,'credit')?1.15:1;
  const dem=act.map(md=>{const o={};for(const c in D.by[md.id])o[c]=D.by[md.id][c]*creditK;return o;});
  const tot=dem.map(o=>Object.values(o).reduce((a,b)=>a+b,0));
  act.forEach((md,i)=>{md.fc=md.fc>0?md.fc*0.55+tot[i]*0.45:tot[i];});
  // производство
  const cap=capEff(s);let milCap=0;if(eHome.war&&s.military&&act.length)milCap=Math.floor(cap*0.4);
  const capCiv=Math.max(0,cap-milCap);
  const want=act.map(md=>md.plan==='auto'?Math.max(0,Math.round(md.fc*1.04+(md.backlog||0)-(md.stock-0.35*md.fc))):Math.max(0,Math.round(+md.plan||0)));
  const cx=act.map(complexity),hrs=act.map(md=>hoursPerCar(md,s)),hpw=hoursPerWorker(s);
  const needCap=want.reduce((a,w,i)=>a+w*cx[i],0)+milCap,needH=want.reduce((a,w,i)=>a+w*hrs[i],0)+milCap*(hrs.length?hrs.reduce((a,b)=>a+b,0)/hrs.length:800);
  const kCap=needCap>0?Math.min(1,cap/needCap):1;
  if(s.staffAuto){const target=Math.ceil(needH*kCap/hpw*1.02);let d=target-s.workers;if(d>0)d=Math.min(d,Math.max(20,Math.round(s.workers*0.5)));else if(d<0)d=Math.max(d,-Math.round(s.workers*0.3));
    if(d>0){r.hire=d*8*cpi(s);s.cash-=r.hire;}s.workers=Math.max(3,s.workers+d);}
  const kLab=needH>0?Math.min(1,s.workers*hpw/needH):1,k=Math.min(kCap,kLab);
  act.forEach((md,i)=>{const made=Math.floor(want[i]*k+(Math.random()<(want[i]*k)%1?1:0));md.lastMade=made;md.made=(md.made||0)+made;md.vol=md.vol?md.vol*0.7+made*0.3:made;md.stock+=made;r.made+=made;r.mat+=made*matCost(md,s);if(md.ramp>0)md.ramp--;});
  if(milCap>0){const mc=act.reduce((a,m)=>a+matCost(m,s),0)/act.length,mu=Math.floor(milCap*k);r.mat+=mu*mc;r.mil=mu*mc*1.35;r.milN=mu;r.made+=mu;}
  // продажи: дилеры, склад, очередь
  const ship=shipCost(s),tp=dealerTP(s),dealerCap={},want_c={};
  act.forEach((md,i)=>{for(const c in dem[i])want_c[c]=(want_c[c]||0)+dem[i][c];});
  for(const c in want_c)dealerCap[c]=dealerCount(s,c)*tp*(c===s.country?1.3:1);
  const lostC={};
  act.forEach((md,i)=>{
    const d=dem[i],sumD=tot[i],bl=md.backlog||0;let req={};let reqT=0;
    for(const c in d){let q=d[c]+(sumD>0?bl*d[c]/sumD:0);const fc=want_c[c]>dealerCap[c]?dealerCap[c]/want_c[c]:1;r.lostDlr+=q*(1-fc);lostC[c]=(lostC[c]||0)+q*(1-fc);q*=fc;req[c]=q;reqT+=q;}
    const avail=md.stock,f=reqT>avail?avail/Math.max(1e-9,reqT):1;let sold=0;
    for(const c in req){const so=Math.floor(req[c]*f+(Math.random()<(req[c]*f)%1?1:0));if(!so)continue;const mk=r.mk[c]=r.mk[c]||{sold:0,rev:0};mk.sold+=so;const net=md.price*(1-DEALER_MARGIN)-(c===s.country?0:ship);mk.rev+=so*net;r.rev+=so*net;sold+=so;if(c===s.country)r.homeSold+=so;}
    sold=Math.min(sold,md.stock);md.stock-=sold;const unmet=Math.max(0,reqT-sold);md.backlog=Math.min(unmet*0.5,md.fc*0.8);r.lostCap+=unmet-md.backlog;
    md.lastDem=Math.round(sumD);md.lastSold=sold;md.totalSold+=sold;r.sold+=sold;r.demand+=sumD;
    r.war+=sold*defectRate(s)*md.price*0.25;});
  if(techLv(s,'credit'))r.fin=r.rev*0.03;
  // расходы
  r.rd=rdUpkeep(s);r.drv=driverPayroll(s);r.team=teamUpkeep(s);
  // конструкторское бюро: проект продвигается каждый месяц
  if(s.rd.proj){s.rd.prog+=rdPoints(s);const pj=s.rd.proj;if(s.rd.prog>=pj.need){
    if(pj.kind==='upg'){s.rd.upg[pj.id]=(s.rd.upg[pj.id]||0)+1;addLog(`КБ завершило улучшение: ${pj.name} (уровень ${s.rd.upg[pj.id]}).`,'good');pendingToasts.push('🔧 '+pj.name+' ★'+s.rd.upg[pj.id]);}
    else{s.rd.early.push(pj.id);addLog(`КБ построило прототип: ${pj.name} — на ${pj.yrs} г. раньше рынка!`,'good');pendingToasts.push('🔬 Прототип: '+pj.name);}
    s.rd.proj=null;s.rd.prog=0;s.rd.idleSaid=0;}}
  r.wage=s.workers*wageNow(s);r.ovh=plantOverhead(s)*(s.shifts>1?1.1:1);
  r.dlr=Object.values(s.dealers).reduce((a,b)=>a+b,0)*dealerUpkeep(s);
  r.sto=s.models.reduce((a,md)=>a+md.stock*matCost(md,s),0)*0.015;r.int=s.loan*0.005;
  r.profit=r.rev+r.mil-r.mat-r.wage-r.ovh-r.dlr-r.ad-r.sto-r.int-r.rd-r.drv-r.team-r.war-r.fin-r.tool-r.hire;
  r.tax=r.profit>0?r.profit*taxRate(s.y):0;r.profit-=r.tax;
  s.cash+=r.profit+r.tool+r.hire;   // оснастка и найм уже списаны выше
  s.plantVal*=0.995;
  // репутация: качество проданного, брак, очереди, недовольные дилеры
  if(r.sold>0){let wr=0;act.forEach(md=>{wr+=Math.min(1.4,modelQ(md)/qrefQ(segOf(md),s))*md.lastSold;});wr/=r.sold;
    const target=clamp(22+50*clamp((wr-0.6)/0.7,0,1)+10*clamp(Math.log10(1+r.sold)/4.5,0,1)-(defectRate(s)-0.03)*160-(r.lostCap>r.sold*0.5?6:0)+(s.wagePol==='five'?4:0),5,95);
    s.rep+=(target-s.rep)*0.035+(act.some(m=>overpower(m)&&m.lastSold>0)?-1.5:0);}else s.rep-=0.2;
  s.rep=clamp(s.rep,0,100);
  // конкуренты и рынки для экрана «Рынок»: сколько купили у реальных марок и у вас
  for(const c in COUNTRIES){const L=s.comps[c]||[];L.forEach(x=>x.last=0);const MC=D.mk[c],sg={};let size=0;
    SEGK.forEach(g=>{const z=MC.segs[g];sg[g]={size:z.inc,you:0,price:z.price};size+=z.inc;compSplit(c,g,s,z.inc).forEach(o=>{if(L[o.i])L[o.i].last+=o.sales;});});
    const mk=r.mk[c]=r.mk[c]||{sold:0,rev:0};mk.size=size;mk.segs=sg;mk.shop=MC.shop;mk.lostDlr=lostC[c]||0;}
  act.forEach((md,i)=>{const g=segOf(md);for(const c in dem[i]){const so=tot[i]>0?md.lastSold*dem[i][c]/tot[i]:0,m=r.mk[c];if(m&&m.segs[g]){m.segs[g].you+=so;m.segs[g].size+=so;m.size+=so;}}});
  // машины на дорогах: новые прибавились, старые ушли на свалку
  if(!s.fleet)s.fleet={};if(!s.mkY)s.mkY={};const life=tabAt(CAR_LIFE,yf(s));
  for(const c in COUNTRIES){const m=r.mk[c],cars=m.size-m.segs.truck.size,f0=fleetOf(s,c);s.fleet[c]=Math.max(0,f0+cars-f0/(12*life));s.mkY[c]=m.size*12/SEASON[s.m];}
  // ценовая война: конкуренты отвечают на демпинг
  SEGK.forEach(g=>{const ms=act.filter(md=>segOf(md)===g),cur=s.pw[g]||1;if(!ms.length){s.pw[g]=Math.min(1,cur+0.01);return;}
    const ratio=ms.reduce((a,md)=>a+md.price/refPrice(md,s),0)/ms.length,sg=r.mk[s.country].segs[g],sh=sg.size>0?sg.you/sg.size:0;
    if(ratio<0.88&&sh>0.2){s.pw[g]=Math.max(0.82,cur-0.012);if(cur===1)addLog(`Конкуренты в сегменте «${SEG[g].name}» начали снижать цены в ответ на ваши.`,'bad');}else s.pw[g]=Math.min(1,cur+0.008);});
  // итоги месяца
  const hs=r.mk[s.country].size;r.size=hs;r.share=hs>0?r.homeSold/hs:0;r.label=dstr(s);s.last=r;
  const H=s.hist;H.cash.push(Math.round(s.cash));H.sales.push(r.sold);H.market.push(Math.round(hs));H.profit.push(Math.round(r.profit));H.share.push(+(r.share*100).toFixed(2));
  for(const k2 in H)if(H[k2].length>420)H[k2].shift();
  s.yearSold=(s.yearSold||0)+r.sold;
  for(const c in r.mk){const m=r.mk[c];if(m.size>0&&m.sold>0){const sh=m.sold/m.size;if(sh>(s.peak.share[c]||0))s.peak.share[c]=sh;}}
  if(s.strikeNow)addLog('Забастовка: выпуск упал вдвое.','bad');
  if(Math.random()<WAGE_POL[s.wagePol||'market'].strike*(s.workers>200?1.4:1)&&!s.pending.length&&s.workers>30)strikeThreat();
  s.m++;
  if(s.m>11){endOfYear(s);}
  RACES.forEach(rc=>{if(rc.y===s.y&&rc.m-1===s.m&&raceEligible(rc,s)&&!raceWarBlocked(rc,s))addLog(`Открыта запись на гонку «${rc.name}» (${MONTHS_G[rc.m]}). Приз ${money(racePrize(rc))}.`,'hist');});
  seasonTick(s);
  checkAch();
  if(s.cash<0&&s.cash>=-DIF().debt*cpi(s))addLog('Касса в минусе. Возьмите кредит или сократите расходы.','bad');
  // склад растёт — подсказка раз в полгода
  act.forEach(md=>{if(stockWarn(md)&&mi(s)-(md.stockSaid||-99)>=6){md.stockSaid=mi(s);addLog(`На складе «${md.name}» — ${fmtN(md.stock)} машин без покупателей. Снизьте выпуск или цену.`,'bad');pendingToasts.push('📦 Склад растёт: «'+md.name+'»');}});
  // до банкротства рукой подать — предупреждаем газетой один раз в год
  const lim=DIF().debt*cpi(s);if(s.cash<-lim*0.5&&s.cash>=-lim&&mi(s)-(s.debtSaid||-99)>=12){s.debtSaid=mi(s);
    pushEvent({title:'Банк предупреждает',deck:`До банкротства — ${money(lim+s.cash)}`,text:`Касса в минусе на ${money(-s.cash)}. Если долг превысит ${money(lim)}, кредиторы закроют завод. Возьмите кредит на экране «Завод», сократите рекламу, лишних дилеров и расходы КБ, продайте склад со скидкой — и проверьте, покупают ли ваши машины: цена и дилеры на экранах «Модели» и «Рынок».`,choices:[['Понятно','ok']]},false);}
  if(s.cash<-DIF().debt*cpi(s)){s.over=true;s.pending.push({title:'Банкротство',deck:`Компания «${s.company}» закрыта`,text:`Долги превысили допустимый предел. Кредиторы описали завод в ${dstr(s)}.`,paper:true,choices:[['Итоги','final']]});}
  else if(s.y>=1930){s.over=true;finalResults(s);}
  else checkEvents();
  return true;
}
function endOfYear(s){
  s.m=0;s.y++;
  if((s.yearSold||0)>(s.peak.year||0))s.peak.year=s.yearSold;s.peakLast=s.yearSold||0;s.yearSold=0;
  const fresh=[...ENGINES,...CHASSIS,...BODIES,...TYRES].filter(x=>x.y===s.y).map(x=>x.name);if(fresh.length)addLog('Поставщики предлагают новинки: '+fresh.join(', ')+'.','good');
  yearlyCompetitors(s);
  s.drivers=s.drivers.filter(id=>{const d=DRIVERS.find(x=>x.id===id);if(!d||d.to<s.y){if(d)addLog(`${d.n} завершил гоночную карьеру и покинул команду.`);return false;}return true;});
  legacyYear(s);
}
function strikeThreat(){pushEvent({title:'Рабочие грозят забастовкой',text:'Профсоюз требует прибавки. Без неё в следующем месяце выпуск упадёт вдвое.',choices:[['Поднять зарплату','raise'],['Переждать','wait']]},false);}
function rank(v){return v<200000?'Мастерская':v<2000000?'Фабрика':v<20000000?'Концерн':'Автоимперия';}
