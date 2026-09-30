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
/* ---------- ролики, которые пишет сама игра: новая модель, новая деталь, итоги года ---------- */
// Голос в них — только постоянные фразы (их записал диктор заранее), а цифры и названия — на титрах: так всегда звучит живой голос.
const VGEN={
  m1:'На заводе праздник: из ворот цеха выкатывается новая модель.',
  m2:'Инженеры месяцами спорили о каждом узле: о моторе, о коробке передач, о раме. Теперь всё решат покупатели.',
  m3:'Обозреватели уже сравнивают новинку с лучшими машинами соперников. Цифры — на экране.',
  m4:'Первые машины уходят к дилерам. В добрый путь!',
  p1:'Конструкторское бюро закончило новую деталь. Её испытывали днём и ночью — на стенде и на дороге.',
  p2:'Такого в мире ещё не делал никто: ваше бюро опередило историю. Газеты всего света пишут о новинке.',
  p3:'Поставщики предложат такую деталь не скоро. Первыми разницу почувствуют ваши покупатели.',
  y1:'Кинохроника подводит итоги года.',
  y2:'Вот сколько машин продала ваша марка за этот год.',
  y3:'А это главная машина года — её покупали больше всех.',
  y4:'Гоночные победы года: лучшая реклама, какую только можно купить.',
  y5:'Пресса назвала лучших — и ваша марка среди них.',
  y6:'А вот ваше место в гонке за наследие эпохи.',
  y7:'Новый год — новые машины, новые гонки и новые рекорды.'};
function reelModel(md,s){const p=parts(md),st=carStats(md,0,s.y),C=classCompare(md,s,s.country),g=KIND_NAME[rivalKind(md)];
  return {t:`Новинка «${md.name}»`,y:s.y,mus:s.y<1912?'rag':s.y<1920?'fox':'jazz',sh:[
    {c:`«${md.name}»`,s:`${g} · завод «{co}», {y}`},
    {plant:1,say:VGEN.m1},
    {car:md,yaw:0.62,cap:`«${md.name}» · ${p.e.name}`,say:VGEN.m2},
    {c:`${Math.round(st.hp)} л.с. · до ${Math.round(st.vmax*3.6)} км/ч`,s:`${money(md.price)} · соперник — ${C.ref.name}: ${C.S>=1.08?'новинка лучше':C.S>=0.9?'не хуже':'пока уступает'} (${Math.round(C.S*100)}%)`,say:VGEN.m3},
    {v:'street'+(s.y<1906?'1900':s.y<1919?'1910':'1920'),car:md,yaw:1.35,pitch:0.18,cap:`«${md.name}» · ${money(md.price)}`,say:VGEN.m4},
    {c:'Новая машина — новые покупатели',s:''}]};}
