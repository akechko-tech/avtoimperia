/* ================= 0.30: СДЕЛКИ M&A — ДОЧЕРНЯЯ КОМПАНИЯ ИЛИ ПОГЛОЩЕНИЕ, ПЕРЕГОВОРЫ СРАЗУ, ПРЕДЛОЖЕНИЯ К ВАМ, ТОРГИ =================
   В 0.29 купленная марка отдавала вам своё место на рынке навсегда — вместе с её историческим ростом: купив Buick в 1906 году,
   вы получали долю Buick до 1929-го. Так за пару лет скупались все рынки. Теперь — как было в истории, два пути:
   • ДОЧЕРНЯЯ КОМПАНИЯ (холдинг — как General Motors Дюранта в 1908 году: Buick, Oldsmobile, Cadillac со своими марками,
     заводами и директорами). Вы владеете долей — 25%, 51% или 100% — и получаете дивиденды; её продажи — её, на рынке
     она остаётся отдельной маркой. Решения ограничены: вложить деньги, докупить или продать долю, с 51% — запретить ей
     выходить в ваш класс. Директора независимы: просят денег, предлагают выкупить вашу долю, конкурируют с вами.
   • ПОГЛОЩЕНИЕ ПОД ОДИН БРЕНД (как Ситроен с заводами Mors в 1925 году): марки больше нет, её заводы, дилеры, права на модели
     и технологии — ваши, одна дилерская сеть (переоформление дилеров и заводов стоит денег). Часть её покупателей переходит
     к вам и за несколько лет расходится по тем, чьи машины лучше.
   Платить — деньгами или акциями (владельцы становятся вашими совладельцами — так Chrysler купил Dodge в 1928 году).
   Переговоры — сразу: владельцы отвечают на месте («по рукам», своя цена или отказ). Ещё — предложения к вам: марка ищет
   покупателя, финансист хочет долю в вас, соперник зовёт слиться, банкиры хотят купить всю компанию; и торги после банкротств. */

/* ---------- владения ---------- */
function holdList(s){return s.hold||(s.hold=[]);}
function holdOf(s,c,i){return (s.hold||[]).find(h=>h.c===c&&h.i===i)||null;}
function acqList(s){return (s.hold||[]).filter(h=>h.mode==='int');}
function acqIn(s,c){return acqList(s).filter(h=>h.c===c);}
function acqHas(s,c,i){const h=holdOf(s,c,i);return !!(h&&h.mode==='int');}
function subList(s){return (s.hold||[]).filter(h=>h.mode==='sub');}
function subOf(s,c,i){const h=holdOf(s,c,i);return h&&h.mode==='sub'?h:null;}
function intIn(s,c){return acqIn(s,c).length>0;}
function maKey(c,i){return c+'|'+i;}
function maByKey(s,k){const [c,i]=String(k).split('|');return holdOf(s,c,+i);}
function maRnd(k){return (hashStr(String(k))%100000)/100000;}
// доли марки по классам в её стране (для поглощения: сколько покупателей может перейти)
function maShares0(s,c,i){const cp=(COMPS[c]||[])[i],o={};if(!cp)return o;SEGK.forEach(g=>{const S=segAnnual(c,g,s),mx=(cp.mix&&cp.mix[g])||0;if(S>0&&mx>0)o[g]=+Math.min(0.85,compVol(cp,s)*mx/S).toFixed(4);});return o;}
// сохранения 0.27–0.29: купленные марки (s.bought, s.acq) — теперь поглощённые; их модели — обычные ваши модели
function maMigrate(s){if(!s||(s.maV||0)>=30)return;s.maV=30;const H=holdList(s);
  const add=a=>{if(!a||!COMPS[a.c]||H.some(h=>h.c===a.c&&h.i===a.i))return;H.push({c:a.c,i:a.i,n:a.n,mode:'int',st:1,t:a.t!=null?a.t:mi(s),paid:0,pay:a.how==='merge'?'swap':'cash',home:a.home?1:0,sh0:maShares0(s,a.c,a.i),old:1});};
  if(s.bought)for(const c in s.bought)add(s.bought[c]);(s.acq||[]).forEach(add);delete s.bought;delete s.acq;
  (s.models||[]).forEach(m=>{if(m.acq){m.from=m.acq;delete m.acq;delete m.only;}});}
// покупатели поглощённой марки остаются с вами не навсегда: в первый год — около двух третей её доли, через 3–4 года — треть
function maLoy(s,h){const dt=Math.max(0,mi(s)-(h.t||0));return (h.home?0.85:0.65)*Math.exp(-dt/(h.home?72:42));}
function boughtShare(c,g,s){let v=0;acqIn(s,c).forEach(h=>{const x=(h.sh0&&h.sh0[g])||0;if(x>0)v+=x*maLoy(s,h);});return Math.min(0.85,v);}
// дочерняя компания на рынке: вложения делают её сильнее, запрет (с 51%) уводит её из вашего класса
function maSubW(s,c,i,g){const h=subOf(s,c,i);if(!h)return 1;let w=1+(h.boost||0);if((h.veto||0)>mi(s)&&h.vetoG===g)w*=0.55;return w;}

/* ---------- оценка марки ---------- */
// гордые хозяева: свою марку не продают (в 1895–1929 годах) — вероятность отказа на год
const DEAL_PROUD={'Rolls-Royce':1,'Bugatti':1,'Renault':1,'Ford':1,'Peugeot':0.6,'FIAT':0.6,'Packard':0.7,'Isotta Fraschini':0.7,'Mercedes-Benz':0.6,'Daimler':0.5};
function dealMarket(s,c){const m=(s.mPrev&&s.mPrev[c])||0;if(m>0)return m;try{return SEGK.reduce((a,g)=>a+mkCountry(c,s,[]).segs[g].inc,0)*12;}catch(_){return 1;}}
// продажи за прошлый год, рост, доля; выручка × маржа эпохи → прибыль; прибыль × P/E (растущие дороже) + заводы и дилеры
function maStat(s,c,i){const cp=(COMPS[c]||[])[i];if(!cp)return null;const st=(s.comps[c]||[])[i]||{},full=(st.prev||0)>0;
  const v=Math.max(1,full?st.prev:Math.max(st.yr||0,compVol(cp,s)*0.9)),tr=full&&(st.prev2||0)>0?clamp(st.prev/st.prev2-1,-0.6,1.5):0;
  let P=0,w=0;for(const g in (cp.mix||{})){const k=cp.mix[g]||0;P+=k*prefP(g,c,s);w+=k;}P=w?P/w:prefP('middle',c,s);
  const sh=v/Math.max(1,dealMarket(s,c)),rev=v*P,ec=econ(s.y,s.m,c).f,h=holdOf(s,c,i);
  const m=(s.y<1910?0.1:s.y<1920?0.085:0.07)+clamp(tr,-0.3,0.3)*0.12+(sh>0.15?0.02:0)-(ec<0.9?0.04:0)+(h&&h.mode==='sub'?Math.min(0.03,(h.boost||0)*0.05):0);
  const profit=rev*m,capU=Math.max(1,v/12*1.1),dl=Math.max(1,Math.round(v/12/Math.max(0.5,dealerTP(s)))),A=capU*capUnitCost(s)*0.55+dl*dealerCost(s)*0.5;
  const PE=clamp(8+tr*8,5,12),V=Math.max(5000,Math.round(Math.max(A*0.8,profit*PE+A*0.25)/1000)*1000);
  return {cp,nm:compName(cp,s),v,tr,sh,P,rev,m,profit,capU,dl,A,PE,V,loss:m<0};}
function dealStat(s,c,i){const M=maStat(s,c,i);return M?{v:M.v,tr:M.tr}:{v:0,tr:0};}
function dealValue(s,c,i){const M=maStat(s,c,i);return M?M.V:0;}
// стоимость ваших долей в дочерних компаниях (входит в стоимость компании)
function maHoldValue(s){return subList(s).reduce((a,h)=>{const M=maStat(s,h.c,h.i);return a+(M&&compAlive(M.cp,s)?M.V*h.st:0);},0);}
// можно ли вести переговоры
function dealBlock(s,c,i){const cp=(COMPS[c]||[])[i];if(!cp||cp.imp||pkIs(cp,s))return 'нельзя';const h=holdOf(s,c,i);if(h&&(h.mode==='int'||h.st>=1))return 'ваша';if(!compAlive(cp,s))return 'закрылась';
  if(BRAND_GROUP[cp.n]!=null&&s.y>=BRAND_GROUP[cp.n])return 'в концерне';if(c!==s.country&&(warCut(s,c)||atWar(s.country,c,s.y,s.m)))return 'война';
  const t=(s.dealNo||{})[c+i];if(t&&t>mi(s))return 'пауза';return '';}
