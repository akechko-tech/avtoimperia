/* ================= 0.51, этап 5б: СДЕЛКИ И АКЦИОНЕРЫ =================
   Автор (тема 2 ТЗ): в начале партии денег не хватает — это хорошо; потом их слишком много: хватает и на покупку марок, и на завод.
   Остаток темы 4: дивиденды совладельцам, каждое следующее поглощение дороже, купленная марка первые годы убыточна и приходит
   с долгами, предложение купить марку, попавшую к кредиторам. Образцы — claude/issledovanie-sdelki-0.51.md:
     • Дюрант и General Motors (1908–1910): десятки покупок за два года, многие — переплата; в 1910-м касса пуста, банкиры дают
       15 млн $ и на пять лет берут управление;
     • Dodge против Ford (1919): излишек лежит в кассе, особых дивидендов нет — суд обязал выплатить 19,3 млн $; Форд выкупил доли;
     • Wolseley (1927): марку у управляющего по банкротству купил Моррис, перебив Остина.
   Ничего из этого не вычет «сам по себе»: всё — следствие сделки, которую заключил игрок, и видно до подписи. */
const MA_SERIAL=0.12,      // каждая покупка за последние десять лет — владельцы следующей марки просят на столько больше
  MA_SERIAL_MAX=0.6,MA_SERIAL_M=120,
  MA_DEBT=0.08,            // обычные долги марки — доля её оценки (у марки в беде — её настоящий долг)
  MA_DEBT_M=24,            // гасятся за столько месяцев
  MA_LOSS=0.06,            // убыток купленного завода в первый месяц — доля его месячной выручки; сходит к нулю
  MA_LOSS_M=30,            //   за столько месяцев
  MA_YOUNG=24,             // дочерняя компания после покупки контроля перестраивается — дивиденды растут от четверти до полных
  SH_MIN=0.05,             // совладельцы с долей меньше этой в суд не идут
  SH_HOARD=12,             // касса лежит без дела столько месяцев подряд — требуют особый дивиденд
  SH_GAP=36,               // не чаще
  SH_SUIT_M=18,            // суд длится
  SH_PART=0.5;             // какую часть излишка требуют раздать (совладельцам — их доля от неё)
// сколько марок куплено под контроль за последние десять лет
function maSerial(s){const t=mi(s);return holdList(s).filter(h=>(h.mode==='int'||h.st>=0.5)&&t-(h.t||0)<MA_SERIAL_M).length;}
function maSerialPrem(s){return Math.min(MA_SERIAL_MAX,MA_SERIAL*maSerial(s));}
// долги марки, которые перейдут покупателю
function maDebtOf(s,c,i,M){const F=typeof firmGet==='function'?firmGet(s,c,i):null;return Math.round(Math.min(M.V*0.6,Math.max(M.V*MA_DEBT,F&&F.cash<0?-F.cash:0))/1000)*1000;}
function maLossM(M){return M.rev/12*MA_LOSS;}
function maLossYear1(M){let a=0;for(let k=0;k<12;k++)a+=maLossM(M)*(MA_LOSS_M-k)/MA_LOSS_M;return Math.round(a/1000)*1000;}
// что сделка принесла сверх цены: долги и убытки первых лет (поглощение), долги марки в беде (контрольный пакет)
function maBurden(s,h,M,o){const t=mi(s),F=typeof firmGet==='function'?firmGet(s,h.c,h.i):null;
  if(o.int){const D=o.debt!=null?o.debt:maDebtOf(s,h.c,h.i,M);h.debt={m:Math.round(D/MA_DEBT_M),left:MA_DEBT_M,tot:D};h.il={m0:maLossM(M),left:MA_LOSS_M};return;}
  if(h.st>=0.5&&o.had<0.5){h.yt=t;
    if(F&&F.cash<0){const D=Math.round(-F.cash*h.st);h.debt={m:Math.round(D/MA_DEBT_M),left:MA_DEBT_M,tot:D};F.cash+=D;if(F.st==='bad'&&F.cash>=-F.h12*0.09){F.st='ok';F.bad=0;}}}}
