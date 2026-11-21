/* ================= 0.51, этап 4б: СВОЯ ЛИНИЯ ПОД МОДЕЛЬ =================
   Замечание автора (21 ноября): удивляет штраф конвейера за число моделей — «важен цех, а не всё производство».
   Раньше завод был одним общим конвейером: с движущимся конвейером каждая модель в серии сверх первой добавляла 12 % часов
   ВСЕМ машинам компании — и своим, и собранным на купленном заводе (его места сливались в общий s.cap).
   Теперь у модели может быть своя линия — места только для неё:
     • модель на своей линии не считается в штрафе общего конвейера и сама его не платит; чего линия не вместила — идёт
       на общий конвейер, и в штрафе считается только эта доля выпуска;
     • линия дороже обычного расширения (свои станки и оснастка под одну модель): ×1,5 цены места, на заводе с конвейером — ещё +30 %;
     • техника завода (станки, электричество, конвейер, литейка, пресс, контроль) действует и на ней; рабочие — общие;
     • купленный завод — своя линия его модели.
   Линии — «не самый интересный аспект игры» (автор), поэтому ведёт их помощник, ВСЕГДА — даже когда «Помощник управляющего»
   в настройках выключен: решает при запуске разработки (по окупаемости), расширяет, сокращает, переналаживает под другую
   модель, продаёт после простоя. Игрок не обязан нажимать ничего; в конструкторе есть одна необязательная кнопка «Иначе».
   Историческая опора переналадки — переход Ford с Model T на Model A в 1927 году: заводы стояли около полугода. */
const XL_COST=1.5,        // место на своей линии против места общего завода
  XL_CONV=0.3,            // на заводе с движущимся конвейером — ещё доля цены конвейера
  XL_PAY=36,              // помощник строит линию, если окупается быстрее (мес.)
  XL_RETOOL=0.3,          // переналадка под другую модель — доля цены линии
  XL_IDLE=6,              // простой до продажи (мес.)
  XL_SELL=0.4,            // продажа простаивающей линии — доля её цены (как цеха)
  XL_PEN=0.12,            // штраф общего конвейера за каждую модель сверх первой (hoursPerCar)
  XL_SHORT=6,             // мест не хватает столько месяцев подряд — расширять (всплеск спроса пережидают)
  XL_PAY_GROW=24,         // расширение — только если окупается быстрее (мес.)
  XL_LOW=0.4,XL_LOWM=12;  // загрузка ниже этой год подряд — лишние места продать
function xlK(s){return techMul(s,'cap')*(s.shifts>1?1.85:1)*bn('lineCap')*(convRebuild(s)?0.75:1)*techTroubleK(s);}   // как capEff на одно место
function xlOf(s,md){const L=s&&s.xl;if(!L||!L.length||!md)return null;const t=mi(s);for(let i=0;i<L.length;i++)if(L[i].md===md.id&&!(L[i].at>t))return L[i];return null;}
function xlEff(s,L){return L.cap*xlK(s);}
/* Штраф общего конвейера считается по тому, сколько моделей на нём собирают. Модель без линии — целая единица; модель со своей
   линией — та доля её выпуска, что линия не вместила и что идёт с общего конвейера (L.ov, 13-turn.js). Так линия, которая
   отстала от спроса, снимает штраф частично, а не «всё или ничего» (первый вариант — порог перелива — на замере семь лет
   подряд держал и линию, и полный штраф: растущая модель всё время обгоняла стройку). */
