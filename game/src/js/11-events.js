/* ================= EVENTS ================= */
const HIST=[
  {y:1896,m:10,c:'uk',img:'Red flag traffic laws',title:'Флажок больше не нужен',deck:'Парламент отменил «закон о красном флаге»',text:'Автомобилям больше не нужен пешеход с флажком впереди, а скорость разрешили поднять до 14 миль в час. Британский рынок оживает; в честь события автомобилисты устроили пробег из Лондона в Брайтон.'},
  {y:1896,m:3,img:'Daimler Motor-Lastwagen',title:'Мотор вместо лошади',deck:'Daimler построил первый грузовик',text:'Готлиб Даймлер отправил в Лондон моторную телегу, которая везёт полторы тонны груза. Лавочники, пивовары и почта присматриваются: лошадь нужно кормить каждый день, а мотор — только когда он работает. В конструкторе появился фургон — новый класс покупателей: фирмы и ведомства.'},
  {y:1901,m:2,img:'Mercedes 35 hp',title:'«Мерседес» задаёт новую планку',deck:'Низкая рама, сотовый радиатор, 35 сил',text:'Машина, построенная Вильгельмом Майбахом по заказу Эмиля Еллинека, выиграла гонки в Ницце. Лёгкая, низкая и мощная, она похожа скорее на автомобиль будущего, чем на карету без лошади. Покупатели ждут того же от всех марок.'},
  {y:1908,m:9,img:'Ford Model T',title:'Автомобиль для всех',deck:'Генри Форд представил Model T',text:'Простая, прочная и дешёвая машина обещает сделать автомобиль доступным фермеру и рабочему. Цены по всему миру начинают падать, в народном сегменте появляются массовые марки.'},
  {y:1910,m:5,img:'Prinz-Heinrich-Fahrt 1910',imgCap:'Фердинанд Порше на Austro-Daimler, пробег принца Генриха, 1910',title:'Рождение спортивной машины',deck:'Пробег принца Генриха выиграл Austro-Daimler Фердинанда Порше',text:'Призы для туристических машин учредил брат кайзера, принц Генрих Прусский, но заводы привезли на пробег лёгкие быстрые машины с мощными моторами. Первые три места заняли Austro-Daimler, за рулём победителя был их конструктор Фердинанд Порше — машину так и назвали: «Принц Генрих». Vauxhall тоже зовёт свою новинку «Принцем Генрихом», а в Америке готовят Mercer Raceabout.\nВ конструкторе появилось спортивное оснащение: облегчённый открытый кузов, ковшеобразные сиденья и настроенный мотор. Спортивные машины берут богатые любители скорости — их немного, но платят они щедро и ценят мощность и тормоза больше комфорта.'},
  {y:1912,m:1,img:'Charles F. Kettering',title:'Мотор заводится кнопкой',deck:'Cadillac ставит электрический стартер Кеттеринга',text:'Больше не нужно крутить заводную ручку и рисковать рукой: стартер Delco запускает мотор нажатием педали. Водить машину теперь может каждый. Покупатели дорогих машин ждут стартер в люксовом оснащении.'},
  {y:1913,m:9,img:'Highland Park Ford Plant',title:'Движущийся конвейер',deck:'В Хайленд-Парке сборка шасси ускорилась в разы',text:'Машина едет к рабочему, а не рабочий к машине. Время сборки шасси сократилось с двенадцати часов до полутора. На вкладке «Завод» доступна модернизация.'},
  {y:1914,m:7,c:'!us,it',title:'Война!',deck:'Мобилизация объявлена по всей Европе',text:'Спрос на легковые машины рухнул, армии нужны грузовики. Военное ведомство предлагает контракт: 40% мощностей по себестоимости плюс 35%.',choices:[['Принять военный заказ','mil'],['Отказаться','ok']]},
  {y:1915,m:4,c:'it',title:'Италия вступает в войну',deck:'Королевство объявило войну Австро-Венгрии',text:'Спрос на легковые машины рухнул, армии нужны грузовики. Военное ведомство предлагает контракт: 40% мощностей по себестоимости плюс 35%.',choices:[['Принять военный заказ','mil'],['Отказаться','ok']]},
  {y:1917,m:3,c:'us',title:'США вступают в войну',deck:'Конгресс объявил войну Германии',text:'Спрос на легковые машины упал вдвое. Армия предлагает контракт: 40% мощностей по себестоимости плюс 35%.',choices:[['Принять военный заказ','mil'],['Отказаться','ok']]},
  {y:1918,m:10,img:'Armistice of 11 November 1918',title:'Перемирие!',deck:'Орудия умолкли 11 ноября в 11 часов',text:'Война окончена. Военные заказы прекращены, впереди послевоенный бум: вернувшиеся солдаты научились водить и хотят автомобили.',fx:s=>{s.military=false;}},
  {y:1921,m:0,title:'Послевоенный спад',deck:'Кредиты дорожают, склады полны',text:'Покупатели осторожничают, цены падают. Выживут те, кто умеет считать.'},
  {y:1923,m:0,c:'de',img:'Hyperinflation in the Weimar Republic',title:'Гиперинфляция',deck:'Буханка хлеба стоит миллиарды марок',text:'Марка обесценивается каждый день. Немецкий рынок почти замер, зарплату выдают дважды в день.'},
  {y:1922,m:6,img:'Austin 7',title:'Машина размером с мотоцикл',deck:'Austin Seven и Citroën 5CV открывают эпоху малолитражек',text:'Маленький мотор, четыре тесных места и цена мотоцикла с коляской. В Европе, где налог берут с каждой лошадиной силы, малолитражка становится машиной для всех. У поставщиков появился малолитражный мотор.'},
  {y:1924,m:0,img:'Roaring Twenties',title:'Ревущие двадцатые',deck:'Автомобиль становится вещью среднего класса',text:'Экономика растёт, в моде джаз, радио и автомобиль в рассрочку.'},
  {y:1927,m:11,img:'Ford Model A (1927–1931)',title:'Ford показал Model A',deck:'После 15 миллионов Model T — новая машина',text:'Полгода заводы Форда стояли: конвейер перестраивали под новую модель. Model A — тормоза на все колёса, безопасное стекло, четыре цвета вместо одного чёрного. В первые дни на неё записались сотни тысяч покупателей. Даже Форд понял: одна модель на века больше не работает.'},
  {y:1929,m:9,img:'Wall Street crash of 1929',title:'Чёрный вторник',deck:'Крах на Нью-Йоркской фондовой бирже',text:'Акции обесценились за несколько дней. Покупатели откладывают покупки, банки требуют вернуть кредиты.'}
];
const RANDOM=[
  {w:1,title:'Пожар на складе',text:'Огонь уничтожил треть готовых машин.',fx:s=>{s.models.forEach(m=>m.stock=Math.floor(m.stock*0.67));}},
  {w:2,good:1,title:'Хвалебная статья',text:'Автомобильный журнал назвал ваши машины надёжными. Репутация выросла.',fx:s=>{s.rep=clamp(s.rep+6,0,100);}},
  {w:2,title:'Перебои у поставщиков',text:'В следующем месяце детали подорожают на 25%.',fx:s=>{s.supplyNext=1.25;}},
  {w:1,good:1,title:'Заказ от почтового ведомства',text:'Почта закупает партию машин. В кассу поступила предоплата.',fx:s=>{s.cash+=Math.round(1200*cpi(s)*(1+T(s)*0.2)/100)*100;}},
  {w:1,cond:s=>s.models.some(m=>m.status==='prod'&&overpower(m)),title:'Скандал с поломками',text:'Покупатели жалуются: рама не выдерживает мотор. Репутация упала.',fx:s=>{s.rep=clamp(s.rep-8,0,100);}},
  {w:1,cond:s=>s.models.some(m=>m.stock>Math.max(20,m.fc*3)),title:'Склад переполнен',text:'Дилеры жалуются: машины стоят месяцами и выходят из моды. Остатки пришлось уценить на 15%.',fx:s=>{s.models.forEach(m=>{if(m.stock>Math.max(20,m.fc*3)){const loss=Math.round(m.stock*matCost(m,s)*0.15);s.cash-=loss;}});}},
  // очереди — только когда выпуск и правда упёрся: в мощность завода, в рабочих, в склад или в ручной план (по цифрам прошлого месяца)
  {w:1.4,cond:s=>!!queueCause(s),title:'Очереди у дилеров',text:s=>{const q=queueCause(s),m=q.md;
    return `Покупатели ждут «${m.name}» неделями: в прошлом месяце хотели купить ≈ ${fmtD(m.lastWant||0)}, а получили ${fmtN(m.lastSold||0)} — ${fmtN(Math.round(m.queued||0))} ждут в очереди, остальные ушли к конкурентам. ${q.why}`;},fx:s=>{s.rep=clamp(s.rep-2,0,100);}}
];
// Почему не хватило машин: завод на пределе, мало рабочих, склад мал, выпуск задан вручную (или спрос просто вырос — тогда «авто» догонит сам)
function queueCause(s){const L=s.last;if(!L||!L.bneck)return null;const md=s.models.filter(m=>m.status==='prod'&&(m.backlog||0)>Math.max(10,(m.fc||0)*0.5)).sort((a,b)=>(b.backlog||0)-(a.backlog||0))[0];if(!md)return null;
  const b=L.bneck;if(md.plan!=='auto'&&md.plan!==undefined&&+md.plan<(md.lastWant||0)*0.9)return {md,why:`Выпуск «${md.name}» задан вручную — ${fmtN(+md.plan)} в месяц. Прибавьте план или верните «авто» на вкладке «Модели».`};
  if(b.cap<0.97)return {md,why:`Завод работает на пределе — загрузка ${pct(Math.min(1,b.load),0)}. Газеты пишут, что фирма не справляется: стройте цеха на вкладке «Завод».`};
  if(b.lab<0.97)return {md,why:'Не хватает рабочих рук: наймите людей на вкладке «Завод» или включите автонайм.'};
  if(b.wh)return {md,why:'Склад мал: завод не может делать машины впрок. Расширьте склад на вкладке «Завод».'};
  return null;}
