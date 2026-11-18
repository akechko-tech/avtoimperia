/* ================= 0.51: ВЕСЬ РЯД ТЕХНИКИ ЭПОХИ (ТЗ 0.51, тема 3; решение автора: «сразу весь ряд, уместный для этой эпохи») =================
   До 0.51 завод строил легковые машины, фургон, грузовики 1,5 и 3 т и мотоциклы. Теперь — всё, что делала автомобильная промышленность
   до 1930 года: тяжёлый грузовик и тягач с полуприцепом, автобусы, спецтехника на грузовом шасси, такси, тракторы, военные машины.
   Кузов — та же деталь, что и раньше (мотор, рама, коробка, шины, тормоза — общие), но у каждого вида свой покупатель, своя мерка работы
   и свой эталон соперника (105-market.js: «работы»). Годы появления сверены: claude/issledovanie-tehnika-0.51.md.
   kind — вид техники (назначение); truck:true — «не легковая» (все прежние проверки легковых её не видят); pay — груз, т (у автобуса —
   вес пассажиров); pk — во сколько раз машина дороже полуторатонного грузовика того же года (типичная цена вида);
   arm — броня (военные), trk — гусеницы; crew — экипаж на работе; art — рисунок (20-art.js).
   Цена кузова c — всё особое в машине (насос и лестницы, броня, салон автобуса): подобрана так, чтобы при типичной цене вида
   доля себестоимости была как у грузовика (у трактора — тоньше, у военных — толще). */
