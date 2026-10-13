// 0.34: регламент гонок — сколько машин и мотоциклов от марки: node test/rules34.js
require('./harness.js')(`
SCN_OFF=true;Math.random=(()=>{let a=34;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const rr=(id,y)=>RACES.find(r=>r.id===id&&(!y||r.y===y))||RACES.find(r=>r.id===id);
// 1) пределы по гонкам
const pv=rr('pv1902'),gp=rr('gpacf',1906),ly=rr('lyon1914'),lm=rr('lm1921'),kl=rr('klausen'),tg=rr('targa'),gbc=RACES.find(r=>GBC_IDS.includes(r.id));
const R1=raceRule(pv);ok(R1.cars===6&&R1.motos===4,'Париж — Вена: машин '+R1.cars+', мотоциклов '+R1.motos);
if(gp){const R=raceRule(gp);ok(R.cars===3&&R.motos===0,'Гран-при АКФ '+gp.y+': машин '+R.cars);}
if(ly){const R=raceRule(ly);ok(R.cars===5,'Гран-при 1914: машин '+R.cars);}
if(lm){const R=raceRule(lm);ok(R.cars===4,'Гран-при Ле-Мана 1921: машин '+R.cars);}
if(kl){const R=raceRule(kl);ok(R.cars===4&&R.motos===4,'Клаузен: машин '+R.cars+', мотоциклов '+R.motos);}
if(tg){const R=raceRule(tg);ok(R.cars===5,'Тарга: машин '+R.cars);}
if(gbc){const R=raceRule(gbc);ok(R.cars===3&&R.motos===0,'Кубок Гордона Беннетта: машин '+R.cars);}
ok(RACES.every(r=>{const R=raceRule(r);return R.cars>=1&&R.cars<=6&&R.motos>=0&&R.motos<=4&&R.txt;}),'у каждой гонки есть предел и пояснение ('+RACES.length+' гонок)');
// 2) заявка: кнопки «ещё машина / ещё мотоцикл» до предела
newGame('renault','fr','T','normal');G.cash=1e7;G.y=pv.y;G.m=pv.m;G.rdept=1;
let html='';openSheet=h=>{html=h;};closeSheet=()=>{};drawSetupSprites=()=>{};texPrefetch=()=>{};
const car=G.models.find(m=>m.status==='prod');const mo=JSON.parse(JSON.stringify(car));mo.id=9901;mo.name='Мото';
{const d=rivalDesign('moto',pv.y);Object.assign(mo,{e:d.e,g:d.g,c:d.c,k:d.k,b:d.b,w:d.w});}
G.models.push(mo);
const isM=isMoto(mo);
G.drivers=DRIVERS.filter(d=>d.from<=pv.y&&d.to>=pv.y).slice(0,3).map(d=>d.id);
RS=null;openRaceSetup(pv.key);
ok(/Команда · машин 1 из 6/.test(html),'заголовок команды: '+((html.match(/Команда · [^<]*/)||[''])[0]));
ok(/📜/.test(html)&&/Panhard заявил 16 машин/.test(html),'в заявке — пояснение регламента');
for(let k=0;k<10;k++)RACE_ACT.rAdd({k:'car'});
ok(teamCount(G,RS.entries).c===6,'машин в заявке: '+teamCount(G,RS.entries).c+' (предел 6)');
ok(!/data-k="car">\\+ Ещё машина/.test(html),'кнопка «Ещё машина» пропала на пределе');
if(isM){for(let k=0;k<10;k++)RACE_ACT.rAdd({k:'moto'});ok(teamCount(G,RS.entries).m===4,'мотоциклов в заявке: '+teamCount(G,RS.entries).m+' (предел 4)');}
else console.log('  (мотоцикла в шаблоне нет — пропуск)');
// 3) Гран-при: больше трёх машин не заявить; лишние снимаются
if(gp){G.y=gp.y;RS={key:gp.key,entries:RS.entries.filter(e=>!entryIsMoto(G,e)).slice(0,6),open:0,mode:'sim',more:false};renderRaceSetup();
  ok(RS.entries.length===3,'Гран-при '+gp.y+': из шести заявленных осталось '+RS.entries.length);
  RACE_ACT.rAdd({k:'car'});ok(RS.entries.length===3,'четвёртую не добавить');}
// 4) менеджер команды — в пределах регламента
G.y=pv.y;const M=managerPlan(G,pv);ok(M&&M.entries.length>=1&&M.entries.length<=Math.min(4,raceRule(pv).cars),'менеджер в гонке городов: '+(M?M.entries.length:0)+' машин');
if(gp){G.y=gp.y;const L=managerLineup(G,gp,'max');ok(L&&L.entries.length<=3,'менеджер «не жалеть» в Гран-при: '+(L?L.entries.length:0)+' машин');}
// 5) мотомастерская без машин: менеджер выставляет мотоциклы — не больше предела по мотоциклам
newMotoGame('custom','fr','Мото','normal','М1');G.cash=1e6;const kk=RACES.find(r=>r.id==='klausen')||kl;
if(kk){G.y=kk.y;G.m=kk.m;const d=rivalDesign('moto',kk.y);G.models[0]=Object.assign(G.models[0],{e:d.e,g:d.g,c:d.c,k:d.k,b:d.b,w:d.w});
  for(let i=0;i<5;i++)G.models.push(Object.assign({},G.models[0],{id:50+i,name:'М'+(i+2)}));G.drivers=DRIVERS.filter(x=>x.from<=kk.y&&x.to>=kk.y).slice(0,3).map(x=>x.id);
  const L=managerLineup(G,kk,'max');ok(L&&L.entries.length>=1&&L.entries.every(e=>entryIsMoto(G,e)),'мотомастерская на Клаузене: '+(L?L.entries.length:0)+' мотоциклов');
  RS=null;openRaceSetup(kk.key);ok(/Команда · мотоциклов 1 из 4/.test(html)&&!/машин 0 из/.test(html),'заголовок у мотомастерской: '+((html.match(/Команда · [^<]*/)||[''])[0]));
  for(let k=0;k<10;k++)RACE_ACT.rAdd({k:'moto'});ok(teamCount(G,RS.entries).m===4,'мотоциклов в заявке: '+teamCount(G,RS.entries).m);}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
