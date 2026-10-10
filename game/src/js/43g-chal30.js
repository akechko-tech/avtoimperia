/* ================= 0.30: НОВЫЕ ВЫЗОВЫ — ПРЕСТИЖ И СЛАВА =================
   • Конкурс элегантности (престиж): лучшую вашу машину выставляют на смотр рядом с машиной соперника — судьи (графини,
     художники, кутюрье) оценивают кузов, отделку, новинки оснащения; в Булонском лесу, Сан-Ремо, Херлингеме, Баден-Бадене,
     Ньюпорте. Победа — газеты светской хроники, богатые покупатели полгода охотнее берут ваш люкс.
   • Рекламная экспедиция (слава): через континент — Пекин — Париж (1907), Нью-Йорк — Париж (1908), через Сахару (1922),
     «Чёрный рейд» по Африке (1924). Машина соперника идёт тем же путём. Победа — о марке узнают во всех странах
     (узнаваемость за границей растёт), поражение — газеты пишут, чья машина застряла в песках.
   Вызовы приходят и из стран, где у вас дилеры: там и смотр, и газеты. */
const ELEG_VENUE={fr:['Булонский лес, Париж','графиня де Ноай и Поль Пуаре'],it:['Сан-Ремо','графиня ди Сан-Мартино'],uk:['Херлингем-клуб, Лондон','леди Говард де Уолден'],
  de:['Баден-Баден','великая герцогиня Баденская'],us:['Ньюпорт, Род-Айленд','миссис Вандербильт']};
const EXPED_ROUTES=[[1907,'Пекин — Париж',16000,'В 1907 году «Итала» князя Боргезе прошла от Пекина до Парижа за два месяца: Гоби, Байкал, Сибирь — а дорог почти нигде не было.'],
  [1908,'Нью-Йорк — Париж через Аляску и Сибирь',35000,'В 1908 году «Томас Флаер» обошёл полмира — из Нью-Йорка через Сибирь в Париж — и выиграл «Великую гонку».'],
  [1922,'Через Сахару: Туггурт — Тимбукту',3200,'Зимой 1922–1923 годов полугусеничные «Ситроены» впервые пересекли Сахару — двадцать дней по пескам.'],
  [1924,'«Чёрный рейд»: Алжир — Мадагаскар',20000,'В 1924–1925 годах экспедиция «Ситроена» прошла всю Африку с севера на юг; фильм о ней смотрела вся Европа.']];
function expedRoute(y){let r=null;EXPED_ROUTES.forEach(x=>{if(x[0]<=y)r=x;});return r;}
// лучшая машина на смотр: люкс (или средний класс) с самой высокой оценкой; закрытый кузов и новинки оснащения — в плюс
function elegScore(md,s,c){let k=1;try{k=classScore(md,s,c);}catch(_){}const b=parts(md).b,eq=typeof eqOf==='function'?eqOf(md).length:0,g=segOf(md);
  return k*(g==='lux'?1.12:g==='sport'?1.04:0.92)*(b.closed?1.08:1)*(1+0.035*eq)*(md.t==='t2'?1.06:1);}
