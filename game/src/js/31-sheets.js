/* ================= SHEETS ================= */
const sheet=document.getElementById('sheet'),sb=document.getElementById('sheetBody');
function openSheet(html){if(typeof xpopClose==='function')xpopClose();sb.innerHTML=html;sheet.hidden=false;sb.scrollTop=0;}
function closeSheet(){if(typeof xpopClose==='function')xpopClose();sheet.hidden=true;draft=null;if(evHold){evHold=0;setTimeout(()=>{if(G&&G.pending.length&&!R&&sheet.hidden)render();},80);}}
// 0.21: пока открыты итоги гонки, новости (травмы, пари, титулы) ждут — покажутся, когда итоги закроют
let evHold=0;
sheet.addEventListener('click',e=>{if(e.target===sheet&&G&&(!G.pending.length||evHold)&&!(draft&&draft.ng&&G.over)&&!(draft&&draft.lock))closeSheet();});
function showEvent(){
  const ev=G.pending[0];
  if(ev.cel&&!ev.celOn){ev.celOn=1;try{celebrate(ev.cel[0],ev.cel[1],ev.cel[2],ev.cel[3]);}catch(_){}}
  if(ev.saga){if(!SAGAP)sagaPlay(ev.saga);return;}
  if(ev.duel){duelShow(ev);return;}
  if(ev.chance){openSheet(chanceHTML(ev));return;}
  if(ev.paper){if(PW.hidden||!PW.innerHTML)showPaper({title:ev.title,deck:ev.deck,text:ev.text,img:ev.img,imgCap:ev.imgCap,carId:ev.carId,own:ev.own,carOpt:ev.carOpt,caption:ev.caption,hist:ev.hist,histCap:ev.histCap,choices:ev.choices,act:'choose',kicker:ev.kicker||(G.over?'Последний выпуск':'Экстренный выпуск'),mean:ev.mean,reel:ev.reel});return;}
  openSheet(`<span class="label">${dstr(G)}${ev.kicker?' · '+esc(ev.kicker):''}</span><h2 style="margin-top:4px">${esc(ev.title)}</h2>${ev.deck?`<p class="small warn" style="margin-top:4px">${esc(ev.deck)}</p>`:''}${ev.text.split('\n').map(t=>`<p style="margin-top:10px">${esc(t)}</p>`).join('')}<div class="stack" style="margin-top:16px">${ev.choices.map((c,i)=>`<button class="btn ${i===0?'primary':''} block" data-act="choose" data-k="${c[1]}">${esc(c[0])}</button>`).join('')}</div>`);
}
const X=`<button class="iconbtn" data-act="close" aria-label="Закрыть">×</button>`;
function designKind(d){const b=byId(BODIES,d.b);return b.truck?(d.b==='b6'?'van':'truck'):segOf(d);}
// 0.34: что сделала кнопка-помощник («Передовая модель», «Подобрать детали повыгоднее») — строкой под кнопками,
// пока проект не меняли (тост под листом конструктора не виден)
let dNote=null;
const dSig=d=>PART_KEYS.map(k=>d[k]).join(',')+'|'+d.t+'|'+(d.eq||[]).join(',');
function dNoteHTML(d){return dNote&&dNote.sig===dSig(d)?`<p class="small dnote">${dNote.txt}</p>`:'';}
function dApply(md,label){const s=G,sig0=dSig(draft),b0=designMd(s,draft),tr=isTruck(b0),S0=classScore(b0,s,s.country),U0=unitCost(b0,s);
  PART_KEYS.forEach(x=>draft[x]=md[x]);draft.t=md.t;draft.eq=(md.eq||[]).slice();
  const b1=designMd(s,draft),S1=classScore(b1,s,s.country),U1=unitCost(b1,s),pr=PART_KEYS.map(x=>byId(PART_CATS.find(c=>c.k===x).arr(),draft[x])).filter(x=>x&&x.y>s.y);
  let main=`итог против соперника <b class="num">${Math.round(S0*100)}% → ${Math.round(S1*100)}%</b>`;
  // грузовик фирмы выбирают по цене тонно-километра и удобству шофёру — показываем, как изменится их спрос при той же цене машины
  if(tr){const T=xTruckCmp(b0,b1,s,b0.price),pc=f=>Math.round(Math.abs(f-1)*100),why=[];
    const c1=pc(T.cpk)>=1,c2=pc(T.soft)>=3;if(c1)why.push(`тонно-километр ${T.cpk<1?'дешевле':'дороже'} на ${pc(T.cpk)}%`);
    if(c2)why.push(`${!c1?'':(T.cpk<1)===(T.soft>1)?'и ':T.soft>1?'зато ':'но '}шофёру ${T.soft>1?'удобнее':'неудобнее'}`);
    const dm=T.dem>=2?`≈ в ${xTimes(T.dem)} больше`:T.dem<=0.5?`≈ в ${xTimes(1/T.dem)} меньше`:pc(T.dem)<1?'тот же':'≈ '+(T.dem>1?'+':'−')+pc(T.dem)+'%';
    main=`спрос фирм при той же цене <b class="num ${T.dem>=1.005?'good':T.dem<=0.995?'bad':''}">${dm}</b>${why.length?` (${why.join(c1&&c2&&(T.cpk<1)===(T.soft>1)?' ':', ')})`:''}`;}
  const same=dSig(draft)===sig0;
  dNote={txt:same?`${label}: менять нечего — проект уже такой.`:`${label}: ${main}, себестоимость <b class="num">${money(U0)} → ${money(U1)}</b>.${pr.length?`<br><span class="warn">🔬 Прототипы КБ: ${pr.map(x=>esc(x.name)).join(', ')} — риск «не по ТЗ».</span>`:''}`,sig:dSig(draft)};
  const top=sb.scrollTop;renderDesigner();sb.scrollTop=top;}
function openDesigner(kind){kind=kind||(!lineOn(G,'car')&&!G.carShopB?'moto':(G.y>=1908?'people':'middle'));dNote=null;
  draft={name:(typeof brandNextName==='function'&&brandNextName(G))||'Тип '+(G.models.length+1),...rivalDesign(kind,G.y),paint:PAINTS[G.models.length%PAINTS.length].id,open:null};
  try{draft.eq=eqAuto(draft,kindIsTruck(kind)?'truck':kind,G);}catch(_){draft.eq=[];}renderDesigner();}
// 0.30: новинки оснащения в конструкторе — стартер, электросвет, ветровое стекло… (свои — из КБ, остальные — у поставщиков)
function eqDesignHTML(d,s,kind){const g=kindIsTruck(kind)?'truck':kind;if(g==='truck'||isMotoSeg(g))return '';const y=yf(s),L=eqOf(d);
  const items=EQUIP.filter(e=>e.y<=s.y+3&&(eqAvail(s,e.id)||rdActive(s).some(p=>p.kind==='eq'&&p.id===e.id)));if(!items.length)return '';
  const chip=e=>{const on=L.includes(e.id),ok=eqAvail(s,e.id)&&(!e.req||eqAvail(s,e.req)),w=eqWait(e,g,y),u=e.u[g]||0;
    const tag=!ok?'в КБ':w>0.25?'ждут покупатели':u>=0.15?'покупатели доплатят':u>0?'приятная мелочь':'не нужно классу';
    return `<button class="chip ${on?'on':''}" data-act="eqToggle" data-v="${e.id}" ${ok?'':'disabled'}>${esc(e.name)}${eqDev(s,e.id)&&s.y<e.hist[0]+1?' 🔬':''}<small>${tag} · ${money(eqUnitC(e,s))}</small></button>`;};
  const miss=eqExpected(g,y).filter(e=>!L.includes(e.id)&&!L.some(id=>EQ_BY[id].sup===e.id)&&eqAvail(s,e.id));
  return `<div class="label" style="margin-top:14px">Новинки оснащения</div><div class="chips">${items.map(chip).join('')}</div>${miss.length?`<p class="small warn" style="margin-top:6px">Покупатели класса уже ждут: ${miss.map(e=>e.name.toLowerCase()).join(', ')} — без этого машину берут хуже.</p>`:''}<p class="small muted" style="margin-top:4px">${esc((EQUIP.find(e=>L.includes(e.id)&&e.note)||items.find(e=>e.note)||{note:''}).note)}</p>`;}
// Важность черты для покупателей класса: ●●● главное, ●● важно, ● немного
function wDots(w){return w>=0.24?'●●●':w>=0.12?'●●○':w>0?'●○○':'○○○';}
// 0.34: xid — какую машину объяснять во всплывающем окне «как посчитано» ('d' — проект в конструкторе, 'L:…' — легенда, номер модели)
function cmpRowHTML(k,C,xid){const r=C.by[k],tone=r>=1.05?'good':r<0.95?'bad':'muted',w=Math.min(100,r/2*100),tag=xid!=null?'button':'div';
  return `<${tag} class="cmp-row${xid!=null?' cmp-x':''}"${xid!=null?` data-act="chx" data-k="${k}" data-id="${xid}" aria-label="${CHAR_NAMES[k]}: как посчитано"`:''}><span>${CHAR_NAMES[k]}${xid!=null?'<i class="xi">i</i>':''}<small>${wDots(C.W[k])}</small></span><div class="cmp-bar"><i style="width:${w}%;background:var(--${tone==='muted'?'line':tone})"></i><b></b></div><span class="num ${tone}">${Math.round(r*100)}%</span></${tag}>`;}
