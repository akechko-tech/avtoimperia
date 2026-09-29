/* ================= NEWSREEL: кинохроника — короткие ролики о технологиях и событиях автопрома ================= */
// Кадры: фото эпохи (с медленным наездом камеры), титры немого кино, машины и завод игрока. Диктор — голос устройства
// (на Android — системный синтезатор речи, в браузере — Web Speech), если его нет — только титры. Музыка стихает, трещит проектор.
// Кадр: {c:'Титр',s:'подзаголовок'} — титр; {i:'фото',cap,say} — фото эпохи; {plant:1,say} — ваш завод; {car:md,say} — машина.
// В тексте: {co} — компания, {city} — город, {y} — год.
const REELS={
  intro:{t:'Экипажи без лошадей',y:1895,sh:[
    {c:'Экипажи без лошадей',s:'1886 — 1895'},
    {i:'Benz Patent-Motorwagen',cap:'«Моторваген» Карла Бенца, 1886',say:'В 1886 году инженер Карл Бенц из Мангейма получил патент на «экипаж с газовым двигателем». Три колеса, мотор под сиденьем — и скорость пешехода, который очень спешит.'},
    {i:'Carl Benz',cap:'Карл Бенц',say:'Первую дальнюю поездку совершила его жена Берта: в 1888 году она без спроса взяла машину и проехала сто с лишним километров до своих родителей. Бензин покупала в аптеках.'},
    {i:'Paris–Bordeaux–Paris',cap:'Гонка Париж — Бордо — Париж, 1895',say:'Летом 1895 года Эмиль Левассор проехал от Парижа до Бордо и обратно — тысяча двести километров почти без отдыха, сорок восемь часов за рулём. Мир понял: мотор может заменить лошадь.'},
    {i:'Émile Levassor',cap:'Эмиль Левассор',say:'Мотор впереди, сцепление, коробка передач — «система Панара» Левассора станет схемой почти всех автомобилей следующего века.'},
    {c:'Эпоха начинается',s:'Кто откроет мастерскую сегодня, может посадить за руль весь мир'}]},
  'h:truck':{t:'Мотор вместо лошади',y:1896,sh:[
    {c:'Первый грузовик',s:'Каннштатт, 1896'},
    {i:'Daimler Motor-Lastwagen',cap:'Грузовик Daimler, 1896',say:'В 1896 году Готлиб Даймлер построил моторную телегу: четыре лошадиные силы, полторы тонны груза. Первую машину купили в Лондоне.'},
    {plant:1,say:'Лавочники, пивовары и почта считают: лошадь надо кормить каждый день, а мотор — только когда он работает. Так рождается новый покупатель — фирмы и ведомства.'},
    {c:'Грузовики изменят города',s:'В войну их станут призывать в армию'}]},
  'h:merc':{t:'«Мерседес» задаёт планку',y:1901,sh:[
    {c:'Автомобиль нового века',s:'Ницца, март 1901'},
    {i:'Mercedes 35 hp',cap:'Mercedes 35 PS, 1901',say:'Эмиль Еллинек, богатый любитель гонок, заказал у фирмы Даймлера машину — низкую, лёгкую и мощную — и назвал её именем дочери: Мерседес.'},
    {i:'Wilhelm Maybach',cap:'Вильгельм Майбах',say:'Конструктор Вильгельм Майбах поставил сотовый радиатор, штампованную стальную раму и мотор в тридцать пять сил. В Ницце новинка выиграла всё, что можно.'},
    {i:'Emil Jellinek',cap:'Эмиль Еллинек',say:'«Мы вступили в эру Мерседеса», — сказал глава французского автоклуба. Карета без лошади превратилась в автомобиль.'},
    {c:'Все марки будут догонять',s:'Низкая рама, мощный мотор, сотовый радиатор'}]},
  'h:modelT':{t:'Автомобиль для всех',y:1908,sh:[
    {c:'Model T',s:'Детройт, 1 октября 1908'},
    {i:'Ford Model T',cap:'Ford Model T',say:'Генри Форд показал машину, которую может купить фермер: простую, высокую, чтобы проехать по бездорожью, из прочной ванадиевой стали. Первая цена — восемьсот пятьдесят долларов.'},
    {i:'Henry Ford',cap:'Генри Форд',say:'«Я построю автомобиль для многих», — обещал Форд. К 1925 году Model T стоила уже двести шестьдесят долларов, а к 1927-му их выпустили пятнадцать миллионов.'},
    {c:'Цены падают по всему миру',s:'В народном классе появляются массовые марки'}]},
  'h:henry':{t:'Рождение спортивной машины',y:1910,sh:[
    {c:'Пробег принца Генриха',s:'Германия, 1910'},
    {i:'Prinz-Heinrich-Fahrt 1910',cap:'Пробег принца Генриха, 1910',say:'Принц Генрих Прусский учредил призы для туристических машин, но заводы привезли лёгкие быстрые машины с мощными моторами.'},
    {i:'Ferdinand Porsche',cap:'Фердинанд Порше',say:'Три первых места заняли машины Austro-Daimler, за рулём победителя сидел их конструктор — Фердинанд Порше. Машину так и назвали: «Принц Генрих».'},
    {i:'Austro-Daimler Prince Henry',cap:'Austro-Daimler «Принц Генрих»',say:'Так родился новый класс — спортивная машина: открытый облегчённый кузов, ковшеобразные сиденья, настроенный мотор.'},
    {c:'Спортивные машины',s:'Их немного, но за скорость платят щедро'}]},
  'h:starter':{t:'Мотор заводится кнопкой',y:1912,sh:[
    {c:'Электрический стартер',s:'Cadillac, 1912'},
    {i:'Charles F. Kettering',cap:'Чарльз Кеттеринг',say:'Заводная ручка калечила водителей: если мотор давал обратный удар, ручка ломала руку. Глава Cadillac Генри Лиланд поручил изобретателю Чарльзу Кеттерингу избавиться от неё.'},
    {i:'Cadillac Model Thirty',cap:'Cadillac 1912 года',say:'Кеттеринг построил электрический стартер и генератор фар. С 1912 года Cadillac заводится нажатием педали, а марка второй раз получает кубок Дьюара.'},
    {c:'Водить может каждый',s:'Стартер ждут в дорогих машинах'}]},
  'h:small':{t:'Машина размером с мотоцикл',y:1922,sh:[
    {c:'Малолитражки',s:'Англия и Франция, 1922'},
    {i:'Austin 7',cap:'Austin Seven',say:'Герберт Остин нарисовал на бильярдном столе крошечную машину: мотор меньше литра, четыре тесных места и цена мотоцикла с коляской.'},
    {i:'Citroën 5CV',cap:'Citroën 5CV',say:'В том же году Андре Ситроен выпустил 5CV — «маленький лимончик». В Европе, где налог берут с каждой лошадиной силы, малолитражка становится машиной для всех.'},
    {c:'Автомобиль приходит в каждую семью',s:'Даже там, где бензин дорог'}]},
  'h:line':{t:'Движущийся конвейер',y:1913,sh:[
    {c:'Движущийся конвейер',s:'Хайленд-Парк, октябрь 1913'},
    {i:'Highland Park Ford Plant',cap:'Завод Форда в Хайленд-Парке',say:'Осенью 1913 года на заводе Форда шасси потянули тросом вдоль цеха. Машина едет к рабочему, рабочий стоит на месте.'},
    {i:'Henry Ford',cap:'Генри Форд',say:'Сборка шасси сократилась с двенадцати с половиной часов до полутора. Через год Форд платил рабочим пять долларов в день — вдвое больше обычного.'},
    {i:'Ford Model T',cap:'Ford Model T',say:'Model T дешевела год за годом: конвейер сделал автомобиль вещью для всех.'},
    {c:'Эпоха массового производства',s:'Такой же конвейер можно построить у «{co}» — вкладка «Завод»'}]},
  'h:modelA':{t:'Ford показал Model A',y:1927,sh:[
    {c:'Прощай, Model T',s:'Детройт, декабрь 1927'},
    {i:'Ford Model A (1927–1931)',cap:'Ford Model A',say:'После пятнадцати миллионов Model T заводы Форда полгода стояли: конвейеры перестраивали под новую машину.'},
    {i:'Henry Ford',cap:'Генри Форд',say:'Model A — тормоза на все колёса, безопасное стекло, четыре цвета вместо одного чёрного. В первые дни посмотреть на неё пришли миллионы людей.'},
    {c:'Одна модель на века больше не работает',s:'Покупатели хотят выбирать'}]},
  // заводские технологии
  'tech:tools:1':{t:'Станки вместо напильника',sh:[
    {c:'Токарные и фрезерные станки',s:'Завод «{co}», {y}'},
    {plant:1,say:'На заводе «{co}» заработали токарные и фрезерные станки. Раньше деталь выпиливали и подгоняли напильником — теперь её точит машина.'},
    {i:'Daimler-Motoren-Gesellschaft',cap:'Мастерские эпохи',say:'Так работают лучшие мастерские: станок делает деталь быстрее и точнее, чем самый опытный слесарь, а слесарь становится станочником.'},
    {c:'Меньше часов на машину',s:'С этого начинается любой большой завод'}]},
  'tech:tools:2':{t:'Станок под одну деталь',sh:[
    {c:'Специальные станки',s:'Завод «{co}», {y}'},
    {i:'Cadillac Model A',cap:'Cadillac Генри Лиланда',say:'Генри Лиланд, основатель Cadillac, требовал точности в тысячную долю дюйма. Для этого нужны станки, построенные под одну-единственную деталь.'},
    {plant:1,say:'Такой станок не умеет ничего другого, зато делает свою деталь сотнями в день. Это первый шаг к массовому выпуску.'},
    {c:'Точность и скорость',s:'Детали больше не подгоняют по месту'}]},
  'tech:tools:3':{t:'Сорок пять отверстий разом',sh:[
    {c:'Многошпиндельные автоматы',s:'Завод «{co}», {y}'},
    {i:'Highland Park Ford Plant',cap:'Хайленд-Парк, завод Форда',say:'На заводе Форда в Хайленд-Парке многошпиндельный станок сверлил сорок пять отверстий в блоке цилиндров за один проход.'},
    {plant:1,say:'Теперь такие автоматы стоят и у «{co}». Рабочий только ставит заготовку и нажимает рычаг — остальное делает машина.'},
    {c:'Часы превращаются в минуты',s:'Себестоимость падает'}]},
  'tech:tools:4':{t:'Деталь едет сама',sh:[
    {c:'Автоматическая линия',s:'Завод «{co}», {y}'},
    {i:'Ford River Rouge complex',cap:'Завод Ривер-Руж',say:'В 1924 году инженер Фрэнк Вуллард построил на моторном заводе Morris в Ковентри автоматическую линию: блок цилиндров сам переезжал от станка к станку.'},
    {plant:1,say:'Машины обрабатывают деталь одна за другой почти без рабочих рук. Такая линия стоит дорого, но окупается миллионами деталей.'},
    {c:'Завод будущего',s:'Автоматы работают там, где раньше стояли сотни людей'}]},
  'tech:elec:1':{t:'Электричество в цехах',sh:[
    {c:'Электромотор вместо паровой машины',s:'Завод «{co}», {y}'},
    {plant:1,say:'Раньше все станки крутила одна паровая машина: под потолком тянулись валы и кожаные ремни, в цехах было темно и опасно.'},
    {plant:1,say:'Теперь группы станков вращает электромотор. Цеха стали светлее, ремней меньше, а станки можно переставлять.'},
    {c:'Светлые цеха',s:'Меньше часов и больше мощности'}]},
  'tech:elec:2':{t:'Свой мотор у каждого станка',sh:[
    {c:'Индивидуальный привод',s:'Завод «{co}», {y}'},
    {i:'Highland Park Ford Plant',cap:'Хайленд-Парк, 1910-е',say:'На новых заводах у каждого станка свой электромотор. Станки ставят не там, где проходит вал, а в том порядке, в каком идёт работа.'},
    {plant:1,say:'Деталь движется от станка к станку по прямой. Так из электричества вырастает поточная линия.'},
    {c:'Путь к конвейеру открыт',s:''}]},
  'tech:parts:1':{t:'Детали без напильника',sh:[
    {c:'Взаимозаменяемые детали',s:'Бруклендс, 1908'},
    {i:'Cadillac Model A',cap:'Одноцилиндровый Cadillac',say:'В 1908 году в Англии три машины Cadillac разобрали до винтика, детали перемешали и собрали снова — без единого напильника.'},
    {i:'Cadillac Model Thirty',cap:'Cadillac',say:'Машины завелись и прошли пятьсот миль по треку Бруклендс. Королевский автоклуб вручил Cadillac кубок Дьюара.'},
    {plant:1,say:'Теперь и на заводе «{co}» каждую деталь проверяют калибром: любая подходит к любой машине.'},
    {c:'Калибры и допуски',s:'Без них не бывает конвейера'}]},
  'tech:line:1':{t:'Машина едет к рабочему',sh:[
    {c:'Поточная сборка',s:'Лансинг, 1901'},
    {i:'Ransom E. Olds',cap:'Рэнсом Олдс',say:'В 1901 году Рэнсом Олдс поставил шасси на деревянные тележки: машина переезжает от поста к посту, и у каждого поста рабочие делают одну операцию.'},
    {i:'Oldsmobile Curved Dash',cap:'Oldsmobile Curved Dash',say:'Curved Dash стал первым автомобилем, который выпускали тысячами. О нём даже сложили песню — «В моём весёлом Олдсмобиле».'},
    {plant:1,say:'Теперь поток работает и на заводе «{co}» в {city}. Сборка идёт быстрее, мощность завода выросла.'},
    {c:'Поток',s:'Каждому рабочему — своя операция'}]},
  'tech:line:2':{t:'Движущийся конвейер',sh:[
    {c:'Движущийся конвейер',s:'Хайленд-Парк, октябрь 1913'},
    {i:'Highland Park Ford Plant',cap:'Завод Форда в Хайленд-Парке',say:'Осенью 1913 года на заводе Форда шасси потянули тросом вдоль цеха. Машина едет к рабочему, рабочий стоит на месте.'},
    {i:'Henry Ford',cap:'Генри Форд',say:'Сборка шасси сократилась с двенадцати с половиной часов до полутора. Через год Форд платил рабочим пять долларов в день — вдвое больше обычного.'},
    {i:'Ford Model T',cap:'Ford Model T',say:'Model T дешевела год за годом: конвейер сделал автомобиль вещью для всех.'},
    {plant:1,say:'Теперь конвейер работает на заводе «{co}». Но помните: каждая лишняя модель на ленте стоит эффективности.'},
    {c:'Эпоха массового производства',s:''}]},
  'tech:school:1':{t:'Заводская школа',sh:[
    {c:'Школа мастеров',s:'Завод «{co}», {y}'},
    {plant:1,say:'На заводе «{co}» открылась школа: старые мастера учат молодых читать чертежи, работать на станках и проверять детали.'},
    {i:'Henry Ford',cap:'Генри Форд',say:'Форд откроет свою заводскую школу в 1916 году: подростки учатся ремеслу и получают за это жалованье.'},
    {c:'Обученные рабочие',s:'Меньше брака, быстрее осваивают новые модели'}]},
  'tech:qc:1':{t:'Отдел технического контроля',sh:[
    {c:'Контроль качества',s:'Завод «{co}», {y}'},
    {plant:1,say:'Контролёры с калибрами и лекалами проверяют каждую партию деталей. Бракованную деталь лучше выбросить на заводе, чем чинить у покупателя.'},
    {c:'Меньше брака',s:'Меньше гарантийных ремонтов, лучше репутация'}]},
  'tech:qc:2':{t:'Испытательный стенд',sh:[
    {c:'Испытательный стенд',s:'Завод «{co}», {y}'},
    {i:'Rolls-Royce Silver Ghost',cap:'Rolls-Royce Silver Ghost',say:'Rolls-Royce прославился тем, что каждый мотор часами работал на стенде, прежде чем попасть в машину.'},
    {plant:1,say:'Теперь и на заводе «{co}» моторы испытывают до сборки: слабый мотор заметят инженеры, а не покупатель.'},
    {c:'Надёжность — лучшая реклама',s:''}]},
  'tech:qc:3':{t:'Заводская лаборатория',sh:[
    {c:'Наука на заводе',s:'Завод «{co}», {y}'},
    {i:'Charles F. Kettering',cap:'Чарльз Кеттеринг',say:'В 1920 году General Motors создала исследовательскую лабораторию во главе с Чарльзом Кеттерингом. Химики проверяли сталь, металлурги — отливки.'},
    {plant:1,say:'У «{co}» теперь своя лаборатория: брака почти нет, а инженеры знают, из чего сделана каждая деталь.'},
    {c:'Брака почти нет',s:''}]},
  'tech:foundry:1':{t:'Свой мотор',sh:[
    {c:'Литейка и моторный цех',s:'Завод «{co}», {y}'},
    {plant:1,say:'Раньше моторы покупали у поставщиков. Теперь у «{co}» своя литейка: блоки цилиндров отливают и обрабатывают на заводе.'},
    {i:'Ford River Rouge complex',cap:'Завод Ривер-Руж',say:'Форд пошёл дальше всех: на заводе Ривер-Руж руда превращалась в сталь, а сталь — в готовую машину за несколько дней.'},
    {c:'Мотор дешевле на восемнадцать процентов',s:''}]},
  'tech:press:1':{t:'Стальной кузов',sh:[
    {c:'Кузовной пресс',s:'Филадельфия, 1914'},
    {i:'Dodge Brothers',cap:'Dodge Brothers',say:'Кузова строили как кареты: деревянный каркас, обшивка, недели работы плотников. Эдвард Бадд из Филадельфии предложил штамповать кузов из стали.'},
    {i:'Dodge Model 30',cap:'Dodge 1914 года',say:'Первыми цельностальные кузова Бадда заказали братья Додж. Прессы давят кузов за минуты, а сталь прочнее дерева.'},
    {plant:1,say:'Теперь прессы стоят и у «{co}»: кузов дешевле, собирать его быстрее.'},
    {c:'Прочнее и дешевле',s:''}]},
  'tech:paint:1':{t:'Краска, которая сохнет за часы',sh:[
    {c:'Нитроэмаль',s:'Детройт, 1924'},
    {i:'Oakland Motor Car Company',cap:'Oakland 1924 года',say:'Лак на машине сох неделями: заводы держали огромные сушильные склады. Химики DuPont создали нитроэмаль «Дюко» — она сохнет за несколько часов.'},
    {plant:1,say:'Первой машиной в нитроэмали стал Oakland компании General Motors — ярко-синий. Теперь и «{co}» красит машины за часы, и в любые цвета.'},
    {c:'Цвет по вкусу покупателя',s:'Больше не только чёрный'}]},
  'tech:credit:1':{t:'Машина в рассрочку',sh:[
    {c:'Продажа в кредит',s:'Нью-Йорк, 1919'},
    {i:'William C. Durant',cap:'Уильям Дюрант, основатель General Motors',say:'В 1919 году General Motors открыла свою кредитную компанию: покупатель платит частями, а ездит сразу.'},
    {plant:1,say:'К концу двадцатых в Америке в рассрочку покупали три машины из четырёх. Теперь своя кредитная контора есть и у «{co}».'},
    {c:'Спрос выше',s:'Но касса ждёт денег дольше'}]}
};
// Какие исторические события сопровождаются роликом
const HIST_REEL={'Daimler Motor-Lastwagen':'h:truck','Mercedes 35 hp':'h:merc','Ford Model T':'h:modelT','Prinz-Heinrich-Fahrt 1910':'h:henry','Charles F. Kettering':'h:starter','Highland Park Ford Plant':'h:line','Austin 7':'h:small','Ford Model A (1927–1931)':'h:modelA'};
/* ---------- ролики, которые пишет сама игра: новая модель и новая деталь ---------- */
function reelModel(md,s){const p=parts(md),st=carStats(md,0,s.y),C=classCompare(md,s,s.country),g=KIND_NAME[rivalKind(md)];
  return {t:`Новинка «${md.name}»`,y:s.y,sh:[
    {c:`«${md.name}»`,s:`${g} · завод «{co}», {y}`},
    {car:md,yaw:0.62,cap:`«${md.name}» · ${p.e.name}`,say:`На заводе «{co}» в городе {city} начали выпуск новой модели — «${md.name}». Мотор в ${Math.round(st.hp)} ${plural(Math.round(st.hp),'лошадиную силу','лошадиные силы','лошадиных сил')}, скорость до ${Math.round(st.vmax*3.6)} километров в час.`},
    {car:md,yaw:1.35,pitch:0.18,cap:`«${md.name}» · ${money(md.price)}`,say:`Цена — ${Math.round(md.price)} ${plural(Math.round(md.price),'доллар','доллара','долларов')}. Обозреватели сравнили новинку с ${C.ref.name}: ${C.S>=1.08?'наша машина лучше соперников':C.S>=0.9?'не хуже соперников':'пока уступает соперникам'}.`},
    {plant:1,say:`Первые машины уже сходят с линии. Дилеры ждут покупателей.`},
    {c:'Новая машина — новые покупатели',s:''}]};}
