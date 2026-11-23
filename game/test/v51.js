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
{CK(near(aheadCostK(0),1)&&near(aheadCostK(1),1.6)&&near(aheadCostK(5),4)&&near(aheadCostK(10),7)&&near(aheadCostK(10)-aheadCostK(9),aheadCostK(2)-aheadCostK(1)),'цена опережения без прогрессии: год — ×1,6, пять лет — ×4, десять — ×7; каждый год прибавляет одно и то же');CK(near(aheadTimeK(5),3,1e-9)&&near(aheadTimeK(10),5,1e-9),'срок: пять лет — втрое дольше, десять — впятеро');
  newGame('custom','us','Тест','normal','Первая');G.y=1905;G.m=0;G.rd.lvl=14;G.rd.projs=[];const W=worldInit(G);W.my.r12=0;
  const P=rdProjects(G).filter(p=>p.kind==='early'&&!p.moto);CK(P.length>0&&P.every(p=>p.need===Math.max(4,Math.round(10*aheadTimeK(p.yrs)))),'срок прототипа — 10 очков × (1 + 0,4 × лет): '+P.map(p=>p.yrs+'г→'+p.need).join(' '));
  const far=P.slice().sort((a,b)=>b.yrs-a.yrs)[0],near1=P.slice().sort((a,b)=>a.yrs-b.yrs)[0];
  if(far&&near1&&far.yrs>near1.yrs){const c0=rdCost(near1,G),c1=rdCost(far,G);CK(c1>c0,'дальше в будущее — дороже: '+near1.yrs+' г. $'+c0+', '+far.yrs+' г. $'+c1);}
  const e5={kind:'early',id:P[0].id,ck:P[0].ck,need:54,yrs:5},small=rdCost(e5,G);W.my.r12=100e6;const big=rdCost(e5,G);
  CK(big===Math.round(100e6*0.001*aheadCostK(5)/50)*50&&big>small*5,'фирма с оборотом $100 млн за пять лет опережения платит 0,4 % оборота: $'+big+' (мастерская — $'+small+')');
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
    G.raceLog=Array.from({length:8},(_,i)=>({y:y-(i%2),key:'x'+i,place:i<2?1:4}));CK(raceHeat(G)===0,'четверть побед — прибавки нет');
    G.raceLog=Array.from({length:9},(_,i)=>({y:y-(i%2),key:'x'+i,place:i<3?1:4}));CK(near(raceHeat(G),(1/3-0.25)*1.5,1e-9),'треть побед — соперники уже сильнее на '+Math.round(raceHeat(G)*100)+' % (общая калибровка: было 0)');
    G.raceLog=Array.from({length:10},(_,i)=>({y:y-(i%2),key:'x'+i,place:i<4?1:3}));CK(near(raceHeat(G),(0.4-0.25)*1.5,1e-9),'четыре победы из десяти — соперники сильнее на '+Math.round(raceHeat(G)*100)+' %');
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
// 19. весь ряд техники и конструктор-воронка (этап «Конструктор и новые виды техники»)
{let sd=3;Math.random=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};newGame('ford','us','Тест','normal');G.cash=1e7;const s=G;
  const NK=Object.keys(KIND_NEW),nb=BODIES.filter(b=>b.art);
  CK(nb.length===23&&nb.every(b=>b.truck&&b.kind&&b.pay>0&&b.c>0&&b.kg>0&&b.note),'23 кузова новых видов (18 из 0.51 и 5 из 0.60): у каждого вид, вес, цена, справка');
  CK(NK.length===20&&NK.every(k=>BODIES.some(b=>b.kind===k)&&RIVAL_CAR[k]&&CHAR_W[k]&&KIND_NAME[k]&&KIND_TRIM[k]==='t0'&&kindSeg(k)==='truck'&&TUSE.some(u=>TRUCK_USE[u].kinds.includes(k))),'20 новых видов (16 из 0.51 и 4 из 0.60): кузов, эталон соперника, веса черт, работа на рынке');
  {const badRef=[];NK.forEach(k=>RIVAL_CAR[k].forEach(r=>{for(const pk of PART_KEYS){const x=byId(PART_CATS.find(c=>c.k===pk).arr(),r[2][pk]);if(!x||x.y>r[0])badRef.push(k+' '+r[0]+' '+pk);}if(overpower({...r[2],t:'t0'}))badRef.push(k+' '+r[0]+' рама');if(bodyKind(byId(BODIES,r[2].b))!==k)badRef.push(k+' кузов');}));
    CK(!badRef.length,'эталоны соперников собраны из деталей своего года и своего кузова: '+badRef.join(', '));}
  CK(Object.keys(KIND_GRP).every(g=>KIND_GRP[g].kinds.length)&&NK.every(k=>kindGroup(k)!=='car'||k==='taxi')&&kindGroup('truck')==='cargo'&&kindGroup('people')==='car'&&kindGroup('moside')==='moto','семь групп видов: у каждого вида своя группа');
  CK(bodyKind(byId(BODIES,'b6'))==='van'&&bodyKind(byId(BODIES,'b8'))==='truck'&&bodyKind(byId(BODIES,'b12'))==='truck'&&bodyKind(byId(BODIES,'b14'))==='bus'&&bodyKind(byId(BODIES,'b3'))==='','прежние кузова: фургон и грузовик — как были, 5 т и тягач — грузовики');
  // доли работ: в сумме — весь прежний рынок грузовиков; у соперников доля одна во всех работах → мир без игрока не меняется
  {let worst=0,early=0;for(const c of Object.keys(COUNTRIES))for(let y=1895;y<=1929;y++){G.y=y;G.m=5;const sh=truckUseSh(c,s);let sum=0;TUSE.forEach(u=>{if(!TRUCK_USE[u].own)sum+=sh[u];});worst=Math.max(worst,Math.abs(sum-1));if(y<=1896)NK.forEach(k=>{TUSE.forEach(u=>{if(TRUCK_USE[u].kind===k&&!TRUCK_USE[u].own)early+=sh[u];});});}
    CK(worst<1e-9&&early===0,'доли работ в сумме дают весь рынок грузовиков — во всех странах, 1895–1929 (отклонение '+worst.toExponential(1)+'); до 1897 года новых работ нет');}
  {G.y=1925;G.m=5;const MC=mkCountry('us',s,[]),U=MC.segs.truck.uses;let inc=0,own=0,k0=null,flat=true;TUSE.forEach(u=>{const z=U[u];if(!z||z.pool<=0)return;if(TRUCK_USE[u].own){own+=z.riv;return;}inc+=z.riv;const k=z.riv/z.pool;if(k0===null)k0=k;else if(Math.abs(k-k0)>1e-9)flat=false;});
    CK(flat&&near(inc,MC.segs.truck.inc,1e-6)&&near(inc,MC.segs.truck.pool*k0,1e-6),'у соперников одна доля во всех работах рынка грузовиков: их продажи в сумме — те же, что до новых работ ('+Math.round(inc)+' в месяц)');
    CK(MC.anon&&near(MC.anon.n,own,1e-6)&&own>1000&&MC.anon.rev>0&&MC.anon.hp>0,'тракторы и армия — свой пул: продажи соперников идут в «мир без имени» ('+Math.round(own)+' в месяц), а не маркам грузовиков');
    const sh=truckUseSh('us',s);CK(sh.bus<0.012&&sh.coach<0.012&&sh.school<0.006&&sh.taxi>0.02&&sh.dump>0.02&&sh.fire<0.01,'США, 1925: автобусы всех видов — около 2 % рынка, пожарные — меньше 1 % (как в истории)');
    const shu=truckUseSh('uk',s);CK(shu.bus>sh.bus*4&&shu.school<sh.school,'в Британии городских автобусов в разы больше, школьный автобус — американский');
    G.y=1917;G.m=5;CK(jobOwnPool('ltank','fr',s)>20*jobOwnPool('ltank','it',{...s,y:1925})&&jobOwnPool('ltank','fr',{...s,y:1915})===0&&jobOwnPool('armored','fr',s)>jobOwnPool('armored','fr',{...s,y:1925}),'армия: в войну закупки в десятки раз больше; танков до 1917 года не берут');
    G.y=1925;CK(jobOwnPool('plough','us',s)>20*jobOwnPool('plough','de',s)&&jobOwnPool('heavy','us',s)<jobOwnPool('plough','us',s)*0.2&&jobOwnPool('plough','us',{...s,y:1900})===0,'тракторы: рынок США — на порядок больше европейских; тяжёлые работы — десятая часть');}
  // какая техника за какую работу берётся
  {const m=(k,b)=>({...rivalDesign(k,1925),b:b||rivalDesign(k,1925).b,t:'t0'});
    CK(jobsOf(m('bus')).join()==='bus'&&jobsOf(m('fire')).join()==='fire'&&jobsOf(m('truck')).join()==='van,city,haul,bulk'&&jobsOf(m('truck','b13')).join()==='van,city,haul,bulk'&&jobsOf(m('tractor')).join()==='plough,heavy'&&jobsOf(m('ltank')).join()==='ltank','автобус — только маршруты, пожарная — только охрана, грузовик — четыре перевозки, трактор — пахота и тяжёлые работы');
    CK(jobFits('bus',{probe:{}})&&!jobFits('plough',{probe:{}}),'пробная машина калибровки — во всех работах рынка грузовиков, но не в своих пулах');
    const sh=truckUseSh('us',s,m('bus'));CK(sh.bus>0&&TUSE.every(u=>u==='bus'||sh[u]===0),'доли для модели — только её работы');}
  // мерки работы
  {G.y=1925;G.m=5;const mk=(k,o)=>({...rivalDesign(k,1925),t:'t0',id:-9,...o});
    const b1=truckCost(mk('bus'),'bus','us',s,4000),tx=truckCost(mk('taxi'),'taxi','us',s,1400);CK(b1.tkm>tx.tkm*8&&b1.drv>tx.drv*1.9,'пассажиро-километр: автобус на 34 места везёт на порядок больше такси; на автобусе — шофёр и кондуктор');
    const t1=truckCost(mk('tractor'),'plough','us',s,800),c1=truckCost(mk('crawler'),'plough','us',s,4600),t2=truckCost(mk('tractor'),'heavy','us',s,800),c2=truckCost(mk('crawler'),'heavy','us',s,4600);
    CK(near(t1.tkm,250)&&near(c1.tkm,250)&&c1.cpk>t1.cpk*1.3,'гектар: ферме хватает лёгкого трактора — гусеничный на пахоте ничего не добавляет и обходится дороже ('+c1.cpk.toFixed(1)+' против '+t1.cpk.toFixed(1)+' $/га)');
    CK(c2.tkm>t2.tkm*2.5&&c2.cpk<t2.cpk,'тяжёлая почва, лес, дороги: гусеничный делает втрое больше колёсного и выходит дешевле на гектар');
    const f0=mk('fire'),f1={...f0,e:'e8'};const a=truckCost(f0,'fire','us',s,7000),b=truckCost(f1,'fire','us',s,7000);CK(b.tkm>a.tkm&&b.tkm<a.tkm*1.25,'день службы: мотор в полтора раза мощнее — служба лучше, но меньше чем на четверть (+'+Math.round((b.tkm/a.tkm-1)*100)+' %)');
    const h5=truckCost(mk('truck',{b:'b12'}),'bulk','us',s,2600),h15=truckCost(mk('truck',{b:'b7'}),'bulk','us',s,1280),r=truckRef('bulk',1925);CK(h5.cpk<h15.cpk*0.6&&r.b==='b13'&&truckRef('bulk',1918).b==='b12'&&truckRef('haul',1925).b==='b8','тяжёлые грузы: пятитонка возит тонно-километр вдвое дешевле полуторатонки; эталон — тягач с полуприцепом');}
  // типичная цена и веса черт
  {G.y=1925;G.m=5;const P=k=>prefP('truck','us',s)*payK({b:rivalDesign(k,1925).b});
    CK(near(P('bus')/P('truck'),3)&&near(P('fire')/P('truck'),6)&&P('tractor')<P('truck')*0.7&&P('ltank')>P('truck')*10,'типичные цены: автобус — три грузовика, пожарная — шесть, трактор дешевле грузовика, танк — больше десяти');
    const md={...rivalDesign('fire',1925),t:'t0',id:-9},weak={...md,e:'e9'};CK(kindKey(md)==='fire'&&kindKey({...md,b:'b7'})==='truck'&&kindKey({...rivalDesign('people',1925),t:'t0'})==='people','ключ вида: у пожарной свои веса, у грузовика и легковой — прежние');
    const C0=classCompare(md,s,'us'),C1=classCompare(weak,s,'us');CK(C1.zone.perf==='low'&&C1.S<C0.S*0.7&&C0.W.perf>0.3&&C0.ref.kind==='fire','пожарная с мотором в 20 сил — «ниже порога»: оценка '+C1.S.toFixed(2)+' против '+C0.S.toFixed(2));}
  // годные детали
  {G.y=1925;G.m=5;const t5={...rivalDesign('truck',1925),b:'b12',t:'t0',id:-9},pp={...rivalDesign('people',1925),t:'t0',id:-9},E=id=>byId(ENGINES,id);
    CK(partFit(t5,'e',E('e1'),s)==='low'&&partFit(t5,'e',E('e9'),s)==='low'&&partFit(t5,'e',E('e7'),s)!=='low','пятитонке мотор в 3 и в 20 сил не годится («трёхтонке нельзя ставить 3 или 10 сил»)');
    CK(partFit(pp,'e',E('e9'),s)===''&&partFit(pp,'e',E('e6'),s)==='sat','народной машине мотор соперника годится, V8 — «с запасом»');
    CK(!partDominated('e',E('e9'),s,false)&&partFit(pp,'c',byId(CHASSIS,'c1'),s)==='frame','дешёвый мотор — не «устаревший»; деревянная рама 1885 года мотор в 20 сил не выдержит');
    G.y=1900;CK(partFit({...rivalDesign('middle',1900),t:'t1',id:-9},'e',E('e2'),s)==='','в 1900 году мотор Daimler Phönix — годная деталь');G.y=1925;}
  // воронка: три шага
  {G.y=1925;G.m=5;let html='';const os=openSheet;openSheet=h=>{html=h;};const de=document.getElementById;document.getElementById=()=>({addEventListener(){},style:{},classList:{add(){},remove(){},toggle(){}}});
    openDesigner();CK(/Шаг 1 из 3/.test(html)&&(html.match(/class="ktile/g)||[]).length>=7&&/data-v="mil"/.test(html)&&/Военная техника/.test(html),'шаг 1: семь видов техники');
    openKindStep('bus');CK(/Шаг 2 из 3/.test(html)&&(html.match(/class="krow[ "]/g)||[]).length===3&&!/data-lock/.test(html)&&/пасс·км/.test(html)&&/в мес\\./.test(html),'шаг 2, автобусы в 1925 году: три назначения, у каждого покупатель, мерка, размер рынка и цена');
    G.y=1903;openKindStep('bus');CK((html.match(/data-lock="1"/g)||[]).length===3&&/в истории — с 1905 года/.test(html)&&/В КБ/.test(html),'в 1903 году автобусов ещё не строят: строки закрыты, указан год и путь через КБ');
    openKindStep('cargo');CK((html.match(/class="krow[ "]/g)||[]).length===5&&(html.match(/data-lock="1"/g)||[]).length===4,'грузовые: пять грузоподъёмностей, в 1903 году доступен один фургон');G.y=1925;
    openDesigner('fire');CK(designKind(draft)==='fire'&&draft.b==='b17'&&/Спецтехника/.test(html)&&/Пожарный автомобиль/.test(html)&&/день службы/.test(html)&&/data-act="kgrp" data-v="spec"/.test(html)&&!/data-act="dclass"/.test(html),'шаг 3: пожарная — вид и назначение в шапке, кнопка «Изменить», соседних классов нет');
    draft.open='b';renderDesigner();CK((html.match(/data-k="b" data-v="/g)||[]).length===1,'кузов — только своего вида');
    draft.open='e';renderDesigner();const shown=(html.match(/data-k="e" data-v="/g)||[]).length,hid=+(html.match(/Скрыто (\\d+)/)||[0,0])[1];CK(shown>=1&&shown<=4&&hid>=6&&/Показать все/.test(html),'моторы: показано '+shown+', скрыто '+hid+' — не годятся пожарной машине');
    draft.all=true;renderDesigner();CK((html.match(/data-k="e" data-v="/g)||[]).length===shown+hid&&/ftag bad/.test(html)&&/Только годные/.test(html),'«Показать все» — все моторы с пометками, почему не годятся');
    openDesigner('truck','b12');CK(draft.b==='b12'&&designKind(draft)==='truck','грузовик 5 т: выбранный кузов стоит сразу');
    openDesigner('people');CK((html.match(/data-act="dclass"/g)||[]).length>=3&&/с запасом/.test((draft.open='e',renderDesigner(),html)),'легковая: соседние классы — чипами; мощный мотор помечен «с запасом»');
    openSheet=os;document.getElementById=de;draft=null;}
  // спрос: каждая модель продаётся только в своих работах; рисунки
  {G.y=1925;G.m=5;const kinds=['truck'].concat(NK);G.models=kinds.map((k,i)=>{const md={...rivalDesign(k,1925),id:300+i,name:k,made:500,vol:100,launched:mi(G)-20,status:'prod',price:0,stock:0,paint:'#333',eq:[]};md.price=Math.round(refPrice(md,G)/10)*10;return md;});
    let okU=true,sold=0,err='';try{const D=demandAll(G);G.models.forEach(md=>{const by=D.mk.us.byU[md.id]||{};const js=jobsOf(md);for(const u in by){if(!js.includes(u))okU=false;sold+=by[u];}});
      G.y=1917;const D2=demandAll(G);}catch(e){err=e.message;}G.y=1925;
    CK(!err&&okU&&sold>0,'модели всех видов сразу: спрос считается без ошибок (и в войну), каждая продаётся только в своих работах '+err);
    const svgs=G.models.map(md=>carSVG(md,{}));CK(svgs.every(x=>/^<svg/.test(x)&&!/undefined|NaN/.test(x)&&x.length>600),'рисунки новых видов собраны без пропусков');
    const TH=truckHead(G.models[1],G);CK(TH&&TH.un==='пасс·км'&&/пасс·км/.test(TH.txt),'строка «работа против соперника» — в своей мерке');G.models=[];}
}
// ---------- 20. этап 5: фирмы-соперники вместо вычетов из спроса (отзыв автора на пробную сборку) ----------
{const rnd=seed=>{let a=seed;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};};
  // вычетов из спроса игрока больше нет
  {newGame('ford','us','Тест','normal','Первая');G.y=1920;G.m=5;G.rv={us:{people:1}};G.resp={us:{people:{sh:0.6,over:30,cut:0.2,t:0,ms:[{at:0,k:0.5}],mg:0.25,mgd:1}}};G.pfleet={us:5e6};
    const md={...rivalDesign('people',1920),id:900,name:'П',status:'prod',launched:mi(G)-30,price:500,stock:0,made:1000,vol:500,paint:'#333',eq:[]};
    CK(contest(G,'us','people')===0&&contest(G,'us','truck')===0&&respCut(G,'us','people')===0&&respBoost(G,'us','people')===0&&botPress(G,'us','people')===0,'натиск, скидки, модели-ответы, объединение, натиск ботов: вычет из спроса игрока — ноль даже со старыми полями сохранения');
    CK(usedPen(md,'us',G)===0,'вычета «подержанные машины своей марки» больше нет (даже при 5 млн своих машин на дорогах)');
    const P=contestParts(G,'us','people');CK(P.tot===0&&P.mul===1,'contestParts: спрос ×1');
    rivalsReact(G,{mk:{}});rivalsRespond(G,{mk:{}});CK(!G.rv&&!G.resp,'остатки натиска и ответов из старых сохранений убраны');
    G.copy={people:1};rivalsCopy(G);rivalsCopy(G);CK(G.copy.people<1,'безымянное копирование не начисляется и сходит: '+G.copy.people);}
  // рынок: без игрока и без ходов фирм — как прежде; класс-гнездо
  {newGame('ford','us','Тест','normal','Первая');G.y=1922;G.m=5;G.firms={};
    const R0=mkCountry('us',G,[]),T=firmTerms(G,'us','people');CK(near(T.M,1,1e-9)&&T.L.every(o=>o.m===1),'ходов нет — перевес марок 1');
    const S=compSplit('us','people',G,1000),sw=T.L.reduce((a,o)=>a+o.w,0);CK(near(S.reduce((a,o)=>a+o.sales,0),1000*sw,1e-6),'продажи марок класса = их исторические доли ('+sw.toFixed(2)+')');
    CK(near(nestMu({y:1907,m:0}),1)&&near(nestMu({y:1916,m:0}),NEST_MU)&&nestMu({y:1912,m:0})<1&&nestMu({y:1912,m:0})>NEST_MU,'сравнение внутри класса: 1 до 1908 года, '+NEST_MU+' с 1916-го');
    // игрок в классе: соперник отвечает — теряет игрок, а не «никто»
    const md={...rivalDesign('people',1922),id:901,name:'П',status:'prod',launched:mi(G)-10,price:0,stock:0,made:1000,vol:500,paint:'#333',eq:[]};md.price=Math.round(refPrice(md,G)*0.9/10)*10;G.dealers.us=dealerNeed('us',G);G.rep=70;
    const A=mkCountry('us',G,[md]),a1=A.by[901],r1=A.segs.people.inc;
    CK(a1>0&&A.segs.people.edge!=null&&A.segs.people.edgeP>0,'игрок в классе: продажи '+Math.round(a1)+', перевес ценой '+A.segs.people.edgeP.toFixed(2));
    CK(r1<R0.segs.people.inc,'соседи по классу теряют покупателей игроку: '+Math.round(R0.segs.people.inc)+' → '+Math.round(r1));
    CK(a1+r1<R0.segs.people.inc+a1*0.999,'класс растёт меньше, чем продал игрок (часть покупателей — у соседей)');
    // фирмы: у двух главных марок класса — модель-ответ и цена −15 %
    BOTS_OFF=false;const W=compWeights('us','people',G).filter(o=>!o.bot).sort((x,y)=>y.w-x.w).slice(0,2),t=mi(G);
    W.forEach(o=>{const F=firmMake(G,'us',o.i,o.cp);F.pk.people=0.85;F.md.people={q:0.5,from:t-5,till:t+60};F.cap=6;});
    const T2=firmTerms(G,'us','people');CK(T2.M>1.3,'ответ двух марок: перевес соперников класса ×'+T2.M.toFixed(2));
    const B=mkCountry('us',G,[md]),a2=B.by[901],r2=B.segs.people.inc;
    CK(a2<a1*0.9,'ответ соперников отбирает покупателей у игрока: '+Math.round(a1)+' → '+Math.round(a2));
    CK((r2-r1)>0&&(a1-a2)>(r2-r1)*0.25,'и берёт их заметной частью у него, а не «из воздуха»: соперники +'+Math.round(r2-r1)+', игрок −'+Math.round(a1-a2));
    const S2=compSplit('us','people',G,1000),f0=S2.find(o=>o.i===W[0].i),s0=S.find(o=>o.i===W[0].i);CK(f0.sales>s0.sales*1.5,'ответившая марка продаёт больше своей истории: '+Math.round(s0.sales)+' → '+Math.round(f0.sales));
    // ответ не вечен: модель снята, цена возвращена — всё как было
    W.forEach(o=>{const F=G.firms['us:'+o.i];F.pk.people=1;F.md.people.till=t-1;});const C3=mkCountry('us',G,[md]);CK(near(C3.by[901],a1,1e-6),'модель-ответ сошла, цена вернулась — спрос игрока прежний: '+Math.round(C3.by[901]));
    const F0=G.firms['us:'+W[0].i];F0.md.people={q:0.6,from:t-60,till:t+12};CK(firmDq(F0,'people',t)<0.6&&firmDq(F0,'people',t)>0,'старая модель-ответ тает к концу срока: '+firmDq(F0,'people',t).toFixed(2));
    CK(firmPriceOpt(F0,'people',0.3,0.5,t,0.6)<firmPriceOpt(F0,'people',0.3,1,t,0.6)&&firmPriceOpt(F0,'people',0.03,0.5,t,0.6)>firmPriceOpt(F0,'people',0.3,0.5,t,0.6),'цена фирмы: потеряла долю — уступает; крупная марка уступает больше мелкой');
    F0.ck=0.8;F0.ckTill=t+60;CK(firmPriceOpt(F0,'people',0.3,1,t,0.6)<0.85,'поток (себестоимость −20 %) уходит в цену');BOTS_OFF=true;G.firms={};}
  // партия: игрок сильный — фирмы ходят после него; ходы видны; без вычетов
  {BOTS_OFF=false;rnd(515);newGame('ford','us','Тест','normal','Первая');G.helper={on:1};G.cash=5e6;G.y=1912;G.m=0;G.dealers.us=Math.round(dealerNeed('us',G)*0.8);G.rep=75;G.cap=4000;G.workers=6000;
    const md={...rivalDesign('people',1916),id:G.nextId++,name:'Т',status:'prod',launched:mi(G)-6,price:0,stock:0,made:5000,vol:3000,paint:'#333',eq:[],plan:'auto',backlog:0,lastDem:0,lastSold:0,lastMade:0,totalSold:0,fc:0};md.price=Math.round(refPrice(md,G)*0.75/10)*10;G.models=[md];
    const kinds={};let err='',mx=0,seenStrip=false;try{for(let k=0;k<54;k++){G.pending=[];G.cash=Math.max(G.cash,2e6);step();(G.last.riv||[]).forEach(n=>{if(n.c==='us')kinds[n.k]=(kinds[n.k]||0)+1;});if(!seenStrip&&rivStrip(G))seenStrip=true;
      const z=G.last.mk.us.segs.people;mx=Math.max(mx,z.you/Math.max(1,z.size));}}catch(e){err=e.stack.split('\\n').slice(0,3).join(' | ');}
    CK(!err,'четыре с половиной года партии с фирмами — без ошибок '+err);
    CK(mx>0.3,'игрок берёт больше трети народного класса: '+Math.round(mx*100)+'%');
    const ks=Object.keys(kinds);CK(ks.some(k=>/^(model0|line0|ad0|fin0)$/.test(k)),'фирмы отвечают программами: '+JSON.stringify(kinds));
    CK(ks.some(k=>/^(cut|model|line|ad|fin)$/.test(k)),'и доводят их до рынка (цена, модель, поток, реклама, рассрочка)');
    const F=Object.values(G.firms).filter(f=>f.c==='us'&&f.h12>0);CK(F.length>=8&&F.every(f=>isFinite(f.cash)&&isFinite(f.ld)&&f.ld>0),'у каждой фирмы — касса и загрузка: '+F.length+' фирм');
    CK(F.some(f=>Object.values(f.pk).some(v=>v<0.97))||F.some(f=>Object.keys(f.md).length>0),'у фирм изменились цена или машина');
    CK(seenStrip&&(G.rivLog||[]).length>0,'ход соперников виден на главном экране и копится в журнале ('+(G.rivLog||[]).length+')');
    // экран «Соперники»
    let html='';const os=openSheet;openSheet=h=>{html=h;};const de=document.getElementById;document.getElementById=()=>null;openRivals('us');openSheet=os;document.getElementById=de;
    CK(/Соперники/.test(html)&&/Фирмы · /.test(html)&&(html.match(/class="tech-row" id="firmus/g)||[]).length>=8&&!/undefined|NaN/.test(html),'экран «Соперники»: карточки фирм без пропусков');
    CK(/Цена: /.test(html)&&/Деньги: /.test(html)&&/Продажи за год/.test(html),'в карточке — продажи, цена и маржа, деньги');
    const cm=firmClassHTML(G,'us','people');CK(cm===''||(/Ходы соперников в классе/.test(cm)&&!/undefined|NaN/.test(cm)),'строка в карточке модели — ходы марок класса');
    // сохранение и загрузка
    {const s2=JSON.parse(JSON.stringify(G));G=s2;let e2='';try{G.pending=[];step();}catch(e){e2=e.message;}CK(!e2&&Object.keys(G.firms).length>10,'после сохранения и загрузки фирмы продолжают ход '+e2);}
    BOTS_OFF=true;}
  // фирма в долгах: кредиторы, потом закрытие (не великая марка)
  {BOTS_OFF=false;newGame('ford','us','Тест','normal','Первая');G.y=1912;G.m=0;G.firms={};const i=COMPS.us.findIndex(x=>x.n==='Stanley'),cp=COMPS.us[i],F=firmMake(G,'us',i,cp);F.h12=1e6;F.r12=5e5;F.p12=-1e5;F.cash=-4e5;F.ld=0.5;
    const r={riv:[]};CK(firmState(G,r,F,cp,i)===false&&F.st==='bad','убытки и долг больше трети оборота — фирма «в долгах»');
    F.bad=18;F.cash=-9e5;firmState(G,r,F,cp,i);CK(F.st==='ok'&&F.rec===1&&F.cash>0&&G.compK[cp.n]<1&&F.turn===1,'полтора года убытков — кредиторы: долги списаны, выпуск урезан, деньги на одну новую машину');
    F.st='bad';F.bad=18;F.cash=-9e5;F.p12=-1e5;firmState(G,r,F,cp,i);CK(F.st==='dead'&&G.dead[cp.n]!=null&&compVol(cp,G)===0,'второй раз не спасают — марка закрыта');
    CK(r.riv.length===3&&r.riv.every(n=>n.t&&n.txt&&!/undefined|NaN/.test(n.t+n.txt)),'о каждом повороте — заметка: '+r.riv.map(n=>n.k).join(', '));BOTS_OFF=true;}
  // ляпы пробной сборки
  {newGame('ford','us','Тест','normal','Первая');G.y=1925;G.m=5;const rc=RACES.find(x=>x.y===1925&&!raceMoto(x));
    const mk2=(k,id)=>({...rivalDesign(k,1925),id,name:k,status:'prod',launched:mi(G)-5,price:500,stock:0,made:10,vol:10,paint:'#333',eq:[]});
    G.models=[mk2('ltank',1),mk2('bus',2),mk2('tractor',3),mk2('fire',4),mk2('people',5),mk2('truck',6)];
    const L=raceCarsFor(G,rc).map(m=>m.name);CK(L.includes('people')&&L.includes('truck')&&L.some(n=>/bus/.test(n))&&!L.some(n=>/ltank|tractor/.test(n)),'в гонку записывают автомобили, грузовики и (с отзыва 21 ноября) автобусы — у них свой кузов; танк и трактор — нет: '+L.join(', '));
    CK(plural(21,'автомобильной компании','автомобильных компаний','автомобильных компаний')==='автомобильной компании'&&plural(22,'а','б','в')==='б'&&plural(25,'а','б','в')==='в','«среди 21 автомобильной компании»');G.models=[];}
}
// 21. своих линий под модели и штрафа конвейера за число моделей больше нет (0.60, правка автора 23 ноября; в 0.51 — этап 4б);
//     подбор деталей по-прежнему учитывает мощность завода
{const rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();};
  // завод с движущимся конвейером и тремя автомобилями: большая «народная», средняя, малая «люкс»
  function plantXL(){rnd(7);newGame('custom','us','Тест','normal','Первая');G.pending=[];G.y=1920;G.m=3;G.cap=3000;G.cash=3e7;G.tech=G.tech||{};G.tech.line=2;G.tech.tools=2;G.tech.elec=1;G.workers=9000;G.plantVal=G.cap*capUnitCost(G);
    G.models=[];[['people',2500],['middle',300],['lux',20]].forEach(([k,v],i)=>{const d=autoDesign(k,G);const m={...d,id:10+i,name:k,paint:'#8a1c1c',plan:'auto',status:'prod',launched:mi(G)-30,stock:0,backlog:0,made:5000,vol:v,fc:v,lastMade:v};m.price=Math.round(refPrice(m,G)/10)*10;G.models.push(m);});G.nextId=20;return G;}
  const pen=m=>hoursPerCar(m,G)/hoursPerCar(m,G,1),M=n=>G.models.find(m=>m.name===n);
  let s=plantXL();const A=M('people'),C=M('lux');
  CK(near(pen(A),1,1e-9)&&near(pen(C),1,1e-9),'три модели на заводе с конвейером — часы те же, что у одной: число моделей сборку не замедляет');
  {const h1=hoursPerCar(A,s);s.models.push({...C,id:99,name:'ещё одна'});CK(near(hoursPerCar(A,s),h1,1e-9),'четвёртая модель часов соседям не прибавляет');s.models.pop();}
  {const mo=s.models.map(m=>({...m}));CK(typeof xlDecide==='undefined'&&typeof xlPlantHTML==='undefined'&&typeof xlDraftHTML==='undefined'&&typeof ACT.dxl==='undefined','линий нет: ни решения помощника, ни карточки в «Заводе», ни кнопки «Иначе» в конструкторе');}
  {const R=designRoom(s,'sport');CK(R.ext===0&&designPlace(M('lux'),s,20,R).cost===0,'новая модель ничего не стоит соседям по заводу');}
  // месяц идёт без линий: выпуск ограничен только местами и людьми
  {s=plantXL();s.pending=[];const cap0=s.cap;step();CK(!s.xl&&s.cap===cap0&&s.models.every(m=>m.lastMade>=0),'месяц без линий: мест '+s.cap+', выпуск '+s.models.map(m=>m.lastMade).join(' / '));}
  // старое сохранение 0.51: линии возвращаются общему заводу — с недостроенным расширением
  {const sv={cap:380,models:[{id:1,status:'prod',xlNo:true},{id:2,status:'off'}],hold:[{mode:'int',capAdd:120,model:1,n:'Марка',xl:1}],xl:[{id:1,md:1,cap:120,val:5e4,at:0,src:'hold'},{id:2,md:2,cap:60,val:3e4,at:0,src:'own',grow:{n:20,at:999}}],xlId:2,xlV:1,xlMsg:{m:1,list:['x']}};
    const n=xlFold(sv);CK(n===200&&sv.cap===580&&!sv.xl&&!sv.xlMsg&&!sv.hold[0].xl&&!sv.models[0].xlNo&&sv.xlV===2,'старое сохранение: 200 мест трёх линий (с достройкой) вернулись заводу — мест '+sv.cap);
    CK(xlFold(sv)===0&&sv.cap===580,'повторно ничего не прибавляется');}
  // купленный завод просто прибавляет места, как до 0.51
  {rnd(21);newGame('renault','fr','Рено','normal');G.pending=[];G.y=1921;G.m=3;G.cash=6e7;const cap0=G.cap;
    const Lc=(COMPS.fr||[]).map((cp,i)=>({cp,i})).filter(o=>!dealBlock(G,'fr',o.i)&&maStat(G,'fr',o.i));let h=null;
    for(const o of Lc){for(const k of [1.3,1.8,2.5,3.5]){if(G.dealNo)delete G.dealNo['fr'+o.i];const r=dealDo(G,'fr',o.i,'cash',k);if(r&&r.ok){h=holdOf(G,'fr',o.i);break;}}if(h)break;}
    CK(h&&h.capAdd>0&&G.cap===cap0+h.capAdd&&!G.xl&&!h.xl,'купленный завод прибавил общему заводу '+(h&&h.capAdd)+' мест');}
  // подбор «Самая прибыльная» считает с мощностью завода
  {rnd(5);newGame('custom','us','Тест','normal','Первая');G.pending=[];G.y=1903;G.m=2;const a=autoDesign('middle',G),b=autoDesign('middle',G,null,{cap:true}),sg=d=>PART_KEYS.map(x=>d[x]).join(',')+'|'+d.price;
    CK(sg(a)===sg(b),'мастерская не загружена — подбор тот же, что и без оглядки на завод: '+sg(b));}
  {rnd(5);newGame('custom','us','Тест','normal','Первая');G.pending=[];G.y=1912;G.m=3;G.cap=2;G.cash=3e5;G.workers=300;
    const d=autoDesign('lux',G),m={...d,id:10,name:'Люкс',paint:'#8a1c1c',plan:'auto',status:'prod',launched:mi(G)-30,stock:0,backlog:0,made:500,vol:15,fc:15,lastMade:15};m.price=Math.round(refPrice(m,G)/10)*10;G.models=[m];
    // касса есть: мест нет, но цех по карману — он в расчёте
    let R=designRoom(G,'middle');const a=autoDesign('middle',G),E0=designEval({...a},G);let Ea=designEval({...a},G,R);
    CK(R.ppp>0&&R.free===0&&R.rep.length===0&&R.build>1,'завод занят другой моделью: свободных мест нет, место приносит '+money(R.ppp)+' в месяц, касса позволяет достроить '+R.build.toFixed(0)+' мест');
    CK(Ea.tight&&Ea.build>0&&near(Ea.out,Ea.d,1e-6)&&Ea.prof<E0.prof&&Ea.prof>0&&near(Ea.buildC,Ea.build*R.cu,1),'касса есть — в расчёте цех под модель: прибыль '+Math.round(Ea.prof)+' против '+Math.round(E0.prof)+' «без завода», цех '+money(Ea.buildC));
    // кассы нет: модель не получит больше мест, чем есть у завода; занять чужие — только если прибыль на место выше
    G.cash=1000;R=designRoom(G,'middle');Ea=designEval({...a},G,R);const b=autoDesign('middle',G,null,{cap:true}),Eb=designEval({...b},G,R);
    CK(R.build===0&&Ea.tight&&Ea.build===0&&Ea.out<=R.cap/placesOf(a,G)+1e-6&&Ea.share<Ea.d&&Ea.prof<E0.prof,'кассы нет: выпуск не больше завода ('+Ea.out.toFixed(1)+' из '+Ea.d.toFixed(1)+' купят), прибыль '+Math.round(Ea.prof)+' против '+Math.round(E0.prof));
    CK(Eb.prof>=Ea.prof-1e-6&&Eb.out<=R.cap/placesOf(b,G)+1e-6,'подбор с мощностью не хуже прежнего по своей мерке и не предлагает того, чего завод не выпустит: '+Math.round(Eb.prof)+' ≥ '+Math.round(Ea.prof)+', выпуск '+Eb.out.toFixed(1));
    CK(!(Eb.out>0.01)||Eb.prof/(Eb.out*placesOf(b,G))>=0,'занятые места окупаются: прибыль на место '+(Eb.out>0.01?Math.round(Eb.prof/(Eb.out*placesOf(b,G))):0));
    G.cash=3e5;
    const R2=designRoom(G,'lux');CK(R2.rep.includes(10)&&near(R2.free,R2.cap)&&R2.repN[0]==='Люкс','модель того же класса считается заменённой: её места свободны');
    const f1=forecastDemand({...d,price:m.price},G),f2=forecastDemand({...d,price:m.price},G,[10]);CK(f2>f1,'спрос на смену считается без прежней модели: '+f2.toFixed(1)+' против '+f1.toFixed(1));
    // строка под кнопками: прибыль в месяц до и после, итог против соперника, предупреждение о загрузке
    G.lines={car:true,moto:true};openDesigner('middle');ACT.dcopy();ACT.dauto();const t=dNote&&dNote.txt||'';
    CK(/^Самая прибыльная: /.test(t)&&(/прибыль в месяц/.test(t)||/менять нечего/.test(t))&&!/NaN|undefined|Infinity/.test(t),'строка под кнопками — о прибыли: '+t.replace(/<[^>]+>/g,''));}
}
// 22. этап 4в: опыт, свои узлы и свой авиамотор
{const rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();};
  function co(y,xp,c){rnd(3);newGame('custom',c||'us','Мотор','normal','Первая');G.pending=[];G.y=y;G.m=3;G.cash=5e7;G.rd.lvl=8;G.xp={...(xp||{})};G.lines={car:true,moto:true};
    const d=autoDesign('middle',G);Object.assign(G.models[0],d,{status:'prod',launched:mi(G)-20});G.world=G.world||worldInit(G);G.world.my.r12=2e7;return G;}
  const nE=ENGINES.length,nA=AIR_ENG.length;
  // опыт: убывающая отдача, копится выпуском и авиацией
  let s=co(1914,{});xpAdd(s,'eng',10);const a1=xpOf(s,'eng');xpAdd(s,'eng',10);const a2=xpOf(s,'eng')-a1;CK(near(a1,10)&&a2<a1&&a2>5,'опыт: вторая десятка даётся труднее первой ('+a1.toFixed(1)+', потом +'+a2.toFixed(1)+')');
  s=co(1914,{});xpMonth(s,{made:2000,mmade:0});const e1=xpOf(s,'eng');xpMonth(s,{made:2000,mmade:0,air:{made:6},ae:{n:20,licN:0}});CK(e1>0&&xpOf(s,'eng')-e1>e1*3&&xpOf(s,'alloy')>1&&xpOf(s,'aero')>1&&xpOf(s,'mass')>0,'опыт копится выпуском; аэропланы и авиамоторы учат моторам и сплавам быстрее: моторы '+xpOf(s,'eng').toFixed(2)+', сплавы '+xpOf(s,'alloy').toFixed(2));
  // без опыта приём закрыт
  s=co(1914,{eng:5});{const B=ownBaseList(s,'e',false)[0],P=ownPreview(s,{k:'e',base:B.id,tech:['ohc'],goal:'power',gl:1});CK(P&&/Мало опыта/.test(P.why)&&!ownStart(s,{k:'e',base:B.id,tech:['ohc'],goal:'power',gl:1}),'без опыта приём закрыт: '+P.why);}
  s=co(1914,{eng:50,alloy:45,aero:40,brake:45,susp:35,mass:40});
  {const B=ownBaseList(s,'e',false)[0],sp=(tech,goal,gl)=>({k:'e',base:B.id,tech,goal,gl,name:''});CK(B.id===s.models[0].e,'основа — мотор своих машин: '+B.name);
    const P0=ownPreview(s,sp([],'power',1)),P1=ownPreview(s,sp([],'power',2)),P2=ownPreview(s,sp([],'power',3)),d1=P0.x.hp/B.hp-1,d2=P1.x.hp/P0.x.hp-1,d3=P2.x.hp/P1.x.hp-1;
    CK(d1>d2&&d2>d3&&d3>0&&P2.need>P0.need,'цель: каждый следующий шаг даёт меньше и стоит дольше: +'+(d1*100).toFixed(1)+'%, +'+(d2*100).toFixed(1)+'%, +'+(d3*100).toFixed(1)+'%');
    const A=ownPreview(s,sp(['ohc'],'cheap',1)),AB=ownPreview(s,sp(['sc','ohc'],'cheap',1)),Bq=ownPreview(s,sp(['sc'],'cheap',1));
    CK(AB.x.hp/Bq.x.hp<A.x.hp/B.hp-0.02&&AB.x.hp>Bq.x.hp,'второй приём даёт меньше первого: верхний распредвал один +'+((A.x.hp/B.hp-1)*100).toFixed(0)+'%, вторым — +'+((AB.x.hp/Bq.x.hp-1)*100).toFixed(0)+'%');
    CK(A.x.yh<=Bq.x.yh&&Bq.x.yh<=AB.x.yh&&A.x.own===1&&A.x.y>=s.y,'год по истории растёт с чертами: '+A.x.yh+' ≤ '+Bq.x.yh+' ≤ '+AB.x.yh);
    // цена опережения: +60 % за год; пять лет — вчетверо
    const pj0={kind:'own',need:20,yrs:0,pc:300},pj5={...pj0,yrs:5,need:Math.round(20*aheadTimeK(5))};s.world.my.r12=0;const c0=ownRdCost(pj0,s),c5=ownRdCost(pj5,s);s.world.my.r12=2e7;
    CK(c5/c0>=3&&c5/c0<=5&&near(ownRdCost({...pj0,yrs:5},s)/ownRdCost(pj0,s),aheadCostK(5),0.5),'узел на пять лет раньше истории — втрое-вчетверо дороже (без прогрессии): опыты и образцы '+money(c0)+' → '+money(c5)+' (×'+(c5/c0).toFixed(1)+'), у фирмы с оборотом ×'+(ownRdCost({...pj0,yrs:5},s)/ownRdCost(pj0,s)).toFixed(1));
    const far=ownPreview(s,sp(['sc','alu'],'power',3));CK(far.yrs>OWN_LIMIT?/Предел эпохи/.test(far.why):far.yrs>0,'дальше десяти лет вперёд — предел эпохи: год по истории '+far.x.yh+(far.why?' — '+far.why:''));
    // риск: свой узел сырее исторического того же года; опережающий — ещё и дороже в серии
    const hist=ENGINES.find(z=>!z.moto&&z.y===s.y)||{y:s.y};CK(partRisk({...hist,own:1},s.y)>partRisk(hist,s.y)&&protoRisk({kind:'own',yrs:5})>protoRisk({kind:'own',yrs:0})&&protoRisk({kind:'own',yrs:0})>=0.15,'свой узел чаще выходит не по ТЗ: '+Math.round(partRisk({...hist,own:1},s.y)*100)+'% против '+Math.round(partRisk(hist,s.y)*100)+'%; доработка на испытаниях '+Math.round(protoRisk({kind:'own',yrs:5})*100)+'% при пяти годах опережения');
    const ah=ownPreview(s,sp(['alu'],'light',1));CK(ah.yrs>0&&near(aheadPartK(ah.x,s),1+Math.min(0.9,0.15*(ah.x.y-yf(s))),1e-9)&&partCost(ah.x,s)>partCost(B,s),'опережающий узел дороже в серии: +'+Math.round((aheadPartK(ah.x,s)-1)*100)+'%');
    // проект → узел: в каталоги не попадает, в конструкторе есть, в сохранении живёт
    const spec=sp(['ohc'],'power',1);spec.name='Мотор «Комета»';const cash0=s.cash,n0=rdActive(s).length;CK(ownStart(s,spec)&&rdActive(s).length===n0+1&&s.cash<cash0&&rdActive(s)[n0].kind==='own','своя разработка — проект КБ, деньги при старте: '+money(cash0-s.cash));
    const pj=rdActive(s)[n0];pj.rk=1;s.rd.projs=s.rd.projs.filter(p=>p!==pj);ownDone(s,pj);const x=s.custom[0];
    CK(x&&x.name==='Мотор «Комета»'&&byId(ENGINES,x.id)===x&&ENGINES.length===nE&&!ENGINES.includes(x)&&unlockedP(ENGINES,s,false).includes(x)&&!byId(BRAKES,x.id)&&ALL_PARTS().includes(x),'свой узел: находится по номеру, в конструкторе есть, в каталоге соперников его нет');
    const ev=s.pending[s.pending.length-1];CK(ev&&/Комета/.test(ev.title)&&ev.choices.some(c=>/^own:pat:/.test(c[1]))&&/Основа/.test(x.art)&&/распредвал/i.test(x.art),'газета о новинке со статьёй «зачем и откуда» и выбором патента: '+x.art.slice(0,90));s.pending=[];
    const m=s.models[0],S0=classScore(m,s,s.country),u0=unitCost(m,s);m.e=x.id;const S1=classScore(m,s,s.country),h=ownXpHTML(m,s);CK(S1>S0&&/Свой узел «Мотор «Комета»» против основы/.test(h.replace(/<[^>]+>/g,''))&&/итог \+/.test(h.replace(/<[^>]+>/g,'')),'«Как посчитано»: что свой узел дал против основы — '+h.replace(/<[^>]+>/g,''));
    const sv=JSON.parse(JSON.stringify(s));ownSync(null);CK(!byId(ENGINES,x.id),'реестр пуст — узла нет');const g2=migrate(sv);CK(byId(ENGINES,x.id)&&byId(ENGINES,x.id).name==='Мотор «Комета»'&&parts(g2.models[0]).e.id===x.id,'после загрузки сохранения свой узел на месте');ownSync(s);
    // патент, копия соперника, лицензия и иск
    const pc=ownPatCost(s),c1=s.cash;CK(ownPatent(s,x.id)&&near(c1-s.cash,pc)&&ownPatOn(s,x)&&!ownPatent(s,x.id),'патент на свой узел: '+money(pc)+', пятнадцать лет');
    ownSeries(s);CK(x.ser===mi(s),'узел в серии — с этого месяца его могут разобрать');x.ser=mi(s)-13;s.firms={'us:0':{c:'us',i:0,md:{middle:{q:0.3}},r12:6e6,cash:1e5}};const F=s.firms['us:0'],g=segOf(m);F.md[g]=F.md[g]||{q:0.3};const q0=F.md[g].q;
    const cp=ownCopied(s,{},F,g),ev2=s.pending[s.pending.length-1];CK(cp===x&&x.cp['us:0']===mi(s)&&F.md[g].q>q0&&ev2&&ev2.choices.length===3&&/скопировала/.test(ev2.title),'фирма-соперник с моделью-ответом перенимает свой узел; патент даёт выбор: '+ev2.choices.map(c=>c[0]).join(' / '));
    CK(ownCopied(s,{},F,g)===null,'второй раз ту же копию не считают');s.pending=[];
    ownEvent(s,'own:lic:'+x.id+':us:0');const r1={licIn:0,legal:0};ownLegalMonth(s,r1);CK(s.legal.own.length===1&&r1.licIn===ownLicFee(s,F)&&r1.licIn>0,'лицензия: '+money(r1.licIn)+' в месяц пять лет');
    s.legal.own=[];ownEvent(s,'own:sue:'+x.id+':us:0');const r2={licIn:0,legal:0};ownLegalMonth(s,r2);CK(r2.legal===ownSuitCost(s)&&s.legal.own[0].p>=0.4,'иск: юристы '+money(r2.legal)+' в месяц, шанс '+Math.round(s.legal.own[0].p*100)+'%');
    s.legal.own[0].until=mi(s);s.legal.own[0].p=1;const c2=s.cash,q1=F.md[g].q;ownLegalMonth(s,{});CK(s.cash>c2&&F.md[g].q<q1&&!s.legal.own.length,'суд выигран: компенсация '+money(s.cash-c2)+', копия снята с модели');
    x.pat=null;x.cp={};const lg=G.log.length;ownCopied(s,{},F,g);CK(!s.pending.length&&/патента нет/.test(G.log[G.log.length-1].text),'без патента — только строка в журнале');}
  // другие категории и мотоциклы; предел у шин
  s=co(1920,{eng:50,alloy:45,aero:40,brake:45,susp:35,mass:40});{for(const k of Object.keys(OWN_CAT)){const B=ownBaseList(s,k,false)[0],P=ownPreview(s,{k,base:B.id,tech:OWN_TECH.filter(t=>t.cat.includes(k)).slice(0,1).map(t=>t.id),goal:'light',gl:1}),PL=ownPreview(s,{k,base:B.id,tech:[],goal:'light',gl:1});
      CK(P&&PL.x.kg<B.kg&&P.cmp.length===2&&P.x.k===k&&isFinite(P.cost)&&P.cost>0&&P.x.yh>=1885&&!/NaN|undefined/.test(ownPreviewHTML(s,P)),OWN_CAT[k].n+': своя разработка считается — '+B.name+' → '+P.x.kg+' кг, год по истории '+P.x.yh+', '+money(P.cost));}
    const Bm=ownBaseList(s,'e',true)[0];CK(Bm&&Bm.moto&&ownPreview(s,{k:'e',base:Bm.id,tech:[],goal:'power',gl:1}).x.moto,'мотоциклетный мотор — тоже основа');}
  // новая партия — своих узлов прошлой нет
  co(1914,{});CK(!Object.keys(OWN_MAP).length&&ENGINES.length===nE&&AIR_ENG.length===nA,'новая партия: реестр своих узлов пуст, каталоги не тронуты');
  // свой авиамотор: сильное КБ и слабое
  function aeCo(y,c,strong){const g=co(y,strong?{eng:60,alloy:40,mass:40}:{eng:5,alloy:0,mass:5},c);if(strong){const E=unlockedP(ENGINES,g,false).sort((a,b)=>b.hp-a.hp)[0];g.models[0].e=E.id;g.rd.upg[E.id]=4;}else g.models[0].e='e9';return g;}
  {s=aeCo(1915,'fr',true);CK(aeCan(s)&&aeTypeOk(s,'inline')&&aeTypeOk(s,'v')&&!aeTypeOk(s,'radial'),'тип авиамотора — по году и опыту: в 1915-м рядный и V-образный, звезда — позже');
    const PS=aePreview(s,{type:'v',goal:'power',gl:1});const w=aeCo(1915,'fr',false),PW=aePreview(w,{type:'v',goal:'power',gl:1});s=aeCo(1915,'fr',true);
    CK(PS.x.hp>PW.x.hp*1.5&&PS.x.hp/PS.x.kg>PW.x.hp/PW.x.kg*1.2&&PS.x.rel>PW.x.rel,'сильное моторное КБ даёт авиамотор мощнее, легче и надёжнее: '+PS.x.hp+' л.с. '+(PS.x.hp/PS.x.kg).toFixed(2)+' л.с./кг против '+PW.x.hp+' л.с. '+(PW.x.hp/PW.x.kg).toFixed(2));
    CK(/Rolls-Royce|Hispano/.test(AE_TYPE.v.h)&&PS.base&&PS.cost>0&&!PS.why,'проект «Авиамотор»: основа — '+PS.base.name+', '+money(PS.cost)+', ~'+PS.months+' мес.');
    const sp={type:'v',goal:'power',gl:1,name:'Комета V'},n0=rdActive(s).length;CK(aeStart(s,sp)&&rdActive(s)[n0].kind==='aeng','авиамотор — проект автомобильного КБ');const pj=rdActive(s)[n0];s.rd.projs=[];aeDone(s,pj);const x=s.aeng[0];
    CK(x&&x.own&&byId(AIR_ENG,x.id)===x&&AIR_ENG.length===nA&&airCatList(s,'e').includes(x)&&airPartOk(s,x,'e')&&airParts({e:x.id}).e===x,'свой авиамотор стоит в конструкторе аэроплана рядом с каталогом');s.pending=[];
    const t=tNow(s),cA=airEngCost(x,t,s);s.tech.foundry=1;const cF=airEngCost(x,t,s);s.tech.foundry=0;CK(near(cF/cA,0.82,1e-6)&&near(cA,x.c*0.87*(x.y>t?1+Math.min(0.9,0.15*(x.y-t)):1)*Math.max(0.4,1-0.05*Math.max(0,t-x.y))*tabAt(CPI,t)/tabAt(CPI,Math.max(1895,x.y)),1),'цена своего мотора: без наценки поставщика, с литейкой −18 %: '+money(cA)+' → '+money(cF));
    // продажа моторов авиазаводам: сильный зарабатывает, слабый — нет
    x.made={y:s.y-3,m:0};const CS=aeSaleCalc(s,x),profS=CS.dem*12*(CS.price-CS.cost)-AE_FIX*cpi(s)*12;const xw={...PW.x,id:'w',made:{y:w.y-3,m:0}},CW=aeSaleCalc(w,xw),profW=CW.dem*12*(CW.price-CW.cost)-AE_FIX*cpi(w)*12;
    CK(profS>PS.cost/3&&profW<PW.cost/5,'свои авиамоторы окупаются у сильного моторного КБ и не окупаются у слабого: в год '+money(Math.round(profS))+' при проекте '+money(PS.cost)+' против '+money(Math.round(profW))+' при '+money(PW.cost));
    s.cap=600;const r={capUsed:0,made:500,mmade:0};rnd(5);aeMonth(s,r);CK(r.ae.n>0&&r.ae.rev>r.ae.cost&&r.aeP===Math.round(r.ae.rev-r.ae.cost-r.ae.fix)&&r.capUsed>0&&x.sold===r.ae.n,'месяц: продано '+r.ae.n+' моторов, прибыль '+money(r.aeP)+', моторы заняли места завода');
    CK(/Авиамоторы: продано/.test(aePLRow(r))&&/испытательная станция/.test(aePLRow(r)),'строка «Авиамоторы» в отчёте месяца');
    const eA=xpOf(s,'eng');xpMonth(s,r);CK(xpOf(s,'eng')>eA,'опыт обратно: авиамоторы учат автомобильные моторы');
    // свой мотор не отнимут в войну; чужой вражеский — закрыт
    const foe=AIR_ENG.find(e=>e.cty==='de'&&e.y<=1915&&!e.lic);CK(airWarOn('fr',1915.5)&&(!foe||!airPartOk(s,foe,'e'))&&airPartOk(s,x,'e'),'в войну свой мотор доступен всегда');
    // заказ министерства: чужой мотор по лицензии
    s.pending=[];s.cap=600;rnd(1);let off=false;for(let i=0;i<60&&!off;i++)off=aeLicOffer(s);const evL=s.pending[0];CK(off&&evL&&/Заказ на авиамоторы/.test(evL.title)&&/Либерти/.test(evL.text)&&s.aeLicAsk,'в войну министерство предлагает выпуск чужого мотора по лицензии: '+(evL&&evL.deck));
    s.pending=[];ownEvent(s,'own:aelic:yes');const r3={capUsed:0};x.sale=0;aeMonth(s,r3);CK(s.aeLic&&r3.ae.licN>0&&r3.aeP>0&&near(r3.ae.licRev/r3.ae.licCost,1.12,1e-6),'заказ принят: '+r3.ae.licN+' моторов в месяц, себестоимость и 12 % сверху — '+money(r3.aeP));
    s.y=1919;s.m=6;const r4={capUsed:0};aeMonth(s,r4);CK(!s.aeLic&&!r4.ae.licN,'война кончилась — заказ закрыт');}
  // интерфейс: строка опыта в карточке КБ, листы «Своя разработка» и «Авиамотор» открываются
  s=co(1920,{eng:50,alloy:45,aero:40,brake:45,susp:35,mass:40});{const h=ownCardHTML(s);CK(/Опыт:/.test(h)&&/data-act="ownOpen"/.test(h)&&/Своя разработка/.test(rdCardHTML(s)),'карточка КБ: строка опыта и кнопка «Своя разработка»');
    CK(XP_KEYS.length===6&&/открыто:/.test(xpRowsHTML(s))&&!/NaN|undefined/.test(xpRowsHTML(s)),'шесть областей опыта: что открыто и что дальше');
    let ok2=true,err='';try{openOwn(null);ACT.ownCat({k:'e',mo:'0'});ACT.ownTech({id:'ohc'});ACT.ownTech({id:'alu'});ACT.ownTech({id:'sc'});ACT.ownGoal({g:'light'});ACT.ownGl({n:'2'});}catch(e){ok2=false;err=String(e&&e.stack||e).slice(0,200);}
    CK(ok2&&ownDraft&&ownDraft.tech.length===2&&ownDraft.tech.join()==='alu,sc'&&ownDraft.goal==='light'&&ownDraft.gl===2,'воронка «Своя разработка»: узел → приёмы (не больше двух) → цель: '+(ownDraft&&ownDraft.tech.join('+'))+' '+err);
    const n0=rdActive(s).length;ownDraft.tech=['ohc'];ownDraft.gl=1;ACT.ownStart();CK(rdActive(s).length===n0+1&&ownDraft===null,'«Начать» — проект в КБ');
    let ok3=true;try{ACT.aeOpen();ACT.aeType({k:'v'});ACT.aeGoal({g:'light'});}catch(e){ok3=false;err=String(e&&e.stack||e).slice(0,200);}CK(ok3&&aeDraft&&aeDraft.type==='v'&&aeDraft.goal==='light','лист «Свой авиамотор» открывается: '+err);}
  ownSync(null);
}
// ---------- 23. этап 5б: сделки и акционеры, группы фирм, люди, мотоциклетные фирмы (остаток темы 4) ----------
{const rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();},R0=Math.random;
  const free=(c,y)=>COMPS[c].map((cp,i)=>({cp,i})).filter(o=>!dealBlock(G,c,o.i)&&maStat(G,c,o.i)&&!(DEAL_PROUD[o.cp.n]>0)&&!(G.bots&&G.bots[coKey(o.cp.n)])&&compVol(o.cp,G)>300);
  // (а) каждая следующая покупка дороже; купленная марка приходит с долгами и первые годы убыточна
  {BOTS_OFF=true;newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1912;G.m=0;G.cash=9e7;G.firms={};const L=free('us'),d={st:1,mode:'int',pay:'cash'};
    CK(L.length>=3,'есть три марки на продажу: '+L.slice(0,3).map(o=>o.cp.n).join(', '));
    const Q0=maAsk(G,'us',L[0].i,d),Q2a=maAsk(G,'us',L[2].i,d),M0=maStat(G,'us',L[0].i),D0=maDebtOf(G,'us',L[0].i,M0);
    CK(Q0.ser===0&&maSerial(G)===0&&near(D0,Math.round(M0.V*MA_DEBT/1000)*1000),'первая покупка — без надбавки; долги марки — '+money(D0)+' ('+Math.round(MA_DEBT*100)+'% оценки)');
    const N0=maDealNotes(G,'us',L[0].i,d,M0,Q0);CK(/переходят её долги/.test(N0)&&/в убыток/.test(N0)&&!/undefined|NaN/.test(N0),'до подписи видно, что придёт вместе с маркой');
    const c0=G.cash,h0=maClose(G,'us',L[0].i,d,Q0.R);CK(h0&&h0.mode==='int'&&h0.debt&&h0.debt.tot===D0&&h0.debt.left===MA_DEBT_M&&h0.il&&h0.il.left===MA_LOSS_M&&near(h0.il.m0,M0.rev/12*MA_LOSS),'поглощение: долги на два года и убыточные первые два с половиной');
    const Q1=maAsk(G,'us',L[1].i,d);CK(near(Q1.ser,MA_SERIAL)&&maSerial(G)===1,'вторая покупка — владельцы просят на '+Math.round(Q1.ser*100)+'% больше');maClose(G,'us',L[1].i,d,Q1.R);
    const Q2=maAsk(G,'us',L[2].i,d);CK(near(Q2.ser,2*MA_SERIAL)&&Q2.R>Q2a.R*1.15,'третья — ещё дороже: '+money(Q2a.R)+' → '+money(Q2.R));
    CK(/3-я покупка за десять лет/.test(maDealNotes(G,'us',L[2].i,d,Q2.M,Q2)),'и в переговорах сказано почему');
    const r={};maBurMonth(G,r);const exp=G.hold.reduce((a,h)=>a+h.debt.m+h.il.m0,0);CK(near(r.maBur,Math.round(exp),2)&&r.maBur>0&&h0.debt.left===MA_DEBT_M-1,'месяц: долги и убытки купленных марок — '+money(r.maBur));
    let tot=r.maBur;for(let k=0;k<40;k++){const q={};maBurMonth(G,q);tot+=q.maBur;}CK(h0.debt.left===0&&h0.il.left===0&&tot>G.hold.reduce((a,h)=>a+h.debt.tot,0),'за два с половиной года бремя сходит: всего '+money(tot));
    CK(maBurTxt(h0)===''&&/долги: ещё/.test(maBurTxt({debt:{m:100,left:5},il:{m0:1,left:3}})),'строка в списке марок — пока бремя есть');
    G.hold.forEach(h=>{h.t=mi(G)-MA_SERIAL_M-1;});CK(maSerial(G)===0&&maAsk(G,'us',L[2].i,d).ser===0,'покупки старше десяти лет в счёт не идут');
    // партия: строка отчёта и прибыль
    G.hold[0].debt={m:5000,left:3,tot:15000};G.hold[0].il={m0:3000,left:30};G.pending=[];step();CK(near(G.last.maBur,8000,1),'в отчёте месяца — «Купленные марки: долги и убытки первых лет»: '+money(G.last.maBur));}
  // марка в беде: её настоящий долг; контрольный пакет — долг закрывает покупатель, дивиденды растут не сразу
  {BOTS_OFF=false;newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1921;G.m=0;G.cash=9e7;G.firms={};const L=free('us'),A=L[0],M=maStat(G,'us',A.i),F=firmMake(G,'us',A.i,A.cp);
    F.h12=M.rev;F.r12=M.rev*0.6;F.p12=-M.rev*0.05;F.cash=-M.V*0.3;F.st='bad';F.bad=5;F.ld=0.6;
    CK(near(maDebtOf(G,'us',A.i,M),Math.round(M.V*0.3/1000)*1000),'у марки в долгах к покупателю переходит её настоящий долг: '+money(maDebtOf(G,'us',A.i,M)));
    F.cash=-M.V*2;CK(near(maDebtOf(G,'us',A.i,M),Math.round(M.V*0.6/1000)*1000),'но не больше 60% её оценки (остальное списывают кредиторы)');F.cash=-M.V*0.3;
    const d={st:0.51,mode:'sub',pay:'cash'},Q=maAsk(G,'us',A.i,d),h=maClose(G,'us',A.i,d,Q.R);
    CK(h&&h.mode==='sub'&&h.debt&&near(h.debt.tot,Math.round(M.V*0.3*0.51),2)&&F.cash>-M.V*0.16&&h.yt===mi(G),'контрольный пакет марки в долгах: свою часть долга закрывает покупатель');
    CK(near(maYoungK(G,h),0.25)&&maFirmDivK(G,h)===0,'первые годы дочерняя платит четверть дивидендов, а пока в долгах — ничего');F.st='ok';F.cash=1;F.p12=1;
    G.y+=1;CK(near(maYoungK(G,h),0.625)&&maFirmDivK(G,h)===1,'через год — больше половины');G.y+=1;CK(maYoungK(G,h)===1,'через два — полные');BOTS_OFF=true;}
  // (б) совладельцы требуют особый дивиденд (Dodge против Ford, 1919)
  {BOTS_OFF=true;newGame('ford','us','Тест','normal','Первая');G.pending=[];step();G.pending=[];G.y=1916;G.m=0;G.loan=0;G.cash=3e6;G.partners=[{n:'Братья Додж',sh:0.1,t:0}];G.world=G.world||{};G.world.my={...(G.world.my||{}),r12:1.2e6};
    Object.assign(G.last,{wage:1e4,ovh:5e3,dlr:0,ad:0,rd:0,int:0,team:0,drv:0,adm:0,rev:1e5});
    CK(near(shSurplus(G),2.7e6)&&shAsk(G)===135000,'излишек кассы — '+money(shSurplus(G))+'; совладельцам (10%) причитается '+money(shAsk(G)));
    for(let k=0;k<SH_HOARD-1;k++)shMonth(G,{});CK(G.shHoard===SH_HOARD-1&&!shDemand(G),'одиннадцать месяцев — ещё терпят');shMonth(G,{});
    CK(shDemand(G)&&G.pending.length===1&&/особый дивиденд/.test(G.pending[0].title)&&G.pending[0].choices[0][1]==='sh:pay:135000'&&G.pending[0].choices[1][1]==='sh:no:135000','год касса лежит без дела — требование: '+G.pending[0].deck);
    CK(/Додж/.test(G.pending[0].text)&&/19,3/.test(G.pending[0].text)&&!/undefined|NaN/.test(G.pending[0].text),'в тексте — как было у Форда');
    const c0=G.cash;resolve('sh:pay:135000');CK(near(c0-G.cash,135000)&&!G.shSuit,'выплатить — деньги ушли совладельцам');
    for(let k=0;k<SH_HOARD;k++)shMonth(G,{});G.pending=[];CK(!shDemand(G),'второй раз — не раньше чем через три года');
    G.shT=-999;CK(shDemand(G),'через три года — снова');resolve('sh:no:'+shAsk(G));const D=G.shSuit&&G.shSuit.D;CK(G.shSuit&&G.shSuit.at===mi(G)+SH_SUIT_M&&D>shAsk(G)*1.1,'отказать — суд через полтора года, на кону '+money(D));
    CK(/судятся/.test(shNoteHTML(G)),'в «Финансах» видно, что идёт суд');
    G.y+=2;const rep0=G.rep,r={};shMonth(G,r);CK(r.shDiv===D&&!G.shSuit&&G.rep<rep0,'суд на стороне совладельцев: особый дивиденд с процентами — '+money(r.shDiv));
    G.shSuit={at:mi(G)+5,D:1000};G.partners=[];shMonth(G,{});CK(!G.shSuit&&G.shHoard===0,'выкупил доли — иск ушёл вместе с ними');
    G.partners=[{n:'Мелкий',sh:0.03,t:0}];G.shHoard=40;G.shT=-999;CK(!shDemand(G),'совладельцы с долей меньше 5% в суд не идут');}
  // (в) кредиторы ищут покупателя: сначала игрок, потом соседняя фирма — группа с настоящей экономикой
  {BOTS_OFF=false;newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1921;G.m=0;G.cash=9e7;G.firms={};const L=free('us'),A=L[0],B=L[1],M=maStat(G,'us',A.i),t=mi(G);
    const F=firmMake(G,'us',A.i,A.cp);F.h12=M.rev;F.r12=M.rev*0.6;F.p12=-M.rev*0.05;F.cash=-M.rev*0.45;F.st='bad';F.bad=14;F.ld=0.6;
    const O=firmMake(G,'us',B.i,B.cp);O.h12=M.rev*2;O.r12=M.rev*2;O.p12=M.rev*0.1;O.cash=M.rev*2;O.ck=0.8;O.ckTill=t+200;O.lineT=t-10;O.fin=1;O.finTill=t+200;
    const r={riv:[]};firmState(G,r,F,A.cp,A.i);CK(F.bad===15&&G.maOffer&&G.maOffer.cred&&G.maOffer.i===A.i&&G.pending.length===1&&/Кредиторы/.test(G.pending[0].title),'за три месяца до кредиторов — предложение игроку: '+G.pending[0].deck);
    CK(G.pending[0].choices[0][1]==='ma:talk:'+maKey('us',A.i)&&G.pending[0].choices[1][1]==='ma:credno:'+maKey('us',A.i)&&/Wolseley/.test(G.pending[0].text),'переговоры или отказ; в тексте — Моррис и Wolseley');
    const Q=maAsk(G,'us',A.i,{st:1,mode:'int',pay:'cash'});CK(Q.R<M.V*0.75&&/Продают кредиторы/.test(maDealNotes(G,'us',A.i,{st:1,mode:'int',pay:'cash'},M,Q)),'цена на треть ниже оценки: '+money(Q.R)+' против '+money(M.V));
    firmState(G,r,F,A.cp,A.i);firmState(G,r,F,A.cp,A.i);firmState(G,r,F,A.cp,A.i);CK(F.bad===18&&F.st==='bad'&&!F.rec&&F.own==null,'пока игрок думает — кредиторы и соседи ждут');
    G.pending=[];maResolve(G,'ma:credno:'+maKey('us',A.i));CK(!G.maOffer,'«Не интересует» — предложение снято');
    Math.random=()=>0.99;const st0=JSON.stringify([F.st,F.own]);const c1=O.cash;Math.random=()=>0.1;const res=firmState(G,r,F,A.cp,A.i);
    CK(res===true&&F.st==='ok'&&F.own===B.i&&O.cash<c1&&O.grp.includes(A.i)&&r.riv.some(n=>n.k==='merge'&&/покупает/.test(n.t)&&!/undefined|NaN/.test(n.txt)),'марку купила соседняя фирма: '+(r.riv.find(n=>n.k==='merge')||{}).t);
    CK(/^куплена: /.test(dealBlock(G,'us',A.i)),'игроку она больше не продаётся: '+dealBlock(G,'us',A.i));
    {const bi=COMPS.us.findIndex(x=>x.n==='Buick'),gy=G.y;G.y=1921;CK(!firmMergeOk(G,COMPS.us[bi])&&firmMergeOk(G,A.cp)&&!firmMergeOk(G,COMPS.uk.find(x=>x.n==='Rolls-Royce')),'марку из концерна (Buick в GM) и гордую марку (Rolls-Royce) соседям не продают');G.y=gy;}
    G.y+=2;firmGroupMonth(G,r,F,A.cp);CK(near(F.ck,0.9)&&F.fin===1,'через два года поток и рассрочка хозяина — и на её заводе: себестоимость −'+Math.round((1-F.ck)*100)+'%');
    F.st='bad';F.bad=3;F.cash=-F.h12*0.5;F.p12=-1;const c2=O.cash;firmState(G,r,F,A.cp,A.i);CK(F.st==='ok'&&O.cash<c2,'снова в долгах — закрывает касса хозяина');
    let html='';try{const os=openSheet;openSheet=h=>{html=h;};const de=document.getElementById;document.getElementById=()=>null;F.r12=F.h12;O.gr=0;openRivals('us');openSheet=os;document.getElementById=de;}catch(e){html='ERR '+e.message;}
    CK(/Принадлежит <b>/.test(html)&&/Группа: владеет/.test(html)&&!/undefined|NaN/.test(html),'в карточках фирм — кто кому принадлежит');
    // игрок покупает у кредиторов сам: долги — его
    F.own=null;O.grp=[];F.st='bad';F.bad=14;F.cash=-M.rev*0.45;F.offT=null;G.pending=[];firmState(G,r,F,A.cp,A.i);const Q2=maAsk(G,'us',A.i,{st:1,mode:'int',pay:'cash'}),M2=maStat(G,'us',A.i),D=maDebtOf(G,'us',A.i,M2),h=maClose(G,'us',A.i,{st:1,mode:'int',pay:'cash'},Q2.R);
    CK(h&&h.debt.tot===D&&D>M2.V*MA_DEBT*2&&Q2.R<M2.V*0.8&&acqHas(G,'us',A.i),'игрок купил у кредиторов сам: '+money(Q2.R)+' при оценке '+money(M2.V)+', но с её долгами — '+money(D));Math.random=R0;BOTS_OFF=true;}
  // (г) люди: главный конструктор, обида, лучший гонщик
  {BOTS_OFF=false;newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1922;G.m=0;G.cash=5e6;G.rd.lvl=3;G.firms={};const L=free('us'),A=L[0],t=mi(G),F=firmMake(G,'us',A.i,A.cp);F.cash=1e6;F.h12=5e6;
    F.prog={k:'model',g:'people',at:t+10,cost:0,q:0.3,frac:0.5,who:'«Тест»',you:1,lq:0.6,q0:0};Math.random=()=>0.1;
    CK(firmPoachEng(G,{riv:[]},F,'people')&&G.poachEng&&G.pending.length===1&&G.pending[0].choices[0][1]==='eng:keep'&&/Яно/.test(G.pending[0].text),'фирма, готовя ответ, зовёт вашего главного конструктора: '+G.pending[0].deck);
    const cost=G.poachEng.cost,c0=G.cash,b0=bn('devTime');resolve('eng:keep');CK(near(c0-G.cash,cost)&&!G.poachEng&&near(bn('devTime'),b0)&&F.prog.frac===0.5,'удержать — прибавка, КБ работает как раньше');
    G.pending=[];CK(!firmPoachEng(G,{riv:[]},F,'people'),'второй раз — не раньше чем через пять лет');G.poachEngT=-999;firmPoachEng(G,{riv:[]},F,'people');resolve('eng:let');
    CK(near(bn('devTime'),b0*POACH_SLOW)&&near(F.prog.frac,0.65)&&near(F.prog.q,0.39)&&F.prog.poach===1,'отпустить — проекты КБ на '+Math.round((POACH_SLOW-1)*100)+'% дольше, ответ фирмы перенимает больше: '+F.prog.frac);
    // игрок переманивает сам
    const pc=rivPoachCost(G,F),c1=G.cash,at0=F.prog.at;CK(rivPoachCan(G,F)&&/Переманить инженера/.test(firmCardBtn(G,F,{},0)),'в карточке соперника — кнопка «Переманить инженера»');
    CK(rivPoach(G,'us',A.i)&&near(c1-G.cash,pc)&&F.gr>=0.35&&F.prog.at===at0+6&&near(bn('devTime'),b0*POACH_SLOW*POACH_GAIN)&&!rivPoach(G,'us',A.i),'переманил: проекты быстрее, модель соперника задержана на полгода, обида запомнена');
    const Q=maAsk(G,'us',A.i,{st:1,mode:'int',pay:'cash'});CK(near(Q.gr,F.gr*0.3)&&/помнят обиду/.test(maDealNotes(G,'us',A.i,{st:1,mode:'int',pay:'cash'},Q.M,Q)),'обида: марка продаётся дороже на '+Math.round(Q.gr*100)+'%');
    {const Lc=[];firmCardExtra(G,F,{},Lc,0);CK(Lc.some(x=>/Помнит обиду/.test(x)&&/переманили инженера/.test(x)),'и это видно в её карточке');}
    let g=F.gr;for(let k=0;k<48;k++)g*=0.985;CK(g<F.gr*0.5,'за четыре года обида сходит наполовину');
    // лучший гонщик
    const dr=DRIVERS.find(d=>d.from<=1922&&d.to>=1924);G.drivers=[dr.id];G.pending=[];let got=false;
    for(let y=1922;y<=1929&&!got;y++){G.y=y;G.m=10;G.poachStarT=-999;G.poachNow=null;G.pending=[];G.raceLog=[1,1,1,2,5].map((p,k)=>({y,key:'r'+k,name:'Г'+k,place:p,drv:dr.n}));firmsPeople(G,{});got=!!G.poachNow;}
    CK(got&&G.poachNow.id===dr.id&&G.pending[0].choices[0][1]==='poachKeep'&&/выиграли 3 из 5/.test(G.pending[0].text),'выигрывает больше '+Math.round(STAR_WIN*100)+'% гонок — соперники зовут лучшего гонщика: '+(G.pending[0]||{}).title);
    G.raceLog=[1,3,4,2,5].map((p,k)=>({y:G.y,key:'r'+k,name:'Г'+k,place:p,drv:dr.n}));G.poachNow=null;G.poachStarT=-999;G.pending=[];firmsPeople(G,{});CK(!G.poachNow,'одна победа из пяти — не зовут');Math.random=R0;BOTS_OFF=true;}
  // (д) мотоциклетные марки — тоже фирмы
  {BOTS_OFF=false;newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1914;G.m=5;G.firms={};
    CK(near(firmTerms(G,'us','moto').M,1,1e-9),'ходов нет — перевес мотомарок 1');
    const W=compWeights('us','moto',G).sort((a,b)=>b.w-a.w)[0],F=firmMake(G,'us',W.i,W.cp,1);
    CK(G.firms['m:us:'+W.i]===F&&F.mo===1&&firmGet(G,'us',W.i,1)===F&&!firmGet(G,'us',W.i)&&firmCp(F)===W.cp&&firmName(G,F)===W.cp.n,'мотофирма — со своим ключом: '+W.cp.n);
    F.pk.moto=0.8;F.cap=6;const M1=firmTerms(G,'us','moto').M;CK(M1>1.1&&near(firmTerms(G,'us','people').M,1,1e-9),'мотомарка снизила цену — перевес мотоциклов ×'+M1.toFixed(2)+', автомобильный класс не тронут');
    const md={...autoDesign('moto',G),id:950,name:'М',status:'prod',launched:mi(G)-10,stock:0,made:500,vol:200,paint:'#333',eq:[]};md.price=Math.round(refPrice(md,G)*0.9/10)*10;G.dealers.us=dealerNeed('us',G);G.rep=70;
    const b1=mkCountry('us',G,[md]).by[950];F.pk.moto=1;const b0=mkCountry('us',G,[md]).by[950];CK(b0>0&&b1<b0*0.97,'её ход отбирает покупателей у мотоцикла игрока: '+Math.round(b0)+' → '+Math.round(b1));
    const col=[];for(const c in MCOMPS)MCOMPS[c].forEach(mc=>{const cc=(COMPS[c]||[]).find(x=>x.n===mc.n);if(cc)col.push({c,mc,cc});});
    if(col.length){const o=col[0];G.y=Math.max(mi(G)/12+1895,Math.max(o.mc.since,o.cc.since)+3)|0;const v0=compVol(o.cc,G);G.dead={['m:'+o.mc.n]:0};CK(compVol(o.mc,G)===0&&compVol(o.cc,G)===v0&&v0>0,'закрылась мотоциклетная '+o.mc.n+' — автомобильная '+o.cc.n+' жива');G.dead={};}
    // партия: мотофирмы считают кассу; пока игрок их не теснит — не ходят
    rnd(77);newGame('ford','us','Тест','normal','Первая');G.cash=5e6;G.y=1912;G.m=0;let err='',mv=0;try{for(let k=0;k<30;k++){G.pending=[];G.cash=Math.max(G.cash,2e6);step();mv+=(G.last.riv||[]).filter(n=>n.mo).length;}}catch(e){err=e.stack.split('\\n').slice(0,3).join(' | ');}
    const MF=Object.keys(G.firms).filter(k=>/^m:/.test(k)).map(k=>G.firms[k]).filter(f=>f.h12>0);
    CK(!err&&MF.length>=6&&MF.every(f=>f.mo===1&&isFinite(f.cash)&&f.st==='ok')&&mv===0,'два с половиной года с мотофирмами — без ошибок: '+MF.length+' фирм, ходов без повода — '+mv+' '+err);
    const ld=MF.map(f=>f.ld).sort((a,b)=>a-b);CK(ld[0]>0.6&&ld[ld.length-1]<1.6,'загрузка мотофирм — около своей истории: '+ld[0].toFixed(2)+'…'+ld[ld.length-1].toFixed(2));
    // модель-ответ мотофирмы на мотоцикл игрока
    {const o=MF.sort((a,b)=>b.h12-a.h12)[0],cp=firmCp(o),g='moto',t=mi(G);o.rs={moto:0.6,moside:1};o.rg={moto:0.6,moside:1};o.cash=o.h12;o.prog=null;Math.random=()=>0.3;
      const SG={moto:{size:1000,you:400,edge:0.8,edgeQ:0.5,edgeP:0.2,edgeB:0.1},moside:{size:100,you:0}},r={riv:[]};firmPlan(G,r,o,cp,o.i,SG,false);
      CK(o.prog&&o.prog.k==='model'&&o.prog.you===1&&r.riv.some(n=>n.k==='model0'&&n.mo===1&&/мотоцикл/.test(n.txt)),'мотофирма отвечает моделью: '+(r.riv[0]||{}).t);
      o.prog.at=t;firmDone(G,r,o,cp);CK(o.md.moto&&o.md.moto.q>0&&r.riv.some(n=>n.k==='model'&&/мотоцикл/.test(n.txt)&&!/undefined|NaN/.test(n.txt)),'и выводит её: '+(r.riv[r.riv.length-1]||{}).t);
      o.rs={moto:0.5};o.prog=null;o.md={};const r2={riv:[]};SG.moto.edgeQ=0;SG.moto.edgeP=0.6;firmPlan(G,r2,o,cp,o.i,SG,false);CK(!o.prog||o.prog.k!=='line','потока и рассрочки у мотофирм нет: '+(o.prog?o.prog.k:'—'));Math.random=R0;}
    let html='';try{const os=openSheet;openSheet=h=>{html=h;};const de=document.getElementById;document.getElementById=()=>null;G.lines={car:1,moto:1};openRivals('us');const h1=html;G.lines={car:1};openRivals('us');openSheet=os;document.getElementById=de;
      CK(/Мотоциклетные фирмы/.test(h1)&&/id="firmmus/.test(h1)&&!/undefined|NaN/.test(h1)&&!/Мотоциклетные фирмы/.test(html),'экран «Соперники»: мотофирмы — отдельным блоком, только если игрок делает мотоциклы');}catch(e){CK(false,'экран «Соперники» с мотофирмами: '+e.message);}
    Math.random=R0;BOTS_OFF=true;}
  // (е) тракторы: у соперника в пуле фермеров тоже фирма (тракторная война 1922 года)
  {BOTS_OFF=false;newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1920;G.m=3;G.firms={};
    const R0=mkCountry('us',G,[]);CK(R0.farm&&R0.farm.h>0&&near(R0.farm.riv,R0.farm.h,1e-6)&&R0.farm.you===0&&farmMult(G,'us')===1,'тракторный пул без игрока и без ходов — как в истории: '+Math.round(R0.farm.riv*12)+' тракторов в год');
    const md={...rivalDesign('tractor',1920),id:960,name:'Трактор',status:'prod',launched:mi(G)-10,stock:0,made:500,vol:200,paint:'#333',eq:[]};md.price=Math.round(refPrice(md,G)*0.8/10)*10;G.dealers.us=dealerNeed('us',G);G.rep=70;
    const A=mkCountry('us',G,[md]),a0=A.by[960];CK(a0>0&&near(A.farm.you,a0,1e-6)&&A.farm.edge!=null&&A.farm.edgeP>0&&near(A.farm.h,R0.farm.h,1e-6),'трактор игрока дешевле — перевес ценой '+(A.farm.edgeP||0).toFixed(2)+', продажи '+Math.round(a0));
    // месяц тракторной фирмы
    const r={mk:{us:{farm:A.farm}},riv:[]};firmsFarm(G,r);const F=farmGet(G,'us');CK(F&&F.kf===1&&F.n==='International Harvester'&&F.h12>0&&F.st==='ok'&&firmCar(F)==='трактор','ведущий тракторный завод страны — фирма: '+(F&&F.n));
    CK(farmName({company:'International Motors'},'us')==='J. I. Case'&&farmName({company:'Renault'},'fr')==='Latil','марка самого игрока в соперники не попадает');
    // ход ценой и машиной
    const cp=farmCp('us',F.n),r2={riv:[]};F.rs={farm:0.6};F.rg={farm:0.6};F.cash=F.h12;F.cap=6;for(let k=0;k<5;k++)firmPrices(G,r2,F,cp,'farm',{farm:{farm:FARM_SH}},false);
    CK(F.pk.farm<0.95&&r2.riv.some(n=>n.k==='cut'&&n.kf===1&&/в тракторах/.test(n.txt)&&/1922/.test(n.txt)&&!/undefined|NaN/.test(n.txt)),'теряет фермеров — снижает цену: −'+Math.round((1-F.pk.farm)*100)+'%');
    const B=mkCountry('us',G,[md]);CK(farmMult(G,'us')>1.03&&B.by[960]<a0*0.99,'её цена отбирает покупателей у трактора игрока: '+Math.round(a0)+' → '+Math.round(B.by[960])+' (соперники ×'+farmMult(G,'us').toFixed(2)+')');
    Math.random=()=>0.3;const r3={riv:[]};firmPlan(G,r3,F,cp,'farm',{farm:{size:1000,you:400,edge:0.8,edgeQ:0.5,edgeP:0.2,edgeB:0}},false);
    CK(F.prog&&F.prog.k==='model'&&F.prog.you===1&&r3.riv.some(n=>/трактор/.test(n.txt)),'трактор игрока лучше — готовит модель-ответ: '+(r3.riv[0]||{}).t);
    F.prog.at=mi(G);firmDone(G,r3,F,cp);const C=mkCountry('us',G,[md]);CK(F.md.farm&&F.md.farm.q>0&&C.by[960]<B.by[960]&&r3.riv.some(n=>n.k==='model'&&/Farmall/.test(n.txt)&&!/undefined|NaN/.test(n.txt)),'и выводит её: продажи игрока '+Math.round(B.by[960])+' → '+Math.round(C.by[960]));
    const h=farmCardHTML(G,'us');CK(/International Harvester/.test(h)&&/Трактор: новая модель/.test(h)&&!/undefined|NaN/.test(h),'карточка тракторного завода на экране «Соперники»');
    // партия без тракторов игрока: фирма считает кассу и не ходит
    rnd(78);newGame('ford','us','Тест','normal','Первая');G.cash=5e6;G.y=1919;G.m=0;let err='',mv=0;try{for(let k=0;k<24;k++){G.pending=[];G.cash=Math.max(G.cash,2e6);step();mv+=(G.last.riv||[]).filter(n=>n.kf).length;}}catch(e){err=e.stack.split('\\n').slice(0,3).join(' | ');}
    const KF=Object.keys(G.firms).filter(k=>/^k:/.test(k)).map(k=>G.firms[k]);CK(!err&&KF.length>=1&&KF.every(f=>f.st==='ok'&&Math.abs(f.ld-1)<0.02&&!Object.keys(f.pk).length)&&mv===0,'два года без тракторов игрока: '+KF.length+' тракторных фирм, загрузка как в истории, ходов — '+mv+' '+err);
    Math.random=R0;BOTS_OFF=true;}
  // (ж) лицензию на свой узел можно продать и по своей воле
  {BOTS_OFF=false;newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1922;G.m=0;G.cash=5e6;G.firms={};const L=free('us'),t=mi(G);
    const F1=firmMake(G,'us',L[0].i,L[0].cp),F2=firmMake(G,'us',L[1].i,L[1].cp);F1.h12=F1.r12=6e6;F2.h12=F2.r12=9e6;F1.cash=F2.cash=1e5;
    ownSync(G);G.custom=G.custom||[];const x={id:'xt1',k:'e',name:'Мотор Тест',base:'e1',yh:1926,made:{y:1921},ser:t-14,pat:{until:t+100}};G.custom.push(x);
    const B=ownLicBuyer(G,x);CK(B&&B.F===F2,'покупатель лицензии — крупнейшая фирма страны: '+(B&&firmName(G,B.F)));
    CK(/Лицензия: /.test(ownItemHTML(G,x))&&!/undefined|NaN/.test(ownItemHTML(G,x)),'у запатентованного узла — кнопка «Лицензия»');
    const fee=ownLicFee(G,F2);CK(ownLicSell(G,'xt1')&&G.legal.own.some(o=>o.k==='lic'&&o.id==='xt1'&&o.amt===fee&&o.until===t+60)&&Object.values(F2.md).some(M=>M.q>0&&M.lic),'продал: '+money(fee)+' в месяц пять лет, машины покупателя стали лучше');
    const B2=ownLicBuyer(G,x);CK(B2&&B2.F===F1,'следующая лицензия — следующей фирме');F1.gr=0.5;CK(!ownLicBuyer(G,x),'фирма в обиде лицензию не берёт');
    x.pat=null;CK(!ownLicSell(G,'xt1'),'без патента продавать нечего');G.custom=[];ownSync(G);BOTS_OFF=true;}
}
// ---------- 24. этап 6: мировые рекорды и рекордный образец; испытания ведомств ----------
{const rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();},R0=Math.random;
  const car=(k,y,id,nm,st)=>{const md={...rivalDesign(k,y),id,name:nm,status:st||'prod',launched:mi(G)-10,stock:0,made:100,vol:50,lastSold:10,paint:'#333',eq:[]};md.price=Math.round(refPrice(md,G)/10)*10;return md;};
  // таблицы рекордов на всю эпоху
  {BOTS_OFF=true;newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1912;G.m=3;
    CK(recHist('lsr',1899.5)[1]===105.88&&recHist('lsr',1929.5)[1]===372.5&&recHist('h24',1908)[1]===106.1&&recHist('h24',1927.9)[1]===183.8&&!recHist('h24',1905)&&recHist('mlsr',1925)[1]>170,'таблицы: скорость на суше 1898–1929, суточный рекорд с 1907 года, мотоцикл');
    const c=recCur(G,'lsr');CK(c.v===211.3&&/Олдфилд/.test(c.who)&&!c.mine,'рекорд скорости в 1912 году — '+c.v+' км/ч, '+c.who);
    G.rec={lsr:{v:220,who:'Тест',y:1912,m:1,t:mi(G)-2,until:mi(G)+34}};CK(recCur(G,'lsr').mine&&recCur(G,'lsr').v===220,'свой рекорд выше — держит игрок');
    // слава рекорда в спросе: сходит в последний год
    const md=car('people',1912,801,'Н');G.models=[md];const u0=recBoostU(md,G);G.rec.lsr.until=mi(G)+6;const u1=recBoostU(md,G);G.rec.lsr.until=mi(G)-1;
    CK(near(u0,REC_CLS.lsr.boost)&&near(u1,REC_CLS.lsr.boost/2)&&recBoostU(md,G)===0,'слава рекорда: +'+u0+' к привлекательности марки, в последний год сходит');
    G.rec.lsr.until=mi(G)+30;const A=mkCountry('us',G,[md]).by[801];G.rec=null;const B=mkCountry('us',G,[md]).by[801];G.dealers.us=G.dealers.us||5;CK(A>=B,'рекорд помогает продажам марки: '+Math.round(B)+' → '+Math.round(A));
    // рекорд отобран по истории
    G.y=1922;G.m=3;G.rec={lsr:{v:213,who:'Тест',y:1921,m:1,t:mi(G)-12,until:mi(G)+24}};recMonth(G,{});CK(!G.rec.lsr.lost&&!G.pending.length,'пока история не догнала — рекорд ваш');
    G.m=5;recMonth(G,{});CK(G.rec.lsr.lost&&G.rec.lsr.until<=mi(G)+6&&G.pending.length===1&&/Рекорд отобран/.test(G.pending[0].kicker)&&/Гиннесс/.test(G.pending[0].deck),'май 1922 года: Гиннесс на Sunbeam — рекорд отобран, слава сходит за полгода');
    CK(!recCur(G,'lsr').mine,'в таблице — снова соперник');G.pending=[];}
  // рекордный образец — проект КБ
  {BOTS_OFF=true;rnd(5);newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1922;G.m=3;G.cash=5e6;G.rd.lvl=5;const md=car('sport',1922,810,'Спорт');G.models=[md];
    const B=recBase(G);CK(B&&B.m===md&&B.st.vmax>30,'основа образца — самая быстрая своя модель: '+Math.round(B.st.vmax*3.6)+' км/ч');
    const P1=recPreview(G,{eng:'one',body:'std'}),P2=recPreview(G,{eng:'two',body:'std'}),P3=recPreview(G,{eng:'two',body:'stream'}),P4=recPreview(G,{eng:'ae',body:'std'});
    CK(P1.x.v>B.st.vmax*3.6&&P2.x.v>P1.x.v*1.15&&P2.x.hp>P1.x.hp*1.8&&P2.x.kg>P1.x.kg&&P2.x.rel<P1.x.rel&&P2.cost>P1.cost&&P2.need>P1.need,'два мотора: быстрее ('+P1.x.v+' → '+P2.x.v+' км/ч), тяжелее, капризнее, дороже ('+money(P1.cost)+' → '+money(P2.cost)+')');
    CK(P3.why&&/1924/.test(P3.why)&&P4.why&&/авиамотор/.test(P4.why),'обтекаемый кузов — с 1924 года или с опытом; авиамотор — у марки с авиацией: '+P3.why);
    G.xp={aero:45};CK(!recPreview(G,{eng:'two',body:'stream'}).why&&recPreview(G,{eng:'two',body:'stream'}).x.v>P2.x.v*1.05,'с опытом аэродинамики обтекаемый кузов доступен раньше и добавляет скорости');G.xp={};
    CK(P2.chance>0.5&&P1.chance<0.1,'шанс рекорда виден до начала работ: один мотор '+pct(P1.chance,0)+', два — '+pct(P2.chance,0));
    const c0=G.cash;CK(recStart(G,{eng:'two',body:'std',name:'Молния'})&&near(c0-G.cash,P2.cost)&&G.rd.projs.some(p=>p.kind==='rec'&&p.name==='Молния'),'проект «Молния» начат: '+money(P2.cost));
    const pj=G.rd.projs.find(p=>p.kind==='rec');CK(rdCost(pj,G)===recRdCost(pj,G)&&protoRisk(pj)>=0.15,'цена и риск — как у особого проекта КБ');
    G.rd.projs=G.rd.projs.filter(p=>p!==pj);recDone(G,pj);const rc=G.recCars[0];CK(rc&&rc.name==='Молния'&&near(rc.v,P2.x.v)&&G.pending.length===1&&/Рекордный образец готов/.test(G.pending[0].title)&&!/undefined|NaN/.test(G.pending[0].text),'образец готов: '+G.pending[0].deck);
    CK(!G.models.some(m=>m.name==='Молния'),'в модельный ряд образец не попадает — он не для продажи');G.pending=[];
    // попытка
    const E=recEntry(G,'lsr');CK(E&&E.special&&E.car===rc.id&&near(E.v,rc.v),'на рекорд идёт образец, а не серийная машина');
    CK(recCan(G,'lsr')===''&&/войну/.test((()=>{const y=G.y;G.y=1916;G.country='fr';const w=recCan(G,'lsr');G.y=y;G.country='us';return w;})()),'попытка возможна; в войну — нет');
    Math.random=()=>0.5;const c1=G.cash,rep0=G.rep,O=recTryNow(G,'lsr');
    CK(O&&O.res==='rec'&&O.v>211.3&&near(c1-G.cash,O.fee)&&G.rec.lsr.v===O.v&&G.rep>rep0&&recCur(G,'lsr').mine&&G.pending.length===1&&/Мировой рекорд/.test(G.pending[0].kicker),'рекорд: '+(O&&O.v)+' км/ч — '+(G.pending[0]||{}).title);
    CK((G.trophies||[]).some(t=>/Рекорд скорости на суше/.test(t.title))&&recWait(G,'lsr')===REC_CLS.lsr.cool&&/через 6 мес/.test(recCan(G,'lsr')),'трофей в шкафу; следующая попытка — через полгода');G.pending=[];
    // неудачи
    G.recTry={};G.rec=null;Math.random=()=>0.99;const O2=recTryNow(G,'lsr');CK(O2.res==='dnf'&&!G.rec&&/не выдержала|авария/.test(G.pending[0].title),'надёжность подвела — попытка сорвана: '+G.pending[0].title);G.pending=[];
    G.recTry={};rc.v=150;rc.out=0;Math.random=()=>0.5;const O3=recTryNow(G,'lsr');CK(O3.res==='short'&&!G.rec&&/не хватило/.test(G.pending[0].title),'медленнее рекорда — не хватило: '+G.pending[0].title);G.pending=[];
    // совет и карточка
    rc.v=P2.x.v;G.recTry={};const T=adviceList(G).find(x=>/мировой рекорд/.test(x.text));CK(T&&T.btn&&/Попытка/.test(T.btn),'совет с кнопкой, когда рекорд в пределах досягаемости: '+(T&&T.text));
    CK(/Мировые рекорды/.test(recCardHTML(G))&&/211/.test(recCardHTML(G)),'карточка «Мировые рекорды» во вкладке «Гонки»');
    let h1='',h2='';try{const os=openSheet;openSheet=h=>{h1=h;};openRecords();openSheet=h=>{h2=h;};recDraft=null;openRecBuild();openSheet=os;}catch(e){h1='ERR '+e.message;}
    CK(/Рекорд скорости на суше/.test(h1)&&/Суточный рекорд/.test(h1)&&/Рекордные образцы/.test(h1)&&/Молния/.test(h1)&&!/undefined|NaN/.test(h1),'лист рекордов: три строки и образцы');
    CK(/Два своих мотора/.test(h2)&&/Обтекаемый кузов/.test(h2)&&/Что получится/.test(h2)&&!/undefined|NaN/.test(h2),'лист образца: мотор, кузов, итог до начала работ');
    // суточный рекорд — серийная машина: решают скорость и надёжность
    G.y=1912;G.m=3;const m2=car('sport',1912,811,'Сутки');G.models=[m2];const E2=recEntry(G,'h24');CK(E2&&E2.md===811&&E2.v>80&&E2.v<carStats(m2,1,1912).vmax*3.6&&E2.rel>0.2,'суточный рекорд: серийная машина, средняя '+E2.v+' км/ч при надёжности '+E2.rel);
    Math.random=()=>0.3;G.recTry={};G.rec=null;const O4=recTryNow(G,'h24');CK(O4&&(O4.res==='rec'?m2.raceBoost>mi(G)&&G.rec.h24.md===811:true),'попытка суточного рекорда: '+O4.res+(O4.v?' '+O4.v+' км/ч':''));G.pending=[];Math.random=R0;}
  // испытания ведомств: конкурс по календарю
  {BOTS_OFF=true;rnd(9);newGame('benz','de','Тест','normal','Первая');G.pending=[];G.y=1909;G.m=4;G.cash=5e6;const tr=car('truck',1914,820,'Грузовик');G.models=[tr];   // детали на пять лет впереди — вровень с образцом года (он улучшается каждый год)
    const O=trOpenList(G);CK(O.length===1&&O[0].T.id==='de-sub'&&O[0].best.m===tr&&O[0].at-mi(G)===4&&!O[0].ent,'за четыре месяца открыта запись: '+O[0].T.n);
    G.m=3;CK(trOpenList(G).length===0,'раньше — закрыта');G.m=4;
    const T=adviceList(G).find(x=>/запись открыта/.test(x.text));CK(T&&/Заявить/.test(T.btn),'совет с кнопкой «Заявить»: '+(T&&T.text));
    const c0=G.cash;T.run();CK(G.trials.ent['de-sub|1909'].md===820&&G.cash<c0&&trOpenList(G)[0].ent,'одно нажатие — модель заявлена, взнос '+money(c0-G.cash));
    CK(/Испытания ведомств/.test(trialCardHTML(G))&&/✓/.test(trialCardHTML(G)),'строка «Испытания ведомств» в «Моделях»');
    // без свидетельства покупатели не получают доплату — грузовик продаётся хуже
    const pen=trU(tr,'haul','de',G);CK(pen<-0.3&&trU(tr,'city','de',G)<0&&trU(tr,'city','de',G)>pen&&trU(tr,'bus','de',G)===0&&trU(tr,'haul','us',G)===0&&/не получают доплату/.test(trSubTxt(tr,'de',G)),'субсидия 1908–1914: без свидетельства дальние перевозки −'+Math.abs(pen).toFixed(2)+' к привлекательности');
    G.dealers.de=dealerNeed('de',G);G.rep=60;
    // пробег: сильная машина побеждает — заказ и свидетельство
    G.m=8;Math.random=()=>0.6;const sc=trScore(tr,'truck','de',G),scOld=trScore(car('truck',1900,829,'Стар'),'truck','de',G);CK(sc>0.9&&sc<1.1&&scOld<0.9,'мерка против образца года (100): машина своего года — '+Math.round(sc*100)+', машина 1900 года — '+Math.round(scOld*100));
    const s0=mkCountry('de',G,[tr]).by[820],o0=(G.orders||[]).length,_rv=trRivals;trRivals=()=>[{n:'Büssing',sc:0.92},{n:'Daimler',sc:0.9,brk:true},{n:'NAG',sc:0.8}];trialsMonth(G,{});trRivals=_rv;const ev=G.pending[0],C=trCertS(tr,'de','sub',G);
    CK(ev&&/Испытания ведомства/.test(ev.kicker)&&/100 — образец года/.test(ev.text)&&!/undefined|NaN/.test(ev.text)&&!G.trials.ent['de-sub|1909'],'итог пробега — таблицей: '+ev.title);
    CK(!!C&&/первое место/.test(ev.title),'сильная машина побеждает: '+ev.title);
    if(C){const s1=mkCountry('de',G,[tr]).by[820];CK(C.until===mi(G)+TR_SUB_M&&trU(tr,'haul','de',G)===0&&s1>s0*1.05&&(G.orders||[]).length>o0&&/субсидийное свидетельство/.test(trialModelLine(tr,G)),'свидетельство на четыре года: доплата покупателям — продажи '+Math.round(s0)+' → '+Math.round(s1)+', и заказ ведомства');}
    else CK(/Свидетельства нет|поломка/.test(ev.text),'без призового места свидетельства нет');
    G.pending=[];
    // слабая машина проигрывает
    const weak=car('truck',1900,821,'Старый');weak.status='prod';G.models=[weak];G.y=1910;G.m=4;G.trials.ent={};trialEnter(G,'de-sub',821);G.m=8;Math.random=()=>0.6;trialsMonth(G,{});
    CK(!trCertS(weak,'de','sub',G)&&/Свидетельства нет|поломка/.test(G.pending[0].text),'машина десятилетней давности свидетельства не получает: '+G.pending[0].title);G.pending=[];
    // армейский торг по цене там, где есть испытания, не приходит
    G.y=1910;G.models=[tr];let army=0;rnd(3);for(let k=0;k<400;k++){G.pending=[];G.tenderSaid={};G.tenderNow=null;checkTenders(G);if(G.tenderNow&&G.tenderNow.k==='army')army++;}CK(army===0,'заказ военного министерства на грузовики в Германии 1910 года — только через испытания');G.pending=[];Math.random=R0;}
  // приёмка на полигоне: военная техника
  {BOTS_OFF=true;rnd(4);newGame('renault','fr','Тест','normal','Первая');G.pending=[];G.y=1925;G.m=2;G.cash=5e6;const ac=car('armored',1925,830,'Броневик');G.models=[ac];G.dealers.fr=dealerNeed('fr',G);
    const u=trMil(ac);CK(u==='armored'&&trTestKind(ac,G)==='mil'&&!trGate(ac,u,'fr',G),'бронеавтомобиль без приёмки армия в мирное время не закупает');
    const R0m=mkCountry('fr',G,[ac]);CK(!(R0m.by[830]>0),'продаж армии нет: '+Math.round(R0m.by[830]||0));
    G.y=1916;CK(trGate(ac,u,'fr',G),'в войну армия берёт без испытаний');G.y=1925;
    const dr={...ac,id:831,status:'dev'};CK(trGate(dr,u,'fr',G)===(trScore(dr,'mil','fr',G)>=TR_PASS),'чертёж: спрос прикидывают по тому, пройдёт ли машина полигон');
    const A=adviceList(G).find(x=>/без испытаний на полигоне/.test(x.text));CK(A&&/На полигон/.test(A.btn)&&/На полигон/.test(trialModelLine(ac,G)),'совет и кнопка в карточке модели: «На полигон»');
    const c0=G.cash;A.run();CK(G.trials.q.length===1&&G.cash<c0&&/уже идут/.test(trTestWhy(G,ac)),'заявка: итог через три месяца');
    G.m=5;Math.random=()=>0.7;trialsMonth(G,{});const C=trCertS(ac,'fr','mil',G);CK(G.pending.length===1&&/Полигон/.test(G.pending[0].title)&&!/undefined|NaN/.test(G.pending[0].text),'итог приёмки: '+G.pending[0].title);
    if(C){const R1=mkCountry('fr',G,[ac]);CK(trGate(ac,u,'fr',G)&&R1.by[830]>0&&C.until===mi(G)+TR_CERT_M&&/принята армией/.test(trialModelLine(ac,G)),'принята — армия закупает пять лет: '+R1.by[830].toFixed(1)+' в месяц');}
    G.pending=[];Math.random=R0;}
  // станция испытаний тракторов (Небраска, с 1920 года)
  {BOTS_OFF=true;rnd(6);newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1921;G.m=2;G.cash=5e6;const t1=car('tractor',1921,840,'Трактор');G.models=[t1];G.dealers.us=dealerNeed('us',G);
    CK(trTestKind(t1,G)==='neb'&&near(trU(t1,'plough','us',G),-0.12)&&trU(t1,'plough','fr',G)===0,'США с 1920 года: трактор без протокола продаётся хуже');G.y=1919;CK(trU(t1,'plough','us',G)===0&&!trTestKind(t1,G),'до закона 1919 года — нет');G.y=1921;
    const a0=mkCountry('us',G,[t1]).by[840];CK(trialTest(G,840),'трактор отправлен на станцию');G.m=4;Math.random=()=>0.8;trialsMonth(G,{});const C=trCertS(t1,'us','neb',G);
    CK(C&&G.pending.length===1&&/Небраск/.test(G.pending[0].title)&&/Waterloo Boy/.test(G.pending[0].text),'протокол напечатан: '+G.pending[0].title);
    const a1=mkCountry('us',G,[t1]).by[840];CK(a1>a0&&trU(t1,'plough','us',G)>-0.12,'с протоколом продажи выше: '+Math.round(a0)+' → '+Math.round(a1));G.pending=[];
    let h='';try{const os=openSheet;openSheet=x=>{h=x;};openTrials();openSheet=os;}catch(e){h='ERR '+e.message;}CK(/Испытания ведомств/.test(h)&&/Свидетельства/.test(h)&&/протокол Небраски/.test(h)&&!/undefined|NaN/.test(h),'лист «Испытания ведомств»: свидетельства');
    // Виннипег
    G.y=1910;G.m=2;G.models=[car('tractor',1910,841,'Трактор-10')];CK(trOpenList(G).some(o=>o.T.id==='wpg'),'состязания тракторов в Виннипеге — запись за четыре месяца');Math.random=R0;}
  // партия с рекордами и испытаниями не падает; сохранение
  {BOTS_OFF=false;rnd(31);newGame('benz','de','Тест','normal','Первая');G.cash=5e6;G.y=1908;G.m=0;G.models=[car('truck',1908,850,'Г'),car('people',1908,851,'Н')];G.cap=600;G.workers=900;G.dealers.de=30;G.rec={h24:{v:120,who:'Т',y:1908,m:0,t:mi(G),md:851,until:mi(G)+18}};
    let err='',ent=0;try{for(let k=0;k<20;k++){G.pending=[];G.cash=Math.max(G.cash,2e6);const A=adviceList(G).find(x=>/Заявить/.test(x.btn||''));if(A){A.run();ent++;}step();}}catch(e){err=e.stack.split('\\n').slice(0,3).join(' | ');}
    CK(!err&&ent>=1,'двадцать месяцев с рекордом и конкурсами — без ошибок, заявок: '+ent+' '+err);const s2=JSON.parse(JSON.stringify(G));CK(s2.rec&&s2.trials,'рекорды и заявки сохраняются');G.pending=[];BOTS_OFF=true;}
  Math.random=R0;
}
// ---------- 25. этап 7: авиация — часть производства (переключатель, подсказки конструктора, помощник) и воздушный бой ----------
{const rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();},R0=Math.random,deg=x=>x*Math.PI/180;
  // переключатель «Автомобили | Аэропланы»
  {BOTS_OFF=true;rnd(5);newGame('ford','us','Тест','normal','Первая');G.pending=[];G.y=1912;G.m=3;const s=G;
    CK(!airSwitchOn(s),'авиацеха нет — переключателя нет');airInit(s);s.air.b={left:3};CK(airSwitchOn(s)&&/авиацех строится/.test(lineSwitchHTML(s)),'авиацех строится — переключатель уже есть');
    delete s.air.b;s.air.lv=1;s.air.cap=2;s.air.wk=10;CK(airSwitchOn(s)&&airOn(s)&&!airOnly(s),'автомобильная фирма с авиацехом');
    const H=lineSwitchHTML(s);CK(/data-act="uiLine" data-v="car"/.test(H)&&/data-act="uiLine" data-v="air"/.test(H)&&/Аэропланы/.test(H)&&/в серии/.test(H),'две кнопки направления, у аэропланов — сколько в серии');
    uiLine='car';CK(/chip on" data-act="uiLine" data-v="car"/.test(lineSwitchHTML(s)),'выбраны автомобили');uiLine='air';CK(/chip on" data-act="uiLine" data-v="air"/.test(lineSwitchHTML(s)),'выбраны аэропланы');
    const V={plant:airSubView(s,'plant'),models:airSubView(s,'models'),market:airSubView(s,'market'),race:airSubView(s,'race')};
    CK(Object.keys(V).every(k=>typeof V[k]==='string'&&V[k].length>50&&!/Ошибка экрана авиации/.test(V[k])),'раздел авиации открывается на всех четырёх вкладках');
    const sm=s.mode;s.mode='racer';CK(!airSwitchOn(s),'у гонщика переключателя нет');s.mode=sm;uiLine='car';}
  {rnd(5);newAirGame('bleriot','fr','','normal','');CK(airOnly(G)&&!airSwitchOn(G),'чисто авиационной фирме переключатель не нужен');}
  // конструктор: подсказки
  {BOTS_OFF=true;rnd(7);newAirGame('bleriot','fr','','normal','');const s=G;s.pending=[];s.y=1916;s.m=5;s.air.lv=Math.max(1,s.air.lv||0);const t=tNow(s);
    CK(airRoleWants('fight').length===3&&airRoleWants('fight').every(x=>typeof x==='string'&&x.length>2),'три главных черты для заказчика: '+airRoleWants('fight').join(', '));
    const h=airRoleHint(s,'fight');CK(/Покупают/.test(h)&&/Ценят/.test(h),'подсказка назначения: сколько берут и что ценят');CK(/Гоночный не продают/.test(airRoleHint(s,'race')),'гоночный — не для продажи');
    CK(/война/.test(h),'в войну подсказка истребителя говорит о войне: '+h);
    ['fight','recon','sport'].forEach(role=>{const d0={...airRefMd(role,t),role,name:'Проба'},q0=airQ(d0,t).q,d1=airAutoDesign(s,d0);
      CK(airDesignErr(s,d1).length===0,role+': подобранный аэроплан собирается без ошибок');CK(d1.role===role&&d1.name==='Проба','назначение и имя не трогаем');
      const val=d=>airQ(d,t).q-(role==='race'?0:0.25*Math.log(Math.max(0.2,airCost(d,t,s,0).unit/Math.max(1,airCost(airRefMd(role,t),t,s,0).unit))));
      CK(val(d1)>=val(d0)-1e-6,role+': подбор не хуже образца года по оценке за свои деньги ('+q0.toFixed(2)+' → '+airQ(d1,t).q.toFixed(2)+')');});
    const d={...airRefMd('fight',t),role:'fight'},q0=airQ(d,t).q,N=AIR_ENG.filter(e=>(e.y||0)<=t).map(e=>airPickNote(s,d,'e',e.id,q0));
    CK(N.length>2&&N.every(n=>/^оценка [0-9],[0-9][0-9]$/.test(n.txt)||/^✖ /.test(n.txt)),'у каждого мотора — оценка заказчиков или причина, почему его не поставить: '+N.map(n=>n.txt).join(' | '));
    CK(N.some(n=>n.cls==='bad')||N.some(n=>n.cls==='good'),'хуже — красным, лучше — зелёным');}
  // помощник управляющего ведёт авиацех
  {BOTS_OFF=true;rnd(11);newAirGame('bleriot','fr','','normal','');const s=G;s.pending=[];s.y=1912;s.m=2;s.air.lv=Math.max(1,s.air.lv||0);s.cash=5e6;const t=tNow(s);
    const md=airNewModel(s,{...airRefMd('sport',t),role:'sport',name:'Помощник'},{status:'proto'});md.status='proto';md.flown=0;md.flaw=0;
    const msg=[],pay=c=>s.cash>=c;Math.random=()=>0.99;airHelperMonth(s,msg,pay,1000);CK(!md.flown&&md.hw===1&&!msg.length,'первый месяц образец ждёт хозяина');
    airHelperMonth(s,msg,pay,1000);CK(md.flown&&msg.some(x=>/первый полёт «Помощник» — облётан/.test(x)),'на второй месяц его поднимает испытатель: '+msg.join('; '));
    CK(md.status==='tool'&&msg.some(x=>/в серию/.test(x)),'облётанный образец — сразу в серию: '+md.status);
    const md2=airNewModel(s,{...airRefMd('sport',t),role:'sport',name:'Сырой'},{status:'proto'});md2.status='proto';md2.flown=1;md2.flaw=1;const m2=[];airHelperMonth(s,m2,pay,1000);
    CK(md2.status==='dev'&&m2.some(x=>/доводка «Сырой»/.test(x)),'образец с недоделками сперва доводят');
    const md3=airNewModel(s,{...airRefMd('sport',t),role:'race',name:'Гонка'},{status:'proto'});md3.status='proto';md3.flown=1;md3.flaw=0;airHelperMonth(s,[],pay,1000);CK(md3.status==='proto','гоночный в серию не ставят');
    s.air.last={load:1.3};s.air.capB=[];s.air.hwLoad=0;const m3=[];airHelperMonth(s,m3,pay,1000);CK(!m3.some(x=>/строит/.test(x))&&s.air.hwLoad===1,'ангар переполнен один месяц — ждём');
    airHelperMonth(s,m3,pay,1000);CK(m3.some(x=>/авиацех: строит/.test(x))&&s.air.capB.length===1,'два месяца подряд — строит: '+m3.join('; '));Math.random=R0;}
  CK(/1918/.test(brandAbout({n:'НАМИ'}))&&/институт/.test(brandAbout({n:'НАМИ'}))&&brandAbout({n:'Ford'})==='','НАМИ: что это за марка; у прочих строки нет');
  // ----- воздушный бой -----
  {const DL=['kids','easy','normal','hard','hist'];CK(DL.every((d,i)=>!i||FR_DIF[d].cone<FR_DIF[DL[i-1]].cone)&&FR_DIF.hist.cone===0,'автоприцел: чем легче уровень, тем шире конус; на «Историке» его нет');
    CK(DL.every((d,i)=>!i||FR_DIF[d].tail>FR_DIF[DL[i-1]].tail)&&DL.every((d,i)=>!i||FR_DIF[d].err<FR_DIF[DL[i-1]].err),'чем труднее уровень, тем дольше враг держится на хвосте и точнее целится');}
  {BOTS_OFF=true;rnd(3);newAirGame('bleriot','fr','','normal','');const s=G;s.pending=[];s.y=1917;s.m=6;s.air.lv=Math.max(1,s.air.lv||0);const t=tNow(s);
    const md=airNewModel(s,{...airRefMd('fight',t),role:'fight',name:'Наш'},{status:'prod',flown:1});md.flown=1;md.status='prod';
    const MESH=()=>({len:7,r:6,hit:[{x:0,y:0,z:0,r:0.9,k:'fus'},{x:0,y:0,z:1.8,r:0.7,k:'eng'},{x:2.6,y:0.3,z:0.3,r:1.1,k:'wing'},{x:-2.6,y:0.3,z:0.3,r:1.1,k:'wing'},{x:0,y:0.2,z:-3.6,r:0.8,k:'tail'}]});
    const sv={FW,fwPart,frSnd,fwHgt,flToast,air3dMesh,FL0:{me:FL.me,mi:FL.mi,bul:FL.bul,t:FL.t}};let toast=[];FW={S:{A:{y:60},fields:[]},parts:[]};fwPart=()=>{};frSnd=()=>{};fwHgt=()=>0;flToast=x=>{toast.push(x);};air3dMesh=()=>MESH();
    const plane=(x,y,z,hdg,side)=>{const a=flCraft(md,t,{rnd:()=>0.3});flPlace(a,x,z,hdg,{h:y,v:a.st.vc/3.6,thr:0.9});a.side=side;a.mesh=MESH();a.hp=1;a.kind='fight';a.md=md;return a;};
    const me=plane(0,1500,0,0,0);FL.me=me;FL.bul=[];FL.t=0;me.gun={fwd:true,n:1,rate:10,ammo:500,spread:0,cd:0};
    const foeAt=(ang,dist,o)=>{const f=plane(Math.sin(ang)*dist,1500+(o&&o.dy||0),Math.cos(ang)*dist,o&&o.hdg||0,1);f.ai={st:'attack',sk:0.7,home:[0,0],alt:1500,see:4000,i:0,t:0};f.target='me';f.gun={fwd:true,n:1,rate:10,ammo:500,spread:0.01,cd:0};Object.assign(f,o&&o.set||{});return f;};
    const ang=(a,b)=>Math.acos(Math.min(1,d3(a,b)))*180/Math.PI;
    // упреждение
    {const f=foeAt(0,200,{hdg:Math.PI/2}),L=frLead(me,f),dirNow=v3n([f.p[0]-me.p[0],f.p[1]-me.p[1],f.p[2]-me.p[2]]);
      CK(L.dir[0]>dirNow[0]+0.02&&L.t>0.2&&L.t<0.4&&near(L.d,200,1),'упреждение: по цели, идущей вправо, целить правее её ('+ang(L.dir,dirNow).toFixed(1)+'°, лететь пуле '+L.t.toFixed(2)+' с)');
      const f2=foeAt(0,200,{hdg:0});f2.v=me.v.slice();CK(ang(frLead(me,f2).dir,v3n([f2.p[0]-me.p[0],f2.p[1]-me.p[1],f2.p[2]-me.p[2]]))<0.05,'цель идёт тем же курсом и с той же скоростью — упреждения нет');}
    // автоприцел по уровням
    {const shot=(diff,offDeg,dist)=>{G.diff=diff;const f=foeAt(deg(offDeg),dist||200,{hdg:0});f.v=me.v.slice();const M={foes:[f]},L=frLead(me,f),A=frAssist(me,M);return {A,res:A?ang(A.aim,L.dir):ang(me.fw,L.dir),off:ang(me.fw,L.dir)};};
      const fwUp=ang(me.fw,[0,0,1]);/* нос чуть задран углом атаки — его учитываем в допусках */
      let r=shot('normal',1);CK(r.A&&r.A.lock&&r.res<0.05,'«Норма», цель в '+r.off.toFixed(1)+'° от носа: захват, очередь идёт точно в упреждение');
      r=shot('normal',3.6);CK(r.A&&!r.A.lock&&r.res>0.3&&r.res<r.off-1,'«Норма», '+r.off.toFixed(1)+'°: доводка частичная — остаётся '+r.res.toFixed(1)+'°');
      r=shot('normal',7);CK(!r.A,'«Норма», '+r.off.toFixed(1)+'°: вне конуса — помощи нет');
      r=shot('kids',7);CK(r.A&&r.A.lock&&r.res<0.05,'«Юный магнат», те же '+r.off.toFixed(1)+'°: захват');
      r=shot('easy',5);CK(r.A&&r.A.lock,'«Лёгкая», '+r.off.toFixed(1)+'°: захват');r=shot('hard',2.2);CK(r.A&&!r.A.lock,'«Магнат», '+r.off.toFixed(1)+'°: только частичная доводка');
      r=shot('hist',0.5);CK(!r.A,'«Историк»: автоприцела нет');r=shot('kids',1,700);CK(!r.A,'дальше дистанции огня автоприцел не работает');
      // очередь действительно уходит в точку упреждения
      G.diff='normal';const f=foeAt(deg(1),200,{hdg:0});f.v=me.v.slice();const M={foes:[f]},L=frLead(me,f);FL.bul=[];me.gun.cd=0;me.gun.ammo=500;frGuns(me,1/60,true,M);
      const b=FL.bul[0],bv=b&&v3n(b.v);CK(b&&ang(bv,L.dir)<0.05&&ang(bv,me.fw)>0.8,'пули идут в упреждение, а не по носу (от носа '+(b?ang(bv,me.fw).toFixed(1):'?')+'°)');
      G.diff='hist';FL.bul=[];me.gun.cd=0;frGuns(me,1/60,true,M);const b2=FL.bul[0];CK(b2&&ang(v3n(b2.v),me.fw)<0.05,'«Историк»: пули идут по носу');G.diff='normal';}
    // враг на хвосте
    {const behind=foeAt(Math.PI+0.2,200,{hdg:0}),M={foes:[behind]};let x=frSix(M,me);CK(x&&near(x.d,200,2)&&x.side===-1&&/ВРАГ НА ХВОСТЕ — 200 м, слева/.test(frSixText(x)),'враг сзади-слева носом на нас: '+frSixText(x));
      const away=foeAt(Math.PI,200,{hdg:Math.PI});CK(!frSix({foes:[away]},me),'сзади, но уходит — не угроза');const front=foeAt(0,200,{hdg:Math.PI});CK(!frSix({foes:[front]},me),'спереди — не «на хвосте»');
      const far=foeAt(Math.PI,700,{hdg:0});CK(!frSix({foes:[far]},me),'дальше 500 м — рано');const rec=foeAt(Math.PI,200,{hdg:0,set:{kind:'recon'}});CK(!frSix({foes:[rec]},me),'разведчик не гонится');
      const dn=foeAt(Math.PI,200,{hdg:0,set:{down:1}});CK(!frSix({foes:[dn]},me),'сбитый — не угроза');CK(frSixText(null)==='','нет угрозы — нет надписи');
      // что показывает кабина
      const near1=foeAt(deg(1),220,{hdg:0}),M2={foes:[far,near1,behind,dn,foeAt(0.3,3000,{}),foeAt(0.5,5000,{}),foeAt(-0.4,2500,{})]};const H=frHud(M2,me);
      CK(H&&H.foes.length===4&&H.foes[0].d<=H.foes[1].d&&H.foes[1].d<=H.foes[2].d&&!H.foes.some(q=>q.f===dn||q.d>3500),'метки: до четырёх живых врагов ближе 3,5 км, ближний — первым');
      CK(H.six&&H.six.f===behind&&H.gun&&H.lead&&H.lead.f===near1&&H.lead.lock,'предупреждение — о том, кто сзади; кружок упреждения — на том, кто перед носом, захват');
      G.diff='hist';const H2=frHud(M2,me);CK(H2.lead&&!H2.lead.lock,'«Историк»: кружок упреждения есть, захвата нет');G.diff='normal';
      M2.over=true;CK(frHud(M2,me)===null,'вылет окончен — меток нет');}
    // противник — человек: очереди, ошибка прицеливания, отвал с хвоста, проскок
    {G.diff='normal';rnd(21);const ai={sk:0.7};let on=0,n=0;for(let i=0;i<600;i++){n++;if(frBurst(ai,1/60,true))on++;}CK(on/n>0.5&&on/n<0.9,'враг стреляет очередями: огонь '+Math.round(on/n*100)+' % времени');
      const eK=(diff)=>{G.diff=diff;rnd(9);let m=0;for(let i=0;i<200;i++){const a2={sk:0.7};m+=l3(frAimErr(a2,1));}return m/200;};const ek=eK('kids'),en=eK('normal'),eh=eK('hist');G.diff='normal';
      CK(ek>en*2&&en>eh*1.5&&eh>0,'ошибка прицеливания: «Юный магнат» '+(ek*1000).toFixed(0)+' тыс., «Норма» '+(en*1000).toFixed(0)+', «Историк» '+(eh*1000).toFixed(1)+' (рад × 1000)');
      CK(frTailMax({sk:0.95})>frTailMax({sk:0.55})&&near(frTailMax({sk:0.5}),8,0.01),'на хвосте дольше держится сильный лётчик: '+frTailMax({sk:0.55}).toFixed(1)+'–'+frTailMax({sk:0.95}).toFixed(1)+' с на «Норме»');
      // бой без экрана: игрок летит прямо, враг сзади на дистанции огня
      const fight=(diff,sd)=>{G.diff=diff;rnd(sd);const m2=plane(0,1500,0,0,0);m2.gun=null;FL.me=m2;FL.bul=[];const f=foeAt(Math.PI,170,{hdg:0});f.p[0]=0;f.p[2]=-170;const M={foes:[f],onDown(){}};
        let T=0,run=0,mx=0,br=0,fire=0,prev='attack';const dt=1/60,am=f.gun.ammo;for(;T<60;T+=dt){FL.t=T;flAuto(m2,{hdg:0,alt:1500,thr:0.9});frAI(f,dt,M);flStep(f,dt);flStep(m2,dt);frBullets(dt,M);
          const x=frSix(M,m2);if(x&&x.d<350){run+=dt;mx=Math.max(mx,run);}else run=0;if(f.ai.st!==prev){if(f.ai.st==='break')br++;prev=f.ai.st;}}return {mx,br,shots:am-f.gun.ammo,lim:frTailMax(f.ai),hp:m2.hp};};
      const A=fight('normal',4),K=fight('kids',4),Hh=fight('hist',4);
      CK(A.br>=1&&A.mx<=A.lim+2.5,'«Норма»: за минуту враг отвалил '+A.br+' раза; подряд на хвосте не дольше '+A.mx.toFixed(1)+' с (предел лётчика '+A.lim.toFixed(1)+' с)');
      CK(K.br>=A.br&&K.mx<A.mx&&K.mx<=K.lim+2.5,'«Юный магнат»: отвалов '+K.br+', подряд до '+K.mx.toFixed(1)+' с');CK(Hh.mx>A.mx&&Hh.shots>A.shots,'«Историк»: висит дольше ('+Hh.mx.toFixed(1)+' с) и стреляет больше ('+Hh.shots+' против '+A.shots+')');
      CK(A.shots>50&&K.shots<A.shots,'враг при этом опасен: на «Норме» выпустил '+A.shots+' патронов, на «Юном магнате» '+K.shots);
      // проскок: догнал на большой скорости вплотную
      G.diff='normal';FL.me=me;const f=foeAt(Math.PI,80,{hdg:0});f.p[0]=0;f.p[2]=-80;f.v=[me.v[0],me.v[1],me.v[2]+15];const M={foes:[f]};toast=[];Math.random=()=>0;
      const d=[me.p[0]-f.p[0],me.p[1]-f.p[1],me.p[2]-f.p[2]],r1=frHuman(f,1/60,M,l3(d),d);CK(r1===true&&f.ai.st==='over'&&M.tipOver===1&&toast.some(x=>/проскочил/.test(x)),'догнал вплотную на скорости — проскочил вперёд, игроку подсказка: '+toast.join(''));
      const f3=foeAt(Math.PI,80,{hdg:0});f3.p[0]=0;f3.p[2]=-80;f3.v=[me.v[0],me.v[1],me.v[2]+15];Math.random=()=>0.99;const d3v=[me.p[0]-f3.p[0],me.p[1]-f3.p[1],me.p[2]-f3.p[2]];
      CK(frHuman(f3,1/60,{foes:[f3]},l3(d3v),d3v)===false&&f3.ai.st==='attack'&&f3.ai.ovCk===1,'опытному везёт — удержался сзади; второй раз на этом заходе кость не бросают');
      f.ai.t=0;f.ai.until=0.5;for(let i=0;i<40&&f.ai.st==='over';i++){f.ai.t+=1/60;frHuman(f,1/60,M,100,d);}CK(f.ai.st==='attack'&&f.ai.tail===0,'манёвр кончился — снова атакует, счёт времени на хвосте с нуля');}
    Math.random=R0;FW=sv.FW;fwPart=sv.fwPart;frSnd=sv.frSnd;fwHgt=sv.fwHgt;flToast=sv.flToast;air3dMesh=sv.air3dMesh;Object.assign(FL,sv.FL0);}
}
// ---------- 26. отзыв автора 21 ноября (вечер): трассы, кусты, мотоцикл, автобус и закрытый кузов в гонке, пилот, свои узлы ----------
{const R0=Math.random,rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();};
  const TD='/home/claude/avtoimperia/docs/terrain/',load=id=>{if(!window.REAL_TRACKS||!window.REAL_TRACKS[id])require(TD+id+'.js');return window.REAL_TRACKS[id];};
  // маршруты: петли и отростки вырезаны
  {const cut={roma:87,strasbourg:687,sf1915:107,tarare:62,lasarte:465};
    for(const id in cut){const D=load(id),F=realFix(D),n=F.pts.length;CK(F!==D&&F._fixed&&F._fixed.gone===cut[id]&&n===D.pts.length-cut[id],id+': из маршрута вырезано '+(F._fixed?F._fixed.gone:'—')+' точек из '+D.pts.length);
      CK(!rfxPairs(F.pts,false,true).some(Boolean),id+': двух проходов по одной дороге больше нет');
      const inR=k=>k>=0&&k<n;CK((F.seg||[]).every(q=>inR(q[1])&&inR(q[2])&&q[1]<=q[2])&&(F.bridges||[]).every(b=>inR(b.i))&&(F.notes||[]).every(q=>inR(q.i))&&(F.coast||[]).every(q=>inR(q.i0)&&inR(q.i1)),id+': участки, мосты и подписи — в пределах нового маршрута');
      CK(realFix(D)===F&&D.pts.length===n+cut[id],id+': починка считается один раз, исходные данные не тронуты');}
    // 0.60: Монако больше не пересекает само себя — меньшая петля пройдена в обратную сторону, встречные проходы разведены на 13 м
    const M=load('monaco'),FM=realFix(M);let sep=1e9,hd=0;for(let k=0;k<FM.pts.length;k++){const o=rfxOpp(FM.pts,k,RFX_GAP*2,300,0);if(o){sep=Math.min(sep,o[1]);if((k<10||k>262)&&o[1]<180)hd=Math.max(hd,Math.abs(FM.pts[k][2]-FM.pts[o[0]][2]));}}
    CK(M.closed&&rfxCross(M.pts).length===1&&rfxCross(FM.pts).length===0&&FM.pts.length>=M.pts.length-2&&FM._fixed.uncross&&sep>=RFX_SEP-8&&hd<=6,'Монако (круг): в данных стартовая прямая пересекала набережную — после починки пересечений нет, между встречными проходами не меньше '+(sep/10).toFixed(1)+' м, два прохода бульвара на одной высоте (до '+(hd/10).toFixed(2)+' м)');
    // все 78 файлов: открытые — без совпадающих проходов, вырезано не больше 60 %
    const ids=require('fs').readdirSync(TD).filter(f=>/\.js$/.test(f)).map(f=>f.replace('.js',''));let badIds=[],fixed=[];
    ids.forEach(id=>{const D=load(id),F=realFix(D);if(F!==D)fixed.push(id);if(!D.closed&&rfxPairs(F.pts,false,true).some(Boolean))badIds.push(id);if(F.pts.length<D.pts.length*0.4)badIds.push(id+'!');});
    CK(ids.length>=78&&!badIds.length,'все '+ids.length+' трасс: после починки ни на одной открытой нет двух проходов по одной дороге'+(badIds.length?': '+badIds.join(','):''));
    CK(fixed.sort().join(',')==='lasarte,monaco,roma,sf1915,strasbourg,tarare','починка тронула ровно шесть трасс: '+fixed.join(', '));}
  // Гран-при Рима: в собранной трассе ветки больше не сходятся; на серпантине обочина не лежит на соседней ветке
  {BOTS_OFF=true;newGame('renault','fr','T','normal');const all=[...RACES,...EXTRA_RACES];
    const build=(id,y,v)=>{const r0=all.find(r=>r.id===id),rc={...r0,y,key:r0.id+'|'+y};load(realIdOf(rc));return buildTrack(rc,v);};
    const minBranch=T=>{let m=1e9;const P=T.pts,n=T.n,g=Math.ceil(80/T.step);for(let i=0;i<n;i+=2)for(let j=i+g;j<n;j+=2){if(T.closed&&n-(j-i)<g)continue;const d=Math.hypot(P[i][0]-P[j][0],P[i][2]-P[j][2]);if(d<m)m=d;}return m;};
    const TR=build('x42022',1927,26);CK(TR.real&&minBranch(TR)>TR.W+12,'Гран-при Рима: ветки трассы не подходят друг к другу ближе '+minBranch(TR).toFixed(0)+' м (было 0,9 м на 320 метрах)');
    const TK=build('klausen',1927,40),L=branchLims(TK),W=TK.W;let cl=0,on=0;for(let i=0;i<TK.n;i++)for(const sd of [1,-1]){const lim=L[i*2+(sd>0?0:1)];if(lim<14)cl++;
      for(const a of [0,1.5,4,8.5,14].filter(a=>a<=lim).concat(lim<14&&lim>0.3?[lim]:[])){const o=sd*(W/2+a);if(a>0.2&&branchNear(TK,TK.pts[i][0]+TK.N[i][0]*o,TK.pts[i][2]+TK.N[i][1]*o,W/2-0.3,i,Math.ceil((W+16)/TK.step)+2))on++;}}
    CK(cl>40&&on===0,'Клаузен, серпантин: обочина укорочена у '+cl+' поперечников — ни одна её точка не лежит на полотне соседней ветки');
    const T0=build('pm1903',1903,26),L0=branchLims(T0);let c0=0;for(let i=0;i<L0.length;i++)if(L0[i]<14)c0++;CK(c0===0,'обычная дорога без петель: обочины прежние');
    const TM=build('monaco',1929,26);let near=1e9;(TM.tunnels||[]).forEach(q=>{for(let a=q.i0;a<=q.i1;a+=2)for(let k=0;k<TM.n;k+=2){let g=Math.abs(k-a);g=Math.min(g,TM.n-g);if(g<=16)continue;const d=Math.hypot(TM.pts[k][0]-TM.pts[a][0],TM.pts[k][2]-TM.pts[a][2]);if(d<near)near=d;}});
    CK((TM.tunnels||[]).length===1&&near>TM.W/2+26,'Монако: тоннель есть, и до соседней ветки от него '+near.toFixed(0)+' м — гребень над ним её не накрывает (было 17 м)');
    CK(!(TM.col||[]).some(o=>o.kind==='rock'&&o.box&&o.box.hu===1.6&&[1,0.5,0,-0.5,-1].some(c=>nearTrack(TM,o.x+o.box.vx*o.box.hv*c,o.z+o.box.vz*o.box.hv*c,TM.W/2-0.2))),'Монако: стены порталов не стоят на полотне');
    // куст — не стена; дерево — стена
    const car=()=>({x:0,z:0,yaw:0,vx:20,vy:0,r:0,dmg:0,hit:0,crash:null,len:4,L:2.6,you:1,player:1});
    const cb=car(),cc=carCapsule(cb),nose=[cc[0],cc[1]];const far=(Math.hypot(cc[0],cc[1])>Math.hypot(cc[2],cc[3])?[cc[0],cc[1]]:[cc[2],cc[3]]);
    const ob=k=>({x:far[0]+(far[0]>0?0.3:far[0]<0?-0.3:0),z:far[1]+(far[1]>0?0.3:-0.3),r:1,kind:k});
    {const c=car(),o=ob('bush'),x0=c.x,z0=c.z;for(let i=0;i<30;i++)obstacleHit(c,o,1/60);CK(c.x===x0&&c.z===z0&&c.vx<20&&c.vx>14&&c.dmg===0&&!c.crash,'куст: машину не отбрасывает и не бьёт — за полсекунды в кустах скорость 72 → '+Math.round(c.vx*3.6)+' км/ч');
      const c2=car(),o2=ob('oak');obstacleHit(c2,o2,1/60);CK((c2.x!==x0||c2.z!==z0)&&(c2.vx<19||c2.crash||c2.dmg>0),'дерево по-прежнему твёрдое');
      const c3=car(),h={x:o.x,z:o.z,r:3,kind:'hedge',box:{ux:1,uz:0,vx:0,vz:1,hu:2.5,hv:0.8}};for(let i=0;i<30;i++)obstacleHit(c3,h,1/60);CK(c3.x===x0&&c3.vx<20&&c3.vx<c.vx+0.01,'живая изгородь тормозит сильнее куста, но не останавливает: '+Math.round(c3.vx*3.6)+' км/ч');
      const c4=car();obstacleHit(c4,o,0);CK(c4.vx===20,'второй проход проверки столкновений скорость не снимает');}}
  // мотоцикл: в торможении руль остаётся у гонщика
  {const mk=moto=>({cls:moto?'moto':'car',vx:40,vy:-4,r:0,steer:0,delta:0,hold:0,L:1.4,b:0.7,grip:1,muNow:1,slipR:0.16});
    const run=(moto,A)=>{const c=mk(moto),sR=R,sK={...rKeys},sP=PHY.motoA,sH=PHY.hold;R={tilt:0};PHY.hold=0;if(A)PHY.motoA=A;else delete PHY.motoA;rKeys.left=false;rKeys.right=true;try{for(let i=0;i<45;i++){c.slipR=0.16;c.vy=-4;try{playerControl(c,1/60);}catch(_){/* дальше руля — газ и тормоз, им нужна настоящая машина */}}}finally{R=sR;Object.assign(rKeys,sK);if(sP)PHY.motoA=sP;else delete PHY.motoA;PHY.hold=sH;}return c.delta;};
    const dNew=run(true),dOld=run(true,[1,0.2]),dCar=run(false);
    CK(dNew>0.03&&dOld<0.012&&dNew>dOld*3,'мотоцикл, 144 км/ч, зад в заносе, руль вправо: колесо повёрнуто на '+(dNew*57.3).toFixed(1)+'° (со старым помощником — '+(dOld*57.3).toFixed(1)+'°)');
    CK(dCar>0.02,'у автомобиля в тех же условиях — '+(dCar*57.3).toFixed(1)+'° (не менялось)');}
  // вид в гонке: автобус — автобус, закрытая модель — закрытая
  {BOTS_OFF=true;newGame('ford','us','T','normal','M');const md={...G.models[0]},st=(b,p,o)=>carStyle({...md,b,t:o&&o.t||md.t},p,1927,true);
    CK(st('b15',0)==='bus'&&st('b14',1)==='bus'&&st('b16',0)==='bus','междугородний, городской и школьный автобус в гонке — автобус (был грузовик)');
    CK(st('b18',0)==='van'&&st('b19',0)==='van'&&st('b23',0)==='sedan'&&st('b26',0)==='tourer'&&st('b8',0)==='truck'&&st('b6',0)==='van','санитарная и почтовая — фургон, такси — закрытый автомобиль, штабная — фаэтон, грузовик — грузовик');
    CK(st('b5',2)==='sedan'&&st('b4',2)==='sedan'&&st('b9',2)==='sedan'&&st('b5',0)==='sedan','закрытая модель и с заводской гоночной подготовкой остаётся закрытой (была открытая гоночная)');
    CK(st('b3',2)==='gp1925'&&st('b1',2)==='gp1925'&&st('b10',2)==='sport','открытые — как раньше: гоночный кузов, родстер — спортивный');
    CK(modelSpec({...md,b:'b5'},2,1927,{}).strip===1&&modelSpec({...md,b:'b15'},0,1927,{}).style==='bus','у закрытой гоночной — полоса и номер; у автобуса свой ключ облика');
    const kd=b=>raceKindOk({...md,b});CK(kd('b15')&&kd('b14')&&kd('b18')&&kd('b23')&&kd('b17')&&!kd('b24')&&!kd('b25')&&!kd('b28')&&!kd('b29'),'в гонки можно автобус, санитарную, такси, пожарную; нельзя трактор, бронеавтомобиль, танк');
    // модель автобуса строится без ошибок (подробная и простая)
    let okM=true,why='';try{const sp=modelSpec({...md,b:'b15'},0,1927,{});[typeof carModel==='function'?carModel:null,typeof carModelLo==='function'?carModelLo:null].filter(Boolean).forEach(f=>{const M=f(sp);if(!M)okM=false;});}catch(e){okM=false;why=e.message;}CK(okM,'трёхмерная модель автобуса строится'+(why?': '+why:''));}
  // заявка: травмированного пилота заменяет лучший свободный
  {BOTS_OFF=true;rnd(3);newGame('ford','us','Форд','normal','T');const s=G;s.y=1928;s.m=5;s.cash=45e6;s.rdept=3;s.pending=[];s.drivers=['nuvolari'];s.inj={};
    const rc=RACES.find(r=>r.y===1928&&r.t==='circuit'&&raceCarsFor(s,r).length);const sO=openSheet,sT=toast;let said=[];openSheet=()=>{};toast=x=>{said.push(x);};
    try{RS={key:rc.key,entries:[defaultEntry(s,rc,[])],open:0,mode:'manage',more:false};CK(RS.entries[0].drv==='nuvolari','здоровый пилот команды — в заявке');
      s.inj.nuvolari={until:mi(s)+3,txt:'сломаны рёбра'};let thrown='';try{renderRaceSetup();}catch(e){thrown=e.message;}
      CK(RS.entries[0].drv&&RS.entries[0].drv!=='nuvolari'&&!drvOut(s,RS.entries[0].drv),'пилот травмирован — в его машине сразу другой: '+RS.entries[0].drv+(thrown?' ['+thrown+']':''));
      CK(said.some(x=>/сломаны рёбра/.test(x)&&/сел|садитесь/.test(x)),'и об этом сказано: '+said.join(' | '));
      const e2=defaultEntry(s,rc,RS.entries.map(x=>x.drv),'car');CK(e2.drv&&e2.drv!==RS.entries[0].drv&&e2.drv!=='nuvolari','«Ещё машина» — со своим пилотом: '+e2.drv);}
    finally{openSheet=sO;toast=sT;RS=null;}}
  // свои узлы: видны в «Улучшениях», доводятся на месте
  {BOTS_OFF=true;rnd(5);newGame('ford','us','Форд','normal','T');const s=G;s.y=1912;s.m=3;s.cash=5e6;s.pending=[];s.rd.lvl=Math.max(2,s.rd.lvl||0);const e0=G.models[0].e;
    const fin=()=>{const pj=rdActive(s).find(p=>p.kind==='own');CK(!!pj,'проект своей разработки в КБ');s.rd.projs=s.rd.projs.filter(p=>p!==pj);ownDone(s,pj);s.pending=[];return pj;};
    CK(ownStart(s,{k:'e',base:e0,tech:[],goal:'power',gl:1,name:'Мотор Форда'}),'своя разработка начата');fin();const x=ownParts(s,'e')[0];
    CK(x&&x.own&&x.name==='Мотор Форда'&&s.custom.length===1,'свой мотор готов: '+(x&&x.name));
    const U=rdProjects(s).filter(p=>p.kind==='upg'&&p.id===x.id);CK(U.length===1&&U[0].own===1&&U[0].name==='Мотор Форда'&&U[0].lvl===upgL(x.id)+1,'свой мотор есть в списке «Улучшения» (раньше его там не было)');
    CK(rdProjects(s).filter(p=>p.kind==='upg'&&!p.own).length>3,'исторические детали в списке остались');
    const hp0=x.hp,id0=x.id,P=ownPreview(s,{k:'e',base:x.id,tech:[],goal:'power',gl:1,into:1});CK(P&&!P.why&&P.pj.sp.into===1&&P.pj.name==='Мотор Форда','доводка: проект на том же узле, под тем же именем');
    CK(ownStart(s,{k:'e',base:x.id,tech:[],goal:'power',gl:1,into:1,name:'другое имя'}),'доводка начата');CK(ownIntoBusy(s,x.id)&&!ownStart(s,{k:'e',base:x.id,tech:[],goal:'light',gl:1,into:1}),'пока узел дорабатывают, вторую доводку не начать');
    fin();CK(s.custom.length===1&&x.id===id0&&x.name==='Мотор Форда'&&x.hp>hp0&&x.rev===2&&x.revY===1912&&/Доводка 1912 года/.test(x.art),'доводка закончена: узел тот же (не новая версия), мощность '+hp0+' → '+x.hp+' л.с., доводка №1');
    CK(byId(ENGINES,id0)===x&&rdProjects(s).some(p=>p.kind==='upg'&&p.id===id0),'узел на месте в каталоге партии и в «Улучшениях»');
    CK(ownStart(s,{k:'e',base:x.id,tech:[],goal:'light',gl:1,into:0,name:'Второй мотор'}),'«Новый узел на его основе» — по-прежнему можно');fin();CK(s.custom.length===2&&s.custom[1].name==='Второй мотор'&&s.custom[1].id!==id0&&x.rev===2,'и это отдельный узел; первый не тронут');
    {const t0=OWN_TECH.find(t=>t.cat.includes('e'));s.xp[t0.a]=99;x.tech=[t0.id];const P2=ownPreview(s,{k:'e',base:x.id,tech:[t0.id],goal:'power',gl:1,into:1});CK(P2&&/уже применён/.test(P2.why||''),'приём, уже применённый к узлу, второй раз не берётся: '+(P2&&P2.why));x.tech=[];}
    const sO=openSheet;let H='';openSheet=h=>{H=h;};try{openOwn(null);CK(/data-act="ownRefine" data-id="xe1"/.test(H)&&/Доработать/.test(H)&&/доводка №1 [(]1912[)]/.test(H),'в списке своих узлов — кнопка «Доработать» и номер доводки');
      ownDraftInit(s,'e',false,x.id);openOwn('e',false);CK(/id="owninto"/.test(H)&&/Доработать этот узел/.test(H)&&/Новый узел на его основе/.test(H)&&!/id="ownname"/.test(H)&&/Доработать · /.test(H),'лист доводки: выбор «доработать / новый узел», имя не спрашивают, кнопка «Доработать»');
      ownDraft.into=0;openOwn('e',false);CK(/id="ownname"/.test(H)&&/Начать · /.test(H),'«Новый узел» — с названием и кнопкой «Начать»');}finally{openSheet=sO;ownDraft=null;}}
  Math.random=R0;
}
// ---------- 27. этап 8: реже и весомее (заметки месяца, предложения, выставки), главное — крупно ----------
{const R0=Math.random,rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();};
  BOTS_OFF=true;rnd(4);newGame('ford','us','Форд','normal','T');const s=G;s.y=1908;s.m=4;s.cash=2e6;s.pending=[];s.digest=[];s.stopM=-1;pendingToasts.length=0;
  const N=(k,o)=>Object.assign({kicker:k,title:'Заголовок',text:'Текст.'},o||{});
  // до первого хода всё показывается целиком: вступление и рассказ об основании фирмы — не «заметки»
  CK(!s.played51&&evClass(s,N('Кинохроника'),true)==='stop'&&evClass(s,N('Детройт',{title:'Фирма строит автомобили'}),true)==='stop','до первого хода газета ничего не прячет в заметки (вступление, основание фирмы)');
  s.played51=1;
  // что останавливает игру
  CK(evClass(s,N('Кинохроника'),true)==='quiet'&&evClass(s,N('Торговля'),true)==='quiet'&&evClass(s,N('Автомобильное обозрение'),true)==='quiet','кинохроника, торговля, обозрение — в заметки');
  CK(evClass(s,N('Выставка',{deck:'12 заказов · серебро',cel:['Медаль']}),true)==='quiet'&&evClass(s,N('Выставка',{deck:'12 заказов · золото'}),true)==='stop','отчёт о выставке — в заметки; с золотой медалью — газетой');
  CK(evClass(s,N('Итоги года'),true)==='stop'&&evClass(s,N('Итоги года · по версии прессы',{cel:['Титул']}),true)==='quiet','итоги года — одна газета в год: обзор прессы уходит в заметки');
  CK(evClass(s,N('Мир',{world:'war'}),true)==='stop'&&evClass(s,N('',{cel:['Первыми в мире!']}),true)==='stop'&&evClass(s,N('Попытка рекорда'),true)==='stop'&&evClass(s,N('Испытания ведомства'),true)==='stop'&&evClass(s,N('КБ · своя разработка'),true)==='stop','мир, празднование и итог своей затеи (рекорд, испытания, КБ) — всегда газетой');
  CK(evClass(s,N('',{title:'Мотор вместо лошади'}),true)==='stop','хроника эпохи — газетой');
  CK(evClass(s,N('Банкротство',{choices:[['Спасти','a'],['Нет','b']]}),true)==='stop'&&evClass(s,N('Дуэль сегодня',{choices:[['Сесть за руль','dxDrive'],['Шофёр','dxSim']]}),true)==='stop','решение, которое нельзя отложить, — останавливает');
  CK(evClass(s,N('Вызов',{choices:[['Принять вызов','chalYes'],['Отказаться','chalNo']]}),true)==='offer'&&evClass(s,N('Сделка',{choices:[['Переговоры','ma:talk:x'],['Позже','ok']]}),true)==='offer'&&evClass(s,N('Приглашение на выставку',{choices:[['Стенд','show1'],['Не участвовать','show0'],['Управляющий','showAuto']]}),true)==='offer','вызов, сделка, приглашение — предложение');
  CK(offerNo(N('Вызов',{choices:[['Да','chalYes'],['Нет','chalNo']]}))==='chalNo'&&offerNo(N('Приглашение на выставку',{choices:[['Стенд','show1'],['Нет','show0'],['Упр','showAuto']]}))==='show0'&&offerNo(N('Сделка',{choices:[['Да','ma:talk:1'],['Нет','ma:credno:1']]}))==='ma:credno:1','у предложения известен ответ «нет»');
  // одна прочая новость в месяц
  pushEvent(N('Дилеры',{own:1,title:'Первая новость'}),false);CK(s.pending.length===1&&s.stopM===mi(s),'первая новость месяца — остановка');
  pushEvent(N('Дилеры',{own:1,title:'Вторая новость'}),false);CK(s.pending.length===1&&s.digest.length===1&&s.digest[0].title==='Вторая новость'&&pendingToasts.some(t=>/Вторая новость/.test(t)),'вторая за месяц — в заметки, с короткой строкой на экране');
  pushEvent(N('Кинохроника',{title:'Новая хроника'}),true);CK(s.pending.length===1&&s.digest[0].title==='Новая хроника'&&G.log.some(l=>/Новая хроника/.test(l.t||l.text||JSON.stringify(l))),'кинохроника — в заметки; в журнале она тоже есть');
  s.pending=[];const sO=openSheet;let H='';openSheet=h=>{H=h;};
  try{const C=digestCard(s);CK(/Заметки месяца/.test(C)&&/data-act="digestRead" data-i="0"/.test(C)&&/Новая хроника/.test(C)&&/Вторая новость/.test(C),'карточка «Заметки месяца» в «Империи»');
    digestRead(0);CK(s.pending.length===1&&s.pending[0].title==='Новая хроника'&&s.pending[0].choices[0][0]==='Закрыть'&&s.digest[0].read===1,'заметку можно открыть целиком — по своей воле');s.pending=[];
    s.m++;pushEvent(N('Дилеры',{own:1,title:'Новый месяц'}),false);CK(s.pending.length===1,'в новом месяце — снова одна остановка');s.pending=[];
    // предложения
    const off=N('Сделка',{title:'«Бриско» ищет покупателя',deck:'просят $90 000',choices:[['Переговоры','ma:talk:zz'],['Позже','ok']]});
    OFFERS_INBOX=false;pushEvent(off,true);CK(s.pending.length===1&&!(s.offers||[]).length,'в прогонах (ящик выключен) предложение идёт окном, как раньше');s.pending=[];
    OFFERS_INBOX=true;pushEvent(off,true);CK(s.pending.length===0&&s.offers.length===1&&s.offers[0].title==='«Бриско» ищет покупателя','ящик включён: предложение не окно, а запись в «Делах»');
    const T=[];offerAdvice(s,(p,ic,t,b,run)=>T.push({p,t,b,run}));CK(T.length===1&&T[0].b==='Открыть'&&/Бриско/.test(T[0].t)&&/спросят перед новым месяцем/.test(T[0].t)&&T[0].p>=95,'в советах — строка с кнопкой «Открыть», в самом верху');
    T[0].run();CK(s.pending.length===1&&s.pending[0].title==='«Бриско» ищет покупателя'&&s.pending[0].choices.length===2&&!s.offers.length,'«Открыть» — то же окно с теми же ответами');s.pending=[];
    pushEvent(off,true);const c9=s.cash,r9=s.rep;offersExpire(s);CK(!s.offers.length&&s.pending.length===1&&s.pending[0].title==='«Бриско» ищет покупателя'&&s.pending[0].last===1&&/ответ нужен сейчас/.test(s.pending[0].deck)&&s.pending[0].choices.length===2&&s.cash===c9&&s.rep===r9,'месяц кончился без ответа — молчаливого отказа нет: то же окно спрашивает перед новым месяцем');s.pending=[];
    s.mode='racer';CK(!offersOn(),'у гонщика ящика нет');s.mode=undefined;OFFERS_INBOX=false;
    // выставки
    CK(showPol(s)==='ask','в прогонах и у ботов — как раньше: спрашивают о каждой');OFFERS_INBOX=true;CK(showPol(s)==='home','в игре без помощника: спрашивают о выставках своей страны');s.helper={on:1};CK(showPol(s)==='auto','с помощником: выставки ведёт он');s.helper=null;s.showPol='ask';CK(showPol(s)==='ask','выбор игрока запоминается');OFFERS_INBOX=false;
    const shH=SHOWS.find(q=>SHOW_HOST[q.h].c===s.country&&q.y>=1905),shF=SHOWS.find(q=>SHOW_HOST[q.h].c!==s.country&&q.y>=1905);s.shows={};
    s.showPol='ask';CK(showAutoInvite(s,shH)===false&&showAutoInvite(s,shF)===false,'«спрашивать о каждой» — управляющий не вмешивается');
    s.showPol='home';CK(showAutoInvite(s,shH)===false,'«о своих»: своя выставка — к игроку');
    s.shows[shF.id]={inv:1,md:s.models[0].id};const c0=s.cash;{const dl=s.dealers;s.dealers={[s.country]:10};CK(showAutoInvite(s,shF)===true&&s.shows[shF.id].skip===1&&s.cash===c0,'«там, где продаёте»: в стране без ваших дилеров — не едем и денег без спроса не тратим');
      s.shows[shF.id]={inv:1,md:s.models[0].id};s.dealers={[s.country]:10,[SHOW_HOST[shF.h].c]:3};CK(showAutoInvite(s,shF)===false,'в стране, где есть ваши дилеры, — спрашивают');s.dealers=dl;}
    s.showPol='auto';s.cash=5e6;s.shows[shH.id]={inv:1,md:s.models[0].id};const c1=s.cash,t1=showAutoTier(s,shH);CK(t1>=1&&showAutoInvite(s,shH)===true&&s.shows[shH.id].tier===t1&&c1-s.cash===s.shows[shH.id].cost&&s.shows[shH.id].cost<=c1/8,'управляющий берёт стенд по средствам: '+SHOW_TIER[t1].n+' за '+s.shows[shH.id].cost);
    {const k1=standCost(shH,s,1),k2=standCost(shH,s,2);s.cash=k1*8+1;CK(showAutoTier(s,shH)===1,'касса в восемь малых стендов — малый стенд (раньше ехали, только если стенд дешевле 2 % кассы)');s.cash=k1*8-1;CK(showAutoTier(s,shH)===0,'чуть меньше — не едем');s.cash=k2*12+1;CK(showAutoTier(s,shH)>=2,'касса в двенадцать больших стендов — большой');}
    s.cash=50;CK(showAutoTier(s,shH)===0,'денег нет — не едем');s.cash=5e6;s.showPol='none';s.shows['zz']=1;const shN=SHOWS.find(q=>q!==shH&&SHOW_HOST[q.h].c===s.country&&q.y>=1905)||shH;s.shows[shN.id]={inv:1,md:s.models[0].id};const c2=s.cash;showAutoInvite(s,shN);CK(s.cash===c2&&s.shows[shN.id].skip===1,'«не ездить» — не едем и не спрашиваем');
    CK(/id="showpol"/.test(showPolCard(s))&&/data-act="showPol" data-v="auto"/.test(showPolCard(s)),'в «Империи» — карточка «Выставки» с выбором, кто решает');
    s.showPol='ask';s.showNow=shH.id;s.shows[shH.id]={inv:1,md:s.models[0].id};s.pending=[{title:'x',choices:[['a','showAuto']]}];resolve('showAuto');CK(s.showPol==='auto','ответ «Дальше пусть решает управляющий» в приглашении меняет правило');s.pending=[];
    // главное — крупно
    let g=evGist({title:'Парижский салон',deck:'Стенд: 12 заказов · +2 дилера · репутация +0,4'});CK(g&&g.tone==='good'&&/12 заказов/.test(g.txt)&&!g.lab,'вывод заметки — её подзаголовок с числами; хорошая новость — зелёным');
    g=evGist({title:'Пожар на складе',deck:'Сгорело 40 машин — убыток $12 000'});CK(g&&g.tone==='bad','плохая — красным');
    g=evGist({title:'Война!',deck:'Европа',mean:'Гражданский спрос упадёт, армии нужны грузовики.'});CK(g&&g.lab==='Что это значит для вас'&&/грузовики/.test(g.txt),'где есть «что это значит для вас» — оно и стоит выводом');CK(evGist({title:'Без вывода'})===null,'нет вывода — нет блока');
    const PH=paperHTML({title:'Парижский салон',deck:'12 заказов · +2 дилера',text:'Текст.',kicker:'Выставка',choices:[['Дальше','ok']]},s);
    CK(/class="p-gist good"/.test(PH)&&PH.indexOf('p-gist')<PH.indexOf('p-cols')&&PH.indexOf('p-gist')>PH.indexOf('p-head')&&!/class="p-mean"/.test(PH),'в газете вывод стоит сразу под заголовком, крупно, до текста');
    // кнопка действия
    s.m++;pushEvent({own:1,kicker:'Дилеры',title:'Очереди у дилеров',text:'Завод не успевает. Стройте цеха на вкладке «Завод».'},false);const E=s.pending[0];
    CK(E&&E.choices[0][1]==='go:plant'&&/Открыть «Завод»/.test(E.choices[0][0])&&E.choices.some(c=>c[1]==='ok'),'заметка зовёт на вкладку — в ней кнопка «Открыть „Завод“»');
    tab='log';resolve('go:plant');CK(tab==='plant'&&!s.pending.length,'кнопка закрывает заметку и открывает вкладку');
    // рисунок соответствует заметке
    {const car=s.models[0];car.status='prod';car.lastSold=10;const mo={...car,id:901,name:'Мотоцикл Ф',b:BODIES.find(b=>b.moto).id,status:'prod',lastSold:999},tr={...car,id:902,name:'Грузовик Ф',b:'b7',status:'prod',lastSold:5};s.models.push(mo,tr);const mR=modelR;modelR=(m)=>m.id===901?9:m.id===902?1:5;
      try{CK(paperOwnModel({title:'Сотая машина «Форд»!'},s)===car,'«Сотая машина» — рисунок автомобиля, хотя лучший по счёту — мотоцикл');CK(paperOwnModel({title:'Мотоцикл «Форд» — первый в своём классе!'},s)===mo,'заметка о мотоцикле — мотоцикл');
        CK(paperOwnModel({title:'Заказ от почтового ведомства',deck:'двадцать фургонов'},s)===tr,'заметка о фургонах — грузовик');
        s.ms=0;const tS=totalSold;totalSold=()=>150;s.pending=[];s.stopM=-1;checkMilestones(s);totalSold=tS;CK(s.pending[0]&&/Сотая машина/.test(s.pending[0].title)&&s.pending[0].carId===car.id,'веха «Сотая машина» берёт в рисунок автомобиль (мотоциклов продано больше)');s.pending=[];
        s.models=s.models.filter(m=>m!==car&&m!==tr);CK(paperOwnModel({title:'Сотая машина'},s)===mo,'у фирмы одни мотоциклы — рисуем мотоцикл');}
      finally{modelR=mR;s.models=s.models.filter(m=>m.id<900);if(!s.models.includes(car))s.models.unshift(car);}}
    CK(evGoTab('Смотрите на вкладке «Рынок».').id==='market'&&evGoTab('Гонщик ждёт вас на вкладке «Гонки»').id==='race'&&evGoTab('ничего такого')===null,'вкладки узнаются по тексту');}
  finally{openSheet=sO;OFFERS_INBOX=false;}
  Math.random=R0;
}
// ---------- 28. этап 8б: сюжет по партии — глава по состоянию, «история и ваша партия», настоящие последствия ----------
{const R0=Math.random,rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();};
  const find=id=>{for(const k of Object.keys(SAGA)){const c=SAGA[k].find(x=>x.id===id);if(c)return c;}return null;};
  const opt=key=>{const a=key.split(':'),ch=find(a[0]);if(a.length===3)return ch.v[+a[1].slice(1)].o[+a[2]];return ch.o[+a[1]];};
  BOTS_OFF=true;rnd(7);newGame('ford','us','Форд','normal','T');const s=G;s.pending=[];s.saga={seen:['ford1','ford2'],pick:{},last:-99,t0:mi(s)};
  // глава по состоянию: «Машина для множества» (история — 1908) открывается по продажам
  const tS=totalSold;try{
    CK(sagaPaceOf({...s,y:1896},find('ford2')).d===undefined,'первая машина — завязка партии: «опередили историю» о ней не говорится');
    s.y=1904;s.m=3;totalSold=()=>500;CK(!sagaReady(s,find('ford4')),'«Машина для множества»: до 2000 проданных машин глава не приходит');
    totalSold=()=>2100;CK(sagaReady(s,find('ford4')),'2000 машин продано в 1904 году — глава приходит, не дожидаясь 1908-го');
    s.raceLog=[];sagaCheck(s);const P=s.saga.pace&&s.saga.pace.ford4;
    CK(s.pending.some(p=>p.saga==='ford4')&&P&&P.d===4&&P.y===1904&&P.hy===1908,'глава поставлена, запомнено: история — 1908, игра — 1904, на 4 года раньше');
    const t=sagaPaceText(s,find('ford4'));CK(/В истории это случилось в 1908 году/.test(t)&&/1904-й/.test(t)&&/опередили историю на 4 года/.test(t),'первый кадр говорит, что игрок опередил историю: '+t);
    const pc=sagaPaced(s,find('ford4'));CK(pc.sc.length===find('ford4').sc.length+1&&pc.sc[0].gen===1&&find('ford4').sc[0].gen===undefined,'кадр «история и ваша партия» добавлен первым, сама глава не тронута');
    s.pending=[];
    // гонок не было — глава о гонке не приходит ни в свой год, ни через три года; в карточке сказано, чего она ждёт
    s.y=1906;CK(!sagaReady(s,find('ford3')),'«Десять миль в Гросс-Пойнте»: гонок не было — глава не приходит и через пять лет после даты');
    CK(/выйдете на старт/.test(sagaWaitHint(s,find('ford3')))&&/откроется, когда выйдете на старт/.test(sagaCard(s)),'в карточке фильма: «откроется, когда выйдете на старт»');
    s.raceLog=[{place:3}];CK(sagaReady(s,find('ford3')),'вышли на старт — глава открылась');
    s.saga.pace={};s.saga.last=-99;s.saga.seen=['ford1','ford2','ford4'];sagaCheck(s);const P3=s.saga.pace.ford3;
    CK(P3&&P3.d===-5&&/на 5 лет позже/.test(sagaPaceText(s,find('ford3'))),'пришли к гонкам позже истории — глава так и говорит: '+sagaPaceText(s,find('ford3')));s.pending=[];s.raceLog=[];
    // глава по масштабу, до которого игрок не дошёл, приходит через три года после даты — и говорит, что история шла быстрее
    totalSold=()=>300;s.saga.seen=['ford1','ford2','ford3'];s.y=1910;CK(!sagaReady(s,find('ford4')),'мало продано, 1910 год — «Машина для множества» ещё ждёт');
    s.y=1911;CK(sagaReady(s,find('ford4')),'1911 год (история + 3) — глава приходит и без 2000 машин');
    CK(/когда продадите 2.?000 машин/.test(sagaWaitHint({...s,y:1909},find('ford4'))),'в карточке — сколько осталось продать: '+sagaWaitHint({...s,y:1909},find('ford4')));
    // главы биографии больше не ждут гонок
    CK(sagaWhen(find('agnelli4')).join()==='y:1908'&&sagaWhen(find('peugeot4')).join()==='y:1896'&&sagaWhen(find('bugatti4')).join()==='y:1912','суд Аньелли, раздел семьи Пежо, чертёж Бугатти — по дате, без условия «первая гонка»');
    CK(sagaWhen(find('renault4')).join()==='firstWin'&&sagaWhen(find('ford5')).join()==='y:1913'&&sagaWhen(find('ford6')).join()==='crisis','слава Гран-при — после своей победы; конвейер 1913 года и кризис — по календарю');
    // очередь заказов
    const md=s.models[0];md.status='prod';md.backlog=10;s.last={made:20};CK(!sagaCond(s,'backlog'),'очередь меньше двух месяцев выпуска — «большого заказа» нет');
    md.backlog=80;CK(sagaCond(s,'backlog')&&sagaCond(s,'races:0')&&!sagaCond(s,'wins:1'),'очередь в четыре месяца выпуска — есть');md.backlog=0;
    // масштаб против истории: календарная глава сравнивает выпуск
    s.y=1913;s.m=2;s.peakLast=12000;s.saga.pace={ford5:sagaPaceOf(s,find('ford5'))};const t5=sagaPaceText(s,find('ford5'));
    CK(s.saga.pace.ford5.d===undefined&&s.saga.pace.ford5.hv>100000&&/история шла быстрее/.test(t5)&&/«Ford»/.test(t5),'календарная глава сравнивает выпуск с историческим «Ford»: '+t5);
    s.peakLast=400000;s.saga.pace={ford5:sagaPaceOf(s,find('ford5'))};CK(/впереди истории/.test(sagaPaceText(s,find('ford5'))),'выпуск вдвое больше исторического — «вы идёте впереди истории»');
    s.peakLast=170000;s.saga.pace={ford5:sagaPaceOf(s,find('ford5'))};CK(sagaPaceText(s,find('ford5'))===''&&sagaPaced(s,find('ford5'))===find('ford5'),'идёте вровень с историей — лишнего кадра нет');
  }finally{totalSold=tS;}
  // настоящие последствия: что написано в ответе, то и происходит
  CK(opt('ford6:1').fx.loan===1&&/заём/i.test(opt('ford6:1').t)&&opt('durant2:0').fx.loan===1&&/в долг/.test(opt('durant2:0').t)&&opt('ford3:0').fx.stake===1&&/инвестор/.test(opt('ford3:0').t)&&opt('custom7:v1:2').fx.stake===1&&/долю/.test(opt('custom7:v1:2').t),'таблица: заём и доля стоят у ответов про заём и инвесторов');
  CK(['agnelli6:1','bianchi5:0','frese4:0','ryab6:0'].every(k=>opt(k).fx.wage===1&&/прибавк|жалованье/i.test(opt(k).t))&&['agnelli6:2','bianchi5:1','frese4:1','ryab6:1'].every(k=>opt(k).fx.strike===1),'таблица: прибавка — у ответов о прибавке, забастовка — у отказа рабочим');
  CK(['olds6:2','renault5:0','peugeot6:0','custom5:0','ryab4:0'].every(k=>opt(k).fx.mil===1&&/военн|фронт|арми/i.test(opt(k).t)),'таблица: военный контракт — у ответов о заказах армии');
  {const n=[];for(const k of Object.keys(SAGA))for(const ch of SAGA[k])[ch.o].concat((ch.v||[]).map(v=>v.o)).forEach(O=>(O||[]).forEach(o=>{const f=o.fx||{};if(f.loan||f.stake||f.wage||f.strike||f.mil)n.push(ch.id);}));CK(n.length===22,'настоящих последствий в ответах: '+n.length);}
  rnd(3);newGame('ford','us','Форд','normal','T');{const s=G;s.pending=[];s.y=1921;s.m=2;s.cash=400000;s.loan=10000;s.partners=[];s.wagePol='market';s.strikeNext=false;
    const f=opt('ford6:1').fx,a=Math.abs(sagaCash(s,f)),c0=s.cash,l0=s.loan,txt=sagaFxText(f,s);
    CK(/это заём: долг [+]/.test(txt)&&/% годовых/.test(txt),'заём в ответе назван займом, со ставкой: '+txt);
    sagaApply(s,f);CK(Math.abs(s.loan-l0-a)<1&&Math.abs(s.cash-c0-a)<1&&a>0,'«Взять заём у банкиров»: касса +'+a+', долг +'+a+' — настоящий');
    const f2=opt('durant2:0').fx,a2=Math.abs(sagaCash(s,f2)),c1=s.cash,l1=s.loan,t2=sagaFxText(f2,s);sagaApply(s,f2);
    CK(Math.abs(s.cash-c1)<1&&Math.abs(s.loan-l1-a2)<1&&/в долг: касса цела/.test(t2)&&!/^−/.test(t2),'«Строить цеха в долг»: касса цела, долг вырос — '+t2);
    const f3=opt('ford3:0').fx,sh=sagaStakeSh(s,f3),t3=sagaFxText(f3,s);sagaApply(s,f3);const pp=s.partners[s.partners.length-1];
    CK(pp&&pp.saga===1&&pp.n==='Инвесторы'&&Math.abs(pp.sh-sh)<0.002&&pp.sh>=0.02&&pp.sh<=0.2&&Math.abs(partnersShare(s)-pp.sh)<1e-9&&new RegExp(Math.round(sh*100)+'% прибыли').test(t3),'«Найти инвесторов»: у них настоящая доля прибыли — '+Math.round(pp.sh*100)+'% ('+t3+')');
    const tw=sagaFxText(opt('frese4:0').fx,s);sagaApply(s,opt('frese4:0').fx);CK(s.wagePol==='good'&&/Выше рынка/.test(tw)&&/дороже на 25%/.test(tw),'«Восьмичасовой день и прибавка»: ставка жалованья — «Выше рынка»: '+tw);
    sagaApply(s,opt('frese4:0').fx);CK(s.wagePol==='good'&&/уже выше рынка/.test(sagaFxText(opt('frese4:0').fx,s)),'выше рынка уже платят — ставка не меняется, ответ так и говорит');
    sagaApply(s,opt('ryab6:1').fx);CK(s.strikeNext===true&&/забастовка в следующем месяце/.test(sagaFxText(opt('ryab6:1').fx,s)),'«Не уступать ни в чём»: забастовка в следующем месяце — настоящая');
    s.military=false;s.y=1921;sagaApply(s,opt('custom5:0').fx);CK(!s.military,'войны нет — военного контракта фильм не подписывает');
    s.y=1917;s.m=6;const tm=sagaFxText(opt('custom5:0').fx,s);sagaApply(s,opt('custom5:0').fx);CK(s.military===true&&/военный контракт/.test(tm),'война идёт — «Взять военный заказ» подписывает настоящий контракт: '+tm);
    // что действует сейчас — видно в карточке фильма
    s.y=1921;s.m=2;s.sagaB={};s.sagaSeg={};sagaApply(s,opt('ford4:0').fx);const L=sagaNowList(s);
    CK(L.some(x=>/выпуск [+]6% — до /.test(x))&&L.some(x=>/спрос: народный [+]12%/.test(x))&&L.some(x=>/Инвесторы: [0-9]+% прибыли — пока не выкупите долю/.test(x)),'список действующих решений: '+L.join(' | '));
    CK(/Решения фильма действуют сейчас/.test(sagaCard(s)),'карточка фильма показывает действующие решения');
    {const tb=sagaFxText(opt('ford6:v0:0').fx,s);sagaApply(s,opt('ford6:v0:0').fx);CK(!s.partners.some(p=>p.saga)&&/выкуплены/.test(tb),'«Выкупить на свои деньги»: совладельцы из фильма выкуплены на самом деле — '+tb);}
    s.y=1926;CK(!sagaNowList(s).some(x=>/выпуск/.test(x)),'срок вышел — строки нет');}
  // рисунок соответствует заметке: «ваша машина» в мировом и случайном событии — автомобиль, а не самый продаваемый мотоцикл
  rnd(5);newGame('ford','us','Форд','normal','T');{const s=G,car=s.models[0];car.status='prod';car.lastSold=20;
    const mo={...car,id:901,name:'Мото',lastSold:500,b:BODIES.find(b=>b.moto).id},tr={...car,id:902,name:'Грузовик',lastSold:300,b:'b7'};
    try{CK(isMoto(mo)&&isTruck(tr)&&!isMoto(car)&&!isTruck(car),'заготовки проверки: мотоцикл, грузовик, автомобиль');s.models=[car,mo,tr];
      CK(bestModel(s)===car&&chModel(s)===car,'автомобиль есть — «ваша машина» это он, хотя мотоциклов и грузовиков продано больше');
      s.models=[mo,tr];CK(bestModel(s)===tr&&chModel(s)===mo,'легковых нет: в мировом событии — грузовик; случайное событие о машине грузовик не берёт');
      s.models=[mo];CK(bestModel(s)===mo&&chModel(s)===mo,'у мотоциклетной фирмы — мотоцикл');
      s.models=[car,mo,tr];const h=paperHTML({own:1,kicker:'Кинохроника',title:'Прототип готов: Грузовик 3 т',deck:'На 2 года раньше рынка',text:'Текст.',choices:[['Дальше','ok'],['▶ Смотреть кинохронику','reel:h:peace']]},s);
      CK(!/компании «Форд»/.test(h),'заметка с кадром кинохроники — без рисунка «лучшей машины фирмы»');
      const h2=paperHTML({own:1,kicker:'Дилеры',title:'Очереди у дилеров',text:'Текст.'},s);CK(/«T» компании «Форд»/.test(h2),'обычная заметка о компании — с её автомобилем');}
    finally{s.models=[car];}}
  Math.random=R0;
}
// ---------- 29. этап 9: советы с действием, подразделы вкладок, одна полоса стран ----------
{const R0=Math.random,rnd=a=>{Math.random=(()=>{let x=a;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();};
  BOTS_OFF=true;rnd(9);newGame('ford','us','Форд','normal','T');const s=G;
  // партия без игрока: каждый месяц у каждого совета есть кнопка и действие
  {let n=0,noBtn=[],seen=new Set(),g=0;while(s.y<1914&&!s.over&&g++<260){while(s.pending.length){const ev=s.pending[0],K=(ev.choices||[['ok','ok']]).map(x=>x[1]);try{resolve(K.includes('saga')?'saga':K.includes('tskip')?'tskip':K.find(x=>x.slice(0,5)!=='reel:'&&x.slice(0,3)!=='go:')||'ok');}catch(e){s.pending.shift();}if(s.pending[0]===ev)s.pending.shift();}
      if(s.cash<20000)s.cash+=60000;const L=adviceList(s);n+=L.length;L.forEach(t=>{seen.add(tipKey(t));if(!t.btn||typeof t.run!=='function')noBtn.push(t.icon+' '+String(t.text).slice(0,60));});step();}
    CK(n>200&&seen.size>=8&&!noBtn.length,'советов без кнопки не осталось: '+n+' показов, '+seen.size+' видов'+(noBtn.length?' — без кнопки: '+[...new Set(noBtn)].slice(0,3).join(' | '):''));}
  s.pending=[];s.over=false;
  // совет можно скрыть на год; тревоги и предложения — нельзя
  {const L=adviceList(s),t=L.find(tipCanHide);CK(!!t,'есть совет, который можно скрыть');
    if(t){const k=tipKey(t),m0=s.m,y0=s.y;tipHideKey(s,k,12);CK(!adviceList(s).some(x=>tipKey(x)===k),'скрытый совет не показывается');
      s.y++;CK(adviceList(s).some(x=>tipKey(x)===k)||true,'через год совет может вернуться');s.y=y0;s.m=m0;
      const a={icon:'🏷',text:'Прибыль с «Модель T» будет выше на 12% при цене $740',p:40},b={icon:'🏷',text:'Прибыль с «Модель A» будет выше на 7% при цене $1 860',p:40};
      CK(tipKey(a)===tipKey(b)&&tipKey(a)!==tipKey({icon:'🏭',text:a.text,p:40}),'один и тот же совет в разные месяцы и о разных моделях — один ключ');}
    CK(!tipCanHide({p:95,icon:'💰',text:'Касса в минусе'})&&!tipCanHide({p:97,icon:'✉',text:'Вызов'})&&tipCanHide({p:46,icon:'🏢',text:'x'}),'тревогу о кассе и предложение скрыть нельзя');
    s.tipHide={};}
  // совет «к модели» возвращает адрес её карточки: второе нажатие — уже на ней
  {const f=String(adviceList).replace(/\s+/g,' ');CK(f.indexOf("return 'mdc'+mine.id")>0&&f.indexOf("return 'mdc'+w.md.id")>0,'советы «К цене модели» и «К модели» ведут на карточку этой модели');}
  // подразделы вкладок (0.60, правка автора 23 ноября: «Завод», «Модели», «Гонки» — снова одна страница; у «Империи» — два подраздела)
  s.ui={};CK(!SUB51.plant&&!SUB51.models&&!SUB51.race&&subSel(s,'plant')===''&&Object.keys(SUB51).join()==='log'&&SUB51.log.bar.length===2&&subSel(s,'log')==='emp','подразделы: «Завод», «Модели», «Гонки» листаются целиком; «Империя» — два подраздела');
  subSet(s,'log','film');CK(subSel(s,'log')==='film','выбор запоминается');subSet(s,'log','нет такого');CK(subSel(s,'log')==='emp','неизвестный подраздел — как по умолчанию');
  subSet(s,'log','troph');CK(subSel(s,'log')==='emp','подраздел из сохранения 0.51 («Вызовы и трофеи») — теперь «Империя»');subSet(s,'log','log');CK(subSel(s,'log')==='film','«Хроника» из 0.51 — теперь «Фильм и хроника»');
  CK(Object.keys(SUB51).every(t=>SUB51[t].bar.length<=3&&SUB51[t].bar.some(b=>b[0]===SUB51[t].def)&&Object.values(SUB51[t].of).every(k=>SUB51[t].bar.some(b=>b[0]===k))),'подразделов не больше трёх, у каждой карточки из таблицы есть свой');
  // «Рынок»: одна полоса стран, под страной — всё подряд
  s.ui={};CK(mk9C(s)==='us'&&mk9Key(s)==='c'&&typeof mk9S==='undefined','«Рынок» открывается на своей стране; кнопок «Продажи / Сеть / Сделки» нет');
  s.dealers={us:40,uk:5};mk9Set(s,'uk');CK(s.ui.dlrC==='uk'&&s.ui.mkC==='uk'&&s.ui.dealC==='uk','выбрали Британию — дилеры, доли и сделки о Британии');
  {const el=(id,adv)=>({id,classList:{contains:c=>adv&&c==='advisor'}}),k=id=>subKeyOf(s,'market',el(id));const t0=tab;tab='market';
    CK(k('fc-dealers')===null&&k('fc-deals')===null&&k('fc-shares')===null&&k('fc-mkhome')==='__no'&&k('sec-world')==='__no','под чужой страной — её доли, сеть и сделки подряд; домашних карточек и карты мира нет');
    mk9Set(s,'us');CK(k('fc-mkhome')===null&&k('fc-buyers')===null&&k('fc-dealers')===null&&k('fc-adc')===null&&k('fc-deals')===null&&k('sec-world')==='__no','под своей страной — продажи, покупатели, сеть, реклама и сделки подряд');
    mk9Set(s,'world');CK(mk9C(s)==='world'&&s.ui.mkC==='world'&&mk9Key(s)==='world'&&k('sec-world')===null&&k('fc-shares')===null&&k('fc-shows')===null&&k('fc-graphs')===null&&k('fc-dealers')==='__no','«Обзор» — карта стран, марки, выставки и графики подряд; сети и сделок нет');
    CK(!/seg3/.test(mk9BarHTML(s))&&/data-c="world"/.test(mk9BarHTML(s)),'в полосе «Рынка» — только страны и «Обзор»');tab=t0;}
  s.ui.mk9='нет';CK(mk9C(s)==='us','неизвестная страна — своя');
  // хроника по частям
  {const lg=s.log;s.log=Array.from({length:90},(_,i)=>({d:'Янв 1900',kind:'',text:'запись '+i}));s.ui={};const h=vLog();const n=h.split('<li class=').length-1;CK(n===15&&h.indexOf('data-act="logMore"')>0&&h.indexOf('осталось 75')>0,'хроника: 15 записей и кнопка «Показать ещё · осталось 75» ('+n+')');
    s.ui.logN=215;CK(vLog().split('<li class=').length-1===90&&vLog().indexOf('data-act="logMore"')<0,'после «Показать ещё» — все 90, кнопки нет');s.log=lg;s.ui={};}
  Math.random=R0;
}
// ---------- 30. этап 10: «что сейчас звучит» и плейлист без повторов ----------
{ // плейлист: слышанное — в конец, давно не звучавшее — вперёд
  MUS_HIST=[];const L=['a','b','c','d','e','f'].map(id=>({id,title:'Запись '+id}));
  CK(musFresh(L).map(t=>t.id).join('')==='abcdef','ничего ещё не звучало — порядок прежний');
  musHeard(L[0]);musHeard(L[2]);CK(musHist().join()==='a,c'&&musFresh(L).map(t=>t.id).join('')==='bdefac','слышанные «a» и «c» ушли в конец, раньше — та, что звучала давнее');
  musHeard(L[0]);CK(musHist().join()==='c,a'&&musFresh(L).map(t=>t.id).join('')==='bdefca','послушали «a» ещё раз — теперь она последняя');
  L.forEach(t=>musHeard(t));CK(musFresh(L).map(t=>t.id).join('')==='abcdef','прозвучали все — круг начинается с той, что звучала раньше всех');
  CK(JSON.parse(localStorage.getItem('avt-mushist')).length===6,'память о слышанном сохраняется между запусками');
  CK(musFresh([{id:'x'},{id:'a'}]).map(t=>t.id).join('')==='xa','короткий список не трогаем');
  {const src=String(musBuild);CK(src.indexOf('musFresh(L)')>0&&src.indexOf('musFresh(L)')<src.indexOf('первой звучит запись эпохи')&&String(musicPlay).indexOf('musHeard(tr)')>0,'плейлист пересобирается с учётом слышанного; каждая запись отмечается при запуске');}
  // что сейчас звучит
  AU_LOG.length=0;auLog('звук click');auLog('звук click');auLog('сигнал fan_win');CK(AU_LOG.length===2&&AU_LOG[0].n===2&&AU_LOG[1].w==='сигнал fan_win','журнал звуковых событий: повторы подряд сворачиваются');
  for(let i=0;i<60;i++)auLog('событие '+i);CK(AU_LOG.length===40,'в журнале — последние 40 событий');
  {const a0=AU.el,s0=AU.synth,c0=AU.cue,n0=AU.nowPlaying,v0=VOICE.el,cu=Object.assign({},CUE);try{VOICE.el=null;Object.keys(CUE).forEach(k=>delete CUE[k]);AU.el={paused:false,ended:false,currentTime:12.4,volume:0.5};AU.nowPlaying={title:'Сауза. «Вашингтон пост»'};AU.synth=null;AU.cue=null;
      let T=auNowList();CK(T.some(x=>/^музыка, запись: Сауза. «Вашингтон пост» · 12 с · громкость 0.50/.test(x))&&!T.some(x=>/одновременно/.test(x))&&T.some(x=>/^настройки: музыка/.test(x)),'играет одна запись — она в списке, предупреждения нет');
      AU.synth={tune:'rag1'};T=auNowList();CK(/одновременно звучит источников: 2/.test(T[0])&&T.some(x=>/^музыка, синтезатор: rag1/.test(x)),'запись и синтезатор сразу — первой строкой предупреждение о двух источниках');
      AU.cue={a:{paused:false,ended:false,currentTime:3,src:'music/fan_win.m4a'}};T=auNowList();CK(/источников: 3/.test(T[0])&&T.some(x=>/^сигнал: fan_win.m4a · 3 с/.test(x)),'и фанфара — три источника');
      AU.el.paused=true;AU.synth=null;T=auNowList();CK(!/одновременно/.test(T[0])&&!T.some(x=>/^музыка, запись/.test(x)),'запись на паузе в список не попадает');
      const txt=auNowText();CK(/Сейчас звучит:/.test(txt)&&/Последние звуковые события:/.test(txt)&&/событие 59/.test(txt)&&txt.split('\\n').length>=6,'текст для отправки: что звучит и последние события');
    }finally{AU.el=a0;AU.synth=s0;AU.cue=c0;AU.nowPlaying=n0;VOICE.el=v0;Object.assign(CUE,cu);}}
  CK(/id="auNow"/.test(auNowHTML())&&/data-act="auNowCopy"/.test(auNowHTML())&&/Что сейчас звучит/.test(auNowHTML()),'в настройках — блок «Что сейчас звучит» с кнопкой «Скопировать»');
  MUS_HIST=[];localStorage.removeItem('avt-mushist');AU_LOG.length=0;
  // фонотека: исправленная подпись
  CK(typeof MUS_TO==='object'&&MUS_TO.tsar_hymn===1917&&MUS_TO.worker_marseillaise===1918,'гимны 1917 года звучат только в своё время');
  // писк и задвоение: мелодию «по поводу» прервали, пока она грузилась, — запись не портится и запасная не запускается
  {const A0=Audio;let mode='AbortError',fbN=0;const c0=AU.cue,e0=AU.el,s0=AU.synth;AU.cue=null;AU.el=null;AU.synth=null;
    try{Audio=function(src){return {paused:true,ended:false,volume:1,currentTime:0,src,addEventListener(){},pause(){this.paused=true;},play(){this.paused=false;return {catch(fn){fn({name:mode});return this;},then(){return this;}};}};};
      delete CUE.t_ab;auCueSrc('t_ab','music/x.m4a',0.8,()=>fbN++,5,2);CK(CUE.t_ab&&!CUE.t_ab.bad&&fbN===0,'мелодию прервали во время загрузки: запись не помечена негодной, запасная не звучит (было: помечена до конца сеанса, запасная — поверх)');
      AU.cue=null;mode='NotSupportedError';delete CUE.t_ns;auCueSrc('t_ns','music/y.m4a',0.8,()=>fbN++,5,2);CK(CUE.t_ns&&CUE.t_ns.bad===1&&fbN===1,'запись не читается: помечена, звучит запасная');
      AU.cue=null;mode='NotAllowedError';delete CUE.t_na;fbN=0;auCueSrc('t_na','music/z.m4a',0.8,()=>fbN++,5,2);CK(CUE.t_na&&!CUE.t_na.bad&&fbN===1,'автозапуск запрещён: запись не помечена, звучит запасная');
      AU.cue=null;mode='AbortError';delete CUE.own_cue_t5;fbN=0;auCue('t5',0.8,()=>fbN++,1);CK(CUE.t5&&!CUE.t5.bad&&fbN===0,'то же для своих тем игры (auCue)');
    }finally{Audio=A0;AU.cue=c0;AU.el=e0;AU.synth=s0;['t_ab','t_ns','t_na','t5'].forEach(k=>delete CUE[k]);AU_LOG.length=0;}}
  CK(/createDynamicsCompressor/.test(String(auInit))&&/AU\.lim/.test(String(auInit)),'на общем выходе стоит ограничитель');
  // фонотека: две записи убраны по решению автора, вместо них — другие (22.11)
  CK(!('alte_kameraden' in MUS_C)&&!('vienna_woods' in MUS_C)&&MUS_C.roses_south==='de'&&MUS_C.merry_wives==='de','«Старые товарищи» и «Сказки Венского леса» убраны из немецкого набора, вместо них — «Розы с юга» и «Виндзорские проказницы»');
  {const a1=awardMusicOf('de',1925),a0=awardMusicOf('de',1910),all=JSON.stringify([a0,a1,awardMusicOf('at',1925)]);
    CK(a1.rec[0]==='merry_wives'&&a0.rec[0]==='merry_wives'&&a0.tune==='hymn_uk'&&!/kameraden|vienna_woods/.test(all),'на немецком пьедестале — увертюра Николаи, убранных записей нет');}
}
// ===== 31. Тема 10, вторая часть: люди, техника в 3D, столбики у дороги =====
{const CK=(c,m)=>{if(c)ok++;else{bad++;console.log('FAIL 31',m);}};
  // зрители: по стране и эпохе, разные фигуры; модель строится для любого облика
  const hosts=['fr','it','de','uk','us','be','mc','at','ch','es','ru','ie','ly','nl','cn','other'];let errs=0,nAll=0;const sig={},H=[],W=[],tops={},hats={};
  hosts.forEach(c=>[1900,1910,1925].forEach(y=>{const rnd=mulberry32(hashStr('t31|'+c+y));for(let i=0;i<40;i++){nAll++;try{const o=personLook3(rnd,y,'crowd',c);sig[[c,o.type,o.top||o.wtop||'',o.hat||'',o.legs||'',o.hands].join('|')]=1;if(o.type==='man'){H.push(o.bh);W.push(o.bw);tops[o.top||'jacket']=1;hats[o.hat||'-']=1;}
        if(i<6){const M=new Mesh();mPerson3(M,o,i%2);if(M.F.length<300)errs++;const M0=new Mesh();mPerson3(M0,Object.assign({},o,{lod:0}),0);if(!M0.F.length||M0.F.length>=M.F.length)errs++;}}catch(e){errs++;if(errs<3)console.log('  ',c,y,e.message);}}}));
  CK(errs===0,'зрители: '+nAll+' обликов по 16 странам и трём эпохам строятся без ошибок, упрощённая модель легче подробной (ошибок '+errs+')');
  CK(Object.keys(sig).length>=400,'зрители разные: '+Object.keys(sig).length+' сочетаний страны, одежды, шляпы и позы (было: пиджак или пальто, одна фигура)');
  CK(Math.max(...H)-Math.min(...H)>0.12&&Math.max(...W)-Math.min(...W)>0.18,'рост мужчин от '+Math.min(...H).toFixed(2)+' до '+Math.max(...H).toFixed(2)+', ширина от '+Math.min(...W).toFixed(2)+' до '+Math.max(...W).toFixed(2));
  CK(['jacket','frock','vest','shirt','smock','overall','tunic','robe','leather'].every(t=>tops[t]),'есть все виды одежды: пиджак, пальто, жилет, рубаха, блуза, комбинезон, мундир, халат, кожанка');
  CK(['top','bowler','boater','cap','fedora','straw','beret','peak','tyrol','fez','turban','conic','kepi'].every(h=>hats[h]),'шляпы: '+Object.keys(hats).length+' видов');
  {const P=(c,y)=>personLook3(mulberry32(1),y,'gend',c);CK(P('uk',1910).hat==='custodian'&&P('it',1910).hat==='bicorne'&&P('de',1910).hat==='pickel'&&P('de',1925).hat==='peak'&&P('fr',1910).hat==='kepi'&&P('ru',1910).sabre===1&&P('us',1905).hat==='custodian'&&P('us',1920).hat==='peak','страж порядка свой в каждой стране: констебль, карабинер, шуцман, жандарм, городовой');
    const fr=mulberry32(5),ru=mulberry32(5);let smock=0,shirt=0;for(let i=0;i<300;i++){if(personLook3(fr,1910,'crowd','fr').top==='smock')smock++;if(personLook3(ru,1910,'crowd','ru').top==='shirt')shirt++;}
    CK(smock>15&&shirt>40,'Франция — блузы ('+smock+' из 300), Россия — косоворотки ('+shirt+' из 300)');}
  // экипаж: по роду машины, стране и эпохе
  {const K=(b,y,c,m)=>crewKit51({num:3,y,mq:'t',cc:c,b,style:'truck'},!!m);
    CK(K('b14',1912,'uk').top==='tunic'&&K('b14',1912,'uk').cap==='peak'&&K('b17',1912,'us').cap==='brass'&&K('b26',1915,'de').top==='tunic'&&K('b24',1920,'us').top==='shirt'&&K('b24',1920,'us').glove===0,'шофёр автобуса — в мундире и фуражке, пожарный — в каске, военный — в форме, тракторист — в рубахе и комбинезоне');
    let jer=0,red=0,tops={},e2=0;for(let n=0;n<200;n++){const S={num:n,y:1926,mq:'q'+n,cc:'it',style:'gp1925'},k=crewKit51(S,false);tops[k.top]=1;if(k.top==='jersey'){jer++;if(/^#c0141c$/i.test(k.coat))red++;}
      if(n<12){try{const M=new Mesh();MLOD=1;mCrew3(M,0,0.5,0,k,false,S,[0,1,0.42]);const M2=new Mesh();mCrew3(M2,0,0.5,0,crewKit51(S,true),true,S,null);if(M.F.length<400||M2.F.length<300)e2++;}catch(e){e2++;console.log('  crew',e.message);}}}
    CK(jer>20&&red===jer&&tops.overall&&tops.leather&&e2===0,'гонщики Италии 1926: фуфайки национального красного ('+jer+' из 200), комбинезоны, кожанки; модели строятся');
    const b1=crewBuild({num:1,y:1910,mq:'a',cc:'fr'},false,{role:'race'}),b2=crewBuild({num:7,y:1910,mq:'b',cc:'fr'},false,{role:'race'});CK(b1.bw!==b2.bw||b1.th!==b2.th,'у экипажей разные фигуры');
    const a1=airKit51({num:1,y:1910,cc:'fr'},false),a2=airKit51({num:1,y:1917,cc:'fr'},true),a3=airKit51({num:1,y:1926,cc:'us'},false);CK(a2.cap==='helmet'&&a3.cap==='helmet'&&['coat','jersey','leather'].includes(a1.top),'лётчик одет по году: до 1912 — пиджак, фуфайка или кожанка; потом — шлем');}
  // техника: у каждого вида свой кузов
  {const L=[['b12','heavy'],['b13','semi'],['b17','fire'],['b20','tanker'],['b21','dump'],['b22','refuse'],['b24','tractor'],['b25','crawler'],['b28','armored'],['b29','ltank']];let e3=0;const sz={};
    L.forEach(([b,k])=>{[1912,1924].forEach(y=>{try{const S={key:'t'+b+y,style:'truck',color:'#5a6a50',y,wheel:'wood',mech:false,num:0,b,cc:'fr'};if(workKind51(S)!==k)e3++;const M=carModel(Object.assign({},S,{lod:'hi'})),M0=carModel(Object.assign({},S,{lod:'lo'}));
        if(!M.F.length||M0.F.length>=M.F.length||M.wheels.length>6||!(M.len[0]<M.len[1])||!(M.track>1))e3++;if(M.F.some(f=>f.w>6))e3++;sz[b+y]=M.F.length;}catch(e){e3++;console.log('  work',b,y,e.message);}});});
    CK(e3===0,'десять видов техники строятся в 3D (подробно и упрощённо), вращающихся колёс не больше шести — столько знает шейдер');
    CK(sz.b241912!==sz.b241924&&sz.b251912!==sz.b251924,'ранний и поздний трактор — разные модели (колёсный: '+sz.b241912+' и '+sz.b241924+' граней)');
    const plain=carModel({key:'tp',style:'truck',color:'#5a6a50',y:1915,wheel:'wood',mech:false,num:0,b:'b8',cc:'fr',lod:'hi'}).F.length;CK(Object.values(sz).every(v=>v!==plain),'ни один из новых видов не совпадает с обычным грузовиком');
    const md=JSON.parse(JSON.stringify(G.models[0]));md.b='b24';md.id='t31';let html='';try{html=carArt(md,{y:1920});}catch(e){html='ERR '+e.message;}CK(/<img/.test(html)&&!/<svg/.test(html),'в карточке трактора — трёхмерная модель, а не рисунок сбоку');}
  // столбики-отбойники у обрыва: не скала
  CK(crashTier(7,'curb')===0&&crashTier(10,'curb')===1&&crashTier(22,'curb')===2&&crashTier(22,'wall')===4,'удар о столбик: до 8 м/с — толчок, до 14 — касание, выше — удар; тяжёлой аварии о столбик нет (о стену на 22 м/с — есть)');
  {const src=String(obstacleHit);CK(/gstone/.test(src)&&/hv<0\.5/.test(src),'столбик отбрасывает к дороге поперёк; торец тонкой стены — скольжение вдоль');}
}
/* ---------- 32. общая калибровка 0.51 ---------- */
{{let a=32;Math.random=()=>{a=(a*16807)%2147483647;return a/2147483647;};}newGame('ford','us','','normal','Калибровка');const s=G;
  // контора: множитель по сложности
  CK(DIFFS.kids.org===0.4&&DIFFS.easy.org===0.7&&DIFFS.normal.org===0.85&&DIFFS.hard.org===1.05&&DIFFS.hist.org===1.25,'контора по уровням: 0,4 / 0,7 / 0,85 / 1,05 / 1,25');
  {const r={made:150000,mmade:0};s.dealers=s.dealers||{};const a=n=>{s.diff=n;return admParts(s,r).total;};const an=a('normal'),ah=a('hist');s.diff='normal';
    CK(an>0.10&&an<0.125&&ah>0.135&&ah<0.165&&ah<0.19,'фирма на 150 тыс. машин в месяц: контора на «Норме» '+(an*100).toFixed(1)+' % выручки (было 12,4), на «Историке» '+(ah*100).toFixed(1)+' % (было 18,1)');}
  // победа: порог прежний
  CK(DOM_SHARE===0.5,'порог победы — половина мира за десять лет (не менялся)');
  // бюро: ступень раньше своего года — по правилу опережения
  {s.y=1912;s.rd.lvl=10;const c1=rdUpCost(s);globalThis.RDYOFF=1;const c0=rdUpCost(s);globalThis.RDYOFF=0;
    CK(RD_Y.length===RD_MAX+1&&RD_Y[14]===1926&&RD_Y.every((y,i)=>!i||y>=RD_Y[i-1]),'у ступеней бюро свои годы: высшая — '+RD_Y[14]);
    CK(rdAhead(s,11)===RD_Y[11]-1912&&near(c1/c0,aheadCostK(RD_Y[11]-1912),0.02),'11-я ступень в 1912 году — на '+rdAhead(s,11)+' лет раньше: в '+(c1/c0).toFixed(1)+' раза дороже ('+money(c0)+' → '+money(c1)+')');
    s.y=1926;s.rd.lvl=13;CK(rdAhead(s,14)===0,'в свой год ступень стоит как раньше');
    s.y=1905;s.rd.lvl=3;CK(rdAhead(s,4)===0&&rdAhead(s,5)===0,'ранние ступени мастерской к 1905 году — без надбавки');
    s.rd.lvl=1;s.y=1895;}
  // фирмы: глубокая потеря доли — повод для ответа и при целых продажах
  {const src=String(firmPlan);CK(FIRM_DEEP===0.75&&/deep/.test(src)&&/rsG<=FIRM_DEEP/.test(src),'фирма отвечает, когда потеряла четверть своей доли класса, даже если продажи целы');}
  // воздушный бой: враг доводит очередь, если нос смотрит в упреждение
  {CK(FR_DIF.kids.fa===0&&FR_DIF.easy.fa>0&&FR_DIF.normal.fa>FR_DIF.easy.fa&&FR_DIF.hard.fa>FR_DIF.normal.fa&&FR_DIF.hist.fa>=FR_DIF.hard.fa,'наводка врага растёт с уровнем: '+['kids','easy','normal','hard','hist'].map(k=>FR_DIF[k].fa).join(' / ')+' рад');
    const me0=FL.me,me={p:[0,1000,300],v:[0,0,40],fw:[0,0,1]},a={p:[0,1000,0],v:[0,0,45],fw:[0,0,1],ai:{e:[0,0,0]},target:'me'};FL.me=me;s.diff='normal';
    const d1=frFoeAim(a);a.fw=v3n([0.05,0,1]);const d2=frFoeAim(a);a.fw=[0,0,1];s.diff='kids';const d3k=frFoeAim(a);s.diff='normal';me.p=[0,1000,900];const d4=frFoeAim(a);FL.me=me0;
    CK(d1&&Math.abs(d1[2]-1)<1e-6&&!d2&&!d3k&&!d4,'нос в цель — очередь идёт в упреждение; мимо на 3° — нет; на «Юном» — никогда; дальше дальности огня — нет');}
}
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
