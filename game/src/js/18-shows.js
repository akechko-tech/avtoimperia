/* ================= ВЫСТАВКИ: стенд за деньги — репутация, заказы, дилеры, медали ================= */
// Настоящие выставки эпохи: даты, места и цифры — по истории Парижского салона, IAA, SMMT, Нью-Йоркской выставки и спискам
// Туринского музея автомобиля. Месяцы небольших выставок (Берлин 1902–1928, Чикаго) — примерные.
const SHOW_HOST={
  paris:{c:'fr',name:'Парижский автосалон',w:3},expo:{c:'fr',name:'Всемирная выставка в Париже',w:3.5},berlin:{c:'de',name:'Берлинская автовыставка',w:2},
  london:{c:'uk',name:'Лондонский автосалон',w:2.5},ny:{c:'us',name:'Нью-Йоркская автовыставка',w:2.5},chicago:{c:'us',name:'Чикагская автовыставка',w:1.6},
  turin:{c:'it',name:'Туринский автосалон',w:1.5},milan:{c:'it',name:'Миланский автосалон',w:1.5},rome:{c:'it',name:'Римский автосалон',w:1.2}};
const SHOWS=(()=>{const L=[],add=(h,y,m,venue,facts,x)=>L.push(Object.assign({id:h+'-'+y+'-'+m,h,y,m,venue,facts:facts||''},x||{}));
  // Париж: первая в мире выставка автомобилей, потом — Гран-Пале
  add('paris',1898,5,'сад Тюильри','15 июня — 3 июля 1898 года: первая в мире выставка автомобилей. 232 машины, 140 тысяч посетителей. Допускали только те машины, что своим ходом съездили из Парижа в Версаль и обратно — около 40 километров.',{ver:1});
  add('paris',1899,5,'сад Тюильри','Вторая выставка в Тюильри. Здесь Луи Рено показал «Тип А» с прямой передачей: посетители сами двигали рычаг — и он получил около 60 твёрдых заказов.',{alt:{renault:'Вторая выставка в Тюильри. Лучше всего продаёт машину то, что её можно потрогать: посетители сами двигают рычаги, садятся за руль, заводят мотор.'}});
  add('expo',1900,6,'Венсенн','Всемирная выставка (14 апреля — 12 ноября, больше 50 миллионов посетителей). Салона в этом году нет: вместо него в Венсенне — 14 конкурсов автомобилей с медалями: двух- и четырёхместные машины, такси, фургоны, грузовики, пожарная машина. В гонке Париж — Тулуза — Париж победили Луи Рено (малые машины) и «Левег» на Mors.',{medals:1,img:'Exposition Universelle (1900)',alt:{renault:'Всемирная выставка (14 апреля — 12 ноября, больше 50 миллионов посетителей). Салона в этом году нет: вместо него в Венсенне — 14 конкурсов автомобилей с медалями: двух- и четырёхместные машины, такси, фургоны, грузовики, пожарная машина. В гонке Париж — Тулуза — Париж среди больших машин победил «Левег» на Mors.'}});
  add('paris',1901,0,'Гран-Пале','Салон переехал в новый Гран-Пале: 600 стендов. Зимой залы не топили — их прозвали «маленькой Сибирью».',{img:'Grand Palais'});
  for(let y=1902;y<=1908;y++)add('paris',y,11,'Гран-Пале',y===1902?'230 тысяч посетителей. Впервые — электрический свет и кинематограф Гомона.':y===1904?'Гран-Пале стал тесен: грузовики вынесли на набережную Кур-ля-Рен.':'',{img:'Grand Palais'});
  for(let y=1910;y<=1913;y++)add('paris',y,9,'Гран-Пале',y===1910?'Салон вернулся после года перерыва.':y===1913?'Показывают Ford T — машину с движущегося конвейера.':'',{img:'Grand Palais'});
  for(let y=1919;y<=1930;y++)if(y!==1925)add('paris',y,9,'Гран-Пале',y===1919?'Первый салон после войны — только 15-й по счёту: 118 экспонентов.':y===1921?'Ситроен показывает малолитражку 5 CV.':y===1924?'116 экспонентов.':y===1926?'Салон вернулся: в 1925 году Гран-Пале отдали Выставке декоративных искусств.':'',{img:'Grand Palais'});
  // Берлин
  add('berlin',1897,8,'отель «Бристоль» на Унтер-ден-Линден','30 сентября 1897 года — первая немецкая автовыставка: всего 8 машин — Benz Velo, Lutzmann, Kühlstein и Daimler.',{img:'Hotel Bristol (Berlin)'});
  add('berlin',1898,8,'выставочный парк у Лертерского вокзала','Вторая выставка: машин уже столько, что в отеле им тесно.');
  add('berlin',1899,8,'выставочный парк у Лертерского вокзала','');
  add('berlin',1902,2,'Берлин','Выставку впервые устраивает Союз немецких автопромышленников.');
  add('berlin',1905,1,'Берлин','Выставку открывает кайзер Вильгельм II.');
  add('berlin',1906,1,'Берлин','Спрос так велик, что выставки идут дважды в год.');add('berlin',1906,9,'Берлин','');add('berlin',1907,1,'Берлин','');add('berlin',1907,9,'Берлин','');
  add('berlin',1911,9,'Берлин','');
  add('berlin',1921,8,'новый зал на Кайзердамм','Первая выставка после войны: 67 немецких фирм, 90 машин.');
  [1923,1924,1925,1926,1928].forEach(y=>add('berlin',y,9,'зал на Кайзердамм',y===1923?'Больше 600 экспонентов.':''));
  // Лондон
  add('london',1896,4,'Имперский институт, Южный Кенсингтон','Первая британская выставка «безлошадных экипажей» — её устроил «Моторный клуб» Гарри Лоусона.',{img:'Imperial Institute'});
  add('london',1903,1,'Хрустальный дворец','Первый салон Общества автопромышленников и торговцев (SMMT). В этом году предел скорости подняли с 14 до 20 миль в час.',{img:'The Crystal Palace'});
  add('london',1904,1,'Хрустальный дворец','',{img:'The Crystal Palace'});
  for(let y=1905;y<=1913;y++)add('london',y,10,'зал «Олимпия»',y===1905?'Салон переехал в «Олимпию» — здесь он будет 32 года.':'',{img:'Olympia London'});
  for(let y=1919;y<=1930;y++)add('london',y,10,'зал «Олимпия»',y===1919?'Первый салон после войны.':'',{img:'Olympia London'});
  // США
  add('ny',1900,10,'Мэдисон-сквер-гарден','3–10 ноября 1900 года — первая национальная автовыставка: 160 машин, 48 тысяч посетителей по 50 центов. Вокруг стендов — дорожка для показа езды и 60-метровая горка для проверки подъёма. Больше всего нравились электромобили, потом паровые машины, бензиновые — только третьи.',{img:'Madison Square Garden (1890)'});
  add('ny',1901,10,'Мэдисон-сквер-гарден','',{img:'Madison Square Garden (1890)'});
  for(let y=1903;y<=1930;y++)add('ny',y,0,y<1926?'Мэдисон-сквер-гарден':'Нью-Йорк',y===1926?'Старый Мэдисон-сквер-гарден снесли — выставка переехала.':'',y<1926?{img:'Madison Square Garden (1890)'}:{});
  for(let y=1901;y<=1930;y++)add('chicago',y,y===1901?2:1,'Чикаго',y===1901?'Первая автовыставка в Чикаго.':'');
  // Италия
  [[1900,3,'turin','замок Валентино','21–24 апреля 1900 года — первый итальянский салон: 19 марок (10 итальянских, 8 французских, 1 немецкая), около 2 тысяч посетителей, билет — 20 чентезимо.',{img:'Castello del Valentino'}],
   [1901,4,'milan'],[1902,5,'turin'],[1904,1,'turin'],[1905,0,'turin'],[1905,4,'milan'],[1906,1,'turin'],[1906,3,'milan'],[1907,1,'turin'],[1907,4,'milan'],[1908,0,'turin'],[1909,0,'turin'],[1910,3,'turin'],[1911,6,'turin'],[1913,3,'turin'],
   [1920,3,'milan'],[1921,3,'milan'],[1922,3,'milan'],[1923,3,'milan'],[1924,3,'milan'],[1925,3,'milan'],[1926,3,'milan'],[1927,3,'milan'],[1928,4,'milan'],[1929,0,'rome'],[1930,3,'milan']]
   .forEach(([y,m,h,v,f,x])=>add(h,y,m,v||({turin:'Турин',milan:'Милан',rome:'Рим'}[h]),f||'',x));
  return L.sort((a,b)=>(a.y*12+a.m)-(b.y*12+b.m));})();
