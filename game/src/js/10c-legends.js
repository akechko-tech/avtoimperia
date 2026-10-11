/* ================= ЛЕГЕНДАРНЫЕ МОДЕЛИ МАРОК (0.22) ================= */
// У каждой марки — своя историческая легенда: у Ford — «Модель T», у Bugatti — Type 35, у FIAT — 501, у Peugeot — «Бебе».
// Легенда открывается, когда у вас есть все её детали (с годами — или раньше, прототипами КБ) и нужные технологии завода.
// Разработка дольше и дороже обычной, зато у легенды особые бонусы: покупатели знают её имя (спрос), её делают дешевле,
// она надёжнее, проще или быстрее, в гонках — сильнее; выпуск — газеты, репутация и очки наследия.
// d — детали (как в конструкторе), fx: appeal — спрос в классе, cost — себестоимость, race — сила в гонке, ch — черты для покупателей
const LEGENDS={
  ford:[
    {id:'ford_t',name:'Модель T',y:1908,kind:'people',d:{e:'e9',g:'g4',c:'c6',k:'k2',b:'b3',w:'w3'},need:{parts:1},rep:6,wiki:'Ford Model T',
      fx:{appeal:1.3,cost:0.85,ch:{rel:1.12,ease:1.1,econ:1.08}},
      t:'«Машина для великого множества»: ванадиевая сталь, планетарная коробка, высокая посадка для сельских дорог. В истории — 15 миллионов штук за 19 лет.'},
    {id:'ford_tt',name:'Модель TT',y:1917,kind:'truck',d:{e:'e9',g:'g4',c:'c6',k:'k2',b:'b7',w:'w7'},need:{parts:1},rep:3,wiki:'Ford Model TT',
      fx:{appeal:1.25,cost:0.88,ch:{rel:1.1}},t:'Грузовик на агрегатах «Модели T»: дёшев, прост, его чинит любой фермер.'},
    {id:'ford_a',name:'Модель A',y:1927,kind:'people',d:{e:'e14',g:'g6',c:'c5',k:'k5',b:'b9',w:'w8'},rep:5,wiki:'Ford Model A (1927–1931)',
      fx:{appeal:1.22,cost:0.92,ch:{safe:1.1,comf:1.08}},t:'Наследница «Модели T»: четыре тормоза, три передачи, закрытый кузов — и снова для всех.'}],
  olds:[
    {id:'olds_cd',name:'Кёрвд Дэш',y:1901,kind:'people',d:{e:'e1',g:'g4',c:'c2',k:'k1',b:'b1',w:'w2'},rep:5,wiki:'Oldsmobile Curved Dash',
      fx:{appeal:1.28,cost:0.88,ch:{ease:1.12}},t:'Лёгкий двухместный «изогнутый передок» — первый в мире автомобиль большой серии: детали везут поставщики, сборка идёт потоком.'},
    {id:'olds_ltd',name:'Лимитед',y:1910,kind:'lux',d:{e:'e4',g:'g5',c:'c4',k:'k2',b:'b11',w:'w5'},rep:5,wiki:'Oldsmobile Limited',
      fx:{appeal:1.2,ch:{comf:1.12,perf:1.1}},t:'Огромный роскошный «Лимитед» с колёсами выше человеческого роста обгонял на картинах экспресс «Двадцатый век».'}],
  benz:[
    {id:'benz_velo',name:'Вело',y:1895,kind:'people',d:{e:'e1',g:'g1',c:'c1',k:'k1',b:'b1',w:'w1'},rep:4,wiki:'Benz Velo',
      fx:{appeal:1.25,cost:0.9,ch:{rel:1.1}},t:'«Вело» (1894) — первый серийный автомобиль мира: около 1200 машин, лёгких и надёжных для своего времени.'},
    {id:'benz_blitzen',name:'Блитцен-Бенц',y:1909,kind:'sport',d:{e:'e4',g:'g5',c:'c3',k:'k2',b:'b1',w:'w5'},rep:8,wiki:'Blitzen Benz',
      fx:{appeal:1.15,race:1.2,ch:{perf:1.4}},t:'«Молния»: в 1911 году Боб Бёрман разогнал её до 228 км/ч — быстрее самолётов и поездов. Рекорды скорости — слава марке.'}],
  maybach:[
    {id:'daimler_lkw',name:'Моторный грузовик',y:1896,kind:'van',d:{e:'e1',g:'g2',c:'c1',k:'k1',b:'b6',w:'w1'},rep:3,wiki:'Daimler Motor-Lastwagen',
      fx:{appeal:1.2,ch:{cap:1.1}},t:'Первый в мире грузовой автомобиль (1896): полторы тонны груза вместо лошади.'},
    {id:'mercedes35',name:'Мерседес 35 PS',y:1901,kind:'lux',d:{e:'e2',g:'g2',c:'c2',k:'k1',b:'b2',w:'w2'},rep:8,wiki:'Mercedes 35 hp',
      fx:{appeal:1.3,race:1.12,ch:{perf:1.25,ease:1.15}},t:'Первый по-настоящему современный автомобиль: низкая рама из штампованной стали, сотовый радиатор, лёгкий мощный мотор.'},
    {id:'zeppelin',name:'Цеппелин',y:1929,kind:'lux',d:{e:'e8',g:'g7',c:'c5',k:'k6',b:'b11',w:'w8'},rep:6,wiki:'Maybach Zeppelin',
      fx:{appeal:1.25,ch:{comf:1.15,rel:1.08}},t:'Двенадцать цилиндров и имя дирижаблей: самый роскошный немецкий автомобиль своего времени.'}],
  renault:[
    {id:'renault_a',name:'Вуатюретка Тип A',y:1899,kind:'people',d:{e:'e1',g:'g3',c:'c2',k:'k1',b:'b1',w:'w2'},rep:5,wiki:'Renault Voiturette',
      fx:{appeal:1.22,cost:0.94,ch:{ease:1.1,econ:1.08}},t:'Прямая передача и карданный вал вместо цепей: тише, проще, надёжнее. Патент на прямую передачу приносил Рено деньги со всего мира.'},
    {id:'renault_ag',name:'Тип AG «Такси»',y:1905,kind:'middle',d:{e:'e3',g:'g3',c:'c3',k:'k2',b:'b2',w:'w3'},rep:5,wiki:'Renault AG1',
      fx:{appeal:1.18,cost:0.94,ch:{rel:1.12}},t:'Парижское такси, которое в 1914 году увезло солдат на Марну. Таксопарки покупают его сотнями.'},
    {id:'renault_40cv',name:'40 CV',y:1921,kind:'lux',d:{e:'e6',g:'g5',c:'c5',k:'k3',b:'b11',w:'w6'},rep:5,wiki:'Renault 40 CV',
      fx:{appeal:1.2,ch:{comf:1.1,perf:1.1}},t:'Машина президентов Франции и рекордов на треке Монлери.'}],
  peugeot:[
    {id:'peugeot_bebe',name:'Бебе',y:1913,kind:'people',d:{e:'e9',g:'g3',c:'c4',k:'k2',b:'b1',w:'w6'},rep:5,wiki:'Peugeot Bébé',
      fx:{appeal:1.25,cost:0.9,ch:{econ:1.12,ease:1.08}},t:'Малыш, придуманный молодым Этторе Бугатти: дешёвый, экономичный — «народная» машина Франции.'},
    {id:'peugeot_l76',name:'L76',y:1912,kind:'sport',d:{e:'e5',g:'g5',c:'c4',k:'k3',b:'b1',w:'w5'},rep:8,wiki:'Peugeot L76',
      fx:{appeal:1.15,race:1.16,ch:{perf:1.35}},t:'Два распредвала в головке и четыре клапана на цилиндр: схема гоночного мотора на десятилетия. Гран-при Франции 1912.'},
    {id:'peugeot_201',name:'201',y:1929,kind:'middle',d:{e:'e7',g:'g6',c:'c5',k:'k5',b:'b5',w:'w8'},rep:4,wiki:'Peugeot 201',
      fx:{appeal:1.2,cost:0.93,ch:{comf:1.08}},t:'Первая «Пежо» с нулём в середине имени: недорогой закрытый седан для всей Франции.'}],
  lanchester:[
    {id:'lanch_10',name:'10 л.с.',y:1901,kind:'middle',d:{e:'e2',g:'g4',c:'c2',k:'k1',b:'b2',w:'w2'},rep:5,wiki:'Lanchester Motor Company',
      fx:{appeal:1.15,ch:{rel:1.15,comf:1.15,ease:1.1}},t:'Уравновешенный мотор, планетарная коробка и мягкий ход: машина инженера, у которой всё продумано.'},
    {id:'lanch_40',name:'40 л.с.',y:1919,kind:'lux',d:{e:'e6',g:'g5',c:'c5',k:'k3',b:'b11',w:'w6'},rep:5,wiki:'Lanchester 40',
      fx:{appeal:1.2,ch:{comf:1.12,rel:1.08}},t:'Шесть цилиндров с верхним распредвалом: роскошь, которую выбирали индийские махараджи и британский король.'}],
  bugatti:[
    {id:'bug_13',name:'Тип 13 «Брешиа»',y:1910,kind:'sport',d:{e:'e9',g:'g5',c:'c4',k:'k2',b:'b1',w:'w5'},rep:6,wiki:'Bugatti Type 13',
      fx:{appeal:1.2,race:1.1,ch:{perf:1.2,ease:1.1}},t:'Крошечная лёгкая машина, которая в 1911 году пришла второй в Гран-при Франции среди гигантов, а в 1921-м заняла четыре первых места в Брешии.'},
    {id:'bug_35',name:'Тип 35',y:1924,kind:'sport',d:{e:'e7',g:'g5',c:'c5',k:'k5',b:'b1',w:'w8'},rep:10,wiki:'Bugatti Type 35',
      fx:{appeal:1.3,race:1.2,ch:{perf:1.35,safe:1.1}},t:'Самая побеждающая гоночная машина в истории: больше тысячи побед, литые алюминиевые колёса, рядная «восьмёрка».'},
    {id:'bug_41',name:'Тип 41 «Руаяль»',y:1927,kind:'lux',d:{e:'e8',g:'g5',c:'c5',k:'k6',b:'b11',w:'w8'},rep:10,wiki:'Bugatti Royale',
      fx:{appeal:1.2,cost:1.25,ch:{comf:1.2,perf:1.15}},t:'Самый большой и дорогой автомобиль мира, «королевский»: шесть машин для королей и миллионеров — и бессмертная слава марки.'}],
  ferrari:[
    {id:'alfa_p2',name:'P2',y:1924,kind:'sport',d:{e:'e7',g:'g5',c:'c5',k:'k3',b:'b1',w:'w8'},rep:8,wiki:'Alfa Romeo P2',
      fx:{appeal:1.2,race:1.2,ch:{perf:1.35}},t:'Гоночная машина Витторио Яно с нагнетателем: победа в первой же гонке, Гран-при Европы 1924 и первый чемпионат мира 1925.'},
    {id:'alfa_6c',name:'6C 1750',y:1929,kind:'sport',d:{e:'e12',g:'g5',c:'c5',k:'k6',b:'b10',w:'w8'},rep:6,wiki:'Alfa Romeo 6C',
      fx:{appeal:1.25,race:1.1,ch:{perf:1.2,ease:1.1}},t:'Лёгкий спортивный шестицилиндровый: Милле Милья 1929 и 1930.'}],
  agnelli:[
    {id:'fiat_zero',name:'Зеро',y:1912,kind:'people',d:{e:'e9',g:'g5',c:'c4',k:'k2',b:'b3',w:'w6'},rep:4,wiki:'FIAT Zero',
      fx:{appeal:1.2,cost:0.9,ch:{rel:1.08}},t:'Первая массовая машина FIAT: недорогой торпедо для итальянских врачей, инженеров и коммерсантов.'},
    {id:'fiat_18bl',name:'18BL',y:1914,kind:'truck',d:{e:'e14',g:'g6',c:'c4',k:'k2',b:'b7',w:'w7'},rep:3,wiki:'FIAT 18 BL',
      fx:{appeal:1.25,ch:{rel:1.12,cap:1.08}},t:'Военный грузовик Первой мировой: тысячи машин для армий Италии, Франции и Британии.'},
    {id:'fiat_501',name:'501',y:1919,kind:'middle',d:{e:'e14',g:'g6',c:'c4',k:'k2',b:'b4',w:'w6'},rep:5,wiki:'Fiat 501',
      fx:{appeal:1.22,cost:0.92,ch:{rel:1.1}},t:'Самая популярная итальянская машина 1920-х: почти 70 тысяч штук с Линготто.'},
    {id:'fiat_805',name:'805',y:1923,kind:'sport',d:{e:'e7',g:'g5',c:'c5',k:'k3',b:'b1',w:'w8'},rep:8,wiki:'Fiat 805',
      fx:{appeal:1.12,race:1.16,ch:{perf:1.3}},t:'Первая победа машины с нагнетателем в Гран-при (Монца, 1923).'}],
  // 0.29: марки, которые основали гонщики («Путь гонщика»): их знаменитые модели — те же, что в истории
  r_lancia:[
    {id:'lancia_alfa',name:'Альфа',y:1908,kind:'middle',d:{e:'e4',g:'g5',c:'c3',k:'k2',b:'b3',w:'w5'},rep:5,wiki:'Lancia Alfa',
      fx:{appeal:1.15,race:1.1,ch:{perf:1.2,ease:1.08}},t:'Первая Lancia (Турин, 1908): лёгкая и быстрая — 2,5 литра, 28 л.с., до 90 км/ч, когда соседи по классу едва делали 70. Лянча строил машины так же, как гонялся: без лишнего веса.'},
    {id:'lancia_theta',name:'Тета',y:1913,kind:'lux',d:{e:'e4',g:'g5',c:'c4',k:'k3',b:'b11',w:'w6'},rep:6,wiki:'Lancia Theta',
      fx:{appeal:1.2,ch:{comf:1.15,ease:1.15}},t:'Theta (1913) — первая европейская машина с полным электрооборудованием в стандарте: электростартер и электрические фары. Заводить рукояткой больше не нужно.'},
    {id:'lancia_lambda',name:'Лямбда',y:1922,kind:'middle',d:{e:'e7',g:'g5',c:'c7',k:'k3',b:'b3',w:'w6'},rep:8,wiki:'Lancia Lambda',
      fx:{appeal:1.25,ch:{comf:1.15,safe:1.12,perf:1.1}},t:'Lambda (1922): несущий кузов вместо рамы и независимая передняя подвеска — низкая, лёгкая и устойчивая. Её изучали конструкторы всех марок мира.'},
    {id:'lancia_dilambda',name:'Дилямбда',y:1929,kind:'lux',d:{e:'e8',g:'g5',c:'c7',k:'k6',b:'b4',w:'w8'},rep:5,wiki:'Lancia Dilambda',
      fx:{appeal:1.18,ch:{comf:1.15,perf:1.1}},t:'Dilambda (1929): V8 на четыре литра для богатых покупателей Европы и Америки — тихая, быстрая, с той же независимой подвеской.'}],
  r_chevrolet:[
    {id:'chev_six',name:'Классик Сикс',y:1912,kind:'lux',d:{e:'e4',g:'g5',c:'c4',k:'k2',b:'b3',w:'w5'},rep:5,wiki:'Chevrolet Series C Classic Six',
      fx:{appeal:1.15,race:1.05,ch:{perf:1.15,comf:1.08}},t:'Первая Chevrolet (1912): большой шестицилиндровый фаэтон Луи Шевроле — 65 миль в час и цена 2150 долларов.'},
    {id:'chev_490',name:'490',y:1915,kind:'people',d:{e:'e9',g:'g6',c:'c4',k:'k2',b:'b3',w:'w6'},rep:5,wiki:'Chevrolet Series 490',
      fx:{appeal:1.22,cost:0.92,ch:{ease:1.08}},t:'Модель «490» (1915): цена — 490 долларов, ровно как у «Модели T», но с электрическими фарами и стартером. Прямой вызов Форду.'},
    {id:'chev_six29',name:'Интернэшнл Сикс',y:1929,kind:'people',d:{e:'e12',g:'g6',c:'c5',k:'k5',b:'b9',w:'w8'},rep:5,wiki:'Chevrolet International',
      fx:{appeal:1.2,cost:0.94,ch:{comf:1.1,perf:1.08}},t:'«Шестёрка по цене четвёрки» (1929): шестицилиндровый мотор в народной машине — Chevrolet обходит Ford.'}],
  r_rickenbacker:[
    {id:'rick_six',name:'Шестёрка',y:1922,kind:'middle',d:{e:'e14',g:'g6',c:'c5',k:'k3',b:'b4',w:'w7'},rep:5,wiki:'Rickenbacker (automobile)',
      fx:{appeal:1.15,ch:{safe:1.2,comf:1.05}},t:'Rickenbacker (1922): одна из первых американских машин с тормозами на все четыре колеса — «машина, достойная своего имени».'},
    {id:'rick_eight',name:'Вертикальная восьмёрка',y:1925,kind:'lux',d:{e:'e8',g:'g5',c:'c5',k:'k3',b:'b4',w:'w8'},rep:4,wiki:'Rickenbacker (automobile)',
      fx:{appeal:1.15,ch:{perf:1.12,comf:1.1}},t:'Vertical Eight Super Sport (1925): рядная «восьмёрка» с маховиками на обоих концах вала — мягкая и быстрая.'}],
  r_maserati:[
    {id:'mas_v4',name:'V4',y:1929,kind:'sport',d:{e:'e8',g:'g5',c:'c5',k:'k3',b:'b1',w:'w8'},rep:9,wiki:'Maserati V4',
      fx:{appeal:1.12,race:1.2,ch:{perf:1.4}},t:'V4 (1929): два «восьмёрочных» мотора рядом — шестнадцать цилиндров. Бачонин Борцаккини проехал на ней 10 км со скоростью 246 км/ч — мировой рекорд.'}]
};
// «Свой персонаж»: легенды по мотивам машин своей страны
const LEGENDS_C={
  de:[{id:'c_laub',name:'Лягушка',y:1924,kind:'people',d:{e:'e11',g:'g6',c:'c4',k:'k2',b:'b1',w:'w7'},rep:4,wiki:'Opel 4 PS',fx:{appeal:1.22,cost:0.9,ch:{econ:1.1}},t:'По мотивам зелёного Opel «Лаубфрош» (1924): первая немецкая машина с конвейера.'},
      {id:'c_horch8',name:'Восьмёрка',y:1927,kind:'lux',d:{e:'e8',g:'g5',c:'c5',k:'k6',b:'b11',w:'w8'},rep:5,wiki:'Horch 8',fx:{appeal:1.2,ch:{comf:1.12}},t:'По мотивам Horch 8: первая немецкая рядная «восьмёрка» для богатых покупателей.'}],
  fr:[{id:'c_typea',name:'Тип A',y:1919,kind:'people',d:{e:'e9',g:'g6',c:'c4',k:'k2',b:'b3',w:'w7'},rep:4,wiki:'Citroën Type A',fx:{appeal:1.22,cost:0.9,ch:{ease:1.1}},t:'По мотивам Citroën Type A (1919): первая европейская машина большой серии, продаётся готовой — с фарами и запаской.'},
      {id:'c_d8',name:'D8',y:1929,kind:'lux',d:{e:'e8',g:'g5',c:'c5',k:'k6',b:'b11',w:'w8'},rep:5,wiki:'Delage D8',fx:{appeal:1.2,ch:{comf:1.1,perf:1.1}},t:'По мотивам Delage D8: низкая элегантная «восьмёрка» лучших кузовщиков Парижа.'}],
  uk:[{id:'c_seven',name:'Семёрка',y:1922,kind:'people',d:{e:'e11',g:'g6',c:'c4',k:'k3',b:'b1',w:'w6'},rep:5,wiki:'Austin 7',fx:{appeal:1.25,cost:0.9,ch:{econ:1.12,ease:1.1}},t:'По мотивам Austin Seven (1922): маленькая машина, которая посадила за руль всю Британию.'},
      {id:'c_3litre',name:'3 литра',y:1921,kind:'sport',d:{e:'e7',g:'g5',c:'c5',k:'k3',b:'b3',w:'w6'},rep:6,wiki:'Bentley 3 Litre',fx:{appeal:1.2,race:1.12,ch:{rel:1.12,perf:1.15}},t:'По мотивам Bentley 3 Litre: победы в Ле-Мане 1924 и 1927.'}],
  us:[{id:'c_490',name:'Модель 490',y:1915,kind:'people',d:{e:'e9',g:'g6',c:'c4',k:'k2',b:'b3',w:'w6'},rep:4,wiki:'Chevrolet Series 490',fx:{appeal:1.2,cost:0.92,ch:{ease:1.08}},t:'По мотивам Chevrolet 490: цена на 490 долларов — прямой вызов «Модели T».'},
      {id:'c_bearcat',name:'Беркэт',y:1912,kind:'sport',d:{e:'e5',g:'g5',c:'c4',k:'k3',b:'b10',w:'w5'},rep:6,wiki:'Stutz Bearcat',fx:{appeal:1.25,race:1.1,ch:{perf:1.2}},t:'По мотивам Stutz Bearcat: родстер для богатой молодёжи, мечта всей Америки 1910-х.'}],
  it:[{id:'c_lambda',name:'Лямбда',y:1922,kind:'middle',d:{e:'e7',g:'g5',c:'c7',k:'k3',b:'b3',w:'w6'},rep:6,wiki:'Lancia Lambda',fx:{appeal:1.22,ch:{comf:1.15,safe:1.1}},t:'По мотивам Lancia Lambda (1922): несущий кузов и независимая передняя подвеска — на десятилетия раньше других.'},
      {id:'c_rl',name:'РЛ',y:1922,kind:'sport',d:{e:'e7',g:'g5',c:'c5',k:'k6',b:'b10',w:'w8'},rep:5,wiki:'Alfa Romeo RL',fx:{appeal:1.2,race:1.1,ch:{perf:1.15}},t:'По мотивам Alfa Romeo RL: Тарга Флорио 1923.'}]
};
const LEGEND_BY={};Object.values(LEGENDS).concat(Object.values(LEGENDS_C)).flat().forEach(L=>{L.d.t=L.d.t||KIND_TRIM[L.kind];LEGEND_BY[L.id]=L;});
// 0.23: цвет легенды — как в истории. «Модель T»: тёмно-зелёная (1908–1910), синяя (1911–1913), с 1914 по 1925 — только чёрная
// («любого цвета, если он чёрный»: чёрный японский лак сох быстрее всех — конвейер не ждал), с 1926 — снова цвета.
// Кузов «Модели T» — открытый фаэтон: в 1910-х это 3/4 выпуска; закрытые седан и купе стали массовыми лишь в 1920-х.
const PNT={black:'#1b1d22',green:'#1f4a36',red:'#9e2b25',blue:'#23427a',cream:'#e3d6b4',bord:'#5c1e2a',white:'#e8e6de',yellow:'#c9a227'};
const LEGEND_PAINT={ford_t:[[0,'green'],[1911,'blue'],[1914,'black'],[1926,'green']],ford_tt:'black',ford_a:'blue',olds_cd:'black',olds_ltd:'bord',benz_velo:'green',benz_blitzen:'white',
  daimler_lkw:'green',mercedes35:'white',zeppelin:'black',renault_a:'green',renault_ag:'red',renault_40cv:'bord',peugeot_bebe:'blue',peugeot_l76:'blue',peugeot_201:'black',
  lanch_10:'green',lanch_40:'green',bug_13:'blue',bug_35:'blue',bug_41:'black',alfa_p2:'red',alfa_6c:'red',fiat_zero:'red',fiat_18bl:'green',fiat_501:'black',fiat_805:'red',
  c_laub:'green',c_horch8:'black',c_typea:'green',c_d8:'black',c_seven:'blue',c_3litre:'green',c_490:'black',c_bearcat:'yellow',c_lambda:'blue',c_rl:'red'};
