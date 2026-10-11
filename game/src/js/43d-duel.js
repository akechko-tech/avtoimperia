/* ================= 0.21: пари и вызовы с развязкой; витрина «Империя»; кабинет трофеев =================
   ТЗ, раздел 1: любая победа — три шага. Момент: сцена развязки — портрет соперника, счёт, его реплика по характеру,
   короткая музыкальная тема и телеграф (или шум трибун). Реакция мира: газета со снимком вашей машины, спрос в стране
   соперника (+4% на три месяца, проигрыш — столько же минус), после трёх побед подряд его дилеры просятся к вам.
   След: счёт соперничества и трофей в кабинете. Проигрыш тоже показывается — соперник злорадствует.
   ТЗ, раздел 3: вместо полосы над вкладками — карточка «Империя»: место, ближайшая цель, последний триумф, вызов, значки. */

// Характеры героев марок: гордый, деловой, аристократ, язвительный
const HERO_TYPE={bugatti:'proud',ferrari:'proud',ford:'biz',olds:'biz',benz:'biz',maybach:'aristo',lanchester:'aristo',agnelli:'aristo',peugeot:'sharp',renault:'sharp'};
const HERO_TYPE_N={proud:'гордец',biz:'делец',aristo:'аристократ',sharp:'насмешник'};
// Реплики: dign — проиграл с достоинством, angry — раздражён, revenge — обещает реванш, respect — уважение после серии,
// rage — злость после серии, mock — насмешка, когда проиграли вы. {me} — ваша компания, {ev} — гонка или класс
const HERO_LINES={
  proud:{dign:['Сегодня ваш день, «{me}». Запомните его — таких дней будет немного.','Признаю: вы были быстрее. Но наши машины всё равно красивее.','Победа ваша. Я не спорю с секундомером — только с судьбой.'],
    angry:['Проиграть «{me}»? Недоразумение, которое я исправлю лично.','Мои механики будут работать ночами. Ваше везение кончилось.'],
    revenge:['Реванш — и ставку выше, если не боитесь.','На следующей гонке вы увидите только пыль от моей машины.'],
    respect:['Уже который раз… Снимаю шляпу: вы — настоящий соперник, «{me}».','Редко говорю такое: вы заслужили уважение. Но я вернусь.'],
    rage:['Опять вы! Это уже не спорт, это оскорбление.','Хватит. Я построю машину без равных — ради одной цели: обогнать «{me}».'],
    mock:['Красивые афиши, «{me}». Жаль, что гонки выигрывают не афиши.','Ваша машина хороша… для воскресной прогулки.','Приезжайте ещё — мне нравится выигрывать у вас.']},
  biz:{dign:['Цифры не врут: вы выиграли честно. Поздравляю.','Деньги ваши. Бизнес есть бизнес.','Хорошая работа, «{me}». Мы её внимательно изучим.'],
    angry:['Разберём, где ошиблись. Больше это не повторится.','Дорогой урок. Но мы умеем считать.'],
    revenge:['Предлагаю новое пари. Ставка выше — азарт тоже.','Посмотрим, что вы скажете через полгода.'],
    respect:['Вы умеете работать. С вами приятно соревноваться.','Несколько побед подряд — это система, а не удача. Уважаю.'],
    rage:['Вы мешаете нашим продажам. Мы ответим ценой.','Совет директоров недоволен. Готовьтесь к войне цен.'],
    mock:['Эффективность, «{me}»! Её у вас пока нет.','Спасибо за взнос в наш фонд развития.','Мы делаем машины, а вы — обещания.']},
  aristo:{dign:['Благородная победа. Позвольте пожать вам руку.','Отдаю должное вашей команде, «{me}».','Проиграть достойному сопернику — не позор.'],
    angry:['Весьма досадно. Впрочем, джентльмены не жалуются.','Мы проиграли сражение, но не кампанию.'],
    revenge:['Не откажите в любезности — реванш?','Предлагаю продолжить наш спор. Ставка — выше.'],
    respect:['Вы доказали класс, «{me}». Считаю за честь соперничать с вами.','Столько побед… Пожалуй, мне стоит пригласить вас на обед.'],
    rage:['Это переходит границы приличий.','Нам придётся отнестись к вам куда серьёзнее.'],
    mock:['Ах, «{me}»… Не всем дано создавать совершенство.','Возможно, вам стоит вернуться к повозкам?','Скорость — это ещё не манеры.']},
  sharp:{dign:['Ну что ж, раз в год и палка стреляет.','Поздравляю! Только не привыкайте.','Ладно, ладно — сегодня вам повезло.'],
    angry:['Везение, «{me}», чистое везение.','Наши механики уже смеются — над собой.'],
    revenge:['Ещё раз? Уж теперь посмеёмся мы.','Реванш! И на этот раз — без чудес.'],
    respect:['Хм. Столько раз подряд — пожалуй, это уже не случайность.','Признаю: вы опасны. Но я вам этого не говорил.'],
    rage:['Опять вы?! Заберите у них кто-нибудь машины!','Хватит! Мы взялись за вас всерьёз.'],
    mock:['Ха! Вашим машинам бы ещё мотор — и было бы совсем хорошо.','Спасибо за деньги — купим на них ещё одну победу.','Не расстраивайтесь, «{me}»: второе место — тоже место. Почти.']}};