function xlW(s,m){const L=xlOf(s,m);return L?Math.min(1,Math.max(0,L.ov||0)):1;}
function xlCars(s,ex){return (s.models||[]).filter(m=>m.status==='prod'&&!isMoto(m)&&(!ex||m.id!==ex.id));}
function xlNEff(s,ex){return xlCars(s,ex).reduce((a,m)=>a+xlW(s,m),0);}
function xlFree(s,md){const L=xlOf(s,md);return L&&!(L.ov>0.02)?L:null;}
// выгода в месяц (в долларах часов), если линия модели вырастет с capU0 до capU1 машин в месяц при выпуске need.
// Часы считаются настоящей формулой (hoursPerCar) — с её нижней границей: на заводе, где машина уже собирается за наименьшее
// возможное время, штраф конвейера ничего не прибавляет, и линия ничего не сбережёт (первый расчёт «часы × штраф» этого не видел
// и в двадцатые годы строил линии на десятки миллионов без всякой выгоды).
function xlOvGain(s,md,need,capU0,capU1){if(!(need>0)||techLv(s,'line')!==2)return 0;const cars=xlCars(s,md),hrH=wageNow(s)/Math.max(1,hoursPerWorker(s)),vol=m=>Math.max(m.fc||0,m.lastMade||0);
  const W=cars.map(m=>({m,v:vol(m)*xlW(s,m)})).filter(o=>o.v>0),nOth=cars.reduce((a,m)=>a+xlW(s,m),0);
  const cost=ov=>{const P=xlPenK(nOth+ov);return W.reduce((a,o)=>a+o.v*hoursPerCar(o.m,s,P),0)+need*hoursPerCar(md,s,1+ov*(P-1));};
  return (cost(clamp(1-capU0/need,0,1))-cost(clamp(1-capU1/need,0,1)))*hrH;}
// цена всех линий в стоимости завода (у линии она стареет, как весь завод: −0,5 % в месяц)
function xlVal(s){return (s.xl||[]).reduce((a,L)=>a+(L.val||0),0);}
function xlUnitCost(s){return Math.round(capUnitCost(s)*XL_COST*(techLv(s,'line')===2?1+XL_CONV:1));}
function xlReserve(s){const L=s.last,fixed=L?(L.wage||0)+(L.ovh||0)+(L.dlr||0)+(L.ad||0)+(L.rd||0)+(L.int||0)+(L.team||0)+(L.drv||0):2000*cpi(s);return Math.max(3000*cpi(s),fixed*2);}
// автомобильные модели на общем конвейере (без модели ex)
function xlCommon(s,ex){return (s.models||[]).filter(m=>m.status==='prod'&&!isMoto(m)&&!xlFree(s,m)&&(!ex||m.id!==ex.id));}
function xlPenK(n){return n>1?1+XL_PEN*(n-1):1;}
/* Решение помощника: общий конвейер или своя линия. fc — прогноз выпуска модели в месяц.
   Выгода линии — часы, которые перестают теряться на общем конвейере (у остальных моделей и у самой модели), минус содержание
   лишних стен (0,9 % цены в месяц, как у всего завода). Цена — линия минус то, что всё равно пришлось бы достроить общему заводу.
   Правила помощника (замер ботовой партией, журнал этапа 4б):
     • главная модель завода (больше всех мест) остаётся на общем конвейере — линии строят остальным: штраф считается по числу
       моделей, и убрать с конвейера дешевле всего самую малую;
     • линия должна окупиться не позже чем за три года и не позже половины срока, что модели осталось в серии (около шести лет),
       считая время стройки; под модель, что в серии больше пяти лет, линию не строят вовсе;
     • новая модель того же вида и класса, что и модель в серии, — её смена: два года после запуска линию ей не строят
       (линию предшественницы она наследует переналадкой, а на общем конвейере займёт её место);
     • простаивает готовая линия (модель снята, купленный завод) — её переналаживают вместо стройки. */
const XL_OLD=60,XL_HEIR=24,XL_LIFE=72;
// срок, за который линия должна окупиться: не дольше трёх лет и не дольше половины того, что модели осталось в серии
// (модель живёт около шести лет), минус время стройки — пока строят, линия не работает
function xlLimit(s,md,build){const age=md.status==='prod'?mi(s)-(md.launched||0):0;return Math.min(XL_PAY,(XL_LIFE-age)/2)-(build||0);}
function xlNeed(s,m){return Math.max(m.fc||0,m.lastMade||0)*placesOf(m,s);}
function xlMain(s,md,fc){const mine=fc*placesOf(md,s);return !(s.models||[]).some(m=>m.status==='prod'&&!isMoto(m)&&m.id!==md.id&&xlNeed(s,m)>mine);}
function xlIdle(s,need,md){const t=mi(s),F=(s.xl||[]).filter(L=>L.md==null&&!(L.at>t)&&xlEff(s,L)>=need*0.3&&(L.keep==null||(md&&L.keep===md.id)));if(!F.length)return null;   // L.keep — линия ждёт смену своей модели из КБ
  const big=F.filter(L=>xlEff(s,L)>=need).sort((a,b)=>a.cap-b.cap)[0];return big||F.sort((a,b)=>b.cap-a.cap)[0];}