const LEGEND_NOTE={ford_t:'В истории — чёрная: с 1914 по 1925 год «Модель T» красили только чёрным японским лаком, он сох быстрее всех и не задерживал конвейер («любого цвета, если он чёрный»). До 1914-го — тёмно-зелёная и синяя. Кузов — открытый фаэтон: так выглядели три из четырёх «Моделей T» 1910-х; закрытые седан и купе стали массовыми лишь в 1920-х.',
  ford_tt:'Грузовик «Модели TT» — чёрный, как и вся «Модель T» тех лет.',c_laub:'«Лягушку» прозвали за зелёный цвет — его и оставили.',bug_35:'Синий — гоночный цвет Франции.',alfa_p2:'Красный — гоночный цвет Италии.',c_3litre:'Тёмно-зелёный — гоночный цвет Британии.',benz_blitzen:'Белый — гоночный цвет Германии.'};
function legendPaint(L,y){let p=LEGEND_PAINT[L&&L.id];if(Array.isArray(p)){let c=p[0][1];p.forEach(([y0,k])=>{if(y>=y0)c=k;});p=c;}return PNT[p]||null;}
function LEGEND_TITLES(){return Object.values(LEGEND_BY).map(L=>L.wiki).filter(Boolean);}
function legendsOf(s){if(s.brandRef){const pk=s.brandRef.pk;return pk&&LEGENDS[pk]?LEGENDS[pk]:(LEGENDS_C[s.country]||[]);}return s.pioneer==='custom'||s.pioneer==='r_custom'?(LEGENDS_C[s.country]||[]):(LEGENDS[s.pioneer]||[]);}
// 0.29: имена новых моделей — как у марки в истории (Lancia — буквы греческого алфавита по порядку, Maserati — «Тип 26»…);
// имя берём первое ещё не занятое, чей год уже настал; имена легенд — только для легенд
const BRAND_NAMES={
  r_lancia:[[1907,'Альфа'],[1908,'Диальфа'],[1909,'Бета'],[1910,'Гамма'],[1911,'Дельта'],[1912,'Ди-Дельта'],[1912,'Эпсилон'],[1913,'Зета'],[1914,'Эта'],[1915,'Йота'],[1919,'Каппа'],[1921,'Дикаппа'],[1922,'Трикаппа'],[1931,'Артена'],[1931,'Астура']],
  r_chevrolet:[[1911,'Литл Сикс'],[1913,'Ройял Мейл'],[1914,'Беби Грэнд'],[1917,'Серия D'],[1918,'Серия FA'],[1923,'Супериор'],[1927,'Кэпитол'],[1928,'Нэшнл']],
  r_maserati:[[1926,'Тип 26B'],[1927,'Тип 26R'],[1928,'Тип 8C'],[1929,'Тип 26M'],[1930,'Тип 8C 2500']],
  r_rickenbacker:[[1924,'Модель B'],[1925,'Суперспорт'],[1927,'Модель D']],
  ford:[[1903,'Модель A'],[1904,'Модель C'],[1905,'Модель F'],[1906,'Модель K'],[1906,'Модель N'],[1907,'Модель R'],[1907,'Модель S']],
  renault:[[1899,'Тип A'],[1900,'Тип C'],[1901,'Тип D'],[1902,'Тип G'],[1903,'Тип N'],[1905,'Тип X'],[1906,'Тип AI'],[1908,'Тип AX'],[1910,'Тип BZ'],[1913,'Тип EF'],[1922,'Тип KJ'],[1923,'Тип NN']]};
