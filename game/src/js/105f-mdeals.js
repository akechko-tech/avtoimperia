/* ================= 0.33: ПОКУПКА МОТОЦИКЛЕТНЫХ МАРОК =================
   Отзыв: «наверное, я могу купить и мотоциклетного производителя, не только авто». Можно: мотомарку поглощают целиком
   (как BSA купила Triumph в 1951-м, а DKW в 1928 году — завод Audi; в 1920-х мотомарки часто покупали автозаводы).
   Что достаётся: её цеха (места в общем заводе), оборудование для мотоциклов (если своего не было), дилеры в её стране
   (своё отделение — продаёте там без импортёра), её покупатели мотоциклов (часть остаётся с вами несколько лет, как
   у поглощённых автомобильных марок) и её мотоциклы в той стране — без пошлины (они там свои). Марки на рынке больше нет. */
function mholdList(s){return s.mhold||(s.mhold=[]);}
function mholdOf(s,c,i){return (s.mhold||[]).find(h=>h.c===c&&h.i===i)||null;}
function mholdIn(s,c){return (s.mhold||[]).filter(h=>h.c===c);}
// доли мотомарки по классам мотоциклов в её стране (сколько покупателей может перейти к вам)
function mShares0(s,c,i){const cp=(MCOMPS[c]||[])[i],o={};if(!cp)return o;MOTOSEG.forEach(g=>{const S=segAnnual(c,g,s),mx=(cp.mix&&cp.mix[g])||0;if(S>0&&mx>0)o[g]=+Math.min(0.85,compVol(cp,s)*mx/S).toFixed(4);});return o;}
function mMarket(s,c){return Math.max(1,MOTOSEG.reduce((a,g)=>a+segAnnual(c,g,s),0));}
// оценка: продажи за прошлый год (не меньше 70% обычного выпуска марки), прибыль × 9 + цеха и дилеры
function mStat(s,c,i){const cp=(MCOMPS[c]||[])[i];if(!cp)return null;const st=((s.mcomps||{})[c]||[])[i]||{},full=(st.prev||0)>0,cv=compVol(cp,s);
  const v=Math.max(1,full?st.prev:Math.max(st.yr||0,cv*0.9),cv*0.7);
  let P=0,w=0;MOTOSEG.forEach(g=>{const k=(cp.mix&&cp.mix[g])||0;P+=k*prefP(g,c,s);w+=k;});P=w?P/w:prefP('moto',c,s);
  const sh=v/mMarket(s,c),profit=v*P*(s.y<1920?0.09:0.075),capU=Math.max(0.5,Math.round(v/12*0.085*1.1*10)/10),dl=Math.max(1,Math.round(v/12/Math.max(1,dealerTP(s)*MOTO_DLR)));
  const A=capU*capUnitCost(s)*0.55+dl*dealerCost(s)*0.5,V=Math.max(3000,Math.round(Math.max(A*0.8,profit*9+A*0.25)*(DIF().maK??1)/1000)*1000);
  return {cp,nm:compName(cp,s),v,sh,P,profit,capU,dl,V};}
function mdealBlock(s,c,i){const cp=(MCOMPS[c]||[])[i];if(!cp)return 'нельзя';if(mholdOf(s,c,i))return 'ваша';if(!compAlive(cp,s))return 'закрылась';
  if(c!==s.country&&(warCut(s,c)||atWar(s.country,c,s.y,s.m)))return 'война';return '';}
function mdealPrice(s,c,i){const M=mStat(s,c,i);return M?Math.round(M.V*1.2/1000)*1000:0;}
function mdealDo(s,c,i){if(mdealBlock(s,c,i))return null;const M=mStat(s,c,i),price=mdealPrice(s,c,i);if(!M||s.cash<price)return {ok:false};
  s.cash-=price;s.plantVal+=M.capU*capUnitCost(s)*0.6;const home=c===s.country;
  mholdList(s).push({c,i,n:M.cp.n,nm:M.nm,t:mi(s),sh0:mShares0(s,c,i),home:home?1:0,paid:price});
  s.lines=s.lines||{car:1};const hadEq=motoLv(s)>0;if(!hadEq)s.lines.moto=1;
  s.cap=(s.cap||0)+M.capU;
  if(!home){s.imp=s.imp||{};if(impLv(s,c)<2)s.imp[c]=2;}
  const add=Math.min(M.dl,dealerRoom(s,c));if(add>0)s.dealers[c]=(s.dealers[c]||0)+add;
  addLog(`Куплена мотомарка «${M.nm}» (${COUNTRIES[c].name}) за ${money(price)}: её цеха (+${fmtN(Math.round(M.capU/Math.max(0.02,motoCx(s))))} мотоциклов в месяц), дилеры${hadEq?'':', оборудование для мотоциклов'} и покупатели — ваши.`,'good');
  pendingToasts.push('🏍 Куплена «'+M.nm+'»');
  pushEvent({kicker:'Сделка',own:1,title:`«${s.company}» покупает «${M.nm}»`,deck:`${fmtN(Math.round(M.v))} мотоциклов в год — теперь ваши`,
    text:`«${M.nm}» переходит к «${s.company}» за ${money(price)}. Её цеха теперь часть вашего завода${hadEq?'':' — вместе с оборудованием для мотоциклов: чертите мотоцикл в «Моделях»'}; ${home?'её дилеры — ваши':`её дилеры в стране «${COUNTRIES[c].name}» — ваше отделение там, а ваши мотоциклы там — местные, без пошлины`}.\nЧасть её покупателей останется с вами — если ваши мотоциклы будут не хуже. Марки «${M.nm}» на рынке больше нет.`},true);
  return {ok:true,price,nm:M.nm};}
