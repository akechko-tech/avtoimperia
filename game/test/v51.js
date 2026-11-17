// 0.51: господство — доля за последние десять лет (решение автора по итогам этапа 1 ТЗ 0.51)
require('./harness.js')(`
let ok=0,bad=0;const CK=(c,m)=>{if(c)ok++;else{bad++;console.log("FAIL",m);}};
const near=(a,b,e)=>Math.abs(a-b)<=(e||1e-6);
function fresh(y){newGame('custom','us','Тест','normal','Первая');G.y=y;G.m=0;const W=worldInit(G);W.since=0;return W;}
// мир: накоплено всего и у одной компании; у игрока — через W.my
function setWorld(W,o){W.hp=o.hp;W.rev=o.rev;W.sport=o.sport;W.firsts=o.firsts;W.cu={us:o.cl};W.my.hp=o.myHp;W.my.rev=o.myRev;W.my.sport=o.mySport;W.my.air=0;W.my.cu={us:o.myCl};
  W.co={Rival:{c:'us',hp:o.rHp,rev:o.rRev,sport:o.rSport,firsts:o.rFirsts,r12:o.rR12||0,cu:{us:o.rCl}}};}
// 1. молодая партия: снимков нет — доля с начала, как раньше
{const W=fresh(1903);setWorld(W,{hp:1e7,rev:1e9,sport:200,firsts:30,cl:1e6,myHp:2e6,myRev:2e8,mySport:50,myCl:2e5,rHp:3e6,rRev:3e8,rSport:60,rFirsts:10,rCl:3e5});
  const D=domTable(G);CK(D&&near(D.scale.share,0.2),'молодая партия: доля с начала '+(D&&D.scale.share));CK(D.scale.win===false&&D.scale.flow===true,'окна ещё нет');CK(domBase(G)===null,'domBase пуст');
  CK(near(D.scale.mineW,2e6)&&near(D.scale.worldW,1e7),'mineW/worldW = накопленное');}
// 2. снимок: годовой, хранит мир, игрока и компании; старые годы уходят
{const W=fresh(1905);setWorld(W,{hp:1e7,rev:1e9,sport:200,firsts:30,cl:1e6,myHp:2e6,myRev:2e8,mySport:50,myCl:2e5,rHp:3e6,rRev:3e8,rSport:60,rFirsts:10,rCl:3e5});
  worldSnap(G);const S=W.sn[1905];CK(S&&S.t[0]===1e7&&S.me[0]===2e6&&S.co.Rival[0]===3e6,'снимок 1905');CK(S.t.length===5&&S.me.length===5,'пять чисел');
  CK(S.t[3]===30+firstsLive(G),'первенства мира = история + ваши');
  for(let y=1906;y<=1920;y++){G.y=y;worldSnap(G);}CK(!W.sn[1905]&&!W.sn[1908]&&!!W.sn[1909]&&!!W.sn[1920],'хранится 12 лет: '+Object.keys(W.sn).join());}
// 3. окно: за десять лет у игрока 60 % мира, хотя с начала — 20 %
{const W=fresh(1909);setWorld(W,{hp:8e6,rev:8e8,sport:100,firsts:20,cl:8e5,myHp:0,myRev:0,mySport:0,myCl:0,rHp:4e6,rRev:4e8,rSport:50,rFirsts:8,rCl:4e5});
  worldSnap(G);G.y=1910;worldSnap(G);   // 1909 и 1910: мир стоит на месте, игрока нет
  G.y=1920;G.m=0;setWorld(W,{hp:1e7,rev:1e9,sport:200,firsts:30,cl:1e6,myHp:1.2e6,myRev:1.2e8,mySport:60,myCl:1.2e5,rHp:4.5e6,rRev:4.5e8,rSport:70,rFirsts:9,rCl:4.5e5});
  const D=domTable(G);CK(D.scale.win===true,'окно есть');CK(near(D.scale.mineW,1.2e6)&&near(D.scale.worldW,2e6),'за десять лет: 1,2 из 2 млн л. с. '+D.scale.mineW+'/'+D.scale.worldW);
  CK(near(D.scale.share,0.6),'доля за десять лет 60 %: '+D.scale.share);CK(near(D.scale.mine,1.2e6)&&near(D.scale.world,1e7),'накопленное — отдельно');
  CK(near(D.sport.share,0.6)&&near(D.market.share,0.6)&&near(D.brand.share,0.6),'спорт, рынок, бренд — тоже за десять лет');
  CK(D.scale.lead.n==='Rival'&&near(D.scale.lead.v,5e5)&&near(D.scale.leadShare,0.25),'соперник — тоже за десять лет: '+D.scale.lead.v);
  CK(D.scale.domOk===true,'половина мира за десять лет');CK(D.scale.histOk===false&&D.scale.ok===false,'рекорд эпохи — по накопленному: не пройден');
  CK(D.capital.flow===false&&D.capital.win===false,'капитал — без окна');
  // 4. середина года: начало окна — между снимками
  G.y=1919;G.m=6;W.sn[1908]={t:[6e6,6e8,80,16,6e5],me:[0,0,0,0,0],co:{Rival:[3e6,3e8,40,6,3e5]}};const B=domBase(G);
  CK(B&&near(B.t[0],7e6)&&near(B.co('Rival')[0],3.5e6),'середина года: между снимками 1908 и 1909: '+(B&&B.t[0]));
  CK(near(domTable(G).scale.worldW,3e6),'мир за десять лет с середины 1909-го: '+domTable(G).scale.worldW);}
// 5. победа: две категории — половина за десять лет и итог выше рекорда эпохи
{const E=histEra(),W=fresh(1909);setWorld(W,{hp:8e6,rev:8e8,sport:900,firsts:20,cl:8e5,myHp:0,myRev:0,mySport:0,myCl:0,rHp:4e6,rRev:4e8,rSport:300,rFirsts:8,rCl:4e5});
  worldSnap(G);G.y=1910;worldSnap(G);G.y=1920;G.m=0;G.pending=[];
  // спорт: с начала 500 из 1500 (33 %), за десять лет 500 из 600 (83 %), рекорд эпохи 378 — пройден
  setWorld(W,{hp:1e7,rev:1e9,sport:1500,firsts:20,cl:1e6,myHp:1e5,myRev:1e7,mySport:500,myCl:1e4,rHp:4.5e6,rRev:4.5e8,rSport:350,rFirsts:8,rCl:4.5e5});
  let D=domTable(G);CK(D.sport.ok===true,'спорт: господство ('+Math.round(D.sport.share*100)+' % за десять лет, с начала '+Math.round(500/1500*100)+' %)');
  domCheck(G);CK(!G.dom,'одной категории мало');
  // вторая категория — бренд: клиентов за десять лет больше половины, но рекорд эпохи не пройден
  W.my.cu={us:5e5};W.cu={us:1.5e6};D=domTable(G);CK(D.brand.domOk&&!D.brand.histOk,'бренд: половина есть, рекорда нет');domCheck(G);CK(!G.dom,'без рекорда эпохи победы нет');
  // рекорд пройден
  W.my.cu={us:E.best.brand.v+1e6};W.cu={us:E.best.brand.v*1.5+2e6};D=domTable(G);CK(D.brand.ok,'бренд: оба условия');domCheck(G);CK(G.dom&&G.dom.ks.join()==='sport,brand','победа: '+(G.dom&&G.dom.ks.join()));
  const ev=G.pending.find(e=>/господствует/.test(e.title||''));CK(ev&&/за десять лет/.test(ev.deck)&&/за последние десять лет/.test(ev.text),'газета о победе говорит о десяти годах');
  const H=domCard(G);CK(/за последние десять лет/.test(H)&&/за десять лет — вы/.test(H),'карточка «Господство»: правило и числа за десять лет');CK(!/с первого дня компании, считая всех/.test(H),'старого текста нет');}
// 6. живой соперник побеждает по тому же правилу
{const E=histEra(),W=fresh(1909);setWorld(W,{hp:8e6,rev:8e8,sport:900,firsts:20,cl:8e5,myHp:0,myRev:0,mySport:0,myCl:0,rHp:4e6,rRev:4e8,rSport:300,rFirsts:8,rCl:4e5});
  worldSnap(G);G.y=1910;worldSnap(G);G.y=1920;G.m=0;G.bots={Rival:{n:'Rival',c:'us'}};
  setWorld(W,{hp:1e7,rev:1e9,sport:1500,firsts:20,cl:E.best.brand.v*2,myHp:1e5,myRev:1e7,mySport:10,myCl:1e4,rHp:4.5e6,rRev:4.5e8,rSport:800,rFirsts:8,rCl:E.best.brand.v*1.5});
  const b=domBots(G);CK(b&&b.n==='Rival'&&b.ks.join()==='sport,brand','соперник господствует: '+(b&&b.ks.join()));
  // у соперника много с начала, но за десять лет — мало: не господствует
  W.sn[1909].co.Rival=[4e6,4e8,790,8,E.best.brand.v*1.45];W.sn[1910].co.Rival=[4e6,4e8,790,8,E.best.brand.v*1.45];CK(domBots(G)===null,'старые заслуги не считаются');}
// 7. сохранение без снимков (до 0.51): счёт с начала, снимки копятся с первого декабря
{const W=fresh(1920);setWorld(W,{hp:1e7,rev:1e9,sport:200,firsts:30,cl:1e6,myHp:2e6,myRev:2e8,mySport:50,myCl:2e5,rHp:3e6,rRev:3e8,rSport:60,rFirsts:10,rCl:3e5});
  CK(near(domTable(G).scale.share,0.2)&&!W.sn,'старое сохранение: доля с начала');const J=JSON.parse(JSON.stringify(G.world));worldSnap(G);CK(JSON.stringify(G.world).length-JSON.stringify(J).length<400,'снимок мал');}
// 8. настоящая партия: снимки берутся сами в декабре, окно включается на одиннадцатый год
{Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();newGame('custom','fr','Тест','normal','Первая');G.helper={on:1};
  for(let k=0;k<12*12+2;k++){let g=0;while(G.pending.length&&g++<30)resolve(G.pending[0].choices[0][1]);if(G.over||!step())break;}
  const W=G.world,ys=Object.keys(W.sn||{}).map(Number);CK(ys.length>=10&&ys.includes(1895)&&ys.includes(1905),'снимки по годам: '+ys.join());
  const D=domTable(G);CK(D.scale.win===true&&D.scale.worldW<D.scale.world&&D.scale.worldW>0,'окно включилось: мир за десять лет '+Math.round(D.scale.worldW)+' < с начала '+Math.round(D.scale.world));
  CK(Object.keys(W.sn).length<=12,'не больше двенадцати снимков');CK(JSON.stringify(W.sn).length<120000,'снимки в сохранении: '+JSON.stringify(W.sn).length+' байт');}

// ================= этап 2: убывающая полезность, цена, содержание по масштабу, оснастка =================
// 9. полезность черты: у нормы 0, сверх нормы тает и упирается в предел, ниже порога — обвал
{const L=Math.log;CK(traitU(1,0.6,1.5)===0,'у нормы полезность 0');CK(near(traitU(1.05,0.6,1.5),L(1.05),0.002)&&near(traitU(0.9,0.6,1.5),L(0.9),1e-9),'возле нормы — как раньше (логарифм отношения)');
  CK(traitU(2,0.6,1.5)<L(1.5)&&traitU(4,0.6,1.5)<L(1.5)&&traitU(4,0.6,1.5)>traitU(2,0.6,1.5),'сверх нормы растёт, но не выше предела ln 1,5: '+traitU(4,0.6,1.5).toFixed(3));
  CK(traitU(2,0.6,1.5)-traitU(1.5,0.6,1.5)<traitU(1.5,0.6,1.5)-traitU(1,0.6,1.5),'каждая следующая прибавка меньше предыдущей');
  CK(near(traitU(0.6,0.6,1.5),L(0.6),1e-9)&&near(traitU(0.5,0.6,1.5),L(0.6)+3*(L(0.5)-L(0.6)),1e-9),'ниже порога каждая потеря втрое дороже');
  CK(traitZone(0.5,0.6,1.5)==='low'&&traitZone(0.8,0.6,1.5)==='below'&&traitZone(1,0.6,1.5)==='norm'&&traitZone(1.2,0.6,1.5)==='above'&&traitZone(1.6,0.6,1.5)==='sat','области: ниже порога, ниже нормы, норма, лучше нормы, с запасом');
  CK(charSat('people','perf')===1.35&&charSat('sport','perf')===2.5&&charSat('middle','perf')===1.5&&charThr('truck','perf')===0.7&&charThr('people','perf')===0.6,'пределы и пороги — по классу');}
// 10. оценка модели: у машины соперника 1; запас по чертам не даёт преимущества без предела
{newGame('custom','us','Тест','normal','Первая');G.y=1912;G.m=0;const md=autoDesign('people',G),C=classCompare(md,G);
  CK(C.u&&C.zone&&CHAR_K.every(k=>typeof C.u[k]==='number'&&ZONE_N[C.zone[k]]),'у каждой черты — полезность и область');
  const ref=rivalRef(md,G.y).md,Cr=classCompare(ref,G);CK(near(Cr.S,1,0.02),'машина соперника против себя: '+Cr.S.toFixed(3));
  let lnOld=0,lnNew=0;CHAR_K.forEach(k=>{if(C.W[k]){lnOld+=C.W[k]*Math.log(C.by[k]);lnNew+=C.W[k]*C.u[k];}});
  const cap=Math.exp(CHAR_K.reduce((a,k)=>a+(C.W[k]||0)*Math.log(charSat('people',k)),0));CK(cap<1.6,'потолок оценки народной машины по чертам: '+cap.toFixed(2));
  // черты «вчетверо лучше нормы» по всем статьям: раньше ×4, теперь не выше потолка
  const W=C.W;let top=0;CHAR_K.forEach(k=>{top+=(W[k]||0)*traitU(4,charThr('people',k),charSat('people',k));});CK(Math.exp(top)<cap&&Math.exp(top)>1.3,'всё вчетверо лучше нормы → '+Math.exp(top).toFixed(2)+' (раньше 4,00)');
  const D=xScoreData(md,G),prod=D.L.concat(D.X).reduce((a,r)=>a*r.f,1);CK(near(prod,D.S,0.003*D.S),'разбор «Как посчитано» сходится с оценкой: '+prod.toFixed(4)+' / '+D.S.toFixed(4));
  CK(D.L.every(r=>/норм|порог|запас/.test(r.sa)),'в разборе у каждой черты названа область');
  const H=compareHTML(md,G,null);CK(/«С запасом» — лучше уже не ценят/.test(H),'таблица сравнения объясняет области');}
// 11. цена: у цены класса как раньше, ниже — тает, предел
{CK(priceU(1)===0&&near(priceU(1.3),Math.log(1.3),1e-12),'дороже класса — как раньше');CK(near(priceU(0.95),Math.log(0.95),0.001),'чуть дешевле — как раньше');
  CK(priceU(0.5)>-PRICE_SAT&&priceU(0.2)>-PRICE_SAT&&priceU(0.2)<priceU(0.5)&&priceU(0.5)<priceU(0.7),'ниже класса выигрыш растёт, но не дальше предела');
  CK(priceU(0.7)-priceU(0.5)<(priceU(1)-priceU(0.8))*0.5,'скидка с 70 до 50 % цены класса даёт меньше половины того, что с 100 до 80 %');
  CK(Math.exp(-BR*priceU(0.01))<2.5,'самая низкая цена даёт не больше ×'+Math.exp(BR*PRICE_SAT).toFixed(2)+' к привлекательности');}
// 12. содержание бюро и гоночного отдела — по обороту
{newGame('custom','us','Тест','normal','Первая');G.y=1915;const W=worldInit(G);W.my.r12=0;G.rd.lvl=14;const base=rdUpkeepBase(G,14);CK(rdUpkeep(G)===base,'без оборота — прежняя цена: $'+base);
  W.my.r12=120e6;CK(rdUpkeep(G)===Math.round(120e6*0.015/12),'высшая ступень бюро при обороте $120 млн — 1,5 % в год: $'+rdUpkeep(G)+' в месяц (было $'+base+')');
  G.rd.lvl=1;CK(rdUpkeep(G)===rdUpkeepBase(G,1),'первая ступень — без планки от оборота');G.rd.lvl=5;const u5=rdUpkeep(G);G.rd.lvl=9;const u9=rdUpkeep(G);G.rd.lvl=14;CK(u5<u9&&u9<rdUpkeep(G),'чем выше ступень, тем больше доля оборота');
  G.rd.lvl=8;CK(rdUpCost(G)>=rdUpkeepAt(G,9)*6-100,'расширение — не меньше полугода нового содержания');
  W.my.r12=2e5;G.rd.lvl=6;CK(rdUpkeep(G)===rdUpkeepBase(G,6),'мастерская с оборотом $200 тыс. платит по-прежнему');
  W.my.r12=120e6;G.rdept=6;CK(teamUpkeep(G)===Math.round(120e6*0.006/12),'высшая ступень гоночного отдела — 0,6 % оборота: $'+teamUpkeep(G));G.rdept=0;CK(teamUpkeep(G)===0,'нет отдела — нет расходов');
  G.rdept=2;CK(rdeptCost(G)>=teamUpkeepAt(G,3)*6-50,'расширение отдела — не меньше полугода содержания');
  // сократить можно
  G.rd.lvl=9;G.rd.projs=[];ACT.rdDown();CK(G.rd.lvl===8,'бюро сокращено на ступень');G.rd.lvl=1;ACT.rdDown();CK(G.rd.lvl===1,'ниже первой ступени нельзя');
  G.rdept=3;RACE_ACT.rdeptDown();CK(G.rdept===2,'гоночный отдел сокращён');
  G.rd.lvl=6;G.rd.projs=[];for(let i=0;i<rdSlots(G);i++)G.rd.projs.push({kind:'eq',id:'x'+i,need:10,prog:0,w:1});const n0=rdSlots(G);G.rd.lvl=6;ACT.rdDown();const blocked=G.rd.lvl===6||rdActive(G).length<=rdSlots(G);CK(blocked,'сократить бюро нельзя, пока проектов больше, чем мест: уровень '+G.rd.lvl+', мест '+rdSlots(G)+' из '+n0);G.rd.projs=[];}
// 13. оснастка — по масштабу завода и новизне
{newGame('custom','us','Тест','normal','Первая');G.y=1915;G.m=0;G.cap=5000;const md=autoDesign('people',G);
  G.models=[];G.plantVal=0;CK(toolingCost(md,G)===toolingBase(md,G),'первая модель, завода нет — прежняя цена: $'+toolingBase(md,G));
  G.plantVal=40e6;const m0={...md,id:1,status:'prod',vol:8000,launched:0},nw={...md,id:2,status:'dev',vol:0};G.models=[m0];
  CK(retoolNovelty(nw,G)===0&&toolingCost({...nw,status:'prod',vol:8000},G)===toolingBase(nw,G),'те же узлы, что у модели в серии, — новизны нет, оснастка прежняя');
  const E=ENGINES.filter(e=>!e.moto&&e.id!==md.e)[0],B=BODIES.filter(b=>!b.truck&&!b.moto&&b.id!==md.b)[0];
  const n1={...nw,e:E.id};CK(near(retoolNovelty(n1,G),0.35),'новый мотор — 35 % новизны');const n2={...nw,e:E.id,b:B.id};CK(near(retoolNovelty(n2,G),0.55),'мотор и кузов — 55 %');
  const full={...nw,e:'_e',c:'_c',b:'_b',g:'_g',k:'_k',w:'_w'};CK(near(retoolNovelty(full,G),1),'всё новое — 100 %');
  const nP={...n1,status:'prod',vol:8000},t1=toolingCost(nP,G),sh=retoolShare(nP,G);CK(sh>0.5&&sh<=1&&t1===Math.round(0.18*40e6*0.35*sh/100)*100&&t1>1e6,'новый мотор на заводе в $40 млн: $'+t1+' при '+Math.round(sh*100)+' % мощностей (база $'+toolingBase(n1,G)+')');
  const tS=toolingCost({...n1,status:'prod',vol:100},G);CK(tS<t1&&tS>=Math.round(0.18*40e6*0.35*0.1/100)*100,'малая серия — меньше, но не ниже десятой доли: $'+tS);
  G.models=[{...m0,status:'off'}];CK(near(retoolNovelty(n1,G),1),'снятая модель оснастку не бережёт');
  // настоящая смена модели в ходе месяца: деньги списаны, в журнале — переоснащение
  newGame('custom','us','Тест','normal','Первая');G.helper=null;G.pending=[];for(let k=0;k<8;k++){G.pending=[];step();}
  const a=G.models.find(m=>m.status==='prod');if(a){G.plantVal=30e6;G.cash=20e6;const E2=ENGINES.filter(e=>!e.moto&&e.id!==a.e&&(e.y||1895)<=G.y)[0]||ENGINES[1];
    const b={...a,id:G.nextId++,name:'Новая',e:E2.id,status:'dev',devLeft:1,launched:0,stock:0,made:0,totalSold:0,vol:0};G.models.push(b);const c0=G.cash;G.pending=[];step();
    CK(b.status==='prod'&&G.last.tool>=Math.round(0.18*30e6*0.35*0.1/100)*100,'запуск в серию: оснастка в отчёте месяца $'+G.last.tool);CK(G.log.some(l=>/завод переоснащён под новые узлы/.test(l.t||l.text||l.msg||JSON.stringify(l))),'в журнале — «завод переоснащён под новые узлы»');}
  else CK(false,'нет модели в серии для проверки запуска');}
// 14. советник: расширять бюро — когда новая ступень по силам; сократить — когда содержание съедает прибыль
{Math.random=(()=>{let a=7;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();newGame('custom','fr','Тест','normal','Первая');G.helper={on:1};
  for(let k=0;k<12*10;k++){let g=0;while(G.pending.length&&g++<30)resolve(G.pending[0].choices[0][1]);if(G.over||!step())break;}
  G.pending=[];G.world.my.r12=200e6;G.rd.lvl=12;G.rdept=5;G.hist.profit=G.hist.profit.slice(0,-12).concat(Array(12).fill(120000));
  const tips=adviceList(G),cut=tips.find(t=>/Содержание растёт с оборотом/.test(t.text));CK(!!cut&&/Сократить (бюро|отдел)/.test(cut.btn),'совет сократить: '+(cut&&cut.text.slice(0,70)));
  const l0=G.rd.lvl,d0=G.rdept;G.rd.projs=[];if(cut)cut.run();CK(G.rd.lvl===l0-1||G.rdept===d0-1,'кнопка совета сокращает ступень');
  CK(!tips.some(t=>/Денег хватает, чтобы расширить конструкторское бюро/.test(t.text)),'расширять бюро при такой прибыли не советуют');
  G.hist.profit=G.hist.profit.slice(0,-12).concat(Array(12).fill(3e6));G.cash=5e7;const t2=adviceList(G);CK(!t2.some(t=>/Содержание растёт с оборотом/.test(t.text)),'при большой прибыли сокращать не советуют');}
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
