/* ================= 0.21: экспорт — пошлины, запреты, квоты, сборка на месте (ТЗ 0.18, раздел 6) =================
   Машина, ввезённая целиком, платит пошлину и доставку; собранная в стране из комплектов — меньше; завод в стране
   или купленная местная марка — почти как своя. Меры — по историческим датам: «пошлины Маккенны» в Британии,
   запрет ввоза в Германию 1920–1925, ответ Франции на американский тариф 1922 года, война. Газета предупреждает
   о новой пошлине за 3–6 месяцев. Правило общее для любой родной страны игрока. */

// Режим ввоза в страну c для машин из страны o в момент t (год + месяц/12): пошлина, запрет, квота, объяснение
function tradeRule(c,o,t){let r={duty:0,why:'свободная торговля'};
  if(c==='us'){r=t<1913.75?{duty:0.45,why:'тариф Дингли и Пейна—Олдрича: 45%'}:t<1922.67?{duty:0.3,dLux:0.45,luxP:2000,why:'тариф Андервуда: 30%, машины дороже $2 000 — 45%'}:{duty:0.25,why:'тариф Фордни—Маккамбера: 25%'};}
  else if(c==='uk'){r=t<1915.75?{duty:0,why:'свободная торговля'}:t<1924.58?{duty:0.333,pref:t>=1919?0.667:0,why:'«пошлины Маккенны»: 33⅓% на машины и части'}:t<1925.5?{duty:0,why:'пошлины Маккенны отменены (1924)'}
      :{duty:0.333,pref:0.667,trucks:t>=1926.33,why:'пошлины Маккенны снова (с июля 1925), с мая 1926 — и на грузовики'};
    if(t>=1916.25&&t<1919&&c!==o)r={...r,quota:900,why:r.why+'; в войну ввоз — только по лицензиям'};}
  else if(c==='fr'){r=t<1913?{duty:0.12,why:'пошлина 12%'}:t<1919?{duty:0.14,why:'пошлина 14%'}:{duty:0.45,why:'послевоенный тариф: 45%'};
    if(o==='us'&&t>=1923)r={duty:1,why:'в ответ на американский тариф 1922 года: 100% на машины из США'};}
  else if(c==='de'){r=t<1913?{duty:0.12,why:'пошлина 12%'}:t<1920?{duty:0.15,why:'пошлина 15%'}:t<1925.75?{ban:1,duty:0,why:'запрет ввоза (1920 — октябрь 1925): только свои заводы'}
      :t<1928?{duty:0.4,why:'запрет снят: пошлина 40%'}:{duty:0.25,why:'торговые договоры: пошлина 25%'};}
  else if(c==='it'){r=t<1913?{duty:0.12,why:'пошлина 12%'}:t<1921?{duty:0.15,why:'пошлина 15%'}:{duty:0.6,why:'тариф 1921 года: 60%'};}
  // война: торговли с противником нет (блокада Германии — с августа 1914 до лета 1919)
  if(c!==o&&(c==='de'||o==='de')&&t>=1914.58&&t<1919.5)r={ban:1,duty:0,why:c==='de'?'война и блокада: ввоз в Германию закрыт':'война: торговли с Германией нет'};
  return r;}
function tNow(s){return s.y+s.m/12+0.01;}
function ruleNow(s,c){return tradeRule(c,s.country,tNow(s));}
// Способ выхода на рынок: 1 — импортёр, 2 — своё отделение, 3 — сборка из комплектов, 4 — свой завод; купленная марка и лицензия — отдельно
function localMade(s,c){return impLv(s,c)>=4||intIn(s,c)||licOn(s,c);}
function licOn(s,c){const L=s.lic&&s.lic[c];return !!(L&&L.at<=mi(s));}
// Пошлина на эту машину в этой стране (доля цены): по режиму, способу ввоза, Канаде для стран Империи
function tariffOf(md,c,s){if(c===s.country||localMade(s,c))return 0;const r=ruleNow(s,c);if(r.ban)return 0;
  let d=r.dLux&&md&&md.price>=r.luxP*cpi(s)?r.dLux:r.duty;if(md&&isTruck(md)&&c==='uk'&&!r.trucks)d=0;
  if(c==='uk'&&r.pref&&hubOn(s,'ca'))d*=r.pref;
  const L=impOf(s,c);return d*(L&&L.tar!=null?L.tar:1);}