function reelPart(id,s){const cat=PART_CATS.find(c=>byId(c.arr(),id)),x=cat&&byId(cat.arr(),id);if(!x)return null;const h=PART_HIST[id],first=s.firsts&&s.firsts['part:'+id];
  const best=s.models.filter(m=>m.status!=='off'&&m[cat.k]===id)[0]||s.models.filter(m=>m.status==='prod')[0];
  return {t:(first?'Первыми в мире: ':'Новая деталь: ')+x.name,y:s.y,sh:[
    {c:x.name,s:`${cat.name} · КБ «{co}», {y}`},
    {plant:1,say:`Конструкторское бюро «{co}» построило ${cat.name.toLowerCase()} нового поколения: ${x.name.toLowerCase()}.`},
    ...(x.note?[{c:cat.name,s:x.note}]:[]),
    ...(best?[{car:best,yaw:0.62,cap:`«${best.name}»`,say:first?`В истории это сделали ${h?h[1]:'другие'}${h?' в '+h[0]+' году':''}, а «{co}» — раньше. Газеты всего мира пишут о новинке.`:`Новую деталь можно поставить на машины «{co}» — раньше, чем её предложат поставщики.`}]:[]),
    {c:first?'Первыми в мире':'Раньше рынка',s:h?`В истории — ${h[1]}, ${h[0]}`:''}]};}