function compareHTML(md,s,xid){const C=classCompare(md,s,s.country),ph=C.ref.name&&refIMG(C.ref.name);
  const rows=CHAR_K.filter(k=>C.W[k]>0||C.by[k]!==1).map(k=>cmpRowHTML(k,C,xid)).join('');
  return `<div class="card cmp" style="margin-top:12px;background:var(--panel2)"><div class="row" style="align-items:flex-start">${ph?`<img class="cmp-ph" src="${ph.src}" alt="" referrerpolicy="no-referrer">`:''}<div style="flex:1"><span class="label">Соперник в классе «${esc(KIND_NAME[C.ref.kind])}»</span><h3 style="margin-top:2px">${esc(C.ref.name)} <span class="muted small">${C.ref.y}</span></h3><p class="small muted">Покупатели сравнивают ${isMoto(md)?'ваш мотоцикл с этим':'вашу машину с этой'}. 100% — так же, как у соперника; ●●● — что для них главное.${xid!=null?' Нажмите на строку — как посчитано.':''}</p></div></div>
    <div style="margin-top:8px">${rows}</div>${qbar(C.S,'Итог против соперника',xid)}${studyBtn(C.ref,s)}</div>`;}
// проект в конструкторе — как его видит рынок (цена — типичная, выпуск — сколько купят), как в renderDesigner
function designMd(s,d){const md={...d,made:0,vol:Math.max(20,(s.last&&s.last.made)||20),launched:mi(s),status:'prod',price:0};md.price=Math.round(refPrice(md,s)/10)*10;md.vol=Math.max(3,forecastDemand(md,s));return md;}
function studyBtn(ref,s){const c=studyList(s).find(o=>o.name===ref.name&&o.y===ref.y);if(!c)return '';
  if(c.own)return `<p class="small muted" style="margin-top:8px">Это машина вашей марки — какой она была в настоящей истории. Покупать и разбирать её незачем: покупатели сравнивают вашу машину с тем, какой её сделали тогда.</p>`;
  if(c.done)return `<p class="small good" style="margin-top:8px">🔍 КБ уже разобрало ${esc(c.name)}.</p>`;if(c.busy)return `<p class="small muted" style="margin-top:8px">🔍 КБ разбирает ${esc(c.name)}.</p>`;
  const free=rdSlots(s)-rdActive(s).length;
  return `<button class="btn sm block" style="margin-top:8px" data-act="rdStudy" data-k="${c.kind}" ${free<=0||s.cash<c.price?'disabled':''}>🔍 Купить и разобрать в КБ · ${money(c.price)}${free<=0?' — нет свободного места в КБ':''}</button>`;}
