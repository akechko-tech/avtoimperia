/* ================= 0.60, правки 28.11: ИСПЫТАНИЯ АВИАТЕХНИКИ ДЛЯ АРМИИ =================
   Замечание автора: «очень не хватает испытаний авиатехники для армии». Конкурсы министерства есть с 0.38 (105h-air.js), но объявляются,
   только когда у фирмы уже есть годный аэроплан, и живут во вкладке «Гонки». Здесь:
   — государственные испытания по заявке: военный аэроплан, которого армия ещё не знает, можно отправить на испытания самому.
     Через три месяца — итог: оценка к эталону назначения не ниже 0,90 — машина принята (слава в войсках 5, как у прошедшей конкурс),
     и министерство заказывает её без конкурса — весной и осенью, в войну раз в квартал, пока она не устарела. Взнос — как у полигона машин;
   — советы заранее: министерство ищет такое-то назначение, ближайший выбор — в таком-то месяце; годного нет — что нужно;
   — строки о небе в карточке «Испытания ведомств» во вкладке «Модели». */
const AIR_ST_M=3,AIR_ST_PASS=0.9,AIR_ST_ROLES=['recon','fight','bomb','sea'];
function airStKnown(md){return (md.milWon||0)>0||(md.milRep||0)>=5;}
function airStRun(s,md){return ((s.air&&s.air.st)||[]).find(q=>q.md===md.id)||null;}
function airStWhy(s,md){const A=s.air,t=tNow(s);if(!A)return 'нет авиацеха';if(!AIR_ST_ROLES.includes(md.role))return 'этой машине государственные испытания не нужны';
  if(!(md.status==='prod'||md.status==='tool'||md.status==='sale'||(md.status==='proto'&&md.flown)))return 'аэроплан ещё не облётан';
  if(airStKnown(md))return 'армия уже знает эту машину';if(airStRun(s,md))return 'испытания уже идут';if(t<1910.9)return 'армия ещё не покупает аэропланы';
  if(s.country==='de'&&airVersailles(t)&&!A.abroad)return 'Германии запрещено строить аэропланы';return '';}
function airStFee(s){return typeof trFee==='function'?trFee(s):Math.round(800*cpi(s)/50)*50;}
function airStStart(s,id){const A=s.air,md=A&&A.models.find(m=>m.id===id);if(!md||airStWhy(s,md))return false;const fee=airStFee(s);if(s.cash<fee)return false;
  s.cash-=fee;(A.st=A.st||[]).push({md:md.id,at:mi(s)+AIR_ST_M});
  addLog(`«${md.name}» отправлен на государственные испытания (${money(fee)}): итог через ${AIR_ST_M} месяца.`);return true;}
function airStMonth(s){const A=s.air;if(!A||!A.st||!A.st.length)return;const t=mi(s),D=A.st.filter(q=>q.at<=t);A.st=A.st.filter(q=>q.at>t);
  D.forEach(q=>{const md=A.models.find(m=>m.id===q.md);if(!md||md.status==='off')return;const T=tNow(s),who=airMinistry(s.country,T,md.role),R=AIR_ROLES[md.role];
    const sc=airQ(md,T).q*Math.exp((Math.random()+Math.random()-1)*0.04),f=x=>x.toFixed(2).replace('.',',');
    if(sc>=AIR_ST_PASS){md.milRep=Math.max(md.milRep||0,5);md.stOk=t;
      pushEvent({own:1,noArt:1,kicker:'Государственные испытания',title:`${who}: «${md.name}» принят`,deck:`оценка ${f(sc)} к эталону (нужно ${f(AIR_ST_PASS)})`,
        text:`Комиссия облетала «${md.name}»: подъём на высоту на время, скорость на мерной базе, посадка в круг, разборка и осмотр. ${R.n} принят для отрядов. Теперь министерство заказывает его без конкурса — ${airWarOn(s.country,T)?'раз в квартал':'весной и осенью'}, пока машина не устарела.`,
        choices:[['Хорошо','ok']]},true);}
    else pushEvent({own:1,noArt:1,kicker:'Государственные испытания',title:`${who}: «${md.name}» не принят`,deck:`оценка ${f(sc)} к эталону, нужно ${f(AIR_ST_PASS)}`,
      text:`Комиссия облетала «${md.name}» и вернула заводу с замечаниями: эталон назначения лучше. Доведите машину (мотор, крыло, конструкция) и отправьте снова — или выиграйте конкурс министерства.`,
      choices:[['Понятно','ok']]},true);});}
