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

// ================= цена опережения и гонки =================
// 15. цена опережения: каждый год — ×1,6 к цене и ×1,4 к сроку; планка от оборота; деталь из будущего дороже в серии; технология завода раньше срока дороже
{CK(near(aheadCostK(0),1)&&near(aheadCostK(1),1.6)&&near(aheadCostK(5),Math.pow(1.6,5))&&aheadCostK(5)>10&&aheadCostK(5)<11,'пять лет опережения — в 10,5 раза дороже');CK(near(aheadTimeK(5),Math.pow(1.4,5),1e-9),'и в 5,4 раза дольше');
  newGame('custom','us','Тест','normal','Первая');G.y=1905;G.m=0;G.rd.lvl=14;G.rd.projs=[];const W=worldInit(G);W.my.r12=0;
  const P=rdProjects(G).filter(p=>p.kind==='early'&&!p.moto);CK(P.length>0&&P.every(p=>p.need===Math.max(4,Math.round(10*aheadTimeK(p.yrs)))),'срок прототипа — 10 очков × 1,4^лет: '+P.map(p=>p.yrs+'г→'+p.need).join(' '));
  const far=P.slice().sort((a,b)=>b.yrs-a.yrs)[0],near1=P.slice().sort((a,b)=>a.yrs-b.yrs)[0];
  if(far&&near1&&far.yrs>near1.yrs){const c0=rdCost(near1,G),c1=rdCost(far,G);CK(c1>c0,'дальше в будущее — дороже: '+near1.yrs+' г. $'+c0+', '+far.yrs+' г. $'+c1);}
  const e5={kind:'early',id:P[0].id,ck:P[0].ck,need:54,yrs:5},small=rdCost(e5,G);W.my.r12=100e6;const big=rdCost(e5,G);
  CK(big===Math.round(100e6*0.001*aheadCostK(5)/50)*50&&big>small*5,'фирма с оборотом $100 млн за пять лет опережения платит 1 % оборота: $'+big+' (мастерская — $'+small+')');
  W.my.r12=100e6;const e1={...e5,yrs:1,need:14};CK(rdCost(e1,G)===Math.max(Math.round(100e6*0.001*1.6/50)*50,rdCost(e1,G)),'год опережения — 0,16 % оборота: $'+rdCost(e1,G));
  const up={kind:'upg',id:P[0].id,ck:P[0].ck,need:10,lvl:1};W.my.r12=0;const u0=rdCost(up,G);W.my.r12=100e6;CK(rdCost(up,G)===u0,'улучшение своей детали от оборота не зависит');
  const fut=ENGINES.filter(e=>!e.moto&&e.y===1910)[0]||ENGINES.filter(e=>!e.moto&&e.y>1906)[0],old=ENGINES.filter(e=>!e.moto&&e.y<=1903).pop();
  CK(near(aheadPartK(fut,G),1+Math.min(0.9,0.15*(fut.y-1905)),1e-9)&&aheadPartK(old,G)===1,'деталь '+fut.y+' года в 1905-м в серии дороже на '+Math.round((aheadPartK(fut,G)-1)*100)+' %; освоенная историей — без наценки');
  G.y=fut.y;CK(aheadPartK(fut,G)===1,'история догнала — наценки нет');G.y=1905;
  G.cap=2000;const tk=TECH_ORDER.find(k=>{const nx=techNext(G,k);return nx&&(nx.y||1895)>G.y;});if(tk){const nx=techNext(G,tk),c=techCost(G,tk);G.y=nx.y;const cy=techCost(G,tk);G.y=1905;CK(c>cy*1.3,'технология завода на '+(nx.y-1905)+' г. раньше срока дороже: $'+c+' против $'+cy);}}
