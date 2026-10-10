/* ================= 0.29: СДЕЛКИ — ПОКУПКА И СЛИЯНИЕ МАРОК ПО ВАШЕЙ ИНИЦИАТИВЕ =================
   Раньше марку можно было купить, только когда газета писала, что она продаётся (раз в год-два и только за границей).
   Теперь переговоры можно начать самому — с любой маркой на любом из пяти рынков, и дома тоже:
   «Купить за деньги» — цена от оценки (−20%…+40%): чем щедрее предложение, тем охотнее владельцы соглашаются;
   «Слияние» — без денег: владельцы марки получают долю вашей прибыли навсегда (как акционеры объединённой компании).
   Охотнее продают слабые и падающие марки, в кризис — тем более; лидеры рынка и гордые хозяева (Роллс и Ройс, Бугатти,
   Рено, Форд) — неохотно; отделения концернов (Buick и Cadillac у General Motors) не продаются вовсе. Отказали — год без переговоров.
   Купленная марка — ваша: её покупатели (доля в классах), завод (мощности), дилеры; за границей машины станут местными.
   Так и было: Дюрант собрал General Motors (1908–1909), Моррис купил Wolseley (1927), Chrysler — Dodge (1928),
   Daimler и Benz слились (1926), Ситроен купил Mors (1925). */
// все ваши марки: первая купленная в стране (s.bought[c]) и остальные сделки (s.acq)
function acqList(s){const L=[];if(s.bought)for(const c in s.bought)if(s.bought[c])L.push(s.bought[c]);(s.acq||[]).forEach(a=>L.push(a));return L;}
function acqIn(s,c){return acqList(s).filter(a=>a.c===c);}
function acqHas(s,c,i){if(s.bought&&s.bought[c]&&s.bought[c].i===i)return true;return !!(s.acq&&s.acq.some(a=>a.c===c&&a.i===i));}
// гордые хозяева: свою марку не продают (в 1895–1929 годах)
const DEAL_PROUD={'Rolls-Royce':1,'Bugatti':1,'Renault':1,'Ford':1,'Peugeot':0.6,'FIAT':0.6,'Packard':0.7,'Isotta Fraschini':0.7};
// продажи марки за прошлый год (в первый год — с начала года, в пересчёте на год) и перемена к позапрошлому
function dealStat(s,c,i){const st=(s.comps[c]||[])[i]||{},cp=(COMPS[c]||[])[i];const full=(st.prev||0)>0;
  const v=full?st.prev:Math.max(st.yr||0,cp?compVol(cp,s):0),tr=full&&(st.prev2||0)>0?st.prev/st.prev2-1:0;return {v,tr};}
function dealMarket(s,c){const m=(s.mPrev&&s.mPrev[c])||0;if(m>0)return m;try{return SEGK.reduce((a,g)=>a+mkCountry(c,s,[]).segs[g].inc,0)*12;}catch(_){return 1;}}
// оценка: годовая выручка марки по её классам × 0,85 (завод, дилеры, имя); растущая — дороже, падающая — дешевле; лидер — с премией
function dealValue(s,c,i){const cp=(COMPS[c]||[])[i];if(!cp)return 0;const {v,tr}=dealStat(s,c,i);let P=0,w=0;for(const g in (cp.mix||{})){const k=cp.mix[g]||0;P+=k*prefP(g,c,s);w+=k;}P=w?P/w:prefP('middle',c,s);
  const sh=v/Math.max(1,dealMarket(s,c)),lead=sh>0.15?1.25:1;return Math.max(5000,Math.round(v*P*0.85*clamp(1+tr*0.8,0.6,1.5)*lead/1000)*1000);}
// можно ли вести переговоры: не своя, не куплена, жива, не отделение концерна, не в стране врага, не «пауза» после отказа
function dealBlock(s,c,i){const cp=(COMPS[c]||[])[i];if(!cp||cp.imp||cp.pk===s.pioneer)return 'нельзя';if(acqHas(s,c,i))return 'ваша';if(!compAlive(cp,s))return 'закрылась';
  if(BRAND_GROUP[cp.n]!=null&&s.y>=BRAND_GROUP[cp.n])return 'в концерне';if(c!==s.country&&(warCut(s,c)||atWar(s.country,c,s.y,s.m)))return 'война';
  const t=(s.dealNo||{})[c+i];if(t&&t>mi(s))return 'пауза';return '';}