function reelPart(id,s){const cat=PART_CATS.find(c=>byId(c.arr(),id)),x=cat&&byId(cat.arr(),id);if(!x)return null;const h=PART_HIST[id],first=s.firsts&&s.firsts['part:'+id];
  const best=s.models.filter(m=>m.status!=='off'&&m[cat.k]===id)[0]||s.models.filter(m=>m.status==='prod')[0];
  return {t:(first?'Первыми в мире: ':'Новая деталь: ')+x.name,y:s.y,mus:s.y<1912?'rag':'fox',sh:[
    {c:x.name,s:`${cat.name} · КБ «{co}», {y}`},
    {v:'factory_work',plant:1,say:VGEN.p1},
    ...(x.note?[{c:cat.name,s:x.note}]:[]),
    ...(best?[{car:best,yaw:0.62,cap:`«${best.name}»`,say:first?VGEN.p2:VGEN.p3}]:[]),
    {c:first?'Первыми в мире':'Раньше рынка',s:h?`В истории — ${h[1]}, ${h[0]}`:''}]};}
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
function reelYear(y,s){const r=(s.yrec||{})[y];if(!r)return null;const md=r.top!==null&&s.models.find(m=>m.id===r.top),st='street'+(y<1906?'1900':y<1919?'1910':'1920');
  const sh=[{c:`Итоги ${y} года`,s:'«{co}» · {city}',say:VGEN.y1}];
  sh.push({v:st,plant:1,cap:r.sold>0?`${carsN(r.sold)} за год${r.rank?` · ${r.rank}-е место в стране`:''}`:'Машины ещё готовятся к продаже',say:r.sold>0?VGEN.y2:''});
  if(md&&r.topN>0)sh.push({car:md,yaw:0.62,cap:`«${md.name}»${r.topN<r.sold?` · ${carsN(r.topN)}`:''}`,say:VGEN.y3});
  if(r.nw){r.wins.slice(0,2).forEach((w,k)=>sh.push(w.img?{i:w.img,cap:`Победа: ${w.n}${w.d?' · '+w.d:''}`,say:k===0?VGEN.y4:''}:{v:'race_run',cap:`Победа: ${w.n}${w.d?' · '+w.d:''}${w.m?' · «'+w.m+'»':''}`,say:k===0?VGEN.y4:''}));
    if(r.nw>2)sh.push({c:`Всего ${r.nw} ${plural(r.nw,'победа','победы','побед')} за год`,s:'гоночная слава продаёт машины'});}
  else if(r.pod)sh.push({c:`${r.pod} ${plural(r.pod,'подиум','подиума','подиумов')} в гонках`,s:'первая победа — впереди'});
  if(r.titles.length)sh.push({c:'👑 '+r.titles.map(capF).join(' · '),s:'титулы года по версии прессы',say:VGEN.y5});
  (r.flv||[]).slice(0,1).forEach(t=>{const f=flvByTitle(t);if(f)sh.push({i:f[3],cap:t});});
  if(r.place)sh.push({c:`Наследие: ${r.place}-е место`,s:r.ahead?`впереди — ${r.ahead}`:'«{co}» — первая среди великих марок',say:VGEN.y6});
  sh.push({c:String(y+1),s:'Новый год — новые машины, гонки и рекорды',say:VGEN.y7});
  sh.forEach(x=>{if(x.say==='')delete x.say;});
  return {t:`Итоги ${y} года`,y,mus:y<1912?'march':y<1920?'fox':'charl',sh};}
// Гонки: у семьи гонок — свой ролик (кинохроника её истории)
const RACE_REEL={pbp:'pbp',chicago:'chicago',pmp:'pmp',brighton:'brighton',tdf:'tdf',thousand:'thousand',turbie:'turbie',gb1900:'gb',gb1903:'gb',gb1904:'gb',gb1905:'gb',pb1901:'pb1901',pv1902:'pv1902',pm1903:'pm1903',
  ardennes:'ardennes',ormond:'ormond',vanderbilt:'vanderbilt',targa:'targa',x24910:'targa',gpacf:'gpacf',peking:'peking',nyparis:'nyparis',x87575:'russia',x80901:'russia',x17567:'russia',x2844:'russia',
  henry:'henry',kaiser:'kaiser',brooklands:'brooklands',jcc200:'brooklands',x59677:'brooklands',x79977:'brooklands',savannah:'usgp',x30184:'usgp',indy:'indy',board0:'board',board1:'board',x78542:'board',x49337:'board',x20757:'board',x60423:'board',
  dieppe:'dieppe',lyon1914:'lyon1914',lemans:'lemans',monza1922:'monza',itgp:'monza',x6663:'monza',brescia:'monza',mille:'mille',monaco:'monaco',pikes:'pikes',daytona1927:'daytona',semmering:'alpine',ventoux:'alpine',klausen:'alpine',shelsley:'alpine',alpen:'alpine'};
function raceReelId(rc){const k=rc&&RACE_REEL[rc.id];return k&&REELS['race:'+k]?'race:'+k:'';}
function reelGet(id,s){if(REELS[id])return REELS[id];
  if(id.startsWith('model:')){const md=s.models.find(m=>m.id===+id.slice(6));return md?reelModel(md,s):null;}
  if(id.startsWith('part:'))return reelPart(id.slice(5),s);
  if(id.startsWith('year:'))return reelYear(+id.slice(5),s);
  return null;}