// главный класс марки (не грузовики; спорт — где он уже есть)
function maMainClass(cp,s,c){const gs=Object.entries(cp.mix||{}).filter(([g])=>g!=='truck'&&(g!=='sport'||sportOpen(s,c))).sort((a,b)=>b[1]-a[1]);return gs.length?gs[0][0]:'middle';}
// переоформить дилеров под вашу марку и перестроить заводы под ваши машины
function maIntCost(s,M){return Math.round((M.dl*dealerCost(s)*0.3+M.capU*capUnitCost(s)*0.1)/1000)*1000;}

/* ---------- чего хотят владельцы ---------- */
// d = {st: какой станет ваша доля, mode: 'sub'|'int', pay: 'cash'|'swap'}. Цена — за прибавку доли.
function maAsk(s,c,i,d){const M=maStat(s,c,i);if(!M)return null;const nm=M.nm,cp=M.cp,h=holdOf(s,c,i),have=h?h.st:0,tot=Math.min(1,d.st),st=Math.max(0,tot-have);
  const proud=DEAL_PROUD[nm]??DEAL_PROUD[cp.n]??0;
  if(proud>0&&tot>=0.5&&maRnd(nm+'|proud|'+s.y)<proud)return {M,refuse:'proud',st};
  let prem=0.12+(tot>=0.5&&have<0.5?0.18:0)+(tot<0.5?-0.08:0);
  if(M.sh>0.15)prem+=0.2;else if(M.sh>0.08)prem+=0.08;
  if(M.tr>0.1)prem+=0.12;else if(M.tr<-0.1)prem-=0.15;
  if(econ(s.y,s.m,c).f<0.9)prem-=0.12;if(M.loss)prem-=0.2;
  if(d.mode==='int')prem+=0.06;
  if(d.pay==='swap'){const me=Math.max(1,companyValue(s));if(me<M.V*0.6)return {M,refuse:'small',st};prem+=me<M.V?0.3:me<M.V*2?0.08:-0.03;}
  prem+=proud*0.3+(maRnd(nm+'|'+s.y)-0.5)*0.2;
  const O=s.maOffer&&s.maOffer.c===c&&s.maOffer.i===i&&s.maOffer.until>mi(s)?s.maOffer:null;if(O)prem=Math.min(prem,O.prem);
  return {M,R:Math.max(1000,Math.round(M.V*st*(1+prem)/1000)*1000),st,prem};}
function maAnswer(s,c,i,d,price){const Q=maAsk(s,c,i,d);if(!Q)return {k:'no',why:'нельзя'};if(Q.refuse)return {k:'no',why:Q.refuse,Q};
  if(price>=Q.R)return {k:'yes',Q};if(price>=Q.R*0.85)return {k:'counter',ask:Math.round(Q.R*1.03/1000)*1000,Q};return {k:'low',Q,far:price<Q.R*0.6};}
// реплики владельцев
const MA_SAY={yes:['По рукам. Завтра подпишем бумаги у нотариуса.','Согласны. Пусть ваши юристы готовят договор.','Это честная цена. Подписываем.'],
  counter:['Мало. За {ask} подпишем сегодня же.','Близко, но нет. {ask} — и марка ваша.','Наш совет директоров согласится на {ask}. Не меньше.'],
  low:['Нет. Добавьте — тогда поговорим.','Наши заводы стоят дороже. Подумайте ещё.','Предложение интересное, но цена — нет.'],
  far:['Это не предложение, а оскорбление. Мы стоим много больше.','С такими деньгами приходите покупать велосипедную мастерскую.'],
  proud:['Марка не продаётся. Ни вам, ни кому-либо ещё.','Моё имя на радиаторе не продаётся. Разговор окончен.'],
  small:['Стать младшими партнёрами маленькой компании? Нет уж.','Ваши акции стоят меньше нашего завода. Платите деньгами.']};
function maSay(k,ask){const L=MA_SAY[k]||MA_SAY.low;return L[Math.floor(Math.random()*L.length)].replace('{ask}',money(ask||0));}

/* ---------- сделка ---------- */
function maClose(s,c,i,d,price,how){const M=maStat(s,c,i);if(!M)return null;const nm=M.nm,cp=M.cp;let h=holdOf(s,c,i);
  const tot=Math.min(1,d.st),add=Math.max(0,tot-(h?h.st:0)),intNow=d.mode==='int'&&tot>=1,icost=intNow?maIntCost(s,M):0;
  if(d.pay==='cash'&&s.cash<price+icost)return null;if(d.pay!=='cash'&&s.cash<icost)return null;
  if(d.pay==='cash')s.cash-=price;else{const me=Math.max(1,companyValue(s)),k=clamp(price/(price+me),0.01,0.6);(s.partners=s.partners||[]).push({n:nm,sh:+k.toFixed(3),t:mi(s)});}
  if(!h){h={c,i,n:cp.n,nm,mode:'sub',st:0,t:mi(s),paid:0,pay:d.pay,mood:65,inv:0,boost:0,how:how||'deal'};holdList(s).push(h);}
  h.st=Math.min(1,h.st+add);h.paid=(h.paid||0)+price;h.nm=nm;
  if(s.maOffer&&s.maOffer.c===c&&s.maOffer.i===i)s.maOffer=null;
  if(intNow){s.cash-=icost;maIntegrate(s,h,M);}
  s.rep=clamp(s.rep+1,0,100);
  const where=c===s.country?'':` (${COUNTRIES[c].name})`,pt=Math.round(h.st*100);
  const what=h.mode==='int'?`поглощена и уходит под марку «${s.company}»: её заводы (+${fmtN(h.capAdd||0)} машин в месяц), ${fmtN(h.dlAdd||0)} ${plural(h.dlAdd||0,'дилер','дилера','дилеров')}, права на модели и технологии — ваши`
    :`теперь ваша дочерняя компания (${pt}%): своя марка, свои директора, вам — дивиденды`;
  addLog(`🤝 «${nm}»${where} ${what}. ${d.pay==='cash'?`Заплачено ${money(price)}`:`Оплата акциями: владельцы получают ${Math.round(s.partners[s.partners.length-1].sh*100)}% вашей прибыли`}${icost?`, переоформление — ${money(icost)}`:''}.`,'good');
  pendingToasts.push(`🤝 ${h.mode==='int'?'Поглощена':'Дочерняя компания:'} «${nm}»`);try{auFanfare('deal');}catch(_){}
  return h;}
// поглощение: заводы, дилеры, местное производство, права на модели и технологии, часть покупателей
function maIntegrate(s,h,M){const c=h.c,cp=M.cp;h.mode='int';h.st=1;h.t=mi(s);h.sh0=maShares0(s,c,h.i);
  const capAdd=Math.max(2,Math.round(M.capU));s.cap+=capAdd;s.plantVal+=capAdd*capUnitCost(s)*0.5;s.dealers[c]=dealerCount(s,c)+M.dl;
  if(c!==s.country){if(s.lic&&s.lic[c])licEnd(s,c);s.imp=s.imp||{};s.imp[c]=Math.max(impLv(s,c),2);(s.impSince=s.impSince||{})[c]=Math.min(s.impSince[c]??mi(s),mi(s)-120);}
  s.pfleet=s.pfleet||{};s.pfleet[c]=(s.pfleet[c]||0)+M.v*2;if(s.aw)s.aw[c]=Math.max(s.aw[c]||0,0.55);
  const md=maTakeModel(s,c,cp,M.v);
  try{const g=maMainClass(cp,s,c),sc=studyCar(g,s.y);if(sc&&!((s.rd.studied||[]).includes(studyKey(sc))))studyDone(s,{id:sc.kind,y:sc.y,name:sc.name});}catch(e){console.warn('ma tech',e);}
  h.capAdd=capAdd;h.dlAdd=M.dl;h.model=md?md.id:null;return h;}
