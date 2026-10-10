/* ================= RACE SETUP: team of up to 3 cars, drivers, preparation, mode ================= */
const RACE_ACT={};
let RS=null;   // заявка на гонку: {key, entries:[{drv,car,prep,tyre,gear}], open, mode, more}
const MAX_ENTRIES=3;
function raceCarsFor(s){return s.models.filter(m=>m.status==='prod');}
function raceRank(md,rc){const st=carStats(md,2,rc.y);return st.vmax*(0.55+0.45*st.rel)/(1+st.acc/60);}
function prepAllowed(p,s,rc,md){return p<2||((s.rdept||0)>=1&&!(md&&isTruck(md)));}
function defaultEntry(s,rc,taken){
  const racer=pioRacer(s),cars=raceCarsFor(s).sort((a,b)=>raceRank(b,rc)-raceRank(a,rc)),free=(racer?['me',...(s.drivers||[])]:[...(s.drivers||[]),'me']).filter(d=>!taken.includes(d)&&!drvOut(s,d)),cfg=trackCfg(rc);
  // свободных своих пилотов нет — предложить лучшего свободного гонщика на одну гонку
  // 0.22: хозяин сам не гонщик (Бенц, Пежо, Форд) — сначала пилот команды или приглашённый, «сам» — в последнюю очередь
  {const d=availDrivers(s).filter(x=>!taken.includes(x.id)).sort((a,b)=>b.sk-a.sk)[0];if(d&&(!free.length||!racer&&free[0]==='me'&&d.sk>pioSk(s)+0.1&&s.cash>driverRaceFee(d,s)*4))free.unshift(d.id);}
  return {drv:free[0]||null,car:cars[0]?cars[0].id:null,prep:(s.rdept||0)>=1&&!['rally','endurance'].includes(rc.t)?2:1,tyre:rc.km>600&&!cfg.pits?'hard':'soft',gear:['oval','sprint'].includes(rc.t)?1:rc.t==='hill'?-1:0};
}
function drvObj(id){return id&&id!=='me'?DRIVERS.find(d=>d.id===id):null;}
function entryCost(rc,e,s){const d=drvObj(e.drv),hire=d&&!(s.drivers||[]).includes(d.id)?driverRaceFee(d,s):0,fee=raceFee(rc),prep=prepCost(rc,e.prep,s);return {fee,prep,hire,total:fee+prep+hire};}
function setupTotal(rc,s){return RS.entries.reduce((a,e)=>{const c=entryCost(rc,e,s);a.fee+=c.fee;a.prep+=c.prep;a.hire+=c.hire;a.total+=c.total;return a;},{fee:0,prep:0,hire:0,total:0});}
// Оценка шанса доехать до финиша: та же модель отказов, что и в гонке
function finishChance(st,rc,s){const dnf=dnfTarget(rc.y,rc.t)*(rc.dnfK||1),rel=clamp(st.rel*(RDEPT[s.rdept||0].rel||1)*kitK(s,'trel'),0.3,0.995);return clamp(Math.pow(1-dnf,Math.pow((1-rel)/fieldRelRef(rc,s),1.6)*1.1),0.05,0.99);}
function tyreLife(md,rc,e){const p=parts(md),cfg=trackCfg(rc),tr=TERR[cfg.terr]||TERR.dirt;return Math.round(p.w.life*(tr.tyre||1)*(1+0.1*upgOf(md,p.w.id))/(e.tyre==='soft'?1.25:0.8));}
function brakeName(b){return b<0.5?'ленточные, слабые':b<0.6?'барабаны на задних колёсах':b<0.8?'на все четыре колеса':'гидравлика или сервоусилитель';}
function openRaceSetup(key){
  const s=G,rc=raceByKey(key);if(!rc||R)return;
  if(!raceCarsFor(s).length){toast('Нет машин в производстве');return;}
  // пока игрок выбирает машины и пилотов — фото-материалы гонки уже грузятся
  try{texPrefetch();}catch(_){}
  if(!RS||RS.key!==key)RS={key,entries:[defaultEntry(s,rc,[])],open:0,mode:'drive',more:false};
  renderRaceSetup();
}
function renderRaceSetup(keepScroll){
  const s=G,rc=raceByKey(RS.key),cfg=trackCfg(rc),cars=raceCarsFor(s),n=RS.entries.length,top=keepScroll?sb.scrollTop:0;
  RS.entries.forEach(e=>{if(!cars.some(m=>m.id===e.car))e.car=cars[0].id;if(!prepAllowed(e.prep,s,rc,cars.find(m=>m.id===e.car)))e.prep=1;});
  // хозяин в больнице: пилотов команды не трогаем, а «Еду сам» — ведёте машину №1 вместо её пилота
  RS.entries.forEach(e=>{if(e.drv&&drvOut(s,e.drv))e.drv=null;});
  const meSick=meOut(s),hasMe=RS.entries.some(e=>e.drv==='me')||((meSick||!pioRacer(s))&&RS.entries.some(e=>e.drv));if(!hasMe&&RS.mode==='drive')RS.mode='manage';
  const tot=setupTotal(rc,s),missing=RS.entries.findIndex(e=>!e.drv),champs=raceChamps(rc).map(id=>CHAMPS[id].name(rc.y));
  const gb=GBC_IDS.includes(rc.id),maxE=rc.match?1:MAX_ENTRIES;
  const entryHTML=(e,i)=>{
    const md=cars.find(m=>m.id===e.car),st=carStats(md,e.prep,rc.y),d=drvObj(e.drv),c=entryCost(rc,e,s);
    const who=e.drv==='me'?'Вы — '+PIONEERS[s.pioneer].name:d?d.n:'пилот не выбран';
    if(RS.open!==i)return `<div class="entry"><canvas class="rs-car" data-i="${i}" width="132" height="116"></canvas><div class="grow"><b>№${i+1} · ${esc(who)}</b><small>«${esc(md.name)}» · ${PREP[e.prep].name.toLowerCase()} · ${e.tyre==='soft'?'мягкие':'жёсткие'} шины</small><small>${statsLine(st)}</small></div><div class="col"><button class="btn sm" data-act="rEntry" data-i="${i}">Изменить</button>${n>1?`<button class="btn sm" data-act="rDel" data-i="${i}">Убрать</button>`:''}</div></div>`;
    const taken=RS.entries.filter((x,j)=>j!==i).map(x=>x.drv),life=tyreLife(md,rc,e),fc=finishChance(st,rc,s);
    const own=(s.drivers||[]).filter(id=>!taken.includes(id)).map(id=>DRIVERS.find(x=>x.id===id)).filter(Boolean);
    const pool=availDrivers(s).filter(x=>!taken.includes(x.id)).sort((a,b)=>b.sk-a.sk);
    const chip=(id,label,sub)=>`<button class="chip ${e.drv===id?'on':''}" data-act="rset" data-i="${i}" data-k="drv" data-v="${id}">${esc(label)}<small>${sub}</small></button>`;
    return `<div class="entry open">
      <div class="row"><b>Экипаж №${i+1}</b>${n>1?`<button class="btn sm" data-act="rDel" data-i="${i}">Убрать</button>`:''}</div>
      <div class="rs-top"><canvas class="rs-car" data-i="${i}" width="170" height="148"></canvas>
        <div class="stat-grid"><div><span>Скорость</span><b>${Math.round(st.vmax*3.6)} км/ч</b></div><div><span>Разгон</span><b>${accText(st)}</b></div>
        <div><span>Мощность</span><b>${Math.round(st.hp)} л.с. · ${st.kg} кг</b></div><div><span>Тормоза</span><b>${brakeName(st.brk)}</b></div>
        <div><span>Надёжность</span><b>${Math.round(st.rel*100)}% · финиш ≈${Math.round(fc*100)}%</b></div><div><span>Ресурс шин</span><b class="${life<rc.km?'warn':''}">≈${fmtN(life)} км из ${fmtN(rc.km)}</b></div></div></div>
      ${st.mech?'<p class="small muted" style="margin-top:6px">В машине едет механик: он чинит поломки и меняет колёса прямо на трассе.</p>':''}
      ${adviceHTML(rc,e,md,st,s,i)}
      <div class="label" style="margin-top:10px">Пилот</div><div class="chips">
        ${!taken.includes('me')?(meOut(s)?`<button class="chip" disabled>Вы за рулём<small>${esc(injNote(s,'me'))}</small></button>`:chip('me','Вы за рулём',PIONEERS[s.pioneer].name+' · мастерство '+Math.round(pioSk(s)*100))):''}
        ${own.map(x=>{if(drvOut(s,x.id))return `<button class="chip" disabled>${esc(x.n)}<small>${esc(injNote(s,x.id))}</small></button>`;const v=moodOf(s,x.id).v;return chip(x.id,x.n,`мастерство ${Math.round(x.sk*100)} · по контракту · ${moodFace(v)} ${moodWord(v)}`);}).join('')}
        ${d&&!own.includes(d)&&!RS.more?chip(d.id,d.n,`мастерство ${Math.round(d.sk*100)} · на гонку ${money(driverRaceFee(d,s))}`):''}
        ${RS.more?pool.map(x=>chip(x.id,x.n,`мастерство ${Math.round(x.sk*100)} · на гонку ${money(driverRaceFee(x,s))}`)).join(''):''}
        ${pool.length?`<button class="chip" data-act="rMore">${RS.more?'Свернуть список':'Пригласить пилота на гонку ▾'}<small>${RS.more?'оставить выбранного':`свободных в ${rc.y}: ${pool.length}`}</small></button>`:''}
      </div>
      ${d&&d.id?`<div class="row" style="margin-top:6px;gap:10px;justify-content:flex-start">${drvPhoto(d)}<p class="small muted" style="flex:1">${esc(d.note||'')} <button class="linkbtn" data-act="drvBio" data-k="${d.id}">История ▸</button></p></div>`:''}
      ${e.drv==='me'&&(PIO_RACE[s.pioneer]||{}).note?`<p class="small muted" style="margin-top:6px">${esc(PIONEERS[s.pioneer].name)} за рулём: ${esc(PIO_RACE[s.pioneer].note)}${pioRacer(s)?'':' Опытный пилот проедет быстрее — а в режиме «за рулём» его машину ведёте вы.'}</p>`:''}
      <div class="label" style="margin-top:10px">Машина</div><div class="chips">${cars.map(m=>{const x=carStats(m,e.prep,rc.y);return `<button class="chip ${m.id===md.id?'on':''}" data-act="rset" data-i="${i}" data-k="car" data-v="${m.id}">${esc(m.name)}<small>${Math.round(x.hp)} л.с. · ${Math.round(x.vmax*3.6)} км/ч</small></button>`;}).join('')}</div>
      <div class="label" style="margin-top:10px">Подготовка</div><div class="chips">${PREP.map(p=>{const ok=prepAllowed(p.id,s,rc,md);return `<button class="chip ${e.prep===p.id?'on':''}" data-act="rset" data-i="${i}" data-k="prep" data-v="${p.id}" ${ok?'':'disabled'}>${p.name}<small>${ok?(p.cost?money(prepCost(rc,p.id,s)):'бесплатно'):isTruck(md)&&p.id===2?'грузовику гоночный кузов не поставить':'нужна гоночная мастерская'} · ${p.desc}</small></button>`;}).join('')}</div>
      <div class="label" style="margin-top:10px">Шины</div><div class="chips"><button class="chip ${e.tyre==='soft'?'on':''}" data-act="rset" data-i="${i}" data-k="tyre" data-v="soft">Мягкие<small>цепко держат, быстро стираются</small></button><button class="chip ${e.tyre==='hard'?'on':''}" data-act="rset" data-i="${i}" data-k="tyre" data-v="hard">Жёсткие<small>живут дольше, чаще скользят</small></button></div>
      <div class="label" style="margin-top:10px">Передачи</div><div class="chips">${[[-1,'Короткие','разгон, повороты и горы'],[0,'Средние','на всё'],[1,'Длинные','прямые, овалы, спринт']].map(g=>`<button class="chip ${e.gear===g[0]?'on':''}" data-act="rset" data-i="${i}" data-k="gear" data-v="${g[0]}">${g[1]}<small>${g[2]}</small></button>`).join('')}</div>
      <p class="small muted" style="margin-top:8px">Экипаж: взнос ${money(c.fee)}${c.prep?` · подготовка ${money(c.prep)}`:''}${c.hire?` · пилот ${money(c.hire)}`:''}</p>
    </div>`;};
  const modes=[['drive','Еду сам',meSick?'хозяин в больнице — вы ведёте машину №1':'вы за рулём, остальные — по приказу',!hasMe],['manage','Руковожу','приказы пилотам, ускорение ×4',false],['sim','Быстрый итог','результат сразу',false]];
  openSheet(`<div class="row"><div><span class="label">${MONTHS[rc.m]} ${rc.y} · ${hostName(rc.c)}</span><h2 style="margin-top:2px">${esc(rc.name)}</h2></div><button class="iconbtn" data-act="close" aria-label="Закрыть">×</button></div>
    <p class="small muted" style="margin-top:4px">${RTYPE[rc.t]} · ${rc.km.toLocaleString('ru-RU')} км · ${terrName(cfg)}${cfg.pits?' · боксы':''}${cfg.night?' · ночь':''} · приз ${money(racePrize(rc))}</p>
    ${champs.length||gb?`<div class="tags">${champs.map(c=>`<span class="pill warn">${esc(c)}</span>`).join('')}${gb?'<span class="pill good">Кубок наций: до 3 машин от страны</span>':''}</div>`:''}
    ${photoHTML(rc.img)}${rc.hist?`<div class="hist">${esc(rc.hist)}</div>`:''}
    ${scnSetupHTML(rc)}
    ${(()=>{const rid=raceReelId(rc);if(!rid)return '';try{reelUnlock(s,rid);}catch(_){}return `<div style="margin-top:8px">${paperReelHTML(rid,s)}</div>`;})()}
    ${rc.match?matchSetupHTML(rc,s):`<p class="small muted" style="margin-top:8px">👥 ${esc(privRule(rc).txt)}</p>`}
    ${s.chal&&s.chal.acc&&s.chal.type==='race'&&s.chal.rk===rc.key?`<p class="small warn" style="margin-top:6px">⚔️ Вызов принят: ваша лучшая машина должна финишировать выше лучшей машины ${esc(s.chal.mq)}. Пари — ${money(s.chal.stake)}.</p>`:''}
    <div class="label" style="margin-top:16px">${rc.match?'Ваша машина и пилот':`Команда · ${n} из ${MAX_ENTRIES}`}</div>
    <div class="entries">${RS.entries.map(entryHTML).join('')}</div>
    ${n<maxE?`<button class="btn block" style="margin-top:8px" data-act="rAdd">+ Ещё машина в команду</button>`:''}
    <div class="label" style="margin-top:16px">Как проведёте гонку</div><div class="chips">${modes.map(m=>`<button class="chip ${RS.mode===m[0]?'on':''}" data-act="rMode" data-v="${m[0]}" ${m[3]?'disabled':''}>${m[1]}<small>${m[3]?'нужен экипаж «Вы за рулём»':m[2]}</small></button>`).join('')}</div>
    <p class="small muted" style="margin-top:10px">${rc.match?`${tot.prep?`Подготовка ${money(tot.prep)}`:'Подготовка бесплатно'}${tot.hire?` · пилот ${money(tot.hire)}`:''}. Победителю — ставка пари${rc.purse?` и сбор с трибун ${money(rc.purse)}`:''}.`:`Взносы ${money(tot.fee)}${tot.prep?` · подготовка ${money(tot.prep)}`:''}${tot.hire?` · пилоты ${money(tot.hire)}`:''}. Призы: 1-е место — ${money(racePrize(rc))}, 2-е — ${money(racePrize(rc)*0.5)}, 3-е — ${money(racePrize(rc)*0.25)}.`}</p>
    <button class="btn primary block" style="margin-top:12px" data-act="raceGo" ${missing>=0||s.cash<tot.total?'disabled':''}>${missing>=0?`Выберите пилота для экипажа №${missing+1}`:s.cash<tot.total?'Не хватает денег':(RS.mode==='drive'?'На старт':RS.mode==='manage'?'На старт: руковожу':'Провести гонку')+' · '+money(tot.total)}</button>`);
  sb.scrollTop=top;drawSetupSprites();
}
// Глава гоночной команды: оценка заявки — шины против дистанции, передачи под трассу, подготовка, надёжность, машина и пилот
function raceAdvice(rc,e,md,st,s){
  const cfg=trackCfg(rc),tips=[],rec={tyre:e.tyre,gear:e.gear,prep:e.prep},km=rc.km;
  const lifeS=tyreLife(md,rc,Object.assign({},e,{tyre:'soft'})),lifeH=tyreLife(md,rc,Object.assign({},e,{tyre:'hard'}));
  if(lifeS>=km*1.25){rec.tyre='soft';tips.push(`Дистанция ${fmtN(km)} км, мягкие шины проживут ≈${fmtN(lifeS)} км — берите мягкие: в поворотах держат цепче.`);}
  else if(lifeH>=km){rec.tyre='hard';tips.push(`Мягкие сотрутся к ≈${fmtN(lifeS)} км из ${fmtN(km)}. Жёсткие доедут без смены колёс (≈${fmtN(lifeH)} км).`);}
  else{rec.tyre=cfg.pits?'soft':'hard';const n=Math.max(1,Math.ceil(km/(rec.tyre==='soft'?lifeS:lifeH))-1);tips.push(cfg.pits?`Шины не выдержат всю гонку, колёса поменяют в боксах — мягкие дадут скорость на каждом отрезке.`:`Шины не выдержат всю гонку: ждите ${n>1?n+' смены':'смену'} колёс на обочине. Жёсткие живут дольше (≈${fmtN(lifeH)} км против ${fmtN(lifeS)}).`);}
  const g=['oval','sprint'].includes(rc.t)||cfg.banked?1:rc.t==='hill'||cfg.curvy>=0.9?-1:0;rec.gear=g;
  if(e.gear!==g)tips.push(g===1?'Передачи: здесь длинные прямые — длинные передачи дадут максимальную скорость.':g===-1?'Передачи: крутые повороты и подъёмы — короткие передачи помогут разгоняться из каждого поворота.':'Передачи: трасса смешанная — средние передачи.');
  const long=['endurance','rally'].includes(rc.t)||km>=1000,ok2=prepAllowed(2,s,rc,md);
  if(long&&e.prep===2){rec.prep=1;tips.push('Гонка долгая: форсированный мотор чаще ломается. Облегчённая подготовка надёжнее, а скорость почти та же.');}
  else if(!long&&ok2&&e.prep<2){rec.prep=2;const v2=carStats(md,2,rc.y).vmax;tips.push(`Гоночный кузов и форсированный мотор: ${Math.round(v2*3.6)} км/ч вместо ${Math.round(st.vmax*3.6)} за ${money(prepCost(rc,2,s))}.`);}
  else if(e.prep===0){rec.prep=1;const v1=carStats(md,1,rc.y).vmax;tips.push(`Снимите тент и крылья (облегчённая): ${Math.round(v1*3.6)} км/ч вместо ${Math.round(st.vmax*3.6)}.`);}
  const fc=finishChance(carStats(md,rec.prep,rc.y),rc,s);if(fc<0.55)tips.push(`Шанс доехать ≈${Math.round(fc*100)}%. В гонке отдавайте приказ «Беречь» или ставьте мотор понадёжнее.`);
  const best=raceCarsFor(s).filter(m=>m.id!==md.id).map(m=>({m,r:raceRank(m,rc)})).sort((a,b)=>b.r-a.r)[0];
  if(best&&best.r>raceRank(md,rc)*1.06)tips.push(`Машина: «${best.m.name}» для этой гонки лучше — ${Math.round(carStats(best.m,rec.prep,rc.y).vmax*3.6)} км/ч.`);
  const pilot=e.drv==='me'?{sk:pioSk(s)}:drvObj(e.drv),cand=availDrivers(s).concat((s.drivers||[]).map(id=>DRIVERS.find(x=>x.id===id)).filter(Boolean)).sort((a,b)=>b.sk-a.sk)[0];
  if(pilot&&cand&&cand.sk-pilot.sk>=0.08&&e.drv!==cand.id)tips.push(`Пилот: ${cand.n} опытнее (мастерство ${Math.round(cand.sk*100)})${(s.drivers||[]).includes(cand.id)?' и уже в команде':` — на гонку ${money(driverRaceFee(cand,s))}`}.`);
  if(cfg.night)tips.push('Ночью часть трассы в темноте — не рискуйте на обгонах в поворотах.');
  return {tips,rec,same:rec.tyre===e.tyre&&rec.gear===e.gear&&rec.prep===e.prep};
}
function adviceHTML(rc,e,md,st,s,i){const a=raceAdvice(rc,e,md,st,s);if(!a.tips.length)return '';
  return `<div class="advice"><div class="label">Совет главы команды</div><ul>${a.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${a.same?'':`<button class="btn sm" data-act="rAdvice" data-i="${i}">Сделать как советует</button>`}</div>`;}