function elegPick(s,c){return s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&!isTruck(m)&&['lux','middle','sport'].includes(segOf(m))).map(m=>({m,v:elegScore(m,s,c)})).sort((a,b)=>b.v-a.v)[0]||null;}
function offerEleg(s){if(s.y<1908)return null;const r=chalRnd(s,'eleg');const C0=[s.country].concat(Object.keys(COUNTRIES).filter(c=>c!==s.country&&dealerCount(s,c)>0&&!warCut(s,c)));
  const c=r()<0.5||C0.length<2?s.country:C0[1+Math.floor(r()*(C0.length-1))],v=ELEG_VENUE[c];if(!v||isWar(s.y,s.m,c))return null;const P=elegPick(s,c);if(!P)return null;
  const cps=(COMPS[c]||[]).map((cp,i)=>({cp,i,v:compVol(cp,s)*(((cp.mix&&cp.mix.lux)||0)+0.3*((cp.mix&&cp.mix.middle)||0))})).filter(x=>!ownComp(x.cp,s)&&!holdOf(s,c,x.i)&&x.v>0).sort((a,b)=>b.v-a.v).slice(0,3);if(!cps.length)return null;
  const R=cps[Math.floor(r()*cps.length)],nm=compName(R.cp,s),L=s.last,stake=Math.round(clamp(((L&&L.rev)||0)*0.05,120*cpi(s),9000*cpi(s))/50)*50;
  const C={type:'eleg',c,ci:R.i,mq:nm,venue:v[0],judge:v[1],md:P.m.id,end:mi(s)+2,x:stakeExtra(s,nm,'be',1)};
  return {id:'eleg',kind:'eleg',title:`Конкурс элегантности с ${nm}: ${v[0]}`,sub:`${c===s.country?'':COUNTRIES[c].name+' · '}судьи — ${v[1]} · кузов, отделка, новинки`,stake,C};}
function offerExped(s){const rt=expedRoute(s.y);if(!rt||s.y>rt[0]+3)return null;const r=chalRnd(s,'exped');if(isWar(s.y,s.m,s.country))return null;
  const cars=s.models.filter(m=>m.status==='prod'||m.status==='sale');if(!cars.length)return null;const P=cars.map(m=>({m,v:carBase(m,0,s.y).rel*(isTruck(m)?1.08:1)})).sort((a,b)=>b.v-a.v)[0];
  // соперник — сильная марка другой страны (так и было: «Итала», «Томас», «Де Дион», «Спайкер»)
  const L=[];Object.keys(COUNTRIES).forEach(c=>{if(c===s.country)return;(COMPS[c]||[]).forEach((cp,i)=>{if(!ownComp(cp,s)&&!holdOf(s,c,i)&&compAlive(cp,s))L.push({c,i,cp,v:compVol(cp,s)});});});
  if(!L.length)return null;L.sort((a,b)=>b.v-a.v);const R=L[Math.floor(r()*Math.min(5,L.length))],nm=compName(R.cp,s),Ls=s.last;
  const stake=Math.round(clamp(((Ls&&Ls.rev)||0)*0.1,200*cpi(s),20000*cpi(s))/50)*50;
  const C={type:'exped',c:R.c,ci:R.i,mq:nm,route:rt[1],km:rt[2],rh:rt[3],md:P.m.id,g:segOf(P.m),end:mi(s)+3,x:stakeExtra(s,nm,'bx',1)};
  return {id:'exped',kind:'exped',title:`Экспедиция ${rt[1]}: «${s.company}» против ${nm}`,sub:`${fmtN(rt[2])} км без дорог · кто первым и без поломок · слава во всех странах`,stake,C};}
function chalNewsText30(s,C,who,xs,st){const md=s.models.find(m=>m.id===C.md);
  if(C.type==='eleg')return {verb:'зовёт на смотр',deck:`Конкурс элегантности: ${C.venue}${C.c!==s.country?' ('+COUNTRIES[C.c].name+')':''} · ставка ${st}`,
    text:`${who} заявил светской хронике: «Машины "${s.company}" ездят, но красивы ли они? На конкурсе элегантности — ${C.venue} — пусть судит ${C.judge}». Пари на ${money(C.stake)}.${xs}\nОт «${s.company}» поедет «${md?md.name:'—'}»: судьи смотрят на кузов, отделку, новинки оснащения (электрический свет, стартер), на то, как машина подходит к платьям дам. Победа — полгода богатые покупатели охотнее берут ваши дорогие машины.`};
  return {verb:'вызывает в экспедицию',deck:`${C.route} · ${fmtN(C.km)} км · ставка ${st}`,
    text:`${who} предлагает газетам пари: «Наша машина пройдёт ${C.route} быстрее и без поломок, чем машина "${s.company}"». ${fmtN(C.km)} км без дорог: пески, броды, перевалы, бензин везут вперёд на верблюдах и поездах.${xs}\nОт «${s.company}» пойдёт «${md?md.name:'—'}». Победителя будут знать во всех странах — газеты Европы и Америки печатают сводки каждый день.\n${C.rh}`};}