function renderDesigner(){
  const s=G,d=draft,md={...d,made:0,vol:Math.max(20,(s.last&&s.last.made)||20),launched:mi(s),status:'prod',price:0},p=parts(md),mx=chassisMax(p.c,md),kind=designKind(d);
  const ref=refPrice(md,s),dc=devCost(md,s),dm=devMonths(md),tc=toolingCost(md,s),st=carStats(md,0,s.y),net=ref*(1-dMargin(s));
  md.price=Math.round(ref/10)*10;const dem=forecastDemand(md,s),pc=x=>money(partCost(x,s));
  // себестоимость — при том выпуске, который купят по этой цене: экономия масштаба
  md.vol=Math.max(3,dem);const uc=unitCost(md,s),hrs=hoursPerCar(md,s),ucAt=k=>unitCost({...md,vol:md.vol*k},s);
  const mo=isMoto(md);
  const chips=(arr,k,sub,f)=>`<div class="chips">${unlockedP(arr,s,mo&&arr!==TRIMS).filter(x=>!f||f(x)).map(x=>`<button class="chip ${d[k]===x.id?'on':''}" data-act="pick" data-k="${k}" data-v="${x.id}">${arr===TRIMS?trimName(x,s):x.name}${upgL(x.id)?' ★'+upgL(x.id):''}${x.y>s.y?' 🔬':''}<small>${sub(x)}</small></button>`).join('')}</div>`;
  const ease=x=>x>=0.8?'лёгкая':x>=0.5?'обычная':'тяжёлая',pedal=x=>x>=0.8?'мягкая педаль':'тугая педаль',star=x=>upgL(x.id)?' ★'+upgL(x.id):'';
  const SUB={e:x=>`${Math.round(engineHp(x))} л.с. · ${x.kg} кг · расход ${Math.round(x.fuel*100)} · ${pc(x)}`,g:x=>`КПД ${Math.round(x.eff*100)}% · ${ease(x.ease)} · ${pc(x)}`,
    c:x=>`до ${Math.round(chassisMax(x))} л.с. · ${x.kg} кг · ход ${Math.round(x.ride*100)} · ${pc(x)}`,w:x=>`сцепление ${Math.round(x.grip*100)} · ресурс ${fmtN(x.life)} км · ${pc(x)}`,
    k:x=>`сила ${Math.round(x.brk*100)} · ${pedal(x.ease)} · ${pc(x)}`,t:x=>`${({t0:'народный',t1:'средний',t2:'люкс',t3:'спортивный'})[x.id]} класс · ${money(x.c*cpi(s))}`,b:x=>x.moto?`${(x.seats||1)>1?'коляска, '+x.seats+' '+plural(x.seats,'место','места','мест'):'одиночка'} · ${x.kg} кг · ${pc(x)}`:`${x.truck?(x.pay+' т груза'):(x.seats+' мест')}${x.closed?' · закрытый':''} · ${x.kg} кг · ${pc(x)}`};
  const MSN={e:'Мотор',g:'Передача',c:'Рама и вилка',w:'Шины',k:'Тормоз',b:'Седло или коляска'};
  const sec=(cat)=>{const x=p[cat.k],open=d.open===cat.k;return `<div class="dsec${open?' open':''}"><button class="dsec-h" data-act="dsec" data-k="${cat.k}"><span class="label">${mo&&MSN[cat.k]?MSN[cat.k]:cat.name}</span><b>${esc(cat.k==='t'?trimName(x,s):x.name)}${star(x)}</b><small>${SUB[cat.k](x)}</small><i>${open?'▴':'▾'}</i></button>
    ${open?chips(cat.arr(),cat.k,SUB[cat.k],cat.k==='b'?(y=>mo?!!y.moto:kindIsTruck(kind)?!!y.truck:kind==='sport'?bodyOpen(y.id):!y.truck):cat.k==='t'?(y=>y.id!=='t3'||bodyOpen(d.b)):null)+(x.note||cat.k==='e'?`<p class="small muted" style="margin-top:6px">${esc(x.note||'')}${cat.k==='e'&&typeof exhNote==='function'?(x.note?' ':'')+esc(exhNote(x)):''}</p>`:'')+(typeof REELS!=='undefined'&&REELS['part:'+x.id]?`<button class="btn sm" style="margin-top:6px" data-act="reel" data-k="part:${x.id}">▶ Кинохроника: как это устроено</button>`:''):''}</div>`;};
  // 0.33: классы машин и мотоциклов — в одном ряду (что умеет делать завод)
  const carOk=canDesign(s,'car'),motoOk=canDesign(s,'moto');
  const classChips=(carOk?[['people','t0'],['middle','t1'],['lux','t2']].concat(unlockedP(TRIMS,s).some(x=>x.id==='t3')?[['sport','t3']]:[]).map(([g2,t])=>`<button class="chip ${!mo&&!kindIsTruck(kind)&&d.t===t?'on':''}" data-act="dclass" data-v="${g2}">${SEG[g2].name}<small>${money(prefP(g2,s.country,s))}</small></button>`).join('')
    +(s.y>=1896||unlockedP(BODIES,s).some(b=>b.truck)?`<button class="chip ${kind==='van'?'on':''}" data-act="dclass" data-v="van">Фургон<small>для бизнеса</small></button>`:'')
    +(unlockedP(BODIES,s).some(b=>b.truck&&b.id!=='b6')?`<button class="chip ${kind==='truck'?'on':''}" data-act="dclass" data-v="truck">Грузовик<small>для бизнеса</small></button>`:''):'')
    +(motoOk?MOTOSEG.map(g2=>`<button class="chip ${kind===g2?'on':''}" data-act="dclass" data-v="${g2}">🏍 ${g2==='moto'?'Мотоцикл':'С коляской'}<small>${money(prefP(g2,s.country,s))}</small></button>`).join(''):'');
  const classNote=(carOk?'':lineEmptyCard(s,'car'))+(motoOk||!motoVis(s)?'':lineEmptyCard(s,'moto'));
  openSheet(`<div class="row"><h2>${mo?'Новый мотоцикл':'Новая модель'}</h2>${X}</div>
    <div class="carbox">${carArt(md,{anim:true})}</div>
    <div class="row" style="margin-top:8px"><span class="pill warn">${esc(KIND_NAME[kind])}</span><div class="btns">${PAINTS.map(c=>`<button class="swatch ${d.paint===c.id?'on':''}" style="background:${c.id}" data-act="pick" data-k="paint" data-v="${c.id}" aria-label="${c.name}"></button>`).join('')}</div></div>
    <label class="label" for="mname" style="display:block;margin-top:12px">Название</label><input type="text" id="mname" value="${esc(d.name)}" maxlength="24" style="margin-top:6px">
    <div class="label" style="margin-top:14px">Для кого ${mo?'мотоцикл':'машина'}</div><div class="chips">${classChips}</div>${classNote}
    ${kindIsTruck(kind)?(()=>{const TH=truckHead({...md,price:Math.round(ref/10)*10},s,Math.round(ref/10)*10);return TH?`<p class="small ${TH.tone}" style="margin-top:12px">🚚 <b>${esc(TH.txt)}</b> <span class="muted">· ${esc(TH.use)}: ${cpkTxt(TH.cp)} против ${cpkTxt(TH.cR)} — фирмы выбирают по тонно-километру; «% соперника» — ниже</span></p>`:'';})():''}
    ${compareHTML(md,s,'d')}${hiddenHTML({...md,price:Math.round(ref/10)*10},s,true)}
    <div class="dbtns" style="margin-top:10px"><button class="btn sm" data-act="dcopy">Как у соперника</button><button class="btn sm" data-act="dfront">Передовая модель</button><button class="btn sm primary wide" data-act="dauto">Подобрать детали повыгоднее</button></div>${dNoteHTML(d)}
    <div class="label" style="margin-top:14px">Детали — нажмите, чтобы выбрать</div>
    <div class="dsecs">${PART_CATS.map(sec).join('')}${mo?'':sec({k:'t',name:'Оснащение',arr:()=>TRIMS})}</div>${eqDesignHTML(d,s,kind)}
    <div class="card" style="margin-top:14px;background:var(--panel2)">
      <div class="row small"><span class="muted">Нагрузка на раму</span><span class="num ${overpower(md)?'bad':''}">${Math.round(p.e.hp)} / ${Math.round(mx)} л.с.</span></div>
      <div class="bar" style="margin-top:6px"><i style="width:${Math.min(100,p.e.hp/mx*100)}%;background:var(--${overpower(md)?'bad':p.e.hp/mx>0.8?'warn':'good'})"></i></div>
      ${overpower(md)?'<p class="small bad" style="margin-top:6px">Рама не выдержит мотор: машины будут ломаться, покупатели и репутация пострадают.</p>':''}
      <div class="row small" style="margin-top:10px"><span class="muted">На ходу</span><span class="num">${statsLine(st)}</span></div>
      ${riskHTML(md,s)}
      <div class="meta"><button class="mx" data-act="chx" data-k="cost" data-id="d" aria-label="Себестоимость: как посчитано">Себест.<i class="xi">i</i><b>${money(uc)}</b></button><div>Цена ≈<b>${money(ref)}</b></div><div>Маржа<b class="${net-uc<0?'bad':''}">${money(net-uc)}</b></div><div>Спрос ≈<b>${fmtD(dem)}/мес</b></div></div>
      <div style="margin-top:6px">${eqPriceLine({...md,id:-11,launched:mi(s)},s)}</div>
      <div class="meta"><div>Часов<b>${fmtN(Math.round(hrs))}</b></div><div>Разработка<b>${dm} мес.</b></div><div>Бюджет<b>${money(dc)}</b></div><div>Оснастка<b>${money(tc)}</b></div></div>
      <p class="small muted" style="margin-top:8px">Себестоимость — детали и работа при выпуске ≈ ${fmtD(md.vol)} в месяц (столько купят по этой цене). <span class="good">Экономия масштаба:</span> при ${fmtN(md.vol*3)} в месяц — ${money(ucAt(3))}, при ${fmtN(md.vol*10)} — ${money(ucAt(10))}; с опытом рабочих — ещё дешевле. Оснастку оплатите при запуске в серию${techLv(s,'line')===2?': конвейер под новую модель перестраивать дорого':''}.</p></div>
    <button class="btn primary block" style="margin-top:14px" data-act="startdev" ${s.cash<dc?'disabled':''}>${s.cash<dc?'Не хватает денег на разработку':'Начать разработку · '+money(dc)}</button>`);
  document.getElementById('mname').addEventListener('input',e=>{draft.name=e.target.value;});
}
function kindIsTruck(k){return k==='van'||k==='truck';}
function openRD(){
  // 0.33: проекты машин и мотоциклов — в одном списке (мотоциклетные помечены 🏍); переносы между ними — отдельной группой
  const s=G,mv=motoVis(s),ALL=rdProjects(s),XF=ALL.filter(p=>p.kind==='xfer'),L=ALL.filter(p=>p.kind!=='xfer'),pts=rdTotal(s)/(rdActive(s).length+1),free=rdSlots(s)-rdActive(s).length;
  const item=pj=>{const c=rdCost(pj,s);if(pj.kind==='xfer')return xferItem(pj,s,pts,free);const xb=pj.kind!=='eq'?xferBadge(s,partById(pj.id)||{}):'';return `<div class="race-item"><div class="row"><div><span class="mo">${pj.moto?'🏍 ':''}${pj.cat} · ${pj.kind==='upg'?'улучшение ★'+pj.lvl:pj.kind==='eq'?'новинка на '+pj.yrs+' г. раньше поставщиков':'прототип на '+pj.yrs+' г. раньше'}${xb?' · '+xb:''}</span><h3 style="margin-top:2px">${esc(pj.name)}</h3></div><button class="btn sm" data-act="rdStart" data-k="${pj.kind}:${pj.id}" ${free<=0||s.cash<c?'disabled':''}>~${Math.ceil(pj.need/pts)} мес. · ${money(c)}</button></div>
    <p class="small muted" style="margin-top:4px">${pj.kind==='upg'?UPG_TXT[pj.ck]:pj.kind==='eq'?esc((EQ_BY[pj.id]||{}).note||'')+' Поставьте на новую модель раньше истории — первенство в зачёт наследия.':`Деталь станет доступна только вам. Запустите её в серию раньше истории — это первенство в зачёт наследия. <span class="warn">Передний край: риск, что испытания потребуют доработки, — ${Math.round(protoRisk(pj)*100)}%; в серии первые годы — детские болезни и риск выйти не по ТЗ.</span>`}${pj.know?' · <span class="good">изучено на машине конкурента: на 40% быстрее</span>':''}${pj.mass?' · <span class="good">массовая деталь: на 20% быстрее</span>':''}${(()=>{const k=rdShareK(pj,s);if(k>=1)return '';const x=partById(pj.id)||{};return ` · <span class="good">опыт ${x.moto?'автомобильных':'мотоциклетных'} ${pj.ck==='e'?'моторов':'шин'}: дешевле на ${Math.round((1-k)*100)}%</span>`;})()}</p></div>`;};
  const SL=studyList(s),sItem=c=>{if(c.own)return `<div class="race-item off"><span class="mo">${esc(KIND_NAME[c.kind])} · эталон класса ${c.y} года</span><h3 style="margin-top:2px">${esc(c.name)}</h3><p class="small muted" style="margin-top:4px">Это ваша марка — в настоящей истории. Свою машину не покупают и не разбирают: эталон класса здесь — вы сами.</p></div>`;
    const g=studyGain(c,s),dis=c.done||c.busy||free<=0||s.cash<c.price;
    return `<div class="race-item"><div class="row"><div><span class="mo">${esc(KIND_NAME[c.kind])} · эталон класса ${c.y} года</span><h3 style="margin-top:2px">${esc(c.name)}</h3></div><button class="btn sm" data-act="rdStudy" data-k="${c.kind}" ${dis?'disabled':''}>${c.done?'Изучен':c.busy?'В работе':'Купить · '+money(c.price)}</button></div>
      <p class="small muted" style="margin-top:4px">~${Math.ceil(STUDY_NEED/pts)} мес. в КБ. ${g.fut.length?`<span class="good">Внутри — то, чего нет у поставщиков: ${esc(g.fut.map(x=>x.name).join(', '))}.</span> `:''}${g.ups.length?`<span class="good">Доводка соперников: ${esc(g.ups.map(x=>x.name).join(', '))}.</span> `:''}Улучшать изученные детали станет быстрее, новая модель этого класса — дешевле.</p></div>`;};
  // 0.24: три раскрывающиеся группы — улучшения (детали ваших машин и современные), новые (прототипы и машины конкурентов), устаревшие
  const upg=L.filter(p=>p.kind==='upg'),old=upg.filter(p=>!p.mine&&partObsolete(p.ck,p.id,s)),cur=upg.filter(p=>!old.includes(p)).sort((a,b)=>(b.mine?1:0)-(a.mine?1:0)||(b.py||0)-(a.py||0)),early=L.filter(p=>p.kind==='early'||p.kind==='eq');
  const mineN=cur.filter(p=>p.mine).length,SLn=SL.filter(c=>!c.done&&!c.own).length,item2=pj=>pj.mine?item(pj).replace('<span class="mo">',`<span class="mo"><b class="good">● в ваших ${pj.moto?'мотоциклах':'машинах'}</b> · `):item(pj);
  openSheet(`<div class="row"><h2>Проекты КБ</h2>${X}</div>
    <p class="small muted" style="margin-top:6px">${RD_LV[s.rd.lvl]}: силы бюро поровну делятся между проектами (потом можно перераспределить), свободных мест — ${Math.max(0,free)}. Чем выше уровень, тем дальше в будущее можно заглянуть с прототипами.</p>
    <p class="small muted" style="margin-top:4px">Каждый проект стоит денег сверх содержания бюро (${money(rdUpkeep(s))} в месяц): опытные образцы, материалы, стенды и испытания — платите при старте.</p>
    <div style="margin-top:12px">${fold('rdUpg','🔧 Улучшения',cur.length?cur.map(item2).join(''):'<p class="small muted" style="padding:6px 0">Современные детали улучшены до предела.</p>',true,`${cur.length} ${plural(cur.length,'проект','проекта','проектов')}${mineN?` · в ваших машинах — ${mineN}`:''}`)}</div>
    <div style="margin-top:8px">${fold('rdNew','🔬 Новые',`${early.length?`<p class="small muted" style="margin-top:4px">Прототипы деталей, которых ещё нет на рынке: только для ваших машин.</p>${early.map(item).join('')}`:'<p class="small muted" style="padding:6px 0">Прототипов в пределах видимости бюро пока нет — поднимите уровень КБ, чтобы заглянуть дальше.</p>'}
      ${SL.length?`<div class="label" style="margin-top:12px">Купить и изучить машину конкурента</div><p class="small muted" style="margin-top:4px">С этими машинами покупатели сравнивают ваши. КБ разберёт машину до винтика: перенимет доводку соперников, а детали, которых ещё нет у поставщиков, сможет делать само.</p>${SL.map(sItem).join('')}`:''}`,early.length>0||SL.some(c=>!c.done&&studyGain(c,s).fut.length),`${early.length} ${plural(early.length,'прототип','прототипа','прототипов')}${SLn?` · машин конкурентов — ${SLn}`:''}`)}</div>
    <div style="margin-top:8px">${fold('rdOld','🗄 Устаревшие',old.length?`<p class="small muted" style="margin-top:4px">Эти детали уже обогнали новые — их ставят разве что на самые дешёвые машины. Улучшать стоит, только если вы ими пользуетесь.</p>${old.map(item).join('')}`:'<p class="small muted" style="padding:6px 0">Устаревших деталей нет.</p>',false,`${old.length} ${plural(old.length,'деталь','детали','деталей')}`)}</div>
    ${XF.length?`<div style="margin-top:8px">${fold('rdX','🔁 Переносы между линейками',`<p class="small muted" style="margin-top:4px">Изобретение принадлежит марке: что освоено в автомобиле, можно перенести в мотоцикл, и наоборот. Перенос дешевле нового исследования и вдвое быстрее, но может не удаться — тогда деталь выходит тяжелее или дороже, а вторая попытка дешевле и вероятнее.</p>${XF.map(item).join('')}`,true,`${XF.length} ${plural(XF.length,'перенос','переноса','переносов')} · лучший шанс ${Math.round(Math.max(...XF.map(p=>p.chance))*100)}%`)}</div>`:''}
    ${!L.length?'<p class="small muted" style="margin-top:10px">Все доступные детали улучшены до предела.</p>':''}`);
}
// 0.35: новая игра — сначала путь, потом его исторические фигуры (отзыв: «сначала выбор пути, появляются персонажи для выбора: гонщик —
// одни исторические фигуры, мото — другие, либо фабрикант, финансист, техник»). Фабрикант, финансист и техник — своя марка с января 1895 года
const NG_PATHS=[
  {k:'racer',ico:'🏁',t:'Гонщик',when:'дебют — с 1895 по 1924 год',d:'Призы, заводские команды и слава — потом своя марка, как у Лянчи и Шевроле.'},
  {k:'moto',ico:'🏍',t:'Мотомастерская',when:'с 1899 по 1905 год — по стране',d:'Мало денег и мотоциклы — потом автомобильный цех, как у NSU, Laurin & Klement и Peugeot.'},
  {k:'maker',ico:'🏭',t:'Фабрикант',when:'январь 1895 года',d:'Поток и мощности: машина дешевле, чем у всех, — и её покупает каждый.'},
  {k:'money',ico:'💼',t:'Финансист',when:'январь 1895 года',d:'Капитал, кредит и сделки: покупайте марки и собирайте из них империю.'},
  {k:'tech',ico:'🔧',t:'Техник',when:'январь 1895 года',d:'Лучшие машины эпохи: КБ, качество и изобретения раньше других.'}];
