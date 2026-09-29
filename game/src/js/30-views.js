/* ================= RENDER ================= */
function spark(data,color='var(--brass)'){
  const w=320,h=64;if(data.length<2)return '<div class="empty-chart">График появится через пару месяцев</div>';
  const min=Math.min(0,...data),max=Math.max(1,...data),span=max-min||1,x=i=>i*(w/(data.length-1)),y=v=>h-3-(v-min)/span*(h-6);
  const pts=data.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ');
  const zero=min<0?`<line class="zero" x1="0" x2="${w}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>`:'';
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="0,${y(min)} ${pts} ${w},${y(min)}" fill="${color}" fill-opacity=".14"/>${zero}<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}
function qbar(r,label){const [l,tone]=qLabel(r);return `<div class="row small" style="margin-top:10px"><span class="muted">${esc(label||'Против соперников класса')}</span><span class="${tone}">${l} · <span class="num">${Math.round(r*100)}%</span></span></div><div class="bar qb" style="margin-top:6px"><i style="width:${Math.min(100,r/1.5*100)}%;background:var(--${tone})"></i><b></b></div>`;}
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
    ${L.ord?`<tr><td>Заказы ведомств и фирм (${fmtN(L.ordN)} шт.)</td><td class="n">${money(L.ord)}</td></tr>`:''}${L.dump?`<tr><td>Распродажа излишков склада (${fmtN(L.dumpN)} шт.)</td><td class="n">${money(L.dump)}</td></tr>`:''}
    <tr><td>Детали и материалы</td><td class="n">−${money(L.mat)}</td></tr><tr><td>Зарплата</td><td class="n">−${money(L.wage)}</td></tr><tr><td>Содержание завода</td><td class="n">−${money(L.ovh)}</td></tr>
    ${L.dlr?`<tr><td>Дилерская сеть</td><td class="n">−${money(L.dlr)}</td></tr>`:''}<tr><td>Реклама</td><td class="n">−${money(L.ad)}</td></tr>${L.rd?`<tr><td>Конструкторское бюро</td><td class="n">−${money(L.rd)}</td></tr>`:''}${L.drv?`<tr><td>Гонщики</td><td class="n">−${money(L.drv)}</td></tr>`:''}${L.team?`<tr><td>Гоночная команда</td><td class="n">−${money(L.team)}</td></tr>`:''}
    ${L.sto>1?`<tr><td>Склад</td><td class="n">−${money(L.sto)}</td></tr>`:''}${L.war>1?`<tr><td>Гарантийный ремонт</td><td class="n">−${money(L.war)}</td></tr>`:''}${L.fin?`<tr><td>Кредит покупателям</td><td class="n">−${money(L.fin)}</td></tr>`:''}${L.tool?`<tr><td>Оснастка новых моделей</td><td class="n">−${money(L.tool)}</td></tr>`:''}${L.hire>1?`<tr><td>Найм и обучение</td><td class="n">−${money(L.hire)}</td></tr>`:''}${L.fine?`<tr><td>Неустойка по заказам</td><td class="n">−${money(L.fine)}</td></tr>`:''}
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
  const staffHTML=`    <div class="chips" style="margin-top:8px"><button class="chip ${s.staffAuto?'on':''}" data-act="staffAuto" data-v="1">Нанимать по плану выпуска<small>отдел кадров сам держит нужный штат</small></button><button class="chip ${s.staffAuto?'':'on'}" data-act="staffAuto" data-v="0">Вручную<small>шаг — 10% штата</small></button></div>
    <div class="label" style="margin-top:12px">Зарплата</div><div class="chips">${Object.entries(WAGE_POL).map(([k,w])=>`<button class="chip ${wp===k?'on':''}" data-act="wagePol" data-v="${k}" ${w.y&&s.y<w.y-techEarly(s)?'disabled':''}>${w.name}<small>×${String(w.k).replace('.',',')} ставки · выработка ${w.prod>=1?'+':'−'}${Math.round(Math.abs(w.prod-1)*100)}% · текучесть ${w.turn}${w.y&&s.y<w.y-techEarly(s)?' · с '+(w.y-techEarly(s))+' г.':''}</small></button>`).join('')}</div>`;
  return `<div class="scene">${plantHTML(s)}</div>
  ${advisorCard(s)}
  <div class="kpis"><div class="kpi"><span class="label">Прибыль</span><b class="${L&&L.profit<0?'bad':''}">${L?money(L.profit):'—'}</b></div><div class="kpi"><span class="label">Продано</span><b>${L?fmtN(L.sold)+' шт.':'—'}</b></div><div class="kpi"><span class="label">Репутация</span><b>${Math.round(s.rep)}<span class="muted small">/100</span></b></div></div>
  ${s.pioneer!=='custom'?`<section class="card" style="display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:center"><button class="pion-link" data-act="founder" style="width:64px" aria-label="Об основателе">${portraitHTML(s.pioneer)}</button><div><h3>${P.name} <button class="btn sm" data-act="founder">О нём ▸</button></h3><div class="bon">${P.plus.map(x=>`<span class="p">${x}</span>`).join('')}${P.minus.map(x=>`<span class="m">${x}</span>`).join('')}</div></div></section>`:''}
  <section class="card"><div class="row"><span class="label">Касса по месяцам</span><span class="small muted num">${money(s.cash)}</span></div>${spark(s.hist.cash)}</section>
  ${foldCard('cap',true,'<h2>Мощности</h2>',`
    <div class="row" style="margin-top:8px"><div><h3><span class="num">${fmtN(Math.round(cap))}</span> машин в месяц</h3><p class="small muted">${s.shifts>1?'Две смены':'Одна смена'} · простая машина в пересчёте${building?` · строится ещё ${fmtN(Math.round(building*techMul(s,'cap')*(s.shifts>1?1.85:1)))}`:''}</p></div><span class="num ${util>0.95?'warn':''}">${Math.round(util*100)}%</span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${util*100}%;background:var(--brass)"></i></div>
    <p class="small muted" style="margin-top:4px">Загрузка в прошлом месяце. Сложные модели занимают больше места на линии.</p>
    <div class="btns" style="margin-top:10px"><button class="btn" data-act="capAdd" data-n="${addQ}" ${s.cash<addQ*cu?'disabled':''}>+25% · ${money(addQ*cu)}</button><button class="btn" data-act="capAdd" data-n="${addH}" ${s.cash<addH*cu?'disabled':''}>Удвоить · ${money(addH*cu)}</button>${s.cap>3?`<button class="btn sm" data-act="capSell">Продать 20%</button>`:''}</div>
    <p class="small muted" style="margin-top:6px">Цех строится 2 месяца. Место под одну машину в месяц стоит ${money(cu)}; содержание — около 1% стоимости завода в месяц.</p>
    <div class="label" style="margin-top:12px">Смены</div><div class="chips"><button class="chip ${s.shifts>1?'':'on'}" data-act="shifts" data-v="1">Одна<small>обычная ставка</small></button><button class="chip ${s.shifts>1?'on':''}" data-act="shifts" data-v="2">Две<small>мощность ×1,85, зарплата +8%, содержание +10%</small></button></div>`,`${fmtN(Math.round(cap))} машин в месяц · загрузка ${Math.round(util*100)}%${building?' · строится':''}`)}
  ${foldCard('staffc',true,'<h2>Рабочие</h2>',`
    <div class="row" style="margin-top:8px"><div><h3><span class="num">${fmtN(s.workers)}</span> рабочих</h3><p class="small muted">${money(wageNow(s))} в месяц на человека · ${Math.round(hpw)} ч в месяц</p></div>${s.staffAuto?'<span class="pill good">Штат по плану</span>':`<div class="step"><button data-act="workers" data-d="-1" aria-label="Сократить">−</button><span>${fmtN(s.workers)}</span><button data-act="workers" data-d="1" aria-label="Нанять">+</button></div>`}</div>
    <div class="row small" style="margin-top:8px"><span class="muted">На одну машину уходит</span><span class="num">${fmtN(Math.round(avgH))} человеко-часов</span></div>
    ${DIF().simple&&helperOn(s)?'<p class="small muted" style="margin-top:6px">Людей нанимает отдел кадров по плану выпуска.</p>':fold('staff','Найм и зарплата',staffHTML,false,(s.staffAuto?'штат по плану · ':'вручную · ')+WAGE_POL[wp].name.toLowerCase())}
  `,`${fmtN(s.workers)} рабочих · ${money(wageNow(s))} в месяц`)}
  ${whCard(s)}
  ${foldCard('techc',false,'<h2>Технологии завода</h2>',`<p class="small muted" style="margin-top:2px">Внедряется одна технология за раз, 3 месяца. Сильное КБ открывает их раньше истории — это «первенства» в зачёт наследия.</p>
    ${fold('tech',s.techBuild?`Внедряется: ${esc(techNext(s,s.techBuild.k).name)} · ${s.techBuild.left} мес.`:'Все технологии',`<div>${techs}</div>`,false,`внедрено ${TECH_ORDER.reduce((a,k)=>a+techLv(s,k),0)} из ${TECH_ORDER.reduce((a,k)=>a+TECH[k].max,0)} · можно начать: ${TECH_ORDER.filter(k=>techOpen(s,k)).length}`)}`,`внедрено ${TECH_ORDER.reduce((a,k)=>a+techLv(s,k),0)} из ${TECH_ORDER.reduce((a,k)=>a+TECH[k].max,0)}${s.techBuild?' · внедряется: '+esc(techNext(s,s.techBuild.k).name):''}`)}
  ${foldCard('fin',true,'<h2>Финансы</h2>',`${L?`<div class="row small" style="margin-top:8px"><span class="muted">Итог за ${L.label}</span><b class="num ${L.profit>=0?'good':'bad'}">${money(L.profit)}</b></div>`:''}${fold('pl','Доходы и расходы по статьям',pl,false)}<div class="hr"></div>
    <div class="row"><div><h3>Кредит: <span class="num">${money(s.loan)}</span></h3><p class="small muted">0,5% в месяц · лимит ${money(ml)}</p></div><div class="btns"><button class="btn" data-act="loan" data-n="${step}" ${s.loan+step>ml?'disabled':''}>+${fmtN(step)}</button><button class="btn" data-act="repay" data-n="${step}" ${s.loan<1||s.cash<Math.min(step,s.loan)?'disabled':''}>Погасить</button></div></div>
    <div class="row small" style="margin-top:8px"><span class="muted">Стоимость компании</span><span class="num">${money(companyValue(s))}</span></div>`,L?`итог за ${L.label}: ${money(L.profit)} · кредит ${money(s.loan)}`:'')}`;
}
function whCard(s){const st=whStock(s),cap=whCap(s),f=st/Math.max(1,cap),uc=whUnitCost(s),a=Math.max(5,Math.round(cap*0.5)),b=Math.max(10,cap),bld=(s.whBuild||[]).reduce((x,y)=>x+y.units,0),L=s.last;
  return foldCard('wh',true,'<h2>Склад</h2>',`<div class="row" style="margin-top:8px"><div><h3><span class="num">${fmtN(st)}</span> из ${fmtN(cap)} мест</h3><p class="small muted">Место под одну машину — ${money(uc)}${bld?` · строится ещё ${fmtN(bld)}`:''}</p></div><span class="num ${f>0.9?'warn':''}">${Math.round(f*100)}%</span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${Math.min(100,f*100)}%;background:var(--${f>0.9?'warn':'brass'})"></i></div>
    ${L&&L.dumpN?`<p class="small bad" style="margin-top:6px">Не поместились ${fmtN(L.dumpN)} машин — ушли перекупщикам за полцены.</p>`:''}
    <div class="btns" style="margin-top:10px"><button class="btn" data-act="whAdd" data-n="${a}" ${s.cash<a*uc?'disabled':''}>+${fmtN(a)} мест · ${money(a*uc)}</button><button class="btn" data-act="whAdd" data-n="${b}" ${s.cash<b*uc?'disabled':''}>Удвоить · ${money(b*uc)}</button></div>
    <p class="small muted" style="margin-top:6px">Склад строится месяц. Запас машин спасает, когда спрос выше прогноза, а всё, что не влезло, забирают перекупщики за полцены.</p>`,`${fmtN(st)} из ${fmtN(cap)} мест · ${Math.round(f*100)}%`);}