// её машина — теперь ваша модель (права на конструкцию): в её главном классе, на деталях своего года; продаётся под вашей маркой везде
function maTakeModel(s,c,cp,v){try{const nm=compName(cp,s),g=maMainClass(cp,s,c),d=autoDesign(g,s),cm=compModel(cp,s);
    const m={id:s.nextId++,name:String(cm?cm[1]:nm).replace(/\s*«.*?»/g,'').slice(0,28),e:d.e,g:d.g,c:d.c,k:d.k,b:d.b,t:d.t,w:d.w,paint:PAINTS[s.models.length%PAINTS.length].id,price:0,plan:'auto',status:'prod',devLeft:0,launched:mi(s),
      stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:Math.round(v/12),vol:Math.round(v/12*10)/10,from:nm};m.price=Math.round(refPrice(m,s)/10)*10;s.models.push(m);return m;}catch(e){console.warn('ma model',e);return null;}}
// совладельцы (оплата акциями, инвесторы) получают свою долю прибыли
function partnersShare(s){return Math.min(0.75,(s.partners||[]).reduce((a,p)=>a+(p.sh||0),0));}
// совместимость с 0.29 (тесты, боты): купить или слиться — сразу и под один бренд
function dealDo(s,c,i,kind,k){if(dealBlock(s,c,i))return null;const d={st:1,mode:'int',pay:kind==='merge'?'swap':'cash'},M=maStat(s,c,i),price=Math.round(M.V*(k||1.1)/1000)*1000,A=maAnswer(s,c,i,d,price);
  if(A.k!=='yes'){s.dealNo=s.dealNo||{};s.dealNo[c+i]=mi(s)+12;return {ok:false,nm:M.nm,p:0};}const h=maClose(s,c,i,d,price);return h?{ok:true,nm:M.nm,price}:null;}

/* ---------- дочерние компании: каждый месяц ---------- */
function maMonth(s,r){maMigrate(s);r.div=0;const now=mi(s);
  subList(s).slice().forEach(h=>{const M=maStat(s,h.c,h.i);
    if(!M||!compAlive(M.cp,s)){s.hold=s.hold.filter(x=>x!==h);addLog(`Дочерняя компания «${h.nm||h.n}» закрылась — вложения пропали.`,'bad');return;}
    const st=(s.comps[h.c]||[])[h.i]||{},u=st.last||0,prof=u*M.P*M.m;h.p12=(h.p12||0)*11/12+prof;
    if(prof>0){const dv=prof*h.st*0.6;r.div+=dv;h.divY=(h.divY||0)+dv;}
    h.boost=(h.boost||0)*0.996;h.mood=clamp((h.mood??60)+(60-(h.mood??60))*0.02,0,100);
    // ваш класс в её стране: если вы там продаёте, её директора недовольны (вы — конкурент)
    const g=maMainClass(M.cp,s,h.c);if(s.models.some(m=>m.status==='prod'&&segOf(m)===g&&(m.soldBy||{})[h.c]>0))h.mood-=0.15;});
  if(s.m===0)subList(s).forEach(h=>{if(h.divY>1)addLog(`«${h.nm||h.n}»: дивиденды за год — ${money(h.divY)} (ваша доля ${Math.round(h.st*100)}%).`,'good');h.divY=0;});}
// события дочерних: просят денег, предлагают выкуп, выходят в ваш класс
function maSubEvents(s){if(s.pending.length)return false;const now=mi(s);
  for(const h of subList(s)){const M=maStat(s,h.c,h.i);if(!M)continue;const k=maKey(h.c,h.i),nm=h.nm||M.nm;
    if(now-(h.lastReq??h.t)>=18+Math.floor(maRnd(k+'|q|'+now)*12)&&h.mood>25&&Math.random()<0.25){h.lastReq=now;const amt=Math.max(2000,Math.round(M.V*(0.1+0.1*maRnd(k+now))/1000)*1000),gain=Math.round(amt/M.V*90);
      pushEvent({kicker:'Дочерняя компания',own:1,title:`Директор «${nm}» просит денег`,deck:`${money(amt)} на новый цех · обещает +${gain}% продаж`,
        text:`Директор «${nm}» пишет в правление: заводу тесно, дилеры ждут машин. Нужно ${money(amt)} на новый цех и оснастку — продажи вырастут примерно на ${gain}%, а с ними и ваши дивиденды (у вас ${Math.round(h.st*100)}%).\nОткажете — директора запомнят: независимый менеджмент не любит, когда владельцы держат их на голодном пайке.`,
        choices:[[`Дать ${money(amt)}`,'ma:inv:Y:'+k+':'+amt],['Отказать','ma:inv:N:'+k]]},true);return true;}
    if((h.mood<35&&Math.random()<0.12)||(h.st<0.5&&Math.random()<0.012)){const P=Math.round(M.V*h.st*(0.95+0.15*maRnd(k+'|bb|'+now))/1000)*1000;
      pushEvent({kicker:'Дочерняя компания',own:1,title:`Директора «${nm}» хотят выкупить вашу долю`,deck:`${money(P)} за ${Math.round(h.st*100)}%`,
        text:`Директора «${nm}» нашли банк, который даст им денег, и предлагают выкупить вашу долю за ${money(P)} — марка станет снова независимой. ${h.mood<35?'Они давно недовольны: им кажется, что вы мешаете им работать.':'Им тесно под чужим контролем.'}\nСейчас ваша доля приносит около ${money(Math.max(0,h.p12*h.st*0.6))} дивидендов в год.`,
        choices:[[`Продать за ${money(P)}`,'ma:bb:Y:'+k+':'+P],['Оставить долю','ma:bb:N:'+k]]},true);return true;}
    const g=maMainClass(M.cp,s,h.c),mine=s.models.some(m=>m.status==='prod'&&segOf(m)===g);
    if(mine&&!(h.veto>now)&&now-(h.lastCmp??h.t)>=24&&Math.random()<0.04){h.lastCmp=now;
      pushEvent({kicker:'Дочерняя компания',own:1,title:`«${nm}» выходит в ваш класс`,deck:`${SEG[g].name}: дочерняя марка будет отбирать ваших покупателей`,
        text:`Директора «${nm}» готовят новую машину — прямо в класс «${SEG[g].name.toLowerCase()}», где продаёте и вы. Для них это рост, для вас — соперник под собственной крышей.${h.st>=0.5?'\nУ вас контрольный пакет: можно запретить — но директора обидятся.':'\nУ вас меньше половины — запретить нельзя, можно только высказать недовольство.'}`,
        choices:h.st>=0.5?[['Запретить на два года','ma:cmp:Y:'+k+':'+g],['Пусть конкурируют','ma:cmp:N:'+k]]:[['Ясно','ma:cmp:N:'+k]]},true);return true;}}
  return false;}

/* ---------- предложения к вам ---------- */
const MA_INVESTORS={us:['Пьер Дюпон','банкирский дом J. P. Morgan & Co.','Dillon, Read & Co.'],fr:['Банк Парижа и Нидерландов','дом Ротшильдов','Лионский кредит'],
  uk:['Barclays','лорд Нафилд и компаньоны','Bank of England (через посредников)'],de:['Дойче банк','Дрезднер банк','дом Варбургов'],it:['Коммерческий банк Италии','Кредитный банк Италии','семья Перроне']};