function ngPathOf(d){return d.path==='racer'?'racer':d.path==='moto'?'moto':(d.role||'maker');}
// герои пути: гонщики — из RACERS, мотоциклисты — PIONEERS с moto, фабриканты, финансисты и техники — PIONEERS с role
function ngHeroes(k){if(k==='racer')return Object.keys(RACERS).filter(x=>x!=='custom');return Object.keys(PIONEERS).filter(x=>x!=='custom'&&(k==='moto'?PIONEERS[x].moto:PIONEERS[x].role===k));}
function ngFace(k,racer){const P=racer?RACERS[k]:PIONEERS[k],d=racer&&DRIVERS.find(x=>x.id===k),im=racer?d&&IMG[DRIVER_WIKI[d.id]]:P.wiki&&IMG[P.wiki],nm=racer?P.n:P.name;
  return im?`<span class="ng-face"><img src="${im.src}" alt="" referrerpolicy="no-referrer"></span>`:!racer&&typeof portraitSVG==='function'?`<span class="ng-face ng-svg">${portraitSVG(k)}</span>`:`<span class="ng-face ng-ini">${esc(String(nm).split(' ').map(w=>w[0]).join('').slice(0,2))}</span>`;}
function openPathPick(){
  const card=p=>{const H=ngHeroes(p.k),racer=p.k==='racer',names=H.map(k=>{const n=racer?RACERS[k].n:PIONEERS[k].name;return n.split(' ').slice(-1)[0];}).join(', ');
    return `<button class="ng-path" data-act="ngPath" data-v="${p.k}"><span class="ng-ico">${p.ico}</span><span class="ng-b"><b>${p.t}</b><small class="ng-when">${p.when}</small><span class="ng-d">${p.d}</span><span class="ng-faces">${H.slice(0,5).map(k=>ngFace(k,racer)).join('')}<small>${esc(names)}${H.length?' или свой персонаж':''}</small></span></span></button>`;};
  openSheet(`<div class="row"><h2>Новая игра</h2>${G?X:'<button class="iconbtn" data-act="toMenu" aria-label="В главное меню">×</button>'}</div>
    <p class="small muted" style="margin-top:6px">Кем вы начнёте? Путь решает, когда и с чего начнётся игра и за кого из исторических фигур можно играть. Цель одна — к 1930 году создать величайшую автоимперию эпохи.</p>
    <div class="stack" style="margin-top:12px;gap:8px">${NG_PATHS.slice(0,2).map(card).join('')}</div>
    <div class="label" style="margin-top:16px">Своя марка с января 1895 года</div>
    <div class="stack" style="margin-top:8px;gap:8px">${NG_PATHS.slice(2).map(card).join('')}</div>`);}