// Свой набор у каждого из 10 героев марок: по реплике на каждый случай (плюс общие реплики его характера)
const HERO_OWN={
  bugatti:{dign:'Сегодня ваша машина была быстрее. Но скажите честно — она была красивее?',angry:'Ничто не слишком красиво и ничто не слишком дорого. Я построю такую, что вы забудете дорогу на трассу.',
    revenge:'В Мольсхайме уже точат новые детали. Реванш — ставку назначайте сами.',respect:'Вы делаете машины почти как художник, «{me}». Почти.',
    rage:'Опять! Мои механики не спят третью ночь — и виноваты в этом вы.',mock:'Мои машины сделаны, чтобы ехать, а не чтобы останавливаться. Ваши — наоборот.'},
  ferrari:{dign:'Вы выиграли. Запомните этот вкус — он проходит быстро.',angry:'Второе место — первое среди проигравших. Я не люблю быть первым среди проигравших.',
    revenge:'Скудерия не забывает. На следующей гонке — реванш, и ставка выше.',respect:'Вы умеете побеждать, «{me}». В Модене таких уважают.',
    rage:'Хватит! Каждую вашу победу я повешу на стену мастерской — чтобы помнить.',mock:'Лучшая машина — та, что ещё не построена. Ваша — точно не она.'},
  ford:{dign:'Неудача — это шанс начать заново, но уже умнее. Вы нам его дали.',angry:'Думаете, что можете, или думаете, что не можете, — в обоих случаях вы правы. Я думаю, что обгоню вас.',
    revenge:'Машина может быть любого цвета, если он чёрный. А пари — чьим угодно, если оно моё. Ещё раз?',respect:'Вы работаете как конвейер, «{me}»: без остановок. Уважаю.',
    rage:'Хорошо. Я снижу цену ещё раз — и посмотрим, к кому пойдут покупатели.',mock:'Вы делаете машины для богатых, «{me}». Я — для всех. Потому и выиграл.'},
  olds:{dign:'Мой «Кёрвд Дэш» проехал бы и лучше. Но день ваш.',angry:'В Лансинге не любят проигрывать. Завтра с утра — на завод.',
    revenge:'Поток решает всё. Посмотрим, чей поток быстрее.',respect:'Серия побед — как хорошо налаженный поток. Это я понимаю.',
    rage:'Я ушёл из собственной компании, когда меня не слушали. От вас не уйду — я вас обгоню.',mock:'Лёгкая машина за 650 долларов обогнала вашу. Какой тогда смысл в вашей?'},
  maybach:{dign:'Вы заслужили победу. Инженер всегда признаёт хорошую работу.',angry:'Двигатель можно улучшить. Мы улучшим.',
    revenge:'Позвольте реванш — у меня на столе новый чертёж.',respect:'Меня называли королём конструкторов. Сегодня я делю этот титул с вами.',
    rage:'Три поражения подряд… В Каннштатте это сочтут неприличным.',mock:'Кажется, ваш карбюратор придумали раньше моего, «{me}». И это заметно.'},
  lanchester:{dign:'Проигрыш — это данные для расчёта. Благодарю за данные.',angry:'Досадно. Впрочем, английский джентльмен не повышает голос — он пересчитывает.',
    revenge:'Смею предложить реванш. Ставку — на ваше усмотрение, но повыше.',respect:'Инженер уважает инженера. Вы — инженер.',
    rage:'Боюсь, наш спор переходит в разряд личных.',mock:'В Бирмингеме машины строят по расчёту. У вас, видимо, по вдохновению.'},
  benz:{dign:'Любовь к изобретательству не умирает. Спасибо за урок, «{me}».',angry:'Мой первый моторваген тоже глох на каждом холме. Мы научились — научимся и сейчас.',
    revenge:'Берта проехала сто километров, чтобы доказать мою правоту. Я докажу свою на следующей гонке.',respect:'Вы снова впереди. Хорошие машины — лучший ответ, и он у вас есть.',
    rage:'Мангейм не прощает серий. Готовьтесь.',mock:'Я построил первый автомобиль, «{me}». Вы пока строите последний в заезде.'},
  renault:{dign:'Прямая передача не помогла. Поздравляю — но ненадолго.',angry:'В Бийанкуре уже разбирают вашу машину по винтику. Пригодится.',
    revenge:'Реванш! И на этот раз — без случайностей на поворотах.',respect:'Хм, столько побед — вы начинаете мне нравиться. Это опасно.',
    rage:'Хватит! В Бийанкуре будут работать ночами, пока не обгоним вас.',mock:'Во Франции мы учим сначала ездить, потом спорить.'},
  peugeot:{dign:'Пежо делали мельницы и пружины задолго до машин. Мы умеем ждать своего часа.',angry:'Досадно. Но лев просто отдыхает.',
    revenge:'Лев снова выходит на охоту. Реванш?',respect:'Вы кусаетесь, «{me}». Уважаю зубы.',
    rage:'Три раза подряд?! Это уже вызов всей семье Пежо.',mock:'Лев не спорит с котятами. Но иногда рычит.'},
  agnelli:{dign:'Турин умеет проигрывать с улыбкой.',angry:'Досадно. Но ФИАТ считает годы, а не дни.',
    revenge:'Не откажите мне в реванше — Турин ждёт.',respect:'Вы достойный соперник, «{me}». Я бы пригласил вас в совет директоров.',
    rage:'Три поражения… Придётся поговорить с инженерами лично.',mock:'Ах, «{me}»… Приезжайте в Турин — покажу, как строят машины.'}};
// марка → герой (основатель) по данным марок и гоночных команд
function rivalPk(mq){if(!mq)return '';const n=String(mq).toLowerCase();
  for(const t of RACE_TEAMS)if(t.pk&&t.n.toLowerCase()===n)return t.pk;
  for(const c in COMPS)for(const cp of COMPS[c])if(cp.pk&&(cp.n.toLowerCase()===n||n.startsWith(cp.n.toLowerCase().split(' ')[0])))return cp.pk;
  if(/alfa/.test(n))return 'ferrari';if(/mercedes|daimler/.test(n))return 'maybach';if(/benz/.test(n))return 'benz';if(/fiat/.test(n))return 'agnelli';return '';}
// главы марок без своего героя в игре
const HERO_HEADS={'Panhard':'Рене Панар','Darracq':'Александр Даррак','De Dietrich':'барон Адриен де Тюркхейм','Lorraine':'барон Адриен де Тюркхейм','De Dion':'маркиз Жюль-Альбер де Дион','Napier':'Монтегю Напье',
  'Rolls':'Генри Ройс','Cadillac':'Генри Лиланд','Packard':'Джеймс Паккард','Buick':'Уильям Дюрант','Opel':'братья Опель','Hispano':'Марк Биркигт','Delage':'Луи Делаж','Isotta':'Чезаре Изотта','Lancia':'Винченцо Лянча',
  'Itala':'Маттео Чейрано','Austin':'Герберт Остин','Morris':'Уильям Моррис','Citro':'Андре Ситроен','Chevrolet':'Луи Шевроле','Dodge':'братья Додж','Chrysler':'Уолтер Крайслер','Duesenberg':'Фред Дузенберг',
  'Stutz':'Гарри Стутц','Horch':'Август Хорх','Audi':'Август Хорх','Brasier':'Анри Бразье','Richard-Brasier':'Анри Бразье','Clément':'Адольф Клеман','Berliet':'Мариюс Берлие','Alfa':'Никола Ромео','Bentley':'Уолтер Оуэн Бентли',
  'Winton':'Александр Уинтон','Pierce':'Джордж Пирс','Hudson':'Рой Чапин','Nash':'Чарльз Нэш','Maxwell':'Джонатан Максвелл','Sunbeam':'Джон Марстон','Minerva':'Сильвен де Йонг','Mors':'Эмиль Мор','Gobron':'Гюстав Гоброн'};
function heroHead(mq){const n=String(mq||'').toLowerCase();for(const k in HERO_HEADS)if(n.startsWith(k.toLowerCase()))return HERO_HEADS[k];return '';}
function rivalHero(mq,s){const pk=rivalPk(mq),P=pk&&PIONEERS[pk];const h=hashStr('rv|'+mq);
  const type=HERO_TYPE[pk]||['biz','proud','aristo','sharp'][h%4];
  // 0.22: глава марки в этот год — живой человек с портретом (RIVAL_HEADS), а не просто имя
  const hd=typeof rivalHead==='function'?rivalHead(mq,s?s.y:1900):null,useP=P&&(!hd||hd.n===P.name);
  return {pk,mq,type,name:useP?P.name:hd?hd.n:heroHead(mq)||`глава марки ${mq}`,role:hd?hd.role:'',wiki:useP?P.wiki:hd?hd.wiki:'',c:P?P.c:rivalCountry(mq,s)};}