const showMi=sh=>(sh.y-1895)*12+sh.m;
// Историческая справка; если в ней — сам основатель вашей марки, газета пишет иначе
function showFacts(sh,s){return (sh.alt&&sh.alt[s.pioneer])||sh.facts;}
function showName(sh){return SHOW_HOST[sh.h].name+' '+sh.y;}
// Приглашают на выставки дома, там, где есть дилеры, и на самые большие (Париж, Лондон, Нью-Йорк, Всемирная)
function showRelevant(sh,s){const H=SHOW_HOST[sh.h];return H.c===s.country||dealerCount(s,H.c)>0||H.w>=2.5;}
// Чужие выставки без своих дилеров зовут реже: не чаще раза в три года (Всемирная — всегда)
function showAskOk(sh,s){const H=SHOW_HOST[sh.h];if(H.c===s.country||dealerCount(s,H.c)>0||sh.medals)return true;const t=(s.showAsk||{})[sh.h];return t===undefined||mi(s)-t>=34;}
function standCost(sh,s,big){return Math.round(260*tabAt(CPI,sh.y)*(1+(sh.y-1895)*0.06)*SHOW_HOST[sh.h].w*(big?3:1)/50)*50;}
// Что везти: лучшая машина в продаже; если продаж ещё нет — прототип из разработки
function showModel(s){const act=s.models.filter(m=>m.status==='prod').sort((a,b)=>classScore(b,s)-classScore(a,s));return act[0]||s.models.find(m=>m.status==='dev')||null;}
// Интерес покупателей после выставки: полезность марки в стране, затухает за полгода-год
function showEffect(s,c){const f=s.showFx&&s.showFx[c];if(!f)return 0;const age=mi(s)-f.t;return age<0?0:f.u*Math.exp(-age/7);}
function checkShows(s){
  if(s.over)return;s.shows=s.shows||{};
  // выставка этого месяца, на которую сняли стенд
  SHOWS.forEach(sh=>{if(showMi(sh)===mi(s)){const e=s.shows[sh.id];if(e&&e.cost&&!e.done)showRun(s,sh,e);else if((!e||e.skip)&&showRelevant(sh,s)&&SHOW_HOST[sh.h].c===s.country)addLog(`Прошёл ${showName(sh)} — без вашего стенда.`,'hist');}});
  // приглашение за месяц: одна выставка в месяц, самая важная
  const next=SHOWS.filter(sh=>showMi(sh)===mi(s)+1&&!s.shows[sh.id]&&showRelevant(sh,s)&&showAskOk(sh,s)).sort((a,b)=>SHOW_HOST[b.h].w-SHOW_HOST[a.h].w+(SHOW_HOST[b.h].c===s.country?1:0)-(SHOW_HOST[a.h].c===s.country?1:0))[0];
  if(next&&showModel(s))showInvite(s,next);}