function pushEvent(ev,paper){
  const text=typeof ev.text==='function'?ev.text(G):ev.text;
  if(ev.fx)ev.fx(G);
  addLog(`${ev.title}. ${text}`,'hist');
  G.pending.push({title:ev.title,deck:ev.deck||'',text,img:ev.img||'',imgCap:ev.imgCap||'',kicker:ev.kicker||'',carId:ev.carId||null,own:ev.own?1:0,carOpt:ev.carOpt||null,caption:ev.caption||'',hist:ev.hist||'',histCap:ev.histCap||'',paper:!!paper,choices:ev.choices||[['Читать дальше','ok']],cel:ev.cel||null,...(ev.duel?{duel:ev.duel}:{}),...(ev.dc?{dc:ev.dc}:{}),...(ev.world?{world:ev.world}:{})});
}
function inCountries(spec,c){if(!spec)return true;if(spec[0]==='!')return !spec.slice(1).split(',').includes(c);return spec.split(',').includes(c);}
function checkEvents(){
  const s=G;sagaCheck(s);
  HIST.forEach((h,i)=>{if(h.y!==s.y||h.m!==s.m||s.seen['h'+i]||!inCountries(h.c,s.country))return;s.seen['h'+i]=1;
    const rid=HIST_REEL[h.img];if(rid){reelUnlock(s,rid);pushEvent({...h,choices:(h.choices||[['Читать дальше','ok']]).concat([['▶ Кинохроника','reel:'+rid]])},true);}else pushEvent(h,true);});
  if(bn('convEarly',0)&&s.y===1912&&s.m===0&&!s.seen.conv){s.seen.conv=1;pushEvent({own:1,title:'Конвейер можно строить раньше всех',deck:`Инженеры «${s.company}» придумали движущуюся линию`,text:'Сборка на движущейся ленте ускорит выпуск в разы. Внедрение доступно на вкладке «Завод» — раньше конкурентов.'},true);}
  checkShows(s);checkTenders(s);try{histReelCheck(s);}catch(e){console.warn('hist reel',e);}
  if(mi(s)>6&&!s.pending.length&&Math.random()<0.055){const pool=RANDOM.filter(r=>!r.cond||r.cond(s)),wt=r=>r.w*(r.good?1:DIF().bad),tot=pool.reduce((a,r)=>a+wt(r),0);let x=Math.random()*tot;for(const r of pool){x-=wt(r);if(x<=0){pushEvent(r,false);break;}}}
}
/* ---------- конкуренты отвечают ---------- */
// Сила ответа словами (внутри — прибавка к привлекательности в логарифмах)
function rvWord(v){return v<0.35?'слегка':v<0.8?'заметно':v<1.4?'сильно':'намного';}
function rvBar(v){const n=v<0.15?0:v<0.35?1:v<0.8?2:v<1.4?3:4;return '▮'.repeat(n)+'▯'.repeat(4-n);}
function topRivals(c,g,s,n){return (COMPS[c]||[]).filter(cp=>cp.pk!==s.pioneer&&compAlive(cp,s)&&cp.mix&&cp.mix[g]).map(cp=>({cp,v:compVol(cp,s)*cp.mix[g]})).sort((a,b)=>b.v-a.v).slice(0,n||2).map(o=>o.cp);}
// Что именно сделали конкуренты: прибавку их привлекательности раскладываем на цену, новинку и дилеров с рекламой
function rivalNews(s,c,g,nv,cur){
  if(s.pending.length||mi(s)-(s.rvSaid||-99)<10)return;const L=topRivals(c,g,s,3);if(!L.length)return;s.rvSaid=mi(s);
  s.rvNews=s.rvNews||{};const k0=c+g,dv=Math.max(0.1,nv-(s.rvNews[k0]||0));s.rvNews[k0]=nv;
  const cut=1-Math.exp(-dv*0.45/BR),qUp=Math.exp(dv*0.35/AQ)-1,nDl=Math.max(10,Math.round(dealerNeed(c,s)*dv*0.3/5)*5);
  const P=prefP(g,c,s)*pwOf(s,c,g),mdl=cp=>{const m=compModel(cp,s);return m?m[1]:'';},nm=cp=>compName(cp,s);
  const A=L[0],B=L[1],C=L[2],lines=[];
  lines.push(`— ${nm(A)} снизил цену${mdl(A)?` «${mdl(A)}»`:''} на ${Math.max(2,Math.round(cut*100))}% — теперь около ${money(P*(1-cut))}`);
  if(B)lines.push(`— ${nm(B)} выпустил обновлённую${mdl(B)?` «${mdl(B)}»`:' модель'}: мотор мощнее, рама крепче — на ${Math.max(2,Math.round(qUp*100))}% лучше прежней`);
  lines.push(`— ${nm(C||B||A)} открыл дилеров ещё в ${fmtN(nDl)} городах и удвоил рекламу в газетах`);
  const mk=s.last&&s.last.mk&&s.last.mk[c],z=mk&&mk.segs&&mk.segs[g],sh=z&&z.size>0?z.you/z.size:0,sh2=sh>0?sh/(sh+(1-sh)*Math.exp(dv)):0;
  const mine=(s.models||[]).filter(m=>m.status==='prod'&&segOf(m)===g).sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0],TT=mine?techTone(mine,s):null,m0=compModel(A,s);
  pushEvent({title:'Конкуренты наступают',kicker:'Рынок · '+SEG[g].name.toLowerCase()+' класс',img:m0&&m0[2]&&IMG[m0[2]]?m0[2]:'',imgCap:m0?`${nm(A)} ${m0[1]}`:'',deck:`${B?`«${nm(A)}», «${nm(B)}»${C?` и «${nm(C)}»`:''}`:`«${nm(A)}»`} отвечают на успех «${s.company}»`,
    text:`Покупатели класса «${SEG[g].name}» всё чаще выбирают «${s.company}»${z?`: в прошлом месяце ваших машин купили ${fmtN(z.you)} из ${fmtN(z.size)} (${pct(sh,0)})`:''}. Старые марки ответили:\n${lines.join('\n')}\nТеперь их машины для покупателей ${rvWord(nv)} привлекательнее, чем до вашего наступления${sh>0?`, и ваша доля в классе может упасть примерно до ${pct(sh2,0)}`:''}.\nКак ответить: ${mine?`«${mine.name}» сейчас — ${Math.round(TT.r*100)}% соперника; `:''}улучшения в конструкторском бюро, новая модель, цена и реклама — или другие классы и страны. История помнит: Ford держал половину рынка США, пока General Motors не предложил покупателям выбор.`},true);}
