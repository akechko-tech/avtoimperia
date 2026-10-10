/* ================= 0.30: ОСНАЩЕНИЕ — СТАРТЕР, ЭЛЕКТРИЧЕСКИЕ ФАРЫ И ДРУГИЕ НОВИНКИ ЭПОХИ =================
   Кроме деталей (мотор, рама, кузов) машины эпохи отличались оснащением: ветровым стеклом, фарами, спидометром, клаксоном,
   а с 1912 года — системой Delco Чарльза Кеттеринга: электростартером и электрическим светом (первым — у Cadillac; «Кадиллак»
   получил за это второй кубок Дьюара). Новинку можно разработать в КБ (раньше истории — первенство в зачёт наследия) или
   подождать, пока её начнут продавать поставщики (через год после первой машины с ней). Пока новинка редкость — покупатели
   доплачивают за неё; когда она есть у всех, машина без неё проигрывает: к 1916 году люкс без стартера почти не продаётся,
   к 1920-му — средний класс, к середине 1920-х — и народный (Ford поставил стартер на Model T в 1919 году). */
// c — цена комплекта в долларах 1900 года; u — прибавка к привлекательности по классам; need — с какого года её ждут в классе;
// cx — сложность сборки; req — нужна другая новинка; sup — заменяет более старую
const EQUIP=[
  {id:'ws',name:'Ветровое стекло',y:1903,hist:[1904,'английские кузовщики'],c:14,cx:0.02,u:{people:0.05,middle:0.09,lux:0.11},need:{lux:1908,middle:1911,people:1915},
    note:'Стекло перед водителем: ни пыли, ни ветра в лицо. С 1904 года — у дорогих машин, к 1911-му — почти у всех.'},
  {id:'ac',name:'Ацетиленовые фары',y:1902,hist:[1904,'Blériot'],c:20,cx:0.02,u:{people:0.05,middle:0.08,lux:0.1,sport:0.06},need:{lux:1906,middle:1909,people:1912},
    note:'Газовые фары-прожекторы вместо каретных масляных фонарей: ночью видно дорогу на сотню шагов. Баллон с карбидом — на подножке.'},
  {id:'sp',name:'Спидометр',y:1902,hist:[1903,'Warner (Auto-Meter)'],c:12,cx:0.01,u:{people:0.02,middle:0.04,lux:0.06,sport:0.08},need:{lux:1912,middle:1918},
    note:'Стрелка показывает скорость и пройденные мили: штрафы за превышение скорости вводят по всей Европе и Америке.'},
  {id:'kl',name:'Электрический клаксон',y:1907,hist:[1908,'Lovell-McConnell (Klaxon)'],c:8,cx:0.01,u:{people:0.03,middle:0.04,lux:0.04,sport:0.04},need:{lux:1914,middle:1917},
    note:'«А-у-уга!» — электрический рожок Klaxon слышен за полверсты; груша с резиновым баллоном остаётся в прошлом.'},
  {id:'el',name:'Электрическое освещение',y:1910,hist:[1912,'Cadillac (система Delco)'],c:45,cx:0.05,u:{people:0.09,middle:0.15,lux:0.2,sport:0.09},need:{lux:1915,middle:1918,people:1922},sup:'ac',
    note:'Динамо-машина, аккумулятор и электрические фары: свет включается кнопкой, без возни с карбидом. Delco Кеттеринга, 1912 год.'},
  {id:'st',name:'Электростартер',y:1910,hist:[1912,'Cadillac (Чарльз Кеттеринг, Delco)'],c:55,cx:0.06,u:{people:0.12,middle:0.22,lux:0.3,sport:0.05},need:{lux:1916,middle:1920,people:1925},req:'el',
    note:'Мотор заводится кнопкой — без заводной ручки, которая ломала руки (так в 1908 году погиб друг Генри Лиланда). Машину стали покупать женщины.'},
  {id:'wp',name:'Стеклоочиститель',y:1915,hist:[1917,'ручной; с 1922 года — вакуумный Trico'],c:6,cx:0.01,u:{people:0.03,middle:0.05,lux:0.06},need:{lux:1923,middle:1926},req:'ws',
    note:'Щётка по стеклу — сначала рукой, с 1922 года сама, от разрежения в моторе: в дождь видно дорогу.'},
  {id:'tr',name:'Указатели поворота',y:1923,hist:[1925,'Bosch (флажки-«семафоры»)'],c:10,cx:0.01,u:{people:0.02,middle:0.04,lux:0.05}},
  {id:'ht',name:'Отопитель салона',y:1924,hist:[1926,'Ford (обогрев от выпускной трубы)'],c:12,cx:0.02,u:{people:0.04,middle:0.06,lux:0.08},closed:1,
    note:'Тёплый воздух от мотора — в закрытом кузове: машина становится круглогодичной.'}];
