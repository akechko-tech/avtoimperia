/* ================= RACE SETUP: team of up to 3 cars, drivers, preparation, mode ================= */
const RACE_ACT={};
let RS=null;   // заявка на гонку: {key, entries:[{drv,car,prep,tyre,gear}], open, mode, more}
const MAX_ENTRIES=3;
function raceCarsFor(s){return s.models.filter(m=>m.status==='prod');}
function raceRank(md,rc){const st=carStats(md,2,rc.y);return st.vmax*(0.55+0.45*st.rel)/(1+st.acc/60);}
function prepAllowed(p,s,rc,md){return p<2||((s.rdept||0)>=1&&!(md&&isTruck(md)));}
function defaultEntry(s,rc,taken){
  const cars=raceCarsFor(s).sort((a,b)=>raceRank(b,rc)-raceRank(a,rc)),free=['me',...(s.drivers||[])].filter(d=>!taken.includes(d)),cfg=trackCfg(rc);
  // свободных своих пилотов нет — предложить лучшего свободного гонщика на одну гонку
  if(!free.length){const d=availDrivers(s).filter(x=>!taken.includes(x.id)).sort((a,b)=>b.sk-a.sk)[0];if(d)free.push(d.id);}
  return {drv:free[0]||null,car:cars[0]?cars[0].id:null,prep:(s.rdept||0)>=1&&!['rally','endurance'].includes(rc.t)?2:1,tyre:rc.km>600&&!cfg.pits?'hard':'soft',gear:['oval','sprint'].includes(rc.t)?1:rc.t==='hill'?-1:0};
}
function drvObj(id){return id&&id!=='me'?DRIVERS.find(d=>d.id===id):null;}
function entryCost(rc,e,s){const d=drvObj(e.drv),hire=d&&!(s.drivers||[]).includes(d.id)?driverRaceFee(d,s):0,fee=raceFee(rc),prep=prepCost(rc,e.prep,s);return {fee,prep,hire,total:fee+prep+hire};}
function setupTotal(rc,s){return RS.entries.reduce((a,e)=>{const c=entryCost(rc,e,s);a.fee+=c.fee;a.prep+=c.prep;a.hire+=c.hire;a.total+=c.total;return a;},{fee:0,prep:0,hire:0,total:0});}
// Оценка шанса доехать до финиша: та же модель отказов, что и в гонке
function finishChance(st,rc,s){const dnf=dnfTarget(rc.y,rc.t),rel=clamp(st.rel*(RDEPT[s.rdept||0].rel||1),0.3,0.995);return clamp(Math.pow(1-dnf,Math.pow((1-rel)/fieldRelRef(rc,s),1.6)*1.1),0.05,0.99);}
function tyreLife(md,rc,e){const p=parts(md),cfg=trackCfg(rc),tr=TERR[cfg.terr]||TERR.dirt;return Math.round(p.w.life*(tr.tyre||1)*(1+0.1*upgOf(md,p.w.id))/(e.tyre==='soft'?1.25:0.8));}
function brakeName(b){return b<0.5?'ленточные, слабые':b<0.6?'барабаны на задних колёсах':b<0.8?'на все четыре колеса':'гидравлика или сервоусилитель';}
function openRaceSetup(key){
  const s=G,rc=RACES.find(r=>r.key===key);if(!rc||R)return;
  if(!raceCarsFor(s).length){toast('Нет машин в производстве');return;}
  // пока игрок выбирает машины и пилотов — фото-материалы гонки уже грузятся
  try{texPrefetch();}catch(_){}
  if(!RS||RS.key!==key)RS={key,entries:[defaultEntry(s,rc,[])],open:0,mode:'drive',more:false};
  renderRaceSetup();
}
function renderRaceSetup(keepScroll){
  const s=G,rc=RACES.find(r=>r.key===RS.key),cfg=trackCfg(rc),cars=raceCarsFor(s),n=RS.entries.length,top=keepScroll?sb.scrollTop:0;
  RS.entries.forEach(e=>{if(!cars.some(m=>m.id===e.car))e.car=cars[0].id;if(!prepAllowed(e.prep,s,rc,cars.find(m=>m.id===e.car)))e.prep=1;});
  const hasMe=RS.entries.some(e=>e.drv==='me');if(!hasMe&&RS.mode==='drive')RS.mode='manage';
  const tot=setupTotal(rc,s),missing=RS.entries.findIndex(e=>!e.drv),champs=raceChamps(rc).map(id=>CHAMPS[id].name(rc.y));
  const gb=GBC_IDS.includes(rc.id);
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
        ${!taken.includes('me')?chip('me','Вы за рулём',PIONEERS[s.pioneer].name):''}
        ${own.map(x=>{const v=moodOf(s,x.id).v;return chip(x.id,x.n,`мастерство ${Math.round(x.sk*100)} · по контракту · ${moodFace(v)} ${moodWord(v)}`);}).join('')}
        ${d&&!own.includes(d)&&!RS.more?chip(d.id,d.n,`мастерство ${Math.round(d.sk*100)} · на гонку ${money(driverRaceFee(d,s))}`):''}
        ${RS.more?pool.map(x=>chip(x.id,x.n,`мастерство ${Math.round(x.sk*100)} · на гонку ${money(driverRaceFee(x,s))}`)).join(''):''}
        ${pool.length?`<button class="chip" data-act="rMore">${RS.more?'Свернуть список':'Пригласить пилота на гонку ▾'}<small>${RS.more?'оставить выбранного':`свободных в ${rc.y}: ${pool.length}`}</small></button>`:''}
      </div>
      ${d&&d.id?`<div class="row" style="margin-top:6px;gap:10px;justify-content:flex-start">${drvPhoto(d)}<p class="small muted" style="flex:1">${esc(d.note||'')} <button class="linkbtn" data-act="drvBio" data-k="${d.id}">История ▸</button></p></div>`:''}
      <div class="label" style="margin-top:10px">Машина</div><div class="chips">${cars.map(m=>{const x=carStats(m,e.prep,rc.y);return `<button class="chip ${m.id===md.id?'on':''}" data-act="rset" data-i="${i}" data-k="car" data-v="${m.id}">${esc(m.name)}<small>${Math.round(x.hp)} л.с. · ${Math.round(x.vmax*3.6)} км/ч</small></button>`;}).join('')}</div>
      <div class="label" style="margin-top:10px">Подготовка</div><div class="chips">${PREP.map(p=>{const ok=prepAllowed(p.id,s,rc,md);return `<button class="chip ${e.prep===p.id?'on':''}" data-act="rset" data-i="${i}" data-k="prep" data-v="${p.id}" ${ok?'':'disabled'}>${p.name}<small>${ok?(p.cost?money(prepCost(rc,p.id,s)):'бесплатно'):isTruck(md)&&p.id===2?'грузовику гоночный кузов не поставить':'нужна гоночная мастерская'} · ${p.desc}</small></button>`;}).join('')}</div>
      <div class="label" style="margin-top:10px">Шины</div><div class="chips"><button class="chip ${e.tyre==='soft'?'on':''}" data-act="rset" data-i="${i}" data-k="tyre" data-v="soft">Мягкие<small>цепко держат, быстро стираются</small></button><button class="chip ${e.tyre==='hard'?'on':''}" data-act="rset" data-i="${i}" data-k="tyre" data-v="hard">Жёсткие<small>живут дольше, чаще скользят</small></button></div>
      <div class="label" style="margin-top:10px">Передачи</div><div class="chips">${[[-1,'Короткие','разгон, повороты и горы'],[0,'Средние','на всё'],[1,'Длинные','прямые, овалы, спринт']].map(g=>`<button class="chip ${e.gear===g[0]?'on':''}" data-act="rset" data-i="${i}" data-k="gear" data-v="${g[0]}">${g[1]}<small>${g[2]}</small></button>`).join('')}</div>
      <p class="small muted" style="margin-top:8px">Экипаж: взнос ${money(c.fee)}${c.prep?` · подготовка ${money(c.prep)}`:''}${c.hire?` · пилот ${money(c.hire)}`:''}</p>
    </div>`;};
  const modes=[['drive','Еду сам','вы за рулём, остальные — по приказу',!hasMe],['manage','Руковожу','приказы пилотам, ускорение ×4',false],['sim','Быстрый итог','результат сразу',false]];
  openSheet(`<div class="row"><div><span class="label">${MONTHS[rc.m]} ${rc.y} · ${hostName(rc.c)}</span><h2 style="margin-top:2px">${esc(rc.name)}</h2></div><button class="iconbtn" data-act="close" aria-label="Закрыть">×</button></div>
    <p class="small muted" style="margin-top:4px">${RTYPE[rc.t]} · ${rc.km.toLocaleString('ru-RU')} км · ${terrName(cfg)}${cfg.pits?' · боксы':''}${cfg.night?' · ночь':''} · приз ${money(racePrize(rc))}</p>
    ${champs.length||gb?`<div class="tags">${champs.map(c=>`<span class="pill warn">${esc(c)}</span>`).join('')}${gb?'<span class="pill good">Кубок наций: до 3 машин от страны</span>':''}</div>`:''}
    ${photoHTML(rc.img)}${rc.hist?`<div class="hist">${esc(rc.hist)}</div>`:''}
    ${scnSetupHTML(rc)}
    ${(()=>{const rid=raceReelId(rc);if(!rid)return '';try{reelUnlock(s,rid);}catch(_){}return `<div style="margin-top:8px">${paperReelHTML(rid,s)}</div>`;})()}
    <p class="small muted" style="margin-top:8px">👥 ${esc(privRule(rc).txt)}</p>
    ${s.chal&&s.chal.acc&&s.chal.type==='race'&&s.chal.rk===rc.key?`<p class="small warn" style="margin-top:6px">⚔️ Вызов принят: ваша лучшая машина должна финишировать выше лучшей машины ${esc(s.chal.mq)}. Пари — ${money(s.chal.stake)}.</p>`:''}
    <div class="label" style="margin-top:16px">Команда · ${n} из ${MAX_ENTRIES}</div>
    <div class="entries">${RS.entries.map(entryHTML).join('')}</div>
    ${n<MAX_ENTRIES?`<button class="btn block" style="margin-top:8px" data-act="rAdd">+ Ещё машина в команду</button>`:''}
    <div class="label" style="margin-top:16px">Как проведёте гонку</div><div class="chips">${modes.map(m=>`<button class="chip ${RS.mode===m[0]?'on':''}" data-act="rMode" data-v="${m[0]}" ${m[3]?'disabled':''}>${m[1]}<small>${m[3]?'нужен экипаж «Вы за рулём»':m[2]}</small></button>`).join('')}</div>
    <p class="small muted" style="margin-top:10px">Взносы ${money(tot.fee)}${tot.prep?` · подготовка ${money(tot.prep)}`:''}${tot.hire?` · пилоты ${money(tot.hire)}`:''}. Призы: 1-е место — ${money(racePrize(rc))}, 2-е — ${money(racePrize(rc)*0.5)}, 3-е — ${money(racePrize(rc)*0.25)}.</p>
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
  const pilot=e.drv==='me'?(PIONEERS[s.pioneer].drv&&DRIVERS.find(d=>d.id===PIONEERS[s.pioneer].drv)||{sk:0.72}):drvObj(e.drv),cand=availDrivers(s).concat((s.drivers||[]).map(id=>DRIVERS.find(x=>x.id===id)).filter(Boolean)).sort((a,b)=>b.sk-a.sk)[0];
  if(pilot&&cand&&cand.sk-pilot.sk>=0.08&&e.drv!==cand.id)tips.push(`Пилот: ${cand.n} опытнее (мастерство ${Math.round(cand.sk*100)})${(s.drivers||[]).includes(cand.id)?' и уже в команде':` — на гонку ${money(driverRaceFee(cand,s))}`}.`);
  if(cfg.night)tips.push('Ночью часть трассы в темноте — не рискуйте на обгонах в поворотах.');
  return {tips,rec,same:rec.tyre===e.tyre&&rec.gear===e.gear&&rec.prep===e.prep};
}
function adviceHTML(rc,e,md,st,s,i){const a=raceAdvice(rc,e,md,st,s);if(!a.tips.length)return '';
  return `<div class="advice"><div class="label">Совет главы команды</div><ul>${a.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${a.same?'':`<button class="btn sm" data-act="rAdvice" data-i="${i}">Сделать как советует</button>`}</div>`;}