function xlDecide(s,md,fc){const mo=isMoto(md),conv=techLv(s,'line')===2,cx=placesOf(md,s),kk=Math.max(0.05,xlK(s)),n=Math.max(2,Math.ceil(Math.max(1,fc)*1.15*cx/kk)),cost=n*xlUnitCost(s);
  const out={own:false,n,cost,payM:Infinity,save:0,fc,why:'',alt:0};
  if(mo){out.why='moto';return out;}if(globalThis.XLOFF){out.why='nopay';return out;}   // XLOFF — замер «без линий» (ford51.js)
  if(!(fc>=1)){out.why=conv?'nopay':'noconv';return out;}
  const oth=xlCars(s,md),vol=m=>Math.max(m.fc||0,m.lastMade||0),nOth=oth.reduce((a,m)=>a+xlW(s,m),0),main=xlMain(s,md,fc);
  out.save=xlOvGain(s,md,fc,0,fc);   // часы, которые перестанут теряться на общем конвейере (у соседей и у самой модели)
  // сколько мест общему заводу всё равно пришлось бы достроить под эту модель
  const used=oth.reduce((a,m)=>a+vol(m)*placesOf(m,s)*xlW(s,m),0)+xlMotoUse(s),free=Math.max(0,capEff(s)-used),short=Math.max(0,fc*cx-free),alt=Math.ceil(short/kk)*capUnitCost(s);out.alt=alt;
  const I=xlIdle(s,fc*cx,md);
  if(I){const nI=Math.min(I.cap,n),sv=main?0:xlOvGain(s,md,fc,0,nI*kk/cx),capV=Math.min(alt,nI*capUnitCost(s));   // линия мала — снимет штраф частично, зато не надо строить цех
    const c=Math.round(I.val*nI/I.cap*XL_RETOOL),net=sv+capV/XL_PAY;   // переналаживают столько мест, сколько модели нужно; остальные ждут другую или продаются
    if(net>0&&c/net<=xlLimit(s,md,1)&&s.cash-c>=xlReserve(s)){out.own=true;out.reuse=I.id;out.n=nI;out.cost=c;out.payM=c/net;return out;}}
  if(!conv){out.why='noconv';return out;}
  if(!(nOth>0.02)){out.why='alone';return out;}
  if(main){out.why='main';return out;}
  const age=md.status==='prod'?mi(s)-(md.launched||0):0;if(age>XL_OLD){out.why='old';return out;}
  if(age<XL_HEIR){const kOf=m=>{try{return designKind(m);}catch(_){return segOf(m);}},g=kOf(md),P=(s.models||[]).find(m=>m.status==='prod'&&m.id!==md.id&&!isMoto(m)&&kOf(m)===g&&(md.status!=='prod'||(m.launched||0)<(md.launched||0)));
    if(P){out.why=(s.xl||[]).some(L=>L.md===P.id)?'heir':'succ';out.heir=P.name;return out;}}
  const extra=Math.max(0,cost-alt),net=out.save-extra*0.009;
  if(net<=0){out.why='nopay';return out;}out.payM=extra/net;
  if(out.payM>xlLimit(s,md,md.status==='prod'?capMonths(s,n):0)){out.why='slow';return out;}
  if(s.cash-cost<xlReserve(s)){out.why='cash';return out;}
  out.own=true;return out;}