function terrName(cfg){return {dirt:'грунт',macadam:'щебёнка',asphalt:'асфальт',brick:'кирпич',board:'доски',concrete:'бетон',snow:'снег',mud:'грязь',sand:'песок',mount:'горная дорога',beach:'пляж'}[cfg.terr]||'дорога';}
function drawSetupSprites(){
  const rc=raceByKey(RS.key);
  document.querySelectorAll('#sheetBody .rs-car').forEach(cv=>{const i=+cv.dataset.i,e=RS.entries[i],md=G.models.find(m=>m.id===e.car);if(!md)return;
    const spec=modelSpec(md,e.prep,rc.y,{country:G.country,num:i+1});
    // портрет из студии (видеокарта); без неё — программная отрисовка
    let img=stuCanvas(spec,{w:340,crew:true,yaw:0.5,pitch:0.32});
    if(!img){const k='rsv|'+spec.key;let sp=CAR3D.cache.get(k);if(!sp){sp=renderModel(carModelFor(spec,true),0.62,0.36,70*Math.min(2,window.devicePixelRatio||1));CAR3D.cache.set(k,sp);}img=sp.img;}
    const g=cv.getContext('2d');if(!g)return;g.clearRect(0,0,cv.width,cv.height);const kk=Math.min(cv.width*0.98/img.width,cv.height*0.98/img.height),w=img.width*kk,h=img.height*kk;g.drawImage(img,(cv.width-w)/2,cv.height-h,w,h);});
}
Object.assign(RACE_ACT,{
  raceSetup:d=>openRaceSetup(d.k),
  rEntry:d=>{RS.open=+d.i;renderRaceSetup(true);},
  rMore:()=>{RS.more=!RS.more;renderRaceSetup(true);},
  rAdvice:d=>{const s=G,rc=raceByKey(RS.key),e=RS.entries[+d.i];if(!e)return;const md=s.models.find(m=>m.id===e.car),a=raceAdvice(rc,e,md,carStats(md,e.prep,rc.y),s);Object.assign(e,a.rec);toast('Сделано по совету главы команды');renderRaceSetup(true);},
  rset:d=>{const e=RS.entries[+d.i];if(!e)return;const k=d.k;e[k]=k==='drv'?d.v:k==='tyre'?d.v:+d.v;if(k==='drv'&&d.v==='me')RS.mode='drive';renderRaceSetup(true);},
  rAdd:()=>{const rc=raceByKey(RS.key);if(RS.entries.length>=(rc&&rc.match?1:MAX_ENTRIES))return;const e=defaultEntry(G,rc,RS.entries.map(x=>x.drv));RS.entries.push(e);RS.open=RS.entries.length-1;renderRaceSetup(true);},
  rDel:d=>{if(RS.entries.length<=1)return;RS.entries.splice(+d.i,1);RS.open=Math.min(RS.open,RS.entries.length-1);renderRaceSetup(true);},
  rMode:d=>{RS.mode=d.v;renderRaceSetup(true);},
  raceGo:()=>{const s=G,rc=raceByKey(RS.key);if(!rc||R)return;const tot=setupTotal(rc,s);if(s.cash<tot.total||RS.entries.some(e=>!e.drv))return;
    s.cash-=tot.total;const n=RS.entries.length;rbudAdd(s,tot.total,0);
    addLog(`Заявка на «${rc.name}»: ${n} ${plural(n,'машина','машины','машин')}, расходы ${money(tot.total)}.`);
    const setup={rc,mode:RS.mode,entries:RS.entries.map(e=>({drv:e.drv,md:s.models.find(m=>m.id===e.car),prep:e.prep,tyre:e.tyre,gear:e.gear}))};
    RS=null;closeSheet();stopAuto();save();realLoad(setup.rc,()=>startRace(setup));}
});