/* ---------- итоги года: ролик собирается из того, что случилось с компанией за год ---------- */
// Снимок года делается в январе, когда пресса называет королей: продажи, лучшая машина, победы, титулы, место в наследии
function yearRecord(s,y){const R=s.yrec=s.yrec||{};
  const log=(s.raceLog||[]).filter(r=>r.y===y),wins=log.filter(r=>r.place===1).map(r=>{const rc=RACES.find(x=>x.key===r.key);return {n:r.name,m:r.model||'',d:r.drv||'',maj:r.major?1:0,img:rc&&rc.img&&IMG[rc.img]?rc.img:''};});
  wins.sort((a,b)=>b.maj-a.maj||(b.img?1:0)-(a.img?1:0));
  // продано за год: дилерами и по заказам (разница с прошлогодним снимком); в первый раз — по продажам дилеров
  const pod=log.filter(r=>r.place>1&&r.place<=3).length,had=!!s.ytot,prevT=s.ytot||{},cur={};let best=null,bv=0,sum=0;
  s.models.forEach(m=>{const t=m.totalSold||0;cur[m.id]=t;const d=Math.max(0,t-(prevT[m.id]||0));sum+=d;if(d>bv){bv=d;best=m;}});s.ytot=cur;
  const sold=had?sum:(s.peakLast||0);if(!had)bv=Math.min(bv,sold);
  let place=0,ahead='';try{const t=legacyTable(s);place=t.place;const a=t.rows[t.place-2];ahead=a?a.n:'';}catch(e){}
  const flv=FLAVOR.filter(f=>f[0]===y&&f[3]&&IMG[f[3]]).slice(-2).map(f=>f[2]);
  R[y]={sold,rank:s.lastRank&&s.lastRank<99?s.lastRank:0,wins:wins.slice(0,4),nw:wins.length,pod,top:best?best.id:null,topN:bv,
    titles:(s.kings&&s.kings.y===y?s.kings.mine:[]).slice(),place,ahead,flv};
  Object.keys(R).forEach(k=>{if(+k<y-40)delete R[k];});}
