/* ================= 0.32–0.33: МОТОЦИКЛЫ НА ЭКРАНАХ — ВМЕСТЕ С МАШИНАМИ =================
   0.33 (отзыв: «не хочу разделения сверху — сложно всё время возвращаться наверх»): переключателя «Авто / Мото» больше нет.
   Мотоцикл — один из видов техники марки: модели, КБ, рынок и поставщики показывают его вместе с машинами (класс «Мотоцикл»
   или «С коляской» — в карточке модели). На «Заводе» — одна мощность и оборудование для мотоциклов среди технологий. */
function motoVis(s){return !!s&&(lineOn(s,'moto')||!!s.mshopB||!!s.motoStart);}
function curLine(s){return lineOn(s,'car')?'car':'moto';}
function lineTabs(s,note){return '';}
/* ---------- «Завод»: оборудование для мотоциклов (среди технологий) и (у «Мотомастерской») путь к автомобилю ---------- */
function motoEquipHTML(s){const lv=motoLv(s),B=s.mshopB,nx=mshopNext(s),c=nx?mshopCost(s,nx):0,mk=s.last&&s.last.mk&&s.last.mk[s.country],ms=mk&&mk.msize||0,cs=mk&&mk.size||0;
  const row=(h,sub,right)=>`<div class="tech-row"><div class="row"><div><h3>${h}</h3><p class="small muted">${sub}</p></div>${right}</div></div>`;
  if(B)return row(`🏍 ${B.lv===2?'Поток мотоциклов':'Мотоциклетный участок'}`,B.lv===2?'Конвейер для мотоциклов: часов на мотоцикл на треть меньше, места в цехе — на пятую часть.':'Стенды для моторов, рам и колёс: мотоциклы — в тех же цехах, что и машины.',`<span class="pill warn">Ставится · ${B.left} мес.</span>`);
  if(lv>=2)return row('🏍 Мотоциклы <span class="muted small num">2/2</span>','✓ Мотоциклетный участок · ✓ Поток мотоциклов: часов на мотоцикл на треть меньше, места — на пятую часть.','<span class="pill good">Всё поставлено</span>');
  if(lv===1)return row('🏍 Мотоциклы <span class="muted small num">1/2</span>',`✓ Мотоциклетный участок: мотоциклы — в тех же цехах (место машины — на ${fmtN(Math.round(1/Math.max(0.02,motoCx(s))))} мотоциклов).${nx?'':` Дальше — поток мотоциклов (с ${MSHOP2.y-techEarly(s)} г.): часов на треть меньше, как у Indian в 1912 году.`}`,
    nx?`<button class="btn sm ${s.cash>=c?'primary':''}" data-act="mshop" ${s.cash<c?'disabled':''}>Поток · ${money(c)}</button>`:'<span class="pill muted">поток — позже</span>');
  if(s.y<MSHOP.y)return '';
  return row('🏍 Оборудование для мотоциклов',`Мотоцикл впятеро-вшестеро дешевле машины: его берут те, кому машина не по карману, а с коляской он заменяет семье автомобиль. Делается в тех же цехах (места занимает в 7–10 раз меньше машины), теми же рабочими, продаётся теми же дилерами.${ms>0?` Дома в прошлом месяце купили ${fmtN(ms)} мотоциклов (машин — ${fmtN(cs)}).`:''}`,
    `<button class="btn sm" data-act="mshop" ${s.cash<c?'disabled':''}>${money(c)} · ${Math.max(1,Math.round(MSHOP.mo*(DIF().build??1)))} мес.</button>`);}
function mshopCard(s){return '';}
// строка в свёрнутой карточке «Технологии завода»: что можно поставить для мотоциклов (или машин)
function meqSum(s){if(s.mshopB)return '🏍 оборудование для мотоциклов ставится · ';const lv=motoLv(s);if(!lv&&s.y>=MSHOP.y&&lineOn(s,'car'))return '🏍 можно поставить оборудование для мотоциклов · ';if(lv===1&&mshopNext(s))return '🏍 можно поставить поток мотоциклов · ';return '';}
function carShopCard(s){if(lineOn(s,'car'))return '';
  if(s.carShopB)return foldCard('carshop',true,'<h2>🚗 Оборудование для автомобилей</h2>',`<p class="small" style="margin-top:6px">Ставится: ещё ${s.carShopB.left} мес. Первую машину можно чертить уже сейчас — «Модели» → «Новая модель».</p>`,`ставится · ещё ${s.carShopB.left} мес.`);
  const need=carShopNeed(s),c=carShopCost(s),mm=motoMade(s);
  return foldCard('carshop',true,'<h2>🚗 Путь к автомобилю</h2>',`<p class="small" style="margin-top:6px">Мастерская делает мотоциклы. Чтобы делать и автомобили, нужны опыт, конструкторы и оборудование — стапели для рам, стенды для коробок и мостов, места в цехах: так Laurin & Klement шли от мотоцикла (1899) к первой машине (1905).</p>
    <div class="row small" style="margin-top:8px"><span class="muted">Опыт мастерской</span><span class="num ${yf(s)-(s.motoStart||s.y)>=CARSHOP.yrs?'good':''}">${Math.floor(yf(s)-(s.motoStart||s.y))} из ${CARSHOP.yrs} лет</span></div>
    <div class="row small" style="margin-top:6px"><span class="muted">Мотоциклов выпущено</span><span class="num ${mm>=CARSHOP.made?'good':''}">${fmtN(mm)} из ${fmtN(CARSHOP.made)}</span></div><div class="bar" style="margin-top:4px"><i style="width:${Math.min(100,mm/CARSHOP.made*100)}%;background:var(--good)"></i></div>
    <div class="row small" style="margin-top:6px"><span class="muted">КБ</span><span class="${s.rd.lvl>=CARSHOP.kb?'good':''}">${esc(RD_LV[s.rd.lvl])}${s.rd.lvl>=CARSHOP.kb?' ✓':` → нужно «${esc(RD_LV[CARSHOP.kb])}»`}</span></div>
    <div class="row small" style="margin-top:6px"><span class="muted">Оборудование и места ещё на ${fmtN(Math.round(CARSHOP.cap*techMul(s,'cap')))} машин в месяц</span><span class="num ${s.cash>=c?'good':''}">${money(c)}</span></div>
    ${need.length?`<p class="small warn" style="margin-top:8px">Осталось: ${need.join('; ')}.</p>`:''}
    <button class="btn ${need.length?'':'primary'} block" style="margin-top:10px" data-act="carShop" ${need.length?'disabled':''}>Поставить оборудование для автомобилей · ${money(c)}</button>`,need.length?`осталось: ${need.length} ${plural(need.length,'условие','условия','условий')}`:'можно ставить');}