// шанс согласия: k — цена к оценке (для слияния — 1,1: владельцы остаются совладельцами)
function dealChance(s,c,i,k){const cp=(COMPS[c]||[])[i],{v,tr}=dealStat(s,c,i),sh=v/Math.max(1,dealMarket(s,c));let x=(k-1.05)*7;
  if(tr<-0.1)x+=0.8;if(econ(s.y,s.m,c).f<0.9)x+=0.6;if(sh>0.25)x-=1.4;else if(sh>0.12)x-=0.7;x+=(s.rep-50)/50*0.6;
  if(typeof companyValue==='function'&&companyValue(s)>dealValue(s,c,i)*3)x+=0.3;let p=1/(1+Math.exp(-x));p*=1-(DEAL_PROUD[compName(cp,s)]??DEAL_PROUD[cp.n]??0);return clamp(p,0.01,0.97);}
function dealMergeShare(s,c,i){const V=dealValue(s,c,i),me=Math.max(1,typeof companyValue==='function'?companyValue(s):s.plantVal+s.cash);return clamp(V/(V+me),0.03,0.6);}
// сделка: kind 'buy' (k — доля оценки) или 'merge'
function dealDo(s,c,i,kind,k){if(dealBlock(s,c,i))return null;const cp=(COMPS[c]||[])[i],V=dealValue(s,c,i),price=kind==='buy'?Math.round(V*k/1000)*1000:0,nm=compName(cp,s);
  if(kind==='buy'&&s.cash<price)return null;const msh=kind==='merge'?dealMergeShare(s,c,i):0;
  if(kind==='merge'&&(typeof companyValue==='function'?companyValue(s):0)<V*0.6)return null;
  const p=dealChance(s,c,i,kind==='merge'?1.1:k),ok=Math.random()<p;
  if(!ok){s.dealNo=s.dealNo||{};s.dealNo[c+i]=mi(s)+12;addLog(`Переговоры с «${nm}» сорвались: владельцы ${kind==='merge'?'не хотят слияния':'считают цену слишком низкой'}. Следующие — через год.`,'bad');return {ok:false,nm,p};}
  const {v}=dealStat(s,c,i);
  if(kind==='buy'){s.cash-=price;s.plantVal+=price*0.45;}else{s.plantVal+=V*0.45;(s.partners=s.partners||[]).push({n:nm,sh:+msh.toFixed(3),t:mi(s)});}
  const a={c,i,n:cp.n,y:s.y,t:mi(s),how:kind};
  // первая марка за границей — как прежде: местное производство, без пошлины; остальные — в общий список
  if(c!==s.country&&!(s.bought&&s.bought[c])){s.bought=s.bought||{};s.bought[c]=a;if(s.lic&&s.lic[c])licEnd(s,c);s.imp=s.imp||{};s.imp[c]=Math.max(impLv(s,c),2);(s.impSince=s.impSince||{})[c]=mi(s)-120;}
  else (s.acq=s.acq||[]).push(a);
  // её машина — теперь ваша модель в её главном классе: покупатели марки остаются с ней (без разработки и оснастки — завод куплен)
  const mnew=dealTakeModel(s,c,cp,v);
  // её завод и дилеры — ваши
  const capAdd=Math.max(2,Math.round(v/12*1.1));s.cap+=capAdd;const dl=Math.max(2,Math.round(v/12/Math.max(0.5,dealerTP(s))));s.dealers[c]=dealerCount(s,c)+dl;s.rep=clamp(s.rep+2,0,100);
  const where=c===s.country?'':` (${COUNTRIES[c].name})`;
  addLog(`${kind==='buy'?`Куплена марка «${nm}»${where} за ${money(price)}`:`Слияние с «${nm}»${where}: её владельцы получают ${Math.round(msh*100)}% вашей прибыли`} — её покупатели, завод (+${fmtN(capAdd)} машин в месяц) и ${fmtN(dl)} ${plural(dl,'дилер','дилера','дилеров')} теперь ваши${mnew?`; её модель «${mnew.name}» выпускается под вашим управлением`:''}.`,'good');
  pendingToasts.push(`🤝 ${kind==='buy'?'Куплена':'Слияние:'} «${nm}»`);
  pushEvent({kicker:'Сделка',own:1,title:kind==='buy'?`«${s.company}» покупает «${nm}»`:`«${s.company}» и «${nm}» объединяются`,deck:kind==='buy'?`${money(price)} · ${COUNTRIES[c].name}`:`Владельцы «${nm}» — совладельцы: ${Math.round(msh*100)}% прибыли`,
    text:`${kind==='buy'?`Владельцы «${nm}» приняли предложение «${s.company}»: ${money(price)} за заводы, дилеров и имя марки.`:`«${nm}» входит в «${s.company}» без денег: её хозяева становятся совладельцами и получают ${Math.round(msh*100)}% прибыли объединённой компании.`}\nПокупатели «${nm}» остаются с маркой — теперь это ваши покупатели${c===s.country?'':`, а машины в стране «${COUNTRIES[c].name}» — местные, без пошлины`}. Завод прибавляет ${fmtN(capAdd)} машин в месяц.\nТак собирались концерны эпохи: Дюрант собрал General Motors из Buick, Oldsmobile и Cadillac (1908–1909), Daimler и Benz слились в 1926 году, Chrysler купил Dodge в 1928-м.`},true);
  return {ok:true,nm,p,price,msh};}
