/* ================= MODEL ================= */
let G=null,tab='plant',draft=null,auto=null;
const T=s=>(s.y-1895)+s.m/12;
const mi=s=>(s.y-1895)*12+s.m;
const yf=s=>s.y+s.m/12;
const dstr=s=>MONTHS[s.m]+' '+s.y;
const unlocked=(arr,s)=>arr.filter(x=>x.y<=s.y);
const isTruck=md=>!!byId(BODIES,md.b).truck;
const segOf=md=>isTruck(md)?'truck':md.t==='t0'?'people':md.t==='t1'?'middle':md.t==='t3'?'sport':'lux';
// Спортивное оснащение — только на открытом кузове
const OPEN_B=['b1','b2','b3','b10'];
const bodyOpen=id=>OPEN_B.includes(id);
function DIF(){return DIFFS[(G&&G.diff)||'normal'];}
const upgL=id=>(G&&G.rd&&G.rd.upg[id])||0;
function unlockedP(arr,s){return arr.filter(x=>x.y<=s.y||(s.rd&&s.rd.early.includes(x.id)));}
// Конструкторское бюро: 8 уровней. Чем больше бюро, тем больше проектов оно ведёт одновременно
const RD_LV=['','Чертёжная комната','Мастерская опытных образцов','Конструкторское бюро','Испытательная станция','Экспериментальный цех','Исследовательский отдел','Научный центр','Институт автомобиля'];
const RD_MAX=8;
function rdSlots(s){return 1+Math.floor((s.rd.lvl-1)/2);}
function rdPoints(s){return (2+s.rd.lvl)/3*bn('rd');}          // очков в месяц на один проект
function rdUpCost(s){return Math.round(4000*s.rd.lvl*Math.pow(1.12,Math.max(0,s.rd.lvl-4))*cpi(s)*(1+0.05*T(s))/100)*100;}
function rdUpkeep(s){return Math.round(60*Math.pow(s.rd.lvl,1.35)*cpi(s)*(1+0.03*T(s)));}
function rdMaxUpg(s){return s.rd.lvl>=7?5:s.rd.lvl>=5?4:3;}
function rdHorizon(s){return [0,2,3,4,4,5,6,7,7][s.rd.lvl]||2;}
function rdActive(s){return s.rd.projs||[];}
// Все инженеры бюро делят силы между проектами по долям: один проект получает всё
function rdTotal(s){return rdPoints(s)*rdSlots(s);}
function rdShare(s,pj){const L=rdActive(s),sw=L.reduce((a,p)=>a+(p.w||1),0);return sw?(pj.w||1)/sw:1;}
function rdPtsOf(s,pj){return rdTotal(s)*rdShare(s,pj);}
const UPG_TXT={e:'+8% мощности, +2% надёжности',g:'+1% КПД, машину легче водить',c:'+12% допустимой мощности, рама легче и мягче',w:'+6% сцепления, шины живут на 10% дольше',k:'+5% силы тормозов',b:'кузов удобнее и легче, у грузовых +5% груза'};
function rdProjects(s){
  const list=[],used=new Set();s.models.filter(m=>m.status!=='off').forEach(m=>PART_KEYS.forEach(k=>used.add(m[k])));
  const busy=new Set(rdActive(s).map(p=>p.kind+':'+p.id)),mx=rdMaxUpg(s),hz=rdHorizon(s);
  PART_CATS.forEach(cat=>{const arr=cat.arr();
    unlockedP(arr,s).forEach(x=>{const l=upgL(x.id),age=Math.max(0,s.y-Math.max(1893,x.y)-6);if(l<mx&&!busy.has('upg:'+x.id))list.push({kind:'upg',id:x.id,cat:cat.rd,ck:cat.k,name:x.name,lvl:l+1,mine:used.has(x.id),need:Math.round((6*(l+1)+x.q/8+(l>=3?8*(l-2):0))*(1+0.08*age))});});
    const nx=arr.filter(x=>x.y>s.y&&!s.rd.early.includes(x.id)).sort((a,b)=>a.y-b.y)[0];
    if(nx&&nx.y-s.y<=hz&&!busy.has('early:'+nx.id))list.push({kind:'early',id:nx.id,cat:cat.rd,ck:cat.k,name:nx.name,need:10+6*(nx.y-s.y),yrs:nx.y-s.y});
  });
  return list;
}
function PB(){return (G&&PIONEERS[G.pioneer]||PIONEERS.custom).b;}
function bn(k,d=1){const b=PB();return b[k]!==undefined?b[k]:d;}
function segBonus(g){const b=PB();return b.seg&&b.seg[g]||1;}
/* ---------- prices, wages, parts ---------- */
function cpi(s){return tabAt(CPI,yf(s));}
function wageBase(s,c){return tabAt(WAGE[c||s.country],yf(s));}
const WAGE_POL={low:{name:'Ниже рынка',k:0.85,prod:0.9,strike:0.045,turn:'высокая'},market:{name:'По рынку',k:1,prod:1,strike:0.02,turn:'обычная'},good:{name:'Выше рынка',k:1.25,prod:1.07,strike:0.008,turn:'низкая'},five:{name:'«Пять долларов в день»',k:2.2,prod:1.28,strike:0.002,turn:'почти нет',y:1914}};
function wageNow(s){return wageBase(s)*WAGE_POL[s.wagePol||'market'].k*(s.shifts>1?1.08:1);}
// В США поставщики рано перешли на поток: с 1903 года детали там заметно дешевле
function partCountry(s){const c=s.country;return c==='us'?(s.y<1903?1:s.y<1910?0.8:0.72):c==='uk'||c==='it'?1.05:1;}
// деталь дешевеет с годами (поставщики учатся), но не больше чем вдвое; отсчёт — с появления детали или с 1895 года
function partCost(x,s){return x.c*1.15*cpi(s)*Math.max(0.5,1-0.025*Math.max(0,yf(s)-Math.max(1895,x.y)))*partCountry(s);}
// Детали модели. У старых сохранений и чужих машин коробки и тормозов может не быть — берём типичные для эпохи
function defGear(y){return y>=1914?'g6':y>=1906?'g5':y>=1899?'g3':'g2';}
function defBrake(y){return y>=1920?'k3':y>=1902?'k2':'k1';}
const parts=md=>({e:byId(ENGINES,md.e),g:byId(GEARBOX,md.g||'g2'),c:byId(CHASSIS,md.c),k:byId(BRAKES,md.k||'k1'),b:byId(BODIES,md.b),t:byId(TRIMS,md.t||'t0'),w:byId(TYRES,md.w||'w2')});
const PART_KEYS=['e','g','c','w','k','b'];
// Улучшения КБ работают только на ваших машинах: у соперников и «эталона» класса их нет
// После ★3 каждое улучшение даёт вдвое меньше: старую конструкцию бесконечно не улучшишь
// Соперники тоже дорабатывают свои машины: эталон класса с каждым годом после выхода лучше (как улучшения КБ, до ★2,5)
function upgOf(md,id){if(md&&md.ref)return md.rl||0;if(md&&md.ai)return 0;const l=upgL(id);return l<=3?l:3+0.5*(l-3);}
function chassisMax(c,md){return c.max*(md&&(md.ai||md.ref)?1:bn('chassisTol'))*(1+0.12*upgOf(md,c.id));}
function engineHp(e,md){return e.hp*(1+0.08*upgOf(md,e.id));}
function overpower(md){const p=parts(md);return p.e.hp>chassisMax(p.c,md);}
// Сложность деталей для конструкторов: от неё бюджет и срок разработки
function designEffort(md){const p=parts(md);return PART_KEYS.reduce((a,k)=>a+p[k].q*(1+0.12*upgOf(md,p[k].id)),0)+p.t.q;}
function baseCost(md,s){const p=parts(md);return PART_KEYS.reduce((a,k)=>a+partCost(p[k],s),0)+p.t.c*cpi(s);}
function learn(md){return Math.max(0.85,Math.pow(1+(md.made||0)/200,-0.045));}
// Экономия масштаба. Скидка поставщиков за объём: 5 машин в месяц — детали на четверть дороже обычного,
// сотни — по обычной цене, тысячи и десятки тысяч — на 10–40% дешевле. До массового производства
// (около 1908 года) скидка ограничена: детали всё равно точат и подгоняют вручную
function volFactor(v,s){const lo=s?clamp(0.95-0.035*(yf(s)-1900),0.55,0.95):0.55;return clamp(1.36-0.16*Math.log10(1+Math.max(0,v)),lo,1.3);}
// Опыт рабочих: с каждым удвоением выпущенных машин модели нужно ~9% меньше часов (до −55%)
function labLearn(md){return Math.max(0.45,Math.pow(1+(md.made||0)/150,-0.14));}
// Разделение труда: большой поток — у каждого рабочего своя операция; штучная сборка — мастера делают всё
function labRate(v){return clamp(1.15-0.075*Math.log10(1+Math.max(0,v)),0.85,1.15);}
function modelVol(md){return md.vol||md.lastMade||1;}
function matCost(md,s){const p=parts(md),tc=s.tech||{};let c=baseCost(md,s);
  if(tc.foundry)c-=partCost(p.e,s)*0.18;if(tc.press&&!isTruck(md))c-=partCost(p.b,s)*0.15;
  return Math.max(10,c*volFactor(modelVol(md),s)*learn(md)*bn('matCost')*(s.supplyNow||1));}