function showInvite(s,sh){const H=SHOW_HOST[sh.h],md=showModel(s),c1=standCost(sh,s,false),c2=standCost(sh,s,true),home=H.c===s.country,dl=dealerCount(s,H.c);
  s.shows[sh.id]={inv:1,md:md.id};s.showNow=sh.id;s.showAsk=s.showAsk||{};s.showAsk[sh.h]=mi(s);
  const proto=md.status==='dev';
  pushEvent({kicker:'Приглашение на выставку',title:showName(sh),deck:`${sh.venue} · ${MONTHS_N[sh.m]} ${sh.y}`,carId:md.id,
    text:`${showFacts(sh,s)?showFacts(sh,s)+'\n':''}Устроители предлагают «${s.company}» место на выставке. Малый стенд — машина на подиуме, большой — ещё и мотор в разрезе, продавцы, буклеты и пробные поездки.\n`
      +`Повезём ${proto?'прототип':'модель'} «${md.name}». На выставке ${proto?'покупатели узнают о новинке заранее':'подписывают заказы'}, о марке пишут газеты${home?'':`, а местные торговцы ищут, чьи машины продавать${dl?'':` — так можно открыть первых дилеров: ${COUNTRIES[H.c].name}`}`}.${sh.ver?'\nУсловие устроителей: машина должна своим ходом доехать из Парижа в Версаль и обратно. Ненадёжная может сломаться в пути — тогда вернут половину платы.':''}${sh.medals?'\nНа Всемирной выставке жюри раздаёт медали: чем лучше машина против соперников, тем выше шанс на золото.':''}`,
    choices:[[`Большой стенд — ${money(c2)}`,'show2'],[`Малый стенд — ${money(c1)}`,'show1'],['Не участвовать','show0']]},true);}