function rivalCountry(mq,s){for(const t of RACE_TEAMS)if(t.n===mq)return t.c;for(const c in COMPS)if(COMPS[c].some(cp=>cp.n===mq||compName(cp,s)===mq))return c;return s?s.country:'fr';}
function heroPortrait(H){const im=H.wiki&&IMG[H.wiki];if(im)return `<div class="ph-oval duel-ph"><img src="${im.src}" alt="${esc(H.name)}" referrerpolicy="no-referrer"></div>`;
  const ini=String(H.mq).replace(/[^A-Za-zА-Яа-яЁё ]/g,'').split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();return `<div class="ph-oval duel-ph duel-ini">${esc(ini||'?')}</div>`;}
// своя реплика героя — чаще, общая по характеру — для разнообразия; одна и та же подряд не повторяется
function heroLine(H,cat,s,ev){const own=HERO_OWN[H.pk]&&HERO_OWN[H.pk][cat],L=HERO_LINES[H.type][cat],pool=(own?[own,own]:[]).concat(L),last=s&&s.lastLine;
  let t=pool[Math.floor(Math.random()*pool.length)];if(t===last&&pool.length>1)t=pool.find(x=>x!==last);if(s)s.lastLine=t;
  return t.replace(/\{me\}/g,s.company).replace(/\{ev\}/g,ev||'');}
/* ---------- счёт соперничества ---------- */
function rivalryOf(s,mq){s.rivalry=s.rivalry||{};const k=rivalPk(mq)||mq;return s.rivalry[k]=s.rivalry[k]||{n:mq,w:0,l:0,st:0};}
function rivalryPeek(s,mq){const R=s&&s.rivalry;return R?R[rivalPk(mq)||mq]||null:null;}
function rivalryTxt(s,mq){const r=rivalryPeek(s,mq)||{w:0,l:0};return `Вы — ${mq} ${r.w}:${r.l}`;}
function rivalryScore(s,mq){const r=rivalryPeek(s,mq);return r&&(r.w+r.l)?`${r.w}:${r.l}`:'';}
/* ---------- трофеи ---------- */
const TROPHY_ICON={cup:'🏆',medal:'🎖',charter:'📜',goal:'🎯',record:'📈',clip:'📰',title:'👑'};
const TROPHY_KIND={cup:'Кубок',medal:'Медаль',charter:'Грамота',goal:'Цель года',record:'Рекорд',clip:'Газетная вырезка',title:'Титул'};
// {kind,title,sub,story,key,carId,prep,num,img,reel,pt(заголовок газеты),rk(гонка)} — повтор одного и того же ключа не добавляется
function trophyAdd(s,o){if(!s)return null;s.trophies=s.trophies||[];const t=Object.assign({y:s.y,m:s.m},o);if(t.key&&s.trophies.some(x=>x.key===t.key))return null;
  s.trophies.push(t);if(s.trophies.length>400)s.trophies.shift();return t;}
function trophyPaper(t){if(!t||!t.pt||!G||!G.papers)return -1;for(let i=G.papers.length-1;i>=0;i--)if(G.papers[i].title===t.pt)return i;return -1;}
function trophyHTML(t){const s=G,md=t.carId!=null?s.models.find(m=>m.id===t.carId):null,pi=trophyPaper(t),reel=(()=>{try{return t.reel&&reelGet(t.reel,s)?t.reel:'';}catch(_){return '';}})();
  const ph=md?`<div class="carbox tro-car">${carArt(md,{w:420,prep:t.prep||0,num:t.num||0,y:t.y})}</div>`:t.img&&IMG[t.img]?`<figure class="tro-ph"><img src="${IMG[t.img].src}" alt="" referrerpolicy="no-referrer"></figure>`:'';
  const lr=t.rk&&typeof lastRace!=='undefined'&&lastRace&&lastRace.rc&&lastRace.rc.key===t.rk;
  return `<div class="row"><span class="label">${esc(TROPHY_KIND[t.kind]||'Трофей')} · ${MONTHS_N[t.m]||''} ${t.y}</span>${X}</div>
    <div class="tro-big">${TROPHY_ICON[t.kind]||'🏆'}</div><h2 style="text-align:center">${esc(t.title)}</h2>${t.sub?`<p class="small muted" style="text-align:center;margin-top:4px">${esc(t.sub)}</p>`:''}
    ${ph}${t.story?`<p style="margin-top:10px">${esc(t.story)}</p>`:''}
    <div class="stack" style="margin-top:14px">${reel?`<button class="btn primary block" data-act="reel" data-k="${esc(reel)}">▶ Пересмотреть: кинохроника</button>`:''}${pi>=0?`<button class="btn ${reel?'':'primary '}block" data-act="reopenPaper" data-k="${pi}">📰 Пересмотреть: газета того дня</button>`:''}${lr?'<button class="btn block" data-act="troRace">🏁 Итоги гонки</button>':''}<button class="btn block" data-act="close">Закрыть</button></div>`;}
function trophyReplay(i){const t=(G.trophies||[])[i];if(!t)return;try{celebrate(t.title,t.sub||'',TROPHY_ICON[t.kind]||'🏆');}catch(_){}openSheet(trophyHTML(t));}
function trophyCabinetCard(s){const T=(s.trophies||[]).slice();if(!T.length)return `<section class="card trocab" id="sec-trophies"><h2>🏆 Кабинет трофеев</h2><p class="small muted" style="margin-top:6px">Пока пусто. Кубки гонок, медали, грамоты за выигранные пари, титулы года, рекорды продаж и газетные вырезки появятся здесь — с датой, снимком и историей.</p></section>`;
  const by={};T.forEach((t,i)=>{(by[t.y]=by[t.y]||[]).push([t,i]);});
  const shelves=Object.keys(by).sort((a,b)=>b-a).map(y=>`<div class="tro-shelf"><span class="label">${y}</span><div class="tro-row">${by[y].map(([t,i])=>`<button class="tro" data-act="trophy" data-k="${i}" title="${esc(t.title)}"><i>${TROPHY_ICON[t.kind]||'🏆'}</i><b>${esc(t.title)}</b><small>${MONTHS[t.m]||''}${t.sub?' · '+esc(t.sub):''}</small></button>`).join('')}</div></div>`).join('');
  const cnt=k=>T.filter(t=>t.kind===k).length;
  return `<section class="card trocab" id="sec-trophies"><div class="row"><h2>🏆 Кабинет трофеев</h2><span class="pill">${T.length}</span></div>
    <p class="small muted" style="margin-top:4px">🏆 ${cnt('cup')} · 👑 ${cnt('title')} · 📜 ${cnt('charter')} · 🎖 ${cnt('medal')} · 📈 ${cnt('record')} · 🎯 ${cnt('goal')} · 📰 ${cnt('clip')}. Нажмите на трофей — праздник повторится, а газету и кинохронику можно пересмотреть.</p>${shelves}</section>`;}