function brandNextName(s){const L=BRAND_NAMES[s&&(s.brandRef?s.brandRef.pk:s.pioneer)];if(!L)return null;const used=new Set((s.models||[]).map(m=>String(m.name||'').trim()));legendsOf(s).forEach(x=>used.add(x.name));
  const free=L.filter(([y,n])=>!used.has(n));const now=free.filter(([y])=>y<=s.y);return (now[0]||free[0]||[])[1]||null;}
function legendK(md,k){const L=md&&md.legend&&LEGEND_BY[md.legend];return L&&L.fx[k]||1;}
function legendCh(md){const L=md&&md.legend&&LEGEND_BY[md.legend];return L&&L.fx.ch||null;}
// чего не хватает: детали (с годом появления) и технологии
function legendMissing(s,L){const out=[];PART_KEYS.forEach(k=>{const id=L.d[k];if(!id)return;const cat=PART_CATS.find(c=>c.k===k),x=cat&&byId(cat.arr(),id);
    if(x&&!unlockedP([x],s).length)out.push({part:1,name:x.name,y:x.y});});
  Object.keys(L.need||{}).forEach(t=>{if(techLv(s,t)<L.need[t])out.push({tech:1,name:TECH[t].lv[L.need[t]-1].name,y:TECH[t].lv[L.need[t]-1].y});});
  return out;}
