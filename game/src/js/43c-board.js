/* ================= ИМПЕРИЯ НА ВИДУ: гонка за титулами года, доска вызовов, цели года ================= */
// Титулы «королей» решаются в январе (43b-drivers.js: yearAwards). Здесь — как они разыгрываются прямо сейчас:
// кто впереди, сколько у вас и чего не хватает. Доска вызовов: пари и цели можно брать самим, не дожидаясь газет.
function titlesRace(s){const y=s.y,home=s.country,rows=[];
  // король гонок: больше всех побед за год (не меньше двух)
  const W={};RACES.filter(r=>r.y===y).forEach(r=>{const x=s.cres[r.key];if(!x||!x.w||x.x)return;(W[x.w]=W[x.w]||{n:x.w,w:0}).w++;});
  const wl=Object.values(W).sort((a,b)=>b.w-a.w),me=(W[s.company]||{}).w||0,lead=wl.find(o=>o.n!==s.company),left=RACES.filter(r=>r.y===y&&r.m>=s.m&&!s.cres[r.key]).length;
  rows.push({k:'race',icon:'🏁',t:'Король гонок',you:me,them:lead?lead.w:0,themN:lead?lead.n:'',min:2,unit:v=>`${v} ${plural(v,'победа','победы','побед')}`,
    hint:me>=2&&me>(lead?lead.w:0)?'Титул ваш, если никто не обгонит до конца года':`Нужно не меньше 2 побед и больше, чем у других. Гонок до конца года: ${left}`});
  // король технологий: первенство года или машина на 20% лучше соперников класса
  const fr=Object.values(s.firsts||{}).filter(f=>f.y===y),act=s.models.filter(m=>m.status==='prod'||m.status==='sale'),best=act.map(m=>({m,S:classScore(m,s)})).sort((a,b)=>b.S-a.S)[0];
  const pc=best?Math.round((best.S-1)*100):0,TK=TECH_KING[y];
  rows.push({k:'tech',icon:'⚙️',t:'Король технологий',you:fr.length?100:Math.max(0,pc),them:20,themN:TK&&!playerMarque(TK[0],s)?TK[0]:'',min:20,pct:1,
    unit:v=>fr.length?'первенство года':`«${best?best.m.name:'—'}»: +${Math.max(0,pc)}% к соперникам`,hint:fr.length?'Первенство в мире — титул почти наверняка ваш':`Нужна машина на 20% лучше соперников своего класса или первенство раньше истории${TK&&!playerMarque(TK[0],s)?` (в истории — ${TK[0]}: ${TK[1]})`:''}`});
  // короли классов: больше всех машин класса, проданных в стране за год
  SEGK.forEach(g=>{if(g==='sport'&&y<1910)return;const you=Math.round((s.segY||{})[g]||0);
    const L=(COMPS[home]||[]).map((cp,i)=>({n:compName(cp,s),v:Math.round((((s.comps[home]||[])[i]||{}).ys||{})[g]||0),pk:cp.pk})).filter(x=>x.pk!==s.pioneer&&x.v>0).sort((a,b)=>b.v-a.v);
    if(!you&&!L.length)return;const top=L[0],mn=g==='sport'?12:30;
    rows.push({k:g,icon:'👑',t:KING_SEG[g],you,them:top?top.v:0,themN:top?top.n:'',min:mn,unit:v=>carsN(v),hint:you>(top?top.v:0)&&you>=mn?'Вы впереди всех в стране':top?`Лидер — ${top.n}: ${carsN(top.v)} с января. Продажи в стране, класс «${SEG[g].name}»`:''});});
  // гонщик года
  const tb=typeof dchTable==='function'?dchTable(s,y):[];if(tb.length){const mine=tb.find(r=>r.mine),top=tb[0];
    rows.push({k:'dch',icon:'🏆',t:'Гонщик года',you:mine?mine.pts:0,them:top&&!top.mine?top.pts:(tb.find(r=>!r.mine)||{}).pts||0,themN:top&&!top.mine?top.n:'',min:1,unit:v=>`${fmtPts('gp',v)} очк.`,hint:mine?`Ваш лучший пилот — ${mine.n}, ${tb.indexOf(mine)+1}-е место`:'Ваших пилотов ещё нет в зачёте'});}
  return rows;}