function xlMotoUse(s){return (s.models||[]).filter(m=>m.status==='prod'&&isMoto(m)).reduce((a,m)=>a+Math.max(m.fc||0,m.lastMade||0)*placesOf(m,s),0);}
function xlPayTxt(m){return m<=1?'за месяц':m<12?`за ${Math.round(m)} мес.`:`за ${(m/12).toFixed(1).replace('.',',').replace(',0','')} ${m<18?'год':m<54?'года':'лет'}`;}
function xlWhyTxt(D){return D.own?`${D.reuse?'Свободная линия — переналадка':'Своя линия'} · ${money(D.cost)} · окупится ${xlPayTxt(D.payM)}`:'На общий конвейер: '+({moto:'мотоциклы собирают в общих цехах',noconv:'движущегося конвейера ещё нет — модели друг другу не мешают',alone:'других автомобилей на конвейере нет',main:'главная модель завода остаётся на нём — линии строят остальным',old:'модель в серии больше пяти лет — линию под неё не строят',heir:`линию унаследует от «${D.heir||''}», когда ту снимут`,succ:`она сменяет «${D.heir||''}» — место ей на общем конвейере`,nopay:'своя линия не окупится',slow:`своя линия окупится только ${xlPayTxt(D.payM)}`,cash:`на свою линию (${money(D.cost)}) не хватает кассы`}[D.why]||'своя линия не окупится');}
// заказ линии: строится за полгода-год (как цех); цена — в стоимость завода
function xlBuild(s,md,n){n=Math.max(2,Math.round(n));const c=n*xlUnitCost(s);if(s.cash<c)return null;s.cash-=c;s.plantVal+=c;s.xl=s.xl||[];s.xlId=(s.xlId||0)+1;
  const L={id:s.xlId,md:md.id,cap:n,val:c,at:mi(s)+Math.max(1,Math.min(capMonths(s,n),md.status==='dev'?Math.max(1,md.devLeft||1):99)),idle:0,src:'own'};s.xl.push(L);return L;}
// решение помощника — в дело: стройка или переналадка свободной линии (месяц освоения, если модель уже в серии)
function xlTake(s,md,D){if(!D.reuse)return xlBuild(s,md,D.n);let L=(s.xl||[]).find(x=>x.id===D.reuse);if(!L||L.md!=null||s.cash<D.cost)return null;
  if(D.n<L.cap*0.8){const v=Math.round(L.val*D.n/L.cap);s.xlId=(s.xlId||0)+1;const N={id:s.xlId,md:null,cap:D.n,val:v,at:0,idle:0,src:L.src,h:L.h};L.cap-=D.n;L.val-=v;s.xl.push(N);L=N;}   // большая линия — берём часть
  s.cash-=D.cost;L.md=md.id;L.keep=null;L.idle=0;L.low=0;L.short=0;if(md.status==='prod')md.ramp=Math.max(md.ramp||0,1);return L;}
// запуск разработки без конструктора (боты, проверки) — то же решение помощника
function xlAtStart(s,m){let fc=0;try{fc=forecastDemand({...m,status:'prod'},s);}catch(_){}const D=xlDecide(s,m,fc);if(D.own)D.L=xlTake(s,m,D);return D;}
// расширение линии (помощник или кнопка совета)
function xlGrow(s,L,add,c){if(!L||L.grow||s.cash<c)return false;s.cash-=c;s.plantVal+=c;L.val+=c;L.grow={n:add,at:mi(s)+capMonths(s,add)};L.short=0;L.want=null;return true;}
// модель на линию без стройки (купленный завод)
function xlAdopt(s,cap,mdId,h){s.xl=s.xl||[];s.xlId=(s.xlId||0)+1;const L={id:s.xlId,md:mdId==null?null:mdId,cap:Math.max(1,Math.round(cap)),val:Math.round(cap*capUnitCost(s)*0.5),at:0,idle:0,src:'hold',h:h||''};s.xl.push(L);return L;}
/* Старые сохранения: места купленных заводов сливались в общий s.cap — выделяем их в свои линии (решение автора 21 ноября).
   Только там, где модель купленной марки — автомобиль и ещё в серии: иначе места остаются общему заводу. */
