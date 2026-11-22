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
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