function showBook(s,key){const id=s.showNow;s.showNow=null;const sh=SHOWS.find(x=>x.id===id);if(!sh)return;const e=s.shows[id]||(s.shows[id]={});
  if(key==='show0'){e.skip=1;addLog(`Вы не поехали на выставку: ${showName(sh)}.`);return;}
  const big=key==='show2',cost=standCost(sh,s,big);if(s.cash<cost){e.skip=1;addLog(`Не хватило денег на стенд: ${showName(sh)}.`,'bad');pendingToasts.push('Не хватило денег на стенд');return;}
  s.cash-=cost;e.big=big?1:0;e.cost=cost;e.inv=0;addLog(`Снят ${big?'большой':'малый'} стенд: ${showName(sh)} (${money(cost)}).`,'good');pendingToasts.push('🏛 Стенд на выставке: '+SHOW_HOST[sh.h].name);}
// День выставки: проверка в пути (Париж 1898), заказы, дилеры, интерес покупателей, медали; газета об итогах
function showRun(s,sh,e){e.done=1;const H=SHOW_HOST[sh.h],c=H.c,home=c===s.country,md=s.models.find(m=>m.id===e.md)||showModel(s);if(!md)return;
  const big=!!e.big,S=clamp(classScore(md,s),0.4,1.8),proto=md.status==='dev',out=[];let rep=0,u=0,orders=0,dl=0,medal=null;
  if(sh.ver){const rel=carBase(md,0,s.y).rel,p=clamp(0.45+0.55*rel,0.5,0.97);if(Math.random()>p){const back=Math.round((e.cost||0)/2);s.cash+=back;e.fail=1;
    pushEvent({kicker:'Выставка',title:showName(sh),deck:`«${md.name}» не доехал до Версаля`,carId:md.id,text:`${showFacts(sh,s)}\nПроверочная поездка не задалась: в пути у «${md.name}» случилась поломка, и устроители не допустили машину на выставку. Половину платы за стенд — ${money(back)} — вернули.\nНадёжность — первое, что покупатели проверяют сами.`},true);
    addLog(`«${md.name}» сломался по дороге в Версаль и не попал на выставку. Вернули ${money(back)}.`,'bad');return;}
    out.push(`«${md.name}» своим ходом съездил в Версаль и обратно — машину допустили.`);}
  // репутация растёт понемногу и тем медленнее, чем она выше; интерес покупателей — на полгода
  rep=(big?1.5:0.6)*H.w/3*(s.rep<55?1:s.rep<70?0.5:0.2);if(s.showRepY===s.y)rep*=0.25;else s.showRepY=s.y;u=(big?0.16:0.08)*H.w/3*(proto?1.2:1)*clamp(S,0.6,1.4);
  if(!proto&&md.status==='prod'){const mk=s.last&&s.last.mk&&s.last.mk[c],size=mk&&mk.size?mk.size:SEGK.reduce((a,g)=>a+mkCountry(c,s,[]).segs[g].inc,0);
    orders=Math.round(0.4*Math.pow(Math.max(1,size),0.7)*(big?2:1)*S*S*(home?1:0.5)*H.w/3);orders=Math.min(orders,Math.max(8,Math.round((md.vol||md.fc||4)*3)));
    if(orders>=2&&(s.orders||[]).length<5){s.orders=s.orders||[];s.orders.push({id:'show-'+sh.id,md:md.id,n:orders,left:orders,price:md.price,due:mi(s)+5,who:'Покупатели выставки: '+SHOW_HOST[sh.h].name,start:mi(s)});
      out.push(`Подписано ${fmtN(orders)} ${plural(orders,'твёрдый заказ','твёрдых заказа','твёрдых заказов')} на «${md.name}» по ${money(md.price)} — поставка за 5 месяцев сверх плана.`);}else orders=0;}
  if(proto)out.push(`Прототип «${md.name}» собрал толпу: покупатели ждут начала продаж.`);
  if(!home){dl=big?(H.w>=2.5?2:1):(H.w>=2.5&&!dealerCount(s,c)?1:0);if(dl){s.dealers[c]=dealerCount(s,c)+dl;out.push(`Торговцы подписали договоры: ${fmtN(dl)} ${plural(dl,'новый дилер','новых дилера','новых дилеров')} — ${COUNTRIES[c].name}.`);}}
  if(sh.medals){const p=clamp((S-0.85)*1.6+(big?0.12:0),0.06,0.85),r=Math.random();medal=r<p*0.45?'gold':r<p*0.8?'silver':r<p?'bronze':null;
    if(medal){const M={gold:['золотую',4,0.08],silver:['серебряную',2.5,0.05],bronze:['бронзовую',1.5,0.03]}[medal];rep+=M[1];u+=M[2];s.medals=s.medals||[];s.medals.push({y:sh.y,name:showName(sh),kind:medal,md:md.name});out.push(`Жюри присудило «${md.name}» ${M[0]} медаль!`);}
    else out.push('Медали достались другим: жюри сочло соперников сильнее.');}
  rep=Math.round(rep*10)/10;s.rep=clamp(s.rep+rep,0,100);s.showFx=s.showFx||{};const prev=showEffect(s,c);s.showFx[c]={u:Math.min(0.35,Math.max(prev,u)+0.3*Math.min(prev,u)),t:mi(s)};s.showsDone=(s.showsDone||0)+1;
  e.res={orders,dl,rep,medal};
  const rv=showRivals(s,c);
  pushEvent({kicker:'Выставка',title:showName(sh),deck:`Стенд «${s.company}»: ${[orders?fmtN(orders)+' заказов':'',dl?'+'+dl+' дилеров':'',medal?{gold:'золото',silver:'серебро',bronze:'бронза'}[medal]:'','репутация +'+rep].filter(Boolean).join(' · ')}`,img:sh.img&&IMG[sh.img]?sh.img:'',imgCap:sh.img?`${sh.venue} — ${SHOW_HOST[sh.h].name}`:'',carId:md.id,
    text:`${showFacts(sh,s)?showFacts(sh,s)+'\n':''}${big?'Большой':'Малый'} стенд «${s.company}» — «${md.name}». ${out.join(' ')}\n${rv.length?`Рядом стенды ${rv.map(n=>'«'+n+'»').join(', ')}. `:''}Интерес покупателей к марке продержится несколько месяцев${home?'':' — и не только в этой стране'}.`},true);
  addLog(`${showName(sh)}: ${out.join(' ')}`,'good');}
