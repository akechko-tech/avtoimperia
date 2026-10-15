/* ================= 0.32–0.33: МОТОЦИКЛЫ НА ЗАВОДЕ — ОБОРУДОВАНИЕ, «МОТОМАСТЕРСКАЯ», ПУТЬ К АВТОМОБИЛЮ =================
   0.33 (отзыв: «не нужно два цеха — пусть это будет одна сущность»): завод один. Мотоцикл — такая же техника марки, как машина:
   делается в тех же цехах (места занимает в 7–10 раз меньше машины), теми же рабочими, у тех же поставщиков, продаётся теми же
   дилерами, проектируется тем же КБ. Чтобы делать мотоциклы, завод докупает оборудование: «Мотоциклетный участок» (стенды
   для моторов, рам и колёс), позже — «Поток мотоциклов» (как у Indian в Спрингфилде в 1912 году).
   «Мотомастерская» — другой старт: январь 1899 года, малый капитал, один мотоцикл. Автомобиль — когда наберётесь опыта
   (пять лет работы и 3000 мотоциклов), КБ станет мастерской опытных образцов и хватит денег на оборудование для автомобилей.
   Так шли Laurin & Klement (велосипеды 1895, мотоциклы 1899, первый автомобиль 1905), NSU (мотоциклы 1901, автомобиль 1906),
   Peugeot и позже BMW. */
// оборудование для мотоциклов: 1 — мотоциклетный участок (можно делать мотоциклы), 2 — поток мотоциклов (часов и места меньше)
const MSHOP={y:1896,c:2500,mo:3,cap:1},MSHOP2={y:1911,c:9000,mo:4,hrs:0.7,cx:0.8,hist:[1912,'Indian (Спрингфилд)']};
function motoLv(s){return (s&&s.lines&&+s.lines.moto)||0;}
function motoMade(s){return (s.models||[]).reduce((a,m)=>a+(isMoto(m)?m.made||0:0),0);}
function motoModels(s,st){return (s.models||[]).filter(m=>isMoto(m)&&(!st||m.status===st));}
function carModels(s,st){return (s.models||[]).filter(m=>!isMoto(m)&&(!st||m.status===st));}
// покупка оборудования: участок или поток (одна стройка за раз)
function mshopNext(s){const lv=motoLv(s);return lv>=2?0:lv===1?(s.y>=MSHOP2.y-techEarly(s)?2:0):(s.y>=MSHOP.y?1:0);}
function mshopCost(s,lv){lv=lv||mshopNext(s)||1;return Math.round((lv===2?MSHOP2.c:MSHOP.c)*cpi(s)/100)*100;}
function mshopCan(s){return !s.mshopB&&mshopNext(s)>0;}
function mshopStart(s){if(!mshopCan(s))return false;const lv=mshopNext(s),c=mshopCost(s,lv);if(s.cash<c)return false;s.cash-=c;s.plantVal+=c*0.7;
  const mo=Math.max(1,Math.round((lv===2?MSHOP2.mo:MSHOP.mo)*(DIF().build??1)));s.mshopB={left:mo,t:mo,lv};
  addLog(lv===2?`Ставим поток мотоциклов: ${money(c)}, ${mo} мес. — часов на мотоцикл станет на треть меньше.`:`Ставим мотоциклетный участок: ${money(c)}, ${mo} мес. Мотоциклы пойдут в тех же цехах и к тем же дилерам (и в велосипедные лавки).`,'good');return true;}
