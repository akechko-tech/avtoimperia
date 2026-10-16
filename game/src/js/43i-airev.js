/* ================= 0.37: НЕБО — АВИАМИТИНГИ, ПЕРЕЛЁТЫ, ВОЕННЫЕ КОНКУРСЫ, РЕКОРДЫ =================
   Состязания по истории (Реймс 1909, Кубок Гордона Беннетта, Кубок Шнейдера, Ла-Манш, Петербург — Москва, Атлантика…):
   запись открыта за месяц до старта (перелёты-призы — за полгода: кто первым долетит, тот и взял приз). Лететь можно самому в 3D
   (41l-flight.js) или узнать результат сразу: по характеристикам аэроплана, мастерству лётчика и удаче — против настоящих соперников. */
// исторический результат победителя: скорость (км/ч), дальность (км), высота (м), часы перелёта
const AIR_EV_HV={'reims-gb-1909':75.7,'reims-gp-1909':180,'reims-alt-1909':155,'la-1910':1209,'spb-1910':62,'belmont-1910':98,'gb-1911':125,'gb-1912':174,'schneider-1913':73,'gb-1913':203.8,
  'schneider-1914':139.7,'gb-1920':271,'schneider-1920':172,'pulitzer-1920':251,'schneider-1921':189,'schneider-1922':234,'pulitzer-1922':330,'schneider-1923':285,'schneider-1925':374,
  'schneider-1926':396,'schneider-1927':453,'nar-1928':210,'schneider-1929':528.9,'thompson-1929':312,'channel-1909':0.62,'lonman-1910':12,'alps-1910':0.7,'parmad-1911':37,'spbmos-1911':24.7,
  'britain-1911':22,'med-1913':7.9,'kiev-1914':26,'atlantic-1919':16,'kingscup-1922':9,'moscow-peking-1925':120,'orteig-1927':33.5,'archdeacon-1908':1,'sciam-1908':1,'loop-1913':1};
const AIR_EV_KIND={speed:'гонка вокруг пилонов',dist:'дальность по кругу',alt:'высота',cross:'перелёт',trial:'военные испытания',circle:'полёт по кругу',loop:'фигуры'};
function airEvT(ev){return ev.y+ev.m/12;}
// окно записи: перелёты-призы — полгода до даты рекорда в истории; остальное — месяц до старта и сам месяц
function airEvWin(ev){const T=(ev.y-1895)*12+ev.m;return ev.kind==='cross'||ev.kind==='circle'||ev.kind==='loop'?[T-6,T]:[T-1,T];}
function airEvFor(s,ev){const c=s.country,t=airEvT(ev);if(ev.kind==='trial'&&!ev.open&&ev.c!==c)return false;if(!ev.open&&ev.c!==c&&ev.kind!=='cross')return false;
  if(airWarOn(c,t)||(airWarOn(ev.c,t)&&ev.c!==c))return false;if(airFoe(c,ev.c,t))return false;if(s.soviet&&ev.c!=='ru')return false;if(c==='de'&&t>=1919.5&&t<1926&&ev.c!=='de')return false;return true;}
function airEvStatus(s,ev){const A=s.air||{},T=mi(s),[a,b]=airEvWin(ev),r=(A.ev||{})[ev.key];if(r)return r.miss?'missed':'done';if(T<a)return 'soon';if(T<=b)return 'open';return 'closed';}
function airEvList(s){return AIR_EV.filter(ev=>airEvFor(s,ev));}
function airEvSoon(s){const T=mi(s);return airEvList(s).filter(ev=>{const st=airEvStatus(s,ev);return st==='open'||(st==='soon'&&airEvWin(ev)[0]-T<=3);});}
// какие аэропланы годятся: облетанные, а для Кубка Шнейдера — гидроаэропланы; на военный конкурс — своего назначения
function airEvMds(s,ev){return (s.air.models||[]).filter(m=>m.flown&&m.status!=='off'&&m.status!=='dev'&&(!ev.sea||airStats(m,tNow(s)).sea)&&(ev.kind!=='trial'||!ev.mil||m.role===ev.mil.role||ev.mil.role==='recon'&&['recon','train','sport'].includes(m.role)));}
/* ---------- соперники: победитель по истории и типичные аэропланы года ---------- */
/* 0.37: вы сами — победитель по истории (Блерио на Ла-Манше, Кёртисс в Реймсе, Сикорский в Москве): себя в соперниках не видно,
   результат истории показывает другой лётчик эпохи, а газета пишет «в истории это сделали вы» */
