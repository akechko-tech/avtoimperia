/* ================= 0.32: МОТОЦИКЛЫ НА ЭКРАНАХ — ФИЛЬТР «АВТО / МОТО», МОТОЦЕХ, РЫНОК МОТОЦИКЛОВ =================
   Новых вкладок нет: линейка переключается фильтром в «Моделях», «КБ», «Продажах»; на «Заводе» — карточка мотоцеха.
   Пока мотоцеха нет, мотоциклы почти не видны: одна свёрнутая карточка на «Заводе» и строка в «Империи». */
function motoVis(s){return !!s&&(lineOn(s,'moto')||!!s.mshopB||!!s.motoStart);}
function curLine(s){const v=s&&s.ui&&s.ui.line;if(v==='moto'&&motoVis(s))return 'moto';if(v==='car'&&(lineOn(s,'car')||s.carShopB||s.motoStart))return 'car';return lineOn(s,'car')||!motoVis(s)?'car':'moto';}
function lineTabs(s,note){if(!motoVis(s))return '';const L=curLine(s);
  return `<div class="lineseg" role="tablist"><button class="${L==='car'?'on':''}" data-act="line" data-v="car" role="tab" aria-selected="${L==='car'}">🚗 Авто</button><button class="${L==='moto'?'on':''}" data-act="line" data-v="moto" role="tab" aria-selected="${L==='moto'}">🏍 Мото</button></div>${note?`<p class="small muted" style="margin:-4px 4px 8px">${note}</p>`:''}`;}
/* ---------- «Завод»: мотоцех и (у «Мотомастерской») автомобильный цех ---------- */
function mshopCard(s){const L=s.last;
  if(!lineOn(s,'moto')){
    if(s.mshopB)return foldCard('mshop',true,'<h2>🏍 Мотоцех</h2>',`<p class="small" style="margin-top:6px">Строится: ещё ${s.mshopB.left} мес. Потом начертите первый мотоцикл — «Модели», переключатель «Мото».</p>`,`строится · ещё ${s.mshopB.left} мес.`);
    if(s.y<MSHOP.y)return '';const c=mshopCost(s),mk=s.last&&s.last.mk&&s.last.mk[s.country],ms=mk&&mk.msize||0,cs=mk&&mk.size||0;
    return foldCard('mshop',false,'<h2>🏍 Мотоциклы</h2>',`<p class="small" style="margin-top:6px">Вторая линейка марки — как у Peugeot, NSU, Laurin & Klement и позже BMW. Мотоцикл впятеро-вшестеро дешевле автомобиля: его берут семьи и молодые люди, которым машина не по карману, а мотоцикл с коляской заменяет семье автомобиль. Свой цех, свои модели, свои покупатели; поставщики, рабочие, дилеры и КБ — общие.</p>
      <p class="small muted" style="margin-top:6px">${ms>0?`Дома в прошлом месяце купили ${fmtN(ms)} мотоциклов (машин — ${fmtN(cs)}). `:''}В Америке дешёвый автомобиль к 1920-м вытесняет мотоцикл; в Европе он растёт все двадцатые — в Германии к 1929 году мотоциклов покупают вдвое больше, чем машин. До 1920 года мотоциклы продают и велосипедные лавки.</p>
      <button class="btn block" style="margin-top:10px" data-act="mshop" ${s.cash<c?'disabled':''}>Построить мотоцех · ${money(c)} · ${Math.max(1,Math.round(MSHOP.mo*(DIF().build??1)))} мес.</button>`,`вторая линейка · мотоцех ${money(c)}`);}
  const mc=mcapEff(s),units=mcapUnits(s),mm=L&&L.mmade||0,util=units>0?Math.min(1,mm/Math.max(1,units)):0,cu=capUnitCost(s),b=(s.mcapBuild||[]).reduce((a,x)=>a+x.units,0);
  const q=Math.max(0.5,Math.round((s.mcap||1)*0.5*2)/2),d=Math.max(1,Math.round(s.mcap||1));
  return foldCard('mshop',true,'<h2>🏍 Мотоцех</h2>',`
    <div class="row" style="margin-top:8px"><div><h3><span class="num">${fmtN(Math.round(units))}</span> мотоциклов в месяц</h3><p class="small muted">${L?`выпущено ${fmtN(mm)}${L.bneck&&L.bneck.mcap<0.999?' · <span class="warn">цех не успевает</span>':''}`:'ждёт первого месяца'}${b?` · строится ещё ≈ ${fmtN(Math.round(b*techMul(s,'cap')/Math.max(0.01,motoCx(s))))}`:''}</p></div><span class="num ${util>0.95?'warn':''}">${Math.round(util*100)}%</span></div>
    <div class="bar" style="margin-top:6px"><i style="width:${util*100}%;background:var(--brass)"></i></div>
    <div class="btns" style="margin-top:10px"><button class="btn" data-act="mcapAdd" data-n="${q}" ${s.cash<q*cu?'disabled':''}>+50% · ${money(q*cu)}</button><button class="btn" data-act="mcapAdd" data-n="${d}" ${s.cash<d*cu?'disabled':''}>Удвоить · ${money(d*cu)}</button></div>
    <p class="small muted" style="margin-top:6px">Станки, электромоторы и конвейер завода работают и здесь. Мотоцикл проще машины в ${Math.round(1/Math.max(0.02,motoCx(s)))} раз: место в цехе — на ${fmtN(Math.round(1/Math.max(0.01,motoCx(s))))} мотоциклов. Рабочие у цехов общие.${(s.mcapBuild||[]).length?' Стройка: '+s.mcapBuild.map(x=>`ещё ${x.left} мес.`).join(', ')+'.':''}</p>`,
    `${fmtN(Math.round(units))} мотоциклов в месяц · загрузка ${Math.round(util*100)}%`);}