function legendState(s,L){if((s.legends||{})[L.id])return 'done';return legendMissing(s,L).length?'locked':'open';}
function legendModel(s,L){return {...L.d,name:L.name,legend:L.id,id:-1,made:0,vol:Math.max(20,(s.last&&s.last.made)||20),launched:mi(s),status:'prod',price:0};}
function legendDevCost(s,L){return Math.round(devCost(legendModel(s,L),s)*1.5/100)*100;}
function legendDevMonths(L){return devMonths(L.d)+2;}
function legendFxText(L){const f=L.fx,p=[];if(f.appeal>1)p.push(`покупатели знают имя — спрос +${Math.round((f.appeal-1)*100)}%`);
  if(f.cost&&f.cost<1)p.push(`дешевле в производстве на ${Math.round((1-f.cost)*100)}%`);if(f.cost&&f.cost>1)p.push(`ручная работа — дороже на ${Math.round((f.cost-1)*100)}%`);
  if(f.race>1)p.push(`в гонках сильнее на ${Math.round((f.race-1)*100)}%`);
  Object.entries(f.ch||{}).forEach(([k,v])=>p.push(`${CHAR_NAMES[k].toLowerCase()} +${Math.round((v-1)*100)}%`));
  if(L.rep)p.push(`выпуск: репутация +${L.rep}`);return p.join(' · ');}