function titlesCard(s){const rows=titlesRace(s),K=s.kings;
  const R=rows.map(r=>{const lead=r.you>=r.min&&r.you>r.them,mx=Math.max(1,r.you,r.them,r.min);
    return `<div class="tr-row ${lead?'lead':''}"><div class="tr-h"><span>${r.icon} ${esc(r.t)}</span>${lead?'<b class="pill good">👑 ваш</b>':r.themN?`<small>впереди: ${esc(r.themN)}</small>`:''}</div>
      <div class="leg-row"><span>Вы</span><div class="bar"><i style="width:${Math.min(100,r.you/mx*100)}%;background:var(--brass)"></i></div><b class="num">${r.pct?Math.round(r.you)+'%':fmtN(r.you)}</b></div>
      ${r.them?`<div class="leg-row"><span>${esc((r.themN||'соперник').slice(0,12))}</span><div class="bar"><i style="width:${Math.min(100,r.them/mx*100)}%;background:var(--muted)"></i></div><b class="num">${r.pct?r.them+'%':fmtN(r.them)}</b></div>`:''}
      <p class="small muted">${esc(r.unit(r.you))} · ${esc(r.hint||'')}</p></div>`;}).join('');
  const got=(s.titles||[]).filter(t=>/^king-|^dch/.test(t.id||'')||/Гонщик года/.test(t.name||''));
  return `<section class="card tr-card" id="sec-titles"><div class="row"><h2>Гонка за титулы ${s.y}</h2><span class="pill">${got.length?`👑 ${got.length}`:'титулов пока нет'}</span></div>
    <p class="small muted" style="margin-top:4px">В январе газеты называют «королей» прошлого года. Титул — слава, и весь следующий год: гонки +10%, КБ +12% или спрос в классе +12%.</p>
    ${R}${K&&K.lines&&K.lines.length?foldCard('kings'+K.y,false,`<h3>Короли ${K.y} года</h3>`,`<ul class="log">${K.lines.map(l=>`<li><p>${esc(l)}</p></li>`).join('')}</ul>`,K.mine&&K.mine.length?'ваши титулы: '+K.mine.join(', '):'без ваших титулов'):''}
    ${got.length?`<div class="tags" style="margin-top:8px">${got.slice(-8).map(t=>`<span class="pill warn">👑 ${esc(t.name)}</span>`).join('')}</div>`:''}</section>`;}
/* ---------- доска вызовов: пари с соперниками и цели года ---------- */
function boardOffers(s){const out=[];if(s.over)return out;
  if(!s.chal){
    const L=RACES.filter(rc=>rc.y===s.y&&rc.m>s.m&&rc.m<=s.m+4&&!GBC_IDS.includes(rc.id)&&raceEligible(rc,s)&&!raceWarBlocked(rc,s)&&!s.cres[rc.key]&&s.raceDone[rc.key]===undefined);
    const rc=L.slice().sort((a,b)=>(b.major?1:0)-(a.major?1:0)||a.m-b.m)[0];
    if(rc&&raceCarsFor(s).length){const T=fieldTeams(rc,s,3).filter(t=>t.mq&&t.mq.length),t=T.find(t=>t.c===s.country)||T[0];
      if(t)out.push({id:'race',title:`Пари с ${t.n}: «${rc.name}»`,sub:`${MONTHS[rc.m]} ${rc.y} · ваша лучшая машина должна финишировать выше лучшей ${t.n}`,stake:Math.max(100,Math.round(racePrize(rc)*0.6/50)*50),C:{type:'race',rk:rc.key,mq:t.n,x:stakeExtra(s,t.n,'b')}});}
    const mk=s.last&&s.last.mk&&s.last.mk[s.country];
    if(mk&&mk.segs&&s.m<=8){const g=SEGK.filter(g=>(mk.segs[g].you||0)>=3).sort((a,b)=>mk.segs[b].you-mk.segs[a].you)[0];
      if(g){const you=mk.segs[g].you,cps=(COMPS[s.country]||[]).map((cp,i)=>({cp,i,v:compVol(cp,s)*((cp.mix&&cp.mix[g])||0)})).filter(x=>x.cp.pk!==s.pioneer&&x.v>0).sort((a,b)=>b.v-a.v),R=cps.find(x=>x.v<=you*12*3&&x.v>=you*12/3);
        if(R){const nm=compName(R.cp,s);out.push({id:'sales',title:`Пари с ${nm}: класс «${SEG[g].name}»`,sub:`кто продаст больше в стране до конца ${s.y} года`,stake:Math.round(clamp(((s.last&&s.last.rev)||0)*0.15,200*cpi(s),25000*cpi(s))/50)*50,C:{type:'sales',g,mq:nm,ci:R.i,y:s.y,x:stakeExtra(s,nm,'b')}});}}}}
  // цели года: без ставки, награда — деньги и репутация (провал — лишь немного репутации)
  const G2=s.goals||[],has=k=>G2.some(q=>q.k===k&&q.y===s.y);
  if(s.m<=9&&!has('race')&&RACES.filter(r=>r.y===s.y&&r.m>=s.m&&raceEligible(r,s)).length>=2)out.push({id:'goal:race',title:`Цель: Король гонок ${s.y}`,sub:'выиграть не меньше двух гонок за год — и больше всех',reward:Math.round(1500*cpi(s)/50)*50,goal:{k:'race'}});
  const mk2=s.last&&s.last.mk&&s.last.mk[s.country];if(s.m<=6&&mk2&&mk2.segs){const g=SEGK.filter(g=>(mk2.segs[g].you||0)>=5).sort((a,b)=>mk2.segs[b].you-mk2.segs[a].you)[0];
    if(g&&!has(g))out.push({id:'goal:'+g,title:`Цель: ${KING_SEG[g]} ${s.y}`,sub:`продать в стране больше всех машин класса «${SEG[g].name}» за год`,reward:Math.round(2500*cpi(s)/50)*50,goal:{k:g}});}
  if(!has('tech')&&s.m<=9)out.push({id:'goal:tech',title:`Цель: Король технологий ${s.y}`,sub:'первенство раньше истории или машина на 20% лучше соперников класса',reward:Math.round(1200*cpi(s)/50)*50,goal:{k:'tech'}});
  return out;}
