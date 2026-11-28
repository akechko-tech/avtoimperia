/* ================= 0.51, этап 6: ИСПЫТАНИЯ ВЕДОМСТВ =================
   Автор (тема 7 ТЗ): «в авиации образец должен себя показать, а грузовики и мотоциклы берут по цене и стандартному качеству;
   если в истории были испытания — нужен пробный заезд и показ». До этого этапа армия покупала военную технику игрока без всяких
   испытаний, а заказ военного министерства на грузовики был обычным торгом по цене.
   Теперь там, где испытания были в истории, заказ и право продажи дают они:
     • конкурсы по календарю — субсидийные грузовики Германии (1908–1913), военный конкурс Франции (1905–1913), субсидийные
       испытания Британии (1912–1914), пробег военного ведомства России (1911–1913), состязания тракторов в Виннипеге (1908–1913):
       запись за четыре месяца, пробег считают по машине (надёжность, груз, ход, расход), участвуют марки страны;
       победителю — заказ и свидетельство, призёрам — свидетельство;
     • свидетельство субсидийного грузовика: покупателю такой машины казна доплачивает — без свидетельства грузовик в эти годы
       продаётся хуже (доплату получают покупатели соперников);
     • приёмка на полигоне — по заявке игрока: штабную и санитарную машины, бронеавтомобиль и танк армия в мирное время
       закупает только после испытаний (в войну берёт всё); свидетельство — на пять лет;
     • станция испытаний тракторов (США, с 1920 года, закон Небраски): итог печатают — хороший помогает продажам, без итога
       и со слабым итогом трактор продаётся хуже.
   Прочие заказы (почта, пивоварни, такси, города) — прежним торгом. Образцы и источники — claude/issledovanie-rekordy-ispytaniya-0.51.md.
   0.60, правка автора 23 ноября: «испытания ведомств — пусть подсказывает помощник, пусть хороший результат даёт рост в продажах
   и заказы». Хороший итог (100 и выше — не хуже образца года) теперь виден в деньгах: трактор с сильным протоколом продаётся
   заметно лучше (до +35 % к привлекательности, было до +20 %) и получает заказ кооперативов; принятую армией машину с итогом выше
   образца армия берёт охотнее и сразу заказывает первую партию. Совет об испытаниях стоит высоко в «Делах» и говорит, что даст
   итог; помощник управляющего отправляет машины на испытания сам. Взнос больше не растёт с оборотом без предела. */
const TRIALS=[
  {id:'de-sub',c:'de',y0:1908,y1:1913,m:8,grp:'truck',sub:0.3,order:[20,60],n:'Испытания субсидийных грузовиков',who:'Военное министерство Пруссии',
    hist:'С 1908 года прусское военное министерство доплачивает покупателю грузовика одобренного образца — при покупке и ещё пять лет — за право призвать машину в войну.'},
  {id:'fr-mil',c:'fr',y0:1905,y1:1913,m:9,grp:'truck',sub:0.15,subY:1910,order:[15,50],n:'Военный конкурс грузовиков',who:'Автомобильный клуб Франции и военное министерство',
    hist:'С 1905 года Автомобильный клуб Франции каждый год испытывает машины для армии; призы платит военное министерство, а с 1910 года покупатель премированного грузовика получает доплату.'},
  {id:'uk-sub',c:'uk',y0:1912,y1:1914,m:5,grp:'truck',sub:0.05,order:[15,40],n:'Субсидийные испытания',who:'Военное министерство Британии',
    hist:'Требования к субсидийному грузовику вышли в 1912 году; тогда же прошли первые испытания — свидетельства получил Leyland в классах три тонны и тридцать центнеров.'},
  {id:'ru-run',c:'ru',y0:1911,y1:1913,m:8,grp:'truck',sub:0,order:[10,40],buyAll:1,n:'Испытательный пробег военного ведомства',who:'Военное министерство России',
    hist:'В 1912 году 43 машины прошли Петербург — Псков — Минск — Смоленск — Москва — Петербург. Осенью испытывали грузовики: каждую машину, дошедшую до конца, казна покупала, лучшим маркам обещали заказы.'},
  {id:'wpg',c:'us',y0:1908,y1:1913,m:6,grp:'farm',sub:0,order:[20,60],n:'Состязания тракторов в Виннипеге',who:'Виннипегская выставка',
    hist:'На выставке в Виннипеге тракторы пахали наперегонки перед судьями: считали гектары, топливо и поломки. Победителей знали фермеры всей прерии.'}];
const TR_CERT_M=60,TR_SUB_M=48,TR_OPEN=4,TR_RETEST=6,TR_NEB_Y=1920,
  TR_PASS=0.85;   // приёмка на полигоне: не хуже 85 % образца года (образец каждый год улучшается; машина «как у всех пять лет назад» не пройдёт)