function airEvMine(s,ev){const P=PIONEERS[s.pioneer];if(!P||!P.air||s.pioneer==='custom')return false;const sur=P.name.split(' ').slice(-1)[0];return String(ev.h[0]).includes(sur);}
function airEvHist(s,ev){const H=ev.h;return airEvMine(s,ev)?`В истории это сделали вы: «${H[1]}» — ${H[2]}.`:`В истории: ${H[0]} на ${H[1]} — ${H[2]}.`;}
function airEvField(s,ev){const t=airEvT(ev),F=[],hv=AIR_EV_HV[ev.key]||0,sk=AIR_PILOTS.filter(p=>p.from<=t&&p.to+0.99>=t&&(ev.open||p.c===ev.c));
  const ref=r=>{const m=airRefMd(r,t);return {md:m,st:airStats(m,t)};};
  const W={n:ev.h[0],plane:ev.h[1],hist:1};
  if(airEvMine(s,ev)){const sur=PIONEERS[s.pioneer].name.split(' ').slice(-1)[0],alt=sk.find(p=>!p.n.includes(sur));W.n=alt?alt.n:'Лучший соперник';W.hist=0;W.plane='';}
  // соперники — чуть медленнее победителя по истории (кто был быстрее его — тот бы и победил)
  if(ev.kind==='speed'){W.v=hv||ref('race').st.v*0.95;F.push(W);const R=ref('race'),S=ref('sport');[[R,0.93],[S,0.9],[R,0.86],[S,0.82]].forEach(([x,k],i)=>{const p=sk[i]||{n:['Пилот завода','Лейтенант флота','Спортсмен','Инженер-пилот'][i],sk:0.75};if(p.n===W.n)return;
    const v=x.st.v*k*(0.92+0.08*(p.sk||0.75));F.push({n:p.n,plane:x.md.name,v:hv?Math.min(v,hv*[0.99,0.95,0.9,0.85][i]):v});});}
  else if(ev.kind==='dist'){W.d=hv||ref('sport').st.range;F.push(W);const S=ref('sport');[0.75,0.6,0.45].forEach((k,i)=>{const p=sk[i]||{n:'Авиатор',sk:0.7};if(p.n!==W.n)F.push({n:p.n,plane:S.md.name,d:Math.round(hv*k)});});}
  else if(ev.kind==='alt'){W.a=hv||ref('sport').st.ceil*0.5;F.push(W);[0.8,0.6].forEach((k,i)=>{const p=sk[i]||{n:'Авиатор',sk:0.7};if(p.n!==W.n)F.push({n:p.n,plane:ref('sport').md.name,a:Math.round(W.a*k)});});}
  else if(ev.kind==='trial'){W.q=1.04;F.push(W);[0.98,0.93,0.88].forEach((q,i)=>F.push({n:['«'+((airComps(ev.c,ev.mil?ev.mil.role:'recon',t)[i]||{x:{n:'Завод'}}).x.n)+'»'][0],plane:ref(ev.mil?ev.mil.role:'recon').md.name,q}));}
  else F.push(W);return F;}
