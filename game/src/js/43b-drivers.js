/* ================= DRIVERS & RIVALS: личный зачёт гонщиков, настроение пилотов, вызовы конкурентов, «короли года» ================= */

/* ---------- личный зачёт гонщиков (по версии прессы) ---------- */
// Официального зачёта гонщиков до 1950 года не было — гонщиков сравнивали газеты. Очки — за все гонки года.
const DCH_RULES='Официального личного зачёта ещё нет — гонщиков сравнивает спортивная пресса. За каждую гонку года первые шесть получают 8, 6, 4, 3, 2 и 1 очко, в малых гонках — вдвое меньше.';
function dchPts(rc,pos){return pos>6?0:[8,6,4,3,2,1][pos-1]*(rc.major?1:0.5);}
function dchOf(s,y){s.dch=s.dch||{};return s.dch[y]=s.dch[y]||{rows:{},races:[],done:0};}
// «Фернан Шарон (Panhard et Levassor)», «Луи Вагнер и Робер Сенешаль (Delage)» → первый пилот экипажа
function histDrv(w){return String(w||'').split(' (')[0].split(/,|\s\/\s|\sи\s/)[0].trim();}
function drvByName(n){return n?DRIVERS.find(d=>d.n===n)||null:null;}
function meKey(s){return PIONEERS[s.pioneer].drv||'me';}
function meName(s){const P=PIONEERS[s.pioneer];return P.name==='Свой персонаж'?`Вы, хозяин «${s.company}»`:P.name;}
// order — экипажи в порядке финиша (сошедшие в конце): {n — пилот, id, mq — марка, dnf, mine — за вашу команду}
function dchRecord(s,rc,order){
  const D=dchOf(s,rc.y);if(D.races.includes(rc.key))return;D.races.push(rc.key);
  const seen=new Set();
  order.forEach((o,i)=>{if(!o.n)return;const k=o.id||('~'+o.n);if(seen.has(k))return;seen.add(k);
    const r=D.rows[k]=D.rows[k]||{n:o.n,id:o.id||'',mq:'',pts:0,w:0,pod:0,st:0};
    r.st++;if(o.mq)r.mq=o.mq;const p=i+1,pts=o.dnf?0:dchPts(rc,p);
    r.pts+=pts;if(!o.dnf&&p===1)r.w++;if(!o.dnf&&p<=3)r.pod++;
    if(o.mine){r.mine=1;r.pm=(r.pm||0)+pts;}});
}
function dchTable(s,y){const D=s.dch&&s.dch[y];if(!D)return [];
  return Object.keys(D.rows).map(k=>({k,...D.rows[k]})).filter(r=>r.pts>0||r.mine).sort((a,b)=>b.pts-a.pts||b.w-a.w||b.pod-a.pod||a.st-b.st);}
// Итоги года: лучший гонщик. Титул вашей команде — если больше половины очков он набрал за вас
function dchFinish(s,y){const D=s.dch&&s.dch[y];if(!D||D.done)return null;
  D.done=1;const tb=dchTable(s,y),w=tb[0];if(!w||w.pts<=0)return null;D.win=w.n;D.wmq=w.mq;D.wid=w.id||'';
  const mine=w.mine&&(w.pm||0)>=w.pts/2;D.mine=mine?1:0;
  if(mine){const nm=`Гонщик года ${y}: ${w.n}`;s.titles.push({y,id:'dch',name:nm,w:0.25});s.rep=clamp(s.rep+3*bn('raceRep'),0,100);
    if(w.id)moodAdd(s,w.id,12,'Газеты назвали его гонщиком года');addLog(`🏆 ${nm}`,'good');pendingToasts.push('🏆 '+nm);}
  else addLog(`Гонщик ${y} года по версии прессы — ${w.n}${w.mq?` (${w.mq})`:''}: ${fmtPts('gp',w.pts)} очков, побед: ${w.w}.`,'hist');
  return {w,second:tb[1]||null,mine};
}
function dchNameCell(r){const d=r.id&&r.id!=='me'&&DRIVERS.find(x=>x.id===r.id);
  return d?`<button class="linkbtn" data-act="drvBio" data-k="${d.id}">${esc(r.n)}</button>`:esc(r.n);}