const TR_GRP={truck:{kinds:['truck','semi'],n:'грузовик',use:'haul'},farm:{kinds:['tractor','crawler'],n:'трактор',use:'plough'}};
function trKind(md){try{return bodyKind(byId(BODIES,md.b));}catch(_){return '';}}
function trMil(md){const k=trKind(md);for(const u of TUSE){const U=TRUCK_USE[u];if(U.grp==='mil'&&U.kinds.includes(k))return u;}return null;}
function trCertS(md,c,k,s){const C=md&&md.cert&&md.cert[c+':'+k];return C&&C.until>mi(s)?C:null;}
function trSet(md,c,k,o,s){md.cert=md.cert||{};md.cert[c+':'+k]=Object.assign({until:mi(s)+(k==='sub'?TR_SUB_M:TR_CERT_M),y:s.y},o);}
// мерка машины на испытаниях против эталона своего вида: надёжность, груз, ход, расход, простота
function trScore(md,grp,c,s){const y=s.y;let ch,rf;try{ch=charOf(md,y);rf=charOf(rivalRef(md,y).md,y);}catch(_){return 0;}
  if(grp==='farm'){try{const P=refPrice(md,s),a=truckCost(md,'plough',c,s,P).cpk,b=truckCost(rivalRef(md,y).md,'plough',c,s,P).cpk;return clamp(Math.pow(b/Math.max(1e-9,a),0.7)*Math.pow(ch.mtbf/Math.max(0.1,rf.mtbf),0.3),0.2,3);}catch(_){return 0;}}
  if(grp==='mil'){const u=trMil(md);if(!u)return 0;const U=TRUCK_USE[u];return clamp(jobScore(U,ch)/Math.max(1e-9,jobScore(U,rf))*Math.pow(ch.mtbf/Math.max(0.1,rf.mtbf),0.25),0.2,3);}
  const r=(a,b)=>Math.log(Math.max(0.05,a)/Math.max(0.05,b));
  return clamp(Math.exp(0.45*r(ch.mtbf,rf.mtbf)+0.2*r(ch.cap,rf.cap)+0.15*r(ch.vT||15,rf.vT||15)-0.12*r(ch.fuel,rf.fuel)+0.08*r(ch.ease,rf.ease)),0.2,3);}
function trBreakP(md,s){let ch,rf;try{ch=charOf(md,s.y);rf=charOf(rivalRef(md,s.y).md,s.y);}catch(_){return 0.3;}return clamp(0.3*rf.mtbf/Math.max(0.1,ch.mtbf),0.04,0.75);}
function trModels(s,grp){const K=TR_GRP[grp].kinds;return (s.models||[]).filter(m=>(m.status==='prod'||m.status==='sale')&&!isMoto(m)&&K.includes(trKind(m)));}
function trBest(s,grp,c){return trModels(s,grp).map(m=>({m,sc:trScore(m,grp,c,s)})).sort((a,b)=>b.sc-a.sc)[0]||null;}
function trSells(s,c){return c===s.country||dealerCount(s,c)>0;}
const TR_FEE_MAX=5000;   // взнос — дорога, механики и топливо: у большой фирмы не больше этого (в ценах 1895 года; было 0,02 % оборота без предела — $346 тыс. у «Форда» 1928 года)
function trFee(s,T){return Math.round(Math.max(500*cpi(s),Math.min(TR_FEE_MAX*cpi(s),bizRev(s)*0.0002))/50)*50;}
// когда конкурс этого года; открыт ли он для записи
function trWhen(T,y){return (y-1895)*12+T.m;}
function trOpenList(s){const t=mi(s),out=[];TRIALS.forEach(T=>{if(s.y<T.y0||s.y>T.y1||!trSells(s,T.c))return;const at=trWhen(T,s.y);if(t>=at||at-t>TR_OPEN)return;const key=T.id+'|'+s.y,E=(s.trials&&s.trials.ent||{})[key];
    out.push({T,at,key,ent:E||null,best:trBest(s,T.grp,T.c),fee:trFee(s,T)});});return out;}
// 0.60, правки 28.11: конкурсы, запись на которые откроется в ближайшие n месяцев (для совета заранее и карточки)
function trSoonList(s,n){const t=mi(s),out=[];TRIALS.forEach(T=>{if(!trSells(s,T.c))return;for(const y of [s.y,s.y+1]){if(y<T.y0||y>T.y1)continue;const at=trWhen(T,y);if(at-t<=TR_OPEN||at-t>TR_OPEN+n)continue;out.push({T,y,at,best:trBest(s,T.grp,T.c)});break;}});return out.sort((a,b)=>a.at-b.at);}
function trialEnter(s,id,mdId){const o=trOpenList(s).find(x=>x.T.id===id);if(!o||o.ent)return false;const md=mdId!=null?s.models.find(m=>m.id===mdId):o.best&&o.best.m;if(!md||s.cash<o.fee)return false;
  s.cash-=o.fee;s.trials=s.trials||{};(s.trials.ent=s.trials.ent||{})[o.key]={md:md.id,fee:o.fee};addLog(`«${md.name}» заявлена: ${o.T.n} (${COUNTRIES[o.T.c].name}), ${MONTHS[o.T.m]} ${s.y}. Взнос ${money(o.fee)}.`);return true;}
