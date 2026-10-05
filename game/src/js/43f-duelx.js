/* ================= 0.26: ДУЭЛИ — машина против рысака, аэроплана и экспресса =================
   В истории машины меряли не только друг с другом. На ярмарках 1890-х машина выходила против лучшего рысака округи —
   и до 1900 года лошадь часто выигрывала. В 1914 году Барни Олдфилд на «Фиате» и авиатор Линкольн Бичи на биплане
   объехали 35 городов Америки с «Чемпионатом Вселенной». А в 1930 году Rover, Alvis и Bentley Вулфа Барнато
   обгоняли «Голубой поезд» с Ривьеры до Кале. Дуэль приходит газетой; принять — значит выставить лучшую серийную машину.
   Исход решают скорость и надёжность машины (и дороги эпохи); выигрыш — ставка, слава и грамота в шкаф. */
const DX_KIND={
  horse:{y0:1896,y1:1906,n:'рысак',title:'Машина против рысака',who:'хозяин рысака',
    venue:{us:'Ипподром Наррагансетт-парк',fr:'Ипподром Венсен',uk:'Ипподром Кристал-Пэлас',de:'Ипподром Хоппегартен',it:'Ипподром Сан-Сиро'},
    horse:{us:'Дэн Патч',fr:'Фюшия',uk:'Вест-Энд',de:'Ла Белле',it:'Варенне'},km:3.2,
    opp:y=>46+0.2*(y-1896),hist:'На ярмарках и ипподромах 1890-х машина выходила против лучшего рысака округи. Публика ставила на лошадь — и до 1900 года часто выигрывала: моторы глохли, цепи слетали, а рысак пробегал милю за две минуты.'},
  plane:{y0:1911,y1:1916,cc:'us,fr,uk',n:'аэроплан',title:'Машина против аэроплана',who:'импресарио авиашоу',
    venue:{us:'Ярмарочный ипподром в Огайо',fr:'Аэродром Реймса',uk:'Брукландс'},pilot:{us:'Линкольн Бичи',fr:'Ролан Гаррос',uk:'Клод Грэм-Уайт'},km:8,
    opp:y=>88+2*(y-1911),hist:'В 1914 году автогонщик Барни Олдфилд на 100-сильном «Фиате» и авиатор Линкольн Бичи на биплане Кёртисса объехали 35 городов Америки с «Чемпионатом Вселенной». Публика валом валила посмотреть, кто быстрее, а дуэлянты заработали больше 250 000 долларов.'},
  train:{y0:1905,y1:1929,n:'экспресс',title:'Машина против экспресса',who:'железнодорожная компания',
    route:{uk:['Канны — Кале','«Средиземноморский экспресс»',1180,58],fr:['Ницца — Кале','«Средиземноморский экспресс»',1210,58],us:['Лос-Анджелес — Сан-Франциско','ночной «Жаворонок»',760,56],de:['Берлин — Мюнхен','скорый «Д-цуг»',660,62],it:['Милан — Рим','скорый поезд',630,55]},
    opp:(y,r)=>r[3]*(1+0.004*(y-1905)),hist:'В январе 1930 года Rover Light Six обогнал «Голубой поезд» от Сен-Рафаэля до Кале, а в марте Вулф Барнато на Bentley Speed Six успел из Канн в лондонский клуб раньше, чем поезд пришёл в Кале. Обогнать экспресс на дорогах эпохи — значит ехать быстро и ни разу не сломаться.'}};
// лучшая машина для дуэли: самая быстрая серийная (не грузовик)
function dxCar(s){return s.models.filter(m=>(m.status==='prod'||m.status==='sale')&&!isTruck(m)).map(m=>({m,st:carStats(m,0,s.y)})).sort((a,b)=>b.st.vmax-a.st.vmax)[0]||null;}
function dxTrainOk(s,v){const d=DX_KIND.train,r=d.route[s.country]||d.route.fr,road=clamp(0.42+0.009*(s.y-1905),0.42,0.62),va=Math.min(v*road,95);return r[2]/va+r[2]/600<=0.98*r[2]/d.opp(s.y,r);}
function dxOffer(s){const P=dxCar(s);if(!P)return null;const K=Object.entries(DX_KIND).filter(([k,d])=>s.y>=d.y0&&s.y<=d.y1&&(!d.cc||d.cc.split(',').includes(s.country))&&(k!=='train'||dxTrainOk(s,P.st.vmax*3.6))&&!(s.dxSeen&&s.dxSeen[k]&&mi(s)-s.dxSeen[k]<36));
  if(!K.length||isWar(s.y,s.m,s.country))return null;const [k,d]=K[Math.floor(Math.random()*K.length)],c=s.country,L=s.last;
  const stake=Math.round(clamp(((L&&L.rev)||0)*0.08,150*cpi(s),12000*cpi(s))/50)*50;
  const o={k,at:mi(s)+1+Math.floor(Math.random()*2),stake,md:P.m.id,c};
  if(k==='horse'){o.venue=d.venue[c]||d.venue.fr;o.opp=d.horse[c]||'рысак';o.km=d.km;}
  else if(k==='plane'){o.venue=d.venue[c];o.opp=d.pilot[c];o.km=d.km;o.gate=Math.round(stake*0.6/50)*50;}
  else{const r=d.route[c]||d.route.fr;o.venue=r[0];o.opp=(c==='fr'||c==='uk')&&s.y>=1922?'«Голубой поезд»':r[1];o.km=r[2];o.trainV=d.opp(s.y,r);}
  return o;}