function complexity(md){const p=parts(md);return p.e.cx*p.g.cx*p.c.cx*p.k.cx*p.b.cx*p.t.cx;}
/* ---------- характеристики машины глазами покупателя ---------- */
const CHAR_K=['perf','rel','comf','ease','safe','econ','cap'];
const CHAR_NAMES={perf:'Мощность',rel:'Надёжность',comf:'Комфорт',ease:'Простота вождения',safe:'Тормоза',econ:'Экономичность',cap:'Вместимость'};
const CHAR_HINT={perf:'лошадиных сил на тонну',rel:'реже ломается',comf:'рессоры, шины, кузов, плавность мотора',ease:'коробка, педали, вес',safe:'тормоза и сцепление шин',econ:'бензин, шины, ремонт',cap:'места или груз'};
// Что ценят покупатели каждого класса (сумма весов — 1)
const CHAR_W={people:{perf:0.12,rel:0.25,comf:0.07,ease:0.15,safe:0.05,econ:0.28,cap:0.08},
  middle:{perf:0.21,rel:0.18,comf:0.21,ease:0.1,safe:0.08,econ:0.08,cap:0.14},
  lux:{perf:0.25,rel:0.14,comf:0.36,ease:0.1,safe:0.1,econ:0,cap:0.05},
  // спортивные: скорость и разгон, тормоза и сцепление, лёгкость управления; комфорт почти не важен
  sport:{perf:0.42,rel:0.12,comf:0.04,ease:0.14,safe:0.22,econ:0,cap:0.06},
  truck:{perf:0.12,rel:0.38,comf:0,ease:0.06,safe:0.06,econ:0.38,cap:0}};
