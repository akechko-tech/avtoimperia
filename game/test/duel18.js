// ТЗ 0.18, раздел 1: 20 пари подряд — сцена развязки, газета со снимком, счёт соперничества, трофей, спрос в стране соперника,
// реванш с повышенной ставкой, дилеры после трёх побед подряд, добавки к ставке. node test/duel18.js
require('./harness.js')(`
Math.random=(()=>{let a=4242;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
newGame('renault','fr','Рено','normal');G.y=1906;G.m=2;G.cash=5e5;G.rep=50;
// машина в продаже: чтобы в газете был снимок
G.models[0].status='prod';G.models[0].totalSold=500;
const md=G.models[0];
// персонажи: у каждого типа — не меньше 6 реплик
Object.keys(HERO_LINES).forEach(t=>{const n=Object.values(HERO_LINES[t]).reduce((a,L)=>a+L.length,0);ok(n>=6,'у героя «'+t+'» '+n+' реплик (нужно ≥6)');});
ok(Object.keys(HERO_OWN).length===10&&Object.values(HERO_OWN).every(o=>['dign','angry','revenge','respect','rage','mock'].every(k=>o[k])),'у каждой из 10 марок-героев свой набор: 6 случаев');
Object.keys(HERO_OWN).forEach(pk=>{const n=Object.keys(HERO_OWN[pk]).length+Object.values(HERO_LINES[HERO_TYPE[pk]]).reduce((a,L)=>a+L.length,0);if(n<6)ok(false,pk+': меньше 6 реплик');});
const heroes=['Fiat','Mercedes','Peugeot','Panhard','De Dietrich','Darracq'].map(m=>rivalHero(m,G));
console.log('   герои: '+heroes.map(H=>H.mq+' → '+H.name+' ('+H.type+', '+H.c+')').join('; '));
ok(new Set(heroes.map(H=>H.type)).size>=3,'соперники разного характера');
const rcs=RACES.filter(r=>r.y>=1906&&r.y<=1912&&!GBC_IDS.includes(r.id)).slice(0,40);
function raceRes(C,win,forfeit){const rc=RACES.find(r=>r.key===C.rk);
  const me={pos:win?1:3,name:G.company,you:true,label:md.name,md,drvId:'me',prep:2,num:7},them={pos:win?2:1,name:C.mq,you:false,label:C.mq,drv:'Пилот'};
  return [me,them].sort((a,b)=>a.pos-b.pos);}
// сценарий: 20 пари (гонки, продажи, неявка), с серией из трёх побед над Fiat
const PLAN=[['race','Fiat',1],['race','Fiat',1],['race','Fiat',1],['race','Mercedes',0],['sales','Peugeot',1],['race','Peugeot',0],['race','Mercedes',1],['sales','Panhard',0],
  ['race','Fiat',0],['race','Darracq',1],['forfeit','Mercedes',0],['sales','Peugeot',1],['race','De Dietrich',1],['race','Fiat',1],['sales','Panhard',1],['race','Mercedes',1],
  ['race','Mercedes',1],['race','Peugeot',1],['forfeit','Darracq',0],['sales','Peugeot',0]];
let scenes=0,paperOk=0,photo=0,dealersEv=0,reelsBig=0,lines=new Set(),trophies0=(G.trophies||[]).length,extras={},revOk=0,revSales=0,legB=0;
PLAN.forEach(([type,mq,win],i)=>{G.pending=[];const ri=i%rcs.length,rc=rcs[ri];G.y=Math.max(G.y,rc.y);
  const stake=500+i*150,before=G.cash;let C;
  if(type==='sales'){const cps=COMPS.fr.map((cp,ci)=>({cp,ci})).filter(x=>x.cp.n===mq||compName(x.cp,G)===mq);const ci=cps.length?cps[0].ci:0;
    C=G.chal={type:'sales',g:'people',mq,ci,y:G.y,stake,acc:1,y0:0,r0:0,x:stakeExtra(G,mq,'t'+i)};
    G.segYPrev={people:win?900:300};G.comps.fr=G.comps.fr||[];G.comps.fr[ci]=G.comps.fr[ci]||{};G.comps.fr[ci].ysPrev={people:win?400:800};chalSales(G,G.y);}
  else{C=G.chal={type:'race',rk:rc.key,mq,stake,acc:1,x:stakeExtra(G,mq,'t'+i)};delete G.cres[rc.key];G.raceDone[rc.key]=undefined;
    if(type==='forfeit')chalForfeit(G,rc);else chalRace(G,rc,raceRes(C,win));}
  if(C.x)extras[C.x.k]=(extras[C.x.k]||0)+1;
  const sc=G.pending.find(e=>e.duel),pp=G.pending.find(e=>e.paper&&/Спорт и дела/.test(e.kicker));
  if(sc){scenes++;lines.add(sc.duel.line);const h=duelHTML(sc.duel);if(!h.includes(sc.duel.H.name)||!h.includes('Счёт'))console.log('   сцена без имени/счёта',i);
    if(!(sc.duel.score&&/\\d+:\\d+/.test(sc.duel.score)))console.log('   нет счёта',i);}
  if(pp){paperOk++;if(pp.carId!=null)photo++;if(pp.choices.some(c=>/^reel:/.test(c[1])))reelsBig++;}
  if(G.pending.some(e=>e.dc))dealersEv++;
  const R=rivalryPeek(G,mq);
  console.log('   '+String(i+1).padStart(2)+'. '+type.padEnd(7)+' '+mq.padEnd(11)+(win?'победа ':'пораж. ')+'ставка '+stakeText(C).padEnd(30)+' счёт '+(R?R.w+':'+R.l+' (серия '+R.st+')':'—')+
    ' | касса '+(G.cash-before>=0?'+':'')+Math.round(G.cash-before)+' | «'+(sc?sc.duel.line.slice(0,48):'—')+'…»');
  // выбор в сцене: реванш после каждой второй победы
  if(sc){const rev=sc.choices.find(c=>c[1]==='chalRev');if(rev&&i%2===0&&type!=='forfeit'){G.pending=[sc];resolve('chalRev');if(type==='race'&&G.chal&&G.chal.acc&&G.chal.stake>stake)revOk++;if(type==='sales'&&G.revPending&&G.revPending.stake>stake){revSales++;const y0=G.y;G.y=G.revPending.y;G.m=1;const was=G.chal;G.chal=null;duelRevTick(G);if(G.chal&&G.chal.type==='sales'&&G.chal.acc)revSales++;G.chal=null;G.y=y0;}G.chal=null;}}
  G.revOffer=null;G.revPending=null;G.chal=null;G.m=(G.m+1)%12;
});
const wins=PLAN.filter(p=>p[2]).length,TCH=(G.trophies||[]).filter(t=>t.kind==="charter");
ok(scenes===20,'сцена развязки после каждого из 20 пари ('+scenes+')');
ok(paperOk===20,'газета после каждого пари ('+paperOk+')');
ok(photo===20,'в газете снимок машины ('+photo+'/20)');
ok(TCH.length===wins,"грамота за каждое выигранное пари: "+TCH.length+' из '+wins);
ok(lines.size>=10,'реплики не повторяются однообразно: '+lines.size+' разных');
ok(dealersEv>=1,'после трёх побед подряд дилеры соперника просятся к вам ('+dealersEv+')');
ok(revOk>=1,'реванш на гонке — со ставкой выше ('+revOk+')');
ok(revSales>=2,'реванш по продажам начинается в свой год ('+revSales+')');
const RF=rivalryPeek(G,'Fiat');ok(RF&&RF.w===4&&RF.l===1,'счёт с Fiat 4:1 ('+(RF?RF.w+':'+RF.l:'—')+')');
ok(rivalryTxt(G,'Fiat')==='Вы — Fiat 4:1','строка счёта: '+rivalryTxt(G,'Fiat'));
console.log('   добавки к ставкам: '+JSON.stringify(extras));
ok(Object.keys(extras).length>=2,'ставки бывают не только деньгами');
// спрос в стране соперника: +4% на 3 месяца
G.duelFx=[];G.y=1910;G.m=3;const H=rivalHero('Fiat',G),c=H.c,u0=modelExtras(md,c,G);
duelOutcome(G,{type:'race',rk:rcs[0].key,mq:'Fiat',stake:800},true,{});const u1=modelExtras(md,c,G);
ok(u1-u0>0.03&&u1-u0<=0.04+1e-9,'после победы спрос в стране соперника ('+c+') +4% (с потолком славы 0.30 — '+(u1-u0).toFixed(3)+')');
G.m+=2;ok(duelEffect(G,c)>0.039,'через 2 месяца ещё действует');G.m+=1;ok(duelEffect(G,c)===0,'через 3 месяца эффект прошёл');G.m=3;G.duelFx=[];
duelOutcome(G,{type:'race',rk:rcs[0].key,mq:'Fiat',stake:800},false,{});ok(modelExtras(md,c,G)-u0<-0.03,'после поражения — минус');
// добавки к ставке работают
G.duelFx=[];const L0=playerLegacy(G).total;stakeApply(G,{stake:1000,x:{k:'legacy'}},H);ok(Math.abs(playerLegacy(G).total-L0-30)<1e-6,'очки наследия из пари: +30');
G.rd.projs=[{kind:'upg',id:'e1',name:'Проект',need:20,prog:2}];stakeApply(G,{stake:1000,x:{k:'bp'}},H);ok(G.rd.projs[0].need===14,'чертежи соперника: КБ на 30% быстрее ('+G.rd.projs[0].need+')');
const d0=dealerCount(G,c);stakeApply(G,{stake:1000,x:{k:'dealer'}},H);ok(dealerCount(G,c)===d0+2,'дилеры соперника переходят к вам');
// витрина и кабинет
const html=empireStrip(G);ok(/место в наследии/.test(html)&&/Дальше:/.test(html)&&/ec-badges/.test(html),'витрина «Империя» собирается');
ok(/Пари с|Победа|Первыми|Гонщик/.test(html),'в витрине — последний триумф');
const cab=trophyCabinetCard(G);ok(/tro-shelf/.test(cab)&&(cab.match(/data-act="trophy"/g)||[]).length===(G.trophies||[]).length,'кабинет трофеев: полки по годам ('+(G.trophies||[]).length+')');
const th=trophyHTML(G.trophies[0]);ok(/Пересмотреть|Закрыть/.test(th)&&/tro-big/.test(th),'трофей открывается: дата, история, «пересмотреть»');
// 3 победы подряд → вспышка витрины при новом трофее
empireStrip(G);trophyAdd(G,{kind:'cup',title:'Тест',key:'t1'});empireStrip(G);ok(EC_FLASH===true,'новый трофей — витрина вспыхивает');empireStrip(G);ok(EC_FLASH===false,'вспышка один раз');
// цель года: сцена развязки и при успехе, и при провале
G.pending=[];G.goals=[{k:'race',y:G.y,reward:1500,name:'Король гонок '+G.y},{k:'people',y:G.y,reward:2500,name:'Народный король '+G.y}];
goalsResolve(G,G.y,['Король гонок'],{race:G.company,people:'Peugeot'});
const gs=G.pending.filter(e=>e.duel&&e.duel.goal);ok(gs.length===2&&gs[0].duel.win&&!gs[1].duel.win&&/Пежо/.test(gs[1].duel.H.name),'цели года: сцена «выполнена» и «не выполнена» (титул забрал Peugeot)');
ok(/Цель выполнена/.test(duelHTML(gs[0].duel))&&/Титул забрал/.test(duelHTML(gs[1].duel)),'сцены целей года собираются');
ok((G.trophies||[]).some(t=>t.kind==='goal'),'трофей за выполненную цель года');
// сохранение: поля нового пари не теряются
const js=JSON.stringify(G);const G2=JSON.parse(js);ok(G2.rivalry&&G2.trophies&&G2.trophies.length===G.trophies.length,'счёт и трофеи сохраняются');
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
