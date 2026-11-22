/* ================= 0.51, этап 8: РЕЖЕ И ВЕСОМЕЕ =================
   Автор: события часты и становятся рутиной. Замер партии бота (Форд, «Норма»): 590 остановок за 409 месяцев, в 152 месяцах —
   по две и больше, до семи за месяц. Две пятых — выставки (123 приглашения и 110 отчётов), ещё 69 — «вышла кинохроника».
   Правило: игру останавливает то, что требует решения или действительно важно; остальное — «Заметки месяца» в «Империи»
   (их можно открыть и прочесть целиком) и строка в журнале.
     • всегда останавливают: событие с выбором; мировые события; празднования (первенство, рекорд, медаль, титул); главы сюжета;
       «Итоги года»; хроника эпохи;
     • никогда не останавливают: «вышла кинохроника», торговые сводки, обозрения, обзор прессы за год,
       отчёт о выставке без золотой медали;
     • прочие новости — не больше одной в месяц, остальные — в заметки. */
const EV_QUIET=/^(Кинохроника|Поставщики · кинохроника|Мир · кинохроника|Торговля|Автомобильное обозрение|Налоги|Итоги года · по версии прессы)$/;
/* итог того, что игрок сам затеял (попытка рекорда, испытания, первый полёт, работа КБ), и большие вехи — всегда газетой */
const EV_LOUD=/^(Итоги года$|Спорт и дела|Рекорд|Мировой рекорд|Попытка рекорда|Война|Перемирие|Версаль|Банкротство|Испытания|Первый полёт|КБ|Патенты|Совладельцы|Военн|Авиацех|Небо)/;
function evChoices(ev){return (ev.choices||[]).filter(c=>!/^reel:/.test(c[1]||''));}
function evIsNews(ev){const ch=evChoices(ev);return ch.length<=1&&(!ch.length||ch[0][1]==='ok');}
/* необязательное предложение (вызов, пари, дуэль, сделка, приглашение, заказ): у него есть ответ «нет» — его ключ, иначе null */
const EV_OFFER=/^(Вызов|Пари|Дуэль|Сделка|Приглашение на выставку|Деловой заказ)$/;
function offerNo(ev){if(!EV_OFFER.test(ev.kicker||'')||ev.must)return null;const ch=evChoices(ev);if(ch.length<2)return null;const d=ch.find(c=>c[1]==='ok'||/No$|^show0$|^tskip$|:credno:/.test(c[1]));return d?d[1]:null;}
/* 'stop' — остановить игру; 'quiet' — в заметки месяца; 'offer' — предложение: ждёт в «Делах» до конца месяца */
function evClass(s,ev,paper){if(!evIsNews(ev))return offerNo(ev)?'offer':'stop';
  const k=ev.kicker||'';
  if(k==='Выставка')return /золото/.test(ev.deck||'')?'stop':'quiet';
  if(k==='Итоги года · по версии прессы')return 'quiet';
  if(ev.cel||ev.world||ev.saga||ev.duel||ev.dc||ev.mean||ev.mark||ev.loud)return 'stop';
  if(!s.played51)return 'stop';/* до первого хода: вступление и рассказ об основании фирмы — не «заметки» */
  if(EV_QUIET.test(k))return 'quiet';
  if(EV_LOUD.test(k))return 'stop';
  if(paper&&!k&&!ev.own)return 'stop';/* хроника эпохи: «Мотор вместо лошади», «Ревущие двадцатые» */
  return s.stopM===mi(s)?'quiet':'stop';}
function digestAdd(s,P){s.digest=s.digest||[];P.t=mi(s);s.digest.unshift(P);if(s.digest.length>60)s.digest.length=60;
  if(typeof pendingToasts!=='undefined')pendingToasts.push('📰 '+(P.kicker?P.kicker+': ':'')+P.title);}