// В Европе налог на лошадиные силы и дорогой бензин: народные и средние машины ценят за экономичность
function charW(g,c){const W=CHAR_W[g];if(c&&c!=='us'&&(g==='people'||g==='middle'))return {...W,perf:W.perf-0.07,econ:W.econ+0.07};return W;}
function carChar(md,y){
  const p=parts(md),U=id=>upgOf(md,id),st=carBase(md,0,y),truck=!!p.b.truck;
  const pay=truck?(p.b.pay||1)*(1+0.05*U(p.b.id)):0,mass=st.kg+pay*500,eff=p.g.eff*(1+0.01*U(p.g.id));
  const mtbf=1/Math.max(0.01,1-st.rel),smooth=({1:0.75,2:0.85,4:1,6:1.15,8:1.25}[p.e.cyl]||1)*(p.e.sleeve?1.1:1);
  const fuel=p.e.fuel*Math.pow(mass/1000,0.6)/eff;
  return {perf:st.hp*eff/mass*1000,rel:Math.sqrt(mtbf),
    comf:p.c.ride*(1+0.03*U(p.c.id))*(p.w.ride||1)*(1+0.02*U(p.w.id))*(p.b.comf||1)*(1+0.04*U(p.b.id))*smooth*({t0:1,t1:1.25,t2:1.6,t3:0.95}[p.t.id]||1),
    ease:p.g.ease*(1+0.04*U(p.g.id))*(0.6+0.4*p.k.ease)*(p.w.solid?0.85:1)*Math.pow(1000/Math.max(500,mass),0.2),
    safe:st.brk*st.grip,econ:Math.pow(1/fuel,0.8)*Math.pow((p.w.life||300)*(1+0.1*U(p.w.id)),0.05)*Math.pow(mtbf,0.1),
    cap:truck?pay:(p.b.seats||2),hp:st.hp,kg:st.kg,relP:st.rel};
}
const CH_CACHE=new Map();
function charOf(md,y){const key=[md.e,md.g,md.c,md.k,md.b,md.t,md.w,y,md.ref?'r'+(md.rl||0):md.ai?'a':(G?G.pioneer:'')+PART_KEYS.map(k=>upgL(md[k])).join('')].join('|');
  let v=CH_CACHE.get(key);if(!v){v=carChar(md,y);if(CH_CACHE.size>800)CH_CACHE.clear();CH_CACHE.set(key,v);}return v;}
// С кем сравнивают: фургон — с фургонами, грузовик — с грузовиками, легковую — с машинами своего класса
function rivalKind(md){const b=byId(BODIES,md.b);return b.truck?(md.b==='b6'?'van':'truck'):segOf(md);}
function rivalRef(md,y){const kind=rivalKind(md),r=rivalCar(kind,y);return {name:r[1],y:r[0],kind,md:{...r[2],t:KIND_TRIM[kind]||'t0',ref:1,rl:Math.round(clamp(0.3*(y-r[0]),0,2.5)*10)/10}};}
// Во сколько раз машина лучше типичной машины соперников класса (1 — такая же), по каждой черте и в сумме
function classCompare(md,s,c){const y=s.y,g=segOf(md),ref=rivalRef(md,y),A=charOf(md,y),R=charOf(ref.md,y),W=charW(g,c||s.country),by={};let lnS=0;
  CHAR_K.forEach(k=>{const r=clamp(A[k]/R[k],0.25,4);by[k]=r;if(W[k])lnS+=W[k]*Math.log(r);});
  return {S:Math.exp(lnS)*bn('quality')*(overpower(md)?0.85:1),by,W,ref,A,R};}
function classScore(md,s,c){return classCompare(md,s,c).S;}
// Качество для рынка: доля лучшей машины эпохи (у соперников класса — QG)
function mq(md,s,c){return Math.max(0.05,QG[segOf(md)]*classScore(md,s,c));}
function modelR(md,s){return classScore(md,s);}
// Грузоподъёмность: фургон стоит дешевле грузовика, трёхтонка — дороже
function payK(md){const b=byId(BODIES,md.b);return b.truck?Math.pow((b.pay||1.5)/1.5,0.6):1;}
const KIND_TRIM={people:'t0',middle:'t1',lux:'t2',sport:'t3',van:'t0',truck:'t0'};
const KIND_NAME={people:'Народная',middle:'Средний класс',lux:'Люкс',sport:'Спортивная',van:'Фургон',truck:'Грузовик'};
function kindBodyOk(kind,b){return kind==='van'?b.id==='b6':kind==='truck'?!!b.truck&&b.id!=='b6':kind==='sport'?bodyOpen(b.id):!b.truck;}
// Конструкция соперника класса — отправная точка для новой модели
function rivalDesign(kind,y){const r=rivalCar(kind,y);return {...r[2],t:KIND_TRIM[kind]};}
// Подбор конструкции: по очереди меняем каждую деталь на лучшую для прибыли при подходящей цене
// Себестоимость считаем при том выпуске, который купят (экономия масштаба); если по обычной цене
// машина убыточна, пробуем и цену «себестоимость + 10–25%» — иначе «лучшей» оказалась бы машина, которую никто не берёт
// Убыток считаем не меньше чем на плановый выпуск: иначе «выгоднее» всего машина, которую никто не купит
function designValue(md,s){const ref=refPrice(md,s),V=Math.max(5,md.vol||20);let best=-1e18,bp=ref;
  const uc0=unitCost({...md,vol:V},s),cands=[0.85,1,1.15,1.3].map(k=>ref*k).concat([1.1,1.25].map(k=>uc0/(1-DEALER_MARGIN)*k));
  for(const P of cands){md.price=Math.round(P);const d=forecastDemand(md,s),m=md.price*(1-DEALER_MARGIN)-unitCost({...md,vol:Math.max(5,d)},s),v=m>0?d*m:m*Math.max(d,V);if(v>best){best=v;bp=md.price;}}
  md.price=bp;return best;}