/* ---------- результат без съёмки ---------- */
function airEvSim(s,ev,md,pil){const t=tNow(s),st=airStats(md,t),sk=pil.sk,r=()=>Math.random(),rel=st.rel,F=airEvField(s,ev),res={ev:ev.key,md:md.id,pil:pil.id,field:F};
  const hours=h=>Math.pow(rel,h*(1+(1-sk)*0.5)),fail=h=>r()>hours(h);
  if(ev.kind==='speed'){const len=ev.len||20,h=len/Math.max(30,st.v);res.v=st.v*(0.86+0.1*sk+0.05*(r()-0.5))*(st.ease<0.4?0.96:1);res.dnf=fail(h)?'мотор':null;
    res.place=res.dnf?F.length+1:1+F.filter(x=>x.v>res.v).length;res.txt=res.dnf?`сошёл: ${res.dnf}`:`${res.v.toFixed(1).replace('.',',')} км/ч`;}
  else if(ev.kind==='dist'){const endur=st.range/Math.max(20,st.vc)*(0.85+0.15*sk);let h=0;while(h<endur&&!fail(0.25))h+=0.25;res.d=Math.round(Math.min(h,endur)*st.vc*0.92);res.place=1+F.filter(x=>x.d>res.d).length;res.txt=`${fmtN(res.d)} км`;}
  else if(ev.kind==='alt'){const k=(0.55+0.3*sk+0.1*(r()-0.5))*(t<1911?0.35:t<1914?0.7:1);res.a=Math.round(st.ceil*k/10)*10;res.dnf=fail(st.ceil/Math.max(60,st.climb)/60)?'мотор заглох':null;if(res.dnf)res.a=Math.round(res.a*0.5);
    res.place=1+F.filter(x=>x.a>res.a).length;res.txt=`${fmtN(res.a)} м${res.dnf?' — '+res.dnf:''}`;}
  else if(ev.kind==='cross'){const len=ev.len||40,h=len/Math.max(30,st.vc*0.9),need=len*(ev.key==='channel-1909'?1.4:1.1),legs=Math.max(1,Math.round(len/Math.max(60,st.range*0.85)));
    let ok=st.range>=need||(legs>1&&!/atlantic|med|channel/.test(ev.place));const sea=/channel|med|atlantic/.test(ev.place);if(sea&&st.range<need)ok=false;
    const pf=1-Math.pow(rel,h*(sea?1.2:1)*(1+(1-sk)*0.6))*(ev.place==='alps'?0.75:1)*(0.92+0.08*sk);res.ok=ok&&r()>pf;res.h=Math.round(h*(1+legs*0.15)*10)/10;
    res.place=res.ok?1:0;res.txt=res.ok?`долетел за ${res.h.toString().replace('.',',')} ч`:!ok?'не хватило топлива — сел, не долетев':sea?'мотор сдал — сел на воду, лётчика подобрал миноносец':'мотор сдал — вынужденная посадка в поле';}
  else if(ev.kind==='trial'){const role=ev.mil?ev.mil.role:'recon',q=airQ(md,t,role).q*(0.94+0.08*sk+0.06*(r()-0.5))*(fail(2)?0.7:1);res.q=q;res.place=1+F.filter(x=>x.q>q).length;res.txt=`оценка комиссии ${q.toFixed(2).replace('.',',')}`;}
  else if(ev.kind==='circle'){const turn=st.turn<40&&st.climb>20,ok=turn&&!fail(0.2)&&r()<0.55+0.4*sk*st.ease;res.ok=ok;res.place=ok?1:0;res.txt=ok?'круг замкнут, посадка у старта':'не удалось замкнуть круг — сел в поле';}
  else if(ev.kind==='loop'){const ok=st.g>=4.5&&sk>=0.8&&st.climb>150&&r()<0.4+0.5*sk;res.ok=ok;res.place=ok?1:0;res.txt=ok?'петля!':'не хватило скорости — аэроплан скользнул на крыло, лётчик выровнял у самой земли';}
  return res;}
