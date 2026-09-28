/* ================= RENDER ================= */
function spark(data,color='var(--brass)'){
  const w=320,h=64;if(data.length<2)return '<div class="empty-chart">График появится через пару месяцев</div>';
  const min=Math.min(0,...data),max=Math.max(1,...data),span=max-min||1,x=i=>i*(w/(data.length-1)),y=v=>h-3-(v-min)/span*(h-6);
  const pts=data.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ');
  const zero=min<0?`<line class="zero" x1="0" x2="${w}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>`:'';
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="0,${y(min)} ${pts} ${w},${y(min)}" fill="${color}" fill-opacity=".14"/>${zero}<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}
function qbar(r,label){const [l,tone]=qLabel(r);return `<div class="row small" style="margin-top:10px"><span class="muted">${label||'Качество по меркам эпохи'}</span><span class="${tone}">${l} · <span class="num">${Math.round(r*100)}%</span></span></div><div class="bar" style="margin-top:6px"><i style="width:${Math.min(100,r*100)}%;background:var(--${tone})"></i></div>`;}
const pct=(x,d=0)=>(x*100).toFixed(d).replace('.',',')+'%';
function techEffects(lv){const e=[];if(lv.hrs)e.push(`−${Math.round((1-lv.hrs)*100)}% часов на машину`);if(lv.cap)e.push(`+${Math.round((lv.cap-1)*100)}% мощности`);if(lv.mat)e.push(`деталь дешевле на ${Math.round((1-lv.mat)*100)}%`);if(lv.def)e.push(`брак ${pct(lv.def,1)}`);if(lv.dem)e.push(`спрос +${Math.round(lv.dem*100)}%`);return e.join(' · ');}
function unitCost(md,s){s=s||G;return matCost(md,s)+hoursPerCar(md,s)/hoursPerWorker(s)*wageNow(s);}
function vPlant(){
  const s=G,L=s.last,cap=capEff(s),act=s.models.filter(m=>m.status==='prod');
  const util=L?Math.min(1,L.made/Math.max(1,cap)):0,hpw=hoursPerWorker(s);
  const avgH=act.length?act.reduce((a,m)=>a+hoursPerCar(m,s)*(m.lastMade||1),0)/Math.max(1,act.reduce((a,m)=>a+(m.lastMade||1),0)):0;
  const building=(s.capBuild||[]).reduce((a,b)=>a+b.units,0),cu=capUnitCost(s);
  const addQ=Math.max(2,Math.round(s.cap*0.25)),addH=Math.max(4,s.cap),ml=maxLoan(s),step=Math.max(1000,Math.round(ml/10/1000)*1000);
  const pl=L?`<table class="pl"><tr><td>Продажи (без скидки дилерам ${Math.round(DEALER_MARGIN*100)}%)</td><td class="n">${money(L.rev)}</td></tr>${L.mil?`<tr><td>Военный заказ (${fmtN(L.milN)} шт.)</td><td class="n">${money(L.mil)}</td></tr>`:''}
    <tr><td>Детали и материалы</td><td class="n">−${money(L.mat)}</td></tr><tr><td>Зарплата</td><td class="n">−${money(L.wage)}</td></tr><tr><td>Содержание завода</td><td class="n">−${money(L.ovh)}</td></tr>
    ${L.dlr?`<tr><td>Дилерская сеть</td><td class="n">−${money(L.dlr)}</td></tr>`:''}<tr><td>Реклама</td><td class="n">−${money(L.ad)}</td></tr>${L.rd?`<tr><td>Конструкторское бюро</td><td class="n">−${money(L.rd)}</td></tr>`:''}${L.drv?`<tr><td>Гонщики</td><td class="n">−${money(L.drv)}</td></tr>`:''}${L.team?`<tr><td>Гоночная команда</td><td class="n">−${money(L.team)}</td></tr>`:''}
    ${L.sto>1?`<tr><td>Склад</td><td class="n">−${money(L.sto)}</td></tr>`:''}${L.war>1?`<tr><td>Гарантийный ремонт</td><td class="n">−${money(L.war)}</td></tr>`:''}${L.fin?`<tr><td>Кредит покупателям</td><td class="n">−${money(L.fin)}</td></tr>`:''}${L.tool?`<tr><td>Оснастка новых моделей</td><td class="n">−${money(L.tool)}</td></tr>`:''}${L.hire>1?`<tr><td>Найм и обучение</td><td class="n">−${money(L.hire)}</td></tr>`:''}
    ${L.tax?`<tr><td>Налог на прибыль</td><td class="n">−${money(L.tax)}</td></tr>`:''}${L.int?`<tr><td>Проценты по кредиту</td><td class="n">−${money(L.int)}</td></tr>`:''}<tr class="tot"><td>Итог за ${L.label}</td><td class="n ${L.profit>=0?'good':'bad'}">${money(L.profit)}</td></tr></table>`
    :'<p class="small muted">Отчёт появится после первого месяца. Нажмите «Следующий месяц» внизу.</p>';
  const techs=TECH_ORDER.map(k=>{const d=TECH[k],l=techLv(s,k),nx=techNext(s,k),open=techOpen(s,k),cost=techCost(s,k),bld=s.techBuild&&s.techBuild.k===k;
    const cur=l?d.lv[l-1].name:'нет';let status='';
    if(bld)status=`<span class="pill warn">Внедряется · ${s.techBuild.left} мес.</span>`;
    else if(!nx)status='<span class="pill good">Всё внедрено</span>';
    else if(open)status=`<button class="btn sm ${s.cash>=cost&&!s.techBuild?'primary':''}" data-act="tech" data-k="${k}" ${s.cash<cost||s.techBuild?'disabled':''}>${money(cost)}</button>`;
    else{const needT=nx.need?Object.keys(nx.need).filter(r=>techLv(s,r)<nx.need[r]).map(r=>TECH[r].name):[];status=`<span class="pill muted">${needT.length?'Нужно: '+needT.join(', '):'С '+(nx.y-techEarly(s))+' г.'}</span>`;}
    return `<div class="tech-row"><div class="row"><div><h3>${d.name}${d.max>1?` <span class="muted small num">${l}/${d.max}</span>`:''}</h3><p class="small muted">${l?'Сейчас: '+cur:d.desc}</p></div>${status}</div>
      ${nx?`<p class="small" style="margin-top:4px">${bld?'Внедряем':'Дальше'}: <b>${nx.name}</b> — ${techEffects(nx)}${nx.hist?` <span class="muted">· в истории: ${nx.hist[1]}, ${nx.hist[0]}</span>`:''}</p>`:''}</div>`;}).join('');
  const P=PIONEERS[s.pioneer],wp=s.wagePol||'market';
  return `<div class="scene">${factorySVG(s)}</div>
  <div class="kpis"><div class="kpi"><span class="label">Прибыль</span><b class="${L&&L.profit<0?'bad':''}">${L?money(L.profit):'—'}</b></div><div class="kpi"><span class="label">Продано</span><b>${L?fmtN(L.sold)+' шт.':'—'}</b></div><div class="kpi"><span class="label">Репутация</span><b>${Math.round(s.rep)}<span class="muted small">/100</span></b></div></div>
  ${s.pioneer!=='custom'?`<section class="card" style="display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:center"><div style="width:64px">${portraitHTML(s.pioneer)}</div><div><h3>${P.name}</h3><div class="bon">${P.plus.map(x=>`<span class="p">${x}</span>`).join('')}${P.minus.map(x=>`<span class="m">${x}</span>`).join('')}</div></div></section>`:''}
  <section class="card"><div class="row"><span class="label">Касса по месяцам</span><span class="small muted num">${money(s.cash)}</span></div>${spark(s.hist.cash)}</section>
  <section class="card"><h2>Мощности</h2>
    <div class="row" style="margin-top:8px"><div><h3><span class="num">${fmtN(Math.round(cap))}</span> машин в месяц</h3><p class="small muted">${s.shifts>1?'Две смены':'Одна смена'} · простая машина в пересчёте${building?` · строится ещё ${fmtN(Math.round(building*techMul(s,'cap')*(s.shifts>1?1.85:1)))}`:''}</p></div><span class="num ${util>0.95?'warn':''}">${Math.round(util*100)}%</span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${util*100}%;background:var(--brass)"></i></div>
    <p class="small muted" style="margin-top:4px">Загрузка в прошлом месяце. Сложные модели занимают больше места на линии.</p>
    <div class="btns" style="margin-top:10px"><button class="btn" data-act="capAdd" data-n="${addQ}" ${s.cash<addQ*cu?'disabled':''}>+25% · ${money(addQ*cu)}</button><button class="btn" data-act="capAdd" data-n="${addH}" ${s.cash<addH*cu?'disabled':''}>Удвоить · ${money(addH*cu)}</button>${s.cap>3?`<button class="btn sm" data-act="capSell">Продать 20%</button>`:''}</div>
    <p class="small muted" style="margin-top:6px">Цех строится 2 месяца. Место под одну машину в месяц стоит ${money(cu)}; содержание — около 1% стоимости завода в месяц.</p>
    <div class="label" style="margin-top:12px">Смены</div><div class="chips"><button class="chip ${s.shifts>1?'':'on'}" data-act="shifts" data-v="1">Одна<small>обычная ставка</small></button><button class="chip ${s.shifts>1?'on':''}" data-act="shifts" data-v="2">Две<small>мощность ×1,85, зарплата +8%, содержание +10%</small></button></div></section>
  <section class="card"><h2>Рабочие</h2>
    <div class="row" style="margin-top:8px"><div><h3><span class="num">${fmtN(s.workers)}</span> рабочих</h3><p class="small muted">${money(wageNow(s))} в месяц на человека · ${Math.round(hpw)} ч в месяц</p></div>${s.staffAuto?'<span class="pill good">Штат по плану</span>':`<div class="step"><button data-act="workers" data-d="-1" aria-label="Сократить">−</button><span>${fmtN(s.workers)}</span><button data-act="workers" data-d="1" aria-label="Нанять">+</button></div>`}</div>
    <div class="row small" style="margin-top:8px"><span class="muted">На одну машину уходит</span><span class="num">${fmtN(Math.round(avgH))} человеко-часов</span></div>
    <div class="chips" style="margin-top:8px"><button class="chip ${s.staffAuto?'on':''}" data-act="staffAuto" data-v="1">Нанимать по плану выпуска<small>отдел кадров сам держит нужный штат</small></button><button class="chip ${s.staffAuto?'':'on'}" data-act="staffAuto" data-v="0">Вручную<small>шаг — 10% штата</small></button></div>
    <div class="label" style="margin-top:12px">Зарплата</div><div class="chips">${Object.entries(WAGE_POL).map(([k,w])=>`<button class="chip ${wp===k?'on':''}" data-act="wagePol" data-v="${k}" ${w.y&&s.y<w.y-techEarly(s)?'disabled':''}>${w.name}<small>×${String(w.k).replace('.',',')} ставки · выработка ${w.prod>=1?'+':'−'}${Math.round(Math.abs(w.prod-1)*100)}% · текучесть ${w.turn}${w.y&&s.y<w.y-techEarly(s)?' · с '+(w.y-techEarly(s))+' г.':''}</small></button>`).join('')}</div></section>
  <section class="card"><h2>Технологии завода</h2><p class="small muted" style="margin-top:2px">Внедряется одна технология за раз, 3 месяца. Сильное КБ открывает их раньше истории — это «первенства» в зачёт наследия.</p><div style="margin-top:6px">${techs}</div></section>
  <section class="card"><h2>Финансы</h2><div style="margin-top:10px">${pl}</div><div class="hr"></div>
    <div class="row"><div><h3>Кредит: <span class="num">${money(s.loan)}</span></h3><p class="small muted">0,5% в месяц · лимит ${money(ml)}</p></div><div class="btns"><button class="btn" data-act="loan" data-n="${step}" ${s.loan+step>ml?'disabled':''}>+${fmtN(step)}</button><button class="btn" data-act="repay" data-n="${step}" ${s.loan<1||s.cash<Math.min(step,s.loan)?'disabled':''}>Погасить</button></div></div>
    <div class="row small" style="margin-top:8px"><span class="muted">Стоимость компании</span><span class="num">${money(companyValue(s))}</span></div></section>`;
}
// Сколько завод выпустит в этом месяце при плане «авто»
function autoPlan(md){return Math.max(0,Math.round((md.fc||0)*1.04+(md.backlog||0)-((md.stock||0)-0.35*(md.fc||0))));}
const fmtD=x=>x>0&&x<10?(Math.round(x*10)/10).toString().replace('.',','):fmtN(x);
function planStep(md,sm){const auto=md.plan==='auto'||md.plan===undefined,n=auto?autoPlan(md):+md.plan,st=Math.max(1,Math.round(Math.max(n,md.fc||1)*0.1));
  return `<div class="step${sm?' sm':''}"><button data-act="plan" data-id="${md.id}" data-d="${-st}" aria-label="Выпускать меньше">−</button><span>${fmtN(n)}</span><button data-act="plan" data-id="${md.id}" data-d="${st}" aria-label="Выпускать больше">+</button></div>`;}
