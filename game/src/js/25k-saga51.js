/* ================= 0.51, этап 8б: сюжет по партии, а не по календарю =================
   Отзыв автора: «ролики исторически верны, но оторваны от происходящего — игрок то опережает события, то обходит их; развилка выходит искусственной».
   1. Глава о деле компании открывается по её состоянию, а не по дате (SAGA_ST): продажи, первая победа, очередь заказов.
      Мировые события (война, кризис, 1929 год) и главы биографии остаются по календарю — мир в игре идёт по календарю.
   2. Если игрок опередил историю или пришёл позже — глава начинается с кадра «история и ваша партия» (sagaPaced).
   3. Глава о том, чего в партии нет (гонки, победы, титулы), больше не приходит «через три года сама»: она ждёт своего события.
   4. У развилок — настоящие последствия там, где в игре есть такой механизм (SAGA_REAL): заём — настоящий долг, инвесторы — настоящая доля
      прибыли, прибавка — настоящая ставка жалованья, отказ рабочим — настоящая забастовка, военный заказ — настоящий контракт.
   5. Что из решений фильма действует сейчас — видно в карточке фильма («Империя»). */

// ---------- 1. состояние вместо календаря ----------
// st — когда глава открывается (вместо when). Главы с «год + продажи» открываются по продажам: вышли на них раньше — глава раньше.
// У peugeot4, bugatti4, agnelli4 из условия убрана «первая гонка»: это главы биографии (раздел семейной фирмы, продажа чертежа, суд), не о гонках.
const SAGA_ST={
  ford4:{st:['sold:2000']},olds4:{st:['sold:1000']},maybach5:{st:['sold:1000']},lanchester5:{st:['sold:500']},
  renault4:{st:['firstWin']},                 // «Куда вложить славу Гран-при?» — нужна своя победа
  peugeot5:{st:['y:1912','firstRace']},       // «Кому отдать деньги — гонщикам или инженерам?» — нужна своя команда
  bugatti6:{st:['y:1924','firstRace']},       // «Что делать после провала в Лионе?»
  peugeot4:{st:['y:1896']},bugatti4:{st:['y:1912']},agnelli4:{st:['y:1908']},
  custom4:{st:['backlog']},durant2:{st:['backlog']}   // «Как выполнить большой заказ?» — когда заказов больше, чем успевает завод
};
function sagaWhen(ch){const X=SAGA_ST[ch.id];return X?X.st:(Array.isArray(ch.when)?ch.when:[ch.when]);}
// условия-события: без них глава не приходит вовсе (игрок «обошёл» событие)
const SAGA_WAIT=/^(firstRace|firstWin|king)$/;
function sagaBacklog(s){const L=s.models.filter(m=>!isMoto(m)&&(m.status==='prod'||m.status==='sale')),b=L.reduce((a,m)=>a+(m.backlog||0),0),made=(s.last&&s.last.made)||0;return b>=30&&b>=made*2;}
function sagaCond51(s,w){
  if(w==='backlog')return sagaBacklog(s);
  if(w==='conv')return ((s.tech||{}).line||0)>=2;
  const m=/^(races|wins):(\d+)$/.exec(w);if(m){const L=s.raceLog||[];return (m[1]==='wins'?L.filter(r=>r.place===1).length:L.length)>=+m[2];}
  return undefined;}
function sagaReady(s,ch){const W=sagaWhen(ch);if(W.every(w=>sagaCond(s,w)))return true;
  if(W.includes('start')||W.includes('finale')||!(ch.y>0)||s.y<ch.y+3)return false;
  // Запасной путь остался только у глав «по масштабу»: игрок идёт той же дорогой, но медленнее — через три года после даты глава придёт
  // и скажет, что история шла быстрее. Глава о гонках, победах и титулах без них не приходит.
  return !W.some(w=>SAGA_WAIT.test(w));}
