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
  CK(NEW.length===37&&NEW.every(p=>p.note&&p.c>0&&p.q>0&&p.name),'деталей 1930–1959 годов — 37: у каждой год, цена, сложность и справка');
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
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