/* ---------- итог: приз, слава, газета ---------- */
function airEvApply(s,ev,res){const A=s.air,md=A.models.find(m=>m.id===res.md),P=airPilotList(s).find(p=>p.id===res.pil)||{n:'лётчик'},who=P.hero?PIONEERS[s.pioneer].name:P.n,won=res.place===1;
  A.ev=A.ev||{};A.ev[ev.key]={place:res.place,txt:res.txt,md:res.md,who,y:s.y,m:s.m,v:res.v||res.d||res.a||res.q||0};
  const prizeK=ev.kind==='speed'||ev.kind==='trial'||ev.kind==='alt'||ev.kind==='dist'?[1,0.5,0.25][res.place-1]||0:won?1:0;const prize=Math.round(ev.prize*prizeK*cpi(s)/tabAt(CPI,ev.y)/10)*10;
  if(prize>0){s.cash+=prize;A.prizes=(A.prizes||0)+prize;}
  const fameG=(won?(ev.open?10:6):res.place===2?3:res.place===3?1:-1)*bn('airFame')*(ev.prize>20000?1.5:1);A.fame=clamp(A.fame+fameG,0,100);if(won)A.wins=(A.wins||0)+1;
  if(md&&won&&['sport','race','train'].includes(md.role)){md.boost=Math.min(2,(md.boost||1)+0.25);}
  // первые в мире: перелёт или петля раньше истории
  if(won&&['cross','circle','loop'].includes(ev.kind)&&mi(s)<(ev.y-1895)*12+ev.m)try{recordFirst(s,'air_ev_'+ev.key,ev.name,ev.y+(ev.m>=6?1:0),airEvMine(s,ev)?'вы сами в настоящей истории':ev.h[0]);}catch(_){}
  // военный конкурс: победителю — заказ армии
  if(won&&ev.mil&&md){const n=Math.max(1,Math.round(ev.mil.n*(0.6+0.4*Math.random())));airOrderAdd(s,{md:md.id,n,price:airMilPrice(s,md),due:mi(s)+8,who:airMinistry(ev.c,airEvT(ev),ev.mil.role),c:ev.c,mil:1});}
  try{trophyAdd(s,{kind:'air',title:ev.name,sub:won?`Победа: ${who} на «${md?md.name:''}»`:`${res.place}-е место`,story:res.txt});}catch(_){}
  const hist=airEvHist(s,ev);
  pushEvent({own:1,kicker:'Небо',title:won?`${ev.name}: победа «${s.company}»!`:res.place>1&&res.place<=3?`${ev.name}: ${res.place}-е место`:`${ev.name}: неудача`,deck:`${who} на «${md?md.name:''}» — ${res.txt}`,
    text:`${won?(prize?`Приз — ${money(prize)}. `:'')+'Газеты печатают портрет лётчика на первой полосе, у ангаров — очередь из желающих купить такой же аэроплан.':res.place<=3&&res.place>1?(prize?`Приз за ${res.place}-е место — ${money(prize)}. `:'')+'Неплохо — но помнят только победителей.':'Толпа расходится разочарованной. Механики уже разбирают мотор.'}\n${hist}`},true);
  return {prize,fameG};}
// результат без съёмки — сразу
function airEvQuick(key,mdId,pid){const s=G,ev=AIR_EV.find(e=>e.key===key),md=s.air.models.find(m=>m.id===+mdId);if(!ev||!md||airEvStatus(s,ev)!=='open')return;const P=airPilotList(s).find(p=>p.id===pid)||airBestPilot(s);
  const res=airEvSim(s,ev,md,P);airEvApply(s,ev,res);closeSheet();save();render();}
// пропущенные состязания закрываются сами
function airEvMonth(s){const A=s.air;if(!A||!A.lv)return;const T=mi(s);airEvList(s).forEach(ev=>{const [,b]=airEvWin(ev);if(T>b&&!(A.ev||{})[ev.key]&&T-b<=2){A.ev=A.ev||{};A.ev[ev.key]={miss:1};}});}
/* ---------- рекорды: скорость, высота, дальность ---------- */
const AIR_REC_N={speed:['Рекорд скорости','км/ч'],alt:['Рекорд высоты','м'],dist:['Рекорд дальности','км']};
function airWorldRec(k,t){let r=null;for(const x of AIR_REC[k])if(x[0]<=t)r=x;return r;}
function airMyRec(s,k){return ((s.air||{}).rec||{})[k]||null;}
function airRecCur(s,k){const t=tNow(s),w=airWorldRec(k,t),m=airMyRec(s,k);return m&&(!w||m.v>w[1])?{v:m.v,who:m.who,plane:m.plane,mine:1}:w?{v:w[1],who:w[2],plane:w[3]}:{v:0,who:'—',plane:''};}
function airRecTry(s,k,md,P){const t=tNow(s),st=airStats(md,t),sk=P.sk,r=Math.random;let v=0,txt='';
  if(k==='speed'){v=st.v*(0.95+0.05*sk+0.02*(r()-0.5));txt=`${v.toFixed(1).replace('.',',')} км/ч на базе 3 км`;}
  if(k==='alt'){v=Math.round(st.ceil*(0.8+0.15*sk+0.05*(r()-0.5))*(t<1911?0.5:t<1914?0.85:1)/10)*10;txt=`${fmtN(v)} м`;}
  if(k==='dist'){let h=0;const endur=st.range/Math.max(20,st.vc);while(h<endur&&r()<Math.pow(st.rel,0.25))h+=0.25;v=Math.round(Math.min(h,endur)*st.vc*0.95);txt=`${fmtN(v)} км по кругу`;}
  return {v,txt};}