function xlMigrate(s){if(!s||s.xlV)return;s.xlV=1;s.xl=s.xl||[];(s.hold||[]).forEach(h=>{if(h.mode!=='int'||!(h.capAdd>0)||h.xl||h.model==null)return;
    const md=(s.models||[]).find(m=>m.id===h.model&&m.status==='prod'&&!isMoto(m));if(!md)return;const n=Math.min(h.capAdd,Math.max(0,s.cap-3));if(n<1)return;
    const v=Math.round((s.plantVal||0)*n/Math.max(1,s.cap));s.cap-=n;const L=xlAdopt(s,n,md.id,h.n||'');L.val=v;h.xl=L.id;});}   // цена линии — её доля в нынешней стоимости завода
/* ---------- месяц линий: ведёт помощник, всегда ---------- */
function linesMonth(s,r){if(!s||s.mode==='racer')return;xlMigrate(s);const X=s.xl=s.xl||[],t=mi(s),msg=r.lines=[];s.xlMsg={m:t+1,list:msg};if(!X.length&&techLv(s,'line')!==2)return;
  const prod=id=>(s.models||[]).find(m=>m.id===id),name=m=>`«${m.name}»`,kOf=m=>{try{return designKind(m);}catch(_){return segOf(m);}},cashOk=c=>s.cash-c>=xlReserve(s);   // касса после оплаты — не ниже резерва помощника (два месяца постоянных расходов)
  X.forEach(L=>{const md=L.md!=null?prod(L.md):null;L.val*=0.995;
    if(md&&(md.status==='prod'||md.status==='dev')){L.idle=0;
      if(L.at===t)msg.push(`${name(md)} — своя линия готова: ${fmtN(Math.round(xlEff(s,L)/Math.max(0.01,placesOf(md,s))))} машин в месяц`);
      // мест не хватает полгода подряд — расширить с запасом в пятую часть, если окупается за два года: уходит штраф за ту долю
      // выпуска, что шла с общего конвейера, а если и общий завод полон — продаются машины, которых не хватало.
      // Всплеск спроса помощник пережидает: линию под пик не строят.
      if(md.status==='prod'&&!(L.at>t)&&!L.grow){const cx=placesOf(md,s),capU=xlEff(s,L)/cx,need=(md.fc||0)*1.05;L.short=need>capU*1.05?(L.short||0)+1:0;L.want=null;
        if(L.short>=XL_SHORT&&!xlMain(s,md,need)){const add=Math.max(2,Math.ceil((need*1.2-capU)*cx/Math.max(0.05,xlK(s)))),c=add*xlUnitCost(s),addU=add*xlK(s)/cx,kC=(s.last&&s.last.bneck&&s.last.bneck.cap)||1;
          const gain=xlOvGain(s,md,need,capU,capU+addU)+Math.min(need-capU,addU)*(1-kC)*Math.max(0,md.price*(1-dMargin(s))-unitCost(md,s))-c*0.009;
          if(gain>0&&c/gain<=Math.min(XL_PAY_GROW,xlLimit(s,md,capMonths(s,add)))){const u=Math.max(1,Math.round(addU));if(cashOk(c)){xlGrow(s,L,add,c);msg.push(`линия ${name(md)}: +${fmtN(u)} машин в месяц, ${money(c)}, окупится ${xlPayTxt(c/gain)}`);}else L.want={add,c,u,pay:c/gain};}}}
      if(L.grow&&t>=L.grow.at){L.cap+=L.grow.n;L.grow=null;}
      return;}
    if(L.at>t)return;L.idle=(L.idle||0)+1;L.grow=null;L.want=null;L.ov=0;   // модель снята — линия свободна
    // смена той же модели (тот же вид и класс) ещё в КБ или только что в серии — линия ждёт её
    if(L.md!=null&&md){const k=kOf(md),h=(s.models||[]).find(m=>m.id!==md.id&&!isMoto(m)&&(m.status==='dev'||(m.status==='prod'&&t-(m.launched||0)<=3))&&kOf(m)===k&&!X.some(q=>q.md===m.id));L.keep=h?h.id:null;}
    else if(L.keep!=null){const h=prod(L.keep);if(!h||!(h.status==='dev'||(h.status==='prod'&&t-(h.launched||0)<=3)))L.keep=null;}
    L.md=null;});
  // свободную линию — под модель общего конвейера, которой это выгоднее всего
  if(X.some(L=>L.md==null&&!(L.at>t))){xlCommon(s).filter(m=>!X.some(L=>L.md===m.id)).map(m=>({m,fc:Math.max(m.fc||0,m.lastMade||0)})).filter(o=>o.fc>=1).sort((a,b)=>b.fc-a.fc).forEach(o=>{const D=xlDecide(s,o.m,o.fc);
      if(D.own&&D.reuse&&xlTake(s,o.m,D))msg.push(`свободную линию переналадил под ${name(o.m)}: ${money(D.cost)}, месяц освоения, окупится ${xlPayTxt(D.payM)}`);});}
  // простой: продать через полгода — если в КБ нет автомобиля, которому линия может пригодиться
  const devCar=(s.models||[]).some(m=>m.status==='dev'&&!isMoto(m)&&!X.some(L=>L.md===m.id));
  for(let i=X.length-1;i>=0;i--){const L=X[i];if(L.md!=null||L.at>t)continue;if(devCar)L.idle=Math.min(L.idle,XL_IDLE-1);
    if(L.idle>=XL_IDLE){const v=Math.round(L.val*XL_SELL);s.cash+=v;s.plantVal=Math.max(0,s.plantVal-L.val);X.splice(i,1);msg.push(`простаивающую линию${L.src==='hold'&&L.h?` (завод «${L.h}»)`:''} продал за ${money(v)}`);}}
  // модель с общего конвейера — на свою линию, когда это окупается (раз в квартал, не больше одной стройки сразу)
  if(s.m%3===1&&techLv(s,'line')===2&&!X.some(L=>L.at>t)){const C=xlCommon(s);if(C.length>1){const best=C.filter(m=>!m.xlNo&&t-(m.launched||0)>=6&&!X.some(L=>L.md===m.id)).map(m=>({m,D:xlDecide(s,m,Math.max(m.fc||0,m.lastMade||0))})).filter(o=>o.D.own&&!o.D.reuse).sort((a,b)=>a.D.payM-b.D.payM)[0];
      if(best){const L=xlBuild(s,best.m,best.D.n);if(L)msg.push(`${name(best.m)} — на свою линию: ${money(best.D.cost)}, окупится ${xlPayTxt(best.D.payM)}`);}}}
  // линия год загружена меньше чем на 40 %: если штраф общего конвейера меньше её содержания — модель обратно на конвейер;
  // иначе лишние места продаются (как цеха — за 40 % цены), остаётся запас в 30 %
  X.forEach(L=>{const md=L.md!=null?prod(L.md):null;if(!md||md.status!=='prod'||L.at>t||L.grow)return;const fc=Math.max(md.fc||0,md.lastMade||0),needP=fc*placesOf(md,s),use=needP/Math.max(1,xlEff(s,L));L.low=use<XL_LOW?(L.low||0)+1:0;
    if(L.low<XL_LOWM)return;L.low=0;
    const keep=Math.min(L.cap,Math.max(2,Math.ceil(needP*1.3/Math.max(0.05,xlK(s))))),cut=L.cap-keep;
    if(L.src!=='hold'&&xlDecide(s,md,fc).save<L.val*keep/L.cap*0.009){L.md=null;L.idle=XL_IDLE-1;L.ov=0;msg.push(`${name(md)} вернул на общий конвейер: линия загружена меньше чем на ${Math.round(XL_LOW*100)}%, а штраф конвейера меньше её содержания`);return;}
    if(cut<Math.max(2,L.cap*0.2))return;
    const vv=L.val*cut/L.cap,v=Math.round(vv*XL_SELL);s.cash+=v;s.plantVal=Math.max(0,s.plantVal-vv);L.val-=vv;L.cap=keep;msg.push(`линия ${name(md)} велика: лишние места продал за ${money(v)}`);});
  if(msg.length){addLog('Линии завода: '+msg.join('; ')+'.','hist');}}
