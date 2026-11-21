/* ================= 0.51, этап 4в: СВОЙ АВИАМОТОР И СВОИ УЗЛЫ ИЗ ОПЫТА =================
   Замечания автора (21 ноября): «почему я не могу производить двигатели для самолётов? Если я автомарка — у нас есть
   экспертиза»; «сейчас у нас только исторические узлы, закрафтить что-то своё уникальное невозможно, только улучшать»;
   опыт авиации — чтобы потом создавать узлы, которых не было в истории.
   • Опыт по шести областям копится делом: выпуск машин, мотоциклов, аэропланов и авиамоторов, гонки, рекорды, работы КБ.
   • «Своя разработка» в КБ: основа — свой лучший узел, один-два приёма из накопленного опыта, цель (легче, сильнее, надёжнее,
     дешевле). Получается узел, которого нет в каталоге; ему считается «год по истории» — когда лучшие исторические узлы дошли
     до таких же черт. Опережение стоит по общему правилу 0.51 (×1,6 цены и ×1,4 срока за год, +15 % в серии за год до срока),
     дальше десяти лет вперёд — предел эпохи.
   • Свой авиамотор — из своего лучшего автомобильного мотора: стоит в конструкторе аэроплана без наценки поставщика,
     продаётся другим авиазаводам страны, в войну министерство может заказать выпуск чужого мотора по лицензии.
   • Свои узлы игрока не лежат в каталогах (01-data.js: OWN_MAP) — мир без игрока, соперники и гонки их не видят. Фирма-соперник
     перенимает свой узел игрока вместе с машиной (модель-ответ, 17c-firms.js); патент даёт иск или лицензию.
   Исследование с источниками — claude/issledovanie-svoi-uzly-0.51.md. */
const XP_AREA={eng:{n:'Моторы',ic:'⚙️'},alloy:{n:'Лёгкие сплавы',ic:'🪶'},aero:{n:'Аэродинамика',ic:'💨'},brake:{n:'Тормоза и шины',ic:'🛞'},susp:{n:'Подвеска и рама',ic:'🔩'},mass:{n:'Массовое производство',ic:'🏭'}};
const XP_KEYS=Object.keys(XP_AREA);
const OWN_CAT={e:{n:'Мотор',arr:()=>ENGINES},g:{n:'Коробка передач',arr:()=>GEARBOX},c:{n:'Рама и подвеска',arr:()=>CHASSIS},w:{n:'Колёса и шины',arr:()=>TYRES},k:{n:'Тормоза',arr:()=>BRAKES},b:{n:'Кузов',arr:()=>BODIES}};
// главные черты узла — по ним считается «год по истории» и сравнение с лучшим историческим узлом года
const OWN_MEAS={e:[['л.с. на кг',x=>x.hp/x.kg,2],['надёжность',x=>x.rel,2]],g:[['КПД',x=>x.eff,3],['лёгкость',x=>x.ease,2]],c:[['л.с. на кг рамы',x=>x.max/x.kg,2],['мягкость хода',x=>x.ride,2]],
  w:[['сцепление',x=>x.grip,2],['ресурс, км',x=>x.life,0]],k:[['сила',x=>x.brk,2],['лёгкость педали',x=>x.ease,2]],b:[['обтекаемость',x=>1/x.cd,2],['лёгкость',x=>100/x.kg,2]]};
/* Приёмы — переносы опыта между областями. a — область опыта и xp — сколько его нужно; eff — множители черт; yh — год, когда так
   сделали в серийном автомобиле (для статьи; «год по истории» узла считается по чертам). Годы сверены — см. исследование. */
const OWN_TECH=[
  {id:'alu',n:'Алюминиевый блок со стальными гильзами',cat:['e'],a:'alloy',xp:25,eff:{kg:0.78,c:1.22,hp:1.03},d:'легче на пятую часть, дороже на 22 %',h:'Из авиации: так Марк Биркигт построил авиамотор Hispano-Suiza 8 (1915), а в 1919 году — мотор автомобиля H6.',yh:1919},
  {id:'ohc',n:'Верхний распредвал',cat:['e'],a:'eng',xp:30,eff:{hp:1.16,rel:0.985,c:1.12,cx:1.05},d:'мощность +16 %, дороже на 12 %, чуть капризнее',h:'Из гонок и авиации: Peugeot Гран-при (1912), авиамотор Rolls-Royce Eagle (1915), серийный Hispano-Suiza H6 (1919).',yh:1919},
  {id:'sc',n:'Нагнетатель',cat:['e'],a:'eng',xp:45,eff:{hp:1.35,fuel:1.25,rel:0.94,c:1.35,kg:1.06,cx:1.1},d:'мощность +35 %, расход +25 %, надёжность ниже, дороже на треть',h:'Из авиации: нагнетатель возвращал мотору мощность на высоте. Первые серийные автомобили с нагнетателем — Mercedes 6/25 и 10/40 (Берлин, 1921).',yh:1921},
  {id:'mass',n:'Мотор большой серии',cat:['e'],a:'mass',xp:30,eff:{c:0.78,hp:0.97,rel:1.01},d:'дешевле на 22 %, чуть слабее',h:'Из своего потока: блок одной отливкой и одна оснастка на сотни тысяч моторов — как у Ford T (1908).',yh:1908},
  {id:'gear',n:'Шлифованные шестерни',cat:['g'],a:'eng',xp:35,eff:{eff:1.015,relK:1.01,c:1.2},d:'потерь в передаче меньше, дороже на пятую часть',h:'Из авиации: редуктор винта авиамотора (Rolls-Royce Eagle, 1915) требовал точных шестерён.'},
  {id:'tube',n:'Рама из сварных стальных труб',cat:['c'],a:'alloy',xp:20,eff:{kg:0.82,c:1.25,max:0.95,cx:1.1},d:'легче на 18 %, дороже на четверть, держит чуть меньше',h:'Из авиации: сварной фюзеляж из стальных труб — Фоккер и Платц (1914).'},
  {id:'dural',n:'Дюралевые детали',cat:['c','b'],a:'alloy',xp:40,eff:{kg:0.85,c:1.3},d:'легче на 15 %, дороже на 30 %',h:'Из авиации: дюраль (1909) — металл цеппелинов и цельнометаллических «Юнкерсов» (1916–1919).'},
  {id:'ifs',n:'Независимая передняя подвеска',cat:['c'],a:'susp',xp:30,eff:{ride:1.14,c:1.25,cx:1.1},d:'ход мягче на 14 %, дороже на четверть',h:'С плохих дорог и из гонок: Lancia Lambda (1922).',yh:1922},
  {id:'unit',n:'Несущий кузов',cat:['b'],a:'aero',xp:25,eff:{kg:0.82,c:1.15,cx:1.15,cd:0.97},d:'легче на 18 %, дороже на 15 %',h:'Из авиации: фюзеляж-монокок гоночного «Депердюссена» (1912). В автомобиле — Lancia Lambda (1922).',yh:1922},
  {id:'stream',n:'Обтекаемый кузов',cat:['b'],a:'aero',xp:35,eff:{cd:0.72,c:1.2,comf:0.97,cx:1.1},d:'сопротивление воздуха −28 %, дороже на пятую часть, в салоне теснее',h:'Из авиации: «каплю» авиаконструктора Румплера (Берлин, 1921) продували в аэродинамической трубе.',yh:1921},
  {id:'fwb',n:'Тормоза на всех колёсах',cat:['k'],a:'brake',xp:15,eff:{brk:1.25,c:1.5,kg:1.5,ease:0.95},d:'тормозит на четверть сильнее, в полтора раза дороже и тяжелее',h:'Из гонок: Isotta Fraschini (1910), Argyll (1912), Гран-при Франции 1914 года.',yh:1910},
  {id:'hyd',n:'Гидравлический привод тормозов',cat:['k'],a:'brake',xp:35,eff:{brk:1.12,ease:1.35,c:1.25},d:'педаль легче на треть, тормозит сильнее на 12 %, дороже на четверть',h:'Из гонок: Duesenberg выиграл Гран-при Франции 1921 года на гидравлических тормозах и поставил их на серийную машину.',yh:1921},
  {id:'cord',n:'Корд вместо ткани',cat:['w'],a:'brake',xp:20,eff:{life:1.5,punct:0.6,grip:1.04,wear:0.85},d:'шина живёт в полтора раза дольше, проколов меньше',h:'Из долгих гонок: кордовые шины десятых годов.',yh:1912},
  {id:'balloon',n:'Шины низкого давления',cat:['w'],a:'brake',xp:40,eff:{grip:1.07,ride:1.15,life:1.2,punct:0.8},d:'мягче ход, лучше сцепление, дольше ресурс',h:'Баллонные шины Firestone (1923).',yh:1923}];
