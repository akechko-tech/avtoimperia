/* ================= ADVISOR & HELPER: советы с кнопками и помощник управляющего ================= */
// Лучшая цена модели для прибыли (считается раз в месяц на каждую цену)
const BP_CACHE=new Map();
// себестоимость при выпуске q машин в месяц: с потоком детали и часы дешевеют (не ниже нынешнего объёма)
function ucAtVol(md,s,q){const v0=md.vol;md.vol=Math.max(modelVol(md),q||0);const u=unitCost(md,s);md.vol=v0;return u;}
function bestPriceFor(md,s){const key=md.id+'|'+mi(s)+'|'+md.price+'|'+PART_KEYS.map(k=>md[k]).join('');if(BP_CACHE.has(key))return BP_CACHE.get(key);
  // не дешевле себестоимости с запасом: иначе каждая проданная машина — убыток
  // (0.21: себестоимость — при том выпуске, который даст эта цена: у новой модели на малом потоке она высока, и цена «от неё»
  //  запирает модель в ловушке — дорого, потому что мало, и мало, потому что дорого)
  // если машин и дилеров не хватает на всех покупателей, выгоднее поднять цену, чем держать очередь
  // (но не больше, чем завод может сделать этой модели: иначе цена растёт по кругу, а машин всё меньше)
  const act=(s.models||[]).filter(m=>m.status==='prod'),made=act.reduce((a,m)=>a+(m.lastMade||0),0),capM=capEff(s)*(made>0?(md.lastMade||0)/made:1/Math.max(1,act.length));
  const lim=(md.lostS||0)+(md.lostD||0)>0.5?Math.max(1,(md.lastSold||0)*1.15,capM*0.95):Infinity,top=Math.max(md.price,Math.round(refPrice(md,s)*1.45/10)*10);
  const ship=shipCost(s),ck=techLv(s,'credit')?1.15:1,oth=act.filter(m=>m.id!==md.id).map(m=>({m,uc:unitCost(m,s)})),dm=dMargin(s);
  // 0.18: прибыль всей марки — дешёвая модель забирает покупателей у ваших же моделей (каннибализация)
  // 0.21: за границей — своя доставка, доля импортёра, курс; по лицензии — только доля цены
  const netOf=(pp,c,ucc)=>{if(c===s.country)return pp*(1-dm)-ucc;if(licOn(s,c))return pp*LIC_ROY;const IL=impOf(s,c);return (pp*(1-dm-(IL&&IL.cut||0))-shipCostTo(s,c)*shipK(s,c))*fxOf(s,c)-ucc;};
  const exp=(md.soldBy&&md.lastSold)?1-(md.soldBy[s.country]||0)/md.lastSold:0;
  const prof=p=>{const A=demandAll(s,{id:md.id,price:p}).by,by=A[md.id]||{};let q=0;for(const c in by)q+=by[c]*ck;
    const uc=ucAtVol(md,s,Math.min(q,Math.max(1,capM*1.3),lim)),fl=(uc+exp*ship)/(1-dm)*1.04;let v=0;for(const c in by)v+=by[c]*ck*netOf(p,c,uc);
    let o=0;oth.forEach(x=>{const b2=A[x.m.id]||{};for(const c in b2)o+=b2[c]*ck*netOf(x.m.price,c,x.uc);});return {v:(q>lim?v*lim/q:v)+o,ok:p>=fl,fl};};
  const P0=prof(md.price),p0=P0.v;let best={price:md.price,v:P0.ok?p0:-Infinity};
  // кроме шагов от нынешней цены — и цены вокруг рыночной: иначе завышенная цена без покупателей так и не опустится
  const rp=refPrice(md,s),cand=[0.8,0.9,1.1,1.2,1.35,1.6].map(k=>md.price*k).concat([0.9,1,1.1].map(k=>rp*k));
  for(const x of cand){const p=Math.max(20,Math.min(top,Math.round(x/10)*10)),R=prof(p);if(R.ok&&R.v>best.v+Math.max(1,Math.abs(best.v)*0.002))best={price:p,v:R.v};}
  // ни одна цена не окупает машину — ставим минимальную, при которой она окупается на нынешнем потоке
  if(best.v===-Infinity){const fl=Math.round(P0.fl/10)*10;best={price:Math.max(fl,Math.round(Math.min(md.price,top)/10)*10),v:prof(fl).v};}
  // покупателей почти нет, а цена выше рыночной — возвращаемся к рыночной, если она окупается
  if(best.price>rp*1.1&&(md.lastSold||0)<1&&mi(s)-(md.launched||0)>=6){const p=Math.round(rp/10)*10,R=prof(p);if(R.ok&&p<best.price)best={price:p,v:R.v};}
  const r={price:best.price,gain:best.price===md.price?0:Math.max((best.v-p0)/Math.max(Math.abs(p0),1),best.price<md.price&&(md.lastSold||0)<1?0.1:0),v:best.v};if(BP_CACHE.size>200)BP_CACHE.clear();BP_CACHE.set(key,r);return r;}