/* ---------- 0.29: менеджер команды — «Участвовать»: сам назначает пилотов и машины в пределах бюджета, итог — сразу ---------- */
// Политика бюджета: сколько машин, можно ли приглашать пилотов на гонку, какая доля кассы на одну гонку
const TM_POL={eco:{n:'Экономно',d:'одна машина, свои пилоты, без гоночной подготовки',cars:1,hire:0,prep2:0,cash:0.05},
  std:{n:'Обычно',d:'до двух машин, лучший свободный пилот, подготовка по совету',cars:2,hire:1,prep2:1,cash:0.12},
  max:{n:'Не жалеть',d:'три машины, лучшие пилоты эпохи, гоночная подготовка',cars:3,hire:3,prep2:1,cash:0.3}};
function tmPol(s){return TM_POL[(s.tm&&s.tm.pol)||'std']?(s.tm&&s.tm.pol)||'std':'std';}
// бюджет гонок за год: потрачено (взносы, подготовка, приглашённые пилоты) и выиграно (призы)
function rbudOf(s,y){const B=s.rbud=s.rbud||{};const k=String(y||s.y);return B[k]=B[k]||{spent:0,won:0,n:0};}
function rbudAdd(s,spent,won){const b=rbudOf(s);b.spent+=spent||0;b.won+=won||0;if(spent)b.n++;}
function managerLineup(s,rc,pol){const P=TM_POL[pol||tmPol(s)],maxE=rc.match?1:MAX_ENTRIES,cars=raceCarsFor(s).sort((a,b)=>raceRank(b,rc)-raceRank(a,rc));if(!cars.length)return null;
  const budget=Math.max(0,Math.round(Math.max(0,s.cash)*P.cash/10)*10);
  // кто может ехать: свои пилоты по контракту, хозяин (если гонщик), приглашённые на гонку — по мастерству
  const pool=(s.drivers||[]).filter(id=>!drvOut(s,id)).map(id=>DRIVERS.find(d=>d.id===id)).filter(Boolean).map(d=>({id:d.id,sk:d.sk,fee:0,own:1}));
  if(pioRacer(s)&&!meOut(s))pool.push({id:'me',sk:pioSk(s),fee:0,own:1});
  const hired=availDrivers(s).sort((a,b)=>b.sk-a.sk).slice(0,6).map(d=>({id:d.id,sk:d.sk,fee:driverRaceFee(d,s),own:0}));
  const out=[];let total=0,nh=0;const used=new Set();
  for(let k=0;k<Math.min(maxE,P.cars);k++){
    const ownBest=pool.filter(p=>!used.has(p.id)).sort((a,b)=>b.sk-a.sk)[0],hireBest=hired.filter(p=>!used.has(p.id)).sort((a,b)=>b.sk-a.sk)[0];
    // приглашённый — если своих нет или он заметно сильнее (и политика позволяет)
    let p=ownBest;if(hireBest&&nh<P.hire&&(!ownBest||hireBest.sk-ownBest.sk>=0.08))p=hireBest;if(!p&&hireBest&&k===0)p=hireBest;if(!p)break;
    const md=cars[Math.min(k,cars.length-1)],e={drv:p.id,car:md.id,prep:1,tyre:'soft',gear:0},a=raceAdvice(rc,e,md,carStats(md,1,rc.y),s);Object.assign(e,a.rec);
    if(!P.prep2&&e.prep>1)e.prep=1;if(!prepAllowed(e.prep,s,rc,md))e.prep=1;
    const c=entryCost(rc,e,s).total;
    // первая машина — если хватает денег; следующие — только в пределах бюджета политики
    if(k===0?s.cash<c:total+c>budget)break;
    out.push(e);used.add(p.id);total+=c;if(!p.own)nh++;}
  return {entries:out,total,budget,pol:pol||tmPol(s)};}