function maWho(c,k){const L=MA_INVESTORS[c]||MA_INVESTORS.fr;return L[Math.floor(maRnd(k)*L.length)];}
function maInbound(s){if(s.over||s.pending.length||s.y<1902)return;const now=mi(s);
  if(maFates(s))return;if(maSubEvents(s))return;if(maSqueeze(s))return;
  // 1) марка ищет покупателя (слабая или падающая; в кризис — чаще)
  const cs=creditState(s).k,crisis=cs==='panic'||cs==='tight'||cs==='crash'||Object.keys(COUNTRIES).some(c=>econ(s.y,s.m,c).f<0.88);
  if(now-(s.brandOfferT??-99)>=10&&Math.random()<(crisis?0.09:0.05)){
    const L=[];Object.keys(COUNTRIES).forEach(c=>{if(c!==s.country&&!dealerCount(s,c))return;(COMPS[c]||[]).forEach((cp,i)=>{if(dealBlock(s,c,i))return;const M=maStat(s,c,i);if(M&&(M.tr<-0.05||M.sh<0.06||M.loss))L.push({c,i,M});});});
    if(L.length){const o=L[Math.floor(Math.random()*L.length)],prem=crisis?-0.25:-0.12;s.brandOfferT=now;s.maOffer={c:o.c,i:o.i,until:now+6,prem};
      const d={st:1,mode:'sub',pay:'cash'},Q=maAsk(s,o.c,o.i,d);if(Q&&!Q.refuse){
        pushEvent({kicker:'Сделка',own:1,title:`«${o.M.nm}» ищет покупателя`,deck:`${COUNTRIES[o.c].name} · просят ${money(Q.R)} · ${Math.round(o.M.v)} машин в год`,
          text:`${crisis?'Кризис ударил по слабым маркам: ':''}владельцы «${o.M.nm}» готовы продать дело — заводы, дилеров и имя. Просят ${money(Q.R)} (оценка аналитиков — ${money(o.M.V)}); их цена держится полгода.\nМожно купить её целиком и оставить отдельной маркой, взять контрольный пакет или поглотить под свой бренд — в переговорах ответят сразу.`,
          choices:[['Переговоры','ma:talk:'+maKey(o.c,o.i)],['Позже','ok']]},true);return;}}}
  // 2) финансист хочет купить долю в вас (как Дюпон в General Motors в 1917 году)
  const me=companyValue(s),pr=((s.hist&&s.hist.profit)||[]).slice(-12).reduce((a,b)=>a+b,0);
  if(s.y>=1906&&me>1.5e6*cpi(s)&&pr>0&&now-(s.maStakeT??-99)>=60&&partnersShare(s)<0.5&&Math.random()<0.012){s.maStakeT=now;const k=0.2,P=Math.round(me*k*(1+0.15*maRnd('stk'+now))/1000)*1000,who=maWho(s.country,'inv'+now);
    pushEvent({kicker:'Финансы',own:1,title:`${capF(who)} хочет купить 20% «${s.company}»`,deck:`${money(P)} сразу · 20% прибыли — им`,
      text:`${capF(who)} предлагает ${money(P)} за пятую часть «${s.company}». Деньги придут сразу — на цеха, дилеров и новые машины; взамен новые совладельцы будут получать 20% прибыли навсегда.\nТак в 1917 году Пьер Дюпон купил долю в General Motors — и деньги Дюпонов помогли GM обогнать Ford.`,
      choices:[[`Продать 20% за ${money(P)}`,'ma:stk:Y:'+P],['Отказаться','ma:stk:N']]},true);return;}
  // 3) соперник предлагает слияние (как Daimler и Benz в 1924–1926 годах)
  if(now-(s.maMergeT??-99)>=48&&Math.random()<0.012){const L=[];(COMPS[s.country]||[]).forEach((cp,i)=>{if(dealBlock(s,s.country,i))return;const M=maStat(s,s.country,i);if(M&&M.tr<-0.05&&M.V>me*0.25&&M.V<me*1.6&&!(DEAL_PROUD[M.nm]>=1))L.push({i,M});});
    if(L.length){const o=L[0];s.maMergeT=now;pushEvent({kicker:'Сделка',own:1,title:`«${o.M.nm}» предлагает слияние`,deck:`оплата акциями · ${Math.round(o.M.v)} машин в год`,
      text:`Дела у «${o.M.nm}» идут под гору, и её владельцы предлагают «${s.company}» объединиться: вы платите акциями, они становятся совладельцами. Можно оставить «${o.M.nm}» отдельной маркой или поглотить под свой бренд.\nТак в 1924 году Daimler и Benz сначала объединили закупки и продажи, а в 1926-м слились в Daimler-Benz.`,
      choices:[['Переговоры','ma:talk:'+maKey(s.country,o.i)+':swap'],['Отказаться','ok']]},true);return;}}
  // 4) банкиры хотят купить всю компанию (как Dillon, Read & Co. купили Dodge Brothers в 1925 году за $146 млн)
  if(s.y>=1912&&me>8e6*cpi(s)&&now-(s.maSellT??-99)>=120&&Math.random()<0.006){s.maSellT=now;const P=Math.round(me*(1.2+0.2*maRnd('sell'+now))/1e4)*1e4,who=maWho(s.country,'buy'+now);
    pushEvent({kicker:'Финансы',own:1,title:`${capF(who)} предлагает купить «${s.company}» целиком`,deck:`${money(P)} — на ${Math.round((P/me-1)*100)}% больше стоимости компании`,
      text:`${capF(who)} предлагает выкупить «${s.company}» целиком: ${money(P)} наличными — вам и совладельцам. Если согласитесь, компанией будут управлять новые хозяева, а вы получите свою часть денег — и сможете купить другую марку в любой стране или подвести итог.\nТак в 1925 году вдовы братьев Додж продали Dodge Brothers банкирам Dillon, Read & Co. за 146 миллионов долларов — крупнейшая сделка своего времени.`,
      choices:[[`Продать за ${money(P)}${partnersShare(s)>0?` (вам — ${money(Math.round(P*(1-partnersShare(s))))})`:''}`,'ma:sell:Y:'+P],['Отказаться','ma:sell:N']]},true);return;}}

/* ---------- банкротства и торги ---------- */
// Исторические развязки марок (кто купил, когда, продолжилась ли марка). Если вы там торгуете — можно перебить покупателя.
const BRAND_FATE=[
  {c:'us',n:'Oldsmobile',y:1908,m:10,kind:'sale',who:'General Motors (Дюрант)',cont:1,txt:'Ransom Olds ушёл, наследники продают марку: Дюрант собирает General Motors.'},
  {c:'us',n:'Cadillac',y:1909,m:6,kind:'sale',who:'General Motors (Дюрант)',cont:1,txt:'Генри Лиланд и сын готовы продать Cadillac — за 4,5 миллиона долларов наличными, как и было.'},
  {c:'uk',n:'Daimler (Coventry)',y:1910,m:8,kind:'merge',who:'BSA',cont:1,txt:'Совет директоров Daimler ищет сильного партнёра: оружейная BSA предлагает слияние.'},
  {c:'it',n:'Alfa Romeo',y:1915,m:11,kind:'sale',who:'Никола Ромео',cont:1,txt:'A.L.F.A. в долгах: войну завод не переживёт без нового хозяина.'},
  {c:'us',n:'Duryea',y:1916,m:6,kind:'close',who:'кредиторы',cont:0,txt:'Duryea выпускает последние машины: заводы идут с молотка.'},
  {c:'us',n:'Chevrolet',y:1918,m:4,kind:'merge',who:'General Motors',cont:1,txt:'Дюрант сливает Chevrolet с General Motors — через обмен акций.'},
  {c:'us',n:'Willys-Overland',y:1920,m:10,kind:'bankrupt',who:'банки (управляющий — Уолтер Крайслер)',cont:1,txt:'Послевоенный спад: Willys-Overland должна банкам 46 миллионов долларов.'},
  {c:'us',n:'Maxwell / Chrysler',y:1921,m:0,kind:'bankrupt',who:'банки и Уолтер Крайслер',cont:1,txt:'Maxwell-Chalmers под управлением кредиторов: спад 1920 года оставил марку без денег.'},
  {c:'uk',n:'Austin',y:1921,m:3,kind:'bankrupt',who:'кредиторы (марка продолжит работу)',cont:1,txt:'Austin в руках управляющего: послевоенная модель-одиночка не окупилась.'},
  {c:'us',n:'Winton',y:1924,m:1,kind:'close',who:'никто — завод уходит под дизели',cont:0,txt:'Александр Уинтон закрывает автомобильное дело.'},
  {c:'us',n:'Stanley',y:1924,m:8,kind:'bankrupt',who:'Steam Vehicle Corporation',cont:0,txt:'Паровые машины Stanley больше не продаются: компания банкрот.'},
  {c:'fr',n:'Mors',y:1925,m:4,kind:'bankrupt',who:'Андре Ситроен',cont:0,txt:'Mors не выдержала соперничества: её завод выставлен на торги.'},
  {c:'us',n:'Dodge Brothers',y:1925,m:3,kind:'sale',who:'Dillon, Read & Co.',cont:1,txt:'Братья Додж умерли в 1920 году; их вдовы продают компанию.'},
  {c:'us',n:'Mercer',y:1925,m:5,kind:'bankrupt',who:'кредиторы',cont:0,txt:'Mercer обанкротилась: спортивные машины для богатых больше не окупаются.'},
  {c:'uk',n:'Vauxhall',y:1925,m:10,kind:'sale',who:'General Motors',cont:1,txt:'Vauxhall ищет денег: General Motors предлагает 2,5 миллиона долларов.'},
  {c:'us',n:'Duesenberg',y:1926,m:9,kind:'sale',who:'Эррет Лобан Корд',cont:1,txt:'Братья Дюзенберг — великие инженеры и плохие торговцы: компания продаётся.'},
  {c:'uk',n:'Wolseley',y:1926,m:11,kind:'bankrupt',who:'Уильям Моррис',cont:0,txt:'Wolseley под управлением кредиторов: торги — в феврале. Претенденты — Austin, General Motors и Моррис.'},
  {c:'us',n:'Pierce-Arrow',y:1928,m:7,kind:'merge',who:'Studebaker',cont:1,txt:'Pierce-Arrow теряет покупателей: Studebaker предлагает слияние.'},
  {c:'us',n:'Dodge Brothers',y:1928,m:5,kind:'merge',who:'Chrysler',cont:0,txt:'Банкиры продают Dodge Brothers: Уолтер Крайслер предлагает 170 миллионов долларов акциями.'},
  {c:'uk',n:'Humber',y:1928,m:9,kind:'sale',who:'братья Рутс',cont:1,txt:'Humber сливается с Hillman, а за ними стоят братья Рутс.'},
  {c:'de',n:'Opel',y:1929,m:2,kind:'sale',who:'General Motors',cont:1,txt:'Семья Опель продаёт 80% акций: General Motors предлагает 26 миллионов долларов.'},
  {c:'it',n:'Itala',y:1929,m:5,kind:'bankrupt',who:'кредиторы',cont:1,txt:'Itala снова в долгах: марку, выигравшую Пекин — Париж, продают с торгов.'}];