function helperOn(s){return !!(s.helper&&s.helper.on);}
// 0.21: сколько дилеров открыть в новых городах: пока машины, которые продаст ещё один дилер, окупают его содержание
function dealerGain(s,c){const act=s.models.filter(m=>m.status==='prod');if(!act.length)return 0;const d=dealerCount(s,c),need=dealerNeed(c,s),room=dealerRoom(s,c);if(room<1||tradeBan(s,c))return 0;
  const pot=marketPotential(s,c);if(pot<=0)return 0;const md=act.slice().sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0],IL=impOf(s,c);
  const m=(md.price*(1-dMargin(s)-(c===s.country?0:(IL&&IL.cut||0)))-(c===s.country?0:shipCostTo(s,c)*shipK(s,c)))*fxOf(s,c)-unitCost(md,s);if(m<=0)return 0;
  const u=dealerUpkeep(s,c)+dealerCost(s)/24;let n=0,dd=Math.max(1,d);const lim=Math.min(room,Math.max(3,Math.round(d*0.25)));
  while(n<lim){const g=pot*(Math.pow(Math.min(1,(dd+1)/need),0.7)-Math.pow(Math.min(1,dd/need),0.7))*m;if(g<u*1.3)break;n++;dd++;}return n;}
function homeDemand(s){return s.models.filter(m=>m.status==='prod').reduce((a,m)=>a+(m.fc||0),0);}
// Лучший проект для КБ: детали самой продаваемой модели, потом прототипы
function suggestProject(s){const P=rdProjects(s);if(!P.length)return null;const top=s.models.filter(m=>m.status==='prod').sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0];
  const w={e:5,g:3,c:3,w:2,k:2,b:3};
  const mine=P.filter(p=>p.kind==='upg'&&top&&top[p.ck]===p.id).sort((a,b)=>(w[b.ck]||1)/b.need-(w[a.ck]||1)/a.need);
  // иначе — детали своих машин, ранний прототип; а если и их нет — самая новая массовая деталь эпохи, а не старьё
  // (в 1917 году не улучшать одноцилиндровый De Dion 1895 года только потому, что он первый в списке)
  const fresh=P.filter(p=>p.kind==='upg'&&p.py>=s.y-10).sort((a,b)=>((b.mass?1:0)-(a.mass?1:0))||(b.py-a.py)||(a.need-b.need));
  return mine[0]||P.filter(p=>p.kind==='upg'&&p.mine)[0]||P.find(p=>p.kind==='early')||fresh[0]||null;}