// 16. расчёт гонки без заезда и ответ соперников
{Math.random=(()=>{let a=11;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();newGame('custom','fr','Тест','normal','Первая');G.helper={on:1};
  for(let k=0;k<12*11;k++){let g=0;while(G.pending.length&&g++<30)resolve(G.pending[0].choices[0][1]);if(G.over||!step())break;}
  G.pending=[];G.over=false;G.cash=Math.max(G.cash,5e6);const rc=RACES.find(r=>r.y===G.y&&!r.match&&!r.dx&&r.m>=G.m&&raceCarsFor(G,r).length&&raceEligible(r,G));
  CK(!!rc,'есть гонка года для проверки: '+(rc&&rc.key));
  if(rc){G.m=rc.m;const M=managerPlan(G,rc);CK(M&&M.entries.length>0,'менеджер собрал состав');
    const setup={rc,mode:'calc',entries:M.entries.map(e=>({drv:e.drv,md:G.models.find(m=>m.id===e.car),prep:e.prep,tyre:e.tyre,gear:e.gear}))};
    const C=raceCalc(setup),res=C.res,cars=res.filter(r=>r.cls==='car');
    CK(cars.length>=4&&cars.every((r,i)=>r.pos===i+1),'протокол: места по порядку, машин '+cars.length);CK(res.filter(r=>r.you).length===setup.entries.length&&res.filter(r=>r.you).every(r=>r.md&&r.drv),'ваши машины в протоколе — с моделью и гонщиком');
    CK(res.every(r=>(r.dnf?r.fin===null:r.fin>0)),'сошедшие без времени, финишировавшие — со временем');const fin=cars.filter(r=>!r.dnf);CK(fin.every((r,i)=>i===0||r.fin>=fin[i-1].fin),'время растёт по местам');CK(C.info.len===rc.km*1000&&C.info.calc===1,'дистанция — полная');
    // сходится с прикидкой менеджера
    let w=0;const N=400;for(let i=0;i<N;i++){const t=raceCalc(setup).res.filter(r=>r.you&&!r.dnf&&r.cls==='car');if(t.length&&Math.min(...t.map(r=>r.pos))===1)w++;}
    const O=mgrOdds(G,rc,M.entries,400);CK(Math.abs(w/N-O.win)<0.09,'доля побед в расчёте ('+Math.round(w/N*100)+' %) сходится с прикидкой менеджера ('+Math.round(O.win*100)+' %)');
    // «в один клик» — без заезда, итог сразу
    const n0=G.raceLog.length,c0=G.cash,t0=Date.now();RACE_ACT.raceQuick({k:rc.key});CK(G.raceDone[rc.key]!==undefined&&G.raceLog.length===n0+1&&!R,'«Участвовать в один клик»: гонка сыграна, заезд не запускался');CK(Date.now()-t0<1500,'итог — сразу ('+(Date.now()-t0)+' мс)');CK(G.cash!==c0,'заявка оплачена');
    G.pending=[];
    // соперники копируют новинку через два года
    const fut=ENGINES.filter(e=>!e.moto&&e.y>G.y+3).sort((a,b)=>b.hp-a.hp)[0],car=G.models.find(m=>m.status==='prod');
    if(fut&&car){G.seenPart={};const before=aiCarMd(G.y).e;markSeen(G,{...car,e:fut.id});CK(G.seenPart[fut.id]===G.y,'новинка замечена соперниками в '+G.y+' году');CK(aiCarMd(G.y).e===before&&aiCarMd(G.y+1).e!==fut.id,'год спустя её у них ещё нет');
      const Cc=CHASSIS.filter(c=>!c.moto&&c.y<=G.y+2).reduce((a,x)=>!a||x.max>a.max?x:a,null);
      CK(fut.hp>Cc.max||aiCarMd(G.y+2).e===fut.id,'через два года ('+(G.y+2)+') мотор «'+fut.name+'» стоит на машинах заводских команд'+(fut.hp>Cc.max?' (если выдержит рама)':''));
      CK(aiHas(fut,G.y+2)&&!aiHas(fut,G.y+1)&&aiHas(fut,fut.y),'aiHas: по сроку копирования и по истории');G.diff='hist';CK(aiHas(fut,G.y+1),'на «Историке» копируют за год');G.diff='kids';CK(!aiHas(fut,G.y+3)&&aiHas(fut,G.y+4),'на «Юном магнате» — за четыре');G.diff='normal';
      G.y+=2;const L0=G.log.length;rivalNews(G);CK(G.log.slice(0,Math.max(1,G.log.length-L0+1)).some(l=>/разобрались в вашей новинке/.test(JSON.stringify(l)))||G.log.some(l=>/разобрались в вашей новинке/.test(JSON.stringify(l))),'в журнале — соперники разобрались в новинке');G.y-=2;G.seenPart={};}
    // бюджеты соперников растут от ваших побед
    const y=G.y;G.raceLog=[];CK(raceHeat(G)===0,'нет гонок — нет ответа');
    G.raceLog=Array.from({length:9},(_,i)=>({y:y-(i%2),key:'x'+i,place:i<3?1:4}));CK(raceHeat(G)===0,'треть побед — прибавки нет');
    G.raceLog=Array.from({length:10},(_,i)=>({y:y-(i%2),key:'x'+i,place:i<6?1:3}));CK(near(raceHeat(G),(0.6-1/3)*0.75,1e-9),'шесть побед из десяти — соперники сильнее на '+Math.round(raceHeat(G)*100)+' %');
    G.raceLog=Array.from({length:10},(_,i)=>({y:y-(i%3),key:'x'+i,place:1}));CK(near(raceHeat(G),0.3),'все победы — предел +30 %');
    const O1=mgrOdds(G,rc,M.entries,600);G.raceLog=[];const O0=mgrOdds(G,rc,M.entries,600);CK(O1.win<O0.win||O0.win<0.03,'с ответом соперников шанс победы ниже: '+Math.round(O0.win*100)+' % → '+Math.round(O1.win*100)+' %');
    G.raceLog=Array.from({length:10},(_,i)=>({y:y-(i%3),key:'x'+i,place:1}));const F1=raceField(rc,G,1,[]).filter(e=>!e.priv&&e.cls!=='moto')[0];G.raceLog=[];const F0=raceField(rc,G,1,[]).find(e=>e.name===F1.name);
    CK(F0&&near(F1.pw/F0.pw,1.3,0.001),'сила заводской команды в заезде — тоже ×1,3');
    G.raceLog=Array.from({length:10},(_,i)=>({y:y-12,key:'x'+i,place:1}));CK(raceHeat(G)===0,'давние победы не считаются');G.raceLog=[];G.heatSaid=0;
    G.raceLog=Array.from({length:10},(_,i)=>({y,key:'x'+i,place:1}));rivalNews(G);CK(G.heatSaid===30&&G.log.some(l=>/Соперники ответили на ваши победы/.test(JSON.stringify(l))),'в журнале — соперники ответили на победы');G.raceLog=[];G.heatSaid=0;}}
// 17. гонки сезона одной кнопкой
{Math.random=(()=>{let a=5;return()=>{a=(a*16807)%2147483647;return a/2147483647;};})();newGame('custom','fr','Тест','normal','Первая');G.helper={on:1};
  for(let k=0;k<12*10;k++){let g=0;while(G.pending.length&&g++<30)resolve(G.pending[0].choices[0][1]);if(G.over||!step())break;}
  G.pending=[];G.over=false;G.cash=Math.max(G.cash,3e6);while(G.m!==0){G.pending=[];step();}G.pending=[];
  CK(!raceAutoOn(G),'по умолчанию гонки — по вашей заявке');CK(/Гонки сезона: по вашей заявке/.test(advisorCard(G))&&/data-act="raceAutoToggle"/.test(advisorCard(G)),'в «Делах» — строка гонок сезона с кнопкой');
  RACE_ACT.raceAutoToggle();CK(raceAutoOn(G)&&G.tm.cap===raceAutoCapDef(G)&&G.tm.cap>0,'включено: бюджет года по умолчанию $'+G.tm.cap);const H=advisorCard(G);CK(/команда участвует сама/.test(H)&&/data-act="raceAutoBud" data-k="[+]"/.test(H)&&/выключить/.test(H),'строка показывает бюджет, остаток и кнопки − и +');
  const c1=G.tm.cap;RACE_ACT.raceAutoBud({k:'+'});CK(G.tm.cap>c1,'«+» прибавляет бюджет');RACE_ACT.raceAutoBud({k:'-'});RACE_ACT.raceAutoBud({k:'-'});CK(G.tm.cap<c1,'«−» убавляет');G.tm.cap=5e6;
  const y0=G.y,n0=G.raceLog.length;let stops=0,sheets=0,msgs=0;for(let k=0;k<12&&G.y===y0;k++){let g=0;while(G.pending.length&&g++<30){const ev=G.pending[0];if(/гонк|Гран|Кубок|заезд/i.test(ev.title||''))stops++;resolve(ev.choices[0][1]);}if(typeof lastRace!=='undefined'&&lastRace&&lastRace.shown)sheets++;if(G.over||!step())break;if(G.tmMsg&&G.tmMsg.m===mi(G)-1&&G.tmMsg.list.length)msgs++;}
  const ran=G.raceLog.length-n0;CK(ran>=2,'за год команда сама сыграла гонок: '+ran);CK(msgs>=1&&rbudOf({rbud:G.rbud,y:y0},y0).spent>0,'итоги — строкой в «Делах», расходы — в бюджете года');CK(!R,'заезды не запускались');
  const T=G.tmMsg&&G.tmMsg.list||[];CK(G.log.some(l=>/лучший результат|все машины сошли/.test(JSON.stringify(l))),'в журнале — итог каждой гонки строкой');
  // бюджет исчерпан — гонка пропущена с пометкой; гонку, сыгранную вручную, команда не трогает
  G.pending=[];G.over=false;while(G.m!==0){G.pending=[];step();}G.pending=[];G.tm.cap=1;const y1=G.y,n1=G.raceLog.length;let skipMsg=0;for(let k=0;k<12&&G.y===y1;k++){G.pending=[];if(!step())break;if(G.tmMsg&&G.tmMsg.list.some(t=>/бюджет года исчерпан/.test(t)))skipMsg++;}
  CK(G.raceLog.length===n1&&skipMsg>=1,'бюджета нет — гонки пропущены, в «Делах» сказано почему');
  RACE_ACT.raceAutoToggle();CK(!raceAutoOn(G),'выключается той же кнопкой');}
// 18. управление в гонке: тормоза в мере шин, перенос веса в торможении, контрруль, подсказки (замер — handling51.js, drive51.js)
{setupRender=()=>{};setupRaceUI=()=>{};auRaceStart=()=>{};auSfx=()=>{};SCN_OFF=true;let sd=7;Math.random=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
  newGame('renault','fr','Тест','normal');G.cash=1e6;
  const su0=surfUnder,gr0=gradeAt,rs0=respawn,ra0=respawnAt;surfUnder=(c,trk,lat)=>su0(c,trk,0);gradeAt=()=>0;respawn=()=>{};respawnAt=()=>{};
  const field=(y,kmh,terr,diff,moto,kid)=>{G.diff=diff||'normal';const rc=Object.assign({},RACES.find(r=>r.t==='sprint'),{y,key:'hnd-test',terr});const md=G.models[0];{const a=aiCarMd(y);['e','g','c','k','w'].forEach(k=>md[k]=a[k]);}md.b=lastOf(BODIES,y,x=>!x.truck&&!x.moto).id;if(kid)md.k=kid;
    let mdU=md;if(moto){mdU=Object.assign({},md,{cls:'moto'});const a=aiMotoMd(y);['e','g','c','k','w'].forEach(k=>{if(a[k]!==undefined)mdU[k]=a[k];});mdU.b=lastOf(BODIES,y,x=>x.moto&&!x.side).id;}
    startRace({rc,mode:'drive',entries:[{drv:'me',md:mdU,prep:2,tyre:'soft',gear:0}]});const me=R.me;R.cars=[me];R.t=0.001;R.trk.colG=null;R.trk.bar=[];R.trk.rg=null;me.vx=kmh/3.6;me.gear=me.gr.length;
    const p=R.trk.pts[40],t=R.trk.T[40];me.idx=40;me.x=p[0];me.z=p[2];me.yaw=Math.atan2(t[0],t[1]);me.punctRate=0;me.tyreRate=0;R.hz0=0;return me;};
  const endRace=()=>{try{finishRace(true);closeSheet();closePaper();}catch(_){}G.pending=[];};
  const drive=(me,script,dur)=>{const x0=me.x,z0=me.z,yaw0=me.yaw,fx=Math.sin(yaw0),fz=Math.cos(yaw0),o={maxB:0,t90:null,stop:null,b:0,sp:0};let f=0;
    while(R&&f<dur*60){f++;const tt=f/60,k=script(tt);rKeys.left=false;rKeys.right=!!k.r;rKeys.gas=!!k.g;rKeys.brake=!!k.b;R.t+=1/60;R.time+=1/60;playerControl(me,1/60);raceTick(1/60);if(!R)break;
      const b=Math.atan2(me.vy,Math.max(1,Math.abs(me.vx)))*57.3,psi=(me.yaw-yaw0)*57.3,sp=Math.hypot(me.vx,me.vy),X=(me.x-x0)*fx+(me.z-z0)*fz;o.maxB=Math.max(o.maxB,Math.abs(b));o.b=b;o.sp=sp;
      if(!o.t90&&Math.abs(psi+b)>=90)o.t90={t:tt,X,v:sp*3.6};if(!o.stop&&sp<1.5&&tt>0.5){o.stop={t:tt,X};break;}}
    endRace();return o;};
  const both=t=>({r:t>0.2,b:t>0.2}),brakeOnly=t=>({b:t>0.2});
  // тормозной путь: лестница эпохи в мере игровых шин
  {const a=drive(field(1925,110,'asphalt'),brakeOnly,20),b=drive(field(1925,150,'asphalt'),brakeOnly,20),c=drive(field(1913,100,'macadam'),brakeOnly,20),d=drive(field(1906,70,'macadam'),brakeOnly,20);
    CK(a.stop&&a.stop.X>56&&a.stop.X<76,'машина 1925 года со 110 км/ч встаёт за 56–76 м (в 0.50 — 88): '+(a.stop&&a.stop.X.toFixed(0)));
    CK(b.stop&&b.stop.X>100&&b.stop.X<132,'со 150 км/ч — за 100–132 м (в 0.50 — 156): '+(b.stop&&b.stop.X.toFixed(0)));
    CK(c.stop&&c.stop.X>56&&c.stop.X<78,'машина 1913 года со 100 км/ч — 56–78 м (в 0.50 — 88): '+(c.stop&&c.stop.X.toFixed(0)));
    CK(d.stop&&d.stop.X>46&&d.stop.X<66&&d.maxB<6,'задние барабаны 1906 года с 70 км/ч — 46–66 м, без разворота: '+(d.stop&&d.stop.X.toFixed(0))+', β '+d.maxB.toFixed(0));}
  // тормоз с рулём: машина поворачивает на тормозе, а не идёт по рельсам; занос — не разворот
  {const a=drive(field(1925,110,'asphalt'),both,14),b=drive(field(1925,150,'asphalt'),both,14),c=drive(field(1913,100,'macadam'),both,14),d=drive(field(1906,70,'macadam'),both,14);
    CK(a.t90&&a.t90.X<54&&a.t90.v>42&&a.maxB<27,'1925, 110 км/ч, тормоз и руль: курс 90° через '+(a.t90&&a.t90.X.toFixed(0))+' м на '+(a.t90&&a.t90.v.toFixed(0))+' км/ч (в 0.50 — 58 м на 29 км/ч), занос до '+a.maxB.toFixed(0)+'°');
    CK(b.t90&&b.t90.X<90&&b.t90.v>55&&b.maxB<27,'1925, 150 км/ч: '+(b.t90&&b.t90.X.toFixed(0))+' м на '+(b.t90&&b.t90.v.toFixed(0))+' км/ч (в 0.50 — 103 м на 43)');
    CK(c.t90&&c.t90.X<52&&c.maxB<27,'1913, 100 км/ч: '+(c.t90&&c.t90.X.toFixed(0))+' м (в 0.50 — 56)');
    CK(d.t90&&d.t90.X<33&&d.maxB<27,'1906, задние барабаны, 70 км/ч: '+(d.t90&&d.t90.X.toFixed(0))+' м, занос до '+d.maxB.toFixed(0)+'° — не разворот');}
  // «Историк»: помощи рулём нет — полный тормоз с рулём до упора на 150 км/ч разворачивает; отпустил вовремя — занос ловится
  {const h=drive(field(1925,150,'asphalt','hist'),both,14),r=drive(field(1925,150,'asphalt','hist'),t=>({r:t>0.2&&t<1.4,b:t>0.2&&t<1.4}),7),n=drive(field(1925,150,'asphalt','normal'),t=>({r:t>0.2&&t<1.4,b:t>0.2&&t<1.4}),7);
    CK(h.maxB>50,'«Историк», 150 км/ч, тормоз и руль до упора — разворот (β '+h.maxB.toFixed(0)+'°)');
    CK(r.maxB<62&&Math.abs(r.b)<12&&r.sp>8,'«Историк»: отпустил через 1,2 с — занос '+r.maxB.toFixed(0)+'° пойман (в конце '+r.b.toFixed(0)+'°)');
    CK(n.maxB<25&&Math.abs(n.b)<6,'«Норма»: тот же манёвр — занос до '+n.maxB.toFixed(0)+'°, машина выравнивается');G.diff='normal';}
  // мотоцикл: путь короче, на тормозе поворачивает
  {const a=drive(field(1925,120,'asphalt','normal',1),brakeOnly,20),b=drive(field(1925,120,'asphalt','normal',1),both,14),c=drive(field(1925,120,'asphalt','normal',1),t=>({r:t>0.2}),14);
    CK(a.stop&&a.stop.X<114,'мотоцикл 1925 года со 120 км/ч встаёт за '+(a.stop&&a.stop.X.toFixed(0))+' м (в 0.50 — 128)');
    CK(b.t90&&b.t90.X<78&&b.maxB<24,'мотоцикл: тормоз и руль — 90° через '+(b.t90&&b.t90.X.toFixed(0))+' м (в 0.50 — 78), без разворота');
    CK(c.t90&&c.t90.X<95,'мотоцикл: руль без тормоза на 120 км/ч — 90° через '+(c.t90&&c.t90.X.toFixed(0))+' м (в 0.50 — 100: контрруль съедал руль)');}
  // перенос веса и пределы осей
  {const c4=field(1925,110,'asphalt'),mu4=1.2;const s1=brakeShift(c4,c4.m*3,mu4),s2=brakeShift(c4,c4.m*6,mu4);
    CK(brakeShift(c4,0,mu4)===0&&s1>0&&near(s2,2*s1,1e-6)&&near(s1,c4.m*3*c4.h/c4.L,1e-6),'перенос веса — сила торможения × высота центра тяжести / база');
    CK(brakeCapR(c4,mu4,0.9)>1&&brakeCapF(c4,mu4,0.9)>1&&brakeReal(c4,mu4,0.8)>0.94*brakeDec(c4,mu4),'тормоза на четыре колеса: до полной педали оси не блокируются');
    CK(near(BRK_CAP,8.4)&&brakeDec(c4,mu4)>7&&brakeDec(c4,0.5)<brakeDec(c4,mu4),'мера тормозов — 8,4 м/с² на сухом, на скользком — по сцеплению');endRace();
    const c2=field(1906,70,'macadam','normal',0,'k2');CK(c2.fb===0&&brakeCapR(c2,1,0.9)<0.9&&brakeCapR(c2,1,0.5)<brakeCapR(c2,1,0.9)&&brakeReal(c2,1,0.8)<brakeDec(c2,1)*0.9,'задние барабаны: предел — разгруженная задняя ось (педаль до '+brakeCapR(c2,1,0.9).toFixed(2)+'), настоящее замедление '+brakeReal(c2,1,0.8).toFixed(1)+' из '+brakeDec(c2,1).toFixed(1)+' м/с²');endRace();}
  // контрруль: в обычном повороте на 180 км/ч помощник не съедает руль; в заносе — работает в полную силу
  {const c=field(1930,180,'asphalt');c.muNow=c.grip;const v=50,dmax=Math.min(0.5,1.3*c.L*c.muNow*GRAV/(v*v)+0.09);
    const hold=(sl)=>{c.steer=0;c.delta=0;c.hold=0;for(let k=0;k<60;k++){c.vx=v;c.vy=-4;c.r=0.15;c.slipR=sl;rKeys.right=true;rKeys.left=rKeys.gas=rKeys.brake=false;playerControl(c,1/60);}return c.delta;};
    const d1=hold(0.07),d2=hold(0.25);rKeys.right=false;
    CK(d1>0.66*dmax,'180 км/ч, руль до упора, угол кузова 4,6°: колёса повёрнуты на '+(d1/dmax*100).toFixed(0)+'% полного руля (раньше — меньше половины)');
    CK(d2<d1*0.8,'в заносе (увод задней оси 0,25) контрруль работает: '+(d2/dmax*100).toFixed(0)+'%');endRace();}
  // подсказка: быстрые дуги, шпилька за дугой, настоящий тормозной путь
  {const c=field(1925,150,'asphalt'),TK=R.trk,K0=TK.K.slice?TK.K.slice():Array.from(TK.K),st=TK.step,setK=(f)=>{for(let i=0;i<TK.n;i++)TK.K[i]=f(i-c.idx);};
    c.vtop=60;c.vx=55;c.grade=0;c.segT=0;const mu0=roadMuAt(TK,c.idx)*c.grip*twAll(c);
    setK(d=>d>=70&&d<95?1/150:0);let pn=paceNote(c);const vc=Math.sqrt(mu0*PACE_MU*GRAV*150);
    CK(pn&&near(pn.vc,vc,0.01)&&pn.dir===1&&!pn.hair&&near(pn.dist,70*st,0.01),'дуга 150 м на 198 км/ч — подсказка есть: '+(pn&&pn.kmh)+' км/ч через '+(pn&&pn.dist.toFixed(0))+' м (раньше дуги положе 75 м не замечались)');
    const need=(55*55-vc*vc)/(2*brakeReal(c,mu0,0.8)*0.9)+55*PACE_REACT;CK(pn&&near(pn.need,need,0.5)&&pn.lvl===(need>pn.dist?'bad':'warn'),'путь торможения — по настоящему замедлению с запасом на реакцию: '+(pn&&pn.need.toFixed(0))+' м');
    setK(d=>d>=Math.round(need/st)-6&&d<Math.round(need/st)+20?1/150:0);pn=paceNote(c);CK(pn&&pn.lvl==='bad','ближе тормозного пути — «ТОРМОЗИ!»');
    setK(d=>d>=Math.round(need/st)+12&&d<Math.round(need/st)+40?1/150:0);pn=paceNote(c);CK(pn&&pn.lvl==='warn','с запасом — предупреждение без «тормози»');
    c.vx=40;pn=paceNote(c);CK(pn&&pn.lvl==='ok'&&pn.need===0,'скорость уже подходит — «ок»');
    // плавная дуга, за ней шпилька
    c.vx=30;const vh=Math.sqrt(mu0*PACE_MU*GRAV*15),needH=(900-vh*vh)/(2*brakeReal(c,mu0,0.8)*0.9)+30*PACE_REACT,hs=Math.max(12,Math.floor(needH/st)-2);setK(d=>d>=2&&d<hs-4?1/90:d>=hs&&d<hs+12?-1/15:0);pn=paceNote(c);
    CK(pn&&pn.hair&&pn.dir===-1&&near(pn.vc,vh,0.01)&&pn.lvl==='bad','за плавной дугой шпилька: подсказка показывает шпильку ('+(pn&&pn.kmh)+' км/ч, «тормози»), а не ближнюю дугу');
    c.vx=8;pn=paceNote(c);CK(pn&&pn.dir===1&&!pn.hair&&pn.lvl==='ok','тихим ходом — ближний поворот, без тревоги');
    // голос «Тормози!» — по той же подсказке, один раз на поворот
    c.vx=30;c.brk=0;NAV.brkJ=undefined;let said=0;const ns0=navSay;navSay=function(k){if(k==='brk')said++;};legBrake(c,TK);legBrake(c,TK);CK(said===1&&NAV.brkJ===paceNote(c).j,'голос «Тормози!» — раз на поворот, по подсказке');
    c.brk=0.8;NAV.brkJ=undefined;legBrake(c,TK);CK(said===1,'гонщик уже тормозит — голос молчит');navSay=ns0;c.brk=0;
    for(let i=0;i<TK.n;i++)TK.K[i]=K0[i];endRace();
    // задние барабаны: путь в подсказке длиннее, чем по паспорту тормозов
    const c2=field(1906,70,'macadam','normal',0,'k2'),T2=R.trk,m2=roadMuAt(T2,c2.idx)*c2.grip*twAll(c2);c2.vtop=30;c2.vx=20;c2.grade=0;c2.segT=0;for(let i=0;i<T2.n;i++)T2.K[i]=(i-c2.idx>=30&&i-c2.idx<45)?1/20:0;
    const p2=paceNote(c2),v2=Math.sqrt(m2*PACE_MU*GRAV*20),nominal=(400-v2*v2)/(2*brakeDec(c2,m2)*0.9)+20*PACE_REACT;CK(p2&&p2.need>nominal*1.1,'задние барабаны: тормозить раньше — '+(p2&&p2.need.toFixed(0))+' м вместо '+nominal.toFixed(0)+' по паспорту тормозов');endRace();}
  // смена стёртых шин у обочины и «застряли» — с подписью
  {const src=String(raceTick)+String(typeof raceBoard==='function'?raceBoard:'');CK(/ЗАСТРЯЛИ\\?/.test(String(raceTick))&&/npT>12/.test(String(raceTick)),'упёрлись и газуем — подсказка; маршалы выталкивают через 12 с');}
  surfUnder=su0;gradeAt=gr0;respawn=rs0;respawnAt=ra0;}
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