const capF=t=>t.charAt(0).toUpperCase()+t.slice(1);
function reelYear(y,s){const r=(s.yrec||{})[y];if(!r)return null;const md=r.top!==null&&s.models.find(m=>m.id===r.top),sh=[{c:`Итоги ${y} года`,s:'«{co}» · {city}'}];
  sh.push({plant:1,say:r.sold>0?`За ${y} год «{co}» продала ${carsN(r.sold)}${r.rank?` — ${r.rank}-е место среди марок страны`:''}.`:`${y} год «{co}» провела в мастерской: машины ещё только готовятся к продаже.`});
  if(md&&r.topN>0)sh.push({car:md,yaw:0.62,cap:`«${md.name}»`,say:`Главная машина года — «${md.name}»${r.topN<r.sold?`: ${carsN(r.topN)} из ${fmtN(r.sold)}`:''}.`});
  r.wins.slice(0,2).forEach(w=>sh.push(w.img?{i:w.img,cap:`${w.n} · ${y}`,say:`Победа в гонке «${w.n}»${w.d?`: за рулём ${w.d}`:''}${w.m?`, машина «${w.m}»`:''}.`}:{c:`Победа: ${w.n}`,s:[w.d,w.m?'«'+w.m+'»':''].filter(Boolean).join(' · ')}));
  if(r.nw>2)sh.push({c:`Всего ${r.nw} ${plural(r.nw,'победа','победы','побед')} за год`,s:'гоночная слава продаёт машины'});
  else if(!r.nw&&r.pod)sh.push({c:`${r.pod} ${plural(r.pod,'подиум','подиума','подиумов')} в гонках`,s:'первая победа — впереди'});
  if(r.titles.length)sh.push({c:'👑 '+r.titles.map(capF).join(' · '),s:'титулы года по версии прессы',say:`Газеты назвали «{co}»: ${r.titles.join(', ').toLowerCase()}.`});
  (r.flv||[]).slice(0,1).forEach(t=>{const f=flvByTitle(t);if(!f)return;const m=String(FLAVOR_TXT[t]||t).match(/^[^.!?]*[.!?]/);sh.push({i:f[3],cap:t,say:m?m[0]:t});});
  if(r.place)sh.push({c:`Наследие: ${r.place}-е место`,s:r.ahead?`впереди — ${r.ahead}`:'«{co}» — первая среди великих марок',say:r.place===1?'В гонке за наследие эпохи «{co}» впереди всех.':`В гонке за наследие эпохи «{co}» на ${r.place}-м месте. Следующая цель — ${r.ahead}.`});
  sh.push({c:String(y+1),s:'Новый год — новые машины, гонки и рекорды'});
  return {t:`Итоги ${y} года`,y,sh};}