// подсказка в карточке фильма: чего ждёт глава, если её дата уже прошла
function sagaWaitHint(s,ch){if(!(ch.y>0)||s.y<ch.y)return '';const W=sagaWhen(ch).filter(w=>!sagaCond(s,w));
  for(const w of W){if(w==='firstRace')return 'откроется, когда выйдете на старт';if(w==='firstWin')return 'откроется после первой победы в гонке';if(w==='king')return 'откроется, когда возьмёте титул';
    if(w==='backlog')return 'откроется, когда заказов станет больше, чем успевает завод';
    const m=/^sold:(\d+)$/.exec(w);if(m)return `откроется, когда продадите ${fmtN(+m[1])} машин (сейчас ${fmtN(totalSold(s))})`;}
  return '';}

// ---------- 2. история и ваша партия ----------
function sagaTwin(s){try{return (COMPS[s.country]||[]).find(cp=>cp.v&&!cp.imp&&pkIs(cp,s))||null;}catch(e){return null;}}
function sagaVolNow(s){return Math.round(Math.max(s.peakLast||0,s.m>=6?(s.yearSold||0)*12/s.m:0));}
function sagaRound(n){if(n<100)return Math.round(n/10)*10;const p=Math.pow(10,Math.floor(Math.log10(n))-1);return Math.round(n/p)*p;}
// Запоминается в момент, когда глава пришла: год игры, год истории и выпуск — свой и исторической фирмы героя
function sagaPaceOf(s,ch){if(!(ch.y>0))return null;const S=s.saga||{},y0=1895+Math.floor((S.t0||0)/12),W=sagaWhen(ch);
  const cal=W.some(w=>/^(y|t):/.test(w)||/^(start|firstProd|war|crisis|finale|cashLow)$/.test(w)||/^air/.test(w));
  const o={y:s.y,hy:ch.y};if(!cal&&ch.y>=y0)o.d=ch.y-s.y;
  const tw=sagaTwin(s);if(tw&&ch.y>=tw.since){const hv=sagaRound(tabAt(tw.v,ch.y)),mv=sagaVolNow(s);if(hv>0&&mv>0){o.hv=hv;o.mv=sagaRound(mv);o.tn=tw.n;}}
  return o;}
function sagaYears(n){return n===1?'год':`${n} ${plural(n,'год','года','лет')}`;}
function sagaPaceText(s,ch){const P=((s.saga||{}).pace||{})[ch.id];if(!P)return '';
  if(P.d>=2)return `В истории это случилось в ${P.hy} году. У вас на календаре ${P.y}-й: вы опередили историю на ${sagaYears(P.d)}.`;
  if(P.d<=-2)return `В истории это случилось в ${P.hy} году. У вас на календаре ${P.y}-й: вы пришли к этому на ${sagaYears(-P.d)} позже. Выбор перед вами тот же.`;
  if(P.hv&&P.mv&&Math.abs(P.y-P.hy)<=1){const k=P.mv/P.hv;
    if(k>=1.5)return `В истории на заводах «${P.tn}» в ${P.hy} году собрали около ${fmtN(P.hv)} машин. У вас — уже ${fmtN(P.mv)} в год: вы идёте впереди истории.`;
    if(k<=0.5)return `В истории на заводах «${P.tn}» в ${P.hy} году собрали около ${fmtN(P.hv)} машин. У вас — ${fmtN(P.mv)} в год: история шла быстрее.`;}
  return '';}
// в карточке фильма рядом с годом истории — год, когда глава пришла в партии (если разошлись на два года и больше)
function sagaCameY(s,ch){const P=((s.saga||{}).pace||{})[ch.id];return P&&P.d!==undefined&&Math.abs(P.d)>=2?` (у вас — ${P.y})`:'';}
// глава с первым кадром «история и ваша партия» (кадр без голоса: запись диктора для него не делалась)
function sagaPaced(s,ch){if(!ch||!ch.sc)return ch;const t=sagaPaceText(s,ch);if(!t)return ch;return {...ch,sc:[{say:t,gen:1}].concat(ch.sc)};}