function autoDesign(kind,s,base){
  const vol=Math.max(20,(s.last&&s.last.made)||20);
  let md={...(base||rivalDesign(kind,s.y)),t:KIND_TRIM[kind],id:-1,made:0,vol,launched:mi(s),status:'prod',price:0};
  const ok=(k,x)=>k!=='b'||kindBodyOk(kind,x),avail=(k,id)=>unlockedP(PART_CATS.find(c=>c.k===k).arr(),s).some(x=>x.id===id);
  // кузов должен подходить классу и уже продаваться (грузовик до 1910 года — только прототип КБ)
  if(!ok('b',byId(BODIES,md.b))||!avail('b',md.b)){const b=unlockedP(BODIES,s).find(x=>kindBodyOk(kind,x));if(b)md.b=b.id;else if(kind==='truck'){kind='van';md.b='b6';}}
  PART_KEYS.forEach(k=>{if(k!=='b'&&!avail(k,md[k])){const L=unlockedP(PART_CATS.find(c=>c.k===k).arr(),s);if(L.length)md[k]=L[L.length-1].id;}});
  // мотор мощнее рамы — подбираем к нему самую дешёвую раму, которая его выдержит
  const fit=t=>{if(!overpower(t))return t;const cs=unlockedP(CHASSIS,s).filter(c=>!overpower({...t,c:c.id})).sort((a,b)=>partCost(a,s)-partCost(b,s));return cs.length?{...t,c:cs[0].id}:null;};
  if(overpower(md))md=fit(md)||md;
  let bestV=designValue(md,s);
  for(let pass=0;pass<2;pass++)for(const k of PART_KEYS){const arr=PART_CATS.find(c=>c.k===k).arr();let bx=null;
    for(const x of unlockedP(arr,s)){if(x.id===md[k]||!ok(k,x))continue;const t=fit({...md,[k]:x.id});if(!t||t[k]!==x.id)continue;const v=designValue(t,s);if(v>bestV){bestV=v;bx=t;}}
    if(bx)md=bx;}
  designValue(md,s);return md;}