function reelGet(id,s){if(REELS[id])return REELS[id];
  if(id.startsWith('model:')){const md=s.models.find(m=>m.id===+id.slice(6));return md?reelModel(md,s):null;}
  if(id.startsWith('part:'))return reelPart(id.slice(5),s);
  if(id.startsWith('year:'))return reelYear(+id.slice(5),s);
  return null;}
/* ---------- кинохроника прямо в газете: кадр плёнки с кнопкой ▶ ---------- */
function paperReelId(o){if(o.reel)return o.reel;const c=(o.choices||[]).find(c=>/^reel:/.test(c[1]));return c?c[1].slice(5):'';}
function reelPoster(R,s){for(const x of R.sh)if(x.i&&IMG[x.i])return `<img src="${IMG[x.i].src}" alt="" referrerpolicy="no-referrer">`;
  const c=R.sh.find(x=>x.car);if(c)return carArt(c.car,{w:360,yaw:c.yaw||0.62,pitch:0.28});
  try{const v=plantImage(s);if(v&&v.url)return `<img src="${v.url}" alt="">`;}catch(e){}return '<em>КИНО</em>';}
function paperReelHTML(id,s){const R=id&&reelGet(id,s);if(!R)return '';const d=Math.round(R.sh.reduce((a,x)=>a+reelShotDur(x),2.6));
  return `<button class="p-reel" data-act="reel" data-k="${esc(id)}" aria-label="Смотреть кинохронику"><span class="p-reel-f">${reelPoster(R,s)}<i>▶</i></span><span class="p-reel-t"><b>Кинохроника</b>${esc(reelFill(R.t,s))}<small>${d<60?d+' сек':'около '+Math.round(d/60)+' мин'} · смотреть</small></span></button>`;}