/* ---------- кинохроника прямо в газете: кадр плёнки с кнопкой ▶ ---------- */
function paperReelId(o){if(o.reel)return o.reel;const c=(o.choices||[]).find(c=>/^reel:/.test(c[1]));return c?c[1].slice(5):'';}
function reelPoster(R,s){for(const x of R.sh){if(x.v){const c=reelClip(x.v,0);if(c)return `<img src="film/${c}.jpg" alt="">`;}if(x.i&&IMG[x.i])return `<img src="${IMG[x.i].src}" alt="" referrerpolicy="no-referrer">`;}
  const c=R.sh.find(x=>x.car);if(c)return carArt(reelCar(c.car,s)||s.models[0],{w:360,yaw:c.yaw||0.62,pitch:0.28});
  try{const v=plantImage(s);if(v&&v.url)return `<img src="${v.url}" alt="">`;}catch(e){}return '<em>КИНО</em>';}
function reelLen(R,s){return Math.round(R.sh.reduce((a,x)=>a+reelShotDur(x,s),2.6));}
function paperReelHTML(id,s){const R=id&&reelGet(id,s);if(!R)return '';const d=reelLen(R,s);
  return `<button class="p-reel" data-act="reel" data-k="${esc(id)}" aria-label="Смотреть кинохронику"><span class="p-reel-f">${reelPoster(R,s)}<i>▶</i></span><span class="p-reel-t"><b>Кинохроника</b>${esc(reelFill(R.t,s))}<small>${d<60?d+' сек':'около '+Math.round(d/60)+' мин'} · смотреть</small></span></button>`;}
function reelTitle(id,s){const R=reelGet(id,s);return R?R.t:'';}
// Открыть ролик для хроники и предложить посмотреть: газета с кадром плёнки
function reelUnlock(s,id){s.reels=s.reels||[];if(!s.reels.includes(id)){s.reels.push(id);if(s.reels.length>90)s.reels.shift();}}
function reelOffer(s,id,title,deck,text){if(!reelGet(id,s))return;reelUnlock(s,id);
  pushEvent({own:1,kicker:'Кинохроника',title,deck:deck||'',text:(text?text+'\n':'')+'Кинохроника расскажет, как это было в истории и что это значит для автомобилей.',choices:[['Дальше','ok'],['▶ Смотреть кинохронику','reel:'+id]]},true);}
// Исторические ролики эпохи — по датам (один раз)
const HIST_REEL_T=[[1914,7,'h:war','Война','Автомобиль уходит на фронт'],[1919,1,'h:peace','Мир','Заводы возвращаются к мирным машинам'],[1924,2,'h:twenties','Ревущие двадцатые','Джаз, кредит и машина для каждого'],[1929,10,'h:crash','Крах на Уолл-стрит','Конец эпохи']];
function histReelCheck(s){HIST_REEL_T.forEach(([y,m,id,t,d])=>{const due=(y===1914&&s.country==='us')?[1917,3]:[y,m];if(s.y===due[0]&&s.m===due[1]&&!(s.reels||[]).includes(id)&&REELS[id])reelOffer(s,id,t,d,'');});}
/* ---------- голос диктора (запасной: синтезатор устройства) ---------- */
const REEL_VOICE_KEY='avt-reel-voice';
function reelVoiceOn(){try{return localStorage.getItem(REEL_VOICE_KEY)!=='0';}catch(e){return true;}}
let TTS_VOICE=null;
function ttsPick(){if(!window.speechSynthesis)return null;const V=speechSynthesis.getVoices()||[],ru=V.filter(v=>/^ru/i.test(v.lang));
  // лучшие голоса устройства: «улучшенные» и сетевые — живее встроенных
  return ru.find(v=>/premium|enhanced|natural|neural|wavenet|online/i.test(v.name))||ru.find(v=>/google|milena|yuri|irina|pavel|dmitr|svetlana/i.test(v.name))||ru[0]||null;}