function maYoungK(s,h){return h.yt==null?1:clamp(0.25+0.75*(mi(s)-h.yt)/MA_YOUNG,0.25,1);}
function maFirmDivK(s,h){const F=typeof firmGet==='function'?firmGet(s,h.c,h.i):null;return F&&(F.st==='bad'||(F.cash<0&&F.p12<0))?0:1;}
// месяц: долги и убытки купленных марок — отдельной строкой отчёта
function maBurMonth(s,r){r.maBur=0;holdList(s).forEach(h=>{if(h.debt&&h.debt.left>0){r.maBur+=h.debt.m;h.debt.left--;}if(h.il&&h.il.left>0){r.maBur+=h.il.m0*h.il.left/MA_LOSS_M;h.il.left--;}});r.maBur=Math.round(r.maBur);}
// что сказать в переговорах до подписи
function maDealNotes(s,c,i,d,M,Q){const L=[],h=holdOf(s,c,i),have=h?h.st:0,tot=Math.min(1,d.st),F=typeof firmGet==='function'?firmGet(s,c,i):null;
  const O=s.maOffer&&s.maOffer.cred&&s.maOffer.c===c&&s.maOffer.i===i&&s.maOffer.until>mi(s);
  if(O)L.push('<b>Продают кредиторы:</b> цена ниже оценки, но долги марки переходят к покупателю.');
  if(Q&&Q.ser>0)L.push(`Это ваша ${maSerial(s)+1}-я покупка за десять лет — владельцы знают, что вы скупаете марки, и просят на <b>${Math.round(Q.ser*100)}%</b> больше.`);
  if(Q&&Q.gr>0)L.push(`Здесь помнят обиду${F&&F.grWhy?` (${esc(F.grWhy)})`:''}: просят ещё на ${Math.round(Q.gr*100)}% больше.`);
  if(d.mode==='int'&&tot>=1){const D=maDebtOf(s,c,i,M);L.push(`С маркой переходят её долги — <b>${money(D)}</b> (гасятся два года). Первые два с половиной года её завод работает в убыток: станки, люди и поставщики притираются — около <b>${money(maLossYear1(M))}</b> в первый год.`);}
  else if(tot>=0.5&&have<0.5){if(F&&F.cash<0)L.push(`У марки долг <b>${money(-F.cash)}</b>: с контрольным пакетом вашу часть (${money(Math.round(-F.cash*tot))}) придётся закрыть за два года.`);L.push('Первые два года дочерняя компания перестраивается и платит меньше дивидендов.');}
  return L.length?`<p class="small warn" style="margin-top:6px">${L.join(' ')}</p>`:'';}
// строка в списке ваших марок
function maBurTxt(h){const L=[];if(h.debt&&h.debt.left>0)L.push(`долги: ещё ${money(h.debt.m*h.debt.left)}, ${h.debt.left} мес.`);if(h.il&&h.il.left>0)L.push(`убытки первых лет — ещё ${h.il.left} мес.`);return L.join(' · ');}

/* ---------- кредиторы ищут покупателя ---------- */
function maCredPending(s,F,i){const O=s.maOffer;return !!(O&&O.cred&&O.c===F.c&&O.i===i&&O.until>mi(s));}
function maCredOffer(s,r,F,cp,i){if(F.offT!=null||F.mo||s.mode==='racer'||s.over||!rivMine(s,F.c)||dealBlock(s,F.c,i))return false;const M=maStat(s,F.c,i);if(!M)return false;
  if(companyValue(s)<M.V*0.4)return false;   // слишком мала, чтобы банки приняли покупателя всерьёз
  const t=mi(s),old=s.maOffer;F.offT=t;s.maOffer={c:F.c,i,until:t+4,prem:-0.35,cred:1};
  const Q=maAsk(s,F.c,i,{st:1,mode:'int',pay:'cash'});if(!Q||Q.refuse){s.maOffer=old||null;return false;}const debt=maDebtOf(s,F.c,i,M);
  pushEvent({kicker:'Сделка',own:1,title:`Кредиторы «${M.nm}» ищут покупателя`,deck:`${COUNTRIES[F.c].name} · ${money(Q.R)} и долги ${money(debt)}`,
    text:`«${M.nm}» второй год работает в убыток, и банки дали владельцам три месяца, чтобы найти покупателя. Первым пришли к вам: за всю марку просят ${money(Q.R)} — на треть ниже оценки (${money(M.V)}), но её долги, ${money(debt)}, переходят к покупателю.\nНе купите вы — её может купить соседняя фирма, и у вас станет одним сильным соперником больше. Не купит никто — завод возьмут кредиторы.\nТак в 1927 году Уильям Моррис купил Wolseley у управляющего по банкротству за 730 тысяч фунтов, перебив на торгах Остина.`,
    choices:[['Переговоры','ma:talk:'+maKey(F.c,i)],['Не интересует','ma:credno:'+maKey(F.c,i)]]},true);
  return true;}