function reelTitle(id,s){const R=reelGet(id,s);return R?R.t:'';}
// Открыть ролик для хроники и предложить посмотреть: событие с кнопкой «Кинохроника»
function reelUnlock(s,id){s.reels=s.reels||[];if(!s.reels.includes(id)){s.reels.push(id);if(s.reels.length>60)s.reels.shift();}}
function reelOffer(s,id,title,deck,text){if(!reelGet(id,s))return;reelUnlock(s,id);
  pushEvent({own:1,kicker:'Кинохроника',title,deck:deck||'',text:(text?text+'\n':'')+'Кинохроника расскажет, как это было в истории и что это значит для автомобилей.',choices:[['Дальше','ok'],['▶ Смотреть кинохронику','reel:'+id]]},true);}
/* ---------- голос диктора ---------- */
const REEL_VOICE_KEY='avt-reel-voice';
function reelVoiceOn(){try{return localStorage.getItem(REEL_VOICE_KEY)!=='0';}catch(e){return true;}}
let TTS_VOICE=null;
function ttsPick(){if(!window.speechSynthesis)return null;const V=speechSynthesis.getVoices()||[];return V.find(v=>/^ru/i.test(v.lang)&&/google|milena|yuri|irina|pavel|dmitr|svetlana/i.test(v.name))||V.find(v=>/^ru/i.test(v.lang))||null;}
try{if(window.speechSynthesis){TTS_VOICE=ttsPick();speechSynthesis.onvoiceschanged=()=>{TTS_VOICE=ttsPick();};}}catch(e){}
function ttsReady(){try{if(window.AndroidTTS&&AndroidTTS.ttsReady())return true;}catch(e){}return !!(window.speechSynthesis&&(TTS_VOICE=TTS_VOICE||ttsPick()));}
function ttsSay(text,onEnd){
  let fired=false;const done=()=>{if(!fired){fired=true;onEnd&&onEnd();}};
  try{if(window.AndroidTTS&&AndroidTTS.ttsReady()){AndroidTTS.speak(text);const t0=Date.now(),iv=setInterval(()=>{if(!REEL){clearInterval(iv);return;}let sp=true;try{sp=AndroidTTS.speaking();}catch(e){sp=false;}if((Date.now()-t0>700&&!sp)||Date.now()-t0>40000){clearInterval(iv);done();}},250);return true;}}catch(e){}
  try{if(window.speechSynthesis&&(TTS_VOICE=TTS_VOICE||ttsPick())){const u=new SpeechSynthesisUtterance(text);u.lang=TTS_VOICE.lang||'ru-RU';u.voice=TTS_VOICE;u.rate=1.02;u.pitch=0.92;u.onend=done;u.onerror=done;speechSynthesis.cancel();speechSynthesis.speak(u);return true;}}catch(e){}
  return false;}