try{if(window.speechSynthesis){TTS_VOICE=ttsPick();speechSynthesis.onvoiceschanged=()=>{TTS_VOICE=ttsPick();};}}catch(e){}
function ttsReady(){try{if(window.AndroidTTS&&AndroidTTS.ttsReady())return true;}catch(e){}return !!(window.speechSynthesis&&(TTS_VOICE=TTS_VOICE||ttsPick()));}
function ttsSay(text,onEnd){
  let fired=false;const done=()=>{if(!fired){fired=true;onEnd&&onEnd();}};
  try{if(window.AndroidTTS&&AndroidTTS.ttsReady()){AndroidTTS.speak(text);const t0=Date.now(),iv=setInterval(()=>{let sp=true;try{sp=AndroidTTS.speaking();}catch(e){sp=false;}if((Date.now()-t0>700&&!sp)||Date.now()-t0>40000){clearInterval(iv);done();}},250);return true;}}catch(e){}
  try{if(window.speechSynthesis&&(TTS_VOICE=TTS_VOICE||ttsPick())){const u=new SpeechSynthesisUtterance(text);u.lang=TTS_VOICE.lang||'ru-RU';u.voice=TTS_VOICE;u.rate=1.02;u.pitch=0.92;u.onend=done;u.onerror=done;speechSynthesis.cancel();speechSynthesis.speak(u);return true;}}catch(e){}
  return false;}
function ttsStop(){try{if(window.AndroidTTS)AndroidTTS.stop();}catch(e){}try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}}
/* ---------- проигрыватель: кадры, живой голос одной дорожкой, листание ◀◀ ▶▶, пауза, перемотка по шкале, свайп ---------- */
let REEL=null;
function reelFill(t,s){return String(t||'').replace(/\{co\}/g,s.company).replace(/\{city\}/g,COUNTRIES[s.country].city).replace(/\{y\}/g,s.y);}
// Кинохроника по метке: несколько настоящих фильмов на метку — у каждого ролика свой (films/index.js)
// Похожая хроника, если точной нет: горная гонка — гонка на дороге, трек — старт и заезд, джаз и крах — улица 1920-х
const REEL_ALT={race_mountain:['race_run','country_road'],race_track:['race_run','race_start'],jazz_dance:['street1920'],road_build:['country_road','horse_cart'],crash1929:['street1920','street1910'],street_ru:['street1910']};
function reelClip(tag,seed){const F=window.FILMS_INDEX;if(!F||!F.tags)return null;let L=F.tags[tag];if(!L||!L.length){for(const t of REEL_ALT[tag]||[]){L=F.tags[t];if(L&&L.length)break;}}
  if(!L||!L.length)return null;return L[((seed|0)%L.length+L.length)%L.length];}
function reelCar(c,s){if(c==='best'){const L=s.models.filter(m=>m.status==='prod');return L.sort((a,b)=>(b.lastSold||0)-(a.lastSold||0))[0]||s.models[0];}return c&&typeof c==='object'?c:null;}
function reelShotHTML(sh,s,Q,k){
  if(sh.leader)return `<div class="rl-leader"><b>3</b></div>`;
  const card=(b,i2)=>`<div class="rl-card"><div class="rl-orn"><b>${esc(reelFill(b,s))}</b>${i2?`<i>${esc(reelFill(i2,s))}</i>`:''}</div></div>`;
  if(sh.c!==undefined)return card(sh.c,sh.s);
  if(sh.q!==undefined)return `<div class="rl-card q"><div class="rl-orn"><b>«${esc(String(sh.q).replace(/^[«"]|[»"]$/g,''))}»</b>${sh.who?`<i>— ${esc(sh.who)}</i>`:''}</div></div>`;
  const U=Q?Q.used:{},plantImg=()=>{try{const v=plantImage(s);return v&&v.url?`<img class="rl-img plant" src="${v.url}" alt="">`:'';}catch(e){return '';}};
  const carImg=md=>`<div class="rl-car">${carArt(md,{w:900,yaw:sh.yaw!==undefined?sh.yaw:0.62,pitch:sh.pitch!==undefined?sh.pitch:0.28})}</div>`;
  let img='',cap=sh.cap;const clip=sh.v?reelClip(sh.v,hashStr((Q?Q.id:'')+'|'+k)):null;
  if(clip)img=`<video class="rl-vid" src="film/${clip}.mp4" poster="film/${clip}.jpg" muted playsinline autoplay loop preload="auto"></video>`;
  else if(sh.i&&IMG[sh.i])img=`<img class="rl-img" src="${IMG[sh.i].src}" alt="" referrerpolicy="no-referrer">`;
  else if(sh.car){const md=reelCar(sh.car,s);if(md){img=carImg(md);if(sh.car==='best'&&!cap)cap=`«${md.name}» компании «${s.company}»`;}}
  else if(sh.plant){img=plantImg();U.plant=1;if(!sh.cap)cap='';}
  if(!img){const best=reelCar('best',s);
    if(!U.plant){img=plantImg();U.plant=1;cap=sh.cap||'';}
    else if(best&&!U.car){img=carImg(best);U.car=1;cap=`«${best.name}» компании «${s.company}»`;}
    else img=card(sh.cap||'Кинохроника','кадры не сохранились');}
  return img+(cap&&!/rl-card/.test(img)?`<div class="rl-cap">${esc(reelFill(cap,s))}</div>`:'');}
