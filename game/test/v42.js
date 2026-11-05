// 0.42: проверки модели в node — мировой зачёт побед (все гонки эпохи с начала партии, зачёт мотоциклов — треть, небо и рекорды,
// перенос со старых сохранений), награды выставок и зачёта мотоциклов, автозавод по сделке у мотомастерской, «зачем это нужно» и
// статьи энциклопедии у деталей. node game/test/v42.js
require('./harness.js')(`{
let bad=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)bad++;};
const seed=k=>{let a=k;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
const go=(n)=>{for(let k=0;k<n;k++){while(G.pending.length)resolve(G.pending[0].choices[0][1]);G.over=false;step();}};
/* ---------- зачёт побед ---------- */
seed(5);newGame('custom','ru','Проба','normal','Ласточка');G.helper={on:1};go(15*12);
{const W=G.world,T=domTable(G),past=RACES.filter(r=>r.y>=1895&&(r.y-1895)*12+r.m<mi(G)-2).length,done=RACES.filter(r=>W.sd[r.key]).length;
  ok(W.v>=2&&done>=past-3,'все гонки эпохи с начала партии учтены в мировом зачёте: '+done+' из '+past+' прошедших');
  ok(W.sport>=250&&T.sport.world===W.sport&&T.sport.mine===0,'мир спорта к '+G.y+' году — '+W.sport+' очков (гонки, зачёт мотоциклов, небо, рекорды), у пассивного игрока 0');
  const L=worldCo(G).filter(o=>o.sport>0).sort((a,b)=>b.sport-a.sport);ok(L.length>=8&&L[0].sport<W.sport*0.5,'очки разложены по маркам ('+L.slice(0,4).map(o=>o.n+' '+o.sport).join(', ')+'), лидер меньше половины');
  const moto=Object.keys(W.co).filter(n=>MCOMPS.ru.concat(MCOMPS.fr,MCOMPS.uk,MCOMPS.de,MCOMPS.us,MCOMPS.it).some(cp=>coKey(cp.n)===n)&&W.co[n].sport>0);
  ok(moto.length>=1,'зачёт мотоциклов идёт мотомаркам по истории: '+moto.slice(0,4).join(', '));
  ok(Object.keys(W.sd).some(k=>k.startsWith('arec|'))&&W.co['Wright']&&W.co['Wright'].sport>=4,'рекорды неба по истории — 4 очка строителю аэроплана (Wright: '+(W.co['Wright']||{}).sport+')');
  // перенос: старый мир (v1) с мусором пересчитывается
  W.v=1;W.sport=62;W.my.sport=62;for(const n in W.co)W.co[n].sport=777;worldMonth(G,G.last);
  ok(W.v>=2&&W.my.sport===0&&W.sport>=250&&!Object.values(W.co).some(o=>o.sport===777),'сохранение 0.41: «62 из 62» пересчитано заново по всем гонкам ('+W.sport+')');
  // своя победа в зачёте мотоциклов — треть очков, автомобильный победитель — свои
  const rc=RACES.find(r=>r.y===G.y&&r.m<G.m&&raceMoto(r))||RACES.find(r=>r.y===G.y-1&&raceMoto(r));
  if(rc){delete W.sd[rc.key];const was=W.sport,wm=W.my.sport||0;G.cres[rc.key]={w:'Panhard et Levassor',d:'',me:-1,c:'fr',pv:0,mo:0,mw:G.company};G.raceLog.push({y:rc.y,key:rc.key,name:rc.name,place:1,cls:'moto'});
    worldMonth(G,G.last);const pts=rc.major?6:2,mp=rc.major?2:1;ok(W.sport-was===pts+mp&&(W.my.sport||0)-wm===mp,'ваш зачёт мотоциклов в «'+rc.name+'»: вам '+mp+', автомобильному победителю '+pts+' (мир +'+(W.sport-was)+')');}
  // старт партии позже — гонки до него не считаются
  seed(7);newGame('custom','fr','Проба2','normal','Ласточка');G.startY=1909;G.y=1909;G.m=0;G.helper={on:1};go(14);
  const pre=RACES.filter(r=>r.y<1909&&G.world.sd[r.key]&&G.world.co).length;ok(G.world.sport<300&&!Object.values(G.world.co).some(o=>o.sport>60),'партия с 1909 года: гонки до старта в зачёт не идут (мир '+G.world.sport+')');}
/* ---------- награды: выставки и зачёт мотоциклов ---------- */
{const a=showAwardOf('paris',1905,G),b=showAwardOf('paris',1925,G),c=showAwardOf('london',1910,G),d=showAwardOf('berlin',1907,G),e=showAwardOf('spb',1910,G);
  ok(a&&/ван Зюйлен/.test(a.by)&&b&&/Петье/.test(b.by)&&a.music.tune==='hymn_fr','Парижский салон: до 1919 — барон ван Зюйлен (ACF), после — барон Петье; «Марсельеза»');
  ok(c&&/Симмс/.test(c.by)&&c.music.tune==='hymn_uk'&&d&&/Вильгельм/.test(d.by)&&e&&/ИРАО|Императорское/.test(e.by)&&e.music.rec[0]==='tsar_hymn','Олимпия — Симмс (SMMT); Берлин 1907 — кайзер; Петербург — ИРАО, «Боже, Царя храни»');
  ok(awardSVG(a,{place:1}).includes('<svg')&&awardCard(b,1).includes('Вручает'),'карточка приза выставки рисуется');
  const rc=RACES.find(r=>r.id==='targa'),aw=awardOf(rc,G),awm=Object.assign({},aw,{cup:aw.cup+' — зачёт мотоциклов'});ok(awardCard(awm,1).includes('зачёт мотоциклов')&&/Флорио/.test(awm.by),'зачёт мотоциклов Тарга Флорио — та же доска и тот же Флорио');}
/* ---------- мотомастерская купила автозавод ---------- */
{newMotoGame('custom','ru','Дукс','normal','Ласточка');G.cash=5e6;ok(!lineOn(G,'car'),'мотомастерская: автомобили закрыты');
  const i=COMPS.us.findIndex(cp=>!cp.imp&&compAlive(cp,{y:1912,m:0}));G.y=1912;G.m=3;G.hold=G.hold||[];G.hold.push({c:'us',i,n:COMPS.us[i].n,mode:'int',st:1,t:mi(G)});G.pending=[];
  motoTick(G);ok(lineOn(G,'car')&&!G.carShopB,'присоединён автозавод '+COMPS.us[i].n+' в США — путь к автомобилю пройден, оборудование дома не нужно');
  ok(canDesign(G,'car')&&carShopCard(G)===''&&G.pending.some(e=>/автомобили — вместе с/.test(e.title||'')),'машины можно чертить, карточки «Путь к автомобилю» нет, пришла заметка');}
/* ---------- «зачем это нужно» и энциклопедия ---------- */
{newGame('custom','ru','Проба','normal','Ласточка');const x=ALL_PARTS().find(q=>q.id==='me7'),w=partWhy(G,x);
  ok(/цена ниже/.test(w)&&/мощность ниже/.test(w)&&/дешёвого лёгкого мотоцикла/.test(w),'двухтактный 2½ л. с.: «дешевле, легче, слабее — мотор дешёвого лёгкого мотоцикла»');
  ok(/скорости/.test(partWhy(G,ALL_PARTS().find(q=>q.id==='e6')))&&/Закрытый кузов/.test(partWhy(G,ALL_PARTS().find(q=>q.id==='b4'))),'V8 — «для скорости», седан — «закрытый кузов — главное 1920-х»');
  const all=ALL_PARTS(),miss=all.filter(x=>!partWiki(x.id)&&!/^(t|mt0)/.test(x.id)).map(x=>x.id);ok(miss.length===0,'статья энциклопедии назначена каждой детали'+(miss.length?': нет у '+miss.join(','):''));
  ok(Object.keys(TECH).every(k=>partWiki('tech:'+k))&&Object.keys(EQ_BY).every(k=>partWiki('eq:'+k)),'…и каждой технологии завода и новинке оснащения');
  const box=wikiBoxHTML(partWiki('me7'));ok(/p-wiki/.test(box)&&/Двухтактный двигатель/.test(box)&&/Two-stroke engine/.test(box),'блок «Энциклопедия» для газеты (ru + en)');}
console.log(bad?'ОШИБОК: '+bad:'всё в порядке');process.exit(bad?1:0);}`);