// 0.30: «УЧАСТВОВАТЬ» В ОДИН КЛИК. Менеджер сам перебирает составы — одна, две или три машины, свои пилоты или приглашённые,
// подготовка по совету главы команды — и берёт тот, где ожидаемый итог (призы и слава победы, минус расходы) лучше всего:
// не тратит лишнего, если вторая машина почти не прибавляет шансов, и не экономит, если без неё победы не видать.
// Шансы — быстрая прикидка по силе заводских команд эпохи, частников, ваших машин и пилотов (как «итог без вас»).
function mgrDrv(s,id){return id==='me'?{sk:pioSk(s)}:(drvObj(id)||{sk:0.6});}
function mgrPerf(s,rc,e,md){const ref=rankOf(aiCarMd(rc.y),aiPrep(rc),rc.y),sk=mgrDrv(s,e.drv).sk+kitAdd(s,'sk');return Math.pow(rankOf(md,e.prep,rc.y)*kitK(s,'pw')/ref,1.6)*(0.8+0.4*(sk-0.5))*(globalThis.MGRK??0.94);}
function mgrOdds(s,rc,entries,N){const cars=raceCarsFor(s),rnd=mulberry32(hashStr(rc.key+'|'+mi(s)+'|'+entries.map(e=>e.drv+e.car+e.prep).join())),dnf=dnfTarget(rc.y,rc.t)*(['road','rally','endurance'].includes(rc.t)?2:0.9);
  const teams=fieldTeams(rc,s,entries.length),hw=histWinnerTeam(rc,teams),pr=privField(rc,s,new Set());
  const mine=entries.map(e=>{const md=cars.find(m=>m.id===e.car)||cars[0],st=carStats(md,e.prep,rc.y);return {p:mgrPerf(s,rc,e,md),fin:finishChance(st,rc,s)};});
  const P=[0,0,0,0];for(let n=0;n<N;n++){const R=[];
    teams.forEach(t=>{if(rnd()<dnf*clamp(1.4-0.4*t.str,0.6,1.3)&&t!==hw)return;R.push(Math.pow(t.str,1.6)*teamBoost(t,rc)*(t===hw?1.12:1)*(0.92+rnd()*0.16));});
    pr.forEach(e=>{if(rnd()<dnf*1.1)return;R.push(privPerf(e,rc)*(0.92+rnd()*0.16));});
    let best=-1;const nz=globalThis.MGRN??0.3;mine.forEach(m=>{if(rnd()>m.fin)return;const v=m.p*(1-nz/2+rnd()*nz);if(v>best)best=v;});
    if(best<0){P[3]++;continue;}const ahead=R.filter(v=>v>best).length;P[Math.min(3,ahead)]++;}
  return {win:P[0]/N,p2:P[1]/N,p3:P[2]/N};}