// карточка на вкладке «Модели»: открытые легенды — кнопка, закрытые — чего не хватает
function legendCardHTML(s){const L=legendsOf(s);if(!L.length)return '';
  const open=L.filter(x=>legendState(s,x)==='open'),done=L.filter(x=>legendState(s,x)==='done');
  const row=x=>{const st=legendState(s,x),ms=st==='locked'?legendMissing(s,x):[],im=x.wiki&&IMG[x.wiki];
    return `<div class="race-item legend ${st}"><div class="row" style="gap:10px;align-items:flex-start">${im?`<img class="cmp-ph" src="${im.src}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}<div style="flex:1"><span class="mo">${esc(KIND_NAME[x.kind])} · в истории ${x.y} г.</span><h3 style="margin-top:2px">★ ${esc(x.name)}</h3>
      <p class="small muted" style="margin-top:2px">${esc(x.t)}</p><p class="small good" style="margin-top:4px">${esc(legendFxText(x))}</p>
      ${st==='locked'?`<p class="small warn" style="margin-top:4px">Нужно: ${ms.map(m=>esc(m.name)+(m.y>s.y?` (${m.y} г.${m.part?' или прототип в КБ':''})`:'')).join(', ')}</p>`:''}</div></div>
      ${st==='open'?`<button class="btn primary block" style="margin-top:8px" data-act="legendOpen" data-k="${x.id}">Разработать «${esc(x.name)}» · ${money(legendDevCost(s,x))}</button>`:st==='done'?'<p class="small good" style="margin-top:6px">✓ Уже ваша</p>':''}</div>`;};
  return foldCard('legend',open.length>0,`<h2>★ Легенды марки</h2><span class="label">${open.length?'можно разработать: '+open.length:done.length?'выпущено: '+done.length+' из '+L.length:L.length+' в истории марки'}</span>`,
    `<p class="small muted" style="margin-top:4px">Исторические модели марки. Открываются, когда у вас есть все их детали (КБ может построить прототипы раньше истории) и нужные технологии завода. Разработка — дольше и дороже, зато у легенды особые бонусы.</p>${L.map(row).join('')}`,
    open.length?open.map(x=>x.name).join(', '):L.map(x=>x.name).join(', '));}
function openLegend(id){const s=G,L=LEGEND_BY[id];if(!L||legendState(s,L)!=='open')return;
  const md=legendModel(s,L),dc=legendDevCost(s,L),dm=legendDevMonths(L),st=carStats(md,0,s.y),im=L.wiki&&IMG[L.wiki];
  draft={legendDraft:id,name:L.name,paint:legendPaint(L,s.y)||PAINTS[s.models.length%PAINTS.length].id};
  openSheet(`<div class="row"><h2>★ ${esc(L.name)}</h2>${X}</div>
    ${im?`<figure class="photo" style="margin-top:8px"><img src="${im.src}" alt="" referrerpolicy="no-referrer">${credit(im)}</figure>`:''}
    <p style="margin-top:8px">${esc(L.t)}</p><p class="small good" style="margin-top:6px">${esc(legendFxText(L))}</p>
    <p class="spec" style="margin-top:8px">${specLine(md,s)}</p>
    <div class="meta"><div>Скорость<b>${Math.round(st.vmax*3.6)} км/ч</b></div><div>Разработка<b>${dm} мес.</b></div><div>Бюджет<b>${money(dc)}</b></div><div>Класс<b>${esc(KIND_NAME[L.kind])}</b></div></div>
    ${compareHTML(md,s)}
    <label class="label" for="lname" style="display:block;margin-top:12px">Название</label><input type="text" id="lname" value="${esc(L.name)}" maxlength="24" style="margin-top:6px">
    <div class="row" style="margin-top:10px;align-items:center"><span class="label">Цвет</span><div class="btns">${PAINTS.map(c=>`<button class="swatch ${draft.paint===c.id?'on':''}" style="background:${c.id}" data-act="legPaint" data-v="${c.id}" aria-label="${c.name}"></button>`).join('')}</div></div>
    <p class="small muted" style="margin-top:4px">${esc(LEGEND_NOTE[L.id]||'Цвет — как у исторической машины; можно выбрать свой.')}</p>
    <button class="btn primary block" style="margin-top:14px" data-act="legendStart" data-k="${L.id}" ${s.cash<dc?'disabled':''}>${s.cash<dc?'Не хватает денег на разработку':'Начать разработку · '+money(dc)}</button>`);
  const inp=document.getElementById('lname');if(inp)inp.addEventListener('input',e=>{draft.name=e.target.value;});}
function legendStart(s,id){const L=LEGEND_BY[id];if(!L||legendState(s,L)!=='open')return false;const dc=legendDevCost(s,L);if(s.cash<dc)return false;
  s.cash-=dc;s.legends=s.legends||{};s.legends[L.id]={y:s.y,m:s.m};
  const nm=((draft&&draft.legendDraft===id&&draft.name)||L.name).trim()||L.name;
  const m={id:s.nextId++,name:nm,e:L.d.e,g:L.d.g,c:L.d.c,k:L.d.k,b:L.d.b,t:L.d.t,w:L.d.w,legend:L.id,paint:(draft&&draft.legendDraft===id&&draft.paint)||legendPaint(L,s.y)||PAINTS[0].id,price:0,plan:'auto',status:'dev',devLeft:legendDevMonths(L),launched:0,stock:0,backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,made:0,fc:0};
  m.price=Math.round(refPrice(m,s)/10)*10;s.models.push(m);addLog(`Начата разработка легенды «${nm}» (${money(dc)}, ${m.devLeft} мес.).`,'good');return true;}
// выпуск легенды: газеты, репутация, очки наследия
function legendLaunch(s,md){const L=LEGEND_BY[md.legend];if(!L)return;s.rep=clamp(s.rep+(L.rep||4),0,100);s.legBonus=(s.legBonus||0)+15;
  const early=s.y<L.y?L.y-s.y:0;
  pushEvent({own:1,kicker:'Легенда',title:`«${md.name}» — в продаже!`,deck:early?`На ${early} ${plural(early,'год','года','лет')} раньше, чем в истории`:`Легендарная модель марки ${esc(s.company)}`,img:L.wiki&&IMG[L.wiki]?L.wiki:'',imgCap:L.wiki?`${L.name} (${L.y})`:'',
    text:`${L.t}\nПокупатели уже знают это имя: ${legendFxText(L)}.`},true);
  pendingToasts.push('★ Легенда: '+md.name);}