function dchBlock(s,y){const tb=dchTable(s,y),D=s.dch&&s.dch[y],fin=D&&D.done;
  const show=tb.slice(0,6).concat(tb.filter((r,i)=>i>=6&&r.mine));
  return `<div class="champ"><div class="row"><div><span class="label">Зачёт прессы · все гонки года</span><h3 style="margin-top:2px">Личный зачёт гонщиков ${y}</h3></div><span class="pill ${fin?'good':'warn'}">${fin?'Итоги года':`гонок: ${D?D.races.length:0}`}</span></div>
    <p class="small muted" style="margin-top:4px">${DCH_RULES} Гонщик года прославит и свою марку.</p>
    ${show.length?`<table class="pl dch" style="margin-top:8px"><tr><th class="n">#</th><th>Гонщик</th><th class="n">Победы</th><th class="n">Очки</th></tr>${show.map(r=>`<tr class="${r.mine?'you':''}"><td class="n">${tb.indexOf(r)+1}</td><td>${dchNameCell(r)}<small>${esc(r.mq||'')}${r.mine?' · за вашу команду':''}</small></td><td class="n">${r.w||''}</td><td class="n">${fmtPts('gp',r.pts)}</td></tr>`).join('')}</table>`:'<p class="small muted" style="margin-top:8px">Очков пока нет: сезон впереди.</p>'}
    ${fin&&D.win?`<p style="margin-top:8px">Гонщик года: <b class="${D.mine?'good':''}">${esc(D.win)}</b>${D.wmq?` · ${esc(D.wmq)}`:''}</p>`:''}
  </div>`;}
function dchMini(s,y){const tb=dchTable(s,y);if(!tb.length)return '';const show=tb.slice(0,4).concat(tb.filter((r,i)=>i>=4&&r.mine).slice(0,2));
  return `<div class="label" style="margin-top:14px">Личный зачёт гонщиков ${y}</div><table class="pl" style="margin-top:4px">${show.map(r=>`<tr class="${r.mine?'you':''}"><td class="n">${tb.indexOf(r)+1}</td><td>${esc(r.n)}<small>${esc(r.mq||'')}</small></td><td class="n">${fmtPts('gp',r.pts)}</td></tr>`).join('')}</table>`;}
// Кто вёл машины в гонке без вас: у исторического победителя — настоящий пилот, у остальных — лучший гонщик марки
function simDrivers(rows,rc,hw){const used=new Set();
  rows.forEach(r=>{if(!r.priv)return;const d=drvByName(r.drv);r.dn=r.drv||'';r.did=d?d.id:'';if(d)used.add(d.id);});
  rows.forEach((r,i)=>{if(r.priv||i>0||r.t!==hw||!rc.win||/^(Победител|Пробег без)/.test(rc.win))return;const n=histDrv(rc.win),d=drvByName(n);r.dn=n;r.did=d?d.id:'';if(d)used.add(d.id);});
  rows.forEach(r=>{if(r.priv||r.dn||!r.t)return;const d=teamDrivers(r.t,rc.y,used).sort((a,b)=>b.sk-a.sk)[0];if(d){used.add(d.id);r.dn=d.n;r.did=d.id;}});
}

/* ---------- настроение пилотов ---------- */
// Довольный пилот едет на пределе, обиженный чаще ошибается. Радуют победы, подиумы, быстрые машины и премии;
// злят поломки, пропущенные гонки, места вне призов и задержки жалованья.
function moodOf(s,id){s.dmood=s.dmood||{};return s.dmood[id]=s.dmood[id]||{v:70,why:'Новый контракт',m:mi(s)};}
function moodAdd(s,id,dv,why){if(!id||!(s.drivers||[]).includes(id))return;const o=moodOf(s,id);o.v=clamp(o.v+dv,DIF().simple?30:0,100);if(why)o.why=why;o.m=mi(s);}
function moodK(s,id){return (s.drivers||[]).includes(id)?0.94+0.1*moodOf(s,id).v/100:1;}
function moodFace(v){return v>=80?'😃':v>=60?'🙂':v>=40?'😐':v>=25?'😒':'😠';}
function moodWord(v){return v>=80?'рвётся в бой':v>=60?'доволен':v>=40?'спокоен':v>=25?'недоволен':'готов уйти';}
function moodTone(v){return v>=60?'good':v>=35?'warn':'bad';}
function bonusCost(d,s){return Math.round(driverSalary(d,s)*2/5)*5;}
function drvAfterRace(s,rc,res){
  const team=res.filter(r=>r.you);
  team.forEach(r=>{const id=r.drvId;if(!id||id==='me')return;
    if(r.dnf)moodAdd(s,id,r.dnf==='кончилось топливо'?-6:-7,r.dnf==='кончилось топливо'?`В гонке «${rc.name}» кончилось топливо — винит команду`:`Машина подвела в гонке «${rc.name}»: ${r.dnf}`);
    else if(r.pos===1)moodAdd(s,id,16,`Победа в гонке «${rc.name}»`);
    else if(r.pos<=3)moodAdd(s,id,8,`${r.pos}-е место в гонке «${rc.name}»`);
    else if(r.pos<=6)moodAdd(s,id,2,`${r.pos}-е место в гонке «${rc.name}»`);
    else moodAdd(s,id,-3,`Лишь ${r.pos}-е место в «${rc.name}» — просит машину быстрее`);});
  (s.drivers||[]).forEach(id=>{if(!team.some(r=>r.drvId===id))moodAdd(s,id,-4,`Не взяли на гонку «${rc.name}»`);});
}
// Гонка прошла без вас, хотя команда могла выступить
// (если в тот же месяц команда выступала в другой гонке — не в обиде)
function drvSkipped(s,rc){if(!(s.drivers||[]).length||rc.y<s.y-1||!raceEligible(rc,s)||s.raceMi===(rc.y-1895)*12+rc.m)return;
  (s.drivers||[]).forEach(id=>moodAdd(s,id,rc.major?-3:-1,`Команда пропустила гонку «${rc.name}»`));}
function drvMonth(s){
  (s.drivers||[]).forEach(id=>{const o=moodOf(s,id);o.v+=(60-o.v)*0.05;if(s.cash<0)moodAdd(s,id,-2,'Задерживают жалованье');});
  injMonth(s);
  if(s.over)return;poachCheck(s);chalCheck(s);salesChalCheck(s);
  if(s.m===0)yearAwards(s,s.y-1);
}
function poachCheck(s){
  if(DIF().simple||s.pending.length||s.poachNow)return;
  const L=(s.drivers||[]).filter(id=>moodOf(s,id).v<25&&mi(s)-(moodOf(s,id).pm??-99)>=6);if(!L.length||Math.random()>0.45)return;
  const id=L[0],d=DRIVERS.find(x=>x.id===id);if(!d)return;const o=moodOf(s,id);o.pm=mi(s);
  const T=RACE_TEAMS.filter(t=>t.from<=s.y&&t.to>=s.y&&t.pk!==s.pioneer).sort((a,b)=>b.str-a.str).slice(0,4),t=T.length?pick(T):{n:'соперники'};
  const cost=Math.round(driverSalary(d,s)*6/10)*10;s.poachNow={id,team:t.n,cost};
  pushEvent({kicker:'Команда',title:`${d.n} собирается уйти`,deck:`${t.n} зовёт его к себе`,img:IMG[DRIVER_WIKI[d.id]]?DRIVER_WIKI[d.id]:'',imgCap:d.n,
    text:`${d.n} недоволен: ${o.why.charAt(0).toLowerCase()+o.why.slice(1)}. Команда ${t.n} узнала об этом и предлагает ему контракт.\nУдержать гонщика можно прибавкой и премией — ${money(cost)} сразу. Тогда он останется и снова поверит в команду. Иначе он уйдёт к соперникам.`,
    choices:[[`Удержать: ${money(cost)}`,'poachKeep'],['Отпустить','poachLet']]},false);
}

/* ---------- вызовы конкурентов ---------- */
// На гонку: пари, чья машина финиширует выше. По продажам: кто продаст больше машин класса дома до конца года.
function chalCheck(s){
  if(s.pending.length||s.chal||mi(s)-(s.chalLast??-99)<5||Math.random()>0.2)return;
  const L=RACES.filter(rc=>rc.y===s.y&&rc.m>s.m&&rc.m<=s.m+3&&!GBC_IDS.includes(rc.id)&&raceEligible(rc,s)&&!raceWarBlocked(rc,s)&&!s.cres[rc.key]&&s.raceDone[rc.key]===undefined);
  if(!L.length||!raceCarsFor(s).length)return;
  const rc=L.slice().sort((a,b)=>(b.major?1:0)-(a.major?1:0)||a.m-b.m)[0];
  const T=fieldTeams(rc,s,3).filter(t=>t.mq&&t.mq.length);if(!T.length)return;
  // вызывает сильная марка своей страны — или лидер эпохи
  const t=T.find(t=>t.c===s.country&&t.str>=0.95)||T[0];
  const stake=Math.max(100,Math.round(racePrize(rc)*0.6/50)*50);
  s.chal={type:'race',rk:rc.key,mq:t.n,stake,acc:0};s.chalLast=mi(s);
  pushEvent({kicker:'Вызов',title:`${t.n} бросает вызов «${s.company}»`,deck:`Пари на ${money(stake)}: чья машина будет выше в гонке «${rc.name}»`,
    text:`Глава марки ${t.n} заявил газетам: «Машины "${s.company}" хороши только на афишах. Пусть приедут на "${rc.name}" в ${MONTHS_G[rc.m].replace(/я$/,'е').replace(/а$/,'е')} — посмотрим, кто кого!» Он предлагает пари на ${money(stake)}: чья лучшая машина финиширует выше, тот и забирает деньги.\nПринять вызов — значит заявить команду на эту гонку и обогнать лучшую машину ${t.n}. Победа в пари — слава в газетах и радость гонщиков; проигрыш или неявка — удар по репутации. Отказ газеты тоже заметят.`,
    choices:[['Принять вызов','chalYes'],['Отказаться','chalNo']]},true);
}
function salesChalCheck(s){
  if(s.pending.length||s.chal||s.m<1||s.m>6||mi(s)-(s.chalLast??-99)<5||Math.random()>0.1)return;
  const L=s.last,home=s.country,mk=L&&L.mk&&L.mk[home];if(!mk||!mk.segs)return;
  const g=SEGK.filter(g=>(mk.segs[g].you||0)>=3).sort((a,b)=>mk.segs[b].you-mk.segs[a].you)[0];if(!g)return;
  const you=mk.segs[g].you,cps=(COMPS[home]||[]).map((cp,i)=>({cp,i,v:compVol(cp,s)*((cp.mix&&cp.mix[g])||0)})).filter(x=>x.cp.pk!==s.pioneer&&x.v>0).sort((a,b)=>b.v-a.v);
  // соперник — марка, с которой вы идёте вровень: не больше чем втрое сильнее и не втрое слабее
  const R=cps.find(x=>x.v<=you*12*3&&x.v>=you*12/3);if(!R)return;
  const stake=Math.round(clamp((L.rev||0)*0.15,200*cpi(s),25000*cpi(s))/50)*50,nm=compName(R.cp,s),mdl=compModel(R.cp,s);
  s.chal={type:'sales',g,mq:nm,ci:R.i,y:s.y,stake,acc:0};s.chalLast=mi(s);
  pushEvent({kicker:'Вызов',title:`${nm} бросает вызов «${s.company}»`,deck:`Кто продаст больше машин класса «${SEG[g].name}» до конца ${s.y} года`,img:mdl&&mdl[2]&&IMG[mdl[2]]?mdl[2]:'',imgCap:mdl?`${nm} ${mdl[1]}`:'',
    text:`Директор ${nm} заявил газетам: «К Рождеству наши машины класса "${SEG[g].name}" разойдутся лучше, чем у "${s.company}". Ставлю ${money(stake)}!»\nВ прошлом месяце ваших машин этого класса купили ${fmtN(you)}. Пари — на продажи в стране с этого дня и до конца года. Выиграете — деньги, слава и газетные заголовки; проиграете — заплатите и потеряете немного репутации.`,
    choices:[['Принять вызов','chalYes'],['Отказаться','chalNo']]},true);
}
function chalRival(s,C){return ((s.comps[s.country]||[])[C.ci]||{});}
function drvResolve(s,key){
  if(key==='chalYes'&&s.chal){const C=s.chal;C.acc=1;
    if(C.type==='sales'){C.y0=(s.segY||{})[C.g]||0;C.r0=(chalRival(s,C).ys||{})[C.g]||0;addLog(`Вызов принят: кто продаст больше машин класса «${SEG[C.g].name}» до конца года — «${s.company}» или ${C.mq}. Пари ${money(C.stake)}.`,'good');}
    else{const rc=RACES.find(r=>r.key===C.rk);addLog(`Вызов принят: пари с ${C.mq} на ${money(C.stake)} — гонка «${rc?rc.name:''}». Заявите команду!`,'good');}
    pendingToasts.push('⚔️ Вызов принят');}
  if(key==='chalNo'&&s.chal){const C=s.chal;s.chal=null;s.rep=clamp(s.rep-1,0,100);addLog(`Вы отказались от пари с ${C.mq}. Газеты шутят, что «${s.company}» испугалась.`,'bad');}
  if(key==='poachKeep'&&s.poachNow){const P=s.poachNow,d=DRIVERS.find(x=>x.id===P.id);s.poachNow=null;
    if(s.cash>=P.cost){s.cash-=P.cost;moodAdd(s,P.id,40,'Прибавка к жалованью: остался в команде');addLog(`${d?d.n:'Пилот'} остаётся в команде: прибавка и премия ${money(P.cost)}.`,'good');}
    else{s.drivers=s.drivers.filter(x=>x!==P.id);addLog(`Денег на прибавку не нашлось — ${d?d.n:'пилот'} ушёл в команду ${P.team}.`,'bad');}}
  if(key==='poachLet'&&s.poachNow){const P=s.poachNow,d=DRIVERS.find(x=>x.id===P.id);s.poachNow=null;s.drivers=s.drivers.filter(x=>x!==P.id);addLog(`${d?d.n:'Пилот'} ушёл в команду ${P.team}.`,'bad');}
}
// Итог пари на гонке: сравниваем лучшие места
function chalRace(s,rc,res){const C=s.chal;if(!C||C.type!=='race'||C.rk!==rc.key||!C.acc)return null;s.chal=null;
  const best=L=>{const f=L.filter(r=>!r.dnf).map(r=>r.pos);return f.length?Math.min(...f):999;};
  const me=best(res.filter(r=>r.you)),th=res.filter(r=>!r.you&&!r.priv&&r.name===C.mq),them=best(th);
  if(me===999&&them===999){addLog(`Пари с ${C.mq} не состоялось: ни одна машина не доехала до финиша.`);return {C,res:'draw'};}
  const win=me<them,rk=bn('raceRep');
  if(win){s.cash+=C.stake;s.rep=clamp(s.rep+(rc.major?3:2)*rk,0,100);(s.drivers||[]).forEach(id=>moodAdd(s,id,6,`Выиграли пари у ${C.mq}`));
    addLog(`⚔️ Пари выиграно: «${s.company}» впереди ${C.mq}${th.length?'':' (соперник не вышел на старт)'}. +${money(C.stake)}.`,'good');pendingToasts.push('⚔️ Пари выиграно: +'+money(C.stake));}
  else{s.cash-=C.stake;s.rep=clamp(s.rep-1.5,0,100);(s.drivers||[]).forEach(id=>moodAdd(s,id,-3,`Проиграли пари ${C.mq}`));
    addLog(`Пари проиграно: ${C.mq} оказалась впереди. −${money(C.stake)}.`,'bad');pendingToasts.push('Пари проиграно: −'+money(C.stake));}
  return {C,res:win?'win':'lose',me,them};
}
// Не приехали на гонку, где приняли вызов
function chalForfeit(s,rc){const C=s.chal;if(!C||C.type!=='race'||C.rk!==rc.key)return;s.chal=null;if(!C.acc)return;
  s.cash-=C.stake;s.rep=clamp(s.rep-3,0,100);addLog(`Вы приняли вызов ${C.mq}, но не приехали на «${rc.name}». Пари проиграно (−${money(C.stake)}), газеты смеются.`,'bad');}
// Пари по продажам: итог в конце года
function chalSales(s,y){const C=s.chal;if(!C||C.type!=='sales'||C.y!==y)return null;s.chal=null;if(!C.acc)return null;
  const you=Math.round(((s.segYPrev||{})[C.g]||0)-(C.y0||0)),them=Math.round(((chalRival(s,C).ysPrev||{})[C.g]||0)-(C.r0||0)),win=you>them;
  if(win){s.cash+=C.stake;s.rep=clamp(s.rep+3,0,100);addLog(`⚔️ Пари по продажам выиграно: ${carsN(you)} против ${fmtN(them)} у ${C.mq}. +${money(C.stake)}.`,'good');}
  else{s.cash-=C.stake;s.rep=clamp(s.rep-2,0,100);addLog(`Пари по продажам проиграно: ${carsN(you)} против ${fmtN(them)} у ${C.mq}. −${money(C.stake)}.`,'bad');}
  return {C,win,you,them};
}
function chalCard(s,where){const C=s.chal;if(!C||!C.acc||(where==='race')!==(C.type==='race'))return '';
  if(C.type==='race'){const rc=RACES.find(r=>r.key===C.rk);if(!rc)return '';
    return `<section class="card chal"><div class="row"><span class="label">⚔️ Вызов принят</span><span class="pill warn">${money(C.stake)}</span></div><h3 style="margin-top:4px">Пари с ${esc(C.mq)}</h3><p class="small" style="margin-top:4px">Гонка «${esc(rc.name)}» · ${MONTHS[rc.m]} ${rc.y}. Ваша лучшая машина должна финишировать выше лучшей машины ${esc(C.mq)}. Не приедете — пари проиграно.</p></section>`;}
  const you=Math.round(((s.segY||{})[C.g]||0)-(C.y0||0)),them=Math.round(((chalRival(s,C).ys||{})[C.g]||0)-(C.r0||0)),mx=Math.max(1,you,them);
  return `<section class="card chal"><div class="row"><span class="label">⚔️ Вызов по продажам</span><span class="pill warn">${money(C.stake)}</span></div><h3 style="margin-top:4px">«${esc(s.company)}» против ${esc(C.mq)}</h3>
    <p class="small muted" style="margin-top:4px">Класс «${SEG[C.g].name}», продажи в стране до конца ${C.y} года.</p>
    <div class="leg-row" style="margin-top:8px"><span>Вы</span><div class="bar"><i style="width:${you/mx*100}%;background:var(--brass)"></i></div><b class="num">${fmtN(you)}</b></div>
    <div class="leg-row"><span>${esc(C.mq)}</span><div class="bar"><i style="width:${them/mx*100}%;background:var(--muted)"></i></div><b class="num">${fmtN(them)}</b></div></section>`;}

/* ---------- «короли года» по версии прессы ---------- */
// Король технологий без вас — историческое новшество года (марка, что сделала)
const TECH_KING={1895:['Panhard et Levassor','«система Панара»: мотор спереди, сцепление и коробка передач — так будут устроены почти все автомобили'],
  1897:['Daimler','мотор «Феникс» с поплавковым карбюратором Майбаха'],1898:['Renault','прямая передача и карданный вал вместо цепей'],
  1899:['De Dion-Bouton','быстроходный мотор, который покупают десятки марок'],1901:['Mercedes','Mercedes 35 PS: сотовый радиатор, низкая рама, лёгкий мотор'],
  1902:['Mercedes','зажигание от магнето Bosch'],1903:['Napier','шестицилиндровый мотор — плавность, как у паровой машины'],
  1905:['Rolls-Royce','точность обработки деталей Генри Ройса'],1906:['Renault','съёмные обода Michelin: колесо меняют за минуты'],
  1907:['Rolls-Royce','Silver Ghost: тысячи миль без единой поломки'],1908:['Ford','Model T: ванадиевая сталь и планетарная коробка передач'],
  1909:['Cadillac','взаимозаменяемые детали — кубок Дьюара'],1910:['Isotta Fraschini','тормоза на все четыре колеса'],
  1911:['Cadillac','электрический стартер и свет Delco'],1912:['Peugeot','два распредвала вверху и четыре клапана на цилиндр'],
  1913:['Ford','движущийся конвейер: шасси за полтора часа'],1914:['Cadillac','первый массовый V8'],1915:['Packard','двенадцатицилиндровый Twin Six'],
  1919:['Hispano-Suiza','H6: мотор из авиации и тормоза с сервоусилителем'],1921:['Duesenberg','гидравлические тормоза'],
  1922:['Lancia','Lambda: несущий кузов и независимая подвеска'],1923:['Fiat','мотор с наддувом в Гран-при'],1924:['Bugatti','Type 35: литые колёса с тормозными барабанами'],
  1925:['Citroën','цельностальной кузов'],1926:['Delage','восьмицилиндровый мотор на 8000 оборотов'],1927:['Ford','Model A: безопасное стекло и тормоза на все колёса'],
  1928:['Cadillac','синхронизированная коробка передач'],1929:['Duesenberg','Model J — 265 сил']};
function carsN(v){const n=Math.round(v),t=fmtN(n);return `${t} ${/тыс|млн/.test(t)?'машин':plural(n,'машина','машины','машин')}`;}
const KING_SEG={people:'Народный король',middle:'Король среднего класса',lux:'Король люкса',sport:'Король спорткаров',truck:'Король грузовиков'};
function kingEffect(md,s){const K=s.kingFx;if(!K)return 0;const t=mi(s);let u=0;if((K.race||0)>t)u+=0.1;if((K.tech||0)>t)u+=0.12;if((K[segOf(md)]||0)>t)u+=0.12;if((K.dch||0)>t)u+=0.06;return u;}
function yearAwards(s,y){
  if((s.awardsY||0)>=y||y<1895)return;s.awardsY=y;rivalsCopy(s);
  const home=s.country,lines=[],mine=[],fx=s.kingFx=s.kingFx||{},until=mi(s)+12;
  const give=(k,title,why)=>{mine.push(title);fx[k]=until;s.titles.push({y,id:'king-'+k,name:`${title} ${y}`,w:0.2});s.rep=clamp(s.rep+2,0,100);addLog(`👑 ${title} ${y}: ${why}.`,'good');pendingToasts.push(`👑 ${title} ${y}`);};
  // король гонок: больше всех побед за год (больших — при равенстве)
  const W={};RACES.filter(r=>r.y===y).forEach(r=>{const x=s.cres[r.key];if(!x||!x.w||x.x)return;const o=W[x.w]=W[x.w]||{n:x.w,w:0,maj:0};o.w++;if(r.major)o.maj++;});
  const wl=Object.values(W).sort((a,b)=>b.w-a.w||b.maj-a.maj);
  if(wl[0]&&wl[0].w>=2&&!(wl[1]&&wl[1].w===wl[0].w&&wl[1].maj===wl[0].maj)){const k=wl[0],why=`${k.w} ${plural(k.w,'победа','победы','побед')} в гонках за год`;lines.push(`Король гонок — ${k.n===s.company?'«'+s.company+'»':k.n}: ${why}.`);if(k.n===s.company)give('race','Король гонок',why);}
  // король технологий: первенства раньше истории или машина намного лучше соперников класса
  const fr=Object.values(s.firsts||{}).filter(f=>f.y===y),act=s.models.filter(m=>m.status==='prod'||m.status==='sale');
  const best=act.map(m=>({m,S:classScore(m,s)})).sort((a,b)=>b.S-a.S)[0],TK=TECH_KING[y],tk=TK&&!playerMarque(TK[0],s)?TK:null;
  if(fr.length||(best&&best.S>=(tk?1.3:1.2))){const why=fr.length?`первыми в мире: ${fr.map(f=>f.name).join(', ')}`:`«${best.m.name}» на ${Math.round((best.S-1)*100)}% лучше соперников своего класса`;
    lines.push(`Король технологий — «${s.company}»: ${why}${tk?` (${tk[0]} — ${tk[1]} — на втором месте)`:''}.`);give('tech','Король технологий',why);}
  else if(tk)lines.push(`Король технологий — ${tk[0]}: ${tk[1]}.`);
  // короли классов: больше всех машин класса, проданных в стране за год
  SEGK.forEach(g=>{if(g==='sport'&&y<1910)return;const you=(s.segYPrev||{})[g]||0;
    const L=(COMPS[home]||[]).map((cp,i)=>({n:compName(cp,s),v:(((s.comps[home]||[])[i]||{}).ysPrev||{})[g]||0,pk:cp.pk})).filter(x=>x.pk!==s.pioneer&&x.v>0);
    L.push({n:s.company,v:you,you:1});L.sort((a,b)=>b.v-a.v);const top=L[0];if(!top||top.v<(g==='sport'?12:30))return;
    const why=`${carsN(top.v)} за год${L[1]&&L[1].v>0?`, у ${L[1].you?'«'+s.company+'»':L[1].n} — ${fmtN(Math.round(L[1].v))}`:''}`;
    lines.push(`${KING_SEG[g]} — ${top.you?'«'+s.company+'»':top.n}: ${why.replace(/\.$/,'')}.`);if(top.you)give(g,KING_SEG[g],why);});
  // гонщик года и пари по продажам
  const DC=dchFinish(s,y);if(DC){lines.push(`Гонщик года — ${DC.w.n}${DC.w.mq?` (${DC.w.mq})`:''}: ${fmtPts('gp',DC.w.pts)} очков, побед: ${DC.w.w}.`);if(DC.mine){mine.push('гонщик года');fx.dch=until;}}
  const SC=chalSales(s,y);if(SC)lines.push(SC.win?`Пари по продажам выиграно: «${s.company}» — ${carsN(SC.you)} класса «${SEG[SC.C.g].name}», ${SC.C.mq} — ${fmtN(SC.them)}. Выигрыш ${money(SC.C.stake)}.`:`Пари по продажам проиграно: ${SC.C.mq} — ${carsN(SC.them)} класса «${SEG[SC.C.g].name}», «${s.company}» — ${fmtN(SC.you)}. Проигрыш ${money(SC.C.stake)}.`);
  s.kings={y,lines,mine:mine.slice()};goalsResolve(s,y,mine);
  if(s.dch)Object.keys(s.dch).forEach(k=>{if(+k<y-2)delete s.dch[k];});
  // наследие: новое лучшее место среди великих марок — строка в итогах, а вход в десятку, тройку и первое место — праздник
  let lp=0,legUp=null;try{lp=legacyTable(s).place;}catch(_){}
  const lb=s.legBest||99;if(lp&&lp<lb){s.legBest=lp;if(lb<99){lines.push(`Наследие: «${s.company}» поднялась на ${lp}-е место среди великих марок эпохи (было ${lb}-е).`);if(lp===1||(lp<=3&&lb>3)||(lp<=10&&lb>10))legUp=lp;}}
  // кинохроника года: продажи, лучшая машина, победы, титулы и место в наследии — в газете с итогами
  let yr='';try{yearRecord(s,y);yr='year:'+y;reelUnlock(s,yr);}catch(e){console.warn('year reel',e);}
  if(!lines.length){const ev=yr&&s.pending.find(e=>e.kicker==='Итоги года');if(ev)ev.choices=(ev.choices||[['Читать дальше','ok']]).concat([['▶ Кинохроника года','reel:'+yr]]);return;}
  const own=mine.filter(t=>t!=='гонщик года'),dw=DC&&DC.mine?DC.w:null,dd=dw&&DRIVERS.find(x=>x.id===dw.id);
  const title=own.length?`«${s.company}» — ${own[0].charAt(0).toLowerCase()+own[0].slice(1)} ${y} года!`:dw?`${dw.n} — гонщик ${y} года!`:`Короли ${y} года`;
  pushEvent({own:mine.length?1:0,cel:own.length?['Титул года!',own.join(' · '),'👑']:legUp?[legUp===1?'Величайшая марка эпохи!':`${legUp}-е место в наследии!`,`«${s.company}» среди великих`,'🏛']:null,kicker:'Итоги года · по версии прессы',title,deck:own.length>1?`И ещё: ${own.slice(1).join(', ').toLowerCase()}`:`Автомобильные обозреватели назвали лучших за ${y} год`,
    img:dd&&IMG[DRIVER_WIKI[dd.id]]?DRIVER_WIKI[dd.id]:'',imgCap:dd?dd.n:'',choices:yr?[['Читать дальше','ok'],['▶ Кинохроника года','reel:'+yr]]:undefined,
    text:lines.map(l=>'— '+l).join('\n')+'\n'+(mine.length?'Титулы — бесплатная реклама: целый год покупатели будут помнить, чья марка лучшая, и охотнее выбирать ваши машины.':'Ваша марка пока без титулов. Победы в гонках, новинки раньше всех и продажи в своём классе — и газеты напишут о вас.')},true);
}

/* ---------- травмы (0.21): после тяжёлой аварии гонщик и механик лечатся месяцами; тяжёлая травма иногда заканчивает карьеру ---------- */
function miDate(t){return MONTHS_N[((t%12)+12)%12]+' '+(1895+Math.floor(t/12));}
function injOf(s,id){const o=s&&s.inj&&s.inj[id];return o&&o.until>mi(s)?o:null;}
function drvRetired(s,id){return !!(s&&s.retired&&s.retired[id]);}
function drvOut(s,id){return !!injOf(s,id)||drvRetired(s,id);}
function meOut(s){return drvOut(s,'me');}
// соперник или свободный гонщик лечится или ушёл
function aiOut(s,id){return !!(s&&((s.injAI&&(s.injAI[id]||0)>mi(s))||drvRetired(s,id)));}
function injNote(s,id){const o=injOf(s,id);if(o)return `🏥 ${o.txt} · вернётся в ${miDate(o.until)}`;return drvRetired(s,id)?'ушёл из гонок после травмы':'';}
function drvNameOf(s,id){return id==='me'?meName(s):id==='mech'?'Механик команды':(DRIVERS.find(d=>d.id===id)||{n:id}).n;}
// итоги гонки → больница и уход из гонок (свои — в журнале и газете; соперники — пропустят гонки)
function injApply(s,rc,res){s.inj=s.inj||{};s.injAI=s.injAI||{};s.retired=s.retired||{};const out=[],now=mi(s);
  res.forEach(r=>{const I=r.inj,M=r.mInj;
    if(I&&I.sev>=2&&r.drvId){const id=r.drvId,until=now+Math.max(1,I.months);
      if(r.you)s.inj[id]={until,sev:I.sev,txt:I.txt,race:rc.name};else s.injAI[id]=Math.max(s.injAI[id]||0,until);
      if(I.retire){s.retired[id]=rc.y;if(r.you&&id!=='me')s.drivers=(s.drivers||[]).filter(x=>x!==id);}
      out.push({id,nm:r.you&&id==='me'?meName(s):r.drv||'пилот',mine:!!r.you,sev:I.sev,txt:I.txt,until,retire:!!I.retire,car:r.you?r.label:r.name});}
    if(M&&M.sev>=2&&r.you){const until=now+Math.max(1,M.months);s.inj.mech={until,sev:M.sev,txt:M.txt,race:rc.name};
      out.push({id:'mech',nm:'механик команды',mine:true,sev:M.sev,txt:M.txt,until,retire:false,car:r.label});}});
  out.filter(o=>o.mine).forEach(o=>{const d=o.id!=='me'&&o.id!=='mech'&&DRIVERS.find(x=>x.id===o.id),img=d&&IMG[DRIVER_WIKI[d.id]]?DRIVER_WIKI[d.id]:'';
    const who=o.id==='me'?'Вы':o.nm,back=`вернётся в ${miDate(o.until)}`;
    const text=o.retire?`${o.txt}. Врачи запретили гонки — ${o.id==='me'?'за руль больше не сесть; гоняют пилоты по контракту':'он уходит из команды'}.`
      :o.id==='me'?`${o.txt}. До ${miDate(o.until)} за руль нельзя — на гонки едут пилоты по контракту или приглашённые.`
      :o.id==='mech'?`${o.txt}. Пока он в больнице, машины едут без механика — поломки чинить дольше.`:`${o.txt}. Пилот пропустит гонки и ${back}.`;
    pushEvent({kicker:'Команда',own:1,title:o.retire?`${who} ${o.id==='me'?'уходите':'уходит'} из гонок`:`${who} в больнице`,deck:`Авария в гонке «${rc.name}»`,text,img,imgCap:img?o.nm:''});});
  out.filter(o=>!o.mine).forEach(o=>addLog(`${o.nm} (${o.car}) после аварии в «${rc.name}»: ${o.txt}${o.retire?' — уходит из гонок':', пропустит гонки до '+miDate(o.until)}.`,'hist'));
  return out;}
// выписка из больницы
function injMonth(s){if(!s.inj)return;const now=mi(s);Object.keys(s.inj).forEach(id=>{const o=s.inj[id];if(o&&o.until<=now){delete s.inj[id];
  if(!drvRetired(s,id)&&(id==='me'||id==='mech'||(s.drivers||[]).includes(id)))addLog(`${id==='me'?'Вы вернулись':drvNameOf(s,id)+' вернулся'} из больницы — ${id==='me'?'можно снова садиться за руль':'снова в строю'}.`,'good');}});}
