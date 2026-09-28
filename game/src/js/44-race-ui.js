/* ================= RACE TAB: seasons, calendar, team, trophies ================= */
function raceStatus(rc,s){
  const r=s.cres&&s.cres[rc.key],mine=s.raceDone[rc.key];
  if(mine>0)return [`${mine}-е место`,mine===1?'good':mine<=3?'warn':'muted',false];
  if(mine===-1)return ['Сход','bad',false];
  if(r&&r.x)return ['Отменена: война','bad',false];
  if(r)return ['Прошла без вас','muted',false];
  if(raceWarBlocked(rc,s))return ['Отменена: война','bad',false];
  if(!raceEligible(rc,s))return [`Нужны дилеры: ${COUNTRIES[rc.c].name}`,'muted',false];
  if(raceOpen(rc,s))return ['Запись открыта','good',true];
  return ['Скоро','warn',false];
}
function champBlock(s,id,y){
  const C=CHAMPS[id],races=champRaces(id,y),tb=champTable(s,id,y),ch=s.season[champKey(id,y)];
  const done=races.filter(r=>s.cres[r.key]).length,me=tb.findIndex(r=>r.you),show=tb.slice(0,5).concat(me>=5?[tb[me]]:[]);
  const next=races.find(r=>!s.cres[r.key]&&!raceWarBlocked(r,s)),fin=ch&&ch.done;
  return `<div class="champ">
    <div class="row"><div><span class="label">${C.off?'Официальный зачёт':'Зачёт прессы'}</span><h3 style="margin-top:2px">${C.name(y)} ${y}</h3></div><span class="pill ${fin?'good':'warn'}">${fin?'Завершён':`этап ${Math.min(done+1,races.length)} из ${races.length}`}</span></div>
    <p class="small muted" style="margin-top:4px">${C.rules}</p>
    ${show.length?`<table class="pl" style="margin-top:8px"><tr><th class="n">#</th><th>Марка</th><th class="n">Старты</th><th class="n">${id==='aiacr'?'Штраф':'Очки'}</th></tr>${show.map(r=>`<tr class="${r.you?'you':''}"><td class="n">${tb.indexOf(r)+1}</td><td>${esc(r.n)}${r.wins?`<small>побед: ${r.wins}</small>`:''}</td><td class="n">${r.starts}</td><td class="n">${r.el?'':'['}${fmtPts(id,r.pts)}${r.el?'':']'}</td></tr>`).join('')}</table>`:'<p class="small muted" style="margin-top:8px">Очков пока нет: сезон впереди.</p>'}
    ${fin?`<p style="margin-top:8px">Чемпион: <b class="${ch.win===s.company?'good':''}">${esc(ch.win||'не определён')}</b></p>`:next?`<p class="small" style="margin-top:8px">Следующий этап: <b>${MONTHS[next.m]} — ${esc(next.name)}</b></p>`:''}
    <div class="c-races">${races.map(r=>{const x=s.cres[r.key],m=s.raceDone[r.key];return `<span class="${m>0?(m===1?'good':''):m===-1?'bad':x?'muted':''}" title="${esc(r.name)}">${MONTHS[r.m]} ${esc(shortRace(r))}${m>0?' · '+m:m===-1?' · сход':x&&x.x?' · отм.':''}</span>`;}).join('')}</div>
  </div>`;
}
function shortRace(r){return r.name.replace(/^(Гран-при|Кубок|Гонка)\s+/,'').split(/[(:—]/)[0].trim().slice(0,22);}
function raceItem(rc,s){
  const [st,tone,open]=raceStatus(rc,s),r=s.cres&&s.cres[rc.key],tags=raceChamps(rc).map(id=>CHAMPS[id].short).concat(GBC_IDS.includes(rc.id)?['Кубок наций']:[]);
  return `<div class="race-item"><div class="row"><div><span class="mo">${MONTHS[rc.m]} · ${hostName(rc.c)} · ${RTYPE[rc.t]} · ${rc.km.toLocaleString('ru-RU')} км</span><h3 style="margin-top:2px">${esc(rc.name)}${rc.major?' <span class="star" title="Большая гонка">★</span>':''}</h3></div><span class="pill ${tone}">${st}</span></div>
    ${tags.length?`<div class="tags">${tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}
    ${r&&r.w&&!r.x?`<p class="small ${r.w===s.company?'good':'muted'}" style="margin-top:4px">Победа: ${esc(r.w)}${r.d?` (${esc(r.d)})`:''}</p>`:`<p class="small muted" style="margin-top:4px">Приз ${money(racePrize(rc))} · взнос ${money(raceFee(rc))} с машины</p>`}
    ${open?`<button class="btn primary block" style="margin-top:8px" data-act="raceSetup" data-k="${rc.key}" ${s.pending.length?'disabled':''}>Заявить команду</button>`:''}</div>`;
}
function teamCard(s){
  const lv=s.rdept||0,D=RDEPT[lv],N=RDEPT[lv+1],c=rdeptCost(s),own=(s.drivers||[]).map(id=>DRIVERS.find(x=>x.id===id)).filter(Boolean);
  const free=availDrivers(s).sort((a,b)=>b.sk-a.sk).slice(0,6);
  return `<section class="card"><span class="label">Команда</span><h2 style="margin-top:2px">${esc(D.name)}</h2>
    <p class="small muted" style="margin-top:4px">${D.desc}${lv?` Содержание ${money(teamUpkeep(s))} в месяц.`:''}</p>
    ${N?`<div class="tech-row"><div><h3>${esc(N.name)}</h3><p class="small muted">${N.desc} Содержание ${money(Math.round(N.up*cpi(s)))} в месяц.</p></div><button class="btn sm" data-act="rdeptUp" ${s.cash<c?'disabled':''}>${money(c)}</button></div>`:''}
    <div class="label" style="margin-top:14px">Пилоты по контракту · ${own.length} из 3</div>
    ${own.length?own.map(d=>`<div class="race-item"><div class="row"><div><span class="mo">${esc(d.nat)} · мастерство ${Math.round(d.sk*100)} · до ${d.to}</span><h3>${esc(d.n)}</h3></div><button class="btn sm" data-act="fire" data-k="${d.id}">Уволить</button></div><p class="small muted">Жалованье ${money(driverSalary(d,s))} в месяц${d.note?' · '+esc(d.note):''}</p></div>`).join(''):'<p class="small muted" style="margin-top:4px">Пока никого. На любую гонку можно пригласить свободного пилота разово — или сесть за руль самому.</p>'}
    ${own.length<3&&free.length?`<div class="label" style="margin-top:12px">Свободные пилоты ${s.y}: контракт на сезон</div>${free.map(d=>`<div class="race-item"><div class="row"><div><span class="mo">${esc(d.nat)} · мастерство ${Math.round(d.sk*100)}</span><h3>${esc(d.n)}</h3></div><button class="btn sm" data-act="hire" data-k="${d.id}" ${s.cash<driverFee(d,s)?'disabled':''}>${money(driverFee(d,s))}</button></div><p class="small muted">Затем ${money(driverSalary(d,s))} в месяц · разово на гонку ${money(driverRaceFee(d,s))}${d.note?' · '+esc(d.note):''}</p></div>`).join('')}`:''}
  </section>`;
}
function vRace(){
  const s=G,y=s.y,cur=RACES.filter(r=>r.y===y),ch=champsOf(y),prevCh=s.m<2?champsOf(y-1).filter(id=>s.season[champKey(id,y-1)]):[];
  const wins=s.raceLog.filter(r=>r.place===1).length,pod=s.raceLog.filter(r=>r.place>0&&r.place<=3).length;
  const hist=s.raceLog.slice(-12).reverse().map(r=>`<tr><td>${r.y}</td><td>${esc(r.name)}<small>${esc(r.model||'')}${r.drv?' · '+esc(r.drv):''}</small></td><td class="n ${r.place===1?'good':r.place?'':'bad'}">${r.place?r.place+'-е':'сход'}</td></tr>`).join('');
  const nextMaj=RACES.filter(r=>r.y===y+1&&r.major);
  return `<section class="card"><span class="label">Гоночный сезон ${y}</span><h2 style="margin-top:2px">Чемпионаты</h2>
    <p class="small muted" style="margin-top:4px">Гонки идут сезонами, как в истории. В каждой гонке марка получает очки за лучшую свою машину. Титул приносит славу на год вперёд, а победы и чемпионства входят в наследие компании.</p>
    ${ch.length?ch.map(id=>champBlock(s,id,y)).join(''):'<p class="small muted" style="margin-top:8px">В этом году чемпионатов нет — только отдельные гонки.</p>'}
    ${prevCh.map(id=>champBlock(s,id,y-1)).join('')}</section>
  <section class="card"><span class="label">Календарь ${y}</span><h2 style="margin-top:2px">Гонки года</h2>
    <p class="small muted" style="margin-top:4px">Запись открывается за месяц до старта. В команде до трёх машин; каждую ведёт свой пилот — вы сами, гонщик по контракту или приглашённый на одну гонку.</p>
    <div style="margin-top:6px">${cur.length?cur.map(r=>raceItem(r,s)).join(''):'<p class="small muted" style="padding-block:10px">В этом году больших гонок нет.</p>'}</div></section>
  ${teamCard(s)}
  <section class="card"><span class="label">Трофеи</span><h2 style="margin-top:2px">${wins} ${plural(wins,'победа','победы','побед')} · ${(s.titles||[]).length} ${plural((s.titles||[]).length,'титул','титула','титулов')}</h2>
    ${(s.titles||[]).length?`<div class="trophies">${s.titles.map(t=>`<span>🏆 ${esc(t.name)}</span>`).join('')}</div>`:''}
    <p class="small muted" style="margin-top:4px">Подиумов: ${pod}. Гонок: ${s.raceLog.length}.</p>
    ${hist?`<table class="pl" style="margin-top:8px"><tr><th>Год</th><th>Гонка</th><th class="n">Место</th></tr>${hist}</table>`:''}</section>
  ${nextMaj.length?`<section class="card"><span class="label">Анонс ${y+1}</span><div style="margin-top:6px">${nextMaj.map(r=>`<div class="race-item"><span class="mo">${MONTHS[r.m]} · ${hostName(r.c)} · ${RTYPE[r.t]}</span><h3>${esc(r.name)}</h3></div>`).join('')}</div></section>`:''}`;
}
Object.assign(RACE_ACT,{
  hire:d=>{const s=G,dr=DRIVERS.find(x=>x.id===d.k),f=driverFee(dr,s);if(!dr||s.cash<f||(s.drivers||[]).length>=3)return;s.cash-=f;s.drivers.push(dr.id);addLog(`${dr.n} подписал контракт с «${s.company}» (${money(f)}, жалованье ${money(driverSalary(dr,s))} в месяц).`,'good');checkAch();rerender();flushToasts();},
  fire:d=>{const s=G,dr=DRIVERS.find(x=>x.id===d.k);s.drivers=s.drivers.filter(id=>id!==d.k);if(dr)addLog(`${dr.n} покинул команду.`);rerender();},
  rdeptUp:()=>{const s=G,c=rdeptCost(s);if(!RDEPT[(s.rdept||0)+1]||s.cash<c)return;s.cash-=c;s.plantVal+=c*0.3;s.rdept=(s.rdept||0)+1;addLog(`Создан новый уровень гоночного отдела: ${RDEPT[s.rdept].name} (${money(c)}).`,'good');rerender();},
  raceResult:()=>openRaceResult()
});