/* ---------- «Модели»: какие классы можно чертить ---------- */
function lineEmptyCard(s,L){
  if(L==='moto'&&!lineOn(s,'moto'))return `<p class="small muted" style="margin-top:6px">🏍 Мотоцикл — когда на заводе будет оборудование для мотоциклов («Завод» → «Технологии завода»).</p>`;
  if(L==='car'&&!lineOn(s,'car')){const need=carShopNeed(s);return `<p class="small muted" style="margin-top:6px">🚗 ${s.carShopB?`Оборудование для автомобилей ставится — ещё ${s.carShopB.left} мес.; первую машину можно чертить уже сейчас.`:`Автомобиль — когда будет оборудование для автомобилей${need.length?`: ${need.join('; ')}`:''} (вкладка «Завод»).`}</p>`;}
  return '';}
function canDesign(s,L){return L==='moto'?lineOn(s,'moto')||!!s.mshopB:lineOn(s,'car')||!!s.carShopB;}
/* ---------- «Продажи»: рынок мотоциклов дома, мотомарки ---------- */
function vMarketMoto(){if(!motoVis(G))return '';
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
    if(!need.length)add(80,'🚗','Мастерская готова к автомобилю: опыт есть, КБ справится, денег хватает. Поставьте оборудование для автомобилей.',`Оборудование · ${money(carShopCost(s))}`,()=>ACT.carShop(),'plant');
    else if(s.m===0||s.m===6)add(26,'🚗',`Путь к автомобилю: ${need.join('; ')}.`,'Подробнее',()=>{},'plant');}
  // мастерская там, где мотоциклов покупают мало (Германия, Италия до 1920-х): главный рынок — Франция, родина мотоцикла
  if(s.motoStart&&home!=='fr'&&!impLv(s,'fr')&&!tradeBan(s,'fr')&&s.models.some(m=>m.status==='prod'&&isMoto(m))&&(s.m%3===0)){const pf=marketPotential(s,'fr'),ph=homeDemand(s),c1=impCost(s,'fr',1);
    if(pf>Math.max(1,ph*0.5)&&s.cash>c1*1.5)add(70,'🌍',`Дома ваших мотоциклов берут ≈ ${fmtD(ph)} в месяц, а во Франции брали бы ≈ ${fmtD(pf)}: это родина мотоцикла. Импортёр в Париже — главный рынок мастерской.`,`Импортёр · ${money(c1)}`,()=>{impUp(G,'fr');},'market');}
  // 0.33: мотоцикл делается в тех же цехах — «завод на пределе» говорит общий совет; поток мотоциклов — когда их много
  if(motoLv(s)===1&&mshopCan(s)&&L&&(L.mmade||0)>=80){const c=mshopCost(s,2);if(s.cash>c*2)add(40,'🏍',`Мотоциклов выходит ${fmtN(L.mmade)} в месяц: поток мотоциклов (как у Indian в 1912 году) сократит часы на мотоцикл на треть, а место в цехе — на пятую часть.`,`Поток · ${money(c)}`,()=>ACT.mshop(),'plant');}
  // перенос технологий: выгодный — с хорошим шансом и раньше истории на 2+ года
  if(lineOn(s,'moto')&&rdSlots(s)>rdActive(s).length){const X=xferProjects(s).filter(p=>p.chance>=0.5&&p.yrs>=2).sort((a,b)=>b.chance*b.yrs-a.chance*a.yrs)[0];
    if(X&&s.cash>rdCost(X,s)*3)add(52,'🔁',`${X.name}: шанс ${Math.round(X.chance*100)}%, на ${X.yrs} ${plural(X.yrs,'год','года','лет')} раньше истории — дешевле нового исследования.`,`Перенос · ${money(rdCost(X,s))}`,()=>{rdBegin(G,X);},'models');}
  // автомобильная марка: мотоциклы — вторая линейка, когда их покупают много
  if(!motoVis(s)&&mshopCan(s)&&mk&&(mk.msize||0)>Math.max(150,(mk.size||0)*0.35)&&s.cash>mshopCost(s)*4&&(s.m===2||s.m===8))
    add(24,'🏍',`Дома мотоциклов покупают ${fmtN(mk.msize)} в месяц — ${mk.size?Math.round(mk.msize/mk.size*100)+'% от числа машин':'больше, чем машин'}. Оборудование для мотоциклов — и в тех же цехах пойдут мотоциклы: свои покупатели, общие дилеры и КБ.`,`Оборудование · ${money(mshopCost(s))}`,()=>ACT.mshop(),'plant');}