function chalAccept30(s,C){const md=s.models.find(m=>m.id===C.md);
  if(C.type==='eleg')addLog(`Вызов принят: конкурс элегантности (${C.venue}) — «${md?md.name:''}» против ${C.mq}. Пари ${money(C.stake)}.`,'good');
  else addLog(`Вызов принят: экспедиция ${C.route} — «${md?md.name:''}» против ${C.mq}. Итоги — через три месяца. Пари ${money(C.stake)}.`,'good');return true;}
function elegResolve(s){const C=s.chal;s.chal=null;let md=s.models.find(m=>m.id===C.md&&(m.status==='prod'||m.status==='sale'));if(!md){const P=elegPick(s,C.c);md=P&&P.m;}
  if(!md){s.cash-=C.stake;addLog(`Конкурс элегантности: «${s.company}» не выставила машину — пари проиграно.`,'bad');try{duelOutcome(s,C,false,{forfeit:1});}catch(_){}return;}
  const me=elegScore(md,s,C.c)*(0.88+Math.random()*0.24),rv=(1.02+0.1*Math.random())*(s.y>=1920?1.05:1),win=me>rv;
  if(win){s.cash+=C.stake;s.rep=clamp(s.rep+2,0,100);wfxAdd(s,C.c,'lux',0.22,6,'конкурс элегантности');addLog(`⚔️ Конкурс элегантности (${C.venue}): гран-при у «${md.name}»! +${money(C.stake)}.`,'good');
    try{trophyAdd(s,{kind:'medal',title:`Гран-при элегантности: ${C.venue}`,sub:`«${md.name}» · против ${C.mq}`,story:`На конкурсе элегантности (${C.venue}) судьи — ${C.judge} — отдали гран-при «${md.name}».`,key:'eleg|'+mi(s),carId:md.id,pt:'Гран-при элегантности'});}catch(_){}}
  else{s.cash-=C.stake;s.rep=clamp(s.rep-0.5,0,100);addLog(`Конкурс элегантности (${C.venue}): судьи предпочли машину ${C.mq}. −${money(C.stake)}.`,'bad');}
  try{duelOutcome(s,C,win,{carId:md.id});}catch(e){console.warn('duel',e);}}
function expedResolve(s){const C=s.chal;s.chal=null;let md=s.models.find(m=>m.id===C.md&&(m.status==='prod'||m.status==='sale'));if(!md)md=s.models.find(m=>m.status==='prod');
  if(!md){s.cash-=C.stake;addLog(`Экспедиция ${C.route}: машины нет — пари проиграно.`,'bad');try{duelOutcome(s,C,false,{forfeit:1});}catch(_){}return;}
  const cp=(COMPS[C.c]||[])[C.ci],rv=rivalCar(RIVAL_CAR[segOf(md)]?segOf(md):'middle',s.y),rmd={...rv[2],t:'t1',paint:'#333',name:rv[1],made:0,ai:1};
  // путь без дорог: поломки вдвое чаще, чем в пробеге; четыре поломки — машину бросают в пути
  const R=trialSim(s,{km:C.km},md,rmd,()=>Math.random()*0.62),lostMe=R.pM>=5,lostTh=R.pT>=5,win=!lostMe&&(lostTh||R.win);
  if(win){s.cash+=C.stake;s.rep=clamp(s.rep+4,0,100);wfxAdd(s,'*',segOf(md),0.18,8,'экспедиция');if(s.aw)for(const c in COUNTRIES)if(c!==s.country)s.aw[c]=clamp((s.aw[c]||0)+0.08,0,1);
    addLog(`⚔️ Экспедиция ${C.route}: «${md.name}» пришла первой (поломок ${R.pM}, у ${C.mq} — ${R.pT}${lostTh?', их машину бросили в пути':''}). О марке пишут во всех странах. +${money(C.stake)}.`,'good');
    try{trophyAdd(s,{kind:'charter',title:`Экспедиция: ${C.route}`,sub:`«${md.name}» · ${fmtN(C.km)} км`,story:`«${md.name}» прошла ${C.route} (${fmtN(C.km)} км) раньше машины ${C.mq}.`,key:'exped|'+mi(s),carId:md.id,pt:'Экспедиция пройдена первой'});}catch(_){}}
  else{s.cash-=C.stake;s.rep=clamp(s.rep-1,0,100);addLog(`Экспедиция ${C.route}: ${lostMe?`«${md.name}» бросили в пути после ${R.pM} поломок`:`${C.mq} пришёл первым (поломок у вас ${R.pM}, у них ${R.pT})`}. −${money(C.stake)}.`,'bad');}
  try{duelOutcome(s,C,win,{carId:md.id,trial:{rows:R.rows,pM:R.pM,pT:R.pT,kmhM:R.kmhM,kmhT:R.kmhT,md:md.name,rv:C.mq,route:C.route,km:C.km}});}catch(e){console.warn('duel',e);}}