function digestNow(s){const t=mi(s);return (s.digest||[]).filter(d=>t-d.t<=2);}
/* открыть заметку целиком — как обычную газету (игрок сам попросил, так что это не «остановка») */
function digestRead(i){const s=G,d=(s.digest||[])[+i];if(!d)return;d.read=1;s.pending.unshift(Object.assign({},d,{choices:[['Закрыть','ok']],fromDigest:1}));render();}
function digestCard(s){const L=digestNow(s);if(!L.length)return '';const un=L.filter(d=>!d.read).length;
  const rows=L.slice(0,12).map(d=>{const i=s.digest.indexOf(d);return `<button class="chip" style="width:100%;margin-top:6px;text-align:left${d.read?';opacity:.65':''}" data-act="digestRead" data-i="${i}"><small>${esc(d.kicker||'Новости')} · ${MONTHS[((d.t%12)+12)%12]} ${1895+Math.floor(d.t/12)}</small>${esc(d.title)}${d.deck?`<small>${esc(d.deck)}</small>`:''}</button>`;}).join('');
  return foldCard('digest',un>0,`<h2>📰 Заметки месяца</h2>`,`<p class="small muted">То, ради чего игру останавливать не стоило. Нажмите — откроется заметка целиком.</p>${rows}`,`${L.length} ${plural(L.length,'заметка','заметки','заметок')}${un?` · новых ${un}`:''}`);}
/* ---------- предложения: не окно посреди хода, а строка в советах с кнопкой «Открыть» ----------
   Ждёт до конца месяца. Не открыли — перед новым месяцем спросят окном: молчаливого отказа нет.
   0.51, этап 9: первая версия (этап 8) считала молчание отказом. Замер на шести партиях бота, который в советы не заглядывает:
   четыре разорились до 1915 года (у бота, отвечающего на предложения, — ни одной). Решение за игрока больше не принимается. */
function offersOn(){return (typeof OFFERS_INBOX==='undefined'||OFFERS_INBOX!==false)&&!(typeof G!=='undefined'&&G&&G.mode==='racer');}
function offerAdd(s,P){s.offers=s.offers||[];P.t=mi(s);s.offers.push(P);if(typeof pendingToasts!=='undefined')pendingToasts.push('✉ '+(P.kicker?P.kicker+': ':'')+P.title);}
function offerOpen(i){const s=G,P=(s.offers||[])[+i];if(!P)return;s.offers.splice(+i,1);s.pending.unshift(P);render();}
function offersExpire(s){const L=s.offers||[];if(!L.length)return;s.offers=[];L.forEach(P=>{P.last=1;P.deck=(P.deck?P.deck+' · ':'')+'ответ нужен сейчас';s.pending.push(P);});}
function offerAdvice(s,add){(s.offers||[]).forEach((P,i)=>add(97,'✉',`${P.kicker}: ${P.title}${P.deck?' — '+P.deck:''}. Ответить можно сейчас; иначе спросят перед новым месяцем.`,'Открыть',()=>offerOpen(i)));}
/* ---------- выставки: кто решает ---------- */
const SHOW_POL={auto:'решает управляющий',home:'спрашивать там, где вы продаёте; на остальные не ездить',ask:'спрашивать о каждой',none:'не ездить'};
/* по умолчанию: с помощником — решает он; без него — спрашивают о выставках своей страны, на чужие не ездят (деньги без спроса
   не тратятся). В прогонах и у ботов (ящик предложений выключен) — как раньше: спрашивают о каждой */
function showPol(s){return SHOW_POL[s.showPol]?s.showPol:!offersOn()?'ask':(typeof helperOn==='function'&&helperOn(s))||(typeof DIF==='function'&&DIF().simple)?'auto':'home';}
// Управляющий ездит на выставки по правилу, проверенному ботом «в стиле автора»: малый стенд — когда он не дороже восьмой части
// кассы, большой — двенадцатой, павильон на всемирной выставке — двадцать пятой. 0.51, этап 9: первое правило («не дороже 2–3 % кассы»)
// оставляло молодую фирму без выставок: из шести партий бота пять разорились до 1915 года (с правилом бота — ни одной).
function showAutoTier(s,sh){const H=SHOW_HOST[sh.h],cash=Math.max(0,s.cash),home=H.c===s.country,has=home||dealerCount(s,H.c)>0||tradeOk(s,H.c);if(!has)return 0;
  const c=t=>standCost(sh,s,t);if(H.w>=3&&cash>c(3)*25)return 3;if(cash>c(2)*12)return 2;if(cash>c(1)*8)return 1;return 0;}