function dxNewsText(s,o){const d=DX_KIND[o.k],md=s.models.find(m=>m.id===o.md),st=carStats(md,0,s.y),v=Math.round(st.vmax*3.6);
  if(o.k==='horse')return `Хозяин рысака ${o.opp} заявил газетам: «Ваши самодвижущиеся экипажи — дым и шум. Мой ${o.opp} обгонит любой из них». Дуэль — две мили на ${o.venue}, ставка ${money(o.stake)}.\nОт «${s.company}» поедет «${md.name}» (до ${v} км/ч). Рысак бежит милю за две минуты с небольшим — около ${Math.round(d.opp(s.y))} км/ч.\n${d.hist}`;
  if(o.k==='plane')return `Импресарио предлагает «${s.company}» турне: авиатор ${o.opp} на биплане против вашей машины — пять миль по кругу ипподрома, на трибунах тысячи зрителей. Сборы делят пополам (${money(o.gate)} вам в любом случае), победителю — ещё ${money(o.stake)}.\nОт «${s.company}» — «${md.name}» (до ${v} км/ч). Биплан летит около ${Math.round(d.opp(s.y))} км/ч.\n${d.hist}`;
  return `Железнодорожная компания хвастает, что ${o.opp} довезёт пассажиров ${o.venue} быстрее любой машины. «${s.company}» вызывают на дуэль: ${fmtN(o.km)} км по дорогам против расписания поезда (в среднем ${Math.round(o.trainV)} км/ч со всеми остановками). Ставка — ${money(o.stake)}.\nОт «${s.company}» — «${md.name}» (до ${v} км/ч), два шофёра посменно. Ехать придётся день и ночь — и ни разу не сломаться.\n${d.hist}`;}
// раз в месяц: предложение дуэли (редко) и развязка принятой
function dxCheck(s){if(s.over)return;
  if(s.dx&&s.dx.acc&&mi(s)>=s.dx.at){dxResolve(s);return;}
  if(s.dx||s.pending.length||mi(s)<10||mi(s)-(s.dxLast||-99)<14||Math.random()>0.04)return;
  const o=dxOffer(s);if(!o)return;s.dx=o;s.dxLast=mi(s);(s.dxSeen=s.dxSeen||{})[o.k]=mi(s);const d=DX_KIND[o.k],T=(o.at-mi(s));
  pushEvent({kicker:'Дуэль',title:`${d.title}: ${o.opp}`,deck:`${o.venue} · через ${T} ${plural(T,'месяц','месяца','месяцев')} · ставка ${money(o.stake)}`,text:dxNewsText(s,o),carId:o.md,own:1,
    choices:[['Принять дуэль','dxYes'],['Отказаться','dxNo']]},true);}
function dxAnswer(s,key){const o=s.dx;if(!o)return;if(key==='dxNo'){s.dx=null;addLog(`Вы отказались от дуэли «${DX_KIND[o.k].title.toLowerCase()}».`);return;}
  o.acc=1;addLog(`⚔️ Дуэль принята: ${DX_KIND[o.k].title.toLowerCase()} (${o.opp}) — ${o.venue}, через ${o.at-mi(s)} мес. Ставка ${money(o.stake)}.`,'good');}
// Исход: короткие дуэли решает скорость (и заглохший мотор), дальняя — средняя скорость с остановками и поломками
function dxSim(s,o){const md=s.models.find(m=>m.id===o.md)||(dxCar(s)||{}).m;if(!md)return null;const st=carStats(md,0,s.y),v=st.vmax*3.6,rel=st.rel,d=DX_KIND[o.k],r=Math.random;
  if(o.k!=='train'){const vv=v*(o.k==='horse'?0.82:0.9)*(0.95+0.1*r()),stall=r()<(1-rel)*(o.k==='horse'?1.6:0.8),opp=d.opp(s.y)*(0.97+0.06*r());
    const tMe=stall?null:o.km/vv*60,tOp=o.km/opp*60;return {md,win:!stall&&vv>opp,tMe,tOp,stall,v:Math.round(vv),opp:Math.round(opp)};}
  // экспресс: дороги эпохи, ночь, заправки; поломки по пути (час-два ремонта) и редкая — фатальная
  const road=clamp(0.42+0.009*(s.y-1905),0.42,0.62),vAvg=Math.min(v*road,95),hours=o.km/vAvg,n=Math.max(3,Math.round(o.km/150));let lost=0,brk=0,fatal=false;
  for(let i=0;i<n;i++){if(r()<(1-rel)*0.9){brk++;lost+=0.6+r()*1.6;if(r()<0.12)fatal=true;}}
  const tMe=fatal?null:(hours+lost+o.km/600)*60,tOp=o.km/o.trainV*60;return {md,win:!fatal&&tMe<tOp,tMe,tOp,brk,fatal,v:Math.round(vAvg),opp:Math.round(o.trainV)};}