/* ---------- ставка: деньги и иногда ещё что-то ощутимое ---------- */
const STAKE_X={legacy:'30 очков наследия',bp:'чертежи соперника',drv:'гонщик соперника',dealer:'дилеры соперника',eng:'инженер соперника'};
// одно и то же в течение месяца (доска вызовов перерисовывается — ставка не должна прыгать)
// 0.24: в деловых пари (продажи, пробег — их стало много) гонщика соперника не бывает, а очки наследия — реже
function stakeExtra(s,mq,salt,biz){const r=(hashStr('sx|'+mq+'|'+mi(s)+'|'+(salt||''))%1000)/1000;if(r<0.45)return null;
  if(biz)return {k:r<0.5?'legacy':r<0.67?'bp':r<0.86?'dealer':'eng',mq};
  return {k:r<0.58?'legacy':r<0.7?'bp':r<0.8?'dealer':r<0.9?'eng':'drv',mq};}
function stakeText(C){return money(C.stake)+(C.x&&STAKE_X[C.x.k]?` + ${STAKE_X[C.x.k]}`:'');}
function stakeApply(s,C,H){const X=C.x;if(!X)return '';
  // очков наследия из пари — не больше 90 за игру (три выигрыша); дальше — половина ставки деньгами
  if(X.k==='legacy'){if((s.legBonus||0)>=90){s.cash+=Math.round(C.stake*0.5);return 'вместо очков наследия (их из пари уже 90) — ещё половина ставки деньгами';}s.legBonus=(s.legBonus||0)+30;return '+30 очков наследия';}
  if(X.k==='bp'){const L=rdActive(s);if(L.length){L.forEach(p=>{p.need=Math.max((p.prog||0)+1,Math.round(p.need*0.7));});return 'чертежи соперника: работа КБ короче на 30%';}s.rd.bpStock=(s.rd.bpStock||0)+1;return 'чертежи соперника: следующий проект КБ — на 30% быстрее';}
  if(X.k==='eng'){s.rd.engUntil=Math.max(s.rd.engUntil||0,mi(s))+12;return 'инженер соперника переходит в ваше КБ: +15% к работе КБ на год';}
  if(X.k==='dealer'){const c=H.c&&COUNTRIES[H.c]?H.c:s.country;s.dealers[c]=(s.dealers[c]||0)+2;return `2 дилера ${c===s.country?'соперника':'в стране соперника ('+COUNTRIES[c].name+')'} переходят к вам`;}
  if(X.k==='drv'){const T=RACE_TEAMS.find(t=>t.n===C.mq&&t.from<=s.y&&t.to>=s.y),pool=T?teamDrivers(T,s.y,new Set(s.drivers||[])).filter(d=>!aiOut(s,d.id)):[];
    if(pool.length&&(s.drivers||[]).length<3){const d=pool.sort((a,b)=>b.sk-a.sk)[0];(s.drivers=s.drivers||[]).push(d.id);moodAdd(s,d.id,10,'Перешёл из команды соперника');return `гонщик ${d.n} переходит в вашу команду`;}
    s.cash+=Math.round(C.stake*0.5);return 'вместо гонщика — ещё половина ставки деньгами';}
  return '';}
// спрос в стране соперника: +4% на 3 месяца (проигрыш — минус)
function duelEffect(s,c){const L=s.duelFx;if(!L||!L.length)return 0;const t=mi(s);let u=0;for(const f of L)if(f.until>t&&f.c===c)u+=f.k;return u;}
/* ---------- развязка пари ---------- */
// итог пари → сцена, газета, спрос, счёт, трофей, реванш, дилеры. info: {me,them,carId,prep,num} для гонки, {you,them} для продаж, {forfeit}
function duelOutcome(s,C,win,info){info=info||{};const H=rivalHero(C.mq,s),R=rivalryOf(s,C.mq),rc=C.type==='race'?RACES.find(r=>r.key===C.rk):(C.type==='match'||C.type==='record')?C.rc:null,ev=typeof chalEvName==='function'?chalEvName(s,C,rc):rc?rc.name:C.type==='sales'?`продажи класса «${SEG[C.g].name}»`:'';
  if(win){R.w++;R.st=R.st>0?R.st+1:1;}else{R.l++;R.st=R.st<0?R.st-1:-1;}R.last=mi(s);
  s.duelFx=(s.duelFx||[]).filter(f=>f.until>mi(s));s.duelFx.push({c:H.c||s.country,k:win?0.04:-0.04,until:mi(s)+3});
  const extra=win?stakeApply(s,C,H):'';
  const hot=H.type==='proud'||H.type==='sharp',cat=win?(R.st>=3?(hot&&R.st%2?'rage':'respect'):(hot?'angry':'dign')):'mock';
  const line=heroLine(H,cat,s,ev),rev=win&&R.st<5?heroLine(H,'revenge',s,ev):'';
  const best=info.carId!=null?s.models.find(m=>m.id===info.carId):s.models.filter(m=>m.status==='prod').sort((a,b)=>(b.totalSold||0)-(a.totalSold||0))[0];
  const big=C.stake>=Math.max(2000,1500*cpi(s)),reel=rc&&!rc.match&&typeof raceReelId==='function'?raceReelId(rc):'';
  const ptitle=win?`«${s.company}» обыгрывает ${C.mq}!`:info.forfeit?`«${s.company}» не явилась — ${C.mq} смеётся`:`${C.mq} посмеялась над «${s.company}»`;
  if(win)trophyAdd(s,{kind:'charter',title:`Пари с ${C.mq}`,sub:`${ev}${ev?' · ':''}счёт ${R.w}:${R.l}`,story:`${H.name}: «${line}» Ставка — ${stakeText(C)}${extra?'; '+extra:''}.`,key:'duel|'+C.mq+'|'+mi(s),
    carId:best?best.id:null,prep:rc?info.prep||1:0,num:info.num||0,pt:ptitle,reel:big&&reel?reel:'',rk:rc?rc.key:''});
  // сцена развязки — сразу; газета — следом
  pushEvent({kicker:'Пари',title:win?`Пари с ${C.mq} выиграно`:`Пари с ${C.mq} проиграно`,deck:ev,text:line,own:1,
    duel:{win,H,line,rev,score:`${R.w}:${R.l}`,st:R.st,stake:C.stake,x:C.x?C.x.k:'',extra,ev,mq:C.mq,sales:C.type==='sales'?{you:info.you||0,them:info.them||0,hc:C.hc||1,c:C.c&&C.c!==s.country?C.c:''}:null,trial:info.trial||null,match:info.match?Object.assign({kind:C.type},info.match):null,race:!!rc,forfeit:!!info.forfeit},
    choices:(()=>{const st=money(Math.round(C.stake*1.5/50)*50);
      // 0.25: реванш просит тот, кто проиграл. Выиграли вы — соперник просит отыграться, вы решаете, дать ли ему шанс;
      // проиграли — отыграться можете вы (не после неявки)
      if(s.over)return [['Дальше','chalOk']];
      if(win)return rev?[['Дальше','chalOk'],[`Дать ${C.mq} отыграться · ставка ${st}`,'chalRev']]:[['Дальше','chalOk']];
      return info.forfeit?[['Дальше','chalOk']]:[['Дальше','chalOk'],[`Потребовать реванша · ставка ${st}`,'chalRev']];})()});
  pushEvent({kicker:'Спорт и дела',own:1,carId:best?best.id:null,carOpt:rc&&best?{prep:info.prep||1,num:info.num||0,country:s.country,y:s.y}:null,caption:best?`«${best.name}» компании «${s.company}»`:'',
    title:ptitle,deck:`Пари: ${stakeText(C)}${ev?' · '+ev:''}`,
    text:(win?`Пари выиграно — ${money(C.stake)} переходят в кассу «${s.company}»${extra?', а ещё '+extra:''}. ${H.name} сказал репортёрам: «${line}»`
      :info.forfeit?`«${s.company}» приняла вызов, но не привезла машину на «${ev}». Ставка ${money(C.stake)} ушла сопернику. ${H.name} не упустил случая: «${line}»`
      :`Пари проиграно: «${s.company}» платит ${money(C.stake)}. ${H.name} не удержался: «${line}»`)+
      `\nСчёт соперничества: «${s.company}» — ${C.mq} ${R.w}:${R.l}. ${win?'Три месяца покупатели в стране соперника охотнее смотрят на ваши машины.':'Три месяца покупатели в стране соперника будут прохладнее.'}`,
    choices:big&&reel?[['Читать дальше','ok'],['▶ Кинохроника','reel:'+reel]]:[['Читать дальше','ok']]},true);
  // три победы подряд — дилеры соперника просятся к вам
  if(win&&R.st===3&&H.c&&COUNTRIES[H.c])pushEvent({kicker:'Дилеры',own:1,title:`Дилеры ${C.mq} хотят к вам`,deck:'После трёх побед подряд',
    text:`Трое дилеров ${C.mq} (${COUNTRIES[H.c].name}) пишут, что покупатели всё чаще спрашивают машины «${s.company}». Они готовы перейти к вам — без платы за вход.`,
    choices:[['Принять дилеров','chalDealers'],['Отказаться','chalDealersNo']],dc:H.c});
  s.revOffer=(win?!!rev:!info.forfeit)?{mq:C.mq,stake:Math.round(C.stake*1.5/50)*50,type:C.type,g:C.g,ci:C.ci,mine:!win,base:C.type==='match'||C.type==='record'||C.type==='trial'||C.mon?Object.assign({},C,{acc:0}):null}:null;
  addLog(win?`⚔️ Счёт с ${C.mq}: ${R.w}:${R.l}${R.st>=2?` (серия ${R.st})`:''}.`:`Счёт с ${C.mq}: ${R.w}:${R.l}.`,win?'good':'bad');}