function carShopCard(s){if(lineOn(s,'car'))return '';
  if(s.carShopB)return foldCard('carshop',true,'<h2>🚗 Автомобильный цех</h2>',`<p class="small" style="margin-top:6px">Строится: ещё ${s.carShopB.left} мес. Первую машину можно чертить уже сейчас — «Модели», «Авто».</p>`,`строится · ещё ${s.carShopB.left} мес.`);
  const need=carShopNeed(s),c=carShopCost(s),mm=motoMade(s);
  return foldCard('carshop',true,'<h2>🚗 Путь к автомобилю</h2>',`<p class="small" style="margin-top:6px">Мастерская делает мотоциклы. Чтобы строить автомобили, нужны опыт, конструкторы и цех: так Laurin & Klement шли от мотоцикла (1899) к первой машине (1905).</p>
    <div class="row small" style="margin-top:8px"><span class="muted">Опыт мастерской</span><span class="num ${yf(s)-(s.motoStart||s.y)>=CARSHOP.yrs?'good':''}">${Math.floor(yf(s)-(s.motoStart||s.y))} из ${CARSHOP.yrs} лет</span></div>
    <div class="row small" style="margin-top:6px"><span class="muted">Мотоциклов выпущено</span><span class="num ${mm>=CARSHOP.made?'good':''}">${fmtN(mm)} из ${fmtN(CARSHOP.made)}</span></div><div class="bar" style="margin-top:4px"><i style="width:${Math.min(100,mm/CARSHOP.made*100)}%;background:var(--good)"></i></div>
    <div class="row small" style="margin-top:6px"><span class="muted">КБ</span><span class="${s.rd.lvl>=CARSHOP.kb?'good':''}">${esc(RD_LV[s.rd.lvl])}${s.rd.lvl>=CARSHOP.kb?' ✓':` → нужно «${esc(RD_LV[CARSHOP.kb])}»`}</span></div>
    <div class="row small" style="margin-top:6px"><span class="muted">Цех на ${fmtN(Math.round(CARSHOP.cap*techMul(s,'cap')))} машин в месяц</span><span class="num ${s.cash>=c?'good':''}">${money(c)}</span></div>
    ${need.length?`<p class="small warn" style="margin-top:8px">Осталось: ${need.join('; ')}.</p>`:''}
    <button class="btn ${need.length?'':'primary'} block" style="margin-top:10px" data-act="carShop" ${need.length?'disabled':''}>Построить автомобильный цех · ${money(c)}</button>`,need.length?`осталось: ${need.length} ${plural(need.length,'условие','условия','условий')}`:'можно строить');}
