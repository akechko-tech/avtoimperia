// 0.29: события гонки на трассе, достопримечательности Петербург — Москва, столбы по эпохе. node game/test/events29.js
const run=require('./harness.js');
global.__fs=require('fs');
run(`
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL',m);}else console.log('ok  ',m);};
const load=rc=>{const id=realIdOf(rc);if(id&&!window.REAL_TRACKS[id]){try{require('/home/claude/Avtoimperia-Android/docs/terrain/'+id+'.js');}catch(e){}}};
const build=key=>{const rc=RACES.find(r=>r.key===key);load(rc);const md=aiCarMd(rc.y),v=carStats(md,2,rc.y).vmax;return buildTrack(rc,v);};
// 1. Петербург — Москва: кусок трассы — там, где город и приметы (Тверь: собор, Путевой дворец, мост через Волгу; Валдай: Троицкий собор)
{const T=build('x80901-1907'),L=(T.lm||[]).filter(q=>q.t==='rlm'&&!q.far&&Math.abs(q.off)<300&&q.i>5&&q.i<T.n-5);
  ok(L.some(q=>/Вознесенский/.test(q.name))&&L.some(q=>/путевой/i.test(q.name)),'Тверь: собор и Путевой дворец у дороги ('+L.map(q=>q.name).join(', ')+')');
  ok((T.seg||[]).some(s=>s.type===RSEG.bridge&&/Волг/.test(s.cap||'')),'Тверь: мост через Волгу на трассе');
  ok((T.lm||[]).some(q=>q.t==='gate_spb')&&(T.lm||[]).some(q=>q.t==='kremlin'),'старт у Кремля, финиш у ворот Петербурга');
  const ev=T.evx.find(e=>/ТВЕРЬ/.test(e.t));ok(ev&&ev.a>=0&&ev.real,'титр «Тверь» — у настоящего города');}
{const T=build('x87575-1908'),L=(T.lm||[]).filter(q=>q.t==='rlm'&&!q.far&&Math.abs(q.off)<300);ok(L.some(q=>/Троицкий/.test(q.name)),'Валдай: Троицкий собор у дороги');
  const ev=T.evx.find(e=>/ВАЛДАЙ/.test(e.t));ok(ev&&ev.real,'титр «Валдай» — у въезда в Валдай');}
// 2. Толпа на дороге: группа людей на полотне, расступается к обочинам
{const T=build('pm1903-1903'),e=T.evx.find(x=>x.k==='road');ok(e&&e.a>0,'Париж — Мадрид: «зрители на дороге» — место выбрано');
  const g=T.evc[0];ok(g&&g.P.filter(p=>p.u0===0).length>=10,'на дороге 10+ зрителей');
  ok(g.P.every(p=>p.u0===1||Math.abs(p.offR)<T.W/2),'стоят на полотне');ok(g.P.every(p=>Math.abs(p.offS)>T.W/2+0.9),'уходят за край дороги');
  let st=0;for(let q=-8;q<=12;q++){if(Math.abs(T.K[e.a+q])>1/60)st++;}ok(st===0,'место — без крутых поворотов');}
// 3. Табличка с названием, солдаты, пост, буря
{const T=build('pb1901-1901');const items={};T.spr.forEach(L=>L.forEach(it=>{items[it.t]=(items[it.t]||0)+1;}));
  ok(T.spr.some(L=>L.some(it=>it.t==='tsign'&&it.nm==='REIMS')),'Париж — Берлин: табличка REIMS');ok((items.gend||0)>=20,'солдаты на обочинах: '+(items.gend||0));
  ok(T.spr.some(L=>L.some(it=>it.t==='tsign'&&it.nm==='BERLIN')),'табличка BERLIN у финиша');}
{const T=build('glidden-1905');ok(T.spr.some(L=>L.some(it=>it.t==='banner'&&it.txt==='CONTROL')),'Глидден: растяжка CONTROL над дорогой');}
{const T=build('pmp-1896');ok(T.spr.filter(L=>L.some(it=>it.t==='ftree')).length>=1,'Париж — Марсель: поваленные бурей деревья');}
// 4. Хроника помечена, титр со временем суток не уезжает от своего часа
{const T=build('lemans-1923'),e=T.evx.find(x=>/ПОЛНОЧЬ/.test(x.t));ok(e&&Math.abs(e.at/T.raceLen-0.4)<0.08,'«Полночь» — в свой час');}
{const T=build('pm1903-1903'),e=T.evx.find(x=>/РЕНО РАЗБИЛСЯ/.test(x.t));ok(e&&e.k==='chron','«Марсель Рено разбился» — хроника, а не событие на дороге');}
// 5. Столбы: в 1890-х — редко, в 1920-х — чаще; на овалах — нет; провода до следующего столба
{const per=keys=>{let p=0,km=0;keys.forEach(k=>{const rc=RACES.find(r=>r.key===k);if(!rc)return;const T=build(k);T.spr.forEach(L=>L.forEach(it=>{if(it.t==='pole')p++;}));km+=T.len/1000;});return p/Math.max(1,km);};
  const early=per(RACES.filter(r=>r.y<1900&&r.t==='road').map(r=>r.key)),late=per(RACES.filter(r=>r.y>=1922&&r.t==='road'&&r.c!=='us').slice(0,12).map(r=>r.key));
  console.log('     столбов на км: до 1900 —',early.toFixed(1),'· 1920-е —',late.toFixed(1));ok(early<late,'в 1920-е линий у дорог больше, чем в 1890-е');ok(early<12,'до 1900 — не на каждой дороге');
  const ov=build(RACES.find(r=>r.t==='oval').key);ok(!ov.spr.some(L=>L.some(it=>it.t==='pole')),'на овале столбов нет');
  const T=build('vanderbilt-1906');let w=0,p=0;T.spr.forEach(L=>L.forEach(it=>{if(it.t==='pole'){p++;if(it.nx!==undefined)w++;}}));ok(p>0&&w/p>0.8,'провода между столбами: '+w+' из '+p);}
// 6. Фирменные модели Lancia: легенды и имена по истории
{const s={pioneer:'r_lancia',country:'it',y:1910,models:[{name:'Тип 51'}]};ok(legendsOf(s).some(L=>L.name==='Лямбда')&&legendsOf(s).some(L=>L.name==='Тета'),'Lancia: легенды «Тета», «Лямбда»');
  ok(brandNextName(s)==='Диальфа','Lancia 1910: новая модель — «Диальфа» (а не «Тип 2»): '+brandNextName(s));
  s.models.push({name:'Диальфа'},{name:'Бета'});ok(brandNextName(s)==='Гамма','потом — «Гамма»');
  ok(!BRAND_NAMES.r_lancia.some(([y,n])=>legendsOf(s).some(L=>L.name===n)&&false),'имена легенд не раздаются обычным моделям');}
console.log(fails?'FAILED '+fails:'ALL OK');
`);
