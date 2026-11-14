// 0.49: боевой вылет кончается своим итогом (а не «по расчёту»); газета о вылете — с аэропланом; рекорды в войну — с объяснением;
// первый полёт — один, «Выход» после итога его принимает; первенство на месяцы раньше истории; род и заглавная буква в отчёте. node game/test/v49.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
const fresh=(y,m)=>{seed(3);newAirGame('bleriot','fr','','normal','');const s=G;s.pending=[];s.y=y;s.m=m;s.air.lv=Math.max(1,s.air.lv||0);return s;};
const plane=(s,role,o)=>{const t=tNow(s),d=airRefMd(role,t),md=airNewModel(s,{...d,role,name:(o&&o.name)||'Наш'},{status:'prod',flown:1});md.flown=1;md.status='prod';return md;};
const fz=FW_SC.front.front.z;
/* ---------- фронт: у каждого вида вылета есть итог ---------- */
{const s=fresh(1917,6),P=airBestPilot(s);let all=true,names=[];
  for(const k of Object.keys(FR_T)){const md=plane(s,k==='bomb'?'bomb':k==='recon'?'recon':'fight',{name:'Наш '+k});const m={id:'t_'+k,k,T:mi(s),foes:1,ace:false};
    const M=flApplyOnce(flMission({kind:'war',md,pil:P,fm:m}));names.push(FR_T[k].n);if(typeof M.fin!=='function'||typeof M.clock!=='function'||typeof M.done!=='function'||typeof M.quitText!=='function')all=false;}
  ok(all,'у всех пяти вылетов есть итог, часы и текст выхода (M.fin стоял после «return frMission» — его не было): '+names.join(', '));}
/* ---------- аэростат: разбился до цели — «Сбит», а не случайный исход ---------- */
{const s=fresh(1915,10),P=airBestPilot(s),md=plane(s,'fight'),m={id:'t_b1',k:'balloon',T:mi(s),foes:0,ace:false};const M=flApplyOnce(flMission({kind:'war',md,pil:P,fm:m}));FL.mi=M;
  FL.me={crash:'ударился носом о землю',p:[0,60,100],gnd:0,Vg:0};let thrown='';try{M.step();}catch(e){thrown=String(e);}
  ok(!thrown&&M.over&&M.res&&M.res.ok===false&&M.res.lost===true&&/Аэроплан разбит/.test(M.res.txt),'авария до цели: полёт кончается итогом «'+(M.res?M.res.txt:thrown)+'»');
  M.apply();M.apply();const ev=s.pending.filter(e=>e.kicker==='Фронт');
  ok(ev.length===1&&/неудача/.test(ev[0].title)&&ev[0].airId===md.id&&s.air.fr.n===1&&s.air.fr.lost===1&&s.air.front[m.id].ok===false,'в зачёт идёт он — одна заметка «'+(ev[0]?ev[0].title:'')+'», вылетов 1, потерь 1 (повторное «Принять» ничего не добавляет)');}
/* ---------- сбил аэростат и вернулся — «задание выполнено» ---------- */
{const s=fresh(1917,9),P=airBestPilot(s),md=plane(s,'fight'),m={id:'t_b2',k:'balloon',T:mi(s),foes:0,ace:false};const M=flApplyOnce(flMission({kind:'war',md,pil:P,fm:m}));FL.mi=M;
  const a=FL.me={crash:null,p:[0,400,fz+1500],gnd:0,Vg:40};M.step();M.onBall();ok(M.obj===1&&!M.over,'аэростат подожжён — задание отмечено, полёт продолжается');
  ok(/ещё над врагом/.test(M.quitText()),'над врагом «Выход» честно предупреждает: '+M.quitText());
  a.p=[40,62,-300];ok(/вылет засчитают/.test(M.quitText()),'над своими: '+M.quitText());
  a.gnd=1;a.Vg=1;M.step();ok(M.over&&M.res.ok===true&&!M.res.lost&&/Аэростат сожжён/.test(M.res.txt),'сел у своих: «'+M.res.txt+'»');
  M.apply();const ev=s.pending.find(e=>e.kicker==='Фронт');ok(ev&&/задание выполнено/.test(ev.title)&&/говорят в отрядах/.test(ev.text)&&!/не вытянул|Вернулся ни с чем/.test(ev.text),'газета: «'+(ev?ev.title:'')+'» — без «неудачи» и «не вытянул»');
  // рисунок: событие доносит аэроплан до газеты
  let got=null;const sp=showPaper;showPaper=o=>{got=o;};showEvent();showPaper=sp;
  const html=got?paperHTML(got,s):'';ok(got&&got.airId===md.id&&/p-fig p-air/.test(html)&&!/class="p-fig" /.test(html),'в заметке о вылете — рисунок аэроплана «'+md.name+'», а не автомобиль или мотоцикл марки');}
