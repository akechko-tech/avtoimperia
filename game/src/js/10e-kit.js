/* ================= 0.30: ОСНАЩЕНИЕ КБ И ГОНОЧНОЙ КОМАНДЫ =================
   Кроме размера бюро и уровня гоночного отдела — оборудование, которое появляется вместе с техникой эпохи.
   Покупается один раз, дальше — содержание каждый месяц (идёт в расходы КБ и команды).
   КБ: стенд для моторов, лаборатория металлов, электролаборатория, испытательный трек, аэродинамическая труба,
   рентген отливок, полигон. Ускоряют проекты своего профиля и улучшают ВСЕ ваши машины (надёжность, вес рамы, обтекаемость).
   Команда: склады на трассе, грузовик-мастерская, колесо Stepney, разведка трассы, сигнальщики, быстрая заправка, бензол,
   домкраты, транспортёр. Действуют в гонке на все машины команды — и когда вы за рулём, и в быстром итоге. */
const KIT={
  kb:[
    {id:'dyno',name:'Тормозной стенд для моторов',y:1898,c:900,up:15,eff:{rd:{e:1.25},rel:1.01},txt:'Проекты мотора на 25% быстрее, моторы чуть надёжнее',note:'Мотор крутит тормоз Прони: видно настоящую мощность и где он перегревается.'},
    {id:'lab',name:'Лаборатория металлов',y:1904,c:2000,up:30,eff:{rd:{c:1.2,k:1.2,g:1.15},cKg:0.96},txt:'Рамы, тормоза и коробки — проекты на 15–20% быстрее, рама на 4% легче',note:'Стали рвут и гнут на машинах-испытателях; в 1907 году Форд перешёл на ванадиевую сталь.'},
    {id:'elab',name:'Электротехническая лаборатория',y:1909,c:2500,up:35,eff:{rd:{eq:1.5}},txt:'Стартер, электросвет и другие новинки оснащения разрабатываются в полтора раза быстрее',note:'Электрический стартер Чарльз Кеттеринг сделал для Cadillac в 1911 году.'},
    {id:'track',name:'Испытательный трек',y:1909,lv:4,c:9000,up:90,eff:{rel:1.03,dev:0.9},txt:'Все ваши машины надёжнее на 3%, новая модель готова на 10% быстрее',note:'Индианаполис в 1909 году строили как полигон для автопрома; Брукленд открылся в 1907-м.'},
    {id:'tunnel',name:'Аэродинамическая труба',y:1920,lv:5,c:12000,up:110,eff:{cd:0.93},txt:'Сопротивление воздуха у ваших машин на 7% меньше: быстрее и экономичнее',note:'Пауль Ярай продувал модели в трубе цеппелинов; каплевидный Rumpler показали в 1921 году.'},
    {id:'xray',name:'Рентген отливок',y:1922,lv:5,c:6000,up:60,eff:{rel:1.015,rd:{e:1.1}},txt:'Раковины в блоках видно до сборки: надёжность +1,5%, проекты мотора на 10% быстрее',note:'Промышленная рентгенография отливок пришла на заводы в начале 1920-х.'},
    {id:'proving',name:'Полигон: булыжник, грязь, подъёмы',y:1924,lv:6,c:25000,up:200,eff:{rel:1.02,dev:0.9},txt:'Надёжность ещё +2%, новая модель — ещё на 10% быстрее',note:'В 1924 году General Motors открыла полигон в Милфорде.'}],
  team:[
    {id:'depot',name:'Склады на трассе: шины и бензин',y:1899,c:400,up:8,eff:{fuel:0.6,wheel:0.85},txt:'Заправка у обочины на 40% быстрее, смена колеса на 15%',note:'В больших пробегах команды заранее развозили по городам шины, бензин и воду.'},
    {id:'van',name:'Грузовик-мастерская',y:1903,c:900,up:15,eff:{fix:0.75},txt:'Ремонт после поломки на четверть быстрее',note:'Механики с верстаком и запчастями ждут на контрольных пунктах и у боксов.'},
    {id:'stepney',name:'Запасное колесо Stepney',y:1904,c:300,up:5,eff:{spare:1,wheel:0.85},txt:'+1 запасное колесо в машине, прокол обходится быстрее',note:'Обод с накачанной шиной крепят прямо поверх спущенной — придумано в Уэльсе в 1904 году.'},
    {id:'recon',name:'Разведка трассы',y:1907,c:700,up:20,eff:{sk:0.015},txt:'Пилоты знают каждый поворот: мастерство +1,5, штурман подсказывает точнее',note:'Перед Гран-при 1914 года Mercedes неделями изучал трассу под Лионом.'},
    {id:'signal',name:'Сигнальные щиты и хронометристы',y:1912,c:600,up:12,eff:{trel:1.02},txt:'Пилот знает отрыв и не гонит машину зря: поломок меньше',note:'Mercedes в 1914 году вёл гонку по сигналам из боксов — и привёз три машины на подиум.'},
    {id:'fuel',name:'Быстрая заправка',y:1912,c:450,up:6,eff:{pfuel:0.6},txt:'Заправка в боксах на 40% быстрее',note:'Бидоны с широкой горловиной и воронки с сеткой.'},
    {id:'benz',name:'Гоночное топливо: бензол',y:1912,c:1500,up:40,eff:{pw:1.03},txt:'Мощность гоночных машин +3%',note:'Смесь бензина с бензолом не детонирует при высоком сжатии.'},
    {id:'jack',name:'Быстрые домкраты',y:1922,lv:2,c:600,up:6,eff:{pit:0.8},txt:'Пит-стоп и смена колёс на 20% короче',note:'Механики Bentley в Ле-Мане поднимали машину рычажным домкратом за секунды.'},
    {id:'truck',name:'Транспортёр для гоночных машин',y:1922,lv:2,c:3000,up:40,eff:{trel:1.02,prep:0.85},txt:'Машину везут на старт, а не гонят своим ходом: поломок меньше, подготовка на 15% дешевле',note:'До 1920-х гоночные машины добирались на старт своим ходом.'}]};