// 0.33: мощность одна — расширять отдельно мотоциклетный цех не нужно (старые вызовы — на общий цех)
function mcapMonths(s,n){return capMonths(s,n);}
function mcapOrder(s,n,quiet){return capOrder(s,Math.max(1,Math.round(n)),quiet);}
// типичная трудоёмкость мотоцикла сейчас — чтобы показать мощность цеха в мотоциклах
function motoCx(s){const L=motoModels(s,'prod');if(L.length)return L.reduce((a,m)=>a+complexity(m),0)/L.length;return complexity({...rivalDesign('moto',s.y),t:'t0'});}
// сколько мотоциклов вышло бы, если бы весь завод делал только их (для подписи на «Заводе»)
function mcapUnits(s){return capEff(s)/Math.max(0.01,motoCx(s));}
// оборудование для автомобилей у «Мотомастерской» (и места в цехах под машины): опыт, КБ и деньги
const CARSHOP={made:3000,yrs:5,kb:2,c:10000,mo:6,cap:3};
function carShopCost(s){return Math.round((CARSHOP.c*cpi(s)+CARSHOP.cap*capUnitCost(s))/100)*100;}
function carShopNeed(s){const L=[];const mm=motoMade(s),yrs=s.motoStart?yf(s)-s.motoStart:99;if(mm<CARSHOP.made)L.push(`выпустить ещё ${fmtN(CARSHOP.made-mm)} мотоциклов — рабочие учатся моторам, рамам и сборке`);
  if(yrs<CARSHOP.yrs){const left=Math.ceil((CARSHOP.yrs-yrs)*12);L.push(`мастерам — ещё ${left>=12?Math.ceil(left/12)+' '+plural(Math.ceil(left/12),'год','года','лет'):left+' мес.'} опыта (автомобиль — не мотоцикл: рама, коробка, подвеска)`);}
  if((s.rd&&s.rd.lvl||1)<CARSHOP.kb)L.push(`КБ — «${RD_LV[CARSHOP.kb]}» (сейчас «${RD_LV[s.rd.lvl||1]}»)`);if(s.cash<carShopCost(s))L.push(`${money(carShopCost(s))} на оборудование`);return L;}
function carShopCan(s){return !lineOn(s,'car')&&!s.carShopB&&!carShopNeed(s).length;}
function carShopStart(s){if(!carShopCan(s))return false;const c=carShopCost(s);s.cash-=c;s.plantVal+=c*0.8;const mo=Math.max(2,Math.round(CARSHOP.mo*(DIF().build??1)));s.carShopB={left:mo,t:mo};
  addLog(`Ставим оборудование для автомобилей: ${money(c)}, ${mo} мес. Можно уже чертить первую машину.`,'good');pendingToasts.push('🏭 Оборудование для автомобилей');return true;}
// стройки цехов — каждый месяц (из step)
function motoTick(s){
  if(s.mshopB){s.mshopB.left--;if(s.mshopB.left<=0){const lv=s.mshopB.lv||1;s.mshopB=null;s.lines=s.lines||{car:1};s.lines.moto=Math.max(motoLv(s),lv);
    if(lv===2){addLog(`Поток мотоциклов готов: часов на мотоцикл на треть меньше, места в цехе — на пятую часть.`,'good');pendingToasts.push('🏍 Поток мотоциклов');}
    else{addLog(`Мотоциклетный участок готов: мотоциклы делаются в тех же цехах, что и машины (место — на ${fmtN(Math.round(1/Math.max(0.02,motoCx(s))))} мотоциклов вместо одной машины). Начертите мотоцикл: «Модели» → «Новая модель» → класс «Мотоцикл».`,'good');pendingToasts.push('🏍 Можно делать мотоциклы');}}}
  if(s.carShopB){s.carShopB.left--;if(s.carShopB.left<=0){s.carShopB=null;s.lines=s.lines||{};s.lines.car=1;s.cap=(s.cap||0)+CARSHOP.cap;s.carY=s.y;
    addLog(`Оборудование для автомобилей готово: в цехах прибавилось места, завод может делать и машины. Мастерская, которая начинала с мотоциклов, становится автомобильным заводом.`,'good');
    pushEvent({own:1,kicker:'Завод',title:`«${s.company}»: можно делать автомобили`,deck:`${fmtN(motoMade(s))} мотоциклов — и первый автомобиль`,
      text:`Мастерская, которая ${s.y-(s.motoStart||1899)} ${plural(s.y-(s.motoStart||1899),'год','года','лет')} назад собирала первые мотоциклы, поставила оборудование для автомобилей: стапели для рам, стенды для коробок и мостов. Рабочие умеют точить моторы и варить рамы, дилеры знают марку, у КБ есть опыт.\nТеперь — первый автомобиль: «Модели» → «Новая модель». Мотоциклы остаются: их делают в тех же цехах.`,
      choices:[['Начертить автомобиль','carDesign'],['Позже','ok']]},true);}}}