// модель купленной марки — в её главном классе, на деталях своего года, под её именем
function dealTakeModel(s,c,cp,v){try{const nm=compName(cp,s),gs=Object.entries(cp.mix||{}).filter(([g])=>g!=='truck'&&(g!=='sport'||sportOpen(s,c))).sort((a,b)=>b[1]-a[1]),g=gs.length?gs[0][0]:'middle',d=autoDesign(g,s),cm=compModel(cp,s);
    const m={id:s.nextId++,name:String(cm?cm[1]:nm).slice(0,28),e:d.e,g:d.g,c:d.c,k:d.k,b:d.b,t:d.t,w:d.w,paint:PAINTS[s.models.length%PAINTS.length].id,price:0,plan:'auto',status:'prod',devLeft:0,launched:mi(s),
      stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:Math.round(v/12),vol:Math.round(v/12*10)/10,acq:nm,only:c};m.price=Math.round(refPrice(m,s)/10)*10;s.models.push(m);return m;}catch(e){console.warn('deal model',e);return null;}}
// партнёры по слиянию получают свою долю прибыли
function partnersShare(s){return Math.min(0.75,(s.partners||[]).reduce((a,p)=>a+(p.sh||0),0));}
/* ---------- вкладка «Рынок»: карточка «Сделки» ---------- */
function dealsCard(s){const sel=(s.ui&&s.ui.dealC)||s.country,cs=Object.keys(COUNTRIES);
  const L=(COMPS[sel]||[]).map((cp,i)=>({cp,i})).filter(o=>!o.cp.imp&&o.cp.pk!==s.pioneer&&compAlive(o.cp,s)).map(o=>{const {v,tr}=dealStat(s,sel,o.i),b=dealBlock(s,sel,o.i);return {...o,v,tr,b,V:dealValue(s,sel,o.i)};}).sort((a,b)=>b.v-a.v);
  const mk=Math.max(1,dealMarket(s,sel)),own=acqList(s);
  const rows=L.map(o=>{const nm=compName(o.cp,s),sh=o.v/mk,tag=o.b==='ваша'?'<span class="pill good">ваша</span>':o.b==='в концерне'?'<span class="pill muted">в концерне</span>':o.b==='пауза'?'<span class="pill warn">отказали</span>':o.b?`<span class="pill muted">${esc(o.b)}</span>`:'';
    return `<div class="deal-row"><div style="flex:1"><b>${esc(nm)}</b> ${tag}<small class="muted">${fmtN(o.v)} машин в год · доля ${pct(sh,sh<0.1?1:0)}${o.tr?` · <span class="${o.tr>0?'good':'bad'}">${o.tr>0?'▲':'▼'}${Math.round(Math.abs(o.tr)*100)}%</span>`:''} · оценка ${money(o.V)}</small></div>${o.b?'':`<button class="btn sm" data-act="dealOpen" data-c="${sel}" data-i="${o.i}">Переговоры</button>`}</div>`;}).join('');
  const body=`<p class="small muted" style="margin-top:2px">Купите марку-конкурента — её покупатели, завод и дилеры станут вашими. Или предложите слияние без денег: владельцы получат долю вашей прибыли. Слабые и падающие марки продаются охотнее, лидеры рынка и гордые хозяева — неохотно; отделения концернов не продаются. Отказали — следующие переговоры через год.</p>
    <div class="chips sm" style="margin-top:8px">${cs.map(c=>`<button class="chip ${sel===c?'on':''}" data-act="dealC" data-v="${c}">${COUNTRIES[c].name}</button>`).join('')}</div>
    <div style="margin-top:6px">${rows||'<p class="small muted">Здесь пока нет марок.</p>'}</div>
    ${own.length?`<p class="small good" style="margin-top:8px">Ваши марки: ${own.map(a=>`«${esc(a.n)}» (${COUNTRIES[a.c].name}${a.how==='merge'?', слияние':''})`).join(', ')}.${partnersShare(s)?` Совладельцам по слияниям — ${Math.round(partnersShare(s)*100)}% прибыли.`:''}</p>`:''}`;
  return foldCard('deals',false,`<h2>Сделки</h2><span class="label">покупка и слияние марок</span>`,body,own.length?`ваши марки: ${own.map(a=>esc(a.n)).join(', ')}`:'купить конкурента или слиться с ним — на любом рынке');}