// реванш: новое пари со ставкой в полтора раза выше — на ближайшую гонку или продажи этого (следующего) года
function duelRevenge(s){const O=s.revOffer;s.revOffer=null;if(!O||s.chal)return false;
  if(O.base&&typeof chalRevenge==='function'){const r=chalRevenge(s,O);if(r!==null)return r;}
  if(O.type==='race'){const now=mi(s),L=RACES.filter(rc=>{const d=(rc.y-1895)*12+rc.m-now;return d>=1&&d<=5&&!GBC_IDS.includes(rc.id)&&raceEligible(rc,s)&&!raceWarBlocked(rc,s)&&!s.cres[rc.key]&&s.raceDone[rc.key]===undefined;});
    const rc=L.sort((a,b)=>(a.y-b.y)||(a.m-b.m))[0];if(!rc){addLog(`Реванш с ${O.mq} отложен: в ближайшие месяцы нет подходящей гонки.`);return false;}
    s.chal={type:'race',rk:rc.key,mq:O.mq,stake:O.stake,acc:1,x:stakeExtra(s,O.mq,'rev')};s.chalLast=mi(s);addLog(`⚔️ Реванш с ${O.mq}: «${rc.name}», ставка ${stakeText(s.chal)}. Заявите команду!`,'good');pendingToasts.push('⚔️ Реванш принят');return true;}
  s.revPending={mq:O.mq,stake:O.stake,g:O.g,ci:O.ci,y:s.m<=1?s.y:s.y+1};addLog(`⚔️ Реванш с ${O.mq} по продажам — в ${s.revPending.y} году, ставка ${money(O.stake)}.`,'good');pendingToasts.push('⚔️ Реванш принят');return true;}
// реванш по продажам начинается сам, когда придёт его год
function duelRevTick(s){const P=s.revPending;if(!P||s.chal||s.y<P.y)return;s.revPending=null;if(s.y>P.y||s.m>8||!SEG[P.g])return;
  const cp=(COMPS[s.country]||[])[P.ci];if(!cp||!compAlive(cp,s))return;
  const C=s.chal={type:'sales',g:P.g,mq:P.mq,ci:P.ci,y:s.y,stake:P.stake,acc:1,x:stakeExtra(s,P.mq,'rev')};s.chalLast=mi(s);
  C.y0=(s.segY||{})[C.g]||0;C.r0=(chalRival(s,C).ys||{})[C.g]||0;
  addLog(`⚔️ Реванш с ${P.mq}: кто продаст больше машин класса «${SEG[P.g].name}» до конца ${s.y} года. Ставка ${stakeText(C)}.`,'good');pendingToasts.push('⚔️ Реванш начался');}
function duelResolve(s,key){
  if(key==='chalRev')duelRevenge(s);
  if(key==='chalOk')s.revOffer=null;
  if(key==='chalDealers'){const ev=s.pending[0],c=ev&&ev.dc;if(c){s.dealers[c]=(s.dealers[c]||0)+3;addLog(`Три дилера соперника перешли к «${s.company}» (${COUNTRIES[c]?COUNTRIES[c].name:c}).`,'good');pendingToasts.push('🏪 +3 дилера');}}}