function dxResolve(s){const o=s.dx;s.dx=null;if(!o)return;const R=dxSim(s,o),d=DX_KIND[o.k];if(!R){addLog('Дуэль не состоялась: нет машины.','bad');return;}
  const hm=t=>t>=90?`${Math.floor(t/60)} ч ${String(Math.round(t%60)).padStart(2,'0')} мин`:`${Math.floor(t)} мин ${String(Math.round(t%1*60)).padStart(2,'0')} с`;
  let money_=0;if(o.gate){s.cash+=o.gate;money_+=o.gate;}
  if(R.win){s.cash+=o.stake;money_+=o.stake;s.rep=clamp(s.rep+(o.k==='train'?5:3),0,100);wfxAdd(s,'*',segOf(R.md),o.k==='train'?0.25:0.15,8,'дуэль: '+d.n);if(o.k==='train')s.relFx=mi(s)+8;}
  else{s.cash-=o.stake;s.rep=clamp(s.rep-1,0,100);}
  const tx=o.k==='train'?(R.win?`«${R.md.name}» прошла ${o.venue} за ${hm(R.tMe)} — ${o.opp} был в пути ${hm(R.tOp)}. ${R.brk?`По дороге ${R.brk} ${plural(R.brk,'поломка','поломки','поломок')}, механики справились. `:'Ни одной поломки за всю дорогу. '}Средняя скорость — ${R.v} км/ч, днём и ночью.`
      :R.fatal?`На полпути у «${R.md.name}» не выдержала ${['рессора','коробка','полуось','шестерня'][Math.floor(Math.random()*4)]} — машину увезли на платформе того самого поезда.`:`«${R.md.name}» отстала: ${hm(R.tMe)} против ${hm(R.tOp)} у поезда. ${R.brk?`${R.brk} ${plural(R.brk,'поломка','поломки','поломок')} съели часы.`:'Дороги оказались хуже рельсов.'}`)
    :R.stall?`Мотор «${R.md.name}» заглох на старте под свист трибун — ${o.opp} прошёл дистанцию в одиночку.`
    :R.win?`«${R.md.name}» прошла ${o.km<5?'две мили':'пять миль'} за ${hm(R.tMe)} — ${o.opp} отстал (${hm(R.tOp)}). Скорость — ${R.v} км/ч против ${R.opp}.`:`${o.opp} оказался быстрее: ${hm(R.tOp)} против ${hm(R.tMe)} у «${R.md.name}» (${R.opp} км/ч против ${R.v}).`;
  const pay=o.gate?`Сборы — ${money(o.gate)}${R.win?`, выигрыш — ${money(o.stake)}`:`, проигрыш — ${money(o.stake)}`}.`:R.win?`Выигрыш — ${money(o.stake)}.`:`Ставка ${money(o.stake)} проиграна.`;
  addLog(`⚔️ ${d.title} (${o.opp}): ${R.win?'победа':'поражение'}. ${pay}`,R.win?'good':'bad');
  if(R.win)try{trophyAdd(s,{kind:'charter',title:`${d.title}: ${o.opp}`,sub:`${o.venue}${o.k==='train'?' · '+fmtN(o.km)+' км':''}`,story:tx,key:'dx|'+o.k+'|'+mi(s),carId:R.md.id,pt:`«${s.company}» обогнала ${o.k==='train'?'экспресс':o.k==='plane'?'аэроплан':'рысака'}!`});}catch(_){}
  pushEvent({kicker:'Дуэль',own:1,carId:R.md.id,title:R.win?`«${s.company}» обогнала ${o.k==='train'?'экспресс':o.k==='plane'?'аэроплан':'рысака'}!`:`${o.opp} обогнал «${s.company}»`,deck:`${d.title} · ${o.venue}`,
    text:tx+'\n'+pay+(R.win?' Газеты пишут о машине, которая быстрее '+(o.k==='train'?'поезда':o.k==='plane'?'аэроплана':'лошади')+', — полгода её охотнее покупают.':' Газеты посмеиваются, но и запоминают имя марки.'),
    mean:R.win?'Репутация растёт, полгода ваши машины этого класса берут охотнее.':'',choices:[['Читать дальше','ok']]},true);
  if(R.win)pendingToasts.push('⚔️ '+d.title+': победа!');}