function ttsStop(){try{if(window.AndroidTTS)AndroidTTS.stop();}catch(e){}try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}}
/* ---------- проигрыватель ---------- */
let REEL=null;
function reelFill(t,s){return String(t||'').replace(/\{co\}/g,s.company).replace(/\{city\}/g,COUNTRIES[s.country].city).replace(/\{y\}/g,s.y);}
function reelShotHTML(sh,s,Q){
  if(sh.c!==undefined)return `<div class="rl-card"><div class="rl-orn"><b>${esc(reelFill(sh.c,s))}</b>${sh.s?`<i>${esc(reelFill(sh.s,s))}</i>`:''}</div></div>`;
  const U=Q?Q.used:{},plantImg=()=>{try{const v=plantImage(s);return v&&v.url?`<img class="rl-img plant" src="${v.url}" alt="">`:'';}catch(e){return '';}};
  const carImg=md=>`<div class="rl-car">${carArt(md,{w:900,yaw:md===sh.car?sh.yaw:0.62,pitch:md===sh.car&&sh.pitch!==undefined?sh.pitch:0.28})}</div>`;
  let img='',cap=sh.cap;
  if(sh.i&&IMG[sh.i])img=`<img class="rl-img" src="${IMG[sh.i].src}" alt="" referrerpolicy="no-referrer">`;
  else if(sh.car)img=carImg(sh.car);
  else if(sh.plant){img=plantImg();U.plant=1;cap='';}
  else{const best=s.models.filter(m=>m.status==='prod')[0];
    if(!U.plant){img=plantImg();U.plant=1;cap='';}
    else if(best&&!U.car){img=carImg(best);U.car=1;cap=`«${best.name}» компании «${s.company}»`;}
    else img=`<div class="rl-card photo"><div class="rl-orn"><b>${esc(reelFill(sh.cap||'Кинохроника',s))}</b><i>кадры не сохранились</i></div></div>`;}
  return img+(cap&&!/rl-card/.test(img)?`<div class="rl-cap">${esc(reelFill(cap,s))}</div>`:'');}
function playReel(id){
  const s=G,R0=s&&reelGet(id,s);if(!R0||REEL)return;reelUnlock(s,id);
  // Safari разрешает голос только после нажатия: «разогреваем» синтезатор тихой фразой прямо в обработчике нажатия
  try{if(reelVoiceOn()&&!window.AndroidTTS&&window.speechSynthesis){const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}}catch(e){}
  const el=document.createElement('div');el.id='reel';el.className='reel';
  el.innerHTML=`<div class="rl-title">Кинохроника · ${esc(reelFill(R0.t,s))}${R0.y&&!String(R0.t).includes(R0.y)?' · '+R0.y:''}</div>
    <div class="rl-frame"><div class="rl-shots"></div><canvas class="rl-grain" width="160" height="120"></canvas><i class="rl-scr"></i><i class="rl-scr b"></i><div class="rl-flick"></div><div class="rl-vig"></div><div class="rl-bar"><i></i></div></div>
    <div class="rl-sub"></div>
    <div class="rl-ctl"><button class="rl-btn" data-rl="voice" aria-label="Голос диктора">${reelVoiceOn()?'🔊':'🔇'}</button><button class="rl-btn" data-rl="next" aria-label="Следующий кадр">▸▸</button><button class="rl-btn" data-rl="close" aria-label="Закрыть">✕</button></div>`;
  document.body.appendChild(el);
  const shots=[{leader:1},...R0.sh];REEL={id,R:R0,shots,i:-1,el,t0:performance.now(),timer:0,raf:0,used:{}};
  el.addEventListener('click',e=>{const b=e.target.closest('[data-rl]');if(b){e.stopPropagation();const k=b.dataset.rl;if(k==='close')reelClose();else if(k==='next')reelNext();else if(k==='voice'){const on=!reelVoiceOn();try{localStorage.setItem(REEL_VOICE_KEY,on?'1':'0');}catch(_){}b.textContent=on?'🔊':'🔇';if(!on)ttsStop();}return;}
    reelNext();});
  reelAudio(true);reelNext();reelFx();
}
function reelShotDur(sh){const t=(sh.say||sh.cap||'')+'';return sh.leader?2.6:sh.c!==undefined?(sh.say?Math.max(3.4,2.5+t.length/11):3.6):Math.min(18,Math.max(5,2.5+t.length/11));}
function reelNext(){const Q=REEL;if(!Q)return;clearTimeout(Q.timer);ttsStop();Q.i++;
  if(Q.i>=Q.shots.length){reelClose();return;}
  const s=G,sh=Q.shots[Q.i],box=Q.el.querySelector('.rl-shots'),div=document.createElement('div');if(!box){reelClose();return;}div.className='rl-shot';
  div.innerHTML=sh.leader?`<div class="rl-leader"><b>3</b></div>`:reelShotHTML(sh,s,Q);box.appendChild(div);
  requestAnimationFrame(()=>div.classList.add('on'));
  [...box.children].forEach(c=>{if(c!==div){c.classList.remove('on');setTimeout(()=>c.remove(),900);}});
  const dur=reelShotDur(sh);
  // медленный наезд камеры: каждое фото — своё направление
  const im=div.querySelector('.rl-img,.rl-car');if(im&&im.animate){const r=mulberry32(hashStr(Q.id+Q.i)),z0=1.04+r()*0.06,z1=z0+0.08+r()*0.1,dx=(r()-0.5)*6,dy=(r()-0.5)*4;
    try{im.animate([{transform:`translate(-50%,-50%) scale(${z0}) translate(${dx}%,${dy}%)`},{transform:`translate(-50%,-50%) scale(${z1}) translate(${-dx}%,${-dy}%)`}],{duration:(dur+1.5)*1000,fill:'forwards',easing:'linear'});}catch(_){}}
  if(sh.leader){let n=3;const b=div.querySelector('b');const tick=()=>{if(!REEL||REEL.i!==Q.i)return;n--;if(n>0){b.textContent=n;auReelTick();setTimeout(tick,800);}};setTimeout(tick,800);auReelFanfare();}
  const sub=Q.el.querySelector('.rl-sub'),say=sh.say?reelFill(sh.say,s):'';sub.textContent=say;sub.classList.toggle('on',!!say);
  Q.el.querySelector('.rl-bar i').style.width=((Q.i+1)/Q.shots.length*100)+'%';
  let spoken=false;if(say&&reelVoiceOn())spoken=ttsSay(say,()=>{if(REEL===Q&&Q.i===Q.shots.indexOf(sh)){clearTimeout(Q.timer);Q.timer=setTimeout(reelNext,700);}});
  Q.timer=setTimeout(reelNext,(spoken?dur*1.9+2:dur)*1000);
}
// Плёнка: зерно, царапины, мерцание
function reelFx(){const Q=REEL;if(!Q)return;const cv=Q.el.querySelector('.rl-grain');if(!cv)return;const g=cv.getContext('2d'),sc=Q.el.querySelectorAll('.rl-scr'),fl=Q.el.querySelector('.rl-flick'),fr=Q.el.querySelector('.rl-frame');
  const id=g?g.createImageData(160,120):null;let last=0;
  const loop=now=>{if(REEL!==Q)return;if(now-last>70){last=now;
      if(id){const d=id.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=Math.random()<0.5?40:0;}g.putImageData(id,0,0);}
      sc.forEach(x=>{if(Math.random()<0.35){x.style.left=(Math.random()*100)+'%';x.style.opacity=(0.15+Math.random()*0.35).toFixed(2);}else if(Math.random()<0.3)x.style.opacity='0';});
      fl.style.opacity=(Math.random()*0.09).toFixed(3);fr.style.transform=Math.random()<0.15?`translateY(${(Math.random()-0.5)*1.6}px)`:'';}
    Q.raf=requestAnimationFrame(loop);};
  Q.raf=requestAnimationFrame(loop);}