// цель: шаг первый, второй и третий дают 1 : 0,7 : 0,5 (убывающая полезность)
const OWN_GS=[0,1,1.7,2.2];
const OWN_GOAL={light:{n:'Легче',eff:{e:{kg:-0.08,c:0.05},g:{kg:-0.08,c:0.05},c:{kg:-0.07,c:0.06},w:{kg:-0.06,c:0.05},k:{kg:-0.08,c:0.05},b:{kg:-0.07,c:0.06}}},
  power:{n:'Сильнее',eff:{e:{hp:0.08,fuel:0.05,rel:-0.008,c:0.04},g:{eff:0.007,c:0.06},c:{max:0.12,kg:0.03,c:0.05},w:{grip:0.03,c:0.05},k:{brk:0.06,c:0.06},b:{comf:0.04,kg:0.03,c:0.05}}},
  rel:{n:'Надёжнее',eff:{e:{rel:0.02,kg:0.03,c:0.05},g:{relK:0.006,c:0.05},c:{max:0.06,ride:0.02,c:0.04},w:{life:0.25,punct:-0.15,c:0.05},k:{ease:0.06,c:0.04},b:{comf:0.02,c:0.03}}},
  cheap:{n:'Дешевле',eff:{e:{c:-0.1},g:{c:-0.1},c:{c:-0.1},w:{c:-0.1},k:{c:-0.1},b:{c:-0.1}}}};
const OWN_LIMIT=10;   // лет вперёд истории — дальше материалы эпохи не пускают
const OWN_CAP={rel:0.97,eff:0.96,brk:0.98,ease:0.98,relK:1.03,grip:1.3};
function ownGoalName(g,k){return g==='power'&&k==='e'?'Мощнее':OWN_GOAL[g].n;}
/* ---------- реестр: свои узлы партии — в OWN_MAP, чтобы их находил byId ---------- */
let OWN_FOR=null;
function ownSync(s){for(const k in OWN_MAP){delete OWN_MAP[k];delete OWN_ARR[k];}if(!s)return;s.custom=s.custom||[];s.aeng=s.aeng||[];s.xp=s.xp||{};OWN_FOR=s.custom;
  s.custom.forEach(x=>{if(OWN_CAT[x.k]){OWN_MAP[x.id]=x;OWN_ARR[x.id]=OWN_CAT[x.k].arr();}});s.aeng.forEach(x=>{OWN_MAP[x.id]=x;OWN_ARR[x.id]=AIR_ENG;});}
function ownEnsure(s){if(s&&s.rd&&OWN_FOR!==(s.custom||null))ownSync(s);}
function ownParts(s,k){return (s.custom||[]).filter(x=>!k||x.k===k);}
/* ---------- опыт ---------- */
function xpOf(s,k){return (s&&s.xp&&s.xp[k])||0;}
function xpAdd(s,k,v){if(!(v>0)||!s)return;s.xp=s.xp||{};const x=s.xp[k]||0;s.xp[k]=Math.min(100,x+v/(1+x/35));}   // чем больше знаешь, тем дороже следующее
function xpMonth(s,r){const lg=v=>Math.log2(1+Math.max(0,v)),cars=r.made||0,mo=r.mmade||0,air=(r.air&&r.air.made)||0,ae=((r.ae&&r.ae.n)||0)+((r.ae&&r.ae.licN)||0);
  const trucks=(s.models||[]).reduce((a,m)=>a+(m.status==='prod'&&!isMoto(m)&&isTruck(m)?(m.lastMade||0):0),0);
  xpAdd(s,'eng',0.05*lg(cars/20)+0.04*lg(mo/20)+0.5*lg(ae)+0.12*lg(air));
  xpAdd(s,'mass',0.07*lg((cars+mo)/100)+(techLv(s,'line')===2?0.1:0)+0.15*lg(ae/5));
  xpAdd(s,'alloy',0.45*lg(air)+0.4*lg(ae)+(s.tech&&s.tech.foundry?0.05:0));
  xpAdd(s,'aero',0.5*lg(air));
  xpAdd(s,'susp',0.04*lg(cars/20)+0.05*lg(trucks/10));
  xpAdd(s,'brake',0.03*lg(cars/20)+0.03*lg(mo/20));
  // гонки месяца: тормоза, шины, подвеска и мотор на пределе; победа учит больше
  try{RACES.forEach(rc=>{if(rc.y!==s.y||rc.m!==s.m)return;const p=s.raceDone&&s.raceDone[rc.key];if(p===undefined)return;const k=p===1?1.5:1;xpAdd(s,'brake',0.7*k);xpAdd(s,'susp',0.5*k);xpAdd(s,'eng',0.5*k);xpAdd(s,'aero',0.2*k);});}catch(_){}
  // опытные работы и рекорды авиацеха
  if(s.air){const nt=Object.keys(s.air.tech||{}).length,nr=Object.keys(s.air.rec||{}).length,X=s.xpA=s.xpA||{t:nt,r:nr};
    if(nt>X.t){xpAdd(s,'aero',3*(nt-X.t));xpAdd(s,'alloy',2*(nt-X.t));}if(nr>X.r){xpAdd(s,'aero',2*(nr-X.r));xpAdd(s,'eng',1*(nr-X.r));}X.t=nt;X.r=nr;}}
const XP_CAT={e:'eng',g:'eng',c:'susp',w:'brake',k:'brake',b:'aero'};
function xpUpg(s,pj){const a=XP_CAT[pj.ck];if(a)xpAdd(s,a,pj.ck==='e'||pj.ck==='k'||pj.ck==='c'?1.5:0.8);}
function xpTechOk(s,t){return xpOf(s,t.a)>=t.xp;}
/* ---------- свой узел: расчёт ---------- */
// свои узлы категории, от которых можно оттолкнуться: стоят на ваших машинах, улучшены в КБ или уже свои
function ownBaseList(s,k,moto){const cat=OWN_CAT[k];if(!cat)return [];const used=new Set();(s.models||[]).forEach(m=>{if(m.status!=='off')used.add(m[k]);});
  const U=unlockedP(cat.arr(),s,moto),L=U.filter(x=>used.has(x.id)||upgL(x.id)>0||x.own);return (L.length?L:U).slice().sort((a,b)=>(b.q||0)-(a.q||0));}
function ownPeers(k,x){return OWN_CAT[k].arr().filter(z=>!!z.moto===!!x.moto&&!z.solid&&(k!=='b'||(!!z.truck===!!x.truck&&!!z.closed===!!x.closed)));}
// «год по истории»: когда лучшие узлы каталога дошли до таких же черт (дальше каталога — темпом последних пятнадцати лет)
function ownHistYear(k,x){const P=ownPeers(k,x);let Y=1885;
  OWN_MEAS[k].forEach(([n,f])=>{const v=f(x),L=P.map(z=>({y:z.y||1895,v:f(z)})).filter(o=>isFinite(o.v)).sort((a,b)=>a.y-b.y);if(!L.length||!isFinite(v))return;
    let best=-1e9,yr=null;const last=L[L.length-1].y;for(const o of L){best=Math.max(best,o.v);if(best>=v*0.995){yr=o.y;break;}}
    if(yr==null){const f0=L.filter(o=>o.y<=last-15).reduce((a,o)=>Math.max(a,o.v),-1e9),g=f0>0&&best>f0?clamp(Math.pow(best/f0,1/15)-1,0.008,0.06):0.02;yr=last+Math.ceil(Math.log(v/best)/Math.log(1+g));}
    Y=Math.max(Y,yr);});return Y;}
function ownBest(s,k,x){const f=OWN_MEAS[k][0][1];return ownPeers(k,x).filter(z=>(z.y||1895)<=s.y).reduce((a,z)=>!a||f(z)>f(a)?z:a,null);}
// узел по заданию: основа × приёмы (второй — на 60 %) × цель; цена основы — с её нынешней скидкой за годы у поставщиков
function ownBuild(s,sp){const cat=OWN_CAT[sp.k],x0=cat&&byId(cat.arr(),sp.base);if(!x0)return null;const x={...x0};['note','wiki','own','yh','base','tech','goal','gl','art','pat','ser','cp','made'].forEach(f=>delete x[f]);
  const lk=y=>Math.max(0.5,1-0.025*Math.max(0,yf(s)-Math.max(1895,y)));x.c=x0.c*lk(x0.y);
  (sp.tech||[]).map(id=>OWN_TECH.find(t=>t.id===id)).filter(t=>t&&t.cat.includes(sp.k)).forEach((t,i)=>{const w=i===0?1:0.6;for(const f in t.eff)if(x[f]!=null)x[f]*=1+(t.eff[f]-1)*w;});
  const G1=OWN_GOAL[sp.goal],E=G1&&G1.eff[sp.k],S=OWN_GS[clamp(sp.gl||1,1,3)];if(E)for(const f in E)if(x[f]!=null)x[f]*=1+E[f]*S;
  for(const f in OWN_CAP)if(x[f]!=null)x[f]=Math.min(Math.max(OWN_CAP[f],x0[f]),x[f]);if(x.punct!=null)x.punct=Math.max(0.08,x.punct);
  // оценка «качества» для сроков КБ и разработки — по главным чертам
  const gain=OWN_MEAS[sp.k].reduce((a,[n,f])=>a*Math.pow(Math.max(0.2,f(x)/Math.max(1e-9,f(x0))),0.5),1);x.q=Math.max(1,Math.round((x0.q||10)*gain));
  ['hp','kg','life'].forEach(f=>{if(x[f]!=null)x[f]=Math.round(x[f]*(f==='hp'&&x[f]<20?10:1))/(f==='hp'&&x[f]<20?10:1);});x.c=Math.round(x.c);
  ['rel','eff','ease','ride','grip','brk','relK','punct','wear','cd','comf','fuel','cx','max'].forEach(f=>{if(x[f]!=null)x[f]=+x[f].toFixed(3);});
  const hist=ownHistYear(sp.k,x);x.own=1;x.k=sp.k;x.yh=hist;x.y=Math.max(s.y,hist);x.base=x0.id;x.tech=(sp.tech||[]).slice();x.goal=sp.goal;x.gl=sp.gl||1;return x;}
