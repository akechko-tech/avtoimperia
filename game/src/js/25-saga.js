/* ================= ФИЛЬМ О ПЕРСОНАЖЕ: главы по настоящей истории, выбор в конце главы влияет на игру ================= */
// Семь глав на героя (25b-saga-a.js, 25c-saga-b.js): начало пути, первая машина, гонки, большой успех, война, кризис, 1929 год.
// Глава приходит, когда в игре наступил её момент (год, продажи, первая гонка…). Смотреть можно заново — во вкладке «Империя».
const SAGA={};
const BN_ADD={race:1,convEarly:1};
// 0.35: у пути «Мотомастерская» — свой фильм (25d-saga-moto.js): свой персонаж-мотоциклист не смотрит историю автомобильной мастерской
// 0.37: у авиатора — свои фильмы (SAGA.air и герои-авиаторы, 25g-saga-air.js), не автомобильные
function sagaList(s){return (s.pioneer!=='custom'&&SAGA[s.pioneer])||(s.airStart&&(SAGA.air||[]))||(s.motoStart&&SAGA.moto)||SAGA.custom||[];}
function sagaFill(t,s){const P=PIONEERS[s.pioneer]||PIONEERS.custom;return String(t||'').replace(/\{name\}/g,s.pioneer==='custom'?(s.hero||'Основатель'):P.name).replace(/\{co\}/g,s.company).replace(/\{city\}/g,cityOf(s)).replace(/\{y\}/g,s.y);}
// Момент главы: год, первая машина, гонка, победа, продажи, война, кризис, 1929…
function sagaCond(s,w){const S=s.saga||{};
  if(w==='start')return true;
  if(w==='firstProd')return s.models.some(m=>m.id!==1&&(m.status==='prod'||m.status==='sale'))||mi(s)-(S.t0||0)>=10;
  if(w==='firstRace')return (s.raceLog||[]).length>0;
  if(w==='firstWin')return (s.raceLog||[]).some(r=>r.place===1);
  if(w==='cashLow')return s.cash<0;
  if(w==='war')return s.country==='us'?(s.y>1917||(s.y===1917&&s.m>=3)):(s.y>1914||(s.y===1914&&s.m>=7));
  if(w==='crisis')return s.y>=1920;
  if(w==='finale')return s.y>=1929;
  if(w==='tech:line')return ((s.tech||{}).line||0)>=1;
  if(w==='king')return (s.titles||[]).some(t=>/^king-/.test(t.id||''));
  const tm=/^t:([\d.]+)$/.exec(w);if(tm)return yf(s)>=+tm[1];
  const m=/^(y|sold|yearSold):(\d+)$/.exec(w);if(m){const v=+m[2];return m[1]==='y'?s.y>=v:m[1]==='sold'?totalSold(s)>=v:Math.max((s.peak||{}).year||0,s.yearSold||0)>=v;}
  // 0.37: моменты авиатора — первый полёт, первые продажи, первое состязание, военный заказ, война, фронт (25g-saga-air.js)
  if(typeof airSagaCond==='function'){const r=airSagaCond(s,w);if(r!==undefined)return r;}
  return false;}
/* ---------- 0.25: глава знает, что происходит в игре ----------
   Фильм рассказывает настоящую историю, но не должен спорить с партией: богатой фирме не предлагают «искать денег на долг»,
   а решение, уже принятое в газете (суд, заказ, раскол семьи), фильм не спрашивает второй раз.
   v:[{if:s=>…, sc, q, o, t}] — вариант главы (первый подходящий); выбранный вариант запоминается, повтор показывает тот же.
   fx.legal:'событие:решение' — выбор в фильме и есть решение по газетному событию (11c-legal.js): его деньги и последствия.
   fx.cashK — доля кассы (выкуп акций у богатой фирмы стоит не «пару тысяч», а треть кассы). */