function terrName(cfg){return {dirt:'грунт',macadam:'щебёнка',asphalt:'асфальт',brick:'кирпич',board:'доски',concrete:'бетон',snow:'снег',mud:'грязь',sand:'песок',mount:'горная дорога',beach:'пляж'}[cfg.terr]||'дорога';}
function drawSetupSprites(){
  const rc=RACES.find(r=>r.key===RS.key);
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
  rAdvice:d=>{const s=G,rc=RACES.find(r=>r.key===RS.key),e=RS.entries[+d.i];if(!e)return;const md=s.models.find(m=>m.id===e.car),a=raceAdvice(rc,e,md,carStats(md,e.prep,rc.y),s);Object.assign(e,a.rec);toast('Сделано по совету главы команды');renderRaceSetup(true);},
  rset:d=>{const e=RS.entries[+d.i];if(!e)return;const k=d.k;e[k]=k==='drv'?d.v:k==='tyre'?d.v:+d.v;if(k==='drv'&&d.v==='me')RS.mode='drive';renderRaceSetup(true);},
  rAdd:()=>{const rc=RACES.find(r=>r.key===RS.key);if(RS.entries.length>=MAX_ENTRIES)return;const e=defaultEntry(G,rc,RS.entries.map(x=>x.drv));RS.entries.push(e);RS.open=RS.entries.length-1;renderRaceSetup(true);},
  rDel:d=>{if(RS.entries.length<=1)return;RS.entries.splice(+d.i,1);RS.open=Math.min(RS.open,RS.entries.length-1);renderRaceSetup(true);},
  rMode:d=>{RS.mode=d.v;renderRaceSetup(true);},
  raceGo:()=>{const s=G,rc=RACES.find(r=>r.key===RS.key);if(!rc||R)return;const tot=setupTotal(rc,s);if(s.cash<tot.total||RS.entries.some(e=>!e.drv))return;
    s.cash-=tot.total;const n=RS.entries.length;
    addLog(`Заявка на «${rc.name}»: ${n} ${plural(n,'машина','машины','машин')}, расходы ${money(tot.total)}.`);
    const setup={rc,mode:RS.mode,entries:RS.entries.map(e=>({drv:e.drv,md:s.models.find(m=>m.id===e.car),prep:e.prep,tyre:e.tyre,gear:e.gear}))};
    RS=null;closeSheet();stopAuto();save();startRace(setup);}
});