// Сколько завод выпустит в этом месяце при плане «авто»
function autoPlan(md){return Math.max(0,Math.round((md.fc||0)*1.04+(md.backlog||0)-((md.stock||0)-0.35*(md.fc||0))));}
const fmtD=x=>x>0&&x<10?(Math.round(x*10)/10).toString().replace('.',','):fmtN(x);
function planStep(md,sm){const auto=md.plan==='auto'||md.plan===undefined,n=auto?autoPlan(md):+md.plan,st=Math.max(1,Math.round(Math.max(n,md.fc||1)*0.1));
  return `<div class="step${sm?' sm':''}"><button data-act="plan" data-id="${md.id}" data-d="${-st}" aria-label="Выпускать меньше">−</button><span>${fmtN(n)}</span><button data-act="plan" data-id="${md.id}" data-d="${st}" aria-label="Выпускать больше">+</button></div>`;}
// Себестоимость и экономия масштаба: из чего она складывается и сколько стоила бы машина при большем выпуске
function costHTML(md,s){if(md.status!=='prod')return '';const v=Math.max(1,modelVol(md)),mat=matCost(md,s),lab=hoursPerCar(md,s)/hoursPerWorker(s)*wageNow(s),at=k=>unitCost({...md,vol:v*k},s),l=1-labLearn(md);
  return `<p class="small muted" style="margin-top:6px">Себестоимость ${money(mat+lab)} = детали ${money(mat)} + работа ${money(lab)} при выпуске ≈ ${fmtD(v)} в месяц. <span class="good">Больше выпуск — дешевле машина:</span> при ${fmtN(v*3)} в месяц — ${money(at(3))}, при ${fmtN(v*10)} — ${money(at(10))}${l>0.02?`. Опыт рабочих: ${fmtN(md.made||0)} машин уже собрано — работы на ${Math.round(l*100)}% меньше`:''}.</p>`;}