/* ---------- «Модели»: что показать, если линейки ещё нет ---------- */
function lineEmptyCard(s,L){
  if(L==='moto'&&!lineOn(s,'moto'))return `<section class="card"><h2>🏍 Мотоциклов пока нет</h2><p class="small" style="margin-top:6px">${s.mshopB?`Мотоцех строится — ещё ${s.mshopB.left} мес. Мотоцикл можно начертить уже сейчас.`:'Сначала нужен мотоцех — вкладка «Завод».'}</p>${s.mshopB?'':`<button class="btn block" style="margin-top:8px" data-act="tab" data-k="plant">На завод</button>`}</section>`;
  if(L==='car'&&!lineOn(s,'car')){const need=carShopNeed(s);return `<section class="card"><h2>🚗 Автомобиля пока нет</h2><p class="small" style="margin-top:6px">${s.carShopB?`Автомобильный цех строится — ещё ${s.carShopB.left} мес. Первую машину можно чертить уже сейчас.`:`Мастерская делает мотоциклы. Для автомобиля: ${need.join('; ')||'постройте автомобильный цех'}.`}</p>${s.carShopB?'':`<button class="btn block" style="margin-top:8px" data-act="tab" data-k="plant">Путь к автомобилю — на заводе</button>`}</section>`;}
  return '';}