function sagaMonthCost(s){const r=s.last||{},a=r.air||{};return Math.max(1,(r.mat||0)+(r.wage||0)+(r.ovh||0)+(r.dlr||0)+(r.ad||0)+(r.rd||0)+(r.int||0)+(a.mat||0)+(a.wage||0)+(a.ovh||0));}   // 0.37: и авиацех
// 0.35: деньги в выборе — по масштабу компании (отзыв: «денег не берут — сумма должна быть сообразна масштабу моего бизнеса»).
// Суммы глав задуманы для мастерской — около $1000 расходов в месяц в ценах 1895 года; у фирмы покрупнее они во столько раз больше,
// во сколько больше её расходы за месяц: «+$700 за первую машину» у мастерской — это и «+3 месяца расходов» у концерна
function sagaScale(s){const k=sagaMonthCost(s)/(1000*cpi(s));return k>1?k:1;}
// Но не больше десятой части свободных денег (и не меньше суммы, задуманной для мастерской): у фирмы с большим оборотом и пустой кассой
// выбор в фильме не должен её разорить, мастерская платит и получает, как прежде, а один выбор не меняет кассу больше чем на десятую часть.
function sagaCash(s,fx){if(!fx||!fx.cash)return 0;const base=fx.cash*cpi(s),lim=Math.max(Math.abs(base),0.1*Math.max(0,s.cash));
  return Math.round(clamp(base*sagaScale(s),-lim,lim)/10)*10;}
function sagaRich(s){return s.cash>Math.max(60000*cpi(s),sagaMonthCost(s)*6)&&(s.loan||0)<=Math.max(0,s.cash)*0.15;}
function sagaPoor(s){return s.cash<4000*cpi(s)||((s.loan||0)>0&&s.loan>Math.max(0,s.cash)*0.5);}
function sagaChose(s,id){const w=(s.wpick||{})[id];if(w)return w;
  // сохранения до 0.25: решение по иску Доджей не записано — узнаём по дивидендам (2% выручки до 1920 года)
  if(id==='dodgesuit'&&(s.wseen||{}).dodgesuit){const L=s.legal||{};return L.roy&&L.roy.k===0.02&&L.roy.until===miAt(1920,0)?'lDodgePay':'lDodgeBuy';}
  return '';}
function sagaChapter(s,ch,fix){if(!ch||!ch.v)return ch;const S=s.saga=s.saga||{seen:[],pick:{}};S.var=S.var||{};
  let k=S.var[ch.id];if(k===undefined){k=ch.v.findIndex(v=>{try{return !!v.if(s);}catch(e){return false;}});if(fix)S.var[ch.id]=k;}
  const v=k>=0?ch.v[k]:null;if(!v)return ch;const o={...ch,...v};delete o.v;delete o.if;return o;}
function sagaReady(s,ch){const W=Array.isArray(ch.when)?ch.when:[ch.when];if(W.every(w=>sagaCond(s,w)))return true;
  // запасной путь: глава не «застревает», если игрок не гоняется или продаёт мало — через три года после её даты она всё равно придёт
  return !W.includes('start')&&!W.includes('finale')&&ch.y>0&&s.y>=ch.y+3;}
// Проверка раз в месяц: не чаще одной главы в два месяца, по порядку
function sagaCheck(s){if(!s||s.over)return;const S=s.saga=s.saga||{seen:[],pick:{},last:-99,t0:mi(s)};if(!S.seen)S.seen=[];
  if(s.pending.some(p=>p.saga))return;if(S.seen.length&&mi(s)-S.last<2)return;
  const L=sagaList(s);for(let k=0;k<L.length;k++){const ch=L[k];if(S.seen.includes(ch.id))continue;if(!sagaReady(s,ch))continue;
    s.pending.push({saga:ch.id,title:'Фильм: '+ch.t,text:'',choices:[['Смотреть главу','saga']]});S.last=mi(s);return;}}
// Без экрана (проверки, автоигра): глава засчитывается с первым вариантом выбора
function sagaAuto(s,id){const ch=sagaChapter(s,sagaList(s).find(c=>c.id===id),true),o=ch&&ch.o&&ch.o[0];if(o)sagaApply(s,o.fx);const S=s.saga=s.saga||{seen:[],pick:{}};if(!S.seen.includes(id))S.seen.push(id);S.pick=S.pick||{};if(o)S.pick[id]=0;
  const i=s.pending.findIndex(p=>p.saga===id);if(i>=0)s.pending.splice(i,1);}