function chalCard30(s,C,scT){const md=s.models.find(m=>m.id===C.md);
  if(C.type==='eleg'){const cars=s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&!isTruck(m)&&['lux','middle','sport'].includes(segOf(m)));
    return `<section class="card chal"><div class="row"><span class="label">⚔️ Конкурс элегантности</span><span class="pill warn">${esc(stakeText(C))}</span></div>${chalHeadRow(C,s)}
      <h3 style="margin-top:4px">«${esc(s.company)}» против ${esc(C.mq)}${scT}</h3>
      <p class="small" style="margin-top:4px">${esc(C.venue)}${C.c!==s.country?' · '+esc(COUNTRIES[C.c].name):''} · судьи — ${esc(C.judge)} · смотр — в ${MONTHS_P[C.end%12]}</p>
      <p class="small" style="margin-top:4px">На смотр: <b>«${esc(md?md.name:'—')}»</b>${md?` · оценка ${Math.round(elegScore(md,s,C.c)*100)}`:''}</p>
      ${cars.length>1?`<div class="chips" style="margin-top:6px">${cars.map(m=>`<button class="chip ${md&&m.id===md.id?'on':''}" data-act="chalCar" data-k="${m.id}">${esc(m.name)}<small>оценка ${Math.round(elegScore(m,s,C.c)*100)}</small></button>`).join('')}</div>`:''}
      <p class="small muted" style="margin-top:6px">Судьи ценят дорогой класс, закрытый кузов, богатую отделку и новинки оснащения.</p></section>`;}
  return `<section class="card chal"><div class="row"><span class="label">⚔️ Экспедиция</span><span class="pill warn">${esc(stakeText(C))}</span></div>${chalHeadRow(C,s)}
    <h3 style="margin-top:4px">«${esc(s.company)}» против ${esc(C.mq)}${scT}</h3>
    <p class="small" style="margin-top:4px">${esc(C.route)} · ${fmtN(C.km)} км · итоги — в ${MONTHS_P[C.end%12]}</p>
    <p class="small" style="margin-top:4px">Пойдёт: <b>«${esc(md?md.name:'—')}»</b>${md?` (надёжность ${Math.round(carBase(md,0,s.y).rel*100)}%)`:''}</p>
    <p class="small muted" style="margin-top:6px">${esc(C.rh||'')}</p></section>`;}
// выбор машины для смотра: та же кнопка, что у пробега
Object.assign(RACE_ACT,{chalCar:d=>{const s=G,C=s.chal;if(!C||!['trial','eleg','exped'].includes(C.type))return;const m=s.models.find(x=>x.id===+d.k||String(x.id)===String(d.k));if(!m)return;C.md=m.id;toast(`${C.type==='eleg'?'На смотр':C.type==='exped'?'В экспедицию':'На пробег'} — «${m.name}»`);rerender();}});
