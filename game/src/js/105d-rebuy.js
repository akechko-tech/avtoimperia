/* ================= 0.31: ПРОДАЛИ КОМПАНИЮ — КУПИТЕ ДРУГУЮ МАРКУ; ВЫКУП ДОЛЕЙ СОВЛАДЕЛЬЦЕВ =================
   Продав компанию (банкирам, правительству, конкуренту), основатель остаётся с деньгами — и может начать снова:
   купить действующую марку любой страны целиком, с её заводами, дилерами, инженерами и машинами (как Уильям Дюрант,
   потерявший General Motors в 1910 году, основал Chevrolet и вернул себе GM; как Уолтер Крайслер, взявший Maxwell).
   Прежняя компания уходит в историю: её очки наследия — половиной в зачёт («Прежние компании»), трофеи остаются.
   Совладельцев (оплата акциями, финансисты, инвестор гонщика) можно выкупить: их доля по стоимости компании и премия 25%. */

// марка игрока: основанная им (pk основателя) или купленная после продажи своей компании (s.brandRef)
function pkIs(X,s){if(!X||!s)return false;const B=s.brandRef;if(B)return (X.bn||X.n)===B.n||(Array.isArray(X.mq)&&X.mq.includes(B.n));return X.pk===s.pioneer;}
function rbPrice(M){return Math.round(M.V*1.1/1000)*1000;}
// что можно купить: действующие марки (не импорт, не ваши прежние), дешевле — выше
function rbList(s,c){const out=[];(COMPS[c]||[]).forEach((cp,i)=>{if(cp.imp||!compAlive(cp,s)||pkIs(cp,s))return;if((s.pastCos||[]).some(p=>p.bn===cp.n))return;
    const M=maStat(s,c,i);if(!M)return;out.push({c,i,cp,M,price:rbPrice(M)});});return out.sort((a,b)=>b.M.v-a.M.v);}
// при продаже: прежняя компания — в архив (очки наследия на день продажи, годы, цена)
function rbArchive(s,P,mine){let leg=0;try{leg=Math.round(playerLegacy(s).total);}catch(_){}
  (s.pastCos=s.pastCos||[]).push({n:s.company,c:s.country,bn:s.brandRef?s.brandRef.n:null,y0:typeof coFoundedY==='function'?coFoundedY(s):1895,y1:s.y,price:P,mine,leg,sold:typeof totalSold==='function'?totalSold(s):0,
    races:ownRaces(s).filter(r=>r.place===1).length,titles:(s.titles||[]).length});}
// сохранения 0.30: компанию продали, а деньги легли в кассу (s.cash += цена) — это и есть ваши деньги; прежнюю компанию — в архив
function rbMigrate(s){const S=s.soldTo;if(!S||S.mine!==undefined)return;S.mine=Math.max(0,Math.round(s.cash||0));S.co=S.co||s.company;
  if(!(s.pastCos||[]).some(p=>p.n===s.company&&p.y1===S.y))rbArchive(s,S.price||S.mine,S.mine);}