// соперники на конкурсе: марки страны (их сила — эталон вида и ход фирмы, если он есть)
function trRivals(s,T){const out=[],c=T.c;
  if(T.grp==='farm'){const F=typeof farmGet==='function'?farmGet(s,c):null;[F?F.n:farmName(s,c),'Hart-Parr','Rumely','Case'].slice(0,3).forEach((n,i)=>out.push({n,k:i===0&&F?Math.exp(firmDq(F,'farm',mi(s))*0.5):1}));}
  else{let L=[];try{L=topRivals(c,'truck',s,3);}catch(_){}L.forEach(cp=>{const i=(COMPS[c]||[]).indexOf(cp),F=typeof firmGet==='function'?firmGet(s,c,i):null;out.push({n:compName(cp,s),k:F?Math.exp(firmDq(F,'truck',mi(s))*0.5):1});});
    while(out.length<3)out.push({n:['завод из провинции','мастерская инженера','заграничная марка'][out.length],k:0.92});}
  return out.map(o=>{const brk=Math.random()<0.3;return {n:o.n,sc:o.k*Math.exp((Math.random()+Math.random()-1)*0.1)*(brk?0.85:1)*DIF().race**0.3,brk};});}
function trialRun(s,T,E){const md=s.models.find(m=>m.id===E.md);const key=T.id+'|'+s.y;if(!md||!(md.status==='prod'||md.status==='sale')){addLog(`${T.n}: заявленной модели больше нет в серии — заявка снята.`,'bad');return null;}
  const sc0=trScore(md,T.grp,T.c,s),brk=Math.random()<trBreakP(md,s),me={n:`«${md.name}»`,sc:sc0*Math.exp((Math.random()+Math.random()-1)*0.06)*(brk?0.82:1),brk,you:1};
  const L=[me,...trRivals(s,T)].sort((a,b)=>b.sc-a.sc),place=L.indexOf(me)+1,top=L[0].sc,scale=(1+trTierOf(s)/10)*(T.c==='us'?1.8:1),t=mi(s);
  const pass=place<=3&&me.sc>=top*0.88,price=Math.round(refPrice(md,s)*1.05/10)*10;let n=0;
  if(place===1)n=Math.round((T.order[0]+Math.random()*(T.order[1]-T.order[0]))*scale);else if(pass)n=Math.round(T.order[0]*scale*0.5);else if(T.buyAll&&!brk)n=1;
  if(pass){trSet(md,T.c,'sub',{place,sc:+me.sc.toFixed(2)},s);s.rep=clamp(s.rep+(place===1?2:1),0,100);}
  if(n>0){s.orders=s.orders||[];s.orders.push({id:'tr-'+key,md:md.id,n,left:n,price,due:t+8,who:T.who,start:t});}
  if(place===1)try{trophyAdd(s,{kind:'record',title:`${T.n}: первое место`,sub:`«${md.name}» · ${COUNTRIES[T.c].name}, ${s.y}`,story:T.hist,key:'tr|'+key});}catch(_){}
  const tab=L.map((o,i)=>`${i+1}. ${o.n} — ${Math.round(o.sc*100)}${o.brk?' (поломка в пути)':''}`).join('\n'),sub=trSubOn(T,s.y)?` Покупателям «${md.name}» казна теперь доплачивает — до ${1895+Math.floor((t+TR_SUB_M)/12)} года.`:'';
  pushEvent({own:1,noArt:1,carId:md.id,kicker:'Испытания ведомства',title:`${T.n}: ${place===1?'первое место':pass?place+'-е место, свидетельство получено':brk?'поломка в пути':place+'-е место'}`,deck:`${COUNTRIES[T.c].name} · «${md.name}»`,
    text:`${T.who} подвело итог (100 — образец года):\n${tab}\n${place===1?`Победа: заказ на ${fmtN(n)} машин по ${money(price)} и свидетельство.${sub}`:pass?`Свидетельство получено${n?`, заказ на ${fmtN(n)} машин по ${money(price)}`:''}.${sub}`:brk?`«${md.name}» встала в пути — судьи это записали.${n?'':' Свидетельства нет.'}`:`Свидетельства нет: до призёров не хватило.${n?` Машину, дошедшую до конца, казна купила (${money(price)}).`:''}`}\n${T.hist}`,choices:[['Ясно','ok']]},true);
  return {place,pass,n,brk};}