function mgrFame(s){const pr=((s.hist&&s.hist.profit)||[]).slice(-12),avg=pr.length?pr.reduce((a,b)=>a+b,0)/pr.length:0;return Math.max(0,avg);}
function managerPlan(s,rc){const key=rc.key+'|'+mi(s)+'|'+Math.round(Math.log2(Math.max(1,s.cash)))+'|'+(s.drivers||[]).join()+'|'+raceCarsFor(s).map(m=>m.id).join()+'|'+kitSig(s);
  const C=managerPlan.c||(managerPlan.c=new Map());if(C.has(key))return C.get(key);if(C.size>40)C.clear();
  const cars=raceCarsFor(s).sort((a,b)=>raceRank(b,rc)-raceRank(a,rc));if(!cars.length){C.set(key,null);return null;}
  const maxE=rc.match?1:MAX_ENTRIES,cap=Math.max(0,s.cash*0.3),pz=racePrize(rc),fame=mgrFame(s)*(rc.major?1.5:0.6)+pz*0.5;
  const own=(s.drivers||[]).filter(id=>!drvOut(s,id)).map(id=>DRIVERS.find(d=>d.id===id)).filter(Boolean).map(d=>({id:d.id,sk:d.sk,own:1}));
  if(pioRacer(s)&&!meOut(s))own.push({id:'me',sk:pioSk(s),own:1});
  const hired=availDrivers(s).sort((a,b)=>b.sk-a.sk).slice(0,5).map(d=>({id:d.id,sk:d.sk,own:0}));
  const pools=[own.slice().sort((a,b)=>b.sk-a.sk),own.concat(hired).sort((a,b)=>b.sk-a.sk)];let best=null;
  for(const pool of pools)for(let k=1;k<=Math.min(maxE,3);k++){const ds=pool.slice(0,k);if(ds.length<k)continue;
    for(const lean of [0,1]){const entries=ds.map((p,j)=>{const md=cars[Math.min(j,cars.length-1)],e={drv:p.id,car:md.id,prep:1,tyre:'soft',gear:0},a=raceAdvice(rc,e,md,carStats(md,1,rc.y),s);Object.assign(e,a.rec);if(lean&&e.prep>1)e.prep=1;if(!prepAllowed(e.prep,s,rc,md))e.prep=1;return e;});
      const cost=entries.reduce((a,e)=>a+entryCost(rc,e,s).total,0);if(cost>s.cash||(k>1&&cost>cap))continue;
      const O=mgrOdds(s,rc,entries,260),ev=O.win*(pz+fame)+O.p2*(pz*0.5+fame*0.3)+O.p3*(pz*0.25+fame*0.12)-cost;
      if(!best||ev>best.ev+Math.max(50,cost*0.02))best={entries,cost,ev,O};}}
  C.set(key,best);return best;}
