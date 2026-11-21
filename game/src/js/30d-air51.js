/* ================= 0.51, этап 7: АВИАЦИЯ — ЧАСТЬ ПРОИЗВОДСТВА =================
   Отзыв автора (21 ноября): «раздел авиации не проработан вовсе и живёт в управлении далеко от основного производства, внизу
   экрана, без быстрой помощи в управлении, как договаривались, подсказки в выборе модели».
   У автомобильной фирмы авиацех был карточкой в самом низу «Завода», «Моделей», «Рынка» и «Гонок» — после всего автомобильного.
   Теперь:
     • вверху этих вкладок — выбор направления: «Автомобили» или «Аэропланы»; ниже — только выбранное (тот же принцип, что ТЗ
       просит для всех разделов: «сверху выбор, ниже только выбранное»);
     • конструктор аэроплана подсказывает: у каждого назначения — покупатель, сколько берут в год и что он ценит; у каждой детали —
       какой станет оценка заказчиков, если её поставить; кнопка «Подобрать под заказчика»;
     • помощник управляющего ведёт и авиацех: первый полёт доверяет испытателю, облётанный образец ставит в серию, строит ангар,
       когда заказы не успевают, — и отчитывается той же строкой в «Делах». */
let uiLine='car';
function airSwitchOn(s){return !!(s&&s.mode!=='racer'&&!airOnly(s)&&(airOn(s)||(s.air&&s.air.b)));}
function lineSwitchHTML(s){const A=s.air,on=airOn(s),n=on?A.models.filter(m=>m.status==='prod').length:0,adv=on?airAdvice(s).length:0;
  return `<div class="chips linesw" id="linesw"><button class="chip ${uiLine!=='air'?'on':''}" data-act="uiLine" data-v="car">🚗 Автомобили${lineOn(s,'moto')?' и мотоциклы':''}</button><button class="chip ${uiLine==='air'?'on':''}" data-act="uiLine" data-v="air">✈ Аэропланы<small>${on?`${n} в серии${adv?` · ${adv} ${plural(adv,'совет','совета','советов')}`:''}`:'авиацех строится'}</small></button></div>`;}
// раздел авиации на вкладке — целиком, без автомобильного
function airSubView(s,t){if(!airOn(s))return airPlantCard(s);try{return t==='plant'?airAdviceCard(s)+airPlantCard(s):t==='models'?airAdviceCard(s)+airModelsView(s):t==='market'?airMarketView(s):t==='race'?airSkyView(s):'';}
  catch(e){console.error(e);return `<section class="card"><p class="bad">Ошибка экрана авиации: ${esc(e.message)}</p></section>`;}}
/* ---------- конструктор: подсказки ---------- */
// что ценит заказчик этого назначения — три главных черты
function airRoleWants(role){const W=AIR_W[role]||AIR_W.sport;return Object.keys(W).sort((a,b)=>W[b]-W[a]).slice(0,3).map(k=>AIR_FN[k]||k);}
function airRoleHint(s,role){const t=tNow(s),c=s.country,civ=airMktRole(c,role,t,'civ'),mil=airMktRole(c,role,t,'mil'),tot=civ+mil;if(role==='race')return 'Гоночный не продают: он для призов и рекордов. Ценят одно — скорость.';
  const who=mil>civ*2?'армия и флот — по конкурсам министерства':civ>mil*2?'частные покупатели и школы — платят сразу':'и частные покупатели, и армия';
  return `Покупают ${tot>=1?fmtN(Math.round(tot)):'меньше одного'} в год (${COUNTRIES[c].name}): ${who}. Ценят: ${airRoleWants(role).join(', ')}.${airWarOn(c,t)&&mil>civ?' Идёт война — берут всё, что летает и стреляет.':''}`;}
// как изменится оценка заказчиков, если поставить эту деталь
function airPickEval(s,d,cat,id){const t=tNow(s),d2={...d};if(cat==='w')d2.w=id;else d2[cat]=id;
  if(cat==='f'){const F=byId(AIR_FRAME,id);if(F){d2.n=clamp(d2.n||1,F.ne[0],F.ne[1]);if(F.needMat&&!F.needMat.includes(d2.m)){const m=F.needMat.map(x=>byId(AIR_MAT,x)).find(x=>airPartOk(s,x,'m'));if(m)d2.m=m.id;}if(F.boat)d2.g='g2';}}
  let q=0,err=[];try{err=airDesignErr(s,d2);q=airQ(d2,t).q;}catch(_){err=['не собрать'];}return {q,err,d:d2};}