function ownNeed(sp,x0,yrs){return Math.max(4,Math.round((8+(x0.q||10)/8)*(1+0.45*(sp.tech||[]).length+0.2*OWN_GS[clamp(sp.gl||1,1,3)])*aheadTimeK(yrs)));}
// цена проекта — как у прототипа КБ: опыты и образцы, цена самого узла ×3, каждый год опережения ×1,6; планка от оборота
function ownRdCost(pj,s){s=s||G;const yrs=pj.yrs||0,era=Math.min(1,0.25+0.05*Math.max(0,yf(s)-1895));
  const base=Math.max(50,Math.round(((80+25*(pj.need0||pj.need||10))*cpi(s)*(1+0.03*T(s))*bn('rdCost')+(pj.pc||250*cpi(s))*3*aheadCostK(yrs))*era/50)*50);
  return Math.max(base,Math.round(bizRev(s)*AHEAD_REV*aheadCostK(yrs)/50)*50);}   // планка — тысячная годового оборота: своя разработка большой фирмы не бывает «за копейки»
// что получится: узел, год по истории, цена, срок, риск, сравнение с лучшим историческим узлом года и почему нельзя (если нельзя)
function ownPreview(s,sp){const x=ownBuild(s,sp);if(!x)return null;const x0=byId(OWN_CAT[sp.k].arr(),sp.base),yrs=Math.max(0,x.yh-s.y),need=ownNeed(sp,x0,yrs),best=ownBest(s,sp.k,x)||x0;
  const pj={kind:'own',id:'own',ck:sp.k,cat:OWN_CAT[sp.k].n,name:sp.name||'',need,yrs,pc:partCost(x,s),moto:!!x.moto,sp:{k:sp.k,base:sp.base,tech:(sp.tech||[]).slice(),goal:sp.goal,gl:sp.gl||1,name:sp.name||''}};
  const cost=ownRdCost(pj,s),T2=(sp.tech||[]).map(id=>OWN_TECH.find(t=>t.id===id)).filter(Boolean);let why='';
  if(!OWN_GOAL[sp.goal])why='Выберите цель';else if(T2.some(t=>!xpTechOk(s,t))){const t=T2.find(t=>!xpTechOk(s,t));why=`Мало опыта: «${XP_AREA[t.a].n}» ${Math.floor(xpOf(s,t.a))} из ${t.xp}`;}
  else if(yrs>OWN_LIMIT)why=`Предел эпохи: такой узел история освоит только в ${x.yh} году — материалы и станки ${s.y} года этого не дадут`;
  else if(rdActive(s).length>=rdSlots(s))why='В КБ нет свободного места для проекта';else if(s.cash<cost)why='Не хватает денег';
  const cmp=OWN_MEAS[sp.k].map(([n,f,d])=>({n,d,mine:f(x),base:f(x0),best:f(best)}));
  return {x,x0,best,yrs,need,cost,pj,why,cmp,months:Math.max(1,Math.ceil(need/Math.max(0.01,rdTotal(s)/(rdActive(s).length+1)))),rework:protoRisk({kind:'own',yrs}),risk:partRisk(x,s.y)};}
function ownNextName(s,k){const n=ownParts(s,k).length+1,w={e:'мотор',g:'коробка',c:'рама',w:'шины',k:'тормоза',b:'кузов'}[k];return `${s.company}: ${w} №${n}`.slice(0,40);}
function ownStart(s,sp){const P=ownPreview(s,sp);if(!P||P.why)return false;P.pj.name=(sp.name||'').trim()||ownNextName(s,sp.k);P.pj.sp.name=P.pj.name;s.ownN=(s.ownN||0)+1;P.pj.id='own'+s.ownN;return rdBegin(s,P.pj);}
// статья «Зачем и откуда»
function ownArticle(s,x){const x0=byId(OWN_CAT[x.k].arr(),x.base),T2=(x.tech||[]).map(id=>OWN_TECH.find(t=>t.id===id)).filter(Boolean),yrs=x.yh-(x.made?x.made.y:s.y);
  return `Основа — ${x0?x0.name:'свой узел'}. `+(T2.length?`Приёмы: ${T2.map(t=>t.n.toLowerCase()).join(' и ')}. ${T2.map(t=>t.h).join(' ')} `:'')+`Цель — ${ownGoalName(x.goal,x.k).toLowerCase()}. `
    +(x.yh>1930?`В истории до 1930 года такого узла не было: по чертам он соответствует ${x.yh} году.`:yrs>0?`По чертам это ${x.yh} год: история пришла к такому узлу на ${yrs} ${plural(yrs,'год','года','лет')} позже.`:`По чертам это ${x.yh} год: в истории такие узлы уже делали — но этот ваш, и доводить его вам.`);}
function ownDone(s,pj){const x=ownBuild(s,pj.sp);if(!x){addLog(`КБ не смогло закончить «${pj.name}»: основы больше нет.`,'bad');return;}s.custom=s.custom||[];s.ownId=(s.ownId||0)+1;x.id='x'+x.k+s.ownId;x.name=pj.name;x.made={y:s.y,m:s.m};
  x.note=`Своя разработка ${s.y} года.`;x.art=ownArticle(s,x);s.custom.push(x);ownSync(s);s.rd.upg[x.id]=Math.floor(upgL(x.base)/2);xpAdd(s,XP_CAT[x.k],3);
  const yrs=Math.max(0,x.yh-s.y),pc=ownPatCost(s);addLog(`КБ закончило свою разработку: ${x.name}${yrs>0?` — на ${yrs} ${plural(yrs,'год','года','лет')} раньше истории`:''}.`,'good');pendingToasts.push('🧪 Свой узел: '+x.name);
  if(yrs>0)try{recordFirst(s,'own_'+x.id,x.name,x.yh,'отрасль пришла к такому узлу',null,{noArt:1});}catch(_){}
  pushEvent({own:1,noArt:1,kicker:'КБ · своя разработка',title:`«${s.company}»: ${x.name}`,deck:yrs>0?`На ${yrs} ${plural(yrs,'год','года','лет')} раньше истории`:'Узел, которого нет у поставщиков',
    text:`${x.art}\nПоставьте узел на новую модель: в конструкторе он стоит рядом с покупными. ${yrs>0?`Пока история до него не дошла, он дороже в серии и может выйти не таким, как задумано. `:''}Соперники разберут вашу машину и через год-два сделают похожий — патент даст право на иск или на лицензию.`,
    choices:[[`Запатентовать · ${money(pc)}`,'own:pat:'+x.id],['Без патента','ok']]},true);}
/* ---------- патент, копии соперников, иск и лицензия ---------- */
const OWN_PAT_Y=15;
function ownPatCost(s){return Math.round(1500*cpi(s)/100)*100;}
function ownGet(s,id){return (s.custom||[]).find(x=>x.id===id)||(s.aeng||[]).find(x=>x.id===id)||null;}
function ownPatent(s,id){const x=ownGet(s,id),c=ownPatCost(s);if(!x||x.pat||s.cash<c)return false;s.cash-=c;x.pat={until:mi(s)+OWN_PAT_Y*12};addLog(`Патент на «${x.name}» получен (${money(c)}), действует ${OWN_PAT_Y} лет.`,'good');return true;}
function ownPatOn(s,x){return !!(x&&x.pat&&x.pat.until>mi(s));}
// узел пошёл в серию — с этого месяца его могут разобрать соперники
function ownSeries(s){const t=mi(s);(s.custom||[]).forEach(x=>{if(x.ser==null&&(s.models||[]).some(m=>m.status==='prod'&&m[x.k]===x.id))x.ser=t;});}
/* Фирма-соперник выпустила модель-ответ игроку (17c-firms.js: firmDone): вместе с машиной она перенимает и один его свой узел,
   если тот в серии больше года. Без патента — заметка; с патентом — выбор: иск, лицензия или промолчать. */