/* ---------- factory ---------- */
const TECH={
  tools:{name:'Станочный парк',max:4,lv:[{y:1897,name:'Токарные и фрезерные станки',hrs:0.8,F:800,v:160},{y:1904,name:'Специальные станки под деталь',hrs:0.62,F:3000,v:320},{y:1911,name:'Многошпиндельные автоматы',hrs:0.5,F:9000,v:520},{y:1920,name:'Автоматические линии обработки',hrs:0.42,F:25000,v:700}],
    desc:'Станки делают детали быстрее и точнее — меньше часов на машину.'},
  elec:{name:'Электрификация цехов',max:2,lv:[{y:1900,name:'Групповой привод от электромотора',hrs:0.92,cap:1.05,F:1500,v:120},{y:1910,name:'Свой мотор у каждого станка',hrs:0.85,cap:1.1,F:6000,v:260}],
    desc:'Электромоторы вместо трансмиссий от паровой машины: светлые цеха, гибкая расстановка станков.'},
  parts:{name:'Взаимозаменяемые детали',max:1,lv:[{y:1908,name:'Калибры и допуски',hrs:0.75,F:4000,v:250,need:{tools:2},hist:[1908,'Cadillac']}],
    desc:'Любая деталь подходит к любой машине без подгонки напильником. В 1908 году Cadillac разобрал три машины, смешал детали и собрал снова — и получил за это приз Дьюара.'},
  line:{name:'Сборочная линия',max:2,lv:[{y:1901,name:'Поточная сборка на тележках',hrs:0.82,cap:1.25,F:1500,v:80,hist:[1901,'Olds']},{y:1913,name:'Движущийся конвейер',hrs:0.4,cap:2.0,F:15000,v:420,need:{parts:1,elec:1},hist:[1913,'Ford'],flex:1,y0:1913}],
    desc:'Машина едет к рабочему. Конвейер в разы ускоряет сборку, но каждая дополнительная модель на нём стоит эффективности.'},
  school:{name:'Школа мастеров',max:1,lv:[{y:1905,name:'Обучение рабочих',hrs:0.92,F:3000,v:0,pw:15}],desc:'Обученные рабочие меньше ошибаются и быстрее осваивают новые модели.'},
  qc:{name:'Контроль качества',max:3,lv:[{y:1900,name:'Отдел технического контроля',def:0.05,F:1500,v:30},{y:1908,name:'Испытательный стенд',def:0.03,F:6000,v:60},{y:1920,name:'Заводская лаборатория',def:0.015,F:20000,v:90}],
    desc:'Меньше брака — меньше гарантийных ремонтов и лучше репутация.'},
  foundry:{name:'Литейка и моторный цех',max:1,lv:[{y:1905,name:'Свои отливки и моторы',mat:0.82,F:20000,v:150,hist:[1917,'Ford River Rouge']}],desc:'Моторы делаются на заводе, а не покупаются у поставщика: мотор дешевле на 18%.'},
  press:{name:'Кузовной пресс',max:1,lv:[{y:1914,name:'Штампованный стальной кузов',hrs:0.88,mat:0.85,F:40000,v:260,hist:[1914,'Dodge / Budd']}],desc:'Кузов штампуют из стали, а не собирают из дерева: дешевле и прочнее.'},
  paint:{name:'Быстросохнущая эмаль',max:1,lv:[{y:1924,name:'Нитроэмаль вместо лака',hrs:0.93,cap:1.1,F:8000,v:120,hist:[1924,'General Motors (Duco)']}],desc:'Покраска за часы вместо недель: склады краски и сушильные цеха больше не нужны.'},
  credit:{name:'Продажа в кредит',max:1,lv:[{y:1919,name:'Своя кредитная компания',F:25000,v:0,dem:0.15,hist:[1919,'General Motors (GMAC)']}],desc:'Покупатель платит частями: спрос выше на 15%, но касса ждёт денег дольше.'}
};
const TECH_ORDER=['tools','elec','parts','line','school','qc','foundry','press','paint','credit'];
function techLv(s,k){return (s.tech&&s.tech[k])||0;}
function techNext(s,k){const d=TECH[k],l=techLv(s,k);return l<d.max?d.lv[l]:null;}
function techEarly(s){const l=s.rd?s.rd.lvl:1;return (l>=7?4:l>=5?3:l>=4?2:l>=3?1:0)+(bn('convEarly',0)?1:0);}
function techOpen(s,k){const nx=techNext(s,k);if(!nx)return false;if(nx.y>s.y+techEarly(s))return false;if(nx.need)for(const r in nx.need)if(techLv(s,r)<nx.need[r])return false;return true;}
function techCost(s,k){const nx=techNext(s,k);if(!nx)return 0;return Math.round((nx.F+nx.v*s.cap)*cpi(s)*(k==='line'&&techLv(s,k)===1?1/bn('lineCost'):1)/100)*100;}
function techMul(s,key){let m=1;for(const k in TECH){const l=techLv(s,k);for(let i=0;i<l;i++){const v=TECH[k].lv[i][key];if(v!==undefined)m*=v;}}return m;}
function defectRate(s){const l=techLv(s,'qc');return l?TECH.qc.lv[l-1].def:0.08;}
function hoursPerCar(md,s){const conv=techLv(s,'line')===2,act=(s.models||[]).filter(m=>m.status==='prod').length;
  // в Америке станков на рабочего больше: машина требует меньше часов
  return Math.max(60*complexity(md),4500*(s.country==='us'?0.75:1)*complexity(md)*techMul(s,'hrs')*(conv&&act>1?1+0.12*(act-1):1)*labLearn(md)*labRate(modelVol(md))*(md.ramp>0?1.5:1));}
function hoursPerWorker(s){return (s.y<1915?250:s.y<1921?235:215)*WAGE_POL[s.wagePol||'market'].prod*bn('workerEff')*(s.strikeNow?0.5:1);}
function capEff(s){return s.cap*techMul(s,'cap')*(s.shifts>1?1.85:1)*bn('lineCap');}
function capUnitCost(s){return Math.round(1500*cpi(s)*(1+0.12*techLv(s,'tools')+0.08*techLv(s,'elec'))*bn('lineCost'));}
function plantOverhead(s){return s.plantVal*0.009+30*cpi(s)*(1+s.workers/150);}
/* ---------- sales network ---------- */
// Дилер — независимый торговец в своём городе: покупает у завода машины со скидкой (16% цены), продаёт их,
// держит мастерскую и запчасти. Завод платит за разъездных агентов, вывеску, демонстрационную машину и выучку механика.
// Сколько городов нужно, чтобы вашу машину можно было купить по всей стране, — DEALER_NEED; в больших городах дилеров
// несколько, поэтому всего сеть не больше ~1,3 от этого числа. Лишних дилеров не бывает: им негде торговать.
// За границей всё начинается с импортёра, потом — своё отделение, потом — сборочный завод (так шёл Ford: агент
// Персиваль Перри в Англии 1904, отделение Ford of Britain 1909, сборка в Траффорд-парке 1911).
function dealerNeed(c,s){return tabAt(DEALER_NEED[c],yf(s));}
// Сколько машин в месяц продаёт новый дилер; большой — с продавцами, гаражом и складом — втрое-вчетверо больше
function dealerTP(s){return tabAt(DEALER_TP,yf(s));}
function dealerTPmax(s){return dealerTP(s)*3.5;}
// Представительство за границей: импортёр берёт свою долю и торгует только в больших городах;
// своё отделение — вся страна и никаких посредников; сборочный завод собирает машины из комплектов: пошлина и доставка меньше, машины «свои»
const IMP_LV=[{n:'Нет'},{n:'Импортёр',cut:0.08,cap:0.4,pen:0.3,ad:0.35},{n:'Своё отделение',cut:0,cap:1.3,pen:0.22,ad:0.5,cost:40000,up:600},
  {n:'Сборочный завод',cut:0,cap:1.3,pen:0.14,ad:0.6,cost:200000,up:3000,tar:0.8,ship:0.5,y:1904}];