// Грузовик: сколько фирм всё ещё берут лошадь
function truckHint(md,s){if(md.status!=='prod'||!isTruck(md))return '';const h=horseSplit(s,s.country,s.last&&s.last.mk[s.country]);if(!h)return '';
  return `<p class="small muted" style="margin-top:6px">🐴 Из ≈ ${fmtD(h.pool)} фирм, которые в месяц покупают транспорт, лошадь всё ещё берут ${pct(h.horse/h.pool)}. Чем надёжнее, экономичнее и дешевле ваша машина, тем больше их пересядет на мотор.</p>`;}
function stockWarn(md){return md.status==='prod'&&md.stock>Math.max(3,(md.fc||0)*3);}
// Сворачиваемые разделы: длинные списки открываются, когда нужны
const UIF={};
// что свёрнуто — запоминается в сохранении
function isOpen(k,def){const f=G&&G.ui&&G.ui.f,v=f&&f[k]!==undefined?f[k]:UIF[k];return v===undefined?!!def:v;}
function setOpen(k,v){UIF[k]=v;if(G){G.ui=G.ui||{};G.ui.f=G.ui.f||{};G.ui.f[k]=v;}}
// Карточка, которую можно свернуть: заголовок — кнопка; свёрнутая показывает одну строку итога
function foldCard(k,def,head,body,sum,cls){const o=isOpen(k,def);return `<section class="card${cls?' '+cls:''}${o?'':' folded'}"><button class="card-h" data-act="fold" data-k="${k}" data-def="${def?1:0}" aria-expanded="${o}"><span class="ch">${head}</span><i>${o?'▴':'▾'}</i></button>${o?body:(sum?`<p class="small muted card-sum">${sum}</p>`:'')}</section>`;}
function fold(k,title,inner,def,sub){const o=isOpen(k,def);return `<button class="fold-h" data-act="fold" data-k="${k}" data-def="${def?1:0}"><span>${title}${sub?`<small>${sub}</small>`:''}</span><i>${o?'▴':'▾'}</i></button>${o?`<div class="fold-b">${inner}</div>`:''}`;}
// Почему продали меньше, чем хотели купить
function lostLine(md){if(md.status!=='prod'||md.lastWant===undefined)return '';const w=md.lastWant||0,sold=md.lastSold||0;if(w<0.5)return '<p class="small muted" style="margin-top:6px">В прошлом месяце покупателей не нашлось: проверьте цену, дилеров и сравнение с соперником.</p>';
  if(w-sold<0.6)return `<p class="small good" style="margin-top:6px">Продано всё, что хотели купить${sold?` — ${fmtN(sold)} шт.`:'.'}</p>`;
  const L=[];if((md.lostS||0)>=0.5)L.push(`не хватило машин — ${fmtD(md.lostS)}${(md.queued||0)>=1?` (${fmtN(md.queued)} ждут в очереди)`:''}`);if((md.lostD||0)>=0.5)L.push(`дилеры не успели — ${fmtD(md.lostD)}`);
  return `<p class="small warn" style="margin-top:6px">Хотели купить ≈ ${fmtD(w)}, продано ${fmtN(sold)}${L.length?': '+L.join(', '):''}. ${(md.lostS||0)>=(md.lostD||0)?'Выпускайте больше или расширьте склад.':'Откройте дилеров на вкладке «Рынок».'}</p>`;}
function planCard(s){const act=s.models.filter(m=>m.status==='prod');if(!act.length)return '';
  const rows=act.map(md=>{const auto=md.plan==='auto'||md.plan===undefined,w=stockWarn(md),TT=techTone(md,s);
    return `<div class="plan-row"><div class="row ctl"><div><h3><span class="${TT.tone}" title="Против соперников класса">${esc(md.name)}</span> <small class="num ${TT.tone}">${Math.round(TT.r*100)}%</small> <span class="pill ${auto?'good':'warn'}">${auto?'авто':'вручную'}</span></h3>
      <p class="small muted">выпуск ${fmtN(md.lastMade||0)} · продано ${fmtN(md.lastSold||0)}${md.ordSold?` · по заказам ${fmtN(md.ordSold)}`:''} · склад <b class="${w?'warn':''}">${fmtN(md.stock)}</b>${md.backlog>1?` · очередь ${fmtN(md.backlog)}`:''}</p></div>${auto&&!isOpen('plan'+md.id)?`<button class="btn sm" data-act="fold" data-k="plan${md.id}">Вручную ▾</button>`:planStep(md,1)}</div>
      ${w?`<p class="small warn" style="margin-top:4px">Машины копятся на складе и дешевеют: снизьте выпуск или цену.</p>`:''}
      ${auto?(isOpen('plan'+md.id)?`<p class="small muted" style="margin-top:4px">Нажмите − или +, чтобы выпускать своё число машин вместо «авто».</p>`:''):`<button class="btn sm" style="margin-top:6px" data-act="planAuto" data-id="${md.id}">Вернуть «авто»</button>`}</div>`;}).join('');
  const wf=whStock(s)/Math.max(1,whCap(s)),made=act.reduce((a,m)=>a+(m.lastMade||0),0),sold=act.reduce((a,m)=>a+(m.lastSold||0),0);
  return foldCard('planlist',act.length<=3,`<h2>Выпуск</h2><span class="label">${act.length} ${plural(act.length,'модель','модели','моделей')} · машин в месяц</span>`,`${rows}
    <div class="row small" style="margin-top:8px"><span class="muted">Склад: ${fmtN(whStock(s))} из ${fmtN(whCap(s))} мест</span><span class="num ${wf>0.9?'warn':''}">${Math.round(wf*100)}%</span></div><div class="bar" style="margin-top:4px"><i style="width:${Math.min(100,wf*100)}%;background:var(--${wf>0.9?'warn':'brass'})"></i></div>
    <p class="small muted" style="margin-top:8px">Цвет названия — какая машина против соперников класса: <span class="good">зелёная — лучше</span>, <span class="warn">жёлтая — наравне</span>, <span class="bad">красная — хуже</span>. «Авто» — завод делает столько, сколько берут покупатели, и не больше, чем поместится на складе.</p>`,
    `выпуск ${fmtN(made)} · продано ${fmtN(sold)} · склад ${Math.round(wf*100)}% · ${act.map(md=>{const TT=techTone(md,s);return `<span class="${TT.tone}">${esc(md.name)}</span>`;}).join(', ')}`);}
