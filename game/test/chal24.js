// 0.24: вызовы не только на гонках — матч один на один, спор о скорости, продажи класса (дома и на экспорт, с форой),
// пробег на надёжность; газета предлагает разные вызовы, доска — все сразу. node game/test/chal24.js
const bot=require('./bot.js');
require('./harness.js')(bot+`
Math.random=(()=>{let a=2024;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();
let fails=0;const ok=(c,m)=>{console.log((c?'  ok  ':'  FAIL ')+m);if(!c)fails++;};
const at=(y,m)=>{G.y=y;G.m=m;};
function runMatch(drive){openRaceSetup(G.chal.rc.key);if(!RS)return null;RS.mode='sim';const c0=G.cash;RACE_ACT.raceGo();return {L:lastRace,dc:G.cash-c0};}
// ---------- 1. Форд, 1901: матч на ипподроме Гросс-Пойнт против Уинтона ----------
newGame('ford','us','Форд Мотор','normal');at(1901,1);G.cash=2e5;G.rep=40;const md=G.models[0];md.status='prod';md.totalSold=200;md.launched=mi(G)-6;
let O=chalOffers(G),om=O.find(o=>o.kind==='match');
ok(!!om&&/Гросс-Пойнт/.test(om.title)&&om.C.rc.rv.n==='Winton','Форд, 1901: предложен матч — «'+(om&&om.title)+'», '+(om&&om.sub));
ok(om&&om.C.rc.rv.dn==='Александр Уинтон','за руль у Winton сядет сам Александр Уинтон ('+(om&&om.C.rc.rv.dn)+')');
G.pending=[];boardTake(G,'match');const C1=G.chal;ok(C1&&C1.acc&&C1.type==='match','вызов взят с доски: '+(C1&&C1.type));
const T1=(C1.rc.y-1895)*12+C1.rc.m;ok(!/Выставить машину/.test(chalCard(G,'race'))||mi(G)>=T1-1,'до открытия записи кнопки нет');
while(mi(G)<T1-1){G.pending=[];step();}
ok(/Выставить машину/.test(chalCard(G,'race')),'запись открыта: '+dstr(G)+' — на вкладке «Гонки» кнопка «Выставить машину»');
ok(/⚔️/.test(nextStep(G).icon)&&/Матч-гонка/.test(nextStep(G).text),'«Дальше» на витрине зовёт на матч: '+nextStep(G).text);
G.pending=[];const R1=runMatch();
ok(R1&&R1.L&&R1.L.rc.match&&R1.L.res.length===2,'матч проведён: на трассе двое — '+(R1&&R1.L.res.map(r=>(r.you?'вы':r.name)+' '+(r.dnf?'сход':r.pos)).join(', ')));
ok(!G.chal,'вызов закрыт после матча');
const sc1=G.pending.find(e=>e.duel);ok(!!sc1&&sc1.duel.match&&/Средняя скорость|Скорость/.test(duelHTML(sc1.duel)),'сцена развязки со скоростями: '+(sc1&&sc1.title));
ok(G.pending.some(e=>e.paper&&/Спорт и дела/.test(e.kicker)),'газета о матче');
const win1=R1.L.best===1;ok(win1?R1.dc>0:R1.dc<0,'касса: '+(R1.dc>=0?'+':'')+Math.round(R1.dc)+(win1?' (выигрыш '+C1.stake+' + сбор '+C1.rc.purse+' − подготовка)':' (проигрыш '+C1.stake+' и подготовка)'));
ok(!G.raceLog.some(r=>r.key===C1.rc.key)&&!champsOf(C1.rc.y).some(id=>(G.season[champKey(id,C1.rc.y)]||{races:[]}).races.includes(C1.rc.key)),'матч не идёт в зачёт сезона и в счёт побед в гонках');
// реванш после победы
// 0.25: реванш просит проигравший — выиграли вы: «Дать … отыграться»; проиграли: «Потребовать реванша»
{const rb=sc1.choices.find(c=>c[1]==='chalRev');ok(!!rb&&(win1?/отыграться/.test(rb[0]):/Потребовать реванша/.test(rb[0])),'кнопка реванша по смыслу: «'+(rb&&rb[0])+'»');
 if(rb){G.pending=[sc1];resolve('chalRev');ok(G.chal&&G.chal.type==='match'&&G.chal.stake>C1.stake&&G.chal.acc,'реванш: новый матч со ставкой '+(G.chal&&G.chal.stake)+' > '+C1.stake);G.chal=null;}}
// ---------- 2. неявка на матч: пари проиграно ----------
at(1902,1);G.chal=null;G.pending=[];const om2=chalOffers(G).find(o=>o.kind==='match');boardTake(G,'match');const C2=G.chal,c20=G.cash,T2=(C2.rc.y-1895)*12+C2.rc.m;
while(mi(G)<=T2){G.pending=[];step();}
ok(!G.chal&&G.pending.some(e=>e.duel&&e.duel.forfeit),'не приехали на матч ('+C2.rc.venue+', '+MONTHS[C2.rc.m]+'): пари проиграно, сцена «не явилась»');
// ---------- 3. сохранение с принятым матчем ----------
at(1903,1);G.chal=null;G.pending=[];boardTake(G,'match');const sv=JSON.parse(JSON.stringify(G));G=sv;ok(raceByKey(G.chal.rc.key)&&raceByKey(G.chal.rc.key).match,'после сохранения матч находится по ключу');G.chal=null;
// ---------- 4. Рено, 1899: спор о скорости в парке Ашер ----------
newGame('renault','fr','Рено','normal');at(1899,1);G.cash=1e5;const mr=G.models[0];mr.status='prod';mr.totalSold=50;
const orc=chalOffers(G).find(o=>o.kind==='record');ok(!!orc&&/Ашер/.test(orc.title)&&!/Гайон/.test(orc.title),'Рено, 1899: спор о скорости — «'+(orc&&orc.title)+'» (трёхсильную машину в гору не зовут)');
boardTake(G,'record');const C4=G.chal,T4=(C4.rc.y-1895)*12+C4.rc.m;while(mi(G)<T4-1){G.pending=[];step();}
G.pending=[];const R4=runMatch();ok(R4&&R4.L.rc.kind==='record'&&R4.L.res.length===2,'заезд на время проведён: '+R4.L.res.map(r=>(r.you?'вы':r.name)+' '+(r.dnf?'сход':Math.round(C4.rc.km/(r.fin*R4.L.k/3600))+' км/ч')).join(', '));
ok(R4.L.vMe>20&&R4.L.vMe<200,'скорость на заезде правдоподобна: '+R4.L.vMe+' км/ч');
const lsr=lsrAt(1899,5);ok(lsr&&lsr[1]===105.88,'мировой рекорд к маю 1899: '+(lsr&&lsr[1])+' км/ч — '+(lsr&&lsr[2]));
// ---------- 5. продажи класса: помесячный счёт, итог в срок ----------
newGame('ford','us','Форд Мотор','normal');G.cash+=40000;
for(let i=0;i<12*16+3;i++){G.pending=[];botMonth('grow');if(i===30){G.dealers.uk=(G.dealers.uk||0)+4;if(!impLv(G,'uk'))impUp(G,'uk');}G.chal=null;step();}
G.pending=[];const os=chalOffers(G).find(o=>o.kind==='sales');ok(!!os,'Форд, '+dstr(G)+': вызов по продажам — «'+(os&&os.title)+'» · '+(os&&os.sub));
boardTake(G,'sales');const C5=G.chal,e5=C5.end;ok(C5&&C5.mon&&C5.start===mi(G),'пари по продажам: с '+dstr(G)+' до '+miDate(e5-1)+(C5.hc!==1?' · фора ×'+C5.hc:''));
let res5=null;for(let k=0;k<14&&G.chal;k++){G.pending=[];botMonth('grow');const c=G.chal;step();if(!G.chal){res5=G.pending.find(e=>e.duel);break;}if(k===0)ok(c.you>0&&c.them>0,'счёт идёт каждый месяц: вы '+Math.round(c.you)+', '+c.mq+' '+Math.round(c.them));}
ok(!!res5&&res5.duel.sales&&mi(G)===e5,'итог пари в срок ('+dstr(G)+'): '+(res5&&res5.title)+' — '+(res5&&('вы '+res5.duel.sales.you+', они '+res5.duel.sales.them+(res5.duel.sales.hc!==1?' ×'+res5.duel.sales.hc:''))));
// ---------- 6. экспорт: продажи на чужом рынке ----------
G.chal=null;G.pending=[];const oe=chalOffers(G).find(o=>o.kind==='export');ok(!!oe&&oe.C.c!==G.country,'экспортный вызов: «'+(oe&&oe.title)+'» · '+(oe&&oe.sub));
if(oe){boardTake(G,'export');const C6=G.chal;let r6=null;for(let k=0;k<14&&G.chal;k++){G.pending=[];botMonth('grow');step();if(!G.chal){r6=G.pending.find(e=>e.duel);break;}}
  ok(!!r6&&r6.duel.sales&&r6.duel.sales.c===C6.c&&new RegExp(COUNTRIES[C6.c].name).test(duelHTML(r6.duel)),'итог экспортного пари — в сцене страна: '+(r6&&r6.title));}
// ---------- 7. пробег на надёжность ----------
G.chal=null;G.pending=[];const ot=chalOffers(G).find(o=>o.kind==='trial');ok(!!ot,'пробег: «'+(ot&&ot.title)+'» · '+(ot&&ot.sub));
if(ot){boardTake(G,'trial');const C7=G.chal;ok(/Пробег на надёжность/.test(chalCard(G,'market')),'карточка пробега на «Рынке»: машина и соперник');
  let r7=null;for(let k=0;k<4&&G.chal;k++){G.pending=[];step();if(!G.chal){r7=G.pending.find(e=>e.duel);break;}}
  ok(!!r7&&r7.duel.trial&&r7.duel.trial.rows.length>=3&&/Этап/.test(duelHTML(r7.duel)),'итог пробега: '+(r7&&r7.title)+' — поломок: вы '+(r7&&r7.duel.trial.pM)+', они '+(r7&&r7.duel.trial.pT));}
// честность пробега: надёжная машина чаще выигрывает
{const s=G,C={km:1600,route:'тест'},a=s.models.find(m=>m.status==='prod'),b={...rivalCar('people',s.y)[2],t:'t0',paint:'#333',name:'',made:0,ai:1};let w=0;for(let i=0;i<400;i++)if(trialSim(s,C,a,b).win)w++;
  console.log('   пробег 1600 км: ваша «'+a.name+'» (надёжность '+Math.round(carBase(a,0,s.y).rel*100)+'%) против типичной ('+Math.round(carBase(b,0,s.y).rel*100)+'%): побед '+w+' из 400');ok(w>40&&w<380,'исход пробега не предрешён');}
// ---------- 8. газета: разные вызовы ----------
{const kinds={};for(let i=0;i<60;i++){G.chal=null;G.pending=[];G.chalLast=-99;chalCheck(G);if(G.chal){kinds[G.chalKind]=(kinds[G.chalKind]||0)+1;const ev=G.pending.find(e=>e.kicker==='Вызов');if(i<6&&ev)console.log('   газета: '+ev.title+' — '+ev.deck);}if(i%5===4){G.pending=[];step();}}
  console.log('   виды вызовов в газетах: '+JSON.stringify(kinds));ok(Object.keys(kinds).length>=4,'газеты предлагают разные вызовы ('+Object.keys(kinds).length+' видов)');}
// ---------- 9. старое сохранение: пари по продажам до конца года — по-старому ----------
G.chal={type:'sales',g:'people',mq:'Chevrolet',ci:0,y:G.y,stake:1000,acc:1,y0:0,r0:0};ok(/Вызов по продажам/.test(chalCard(G,'market'))&&chalWhere(G.chal)==='market','старое пари по продажам показывается как раньше');G.chal=null;
// ---------- 10. доска вызовов ----------
{const h=boardCard(G);ok(/Доска вызовов/.test(h)&&(h.match(/data-act="boardTake"/g)||[]).length>=3,'на доске — несколько видов пари: '+(h.match(/data-act="boardTake"/g)||[]).length);}
console.log(fails?'ОШИБОК: '+fails:'всё в порядке');
`);