// итог цели года — такая же сцена: выполнена — праздник и трофей; нет — кто забрал титул и что он сказал
function goalScene(s,q,ok,who){const H=who?rivalHero(who,s):null,line=ok?'':H?heroLine(H,'mock',s,q.name):'';
  pushEvent({kicker:'Цель года',own:1,title:ok?`Цель выполнена: ${q.name}`:`Цель не выполнена: ${q.name}`,deck:ok?`Награда ${money(q.reward)}`:who?`Титул забрал ${who}`:'Титул никому не достался',text:ok?'Трофей — в кабинете «Империи».':line||'Газеты напомнили об обещании.',
    cel:ok?['Цель года!',q.name,'🎯']:null,duel:{goal:1,win:!!ok,H:H||{name:'',mq:'',type:'biz',pk:''},line,rev:'',score:'',st:0,stake:q.reward,extra:'',ev:q.name,mq:who||'',sales:null,race:false,forfeit:false},choices:[['Дальше','chalOk']]});}
function goalHTML(D){const win=D.win;
  return `<div class="duel ${win?'win':'lose'}"><span class="label">🎯 Цель года</span>
    <div class="duel-top">${win?'<div class="tro-big" style="margin:0;width:72px">🎯</div>':D.mq?heroPortrait(D.H):'<div class="tro-big" style="margin:0;width:72px">📰</div>'}<div><h2>${win?'Цель выполнена!':'Цель не выполнена'}</h2><p class="small muted">${esc(D.ev)}</p></div></div>
    ${win?`<p class="good" style="margin-top:10px"><b>+${money(D.stake)}</b> — награда · репутация +2</p><p class="small muted" style="margin-top:4px">🎯 Трофей — в кабинете трофеев (Империя). Новые цели на ${G.y} год — на доске вызовов.</p>`
      :`${D.mq?`<p class="small" style="margin-top:10px">Титул забрал <b>${esc(D.mq)}</b>. ${esc(D.H.name)}:</p><blockquote class="duel-q">«${esc(D.line)}»</blockquote>`:'<p style="margin-top:10px">Титул в этом году не достался никому.</p>'}
      <p class="small muted" style="margin-top:6px">Репутация −1: газеты напомнили об обещании. Новую цель можно взять на доске вызовов.</p>`}</div>`;}
// сцена развязки: портрет, реплика, счёт, ставка; тема соперника и телеграф (на гонке — трибуны)
function duelHTML(D){if(D.goal)return goalHTML(D);const H=D.H,win=D.win;
  return `<div class="duel ${win?'win':'lose'}"><span class="label">⚔️ Пари${D.ev?' · '+esc(D.ev):''}</span>
    <div class="duel-top">${heroPortrait(H)}<div><h2>${D.match?(D.match.kind==='record'?(win?'Скорость ваша!':'Соперник быстрее'):(win?'Матч выигран!':'Матч проигран')):D.trial?(win?'Пробег выигран!':'Пробег проигран'):win?'Пари выиграно!':'Пари проиграно'}</h2><p class="small muted">${esc(H.name)} · ${H.role?esc(H.role)+' ':''}«${esc(D.mq)}» · ${HERO_TYPE_N[H.type]||''}</p></div></div>
    <blockquote class="duel-q">«${esc(D.line)}»</blockquote>
    ${D.sales?`<p class="small" style="margin-top:6px">Продажи ${D.sales.c&&COUNTRIES[D.sales.c]?'('+esc(COUNTRIES[D.sales.c].name)+')':'в стране'}: вы — ${fmtN(D.sales.you)}, ${esc(D.mq)} — ${fmtN(D.sales.them)}${D.sales.hc&&D.sales.hc!==1?` (с форой ×${String(Math.round(D.sales.hc*100)/100).replace('.',',')} — ${fmtN(Math.round(D.sales.them*D.sales.hc))})`:''}</p>`:''}${D.trial?duelTrialHTML(D.trial,D.mq):''}${D.match?duelMatchHTML(D.match,D.mq):''}${D.forfeit?'<p class="small bad" style="margin-top:6px">Команда не приехала на гонку — пари проиграно без борьбы.</p>':''}
    <div class="duel-score"><span>Счёт</span><b>Вы — ${esc(D.mq)} ${D.score}</b><i class="duel-stamp">${win?'Выиграно':'Проиграно'}</i>${D.st>=2?`<em>побед подряд: ${D.st}</em>`:D.st<=-2?`<em class="bad">поражений подряд: ${-D.st}</em>`:''}</div>
    <p class="${win?'good':'bad'}" style="margin-top:8px"><b>${win?'+':'−'}${money(D.stake)}</b> ${win?'— ставка ваша':'— ставка уходит сопернику'}${D.extra?` · ${esc(D.extra)}`:''}</p>
    <p class="small muted" style="margin-top:4px">${win?'📜 Грамота — в кабинете трофеев (Империя). Три месяца покупатели в стране соперника охотнее берут ваши машины.':'Три месяца покупатели в стране соперника будут прохладнее. Отыграться можно в новом пари — доска вызовов на вкладке «Империя».'}</p>
    ${D.rev?`<p class="small warn" style="margin-top:6px">${esc(H.name)} просит реванша: «${esc(D.rev)}»</p><p class="small muted" style="margin-top:2px">Дать отыграться — новое пари со ставкой в полтора раза выше; «Дальше» — отказать: победа остаётся за вами.</p>`
      :!win&&!D.forfeit&&!D.goal?`<p class="small muted" style="margin-top:6px">Можно потребовать реванша — новое пари со ставкой в полтора раза выше.</p>`:''}</div>`;}
// 0.24: пробег — таблица этапов; матч и спор о скорости — скорость обоих
function duelTrialHTML(T,mq){return `<p class="small" style="margin-top:6px">${esc(T.route)} · ${fmtN(T.km)} км: «${esc(T.md)}» против ${esc(T.rv)}</p>
  <table class="pl" style="margin-top:4px"><tr><th class="n">Этап</th><th>Вы</th><th>${esc(String(mq).slice(0,14))}</th></tr>${T.rows.map(r=>`<tr><td class="n">${r[0]}</td><td class="${r[1]?'bad':'good'}">${r[1]?'поломка: '+esc(r[1]):'✓'}</td><td class="${r[2]?'bad':'good'}">${r[2]?'поломка: '+esc(r[2]):'✓'}</td></tr>`).join('')}
  <tr><td class="n">Итог</td><td><b>${T.pM} ${plural(T.pM,'поломка','поломки','поломок')}</b> · ${T.kmhM} км/ч</td><td><b>${T.pT} ${plural(T.pT,'поломка','поломки','поломок')}</b> · ${T.kmhT} км/ч</td></tr></table>`;}
function duelMatchHTML(M,mq){const sp=v=>v?v+' км/ч':'—';
  return `<p class="small" style="margin-top:6px">${M.kind==='record'?'Скорость на заезде':'Средняя скорость'}: вы — <b>${M.dnfMe?'сход ('+esc(M.dnfMe)+')':sp(M.vMe)}</b>, ${esc(mq)}${M.drvTh?' ('+esc(M.drvTh)+')':''} — <b>${M.dnfTh?'сход ('+esc(M.dnfTh)+')':sp(M.vTh)}</b></p>${M.lsr?`<p class="small good" style="margin-top:4px">📈 Быстрее мирового рекорда (${M.lsr.old[1]} км/ч, ${esc(M.lsr.old[2])})!</p>`:''}`;}