function trTierOf(s){return typeof T==='function'?T(s):0;}
function trSubOn(T,y){return T.sub>0&&y>=(T.subY||T.y0)&&y<=T.y1+1;}
/* ---------- приёмка по заявке: полигон (военная техника) и станция испытаний тракторов ---------- */
function trTestKind(md,s){if(trMil(md))return 'mil';const k=trKind(md);if(TR_GRP.farm.kinds.includes(k)&&s.y>=TR_NEB_Y&&trSells(s,'us'))return 'neb';return null;}
function trTestC(md,s,k){return k==='neb'?'us':s.country;}
function trTestWhy(s,md){const k=trTestKind(md,s);if(!k)return 'этой технике испытания не нужны';if(!(md.status==='prod'||md.status==='sale'||md.status==='dev'))return 'модель не в серии и не в КБ';const c=trTestC(md,s,k);
  if((s.trials&&s.trials.q||[]).some(q=>q.md===md.id&&q.k===k))return 'испытания уже идут';const last=md.certT&&md.certT[c+':'+k];if(last!=null&&mi(s)-last<TR_RETEST)return `повторно — через ${TR_RETEST-(mi(s)-last)} мес.`;
  if(k==='mil'&&isWar(s.y,s.m,c))return 'в войну армия берёт без испытаний';if(s.cash<trFee(s))return 'не хватает денег';return '';}
function trialTest(s,mdId){const md=s.models.find(m=>m.id===mdId);if(!md||trTestWhy(s,md))return false;const k=trTestKind(md,s),c=trTestC(md,s,k),fee=trFee(s);s.cash-=fee;s.trials=s.trials||{};(s.trials.q=s.trials.q||[]).push({md:md.id,k,c,at:mi(s)+(k==='neb'?2:3)});
  (md.certT=md.certT||{})[c+':'+k]=mi(s);addLog(`«${md.name}» отправлена на ${k==='neb'?'станцию испытаний тракторов (Небраска)':'полигон военного ведомства'}: итог через ${k==='neb'?2:3} мес. Взнос ${money(fee)}.`);return true;}
// заказ за хороший итог испытаний: не меньше образца года — заказ тем больше, чем выше итог (и чем больше фирма); модель должна быть в серии
function trOrder(s,md,q,v){if(!md||md.status!=='prod'||!(v>=1))return null;const t=mi(s),scale=(1+trTierOf(s)/10)*(q.c==='us'?1.8:1),k=Math.min(2.5,1+3*(v-1)),neb=q.k==='neb';
  const n=Math.max(Math.round((neb?15+25*Math.random():10+20*Math.random())*scale*k),Math.round((md.lastSold||0)*(neb?0.5:0.25)*k)),price=Math.round(refPrice(md,s)*1.05/10)*10;if(!(n>0))return null;
  s.orders=s.orders||[];s.orders.push({id:'tr-'+q.k+'-'+md.id+'-'+t,md:md.id,n,left:n,price,due:t+8,who:neb?'Фермерские кооперативы Среднего Запада':`Военное министерство (${COUNTRIES[q.c].name})`,start:t});return {n,price};}