function canDesign(s,L){return L==='moto'?lineOn(s,'moto')||!!s.mshopB:lineOn(s,'car')||!!s.carShopB;}
/* ---------- «Продажи»: рынок мотоциклов дома, мотомарки ---------- */
function vMarketMoto(){
  const s=G,home=s.country,L=s.last,M=L&&L.mk[home],R0=mkCountry(home,s,[]),ms=M&&M.msegs;
  const rowsS=MOTOSEG.map(g=>{const z=ms&&ms[g]?ms[g].size:R0.segs[g].inc,you=ms&&ms[g]?ms[g].you:0;return `<tr><td>${SEG[g].name}</td><td class="n">${fmtD(z)}</td><td class="n">${M?fmtD(you):'—'}</td><td class="n">${M&&z>0?pct(you/z,1):'—'}</td><td class="n">${money(prefP(g,home,s))}</td></tr>`;}).join('');
  const msize=ms?MOTOSEG.reduce((a,g)=>a+(ms[g]?ms[g].size:0),0):MOTOSEG.reduce((a,g)=>a+R0.segs[g].inc,0),csize=M&&M.size?M.size:SEGK.reduce((a,g)=>a+R0.segs[g].inc,0),mine=L?(L.mhome||0):0;
  const full=(s.mhomePrev||0)>0||(s.mcomps&&(s.mcomps[home]||[]).some(o=>(o.prev||0)>0)),val=o=>full?(o.prev||0):(o.yr||0);
  const rows=[{name:s.company,you:1,sales:full?(s.mhomePrev||0):(s.mhomeY||0)},...(MCOMPS[home]||[]).map((cp,i)=>({cp,i})).filter(o=>compAlive(o.cp,s)).map(o=>{const st=((s.mcomps||{})[home]||[])[o.i]||{},m=compModel(o.cp,s);return {name:compName(o.cp,s),sales:val(st),model:m?m[1]:'',img:m&&m[2],cp:o.cp,ci:o.i,color:st.color||'#888'};})].sort((a,b)=>b.sales-a.sales);
  const mx=Math.max(1,...rows.map(r=>r.sales)),place=rows.findIndex(r=>r.you)+1;
  const comp=rows.slice(0,9).map(r=>{const th=r.img&&IMG[r.img]?`<img class="thumb" src="${IMG[r.img].src}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span class="thumb mthumb-svg">${motoSVG({b:'mb0',e:'me3',c:'mf3',g:'mt2',paint:r.color||'#555'},{thumb:1})}</span>`,
    inner=`${th}<span>${esc(r.name)}${r.model?`<small>${esc(r.model)}</small>`:''}</span><div class="bar"><i style="width:${r.sales/mx*100}%;background:${r.you?'var(--brass)':r.color||'#888'}"></i></div><span class="num" style="text-align:right">${fmtN(r.sales)}</span>`;
    return r.cp?`<button class="comp" data-act="mbrand" data-c="${home}" data-i="${r.ci}" aria-label="История марки ${esc(r.name)}">${inner}</button>`:`<div class="comp you">${inner}</div>`;}).join('');
  const br=bikeReach(s,home),rv=MOTOSEG.map(g=>{const v=rivalBoost(s,home,g);return v>0.05?`${SEG[g].name.toLowerCase()} — ${rvWord(v)}`:'';}).filter(Boolean).join(', ');
  return `${foldCard('mkmoto',true,`<h2>🏍 Мотоциклы · ${COUNTRIES[home].name}</h2>`,`
    <div class="meta"><div>Рынок/мес<b>${fmtD(msize)}</b></div><div>Ваши<b>${L?fmtN(mine):'—'}</b></div><div>Доля<b>${L&&msize>0?pct(mine/msize,1):'—'}</b></div><div>Машин/мес<b>${fmtD(csize)}</b></div></div>
    <table class="pl"><tr><th>Класс</th><th class="n">Рынок</th><th class="n">Вы</th><th class="n">Доля</th><th class="n">Цена</th></tr>${rowsS}</table>
    <p class="small muted" style="margin-top:10px">Мотоцикл и дешёвый автомобиль борются за одних покупателей: чем дешевле машина, тем меньше мотоциклов. ${br>0?`До 1920 года мотоциклы продают и велосипедные лавки — их видят ${Math.round(Math.max(br,reachOf(s,home))*100)}% покупателей, даже где ваших дилеров нет.`:'Велосипедные лавки мотоциклами больше не торгуют — только ваши дилеры (дилер продаёт втрое больше мотоциклов, чем машин).'}</p>
    ${rv?`<p class="small warn" style="margin-top:6px">Мотомарки отвечают на ваш успех: ${rv}.</p>`:''}`,`рынок ${fmtD(msize)} в месяц · ваши ${L?fmtN(mine):'—'}`)}
  ${foldCard('mcomps',true,`<h2>Мотомарки</h2><span class="pill ${place<=3?'good':'warn'}">вы ${place}-е</span>`,`<p class="small muted" style="margin-top:2px">Продано мотоциклов ${full?`за ${s.y-1} год`:'с начала года'}. Нажмите на марку — её история.</p><div style="margin-top:8px">${comp}</div>`,`вы ${place}-е из ${rows.length}`)}`;}
// карточка мотомарки
function mbrandHTML(c,i,s){const cp=(MCOMPS[c]||[])[i];if(!cp)return '';const H=MBRAND_HIST[cp.n]||{},st=((s.mcomps||{})[c]||[])[i]||{},m=compModel(cp,s),nm=compName(cp,s),im=(m&&m[2]&&IMG[m[2]])||(cp.wiki&&IMG[cp.wiki]);
  const full=(st.prev||0)>0,sales=full?st.prev:(st.yr||0),models=(cp.models||[]).filter(x=>x[0]<=s.y).map(x=>`<li><span class="num">${x[0]}</span> ${esc(x[1])}</li>`).join('');
  return `<div class="brand"><div class="kicker">Мотомарка · ${esc((COUNTRIES[c]||{}).name||'')}</div><h2>${esc(nm)}</h2>
    <p class="small muted">${H.city?esc(H.city)+' · ':''}с ${cp.since} года${cp.until?` · до ${cp.until}`:''}</p>
    ${im?`<div class="photo"><img src="${im.src}" alt="" referrerpolicy="no-referrer">${credit(im)}</div>`:`<div class="carbox">${motoSVG({b:'mb0',e:'me5',c:'mf3',g:'mt3',paint:BRAND_PAINT[cp.n]||'#7a2d22'},{w:420})}</div>`}
    ${H.t?`<p style="margin-top:10px">${esc(H.t)}</p>`:''}
    <div class="meta" style="margin-top:10px"><div>Продано${full?` за ${s.y-1}`:' с января'}<b>${fmtN(sales)}</b></div><div>Главная модель<b>${m?esc(m[1]):'—'}</b></div><div>С коляской<b>${Math.round(((cp.mix||{}).moside||0)*100)}%</b></div></div>
    ${models?`<div class="label" style="margin-top:12px">Модели</div><ul class="blist">${models}</ul>`:''}
    <div class="btns" style="margin-top:14px"><button class="btn" data-act="close">Закрыть</button></div></div>`;}