function duelShow(ev){openSheet(duelHTML(ev.duel)+`<div class="stack" style="margin-top:14px">${ev.choices.map((c,i)=>`<button class="btn ${i===0?'primary':''} block" data-act="choose" data-k="${c[1]}">${esc(c[0])}</button>`).join('')}</div>`);
  if(!ev.thOn){ev.thOn=1;if(ev.duel.goal){if(!ev.duel.win&&ev.duel.mq)try{duelTheme(ev.duel.H.type,false,false);}catch(_){}}else try{duelTheme(ev.duel.H.type,ev.duel.win,ev.duel.race);}catch(_){}}}
// тема соперника (4–5 с): гордый — фанфары, деловой — бойкое фортепиано, аристократ — струнный вальс, язвительный — кларнет с насмешкой.
// Проиграли — торжествует тема соперника. 0.25: выиграли — звучат ваши победные фанфары (раньше — «сникшая» тема соперника,
// а она звучала грустно, будто проиграли вы); музыка игры на это время приглушается (auCue → musDuck)
const DUEL_THEME={proud:[[72,0,.3],[72,.3,.15],[72,.45,.15],[76,.6,.45],[72,1.05,.3],[76,1.35,.3],[79,1.65,.9],[84,2.6,.35],[83,2.95,.35],[84,3.3,1.3],[60,0,.6],[55,1.05,.6],[60,1.65,.9],[48,3.3,1.3]],
  biz:[[60,0,.2],[64,.22,.2],[67,.44,.2],[72,.66,.4],[71,1.1,.2],[72,1.32,.2],[74,1.54,.2],[76,1.76,.5],[74,2.3,.2],[72,2.52,.2],[71,2.74,.2],[72,2.96,.2],[67,3.2,.2],[72,3.45,1],[48,0,.4],[55,.66,.4],[53,1.54,.4],[48,2.52,.4],[48,3.45,1]],
  aristo:[[67,0,.6],[71,.6,.3],[74,.9,.3],[79,1.2,.9],[78,2.1,.3],[76,2.4,.3],[74,2.7,.6],[72,3.3,.3],[71,3.6,.3],[67,3.9,1.1]],
  sharp:[[76,0,.12],[77,.12,.12],[76,.24,.12],[77,.36,.12],[74,.6,.3],[73,.95,.3],[72,1.3,.3],[71,1.65,.5],[79,2.3,.12],[78,2.42,.12],[77,2.54,.12],[76,2.66,.12],[75,2.9,.25],[74,3.2,.25],[67,3.55,.9]]};
const DUEL_INS={proud:'trumpet',biz:'piano',aristo:'violin',sharp:'clarinet'};
function duelNotes(type,win){const N=DUEL_THEME[type]||DUEL_THEME.biz;if(!win)return N.map(([n,d,l])=>[n,d*0.92,l*0.92]);
  // сникшая тема: большая терция и секста — вниз на полтона, темп медленнее, на кварту ниже
  return N.map(([n,d,l])=>{const k=((n%12)+12)%12;return [n-5-(k===4||k===9||k===11?1:0),d*1.15,l*1.15];});}
function duelTheme(type,win,race){if(!AU.ctx||!AU.on.sfx)return;const c=AU.ctx,dest=AU.fx||c.destination,ins=DUEL_INS[type];
  // 0.23: тема — оркестром (файл рядом с игрой, 50-audio.js auCue); нет файла — прежние семплы или синтезатор
  // 0.24: без файла — живые семплы инструмента; нет и их — тишина (никакого «пиканья» генератором)
  const synth=()=>{const t0=c.currentTime+0.02,useIns=typeof inst==='function'&&INS.idx&&INS.idx.inst&&INS.idx.inst[ins]&&INS.buf[ins];if(!useIns)return;
    duelNotes(type,win).forEach(([n,d,l])=>{try{inst(ins,n,t0+d,l,0.5,dest);}catch(_){}});};
  const fan=()=>{try{auCue('fanfare',0.8,()=>{});}catch(_){}};
  setTimeout(()=>{try{if(win)auCue('win',0.8,fan);else auCue('duel_'+(DUEL_THEME[type]?type:'biz')+'_l',0.75,synth);}catch(_){if(!win)synth();}},race?100:950);
  // перед темой: телеграф «точка-тире» (на гонке вместо него — трибуны)
  if(race){try{auSfx('cheer',win?0.8:0.4);}catch(_){}return;}
  // 0.24: телеграф — не «пищалка», а щелчки клопфера (якорь стучит по упору и отскакивает), как на почтамте эпохи
  if(!AU.noise)return;[0,.09,.18,.42,.51,.75,.84].forEach(d=>{const tt=c.currentTime+0.02+d;try{vNoise(tt,0.018,0.32,'bandpass',2300,dest);vNoise(tt+0.002,0.03,0.2,'bandpass',900,dest);vNoise(tt+0.055,0.014,0.12,'bandpass',1700,dest);}catch(_){}});}
/* ---------- витрина «Империя» на главном экране (ТЗ, раздел 3) ---------- */
const MONTHS_P=['январе','феврале','марте','апреле','мае','июне','июле','августе','сентябре','октябре','ноябре','декабре'];
function whenTxt(rc,s){return rc.m===s.m&&rc.y===s.y?'в этом месяце':rc.y===s.y?'в '+MONTHS_P[rc.m]:`в ${MONTHS_P[rc.m]} ${rc.y}`;}
// ближайшая цель — самая достижимая: место в наследии, титул года, цель года
function nextGoal(s){const C=[];let t=null;try{t=legacyTable(s);}catch(_){}
  if(t&&t.place>1){const a=t.rows[t.place-2],need=Math.max(1,Math.ceil(a.L.total-t.me.total));C.push({k:'leg'+(t.place-1),icon:'🏛',sec:'sec-legacy',text:`До ${t.place-1}-го места в наследии (${a.n}) — ${fmtN(need)} ${plural(need,'очко','очка','очков')}`,pct:clamp(t.me.total/Math.max(1,a.L.total),0,0.99),tab:'log'});}
  try{titlesRace(s).forEach(r=>{if(r.you>=r.min&&r.you>r.them)return;if(!r.you&&!r.them)return;const target=Math.max(r.min,r.them+1);
    C.push({k:'t'+r.k,icon:r.icon,sec:'sec-titles',text:`${r.t} ${s.y}: ${r.unit(r.you)}${r.themN?` · впереди ${r.themN}`:''}`,pct:clamp(r.you/Math.max(1,target),0,0.99),tab:'log'});});}catch(_){}
  (s.goals||[]).filter(q=>q.y===s.y).forEach(q=>{const r=(()=>{try{return titlesRace(s).find(x=>x.k===q.k);}catch(_){return null;}})();
    C.push({k:'g'+q.k,icon:'🎯',sec:'sec-board',text:`Цель года: ${q.name}${r?` — ${r.unit(r.you)}`:''}`,pct:r?clamp(r.you/Math.max(1,Math.max(r.min,r.them+1)),0,0.99)+0.05:0.5,tab:'log'});});
  return C.sort((a,b)=>b.pct-a.pct)[0]||null;}