function ownCopied(s,r,F,g){const t=mi(s),key=F.c+':'+F.i,nm=firmName(s,F);
  const L=(s.models||[]).filter(m=>m.status==='prod'&&!isMoto(m)&&segOf(m)===g).sort((a,b)=>(b.lastSold||0)-(a.lastSold||0));let x=null;
  for(const m of L){x=(s.custom||[]).find(z=>m[z.k]===z.id&&z.ser!=null&&t-z.ser>=12&&!(z.cp&&z.cp[key]));if(x)break;}if(!x)return null;
  x.cp=x.cp||{};x.cp[key]=t;const M=F.md&&F.md[g];if(M)M.q=clamp((M.q||0)+0.04,0.05,1.25);
  if(!ownPatOn(s,x)){addLog(`${nm} переняла ваш узел «${x.name}»: патента нет — возразить нечем.`,'bad');return x;}
  const fee=ownLicFee(s,F),law=ownSuitCost(s);
  pushEvent({own:1,noArt:1,kicker:'Патенты и суды',title:`${nm} скопировала «${x.name}»`,deck:'Ваш патент нарушен',
    text:`В новой модели ${nm} — узел, повторяющий ваш «${x.name}». Патент действует до ${1895+Math.floor(x.pat.until/12)} года.\nИск — это юристы на год (${money(law)} в месяц) и суд: шансы тем выше, чем дальше ваш узел от того, что уже делает отрасль. Лицензия — ${money(fee)} в месяц пять лет без суда.`,
    choices:[[`Продать лицензию · ${money(fee)}/мес.`,`own:lic:${x.id}:${key}`],[`Подать иск · ${money(law)}/мес.`,`own:sue:${x.id}:${key}`],['Не замечать','ok']]},true);return x;}
function ownLicFee(s,F){return Math.max(100,Math.round((F.r12||0)/12*0.012/50)*50);}
function ownSuitCost(s){return Math.round(400*cpi(s)/50)*50;}
function ownResolve(s,key){const a=key.split(':');if(a[1]==='pat'){if(!ownPatent(s,a[2]))toast('Не хватает денег на патент');return;}
  const x=ownGet(s,a[2]),fk=a[3]+':'+a[4],F=s.firms&&s.firms[fk];if(!x||!F)return;s.legal=s.legal||{};const O=s.legal.own=s.legal.own||[],t=mi(s),nm=firmName(s,F);
  if(a[1]==='lic'){const amt=ownLicFee(s,F);O.push({k:'lic',id:x.id,f:fk,amt,until:t+60});addLog(`${nm} купила лицензию на «${x.name}»: ${money(amt)} в месяц, пять лет.`,'good');}
  if(a[1]==='sue'){const ahead=Math.max(0,x.yh-yf(s)),p=clamp(0.4+0.08*ahead,0.4,0.85);O.push({k:'suit',id:x.id,f:fk,amt:ownSuitCost(s),until:t+12,p});F.gr=Math.min(1,(F.gr||0)+0.4);F.grWhy=`иск за «${x.name}», ${s.y}`;addLog(`Иск к ${nm} за «${x.name}» подан: суд через год.`);}}
// 0.51, этап 5б: продать лицензию по своей воле — крупнейшей фирме своей страны, у которой её ещё нет и которая не в обиде.
// Деньги — пять лет, но её машины станут лучше: это ход против себя ради кассы (ход соперника — ownCopied).
function ownLicBuyer(s,x){if(!s.firms||!firmsOn(s)||!x||x.k==='ae')return null;const t=mi(s),O=(s.legal&&s.legal.own)||[];let B=null;
  (COMPS[s.country]||[]).forEach((cp,i)=>{const F=firmGet(s,s.country,i);if(!F||F.st!=='ok'||!(F.h12>0)||F.gr>0.2||acqHas(s,s.country,i))return;const key=s.country+':'+i;if(O.some(o=>o.id===x.id&&o.f===key&&o.until>t))return;if(!B||(F.r12||0)>(B.F.r12||0))B={F,key,i};});return B;}
function ownLicSell(s,id){const x=ownGet(s,id);if(!x||!ownPatOn(s,x)||x.ser==null)return false;const B=ownLicBuyer(s,x);if(!B)return false;const F=B.F,t=mi(s),amt=ownLicFee(s,F),nm=firmName(s,F),cp=firmCp(F),g=firmSegs(cp).sort((a,b)=>cp.mix[b]-cp.mix[a])[0];
  s.legal=s.legal||{};(s.legal.own=s.legal.own||[]).push({k:'lic',id:x.id,f:B.key,amt,until:t+60});x.cp=x.cp||{};x.cp[B.key]=t;
  const M=F.md&&F.md[g];if(M&&t<M.till)M.q=clamp((M.q||0)+0.06,0.05,1.25);else F.md[g]={q:0.08,from:t,till:t+60,name:'',lic:1};
  addLog(`${nm} купила лицензию на «${x.name}»: ${money(amt)} в месяц, пять лет. Её машины ${SEG_LOC[g]||''} станут лучше.`,'good');return true;}
function ownLegalMonth(s,r){const O=s.legal&&s.legal.own;if(!O||!O.length)return;const t=mi(s);let inc=0,out=0;
  s.legal.own=O.filter(o=>{if(o.k==='lic'){if(o.until<=t)return false;inc+=o.amt;return true;}
    if(o.k==='suit'){if(o.until>t){out+=o.amt;return true;}const F=s.firms&&s.firms[o.f],x=ownGet(s,o.id),nm=F?firmName(s,F):'соперник',g=F&&F.md?Object.keys(F.md)[0]:null;
      if(Math.random()<o.p){const dmg=Math.round(Math.max(2000*cpi(s),(F&&F.r12||0)*0.03)/100)*100;s.cash+=dmg;if(F){F.cash=(F.cash||0)-dmg;if(g&&F.md[g])F.md[g].q=Math.max(0.05,F.md[g].q*0.6);}
        addLog(`Суд за «${x?x.name:'узел'}» выигран: ${nm} платит ${money(dmg)} и снимает копию с новой модели.`,'good');pendingToasts.push('⚖️ Суд выигран');}
      else{addLog(`Суд за «${x?x.name:'узел'}» проигран: судья счёл, что ${nm} пришла к узлу сама.`,'bad');pendingToasts.push('⚖️ Суд проигран');}return false;}return false;});
  r.licIn=(r.licIn||0)+Math.round(inc);r.legal=(r.legal||0)+Math.round(out);}
/* ---------- свой авиамотор ---------- */
// тип — по году и опыту: k — во сколько раз авиамотор мощнее автомобильной основы, w — вес против лучших моторов года
const AE_TYPE={inline:{n:'Рядный, водяного охлаждения',y:1908,k:2.2,cool:'w',w:1.12,xp:0,h:'Так начинали Austro-Daimler (1910) и Mercedes: рядная «шестёрка», надёжная, как автомобильный мотор.'},
  v:{n:'V-образный, водяного охлаждения',y:1913,k:4,cool:'w',w:1,xp:25,h:'Так Rolls-Royce сделал Eagle (1915) из мотора Silver Ghost, удвоив число цилиндров, а Hispano-Suiza — свою «восьмёрку».'},
  radial:{n:'Звезда воздушного охлаждения',y:1922,k:3.4,cool:'a',w:0.92,xp:45,h:'Двадцатые годы: Bristol Jupiter и Wright Whirlwind — без воды и радиатора.'}};
// авиамотор — не узел: проект стоит как десяток опытных моторов и вдвое дольше; торговля моторами держит испытательную станцию
const AE_PC=3.3,AE_NEED=24,AE_FIX=600;
const AE_GOAL={light:{n:'Легче',kg:-0.07,c:0.05},power:{n:'Мощнее',hp:0.08,sfc:0.03,rel:-0.01},rel:{n:'Надёжнее',rel:0.03,kg:0.03},cheap:{n:'Дешевле',c:-0.12}};
function aeCan(s){return !!(s&&s.rd&&(lineOn(s,'car')||lineOn(s,'moto'))&&tNow(s)>=1907);}
function aeTypeOk(s,k){const T1=AE_TYPE[k];return tNow(s)>=T1.y||xpOf(s,'eng')>=T1.xp+20;}
// основа — свой самый сильный мотор (со звёздами КБ)
function aeBase(s){const used=new Set();(s.models||[]).forEach(m=>{if(m.status!=='off')used.add(m.e);});const hp=x=>x.hp*(1+0.08*Math.min(5,upgL(x.id)));
  const car=unlockedP(ENGINES,s,false),mo=unlockedP(ENGINES,s,true),pick=L=>{const U=L.filter(x=>used.has(x.id)||upgL(x.id)>0||x.own);return (U.length?U:[]).slice().sort((a,b)=>hp(b)-hp(a))[0]||null;};
  return pick(car)||pick(mo)||car.slice().sort((a,b)=>hp(b)-hp(a))[0]||null;}