/* ---------- что даёт выбор: деньги, репутация, временные бонусы, спрос, настроение пилотов ---------- */
const SAGA_B={lineCap:['Выпуск',1],quality:['Качество',1],workerEff:['Выработка рабочих',1],devTime:['Разработка',-1],devCost:['Стоимость разработки',-1],adEff:['Отдача рекламы',1],matCost:['Детали',-1],race:['Скорость в гонках',1],raceRep:['Слава побед',1],drvFee:['Гонорары пилотов',-1],
  // 0.37: авиация — те же множители, что у черт героя-авиатора (bn: airQ, airDev…)
  airQ:['Качество аэропланов',1],airDev:['Разработка',-1],airCost:['Себестоимость аэропланов',-1],airEng:['Моторы',-1],airMil:['Военные заказы',1],airPriv:['Спрос спортсменов и школ',1],
  airFame:['Слава рекордов и призов',1],airFight:['Истребители',1],airMulti:['Многомоторные',1],airTech:['Опытные работы',-1],airSea:['Гидроаэропланы и лодки',1]};
function sagaMonths(n){return n>=24&&n%12===0?`${n/12} ${plural(n/12,'год','года','лет')}`:`${n} ${plural(n,'месяц','месяца','месяцев')}`;}
// что значит решение по газетному событию, если его принимают в фильме
const SAGA_LEGAL_TXT={'fivedollar:lFiveYes':'зарплата «пять долларов в день»: рабочие не уходят, спрос в США +6% на 2 года','fivedollar:lFiveNo':'зарплата — по рынку',
  'oldsboard:lOldsYes':'дорогие машины +12%, народные −10% на 3 года','oldsboard:lOldsBuy':'выкуп доли Смитов — 30% кассы',
  'benzboard:lBenzNew':'новые машины: спрос +8% на 2 года','benzboard:lBenzOld':'старомодные машины: спрос −6% на 2 года',
  'jellinek:lJelYes':'аванс Еллинека; за границей спрос +15% на 3 года','jellinek:lJelNo':'',
  'fiattrial:lFiatLaw':'кредит дороже на 2% до приговора, адвокаты — каждый месяц','fiattrial:lFiatBank':'банк вносит деньги за пакет акций, кредит дороже полгода','fiattrial:':'кредит дороже на 2% до приговора',
  'peugsplit:lPeugOwn':'акционеры вносят деньги на свой завод','peugsplit:lPeugStay':'',
  'lanchrcv:lLanInv':'новые акционеры вносят деньги','lanchrcv:lLanCut':'полгода выпуск меньше, банк не торопит с долгом',
  'scuderia:lScudYes':'компаньоны вносят деньги','scuderia:lScudNo':''};
function sagaLegal(s,key){const [id,ch]=String(key).split(':'),W=(typeof WORLD!=='undefined'?WORLD:[]).find(w=>w.id===id);if(!W)return '';
  s.wseen=s.wseen||{};s.wseen[id]=1;(s.wpick=s.wpick||{})[id]=ch||'';try{W.fx&&W.fx(s);}catch(e){console.warn(e);}
  let t='';try{t=ch&&W.res&&W.res[ch]?(W.res[ch](s)||''):'';}catch(e){console.warn(e);}return t.replace(/\{co\}/g,s.company);}