// прибавка к привлекательности за итог (она же — в trU): чтобы сказать игроку числом
function trBonus(k,sc){return k==='neb'?(sc>=1?Math.min(0.35,0.1+0.5*(sc-1)):sc<0.8?-0.1:0):(sc>1?Math.min(0.3,0.6*(sc-1)):0);}
function trBonusTxt(k,sc){const b=trBonus(k,sc);return b>0.005?`спрос ${k==='neb'?'фермеров':'армии'} выше примерно на ${Math.round((Math.exp(b)-1)*100)}%`:b<-0.005?'покупателей меньше':'';}
function trTestDone(s,q){const md=s.models.find(m=>m.id===q.md);if(!md)return;const grp=q.k==='neb'?'farm':'mil',sc=trScore(md,grp,q.c,s)*Math.exp((Math.random()+Math.random()-1)*0.05),brk=Math.random()<trBreakP(md,s)*0.6,v=brk?sc*0.9:sc;
  if(q.k==='neb'){trSet(md,'us','neb',{sc:+v.toFixed(2)},s);const good=v>=1,O=trOrder(s,md,q,v),bt=trBonusTxt('neb',v);if(good)s.rep=clamp(s.rep+1,0,100);
    pushEvent({own:1,noArt:1,carId:md.id,kicker:'Испытания',title:`Станция в Небраске: «${md.name}» — ${Math.round(v*100)} к образцу года`,deck:good?'итог напечатан — фермеры это читают':v<0.8?'итог напечатан — и он не в вашу пользу':'итог напечатан: не хуже и не лучше других',
      text:`Инженеры университета проверили заявленную мощность на крюке и на шкиве, расход и поломки. Итог «${md.name}» — ${Math.round(v*100)} (100 — образец года)${brk?'; в протоколе отмечена поломка':''}.\n${good?`С таким протоколом трактор продаётся лучше: фермер верит напечатанному числу больше, чем рекламе${bt?` (${bt})`:''}.${O?` Кооперативы уже прислали заказ: ${fmtN(O.n)} машин по ${money(O.price)}.`:''}`:v<0.8?'Слабый итог печатают так же, как сильный: продавать будет труднее, пока трактор не доведён и не испытан заново.':'Протокол есть — трактор продаётся как все. Итог выше образца года дал бы прибавку.'}\nПо закону 1919 года ни один новый трактор нельзя продавать в Небраске без такой проверки; первым её прошёл Waterloo Boy в апреле 1920 года.`,choices:[['Ясно','ok']]},true);return;}
  const pass=v>=TR_PASS;if(pass)trSet(md,q.c,'mil',{sc:+v.toFixed(2)},s);const O=pass?trOrder(s,md,q,v):null,bt=pass?trBonusTxt('mil',v):'';if(pass&&v>=1)s.rep=clamp(s.rep+1,0,100);
  pushEvent({own:1,noArt:1,carId:md.id,kicker:'Испытания ведомства',title:`Полигон: «${md.name}» ${pass?'принята':'не принята'}`,deck:`${COUNTRIES[q.c].name} · ${Math.round(v*100)} к образцу года`,
    text:`Комиссия военного ведомства закончила испытания «${md.name}»: ${Math.round(v*100)} (100 — образец года)${brk?'; в пути была поломка':''}.\n${pass?`Машина принята: армия может закупать её пять лет — до ${1895+Math.floor((mi(s)+TR_CERT_M)/12)} года.${bt?` Итог выше образца: ${bt}.`:v<1?' Итог выше 100 дал бы больше: такую машину армия берёт охотнее и сразу заказывает первую партию.':''}${O?` Первая партия заказана: ${fmtN(O.n)} машин по ${money(O.price)}.`:''}`:`Не принята: нужно не меньше ${Math.round(TR_PASS*100)}. Доведите машину (надёжность и то, что ценит армия в этом виде техники) и заявите снова — не раньше чем через ${TR_RETEST} мес.`}`,choices:[['Ясно','ok']]},true);}
/* ---------- месяц ---------- */
function trialsMonth(s,r){if(s.mode==='racer')return;const t=mi(s),S=s.trials=s.trials||{};
  TRIALS.forEach(T=>{if(s.y<T.y0||s.y>T.y1||trWhen(T,s.y)!==t)return;const key=T.id+'|'+s.y,E=(S.ent||{})[key];if(E){try{trialRun(s,T,E);}catch(e){console.warn('trial',e);}delete S.ent[key];}
    else if(trSells(s,T.c)&&trModels(s,T.grp).length)addLog(`${T.n} (${COUNTRIES[T.c].name}) прошли без вас.`,'hist');});
  if(S.q&&S.q.length){const D=S.q.filter(q=>q.at<=t);S.q=S.q.filter(q=>q.at>t);D.forEach(q=>{try{trTestDone(s,q);}catch(e){console.warn('trial test',e);}});}
  try{if(typeof airStMonth==='function')airStMonth(s);}catch(e){console.warn('air state trials',e);}}
/* ---------- рынок: кого армия закупает и кому казна доплачивает ---------- */
// армия в мирное время закупает только технику, принятую на полигоне (эталон соперников принят всегда)
function trGate(md,u,c,s){const U=TRUCK_USE[u];if(!U||U.grp!=='mil'||!md||md.probe||md.ref)return true;if(isWar(s.y,s.m,c))return true;if(trCertS(md,c,'mil',s))return true;
  // модель ещё не в серии (чертёж, КБ): спрос прикидывают по тому, пройдёт ли она полигон
  return !(md.status==='prod'||md.status==='sale')&&trScore(md,'mil',c,s)>=TR_PASS;}
// поправка к привлекательности: субсидия покупателям грузовиков со свидетельством; протокол станции испытаний тракторов
function trU(md,u,c,s){if(!md||md.probe||md.ref)return 0;const U=TRUCK_USE[u];if(!U)return 0;
  if(U.grp==='farm'){if(c!=='us'||s.y<TR_NEB_Y)return 0;const C=trCertS(md,'us','neb',s);return !C?-0.12:trBonus('neb',C.sc);}
  if(U.grp==='mil'){const C=trCertS(md,c,'mil',s);return C?trBonus('mil',C.sc||1):0;}   // 0.60: принятую с итогом выше образца армия берёт охотнее
  if(u!=='haul'&&u!=='bulk'&&u!=='city')return 0;if(!TR_GRP.truck.kinds.includes(trKind(md)))return 0;const T=TRIALS.find(x=>x.c===c&&x.grp==='truck'&&trSubOn(x,s.y));if(!T||trCertS(md,c,'sub',s))return 0;
  return -(u==='city'?0.3:0.6)*(U.bp||2.5)*Math.log(1/(1-T.sub));}   // по городу субсидийных машин меньше: там берут и лёгкие развозные