// 0.23: война рвёт связи. Блокада Германии (август 1914 — июль 1919) отрезает от неё всех иностранцев — даже свой завод
// или купленную там марку: детали, сталь и деньги через блокаду не пройдут, машины туда не доплывут. Иностранная марка в Германии
// работает сама по себе под надзором властей, выручки вам нет; когда ваша страна вступит в войну с Германией — её конфискуют.
// Немецкой фирме блокада закрывает весь мир.
function warCut(s,c){if(c===s.country)return false;const t=tNow(s);return (c==='de'||s.country==='de')&&t>=1914.58&&t<1919.5;}
function tradeBan(s,c){return c!==s.country&&(warCut(s,c)||(!localMade(s,c)&&!!ruleNow(s,c).ban));}
function tradeQuota(s,c){if(c===s.country||localMade(s,c))return 0;return ruleNow(s,c).quota||0;}
// Доставка: через Атлантику дороже; в войну — страховка и потери от подводных лодок
function transAtl(s,c){return (s.country==='us')!==(c==='us');}
function shipCostTo(s,c){if(c===s.country)return 0;const base=(transAtl(s,c)?90:40)*cpi(s),war=transAtl(s,c)&&s.y>=1915&&s.y<=1918?1.6:1;return base*war;}
function shipK(s,c){if(localMade(s,c))return 0;const L=impOf(s,c);return L&&L.ship!=null?L.ship:1;}
// Выручка в местной валюте: в гиперинфляцию (Германия 1922–1923) марки обесцениваются, пока их везут домой
function fxOf(s,c){if(c===s.country||localMade(s,c))return 1;if(c==='de'&&s.y===1922)return 0.7;if(c==='de'&&s.y===1923)return 0.2;return 1;}
// Налог на мощность в Европе: владелец платит каждый год за «налоговые лошадиные силы» — большие моторы невыгодны
function hpTax(md,c,s){if(c==='us'||isTruck(md))return 0;const hp=engineHp(parts(md).e,md),h0=c==='uk'&&s.y>=1921?12:s.y>=1910?18:24;return hp>h0?0.3*Math.log(hp/h0):0;}
// Местный патриотизм: первые годы чужую марку берут неохотно, потом привыкают
function patriotK(s,c){const t0=s.impSince&&s.impSince[c];const yrs=t0!=null?(mi(s)-t0)/12:0;return clamp(1-0.05*yrs,0.5,1);}
function foreignPen(s,c){if(c===s.country)return 0;if(intIn(s,c))return 0;if(licOn(s,c))return 0.05;return (impOf(s,c)||IMP_LV[1]).pen*patriotK(s,c);}
// Вкус рынка (0.21): американцы берут свои машины — большие, дешёвые, с запчастями и мастерской в каждом городке;
// европейская машина в Америке — диковинка для богатых. Свой завод в США помогает, но не до конца: машину делали не для этих дорог.
// (в Европе вкус — это налог на мощность и дорогой бензин: hpTax и weakHp)
const TASTE_US={people:1.3,middle:1.0,truck:0.8,lux:0.3,sport:0.3};
function tastePen(md,c,s){if(c!=='us'||s.country==='us'||intIn(s,'us')||licOn(s,c))return 0;const g=isTruck(md)?'truck':segOf(md),lv=impLv(s,'us');
  return (TASTE_US[g]??1)*(lv>=4?0.85:lv>=3?0.95:1)*clamp((yf(s)-1900)/8,0.3,1);}
/* ---------- стройка за границей ---------- */
function impMonths(s,c,lv){const L=IMP_LV[lv];if(!L.mo)return 0;const k=impK(s,c);return Array.isArray(L.mo)?Math.round(L.mo[0]+(L.mo[1]-L.mo[0])*clamp((k-1)/5,0,1)):L.mo;}
function impBuilding(s,c){return s.impB&&s.impB[c];}
function impTick(s){for(const c in (s.impB||{})){const B=s.impB[c];if(!B)continue;
    // стройка в стране за блокадой замирает: ни станков, ни денег туда не провезти
    if(warCut(s,c)){if(!B.frozen){B.frozen=1;addLog(`${COUNTRIES[c].name}: стройка «${s.company}» заморожена — блокада, ни станков, ни денег туда не провезти. Продолжится после войны.`,'bad');}continue;}
    if(B.frozen){B.frozen=0;addLog(`${COUNTRIES[c].name}: блокада снята — стройка «${s.company}» продолжается.`,'good');}
    if(--B.left>0)continue;delete s.impB[c];impDone(s,c,B.lv);}
  for(const c in (s.lic||{})){const L=s.lic[c];if(L&&L.at===mi(s)){addLog(`${COUNTRIES[c].name}: местный завод начал выпускать ваши машины по лицензии. Вам — ${Math.round(LIC_ROY*100)}% цены с каждой.`,'good');pendingToasts.push('📄 Лицензия: '+COUNTRIES[c].name);}}}