function sagaFxText(fx,s){const L=[];if(!fx)return '';
  if(fx.cash)L.push(`${fx.cash>0?'+':'−'}${money(Math.abs(sagaCash(s,fx)))}`);
  if(fx.cashK)L.push(`${fx.cashK>0?'+':'−'}${Math.round(Math.abs(fx.cashK)*100)}% кассы (${money(Math.abs(fx.cashK)*Math.max(0,s.cash))})`);
  if(fx.legal&&SAGA_LEGAL_TXT[fx.legal])L.push(SAGA_LEGAL_TXT[fx.legal]);
  if(fx.roy)L.push(`дивиденды компаньонам — ${Math.round(fx.roy[0]*100)}% выручки (${sagaMonths(fx.roy[1])})`);
  if(fx.sup&&typeof SUPPLY!=='undefined')L.push('свои '+fx.sup.map(k=>(SUPPLY.find(x=>x.k===k)||{n:k}).n.toLowerCase()).join(', ')+': детали дешевле');
  if(fx.rep)L.push(`репутация ${fx.rep>0?'+':'−'}${Math.abs(fx.rep)}`);
  Object.entries(fx.b||{}).forEach(([k,[v,mo]])=>{const d=SAGA_B[k];if(!d)return;
    if(k==='race'){L.push(`скорость в гонках +${Math.round(v*100)}% на ${sagaMonths(mo)}`);return;}
    const pc=Math.round((v-1)*100);if(!pc)return;const good=pc*d[1]>0;
    L.push(k==='devTime'||k==='airDev'?`разработка ${pc<0?'быстрее':'медленнее'} на ${Math.abs(pc)}% (${sagaMonths(mo)})`:k==='airEng'||k==='airTech'||k==='airCost'?`${d[0].toLowerCase()} ${pc<0?'дешевле':'дороже'} на ${Math.abs(pc)}% (${sagaMonths(mo)})`:`${d[0].toLowerCase()} ${pc>0?'+':'−'}${Math.abs(pc)}% (${sagaMonths(mo)})`);});
  Object.entries(fx.seg||{}).forEach(([g,[v,mo]])=>{const pc=Math.round((v-1)*100);if(pc&&SEG[g])L.push(`${g==='moto'?'спрос на мотоциклы':g==='moside'?'спрос на мотоциклы с коляской':'спрос: '+SEG[g].name.toLowerCase()+' класс'} ${pc>0?'+':'−'}${Math.abs(pc)}% (${sagaMonths(mo)})`);});
  if(fx.mood)L.push(`настроение пилотов ${fx.mood>0?'+':'−'}${Math.abs(fx.mood)}`);
  if(fx.afame)L.push(`слава авиатора ${fx.afame>0?'+':'−'}${Math.abs(fx.afame)}`);
  if(fx.abroad)L.push('сборка за границей: Версаль не остановит авиацех');
  if(fx.ruSafe)L.push('если придётся уехать — с собой 85% кассы, а не 60%');
  return L.join(' · ');}
function sagaApply(s,fx){if(!fx)return;const now=mi(s),c0=s.cash;
  if(fx.cash)s.cash+=sagaCash(s,fx);
  if(fx.cashK)s.cash+=Math.round(Math.max(0,s.cash)*fx.cashK);
  if(fx.legal){const t=sagaLegal(s,fx.legal);if(t)addLog(t,'hist');}
  if(fx.roy)legalOf(s).roy={k:fx.roy[0],until:now+fx.roy[1]};
  // 0.25: купленные в фильме поставщики (рудники, леса, дорога) — настоящие, в «Финансах» на вкладке «Завод»
  if(fx.sup&&typeof invOf==='function'){const I=invOf(s),M=matSpend(s);const paid=Math.max(0,c0-s.cash)/fx.sup.length;fx.sup.forEach(k=>{const S=SUPPLY.find(x=>x.k===k);if(S&&!I.sup[k])I.sup[k]={cover:M*2,val:paid>0?Math.min(supPrice(s,S),paid):supPrice(s,S),t:now,saga:1};});}
  if(fx.rep)s.rep=clamp(s.rep+fx.rep,0,100);
  const B=s.sagaB=s.sagaB||{};Object.entries(fx.b||{}).forEach(([k,[v,mo]])=>{const o=B[k];if(o&&now<o.until){o.v=BN_ADD[k]?o.v+v:o.v*v;o.until=Math.max(o.until,now+mo);}else B[k]={v,until:now+mo};});
  const SG=s.sagaSeg=s.sagaSeg||{};Object.entries(fx.seg||{}).forEach(([g,[v,mo]])=>{const o=SG[g];if(o&&now<o.until){o.v*=v;o.until=Math.max(o.until,now+mo);}else SG[g]={v,until:now+mo};});
  if(fx.mood&&typeof moodAdd==='function')(s.drivers||[]).forEach(id=>moodAdd(s,id,fx.mood));
  if(fx.ruSafe)s.ruSafe=1;
  if(fx.afame&&s.air)s.air.fame=clamp((s.air.fame||0)+fx.afame,0,100);
  if(fx.abroad&&typeof airSagaAbroad==='function')airSagaAbroad(s);}