function openDeal(c,i){const s=G,cp=(COMPS[c]||[])[i];if(!cp)return;const b=dealBlock(s,c,i);if(b){toast('Переговоры невозможны: '+b);return;}
  const nm=compName(cp,s),{v,tr}=dealStat(s,c,i),V=dealValue(s,c,i),sh=v/Math.max(1,dealMarket(s,c)),m=compModel(cp,s),ph=m&&m[2]&&IMG[m[2]];
  const offers=[[0.8,'−20%'],[1,'по оценке'],[1.2,'+20%'],[1.4,'+40%']].map(([k,lab])=>{const P=Math.round(V*k/1000)*1000,p=dealChance(s,c,i,k);return `<button class="btn${k===1.2?' primary':''}" data-act="dealGo" data-c="${c}" data-i="${i}" data-k="buy" data-v="${k}" ${s.cash<P||s.pending.length?'disabled':''}>${money(P)} · ${lab}<small>шанс ≈${Math.round(p*100)}%</small></button>`;}).join('');
  const msh=dealMergeShare(s,c,i),pm=dealChance(s,c,i,1.1),mOk=(typeof companyValue==='function'?companyValue(s):0)>=V*0.6;
  openSheet(`<div class="row"><div><span class="label">Сделка · ${COUNTRIES[c].name}</span><h2 style="margin-top:2px">«${esc(nm)}»</h2></div><button class="iconbtn" data-act="close" aria-label="Закрыть">×</button></div>
    ${ph?`<img class="cmp-ph" style="margin-top:8px;max-width:100%" src="${ph.src}" alt="" referrerpolicy="no-referrer">`:''}
    <p class="small" style="margin-top:8px">${fmtN(v)} машин в год · доля рынка ${pct(sh,1)}${tr?` · ${tr>0?'растёт':'падает'} на ${Math.round(Math.abs(tr)*100)}%`:''}${m?` · модель — ${esc(m[1])}`:''}.</p>
    <p class="small muted" style="margin-top:4px">Оценка — <b>${money(V)}</b>: годовая выручка марки, её заводы, дилеры и имя${sh>0.15?' (лидер рынка — с премией)':''}. Купите — её покупатели, завод (+${fmtN(Math.max(2,Math.round(v/12*1.1)))} машин в месяц) и дилеры станут вашими${c===s.country?'':', машины в этой стране — местными, без пошлины'}.</p>
    <div class="label" style="margin-top:12px">Купить за деньги</div><div class="btns deal-offers" style="margin-top:6px">${offers}</div>
    <div class="label" style="margin-top:12px">Слияние — без денег</div>
    <p class="small muted" style="margin-top:4px">Владельцы «${esc(nm)}» станут совладельцами: им — ${Math.round(msh*100)}% прибыли объединённой компании, навсегда.</p>
    <button class="btn block" style="margin-top:6px" data-act="dealGo" data-c="${c}" data-i="${i}" data-k="merge" ${!mOk||s.pending.length?'disabled':''}>${mOk?`Предложить слияние · шанс ≈${Math.round(pm*100)}%`:'Слишком маленькая компания для слияния с ними'}</button>
    <p class="small muted" style="margin-top:8px">Откажут — следующие переговоры с «${esc(nm)}» через год. Деньги при отказе не тратятся.</p>`);}
const DEAL_ACT={
  dealC:d=>{G.ui=G.ui||{};G.ui.dealC=d.v;rerender();},
  dealOpen:d=>openDeal(d.c,+d.i),
  dealGo:d=>{const s=G,r=dealDo(s,d.c,+d.i,d.k,+d.v||1);closeSheet();if(!r){toast('Сделка невозможна');rerender();return;}
    if(!r.ok)toast(`«${r.nm}»: отказ (шанс был ≈${Math.round(r.p*100)}%)`);checkAch();save();rerender();flushToasts();}};