// ---------- 4. настоящие последствия ----------
// ключ — 'глава:номер варианта ответа' или 'глава:vN:номер' для варианта главы.
// loan — деньги из фильма становятся настоящим долгом; stake — за деньги инвесторы получают настоящую долю прибыли;
// buyout — совладельцы, пришедшие по решению фильма, выкуплены (остальных выкупают в «Финансах»);
// wage — ставка жалованья поднимается на ступень; strike — забастовка в следующем месяце; mil — подписан военный контракт.
const SAGA_REAL={
  'ford6:1':{loan:1},'durant2:0':{loan:1},
  'ford3:0':{stake:1,who:'Инвесторы'},'ford6:v0:0':{buyout:1},'custom7:2':{stake:1,who:'Концерн'},'custom7:v1:2':{stake:1,who:'Концерн'},
  'agnelli6:1':{wage:1},'bianchi5:0':{wage:1},'frese4:0':{wage:1},'ryab6:0':{wage:1},
  'agnelli6:2':{strike:1},'bianchi5:1':{strike:1},'frese4:1':{strike:1},'ryab6:1':{strike:1},
  'olds6:2':{mil:1},'renault5:0':{mil:1},'peugeot6:0':{mil:1},'custom5:0':{mil:1},'ryab4:0':{mil:1}
};
// по тексту ответа (у героя номер ответа может отличаться — ищем по словам; проверено тестом v51, раздел 28)
const SAGA_REAL_T=[[/^Свой банк — кредит своему делу$/,{loan:1}],[/^Найти новых компаньонов с деньгами$/,{stake:1,who:'Компаньоны'}],[/^Взять компаньонов и их деньги$/,{stake:1,who:'Компаньоны'}],[/^Войти в концерн за акции$/,{stake:1,who:'General Motors'}]];
let SAGA_REAL_ON=false;
function sagaRealInit(){if(SAGA_REAL_ON)return;SAGA_REAL_ON=true;
  for(const k of Object.keys(SAGA))for(const ch of SAGA[k]){const sets=[['',ch.o]].concat((ch.v||[]).map((v,j)=>['v'+j+':',v.o]));
    sets.forEach(([vn,O])=>(O||[]).forEach((o,i)=>{const X=SAGA_REAL[ch.id+':'+vn+i]||(SAGA_REAL_T.find(r=>r[0].test(o.t))||[])[1];if(X)o.fx=Object.assign({},o.fx,X);}));}}
function sagaWarOn(s){return sagaCond(s,'war')&&yf(s)<1918.85;}
const SAGA_WAGE_UP={low:'market',market:'good'};
// доля инвесторов — по деньгам: сколько дали против цены компании (не меньше 2 % и не больше 20 %)
function sagaStakeSh(s,fx){const a=Math.abs(sagaCash(s,fx)),v=Math.max(1,companyValue(s)),room=0.75-partnersShare(s);return Math.max(0,Math.min(room,clamp(a/(v+a),0.02,0.2)));}
// суммы считаются до того, как выбор изменил кассу: что обещано в ответе, то и будет
function sagaRealPre(s,fx){return fx&&(fx.loan||fx.stake)?{a:Math.abs(sagaCash(s,fx)),sh:fx.stake?+sagaStakeSh(s,fx).toFixed(3):0}:null;}
function sagaRealApply(s,fx,R){if(!fx)return;const now=mi(s);R=R||{a:0,sh:0};
  if(fx.loan){const a=R.a;if(a>0){s.loan=(s.loan||0)+a;if(fx.cash<0)s.cash+=a;addLog(`Заём по решению в фильме: долг вырос на ${money(a)}, проценты — по обычной ставке.`);}}
  if(fx.stake){const sh=R.sh;if(sh>=0.005){(s.partners=s.partners||[]).push({n:fx.who||'Инвесторы',sh,t:now,saga:1});addLog(`${fx.who||'Инвесторы'} вошли в дело: им причитается ${Math.round(sh*100)}% прибыли «${s.company}».`);}}
  if(fx.buyout&&(s.partners||[]).some(p=>p.saga)){const k=(s.partners||[]).filter(p=>p.saga).reduce((x,p)=>x+p.sh,0);s.partners=s.partners.filter(p=>!p.saga);addLog(`Совладельцы, вошедшие в дело раньше, выкуплены: их ${Math.round(k*100)}% прибыли снова ваши.`);}
  if(fx.wage){const up=SAGA_WAGE_UP[s.wagePol];if(up){s.wagePol=up;addLog(`Жалованье поднято: ${WAGE_POL[up].name.toLowerCase()}.`);}}
  if(fx.strike)s.strikeNext=true;
  if(fx.mil&&!s.military&&sagaWarOn(s)){s.military=true;addLog('Военный контракт подписан.');}}