// Бонусы глав действуют вместе с чертами героя (10-model.js: bn, segBonus)
function sagaBn(k,v){const S=G&&G.sagaB&&G.sagaB[k];if(!S||mi(G)>=S.until)return v;return BN_ADD[k]?v+S.v:v*S.v;}
function sagaSegK(g){const S=G&&G.sagaSeg&&G.sagaSeg[g];return S&&mi(G)<S.until?S.v:1;}
/* ---------- кинозал: титр главы, сцены с голосом, выбор, итог ---------- */
let SAGAP=null;
// 0.36: фото сцены может зависеть от страны: {de:'…',uk:'…',def:'…'} (война в Германии — немецкая мобилизация, в Британии — Сомма)
function sagaImg(key){if(key&&typeof key==='object')key=key[G&&G.country]||key.def;const im=key&&IMG[key];return im&&im.src?im.src:'';}
// Голоса фильма: рассказчик — aidar (0.36: отзыв «рассказчик пищит, верни мужской приятный голос» — вместо рассказчицы baya),
// мужские роли — eugene, женские — xenia (записаны заранее; нет записи — синтезатор устройства)
const SAGA_NARR='aidar';
/* 0.36: строка с подстановками читается живым голосом по частям: «1903 год.» — отдельной записью (1880–1935), остальное — тоже
   записью, но вместо названия вашей фирмы и имени героя — «фирма», «основатель» (на экране — как было). Иначе — синтезатор. */
const SAGA_SPOKEN_FIX=[['выбирают «{co}».','выбирают эту марку.'],['дома «{co}» знают хуже','дома марку знают хуже'],['вывеску: «{co}».','вывеску со своим именем.'],
  ['принадлежит «{co}».','принадлежит фирме.'],['первая «{co}» на четырёх колёсах','первая машина фирмы на четырёх колёсах'],['с эмблемой «{co}»','с эмблемой фирмы'],
  ['Покупатель знает: «{co}» довезёт','Покупатель знает: эта марка довезёт'],['«{co}» — одно из первых имён Милана','Эта марка — одно из первых имён Милана'],
  ['Велосипеды, мотоциклы, машины — «{co}» делает всё','Велосипеды, мотоциклы, машины — фирма делает всё']];
const SAGA_FUNC=/^(С|с|чем|Что|что|Как|как|Где|где|Чем|ли|Если|если|А|а|но|Но|—|и|И|то|теперь|уже|когда|Когда)$/;
function sagaSpoken(t){let x=String(t||''),y=false;
  x=x.replace(/^(\{city\}|[А-ЯЁ][а-яё-]+), \{y\} год\. /,()=>{y=true;return '';}).replace(/^\{y\} год\. /,()=>{y=true;return '';});
  SAGA_SPOKEN_FIX.forEach(([a,b])=>{x=x.split(a).join(b);});
  x=x.replace(/(^|[.!?]\s+)\{name\} /g,'$1Основатель ').replace(/ \{name\} /g,' ');
  x=x.replace(/(^|\s)у «\{co\}»/g,'$1у фирмы');
  // название после слова «машины», «завод», «мотоциклы»… можно опустить; после «как», «что», «если» — «фирма» (перед глаголом в неопределённой форме — «фирме»)
  x=x.replace(/(\S+) «\{co\}»( ?)(\S*)/g,(m,w,sp,nx)=>{if(/[.!?]$/.test(w))return w+' Фирма'+sp+nx;
    if(SAGA_FUNC.test(w)||/[,:—]$/.test(w))return w+' '+(/^(\S+(ть|ти|чь)|на)[?,.]?$/.test(nx)?'фирме':'фирма')+sp+nx;return w+sp+nx;});
  x=x.replace(/^«\{co\}» /,'Фирма ');
  return /[{}]/.test(x)?null:{y,x:x.trim()};}