function reelSay(sh,s){return sh.say?reelFill(sh.say,s):'';}
function reelShotDur(sh,s){if(sh.leader)return 2.4;const say=sh.say?String(sh.say):'',vd=say&&typeof voiceDur==='function'?voiceDur(say,'aidar'):0;
  if(vd)return vd+0.35;if(say)return Math.max(3.4,2+say.length/13);return sh.c!==undefined||sh.q!==undefined?3.2:sh.v?5:4;}
// Указатель кинохроники (film/index.js): метки → ролики; грузится заранее, при первом ролике — дожидаемся
const FILMS={p:null};
function filmsLoad(){if(window.FILMS_INDEX)return Promise.resolve(window.FILMS_INDEX);if(FILMS.p)return FILMS.p;
  FILMS.p=new Promise(res=>{try{const e=document.createElement('script');e.src='film/index.js';e.async=true;e.onload=()=>res(window.FILMS_INDEX||null);e.onerror=()=>res(null);document.head.appendChild(e);}catch(_){res(null);}});return FILMS.p;}
setTimeout(()=>{try{filmsLoad();}catch(_){}},1200);
function playReel(id){
  const s=G,R0=s&&reelGet(id,s);if(!R0||REEL)return;
  try{voiceUnlock();}catch(e){}
  if(!window.FILMS_INDEX&&!FILMS.waited){FILMS.waited=1;filmsLoad().then(()=>playReel(id));return;}
  reelUnlock(s,id);
  // Safari разрешает голос синтезатора только после нажатия: «разогреваем» его тихой фразой прямо в обработчике нажатия
  try{if(reelVoiceOn()&&!window.AndroidTTS&&window.speechSynthesis){const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}}catch(e){}
  const el=document.createElement('div');el.id='reel';el.className='reel';
  el.innerHTML=`<div class="rl-title">Кинохроника · ${esc(reelFill(R0.t,s))}${R0.y&&!String(R0.t).includes(R0.y)?' · '+R0.y:''}</div>
    <div class="rl-frame"><div class="rl-shots"></div><canvas class="rl-grain" width="160" height="120"></canvas><i class="rl-scr"></i><i class="rl-scr b"></i><div class="rl-flick"></div><div class="rl-vig"></div><div class="rl-bar"></div></div>
    <div class="rl-sub"></div>
    <div class="rl-ctl"><button class="rl-btn" data-rl="prev" aria-label="Предыдущий кадр">◀◀</button><button class="rl-btn big" data-rl="pause" aria-label="Пауза">❚❚</button><button class="rl-btn" data-rl="next" aria-label="Следующий кадр">▶▶</button><button class="rl-btn" data-rl="voice" aria-label="Голос диктора">${reelVoiceOn()?'🔊':'🔇'}</button><button class="rl-btn" data-rl="close" aria-label="Закрыть">✕</button></div>`;
  document.body.appendChild(el);
  const shots=[{leader:1},...R0.sh];REEL={id,R:R0,shots,i:-1,el,timer:0,raf:0,used:{},paused:false};
  const Q=REEL,bar=el.querySelector('.rl-bar');
  // шкала: отрезок на каждый кадр — нажмите, чтобы перейти
  const draw=()=>{const tot=shots.reduce((a,x)=>a+reelShotDur(x,s),0);bar.innerHTML=shots.map((x,k)=>`<span data-k="${k}" style="flex:${reelShotDur(x,s)/tot}"><i></i></span>`).join('');};
  voiceLoad().then(()=>{if(REEL===Q)draw();});draw();
  el.addEventListener('click',e=>{const b=e.target.closest('[data-rl]');if(b){e.stopPropagation();const k=b.dataset.rl;
      if(k==='close')reelClose();else if(k==='next')reelGo(Q.i+1);else if(k==='prev')reelGo(Math.max(1,Q.i-1));else if(k==='pause')reelPause(!Q.paused);
      else if(k==='voice'){const on=!reelVoiceOn();try{localStorage.setItem(REEL_VOICE_KEY,on?'1':'0');}catch(_){}b.textContent=on?'🔊':'🔇';if(!on)voiceStop();}return;}
    const seg=e.target.closest('.rl-bar span');if(seg){e.stopPropagation();reelGo(+seg.dataset.k);return;}
    if(e.target.closest('.rl-frame'))reelPause(!Q.paused);});
  // свайп по кадру: влево — дальше, вправо — назад
  let sx=null,sy=0;el.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;},{passive:true});
  el.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4){e.preventDefault();reelGo(dx<0?Q.i+1:Math.max(1,Q.i-1));Q.swiped=performance.now();}});
  el.addEventListener('click',e=>{if(Q.swiped&&performance.now()-Q.swiped<300){e.stopPropagation();e.preventDefault();}},true);
  reelAudio(true,R0.mus,R0,id);reelGo(0);reelFx();}