function ordersCard(s){const L=s.orders||[];if(!L.length)return '';
  return `<section class="card"><div class="row"><h2>Заказы</h2><span class="pill good">${L.length}</span></div>${L.map(o=>{const md=s.models.find(m=>m.id===o.md),done=o.n-o.left,left=o.due-mi(s);
    return `<div class="plan-row"><div class="row"><div><h3>${esc(o.who)}</h3><p class="small muted">«${esc(md?md.name:'?')}» · ${money(o.price)} за машину · осталось ${left} мес.</p></div><span class="num">${fmtN(done)}/${fmtN(o.n)}</span></div><div class="bar" style="margin-top:6px"><i style="width:${done/o.n*100}%;background:var(--good)"></i></div></div>`;}).join('')}
    <p class="small muted" style="margin-top:8px">Машины для заказов завод делает сверх плана и отдаёт в первую очередь. Не успеете к сроку — неустойка и удар по репутации.</p></section>`;}
function rdCardHTML(s){const rd=s.rd,L=rdActive(s),tot=rdTotal(s),slots=rdSlots(s),free=slots-L.length;
  const rows=L.map((pj,i)=>{const pts=rdPtsOf(s,pj);return `<div class="rd-row"><div class="row small"><span>${pj.kind==='upg'?'Улучшение':'Прототип'}: <b>${esc(pj.name)}</b>${pj.kind==='upg'?' ★'+pj.lvl:''}</span><button class="iconbtn sm" data-act="rdStop" data-k="${i}" aria-label="Остановить проект">×</button></div>
    <div class="bar" style="margin-top:6px"><i style="width:${Math.max(2,Math.min(100,(pj.prog||0)/pj.need*100))}%;background:var(--brass)"></i></div>
    <div class="row small muted" style="margin-top:4px"><span>${Math.floor(pj.prog||0)} из ${pj.need} · готово через ~${Math.max(1,Math.ceil((pj.need-(pj.prog||0))/pts))} мес.</span>${L.length>1?`<div class="step sm"><button data-act="rdW" data-k="${i}" data-d="-1" aria-label="Меньше сил">−</button><span>${Math.round(rdShare(s,pj)*100)}%</span><button data-act="rdW" data-k="${i}" data-d="1" aria-label="Больше сил">+</button></div>`:'<span>все силы бюро</span>'}</div></div>`;}).join('');
  return `<section class="card"><div class="row"><h2>Конструкторское бюро</h2><span class="pill warn">${rd.lvl}/${RD_MAX}</span></div>
    <p class="small muted" style="margin-top:4px">${RD_LV[rd.lvl]} · инженеров ${rd.lvl*4} · ${money(rdUpkeep(s))} в месяц · ${tot.toFixed(1).replace('.0','').replace('.',',')} очк. в месяц на всё бюро. Один проект получает все силы; если ведёте несколько, распределите силы кнопками − и +. Одновременно — до ${slots} проектов.</p>
    ${rows}${!L.length?'<p class="small warn" style="margin-top:10px">Бюро простаивает — выберите проект.</p>':''}
    <div class="btns" style="margin-top:10px">${free>0?`<button class="btn ${L.length?'':'primary'}" data-act="rdPick">+ Проект</button>`:''}<button class="btn" data-act="rdUp" ${rd.lvl>=RD_MAX||s.cash<rdUpCost(s)?'disabled':''}>${rd.lvl>=RD_MAX?'Высший уровень':'Расширить · '+money(rdUpCost(s))}</button></div>
    ${rd.lvl<RD_MAX?`<p class="small muted" style="margin-top:6px">Уровень ${rd.lvl+1} — «${RD_LV[rd.lvl+1]}»: больше инженеров${rdSlots({rd:{lvl:rd.lvl+1}})>slots?', ещё один проект одновременно':''}${rd.lvl+1>=5&&rd.lvl<5?', улучшения до ★4':rd.lvl+1>=7&&rd.lvl<7?', улучшения до ★5':''}, прототипы дальше в будущее.</p>`:''}</section>`;}
function specLine(md,s){const p=parts(md),st=x=>upgL(x.id)?' ★'+upgL(x.id):'';return PART_KEYS.map(k=>p[k].name+st(p[k])).join(' · ')+' · '+trimName(p.t,s);}
// Во сколько раз машина лучше соперников класса — цветом: зелёная лучше, жёлтая наравне, красная хуже
function techTone(md,s){const r=classScore(md,s);return {r,tone:r>=1.08?'good':r>=0.9?'warn':'bad'};}
// Что будет при другой цене: спрос, выпуск, себестоимость при этом выпуске (экономия масштаба) и прибыль
function priceTable(md,s){const P=md.price,rows=[[0.9,'−10%'],[1,'сейчас'],[1.1,'+10%']].map(([k,lab])=>{const p=Math.round(P*k/10)*10,d=demandAt(md,s,p),uc=unitCost({...md,vol:Math.max(1,d)},s),m=p*(1-DEALER_MARGIN)-uc;return {p,lab,d,uc,m,pr:d*m,now:k===1};});
  const best=rows.reduce((a,b)=>b.pr>a.pr?b:a,rows[0]);
  return `<table class="pl ptab" style="margin-top:8px"><tr><th>Цена</th><th class="n">Спрос</th><th class="n">Себест.</th><th class="n">Прибыль</th></tr>${rows.map(r=>`<tr class="${r.now?'you':''}"><td>${money(r.p)} <small>${r.lab}</small></td><td class="n">${fmtD(r.d)}</td><td class="n">${money(r.uc)}</td><td class="n ${r.pr<0?'bad':r===best?'good':''}">${money(r.pr)}</td></tr>`).join('')}</table>
    <p class="small muted" style="margin-top:4px">В месяц. Себестоимость — при том выпуске, который купят по этой цене: больше продаёте — дешевле каждая машина (детали оптом, опыт рабочих).</p>`;}