/* ---------- «Империя»: строка мотоциклов ---------- */
function motoEmpireRow(s){if(!motoVis(s)&&!motoSold(s))return '';const n=motoSold(s),y=s.myearPrev||0,L=s.last,ms=L&&L.mk&&L.mk[s.country]&&L.mk[s.country].msize||0,mine=L?L.mhome||0:0;
  return `<div class="row small" style="margin-top:8px"><span>🏍 Мотоциклов продано: <b class="num">${fmtN(n)}</b>${y?` · за ${s.y-1} год — ${fmtN(y)}`:''}${ms>0?` · доля дома ${pct(mine/ms,1)}`:''}</span></div><p class="small muted" style="margin-top:2px">В наследии мотоцикл идёт за четверть машины: масштаб и выпуск, а не имя автомобильной марки.</p>`;}
// детали мотоциклов у поставщиков — какие есть и когда появятся
function motoSupCard(s){const R=(arr,f)=>techRows(arr.filter(x=>x.moto),s,f);
  return foldCard('msup',false,'<h2>Детали мотоциклов</h2>',`<p class="small muted" style="margin-top:4px">Что можно купить у поставщиков и когда появится новое. Серые — в будущем: их можно получить раньше прототипом КБ или перенести из автомобиля.</p>
    <div class="label" style="margin-top:6px">Моторы</div>${R(ENGINES,x=>x.hp+' л.с.')}<div class="label" style="margin-top:12px">Передача</div>${R(GEARBOX,x=>'КПД '+Math.round(x.eff*100)+'%')}
    <div class="label" style="margin-top:12px">Рамы</div>${R(CHASSIS,x=>'до '+x.max+' л.с.')}<div class="label" style="margin-top:12px">Шины</div>${R(TYRES,x=>'ресурс '+fmtN(x.life)+' км')}
    <div class="label" style="margin-top:12px">Тормоза</div>${R(BRAKES,x=>'сила '+Math.round(x.brk*100))}<div class="label" style="margin-top:12px">Седло и коляски</div>${R(BODIES,x=>x.seats+' '+plural(x.seats,'место','места','мест'))}`,'моторы, передача, рамы, шины, тормоза, коляски');}
// проект «Перенос» в списке КБ: совместимость, шанс, цена
function xferItem(pj,s,pts,free){const c=rdCost(pj,s),src=partById(pj.from),dst=partById(pj.id);
  return `<div class="race-item"><div class="row"><div><span class="mo">${pj.moto?'🚗 → 🏍':'🏍 → 🚗'} · совместимость ${XFER_CP[pj.cp]} · на ${pj.yrs} ${plural(pj.yrs,'год','года','лет')} раньше истории</span><h3 style="margin-top:2px">${esc(pj.name)}</h3></div><button class="btn sm" data-act="rdStart" data-k="xfer:${pj.id}" ${free<=0||s.cash<c?'disabled':''}>~${Math.ceil(pj.need/pts)} мес. · ${money(c)}</button></div>
    <p class="small muted" style="margin-top:4px">${src?esc(src.name):''} → <b>${dst?esc(dst.name):''}</b>. Шанс, что выйдет как задумано, — <b class="${pj.chance>=0.6?'good':pj.chance>=0.4?'warn':'bad'}">${Math.round(pj.chance*100)}%</b>${pj.retry?' (вторая попытка: дешевле и вероятнее)':''}; иначе деталь будет ${pj.cp>=3?'дороже':'тяжелее или дороже'}, но ваша. Шанс выше, если КБ много работало над этой линейкой и деталь улучшена (★).</p></div>`;}