function tradeOk(s,c){try{return !tradeBan(s,c);}catch(_){return true;}}
/* true — приглашение решено без игрока */
function showAutoInvite(s,sh){const pol=showPol(s),hc=SHOW_HOST[sh.h].c,home=hc===s.country||dealerCount(s,hc)>0;/* «свои» — там, где фирма продаёт: дома и в странах с её дилерами */if(pol==='ask'||(pol==='home'&&home))return false;
  const tier=pol==='auto'?showAutoTier(s,sh):0;s.showNow=sh.id;showBook(s,'show'+tier);
  if(tier)addLog(`Выставки ведёт управляющий: ${showName(sh)} — ${SHOW_TIER[tier].n.toLowerCase()}.`,'hist');return true;}
function showPolCard(s){if(!s.shows||!Object.keys(s.shows).length)return '';const p=showPol(s);
  return `<section class="card" id="showpol"><div class="label">Выставки — ${esc(SHOW_POL[p])}</div><div class="chips" style="margin-top:6px">${Object.keys(SHOW_POL).map(k=>`<button class="chip${p===k?' on':''}" data-act="showPol" data-v="${k}">${esc(SHOW_POL[k][0].toUpperCase()+SHOW_POL[k].slice(1))}</button>`).join('')}</div><p class="small muted" style="margin-top:6px">Управляющий берёт стенд по средствам: малый — если он не дороже восьмой части кассы, большой — двенадцатой, павильон на всемирной выставке — двадцать пятой. Об итогах пишет в заметках месяца; газета выходит, только если стенд взял золото.</p></section>`;}
/* ================= ГЛАВНОЕ — КРУПНО =================
   Автор: важное написано мелким текстом, приходится искать глазами, что хорошего или плохого произошло.
   Под заголовком — вывод крупно и в цвете (зелёный — хорошо, красный — плохо); если заметка зовёт на вкладку — кнопка туда. */
const EV_BAD=/убыт|штраф|пожар|забастов|банкрот|потер|сорван|не доехал|проигра|сход|авари|запре[тщ]|закро|дорожа|спад|кризис|война|иск |суд |отобран|сломал|перебои|травм|ушёл|уходит|отказ|не выдерж|упал|сниж|долг/i;
const EV_GOOD=/прибыл|заказ|медал|золото|серебро|побед|выигра|рекорд|первы|рост|\+\s?\d|чемпион|титул|премия|приз|открыл|готов|принят|в серию|облётан|спрос/i;
function evTone(ev){if(ev.tone)return ev.tone;if(ev.cel)return 'good';const t=(ev.title||'')+' '+(ev.deck||'')+' '+(ev.mean||''),b=EV_BAD.test(t),g=EV_GOOD.test(t);return b&&!g?'bad':g&&!b?'good':'';}
/* вывод: «что это значит» (если задано), иначе подзаголовок — в нём у событий стоят числа */
function evGist(ev){const txt=ev.mean||ev.deck||'';return txt?{txt,tone:evTone(ev),lab:ev.mean?'Что это значит для вас':''}:null;}
const EV_TABS={'Завод':'plant','Модели':'models','Рынок':'market','Гонки':'race','Империя':'log'};
function evGoTab(text){const m=/на вкладк[еу] «(Завод|Модели|Рынок|Гонки|Империя)»/.exec(text||'');return m?{id:EV_TABS[m[1]],n:m[1]}:null;}