/* ---------- заказы ведомств и фирм ---------- */
const TENDERS={
  post:{y:1897,kind:'van',n:[4,16],lim:1.1,mo:6,who:c=>({fr:'Почта Франции',de:'Имперская почта',uk:'Королевская почта',us:'Почта США',it:'Королевская почта Италии'}[c]),
    text:(o)=>`${o.who} меняет конные повозки на моторные и закупает ${o.n} фургонов для посылок. Главное для почты — надёжность и цена.`},
  brew:{y:1898,kind:'van',n:[3,10],lim:1.05,mo:5,who:c=>({fr:'Большие магазины «Бон Марше»',de:'Пивоварня «Лёвенброй»',uk:'Универмаг «Хэрродс»',us:'Пивоварня «Анхойзер-Буш»',it:'Пивоварня «Перони»'}[c]),
    text:(o)=>`${o.who} хочет развозить товар на моторах: заказ на ${o.n} фургонов. Если машины не подведут, будут и новые заказы.`},
  taxi:{y:1905,kind:'car',n:[20,80],lim:0.92,mo:6,who:c=>'Таксомоторный парк '+({fr:'Парижа',de:'Берлина',uk:'Лондона',us:'Нью-Йорка',it:'Милана'}[c]),
    text:(o)=>`${o.who} покупает ${o.n} машин для такси. Парк берёт оптом и торгуется, зато машины будут на глазах у всего города.`},
  fire:{y:1906,kind:'truck',n:[2,8],lim:1.3,mo:6,who:c=>'Пожарная команда '+({fr:'Парижа',de:'Берлина',uk:'Лондона',us:'Нью-Йорка',it:'Турина'}[c]),
    text:(o)=>`${o.who} переходит с лошадей на моторы: нужно ${o.n} машин, которые заводятся с полоборота и не ломаются в пути.`},
  army:{y:1908,to:1914,kind:'truck',n:[10,40],lim:1.2,mo:8,cs:['de','fr','uk'],who:c=>({fr:'Военное министерство Франции',de:'Военное министерство Пруссии',uk:'Военное министерство Британии'}[c]),
    text:(o)=>`${o.who} платит за грузовики, которые в войну можно будет призвать в армию. Заказ — ${o.n} машин с поставкой за ${o.mo} месяцев.`},
  city:{y:1912,kind:'truck',n:[5,25],lim:1.1,mo:7,who:c=>'Городская управа '+({fr:'Лиона',de:'Мюнхена',uk:'Манчестера',us:'Чикаго',it:'Рима'}[c]),
    text:(o)=>`${o.who} закупает ${o.n} грузовиков для уборки улиц и стройки.`}
};
function tenderModel(s,kind){return s.models.filter(m=>m.status==='prod'&&(kind==='van'?m.b==='b6':kind==='truck'?isTruck(m)&&m.b!=='b6':!isTruck(m)&&segOf(m)!=='lux')).sort((a,b)=>classScore(b,s)-classScore(a,s))[0];}
function checkTenders(s){
  if(s.pending.length||s.over||(s.orders||[]).length>=3||Math.random()>0.035)return;
  const L=Object.entries(TENDERS).filter(([k,t])=>s.y>=t.y&&(!t.to||s.y<t.to)&&(!t.cs||t.cs.includes(s.country))&&mi(s)-((s.tenderSaid||{})[k]||-99)>=18&&tenderModel(s,t.kind));if(!L.length)return;
  const [k,t]=L[Math.floor(Math.random()*L.length)],md=tenderModel(s,t.kind),scale=(1+T(s)/10)*(s.country==='us'?1.8:1);
  const n=Math.max(2,Math.round((t.n[0]+Math.random()*(t.n[1]-t.n[0]))*scale)),lim=Math.round(refPrice(md,s)*t.lim/10)*10;
  s.tenderSaid=s.tenderSaid||{};s.tenderSaid[k]=mi(s);
  const o={k,who:t.who(s.country),n,mo:t.mo,md:md.id,lim,bids:[Math.round(lim*0.88/10)*10,lim]};s.tenderNow=o;
  const S=classScore(md,s),cost=unitCost(md,s);
  pushEvent({carId:md.id,title:'Заказ: '+o.who,kicker:'Деловой заказ',deck:`${n} машин · до ${money(lim)} за штуку · поставка за ${t.mo} мес.`,
    text:t.text(o)+`\nВаша модель для заказа — «${md.name}»: против соперников ${Math.round(S*100)}%, себестоимость около ${money(cost)}. Чем дешевле предложение и лучше машина, тем больше шансов. Машины для заказа завод сделает сверх плана, а не поставить в срок — неустойка и удар по репутации.`,
    choices:[[`Предложить ${money(o.bids[0])} — шансы выше`,'tbid0'],[`Предложить ${money(o.bids[1])}`,'tbid1'],['Не участвовать','tskip']]},false);}