function trSubTxt(md,c,s){const T=TRIALS.find(x=>x.c===c&&x.grp==='truck'&&trSubOn(x,s.y));if(!T||!TR_GRP.truck.kinds.includes(trKind(md))||!trSells(s,c))return '';
  return trCertS(md,c,'sub',s)?'':`без свидетельства (${T.n.toLowerCase()}) покупатели в стране «${COUNTRIES[c].name}» не получают доплату казны — ${Math.round(T.sub*100)}% цены`;}
/* ---------- что показать ---------- */
function trialModelLine(md,s){const L=[],t=mi(s),mk=trMil(md);
  Object.keys(md.cert||{}).forEach(k=>{const C=md.cert[k];if(!(C.until>t))return;const [c,kk]=k.split(':');const bt=kk==='mil'||kk==='neb'?trBonusTxt(kk,C.sc||1):'';L.push(`${kk==='mil'?`принята армией — ${Math.round((C.sc||1)*100)}`:kk==='neb'?`протокол Небраски — ${Math.round((C.sc||1)*100)}`:'субсидийное свидетельство'}${bt?` (${bt})`:''} · ${COUNTRIES[c]?COUNTRIES[c].name:c} до ${1895+Math.floor(C.until/12)}`);});
  let warn='';if(mk&&!isWar(s.y,s.m,s.country)&&!trCertS(md,s.country,'mil',s))warn='армия в мирное время закупает только технику, принятую на полигоне';
  else if(trTestKind(md,s)==='neb'&&!trCertS(md,'us','neb',s))warn='в США трактор без протокола станции испытаний продаётся хуже';
  else{for(const c in COUNTRIES){const x=trSubTxt(md,c,s);if(x){warn=x;break;}}}
  const k=trTestKind(md,s),why=k?trTestWhy(s,md):'x',btn=k&&!why?`<button class="btn sm" style="margin-top:4px" data-act="trTest" data-md="${md.id}">${k==='neb'?'На станцию испытаний':'На полигон'} · ${money(trFee(s))}</button>`:'';
  if(!L.length&&!warn&&!btn)return '';
  return `<p class="small ${warn?'warn':'muted'}" style="margin-top:4px">🎖 ${L.length?L.join('; ')+'. ':''}${warn?capF(warn)+'.':''}</p>${btn}`;}