function aePeers(t){return AIR_ENG.filter(e=>!e.own&&e.y<=t&&!e.race);}
function aeBuild(s,sp){const T1=AE_TYPE[sp.type],b=aeBase(s);if(!T1||!b)return null;const t=tNow(s),up=Math.min(5,upgL(b.id)),sE=clamp(xpOf(s,'eng')/60,0,1),sA=clamp((xpOf(s,'alloy')*0.6+xpOf(s,'eng')*0.4)/50,0,1),sM=clamp(xpOf(s,'mass')/50,0,1);
  let hp=b.hp*(1+0.08*up)*T1.k*(b.moto?0.6:1)*(1+0.15*sE);const P=aePeers(t),band=P.filter(e=>e.hp>=hp*0.4&&e.hp<=hp*2.5),B=band.length?band:P,same=B.filter(e=>(e.cool==='w')===(T1.cool==='w'));
  const Q=same.length?same:B,sw=Q.reduce((a,e)=>Math.min(a,e.kg/e.hp),9)||2,sfc=Q.reduce((a,e)=>Math.min(a,e.sfc||0.35),9)||0.32,rl=Q.reduce((a,e)=>Math.max(a,e.rel||0.7),0)||0.8;
  const near=P.filter(e=>e.y>=t-5),cph=(near.length?near:P).map(e=>e.c*tabAt(CPI,t)/tabAt(CPI,Math.max(1895,e.y))/e.hp).sort((a,b)=>a-b),med=cph.length?cph[Math.floor(cph.length/2)]:20;
  let kg=hp*sw*T1.w*(1.4-0.4*sA),rel=clamp((b.rel+0.01*up)*(0.87+0.13*sE),0.4,Math.min(0.96,rl+0.03)),sf=sfc*(1.2-0.2*sE),c=hp*med*(1.15-0.25*sM)/(tabAt(CPI,t)/tabAt(CPI,Math.max(1895,Math.floor(t))));
  const G1=AE_GOAL[sp.goal],S=OWN_GS[clamp(sp.gl||1,1,3)];if(G1){if(G1.kg)kg*=1+G1.kg*S;if(G1.hp)hp*=1+G1.hp*S;if(G1.rel)rel=clamp(rel*(1+G1.rel*S),0.4,0.96);if(G1.sfc)sf*=1+G1.sfc*S;if(G1.c)c*=1+G1.c*S;}
  const x={own:1,k:'ae',type:sp.type,name:sp.name||'',hp:Math.round(hp),kg:Math.round(kg),cool:T1.cool,rel:+rel.toFixed(3),sfc:+sf.toFixed(3),c:Math.round(c/10)*10,cty:s.country,base:b.id,goal:sp.goal,gl:sp.gl||1};
  // год по истории: когда каталог дошёл до такой удельной мощности и до такой мощности
  let yh=1905;[e=>e.hp/e.kg,e=>e.hp].forEach(f=>{const v=f(x),L=AIR_ENG.filter(e=>!e.own&&!e.race).map(e=>({y:e.y,v:f(e)})).sort((a,b)=>a.y-b.y);let best=-1,yr=null;for(const o of L){best=Math.max(best,o.v);if(best>=v*0.995){yr=o.y;break;}}
    if(yr==null){const last=L[L.length-1].y,f0=L.filter(o=>o.y<=last-10).reduce((a,o)=>Math.max(a,o.v),-1),g=f0>0&&best>f0?clamp(Math.pow(best/f0,1/10)-1,0.01,0.08):0.03;yr=last+Math.ceil(Math.log(v/best)/Math.log(1+g));}yh=Math.max(yh,yr);});
  x.yh=yh;x.y=Math.max(Math.floor(t),yh);return x;}
function aePreview(s,sp){const x=aeBuild(s,sp);if(!x)return null;const t=tNow(s),yrs=Math.max(0,x.yh-s.y),need=Math.max(6,Math.round(AE_NEED*(1+0.2*OWN_GS[clamp(sp.gl||1,1,3)])*aheadTimeK(yrs)));
  const pj={kind:'aeng',id:'aeng',ck:'e',cat:'Авиамотор',name:sp.name||'',need,yrs,pc:airEngCost(x,t,s)*AE_PC,sp:{type:sp.type,goal:sp.goal,gl:sp.gl||1,name:sp.name||''}},cost=ownRdCost(pj,s);
  const P=aePeers(t).filter(e=>airPartOk(s,e,'e')),band=P.filter(e=>e.hp>=x.hp*0.6&&e.hp<=x.hp*1.6),best=(band.length?band:P).reduce((a,e)=>!a||e.hp/e.kg>a.hp/a.kg?e:a,null);let why='';
  if(!aeCan(s))why='Авиамотор — дело марки с автомобилями или мотоциклами';else if(!aeTypeOk(s,sp.type))why=`Такой мотор — с ${AE_TYPE[sp.type].y} года или с опытом «Моторы» ${AE_TYPE[sp.type].xp+20}`;
  else if(!AE_GOAL[sp.goal])why='Выберите цель';else if(yrs>OWN_LIMIT)why=`Предел эпохи: такой мотор история освоит только в ${x.yh} году`;
  else if(rdActive(s).length>=rdSlots(s))why='В КБ нет свободного места для проекта';else if(s.cash<cost)why='Не хватает денег';
  return {x,best,yrs,need,cost,pj,why,price:airEngCost(x,t,s),bestPrice:best?airEngCost(best,t,s):0,months:Math.max(1,Math.ceil(need/Math.max(0.01,rdTotal(s)/(rdActive(s).length+1)))),rework:protoRisk({kind:'aeng',yrs}),base:aeBase(s)};}
function aeStart(s,sp){const P=aePreview(s,sp);if(!P||P.why)return false;P.pj.name=(sp.name||'').trim()||`${s.company}, ${P.x.hp} л.с.`.slice(0,40);P.pj.sp.name=P.pj.name;s.ownN=(s.ownN||0)+1;P.pj.id='aeng'+s.ownN;return rdBegin(s,P.pj);}
function aeDone(s,pj){const x=aeBuild(s,pj.sp);if(!x){addLog(`КБ не смогло закончить «${pj.name}».`,'bad');return;}s.aeng=s.aeng||[];s.ownId=(s.ownId||0)+1;x.id='xa'+s.ownId;x.name=pj.name;x.made={y:s.y,m:s.m};x.sale=1;
  const T1=AE_TYPE[x.type],yrs=Math.max(0,x.yh-s.y);x.note=`Свой авиамотор ${s.y} года: ${T1.n.toLowerCase()}, ${x.hp} л.с., ${x.kg} кг.`;s.aeng.push(x);ownSync(s);xpAdd(s,'eng',4);xpAdd(s,'alloy',2);
  addLog(`КБ закончило авиамотор: ${x.name} — ${x.hp} л.с., ${x.kg} кг${yrs>0?`, на ${yrs} ${plural(yrs,'год','года','лет')} раньше истории`:''}.`,'good');pendingToasts.push('✈ Авиамотор: '+x.name);
  if(yrs>0)try{recordFirst(s,'own_'+x.id,x.name,x.yh,'отрасль пришла к такому мотору',null,{noArt:1});}catch(_){}
  const b=byId(ENGINES,x.base);
  pushEvent({own:1,noArt:1,kicker:'КБ · авиамотор',title:`«${s.company}» строит авиамоторы`,deck:`${x.hp} л.с., ${x.kg} кг`,
    text:`${x.name}: ${T1.n.toLowerCase()}. Основа — ${b?b.name:'свой автомобильный мотор'}. ${T1.h}\nМотор стоит в конструкторе аэроплана рядом с покупными — без наценки поставщика${s.tech&&s.tech.foundry?' и со своей литейкой':''}, и в войну его у вас никто не отнимет. Авиазаводы страны уже спрашивают цену: продажа моторов пойдёт отдельной строкой в отчёте.`,
    choices:[[`Запатентовать · ${money(ownPatCost(s))}`,'own:pat:'+x.id],['Дальше','ok']]},true);}
/* Продажа авиамоторов: рынок — моторы для аэропланов страны (по истории, AIR_MKT), против исторических моторов того же
   класса мощности по удельной мощности, надёжности и цене. Делаются в моторном цехе: занимают свободные места завода. */