function impDone(s,c,lv){s.imp=s.imp||{};s.imp[c]=lv;const C=COUNTRIES[c],cost=impCost(s,c,lv);
  if(lv===2){s.plantVal+=cost*0.3;addLog(`${C.name}: открыто своё отделение «${s.company}». Посредник больше не берёт свою долю, дилеров можно открыть по всей стране.`,'good');pendingToasts.push('🏢 Отделение: '+C.name);}
  else if(lv===3){s.plantVal+=cost*0.6;addLog(`${C.name}: сборка из комплектов пошла. Пошлина — только на детали, доставка дешевле, покупатели считают машины почти своими.`,'good');pendingToasts.push('🔩 Сборка из комплектов: '+C.name);}
  else if(lv===4){s.plantVal+=cost*0.8;addLog(`${C.name}: свой завод «${s.company}» выпустил первые машины. Пошлины и доставки больше нет — для покупателей это местная марка.`,'good');pendingToasts.push('🏭 Свой завод: '+C.name);}}
/* ---------- лицензия и покупка местной марки ---------- */
const LIC_ROY=0.05;
function licCost(s,c){return Math.round(1500*cpi(s)/100)*100;}
function licStart(s,c){if(c===s.country||impLv(s,c)>=2||(s.lic&&s.lic[c])||tradeBanHard(s,c))return false;const cost=licCost(s,c);if(s.cash<cost)return false;s.cash-=cost;
  s.lic=s.lic||{};s.lic[c]={at:mi(s)+6,t:mi(s)};s.imp=s.imp||{};if(!s.imp[c]){s.imp[c]=1;s.dealers[c]=Math.max(dealerCount(s,c),2);}(s.impSince=s.impSince||{})[c]=s.impSince[c]??mi(s);
  // утечка технологии: местные марки учатся на ваших чертежах
  const g=(s.models.find(m=>m.status==='prod')&&segOf(s.models.find(m=>m.status==='prod')))||'middle',o=respOf(s,c,g);o.mg=(o.mg||0)+0.15;
  addLog(`${COUNTRIES[c].name}: лицензия продана местному заводу. Через полгода он начнёт выпускать ваши машины — без пошлины и доставки; вам — ${Math.round(LIC_ROY*100)}% цены. Чертежи увидят и конкуренты.`,'good');return true;}
function licEnd(s,c){if(!s.lic||!s.lic[c])return;delete s.lic[c];addLog(`${COUNTRIES[c].name}: лицензия отозвана.`);}
// 0.30: газетные предложения о продаже марок, доли в вас, слияния и торги — 105c-deals.js (maInbound)
function brandOfferCheck(s){}
function tradeBanHard(s,c){return warCut(s,c);}
// Слабая местная марка: не из двух крупнейших, продаёт меньше 15% рынка страны
// 0.27: марки в составе больших концернов не продаются: английский завод Ford, MG (гаражи Морриса), отделения General Motors
// (Buick и Oldsmobile — с 1908 года, Cadillac — с 1909-го, Chevrolet — с 1918-го, Vauxhall — с 1925-го, Opel — с 1929-го)
const BRAND_GROUP={'Ford (Манчестер)':0,'MG':0,'Buick':1908,'Oldsmobile':1908,'Cadillac':1909,'Chevrolet':1918,'Vauxhall':1925,'Opel':1929};
function brandCands(s,c){const R=(COMPS[c]||[]).map((cp,i)=>({cp,i,v:compVol(cp,s)})).filter(x=>!pkIs(x.cp,s)&&!x.cp.imp&&x.v>0&&!acqHas(s,c,x.i)).sort((a,b)=>b.v-a.v);
  const tot=R.reduce((a,x)=>a+x.v,0)||1;return R.slice(2).filter(x=>x.v/tot<0.15&&!(BRAND_GROUP[x.cp.n]!=null&&s.y>=BRAND_GROUP[x.cp.n]));}