/* ---------- старт «Мотомастерская» ---------- */
// год старта — когда в стране есть кому продавать: во Франции — бум трициклов де Диона (1899), в Британии — 1902 (Triumph), в Германии и Америке — 1903
// (NSU, Wanderer; Indian, Harley-Davidson), в Италии — 1905 (Bianchi, Frera; свой рынок крошечный — продавайте и во Франции)
const MSTART_Y=1899,MSTART_C={fr:1899,uk:1902,de:1903,us:1903,it:1905,ru:1902};
function motoStartY(c){return MSTART_C[c]||MSTART_Y;}
// 0.32: и у автомобильной марки — насколько труден старт в стране (рынок 1895 года по истории)
const CSTART_TIP={fr:['легко','Франция — колыбель автомобиля: до 1905 года здесь покупают больше машин, чем где-либо в мире.'],
  de:['средне','Германия: Benz и Daimler уже продают машины; рынок растёт медленно, но верно, а Франция рядом.'],
  uk:['средне','Британия: до ноября 1896 года действует «закон красного флага» — рынок рождается позже, зато быстро растёт.'],
  us:['трудно','Америка 1895 года: машин покупают десятки в год, рынок проснётся к 1899–1900 годам (Olds, Winton). Берегите деньги или продавайте во Франции.'],
  it:['трудно','Италия: покупателей дома — единицы; главный рынок — Франция, через импортёра.'],
  ru:['очень трудно','Россия: машин в стране — десятки, покупают великие князья, купцы и казна; ввоз дорогой, дорог нет. Продавайте за границей, берите военные и казённые заказы. В 1917 году — революция.']};
// насколько труден старт мастерской в стране: дома мотоциклы покупают много (Франция, Британия) или рынок только рождается
const MSTART_TIP={fr:['легко','Франция — родина мотоцикла: трициклы De Dion-Bouton в моде, покупателей много.'],
  uk:['средне','Британия: мотоциклы в моду входят как раз сейчас — рынок растёт быстро, до войны он второй в Европе.'],
  us:['средне','Америка: рынок только рождается, но к 1910-м — бум (Indian, Harley-Davidson); дешёвый Ford T потом отберёт покупателей.'],
  de:['трудно','Германия: до 1920-х мотоциклов дома покупают мало — продавайте во Франции через импортёра; бум — после войны.'],
  it:['очень трудно','Италия: покупателей дома — единицы, без импортёра во Франции мастерская не выживет.'],
  ru:['очень трудно','Россия: велосипедов много, мотоциклов — сотни в год, почти все ввозные; продавайте и во Франции. В войну армии нужны мотоциклы с колясками, в 1917 году — революция.']};