function reelPause(on){const Q=REEL;if(!Q)return;Q.paused=on;const b=Q.el.querySelector('[data-rl=pause]');if(b)b.textContent=on?'▶':'❚❚';Q.el.classList.toggle('paused',on);
  clearTimeout(Q.timer);Q.el.querySelectorAll('video').forEach(v=>{try{on?v.pause():v.play();}catch(_){}});
  if(on){voicePause(true);Q.left=Math.max(0.3,(Q.until||0)-performance.now()/1000);}
  else{voicePause(false);if(!Q.voiced)Q.timer=setTimeout(()=>reelGo(Q.i+1),Q.left*1000);else Q.until=performance.now()/1000+Q.left;}}
function reelGo(i){const Q=REEL;if(!Q)return;clearTimeout(Q.timer);voiceStop();if(Q.paused)reelPause(false);
  if(i>=Q.shots.length){reelClose();return;}i=Math.max(0,i);Q.i=i;
  const s=G,sh=Q.shots[i],box=Q.el.querySelector('.rl-shots'),div=document.createElement('div');if(!box){reelClose();return;}div.className='rl-shot';
  div.innerHTML=reelShotHTML(sh,s,Q,i);box.appendChild(div);
  requestAnimationFrame(()=>div.classList.add('on'));
  [...box.children].forEach(c=>{if(c!==div){c.classList.remove('on');setTimeout(()=>c.remove(),900);}});
  const say=reelSay(sh,s),dur=reelShotDur(sh,s);
  // медленный наезд камеры по фото и машине (у каждого кадра — своё направление)
  const im=div.querySelector('.rl-img,.rl-car');if(im&&im.animate){const r=mulberry32(hashStr(Q.id+i)),z0=1.04+r()*0.06,z1=z0+0.08+r()*0.1,dx=(r()-0.5)*6,dy=(r()-0.5)*4;
    try{im.animate([{transform:`translate(-50%,-50%) scale(${z0}) translate(${dx}%,${dy}%)`},{transform:`translate(-50%,-50%) scale(${z1}) translate(${-dx}%,${-dy}%)`}],{duration:(dur+1.5)*1000,fill:'forwards',easing:'linear'});}catch(_){}}
  const vid=div.querySelector('video');if(vid){vid.onerror=()=>{const f=sh.i&&IMG[sh.i]?`<img class="rl-img" src="${IMG[sh.i].src}" alt="" referrerpolicy="no-referrer">`:'';if(f){vid.outerHTML=f;}};try{const p=vid.play();if(p&&p.catch)p.catch(()=>{});}catch(_){}}
  if(sh.leader){let n=3;const b=div.querySelector('b');const tick=()=>{if(!REEL||REEL.i!==i)return;n--;if(n>0){b.textContent=n;auReelTick();setTimeout(tick,800);}};setTimeout(tick,800);auReelFanfare();}
  const sub=Q.el.querySelector('.rl-sub');sub.textContent=say;sub.classList.toggle('on',!!say);
  Q.el.querySelectorAll('.rl-bar span').forEach((x,k)=>{x.classList.toggle('done',k<i);x.classList.toggle('cur',k===i);const f=x.querySelector('i');if(f){f.style.transition='none';f.style.width=k<i?'100%':'0%';if(k===i){void f.offsetWidth;f.style.transition=`width ${dur}s linear`;f.style.width='100%';}}});
  // голос: живая запись одной дорожкой — следующий кадр сразу, как договорит
  Q.voiced=false;const next=Q.shots[i+1];if(next&&next.say)try{voicePreload(reelSay(next,s),'aidar');}catch(_){}
  if(say){const d=voiceSay(say,'aidar',()=>{if(REEL===Q&&Q.i===i&&!Q.paused){clearTimeout(Q.timer);Q.timer=setTimeout(()=>reelGo(i+1),220);}});
    if(d){Q.voiced=true;Q.until=performance.now()/1000+d+6;Q.timer=setTimeout(()=>reelGo(i+1),(d+6)*1000);return;}}
  Q.until=performance.now()/1000+dur;Q.timer=setTimeout(()=>reelGo(i+1),dur*1000);}