function openNewGame(){
  const prev=draft&&draft.ng?draft:null;
  draft={ng:true,lock:!G,pioneer:prev?prev.pioneer:'ford',country:prev?prev.country:'us',company:prev?prev.company:PIONEERS.ford.co,diff:prev?prev.diff:'normal',first:prev?prev.first:'Тип 1',
    path:prev&&prev.path||'company',role:prev&&prev.role||null,step:prev&&prev.step||'path',racer:prev&&prev.racer||'custom',rname:prev&&prev.rname||'',rc:prev&&prev.rc||'fr',ry:prev&&prev.ry||1900};
  if(draft.step==='path'){openPathPick();return;}
  const PT=NG_PATHS.find(p=>p.k===ngPathOf(draft))||NG_PATHS[2];
  const pathChips=`<div class="row ng-back" style="margin-top:10px"><button class="linkbtn" data-act="ngBack">← Другой путь</button><span class="small muted">${PT.ico} ${PT.t} · ${PT.when}</span></div>`;
  if(draft.path==='racer'){openRacerNew(pathChips);return;}
  // 0.34: у «Мотомастерской» — свои герои (мотоциклисты, что потом строили автомобили) и «Свой персонаж»; у марки — автомобилисты
  // 0.35: у фабриканта, финансиста и техника — свои (role), Энцо Феррари — у гонщиков
  const moto=draft.path==='moto',role=moto?null:(draft.role||'maker');if(!moto)draft.role=role;
  const fits=k=>{const P=PIONEERS[k];return !!P&&!P.racer&&(k==='custom'||(moto?!!P.moto:(!P.moto&&P.role===role)));};
  if(!fits(draft.pioneer)){const was=PIONEERS[draft.pioneer],nk=moto?'custom':(ngHeroes(role)[0]||'custom');if(!was||draft.company===was.co)draft.company=nk==='custom'?(moto?'Мотомастерская':PIONEERS.custom.co):PIONEERS[nk].co;draft.pioneer=nk;if(nk!=='custom')draft.country=PIONEERS[nk].c;}
  const list=Object.keys(PIONEERS).filter(fits).sort((a,b)=>(a==='custom')-(b==='custom')).map(k=>[k,PIONEERS[k]]).map(([k,P])=>`<button class="pion ${draft.pioneer===k?'on':''}" data-act="pion" data-v="${k}">${portraitHTML(k)}<div><h3>${P.name}</h3><div class="yrs">${P.yrs?P.yrs+' · ':''}${COUNTRIES[P.c].name}</div><p>${P.bio}</p><div class="bon">${P.plus.map(x=>`<span class="p">${x}</span>`).join('')}${P.minus.map(x=>`<span class="m">${x}</span>`).join('')}</div></div></button>`).join('');
  openSheet(`<div class="row"><h2>Новая игра</h2>${G?X:'<button class="iconbtn" data-act="toMenu" aria-label="В главное меню">×</button>'}</div>${pathChips}
    <p class="small muted" style="margin-top:8px">${moto?`Январь ${motoStartY(draft.country)} года. Мастерская с горсткой рабочих и одним мотоциклом. Наберитесь опыта, постройте автомобильный цех и выпустите первую машину — как Laurin & Klement, NSU и Peugeot. ${(()=>{const t=MSTART_TIP[draft.country];return t?`<b>Старт: ${t[0]}.</b> ${t[1]}`:'';})()}`:`${(()=>{const t=CSTART_TIP[draft.country];return t?`<b>Старт: ${t[0]}.</b> ${t[1]}`:'';})()}`} Цель — создать величайшую автоимперию эпохи. В 1930 году вашу компанию сравнят с реальными — Ford, General Motors, Citroën, FIAT, Bugatti, Rolls-Royce — по масштабу, рынку, изобретениям, победам, капиталу и имени.</p>
    <div class="label" style="margin-top:14px">Кто вы?</div><div class="stack" style="margin-top:8px;gap:8px">${list}</div>
    <label class="label" for="cname" style="display:block;margin-top:16px">Название компании</label><input type="text" id="cname" value="${esc(draft.company)}" maxlength="28" style="margin-top:6px">
    <label class="label" for="fname" style="display:block;margin-top:12px">Как назовёте ${moto?'первый мотоцикл':'первую машину'}?</label><input type="text" id="fname" value="${esc(draft.first||'Тип 1')}" maxlength="24" style="margin-top:6px" placeholder="Тип 1">
    <div class="label" style="margin-top:14px">Страна</div>
    <div class="country" style="margin-top:6px">${Object.entries(COUNTRIES).map(([k,c])=>`<button class="chip ${draft.country===k?'on':''}" data-act="country" data-v="${k}">${c.name}<small>${c.city} · ${money(c.cash)} · гоночный цвет — ${c.raceName}</small><small>${c.note}</small></button>`).join('')}</div>
    <div class="label" style="margin-top:14px">Сложность</div>
    <div class="country" style="margin-top:6px">${Object.entries(DIFFS).map(([k,d])=>`<button class="chip ${draft.diff===k?'on':''}" data-act="diff" data-v="${k}">${d.name}<small>${d.desc}</small></button>`).join('')}</div>
    <button class="btn primary block" style="margin-top:16px" data-act="startgame">${moto?'Открыть мотомастерскую':'Основать компанию'}</button>`);
  document.getElementById('cname').addEventListener('input',e=>{draft.company=e.target.value;});
  document.getElementById('fname').addEventListener('input',e=>{draft.first=e.target.value;});
}
const RX_ERA={1895:'первые гонки городов',1900:'Кубок Гордона Беннетта',1905:'Гран-при и Вандербильт',1910:'Индианаполис и Тарга',1919:'после войны',1924:'наддув и Монца'};
function openRacerNew(pathChips){const cust=draft.racer==='custom';
  const list=Object.entries(RACERS).map(([k,P])=>{const d=DRIVERS.find(x=>x.id===k);return `<button class="pion ${draft.racer===k?'on':''}" data-act="rpick" data-v="${k}">${(()=>{const im=d&&IMG[DRIVER_WIKI[d.id]];return im?`<div class="ph-oval"><img src="${im.src}" alt="" referrerpolicy="no-referrer"></div>`:'<div class="ph-oval rx-anon"><span>🏁</span></div>';})()}<div><h3>${esc(P.n)}</h3><div class="yrs">${P.y?`дебют в ${P.y} году · ${esc(COUNTRIES[P.c].name)}`:'любая страна и год дебюта'}</div><p>${esc(P.bio)}</p>${P.found?`<div class="bon"><span class="p">в истории: ${esc(P.brand)}, ${P.found}</span><span class="p">мастерство до ${Math.round(P.pk*100)}</span></div>`:''}</div></button>`;}).join('');
  openSheet(`<div class="row"><h2>Новая игра</h2>${G?X:'<button class="iconbtn" data-act="toMenu" aria-label="В главное меню">×</button>'}</div>${pathChips}
    <p class="small muted" style="margin-top:8px">Путь гонщика: купите первую машину, выигрывайте призы, подписывайте контракты со спонсорами и заводскими командами, сравнивайте себя с лучшими гонщиками эпохи. Накопите капитал — и основайте свою марку, как Лянча в 1906 году или Шевроле в 1911-м: дальше игра пойдёт в режиме магната.</p>
    <div class="label" style="margin-top:14px">Кто вы?</div><div class="stack" style="margin-top:8px;gap:8px">${list}</div>
    ${cust?`<label class="label" for="rname" style="display:block;margin-top:16px">Имя гонщика</label><input type="text" id="rname" value="${esc(draft.rname)}" maxlength="28" style="margin-top:6px" placeholder="Например, Пьер Дюваль">
      <div class="label" style="margin-top:14px">Страна</div><div class="country" style="margin-top:6px">${Object.entries(COUNTRIES).map(([k,c])=>`<button class="chip ${draft.rc===k?'on':''}" data-act="rcountry" data-v="${k}">${c.name}<small>${c.city} · гоночный цвет — ${c.raceName}</small></button>`).join('')}</div>
      <div class="label" style="margin-top:14px">Год дебюта</div><div class="chips" style="margin-top:6px">${Object.keys(RX_ERA).map(y=>`<button class="chip ${+draft.ry===+y?'on':''}" data-act="ryear" data-v="${y}">${y}<small>${RX_ERA[y]}</small></button>`).join('')}</div>`:''}
    <div class="label" style="margin-top:14px">Сложность</div>
    <div class="country" style="margin-top:6px">${Object.entries(DIFFS).map(([k,d])=>`<button class="chip ${draft.diff===k?'on':''}" data-act="diff" data-v="${k}">${d.name}<small>${k==='kids'?'Соперники слабее, аварии мягче':d.desc}</small></button>`).join('')}</div>
    <button class="btn primary block" style="margin-top:16px" data-act="startracer">Выйти на старт</button>`);
  const rn=document.getElementById('rname');if(rn)rn.addEventListener('input',e=>{draft.rname=e.target.value;});}
