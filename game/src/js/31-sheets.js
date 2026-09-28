/* ================= SHEETS ================= */
const sheet=document.getElementById('sheet'),sb=document.getElementById('sheetBody');
function openSheet(html){sb.innerHTML=html;sheet.hidden=false;sb.scrollTop=0;}
function closeSheet(){sheet.hidden=true;draft=null;}
sheet.addEventListener('click',e=>{if(e.target===sheet&&G&&!G.pending.length&&!(draft&&draft.ng&&G.over)&&!(draft&&draft.lock))closeSheet();});
function showEvent(){
  const ev=G.pending[0];
  if(ev.paper){if(PW.hidden||!PW.innerHTML)showPaper({title:ev.title,deck:ev.deck,text:ev.text,img:ev.img,choices:ev.choices,act:'choose',kicker:ev.kicker||(G.over?'Последний выпуск':'Экстренный выпуск')});return;}
  openSheet(`<span class="label">${dstr(G)}</span><h2 style="margin-top:4px">${esc(ev.title)}</h2><p style="margin-top:10px">${esc(ev.text)}</p><div class="stack" style="margin-top:16px">${ev.choices.map((c,i)=>`<button class="btn ${i===0?'primary':''} block" data-act="choose" data-k="${c[1]}">${esc(c[0])}</button>`).join('')}</div>`);
}
const X=`<button class="iconbtn" data-act="close" aria-label="Закрыть">×</button>`;
function bestId(arr,f){const u=unlockedP(arr,G).filter(x=>!f||f(x)).sort((a,b)=>a.y-b.y);return u[u.length-1].id;}
function openDesigner(){draft={name:'Тип '+(G.models.length+1),e:bestId(ENGINES),c:bestId(CHASSIS),b:bestId(BODIES,x=>!x.truck),w:bestId(TYRES),t:G.y>=1908?'t0':'t1',paint:PAINTS[G.models.length%PAINTS.length].id};renderDesigner();}
function renderDesigner(){
  const s=G,d=draft,md={...d,made:0,vol:Math.max(20,(s.last&&s.last.made)||20),launched:mi(s),status:'prod',price:0},p=parts(md),r=modelR(md,s),g=segOf(md),mx=chassisMax(p.c);
  const uc=unitCost(md,s),ref=refPrice(md,s),dc=devCost(md,s),dm=devMonths(md),tc=toolingCost(md,s),st=carStats(md,0,s.y),hrs=hoursPerCar(md,s),net=ref*(1-DEALER_MARGIN);
  md.price=ref;const dem=segMarket(s.country,g,s,[md]).you;
  const chips=(arr,k,sub)=>`<div class="chips">${unlockedP(arr,s).map(x=>`<button class="chip ${d[k]===x.id?'on':''}" data-act="pick" data-k="${k}" data-v="${x.id}">${x.name}${upgL(x.id)?' ★'+upgL(x.id):''}${x.y>s.y?' 🔬':''}<small>${sub(x)}</small></button>`).join('')}</div>`;
  const hpPct=Math.min(100,engineHp(p.e)/mx*100),rf=refCar(md,s),pc=x=>money(partCost(x,s));
  openSheet(`<div class="row"><h2>Новая модель</h2>${X}</div>
    <div class="carbox">${carSVG(md,{anim:true})}</div>${rf&&IMG[rf[1]]?photoHTML(rf[1])+`<p class="small muted" style="margin-top:4px">Такие машины сейчас в моде: ${esc(rf[1])}</p>`:''}
    <div class="row" style="margin-top:8px"><span class="pill warn">${SEG[g].name} сегмент</span><div class="btns">${PAINTS.map(c=>`<button class="swatch ${d.paint===c.id?'on':''}" style="background:${c.id}" data-act="pick" data-k="paint" data-v="${c.id}" aria-label="${c.name}"></button>`).join('')}</div></div>
    <label class="label" for="mname" style="display:block;margin-top:12px">Название</label><input type="text" id="mname" value="${esc(d.name)}" maxlength="24" style="margin-top:6px">
    <div class="label" style="margin-top:14px">Двигатель</div>${chips(ENGINES,'e',x=>`${x.hp} л.с. · ${x.kg} кг · ${pc(x)}`)}<p class="small muted" style="margin-top:6px">${esc(p.e.note||'')}</p>
    <div class="label" style="margin-top:14px">Рама</div>${chips(CHASSIS,'c',x=>`до ${Math.round(chassisMax(x))} л.с. · тормоза ${Math.round(x.brk*100)} · ${pc(x)}`)}
    <div class="label" style="margin-top:14px">Кузов</div>${chips(BODIES,'b',x=>`${x.truck?'грузовой':'кач. '+x.q} · ${x.kg} кг · ${pc(x)}`)}
    <div class="label" style="margin-top:14px">Шины</div>${chips(TYRES,'w',x=>`сцепление ${Math.round(x.grip*100*(1+0.08*upgL(x.id)))} · ${pc(x)}`)}<p class="small muted" style="margin-top:6px">${esc(p.w.note||'')}</p>
    <div class="label" style="margin-top:14px">Оснащение</div>${chips(TRIMS,'t',x=>`+${x.q} кач. · ${money(x.c*cpi(s))}`)}
    <div class="card" style="margin-top:16px;background:var(--panel2)">
      <div class="row small"><span class="muted">Нагрузка на раму</span><span class="num ${overpower(md)?'bad':''}">${Math.round(engineHp(p.e))} / ${Math.round(mx)} л.с.</span></div>
      <div class="bar" style="margin-top:6px"><i style="width:${hpPct}%;background:var(--${overpower(md)?'bad':hpPct>80?'warn':'good'})"></i></div>
      ${overpower(md)?'<p class="small bad" style="margin-top:6px">Рама не выдержит: качество −40% и удар по репутации.</p>':''}${qbar(r)}
      <div class="row small" style="margin-top:10px"><span class="muted">На ходу</span><span class="num">${statsLine(st)}</span></div>
      <div class="meta"><div>Себест.<b>${money(uc)}</b></div><div>Цена ≈<b>${money(ref)}</b></div><div>Маржа<b class="${net-uc<0?'bad':''}">${money(net-uc)}</b></div><div>Спрос ≈<b>${fmtN(dem)}/мес</b></div></div>
      <div class="meta"><div>Часов<b>${fmtN(Math.round(hrs))}</b></div><div>Разработка<b>${dm} мес.</b></div><div>Бюджет<b>${money(dc)}</b></div><div>Оснастка<b>${money(tc)}</b></div></div>
      <p class="small muted" style="margin-top:8px">Себестоимость — детали и работа на заводе при нынешних технологиях; с ростом выпуска она падает. Оснастку оплатите при запуске в серию${techLv(s,'line')===2?': конвейер под новую модель перестраивать дорого':''}.</p></div>
    <button class="btn primary block" style="margin-top:14px" data-act="startdev" ${s.cash<dc?'disabled':''}>${s.cash<dc?'Не хватает денег на разработку':'Начать разработку · '+money(dc)}</button>`);
  document.getElementById('mname').addEventListener('input',e=>{draft.name=e.target.value;});
}
function openRD(){
  const s=G,L=rdProjects(s),pts=rdPoints(s);
  const item=pj=>`<div class="race-item"><div class="row"><div><span class="mo">${pj.cat} · ${pj.kind==='upg'?'улучшение ★'+pj.lvl:'прототип на '+pj.yrs+' г. раньше'}</span><h3 style="margin-top:2px">${esc(pj.name)}</h3></div><button class="btn sm" data-act="rdStart" data-k="${pj.kind}:${pj.id}">~${Math.ceil(pj.need/pts)} мес.</button></div>
    <p class="small muted" style="margin-top:4px">${pj.kind==='upg'?(pj.cat==='Двигатель'?'+12% к качеству и +10% к мощности':pj.cat==='Рама'?'+12% к качеству, +15% к допустимой мощности, рама легче':pj.cat==='Шины'?'+12% к качеству, +8% сцепления и −12% износа в гонках':'+12% к качеству кузова'):'Деталь станет доступна только вам. Запустите её в серию раньше истории — это первенство в зачёт наследия'}</p></div>`;
  openSheet(`<div class="row"><h2>Проекты КБ</h2>${X}</div>
    <p class="small muted" style="margin-top:6px">Бюро ${s.rd.lvl}-го уровня делает ${pts} очк. в месяц. Чем выше уровень, тем дальше в будущее можно заглянуть с прототипами.${s.rd.proj?' Смена проекта обнулит прогресс текущего.':''}</p>
    <div style="margin-top:6px">${L.map(item).join('')||'<p class="small muted">Все доступные детали улучшены до предела.</p>'}</div>`);
}
function openNewGame(){
  const prev=draft&&draft.ng?draft:null;
  draft={ng:true,lock:!G,pioneer:prev?prev.pioneer:'ford',country:prev?prev.country:'us',company:prev?prev.company:PIONEERS.ford.co,diff:prev?prev.diff:'normal'};
  const list=Object.entries(PIONEERS).map(([k,P])=>`<button class="pion ${draft.pioneer===k?'on':''}" data-act="pion" data-v="${k}">${portraitHTML(k)}<div><h3>${P.name}</h3><div class="yrs">${P.yrs?P.yrs+' · ':''}${COUNTRIES[P.c].name}</div><p>${P.bio}</p><div class="bon">${P.plus.map(x=>`<span class="p">${x}</span>`).join('')}${P.minus.map(x=>`<span class="m">${x}</span>`).join('')}</div></div></button>`).join('');
  openSheet(`<div class="row"><h2>Новая игра</h2>${G?X:'<button class="iconbtn" data-act="toMenu" aria-label="В главное меню">×</button>'}</div>
    <p class="small muted" style="margin-top:6px">Январь 1895 года. Цель — создать величайшую автоимперию эпохи. В 1930 году вашу компанию сравнят с реальными — Ford, General Motors, Citroën, FIAT, Bugatti, Rolls-Royce — по масштабу, рынку, изобретениям, победам, капиталу и имени.</p>
    <div class="label" style="margin-top:14px">Кто вы?</div><div class="stack" style="margin-top:8px;gap:8px">${list}</div>
    <label class="label" for="cname" style="display:block;margin-top:16px">Название компании</label><input type="text" id="cname" value="${esc(draft.company)}" maxlength="28" style="margin-top:6px">
    <div class="label" style="margin-top:14px">Страна</div>
    <div class="country" style="margin-top:6px">${Object.entries(COUNTRIES).map(([k,c])=>`<button class="chip ${draft.country===k?'on':''}" data-act="country" data-v="${k}">${c.name}<small>${c.city} · ${money(c.cash)} · гоночный цвет — ${c.raceName}</small><small>${c.note}</small></button>`).join('')}</div>
    <div class="label" style="margin-top:14px">Сложность</div>
    <div class="country" style="margin-top:6px">${Object.entries(DIFFS).map(([k,d])=>`<button class="chip ${draft.diff===k?'on':''}" data-act="diff" data-v="${k}">${d.name}<small>${d.desc}</small></button>`).join('')}</div>
    <button class="btn primary block" style="margin-top:16px" data-act="startgame">Основать компанию</button>`);
  document.getElementById('cname').addEventListener('input',e=>{draft.company=e.target.value;});
}
function openMenuSheet(){
  openSheet(`<div class="row"><h2>Меню</h2>${X}</div>
    <p class="small muted" style="margin-top:4px">«${esc(G.company)}» · ${dstr(G)} · игра сохраняется сама каждый месяц.</p>
    <div class="stack" style="margin-top:12px">
      <button class="btn block" data-act="saveOpen">Сохранить в слот</button>
      <button class="btn block" data-act="loadOpen">Загрузить</button>
      <button class="btn block" data-act="legacyInfo">Цель и наследие</button>
      <button class="btn block" data-act="help">Как играть</button>
      <button class="btn block" data-act="settings">Звук и управление</button>
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
  openSheet(`<div class="row"><h2>Звук и управление</h2>${X}</div>
    <div class="label" style="margin-top:12px">Звук</div><div class="btns" style="margin-top:6px"><button class="btn ${AU.on.music?'primary':''}" data-act="audio" data-k="music">Музыка: ${AU.on.music?'вкл':'выкл'}</button><button class="btn ${AU.on.sfx?'primary':''}" data-act="audio" data-k="sfx">Звуки: ${AU.on.sfx?'вкл':'выкл'}</button><button class="btn ${AU.on.race?'primary':''}" data-act="audio" data-k="race">Музыка в гонке: ${AU.on.race?'вкл':'выкл'}</button><button class="btn" data-act="plMode">Плейлист: ${AU.on.mode==='all'?'все годы':'эпоха'}</button></div>
    <div class="label" style="margin-top:14px">Руль в гонке</div><div class="btns" style="margin-top:6px"><button class="btn ${!AU.on.tilt?'primary':''}" data-act="ctlTilt" data-v="0">Кнопки ◀ ▶</button><button class="btn ${AU.on.tilt?'primary':''}" data-act="ctlTilt" data-v="1">Наклон телефона</button></div>
    <div class="hr"></div><h3>Музыка</h3><p class="small muted" style="margin-top:4px">Настоящие записи эпохи из общественного достояния (Wikimedia Commons). Без интернета звучит «Оркестрион».${AU.nowPlaying?` Сейчас: <a class="credit" style="display:inline;padding:0" href="${AU.nowPlaying.page}" target="_blank" rel="noopener">${esc(AU.nowPlaying.title)}</a>`:''}</p>
    <div class="hr"></div><h3>Фотографии</h3><p class="small muted" style="margin-top:4px">Исторические фото — Википедия и Wikimedia Commons (в основном общественное достояние). Авторы и лицензии — на странице каждого файла.</p>
    <div class="small" style="margin-top:6px;columns:2;column-gap:12px">${Object.entries(IMG).filter((e,i,a)=>a.findIndex(x=>x[1].file===e[1].file)===i).map(([t,im])=>`<a class="credit" style="padding:2px 0" href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(im.file)}" target="_blank" rel="noopener">${esc(t)}</a>`).join('')||'<span class="muted">пока не загружены</span>'}</div>`);
}
function openHelp(){
  openSheet(`<div class="row"><h2>Как играть</h2>${X}</div>
  <div class="stack small" style="margin-top:12px">
    <p>Один ход — один месяц, с января 1895 до конца 1929 года. ▶ включает автоигру, она останавливается на событиях.</p>
    <p><b>Рынок.</b> Сколько машин покупают в стране, взято из истории: в 1895 году — сотни, в 1929 в США — четыре с половиной миллиона. Ваши машины отбирают покупателей у конкурентов; дешёвая и хорошая машина приводит и новых покупателей, но рынок не бесконечен. Похожие модели одной марки мешают друг другу.</p>
    <p><b>Модели.</b> Собирайте машину из деталей эпохи. Покупатель сравнивает её с ровесницами: слабый мотор или устаревшие шины не спасёт никакая цена. Для каждой модели видно, как спрос ответит на изменение цены.</p>
    <p><b>Производство.</b> Задайте план выпуска или доверьте его прогнозу. Лишние машины лежат на складе и дешевеют, нехватка — это очереди и потерянные покупатели. Мощность — цеха и смены; выработку поднимают станки, электрификация, взаимозаменяемые детали, конвейер и зарплата.</p>
    <p><b>Дилеры.</b> Продают машины за ${Math.round(DEALER_MARGIN*100)}% цены. Чем плотнее сеть, тем охотнее покупают. За границей покупатель платит пошлину.</p>
    <p><b>КБ.</b> Улучшает детали (★) и строит прототипы будущих деталей. С 3-го уровня открывает технологии завода раньше истории — это «первенства».</p>
    <p><b>Гонки.</b> Сезоны и чемпионаты своего времени: до 1925 года очки марок считают газеты, в 1925–1927 разыгрывается первый чемпионат мира AIACR, в Америке — чемпионат AAA. Команда до трёх машин: одну можно вести самому, остальные ведут гонщики по контракту или приглашённые на одну гонку. Гонку можно пройти за рулём, руководить командой или сразу узнать итог. Характеристики машины считаются из деталей: вес, мощность, кузов, тормоза, шины. Шины, топливо и мотор расходуются, машины ломаются. Гоночный отдел даёт заводской гоночный кузов, надёжность и быстрые пит-стопы.</p>
    <p><b>Цель.</b> Величайшая автоимперия эпохи: в 1930 году компанию сравнят с реальными по шести направлениям наследия. Долг свыше ${money(DIF().debt*cpi(G))} — банкротство. Сложность: ${DIF().name}.</p></div>`);
}
function openLegacyInfo(){
  const t=legacyTable(G);
  openSheet(`<div class="row"><h2>Цель и наследие</h2>${X}</div>
    <p class="small" style="margin-top:8px">В 1930 году «${esc(G.company)}» встанет в один ряд с реальными компаниями эпохи. Очки наследия:</p>
    <div class="stack small" style="margin-top:8px">
      <p><b>Масштаб</b> — лучший год по выпуску. Ford в 1923 году — 2 млн машин.</p>
      <p><b>Рынок</b> — лучшая доля дома и заметные доли за границей. FIAT держал около 80% Италии.</p>
      <p><b>Инновации</b> — первенства (раньше, чем в истории) и внедрённые технологии.</p>
      <p><b>Спорт</b> — победы в больших гонках и титулы. Bugatti Type 35 выиграла сотни гонок.</p>
      <p><b>Капитал</b> — стоимость компании. General Motors в 1929 году — около $4 млрд.</p>
      <p><b>Бренд</b> — репутация и легендарные модели (миллион проданных или десять лет на конвейере).</p></div>
    <table class="pl" style="margin-top:12px"><tr><th></th><th>Компания</th><th class="n">Очки</th></tr>${t.rows.map((r,i)=>`<tr class="${r.you?'you':''}"><td>${i+1}.</td><td>${esc(r.n)}${r.you?' — вы':''}</td><td class="n">${Math.round(r.L.total)}</td></tr>`).join('')}</table>
    <p class="small muted" style="margin-top:8px">Выпуск реальных компаний — по отраслевым сводкам 1929 года; накопленный выпуск и стоимость — оценки.</p>`);
}
function openFinal(){
  const s=G,t=legacyTable(s),[title,sub]=legacyTitle(t);
  const rows=t.rows.map((r,i)=>`<tr class="${r.you?'you':''}"><td>${i+1}.</td><td>${esc(r.n)}<small>${r.you?'ваша компания':esc(r.note||'')}</small></td><td class="n">${fmtN(r.p29)}</td><td class="n">${Math.round(r.L.total)}</td></tr>`).join('');
  openSheet(`<span class="label">Итоги эпохи · 1895–${s.y-1}</span><h2 style="margin-top:4px">${esc(title)}</h2><p class="small" style="margin-top:6px">${esc(sub)}</p>
    <div class="kpis" style="margin-top:10px"><div class="kpi"><span class="label">Место</span><b>${t.place}/${t.rows.length}</b></div><div class="kpi"><span class="label">Наследие</span><b>${Math.round(t.me.total)}</b></div><div class="kpi"><span class="label">Продано</span><b>${fmtN(totalSold(s))}</b></div></div>
    <div style="margin-top:10px">${Object.keys(LEG_NAMES).map(k=>`<div class="leg-row"><span>${LEG_NAMES[k]}</span><div class="bar"><i style="width:${Math.min(100,t.me[k]/400*100)}%;background:var(--brass)"></i></div><b class="num">${Math.round(t.me[k])}</b></div>`).join('')}</div>
    <table class="pl final" style="margin-top:12px"><tr><th></th><th>Компания</th><th class="n">Лучший год</th><th class="n">Очки</th></tr>${rows}</table>
    <div class="stack" style="margin-top:14px"><button class="btn primary block" data-act="newgame">Новая игра</button><button class="btn block" data-act="fame">Зал славы</button><button class="btn block" data-act="toMenu">Главное меню</button></div>`);
}
function openFame(){
  const L=fameList();
  openSheet(`<div class="row"><h2>Зал славы</h2>${G?X:'<button class="iconbtn" data-act="toMenu" aria-label="Назад">×</button>'}</div>
    ${L.length?`<table class="pl" style="margin-top:10px"><tr><th></th><th>Компания</th><th class="n">Очки</th></tr>${L.map((e,i)=>`<tr><td>${i+1}.</td><td>${esc(e.company)}<small>${esc(e.title)} · ${e.place}-е место · ${COUNTRIES[e.country]?COUNTRIES[e.country].name:''} · ${DIFFS[e.diff]?DIFFS[e.diff].name:''}${e.bankrupt?' · банкротство':''}</small></td><td class="n">${e.score}</td></tr>`).join('')}</table>`:'<p class="small muted" style="margin-top:10px">Здесь появятся ваши завершённые партии — с местом среди реальных компаний эпохи.</p>'}`);
}