function reelNext(){const Q=REEL;if(Q)reelGo(Q.i+1);}
// Плёнка: зерно, царапины, мерцание
function reelFx(){const Q=REEL;if(!Q)return;const cv=Q.el.querySelector('.rl-grain');if(!cv)return;const g=cv.getContext('2d'),sc=Q.el.querySelectorAll('.rl-scr'),fl=Q.el.querySelector('.rl-flick'),fr=Q.el.querySelector('.rl-frame');
  const id=g?g.createImageData(160,120):null;let last=0;
  const loop=now=>{if(REEL!==Q)return;if(now-last>70&&!Q.paused){last=now;
      if(id){const d=id.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=Math.random()<0.5?40:0;}g.putImageData(id,0,0);}
      sc.forEach(x=>{if(Math.random()<0.35){x.style.left=(Math.random()*100)+'%';x.style.opacity=(0.15+Math.random()*0.35).toFixed(2);}else if(Math.random()<0.3)x.style.opacity='0';});
      fl.style.opacity=(Math.random()*0.09).toFixed(3);fr.style.transform=Math.random()<0.15?`translateY(${(Math.random()-0.5)*1.6}px)`:'';}
    Q.raf=requestAnimationFrame(loop);};
  Q.raf=requestAnimationFrame(loop);}
function reelClose(){const Q=REEL;if(!Q)return;REEL=null;clearTimeout(Q.timer);cancelAnimationFrame(Q.raf);voiceStop();reelAudio(false);try{Q.el.querySelectorAll('video').forEach(v=>{try{v.pause();v.removeAttribute('src');v.load();}catch(_){}});Q.el.classList.add('out');setTimeout(()=>{try{Q.el.remove();}catch(_){}},350);}catch(_){}}
// Звук: музыка эпохи тихо под диктора (свой танец у каждого ролика), трещит проектор; в начале — короткие фанфары
// 0.19: музыка под кинохронику — настоящий оркестр по настроению ролика (гонка — галоп, завод — «деловая», итоги года — марш),
// тише под голос диктора; без сети — прежний синтезатор
function reelMood(id,R0){const t=((R0&&R0.t)||'')+' '+((R0&&R0.sh||[]).map(x=>x.say||'').join(' ').slice(0,600));
  if(/^race:/.test(id))return 'race';if(/^(tech|part):/.test(id))return 'industry';if(/^model:/.test(id))return 'lively';if(/^(year|show):/.test(id)||id==='intro')return 'triumph';
  if(/войн|погиб|гибел|катастроф|пожар|кризис|разорен|депресси|смерт|траур/i.test(t))return 'sad';if(/рекорд|побед|триумф|перв/i.test(t))return 'triumph';return R0&&R0.mus==='waltz'?'calm':'lively';}