const KIT_BY={};KIT.kb.forEach(k=>{k.g='kb';KIT_BY[k.id]=k;});KIT.team.forEach(k=>{k.g='team';KIT_BY[k.id]=k;});
function kitHas(s,id){return !!(s&&s.kit&&s.kit[id]);}
function kitOwned(s,g){return s&&s.kit?KIT[g].filter(k=>s.kit[k.id]):[];}
// произведение множителей (k — ключ эффекта) по всему купленному оснащению
function kitK(s,key){if(!s||!s.kit)return 1;let v=1;for(const id in s.kit){const k=KIT_BY[id];if(k&&typeof k.eff[key]==='number'&&key!=='spare'&&key!=='sk')v*=k.eff[key];}return v;}
function kitAdd(s,key){if(!s||!s.kit)return 0;let v=0;for(const id in s.kit){const k=KIT_BY[id];if(k&&k.eff[key])v+=k.eff[key];}return v;}
function kitRdK(s,pj){if(!s||!s.kit||!pj)return 1;const ck=pj.kind==='eq'?'eq':pj.ck;if(!ck)return 1;let v=1;for(const id in s.kit){const k=KIT_BY[id];if(k&&k.eff.rd&&k.eff.rd[ck])v*=k.eff.rd[ck];}return v;}
// подпись оснащения, меняющего машины: для кэша черт машины
function kitCarSig(s){if(!s||!s.kit)return '';let o='';for(const id of ['dyno','lab','track','tunnel','xray','proving'])if(s.kit[id])o+=id[0]+id[1];return o;}
function kitSig(s){return s&&s.kit?Object.keys(s.kit).sort().join(','):'';}
// машины игрока (не соперники и не эталоны рынка): надёжность, вес рамы, обтекаемость
function kitCarK(md){const s=typeof G!=='undefined'?G:null;if(!s||!s.kit||!md||md.ai||md.ref)return null;
  const rel=kitK(s,'rel'),cKg=kitK(s,'cKg'),cd=kitK(s,'cd');return rel===1&&cKg===1&&cd===1?null:{rel,cKg,cd};}