function airRecApply(s,k,md,P,v,txt){const A=s.air,cur=airRecCur(s,k),who=P.hero?PIONEERS[s.pioneer].name:P.n;A.rtry=A.rtry||{};A.rtry[k]=mi(s);
  if(v>cur.v*1.005){A.rec=A.rec||{};A.rec[k]={v,who,plane:md.name,y:s.y,m:s.m};A.fame=clamp(A.fame+12*bn('airFame'),0,100);if(md.boost!==undefined||true)md.boost=Math.min(2,(md.boost||1)+0.3);
    try{trophyAdd(s,{kind:'record',title:`${AIR_REC_N[k][0]}: ${txt}`,sub:`${who} на «${md.name}»`,story:`Прежний рекорд — ${fmtN(Math.round(cur.v))} ${AIR_REC_N[k][1]} (${cur.who}).`});}catch(_){}
    pushEvent({own:1,kicker:'Мировой рекорд',title:`${AIR_REC_N[k][0]}: ${txt}!`,deck:`${who} на «${md.name}»`,text:`Международная авиационная федерация засчитала рекорд: ${txt}. Прежний принадлежал ${cur.who}${cur.plane?' на «'+cur.plane+'»':''} — ${fmtN(Math.round(cur.v))} ${AIR_REC_N[k][1]}.\nРекорд — лучшая реклама: о «${s.company}» пишут газеты всего мира.`},true);return true;}
  pushEvent({own:1,kicker:'Попытка рекорда',title:`${AIR_REC_N[k][0]}: не вышло`,deck:`${who} на «${md.name}» — ${txt}`,text:`До рекорда (${fmtN(Math.round(cur.v))} ${AIR_REC_N[k][1]}, ${cur.who}) не хватило. Нужен аэроплан быстрее, легче или выше — или лётчик смелее.`},true);return false;}
function airRecQuick(k,mdId,pid){const s=G,md=s.air.models.find(m=>m.id===+mdId);if(!md)return;const P=airPilotList(s).find(p=>p.id===pid)||airBestPilot(s);const R=airRecTry(s,k,md,P);airRecApply(s,k,md,P,R.v,R.txt);closeSheet();save();render();}
function airRecCan(s,k){const A=s.air;if(!A||!A.lv)return false;if(airWarOn(s.country,tNow(s)))return false;return !((A.rtry||{})[k]>mi(s)-3);}
/* ---------- вкладка «Небо» ---------- */
let AEV=null;
function openAirEv(key){const s=G,ev=AIR_EV.find(e=>e.key===key);if(!ev)return;const L=airEvMds(s,ev),pils=airPilotList(s);AEV=AEV&&AEV.key===key?AEV:{key,md:L[0]?L[0].id:null,pid:(airBestPilot(s)||{}).id};
  const md=L.find(m=>m.id===AEV.md)||L[0],st=md?airStats(md,tNow(s)):null,F=airEvField(s,ev),open=airEvStatus(s,ev)==='open';
  const fl=F.map((x,i)=>`<li><time>${i+1}.</time><p>${esc(x.n)}${x.plane?' — '+esc(x.plane):''}${x.v?` · ${Math.round(x.v)} км/ч`:x.d?` · ${fmtN(x.d)} км`:x.a?` · ${fmtN(x.a)} м`:''}${x.hist?' <span class="muted">(победитель в истории)</span>':''}</p></li>`).join('');
  openSheet(`<div class="row"><h2>${esc(ev.name)}</h2>${X}</div><p class="small muted" style="margin-top:4px">${MONTHS_G[ev.m]} ${ev.y} · ${AIR_EV_KIND[ev.kind]}${ev.len?` · ${fmtN(ev.len)} км`:''}${ev.prize?` · приз ${money(Math.round(ev.prize*cpi(s)/tabAt(CPI,ev.y)/10)*10)}`:''}${ev.mil?` · победителю — заказ армии`:''}</p>
    ${photoHTML(AIR_IMG[ev.h[1]]||ev.h[1])}
    <p class="small" style="margin-top:8px">${esc(airEvHist(s,ev))}</p>
    ${fl?`<div class="label" style="margin-top:12px">Соперники</div><ul class="log">${fl}</ul>`:''}
    <div class="label" style="margin-top:12px">Аэроплан</div>${L.length?`<div class="chips">${L.map(m=>`<button class="chip ${md&&m.id===md.id?'on':''}" data-act="aevMd" data-v="${m.id}">${esc(m.name)}<small>${airSt(airStats(m,tNow(s)))}</small></button>`).join('')}</div>`:`<p class="small bad">Нет подходящего облетанного аэроплана${ev.sea?' — нужен гидроаэроплан (поплавки или лодка)':''}.</p>`}
    <div class="label" style="margin-top:12px">Лётчик</div><div class="chips">${pils.map(p=>`<button class="chip ${AEV.pid===p.id?'on':''}" data-act="aevPil" data-v="${p.id}">${esc(p.hero?p.n+' (вы)':p.n)}<small>мастерство ${Math.round(p.sk*100)}</small></button>`).join('')}</div>
    ${open&&md?`<div class="btns" style="margin-top:14px"><button class="btn primary" data-act="aevFly">✈ Лететь (3D)</button><button class="btn" data-act="aevQuick">Узнать результат</button></div>`:`<p class="small muted" style="margin-top:12px">${airEvStatus(s,ev)==='soon'?`Запись откроется ${MONTHS_G[airEvWin(ev)[0]%12]} ${1895+Math.floor(airEvWin(ev)[0]/12)} года.`:'Запись закрыта.'}</p>`}`);}