function newMotoGame(pioneer,country,company,diff,firstName){
  newGame(pioneer||'custom',country,company||'Мотомастерская',diff,'');const g=G,y=motoStartY(country);
  g.y=y;g.m=0;g.motoStart=y;g.lines={car:0,moto:1};g.cap=1.2;g.capBuild=[];g.workers=6;g.ui=g.ui||{};
  g.fleet={};g.mkY={};for(const cc in COUNTRIES)g.fleet[cc]=fleetHist(cc,y);
  for(const cc in COUNTRIES){const R2=mkCountry(cc,g,[]);g.mkY[cc]=SEGK.reduce((a,gg)=>a+R2.segs[gg].inc,0)*12/SEASON[0];}
  // малый капитал: мастерская, а не завод (около трети автомобильного старта)
  g.cash=Math.round(COUNTRIES[country].cash*0.32*bn('cash')*DIF().cash/100)*100;
  const nm=(firstName||'').trim()||'Мото 1',d=rivalDesign('moto',y);
  g.models=[{id:1,name:nm,e:d.e,g:d.g,c:d.c,k:d.k,b:d.b,t:'t0',w:d.w,paint:'#1b1d22',price:0,plan:'auto',status:'prod',devLeft:0,launched:mi(g),stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0}];
  g.models[0].price=Math.round(refPrice(g.models[0],g)/10)*10;
  g.dealers={[country]:1};   // мотоциклы продают велосипедные лавки: своих агентов — один
  g.plantVal=g.cap*capUnitCost(g);g.wh=10;g.ad=10;
  try{awInit(g,true);}catch(_){}
  g.log=[];addLog(`${PIONEERS[g.pioneer]&&PIONEERS[g.pioneer].name!=='Свой персонаж'?PIONEERS[g.pioneer].name+' открыл':'Вы открыли'} мотомастерскую «${g.company}», ${cityOf(g)}. ${g.workers} рабочих, первый мотоцикл — «${nm}». Его продают ${g.dealers[country]} ${plural(g.dealers[country],'агент','агента','агентов')} и велосипедные лавки.`,'hist');
  return g;}
function motoIntroPapers(s){const md=s.models[0],p=parts(md),C=COUNTRIES[s.country];
  pushEvent({kicker:'Январь '+s.y,title:'Мотор на велосипеде',deck:'Трициклы де Диона и «мотоциклетка» Вернеров',img:'De Dion-Bouton tricycle',imgCap:'Трицикл De Dion-Bouton',choices:[['Читать дальше','ok']],
    text:'По Парижу трещат трициклы де Диона: лёгкий быстроходный мотор, три колеса, никакой лошади. Братья Вернер поставили моторчик на велосипед и назвали машину «мотоциклеткой». Мотоцикл стоит в пять-шесть раз дешевле автомобиля: его берут врачи, почтальоны, коммивояжёры и молодые смельчаки.\nНастоящий автомобиль пока по карману немногим. Но мастерская, которая научится делать моторы и рамы, однажды сможет построить и его.'},true);
  pushEvent({own:1,kicker:cityOf(s),title:`«${s.company}» открывает мотомастерскую`,deck:'Сначала мотоциклы — потом автомобиль',
    text:`В мастерской ${s.workers} рабочих, в кассе ${money(s.cash)}. Первый мотоцикл — «${md.name}»: ${p.e.name.toLowerCase()}, ${p.c.name.toLowerCase()}. Его продают велосипедные лавки и ${s.dealers[s.country]} ${plural(s.dealers[s.country],'агент','агента','агентов')}.\nАвтомобиль — когда наберётесь опыта: не меньше пяти лет работы и 3000 мотоциклов, КБ — мастерская опытных образцов и деньги на оборудование для автомобилей (вкладка «Завод»). В истории на это уходило пять–восемь лет.\nОдин ход — один месяц.`},true);}
/* ---------- армия, почта, рекорды ---------- */
// мотоцикл в армии: связные, санитары, пулемётные расчёты в коляске (Douglas поставил британской армии ~25 000 машин)
function motoForTender(s,kind){const L=motoModels(s,'prod');if(!L.length)return null;const sd=L.filter(m=>segOf(m)==='moside'),src=kind==='moside'&&sd.length?sd:L;return src.sort((a,b)=>classScore(b,s)-classScore(a,s))[0];}
/* ---------- 0.32: ОБЩИЕ ТЕХНОЛОГИИ — «ПЕРЕНОС» МЕЖДУ ЛИНЕЙКАМИ ----------
   Изобретение принадлежит марке, а не линейке: что КБ освоило в автомобиле (или в мотоцикле), можно попробовать перенести
   в другую линейку раньше истории. Перенос дешевле нового исследования (30–60%) и вдвое быстрее, но может не удаться:
   неудача — не ноль, деталь выходит тяжелее или дороже, а вторая попытка дешевле и вероятнее.
   Совместимость: 3 — высокая (электрика, шины, сплавы), 2 — средняя (моторы, передача, подвеска), 1 — низкая (кузов). */
