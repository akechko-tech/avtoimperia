/* ================= ADVISOR & HELPER: советы с кнопками и помощник управляющего ================= */
// Лучшая цена модели для прибыли (считается раз в месяц на каждую цену)
const BP_CACHE=new Map();
function bestPriceFor(md,s){const key=md.id+'|'+mi(s)+'|'+md.price+'|'+PART_KEYS.map(k=>md[k]).join('');if(BP_CACHE.has(key))return BP_CACHE.get(key);
  // не дешевле себестоимости с запасом: иначе каждая проданная машина — убыток
  // если машин и дилеров не хватает на всех покупателей, выгоднее поднять цену, чем держать очередь
  // (но не больше, чем завод может сделать этой модели: иначе цена растёт по кругу, а машин всё меньше)
  const act=(s.models||[]).filter(m=>m.status==='prod'),made=act.reduce((a,m)=>a+(m.lastMade||0),0),capM=capEff(s)*(made>0?(md.lastMade||0)/made:1/Math.max(1,act.length));
  const lim=(md.lostS||0)+(md.lostD||0)>0.5?Math.max(1,(md.lastSold||0)*1.15,capM*0.95):Infinity,top=Math.max(md.price,Math.round(refPrice(md,s)*1.45/10)*10);
  // прибыль по странам: за границей из выручки вычитаем доставку
  const uc=unitCost(md,s),ship=shipCost(s),ck=techLv(s,'credit')?1.15:1,prof=p=>{const by=demandAll(s,{id:md.id,price:p}).by[md.id]||{};let q=0,v=0;for(const c in by){const d=by[c]*ck;q+=d;v+=d*(p*(1-DEALER_MARGIN)-(c===s.country?0:ship)-uc);}return q>lim?v*lim/q:v;};
  const exp=(md.soldBy&&md.lastSold)?1-(md.soldBy[s.country]||0)/md.lastSold:0,floor=Math.round((uc+exp*ship)/(1-DEALER_MARGIN)*1.06/10)*10,p0=prof(md.price);let best={price:md.price,v:p0};
  for(const k of [0.8,0.9,1.1,1.2,1.35,1.6]){const p=Math.max(20,floor,Math.min(top,Math.round(md.price*k/10)*10)),v=prof(p);if(v>best.v)best={price:p,v};}
  if(md.price<floor&&best.price<floor)best={price:floor,v:prof(floor)};
  const r={price:best.price,gain:best.price===md.price?0:(best.v-p0)/Math.max(Math.abs(p0),1),v:best.v};if(BP_CACHE.size>200)BP_CACHE.clear();BP_CACHE.set(key,r);return r;}
function helperOn(s){return !!(s.helper&&s.helper.on);}
function homeDemand(s){return s.models.filter(m=>m.status==='prod').reduce((a,m)=>a+(m.fc||0),0);}
// Лучший проект для КБ: детали самой продаваемой модели, потом прототипы
function suggestProject(s){const P=rdProjects(s);if(!P.length)return null;const top=s.models.filter(m=>m.status==='prod').sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0];
  const w={e:5,g:3,c:3,w:2,k:2,b:3};
  const mine=P.filter(p=>p.kind==='upg'&&top&&top[p.ck]===p.id).sort((a,b)=>(w[b.ck]||1)/b.need-(w[a.ck]||1)/a.need);
  return mine[0]||P.filter(p=>p.kind==='upg'&&p.mine)[0]||P.find(p=>p.kind==='early')||P[0];}