BODIES.push(
  {id:'b12',name:'Грузовик 5 т',y:1916,q:36,c:1280,kg:2300,cd:2.5,cg:1.05,cx:1.6,truck:true,seats:2,pay:5,comf:1,kind:'truck',art:'heavy',note:'Как Mack AC (1916) — «бульдог» на цепях: уголь, лес, стройка, фронтовые дороги'},
  {id:'b13',name:'Тягач с полуприцепом, 8 т',y:1918,q:40,c:1850,kg:2700,cd:2.8,cg:1.05,cx:1.7,truck:true,seats:2,pay:8,comf:1,kind:'truck',art:'semi',note:'Полуприцеп Фрюхофа (1914; фирма — 1918): «лошадь тянет больше, чем везёт, — и грузовик тоже»'},
  {id:'b14',name:'Городской автобус',y:1905,q:26,c:3450,kg:1500,cd:2.6,cg:1.2,cx:1.6,truck:true,seats:34,pay:2.2,pk:3.0,comf:1,kind:'bus',art:'bus',crew:2,note:'Первые моторные омнибусы — 1898–1905 годы; лондонский B-type (1910, 34 места) — первый массовый'},
  {id:'b15',name:'Междугородний автобус',y:1921,q:38,c:3450,kg:1700,cd:2.2,cg:0.95,cx:1.8,truck:true,seats:22,pay:1.6,pk:5.0,closed:1,comf:1.5,kind:'coach',art:'coach',note:'Fageol Safety Coach (1921): первый автобус, построенный как автобус, — низкий, широкий, 22 места'},
  {id:'b16',name:'Школьный автобус',y:1914,q:14,c:1250,kg:800,cd:2.2,cg:1.05,cx:1.2,truck:true,seats:24,pay:1.2,pk:1.5,closed:1,comf:0.9,kind:'school',art:'school',note:'Кузов для школьников на грузовом шасси: скамьи вдоль бортов, дверь сзади'},
  {id:'b17',name:'Пожарный автомобиль',y:1906,q:30,c:7400,kg:1400,cd:2.2,cg:1.0,cx:1.9,truck:true,seats:6,pay:1.5,pk:6.0,comf:1,kind:'fire',art:'fire',crew:5,note:'Knox (1905–1906) и Waterous (1906): насос и лестницы на автомобильном шасси вместо парового насоса на конной тяге'},
  {id:'b18',name:'Санитарный автомобиль',y:1909,q:16,c:1200,kg:520,cd:1.6,cg:0.95,cx:1.3,truck:true,seats:4,pay:0.5,pk:1.6,closed:1,comf:1.4,kind:'amb',art:'amb',crew:2,note:'Закрытый кузов на двое носилок, мягкие рессоры'},
  {id:'b19',name:'Почтовый фургон',y:1907,q:9,c:590,kg:430,cd:1.7,cg:0.9,cx:1.0,truck:true,seats:2,pay:0.6,pk:0.9,closed:1,comf:1,kind:'mail',art:'mail',note:'Запирающийся кузов и расписание: почта не ждёт'},
  {id:'b20',name:'Автоцистерна',y:1910,q:20,c:1550,kg:1100,cd:2.1,cg:1.05,cx:1.4,truck:true,seats:2,pay:2.5,pk:1.8,comf:1,kind:'tank',art:'tank',note:'Керосин, бензин, молоко — наливом вместо бочек'},
  {id:'b21',name:'Самосвал',y:1912,q:22,c:1300,kg:1300,cd:2.2,cg:1.0,cx:1.5,truck:true,seats:2,pay:2.5,pk:1.7,comf:1,kind:'dump',art:'dump',note:'Опрокидной кузов с подъёмником: песок, щебень, уголь'},
  {id:'b22',name:'Мусоровоз',y:1922,q:20,c:1100,kg:1300,cd:2.2,cg:1.0,cx:1.5,truck:true,seats:3,pay:2,pk:1.8,comf:1,kind:'refuse',art:'refuse',crew:3,note:'Закрытый кузов для городской очистки вместо конной телеги'},
  {id:'b23',name:'Таксомотор',y:1905,q:14,c:900,kg:380,cd:1.4,cg:0.84,cx:1.2,truck:true,seats:4,pay:0.3,pk:1.1,closed:1,comf:1.35,kind:'taxi',art:'taxi',note:'Renault AG (1905): ландоле с таксометром — парижское, а с 1907 года и лондонское, и нью-йоркское такси'},
  {id:'b24',name:'Трактор колёсный',y:1902,q:16,c:430,kg:900,cd:2.4,cg:0.9,cx:1.1,truck:true,seats:1,pay:0.2,pk:0.62,comf:0.7,kind:'tractor',art:'tractor',farm:1,note:'Hart-Parr и Ivel (1902) — первые удачные бензиновые тракторы; Fordson (1917) — первый массовый'},
  {id:'b25',name:'Трактор гусеничный',y:1908,q:30,c:3700,kg:2400,cd:2.6,cg:0.9,cx:1.8,truck:true,seats:1,pay:0.2,pk:3.6,comf:0.7,kind:'crawler',art:'crawler',farm:1,trk:1,note:'Holt Caterpillar: бензиновый гусеничный трактор — в серии с 1908 года; тяжёлая почва, лес, дороги, артиллерия'},
  {id:'b26',name:'Штабной автомобиль',y:1906,q:12,c:490,kg:330,cd:1.25,cg:0.74,cx:1.0,truck:true,seats:5,pay:0.4,pk:1.1,comf:1.1,kind:'staff',art:'staff',mil:1,note:'Усиленный открытый кузов для офицеров и связи'},
  {id:'b27',name:'Военно-санитарный автомобиль',y:1912,q:16,c:820,kg:560,cd:1.7,cg:0.98,cx:1.3,truck:true,seats:6,pay:0.6,pk:1.4,closed:1,comf:1.25,kind:'mamb',art:'mamb',mil:1,crew:2,note:'Четверо носилок под брезентом: от перевязочного пункта до госпиталя'},
  {id:'b28',name:'Бронеавтомобиль',y:1905,q:34,c:8700,kg:1900,cd:2.2,cg:1.1,cx:2.0,truck:true,seats:3,pay:0.5,pk:7,closed:1,comf:0.8,kind:'armored',art:'armored',mil:1,arm:1,crew:3,note:'Charron-Girardot-Voigt (1905–1906): броня и пулемёт во вращающейся башне на автомобильном шасси'},
  {id:'b29',name:'Лёгкий танк',y:1917,q:60,c:9400,kg:5200,cd:3.0,cg:0.9,cx:2.6,truck:true,seats:2,pay:0.3,pk:11,closed:1,comf:0.6,kind:'ltank',art:'ltank',mil:1,arm:2,trk:1,crew:2,note:'Renault FT (1917): вращающаяся башня, мотор сзади — схема всех танков после него; построено больше трёх тысяч'}
);
// Вид техники кузова: у прежних грузовых — фургон и грузовик
function bodyKind(b){return b?b.kind||(b.truck?(b.id==='b6'?'van':'truck'):b.moto?((b.seats||1)>1?'moside':'moto'):''):'';}
// Группы видов — первый шаг конструктора. ic — значок, who — кто покупает
const KIND_GRP={
  car:{n:'Легковой автомобиль',ic:'🚗',who:'семьи, врачи, коммивояжёры, богачи',kinds:['people','middle','lux','sport','taxi']},
  cargo:{n:'Грузовик',ic:'🚚',who:'лавки, заводы, перевозчики',kinds:['van','truck']},
  bus:{n:'Автобус',ic:'🚌',who:'города, автобусные линии, школы',kinds:['bus','coach','school']},
  spec:{n:'Спецтехника',ic:'🚒',who:'города, почта, нефтяные компании, подрядчики',kinds:['fire','amb','mail','tank','dump','refuse']},
  farm:{n:'Трактор',ic:'🚜',who:'фермеры, лесные и дорожные работы',kinds:['tractor','crawler']},
  mil:{n:'Военная техника',ic:'🪖',who:'армия',kinds:['staff','mamb','armored','ltank']},
  moto:{n:'Мотоцикл',ic:'🏍',who:'рабочие, почтальоны, спортсмены',kinds:['moto','moside']}
};
// Виды, появившиеся в 0.51: имя, родительный падеж для подписей, мерка работы
const KIND_NEW={bus:{n:'Городской автобус'},coach:{n:'Междугородний автобус'},school:{n:'Школьный автобус'},fire:{n:'Пожарный автомобиль'},amb:{n:'Санитарный автомобиль'},
  mail:{n:'Почтовый фургон'},tank:{n:'Автоцистерна'},dump:{n:'Самосвал'},refuse:{n:'Мусоровоз'},taxi:{n:'Такси'},tractor:{n:'Трактор колёсный'},crawler:{n:'Трактор гусеничный'},
  staff:{n:'Штабной автомобиль'},mamb:{n:'Военно-санитарный'},armored:{n:'Бронеавтомобиль'},ltank:{n:'Лёгкий танк'}};
