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
console.log(bad?'FAILED '+bad:'ok '+ok);if(bad)process.exitCode=1;
`);