function airPickNote(s,d,cat,id,q0){const E=airPickEval(s,d,cat,id);if(E.err.length)return {txt:'✖ '+E.err[0],cls:'bad',q:-1};const dq=E.q-q0;return {txt:`оценка ${E.q.toFixed(2).replace('.',',')}`,cls:dq>0.015?'good':dq<-0.015?'bad':'',q:E.q};}
// «Подобрать под заказчика»: по одной детали за проход — лучшая оценка за свои деньги; ошибок сборки быть не должно
function airAutoDesign(s,d0){const t=tNow(s),ref=airRefMd(d0.role,t);let refC=1;try{refC=airCost(ref,t,s,0).unit;}catch(_){}
  const val=d=>{let E;try{E=airDesignErr(s,d);}catch(_){return -9;}if(E.length)return -9;let q=0,c=refC;try{q=airQ(d,t).q;c=airCost(d,t,s,0).unit;}catch(_){return -9;}return d.role==='race'?q:q-0.25*Math.log(Math.max(0.2,c/Math.max(1,refC)));};
  let d={...d0},best=val(d);const cats=['f','e','m','w','c','g','p','k','a'];
  for(let pass=0;pass<3;pass++){let moved=false;cats.forEach(cat=>{const L=(cat==='w'?AIR_WING:airCatList(s,cat)).filter(z=>airCatAllowed(cat,z,d,s)&&(z.y||0)<=t+0.01);
      L.forEach(z=>{const E=airPickEval(s,d,cat,z.id),v=val(E.d);if(v>best+1e-6){best=v;d={...E.d,name:d0.name,paint:d0.paint,open:null,role:d0.role};moved=true;}});});if(!moved)break;}
  return best>-9?d:d0;}
/* ---------- помощник управляющего ведёт и авиацех ---------- */
function airHelperMonth(s,msg,pay,reserve){if(!airOn(s))return;const A=s.air,t=tNow(s);A.wkAuto=true;
  // первый полёт: месяц образец ждёт хозяина (вдруг тот захочет лететь сам), потом его поднимает испытатель
  A.models.forEach(md=>{if(!airCanTest(md))return;md.hw=(md.hw||0)+1;if(md.hw<2)return;try{const res=airTestAuto(s,md,airBestPilot(s).id);msg.push(`первый полёт «${md.name}» — ${res.kind==='crash'?'авария':res.kind==='flaw'?'облётан, есть недоделки':'облётан'}`);}catch(e){console.warn('air helper fly',e);}});
  // облётанный образец — в серию (недоделки сперва доводит)
  A.models.forEach(md=>{if(md.status!=='proto'||!md.flown||md.role==='race')return;if(md.flaw){md.status='dev';md.devLeft=1;md.devT=1;md.flaw=0;md.flown=0;md.vk=Math.max(md.vk||1,0.98);msg.push(`доводка «${md.name}» — месяц`);return;}
    const c=airToolCost(s,md);if(pay(c)&&airProdStart(s,md))msg.push(`«${md.name}» — в серию, оснастка ${money(c)}`);});
  // ангары переполнены два месяца подряд — строить: самый большой цех, что по карману и окупится заказами
  const load=(A.last&&A.last.load)||0;A.hwLoad=load>1.05?(A.hwLoad||0)+1:0;
  if(A.hwLoad>=2&&!(A.capB||[]).length){const B=AIR_CAPB.slice().reverse().find(b=>airCapCan(s,b.k)&&b.add<=Math.max(1.5,(A.cap||1)*1.5)&&s.cash-airCapCost(s,b.k)>=reserve);if(B&&airCapStart(s,B.k)){A.hwLoad=0;msg.push(`авиацех: строит «${B.n}» — ${money(airCapCost(s,B.k))}`);}}}
/* ---------- что такое НАМИ ---------- */
const BRAND_ABOUT={'НАМИ':'НАМИ — Научный автомоторный институт в Москве, основан в 1918 году: государственный институт, а не завод. Его малолитражку НАМИ-1 (по проекту Константина Шарапова) в 1927–1930 годах строил московский завод «Спартак» — по разным данным, от 370 до 512 машин. В партии марка появляется только там, где Россия стала советской: институт создало советское государство — без него не было бы ни института, ни машины.'};
function brandAbout(cp){return cp&&(BRAND_ABOUT[cp.n]||cp.about)||'';}