function aeMarketYear(c,t){let v=0;['sport','train','mail','pax','sea'].forEach(r=>{v+=airMktRole(c,r,t,'civ');});['recon','fight','bomb','train','sea'].forEach(r=>{v+=airMktRole(c,r,t,'mil')*(r==='bomb'?1.6:1);});return v*1.15;}
// выбор авиазавода: удельная мощность, надёжность и цена лошадиной силы; мотор заметно хуже лучших своего класса почти не берут
function aeU(e,p){return 2*Math.log(e.hp/e.kg)+4*Math.log(e.rel||0.7)-1.5*Math.log(Math.max(1,p)/e.hp);}
function aePlaces(e){return Math.max(0.5,e.kg/200);}
function aeSaleCalc(s,x){const c=s.country,t=tNow(s),cost=airEngCost(x,t,s),P=aePeers(t).filter(e=>e.y>=t-10&&(e.cty===c||e.cty==='intl'||(e.lic&&e.lic[c]<=t))),all=aePeers(t).filter(e=>e.y>=t-10);
  // какая мощность нужна авиазаводам сейчас: вокруг середины моторов последних пяти лет; мотор не того класса некуда ставить
  const rec=all.filter(e=>e.y>=t-5),hs=(rec.length?rec:all).map(e=>e.hp).sort((a,b)=>a-b),med=hs.length?hs[Math.floor(hs.length/2)]:x.hp,lr=Math.log(x.hp/Math.max(1,med));
  const inB=e=>e.hp>=x.hp*0.6&&e.hp<=x.hp*1.6,band=P.filter(inB),bandSh=0.35*Math.exp(-lr*lr/(2*0.5*0.5));
  const pr=e=>airEngCost(e,t,{country:c,tech:{}})*1.15,ref=band.length?band.map(pr).sort((a,b)=>a-b)[Math.floor(band.length/2)]:cost*1.3,price=Math.round(Math.max(cost*1.12,Math.min(cost*1.3,ref*0.95))/10)*10;
  const u=aeU(x,price),W=band.reduce((a,e)=>a+Math.exp(2.5*(aeU(e,pr(e))-u)),0),age=x.made?(s.y-x.made.y)*12+s.m-x.made.m:0,aw=clamp(age/24,0.1,1)*(0.5+0.5*clamp(xpOf(s,'eng')/50,0,1))*Math.max(0.5,partMat(x,s.y));
  const share=1/(1+W)*aw*(band.length?1:0.5),dem=aeMarketYear(c,t)/12*bandSh*share;return {cost,price,share,dem,bandSh,n:band.length};}
function aeMonth(s,r){const R=r.ae={n:0,rev:0,cost:0,fix:0,licN:0,licRev:0,licCost:0};r.aeP=0;const L=(s.aeng||[]).filter(x=>x.sale);if(!L.length&&!s.aeLic)return;
  let free=Math.max(0,capEff(s)-(r.capUsed||0));const t=tNow(s);
  // заказ министерства: чужой мотор по лицензии — сначала он, потом своя торговля
  const O=s.aeLic;if(O){const e=byId(AIR_ENG,O.id);if(!e||mi(s)>=O.until||!airWarOn(s.country,t)){s.aeLic=null;addLog('Заказ министерства на авиамоторы закрыт: война кончилась, станки возвращаются автомобилям.');}
    else{const pl=aePlaces(e),n=Math.floor(Math.min(O.n,free/pl));if(n>0){const c=airEngCost(e,t,s)*0.9;free-=n*pl;R.licN=n;R.licRev=n*c*1.12;R.licCost=n*c;O.made=(O.made||0)+n;}}}
  R.fix=Math.round(L.length*AE_FIX*cpi(s));
  L.forEach(x=>{const C=aeSaleCalc(s,x),pl=aePlaces(x),n0=C.dem,n=Math.floor(Math.min(n0,free/pl)+(Math.random()<(Math.min(n0,free/pl)%1)?1:0));x.lastDem=n0;x.lastSold=n;if(n<=0)return;free-=n*pl;x.sold=(x.sold||0)+n;R.n+=n;R.rev+=n*C.price;R.cost+=n*C.cost;});
  r.aeP=Math.round(R.rev-R.cost-R.fix+R.licRev-R.licCost);r.capUsed=(r.capUsed||0)+Math.max(0,capEff(s)-(r.capUsed||0)-free);}
/* Заказ министерства в войну: выпуск чужого мотора по лицензии — как «Либерти» у Ford, Lincoln, Packard, Buick и Marmon (1917–1918). */
function aeLicOffer(s){const c=s.country,t=tNow(s);if(s.aeLic||s.aeLicNo||s.aeLicAsk||!airWarOn(c,t)||!lineOn(s,'car')||capEff(s)<150)return false;s.aeWar=(s.aeWar||0)+1;if(s.aeWar<4)return false;   // на четвёртый месяц войны для завода — без жребия
  const P=AIR_ENG.filter(e=>!e.own&&!e.race&&e.y<=t+0.3&&e.y>=t-4&&(e.cty===c||(e.lic&&e.lic[c]<=t+0.5))&&!airFoe(c,e.cty,t)),e=P.sort((a,b)=>b.hp-a.hp)[0];if(!e)return false;
  const n=Math.max(3,Math.min(400,Math.floor(capEff(s)*0.12/aePlaces(e)))),c1=airEngCost(e,t,s)*0.9,pm=Math.round(n*c1*0.12/100)*100;s.aeLicAsk={id:e.id,n};
  pushEvent({own:1,noArt:1,kicker:'Военное министерство',title:'Заказ на авиамоторы',deck:`${e.name}: до ${fmtN(n)} в месяц`,
    text:`Фронту не хватает моторов. Министерство предлагает вашему заводу выпуск по лицензии: ${e.name} — до ${fmtN(n)} штук в месяц, пока идёт война. Чертежи и оснастку даёт казна; платят себестоимость и 12 % сверху — около ${money(pm)} в месяц. Моторы займут часть мест завода.\nТак в 1917–1918 годах мотор «Либерти» строили Ford, Lincoln, Packard, Buick и Marmon — больше двадцати тысяч штук. Своего авиационного КБ для этого не нужно, а опыт останется у вас.`,
    choices:[['Принять заказ','own:aelic:yes'],['Отказаться','own:aelic:no']]},true);return true;}
function aeLicResolve(s,yes){const A=s.aeLicAsk;s.aeLicAsk=null;if(!A)return;if(!yes){s.aeLicNo=1;addLog('Заказ министерства на авиамоторы отклонён.');return;}
  const e=byId(AIR_ENG,A.id);s.aeLic={id:A.id,n:A.n,until:mi(s)+30,made:0};addLog(`Заказ министерства принят: ${e?e.name:'авиамотор'} по лицензии, до ${fmtN(A.n)} в месяц.`,'good');}
/* ---------- месяц: опыт, моторы, суды ---------- */
function ownMonth(s,r){ownEnsure(s);try{aeMonth(s,r);}catch(e){console.warn('ae',e);r.aeP=0;}try{xpMonth(s,r);}catch(e){console.warn('xp',e);}try{ownSeries(s);}catch(_){}try{ownLegalMonth(s,r);}catch(e){console.warn('own legal',e);}try{aeLicOffer(s);}catch(e){console.warn('ae lic',e);}}
function ownEvent(s,key){if(key==='own:aelic:yes')return aeLicResolve(s,true);if(key==='own:aelic:no')return aeLicResolve(s,false);return ownResolve(s,key);}
/* ---------- что видит игрок ---------- */
function xpLineHTML(s){const L=XP_KEYS.filter(k=>xpOf(s,k)>=1);return L.length?L.map(k=>`${XP_AREA[k].ic} ${XP_AREA[k].n.toLowerCase()} <b class="num">${Math.floor(xpOf(s,k))}</b>`).join(' · '):'пока нет — он копится выпуском, гонками и работами КБ';}
// строка в карточке КБ
function ownCardHTML(s){if(s.mode==='racer')return '';const n=ownParts(s).length+(s.aeng||[]).length;
  return `<div class="row" style="margin-top:10px;align-items:center;gap:8px"><p class="small" style="flex:1">🧪 Опыт: ${xpLineHTML(s)}${n?` · своих узлов — ${n}`:''}</p><button class="btn sm" data-act="ownOpen">Своя разработка</button></div>`;}
// что опыт уже открывает и что откроет дальше
function xpRowsHTML(s){return XP_KEYS.map(k=>{const v=xpOf(s,k),T2=OWN_TECH.filter(t=>t.a===k).sort((a,b)=>a.xp-b.xp),has=T2.filter(t=>v>=t.xp),nx=T2.find(t=>v<t.xp),ae=k==='eng'?Object.keys(AE_TYPE).filter(q=>AE_TYPE[q].xp>0&&v>=AE_TYPE[q].xp+20).map(q=>'авиамотор: '+AE_TYPE[q].n.toLowerCase()):[];
    return `<div class="row small" style="margin-top:6px;gap:8px"><span style="flex:1">${XP_AREA[k].ic} <b>${XP_AREA[k].n}</b> <span class="muted">· ${has.length||ae.length?'открыто: '+esc(has.map(t=>t.n.toLowerCase()).concat(ae).join(', ')):'пока ничего'}${nx?` · дальше — ${esc(nx.n.toLowerCase())} (${nx.xp})`:''}</span></span><span class="num">${Math.floor(v)}</span></div>
      <div class="bar" style="margin-top:3px"><i style="width:${Math.max(2,Math.min(100,v))}%;background:var(--brass)"></i></div>`;}).join('');}