const XFER=[
  {k:'twin',n:'Двухцилиндровый мотор',a:'e2',b:'me5',cp:2},{k:'four',n:'Четырёхцилиндровый мотор',a:'e3',b:'me4',cp:2},
  {k:'ohv',n:'Верхние клапаны',a:'e7',b:'me9',cp:2},{k:'drum',n:'Барабанный тормоз',a:'k2',b:'mk2',cp:3},
  {k:'drum2',n:'Тормоза на все колёса',a:'k3',b:'mk3',cp:3},{k:'tread',n:'Шины с протектором',a:'w3',b:'mw2',cp:3},
  {k:'balloon',n:'Баллонные шины',a:'w8',b:'mw3',cp:3},{k:'shaft',n:'Карданный привод',a:'g3',b:'mt5',cp:2},
  {k:'gear3',n:'Коробка на три передачи',a:'g6',b:'mt4',cp:2},{k:'press',n:'Штампованная рама',a:'c4',b:'mf5',cp:2},
  {k:'shock',n:'Подвеска с амортизаторами',a:'c5',b:'mf6',cp:2},{k:'vanad',n:'Ванадиевая сталь',a:'c6',b:'mf4',cp:3},
  {k:'body',n:'Кузов с крылом',a:'b2',b:'mb2',cp:1}];
const XFER_CP={3:'высокая',2:'средняя',1:'низкая'};
function partById(id){for(const c of PART_CATS){const x=byId(c.arr(),id);if(x)return x;}return null;}
function partCat(x){const c=PART_CATS.find(c=>c.arr().includes(x));return c?c.k:'e';}
// марка владеет технологией: сделала прототип раньше истории, улучшала в КБ или выпускает с ней машины
function xferOwn(s,x){if(!x)return false;if(s.rd.early.includes(x.id))return true;if(x.y>s.y)return false;return upgL(x.id)>0||(s.models||[]).some(m=>(m.made||0)>0&&PART_KEYS.some(k=>m[k]===x.id));}
function rdDoneIn(s,mo){const D=s.rd.done||{};return (mo?D.m:D.c)||0;}
function xferList(s){const out=[];XFER.forEach(X=>{[[X.a,X.b],[X.b,X.a]].forEach(([from,to])=>{const src=partById(from),dst=partById(to);if(!src||!dst)return;
  if(!lineOn(s,dst.moto?'moto':'car'))return;const flaw=s.rd.flaw&&s.rd.flaw[dst.id];if(dst.y<=s.y||(s.rd.early.includes(dst.id)&&!flaw))return;if(!xferOwn(s,src))return;out.push({X,src,dst,flaw:!!flaw});});});return out;}
function xferChance(s,X,src,dst){const base={3:0.65,2:0.45,1:0.25}[X.cp]||0.4,lineExp=Math.min(0.15,0.03*rdDoneIn(s,!!dst.moto)),
  tech=Math.min(0.15,0.05*upgL(src.id))+((s.models||[]).some(m=>(m.made||0)>0&&PART_KEYS.some(k=>m[k]===src.id))?0.05:0),retry=0.25*(((s.rd.xtry||{})[dst.id])||0);
  return clamp(base+lineExp+tech+retry,0.1,0.95);}