/* ---------- советник: мотоциклы ---------- */
function motoAdvice(s,add){const L=s.last,home=s.country,mk=L&&L.mk&&L.mk[home];
  // мотомастерская: путь к автомобилю
  if(s.motoStart&&!lineOn(s,'car')&&!s.carShopB){const need=carShopNeed(s);
    if(!need.length)add(80,'🚗','Мастерская готова к автомобилю: опыт есть, КБ справится, денег хватает. Постройте автомобильный цех.',`Цех · ${money(carShopCost(s))}`,()=>ACT.carShop(),'plant');
    else if(s.m===0||s.m===6)add(26,'🚗',`Путь к автомобилю: ${need.join('; ')}.`,'Подробнее',()=>{},'plant');}
  // мастерская там, где мотоциклов покупают мало (Германия, Италия до 1920-х): главный рынок — Франция, родина мотоцикла
  if(s.motoStart&&home!=='fr'&&!impLv(s,'fr')&&!tradeBan(s,'fr')&&s.models.some(m=>m.status==='prod'&&isMoto(m))&&(s.m%3===0)){const pf=marketPotential(s,'fr'),ph=homeDemand(s),c1=impCost(s,'fr',1);
    if(pf>Math.max(1,ph*0.5)&&s.cash>c1*1.5)add(70,'🌍',`Дома ваших мотоциклов берут ≈ ${fmtD(ph)} в месяц, а во Франции брали бы ≈ ${fmtD(pf)}: это родина мотоцикла. Импортёр в Париже — главный рынок мастерской.`,`Импортёр · ${money(c1)}`,()=>{impUp(G,'fr');},'market');}
  // мотоцех не успевает
  if(L&&lineOn(s,'moto')&&L.bneck&&L.bneck.mcap<0.95&&!(s.mcapBuild||[]).length){const n=Math.max(0.5,Math.round((s.mcap||1)*0.5*2)/2),c=Math.round(n*capUnitCost(s));
    if(s.cash>c*1.3)add(74,'🏍',`Мотоцех не успевает: покупателям не хватило мотоциклов. Расширьте его.`,`+50% · ${money(c)}`,()=>ACT.mcapAdd({n}),'plant');}
  // перенос технологий: выгодный — с хорошим шансом и раньше истории на 2+ года
  if(lineOn(s,'moto')&&rdSlots(s)>rdActive(s).length){const X=xferProjects(s).filter(p=>p.chance>=0.5&&p.yrs>=2).sort((a,b)=>b.chance*b.yrs-a.chance*a.yrs)[0];
    if(X&&s.cash>rdCost(X,s)*3)add(52,'🔁',`${X.name}: шанс ${Math.round(X.chance*100)}%, на ${X.yrs} ${plural(X.yrs,'год','года','лет')} раньше истории — дешевле нового исследования.`,`Перенос · ${money(rdCost(X,s))}`,()=>{rdBegin(G,X);},'models');}
  // автомобильная марка: мотоциклы — вторая линейка, когда их покупают много
  if(!motoVis(s)&&mk&&(mk.msize||0)>Math.max(150,(mk.size||0)*0.35)&&s.cash>mshopCost(s)*4&&(s.m===2||s.m===8))
    add(24,'🏍',`Дома мотоциклов покупают ${fmtN(mk.msize)} в месяц — ${mk.size?Math.round(mk.msize/mk.size*100)+'% от числа машин':'больше, чем машин'}. Мотоцех — вторая линейка: свои покупатели, общие дилеры и КБ.`,`Мотоцех · ${money(mshopCost(s))}`,()=>ACT.mshop(),'plant');}