/* ---------- что показать игроку ---------- */
function xlLoad(s,L){const md=L.md!=null?(s.models||[]).find(m=>m.id===L.md):null;if(!md||md.status!=='prod')return 0;return clamp((md.lastMade||0)*placesOf(md,s)/Math.max(1,xlEff(s,L)),0,1);}
// строка в карточке модели — только для сведения
function xlModelLine(s,md){const L=(s.xl||[]).find(x=>x.md===md.id);if(!L)return '';const t=mi(s);
  return `<p class="small muted" style="margin-top:4px">🏭 ${L.src==='hold'?`Завод «${esc(L.h||'купленной марки')}»`:'Своя линия'}: ${L.at>t?`строится, готова через ${L.at-t} мес.`:`${fmtN(Math.round(xlEff(s,L)/Math.max(0.01,placesOf(md,s))))} машин в месяц, загрузка ${pct(xlLoad(s,L),0)}`} · ${L.ov>0.05&&!(L.at>t)?`линия мала: ${pct(L.ov,0)} машин идёт с общего конвейера`+(L.grow?', расширяется':''):'штрафа общего конвейера нет'}. Линию ведёт помощник.</p>`;}
// строка «Свои линии» в «Заводе»
function xlPlantHTML(s){const X=s.xl||[];if(!X.length)return '';const t=mi(s);
  return `<div class="tech-row"><div class="row"><div><h3>Свои линии под модели</h3><p class="small muted">Места только для одной модели: она не мешает общему конвейеру и сама не платит его штраф. Строит, расширяет, переналаживает и продаёт линии помощник.</p></div><span class="pill muted">${X.length}</span></div>
    ${X.map(L=>{const md=L.md!=null?s.models.find(m=>m.id===L.md):null;return `<p class="small" style="margin-top:4px">${L.src==='hold'?'🏬':'🏭'} <b>${md?esc(md.name):'простаивает'}</b>${L.src==='hold'?` · завод «${esc(L.h||'')}»`:''} · ${md?`до ${fmtN(Math.round(xlEff(s,L)/Math.max(0.01,placesOf(md,s))))} машин в месяц`:`${fmtN(L.cap)} мест`} · ${L.at>t?`строится, ${L.at-t} мес.`:md&&md.status==='prod'?`загрузка ${pct(xlLoad(s,L),0)}`:md?'ждёт модель из КБ':`простой ${L.idle||0} мес. из ${XL_IDLE}`}${L.grow?` · расширяется (+${fmtN(L.grow.n)})`:''}</p>`;}).join('')}</div>`;}
// конструктор: одна строка с решением помощника и необязательная кнопка «Иначе»
function xlDraftDecide(s,d){const md=designMd(s,d);let fc=0;try{fc=forecastDemand({...md,price:md.price||Math.round(refPrice(md,s)/10)*10},s);}catch(_){}const D=xlDecide(s,{...md,status:'dev'},fc);D.auto=D.own;   // линия строится, пока модель в КБ
  if(d.xlOv){D.own=!D.auto;if(D.own&&(isMoto(md)||s.cash-D.cost-devCost(md,s)<0))D.own=false;}return D;}
function xlDraftHTML(s,d){if(isMoto(designMd(s,d))||techLv(s,'line')!==2)return '';const D=xlDraftDecide(s,d),own=D.own;
  const txt=d.xlOv?(own?`Своя линия · ${money(D.cost)} — по вашему решению${isFinite(D.payM)?` (окупится ${xlPayTxt(D.payM)})`:' (помощник считает, что не окупится)'}`:'На общий конвейер — по вашему решению'):xlWhyTxt(D);
  return `<p class="small" style="margin-top:8px">🏭 <b>Где собирать:</b> ${txt.replace(/\.$/,'')}. <button class="link" data-act="dxl">Иначе</button></p>`;}