let ownDraft=null;
// название из поля ввода — в черновик (лист перерисовывается при каждом выборе)
function ownKeep(){try{const e=document.getElementById('ownname');if(e&&ownDraft&&typeof e.value==='string'&&e.value.trim()&&e.value!==ownNextName(G,ownDraft.k))ownDraft.name=e.value.trim().slice(0,40);}catch(_){}}
// перерисовать лист, не теряя место прокрутки и введённое название
function ownRe(){ownKeep();let top=0;try{top=sb.scrollTop;}catch(_){}openOwn(ownDraft.k,ownDraft.moto);try{sb.scrollTop=top;}catch(_){}}
function aeRe(){let top=0;try{top=sb.scrollTop;}catch(_){}openAeng();try{sb.scrollTop=top;}catch(_){}}
function aeKeep(){try{const e=document.getElementById('aename');if(e&&aeDraft&&typeof e.value==='string')aeDraft.name=e.value.trim().slice(0,40);}catch(_){}}
function ownDraftInit(s,k,moto){const B=ownBaseList(s,k,moto);ownDraft={k,moto:!!moto,base:B[0]?B[0].id:null,tech:[],goal:'power',gl:1,name:''};return ownDraft;}
function ownFmt(v,d){return d===0?fmtN(Math.round(v)):v.toFixed(d).replace('.',',');}
function ownPreviewHTML(s,P){if(!P)return '';const x=P.x,rows=P.cmp.map(c=>`<tr><td>${esc(c.n)}</td><td class="num">${ownFmt(c.base,c.d)}</td><td class="num ${c.mine>c.base*1.005?'good':c.mine<c.base*0.995?'bad':''}"><b>${ownFmt(c.mine,c.d)}</b></td><td class="num muted">${ownFmt(c.best,c.d)}</td></tr>`).join('');
  const pc0=partCost(P.x0,s),pc1=partCost(x,s);
  return `<table class="pl" style="margin-top:8px"><tr><th></th><th class="n">основа</th><th class="n">свой</th><th class="n">лучший ${s.y} г.</th></tr>${rows}
    <tr><td>вес, кг</td><td class="num">${fmtN(Math.round(P.x0.kg))}</td><td class="num ${x.kg<P.x0.kg*0.995?'good':x.kg>P.x0.kg*1.005?'bad':''}"><b>${fmtN(Math.round(x.kg))}</b></td><td class="num muted">${fmtN(Math.round(P.best.kg))}</td></tr>
    <tr><td>цена в серии</td><td class="num">${money(pc0)}</td><td class="num ${pc1<pc0*0.995?'good':pc1>pc0*1.005?'bad':''}"><b>${money(pc1)}</b></td><td class="num muted">${money(partCost(P.best,s))}</td></tr></table>
    <p class="small" style="margin-top:8px">Год по истории: <b class="num">${x.yh>1930?x.yh+' — в истории эпохи такого не было':x.yh}</b>${P.yrs>0?` <span class="warn">· на ${P.yrs} ${plural(P.yrs,'год','года','лет')} раньше: проект дороже в ${(aheadCostK(P.yrs)).toFixed(1).replace('.',',')} раза, узел в серии +${Math.round((aheadPartK(x,s)-1)*100)}%</span>`:' <span class="muted">· не опережает историю</span>'}</p>
    <p class="small muted" style="margin-top:4px">Срок ~${P.months} мес. · риск доработки на испытаниях ${Math.round(P.rework*100)}% · риск «не так, как задумано» в серии ${Math.round(P.risk*100)}%</p>`;}
function openOwn(k,moto){const s=G;ownEnsure(s);if(!k){ownDraft=null;const mv=lineOn(s,'moto')||s.mshopB,cv=lineOn(s,'car')||s.carShopB||!lineOn(s,'moto');
    const cat=(q,mo)=>{const B=ownBaseList(s,q,mo)[0];return B?`<button class="race-item" data-act="ownCat" data-k="${q}" data-mo="${mo?1:0}" style="display:block;width:100%;text-align:left"><span class="mo">${mo?'🏍 ':''}${OWN_CAT[q].n}</span><h3 style="margin-top:2px">${esc(B.name)}</h3><p class="small muted">основа — ваш лучший узел · приёмов по опыту: ${OWN_TECH.filter(t=>t.cat.includes(q)&&xpTechOk(s,t)).length} из ${OWN_TECH.filter(t=>t.cat.includes(q)).length}</p></button>`:'';};
    const mine=ownParts(s).concat(s.aeng||[]);
    return openSheet(`<div class="row"><h2>Своя разработка</h2>${X}</div>
      <p class="small muted" style="margin-top:6px">Узел, которого нет у поставщиков: основа — ваш лучший, приёмы — из накопленного опыта. Чем дальше он от того, что умеет история, тем дороже и рискованнее.</p>
      <div class="card" style="margin-top:10px;background:var(--panel2)"><div class="label">Опыт компании</div>${xpRowsHTML(s)}</div>
      <div class="label" style="margin-top:14px">Шаг 1. Что делаем</div>${cv?Object.keys(OWN_CAT).map(q=>cat(q,false)).join(''):''}${mv?['e','c','w','k'].map(q=>cat(q,true)).join(''):''}
      ${aeCan(s)?`<button class="race-item" data-act="aeOpen" style="display:block;width:100%;text-align:left"><span class="mo">✈ Авиамотор</span><h3 style="margin-top:2px">${esc((aeBase(s)||{name:'—'}).name)}</h3><p class="small muted">основа — ваш самый сильный мотор · для своих аэропланов и на продажу авиазаводам</p></button>`:''}
      ${mine.length?`<div class="label" style="margin-top:14px">Свои узлы</div>${mine.map(x=>ownItemHTML(s,x)).join('')}`:''}`);}
  if(!ownDraft||ownDraft.k!==k||ownDraft.moto!==!!moto)ownDraftInit(s,k,moto);const d=ownDraft,B=ownBaseList(s,k,d.moto),P=d.base?ownPreview(s,d):null;
  const techs=OWN_TECH.filter(t=>t.cat.includes(k)),chip=(on,act,attrs,txt,dis)=>`<button class="chip${on?' on':''}" data-act="${act}" ${attrs} ${dis?'disabled':''}>${txt}</button>`;
  openSheet(`<div class="row"><h2>${d.moto?'🏍 ':''}${OWN_CAT[k].n}: своя разработка</h2>${X}</div>
    <div class="row" style="margin-top:8px"><span class="small"><b>Шаг 2. Основа</b></span><button class="btn sm" data-act="ownOpen">Изменить узел</button></div>
    <div class="chips">${B.slice(0,4).map(x=>chip(d.base===x.id,'ownBase',`data-id="${x.id}"`,esc(x.name)+(upgL(x.id)?' ★'+upgL(x.id):''))).join('')}</div>
    <div class="label" style="margin-top:12px">Шаг 3. Приёмы — один или два (второй даёт меньше)</div>
    ${techs.length?`<div class="chips">${techs.map(t=>{const ok=xpTechOk(s,t),on=d.tech.includes(t.id);return `<button class="chip${on?' on':''}" data-act="ownTech" data-id="${t.id}" ${ok?'':'disabled'}>${esc(t.n)}<small>${ok?esc(t.d):`нужен опыт: ${XP_AREA[t.a].n.toLowerCase()} ${Math.floor(xpOf(s,t.a))} из ${t.xp}`}</small></button>`;}).join('')}</div>`:'<p class="small muted" style="margin-top:4px">Для этого узла приёмов из опыта нет — только цель.</p>'}
    <div class="label" style="margin-top:12px">Шаг 4. Цель</div><div class="chips">${Object.keys(OWN_GOAL).map(g=>chip(d.goal===g,'ownGoal',`data-g="${g}"`,ownGoalName(g,k))).join('')}</div>
    <div class="chips">${[1,2,3].map(n=>chip(d.gl===n,'ownGl',`data-n="${n}"`,['Шаг','Два шага','Три шага'][n-1])).join('')}<span class="small muted" style="align-self:center">каждый следующий шаг даёт меньше и стоит дольше</span></div>
    <label class="label" for="ownname" style="display:block;margin-top:12px">Название</label><input type="text" id="ownname" value="${esc(d.name||ownNextName(s,k))}" maxlength="40" style="margin-top:6px">
    <div class="card" style="margin-top:12px;background:var(--panel2)"><div class="label">Что получится</div>${ownPreviewHTML(s,P)}</div>
    ${P&&P.why?`<p class="small warn" style="margin-top:8px">${esc(P.why)}.</p>`:''}
    <button class="btn primary block" style="margin-top:12px" data-act="ownStart" ${!P||P.why?'disabled':''}>Начать · ${P?money(P.cost):''}</button>`);}