// покупатели поглощённой мотомарки — как у автомобильных: в первый год около двух третей её доли, через 3–4 года — треть
function mBoughtShare(c,g,s){let v=0;mholdIn(s,c).forEach(h=>{const x=(h.sh0&&h.sh0[g])||0;if(x>0)v+=x*maLoy(s,h);});return Math.min(0.85,v);}
// строки мотомарок в «Сделках»
function mdealsHTML(s,sel){const L=(MCOMPS[sel]||[]).map((cp,i)=>({cp,i})).filter(o=>compAlive(o.cp,s)||mholdOf(s,sel,o.i)).map(o=>({...o,M:mStat(s,sel,o.i),b:mdealBlock(s,sel,o.i)})).filter(o=>o.M).sort((a,b)=>b.M.v-a.M.v);
  if(!L.length)return '';
  return `<div class="label" style="margin-top:12px">🏍 Мотомарки</div>`+L.map(o=>{const M=o.M,P=mdealPrice(s,sel,o.i);
    return `<div class="deal-row"><div style="flex:1"><b>${esc(M.nm)}</b> ${o.b==='ваша'?'<span class="pill good">ваша</span>':o.b?`<span class="pill muted">${esc(o.b)}</span>`:''}<small class="muted">${fmtN(Math.round(M.v))} мотоциклов в год · доля ${pct(M.sh,M.sh<0.1?1:0)} · оценка ${money(M.V)}</small></div>${o.b?'':`<button class="btn sm" data-act="mdealOpen" data-c="${sel}" data-i="${o.i}" ${s.cash<P?'disabled':''}>Купить · ${money(P)}</button>`}</div>`;}).join('');}
function openMdeal(c,i){const s=G,M=mStat(s,c,i);if(!M)return;const b=mdealBlock(s,c,i);if(b){toast('Нельзя: '+b);return;}const P=mdealPrice(s,c,i),hadEq=motoLv(s)>0,H=MBRAND_HIST[M.cp.n]||{};
  openSheet(`<div class="row"><h2>Купить «${esc(M.nm)}»</h2>${X}</div>
    <p class="small muted" style="margin-top:4px">Мотомарка · ${esc(COUNTRIES[c].name)}${H.city?' · '+esc(H.city):''} · ${fmtN(Math.round(M.v))} мотоциклов в год · доля ${pct(M.sh,1)}</p>
    ${H.t?`<p style="margin-top:8px">${esc(H.t)}</p>`:''}
    <div class="label" style="margin-top:12px">Что вы получите</div>
    <p class="small" style="margin-top:4px">• Её цеха — места в вашем заводе: ещё ≈ ${fmtN(Math.round(M.capU/Math.max(0.02,motoCx(s))))} мотоциклов в месяц${hadEq?'':'<br>• Оборудование для мотоциклов — сразу'}<br>• ${c===s.country?`Её дилеров (до ${fmtN(M.dl)})`:`Её дилеров в стране «${esc(COUNTRIES[c].name)}» — ваше отделение там; ваши мотоциклы там — без пошлины`}<br>• Часть её покупателей — несколько лет, если ваши мотоциклы не хуже</p>
    <div class="row" style="margin-top:12px"><span class="muted">Цена (оценка ${money(M.V)} + 20% владельцам)</span><b class="num">${money(P)}</b></div>
    <div class="btns" style="margin-top:12px"><button class="btn primary" data-act="mdealBuy" data-c="${c}" data-i="${i}" ${s.cash<P?'disabled':''}>Купить · ${money(P)}</button><button class="btn" data-act="close">Отмена</button></div>`);}
const MDEAL_ACT={
  mdealOpen:d=>openMdeal(d.c,+d.i),
  mdealBuy:d=>{const r=mdealDo(G,d.c,+d.i);if(r&&r.ok){closeSheet();save();render();flushToasts();}else toast('Не хватает денег');}};