function brandPrice(s,c,x){const P=prefP('middle',c,s);return Math.round(x.v*P*0.9/1000)*1000;}
function brandOfferOf(s,c){const O=s.brandOffer;return O&&O.c===c&&O.until>mi(s)?O:null;}
function brandBuy(s,c,i){if(c===s.country||intIn(s,c)||warCut(s,c))return false;const x=brandCands(s,c).find(y=>y.i===i);if(!x)return false;const O=brandOfferOf(s,c),cost=O&&O.i===i?O.price:brandPrice(s,c,x);if(s.cash<cost)return false;
  s.brandOffer=null;const h=maClose(s,c,i,{st:1,mode:'int',pay:'cash'},cost,'offer');return !!h;}
// 0.30: доля поглощённой марки (уходит со временем) — boughtShare в 105c-deals.js
/* ---------- Канада: сборка для стран Империи ---------- */
function hubOn(s,h){const H=s.hub&&s.hub[h];return !!(H&&H.at<=mi(s));}
function hubCost(s){return Math.round(120000*cpi(s)/1000)*1000;}
function hubStart(s){if(s.country==='uk'||(s.hub&&s.hub.ca)||s.y<1904)return false;const c=hubCost(s);if(s.cash<c)return false;s.cash-=c;s.plantVal+=c*0.6;s.hub=s.hub||{};s.hub.ca={at:mi(s)+8};
  addLog(`Заложен сборочный завод в Канаде (${money(c)}, 8 мес.): машины из комплектов пойдут в Британию по льготной ставке для стран Империи.`,'good');return true;}
/* ---------- национализация в войну ---------- */
function atWar(a,b,y,m){if(a===b)return false;const t=y+m/12;if(!(a==='de'||b==='de'))return false;const o=a==='de'?b:a;
  return o==='us'?t>=1917.25&&t<1918.9:o==='it'?t>=1915.4&&t<1918.9:t>=1914.58&&t<1918.9;}
function warSeize(s){for(const c of Object.keys(COUNTRIES)){const bld=s.impB&&s.impB[c],H=(s.hold||[]).filter(h=>h.c===c);if(impLv(s,c)<3&&!H.length&&!(bld&&bld.lv>=3))continue;if(!atWar(s.country,c,s.y,s.m))continue;
  const lv=impLv(s,c),B=H[0],what=B?`марка «${B.nm||B.n}»`:lv>=4||(bld&&bld.lv>=4)?`завод «${s.company}»`:`сборочный цех «${s.company}»`,loss=impCost(s,c,Math.max(lv,bld?bld.lv:0))*0.7;
  if(bld)delete s.impB[c];s.imp=s.imp||{};s.imp[c]=0;s.dealers[c]=0;s.hold=(s.hold||[]).filter(h=>h.c!==c);s.plantVal=Math.max(0,s.plantVal-loss);
  pushEvent({kicker:'Война',title:`${COUNTRIES[c].name}: ${what} ${B?'конфискована':'конфискован'}`,deck:'Собственность противника переходит государству',text:`Война: власти страны «${COUNTRIES[c].name}» взяли под управление ${B?`${H.map(h=>'«'+(h.nm||h.n)+'»').join(', ')} с заводами, складами и дилерами`:`завод, склады и сеть «${s.company}»`} как собственность противника. Всё, что было вложено, потеряно; после войны рынок придётся открывать заново.`},true);}}