const EQ_BY={};EQUIP.forEach(e=>EQ_BY[e.id]=e);
// доступна ли новинка: разработана своим КБ или её продают поставщики (через год после первой машины в истории)
function eqDev(s,id){return !!(s&&s.rd&&s.rd.eq&&s.rd.eq[id]);}
function eqAvail(s,id){const e=EQ_BY[id];return !!e&&(eqDev(s,id)||s.y>=e.hist[0]+1);}
function eqOf(md){return Array.isArray(md&&md.eq)?md.eq.filter(id=>EQ_BY[id]):[];}
function eqHas(md,id){return eqOf(md).includes(id);}
function eqCost(md,s){return eqOf(md).reduce((a,id)=>a+EQ_BY[id].c,0)*cpi(s);}
function eqCx(md){return eqOf(md).reduce((a,id)=>a*(1+EQ_BY[id].cx),1);}
// покупатели: пока новинка редкость — прибавка; через 4 года после «ждут» прибавки нет, а без неё машину не берут
function eqWait(e,g,y){const n=e.need&&e.need[g];return n?clamp((y-n)/4,0,1):0;}
function eqU(md,g,s){if(g==='truck'||isTruck(md))return 0;const y=yf(s),L=eqOf(md);let u=0;
  EQUIP.forEach(e=>{const has=L.includes(e.id),sup=!has&&L.some(id=>EQ_BY[id].sup===e.id),w=eqWait(e,g,y),uu=(e.u[g]||0)*(e.closed&&!parts(md).b.closed?0.3:1);
    if(has)u+=uu*(1-w);else if(!sup)u-=uu*1.4*w;});
  return clamp(u,-1.2,0.55);}
// какие новинки покупатели этого класса уже ждут
function eqExpected(g,y){return EQUIP.filter(e=>eqWait(e,g,y)>0.25);}
// разумный набор для машины класса (помощник и боты): всё, что ждут, и то, что окупается (прибавка больше цены)
function eqAuto(md,g,s){if(g==='truck'||isTruck(md))return [];const y=yf(s),P=prefP(g,s.country,s),out=[];
  EQUIP.forEach(e=>{if(!eqAvail(s,e.id))return;if(e.req&&!eqAvail(s,e.req))return;const u=e.u[g]||0;if(!u)return;
    const want=eqWait(e,g,y)>0||u*P*0.6>e.c*cpi(s)*1.4;if(want)out.push(e.id);});
  EQUIP.forEach(e=>{if(e.req&&out.includes(e.id)&&!out.includes(e.req))out.push(e.req);if(e.sup&&out.includes(e.id)){const k=out.indexOf(e.sup);if(k>=0)out.splice(k,1);}});
  return out;}
// проекты КБ: новинку можно сделать раньше поставщиков (за 2–3 года до истории)
function eqProjects(s){const busy=new Set(rdActive(s).map(p=>p.kind+':'+p.id)),out=[];
  EQUIP.forEach(e=>{if(eqDev(s,e.id)||s.y>=e.hist[0]+1||s.y<e.y-1||busy.has('eq:'+e.id))return;if(e.req&&!eqAvail(s,e.req)&&!busy.has('eq:'+e.req)&&!(e.req==='el'&&e.id==='st'))return;
    const yrs=Math.max(1,e.hist[0]+1-s.y);out.push({kind:'eq',id:e.id,cat:'Оснащение',ck:'eq',name:e.name,need:14+5*yrs,yrs});});
  return out;}
function eqCostRD(pj,s){const e=EQ_BY[pj.id],era=Math.min(1,0.25+0.05*Math.max(0,yf(s)-1895));return Math.max(100,Math.round(((80+25*(pj.need||12))*cpi(s)*(1+0.03*T(s))*bn('rdCost')+(e?e.c:30)*cpi(s)*40)*era/50)*50);}
function eqDone(s,pj){const e=EQ_BY[pj.id];if(!e)return;s.rd.eq=s.rd.eq||{};s.rd.eq[e.id]=1;
  addLog(`КБ сделало новинку: ${e.name}${s.y<e.hist[0]?` — на ${e.hist[0]-s.y} ${plural(e.hist[0]-s.y,'год','года','лет')} раньше, чем ${e.hist[1]}`:''}. Поставьте её на новую модель в конструкторе («Новинки»).`,'good');
  pendingToasts.push('🔬 Новинка: '+e.name);}
// первенство: машина с новинкой пошла в серию раньше истории
function eqFirsts(md){const s=G;eqOf(md).forEach(id=>{const e=EQ_BY[id];if(e&&s.y<e.hist[0]&&eqDev(s,id))recordFirst(s,'eq:'+id,e.name,e.hist[0],e.hist[1]);});}
// старые сохранения: у люкса после 1912 года — электросвет и стартер (так было написано в оснащении), у остальных — по году выпуска
function eqMigrate(x){(x.models||[]).forEach(m=>{if(Array.isArray(m.eq))return;const y=1895+Math.floor((m.launched||0)/12),L=[];
  if(m.t==='t2'||m.t==='t1'){if(y>=1904)L.push('ws');L.push(y>=1912&&m.t==='t2'?'el':y>=1905?'ac':null);if(y>=1912&&m.t==='t2')L.push('st');}
  m.eq=L.filter(Boolean);});}
function eqLine(md){const L=eqOf(md);return L.length?L.map(id=>EQ_BY[id].name.toLowerCase()).join(', '):'';}