function tenderResolve(s,key){const o=s.tenderNow;s.tenderNow=null;if(!o||key==='tskip'){if(o)addLog(`Вы не стали участвовать в заказе: ${o.who}.`);return;}
  const md=s.models.find(m=>m.id===o.md);if(!md)return;const bid=o.bids[key==='tbid0'?0:1],S=classScore(md,s);
  const p=clamp(0.35+0.8*(S-1)+2.2*(1-bid/o.lim)+(s.rep-50)/250,0.05,0.95);
  if(Math.random()<p){s.orders.push({id:mi(s)+'-'+o.k,md:md.id,n:o.n,left:o.n,price:bid,due:mi(s)+o.mo,who:o.who,start:mi(s)});
    addLog(`Заказ выигран: ${o.who} — ${fmtN(o.n)} машин «${md.name}» по ${money(bid)}. Срок — ${o.mo} мес.`,'good');pendingToasts.push('📜 Заказ ваш: '+o.who);}
  else{const L=topRivals(s.country,o.k==='taxi'?'people':'truck',s,1),w=L.length?compName(L[0],s):'конкурент';addLog(`Заказ ушёл к «${w}»: ${o.who} выбрал их предложение.`,'bad');pendingToasts.push('Заказ ушёл к «'+w+'»');}}
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
  if(key==='saga'){const ev=s.pending[0];if(ev&&ev.saga)sagaAuto(s,ev.saga);else s.pending.shift();save();render();return;}
  if(key==='raise'){s.wagePol=s.wagePol==='low'?'market':s.wagePol==='market'?'good':s.wagePol;addLog(`Зарплата поднята: ${WAGE_POL[s.wagePol].name.toLowerCase()}. Забастовки не будет.`);}
  if(key==='wait')s.strikeNext=true;
  if(key==='mil'){s.military=true;addLog('Военный контракт подписан.');}
  if(key==='tbid0'||key==='tbid1'||key==='tskip')tenderResolve(s,key);
  if(key==='show0'||key==='show1'||key==='show2')showBook(s,key);
  if(/^(chal|poach)/.test(key))drvResolve(s,key);
  if(/^reel:/.test(key)){s.pending.shift();save();render();playReel(key.slice(5));return;}
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
  {id:'rd8',name:'Институт автомобиля',desc:'КБ 8-го уровня',test:s=>s.rd&&s.rd.lvl>=8},
  {id:'order',name:'Деловой партнёр',desc:'Выполнен заказ ведомства или фирмы',test:s=>(s.ordersDone||0)>0},
  {id:'show',name:'На выставке',desc:'Свой стенд на автосалоне',test:s=>(s.showsDone||0)>0},
  {id:'medal',name:'Медаль выставки',desc:'Медаль Всемирной выставки 1900 года',test:s=>(s.medals||[]).length>0},
  {id:'star',name:'Звёздная команда',desc:'Нанят гонщик',test:s=>s.drivers&&s.drivers.length>0},
  {id:'first',name:'Первопроходец',desc:'Опередили историю',test:s=>Object.keys(s.firsts||{}).length>0},
  {id:'war',name:'Пережили войну',desc:'Дожили до 1919 года',test:s=>s.y>=1919},
  {id:'rich',name:'Миллион в кассе',desc:'$1 000 000 в кассе',test:s=>s.cash>=1000000},
  {id:'leader',name:'Лидер рынка',desc:'Первое место по продажам дома',test:s=>{const L=s.last;if(!L||!L.sold)return false;return (s.comps[s.country]||[]).every(cp=>(cp.last||0)<=L.homeSold);}}
];
let pendingToasts=[];
function checkAch(){ACH.forEach(a=>{if(!G.ach[a.id]&&a.test(G)){G.ach[a.id]=dstr(G);addLog(`Достижение: ${a.name}.`,'good');pendingToasts.push('🏆 '+a.name);
  try{trophyAdd(G,{kind:'medal',title:a.name,sub:a.desc,story:`Достижение «${a.name}»: ${a.desc.toLowerCase()}.`,key:'ach|'+a.id});}catch(_){}}});}