function kitCost(s,k){return Math.round(k.c*cpi(s)/50)*50;}
function kitUp(s,k){return Math.round(k.up*cpi(s));}
function kitUpkeep(s,g){return kitOwned(s,g).reduce((a,k)=>a+kitUp(s,k),0);}
function kitNeed(s,k){if(k.g==='kb')return k.lv&&s.rd.lvl<k.lv?`Нужно бюро ${k.lv}-го уровня («${RD_LV[k.lv]}»)`:'';
  const lv=k.lv||1;return (s.rdept||0)<lv?`Нужен гоночный отдел: «${RDEPT[lv].name}»`:'';}
function kitBuy(s,id){const k=KIT_BY[id];if(!k||kitHas(s,id)||k.y>s.y||kitNeed(s,k))return false;const c=kitCost(s,k);if(s.cash<c)return false;
  s.cash-=c;s.plantVal=(s.plantVal||0)+c*0.4;s.kit=s.kit||{};s.kit[id]=mi(s);
  addLog(`${k.g==='kb'?'Конструкторское бюро':'Гоночная команда'}: ${k.name} (${money(c)}). ${k.txt}.`,'good');
  try{if(typeof managerPlan==='function'&&managerPlan.c)managerPlan.c.clear();}catch(_){}
  if(k.g==='team')(s.drivers||[]).forEach(d=>{try{moodAdd(s,d,3,'Команда лучше оснащена');}catch(_){}});
  return true;}
// гоночная машина команды: заправка, ремонт, колёса, запаска (после wearSetup — там считаются колёса и запасные)
function kitRaceCar(s,c){if(!s||!s.kit||s.mode==='racer')return;
  c.fuelK=kitK(s,'fuel');c.pfuelK=kitK(s,'pfuel');c.fixK=kitK(s,'fix');
  const w=kitK(s,'wheel');if(w!==1&&c.wheelChange)c.wheelChange*=w;
  const sp=kitAdd(s,'spare');if(sp&&typeof c.spares==='number'){c.spares+=sp;c.spare0=(c.spare0||0)+sp;}}
// блок «Оснащение» в карточке КБ и команды: купленное, доступное сейчас, следующее по эпохе
function kitHTML(s,g){if(!s||s.mode==='racer')return '';const L=KIT[g],own=kitOwned(s,g),now=L.filter(k=>!kitHas(s,k.id)&&k.y<=s.y),next=L.find(k=>!kitHas(s,k.id)&&k.y>s.y);
  if(!own.length&&!now.length&&!next)return '';
  return `<div class="label" style="margin-top:14px">${g==='kb'?'Оснащение бюро':'Оснащение команды'}${own.length?` · ${own.length} из ${L.length}`:''}</div>`+
    (own.length?`<div class="kit-own">${own.map(k=>`<div>✓ <b>${esc(k.name)}</b> — ${esc(k.txt.charAt(0).toLowerCase()+k.txt.slice(1))}</div>`).join('')}<div class="muted">Содержание оснащения ${money(kitUpkeep(s,g))} в месяц.</div></div>`:'')+
    (()=>{const op=typeof isOpen==='function'?isOpen('kit'+g,false):true,L2=op?now:now.slice(0,2);return L2;})().map(k=>{const c=kitCost(s,k),n=kitNeed(s,k);return `<div class="kit-row"><div><h3>${esc(k.name)}</h3><p class="small">${esc(k.txt)}.</p><p class="small muted">${esc(k.note)} Содержание ${money(kitUp(s,k))} в месяц.</p>${n?`<p class="small warn">${esc(n)}.</p>`:''}</div><button class="btn sm" data-act="kitBuy" data-k="${k.id}" ${n||s.cash<c?'disabled':''}>${money(c)}</button></div>`;}).join('')+
    (now.length>2?`<button class="btn sm" style="margin-top:6px" data-act="fold" data-k="kit${g}" data-def="0">${typeof isOpen==='function'&&isOpen('kit'+g,false)?'Свернуть ▴':'Ещё '+(now.length-2)+' ▾'}</button>`:'')+
    (next?`<p class="small muted" style="margin-top:6px">Дальше по эпохе: ${esc(next.name)} — с ${next.y} года.</p>`:'');}