/* ---------- газета предупреждает о новой пошлине за 3–6 месяцев ---------- */
function tradeNews(s){if(DIF().simple)return;const t=tNow(s);s.tradeSaid=s.tradeSaid||{};
  Object.keys(COUNTRIES).forEach(c=>{if(c===s.country)return;const now=tradeRule(c,s.country,t);
    for(const dm of [3,4,5,6]){const fut=tradeRule(c,s.country,t+dm/12);const ch=(fut.ban?1:0)!==(now.ban?1:0)||Math.abs((fut.duty||0)-(now.duty||0))>0.02||(fut.quota||0)!==(now.quota||0);if(!ch)continue;
      const key=c+'|'+fut.why;if(s.tradeSaid[key])return;s.tradeSaid[key]=1;const when=MONTHS_G[(s.m+dm)%12]+' '+(s.y+Math.floor((s.m+dm)/12));
      const up=fut.ban||(fut.duty||0)>(now.duty||0)||(fut.quota&&!now.quota),mine=dealerCount(s,c)>0||impLv(s,c)>0;
      if(!mine&&!up)return;
      pushEvent({kicker:'Торговля',title:`${COUNTRIES[c].name}: ${fut.ban?'ввоз машин закроют':up?'пошлина на машины вырастет':fut.duty===0?'пошлину на машины отменят':'пошлина на машины снизится'}`,deck:`С ${when}: ${fut.why}`,
        text:`Правительство объявило заранее: с ${when} — ${fut.why}. Сейчас — ${now.ban?'ввоз закрыт':now.quota?'ввоз по квоте':`пошлина ${Math.round((now.duty||0)*100)}%`}.\n${up?(mine?'Импортёры спешат завезти машины до срока. Защита от пошлины — сборка из комплектов (пошлина только на детали) или свой завод в стране.':'Если собирались на этот рынок — думайте о сборке на месте.'):'Покупателям ваши машины станут дешевле — время открыть дилеров.'}`},true);
      return;}});}
/* ---------- за месяц ---------- */
function tradeMonth(s){try{impTick(s);}catch(e){console.warn(e);}try{warSeize(s);}catch(e){console.warn(e);}try{tradeNews(s);}catch(e){console.warn(e);}
  // когда появились в стране — для «патриотизма»
  s.impSince=s.impSince||{};for(const c in (s.dealers||{}))if(c!==s.country&&dealerCount(s,c)>0&&s.impSince[c]==null)s.impSince[c]=mi(s);
  // квоты по стране: счётчик продаж за год
  if(s.m===0)s.quotaY={};}
/* ---------- экран «Мир»: карта доступа, ставки, ваши продажи и прибыль с машины ---------- */
function accessOf(s,c){if(c===s.country)return {k:'home',t:'дома',col:'#d9ab52'};if(warCut(s,c))return {k:'ban',t:'блокада',col:'#e0655a'};const r=ruleNow(s,c);if(r.ban&&!localMade(s,c))return {k:'ban',t:'запрет',col:'#e0655a'};
  if(localMade(s,c))return {k:'local',t:'свой завод',col:'#74d39a'};const q=tradeQuota(s,c),d=r.duty||0;
  if(q)return {k:'quota',t:`квота ${fmtN(q)}/год`,col:'#b48ae0'};return d>=0.4?{k:'high',t:`пошлина ${Math.round(d*100)}%`,col:'#f09a4e'}:d>0.02?{k:'duty',t:`пошлина ${Math.round(d*100)}%`,col:'#f0c75e'}:{k:'open',t:'без пошлины',col:'#74d39a'};}
const WORLD_XY={us:[70,92],uk:[268,58],fr:[284,98],de:[318,72],it:[318,122],ca:[78,40]};
function worldMap(s){const home=s.country,xy=WORLD_XY,L=s.last;
  const land=`<path d="M20 60 Q40 20 110 26 Q150 30 150 70 Q140 120 110 138 Q70 150 40 128 Q14 104 20 60Z" fill="#1d3d5e"/><path d="M240 40 Q262 22 290 34 Q330 30 345 60 Q352 100 336 136 Q316 150 292 138 Q262 128 258 104 Q246 84 240 40Z" fill="#1d3d5e"/>`;
  const routes=Object.keys(COUNTRIES).filter(c=>c!==home&&dealerCount(s,c)>0).map(c=>{const a=xy[home],b=xy[c];return `<path d="M${a[0]} ${a[1]} Q${(a[0]+b[0])/2} ${Math.min(a[1],b[1])-26} ${b[0]} ${b[1]}" stroke="#8ea8c3" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity=".7"/>`;}).join('');
  const dots=Object.keys(COUNTRIES).map(c=>{const A=accessOf(s,c),[x,y]=xy[c],sold=L&&L.mk&&L.mk[c]?L.mk[c].sold||0:0;
    return `<g><circle cx="${x}" cy="${y}" r="${c===home?13:11}" fill="${A.col}" fill-opacity="${c===home?0.9:0.75}" stroke="${c===home?'#fff':'#0d2136'}" stroke-width="${c===home?2:1}"/><text x="${x}" y="${y+3.5}" text-anchor="middle" font-size="9" font-weight="700" fill="#0d2136">${c.toUpperCase()}</text>
      <text x="${x}" y="${y+(y>100?24:-16)}" text-anchor="middle" font-size="8.5" fill="#e6eef7">${esc(A.t)}${sold?' · '+fmtN(sold):''}</text></g>`;}).join('');
  const ca=hubOn(s,'ca')||(s.hub&&s.hub.ca)?`<g><rect x="${xy.ca[0]-16}" y="${xy.ca[1]-8}" width="32" height="16" rx="4" fill="${hubOn(s,'ca')?'#74d39a':'#8ea8c3'}"/><text x="${xy.ca[0]}" y="${xy.ca[1]+3.5}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0d2136">CA</text></g>`:'';
  return `<svg class="world" viewBox="0 0 370 160" role="img" aria-label="Карта доступа на рынки">${land}<text x="185" y="96" text-anchor="middle" font-size="9" fill="#8ea8c3" font-style="italic">Атлантика</text>${routes}${ca}${dots}</svg>`;}