function vModels(){
  const s=G,ord={prod:0,sale:1,dev:2,off:3},many=s.models.filter(m=>m.status!=='off').length>1;
  const cards=s.models.slice().sort((a,b)=>ord[a.status]-ord[b.status]||b.id-a.id).map(md=>{
    const g=segOf(md),uc=unitCost(md,s),ref=refPrice(md,s),net=md.price*(1-DEALER_MARGIN),C=classCompare(md,s,s.country),TT=techTone(md,s);
    const pill=md.status==='sale'?`<span class="pill warn">Распродажа · ${fmtN(md.stock)} шт.</span>`:md.status==='prod'?'<span class="pill good">В продаже</span>':md.status==='dev'?`<span class="pill warn">Разработка · ${md.devLeft} мес.</span>`:'<span class="pill muted">Снята</span>';
    const margin=net-uc,enter=md.fresh?' enter':'';md.fresh=0;const key='md'+md.id,open=isOpen(key,!many||md.status==='dev');
    let el='';if(md.status==='prod'&&open)el=priceTable(md,s);
    const ctl=md.status!=='off'&&md.status!=='dev'?`<div class="row ctl" style="margin-top:10px"><div><span class="label">Цена</span><p class="small muted">типичная для такой машины ≈ <span class="num">${money(ref)}</span></p></div><div class="step"><button data-act="price" data-id="${md.id}" data-d="-1" aria-label="Снизить цену">−</button><span>${money(md.price)}</span><button data-act="price" data-id="${md.id}" data-d="1" aria-label="Поднять цену">+</button></div></div>${el}`:'';
    const cmpRows=CHAR_K.filter(k=>C.W[k]>0).map(k=>{const r=C.by[k],tone=r>=1.05?'good':r<0.95?'bad':'muted';return `<div class="cmp-row"><span>${CHAR_NAMES[k]}<small>${wDots(C.W[k])}</small></span><div class="cmp-bar"><i style="width:${Math.min(100,r/2*100)}%;background:var(--${tone==='muted'?'line':tone})"></i><b></b></div><span class="num ${tone}">${Math.round(r*100)}%</span></div>`;}).join('');
    // заголовок: картинка, название (цвет — как машина против соперников), класс, итог месяца
    const sub=md.status==='prod'?`спрос ${fmtD(md.lastDem||0)} · продано ${fmtN(md.lastSold||0)} · маржа ${money(margin)}`:md.status==='dev'?`в разработке ещё ${md.devLeft} мес.`:md.status==='sale'?`на складе ${fmtN(md.stock)}`:`всего продано ${fmtN(md.totalSold)}`;
    const head=`<span class="mh"><span class="mthumb">${carArt(md,{thumb:1})}</span><span class="mt"><b class="${TT.tone}">${esc(md.name)}</b><small>${esc(KIND_NAME[rivalKind(md)])} · ${Math.round(TT.r*100)}% соперника</small><small>${sub}</small></span></span>${pill}`;
    const body=open?`
      ${ctl}
      <div class="meta"><div>Спрос<b>${md.status==='prod'?fmtD(md.lastDem):'—'}</b></div><div>Продано<b>${md.status==='prod'?fmtN(md.lastSold):'—'}</b></div><div>Себест.<b>${money(uc)}</b></div><div>Маржа<b class="${margin<0?'bad':''}">${money(margin)}</b></div></div>
      ${lostLine(md)}${truckHint(md,s)}${costHTML(md,s)}${stockWarn(md)?'<p class="small warn" style="margin-top:6px">Машины копятся на складе и дешевеют: снизьте выпуск или цену.</p>':''}
      <div class="carbox${enter}">${carArt(md,{anim:md.status==='prod'})}</div>
      ${qbar(C.S,'Против соперника: '+C.ref.name)}
      ${fold('cmp'+md.id,'Что ценят покупатели',`<div>${cmpRows}</div><p class="small muted" style="margin-top:6px">●●● — главное для покупателей класса. 100% — как у соперника. Улучшения в КБ поднимают эти цифры у всех ваших машин.</p>`,false)}
      <p class="spec">${specLine(md,s)}</p>
      ${(md.raceBoost||0)>mi(s)?'<p class="small good" style="margin-top:6px">Слава гоночной победы: покупатели выбирают вас охотнее</p>':''}
      ${overpower(md)?'<p class="small bad" style="margin-top:6px">Мотор слишком мощный для рамы: поломки бьют по репутации.</p>':''}
      <div class="row small muted" style="margin-top:10px"><span>Всего продано</span><span class="num">${md.totalSold.toLocaleString('ru-RU')}</span></div>
      ${md.status==='prod'?`<div class="btns" style="margin-top:12px"><button class="btn" data-act="retire" data-id="${md.id}">Снять с производства</button></div>`:''}
      ${md.status==='sale'?`<div class="btns" style="margin-top:12px"><button class="btn" data-act="saleNow" data-id="${md.id}">Отдать остаток перекупщикам (−50%)</button></div>`:''}
      ${md.status==='off'?`<div class="btns" style="margin-top:12px"><button class="btn" data-act="revive" data-id="${md.id}">Вернуть в производство</button></div>`:''}`:ctl;
    return `<article class="card mcard${open?'':' folded'}"><button class="card-h" data-act="fold" data-k="${key}" data-def="${!many||md.status==='dev'?1:0}" aria-expanded="${open}">${head}<i>${open?'▴':'▾'}</i></button>${body}</article>`;}).join('');
  return `${advisorCard(s,'models')}${ordersCard(s)}${planCard(s)}${rdCardHTML(s)}<button class="btn primary block" data-act="design">+ Новая модель</button><p class="small muted" style="padding:0 4px">Похожие модели одной марки отбирают покупателей друг у друга: выгоднее разные машины для разных классов, чем несколько одинаковых. Нажмите на модель, чтобы развернуть или свернуть описание.</p>${cards}`;
}
function techRows(arr,s,extra){return arr.map(x=>`<div class="tech ${x.y<=s.y?'':'off'}"><span class="num">${x.y<=1895?'—':x.y}</span><span>${x.name}</span><span class="num">${extra(x)}</span></div>`).join('');}
// Сколько продавали бы ваши модели в стране при полной сети дилеров
function marketPotential(s,c){const act=s.models.filter(m=>m.status==='prod');if(!act.length)return 0;const R=mkCountry(c,s,act,null,null,1);return act.reduce((a,m)=>a+(R.by[m.id]||0),0)*(techLv(s,'credit')?1.15:1);}
function topIncome(inc,p){return inc.xT*Math.pow(p/INC_TOP,-1/inc.al);}
// Грузовые машины: главный соперник — лошадь. Сколько фирм в месяц выбирают транспорт и что берут
function horseSplit(s,c,M,R0){const TZ=M&&M.segs&&M.segs.truck,pool=(M&&M.tpool)||(R0||mkCountry(c,s,[])).segs.truck.pool||0;if(pool<=0)return null;
  const you=TZ?TZ.you:0,riv=TZ?Math.max(0,TZ.size-TZ.you):(R0||mkCountry(c,s,[])).segs.truck.inc;return {pool,you,riv,horse:Math.max(0,pool-riv-you)};}