let TIPS=[];
function adviceList(s){
  const T=[],L=s.last,act=s.models.filter(m=>m.status==='prod'),dev=s.models.filter(m=>m.status==='dev'),lim=debtLimit(s),home=s.country;
  const add=(p,icon,text,btn,run,tab)=>T.push({p,icon,text,btn,run,tab});
  if(s.over)return T;
  // деньги
  if(s.cash<0){const room=loanOpen(s)?maxLoan(s)-s.loan:0,n=Math.max(0,Math.min(room,Math.ceil((-s.cash+3000*cpi(s))/1000)*1000));
    add(s.cash<-lim*0.5?100:90,'💰',`Касса в минусе на ${money(-s.cash)}${s.cash<-lim*0.5?`: при долге больше ${money(lim)} завод закроют`:''}. ${loanOpen(s)?'Возьмите кредит и сократите лишние расходы.':creditState(s).t+' — сократите выпуск и расходы, продайте излишки склада.'}`,n>0?`Кредит ${money(n)}`:null,n>0?()=>{G.loan+=n;G.cash+=n;addLog(`Взят кредит ${money(n)}.`);}:null,'plant');}
  if(!act.length&&!dev.length)add(95,'🛠','Сейчас нечего продавать. Придумайте машину: в конструкторе есть кнопка «Подобрать детали повыгоднее».','Конструктор',()=>openDesigner(),'models');
  // модели и цены
  act.forEach(md=>{const uc=unitCost(md,s),net=md.price*(1-dMargin(s)),C=classCompare(md,s,home);
    if(net<uc*0.98&&(md.lastSold||0)>0){const np=Math.round(uc/(1-dMargin(s))*1.12/10)*10;add(85,'📉',`«${md.name}» продаётся в убыток: себестоимость ${money(uc)}, а вам с машины достаётся ${money(net)}.`,`Цена ${money(np)}`,()=>{md.price=np;},'models');}
    if(stockWarn(md)){const np=Math.max(20,Math.round(md.price*0.95/5)*5);add(70,'📦',`Машины «${md.name}» копятся на складе (${fmtN(md.stock)} шт.). Снизьте цену или выпуск.`,`Цена −5%`,()=>{md.price=np;},'models');}
    // 0.21: подержанные своей марки — новая модель отвлечёт покупателей от перекупщиков
    if(!dev.length&&usedPen(md,home,s)>0.25&&mi(s)-md.launched>=24)add(58,'🚙',`На дорогах много ваших машин прошлых лет, и перекупщики продают их дешевле новой «${md.name}». Новая модель — заметно другая — вернёт покупателей.`,'Новая модель',()=>openDesigner(rivalKind(md)),'models');
    if(C.S<0.85&&!dev.length&&mi(s)-md.launched>=12)add(65,'🏁',`«${md.name}» уступает сопернику ${C.ref.name}: ${Math.round(C.S*100)}%. Покупатели уходят — пора новой модели.`,'Новая модель',()=>openDesigner(rivalKind(md)),'models');
    if((md.lastSold||0)>0||(md.lastDem||0)>0.3){const bp=bestPriceFor(md,s);if(bp.gain>0.12&&bp.price!==md.price)add(55,'🏷',`Прибыль с «${md.name}» будет выше на ${Math.round(Math.min(9.99,bp.gain)*100)}% при цене ${money(bp.price)}.`,`Цена ${money(bp.price)}`,()=>{md.price=bp.price;},'models');}});
  // КБ
  const free=rdSlots(s)-rdActive(s).length,pj=free>0&&suggestProject(s);
  if(pj)add(60,'🔧',`Конструкторское бюро ${rdActive(s).length?'может вести ещё один проект':'простаивает'}. Предлагаю: ${pj.kind==='upg'?'улучшить':'построить прототип'} «${pj.name}»${pj.kind==='upg'?' — '+UPG_TXT[pj.ck]:''}.`,'Начать',()=>{G.rd.projs.push({...pj,prog:0});addLog(`КБ начало проект: ${pj.name}.`);},'models');
  // мощности и склад
  if(L&&act.length){const util=L.made/Math.max(1,capEff(s)),lost=act.reduce((a,m)=>a+(m.lostS||0),0),busy=(s.capBuild||[]).length;
    if(util>0.93&&lost>Math.max(1,L.sold*0.06)&&!busy){const n=Math.max(2,Math.round(s.cap*0.25)),c=n*capUnitCost(s);if(s.cash>c*1.2)add(75,'🏭',`Завод работает на пределе, а покупателям не хватило ${fmtD(lost)} машин. Постройте цех.`,`+25% · ${money(c)}`,()=>ACT.capAdd({n}),'plant');}
    if((L.dumpN>0||whStock(s)>whCap(s)*0.9)&&!(s.whBuild||[]).length){const n=Math.max(5,Math.round(whCap(s)*0.5)),c=n*whUnitCost(s);if(s.cash>c*1.2)add(72,'🏚',`Склад ${L.dumpN?'переполнен — машины ушли перекупщикам за полцены':'почти полон'}. Расширьте его.`,`+${fmtN(n)} мест · ${money(c)}`,()=>ACT.whAdd({n}),'plant');}}
  // дилеры: открыть в новых городах (больше, чем городов, не бывает — кнопка не съест кассу)
  const dc=dealerCost(s),mk=L&&L.mk[home],need=Math.round(dealerNeed(home,s)),have=dealerCount(s,home),room=dealerRoom(s,home);
  if(mk&&(mk.lostDlr||0)>0.5&&room>0){const full=dealersShort(s,home),n=Math.min(full,Math.floor(Math.max(0,s.cash-2000*cpi(s))/dc));
    if(n>=1)add(68,'🏪',`Дилеры не успели обслужить ≈ ${fmtD(mk.lostDlr)} покупателей. Они сами нанимают продавцов, но это займёт несколько месяцев — быстрее открыть дилеров в новых городах: ещё ${fmtN(full)}${n<full?`, денег хватает на ${fmtN(n)}`:''}.${(L.lostCap||0)>Math.max(1,L.sold*0.05)?' Машин тоже не хватает — нужны и цеха.':''}`,`+${fmtN(n)} · ${money(n*dc)}`,()=>{buyDealers(G,home,n);},'market');}
  else if(mk&&(mk.lostDlr||0)>0.5&&dealerGrowSteps(s,home)>0){const c=dealerGrowCost(s,home);if(s.cash>c*1.5)add(66,'🏪',`Дилеры не успели обслужить ≈ ${fmtD(mk.lostDlr)} покупателей, а все города уже охвачены. Расширьте салоны: продавцы, гаражи и запас машин — +25% продаж на каждого дилера.`,`Салоны +25% · ${money(c)}`,()=>{dealerGrow(G,home);},'market');}
  else if(act.length&&have<need*0.5&&room>0){const n=Math.max(1,Math.min(room,Math.round(need*0.1))),c=n*dc;if(s.cash>c*3)add(48,'🏪',`Ваши дилеры есть не во всех городах: покупатели видят ${Math.round(reachOf(s,home)*100)}% ваших машин.`,`+${n} · ${money(c)}`,()=>{buyDealers(G,home,n);},'market');}
  // экспорт: где ваши машины брали бы — сначала импортёр
  if(act.length&&s.cash>dc*8){const hd=homeDemand(s);let bestC=null,bestP=0;Object.keys(COUNTRIES).forEach(c=>{if(c===home||impLv(s,c))return;const p=marketPotential(s,c)*Math.pow(IMP_LV[1].cap,0.7);if(p>bestP){bestP=p;bestC=c;}});
    if(bestC&&bestP>Math.max(1.5,hd*0.25)){const c1=impCost(s,bestC,1);if(s.cash>c1*3)add(45,'🌍',`В стране «${COUNTRIES[bestC].name}» ваши машины брали бы ≈ ${fmtD(bestP)} в месяц. Найдите импортёра: он возьмёт ${Math.round(IMP_LV[1].cut*100)}% цены и откроет агентов в больших городах.`,`Импортёр · ${money(c1)}`,()=>{impUp(G,bestC);},'market');}}
  // своё отделение и сборочный завод — когда окупятся
  {let bc=null,bp=1e9;Object.keys(COUNTRIES).forEach(c=>{if(c===home)return;const pb=impPayback(s,c);if(pb<bp){bp=pb;bc=c;}});
    if(bc&&bp<36){const lv=impLv(s,bc),c2=impCost(s,bc,lv+1);if(s.cash>c2*1.5)add(42,lv===1?'🏢':'🏭',lv===1?`В стране «${COUNTRIES[bc].name}» импортёр забирает ${Math.round(IMP_LV[1].cut*100)}% цены. Своё отделение окупится за ≈ ${Math.max(1,Math.round(bp))} мес. и откроет дилеров по всей стране.`:`В стране «${COUNTRIES[bc].name}» пошлина ${Math.round(tariffAt(bc,s)*100)}% и дорогая доставка. Сборочный завод окупится за ≈ ${Math.max(1,Math.round(bp))} мес.`,`${lv===1?'Отделение':'Завод'} · ${money(c2)}`,()=>{impUp(G,bc);},'market');}}
  // технологии завода
  if(!s.techBuild){const k=TECH_ORDER.find(k=>techOpen(s,k)&&s.cash>techCost(s,k)*1.8);if(k){const nx=techNext(s,k),c=techCost(s,k);add(40,'⚙️',`Можно внедрить «${nx.name}»: ${techEffects(nx)}.`,`Внедрить · ${money(c)}`,()=>ACT.tech({k}),'plant');}}
  // реклама
  if(act.length&&(s.ad||0)<adRef(s)*0.25&&s.cash>adRef(s)*15){const a=Math.round(adRef(s)*0.6/10)*10;add(30,'📰','Реклама почти не работает: о ваших машинах мало кто слышал.',`Реклама ${money(a)}/мес`,()=>{G.ad=a;},'market');}
  // гонки
  const rc=RACES.find(r=>raceOpen(r,s)&&!s.raceDone[r.key]);if(rc&&act.length)add(35,'🏁',`Открыта запись на гонку «${rc.name}». Победа — слава марке и покупатели.`,'К гонкам',()=>{tab='race';window.scrollTo(0,0);},'race');
  // фургоны для бизнеса
  if(s.y>=1896&&act.length&&!s.models.some(m=>isTruck(m)&&m.status!=='off')&&s.cash>devCost({...rivalDesign('van',s.y)},s)*2)add(22,'🚚','Лавки, пивоварни и почта покупают фургоны, а ведомства объявляют заказы. Сделайте фургон.','Фургон',()=>openDesigner('van'),'models');
  // КБ растёт
  if(s.rd.lvl<RD_MAX&&s.cash>rdUpCost(s)*6&&act.length)add(25,'🎓',`Денег хватает, чтобы расширить конструкторское бюро: «${RD_LV[s.rd.lvl+1]}».`,`Расширить · ${money(rdUpCost(s))}`,()=>ACT.rdUp(),'models');
  return T.sort((a,b)=>b.p-a.p);
}
function advisorCard(s,where){
  const all=adviceList(s),L=where?all.filter(t=>t.tab===where):all,show=L.slice(0,where?1:3),H=s.helperMsg&&s.helperMsg.m===mi(s)?s.helperMsg.list:null;
  if(!show.length&&(!H||where))return '';TIPS=show;
  return `<section class="card advisor"><div class="row"><span class="label">💡 Советник</span>${helperOn(s)?'<span class="pill good">помощник включён</span>':''}</div>
    ${H&&H.length&&!where?`<p class="small good" style="margin-top:6px">Помощник в прошлом месяце: ${esc(H.join('; '))}.</p>`:''}
    ${show.map((t,i)=>`<div class="tip"><span class="ic">${t.icon}</span><p class="small">${esc(t.text)}</p>${t.btn&&t.run?`<button class="btn sm primary" data-act="tip" data-k="${i}">${esc(t.btn)}</button>`:''}</div>`).join('')}
    ${!where&&all.length>3?`<p class="small muted" style="margin-top:6px">Ещё советов: ${all.length-3}. Сначала самые важные.</p>`:''}</section>`;}