// очки прежних компаний в наследии: половина
function rbLegacy(s){return Math.round((s.pastCos||[]).reduce((a,p)=>a+(p.leg||0),0)*0.5);}
// заводская оснащённость марки: всё, что в отрасли прижилось хотя бы три года назад
function rbTech(s){const t={};for(const k in TECH){const T=TECH[k];let n=0;(T.lv||[]).forEach(l=>{if(l.y<=s.y-3)n++;});if(n)t[k]=Math.min(T.max||n,n);}return t;}
function rbBuy(s,c,i){rbMigrate(s);const cp=(COMPS[c]||[])[i],M=cp&&maStat(s,c,i);if(!M)return false;const price=rbPrice(M),money0=s.soldTo?s.soldTo.mine:s.cash;if(money0<price)return false;
  const nm=compName(cp,s),v=M.v,old=s.company;
  // новая компания: имя, страна, деньги
  s.brandRef={c,i,n:cp.n,pk:cp.pk||null,t:mi(s),price};s.company=nm;s.country=c;s.startY=s.y;s.cash=money0-price;s.loan=0;s.over=false;s.soldTo=null;s.final=null;s.fameSaved=0;s.pending=[];
  // заводы, рабочие, склад, технологии
  s.cap=Math.max(6,Math.round(M.capU));s.capBuild=[];s.shifts=1;s.staffAuto=true;s.wagePol='market';s.tech=rbTech(s);s.techBuild=null;s.plantVal=Math.round(s.cap*capUnitCost(s)*0.6);
  s.wh=Math.max(12,Math.round(s.cap*1.5));s.whBuild=[];s.military=false;s.orders=[];s.tenders=[];s.strikeNext=false;s.supplyNext=1;
  // дилеры — свои, дома; импорт, лицензии, дочерние — с нуля
  s.dealers={[c]:Math.max(3,M.dl)};s.imp={};s.impB={};s.impSince={};s.dcap={};s.lic={};s.pmk={};s.hold=[];s.partners=[];s.investor=null;s.auc=null;s.maOffer=null;s.dealNo={};
  s.inv={};s.finL=[];s.ar=[];s.ad=Math.round(adRef(s,c)*0.6/10)*10;
  // КБ и гоночный отдел марки
  s.rd={lvl:clamp(Math.round(Math.log10(Math.max(10,v))*1.2-0.5),2,6),projs:[],upg:{},early:[]};s.kit={};s.rdept=0;s.drivers=[];s.contracts={};s.dmood={};s.rbud={};
  // имя марки знают — её машины на дорогах
  s.rep=clamp(Math.round(45+M.sh*80),45,75);s.aw={};for(const k in COUNTRIES)s.aw[k]=k===c?clamp(0.55+M.sh*2,0.6,0.95):0.05;
  s.pfleet={[c]:Math.round(v*Math.min(5,Math.max(1,s.y-(cp.since||s.y)))*0.8)};s.pfl=null;
  // история компании — заново (прежняя — в архиве); мир, газеты, трофеи, хроника — те же
  s.hist={cash:[],sales:[],market:[],profit:[],share:[]};s.peak={year:0,share:{}};s.yearSold=0;s.last=null;s.lhist=[];s.cY={};s.cPrev={};s.cPrev2={};
  s.raceLog=[];s.titles=[];s.firsts={};s.medals=[];s.showFx={};s.kings=null;s.kingFx=null;s.legends={};s.legBonus=0;s.legPrev=undefined;s.legNow=undefined;
  s.chal=null;s.duelFx=[];s.scandalMd=null;s.recall=null;s.copy={};s.helperMsg=null;
  // машины марки — теперь ваши модели: главный класс и (если марка делала и его) второй
  s.models=[];const cm=compModel(cp,s),mix=Object.entries(cp.mix||{middle:1}).sort((a,b)=>b[1]-a[1]).filter(([g,k],j)=>j===0||k>=0.25).slice(0,2);
  const SUF={people:'Народная',middle:'II',lux:'Люкс',sport:'Спорт',truck:'Грузовик'};
  mix.forEach(([g,k],j)=>{try{const kind=g==='truck'?'truck':g,d=autoDesign(kind,s),base=String(cm?cm[1]:nm).replace(/\s*«.*?»/g,'').slice(0,24);
      const m={id:s.nextId++,name:j?`${base} ${SUF[g]||'II'}`:base,e:d.e,g:d.g,c:d.c,k:d.k,b:d.b,t:d.t,w:d.w,eq:d.eq||[],paint:PAINTS[(j+2)%PAINTS.length].id,price:0,plan:'auto',status:'prod',devLeft:0,launched:mi(s),
        stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:Math.round(v/12*k),vol:Math.round(v/12*k*10)/10,from:nm};
      m.price=Math.round(refPrice(m,s)/10)*10;s.models.push(m);}catch(e){console.warn('rebuy model',e);}});
  // рабочих — сколько нужно под выпуск марки
  try{const hpw=hoursPerWorker(s);s.workers=Math.max(12,Math.ceil(s.models.reduce((a,m)=>a+m.fc*hoursPerCar(m,s),0)/hpw*1.02));}catch(_){s.workers=Math.max(12,Math.round(s.cap*4));}
  addLog(`Основатель «${old}» купил марку «${nm}» (${COUNTRIES[c].name}) за ${money(price)}: заводы на ${fmtN(s.cap)} машин в месяц, ${s.dealers[c]} дилеров, ${s.models.length} ${plural(s.models.length,'модель','модели','моделей')}.`,'good');
  pushEvent({kicker:'Сделка',own:1,title:`Хозяин «${old}» купил «${nm}»`,deck:`${COUNTRIES[c].name} · ${money(price)} · ${fmtN(Math.round(v))} машин в год`,
    text:`Продав «${old}», вы не ушли из автомобильного дела: за ${money(price)} куплена «${nm}» — с заводами, дилерами, инженерами и машинами. Так Уильям Дюрант, потеряв в 1910 году General Motors, основал Chevrolet — и через шесть лет вернул себе GM.\nПрежняя компания осталась в истории: половина её очков наследия — в вашем зачёте.`,
    choices:[['За работу','ok']]},true);
  try{managerPlan.c&&managerPlan.c.clear();}catch(_){}
  return true;}