function horseHTML(s,c,M,R0){if(s.y<1896)return '';const h=horseSplit(s,c,M,R0);if(!h)return '';const w=x=>Math.max(0,Math.min(100,x/h.pool*100)),pp=x=>pct(x/h.pool,x/h.pool<0.1?1:0);
  return `<div style="margin-top:14px"><div class="row small"><span class="label">🐴 Лошадь или мотор</span><span class="muted">фирм в месяц ≈ ${fmtD(h.pool)}</span></div>
    <div class="hbar" style="margin-top:6px"><i style="width:${w(h.horse)}%;background:#9a7448"></i><i style="width:${w(h.riv)}%;background:#6f8aa6"></i><i style="width:${w(h.you)}%;background:var(--brass)"></i></div>
    <div class="hleg small"><span><i style="background:#9a7448"></i>лошадь ${pp(h.horse)}</span><span><i style="background:#6f8aa6"></i>моторы конкурентов ${pp(h.riv)}</span><span><i style="background:var(--brass)"></i>ваши ${pp(h.you)}</span></div>
    <p class="small muted" style="margin-top:6px">Лавки, пивоварни, почта и стройки каждый месяц покупают транспорт. Мотор берут, когда он выгоднее лошади: надёжный, экономичный и недорогой за тонну груза. Хороший дешёвый фургон или грузовик уводит покупателей не только у конкурентов, но и у лошадей.</p></div>`;}
