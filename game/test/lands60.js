// 0.60, этап 6 — новые страны: Япония, Швеция, Чехословакия. Рынок, марки, хозяйство, торговля, старт, подписи.
// node game/test/lands60.js
require('./harness.js')(`
let ok=0,bad=0;const CK=(c,m)=>{if(c)ok++;else{bad++;console.log("FAIL",m);}};
const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
const NEW=['jp','se','cz'],OLD=['us','fr','de','uk','it','ru'],NL=String.fromCharCode(10);
const run=(n,pick)=>{let err='';try{for(let i=0;i<n&&!G.over;i++){let g=0;while(G.pending.length&&g++<30){const K=(G.pending[0].choices||[]).map(x=>x[1]);resolve((pick&&pick(K))||K.find(x=>!/^reel:/.test(x))||'ok');}step();}}catch(e){err=e.message+' @'+G.y+'.'+(G.m+1);}return err;};
/* ---------- 1. страны и их таблицы ---------- */
CK(Object.keys(COUNTRIES).length===9&&NEW.every(c=>COUNTRIES[c]&&COUNTRIES[c].new60&&COUNTRIES[c].cash>0&&COUNTRIES[c].note),'стран девять: к шести прибавились Япония, Швеция и Чехословакия');
CK(OLD.every(c=>!COUNTRIES[c].new60),'прежние шесть стран не помечены как новые');
{const T={MKT,MKT_TRUCK,MKT_MOTO,MOTO_SIDE,PREF_C,PREF_MOTO_C,WAGE,TARIFF,DEALER_NEED,HH,INC,PARETO,FLEET0,APPEAL_C,SPORT_Y,TRUCK_FLOOR,FARM_MKT,MSTART_C,IN_C,MA_INVESTORS,COMPS,MCOMPS,MAST,ARMY_NEED,BOND,BOT_OPEN,BOT_IN,FIRM_LINE_Y,FIRM_FIN_Y,FARM_FIRM,WORLD_XY,CH_C,C_GEN,CSTART_TIP,MSTART_TIP,AMATEUR,RX_SPONS,AW_RIB,AW_CLUB,PLANT_SIGN,RIVERS,SCN_LAT,TRIAL_ROUTES,MREC_VENUE,PLANT_PAL,LMK_ST,SCEN_SETS};
  const miss=[];for(const n in T)NEW.forEach(c=>{if(T[n][c]===undefined)miss.push(n+'.'+c);});CK(!miss.length,'у новых стран есть все таблицы хозяйства и подписей'+(miss.length?' — нет: '+miss.join(', '):''));
  // тексты — свои, а не подставленные от соседа
  const same=[];['MAST','CSTART_TIP','MSTART_TIP','AMATEUR','RX_SPONS','AW_CLUB','PLANT_SIGN','RIVERS','TRIAL_ROUTES','MREC_VENUE','BOND','FARM_FIRM','MA_INVESTORS'].forEach(n=>NEW.forEach(c=>OLD.forEach(o=>{if(T[n][c]===T[n][o]||JSON.stringify(T[n][c])===JSON.stringify(T[n][o]))same.push(n+'.'+c+'='+o);})));
  CK(!same.length,'названия, фамилии, маршруты и газеты у новых стран свои'+(same.length?' — совпали: '+same.join(', '):''));
  CK(SCEN_SETS.cz===SCEN_SETS.at&&SCEN_SETS.se===SCEN_SETS.de&&SCEN_SETS.jp===SCEN_SETS.cn,'картинка до своей — от ближайшей страны: Чехия как Австрия, Швеция как Германия, Япония как Китай');}
/* ---------- 2. рынок по источникам ---------- */
CK(tabAt(MKT.jp,1960)===145227&&tabAt(MKT.jp,1955)===20055&&tabAt(MKT_TRUCK.jp,1960)>200000,'Япония: легковых в 1955 году — 20 055, в 1960-м — 145 227 (JAMA), грузовиков больше, чем легковых');
CK(tabAt(MKT.se,1955)===127749&&tabAt(MKT.se,1960)===159829,'Швеция: продажи 1955 и 1960 годов — 127 749 и 159 829');
CK(tabAt(MKT.cz,1935)===8436&&tabAt(MKT.cz,1937)===11141,'Чехословакия: рынок 1935 и 1937 годов — 8 436 и 11 141');
CK(tabAt(MKT.se,1900)<100&&tabAt(MKT.cz,1900)<100&&tabAt(MKT.jp,1905)<100,'в начале века машин в новых странах покупают десятки в год');
/* ---------- 3. марки ---------- */
{const nm=(c,n,y)=>compName(COMPS[c].find(x=>x.n===n),{y});
  CK(nm('cz','Škoda',1910)==='Laurin & Klement'&&nm('cz','Škoda',1930)==='Škoda'&&nm('cz','Tatra',1905)==='Nesselsdorf'&&nm('cz','Tatra',1925)==='Tatra','Чехия: Laurin & Klement становится Škoda, Nesselsdorf — Tatra');
  CK(nm('jp','Nissan',1920)==='Kwaishinsha (DAT)'&&nm('jp','Nissan',1933)==='Datsun'&&nm('jp','Nissan',1950)==='Nissan'&&nm('se','Scania-Vabis',1900)==='Vabis'&&nm('se','Scania-Vabis',1920)==='Scania-Vabis','Kwaishinsha → DAT → Datsun → Nissan; Vabis → Scania-Vabis');
  const since=(c,n)=>COMPS[c].find(x=>x.n===n).since;CK(since('se','Volvo')===1927&&since('jp','Toyota')===1936&&since('se','Saab')===1950&&since('cz','Škoda')===1905,'марки входят в свой год: Volvo — 1927, Toyota — 1936, Saab — 1950, Laurin & Klement — 1905');
  CK(NEW.every(c=>COMPS[c].every(x=>x.mix&&x.v&&x.since>=1895&&Math.abs(Object.values(x.mix).reduce((a,b)=>a+b,0)-1)<0.011)&&MCOMPS[c].every(x=>x.mix&&x.v)),'у каждой марки — состав классов (в сумме 1) и объёмы');
  CK(coKey('Laurin & Klement')==='Škoda'&&coKey('Ford-Japan')==='Ford'&&coKey('Vabis')==='Scania-Vabis','в рейтинге мира прежнее имя марки сводится к нынешнему, завод Ford в Иокогаме — к Ford');
  const wk=[];NEW.forEach(c=>COMPS[c].concat(MCOMPS[c]).forEach(x=>{if(!x.imp&&!(x.models&&x.models.length))wk.push(c+':'+x.n);}));CK(!wk.length,'у каждой своей марки названы модели'+(wk.length?' — нет у: '+wk.join(', '):''));}
/* ---------- 4. калибровка: мир без игрока идёт по истории ---------- */
{CK(NEW.every(c=>CALIB.k[c]&&CALIB.fleet[c]&&Object.keys(CALIB.k[c].middle).length>=60),'сила соперников и парк машин посчитаны для новых стран');
  const errs=[];let worst=0;NEW.forEach(c=>[1913,1925,1935,1955,1959].forEach(y=>{const s={y,m:5,country:'none',pioneer:'none',models:[],dealers:{},fleet:{[c]:tabAt(CALIB.fleet[c],y+0.4)},pw:{},rep:50,diff:'normal'};G=s;
    let got=0,want=0;for(let m=0;m<12;m++){s.m=m;const R=mkCountry(c,s,[],null,null);CARSEG.forEach(g=>{got+=R.segs[g].inc;});}
    s.m=5;const sf=[...Array(12).keys()].reduce((a,mm)=>a+SEASON[mm]*econ(y,mm,c).f,0);CARSEG.forEach(g=>{want+=segAnnual(c,g,s);});
    const e=Math.abs(got/want-1);worst=Math.max(worst,e);if(e>0.12)errs.push(c+' '+y+': '+Math.round(got)+' против '+Math.round(want));}));
  CK(!errs.length,'без игрока продажи легковых сходятся с историей (худшее расхождение '+Math.round(worst*100)+'%)'+(errs.length?' — '+errs.join('; '):''));}
/* ---------- 5. хозяйство и войны ---------- */
CK(!isWar(1916,0,'se')&&!isWar(1942,0,'se'),'Швеция нейтральна в обе войны');
CK(!isWar(1941,10,'jp')&&isWar(1942,0,'jp')&&isWar(1945,6,'jp')&&!isWar(1945,9,'jp'),'Япония воюет с декабря 1941-го по август 1945 года');
CK(isWar(1916,0,'cz')&&!isWar(1919,0,'cz')&&!isWar(1939,1,'cz')&&isWar(1939,3,'cz')&&isWar(1944,0,'cz')&&!isWar(1945,6,'cz'),'Чехия: война 1914–1918 годов и оккупация с марта 1939-го по май 1945 года');
CK(isWar(1916,0,'fr')&&isWar(1942,0,'uk')&&!isWar(1925,0,'de'),'у прежних стран войны на месте');
{const lab=[];NEW.forEach(c=>[[1905,0],[1916,0],[1923,9],[1931,0],[1938,0],[1942,0],[1947,0],[1955,0]].forEach(([y,m])=>{const e=econ(y,m,c);if(!e||!(e.f>0)||!isFinite(e.f)||typeof e.label!=='string'||/undefined|NaN/.test(e.label))lab.push(c+' '+y);}));CK(!lab.length,'у каждого года в новых странах есть хозяйство и подпись'+(lab.length?' — нет: '+lab.join(', '):''));
  CK(econ(1923,9,'jp').f<econ(1922,9,'jp').f,'Япония, осень 1923 года: землетрясение Канто бьёт по рынку');
  CK(econ(1942,0,'se').f<0.5*econ(1938,0,'se').f,'Швеция в войну: страна не воюет, но бензина нет — рынок падает');}
/* ---------- 6. торговля ---------- */
{const tr=(c,y)=>tradeRule(c,'fr',y);
  CK(tr('se',1925).duty<=0.15&&!tr('se',1925).ban&&tr('se',1941).ban,'Швеция: низкая пошлина, в войну ввоза нет');
  CK(tr('jp',1920).duty===0.5&&tr('jp',1937).quota>0&&tr('jp',1943).ban&&tr('jp',1952).quota>0,'Япония: тариф 1911 года, закон 1936 года, запрет в войну и разрешения после неё');
  CK(tr('cz',1910).duty<0.2&&tr('cz',1930).duty===0.5&&tr('cz',1930).quota>0&&tr('cz',1942).ban,'Чехословакия: до 1921 года пошлина мала, потом — 50% и разрешения, в оккупацию — запрет');
  CK(NEW.every(c=>[1900,1930,1950].every(y=>{const r=tr(c,y);return r&&typeof r.why==='string'&&r.why.length>3;})),'у каждого правила есть объяснение');
  CK(JSON.stringify(tradeRule('fr','de',1925))===JSON.stringify(tradeRule('fr','se',1925)),'правила ввоза во Францию от страны-продавца не зависят — как раньше');
  seed(3);newGame('custom','fr','','normal','Т');CK(transAtl(G,'jp')&&transAtl(G,'us')&&!transAtl(G,'se')&&!transAtl(G,'cz')&&shipCostTo(G,'jp')>shipCostTo(G,'se'),'Япония — за океаном: доставка туда из Европы дороже, чем в Швецию');}
/* ---------- 7. заказы и подписи ---------- */
{const badT=[];NEW.forEach(c=>{[1905,1925].forEach(y=>{G={y,m:0,country:c};for(const k in TENDERS){const w=TENDERS[k].who(c);if(typeof w!=='string'||w.length<4||/undefined|null/.test(w))badT.push(c+'.'+k+'='+w);}});});
  CK(!badT.length,'у каждого казённого и городского заказа в новых странах есть заказчик'+(badT.length?' — '+badT.join(', '):''));
  G={y:1910,m:0,country:'cz'};const a=TENDERS.post.who('cz');G={y:1925,m:0,country:'cz'};const b=TENDERS.post.who('cz');CK(a!==b&&/Чехословацкая/.test(b),'чешская почта: до 1918 года — императорско-королевская, потом — чехословацкая');
  G={y:1905,m:0,country:'fr'};CK(TENDERS.post.who('fr')==='Почта Франции'&&/Берлина/.test(TENDERS.taxi.who('de')),'заказчики прежних стран не изменились');
  CK(landName('cz',1910,0)==='Богемия (Австро-Венгрия)'&&landName('cz',1918,9)==='Чехословакия'&&landName('se',1900,0)==='Швеция'&&landName('fr',1900,0)==='Франция','до осени 1918 года Чехия — земля Австро-Венгрии');
  CK(AMATEUR.se[0]==='Герр'&&AMATEUR.cz.includes('Новак')&&AMATEUR.jp.includes('Танака')&&trialRoute('cz',1934)[2]===1600&&/Гётеборг/.test(trialRoute('se',1920)[1])&&/Токио/.test(trialRoute('jp',1930)[1]),'любители и пробеги — местные');}
/* ---------- 8. новая игра своим героем ---------- */
CK(landY0('se')===1905&&landY0('cz')===1905&&landY0('jp')===1910&&landY0('fr')===1895&&landY0('ru')===1895,'год, с которого своему персонажу есть кому продавать: Швеция и Чехия — 1905, Япония — 1910');
for(const c of NEW){seed(60+c.charCodeAt(0));BOTS_OFF=false;newGame('custom',c,'','normal','Первая',{y0:landY0(c)});const s=G;s.helper={on:1};
  CK(s.country===c&&s.y===landY0(c)&&s.cash>COUNTRIES[c].cash&&s.cap>=4&&s.models[0].e&&unitCost(s.models[0],s)>0,COUNTRIES[c].name+': партия начинается в '+landY0(c)+' году с цехом и кассой новой фирмы этого года');
  const e=run(36);CK(!e,COUNTRIES[c].name+': три года идут без ошибок'+(e?' — '+e:''));
  CK(s.bots&&Object.keys(s.bots).length===18,COUNTRIES[c].name+': живых великих марок восемнадцать'+(s.bots?' — '+Object.keys(s.bots).length:''));
  const L=s.last||{},mk=(L.mk||{})[c];CK(mk&&mk.size>0&&isFinite(mk.size)&&isFinite(s.cash),COUNTRIES[c].name+': домашний рынок считается ('+(mk?Math.round(mk.size):'—')+' машин в месяц)');
  const txt=JSON.stringify(s.log.slice(-200))+JSON.stringify(s.papers||[]).slice(0,200000);CK(!/undefined|NaN/.test(txt),COUNTRIES[c].name+': в журнале и газетах нет «undefined» и «NaN»'+(/undefined|NaN/.test(txt)?' — '+(txt.match(/.{60}(undefined|NaN).{40}/)||[''])[0]:''));
  // карта мира и строки стран
  let h='';try{h=worldMap(s)+Object.keys(COUNTRIES).map(k=>worldRow(s,k)).join('');}catch(er){h='ERR '+er.message;}
  CK(!/^ERR|undefined|NaN/.test(h)&&/>JP</.test(h)&&/>SE</.test(h)&&/>CZ</.test(h),COUNTRIES[c].name+': на карте мира девять стран'+(/^ERR|undefined|NaN/.test(h)?' — '+h.slice(0,120):''));
  // сохранение и загрузка
  let e2='';try{const raw=JSON.stringify(s);G=JSON.parse(raw);e2=run(6);}catch(er){e2=er.message;}CK(!e2&&G.country===c,COUNTRIES[c].name+': сохранение читается, партия идёт дальше'+(e2?' — '+e2:''));}
/* ---------- 9. великие марки ---------- */
{seed(77);BOTS_OFF=false;newGame('custom','fr','','normal','Т');run(2);const B=Object.keys(G.bots||{});
  CK(['Nissan','Toyota','Volvo','Scania-Vabis','Škoda','Tatra'].every(n=>B.includes(n))&&B.includes('Ford')&&B.includes('Renault'),'среди живых марок — Nissan, Toyota, Volvo, Scania-Vabis, Škoda и Tatra');
  CK(botMainSeg(G.bots.Toyota)==='truck'&&G.bots.Volvo.c==='se'&&G.bots['Škoda'].c==='cz','Toyota начинает с грузовиков; Volvo — шведская, Škoda — чешская');}
/* ---------- 10. мир для игрока из прежней страны ---------- */
{seed(81);BOTS_OFF=false;newGame('custom','de','','normal','Т',{y0:1924});const s=G;s.cash=5e6;s.helper={on:1};let e='';
  try{NEW.forEach(c=>{if(!tradeBan(s,c)){s.cash-=impCost(s,c,1);impDone(s,c,1);}});}catch(er){e=er.message;}const e3=e||run(24);
  const mk=(s.last||{}).mk||{};CK(!e3&&NEW.every(c=>mk[c]&&mk[c].size>0),'немецкая фирма 1924 года: рынки Швеции, Чехословакии и Японии открыты для вывоза'+(e3?' — '+e3:''));
  CK(tariffOf(s.models[0],'cz',s)>tariffOf(s.models[0],'se',s),'пошлина в Чехословакии выше шведской');}
/* ---------- 11. мотоциклы ---------- */
for(const c of NEW){seed(90+c.charCodeAt(0));BOTS_OFF=false;let e='';try{newMotoGame('custom',c,'Мото','normal','М1');e=run(24);}catch(er){e=er.message;}
  CK(!e&&G.y>=motoStartY(c)&&lineOn(G,'moto'),COUNTRIES[c].name+': мотомастерская начинается в '+motoStartY(c)+' году и работает'+(e?' — '+e:''));}
/* ---------- 12. меню новой игры ---------- */
{let html='';openSheet=h=>{html=h;};const el0={scrollTop:0,value:'',addEventListener(){},focus(){},querySelector:()=>null,querySelectorAll:()=>[],style:{},classList:{add(){},remove(){},toggle(){}}};document.getElementById=()=>el0;
  G=null;draft={ng:true,dir:'car',country:'se',hero:{kind:'custom',k:'custom'},company:'Т',diff:'normal',first:'Тип 1',sy:1895};let e='';try{openNewGame();}catch(er){e=er.message;}
  CK(!e&&draft.sy===1905&&!/data-act="syear" data-v="1895"/.test(html)&&!/data-act="syear" data-v="1900"/.test(html)&&/data-act="syear" data-v="1905"/.test(html)&&/data-act="syear" data-v="1946"/.test(html),'Швеция, свой персонаж: год старта — с 1905-го, более ранних кнопок нет'+(e?' — '+e:''));
  CK(/Швеция/.test(html)&&/Япония/.test(html)&&/Чехословакия/.test(html)&&!/undefined|NaN/.test(html)&&!/data-act="rpick" data-v="custom"/.test(html),'в меню девять стран; своего гонщика в новой стране пока нет'+(/undefined|NaN/.test(html)?' — '+(html.match(/.{50}(undefined|NaN).{30}/)||[''])[0]:''));
  draft={ng:true,dir:'car',country:'fr',hero:{kind:'custom',k:'custom'},company:'Т',diff:'normal',first:'Тип 1',sy:1895};openNewGame();
  CK(draft.sy===1895&&/data-act="syear" data-v="1895"/.test(html)&&/data-act="rpick" data-v="custom"/.test(html),'во Франции — как раньше: старт с 1895 года, свой гонщик есть');
  draft={ng:true,dir:'air',country:'jp',hero:{kind:'custom',k:'custom'},company:'Т',diff:'normal',first:'Тип 1',sy:1895};openNewGame();
  CK(draft.country==='fr'&&!/data-act="country" data-v="jp"/.test(html)&&/data-act="country" data-v="de"/.test(html),'аэропланы: новых стран в списке нет (их небо — этап 10)');
  draft={ng:true,dir:'moto',country:'cz',hero:{kind:'custom',k:'custom'},company:'Т',diff:'normal',first:'Тип 1',sy:1895};openNewGame();
  CK(draft.country==='cz'&&/1899 год/.test(html)&&!/undefined|NaN/.test(html),'мотоциклы в Чехии: мастерская 1899 года');}
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