function sagaVoiceParts(t,s){const raw=String(t||'');if(!/[{}]/.test(raw))return [sagaFill(raw,s)];const sp=sagaSpoken(raw);if(!sp)return null;return (sp.y?[s.y+' год.']:[]).concat(sp.x?[sp.x]:[]);}
function sagaSay(t,spk,onEnd){const s=G,txt=sagaFill(t,s),P=sagaVoiceParts(t,s);
  if(P&&P.length){const d=P.length>1?voiceSayParts(P,spk,onEnd):voiceDur(P[0],spk)?voiceSay(P[0],spk,onEnd):0;if(d)return d;}
  return voiceSay(txt,spk,onEnd);}
function sagaPreload(t,spk){try{const P=sagaVoiceParts(t,G);if(P&&P[0])voicePreload(P[0],spk);}catch(_){}}
function sagaVoiceOf(sc){return sc&&sc.who?voiceOfWho(sc.who):SAGA_NARR;}
function sagaPlay(id,replay){const s=G,L=sagaList(s),k=L.findIndex(c=>c.id===id),ch=sagaChapter(s,L[k],!replay);if(!ch){if(!replay)sagaDone(id,-1);return;}
  sagaStop();const P=PIONEERS[s.pioneer]||PIONEERS.custom,el=document.createElement('div');el.className='sg';el.id='sagaScreen';
  el.innerHTML=`<div class="sg-bg"><img alt=""></div><div class="sg-shade"></div><div class="sg-bar top"></div><div class="sg-bar bot"></div>
    <div class="sg-body"></div><div class="sg-ctrl"><button class="sg-nav" data-sg="prev" aria-label="Назад">◀</button><button class="sg-nav" data-sg="next" aria-label="Дальше">▶</button><button class="sg-skip">К выбору ▸▸</button></div><div class="sg-dots"></div>`;
  if(!el.querySelector||!el.querySelector('.sg-skip')){if(!replay)sagaAuto(s,id);return;}// без экрана (проверки)
  document.body.appendChild(el);SAGAP={id,ch,k,el,i:-1,replay:!!replay,timer:0,portrait:sagaImg(P.wiki)};
  try{AU.sagaHold=true;musicPlay();}catch(_){}
  try{voiceUnlock();}catch(_){}
  const Q=SAGAP;
  el.querySelector('.sg-skip').onclick=e=>{e.stopPropagation();sagaQuestion();};
  el.querySelectorAll('.sg-nav').forEach(b=>b.onclick=e=>{e.stopPropagation();if(b.dataset.sg==='prev')sagaGo(Math.max(0,Q.i-1));else sagaNext();});
  el.querySelector('.sg-body').onclick=()=>sagaNext();
  // листание пальцем: влево — дальше, вправо — назад
  let sx=null,sy=0;el.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;},{passive:true});
  el.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4&&!Q.q){Q.swiped=performance.now();if(dx<0)sagaNext();else sagaGo(Math.max(0,Q.i-1));}});
  el.addEventListener('click',e=>{if(Q.swiped&&performance.now()-Q.swiped<300){e.stopPropagation();e.preventDefault();}},true);
  try{auInit();auReelFanfare();}catch(_){}
  voiceLoad().then(()=>{if(SAGAP===Q)sagaDots();});sagaDots();
  sagaTitle();}
function sagaDots(){const Q=SAGAP;if(!Q)return;const d=Q.el.querySelector('.sg-dots');if(!d)return;const n=Q.ch.sc.length;d.innerHTML=Array.from({length:n+1},(_,k)=>`<i class="${k<Q.i?'done':k===Q.i?'cur':''}"></i>`).join('');}
function sagaSetBg(src){const Q=SAGAP;if(!Q)return;const im=Q.el.querySelector('.sg-bg img');if(!src){Q.el.classList.add('noimg');im.removeAttribute('src');return;}
  Q.el.classList.remove('noimg');if(im.getAttribute('src')!==src){im.style.opacity=0;im.onload=()=>{im.style.opacity=1;};im.src=src;}
  // медленный наезд камеры по фото (каждый раз — в свою сторону)
  const a=Math.random()<0.5?-1:1;im.style.transition='none';im.style.transform=`scale(1.02) translate(${a*1.5}%,0)`;void im.offsetWidth;im.style.transition='transform 9s ease-out,opacity .8s';im.style.transform=`scale(1.14) translate(${-a*2}%,-1.5%)`;}