function openMenuSheet(){
  openSheet(`<div class="row"><h2>Меню</h2>${X}</div>
    <p class="small muted" style="margin-top:4px">«${esc(G.company)}» · ${dstr(G)} · игра сохраняется сама каждый месяц.</p>
    <div class="stack" style="margin-top:12px">
      <button class="btn block" data-act="saveOpen">Сохранить в слот</button>
      <button class="btn block" data-act="loadOpen">Загрузить</button>
      <button class="btn block" data-act="legacyInfo">Цель и наследие</button>
      <button class="btn block" data-act="help">Как играть</button>
      <button class="btn block" data-act="settings">Звук, графика и управление</button>
      <button class="btn block" data-act="fame">Зал славы</button>
      <button class="btn block" data-act="toMenu">Выйти в главное меню</button></div>`);
}
function slotLabel(k){const i=slotInfo(k);return i?`${esc(i.company)} · ${MONTHS[i.m]} ${i.y}${i.over?' · окончена':''}<small>${COUNTRIES[i.country]?COUNTRIES[i.country].name:''} · ${money(i.cash)}${i.at?' · '+new Date(i.at).toLocaleDateString('ru-RU'):''}</small>`:'Пусто<small>—</small>';}
function openSlots(mode){
  const rows=SLOTS.filter(k=>mode==='load'||k!=='auto').map(k=>{const i=slotInfo(k);return `<button class="chip" style="width:100%;margin-top:6px" data-act="${mode==='save'?'saveSlot':'loadSlot'}" data-k="${k}" ${mode==='load'&&!i?'disabled':''}><b>${k==='auto'?'Автосохранение':'Слот '+k}</b> — ${slotLabel(k)}</button>`;}).join('');
  openSheet(`<div class="row"><h2>${mode==='save'?'Сохранить игру':'Загрузить игру'}</h2>${G?X:'<button class="iconbtn" data-act="toMenu" aria-label="Назад">×</button>'}</div><div style="margin-top:8px">${rows}</div>
    ${mode==='save'?'<p class="small muted" style="margin-top:10px">Автосохранение пишется каждый месяц само. Слоты 1–3 — ваши точки возврата.</p>':''}`);
}
function openSettings(){
  openSheet(`<div class="row"><h2>Настройки</h2>${X}</div>
    <div class="label" style="margin-top:12px">Звук</div><div class="btns" style="margin-top:6px"><button class="btn ${AU.on.music?'primary':''}" data-act="audio" data-k="music">Музыка: ${AU.on.music?'вкл':'выкл'}</button><button class="btn ${AU.on.sfx?'primary':''}" data-act="audio" data-k="sfx">Звуки: ${AU.on.sfx?'вкл':'выкл'}</button><button class="btn ${AU.on.race?'primary':''}" data-act="audio" data-k="race">Музыка в гонке: ${AU.on.race?'вкл':'выкл'}</button><button class="btn" data-act="plMode">Плейлист: ${AU.on.mode==='all'?'все годы':'эпоха'}</button></div>
    ${G?`<div class="label" style="margin-top:14px">Помощник управляющего</div><p class="small muted" style="margin-top:4px">Каждый месяц сам ставит выгодные цены, открывает дилеров, строит цеха и склад${DIF().simple?'':', выбирает проекты КБ'} и берёт кредит, если касса в минусе. Машины${DIF().simple?' и проекты КБ':''} придумываете вы.</p><div class="btns" style="margin-top:6px"><button class="btn ${helperOn(G)?'primary':''}" data-act="helperToggle">Помощник: ${helperOn(G)?'вкл':'выкл'}</button></div>`:''}
    <div class="label" style="margin-top:14px">Руль в гонке</div><div class="btns" style="margin-top:6px">${[['keys','Кнопки ◀ ▶'],['tilt','Наклон телефона']].map(([k,l])=>`<button class="btn ${steerMode()===k?'primary':''}" data-act="ctlTilt" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="label" style="margin-top:14px">Графика гонок</div><div class="btns" style="margin-top:6px">${[['3d','Объёмная (3D)'],['2d','Простая — для слабых телефонов']].map(([k,l])=>`<button class="btn ${(g3Can()?gfxMode():'2d')===k?'primary':''}" data-act="gfx" data-v="${k}" ${k==='3d'&&!g3Can()?'disabled':''}>${l}</button>`).join('')}</div>${g3Can()?'':'<p class="small muted" style="margin-top:4px">На этом устройстве объёмная графика недоступна — гонки рисуются по-простому.</p>'}${g3Can()&&gfxMode()==='3d'?`<div class="label" style="margin-top:12px">Качество картинки</div><div class="btns" style="margin-top:6px">${[['eco','Экономно'],['hd','HD'],['cine','Кино']].map(([k,l])=>`<button class="btn ${gfxQ()===k?'primary':''}" data-act="gq" data-v="${k}">${l}</button>`).join('')}</div>
    <p class="small muted" style="margin-top:4px">${{eco:'Экономно — для слабых телефонов и долгой батареи: меньше травы и деревьев, текстуры попроще.',hd:'HD — чёткая картинка с фото-текстурами, тенями и травой. Подходит большинству телефонов.',cine:'Кино — максимум: больше деревьев и травы, дальше видно, блики солнца. Для мощных телефонов (Galaxy Fold 7, Xiaomi 13T и новее).'}[gfxQ()]} Если кадры начнут запаздывать, игра сама немного снизит чёткость.</p>
    <div class="btns" style="margin-top:6px"><button class="btn ${AU.on.post===false?'':'primary'}" data-act="gfxPost">Кино-обработка: ${AU.on.post===false?'выкл':'вкл'}</button><button class="btn ${AU.on.demo===false?'':'primary'}" data-act="demoToggle">Гонка на заставке: ${AU.on.demo===false?'выкл':'вкл'}</button><button class="btn ${AU.on.plantImg?'':'primary'}" data-act="plantLive">Завод вживую: ${AU.on.plantImg?'выкл':'вкл'}</button></div><p class="small muted" style="margin-top:4px">Кино-обработка — свечение, «плёночный» цвет, виньетка и смаз на скорости. Гонка на заставке — за главным меню едет настоящая гонка эпохи. Завод вживую — объёмная сцена в разделе «Завод»: дым из труб, машины из цеха, люди и поезд; выключите — будет картинка, батарея целее.</p>`:''}
    <div class="hr"></div><h3>Музыка</h3><p class="small muted" style="margin-top:4px">Настоящие записи эпохи из общественного достояния (Wikimedia Commons) и восемь своих пьес игры в оркестровке — марш, регтайм, вальс, танго, кекуок, фокстрот, джаз и чарльстон. Свои пьесы вшиты в игру и звучат без интернета.${AU.nowPlaying?` Сейчас: <a class="credit" style="display:inline;padding:0" href="${AU.nowPlaying.page}" target="_blank" rel="noopener">${esc(AU.nowPlaying.title)}</a>`:''}</p>
    <div class="hr"></div><h3>Фотографии</h3><p class="small muted" style="margin-top:4px">Исторические фото — Википедия и Wikimedia Commons: в основном общественное достояние, музейные снимки машин — по свободным лицензиям CC BY и CC BY-SA. Авторы и лицензии — на странице каждого файла.</p>
    <div class="small" style="margin-top:6px;columns:2;column-gap:12px">${Object.entries(IMG).filter((e,i,a)=>a.findIndex(x=>x[1].file===e[1].file)===i).map(([t,im])=>`<a class="credit" style="padding:2px 0" href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(im.file)}" target="_blank" rel="noopener">${esc(t.startsWith('x:')?String(im.file).replace(/_/g,' ').replace(/\.[a-z0-9]+$/i,''):t)}</a>`).join('')||'<span class="muted">пока не загружены</span>'}</div>`);
}
function openHelp(){
  openSheet(`<div class="row"><h2>Как играть</h2>${X}</div>
  <div class="stack small" style="margin-top:12px">
    <p>Один ход — один месяц, с января 1895 до конца 1929 года. ▶ включает автоигру, она останавливается на событиях. <b>Советник</b> на вкладке «Завод» подсказывает самое важное — у каждого совета есть кнопка. <b>Помощник управляющего</b> (включается в «Звук, графика и управление») сам ставит цены, открывает дилеров, строит цеха и склад и выбирает проекты КБ.</p>
    <p><b>Модели.</b> Машина собирается из деталей: двигатель, коробка передач, рама с подвеской, колёса и шины, тормоза, кузов, оснащение. Покупатели сравнивают её с типичной машиной соперников своего класса — по мощности, надёжности, комфорту, простоте вождения, тормозам, экономичности и вместимости. Народному классу важнее экономичность и надёжность, люксу — комфорт и мощность. Дешёвые решения вроде планетарной коробки и ванадиевой рамы Ford T часто выгоднее самых дорогих деталей. Кнопка «Подобрать детали повыгоднее» предложит конструкцию сама.</p>
    <p><b>Рынок.</b> Покупатели — живые семьи с разными доходами. Семья берёт машину, если та ей по карману и хороша за свои деньги, — или ждёт. Дешёвая и хорошая машина открывает рынок тем, кто раньше не мог купить. Фургоны и грузовики берут фирмы и ведомства — каждая для своих перевозок: фургон развозит товар по району, полуторатонка возит по городу, трёхтонка — между городами. Фирма выбирает машину, на которой дешевле тонно-километр: цена, ремонт и простои, бензин, шофёр. Почта, пожарные, таксомоторные парки и армия объявляют заказы — выиграть их помогают цена и надёжность.</p>
    <p><b>Конкуренты.</b> Реальные марки эпохи с их продажами. Если заберёте у них много покупателей, они ответят: новыми моделями, ценами и рекламой. С годами соперники дорабатывают свои машины — без КБ ваша модель устареет.</p>
    <p><b>Производство.</b> План «авто» делает столько, сколько купят, и не больше, чем поместится на складе. Всё лишнее уходит перекупщикам за полцены. Мощность — цеха и смены; выработку поднимают станки, электрификация, взаимозаменяемые детали, конвейер и зарплата.</p>
    <p><b>Выставки.</b> Настоящие автосалоны эпохи: Париж (с 1898 года, первым был сад Тюильри), Берлин (1897), Лондон (1896), Нью-Йорк (1900), Турин (1900) и другие, а в 1900 году — Всемирная выставка с медалями. За месяц приходит приглашение: стенд стоит денег, зато приносит заказы, интерес покупателей и газет, а за границей — первых дилеров. Список ближайших — на вкладке «Рынок».</p>
    <p><b>Дилеры.</b> Продают машины за ${Math.round(dMargin(G)*100)}% цены. Где нет вашего дилера, там о вас не знают. На карточке модели видно, почему продали меньше, чем хотели купить: не хватило машин или дилеры не успели.</p>
    <p><b>Мотоциклы.</b> Такая же техника марки, как машины: поставьте оборудование для мотоциклов («Завод» → «Технологии завода») — и в тех же цехах, теми же рабочими пойдут мотоциклы; в «Моделях», «КБ» и на «Рынке» они вместе с машинами (класс «Мотоцикл» или «С коляской»). Мотоцикл впятеро-вшестеро дешевле машины и спорит за тех же семьи: дешёвый автомобиль отбирает его покупателей (в Америке к 1920-м), а в Европе мотоцикл растёт все двадцатые. До 1920 года мотоциклы продают и велосипедные лавки. Можно начать игру мотомастерской (январь 1899 года) и через пять–восемь лет построить первый автомобиль. Что КБ освоило в одной линейке, можно перенести в другую: дешевле и быстрее нового исследования, но перенос может не удаться.</p>
    <p><b>Риск новинок.</b> Деталь раньше истории или только что появившаяся у поставщиков — передний край: прототип может потребовать доработки, серия — выйти не по ТЗ (мотор слабее, рама слабее, ресурс ниже), первые годы — «детские болезни». Обкатанная деталь даёт ровно то, что обещано. Доводка в КБ исправляет отклонения сразу.</p>
    <p><b>КБ.</b> Восемь уровней: чем больше бюро, тем больше проектов одновременно. Улучшает детали (★) и строит прототипы будущих деталей; с 3-го уровня открывает технологии завода раньше истории — это «первенства». Проекты разложены по трём папкам: улучшения (детали ваших машин и современные), новые (прототипы и машины конкурентов на изучение) и устаревшие.</p>
    <p><b>Гонки.</b> Сезоны и чемпионаты своего времени. Команда до трёх машин: одну можно вести самому — в объёмной 3D-графике (на слабых телефонах можно включить простую). Характеристики машины считаются из деталей: вес, мощность, коробка, тормоза, шины. В гонке справа вверху видно ближайший поворот и скорость, на которой его можно пройти, слева внизу — сколько сцепления шин уже занято; «?» — как ехать. Гоночный отдел (шесть уровней) даёт заводской кузов, надёжность, мощность и быстрые пит-стопы.</p>
    <p><b>Путь гонщика.</b> «Новая игра» → «Начать гонщиком»: исторический пилот (Лянча, Шевроле, Рикенбакер, Мазерати, Феррари) или свой — страна и год дебюта. Купите подержанную гоночную машину, устройтесь испытателем на завод, выигрывайте призы и славу: заводы позовут в команду (жалованье, доля призов, премии), шинные фирмы платят за победы. «Рейтинг» сравнивает вас с лучшими гонщиками 1895–1929 годов. Накопив капитал, основайте марку — с нуля, с партнёром или купив слабую марку, — и игра продолжится партией магната.</p>
    <p><b>Вызовы.</b> Соперники бросают вызов в газетах, а на доске вызовов («Империя») их можно брать самим: пари на гонку, матч-гонка один на один (ипподромы, Бруклендс, Индианаполис, дощатые треки), спор о скорости на мерной миле или круге, продажи класса за квартал, полгода или год — дома и на экспорт (если силы неравны — с форой), пробег на надёжность серийных машин. Выигрыш — ставка, слава и грамота, проигрыш или неявка — ставка и насмешки прессы.</p>
    <p><b>Цель.</b> Величайшая автоимперия эпохи: в 1930 году компанию сравнят с реальными по шести направлениям наследия. Долг свыше ${money(DIF().debt*cpi(G))} — банкротство. Сложность: ${DIF().name}.</p></div>`);
}
function openLegacyInfo(){
  if(isRacer(G)){const X0=G.racer,tb=dcarTable(G),pl=tb.findIndex(r=>r.me)+1;openSheet(`<div class="row"><h2>Цель гонщика</h2>${X}</div>
    <p class="small" style="margin-top:8px">Войти в двадцатку лучших гонщиков эпохи и, если захотите, основать свою марку. Очки — как в личном зачёте прессы: первые шесть мест получают 8, 6, 4, 3, 2 и 1 очко, в малых гонках — вдвое меньше. Сейчас вы ${pl?pl+'-й':'вне рейтинга'} из ${tb.length}.</p>
    <table class="pl ctab" style="margin-top:10px">${tb.slice(0,10).map((r,i)=>`<tr class="${r.me?'you':''}"><td class="n">${i+1}</td><td style="padding-left:6px">${esc(r.me?X0.name:r.n)}</td><td class="n">${r.w}</td><td class="n">${fmtPts('gp',r.pts)}</td></tr>`).join('')}</table>`);return;}
  const t=legacyTable(G);
  openSheet(`<div class="row"><h2>Цель и наследие</h2>${X}</div>
    <p class="small" style="margin-top:8px">В 1930 году «${esc(G.company)}» встанет в один ряд с реальными компаниями эпохи. Очки наследия:</p>
    <div class="stack small" style="margin-top:8px">
      <p><b>Масштаб</b> — лучший год по выпуску и всё, что выпущено за эпоху. Ford в 1923 году — 2 млн машин, за эпоху — 21 млн.</p>
      <p><b>Рынок</b> — доля дома, удержанная годами (15 лет с долей 100% — максимум), и заметные доли за границей. FIAT держал около 80% Италии.</p>
      <p><b>Инновации</b> — первенства (раньше, чем в истории; деталь — когда машин с ней продано хотя бы 300), внедрённые технологии и «Король технологий».</p>
      <p><b>Спорт</b> — победы в гонках и титулы самой марки. Bugatti Type 35 выиграла сотни гонок. Личные победы основателя-гонщика за чужие заводы — его слава, не марки.</p>
      <p><b>Капитал</b> — стоимость компании. General Motors в 1929 году — около $4 млрд.</p>
      <p><b>Бренд</b> — репутация, которой нужно лет двадцать (молодая марка получает часть), легендарные модели (миллион проданных или десять лет на конвейере) и «короли» классов.</p></div>
    <p class="small muted" style="margin-top:8px">Как счёт в «Цивилизации»: очки копятся всю эпоху, и рекорд реальных компаний 1929 года в первые годы недостижим.</p>
    <table class="pl" style="margin-top:12px"><tr><th></th><th>Компания</th><th class="n">Очки</th></tr>${t.rows.map((r,i)=>`<tr class="${r.you?'you':''}"><td>${i+1}.</td><td>${esc(r.n)}${r.you?' — вы':''}</td><td class="n">${Math.round(r.L.total)}</td></tr>`).join('')}</table>
    <p class="small muted" style="margin-top:8px">Выпуск реальных компаний — по отраслевым сводкам 1929 года; накопленный выпуск и стоимость — оценки.</p>`);
}
function openFinal(){
  const s=G,t=legacyTable(s),[title,sub]=legacyTitle(t);
  const rows=t.rows.map((r,i)=>`<tr class="${r.you?'you':''}"><td>${i+1}.</td><td>${esc(r.n)}<small>${r.you?'ваша компания':esc(r.note||'')}</small></td><td class="n">${fmtN(r.p29)}</td><td class="n">${Math.round(r.L.total)}</td></tr>`).join('');
  openSheet(`<span class="label">Итоги эпохи · 1895–${s.y-1}</span><h2 style="margin-top:4px">${esc(title)}</h2><p class="small" style="margin-top:6px">${esc(sub)}</p>
    <div class="kpis" style="margin-top:10px"><div class="kpi"><span class="label">Место</span><b>${t.place}/${t.rows.length}</b></div><div class="kpi"><span class="label">Наследие</span><b>${Math.round(t.me.total)}</b></div><div class="kpi"><span class="label">Продано</span><b>${fmtN(totalSold(s))}</b></div></div>
    <div style="margin-top:10px">${Object.keys(LEG_NAMES).map(k=>`<div class="leg-row"><span>${LEG_NAMES[k]}</span><div class="bar"><i style="width:${Math.min(100,t.me[k]/LEG_MAX[k]*100)}%;background:var(--brass)"></i></div><b class="num">${Math.round(t.me[k])}</b></div>`).join('')}</div>
    <table class="pl final" style="margin-top:12px"><tr><th></th><th>Компания</th><th class="n">Лучший год</th><th class="n">Очки</th></tr>${rows}</table>
    ${s.pastCos&&s.pastCos.length?`<p class="small muted" style="margin-top:8px">Прежние компании: ${s.pastCos.map(p=>`«${esc(p.n)}» (${p.y0}–${p.y1}, продана за ${money(p.price)}, ${fmtN(p.leg)} очков)`).join(', ')} — половина их очков в зачёте (+${fmtN(rbLegacy(s))}).</p>`:''}
    <div class="stack" style="margin-top:14px">${s.soldTo&&s.over&&s.y<1930?`<button class="btn primary block" data-act="rbOpen">Купить другую марку на ${money(s.soldTo.mine)}</button>`:''}<button class="btn ${s.soldTo&&s.over?'':'primary '}block" data-act="newgame">Новая игра</button><button class="btn block" data-act="fame">Зал славы</button><button class="btn block" data-act="toMenu">Главное меню</button></div>`);
}
function openFame(){
  const L=fameList();
  openSheet(`<div class="row"><h2>Зал славы</h2>${G?X:'<button class="iconbtn" data-act="toMenu" aria-label="Назад">×</button>'}</div>
    ${L.length?`<table class="pl" style="margin-top:10px"><tr><th></th><th>Компания</th><th class="n">Очки</th></tr>${L.map((e,i)=>`<tr><td>${i+1}.</td><td>${esc(e.company)}<small>${esc(e.title)} · ${e.place}-е место · ${COUNTRIES[e.country]?COUNTRIES[e.country].name:''} · ${DIFFS[e.diff]?DIFFS[e.diff].name:''}${e.bankrupt?' · банкротство':''}</small></td><td class="n">${e.score}</td></tr>`).join('')}</table>`:'<p class="small muted" style="margin-top:10px">Здесь появятся ваши завершённые партии — с местом среди реальных компаний эпохи.</p>'}`);
}

// Рассказ об основателе: открывается нажатием на портрет
const FOUNDER_STORY={
  ford:['Сын фермера из Мичигана, механик по призванию. Ночами после смены на электростанции Эдисона собирал в сарае свой «квадрицикл» (1896) — и выломал стену, чтобы выкатить его наружу.','Две первые компании Форда прогорели. Третья, Ford Motor Company (1903), выпустила Model T — простую, прочную и дешёвую. С движущимся конвейером (1913) сборка машины сократилась с 12 часов до полутора, а цена упала с $850 до $260.','В 1914 году Форд поднял зарплату до «пяти долларов в день» — вдвое выше рынка: текучесть кадров исчезла, а рабочие сами смогли купить свои машины. К 1927 году продано 15 миллионов Model T.'],
  olds:['Рэнсом Олдс вырос в мастерской отца, делавшей паровые двигатели. Первую машину построил в 1896 году.','Oldsmobile Curved Dash (1901) с изогнутым передком стоил $650 и собирался на поточной линии — это был первый массовый автомобиль Америки: в 1904 году продано около 5 000 машин.','Поссорившись с инвесторами, Олдс ушёл и основал REO. Его имя осталось в марке Oldsmobile, которая прожила до 2004 года.'],
  benz:['Карл Бенц рос без отца — тот, машинист паровоза, погиб. Мать отдала последнее, чтобы сын учился на инженера.','29 января 1886 года он получил патент на «моторваген» с бензиновым двигателем — день рождения автомобиля. Первую дальнюю поездку совершила его жена Берта: в 1888 году она тайком от мужа проехала с сыновьями 106 км до Пфорцхайма, чиня машину шпилькой и подвязкой.','Benz & Cie. к 1900 году была крупнейшим автозаводом мира. В 1926 году она объединилась с Daimler — так родился Mercedes-Benz.'],
  maybach:['Вильгельм Майбах рано осиротел и вырос в приюте, где его талант заметил Готлиб Даймлер. Всю жизнь они работали вместе.','Майбах придумал распылительный карбюратор, сотовый радиатор и мотор «Феникс». В 1901 году по заказу Эмиля Еллинека построил машину Mercedes 35 hp — низкую, длинную и мощную. Её называют первым современным автомобилем.','Позже Майбах строил моторы для дирижаблей Цеппелина, а его сын Карл — роскошные машины Maybach.'],
  renault:['Луи Рено в 21 год собрал в садовом сарае под Парижем «воатюретку» и в канун Рождества 1898 года поспорил с друзьями, что она въедет на крутую улицу Лепик на Монмартре. Выиграл спор — и 12 заказов.','Он запатентовал прямую передачу и вместе с братьями Марселем и Фернаном основал Renault Frères. Братья сами гоняли: Марсель выиграл Париж — Вену (1902) и погиб в гонке Париж — Мадрид (1903).','В 1906 году гонщик Рено Ференц Сис выиграл первое Гран-при. В 1914 году 600 такси Renault перевезли солдат на Марну.'],
  peugeot:['Семья Пежо с XIX века делала всё из стали: пилы, кофемолки, корсетные пластины, велосипеды. Арман Пежо учился в Англии и увидел будущее в моторах.','Первая машина Пежо (1889) была паровой, потом он поставил мотор Daimler. Peugeot участвовал в гонке Париж — Руан 1894 года и в Париж — Бордо — Париж 1895 года.','В 1896 году Арман основал отдельную «Общество автомобилей Пежо». Позже гоночные Peugeot с двумя распредвалами выигрывали Гран-при и Индианаполис.'],
  lanchester:['Фредерик Ланчестер — инженер-теоретик, один из первых, кто научно рассчитывал автомобиль, а позже и крыло самолёта.','Его машина 1895 года стала одной из первых британских бензиновых. Ланчестер придумал дисковые тормоза, червячную передачу и сбалансированный мотор.','Братья Ланчестер строили машины высочайшего качества, но медленно и дорого — фирма так и осталась маленькой.'],
  bugatti:['Этторе Бугатти — сын миланского мебельщика-художника. В 17 лет построил моторный трицикл, в 20 — свою первую машину.','Свой завод открыл в Мольсайме в 1909 году. Машины Bugatti были лёгкими, красивыми и быстрыми, а его подковообразный радиатор узнают до сих пор.','Type 35 (1924) выиграла больше тысячи гонок, в том числе Тарга Флорио пять раз подряд.'],
  ferrari:['Энцо Феррари мечтал стать оперным певцом или журналистом, но в 1919 году стал гонщиком, а потом — пилотом Alfa Romeo.','В 1929 году основал в Модене «Скудерию Феррари» — команду, которая выставляла машины Alfa Romeo. Гарцующий конь на эмблеме — подарок семьи лётчика Франческо Баракки.','Свои машины Ferrari начал строить только после Второй мировой войны. В игре — альтернативная история.'],
  agnelli:['Джованни Аньелли — кавалерийский офицер из пьемонтской семьи землевладельцев. В 1899 году вместе с друзьями основал в Турине компанию FIAT.','Он быстро понял силу массового выпуска: съездил к Форду и построил завод Линготто (1923) с испытательным треком на крыше.','FIAT стал крупнейшей компанией Италии: около 80% рынка страны в 1920-х.'],
  custom:['Вы — безвестный механик или предприниматель с мечтой. У вас нет знаменитой фамилии, связей и чужих побед.','Зато вы не связаны ничьей историей: все решения — ваши.']};
function openFounder(){const P=PIONEERS[G.pioneer],L=FOUNDER_STORY[G.pioneer]||[];
  openSheet(`<div class="row"><h2>${esc(P.name)}</h2>${X}</div><p class="small muted">${P.yrs?P.yrs+' · ':''}${COUNTRIES[P.c].name} · «${esc(P.co)}»</p>
    <div style="width:140px;margin:12px auto 0">${portraitHTML(G.pioneer)}</div>
    <div class="stack small" style="margin-top:12px">${L.map(t=>`<p>${esc(t)}</p>`).join('')}</div>
    <div class="bon" style="margin-top:12px">${P.plus.map(x=>`<span class="p">${x}</span>`).join('')}${P.minus.map(x=>`<span class="m">${x}</span>`).join('')}</div>
    ${P.wiki?`<a class="credit" style="margin-top:10px;display:inline-block" href="https://en.wikipedia.org/wiki/${encodeURIComponent(P.wiki)}" target="_blank" rel="noopener">Подробнее в Википедии</a>`:''}`);}