// что сделать дальше: гонка этого месяца, совет помощника или просто следующий месяц
function nextStep(s){if(s.over)return s.soldTo&&s.y<1930?{icon:'🏭',text:'Компания продана — купите другую марку («Империя»)',tab:'log'}:{icon:'🏁',text:'Игра окончена — итоги во вкладке «Империя»',tab:'log'};
  if(!s.models.some(m=>m.status==='prod'||m.status==='dev'))return {icon:'✏️',text:'Придумайте первую машину: «Модели» → «Новая модель»',tab:'models'};
  {const C=s.chal;if(C&&C.acc&&C.rc){const T=(C.rc.y-1895)*12+C.rc.m,t=mi(s);if(t>=T-1&&t<=T)return {icon:'⚔️',text:`${MATCH_ST[C.type]} с ${C.mq}: ${C.rc.venue} — выставьте машину${t===T?' (последний месяц!)':''}`,tab:'race',rk:C.rc.key};}}
  const rc=RACES.filter(r=>raceOpen(r,s)&&raceEligible(r,s)&&!raceWarBlocked(r,s)&&!s.cres[r.key]&&s.raceDone[r.key]===undefined).sort((a,b)=>a.m-b.m)[0];
  if(rc&&raceCarsFor(s).length)return {icon:'🏁',text:`${rc.m===s.m?'Гонка в этом месяце':'Запись на гонку'}: «${rc.name}» — выставьте машину`,tab:'race',rk:rc.key};
  if(!DIF().helper){try{const A=adviceList(s).slice().sort((a,b)=>b.p-a.p)[0];if(A&&A.p>=60)return {icon:A.icon||'💡',text:String(A.text).replace(/<[^>]+>/g,'').split(/(?<=[.!?])\s/)[0],tab:A.tab||'plant'};}catch(_){}}
  return {icon:'▶',text:'Жмите «Следующий месяц» — время идёт, машины продаются',tab:null};}
function showcaseMonth(s){try{const t=legacyTable(s);s.legPrev=s.legNow===undefined?t.me.total:s.legNow;s.legNow=t.me.total;}catch(_){}}
let EC_FLASH=false;
function empireStrip(s){EC_FLASH=false;if(!s)return '';let t=null;try{t=legacyTable(s);}catch(_){}
  const L=sagaList(s),seen=((s.saga||{}).seen||[]).length,tit=(s.titles||[]).length,won=Object.values(s.rivalry||{}).reduce((a,r)=>a+r.w,0),tro=(s.trophies||[]).length;
  const dv=t&&s.legPrev!==undefined?Math.round(t.me.total-s.legPrev):0,G2=nextGoal(s),NS=nextStep(s),last=(s.trophies||[]).slice(-1)[0],C=s.chal&&s.chal.acc?s.chal:null;
  // цель достигнута (новое место в наследии или новый трофей) — карточка на миг вспыхивает золотом
  EC_FLASH=!!((s.ecPlace&&t&&t.place<s.ecPlace)||(s.ecTro!==undefined&&tro>s.ecTro));if(t)s.ecPlace=t.place;s.ecTro=tro;
  let chal='';if(C){const rc=C.type==='race'?RACES.find(r=>r.key===C.rk):null,sc=rivalryScore(s,C.mq);
    const what=rc?`«${esc(rc.name)}» ${whenTxt(rc,s)}`:C.rc?`${esc(MATCH_ST[C.type]||'')}: ${esc(C.rc.venue)} ${whenTxt(C.rc,s)}`:C.type==='trial'?`пробег ${esc(C.route)}`:C.mon?`продажи «${esc(SEG[C.g].name)}»${C.c!==s.country?' ('+esc(COUNTRIES[C.c].name)+')':''}, ${esc(chalPerText(C))}`:`продажи до конца ${C.y}`;
    const ck=C.rc?C.rc.key:rc?rc.key:'';chal=`<button class="ec-row chal" ${ck?`data-act="raceTo" data-k="${esc(ck)}"`:`data-act="tab" data-t="log" data-sec="sec-board"`}><i>⚔️</i><span><b>${esc(C.mq)}</b>: ${what} · ${stakeText(C)}${sc?` · счёт ${sc}`:''}</span></button>`;}
  const ph=last&&last.carId!=null?(()=>{const md=s.models.find(m=>m.id===last.carId);return md?carArt(md,{w:140,cls:'ec-ph',prep:last.prep||0,num:last.num||0,y:last.y}):'';})():'';
  return `<div class="ec-top" data-act="tab" data-t="log" data-sec="sec-legacy" role="button" aria-label="Империя: наследие"><div class="ec-place"><b>${t?t.place:'—'}<small>-е</small></b><span>место в наследии</span></div>
      <div class="ec-pts"><b>${t?fmtN(Math.round(t.me.total)):0}</b> очков${dv?` <em class="${dv>0?'good':'bad'}">${dv>0?'▲':'▼'}${Math.abs(dv)}</em>`:''}</div></div>
    ${G2?`<button class="ec-row goal" data-act="tab" data-t="${G2.tab}" data-sec="${G2.sec||''}"><i>${G2.icon}</i><span>${esc(G2.text)}<em class="ec-bar"><b style="width:${Math.round(G2.pct*100)}%"></b></em></span></button>`:''}
    ${last?`<button class="ec-row tri" data-act="trophy" data-k="${s.trophies.length-1}">${ph||`<i>${TROPHY_ICON[last.kind]||'🏆'}</i>`}<span>${esc(last.title)}${last.sub?' · '+esc(last.sub):''} <small>${MONTHS[last.m]} ${last.y}</small></span></button>`
      :'<button class="ec-row tri first" data-act="tab" data-t="race"><i>🏁</i><span><b>Первая цель:</b> выиграйте гонку или пари — триумф появится здесь</span></button>'}
    ${chal}
    <button class="ec-row next" ${NS.rk?`data-act="raceTo" data-k="${esc(NS.rk)}"`:NS.tab?`data-act="tab" data-t="${NS.tab}"`:'data-act="next"'}><i>${NS.icon}</i><span><b>Дальше:</b> ${esc(NS.text)}</span></button>
 <div class="ec-badges" data-act="tab" data-t="log" data-sec="sec-trophies" role="button" aria-label="Титулы, пари, фильм, трофеи"><span title="Титулы">👑 ${tit}</span><span title="Выигранные пари">⚔️ ${won}</span><span title="Главы фильма">🎬 ${seen}/${L.length}</span><span title="Трофеи">🏆 ${tro}</span></div>`;}