function xferProjects(s){const busy=new Set(rdActive(s).map(p=>p.kind+':'+p.id));
  return xferList(s).filter(o=>!busy.has('xfer:'+o.dst.id)).map(o=>{const yrs=Math.max(1,o.dst.y-s.y),need=(10+6*yrs)*0.5*(o.dst.moto?0.6:1);
    return {kind:'xfer',id:o.dst.id,from:o.src.id,cat:'Перенос',ck:partCat(o.dst),moto:o.dst.moto?1:0,yrs,cp:o.X.cp,xk:o.X.k,retry:o.flaw?1:0,
      name:`${o.flaw?'Доводка переноса':'Перенос'}: ${o.X.n} → ${o.dst.moto?'мотоцикл':'автомобиль'}`,need:Math.max(3,Math.round(need*(o.flaw?0.6:1))),chance:xferChance(s,o.X,o.src,o.dst)};});}
// цена: как у прототипа той же детали, умноженная на 0,3 (высокая совместимость) … 0,6 (низкая); доводка после неудачи — ещё на 40% дешевле
function xferCost(pj,s){const base=rdCost({kind:'early',ck:pj.ck,id:pj.id,yrs:pj.yrs,need:Math.round((10+6*pj.yrs)*(pj.moto?0.6:1))},s);return Math.max(50,Math.round(base*({3:0.3,2:0.45,1:0.6}[pj.cp]||0.45)*(pj.retry?0.6:1)/50)*50);}
function xferDone(s,pj){const dst=partById(pj.id),X=XFER.find(x=>x.k===pj.xk)||{n:pj.name},src=partById(pj.from);if(!dst)return;
  s.rd.done=s.rd.done||{};const lk=dst.moto?'m':'c';s.rd.done[lk]=(s.rd.done[lk]||0)+1;
  const p=src?xferChance(s,X,src,dst):0.5,to=dst.moto?'мотоцикл':'автомобиль';s.rd.flaw=s.rd.flaw||{};s.rd.xtry=s.rd.xtry||{};
  if(!s.rd.early.includes(dst.id))s.rd.early.push(dst.id);
  if(Math.random()<p){const was=!!s.rd.flaw[dst.id];delete s.rd.flaw[dst.id];
    addLog(`КБ ${was?'довело перенос':'перенесло'} «${X.n}» в ${to}: ${dst.name} — на ${dst.y-s.y} ${plural(dst.y-s.y,'год','года','лет')} раньше истории, как задумано.`,'good');pendingToasts.push('🔁 Перенос удался: '+X.n);}
  else{const heavy=Math.random()<0.5;s.rd.flaw[dst.id]=heavy?{kg:1.25}:{c:1.3};s.rd.xtry[dst.id]=(s.rd.xtry[dst.id]||0)+1;
    addLog(`Перенос «${X.n}» в ${to} удался лишь наполовину: ${dst.name} ${heavy?'вышел на четверть тяжелее':'обходится на 30% дороже'} расчётного. Деталь ваша, но вторая попытка («Доводка переноса») дешевле и вероятнее.`,'bad');pendingToasts.push('🔁 Перенос: деталь тяжелее/дороже');}}
// значки линеек для деталей в КБ: освоена / можно перенести (шанс) / несовместима
function xferBadge(s,x){const X=XFER.find(q=>q.a===x.id||q.b===x.id);if(!X)return '';const other=partById(X.a===x.id?X.b:X.a);if(!other)return '';
  const mine=xferOwn(s,other),line=other.moto?'🏍':'🚗',av=other.y<=s.y||s.rd.early.includes(other.id);
  if(av&&!(s.rd.flaw&&s.rd.flaw[other.id]))return `<span class="good">${line} освоена</span>`;
  if(!lineOn(s,other.moto?'moto':'car'))return '';const o=xferList(s).find(q=>q.dst.id===other.id);
  return o?`<span class="warn">${line} можно перенести · шанс ${Math.round(xferChance(s,o.X,o.src,o.dst)*100)}%</span>`:mine?'':`<span class="muted">${line} перенос — когда освоите</span>`;}