function stockWarn(md){return md.status==='prod'&&md.stock>Math.max(3,(md.fc||0)*3);}
function planCard(s){const act=s.models.filter(m=>m.status==='prod');if(!act.length)return '';
  const rows=act.map(md=>{const auto=md.plan==='auto'||md.plan===undefined,w=stockWarn(md);
    return `<div class="plan-row"><div class="row ctl"><div><h3>${esc(md.name)} <span class="pill ${auto?'good':'warn'}">${auto?'авто':'вручную'}</span></h3>
      <p class="small muted">спрос ≈ ${fmtD(md.fc||0)} · продано ${fmtN(md.lastSold||0)} · склад <b class="${w?'warn':''}">${fmtN(md.stock)}</b>${md.backlog>1?` · очередь ${fmtN(md.backlog)}`:''}</p></div>${planStep(md,1)}</div>
      ${w?`<p class="small warn" style="margin-top:4px">Машины копятся на складе и дешевеют: снизьте выпуск или цену.</p>`:''}
      ${auto?'':`<button class="btn sm" style="margin-top:6px" data-act="planAuto" data-id="${md.id}">Вернуть «авто»</button>`}</div>`;}).join('');
  return `<section class="card"><div class="row"><h2>План выпуска</h2><span class="label">машин в месяц</span></div>${rows}
    <p class="small muted" style="margin-top:8px">«Авто» — завод делает столько, сколько берут покупатели, с небольшим запасом. Кнопки − и + переключают модель на ваш план: лишнее ляжет на склад, нехватка — это очередь и потерянные покупатели.</p></section>`;}