/* ---------- совладельцы и особый дивиденд ---------- */
function shRev12(s){const b=typeof bizRev==='function'?bizRev(s):0;return b>0?b:((s.last&&s.last.rev)||0)*12;}
// излишек: касса сверх долга, полугода постоянных расходов и четверти годовой выручки
function shSurplus(s){const L=s.last;if(!L)return 0;const fixed=(L.wage||0)+(L.ovh||0)+(L.dlr||0)+(L.ad||0)+(L.rd||0)+(L.int||0)+(L.team||0)+(L.drv||0)+(L.adm||0);
  return Math.max(0,s.cash-(s.loan||0)-Math.max(fixed*6,shRev12(s)*0.25));}
function shAsk(s){return Math.round(shSurplus(s)*SH_PART*partnersShare(s)/1000)*1000;}
function shMonth(s,r){const t=mi(s),k=partnersShare(s);
  if(k<SH_MIN){s.shHoard=0;s.shSuit=null;return;}
  s.shHoard=shSurplus(s)>shRev12(s)*0.1?(s.shHoard||0)+1:0;
  const S=s.shSuit;if(S&&t>=S.at){s.shSuit=null;const D=Math.min(S.D,Math.max(0,Math.round(s.cash)));r.shDiv=(r.shDiv||0)+D;s.rep=clamp(s.rep-3,0,100);
    addLog(`Суд встал на сторону совладельцев: «${s.company}» обязана выплатить им особый дивиденд — ${money(D)} с процентами и издержками. Газеты пишут об этом неделю.`,'bad');try{pendingToasts.push('⚖️ Суд: особый дивиденд совладельцам');}catch(_){}}}
function shDemand(s){if(s.over||s.pending.length||s.shSuit||DIF().simple)return false;const t=mi(s),k=partnersShare(s);
  if(k<SH_MIN||(s.shHoard||0)<SH_HOARD||t-(s.shT??-999)<SH_GAP)return false;const D=shAsk(s);if(D<2000*cpi(s))return false;s.shT=t;s.shHoard=0;
  const who=(s.partners||[]).slice().sort((a,b)=>(b.sh||0)-(a.sh||0))[0],nm=who?who.n:'Совладельцы';
  pushEvent({kicker:'Совладельцы',own:1,title:'Совладельцы требуют особый дивиденд',deck:`${money(D)} из кассы — им принадлежит ${Math.round(k*100)}% компании`,
    text:`${nm} пишут в правление: в кассе «${s.company}» ${money(s.cash)}, и больше года эти деньги лежат без дела. Они требуют раздать половину излишка владельцам — на их долю это ${money(D)}.\nМожно выплатить. Можно отказать: тогда они подадут в суд, и через полтора года он, скорее всего, обяжет заплатить — с процентами. Можно выкупить их доли — в «Финансах».\nТак было у Форда: к 1916 году в кассе лежало 60 миллионов, Генри Форд отменил особые дивиденды ради новых заводов. Братья Додж подали в суд — и в 1919 году суд обязал выплатить 19,3 миллиона. После этого Форд выкупил доли всех совладельцев.`,
    choices:[[`Выплатить ${money(D)}`,'sh:pay:'+D],['Отказать — пусть судятся','sh:no:'+D]]},true);return true;}
function shResolve(s,key){const a=key.split(':'),D=+a[2]||0,t=mi(s);
  if(a[1]==='pay'){const v=Math.min(D,Math.max(0,Math.round(s.cash)));s.cash-=v;s.shPaid=(s.shPaid||0)+v;addLog(`Совладельцам выплачен особый дивиденд — ${money(v)}.`,'hist');}
  if(a[1]==='no'){s.shSuit={at:t+SH_SUIT_M,D:Math.round(D*1.15/1000)*1000};s.rep=clamp(s.rep-1,0,100);addLog(`Совладельцам отказано в особом дивиденде. Они подали в суд: решение — через полтора года, на кону ${money(s.shSuit.D)}.`,'bad');}}
// строка в «Финансах» рядом с совладельцами
function shNoteHTML(s){const k=partnersShare(s);if(k<SH_MIN)return '';const S=s.shSuit,t=mi(s);
  if(S)return `<p class="small warn" style="margin-top:4px">⚖️ Совладельцы судятся за особый дивиденд: решение через ${Math.max(1,S.at-t)} мес., на кону ${money(S.D)}. Выкупите их доли — и иск уйдёт вместе с ними.</p>`;
  const h=s.shHoard||0;if(h>=6&&shAsk(s)>=2000*cpi(s))return `<p class="small muted" style="margin-top:4px">Касса лежит без дела ${h} мес.: через ${Math.max(1,SH_HOARD-h)} мес. совладельцы потребуют особый дивиденд (сейчас это ${money(shAsk(s))}). Вложите деньги в дело или выкупите их доли.</p>`;
  return '';}