/* ---------- задание сделано, на обратном пути разбился: засчитано, машина потеряна; снимки разведки — нет ---------- */
{const s=fresh(1917,9),P=airBestPilot(s),md=plane(s,'fight'),m={id:'t_b3',k:'balloon',T:mi(s),foes:0,ace:false};const M=flApplyOnce(flMission({kind:'war',md,pil:P,fm:m}));FL.mi=M;
  FL.me={crash:null,p:[0,400,fz+1500],gnd:0,Vg:40};M.step();M.onBall();FL.me.crash='удар о землю — шасси подломилось';FL.me.p=[0,60,fz+900];M.step();
  ok(M.over&&M.res.ok===true&&M.res.lost===true&&/Аэростат сожжён/.test(M.res.txt)&&/На обратном пути сбит/.test(M.res.txt),'аэростат сожжён, сбит на обратном пути: «'+M.res.txt+'»');
  const md2=plane(s,'recon',{name:'Разведчик'}),m2={id:'t_r',k:'recon',T:mi(s),foes:0,ace:false};const M2=flApplyOnce(flMission({kind:'war',md:md2,pil:P,fm:m2}));FL.mi=M2;
  FL.me={crash:null,p:[0,400,fz+1500],gnd:0,Vg:40};M2.step();M2.obj=1;FL.me.crash='упал в лес';M2.step();ok(M2.over&&M2.res.ok===false&&M2.res.lost,'разведка: снимки не доехали до штаба — не засчитано («'+M2.res.txt+'»)');}
/* ---------- рекорды в войну ---------- */
{const s=fresh(1916,0);ok(airRecWait(s,'speed')==='war'&&!airRecCan(s,'speed'),'январь 1916: попытки рекорда нет — война');
  const h=airSkyHTML(s);ok(/Идёт война: федерация рекордов не засчитывает/.test(h)&&/После войны/.test(h)&&!/>Попытка</.test(h),'карточка «Мировые рекорды» объясняет: идёт война, кнопки — «После войны»');
  s.y=1913;s.m=4;s.air.rtry={speed:mi(s)-1};const h2=airSkyHTML(s);ok(airRecWait(s,'speed')===2&&/Через 2 мес\\./.test(h2)&&/>Попытка</.test(h2)&&!/Идёт война/.test(h2),'мир, попытка была месяц назад: «Через 2 мес.», остальные — «Попытка»');}
/* ---------- первый полёт — один ---------- */
{const s=fresh(1912,4);const d=airRefMd('sport',tNow(s)),md=airNewModel(s,{...d,role:'sport',name:'Опыт'},{status:'proto'});md.status='proto';md.flown=0;
  ok(airCanTest(md),'опытный образец ждёт первого полёта');const P=airBestPilot(s);
  const M=flApplyOnce(flMission({kind:'test',md,pil:P}));FL.mi=M;FL.on=true;FL.me={crash:'задел крылом землю',p:[0,40,0],gnd:0,Vg:0,eng:{run:1},hard:0};M.done('crash');
  ok(M.over&&md.status==='dev'&&!airCanTest(md),'разбит на испытаниях: образец — снова в работе');
  const f0=s.air.flights,c0=s.cash;flyQuitAsk();const news=s.pending.filter(e=>e.kicker==='Первый полёт');
  ok(!FL.on&&news.length===1&&/разбит на испытаниях/.test(news[0].title),'«Выход» после итога его принимает: заметка «'+(news[0]?news[0].title:'')+'» (раньше итог пропадал)');
  ACT.airFlyBtn({k:String(md.id)});ACT.airTestBtn({k:String(md.id)});ok(s.air.flights===f0&&s.cash===c0&&md.status==='dev','второй «первый полёт» того же образца в тот же месяц не начинается');}