function reelClose(){const Q=REEL;if(!Q)return;REEL=null;clearTimeout(Q.timer);cancelAnimationFrame(Q.raf);ttsStop();reelAudio(false);try{Q.el.classList.add('out');setTimeout(()=>{try{Q.el.remove();}catch(_){}},350);}catch(_){}}
// Звук: музыка стихает, трещит проектор; в начале — короткие фанфары
function reelAudio(on){try{
  if(AU.el)AU.el.volume=on?0.12:(R?0.2:0.5);
  if(AU.ctx&&AU.mus){AU.mus.gain.setTargetAtTime(on?0.05:(AU.on.music?0.16:0),AU.ctx.currentTime,0.3);}
  clearInterval(AU.proj);AU.proj=0;
  if(on&&AU.ctx&&AU.on.sfx)AU.proj=setInterval(()=>{if(!REEL||!AU.ctx)return;const t=AU.ctx.currentTime;for(let k=0;k<3;k++)vNoise(t+k/18,0.012,0.022,'bandpass',2600,AU.fx);},167);}catch(e){}}
function auReelFanfare(){try{if(!AU.ctx||!AU.on.music)return;const t=AU.ctx.currentTime+0.05;[[67,0,0.18],[72,0.2,0.18],[76,0.4,0.18],[79,0.6,0.5],[76,1.15,0.16],[79,1.35,0.9]].forEach(([n,d,l])=>{vPiano(n,t+d,l,0.12);vPiano(n-12,t+d,l,0.06);});}catch(e){}}
function auReelTick(){try{if(AU.ctx&&AU.on.sfx)vNoise(AU.ctx.currentTime,0.05,0.08,'bandpass',1500,AU.fx);}catch(e){}}
/* ---------- кинохроника в «Хронике»: все открытые ролики ---------- */
function reelsCard(s){const L=['intro',...(s.reels||[]).filter(id=>id!=='intro')].filter(id=>reelGet(id,s));
  return foldCard('reels',false,`<h2>Кинохроника</h2><span class="num muted">${L.length}</span>`,
    `<p class="small muted" style="margin-top:4px">Короткие фильмы о технологиях и событиях автопрома — новые появляются, когда вы внедряете технологии, строите прототипы, выпускаете модели и когда меняется история. Голос диктора — если устройство умеет читать по-русски.</p>
    <div class="reel-list">${L.slice().reverse().map(id=>{const R=reelGet(id,s);return `<button class="chip" style="width:100%;margin-top:6px" data-act="reel" data-k="${esc(id)}"><small>${R.y||''}${R.y?' · ':''}${id.startsWith('tech:')?'завод':id.startsWith('part:')?'КБ':id.startsWith('model:')?'новая модель':id.startsWith('year:')?'итоги года':'история'}</small>▶ ${esc(reelFill(R.t,s))}</button>`;}).join('')}</div>`,
    `${L.length} ${plural(L.length,'фильм','фильма','фильмов')}`);}