let TIPS=[];
function adviceList(s){
  const T=[],L=s.last,act=s.models.filter(m=>m.status==='prod'),dev=s.models.filter(m=>m.status==='dev'),lim=DIF().debt*cpi(s),home=s.country;
  const add=(p,icon,text,btn,run,tab)=>T.push({p,icon,text,btn,run,tab});
  if(s.over)return T;
  // деньги
  if(s.cash<0){const room=maxLoan(s)-s.loan,n=Math.max(0,Math.min(room,Math.ceil((-s.cash+3000*cpi(s))/1000)*1000));
    add(s.cash<-lim*0.5?100:90,'💰',`Касса в минусе на ${money(-s.cash)}${s.cash<-lim*0.5?`: при долге больше ${money(lim)} завод закроют`:''}. Возьмите кредит и сократите лишние расходы.`,n>0?`Кредит ${money(n)}`:null,n>0?()=>{G.loan+=n;G.cash+=n;addLog(`Взят кредит ${money(n)}.`);}:null,'plant');}
  if(!act.length&&!dev.length)add(95,'🛠','Сейчас нечего продавать. Придумайте машину: в конструкторе есть кнопка «Подобрать детали повыгоднее».','Конструктор',()=>openDesigner(),'models');
  // модели и цены
  act.forEach(md=>{const uc=unitCost(md,s),net=md.price*(1-DEALER_MARGIN),C=classCompare(md,s,home);
    if(net<uc*0.98&&(md.lastSold||0)>0){const np=Math.round(uc/(1-DEALER_MARGIN)*1.12/10)*10;add(85,'📉',`«${md.name}» продаётся в убыток: себестоимость ${money(uc)}, а вам с машины достаётся ${money(net)}.`,`Цена ${money(np)}`,()=>{md.price=np;},'models');}
    if(stockWarn(md)){const np=Math.max(20,Math.round(md.price*0.95/5)*5);add(70,'📦',`Машины «${md.name}» копятся на складе (${fmtN(md.stock)} шт.). Снизьте цену или выпуск.`,`Цена −5%`,()=>{md.price=np;},'models');}
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
function helperMonth(s){if(!helperOn(s)||s.over)return;const msg=[],act=s.models.filter(m=>m.status==='prod'),L=s.last,home=s.country;
  // кредит, если касса в минусе
  if(s.cash<0){const n=Math.max(0,Math.min(maxLoan(s)-s.loan,Math.ceil((-s.cash+3000*cpi(s))/1000)*1000));if(n>0){s.loan+=n;s.cash+=n;msg.push('взял кредит '+money(n));}}
  // цены — раз в квартал
  if(s.m%3===0)act.forEach(md=>{if(!(md.lastSold||md.lastDem))return;const bp=bestPriceFor(md,s);if(bp.gain>0.05&&bp.price!==md.price){md.price=bp.price;msg.push(`цена «${md.name}» ${money(bp.price)}`);}});
  const room=()=>s.cash-4000*cpi(s);
  // цеха
  // цеха: только если покупателей не хватает второй месяц подряд и в стране нет войны и кризиса
  if(L&&act.length&&!(s.capBuild||[]).length){const util=L.made/Math.max(1,capEff(s)),lost=act.reduce((a,m)=>a+(m.lostS||0),0),ok=util>0.9&&lost>Math.max(1,L.sold*0.05);s.helper.capN=ok?(s.helper.capN||0)+1:0;
    if(ok&&s.helper.capN>=2&&econ(s.y,s.m,home).f>=0.9){const n=Math.max(2,Math.round(s.cap*0.3)),c=n*capUnitCost(s);if(room()>c*1.5){s.cash-=c;s.plantVal+=c;s.capBuild.push({units:n,left:2});msg.push('заложил цех');s.helper.capN=0;}}}
  // склад
  if(L&&(L.dumpN>0||whStock(s)>whCap(s)*0.85)&&!(s.whBuild||[]).length){const n=Math.max(5,Math.round(whCap(s)*0.6)),c=n*whUnitCost(s);if(room()>c){s.cash-=c;s.plantVal+=c;s.whBuild=s.whBuild||[];s.whBuild.push({units:n,left:1});msg.push('расширил склад');}}
  // дилеры дома — в новых городах (не больше, чем городов)
  const mk=L&&L.mk[home],need=Math.round(dealerNeed(home,s)),have=dealerCount(s,home),dc=dealerCost(s);
  let add=0;if(mk&&(mk.lostDlr||0)>0.5)add=dealersShort(s,home);else if(act.length&&have<need*0.7)add=Math.max(1,Math.round((need*0.7-have)*0.25));
  add=Math.min(add,dealerRoom(s,home),Math.floor(room()/dc/2));if(add>0){s.cash-=add*dc;s.dealers[home]=have+add;msg.push(`+${add} ${plural(add,'дилер','дилера','дилеров')}`);}
  else if(dealerGrowSteps(s,home)>0&&room()>dealerGrowCost(s,home)*2&&dealerGrow(s,home))msg.push('салоны дилеров +25%');
  // экспорт — раз в полгода: импортёр, дилеры в больших городах, своё отделение и завод, когда окупятся
  if(s.m%6===2&&act.length){Object.keys(COUNTRIES).forEach(c=>{if(c===home)return;const lv=impLv(s,c),d=dealerCount(s,c),pot=marketPotential(s,c);
    if(!lv){if(pot>2&&room()>impCost(s,c,1)*2.5&&impUp(s,c))msg.push('импортёр: '+COUNTRIES[c].name);return;}
    if(lv<3&&impPayback(s,c)<(lv===1?18:24)&&room()>impCost(s,c,lv+1)*2&&impUp(s,c)){msg.push((lv===1?'отделение: ':'сборочный завод: ')+COUNTRIES[c].name);return;}
    const rm=dealerRoom(s,c);if(d&&rm>0&&d<dealerNeed(c,s)*0.5&&pot>d*dealerTP(s)*0.5&&room()>dc*4){const n=Math.min(rm,Math.max(1,Math.round(d*0.3)));s.cash-=n*dc;s.dealers[c]=d+n;}});}
  // КБ: проекты и рост
  while(rdActive(s).length<rdSlots(s)){const pj=suggestProject(s);if(!pj)break;s.rd.projs.push({...pj,prog:0});msg.push('КБ: '+pj.name);}
  if(s.rd.lvl<5&&room()>rdUpCost(s)*5){const c=rdUpCost(s);s.cash-=c;s.rd.lvl++;msg.push('КБ расширено');}
  // технологии завода
  if(!s.techBuild){const k=TECH_ORDER.find(k=>techOpen(s,k)&&room()>techCost(s,k)*2.5);if(k){const c=techCost(s,k);s.cash-=c;s.plantVal+=c*0.7;s.techBuild={k,left:techMonths(s,k)};msg.push('внедряет: '+techNext(s,k).name);}}
  // реклама — около 4% выручки
  if(L)s.ad=Math.round(Math.min(adRef(s)*0.8,Math.max(adRef(s)*0.15,(L.rev||0)*0.04))/10)*10;
  s.helperMsg={m:mi(s)+1,list:msg};if(msg.length)addLog('Помощник: '+msg.join('; ')+'.');}