/* ---------- лист «Купить марку» ---------- */
let RB_C=null;
function openRebuy(){const s=G;if(!s)return;rbMigrate(s);const cs=Object.keys(COUNTRIES),sel=RB_C||s.country,have=s.soldTo?s.soldTo.mine:s.cash,L=rbList(s,sel);
  const rows=L.map(o=>{const M=o.M,g=maMainClass(o.cp,s,o.c),ok=have>=o.price;return `<div class="deal-row"><div style="flex:1"><b>${esc(M.nm)}</b> <span class="pill">${esc(SEG[g]?SEG[g].name:'')}</span>
      <small class="muted">${fmtN(Math.round(M.v))} машин в год · доля ${pct(M.sh,M.sh<0.1?1:0)}${M.tr?` · <span class="${M.tr>0?'good':'bad'}">${M.tr>0?'▲':'▼'}${Math.round(Math.abs(M.tr)*100)}%</span>`:''} · заводы на ${fmtN(Math.round(M.capU))} в месяц · ${fmtN(M.dl)} дилеров</small></div>
      <button class="btn sm ${ok?'primary':''}" data-act="rbBuy" data-c="${o.c}" data-i="${o.i}" ${ok?'':'disabled'}>${money(o.price)}</button></div>`;}).join('');
  openSheet(`<div class="row"><span class="label">Новое дело</span>${X}</div><h2 style="margin-top:4px">Купить другую марку</h2>
    <p class="small" style="margin-top:6px">${s.soldTo?`За «${esc(s.soldTo.co)}» вы получили <b>${money(have)}</b>.`:`У вас ${money(have)}.`} Купите действующую марку целиком — заводы, дилеров, инженеров и машины — и ведите её до 1930 года. Прежняя компания останется в истории: половина её очков наследия — в зачёт.</p>
    <div class="chips sm" style="margin-top:10px">${cs.map(c=>`<button class="chip ${sel===c?'on':''}" data-act="rbC" data-v="${c}">${COUNTRIES[c].name}</button>`).join('')}</div>
    <div style="margin-top:8px">${rows||'<p class="small muted">В этой стране продающихся марок нет.</p>'}</div>
    <p class="small muted" style="margin-top:8px">Цена — оценка аналитиков и 10% сверху: владельцы продают целиком, без торга.</p>`);}