function vModels(){
  const s=G,ord={prod:0,dev:1,off:2};
  const cards=s.models.slice().sort((a,b)=>ord[a.status]-ord[b.status]||b.id-a.id).map(md=>{
    const p=parts(md),r=modelR(md,s),g=segOf(md),uc=unitCost(md,s),ref=refPrice(md,s),net=md.price*(1-DEALER_MARGIN);
    const pill=md.status==='prod'?'<span class="pill good">В продаже</span>':md.status==='dev'?`<span class="pill warn">Разработка · ${md.devLeft} мес.</span>`:'<span class="pill muted">Снята</span>';
    const margin=net-uc,enter=md.fresh?' enter':'';md.fresh=0;
    let el='';if(md.status==='prod'){const d0=demandAt(md,s,md.price),dm=demandAt(md,s,md.price*0.9),dp=demandAt(md,s,md.price*1.1),b0=Math.max(0.01,d0);
      el=`<p class="small muted" style="margin-top:4px">Спрос сейчас ≈ <b class="num">${fmtD(d0)}</b> в месяц · цена −10% → <span class="good">${dm>=b0?'+':''}${Math.round((dm/b0-1)*100)}%</span> · +10% → <span class="bad">${Math.round((dp/b0-1)*100)}%</span></p>`;}
    const planAuto=md.plan==='auto'||md.plan===undefined;
    const ctl=md.status!=='off'?`<div class="row ctl" style="margin-top:12px"><div><span class="label">Цена</span><p class="small muted">типичная для такой машины ≈ <span class="num">${money(ref)}</span></p></div><div class="step"><button data-act="price" data-id="${md.id}" data-d="-1" aria-label="Снизить цену">−</button><span>${money(md.price)}</span><button data-act="price" data-id="${md.id}" data-d="1" aria-label="Поднять цену">+</button></div></div>${el}
      ${md.status==='prod'?`<div class="row ctl" style="margin-top:10px"><div><span class="label">План выпуска</span><p class="small muted">${planAuto?'авто: по спросу':'ваш план'}, машин в месяц</p></div>${planStep(md)}</div>
        <div class="chips" style="margin-top:6px"><button class="chip ${planAuto?'on':''}" data-act="planAuto" data-id="${md.id}">Авто<small>по спросу</small></button><button class="chip ${planAuto?'':'on'}" data-act="planManual" data-id="${md.id}">Вручную<small>свой план</small></button></div>`:''}`:'';
    return `<article class="card"><div class="row"><div><h3>${esc(md.name)}</h3><span class="label">${SEG[g].name} сегмент</span></div>${pill}</div>
      ${ctl}
      <div class="meta"><div>Спрос<b>${md.status==='prod'?fmtD(md.lastDem):'—'}</b></div><div>Продано<b>${md.status==='prod'?fmtN(md.lastSold):'—'}</b></div><div>Выпуск<b>${md.status==='prod'?fmtN(md.lastMade||0):'—'}</b></div><div>Склад<b class="${stockWarn(md)?'warn':''}">${fmtN(md.stock)}</b></div></div>
      <div class="meta"><div>Очередь<b class="${(md.backlog||0)>1?'warn':''}">${fmtN(md.backlog||0)}</b></div><div>Себест.<b>${money(uc)}</b></div><div>Вам с машины<b>${money(net)}</b></div><div>Маржа<b class="${margin<0?'bad':''}">${money(margin)}</b></div></div>
      ${stockWarn(md)?'<p class="small warn" style="margin-top:6px">Машины копятся на складе и дешевеют: снизьте выпуск или цену.</p>':''}
      <div class="carbox${enter}">${carSVG(md,{anim:md.status==='prod'})}</div>
      ${(()=>{const rf=refCar(md,s);return rf&&IMG[rf[1]]?`${photoHTML(rf[1])}<p class="small muted" style="margin-top:4px">Ровесник эпохи: ${esc(rf[1])}</p>`:'';})()}
      <p class="spec">${p.e.name}${upgL(p.e.id)?' ★'+upgL(p.e.id):''} · ${p.c.name}${upgL(p.c.id)?' ★'+upgL(p.c.id):''} · ${p.b.name}${upgL(p.b.id)?' ★'+upgL(p.b.id):''} · ${p.w.name}${upgL(p.w.id)?' ★'+upgL(p.w.id):''} · ${trimName(p.t,s)}</p>
      ${(md.raceBoost||0)>mi(s)?'<p class="small good" style="margin-top:6px">Слава гоночной победы: покупатели выбирают вас охотнее</p>':''}
      ${overpower(md)?'<p class="small bad" style="margin-top:6px">Мотор слишком мощный для рамы: поломки бьют по репутации.</p>':''}${qbar(r)}
      <div class="row small muted" style="margin-top:10px"><span>Всего продано</span><span class="num">${md.totalSold.toLocaleString('ru-RU')}</span></div>
      ${md.status==='prod'?`<div class="btns" style="margin-top:12px"><button class="btn" data-act="retire" data-id="${md.id}">Снять с производства</button></div>`:''}
      ${md.status==='off'?`<div class="btns" style="margin-top:12px"><button class="btn" data-act="revive" data-id="${md.id}">Вернуть в производство</button></div>`:''}</article>`;}).join('');
  const rd=s.rd,pj=rd.proj,pts=rdPoints(s);
  const rdCard=`<section class="card"><div class="row"><h2>Конструкторское бюро</h2><span class="pill warn">Уровень ${rd.lvl}</span></div>
    <p class="small muted" style="margin-top:4px">Инженеров: ${rd.lvl*4} · ${money(rdUpkeep(s))} в месяц · ${pts.toFixed(1).replace('.0','').replace('.',',')} очк. в месяц. Улучшения деталей сразу поднимают качество всех моделей с ними. С 3-го уровня бюро открывает технологии завода раньше истории.</p>
    ${pj?`<div class="row small" style="margin-top:10px"><span>${pj.kind==='upg'?'Улучшение':'Прототип'}: <b>${esc(pj.name)}</b>${pj.kind==='upg'?' ★'+pj.lvl:''}</span><span class="pill good">В работе</span></div>
      <div class="bar" style="margin-top:6px"><i style="width:${Math.max(2,Math.min(100,rd.prog/pj.need*100))}%;background:var(--brass)"></i></div>
      <div class="row small muted" style="margin-top:4px"><span>Сделано <b class="num">${Math.round(rd.prog)}</b> из <b class="num">${pj.need}</b> очков</span><span class="num">${rd.prog>0?'готово':'начнут в этом месяце, готово'} через ~${Math.max(1,Math.ceil((pj.need-rd.prog)/pts))} мес.</span></div>`
      :'<p class="small warn" style="margin-top:10px">Бюро простаивает — выберите проект.</p>'}
    <div class="btns" style="margin-top:10px"><button class="btn ${pj?'':'primary'}" data-act="rdPick">${pj?'Сменить проект':'Выбрать проект'}</button><button class="btn" data-act="rdUp" ${rd.lvl>=5||s.cash<rdUpCost(s)?'disabled':''}>${rd.lvl>=5?'Максимальный уровень':'Расширить · '+money(rdUpCost(s))}</button></div>
    ${pj&&rd.prog>0?'<p class="small muted" style="margin-top:6px">Смена проекта обнулит сделанное.</p>':''}</section>`;
  return `${planCard(s)}${rdCard}<button class="btn primary block" data-act="design">+ Новая модель</button><p class="small muted" style="padding:0 4px">Похожие модели одной марки отбирают покупателей друг у друга: выгоднее разные машины для разных классов, чем несколько одинаковых.</p>${cards}`;
}
function techRows(arr,s,extra){return arr.map(x=>`<div class="tech ${x.y<=s.y?'':'off'}"><span class="num">${x.y<=1895?'—':x.y}</span><span>${x.name}</span><span class="num">${extra(x)}</span></div>`).join('');}
// Сколько продавали бы ваши модели в стране при полной сети дилеров
function marketPotential(s,c){const act=s.models.filter(m=>m.status==='prod');if(!act.length)return 0;const R=mkCountry(c,s,act,null,null,1);return act.reduce((a,m)=>a+(R.by[m.id]||0),0)*(techLv(s,'credit')?1.15:1);}
function topIncome(inc,p){return inc.xT*Math.pow(p/INC_TOP,-1/inc.al);}
function vMarket(){
  const s=G,home=s.country,e=econ(s.y,s.m,home),L=s.last,M=L&&L.mk[home],R0=mkCountry(home,s,[]),H=R0.H,inc=R0.inc,fleet=fleetOf(s,home),K=affordK(home,s);
  const segRows=SEGK.map(g=>{const z=M&&M.segs?M.segs[g].size:R0.segs[g].inc,you=M&&M.segs?M.segs[g].you:0;return `<tr><td>${SEG[g].name}</td><td class="n">${fmtD(z)}</td><td class="n">${M?fmtN(you):'—'}</td><td class="n">${M&&z>0?pct(you/z,1):'—'}</td><td class="n">${money(prefP(g,home,s))}</td></tr>`;}).join('');
  const afford=['people','middle','lux'].map(g=>{const P=prefP(g,home,s),n=canAfford(home,s,P),sh=n/H;return `<tr><td>${SEG[g].name} <small>≈ ${money(P)}</small></td><td class="n">${fmtN(n)}</td><td class="n">${pct(sh,sh<0.01?2:1)}</td></tr>`;}).join('');
  const top=s.models.filter(m=>m.status==='prod').sort((a,b)=>b.lastSold-a.lastSold)[0];
  const rows=[{name:s.company,color:'var(--brass)',sales:L?L.homeSold:0,you:1,model:top?top.name:''},...(COMPS[home]||[]).map((cp,i)=>({cp,i})).filter(o=>o.cp.pk!==s.pioneer&&compAlive(o.cp,s)).map(o=>{const m=compModel(o.cp,s),st=(s.comps[home]||[])[o.i]||{};return {name:compName(o.cp,s),color:st.color||'#888',sales:st.last||0,model:m?m[1]:'',img:m&&m[2]};})].sort((a,b)=>b.sales-a.sales).slice(0,12);
  const mx=Math.max(1,...rows.map(r=>r.sales));
  const comp=rows.map(r=>`<div class="comp ${r.you?'you':''}">${r.img&&IMG[r.img]?`<img class="thumb" src="${IMG[r.img].src}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span class="dot" style="background:${r.color}"></span>`}<span>${esc(r.name)}${r.model?`<small>${esc(r.model)}</small>`:''}</span><div class="bar"><i style="width:${r.sales/mx*100}%;background:${r.color}"></i></div><span class="num" style="text-align:right">${fmtD(r.sales)}</span></div>`).join('');
  const dc=dealerCost(s),net=Object.keys(COUNTRIES).map(c=>{const d=dealerCount(s,c),need=Math.round(dealerNeed(c,s)),cov=Math.min(1,d/need),ec=econ(s.y,s.m,c),mk=L&&L.mk[c],size=mk&&mk.size!=null?mk.size:SEGK.reduce((a,g)=>a+mkCountry(c,s,[]).segs[g].inc,0),tf=c===home?0:tariffAt(c,s),pot=marketPotential(s,c),lost=mk&&mk.lostDlr||0;
    const room=Math.max(0,need-d),add=n=>{const k=room>0?Math.min(n,room):n;return `<button class="btn sm" data-act="dealers" data-c="${c}" data-n="${k}" ${s.cash<k*dc?'disabled':''}>+${fmtN(k)}</button>`;};const big=Math.max(5,Math.round(need*0.1/5)*5);
    const btns=room>0?add(1)+(room>1?add(big):''):lost>0.5?`<button class="btn sm" data-act="dealers" data-c="${c}" data-n="${Math.max(1,Math.round(need*0.1))}" ${s.cash<Math.max(1,Math.round(need*0.1))*dc?'disabled':''}>+${fmtN(Math.max(1,Math.round(need*0.1)))} — дилеры не справляются</button>`:'';
    return `<div class="net-row"><div class="row"><div><h3>${COUNTRIES[c].name}${c===home?' · дома':''}</h3><p class="small muted">Рынок ${fmtD(size)} в месяц · <span class="${ec.tone}">${ec.label}</span>${tf?` · пошлина ${Math.round(tf*100)}%`:''}</p></div><span class="num small ${mk&&mk.sold?'good':''}" style="white-space:nowrap">${mk?fmtN(mk.sold||0):0} шт.</span></div>
      ${pot>0?`<p class="small" style="margin-top:4px">Ваши модели при полной сети: ≈ <b class="num">${fmtD(pot)}</b> в месяц${d?` · сейчас сеть видит ${Math.round(reachOf(s,c)*100)}% покупателей`:''}</p>`:''}
      <div class="row small" style="margin-top:6px"><span class="muted">Дилеры: <b class="num">${fmtN(d)}</b> из ${fmtN(need)} для всей страны</span><span class="num">${Math.round(cov*100)}%</span></div><div class="bar" style="margin-top:4px"><i style="width:${cov*100}%;background:var(--good)"></i></div>
      ${room===0&&d?`<p class="small good" style="margin-top:4px">Сеть покрывает всю страну${lost>0.5?`, но дилеры не успевают: потеряно ≈ ${fmtD(lost)} покупателей`:''}.</p>`:''}
      <div class="btns" style="margin-top:6px">${btns}${d>(c===home?1:0)?`<button class="btn sm" data-act="dealersCut" data-c="${c}">Закрыть 20%</button>`:''}</div></div>`;}).join('');
  return `<section class="card"><div class="row"><h2>${COUNTRIES[home].name}</h2><span class="pill ${e.tone}">${e.label}</span></div>
    <div class="meta"><div>Рынок/мес<b>${fmtD(M&&M.size?M.size:SEGK.reduce((a,g)=>a+R0.segs[g].inc,0))}</b></div><div>Ваши<b>${L?fmtN(L.homeSold):'—'}</b></div><div>Доля<b>${L?pct(L.share,1):'—'}</b></div><div>Цены к 1913<b>${Math.round(cpi(s)*100)}%</b></div></div>${home==='us'&&s.y<1905?'<p class="small warn" style="margin-top:8px">Богатых семей в Америке много, но дороги плохи, и машины пока берут неохотно. Во Франции машины уже в моде: откройте там дилеров ниже, пошлина невелика.</p>':''}${home==='it'&&s.y<1905?'<p class="small warn" style="margin-top:8px">Богатых семей в Италии мало, свой рынок крошечный. Продавайте и за границей: во Франции покупателей в разы больше, пошлина — 12%.</p>':''}<div class="hr"></div>
    <table class="pl"><tr><th>Класс</th><th class="n">Рынок</th><th class="n">Вы</th><th class="n">Доля</th><th class="n">Цена</th></tr>${segRows}</table>
    <p class="small muted" style="margin-top:10px">Сколько машин купили в прошлом месяце у всех марок и у вас. Весной и летом покупают охотнее. Класс машины задают кузов и оснащение; цена — типичная для класса.</p></section>
  <section class="card"><h2>Покупатели</h2>
    <div class="meta"><div>Семей<b>${fmtN(H)}</b></div><div>Доход семьи<b>${money(inc.med)}</b></div><div>Машин на дорогах<b>${fmtN(fleet)}</b></div><div>С машиной<b>${pct(Math.min(1,fleet/H),fleet/H<0.01?2:1)}</b></div></div>
    <p class="small muted" style="margin-top:6px">Доход — у средней семьи за год: половина семей беднее. Богатейшие 1% получают от ${money(topIncome(inc,0.01))} в год.</p>
    <table class="pl" style="margin-top:10px"><tr><th>Машина по карману</th><th class="n">Семей</th><th class="n">Доля</th></tr>${afford}</table>
    <p class="small muted" style="margin-top:8px">Машина по карману, если стоит не больше ${pct(K,0)} годового дохода семьи${K>0.5?' — помогает рассрочка':''}. Каждый месяц к машине присматривается часть семей: новички и владельцы, которые меняют старую. Берут то, что лучше за свои деньги, или ждут. Чем дешевле хорошая машина, тем больше семей может её купить.</p></section>
  <section class="card"><h2>Конкуренты</h2><p class="small muted" style="margin-top:2px">Реальные марки эпохи и их модели. Продажи за прошлый месяц, машин.</p><div style="margin-top:8px">${comp}</div></section>
  <section class="card"><h2>Дилеры и экспорт</h2><p class="small muted" style="margin-top:2px">Где нет вашего дилера, там машину не купить: первые дилеры открываются в больших городах и сразу видят большую часть покупателей. Дилер берёт ${Math.round(DEALER_MARGIN*100)}% цены и продаёт до ${fmtN(Math.round(dealerTP(s)))} машин в месяц. Новый дилер — ${money(dc)}, содержание ${money(dealerUpkeep(s))} в месяц. За границей покупатель платит пошлину, а вы — доставку ${money(shipCost(s))}.</p><div style="margin-top:6px">${net}</div></section>
  <section class="card"><div class="row"><h2>Реклама</h2><b class="num" id="adVal">${money(s.ad)}</b></div><input type="range" id="ad" min="0" max="${Math.round(adRef(s)*4/10)*10}" step="${Math.max(10,Math.round(adRef(s)/50/10)*10)}" value="${s.ad}" aria-label="Бюджет рекламы в месяц" style="margin-top:10px"><p class="small muted">В месяц. Отдача падает после ${money(adRef(s)*2)}; за границей реклама работает на треть.</p></section>
  <section class="card"><span class="label">Объём рынка, машин в месяц</span>${spark(s.hist.market,'var(--muted)')}<div class="hr"></div><span class="label">Ваши продажи, машин в месяц</span>${spark(s.hist.sales,'var(--good)')}<div class="hr"></div><span class="label">Ваша доля дома, %</span>${spark(s.hist.share||[],'var(--brass)')}</section>
  <section class="card"><h2>Технологии поставщиков</h2><p class="small muted" style="margin-top:4px">Серые позиции появятся в указанном году.</p>
    <div class="label" style="margin-top:12px">Двигатели</div>${techRows(ENGINES,s,x=>x.hp+' л.с.')}<div class="label" style="margin-top:12px">Рамы</div>${techRows(CHASSIS,s,x=>'до '+Math.round(x.max*bn('chassisTol'))+' л.с.')}<div class="label" style="margin-top:12px">Кузова</div>${techRows(BODIES,s,x=>x.truck?'груз.':'кач. '+x.q)}<div class="label" style="margin-top:12px">Шины</div>${techRows(TYRES,s,x=>'сцепл. '+Math.round(x.grip*100))}</section>`;
}
function legacyCard(){
  const s=G,t=legacyTable(s),me=t.me,maxes={scale:400,market:200,innov:240,sport:400,capital:250,brand:160};
  const bars=Object.keys(LEG_NAMES).map(k=>`<div class="leg-row"><span>${LEG_NAMES[k]}</span><div class="bar"><i style="width:${Math.min(100,me[k]/maxes[k]*100)}%;background:var(--brass)"></i></div><b class="num">${Math.round(me[k])}</b></div>`).join('');
  const near=t.rows.slice(Math.max(0,t.place-3),t.place+2).map((r,i)=>`<tr class="${r.you?'you':''}"><td>${t.rows.indexOf(r)+1}.</td><td>${esc(r.n)}</td><td class="n">${Math.round(r.L.total)}</td></tr>`).join('');
  const firsts=Object.values(s.firsts||{}).map(f=>`<li class="good"><time>${f.y}</time><p>${esc(f.name)} — раньше, чем ${esc(f.who)} (${f.hy})</p></li>`).join('');
  return `<section class="card"><div class="row"><h2>Наследие</h2><span class="pill warn">${t.place}-е место</span></div>
    <p class="small muted" style="margin-top:4px">Цель игры — создать величайшую автоимперию эпохи. В 1930 году вашу компанию сравнят с реальными: Ford, General Motors, Citroën, FIAT, Bugatti, Rolls-Royce и другими — по масштабу, доле рынка, изобретениям, победам, капиталу и имени.</p>
    <div style="margin-top:10px">${bars}</div><div class="row small" style="margin-top:6px"><span class="muted">Всего очков</span><b class="num">${Math.round(me.total)}</b></div>
    <table class="pl" style="margin-top:10px">${near}</table>
    ${firsts?`<div class="label" style="margin-top:12px">Первенства</div><ul class="log">${firsts}</ul>`:'<p class="small muted" style="margin-top:10px">Первенств пока нет. Внедрите технологию или деталь раньше, чем это случилось в истории, — прокачайте КБ.</p>'}
    <button class="btn block" style="margin-top:10px" data-act="legacyInfo">Как считаются очки</button></section>`;
}
function vLog(){
  const got=ACH.filter(a=>G.ach[a.id]).length;
  const papers=G.papers.slice().reverse().map((p,i)=>`<button class="chip" style="width:100%;margin-top:6px" data-act="reopenPaper" data-k="${G.papers.length-1-i}"><small>${p.d}</small>${esc(p.title)}</button>`).join('');
  return `${legacyCard()}${papers?`<section class="card"><h2>Газетный архив</h2>${papers}</section>`:''}
  <section class="card"><div class="row"><h2>Достижения</h2><span class="num muted">${got}/${ACH.length}</span></div><div class="ach">${ACH.map(a=>`<div class="${G.ach[a.id]?'got':''}"><b>${a.name}</b>${a.desc}${G.ach[a.id]?' · '+G.ach[a.id]:''}</div>`).join('')}</div></section>
  <section class="card"><h2>Хроника</h2><ul class="log" style="margin-top:6px">${G.log.slice().reverse().map(l=>`<li class="${l.kind}"><time>${l.d}</time><p>${esc(l.text)}</p></li>`).join('')}</ul></section>`;
}
let shownCash=null,cashRaf=0,lastDate='';
function setCash(v){const el=document.getElementById('cash');el.className=v<0?'neg':'';if(shownCash===null||REDUCE){shownCash=v;el.textContent=money(v);return;}
  const from=shownCash,t0=performance.now();shownCash=v;cancelAnimationFrame(cashRaf);const tick=now=>{const k=Math.min(1,(now-t0)/600),e=1-Math.pow(1-k,3);el.textContent=money(from+(v-from)*e);if(k<1)cashRaf=requestAnimationFrame(tick);};cashRaf=requestAnimationFrame(tick);}
function render(){
  const s=G;if(!s)return;
  document.getElementById('co').textContent=`${s.company} · ${COUNTRIES[s.country].city}`;
  const d=document.getElementById('date'),ds=dstr(s);d.innerHTML=`${MONTHS[s.m]} <span>${s.y}</span>`;
  if(lastDate&&lastDate!==ds){d.classList.remove('flip');void d.offsetWidth;d.classList.add('flip');}
  lastDate=ds;setCash(s.cash);
  document.getElementById('view').innerHTML=tab==='plant'?vPlant():tab==='models'?vModels():tab==='market'?vMarket():tab==='race'?vRace():vLog();
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
  const nb=document.getElementById('nextBtn'),qb=document.getElementById('qBtn'),ab=document.getElementById('autoBtn');
  const blocked=s.pending.length>0||s.over;nb.disabled=qb.disabled=ab.disabled=blocked;
  nb.textContent=s.over?'Игра окончена':blocked?'Сначала решите событие':'Следующий месяц →';
  ab.textContent=auto?'❚❚':'▶';ab.classList.toggle('on',!!auto);
  const ad=document.getElementById('ad');if(ad)ad.addEventListener('input',e=>{G.ad=+e.target.value;document.getElementById('adVal').textContent=money(G.ad);save();});
  if(s.pending.length&&!R){stopAuto();showEvent();}
}
let toastQ=[],toastBusy=false;
function toast(msg){toastQ.push(msg);if(!toastBusy)nextToast();}
function nextToast(){const m=toastQ.shift(),el=document.getElementById('toast');if(!m){toastBusy=false;el.hidden=true;return;}toastBusy=true;el.textContent=m;el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');setTimeout(nextToast,auto?1000:2200);}
function afterStep(){const L=G.last;if(L){toastQ=toastQ.slice(-1);toast(`${L.label}: продано ${fmtN(L.sold)} · ${L.profit>=0?'+':''}${money(L.profit)}`);}pendingToasts.forEach(toast);pendingToasts=[];}