// Помощник управляющего: каждый месяц сам делает безопасные вещи — цены, дилеры, цеха, склад, КБ, кредит
function helperMonth(s){if(!helperOn(s)||s.over)return;const msg=[],act=s.models.filter(m=>m.status==='prod'),L=s.last,home=s.country,cs=creditState(s),calm=cs.k==='ok'||cs.k==='war';
  // 0.21: запас кассы — два месяца постоянных расходов; вложения — из кассы сверх запаса и (в спокойное время) из половины свободного кредита
  const fixed=L?(L.wage||0)+(L.ovh||0)+(L.dlr||0)+(L.ad||0)+(L.rd||0)+(L.int||0)+(L.team||0)+(L.drv||0):2000*cpi(s),reserve=Math.max(3000*cpi(s),fixed*2);
  const credit=()=>calm&&loanOpen(s)?Math.max(0,maxLoan(s)-s.loan):0;
  const room=()=>s.cash-reserve+credit()*0.5;
  const pay=c=>{if(s.cash-c<reserve*0.5){const n=Math.min(credit(),Math.ceil((c+reserve*0.5-s.cash)/1000)*1000);if(n>0){s.loan+=n;s.cash+=n;msg.push('взял кредит '+money(n));}}return s.cash>=c;};
  // средняя прибыль за полгода: пока продажи не окупают завод, помощник не расширяет КБ, не внедряет новинки и не идёт за границу без нужды
  const pr=((s.hist&&s.hist.profit)||[]).slice(-12),pAvg=pr.length>=6?pr.reduce((a,b)=>a+b,0)/pr.length:0,lean=!(pAvg>0);
  // кредит, если касса в минусе; лишние деньги — в погашение
  if(s.cash<0&&loanOpen(s)){const n=Math.max(0,Math.min(maxLoan(s)-s.loan,Math.ceil((-s.cash+reserve*0.5)/1000)*1000));if(n>0){s.loan+=n;s.cash+=n;msg.push('взял кредит '+money(n));}}
  else if(s.loan>0&&s.cash>reserve*2&&!s.helper.keepLoan){const n=Math.min(s.loan,Math.round((s.cash-reserve*1.5)/1000)*1000);if(n>0){s.loan-=n;s.cash-=n;msg.push('погасил кредит '+money(n));}}
  // цены — раз в квартал
  if(s.m%3===0)act.forEach(md=>{if(!(md.lastSold||md.lastDem)&&!(md.price>refPrice(md,s)*1.1&&mi(s)-(md.launched||0)>=6))return;const bp=bestPriceFor(md,s);if(bp.gain>0.05&&bp.price!==md.price){md.price=bp.price;msg.push(`цена «${md.name}» ${money(bp.price)}`);}});
  // цеха — по прогнозу спроса, заранее (стройка идёт полгода-год); в кризис и спад не строим
  if(L&&act.length&&calm&&econ(s.y,s.m,home).f>=0.9){const kC=techMul(s,'cap')*(s.shifts>1?1.85:1)*bn('lineCap'),bld=(s.capBuild||[]).reduce((a,b)=>a+b.units,0)*kC;
    const need=act.reduce((a,m)=>a+((m.fc||0)*1.12+(m.backlog||0)*0.5)*complexity(m),0),have=capEff(s)+bld;
    s.helper.capN=need>have*1.05?(s.helper.capN||0)+1:0;
    if(s.helper.capN>=2){const n=Math.max(2,Math.min(Math.round(s.cap*1.0),Math.ceil((need*1.1-have)/kC),Math.round(s.cap*0.2)>2?Math.max(Math.round(s.cap*0.2),Math.ceil((need*1.1-have)/kC)):Math.ceil((need*1.1-have)/kC))),c=n*capUnitCost(s);
      if(room()>c&&pay(c)&&capOrder(s,n,true)){msg.push(`заложил цех +${fmtN(n)} (${capMonths(s,n)} мес.)`);s.helper.capN=0;}}}
  // склад
  if(L&&(L.dumpN>0||whStock(s)>whCap(s)*0.85)&&!(s.whBuild||[]).length){const n=Math.max(5,Math.round(whCap(s)*0.6)),c=n*whUnitCost(s);if(room()>c&&pay(c)&&whOrder(s,n,true))msg.push('расширил склад');}
  // дилеры дома: новые города — только если дилеры не успевают или уже хорошо продают
  const mk=L&&L.mk[home],need=Math.round(dealerNeed(home,s)),have=dealerCount(s,home),dc=dealerCost(s),spd=have?((s.dsm&&s.dsm[home])||0)/have:0;
  let add=0;if(mk&&(mk.lostDlr||0)>0.5)add=dealersShort(s,home);else if(act.length&&s.m%2===0)add=dealerGain(s,home);
  // дилеры окупаются быстрее всего: на них — касса сверх половины запаса и почти весь свободный кредит
  add=Math.min(add,dealerRoom(s,home),Math.floor(Math.max(0,room())/dc/2));if(add>0&&pay(add*dc)){s.cash-=add*dc;s.dealers[home]=have+add;msg.push(`+${add} ${plural(add,'дилер','дилера','дилеров')}`);}
  else if(dealerGrowSteps(s,home)>0&&room()>dealerGrowCost(s,home)*2&&dealerGrow(s,home))msg.push('салоны дилеров +25%');
  // экспорт — раз в полгода: импортёр, дилеры в больших городах, своё отделение и завод, когда окупятся
  if(s.m%6===2&&act.length&&calm&&!s.helper.noExp){Object.keys(COUNTRIES).forEach(c=>{if(c===home)return;const lv=impLv(s,c),d=dealerCount(s,c),pot=marketPotential(s,c);
    if(!lv){if(pot>2&&(!lean||pot>3&&pot>2*marketPotential(s,home))&&room()>impCost(s,c,1)*2.5&&impUp(s,c))msg.push('импортёр: '+COUNTRIES[c].name);return;}
    if(lv<4&&impPayback(s,c)<[0,18,24,30][lv]&&room()>impCost(s,c,lv+1)*2&&impUp(s,c)){msg.push((lv===1?'отделение: ':lv===2?'сборка из комплектов: ':'свой завод: ')+COUNTRIES[c].name);return;}
    const n=d?dealerGain(s,c):0;if(n>0&&room()>dc*n*2){s.cash-=n*dc;s.dealers[c]=d+n;}});}
  // КБ: проекты и рост
  while(rdActive(s).length<rdSlots(s)){const pj=suggestProject(s);if(!pj)break;s.rd.projs.push({...pj,prog:0});msg.push('КБ: '+pj.name);}
  if(s.rd.lvl<5&&!lean&&pAvg>rdUpkeep(s)*2&&room()>rdUpCost(s)*5){const c=rdUpCost(s);s.cash-=c;s.rd.lvl++;msg.push('КБ расширено');}
  // технологии завода
  if(!s.techBuild&&calm&&!lean){const k=TECH_ORDER.find(k=>techOpen(s,k)&&room()>techCost(s,k)*2);if(k){const c=techCost(s,k);if(pay(c)){s.cash-=c;s.plantVal+=c*0.7;s.techBuild={k,left:techMonths(s,k)};msg.push('внедряет: '+techNext(s,k).name);}}}
  // реклама — около 4% выручки (в кризис — вдвое меньше)
  if(L)s.ad=Math.round(Math.min(adRef(s)*0.8,Math.max(adRef(s)*0.15,(L.rev||0)*(calm?0.04:0.02)))/10)*10;
  s.helperMsg={m:mi(s)+1,list:msg};if(msg.length)addLog('Помощник: '+msg.join('; ')+'.');}
