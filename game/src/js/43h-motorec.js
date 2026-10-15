/* ================= 0.32: РЕКОРД МЕРНОЙ МИЛИ — ВЫЗОВ ДЛЯ МОТОЦИКЛОВ =================
   Мотогонки с управлением — в 0.33; а спор о скорости мотоциклов решают характеристики: мерная миля с хода, каждый едет один,
   секундомеры судей. Мотомарка соперника вызывает в газетах: чей мотоцикл быстрее? Ваш лучший мотоцикл в гоночной подготовке
   против их лучшего. Быстрее мирового рекорда своего года — рекорд в газетах всего мира.
   Места рекордов: Ашер под Парижем, Бруклендс, Дейтона-Бич, Кремона, Ингольштадтское шоссе. */
const MREC_VENUE={fr:'Ашер под Парижем — мерный километр',uk:'Бруклендс — мерная миля',us:'Дейтона-Бич — мерная миля',it:'шоссе у Кремоны — мерный километр',de:'Ингольштадтское шоссе — мерный километр'};
// мировой рекорд скорости мотоцикла, км/ч (по истории, округлённо): 1903 — Кёртисс, 1920 — Уокер на Indian, 1926 — Темпл, 1929 — Хенне на BMW
const MREC_WR={1903:103,1907:110,1909:122,1911:137,1913:150,1920:167,1923:174,1926:195,1928:207,1929:217};
function mrecWR(y){return tabAt(MREC_WR,y);}
// скорость мотоцикла на мерной миле: гоночная подготовка (без фары и крыльев, гонщик лёжа на баке)
function mrecSpeed(md,y){try{return carStats(md,1,y).vmax*3.6*1.06;}catch(_){return 0;}}
// лучший мотоцикл соперника: самые сильные мотор и рама эпохи
function mrecRival(y){const e=ENGINES.filter(x=>x.moto&&x.y<=y).sort((a,b)=>b.hp-a.hp)[0],c=CHASSIS.filter(x=>x.moto&&x.y<=y&&x.max>=(e?e.hp:0)).sort((a,b)=>a.kg-b.kg)[0]||CHASSIS.filter(x=>x.moto&&x.y<=y).pop();
  const g=GEARBOX.filter(x=>x.moto&&x.y<=y).sort((a,b)=>b.eff-a.eff)[0],k=BRAKES.filter(x=>x.moto&&x.y<=y).pop(),w=TYRES.filter(x=>x.moto&&x.y<=y).pop();
  return {e:e.id,g:g.id,c:c.id,k:k.id,b:'mb0',w:w.id,t:'t0',ai:1,name:'гоночный мотоцикл'};}
function mrecBest(s){return s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&isMoto(m)&&segOf(m)==='moto').map(m=>({m,v:mrecSpeed(m,s.y)})).sort((a,b)=>b.v-a.v)[0]||null;}
function offerMrec(s){if(s.y<1903||!lineOn(s,'moto'))return null;const P=mrecBest(s);if(!P)return null;const r=chalRnd(s,'mrec');
  const C0=[s.country].concat(Object.keys(COUNTRIES).filter(c=>c!==s.country&&dealerCount(s,c)>0&&!warCut(s,c))),c=r()<0.6||C0.length<2?s.country:C0[1+Math.floor(r()*(C0.length-1))];
  if(isWar(s.y,s.m,c))return null;const L=(MCOMPS[c]||[]).map((cp,i)=>({cp,i,v:compVol(cp,s)})).filter(x=>x.v>0&&!x.cp.imp).sort((a,b)=>b.v-a.v).slice(0,3);if(!L.length)return null;
  const R=L[Math.floor(r()*L.length)],nm=compName(R.cp,s),Ls=s.last,stake=Math.round(clamp(((Ls&&Ls.rev)||0)*0.03,80*cpi(s),6000*cpi(s))/50)*50;
  const C={type:'mrec',c,ci:R.i,mq:nm,venue:MREC_VENUE[c],md:P.m.id,end:mi(s)+2,x:stakeExtra(s,nm,'mr',1)};
  return {id:'mrec',kind:'mrec',title:`Мерная миля: «${s.company}» против ${nm}`,sub:`${MREC_VENUE[c]} · чей мотоцикл быстрее · мировой рекорд ${Math.round(mrecWR(s.y))} км/ч`,stake,C};}
function mrecNewsText(s,C,who,xs,st){const md=s.models.find(m=>m.id===C.md);
  return {verb:'спорит о скорости с',deck:`Мотоциклы: ${C.venue} · ставка ${st}`,
    text:`${who} заявил газетам: «Мотоциклы "${s.company}" хороши для почтальонов. Самый быстрый мотоцикл — наш. ${C.venue}: каждый едет один, с хода, судьи с секундомерами». Пари на ${money(C.stake)}.${xs}\nОт «${s.company}» поедет «${md?md.name:'—'}»: облегчённый, без фары и крыльев, гонщик лёжа на баке. Решают мотор, вес и обтекаемость. Мировой рекорд сейчас — ${Math.round(mrecWR(s.y))} км/ч: побить его — слава во всех газетах.`};}