function showRivals(s,c){const L=(COMPS[c]||[]).filter(cp=>cp.pk!==s.pioneer&&compAlive(cp,s)).sort((a,b)=>compVol(b,s)-compVol(a,s)).slice(0,3).map(cp=>compName(cp,s));return L;}
// Карточка на «Рынке»: ближайшие выставки и прошлые стенды
function showsCard(s){const now=mi(s),up=SHOWS.filter(sh=>showMi(sh)>=now&&showMi(sh)<=now+13&&showRelevant(sh,s)).slice(0,5),past=SHOWS.filter(sh=>s.shows&&s.shows[sh.id]&&s.shows[sh.id].done).slice(-3).reverse();
  if(!up.length&&!past.length)return '';
  const st=sh=>{const e=s.shows&&s.shows[sh.id];if(e&&e.done)return e.fail?'<span class="pill bad">не допущены</span>':'<span class="pill good">были</span>';if(e&&e.cost)return `<span class="pill good">${e.big?'большой':'малый'} стенд</span>`;if(e&&e.skip)return '<span class="pill muted">не едем</span>';return showMi(sh)-now<=1?'<span class="pill warn">приглашение</span>':`<span class="pill muted">${money(standCost(sh,s,false))}+</span>`;};
  const row=sh=>`<div class="race-item"><div class="row"><div><span class="mo">${MONTHS[sh.m]} ${sh.y} · ${COUNTRIES[SHOW_HOST[sh.h].c].name}</span><h3 style="margin-top:2px">${esc(SHOW_HOST[sh.h].name)}</h3><p class="small muted">${esc(sh.venue)}</p></div>${st(sh)}</div></div>`;
  const res=sh=>{const r=s.shows[sh.id].res;return r?`<p class="small muted" style="margin-top:-4px;padding:0 4px">${[r.orders?fmtN(r.orders)+' заказов':'',r.dl?'+'+r.dl+' дилеров':'',r.medal?{gold:'золотая медаль',silver:'серебряная медаль',bronze:'бронзовая медаль'}[r.medal]:'','репутация +'+r.rep].filter(Boolean).join(' · ')}</p>`:'';};
  return `<section class="card"><h2>Выставки</h2><p class="small muted" style="margin-top:2px">Автосалоны эпохи: стенд стоит денег, зато приносит заказы, внимание газет и покупателей, а за границей — первых дилеров. Приглашение приходит за месяц.</p>
    ${up.length?`<div style="margin-top:6px">${up.map(row).join('')}</div>`:''}${past.length?`<div class="label" style="margin-top:10px">Ваши стенды</div>${past.map(sh=>row(sh)+res(sh)).join('')}`:''}
    ${(s.medals||[]).length?`<div class="trophies" style="margin-top:8px">${s.medals.map(m=>`<span>${{gold:'🥇',silver:'🥈',bronze:'🥉'}[m.kind]} ${esc(m.name)}</span>`).join('')}</div>`:''}</section>`;}