// 0.19: как проходила гонка на самом деле — старт, час, погода
const SCN_ST_NAME={grid:'все вместе, по флагу',interval:'по одному, с интервалом',pairs:'парами, с интервалом',rolling:'с ходу, за машиной-лидером',lemans:'бегом к машинам (старт Ле-Мана)',solo:'поодиночке, на время'};
function scnSetupHTML(rc){try{const S=scnFor(rc),hh=((S.h0%24)+24)%24,hm=String(Math.floor(hh)).padStart(2,'0')+':'+String(Math.round((hh%1)*60)).padStart(2,'0');
  const wx=S.named&&S.wx?S.wx.map(x=>(x[2]>0.3?'дождь':WX_NAME[x[1]]||x[1])).filter((v,i,a)=>a.indexOf(v)===i).join(' → '):'';
  const night=S.span>=8&&[...Array(9)].some((_,k)=>scnSun(((S.h0+S.span*k/8)%24+24)%24,rc.m||5,S.lat||47).el<-0.05);
  return `<div class="scn-card"><div class="label">Как это было</div><p class="small" style="margin-top:4px">Старт — ${SCN_ST_NAME[S.st]||S.st}, в ${hm}${night?' · гонка идёт и ночью':''}${S.span>=2?' · за гонку проходит ~'+Math.round(S.span)+' ч':''}${wx?' · погода: '+esc(wx):''}${S.dust>=2?' · пыль столбом':''}${S.crowdRoad?' · зрители прямо на дороге':''}${S.neutral?' · нейтрализация в пути':''}.</p>${S.b?`<p class="small muted" style="margin-top:4px">${esc(S.b)}</p>`:''}</div>`;}catch(e){return '';}}