let aeDraft=null;
function openAeng(){const s=G;ownEnsure(s);if(!aeDraft){const ks=Object.keys(AE_TYPE).filter(k=>aeTypeOk(s,k));aeDraft={type:ks[ks.length-1]||'inline',goal:'power',gl:1,name:''};}const d=aeDraft,P=aePreview(s,d),x=P&&P.x,b=P&&P.best;
  const chip=(on,act,attrs,txt,dis)=>`<button class="chip${on?' on':''}" data-act="${act}" ${attrs} ${dis?'disabled':''}>${txt}</button>`,C=x?aeSaleCalc(s,{...x,made:{y:s.y-2,m:s.m}}):null;
  openSheet(`<div class="row"><h2>✈ Свой авиамотор</h2>${X}</div>
    <p class="small muted" style="margin-top:6px">Основа — ваш самый сильный мотор: ${esc(P&&P.base?P.base.name:'—')}${P&&P.base&&upgL(P.base.id)?' ★'+upgL(P.base.id):''}. Чем больше опыта в моторах и сплавах, тем легче и надёжнее выйдет авиамотор.</p>
    <div class="label" style="margin-top:12px">Тип</div>${Object.keys(AE_TYPE).map(k=>{const T1=AE_TYPE[k],ok=aeTypeOk(s,k);return `<button class="race-item${ok?'':' off'}" data-act="aeType" data-k="${k}" ${ok?'':'disabled'} style="display:block;width:100%;text-align:left"><span class="mo">${d.type===k?'<b class="good">● выбран</b> · ':''}${ok?'доступен':`с ${T1.y} года или с опытом «Моторы» ${T1.xp+20}`}</span><h3 style="margin-top:2px">${esc(T1.n)}</h3><p class="small muted">${esc(T1.h)}</p></button>`;}).join('')}
    <div class="label" style="margin-top:12px">Цель</div><div class="chips">${Object.keys(AE_GOAL).map(g=>chip(d.goal===g,'aeGoal',`data-g="${g}"`,AE_GOAL[g].n)).join('')}</div>
    <div class="chips">${[1,2,3].map(n=>chip(d.gl===n,'aeGl',`data-n="${n}"`,['Шаг','Два шага','Три шага'][n-1])).join('')}</div>
    <label class="label" for="aename" style="display:block;margin-top:12px">Название</label><input type="text" id="aename" value="${esc(d.name||(x?`${s.company}, ${x.hp} л.с.`:''))}" maxlength="40" style="margin-top:6px">
    ${x?`<div class="card" style="margin-top:12px;background:var(--panel2)"><div class="label">Что получится</div>
      <table class="pl" style="margin-top:8px"><tr><th></th><th class="n">свой</th><th class="n">${b?esc(b.name.split(',')[0]):'—'}</th></tr>
      <tr><td>мощность, л.с.</td><td class="num"><b>${x.hp}</b></td><td class="num muted">${b?b.hp:'—'}</td></tr><tr><td>вес, кг</td><td class="num"><b>${x.kg}</b></td><td class="num muted">${b?b.kg:'—'}</td></tr>
      <tr><td>л.с. на кг</td><td class="num ${b&&x.hp/x.kg>b.hp/b.kg?'good':'bad'}"><b>${(x.hp/x.kg).toFixed(2).replace('.',',')}</b></td><td class="num muted">${b?(b.hp/b.kg).toFixed(2).replace('.',','):'—'}</td></tr>
      <tr><td>надёжность</td><td class="num ${b&&x.rel>=b.rel?'good':'bad'}"><b>${x.rel.toFixed(2).replace('.',',')}</b></td><td class="num muted">${b?(b.rel||0.7).toFixed(2).replace('.',','):'—'}</td></tr>
      <tr><td>цена мотора</td><td class="num ${P.price<P.bestPrice?'good':'bad'}"><b>${money(P.price)}</b></td><td class="num muted">${b?money(P.bestPrice):'—'}</td></tr></table>
      <p class="small" style="margin-top:8px">Год по истории: <b class="num">${x.yh}</b>${P.yrs>0?` <span class="warn">· на ${P.yrs} ${plural(P.yrs,'год','года','лет')} раньше: проект дороже в ${aheadCostK(P.yrs).toFixed(1).replace('.',',')} раза</span>`:' <span class="muted">· не опережает историю</span>'}</p>
      <p class="small muted" style="margin-top:4px">Срок ~${P.months} мес. · риск доработки ${Math.round(P.rework*100)}%${C?` · продажа авиазаводам: около ${fmtN(Math.round(C.dem))} в месяц по ${money(C.price)}, с мотора ${money(C.price-C.cost)}`:''}</p></div>`:''}
    ${P&&P.why?`<p class="small warn" style="margin-top:8px">${esc(P.why)}.</p>`:''}
    <button class="btn primary block" style="margin-top:12px" data-act="aeStart" ${!P||P.why?'disabled':''}>Начать · ${P?money(P.cost):''}</button>`);}
function ownItemHTML(s,x){const ae=x.k==='ae',pat=ownPatOn(s,x),cp=x.cp?Object.keys(x.cp).length:0,lb=pat&&x.ser!=null?ownLicBuyer(s,x):null;
  return `<div class="race-item"><div class="row"><div><span class="mo">${ae?'✈ авиамотор':esc(OWN_CAT[x.k].n)} · ${x.made?x.made.y:''} · год по истории ${x.yh}${pat?' · <b class="good">патент до '+(1895+Math.floor(x.pat.until/12))+'</b>':''}${cp?` · скопировали: ${cp}`:''}</span><h3 style="margin-top:2px">${esc(x.name)}</h3></div>${pat?(lb?`<button class="btn sm" data-act="ownLic" data-id="${x.id}">Лицензия: ${esc(firmName(s,lb.F))} · ${money(ownLicFee(s,lb.F))}/мес.</button>`:''):`<button class="btn sm" data-act="ownPat" data-id="${x.id}" ${s.cash<ownPatCost(s)?'disabled':''}>Патент · ${money(ownPatCost(s))}</button>`}</div>
    <p class="small muted" style="margin-top:4px">${ae?`${x.hp} л.с., ${x.kg} кг · продано авиазаводам ${fmtN(x.sold||0)}${x.lastDem!=null?` · спрос ${fmtN(Math.round(x.lastDem))} в месяц`:''} <button class="link" data-act="aeSale" data-id="${x.id}">${x.sale?'не продавать на сторону':'продавать авиазаводам'}</button>`:esc(x.art||x.note||'')}</p></div>`;}
// «Как посчитано» и карточка модели: что свой узел дал против своей основы
function ownGain(md,s,x){const b=byId(OWN_CAT[x.k].arr(),x.base);if(!b)return null;const m0={...md,[x.k]:b.id};let S1=1,S0=1;try{S1=classCompare(md,s,s.country).S;S0=classCompare(m0,s,s.country).S;}catch(_){return null;}return {b,dS:S1/Math.max(1e-6,S0),dC:unitCost(md,s)-unitCost(m0,s)};}
function ownXpHTML(md,s){if(!md||!s||!(s.custom||[]).length)return '';const L=(s.custom||[]).filter(x=>md[x.k]===x.id).map(x=>({x,G:ownGain(md,s,x)})).filter(o=>o.G);if(!L.length)return '';
  return `<p class="xp-w" style="margin-top:8px">${L.map(o=>`🧪 Свой узел «${esc(o.x.name)}» против основы (${esc(o.G.b.name)}): итог <b class="${o.G.dS>1.002?'good':o.G.dS<0.998?'bad':''}">${o.G.dS>=1?'+':'−'}${Math.abs((o.G.dS-1)*100).toFixed(1).replace('.',',')}%</b>, себестоимость машины <b class="${o.G.dC<-0.5?'good':o.G.dC>0.5?'bad':''}">${o.G.dC>=0?'+':'−'}${money(Math.abs(Math.round(o.G.dC)))}</b>.`).join('<br>')}</p>`;}
function ownModelLine(md,s){const h=ownXpHTML(md,s);return h?h.replace('class="xp-w"','class="small"'):'';}
function aePLRow(L){const R=L&&L.ae;if(!R||!(R.n||R.licN||R.fix))return '';return `<tr><td>Авиамоторы: ${R.n?`продано ${fmtN(R.n)}`:''}${R.n&&R.licN?', ':''}${R.licN?`по заказу министерства ${fmtN(R.licN)}`:''}</td><td class="n">${money(Math.round(R.rev+R.licRev))}</td></tr><tr><td>Себестоимость авиамоторов и испытательная станция</td><td class="n">−${money(Math.round(R.cost+R.licCost+(R.fix||0)))}</td></tr>`;}