/* ---------- отчёт о первом полёте: заглавная буква, род, отказ мотора ---------- */
{const s=fresh(1915,2);const mk=n=>{const d=airRefMd('sport',tNow(s)),md=airNewModel(s,{...d,role:'sport',name:n},{status:'proto'});md.status='proto';return md;};
  const t1=airTestApply(s,mk('Дукс 3'),{id:'test',n:'заводской испытатель',sk:0.62},'ok',{self:1,secs:34}).text;
  ok(/^Заводской испытатель поднял «Дукс 3» в воздух и пробыл в нём 34 с\\./.test(t1),'испытатель: «'+t1.slice(0,62)+'…»');
  const t2=airTestApply(s,mk('Ласточка'),AIR_PILOTS.find(p=>p.id==='delaroche'),'ok',{self:1,secs:150}).text;ok(/^Раймонда де Ларош подняла «Ласточка» в воздух и пробыла в нём/.test(t2),'лётчица: «'+t2.slice(0,58)+'…»');
  const t3=airTestApply(s,mk('Стриж'),{hero:1,id:'hero',n:'Блерио',sk:0.8},'ok',{self:1,secs:40}).text;ok(/^Вы подняли «Стриж» в воздух и пробыли в нём/.test(t3),'сами: «'+t3.slice(0,44)+'…»');
  const t4=airTestApply(s,mk('Чиж'),{id:'test',n:'заводской испытатель',sk:0.62},'flaw',{self:1,eng:'мотор разбит'}).text;ok(/^В воздухе отказал мотор — разбит; посадка — с планирования/.test(t4),'отказ мотора в первом полёте — в отчёте: «'+t4.slice(0,64)+'…»');}
/* ---------- первенство на месяцы раньше истории ---------- */
{const s=fresh(1913,6);const E=AIR_EV.find(e=>e.key==='loop-1913');ok(E.m===8&&/9 сентября 1913/.test(E.h[2]),'мёртвая петля в истории — сентябрь 1913 года');
  recordFirst(s,'air_ev_loop-1913',E.name,E.y,E.h[0],E.m);const f=s.firsts['air_ev_loop-1913'],ev=s.pending.find(e=>e.title==='Первыми в мире!');
  ok(f&&f.hy===1913&&ev&&/опередила историю на 2 месяца/.test(ev.text)&&/Пётр Нестеров только в сентябре 1913 года/.test(ev.text)&&!/1914/.test(ev.text),'июль 1913: «'+(ev?ev.text.slice(0,112):'')+'…»');
  s.firsts={};s.pending=[];s.y=1913;s.m=8;recordFirst(s,'air_ev_loop-1913',E.name,E.y,E.h[0],E.m);ok(!s.firsts['air_ev_loop-1913'],'в сентябре 1913-го — уже не первенство');
  s.y=1905;s.m=3;recordFirst(s,'part:e9','мотор',1908,'Ford (Model T)');const ev2=s.pending.find(e=>e.title==='Первыми в мире!');ok(ev2&&/на 3 года/.test(ev2.text)&&/только в 1908 году/.test(ev2.text),'детали — как раньше, по годам: «на 3 года… только в 1908 году»');}
/* ---------- рынок: подсказка о конкурсе ---------- */
{const s=fresh(1915,10);const md=plane(s,'fight',{name:'Хищник'});const h=airMarketHTML(s);ok(/Ваши: «Хищник»/.test(h)&&/Армия пока не берёт: первый заказ на модель — только по итогам конкурса министерства/.test(h),'у серийного истребителя без заказов — строка «Армия пока не берёт… конкурс министерства»');
  s.air.orders.push({md:md.id,n:20,left:12,price:5000,due:mi(s)+4,who:'Военное министерство',mil:1});ok(!/Армия пока не берёт/.test(airMarketHTML(s)),'есть контракт — строки нет');}
/* ---------- «не выдержала соперничества с вами» — только при заметной доле ---------- */
{seed(11);newGame('custom','fr','Проба','normal','Ласточка');const s=G,c='fr';s.pending=[];s.y=1915;s.m=2;s.dealers=s.dealers||{};s.mPrev={[c]:20000};s.mPrev2={[c]:20000};s.comps[c]=(COMPS[c]||[]).map(()=>({prev:1,prev2:1}));s.seen={};s.auc=null;
  s.cPrev={[c]:200};const r1=maSqueeze(s),a1=s.auc;s.cPrev={[c]:2400};const r2=maSqueeze(s);
  ok(r1===false&&!a1,'доля в стране 1 %: марка не «разоряется из-за вас»');ok(r2===true&&s.auc&&/не выдержала соперничества/.test(s.auc.txt),'доля 12 %: вытеснение работает, как раньше — торги за «'+(s.auc?s.auc.nm:'')+'»');}
console.log(bad?('ОШИБОК: '+bad):'всё в порядке');
}`);