function openAirRec(k){const s=G,L=(s.air.models||[]).filter(m=>m.flown&&m.status!=='off'&&m.status!=='dev'),pils=airPilotList(s);AEV=AEV&&AEV.rec===k?AEV:{rec:k,md:L[0]?L[0].id:null,pid:(airBestPilot(s)||{}).id};
  const cur=airRecCur(s,k),md=L.find(m=>m.id===AEV.md)||L[0],st=md?airStats(md,tNow(s)):null,can=airRecCan(s,k);const est=st?(k==='speed'?Math.round(st.v):k==='alt'?Math.round(st.ceil*0.9):Math.round(st.range)):0;
  openSheet(`<div class="row"><h2>${AIR_REC_N[k][0]}</h2>${X}</div><p class="small" style="margin-top:6px">Мировой рекорд сейчас: <b>${fmtN(Math.round(cur.v))} ${AIR_REC_N[k][1]}</b> — ${esc(cur.who)}${cur.plane?' на «'+esc(cur.plane)+'»':''}${cur.mine?' <span class="good">(ваш)</span>':''}.</p>
    <div class="label" style="margin-top:12px">Аэроплан</div>${L.length?`<div class="chips">${L.map(m=>`<button class="chip ${md&&m.id===md.id?'on':''}" data-act="aevMd" data-v="${m.id}">${esc(m.name)}<small>${airSt(airStats(m,tNow(s)))}</small></button>`).join('')}</div>`:'<p class="small bad">Нет облетанного аэроплана.</p>'}
    ${md?`<p class="small muted" style="margin-top:6px">По расчёту «${esc(md.name)}» даст около ${fmtN(est)} ${AIR_REC_N[k][1]}.</p>`:''}
    <div class="label" style="margin-top:12px">Лётчик</div><div class="chips">${pils.map(p=>`<button class="chip ${AEV.pid===p.id?'on':''}" data-act="aevPil" data-v="${p.id}">${esc(p.hero?p.n+' (вы)':p.n)}<small>мастерство ${Math.round(p.sk*100)}</small></button>`).join('')}</div>
    ${md&&can?`<div class="btns" style="margin-top:14px"><button class="btn primary" data-act="arecFly">✈ Лететь (3D)</button><button class="btn" data-act="arecQuick">Узнать результат</button></div>`:`<p class="small muted" style="margin-top:12px">${!can?'Попытка — не чаще раза в три месяца, и не в войну.':''}</p>`}`);}
