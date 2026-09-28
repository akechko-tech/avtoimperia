/* ================= EVENTS ================= */
const HIST=[
  {y:1896,m:10,c:'uk',img:'Red flag traffic laws',title:'Флажок больше не нужен',deck:'Парламент отменил «закон о красном флаге»',text:'Автомобилям больше не нужен пешеход с флажком впереди, а скорость разрешили поднять до 14 миль в час. Британский рынок оживает; в честь события автомобилисты устроили пробег из Лондона в Брайтон.'},
  {y:1900,m:0,title:'Грузовики выходят на улицы',deck:'Торговцы и почта хотят фургоны',text:'Лавочники, пивовары и почтовые ведомства присматриваются к моторным фургонам. В конструкторе появился грузовой кузов — это новый сегмент рынка.'},
  {y:1901,m:2,img:'Mercedes 35 hp',title:'«Мерседес» задаёт новую планку',deck:'Низкая рама, сотовый радиатор, 35 сил',text:'Машина, построенная Вильгельмом Майбахом по заказу Эмиля Еллинека, выиграла гонки в Ницце. Лёгкая, низкая и мощная, она похожа скорее на автомобиль будущего, чем на карету без лошади. Покупатели ждут того же от всех марок.'},
  {y:1908,m:9,img:'Ford Model T',title:'Автомобиль для всех',deck:'Генри Форд представил Model T',text:'Простая, прочная и дешёвая машина обещает сделать автомобиль доступным фермеру и рабочему. Цены по всему миру начинают падать, в народном сегменте появляются массовые марки.'},
  {y:1913,m:9,img:'Highland Park Ford Plant',title:'Движущийся конвейер',deck:'В Хайленд-Парке сборка шасси ускорилась в разы',text:'Машина едет к рабочему, а не рабочий к машине. Время сборки шасси сократилось с двенадцати часов до полутора. На вкладке «Завод» доступна модернизация.'},
  {y:1914,m:7,c:'!us,it',title:'Война!',deck:'Мобилизация объявлена по всей Европе',text:'Спрос на легковые машины рухнул, армии нужны грузовики. Военное ведомство предлагает контракт: 40% мощностей по себестоимости плюс 35%.',choices:[['Принять военный заказ','mil'],['Отказаться','ok']]},
  {y:1915,m:4,c:'it',title:'Италия вступает в войну',deck:'Королевство объявило войну Австро-Венгрии',text:'Спрос на легковые машины рухнул, армии нужны грузовики. Военное ведомство предлагает контракт: 40% мощностей по себестоимости плюс 35%.',choices:[['Принять военный заказ','mil'],['Отказаться','ok']]},
  {y:1917,m:3,c:'us',title:'США вступают в войну',deck:'Конгресс объявил войну Германии',text:'Спрос на легковые машины упал вдвое. Армия предлагает контракт: 40% мощностей по себестоимости плюс 35%.',choices:[['Принять военный заказ','mil'],['Отказаться','ok']]},
  {y:1918,m:10,img:'Armistice of 11 November 1918',title:'Перемирие!',deck:'Орудия умолкли 11 ноября в 11 часов',text:'Война окончена. Военные заказы прекращены, впереди послевоенный бум: вернувшиеся солдаты научились водить и хотят автомобили.',fx:s=>{s.military=false;}},
  {y:1921,m:0,title:'Послевоенный спад',deck:'Кредиты дорожают, склады полны',text:'Покупатели осторожничают, цены падают. Выживут те, кто умеет считать.'},
  {y:1923,m:0,c:'de',img:'Hyperinflation in the Weimar Republic',title:'Гиперинфляция',deck:'Буханка хлеба стоит миллиарды марок',text:'Марка обесценивается каждый день. Немецкий рынок почти замер, зарплату выдают дважды в день.'},
  {y:1924,m:0,img:'Roaring Twenties',title:'Ревущие двадцатые',deck:'Автомобиль становится вещью среднего класса',text:'Экономика растёт, в моде джаз, радио и автомобиль в рассрочку.'},
  {y:1929,m:9,img:'Wall Street crash of 1929',title:'Чёрный вторник',deck:'Крах на Нью-Йоркской фондовой бирже',text:'Акции обесценились за несколько дней. Покупатели откладывают покупки, банки требуют вернуть кредиты.'}
];
const RANDOM=[
  {w:1,title:'Пожар на складе',text:'Огонь уничтожил треть готовых машин.',fx:s=>{s.models.forEach(m=>m.stock=Math.floor(m.stock*0.67));}},
  {w:2,good:1,title:'Хвалебная статья',text:'Автомобильный журнал назвал ваши машины надёжными. Репутация выросла.',fx:s=>{s.rep=clamp(s.rep+6,0,100);}},
  {w:2,title:'Перебои у поставщиков',text:'В следующем месяце детали подорожают на 25%.',fx:s=>{s.supplyNext=1.25;}},
  {w:1,good:1,title:'Заказ от почтового ведомства',text:'Почта закупает партию машин. В кассу поступила предоплата.',fx:s=>{s.cash+=Math.round(1200*cpi(s)*(1+T(s)*0.2)/100)*100;}},
  {w:1,cond:s=>s.models.some(m=>m.status==='prod'&&overpower(m)),title:'Скандал с поломками',text:'Покупатели жалуются: рама не выдерживает мотор. Репутация упала.',fx:s=>{s.rep=clamp(s.rep-8,0,100);}},
  {w:1,cond:s=>s.models.some(m=>m.stock>Math.max(20,m.fc*3)),title:'Склад переполнен',text:'Дилеры жалуются: машины стоят месяцами и выходят из моды. Остатки пришлось уценить на 15%.',fx:s=>{s.models.forEach(m=>{if(m.stock>Math.max(20,m.fc*3)){const loss=Math.round(m.stock*matCost(m,s)*0.15);s.cash-=loss;}});}},
  {w:1,cond:s=>s.models.some(m=>(m.backlog||0)>Math.max(10,m.fc*0.5)),title:'Очереди у дилеров',text:'Покупатели месяцами ждут машину и уходят к конкурентам. Газеты пишут, что фирма не справляется с заказами.',fx:s=>{s.rep=clamp(s.rep-3,0,100);}}
];
function pushEvent(ev,paper){
  const text=typeof ev.text==='function'?ev.text(G):ev.text;
  if(ev.fx)ev.fx(G);
  addLog(`${ev.title}. ${text}`,'hist');
  G.pending.push({title:ev.title,deck:ev.deck||'',text,img:ev.img||'',kicker:ev.kicker||'',paper:!!paper,choices:ev.choices||[['Читать дальше','ok']]});
}
function inCountries(spec,c){if(!spec)return true;if(spec[0]==='!')return !spec.slice(1).split(',').includes(c);return spec.split(',').includes(c);}
function checkEvents(){
  const s=G;
  HIST.forEach((h,i)=>{if(h.y!==s.y||h.m!==s.m||s.seen['h'+i]||!inCountries(h.c,s.country))return;s.seen['h'+i]=1;pushEvent(h,true);});
  if(bn('convEarly',0)&&s.y===1912&&s.m===0&&!s.seen.conv){s.seen.conv=1;pushEvent({title:'Конвейер можно строить раньше всех',deck:`Инженеры «${s.company}» придумали движущуюся линию`,text:'Сборка на движущейся ленте ускорит выпуск в разы. Внедрение доступно на вкладке «Завод» — раньше конкурентов.'},true);}
  if(mi(s)>6&&!s.pending.length&&Math.random()<0.055){const pool=RANDOM.filter(r=>!r.cond||r.cond(s)),wt=r=>r.w*(r.good?1:DIF().bad),tot=pool.reduce((a,r)=>a+wt(r),0);let x=Math.random()*tot;for(const r of pool){x-=wt(r);if(x<=0){pushEvent(r,false);break;}}}
}
function yearlyCompetitors(s){
  for(const c in COMPS)COMPS[c].forEach((cp,i)=>{
    if(cp.pk===s.pioneer)return;const home=c===s.country||dealerCount(s,c)>0;if(!home)return;
    if(Math.floor(cp.since)===s.y&&s.y>1895)addLog(`На рынок страны «${COUNTRIES[c].name}» вышла новая марка — «${compName(cp,s)}».`,'bad');
    if(cp.until&&cp.until===s.y)addLog(`Марка «${cp.n}» прекратила выпуск автомобилей.`,'good');
    const nm=(cp.models||[]).find(x=>x[0]===s.y);if(nm&&s.y>1895&&compVol(cp,s)>0)addLog(`«${compName(cp,s)}» представила ${nm[1]}.`,'bad');
  });
  if(s.y===1926&&(s.country==='de'||dealerCount(s,'de')>0))pushEvent({title:'Рождение «Мерседес-Бенц»',deck:'Daimler и Benz объединились',text:'Два старейших автомобильных дома Германии слились в концерн Daimler-Benz. Все машины теперь выходят под маркой Mercedes-Benz.',img:'Mercedes-Benz'},true);
  if(s.y===1928&&(s.country==='us'||dealerCount(s,'us')>0))addLog('Chrysler купил Dodge Brothers за 170 миллионов долларов — третья сила Детройта.','hist');
}
function resolve(key){
  const s=G;
  if(key==='raise'){s.wagePol=s.wagePol==='low'?'market':s.wagePol==='market'?'good':s.wagePol;addLog(`Зарплата поднята: ${WAGE_POL[s.wagePol].name.toLowerCase()}. Забастовки не будет.`);}
  if(key==='wait')s.strikeNext=true;
  if(key==='mil'){s.military=true;addLog('Военный контракт подписан.');}
  if(key==='restart'){s.pending=[];openNewGame();return;}
  if(key==='final'){s.pending.shift();finalResults(s,true);save();render();return;}
  s.pending.shift();save();render();
}
const ACH=[
  {id:'s100',name:'Первая сотня',desc:'Продано 100 машин',test:s=>totalSold(s)>=100},
  {id:'s1000',name:'Тысячник',desc:'Продано 1 000 машин',test:s=>totalSold(s)>=1000},
  {id:'s10k',name:'Серийный выпуск',desc:'Продано 10 000 машин',test:s=>totalSold(s)>=10000},
  {id:'s100k',name:'Массовое производство',desc:'Продано 100 000 машин',test:s=>totalSold(s)>=100000},
  {id:'s1m',name:'Миллионер',desc:'Продан миллион машин',test:s=>totalSold(s)>=1000000},
  {id:'models',name:'Главный конструктор',desc:'Разработано 5 моделей',test:s=>s.models.length>=5},
  {id:'truck',name:'Грузоперевозки',desc:'Грузовик в продаже',test:s=>s.models.some(m=>m.status==='prod'&&isTruck(m))},
  {id:'export',name:'На экспорт',desc:'Дилеры за границей',test:s=>Object.keys(s.dealers).some(c=>c!==s.country&&s.dealers[c]>0)},
  {id:'dealers',name:'Сеть по всей стране',desc:'Дилеры покрывают всю страну',test:s=>dealerCount(s,s.country)>=dealerNeed(s.country,s)},
  {id:'conv',name:'Конвейер',desc:'Движущийся конвейер',test:s=>techLv(s,'line')>=2},
  {id:'giant',name:'Индустриальный гигант',desc:'Мощность 1 000 машин в месяц',test:s=>capEff(s)>=1000},
  {id:'race',name:'Первый на финише',desc:'Победа в гонке',test:s=>s.raceLog.some(r=>r.place===1)},
  {id:'legend',name:'Легенда гонок',desc:'10 побед в гонках',test:s=>s.raceLog.filter(r=>r.place===1).length>=10},
  {id:'champ',name:'Чемпион',desc:'Титул в чемпионате',test:s=>(s.titles||[]).length>0},
  {id:'rd',name:'Инженерная школа',desc:'КБ 5-го уровня',test:s=>s.rd&&s.rd.lvl>=5},
  {id:'star',name:'Звёздная команда',desc:'Нанят гонщик',test:s=>s.drivers&&s.drivers.length>0},
  {id:'first',name:'Первопроходец',desc:'Опередили историю',test:s=>Object.keys(s.firsts||{}).length>0},
  {id:'war',name:'Пережили войну',desc:'Дожили до 1919 года',test:s=>s.y>=1919},
  {id:'rich',name:'Миллион в кассе',desc:'$1 000 000 в кассе',test:s=>s.cash>=1000000},
  {id:'leader',name:'Лидер рынка',desc:'Первое место по продажам дома',test:s=>{const L=s.last;if(!L||!L.sold)return false;return (s.comps[s.country]||[]).every(cp=>(cp.last||0)<=L.homeSold);}}
];
let pendingToasts=[];
function checkAch(){ACH.forEach(a=>{if(!G.ach[a.id]&&a.test(G)){G.ach[a.id]=dstr(G);addLog(`Достижение: ${a.name}.`,'good');pendingToasts.push('🏆 '+a.name);}});}