function vMarket(){
  const s=G,home=s.country,e=econ(s.y,s.m,home),L=s.last,M=L&&L.mk[home],R0=mkCountry(home,s,[]),H=R0.H,inc=R0.inc,fleet=fleetOf(s,home),K=affordK(home,s);
  const segRows=SEGK.filter(g=>g!=='sport'||s.y>=1910).map(g=>{const z=M&&M.segs?M.segs[g].size:R0.segs[g].inc,you=M&&M.segs?M.segs[g].you:0;return `<tr><td>${SEG[g].name}</td><td class="n">${fmtD(z)}</td><td class="n">${M?fmtD(you):'—'}</td><td class="n">${M&&z>0?pct(you/z,1):'—'}</td><td class="n">${money(prefP(g,home,s))}</td></tr>`;}).join('');
  const afford=CARSEG.filter(g=>g!=='sport'||s.y>=1910).map(g=>{const P=prefP(g,home,s),n=canAfford(home,s,P),sh=n/H;return `<tr><td>${SEG[g].name} <small>≈ ${money(P)}</small></td><td class="n">${fmtN(n)}</td><td class="n">${pct(sh,sh<0.01?2:1)}</td></tr>`;}).join('');
  const top=s.models.filter(m=>m.status==='prod').sort((a,b)=>b.lastSold-a.lastSold)[0],full=(s.homePrev||0)>0||(s.comps[home]||[]).some(o=>(o.prev||0)>0);
  // продажи за прошлый год (в первый год — с начала года) и перемена к позапрошлому
  const val=o=>full?(o.prev||0):(o.yr||0),tr=o=>full&&(o.prev2||0)>0?o.prev/o.prev2-1:null;
  const rows=[{name:s.company,color:'var(--brass)',sales:full?(s.homePrev||0):(s.homeY||0),trend:full&&(s.homePrev2||0)>0?s.homePrev/s.homePrev2-1:null,you:1,model:top?top.name:''},...(COMPS[home]||[]).map((cp,i)=>({cp,i})).filter(o=>o.cp.pk!==s.pioneer&&compAlive(o.cp,s)).map(o=>{const m=compModel(o.cp,s),st=(s.comps[home]||[])[o.i]||{};return {name:compName(o.cp,s),color:st.color||'#888',sales:val(st),trend:tr(st),model:m?m[1]:'',img:m&&m[2]};})].sort((a,b)=>b.sales-a.sales);
  const place=rows.findIndex(r=>r.you)+1,shown=rows.slice(0,10);if(place>10)shown.push(rows[place-1]);
  const mx=Math.max(1,...rows.map(r=>r.sales)),arrow=t=>t===null?'':t>0.05?`<small class="good">▲${Math.round(t*100)}%</small>`:t<-0.05?`<small class="bad">▼${Math.round(-t*100)}%</small>`:'<small class="muted">≈</small>';
  const comp=shown.map(r=>`<div class="comp ${r.you?'you':''}">${r.img&&IMG[r.img]?`<img class="thumb" src="${IMG[r.img].src}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span class="dot" style="background:${r.color}"></span>`}<span>${esc(r.name)}${r.model?`<small>${esc(r.model)}</small>`:''}</span><div class="bar"><i style="width:${r.sales/mx*100}%;background:${r.color}"></i></div><span class="num" style="text-align:right">${fmtN(r.sales)}${arrow(r.trend)}</span></div>`).join('');
  const rvT=SEGK.map(g=>{const v=rivalBoost(s,home,g);return v>0.05?`${SEG[g].name.toLowerCase()} +${Math.round((Math.exp(v)-1)*100)}%`:'';}).filter(Boolean).join(', ');
  const dc=dealerCost(s),netRow=c=>{const d=dealerCount(s,c),need=Math.round(dealerNeed(c,s)),mx=dealerMax(s,c),lv=impLv(s,c),IL=impOf(s,c),ec=econ(s.y,s.m,c),mk=L&&L.mk[c],size=mk&&mk.size!=null?mk.size:SEGK.reduce((a,g)=>a+mkCountry(c,s,[]).segs[g].inc,0),tf=c===home?0:tariffAt(c,s)*impTar(s,c),pot=marketPotential(s,c),lost=mk&&mk.lostDlr||0;
    // сколько городов охвачено; сколько машин в месяц продаёт сеть (дилеры растут вместе со спросом — нанимают продавцов)
    const room=dealerRoom(s,c),reach=reachOf(s,c),tp=dealerTPc(s,c),cap=d*tp,short=dealersShort(s,c),gs=room>0?0:dealerGrowSteps(s,c),gc=dealerGrowCost(s,c);
    const add=(n,lab,pri)=>{const k=Math.min(n,room);return k<1?'':`<button class="btn sm${pri?' primary':''}" data-act="dealers" data-c="${c}" data-n="${k}" ${s.cash<k*dc?'disabled':''}>+${fmtN(k)}${lab||''} · ${money(k*dc)}</button>`;};
    const big=Math.max(5,Math.round(mx*0.1/5)*5),nx=IMP_LV[lv+1],nxC=c!==home&&lv<3?impCost(s,c,lv+1):0,nxOk=nx&&(!nx.y||s.y>=nx.y);
    const up=c===home||!nx?'':`<button class="btn sm${lv===0?' primary':''}" data-act="impUp" data-c="${c}" ${!nxOk||s.cash<nxC?'disabled':''}>${lv===0?'Договор с импортёром':lv===1?'Открыть своё отделение':'Построить сборочный завод'} · ${money(nxC)}</button>`;
    const grow=d&&dealerGrowOk(s,c)&&(gs>0||room===0)?`<button class="btn sm${gs>0?' primary':''}" data-act="dealerGrow" data-c="${c}" ${s.cash<gc?'disabled':''}>Салоны дилеров +25% · ${money(gc)}</button>`:'';
    const btns=(d?(short>0?add(short,' — продать всем',1)+(short>=8?add(Math.max(1,Math.round(short/4)),''):''):add(Math.max(1,Math.min(room,Math.round(mx*0.05))),room>1?' в новых городах':'')+(room>big*1.5?add(big):''))+grow:'')+up;
    const lvTxt=c===home?'':lv===0?`<p class="small" style="margin-top:4px">Своих продавцов здесь нет. Первый шаг — <b>импортёр</b>: местная фирма берёт ${Math.round(IMP_LV[1].cut*100)}% цены и продаёт ваши машины через агентов в больших городах${pot>0?`. По прикидке ваши модели брали бы здесь ≈ <b class="num">${fmtD(pot*Math.pow(IMP_LV[1].cap,0.7))}</b> в месяц`:''}.</p>`
      :lv===1?`<p class="small muted" style="margin-top:4px">Импортёр берёт ${Math.round(IL.cut*100)}% цены и торгует только в больших городах (до ${fmtN(mx)} агентов). <b>Своё отделение</b> — как Ford of Britain в 1909 году: без посредника, дилеры по всей стране, содержание ${money(impUpkeep({...s,imp:{...(s.imp||{}),[c]:2}},c))} в месяц.</p>`
      :lv===2?`<p class="small muted" style="margin-top:4px">Своё отделение «${esc(s.company)}». ${s.y>=IMP_LV[3].y?`<b>Сборочный завод</b> — как у Ford в Траффорд-парке (1911): машины собирают из комплектов: пошлина на ${Math.round((1-IMP_LV[3].tar)*100)}% меньше, доставка в ${fmtD(1/IMP_LV[3].ship)} раза дешевле, покупатели считают машины почти своими; содержание ${money(impUpkeep({...s,imp:{...(s.imp||{}),[c]:3}},c))} в месяц.`:'Сборочные заводы за границей появятся с 1904 года.'}</p>`
      :`<p class="small good" style="margin-top:4px">Сборочный завод «${esc(s.company)}»: пошлина на комплекты ${pct(tf,0)}, доставка в ${fmtD(1/IMP_LV[3].ship)} раза дешевле, машины здесь считают почти своими.</p>`;
    return `<div class="net-row"><div class="row"><div><h3>${COUNTRIES[c].name}${c===home?' · дома':''}${c!==home?` <span class="pill ${lv?'good':'muted'}">${IMP_LV[lv].n}</span>`:''}</h3><p class="small muted">Рынок ${fmtD(size)} в месяц · <span class="${ec.tone}">${ec.label}</span>${c!==home?` · пошлина ${Math.round(tf*100)}%`:''}</p></div><span class="num small ${mk&&mk.sold?'good':''}" style="white-space:nowrap">${mk?fmtN(mk.sold||0):0} шт.</span></div>
      ${lvTxt}
      ${d?`${pot>0?`<p class="small" style="margin-top:4px">Будь ваши дилеры во всех городах, ваши модели брали бы ≈ <b class="num">${fmtD(pot)}</b> в месяц · сейчас их видят ${Math.round(reach*100)}% покупателей</p>`:''}
      <div class="row small" style="margin-top:6px"><span class="muted">Дилеров <b class="num">${fmtN(d)}</b> из ${fmtN(mx)} ${plural(mx,'возможного','возможных','возможных')} · вся страна — ${fmtN(need)} ${plural(need,'город','города','городов')}</span><span class="num">${Math.round(reach*100)}%</span></div><div class="bar" style="margin-top:4px"><i style="width:${Math.min(100,reach*100)}%;background:var(--good)"></i></div>
      <p class="small muted" style="margin-top:4px">Сеть продаёт до ${fmtN(cap)} машин в месяц — по ${fmtD(tp)} на дилера${dealerMult(s,c)>1.01?` (салоны больше обычного в ${fmtD(dealerMult(s,c))} раза)`:''}.</p>
      ${lost>0.5?`<p class="small warn" style="margin-top:4px">Дилеры не успели обслужить ≈ ${fmtD(lost)} покупателей. ${short>0?`Откройте дилеров в новых городах — ещё ${fmtN(short)}.`:gs>0?`Все города уже охвачены: расширьте салоны — продавцы, гаражи, запас машин (${fmtN(gs)} ${plural(gs,'шаг','шага','шагов')} по +25%).`:'Сеть работает на пределе эпохи: больше машин здесь сейчас не продать.'}</p>`:''}`:''}
      <div class="btns" style="margin-top:6px">${btns}${d>(c===home?1:2)?`<button class="btn sm" data-act="dealersCut" data-c="${c}">Закрыть 20%</button>`:''}</div></div>`;};
  const abroad=Object.keys(COUNTRIES).filter(c=>c!==home),nAb=abroad.filter(c=>dealerCount(s,c)>0).length;
  const net=netRow(home)+fold('exp','Экспорт: '+(nAb?`дилеры в ${nAb} ${plural(nAb,'стране','странах','странах')}`:'пока нет'),abroad.map(netRow).join(''),nAb>0,'за границей покупатель платит пошлину, а вы — доставку');
  return `${advisorCard(s,'market')}<section class="card"><div class="row"><h2>${COUNTRIES[home].name}</h2><span class="pill ${e.tone}">${e.label}</span></div>
    <div class="meta"><div>Рынок/мес<b>${fmtD(M&&M.size?M.size:SEGK.reduce((a,g)=>a+R0.segs[g].inc,0))}</b></div><div>Ваши<b>${L?fmtN(L.homeSold):'—'}</b></div><div>Доля<b>${L?pct(L.share,1):'—'}</b></div><div>Цены к 1913<b>${Math.round(cpi(s)*100)}%</b></div></div>${home==='us'&&s.y<1905?'<p class="small warn" style="margin-top:8px">Богатых семей в Америке много, но дороги плохи, и машины пока берут неохотно. Во Франции машины уже в моде: откройте там дилеров ниже, пошлина невелика.</p>':''}${home==='it'&&s.y<1905?'<p class="small warn" style="margin-top:8px">Богатых семей в Италии мало, свой рынок крошечный. Продавайте и за границей: во Франции покупателей в разы больше, пошлина — 12%.</p>':''}<div class="hr"></div>
    <table class="pl"><tr><th>Класс</th><th class="n">Рынок</th><th class="n">Вы</th><th class="n">Доля</th><th class="n">Цена</th></tr>${segRows}</table>
    <p class="small muted" style="margin-top:10px">Сколько машин купили в прошлом месяце у всех марок и у вас. Весной и летом покупают охотнее. Класс машины задают кузов и оснащение; цена — типичная для класса. Грузовые машины берут фирмы и ведомства: они сравнивают фургоны и грузовики по цене за тонну груза и надёжности, а лошадь с телегой — их главный соперник.</p>${horseHTML(s,home,M,R0)}</section>
  ${foldCard('buyers',false,'<h2>Покупатели</h2>',`
    <div class="meta"><div>Семей<b>${fmtN(H)}</b></div><div>Доход семьи<b>${money(inc.med)}</b></div><div>Машин на дорогах<b>${fmtN(fleet)}</b></div><div>С машиной<b>${pct(Math.min(1,fleet/H),fleet/H<0.01?2:1)}</b></div></div>
    <p class="small muted" style="margin-top:6px">Доход — у средней семьи за год: половина семей беднее. Богатейшие 1% получают от ${money(topIncome(inc,0.01))} в год.</p>
    <table class="pl" style="margin-top:10px"><tr><th>Машина по карману</th><th class="n">Семей</th><th class="n">Доля</th></tr>${afford}</table>
    <p class="small muted" style="margin-top:8px">Машина по карману, если стоит не больше ${pct(K,0)} годового дохода семьи${K>0.5?' — помогает рассрочка':''}. Каждый месяц к машине присматривается часть семей: новички и владельцы, которые меняют старую. Берут то, что лучше за свои деньги, или ждут. Чем дешевле хорошая машина, тем больше семей может её купить.</p>`,`семей ${fmtN(H)} · с машиной ${pct(Math.min(1,fleet/H),fleet/H<0.01?2:1)}`)}
  ${foldCard('comps',false,`<h2>Конкуренты</h2><span class="pill ${place<=3?'good':'warn'}">вы ${place}-е</span>`,`<p class="small muted" style="margin-top:2px">Реальные марки эпохи и их модели. Продано машин ${full?`за ${s.y-1} год, стрелка — к ${s.y-2} году`:'с начала года'}.</p><div style="margin-top:8px">${comp}</div>
    ${rvT?`<p class="small warn" style="margin-top:8px">Конкуренты отвечают на ваш успех: их машины привлекательнее — ${rvT}. Держите позиции новыми моделями, улучшениями и ценой.</p>`:`<p class="small muted" style="margin-top:8px">Если заберёте у конкурентов много покупателей, они ответят: новыми моделями, ценами и рекламой.</p>`}`,`вы ${place}-е · ${rows.slice(0,3).map(r=>esc(r.name)+' '+fmtN(r.sales)).join(' · ')}`)}
  ${showsCard(s)}
  ${foldCard('dealers',true,'<h2>Дилеры и экспорт</h2>',`<p class="small muted" style="margin-top:2px">Дилер — торговец в своём городе: покупает у вас машины со скидкой ${Math.round(DEALER_MARGIN*100)}%, продаёт их и чинит. Где нет вашего дилера, там машину не купить; больше дилеров, чем городов с покупателями, не бывает. Первые дилеры открываются в больших городах и сразу видят большую часть покупателей. Когда спрос растёт, дилеры сами нанимают продавцов, а к марке, которая хорошо продаётся, новые города просятся сами. Новый дилер — ${money(dc)} (разъездные агенты, вывеска, демонстрационная машина), поддержка ${money(dealerUpkeep(s))} в месяц. За границей сначала нужен импортёр, потом своё отделение и сборочный завод; покупатель там платит пошлину, а вы — доставку ${money(shipCost(s))}.</p><div style="margin-top:6px">${net}</div>`,`дома ${fmtN(dealerCount(s,home))} ${plural(dealerCount(s,home),'дилер','дилера','дилеров')} · покупателей видят ${Math.round(reachOf(s,home)*100)}%${nAb?` · за границей: ${nAb} ${plural(nAb,'страна','страны','стран')}`:''}`)}
  ${DIF().simple&&helperOn(s)?`<section class="card"><div class="row"><h2>Реклама</h2><b class="num">${money(s.ad)}</b></div><p class="small muted" style="margin-top:6px">Рекламой занимается помощник: около 4% выручки.</p></section>`:`  <section class="card"><div class="row"><h2>Реклама</h2><b class="num" id="adVal">${money(s.ad)}</b></div><input type="range" id="ad" min="0" max="${Math.round(adRef(s)*4/10)*10}" step="${Math.max(10,Math.round(adRef(s)/50/10)*10)}" value="${s.ad}" aria-label="Бюджет рекламы в месяц" style="margin-top:10px"><p class="small muted">В месяц. Отдача падает после ${money(adRef(s)*2)}; за границей реклама работает на треть.</p></section>`}
  ${foldCard('graphs',false,'<h2>Графики</h2>',`<div style="margin-top:8px"><span class="label">Объём рынка, машин в месяц</span>${spark(s.hist.market,'var(--muted)')}<div class="hr"></div><span class="label">Ваши продажи, машин в месяц</span>${spark(s.hist.sales,'var(--good)')}<div class="hr"></div><span class="label">Ваша доля дома, %</span>${spark(s.hist.share||[],'var(--brass)')}</div>`,'рынок, ваши продажи и доля по месяцам')}
  ${foldCard('sup',false,'<h2>Технологии поставщиков</h2>',`<p class="small muted" style="margin-top:4px">Какие детали можно купить и когда появятся новые. Серые — в будущем, их можно получить раньше прототипом КБ.</p>
    <div class="label" style="margin-top:6px">Двигатели</div>${techRows(ENGINES,s,x=>x.hp+' л.с.')}<div class="label" style="margin-top:12px">Коробки передач</div>${techRows(GEARBOX,s,x=>'КПД '+Math.round(x.eff*100)+'%')}<div class="label" style="margin-top:12px">Рамы и подвеска</div>${techRows(CHASSIS,s,x=>'до '+Math.round(x.max*bn('chassisTol'))+' л.с.')}<div class="label" style="margin-top:12px">Колёса и шины</div>${techRows(TYRES,s,x=>'сцепл. '+Math.round(x.grip*100))}<div class="label" style="margin-top:12px">Тормоза</div>${techRows(BRAKES,s,x=>'сила '+Math.round(x.brk*100))}<div class="label" style="margin-top:12px">Кузова</div>${techRows(BODIES,s,x=>x.truck?x.pay+' т':x.seats+' мест')}`,'какие детали можно купить и когда появятся новые')}`;
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
  const last=G.papers[G.papers.length-1];
  return `${legacyCard()}${papers?foldCard('papers',false,'<h2>Газетный архив</h2>',papers,last?`${G.papers.length} ${plural(G.papers.length,'выпуск','выпуска','выпусков')} · последний: ${esc(last.title)}`:''):''}
  ${foldCard('ach',false,`<h2>Достижения</h2><span class="num muted">${got}/${ACH.length}</span>`,`<div class="ach">${ACH.map(a=>`<div class="${G.ach[a.id]?'got':''}"><b>${a.name}</b>${a.desc}${G.ach[a.id]?' · '+G.ach[a.id]:''}</div>`).join('')}</div>`,`получено ${got} из ${ACH.length}`)}
  ${foldCard('log',true,'<h2>Хроника</h2>',`<ul class="log" style="margin-top:6px">${G.log.slice().reverse().map(l=>`<li class="${l.kind}"><time>${l.d}</time><p>${esc(l.text)}</p></li>`).join('')}</ul>`,G.log.length?esc(G.log[G.log.length-1].d+': '+G.log[G.log.length-1].text):'')}`;
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
  if(tab==='plant')plantAnim();
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