function airSkyHTML(s){const A=s.air,t=tNow(s),T=mi(s);if(!A||!A.lv)return '';
  const L=airEvList(s).filter(ev=>{const st=airEvStatus(s,ev);return st==='open'||(st==='soon'&&airEvWin(ev)[0]-T<=14);}).sort((a,b)=>airEvT(a)-airEvT(b)).slice(0,6);
  const evRow=ev=>{const st=airEvStatus(s,ev),pr=Math.round(ev.prize*cpi(s)/tabAt(CPI,ev.y)/10)*10;return `<div class="race-item"><div class="row"><div><h3>${esc(ev.name)}</h3><p class="small muted">${MONTHS_G[ev.m]} ${ev.y} · ${AIR_EV_KIND[ev.kind]}${pr?` · приз ${money(pr)}`:''}${ev.sea?' · гидроаэропланы':''}</p></div>
    <button class="btn sm ${st==='open'?'primary':''}" data-act="airEv" data-k="${ev.key}">${st==='open'?'Участвовать':'Подробнее'}</button></div></div>`;};
  const done=Object.entries(A.ev||{}).filter(([,r])=>!r.miss).slice(-6).reverse().map(([k,r])=>{const ev=AIR_EV.find(e=>e.key===k);return `<li class="${r.place===1?'good':''}"><time>${r.y}</time><p>${esc(ev?ev.name:k)}: ${r.place===1?'победа':r.place?r.place+'-е место':'неудача'} — ${esc(r.who)}, ${esc(r.txt)}</p></li>`;}).join('');
  const recs=Object.keys(AIR_REC_N).map(k=>{const c=airRecCur(s,k),can=airRecCan(s,k);return `<div class="race-item"><div class="row"><div><h3>${AIR_REC_N[k][0]}</h3><p class="small muted">${fmtN(Math.round(c.v))} ${AIR_REC_N[k][1]} — ${esc(c.who)}${c.mine?' <span class="good">(ваш)</span>':''}</p></div><button class="btn sm" data-act="airRec" data-k="${k}" ${can?'':'disabled'}>Попытка</button></div></div>`;}).join('');
  const pil=airPilotList(s).map(p=>`<div class="row" style="margin-top:6px"><p class="small">${esc(p.hero?p.n+' — основатель':p.n)} · мастерство ${Math.round(p.sk*100)}${p.sal?` · ${money(p.sal)} в мес.`:''}</p>${p.sal?`<button class="linkbtn" data-act="airFire" data-k="${p.id}">уволить</button>`:''}</div>`).join('');
  const hire=airPilotsForHire(s).slice(0,6).map(P=>`<div class="row" style="margin-top:6px"><p class="small">${esc(P.n)} · мастерство ${Math.round(P.sk*100)} · ${money(airPilotSal(s,P)*(P.c===s.country?1:1.3))} в мес.</p><button class="btn sm" data-act="airHire" data-k="${P.id}" ${(A.pil||[]).length>=4?'disabled':''}>Нанять</button></div>`).join('');
  const war=airWarOn(s.country,t);
  return `${war&&typeof airFrontHTML==='function'?airFrontHTML(s):''}
    <section class="card"><h2>Состязания и перелёты</h2>${L.length?L.map(evRow).join(''):`<p class="small muted" style="margin-top:6px">${war?'Война: авиамитинги отменены, лётчики — на фронте.':'Ближайших состязаний нет.'}</p>`}</section>
    <section class="card"><h2>Мировые рекорды</h2><p class="small muted" style="margin-top:4px">Рекорды засчитывает Международная авиационная федерация (FAI, 1905). Каждый рекорд — слава марки и заказы.</p>${recs}</section>
    <section class="card"><h2>Лётчики</h2>${pil}${hire?`<div class="label" style="margin-top:12px">Можно нанять</div>${hire}`:''}</section>
    ${done?foldCard('airDone',false,'<h2>Итоги</h2>',`<ul class="log" style="margin-top:6px">${done}</ul>`,`побед: ${A.wins||0} · призов: ${money(A.prizes||0)}`):''}`;}
function airSkyCard(s){if(s.mode==='racer'||!airOn(s))return '';return `<section class="card"><h2>✈ Небо</h2><p class="small muted" style="margin-top:4px">Авиамитинги, перелёты, рекорды и лётчики авиацеха.</p></section>${airSkyHTML(s)}`;}
function airSkyView(s){return `<section class="card"><h2>Небо</h2><p class="small muted" style="margin-top:4px">${airWarOn(s.country,tNow(s))?'Война: состязаний нет, зато фронт ждёт ваши аэропланы.':'Авиамитинги собирают сотни тысяч зрителей. Приз — деньги, победа — заказы.'}</p></section>${airSkyHTML(s)}`;}