function mrecAccept(s,C){const md=s.models.find(m=>m.id===C.md);addLog(`Вызов принят: мерная миля (${C.venue}) — «${md?md.name:''}» против ${C.mq}. Заезды — через два месяца. Пари ${money(C.stake)}.`,'good');return true;}
function mrecResolve(s){const C=s.chal;s.chal=null;let md=s.models.find(m=>m.id===C.md&&(m.status==='prod'||m.status==='sale'));if(!md){const P=mrecBest(s);md=P&&P.m;}
  if(!md){s.cash-=C.stake;addLog(`Мерная миля: у «${s.company}» нет мотоцикла — пари проиграно.`,'bad');try{duelOutcome(s,C,false,{forfeit:1});}catch(_){}return;}
  const me=mrecSpeed(md,s.y)*(0.96+Math.random()*0.07),rv=mrecSpeed(mrecRival(s.y),s.y)*(0.95+Math.random()*0.07),win=me>rv,wr=mrecWR(s.y),rec=win&&me>wr;
  if(win){s.cash+=C.stake;s.rep=clamp(s.rep+(rec?4:2),0,100);wfxAdd(s,rec?'*':C.c,'moto',rec?0.25:0.15,rec?10:6,rec?'мировой рекорд скорости':'победа на мерной миле');
    addLog(`⚔️ Мерная миля (${C.venue}): «${md.name}» — ${Math.round(me)} км/ч, у ${C.mq} — ${Math.round(rv)}.${rec?` Это мировой рекорд (был ${Math.round(wr)} км/ч)!`:''} +${money(C.stake)}.`,'good');
    if(rec){s.firsts=s.firsts||{};const k='mrec:'+s.y;if(!s.firsts[k])s.firsts[k]={y:s.y,name:`мировой рекорд скорости мотоцикла: ${Math.round(me)} км/ч`,who:'рекордсмены эпохи',hy:s.y};}
    try{trophyAdd(s,{kind:'medal',title:rec?`Мировой рекорд: ${Math.round(me)} км/ч`:`Мерная миля: ${C.venue}`,sub:`«${md.name}» · против ${C.mq}`,story:`На мерной миле (${C.venue}) «${md.name}» показал ${Math.round(me)} км/ч против ${Math.round(rv)} у ${C.mq}.${rec?' Быстрее мирового рекорда своего года.':''}`,key:'mrec|'+mi(s),carId:md.id,pt:rec?'Мировой рекорд':'Мерная миля'});}catch(_){}}
  else{s.cash-=C.stake;s.rep=clamp(s.rep-0.5,0,100);addLog(`Мерная миля (${C.venue}): ${C.mq} быстрее — ${Math.round(rv)} км/ч против ${Math.round(me)} у «${md.name}». −${money(C.stake)}.`,'bad');}
  try{duelOutcome(s,C,win,{carId:md.id});}catch(e){console.warn('duel',e);}}
function mrecCard(s,C,scT){const md=s.models.find(m=>m.id===C.md),moto=s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&isMoto(m)&&segOf(m)==='moto'),rv=Math.round(mrecSpeed(mrecRival(s.y),s.y));
  return `<section class="card chal"><div class="row"><span class="label">⚔️ Мерная миля</span><span class="pill warn">${esc(stakeText(C))}</span></div>${chalHeadRow(C,s)}
    <h3 style="margin-top:4px">«${esc(s.company)}» против ${esc(C.mq)}${scT}</h3>
    <p class="small" style="margin-top:4px">${esc(C.venue)} · заезды — в ${MONTHS_P[C.end%12]} · мировой рекорд ${Math.round(mrecWR(s.y))} км/ч</p>
    <p class="small" style="margin-top:4px">Поедет: <b>«${esc(md?md.name:'—')}»</b>${md?` · ≈${Math.round(mrecSpeed(md,s.y))} км/ч`:''} · у соперника ≈${rv} км/ч</p>
    ${moto.length>1?`<div class="chips" style="margin-top:6px">${moto.map(m=>`<button class="chip ${md&&m.id===md.id?'on':''}" data-act="chalCar" data-k="${m.id}">${esc(m.name)}<small>≈${Math.round(mrecSpeed(m,s.y))} км/ч</small></button>`).join('')}</div>`:''}
    <p class="small muted" style="margin-top:6px">Скорость решают мощность мотора, вес и обтекаемость; улучшения мотора в КБ (★) помогают.</p></section>`;}