function impLv(s,c){return c===s.country?9:(s.imp&&s.imp[c])||0;}
function impOf(s,c){return c===s.country?null:IMP_LV[impLv(s,c)||1];}
function impTar(s,c){const L=impOf(s,c);return L&&L.tar?L.tar:1;}
function impShip(s,c){const L=impOf(s,c);return L&&L.ship?L.ship:1;}
// Размер рынка страны (машин в год) — от него зависят цена отделения и завода
function impK(s,c){return clamp(Math.sqrt(((s.mkY&&s.mkY[c])||3000)/3000),1,12);}
function impCost(s,c,lv){if(lv===1)return Math.round(1000*cpi(s)/100)*100;return Math.round(IMP_LV[lv].cost*cpi(s)*impK(s,c)/1000)*1000;}
function impUpkeep(s,c){const L=impOf(s,c);return L&&L.up?L.up*cpi(s)*impK(s,c):0;}
// Сколько дилеров может быть в стране: дома — все города; у импортёра — только большие города
function dealerMax(s,c){const n=dealerNeed(c,s);if(c===s.country)return Math.ceil(n*1.3);const lv=impLv(s,c);return lv?Math.max(3,Math.ceil(n*IMP_LV[lv].cap)):0;}
function dealerRoom(s,c){return Math.max(0,dealerMax(s,c)-dealerCount(s,c));}
// Новый дилер: демонстрационная машина со скидкой, вывеска, запас запчастей, выучка механика
function dealerCost(s){return Math.round(560*cpi(s)*(1+T(s)*0.02));}
// Сколько машин в месяц продаёт один дилер: новичок — dealerTP; большой салон с продавцами, гаражом и запасом машин — больше
// (множитель s.dcap[c], растёт, когда вы вкладываетесь в салоны дилеров); дома — на 30% больше (завод рядом)
const DLR_MULT_MAX=3.5;
function dealerMult(s,c){return Math.max(1,(s.dcap&&s.dcap[c])||1);}
function dealerTPc(s,c){return dealerTP(s)*dealerMult(s,c)*(c===s.country?1.3:1);}
function dealerCapOf(s,c){return dealerCount(s,c)*dealerTPc(s,c);}
// Сколько дилеров ещё можно открыть, чтобы обслужить покупателей, ушедших ни с чем (не больше, чем осталось городов)
function dealersShort(s,c){const mk=s.last&&s.last.mk[c],tpc=dealerTPc(s,c),lost=(mk&&mk.lostDlr||0)-((s.dAdd&&s.dAdd[c])||0)*tpc;return lost>0.5?Math.min(dealerRoom(s,c),Math.ceil(lost/tpc)):0;}
// Салоны побольше: +25% продаж на каждого дилера (продавцы, гараж, запас машин в кредит) — когда городов уже не осталось
function dealerGrowCost(s,c){return Math.round(dealerCount(s,c)*0.25*dealerCost(s)/10)*10;}
function dealerGrowOk(s,c){return dealerCount(s,c)>0&&dealerMult(s,c)<DLR_MULT_MAX;}
function dealerGrow(s,c){if(!dealerGrowOk(s,c))return false;const cost=dealerGrowCost(s,c);if(s.cash<cost)return false;s.cash-=cost;s.dcap=s.dcap||{};
  const was=dealerCapOf(s,c);s.dcap[c]=+Math.min(DLR_MULT_MAX,dealerMult(s,c)+0.25).toFixed(3);s.dAdd=s.dAdd||{};s.dAdd[c]=(s.dAdd[c]||0)+(dealerCapOf(s,c)-was)/dealerTPc(s,c);
  (s.models||[]).forEach(m=>{if(m.status==='prod'&&(m.lostD||0)>0.2&&(m.dlrK??1)<1)m.dlrK=Math.min(1,m.dlrK*1.2);});
  const where=c!==s.country?' ('+COUNTRIES[c].name+')':'';addLog(`Дилеры${where} расширили салоны: сеть продаёт до ${fmtN(dealerCapOf(s,c))} машин в месяц (было ${fmtN(was)}).`,'good');
  pendingToasts.push(`🏪 Салоны дилеров${where}: до ${fmtN(dealerCapOf(s,c))} машин в месяц`);return true;}
// Сколько раз расширить салоны, чтобы обслужить всех ушедших покупателей
function dealerGrowSteps(s,c){const mk=s.last&&s.last.mk[c],d=dealerCount(s,c),lost=(mk&&mk.lostDlr||0)-((s.dAdd&&s.dAdd[c])||0)*dealerTPc(s,c);if(lost<=0.5||!d)return 0;
  return Math.min(Math.ceil((DLR_MULT_MAX-dealerMult(s,c))/0.25-1e-9),Math.ceil(lost/(d*0.25*dealerTP(s)*(c===s.country?1.3:1))));}