function maFateFind(c,n){return (COMPS[c]||[]).findIndex(cp=>cp.n===n);}
function maPresent(s,c){return c===s.country||dealerCount(s,c)>0||(s.hold||[]).some(h=>h.c===c);}
function maFates(s){const now=mi(s);for(const f of BRAND_FATE){if(f.y!==s.y||f.m!==s.m)continue;const i=maFateFind(f.c,f.n),key='fate|'+f.n+'|'+f.y;if(i<0||(s.seen&&s.seen[key]))continue;(s.seen=s.seen||{})[key]=1;
    const cp=COMPS[f.c][i],h=holdOf(s,f.c,i);if(h||!compAlive(cp,s)||pkIs(cp,s))continue;
    if(!maPresent(s,f.c)){addLog(`${COUNTRIES[f.c].name}: ${f.txt} Покупатель — ${f.who}.`,'hist');continue;}
    aucStart(s,f.c,i,{who:f.who,kind:f.kind,cont:f.cont,txt:f.txt,hist:1});return true;}
  return false;}
// рынок раздавлен: если ваша доля в стране выдавила марку (её доля — меньше 40% исторической два года подряд), она разоряется
function maSqueeze(s){if(s.m!==2)return false;for(const c of Object.keys(COUNTRIES)){const mk=(s.mPrev||{})[c]||0;if(!mk||!maPresent(s,c))continue;
    const histTot=(COMPS[c]||[]).reduce((a,cp)=>a+compVol(cp,s),0)||1;
    for(let i=0;i<(COMPS[c]||[]).length;i++){const cp=COMPS[c][i];if(cp.imp||pkIs(cp,s)||holdOf(s,c,i)||!compAlive(cp,s)||(BRAND_GROUP[cp.n]!=null&&s.y>=BRAND_GROUP[cp.n]))continue;
      const st=(s.comps[c]||[])[i]||{},hs=compVol(cp,s)/histTot,a1=(st.prev||0)/mk,a2=(st.prev2||0)/Math.max(1,(s.mPrev2||{})[c]||mk);
      if(hs>0.02&&a1<0.4*hs&&a2<0.5*hs&&(st.prev2||0)>0&&!(s.seen&&s.seen['sq|'+cp.n])){(s.seen=s.seen||{})['sq|'+cp.n]=1;
        aucStart(s,c,i,{who:c==='us'?'группа банкиров из Детройта':c==='uk'?'промышленники из Ковентри':c==='fr'?'парижские банкиры':c==='de'?'рейнские промышленники':'миланские банкиры',kind:'bankrupt',cont:maRnd(cp.n+s.y)<0.5?1:0,
          txt:`«${compName(cp,s)}» не выдержала соперничества — в том числе с «${s.company}»: продажи упали втрое против лучших лет, банки требуют долги.`});return true;}}}
  return false;}
// торги: соперники ставят тайно; ваша ставка выигрывает, если она выше всех
function aucStart(s,c,i,o){const M=maStat(s,c,i);if(!M)return;const now=mi(s),V=M.V,k='auc|'+M.nm+'|'+s.y,n=o.kind==='close'?1:2+Math.floor(maRnd(k+'n')*2);
  const bids=[];for(let j=0;j<n;j++){const lo=V*(o.kind==='sale'||o.kind==='merge'?0.75:0.35),hi=V*(o.kind==='sale'||o.kind==='merge'?1.15:0.8);bids.push({lo,hi,b:lo+(hi-lo)*maRnd(k+'|'+j),who:j===0?o.who:['местные промышленники','банковский синдикат','соседний завод'][j%3]});}
  s.auc={c,i,nm:M.nm,until:now+2,V,bids,who:o.who,kind:o.kind,cont:o.cont,txt:o.txt,hist:o.hist||0,start:Math.round(V*(o.kind==='sale'||o.kind==='merge'?0.7:0.3)/1000)*1000};
  const kindT={sale:'продаётся',merge:'ищет партнёра для слияния',bankrupt:'обанкротилась — торги',close:'закрывается — завод с молотка'}[o.kind]||'продаётся';
  pushEvent({kicker:o.kind==='bankrupt'||o.kind==='close'?'Банкротство':'Сделка',own:1,title:`«${M.nm}» ${kindT}`,deck:`${COUNTRIES[c].name} · стартовая цена ${money(s.auc.start)} · претендент — ${o.who}`,
    text:`${o.txt}\nЗаводы на ${fmtN(Math.round(M.capU))} машин в месяц, ${fmtN(M.dl)} ${plural(M.dl,'дилер','дилера','дилеров')}, имя марки и права на модели. Оценка аналитиков — ${money(V)}. Ставки — тайные, решение — через два месяца.${o.hist?`\nВ настоящей истории покупателем стал ${o.who}.`:''}`,
    choices:[['На торги','ma:auc'],['Не участвовать','ma:aucSkip']]},true);}
function aucWinP(A,b){return A.bids.reduce((p,x)=>p*clamp((b-x.lo)/Math.max(1,x.hi-x.lo),0,1),1);}
function aucFinish(s,won,price,mode){const A=s.auc;if(!A)return;s.auc=null;const cp=(COMPS[A.c]||[])[A.i];if(!cp)return;
  if(won){const d={st:1,mode,pay:'cash'};const h=maClose(s,A.c,A.i,d,price,'auction');if(h){h.how='auction';if(mode==='sub'){(s.rev=s.rev||{})[cp.n]={v:compVol(cp,s)||maStat(s,A.c,A.i).v,t:mi(s)};}return h;}return null;}
  const best=A.bids.slice().sort((a,b)=>b.b-a.b)[0],who=best?best.who:A.who;
  if(A.cont){(s.compK=s.compK||{})[cp.n]=0.85;addLog(`${COUNTRIES[A.c].name}: «${A.nm}» досталась покупателю — ${who}${best?` (${money(best.b)})`:''}. Марка продолжает работу.`,'hist');}
  else{(s.dead=s.dead||{})[cp.n]=mi(s);addLog(`${COUNTRIES[A.c].name}: «${A.nm}» больше нет — её заводы купил ${who}${best?` за ${money(best.b)}`:''}.`,'hist');}
  return null;}
function aucTick(s){if(s.auc&&mi(s)>=s.auc.until)aucFinish(s,false);}