function worldRow(s,c){const home=s.country,A=accessOf(s,c),act=s.models.filter(m=>m.status==='prod'),md=act.sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0],L=s.last,mk=L&&L.mk&&L.mk[c],sold=mk?mk.sold||0:0;
  if(c===home)return `<tr><td><b>${COUNTRIES[c].name}</b> <small class="muted">дома</small></td><td>—</td><td class="n">${fmtN(sold)}</td><td class="n">${md?money(md.price*(1-dMargin(s))-unitCost(md,s)):'—'}</td></tr>`;
  const r=ruleNow(s,c);let perCar='—';if(md&&!A.k.startsWith('ban')){const tf=tariffOf(md,c,s),sh=shipCostTo(s,c)*shipK(s,c),IL=impOf(s,c),net=netPer(md,c,s)-unitCost(md,s);perCar=money(net)+(tf>0?` <small class="muted">(пошлина ${Math.round(tf*100)}%${sh>0?`, доставка ${money(sh)}`:''})</small>`:sh>0?` <small class="muted">(доставка ${money(sh)})</small>`:'');}
  const tp=md?tastePen(md,c,s):0,why=r.why+(tp>0.3?(r.why?'; ':'')+'вкус: берут свои машины':'');
  return `<tr><td><b>${COUNTRIES[c].name}</b><small>${esc(licOn(s,c)?'лицензия':intIn(s,c)?'марка «'+(acqIn(s,c)[0].nm||acqIn(s,c)[0].n)+'»':IMP_LV[impLv(s,c)].n)}</small></td><td><span style="color:${A.col}">●</span> ${esc(A.t)}<small class="muted">${esc(why)}</small></td><td class="n">${fmtN(sold)}</td><td class="n">${perCar}</td></tr>`;}
function worldCard(s){const C=Object.keys(COUNTRIES),nA=C.filter(c=>c!==s.country&&dealerCount(s,c)>0).length;
  // 0.29: и эта карточка сворачивается
  if(!isOpen('world',true))return foldCard('world',true,`<h2>🌍 Мир</h2><span class="pill">${nA} ${plural(nA,'рынок','рынка','рынков')} за границей</span>`,'','карта доступа: пошлины, квоты, запреты, свои заводы','worldc');
  return `<section class="card worldc" id="sec-world"><button class="card-h" data-act="fold" data-k="world" data-def="1" aria-expanded="true"><span class="ch"><h2>🌍 Мир</h2><span class="pill">${nA} ${plural(nA,'рынок','рынка','рынков')} за границей</span></span><i>▴</i></button>
    ${worldMap(s)}
    <p class="small muted" style="margin-top:4px">Цвет — доступ: <span style="color:#74d39a">●</span> свободно или свой завод, <span style="color:#f0c75e">●</span> пошлина, <span style="color:#f09a4e">●</span> высокая пошлина, <span style="color:#b48ae0">●</span> квота, <span style="color:#e0655a">●</span> ввоз запрещён. Машина, ввезённая целиком, платит пошлину и доставку; собранная из комплектов — пошлину только на детали; свой завод или купленная местная марка — как своя. Вкус рынка: в Европе налог на мощность бьёт по большим моторам, а американцы берут свои машины — европейской там трудно даже со своим заводом.</p>
    <table class="pl world-t" style="margin-top:8px"><tr><th>Страна</th><th>Доступ</th><th class="n">Продано</th><th class="n">Вам с машины</th></tr>${C.map(c=>worldRow(s,c)).join('')}</table></section>`;}