function reelAudio(on,mus,R0,id){try{if(on)try{orchLoad();}catch(_){}
  const tr=on&&AU.on.music&&typeof orchPick==='function'&&R0?orchPick(reelMood(id||'',R0),R0.y||(G?G.y:1900),id):null;
  AU.reelSty=on&&!tr&&mus&&STY[mus]?mus:null;
  {const a=AU.reelEl;clearInterval(AU.reelDuck);if(on&&tr){const e=a||(AU.reelEl=new Audio());e.loop=true;e.src=tr.src;e.volume=0;const p=e.play();if(p&&p.catch)p.catch(()=>{});
      AU.reelDuck=setInterval(()=>{if(!REEL){e.volume=Math.max(0,e.volume-0.05);if(e.volume<=0.01){e.pause();clearInterval(AU.reelDuck);}return;}const want=REEL.paused?0:VOICE.cb?0.1:0.3;e.volume=clamp(e.volume+(want-e.volume)*0.25,0,1);if(REEL.paused&&!e.paused)e.pause();else if(!REEL.paused&&e.paused){const q=e.play();if(q&&q.catch)q.catch(()=>{});}},120);}
    else if(a&&!on){AU.reelDuck=setInterval(()=>{a.volume=Math.max(0,a.volume-0.06);if(a.volume<=0.01){a.pause();clearInterval(AU.reelDuck);}},80);}}
  if(AU.el){if(on){AU.reelWas=!AU.el.paused;if(AU.reelWas)AU.el.pause();}else if(AU.reelWas){AU.reelWas=false;musicPlay();}}
  if(AU.ctx&&AU.mus){AU.mus.gain.setTargetAtTime(on?0.045:(AU.on.music?(R?0.07:0.16):0),AU.ctx.currentTime,0.3);}
  clearInterval(AU.proj);AU.proj=0;
  if(on&&AU.ctx&&AU.on.sfx)AU.proj=setInterval(()=>{if(!REEL||!AU.ctx||REEL.paused)return;const t=AU.ctx.currentTime;for(let k=0;k<3;k++)vNoise(t+k/18,0.012,0.018,'bandpass',2600,AU.fx);},167);}catch(e){}}
function auReelFanfare(){try{if(!AU.ctx||!AU.on.music)return;const t=AU.ctx.currentTime+0.05;[[67,0,0.18],[72,0.2,0.18],[76,0.4,0.18],[79,0.6,0.5],[76,1.15,0.16],[79,1.35,0.9]].forEach(([n,d,l])=>{inst('cornet',n,t+d,l,0.5);inst('trumpet',n-12,t+d,l,0.25);});}catch(e){}}
function auReelTick(){try{if(AU.ctx&&AU.on.sfx)vNoise(AU.ctx.currentTime,0.05,0.08,'bandpass',1500,AU.fx);}catch(e){}}
/* ---------- кинохроника во вкладке «Империя»: все открытые ролики ---------- */
function reelKind(id){return id.startsWith('tech:')?'завод':id.startsWith('part:')?'КБ':id.startsWith('model:')?'новая модель':id.startsWith('year:')?'итоги года':id.startsWith('race:')?'гонка':id.startsWith('show:')?'выставка':'история';}
function reelsCard(s){const L=['intro',...(s.reels||[]).filter(id=>id!=='intro')].filter(id=>reelGet(id,s));
  return foldCard('reels',false,`<h2>Кинохроника</h2><span class="num muted">${L.length}</span>`,
    `<p class="small muted" style="margin-top:4px">Фильмы с настоящими кадрами эпохи и живым голосом диктора: гонки, выставки, заводы и события. Новые открываются, когда вы участвуете в гонках и выставках, внедряете технологии, выпускаете модели и когда меняется история.</p>
    <div class="reel-list">${L.slice().reverse().map(id=>{const R=reelGet(id,s);return `<button class="chip" style="width:100%;margin-top:6px" data-act="reel" data-k="${esc(id)}"><small>${R.y||''}${R.y?' · ':''}${reelKind(id)}</small>▶ ${esc(reelFill(R.t,s))}</button>`;}).join('')}</div>`,
    `${L.length} ${plural(L.length,'фильм','фильма','фильмов')}`);}