// когда министерство выбирает в следующий раз: в мирное время — в марте и сентябре, в войну — раз в квартал (как в 105h-air.js)
function airMilNext(s){const war=airWarOn(s.country,tNow(s));for(let k=1;k<=12;k++){const m=(s.m+k)%12;if(war?m%3===1:(m===2||m===8))return {k,m,war};}return null;}
function airTrialAdvice(s,add){const A=s.air;if(!A||!A.models||s.mode==='racer')return;const t=tNow(s);if(t<1910.9)return;if(s.country==='de'&&airVersailles(t)&&!A.abroad)return;
  const N=airMilNext(s);if(!N)return;const who=r=>airMinistry(s.country,t,r);let gap=null;
  AIR_ST_ROLES.forEach(role=>{const R=AIR_ROLES[role];if(!R||R.y>s.y)return;const M=airMktRole(s.country,role,t,'mil');if(!(M>0.01))return;const B=airBestFor(s,role);
    if(B&&B.q>=0.6){const md=B.md;if(airStKnown(md)||airStRun(s,md)||airStWhy(s,md))return;
      add(50,'🎖',`${who(role)} ещё не знает «${md.name}» (${B.q.toFixed(2).replace('.',',')} к эталону): ближайший конкурс — в ${MONTHS_P[N.m]}${B.q>=AIR_ST_PASS?', а можно сразу на государственные испытания — с итогом от 0,90 машину будут заказывать без конкурса':''}.`,
        `На испытания · ${money(airStFee(s))}`,()=>{airStStart(s,md.id);},'models');}
    else if(!gap||M>gap.M)gap={role,M,B};});
  if(gap){const R=AIR_ROLES[gap.role];add(46,'✈',`${who(gap.role)} ${N.war?'раз в квартал':'весной и осенью'} выбирает: ${R.n.toLowerCase()} — ближайший раз в ${MONTHS_P[N.m]}. Годного у вас нет${gap.B?` (лучший — «${gap.B.md.name}», ${gap.B.q.toFixed(2).replace('.',',')} к эталону, нужно 0,60)`:''}: конкурс объявят, когда будет на чём лететь.`,
    'Конструктор',()=>{try{openAirDesigner();}catch(e){console.warn(e);}},'models');}}
// строки о небе для карточки «Испытания ведомств»
function airTrialLines(s){const A=s.air;if(!A||!A.models)return {L:[],B:[]};const L=[],B=[],t=tNow(s);
  try{airEvList(s).filter(ev=>ev.kind==='trial').forEach(ev=>{const st=airEvStatus(s,ev);if(st==='open'){L.push(`небо: ${esc(ev.name)} — запись открыта`);B.push(`<button class="btn sm" data-act="airEv" data-k="${esc(ev.key)}">${esc(ev.name.replace(/^Конкурс министерства: /,''))}</button>`);}
    else if(st==='soon'&&(ev.y-s.y)*12+(ev.m-s.m)<=12)L.push(`небо: ${esc(ev.name)} — ${MONTHS_N[ev.m]} ${ev.y}`);});}catch(e){console.warn('air trials',e);}
  const run=(A.st||[]).length;if(run)L.push(`государственные испытания аэропланов: ${run}`);
  if(t>=1910.9&&!airWarOn(s.country,t)){const N=airMilNext(s);if(N&&AIR_ST_ROLES.some(r=>AIR_ROLES[r].y<=s.y&&airMktRole(s.country,r,t,'mil')>0.01))L.push(`конкурсы министерства — весной и осенью, ближайший выбор в ${MONTHS_P[N.m]}`);}
  return {L,B};}