// Открыть дилеров в новых городах: деньги, журнал и сразу поправка прогноза — завод сделает машины и для новых дилеров
function buyDealers(s,c,n){const dc=dealerCost(s);n=Math.min(Math.floor(n),Math.floor(s.cash/dc),dealerRoom(s,c));if(n<1)return 0;
  const was=dealerCount(s,c),r0=reachOf(s,c),k=was>0?(was+n)/was:2;s.cash-=n*dc;s.dealers[c]=was+n;s.dAdd=s.dAdd||{};s.dAdd[c]=(s.dAdd[c]||0)+n;const r1=reachOf(s,c);
  (s.models||[]).forEach(m=>{if(m.status==='prod'&&(m.lostD||0)>0.2&&(m.dlrK??1)<1)m.dlrK=Math.min(1,m.dlrK*k);});
  const where=c!==s.country?' ('+COUNTRIES[c].name+')':'';
  addLog(`Открыто ${fmtN(n)} ${plural(n,'дилер','дилера','дилеров')} в новых городах${where}: ваши машины теперь видят ${Math.round(r1*100)}% покупателей${r1>r0+0.005?` (было ${Math.round(r0*100)}%)`:''}.`,'good');
  pendingToasts.push(`🏪 +${fmtN(n)} ${plural(n,'дилер','дилера','дилеров')}${where}: покупателей видят ${Math.round(r1*100)}%`);
  return n;}
// Представительство за границей: договор с импортёром → своё отделение → сборочный завод
function impUp(s,c){const lv=impLv(s,c);if(c===s.country||lv>=3)return false;const L=IMP_LV[lv+1],cost=impCost(s,c,lv+1);
  if(s.cash<cost||(L.y&&s.y<L.y))return false;s.cash-=cost;s.imp=s.imp||{};s.imp[c]=lv+1;const C=COUNTRIES[c];
  if(lv+1===1){s.dealers[c]=Math.max(dealerCount(s,c),2);addLog(`${C.name}: подписан договор с импортёром. Он берёт ${Math.round(IMP_LV[1].cut*100)}% цены и продаёт ваши машины через агентов в больших городах.`,'good');pendingToasts.push('🤝 Импортёр: '+C.name);}
  else if(lv+1===2){s.plantVal+=cost*0.3;addLog(`${C.name}: открыто своё отделение «${s.company}». Посредник больше не берёт свою долю, дилеров можно открыть по всей стране.`,'good');pendingToasts.push('🏢 Отделение: '+C.name);}
  else{s.plantVal+=cost*0.6;addLog(`${C.name}: сборочный завод собирает машины из комплектов. Пошлина за комплекты ниже, доставка дешевле, а покупатели считают машины своими.`,'good');pendingToasts.push('🏭 Сборочный завод: '+C.name);}
  return true;}
// Во сколько месяцев окупится следующий шаг за границей: отделение возвращает долю импортёра и открывает всю страну,
// сборочный завод снижает пошлину (машины дешевле для покупателя) и доставку
function impPayback(s,c){const lv=impLv(s,c);if(lv<1||lv>=3||(IMP_LV[lv+1].y&&s.y<IMP_LV[lv+1].y))return Infinity;const sold=(s.dsm&&s.dsm[c])||0;if(sold<1)return Infinity;
  const act=(s.models||[]).filter(m=>m.status==='prod');if(!act.length)return Infinity;const P=act.reduce((a,m)=>a+m.price,0)/act.length;
  const cost=impCost(s,c,lv+1),up=impUpkeep({...s,imp:{...(s.imp||{}),[c]:lv+1}},c);
  const gain=lv===1?sold*P*IMP_LV[1].cut*1.3:sold*(P*tariffAt(c,s)*(1-IMP_LV[3].tar)*0.6+shipCost(s)*(1-IMP_LV[3].ship));
  return gain>up?cost/(gain-up):Infinity;}
function dealerUpkeep(s,c){return 22*cpi(s)*(c?dealerMult(s,c):1);}
function dealerCount(s,c){return (s.dealers&&s.dealers[c])||0;}
function tariffAt(c,s){return tabAt(TARIFF[c],yf(s));}
function shipCost(s){return 60*cpi(s);}
// Сеть живёт сама: когда покупателей больше, чем успевают обслужить, дилеры понемногу нанимают продавцов сами (до +25%);
// дома к марке, которая хорошо продаётся, новые города просятся сами (за границей сеть растит импортёр или ваше отделение)
function dealersMonth(s,r){s.dcap=s.dcap||{};s.dsm=s.dsm||{};s.dAdd={};
  for(const c in s.dealers){const d=dealerCount(s,c);if(!d)continue;const mk=r.mk[c]||{},sold=mk.sold||0,lost=mk.lostDlr||0,k=dealerMult(s,c);
    if(lost>0.5&&k<1.25)s.dcap[c]=+Math.min(1.25,k*1.01).toFixed(3);
    const sm=s.dsm[c]=s.dsm[c]===undefined?sold:s.dsm[c]*0.75+sold*0.25,spd=sm/d,v=tabAt({1895:0.25,1905:0.4,1913:0.8,1920:1.2,1929:1.5},yf(s)),room=dealerRoom(s,c);
    if(c===s.country&&mi(s)>=12&&room>0&&spd>3*v&&(s.models||[]).some(m=>m.status==='prod')){const n=Math.max(1,Math.round(room*0.01));s.dealers[c]=d+n;
      if(mi(s)-(s.dlrSaid||-99)>=12){s.dlrSaid=mi(s);addLog(`Торговцы сами просятся в дилеры: ${fmtN(n)} ${plural(n,'новый город','новых города','новых городов')}${c!==s.country?' ('+COUNTRIES[c].name+')':''}. Марка, которая хорошо продаётся, нужна всем.`,'good');}}}}