function sagaTitle(){const Q=SAGAP,s=G,ch=Q.ch,n=Q.k+1;
  sagaSetBg(sagaImg((ch.sc.find(x=>x.img)||{}).img)||Q.portrait);
  Q.el.querySelector('.sg-body').innerHTML=`<div class="sg-title in"><div class="sg-kick">${esc(PIONEERS[s.pioneer]&&s.pioneer!=='custom'?PIONEERS[s.pioneer].name:sagaFill('{name}',s))} · фильм</div><div class="sg-ch">Глава ${n}</div><div class="sg-t">${esc(sagaFill(ch.t,s))}</div>${ch.y?`<div class="sg-y">${ch.y}</div>`:''}</div>`;
  const sc0=ch.sc[0];if(sc0)sagaPreload(sc0.say||sc0.line||'',sagaVoiceOf(sc0));
  clearTimeout(Q.timer);Q.timer=setTimeout(()=>sagaNext(),2600);}
function sagaNext(){const Q=SAGAP;if(!Q||Q.q)return;sagaGo(Q.i+1);}
function sagaGo(i){const Q=SAGAP;if(!Q)return;if(Q.q){Q.q=0;Q.el.querySelector('.sg-skip').style.visibility='';}clearTimeout(Q.timer);voiceStop();Q.i=i;const s=G,sc=Q.ch.sc[i];if(!sc){sagaQuestion();return;}
  if(sc.img)sagaSetBg(sagaImg(sc.img)||Q.portrait);else if(i===0)sagaSetBg(Q.portrait);
  const txt=sagaFill(sc.say||sc.line||'',s),who=sc.who?sagaFill(sc.who,s):'';
  Q.el.querySelector('.sg-body').innerHTML=sc.who?`<div class="sg-line in"><div class="sg-who">${esc(who)}</div><p>«${esc(txt.replace(/^[«"]|[»"]$/g,''))}»</p></div>`:`<div class="sg-say in"><p>${esc(txt)}</p></div>`;
  sagaDots();
  const nx=Q.ch.sc[i+1];if(nx)sagaPreload(nx.say||nx.line||'',sagaVoiceOf(nx));
  // живой голос: следующая сцена — сразу, как договорит; без голоса — по времени чтения.
  // 0.36: голос «договорил» слишком быстро (запись не загрузилась, нет сети и голоса телефона) — кадр стоит, пока текст можно прочесть
  const t0=performance.now(),need=Math.max(3.8,1.6+txt.length/14)*1000;
  const d=sagaSay(sc.say||sc.line||'',sagaVoiceOf(sc),()=>{if(SAGAP===Q&&!Q.q&&Q.i===i){clearTimeout(Q.timer);const el=performance.now()-t0;Q.timer=setTimeout(()=>sagaNext(),el<need*0.6?need-el:450);}});
  Q.timer=setTimeout(()=>{if(SAGAP===Q&&Q.i===i)sagaNext();},(d?d+6:Math.max(3.8,1.6+txt.length/14))*1000);}