/* ---------- вкладка «Рынок»: карточка «Сделки» ---------- */
function moodTxt(m){return m>=70?'довольны':m>=45?'спокойны':m>=30?'ворчат':'недовольны';}
function holdingsHTML(s){const L=s.hold||[];if(!L.length)return '';
  const rows=L.map(h=>{const M=maStat(s,h.c,h.i),k=maKey(h.c,h.i),nm=h.nm||(M&&M.nm)||h.n,where=COUNTRIES[h.c].name;
    if(h.mode==='int')return `<div class="deal-row"><div style="flex:1"><b>${esc(nm)}</b> <span class="pill good">под вашим брендом</span><small class="muted">${where} · с ${1895+Math.floor((h.t||0)/12)} года${h.capAdd?` · заводы +${fmtN(h.capAdd)} машин в месяц`:''}${h.dlAdd?` · дилеры +${fmtN(h.dlAdd)}`:''} · её покупатели с вами: ${pct(maLoy(s,h),0)} былой доли</small></div></div>`;
    if(!M)return '';const sell=Math.round(M.V*h.st*0.9/1000)*1000,inv=Math.max(2000,Math.round(M.V*0.12/1000)*1000),icost=maIntCost(s,M);
    return `<div class="deal-row"><div style="flex:1"><b>${esc(nm)}</b> <span class="pill">${Math.round(h.st*100)}%</span><small class="muted">${where} · ${fmtN(Math.round(M.v))} машин в год · прибыль ≈${money(Math.max(0,h.p12||M.profit))} в год · вам дивиденды ≈${money(Math.max(0,(h.p12||M.profit)*h.st*0.6))} · директора ${moodTxt(h.mood??60)}${(h.veto||0)>mi(s)?' · запрет на ваш класс':''}</small>
      <div class="btns" style="margin-top:6px"><button class="btn sm" data-act="maInv" data-k="${k}" data-v="${inv}" ${s.cash<inv?'disabled':''}>Вложить ${money(inv)}</button>${h.st<1?`<button class="btn sm" data-act="dealOpen" data-c="${h.c}" data-i="${h.i}" data-st="${h.st<0.5?0.51:1}">Докупить до ${h.st<0.5?'51':'100'}%</button>`:`<button class="btn sm" data-act="maMerge" data-k="${k}" ${s.cash<icost?'disabled':''}>Под ваш бренд · ${money(icost)}</button>`}<button class="btn sm" data-act="maSell" data-k="${k}" data-v="${sell}">Продать долю · ${money(sell)}</button></div></div></div>`;}).join('');
  return `<div class="label" style="margin-top:12px">Ваши компании</div>${rows}`;}
function dealsCard(s){maMigrate(s);const sel=(s.ui&&s.ui.dealC)||s.country,cs=Object.keys(COUNTRIES);
  const L=(COMPS[sel]||[]).map((cp,i)=>({cp,i})).filter(o=>!o.cp.imp&&!pkIs(o.cp,s)&&compAlive(o.cp,s)).map(o=>{const M=maStat(s,sel,o.i),b=dealBlock(s,sel,o.i),h=holdOf(s,sel,o.i);return {...o,M,b,h};}).sort((a,b)=>b.M.v-a.M.v);
  const rows=L.map(o=>{const M=o.M,nm=M.nm,tag=o.h&&o.h.mode==='int'?'<span class="pill good">под вашим брендом</span>':o.h?`<span class="pill">ваши ${Math.round(o.h.st*100)}%</span>`:o.b==='в концерне'?'<span class="pill muted">в концерне</span>':o.b==='пауза'?'<span class="pill warn">пауза</span>':o.b?`<span class="pill muted">${esc(o.b)}</span>`:'';
    return `<div class="deal-row"><div style="flex:1"><b>${esc(nm)}</b> ${tag}<small class="muted">${fmtN(Math.round(M.v))} машин в год · доля ${pct(M.sh,M.sh<0.1?1:0)}${M.tr?` · <span class="${M.tr>0?'good':'bad'}">${M.tr>0?'▲':'▼'}${Math.round(Math.abs(M.tr)*100)}%</span>`:''} · оценка ${money(M.V)}</small></div>${o.b?'':`<button class="btn sm" data-act="dealOpen" data-c="${sel}" data-i="${o.i}">Переговоры</button>`}</div>`;}).join('');
  const own=s.hold||[],auc=s.auc;
  const body=`<p class="small muted" style="margin-top:2px">Купите долю в марке-конкуренте — она останется отдельной маркой со своими директорами, а вам пойдут дивиденды. Или поглотите её целиком: её заводы, дилеры, права на модели и технологии станут вашими, а марка исчезнет. Владельцы отвечают сразу.</p>
    ${auc?`<p class="small warn" style="margin-top:6px">Идут торги: «${esc(auc.nm)}» (${COUNTRIES[auc.c].name}) — до ${MONTHS[(auc.until)%12]}. <button class="btn sm" data-act="aucOpen">Ставка</button></p>`:''}
    ${holdingsHTML(s)}
    <div class="chips sm" style="margin-top:10px">${cs.map(c=>`<button class="chip ${sel===c?'on':''}" data-act="dealC" data-v="${c}">${COUNTRIES[c].name}</button>`).join('')}</div>
    <div style="margin-top:6px">${rows||'<p class="small muted">Здесь пока нет марок.</p>'}</div>
    ${typeof bbHTML==='function'?bbHTML(s):''}`;
  return foldCard('deals',false,`<h2>Сделки</h2><span class="label">доли, поглощения, торги</span>`,body,(own.length?`ваши компании: ${own.map(h=>esc(h.nm||h.n)+(h.mode==='sub'?` ${Math.round(h.st*100)}%`:'')).join(', ')}`:'купить долю, поглотить конкурента, торги после банкротств')+(typeof bbShare==='function'&&bbShare(s)>0?` · совладельцы ${Math.round(bbShare(s)*100)}% — можно выкупить`:''));}

/* ---------- лист переговоров ---------- */
let NEG=null;
function openDeal(c,i,pre){const s=G;maMigrate(s);const cp=(COMPS[c]||[])[i];if(!cp)return;const b=dealBlock(s,c,i);if(b){toast('Переговоры невозможны: '+b);return;}
  const h=holdOf(s,c,i),st0=h?h.st:0;pre=pre||{};const st=pre.st||(st0>=0.5?1:st0>0?0.51:1);
  NEG={c,i,d:{st:Math.max(st,st0+0.01>1?1:st),mode:pre.mode||'sub',pay:pre.pay||'cash'},k:1,round:0,log:[],ask:null,done:null};renderDeal();}