function kindGroup(kind){for(const g in KIND_GRP)if(KIND_GRP[g].kinds.includes(kind))return g;return 'car';}
function kindIsNew(kind){return !!KIND_NEW[kind];}
// Эталон соперников для новых видов: год, прототип из истории, детали (кузов — свой). С ним покупатель сравнивает вашу машину
Object.assign(RIVAL_CAR,{
  bus:[[1905,'Milnes-Daimler',{e:'e3',g:'g2',c:'c3',k:'k2',b:'b14',w:'w1'}],[1910,'LGOC B-type',{e:'e4',g:'g5',c:'c4',k:'k2',b:'b14',w:'w1'}],[1920,'AEC K-type',{e:'e14',g:'g6',c:'c4',k:'k2',b:'b14',w:'w1'}],[1925,'Leyland Titan',{e:'e7',g:'g6',c:'c5',k:'k3',b:'b14',w:'w8'}]],
  coach:[[1921,'Fageol Safety Coach',{e:'e6',g:'g5',c:'c5',k:'k3',b:'b15',w:'w7'}],[1927,'Yellow Coach',{e:'e8',g:'g5',c:'c5',k:'k4',b:'b15',w:'w8'}]],
  school:[[1914,'Wayne Works',{e:'e9',g:'g4',c:'c6',k:'k2',b:'b16',w:'w3'}],[1920,'Ford Model TT',{e:'e9',g:'g4',c:'c6',k:'k2',b:'b16',w:'w7'}],[1927,'Blue Bird',{e:'e14',g:'g6',c:'c5',k:'k5',b:'b16',w:'w8'}]],
  fire:[[1906,'Knox',{e:'e3',g:'g5',c:'c3',k:'k2',b:'b17',w:'w1'}],[1911,'American LaFrance',{e:'e4',g:'g5',c:'c4',k:'k2',b:'b17',w:'w1'}],[1914,'Seagrave',{e:'e5',g:'g5',c:'c4',k:'k2',b:'b17',w:'w1'}],[1918,'Ahrens-Fox',{e:'e6',g:'g5',c:'c4',k:'k2',b:'b17',w:'w6'}],[1925,'American LaFrance',{e:'e6',g:'g5',c:'c5',k:'k3',b:'b17',w:'w8'}],[1928,'Ahrens-Fox',{e:'e8',g:'g5',c:'c5',k:'k3',b:'b17',w:'w8'}]],
  amb:[[1909,'Cunningham',{e:'e4',g:'g3',c:'c3',k:'k2',b:'b18',w:'w4'}],[1915,'Ford Model T',{e:'e9',g:'g4',c:'c6',k:'k2',b:'b18',w:'w6'}],[1924,'Dodge Brothers',{e:'e14',g:'g6',c:'c5',k:'k3',b:'b18',w:'w8'}]],
  mail:[[1907,'Peugeot',{e:'e10',g:'g3',c:'c3',k:'k2',b:'b19',w:'w2'}],[1914,'Ford Model T',{e:'e9',g:'g4',c:'c6',k:'k2',b:'b19',w:'w3'}],[1925,'Morris',{e:'e11',g:'g6',c:'c4',k:'k2',b:'b19',w:'w8'}]],
  tank:[[1910,'Saurer',{e:'e4',g:'g2',c:'c4',k:'k2',b:'b20',w:'w1'}],[1920,'Mack AB',{e:'e14',g:'g6',c:'c5',k:'k2',b:'b20',w:'w1'}],[1926,'White',{e:'e7',g:'g6',c:'c5',k:'k3',b:'b20',w:'w8'}]],
  dump:[[1912,'Peerless',{e:'e4',g:'g2',c:'c4',k:'k2',b:'b21',w:'w1'}],[1920,'Mack AC',{e:'e14',g:'g6',c:'c5',k:'k2',b:'b21',w:'w1'}],[1926,'Autocar',{e:'e7',g:'g6',c:'c5',k:'k3',b:'b21',w:'w8'}]],
  refuse:[[1922,'SD Freighter',{e:'e14',g:'g6',c:'c4',k:'k2',b:'b22',w:'w1'}],[1927,'Dennis',{e:'e7',g:'g6',c:'c5',k:'k3',b:'b22',w:'w8'}]],
  taxi:[[1905,'Renault AG',{e:'e10',g:'g3',c:'c3',k:'k2',b:'b23',w:'w2'}],[1911,'Unic',{e:'e9',g:'g3',c:'c3',k:'k2',b:'b23',w:'w4'}],[1922,'Checker',{e:'e14',g:'g6',c:'c4',k:'k2',b:'b23',w:'w7'}],[1928,'Austin 12/4',{e:'e14',g:'g6',c:'c5',k:'k5',b:'b23',w:'w8'}]],
  tractor:[[1902,'Hart-Parr',{e:'e2',g:'g2',c:'c3',k:'k1',b:'b24',w:'w1'}],[1905,'Hart-Parr 22-45',{e:'e3',g:'g2',c:'c3',k:'k1',b:'b24',w:'w1'}],[1910,'IHC Mogul',{e:'e4',g:'g2',c:'c3',k:'k1',b:'b24',w:'w1'}],[1917,'Fordson F',{e:'e9',g:'g6',c:'c6',k:'k1',b:'b24',w:'w1'}],[1924,'McCormick-Deering Farmall',{e:'e9',g:'g6',c:'c4',k:'k2',b:'b24',w:'w1'}]],
  crawler:[[1908,'Holt Caterpillar',{e:'e4',g:'g2',c:'c3',k:'k1',b:'b25',w:'w1'}],[1914,'Holt 75',{e:'e5',g:'g2',c:'c4',k:'k2',b:'b25',w:'w1'}],[1925,'Caterpillar Sixty',{e:'e6',g:'g6',c:'c5',k:'k2',b:'b25',w:'w1'}]],
  staff:[[1906,'Mercedes',{e:'e3',g:'g3',c:'c3',k:'k2',b:'b26',w:'w2'}],[1911,'Vauxhall D-type',{e:'e4',g:'g5',c:'c4',k:'k2',b:'b26',w:'w4'}],[1916,'Dodge Brothers',{e:'e14',g:'g6',c:'c4',k:'k2',b:'b26',w:'w6'}],[1925,'Citroën-Kégresse',{e:'e7',g:'g6',c:'c5',k:'k3',b:'b26',w:'w8'}]],
  mamb:[[1912,'Fiat 15',{e:'e4',g:'g5',c:'c4',k:'k2',b:'b27',w:'w1'}],[1915,'Ford Model T',{e:'e9',g:'g4',c:'c6',k:'k2',b:'b27',w:'w6'}],[1924,'Morris-Commercial',{e:'e14',g:'g6',c:'c5',k:'k3',b:'b27',w:'w8'}]],
  armored:[[1905,'Charron-Girardot-Voigt',{e:'e3',g:'g3',c:'c3',k:'k2',b:'b28',w:'w1'}],[1914,'Rolls-Royce',{e:'e5',g:'g5',c:'c4',k:'k2',b:'b28',w:'w6'}],[1920,'Lanchester',{e:'e6',g:'g5',c:'c5',k:'k3',b:'b28',w:'w6'}],[1928,'Vickers Crossley',{e:'e7',g:'g6',c:'c5',k:'k3',b:'b28',w:'w8'}]],
  ltank:[[1917,'Renault FT',{e:'e14',g:'g5',c:'c4',k:'k2',b:'b29',w:'w1'}],[1925,'Vickers Medium',{e:'e6',g:'g5',c:'c5',k:'k2',b:'b29',w:'w1'}],[1928,'Т-18 (МС-1)',{e:'e14',g:'g6',c:'c5',k:'k2',b:'b29',w:'w1'}]]
});