function sagaRealText(fx,s){const L=[];if(!fx)return L;
  if(fx.loan){const a=Math.abs(sagaCash(s,fx)),r=(loanRate(s)*100).toFixed(1).replace('.',',');if(a>0)L.push(fx.cash<0?`в долг: касса цела, долг +${money(a)} под ${r}% годовых`:`это заём: долг +${money(a)} под ${r}% годовых`);}
  if(fx.stake){const sh=sagaStakeSh(s,fx);if(sh>=0.005)L.push(`взамен — ${Math.round(sh*100)}% прибыли новым совладельцам, каждый месяц (долю потом можно выкупить)`);}
  if(fx.buyout){const k=(s.partners||[]).filter(p=>p.saga).reduce((x,p)=>x+p.sh,0);if(k>0)L.push(`совладельцы из прежних глав выкуплены: их ${Math.round(k*100)}% прибыли снова ваши`);}
  if(fx.wage){const up=SAGA_WAGE_UP[s.wagePol];L.push(up?`жалованье: «${WAGE_POL[up].name}» — зарплата дороже на ${Math.round((WAGE_POL[up].k/WAGE_POL[s.wagePol].k-1)*100)}%`:'жалованье у вас уже выше рынка');}
  if(fx.strike)L.push('забастовка в следующем месяце');
  if(fx.mil)L.push(s.military?'военный контракт у вас уже есть':sagaWarOn(s)?'военный контракт: до 40% мощностей — армии':'');
  return L.filter(Boolean);}

// ---------- 5. что действует сейчас ----------
function sagaNowList(s){const now=mi(s),L=[],dt=u=>`до ${MONTHS_G[((u%12)+12)%12]} ${1895+Math.floor(u/12)}`;
  Object.entries(s.sagaB||{}).forEach(([k,o])=>{const d=SAGA_B[k];if(!d||!o||now>=o.until)return;
    if(BN_ADD[k]){L.push(`${d[0].toLowerCase()} +${Math.round(o.v*100)}% — ${dt(o.until)}`);return;}const pc=Math.round((o.v-1)*100);if(pc)L.push(`${d[0].toLowerCase()} ${pc>0?'+':'−'}${Math.abs(pc)}% — ${dt(o.until)}`);});
  Object.entries(s.sagaSeg||{}).forEach(([g,o])=>{if(!o||now>=o.until||!SEG[g])return;const pc=Math.round((o.v-1)*100);if(pc)L.push(`спрос: ${SEG[g].name.toLowerCase()} ${pc>0?'+':'−'}${Math.abs(pc)}% — ${dt(o.until)}`);});
  (s.partners||[]).filter(p=>p.saga).forEach(p=>L.push(`${p.n}: ${Math.round(p.sh*100)}% прибыли — пока не выкупите долю`));
  return L;}
function sagaNowHTML(s){const L=sagaNowList(s);if(!L.length)return '';
  return `<div class="sg-now"><b>Решения фильма действуют сейчас</b><ul>${L.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;}
sagaRealInit();