function negPrice(s){const Q=maAsk(s,NEG.c,NEG.i,NEG.d);if(!Q||!Q.M)return 0;const base=Math.round(Q.M.V*Q.st/1000)*1000;return Math.max(1000,Math.round(base*NEG.k/1000)*1000);}
function renderDeal(){const s=G;if(!NEG)return;const {c,i,d}=NEG,M=maStat(s,c,i);if(!M)return;const nm=M.nm,h=holdOf(s,c,i),have=h?h.st:0,m=compModel(M.cp,s),ph=m&&m[2]&&IMG[m[2]];
  if(d.mode==='int'&&d.st<1)d.mode='sub';const P=negPrice(s),icost=d.mode==='int'?maIntCost(s,M):0,Q=maAsk(s,c,i,d),add=Math.max(0,Math.min(1,d.st)-have);
  const chip=(k,v,lab,on,dis)=>`<button class="chip ${on?'on':''}" data-act="negSet" data-k="${k}" data-v="${v}" ${dis?'disabled':''}>${lab}</button>`;
  const stakes=[0.25,0.51,1].filter(x=>x>have+0.001).map(x=>chip('st',x,Math.round(x*100)+'%',Math.abs(d.st-x)<0.001)).join('');
  const why=d.mode==='int'?`<b>Под ваш бренд:</b> марки «${esc(nm)}» больше не будет. Её заводы (+${fmtN(Math.round(M.capU))} машин в месяц), ${fmtN(M.dl)} ${plural(M.dl,'дилер','дилера','дилеров')} — в одну вашу сеть${c===s.country?'':`, машины в стране «${COUNTRIES[c].name}» станут местными, без пошлины`}; права на её модель и технологии — ваши. Её покупатели сначала пойдут к вам, но за 3–4 года разойдутся по тем, чьи машины лучше. Переоформление дилеров и заводов — ${money(icost)}.`
    :`<b>Дочерняя компания:</b> «${esc(nm)}» остаётся отдельной маркой со своими директорами и заводами — её продажи не ваши. Вам — ${Math.round(Math.min(1,d.st)*100)}% её прибыли дивидендами (≈${money(Math.max(0,M.profit*Math.min(1,d.st)*0.6))} в год сейчас)${d.st>=0.5?', право запретить ей выходить в ваш класс':''}; можно вкладывать деньги, докупить или продать долю, позже — поглотить. Директора независимы: будут просить денег и могут предложить выкупить вашу долю.`;
  const ks=[[0.8,'−20%'],[0.9,'−10%'],[1,'оценка'],[1.1,'+10%'],[1.2,'+20%'],[1.4,'+40%']].map(([k,lab])=>`<button class="chip ${Math.abs(NEG.k-k)<0.001?'on':''}" data-act="negK" data-v="${k}">${lab}</button>`).join('');
  const log=NEG.log.map(x=>`<div class="neg-say ${x.k}"><b>${x.who}:</b> ${esc(x.t)}</div>`).join('');
  const over=NEG.done,need=(d.pay==='cash'?P:0)+icost,can=!over&&!s.pending.length&&s.cash>=need&&NEG.round<3;
  openSheet(`<div class="row"><div><span class="label">Переговоры · ${COUNTRIES[c].name}</span><h2 style="margin-top:2px">«${esc(nm)}»</h2></div><button class="iconbtn" data-act="negEnd" aria-label="Закрыть">×</button></div>
    ${ph?`<img class="cmp-ph" style="margin-top:8px;max-width:100%" src="${ph.src}" alt="" referrerpolicy="no-referrer">`:''}
    <p class="small" style="margin-top:8px">${fmtN(Math.round(M.v))} машин в год · доля рынка ${pct(M.sh,1)}${M.tr?` · ${M.tr>0?'растёт':'падает'} на ${Math.round(Math.abs(M.tr)*100)}%`:''}${m?` · модель — ${esc(m[1])}`:''}${have?` · у вас уже ${Math.round(have*100)}%`:''}.</p>
    <p class="small muted" style="margin-top:4px">Оценка аналитиков: выручка ${money(M.rev)} × маржа ${pct(M.m,0)} = прибыль ${money(M.profit)} × ${M.PE.toFixed(1)} (${M.tr>0.05?'растёт — дороже':M.tr<-0.05?'падает — дешевле':'ровно'}) + заводы и дилеры → <b>${money(M.V)}</b> за всю марку.</p>
    <div class="label" style="margin-top:10px">Какая доля будет у вас</div><div class="chips sm">${stakes}</div>
    <div class="label" style="margin-top:8px">Как управлять</div><div class="chips sm">${chip('mode','sub','Дочерняя компания',d.mode==='sub')}${chip('mode','int','Под ваш бренд',d.mode==='int',d.st<1)}</div>
    <div class="label" style="margin-top:8px">Чем платить</div><div class="chips sm">${chip('pay','cash','Деньгами',d.pay==='cash')}${chip('pay','swap','Акциями',d.pay==='swap')}</div>
    <p class="small" style="margin-top:8px">${why}${d.pay==='swap'?` Оплата акциями: владельцы «${esc(nm)}» станут вашими совладельцами и будут получать ≈${Math.round(clamp(P/(P+Math.max(1,companyValue(s))),0.01,0.6)*100)}% вашей прибыли.`:''}</p>
    <div class="label" style="margin-top:10px">Ваше предложение за ${Math.round(add*100)}%</div><div class="chips sm">${ks}</div>
    ${log?`<div class="neg-log" style="margin-top:10px">${log}</div>`:''}
    ${over==='yes'?`<p class="small good" style="margin-top:10px">Сделка закрыта.</p><button class="btn primary block" style="margin-top:8px" data-act="negEnd">Готово</button>`:over?`<p class="small warn" style="margin-top:10px">${esc(over)}</p><button class="btn block" style="margin-top:8px" data-act="negEnd">Закрыть</button>`
      :`${NEG.ask?`<button class="btn primary block" style="margin-top:10px" data-act="negAsk" ${s.cash<(d.pay==='cash'?NEG.ask:0)+icost||s.pending.length?'disabled':''}>Согласиться на ${money(NEG.ask)}</button>`:''}
    <button class="btn ${NEG.ask?'':'primary'} block" style="margin-top:8px" data-act="negGo" ${can?'':'disabled'}>${s.cash<need&&d.pay==='cash'?'Не хватает денег':NEG.round>=3?'Владельцы устали торговаться':`Предложить ${money(P)}${icost?` (+${money(icost)} переоформление)`:''}`}</button>
    <p class="small muted" style="margin-top:6px">Можно сделать до трёх предложений. ${Q&&!Q.refuse&&NEG.round===0?'':''}Уйдёте после встречной цены — она будет ждать вас полгода.</p>`}`);}
function negGo(){const s=G;if(!NEG||NEG.done)return;const {c,i,d}=NEG,P=negPrice(s),A=maAnswer(s,c,i,d,P),nm=(maStat(s,c,i)||{}).nm||'';NEG.round++;
  NEG.log.push({who:'Вы',k:'me',t:`Предлагаем ${money(P)} за ${Math.round(Math.max(0,Math.min(1,d.st)-((holdOf(s,c,i)||{}).st||0))*100)}%${d.pay==='swap'?' акциями':''}${d.mode==='int'?', марка уходит под наш бренд':''}.`});
  if(A.k==='yes'){const h=maClose(s,c,i,d,P);if(h){NEG.log.push({who:'Владельцы «'+nm+'»',k:'yes',t:maSay('yes')});NEG.done='yes';save();}else NEG.log.push({who:'Банк',k:'no',t:'Денег на счету не хватает.'});}
  else if(A.k==='counter'){NEG.ask=A.ask;NEG.log.push({who:'Владельцы «'+nm+'»',k:'counter',t:maSay('counter',A.ask)});}
  else if(A.k==='no'){NEG.log.push({who:'Владельцы «'+nm+'»',k:'no',t:maSay(A.why==='small'?'small':'proud')});if(A.why==='proud'){NEG.done='Владельцы не продают марку — в этом году разговора не будет.';(s.dealNo=s.dealNo||{})[c+i]=mi(s)+12;}}
  else{NEG.log.push({who:'Владельцы «'+nm+'»',k:'low',t:maSay(A.far?'far':'low')});}
  if(!NEG.done&&NEG.round>=3&&A.k!=='yes'){NEG.done='Три предложения не устроили владельцев. Следующие переговоры — через полгода.';(s.dealNo=s.dealNo||{})[c+i]=mi(s)+6;}
  renderDeal();if(NEG.done==='yes'){checkAch();flushToasts();}}
function negAsk(){const s=G;if(!NEG||!NEG.ask||NEG.done)return;const {c,i,d}=NEG,h=maClose(s,c,i,d,NEG.ask),nm=(maStat(s,c,i)||{}).nm||'';
  NEG.log.push({who:'Вы',k:'me',t:`Согласны на ${money(NEG.ask)}.`});if(h){NEG.log.push({who:'Владельцы «'+nm+'»',k:'yes',t:maSay('yes')});NEG.done='yes';save();checkAch();flushToasts();}else NEG.log.push({who:'Банк',k:'no',t:'Денег на счету не хватает.'});renderDeal();}
// встречная цена ждёт полгода (её покажут, когда вы вернётесь)
function negEnd(){const s=G;if(NEG&&!NEG.done&&NEG.ask){s.maOffer={c:NEG.c,i:NEG.i,until:mi(s)+6,prem:Math.max(-0.3,(NEG.ask/Math.max(1,(maStat(s,NEG.c,NEG.i)||{V:1}).V*Math.max(0.01,Math.min(1,NEG.d.st)-((holdOf(s,NEG.c,NEG.i)||{}).st||0))))-1)};}
  NEG=null;closeSheet();rerender();}