function boardTake(s,id){const o=boardOffers(s).find(x=>x.id===id);if(!o)return;
  if(o.C){s.chal=Object.assign({},o.C,{stake:o.stake,acc:0});s.chalLast=mi(s);drvResolve(s,'chalYes');}
  else if(o.goal){(s.goals=s.goals||[]).push({k:o.goal.k,y:s.y,reward:o.reward,name:o.title.replace(/^Цель: /,'')});addLog(`🎯 Цель года: ${o.title.replace(/^Цель: /,'')}. Награда — ${money(o.reward)} и слава.`,'good');pendingToasts.push('🎯 Цель принята');}
  save();render();}
// Итоги целей — в январе, вместе с «королями» года
function goalsResolve(s,y,mine,KW){const L=(s.goals||[]).filter(q=>q.y===y);if(!L.length)return;s.goals=(s.goals||[]).filter(q=>q.y!==y);KW=KW||{};
  L.forEach(q=>{const title=q.k==='race'?'Король гонок':q.k==='tech'?'Король технологий':KING_SEG[q.k],ok=(mine||[]).some(t=>t===title);
    if(ok){s.cash+=q.reward;s.rep=clamp(s.rep+2,0,100);addLog(`🎯 Цель года выполнена: ${q.name}. Награда ${money(q.reward)}.`,'good');pendingToasts.push(`🎯 ${q.name}: +${money(q.reward)}`);
      trophyAdd(s,{kind:'goal',title:`Цель ${y}: ${q.name}`,sub:`награда ${money(q.reward)}`,story:`Вы сами взяли эту цель на доске вызовов — и выполнили её.`,key:'goal|'+q.k+'|'+y,y,m:11});}
    else{s.rep=clamp(s.rep-1,0,100);addLog(`Цель года не выполнена: ${q.name}. Газеты напомнили об обещании.`,'bad');}
    try{goalScene(s,q,ok,KW[q.k]&&KW[q.k]!==s.company?KW[q.k]:'');}catch(e){console.warn('goal scene',e);}});}
function boardCard(s){const O=boardOffers(s),A=[],C=s.chal&&s.chal.acc?s.chal:null,GL=(s.goals||[]).filter(q=>q.y===s.y);
  if(C)A.push(chalCard(s,C.type==='race'?'race':'market'));
  GL.forEach(q=>{const r=titlesRace(s).find(x=>x.k===q.k);A.push(`<section class="card chal"><div class="row"><span class="label">🎯 Цель года</span><span class="pill good">${money(q.reward)}</span></div><h3 style="margin-top:4px">${esc(q.name)}</h3>${r?`<p class="small" style="margin-top:4px">Сейчас: ${esc(r.unit(r.you))}${r.themN?` · впереди: ${esc(r.themN)} (${r.pct?r.them+'%':fmtN(r.them)})`:''}</p>`:''}</section>`);});
  return `<section class="card board" id="sec-board"><div class="row"><h2>⚔️ Доска вызовов</h2><span class="pill">${(C?1:0)+GL.length} ${plural((C?1:0)+GL.length,'активный','активных','активных')}</span></div>
    <p class="small muted" style="margin-top:4px">Пари с соперниками и цели года: берите сами. Выигрыш — деньги и заголовки газет, проигрыш пари — ставка и насмешки прессы.</p>
    ${A.join('')}
    ${O.length?`<div class="stack" style="margin-top:8px">${O.map(o=>`<button class="btn block board-o" data-act="boardTake" data-k="${o.id}"><b>${esc(o.title)}</b><small>${esc(o.sub)} · ${o.stake?'ставка '+esc(stakeText({stake:o.stake,x:o.C.x})):'награда '+money(o.reward)}${o.C&&rivalryScore(s,o.C.mq)?' · счёт '+rivalryScore(s,o.C.mq):''}</small></button>`).join('')}</div>`:`<p class="small muted" style="margin-top:8px">${C?'Одно пари за раз: сначала завершите текущее.':'Новых вызовов пока нет — появятся с новыми гонками и продажами.'}</p>`}</section>`;}