Object.assign(RACE_ACT,{
  raceQuick:d=>{const s=G,rc=raceByKey(d.k);if(!rc||R||s.pending.length)return;const M=managerPlan(s,rc);if(!M||!M.entries.length){toast(raceCarsFor(s).length?'Денег не хватает даже на одну машину':'Нет машин в производстве');return;}
    RS={key:d.k,entries:M.entries,open:0,mode:'sim',more:false};RACE_ACT.raceGo();},
  raceQuickEdit:d=>{const s=G,rc=raceByKey(d.k);if(!rc)return;const M=managerLineup(s,rc);RS={key:d.k,entries:M&&M.entries.length?M.entries:[defaultEntry(s,rc,[])],open:0,mode:'sim',more:false};renderRaceSetup();}
});
// 0.19: как проходила гонка на самом деле — старт, час, погода
const SCN_ST_NAME={grid:'все вместе, по флагу',interval:'по одному, с интервалом',pairs:'парами, с интервалом',rolling:'с ходу, за машиной-лидером',lemans:'бегом к машинам (старт Ле-Мана)',solo:'поодиночке, на время'};
function scnSetupHTML(rc){try{const S=scnFor(rc),hh=((S.h0%24)+24)%24,hm=String(Math.floor(hh)).padStart(2,'0')+':'+String(Math.round((hh%1)*60)).padStart(2,'0');
  const wx=S.named&&S.wx?S.wx.map(x=>(x[2]>0.3?'дождь':WX_NAME[x[1]]||x[1])).filter((v,i,a)=>a.indexOf(v)===i).join(' → '):'';
  const night=S.span>=8&&[...Array(9)].some((_,k)=>scnSun(((S.h0+S.span*k/8)%24+24)%24,(rc.m??5),S.lat||47).el<-0.05);
  return `<div class="scn-card"><div class="label">${rc.match?'Как пройдёт заезд':'Как это было'}</div><p class="small" style="margin-top:4px">Старт — ${SCN_ST_NAME[S.st]||S.st}, в ${hm}${night?' · гонка идёт и ночью':''}${S.span>=2?' · за гонку проходит ~'+Math.round(S.span)+' ч':''}${wx?' · погода: '+esc(wx):''}${S.dust>=2?' · пыль столбом':''}${S.crowdRoad?' · зрители прямо на дороге':''}${S.neutral?' · нейтрализация в пути':''}.</p>${S.b?`<p class="small muted" style="margin-top:4px">${esc(S.b)}</p>`:''}</div>`;}catch(e){return '';}}
// 0.24: матч один на один — кто соперник и на чём едет
function matchSetupHTML(rc,s){const C=s.chal,rs=matchRivalStats(rc),rec=rc.kind==='record';
  return `<div class="advice" style="margin-top:8px"><div class="label">⚔️ ${esc(MATCH_ST[rc.kind]||'Матч')} с ${esc(rc.rv.n)}</div><ul>
    <li>${rec?(rc.t==='sprint'?'Каждый едет один, на время: разгон и мерный участок. Чья скорость выше — тот и выиграл.':'Каждый проходит круг один, на время. Лучшее время — ваше пари.'):'Одна машина против одной: старт вместе, по флагу. Кто первым на финише — тот и прав.'}</li>
    <li>У соперника — заводская гоночная машина ≈${rs.hp} л.с., до ${rs.kmh} км/ч${rc.rv.dn?`, за рулём ${esc(rc.rv.dn)}`:''}.</li>
    ${C&&C.acc&&C.rk===rc.key?`<li>Пари — ${esc(stakeText(C))}. Не приедете — пари проиграно.</li>`:''}</ul></div>`;}