/* ---------- выкуп долей совладельцев ---------- */
function bbPrice(s,p){return Math.max(1000,Math.round(companyValue(s)*(p.sh||0)*1.25/1000)*1000);}
function bbInvPrice(s){const I=s.investor;if(!I||mi(s)>=I.until)return 0;const left=clamp((I.until-mi(s))/120,0.25,1);return Math.max(1000,Math.round(companyValue(s)*(I.sh||0)*1.2*left/1000)*1000);}
function bbHTML(s,sh){const P=s.partners||[],I=s.investor&&mi(s)<s.investor.until?s.investor:null;if(!P.length&&!I)return '';const A=sh?' data-sh="1"':'';
  return `<div class="label" style="margin-top:12px">Совладельцы вашей компании · ${Math.round((partnersShare(s)+(I?I.sh||0:0))*100)}% прибыли</div>`+
    P.map((p,k)=>{const c=bbPrice(s,p);return `<div class="deal-row"><div style="flex:1"><b>${esc(p.n)}</b> <span class="pill">${Math.round(p.sh*100)}%</span><small class="muted">получают ${Math.round(p.sh*100)}% вашей прибыли${p.t!=null?' с '+(1895+Math.floor(p.t/12))+' года':''}</small></div>
      <button class="btn sm" data-act="bbBuy" data-k="${k}"${A} ${s.cash<c?'disabled':''}>Выкупить · ${money(c)}</button></div>`;}).join('')+
    (I?(()=>{const c=bbInvPrice(s);return `<div class="deal-row"><div style="flex:1"><b>Партнёр-инвестор</b> <span class="pill">${Math.round((I.sh||0)*100)}%</span><small class="muted">его доля — до ${1895+Math.floor(I.until/12)} года</small></div><button class="btn sm" data-act="bbInv"${A} ${s.cash<c?'disabled':''}>Выкупить · ${money(c)}</button></div>`;})():'')+
    `<p class="small muted" style="margin-top:4px">Выкуп — по стоимости компании с премией 25%: совладельцы уступают долю, если платят сразу и больше рынка.</p>`;}
// 0.31: совладельцы — отдельным листом (из отчёта о прибыли и из «Сделок»)
function bbShare(s){const I=s.investor&&mi(s)<s.investor.until?s.investor:null;return partnersShare(s)+(I?I.sh||0:0);}
function openBuyback(){const s=G;if(!s)return;const h=bbHTML(s,true);
  openSheet(`${X}<span class="label">${dstr(s)}</span><h2 style="margin-top:4px">Совладельцы «${esc(s.company)}»</h2>
    ${h||'<p class="small muted" style="margin-top:8px">Совладельцев больше нет — вся прибыль компании ваша.</p>'}
    <p class="small muted" style="margin-top:8px">В кассе ${money(s.cash)}. Доли появляются, когда платите за сделку акциями или продаёте часть компании финансистам.</p>`);}
function bbBuy(s,k){const p=(s.partners||[])[k];if(!p)return false;const c=bbPrice(s,p);if(s.cash<c)return false;s.cash-=c;s.partners.splice(k,1);
  addLog(`Выкуплена доля «${p.n}» (${Math.round(p.sh*100)}%) за ${money(c)}: эта часть прибыли теперь ваша.`,'good');return true;}
function bbInv(s){const c=bbInvPrice(s);if(!c||s.cash<c)return false;const sh=s.investor.sh;s.cash-=c;s.investor=null;addLog(`Выкуплена доля партнёра-инвестора (${Math.round(sh*100)}%) за ${money(c)}.`,'good');return true;}
const RB_ACT={
  rbOpen:()=>openRebuy(),
  rbC:d=>{RB_C=d.v;openRebuy();},
  rbBuy:d=>{const s=G;if(!confirmOnce('rb'+d.c+d.i,'Нажмите ещё раз: купить марку и вести её'))return;if(rbBuy(s,d.c,+d.i)){closeSheet();tab='plant';save();render();window.scrollTo(0,0);flushToasts();}},
  bbOpen:()=>openBuyback(),
  bbBuy:d=>{if(bbBuy(G,+d.k)){save();if(d.sh)openBuyback();rerender();flushToasts();}},bbInv:d=>{if(bbInv(G)){save();if(d.sh)openBuyback();rerender();flushToasts();}}};