/* ---------- лист торгов ---------- */
function openAuction(){const s=G,A=s.auc;if(!A){toast('Торгов сейчас нет');return;}const M=maStat(s,A.c,A.i);if(!M){s.auc=null;return;}
  const opts=[0.45,0.6,0.75,0.9,1.05,1.2].map(k=>Math.round(A.V*k/1000)*1000).filter(b=>b>=A.start);
  const btn=b=>`<button class="btn" data-act="aucBid" data-v="${b}" ${s.cash<b?'disabled':''}>${money(b)}<small>шанс ≈${Math.round(aucWinP(A,b)*100)}%</small></button>`;
  openSheet(`<div class="row"><div><span class="label">Торги · ${COUNTRIES[A.c].name}</span><h2 style="margin-top:2px">«${esc(A.nm)}»</h2></div><button class="iconbtn" data-act="close" aria-label="Закрыть">×</button></div>
    <p class="small" style="margin-top:8px">${esc(A.txt)}</p>
    <p class="small muted" style="margin-top:6px">Заводы на ${fmtN(Math.round(M.capU))} машин в месяц, ${fmtN(M.dl)} ${plural(M.dl,'дилер','дилера','дилеров')}, имя марки и права на модели. Оценка — ${money(A.V)}, стартовая цена — ${money(A.start)}. Претенденты: ${A.bids.map(b=>esc(b.who)).join(', ')} — их ставки тайные.</p>
    <div class="label" style="margin-top:10px">Ваша ставка</div><div class="btns deal-offers" style="margin-top:6px">${opts.map(btn).join('')}</div>
    <div class="label" style="margin-top:10px">Если выиграете</div><div class="chips sm">${['int','sub'].map(m=>`<button class="chip ${((s.ui&&s.ui.aucMode)||'int')===m?'on':''}" data-act="aucMode" data-v="${m}">${m==='int'?'Под ваш бренд':'Возродить марку (дочерняя)'}</button>`).join('')}</div>
    <p class="small muted" style="margin-top:6px">Проиграете — деньги останутся у вас. ${A.hist?`В истории марку купил ${esc(A.who)}.`:''}</p>`);}
function aucBid(b){const s=G,A=s.auc;if(!A||s.cash<b)return;const best=Math.max(...A.bids.map(x=>x.b)),mode=(s.ui&&s.ui.aucMode)||'int';
  if(b>best){const h=aucFinish(s,true,b,mode);closeSheet();if(h){pushEvent({kicker:'Торги',own:1,title:`«${s.company}» выиграла торги за «${A.nm}»`,deck:`${money(b)} · ${COUNTRIES[A.c].name}`,text:`Ставка «${s.company}» — ${money(b)} — оказалась выше всех (ближайшая — ${money(best)}). ${mode==='int'?`Заводы и дилеры «${A.nm}» переходят под ваш бренд, права на модели и технологии — ваши.`:`«${A.nm}» продолжит работу как ваша дочерняя компания — со своими директорами и дилерами.`}`},true);try{auFanfare('deal');}catch(_){}}}
  else{const who=(A.bids.find(x=>x.b===best)||{}).who||A.who;closeSheet();aucFinish(s,false);toast(`Торги выиграл ${who}: ${money(best)}`);}
  save();rerender();flushToasts();}

/* ---------- ответы на события и кнопки ---------- */
function maResolve(s,key){const p=key.split(':');const k2=p[2]==='Y'||p[2]==='N'?p[3]:p[2];
  if(p[1]==='talk'){s.pending.shift();save();render();const [c,i]=String(p[2]).split('|');openDeal(c,+i,p[3]==='swap'?{st:1,pay:'swap',mode:'sub'}:{st:1});return true;}
  if(p[1]==='auc'){s.pending.shift();save();render();openAuction();return true;}
  if(p[1]==='aucSkip'){aucFinish(s,false);return false;}
  if(p[1]==='stk'){if(p[2]==='Y'){const P=+p[3];s.cash+=P;(s.partners=s.partners||[]).push({n:'Финансисты',sh:0.2,t:mi(s)});addLog(`Продано 20% «${s.company}» за ${money(P)}: новые совладельцы получают 20% прибыли.`,'good');}return false;}
  if(p[1]==='sell'){if(p[2]==='Y'){const P=+p[3],mine=Math.round(P*(1-partnersShare(s)));rbArchive(s,P,mine);s.soldTo={price:P,mine,y:s.y,m:s.m,co:s.company};s.over=true;s.pending.shift();
      s.pending.push({title:'Компания продана',deck:`«${s.company}» — новым хозяевам за ${money(P)}`,text:`Вы продали «${s.company}» за ${money(P)}${mine<P?` — вам ${money(mine)}, остальное совладельцам`:''}. Новые хозяева уже меняют вывески в конторе.\nНа эти деньги можно начать снова: купить действующую марку любой страны — с заводами, дилерами и машинами — и вести её до 1930 года. Или подвести итог: посмотреть, какой след остался.`,paper:true,own:1,choices:[['Купить другую марку','ma:rebuy'],['Сравнить с историей','final']]});save();render();return true;}return false;}
  if(p[1]==='rebuy'){s.pending.shift();save();render();openRebuy();return true;}
  const h=maByKey(s,k2);if(!h)return false;const M=maStat(s,h.c,h.i);
  if(p[1]==='inv'){if(p[2]==='Y'){const amt=+p[4];if(s.cash>=amt&&M){s.cash-=amt;h.inv=(h.inv||0)+amt;h.boost=(h.boost||0)+amt/M.V*0.9;h.mood=clamp((h.mood??60)+10,0,100);addLog(`Вложено ${money(amt)} в «${h.nm||h.n}»: новый цех, директора довольны.`,'good');}else{h.mood-=10;addLog('Денег на вложение не хватило — директора недовольны.','bad');}}
    else{h.mood=clamp((h.mood??60)-15,0,100);addLog(`Вы отказали директорам «${h.nm||h.n}» в деньгах.`,'bad');}return false;}
  if(p[1]==='bb'){if(p[2]==='Y'){const P=+p[4];s.cash+=P;s.hold=s.hold.filter(x=>x!==h);addLog(`Доля в «${h.nm||h.n}» продана директорам за ${money(P)}.`,'good');}else h.mood=clamp((h.mood??60)-8,0,100);return false;}
  if(p[1]==='cmp'){if(p[2]==='Y'){h.veto=mi(s)+24;h.vetoG=p[4];h.mood=clamp((h.mood??60)-20,0,100);addLog(`Вы запретили «${h.nm||h.n}» выходить в ваш класс на два года. Директора обижены.`,'bad');}else h.mood=clamp((h.mood??60)+5,0,100);return false;}
  return false;}
const DEAL_ACT={
  dealC:d=>{G.ui=G.ui||{};G.ui.dealC=d.v;rerender();},
  dealOpen:d=>openDeal(d.c,+d.i,d.st?{st:+d.st}:null),
  negSet:d=>{if(!NEG)return;NEG.d[d.k]=d.k==='st'?+d.v:d.v;if(NEG.d.mode==='int'&&NEG.d.st<1)NEG.d.mode='sub';NEG.ask=null;renderDeal();},
  negK:d=>{if(!NEG)return;NEG.k=+d.v;renderDeal();},
  negGo:()=>negGo(),negAsk:()=>negAsk(),negEnd:()=>negEnd(),
  aucOpen:()=>openAuction(),aucBid:d=>aucBid(+d.v),aucMode:d=>{G.ui=G.ui||{};G.ui.aucMode=d.v;openAuction();},
  maInv:d=>{const s=G,h=maByKey(s,d.k),amt=+d.v,M=h&&maStat(s,h.c,h.i);if(!h||!M||s.cash<amt)return;s.cash-=amt;h.inv=(h.inv||0)+amt;h.boost=(h.boost||0)+amt/M.V*0.9;h.mood=clamp((h.mood??60)+6,0,100);addLog(`Вложено ${money(amt)} в «${h.nm||h.n}».`,'good');rerender();},
  maSell:d=>{const s=G,h=maByKey(s,d.k);if(!h)return;if(!confirmOnce('maSell'+d.k,'Нажмите ещё раз: продать долю'))return;s.cash+=+d.v;s.hold=s.hold.filter(x=>x!==h);addLog(`Доля в «${h.nm||h.n}» продана за ${money(+d.v)}.`,'good');rerender();},
  maMerge:d=>{const s=G,h=maByKey(s,d.k),M=h&&maStat(s,h.c,h.i);if(!h||!M||h.st<1)return;const ic=maIntCost(s,M);if(s.cash<ic)return;if(!confirmOnce('maMerge'+d.k,'Нажмите ещё раз: марка исчезнет, всё — под ваш бренд'))return;s.cash-=ic;maIntegrate(s,h,M);addLog(`«${h.nm||h.n}» поглощена: заводы, дилеры, права на модели и технологии — под маркой «${s.company}».`,'good');try{auFanfare('deal');}catch(_){}rerender();}};