function openTrials(){const s=G,O=trOpenList(s),t=mi(s);
  const soon=TRIALS.filter(T=>trSells(s,T.c)&&s.y+1>=T.y0&&s.y<=T.y1&&!O.some(o=>o.T===T)).map(T=>`<p class="small muted" style="margin-top:4px">${esc(T.n)} · ${COUNTRIES[T.c].name} — каждый год в ${MONTHS[T.m].toLowerCase()}, до ${T.y1} года</p>`).join('');
  const certs=(s.models||[]).filter(m=>m.cert&&Object.values(m.cert).some(C=>C.until>t)).map(m=>`<p class="small" style="margin-top:4px"><b>${esc(m.name)}</b></p>${trialModelLine(m,s)}`).join('');
  const need=(s.models||[]).filter(m=>(m.status==='prod'||m.status==='sale')&&trTestKind(m,s)&&!trCertS(m,trTestC(m,s,trTestKind(m,s)),trTestKind(m,s)==='neb'?'neb':'mil',s)).map(m=>`<div class="race-item"><h3>${esc(m.name)}</h3>${trialModelLine(m,s)}</div>`).join('');
  openSheet(`<div class="row"><h2>🎖 Испытания ведомств</h2><button class="btn sm" data-act="close">Закрыть</button></div>
    <p class="small muted">Там, где испытания были в истории, заказ и право продажи дают они. Пробег считают по машине — надёжность, груз, ход, расход; против вас — марки страны. Прочие заказы (почта, города, такси) — обычным торгом.</p>
    <p class="small" style="margin-top:6px"><b>Что даёт итог.</b> 100 — образец года. Итог 100 и выше: машина продаётся лучше (чем выше, тем сильнее) и получает заказ — трактор от кооперативов, военная машина от армии. Трактор без протокола в США продаётся хуже; военную технику без приёмки армия в мирное время не берёт вовсе. Испытать заново можно через ${TR_RETEST} мес. — после доводки машины.</p>
    ${O.length?O.map(o=>`<div class="race-item"><div class="row"><div><span class="mo">${COUNTRIES[o.T.c].name} · ${MONTHS[o.T.m]} ${s.y}</span><h3 style="margin-top:2px">${esc(o.T.n)}</h3></div><span class="pill ${o.ent?'good':'muted'}">${o.ent?'заявлены':'запись открыта'}</span></div>
      <p class="small muted" style="margin-top:4px">${esc(o.T.hist)}</p>
      ${o.ent?`<p class="small" style="margin-top:4px">Заявлена «${esc((s.models.find(m=>m.id===o.ent.md)||{}).name||'')}».</p>`:o.best?`<p class="small" style="margin-top:4px">Ваша лучшая машина — <b>«${esc(o.best.m.name)}»</b>: ${Math.round(o.best.sc*100)} к образцу года. Победителю — заказ и свидетельство${trSubOn(o.T,s.y)?` (покупателям — доплата казны, ${Math.round(o.T.sub*100)}% цены)`:''}.</p>
        <button class="btn sm primary" style="margin-top:6px" data-act="trEnter" data-id="${o.T.id}" data-md="${o.best.m.id}" ${s.cash<o.fee?'disabled':''}>Заявить · ${money(o.fee)}</button>`:`<p class="small warn" style="margin-top:4px">Нужен ${TR_GRP[o.T.grp].n} в серии.</p>`}</div>`).join(''):'<p class="small muted" style="margin-top:8px">Сейчас запись на конкурсы закрыта.</p>'}
    ${soon?`<div class="label" style="margin-top:10px">Конкурсы на ваших рынках</div>${soon}`:''}
    ${need?`<div class="label" style="margin-top:10px">Приёмка по заявке</div>${need}`:''}
    ${certs?`<div class="label" style="margin-top:10px">Свидетельства</div>${certs}`:''}`);}
function trialAdvice(s,add){if(s.mode==='racer')return;const t=mi(s);
  // 0.60, правки 28.11: в последний месяц записи совет выше; модели нет — что нужно (раньше совет молчал)
  trOpenList(s).forEach(o=>{if(o.ent)return;const last=trWhen(o.T,s.y)-t<=1,G2=TR_GRP[o.T.grp];
    if(!o.best){add(last?62:52,'🎖',`${o.T.n} (${COUNTRIES[o.T.c].name}, ${MONTHS_N[o.T.m]}): запись открыта${last?' — последний месяц':''}, а ${G2.n}а для заявки у вас нет. Победителю — заказ и свидетельство: нужен ${G2.n}.`,'Конструктор',()=>{openDesigner(o.T.grp==='farm'?'tractor':'truck');},'models');return;}
    if(s.cash<o.fee)return;add(last?76:66,'🎖',`${o.T.n} (${COUNTRIES[o.T.c].name}, ${MONTHS_N[o.T.m]}): запись открыта${last?' — последний месяц':''}. «${o.best.m.name}» — ${Math.round(o.best.sc*100)} к образцу года; победителю — заказ и свидетельство.`,`Заявить · ${money(o.fee)}`,()=>{trialEnter(s,o.T.id,o.best.m.id);},'market');});
  // заранее: запись откроется в ближайшие полгода
  trSoonList(s,6).forEach(o=>{const G2=TR_GRP[o.T.grp];add(34,'🗓',`${o.T.n} (${COUNTRIES[o.T.c].name}) — в ${MONTHS_P[o.T.m]} ${o.y}, запись за ${TR_OPEN} месяца. ${o.best?`Ваш лучший ${G2.n} — «${o.best.m.name}», ${Math.round(o.best.sc*100)} к образцу года.`:`${G2.n[0].toUpperCase()+G2.n.slice(1)}а у вас пока нет.`}`,o.best?'Испытания':'Конструктор',()=>{if(o.best)openTrials();else openDesigner(o.T.grp==='farm'?'tractor':'truck');},'models');});
  // в войну армия берёт военную технику без испытаний: если её нет — сказать
  if(isWar(s.y,s.m,s.country)&&s.y>=1914&&!(s.models||[]).some(m=>(m.status==='prod'||m.status==='dev')&&trMil(m))&&typeof kindOpen==='function'&&KIND_GRP.mil.kinds.some(k=>kindOpen(k,s)))
    add(58,'🪖','Война: армия берёт штабные и санитарные машины, бронеавтомобили и танки без испытаний на полигоне — у вас таких нет.','Конструктор',()=>{openKindStep('mil');},'models');
  try{if(typeof airTrialAdvice==='function')airTrialAdvice(s,add);}catch(e){console.warn('air trial advice',e);}
  const md=(s.models||[]).find(m=>(m.status==='prod'||m.status==='sale'||(m.status==='dev'&&trMil(m)))&&trTestKind(m,s)&&!trTestWhy(s,m)&&!trCertS(m,trTestC(m,s,trTestKind(m,s)),trTestKind(m,s)==='neb'?'neb':'mil',s));
  if(md){const k=trTestKind(md,s),sc=trScore(md,k==='neb'?'farm':'mil',trTestC(md,s,k),s),est=`Прикидка итога — ${Math.round(sc*100)} (100 — образец года)`;
    add(68,'🎖',k==='neb'?`«${md.name}» продаётся в США без протокола станции испытаний — фермеры таким тракторам верят меньше. ${est}${sc>=1?': хороший протокол прибавит продаж и принесёт заказ кооперативов':''}.`:`Армия в мирное время не закупит «${md.name}» без испытаний на полигоне. ${est}${sc>=1?': с таким итогом армия закажет первую партию':sc>=TR_PASS?': хватит для приёмки':` — для приёмки нужно ${Math.round(TR_PASS*100)}, сначала доведите машину`}.`,`${k==='neb'?'На станцию':'На полигон'} · ${money(trFee(s))}`,()=>{trialTest(s,md.id);},'models');}}