function sagaQuestion(){const Q=SAGAP;if(!Q)return;clearTimeout(Q.timer);voiceStop();const s=G,ch=Q.ch;Q.q=1;Q.i=ch.sc.length;sagaDots();
  if(Q.replay){const pk=(s.saga&&s.saga.pick||{})[ch.id],o=ch.o&&ch.o[pk];Q.el.querySelector('.sg-body').innerHTML=`<div class="sg-q in"><h3>${esc(sagaFill(ch.q,s))}</h3>${o?`<p class="sg-res">Ваш выбор: «${esc(sagaFill(o.t,s))}». ${esc(sagaFill(o.res,s))}</p>`:''}<button class="sg-o" data-k="-1"><b>Закрыть</b></button></div>`;}
  else Q.el.querySelector('.sg-body').innerHTML=`<div class="sg-q in"><h3>${esc(sagaFill(ch.q,s))}</h3>${(ch.o||[]).map((o,i)=>`<button class="sg-o" data-k="${i}"><b>${esc(sagaFill(o.t,s))}</b><small>${esc(sagaFxText(o.fx,s))}</small></button>`).join('')}</div>`;
  Q.el.querySelector('.sg-skip').style.visibility='hidden';
  Q.el.querySelectorAll('.sg-o').forEach(b=>b.onclick=e=>{e.stopPropagation();sagaPick(+b.dataset.k);});
  if(!Q.replay)sagaSay(ch.q,SAGA_NARR);}
function sagaPick(k){const Q=SAGAP;if(!Q)return;const s=G,ch=Q.ch,o=ch.o&&ch.o[k];
  if(Q.replay||k<0||!o){sagaStop();return;}
  sagaApply(s,o.fx);addLog(`🎬 «${sagaFill(ch.t,s)}»: ${sagaFill(o.t,s)}. ${sagaFill(o.res,s)}`,'hist');
  Q.el.querySelector('.sg-body').innerHTML=`<div class="sg-q in"><p class="sg-res">${esc(sagaFill(o.res,s))}</p><p class="sg-fx">${esc(sagaFxText(o.fx,s))}</p><button class="sg-o" data-k="-1"><b>Дальше ▸</b></button></div>`;
  Q.el.querySelector('.sg-o').onclick=e=>{e.stopPropagation();sagaDone(ch.id,k);};
  sagaSay(o.res,SAGA_NARR);}
function sagaDone(id,k){const s=G,S=s.saga=s.saga||{seen:[],pick:{},last:mi(s)};if(!S.seen.includes(id))S.seen.push(id);if(k>=0){S.pick=S.pick||{};S.pick[id]=k;}
  sagaStop();const i=s.pending.findIndex(p=>p.saga===id);if(i>=0)s.pending.splice(i,1);save();render();}
function sagaStop(){const Q=SAGAP;SAGAP=null;voiceStop();if(!Q)return;clearTimeout(Q.timer);try{if(AU.sagaHold){AU.sagaHold=false;musicPlay();}}catch(_){}Q.el.classList.add('out');setTimeout(()=>{try{Q.el.remove();}catch(_){}},400);}
// Карточка «Фильм о вас»: просмотренные главы и следующая
function sagaCard(s){const L=sagaList(s),S=s.saga||{seen:[]},seen=L.filter(c=>(S.seen||[]).includes(c.id)),next=L.find(c=>!(S.seen||[]).includes(c.id));
  const P=PIONEERS[s.pioneer]||PIONEERS.custom;
  return `<section class="card sg-card" id="sec-saga"><div class="row"><h2>🎬 Фильм: ${esc(s.pioneer==='custom'?s.company:P.name)}</h2><span class="pill">${seen.length} из ${L.length}</span></div>
    <p class="small muted" style="margin-top:4px">Художественный фильм по настоящей истории: глава приходит, когда в игре наступает её момент. Выбор в конце главы влияет на компанию.</p>
    <div class="sg-list">${L.map((c0,i)=>{const c=sagaChapter(s,c0,false),got=(S.seen||[]).includes(c.id),pk=S.pick&&S.pick[c.id];return `<button class="sg-li ${got?'got':''}" ${got?`data-act="sagaReplay" data-k="${c.id}"`:'disabled'}><b>${i+1}. ${esc(got?sagaFill(c.t,s):'Ещё впереди')}</b><small>${got?(c.y?c.y+' · ':'')+(pk!==undefined&&c.o[pk]?'выбор: '+esc(sagaFill(c.o[pk].t,s)):'смотреть снова ▸'):c===next?'следующая глава':''}</small></button>`;}).join('')}</div></section>`;}