/* ---------- finance ---------- */
function stockValue(s){return s.models.reduce((a,m)=>a+m.stock*matCost(m,s),0);}
function companyValue(s){const pr=(s.hist.profit||[]).slice(-12),avg=pr.length?pr.reduce((a,b)=>a+b,0)/pr.length:0;return s.cash-s.loan+s.plantVal+stockValue(s)+Math.max(0,avg*12*7);}
function maxLoan(s){return Math.round((0.6*(s.plantVal+stockValue(s))+15000*cpi(s))/1000)*1000;}
function devCost(md,s){s=s||G;return Math.round((1500+designEffort(md)*35)*cpi(s)*(1+T(s)*0.03)*bn('devCost')/100)*100;}
function devMonths(md){return Math.max(1,Math.round((2+Math.ceil(designEffort(md)/32))*bn('devTime')));}
function toolingCost(md,s){return Math.round((800+300*complexity(md))*cpi(s)*(techLv(s,'line')===2?4:techLv(s,'tools')>=2?2:1)/100)*100;}
function qLabel(r){return r<0.85?['Хуже соперников','bad']:r<1.08?['Как у соперников','warn']:['Лучше соперников','good'];}
function totalSold(s){return s.models.reduce((a,m)=>a+m.totalSold,0);}
function addLog(text,kind=''){G.log.push({d:dstr(G),text,kind});if(G.log.length>400)G.log.shift();}
function hostName(c){return c==='intl'?'Международная':(COUNTRIES[c]?COUNTRIES[c].name:({be:'Бельгия',es:'Испания',mc:'Монако',at:'Австрия',ch:'Швейцария'}[c]||c));}
const fmtN=n=>{n=Math.round(n);return Math.abs(n)>=1e6?(n/1e6).toFixed(n>=1e7?1:2).replace('.',',')+' млн':Math.abs(n)>=1e4?Math.round(n/1000)+' тыс.':n.toLocaleString('ru-RU');};
function lastOf(arr,y,f){const a=arr.filter(x=>x.y<=y&&(!f||f(x)));return a[a.length-1];}
function newGame(pioneer,country,company,diff,firstName){
  const C=COUNTRIES[country];
  const comps={};for(const k in COMPS)comps[k]=COMPS[k].map((a,i)=>({name:a.n,color:COMP_COLORS[i%COMP_COLORS.length],last:0,yr:0,prev:0}));
  const mname=(firstName||'').trim()||'Тип 1';
  G={v:8,diff:diff||'normal',rd:{lvl:1,projs:[],upg:{},early:[]},drivers:[],contracts:{},pioneer,y:1895,m:0,country,company:company||PIONEERS[pioneer].co,cash:0,loan:0,
     cap:3,capBuild:[],plantVal:0,shifts:1,workers:12,staffAuto:true,wagePol:'market',tech:{},techBuild:null,dealers:{[country]:1},imp:{},dcap:{},ad:30,rep:30,wh:12,whBuild:[],
     military:false,strikeNext:false,supplyNext:1,nextId:2,comps,pw:{},rv:{},orders:[],tenders:[],shows:{},showFx:{},medals:[],raceDone:{},raceLog:[],season:{},cres:{},rdept:0,titles:[],ach:{},firsts:{},papers:[],ui:{},
     models:[{id:1,name:mname,e:'e1',g:'g2',c:'c1',k:'k1',b:'b1',t:'t1',w:'w2',paint:'#1b1d22',price:1000,plan:'auto',status:'prod',devLeft:0,launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0}],
     hist:{cash:[],sales:[],market:[],profit:[],share:[]},peak:{year:0,share:{}},yearSold:0,last:null,log:[],pending:[],seen:{},over:false};
  if(DIF().helper)G.helper={on:1};
  G.plantVal=G.cap*capUnitCost(G);
  G.cash=Math.round(C.cash*bn('cash')*DIF().cash);G.rep=bn('rep',30);
  const md=G.models[0];md.price=Math.round(refPrice(md,G)/10)*10;
  G.dealers[country]=Math.max(1,Math.round(dealerNeed(country,G)/3));
  G.fleet={};G.mkY={};for(const c in COUNTRIES){G.fleet[c]=fleetHist(c,1895);const R=mkCountry(c,G,[]);G.mkY[c]=SEGK.reduce((a,g)=>a+R.segs[g].inc,0)*12/SEASON[0];}
  const P=PIONEERS[pioneer];
  addLog(`${P.name==='Свой персонаж'?'Вы основали':P.name+' основал'} компанию «${G.company}», ${C.city}. В мастерской ${G.workers} рабочих, первая модель — «${mname}», дилеров — ${G.dealers[country]}.`,'hist');
  if(country==='uk')addLog('По закону перед автомобилем должен идти человек с красным флагом. Продажи пока скромные.','hist');
  if(country==='us')addLog('Богатых семей в Америке много, но дороги плохи и машины пока в диковинку. Во Франции они уже в моде — там стоит найти импортёра.','hist');
  if(country==='it')addLog('Богатых семей в Италии немного, и свой рынок крошечный. Покупателей в разы больше во Франции и Германии — найдите там импортёров.','hist');
}