function trialResolve(s,key){if(key==='tr:open'){try{s.pending.shift();save();render();openTrials();}catch(_){}return true;}return false;}
// строка-вход в «Моделях»: показывается, когда есть что делать или что показать
function trialCardHTML(s){if(!s||s.mode==='racer')return '';const O=trOpenList(s),t=mi(s),need=(s.models||[]).filter(m=>(m.status==='prod'||m.status==='sale')&&trTestKind(m,s)&&!trCertS(m,trTestC(m,s,trTestKind(m,s)),trTestKind(m,s)==='neb'?'neb':'mil',s)).length,
    have=(s.models||[]).filter(m=>m.cert&&Object.values(m.cert).some(C=>C.until>t)).length,q=(s.trials&&s.trials.q||[]).length;
  // 0.60, правки 28.11: карточка видна всегда — с ближайшей датой и строками о небе (конкурсы министерства, государственные испытания)
  const L=[];if(O.length)L.push(`запись открыта: ${O.map(o=>esc(o.T.n)+(o.ent?' ✓':'')).join(', ')}`);if(q)L.push(`идут испытания: ${q}`);if(need)L.push(`без приёмки: ${need}`);if(have)L.push(`свидетельств: ${have}`);
  const S=trSoonList(s,24)[0];if(!O.length&&S)L.push(`ближайшее: ${esc(S.T.n)} (${COUNTRIES[S.T.c].name}) — ${MONTHS_N[S.T.m]} ${S.y}`);
  const AL=typeof airTrialLines==='function'?airTrialLines(s):{L:[],B:[]};L.push(...AL.L);
  if(!L.length)L.push(isWar(s.y,s.m,s.country)?'война: армия берёт технику без испытаний':'конкурсов по истории сейчас нет; военную технику армия берёт после приёмки на полигоне — кнопка в карточке модели');
  return `<section class="card"><div class="row"><div><h2>🎖 Испытания и госзаказы</h2><p class="small muted">${L.join(' · ')}</p></div><button class="btn sm" data-act="trOpen">Открыть</button></div>${AL.B.length?`<div class="btns" style="margin-top:8px">${AL.B.join('')}</div>`:''}</section>`;}
/* 0.60: помощник управляющего ведёт испытания сам — заявляет лучшую машину на открытый конкурс и отправляет на полигон и
   на станцию испытаний всё, что без приёмки продаётся хуже или не продаётся вовсе (взнос мал против того, что даёт итог).
   На полигон — только если прикидка итога проходит приёмку: иначе деньги и полгода ожидания пропадут зря. */
function trialHelper(s,msg){if(!s||s.mode==='racer')return;
  trOpenList(s).forEach(o=>{if(o.ent||!o.best||o.best.sc<0.9||s.cash<o.fee*3)return;if(trialEnter(s,o.T.id,o.best.m.id))msg.push(`заявил «${o.best.m.name}» на конкурс: ${o.T.n}`);});
  (s.models||[]).forEach(md=>{if(!(md.status==='prod'||md.status==='sale'))return;const k=trTestKind(md,s);if(!k||trTestWhy(s,md))return;const c=trTestC(md,s,k);if(trCertS(md,c,k==='neb'?'neb':'mil',s))return;
    if(s.cash<trFee(s)*3)return;const sc=trScore(md,k==='neb'?'farm':'mil',c,s);if(k==='mil'&&sc<TR_PASS)return;
    if(trialTest(s,md.id))msg.push(`отправил «${md.name}» ${k==='neb'?'на станцию испытаний тракторов':'на полигон'}`);});}
