// 0.60, этап 1 — каркас «игра до 1960 года»: год конца партии, рекорд эпохи, продление таблиц, старые сохранения.
// node game/test/v60.js
require('./harness.js')(`
let ok=0,bad=0;const CK=(c,m)=>{if(c)ok++;else{bad++;console.log("FAIL",m);}};
const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
/* ---------- 1. год конца и рекорд эпохи ---------- */
CK(END_Y===1960&&ERA_END===END_Y&&END_RACER===1930,'партия идёт до '+END_Y+' года; путь гонщика пока до '+END_RACER);
{const E=histEra();CK(E===HIST_ERA_DATA&&E.y0===1895&&E.y1===1960,'рекорд эпохи из сборки — за 1895–'+E.y1);
  CK(E.best.scale.v>1e9&&E.best.market.v>3e10&&E.best.sport.v>0&&E.best.innov.v>0,'рекорд эпохи вырос вместе с эпохой: масштаб '+Math.round(E.best.scale.v/1e6)+' млн л. с. ('+E.best.scale.n+')');}
/* ---------- 2. 1930 год — не конец ---------- */
{seed(60);newGame('ford','us','','normal','Каркас');const s=G;s.cash=5e6;s.pending=[];s.y=1929;s.m=11;let err='';try{step();}catch(e){err=e.message;}
  CK(!err&&s.y===1930&&s.m===0&&!s.over&&!s.final,'декабрь 1929 года → январь 1930-го: партия продолжается'+(err?' — ошибка: '+err:''));
  s.pending=[];let e2='',n=0;try{for(let k=0;k<24&&!s.over;k++){s.pending=[];s.cash=Math.max(s.cash,1e6);step();n++;}}catch(e){e2=e.message;}
  CK(!e2&&n===24&&s.y===1932&&!s.over,'ещё два года идут без ошибок'+(e2?' — '+e2:''));
  CK(isFinite(prefP('people','us',s))&&prefP('people','us',{y:1930,m:0})===prefP('people','us',{y:1929,m:11})&&cpi({y:1930,m:0})===cpi({y:1929,m:0}),'этап 2: таблицы истории идут дальше 1929 года по своим данным, а 1929 год и январь 1930-го — как в 0.51');
  const mk=s.last&&s.last.mk&&s.last.mk.us;CK(mk&&mk.size>0&&isFinite(mk.size),'рынок 1931 года считается: '+Math.round(mk&&mk.size)+' машин в месяц в США');}
/* ---------- 3. итог — в январе 1960 года ---------- */
{seed(61);newGame('ford','us','','normal','Каркас');const s=G;s.cash=5e6;s.pending=[];s.y=1959;s.m=10;let err='';try{step();}catch(e){err=e.message;}
  CK(!err&&s.y===1959&&s.m===11&&!s.over,'ноябрь 1959 года: ещё не конец'+(err?' — '+err:''));s.pending=[];s.cash=Math.max(s.cash,1e6);try{step();}catch(e){err=e.message;}
  const ev=s.pending.find(p=>/Итоги эпохи/.test(p.title||''));
  CK(!err&&s.y===1960&&s.over&&s.final&&ev&&/встречает 1960 год/.test(ev.deck||''),'январь 1960 года: итог эпохи, «встречает 1960 год»'+(err?' — '+err:''));
  CK(s.hist.cash.length<=(END_Y-1895)*12,'история графиков — до '+(END_Y-1895)*12+' месяцев');}
/* ---------- 4. сохранение, где эпоха кончилась в 1930 году, продолжается ---------- */
{seed(62);newGame('ford','us','','normal','Каркас');const s=G;s.y=1930;s.m=0;s.cash=2e6;s.over=true;s.final={place:3,total:812,title:'Великая компания'};s.fameSaved=1;
  s.pending=[{title:'Итоги эпохи: Великая компания',deck:'x',text:'y',paper:true,choices:[['Сравнить с историей','final']]},{title:'Заметка',text:'z',choices:[['Дальше','ok']]}];
  const x=JSON.parse(JSON.stringify(s)),m=migrate(x);
  CK(m.over===false&&m.final30&&m.final30.total===812&&!m.final&&m.fameSaved===0&&m.cont60===1930,'итог 1930 года сохранён отдельно, партия открыта снова');
  CK(m.pending.length===1&&m.pending[0].title==='Заметка','окно «Итоги эпохи» убрано, прочие остались');
  G=m;let err='';try{G.pending=[];step();}catch(e){err=e.message;}CK(!err&&!G.over&&G.y===1930&&G.m===1,'после загрузки ход идёт дальше: февраль 1930 года'+(err?' — '+err:''));
  const b=JSON.parse(JSON.stringify(s));b.cash=-9e7;CK(migrate(b).over===true,'разорившаяся фирма не оживает');
  const r=JSON.parse(JSON.stringify(s));r.mode='racer';CK(migrate(r).over===true,'законченная карьера гонщика остаётся законченной');
  const so=JSON.parse(JSON.stringify(s));so.soldTo={co:'X',mine:1e6};CK(migrate(so).over===true,'проданная фирма остаётся проданной');
  const y=JSON.parse(JSON.stringify(s));y.y=1921;CK(migrate(y).over===true,'партия, законченная раньше 1930 года, не трогается');}
/* ---------- 5. события без привязки к эпохе идут всю партию ---------- */
{const by=id=>CHANCE.find(e=>e.id===id);CK(by('press').y1===END_Y-1&&by('steel').y1===END_Y-1&&by('maharaja').y1===1929&&by('royal').y1===1914,'«Восторженная статья» — до 1959 года; «Заказ махараджи» и «Королевский двор» — в своих годах');}
/* ================= этап 2: рынки и экономика 1930–1960 ================= */
/* ---------- 6. таблицы рынков: каждый год до 1960-го, значение года действует весь год ---------- */
{const C=Object.keys(COUNTRIES);let full=true;for(const T of [MKT,MKT_TRUCK,MKT_MOTO])for(const c of C)for(let y=1930;y<=1960;y++)if(!(T[c][y]>0))full=false;
  CK(full,'легковой, грузовой и мото-рынок шести стран: есть каждый год с 1930 по 1960');
  CK(mktAt(MKT.us,1945.99)===69500&&mktAt(MKT.us,1946)===2041200&&mktAt(MKT.us,1929.5)===4455200,'рынок читается по годам: декабрь 1945-го в США — 69,5 тыс. машин в год, январь 1946-го — 2,04 млн; 1929 год ровный, как в 0.51');
  CK(Math.abs(mktAt(MKT.us,1921.5)-tabAt(MKT.us,1921.5,true))<1e-6,'до 1929 года таблицы читаются как раньше');
  CK(MKT.us[1933]===1526000&&MKT.us[1955]===7466000&&MKT_TRUCK.us[1950]===1337100,'США по источнику: 1933 — 1,526 млн легковых, 1955 — 7,466 млн, грузовиков 1950 — 1,337 млн');
  CK(MKT.de[1932]===38000&&MKT.de[1950]===150000&&MKT.de[1960]===914000&&MKT.uk[1946]===130000&&MKT.fr[1960]===639000&&MKT.it[1960]===381000&&MKT.ru[1950]===64600,'Европа и СССР по источникам: Германия 1932, 1950, 1960; Британия 1946; Франция и Италия 1960; СССР 1950');
  const q=(y,m)=>({y,m,country:'us'});CK(segAnnual('us','people',q(1943,5))<200&&segAnnual('uk','people',q(1942,5))<2000,'в войну гражданского рынка нет: США 1943, Британия 1942');}
/* ---------- 7. цены, зарплаты, доходы ---------- */
{const q=(y,m,c)=>({y,m,country:c||'us'});
  CK(Math.abs(cpi(q(1933,6))-1.29)<0.005&&Math.abs(cpi(q(1950,6))-2.41)<0.005&&Math.abs(cpi(q(1929,6))-1.71)<1e-9,'индекс цен: 1933 — 1,29, 1950 — 2,41 (1913 = 1); 1929 год не тронут');
  CK(Math.round(wageBase(q(1950,6),'us'))===278&&Math.round(wageBase(q(1933,6),'us'))===79&&wageBase(q(1929,6),'us')===118,'зарплата рабочего в США: 1933 — $79 в месяц, 1950 — $278');
  CK(Math.round(tabAt(INC.us,1933.5))===1282&&Math.round(tabAt(INC.us,1960.5))===5867&&tabAt(INC.de,1946.5)<tabAt(INC.de,1938.5)*0.7,'доход семьи: США 1933 — $1282, 1960 — $5867; Германия 1946 года — меньше 70 % довоенного');
  CK(prefP('people','us',q(1955,0))===1750&&Math.abs(prefP('people','uk',q(1955,0))-1750*1.5*0.4)<1&&prefP('people','fr',q(1929,6))===560*1.5,'цена народной машины: США 1955 — $1750, Британия — $1050 (малолитражка); 1929 год не тронут');
  CK(prefP('truck','us',q(1950,0))===1990&&tabAt(HH.us,1950)===43.6&&tabAt(HH.de,1946)<tabAt(HH.de,1944)*0.75,'грузовик США 1950 — $1990; семей в США 1950 — 43,6 млн; Германия после 1945 года — западные зоны');}
/* ---------- 8. война и кризисы ---------- */
{CK(isWar(1941,11,'us')&&!isWar(1941,10,'us')&&isWar(1945,7,'us')&&!isWar(1945,8,'us'),'США воюют с декабря 1941-го по август 1945-го');
  CK(isWar(1939,8,'uk')&&!isWar(1939,7,'uk')&&isWar(1939,8,'fr')&&isWar(1939,8,'de')&&isWar(1945,4,'de')&&!isWar(1945,5,'de'),'Британия, Франция, Германия — с сентября 1939-го; в Европе — до мая 1945-го');
  CK(isWar(1941,5,'ru')&&!isWar(1941,4,'ru')&&isWar(1940,5,'it')&&!isWar(1940,4,'it')&&!isWar(1939,8,'us')&&!isWar(1939,8,'ru'),'СССР — с июня 1941-го, Италия — с июня 1940-го');
  CK(isWar(1917,5,'us')&&isWar(1915,0,'fr')&&!isWar(1925,0,'fr')&&!isWar(1935,0,'de')&&!isWar(1950,0,'us'),'Первая мировая на месте; в мирные годы войны нет');
  const e=(y,m,c)=>econ(y,m,c);
  CK(e(1932,5,'us').label==='Великая депрессия'&&e(1932,5,'us').f===0.6&&e(1933,1,'us').label==='Банковский кризис'&&e(1929,9,'us').label==='Биржевой крах'&&e(1929,9,'us').f===0.55&&e(1926,5,'us').label==='Ревущие двадцатые','США: крах 1929-го, депрессия, банковский кризис 1933-го; двадцатые не тронуты');
  CK(e(1947,5,'de').label==='Разруха и оккупация'&&e(1955,5,'de').label==='Экономическое чудо'&&e(1942,5,'fr').label==='Оккупация'&&e(1942,5,'fr').war&&e(1957,0,'uk').label.startsWith('Суэцкий кризис')&&e(1942,5,'ru').label==='Великая Отечественная война','Германия, Франция, Британия, СССР: подписи 1940-х и 1950-х');
  let fin=true;for(const c of Object.keys(COUNTRIES))for(let y=1930;y<1960;y++)for(let m=0;m<12;m++){const x=e(y,m,c);if(!(x.f>0&&x.f<=1)||!x.label||!x.tone)fin=false;}CK(fin,'у каждой страны в каждый месяц 1930–1959 есть состояние экономики');
  const s={y:1933,m:1,country:'us',rep:50,diff:'normal'};G=s;CK(creditState(s).closed&&creditState(s).k==='panic','февраль 1933-го, США: банки закрыты');
  s.y=1931;s.m=7;s.country='de';CK(creditState(s).closed,'август 1931-го, Германия: банковский кризис');s.y=1947;CK(creditState(s).closed,'Германия 1947 года: кредита нет');s.y=1950;CK(!creditState(s).closed&&creditState(s).k==='ok','Германия 1950 года: кредит открыт');
  s.country='us';s.y=1943;s.m=5;CK(creditState(s).k==='war','США 1943 года: военный кредит');let rOk=true;for(let y=1930;y<1960;y++){s.y=y;const r=loanRate(s);if(!(r>=0.03&&r<=0.17))rOk=false;}CK(rOk,'ставка кредита 1930–1959 — в пределах 3–17 %');
  s.y=1932;s.m=11;const d32=djia(s);s.y=1954;s.m=11;const d54=djia(s);s.y=1932;s.m=6;const lo=djia(s);CK(Math.abs(d32-59.93)<3&&Math.abs(d54-404.39)<8&&lo<50,'индекс Доу-Джонса: конец 1932-го — около 60, июль 1932-го — ниже 50, конец 1954-го — около 404');}
/* ---------- 9. авиарынок и мотоциклы ---------- */
{CK(tabAt(AIR_MKT.us.mil,1944)===96318&&tabAt(AIR_MKT.de.mil,1950)===0&&tabAt(AIR_MKT.uk.mil,1940)===15049&&tabAt(AIR_MKT.us.priv,1943)===0,'авиарынок: США 1944 — 96 318 военных самолётов, Британия 1940 — 15 049; Германия 1950 — запрет; частных самолётов в войну не продают');
  CK(MKT_MOTO.de[1953]===349000&&MKT_MOTO.de[1932]===36700&&motoAnnual('de','moto',{y:1953,m:5})>250000,'мотоциклы Германии: 1932 — 36,7 тыс., 1953 — 349 тыс.');
  CK(tabAt(AIR_MKT.us.mil,1929)===700&&tabAt(AIR_MKT.fr.priv,1929.5)===600&&airCivK({y:1931,m:0},'us')===0.55&&airCivK({y:1936,m:0},'us')===1,'авиарынок 1929 года не тронут; депрессия давит гражданский спрос до 1935 года');}
/* ---------- 10. мир без игрока совпадает с историей и после 1930 года ---------- */
{DIFFS.calib={...DIFFS.normal,comp:1};let worst=0,wl='',n=0,over=0;
  for(const c of Object.keys(COUNTRIES)){const s={y:1895,m:0,country:'none',pioneer:'none',models:[],dealers:{},fleet:{[c]:FLEET0[c]},pw:{},rep:50,diff:'calib'};G=s;
    for(let y=1895;y<END_Y;y++){const sold={},tgt={};ALLSEG.forEach(g=>{sold[g]=0;tgt[g]=0;});
      const sf=[...Array(12).keys()].reduce((a,mm)=>a+SEASON[mm]*econ(y,mm,c).f,0);
      for(let m=0;m<12;m++){s.y=y;s.m=m;const fm=SEASON[m]*econ(y,m,c).f*12/sf,R=mkCountry(c,s,[]);ALLSEG.forEach(g=>{sold[g]+=R.segs[g].inc;tgt[g]+=segAnnual(c,g,s)/12*fm;});
        const cars=CARSEG.reduce((a,g)=>a+R.segs[g].inc,0);s.fleet[c]+=cars-s.fleet[c]/(12*tabAt(CAR_LIFE,yf(s)));}
      if(y>=1930)for(const g of ALLSEG){if(!(tgt[g]>=2000))continue;n++;const d=Math.abs(sold[g]/tgt[g]-1);if(d>0.05)over++;if(d>worst){worst=d;wl=c+' '+y+' '+g;}}}}
  console.log('   мир без игрока, 1930–1959: '+n+' пар «страна–год–класс», вне допуска 5 % — '+over+', худшая — '+wl+', '+(worst*100).toFixed(1)+' %');
  CK(n>900&&over===0,'без игрока продажи 1930–1959 годов по странам и классам совпадают с историей в пределах 5 %: проверено '+n+' пар «страна–год–класс», вне допуска '+over+', худшая '+wl+' '+(worst*100).toFixed(1)+' %');}
/* ================= этап 3: техника 1930–1960 ================= */
/* ---------- 11. новые детали ---------- */
{const NEW=ALL_PARTS().filter(p=>p.y>=1930&&p.y<1960&&/^[egkcbw][0-9]+$/.test(p.id)),E=id=>byId(ENGINES,id);
  CK(NEW.length===41&&NEW.every(p=>p.note&&p.c>0&&p.q>0&&p.name),'деталей 1930–1959 годов — 41 (37 первой части этапа и четыре доводки): у каждой год, цена, сложность и справка');
  CK(['rd','ps','pw'].every(k=>EQ_BY[k]&&EQ_BY[k].hist[0]>=1930&&EQ_BY[k].note)&&EQ_BY.rd.hist[0]===1930&&EQ_BY.ps.hist[0]===1951,'оснащение 1930–1960: радиоприёмник (1930), усилитель руля и электрические стеклоподъёмники (1951)');
  CK(E('e16').y===1932&&E('e16').hp===65&&E('e15').y===1930&&E('e15').hp===185&&E('e18').y===1936&&E('e18').diesel&&E('e23').y===1949&&E('e23').hp===135&&E('e25').y===1951&&E('e26').y===1955,'моторы по источникам: Ford V-8 (1932, 65 л.с.), Cadillac V-16 (1930), дизель Mercedes-Benz (1936), Oldsmobile Rocket (1949, 135 л.с.), Chrysler FirePower (1951), Chevrolet (1955)');
  CK(byId(GEARBOX,'g8').y===1939&&byId(GEARBOX,'g9').y===1948&&byId(BRAKES,'k7').y===1953&&byId(CHASSIS,'c8').y===1934&&byId(CHASSIS,'c12').y===1955&&byId(CHASSIS,'c13').y===1959&&byId(TYRES,'w12').y===1948&&byId(BODIES,'b32').y===1948,'автомат (1939), гидротрансформатор (1948), диски (1953), несущий кузов (1934), гидропневматика (1955), поперечный мотор (1959), радиальная шина и понтонный кузов (1948)');
  const s0={y:1929,m:0,country:'us',rd:{lvl:9},own:{},pw:{}};let none=true;try{none=!unlockedP(ENGINES,s0).some(p=>p.y>=1930);}catch(e){}CK(none,'в 1929 году деталей тридцатых в каталоге нет');}
/* ---------- 12. эталоны соперников и новые виды ---------- */
{const bad=[];for(const k in RIVAL_CAR)RIVAL_CAR[k].forEach(r=>{if(r[0]<1930)return;for(const pk of PART_KEYS){const x=byId(PART_CATS.find(c=>c.k===pk).arr(),r[2][pk]);if(!x||x.y>r[0])bad.push(k+' '+r[0]+' '+pk);}if(overpower({...r[2],t:'t0',ref:1}))bad.push(k+' '+r[0]+' мотор сильнее рамы');});
  CK(!bad.length,'эталоны соперников после 1929 года: детали существуют в свой год, мотор по силам раме'+(bad.length?' — '+bad.join('; '):''));
  CK(rivalCar('people',1933)[1]==='Ford V-8'&&rivalCar('people',1956)[1]==='Chevrolet 1955 года'&&rivalCar('lux',1950)[1]==='Cadillac 1949 года'&&rivalCar('sport',1949)[1]==='Jaguar XK120'&&rivalCar('people',1929)[1].startsWith('Ford Model A'),'эталон народной машины: 1933 — Ford V-8, 1956 — Chevrolet; люкс 1950 — Cadillac; спорт 1949 — Jaguar XK120; 1929 год не тронут');
  CK(Object.keys(RIVAL_CAR).every(k=>k==='moto'||k==='moside'||RIVAL_CAR[k][RIVAL_CAR[k].length-1][0]>=1941),'у каждого вида техники есть эталон сороковых или пятидесятых');
  const NK=['jeep','mtank','offroad','minibus'];CK(NK.every(k=>BODIES.some(b=>b.kind===k)&&RIVAL_CAR[k]&&CHAR_W[k]&&KIND_NAME[k]&&kindSeg(k)==='truck'&&TUSE.some(u=>TRUCK_USE[u].kinds.includes(k))&&Math.abs(Object.values(CHAR_W[k]).reduce((a,b)=>a+b,0)-1)<1e-9),'четыре новых вида: армейский вездеход, средний танк, вездеход, микроавтобус — кузов, эталон, веса черт, работа');
  const w={y:1943,m:5,country:'us',models:[],dealers:{},pw:{},rep:50,diff:'normal'},p={y:1935,m:5,country:'us',models:[],dealers:{},pw:{},rep:50,diff:'normal'};G=w;
  const j=jobOwnPool('jeep','us',w)*12,t=jobOwnPool('mtank','us',w)*12;CK(j>120000&&j<220000&&t>15000&&t<40000&&jobOwnPool('jeep','us',p)===0&&jobOwnPool('mtank','us',p)===0,'армия США, 1943: вездеходов около '+Math.round(j/1000)+' тыс. в год, средних танков около '+Math.round(t/1000)+' тыс.; в 1935 году таких закупок нет');
  const q={y:1955,m:5,country:'us',models:[],dealers:{},pw:{},rep:50,diff:'normal'};G=q;const u=truckUseSh('us',q),civ=TUSE.filter(x=>!TRUCK_USE[x].own).reduce((a,x)=>a+(u[x]||0),0);
  CK(u.offroad>0.01&&u.minibus>0.01&&Math.abs(civ-1)<1e-9,'1955 год: вездеходу и микроавтобусу есть работа, а доли рынка коммерческих машин в сумме — единица');
  const o={y:1925,m:5,country:'us',models:[],dealers:{},pw:{},rep:50,diff:'normal'};G=o;const u25=truckUseSh('us',o);CK(!(u25.offroad>0)&&!(u25.minibus>0),'в 1925 году этих работ нет');}
/* ---------- 13. конструктор не показывает то, до чего по истории далеко ---------- */
{seed(63);newGame('ford','us','','normal','Техника');const s=G;s.pending=[];let html='';const os=openSheet;openSheet=h=>{html=h;};
  s.y=1925;s.m=5;openKindStep('bus');const n25=(html.match(/class="krow[ "]/g)||[]).length;s.y=1940;openKindStep('bus');const n40=(html.match(/class="krow[ "]/g)||[]).length,l40=(html.match(/data-lock="1"/g)||[]).length;
  s.y=1951;openKindStep('bus');const l51=(html.match(/data-lock="1"/g)||[]).length;s.y=1950;openKindStep('cargo');const off=/Вездеход/.test(html);openSheet=os;
  CK(n25===3&&n40===4&&l40===1&&l51===0&&off,'автобусы: в 1925 году три назначения, в 1940-м видна серая строка микроавтобуса («в истории — с 1950 года»), в 1951-м он открыт; вездеход — среди грузовых');}
/* ---------- 13б. этап 3, доводка: у кузовов и видов 1930–1960 свой облик — рисунок и трёхмерная модель ---------- */
{newGame('custom','us','Тест','normal','Первая');const s=G;s.y=1955;const d=autoDesign('people',s),ids=['b30','b31','b32','b33','b34','b35','b36','b37','b38','b39','b40','b41'];
  const svg={},old=carSVG({...d,b:'b5',paint:'#7a2230'});let bad1=[];ids.forEach(b=>{const h=carSVG({...d,b,paint:'#7a2230',name:'М'});svg[b]=h;if(!/^<svg/.test(h)||h===old||/NaN|undefined/.test(h))bad1.push(b);});
  CK(!bad1.length&&new Set(Object.values(svg)).size===ids.length,'у каждого из двенадцати кузовов 1934–1959 годов свой рисунок'+(bad1.length?': нет у '+bad1.join(', '):''));
  CK(carSVG({...d,b:'b5',paint:'#7a2230'})===old&&!carSVG60({...d,b:'b5'}),'рисунки прежних кузовов не тронуты');
  const sz={},lo={};let bad3=[];ids.forEach(b=>{try{const md={...d,b,paint:'#7a2230'},S=modelSpec(md,0,1955,{}),k=workKind60(S);const M=carModel(Object.assign({},S,{lod:'hi'})),M0=carModel(Object.assign({},S,{lod:'lo'}));sz[b]=M.F.length;lo[b]=M0.F.length;
      if(!k||!(M.F.length>200)||!(M0.F.length>40)||M0.F.length>=M.F.length||M.wheels.length!==4||!(M.len[1]-M.len[0]>2.5)||!M.eye)bad3.push(b+':'+k+':'+M.F.length+'/'+M0.F.length+':'+M.wheels.length);}catch(e){bad3.push(b+':'+String(e).slice(0,60));}});
  CK(!bad3.length,'трёхмерная модель есть у каждого: '+ids.map(b=>b+' '+sz[b]).join(', ')+(bad3.length?' — отказ: '+bad3.join('; '):''));
  const plain=carModel(Object.assign({},modelSpec({...d,b:'b5',paint:'#7a2230'},0,1955,{}),{lod:'hi'})).F.length;CK(new Set(Object.values(sz)).size>=11&&Object.values(sz).every(v=>v!==plain),'модели новых кузовов не совпадают с седаном двадцатых и между собой');
  CK(workKind60({style:'gp1925',b:'b32'})===''&&workKind60({style:'moto',b:'b32'})===''&&workKind60({style:'sedan',b:'b5'})==='','гоночные облики и прежние кузова идут по-старому');}

/* ---------- 14. правки автора 23 ноября (отзыв на 0.51): девять пунктов ---------- */
{seed(71);const near=(a,b,e)=>Math.abs(a-b)<=(e===undefined?1e-6:e);
  // 6) цена опережения — без прогрессии
  CK(near(aheadCostK(1),1.6)&&near(aheadCostK(3),2.8)&&near(aheadCostK(10),7)&&near(aheadTimeK(10),5)&&aheadCostK(10)<Math.pow(1.6,10)/15,'цена опережения: год ×1,6, три ×2,8, десять ×7 (было ×110); срок за десять лет ×5 (было ×29)');
  newGame('custom','us','Тест','normal','Первая');let s=G;worldInit(s);s.pending=[];s.y=1928;s.m=5;s.cash=5e8;s.rd.lvl=8;s.rd.projs=[];s.xp={eng:60,alloy:40,mass:40};try{ownEnsure(s);}catch(_){}
  // 5) авиамотор можно дорабатывать
  {const P=aePreview(s,{type:'radial',goal:'power',gl:1,name:'М'});aeDone(s,{...P.pj,name:'Мотор'});s.pending=[];const o=s.aeng[0],was={hp:o.hp,kg:o.kg,id:o.id,name:o.name,c:o.c};
    CK(/data-act="aeRefine"/.test(ownItemHTML(s,o)),'у своего авиамотора есть кнопка «Доработать»');
    const R=aePreview(s,{into:o.id,goal:'power',gl:2});CK(R&&!R.why&&R.x.hp>o.hp&&R.cost<P.cost&&R.need<P.need&&R.pj.sp.into===o.id,'доводка «мощнее»: '+o.hp+' → '+R.x.hp+' л.с., проект дешевле и короче нового ('+R.cost+' против '+P.cost+')');
    CK(aeStart(s,{into:o.id,goal:'power',gl:2})&&aeIntoBusy(s,o.id)&&/уже дорабатывают/.test(aePreview(s,{into:o.id,goal:'light',gl:1}).why),'проект доводки занят в КБ; второй раз тот же мотор не взять');
    aeDone(s,rdActive(s).find(p=>p.kind==='aeng'));s.rd.projs=[];CK(s.aeng.length===1&&o.id===was.id&&o.name===was.name&&o.hp>was.hp&&o.rev===2&&o.revY===1928,'после доводки мотор тот же (имя, номер), числа новые: '+was.hp+' → '+o.hp+' л.с., доводка №1');
    let n=0,stop='';for(let i=0;i<40;i++){const Q=aePreview(s,{into:o.id,goal:'power',gl:3});if(Q.why){stop=Q.why;break;}aeRefineDone(s,Q.pj);n++;}CK(n>=2&&n<40&&/Предел эпохи/.test(stop),'доводить без конца нельзя: после '+n+' шагов — предел эпохи');
    let m=0;for(let i=0;i<10;i++){const Q=aePreview(s,{into:o.id,goal:'cheap',gl:3});if(Q.why)break;aeRefineDone(s,Q.pj);m++;}CK(o.c>=o.c0*0.5-10&&/Дешевле этот мотор уже не сделать/.test(aePreview(s,{into:o.id,goal:'cheap',gl:1}).why),'«дешевле» не опускает цену ниже половины первого образца');}
  // 8) аэроплан можно убрать из моделей в любом статусе
  {const t=tNow(s);airInit(s);const mk=(st,nm)=>{const md=airNewModel(s,{...airRefMd('sport',t),role:'sport',name:nm},{status:st});md.status=st;md.flown=1;return md;};
    const r=mk('race','Гоночный'),d=mk('dev','Чертёж'),pr=mk('prod','Серийный'),sl=mk('sale','Остаток');sl.stock=4;s.air.proto=[d.id];
    CK(/data-act="airDrop"/.test(airModelHTML(r,s))&&/Списать гоночный аэроплан/.test(airModelHTML(r,s))&&/data-act="airDrop"/.test(airModelHTML(d,s))&&/data-act="airDrop"/.test(airModelHTML(sl,s)),'гоночный, чертёж и остаток — с кнопкой «убрать»');
    CK(!/data-act="airDrop"/.test(airModelHTML(pr,s))&&/data-act="airOff"/.test(airModelHTML(pr,s)),'у серийного — прежняя «Снять с производства»');
    CK(airDrop(s,r)&&r.status==='off'&&airDrop(s,d)&&d.status==='off'&&!s.air.proto.includes(d.id)&&airDrop(s,sl)&&sl.stock===0&&!airDrop(s,pr)&&pr.status==='prod','списаны: гоночный, чертёж, остаток; серийный этой кнопкой не снять');}
  // 4) помощник: старый вызов не висит; авиагонка — только когда на неё можно попасть
  {const rc=RACES.find(r=>r.y===1927&&r.m>=6&&!r.match);s.chal={type:'race',acc:1,rk:rc.key,mq:'Miller',stake:13300};const c0=s.cash;s.y=1928;s.m=5;chalMonth(s);
    CK(s.chal===null&&s.cash===c0,'вызов на гонке '+rc.y+' года, зависший со старого сохранения, снят без денег');
    const rc2=RACES.find(r=>r.y===1928&&r.m===4&&!r.match);s.chal={type:'race',acc:1,rk:rc2.key,mq:'Miller',stake:13300};chalMonth(s);CK(s.chal===null&&s.cash===c0-13300,'гонка прошла месяц назад без вашей машины — пари проиграно неявкой');
    const rc3=RACES.find(r=>r.y===1928&&r.m===6&&!r.match);s.chal={type:'race',acc:1,rk:rc3.key,mq:'Miller',stake:13300};chalMonth(s);CK(s.chal&&s.chal.rk===rc3.key,'гонка ещё впереди — вызов на месте');s.chal=null;
    // авиагонка в сентябре 1928-го: в июне совета нет, в августе — «запись открыта» с кнопкой к состязанию
    s.air.lv=Math.max(1,s.air.lv||0);const fl=airNewModel(s,{...airRefMd('sport',tNow(s)),role:'sport',name:'Летун'},{status:'race'});fl.status='race';fl.flown=1;
    const evs=m0=>{s.m=m0;return airAdvice(s).filter(t=>t[0]==='🏆');};const jun=evs(5),soon=airEvSoon(s).filter(e=>airEvStatus(s,e)==='soon');
    CK(soon.length>0&&jun.every(t=>t[3]==='airEv'&&airEvStatus(s,airEvByKey(s,t[4]))==='open'),'июнь 1928: состязание впереди ('+soon.map(e=>e.name).join(', ')+') — совета о нём нет, пока запись закрыта');
    let got=null;for(let m0=5;m0<12&&!got;m0++){const L=evs(m0).filter(t=>t[3]==='airEv');if(L.length)got={m0,t:L[0]};}
    CK(got&&airEvStatus(s,airEvByKey(s,got.t[4]))==='open'&&/запись открыта/.test(got.t[1])&&got.t[2]==='К состязанию','когда запись открылась ('+(got?MONTHS[got.m0]:'—')+'), совет ведёт прямо в состязание: '+(got?got.t[1]:''));
    airDrop(s,fl);s.air.models.forEach(m=>{if(m.status!=='off'&&m.status!=='prod')m.status='off';});s.air.models.forEach(m=>{m.flown=0;});s.m=got?got.m0:7;const no=airAdvice(s).filter(t=>t[0]==='🏆');
    CK(no.length===1&&no[0][3]==='airDesign'&&/лететь не на чем/.test(no[0][1]),'лететь не на чем — совет зовёт в конструктор, а не на гонку');s.m=5;}
  // 9) линий под модели нет, штрафа за число моделей нет
  {s.tech=s.tech||{};s.tech.line=2;const d=autoDesign('people',s),mk=i=>({...d,id:500+i,name:'М'+i,status:'prod',launched:mi(s)-20,stock:0,made:900,vol:100,fc:100,lastMade:100,plan:'auto',price:d.price||500});
    s.models=[mk(1)];const h1=hoursPerCar(s.models[0],s);s.models=[mk(1),mk(2),mk(3),mk(4)];CK(near(hoursPerCar(s.models[0],s),h1,1e-9),'четыре модели на конвейере — те же часы на машину, что у одной');
    s.xl=[{id:1,md:501,cap:40,val:1e4,at:0}];const c0=s.cap,r={};linesMonth(s,r);CK(!s.xl&&s.cap===c0+40,'линия из сохранения 0.51 вернула заводу 40 мест');
    tab='plant';const h=typeof vPlant==='function'?vPlant():'';CK(!/Свои линии под модели|Где собирать/.test(h+String(xlFold)),'в «Заводе» нет блока линий');s.models=[];}
  // 3) навигация
  CK(Object.keys(SUB51).length===1&&SUB51.log.bar.length===2&&!/seg3/.test(mk9BarHTML(s)),'подразделы: только у «Империи» (два); в «Рынке» — одна полоса стран');
  // 2) испытания ведомств: итог даёт продажи и заказ; помощник отправляет сам; взнос с потолком
  {s.y=1928;s.m=5;s.country='us';const d=autoDesign('tractor',s),tr={...d,id:700,name:'Трактор',status:'prod',launched:mi(s)-20,stock:0,made:900,vol:100,fc:100,lastMade:100,lastSold:100,plan:'auto',price:d.price||800};s.models=[tr];s.orders=[];s.dealers=s.dealers||{};s.dealers.us=Math.max(5,s.dealers.us||0);
    s.world.my.r12=1.7e9;CK(trFee(s)===Math.round(TR_FEE_MAX*cpi(s)/50)*50&&trFee(s)<50000,'взнос за испытания у фирмы с оборотом $1,7 млрд — '+money(trFee(s))+' (было $346 тыс.)');
    CK(trBonus('neb',1.65)>trBonus('neb',1.05)&&near(trBonus('neb',1.65),0.35)&&trBonus('neb',0.7)<0&&trBonus('mil',1.2)>0&&trBonus('mil',0.9)===0,'прибавка к привлекательности растёт с итогом: трактор 105 → +'+trBonus('neb',1.05).toFixed(2)+', 165 → +0,35; принятая армией с итогом 120 → +'+trBonus('mil',1.2).toFixed(2));
    const A=[];trialAdvice(s,(p,i,t,b,f,tb)=>A.push({p,t,b}));CK(A.length===1&&A[0].p>=60&&/Прикидка итога/.test(A[0].t)&&/На станцию/.test(A[0].b),'совет об испытаниях — среди главных дел (важность '+(A[0]&&A[0].p)+') и с прикидкой итога');
    const msg=[];trialHelper(s,msg);CK(msg.length===1&&/на станцию испытаний/.test(msg[0])&&s.trials.q.length===1,'помощник управляющего сам отправил трактор на станцию: '+msg[0]);
    const q=s.trials.q[0];s.trials.q=[];const real=trScore;trScore=()=>1.25;let O=null;for(let i=0;i<20&&!(O&&O.o);i++){seed(100+i);tr.cert={};s.orders=[];trTestDone(s,q);const C=trCertS(tr,'us','neb',s);O={sc:C?C.sc:0,o:s.orders[0]||null};}
    CK(O&&O.sc>=1&&O.o&&O.o.n>=10&&O.o.md===700&&/кооперативы/i.test(O.o.who)&&O.o.price>0,'хороший протокол ('+(O?Math.round(O.sc*100):'—')+') принёс заказ кооперативов: '+(O&&O.o?O.o.n:0)+' машин по '+(O&&O.o?money(O.o.price):''));
    CK(/спрос фермеров выше/.test(trialModelLine(tr,s)),'в карточке модели видно, что даёт протокол: '+trialModelLine(tr,s).replace(/<[^>]+>/g,' ').replace(/ +/g,' ').trim().slice(0,90));
    {const P=s.pending.filter(e=>/Небраск/.test(e.title||'')).slice(-1)[0];CK(P&&/Кооперативы уже прислали заказ/.test(P.text)&&/спрос фермеров выше/.test(P.text),'газета об итоге говорит и о прибавке спроса, и о заказе');}
    tr.cert={};s.orders=[];trScore=()=>0.7;trTestDone(s,q);CK(!s.orders.length&&trCertS(tr,'us','neb',s).sc<0.8,'слабый протокол заказа не даёт');trScore=real;s.pending=[];s.models=[];}
  // 7) карта трассы в настройке гонки
  {const rc=RACES.find(r=>r.id==='targa'&&r.y===1928)||RACES.find(r=>r.id==='targa');SMAP=null;const h1=raceSetupMapHTML(s,rc),h2=raceSetupMapHTML(s,rc);
    CK(/Карта трассы/.test(h2)&&(h2.match(/<svg class="smap"/g)||[]).length===2&&/СТАРТ/.test(h2)&&/ФИНИШ/.test(h2)&&/крутых поворотов <b>[0-9]+<[/]b>/.test(h2)&&/профиль: перепад/.test(h2),'в настройке гонки — схема трассы со стартом, финишем, поворотами и профилем высот');
    CK(SMAP&&SMAP.key===rc.key&&raceSetupMapHTML(s,rc)===h2,'схема строится один раз и берётся из памяти при каждой перерисовке окна');
    CK(String(renderRaceSetup).indexOf('paperReelHTML')<0&&String(renderRaceSetup).indexOf('raceSetupMapHTML')>0,'ролика хроники в настройке гонки больше нет — на его месте карта');}
  // 1) Монако: проверка геометрии — в v51 (раздел 26); здесь — стенка между встречными проходами и коридор у неё
  {const TD='/home/claude/avtoimperia/docs/terrain/';require(TD+'monaco.js');const r0=RACES.find(r=>r.id==='monaco'),T=buildTrack(r0,40),n=T.n,W=T.W;let mn=1e9;
    for(let i=0;i<n;i+=2)for(let j=i+30;j<n;j+=2){if(n-(j-i)<30)continue;const d=Math.hypot(T.pts[i][0]-T.pts[j][0],T.pts[i][2]-T.pts[j][2]);if(d<mn)mn=d;}
    const walls=T.col.filter(o=>o.median),L=branchLims(T);let open=0;for(let i=0;i<24;i++)if(L[i*2+1]<7&&!walls.some(o=>Math.hypot(o.x-(T.pts[i][0]-T.N[i][0]*(W/2+L[i*2+1])),o.z-(T.pts[i][2]-T.N[i][1]*(W/2+L[i*2+1])))<7))open++;
    CK(T.real&&mn>=12&&walls.length>=12&&open===0,'Монако: встречные проходы не ближе '+mn.toFixed(1)+' м и нигде не пересекаются; между ними '+walls.length+' звеньев каменной стенки, у старта разрывов нет');
    CK(T.tunnels.length===1&&T.startIdx===0&&Math.abs(T.tunnels[0].i0-424)<=6,'Монако: старт на проходе к Сент-Девот, тоннель на прежнем месте ('+T.tunnels[0].i0+'–'+T.tunnels[0].i1+')');}
}
/* ---------- 15. этап 4: соперники 1930–1960 ---------- */
{seed(150);newGame('ford','us','','normal','Соперники');const s=G,at=(y,m)=>{s.y=y;s.m=m||0;return s;},cpOf=(c,n)=>COMPS[c].find(x=>x.n===n),V=(c,n,y)=>compVol(cpOf(c,n),at(y));
  CK(COMPS.us[6].n==='Ford'&&COMPS.us[14].n==='Chevrolet'&&COMPS.de[2].n==='Opel'&&COMPS.uk[9].n==='Morris'&&COMPS.fr[8].n==='Citroën'&&COMPS.it[0].n==='FIAT','новые марки дописаны в конец списков: номера прежних марок не сдвинулись');
  CK(Object.keys(COMPS).every(c=>COMPS[c].every(cp=>cp.c60===c)),'у каждой марки записана её страна');
  CK(['Pontiac','Mercury','Lincoln','Kaiser-Frazer'].every(n=>cpOf('us',n))&&cpOf('uk','Standard')&&cpOf('fr','Simca')&&cpOf('de','Volkswagen')&&cpOf('de','DKW / Auto Union'),'новые марки 1930–1960 в списке соперников');
  // выпуск до 1930 года не тронут; после — доля × рынок
  CK(V('us','Ford',1929)===1507000&&V('us','Chevrolet',1925)===tabAt(cpOf('us','Chevrolet').v,1925,true)&&V('us','Pontiac',1929)===0,'до 1930 года выпуск марок прежний, новых марок ещё нет');
  {const f37=V('us','Ford',1937),c55=V('us','Chevrolet',1955),o35=V('de','Opel',1935)/mktAt(MKT.de,1935.01),r49=V('fr','Renault',1949)/mktAt(MKT.fr,1949.01),m39=V('uk','Morris',1939)/mktAt(MKT.uk,1939.01),fi55=V('it','FIAT',1955)/mktAt(MKT.it,1955.01);
   CK(Math.abs(f37/942000-1)<0.01&&Math.abs(c55/1705000-1)<0.01,'США: в опорный год выпуск марки — из источника (Ford 1937 — '+Math.round(f37/1000)+' тыс., Chevrolet 1955 — '+Math.round(c55/1000)+' тыс.)');
   CK(Math.abs(o35-0.435)<0.002&&Math.abs(r49-0.369)<0.002&&Math.abs(m39-0.27)<0.002&&Math.abs(fi55-0.94)<0.002,'Европа: в опорный год доля марки — из источника (Opel 1935 — 43,5 %, Renault 1949 — 36,9 %, Morris 1939 — 27 %, FIAT 1955 — 94 %)');}
  {const f29=V('us','Ford',1929),f32=V('us','Ford',1932),f31=V('us','Ford',1931),sh=y=>V('us','Ford',y)/mktAt(MKT.us,y+0.01);
   CK(f32<f29*0.2&&Math.abs(sh(1931)-(sh(1930)+sh(1932))/2)<0.002,'депрессия попадает в выпуск марки сама: Ford 1932 — '+Math.round(f32/1000)+' тыс. против '+Math.round(f29/1000)+' тыс. в 1929-м; между опорными годами доля идёт ровно');}
  // война: марка жива и в год без рынка; закрытия — по годам источников
  CK(V('us','Ford',1944)>=1&&V('de','Opel',1945)>=1&&V('de','DKW / Auto Union',1947)>=1&&V('fr','Renault',1943)>=1,'в годы без рынка марка жива (не меньше одной машины) — в войну фирмы не «умирают»');
  CK(V('us','Stutz',1935)>0&&V('us','Stutz',1936)===0&&V('us','Duesenberg',1937)>0&&V('us','Duesenberg',1938)===0&&V('us','Packard',1958)>0&&V('us','Packard',1959)===0&&V('us','Hudson-Essex',1958)===0&&V('us','Willys-Overland',1956)===0,'концы марок США — по годам из источников: Stutz 1935, Duesenberg 1937, Hudson 1957, Packard 1958, Willys 1955');
  CK(V('us','Kaiser-Frazer',1946)===0&&V('us','Kaiser-Frazer',1948)>100000&&V('us','Kaiser-Frazer',1956)===0&&V('de','Volkswagen',1945)===0&&V('de','Volkswagen',1955)>90000&&V('fr','Simca',1933)===0&&V('fr','Simca',1939)>15000,'новые марки появляются в свой год: Kaiser-Frazer 1947–1955, Volkswagen с 1946-го, Simca с 1934-го');
  CK(V('fr','De Dion-Bouton',1935)===0&&V('de','Brennabor',1935)===0&&V('it','Itala',1936)===0&&V('ru','Импорт из Америки',1935)===0,'марки, не пережившие депрессию, сходят на нет');
  // классы и имена меняются со временем
  {const P=cpOf('us','Packard'),R=cpOf('fr','Renault');compVol(P,at(1934));const a=P.mix.lux;compVol(P,at(1936));const b=P.mix.middle;compVol(R,at(1950));const r=R.mix.people;compVol(R,at(1935));const r0=R.mix.people;
   CK(a===0.8&&b===0.7&&r===0.75&&r0===0.3,'классы марки меняются по истории: Packard с 1935 года — в основном средний класс, Renault с 1947-го — народный');}
  CK(compName(cpOf('us','Nash'),at(1956))==='Nash'&&compName(cpOf('us','Nash'),at(1958))==='Rambler (AMC)'&&compName(cpOf('ru','АМО'),at(1934))==='ЗИС','имена: Nash с 1957 года — Rambler (AMC), АМО с 1933-го — ЗИС');
  CK(BRAND_GROUP['Austin']===1952&&BRAND_GROUP['Nash']===1954&&BRAND_GROUP['Pontiac']===0&&BRAND_GROUP['Opel']===1929,'слияния по истории: BMC 1952, AMC 1954; отделения GM и Ford отдельно не купить');
  {let worst=0,wk='';for(const c of ['us','uk','fr','de','it'])for(let y=1930;y<1960;y++){at(y);const sum=COMPS[c].reduce((a,cp)=>a+(((cp.mixT?c60MixAt(cp,y):cp.mix).truck||0)>=0.5?0:compVol(cp,s)),0)/mktAt(MKT[c],y+0.01);if(sum>worst){worst=sum;wk=c+' '+y;}}
   CK(worst<1.35,'названные марки вместе не больше рынка с запасом на модельный год: худший случай — '+wk+', '+worst.toFixed(2));}
  CK(Object.keys(COMPS).every(c=>COMPS[c].every(cp=>(cp.est60||[]).every(y=>cp.a60&&cp.a60[y]!=null))),'каждая оценка помечена у своей опорной точки');
  // записи марок в сохранении
  {at(1930);const n0=s.comps.us.length;s.comps.us.length=19;s.comps.de.length=7;migrate(s);CK(n0===COMPS.us.length&&s.comps.us.length===COMPS.us.length&&s.comps.de.length===COMPS.de.length&&s.comps.us[19].name==='Pontiac','записи новых марок есть в новой партии и дописываются в старое сохранение');}
}
/* ---------- 15б. этап 4: фирма выходит в соседний класс ---------- */
{BOTS_OFF=false;seed(151);newGame('ford','us','','normal','Соседний класс');const s=G;s.cash=5e7;s.pending=[];s.y=1912;s.m=0;let err='';
  try{for(let k=0;k<4;k++){s.pending=[];step();}}catch(e){err=e.message+' '+(e.stack||'').split(String.fromCharCode(10))[1];}
  const bi=COMPS.us.findIndex(x=>x.n==='Buick'),cp=COMPS.us[bi],F=s.firms&&s.firms['us:'+bi],r={riv:[],mk:s.last&&s.last.mk},SG0=s.last&&s.last.mk&&s.last.mk.us&&s.last.mk.us.segs;
  CK(!err&&F&&F.st==='ok'&&F.h12>0,'фирма Buick живёт в партии 1912 года '+err);
  for(const k in s.firms){const X=s.firms[k];if(X.prog&&X.prog.k==='enter')X.prog=null;if(X.ext)X.ext={};}s.extT={};s.extL={};   // чистый лист: за четыре месяца кто-то мог начать выход сам
  const SG={people:{size:1000,you:500,edgeQ:0.4},middle:{size:800,you:0},lux:{size:100,you:10}};
  {const E=firmEnterPick(s,F,cp,SG);CK(E&&E.g==='people'&&E.g0==='middle'&&Math.abs(E.you-0.5)<1e-9,'Buick (средний класс) видит народный класс, где вы держите половину продаж');}
  CK(!firmEnterPick(s,F,cp,{people:{size:1000,you:300},lux:{size:100,you:10}}),'ниже 35 % класса у одной марки — повода выходить нет');
  {const fi=COMPS.us.findIndex(x=>x.n==='Chevrolet'),FC=s.firms['us:'+fi]||firmMake(s,'us',fi,COMPS.us[fi]);CK(!firmEnterPick(s,FC,COMPS.us[fi],{people:{size:1000,you:900},middle:{size:800,you:100}}),'в класс, где у марки уже есть машины, «выходить» нельзя');}
  const cash0=F.cash=F.h12;F.prog=null;const ok1=firmEnterStart(s,r,F,cp,SG,false);
  CK(ok1&&F.prog&&F.prog.k==='enter'&&F.prog.g==='people'&&F.cash<cash0&&F.prog.at-mi(s)>=15&&r.riv.some(n=>n.k==='enter0'&&/Packard/.test(n.txt)),'программа выхода: стоит денег, идёт полтора-два года, о ней пишут в новостях');
  {const fj=COMPS.us.findIndex(x=>x.n==='Nash'),FN=s.firms['us:'+fj]||firmMake(s,'us',fj,COMPS.us[fj]);CK(!firmEnterPick(s,FN,COMPS.us[fj],SG)||firmEnterPick(s,FN,COMPS.us[fj],SG).g!=='people','в один класс страны — не чаще раза в пять лет: вторая фирма следом не идёт');}
  const W0=compWeights('us','people',s),M0=firmTerms(s,'us','people').M;
  firmDone(s,r,F,cp);
  CK(F.ext&&F.ext.people&&extList(s,'us','people').includes(bi)&&!F.prog&&r.riv.some(n=>n.k==='enter'),'линия открыта: запись у фирмы и в списке класса');
  {const W1=compWeights('us','people',s),e=W1.find(o=>o.ext&&o.i===bi),M1=firmTerms(s,'us','people').M;
   CK(e&&e.w>0&&W1.length===W0.length+1&&M1>M0+e.w*0.5,'линия прибавляется к классу сверх истории: вес '+(e?e.w.toFixed(3):'-')+', сила соперников класса '+M0.toFixed(2)+' → '+M1.toFixed(2));
   s.m+=6;s.y+=3;const e2=compWeights('us','people',s).find(o=>o.ext&&o.i===bi);s.y-=3;s.m-=6;CK(e&&e2&&e2.v>e.v*2,'за три года линия выходит на полный вес');
   const sp=compSplit('us','people',s,1000).find(o=>o.i===bi);CK(sp&&sp.sales>0,'у линии свои продажи в классе: '+(sp?Math.round(sp.sales):0)+' из 1000 машин соперников');}
  CK(firmSegsF(F,cp).includes('people')&&firmSegsF(F,cp).includes('middle')&&!firmSegs(cp).includes('people'),'классы фирмы: свои по истории и линия');
  // партия идёт с линией: продажи пишутся, ошибок нет
  {let e2='';try{for(let k=0;k<8;k++){s.pending=[];step();}}catch(e){e2=e.message+' '+(e.stack||'').split(String.fromCharCode(10))[1];}const x=s.comps.us[bi];
   CK(!e2&&F.ext&&F.ext.people&&x.lg&&x.lg.people>0&&(F.sh.people||0)>0&&F.rs.people!=null,'восемь месяцев с линией: продажи Buick в народном классе — '+(x.lg&&x.lg.people?Math.round(x.lg.people):0)+' за месяц, доля класса '+pct(F.sh.people||0,1)+' '+e2);
   CK(/Линия в народном классе/.test(firmCardHTML(s,'us',bi,1)),'линия видна в карточке фирмы');}
  // не окупилась — снимают
  {const r2={riv:[]};F.ext.people.from=mi(s)-31;F.ext.people.you=0.5;F.rs.people=0.3;firmExtCheck(s,r2,F,cp);const kept=!!F.ext.people;F.rs.people=0.2;firmExtCheck(s,r2,F,cp);
   CK(kept&&!F.ext.people&&!extList(s,'us','people').includes(bi)&&r2.riv.some(n=>n.k==='exit')&&!compWeights('us','people',s).some(o=>o.ext),'линия не окупилась (меньше половины того, что взяла бы рядовая марка при вашей доле на день выхода) — её снимают');}
  // кого не распродают
  {const at=y=>{s.y=y;s.m=0;return s;},cpOf=n=>COMPS.us.find(x=>x.n===n);
   CK(firmKept(at(1935),cpOf('Oldsmobile'))==='grp'&&firmKept(at(1935),cpOf('Maxwell / Chrysler'))==='big'&&firmKept(at(1935),cpOf('Pontiac'))==='grp'&&!firmKept(at(1935),cpOf('Hudson-Essex'))&&!firmKept(at(1935),cpOf('Packard'))&&firmKept(at(1955),cpOf('Studebaker'))==='grp','при втором разорении не распродают марку концерна и фирму от 5 % рынка страны; независимых поменьше — распродают');
   const i=COMPS.us.findIndex(x=>x.n==='Maxwell / Chrysler'),FC=s.firms['us:'+i]||firmMake(s,'us',i,COMPS.us[i]),r3={riv:[]};at(1935);FC.st='bad';FC.bad=18;FC.rec=1;FC.h12=1e8;FC.r12=5e7;FC.cash=-9e7;FC.p12=-1e7;const dead0=firmState(s,r3,FC,COMPS.us[i],i);
   CK(FC.st==='ok'&&FC.rec===2&&!(s.dead&&s.dead['Maxwell / Chrysler']!=null)&&r3.riv.some(n=>/новых хозяев/.test(n.t)&&/Michelin/.test(n.txt)),'Chrysler второй раз в долгах — не закрыта: у новых хозяев, выпуск урезан');
   s.y=1912;s.m=8;}
  // в мире без игрока линий нет
  CK(!firmEnterPick(s,F,cp,{people:{size:1000,you:0},lux:{size:100,you:0}}),'без марки-лидера в соседнем классе фирмы живут по истории');
  BOTS_OFF=true;
}
/* ---------- 16. этап 5: начало по истории ---------- */
{const NL=String.fromCharCode(10),steps=(s,n)=>{let e='';try{for(let k=0;k<n&&!s.over;k++){s.pending=[];step();}}catch(x){e=x.message+' '+(x.stack||'').split(NL)[1];}return e;};
  // прежние наборы: мастерская 1895 года, как до этапа
  seed(160);newGame('ford','us','','normal','Т');CK(START1895===true&&G.y===1895&&G.m===0&&G.cap===3&&G.workers===12&&G.y0==null&&gameStartY(G)===1895,'в проверках прежних наборов герой начинает мастерской 1895 года');
  const legacyCash=G.cash;
  START1895=false;
  CK(Object.keys(HERO_START).every(k=>PIONEERS[k]&&HERO_START[k].lead&&HERO_START[k].y>=1895&&HERO_START[k].y<=1916),'у каждого героя из таблицы старта есть год и строка «что было по истории»');
  // Форд: 1899 год, Detroit Automobile Company
  {seed(161);newGame('ford','us','','normal','');const s=G,md=s.models[0];
   CK(s.y===1899&&s.m===7&&s.cap===2&&Math.abs(s.y0-(1899+7/12))<1e-9&&gameStartY(s)===1899,'Форд начинает в августе 1899 года — с Detroit Automobile Company');
   CK(s.cash===Math.round(15000*bn('cash')*DIF().cash)&&s.cash<legacyCash,'касса Форда — 15 000 долларов инвесторов (с поправкой сложности): '+money(s.cash));
   CK(!isTruck(md)&&['middle','people'].includes(segOf(md))&&md.launched===mi(s)&&md.price>=unitCost(md,s)*1.15/(1-DEALER_MARGIN)-10,'первая машина Форда — легковая, лучшая по прибыли из деталей 1899 года, и цена выше себестоимости: '+md.price+' при '+Math.round(unitCost(md,s)));
   CK(startFundsLeft(s).length===3&&startFundsLeft(s).reduce((a,f)=>a+f.sum,0)===99000&&!(s.partners&&s.partners.length),'у Форда впереди три предложения пайщиков по истории (71 000 до 1901 года и 28 000 в июне 1903-го); на старте совладельцев нет');
   CK(s.log.some(l=>/Детройт Аутомобил/.test(l.t||l.text||l))&&s.log.some(l=>/в стране продают около/.test(l.t||l.text||l)),'в журнале первого дня — что было по истории и каков мир к этому году');
   CK(Math.abs(s.fleet.us-fleetHist('us',yf(s)))<1e-6&&s.dealers.us>=3&&s.dealers.us<=Math.round(dealerNeed('us',s)/3)&&s.dealers.us*dealerUpkeep(s,'us')*12<=s.cash*0.05+1,'парк машин страны — на год старта; дилеров — сколько фирма может содержать ('+s.dealers.us+')');
   const E=histEra(s),E0=histEra(null);CK(E.y0===1899&&E0.y0===1895&&histBest(s,'scale').v<=E0.best.scale.v,'рекорд для победы — за свои годы: с 1899-го по 1960-й');
   s.pending=[];introPapers(s);CK(s.pending.length>=1||(s.papers&&s.papers.length>=1),'газеты первого дня выходят и у героя 1899 года');
   {let e='',ev=null;try{for(let k=0;k<7&&!ev;k++){s.pending=[];step();ev=s.pending.find(p=>/Пайщики готовы платить дальше/.test(p.title||''));}}catch(x){e=x.message;}
    const b=s.cash,ch=ev?ev.choices.map(c=>c[1]):[];
    CK(!e&&ev&&s.y===1900&&s.m===1&&ch[0]==='fund:Y:0'&&ch[1]==='fund:H:0'&&ch[2]==='fund:N:0'&&!(s.partners&&s.partners.length)&&/не подарок/.test(ev.text)&&/Совладельцы/.test(ev.text),'в феврале 1900 года пайщики предлагают деньги за долю: взять или отказаться; до ответа ни денег, ни доли '+e);
    resolve('fund:N:0');CK(Math.abs(s.cash-b)<2000&&!(s.partners&&s.partners.length)&&s.funds[0]===3&&startFundsLeft(s).length===2,'отказ: касса та же, совладельцев нет');
    s.y=1900;s.m=6;s.pending=[];step();const ev2=s.pending.find(p=>/Пайщики готовы платить дальше/.test(p.title||'')),b2=s.cash,V2=companyValue(s);resolve('fund:Y:1');const P=s.partners||[],sum=fundSum(HERO_START.ford.funds[1]);
    CK(ev2&&Math.abs(s.cash-b2-sum)<2000&&P.length===1&&P[0].hero===1&&P[0].n==='Пайщики «Детройт Аутомобил»'&&Math.abs(P[0].sh-Math.min(0.75,sum/(V2+sum)))<0.01&&s.funds[1]===2,'согласие: деньги в кассе, пайщикам — доля «взнос к стоимости фирмы с этими деньгами»: '+Math.round(P[0].sh*100)+' %');
    s.y=1903;s.m=4;s.pending=[];step();const ev3=s.pending.filter(p=>/Форд Мотор Компани/.test(p.title||''));CK(ev3.length===1&&/fund:Y:2/.test(ev3[0].choices[0][1]),'июнь 1903 года — предложение инвесторов «Форд Мотор Компани»');
    resolve('fund:N:2');s.y=1903;s.m=4;s.pending=[];step();CK(s.pending.filter(p=>/Форд Мотор Компани/.test(p.title||'')).length===0,'предложение приходит один раз');}}
  // все автомобильные герои: год по таблице, детали своего времени, год игры без ошибок
  {let bad1='',anach='',errs='';for(const k of Object.keys(HERO_START)){const HS=HERO_START[k];if(HS.moto)continue;seed(162);newGame(k,PIONEERS[k].c,'','normal','');const s=G,md=s.models[0];
     if(s.y!==HS.y||s.m!==(HS.m||0))bad1+=k+' ';PART_KEYS.forEach(pk=>{const cat=PART_CATS.find(q=>q.k===pk),pt=cat&&byId(cat.arr(),md[pk]);if(pt&&pt.y>s.y)anach+=k+':'+pt.name+' ';});
     const e=steps(s,12);if(e)errs+=k+': '+e+' | ';if(s.over)errs+=k+' разорён за год | ';}
   CK(!bad1,'год и месяц старта каждого героя — из таблицы '+bad1);CK(!anach,'в первой машине нет деталей из будущего '+anach);CK(!errs,'год игры без решений у каждого героя — без ошибок и разорений '+errs);}
  {seed(163);newGame('benz','de','','normal','');CK(G.y===1895&&G.cap===11&&G.models[0].legend==='benz_velo'&&G.models[0].t==='t1'&&G.rep>=40,'Бенц в 1895 году — завод на 11 мест и «Вело», а не мастерская на три');}
  {seed(163);newGame('durant','us','','normal','');const s=G;CK(s.y===1904&&s.m===10&&s.cash===Math.round(75000*bn('cash')*DIF().cash)&&!(s.partners&&s.partners.length),'Дюрант — ноябрь 1904 года, Buick с капиталом 75 тысяч');
   s.pending=[];introPapers(s);const ev=s.pending.find(p=>/Капитал «Бьюик»/.test(p.title||'')),b=s.cash,sum=fundSum(HERO_START.durant.funds[0]);
   CK(ev&&sum===Math.round(225000*DIF().cash)&&ev.choices[0][1]==='fund:Y:0','в первый день акционеры Buick предлагают 225 тысяч — подъём капитала до 300 тысяч по истории');
   const V=companyValue(s);s.pending=[ev];resolve('fund:Y:0');CK(Math.abs(s.cash-b-sum)<3000&&Math.abs(partnersShare(s)-sum/(V+sum))<0.01&&partnersShare(s)>0.7&&s.partners[0].n==='Акционеры «Бьюик»','согласие: 225 тысяч в кассе, акционерам — доля «взнос к стоимости»: '+Math.round(partnersShare(s)*100)+' %');
   s.pending=[];let e='';try{for(let k=0;k<3;k++){step();s.pending=[];}}catch(x){e=x.message;}CK(!e&&s.partners.length===1,'предложение первого дня не повторяется '+e);}
  {seed(163);newGame('rolls','uk','','normal','');CK(G.y===1906&&G.models[0].legend==='rr_ghost'&&segOf(G.models[0])==='lux','Роллс — 1906 год, первая машина — легенда марки');}
  {seed(163);newGame('ryabush','ru','','normal','');CK(G.y===1916&&segOf(G.models[0])==='truck','Рябушинский — 1916 год, грузовик АМО');}
  {seed(163);newGame('olds','us','','normal','');const s=G;CK(s.y===1897&&s.m===7&&s.cash===Math.round(50000*bn('cash')*DIF().cash)&&startFundsLeft(s).length===1&&startFundsLeft(s)[0].sum===200000&&!(s.partners&&s.partners.length),'Олдс — август 1897 года, капитал 50 000 долларов; в мае 1899-го Сэмюэл Смит предложит 200 000');
   s.y=1899;s.m=3;s.pending=[];step();const ev=s.pending.find(p=>/Олдс Мотор Уоркс/.test(p.title||'')),b=s.cash;CK(s.y===1899&&s.m===4&&ev&&/Взять/.test(ev.choices[0][0]),'май 1899 года: Смит предлагает 200 000 долларов за долю');resolve('fund:Y:0');CK(s.cash>b+150000&&partnersShare(s)===0.75&&s.partners[0].n==='Сэмюэл Смит с сыновьями','согласие: деньги в кассе, Смиту — три четверти дела');}
  {seed(163);newGame('olds','us','','normal','');const s=G;s.y=1899;s.m=3;s.pending=[];step();const ev=s.pending.find(p=>/Олдс Мотор Уоркс/.test(p.title||'')),b=s.cash,V=companyValue(s),half=Math.round(fundSum(HERO_START.olds.funds[0])/200)*100;s.pending=[ev];resolve('fund:H:0');
   CK(Math.abs(s.cash-b-half)<3000&&Math.abs(partnersShare(s)-Math.min(0.75,half/(V+half)))<0.01&&partnersShare(s)<0.75,'можно взять половину: 120 тысяч — и доля меньше ('+Math.round(partnersShare(s)*100)+' %)');}
  {seed(163);newGame('bugatti','fr','','normal','');const md=G.models[0];CK(G.y===1909&&md.price>=unitCost(md,G)*1.15/(1-DEALER_MARGIN)-10,'у Бугатти в 1909 году первая машина продаётся дороже себестоимости: '+md.price+' при '+Math.round(unitCost(md,G))+' ('+segOf(md)+')');}
  CK(RACERS.rickenbacker.y===1910&&RACERS.rickenbacker.m===5&&RACERS.a_maserati.y===1908&&RACERS.lancia.y===1900&&RACERS.l_chevrolet.y===1905&&RACERS.ferrari.y===1919,'гонщики-основатели начинают с гоночного дебюта по источникам: Лянча — 1900, Шевроле — 1905, Мазерати — 1908, Рикенбакер — июнь 1910, Феррари — 1919');
  {seed(163);newGame('peugeot','fr','','normal','');CK(G.y===1895&&G.cap===3&&G.y0==null&&G.log.some(l=>/Пежо строят экипажи/.test(l.t||l.text||l)),'у марок старше 1895 года без чисел из источника — прежняя мастерская и строка истории');}
  {seed(163);newGame('rolls','uk','','normal','');const s=G;s.y=1960;s.m=0;s.fameSaved=0;try{localStorage.removeItem(SAVE_PREFIX+'fame');}catch(_){}let e='';try{finalResults(s,false);}catch(x){e=x.message;}
   const F=fameList()[0];CK(!e&&F&&F.from===1906&&F.year===1960,'в зале славы у партии записаны её годы: 1906–1960 '+e);try{localStorage.removeItem(SAVE_PREFIX+'fame');}catch(_){}}
  // совладельцы: выкуп по десятой части дела, совет помощника (решение автора 25 ноября)
  {seed(163);newGame('ford','us','','normal','');const s=G;s.pending=[];introPapers(s);
   CK(s.pending.some(p=>/пайщики предложат деньги — за долю в деле/.test(p.text||'')),'газета первого дня говорит, что деньги пайщиков — за долю в деле');
   s.pending=[];s.cash+=100000;stakeAdd(s,'Пайщики',100000);const P=s.partners;
   CK(P.length===1&&P[0].sh===0.75&&bbAdvice(s)===null&&!adviceList(s).some(a=>a.icon==='🤝'),'пока прибыли нет, помощник о выкупе молчит');
   const h=bbHTML(s,true);CK(/data-part="1"/.test(h)&&/10% · /.test(h)&&/Всё · /.test(h),'в «Совладельцах» у крупной доли две кнопки: десятая часть дела и всё');
   const c1=bbPartPrice(s,P[0]),b=s.cash;CK(c1===bbPrice(s,{sh:0.1})&&bbBuy(s,0,1)&&Math.abs(P[0].sh-0.65)<1e-9&&s.cash===b-c1,'десятая часть дела выкупается по цене десятой части: '+c1+', у пайщиков остаётся 65 %');
   while(s.partners.length&&s.partners[0].sh>0.46)bbBuy(s,0,1);const was=partnersShare(s),V=companyValue(s);s.cash+=20000;const k=stakeAdd(s,'Пайщики',20000);
   CK(Math.abs(was-0.45)<1e-9&&Math.abs(k-Math.min(0.75,was*(1-20000/(V+20000))+20000/(V+20000)))<0.002&&s.partners.length===1,'новый взнос тех же пайщиков разбавляет прежнюю долю и добавляет новую: '+Math.round(k*100)+' %');
   s.pending=[];step();s.pending=[];s.partners=[{n:'Пайщики',sh:0.75,t:mi(s),hero:1}];s.hist.profit=Array(12).fill(20000);s.cash=400000;s.loan=0;const A=bbAdvice(s);
   CK(A&&A.part&&A.c===bbPartPrice(s,s.partners[0])&&A.yrs<=12&&adviceList(s).some(a=>a.icon==='🤝'&&/десятую часть дела/.test(a.text)),'при прибыли и свободных деньгах помощник советует выкупить десятую часть дела и называет срок окупаемости');
   s.cash=100;CK(bbAdvice(s)===null&&!adviceList(s).some(a=>a.icon==='🤝'),'нет свободных денег — совета нет');
   // дивиденды — не вся доля прибыли (решение автора 26 ноября): до 1946 года — 70 % доли, после — 50 %
   CK(divPayout({y:1899})===0.7&&divPayout({y:1945})===0.7&&divPayout({y:1946})===0.5&&divPayout({y:1959})===0.5&&divPct({y:1900},0.75)===Math.round(0.75*0.7*100)&&divPct({y:1950},0.2)===10,'дивидендами уходит 70 % доли прибыли до 1946 года и 50 % после: с 75 % дела — около '+divPct({y:1900},0.75)+' % прибыли');
   s.partners=[{n:'Пайщики',sh:0.75,t:mi(s),hero:1}];s.cash=400000;s.loan=0;const h2=bbHTML(s,true);CK(/Совладельцам идут дивиденды — 70% их доли прибыли/.test(h2)&&new RegExp('около '+divPct(s,0.75)+'% прибыли фирмы').test(h2)&&/75% дела/.test(h2),'«Совладельцы» объясняют правило: доля в деле и дивиденды с неё');
   {let found=0,e='';try{for(let k=0;k<30&&!found;k++){s.pending=[];s.shHoard=0;const ok=step();const L=s.last;if(L&&L.invSh>0&&L.profit>0){const tot=L.profit+L.invSh;found=Math.abs(L.invSh-Math.round(tot*0.75*0.7))<=2?1:-1;}}}catch(x){e=x.message;}
    CK(found===1&&!e,'в прибыльный месяц совладельцам уходит 75 % × 70 % прибыли, остальное остаётся фирме '+e+' '+found);}}
  {seed(163);newGame('renault','fr','','normal','');CK(!(G.partners&&G.partners.length)&&startFundsLeft(G).length===0,'у героя без пайщиков в истории предложений нет');
   const V=companyValue(G);G.cash+=10000;const k=stakeAdd(G,'Проба',10000);CK(Math.abs(k-10000/(V+10000))<0.002,'доля за взнос — взнос, делённый на стоимость фирмы с этими деньгами: '+(k*100).toFixed(1)+' %');
   START1895=true;seed(163);newGame('olds','us','','normal','');const s=G;s.y=1899;s.m=3;s.pending=[];step();CK(!s.pending.some(p=>/Олдс Мотор Уоркс/.test(p.title||''))&&!s.funds,'в партии с мастерской 1895 года предложений пайщиков нет');START1895=false;}
  // свой персонаж: год выбирает игрок
  {seed(164);newGame('custom','us','','normal','',{y0:1924});const s=G,md=s.models[0];
   CK(s.y===1924&&s.cap===eraCap(1924)&&s.cash===Math.round(eraCash('us',1924)*bn('cash')*DIF().cash)&&(s.tech.tools||0)>=2&&(s.tech.elec||0)>=1&&!s.tech.line,'свой персонаж 1924 года: цех, касса и станки обычной новой фирмы этого года; конвейера нет — его строят сами');
   CK(PART_KEYS.every(pk=>{const cat=PART_CATS.find(q=>q.k===pk),pt=cat&&byId(cat.arr(),md[pk]);return !pt||pt.y<=1924;})&&parts(md).e.y>=1905,'его первая машина — по образцу начала 1920-х, а не 1895 года: '+parts(md).e.name);
   CK(histEra(s).y0===1924&&histBest(s,'scale').v<histEra(null).best.scale.v,'рекорд — за 1924–1960 годы');
   const e=steps(s,12);CK(!e&&!s.over&&s.y===1925,'год игры с 1924-го — без ошибок '+e);
   seed(164);newGame('custom','us','','normal','',{y0:1895});CK(G.y===1895&&G.cap===3&&G.y0==null,'1895 год по выбору — прежняя мастерская');
   seed(164);newGame('custom','us','','normal','',{y0:1975});CK(G.y===END_Y-10,'год старта — не позже чем за десять лет до конца партии');}
  // мотоциклы прежде автомобилей
  {seed(165);newMotoGame('bianchi','it','','normal','');const b=G.y,bl=G.log.some(l=>/1897 году он поставил на велосипед мотор/.test(l.t||l.text||l));newMotoGame('wanderer','de','','normal','');const w=G.y;newMotoGame('dedion','fr','','normal','');const d=G.y;newMotoGame('custom','it','','normal','');
   CK(b===1897&&bl&&w===1902&&d===1895&&G.y===motoStartY('it'),'мотоциклисты начинают в свой год: Бьянки — 1897, Wanderer — 1902, де Дион — 1895; свой персонаж — в год страны');}
  // рекорд по годам старта посчитан заранее
  CK(HIST_ERA_DATA.byStart&&[1896,1899,1909,1924,1950].every(y=>HIST_ERA_DATA.byStart[y]&&HIST_ERA_DATA.byStart[y].best.scale&&HIST_ERA_DATA.byStart[y].y0===y)&&HIST_ERA_DATA.byStart[1950].best.scale.v<HIST_ERA_DATA.byStart[1896].best.scale.v,'таблица рекордов «за свои годы» есть для каждого года старта 1896–1950');
  // экран новой игры
  {const _os=openSheet;let H='';openSheet=h=>{H=String(h);};try{draft=null;G=null;openNewGame();draft.hero={kind:'custom',k:'custom'};draft.sy=1924;openNewGame();}catch(e){H='ERR '+e.message;}openSheet=_os;
   CK(/старт — август 1899 года/.test(H)&&/Детройт Аутомобил/.test(H),'на экране новой игры у Форда — год старта и что было по истории');
   CK(/Год старта/.test(H)&&/data-act="syear" data-v="1924"/.test(H)&&/рекорд для победы — за ваши годы/.test(H),'у своего персонажа — выбор года старта');}
  // совет: новинка кормит фирму хуже прежней машины
  {START1895=true;seed(166);newGame('ford','us','','normal','Старая');const s=G;s.cash=5e5;s.pending=[];for(let k=0;k<8;k++){s.pending=[];step();}
   const A=s.models[0];CK(A.pf6!=null,'у модели в производстве считается, сколько она приносит в месяц сверх себестоимости: '+Math.round(A.pf6||0));
   const B=Object.assign({},A,{id:s.nextId++,name:'Новинка',launched:mi(s)-6,pf6:40,totalSold:0,legend:null});s.models.push(B);
   A.status='off';A.pfOff=600;A.offAt=mi(s)-5;A.pf6=600;
   const T1=adviceList(s).find(t=>/Новинка «Новинка» приносит/.test(t.text));CK(T1&&/снятая «Старая» давала/.test(T1.text)&&T1.btn==='Вернуть «Старая»'&&typeof T1.run==='function','помощник говорит: новинка приносит меньше снятой машины — и предлагает вернуть прежнюю');
   if(T1&&T1.run)T1.run();CK(A.status==='prod'&&A.revAt===mi(s),'кнопка возвращает прежнюю машину в выпуск');
   CK(!adviceList(s).some(t=>/Новинка «Новинка» приносит/.test(t.text)),'когда прежняя снова в выпуске, совет уходит');
   A.status='off';A.offAt=mi(s)-30;CK(!adviceList(s).some(t=>/приносит .* сверх себестоимости, а снятая/.test(t.text)),'о машине, снятой больше двух лет назад, помощник не вспоминает');
   A.offAt=mi(s)-5;B.pf6=900;CK(!adviceList(s).some(t=>/сверх себестоимости, а снятая/.test(t.text)),'если новинка приносит больше прежней — совета нет');}
  START1895=true;
}
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
